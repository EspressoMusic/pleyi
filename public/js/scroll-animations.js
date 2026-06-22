/* Scroll reveal, parallax & section animations */

(function () {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ── Reveal on scroll ── */
  const revealEls = $$("[data-reveal]");
  if (prefersReduced) {
    revealEls.forEach((el) => el.classList.add("visible"));
  } else {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          revealObs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => revealObs.observe(el));
  }

  /* ── Section glow when in view ── */
  const sections = $$(".scroll-section");
  if (sections.length && !prefersReduced) {
    const sectionObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("in-view", entry.isIntersecting);
        });
      },
      { threshold: 0.15 }
    );
    sections.forEach((s) => sectionObs.observe(s));
  }

  /* ── Active nav link on scroll ── */
  const navLinks = $$(".nav-links a, .mobile-nav a[href^='#']");
  if (sections.length && navLinks.length) {
    const navObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((a) => {
            a.classList.toggle("active", a.getAttribute("href") === "#" + id);
          });
        });
      },
      { threshold: 0.35, rootMargin: "-80px 0px -40% 0px" }
    );
    sections.forEach((s) => s.id && navObs.observe(s));
  }

  /* ── Parallax blobs & decor ── */
  const parallaxEls = $$("[data-parallax]");
  const waves = $$(".section-wave");

  if (!prefersReduced && (parallaxEls.length || waves.length)) {
    let ticking = false;

    function onScrollParallax() {
      const sy = window.scrollY;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        el.style.transform = `translate3d(0, ${sy * speed}px, 0)`;
      });
      waves.forEach((wave, i) => {
        const rect = wave.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (center - window.innerHeight / 2) * 0.04 * (i % 2 === 0 ? 1 : -1);
        wave.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(onScrollParallax);
        }
      },
      { passive: true }
    );
    onScrollParallax();
  }

  /* ── Booking step dots animate when visible ── */
  const bookingProgress = document.querySelector(".booking-progress");
  if (bookingProgress && !prefersReduced) {
    const bpObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("animated");
        });
      },
      { threshold: 0.5 }
    );
    bpObs.observe(bookingProgress);
  }
})();
