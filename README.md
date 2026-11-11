# Saddle Brook MS/HS Music Program — Coming Soon

This standalone temporary holding page is stored on the `sbhs-coming-soon` branch. The fundraiser on `main` is unchanged. Do not merge this branch into `main`: its root intentionally contains only the coming-soon website.

## Publish on GitHub Pages

The approved artwork is already stored in `assets/coming-soon.png`; no download/import step is needed.

1. Open repository Settings → Pages.
2. Under Build and deployment, choose **Deploy from a branch**.
3. Select branch **sbhs-coming-soon** and folder **/(root)**, then Save.
4. Open the published address shown by GitHub and confirm that it serves the coming-soon artwork before redirecting the primary website.

Expected default address after publication, unless a custom domain is configured: https://aamorell49-ui.github.io/pie-orders/

Selecting this branch for Pages does not modify fundraiser source on `main`. No DNS, domain redirect, CNAME, Netlify settings, or main-site configuration has been changed. If GitHub Pages already serves another active site from this repository, do not replace that publishing source without checking it first.

## Contents

- `index.html`: responsive static page with readable mobile text, screen-reader announcement, and a subtle moving haze overlay. A pause control and reduced-motion support are included.
- `assets/coming-soon.png`: exact approved royal-blue-and-gold artwork with black marching plumes; not cropped or regenerated.
- `.nojekyll`: serves the files without requiring a Jekyll build.

The image is stored in this repository; the website does not depend on an expiring Adobe URL. The completed one-time import workflow has been removed.

## Checks

The page was checked in Chromium at 1440×900, 390×844, 320×568, 844×390, and 768×1024. The checks covered image loading, horizontal overflow, JavaScript errors, pause/resume, and reduced-motion behavior. Desktop and mobile layouts were visually inspected. These were local rendering checks, not proof of a live Pages deployment.

Artwork SHA-256: `2dd5eaa4dc5ad63dc5688f8f3fa3ccc47fcab3b1b0efad36d658ebf6ee845958`.

No build command, backend, login, tracking, external font service, signup form, countdown, or launch date is required. If these files move to another host, update the `og:image` address in index.html to the new public image URL.
