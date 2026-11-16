/* M.S. Graphics Studio shop: mobile menu and search toggle. */
(function () {
  var navToggle = document.querySelector('.msg-nav-toggle');
  var nav = document.getElementById('msg-nav');
  var searchToggle = document.querySelector('.msg-search-toggle');
  var search = document.getElementById('msg-search');

  function setNav(open) {
    if (!navToggle || !nav) return;
    navToggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('msg-nav-open', open);
  }
  function setSearch(open) {
    if (!searchToggle || !search) return;
    searchToggle.setAttribute('aria-expanded', String(open));
    search.hidden = !open;
    if (open) { var i = search.querySelector('input[type="search"]'); if (i) i.focus(); }
  }
  if (navToggle) navToggle.addEventListener('click', function () {
    setSearch(false);
    setNav(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  if (searchToggle) searchToggle.addEventListener('click', function () {
    setNav(false);
    setSearch(searchToggle.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (searchToggle && searchToggle.getAttribute('aria-expanded') === 'true') { setSearch(false); searchToggle.focus(); }
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
