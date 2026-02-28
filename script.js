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
};

/* ── Level Config ────────────────────────── */
const LEVELS = {
  landing:  { progress: 0,   healthBoost: 0,  label: '' },
  level1:   { progress: 10,  healthBoost: 10, label: 'Level 1' },
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
  level2: 'level1',
  level3: 'level2',
  level4: 'level3',
  level5: 'level4',
  level6: 'level5',
  level7: 'bonus',
  bonus:  'level6',
  final:  'level7',
};

/* ── Side-Quest Levels ───────────────────── */
const SIDE_QUEST_LEVELS = ['level2', 'level3', 'level6'];

/* ── DOM Helpers ─────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

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
  } else if (['level6','bonus','level7','final'].includes(levelId)) {
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

/* ── Back Navigation ────────────────────── */
function goBack() {
  const prev = PREV_LEVEL[state.currentLevel];
  if (prev) goToLevel(prev);
}

/* ── Landing ─────────────────────────────── */
function pressStart() {
  showScreen('level1');
}

/* ── Level 1 – Meet Cute ─────────────────── */
function makeChoice1(choice) {
  const wrongBox    = $('#l1-wrong');
  const correctBox  = $('#l1-correct');
  const memory      = $('#l1-memory');
  const pointsPop   = $('#l1-points');
  const continueBtn = $('#l1-continue');
  const gallery     = $('#l1-gallery');

  wrongBox.style.display   = 'none';
  correctBox.style.display = 'none';

  if (choice === 'ignore' || choice === 'polite') {
    wrongBox.style.display = 'block';
    wrongBox.querySelector('p').textContent = '⚠️ Alternate universe unlocked: We remain strangers.';
    continueBtn.classList.add('hidden');
    memory.classList.remove('visible');
    pointsPop.classList.remove('visible');
    if (gallery) gallery.classList.remove('visible');
  } else if (choice === 'talk') {
    correctBox.style.display = 'block';
    state.relationshipHealth = Math.min(100, state.relationshipHealth + 10);
    updateHealthBar();
    pointsPop.classList.add('visible');
    memory.classList.add('visible');
    continueBtn.classList.remove('hidden');
    state.level1Done = true;
    if (gallery) gallery.classList.add('visible');
  }
}

function retryLevel1() {
  $('#l1-wrong').style.display = 'none';
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
    wrongMsg.querySelector('p').textContent = '❌ Wrong choice. Try Again.';
    continueBtn.classList.add('hidden');
    if (gallery) gallery.classList.remove('visible');
  } else if (choice === 'everyday') {
    unlockSec.classList.add('visible');
    continueBtn.classList.remove('hidden');
    state.relationshipHealth = Math.min(100, state.relationshipHealth + 15);
    updateHealthBar();
    if (gallery) gallery.classList.add('visible');
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
  const gallery     = $('#l3-gallery');

  panicMsg.style.display  = 'none';
  thinkMsg.style.display  = 'none';
  yesSection.classList.remove('visible');

  if (choice === 'panic') {
    panicMsg.style.display = 'block';
    continueBtn.classList.add('hidden');
    if (gallery) gallery.classList.remove('visible');
  } else if (choice === 'think') {
    thinkMsg.style.display = 'block';
    continueBtn.classList.add('hidden');
    if (gallery) gallery.classList.remove('visible');
  } else if (choice === 'yes') {
    yesSection.classList.add('visible');
    pointsPop.classList.add('visible');
    continueBtn.classList.remove('hidden');
    state.relationshipHealth = Math.min(100, state.relationshipHealth + 20);
    updateHealthBar();
    launchConfetti();
    if (gallery) gallery.classList.add('visible');
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
    title: '🇫🇷 France',
    body: 'Paris did its thing — in the best possible way. Croissants for breakfast, getting slightly lost on purpose, the Eiffel Tower looking exactly how it does in every photo and somehow still surprising you.',
    xp: 'Travel XP +35', locked: false,
    coords: [48.86, 2.35],
    photos: [
      { icon: '🥐', label: 'Croissant Breakfast' },
      { icon: '🗼', label: 'Eiffel Tower' },
      { icon: '🚶', label: 'Getting Lost' },
      { icon: '🎨', label: 'Louvre Visit' },
      { icon: '🌉', label: 'Seine Walk' },
      { icon: '☕', label: 'Café Culture' },
    ],
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
    title: '🇦🇹 Austria',
    body: 'Vienna had a very specific energy — like a city that\'s had centuries to figure out how to do things properly. Coffee, architecture, and at least one argument about which museum to visit first.',
    xp: 'Travel XP +30', locked: false,
    coords: [48.21, 16.37],
    photos: [
      { icon: '☕', label: 'Viennese Coffee' },
      { icon: '🏛️', label: 'Architecture' },
      { icon: '🎵', label: 'Music City' },
      { icon: '🎭', label: 'Museum Day' },
      { icon: '🍰', label: 'Sachertorte' },
    ],
  },
  czech: {
    title: '🇨🇿 Czech Republic',
    body: 'Prague at golden hour is the kind of thing that makes you stop mid-sentence. Cobblestones, bridges, and an old town that makes you feel like you\'ve stepped into a fairytale.',
    xp: 'Travel XP +28', locked: false,
    coords: [50.08, 14.42],
    photos: [
      { icon: '🌉', label: 'Charles Bridge' },
      { icon: '🏰', label: 'Prague Castle' },
      { icon: '🌅', label: 'Golden Hour' },
      { icon: '🍺', label: 'Czech Beer' },
      { icon: '🏘️', label: 'Old Town Square' },
    ],
  },
  // ─── Locked / Future DLC Countries ───
  uk:            { title: '🇬🇧 United Kingdom – Future DLC', body: '🔒 Locked. Fish and chips, double-decker buses, and a country that drives on the wrong side of the road. Coming soon.', xp: null, locked: true, coords: [51.51, -0.13] },
  ireland:       { title: '🇮🇪 Ireland – Future DLC', body: '🔒 Locked. Green hills, cozy pubs, and the accent you never get tired of hearing. Coming soon™.', xp: null, locked: true, coords: [53.35, -6.26] },
  spain:         { title: '🇪🇸 Spain – Future DLC', body: '🔒 Locked. Sun, tapas, and a Mediterranean coast that\'s been on the list for a while.', xp: null, locked: true, coords: [40.42, -3.70] },
  portugal:      { title: '🇵🇹 Portugal – Future DLC', body: '🔒 Locked. Pastéis de nata, tram rides through Lisbon, and sunsets over the Atlantic. On the roadmap.', xp: null, locked: true, coords: [38.72, -9.14] },
  italy:         { title: '🇮🇹 Italy – Future DLC', body: '🔒 Locked. This chapter hasn\'t been written yet — but the pasta is already booked in our imagination.', xp: null, locked: true, coords: [41.90, 12.50] },
  greece:        { title: '🇬🇷 Greece – Future DLC', body: '🔒 Locked. White walls, blue doors, and the Aegean Sea. Coming soon™.', xp: null, locked: true, coords: [37.97, 23.73] },
  norway:        { title: '🇳🇴 Norway – Future DLC', body: '🔒 Locked. Fjords, northern lights, and really expensive coffee. Pending expansion pack.', xp: null, locked: true, coords: [59.91, 10.75] },
  sweden:        { title: '🇸🇪 Sweden – Future DLC', body: '🔒 Locked. IKEA homeland, meatballs, and cities that look like they belong in a Scandinavian drama.', xp: null, locked: true, coords: [59.33, 18.07] },
  finland:       { title: '🇫🇮 Finland – Future DLC', body: '🔒 Locked. Saunas, silence, and the world\'s happiest country. Maybe that\'s what we need.', xp: null, locked: true, coords: [60.17, 24.94] },
  denmark:       { title: '🇩🇰 Denmark – Future DLC', body: '🔒 Locked. Hygge, bikes, and Copenhagen\'s colorful harbor. On the wishlist.', xp: null, locked: true, coords: [55.68, 12.57] },
  poland:        { title: '🇵🇱 Poland – Future DLC', body: '🔒 Locked. Pierogi, old towns, and a country with more history per square meter than most.', xp: null, locked: true, coords: [52.23, 21.01] },
  switzerland:   { title: '🇨🇭 Switzerland – Future DLC', body: '🔒 Locked. Mountains, chocolate, and the kind of precision that makes German trains look casual.', xp: null, locked: true, coords: [46.95, 7.45] },
  hungary:       { title: '🇭🇺 Hungary – Future DLC', body: '🔒 Locked. Budapest\'s thermal baths and ruin bars. Sounds like a plan.', xp: null, locked: true, coords: [47.50, 19.04] },
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
  luxembourg:    { title: '🇱🇺 Luxembourg – Future DLC', body: '🔒 Locked. A whole country smaller than most cities. But what a country.', xp: null, locked: true, coords: [49.61, 6.13] },
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
  if (!loc.locked) {
    setTimeout(() => showAchievement('✈️', 'Travel XP Gained', loc.title.replace(/^[^\w]+ /, '')), 500);
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
      narrative: '"Before the proposal, there was Goa. Sand, sunsets, and the kind of silence that\'s actually comfortable."',
      tropical: true,
      choices: [
        { label: '🍹 Stay at the beach bar all day', correct: false, response: '❌ Fun, but you missed the sunset walk. That\'s where the memory was.' },
        { label: '🌅 Take the sunset walk', correct: true, response: '✅ Barefoot, quiet, with the waves doing most of the talking. This is where it clicked.' },
        { label: '📸 Take photos the whole time', correct: false, response: '❌ 200 photos and not one real moment. Put the phone down.' },
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
    let html = `<div class="sq-tag">SIDE QUESTS · ${level.toUpperCase()}</div>`;
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

  let html = `<div class="sq-tag">${sq.tag}</div>`;
  html += `<div class="sq-title">${sq.icon} ${sq.title}</div>`;
  html += `<div class="sq-narrative">${sq.narrative}</div>`;

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
    state.sideQuestsDone[sqId] = true;

    // Show badge
    badgeArea.innerHTML = `<div class="sq-badge">${sq.badge}</div>`;

    // Show reflection
    reflectionArea.innerHTML = `<div class="sq-reflection">${sq.reflection}</div>`;

    // Hide choices
    if (choicesContainer) choicesContainer.style.display = 'none';

    // Achievement
    setTimeout(() => showAchievement('🗝️', 'Side Quest Complete', sq.title), 600);
  } else {
    outcomeEl.classList.add('wrong');
  }
}

function closeSideQuest() {
  $('#side-quest-overlay').classList.remove('visible');
  const popinEl = $('#side-quest-popin');
  popinEl.classList.remove('sq-tropical');
}

/* ── Level 9: Future Mode ────────────────── */
function showLevel9() {
  const reveal = $('#level9-reveal');
  if (reveal.style.display === 'block') {
    // Toggle off
    reveal.style.display = 'none';
    return;
  }
  reveal.style.display = 'block';

  // Reset animations by re-triggering
  const lines = $$('.l9-line', reveal);
  lines.forEach(el => {
    el.style.animation = 'none';
    void el.offsetWidth; // force reflow
    el.style.animation = '';
  });
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

  // Destroy Leaflet map instances
  if (l2Map) { l2Map.remove(); l2Map = null; }
  if (l7Map) { l7Map.remove(); l7Map = null; }

  // Reset UI elements across all levels
  // Level 1
  const l1Wrong = $('#l1-wrong'); if (l1Wrong) l1Wrong.style.display = 'none';
  const l1Correct = $('#l1-correct'); if (l1Correct) l1Correct.style.display = 'none';
  const l1Memory = $('#l1-memory'); if (l1Memory) l1Memory.classList.remove('visible');
  const l1Points = $('#l1-points'); if (l1Points) l1Points.classList.remove('visible');
  const l1Continue = $('#l1-continue'); if (l1Continue) l1Continue.classList.add('hidden');
  const l1Gallery = $('#l1-gallery'); if (l1Gallery) l1Gallery.classList.remove('visible');

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

  // Level 9
  const l9Reveal = $('#level9-reveal'); if (l9Reveal) l9Reveal.style.display = 'none';

  // Header / status bars
  const healthFill = $('#health-fill-bar'); if (healthFill) healthFill.style.width = '40%';
  const distanceFill = $('#distance-fill-bar'); if (distanceFill) distanceFill.style.width = '0%';
  const progressFill = $('#progress-fill'); if (progressFill) progressFill.style.width = '0%';
  const progressPct = $('#progress-pct'); if (progressPct) progressPct.textContent = '0%';

  // Close any open overlays
  closeModal();
  closeSideQuest();

  // Go to landing
  showScreen('landing');
}
