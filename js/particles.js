/* ============================================
   PARTICLES — Canvas Bubble System
   Performance-focused, IntersectionObserver-gated
   ============================================ */

const Particles = (() => {
  const systems = [];

  class BubbleSystem {
    constructor(canvasId, options = {}) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.bubbles = [];
      this.active = false;
      this.animId = null;

      this.config = {
        count: options.count || 40,
        minSize: options.minSize || 2,
        maxSize: options.maxSize || 8,
        minSpeed: options.minSpeed || 0.3,
        maxSpeed: options.maxSpeed || 1.2,
        minOpacity: options.minOpacity || 0.08,
        maxOpacity: options.maxOpacity || 0.35,
        color: options.color || '92, 200, 200',
        wobbleAmp: options.wobbleAmp || 0.5,
      };

      this.resize();
      this.createBubbles();
      this.observe();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      this.canvas.width = this.canvas.clientWidth * dpr;
      this.canvas.height = this.canvas.clientHeight * dpr;
      if (this.ctx) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
      }
      this.w = this.canvas.clientWidth;
      this.h = this.canvas.clientHeight;
    }

    createBubbles() {
      const { count, minSize, maxSize, minSpeed, maxSpeed, minOpacity, maxOpacity } = this.config;
      const isMobile = window.innerWidth < 768;
      const actualCount = isMobile ? Math.floor(count * 0.4) : count;

      this.bubbles = [];
      for (let i = 0; i < actualCount; i++) {
        this.bubbles.push({
          x: Math.random() * this.w,
          y: this.h + Math.random() * this.h,
          r: minSize + Math.random() * (maxSize - minSize),
          speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
          opacity: minOpacity + Math.random() * (maxOpacity - minOpacity),
          wobbleOffset: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.01 + Math.random() * 0.02,
          time: 0,
        });
      }
    }

    observe() {
      if (!this.canvas) return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) this.start();
          else this.stop();
        });
      }, { threshold: 0.1 });
      observer.observe(this.canvas);
    }

    start() {
      if (this.active) return;
      this.active = true;
      this.render();
    }

    stop() {
      this.active = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }

    render() {
      if (!this.active || !this.ctx) return;

      this.ctx.clearRect(0, 0, this.w, this.h);
      const { color, wobbleAmp } = this.config;

      for (const b of this.bubbles) {
        b.time += 1;
        b.y -= b.speed;

        const wobble = Math.sin(b.time * b.wobbleSpeed + b.wobbleOffset) * wobbleAmp;
        const drawX = b.x + wobble;

        if (b.y + b.r < 0) {
          b.y = this.h + b.r;
          b.x = Math.random() * this.w;
        }

        this.ctx.beginPath();
        this.ctx.arc(drawX, b.y, b.r, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${color}, ${b.opacity})`;
        this.ctx.fill();

        if (b.r > 4) {
          this.ctx.beginPath();
          this.ctx.arc(drawX - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.5})`;
          this.ctx.fill();
        }
      }

      this.animId = requestAnimationFrame(() => this.render());
    }
  }

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    systems.push(new BubbleSystem('heroParticles', {
      count: 30, minSize: 1, maxSize: 5,
      minSpeed: 0.2, maxSpeed: 0.8,
      minOpacity: 0.05, maxOpacity: 0.2,
    }));

    systems.push(new BubbleSystem('productsBubbles', {
      count: 25, minSize: 2, maxSize: 6,
      minSpeed: 0.3, maxSpeed: 1.0,
    }));
  }

  return { init };
})();
