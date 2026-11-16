(function () {
  'use strict';

  // Cambia por el número real (código de país + número, sin + ni espacios)
  var WHATSAPP = '573123932209';

  // Si falta un SVG del personaje, no mostrar el icono roto
  document.querySelectorAll('img[data-leon], img.sticker, img.logo').forEach(function (img) {
    img.addEventListener('error', function () {
      // logo faltante: mostrar el nombre en texto; el resto se oculta
      if (img.classList.contains('logo') && img.alt) {
        var t = document.createElement('strong');
        t.textContent = img.alt;
        t.style.cssText = 'font:400 28px var(--f-display);letter-spacing:.06em;text-transform:uppercase';
        img.replaceWith(t);
      } else { img.style.visibility = 'hidden'; }
    });
  });

  // Menú móvil
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // El león asoma una sola vez al entrar en pantalla
  var peeks = document.querySelectorAll('.peek');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    peeks.forEach(function (p) { io.observe(p); });
  } else {
    peeks.forEach(function (p) { p.classList.add('in'); });
  }

  // Pedido por WhatsApp
  var form = document.getElementById('orderForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var cant = (d.get('cantidad') || '').toString().trim();
      var msg = 'Hola, Setas de Juaica. Quiero hacer un pedido.\n' +
        'Producto: ' + d.get('producto') + '\n' +
        'Compra: ' + d.get('modo') + '\n' +
        'Cantidad: ' + (cant || 'por definir');
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();


/* Minijuego: una seta que salta cosas de cocina */
(function () {
  'use strict';
  var cv = document.getElementById('game');
  if (!cv) return;
  var ctx = cv.getContext('2d'), W = cv.width, H = cv.height, G = H - 36;
  var scoreEl = document.getElementById('score'), bestEl = document.getElementById('best');
  var EMOJI = ['🍴', '🍳', '🧄', '🥄'];
  var DEATH = ['¡Te salteamos!', 'Quedaste al ajillo', '¡Directo a la sartén!', 'Te quedaste crudo'];
  var PRIZE_AT = 3000;
  var best = 0, visible = false, last = 0, st, msg = DEATH[0];
  try { best = +localStorage.getItem('setasBest') || 0; } catch (e) {}
  bestEl.textContent = best;

  function reset() {
    st = { run: false, over: false, won: false, claimed: false, y: 0, vy: 0, t: 0, dist: 0, speed: 280,
           score: 0, obs: [], next: 1, ufo: null, ufoNext: 5 + Math.random() * 6 };
  }
  function jump() {
    if (st.won) { st.won = false; st.claimed = true; return; }   // seguir jugando tras el premio
    if (st.over) { reset(); st.run = true; return; }
    st.run = true;
    if (st.y === 0) st.vy = 580;
  }
  function update(dt) {
    if (!st.run || st.over || st.won) return;
    st.t += dt; st.dist += st.speed * dt;
    st.vy -= 1750 * dt; st.y += st.vy * dt;
    if (st.y <= 0) { st.y = 0; st.vy = 0; }
    st.speed = Math.min(540, st.speed + 7 * dt);
    st.score += st.speed * dt / 14;
    st.next -= dt;
    if (st.next <= 0) {
      st.obs.push({ x: W + 20, e: EMOJI[Math.floor(Math.random() * EMOJI.length)] });
      st.next = 0.85 + Math.random() * 0.9 + 60 / st.speed;
    }
    for (var i = st.obs.length - 1; i >= 0; i--) {
      var o = st.obs[i];
      o.x -= st.speed * dt;
      if (o.x < -40) { st.obs.splice(i, 1); continue; }
      if (o.x + 5 < 88 && o.x + 25 > 66 && st.y < 24) die();
    }
    // ovni ocasional
    st.ufoNext -= dt;
    if (!st.ufo && st.ufoNext <= 0) { st.ufo = { x: W + 40, y: 28 + Math.random() * 26, ph: 0 }; st.ufoNext = 9 + Math.random() * 10; }
    if (st.ufo) { st.ufo.x -= 95 * dt; st.ufo.ph += dt * 3; if (st.ufo.x < -50) st.ufo = null; }
    scoreEl.textContent = Math.floor(st.score);
    if (!st.claimed && st.score >= PRIZE_AT) { st.won = true; save(); }
  }
  function save() {
    var s = Math.floor(st.score);
    if (s > best) { best = s; bestEl.textContent = best; try { localStorage.setItem('setasBest', best); } catch (e) {} }
  }
  function die() { st.over = true; msg = DEATH[Math.floor(Math.random() * DEATH.length)]; save(); }

  // fondo: montañas y árboles en líneas simples, con parallax
  function scenery() {
    var P = 480, off = (st.dist * 0.08) % P, k;
    ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = '#e0d2ac';
    var m = [[0,0],[55,-48],[95,-22],[160,-78],[215,-30],[270,-52],[330,-12],[390,-58],[435,-26],[480,0]];
    for (k = 0; k < 3; k++) {
      ctx.beginPath();
      m.forEach(function (p, i) { var X = k * P + p[0] - off, Y = G - 6 + p[1]; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
      ctx.stroke();
    }
    var off2 = (st.dist * 0.3) % 300, pos = [25, 90, 160, 235], sc = [1, 0.7, 0.9, 0.6];
    ctx.strokeStyle = '#cfc09a'; ctx.fillStyle = '#fbf6ea';
    for (k = 0; k < 4; k++) pos.forEach(function (p, i) {
      var X = k * 300 + p - off2, s = sc[i], b = G + 1;
      ctx.beginPath(); ctx.moveTo(X, b); ctx.lineTo(X, b - 9 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X - 13 * s, b - 9 * s); ctx.lineTo(X, b - 34 * s); ctx.lineTo(X + 13 * s, b - 9 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X - 10 * s, b - 24 * s); ctx.lineTo(X, b - 46 * s); ctx.lineTo(X + 10 * s, b - 24 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
    });
    if (st.ufo) {
      var u = st.ufo, y = u.y + Math.sin(u.ph) * 4;
      ctx.strokeStyle = '#9c8a62'; ctx.fillStyle = '#fbf6ea'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(u.x, y - 3, 9, Math.PI, 0); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(u.x, y, 20, 6, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e8a688';
      [-10, 0, 10].forEach(function (d) { ctx.beginPath(); ctx.arc(u.x + d, y + 1, 1.6, 0, 7); ctx.fill(); });
    }
  }
  function mushroom(x, y) {
    var b = G - y, air = y > 0, run = st.run && !st.over && !st.won;
    var s = run && !air ? Math.floor(st.t * 9) % 2 : 0;
    var lx = air ? [-3, 4] : (s ? [-4, 5] : [5, -4]), ly = air ? [-3, -6] : (s ? [0, -4] : [-4, 0]);
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#2b1a07'; ctx.fillStyle = '#f6eedb';
    [13, 21].forEach(function (hx, i) {            // patas largas
      ctx.beginPath(); ctx.moveTo(x + hx, b - 17); ctx.lineTo(x + hx + lx[i], b + ly[i]); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x + hx + lx[i] + 2, b + ly[i], 4, 2.5, 0, 0, 7); ctx.fill(); ctx.stroke();
    });
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x + 9, b - 38, 16, 22, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8a688';
    ctx.beginPath(); ctx.arc(x + 17, b - 36, 18, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fbf6ea';
    [[10, -44], [21, -49], [26, -41]].forEach(function (d) { ctx.beginPath(); ctx.arc(x + d[0], b + d[1], 2.2, 0, 7); ctx.fill(); });
    ctx.fillStyle = '#2b1a07';
    ctx.beginPath(); ctx.arc(x + 13, b - 29, 1.8, 0, 7); ctx.arc(x + 21, b - 29, 1.8, 0, 7); ctx.fill();
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + 17, b - 26, 3, 0.2, Math.PI - 0.2); ctx.stroke();
  }
  function panel(x, y, w, h) {
    ctx.fillStyle = 'rgba(251,246,234,.94)'; ctx.strokeStyle = '#2b1a07'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2b1a07'; ctx.textAlign = 'center';
  }
  function draw() {
    ctx.fillStyle = '#fbf6ea'; ctx.fillRect(0, 0, W, H);
    scenery();
    ctx.strokeStyle = '#2b1a07'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, G + 2); ctx.lineTo(W, G + 2); ctx.stroke();
    ctx.strokeStyle = '#e3d6b4'; ctx.setLineDash([16, 14]); ctx.lineDashOffset = -st.dist;
    ctx.beginPath(); ctx.moveTo(0, G + 16); ctx.lineTo(W, G + 16); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '30px serif'; ctx.textBaseline = 'alphabetic';
    st.obs.forEach(function (o) { ctx.fillText(o.e, o.x, G); });
    mushroom(60, st.y);
    if (st.won) {
      panel(60, 20, W - 120, 132);
      ctx.font = '32px "Bebas Neue", Impact, sans-serif'; ctx.fillText('¡Seta, ganaste un 10% de descuento!', W / 2, 56);
      ctx.font = '500 15px Jost, sans-serif'; ctx.fillText('en tu próxima compra. Muestra una captura con tu puntaje.', W / 2, 82);
      ctx.fillStyle = '#8e1b3a'; ctx.font = '30px "Bebas Neue", Impact, sans-serif'; ctx.fillText('Puntaje: ' + Math.floor(st.score), W / 2, 116);
      ctx.fillStyle = '#2b1a07'; ctx.font = '500 13px Jost, sans-serif'; ctx.fillText('toca para seguir jugando', W / 2, 139);
    } else if (st.over) {
      panel(190, 34, W - 380, 86);
      ctx.font = '32px "Bebas Neue", Impact, sans-serif'; ctx.fillText(msg, W / 2, 74);
      ctx.font = '500 15px Jost, sans-serif'; ctx.fillText('toca para intentarlo otra vez', W / 2, 102);
    } else if (!st.run) {
      panel(220, 40, W - 440, 56);
      ctx.font = '30px "Bebas Neue", Impact, sans-serif'; ctx.fillText('toca para empezar', W / 2, 78);
    }
    ctx.textAlign = 'left';
  }
  function loop(ts) {
    var dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
    if (visible) { update(dt); draw(); }
    requestAnimationFrame(loop);
  }
  function drawOnce() { var v = visible; visible = true; draw(); visible = v; }
  cv.addEventListener('pointerdown', function (e) { e.preventDefault(); jump(); });
  document.addEventListener('keydown', function (e) {
    var tag = (document.activeElement || {}).tagName;
    if (!visible || /INPUT|SELECT|TEXTAREA|BUTTON|A/.test(tag || '')) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.4 }).observe(cv);
  } else { visible = true; }
  reset(); drawOnce();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawOnce);
  requestAnimationFrame(loop);
})();
