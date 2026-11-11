/* SBMS/HS Music — smoke / falcon / artwork. No external assets or libraries. */
(() => {
  'use strict';
  const root = document.documentElement;
  const layer = document.getElementById('cinematic-intro');
  const site = document.getElementById('site-shell');
  const skip = document.getElementById('skip-intro');
  const replay = document.getElementById('replay-intro');
  const bird = document.getElementById('falcon-flight');
  const left = document.getElementById('wing-left');
  const right = document.getElementById('wing-right');
  const bar = document.getElementById('intro-progress-bar');
  const caption = layer.querySelector('.intro-caption');
  const impact = document.getElementById('intro-impact');
  const canvas = document.getElementById('smoke-canvas');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'sbmshs-intro-v1';
  const duration = 5.65;
  const revealAt = 4.35;
  let frame = 0, failsafe = 0, playing = false, revealing = false;
  let lastRender = 0, startTime = 0, renderer = null, playedByButton = false;
  let previousFocus = null;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = v => { v = clamp(v); return v * v * (3 - 2 * v); };
  const lerp = (a, b, f) => a + (b - a) * f;

  // Generate small cloud textures once, then composite them at 30 fps.
  // This works without WebGL, avoids video downloads, and stops after the reveal.
  function createSmoke() {
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return null;
    let seed = 28137;
    function random() { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; }
    const grid = new Float32Array(4096);
    for (let i = 0; i < grid.length; i++) grid[i] = random();
    function noise(x, y) {
      const ix = Math.floor(x), iy = Math.floor(y);
      let fx = x - ix, fy = y - iy;
      fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
      const at = (a,b) => grid[(a & 63) + ((b & 63) << 6)];
      return lerp(lerp(at(ix,iy),at(ix+1,iy),fx),lerp(at(ix,iy+1),at(ix+1,iy+1),fx),fy);
    }
    function fbm(x,y) { return noise(x,y)*.55 + noise(x*2.03+7,y*2.03+5)*.27 + noise(x*4.1+3,y*4.1+9)*.13 + noise(x*8.2,y*8.2)*.05; }
    function texture(shift, dark) {
      const s = 192, tile = document.createElement('canvas'); tile.width = tile.height = s;
      const c = tile.getContext('2d');
      const pixels = c.createImageData(s,s);
      for (let y=0;y<s;y++) for(let x=0;x<s;x++) {
        const px=(x-s/2)/(s/2), py=(y-s/2)/(s/2);
        const n=fbm(px*3.8+shift,py*3.8+shift+12);
        const warp=fbm(px*2.1+shift+25,py*2.1+shift+40);
        const detail=fbm(px*5.1+warp*3+shift,py*5.1+n*3+18);
        const edge=clamp(1-Math.sqrt(px*px+py*py)+(n-.5)*.24);
        const density=Math.pow(edge,.65)*Math.pow(clamp((detail-.19)*1.9),1.6);
        const i=(y*s+x)*4;
        const l=dark ? 18+detail*25 : 145+detail*75;
        pixels.data[i]=l; pixels.data[i+1]=l+(dark?8:9); pixels.data[i+2]=l+(dark?20:22);
        pixels.data[i+3]=Math.round(density*(dark?120:185));
      }
      c.putImageData(pixels,0,0); return tile;
    }
    const tiles=[texture(2,false),texture(21,false),texture(43,true)];
    const clouds=Array.from({length:44},(_,i)=>({
      x:random(),y:random(),size:.55+random()*.65,
      rotation:random()*Math.PI*2,spin:(random()-.5)*.20,
      dx:(random()-.5)*.06,dy:-.025-random()*.04,
      alpha:.45+random()*.5,tile:i%8===0?2:i%2
    }));
    let w=1,h=1;
    function resize() {
      const factor=Math.min(1,1100/innerWidth,Math.sqrt(750000/(innerWidth*innerHeight)));
      w=canvas.width=Math.max(1,Math.round(innerWidth*factor));
      h=canvas.height=Math.max(1,Math.round(innerHeight*factor));
    }
    resize();
    return {
      resize,
      draw(t) {
        ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
        ctx.clearRect(0,0,w,h);ctx.fillStyle='#03060e';ctx.fillRect(0,0,w,h);
        const fill=smooth(t/2.1), base=Math.max(w,h);
        for(const p of clouds){
          const spread=1.8-.8*fill;
          const x=(.5+(p.x-.5)*spread+p.dx*t)*w;
          const y=(.5+(p.y-.5)*spread+p.dy*t)*h;
          const size=base*p.size*(.65+.35*fill);
          ctx.save();ctx.translate(x,y);ctx.rotate(p.rotation+p.spin*t);
          ctx.globalAlpha=p.alpha*(.18+.82*fill);
          ctx.drawImage(tiles[p.tile],-size/2,-size/2,size,size);ctx.restore();
        }
        ctx.globalAlpha=1;
        // Clear the fog outward from the falcon's flight path at impact.
        if(t>=revealAt){
          const u=smooth((t-revealAt)/.90),max=Math.hypot(w,h)*.7;
          const radius=Math.max(1,u*max),feather=Math.max(25,base*.12);
          const hole=ctx.createRadialGradient(w*.5,h*.48,Math.max(0,radius-feather),w*.5,h*.48,radius+feather);
          hole.addColorStop(0,'rgba(0,0,0,1)');hole.addColorStop(1,'rgba(0,0,0,0)');
          ctx.globalCompositeOperation='destination-out';ctx.fillStyle=hole;ctx.fillRect(0,0,w,h);
          ctx.globalCompositeOperation='source-over';
        }
      },
      destroy(){ctx.clearRect(0,0,w,h);tiles.forEach(tile=>{tile.width=tile.height=1;});}
    };
  }

  const flight = [
    // seconds, scale, x (viewport fraction), y, bank angle, opacity
    [1.65,.11,-.09,.00,-9,0], [2.15,.24,-.08,.015,-6,.95],
    [2.85,.50,-.04,.02,3,1], [3.35,.78,0,.01,-2,1],
    [3.85,1.15,.02,-.005,2,1], [4.22,2.7,.03,-.11,-7,1],
    [4.45,7,.06,-.90,-8,1], [4.80,12,.10,-2,-10,0]
  ];
  function drawBird(t) {
    if (t < flight[0][0] || t > flight[flight.length - 1][0]) { bird.style.opacity = '0'; return; }
    let i = 1;
    while (i < flight.length - 1 && t > flight[i][0]) i++;
    const a = flight[i - 1], b = flight[i];
    const u = (t - a[0]) / (b[0] - a[0]);
    const s = lerp(a[1], b[1], u);
    const x = lerp(a[2], b[2], u) * innerWidth;
    const y = lerp(a[3], b[3], u) * innerHeight;
    const bank = lerp(a[4], b[4], smooth(u));
    bird.style.transform = `translate(-50%,-50%) translate3d(${x}px,${y}px,0) scale(${s}) rotate(${bank}deg)`;
    bird.style.opacity = String(lerp(a[5], b[5], u));
    const strength = 1 - smooth((t - 3.4) / .7);
    const beat = Math.sin((t - 1.65) * 8.4);
    const angle = (beat * 15 - 5) * strength;
    const stretch = 1 - (.5 + beat * .5) * .36 * strength;
    left.setAttribute('transform', `rotate(${angle} -28 18) scale(1 ${stretch})`);
    right.setAttribute('transform', `rotate(${-angle} 28 18) scale(1 ${stretch})`);
  }

  function finish(manual = false) {
    const wasPlaying = playing;
    const focusInside = layer.contains(document.activeElement);
    playing = false; revealing = false;
    cancelAnimationFrame(frame); clearTimeout(failsafe); clearTimeout(window.sbmshsIntroWatchdog);
    root.classList.remove('intro-pending', 'intro-playing', 'intro-revealing');
    layer.hidden = true; layer.classList.add('intro-finished');
    site.inert = false; site.removeAttribute('aria-hidden');
    bird.style.opacity = '0'; impact.style.opacity = '0';
    if (renderer) { renderer.destroy(); renderer = null; }
    try { if (wasPlaying) sessionStorage.setItem(storageKey, 'seen'); } catch (_) {}
    if (wasPlaying && (manual || focusInside || playedByButton)) {
      const target = playedByButton && previousFocus && previousFocus.isConnected ? previousFocus : document.getElementById('main');
      target.focus({ preventScroll: true });
    }
    replay.hidden = motion.matches;
  }

  function tick(now) {
    if (!playing) return;
    try {
      const t = (now - startTime) / 1000;
      if (t >= duration) { finish(); return; }
      if (t >= revealAt && !revealing) {
        revealing = true;
        root.classList.add('intro-revealing');
        site.inert = false; site.removeAttribute('aria-hidden');
      }
      if (now - lastRender >= 1000 / 30) {
        if (renderer) renderer.draw(t);
        drawBird(t);
        bar.style.transform = `scaleX(${clamp(t / duration)})`;
        caption.style.opacity = String(smooth(t / .75) * (1 - smooth((t - 2.4) / .6)));
        if (t >= revealAt) {
          const u = clamp((t - revealAt) / .85);
          impact.style.opacity = String(Math.sin(u * Math.PI) * .36);
          impact.style.transform = `translate(-50%,-50%) scale(${.2 + u * 13})`;
        }
        lastRender = now;
      }
      frame = requestAnimationFrame(tick);
    } catch (_) { finish(); }
  }

  function start(manual = false) {
    if (playing || motion.matches || document.hidden) { if (!playing) finish(); return; }
    clearTimeout(window.sbmshsIntroWatchdog);
    playedByButton = manual; previousFocus = document.activeElement;
    playing = true; revealing = false; lastRender = 0;
    root.classList.remove('intro-revealing');
    root.classList.add('intro-pending', 'intro-playing');
    layer.classList.remove('intro-finished'); layer.hidden = false;
    site.inert = true; site.setAttribute('aria-hidden', 'true');
    bird.style.opacity = '0'; bar.style.transform = 'scaleX(0)';
    failsafe = setTimeout(() => finish(), 7200);
    try { renderer = createSmoke(); } catch (_) { renderer = null; }
    layer.classList.toggle('intro-basic-fog', !renderer);
    skip.focus({ preventScroll: true });
    startTime = performance.now();
    // A hard stop is armed before renderer initialization.
    frame = requestAnimationFrame(tick);
  }

  skip.addEventListener('click', () => finish(true));
  replay.addEventListener('click', () => start(true));
  layer.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); finish(true); }
    // The only interactive intro element is Skip; keep focus out of the backdrop.
    if (e.key === 'Tab' && playing) { e.preventDefault(); skip.focus(); }
  });
  motion.addEventListener('change', () => { if (motion.matches) finish(); replay.hidden = motion.matches; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) finish(); });
  window.addEventListener('pagehide', () => { if (playing) finish(); });
  window.addEventListener('resize', () => { if (renderer && playing) renderer.resize(); }, { passive: true });
  // Image fetch begins in the document head while the smoke runs. No artificial
  // loader, no autoplay audio, and no network call is needed for the animation.
  replay.hidden = motion.matches;
  if (root.classList.contains('intro-pending')) start();
  else finish();
})();
