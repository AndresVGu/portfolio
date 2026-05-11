function initAbout() {
  const scene = document.querySelector(".card-scene");
  if (!scene) return;

  const img   = scene.querySelector(".card-img");
  const holo  = scene.querySelector(".card-holo");
  const shine = scene.querySelector(".card-shine");
  if (!img || !holo || !shine) return;

  let rafId    = null;
  let targetRX = 0, targetRY = 0;
  let currentRX = 0, currentRY = 0;
  let isHovered = false;
  let lastPX = 0.5, lastPY = 0.5;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function updateLayers(px, py) {
    // px, py = 0..1 normalized cursor position

    // ── Rainbow holo base ──────────────────────────────────────────
    // A wide soft rainbow that shifts across the card
    const holoAngle = 135 + (px - 0.5) * 60;
    holo.style.background = `linear-gradient(
      ${holoAngle}deg,
      hsla(0,   100%, 60%, 0.12) 0%,
      hsla(30,  100%, 60%, 0.12) 14%,
      hsla(60,  100%, 60%, 0.12) 28%,
      hsla(120, 100%, 60%, 0.12) 42%,
      hsla(180, 100%, 60%, 0.12) 56%,
      hsla(240, 100%, 60%, 0.12) 70%,
      hsla(300, 100%, 60%, 0.12) 84%,
      hsla(360, 100%, 60%, 0.12) 100%
    )`;
    holo.style.opacity = "1";

    // ── Diagonal shine beam ────────────────────────────────────────
    // A narrow bright streak that moves diagonally with the cursor.
    // Position the beam center at the cursor, angled ~135deg.
    const beamX = px * 100;   // 0..100%
    const beamY = py * 100;

    // The beam is a tight linear-gradient perpendicular to its travel direction.
    // We use a rotated gradient and shift its position via background-position.
    const beamAngle = 135;
    // Distance along the beam axis (projects cursor onto the beam direction)
    const beamPos = (px * Math.cos(Math.PI * beamAngle / 180) +
                     py * Math.sin(Math.PI * beamAngle / 180));
    // Map to a percentage offset so the beam center follows the cursor
    const offset = (beamPos * 120 - 10).toFixed(1);

    shine.style.background = `linear-gradient(
      ${beamAngle}deg,
      transparent                          0%,
      transparent                          ${offset}%,
      rgba(255,255,255,0.0)                ${parseFloat(offset) + 4}%,
      rgba(255,255,255,0.55)               ${parseFloat(offset) + 8}%,
      rgba(255,255,255,0.85)               ${parseFloat(offset) + 10}%,
      rgba(255,255,255,0.55)               ${parseFloat(offset) + 12}%,
      rgba(255,255,255,0.0)                ${parseFloat(offset) + 16}%,
      transparent                          ${parseFloat(offset) + 20}%,
      transparent                          100%
    )`;

    // Intensity based on how far from center the cursor is
    const dist = Math.sqrt((px - 0.5) ** 2 + (py - 0.5) ** 2);
    shine.style.opacity = (0.3 + dist * 1.4).toFixed(2);
  }

  function animate() {
    currentRX = lerp(currentRX, targetRX, 0.1);
    currentRY = lerp(currentRY, targetRY, 0.1);

    img.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg) scale(${isHovered ? 1.04 : 1})`;

    if (!isHovered) {
      if (Math.abs(currentRX) > 0.05 || Math.abs(currentRY) > 0.05) {
        // Still easing back — keep updating layers with fading opacity
        updateLayers(lastPX, lastPY);
        const progress = 1 - Math.max(Math.abs(currentRX), Math.abs(currentRY)) / 10;
        holo.style.opacity  = (1 - progress * 0.8).toFixed(2);
        shine.style.opacity = "0";
        rafId = requestAnimationFrame(animate);
      } else {
        img.style.transform = "";
        holo.style.opacity  = "0";
        shine.style.opacity = "0";
        rafId = null;
      }
      return;
    }

    updateLayers(lastPX, lastPY);
    rafId = requestAnimationFrame(animate);
  }

  function onMove(clientX, clientY) {
    const rect = scene.getBoundingClientRect();
    lastPX = Math.max(0, Math.min(1, (clientX - rect.left)  / rect.width));
    lastPY = Math.max(0, Math.min(1, (clientY - rect.top)   / rect.height));

    targetRX = (lastPY - 0.5) * -20;
    targetRY = (lastPX - 0.5) *  20;

    if (!rafId) rafId = requestAnimationFrame(animate);
  }

  scene.addEventListener("mouseenter", () => {
    isHovered = true;
    if (!rafId) rafId = requestAnimationFrame(animate);
  });

  scene.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));

  scene.addEventListener("mouseleave", () => {
    isHovered = false;
    targetRX  = 0;
    targetRY  = 0;
    if (!rafId) rafId = requestAnimationFrame(animate);
  });

  scene.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  }, { passive: true });

  scene.addEventListener("touchend", () => {
    isHovered = false;
    targetRX  = 0;
    targetRY  = 0;
    if (!rafId) rafId = requestAnimationFrame(animate);
  });
}

document.addEventListener("astro:page-load", initAbout);
