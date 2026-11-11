/*
 * Sena Constructions - Project gallery lightbox
 * Any <a data-gallery-item href="full.webp"> inside [data-gallery] opens in a
 * full-screen viewer with previous/next, keyboard arrows, swipe and Esc to close.
 * Without JavaScript the links still open the full-size photo.
 */
(function () {
    'use strict';
    const gallery = document.querySelector('[data-gallery]');
    if (!gallery) return;
    const items = [...gallery.querySelectorAll('a[data-gallery-item]')];
    if (!items.length) return;

    const box = document.createElement('div');
    box.className = 'fixed inset-0 z-[200] bg-black/95 hidden flex-col select-none';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML = `
        <div class="flex items-center justify-between px-4 md:px-8 py-4 text-white">
            <p class="text-sm font-semibold tracking-wider" data-lb-count></p>
            <button type="button" data-lb-close class="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl transition" aria-label="Close photo viewer"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="relative flex-1 flex items-center justify-center px-2 md:px-20 pb-6 min-h-0">
            <img data-lb-img class="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-opacity duration-200" alt="">
            <div data-lb-spinner class="absolute inset-0 flex items-center justify-center pointer-events-none"><i class="fa-solid fa-circle-notch fa-spin text-white/60 text-3xl"></i></div>
            <button type="button" data-lb-prev class="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-sena-red text-white flex items-center justify-center transition" aria-label="Previous photo"><i class="fa-solid fa-chevron-left"></i></button>
            <button type="button" data-lb-next class="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-sena-red text-white flex items-center justify-center transition" aria-label="Next photo"><i class="fa-solid fa-chevron-right"></i></button>
        </div>`;
    document.body.appendChild(box);

    const img = box.querySelector('[data-lb-img]');
    const spinner = box.querySelector('[data-lb-spinner]');
    const count = box.querySelector('[data-lb-count]');
    let index = 0;
    let lastFocus = null;

    function load(i) {
        index = (i + items.length) % items.length;
        const a = items[index];
        spinner.classList.remove('hidden');
        img.style.opacity = '0';
        const shown = () => { spinner.classList.add('hidden'); img.style.opacity = '1'; };
        img.onload = shown;
        img.src = a.getAttribute('href');
        if (img.complete && img.naturalWidth) shown(); // already cached
        img.alt = a.querySelector('img')?.alt || '';
        count.textContent = `${index + 1} / ${items.length}`;
        // Preload the neighbours so next/previous feel instant
        [index + 1, index - 1].forEach((n) => { new Image().src = items[(n + items.length) % items.length].getAttribute('href'); });
    }

    function open(i) {
        lastFocus = document.activeElement;
        box.classList.remove('hidden');
        box.classList.add('flex');
        document.documentElement.style.overflow = 'hidden';
        load(i);
        box.querySelector('[data-lb-close]').focus();
    }

    function close() {
        box.classList.add('hidden');
        box.classList.remove('flex');
        document.documentElement.style.overflow = '';
        img.removeAttribute('src');
        if (lastFocus) lastFocus.focus();
    }

    items.forEach((a, i) => a.addEventListener('click', (e) => { e.preventDefault(); open(i); }));
    box.querySelector('[data-lb-close]').addEventListener('click', close);
    box.querySelector('[data-lb-prev]').addEventListener('click', () => load(index - 1));
    box.querySelector('[data-lb-next]').addEventListener('click', () => load(index + 1));
    // Click on the dark background closes
    box.addEventListener('click', (e) => { if (e.target === box || e.target === img.parentElement) close(); });

    document.addEventListener('keydown', (e) => {
        if (box.classList.contains('hidden')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') load(index - 1);
        if (e.key === 'ArrowRight') load(index + 1);
        if (e.key === 'Tab') { // keep focus inside the viewer
            const f = [...box.querySelectorAll('button')];
            const at = f.indexOf(document.activeElement);
            e.preventDefault();
            f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
        }
    });

    // Swipe on phones
    let startX = null;
    box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) load(index + (dx < 0 ? 1 : -1));
        startX = null;
    });
})();
