/**
 * UI Effects
 * - Magnetic elements
 * - Tilt cards
 * - Split text
 * - Water sound
 */

// ============ Magnetic Hover ============
class MagneticEffect {
    constructor() {
        if (window.innerWidth < 768) return;

        document.querySelectorAll('[data-magnetic]').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const strength = 0.3;

                gsap.to(el, {
                    x: x * strength,
                    y: y * strength,
                    duration: 0.4,
                    ease: 'power2.out',
                });
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
            });
        });
    }
}

// ============ Tilt Cards ============
class TiltEffect {
    constructor() {
        if (window.innerWidth < 768) return;

        document.querySelectorAll('[data-tilt]').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;

                const rotateX = (y - 0.5) * -8;
                const rotateY = (x - 0.5) * 8;

                gsap.to(el, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    duration: 0.4,
                    ease: 'power2.out',
                    transformPerspective: 800,
                });
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                });
            });
        });
    }
}

// ============ Split Text ============
class SplitText {
    constructor() {
        document.querySelectorAll('[data-split-text]').forEach(el => {
            const text = el.textContent;
            el.innerHTML = '';
            el.setAttribute('aria-label', text);

            // Split into words then chars
            const words = text.split(' ');
            words.forEach((word, wi) => {
                const wordSpan = document.createElement('span');
                wordSpan.style.display = 'inline-block';
                wordSpan.style.whiteSpace = 'nowrap';

                [...word].forEach((char, ci) => {
                    const charSpan = document.createElement('span');
                    charSpan.className = 'char';
                    charSpan.textContent = char;
                    charSpan.style.display = 'inline-block';
                    wordSpan.appendChild(charSpan);
                });

                el.appendChild(wordSpan);

                // Add space between words
                if (wi < words.length - 1) {
                    const space = document.createElement('span');
                    space.innerHTML = '&nbsp;';
                    space.style.display = 'inline-block';
                    el.appendChild(space);
                }
            });
        });
    }
}

// ============ Water Sound (Web Audio API) ============
class WaterSound {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.gainNode = null;
        this.nodes = [];
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = 0;
        this.gainNode.connect(this.ctx.destination);
    }

    createBrownNoise() {
        const bufferSize = this.ctx.sampleRate * 5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (last + 0.02 * white) / 1.02;
            last = data[i];
            data[i] *= 3.5;
        }
        return buffer;
    }

    start() {
        this.init();
        if (this.isPlaying) return;
        this.isPlaying = true;

        // Layer 1: Deep flow
        const src1 = this.ctx.createBufferSource();
        src1.buffer = this.createBrownNoise();
        src1.loop = true;

        const lp1 = this.ctx.createBiquadFilter();
        lp1.type = 'lowpass';
        lp1.frequency.value = 350;
        lp1.Q.value = 0.8;

        const g1 = this.ctx.createGain();
        g1.gain.value = 0.35;

        src1.connect(lp1).connect(g1).connect(this.gainNode);
        src1.start();

        // Layer 2: Trickle
        const src2 = this.ctx.createBufferSource();
        src2.buffer = this.createBrownNoise();
        src2.loop = true;

        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 2200;
        bp.Q.value = 2.5;

        const g2 = this.ctx.createGain();
        g2.gain.value = 0.05;

        // LFO modulation
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.25;
        const lfoG = this.ctx.createGain();
        lfoG.gain.value = 0.035;
        lfo.connect(lfoG).connect(g2.gain);
        lfo.start();

        src2.connect(bp).connect(g2).connect(this.gainNode);
        src2.start();

        // Layer 3: Subtle drip randomness
        const src3 = this.ctx.createBufferSource();
        src3.buffer = this.createBrownNoise();
        src3.loop = true;

        const hp = this.ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 4000;

        const g3 = this.ctx.createGain();
        g3.gain.value = 0.015;

        src3.connect(hp).connect(g3).connect(this.gainNode);
        src3.start();

        // Fade in
        this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 2.5);

        this.nodes = [src1, src2, src3, lfo];
    }

    stop() {
        if (!this.isPlaying || !this.ctx) return;
        this.isPlaying = false;

        this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);

        setTimeout(() => {
            this.nodes.forEach(n => { try { n.stop(); } catch(e) {} });
            this.nodes = [];
        }, 1800);
    }

    toggle() {
        if (this.isPlaying) { this.stop(); return false; }
        else { this.start(); return true; }
    }
}

// ============ Cursor Glow ============
class CursorGlow {
    constructor() {
        this.el = document.getElementById('cursorGlow');
        if (!this.el || window.innerWidth < 768) return;

        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;

        window.addEventListener('mousemove', (e) => {
            this.targetX = e.clientX;
            this.targetY = e.clientY;
        });

        this.animate();
    }

    animate() {
        this.x += (this.targetX - this.x) * 0.08;
        this.y += (this.targetY - this.y) * 0.08;

        this.el.style.transform = `translate(${this.x - 200}px, ${this.y - 200}px)`;

        requestAnimationFrame(() => this.animate());
    }
}

window.MagneticEffect = MagneticEffect;
window.TiltEffect = TiltEffect;
window.SplitText = SplitText;
window.WaterSound = WaterSound;
window.CursorGlow = CursorGlow;
