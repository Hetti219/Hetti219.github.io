// Nvidia-themed Portfolio JavaScript

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Create and append loader to body
  const loader = document.createElement("div");
  loader.className = "loader";
  loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-bar">
          <div class="loader-progress"></div>
        </div>
        <div class="loader-text">LOADING</div>
      </div>
    `;
  document.body.appendChild(loader);

  // Add Nvidia glow effect to all projects
  const projects = document.querySelectorAll(".project");
  projects.forEach((project) => {
    project.classList.add("nvidia-glow");
  });

  // Add particle effect to background (Nvidia-style)
  createParticleCanvas();

  // Remove loader after page loads
  window.addEventListener("load", function () {
    setTimeout(() => {
      loader.style.opacity = "0";
      loader.style.transition = "opacity 0.5s ease";
      setTimeout(() => {
        loader.remove();
      }, 500);
    }, 1500); // Show loader for at least 1.5 seconds
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll("nav a").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: "smooth",
      });
    });
  });

  // Header scroll effect
  const header = document.querySelector("header");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Project hover effect
  projects.forEach((project) => {
    project.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px)";
      this.style.boxShadow = "0 15px 30px rgba(118, 185, 0, 0.2)";
    });

    project.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.3)";
    });
  });

  // Animate elements on scroll
  const animateElements = document.querySelectorAll(
    "section h2, .project, #about p"
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1 }
  );

  animateElements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";
    element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(element);
  });
});

// Create Nvidia-themed particle canvas
function createParticleCanvas() {
  const canvas = document.createElement("canvas");
  canvas.id = "particle-canvas";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "-1";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Particle properties
  const particles = [];
  const particleCount = 40;
  const nvidiaGreen = "#76b900";
  const particleMaxSize = 4;

  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * particleMaxSize + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.2,
    });
  }

  // Animation function
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(118, 185, 0, ${p.opacity})`;
      ctx.fill();

      // Connect particles within a certain distance
      for (let j = i; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(118, 185, 0, ${0.1 * (1 - distance / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Update particle position
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap particles around edges
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
    }

    requestAnimationFrame(animateParticles);
  }

  // Handle window resize
  window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // Start animation
  animateParticles();
}

// Add typewriter effect for the header (Nvidia style)
document.addEventListener("DOMContentLoaded", function () {
  // Get or create an element for the header intro text
  let introText = document.querySelector(".header-intro");
  if (!introText) {
    introText = document.createElement("div");
    introText.className = "header-intro";
    introText.style.color = "#76b900";
    introText.style.fontSize = "1.2rem";
    introText.style.fontWeight = "500";
    introText.style.marginTop = "0.5rem";
    introText.style.fontFamily = "monospace";
    introText.style.letterSpacing = "1px";

    // Insert before the nav element in header
    const header = document.querySelector("header");
    const nav = document.querySelector("nav");
    header.insertBefore(introText, nav);
  }

  // Text to display with typewriter effect
  const text = "DEVELOPER · GAME CREATOR · SECURITY ENTHUSIAST";
  let charIndex = 0;

  function typeWriter() {
    if (charIndex < text.length) {
      introText.textContent += text.charAt(charIndex);
      charIndex++;
      setTimeout(typeWriter, 50);
    } else {
      // Add blinking cursor effect after typing is complete
      introText.innerHTML =
        introText.textContent + '<span class="cursor">|</span>';

      // Create blinking cursor style
      const style = document.createElement("style");
      style.innerHTML = `
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .cursor {
            animation: blink 1s infinite;
            color: #76b900;
          }
        `;
      document.head.appendChild(style);
    }
  }

  // Start the typewriter effect after a short delay
  setTimeout(typeWriter, 2500);
});
