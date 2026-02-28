/* ==========================================
   Two Player Story Mode – Game Logic
   ========================================== */

/* ── Game State ──────────────────────────── */
const state = {
  currentLevel: 'landing',
  progress: 0,
  relationshipHealth: 40,
  distanceActive: false,
  distanceValue: 0,
  coopActive: false,
  parentsDone: { you: false, me: false },
  coopDone: {},
  achievements: [],
  level1Done: false,
  level4Outcome: false,
};

/* ── Level Config ────────────────────────── */
const LEVELS = {
  landing:  { progress: 0,   healthBoost: 0,  label: '' },
  level1:   { progress: 10,  healthBoost: 10, label: 'Level 1' },
  level2:   { progress: 25,  healthBoost: 8,  label: 'Level 2' },
  level3:   { progress: 45,  healthBoost: 15, label: 'Level 3' },
  level4:   { progress: 55,  healthBoost: 12, label: 'Level 4' },
  level5:   { progress: 70,  healthBoost: 10, label: 'Level 5' },
  level6:   { progress: 80,  healthBoost: 8,  label: 'Level 6' },
  level7:   { progress: 90,  healthBoost: 5,  label: 'Level 7' },
  level8:   { progress: 95,  healthBoost: 5,  label: 'Level 8' },
  final:    { progress: 100, healthBoost: 0,  label: 'Final' },
};

/* ── DOM Helpers ─────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Init ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initConfettiCanvas();
  showScreen('landing');
});

/* ── Screen Management ───────────────────── */
function showScreen(id) {
  // Hide all
  $$('.screen').forEach(s => s.classList.remove('active'));

  const target = $(`#screen-${id}`);
  if (!target) return;
  target.classList.add('active');

  state.currentLevel = id;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update header
  const cfg = LEVELS[id];
  if (id === 'landing') {
    $('#game-header').classList.remove('visible');
  } else {
    $('#game-header').classList.add('visible');
    updateProgress(cfg.progress);
    updateStatusBar(id);
    $('#level-badge').textContent = cfg.label;
    // Boost health on new level
    if (cfg.healthBoost > 0) {
      state.relationshipHealth = Math.min(100, state.relationshipHealth + cfg.healthBoost);
      updateHealthBar();
    }
  }
}

/* ── Progress Bar ────────────────────────── */
function updateProgress(pct) {
  state.progress = pct;
  $('#progress-fill').style.width = pct + '%';
  $('#progress-pct').textContent = pct + '%';
}

/* ── Status Bar ──────────────────────────── */
function updateStatusBar(levelId) {
  // Health
  updateHealthBar();

  // Distance meter
  const distancePill = $('#status-distance');
  const coopPill     = $('#status-coop');

  if (levelId === 'level2' || levelId === 'level3' || levelId === 'level4') {
    state.distanceActive = true;
    state.distanceValue  = levelId === 'level2' ? 85 : levelId === 'level3' ? 65 : 45;
    distancePill.classList.add('active');
    distancePill.classList.remove('hidden');
    $('#distance-fill-bar').style.width = state.distanceValue + '%';
    coopPill.classList.remove('active');
  } else if (levelId === 'level5') {
    state.distanceValue = 20;
    distancePill.classList.add('active');
    distancePill.classList.remove('hidden');
    $('#distance-fill-bar').style.width = '20%';
    coopPill.classList.remove('active');
  } else if (['level6','level7','level8','final'].includes(levelId)) {
    state.distanceActive = false;
    state.coopActive = true;
    distancePill.classList.add('hidden');
    coopPill.classList.add('active');
    coopPill.classList.remove('hidden');
  } else {
    distancePill.classList.remove('active', 'hidden');
    coopPill.classList.remove('active');
    $('#distance-fill-bar').style.width = '0%';
  }
}

function updateHealthBar() {
  const fill = $('#health-fill-bar');
  if (fill) fill.style.width = state.relationshipHealth + '%';
}

/* ── Landing ─────────────────────────────── */
function pressStart() {
  showScreen('level1');
}

/* ── Level 1 – Meet Cute ─────────────────── */
function makeChoice1(choice) {
  const wrongBox   = $('#l1-wrong');
  const correctBox = $('#l1-correct');
  const memory     = $('#l1-memory');
  const pointsPop  = $('#l1-points');
  const continueBtn = $('#l1-continue');

  wrongBox.style.display   = 'none';
  correctBox.style.display = 'none';

  if (choice === 'ignore' || choice === 'polite') {
    wrongBox.style.display = 'block';
    wrongBox.querySelector('p').textContent = '⚠️ Alternate universe unlocked: We remain strangers.';
    continueBtn.classList.add('hidden');
    memory.classList.remove('visible');
    pointsPop.classList.remove('visible');
  } else if (choice === 'talk') {
    correctBox.style.display = 'block';
    state.relationshipHealth = Math.min(100, state.relationshipHealth + 10);
    updateHealthBar();
    pointsPop.classList.add('visible');
    memory.classList.add('visible');
    continueBtn.classList.remove('hidden');
    state.level1Done = true;
  }
}

function retryLevel1() {
  const wrongBox = $('#l1-wrong');
  wrongBox.style.display = 'none';
}

/* ── Level 2 – Germany Mode ──────────────── */
function initLevel2() {
  // Animate the map line
  setTimeout(() => {
    const fill  = $('#l2-map-line-fill');
    const plane = $('#l2-plane');
    if (fill)  fill.style.width = '100%';
    if (plane) plane.style.left = '100%';

    // Animate distance meter in status bar
    setTimeout(() => {
      $('#distance-fill-bar').style.width = '85%';
    }, 500);
  }, 400);
}

function makeChoice2(choice) {
  const wrongMsg  = $('#l2-wrong');
  const unlockSec = $('#l2-unlock');
  const continueBtn = $('#l2-continue');

  wrongMsg.style.display  = 'none';
  unlockSec.classList.remove('visible');

  if (choice === 'stop' || choice === 'sometimes') {
    wrongMsg.style.display = 'block';
    wrongMsg.querySelector('p').textContent = '❌ Wrong choice. Try Again.';
    continueBtn.classList.add('hidden');
  } else if (choice === 'everyday') {
    unlockSec.classList.add('visible');
    continueBtn.classList.remove('hidden');
    state.relationshipHealth = Math.min(100, state.relationshipHealth + 15);
    updateHealthBar();
    setTimeout(() => showAchievement('🌍', 'Survived Time Zones', 'Long distance? No problem.'), 600);
  }
}

function retryLevel2() {
  $('#l2-wrong').style.display = 'none';
}

/* ── Level 3 – Proposal ──────────────────── */
function makeChoice3(choice) {
  const panicMsg    = $('#l3-panic');
  const thinkMsg    = $('#l3-think');
  const yesSection  = $('#l3-yes');
  const continueBtn = $('#l3-continue');
  const pointsPop   = $('#l3-points');

  panicMsg.style.display  = 'none';
  thinkMsg.style.display  = 'none';
  yesSection.classList.remove('visible');

  if (choice === 'panic') {
    panicMsg.style.display = 'block';
    continueBtn.classList.add('hidden');
  } else if (choice === 'think') {
    thinkMsg.style.display = 'block';
    continueBtn.classList.add('hidden');
  } else if (choice === 'yes') {
    yesSection.classList.add('visible');
    pointsPop.classList.add('visible');
    continueBtn.classList.remove('hidden');
    state.relationshipHealth = Math.min(100, state.relationshipHealth + 20);
    updateHealthBar();
    launchConfetti();
    setTimeout(() => showAchievement('💍', 'Boss Battle Cleared', '+50 Commitment Points'), 1000);
  }
}

function retryLevel3(type) {
  $(`#l3-${type}`).style.display = 'none';
}

/* ── Level 4 – Parents Approval ──────────── */
function doParentAction(type) {
  const btn = $(`#pb-${type}`);
  btn.classList.add('done');
  state.parentsDone[type] = true;

  const memTitle = {
    you: 'Your Parents',
    me:  'My Parents',
    miracle: 'When in Doubt…',
  };
  const memBody = {
    you:     'Telling your parents was a quiet kind of brave. A cup of chai, a deep breath, and a conversation that had been waiting for the right moment. They listened. They worried. They eventually smiled.',
    me:      'My parents already suspected something. Still, saying it out loud made it real. There were questions, there were long pauses, and then there was a "we just want you to be happy." That was enough.',
    miracle: 'We may or may not have sent a few hopeful thoughts into the universe. We may or may not have refreshed our phones every hour. What? It works sometimes.',
  };

  openModal(memTitle[type], memBody[type], null, null);

  // Check if both done
  if (state.parentsDone.you && state.parentsDone.me) {
    setTimeout(() => {
      $('#l4-success').classList.add('visible');
      $('#l4-continue').classList.remove('hidden');
      showAchievement('🏅', 'Patience +100', 'Both families on board.');
    }, 400);
  }
}

function doMiracle() {
  doParentAction('miracle');
  const btn = $('#pb-miracle');
  btn.classList.add('done');
}

/* ── Level 5 – Engagement ────────────────── */
function initLevel5() {
  launchConfetti();
}

/* ── Level 6 – Co-Op Mode ────────────────── */
function initLevel6() {
  // Distance meter hides, co-op appears (handled by updateStatusBar)
  $('#l6-banner').classList.add('visible');
}

function doCoopAction(type) {
  const memories = {
    grocery: {
      title: '🛒 First Grocery Raid',
      body:  'The list said "essentials." We came back with three types of cheese, a candle, snacks we didn\'t need, and somehow forgot milk. Peak co-op behavior.',
      xp: 'Domestic Skill +12',
    },
    cook: {
      title: '🍳 First Cooked Meal',
      body:  'It was pasta. Simple. Slightly overcooked. Eaten at 9pm because someone (no one is naming names) kept insisting the water would boil faster if watched closely. Best meal ever.',
      xp: 'Cooking XP +25',
    },
    fight: {
      title: '🌩️ First Real Fight',
      body:  'It was about something small. Or maybe it wasn\'t. Either way, it ended with honesty, a bit of silence, and then someone making tea as a peace offering. We learned something that day.',
      xp: 'Emotional Intelligence +30',
    },
    sunday: {
      title: '☀️ First Lazy Sunday',
      body:  'No alarms. No plans. Breakfast at noon. Two people on the same couch, half-watching something, half-just-existing-together. The best kind of nothing.',
      xp: 'Comfort Level +40',
    },
  };

  const m = memories[type];
  if (!m) return;
  openModal(m.title, m.body, null, m.xp);

  state.coopDone[type] = true;
  $(`#coop-${type}`).classList.add('unlocked');

  const allDone = ['grocery','cook','fight','sunday'].every(k => state.coopDone[k]);
  if (allDone) {
    setTimeout(() => {
      $('#l6-continue').classList.remove('hidden');
      showAchievement('🏠', 'Living Together IRL', 'Co-Op Mode: Fully Active');
    }, 400);
  }
}

/* ── Level 7 – Europe Map ────────────────── */
const MAP_LOCATIONS = {
  germany: {
    title: '🇩🇪 Germany',
    body: 'The city that started it all. Germany wasn\'t just a destination — it was the setting for a whole chapter. Early morning walks, trying to decode menus, figuring out the DB train app. Home base for a long stretch.',
    xp: 'Germany XP +50',
    locked: false,
  },
  france: {
    title: '🇫🇷 France',
    body: 'Paris did its thing — in the best possible way. Croissants for breakfast, getting slightly lost on purpose, the Eiffel Tower looking exactly how it does in every photo and somehow still surprising you.',
    xp: 'Travel XP +35',
    locked: false,
  },
  netherlands: {
    title: '🇳🇱 Netherlands',
    body: 'Amsterdam: canals, bikes everywhere, and the discovery that Dutch stroopwafels are dangerously good. Two people trying to figure out the right side of the cycle path, failing enthusiastically.',
    xp: 'Travel XP +30',
    locked: false,
  },
  austria: {
    title: '🇦🇹 Austria',
    body: 'Vienna had a very specific energy — like a city that\'s had centuries to figure out how to do things properly. Coffee, architecture, and at least one argument about which museum to visit first.',
    xp: 'Travel XP +30',
    locked: false,
  },
  czech: {
    title: '🇨🇿 Czech Republic',
    body: 'Prague at golden hour is the kind of thing that makes you stop mid-sentence. Cobblestones, bridges, and an old town that makes you feel like you\'ve stepped into a fairytale.',
    xp: 'Travel XP +28',
    locked: false,
  },
  italy: {
    title: '🇮🇹 Italy – Future DLC',
    body: '🔒 Locked. Future DLC. This chapter hasn\'t been written yet — but the pasta is already booked in our imagination.',
    xp: null,
    locked: true,
  },
  spain: {
    title: '🇪🇸 Spain – Future DLC',
    body: '🔒 Locked. Future DLC. Sun, tapas, and a Mediterranean coast that\'s been on the list for a while.',
    xp: null,
    locked: true,
  },
  greece: {
    title: '🇬🇷 Greece – Future DLC',
    body: '🔒 Locked. Future DLC. White walls, blue doors, and the Aegean Sea. Coming soon™.',
    xp: null,
    locked: true,
  },
};

function openMapPin(country) {
  const loc = MAP_LOCATIONS[country];
  if (!loc) return;
  openModal(loc.title, loc.body, null, loc.xp);
  if (!loc.locked) {
    setTimeout(() => showAchievement('✈️', 'Travel XP Gained', loc.title.replace(/^[^\w]+ /, '')), 500);
  }
}

/* ── Level 8 – Side Quests ───────────────── */
const QUESTS = {
  grocery: {
    title: '🛒 Grocery Raid',
    diff: 'Difficulty: Medium',
    body: 'Every grocery run starts with a list and ends with several items that were definitely not on it. The snack aisle is a lawless zone. No one is safe.',
    skill: 'Skill Gained: Resource Management',
    reward: 'Reward: Full fridge (briefly)',
  },
  cooking: {
    title: '🍳 Cooking Challenge',
    diff: 'Difficulty: Variable',
    body: 'Some days it\'s a proper meal with actual effort. Other days it\'s "we\'re having toast and calling it dinner." Both count. Progress is progress.',
    skill: 'Skill Gained: Culinary Creativity',
    reward: 'Reward: Not eating out (sometimes)',
  },
  pokemon: {
    title: '📱 Pokémon Go Hunt',
    diff: 'Difficulty: Very Easy (Dangerously Addictive)',
    body: 'Walking has never felt more purposeful. "Just one more stop" is always a lie. We have walked 3km in the wrong direction because of a rare spawn and we regret nothing.',
    skill: 'Skill Gained: Navigation (debatable)',
    reward: 'Reward: Steps count + bragging rights',
  },
  study: {
    title: '📚 Study Mode',
    diff: 'Difficulty: High',
    body: 'The two-person study session. One person is focused. The other has opened four other tabs. Someone always needs a snack break. Somehow things still get done.',
    skill: 'Skill Gained: Focus (eventually)',
    reward: 'Reward: Stuff actually learned',
  },
  cleaning: {
    title: '🧹 Cleaning Boss Fight',
    diff: 'Difficulty: High',
    body: 'Cleaning Boss Fight requires coordination, negotiation, and the mutual agreement that yes, the bathroom needs to happen. Battle music optional but recommended. Victory: a peaceful Sunday.',
    skill: 'Skill Gained: Teamwork +25',
    reward: 'Reward: Peaceful Sunday',
  },
};

function openQuest(id) {
  const q = QUESTS[id];
  if (!q) return;
  openModal(q.title, q.body, `${q.skill} · ${q.reward}`, 'Side Quest Complete');
}

/* ── Modal ───────────────────────────────── */
function openModal(title, body, sub, xp) {
  const overlay = $('#modal-overlay');
  $('#modal-title').textContent = title;
  $('#modal-body').textContent  = body;

  const subEl = $('#modal-sub');
  if (sub) {
    subEl.textContent = sub;
    subEl.style.display = 'block';
  } else {
    subEl.style.display = 'none';
  }

  const xpEl = $('#modal-xp');
  if (xp) {
    xpEl.textContent = '⭐ ' + xp;
    xpEl.style.display = 'inline-flex';
  } else {
    xpEl.style.display = 'none';
  }

  overlay.classList.add('visible');
}

function closeModal() {
  $('#modal-overlay').classList.remove('visible');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  const overlay = $('#modal-overlay');
  if (e.target === overlay) closeModal();
});

/* ── Achievement Popup ───────────────────── */
let achievementTimer = null;

function showAchievement(icon, name, desc) {
  if (achievementTimer) clearTimeout(achievementTimer);

  const popup = $('#achievement-popup');
  $('#ach-icon').textContent = icon;
  $('#ach-name').textContent = name;
  $('#ach-desc').textContent = desc;

  popup.classList.remove('visible');
  // Force reflow for re-animation
  void popup.offsetWidth;
  popup.classList.add('visible');

  state.achievements.push(name);

  achievementTimer = setTimeout(() => {
    popup.classList.remove('visible');
  }, 4000);
}

function closeAchievement() {
  $('#achievement-popup').classList.remove('visible');
}

/* ── Easter Egg ──────────────────────────── */
function showEasterEgg() {
  $('#easter-egg-popup').classList.add('visible');
}

function closeEasterEgg() {
  $('#easter-egg-popup').classList.remove('visible');
}

/* ── Confetti ────────────────────────────── */
let confettiCanvas, confettiCtx, confettiPieces = [], confettiRunning = false;

function initConfettiCanvas() {
  confettiCanvas = $('#confetti-canvas');
  confettiCtx = confettiCanvas.getContext('2d');
  resizeConfetti();
  window.addEventListener('resize', resizeConfetti);
}

function resizeConfetti() {
  if (!confettiCanvas) return;
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

function launchConfetti() {
  resizeConfetti();
  confettiPieces = [];
  const colors = ['#D4A5A5','#C9A84C','#B87070','#F7E7E7','#F0E4B8','#89B4E8','#A8C87A','#E87E7E'];
  for (let i = 0; i < 180; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -Math.random() * confettiCanvas.height * 0.5,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2,
      opacity: 1,
    });
  }
  if (!confettiRunning) animateConfetti();
}

function animateConfetti() {
  confettiRunning = true;
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiPieces = confettiPieces.filter(p => p.y < confettiCanvas.height + 20 && p.opacity > 0.05);

  confettiPieces.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;
    if (p.y > confettiCanvas.height * 0.7) p.opacity -= 0.015;

    confettiCtx.save();
    confettiCtx.globalAlpha = p.opacity;
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.rotation * Math.PI / 180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.beginPath();
    confettiCtx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
    confettiCtx.fill();
    confettiCtx.restore();
  });

  if (confettiPieces.length > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiRunning = false;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

/* ── Particles Background ────────────────── */
let particlesCanvas, particlesCtx, particles = [];

function initParticles() {
  particlesCanvas = $('#particles-canvas');
  particlesCtx = particlesCanvas.getContext('2d');
  resizeParticles();
  window.addEventListener('resize', resizeParticles);

  for (let i = 0; i < 40; i++) spawnParticle();
  animateParticles();
}

function resizeParticles() {
  if (!particlesCanvas) return;
  particlesCanvas.width  = window.innerWidth;
  particlesCanvas.height = window.innerHeight;
}

function spawnParticle() {
  const symbols = ['❤', '✦', '·', '•', '✿', '♡'];
  particles.push({
    x: Math.random() * (particlesCanvas ? particlesCanvas.width : window.innerWidth),
    y: Math.random() * (particlesCanvas ? particlesCanvas.height : window.innerHeight),
    size: Math.random() * 8 + 4,
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    speed: Math.random() * 0.4 + 0.1,
    drift: (Math.random() - 0.5) * 0.3,
    opacity: Math.random() * 0.3 + 0.05,
    color: ['#D4A5A5','#C9A84C','#B87070'][Math.floor(Math.random() * 3)],
  });
}

function animateParticles() {
  if (!particlesCtx) return;
  particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

  particles.forEach((p, i) => {
    p.y -= p.speed;
    p.x += p.drift;

    particlesCtx.save();
    particlesCtx.globalAlpha = p.opacity;
    particlesCtx.fillStyle = p.color;
    particlesCtx.font = `${p.size}px serif`;
    particlesCtx.fillText(p.symbol, p.x, p.y);
    particlesCtx.restore();

    // Reset when off screen
    if (p.y < -20) {
      p.y = particlesCanvas.height + 20;
      p.x = Math.random() * particlesCanvas.width;
    }
  });

  requestAnimationFrame(animateParticles);
}

/* ── Level Navigation Hooks ──────────────── */
function goToLevel(id) {
  // Run any level init hooks
  if (id === 'level2') {
    showScreen(id);
    setTimeout(initLevel2, 300);
  } else if (id === 'level5') {
    showScreen(id);
    setTimeout(initLevel5, 500);
  } else if (id === 'level6') {
    showScreen(id);
    setTimeout(initLevel6, 300);
  } else {
    showScreen(id);
  }
}

/* ── Final Screen Init ───────────────────── */
function initFinal() {
  showScreen('final');
  setTimeout(() => {
    const fill = $('#final-progress-fill');
    if (fill) fill.style.width = '100%';
    launchConfetti();
    setTimeout(() => showAchievement('🏆', 'Story Mode: Ongoing', '3.5 years and counting.'), 1200);
  }, 400);
}
