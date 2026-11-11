const fs = require('fs');
const path = require('path');

// 1. Load Data
const suburbsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../suburbs-data.json'), 'utf8'));

// 2. Start building the Sitemap XML string with your core pages
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://senaconstructions.com.au/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://senaconstructions.com.au/about</loc><priority>0.8</priority></url>
  <url><loc>https://senaconstructions.com.au/process</loc><priority>0.8</priority></url>
  <url><loc>https://senaconstructions.com.au/contact</loc><priority>0.8</priority></url>
  <url><loc>https://senaconstructions.com.au/services</loc><priority>0.9</priority></url>
  <url><loc>https://senaconstructions.com.au/luxury-homes</loc><priority>0.8</priority></url>
  <url><loc>https://senaconstructions.com.au/granny-flats</loc><priority>0.8</priority></url>
  <url><loc>https://senaconstructions.com.au/duplexes</loc><priority>0.8</priority></url>
  <url><loc>https://senaconstructions.com.au/knockdown-rebuilds</loc><priority>0.8</priority></url>
  <url><loc>https://senaconstructions.com.au/renovations-extensions</loc><priority>0.8</priority></url>
  <url><loc>https://senaconstructions.com.au/building-maintenance</loc><priority>0.8</priority></url>
  <url><loc>https://senaconstructions.com.au/projects</loc><priority>0.8</priority></url>
  <url><loc>https://senaconstructions.com.au/blogs</loc><priority>0.8</priority></url>
  <url><loc>https://senaconstructions.com.au/calculators</loc><priority>0.8</priority></url>
  <url><loc>https://senaconstructions.com.au/duplex-cost-calculator</loc><priority>0.8</priority></url>
  <url><loc>https://senaconstructions.com.au/renovation-cost-calculator</loc><priority>0.8</priority></url>
  <url><loc>https://senaconstructions.com.au/custom-home-cost-calculator</loc><priority>0.8</priority></url>
`;

// Blog posts (add new posts here)
const blogPosts = [
    'top-5-benefits-custom-home-sydney',
    'Benefits-Of-Building-A-Duplex-In-Sydney',
    'Granny-Flats-In-Sydney-The-Perfect-Addition-To-Your-Property',
    'Maximizing-Your-Property-Value-With-Home-Renovations-In-Sydney',
    'The-Advantages-Of-Knockdown-And-Rebuilds-For-Your-Sydney-Home',
];

// Project gallery pages (made by scripts/build-projects.py; add new ones here)
const projectPages = [
    'projects-luxury-homes',
    'projects-duplexes',
    'projects-renovations',
    '57-hyssop-crescent-melonba',
    '59-hyssop-crescent-melonba',
    'horsley-road-panania',
    'malvern-street-panania',
    'ringrose-avenue-greystanes',
    'fowler-road-merrylands',
    'paton-street-merrylands',
    'mclachlan-avenue-darlinghurst',
];
projectPages.forEach(slug => {
    sitemapXml += `  <url><loc>https://senaconstructions.com.au/${slug}</loc><priority>0.7</priority></url>\n`;
});
blogPosts.forEach(slug => {
    sitemapXml += `  <url><loc>https://senaconstructions.com.au/${slug}</loc><priority>0.7</priority></url>\n`;
});

console.log('Generating sitemap exclusively...');

// 3. Loop through all 750 suburbs just to grab their slugs for the URLs
suburbsData.forEach(suburb => {
    sitemapXml += `  <url>\n    <loc>https://senaconstructions.com.au/${suburb.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
});

// 4. Close and save ONLY the sitemap file
sitemapXml += `</urlset>`;
fs.writeFileSync(path.join(__dirname, '../sitemap.xml'), sitemapXml);

console.log(`🎉 Success! Generated sitemap.xml with ${suburbsData.length + 17 + blogPosts.length + projectPages.length} URLs. No HTML pages were altered.`);