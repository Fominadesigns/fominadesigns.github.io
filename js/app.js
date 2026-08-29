/* Fomina.Designs — інтерактив сайту.
   Мобільне меню, поява блоків, прев'ю кейсів, закріплена галерея робіт. */
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
    var px = 0, py = 0, pticking = false;

    function place() {
      preview.style.setProperty('--x', px + 'px');
      preview.style.setProperty('--y', py + 'px');
      pticking = false;
    }

    function onMove(e) {
      // зсув від курсора, щоб прев'ю не перекривало саму назву
      px = e.clientX + 40;
      py = e.clientY;
      if (!pticking) {
        pticking = true;
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

  /* --- роботи: закріплена горизонтальна прокрутка -------------------------

     Прокрутку сторінки НЕ перехоплюємо. Секція просто вища за екран,
     всередині неї закріплена сцена, а доріжку зсуваємо рівно на стільки,
     скільки сторінки вже пройдено. Тому смуга прокрутки, клавіатура,
     Home/End та інерція тачпада поводяться як завжди.                      */

  var section = document.getElementById('gallery');
  var wrap = document.getElementById('worksWrap');
  var viewport = document.getElementById('worksViewport');
  var track = document.getElementById('worksTrack');
  var bar = document.getElementById('worksBar');

  if (section && wrap && viewport && track) {
    var distance = 0;
    var pinned = false;
    var frame = 0;

    function disable() {
      pinned = false;
      section.classList.remove('works--pinned');
      wrap.style.height = '';
      track.style.transform = '';
    }

    function update() {
      if (!pinned) return;
      var top = wrap.getBoundingClientRect().top;
      var total = wrap.offsetHeight - window.innerHeight;
      var p = total > 0 ? -top / total : 0;
      if (p < 0) { p = 0; }
      if (p > 1) { p = 1; }
      track.style.transform = 'translate3d(' + (-p * distance).toFixed(1) + 'px, 0, 0)';
      if (bar) { bar.style.width = (p * 100).toFixed(1) + '%'; }
    }

    function measure() {
      // На вузьких екранах і за увімкненого зменшення руху лишаємо звичайну
      // горизонтальну прокрутку — там закріплення радше заважає.
      if (reduceMotion || window.innerWidth < 861) { disable(); return; }

      // Міряємо у вимкненому стані, щоб дістати справжню ширину доріжки.
      section.classList.remove('works--pinned');
      wrap.style.height = '';
      track.style.transform = '';

      var overflow = track.scrollWidth - viewport.clientWidth;
      if (overflow <= 40) { disable(); return; }

      distance = overflow;
      pinned = true;
      section.classList.add('works--pinned');
      // висота секції = екран + шлях, який має проїхати доріжка
      wrap.style.height = (window.innerHeight + distance) + 'px';
      update();
    }

    function onScroll() {
      if (frame) { return; }
      frame = requestAnimationFrame(function () { frame = 0; update(); });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);

    // Картинки ліниві: доки вони не завантажились, ширина доріжки неправильна,
    // тому переміряємо і після повного завантаження сторінки.
    window.addEventListener('load', measure);
    measure();
  }
})();
