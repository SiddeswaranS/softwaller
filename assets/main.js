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

/* ── Scroll progress bar ── */
window.addEventListener('scroll', function () {
  var h = document.body.scrollHeight - window.innerHeight;
  if (cachedProgressBar && h > 0) cachedProgressBar.style.width = (window.scrollY / h * 100) + '%';

  /* Header shadow on scroll */
  if (cachedHeader) cachedHeader.classList.toggle('scrolled', window.scrollY > 20);

  /* Back to top visibility */
  if (cachedBtt) cachedBtt.classList.toggle('visible', window.scrollY > 400);
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

/* ── Active nav (IntersectionObserver) ── */
var sects = ['home', 'about', 'services', 'showcase', 'why', 'process', 'testimonials', 'faq', 'contact'];
var navIO = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) {
      sects.forEach(function (s) { var a = document.getElementById('nl-' + s); if (a) a.classList.remove('active'); });
      var a = document.getElementById('nl-' + e.target.id);
      if (a) a.classList.add('active');
    }
  });
}, { threshold: 0.3 });
sects.forEach(function (s) { var el = document.getElementById(s); if (el) navIO.observe(el); });

/* ── Scroll reveal — with bulletproof fallback ── */
function showAllReveal() { document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); }); }
var revealTimer = setTimeout(showAllReveal, 1500);
if ('IntersectionObserver' in window) {
  var revIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); revIO.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) { el.classList.add('visible'); }
    else { revIO.observe(el); }
  });
  setTimeout(function () { clearTimeout(revealTimer); }, 500);
} else {
  showAllReveal();
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
        field.classList.add('error'); valid = false;
      } else {
        field.classList.remove('error');
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

/* ── Page loader — dismiss on load (not hardcoded timeout) ── */
window.addEventListener('load', function () {
  var loaderStart = Date.now();
  var minDisplay = 800; /* minimum ms to show loader for animation */
  var elapsed = Date.now() - loaderStart;
  var remaining = Math.max(0, minDisplay - elapsed);
  setTimeout(function () {
    var loader = document.getElementById('sw-loader');
    if (loader) { loader.classList.add('hide'); setTimeout(function () { loader.remove(); }, 600); }
  }, remaining);

  /* Init cookie consent */
  initCookieConsent();
});

/* ── Footer accordion — open on desktop, collapsible on mobile ── */
function initFooterCols() {
  var cols = document.querySelectorAll('details.fc-col');
  if (window.innerWidth > 768) {
    cols.forEach(function (d) { d.setAttribute('open', ''); });
  } else {
    cols.forEach(function (d) { d.removeAttribute('open'); });
  }
}
initFooterCols();
var resizeTimer;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initFooterCols, 150);
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
