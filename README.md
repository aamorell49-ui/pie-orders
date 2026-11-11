# Saddle Brook MS/HS Music Program — Coming Soon

The fundraiser has ended. At the owner's request, `main` now contains the music-program coming-soon website instead of the pie-ordering application.

## Fundraiser backup

The previous fundraiser is preserved on `archive/fundraiser-before-coming-soon` at commit `b6b572edee17d19bfcb6dc75e7bb9172a965d35f`. No Git history was erased. Its source is not included in the current website or build output.

The `sbhs-coming-soon` branch is retained as the original coming-soon source. The approved page and artwork are identical on both branches at the time of this replacement.

## Publish

GitHub Pages is enabled for this repository. The default public address is:

https://aamorell49-ui.github.io/pie-orders/

The site can be served from the root of either `main` or the existing `sbhs-coming-soon` branch. For future updates, use whichever branch is selected in Settings → Pages; selecting `main` keeps publishing aligned with the repository's default branch. These files do not change the Pages publishing settings, custom domain, or external main-site redirect.

## Vercel or other build-based hosting

Run `npm run build` and publish `dist/`. The build uses Node.js built-in modules only, with no third-party dependencies. `vercel.json` explicitly selects a static site, skips package installation, and overrides the old Vite build settings. A new commit may trigger an existing connected host, but deployment must be verified separately; configuration alone is not proof of publication.

## Website

- `index.html`: responsive holding page, mobile-readable announcement, screen-reader text, subtle animated haze, pause control, and reduced-motion support.
- `assets/coming-soon.png`: exact approved artwork, including royal-blue-and-gold uniforms and black plumes. It is not cropped or regenerated.
- `.nojekyll`: allows direct static-file publication on GitHub Pages.

Artwork SHA-256: `2dd5eaa4dc5ad63dc5688f8f3fa3ccc47fcab3b1b0efad36d658ebf6ee845958`.

No ordering forms, payment collection, login, analytics, database, external font service, signup form, countdown, or invented launch date are included. The artwork is stored locally in the repository; no expiring image URL is used.

The repository retains its existing `pie-orders` name to preserve its current addresses. Renaming the repository is a separate change.
