(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

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
    $('#tName').textContent = team[ti][0]; $('#tRole').textContent = team[ti][1];
  };
  layoutFan(); addEventListener('resize', layoutFan);
  const go = (d) => { ti = (ti + d + cards.length) % cards.length; layoutFan(); };
  $('#tNext').onclick = () => go(1); $('#tPrev').onclick = () => go(-1);


  /* ---------- entrance animations ---------- */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = innerWidth < 820;
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
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach((el) => io.observe(el));
  requestAnimationFrame(() => { $('#nav').classList.add('in'); $('#heroMedia').classList.add('in'); });

  /* ---------- smooth wheel scrolling ---------- */
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    let target = scrollY, current = scrollY, raf = 0;
    const max = () => document.documentElement.scrollHeight - innerHeight;
    const step = () => {
      current += (target - current) * 0.09;
      if (Math.abs(target - current) < 0.5) { current = target; raf = 0; } else raf = requestAnimationFrame(step);
      scrollTo({ top: current, behavior: 'instant' });
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
    addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.defaultPrevented) return;
      e.preventDefault();
      target = clamp(target + e.deltaY * (e.deltaMode === 1 ? 32 : 1), 0, max());
      kick();
    }, { passive: false });
    addEventListener('scroll', () => { if (!raf) target = current = scrollY; }, { passive: true });
    window.smoothTo = (y) => { target = clamp(y, 0, max()); kick(); };
  }

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault();
    const y = t.getBoundingClientRect().top + scrollY;
    window.smoothTo ? window.smoothTo(y) : scrollTo({ top: y, behavior: 'smooth' });
  }));
})();
