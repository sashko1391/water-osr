/**
 * Main Controller
 * GSAP ScrollTrigger animations, Lenis smooth scroll,
 * preloader, product filters, all integrations
 */

document.addEventListener('DOMContentLoaded', () => {

    // ============ PRELOADER ============
    const preloader = document.getElementById('preloader');
    const preloaderPercent = document.getElementById('preloaderPercent');
    const preloaderFill = document.querySelector('.preloader-fill');
    const preloaderWave = document.querySelector('.preloader-wave');

    let loadProgress = 0;
    const loadInterval = setInterval(() => {
        loadProgress += Math.random() * 15 + 5;
        if (loadProgress > 100) loadProgress = 100;

        preloaderPercent.textContent = Math.round(loadProgress) + '%';
        preloaderFill.style.height = loadProgress + '%';
        preloaderWave.style.bottom = (loadProgress - 5) + '%';

        if (loadProgress >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                gsap.to(preloader, {
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        preloader.classList.add('done');
                        preloader.style.display = 'none';
                        startAnimations();
                    }
                });
            }, 400);
        }
    }, 100);

    // ============ LENIS SMOOTH SCROLL ============
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // ============ SPLIT TEXT ============
    new SplitText();

    // ============ INIT ALL EFFECTS ============
    function startAnimations() {
        // Water shaders
        new WaterShader(document.getElementById('heroWater'));
        new SourceWater(document.getElementById('sourceWater'));

        // Particles
        new HeroParticles(document.getElementById('heroParticles'));
        new BubblesCanvas(document.getElementById('productsBubbles'));
        new CursorTrail(document.getElementById('cursorTrail'));

        // UI Effects
        new MagneticEffect();
        new TiltEffect();
        new CursorGlow();

        // ===== GSAP ANIMATIONS =====

        // Hero text chars
        const heroChars = document.querySelectorAll('.title-line .char');
        gsap.to(heroChars, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1,
            stagger: 0.04,
            ease: 'power3.out',
            delay: 0.2,
        });

        // Hero reveal elements
        gsap.utils.toArray('#hero [data-reveal]').forEach((el, i) => {
            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out',
                delay: 0.8 + i * 0.15,
            });
        });

        // ===== SCROLL-TRIGGERED ANIMATIONS =====

        // Section titles — char by char
        document.querySelectorAll('.section [data-split-text]').forEach(el => {
            const chars = el.querySelectorAll('.char');
            gsap.fromTo(chars,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.02,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    }
                }
            );
        });

        // Generic reveal elements
        gsap.utils.toArray('.section [data-reveal]').forEach(el => {
            const delay = parseFloat(el.dataset.delay || 0) / 1000;
            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: delay,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                }
            });
        });

        // Product cards stagger
        const productCards = gsap.utils.toArray('.product-card');
        gsap.fromTo(productCards,
            { opacity: 0, y: 40, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.06,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.products-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                }
            }
        );

        // Stat bars fill
        gsap.utils.toArray('.stat-fill').forEach(bar => {
            const width = bar.dataset.width;
            gsap.to(bar, {
                width: width + '%',
                duration: 1.5,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: bar,
                    start: 'top 90%',
                }
            });
        });

        // Stat counters
        gsap.utils.toArray('[data-count]').forEach(el => {
            const target = parseInt(el.dataset.count);
            const obj = { val: 0 };

            gsap.to(obj, {
                val: target,
                duration: 2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                },
                onUpdate: () => {
                    el.textContent = Math.round(obj.val);
                }
            });
        });

        // Marquee parallax speed on scroll
        gsap.to('.marquee-content', {
            x: '-=200',
            ease: 'none',
            scrollTrigger: {
                trigger: '.marquee-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
            }
        });

        // Parallax hero content
        gsap.to('.hero-content', {
            y: 150,
            opacity: 0.3,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            }
        });

        // Wave divider parallax
        gsap.to('.wave-divider', {
            y: -30,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: '80% top',
                end: 'bottom top',
                scrub: true,
            }
        });

    } // end startAnimations

    // ============ NAVBAR ============
    const navbar = document.getElementById('navbar');

    ScrollTrigger.create({
        start: 50,
        onUpdate: (self) => {
            navbar.classList.toggle('scrolled', self.scroll() > 50);
        }
    });

    // Mobile menu
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        navToggle.classList.toggle('active');
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navMenu.classList.remove('open');
            navToggle.classList.remove('active');

            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                lenis.scrollTo(target, { offset: -80 });
            }
        });
    });

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            onToggle: (self) => {
                if (self.isActive) {
                    navLinks.forEach(l => {
                        l.classList.toggle('active', l.getAttribute('href') === '#' + section.id);
                    });
                }
            }
        });
    });

    // ============ SMOOTH SCROLL LINKS ============
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                lenis.scrollTo(target, { offset: -80 });
            }
        });
    });

    // ============ PRODUCT FILTERS ============
    const filterBtns = document.querySelectorAll('.filter-btn');
    const allCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            allCards.forEach((card, i) => {
                const match = filter === 'all' || card.dataset.category === filter;

                if (match) {
                    card.classList.remove('hidden');
                    gsap.fromTo(card,
                        { opacity: 0, y: 20, scale: 0.95 },
                        { opacity: 1, y: 0, scale: 1, duration: 0.4, delay: i * 0.03, ease: 'power2.out' }
                    );
                } else {
                    gsap.to(card, {
                        opacity: 0,
                        scale: 0.9,
                        duration: 0.25,
                        onComplete: () => card.classList.add('hidden')
                    });
                }
            });
        });
    });

    // ============ SOUND ============
    const waterSound = new WaterSound();
    const soundBtn = document.getElementById('soundToggle');
    document.body.classList.add('sound-muted');

    soundBtn.addEventListener('click', () => {
        const playing = waterSound.toggle();
        document.body.classList.toggle('sound-muted', !playing);
    });

    // ============ FLOATING BOTTLES ============
    document.querySelectorAll('[data-float]').forEach((el, i) => {
        gsap.to(el, {
            y: -6 - Math.random() * 4,
            duration: 2.5 + Math.random() * 1.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2,
        });
    });

});
