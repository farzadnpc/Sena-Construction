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

// 3. Create an output folder called 'suburbs' in the main folder
const outputDir = path.join(mainFolder, 'suburbs');
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

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

    const filePath = path.join(outputDir, `${suburb.slug}.html`);
    fs.writeFileSync(filePath, pageHtml);
    count++;
});
console.log(`Generated ${count} individual suburb pages.`);

// ---------------------------------------------------------
// 5. GENERATE THE DIRECTORY PAGE (service-areas.html)
// ---------------------------------------------------------
console.log("Generating the Categorized Service Areas Directory...");

// Read the new directory template
const directoryTemplate = fs.readFileSync(path.join(mainFolder, 'service-areas-template.html'), 'utf8');

// Group the suburbs by their 'region' from the Excel file
const regions = {};
suburbs.forEach(suburb => {
    if (!regions[suburb.region]) {
        regions[suburb.region] = [];
    }
    regions[suburb.region].push(suburb);
});

// Build the HTML list
let directoryHtml = '';
const sortedRegions = Object.keys(regions).sort(); // Sort regions alphabetically

sortedRegions.forEach(region => {
    // Create a beautiful box for each Region
    directoryHtml += `\n<div class="mb-14 bg-white p-8 rounded-sm shadow-md border-t-4 border-sena-red">`;
    directoryHtml += `\n  <h3 class="text-2xl md:text-3xl font-bold text-sena-dark mb-6 border-b border-gray-200 pb-4">${region}</h3>`;
    directoryHtml += `\n  <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">`;
    
    // Sort suburbs alphabetically within the region
    const sortedSuburbs = regions[region].sort((a, b) => a.suburb_name.localeCompare(b.suburb_name));
    
    sortedSuburbs.forEach(suburb => {
        // Create the link pointing to the individual suburb page
        directoryHtml += `\n    <li><a href="suburbs/${suburb.slug}.html" class="text-gray-600 hover:text-sena-red hover:pl-2 transition-all duration-300 flex items-center gap-2"><i class="fa-solid fa-map-pin text-sena-red text-sm"></i> ${suburb.suburb_name}</a></li>`;
    });
    
    directoryHtml += `\n  </ul>\n</div>`;
});

// Replace the placeholder in the template with our new HTML
const finalDirectoryPage = directoryTemplate.replace('{{DIRECTORY_CONTENT}}', directoryHtml);

// Save it in the main folder as service-areas.html
fs.writeFileSync(path.join(mainFolder, 'service-areas.html'), finalDirectoryPage);

console.log(`🎉 Success! Built ${count} suburb pages AND the service-areas.html directory.`);