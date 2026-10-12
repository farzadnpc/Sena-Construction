# Sena Constructions - Official Website 🏗️

A high-conversion, luxury custom home builder website tailored for the Greater Sydney market. The site features a sophisticated UI, a custom project estimation calculator, EmailJS lead capture, and a Node.js build system that generates 175 localized SEO suburb pages.

## 🚀 Tech Stack
* **Frontend:** HTML5, Tailwind CSS (via CDN)
* **Interactivity:** Vanilla JavaScript (`scripts/scripts.js`)
* **Lead Capture:** [EmailJS](https://www.emailjs.com/)
* **Build System:** Node.js (`scripts/build-pages.js`)
* **Hosting:** GitHub Pages (Configured with Custom Domain for Clean URLs)

## 📁 Project Architecture
* `template.html` - The master layout for all localized SEO pages.
* `service-areas-template.html` - The master layout for the Service Directory.
* `suburbs-data.json` - The database containing SEO metadata, regions, and council info for 175 Sydney suburbs.
* `scripts/scripts.js` - Handles all frontend logic: mobile menus, FAQ accordions, the estimator calculator, and the EmailJS form submission.
* `scripts/build-pages.js` - The Node.js script that injects the JSON data into the HTML templates to dynamically generate the site.
* `images/` - Local storage for optimized `.webp` and `.png` image assets.

## 🛠️ How to Build & Run Locally

Whenever a structural change is made to `template.html`, or a new suburb is added to the `suburbs-data.json` database, the site must be rebuilt.

1. **Install Node.js:** Ensure [Node.js](https://nodejs.org/) is installed on your machine.
2. **Make Edits:** Edit `template.html` or `suburbs-data.json`.
3. **Run the Build Script:** Open your terminal, navigate to the project root, and run:
   ```bash
   node scripts/build-pages.js
