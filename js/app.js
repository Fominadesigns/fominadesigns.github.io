/* Fomina.Designs — інтерактив сайту.
   Меню, курсор, картка кейсу за мишею, перегляд на весь екран, дрібні ефекти. */
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

  /* --- повноекранне меню -------------------------------------------------- */
  var burger = document.getElementById('burger');
  var menuBox = document.getElementById('menu');

  if (burger && menuBox) {
    var menuLinks = menuBox.querySelectorAll('.menu__list a');
    var lastFocus = null;

    function openMenu() {
      lastFocus = document.activeElement;
      menuBox.hidden = false;
      // сходинка появи для кожного пункту
      Array.prototype.forEach.call(menuLinks, function (a, i) {
        a.style.transitionDelay = (0.06 * i + 0.08) + 's';
      });
      void menuBox.offsetWidth;
      menuBox.classList.add('on');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Закрити меню');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menuBox.classList.remove('on');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Відкрити меню');
      document.body.style.overflow = '';
      Array.prototype.forEach.call(menuLinks, function (a) { a.style.transitionDelay = '0s'; });
      setTimeout(function () { menuBox.hidden = true; }, 400);
      if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
    }

    burger.addEventListener('click', function () {
      if (menuBox.hidden) { openMenu(); } else { closeMenu(); }
    });

    var menuClose = document.getElementById('menuClose');
    if (menuClose) { menuClose.addEventListener('click', closeMenu); }

    menuBox.addEventListener('click', function (e) {
      if (e.target.closest('a')) { closeMenu(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menuBox.hidden) { closeMenu(); }
    });
  }

  /* --- свій курсор -------------------------------------------------------- */
  var cursor = document.getElementById('cursor');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (cursor && fine && !reduceMotion) {
    document.documentElement.classList.add('has-cursor');

    var dot = cursor.querySelector('.cursor__dot');
    var ring = cursor.querySelector('.cursor__ring');
    var tail = cursor.querySelector('.cursor__trail');

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my, tx = mx, ty = my;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
    }, { passive: true });

    // кільце й слід наздоганяють точку з різною швидкістю
    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      tx += (mx - tx) * 0.08;
      ty += (my - ty) * 0.08;

      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      tail.style.transform = 'translate(' + tx + 'px,' + ty + 'px) translate(-50%,-50%)';

      requestAnimationFrame(loop);
    })();

    // над клікабельним кільце розростається
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('a, button, .work__frame, .case')) {
        cursor.classList.add('is-active');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('a, button, .work__frame, .case')) {
        cursor.classList.remove('is-active');
      }
    });
  }

  /* --- перебір символів при наведенні --------------------------------------
     Текст перемішується і складається у правильний. Вішається на елементи
     з атрибутом data-scramble. Оригінал зберігаємо, щоб нічого не загубити. */

  var scrambles = document.querySelectorAll('[data-scramble]');

  if (scrambles.length && !reduceMotion) {
    var CHARS = '0123456789+()–—/\\|<>*#@$%&';

    Array.prototype.forEach.call(scrambles, function (el) {
      var original = el.textContent;
      var timer = null;

      el.addEventListener('mouseenter', function () {
        var step = 0;
        // кожен символ «застигає» на своєму кроці, зліва направо
        var settleAt = original.split('').map(function (_, i) {
          return i * 1.6 + Math.random() * 6;
        });

        clearInterval(timer);
        timer = setInterval(function () {
          var out = '';
          for (var i = 0; i < original.length; i++) {
            var ch = original[i];
            if (ch === ' ') { out += ' '; continue; }
            out += step > settleAt[i] ? ch : CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          el.textContent = out;
          step += 1;

          if (step > settleAt[settleAt.length - 1] + 2) {
            clearInterval(timer);
            el.textContent = original;
          }
        }, 30);
      });

      el.addEventListener('mouseleave', function () {
        clearInterval(timer);
        el.textContent = original;
      });
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

    // Прев'ю не стрибає за мишею, а плавно її наздоганяє: цільову точку
    // задає курсор, а сама картка щокадру підтягується до неї частками.
    // Нахил рахуємо з того, наскільки швидко вона зараз рухається.
    var targetX = 0, targetY = 0;
    var curX = 0, curY = 0;
    var tilt = 0;
    var rafId = 0;

    // Замість прапорця «цикл працює» тримаємо саме id кадру. Так неможливо
    // опинитись у стані, коли прапорець каже «працює», а кадр уже не
    // заплановано — саме через це прев'ю не зʼявлялось на частині посилань.
    function start() {
      if (rafId) { return; }
      rafId = requestAnimationFrame(follow);
    }

    function follow() {
      rafId = 0;

      var dx = targetX - curX;
      var dy = targetY - curY;

      curX += dx * 0.12;
      curY += dy * 0.12;

      // нахил від горизонтальної швидкості, з поверненням у нуль
      var wanted = Math.max(-12, Math.min(12, dx * 0.14));
      tilt += (wanted - tilt) * 0.08;

      preview.style.setProperty('--x', curX.toFixed(1) + 'px');
      preview.style.setProperty('--y', curY.toFixed(1) + 'px');
      preview.style.setProperty('--r', tilt.toFixed(2) + 'deg');

      // крутимось, поки прев'ю видиме або ще не доїхало
      if (preview.classList.contains('on') ||
          Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        start();
      }
    }

    // Рух ловимо на всьому документі, а не на кожному посиланні: коли курсор
    // переходить з одного рядка на інший, він на мить опиняється між ними,
    // і при слуханні лише посилань ціль переставала оновлюватись.
    document.addEventListener('mousemove', function (e) {
      targetX = e.clientX + 40;
      targetY = e.clientY;
      if (preview.classList.contains('on')) { start(); }
    }, { passive: true });

    function jumpTo(e) {
      // при першій появі ставимо картку одразу на місце,
      // інакше вона прилітала б через пів екрана
      targetX = e.clientX + 40;
      targetY = e.clientY;
      curX = targetX;
      curY = targetY;
      tilt = 0;
      preview.style.setProperty('--x', curX + 'px');
      preview.style.setProperty('--y', curY + 'px');
      preview.style.setProperty('--r', '0deg');
    }

    Array.prototype.forEach.call(cases, function (link) {
      var src = link.getAttribute('data-preview');

      // підвантажуємо картинку заздалегідь, щоб прев'ю не блимало порожнім
      var pre = new Image();
      pre.src = src;

      link.addEventListener('mouseenter', function (e) {
        img.src = src;
        img.alt = '';
        jumpTo(e);
        preview.classList.add('on');
        start();
      });

      link.addEventListener('mouseleave', function () {
        preview.classList.remove('on');
      });
    });

    // Ховати прев'ю на scroll не можна: через scroll-behavior:smooth
    // залишковий рух сторінки гасив би його одразу після появи,
    // а на тачпаді воно б блимало. Коли рядок їде з-під курсора,
    // mouseleave спрацьовує сам.
  }

  /* --- діагностика ---------------------------------------------------------
     Вмикається лише адресою ?debug — на звичайному сайті нічого не показує.
     Потрібна, щоб побачити реальні розміри на чужому екрані, який не
     вдається відтворити. */
  if (location.search.indexOf('debug') !== -1) {
    setTimeout(function () {
      var de = document.documentElement;
      var nav = document.querySelector('.nav');
      var widest = null, widestW = 0;

      document.querySelectorAll('body *').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.right > de.clientWidth + 2 && r.right > widestW) {
          var host = el.closest('.works, .nav, .section');
          if (!host || !host.classList.contains('works')) {
            widestW = r.right;
            widest = el.tagName + '.' + String(el.className).slice(0, 30);
          }
        }
      });

      var box = document.createElement('div');
      box.style.cssText = 'position:fixed;z-index:9999;left:8px;bottom:8px;max-width:92vw;' +
        'background:#0A0A0A;color:#F9FE4A;font:12px/1.5 monospace;padding:12px 14px;' +
        'border-radius:8px;white-space:pre;box-shadow:0 8px 30px rgba(0,0,0,.5)';
      box.textContent =
        'вікно (innerWidth):   ' + window.innerWidth + '\n' +
        'сторінка (clientW):   ' + de.clientWidth + '\n' +
        'ширина документа:     ' + de.scrollWidth + '\n' +
        'ПЕРЕПОВНЕННЯ:         ' + (de.scrollWidth > de.clientWidth ? 'ТАК ← проблема' : 'ні') + '\n' +
        'масштаб екрана:       ' + window.devicePixelRatio + '\n' +
        'ширина шапки:         ' + Math.round(nav.getBoundingClientRect().width) + '\n' +
        'галерея закріплена:   ' + (document.getElementById('gallery') || {}).dataset.pin + '\n' +
        'overflow-x у html:    ' + getComputedStyle(de).overflowX + '\n' +
        'найширший елемент:    ' + (widest || 'немає');
      document.body.appendChild(box);
    }, 2500);
  }

  /* --- перегляд роботи на весь екран -------------------------------------- */
  var viewer = document.getElementById('viewer');

  if (viewer) {
    var vImg = document.getElementById('viewerImg');
    var vCap = document.getElementById('viewerCaption');
    var vClose = document.getElementById('viewerClose');
    var vPrev = document.getElementById('viewerPrev');
    var vNext = document.getElementById('viewerNext');
    var frames = Array.prototype.slice.call(document.querySelectorAll('[data-full]'));
    var current = 0;
    var lastFocused = null;

    function show(i) {
      if (i < 0) { i = 0; }
      if (i > frames.length - 1) { i = frames.length - 1; }
      current = i;

      var el = frames[i];
      var src = el.getAttribute('data-full');
      var cap = el.getAttribute('data-caption') || '';

      vImg.src = src;
      vImg.alt = cap;
      vCap.textContent = cap;

      vPrev.disabled = i === 0;
      vNext.disabled = i === frames.length - 1;
    }

    function open(i) {
      lastFocused = document.activeElement;
      show(i);
      viewer.hidden = false;
      // наступний кадр — щоб спрацював перехід прозорості
      requestAnimationFrame(function () { viewer.classList.add('on'); });
      document.body.style.overflow = 'hidden';
      vClose.focus();
    }

    function close() {
      viewer.classList.remove('on');
      document.body.style.overflow = '';
      var done = function () {
        viewer.hidden = true;
        viewer.removeEventListener('transitionend', done);
      };
      if (reduceMotion) { done(); } else { viewer.addEventListener('transitionend', done); }
      if (lastFocused && lastFocused.focus) { lastFocused.focus(); }
    }

    frames.forEach(function (el, i) {
      el.addEventListener('click', function () { open(i); });
    });

    vClose.addEventListener('click', close);
    vPrev.addEventListener('click', function () { show(current - 1); });
    vNext.addEventListener('click', function () { show(current + 1); });

    // клік повз зображення закриває
    viewer.addEventListener('click', function (e) {
      if (e.target === viewer) { close(); }
    });

    document.addEventListener('keydown', function (e) {
      if (viewer.hidden) { return; }
      if (e.key === 'Escape') { close(); }
      if (e.key === 'ArrowLeft') { show(current - 1); }
      if (e.key === 'ArrowRight') { show(current + 1); }
    });
  }
})();
