/*
 * Sena Constructions - Reusable Cost Calculator Engine
 * ----------------------------------------------------
 * Each calculator page defines `window.SENA_CALC` (prices + options) BEFORE
 * loading this file. This engine renders the steps, does the maths live,
 * keeps the URL shareable, and pre-fills the EmailJS quote form.
 *
 * Cost entries (inside an option's `costs` array, or `cfg.always`):
 *   { line: 'base',  rate: 2500 }            -> rate x area
 *   { line: 'site',  fixed: 90000 }          -> flat amount
 *   { line: 'extras', min: 55000, max: 95000 } -> low/high range
 * Entries can mix fixed/rate/min/max. Totals are summed per breakdown `line`.
 */
(function () {
    'use strict';

    const cfg = window.SENA_CALC;
    if (!cfg) return;

    const $ = (sel, root = document) => root.querySelector(sel);
    const stepsEl = $('#calc-steps');
    if (!stepsEl) return;

    const money = (n) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(n);
    const roundTo = (n, step) => Math.round(n / step) * step;
    const ROUND = cfg.roundTo || 1000;
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // ------------------------------------------------------------
    // 1. State (defaults, then overridden by any shared URL params)
    // ------------------------------------------------------------
    const area = cfg.area;
    const state = { area: area ? area.default : 0, sel: {} };

    cfg.groups.forEach((g) => {
        if (g.type === 'area') return;
        state.sel[g.id] = g.type === 'multi' ? new Set(g.default || []) : g.default;
    });

    const params = new URLSearchParams(location.search);
    if (area && params.has('area')) {
        const a = parseFloat(params.get('area'));
        if (a >= area.min && a <= area.max) state.area = a;
    }
    cfg.groups.forEach((g) => {
        if (g.type === 'area' || !params.has(g.id)) return;
        const ids = g.options.map((o) => o.id);
        const raw = params.get(g.id);
        if (g.type === 'multi') {
            state.sel[g.id] = new Set(raw.split(',').filter((id) => ids.includes(id)));
        } else if (ids.includes(raw)) {
            state.sel[g.id] = raw;
        }
    });

    // ------------------------------------------------------------
    // 2. Render the steps from config
    // ------------------------------------------------------------
    const stepHeader = (n, g) => `
        <div class="flex items-start gap-4 mb-6">
            <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-sena-dark text-white font-bold flex items-center justify-center shadow-md">${n}</span>
            <div>
                <h2 class="text-xl md:text-2xl font-serif font-bold text-sena-dark leading-tight">${esc(g.title)}</h2>
                ${g.subtitle ? `<p class="text-sm text-gray-500 mt-1">${esc(g.subtitle)}</p>` : ''}
            </div>
        </div>`;

    const optionCard = (g, o) => {
        const multi = g.type === 'multi';
        const checked = multi ? state.sel[g.id].has(o.id) : state.sel[g.id] === o.id;
        const compact = g.compact;
        return `
        <label class="relative cursor-pointer block h-full">
            <input type="${multi ? 'checkbox' : 'radio'}" name="${g.id}" value="${o.id}" ${checked ? 'checked' : ''} class="peer sr-only">
            <span class="absolute top-4 right-4 w-5 h-5 ${multi ? 'rounded-md' : 'rounded-full'} border-2 border-gray-300 bg-white flex items-center justify-center transition-colors peer-checked:bg-sena-red peer-checked:border-sena-red">
                <i class="fa-solid fa-check text-[10px] text-white"></i>
            </span>
            <div class="h-full rounded-2xl border-2 border-gray-200 bg-white ${compact ? 'p-4 pr-11' : 'p-5 pr-11'} transition-all duration-200 hover:border-gray-300 hover:shadow-md peer-checked:border-sena-red peer-checked:bg-red-50/40 peer-checked:shadow-[0_8px_24px_rgba(227,0,15,0.12)] peer-focus-visible:ring-4 peer-focus-visible:ring-sena-red/20">
                <div class="flex ${compact ? 'items-center' : 'items-start sm:flex-col'} gap-3 sm:gap-3">
                    ${o.icon ? `<span class="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 text-sena-red flex items-center justify-center"><i class="fa-solid ${o.icon}"></i></span>` : ''}
                    <div>
                        <p class="font-bold text-sena-dark leading-snug">${esc(o.label)}</p>
                        ${o.desc ? `<p class="text-xs text-gray-500 mt-1 leading-relaxed">${esc(o.desc)}</p>` : ''}
                        ${o.tag ? `<p class="text-sm font-semibold text-sena-red mt-2">${esc(o.tag)}</p>` : ''}
                    </div>
                </div>
            </div>
        </label>`;
    };

    const areaBlock = () => `
        <div>
            <div class="flex items-end justify-between gap-4 mb-5">
                <label for="calc-area-num" class="text-sm font-semibold text-gray-600">${esc(area.label)}</label>
                <div class="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-sena-red transition-colors bg-white">
                    <input id="calc-area-num" type="number" inputmode="numeric" min="${area.min}" max="${area.max}" step="${area.step}" value="${state.area}"
                        class="w-24 py-2.5 pl-4 text-2xl font-bold text-sena-dark text-right focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none">
                    <span class="px-3 text-gray-500 font-semibold">${esc(area.unit)}</span>
                </div>
            </div>
            <input id="calc-area-range" type="range" min="${area.min}" max="${area.max}" step="${area.step}" value="${state.area}" aria-label="${esc(area.label)}"
                class="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 accent-sena-red">
            <div class="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                <span>${area.min} ${esc(area.unit)}</span><span>${area.max} ${esc(area.unit)}</span>
            </div>
            ${area.hint ? `<p class="text-sm text-gray-500 mt-4 flex gap-2"><i class="fa-solid fa-circle-info text-sena-red mt-0.5"></i><span>${esc(area.hint)}</span></p>` : ''}
        </div>`;

    stepsEl.innerHTML = cfg.groups.map((g, i) => `
        <fieldset class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <legend class="sr-only">${esc(g.title)}</legend>
            ${stepHeader(i + 1, g)}
            ${g.type === 'area' ? areaBlock() : `<div class="grid gap-3 ${g.cols || 'grid-cols-1 sm:grid-cols-2'}">${g.options.map((o) => optionCard(g, o)).join('')}</div>`}
        </fieldset>`).join('');

    // ------------------------------------------------------------
    // 3. The maths
    // ------------------------------------------------------------
    function selectedOptions(g) {
        if (g.type === 'multi') return g.options.filter((o) => state.sel[g.id].has(o.id));
        return g.options.filter((o) => o.id === state.sel[g.id]);
    }

    function compute() {
        const lines = {};
        cfg.lines.forEach((l) => { lines[l.id] = { min: 0, max: 0, parts: [] }; });

        const add = (c, label) => {
            const base = (c.fixed || 0) + (c.rate || 0) * state.area;
            const line = lines[c.line];
            line.min += base + (c.min || 0);
            line.max += base + (c.max || 0);
            if (c.rate) line.parts.push(`${state.area.toLocaleString('en-AU')} ${area.unit} × ${money(c.rate)}/${area.unit}`);
            else if (label) line.parts.push(label);
        };

        (cfg.always || []).forEach((c) => add(c));
        cfg.groups.forEach((g) => {
            if (g.type === 'area') return;
            selectedOptions(g).forEach((o) => o.costs.forEach((c) => add(c, o.short || o.label)));
        });

        let low = 0, high = 0;
        Object.values(lines).forEach((l) => { low += l.min; high += l.max; });
        return { lines, low: roundTo(low, ROUND), high: roundTo(high, ROUND) };
    }

    // ------------------------------------------------------------
    // 4. Output (animated totals, breakdown, mobile bar, form, URL)
    // ------------------------------------------------------------
    const lowEl = $('#calc-low');
    const highEl = $('#calc-high');
    const breakdownEl = $('#calc-breakdown');
    const perUnitEl = $('#calc-per-unit');
    const barEl = $('#calc-mobile-total');
    const messageEl = $('#calc-message');
    const notesEl = $('#calc-notes');

    const shown = { low: 0, high: 0 };
    let raf = null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animateTotals(low, high) {
        cancelAnimationFrame(raf);
        const from = { ...shown };
        const start = performance.now();
        const dur = reduceMotion ? 0 : 450;
        const tick = (now) => {
            const t = dur ? Math.min(1, (now - start) / dur) : 1;
            const e = 1 - Math.pow(1 - t, 3);
            shown.low = from.low + (low - from.low) * e;
            shown.high = from.high + (high - from.high) * e;
            lowEl.textContent = money(roundTo(shown.low, ROUND));
            highEl.textContent = money(roundTo(shown.high, ROUND));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
    }

    const rangeText = (min, max) => (Math.round(min) === Math.round(max) ? money(min) : `${money(min)} – ${money(max)}`);

    function summaryText(r) {
        const rows = [`${cfg.name} estimate: ${money(r.low)} – ${money(r.high)}`];
        if (area) rows.push(`${area.summary || area.label}: ${state.area} ${area.unit}`);
        cfg.groups.forEach((g) => {
            if (g.type === 'area') return;
            const picked = selectedOptions(g).map((o) => o.label);
            rows.push(`${g.summary || g.title}: ${picked.length ? picked.join(', ') : 'None'}`);
        });
        rows.push(`Link: ${location.href}`);
        return rows.join('\n');
    }

    function syncMessage(r) {
        if (!messageEl) return;
        const notes = notesEl && notesEl.value.trim() ? `\n\nCustomer notes:\n${notesEl.value.trim()}` : '';
        messageEl.value = summaryText(r) + notes;
    }

    function syncUrl() {
        const p = new URLSearchParams();
        if (area) p.set('area', state.area);
        cfg.groups.forEach((g) => {
            if (g.type === 'area') return;
            p.set(g.id, g.type === 'multi' ? [...state.sel[g.id]].join(',') : state.sel[g.id]);
        });
        history.replaceState(null, '', `${location.pathname}?${p.toString()}`);
    }

    let last = null;
    function update() {
        const r = compute();
        last = r;
        animateTotals(r.low, r.high);

        breakdownEl.innerHTML = cfg.lines.map((l) => {
            const v = r.lines[l.id];
            const zero = v.min === 0 && v.max === 0;
            const value = zero ? (l.zeroText || 'Included') : rangeText(v.min, v.max);
            const detail = v.parts.length ? v.parts.join(' + ') : (l.note || '');
            return `
            <li class="flex justify-between gap-4 py-3 border-b border-white/10 last:border-0">
                <div class="min-w-0">
                    <p class="font-medium text-white">${esc(l.label)}</p>
                    ${detail ? `<p class="text-xs text-gray-400 mt-0.5 truncate">${esc(detail)}</p>` : ''}
                </div>
                <p class="text-right font-semibold whitespace-nowrap ${zero ? 'text-gray-500' : 'text-white'}">${value}</p>
            </li>`;
        }).join('');

        if (perUnitEl && cfg.perUnit) {
            perUnitEl.textContent = `${money(roundTo(r.low / cfg.perUnit.count, ROUND))} – ${money(roundTo(r.high / cfg.perUnit.count, ROUND))}`;
        }
        if (barEl) barEl.textContent = `${money(r.low)} – ${money(r.high)}`;

        syncUrl();
        syncMessage(r);
    }

    // ------------------------------------------------------------
    // 5. Events
    // ------------------------------------------------------------
    stepsEl.addEventListener('change', (e) => {
        const t = e.target;
        const g = cfg.groups.find((x) => x.id === t.name);
        if (!g) return;
        if (g.type === 'multi') {
            t.checked ? state.sel[g.id].add(t.value) : state.sel[g.id].delete(t.value);
        } else {
            state.sel[g.id] = t.value;
        }
        update();
    });

    if (area) {
        const rangeEl = $('#calc-area-range');
        const numEl = $('#calc-area-num');
        const paintRange = () => {
            const pct = ((state.area - area.min) / (area.max - area.min)) * 100;
            rangeEl.style.background = `linear-gradient(to right, #e3000f ${pct}%, #e5e7eb ${pct}%)`;
        };
        rangeEl.addEventListener('input', () => {
            state.area = parseFloat(rangeEl.value);
            numEl.value = state.area;
            paintRange();
            update();
        });
        numEl.addEventListener('input', () => {
            const v = parseFloat(numEl.value);
            if (isNaN(v) || v < area.min || v > area.max) return; // wait for a valid value
            state.area = v;
            rangeEl.value = v;
            paintRange();
            update();
        });
        numEl.addEventListener('blur', () => {
            const v = Math.min(area.max, Math.max(area.min, parseFloat(numEl.value) || area.default));
            numEl.value = state.area = v;
            rangeEl.value = v;
            paintRange();
            update();
        });
        paintRange();
    }

    if (notesEl) notesEl.addEventListener('input', () => last && syncMessage(last));

    const resetBtn = $('#calc-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            history.replaceState(null, '', location.pathname);
            location.reload();
        });
    }

    const copyBtn = $('#calc-copy');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const label = copyBtn.innerHTML;
            try {
                await navigator.clipboard.writeText(location.href);
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Link copied';
            } catch (err) {
                copyBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Copy failed';
            }
            setTimeout(() => { copyBtn.innerHTML = label; }, 2000);
        });
    }

    // Mobile mini-bar: hide it while the full results or quote form are on screen
    const bar = $('#calc-mobile-bar');
    if (bar && 'IntersectionObserver' in window) {
        const watched = ['#calc-results', '#calc-quote', 'footer'].map((s) => $(s)).filter(Boolean);
        const visible = new Set();
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
            bar.classList.toggle('translate-y-[200%]', visible.size > 0);
        });
        watched.forEach((el) => io.observe(el));
    }

    update();
})();
