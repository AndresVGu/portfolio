function initTimeline() {
  const steps = document.querySelectorAll(".step");
  if (!steps.length) return;

  if (window.__timelineObserver) {
    window.__timelineObserver.disconnect();
  }

  // Reveal a step immediately (no animation)
  function revealStep(step) {
    const dot    = step.querySelector(".dot");
    const lefts  = step.querySelectorAll(".content-left");
    const rights = step.querySelectorAll(".content-right");

    lefts.forEach(el => el.classList.remove("opacity-0", "translate-y-10"));
    rights.forEach(el => el.classList.remove("opacity-0", "translate-y-10"));

    if (dot) {
      dot.classList.remove("bg-black/30", "dark:bg-white/30");
      dot.classList.add("bg-yellow-400", "shadow-lg", "shadow-yellow-400/60");
    }
  }

  // First step is always visible immediately — no scroll needed
  revealStep(steps[0]);

  const revealed = new WeakSet();
  revealed.add(steps[0]);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const step = entry.target;
      if (revealed.has(step)) return;

      if (entry.isIntersecting) {
        revealed.add(step);

        const dot    = step.querySelector(".dot");
        const lefts  = step.querySelectorAll(".content-left");
        const rights = step.querySelectorAll(".content-right");

        lefts.forEach(el => el.classList.remove("opacity-0", "translate-y-10"));
        rights.forEach((el, i) => {
          setTimeout(() => el.classList.remove("opacity-0", "translate-y-10"), i * 100);
        });

        if (dot) {
          dot.classList.remove("bg-black/30", "dark:bg-white/30");
          dot.classList.add("bg-yellow-400", "shadow-lg", "shadow-yellow-400/60", "dot-pop");
        }
      }
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -50px 0px" });

  // Observe all steps except the first
  steps.forEach((step, i) => {
    if (i > 0) observer.observe(step);
  });

  window.__timelineObserver = observer;

  // ✨ GLOW effect on cards
  document.querySelectorAll(".card").forEach(card => {
    const glow = card.querySelector(".glow");
    if (!glow) return;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,215,0,0.25), transparent 40%)`;
      glow.style.opacity = "1";
    });

    card.addEventListener("mouseleave", () => {
      glow.style.opacity = "0";
    });
  });
}

document.addEventListener("astro:page-load", initTimeline);
