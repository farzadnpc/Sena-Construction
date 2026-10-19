const fs = require('fs');
const path = require('path');

// 1. Load Data
const suburbsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../suburbs-data.json'), 'utf8'));

console.log('Grouping suburbs by council and generating HTML Sitemap...');

// 2. Group Suburbs by Council / LGA / Region
const councilGroups = {};

suburbsData.forEach(suburb => {
    // Falls back to region or 'Greater Sydney' if council key isn't specified
    const councilName = suburb.council || suburb.lga || suburb.region || 'Greater Sydney';
    
    if (!councilGroups[councilName]) {
        councilGroups[councilName] = [];
    }
    
    councilGroups[councilName].push(suburb);
});

// Sort councils alphabetically
const sortedCouncils = Object.keys(councilGroups).sort();

// 3. Build the Council Accordion / Grouped HTML
let councilsHtml = '';

sortedCouncils.forEach(council => {
    const suburbsInCouncil = councilGroups[council];
    // Sort suburbs within council alphabetically
    suburbsInCouncil.sort((a, b) => a.suburb_name.localeCompare(b.suburb_name));

    let linksHtml = '';
    suburbsInCouncil.forEach(suburb => {
        const postcodeStr = suburb.postcode ? ` <span class="text-xs text-gray-400">(${suburb.postcode})</span>` : '';
        linksHtml += `
            <a href="/${suburb.slug}" class="text-gray-600 hover:text-sena-red transition-colors text-sm py-1 border-b border-gray-100 flex items-center justify-between group">
                <span><i class="fa-solid fa-angle-right text-sena-red text-[10px] mr-1 group-hover:translate-x-1 transition-transform inline-block"></i> ${suburb.suburb_name}</span>
                ${postcodeStr}
            </a>`;
    });

    councilsHtml += `
        <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex justify-between items-center mb-6 pb-3 border-b-2 border-sena-red/20">
                <h3 class="text-xl font-serif font-bold text-sena-dark">${council}</h3>
                <span class="bg-red-50 text-sena-red text-xs font-bold px-3 py-1 rounded-full">${suburbsInCouncil.length} Suburbs</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                ${linksHtml}
            </div>
        </div>`;
});

// 4. Build the Full HTML Page
const fullHtml = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Map & Service Areas by Council | Sena Constructions Sydney</title>
    <meta name="description" content="Explore all 700+ Sydney suburbs serviced by Sena Constructions, organized by Council area and postcode.">
    
    <!-- Google Fonts & FontAwesome -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        sena: { red: '#e3000f', dark: '#050505', light: '#f9f9f9', gray: '#333333', border: '#e5e7eb' }
                    },
                    fontFamily: { sans: ['Inter', 'sans-serif'], serif: ['Playfair Display', 'serif'] }
                }
            }
        }
    </script>
<link rel="icon" type="image/png" href="/images/senasmalllogo.png">
</head>
<body class="font-sans text-sena-gray bg-gray-50 overflow-x-hidden antialiased pb-16 md:pb-0">

    <!-- TOP CONTACT BAR -->
    <div class="bg-black text-gray-400 text-xs py-2 hidden md:block border-b border-gray-800">
        <div class="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div class="flex gap-6">
                <span class="flex items-center gap-2"><i class="fa-solid fa-location-dot text-sena-red"></i> 74A Ringrose Ave, Greystanes NSW 2145</span>
                <span class="flex items-center gap-2"><i class="fa-solid fa-clock text-sena-red"></i> Mon - Fri: 9:00 AM - 5:00 PM</span>
            </div>
            <div class="flex gap-6 items-center">
                <a href="mailto:office@senaconstructions.com.au" class="hover:text-white transition"><i class="fa-solid fa-envelope text-sena-red mr-2"></i> office@senaconstructions.com.au</a>
                <a href="tel:0298850797" class="text-white font-bold hover:text-sena-red transition"><i class="fa-solid fa-phone text-sena-red mr-2"></i> (02) 9885 0797</a>
            </div>
        </div>
    </div>

    <!-- MAIN NAVIGATION -->
    <header class="bg-sena-dark text-white py-4 sticky top-0 z-50 shadow-xl border-b border-sena-red/20">
        <div class="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <a href="/" class="flex items-center group">
                <img src="images/senalogo.png" alt="Sena Constructions" class="h-12 w-auto group-hover:scale-105 transition-transform duration-300">
            </a>
            
            <nav class="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide">
                <a href="/" class="hover:text-sena-red transition-colors">Home</a>
                <a href="/about" class="hover:text-sena-red transition-colors">About</a>
                <a href="/process" class="hover:text-sena-red transition-colors">Our Process</a>
                <a href="/services" class="hover:text-sena-red transition-colors">Services</a>
                <a href="/projects" class="hover:text-sena-red transition-colors">Projects</a>
                <a href="/blogs" class="hover:text-sena-red transition-colors">Blogs</a>
                <a href="/contact" class="bg-sena-red text-white px-6 py-2.5 rounded-xl hover:bg-red-700 transition shadow-lg shadow-sena-red/20">Contact</a>
            </nav>
        </div>
    </header>

    <main>
        <!-- HERO SECTION -->
        <section class="relative h-[30vh] min-h-[300px] flex items-center bg-sena-dark">
            <div class="max-w-7xl mx-auto px-6 relative z-10 text-white w-full">
                <h1 class="text-4xl md:text-5xl font-serif font-bold mb-4 drop-shadow-lg">Site Map & Service Areas</h1>
                <div class="w-20 h-1.5 bg-sena-red rounded-full"></div>
            </div>
        </section>

        <section class="py-24 bg-gray-50 relative">
            <div class="max-w-7xl mx-auto px-6">
                
                <!-- Main Pages & Services -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                    <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 class="text-2xl font-serif font-bold mb-6 text-sena-dark border-b-2 border-sena-red/20 pb-3">Main Pages</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <a href="/" class="text-base text-gray-700 hover:text-sena-red font-medium transition-colors"><i class="fa-solid fa-angle-right text-sena-red text-xs mr-2"></i> Home</a>
                            <a href="/about" class="text-base text-gray-700 hover:text-sena-red font-medium transition-colors"><i class="fa-solid fa-angle-right text-sena-red text-xs mr-2"></i> About Us</a>
                            <a href="/process" class="text-base text-gray-700 hover:text-sena-red font-medium transition-colors"><i class="fa-solid fa-angle-right text-sena-red text-xs mr-2"></i> Our Process</a>
                            <a href="/projects" class="text-base text-gray-700 hover:text-sena-red font-medium transition-colors"><i class="fa-solid fa-angle-right text-sena-red text-xs mr-2"></i> Our Projects</a>
                            <a href="/blogs" class="text-base text-gray-700 hover:text-sena-red font-medium transition-colors"><i class="fa-solid fa-angle-right text-sena-red text-xs mr-2"></i> Insights & News</a>
                            <a href="/contact" class="text-base text-gray-700 hover:text-sena-red font-medium transition-colors"><i class="fa-solid fa-angle-right text-sena-red text-xs mr-2"></i> Contact Us</a>
                        </div>
                    </div>

                    <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 class="text-2xl font-serif font-bold mb-6 text-sena-dark border-b-2 border-sena-red/20 pb-3">Our Services</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <a href="/services" class="text-base text-gray-700 hover:text-sena-red font-medium transition-colors"><i class="fa-solid fa-angle-right text-sena-red text-xs mr-2"></i> All Services</a>
                            <a href="/luxury-homes" class="text-base text-gray-700 hover:text-sena-red font-medium transition-colors"><i class="fa-solid fa-angle-right text-sena-red text-xs mr-2"></i> Luxury Homes</a>
                            <a href="/granny-flats" class="text-base text-gray-700 hover:text-sena-red font-medium transition-colors"><i class="fa-solid fa-angle-right text-sena-red text-xs mr-2"></i> Granny Flats</a>
                            <a href="/duplexes" class="text-base text-gray-700 hover:text-sena-red font-medium transition-colors"><i class="fa-solid fa-angle-right text-sena-red text-xs mr-2"></i> Duplexes</a>
                            <a href="/knockdown-rebuilds" class="text-base text-gray-700 hover:text-sena-red font-medium transition-colors"><i class="fa-solid fa-angle-right text-sena-red text-xs mr-2"></i> Knockdown Rebuilds</a>
                            <a href="/renovations-extensions" class="text-base text-gray-700 hover:text-sena-red font-medium transition-colors"><i class="fa-solid fa-angle-right text-sena-red text-xs mr-2"></i> Renovations & Extensions</a>
                            <a href="/building-maintenance" class="text-base text-gray-700 hover:text-sena-red font-medium transition-colors"><i class="fa-solid fa-angle-right text-sena-red text-xs mr-2"></i> Building Maintenance</a>
                        </div>
                    </div>
                </div>

                <!-- Suburbs Grouped by Council -->
                <div>
                    <div class="mb-10">
                        <h2 class="text-3xl font-serif font-bold text-sena-dark mb-2">Service Areas by Council & Postcode</h2>
                        <p class="text-gray-600">Browse all Sydney suburbs serviced by Sena Constructions grouped by Local Government Area.</p>
                    </div>

                    <div class="space-y-10">
                        ${councilsHtml}
                    </div>
                </div>

            </div>
        </section>
    </main>

    <!-- FOOTER -->
    <footer class="bg-black text-white pt-16 pb-8 border-t-[4px] border-sena-red">
        <div class="border-t border-gray-900 pt-8 text-center md:flex justify-between items-center max-w-7xl mx-auto px-6 text-sm text-gray-600 font-medium">
            <p>Copyright &copy; 2026 Sena Constructions. All Rights Reserved.</p>
            <div class="mt-4 md:mt-0 space-x-4">
                <a href="/sitemap.html" class="hover:text-sena-red transition-colors text-sena-red">Site Map</a>
            </div>
        </div>
    </footer>

    <script src="scripts/scripts.js"></script>
</body>
</html>`;

// 5. Save the file
fs.writeFileSync(path.join(__dirname, '../sitemap.html'), fullHtml);

console.log(`🎉 Success! Generated sitemap.html with ${sortedCouncils.length} Council groups.`);