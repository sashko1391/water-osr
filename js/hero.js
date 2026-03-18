/* ============================================
   HERO — WebGL Water Shader with Caustics
   ============================================ */

const HeroWater = (() => {
  let canvas, gl, program;
  let time = 0;
  let mouseX = 0.5, mouseY = 0.5;
  let animId;

  const VERT = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const FRAG = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    // Simplex-like noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                                  + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                               dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float t = u_time * 0.3;

      // Multi-layered water noise
      float n1 = snoise(uv * 3.0 + vec2(t * 0.5, t * 0.3)) * 0.5;
      float n2 = snoise(uv * 6.0 + vec2(-t * 0.3, t * 0.4)) * 0.25;
      float n3 = snoise(uv * 12.0 + vec2(t * 0.2, -t * 0.5)) * 0.125;
      float noise = n1 + n2 + n3;

      // Caustics pattern
      float c1 = snoise(uv * 8.0 + vec2(t * 0.4, t * 0.6));
      float c2 = snoise(uv * 8.0 + vec2(t * 0.6 + 1.7, t * 0.4 + 2.3));
      float caustics = pow(max(0.0, 1.0 - abs(c1 + c2)), 3.0) * 0.15;

      // Mouse ripple
      float dist = distance(uv, u_mouse);
      float ripple = sin(dist * 40.0 - u_time * 4.0) * exp(-dist * 6.0) * 0.03;

      // Deep water gradient (top lighter, bottom darker)
      vec3 deepColor = vec3(0.039, 0.086, 0.157);    // #0A1628
      vec3 midColor  = vec3(0.106, 0.227, 0.361);     // #1B3A5C
      vec3 tealColor = vec3(0.180, 0.545, 0.545);     // #2E8B8B
      vec3 lightColor = vec3(0.361, 0.784, 0.784);    // #5CC8C8

      float gradient = uv.y * 0.8 + noise * 0.15 + ripple;
      vec3 color = mix(deepColor, midColor, gradient);
      color += caustics * tealColor;
      color += ripple * lightColor * 2.0;

      // Subtle vignette
      float vig = 1.0 - smoothstep(0.4, 1.4, length(uv - 0.5) * 1.5);
      color *= 0.85 + vig * 0.15;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Shader error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function init() {
    canvas = document.getElementById('heroWater');
    if (!canvas) return;

    gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;

    const vs = createShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link error');
      return;
    }

    const verts = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = 1.0 - e.clientY / window.innerHeight;
    });

    render();
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio, 1.5); // cap for performance
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function render() {
    if (!gl || !program) return;
    time += 0.016;

    gl.useProgram(program);
    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
    gl.uniform2f(gl.getUniformLocation(program, 'u_mouse'), mouseX, mouseY);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    animId = requestAnimationFrame(render);
  }

  function destroy() {
    if (animId) cancelAnimationFrame(animId);
  }

  return { init, destroy };
})();
