/* Fomina.Designs — інтерактив сайту.
   Три речі: мобільне меню, поява блоків при скролі, прев'ю кейсів за курсором. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- мобільне меню ----------------------------------------------------- */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Закрити' : 'Меню';
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Меню';
      }
    });
  }

  /* --- поява блоків при скролі ------------------------------------------- */
  var targets = document.querySelectorAll('.section .wrap > *');

  if (!reduceMotion && 'IntersectionObserver' in window) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('reveal'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* --- прев'ю кейсу за курсором ------------------------------------------ */
  var preview = document.getElementById('casePreview');
  var cases = document.querySelectorAll('.case[data-preview]');

  // тільки для пристроїв зі справжнім курсором — на тачі ховера немає
  var hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (preview && cases.length && hasHover && !reduceMotion) {
    var img = preview.querySelector('img');
    var x = 0, y = 0, ticking = false;

    function place() {
      preview.style.setProperty('--x', x + 'px');
      preview.style.setProperty('--y', y + 'px');
      ticking = false;
    }

    function onMove(e) {
      // зсув від курсора, щоб прев'ю не перекривало саму назву
      x = e.clientX + 40;
      y = e.clientY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(place);
      }
    }

    Array.prototype.forEach.call(cases, function (link) {
      var src = link.getAttribute('data-preview');

      // підвантажуємо картинку заздалегідь, щоб прев'ю не блимало порожнім
      var pre = new Image();
      pre.src = src;

      link.addEventListener('mouseenter', function (e) {
        img.src = src;
        img.alt = '';
        onMove(e);
        preview.classList.add('on');
      });

      link.addEventListener('mousemove', onMove);

      link.addEventListener('mouseleave', function () {
        preview.classList.remove('on');
      });
    });

    // Ховати прев'ю на scroll не можна: через scroll-behavior:smooth
    // залишковий рух сторінки гасив би його одразу після появи,
    // а на тачпаді воно б блимало. Коли рядок їде з-під курсора,
    // mouseleave спрацьовує сам.
  }

  /* --- горизонтальна доріжка робіт --------------------------------------- */
  var track = document.getElementById('worksTrack');
  var prev = document.getElementById('worksPrev');
  var next = document.getElementById('worksNext');

  if (track) {
    // на скільки гортати стрілкою — ширина картки разом із проміжком
    function step() {
      var card = track.querySelector('.work');
      if (!card) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 16;
      return card.getBoundingClientRect().width + gap;
    }

    function scrollBy(dir) {
      track.scrollBy({
        left: dir * step() * 2,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    }

    if (prev) prev.addEventListener('click', function () { scrollBy(-1); });
    if (next) next.addEventListener('click', function () { scrollBy(1); });

    // гасимо стрілку, коли доїхали до краю
    function syncArrows() {
      if (!prev || !next) return;
      var max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
    }
    track.addEventListener('scroll', syncArrows, { passive: true });
    window.addEventListener('resize', syncArrows);
    syncArrows();

    // перетягування мишкою
    var down = false, startX = 0, startLeft = 0, moved = 0;

    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return; // палець гортає сам
      down = true; moved = 0;
      startX = e.clientX;
      startLeft = track.scrollLeft;
      track.classList.add('dragging');
    });

    track.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      if (moved > 3) track.setPointerCapture(e.pointerId);
      track.scrollLeft = startLeft - dx;
    });

    function endDrag() {
      if (!down) return;
      down = false;
      track.classList.remove('dragging');
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    // якщо картку тягнули, а не клацнули — не відкриваємо посилання
    track.addEventListener('click', function (e) {
      if (moved > 5) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }
})();
