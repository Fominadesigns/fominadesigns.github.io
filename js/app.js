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
    var px = 0, py = 0, pticking = false;

    var prevX = 0, tilt = 0;

    function place() {
      preview.style.setProperty('--x', px + 'px');
      preview.style.setProperty('--y', py + 'px');
      preview.style.setProperty('--r', tilt.toFixed(2) + 'deg');
      pticking = false;
    }

    function onMove(e) {
      // зсув від курсора, щоб прев'ю не перекривало саму назву
      px = e.clientX + 40;
      py = e.clientY;

      // Нахил за напрямком руху: різко вправо — нахиляється вправо,
      // зупинився — плавно вирівнюється.
      var dx = e.clientX - prevX;
      prevX = e.clientX;
      var target = Math.max(-14, Math.min(14, dx * 0.9));
      tilt += (target - tilt) * 0.25;

      if (!pticking) {
        pticking = true;
        requestAnimationFrame(place);
      }
    }

    // коли миша стоїть, повертаємо прев'ю в рівне положення
    setInterval(function () {
      if (!preview.classList.contains('on')) { return; }
      if (Math.abs(tilt) < 0.05) { return; }
      tilt *= 0.82;
      place();
    }, 60);

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

    // Стан видно в розмітці як data-pin — щоб можна було подивитись у
    // інспекторі, чому закріплення не ввімкнулось, замість здогадок.
    function disable(reason) {
      pinned = false;
      section.dataset.pin = reason || 'off';
      section.classList.remove('works--pinned');
      wrap.style.height = '';
      track.style.transform = '';
    }

    // Пауза до початку руху й така сама після його кінця: блок встигає
    // стати посередині екрана, перш ніж поїхати вбік, і затримується
    // на останній роботі, перш ніж сторінка поїде далі вниз.
    var lead = 0;

    function update() {
      if (!pinned) return;
      var scrolled = -wrap.getBoundingClientRect().top;
      var p = (scrolled - lead) / distance;
      if (p < 0) { p = 0; }
      if (p > 1) { p = 1; }
      track.style.transform = 'translate3d(' + (-p * distance).toFixed(1) + 'px, 0, 0)';
      if (bar) { bar.style.width = (p * 100).toFixed(1) + '%'; }
    }

    function measure() {
      // Поки відкрито перегляд на весь екран, сторінка має overflow:hidden —
      // ширини стають іншими, і перемірювання зсунуло б сторінку під ним.
      var open = document.getElementById('viewer');
      if (open && !open.hidden) { return; }

      // На вузьких екранах і за увімкненого зменшення руху лишаємо звичайну
      // горизонтальну прокрутку — там закріплення радше заважає.
      if (reduceMotion) { disable('reduced-motion'); return; }
      if (window.innerWidth < 861) { disable('narrow'); return; }

      // Міряємо, НЕ прибираючи висоту й не знімаючи клас: інакше документ
      // на мить коротшає на висоту секції, і браузер зсуває позицію
      // прокрутки — сторінка стрибає.
      //
      // offsetWidth, а не scrollWidth: у закріпленому стані overflow стає
      // visible, і scrollWidth перестає показувати справжню ширину вмісту.
      // offsetWidth разом із width:max-content дає її завжди, і зсув
      // доріжки на нього не впливає.
      var vs = getComputedStyle(viewport);
      var padX = (parseFloat(vs.paddingLeft) || 0) + (parseFloat(vs.paddingRight) || 0);
      // Обмежуємо шириною екрана: якщо вікно перегляду раптом ширше за
      // екран, вимірювання дало б нуль і стан почав би блимати.
      var visible = Math.min(viewport.clientWidth, window.innerWidth) - padX;
      var overflow = track.offsetWidth - visible;
      if (overflow <= 40) { disable('no-overflow'); return; }

      distance = overflow;
      lead = Math.round(window.innerHeight * 0.5);
      pinned = true;
      section.dataset.pin = 'on';
      section.classList.add('works--pinned');

      // екран + пауза на початку + шлях доріжки + така сама пауза в кінці
      var height = (window.innerHeight + lead + distance + lead) + 'px';
      if (wrap.style.height !== height) { wrap.style.height = height; }
      update();
    }

    function onScroll() {
      if (frame) { return; }
      frame = requestAnimationFrame(function () { frame = 0; update(); });
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // На мобільних адресний рядок ховається й показується, і це щоразу
    // надсилає resize. Переміряємо лише коли справді змінилась ширина.
    var lastWidth = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastWidth) { update(); return; }
      lastWidth = window.innerWidth;
      measure();
    });

    // Розмітка встоюється не одразу: підвантажуються шрифти й картинки,
    // і ширина доріжки змінюється. ResizeObserver ловить це надійніше
    // за окремі виклики на load — і сам виправляє стан, якщо перше
    // вимірювання випало на невдалий момент.
    if ('ResizeObserver' in window) {
      var pending = 0;
      var ro = new ResizeObserver(function () {
        if (pending) { return; }
        pending = requestAnimationFrame(function () { pending = 0; measure(); });
      });
      ro.observe(track);
      ro.observe(viewport);
    }

    window.addEventListener('load', measure);
    measure();
  }

  /* --- місія: слова засвічуються при прокрутці -----------------------------

     Текст лишається у розмітці цілим — розбиваємо на слова вже тут.
     Якщо скрипт не спрацював, відвідувач бачить звичайний читабельний
     абзац, а не приглушені уламки.                                        */

  var mission = document.getElementById('missionText');

  if (mission && !reduceMotion) {
    var source = mission.textContent.trim();
    var parts = source.split(/\s+/);

    mission.textContent = '';
    parts.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'mission__word';
      span.textContent = w;
      mission.appendChild(span);
      if (i < parts.length - 1) {
        mission.appendChild(document.createTextNode(' '));
      }
    });

    document.documentElement.classList.add('js-mission');
    var words = mission.querySelectorAll('.mission__word');
    var mFrame = 0;

    function lightUp() {
      var r = mission.getBoundingClientRect();
      var vh = window.innerHeight;

      // 0 — блок тільки заходить знизу, 1 — доїхав до верхньої третини
      var p = (vh * 0.85 - r.top) / (vh * 0.55);
      if (p < 0) { p = 0; }
      if (p > 1) { p = 1; }

      var lit = Math.round(p * words.length);
      for (var i = 0; i < words.length; i++) {
        words[i].classList.toggle('lit', i < lit);
      }
      mFrame = 0;
    }

    window.addEventListener('scroll', function () {
      if (mFrame) { return; }
      mFrame = requestAnimationFrame(lightUp);
    }, { passive: true });
    window.addEventListener('resize', lightUp);
    lightUp();
  }

  /* --- слід із робіт за курсором ------------------------------------------

     Коли курсор проходить певну відстань, показуємо наступну картинку
     у місці курсора й гасимо її. Виходить «шлейф» із робіт.
     Тільки для миші: на тачі курсора немає, а зайвий рух дратує.        */

  var trail = document.getElementById('trail');

  if (trail && hasHover && !reduceMotion) {
    var shots = trail.querySelectorAll('.trail__img');
    var count = shots.length;
    var idx = 0;
    var lastX = 0, lastY = 0;
    var started = false;
    var zIndex = 1;

    // на якій відстані показувати наступну картинку
    var STEP = 120;

    function distance(x1, y1, x2, y2) {
      var dx = x2 - x1, dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function pop(x, y) {
      var el = shots[idx % count];
      idx += 1;
      zIndex += 1;

      el.style.zIndex = zIndex;
      // невеликий випадковий нахил, щоб слід не був механічним
      var tilt = (Math.random() * 16 - 8).toFixed(1);
      el.style.transition = 'none';
      el.style.transform = 'translate3d(' + (x - el.offsetWidth / 2) + 'px,' +
        (y - el.offsetHeight / 2) + 'px,0) rotate(' + tilt + 'deg) scale(.82)';
      el.style.opacity = '0';

      // Примусовий перерахунок, а не requestAnimationFrame: rAF не
      // спрацьовує у прихованій вкладці, і картинка лишалась невидимою.
      void el.offsetWidth;

      el.style.transition = 'opacity .35s ease, transform .7s cubic-bezier(.2,.7,.3,1)';
      el.style.opacity = '1';
      el.style.transform = 'translate3d(' + (x - el.offsetWidth / 2) + 'px,' +
        (y - el.offsetHeight / 2) + 'px,0) rotate(' + tilt + 'deg) scale(1)';

      // і гасимо через паузу
      clearTimeout(el._hide);
      el._hide = setTimeout(function () {
        el.style.transition = 'opacity .6s ease, transform .6s ease';
        el.style.opacity = '0';
        el.style.transform = 'translate3d(' + (x - el.offsetWidth / 2) + 'px,' +
          (y - el.offsetHeight / 2) + 'px,0) rotate(' + tilt + 'deg) scale(.94)';
      }, 650);
    }

    trail.parentElement.addEventListener('mousemove', function (e) {
      var box = trail.getBoundingClientRect();
      var x = e.clientX - box.left;
      var y = e.clientY - box.top;

      if (!started) {
        started = true;
        lastX = x; lastY = y;
        return;
      }

      if (distance(lastX, lastY, x, y) > STEP) {
        lastX = x; lastY = y;
        pop(x, y);
      }
    });
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
    var frames = Array.prototype.slice.call(document.querySelectorAll('.work__frame[data-full]'));
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
