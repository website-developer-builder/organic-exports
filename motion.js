(function () {
  if (window.__oeMotion) return; window.__oeMotion = true;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2,.7,.2,1)';

  /* ---------- Page transition curtain ---------- */
  var curtain = document.createElement('div');
  curtain.setAttribute('aria-hidden', 'true');
  curtain.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;background:radial-gradient(700px 360px at 50% 120%,rgba(233,196,106,0.28),transparent 70%),linear-gradient(160deg,#0F4A37,#041A12);transform:translateY(100%);';
  curtain.innerHTML = '<span style="width:54px;height:54px;border-radius:50%;background:linear-gradient(145deg,#F1CF7A,#B8872F);padding:1.5px;display:block"><span style="width:100%;height:100%;border-radius:50%;background:#0A3B2C;display:flex;align-items:center;justify-content:center"><span style="width:16px;height:26px;background:linear-gradient(160deg,#F1CF7A,#C99A3E);border-radius:16px 0 16px 0;transform:rotate(22deg);display:block"></span></span></span><span style="font:600 30px/1 \'Cormorant Garamond\',serif;color:#F5EFE0;letter-spacing:0.01em">Organic Exports</span><span data-bar style="width:120px;height:2px;border-radius:2px;background:rgba(233,196,106,0.2);overflow:hidden;display:block"><span style="display:block;height:100%;width:100%;background:linear-gradient(90deg,#F1CF7A,#C99A3E);transform-origin:left;transform:scaleX(0)"></span></span>';
  function mountCurtain() { if (!curtain.isConnected) document.body.appendChild(curtain); }

  var cameFromNav = false;
  try { cameFromNav = sessionStorage.getItem('oe-nav') === '1'; sessionStorage.removeItem('oe-nav'); } catch (e) {}

  function enter() {
    mountCurtain();
    if (reduce) { curtain.style.transform = 'translateY(100%)'; return; }
    if (cameFromNav) {
      curtain.style.transform = 'translateY(0)';
      curtain.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 750, delay: 120, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
    } else {
      document.documentElement.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });
    }
  }

  function leave(href) {
    mountCurtain();
    try { sessionStorage.setItem('oe-nav', '1'); } catch (e) {}
    if (reduce) { location.href = href; return; }
    var a = curtain.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 560, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
    var bar = curtain.querySelector('[data-bar] span');
    if (bar) bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 560, easing: EASE, fill: 'forwards' });
    a.onfinish = function () { location.href = href; };
    setTimeout(function () { location.href = href; }, 900);
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    var raw = a.getAttribute('href');
    if (!raw || raw.charAt(0) === '#' || /^(mailto:|tel:|https?:)/i.test(raw)) return;
    if (!/\.dc\.html/i.test(raw)) return;
    var url = new URL(raw, location.href);
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    leave(url.href);
  }, true);

  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { curtain.getAnimations().forEach(function (x) { x.cancel(); }); curtain.style.transform = 'translateY(100%)'; }
  });

  /* ---------- Scroll progress bar ---------- */
  var prog = document.createElement('div');
  prog.style.cssText = 'position:fixed;left:0;top:0;height:2px;width:100%;z-index:9998;pointer-events:none;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,#F1CF7A,#C99A3E);box-shadow:0 0 10px rgba(233,196,106,0.7)';
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
      ticking = false;
    });
  }

  /* ---------- Scroll reveal ---------- */
  var SEL = 'main h1, main h2, main p, main table, main [data-reveal], footer h2, footer [data-reveal]';
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    var batch = entries.filter(function (en) { return en.isIntersecting; });
    batch.sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; });
    batch.forEach(function (en, i) {
      var el = en.target; io.unobserve(el);
      var anim = el.__rv; if (!anim) return;
      anim.effect.updateTiming({ delay: Math.min(i, 8) * 75 });
      anim.play();
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;

  function isGridChild(el) {
    var p = el.parentElement; if (!p) return false;
    var d = getComputedStyle(p).display;
    return d === 'grid' || d === 'inline-grid';
  }

  function prep(el) {
    if (el.__rv || el.closest('header') || el.closest('[data-noreveal]')) return;
    var anc = el.parentElement && el.parentElement.closest('[data-rv]');
    if (anc) return;
    el.setAttribute('data-rv', '');
    var isHead = /^H[12]$/.test(el.tagName);
    var kf = isHead
      ? [{ opacity: 0, transform: 'translateY(28px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }]
      : [{ opacity: 0, transform: 'translateY(22px) scale(.985)' }, { opacity: 1, transform: 'none' }];
    var anim = el.animate(kf, { duration: isHead ? 900 : 750, easing: EASE, fill: 'both' });
    anim.pause(); anim.currentTime = 0;
    anim.onfinish = function () { anim.cancel(); };
    el.__rv = anim;
    io.observe(el);
  }

  function scan(root) {
    if (reduce || !io) return;
    var grids = (root || document).querySelectorAll('main div, main section, footer div');
    for (var j = 0; j < grids.length; j++) {
      var g = grids[j];
      if (g.__gridChecked) continue; g.__gridChecked = true;
      if (isGridChild(g) && !g.closest('[data-noreveal]')) prep(g);
    }
    var nodes = (root || document).querySelectorAll(SEL);
    for (var i = 0; i < nodes.length; i++) prep(nodes[i]);
    initZoom(root); initFloat(root); initCount(root); initKen(root);
  }

  /* ---------- Hover zoom on imagery ---------- */
  function initZoom(root) {
    var els = (root || document).querySelectorAll('[data-zoom]');
    els.forEach(function (el) {
      if (el.__zoom) return; el.__zoom = true;
      var cur;
      el.addEventListener('pointerenter', function () {
        var img = el.querySelector('img'); if (!img || reduce) return;
        cur && cur.cancel();
        cur = img.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }], { duration: 900, easing: EASE, fill: 'forwards' });
      });
      el.addEventListener('pointerleave', function () {
        var img = el.querySelector('img'); if (!img || reduce) return;
        cur && cur.cancel();
        cur = img.animate([{ transform: 'scale(1.07)' }, { transform: 'scale(1)' }], { duration: 700, easing: EASE, fill: 'forwards' });
      });
    });
  }

  /* ---------- Gentle float ---------- */
  function initFloat(root) {
    if (reduce) return;
    (root || document).querySelectorAll('[data-float]').forEach(function (el, i) {
      if (el.__float) return; el.__float = true;
      var amp = parseFloat(el.getAttribute('data-float')) || 8;
      el.animate([{ translate: '0 0' }, { translate: '0 -' + amp + 'px' }], { duration: 3200 + i * 400, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
    });
  }

  /* ---------- Ken Burns on hero imagery ---------- */
  function initKen(root) {
    if (reduce) return;
    (root || document).querySelectorAll('[data-ken]').forEach(function (el) {
      if (el.__ken) return; el.__ken = true;
      el.animate([{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 2600, easing: 'cubic-bezier(.2,.6,.2,1)', fill: 'both' });
    });
  }

  /* ---------- Count-up numbers ---------- */
  function initCount(root) {
    (root || document).querySelectorAll('[data-count]').forEach(function (el) {
      if (el.__count) return; el.__count = true;
      var final = el.textContent; var m = final.match(/\d+/); if (!m || reduce) return;
      var target = parseInt(m[0], 10);
      var cio = new IntersectionObserver(function (ents) {
        if (!ents[0].isIntersecting) return; cio.disconnect();
        var t0 = performance.now(), dur = 1400;
        (function step(t) {
          var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = final.replace(m[0], String(Math.round(target * e)));
          if (p < 1) requestAnimationFrame(step); else el.textContent = final;
        })(t0);
      }, { threshold: 0.6 });
      cio.observe(el);
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    document.body.appendChild(prog);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    enter();
    scan(document);
    var pending = false;
    new MutationObserver(function () {
      if (pending) return; pending = true;
      requestAnimationFrame(function () { pending = false; scan(document); });
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
