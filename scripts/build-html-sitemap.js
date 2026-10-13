const fs = require('fs');
const path = require('path');

// 1. Load Data
const suburbsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../suburbs-data.json'), 'utf8'));

console.log('Generating HTML Sitemap...');

// 2. Generate the Suburb Links Grid
let suburbLinksHtml = '';
suburbsData.forEach(suburb => {
    suburbLinksHtml += `
        <a href="/${suburb.slug}" class="text-gray-600 hover:text-sena-red transition-colors text-sm py-1 border-b border-gray-100 flex items-center gap-2">
            <i class="fa-solid fa-angle-right text-sena-red text-[10px]"></i> ${suburb.suburb_name}
        </a>`;
});

// 3. Build the full HTML Page
const fullHtml = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Map | Sena Constructions Sydney</title>
    <meta name="description" content="Explore the complete site map for Sena Constructions to find our custom home building services and the 750+ Sydney suburbs we service.">
    
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
                <h1 class="text-4xl md:text-5xl font-serif font-bold mb-4 drop-shadow-lg">Site Map</h1>
                <div class="w-20 h-1.5 bg-sena-red rounded-full"></div>
            </div>
        </section>

        <section class="py-24 bg-white relative">
            <div class="max-w-7xl mx-auto px-6">
                
                <!-- Main Pages & Services -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
                    <div>
                        <h2 class="text-3xl font-serif font-bold mb-6 text-sena-dark border-b-2 border-sena-red/20 pb-4">Main Pages</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <a href="/" class="text-lg text-gray-700 hover:text-sena-red font-medium transition-colors">Home</a>
                            <a href="/about" class="text-lg text-gray-700 hover:text-sena-red font-medium transition-colors">About Us</a>
                            <a href="/process" class="text-lg text-gray-700 hover:text-sena-red font-medium transition-colors">Our Process</a>
                            <a href="/projects" class="text-lg text-gray-700 hover:text-sena-red font-medium transition-colors">Our Projects</a>
                            <a href="/blogs" class="text-lg text-gray-700 hover:text-sena-red font-medium transition-colors">Insights & News</a>
                            <a href="/contact" class="text-lg text-gray-700 hover:text-sena-red font-medium transition-colors">Contact Us</a>
                        </div>
                    </div>

                    <div>
                        <h2 class="text-3xl font-serif font-bold mb-6 text-sena-dark border-b-2 border-sena-red/20 pb-4">Our Services</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <a href="/services" class="text-lg text-gray-700 hover:text-sena-red font-medium transition-colors">All Services Overview</a>
                            <a href="/luxury-homes" class="text-lg text-gray-700 hover:text-sena-red font-medium transition-colors">Luxury Homes</a>
                            <a href="/granny-flats" class="text-lg text-gray-700 hover:text-sena-red font-medium transition-colors">Granny Flats</a>
                            <a href="/duplexes" class="text-lg text-gray-700 hover:text-sena-red font-medium transition-colors">Duplexes</a>
                            <a href="/knockdown-rebuilds" class="text-lg text-gray-700 hover:text-sena-red font-medium transition-colors">Knockdown Rebuilds</a>
                            <a href="/renovations-extensions" class="text-lg text-gray-700 hover:text-sena-red font-medium transition-colors">Renovations & Extensions</a>
                            <a href="/building-maintenance" class="text-lg text-gray-700 hover:text-sena-red font-medium transition-colors">Building Maintenance</a>
                        </div>
                    </div>
                </div>

                <!-- Suburb Grid Directory -->
                <div>
                    <h2 class="text-3xl font-serif font-bold mb-8 text-sena-dark border-b-2 border-sena-red/20 pb-4">Areas We Service</h2>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-2">
                        ${suburbLinksHtml}
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
                <a href="/sitemap.html" class="hover:text-sena-red transition-colors text-sena-red">HTML Site Map</a>
            </div>
        </div>
    </footer>

    <script src="scripts/scripts.js"></script>
</body>
</html>`;

// 4. Save the file
fs.writeFileSync(path.join(__dirname, '../sitemap.html'), fullHtml);

console.log('🎉 Success! sitemap.html has been created with all main links and Suburb areas.');