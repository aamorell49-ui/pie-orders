# Saddle Brook MS/HS Music Program — Coming Soon

This is a standalone temporary holding page on the `sbhs-coming-soon` branch. The fundraiser on `main` is unchanged. Do not merge this branch into `main`: its root intentionally contains only the coming-soon website.

## Publish

After `assets/coming-soon.png` has been imported, open repository Settings → Pages. Select **Deploy from a branch**, branch **sbhs-coming-soon**, folder **/(root)**, and Save. This selects only this branch for GitHub Pages; it does not change the fundraiser source on main or a Netlify deployment tracking main.

Default GitHub Pages address after successful publication (unless a custom domain is already configured): https://aamorell49-ui.github.io/pie-orders/

Do not redirect the primary website until that address visibly serves the correct page. No DNS, domain redirect, CNAME, or main-site settings are changed by these files.

## Contents

- `index.html`: responsive static page, native mobile announcement, screen-reader text, and a subtle CSS haze overlay with a pause control and reduced-motion support.
- `assets/coming-soon.png`: exact approved royal-blue-and-gold artwork with black marching plumes. The original poster is not cropped or regenerated.
- `.nojekyll`: serve static files without a Jekyll build.

The one-time import workflow copies the approved artwork into this branch and verifies its SHA-256 before storing it. The website itself uses a local asset, not an expiring Adobe link. Once imported, the workflow can be removed.

No build command, backend, account creation, analytics, external font service, signup form, countdown, or fabricated launch date is needed. If the files move to another host, update `og:image` in index.html to the new public image URL.
