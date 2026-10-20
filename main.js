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

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' });
  }));
})();
