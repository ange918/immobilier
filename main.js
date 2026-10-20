(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$('.s, .posts article, #stats div, .h2, .eyebrow, .eyebrow-o, .hero-copy > *');
  revealEls.forEach((el, i) => el.classList.add('rv'));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.style.transitionDelay = (e.target.dataset.d || 0) + 'ms'; e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.svc .s, .posts article, #stats div').forEach((el, i) => (el.dataset.d = (i % 4) * 110));
  $$('.hero-copy > *').forEach((el, i) => (el.dataset.d = 250 + i * 140));
  revealEls.forEach((el) => io.observe(el));

  /* ---------- statement: words light up with scroll ---------- */
  const st = $('#statement');
  st.innerHTML = st.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  const words = $$('.w', st);

  /* ---------- nav: solid after hero, hides on scroll down ---------- */
  const nav = $('#nav');
  let lastY = scrollY;

  /* ---------- selected works carousel ---------- */
  const track = $('#track'), items = $$('.w', track);
  let wi = 0;
  const placeTrack = () => {
    const w = items[0].offsetWidth, gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const x = innerWidth * .5 - w * .5 - wi * (w + gap);
    track.style.transform = `translateX(${x}px)`;
    items.forEach((it, i) => it.classList.toggle('on', i === wi));
  };
  placeTrack(); addEventListener('resize', placeTrack);
  let workTimer = setInterval(() => { wi = (wi + 1) % items.length; placeTrack(); }, 4200);
  items.forEach((it, i) => it.addEventListener('click', () => { wi = i; placeTrack(); clearInterval(workTimer); }));
  let dragX = null;
  const car = $('#car');
  car.addEventListener('pointerdown', (e) => (dragX = e.clientX));
  addEventListener('pointerup', (e) => {
    if (dragX === null) return;
    const dx = e.clientX - dragX; dragX = null;
    if (Math.abs(dx) > 50) { wi = clamp(wi + (dx < 0 ? 1 : -1), 0, items.length - 1); placeTrack(); clearInterval(workTimer); }
  });

  /* ---------- team fan carousel ---------- */
  const cards = $$('.card', $('#fan'));
  const team = [['Tomas Reid', 'Founder, Strategy Director'], ['Mara Ito', 'Creative Director'], ['Jules Okoye', 'Head of Design'], ['Sam Varga', 'Lead Engineer'], ['Noor Haddad', 'Producer']];
  let ti = 0;
  const R = () => innerWidth * .6, STEP = 28 * Math.PI / 180;
  const layoutFan = () => {
    const r = Math.min(R(), 820);
    cards.forEach((c, i) => {
      let d = i - ti; const n = cards.length;
      if (d > n / 2) d -= n; if (d < -n / 2) d += n;
      const a = d * STEP, w = c.offsetWidth;
      const x = Math.sin(a) * r - w / 2, y = (1 - Math.cos(a)) * r;
      c.style.transform = `translate(${x}px, ${y}px) rotate(${a}rad)`;
      c.style.opacity = Math.abs(d) > 2 ? 0 : 1;
      c.style.zIndex = 10 - Math.abs(d);
    });
    $('#tName').textContent = team[ti][0]; $('#tRole').textContent = team[ti][1];
  };
  layoutFan(); addEventListener('resize', layoutFan);
  const go = (d) => { ti = (ti + d + cards.length) % cards.length; layoutFan(); };
  $('#tNext').onclick = () => go(1); $('#tPrev').onclick = () => go(-1);
  setInterval(() => go(1), 5200);

  /* ---------- scroll loop ---------- */
  const hm = $('#heroMedia'), hero = $('#hero'), copy = $('.hero-copy');
  function tick() {
    const y = scrollY, vh = innerHeight;
    // hero parallax + fade of copy
    if (y < vh * 1.2) {
      hm.style.transform = `translate3d(0,${y * .22}px,0) scale(${1 + y / vh * .08})`;
      copy.style.transform = `translate3d(0,${y * -.12}px,0)`;
      copy.style.opacity = clamp(1 - y / (vh * .75));
    }
    // statement progress
    const r = st.getBoundingClientRect();
    const p = clamp((vh * .85 - r.top) / (vh * .55 + r.height * .4));
    words.forEach((w, i) => {
      const t = clamp(p * words.length * 1.15 - i, 0, 1);
      const v = Math.round(lerp(58, 255, t));
      w.style.color = `rgb(${v},${v},${v})`;
    });
    // services depth
    $$('.s .ph').forEach((el, i) => {
      const b = el.getBoundingClientRect();
      const k = (b.top + b.height / 2 - vh / 2) / vh;
      el.style.transform = `translateY(${k * (i === 1 ? -26 : 18)}px)`;
    });
    // nav
    nav.classList.toggle('solid', y > vh * .6);
    nav.classList.toggle('hide', y > lastY && y > vh * .9);
    if (y < lastY) nav.classList.remove('hide');
    lastY = y;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' });
  }));
})();
