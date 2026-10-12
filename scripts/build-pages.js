const fs = require('fs');
const path = require('path');

console.log("Starting the page generator...");

// This tells the script to look one level up in the main folder
const mainFolder = path.join(__dirname, '../');

// 1. Read the JSON data
const rawData = fs.readFileSync(path.join(mainFolder, 'suburbs-data.json'), 'utf8');
const suburbs = JSON.parse(rawData);

// 2. Read the Master HTML Template
const templateHtml = fs.readFileSync(path.join(mainFolder, 'template.html'), 'utf8');

// 3. Set the output directory to the main folder instead of a 'suburbs' folder
const outputDir = mainFolder;

// 4. Loop through every suburb to generate individual pages
let count = 0;
suburbs.forEach(suburb => {
    let pageHtml = templateHtml
        .replaceAll('{{slug}}', suburb.slug)
        .replaceAll('{{suburb_name}}', suburb.suburb_name)
        .replaceAll('{{council}}', suburb.council)
        .replaceAll('{{region}}', suburb.region)
        .replaceAll('{{headline}}', suburb.headline)
        .replaceAll('{{unique_intro}}', suburb.unique_intro)
        .replaceAll('{{local_building_tip}}', suburb.local_building_tip)
        .replaceAll('{{postcode}}', suburb.postcode);

    // Save directly into the main folder
    const filePath = path.join(outputDir, `${suburb.slug}.html`);
    fs.writeFileSync(filePath, pageHtml);
    count++;
});
console.log(`Generated ${count} individual suburb pages in the root folder.`);

// ---------------------------------------------------------
// 5. GENERATE THE DIRECTORY PAGE (service-areas.html)
// ---------------------------------------------------------
console.log("Generating the Categorized Service Areas Directory...");

const directoryTemplate = fs.readFileSync(path.join(mainFolder, 'service-areas-template.html'), 'utf8');

const regions = {};
suburbs.forEach(suburb => {
    if (!regions[suburb.region]) {
        regions[suburb.region] = [];
    }
    regions[suburb.region].push(suburb);
});

let directoryHtml = '';
const sortedRegions = Object.keys(regions).sort(); 

sortedRegions.forEach(region => {
    directoryHtml += `\n<div class="mb-14 bg-white p-8 rounded-sm shadow-md border-t-4 border-sena-red">`;
    directoryHtml += `\n  <h3 class="text-2xl md:text-3xl font-bold text-sena-dark mb-6 border-b border-gray-200 pb-4">${region}</h3>`;
    directoryHtml += `\n  <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">`;
    
    const sortedSuburbs = regions[region].sort((a, b) => a.suburb_name.localeCompare(b.suburb_name));
    
    sortedSuburbs.forEach(suburb => {
        // The link now points directly to the file in the root folder
        directoryHtml += `\n    <li><a href="${suburb.slug}" class="text-gray-600 hover:text-sena-red hover:pl-2 transition-all duration-300 flex items-center gap-2"><i class="fa-solid fa-map-pin text-sena-red text-sm"></i> ${suburb.suburb_name}</a></li>`;
    });
    
    directoryHtml += `\n  </ul>\n</div>`;
});

const finalDirectoryPage = directoryTemplate.replace('{{DIRECTORY_CONTENT}}', directoryHtml);
fs.writeFileSync(path.join(mainFolder, 'service-areas.html'), finalDirectoryPage);

console.log(`🎉 Success! Built ${count} suburb pages AND the service-areas.html directory.`);