function initTimeline() {
  const steps = document.querySelectorAll(".step");
  if (!steps.length) return;

  // Disconnect any previous observer stored on the window to avoid duplicates
  if (window.__timelineObserver) {
    window.__timelineObserver.disconnect();
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const step = entry.target;

      const left     = step.querySelector(".content-left");
      const right    = step.querySelector(".content-right");
      const dot      = step.querySelector(".dot");
      const progress = step.querySelector(".progress");

      if (!left || !right || !dot || !progress) return;

      if (entry.isIntersecting) {
        left.classList.remove("opacity-0", "translate-y-10");
        right.classList.remove("opacity-0", "translate-y-10");

        dot.classList.remove("bg-black/30", "dark:bg-white/30");
        dot.classList.add("bg-yellow-400", "shadow-lg", "shadow-yellow-400/60", "dot-pop");

        progress.style.height = "100%";
      } else {
        left.classList.add("opacity-0", "translate-y-10");
        right.classList.add("opacity-0", "translate-y-10");

        dot.classList.add("bg-black/30", "dark:bg-white/30");
        dot.classList.remove("bg-yellow-400", "shadow-lg", "dot-pop");

        progress.style.height = "0%";
      }
    });
  }, { threshold: 0.3 });

  steps.forEach(step => observer.observe(step));

  // Store reference so we can disconnect on next navigation
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

// Run on first load AND on every ViewTransitions navigation
document.addEventListener("astro:page-load", initTimeline);
