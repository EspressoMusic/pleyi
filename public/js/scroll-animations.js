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
  const sectionEls = Array.from($$(".scroll-section")).filter((s) => s.id);
  const navLinks = $$(".nav-links a[href^='#'], .mobile-nav a[href^='#']");

  function setActiveNav(id) {
    if (!id) return;
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + id);
    });
  }

  function updateActiveNavFromScroll() {
    if (!sectionEls.length) return;
    const offset = (document.getElementById("navbar")?.offsetHeight || 80) + 32;
    const scrollPos = window.scrollY + offset;
    let current = sectionEls[0].id;

    for (const section of sectionEls) {
      if (section.offsetTop <= scrollPos) current = section.id;
    }

    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
    if (nearBottom) current = sectionEls[sectionEls.length - 1].id;

    setActiveNav(current);
  }

  if (sectionEls.length && navLinks.length) {
    updateActiveNavFromScroll();
    window.addEventListener("scroll", updateActiveNavFromScroll, { passive: true });
    window.addEventListener("resize", updateActiveNavFromScroll, { passive: true });
    navLinks.forEach((a) => {
      a.addEventListener("click", () => {
        const href = a.getAttribute("href");
        if (href?.startsWith("#")) setActiveNav(href.slice(1));
      });
    });
  }

  /* How timeline — light beam + confetti when section visible */
  const howTimeline = document.getElementById("howTimeline");
  if (howTimeline && !prefersReduced) {
    const howObs = new IntersectionObserver(
      ([entry]) => {
        howTimeline.classList.toggle("is-active", entry.isIntersecting);
      },
      { threshold: 0.35 }
    );
    howObs.observe(howTimeline);
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
