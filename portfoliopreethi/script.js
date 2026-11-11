(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- network canvas in the hero ---- */
  var cv = document.getElementById('net'), hero = document.getElementById('top');
  if (cv && hero) {
    var ctx = cv.getContext('2d'), w = 0, h = 0, nodes = [], mouse = { x: -999, y: -999 }, running = true, raf = 0;
    var cols = ['#FF6B1A', '#FFB52E', '#FF4D6D', '#E8E8EE', '#F5F5F7'];
    var resize = function () {
      var r = hero.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(56, Math.max(18, (w * h) / 20000)));
      nodes = [];
      for (var i = 0; i < n; i++) nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, r: 1.6 + Math.random() * 2.4, c: i % 5 });
      draw();
    };
    var draw = function () {
      ctx.clearRect(0, 0, w, h);
      var i, j, a, b, dx, dy, d;
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) { ctx.globalAlpha = (1 - d / 140) * 0.22; ctx.strokeStyle = '#B8B8C4'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < 170) { ctx.globalAlpha = (1 - d / 170) * 0.6; ctx.strokeStyle = '#FF6B1A'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      }
      for (i = 0; i < nodes.length; i++) { a = nodes[i]; ctx.globalAlpha = 0.85; ctx.fillStyle = cols[a.c]; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill(); }
      ctx.globalAlpha = 1;
    };
    var step = function () {
      if (!running) return;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      draw(); raf = requestAnimationFrame(step);
    };
    resize();
    window.addEventListener('resize', resize);
    if (!reduce) {
      hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
      hero.addEventListener('pointerleave', function () { mouse.x = -999; mouse.y = -999; });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) {
          if (en[0].isIntersecting && !running) { running = true; raf = requestAnimationFrame(step); }
          if (!en[0].isIntersecting) { running = false; cancelAnimationFrame(raf); }
        }).observe(hero);
      }
      raf = requestAnimationFrame(step);
    }
  }

  /* ---- role rotator ---- */
  var roleEl = document.getElementById('role');
  var roles = ['Computer Science Student', 'IoT Builder', 'Python Developer', 'Full Stack Learner', 'Hackathon Podium Finisher'];
  if (roleEl && !reduce) {
    var ri = 0, ci = roles[0].length, del = true;
    var type = function () {
      var word = roles[ri];
      if (del) { ci--; } else { ci++; }
      roleEl.textContent = word.slice(0, ci);
      var wait = del ? 35 : 75;
      if (!del && ci === word.length) { del = true; wait = 1800; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; wait = 350; }
      setTimeout(type, wait);
    };
    setTimeout(type, 2200);
  }

  /* ---- scroll reveal, with a timeout so nothing stays hidden ---- */
  var items = document.querySelectorAll('.reveal');
  var show = function (el) { el.classList.add('in'); };
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); if (e.target.hasAttribute('data-count') || e.target.querySelector('[data-count]')) runCounters(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () { items.forEach(show); }, 6000);
  } else { items.forEach(show); }

  /* ---- counters ---- */
  function runCounters(scope) {
    scope.querySelectorAll('[data-count]').forEach(function (el) {
      if (el.dataset.done) return; el.dataset.done = '1';
      var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), suf = el.dataset.suffix || '', t0 = null, dur = 1500;
      var tick = function (t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = (end * e).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---- scroll progress and active nav ---- */
  var bar = document.getElementById('progress');
  var links = [].slice.call(document.querySelectorAll('.nav ul a'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var onScroll = function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
    var cur = -1, y = window.scrollY + window.innerHeight * 0.35;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---- cursor spotlight on project cards, tilt on the ID card ---- */
  if (fine && !reduce) {
    document.querySelectorAll('.project').forEach(function (c) {
      c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    });
    var card = document.getElementById('idcard');
    if (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'rotateY(' + (px * 14) + 'deg) rotateX(' + (-py * 14) + 'deg)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    }
  }

  /* ---- copy buttons ---- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.getAttribute('data-copy')), label = btn.querySelector('span'), text = target.textContent.trim();
      var done = function (m) { label.textContent = m; setTimeout(function () { label.textContent = 'Copy'; }, 1600); };
      var fallback = function () { try { var r = document.createRange(); r.selectNodeContents(target); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); done('Selected'); } catch (e) { done('Copy'); } };
      try { navigator.clipboard.writeText(text).then(function () { done('Copied'); }, fallback); } catch (e) { fallback(); }
    });
  });
})();
