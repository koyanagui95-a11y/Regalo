let scene, camera, renderer, controls;
let textParticlesMesh, targetPositions, initialPositions, baseParticleColors, particleCharIndices;
let blackHoleDisk, glowMesh, galaxyMesh;
let fireworkSpark, explosionParticles;
let bgMusic, musicBtn, playBtn, prevBtn, nextBtn;
let fondoMusic;
let raycaster, mouse;

let sequenceState = 0;
let animTime = 0;
let revealedCharsCount = 0;
let totalChars = 0;
let currentSongIndex = 0;
let fondoYaTermino = false;
let fondoDesactivado = false;
let muted = false;
let orbitAngle = 0;

const SECRET_CODE = "270910";

const cardData = [
  { img: 'imagenes/img1.jpg', title: 'Vivir la Vida 🎆', text: 'Como estos fuegos artificiales: brillante, libre y llena de luz. Nunca dejes de celebrarte.' },
  { img: 'imagenes/img2.jpg', title: 'Tu Faro 🗼', text: 'En los días oscuros, tú eres la luz que guía. Y yo siempre seré tu puerto seguro.' },
  { img: 'imagenes/img3.jpg', title: 'Cada Detalle 🌸', text: 'Como este pétalo sobre el agua: eres delicada, única y haces hermosa hasta la más pequeña cosa.' },
  { img: 'imagenes/img4.jpg', title: 'Sigue Brillando 🌙', text: 'Que nunca se apague esa luz tuya. El mundo es más bonito cuando brillas así.' },
  { img: 'imagenes/img5.jpg', title: 'Un Nuevo Día 🌼', text: 'Cada amanecer es una nueva oportunidad. Y tú tienes la fuerza para florecer una y mil veces.' },
  { img: 'imagenes/img6.jpg', title: 'Juntos Siempre 💫', text: 'Pase lo que pase, aquí estoy. Como ellos: mirando las estrellas, sin soltarte nunca.' }
];

window.onload = () => {
  initLockScreen();
};

function initLockScreen() {
  const slots = document.querySelectorAll('#codeSlots .slot');
  const keys = document.querySelectorAll('.key[data-key]');
  const delBtn = document.getElementById('keyDel');
  const lockScreen = document.getElementById('lock-screen');
  const lockBox = lockScreen.querySelector('.lock-box');
  const lockMsg = document.getElementById('lockMsg');
  let input = "";

  function render() {
    slots.forEach((slot, i) => {
      if (i < input.length) {
        slot.textContent = "•";
        slot.classList.add('filled');
      } else {
        slot.textContent = "";
        slot.classList.remove('filled');
      }
    });
  }

  function checkCode() {
    if (input === SECRET_CODE) {
      lockMsg.textContent = "¡Acceso concedido!";
      lockMsg.style.color = "#00f5d4";
      setTimeout(() => {
        lockScreen.classList.add('hidden');
        const main = document.getElementById('main-site');
        main.classList.remove('hidden');
        init3D();
        initUIEvents();
        startFondoMusic();
      }, 600);
    } else {
      lockMsg.textContent = "Código incorrecto";
      lockMsg.style.color = "#f43f5e";
      lockBox.classList.add('shake');
      setTimeout(() => {
        lockBox.classList.remove('shake');
        input = "";
        render();
        lockMsg.textContent = "";
      }, 500);
    }
  }

  keys.forEach(key => {
    key.addEventListener('click', () => {
      if (input.length >= 6) return;
      input += key.dataset.key;
      render();
      if (input.length === 6) {
        setTimeout(checkCode, 200);
      }
    });
  });

  delBtn.addEventListener('click', () => {
    input = input.slice(0, -1);
    render();
  });

  document.addEventListener('keydown', (e) => {
    if (lockScreen.classList.contains('hidden')) return;
    if (/^[0-9]$/.test(e.key) && input.length < 6) {
      input += e.key;
      render();
      if (input.length === 6) setTimeout(checkCode, 200);
    } else if (e.key === 'Backspace') {
      input = input.slice(0, -1);
      render();
    }
  });

  render();
}

function startFondoMusic() {
  fondoMusic = document.getElementById('fondo-music');
  if (!fondoMusic || !fondoMusic.src) return;
  fondoMusic.volume = 0.4;
  fondoMusic.muted = muted;

  fondoMusic.addEventListener('ended', () => {
    fondoYaTermino = true;
  });

  fondoMusic.play().catch(() => {
    const reactivate = () => {
      if (!fondoYaTermino && !fondoDesactivado) {
        fondoMusic.play().catch(() => {});
      }
      document.removeEventListener('click', reactivate);
    };
    document.addEventListener('click', reactivate);
  });
}

function initUIEvents() {
  bgMusic = document.getElementById('bg-music');
  musicBtn = document.getElementById('music-btn');
  playBtn = document.getElementById('play-btn');
  prevBtn = document.getElementById('prev-btn');
  nextBtn = document.getElementById('next-btn');
  fondoMusic = document.getElementById('fondo-music');

  const songItems = document.querySelectorAll('.song-item');
  const root = document.documentElement;

  function hexToRgba(hex, a) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function applyAccent(color) {
    root.style.setProperty('--accent', color);
    root.style.setProperty('--accent-soft', hexToRgba(color, 0.1));
    root.style.setProperty('--accent-glow', hexToRgba(color, 0.3));
  }

  function loadSong(index) {
    currentSongIndex = index;
    const item = songItems[index];

    songItems.forEach(s => s.classList.remove('active'));
    item.classList.add('active');

    const src = item.getAttribute('data-src');
    const cover = item.getAttribute('data-cover');
    const title = item.getAttribute('data-title');
    const artist = item.getAttribute('data-artist');
    const color = item.getAttribute('data-color') || '#00f5d4';

    applyAccent(color);

    document.getElementById('current-cover').src = cover;
    document.getElementById('current-title').innerText = title;
    document.getElementById('current-artist').innerText = artist;

    bgMusic.src = src;
    bgMusic.load();
    bgMusic.muted = muted;
  }

  function detenerFondoDefinitivo() {
    if (!fondoDesactivado) {
      fondoDesactivado = true;
      if (fondoMusic) {
        fondoMusic.pause();
        fondoMusic.currentTime = 0;
      }
    }
  }

  function playSong() {
    if (!bgMusic.src) return;
    detenerFondoDefinitivo();
    bgMusic.muted = muted;
    bgMusic.play().then(() => {
      playBtn.innerText = '⏸';
    }).catch(e => {
      console.log("Audio diferido:", e);
      playBtn.innerText = '▶';
    });
  }

  function pauseSong() {
    bgMusic.pause();
    playBtn.innerText = '▶';
  }

  function togglePlay() {
    if (bgMusic.paused) {
      playSong();
    } else {
      pauseSong();
    }
  }

  playBtn.addEventListener('click', togglePlay);

  musicBtn.addEventListener('click', () => {
    muted = !muted;
    if (bgMusic) bgMusic.muted = muted;
    if (fondoMusic) fondoMusic.muted = muted;
    musicBtn.innerText = muted ? '🔇' : '🎵';
    musicBtn.title = muted ? 'Activar sonido' : 'Silenciar';
  });

  prevBtn.addEventListener('click', () => {
    let newIdx = currentSongIndex - 1;
    if (newIdx < 0) newIdx = songItems.length - 1;
    loadSong(newIdx);
    playSong();
  });

  nextBtn.addEventListener('click', () => {
    let newIdx = currentSongIndex + 1;
    if (newIdx >= songItems.length) newIdx = 0;
    loadSong(newIdx);
    playSong();
  });

  songItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      loadSong(idx);
      playSong();
    });
  });

  bgMusic.addEventListener('timeupdate', () => {
    if (bgMusic.duration) {
      const progressPercent = (bgMusic.currentTime / bgMusic.duration) * 100;
      document.getElementById('progress-fill').style.width = `${progressPercent}%`;
      document.getElementById('time-current').innerText = formatTime(bgMusic.currentTime);
      document.getElementById('time-duration').innerText = formatTime(bgMusic.duration);
    }
  });

  bgMusic.addEventListener('ended', () => {
    let newIdx = currentSongIndex + 1;
    if (newIdx >= songItems.length) newIdx = 0;
    loadSong(newIdx);
    playSong();
  });

  document.getElementById('progress-bar').addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (bgMusic.duration) {
      bgMusic.currentTime = (clickX / rect.width) * bgMusic.duration;
    }
  });

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  document.getElementById('close-card').onclick = () => {
    document.getElementById('modal-card').style.display = 'none';
  };

  const sections = document.querySelectorAll('.page-section');
  const navBtns = document.querySelectorAll('.nav-btn');

  window.addEventListener('scroll', () => {
    let current = 'inicio';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (pageYOffset >= sectionTop - 250) {
        current = section.getAttribute('id');
      }
    });
    navBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('href') === `#${current}`) {
        btn.classList.add('active');
      }
    });
  });

  const initialColor = songItems[0].getAttribute('data-color') || '#00f5d4';
  applyAccent(initialColor);
}

function init3D() {
  const container = document.getElementById('canvas-container');

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 1000);

  const aspect = container.clientWidth / container.clientHeight;
  let camZ = 24;
  let camY = 8;
  if (aspect < 0.7) {
    camZ = 42;
    camY = 10;
  } else if (aspect < 1.1) {
    camZ = 32;
    camY = 9;
  }
  camera.position.set(0, camY, camZ);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = false;

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  const particleTexture = createPointTexture();

  createBlackHole();
  createGalaxy(particleTexture);
  createFireworkSystem(particleTexture);
  createConcaveArcTextParticles(particleTexture);

  renderPhotoCards();

  window.addEventListener('resize', onWindowResize);
  animate();
}

function renderPhotoCards() {
  const orbit = document.getElementById('photosOrbit');
  if (!orbit) return;
  orbit.innerHTML = cardData.map((c, i) => `
    <div class="photo-card" data-idx="${i}">
      <div class="inner">
        <img src="${c.img}" alt="Foto ${i + 1}" draggable="false">
      </div>
    </div>
  `).join('');

  orbit.querySelectorAll('.photo-card').forEach(card => {
    card.addEventListener('click', () => {
      const data = cardData[card.dataset.idx];
      document.getElementById('card-title').innerText = data.title;
      document.getElementById('card-text').innerText = data.text;
      document.getElementById('modal-card').style.display = 'flex';
    });
  });

  animatePhotoOrbit();
}

function animatePhotoOrbit() {
  const cards = document.querySelectorAll('.photos-orbit .photo-card');
  if (!cards.length) return;

  const w = window.innerWidth;
  const radiusX = w < 700 ? 150 : w < 1100 ? 300 : 460;
  const radiusY = w < 700 ? 55  : w < 1100 ? 90  : 130;
  const total = cards.length;

  function loop() {
    orbitAngle += 0.0022;

    cards.forEach((card, i) => {
      const a = orbitAngle + (i / total) * Math.PI * 2;
      const x = Math.cos(a) * radiusX;
      const y = Math.sin(a) * radiusY;
      const depth = Math.sin(a);

      const scale = 0.9 + depth * 0.1;
      const opacity = 0.85 + Math.abs(depth) * 0.15;
      const z = depth > 0 ? 2 : 1;

      card.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
      card.style.zIndex = z;
      card.style.opacity = opacity;
    });

    requestAnimationFrame(loop);
  }

  loop();
}

function createPointTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(0,245,212,0.9)');
  gradient.addColorStop(0.7, 'rgba(0,180,216,0.5)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  return new THREE.CanvasTexture(canvas);
}

function createBlackHole() {
  const coreGeo = new THREE.SphereGeometry(1.6, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  scene.add(new THREE.Mesh(coreGeo, coreMat));

  const diskGeo = new THREE.RingGeometry(1.7, 4.8, 64);
  const diskCanvas = document.createElement('canvas');
  diskCanvas.width = 256;
  diskCanvas.height = 256;
  const ctx = diskCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 40, 128, 128, 128);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.25, '#00f5d4');
  grad.addColorStop(0.65, '#0077b6');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const diskMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(diskCanvas),
    side: THREE.DoubleSide,
    transparent: true,
    blending: THREE.AdditiveBlending
  });

  blackHoleDisk = new THREE.Mesh(diskGeo, diskMat);
  blackHoleDisk.rotation.x = Math.PI / 2.2;
  scene.add(blackHoleDisk);

  const glowGeo = new THREE.SphereGeometry(2.2, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00f5d4,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending
  });
  glowMesh = new THREE.Mesh(glowGeo, glowMat);
  scene.add(glowMesh);
}

function createGalaxy(texture) {
  const count = 12000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const colorInside = new THREE.Color(0x00f5d4);
  const colorOutside = new THREE.Color(0x03045e);

  for (let i = 0; i < count; i++) {
    const r = Math.random() * 24 + 2;
    const angle = Math.random() * Math.PI * 2;

    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 2] = Math.sin(angle) * r;

    const mixedColor = colorInside.clone().lerp(colorOutside, Math.random());
    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.22,
    map: texture,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  galaxyMesh = new THREE.Points(geometry, material);
  scene.add(galaxyMesh);
}

function createFireworkSystem(texture) {
  const sparkGeo = new THREE.SphereGeometry(0.45, 16, 16);
  const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending });
  fireworkSpark = new THREE.Mesh(sparkGeo, sparkMat);
  fireworkSpark.position.set(0, 0, 0);
  scene.add(fireworkSpark);

  const expCount = 1800;
  const expGeo = new THREE.BufferGeometry();
  const expPos = new Float32Array(expCount * 3);
  const expVel = new Float32Array(expCount * 3);

  for (let i = 0; i < expCount; i++) {
    expPos[i * 3] = 0;
    expPos[i * 3 + 1] = 6.8;
    expPos[i * 3 + 2] = 0;

    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const speed = Math.random() * 9 + 3;

    expVel[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
    expVel[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
    expVel[i * 3 + 2] = speed * Math.cos(phi);
  }

  expGeo.setAttribute('position', new THREE.BufferAttribute(expPos, 3));

  const expMat = new THREE.PointsMaterial({
    size: 0.3,
    map: texture,
    color: 0x00f5d4,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  explosionParticles = new THREE.Points(expGeo, expMat);
  explosionParticles.userData = { velocities: expVel };
  scene.add(explosionParticles);
}

function createConcaveArcTextParticles(texture) {
  const text = "¡FELIZ CUMPLEAÑOS!";
  totalChars = text.length;

  const points = [];
  const colorArr = [];
  const initialArr = [];
  const charIdxArr = [];

  const cMint = new THREE.Color(0x00f5d4);
  const cTurquoise = new THREE.Color(0x00b4d8);
  const cWhite = new THREE.Color(0xffffff);

  const totalWidth = 23.1;
  const arcHeight = 3.36;
  const baseY = 10.5;

  for (let c = 0; c < totalChars; c++) {
    const char = text[c];
    if (char === ' ') continue;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.font = 'bold 140px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(char, 128, 128);

    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;

    const norm = (c / (totalChars - 1)) * 2 - 1;
    const letterBaseX = norm * (totalWidth / 2);
    const letterBaseY = baseY - Math.pow(norm, 2) * arcHeight;
    const rotAngle = -norm * 0.35;

    for (let y = 0; y < 256; y += 5) {
      for (let x = 0; x < 256; x += 5) {
        const index = (y * 256 + x) * 4;
        if (data[index + 3] > 120) {
          const offsetX = (x - 128) * 0.01575;
          const offsetY = (128 - y) * 0.01575;

          const finalX = letterBaseX + (offsetX * Math.cos(rotAngle) - offsetY * Math.sin(rotAngle));
          const finalY = letterBaseY + (offsetX * Math.sin(rotAngle) + offsetY * Math.cos(rotAngle));
          const finalZ = 0;

          points.push(finalX, finalY, finalZ);
          initialArr.push(0, 6.8, 0);
          charIdxArr.push(c);

          const rand = Math.random();
          let chosenColor = rand > 0.5 ? cMint : (rand > 0.2 ? cTurquoise : cWhite);
          colorArr.push(chosenColor.r, chosenColor.g, chosenColor.b);
        }
      }
    }
  }

  targetPositions = new Float32Array(points);
  initialPositions = new Float32Array(initialArr);
  baseParticleColors = new Float32Array(colorArr);
  particleCharIndices = new Int32Array(charIdxArr);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(initialPositions), 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(baseParticleColors), 3));

  const material = new THREE.PointsMaterial({
    size: 0.24,
    map: texture,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  textParticlesMesh = new THREE.Points(geometry, material);
  scene.add(textParticlesMesh);
}

function onWindowResize() {
  const container = document.getElementById('canvas-container');
  const aspect = container.clientWidth / container.clientHeight;
  camera.aspect = aspect;

  let camZ = 24;
  let camY = 8;
  if (aspect < 0.7) {
    camZ = 42;
    camY = 10;
  } else if (aspect < 1.1) {
    camZ = 32;
    camY = 9;
  }
  camera.position.set(0, camY, camZ);

  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (sequenceState === 0) {
    animTime += 0.012;
    if (fireworkSpark) fireworkSpark.position.y = THREE.MathUtils.lerp(0, 6.8, animTime);
    if (animTime >= 1) {
      sequenceState = 1;
      animTime = 0;
      if (fireworkSpark) scene.remove(fireworkSpark);
      explosionParticles.material.opacity = 1;
    }
  } else if (sequenceState === 1) {
    animTime += 0.018;
    const pos = explosionParticles.geometry.attributes.position;
    const vel = explosionParticles.userData.velocities;
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(
        i,
        pos.getX(i) + vel[i * 3] * 0.014,
        pos.getY(i) + vel[i * 3 + 1] * 0.014,
        pos.getZ(i) + vel[i * 3 + 2] * 0.014
      );
    }
    pos.needsUpdate = true;
    explosionParticles.material.opacity = 1 - animTime;
    if (animTime >= 1) {
      sequenceState = 2;
      animTime = 0;
      scene.remove(explosionParticles);
    }
  } else if (sequenceState === 2) {
    animTime += 0.015;
    if (animTime >= 1) {
      sequenceState = 3;
      animTime = 0;
      revealedCharsCount = 0;
    }
  } else if (sequenceState === 3) {
    animTime += 0.025;
    if (animTime >= 1) {
      animTime = 0;
      revealedCharsCount++;
      if (revealedCharsCount > totalChars) sequenceState = 4;
    }

    const posAttr = textParticlesMesh.geometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      if (particleCharIndices[i] <= revealedCharsCount) {
        const tx = targetPositions[i * 3];
        const ty = targetPositions[i * 3 + 1];
        const tz = targetPositions[i * 3 + 2];
        posAttr.setXYZ(
          i,
          THREE.MathUtils.lerp(posAttr.getX(i), tx, 0.15),
          THREE.MathUtils.lerp(posAttr.getY(i), ty, 0.15),
          THREE.MathUtils.lerp(posAttr.getZ(i), tz, 0.15)
        );
      }
    }
    posAttr.needsUpdate = true;
  }

  if (galaxyMesh) galaxyMesh.rotation.y += 0.0012;
  if (blackHoleDisk) blackHoleDisk.rotation.z += 0.008;
  if (glowMesh) glowMesh.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.05);

  controls.update();
  renderer.render(scene, camera);
}