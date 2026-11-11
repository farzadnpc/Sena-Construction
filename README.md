# Sena Constructions - Official Website 🏗️

A high-conversion, luxury custom home builder website for the Greater Sydney market. It features step-by-step cost calculators, EmailJS lead capture, and a Node.js build system that generates 741 localised suburb pages.

## 🚀 Tech Stack
* **Frontend:** HTML5, Tailwind CSS (via CDN)
* **Interactivity:** Vanilla JavaScript (`scripts/scripts.js`, `scripts/calculator.js`)
* **Lead Capture:** [EmailJS](https://www.emailjs.com/) (with a hidden spam-trap field)
* **Build System:** Node.js scripts in `scripts/`
* **Hosting:** GitHub Pages with a custom domain and clean URLs (`/about`, not `/about.html`)

## 📁 Project Architecture
* `_templates/suburb-template.html` - Master layout for every suburb page. Folders starting with `_` are not published, so its `{{placeholders}}` never appear on the live site.
* `_templates/sitemap-template.html` - Layout for the Site Map & Service Areas page (`sitemap.html`).
* `suburbs-data.json` - SEO details, council and region for each of the 741 Sydney suburbs.
* `scripts/scripts.js` - Site-wide logic: mobile menu, accordions, FAQs, testimonials and the EmailJS quote form.
* `scripts/calculator.js` - The step-by-step calculator engine. Each calculator page sets its questions and prices in a `window.SENA_CALC` config block near the bottom of the page.
* `*-cost-calculator.html` + `calculators.html` - The duplex, renovation and custom home calculators, and the hub page that links them.
* `images/` - Image assets.

## 🧮 Changing calculator prices
Open the calculator page (for example `renovation-cost-calculator.html`) and edit the clearly marked **CALCULATOR CONFIG** block near the bottom. No build step is needed.

## 📸 Project galleries
Project pages (e.g. `/57-hyssop-crescent-melonba`) and category pages (e.g. `/projects-luxury-homes`) are generated from `projects-data.json`.

To add a project:
1. Put the original photos in a folder under `images/` (originals are never changed).
2. Add an entry to `projects-data.json` with its category, address, suburb, folder and cover photo.
3. Run `pip3 install pillow` (first time only), then `python3 scripts/build-projects.py`. This makes web-sized copies in `images/projects/` and builds the pages.
4. Add the new page address to the list in `scripts/build-sitemap.js` and run `node scripts/build-sitemap.js`.

## 🛠️ How to Build

Rebuild after you edit a template or `suburbs-data.json`. Don't edit the generated suburb pages or `sitemap.html` directly, because a rebuild will overwrite them.

1. **Install Node.js:** Make sure [Node.js](https://nodejs.org/) is installed.
2. **Make edits:** Edit the files in `_templates/` or `suburbs-data.json`.
3. **Run the build scripts** from the project root:
   ```bash
   node scripts/build-pages.js        # suburb pages
   node scripts/build-html-sitemap.js # sitemap.html (visitor Site Map page)
   node scripts/build-sitemap.js      # sitemap.xml (for Google)
   ```
4. **Adding a page or blog post?** Add its address to the list in `scripts/build-sitemap.js` so Google can find it.
