const fs = require('fs');
const path = require('path');

console.log("Starting the page generator...");

// This tells the script to look one level up in the main 'Sena Construction' folder
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
    console.log("Created /suburbs directory.");
}

// 4. Loop through every suburb in your Excel/JSON file
let count = 0;

suburbs.forEach(suburb => {
    let pageHtml = templateHtml
    .replaceAll('{{slug}}', suburb.slug)
    .replaceAll('{{suburb_name}}', suburb.suburb_name)
    .replaceAll('{{council}}', suburb.council)
    .replaceAll('{{region}}', suburb.region)
    .replaceAll('{{headline}}', suburb.headline)
    .replaceAll('{{unique_intro}}', suburb.unique_intro)
    .replaceAll('{{local_building_tip}}', suburb.local_building_tip) // <-- Add this line
    .replaceAll('{{postcode}}', suburb.postcode);

    // 5. Save the new HTML file using the slug
    const filePath = path.join(outputDir, `${suburb.slug}.html`);
    fs.writeFileSync(filePath, pageHtml);
    
    console.log(`Generated: ${suburb.slug}.html`);
    count++;
});

console.log(`\n🎉 Success! Generated ${count} highly optimized suburb pages.`);