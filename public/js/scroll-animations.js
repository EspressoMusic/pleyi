/* Scroll reveal, section animations & parallax — site-wide */

(function () {
  if (window.__pleyiScrollInit) return;
  window.__pleyiScrollInit = true;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const processed = new WeakSet();

  const SKIP_SELECTOR =
    ".modal, .modal-overlay, .lesson-player, #playRoot, .loader, .navbar, .mobile-nav, " +
    ".scroll-progress, .toast, .a11y-panel, .ambient-bg, .memphis-bg, .hub-memphis-bg, " +
    ".room-memphis-bg, [data-no-reveal], [aria-hidden='true']";

  function shouldSkip(el) {
    if (!el || processed.has(el)) return true;
    if (el.closest(SKIP_SELECTOR)) return true;
    if (document.body.classList.contains("play-body")) return true;
    return false;
  }

  function isInViewport(el, margin = 0.12) {
    const rect = el.getBoundingClientRect();
    const h = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= h * (1 - margin) && rect.bottom >= h * margin;
  }

  let revealObs = null;

  function ensureRevealObserver() {
    if (revealObs || prefersReduced) return revealObs;
    revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          revealObs.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    return revealObs;
  }

  function markReveal(el, type, delay) {
    if (shouldSkip(el)) return;
    processed.add(el);
    if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", type || "up");
    if (delay) el.setAttribute("data-reveal-delay", String(Math.min(delay, 6)));

    if (prefersReduced) {
      el.classList.add("visible");
      return;
    }

    ensureRevealObserver()?.observe(el);
    if (isInViewport(el, 0.05)) el.classList.add("visible");
  }

  const AUTO_GROUPS = [
    { sel: "main section:not(.scroll-section)", type: "up", stagger: true },
    { sel: ".hub-game-card", type: "up", stagger: true },
    { sel: ".premium-page-card", type: "scale" },
    { sel: ".hub-back", type: "up" },
    { sel: ".join-main > *", type: "up", stagger: true },
    { sel: ".join-wait-card", type: "scale" },
    { sel: ".legal-page .container > *", type: "up", stagger: true },
    { sel: ".legal-content > *", type: "up", stagger: true },
    { sel: ".lp-panel", type: "up", stagger: true },
    { sel: ".lp-step", type: "up", stagger: true },
    { sel: ".my-room-card", type: "up", stagger: true },
    { sel: ".premium-plan-card", type: "up", stagger: true },
    { sel: ".premium-feature", type: "up", stagger: true },
    { sel: ".room-share-panel", type: "up" },
    { sel: ".room-games-panel .hub-game-card", type: "up", stagger: true },
    { sel: "footer.site-footer", type: "up" },
    { sel: "footer.site-footer-mini", type: "up" },
  ];

  function initAutoReveal(root = document) {
    if (prefersReduced || document.body.classList.contains("play-body")) return;

    AUTO_GROUPS.forEach(({ sel, type, stagger }) => {
      $$(sel, root).forEach((el, i) => {
        markReveal(el, type, stagger && i ? i : 0);
      });
    });

    $$("[data-reveal]", root).forEach((el) => {
      if (shouldSkip(el)) return;
      processed.add(el);
      if (prefersReduced) {
        el.classList.add("visible");
        return;
      }
      ensureRevealObserver()?.observe(el);
      if (isInViewport(el, 0.05)) el.classList.add("visible");
    });
  }

  /* ── Section in-view (clean-site scroll sections) ── */
  let sectionObs = null;

  function initScrollSections() {
    const sections = $$(".scroll-section");
    if (!sections.length) return;

    if (prefersReduced) {
      sections.forEach((s) => s.classList.add("in-view"));
      return;
    }

    sections.forEach((s) => {
      if (isInViewport(s, 0.02)) s.classList.add("in-view");
    });

    sectionObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("in-view", entry.isIntersecting);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
    );
    sections.forEach((s) => sectionObs.observe(s));
  }

  /* ── Active nav link on scroll ── */
  function initActiveNav() {
    const sectionEls = $$(".scroll-section").filter((s) => s.id);
    const navLinks = $$(".nav-links a[href^='#'], .mobile-nav a[href^='#']");
    if (!sectionEls.length || !navLinks.length) return;

    function setActiveNav(id) {
      if (!id) return;
      navLinks.forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + id);
      });
    }

    function updateActiveNavFromScroll() {
      const servicesDropdown = document.getElementById("navServicesDropdown");
      if (servicesDropdown && !servicesDropdown.classList.contains("hidden")) return;
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

  /* How timeline — light beam when section visible */
  function initHowTimeline() {
    const howTimeline = document.getElementById("howTimeline");
    if (!howTimeline || prefersReduced) return;
    const howObs = new IntersectionObserver(
      ([entry]) => {
        howTimeline.classList.toggle("is-active", entry.isIntersecting);
      },
      { threshold: 0.35 }
    );
    howObs.observe(howTimeline);
  }

  /* ── Parallax blobs & decor ── */
  function initParallax() {
    const parallaxEls = $$("[data-parallax]");
    const waves = $$(".section-wave");
    if (prefersReduced || (!parallaxEls.length && !waves.length)) return;

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

  /* ── Booking step dots ── */
  function initBookingProgress() {
    const bookingProgress = document.querySelector(".booking-progress");
    if (!bookingProgress || prefersReduced) return;
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

  /* Watch dynamically injected cards (games hub, lessons library, etc.) */
  function initMutationWatch() {
    if (prefersReduced || document.body.classList.contains("play-body")) return;

    let timer = null;
    const mo = new MutationObserver((mutations) => {
      let hasNew = false;
      for (const m of mutations) {
        if (m.addedNodes.length) {
          hasNew = true;
          break;
        }
      }
      if (!hasNew) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        mutations.forEach((m) => {
          m.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            initAutoReveal(node);
            if (node.matches?.(".scroll-section")) {
              if (isInViewport(node, 0.02)) node.classList.add("in-view");
              sectionObs?.observe(node);
            }
          });
        });
      }, 60);
    });

    mo.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    initAutoReveal();
    initScrollSections();
    initActiveNav();
    initHowTimeline();
    initParallax();
    initBookingProgress();
    initMutationWatch();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.PleyiScrollAnimations = {
    refresh: initAutoReveal,
  };
})();
