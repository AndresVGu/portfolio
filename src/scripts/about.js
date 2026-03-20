
  // Selecciona la imagen
  const imageContainer = document.querySelector(".col-span-2.group");
  const img = imageContainer.querySelector("img");

  // Mouse movement
  imageContainer.addEventListener("mousemove", e => {
    const rect = imageContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 10;  // -10° a 10°
    const rotateY = ((x - centerX) / centerX) * -10;

    img.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  });

  imageContainer.addEventListener("mouseleave", () => {
    img.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  });

  // Touch / móvil
  imageContainer.addEventListener("touchmove", e => {
    const touch = e.touches[0];
    const rect = imageContainer.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * -10;

    img.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  });

  imageContainer.addEventListener("touchend", () => {
    img.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  });
