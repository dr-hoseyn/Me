const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const year = document.querySelector("#year");
const signalMap = document.querySelector(".signal-map");
const previewFrames = document.querySelectorAll(".preview-frame");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (year) year.textContent = new Date().getFullYear();

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

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reduceMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" }
  );

  revealElements.forEach((element, index) => {
    element.classList.add("can-reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 70}ms`);
    observer.observe(element);
  });
}

if (signalMap && !reduceMotion) {
  signalMap.addEventListener("pointermove", (event) => {
    const rect = signalMap.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    signalMap.style.setProperty("--map-x", `${x * 9}px`);
    signalMap.style.setProperty("--map-y", `${y * 9}px`);
  });

  signalMap.addEventListener("pointerleave", () => {
    signalMap.style.setProperty("--map-x", "0px");
    signalMap.style.setProperty("--map-y", "0px");
  });
}
