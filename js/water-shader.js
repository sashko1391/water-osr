/**
 * WebGL Water Shader
 * Realistic flowing water surface with caustics
 */
class WaterShader {
    constructor(canvas) {
        this.canvas = canvas;
        if (!canvas) return;

        this.gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
        if (!this.gl) return;

        this.time = 0;
        this.mouse = { x: 0.5, y: 0.5 };
        this.resize();
        this.init();
        this.bindEvents();
        this.render();
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        this.canvas.width = this.canvas.offsetWidth * dpr;
        this.canvas.height = this.canvas.offsetHeight * dpr;
        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    init() {
        const gl = this.gl;

        // Vertex shader
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, `
            attribute vec2 pos;
            void main() {
                gl_Position = vec4(pos, 0.0, 1.0);
            }
        `);
        gl.compileShader(vs);

        // Fragment shader — water caustics + waves
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;

            // Simplex-like hash
            vec2 hash(vec2 p) {
                p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
                return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);

                return mix(
                    mix(dot(hash(i), f), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                    mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
                    u.y
                );
            }

            float caustic(vec2 uv, float t) {
                float c = 0.0;
                float scale = 1.0;
                for (int i = 0; i < 4; i++) {
                    vec2 p = uv * scale + t * 0.3;
                    c += abs(noise(p)) / scale;
                    scale *= 2.2;
                    t *= 1.1;
                }
                return c;
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution;
                float aspect = u_resolution.x / u_resolution.y;
                vec2 p = vec2(uv.x * aspect, uv.y);

                float t = u_time * 0.4;

                // Multiple wave layers
                float wave1 = sin(p.x * 3.0 + t) * cos(p.y * 2.0 + t * 0.7) * 0.5;
                float wave2 = sin(p.x * 5.0 - t * 0.8) * sin(p.y * 4.0 + t * 0.5) * 0.25;
                float wave3 = noise(p * 3.0 + t * 0.3) * 0.3;

                // Caustic pattern
                float c1 = caustic(p * 2.0, t);
                float c2 = caustic(p * 2.0 + 0.5, t * 1.2);
                float caustics = pow(min(c1, c2), 2.0) * 0.6;

                // Mouse interaction — subtle glow
                float mouseDist = distance(uv, u_mouse);
                float mouseGlow = exp(-mouseDist * 4.0) * 0.15;

                // Color composition
                vec3 deepBlue = vec3(0.02, 0.04, 0.08);
                vec3 waterBlue = vec3(0.0, 0.3, 0.5);
                vec3 lightBlue = vec3(0.18, 0.55, 0.72);
                vec3 highlight = vec3(0.28, 0.79, 0.89);

                float depth = wave1 + wave2 + wave3;
                vec3 color = mix(deepBlue, waterBlue, 0.3 + depth * 0.4);
                color += lightBlue * caustics * 0.5;
                color += highlight * mouseGlow;

                // Vignette
                float vig = 1.0 - smoothstep(0.3, 1.2, length(uv - 0.5) * 1.2);
                color *= vig;

                // Subtle shimmer
                float shimmer = noise(p * 20.0 + t * 2.0) * 0.02;
                color += shimmer;

                gl_FragColor = vec4(color, 0.85);
            }
        `);
        gl.compileShader(fs);

        this.program = gl.createProgram();
        gl.attachShader(this.program, vs);
        gl.attachShader(this.program, fs);
        gl.linkProgram(this.program);
        gl.useProgram(this.program);

        // Fullscreen quad
        const vertices = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const posLoc = gl.getAttribLocation(this.program, 'pos');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        // Uniforms
        this.uTime = gl.getUniformLocation(this.program, 'u_time');
        this.uRes = gl.getUniformLocation(this.program, 'u_resolution');
        this.uMouse = gl.getUniformLocation(this.program, 'u_mouse');

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) / rect.width;
            this.mouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
        });
    }

    render() {
        if (!this.gl) return;

        this.time += 0.016;
        const gl = this.gl;

        gl.uniform1f(this.uTime, this.time);
        gl.uniform2f(this.uRes, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.uMouse, this.mouse.x, this.mouse.y);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(() => this.render());
    }
}

/**
 * Simple Canvas Water for Source section
 */
class SourceWater {
    constructor(canvas) {
        this.canvas = canvas;
        if (!canvas) return;
        this.ctx = canvas.getContext('2d');
        this.time = 0;
        this.resize();
        window.addEventListener('resize', () => this.resize());
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

    animate() {
        this.time += 0.01;
        this.ctx.clearRect(0, 0, this.w, this.h);

        // Draw flowing wave lines
        for (let w = 0; w < 5; w++) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(72, 202, 228, ${0.02 + w * 0.012})`;
            this.ctx.lineWidth = 1;

            const yBase = this.h * (0.2 + w * 0.15);
            for (let x = 0; x <= this.w; x += 3) {
                const y = yBase
                    + Math.sin(x * 0.004 + this.time * (0.8 + w * 0.2)) * 30
                    + Math.sin(x * 0.008 + this.time * 0.6 + w) * 15
                    + Math.cos(x * 0.003 + this.time * 0.4) * 20;

                x === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        }

        requestAnimationFrame(() => this.animate());
    }
}

window.WaterShader = WaterShader;
window.SourceWater = SourceWater;
