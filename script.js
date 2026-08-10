const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const siteHeader = document.querySelector(".site-header");
const year = document.querySelector("#year");
const signalMap = document.querySelector(".signal-map");
const previewFrames = document.querySelectorAll(".preview-frame");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (year) year.textContent = new Date().getFullYear();

const updateHeader = () => {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 18);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const closeMenu = () => {
  navLinks?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
};

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("is-open")) {
      closeMenu();
      navToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const observedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && observedSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      sectionLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${visible.target.id}`;
        if (isCurrent) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-30% 0px -55%", threshold: [0, 0.15, 0.4] }
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

const activatePreview = (frame) => {
  if (frame.dataset.activated === "true" || !frame.dataset.src) return;
  const preview = frame.closest(".live-preview");
  frame.dataset.activated = "true";
  frame.src = frame.dataset.src;
  window.setTimeout(() => preview?.classList.add("is-loaded"), 3500);
};

previewFrames.forEach((frame) => {
  frame.addEventListener("load", () => {
    if (frame.dataset.activated === "true") {
      frame.closest(".live-preview")?.classList.add("is-loaded");
    }
  });
});

const prepareLivePreviews = () => {
  if (!("IntersectionObserver" in window)) {
    previewFrames.forEach(activatePreview);
    return;
  }

  const previewObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activatePreview(entry.target);
          previewObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "500px 0px", threshold: 0.01 }
  );

  previewFrames.forEach((frame) => previewObserver.observe(frame));
};

if (document.readyState === "complete") {
  prepareLivePreviews();
} else {
  window.addEventListener("load", prepareLivePreviews, { once: true });
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px" }
  );

  revealElements.forEach((element, index) => {
    element.classList.add("can-reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 65}ms`);
    revealObserver.observe(element);
  });
}

if (signalMap && !reduceMotion) {
  signalMap.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const rect = signalMap.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    signalMap.style.setProperty("--map-x", `${x * 7}px`);
    signalMap.style.setProperty("--map-y", `${y * 7}px`);
  });

  signalMap.addEventListener("pointerleave", () => {
    signalMap.style.setProperty("--map-x", "0px");
    signalMap.style.setProperty("--map-y", "0px");
  });
}
