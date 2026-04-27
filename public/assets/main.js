/* ══════════════════════════════════════
   MAIN JS — index.html (homepage)
   softwaller.com
══════════════════════════════════════ */

/* ── GA4 Event Tracking Helper ── */
function trackEvent(action, category, label) {
  if (typeof gtag === 'function') {
    gtag('event', action, { event_category: category, event_label: label });
  }
}

/* ── Cached DOM elements ── */
var cachedProgressBar = document.getElementById('progress-bar');
var cachedHeader = document.getElementById('site-header');
var cachedBtt = document.getElementById('btt');

/* ── Scroll progress bar (RAF-throttled) ── */
var scrollTicking = false;
window.addEventListener('scroll', function () {
  if (!scrollTicking) {
    requestAnimationFrame(function () {
      var h = document.body.scrollHeight - window.innerHeight;
      if (cachedProgressBar && h > 0) cachedProgressBar.style.width = (window.scrollY / h * 100) + '%';
      if (cachedHeader) cachedHeader.classList.toggle('scrolled', window.scrollY > 20);
      if (cachedBtt) cachedBtt.classList.toggle('visible', window.scrollY > 400);
      scrollTicking = false;
    });
    scrollTicking = true;
  }
});

/* ── Smooth goto ── */
function goto(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  closeMenu();
}
/* Progressive enhancement: smooth scroll for anchor links */
document.addEventListener('click', function (e) {
  var a = e.target.closest('a[href^="#"]');
  if (!a) return;
  var id = a.getAttribute('href').slice(1);
  var target = document.getElementById(id);
  if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); closeMenu(); }
});

/* ── Hamburger ── */
var ham = document.getElementById('hamburger');
var mob = document.getElementById('mob-menu');
if (ham && mob) {
  ham.addEventListener('click', function () {
    var open = ham.classList.toggle('open');
    mob.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
}
function closeMenu() {
  if (ham) {
    ham.classList.remove('open');
    mob.classList.remove('open');
    ham.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

/* ── Active nav (scroll-based, RAF-throttled) ── */
var sects = ['home', 'about', 'services', 'showcase', 'why', 'process', 'solutions', 'faq', 'contact'];
var navTicking = false;
function updateActiveNav() {
  var scrollY = window.scrollY + 200;
  var current = '';
  sects.forEach(function (s) {
    var el = document.getElementById(s);
    if (el && el.offsetTop <= scrollY) current = s;
  });
  sects.forEach(function (s) {
    var a = document.getElementById('nl-' + s);
    if (a) a.classList.toggle('active', s === current);
  });
  navTicking = false;
}
window.addEventListener('scroll', function () {
  if (!navTicking) { navTicking = true; requestAnimationFrame(updateActiveNav); }
});
updateActiveNav();

/* ── Scroll reveal — with bulletproof fallback ──
   Generic helper: each entry maps a CSS selector to the class that should be
   added when the element scrolls into view. Items that start above the fold
   get the class immediately; the rest get an IntersectionObserver. A 1.5 s
   safety timer adds the class unconditionally if anything goes wrong, so
   content is never permanently invisible. */
var REVEAL_GROUPS = [
  { sel: '.reveal',       on: 'visible'    },
  { sel: '.ab-tl-item',   on: 'tl-visible' }
];

function applyAllReveals() {
  REVEAL_GROUPS.forEach(function (g) {
    document.querySelectorAll(g.sel).forEach(function (el) { el.classList.add(g.on); });
  });
}
var revealTimer = setTimeout(applyAllReveals, 1500);
if ('IntersectionObserver' in window) {
  REVEAL_GROUPS.forEach(function (g) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add(g.on); io.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll(g.sel).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) { el.classList.add(g.on); }
      else { io.observe(el); }
    });
  });
  setTimeout(function () { clearTimeout(revealTimer); }, 500);
} else {
  applyAllReveals();
}

/* ── FAQ accordion ── */
function toggleFaq(btn) {
  if (!btn || !btn.parentElement) return;
  var item = btn.parentElement;
  var open = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function (i) {
    i.classList.remove('open');
    var q = i.querySelector('.faq-q');
    if (q) q.setAttribute('aria-expanded', 'false');
  });
  if (!open) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}
document.querySelectorAll('.faq-q').forEach(function (q) {
  q.addEventListener('click', function () { toggleFaq(q); });
  q.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(q); } });
});

/* ── Stat counter animation ── */
var COUNTER_STEPS = 50;
var COUNTER_INTERVAL_MS = 26;
function animateCounter(el) {
  var target = parseInt(el.dataset.count) || 0;
  var suf = el.dataset.suf || '';
  var n = 0;
  var inc = Math.ceil(target / COUNTER_STEPS);
  var numNode = document.createTextNode('');
  var span = document.createElement('span');
  span.textContent = suf;
  el.textContent = '';
  el.appendChild(numNode);
  el.appendChild(span);
  var t = setInterval(function () {
    n = Math.min(n + inc, target);
    numNode.nodeValue = n;
    if (n >= target) clearInterval(t);
  }, COUNTER_INTERVAL_MS);
}
var statIO = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.astat-n[data-count]').forEach(animateCounter);
      statIO.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
var statsEl = document.querySelector('.about-stats');
if (statsEl) statIO.observe(statsEl);

/* ── Contact form with validation ── */
var form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var valid = true;
    this.querySelectorAll('[required]').forEach(function (field) {
      var empty = field.value.trim() === '';
      var emailInvalid = field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      /* Phone validation: Indian format — +91 (optional) followed by 6-9 and 9 digits */
      var phoneInvalid = false;
      if (field.type === 'tel' && field.value.trim()) {
        var phone = field.value.replace(/[\s\-\(\)]/g, '');
        phoneInvalid = !/^(\+91)?[6-9]\d{9}$/.test(phone);
      }
      if (empty || emailInvalid || phoneInvalid) {
        valid = false;
        var cselWrap = field.type === 'hidden' ? document.getElementById('csel-' + field.id) : null;
        if (cselWrap) { cselWrap.classList.add('error'); } else { field.classList.add('error'); }
      } else {
        var cselWrapOk = field.type === 'hidden' ? document.getElementById('csel-' + field.id) : null;
        if (cselWrapOk) { cselWrapOk.classList.remove('error'); } else { field.classList.remove('error'); }
      }
    });
    if (!valid) return;
    var btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = '';
    var spinner = document.createElement('i');
    spinner.className = 'fa-solid fa-spinner fa-spin';
    btn.appendChild(spinner);
    btn.appendChild(document.createTextNode(' Sending...'));
    var action = this.action;
    try {
      var res = await fetch(action, { method: 'POST', body: new FormData(this), headers: { Accept: 'application/json' } });
      var data = await res.json();
      if (data.success) { showSuccess(); trackEvent('form_submit', 'contact', 'success'); }
      else { showError(); trackEvent('form_submit', 'contact', 'api_error'); }
    } catch (err) {
      showError();
      trackEvent('form_submit', 'contact', 'network_error');
    }
  });
  form.querySelectorAll('[required]').forEach(function (f) {
    f.addEventListener('input', function () { f.classList.remove('error'); });
  });
}
function resetSubmitBtn() {
  var btn = document.getElementById('submit-btn');
  if (!btn) return;
  btn.disabled = false;
  btn.textContent = '';
  var icon = document.createElement('i');
  icon.className = 'fa-solid fa-paper-plane';
  btn.appendChild(icon);
  btn.appendChild(document.createTextNode(' Send Message & Get Free Consultation'));
}
function showSuccess() {
  var formBody = document.getElementById('form-body');
  var formError = document.getElementById('form-error');
  var formSuccess = document.getElementById('form-success');
  if (formBody) formBody.style.display = 'none';
  if (formError) formError.style.display = 'none';
  if (formSuccess) formSuccess.style.display = 'block';
}
function showError() {
  resetSubmitBtn();
  var f = document.getElementById('contact-form');
  if (!f) return;
  var name = ((f.querySelector('[name="first_name"]')?.value || '') + ' ' + (f.querySelector('[name="last_name"]')?.value || '')).trim();
  var email = f.querySelector('[name="email"]')?.value || '';
  var phone = f.querySelector('[name="phone"]')?.value || '';
  var msg = f.querySelector('[name="message"]')?.value || '';
  var subject = encodeURIComponent('Website Enquiry from ' + name);
  var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nPhone: ' + phone + '\n\n' + msg);
  var mailtoLink = document.getElementById('fe-mailto-link');
  if (mailtoLink) mailtoLink.href = 'mailto:info@softwaller.com?subject=' + subject + '&body=' + body;
  var formBody = document.getElementById('form-body');
  var formError = document.getElementById('form-error');
  if (formBody) formBody.style.display = 'none';
  if (formError) formError.style.display = 'block';
}
function retryForm() {
  var formError = document.getElementById('form-error');
  var formBody = document.getElementById('form-body');
  if (formError) formError.style.display = 'none';
  if (formBody) formBody.style.display = 'block';
  resetSubmitBtn();
}

/* ── Cookie consent — DPDPA compliant ── */
function initCookieConsent() {
  var consent = localStorage.getItem('sw_cookie');
  if (consent === 'accepted') {
    loadGA4();
    loadClarity();
    loadTawkTo();
  } else if (consent === 'rejected') {
    /* Don't load GA4, don't show banner */
  } else {
    /* No choice yet — show banner after delay */
    setTimeout(function () {
      var banner = document.getElementById('cookie');
      if (banner) banner.classList.add('show');
    }, 2000);
  }
}
function acceptCookie() {
  localStorage.setItem('sw_cookie', 'accepted');
  closeCookie();
  loadGA4();
  loadClarity();
  loadTawkTo();
  trackEvent('cookie_consent', 'compliance', 'accepted');
}
function rejectCookie() {
  localStorage.setItem('sw_cookie', 'rejected');
  closeCookie();
}
function closeCookie() {
  var banner = document.getElementById('cookie');
  if (banner) banner.classList.remove('show');
}
function loadGA4() {
  if (document.getElementById('ga4-script')) return;
  var s = document.createElement('script');
  s.id = 'ga4-script';
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-EXWE1WLTVE';
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () { dataLayer.push(arguments); };
  }
  gtag('js', new Date());
  gtag('config', 'G-EXWE1WLTVE');
}

/* ── Microsoft Clarity — heatmaps & session recordings ── */
function loadClarity() {
  if (window.clarity) return;
  (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","w3ftuv8jjc");
}

/* ── Tawk.to live chat — loaded only after cookie consent ── */
function loadTawkTo() {
  if (window.Tawk_API && window.Tawk_API.onLoaded) return;
  var Tawk_API = window.Tawk_API || {};
  var Tawk_LoadStart = new Date();
  window.Tawk_API = Tawk_API;
  window.Tawk_LoadStart = Tawk_LoadStart;
  var s1 = document.createElement('script');
  s1.async = true;
  s1.src = 'https://embed.tawk.to/69c94e34d2d96c1c3cdc0170/1jkt5ivim';
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  document.head.appendChild(s1);
}

/* ── Page loader — dismiss on load (not hardcoded timeout) ── */
window.addEventListener('load', function () {
  var remaining = 800; /* minimum ms to show loader for animation */
  setTimeout(function () {
    var loader = document.getElementById('sw-loader');
    if (loader) { loader.classList.add('hide'); setTimeout(function () { loader.remove(); }, 600); }
  }, remaining);

  /* Init cookie consent */
  initCookieConsent();
});

/* ── Footer accordion — open on desktop, collapsible on mobile ── */
function initFooterCols() {
  var cols = document.querySelectorAll('.fc-col');
  if (window.innerWidth > 768) {
    cols.forEach(function (d) {
      d.classList.add('open');
      var btn = d.querySelector('.fc-head');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    });
  } else {
    cols.forEach(function (d) {
      d.classList.remove('open');
      var btn = d.querySelector('.fc-head');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }
}
initFooterCols();
var resizeTimer;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initFooterCols, 150);
});
/* Mobile accordion toggle on .fc-head click */
document.addEventListener('click', function (e) {
  if (window.innerWidth > 768) return;
  var head = e.target.closest('.fc-head');
  if (!head) return;
  var col = head.closest('.fc-col');
  if (!col) return;
  var open = col.classList.toggle('open');
  head.setAttribute('aria-expanded', open ? 'true' : 'false');
});

/* ── Policy modals with focus trap ── */
var lastFocusedElement = null;

function openPolicy(id) {
  lastFocusedElement = document.activeElement;
  var modal = document.getElementById('pol-' + id);
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  /* Move focus to close button */
  var closeBtn = modal.querySelector('.pol-close');
  if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 100);
}

function closePolicy(id) {
  var modal = document.getElementById('pol-' + id);
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  /* Return focus */
  if (lastFocusedElement) lastFocusedElement.focus();
}

/* Close on Escape key */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.pol-overlay.open').forEach(function (el) {
      el.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocusedElement) lastFocusedElement.focus();
    });
  }
  /* Focus trap in open modals */
  if (e.key === 'Tab') {
    var openModal = document.querySelector('.pol-overlay.open .pol-modal');
    if (!openModal) return;
    var focusable = openModal.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
});

/* ── Event delegation — replaces all inline onclick handlers ── */
document.addEventListener('click', function (e) {
  /* data-goto="sectionId" — smooth scroll navigation */
  var gotoEl = e.target.closest('[data-goto]');
  if (gotoEl) { e.preventDefault(); goto(gotoEl.dataset.goto); return; }

  /* data-open-policy="policyId" — open policy modal */
  var openPol = e.target.closest('[data-open-policy]');
  if (openPol) { e.preventDefault(); openPolicy(openPol.dataset.openPolicy); return; }

  /* data-close-policy="policyId" — close policy modal */
  var closePol = e.target.closest('[data-close-policy]');
  if (closePol) { e.preventDefault(); closePolicy(closePol.dataset.closePolicy); return; }

  /* data-action="retryForm" */
  var actionEl = e.target.closest('[data-action]');
  if (actionEl) {
    var action = actionEl.dataset.action;
    if (action === 'retryForm') { retryForm(); }
    else if (action === 'acceptCookie') { acceptCookie(); }
    else if (action === 'rejectCookie') { rejectCookie(); }
    else if (action === 'formNextStep') { formNextStep(); }
    else if (action === 'formPrevStep') { formPrevStep(); }
    else if (action === 'closeExitPopup') { closeExitPopup(); }
    else if (action === 'scrollTop') { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    return;
  }

  /* Policy overlay click-to-close (click on overlay background) */
  if (e.target.classList.contains('pol-overlay') && e.target.classList.contains('open')) {
    var polId = e.target.id.replace('pol-', '');
    closePolicy(polId);
    return;
  }

  /* Sitemap links: data-sitemap-goto / data-sitemap-policy */
  var smGoto = e.target.closest('[data-sitemap-goto]');
  if (smGoto) { e.preventDefault(); closePolicy('sitemap'); goto(smGoto.dataset.sitemapGoto); return; }

  var smPol = e.target.closest('[data-sitemap-policy]');
  if (smPol) { e.preventDefault(); closePolicy('sitemap'); openPolicy(smPol.dataset.sitemapPolicy); return; }
});

/* ── GA4 Event Tracking — CTA clicks, WhatsApp, phone ── */
document.addEventListener('click', function (e) {
  /* WhatsApp button */
  if (e.target.closest('#wa-btn')) {
    trackEvent('click', 'whatsapp', 'floating_button');
  }
  /* Phone links */
  var phoneLink = e.target.closest('a[href^="tel:"]');
  if (phoneLink) {
    trackEvent('click', 'phone', phoneLink.href);
  }
  /* CTA buttons */
  var cta = e.target.closest('.btn-primary, .n-cta, .btn-white, .faq-cta-btn, .mob-cta');
  if (cta) {
    trackEvent('click', 'cta', cta.textContent.trim().substring(0, 40));
  }
  /* Product page links from services section */
  var svcLink = e.target.closest('.svc-link');
  if (svcLink) {
    trackEvent('click', 'service_link', svcLink.href);
  }
  /* Book-a-call link */
  if (e.target.closest('#book-call-btn, .exit-book')) {
    trackEvent('click', 'cta', 'book_a_call');
  }
});

/* ── Custom Select dropdowns (accessible) ── */
(function () {
  document.querySelectorAll('.csel').forEach(function (csel) {
    var trigger = csel.querySelector('.csel-trigger');
    var valSpan = csel.querySelector('.csel-value');
    var optionsWrap = csel.querySelector('.csel-options');
    var hiddenId = csel.id.replace('csel-', '');
    var hidden = document.getElementById(hiddenId);
    var opts = csel.querySelectorAll('.csel-opt');
    valSpan.classList.add('placeholder');

    /* A11y attributes */
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('tabindex', '0');
    if (optionsWrap) optionsWrap.setAttribute('role', 'listbox');
    opts.forEach(function (opt) { opt.setAttribute('role', 'option'); });

    function openDropdown() {
      document.querySelectorAll('.csel.open').forEach(function (other) { if (other !== csel) { other.classList.remove('open'); other.querySelector('.csel-trigger').setAttribute('aria-expanded', 'false'); } });
      csel.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function closeDropdown() {
      csel.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function selectOpt(opt) {
      opts.forEach(function (o) { o.classList.remove('selected'); o.removeAttribute('aria-selected'); });
      opt.classList.add('selected');
      opt.setAttribute('aria-selected', 'true');
      valSpan.textContent = opt.textContent;
      valSpan.classList.remove('placeholder');
      if (hidden) hidden.value = opt.dataset.val;
      csel.classList.remove('error');
      closeDropdown();
      trigger.focus();
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (csel.classList.contains('open')) closeDropdown(); else openDropdown();
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (csel.classList.contains('open')) closeDropdown(); else openDropdown(); }
      if (e.key === 'Escape') { closeDropdown(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); openDropdown(); var first = csel.querySelector('.csel-opt'); if (first) first.focus(); }
    });

    opts.forEach(function (opt, idx) {
      opt.setAttribute('tabindex', '-1');
      opt.addEventListener('click', function (e) { e.stopPropagation(); selectOpt(opt); });
      opt.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectOpt(opt); }
        if (e.key === 'Escape') { closeDropdown(); trigger.focus(); }
        if (e.key === 'ArrowDown') { e.preventDefault(); var next = opts[idx + 1]; if (next) next.focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); if (idx > 0) opts[idx - 1].focus(); else trigger.focus(); }
      });
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.csel.open').forEach(function (c) { c.classList.remove('open'); c.querySelector('.csel-trigger').setAttribute('aria-expanded', 'false'); });
  });
})();

/* ── Multi-step form ── */
function formNextStep() {
  var step1 = document.getElementById('form-step-1');
  if (!step1) return;
  var valid = true;
  step1.querySelectorAll('[required]').forEach(function (field) {
    var empty = field.value.trim() === '';
    var emailInvalid = field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
    var phoneInvalid = false;
    if (field.type === 'tel' && field.value.trim()) {
      var phone = field.value.replace(/[\s\-\(\)]/g, '');
      phoneInvalid = !/^(\+91)?[6-9]\d{9}$/.test(phone);
    }
    if (empty || emailInvalid || phoneInvalid) {
      field.classList.add('error'); valid = false;
    } else {
      field.classList.remove('error');
    }
  });
  if (!valid) return;
  var step2 = document.getElementById('form-step-2');
  if (!step2) return;
  step1.style.display = 'none';
  step2.style.display = 'block';
  /* Update step bar */
  document.querySelectorAll('.fsb-step').forEach(function (s) {
    if (s.dataset.step === '1') { s.classList.remove('active'); s.classList.add('done'); }
    if (s.dataset.step === '2') { s.classList.add('active'); }
  });
  var fill = document.querySelector('.fsb-line-fill');
  if (fill) fill.style.width = '100%';
  trackEvent('form_step', 'contact', 'step2_reached');
}
function formPrevStep() {
  var step2 = document.getElementById('form-step-2');
  var step1 = document.getElementById('form-step-1');
  if (!step2 || !step1) return;
  step2.style.display = 'none';
  step1.style.display = 'block';
  document.querySelectorAll('.fsb-step').forEach(function (s) {
    if (s.dataset.step === '1') { s.classList.add('active'); s.classList.remove('done'); }
    if (s.dataset.step === '2') { s.classList.remove('active'); }
  });
  var fill = document.querySelector('.fsb-line-fill');
  if (fill) fill.style.width = '0';
}

/* ── Exit-intent popup (desktop only, once per session) ── */
var exitShown = false;
function showExitPopup() {
  if (exitShown) return;
  if (sessionStorage.getItem('sw_exit_shown')) return;
  if (document.getElementById('form-success')?.style.display === 'block') return;
  var popup = document.getElementById('exit-popup');
  if (popup) {
    popup.classList.add('open');
    exitShown = true;
    sessionStorage.setItem('sw_exit_shown', '1');
    trackEvent('popup', 'exit_intent', 'shown');
  }
}
function closeExitPopup() {
  var popup = document.getElementById('exit-popup');
  if (popup) popup.classList.remove('open');
}
/* Trigger on mouse leaving viewport (desktop only) */
if (window.innerWidth > 768) {
  document.addEventListener('mouseleave', function (e) {
    if (e.clientY < 10) showExitPopup();
  });
}
/* Close on Escape */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeExitPopup();
});

/* ── Newsletter form (Brevo) — hidden iframe submit to avoid CORS ── */
var nlForm = document.getElementById('nl-subscribe');
if (nlForm) {
  /* Create hidden iframe as form target */
  var nlIframe = document.createElement('iframe');
  nlIframe.name = 'nl-iframe';
  nlIframe.style.display = 'none';
  document.body.appendChild(nlIframe);
  nlForm.setAttribute('target', 'nl-iframe');

  nlForm.addEventListener('submit', function (e) {
    var emailInput = document.getElementById('nl-email');
    var email = emailInput ? emailInput.value.trim() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.preventDefault();
      if (emailInput) emailInput.classList.add('nl-error');
      return;
    }
    emailInput.classList.remove('nl-error');
    var btn = document.getElementById('nl-submit-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subscribing...'; }
    /* Allow native form POST to hidden iframe — show success after short delay */
    setTimeout(function () {
      nlForm.style.display = 'none';
      var success = document.getElementById('nl-success');
      if (success) success.classList.add('show');
      trackEvent('newsletter', 'subscribe', 'success');
    }, 1500);
  });
  var nlEmail = document.getElementById('nl-email');
  if (nlEmail) nlEmail.addEventListener('input', function () { nlEmail.classList.remove('nl-error'); });
}

// Footer self-link aria-current marker (a11y)
document.addEventListener('DOMContentLoaded', function() {
  var path = window.location.pathname.replace(/\/index\.html$/, '/');
  var footerLinks = document.querySelectorAll('footer a, .pfooter a, .fc-links a');
  footerLinks.forEach(function(link) {
    try {
      var linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/index\.html$/, '/');
      if (linkPath === path && link.getAttribute('href').indexOf('#') === -1) {
        link.setAttribute('aria-current', 'page');
      }
    } catch (e) { /* ignore invalid URLs */ }
  });
});
