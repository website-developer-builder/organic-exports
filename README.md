# Organic Exports — Static Website

Premium B2B vegetable supply website for Organic Exports, Coimbatore.

## Host on GitHub Pages
1. Create a new GitHub repository and upload **all files in this folder** (keep the `assets/` folder and `.nojekyll`).
2. Repository → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / root → Save.
3. Your site will be live at `https://<username>.github.io/<repo>/` within a minute or two.

## Structure
- `index.html` / `Home.dc.html` — home page
- `Vegetables.dc.html` — pillar page; individual vegetable pages (`Tomato.dc.html`, `SmallOnion.dc.html`, …)
- `About`, `Quality`, `Logistics`, `Contact` pages
- `SiteHeader`, `SiteFooter`, `PageHero`, `VegCard`, `VegetableDetail` — shared components loaded by the pages
- `support.js` — page runtime (loads React from unpkg CDN); `motion.js` — animations & page transitions
- `assets/` — vegetable photography

## Notes
- Pages must be served over http(s) (GitHub Pages, Netlify, etc.). Opening files directly from disk may block the shared components.
- Replace placeholder phone, email, address, FSSAI and GST numbers before going live (search for `98000 00000`, `trade@organicexports.in`, `0000000000000`).
- The quote form opens the visitor's email app; connect a form service (e.g. Formspree) for direct submissions.
