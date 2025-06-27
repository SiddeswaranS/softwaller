// Navbar scroll effect
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  if (window.scrollY > 50) {
    nav.style.background = "rgba(15, 20, 25, 0.98)";
    nav.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.3)";
  } else {
    nav.style.background = "rgba(15, 20, 25, 0.95)";
    nav.style.boxShadow = "none";
  }
});

// Mobile menu toggle
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Smooth scrolling and active link highlighting
document.querySelectorAll(".nav-links a").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    // Remove active class from all links
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.classList.remove("active");
    });

    // Add active class to clicked link
    this.classList.add("active");

    // Smooth scroll to target
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    // Close mobile menu
    navLinks.classList.remove("active");
  });
});

// Common observer options
const observerOptions = {
  root: null,
  threshold: 0.3,
  rootMargin: "-100px 0px -100px 0px",
};

// Highlight active menu item based on scroll position
const sections = document.querySelectorAll("section[id]");
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const currentSection = entry.target.getAttribute("id");
      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentSection}`) {
          link.classList.add("active");
        }
      });
    }
  });
}, observerOptions);

sections.forEach((section) => {
  sectionObserver.observe(section);
});

// Intersection Observer for animations
const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Animate elements on scroll
document
  .querySelectorAll(
    ".service-card, .use-case-card, .testimonial-card, .feature-list li, .contact-item"
  )
  .forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.6s ease";
    animationObserver.observe(el);
  });

// Chatbot functionality
function openChat() {
  window.location.href = "mailto:softwaller.sales@gmail.com";
}

// Hover effects
document
  .querySelectorAll(".service-card, .use-case-card, .contact-item")
  .forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px) scale(1.02)";
    });
    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });

// Parallax effect for hero background
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const heroBackground = document.querySelector(".hero-bg");
  if (heroBackground) {
    heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
});

// Loading animation completion
window.addEventListener("load", () => {
  setTimeout(() => {
    document.querySelector(".loader").style.display = "none";
  }, 2500);
});

// Floating elements animation
document.querySelectorAll(".floating-element").forEach((el, index) => {
  setTimeout(() => {
    el.style.animation = `floatAnimation ${6 + index}s ease-in-out infinite`;
  }, index * 200);
});

// KPI counter animation
const animateCounters = () => {
  const kpiBadges = document.querySelectorAll(".kpi-badge");
  kpiBadges.forEach((badge) => {
    const text = badge.textContent;
    const number = text.match(/\d+\.?\d*/);
    if (number) {
      const finalNumber = parseFloat(number[0]);
      let currentNumber = 0;
      const increment = finalNumber / 30;
      const counter = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= finalNumber) {
          currentNumber = finalNumber;
          clearInterval(counter);
        }
        badge.textContent = text.replace(
          /\d+\.?\d*/,
          Math.round(currentNumber * 10) / 10
        );
      }, 50);
    }
  });
};

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCounters();
      statsObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelector(".use-cases")?.addEventListener("animationstart", () => {
  statsObserver.observe(document.querySelector(".use-cases"));
});
