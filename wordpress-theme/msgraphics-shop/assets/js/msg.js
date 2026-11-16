/* M.S. Graphics Studio shop: mobile menu and dropdowns (same behaviour as the main website). */
(function () {
  var navToggle = document.querySelector('.msg-nav-toggle');
  var nav = document.getElementById('msg-nav');
  var subToggles = Array.prototype.slice.call(document.querySelectorAll('.msg-sub-toggle'));
  var desktop = window.matchMedia('(min-width: 1200px)');

  function setNav(open) {
    if (!navToggle || !nav) return;
    navToggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('msg-nav-open', open);
  }
  function setSub(t, open) {
    t.setAttribute('aria-expanded', String(open));
    var el = document.getElementById(t.getAttribute('aria-controls') || '');
    if (el) el.classList.toggle('is-open', open);
  }
  if (navToggle) navToggle.addEventListener('click', function () {
    setNav(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  subToggles.forEach(function (t) {
    t.addEventListener('click', function () {
      var open = t.getAttribute('aria-expanded') !== 'true';
      if (desktop.matches) subToggles.forEach(function (o) { if (o !== t) setSub(o, false); });
      setSub(t, open);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var openSub = subToggles.filter(function (t) { return t.getAttribute('aria-expanded') === 'true'; })[0];
    if (openSub) { setSub(openSub, false); openSub.focus(); return; }
    if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') { setNav(false); navToggle.focus(); }
  });
})();

/* Shop home: arrow buttons for each category row. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.msg-row').forEach(function (row) {
    var track = row.querySelector('.msg-row__track');
    var btns = row.querySelectorAll('.msg-row__btn');
    if (!track || !btns.length) return;
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      row.classList.toggle('msg-row--fits', max <= 2);
      btns.forEach(function (b) {
        b.disabled = b.getAttribute('data-dir') === '-1' ? track.scrollLeft <= 2 : track.scrollLeft >= max - 2;
      });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var dir = Number(b.getAttribute('data-dir'));
        track.scrollBy({ left: dir * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
