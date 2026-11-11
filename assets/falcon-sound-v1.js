/* Optional, gesture-enabled audio for the existing smoke/falcon introduction.
 * Recording: Sonothèque ADVL, XC705937, CC0. See audio-credits.txt.
 * No autoplay, third-party browser requests, background loop, or visual changes.
 */
(() => {
  'use strict';
  const root = document.documentElement;
  const layer = document.getElementById('cinematic-intro');
  const skip = document.getElementById('skip-intro');
  const replay = document.getElementById('replay-intro');
  const progress = document.getElementById('intro-progress-bar');
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!layer || !skip || !replay || !progress || !Context) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const audioURL = new URL('falcon-call-v1.mp3', document.currentScript.src).href;
  const duration = 5.65, cueAt = 2.0, cueEnd = 4.5;
  let context = null, buffer = null, loadPromise = null, source = null, gain = null;
  let enabled = false, active = false, fired = false, frame = 0, intent = 0;

  const style = document.createElement('style');
  style.textContent = `
    .intro-sound{position:absolute;z-index:11;top:max(80px,calc(env(safe-area-inset-top) + 55px));right:clamp(20px,4vw,64px);display:flex;align-items:center;gap:8px;min-height:44px;padding:10px 14px;border:1px solid #efc05d66;border-radius:999px;background:#060c18e8;color:#efc05d;font:12px/1.5 system-ui,sans-serif;cursor:pointer}
    .intro-sound:hover{border-color:#efc05d;background:#111b2d}
    .intro-sound:focus-visible{outline:3px solid #efc05d;outline-offset:5px}
    .intro-sound svg{width:17px;height:17px;flex:none}
    .intro-sound[aria-pressed="true"] .sound-slash{display:none}
    .replay-sound{min-height:44px}
    @media(max-width:600px){.intro-sound{top:76px;font-size:11px;padding:9px 12px}}
    @media print{.intro-sound,.replay-sound{display:none!important}}
  `;
  document.head.appendChild(style);
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.id = 'intro-sound'; toggle.className = 'intro-sound';
  toggle.setAttribute('aria-pressed', 'false');
  toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/><path class="sound-slash" d="m3 3 18 18"/></svg><span>Enable sound</span>';
  skip.insertAdjacentElement('afterend', toggle);
  const label = toggle.querySelector('span');
  const replaySound = document.createElement('button');
  replaySound.type = 'button'; replaySound.id = 'replay-with-sound';
  replaySound.className = 'replay-intro replay-sound';
  replaySound.textContent = 'Replay with sound';
  replay.insertAdjacentElement('afterend', replaySound);
  const status = document.createElement('span');
  status.className = 'sr-only'; status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  toggle.insertAdjacentElement('afterend', status);

  function paint(text) {
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? 'Mute falcon sound' : 'Enable falcon sound');
    label.textContent = text || (enabled ? 'Mute sound' : 'Enable sound');
    layer.dataset.soundEnabled = String(enabled);
    replaySound.hidden = reduced.matches;
  }
  function silence() {
    if (gain && context) {
      try { gain.gain.cancelScheduledValues(context.currentTime); gain.gain.setValueAtTime(0, context.currentTime); } catch (_) {}
    }
    if (source) { try { source.stop(); } catch (_) {} try { source.disconnect(); } catch (_) {} }
    if (gain) { try { gain.disconnect(); } catch (_) {} }
    source = null; gain = null;
    layer.dataset.soundPlaying = 'false';
  }
  function load() {
    if (buffer) return Promise.resolve(buffer);
    if (loadPromise) return loadPromise;
    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), 8000);
    loadPromise = fetch(audioURL, { signal: controller.signal, credentials: 'same-origin' })
      .then(response => { if (!response.ok) throw new Error('Audio unavailable'); return response.arrayBuffer(); })
      .then(bytes => context.decodeAudioData(bytes))
      .then(decoded => {
        if (decoded.duration < 0.5 || decoded.duration > 3) throw new Error('Unexpected audio duration');
        buffer = decoded; layer.dataset.soundReady = 'true'; return decoded;
      })
      .catch(error => { loadPromise = null; throw error; })
      .finally(() => clearTimeout(deadline));
    return loadPromise;
  }
  function enable() {
    // Called directly from a click: never attempt to bypass autoplay restrictions.
    const mine = ++intent;
    enabled = true; paint('Loading sound');
    try {
      if (!context || context.state === 'closed') context = new Context();
      const resumed = context.resume();
      Promise.all([resumed, load()]).then(() => {
        if (mine !== intent || !enabled) return;
        if (context.state !== 'running') throw new Error('Audio permission required');
        paint(); status.textContent = 'Falcon sound enabled. Use Replay with sound to hear the full introduction.';
      }).catch(() => {
        if (mine !== intent) return;
        enabled = false; silence(); paint('Try sound again');
        status.textContent = 'Sound could not start. The introduction still works; tap to try sound again.';
      });
    } catch (_) { enabled = false; silence(); paint('Try sound again'); }
  }
  function playCue(t) {
    if (!enabled || !buffer || !context || context.state !== 'running' || fired || document.hidden) return;
    if (t < cueAt) return;
    const offset = Math.max(0, t - cueAt);
    const length = Math.min(buffer.duration - offset, cueEnd - t);
    if (length < 0.12) { fired = true; return; }
    fired = true;
    try {
      const node = context.createBufferSource();
      const volume = context.createGain();
      node.buffer = buffer; node.loop = false;
      node.connect(volume); volume.connect(context.destination);
      const now = context.currentTime;
      volume.gain.setValueAtTime(0, now);
      volume.gain.linearRampToValueAtTime(0.85, now + Math.min(.03, length / 4));
      volume.gain.setValueAtTime(0.85, now + Math.max(.03, length - .12));
      volume.gain.linearRampToValueAtTime(0, now + length);
      source = node; gain = volume;
      layer.dataset.soundPlaying = 'true';
      node.onended = () => {
        try { node.disconnect(); volume.disconnect(); } catch (_) {}
        if (source === node) { source = null; gain = null; layer.dataset.soundPlaying = 'false'; }
      };
      node.start(now, offset, length);
    } catch (_) { silence(); }
  }
  function tick() {
    if (!active || layer.hidden || document.hidden) { silence(); return; }
    // Follow the existing visual clock, rather than maintaining a drifting timer.
    const match = /scaleX\(([^)]+)\)/.exec(progress.style.transform);
    const t = match ? Number(match[1]) * duration : 0;
    if (t >= cueEnd) silence(); else playCue(t);
    frame = requestAnimationFrame(tick);
  }
  function syncIntro() {
    const next = root.classList.contains('intro-playing') && !layer.hidden && !reduced.matches && !document.hidden;
    if (next === active) return;
    active = next; cancelAnimationFrame(frame); silence();
    if (active) { fired = false; frame = requestAnimationFrame(tick); }
  }
  toggle.addEventListener('click', () => {
    if (enabled) { ++intent; enabled = false; silence(); paint(); status.textContent = 'Falcon sound muted.'; }
    else enable();
  });
  replaySound.addEventListener('click', () => {
    if (reduced.matches) return;
    enable();
    replay.click();
  });
  // The original dialog had only Skip. Include the new sound button in its trap.
  layer.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || !active) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const controls = [skip, toggle];
    const at = controls.indexOf(document.activeElement);
    controls[(at + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
  }, true);
  skip.addEventListener('click', silence, true);
  new MutationObserver(syncIntro).observe(root, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(syncIntro).observe(layer, { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('visibilitychange', () => { if (document.hidden) silence(); syncIntro(); });
  window.addEventListener('pagehide', silence);
  reduced.addEventListener('change', () => { silence(); syncIntro(); paint(); });
  paint(); syncIntro();
})();
