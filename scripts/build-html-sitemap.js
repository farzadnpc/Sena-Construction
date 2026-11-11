const fs = require('fs');
const path = require('path');

// Rebuilds sitemap.html (the visitor-facing Site Map & Service Areas page)
// from _templates/sitemap-template.html + suburbs-data.json.
// Run:  node scripts/build-html-sitemap.js
// To change the page layout, edit the template, not sitemap.html.

const mainFolder = path.join(__dirname, '../');

// 1. Load data and template
const suburbsData = JSON.parse(fs.readFileSync(path.join(mainFolder, 'suburbs-data.json'), 'utf8'));
const template = fs.readFileSync(path.join(mainFolder, '_templates', 'sitemap-template.html'), 'utf8');

console.log('Grouping suburbs by council and generating HTML Sitemap...');

// 2. Group suburbs by council (falls back to LGA, region, then "Greater Sydney")
const councilGroups = {};
suburbsData.forEach((suburb) => {
    const councilName = suburb.council || suburb.lga || suburb.region || 'Greater Sydney';
    (councilGroups[councilName] = councilGroups[councilName] || []).push(suburb);
});
const sortedCouncils = Object.keys(councilGroups).sort();

// 3. Build the council groups. The classes "council-block" and "suburb-link"
//    are used by the search box script on the page.
let councilsHtml = '';
sortedCouncils.forEach((council) => {
    const suburbsInCouncil = councilGroups[council].sort((a, b) => a.suburb_name.localeCompare(b.suburb_name));

    let linksHtml = '';
    suburbsInCouncil.forEach((suburb) => {
        const postcodeStr = suburb.postcode ? ` <span class="text-xs text-gray-400">(${suburb.postcode})</span>` : '';
        linksHtml += `
            <a href="/${suburb.slug}" class="suburb-link text-gray-600 hover:text-sena-red transition-colors text-sm py-1 border-b border-gray-100 flex items-center justify-between group">
                <span><i class="fa-solid fa-angle-right text-sena-red text-[10px] mr-1 group-hover:translate-x-1 transition-transform inline-block"></i> ${suburb.suburb_name}</span>
                ${postcodeStr}
            </a>`;
    });

    councilsHtml += `
        <div class="council-block bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex justify-between items-center mb-6 pb-3 border-b-2 border-sena-red/20">
                <h3 class="text-xl font-serif font-bold text-sena-dark">${council}</h3>
                <span class="bg-red-50 text-sena-red text-xs font-bold px-3 py-1 rounded-full">${suburbsInCouncil.length} Suburbs</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                ${linksHtml}
            </div>
        </div>`;
});

// 4. Insert into the template and save
const html = template.replace('{{COUNCIL_GROUPS}}', '                        ' + councilsHtml);
fs.writeFileSync(path.join(mainFolder, 'sitemap.html'), html);

console.log(`🎉 Success! sitemap.html rebuilt with ${suburbsData.length} suburbs in ${sortedCouncils.length} councils.`);
