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
  var best = 0, visible = false, last = 0, st, msg = DEATH[0];
  try { best = +localStorage.getItem('setasBest') || 0; } catch (e) {}
  bestEl.textContent = best;

  function reset() { st = { run: false, over: false, y: 0, vy: 0, t: 0, speed: 280, score: 0, obs: [], next: 1 }; }
  function jump() {
    if (st.over) { reset(); st.run = true; return; }
    st.run = true;
    if (st.y === 0) st.vy = 580;
  }
  function update(dt) {
    if (!st.run || st.over) return;
    st.t += dt;
    st.vy -= 1750 * dt; st.y += st.vy * dt;
    if (st.y <= 0) { st.y = 0; st.vy = 0; }
    st.speed = Math.min(540, st.speed + 7 * dt);
    st.score += st.speed * dt / 18;
    st.next -= dt;
    if (st.next <= 0) {
      st.obs.push({ x: W + 20, e: EMOJI[Math.floor(Math.random() * EMOJI.length)] });
      st.next = 0.85 + Math.random() * 0.9 + 60 / st.speed;
    }
    for (var i = st.obs.length - 1; i >= 0; i--) {
      var o = st.obs[i];
      o.x -= st.speed * dt;
      if (o.x < -40) { st.obs.splice(i, 1); continue; }
      // caja de la seta vs caja del obstáculo (con margen para ser justos)
      if (o.x + 5 < 60 + 28 && o.x + 25 > 60 + 6 && G - st.y > G - 26) die();
    }
    scoreEl.textContent = Math.floor(st.score);
  }
  function die() {
    st.over = true;
    msg = DEATH[Math.floor(Math.random() * DEATH.length)];
    var s = Math.floor(st.score);
    if (s > best) {
      best = s; bestEl.textContent = best;
      try { localStorage.setItem('setasBest', best); } catch (e) {}
    }
  }
  function mushroom(x, y) {
    var b = G - y, step = st.run && !st.over && y === 0 ? Math.floor(st.t * 10) % 2 : 0;
    ctx.lineWidth = 2; ctx.strokeStyle = '#2b1a07';
    ctx.fillStyle = '#f6eedb';
    ctx.beginPath(); ctx.roundRect(x + 9, b - 20, 16, 16, 4); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x + 11 + step * 2, b - 2, 5, 3, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x + 23 - step * 2, b - 2, 5, 3, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8a688';
    ctx.beginPath(); ctx.arc(x + 17, b - 19, 17, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fbf6ea';
    [[10, 27], [20, 31], [25, 24]].forEach(function (d) { ctx.beginPath(); ctx.arc(x + d[0], b - d[1], 2.2, 0, 7); ctx.fill(); });
    ctx.fillStyle = '#2b1a07';
    ctx.beginPath(); ctx.arc(x + 13, b - 13, 1.8, 0, 7); ctx.arc(x + 21, b - 13, 1.8, 0, 7); ctx.fill();
  }
  function draw() {
    ctx.fillStyle = '#fbf6ea'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#2b1a07'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, G + 2); ctx.lineTo(W, G + 2); ctx.stroke();
    ctx.strokeStyle = '#e3d6b4'; ctx.setLineDash([16, 14]); ctx.lineDashOffset = -st.t * st.speed;
    ctx.beginPath(); ctx.moveTo(0, G + 16); ctx.lineTo(W, G + 16); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '30px serif'; ctx.textBaseline = 'alphabetic';
    st.obs.forEach(function (o) { ctx.fillText(o.e, o.x, G); });
    mushroom(60, st.y);
    ctx.fillStyle = '#2b1a07'; ctx.textAlign = 'center'; ctx.font = '30px "Bebas Neue", Impact, sans-serif';
    if (st.over) {
      ctx.fillText(msg, W / 2, 80);
      ctx.font = '500 15px Jost, sans-serif'; ctx.fillText('toca para intentarlo otra vez', W / 2, 106);
    } else if (!st.run) {
      ctx.fillText('toca para empezar', W / 2, 80);
    }
    ctx.textAlign = 'left';
  }
  function loop(ts) {
    var dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
    if (visible) { update(dt); draw(); }
    requestAnimationFrame(loop);
  }
  cv.addEventListener('pointerdown', function (e) { e.preventDefault(); jump(); });
  document.addEventListener('keydown', function (e) {
    var tag = (document.activeElement || {}).tagName;
    if (!visible || /INPUT|SELECT|TEXTAREA|BUTTON|A/.test(tag || '')) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.4 }).observe(cv);
  } else { visible = true; }
  reset(); visible = true; draw(); visible = false;
  requestAnimationFrame(loop);
})();
