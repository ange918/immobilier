(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- illustrations (img/*.svg) ---------- */
  const rnd = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const photo = (name) => `url('img/${name}.jpg')`;
  const PHOTOS = ['office', 'friends', 'woman', 'man'];
  const img = (name) => `url('img/${name}.svg')`;

  $$('[data-art]').forEach((el) => (el.style.backgroundImage = img('house' + el.dataset.art)));

  /* ---------- culture rows ---------- */
  $$('.row').forEach((row, ri) => {
    let html = '';
    for (let i = 0; i < 18; i++)
      html += `<div class="polaroid" style="transform:rotate(${((i * 7 + ri * 3) % 7 - 3) * .8}deg)"><div style="background-image:${photo(PHOTOS[(i + ri * 2) % PHOTOS.length])};background-size:cover;background-repeat:no-repeat;background-position:${(i * 29 + ri * 41) % 100}% ${(i * 53 + ri * 17) % 100}%"></div></div>`;
    row.innerHTML = html;
  });

  /* ---------- hand-drawn skyline sketch ---------- */
  (() => {
    const r = rnd(42);
    let d = 'M0 60';
    for (let x = 0; x < 1200; x += 6) {
      const spike = Math.sin(x * .02) * 8 + r() * 26 * (r() > .85 ? 2 : 1);
      d += ` L${x} ${60 - spike}`;
    }
    $('#sk').setAttribute('d', d);
  })();

  /* ---------- testimonials ---------- */
  const T = [
    ['Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit. In Elementum, Sapien Vel Faucibus Sollicitudin, Arcu Risus Pharetra Mauris, Ornare Feugiat Eros Diam Non Risus. Quisque Fermentum Dolor Sapien, Sed Lacinia Arcu Gravida Sit Amet.', 'Grace Hopper, CTO', 'jpg:man'],
    ['In Elementum, Sapien Vel Faucibus Sollicitudin, Arcu Risus Pharetra Mauris, Ornare Feugiat Eros Diam Non Risus. Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit.', 'Grace Hopper, CTO', 'jpg:woman'],
  ];
  let ti = 0, tStart = performance.now();
  const showT = (i) => {
    ti = (i + T.length) % T.length; tStart = performance.now();
    $('#tText').style.opacity = 0;
    setTimeout(() => {
      $('#tText').textContent = T[ti][0]; $('#tWho').textContent = '— ' + T[ti][1];
      $('#tImg').style.backgroundImage = (T[ti][2].startsWith('jpg:') ? photo(T[ti][2].slice(4)) : img(T[ti][2])); $('#tText').style.opacity = 1;
    }, 250);
  };
  showT(0);
  $('#next').onclick = () => showT(ti + 1);
  $('#prev').onclick = () => showT(ti - 1);

  /* ---------- paper shader (WebGL overlay, multiply blended) ---------- */
  const cv = $('#paper');
  const gl = cv.getContext('webgl', { premultipliedAlpha: false });
  let U = {};
  if (gl) {
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}';
    const fs = `precision highp float;
uniform vec2 res;uniform float t,vel;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+7.1;a*=.5;}return s;}
// crumpled paper height: ridged noise gives sharp creases
float ht(vec2 p){float r=0.;float a=.5;for(int i=0;i<4;i++){r+=a*(1.-abs(2.*n(p)-1.));p=p*2.1+3.3;a*=.5;}return r;}
void main(){
 vec2 uv=gl_FragCoord.xy/res.y;
 float md=distance(gl_FragCoord.xy/res,m);
 vec2 q=uv*2.2;
 q+=vec2(0.,t*.03)+ .15*vel*vec2(0,1);
 float e=.004;
 float c=ht(q),dx=ht(q+vec2(e,0))-c,dy=ht(q+vec2(0,e))-c;
 vec3 nn=normalize(vec3(-dx*18.,-dy*18.,1.));
 vec3 L=normalize(vec3(-.5+(m.x-.5)*.6,.6+(m.y-.5)*.4,.8));
 float diff=dot(nn,L);
 float shade=.99+.06*(diff-.75)*3.;
 shade-=.03*smoothstep(.0,.6,fbm(uv*.8));
 shade-=.05*exp(-md*md*40.);
 shade-=clamp(abs(vel)*.5,0.,.12)*fbm(uv*6.);
 gl_FragColor=vec4(vec3(clamp(shade,.78,1.)),1.);
}`;
    const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr); gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['res', 't', 'vel', 'm'].forEach((k) => (U[k] = gl.getUniformLocation(pr, k)));
  } else cv.style.display = 'none';

  const resize = () => {
    const d = Math.min(devicePixelRatio, 1.5);
    cv.width = innerWidth * d * .75; cv.height = innerHeight * d * .75;
    gl && gl.viewport(0, 0, cv.width, cv.height);
  };
  addEventListener('resize', resize); resize();
  const mouse = { x: .5, y: .5, tx: .5, ty: .5 };
  addEventListener('pointermove', (e) => { mouse.tx = e.clientX / innerWidth; mouse.ty = 1 - e.clientY / innerHeight; });

  /* ---------- hero intro + scroll-driven effects ---------- */
  const world = $('#world'), block = $('#heroBlock'), word = $('.word');
  const marqs = $$('.marquee').map((el) => ({ el: el.firstElementChild, dir: +el.dataset.speed, x: 0 }));
  const rows = $$('.row').map((el) => ({ el, dir: +el.dataset.dir }));
  const cards = $$('.card');
  let vel = 0, last = scrollY, t0 = performance.now();

  function frame(now) {
    const y = scrollY, vh = innerHeight;
    vel = lerp(vel, (y - last) / vh * 6, .1); last = y;
    const v = clamp(vel, -1.2, 1.2);

    // page bend: skew + perspective tilt scaled by scroll velocity
    world.style.transform = `perspective(1400px) rotateX(${(-v * 3).toFixed(3)}deg) skewY(${(v * 1.6).toFixed(3)}deg) scaleY(${(1 + Math.abs(v) * .015).toFixed(4)})`;

    // hero block grows, wipes into the dark section
    const p = clamp(y / (vh * .9));
    const e = p * p * (3 - 2 * p);
    block.style.transform = `translate(${e * -30}vw,${e * 60}vh) scale(${1 + e * 9})`;
    word.style.transform = `translate(${e * 4}vw,${e * -18}vh)`;

    // marquees
    marqs.forEach((m) => {
      m.x += (m.dir * .6 + v * 6 * m.dir);
      const w = m.el.scrollWidth / 2; if (Math.abs(m.x) > w) m.x = 0;
      m.el.style.transform = `translateX(${m.x - (m.dir > 0 ? w : 0)}px)`;
    });

    // culture rows slide opposite ways with scroll
    rows.forEach((r, i) => {
      const rect = r.el.getBoundingClientRect();
      const prog = (rect.top - vh) / vh;
      r.el.style.transform = `translateX(${(-prog * 140 * r.dir) - (r.dir > 0 ? 400 : 0)}px)`;
    });

    // cards: parallax + bend according to viewport position
    cards.forEach((c, i) => {
      const rect = c.getBoundingClientRect();
      const k = clamp((rect.top + rect.height / 2 - vh / 2) / vh, -1, 1);
      c.style.transform = `translateY(${k * (i % 2 ? -50 : 40)}px) rotate(${k * (i % 2 ? 2 : -2) + v * 2}deg) skewY(${v * 2}deg)`;
    });

    // testimonial progress & autoplay
    const tp = (now - tStart) / 6000;
    $('#bar').style.width = clamp(tp) * 100 + '%';
    if (tp >= 1) showT(ti + 1);

    // shader
    mouse.x = lerp(mouse.x, mouse.tx, .08); mouse.y = lerp(mouse.y, mouse.ty, .08);
    if (gl) {
      gl.uniform2f(U.res, cv.width, cv.height); gl.uniform1f(U.t, (now - t0) / 1000);
      gl.uniform1f(U.vel, v); gl.uniform2f(U.m, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (ev) => {
    const t = $(a.getAttribute('href')); if (!t) return;
    ev.preventDefault(); t.scrollIntoView({ behavior: 'smooth' });
  }));
})();
