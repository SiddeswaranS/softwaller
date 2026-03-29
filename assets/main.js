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

/* ── Scroll progress bar ── */
window.addEventListener('scroll', function () {
  var el = document.getElementById('progress-bar');
  var h = document.body.scrollHeight - window.innerHeight;
  if (el && h > 0) el.style.width = (window.scrollY / h * 100) + '%';

  /* Header shadow on scroll */
  var header = document.getElementById('site-header');
  if (header) header.classList.toggle('scrolled', window.scrollY > 20);

  /* Back to top visibility */
  var btt = document.getElementById('btt');
  if (btt) btt.classList.toggle('visible', window.scrollY > 400);
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
  var item = btn.parentElement;
  var open = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function (i) {
    i.classList.remove('open');
    i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
  });
  if (!open) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}
document.querySelectorAll('.faq-q').forEach(function (q) {
  q.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(q); } });
});

/* ── Stat counter animation ── */
function animateCounter(el) {
  var target = parseInt(el.dataset.count) || 0;
  var suf = el.dataset.suf || '';
  var n = 0;
  var inc = Math.ceil(target / 50);
  var t = setInterval(function () {
    n = Math.min(n + inc, target);
    el.innerHTML = n + '<span>' + suf + '</span>';
    if (n >= target) clearInterval(t);
  }, 26);
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
      /* Phone validation: Indian format */
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
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
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
function showSuccess() {
  document.getElementById('form-body').style.display = 'none';
  document.getElementById('form-error').style.display = 'none';
  document.getElementById('form-success').style.display = 'block';
}
function showError() {
  var btn = document.getElementById('submit-btn');
  btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message & Get Free Consultation';
  var f = document.getElementById('contact-form');
  var name = ((f.querySelector('[name="first_name"]')?.value || '') + ' ' + (f.querySelector('[name="last_name"]')?.value || '')).trim();
  var email = f.querySelector('[name="email"]')?.value || '';
  var phone = f.querySelector('[name="phone"]')?.value || '';
  var msg = f.querySelector('[name="message"]')?.value || '';
  var subject = encodeURIComponent('Website Enquiry from ' + name);
  var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nPhone: ' + phone + '\n\n' + msg);
  document.getElementById('fe-mailto-link').href = 'mailto:info@softwaller.com?subject=' + subject + '&body=' + body;
  document.getElementById('form-body').style.display = 'none';
  document.getElementById('form-error').style.display = 'block';
}
function retryForm() {
  document.getElementById('form-error').style.display = 'none';
  document.getElementById('form-body').style.display = 'block';
  var btn = document.getElementById('submit-btn');
  btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message &amp; Get Free Consultation';
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
  window.gtag = function () { dataLayer.push(arguments); };
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
window.addEventListener('resize', initFooterCols);

/* ── Policy modals with focus trap ── */
var lastFocusedElement = null;

function openPolicy(id) {
  lastFocusedElement = document.activeElement;
  var modal = document.getElementById('pol-' + id);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  /* Move focus to close button */
  var closeBtn = modal.querySelector('.pol-close');
  if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 100);
}

function closePolicy(id) {
  var modal = document.getElementById('pol-' + id);
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
});
