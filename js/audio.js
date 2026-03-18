/* ============================================
   AUDIO — Web Audio API ambient + micro sounds
   Low-pass filter deepens with scroll depth
   ============================================ */

const WaterAudio = (() => {
  let audioCtx;
  let masterGain;
  let ambientSource;
  let ambientGain;
  let lowPassFilter;
  let isEnabled = false;
  let isInitialized = false;
  let currentDepth = 0;

  // Generate ambient water noise using oscillators
  function createAmbientNoise() {
    if (!audioCtx) return;

    // Multiple detuned oscillators for rich water texture
    const oscillators = [];
    const frequencies = [60, 120, 180, 240]; // Low rumble

    frequencies.forEach(freq => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = Math.random() * 20 - 10;
      oscGain.gain.value = 0.01 / frequencies.length;

      osc.connect(oscGain);
      oscGain.connect(lowPassFilter);
      osc.start();
      oscillators.push(osc);
    });

    // White noise for water texture
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    ambientSource = audioCtx.createBufferSource();
    ambientSource.buffer = buffer;
    ambientSource.loop = true;

    ambientGain = audioCtx.createGain();
    ambientGain.gain.value = 0;

    ambientSource.connect(ambientGain);
    ambientGain.connect(lowPassFilter);
    ambientSource.start();

    return oscillators;
  }

  function initAudio() {
    if (isInitialized) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);

    lowPassFilter = audioCtx.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.value = 8000;
    lowPassFilter.Q.value = 1;
    lowPassFilter.connect(masterGain);

    createAmbientNoise();
    isInitialized = true;
  }

  function enable() {
    if (!isInitialized) initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    isEnabled = true;

    // Fade in master volume
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setTargetAtTime(0.15, audioCtx.currentTime, 2);

    // Fade in ambient
    if (ambientGain) {
      ambientGain.gain.setTargetAtTime(0.03, audioCtx.currentTime, 1);
    }
  }

  function disable() {
    isEnabled = false;
    if (!audioCtx || !masterGain) return;

    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
  }

  // Depth affects low-pass filter: deeper = more muffled
  function setDepth(progress) {
    currentDepth = progress;
    if (!isEnabled || !lowPassFilter || !audioCtx) return;

    // 8000Hz at surface → 1500Hz at 830m
    const freq = 8000 - (progress * 6500);
    lowPassFilter.frequency.setTargetAtTime(
      Math.max(1500, freq),
      audioCtx.currentTime,
      0.1
    );

    // Slightly increase ambient volume at depth
    if (ambientGain) {
      const vol = 0.03 + progress * 0.04;
      ambientGain.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.3);
    }
  }

  // Short water drop sound for interactions
  let lastDropTime = 0;
  function playDrop() {
    if (!isEnabled || !audioCtx) return;

    const now = Date.now();
    if (now - lastDropTime < 500) return; // throttle 500ms
    lastDropTime = now;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 800;
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.15);

    gain.gain.value = 0.05;
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  }

  function init() {
    const toggleBtn = document.getElementById('soundToggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      if (isEnabled) {
        disable();
        toggleBtn.classList.add('muted');
        toggleBtn.setAttribute('aria-label', 'Увімкнути звук води');
      } else {
        enable();
        toggleBtn.classList.remove('muted');
        toggleBtn.setAttribute('aria-label', 'Вимкнути звук води');
      }
    });

    // Add drop sounds to CTA buttons on hover
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.addEventListener('mouseenter', playDrop);
    });
  }

  // Expose for drop-journey.js
  window.WaterAudio = { setDepth };

  return { init, setDepth, playDrop };
})();
