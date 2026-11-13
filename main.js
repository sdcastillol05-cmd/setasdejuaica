(function () {
  'use strict';

  // Cambia por el número real (código de país + número, sin + ni espacios)
  var WHATSAPP = '520000000000';

  // Si falta un SVG del personaje, no mostrar el icono roto
  document.querySelectorAll('img[data-leon]').forEach(function (img) {
    img.addEventListener('error', function () { img.style.visibility = 'hidden'; });
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
