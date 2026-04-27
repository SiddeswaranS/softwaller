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

  /* ── Desktop mega-menu: keyboard + aria-expanded ──
     The CSS opens panels on hover/focus-within. We mirror that state into
     aria-expanded so screen readers follow along, and we add Click + Enter
     + Space + Escape so keyboard users can drive the menu.                  */
  var megaTriggers = document.querySelectorAll('.swh-links > li > .swh-link[aria-haspopup="true"]');

  function closeAllMegas(except) {
    megaTriggers.forEach(function (b) {
      if (b === except) return;
      b.setAttribute('aria-expanded', 'false');
      var li = b.parentElement;
      if (li) li.classList.remove('open');
    });
  }

  megaTriggers.forEach(function (btn) {
    var li = btn.parentElement;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = btn.getAttribute('aria-expanded') === 'true';
      closeAllMegas(btn);
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      li.classList.toggle('open', !open);
    });

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      } else if (e.key === 'Escape') {
        btn.setAttribute('aria-expanded', 'false');
        li.classList.remove('open');
        btn.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (btn.getAttribute('aria-expanded') !== 'true') btn.click();
        var firstItem = li.querySelector('.swh-mega a, .swh-mega button');
        if (firstItem) firstItem.focus();
      }
    });

    /* Hover state should also reflect in aria-expanded for assistive tech */
    li.addEventListener('mouseenter', function () { btn.setAttribute('aria-expanded', 'true'); });
    li.addEventListener('mouseleave', function () {
      if (!li.classList.contains('open')) btn.setAttribute('aria-expanded', 'false');
    });
  });

  /* Click outside or Escape closes any open mega panel */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.swh-links > li')) closeAllMegas(null);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllMegas(null);
  });

  /* ── Footer accordion aria-expanded mirror ──
     CSS shows fc-links on desktop unconditionally; on mobile the .fc-col.open
     class drives display. Mirror that state into aria-expanded so screen
     readers match what's visible.                                            */
  function syncFooterExpanded() {
    var isDesktop = window.innerWidth >= 769;
    document.querySelectorAll('.fc-col').forEach(function (col) {
      var head = col.querySelector('.fc-head');
      if (!head) return;
      var expanded = isDesktop ? true : col.classList.contains('open');
      head.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }
  syncFooterExpanded();
  window.addEventListener('resize', syncFooterExpanded);
  document.addEventListener('click', function (e) {
    if (e.target.closest('.fc-head')) setTimeout(syncFooterExpanded, 0);
  });
})();
