import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Intro animations
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReduced) {
  // Hero stagger
  const heroStagger = document.querySelectorAll('[data-animate="stagger"] span, [data-animate="stagger"]');
  gsap.set(heroStagger, { opacity: 0, y: 12 });
  gsap.to(heroStagger, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.06, delay: 0.1 });

  // Fade-ups
  document.querySelectorAll('[data-animate="fade-up"]').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 18, duration: 0.6, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%" }
    });
  });

  // Cards and tiles
  document.querySelectorAll('[data-animate="card"], [data-animate="tile"], [data-animate="step"]').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 16, scale: 0.98, duration: 0.5, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%" }
    });
  });
}

// Smooth anchor scroll (native)
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", id);
      }
    }
  });
});
