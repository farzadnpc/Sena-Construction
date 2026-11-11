const fs = require('fs');
const path = require('path');

// Generates one page per suburb from _templates/suburb-template.html + suburbs-data.json.
// Run from anywhere:  node scripts/build-pages.js
// (Folders starting with "_" are not published by GitHub Pages, so the template
//  with its {{placeholders}} is never visible on the live site.)

console.log('Starting the page generator...');

const mainFolder = path.join(__dirname, '../');

// 1. Read the JSON data
const suburbs = JSON.parse(fs.readFileSync(path.join(mainFolder, 'suburbs-data.json'), 'utf8'));

// 2. Read the master suburb template
const templateHtml = fs.readFileSync(path.join(mainFolder, '_templates', 'suburb-template.html'), 'utf8');

// 3. Generate a page for every suburb, straight into the main folder
const FIELDS = ['slug', 'suburb_name', 'council', 'region', 'headline', 'unique_intro', 'local_building_tip', 'postcode'];
let count = 0;

suburbs.forEach((suburb) => {
    let pageHtml = templateHtml;
    FIELDS.forEach((field) => {
        pageHtml = pageHtml.replaceAll(`{{${field}}}`, suburb[field] ?? '');
    });

    // Stop instead of publishing a page with an unfilled {{placeholder}}
    const leftover = pageHtml.match(/\{\{[a-z_]+\}\}/i);
    if (leftover) {
        throw new Error(`Unfilled placeholder ${leftover[0]} on the ${suburb.slug} page. Add it to FIELDS or fix the template.`);
    }

    fs.writeFileSync(path.join(mainFolder, `${suburb.slug}.html`), pageHtml);
    count++;
});

console.log(`🎉 Success! Generated ${count} suburb pages.`);
console.log('Next: run "node scripts/build-sitemap.js" if you added or removed suburbs.');
