/* ══════════════════════════════════════
   NAV.JS — Sitewide mega-header behavior
   softwaller.com
══════════════════════════════════════ */
(function () {
  var hdr = document.getElementById('site-header');
  var ham = document.getElementById('swh-ham');
  var mob = document.getElementById('swh-mob');

  /* Scroll shadow */
  if (hdr) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          hdr.classList.toggle('scrolled', window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* Hamburger */
  if (ham && mob) {
    ham.addEventListener('click', function () {
      var open = ham.classList.toggle('open');
      mob.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    /* Close mobile drawer when a real link is clicked */
    mob.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      ham.classList.remove('open');
      mob.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  }

  /* Mobile sub-menu accordion */
  document.querySelectorAll('.swh-mob-toggle').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      btn.classList.toggle('open');
    });
  });

  /* Close mobile drawer on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mob && mob.classList.contains('open')) {
      ham.classList.remove('open');
      mob.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();
