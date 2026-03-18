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
      // Move the fill rect up: y goes from 80 (empty) to 0 (full)
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

    tl.from('.hero-badge', {
      opacity: 0, y: 30, duration: 1, delay: 0.2
    })
    .from('.title-line', {
      opacity: 0, y: 60, scale: 0.95, filter: 'blur(10px)',
      duration: 1.8
    }, '-=0.6')
    .from('.title-sub', {
      opacity: 0, y: 30, duration: 1.2
    }, '-=1')
    .from('.hero-desc', {
      opacity: 0, y: 20, duration: 1
    }, '-=0.8')
    .from('.hero-actions', {
      opacity: 0, y: 20, duration: 0.8
    }, '-=0.6')
    .from('.hero-scroll', {
      opacity: 0, y: 10, duration: 0.8
    }, '-=0.4');
  }

  // ── Scroll Reveal Animations ──
  function initScrollReveal() {
    // Section tags
    gsap.utils.toArray('.section-tag').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0, y: 20, duration: 0.8, ease: 'power2.out',
      });
    });

    // Section titles — word-by-word
    gsap.utils.toArray('[data-split-text]').forEach(el => {
      const text = el.textContent;
      const words = text.split(' ');
      el.innerHTML = words.map(w => `<span class="split-word" style="display:inline-block;opacity:0;transform:translateY(40px)">${w}</span>`).join(' ');

      const spans = el.querySelectorAll('.split-word');
      gsap.to(spans, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 1, y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
      });
    });

    // Reveal elements
    gsap.utils.toArray('[data-reveal]').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0, y: 40,
        duration: 0.8,
        ease: 'power2.out',
      });
    });

    // About cards stagger
    gsap.utils.toArray('.about-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0, y: 60,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power2.out',
      });
    });

    // Delivery cards
    gsap.utils.toArray('.delivery-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0, y: 40,
        duration: 0.6,
        delay: i * 0.15,
        ease: 'power2.out',
      });
    });

    // Contact cards
    gsap.utils.toArray('.contact-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0, y: 40,
        duration: 0.6,
        delay: i * 0.15,
        ease: 'power2.out',
      });
    });

    // Contact CTA
    gsap.from('.contact-cta', {
      scrollTrigger: {
        trigger: '.contact-cta',
        start: 'top 90%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
    });

    // Stat counters
    gsap.utils.toArray('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        textContent: 0,
        duration: 2,
        ease: 'power1.out',
        snap: { textContent: 1 },
        onUpdate: function() {
          el.textContent = Math.round(parseFloat(el.textContent));
        }
      });
    });

    // Stat bars
    gsap.utils.toArray('.stat-fill').forEach(el => {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
        width: el.dataset.width + '%',
        duration: 1.5,
        ease: 'power2.out',
      });
    });

    // Product card filters reveal
    gsap.from('.product-filters', {
      scrollTrigger: {
        trigger: '.product-filters',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0, y: 20, duration: 0.6,
    });

    // Product cards stagger
    gsap.utils.toArray('.product-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: '#productsGrid',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0, y: 50, scale: 0.95,
        duration: 0.6,
        delay: i * 0.05,
        ease: 'power2.out',
      });
    });
  }

  // ── Navbar ──
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    const links = document.querySelectorAll('.nav-link');

    // Scroll — compact navbar
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });

    // Burger toggle
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    links.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Active link on scroll
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

  // ── Source Water Canvas (subtle noise) ──
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

      // Subtle moving gradient
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

    // Modules
    HeroWater.init();
    Particles.init();
    DropJourney.init();
    Catalog.init();
    WaterAudio.init();

    // Delayed inits
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
