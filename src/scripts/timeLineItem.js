function initTimeline() {
  const steps = document.querySelectorAll(".step");
  if (!steps.length) return;

  if (window.__timelineObserver) {
    window.__timelineObserver.disconnect();
  }

  // Track which steps have been revealed so we don't re-hide them
  const revealed = new WeakSet();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const step = entry.target;

      // Once revealed, never hide again — prevents glitchy reverse-scroll
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

  steps.forEach(step => observer.observe(step));
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
