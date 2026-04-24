<script type="module">
  import * as THREE from 'three';

  const container = document.getElementById('canvas-container');
  const entry = document.getElementById('overlay-entry');
  const enterBtn = document.getElementById('enter-btn');
  const statusText = document.getElementById('status-text');
  const cursor = document.getElementById('custom-cursor');

  const introPanel = document.getElementById('intro-panel');
  const cards = Array.from(document.querySelectorAll('.copy-card'));
  const dotsWrap = document.getElementById('progress-dots');
  const scrollHint = document.getElementById('scroll-hint');
  const bgAudio = document.getElementById('bg-audio');

  let scene, camera, renderer, candleShell, candleCore, particles;
  let isStarted = false;
  let currentIndex = 0;
  let wheelLocked = false;

  let audioContext = null;
  let analyser = null;
  let sourceNode = null;
  let gainNode = null;
  let dataArray = null;
  let audioGraphReady = false;

  const dots = [];

  window.addEventListener('mousemove', (e) => {
    if (cursor) {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }
  });

  function initDots() {
    if (!dotsWrap) return;

    dotsWrap.innerHTML = '';

    cards.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = i === 0 ? 'dot active' : 'dot';
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });
  }

  function initVisuals() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 15;

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    const candleGroup = new THREE.Group();

    candleCore = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 8.4, 32),
      new THREE.MeshStandardMaterial({
        color: 0x4A5B61,
        metalness: 0.9,
        roughness: 0.1
      })
    );

    candleShell = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 9, 64),
      new THREE.MeshPhysicalMaterial({
        color: 0x83B3BE,
        transmission: 0.8,
        roughness: 0.14,
        thickness: 6,
        transparent: true,
        opacity: 0.9,
        emissive: 0x83B3BE,
        emissiveIntensity: 0.1
      })
    );

    candleGroup.add(candleCore, candleShell);
    scene.add(candleGroup);

    const pointLight = new THREE.PointLight(0x83B3BE, 2, 80);
    pointLight.position.set(0, 5, 8);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x83B3BE, 0.35);
    scene.add(ambientLight);

    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 64;
    particleCanvas.height = 64;

    const ctx = particleCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(242,242,242,1)');
    grad.addColorStop(0.2, 'rgba(131,179,190,0.6)');
    grad.addColorStop(0.6, 'rgba(26,28,32,0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const particleTexture = new THREE.CanvasTexture(particleCanvas);
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(10000 * 3);

    for (let i = 0; i < particlePositions.length; i++) {
      particlePositions[i] = (Math.random() - 0.5) * 80;
    }

    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );

    particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        size: 0.6,
        map: particleTexture,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      })
    );

    scene.add(particles);

    animate();
  }

  function setupAudioGraph() {
    if (audioGraphReady || !bgAudio) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();

    sourceNode = audioContext.createMediaElementSource(bgAudio);
    analyser = audioContext.createAnalyser();
    gainNode = audioContext.createGain();

    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.8;

    gainNode.gain.value = 2.2;

    dataArray = new Uint8Array(analyser.frequencyBinCount);

    sourceNode.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioContext.destination);

    audioGraphReady = true;
    console.log('Audio graph ready');
  }

  function getAverageFrequency() {
    if (!analyser || !dataArray) return 0;

    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }

    return sum / dataArray.length;
  }

  function animate() {
    requestAnimationFrame(animate);

    if (candleShell) {
      candleShell.rotation.y += 0.00724;
    }

    if (candleCore) {
      candleCore.rotation.y -= 0.003;
    }

    if (particles) {
      particles.rotation.y += 0.0003;
      particles.rotation.x += 0.0001;
    }

    if (isStarted && analyser && candleShell) {
      const freq = getAverageFrequency();
      candleShell.material.emissiveIntensity = 0.1 + freq / 80;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function updateDots() {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function showCard(index) {
    const nextIndex = Math.max(0, Math.min(cards.length - 1, index));

    if (nextIndex === currentIndex) return;
    if (!cards[currentIndex] || !cards[nextIndex]) return;

    const currentCard = cards[currentIndex];
    const nextCard = cards[nextIndex];

    currentCard.classList.remove('active');
    currentCard.classList.add('exit');

    setTimeout(() => {
      currentCard.classList.remove('exit');

      currentIndex = nextIndex;
      nextCard.classList.add('active');

      updateDots();
    }, 430);
  }

  function handleWheel(e) {
    if (!isStarted) return;

    e.preventDefault();

    if (wheelLocked) return;
    wheelLocked = true;

    if (e.deltaY > 0) {
      showCard(currentIndex + 1);
    } else if (e.deltaY < 0) {
      showCard(currentIndex - 1);
    }

    setTimeout(() => {
      wheelLocked = false;
    }, 760);
  }

  async function startExperience() {
    try {
      isStarted = true;

      setupAudioGraph();

      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      if (bgAudio) {
        bgAudio.volume = 1.0;
        await bgAudio.play();
      }

      if (entry) {
        entry.style.opacity = '0';
      }

      setTimeout(() => {
        if (entry) entry.remove();

        if (introPanel) {
          introPanel.style.display = 'flex';
        }

        if (dotsWrap) {
          dotsWrap.style.display = 'flex';
        }

        if (scrollHint) {
          scrollHint.style.opacity = '0.8';

          setTimeout(() => {
            scrollHint.style.opacity = '0.35';
          }, 1800);
        }

        if (cards[0]) {
          cards.forEach((card, i) => {
            card.classList.toggle('active', i === 0);
            card.classList.remove('exit');
          });
        }

        currentIndex = 0;
        updateDots();

      }, 1200);

    } catch (err) {
      console.error('Start failed:', err);

      if (statusText) {
        statusText.innerText = 'AUDIO PLAYBACK BLOCKED.';
        statusText.style.color = '#FF4444';
      }
    }
  }

  function onResize() {
    if (!camera || !renderer) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  if (bgAudio) {
    bgAudio.addEventListener('canplaythrough', () => {
      if (statusText) {
        statusText.innerText = '724Hz FREQUENCY ALIGNED.';
        statusText.style.color = '#83B3BE';
      }
    });

    bgAudio.addEventListener('error', () => {
      if (statusText) {
        statusText.innerText = 'AUDIO LOAD ERROR.';
        statusText.style.color = '#FF4444';
      }
    });

    bgAudio.load();
  }

  if (enterBtn) {
    enterBtn.addEventListener('click', startExperience);
  }

  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('resize', onResize);

  initDots();
  initVisuals();
</script>
