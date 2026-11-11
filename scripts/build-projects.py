#!/usr/bin/env python3
"""
Builds the project galleries from projects-data.json.

For every project it makes web-sized copies of the photos (your originals are
never changed) and generates:
  - one page per category, e.g. projects-luxury-homes.html
  - one page per project,  e.g. 57-hyssop-crescent-melonba.html

Run from the project root:
    pip3 install pillow        (first time only)
    python3 scripts/build-projects.py

To add a project: put its photos in a folder under images/, add an entry to
projects-data.json, run this script, then add the new page addresses to
scripts/build-sitemap.js.
"""
import fnmatch, html, json, os, re, sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit('Pillow is needed: run "pip3 install pillow" and try again.')

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
os.chdir(ROOT)
SITE = 'https://senaconstructions.com.au/'
FULL_MAX, THUMB_MAX = 1600, 720
data = json.load(open('projects-data.json'))
shell = open('_templates/page-shell.html').read()
esc = html.escape


def natural(s):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r'(\d+)', s)]


def photos_for(p):
    pattern = p.get('files', '*.jpg')
    files = sorted((f for f in os.listdir(p['source']) if fnmatch.fnmatch(f.lower(), pattern.lower())), key=natural)
    if p.get('cover') in files:  # cover photo first
        files.remove(p['cover'])
        files.insert(0, p['cover'])
    return files


def save_resized(src, dest, max_size, quality):
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')  # fix sideways phone photos
    im.thumbnail((max_size, max_size), Image.LANCZOS)
    im.save(dest, 'WEBP', quality=quality, method=6)
    return im.size


def build_images(p):
    """Create web copies; skip work that's already done and up to date."""
    out = f"images/projects/{p['slug']}"
    os.makedirs(f'{out}/full', exist_ok=True)
    os.makedirs(f'{out}/thumb', exist_ok=True)
    files = photos_for(p)
    expected = {f'{i + 1:02d}.webp' for i in range(len(files))}
    for d in ('full', 'thumb'):  # remove leftovers if photos were removed
        for f in os.listdir(f'{out}/{d}'):
            if f not in expected:
                os.remove(f'{out}/{d}/{f}')
    photos = []
    for i, f in enumerate(files):
        src = os.path.join(p['source'], f)
        name = f'{i + 1:02d}.webp'
        full, thumb = f'{out}/full/{name}', f'{out}/thumb/{name}'
        stale = lambda t: not os.path.exists(t) or os.path.getmtime(t) < os.path.getmtime(src)
        if stale(full):
            save_resized(src, full, FULL_MAX, 80)
        if stale(thumb):
            save_resized(src, thumb, THUMB_MAX, 72)
        w, h = Image.open(thumb).size
        photos.append({'full': full, 'thumb': thumb, 'w': w, 'h': h})
    # Share image (1200x630) from the cover photo
    og = f'{out}/og.jpg'
    cover_src = os.path.join(p['source'], files[0])
    if not os.path.exists(og) or os.path.getmtime(og) < os.path.getmtime(cover_src):
        im = ImageOps.exif_transpose(Image.open(cover_src)).convert('RGB')
        ImageOps.fit(im, (1200, 630), Image.LANCZOS).save(og, 'JPEG', quality=82, optimize=True, progressive=True)
    return photos


def page(slug, title, description, og_image, preload, main, scripts=''):
    out = shell
    for k, v in {'{{TITLE}}': esc(title), '{{SLUG}}': slug, '{{DESCRIPTION}}': esc(description),
                 '{{OG_IMAGE}}': og_image, '{{PRELOAD}}': preload, '{{MAIN}}': main, '{{SCRIPTS}}': scripts}.items():
        out = out.replace(k, v)
    leftover = re.search(r'\{\{[A-Z_]+\}\}', out)
    if leftover:
        sys.exit(f'Unfilled placeholder {leftover.group(0)} on {slug}')
    open(f'{slug}.html', 'w').write(out)


def breadcrumb(parts):
    links = []
    for label, href in parts:
        links.append(f'<a href="{href}" class="hover:text-white transition-colors">{esc(label)}</a>' if href else f'<span class="text-white">{esc(label)}</span>')
    return '<nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-2 text-sm text-gray-300 mb-6">' + \
           ' <i class="fa-solid fa-chevron-right text-[10px] text-sena-red"></i> '.join(links) + '</nav>'


def hero(bg, crumbs, eyebrow, title, sub, extra=''):
    return f'''        <section class="relative min-h-[460px] md:min-h-[540px] flex items-end bg-cover bg-center" style="background-image: url('{bg}');">
            <div class="absolute inset-0 bg-gradient-to-t from-sena-dark via-sena-dark/60 to-sena-dark/20"></div>
            <div class="max-w-7xl mx-auto px-6 pb-14 pt-32 relative z-10 text-white w-full">
                {breadcrumb(crumbs)}
                <p class="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-5"><i class="fa-solid fa-location-dot text-sena-red"></i> {esc(eyebrow)}</p>
                <h1 class="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 leading-tight drop-shadow-lg">{esc(title)}</h1>
                <p class="text-lg md:text-xl text-gray-200 max-w-3xl">{esc(sub)}</p>
                {extra}
            </div>
        </section>'''


def project_card(p, photos):
    t = photos[0]
    return f'''
                    <a href="/{p['slug']}" class="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                        <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
                            <img src="{t['thumb']}" alt="{esc(p['type'])} at {esc(p['address'])}, {esc(p['suburb'])}" loading="lazy" width="{t['w']}" height="{t['h']}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                            <span class="absolute top-4 left-4 bg-sena-dark/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">{esc(p['type'])}</span>
                            <span class="absolute bottom-4 right-4 bg-white/90 text-sena-dark text-xs font-bold px-3 py-1.5 rounded-full"><i class="fa-solid fa-images text-sena-red mr-1"></i> {len(photos)} photos</span>
                        </div>
                        <div class="p-6 flex items-center justify-between gap-4">
                            <div>
                                <h3 class="text-xl font-serif font-bold text-sena-dark group-hover:text-sena-red transition-colors">{esc(p['address'])}</h3>
                                <p class="text-gray-500 text-sm mt-1"><i class="fa-solid fa-location-dot text-sena-red mr-1"></i> {esc(p['suburb'])}</p>
                            </div>
                            <span class="w-11 h-11 flex-shrink-0 rounded-full bg-red-50 text-sena-red flex items-center justify-center group-hover:bg-sena-red group-hover:text-white transition-colors"><i class="fa-solid fa-arrow-right"></i></span>
                        </div>
                    </a>'''


def cta(cat, heading):
    return f'''        <section class="py-16 md:py-20 bg-sena-dark text-white relative overflow-hidden">
            <div class="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-sena-red/20 blur-3xl pointer-events-none"></div>
            <div class="max-w-5xl mx-auto px-6 text-center relative">
                <h2 class="text-3xl md:text-4xl font-serif font-bold mb-4">{esc(heading)}</h2>
                <p class="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">Get an instant estimate for your project, or talk to our team about your plans. Consultations are free and there's no obligation.</p>
                <div class="flex flex-wrap justify-center gap-4">
                    <a href="{cat['calculator']['href']}" class="inline-flex bg-sena-red hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold transition items-center shadow-[0_10px_20px_rgba(227,0,15,0.3)]"><i class="fa-solid fa-calculator mr-3"></i> {esc(cat['calculator']['label'])}</a>
                    <a href="/contact" class="inline-flex border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-xl font-bold transition items-center">Book a consultation <i class="fa-solid fa-arrow-right ml-3"></i></a>
                </div>
            </div>
        </section>'''


cats = {c['slug']: c for c in data['categories']}
built = {p['slug']: build_images(p) for p in data['projects']}
pages = []

for c in data['categories']:
    projects = [p for p in data['projects'] if p['category'] == c['slug']]
    if not projects:
        continue
    first = built[projects[0]['slug']]
    total = sum(len(built[p['slug']]) for p in projects)
    slug = f"projects-{c['slug']}"
    main = hero(first[0]['full'], [('Projects', '/projects'), (c['title'], None)], 'Sydney', f"{c['title']} Projects",
                f"{len(projects)} completed projects · {total} photos") + f'''

        <section class="py-20 md:py-24 bg-gray-50">
            <div class="max-w-7xl mx-auto px-6">
                <div class="max-w-3xl mb-12">
                    <h2 class="text-3xl md:text-4xl font-serif font-bold mb-5 text-sena-dark">Choose a project</h2>
                    <div class="w-20 h-1.5 bg-sena-red rounded-full mb-6"></div>
                    <p class="text-gray-600 text-lg leading-relaxed">{esc(c['intro'])}</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{''.join(project_card(p, built[p['slug']]) for p in projects)}
                </div>
                <p class="mt-12 text-gray-600">Want to know more about our {esc(c['title'].lower())} service? <a href="{c['service_page']}" class="text-sena-red font-semibold underline underline-offset-4">Read about {esc(c['title'].lower())}</a>.</p>
            </div>
        </section>

{cta(c, 'Planning a project like these?')}'''
    page(slug, f"{c['title']} Projects Sydney | Sena Constructions",
         f"Browse {c['title'].lower()} built by Sena Constructions across Sydney. {len(projects)} projects with {total} photos.",
         f"images/projects/{projects[0]['slug']}/og.jpg", first[0]['full'], main)
    pages.append(slug)

for p in data['projects']:
    c, photos = cats[p['category']], built[p['slug']]
    name = f"{p['address']}, {p['suburb']}"
    tiles = ''.join(f'''
                    <a href="{ph['full']}" data-gallery-item class="group block mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-gray-100 relative focus:outline-none focus-visible:ring-4 focus-visible:ring-sena-red/40">
                        <img src="{ph['thumb']}" alt="{esc(p['type'])} at {esc(name)}, photo {i + 1} of {len(photos)}" width="{ph['w']}" height="{ph['h']}" {'loading="lazy" ' if i > 5 else ''}class="w-full h-auto group-hover:scale-105 transition-transform duration-500">
                        <span class="absolute inset-0 bg-sena-dark/0 group-hover:bg-sena-dark/30 transition-colors flex items-center justify-center"><i class="fa-solid fa-expand text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity"></i></span>
                    </a>''' for i, ph in enumerate(photos))
    # Small galleries look better in two columns (no empty third column)
    cols = 'columns-1 sm:columns-2 max-w-5xl' if len(photos) <= 4 else 'columns-1 sm:columns-2 lg:columns-3'
    others = [o for o in data['projects'] if o['category'] == p['category'] and o['slug'] != p['slug']]
    more = f'''
        <section class="py-20 bg-white border-t border-gray-100">
            <div class="max-w-7xl mx-auto px-6">
                <div class="flex flex-wrap items-end justify-between gap-4 mb-10">
                    <h2 class="text-3xl md:text-4xl font-serif font-bold text-sena-dark">More {esc(c['title'].lower())}</h2>
                    <a href="/projects-{c['slug']}" class="font-semibold text-sena-red hover:underline underline-offset-4">All {esc(c['title'].lower())} <i class="fa-solid fa-arrow-right ml-1"></i></a>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{''.join(project_card(o, built[o['slug']]) for o in others)}
                </div>
            </div>
        </section>
''' if others else ''
    main = hero(photos[0]['full'], [('Projects', '/projects'), (c['title'], f"/projects-{c['slug']}"), (p['address'], None)],
                f"{p['suburb']}, Sydney", name, f"{p['type']} by Sena Constructions · {len(photos)} photos",
                '<a href="#gallery" class="mt-8 inline-flex bg-sena-red hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold transition items-center shadow-[0_10px_20px_rgba(227,0,15,0.3)]">View photos <i class="fa-solid fa-arrow-down ml-3"></i></a>') + f'''

        <section id="gallery" class="py-16 md:py-20 bg-gray-50 scroll-mt-24">
            <div class="max-w-7xl mx-auto px-4 sm:px-6">
                <div class="flex flex-wrap items-end justify-between gap-4 mb-10">
                    <div>
                        <h2 class="text-3xl md:text-4xl font-serif font-bold text-sena-dark mb-4">Project gallery</h2>
                        <div class="w-20 h-1.5 bg-sena-red rounded-full"></div>
                    </div>
                    <p class="text-gray-500 text-sm"><i class="fa-solid fa-hand-pointer text-sena-red mr-1"></i> Tap any photo to view it full screen</p>
                </div>
                <div data-gallery class="{cols} gap-4">{tiles}
                </div>
            </div>
        </section>
{more}
{cta(c, 'Planning something similar?')}'''
    page(p['slug'], f"{p['type']} – {name} | Sena Constructions",
         f"See {len(photos)} photos of the {p['type'].lower()} Sena Constructions built at {name}, Sydney.",
         f"images/projects/{p['slug']}/og.jpg", photos[0]['full'], main,
         '    <script src="scripts/gallery.js"></script>\n')
    pages.append(p['slug'])

print(f'Built {len(pages)} pages: ' + ', '.join(pages))
print(f'Photos: {sum(len(v) for v in built.values())} across {len(built)} projects')
