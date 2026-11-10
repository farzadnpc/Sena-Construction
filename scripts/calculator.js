/*
 * Sena Constructions - Step-by-step Cost Calculator (wizard) engine
 * -----------------------------------------------------------------
 * A calculator page defines `window.SENA_CALC` (steps, options, prices)
 * BEFORE loading this file. Prices are never shown to the customer while
 * they choose; only the final range appears on the results screen.
 *
 * Cost entries (in an option's / toggle's `costs` array, or `cfg.always`):
 *   { line: 'base', rate: 2500 }             -> rate x area field value
 *   { line: 'site', fixed: 90000 }           -> flat amount
 *   { line: 'extras', min: 55000, max: 95000 } -> low/high range
 */
(function () {
    'use strict';

    const cfg = window.SENA_CALC;
    const root = document.getElementById('wiz');
    if (!cfg || !root) return;

    const $ = (sel, el = root) => el.querySelector(sel);
    const $$ = (sel, el = root) => [...el.querySelectorAll(sel)];
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // Titles may use *word* to highlight a word in red italics
    const fancy = (s) => esc(s).replace(/\*(.+?)\*/g, '<em class="text-sena-red italic">$1</em>');
    const money = (n) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(n);
    // Short money format ($1.63M / $850k). dir: 'down' for the low end, 'up' for the high end,
    // so the displayed range never understates the calculated range.
    const short = (n, dir) => {
        const r = dir === 'up' ? Math.ceil : dir === 'down' ? Math.floor : Math.round;
        if (n >= 1e6) return `$${(r(n / 1e4) / 100).toFixed(2).replace(/\.?0+$/, '')}M`;
        return `$${r(n / 1000)}k`;
    };
    const ROUND = cfg.roundTo || 1000;
    const roundTo = (n) => Math.round(n / ROUND) * ROUND;

    // ------------------------------------------------------------
    // State
    // ------------------------------------------------------------
    const fields = cfg.steps.flatMap((s) => s.fields || []);
    const fieldById = Object.fromEntries(fields.map((f) => [f.id, f]));
    const state = {};
    fields.forEach((f) => {
        if (f.type === 'multi') state[f.id] = new Set(f.default || []);
        else if (f.type === 'toggle') state[f.id] = !!f.default;
        else state[f.id] = f.default;
    });

    const optionOf = (f, id) => (f.options || []).find((o) => o.id === id);
    const disabledReason = (o) => (o.disabledIf ? o.disabledIf(state) : false);
    const label = (id) => {
        const f = fieldById[id];
        if (f.type === 'multi') return f.options.filter((o) => state[id].has(o.id)).map((o) => o.label);
        if (f.type === 'toggle') return state[id] ? 'Yes' : 'No';
        if (f.type === 'slider') return `${state[id]} ${f.unit}`;
        const o = optionOf(f, state[id]);
        return o ? o.label : '';
    };

    // If a selected option becomes unavailable (e.g. double garage), fall back
    function enforceRules() {
        fields.forEach((f) => {
            if (f.type !== 'choice') return;
            const o = optionOf(f, state[f.id]);
            if (o && disabledReason(o)) {
                const ok = f.options.find((x) => !disabledReason(x));
                if (ok) state[f.id] = ok.id;
            }
        });
    }

    // ------------------------------------------------------------
    // Maths
    // ------------------------------------------------------------
    function compute() {
        // A calculator can supply its own formula: cfg.compute(state) -> { low, high, rows?, notes? }
        if (cfg.compute) return cfg.compute(state);
        const areaField = fields.find((f) => f.isArea);
        const area = areaField ? state[areaField.id] : 0;
        let low = 0, high = 0;
        const add = (c) => {
            const base = (c.fixed || 0) + (c.rate || 0) * area;
            low += base + (c.min || 0);
            high += base + (c.max || 0);
        };
        (cfg.always || []).forEach(add);
        fields.forEach((f) => {
            if (f.type === 'choice') { const o = optionOf(f, state[f.id]); if (o && o.costs) o.costs.forEach(add); }
            if (f.type === 'multi') f.options.forEach((o) => state[f.id].has(o.id) && (o.costs || []).forEach(add));
            if (f.type === 'toggle' && state[f.id]) (f.costs || []).forEach(add);
        });
        return { low: roundTo(low), high: roundTo(high) };
    }

    // ------------------------------------------------------------
    // Rendering: fields
    // ------------------------------------------------------------
    const fieldLabel = (f) => f.label ? `
        <p class="text-xs font-bold uppercase tracking-widest text-sena-dark mb-3">${esc(f.label)}${f.sublabel ? ` <span class="normal-case tracking-normal font-medium text-gray-400 ml-1">${esc(f.sublabel)}</span>` : ''}</p>` : '';

    const cardBase = 'group relative block cursor-pointer rounded-2xl border-2 border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-md has-[:checked]:border-sena-red has-[:checked]:bg-red-50/40 has-[:checked]:shadow-[0_10px_30px_rgba(227,0,15,0.12)] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-sena-red/20 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-45 has-[:disabled]:hover:shadow-none has-[:disabled]:hover:border-gray-200';

    function renderChoice(f) {
        const variant = f.variant || 'icon';
        const cards = f.options.map((o) => {
            const reason = disabledReason(o);
            const input = `<input type="radio" class="sr-only" name="${f.id}" value="${o.id}" ${state[f.id] === o.id ? 'checked' : ''} ${reason ? 'disabled' : ''}>`;
            const badge = o.badge ? `<span class="absolute top-3 right-3 z-10 bg-sena-dark text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">${esc(o.badge)}</span>` : '';

            if (variant === 'image') {
                return `<label class="${cardBase} overflow-hidden">${input}${badge}
                    <div class="aspect-[16/10] bg-gray-100 overflow-hidden border-b border-gray-100">${o.art || ''}</div>
                    <div class="p-5">
                        <p class="font-serif text-xl font-bold text-sena-dark">${esc(o.label)}</p>
                        ${o.desc ? `<p class="text-sm text-gray-500 mt-1.5 leading-relaxed">${esc(o.desc)}</p>` : ''}
                    </div>
                    <span class="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/90 border-2 border-white shadow flex items-center justify-center text-transparent group-has-[:checked]:bg-sena-red group-has-[:checked]:text-white transition-colors"><i class="fa-solid fa-check text-xs"></i></span>
                </label>`;
            }
            if (variant === 'tier') {
                return `<label class="${cardBase} overflow-hidden">${input}${badge}
                    <div class="h-28 md:h-32 ${o.swatch || 'bg-gray-100'} flex items-end p-5">
                        <span class="font-serif text-4xl font-bold ${o.swatchText || 'text-sena-dark'}">${esc(o.number || '')}</span>
                    </div>
                    <div class="p-5">
                        <p class="font-serif text-xl font-bold text-sena-dark">${esc(o.label)}</p>
                        ${o.desc ? `<p class="text-sm text-gray-500 mt-1.5 leading-relaxed">${esc(o.desc)}</p>` : ''}
                    </div>
                </label>`;
            }
            return `<label class="${cardBase} p-4 md:p-5">${input}
                <div class="flex sm:flex-col items-center sm:items-start gap-3">
                    <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 text-sena-red flex items-center justify-center transition-colors group-has-[:checked]:bg-sena-red group-has-[:checked]:text-white">
                        ${o.icon ? `<i class="fa-solid ${o.icon}"></i>` : `<span class="font-bold">${esc(o.iconText || '')}</span>`}
                    </span>
                    <div class="min-w-0">
                        <p class="font-bold text-sena-dark leading-snug">${esc(o.label)}</p>
                        ${(reason || o.desc) ? `<p class="text-xs text-gray-500 mt-0.5 leading-relaxed">${esc(reason || o.desc)}</p>` : ''}
                    </div>
                </div>
            </label>`;
        }).join('');
        return `<div>${fieldLabel(f)}<div class="grid gap-3 ${f.cols || 'grid-cols-1 sm:grid-cols-2'}">${cards}</div></div>`;
    }

    function renderMulti(f) {
        const cards = f.options.map((o) => `
            <label class="${cardBase} p-4 md:p-5 flex items-center justify-between gap-4">
                <input type="checkbox" class="sr-only" name="${f.id}" value="${o.id}" ${state[f.id].has(o.id) ? 'checked' : ''}>
                <div class="flex items-center gap-3 min-w-0">
                    ${o.icon ? `<span class="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 text-sena-red flex items-center justify-center transition-colors group-has-[:checked]:bg-sena-red group-has-[:checked]:text-white"><i class="fa-solid ${o.icon}"></i></span>` : ''}
                    <div class="min-w-0">
                        <p class="font-bold text-sena-dark leading-snug">${esc(o.label)}</p>
                        ${o.desc ? `<p class="text-xs text-gray-500 mt-0.5">${esc(o.desc)}</p>` : ''}
                    </div>
                </div>
                <span class="flex-shrink-0 w-6 h-6 rounded-md border-2 border-gray-300 flex items-center justify-center text-transparent transition-colors group-has-[:checked]:bg-sena-red group-has-[:checked]:border-sena-red group-has-[:checked]:text-white"><i class="fa-solid fa-check text-xs"></i></span>
            </label>`).join('');
        return `<div>${fieldLabel(f)}<div class="grid gap-3 ${f.cols || 'grid-cols-1 sm:grid-cols-2'}">${cards}</div></div>`;
    }

    function renderToggle(f) {
        return `<label class="${cardBase} p-5 flex items-center gap-4">
            <input type="checkbox" class="sr-only" name="${f.id}" ${state[f.id] ? 'checked' : ''}>
            <span class="flex-shrink-0 w-6 h-6 rounded-md border-2 border-gray-300 flex items-center justify-center text-transparent transition-colors group-has-[:checked]:bg-sena-red group-has-[:checked]:border-sena-red group-has-[:checked]:text-white"><i class="fa-solid fa-check text-xs"></i></span>
            <div>
                <p class="font-bold text-sena-dark">${esc(f.title)}</p>
                ${f.desc ? `<p class="text-sm text-gray-500 mt-0.5">${esc(f.desc)}</p>` : ''}
            </div>
        </label>`;
    }

    const sliderDisplay = (f, v) => (f.maxLabel && v >= f.max ? f.maxLabel : v);

    function renderSlider(f) {
        const v = state[f.id];
        return `<div class="rounded-2xl bg-gray-50 border border-gray-100 p-5 md:p-6" data-slider="${f.id}">
            <div class="flex items-end justify-between gap-4 mb-5">
                <label for="sl-${f.id}" class="text-xs font-bold uppercase tracking-widest text-sena-dark">${esc(f.label)}${f.sublabel ? `<span class="block normal-case tracking-normal font-medium text-gray-400 mt-1">${esc(f.sublabel)}</span>` : ''}</label>
                <p class="whitespace-nowrap"><span class="font-serif text-4xl md:text-5xl font-bold text-sena-dark" data-val>${sliderDisplay(f, v)}</span> <span class="text-gray-500 font-semibold">${esc(f.unit)}</span></p>
            </div>
            <input id="sl-${f.id}" type="range" name="${f.id}" min="${f.min}" max="${f.max}" step="${f.step}" value="${v}" class="w-full h-2 rounded-full appearance-none cursor-pointer accent-sena-red">
            <div class="flex justify-between text-[11px] uppercase tracking-wider text-gray-400 mt-3 font-semibold" data-ticks>${ticks(f)}</div>
            ${f.note ? `<p class="mt-4 text-sm text-gray-600 flex gap-2 bg-white rounded-xl p-3 border border-gray-100" data-note><span class="w-1.5 h-1.5 rounded-full bg-sena-red mt-2 flex-shrink-0"></span><span>${f.note(v, state)}</span></p>` : ''}
        </div>`;
    }
    const ticks = (f) => (f.ticks ? f.ticks(state[f.id]) : [f.min, f.max].map((t) => `${t} ${f.unit}`)).map((t) => `<span>${esc(t)}</span>`).join('');
    const paintSlider = (el, f) => {
        const pct = ((state[f.id] - f.min) / (f.max - f.min)) * 100;
        el.style.background = `linear-gradient(to right, #e3000f ${pct}%, #e5e7eb ${pct}%)`;
    };

    const renderField = (f) => ({ choice: renderChoice, multi: renderMulti, toggle: renderToggle, slider: renderSlider }[f.type](f));

    // ------------------------------------------------------------
    // Rendering: step screens
    // ------------------------------------------------------------
    function sidePanel(s, n) {
        return `<aside class="relative overflow-hidden rounded-3xl bg-sena-dark text-white p-5 md:p-8 flex flex-col lg:min-h-[520px]">
            <div class="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-sena-red/25 blur-3xl pointer-events-none"></div>
            <div class="relative">
                <span class="inline-block text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-sena-red border border-sena-red/40 rounded-full px-3 md:px-4 py-1.5 md:py-2 mb-4 md:mb-5">Step ${n} · ${esc(s.eyebrow)}</span>
                <h2 class="font-serif text-2xl md:text-4xl font-bold leading-tight mb-3 md:mb-4">${fancy(s.title)}</h2>
                ${s.text ? `<p class="hidden md:block text-gray-300 leading-relaxed">${esc(s.text)}</p>` : ''}
            </div>
            ${s.tip ? `<div class="relative hidden lg:block mt-auto pt-8"><div class="border-l-4 border-sena-red bg-white/5 rounded-r-xl p-5">
                <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-sena-red mb-2">${esc(s.tip.label)}</p>
                <p class="text-sm text-gray-300 leading-relaxed">${esc(s.tip.text)}</p></div></div>` : ''}
            ${s.stats ? `<div class="relative hidden lg:grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">${s.stats.map(([v, l]) => `
                <div><p class="font-serif text-2xl font-bold">${esc(v)}</p><p class="text-[10px] uppercase tracking-[0.18em] text-gray-400 mt-1 leading-relaxed">${esc(l)}</p></div>`).join('')}</div>` : ''}
        </aside>`;
    }

    function renderStep(s, n) {
        const error = `<p data-error class="hidden flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 text-sena-red font-semibold p-4"><i class="fa-solid fa-circle-exclamation"></i><span></span></p>`;
        const body = error + s.fields.map(renderField).join('');
        if (s.layout === 'wide') {
            return `<div>
                <span class="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-sena-red bg-red-50 rounded-full px-4 py-2 mb-5">Step ${n} · ${esc(s.eyebrow)}</span>
                <h2 class="font-serif text-2xl md:text-5xl font-bold text-sena-dark leading-tight mb-3 md:mb-4">${fancy(s.title)}</h2>
                ${s.text ? `<p class="text-gray-600 text-sm md:text-lg leading-relaxed max-w-3xl mb-6 md:mb-8">${esc(s.text)}</p>` : ''}
                <div class="space-y-8">${body}</div>
            </div>`;
        }
        return `<div class="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-6 lg:gap-10 items-start">
            ${sidePanel(s, n)}
            <div class="space-y-8">${body}</div>
        </div>`;
    }

    // ------------------------------------------------------------
    // Navigation
    // Steps can declare showIf(state) (e.g. only show the rooms picked)
    // and validate(state) -> error message string, or '' when OK.
    // ------------------------------------------------------------
    const screens = { intro: $('[data-screen="intro"]'), step: $('[data-screen="step"]'), result: $('[data-screen="result"]') };
    const progress = $('#wiz-progress');
    const counter = $('#wiz-counter');
    const hint = $('#wiz-hint');
    const backBtn = $('#wiz-back');
    const nextBtn = $('#wiz-next');
    const nextLabel = $('#wiz-next-label');
    const visibleSteps = () => cfg.steps.filter((s) => !s.showIf || s.showIf(state));
    let pos = -1; // -1 = intro, 0..n-1 = steps, n = result

    function show(p, scroll = true) {
        const steps = visibleSteps();
        const total = steps.length;
        pos = Math.max(-1, Math.min(p, total));
        p = pos;
        enforceRules();
        const which = p < 0 ? 'intro' : p >= total ? 'result' : 'step';
        Object.entries(screens).forEach(([k, el]) => el.classList.toggle('hidden', k !== which));

        if (which === 'step') {
            screens.step.innerHTML = renderStep(steps[p], p + 1);
            $$('input[type="range"]', screens.step).forEach((el) => paintSlider(el, fieldById[el.name]));
        }
        if (which === 'result') renderResult();

        progress.innerHTML = Array.from({ length: total + 2 }, (_, i) =>
            `<span class="h-1 flex-1 rounded-full transition-colors duration-500 ${i < p + 1 ? 'bg-sena-dark' : i === p + 1 ? 'bg-sena-red' : 'bg-gray-200'}"></span>`).join('');
        counter.classList.toggle('hidden', which !== 'step');
        counter.innerHTML = `<span class="hidden sm:inline">Step </span><b class="text-sena-dark">${p + 1}</b> <span class="hidden sm:inline">of</span><span class="sm:hidden">/</span> <b class="text-sena-dark">${total}</b>`;

        hint.textContent = which === 'intro' ? cfg.introHint : which === 'result' ? cfg.resultHint : (steps[p].hint || '');
        backBtn.classList.toggle('hidden', which === 'intro');
        $('#wiz-footer').classList.toggle('hidden', which === 'result');
        nextLabel.textContent = which === 'intro' ? "Let's start" : p === total - 1 ? 'See my estimate' : 'Continue';

        screens[which].classList.remove('wiz-enter');
        void screens[which].offsetWidth; // restart animation
        screens[which].classList.add('wiz-enter');

        if (scroll && root.getBoundingClientRect().top < 0) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    nextBtn.addEventListener('click', () => {
        const s = visibleSteps()[pos];
        const err = s && s.validate ? s.validate(state) : '';
        const errEl = $('[data-error]', screens.step);
        if (err) {
            if (errEl) {
                errEl.querySelector('span').textContent = err;
                errEl.classList.remove('hidden');
                errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        show(pos + 1);
    });
    backBtn.addEventListener('click', () => show(pos - 1));
    $$('[data-wiz-restart]').forEach((b) => b.addEventListener('click', () => show(-1)));
    $$('[data-wiz-back]').forEach((b) => b.addEventListener('click', () => show(visibleSteps().length - 1)));

    // ------------------------------------------------------------
    // Input events (delegated)
    // ------------------------------------------------------------
    screens.step.addEventListener('change', (e) => {
        const t = e.target;
        const f = fieldById[t.name];
        if (!f) return;
        if (f.type === 'multi') t.checked ? state[f.id].add(t.value) : state[f.id].delete(t.value);
        else if (f.type === 'toggle') state[f.id] = t.checked;
        else if (f.type === 'choice') state[f.id] = t.value;
        const errEl = $('[data-error]', screens.step);
        if (errEl) errEl.classList.add('hidden');
        // Options on this step may depend on each other (e.g. pattern vs tiles)
        if (f.rerender) {
            enforceRules();
            const y = window.scrollY;
            screens.step.innerHTML = renderStep(visibleSteps()[pos], pos + 1);
            $$('input[type="range"]', screens.step).forEach((el) => paintSlider(el, fieldById[el.name]));
            window.scrollTo(0, y);
        }
    });
    screens.step.addEventListener('input', (e) => {
        const t = e.target;
        const f = fieldById[t.name];
        if (!f || f.type !== 'slider') return;
        state[f.id] = parseFloat(t.value);
        const box = t.closest('[data-slider]');
        box.querySelector('[data-val]').textContent = sliderDisplay(f, state[f.id]);
        box.querySelector('[data-ticks]').innerHTML = ticks(f);
        const note = box.querySelector('[data-note] span:last-child');
        if (note) note.innerHTML = f.note(state[f.id], state);
        paintSlider(t, f);
    });

    // ------------------------------------------------------------
    // Results
    // ------------------------------------------------------------
    // 'compact' => $1.62M / $850k (low end rounded down, high end up); 'full' => $27,600
    const fmtLow = (n) => (cfg.money === 'full' ? money(Math.floor(n / 100) * 100) : short(n, 'down'));
    const fmtHigh = (n) => (cfg.money === 'full' ? money(Math.ceil(n / 100) * 100) : short(n, 'up'));

    function renderResult() {
        const r = compute();
        // A single figure (low === high) is shown on its own instead of as a range
        $('#res-range').innerHTML = Math.round(r.low) === Math.round(r.high)
            ? `<span class="text-white">${cfg.money === 'full' ? money(r.low) : short(r.low)}</span>`
            : `${fmtLow(r.low)} <span class="text-gray-500">–</span> <span class="text-sena-red">${fmtHigh(r.high)}</span>`;
        $('#res-sub').textContent = cfg.result.sub(label, state, r);
        $('#res-stats').innerHTML = cfg.result.stats(label, state, r).map(([v, l]) => `
            <div><p class="font-serif text-xl md:text-2xl font-bold text-white">${esc(v)}</p><p class="text-[10px] uppercase tracking-[0.18em] text-gray-400 mt-1">${esc(l)}</p></div>`).join('');
        if (cfg.perUnit && $('#res-per')) $('#res-per').textContent = `${short(r.low / cfg.perUnit, 'down')} – ${short(r.high / cfg.perUnit, 'up')}`;

        const rowsEl = $('#res-rows');
        if (rowsEl) {
            rowsEl.innerHTML = (r.rows || []).map((row) => `
                <li class="flex items-start justify-between gap-4 py-3 border-b border-white/10 last:border-0">
                    <span class="flex items-center gap-3 min-w-0"><span class="w-8 h-8 rounded-lg bg-white/10 text-sena-red flex items-center justify-center flex-shrink-0"><i class="fa-solid ${row.icon || 'fa-circle'} text-sm"></i></span><span class="font-medium text-white">${esc(row.label)}</span></span>
                    <span class="text-right font-semibold whitespace-nowrap text-white">${fmtLow(row.low)} – ${fmtHigh(row.high)}</span>
                </li>`).join('');
            rowsEl.closest('[data-rows-wrap]')?.classList.toggle('hidden', !(r.rows || []).length);
        }
        const notesEl = $('#res-notes');
        if (notesEl) {
            notesEl.innerHTML = (r.notes || []).map((n) => `
                <p class="flex gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-gray-700"><i class="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5"></i><span>${n}</span></p>`).join('');
        }

        const msg = $('#calc-message');
        if (msg) {
            const lines = [`${cfg.name}: ${Math.round(r.low) === Math.round(r.high) ? money(r.low) : `${money(r.low)} – ${money(r.high)}`}`];
            (r.rows || []).forEach((row) => lines.push(`  ${row.label}: ${money(row.low)} – ${money(row.high)}`));
            lines.push('');
            visibleSteps().forEach((s) => s.fields.forEach((f) => {
                const v = label(f.id);
                lines.push(`${f.summary || f.label || f.title}: ${Array.isArray(v) ? (v.join(', ') || 'None') : v}`);
            }));
            msg.value = lines.join('\n');
        }
    }

    show(-1, false);
})();
