(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- language (English source text, French dictionary in i18n.js) ---------- */
  const FR = window.I18N_FR || {};
  let lang = 'en';
  const t = (s) => (lang === 'fr' && FR[s]) || s;
  const EN_TITLE = document.title;

  /* ---------- selected works carousel ---------- */
  const track = $('#track'), items = $$('.w', track), car = $('#car');
  let wi = 1;
  const placeTrack = () => {
    const w = items[0].offsetWidth, gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.style.transform = `translateX(${innerWidth * .5 - w * .5 - wi * (w + gap)}px)`;
    items.forEach((it, i) => it.classList.toggle('on', i === wi));
  };
  placeTrack(); addEventListener('resize', placeTrack);
  const goWork = (i) => { wi = clamp(i, 0, items.length - 1); placeTrack(); };
  items.forEach((it, i) => it.addEventListener('click', () => goWork(i)));
  let dragX = null;
  car.addEventListener('pointerdown', (e) => (dragX = e.clientX));
  addEventListener('pointerup', (e) => {
    if (dragX === null) return;
    const dx = e.clientX - dragX; dragX = null;
    if (Math.abs(dx) > 50) goWork(wi + (dx < 0 ? 1 : -1));
  });

  /* ---------- team fan carousel ---------- */
  const cards = $$('.card', $('#fan'));
  const team = [['Tomas Reid', 'Founder, Strategy Director'], ['Mara Ito', 'Creative Director'], ['Jules Okoye', 'Head of Design'], ['Sam Varga', 'Lead Engineer'], ['Noor Haddad', 'Producer']];
  const STEP = 30 * Math.PI / 180;
  let ti = 0;
  const layoutFan = () => {
    const r = innerWidth * (742 / 1280) * (innerWidth < 820 ? 1.6 : 1);
    cards.forEach((c, i) => {
      let d = i - ti; const n = cards.length;
      if (d > n / 2) d -= n; if (d < -n / 2) d += n;
      const a = d * STEP, w = c.offsetWidth;
      c.style.transform = `translate(${Math.sin(a) * r - w / 2}px, ${(1 - Math.cos(a)) * r}px) rotate(${a}rad)`;
      c.style.opacity = Math.abs(d) > 2 ? 0 : 1;
      c.style.zIndex = 10 - Math.abs(d);
      c.classList.toggle('dim', d !== 0);
    });
    $('#tName').textContent = team[ti][0]; $('#tRole').textContent = t(team[ti][1]);
  };
  layoutFan(); addEventListener('resize', layoutFan);
  const go = (d) => { ti = (ti + d + cards.length) % cards.length; layoutFan(); };
  $('#tNext').onclick = () => go(1); $('#tPrev').onclick = () => go(-1);


  /* ---------- scroll bus: Lenis with the same settings as the cap repo ---------- */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = innerWidth < 820;
  const listeners = new Set();
  const onScroll = (fn) => { listeners.add(fn); fn(); };
  const emit = () => listeners.forEach((fn) => fn());
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, anchors: true });
    lenis.on('scroll', emit);
    requestAnimationFrame(function loop(t) { lenis.raf(t); requestAnimationFrame(loop); });
  } else {
    let f = 0;
    addEventListener('scroll', () => { cancelAnimationFrame(f); f = requestAnimationFrame(emit); }, { passive: true });
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' });
    }));
  }
  addEventListener('resize', emit);

  /* ---------- scroll progress bar ---------- */
  const bar = $('#progress');
  onScroll(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  });

  /* ---------- rise: fade, lift and un-blur when an element enters ---------- */
  const mark = (sel, { step = 0.1, base = 0, cls = '' } = {}) =>
    $$(sel).forEach((el, i) => { el.classList.add('rv'); if (cls) el.classList.add(cls); el.style.setProperty('--d', `${base + i * step}s`); });
  mark('#hero h1 .l1, #hero h1 .l2', { step: 0.14, base: 0.35, cls: 'rv-big' });
  mark('.eyebrow-hero', { base: 0.2 });
  mark('.hero-row', { base: 0.75 });
  mark('.eyebrow, .eyebrow-o');
  mark('.h2', { base: 0.08, cls: 'rv-big' });
  mark(mobile ? '#statement' : '#statement span', { step: 0.12, base: 0.1 });
  mark('.about-foot > *', { step: 0.12 });
  mark('.svc .s', { step: 0.14, base: 0.1 });
  mark('#car', { base: 0.15 });
  mark('.c', { step: 0.14, base: 0.1, cls: 'rv-scale' });
  mark('.fan, .who, .arrows', { step: 0.12, base: 0.1 });
  mark('#stats > div', { step: 0.1 });
  mark('.posts article', { step: 0.14, base: 0.1 });
  mark('.fgrid > *', { step: 0.1 });
  mark('.giant', { base: 0.1 });
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach((el) => io.observe(el));
  requestAnimationFrame(() => { $('#nav').classList.add('in'); $('#heroMedia').classList.add('in'); });

  /* ---------- image parallax: each picture drifts inside its frame ---------- */
  const frames = $$('.ph').map((ph) => {
    const bg = document.createElement('div');
    bg.className = 'ph-bg';
    bg.style.backgroundImage = ph.style.backgroundImage;
    bg.style.backgroundPosition = ph.style.backgroundPosition;
    bg.style.backgroundSize = ph.style.backgroundSize;
    ph.style.backgroundImage = ''; ph.style.backgroundPosition = ''; ph.style.backgroundSize = '';
    ph.appendChild(bg);
    return { ph, bg };
  });
  if (!reduce) onScroll(() => {
    const vh = innerHeight;
    frames.forEach(({ ph, bg }) => {
      const r = ph.getBoundingClientRect();
      if (r.bottom < -vh * 0.2 || r.top > vh * 1.2) return;
      const p = (vh - r.top) / (vh + r.height);
      bg.style.transform = `translate3d(0, ${((p - 0.5) * 36).toFixed(2)}px, 0) scale(1.08)`;
    });
  });

  /* ---------- step edge: bars rise at the bottom of Selected Works as Work Process arrives ---------- */
  const edge = $('#stepEdge'), proc = $('#process');
  onScroll(() => {
    if (reduce) { edge.style.setProperty('--p', '1'); return; }
    const p = clamp((innerHeight - proc.getBoundingClientRect().top) / (innerHeight * 0.72));
    edge.style.setProperty('--p', p.toFixed(4));
  });

  /* ---------- count-up: the four figures count while they scroll in (English and French forms) ---------- */
  $$('#stats b').forEach((el) => {
    const parse = (s) => {
      const m = s.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
      return m && { pre: m[1], to: parseFloat(m[2].replace(',', '.')), dec: (m[2].split(/[.,]/)[1] || '').length, post: m[3] };
    };
    const forms = { en: parse(el.textContent), fr: parse(el.dataset.fr || el.textContent) };
    onScroll(() => {
      const f = forms[lang] || forms.en;
      if (!f) return;
      const r = el.getBoundingClientRect(), vh = innerHeight;
      const p = reduce ? 1 : clamp((vh * 1.02 - r.top) / (vh * 0.62));
      let v = (f.to * (1 - (1 - p) ** 2)).toFixed(f.dec);
      if (lang === 'fr') v = v.replace('.', ',');
      const out = f.pre + v + f.post;
      if (el.textContent !== out) el.textContent = out;
    });
  });

  /* ---------- menu ---------- */
  const burger = $('.burger'), wrap = $('#menuWrap');
  const setMenu = (open) => {
    wrap.hidden = !open; burger.setAttribute('aria-expanded', String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener('click', () => setMenu(wrap.hidden));
  $('.menu-scrim').addEventListener('click', () => setMenu(false));
  $$('#menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !wrap.hidden) setMenu(false); });
  /* ---------- language switch ---------- */
  const applyLang = (l) => {
    lang = l;
    document.documentElement.lang = l;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && n.nodeValue.trim() && !n.parentElement.closest('script, style, #stats b') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    for (let n; (n = walker.nextNode());) {
      if (n.__en === undefined) n.__en = n.nodeValue;
      const k = n.__en.trim();
      n.nodeValue = l === 'fr' && FR[k] ? n.__en.replace(k, FR[k]) : n.__en;
    }
    $$('input[placeholder]').forEach((i) => { i.dataset.en = i.dataset.en || i.placeholder; i.placeholder = t(i.dataset.en); });
    $('#lang').textContent = l === 'fr' ? 'EN' : 'FR';
    document.title = l === 'fr' ? 'StudioNorth — Nous les rendons prêts à convertir' : EN_TITLE;
    try { localStorage.setItem('lang', l); } catch (e) {}
    layoutFan();
    emit();
  };
  $('#lang').addEventListener('click', () => applyLang(lang === 'fr' ? 'en' : 'fr'));
  let start = 'en';
  try { start = new URLSearchParams(location.search).get('lang') || localStorage.getItem('lang') || 'en'; } catch (e) {}
  if (start === 'fr') applyLang('fr');
})();
