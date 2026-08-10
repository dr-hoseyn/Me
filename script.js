const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const siteHeader = document.querySelector(".site-header");
const year = document.querySelector("#year");
const signalMap = document.querySelector(".signal-map");
const previewFrames = document.querySelectorAll(".preview-frame");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileNavQuery = window.matchMedia("(max-width: 900px)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

if (year) year.textContent = new Date().getFullYear();

const updateHeader = () => {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 18);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const syncMenuAccessibility = () => {
  if (!navLinks) return;
  const isHidden = mobileNavQuery.matches && !navLinks.classList.contains("is-open");
  navLinks.inert = isHidden;
  if (mobileNavQuery.matches) navLinks.setAttribute("aria-hidden", String(isHidden));
  else navLinks.removeAttribute("aria-hidden");
};

const closeMenu = () => {
  navLinks?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
  syncMenuAccessibility();
};

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    syncMenuAccessibility();
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
    else syncMenuAccessibility();
  });

  syncMenuAccessibility();
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

if (signalMap && !reduceMotion && finePointerQuery.matches) {
  let mapFrame;
  let mapX = 0;
  let mapY = 0;

  signalMap.addEventListener("pointermove", (event) => {
    const rect = signalMap.getBoundingClientRect();
    mapX = (event.clientX - rect.left) / rect.width - 0.5;
    mapY = (event.clientY - rect.top) / rect.height - 0.5;
    if (mapFrame) return;
    mapFrame = window.requestAnimationFrame(() => {
      signalMap.style.setProperty("--map-x", `${mapX * 6}px`);
      signalMap.style.setProperty("--map-y", `${mapY * 6}px`);
      mapFrame = undefined;
    });
  });

  signalMap.addEventListener("pointerleave", () => {
    if (mapFrame) window.cancelAnimationFrame(mapFrame);
    mapFrame = undefined;
    signalMap.style.setProperty("--map-x", "0px");
    signalMap.style.setProperty("--map-y", "0px");
  });
}

if (!reduceMotion && finePointerQuery.matches) {
  document.querySelectorAll(".case-study, .bot-card, .repo-card").forEach((surface) => {
    let glowFrame;
    let pointerX = 0;
    let pointerY = 0;

    surface.addEventListener("pointermove", (event) => {
      const rect = surface.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      if (glowFrame) return;
      glowFrame = window.requestAnimationFrame(() => {
        surface.style.setProperty("--spot-x", `${pointerX}px`);
        surface.style.setProperty("--spot-y", `${pointerY}px`);
        glowFrame = undefined;
      });
    });

    surface.addEventListener("pointerleave", () => {
      if (glowFrame) window.cancelAnimationFrame(glowFrame);
      glowFrame = undefined;
      surface.style.setProperty("--spot-x", "50%");
      surface.style.setProperty("--spot-y", "50%");
    });
  });
}
