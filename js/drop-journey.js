/* ============================================
   DROP JOURNEY — "830m" Killer Section
   Pinned scroll-driven descent with facts
   ============================================ */

const DropJourney = (() => {
  let canvas, ctx;
  let particles = [];
  let currentProgress = 0;

  // Geological layer colors
  const layers = [
    { at: 0.00, color: [27, 58, 92],  label: 'Поверхня Поліського краю' },
    { at: 0.12, color: [62, 85, 60],  label: 'Піщані ґрунти' },
    { at: 0.30, color: [80, 65, 45],  label: 'Глинисті породи' },
    { at: 0.55, color: [50, 50, 65],  label: 'Вапнякові горизонти' },
    { at: 0.80, color: [20, 35, 55],  label: 'Глибинні водоносні шари' },
    { at: 1.00, color: [46, 139, 139], label: 'Артезіанське джерело — 830 м' },
  ];

  // Mineral particles that appear deeper
  class MineralParticle {
    constructor(w, h) {
      this.reset(w, h);
    }
    reset(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = 1 + Math.random() * 3;
      this.opacity = 0;
      this.targetOpacity = 0.1 + Math.random() * 0.4;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = -0.2 - Math.random() * 0.5;
      this.life = 0;
      this.maxLife = 200 + Math.random() * 300;
    }
    update(w, h, progress) {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;

      // Fade in/out
      const lifeRatio = this.life / this.maxLife;
      if (lifeRatio < 0.1) {
        this.opacity = this.targetOpacity * (lifeRatio / 0.1);
      } else if (lifeRatio > 0.8) {
        this.opacity = this.targetOpacity * (1 - (lifeRatio - 0.8) / 0.2);
      } else {
        this.opacity = this.targetOpacity;
      }

      // More particles appear deeper
      this.opacity *= Math.min(1, progress * 2);

      if (this.life > this.maxLife || this.y < 0 || this.x < 0 || this.x > w) {
        this.reset(w, h);
      }
    }
  }

  function lerpColor(c1, c2, t) {
    return [
      c1[0] + (c2[0] - c1[0]) * t,
      c1[1] + (c2[1] - c1[1]) * t,
      c1[2] + (c2[2] - c1[2]) * t,
    ];
  }

  function getLayerColor(progress) {
    for (let i = 0; i < layers.length - 1; i++) {
      if (progress >= layers[i].at && progress <= layers[i + 1].at) {
        const t = (progress - layers[i].at) / (layers[i + 1].at - layers[i].at);
        return lerpColor(layers[i].color, layers[i + 1].color, t);
      }
    }
    return layers[layers.length - 1].color;
  }

  function getLayerLabel(progress) {
    let label = layers[0].label;
    for (const layer of layers) {
      if (progress >= layer.at) label = layer.label;
    }
    return label;
  }

  function initCanvas() {
    canvas = document.getElementById('journeyCanvas');
    if (!canvas) return false;
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    // Create mineral particles
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 30 : 60;
    for (let i = 0; i < count; i++) {
      particles.push(new MineralParticle(canvas.clientWidth, canvas.clientHeight));
    }

    return true;
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
  }

  function renderCanvas(progress) {
    if (!ctx) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // Background gradient based on depth
    const color = getLayerColor(progress);
    const darker = color.map(c => Math.max(0, c * 0.6));

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, `rgb(${darker.join(',')})`);
    grad.addColorStop(1, `rgb(${color.join(',')})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Update and draw particles
    for (const p of particles) {
      p.update(w, h, progress);
      if (p.opacity <= 0.01) continue;

      // Minerals: small glowing dots
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

      // Color shifts: shallow = earthy, deep = mineral teal/crystal
      let pColor;
      if (progress < 0.5) {
        pColor = `rgba(200, 180, 140, ${p.opacity})`;
      } else {
        const t = (progress - 0.5) * 2;
        const r = 200 - t * 108;
        const g = 180 + t * 20;
        const b = 140 + t * 60;
        pColor = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
      }
      ctx.fillStyle = pColor;
      ctx.fill();

      // Glow for larger particles at depth
      if (p.size > 2 && progress > 0.6) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(92, 200, 200, ${p.opacity * 0.1})`;
        ctx.fill();
      }
    }

    // Source glow at the bottom when near 830m
    if (progress > 0.85) {
      const glowOpacity = (progress - 0.85) / 0.15;
      const gradient = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.6);
      gradient.addColorStop(0, `rgba(92, 200, 200, ${glowOpacity * 0.3})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!initCanvas()) return;

    const depthEl = document.getElementById('journeyDepth');
    const labelEl = document.getElementById('journeyLabel');
    const facts = document.querySelectorAll('.journey-fact');

    gsap.registerPlugin(ScrollTrigger);

    // Pin the section for 5x viewport scroll
    ScrollTrigger.create({
      trigger: '#journey',
      pin: true,
      start: 'top top',
      end: '+=400%',
      scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress;
        currentProgress = progress;
        const depth = Math.round(progress * 830);

        // Update depth counter
        if (depthEl) depthEl.textContent = depth;
        if (labelEl) labelEl.textContent = getLayerLabel(progress);

        // Update canvas
        renderCanvas(progress);

        // Show/hide facts
        facts.forEach(fact => {
          const at = parseFloat(fact.dataset.at);
          const visible = Math.abs(progress - at) < 0.08;
          fact.classList.toggle('visible', visible);
        });

        // Update depth gauge (global)
        const depthFill = document.getElementById('depthFill');
        const depthNumber = document.getElementById('depthNumber');
        if (depthFill) depthFill.style.height = `${progress * 100}%`;
        if (depthNumber) depthNumber.textContent = depth;

        // Notify audio system about depth
        if (window.WaterAudio && window.WaterAudio.setDepth) {
          window.WaterAudio.setDepth(progress);
        }
      },
      onEnter: () => {
        const gauge = document.getElementById('depthGauge');
        if (gauge) gauge.classList.add('visible');
      },
      onLeave: () => {
        const gauge = document.getElementById('depthGauge');
        if (gauge) gauge.classList.remove('visible');
      },
      onLeaveBack: () => {
        const gauge = document.getElementById('depthGauge');
        if (gauge) gauge.classList.remove('visible');
      },
    });
  }

  return { init };
})();
