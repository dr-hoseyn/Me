const canvas = document.querySelector("#scene-canvas");
const visual = document.querySelector(".scene-backdrop");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const year = document.querySelector("#year");

const pointer = { x: 0, y: 0 };
let THREE;
let renderer;
let scene;
let camera;
let mainMesh;
let particles;
let floatingGroup;
let ringsGroup;
let animationFrame;
let isLoadingThree = false;
let scrollProgress = 0;
let targetScrollProgress = 0;
let scrollVelocity = 0;
let lastScrollY = window.scrollY;

year.textContent = new Date().getFullYear();

if (window.lucide) {
  window.lucide.createIcons();
}

// Mobile navigation.
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

// Scroll reveal animation. Content stays visible if JavaScript fails.
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach((element) => {
    element.classList.add("can-reveal");
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const hasWebGL = () => {
  try {
    const testCanvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
};

const isMobile = window.matchMedia("(max-width: 720px)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!hasWebGL()) {
  visual.classList.add("is-fallback");
} else {
  loadThreeScene();
}

updateScrollProgress();

window.addEventListener("load", () => {
  if (!renderer && hasWebGL()) {
    loadThreeScene();
  }
});

async function loadThreeScene() {
  if (isLoadingThree || renderer) {
    return;
  }

  isLoadingThree = true;
  try {
    const timeout = new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error("Three.js load timeout")), 5000);
    });

    THREE = await Promise.race([
      import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js"),
      timeout,
    ]);
    initScene();
  } catch (error) {
    console.warn("Three.js could not be loaded.", error);
    visual.classList.add("is-fallback");
  } finally {
    isLoadingThree = false;
  }
}

function initScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07090f, isMobile ? 0.045 : 0.036);

  camera = new THREE.PerspectiveCamera(isMobile ? 48 : 44, 1, 0.1, 100);
  camera.position.set(0, 0.2, isMobile ? 7.8 : 7);

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const ambientLight = new THREE.AmbientLight(0xb9d5ff, 1.05);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x67e8f9, 2.4);
  keyLight.position.set(2.5, 3.2, 4.4);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xfda4af, 2.3, 12);
  fillLight.position.set(-3.4, -1.6, 3.2);
  scene.add(fillLight);

  floatingGroup = new THREE.Group();
  scene.add(floatingGroup);

  ringsGroup = new THREE.Group();
  scene.add(ringsGroup);

  createMainMesh();
  createEnergyRings();
  createFloatingObjects();
  createParticles();
  handleResize();
  updateScrollProgress();

  window.addEventListener("resize", handleResize);
  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("scroll", updateScrollProgress, { passive: true });

  animate();
}

function createMainMesh() {
  const geometry = new THREE.TorusKnotGeometry(isMobile ? 1.08 : 1.72, isMobile ? 0.25 : 0.38, isMobile ? 96 : 180, 18);
  const material = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    metalness: 0.42,
    roughness: 0.28,
    emissive: 0x0b2430,
    emissiveIntensity: 0.38,
  });

  mainMesh = new THREE.Mesh(geometry, material);
  floatingGroup.add(mainMesh);

  const wireGeometry = new THREE.IcosahedronGeometry(isMobile ? 1.75 : 3.05, 2);
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xc4b5fd,
    wireframe: true,
    transparent: true,
    opacity: isMobile ? 0.12 : 0.16,
  });

  const wireShell = new THREE.Mesh(wireGeometry, wireMaterial);
  floatingGroup.add(wireShell);
}

function createEnergyRings() {
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x86efac,
    wireframe: true,
    transparent: true,
    opacity: isMobile ? 0.08 : 0.12,
  });

  const accentMaterial = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    wireframe: true,
    transparent: true,
    opacity: isMobile ? 0.07 : 0.1,
  });

  const count = isMobile ? 3 : 5;

  for (let i = 0; i < count; i += 1) {
    const radius = (isMobile ? 2.1 : 3.25) + i * 0.55;
    const tube = isMobile ? 0.004 : 0.006;
    const geometry = new THREE.TorusGeometry(radius, tube, 8, 160);
    const mesh = new THREE.Mesh(geometry, i % 2 ? accentMaterial : ringMaterial);
    mesh.rotation.set(Math.PI / 2 + i * 0.26, i * 0.42, Math.PI / 10);
    mesh.userData.drift = 0.0006 + i * 0.00018;
    ringsGroup.add(mesh);
  }
}

function createFloatingObjects() {
  const shapes = [
    new THREE.OctahedronGeometry(0.18, 0),
    new THREE.TetrahedronGeometry(0.18, 0),
    new THREE.IcosahedronGeometry(0.16, 0),
  ];

  const colors = [0x86efac, 0xfda4af, 0x67e8f9, 0xc4b5fd];
  const count = isMobile ? 8 : 18;

  for (let i = 0; i < count; i += 1) {
    const material = new THREE.MeshStandardMaterial({
      color: colors[i % colors.length],
      metalness: 0.2,
      roughness: 0.35,
      transparent: true,
      opacity: 0.76,
    });
    const mesh = new THREE.Mesh(shapes[i % shapes.length], material);
    const angle = (i / count) * Math.PI * 2;
    const radius = (isMobile ? 2.1 : 3.25) + Math.sin(i * 1.7) * 0.55;

    mesh.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.3) * 1.15, Math.sin(angle) * radius * 0.55);
    mesh.rotation.set(i * 0.5, i * 0.3, i * 0.2);
    mesh.userData.speed = 0.004 + i * 0.00035;
    floatingGroup.add(mesh);
  }
}

function createParticles() {
  const count = isMobile ? 220 : 680;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * (isMobile ? 9 : 15);
    positions[i3 + 1] = (Math.random() - 0.5) * (isMobile ? 8 : 10);
    positions[i3 + 2] = (Math.random() - 0.5) * (isMobile ? 9 : 13);
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xd8deea,
    size: isMobile ? 0.018 : 0.026,
    transparent: true,
    opacity: isMobile ? 0.46 : 0.62,
    depthWrite: false,
  });

  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
}

function handleResize() {
  const { width, height } = visual.getBoundingClientRect();

  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function handlePointerMove(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
  pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
}

function updateScrollProgress() {
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const current = window.scrollY;
  const nextProgress = Math.min(1, Math.max(0, current / scrollable));

  scrollVelocity = current - lastScrollY;
  lastScrollY = current;
  targetScrollProgress = nextProgress;
  document.documentElement.style.setProperty("--scroll-progress", nextProgress.toFixed(4));
  document.documentElement.style.setProperty("--spot-x", `${68 - nextProgress * 24}%`);
  document.documentElement.style.setProperty("--spot-y", `${36 + nextProgress * 30}%`);
}

function animate(time = 0) {
  animationFrame = requestAnimationFrame(animate);

  const motion = reduceMotion ? 0.25 : 1;
  const t = time * 0.001;
  const velocityPulse = Math.min(1, Math.abs(scrollVelocity) / 80);

  scrollProgress += (targetScrollProgress - scrollProgress) * 0.075;
  scrollVelocity *= 0.88;

  mainMesh.rotation.x += (0.003 + scrollProgress * 0.005 + velocityPulse * 0.006) * motion;
  mainMesh.rotation.y += (0.006 + scrollProgress * 0.009 + velocityPulse * 0.008) * motion;

  const targetX = isMobile ? 0 : 1.55 - scrollProgress * 2.75;
  const targetY = (isMobile ? -0.25 : 0.08) + Math.sin(t * 0.8) * 0.14 + scrollProgress * 0.52;
  const targetZ = -scrollProgress * (isMobile ? 1.8 : 3.3);

  floatingGroup.position.x += (targetX - floatingGroup.position.x) * 0.04;
  floatingGroup.position.y += (targetY - floatingGroup.position.y) * 0.04;
  floatingGroup.position.z += (targetZ - floatingGroup.position.z) * 0.04;
  floatingGroup.rotation.y += (pointer.x * 0.38 + scrollProgress * Math.PI * 1.25 - floatingGroup.rotation.y) * 0.035;
  floatingGroup.rotation.x += (-pointer.y * 0.22 + scrollProgress * 0.56 - floatingGroup.rotation.x) * 0.035;

  ringsGroup.position.copy(floatingGroup.position);
  ringsGroup.rotation.y += (pointer.x * 0.18 - ringsGroup.rotation.y + scrollProgress * Math.PI * 0.5) * 0.025;
  ringsGroup.rotation.x += (-pointer.y * 0.12 - ringsGroup.rotation.x + scrollProgress * 0.28) * 0.025;
  ringsGroup.children.forEach((ring, index) => {
    ring.rotation.z += (ring.userData.drift + velocityPulse * 0.002) * motion * (index % 2 ? -1 : 1);
  });

  floatingGroup.children.forEach((child, index) => {
    if (index > 1) {
      child.rotation.x += (child.userData.speed + velocityPulse * 0.002) * motion;
      child.rotation.y += (child.userData.speed * 1.4 + scrollProgress * 0.0015) * motion;
      child.position.y += Math.sin(t + index) * 0.0008 * motion;
    }
  });

  particles.rotation.y -= (0.0008 + scrollProgress * 0.002 + velocityPulse * 0.003) * motion;
  particles.rotation.x = Math.sin(t * 0.25) * 0.06 + scrollProgress * 0.2;
  particles.position.z = scrollProgress * 1.4;

  camera.position.x += ((isMobile ? 0 : pointer.x * 0.24) - camera.position.x) * 0.03;
  camera.position.y += (0.2 + pointer.y * -0.12 + scrollProgress * 0.2 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, -1.2);

  renderer.render(scene, camera);
}

window.addEventListener("pagehide", () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
});
