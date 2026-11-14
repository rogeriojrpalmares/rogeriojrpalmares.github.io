// rogeriopalmares.com
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year.
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Light the port LED for the section currently on screen.
  var nav = document.querySelector('.faceplate');
  if (nav && 'IntersectionObserver' in window) {
    var links = {};
    nav.querySelectorAll('a').forEach(function (a) {
      links[a.getAttribute('href').slice(1)] = a;
    });
    var order = Object.keys(links);
    var visible = new Set();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible.add(e.target.id); else visible.delete(e.target.id);
      });
      var current = order.find(function (id) { return visible.has(id); });
      order.forEach(function (id) {
        if (id === current) links[id].setAttribute('aria-current', 'true');
        else links[id].removeAttribute('aria-current');
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    order.forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  // Switch boot: ports test amber in sequence, then go green, once per page load.
  if (nav && !reduceMotion) {
    nav.classList.add('boot');
    window.setTimeout(function () { nav.classList.remove('boot'); }, 2200);
  }

  // Mark the nav once it is stuck to the top, so it can lift off the page.
  if (nav && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.className = 'stick-sentinel';
    nav.parentNode.insertBefore(sentinel, nav);
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('stuck', !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0);
    }).observe(sentinel);
  }

  // Panel lights follow the pointer across the hero.
  var backdrop = document.querySelector('.backdrop');
  if (backdrop && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    var target = null, pos = null, frame = 0;
    var step = function () {
      pos.x += (target.x - pos.x) * 0.14;
      pos.y += (target.y - pos.y) * 0.14;
      backdrop.style.setProperty('--mx', pos.x.toFixed(1) + 'px');
      backdrop.style.setProperty('--my', pos.y.toFixed(1) + 'px');
      var moving = Math.abs(target.x - pos.x) > 0.5 || Math.abs(target.y - pos.y) > 0.5;
      frame = moving ? window.requestAnimationFrame(step) : 0;
    };
    window.addEventListener('pointermove', function (e) {
      target = { x: e.pageX, y: e.pageY };
      if (!pos) pos = { x: target.x, y: target.y };
      if (!frame) frame = window.requestAnimationFrame(step);
    }, { passive: true });
  }

  // Copy the email address.
  document.querySelectorAll('.copy').forEach(function (button) {
    if (!navigator.clipboard) { button.hidden = true; return; }
    var label = button.textContent;
    button.addEventListener('click', function () {
      navigator.clipboard.writeText(button.dataset.copy).then(function () {
        button.textContent = 'Copied';
        button.classList.add('done');
        window.setTimeout(function () {
          button.textContent = label;
          button.classList.remove('done');
        }, 1800);
      }, function () {
        button.textContent = 'Copy failed. Select the address instead.';
      });
    });
  });
})();
