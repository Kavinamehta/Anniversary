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
  ringClickCount: 0,
  sideQuestsDone: {},
  l2MapInit: false,
  l7MapInit: false,
  // Scoring system — tracked per category
  points: {
    curiosity: 0, courage: 0, chemistry: 0, intentionality: 0, commitment: 0,
    emotional_resilience: 0, leap_of_faith: 0, trust: 0, teamwork: 0, playfulness: 0, adventure: 0
  },
  score: 0,
  earnedBadges: [],
  bonusQuestsDone: {},
  countriesVisited: [],
  l5Scored: false,
  l4Scored: false,
  level3Done: false,
  // Level 1 stage completion tracking
  l1s1Done: false,
  l1s2Done: false,
  l1s3Done: false,
  l1s4Done: false,
};

/* ── Level Config ────────────────────────── */
const LEVELS = {
  landing:       { progress: 0,   healthBoost: 0,  label: '' },
  'level1-s1':   { progress: 3,   healthBoost: 3,  label: 'Level 1' },
  'level1-s2':   { progress: 5,   healthBoost: 3,  label: 'Level 1' },
  'level1-s3':   { progress: 7,   healthBoost: 2,  label: 'Level 1' },
  'level1-s4':   { progress: 10,  healthBoost: 2,  label: 'Level 1' },
  level2:   { progress: 25,  healthBoost: 8,  label: 'Level 2' },
  level3:   { progress: 45,  healthBoost: 15, label: 'Level 3' },
  level4:   { progress: 55,  healthBoost: 12, label: 'Level 4' },
  level5:   { progress: 70,  healthBoost: 10, label: 'Level 5' },
  level6:   { progress: 75,  healthBoost: 8,  label: 'Level 6' },
  bonus:    { progress: 82,  healthBoost: 5,  label: 'Bonus' },
  level7:   { progress: 92,  healthBoost: 5,  label: 'Level 7' },
  final:    { progress: 100, healthBoost: 0,  label: 'Final' },
};

/* ── Back Navigation Map ─────────────────── */
const PREV_LEVEL = {
  'level1-s2': 'level1-s1',
  'level1-s3': 'level1-s2',
  'level1-s4': 'level1-s3',
  level2: 'level1-s4',
  level3: 'level2',
  level4: 'level3',
  level5: 'level4',
  level6: 'level5',
  level7: 'bonus',
  bonus:  'level6',
  final:  'level7',
};

/* ── Score Config ────────────────────────── */
const SCORE_CONFIG = {
  l1_s1:        { points: 5,   label: 'L1 Stage 1 – The Almost Interaction', category: 'curiosity' },
  l1_s2_courage:{ points: 10,  label: 'L1 Stage 2 – Courage', category: 'courage' },
  l1_s2_chem:   { points: 10,  label: 'L1 Stage 2 – Chemistry', category: 'chemistry' },
  l1_s3:        { points: 15,  label: 'L1 Stage 3 – Café Meeting', category: 'intentionality' },
  l1_s4:        { points: 50,  label: 'L1 Stage 4 – Airport Decision', category: 'commitment' },
  level2:       { points: 15,  label: 'Level 2 – Long Distance',    category: 'emotional_resilience' },
  level3:       { points: 50,  label: 'Level 3 – Proposal',          category: 'leap_of_faith' },
  level4:       { points: 20,  label: 'Level 4 – Parents',           category: 'trust' },
  level5:       { points: 10,  label: 'Level 5 – Engagement',        category: 'commitment' },
  coop_grocery: { points: 10,  label: 'Co-Op: Grocery Raid',         category: 'teamwork' },
  coop_cook:    { points: 10,  label: 'Co-Op: First Meal',           category: 'teamwork' },
  coop_fight:   { points: 10,  label: 'Co-Op: First Fight',          category: 'trust' },
  coop_sunday:  { points: 10,  label: 'Co-Op: Lazy Sunday',          category: 'playfulness' },
  bonus_grocery:  { points: 5, label: 'Bonus: Grocery Raid',         category: 'teamwork' },
  bonus_cooking:  { points: 5, label: 'Bonus: Cooking',              category: 'teamwork' },
  bonus_pokemon:  { points: 5, label: 'Bonus: Pokémon Go',           category: 'playfulness' },
  bonus_study:    { points: 5, label: 'Bonus: Study Mode',           category: 'intentionality' },
  bonus_cleaning: { points: 5, label: 'Bonus: Cleaning',             category: 'teamwork' },
  travel_germany:     { points: 10, label: 'Travel: Germany',        category: 'adventure' },
  travel_netherlands: { points: 10, label: 'Travel: Netherlands',    category: 'adventure' },
  travel_england:     { points: 10, label: 'Travel: England',        category: 'adventure' },
  travel_scotland:    { points: 10, label: 'Travel: Scotland',       category: 'adventure' },
  travel_luxembourg:  { points: 10, label: 'Travel: Luxembourg',     category: 'adventure' },
  travel_hungary:     { points: 10, label: 'Travel: Hungary',        category: 'adventure' },
  travel_denmark:     { points: 10, label: 'Travel: Denmark',        category: 'adventure' },
  sq_doubt:    { points: 10, label: 'Side Quest: The Doubt Level',   category: 'trust' },
  sq_latenight:{ points: 10, label: 'Side Quest: 11:30 PM Calls',   category: 'chemistry' },
  sq_goa:      { points: 10, label: 'Side Quest: Goa',               category: 'adventure' },
  sq_distance_mini: { points: 10, label: 'Side Quest: Mini Distance', category: 'intentionality' },
};

const MAX_SCORE = Object.values(SCORE_CONFIG).reduce((sum, c) => sum + c.points, 0);

/* ── All Possible Badges ────────────────── */
const ALL_BADGES = [
  { id: 'first_move',    icon: '💌', name: 'First Move Made',        desc: 'Someone had the courage to say hi.' },
  { id: 'ldr_activated', icon: '✈️', name: 'Long Distance Mode Activated', desc: 'Relationship official along with Long Distance status' },
  { id: 'time_zones',    icon: '🌍', name: 'Survived Time Zones',    desc: 'Long distance? No problem.' },
  { id: 'boss_battle',   icon: '💍', name: 'Boss Battle Cleared',    desc: '+50 Commitment Points' },
  { id: 'patience',      icon: '🏅', name: 'Patience +100',          desc: 'Both families on board.' },
  { id: 'coop_irl',      icon: '🏠', name: 'Living Together IRL',    desc: 'Co-Op Mode: Fully Active' },
  { id: 'travel_germany',     icon: '✈️', name: 'Germany Explored',        desc: 'Home base unlocked.' },
  { id: 'travel_france',      icon: '✈️', name: 'France Explored',         desc: 'Croissants acquired.' },
  { id: 'travel_netherlands', icon: '✈️', name: 'Netherlands Explored',    desc: 'Stroopwafels secured.' },
  { id: 'travel_england',     icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England Explored',         desc: 'London calling.' },
  { id: 'travel_scotland',    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', name: 'Scotland Explored',        desc: 'Highlands conquered.' },
  { id: 'travel_luxembourg',  icon: '🇱🇺', name: 'Luxembourg Explored',      desc: 'Tiny country, big memories.' },
  { id: 'travel_hungary',     icon: '🇭🇺', name: 'Hungary Explored',         desc: 'Budapest nights.' },
  { id: 'travel_denmark',     icon: '🇩🇰', name: 'Denmark Explored',         desc: 'Hygge unlocked.' },
  { id: 'travel_austria',     icon: '✈️', name: 'Austria Explored',         desc: 'Sachertorte tasted.' },
  { id: 'travel_czech',       icon: '✈️', name: 'Czech Republic Explored',  desc: 'Prague at golden hour.' },
  { id: 'sq_doubt',      icon: '🛡️', name: 'Trust Shield +20',       desc: 'The Doubt Level cleared.' },
  { id: 'sq_latenight',  icon: '📞', name: 'Night Owl Badge',        desc: '11:30 PM calls survived.' },
  { id: 'sq_goa',        icon: '🏖️', name: 'Goa Memory Unlocked',    desc: 'Beach expansion complete.' },
  { id: 'sq_distance_mini', icon: '🚂', name: 'Close-Range Survivor', desc: 'Mini distance mode cleared.' },
  { id: 'story_ongoing', icon: '🏆', name: 'Story Mode: Ongoing',    desc: '3.5 years and counting.' },
];

/* ── Side-Quest Levels ───────────────────── */
const SIDE_QUEST_LEVELS = ['level2', 'level6'];

/* ── DOM Helpers ─────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);

/* ── Shared helper: highlight correct choice & show "Good choice." ── */
function markCorrectChoice(gridId, correctValue) {
  const grid = $(gridId);
  if (!grid) return;
  Array.from(grid.querySelectorAll('.choice-btn')).forEach(btn => {
    btn.disabled = true;
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("'" + correctValue + "'")) {
      btn.classList.add('choice-btn--correct');
    }
  });
  let msg = grid.nextElementSibling;
  if (!msg || !msg.classList.contains('good-choice-msg')) {
    msg = document.createElement('div');
    msg.className = 'good-choice-msg';
    msg.textContent = 'Good choice.';
    grid.insertAdjacentElement('afterend', msg);
  }
  msg.classList.add('visible');
}
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Score & Badge Helpers ────────────────── */
function addScore(key) {
  const cfg = SCORE_CONFIG[key];
  if (!cfg) return;
  state.score += cfg.points;
  // Track per-category if defined
  if (cfg.category && state.points.hasOwnProperty(cfg.category)) {
    state.points[cfg.category] += cfg.points;
  }
}

function awardBadge(id) {
  if (state.earnedBadges.find(b => b.id === id)) return; // no duplicates
  const badge = ALL_BADGES.find(b => b.id === id);
  if (!badge) return;
  state.earnedBadges.push({ ...badge });
  showAchievement(badge.icon, badge.name, badge.desc);
}

/* ── Init ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initConfettiCanvas();
  showScreen('landing');
  initRingEasterEgg();
});

/* ── Screen Management ───────────────────── */
function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));

  const target = $(`#screen-${id}`);
  if (!target) return;
  target.classList.add('active');

  state.currentLevel = id;
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
    if (cfg.healthBoost > 0) {
      state.relationshipHealth = Math.min(100, state.relationshipHealth + cfg.healthBoost);
      updateHealthBar();
    }
  }

  // Side quest button visibility
  const sqBtn = $('#side-quest-trigger');
  if (SIDE_QUEST_LEVELS.includes(id)) {
    sqBtn.classList.remove('hidden');
  } else {
    sqBtn.classList.add('hidden');
  }

  // Golden Save Point button visibility (Level 3 only — shown after correct choice)
  const gsBtn = $('#golden-save-trigger');
  if (id === 'level3' && state.level3Done) {
    gsBtn.classList.remove('hidden');
  } else {
    gsBtn.classList.add('hidden');
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
  updateHealthBar();

  const distancePill = $('#status-distance');
  const coopPill     = $('#status-coop');

  if (levelId === 'level1' || levelId.startsWith('level1-')) {
    // Level 1 (all stages): no distance, no co-op
    distancePill.classList.remove('active');
    distancePill.classList.add('hidden');
    coopPill.classList.remove('active');
    coopPill.classList.add('hidden');
  } else if (levelId === 'level2' || levelId === 'level3' || levelId === 'level4') {
    state.distanceActive = true;
    state.distanceValue  = levelId === 'level2' ? 85 : levelId === 'level3' ? 65 : 45;
    distancePill.classList.add('active');
    distancePill.classList.remove('hidden');
    $('#distance-fill-bar').style.width = state.distanceValue + '%';
    coopPill.classList.remove('active');
    coopPill.classList.add('hidden');
  } else if (levelId === 'level5') {
    state.distanceValue = 20;
    distancePill.classList.add('active');
    distancePill.classList.remove('hidden');
    $('#distance-fill-bar').style.width = '20%';
    coopPill.classList.remove('active');
    coopPill.classList.add('hidden');
  } else if (['level6','bonus','level7','final'].includes(levelId)) {
    state.distanceActive = false;
    state.coopActive = true;
    distancePill.classList.add('hidden');
    coopPill.classList.add('active');
    coopPill.classList.remove('hidden');
    // Update co-op fill bar based on current progress
    const doneCount = ['grocery','cook','fight','sunday'].filter(k => state.coopDone[k]).length;
    const coopFill = $('#coop-fill-bar');
    if (coopFill) coopFill.style.width = (doneCount / 4 * 100) + '%';
  } else {
    distancePill.classList.remove('active');
    distancePill.classList.add('hidden');
    coopPill.classList.remove('active');
    coopPill.classList.add('hidden');
    $('#distance-fill-bar').style.width = '0%';
  }
}

function updateHealthBar() {
  const fill = $('#health-fill-bar');
  if (fill) fill.style.width = state.relationshipHealth + '%';
}

/* ── Back Navigation ────────────────────── */
function goBack() {
  const prev = PREV_LEVEL[state.currentLevel];
  if (prev) goToLevel(prev);
}

/* ── Landing ─────────────────────────────── */
function pressStart() {
  showScreen('level1-s1');
}

/* ── Level 1 – Stage 1: The Almost Interaction ──── */
function makeChoiceL1S1(choice) {
  const wrongBox    = $('#l1s1-wrong');
  const correctBox  = $('#l1s1-correct');
  const pointsPop   = $('#l1s1-points');
  const continueBtn = $('#l1s1-continue');
  const gallery     = $('#l1s1-gallery');

  wrongBox.style.display   = 'none';
  correctBox.style.display = 'none';

  if (choice === 'say_hi' || choice === 'pretend') {
    wrongBox.style.display = 'block';
    const msg = choice === 'say_hi'
      ? '⚠️ Too early. The timing wasn\u2019t right.'
      : '⚠️ Nice try. But you definitely looked.';
    wrongBox.querySelector('p').textContent = msg;
    continueBtn.classList.add('hidden');
    pointsPop.classList.remove('visible');
    gallery.style.display = 'none';
    state.relationshipHealth = Math.max(0, state.relationshipHealth - 5);
    updateHealthBar();
  } else if (choice === 'notice') {
    correctBox.style.display = 'block';
    markCorrectChoice('#l1s1-choices', 'notice');
    state.relationshipHealth = Math.min(100, state.relationshipHealth + 5);
    updateHealthBar();
    pointsPop.classList.add('visible');
    gallery.style.display = 'grid';
    continueBtn.classList.remove('hidden');
    if (!state.l1s1Done) {
      state.l1s1Done = true;
      addScore('l1_s1');
    }
  }
}

function retryL1S1() {
  $('#l1s1-wrong').style.display = 'none';
}

/* ── Level 1 – Stage 2: The Instagram Hi ──────── */
function handleOpenMessage() {
  const mockup     = $('#ig-mockup');
  const msg1       = $('#ig-msg1');
  const msg2       = $('#ig-msg2');
  const pointsPop  = $('#l1s2-points');
  const continueBtn= $('#l1s2-continue');
  const gallery    = $('#l1s2-gallery');
  const openBtn    = $('#l1s2-open-btn');

  // Disable the button
  openBtn.disabled = true;
  openBtn.textContent = 'Opening...';

  // Remove blur
  mockup.classList.add('revealed');

  // Show first message after 0.8s
  setTimeout(() => {
    msg1.classList.add('visible');
  }, 800);

  // Show second message after 2s
  setTimeout(() => {
    msg2.classList.add('visible');
  }, 2000);

  // Show points, gallery, continue after 3s
  setTimeout(() => {
    pointsPop.classList.add('visible');
    gallery.style.display = 'grid';
    continueBtn.classList.remove('hidden');
    $('#l1s2-open-row').style.display = 'none';

    if (!state.l1s2Done) {
      state.l1s2Done = true;
      addScore('l1_s2_courage');
      addScore('l1_s2_chem');
    }

    // Achievement: First Move Made
    setTimeout(() => awardBadge('first_move'), 600);
  }, 3000);
}

/* ── Level 1 – Stage 3: The Café Meeting ──────── */
function makeChoiceL1S3(choice) {
  const wrongBox    = $('#l1s3-wrong');
  const correctBox  = $('#l1s3-correct');
  const pointsPop   = $('#l1s3-points');
  const continueBtn = $('#l1s3-continue');
  const memory      = $('#l1s3-memory');

  wrongBox.style.display   = 'none';
  correctBox.style.display = 'none';

  if (choice === 'scared') {
    wrongBox.style.display = 'block';
    wrongBox.querySelector('p').textContent = '⚠️ You are missing out on something real.';
    continueBtn.classList.add('hidden');
    pointsPop.classList.remove('visible');
    memory.classList.remove('visible');
    state.relationshipHealth = Math.max(0, state.relationshipHealth - 5);
    updateHealthBar();
  } else if (choice === 'pretend') {
    wrongBox.style.display = 'block';
    wrongBox.querySelector('p').textContent = '⚠️ It could be... Try again.';
    continueBtn.classList.add('hidden');
    pointsPop.classList.remove('visible');
    memory.classList.remove('visible');
    state.relationshipHealth = Math.max(0, state.relationshipHealth - 5);
    updateHealthBar();
  } else if (choice === 'show_up') {
    correctBox.style.display = 'block';
    markCorrectChoice('#l1s3-choices', 'show_up');
    state.relationshipHealth = Math.min(100, state.relationshipHealth + 10);
    updateHealthBar();
    pointsPop.classList.add('visible');
    memory.classList.add('visible');
    continueBtn.classList.remove('hidden');
    if (!state.l1s3Done) {
      state.l1s3Done = true;
      addScore('l1_s3');
    }
  }
}

function retryL1S3() {
  $('#l1s3-wrong').style.display = 'none';
}

/* ── Level 1 – Stage 4: The Airport Call ──────── */
function makeChoiceL1S4(choice) {
  const wrongBox    = $('#l1s4-wrong');
  const choices     = $('#l1s4-choices');
  const reveal1     = $('#l1s4-reveal1');

  wrongBox.style.display = 'none';

  if (choice === 'avoid' || choice === 'wait') {
    wrongBox.style.display = 'block';
    const msg = choice === 'avoid'
      ? '⚠️ Some conversations can\u2019t wait for a landing.'
      : '⚠️ Wait for what? The next flight? Ask her now.';
    wrongBox.querySelector('p').textContent = msg;
    state.relationshipHealth = Math.max(0, state.relationshipHealth - 5);
    updateHealthBar();
  } else if (choice === 'ask_gf') {
    // Keep the choice buttons visible, highlight correct, and reveal follow-up text below.
    markCorrectChoice('#l1s4-choices', 'ask_gf');
    reveal1.classList.add('visible');
  }
}

function revealL1S4Final() {
  const reveal2     = $('#l1s4-reveal2');
  const pointsPop   = $('#l1s4-points');
  const statusBanner= $('#l1s4-status');
  const memory      = $('#l1s4-memory');
  const continueBtn = $('#l1s4-continue');

  reveal2.classList.add('visible');
  state.relationshipHealth = Math.min(100, state.relationshipHealth + 20);
  updateHealthBar();

  setTimeout(() => {
    pointsPop.classList.add('visible');
    statusBanner.classList.add('visible');
    memory.classList.add('visible');
    continueBtn.classList.remove('hidden');
    state.level1Done = true;

    if (!state.l1s4Done) {
      state.l1s4Done = true;
      addScore('l1_s4');
    }

    // Achievement: Long Distance Mode Activated
    setTimeout(() => awardBadge('ldr_activated'), 800);
  }, 600);
}

function retryL1S4() {
  $('#l1s4-wrong').style.display = 'none';
}

/* ── Level 2 – Germany Mode ──────────────── */
let l2Map = null;

function initLevel2() {
  if (state.l2MapInit) return;
  state.l2MapInit = true;

  setTimeout(() => {
    const mapEl = document.getElementById('l2-map');
    if (!mapEl || !window.L) return;

    l2Map = L.map('l2-map', { scrollWheelZoom: false, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(l2Map);

    const india   = [20.59, 78.96];
    const germany = [51.16, 10.45];

    // Markers
    L.marker(india, { icon: L.divIcon({ className: 'leaflet-emoji-icon', html: '<span class="emoji-marker">🇮🇳</span>', iconSize: [28, 28], iconAnchor: [14, 14] }) })
      .addTo(l2Map).bindPopup('India 🏠');
    L.marker(germany, { icon: L.divIcon({ className: 'leaflet-emoji-icon', html: '<span class="emoji-marker">🇩🇪</span>', iconSize: [28, 28], iconAnchor: [14, 14] }) })
      .addTo(l2Map).bindPopup('Germany ✈️');

    // Curved flight path
    const points = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = india[0] + (germany[0] - india[0]) * t;
      const lng = india[1] + (germany[1] - india[1]) * t;
      const arc = Math.sin(t * Math.PI) * 12;
      points.push([lat + arc, lng]);
    }
    L.polyline(points, { color: '#C9A84C', weight: 3, dashArray: '8 6', opacity: 0.85 }).addTo(l2Map);

    // Plane icon along path
    const mid = points[Math.floor(steps / 2)];
    L.marker(mid, { icon: L.divIcon({ className: 'leaflet-emoji-icon', html: '<span class="emoji-marker" style="font-size:1.8rem">✈️</span>', iconSize: [32, 32], iconAnchor: [16, 16] }) })
      .addTo(l2Map);

    l2Map.fitBounds([india, germany], { padding: [40, 40] });

    setTimeout(() => { l2Map.invalidateSize(); }, 400);

    // Animate distance meter in status bar
    setTimeout(() => {
      $('#distance-fill-bar').style.width = '85%';
    }, 500);
  }, 400);
}

function makeChoice2(choice) {
  const wrongMsg    = $('#l2-wrong');
  const unlockSec   = $('#l2-unlock');
  const continueBtn = $('#l2-continue');
  const gallery     = $('#l2-gallery');

  wrongMsg.style.display  = 'none';
  unlockSec.classList.remove('visible');

  if (choice === 'stop' || choice === 'sometimes') {
    wrongMsg.style.display = 'block';
    const msg = choice === 'stop'
      ? '🌌 Alternate Universe Unlocked: Relationship Over'
      : "❌ That's not enough.";
    wrongMsg.querySelector('p').textContent = msg;
    continueBtn.classList.add('hidden');
    if (gallery) gallery.classList.remove('visible');
    state.relationshipHealth = Math.max(0, state.relationshipHealth - 5);
    updateHealthBar();
  } else if (choice === 'everyday') {
    unlockSec.classList.add('visible');
    markCorrectChoice('#l2-choices', 'everyday');
    continueBtn.classList.remove('hidden');
    state.relationshipHealth = Math.min(100, state.relationshipHealth + 15);
    updateHealthBar();
    if (gallery) gallery.classList.add('visible');
    addScore('level2');
    setTimeout(() => awardBadge('time_zones'), 600);
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
  const gallery     = $('#l3-gallery');

  panicMsg.style.display  = 'none';
  thinkMsg.style.display  = 'none';
  yesSection.classList.remove('visible');

  if (choice === 'panic') {
    panicMsg.style.display = 'block';
    continueBtn.classList.add('hidden');
    if (gallery) gallery.classList.remove('visible');
    state.relationshipHealth = Math.max(0, state.relationshipHealth - 5);
    updateHealthBar();
  } else if (choice === 'think') {
    thinkMsg.style.display = 'block';
    continueBtn.classList.add('hidden');
    if (gallery) gallery.classList.remove('visible');
    state.relationshipHealth = Math.max(0, state.relationshipHealth - 5);
    updateHealthBar();
  } else if (choice === 'yes') {
    yesSection.classList.add('visible');
    markCorrectChoice('#l3-choices', 'yes');
    pointsPop.classList.add('visible');
    continueBtn.classList.remove('hidden');
    state.relationshipHealth = Math.min(100, state.relationshipHealth + 20);
    updateHealthBar();
    launchConfetti();
    if (gallery) gallery.classList.add('visible');
    addScore('level3');
    setTimeout(() => awardBadge('boss_battle'), 1000);
    state.level3Done = true;
    // Reveal Golden Save Point button now that the correct choice is made
    setTimeout(() => $('#golden-save-trigger').classList.remove('hidden'), 800);
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
    you:     'Telling your parents was scary at few points. But we told them. And with that, came the tough part of convincing them. They listened. They worried. They eventually smiled.',
    me:      'My family was already open to this possibility. Still, saying it out loud made it real. There were questions, there were long pauses, and then there was a "we just want you to be happy." That was enough. (And also beine Jain, but we don't need to go there 😉',
    miracle: 'We may or may not have sent a few hopeful thoughts into the universe. What? It works sometimes.',
  };

  openModal(memTitle[type], memBody[type], null, null);

  if (state.parentsDone.you && state.parentsDone.me && !state.l4Scored) {
    state.l4Scored = true;
    addScore('level4');
    setTimeout(() => {
      $('#l4-success').classList.add('visible');
      $('#l4-continue').classList.remove('hidden');
      awardBadge('patience');
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
  if (!state.l5Scored) {
    state.l5Scored = true;
    addScore('level5');
  }
}

/* ── Level 6 – Co-Op Mode ────────────────── */
function initLevel6() {
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

  const photos = {
    grocery: [{ icon: '🛒', label: 'Add Grocery Photo' }],
    cook:    [{ icon: '🍳', label: 'Add Meal Photo' }],
    fight:   [{ icon: '🌩️', label: 'Add Peace Offering Photo' }],
    sunday:  [{ icon: '☀️', label: 'Add Lazy Day Photo' }],
  };

  openModal(m.title, m.body, null, m.xp, photos[type] || null);

  if (!state.coopDone[type]) {
    state.coopDone[type] = true;
    addScore('coop_' + type);
  }
  $(`#coop-${type}`).classList.add('unlocked');

  // Update co-op fill bar
  const doneCount = ['grocery','cook','fight','sunday'].filter(k => state.coopDone[k]).length;
  const coopFill = $('#coop-fill-bar');
  if (coopFill) coopFill.style.width = (doneCount / 4 * 100) + '%';

  const allDone = doneCount === 4;
  if (allDone) {
    setTimeout(() => {
      $('#l6-continue').classList.remove('hidden');
      awardBadge('coop_irl');
    }, 400);
  }
}

/* ── Level 7 – Europe Map (Expanded) ─────── */
const MAP_LOCATIONS = {
  germany: {
    title: '🇩🇪 Germany',
    body: 'The city that started it all. Germany wasn\'t just a destination — it was the setting for a whole chapter. Early morning walks, trying to decode menus, figuring out the DB train app. Home base for a long stretch.',
    xp: 'Germany XP +50', locked: false,
    coords: [51.16, 10.45],
    photos: [
      { icon: '🏙️', label: 'City Arrival' },
      { icon: '🚶', label: 'Morning Walk' },
      { icon: '🍽️', label: 'First German Meal' },
      { icon: '🚂', label: 'DB Train Adventures' },
      { icon: '🏠', label: 'Home Base' },
      { icon: '🌆', label: 'Golden Hour' },
    ],
  },
  france: {
    title: '🇫🇷 France – Future DLC',
    body: '🔒 Locked. Paris, croissants, the Eiffel Tower — this chapter is still being planned.',
    xp: null, locked: true,
    coords: [48.86, 2.35],
  },
  netherlands: {
    title: '🇳🇱 Netherlands',
    body: 'Amsterdam: canals, bikes everywhere, and the discovery that Dutch stroopwafels are dangerously good. Two people trying to figure out the right side of the cycle path, failing enthusiastically.',
    xp: 'Travel XP +30', locked: false,
    coords: [52.37, 4.90],
    photos: [
      { icon: '🚲', label: 'Bike Adventures' },
      { icon: '🏘️', label: 'Canal Houses' },
      { icon: '🧇', label: 'Stroopwafels' },
      { icon: '🌷', label: 'Tulip Season' },
      { icon: '🏛️', label: 'Museum Quarter' },
    ],
  },
  austria: {
    title: '🇦🇹 Austria – Future DLC',
    body: '🔒 Locked. Vienna\'s coffee houses and architecture. Coming soon.',
    xp: null, locked: true,
    coords: [48.21, 16.37],
  },
  czech: {
    title: '🇨🇿 Czech Republic – Future DLC',
    body: '🔒 Locked. Prague\'s cobblestones and golden-hour skyline. On the roadmap.',
    xp: null, locked: true,
    coords: [50.08, 14.42],
  },
  // ─── Locked / Future DLC Countries ───
  england:       { title: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', body: 'London delivered — double-decker buses, the Thames at night, and streets that already felt strangely familiar. A city that moves fast but keeps every memory sharp.', xp: 'Travel XP +30', locked: false, coords: [51.51, -0.13], photos: [{ icon: '🎡', label: 'London Eye' }, { icon: '🌉', label: 'Tower Bridge' }, { icon: '🚌', label: 'Double Decker' }, { icon: '☕', label: 'London Breakfast' }] },
  scotland:      { title: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland', body: 'Edinburgh\'s old town has a way of slowing you down — cobblestone streets, the castle up on the hill, and a cold that somehow makes everything feel more memorable.', xp: 'Travel XP +30', locked: false, coords: [55.95, -3.19], photos: [{ icon: '🏰', label: 'Edinburgh Castle' }, { icon: '🌿', label: 'Highland Views' }, { icon: '🥃', label: 'Whisky Trail' }, { icon: '🌧️', label: 'Classic Scottish Weather' }] },
  ireland:       { title: '🇮🇪 Ireland – Future DLC', body: '🔒 Locked. Green hills, cozy pubs, and the accent you never get tired of hearing. Coming soon™.', xp: null, locked: true, coords: [53.35, -6.26] },
  spain:         { title: '🇪🇸 Spain – Future DLC', body: '🔒 Locked. Sun, tapas, and a Mediterranean coast that\'s been on the list for a while.', xp: null, locked: true, coords: [40.42, -3.70] },
  portugal:      { title: '🇵🇹 Portugal – Future DLC', body: '🔒 Locked. Pastéis de nata, tram rides through Lisbon, and sunsets over the Atlantic. On the roadmap.', xp: null, locked: true, coords: [38.72, -9.14] },
  italy:         { title: '🇮🇹 Italy – Future DLC', body: '🔒 Locked. This chapter hasn\'t been written yet — but the pasta is already booked in our imagination.', xp: null, locked: true, coords: [41.90, 12.50] },
  greece:        { title: '🇬🇷 Greece – Future DLC', body: '🔒 Locked. White walls, blue doors, and the Aegean Sea. Coming soon™.', xp: null, locked: true, coords: [37.97, 23.73] },
  norway:        { title: '🇳🇴 Norway – Future DLC', body: '🔒 Locked. Fjords, northern lights, and really expensive coffee. Pending expansion pack.', xp: null, locked: true, coords: [59.91, 10.75] },
  sweden:        { title: '🇸🇪 Sweden – Future DLC', body: '🔒 Locked. IKEA homeland, meatballs, and cities that look like they belong in a Scandinavian drama.', xp: null, locked: true, coords: [59.33, 18.07] },
  finland:       { title: '🇫🇮 Finland – Future DLC', body: '🔒 Locked. Saunas, silence, and the world\'s happiest country. Maybe that\'s what we need.', xp: null, locked: true, coords: [60.17, 24.94] },
  denmark:       { title: '🇩🇰 Denmark', body: 'Copenhagen showed us what hygge actually means: canals, colourful Nyhavn houses, and a city that just feels instantly comfortable. Great pastries too — significantly above average.', xp: 'Travel XP +28', locked: false, coords: [55.68, 12.57], photos: [{ icon: '🌈', label: 'Nyhavn Harbour' }, { icon: '🥐', label: 'Danish Pastries' }, { icon: '🚲', label: 'City Cycling' }, { icon: '🏰', label: 'Kronborg Castle' }] },
  poland:        { title: '🇵🇱 Poland – Future DLC', body: '🔒 Locked. Pierogi, old towns, and a country with more history per square meter than most.', xp: null, locked: true, coords: [52.23, 21.01] },
  switzerland:   { title: '🇨🇭 Switzerland – Future DLC', body: '🔒 Locked. Mountains, chocolate, and the kind of precision that makes German trains look casual.', xp: null, locked: true, coords: [46.95, 7.45] },
  hungary:       { title: '🇭🇺 Hungary', body: 'Budapest split across two riverbanks, each one with a completely different personality. Thermal baths, ruin bars, and a Parliament building that looks like it was designed to be dramatic on purpose.', xp: 'Travel XP +28', locked: false, coords: [47.50, 19.04], photos: [{ icon: '🛁', label: 'Thermal Baths' }, { icon: '🏛️', label: 'Parliament Building' }, { icon: '🍷', label: 'Ruin Bar Night' }, { icon: '🌉', label: 'Chain Bridge' }] },
  romania:       { title: '🇷🇴 Romania – Future DLC', body: '🔒 Locked. Dracula\'s castle and the Carpathian mountains. Bonus spooky DLC.', xp: null, locked: true, coords: [44.43, 26.10] },
  croatia:       { title: '🇭🇷 Croatia – Future DLC', body: '🔒 Locked. Dubrovnik, island hopping, and the Adriatic Sea. Eventually.', xp: null, locked: true, coords: [45.81, 15.98] },
  belgium:       { title: '🇧🇪 Belgium – Future DLC', body: '🔒 Locked. Waffles, chocolate, and a country that can\'t decide which language to speak.', xp: null, locked: true, coords: [50.85, 4.35] },
  bulgaria:      { title: '🇧🇬 Bulgaria – Future DLC', body: '🔒 Locked. Black Sea beaches and mountain monasteries. Underrated DLC.', xp: null, locked: true, coords: [42.70, 23.32] },
  slovakia:      { title: '🇸🇰 Slovakia – Future DLC', body: '🔒 Locked. Bratislava is right there and we still haven\'t been. No excuse.', xp: null, locked: true, coords: [48.15, 17.11] },
  serbia:        { title: '🇷🇸 Serbia – Future DLC', body: '🔒 Locked. Belgrade nightlife and Danube views. On the expansion roadmap.', xp: null, locked: true, coords: [44.79, 20.45] },
  iceland:       { title: '🇮🇸 Iceland – Future DLC', body: '🔒 Locked. Glaciers, geysers, and that one road that circles the entire country.', xp: null, locked: true, coords: [64.14, -21.90] },
  estonia:       { title: '🇪🇪 Estonia – Future DLC', body: '🔒 Locked. Tallinn\'s medieval old town. The most digital country in the world.', xp: null, locked: true, coords: [59.44, 24.75] },
  latvia:        { title: '🇱🇻 Latvia – Future DLC', body: '🔒 Locked. Riga\'s art nouveau and the best black balsam you\'ve never tried.', xp: null, locked: true, coords: [56.95, 24.11] },
  lithuania:     { title: '🇱🇹 Lithuania – Future DLC', body: '🔒 Locked. Vilnius, amber, and Hill of Crosses. Baltic charm.', xp: null, locked: true, coords: [54.69, 25.28] },
  luxembourg:    { title: '🇱🇺 Luxembourg', body: 'One of those places where you walk around and realise how much character a small country can pack in. Medieval fortifications, gorges, and a capital that genuinely surprised us.', xp: 'Travel XP +25', locked: false, coords: [49.61, 6.13], photos: [{ icon: '🏰', label: 'Bock Casemates' }, { icon: '🌉', label: 'Adolphe Bridge' }, { icon: '🌿', label: 'Pétrusse Valley' }, { icon: '🇱🇺', label: 'Grand Duchy' }] },
  liechtenstein:  { title: '🇱🇮 Liechtenstein – Future DLC', body: '🔒 Locked. An entire country you can jog across. Alpine vibes.', xp: null, locked: true, coords: [47.16, 9.55] },
  slovenia:      { title: '🇸🇮 Slovenia – Future DLC', body: '🔒 Locked. Lake Bled and Ljubljana. Europe\'s best-kept secret.', xp: null, locked: true, coords: [46.05, 14.51] },
  bosnia:        { title: '🇧🇦 Bosnia & Herzegovina – Future DLC', body: '🔒 Locked. Mostar Bridge and Ottoman heritage. Deep history.', xp: null, locked: true, coords: [43.86, 18.41] },
  montenegro:    { title: '🇲🇪 Montenegro – Future DLC', body: '🔒 Locked. Kotor Bay and Adriatic coast. Stunning and underrated.', xp: null, locked: true, coords: [42.44, 19.26] },
  albania:       { title: '🇦🇱 Albania – Future DLC', body: '🔒 Locked. Albanian Riviera and bunkers everywhere. Rising star.', xp: null, locked: true, coords: [41.33, 19.82] },
  macedonia:     { title: '🇲🇰 North Macedonia – Future DLC', body: '🔒 Locked. Lake Ohrid and Byzantine churches. Hidden gem.', xp: null, locked: true, coords: [41.99, 21.43] },
  moldova:       { title: '🇲🇩 Moldova – Future DLC', body: '🔒 Locked. Wine cellars and Soviet-era architecture. Niche DLC.', xp: null, locked: true, coords: [47.01, 28.86] },
  ukraine:       { title: '🇺🇦 Ukraine – Future DLC', body: '🔒 Locked. Kyiv\'s golden domes and a nation of resilience. Someday.', xp: null, locked: true, coords: [50.45, 30.52] },
  belarus:       { title: '🇧🇾 Belarus – Future DLC', body: '🔒 Locked. Minsk and the Belovezhskaya forest. Mystery DLC.', xp: null, locked: true, coords: [53.90, 27.57] },
  andorra:       { title: '🇦🇩 Andorra – Future DLC', body: '🔒 Locked. Ski slopes and tax-free shopping in the Pyrenees.', xp: null, locked: true, coords: [42.51, 1.52] },
  monaco:        { title: '🇲🇨 Monaco – Future DLC', body: '🔒 Locked. Casinos and superyachts. Aspirational DLC.', xp: null, locked: true, coords: [43.73, 7.42] },
  malta:         { title: '🇲🇹 Malta – Future DLC', body: '🔒 Locked. Tiny island, big history, and the bluest water you\'ve seen.', xp: null, locked: true, coords: [35.90, 14.51] },
  turkey:        { title: '🇹🇷 Turkey (European) – Future DLC', body: '🔒 Locked. Istanbul\'s Bosphorus — where two continents meet.', xp: null, locked: true, coords: [41.01, 28.98] },
  cyprus:        { title: '🇨🇾 Cyprus – Future DLC', body: '🔒 Locked. Mediterranean sun and ancient ruins. Beach DLC.', xp: null, locked: true, coords: [35.19, 33.38] },
};

function openMapPin(country) {
  const loc = MAP_LOCATIONS[country];
  if (!loc) return;
  openModal(loc.title, loc.body, null, loc.xp, loc.photos || null);
  if (!loc.locked && !state.countriesVisited.includes(country)) {
    state.countriesVisited.push(country);
    addScore('travel_' + country);
    setTimeout(() => awardBadge('travel_' + country), 500);
  }
}

/* ── Level 7 – Europe Leaflet Map ────────── */
let l7Map = null;

function initLevel7Map() {
  if (state.l7MapInit) return;
  state.l7MapInit = true;

  setTimeout(() => {
    const mapEl = document.getElementById('l7-map');
    if (!mapEl || !window.L) return;

    l7Map = L.map('l7-map', { scrollWheelZoom: true, zoomControl: true }).setView([50, 10], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(l7Map);

    Object.keys(MAP_LOCATIONS).forEach(key => {
      const loc = MAP_LOCATIONS[key];
      if (!loc.coords) return;

      const emoji = loc.locked ? '🔒' : '📍';
      const marker = L.marker(loc.coords, {
        icon: L.divIcon({
          className: 'leaflet-emoji-icon',
          html: `<span class="emoji-marker">${emoji}</span>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(l7Map);

      marker.on('click', () => openMapPin(key));
      marker.bindTooltip(loc.title.replace(/– Future DLC/, '').trim(), { direction: 'top', offset: [0, -10] });
    });

    setTimeout(() => { l7Map.invalidateSize(); }, 400);
  }, 300);
}

/* ── Level 8 – Side Quests ───────────────── */
const QUESTS = {
  grocery: {
    title: '🛒 Grocery Raid',
    diff: 'Difficulty: Medium',
    body: 'Every grocery run starts with a list and ends with several items that were definitely not on it. The snack aisle is a lawless zone. No one is safe.',
    skill: 'Skill Gained: Resource Management',
    reward: 'Reward: Full fridge (briefly)',
    photos: [
      { icon: '🛒', label: 'The haul' },
      { icon: '🧾', label: 'The receipt' },
    ],
  },
  cooking: {
    title: '🍳 Cooking Challenge',
    diff: 'Difficulty: Variable',
    body: 'Some days it\'s a proper meal with actual effort. Other days it\'s "we\'re having toast and calling it dinner." Both count. Progress is progress.',
    skill: 'Skill Gained: Culinary Creativity',
    reward: 'Reward: Not eating out (sometimes)',
    photos: [
      { icon: '🍽️', label: 'The masterpiece' },
      { icon: '😅', label: 'The attempt' },
    ],
  },
  pokemon: {
    title: '📱 Pokémon Go Hunt',
    diff: 'Difficulty: Very Easy (Dangerously Addictive)',
    body: 'Walking has never felt more purposeful. "Just one more stop" is always a lie. We have walked 3km in the wrong direction because of a rare spawn and we regret nothing.',
    skill: 'Skill Gained: Navigation (debatable)',
    reward: 'Reward: Steps count + bragging rights',
    photos: [
      { icon: '🗺️', label: 'The adventure' },
      { icon: '✨', label: 'The catch' },
    ],
  },
  study: {
    title: '📚 Study Mode',
    diff: 'Difficulty: High',
    body: 'The two-person study session. One person is focused. The other has opened four other tabs. Someone always needs a snack break. Somehow things still get done.',
    skill: 'Skill Gained: Focus (eventually)',
    reward: 'Reward: Stuff actually learned',
    photos: [
      { icon: '📖', label: 'Deep focus mode' },
      { icon: '☕', label: 'Fuel for the grind' },
    ],
  },
  cleaning: {
    title: '🧹 Cleaning Boss Fight',
    diff: 'Difficulty: High',
    body: 'Cleaning Boss Fight requires coordination, negotiation, and the mutual agreement that yes, the bathroom needs to happen. Battle music optional but recommended. Victory: a peaceful Sunday.',
    skill: 'Skill Gained: Teamwork +25',
    reward: 'Reward: Peaceful Sunday',
    photos: [
      { icon: '🫧', label: 'Before & after' },
      { icon: '🏆', label: 'Victory pose' },
    ],
  },
};

function openQuest(id) {
  const q = QUESTS[id];
  if (!q) return;
  openModal(q.title, q.body, `${q.skill} · ${q.reward}`, 'Side Quest Complete', q.photos);
  if (!state.bonusQuestsDone[id]) {
    state.bonusQuestsDone[id] = true;
    addScore('bonus_' + id);
  }
}

/* ══════════════════════════════════════════
   SIDE QUESTS (Levels 2, 3, 6)
   ══════════════════════════════════════════ */

const SIDE_QUESTS = {
  level2: [
    {
      id: 'doubt',
      icon: '🌀',
      title: 'The Doubt Level',
      tag: 'SIDE QUEST · LEVEL 2',
      narrative: '"Is this even real? We haven\'t met in months. What if the distance wins?"',
      choices: [
        { label: '😶 Go silent for a week', correct: false, response: '❌ The silence was louder than the distance. Cold response, cold hearts.' },
        { label: '📞 Call and be honest about it', correct: true, response: '✅ "I\'m scared too." That one sentence changed everything. Vulnerability → Connection.' },
        { label: '🙃 Pretend everything is fine', correct: false, response: '❌ Pretending is temporary. The truth always catches up.' },
      ],
      badge: '🛡️ Trust Shield +20',
      reflection: '"The strongest thing you can do in a long-distance relationship is admit when it\'s hard."',
    },
    {
      id: 'latenight',
      icon: '🌙',
      title: '11:30 PM Calls',
      tag: 'SIDE QUEST · LEVEL 2',
      narrative: '"Every night, same time. Different countries. Same feeling."',
      choices: [
        { label: '😴 "I\'m too tired, let\'s skip tonight"', correct: false, response: '❌ One skipped night turns into two, then three. The routine matters.' },
        { label: '🌙 Pick up, even if you\'re exhausted', correct: true, response: '✅ Sometimes it was 30 seconds. Sometimes it was 3 hours. The point was showing up.' },
        { label: '📱 Just text instead', correct: false, response: '❌ Texts are fine. But hearing the voice? That\'s different.' },
      ],
      badge: '📞 Night Owl Badge',
      reflection: '"The calls weren\'t always about saying something important. Sometimes just breathing on the same line was enough."',
    },
  ],
  level3: [
    {
      id: 'goa',
      icon: '🏖️',
      title: 'Goa Expansion Pack',
      tag: 'SIDE QUEST · LEVEL 3',
      narrative: '"After the question, after the Yeses, there was Goa. Sand, sunsets, water, and the kind of silence that\'s actually comfortable."',
      tropical: true,
      type: 'album',
      albumItems: [
        {
          label: '🍹 The Beach Bar',
          text: 'We found this tiny shack with plastic chairs and the best cocktails. Stayed way too long, laughed way too much.',
          photos: [
            { icon: '🍹', caption: 'Beach Bar Vibes' },
            { icon: '🌴', caption: 'Our Spot' },
          ],
        },
        {
          label: '🌅 The Sunset Walk',
          text: 'Barefoot, quiet, with the waves doing most of the talking. This is where it all clicked.',
          photos: [
            { icon: '🌅', caption: 'That Sunset' },
            { icon: '👣', caption: 'Footprints' },
          ],
        },
        {
          label: '📸 The Photo Moments',
          text: 'Some moments we captured. Some we just lived. Both kinds matter.',
          photos: [
            { icon: '📸', caption: 'Caught on Camera' },
            { icon: '🥥', caption: 'Coconut Water Break' },
          ],
        },
      ],
      badge: '🏖️ Goa Memory Unlocked',
      reflection: '"Goa wasn\'t just a trip. It was the rehearsal for the rest of it."',
    },
  ],
  level6: [
    {
      id: 'distance_mini',
      icon: '🚂',
      title: 'Mini Distance Mode',
      tag: 'SIDE QUEST · LEVEL 6',
      narrative: '"Living together doesn\'t mean the distance disappears. Sometimes it\'s Hagen to Köln. Different cities, same country, same us."',
      hasTrainAnim: true,
      choices: [
        { label: '📵 "See you when I\'m back"', correct: false, response: '❌ Even an hour apart deserves a check-in. Close distance is still distance.' },
        { label: '📍 Send your location + a photo of what you\'re eating', correct: true, response: '✅ Small updates. Little I-was-thinking-of-you pings. That\'s the move.' },
        { label: '🤷 "It\'s just a few hours, no big deal"', correct: false, response: '❌ It\'s always a big deal when someone you love is somewhere you\'re not.' },
      ],
      badge: '🚂 Close-Range Survivor',
      reflection: '"Distance is never just about kilometers. It\'s about presence."',
    },
  ],
};

function openSideQuestMenu() {
  const level = state.currentLevel;
  const quests = SIDE_QUESTS[level];
  if (!quests || quests.length === 0) return;

  const container = $('#sq-content');

  if (quests.length === 1) {
    // Go directly into the single side quest
    renderSideQuest(quests[0]);
  } else {
    // Show menu
    let html = `<div class="sq-tag">SIDE QUESTS \u00b7 ${level.toUpperCase()}</div>`;
    html += `<div class="sq-title">Choose a Side Quest</div>`;
    html += `<div class="sq-menu-list">`;
    quests.forEach((sq, i) => {
      const done = state.sideQuestsDone[sq.id] ? ' ✅' : '';
      html += `<button class="sq-menu-item" onclick="openSideQuest(${i})">
        <span>${sq.icon}</span>
        <span>${sq.title}${done}</span>
        <span style="margin-left:auto;opacity:0.4">›</span>
      </button>`;
    });
    html += `</div>`;
    container.innerHTML = html;
  }

  $('#side-quest-overlay').classList.add('visible');
}

/* ── Golden Save Point (Level 3 — Goa Expansion Pack) ── */
function openGoldenSavePoint() {
  const quests = SIDE_QUESTS['level3'];
  if (!quests || !quests.length) return;
  const container = $('#sq-content');
  renderSideQuest(quests[0]);
  $('#side-quest-overlay').classList.add('visible');
}

function openSideQuest(index) {
  const quests = SIDE_QUESTS[state.currentLevel];
  if (!quests || !quests[index]) return;
  renderSideQuest(quests[index]);
}

function renderSideQuest(sq) {
  const container = $('#sq-content');
  const popinEl = $('#side-quest-popin');

  // Add tropical class if applicable
  if (sq.tropical) {
    popinEl.classList.add('sq-tropical');
  } else {
    popinEl.classList.remove('sq-tropical');
  }

  // Show back button if current level has multiple side quests
  const currentQuests = SIDE_QUESTS[state.currentLevel];
  const hasMultiple = currentQuests && currentQuests.length > 1;

  let html = '';
  if (hasMultiple) {
    html += `<button class="sq-back-btn" onclick="openSideQuestMenu()">‹ All Side Quests</button>`;
  }
  // For level 3, display the Golden Save Point label instead of the generic side-quest tag
  let tagText = sq.tag;
  if (state.currentLevel === 'level3') {
    tagText = 'Golden Save Point · Level 3';
  }
  html += `<div class="sq-tag">${tagText}</div>`;
  html += `<div class="sq-title">${sq.icon} ${sq.title}</div>`;
  html += `<div class="sq-narrative">${sq.narrative}</div>`;

  // Album type: mini photo album with browsable items
  if (sq.type === 'album') {
    html += `<div class="sq-album-grid" id="sq-album-${sq.id}">`;
    sq.albumItems.forEach((item, i) => {
      html += `<button class="sq-album-btn" onclick="openAlbumItem('${sq.id}', ${i})">
        <span>${item.label}</span>
        <span style="margin-left:auto;opacity:0.4">›</span>
      </button>`;
    });
    html += `</div>`;
    container.innerHTML = html;
    // Mark as done on first view
    if (!state.sideQuestsDone[sq.id]) {
      state.sideQuestsDone[sq.id] = true;
      addScore('sq_' + sq.id);
      setTimeout(() => awardBadge('sq_' + sq.id), 600);
    }
    return;
  }

  // Train animation for distance mode
  if (sq.hasTrainAnim) {
    html += `<div class="train-track">
      <div class="train-track-line"></div>
      <div class="train-city-label left">Hagen</div>
      <div class="train-city-label right">Köln</div>
      <div class="train-emoji">🚂</div>
    </div>`;
  }

  html += `<div class="sq-choices" id="sq-choices-${sq.id}">`;
  sq.choices.forEach((c, i) => {
    html += `<button class="sq-choice-btn" onclick="handleSideQuestChoice('${sq.id}', ${i})">
      <span>${c.label}</span>
      <span style="margin-left:auto;opacity:0.4">›</span>
    </button>`;
  });
  html += `</div>`;

  html += `<div class="sq-outcome" id="sq-outcome-${sq.id}"></div>`;
  html += `<div id="sq-badge-area-${sq.id}"></div>`;
  html += `<div id="sq-reflection-${sq.id}"></div>`;

  container.innerHTML = html;
}

function handleSideQuestChoice(sqId, choiceIdx) {
  // Find the side quest
  let sq = null;
  for (const level of Object.keys(SIDE_QUESTS)) {
    const found = SIDE_QUESTS[level].find(s => s.id === sqId);
    if (found) { sq = found; break; }
  }
  if (!sq) return;

  const choice = sq.choices[choiceIdx];
  const outcomeEl = $(`#sq-outcome-${sqId}`);
  const badgeArea = $(`#sq-badge-area-${sqId}`);
  const reflectionArea = $(`#sq-reflection-${sqId}`);
  const choicesContainer = $(`#sq-choices-${sqId}`);

  outcomeEl.className = 'sq-outcome';
  outcomeEl.innerHTML = `<p>${choice.response}</p>`;

  if (choice.correct) {
    outcomeEl.classList.add('correct');
    if (!state.sideQuestsDone[sqId]) {
      state.sideQuestsDone[sqId] = true;
      addScore('sq_' + sqId);
    }

    // Show badge
    badgeArea.innerHTML = `<div class="sq-badge">${sq.badge}</div>`;

    // Show reflection
    reflectionArea.innerHTML = `<div class="sq-reflection">${sq.reflection}</div>`;

    // Hide choices
    if (choicesContainer) choicesContainer.style.display = 'none';

    // Achievement
    setTimeout(() => awardBadge('sq_' + sqId), 600);
  } else {
    outcomeEl.classList.add('wrong');
  }
}

function openAlbumItem(sqId, itemIdx) {
  let sq = null;
  for (const level of Object.keys(SIDE_QUESTS)) {
    const found = SIDE_QUESTS[level].find(s => s.id === sqId);
    if (found) { sq = found; break; }
  }
  if (!sq || !sq.albumItems || !sq.albumItems[itemIdx]) return;

  const item = sq.albumItems[itemIdx];
  const container = $('#sq-content');

  let html = `<button class="sq-back-btn" onclick="renderSideQuest(SIDE_QUESTS['${state.currentLevel}'].find(s=>s.id==='${sqId}'))">‹ Back to ${sq.title}</button>`;
  // Override tag for level 3 album views as well
  let albumTagText = sq.tag;
  if (state.currentLevel === 'level3') {
    albumTagText = 'Golden Save Point · Level 3';
  }
  html += `<div class="sq-tag">${albumTagText}</div>`;
  html += `<div class="sq-title">${item.label}</div>`;
  html += `<div class="sq-album-text">${item.text}</div>`;
  html += `<div class="sq-album-photos">`;
  item.photos.forEach(p => {
    html += `<div class="sq-album-photo"><span class="sq-album-photo-icon">${p.icon}</span><span class="sq-album-photo-caption">${p.caption}</span></div>`;
  });
  html += `</div>`;
  html += `<div class="sq-reflection">${sq.reflection}</div>`;

  container.innerHTML = html;
}

function closeSideQuest() {
  $('#side-quest-overlay').classList.remove('visible');
  const popinEl = $('#side-quest-popin');
  popinEl.classList.remove('sq-tropical');
}

/* ── Level 8: Future Mode ────────────────── */
function showLevel8() {
  const reveal = $('#level8-reveal');
  const gemBtn = $('#gem-btn');
  if (reveal.style.display === 'block') {
    // Toggle off — hide text and gem
    reveal.style.display = 'none';
    if (gemBtn) { gemBtn.style.display = 'none'; }
    return;
  }
  reveal.style.display = 'block';

  // Reset animations by re-triggering
  const lines = $$('.l8-line', reveal);
  lines.forEach(el => {
    el.style.animation = 'none';
    void el.offsetWidth; // force reflow
    el.style.animation = '';
  });

  // Show gem button after text has finished animating (~3.2s)
  if (gemBtn) {
    gemBtn.style.display = 'none';
    setTimeout(() => {
      gemBtn.style.display = 'flex';
    }, 3200);
  }
}

/* ── Greeting Card ───────────────────────── */
function openGreetingCard() {
  const overlay = $('#greeting-card-overlay');
  const book    = $('#gc-card');
  const closeBtn = $('#gc-close-btn');
  if (!overlay) return;
  // Reset to closed state
  if (book) book.classList.remove('open');
  if (closeBtn) closeBtn.style.display = 'none';
  overlay.classList.add('visible');
}

function toggleCard() {
  const book     = $('#gc-card');
  const closeBtn = $('#gc-close-btn');
  if (!book) return;
  const isOpen = book.classList.contains('open');
  if (!isOpen) {
    // Open: swing cover away from left hinge, burst petals
    book.classList.add('open');
    if (closeBtn) closeBtn.style.display = 'none';
    createPetals();
  } else {
    // Close: fold cover back, reveal X button after animation
    book.classList.remove('open');
    if (closeBtn) {
      setTimeout(() => { closeBtn.style.display = 'flex'; }, 750);
    }
  }
}

function createPetals() {
  const symbols = ['🌸','🌺','🌷','❤️','✨','💛','🌹','💮','🌼','🎀','💕','🌟','💫','🩷'];
  const cardEl  = $('#gc-card');
  if (!cardEl) return;

  const rect = cardEl.getBoundingClientRect();
  // Burst origin: center fold of the open book
  const ox = rect.left + rect.width  / 2;
  const oy = rect.top  + rect.height / 2;

  const count = 55 + Math.floor(Math.random() * 16); // 55–70 particles
  const particles = [];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className   = 'gc-petal';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.fontSize = (0.75 + Math.random() * 0.85) + 'rem';
    el.style.opacity  = '0';
    document.body.appendChild(el);

    // Launch angle: upward arc 25°–155°
    const angleDeg = 25 + Math.random() * 130;
    const angleRad = angleDeg * Math.PI / 180;
    const speed    = 7 + Math.random() * 14; // px per frame at 60 fps

    particles.push({
      el,
      x:        ox,
      y:        oy,
      vx:       Math.cos(angleRad) * speed,
      vy:      -Math.sin(angleRad) * speed, // negative = upward in CSS coords
      angle:    Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 9,  // deg/frame
      maxLife:  2400 + Math.random() * 1600, // 2.4–4 s in ms
      life:     0,
      delay:    Math.random() * 150,         // up to 150 ms stagger
    });
  }

  const GRAVITY = 0.30;  // px/frame² downward acceleration
  const DRAG    = 0.989; // horizontal air resistance per frame
  let lastTime  = null;

  function animate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt     = Math.min(timestamp - lastTime, 50); // cap to avoid jumps after tab switch
    lastTime     = timestamp;
    const frames = dt / 16.667; // scale to 60-fps units

    let anyAlive = false;

    for (const p of particles) {
      p.life += dt;

      if (p.life < p.delay) {
        anyAlive = true;
        continue;
      }

      const activeMs = p.life - p.delay;
      const progress = activeMs / p.maxLife;

      if (progress >= 1) {
        if (p.el.parentNode) p.el.remove();
        continue;
      }

      anyAlive = true;

      // Physics
      p.vy     += GRAVITY * frames;
      p.vx     *= Math.pow(DRAG, frames);
      p.x      += p.vx * frames;
      p.y      += p.vy * frames;
      p.angle  += p.rotSpeed * frames;

      // Opacity: fade in over first 80 ms, fade out over last 30% of life
      const fadeIn  = Math.min(activeMs / 80, 1);
      const fadeOut = progress > 0.70 ? 1 - (progress - 0.70) / 0.30 : 1;
      const scale   = 0.55 + (1 - progress) * 0.45;

      p.el.style.left      = p.x + 'px';
      p.el.style.top       = p.y + 'px';
      p.el.style.opacity   = (fadeIn * fadeOut).toFixed(3);
      p.el.style.transform = `rotate(${p.angle.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
    }

    if (anyAlive) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function closeGreetingCard() {
  const overlay  = $('#greeting-card-overlay');
  const closeBtn = $('#gc-close-btn');
  if (!overlay) return;
  overlay.classList.remove('visible');
  // Reset for next open
  setTimeout(() => {
    const book = $('#gc-card');
    if (book)     book.classList.remove('open');
    if (closeBtn) closeBtn.style.display = 'none';
  }, 350);
}

/* ── Ring Easter Egg (💍 × 3 = Developer's Note) ── */
function initRingEasterEgg() {
  document.addEventListener('click', (e) => {
    // Check if clicked element or any parent contains the ring emoji
    const target = e.target;
    if (target.textContent && target.textContent.trim() === '💍') {
      state.ringClickCount++;
      if (state.ringClickCount >= 3) {
        state.ringClickCount = 0;
        showDeveloperNote();
      }
    }
  });
}

function showDeveloperNote() {
  $('#developer-note-popup').classList.add('visible');
}

function closeDeveloperNote() {
  $('#developer-note-popup').classList.remove('visible');
}

/* ── Modal ───────────────────────────────── */
function openModal(title, body, sub, xp, photos) {
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

  // Optional photos grid
  const photosEl = $('#modal-photos');
  if (photos && photos.length > 0) {
    photosEl.innerHTML = photos.map(p => `
      <div class="modal-photo">
        <span>${p.icon || '📸'}</span>
        <span class="photo-label">${p.label || ''}</span>
      </div>
    `).join('');
    photosEl.style.display = 'grid';
  } else {
    photosEl.style.display = 'none';
  }

  overlay.classList.add('visible');
}

function closeModal() {
  $('#modal-overlay').classList.remove('visible');
}

// Close modal / overlays on overlay click
document.addEventListener('click', (e) => {
  if (e.target === $('#modal-overlay')) closeModal();
  if (e.target === $('#side-quest-overlay')) closeSideQuest();
  if (e.target === $('#developer-note-popup')) closeDeveloperNote();
  if (e.target === $('#easter-egg-popup')) closeEasterEgg();
});

// Close popups on Esc key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if ($('#modal-overlay').classList.contains('visible'))        closeModal();
    if ($('#side-quest-overlay').classList.contains('visible'))   closeSideQuest();
    if ($('#developer-note-popup').classList.contains('visible')) closeDeveloperNote();
    if ($('#easter-egg-popup').classList.contains('visible'))     closeEasterEgg();
  }
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
  void popup.offsetWidth;
  popup.classList.add('visible');

  state.achievements.push(name);

  achievementTimer = setTimeout(() => {
    popup.classList.remove('visible');
  }, 17000);
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

  particles.forEach((p) => {
    p.y -= p.speed;
    p.x += p.drift;

    particlesCtx.save();
    particlesCtx.globalAlpha = p.opacity;
    particlesCtx.fillStyle = p.color;
    particlesCtx.font = `${p.size}px serif`;
    particlesCtx.fillText(p.symbol, p.x, p.y);
    particlesCtx.restore();

    if (p.y < -20) {
      p.y = particlesCanvas.height + 20;
      p.x = Math.random() * particlesCanvas.width;
    }
  });

  requestAnimationFrame(animateParticles);
}

/* ── Level Navigation Hooks ──────────────── */
function goToLevel(id) {
  closeAchievement();
  if (id === 'level2') {
    showScreen(id);
    setTimeout(initLevel2, 300);
  } else if (id === 'level5') {
    showScreen(id);
    setTimeout(initLevel5, 500);
  } else if (id === 'level6') {
    showScreen(id);
    setTimeout(initLevel6, 300);
  } else if (id === 'bonus') {
    showScreen(id);
  } else if (id === 'level7') {
    showScreen(id);
    setTimeout(initLevel7Map, 300);
  } else {
    showScreen(id);
  }
}

/* ── Final Screen – Populate Score & Badges ─ */
function populateFinalScreen() {
  // — Total score & bar —
  const totalScoreEl = $('#final-total-score');
  const totalFillEl  = $('#final-total-fill');
  if (totalScoreEl) totalScoreEl.textContent = state.score + ' / ' + MAX_SCORE;
  if (totalFillEl) {
    const pct = MAX_SCORE > 0 ? Math.round((state.score / MAX_SCORE) * 100) : 0;
    totalFillEl.style.width = pct + '%';
  }

  // — Countries count —
  const countriesEl = $('#final-countries-count');
  if (countriesEl) countriesEl.textContent = state.countriesVisited.length;

  // — Per-category score breakdown —
  const breakdown = $('#final-score-breakdown');
  if (breakdown) {
    const CATEGORY_DISPLAY = [
      { key: 'curiosity',            label: '🔍 Curiosity' },
      { key: 'courage',              label: '⚡ Courage' },
      { key: 'chemistry',            label: '✨ Chemistry' },
      { key: 'intentionality',       label: '🎯 Intentionality' },
      { key: 'commitment',           label: '💍 Commitment' },
      { key: 'emotional_resilience', label: '🌊 Emotional Resilience' },
      { key: 'leap_of_faith',        label: '🕊️ Leap of Faith' },
      { key: 'trust',                label: '🛡️ Trust' },
      { key: 'teamwork',             label: '🤝 Teamwork' },
      { key: 'playfulness',          label: '🎮 Playfulness' },
      { key: 'adventure',            label: '🌍 Adventure' },
    ];

    // Compute possible points per category from SCORE_CONFIG
    const possibleMap = {};
    CATEGORY_DISPLAY.forEach(c => { possibleMap[c.key] = 0; });
    Object.values(SCORE_CONFIG).forEach(cfg => {
      if (cfg.category && possibleMap.hasOwnProperty(cfg.category)) {
        possibleMap[cfg.category] += cfg.points;
      }
    });

    breakdown.innerHTML = CATEGORY_DISPLAY.map(({ key, label }) => {
      const earned   = state.points[key] || 0;
      const possible = possibleMap[key] || 0;
      const pct      = possible > 0 ? Math.round((earned / possible) * 100) : 0;
      const complete = earned >= possible && possible > 0;
      return `
        <div class="score-card${complete ? ' complete' : ''}">
          <div class="score-card-label">${label}</div>
          <div class="score-card-value">${earned} / ${possible}</div>
          <div class="score-card-bar"><div class="score-card-fill" style="width:${pct}%"></div></div>
        </div>`;
    }).join('');
  }

  // — Earned badges —
  const badgeGrid  = $('#final-badges-list');
  const badgeCount = $('#final-badge-count');
  if (badgeGrid) {
    if (state.earnedBadges.length === 0) {
      badgeGrid.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;grid-column:1/-1">No badges earned yet.</p>';
    } else {
      badgeGrid.innerHTML = state.earnedBadges.map(b => `
        <div class="badge-item unlocked">
          <div class="badge-item-icon">${b.icon}</div>
          <div class="badge-item-name">${b.name}</div>
          <div class="badge-item-desc">${b.desc}</div>
        </div>`).join('');
    }
  }
  if (badgeCount) badgeCount.textContent = '(' + state.earnedBadges.length + ' earned)';
}

/* ── Final Screen Init ───────────────────── */
function initFinal() {
  showScreen('final');
  populateFinalScreen();
  setTimeout(() => {
    const fill = $('#final-progress-fill');
    if (fill) fill.style.width = '100%';
    launchConfetti();
    setTimeout(() => showAchievement('🏆', 'Story Mode: Ongoing', '3.5 years and counting.'), 1200);
  }, 400);
}

/* ── Full Reset & Restart ────────────────── */
function resetAndRestart() {
  // Reset state
  state.currentLevel = 'landing';
  state.progress = 0;
  state.relationshipHealth = 40;
  state.distanceActive = false;
  state.distanceValue = 0;
  state.coopActive = false;
  state.parentsDone = { you: false, me: false };
  state.coopDone = {};
  state.achievements = [];
  state.level1Done = false;
  state.level4Outcome = false;
  state.ringClickCount = 0;
  state.sideQuestsDone = {};
  state.l2MapInit = false;
  state.l7MapInit = false;
  // Reset scoring
  state.points = {
    curiosity: 0, courage: 0, chemistry: 0, intentionality: 0, commitment: 0,
    emotional_resilience: 0, leap_of_faith: 0, trust: 0, teamwork: 0, playfulness: 0, adventure: 0
  };
  state.score = 0;
  state.earnedBadges = [];
  state.bonusQuestsDone = {};
  state.countriesVisited = [];
  state.l5Scored = false;
  state.l4Scored = false;
  // Reset Level 1 stage tracking
  state.l1s1Done = false;
  state.l1s2Done = false;
  state.l1s3Done = false;
  state.l1s4Done = false;

  // Destroy Leaflet map instances
  if (l2Map) { l2Map.remove(); l2Map = null; }
  if (l7Map) { l7Map.remove(); l7Map = null; }

  // Reset UI elements across all levels
  // Level 1 – Stage 1
  const l1s1Wrong = $('#l1s1-wrong'); if (l1s1Wrong) l1s1Wrong.style.display = 'none';
  const l1s1Correct = $('#l1s1-correct'); if (l1s1Correct) l1s1Correct.style.display = 'none';
  const l1s1Points = $('#l1s1-points'); if (l1s1Points) l1s1Points.classList.remove('visible');
  const l1s1Continue = $('#l1s1-continue'); if (l1s1Continue) l1s1Continue.classList.add('hidden');
  const l1s1Gallery = $('#l1s1-gallery'); if (l1s1Gallery) l1s1Gallery.style.display = 'none';

  // Level 1 – Stage 2
  const igMockup = $('#ig-mockup'); if (igMockup) igMockup.classList.remove('revealed');
  const igMsg1 = $('#ig-msg1'); if (igMsg1) igMsg1.classList.remove('visible');
  const igMsg2 = $('#ig-msg2'); if (igMsg2) igMsg2.classList.remove('visible');
  const l1s2Points = $('#l1s2-points'); if (l1s2Points) l1s2Points.classList.remove('visible');
  const l1s2Continue = $('#l1s2-continue'); if (l1s2Continue) l1s2Continue.classList.add('hidden');
  const l1s2Gallery = $('#l1s2-gallery'); if (l1s2Gallery) l1s2Gallery.style.display = 'none';
  const l1s2OpenRow = $('#l1s2-open-row'); if (l1s2OpenRow) l1s2OpenRow.style.display = '';
  const l1s2OpenBtn = $('#l1s2-open-btn'); if (l1s2OpenBtn) { l1s2OpenBtn.disabled = false; l1s2OpenBtn.textContent = '📩 Open Message'; }

  // Level 1 – Stage 3
  const l1s3Wrong = $('#l1s3-wrong'); if (l1s3Wrong) l1s3Wrong.style.display = 'none';
  const l1s3Correct = $('#l1s3-correct'); if (l1s3Correct) l1s3Correct.style.display = 'none';
  const l1s3Points = $('#l1s3-points'); if (l1s3Points) l1s3Points.classList.remove('visible');
  const l1s3Continue = $('#l1s3-continue'); if (l1s3Continue) l1s3Continue.classList.add('hidden');
  const l1s3Memory = $('#l1s3-memory'); if (l1s3Memory) l1s3Memory.classList.remove('visible');

  // Level 1 – Stage 4
  const l1s4Wrong = $('#l1s4-wrong'); if (l1s4Wrong) l1s4Wrong.style.display = 'none';
  const l1s4Choices = $('#l1s4-choices'); if (l1s4Choices) l1s4Choices.style.display = '';
  const l1s4Reveal1 = $('#l1s4-reveal1'); if (l1s4Reveal1) l1s4Reveal1.classList.remove('visible');
  const l1s4Reveal2 = $('#l1s4-reveal2'); if (l1s4Reveal2) l1s4Reveal2.classList.remove('visible');
  const l1s4Points = $('#l1s4-points'); if (l1s4Points) l1s4Points.classList.remove('visible');
  const l1s4Status = $('#l1s4-status'); if (l1s4Status) l1s4Status.classList.remove('visible');
  const l1s4Memory = $('#l1s4-memory'); if (l1s4Memory) l1s4Memory.classList.remove('visible');
  const l1s4Continue = $('#l1s4-continue'); if (l1s4Continue) l1s4Continue.classList.add('hidden');

  // Level 2
  const l2Wrong = $('#l2-wrong'); if (l2Wrong) l2Wrong.style.display = 'none';
  const l2Unlock = $('#l2-unlock'); if (l2Unlock) l2Unlock.classList.remove('visible');
  const l2Continue = $('#l2-continue'); if (l2Continue) l2Continue.classList.add('hidden');
  const l2Gallery = $('#l2-gallery'); if (l2Gallery) l2Gallery.classList.remove('visible');

  // Level 3
  const l3Panic = $('#l3-panic'); if (l3Panic) l3Panic.style.display = 'none';
  const l3Think = $('#l3-think'); if (l3Think) l3Think.style.display = 'none';
  const l3Yes = $('#l3-yes'); if (l3Yes) l3Yes.classList.remove('visible');
  const l3Points = $('#l3-points'); if (l3Points) l3Points.classList.remove('visible');
  const l3Continue = $('#l3-continue'); if (l3Continue) l3Continue.classList.add('hidden');
  const l3Gallery = $('#l3-gallery'); if (l3Gallery) l3Gallery.classList.remove('visible');

  // Level 4 – parent buttons
  $$('.parent-btn').forEach(b => b.classList.remove('done'));
  const l4Success = $('#l4-success'); if (l4Success) l4Success.classList.remove('visible');
  const l4Continue = $('#l4-continue'); if (l4Continue) l4Continue.classList.add('hidden');

  // Level 6 – co-op
  $$('.coop-card').forEach(c => c.classList.remove('unlocked'));
  const l6Banner = $('#l6-banner'); if (l6Banner) l6Banner.classList.remove('visible');
  const l6Continue = $('#l6-continue'); if (l6Continue) l6Continue.classList.add('hidden');

  // Bonus (old Level 8) quests
  $$('.quest-card').forEach(c => c.classList.remove('done'));

  // Final progress bar
  const finalFill = $('#final-progress-fill'); if (finalFill) finalFill.style.width = '0%';

  // Level 8
  const l8Reveal = $('#level8-reveal'); if (l8Reveal) l8Reveal.style.display = 'none';

  // Header / status bars
  const healthFill = $('#health-fill-bar'); if (healthFill) healthFill.style.width = '40%';
  const distanceFill = $('#distance-fill-bar'); if (distanceFill) distanceFill.style.width = '0%';
  const coopFillBar = $('#coop-fill-bar'); if (coopFillBar) coopFillBar.style.width = '0%';
  const progressFill = $('#progress-fill'); if (progressFill) progressFill.style.width = '0%';
  const progressPct = $('#progress-pct'); if (progressPct) progressPct.textContent = '0%';

  // Close any open overlays
  closeModal();
  closeSideQuest();

  // Go to landing
  showScreen('landing');
}
