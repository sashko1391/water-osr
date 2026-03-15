/**
 * Particle Systems
 * - Hero floating particles
 * - Products bubbles canvas
 * - Cursor trail drops
 */

// ============ Hero Particles ============
class HeroParticles {
    constructor(container) {
        this.container = container;
        if (!container) return;
        this.particles = [];
        this.create();
    }

    create() {
        for (let i = 0; i < 30; i++) {
            this.addParticle();
        }
    }

    addParticle() {
        const el = document.createElement('div');
        el.className = 'hero-particle';

        const size = 2 + Math.random() * 6;
        const isGlowing = Math.random() > 0.7;

        Object.assign(el.style, {
            width: size + 'px',
            height: size + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            background: isGlowing
                ? `radial-gradient(circle, rgba(72, 202, 228, 0.6), rgba(72, 202, 228, 0.1))`
                : `radial-gradient(circle, rgba(255,255,255, 0.15), transparent)`,
            boxShadow: isGlowing ? `0 0 ${size * 3}px rgba(72, 202, 228, 0.3)` : 'none',
            opacity: 0,
        });

        this.container.appendChild(el);

        this.animateParticle(el, size);
    }

    animateParticle(el, size) {
        const duration = 8 + Math.random() * 15;
        const delay = Math.random() * 8;
        const xDrift = (Math.random() - 0.5) * 200;
        const yDrift = -(100 + Math.random() * 300);

        if (typeof gsap !== 'undefined') {
            gsap.fromTo(el,
                {
                    y: 0,
                    x: 0,
                    opacity: 0,
                    scale: 0,
                },
                {
                    y: yDrift,
                    x: xDrift,
                    opacity: Math.random() * 0.5 + 0.2,
                    scale: 1,
                    duration: duration,
                    delay: delay,
                    repeat: -1,
                    ease: 'none',
                    onRepeat: () => {
                        el.style.left = Math.random() * 100 + '%';
                        el.style.top = (60 + Math.random() * 40) + '%';
                    }
                }
            );
        }
    }
}

// ============ Products Bubbles ============
class BubblesCanvas {
    constructor(canvas) {
        this.canvas = canvas;
        if (!canvas) return;
        this.ctx = canvas.getContext('2d');
        this.bubbles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.spawn();
        this.animate();
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        this.canvas.width = this.canvas.offsetWidth * dpr;
        this.canvas.height = this.canvas.offsetHeight * dpr;
        this.ctx.scale(dpr, dpr);
        this.w = this.canvas.offsetWidth;
        this.h = this.canvas.offsetHeight;
    }

    spawn() {
        // Keep 20 bubbles alive
        setInterval(() => {
            if (this.bubbles.length < 25) {
                this.bubbles.push({
                    x: Math.random() * this.w,
                    y: this.h + 20,
                    r: 2 + Math.random() * 8,
                    speed: 0.3 + Math.random() * 0.8,
                    wobble: Math.random() * Math.PI * 2,
                    wobbleSpeed: 0.01 + Math.random() * 0.02,
                    opacity: 0.1 + Math.random() * 0.2,
                });
            }
        }, 600);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.w, this.h);

        this.bubbles.forEach((b, i) => {
            b.y -= b.speed;
            b.wobble += b.wobbleSpeed;
            b.x += Math.sin(b.wobble) * 0.5;

            // Draw bubble
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);

            const grad = this.ctx.createRadialGradient(
                b.x - b.r * 0.3, b.y - b.r * 0.3, 0,
                b.x, b.y, b.r
            );
            grad.addColorStop(0, `rgba(255, 255, 255, ${b.opacity * 0.6})`);
            grad.addColorStop(0.6, `rgba(72, 202, 228, ${b.opacity * 0.2})`);
            grad.addColorStop(1, `rgba(72, 202, 228, 0)`);

            this.ctx.fillStyle = grad;
            this.ctx.fill();

            // Highlight
            this.ctx.beginPath();
            this.ctx.arc(b.x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.3, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.5})`;
            this.ctx.fill();

            // Remove if off screen
            if (b.y < -b.r * 2) {
                this.bubbles.splice(i, 1);
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ============ Cursor Trail ============
class CursorTrail {
    constructor(canvas) {
        this.canvas = canvas;
        if (!canvas || window.innerWidth < 768) return;

        this.ctx = canvas.getContext('2d');
        this.drops = [];
        this.mouse = { x: 0, y: 0 };
        this.lastMouse = { x: 0, y: 0 };

        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        this.animate();
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.ctx.scale(dpr, dpr);
    }

    animate() {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Speed check — only emit when moving
        const dx = this.mouse.x - this.lastMouse.x;
        const dy = this.mouse.y - this.lastMouse.y;
        const speed = Math.sqrt(dx * dx + dy * dy);

        if (speed > 3 && this.drops.length < 20) {
            this.drops.push({
                x: this.mouse.x + (Math.random() - 0.5) * 10,
                y: this.mouse.y + (Math.random() - 0.5) * 10,
                r: 1.5 + Math.random() * 3,
                life: 1,
                decay: 0.015 + Math.random() * 0.02,
                vy: 0.5 + Math.random() * 1.5,
                vx: (Math.random() - 0.5) * 0.5,
            });
        }

        this.lastMouse.x = this.mouse.x;
        this.lastMouse.y = this.mouse.y;

        // Draw drops
        this.drops.forEach((d, i) => {
            d.y += d.vy;
            d.x += d.vx;
            d.vy += 0.05; // gravity
            d.life -= d.decay;

            if (d.life <= 0) {
                this.drops.splice(i, 1);
                return;
            }

            this.ctx.beginPath();
            this.ctx.arc(d.x, d.y, d.r * d.life, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(72, 202, 228, ${d.life * 0.4})`;
            this.ctx.fill();

            // Tiny glow
            this.ctx.beginPath();
            this.ctx.arc(d.x, d.y, d.r * d.life * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(72, 202, 228, ${d.life * 0.08})`;
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

window.HeroParticles = HeroParticles;
window.BubblesCanvas = BubblesCanvas;
window.CursorTrail = CursorTrail;
