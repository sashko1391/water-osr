/* ============================================
   APP — Main init: Lenis, GSAP, all modules
   ============================================ */

(function() {
  'use strict';

  // ── Preloader ──
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    const percentEl = document.getElementById('preloaderPercent');
    const dropFill = document.querySelector('.drop-fill');
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress > 100) progress = 100;

      if (percentEl) percentEl.textContent = Math.round(progress) + '%';
      if (dropFill) dropFill.setAttribute('y', 80 - (progress * 0.8));

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (preloader) preloader.classList.add('hidden');
          animateHero();
        }, 400);
      }
    }, 80);
  }

  // ── Lenis Smooth Scroll ──
  function initLenis() {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return lenis;
  }

  // ── Hero Entrance Animations ──
  function animateHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.hero-badge',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.2 }
    )
    .fromTo('.title-line',
      { opacity: 0, y: 60, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1.8 },
      '-=0.6'
    )
    .fromTo('.title-sub',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2 },
      '-=1'
    )
    .fromTo('.hero-desc',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1 },
      '-=0.8'
    )
    .fromTo('.hero-proofs',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.6'
    )
    .fromTo('.proof-item',
      { opacity: 0, x: -15 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.1 },
      '-=0.5'
    )
    .fromTo('.hero-actions',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.3'
    )
    .fromTo('.hero-scroll',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.4'
    );
  }

  // Helper: scroll-triggered reveal (once, no reverse)
  function reveal(targets, fromVars, stagger) {
    gsap.utils.toArray(targets).forEach((el, i) => {
      const vars = { ...fromVars };
      if (stagger) vars.delay = (vars.delay || 0) + i * stagger;

      gsap.fromTo(el,
        { opacity: 0, y: vars.y || 0, x: vars.x || 0, scale: vars.scale || 1 },
        {
          opacity: 1, y: 0, x: 0, scale: 1,
          duration: vars.duration || 0.8,
          delay: vars.delay || 0,
          ease: vars.ease || 'power2.out',
          scrollTrigger: {
            trigger: vars.trigger || el,
            start: vars.start || 'top 88%',
            once: true,
          },
        }
      );
    });
  }

  // ── Scroll Reveal Animations ──
  function initScrollReveal() {
    // Section tags
    reveal('.section-tag', { y: 20, duration: 0.6 });

    // Section titles — word-by-word
    gsap.utils.toArray('[data-split-text]').forEach(el => {
      const text = el.textContent;
      const words = text.split(' ');
      el.innerHTML = words.map(w =>
        `<span class="split-word" style="display:inline-block">${w}</span>`
      ).join(' ');

      const spans = el.querySelectorAll('.split-word');
      gsap.fromTo(spans,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    });

    // Generic [data-reveal] elements
    reveal('[data-reveal]', { y: 40, duration: 0.8 });

    // About cards
    reveal('.about-card', { y: 60, duration: 0.8 }, 0.1);

    // Mineral composition cards
    reveal('.mineral-card', { y: 50, scale: 0.95, duration: 0.7 }, 0.1);

    // For-whom cards
    reveal('.whom-card', { y: 50, duration: 0.7 }, 0.15);

    // Delivery cards
    reveal('.delivery-card', { y: 40, duration: 0.6 }, 0.1);

    // Contact cards
    reveal('.contact-card', { y: 40, duration: 0.6 }, 0.15);

    // Contact CTA
    reveal('.contact-cta', { y: 30, duration: 0.8 });

    // Product filters
    reveal('.product-filters', { y: 20, duration: 0.6 });

    // Pricing note
    reveal('.pricing-note', { y: 20, duration: 0.6 });
    reveal('.products-cta', { y: 30, duration: 0.8 });

    // Composition note
    reveal('.composition-note', { y: 20, duration: 0.6 });

    // Product cards
    gsap.utils.toArray('.product-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.5,
          delay: i * 0.04,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#productsGrid',
            start: 'top 85%',
            once: true,
          },
        }
      );
    });

    // Stat counters
    gsap.utils.toArray('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power1.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => { el.textContent = Math.round(obj.val); },
      });
    });

    // Stat bars
    gsap.utils.toArray('.stat-fill').forEach(el => {
      gsap.fromTo(el,
        { width: '0%' },
        {
          width: el.dataset.width + '%',
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        }
      );
    });

    // Stat cards
    reveal('.stat-card', { y: 40, duration: 0.7 }, 0.15);
  }

  // ── Navbar ──
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    const links = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY + 200;
      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (link) {
          link.classList.toggle('active', scrollY >= top && scrollY < top + height);
        }
      });
    }, { passive: true });
  }

  // ── Cursor Glow ──
  function initCursor() {
    if (window.matchMedia('(hover: none)').matches) return;

    const glow = document.getElementById('cursorGlow');
    if (!glow) return;

    let mx = 0, my = 0;
    let cx = 0, cy = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    function update() {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      glow.style.transform = `translate(${cx - 150}px, ${cy - 150}px)`;
      requestAnimationFrame(update);
    }
    update();
  }

  // ── Source Water Canvas ──
  function initSourceWater() {
    const canvas = document.getElementById('sourceWater');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let time = 0;

    function resize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) render();
      });
    });
    observer.observe(canvas);

    function render() {
      time += 0.005;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const grad = ctx.createRadialGradient(
        w * 0.5 + Math.sin(time) * w * 0.2,
        h * 0.5 + Math.cos(time * 0.7) * h * 0.2,
        0,
        w * 0.5, h * 0.5, w * 0.8
      );
      grad.addColorStop(0, 'rgba(46, 139, 139, 0.15)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      requestAnimationFrame(render);
    }
  }

  // ── Init Everything ──
  function boot() {
    gsap.registerPlugin(ScrollTrigger);

    initPreloader();
    initLenis();
    initNavbar();
    initCursor();

    HeroWater.init();
    Particles.init();
    DropJourney.init();
    Catalog.init();
    WaterAudio.init();

    setTimeout(() => {
      initScrollReveal();
      initSourceWater();
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
