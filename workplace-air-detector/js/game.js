// ============ 存档 ============
const SAVE_KEY = 'workplace_game_save';
const AUDIO_KEY = 'workplace_game_audio';
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch(e) { return false; } }
function saveGame() {
  try {
    const data = { career, stats, currentLevel, playDeadUsed, newsHeat, newsCount, audioEnabled, timestamp: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch(e) {}
}
function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch(e) { return null; }
}
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch(e) {} }

// ============ 二周目 ============
const COMPLETION_KEY = 'workplace_game_completion';
const CARD_POOL_KEY = 'workplace_game_cardpool';
let completionCount = 0;
let isNewGamePlus = false;
function loadCompletion() {
  try {
    const c = localStorage.getItem(COMPLETION_KEY);
    completionCount = c ? parseInt(c, 10) : 0;
  } catch(e) { completionCount = 0; }
}
function recordCompletion() {
  try {
    completionCount += 1;
    localStorage.setItem(COMPLETION_KEY, String(completionCount));
  } catch(e) {}
}
function hasCompleted() { return completionCount > 0; }

function initAudioFromStorage() {
  try {
    const stored = localStorage.getItem(AUDIO_KEY);
    if (stored !== null) audioEnabled = stored === '1';
  } catch(e) {}
}

// ============ 音频 ============
let audioEnabled = true, audioCtx = null;
function getAudioCtx() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function toggleAudio() { audioEnabled = !audioEnabled; document.getElementById('audio-toggle').textContent = audioEnabled ? '🔊 音效' : '🔇 音效'; try { localStorage.setItem(AUDIO_KEY, audioEnabled ? '1' : '0'); } catch(e) {} }
function playSound(type) {
  if (!audioEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    switch(type) {
      case 'click': osc.frequency.value = 800; gain.gain.setValueAtTime(0.08, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08); osc.start(); osc.stop(ctx.currentTime + 0.08); break;
      case 'good': osc.frequency.value = 523; gain.gain.setValueAtTime(0.12, ctx.currentTime); osc.start(); osc.stop(ctx.currentTime + 0.12); setTimeout(()=>{const o2=ctx.createOscillator(),g2=ctx.createGain();o2.connect(g2);g2.connect(ctx.destination);o2.frequency.value=659;g2.gain.setValueAtTime(0.12,ctx.currentTime);o2.start();o2.stop(ctx.currentTime+0.15);},120); break;
      case 'bad': osc.frequency.value = 300; gain.gain.setValueAtTime(0.15, ctx.currentTime); osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.25); osc.start(); osc.stop(ctx.currentTime + 0.25); break;
      case 'heartbeat': osc.frequency.value = 55; gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12); osc.start(); osc.stop(ctx.currentTime + 0.12); break;
      case 'decode': osc.type = 'sine'; osc.frequency.value = 880; gain.gain.setValueAtTime(0.08, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15); osc.start(); osc.stop(ctx.currentTime + 0.15); break;
      case 'hit': osc.type = 'square'; osc.frequency.value = 180; gain.gain.setValueAtTime(0.16, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.11); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14); osc.start(); osc.stop(ctx.currentTime + 0.14); break;
      case 'break': osc.type = 'triangle'; osc.frequency.value = 440; gain.gain.setValueAtTime(0.14, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(980, ctx.currentTime + 0.16); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22); osc.start(); osc.stop(ctx.currentTime + 0.22); break;
      case 'counter': osc.type = 'sawtooth'; osc.frequency.value = 160; gain.gain.setValueAtTime(0.13, ctx.currentTime); osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.18); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2); osc.start(); osc.stop(ctx.currentTime + 0.2); break;
    }
  } catch(e) {}
}

// ============ 职业 ============
let career = null;
const careers = {
  dev: { name: '后端开发', avatar: '💻', desc: '代码工匠', color: 'linear-gradient(135deg,#1e3a5f,#0d2137)', stats: { performance: 60, blame: 0, mood: 80, network: 45 }, skill: { name: '书面留痕', id: 'papertrail' } },
  pm: { name: '产品经理', avatar: '📋', desc: '背锅演员', color: 'linear-gradient(135deg,#5f3a1e,#37210d)', stats: { performance: 45, blame: 5, mood: 75, network: 65 }, skill: { name: 'Deadline预感', id: 'deadline' } },
  design: { name: 'UI设计师', avatar: '🎨', desc: '五彩斑斓黑', color: 'linear-gradient(135deg,#5f1e5f,#370d37)', stats: { performance: 50, blame: 0, mood: 90, network: 50 }, skill: { name: '装死大师', id: 'playdead' } },
  ops: { name: '运维工程师', avatar: '🔧', desc: '背锅率最高', color: 'linear-gradient(135deg,#3a5f1e,#21370d)', stats: { performance: 50, blame: 0, mood: 70, network: 50 }, skill: { name: '太极推手', id: 'taichi' } },
  civil: { name: '体制内', avatar: '🏛️', desc: '流程护体', color: 'linear-gradient(135deg,#3d4f5f,#17212b)', stats: { performance: 48, blame: 0, mood: 78, network: 72 }, skill: { name: '程序正义', id: 'procedure' } },
  university: { name: '高校青椒', avatar: '🎓', desc: '课题续命', color: 'linear-gradient(135deg,#40513b,#182116)', stats: { performance: 46, blame: 5, mood: 72, network: 58 }, skill: { name: '文献检索', id: 'literature' } },
  stateOwned: { name: '国企职员', avatar: '🏢', desc: '会签生存', color: 'linear-gradient(135deg,#4e475f,#1f1a2c)', stats: { performance: 52, blame: 0, mood: 76, network: 70 }, skill: { name: '会签护身', id: 'countersign' } },
  privateBiz: { name: '私企骨干', avatar: '📈', desc: 'KPI雷达', color: 'linear-gradient(135deg,#5f4a2f,#271b10)', stats: { performance: 58, blame: 8, mood: 62, network: 50 }, skill: { name: 'KPI嗅觉', id: 'kpi' } },
  selfEmployed: { name: '个体户', avatar: '🧾', desc: '现金流优先', color: 'linear-gradient(135deg,#1f5a4c,#0b2a23)', stats: { performance: 42, blame: 0, mood: 86, network: 55 }, skill: { name: '现金流雷达', id: 'cashflow' } }
};
function renderCareerChoices() {
  const grid = document.querySelector('.career-grid');
  if (!grid || grid.dataset.rendered === '1') return;
  grid.innerHTML = Object.entries(careers).map(([id, c]) => `
    <div class="career-card" onclick="selectCareer('${id}')" data-career="${id}">
      <div class="career-avatar" style="background:${c.color}">${escapeHtml(c.avatar)}</div>
      <div class="career-name">${escapeHtml(c.name)}</div>
      <div class="career-desc">${escapeHtml(c.desc)}</div>
      <div class="career-skill">${escapeHtml(c.skill.name)}</div>
    </div>
  `).join('');
  grid.dataset.rendered = '1';
}
function selectCareer(c) {
  renderCareerChoices();
  career = c;
  document.querySelectorAll('.career-card').forEach(card => card.classList.remove('selected'));
  document.querySelector(`.career-card[data-career="${c}"]`).classList.add('selected');
  document.getElementById('career-confirm').disabled = false;
  playSound('click');
}

// ============ 故事线 ============
let storyTimer = null;
function startStory() {
  playSound('click');
  isNewGamePlus = false;
  // 已通关过直接跳过故事+教程
  if (hasCompleted()) {
    showCareer();
    return;
  }
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('story-screen').classList.remove('hidden');

  const scenes = [
    { text: '凌晨六点半，闹钟响了第三遍。', mood: '😴' },
    { text: '你挤上地铁，被夹在两个穿正装的人中间。', mood: '😑' },
    { text: '手机响了——是HR：<span class="highlight">"欢迎入职，今天报到。"</span>', mood: '😰' },
    { text: '你站在公司楼下，抬头看——玻璃幕墙反射着刺眼的阳光。', mood: '😎' },
    { text: '<span class="highlight">这是你职场生涯的第一天。</span>', mood: '🤔' },
    { text: '你很快会发现，这里最可怕的不是KPI。', mood: '😨' },
    { text: '是那些<span class="highlight">笑着递过来的锅</span>。', mood: '😰' },
    { text: '以及那些<span class="highlight">没说出口的潜台词</span>。', mood: '🧐' },
    { text: '准备好了吗？', mood: '💪' }
  ];

  let idx = 0;
  const textEl = document.getElementById('story-text');
  const playerEl = document.getElementById('story-player');

  function showScene() {
    if (idx >= scenes.length) {
      setTimeout(() => startTutorial(), 800);
      return;
    }
    const s = scenes[idx];
    textEl.innerHTML = s.text;
    playerEl.textContent = s.mood;
    idx++;
    storyTimer = setTimeout(showScene, 1800);
  }
  showScene();
}

function startNewGamePlus() {
  playSound('click');
  isNewGamePlus = true;
  showCareer();
}
function skipStory() {
  if (storyTimer) clearTimeout(storyTimer);
  startTutorial();
}

// ============ 试玩教程 ============
function startTutorial() {
  document.getElementById('story-screen').classList.add('hidden');
  document.getElementById('tutorial-screen').classList.remove('hidden');

  const chat = document.getElementById('tutorial-chat');
  chat.innerHTML = '';

  const steps = [
    { type: 'system', text: '试玩教程' },
    { type: 'other', char: 'wangpm', text: '这个需求<em>很简单</em>吧，明天能上线吗？' },
    { type: 'mind', text: '💡 这是教程。先看完上下文，再像找证言矛盾一样选回应。' },
    { type: 'system', text: '🔎 推理阶段开始（可以慢慢看）' }
  ];

  let i = 0;
  function addStep() {
    if (i >= steps.length) {
      showTutorialOptions();
      return;
    }
    const s = steps[i++];
    if (s.type === 'system') {
      const div = document.createElement('div'); div.className = 'wx-system-msg'; div.innerHTML = `<span>${s.text}</span>`; chat.appendChild(div);
    } else if (s.type === 'other') {
      const row = document.createElement('div'); row.className = 'wx-msg-row';
      row.innerHTML = `${renderAvatar('wangpm')}<div class="wx-bubble other">${s.text}</div>`;
      chat.appendChild(row);
    } else if (s.type === 'mind') {
      const div = document.createElement('div'); div.className = 'mind-bubble'; div.textContent = s.text.replace('💡 ', ''); chat.appendChild(div);
    }
    chat.scrollTop = chat.scrollHeight;
    setTimeout(addStep, 600);
  }
  addStep();
}

function showTutorialOptions() {
  const footer = document.getElementById('tutorial-footer');
  footer.innerHTML = `
    <div id="wx-timer-area" style="padding:6px 0 8px">
      <span style="font-size:11px;color:#999">🔎 推理阶段</span>
      <div style="flex:1;height:5px;background:#e5e5e5;border-radius:3px;overflow:hidden;margin:0 8px"><div style="height:100%;background:#07c160;border-radius:3px;width:100%"></div></div>
      <span style="font-size:15px;font-weight:700;font-family:monospace;color:#07c160">∞</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:5px">
      <button class="wx-option" onclick="tutorialPick('bad')">好的，明天给你。</button>
      <button class="wx-option" onclick="tutorialPick('good')">我先评估，下午给排期。</button>
      <button class="wx-option" onclick="tutorialPick('decode')" style="background:#fffbe6;border-color:#d48806;color:#d48806">🔮 潜台词解码（教程免费）</button>
    </div>
  `;
}

function tutorialPick(type) {
  const chat = document.getElementById('tutorial-chat');
  const footer = document.getElementById('tutorial-footer');

  if (type === 'decode') {
    playSound('decode');
    const div = document.createElement('div'); div.className = 'wx-decode-bubble';
    div.innerHTML = `<em>「很简单」=他根本不懂技术，这是"先承诺再逼开发"套路</em> · 把球踢回排期流程`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    // 替换按钮为继续
    footer.innerHTML = `<button class="wx-option" onclick="tutorialPick('good')" style="background:#07c160;color:#fff;border-color:#07c160;font-weight:700">明白了，选正确选项 →</button>`;
    return;
  }

  playSound(type === 'good' ? 'good' : 'bad');

  // 你的回复
  const selfRow = document.createElement('div'); selfRow.className = 'wx-msg-row self';
  const reply = type === 'good' ? '我先评估，下午给排期。' : '好的，明天给你。';
  selfRow.innerHTML = `<div class="wx-bubble self">${reply}</div>${renderAvatar('player')}`;
  chat.appendChild(selfRow);

  // 结果
  const resultDiv = document.createElement('div');
  resultDiv.className = 'result-bubble';
  resultDiv.textContent = type === 'good' ? '守住边界，专业且不失礼貌。' : '接下了不可能的任务。';
  chat.appendChild(resultDiv);

  // 教程说明
  const tipDiv = document.createElement('div'); tipDiv.className = 'mind-bubble';
  tipDiv.textContent = type === 'good' ? '学会了，继续 →' : '正式游戏里不要直接答应';
  chat.appendChild(tipDiv);
  chat.scrollTop = chat.scrollHeight;

  footer.innerHTML = `<button class="wx-option" onclick="showCareer()" style="background:#e94560;color:#fff;border-color:#e94560;font-weight:700;font-size:14px;padding:14px">选择职业 →</button>`;
}

function showCareer() {
  playSound('click');
  renderCareerChoices();
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('story-screen').classList.add('hidden');
  document.getElementById('tutorial-screen').classList.add('hidden');
  document.getElementById('career-screen').classList.remove('hidden');
}

// ============ 游戏状态 ============
let stats = {}, skills = {}, currentLevel = 0;
let timer = null;
let answered = false, playDeadUsed = false;
let currentBossRound = 0, bossScore = 0;
let usedTools = {};
let lastToolUsed = null; // 上一回合使用的工具（连携系统）
let duelState = { stance: 12, maxStance: 12, focus: 0, maxFocus: 6, combo: 0 };
let currentOptions = [];
let newsHeat = 0, newsCount = 0;
let bossTimer = null, bossTimeLeft = 15, bossTimerActive = false;

// ============ 新系统状态 ============
let npcFavor = {}; // NPC羁绊: { wangpm: 50, lilead: 50, ... }
let activeRelics = []; // 当前携带的遗物
let pendingRelics = []; // 通关后可选的遗物
let selectedRelic = null;
let predictCooldown = false; // 预判冷却

// ============ 多轮对话+出装系统 ============
let currentRound = 0; // 当前关卡内轮次（0-based）
let levelRoundEffects = null; // 本关累积效果 {performance, blame, mood, network}
let currentLoadout = null; // 当前NPC出装配置

function initGame() {
  const c = careers[career];
  stats = { ...c.stats };
  skills = { [c.skill.id]: c.skill };
  playDeadUsed = false;
  currentBossRound = 0;
  bossScore = 0;
  newsHeat = 0;
  newsCount = 0;
  predictCooldown = false;
  currentRound = 0;
  levelRoundEffects = { performance: 0, blame: 0, mood: 0, network: 0 };
  // NPC羁绊初始化为中立
  npcFavor = {};
  Object.keys(characters).forEach(k => { if (k !== 'player') npcFavor[k] = 50; });
  // 应用遗物效果
  activeRelics.forEach(r => { if (r.onStart) r.onStart(); });
}

// ============ 遗物数据 ============
const relicPool = [
  { id: 'screenshot', icon: '📸', name: '截图习惯', rarity: '稀有', desc: '证据袋伤害 +2，每次使用额外削减对方气势。', effect: 'evidenceBonus', value: 2 },
  { id: 'deadline_sense', icon: '⏰', name: 'Deadline圣体', rarity: '稀有', desc: '推理阶段时间 +3秒（所有选择更从容）。', effect: 'reasoningTime', value: 3 },
  { id: 'coffee', icon: '☕', name: '续命咖啡', rarity: '普通', desc: '初始心情 +15，开局心态更稳。', effect: 'startMood', value: 15 },
  { id: 'notebook', icon: '📓', name: '会议纪要本', rarity: '普通', desc: '绩效选项额外 +5分，数据说话更有力。', effect: 'perfBonus', value: 5 },
  { id: 'social', icon: '🤝', name: '人缘护身符', rarity: '稀有', desc: '人脉选项额外 +5分，负面人脉影响减半。', effect: 'netBonus', value: 5 },
  { id: 'shield', icon: '🛡️', name: '不粘锅', rarity: '史诗', desc: '背锅选项伤害 -30%，装死大师每关可用两次。', effect: 'blameReduction', value: 0.7 },
  { id: 'calculator', icon: '🧮', name: '毛利计算器', rarity: '普通', desc: '初始绩效 +10，开局更有底气。', effect: 'startPerf', value: 10 },
  { id: 'lucky', icon: '🍀', name: '锦鲤工位', rarity: '史诗', desc: '预判成功率 +20%，每次预判额外 +1心情。', effect: 'predictLuck', value: 0.2 }
];

function getRelicEffect(effectId) {
  return activeRelics.filter(r => r.effect === effectId).reduce((sum, r) => sum + (r.value || 0), 0);
}
function hasRelicEffect(effectId) {
  return activeRelics.some(r => r.effect === effectId);
}

// ============ NPC羁绊 ============
function updateNpcFavor(speakerKey, optionType) {
  if (!npcFavor[speakerKey]) return;
  const delta = optionType === 'good' ? 5 : optionType === 'bad' ? -8 : -2;
  const old = npcFavor[speakerKey];
  npcFavor[speakerKey] = clamp(old + delta, 0, 100);
  return npcFavor[speakerKey] - old;
}
function getNpcFavorLabel(val) {
  if (val >= 80) return '盟友';
  if (val >= 60) return '友好';
  if (val >= 40) return '中立';
  if (val >= 20) return '冷淡';
  return '敌对';
}
function getNpcFavorTitle(val) {
  if (val >= 80) return '盟友 · 关键时刻会帮你说话';
  if (val >= 60) return '友好 · 愿意配合你的工作';
  if (val >= 40) return '中立 · 公事公办';
  if (val >= 20) return '冷淡 · 偶尔会给你使绊子';
  return '敌对 ·  actively 在找你麻烦';
}

// ============ 连携系统 ============
const comboRules = {
  'stall->evidence': { name: '🔥 铁证如山', bonusDamage: 2, desc: '追问后接证据，伤害翻倍' },
  'evidence->meme': { name: '🌀 逻辑闭环', bonusMood: 2, desc: '证据后整理，心情回升' },
  'meme->stall': { name: '🎭 套话陷阱', bonusStance: 3, desc: '整理后追问，对方气势暴跌' }
};
function checkCombo(currentTool) {
  if (!lastToolUsed) return null;
  const key = `${lastToolUsed}->${currentTool}`;
  return comboRules[key] || null;
}
function showComboEffect(combo) {
  if (!combo) return;
  const chat = document.getElementById('wx-chat');
  const div = document.createElement('div');
  div.className = 'wx-system-msg';
  div.innerHTML = `<span style="background:#e6f7ff;color:#1890ff;border:1px solid #91d5ff;padding:4px 10px;border-radius:8px;font-size:11px">${combo.name} · ${combo.desc}</span>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// ============ 预判系统 ============
function getPredictSuccessRate() {
  let base = 0.5 + stats.mood / 200;
  base += getRelicEffect('predictLuck');
  return Math.min(0.95, base);
}
function predictIntent() {
  if (predictCooldown) return;
  predictCooldown = true;
  const rate = getPredictSuccessRate();
  const success = Math.random() < rate;
  const chat = document.getElementById('wx-chat');
  if (success) {
    let bonus = 1;
    if (hasRelicEffect('predictLuck')) bonus += 1;
    duelState.focus = clamp(duelState.focus + bonus, 0, duelState.maxFocus);
    updateDuelDisplay();
    playSound('good');
    const div = document.createElement('div');
    div.className = 'predict-result-good';
    div.textContent = `👀 预判成功！专注 +${bonus}`;
    chat.appendChild(div);
    if (hasRelicEffect('predictLuck')) {
      stats.mood = clamp(stats.mood + 1, 0, 100);
      updateStats();
    }
  } else {
    stats.mood = clamp(stats.mood - 2, 0, 100);
    updateStats();
    playSound('bad');
    const div = document.createElement('div');
    div.className = 'predict-result-bad';
    div.textContent = '👀 预判失误…心情 -2';
    chat.appendChild(div);
  }
  chat.scrollTop = chat.scrollHeight;
}

// ============ 属性检定 ============
function meetsRequirement(req) {
  if (!req) return true;
  for (const [key, val] of Object.entries(req)) {
    const statKey = key === 'network' ? 'network' : key;
    if ((stats[statKey] || 0) < val) return false;
  }
  return true;
}
function getLockHint(req) {
  if (!req) return '';
  const parts = [];
  if (req.performance) parts.push(`绩效≥${req.performance}`);
  if (req.mood) parts.push(`心情≥${req.mood}`);
  if (req.network) parts.push(`人脉≥${req.network}`);
  if (req.blame !== undefined) parts.push(`背锅≤${req.blame}`);
  return parts.join(' · ');
}

// ============ 遗物选择 ============
function pickRandomRelics(count) {
  const shuffled = [...relicPool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
function showRelicSelect() {
  document.getElementById('end-screen').classList.add('hidden');
  document.getElementById('relic-screen').classList.remove('hidden');
  pendingRelics = pickRandomRelics(3);
  selectedRelic = null;
  const grid = document.getElementById('relic-grid');
  grid.innerHTML = pendingRelics.map((r, i) => `
    <div class="relic-card" onclick="selectRelic(${i})" data-relic="${i}">
      <div class="relic-icon">${r.icon}</div>
      <div class="relic-name">${r.name}</div>
      <div class="relic-desc">${r.desc}</div>
      <div class="relic-rarity">${r.rarity}</div>
    </div>
  `).join('');
  document.getElementById('relic-confirm').disabled = true;
}
function selectRelic(idx) {
  selectedRelic = pendingRelics[idx];
  document.querySelectorAll('.relic-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`.relic-card[data-relic="${idx}"]`).classList.add('selected');
  document.getElementById('relic-confirm').disabled = false;
  playSound('click');
}
function confirmRelic() {
  if (!selectedRelic) return;
  activeRelics = [selectedRelic];
  playSound('good');
  clearSave();
  location.reload();
}

// ============ 角色立绘 ============
const characters = {
  wangpm: { name: '王产品', role: '产品经理', badge: '产', skin: '#f0bd92', hair: '#3c2418', shirt: '#ff9800', border: '#ff9800', grad: 'linear-gradient(135deg,#fff7e6,#ffd591)' },
  lilead: { name: '李组长', role: '技术组长', badge: '组', skin: '#e7b78f', hair: '#262124', shirt: '#e91e63', border: '#e91e63', grad: 'linear-gradient(135deg,#fff0f6,#ffadd2)' },
  zhaocto: { name: '赵CTO', role: 'CTO', badge: 'C', skin: '#d9a982', hair: '#161616', shirt: '#7b61ff', border: '#7b61ff', grad: 'linear-gradient(135deg,#f0f5ff,#adc6ff)' },
  liuops: { name: '刘运维', role: '运维', badge: '运', skin: '#e4b08a', hair: '#2f2a24', shirt: '#1677ff', border: '#1677ff', grad: 'linear-gradient(135deg,#e6f4ff,#91caff)' },
  chenhr: { name: '陈HR', role: 'HRBP', badge: 'H', skin: '#efc19a', hair: '#4b2f24', shirt: '#22a06b', border: '#22a06b', grad: 'linear-gradient(135deg,#f6ffed,#b7eb8f)' },
  director: { name: '周主任', role: '科室负责人', badge: '主', skin: '#e8b88e', hair: '#2d2620', shirt: '#607d8b', border: '#607d8b', grad: 'linear-gradient(135deg,#f5f5f5,#b0bec5)' },
  dean: { name: '林院长', role: '学院领导', badge: '院', skin: '#e6b98d', hair: '#2b2522', shirt: '#6d4c41', border: '#6d4c41', grad: 'linear-gradient(135deg,#efebe9,#bcaaa4)' },
  manager: { name: '马经理', role: '部门经理', badge: '经', skin: '#eab68b', hair: '#27211d', shirt: '#455a64', border: '#455a64', grad: 'linear-gradient(135deg,#eceff1,#b0bec5)' },
  client: { name: '甲方', role: '外部客户', badge: '甲', skin: '#efc09a', hair: '#3a2a22', shirt: '#8d6e63', border: '#8d6e63', grad: 'linear-gradient(135deg,#fff3e0,#d7ccc8)' },
  visitor: { name: '来访人', role: '办事群众', badge: '访', skin: '#efc09a', hair: '#3a2a22', shirt: '#8d6e63', border: '#8d6e63', grad: 'linear-gradient(135deg,#fff8e1,#ffe082)' },
  officePeer: { name: '综合科同事', role: '兄弟科室', badge: '协', skin: '#eab68b', hair: '#27211d', shirt: '#546e7a', border: '#546e7a', grad: 'linear-gradient(135deg,#eceff1,#b0bec5)' },
  stateLead: { name: '沈部长', role: '部门负责人', badge: '部', skin: '#e8b88e', hair: '#2d2620', shirt: '#5c6bc0', border: '#5c6bc0', grad: 'linear-gradient(135deg,#eef2ff,#c5cae9)' },
  finance: { name: '钱会计', role: '财务', badge: '财', skin: '#f0bd91', hair: '#33251f', shirt: '#009688', border: '#009688', grad: 'linear-gradient(135deg,#e0f2f1,#80cbc4)' },
  teacher: { name: '老教授', role: '课题负责人', badge: '师', skin: '#e0ac82', hair: '#4e4037', shirt: '#5d4037', border: '#5d4037', grad: 'linear-gradient(135deg,#f3e5f5,#ce93d8)' },
  boss: { name: '陈老板', role: '老板', badge: '板', skin: '#e7b081', hair: '#201814', shirt: '#c62828', border: '#c62828', grad: 'linear-gradient(135deg,#ffebee,#ef9a9a)' },
  supplier: { name: '供应商', role: '合作方', badge: '供', skin: '#edbd91', hair: '#30231d', shirt: '#795548', border: '#795548', grad: 'linear-gradient(135deg,#efebe9,#a1887f)' },
  landlord: { name: '房东', role: '店铺房东', badge: '房', skin: '#efbd90', hair: '#3a2b22', shirt: '#9c27b0', border: '#9c27b0', grad: 'linear-gradient(135deg,#f3e5f5,#ce93d8)' },
  regularCustomer: { name: '老客户', role: '长期买家', badge: '客', skin: '#efc09a', hair: '#3a2a22', shirt: '#8d6e63', border: '#8d6e63', grad: 'linear-gradient(135deg,#fff3e0,#d7ccc8)' },
  acquaintance: { name: '熟人', role: '朋友圈订单', badge: '熟', skin: '#f0bd91', hair: '#33251f', shirt: '#7e57c2', border: '#7e57c2', grad: 'linear-gradient(135deg,#f3e5f5,#b39ddb)' },
  platformOps: { name: '平台运营', role: '规则通知', badge: '台', skin: '#edbd91', hair: '#30231d', shirt: '#0288d1', border: '#0288d1', grad: 'linear-gradient(135deg,#e1f5fe,#81d4fa)' },
  ledger: { name: '年底账本', role: '现金流审判官', badge: '账', skin: '#f0bd91', hair: '#33251f', shirt: '#00897b', border: '#00897b', grad: 'linear-gradient(135deg,#e0f7fa,#80cbc4)' },
  player: { name: '你', role: '', badge: '我', skin: '#f0c29c', hair: '#27313c', shirt: '#07c160', border: '#07c160', grad: 'linear-gradient(135deg,#f0fff4,#95ec69)' }
};

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function renderAvatar(key) {
  const c = characters[key] || characters.player;
  return `<div class="wx-avatar portrait-avatar" title="${escapeHtml(c.name)}" style="--accent:${c.border};--grad:${c.grad};--skin:${c.skin};--hair:${c.hair};--shirt:${c.shirt}">
    <div class="portrait-backdrop"></div>
    <div class="portrait-shoulders"></div>
    <div class="portrait-neck"></div>
    <div class="portrait-head"></div>
    <div class="portrait-hair"></div>
    <div class="portrait-eye left"></div>
    <div class="portrait-eye right"></div>
    <div class="portrait-mouth"></div>
    <div class="portrait-badge">${escapeHtml(c.badge)}</div>
  </div>`;
}

// ============ 关卡 ============
const careerScenarios = {
  dev: [
    { title: '接口临时改口', speaker: 'wangpm', channel: '研发群 · 联调前夜', risk: '高', brief: '前端、测试和产品都在线，接口字段一句话被改成新口径。', first: '@你 字段名能不能顺手换一下？', second: '反正只是<em>一个小改动</em>，今天下班前发版吧。', mind: '这不是改字段，是改契约。', trap: '行，我直接改接口。', correct: '先冻结接口协议，新增字段走兼容版本。', evidence: '接口文档显示三端已按旧字段联调，直接改名会让前端和测试全部返工。', press: '追问“只是展示名变化，还是后端协议也要变？”产品开始含糊。', logic: '整理逻辑：接口不是文案，改协议必须看调用方和版本兼容。', decode: '“顺手”是在隐藏影响面。真正风险是接口契约被口头改写。', hint: '把口头需求拉回接口协议。' },
    { title: '线上慢查询', speaker: 'zhaocto', channel: '技术报警群 · 午休时间', risk: '极高', brief: '监控红了，但没人愿意先承认最近谁动过表结构。', first: '订单库慢查询飙升，谁最近动过这块？', second: '先别分析太久，<em>有熟悉的人直接上</em>。', mind: '熟悉的人就是默认责任人。', trap: '我上去看，可能是我之前写的。', correct: '先拉慢 SQL、发布时间线和变更记录再定 owner。', evidence: '发布记录显示你只改了读接口，索引变更来自另一张运维单。', press: '追问“报警开始时间和最近一次 DDL 是哪条？”群里安静了。', logic: '整理逻辑：线上故障先保全时间线，再定位责任，别用熟悉程度定锅。', decode: '“熟悉的人直接上”=谁先响应谁先绑定责任。', hint: '先要监控证据和变更记录。' },
    { title: '代码评审背刺', speaker: 'lilead', channel: 'MR 评论区 · 公开评审', risk: '中', brief: '组长把架构决策包装成你的实现问题，评论区所有人都能看到。', first: '这个实现怎么这么复杂？', second: '我记得之前说过<em>尽量简单点</em>，你是不是过度设计了？', mind: '这个方案明明是会上定的。', trap: '我改简单点，今晚重新提。', correct: '我把会议纪要和权衡点贴到 MR，方便大家按共识评审。', evidence: '会议纪要写着“保留扩展点，后续接三方渠道”。', press: '追问“现在是要推翻会议结论，还是调整局部实现？”问题回到决策层。', logic: '整理逻辑：别在评论区认“过度设计”，先把共识证据贴出来。', decode: '“尽量简单”是模糊口径，可能把集体决策变成个人问题。', hint: '用会议纪要保护技术决策。' },
    { title: '周末灰度', speaker: 'zhaocto', channel: '发布群 · 周五傍晚', risk: '极高', brief: '灰度窗口被塞到周末，但回滚、值班、测试都没有定。', first: '这个版本周末先灰一下，问题不大。', second: '大家辛苦一下，<em>能者多劳</em>。', mind: '灰度不是点按钮，是有人兜底。', trap: '我周末盯着，出问题我处理。', correct: '需要先确认灰度名单、回滚人、测试验收和值班补偿。', evidence: '发布清单缺少回滚负责人，测试环境还有两个阻塞缺陷。', press: '追问“谁验收、谁回滚、谁宣布成功？”口号变成责任表。', logic: '整理逻辑：周末发版不是不能做，不能做的是无边界发版。', decode: '“能者多劳”=把组织成本转成个人义务。', hint: '先把值班和回滚写清。' },
    { title: '事故复盘甩锅', speaker: 'liuops', channel: '复盘会 · 录屏中', risk: '极高', brief: '运维把配置变更说成研发审批问题，会议纪要正在形成。', first: '这次变更单是研发审批过的。', second: '如果审批更严格，可能就不会出事。', mind: '他在混淆审批和操作。', trap: '确实我审批不够仔细。', correct: '我的审批范围是应用发布，数据库配置操作记录需要单独确认。', evidence: '变更单范围写的是应用发布，数据库参数调整另有操作账号。', press: '追问“故障触发点是审批动作，还是数据库参数操作？”责任边界浮出来。', logic: '整理逻辑：复盘讲因果链，不讲印象责任。', decode: '他把形式审批包装成实际操作责任。', hint: '区分审批范围和操作记录。' }
  ],
  pm: [
    { title: '客户一句想要', speaker: 'client', channel: '客户群 · 需求会后', risk: '高', brief: '销售把客户随口一句话塞进版本范围，研发已经看着你。', first: '客户刚才说最好也能支持分账。', second: '这个你们产品<em>应该顺手规划一下</em>吧？', mind: '顺手规划，最后就是我背范围膨胀。', trap: '可以，我放进本期需求。', correct: '先记录为候选需求，本期范围不变，等价值和成本评估后排期。', evidence: '会议纪要的本期目标只有对账，不包含资金分账。', press: '追问“这是本期阻断项，还是后续增强项？”客户承认不是马上要。', logic: '整理逻辑：客户想要不等于版本承诺。', decode: '“应该顺手”是在偷换需求边界。', hint: '锁住本期范围。' },
    { title: '研发反向砍需求', speaker: 'lilead', channel: '研发评审 · 排期前', risk: '中', brief: '研发想把难点砍掉，但用“技术风险”包装成唯一方案。', first: '这个规则引擎太重了，先别做。', second: '我们可以<em>写死几个规则</em>，客户也看不出来。', mind: '短期省事，长期全是债。', trap: '那就写死吧，先上线。', correct: '先拆 MVP，只保留三条可配置规则，后续再扩展。', evidence: '客户合同里写着“规则可配置”，完全写死会违约。', press: '追问“写死后下次改规则谁来兜底？”研发开始算维护成本。', logic: '整理逻辑：产品不是硬顶研发，而是找能上线也不违约的中间方案。', decode: '“看不出来”=把当前技术债藏给未来的你。', hint: '用合同和后续成本谈方案。' },
    { title: '老板要大屏', speaker: 'boss', channel: '老板私聊 · 晚上九点', risk: '高', brief: '老板突然要一个展示大屏，但没有目标、观众和数据口径。', first: '下周会有领导来，做个大屏展示一下。', second: '不用太复杂，<em>看起来高级</em>就行。', mind: '高级是最贵的需求词。', trap: '好的，我明天出完整方案。', correct: '我先确认观众、展示时长和核心指标，今晚出一版信息架构。', evidence: '历史大屏返工记录显示，未确认口径的页面平均返工三轮。', press: '追问“领导主要看业务规模、效率，还是风险？”老板开始给目标。', logic: '整理逻辑：先定叙事目标，再谈视觉高级。', decode: '“看起来高级”=目标不清但期待很高。', hint: '先拿到评价标准。' },
    { title: '设计稿被绕过', speaker: 'client', channel: '验收群 · 截图轰炸', risk: '中', brief: '客户拿竞品截图要求临时改 UI，设计和研发都等你表态。', first: '你看竞品这个按钮更明显。', second: '能不能<em>今天顺手调一下</em>？不影响功能。', mind: '不影响功能，但影响验收口径。', trap: '可以，按竞品改。', correct: '这属于交互变更，我先拉设计确认，再判断是否进本次验收。', evidence: '验收清单只确认原型稿，没有竞品截图这项。', press: '追问“这是验收阻塞，还是优化建议？”客户说先记下。', logic: '整理逻辑：视觉小改也要回到验收范围。', decode: '“不影响功能”是在降低你对变更成本的警惕。', hint: '把建议和阻塞拆开。' },
    { title: '上线后归因', speaker: 'chenhr', channel: '增长复盘 · 全员会', risk: '高', brief: '指标没涨，所有人都在找一个能被写进复盘的人。', first: '这个功能上线后转化没有提升。', second: '产品这边是不是<em>需求判断有问题</em>？', mind: '如果我只解释，就变成承认判断错。', trap: '可能是我判断不准，下次注意。', correct: '先拆漏斗数据，确认曝光、点击、转化各环节后再归因。', evidence: '埋点显示功能曝光率只有 12%，用户根本没看到入口。', press: '追问“当前问题是需求价值，还是入口曝光不足？”复盘方向改变。', logic: '整理逻辑：指标复盘先看链路，不要直接人格归因。', decode: '“判断有问题”是在把系统问题变成个人判断问题。', hint: '用漏斗数据替代口水归因。' }
  ],
  design: [
    { title: '五彩斑斓的黑', speaker: 'client', channel: '设计评审 · 客户在线', risk: '高', brief: '客户表达抽象审美，产品希望你立刻给出最终稿。', first: '这个页面还不够高级。', second: '想要那种<em>五彩斑斓的黑</em>，你懂吧？', mind: '我不懂，但不能直接说不懂。', trap: '懂，我回去重新画。', correct: '我先整理三组视觉参考，让您选方向后再深化。', evidence: '需求单没有品牌关键词，只有一句“高级”。', press: '追问“更偏科技、奢华，还是年轻化？”客户终于给出方向。', logic: '整理逻辑：抽象审美要转成可选参考，不能直接开画。', decode: '“你懂吧”=他也说不清，但希望你承担理解成本。', hint: '先让对方做选择题。' },
    { title: '产品临时插图', speaker: 'wangpm', channel: '原型群 · 评审前半小时', risk: '高', brief: '产品把信息架构问题甩成视觉问题，想让你半小时补救。', first: '这个页面感觉信息不够突出。', second: '你能不能<em>加个插图</em>，马上要评审。', mind: '加插图不能救烂结构。', trap: '我马上找图补上。', correct: '先调信息层级，插图不作为评审前阻塞项。', evidence: '用户路径图显示当前最大问题是主按钮被埋在第三屏。', press: '追问“评审关注信息理解，还是品牌氛围？”产品承认是理解问题。', logic: '整理逻辑：先解决结构，再解决装饰。', decode: '“加个插图”是在用视觉掩盖产品结构问题。', hint: '把问题拉回信息层级。' },
    { title: '老板审美漂移', speaker: 'boss', channel: '老板办公室 · 临时看稿', risk: '中', brief: '老板把昨天定下的风格推翻，但没有承认方向变了。', first: '昨天那个方向我又想了想。', second: '还是要更<em>有冲击力</em>，你再发挥一下。', mind: '发挥一下等于没有边界。', trap: '好的，我多出几版。', correct: '我出两版对照：延续昨天方向和强化冲击力，您定一版基准。', evidence: '昨天评审记录写着“克制、可信、政企感”。', press: '追问“冲击力是否要覆盖昨天的政企感？”老板开始权衡。', logic: '整理逻辑：风格漂移要做对照决策，不要无限发散。', decode: '“发挥一下”=决策责任不想落字。', hint: '要求定基准。' },
    { title: '切图背锅', speaker: 'lilead', channel: '研发群 · 提测前', risk: '高', brief: '研发实现走样，却说设计稿没标清楚。', first: '这个间距我们按感觉还原的。', second: '设计稿里<em>也没写那么细</em>，现在测试说不一致。', mind: '他们把实现偏差说成标注问题。', trap: '那我重新标一遍，今天给。', correct: '我把标注和组件规范贴出来，偏差项按实现问题逐个改。', evidence: 'Figma 组件库已有 8px 间距规则和按钮高度规范。', press: '追问“这几个组件有没有用现成组件库？”研发承认是手写的。', logic: '整理逻辑：不是补标注，而是确认是否按组件库实现。', decode: '“没写那么细”是在把不按规范说成没有规范。', hint: '拿组件库说话。' },
    { title: '改稿不认账', speaker: 'client', channel: '验收会 · 第三轮修改', risk: '极高', brief: '客户否认上一轮确认过的配色，项目开始无偿返工。', first: '这个颜色不是我们想要的感觉。', second: '我们应该<em>没确认过最终色</em>吧？', mind: '确认截图在群里。', trap: '那我再按新方向改。', correct: '我贴一下上轮确认截图，如需调整按新增修改项记录。', evidence: '上周群里客户回复“这个蓝色可以，就按这个推进”。', press: '追问“是在已确认基础上微调，还是推翻方向？”客户不再说没确认。', logic: '整理逻辑：先确认历史共识，再谈新增修改。', decode: '“没确认过”=试图把新增需求伪装成未完成事项。', hint: '用确认截图定边界。' }
  ],
  ops: [
    { title: '证书凌晨过期', speaker: 'zhaocto', channel: '告警群 · 凌晨零点', risk: '极高', brief: '证书过期导致访问异常，但采购和业务都没提前续约。', first: '线上 HTTPS 报错了，先恢复。', second: '证书这块<em>运维应该盯着</em>吧？', mind: '盯着不等于能替采购续费。', trap: '是我没盯住，我先处理。', correct: '我先切临时证书恢复访问，同时补充证书到期和续费责任表。', evidence: '续费邮件抄送了业务负责人，采购单三周前卡在审批。', press: '追问“续费审批停在哪个环节？”责任链条出现了。', logic: '整理逻辑：先恢复，再区分监控、采购、审批责任。', decode: '“应该盯着”是在把协同失败简化成运维失误。', hint: '恢复和归责分开。' },
    { title: '数据库谁动了', speaker: 'liuops', channel: 'DBA 群 · 变更窗口', risk: '高', brief: '有人在窗口外改了参数，现在想把操作记录藏进口头沟通。', first: '昨晚参数调整后性能波动。', second: '当时你也在群里，<em>应该算确认过</em>。', mind: '在群里不等于审批。', trap: '我在群里，那算我确认吧。', correct: '请按操作审计记录确认执行人，我只确认过观察指标。', evidence: '堡垒机记录显示执行账号不是你，群聊里你只回复“观察中”。', press: '追问“确认的是观察指标，还是授权修改参数？”对方开始改口。', logic: '整理逻辑：围观、观察、授权是三件事。', decode: '“你也在群里”是在扩大你的责任范围。', hint: '用审计记录锁定执行人。' },
    { title: '临时开白名单', speaker: 'client', channel: '客户支持群 · 晚高峰', risk: '高', brief: '客户要求临时放开 IP，但没有工单和安全确认。', first: '我们这边访问不了，先帮忙开一下白名单。', second: '客户很急，<em>不要卡流程</em>。', mind: '不卡流程，出事就卡我。', trap: '先开，工单后补。', correct: '我可以加急处理，但需要工单号和负责人确认风险。', evidence: '安全规范写明公网白名单必须有工单和负责人。', press: '追问“这个 IP 属于办公网还是第三方机房？”客户开始找信息。', logic: '整理逻辑：加急不等于免流程，白名单是安全边界。', decode: '“不要卡流程”=希望你替别人承担违规成本。', hint: '要求最小必要凭证。' },
    { title: '备份恢复演练', speaker: 'manager', channel: '内控检查 · 会议室', risk: '中', brief: '领导要求补演练记录，但演练本身并没有做。', first: '审计下周来，备份演练材料准备一下。', second: '以前应该做过吧，<em>记录补齐</em>就行。', mind: '没演练补记录，就是造材料。', trap: '我按模板补一份。', correct: '可以本周补做一次演练，记录按实际结果出。', evidence: '备份平台没有最近三个月恢复任务记录。', press: '追问“补材料还是补演练？”领导沉默了。', logic: '整理逻辑：运维材料不能比系统日志更像真的。', decode: '“记录补齐”可能是在让你伪造内控证据。', hint: '坚持先做真实演练。' },
    { title: '发布回滚无人认领', speaker: 'zhaocto', channel: '发布战情室 · 深夜', risk: '极高', brief: '应用发布失败，研发、测试、业务都在等运维宣布回滚。', first: '现在用户投诉上来了。', second: '运维先<em>决定要不要回滚</em>吧。', mind: '回滚是业务决策，不是我拍脑袋。', trap: '我决定回滚。', correct: '请业务 owner 确认影响等级，我执行回滚或继续观察。', evidence: '发布预案写着回滚决策人为业务 owner，运维负责执行。', press: '追问“回滚损失和继续观察损失哪个更高？”业务终于表态。', logic: '整理逻辑：运维执行决策，不替业务承担取舍。', decode: '“运维决定”是在把业务取舍转嫁给执行岗。', hint: '让 owner 做决策。' }
  ],
  civil: [
    { title: '领导口头交办', speaker: 'director', channel: '科室小群 · 上午', risk: '高', brief: '主任把模糊任务丢给你，但没说依据、时限和责任边界。', first: '这个材料你先牵个头。', second: '不要搞太复杂，<em>下午给我一个结果</em>。', mind: '牵头两个字很危险。', trap: '好的，我下午直接报结果。', correct: '我先列办理依据、协办科室和时间节点，请您确认后推进。', evidence: '上级通知要求三个科室共同填报，不是本科室单独事项。', press: '追问“牵头是汇总材料，还是负责实体审核？”主任补了一句“先汇总”。', logic: '整理逻辑：体制内先定职责边界，再谈效率。', decode: '“牵头”可能从汇总变成全责。', hint: '把口头交办变成清单。' },
    { title: '群众来访情绪', speaker: 'visitor', channel: '窗口大厅 · 午后', risk: '中', brief: '来访人情绪激动，旁边有人录像，所有措辞都可能被截取。', first: '你们就是互相推！', second: '今天不给我解决，我就<em>发到网上</em>。', mind: '不能被情绪带着承诺。', trap: '你别拍了，我今天给你解决。', correct: '您可以依法反映，我先核对材料并告知办理渠道和期限。', evidence: '事项属于另一部门初核，你这里只能告知复议和投诉路径。', press: '追问“您要解决实体问题，还是确认救济渠道？”对方开始说具体诉求。', logic: '整理逻辑：稳住程序，别做超权限承诺。', decode: '“发网上”是在制造即时承诺压力。', hint: '只承诺程序内能做的事。' },
    { title: '兄弟科室甩件', speaker: 'officePeer', channel: '部门协调群 · 下班前', risk: '高', brief: '兄弟科室把历史遗留问题转成你的即时办理任务。', first: '这个信访件你们熟一点。', second: '我们这边先转过去，<em>你们办比较顺</em>。', mind: '熟一点不等于法定职责。', trap: '那先转来吧，我们看看。', correct: '请先明确职责依据，如属共同事项建议分工办理。', evidence: '职责清单显示该事项首办科室是对方，复议科只负责程序审查。', press: '追问“转办依据是哪条？”对方开始发语音解释。', logic: '整理逻辑：协助可以，接责不行。', decode: '“你们熟”是在用经验替代职责依据。', hint: '要转办依据。' },
    { title: '材料补签日期', speaker: 'director', channel: '办公室 · 归档前', risk: '极高', brief: '有人想让你把日期补到过去，让档案看起来完整。', first: '这个签收单缺个日期。', second: '你按当时办的时间<em>补一下</em>，别影响归档。', mind: '补日期是档案雷。', trap: '我按当时日期补上。', correct: '我可以补情况说明，签收日期按实际补签时间记录。', evidence: '系统流转记录显示当天没有签收动作，只有电话沟通。', press: '追问“补的是事实记录，还是补齐形式？”空气突然冷了。', logic: '整理逻辑：档案宁可说明瑕疵，也不能制造事实。', decode: '“别影响归档”是在让你承担档案真实性风险。', hint: '用情况说明替代倒签。' },
    { title: '年度考核材料', speaker: 'director', channel: '考核群 · 年底', risk: '中', brief: '年底材料要体现亮点，但数据口径和个人贡献都很模糊。', first: '今年工作亮点你多写一点。', second: '数字可以<em>写得好看些</em>，大家都这么弄。', mind: '好看不能乱写。', trap: '我把增长写高一点。', correct: '我按台账数据写亮点，无法量化的部分写机制改进。', evidence: '台账显示办结率、调解率都有真实数据，但没有夸张空间。', press: '追问“用台账口径还是宣传口径？”主任选择台账。', logic: '整理逻辑：体制内材料可以会表达，但不能脱离台账。', decode: '“好看些”不等于可以虚构。', hint: '用真实台账包装亮点。' }
  ],
  university: [
    { title: '课题署名排序', speaker: 'teacher', channel: '课题组群 · 投稿前', risk: '高', brief: '论文快投了，署名顺序突然变化，贡献记录开始变重要。', first: '这篇文章署名我再调整一下。', second: '你还年轻，<em>以后机会多</em>。', mind: '以后机会多，眼前署名少。', trap: '好的，老师您安排。', correct: '我整理一下实验、写作和投稿贡献，署名按贡献再确认。', evidence: '版本记录显示实验设计、数据处理和初稿都由你完成。', press: '追问“这次调整依据是贡献，还是项目统筹？”老师开始解释。', logic: '整理逻辑：尊重老师，但贡献记录不能消失。', decode: '“以后机会多”是在用未来不确定收益换当前确定权益。', hint: '拿贡献记录谈署名。' },
    { title: '临时加课', speaker: 'dean', channel: '教务群 · 开学前', risk: '中', brief: '教务突然加课，但课时费、工作量和备课时间都没说。', first: '这门课没人接，你先顶一下。', second: '年轻老师<em>多锻炼</em>，学院会看见。', mind: '看见不等于计工作量。', trap: '我接，课表发我。', correct: '可以协调，但请同步课时工作量、助教和备课周期。', evidence: '培养方案显示这门课是新开课，不是旧课复用。', press: '追问“这算额外工作量还是原工作量调整？”教务开始找表。', logic: '整理逻辑：教学任务可以接，但工作量必须入账。', decode: '“多锻炼”是在压低劳动成本。', hint: '先确认工作量口径。' },
    { title: '横向经费报销', speaker: 'finance', channel: '财务窗口 · 下午', risk: '高', brief: '项目急着结题，财务让你补一堆看似小问题的材料。', first: '这张票用途写得不够清楚。', second: '你写成<em>调研服务</em>，应该更容易过。', mind: '用途不能为了好过而变形。', trap: '那我按调研服务改。', correct: '我按真实用途补说明，如需调整请给出财务依据。', evidence: '合同写的是数据采集，不是调研服务。', press: '追问“改用途是财务建议，还是制度要求？”对方开始翻规定。', logic: '整理逻辑：报销不是文字游戏，合同、发票、用途要一致。', decode: '“更容易过”可能让你承担不一致风险。', hint: '按真实用途补说明。' },
    { title: '学生投诉评分', speaker: 'dean', channel: '学院办公室 · 期末', risk: '中', brief: '学生投诉课程太难，学院希望你快速平息，而不是讨论教学质量。', first: '学生对你这门课意见比较大。', second: '你看能不能<em>成绩稍微柔和一点</em>。', mind: '柔和一点可能变成改分。', trap: '我把分数整体调高。', correct: '我可以复核评分标准，并公开补充答疑，不直接改动已评卷面。', evidence: '评分细则开课初已公布，试卷批改有留痕。', press: '追问“是评分错误，还是学生对难度不满？”学院区分了问题。', logic: '整理逻辑：教学反馈要处理，评分规则不能事后漂移。', decode: '“柔和一点”是在暗示用改分解决投诉。', hint: '复核规则，不做无依据调分。' },
    { title: '非升即走谈话', speaker: 'dean', channel: '院长办公室 · 年底', risk: '极高', brief: '聘期考核临近，领导给你压力，但资源承诺仍然模糊。', first: '你这个进度要加快。', second: '学院支持你，但关键还是<em>自己多冲一冲</em>。', mind: '支持在哪里？压力很清楚，资源很模糊。', trap: '我一定全力冲，资源我自己想办法。', correct: '我列一下论文、项目和平台资源缺口，请学院确认支持事项。', evidence: '聘期目标要求项目和论文，但平台名额和研究生指标尚未落实。', press: '追问“学院支持具体是平台、经费，还是课时减免？”对方开始给条件。', logic: '整理逻辑：非升即走不是喊口号，资源和目标要一起谈。', decode: '“自己多冲”是在把制度压力个人化。', hint: '把支持事项写出来。' }
  ],
  stateOwned: [
    { title: '会签突然加急', speaker: 'stateLead', channel: 'OA 群 · 会签流转', risk: '高', brief: '一份历史合同突然要求你当天会签，前置部门都没写意见。', first: '这个单子你先签一下。', second: '领导等着看，<em>别卡在你这里</em>。', mind: '不看就签，锅就在我这里。', trap: '我先签，后面再补意见。', correct: '请先补齐前置意见和附件，我收到后加急会签。', evidence: 'OA 流程缺少法务和财务意见，附件也少一版合同。', press: '追问“前置意见缺失是否仍要求我签？”对方不再催得那么硬。', logic: '整理逻辑：国企会签慢不是目的，留痕才是护身。', decode: '“别卡在你这里”是在制造责任焦点。', hint: '要求前置意见。' },
    { title: '口径统一会议', speaker: 'director', channel: '经营分析会 · 会前', risk: '中', brief: '数据不好看，领导希望所有部门统一一种更温和的说法。', first: '这个完成率不要说下降。', second: '就说<em>结构性调整</em>，大家口径统一。', mind: '口径统一不能改事实。', trap: '我按结构性调整写，不提下降。', correct: '可以解释结构原因，但完成率下降这个事实保留在数据表。', evidence: '经营报表显示同比下降 18%，审计会看原始数据。', press: '追问“汇报口径和底表口径是否保持一致？”领导点头。', logic: '整理逻辑：表达可以柔和，底表不能变形。', decode: '“口径统一”可能是在让数据事实消失。', hint: '分开叙述和底表。' },
    { title: '采购供应商推荐', speaker: 'supplier', channel: '采购沟通群 · 私聊', risk: '高', brief: '熟人供应商想绕过比选流程，让你帮忙提前打招呼。', first: '这个项目我们很熟。', second: '你帮忙<em>跟采购说一声</em>，后面好配合。', mind: '熟人最容易变风险。', trap: '我帮你打个招呼。', correct: '请按采购流程提交材料，我不参与供应商推荐。', evidence: '制度要求三家比选，业务部门不得指定供应商。', press: '追问“你是咨询规则，还是希望我推荐？”对方撤回了语音。', logic: '整理逻辑：外部关系再熟，也不能碰采购推荐。', decode: '“说一声”是在试探流程边界。', hint: '只讲流程，不做推荐。' },
    { title: '绩效指标摊派', speaker: 'stateLead', channel: '部门周会 · 指标分解', risk: '中', brief: '部门指标没完成，负责人把新增指标平均摊到个人。', first: '今年大家都不容易。', second: '这个新增指标你<em>多承担一点</em>，年轻人有冲劲。', mind: '多承担一点，年底扣分一点。', trap: '没问题，我来扛。', correct: '我可以承担可控部分，请同步资源、任务清单和考核权重。', evidence: '指标分解表里你没有对应资源，只有结果要求。', press: '追问“资源跟着指标走吗？”负责人开始重新分配清单。', logic: '整理逻辑：指标、资源、权重必须一起移动。', decode: '“年轻人有冲劲”是在用情绪包装摊派。', hint: '要资源和权重。' },
    { title: '巡视材料补洞', speaker: 'director', channel: '专项检查 · 材料室', risk: '极高', brief: '检查组快来了，历史材料缺口被推到你手上。', first: '这几份台账空着不太好看。', second: '你按以前工作<em>整理补一下</em>，别让检查组误会。', mind: '补台账可以，编台账不行。', trap: '我按模板补齐。', correct: '我按现有记录整理，并对缺失部分写情况说明。', evidence: '系统里没有对应会议记录，只有后续整改截图。', press: '追问“缺的是整理，还是原始事实不存在？”主任开始接受说明。', logic: '整理逻辑：国企检查材料重完整，但真实性更重。', decode: '“别误会”可能意味着让你制造不存在的过程。', hint: '用情况说明补洞。' }
  ],
  privateBiz: [
    { title: '老板拍脑袋降价', speaker: 'boss', channel: '销售战情群 · 晚上', risk: '高', brief: '老板为了拿单临时降价，却没有同步交付成本和回款条件。', first: '这个客户必须拿下。', second: '价格先<em>打到成本线</em>，后面靠增购赚回来。', mind: '后面赚回来，是最贵的想象。', trap: '我按成本线重新报价。', correct: '可以让利，但要绑定回款节点、服务范围和增购触发条件。', evidence: '历史同类低价单回款周期超过 180 天，增购率不到 10%。', press: '追问“低价换来的具体承诺是什么？”老板开始谈回款。', logic: '整理逻辑：私企可以拼，但不能无条件亏。', decode: '“后面赚回来”是在用未来收益掩盖当前亏损。', hint: '把让利换成条件。' },
    { title: '客户要免费定制', speaker: 'client', channel: '商务群 · 报价后', risk: '高', brief: '客户把定制开发说成售后支持，想压掉费用。', first: '这个小功能也算售后吧？', second: '你们服务好一点，<em>后面还有机会</em>。', mind: '机会不能抵工资。', trap: '可以，我们免费做。', correct: '售后问题免费处理，新功能按定制范围评估报价。', evidence: '合同售后条款只覆盖故障修复，不包含新增功能。', press: '追问“这是修复原功能，还是新增流程？”客户承认是新增。', logic: '整理逻辑：客户关系要维护，但边界不能免费蒸发。', decode: '“后面还有机会”是在用不确定订单换确定劳动。', hint: '区分售后和新增。' },
    { title: '同事抢功劳', speaker: 'manager', channel: '项目复盘 · 会议室', risk: '中', brief: '关键方案是你做的，同事汇报时把贡献说成团队自然产出。', first: '这个方案最后能落地，主要是大家配合好。', second: '具体是谁做的就<em>不用分那么细</em>。', mind: '不分细，绩效就没我。', trap: '嗯，都是团队功劳。', correct: '团队配合很重要，我补充一下我负责的方案和落地数据。', evidence: '项目文档里方案负责人、交付节点和效果数据都写着你的名字。', press: '追问“复盘是讲团队协同，还是要沉淀可复用负责人？”经理让你补充。', logic: '整理逻辑：不抢团队功劳，但个人贡献必须可见。', decode: '“不用分那么细”常常让真正干活的人消失。', hint: '用数据补充个人贡献。' },
    { title: '现金流拖薪', speaker: 'boss', channel: '公司群 · 月底', risk: '极高', brief: '老板暗示工资晚几天，但没有明确时间和补偿。', first: '这个月大家理解一下。', second: '回款到了工资马上发，<em>公司不会亏待大家</em>。', mind: '不会亏待是最空的承诺。', trap: '我理解，公司困难一起扛。', correct: '请明确发薪日期、未发金额和后续补偿安排。', evidence: '劳动合同写明每月固定发薪日，已超过三天。', press: '追问“最晚哪天发，是否出书面通知？”群里开始有人跟进。', logic: '整理逻辑：共渡难关也要有期限和凭证。', decode: '“马上发”如果没有日期，就是无限延期。', hint: '要具体日期。' },
    { title: 'KPI 临时加码', speaker: 'manager', channel: '月度会 · 投屏中', risk: '高', brief: '目标没变资源没变，经理临时把指标翻倍，说是挑战自我。', first: '这个月目标再拉高一点。', second: '大家<em>逼自己一把</em>，结果自然会出来。', mind: '结果不会自然出来，只会自然扣绩效。', trap: '我认领翻倍目标。', correct: '我可以挑战增量目标，请同步预算、线索和优先级调整。', evidence: '当前线索池不足以支撑翻倍目标，广告预算也没增加。', press: '追问“目标翻倍对应哪项资源翻倍？”经理开始改成阶梯目标。', logic: '整理逻辑：KPI 可以冲，但资源模型不能装没看见。', decode: '“逼自己”是在把资源缺口变成个人意志问题。', hint: '让资源跟着目标走。' }
  ],
  selfEmployed: [
    { title: '老客压价', speaker: 'regularCustomer', channel: '微信私聊 · 报价后', risk: '高', brief: '老客户用关系压价，还要求不降服务。', first: '咱们都合作这么久了。', second: '这次你<em>按老朋友价</em>，服务还是照旧。', mind: '老朋友价不能变成亏本价。', trap: '行，按你说的价。', correct: '老客户可以给折扣，但服务范围和交付次数同步调整。', evidence: '上一单已经多做两轮修改，没有额外收费。', press: '追问“是降价保范围，还是保价减范围？”老客户开始选。', logic: '整理逻辑：个体户卖的是时间，关系不能无限透支时间。', decode: '“老朋友价”是在用关系交换你的利润。', hint: '折扣必须换边界。' },
    { title: '房租突然上涨', speaker: 'landlord', channel: '店铺门口 · 月底', risk: '极高', brief: '房东临时涨租，合同还没到期，但你担心闹僵影响经营。', first: '附近租金都涨了。', second: '下个月你也<em>适当加一点</em>，不然我不好交代。', mind: '不好交代不是合同条款。', trap: '行，我下个月加。', correct: '合同期内按原租金执行，续租价格可以提前谈。', evidence: '租赁合同写明一年内租金固定，续租需提前一个月协商。', press: '追问“这次是合同内调整，还是续租预沟通？”房东改口说先聊聊。', logic: '整理逻辑：关系要维护，但合同期内不要随口让步。', decode: '“适当加一点”是在试探你是否熟悉合同。', hint: '区分当前合同和续租谈判。' },
    { title: '平台抽成变化', speaker: 'platformOps', channel: '平台通知群 · 早上', risk: '高', brief: '平台规则变了，运营建议你先降价保排名。', first: '平台抽成涨了。', second: '你先<em>降点利润保流量</em>，后面再调回来。', mind: '后面再调回来，通常调不回来。', trap: '我先降价冲排名。', correct: '先算新抽成下的毛利线，低于线的订单不接。', evidence: '近三个月订单显示，低价流量售后率更高，利润更薄。', press: '追问“降价后单均利润还有多少？”对方算不出来。', logic: '整理逻辑：流量不是收入，现金流才是命。', decode: '“保流量”可能是在让你用亏损买热闹。', hint: '先算毛利线。' },
    { title: '熟人赊账', speaker: 'acquaintance', channel: '朋友圈订单 · 晚上', risk: '中', brief: '熟人说月底一起结，但你的小生意经不起太多赊账。', first: '我先拿走，月底一起给你。', second: '都熟人了，<em>不会差你这点钱</em>。', mind: '差不差是一回事，账期是另一回事。', trap: '行，月底给就行。', correct: '可以预留，但需要先付定金，尾款发货前结清。', evidence: '上次熟人单拖了 42 天才结，期间你垫了材料费。', press: '追问“月底具体哪天？能不能先付定金？”对方开始转账。', logic: '整理逻辑：熟人交易更要规则清楚，否则关系和钱一起坏。', decode: '“不会差你”是在让你不好意思谈规则。', hint: '用定金保护现金流。' },
    { title: '税务材料补报', speaker: 'finance', channel: '办税提醒 · 手机短信', risk: '高', brief: '补报期限快到了，代理记账让你随便归类几笔支出。', first: '这几笔支出类目不好分。', second: '你就<em>先放办公费</em>，一般没事。', mind: '一般没事，不代表真的没事。', trap: '那都放办公费。', correct: '按实际用途分类，不确定的保留凭证并备注说明。', evidence: '其中两笔是材料采购，一笔是广告投放，不能混进办公费。', press: '追问“如果被抽查，凭证和类目能不能对应？”代理开始细分。', logic: '整理逻辑：小生意也要把账做清楚，省事不是省风险。', decode: '“一般没事”是在用概率掩盖合规责任。', hint: '按真实用途分类。' }
  ]
};
const levels = [
  {
    id: 1, title: '需求很简单', speaker: 'wangpm',
    scene: { channel: '项目群 · 新人首次被点名', risk: '高', brief: '产品把不确定工期包装成一句”很简单”，群里还有领导潜水。' },
    loadout: { name: '极限施压套装', stanceBonus: 4, recovery: 1, counterOnBad: true, counterBlame: 3, maxRounds: 3 },
    followups: [
      {
        text: '我跟客户那边聊过了，人家真的挺着急的。你就先搭个框架出来呗，后面细节我们慢慢补，这总行吧？',
        options: [
          { move: '口头接下', text: '好吧，我先弄个初版出来。', effects: { performance: -5, blame: 10, mood: -5, network: 5 }, result: '承诺出口。接下来两天你都在擦这个”初版”的屁股。', type: 'mid' },
          { move: '展开风险', text: '这个字段下游连着结算和报表，强行上线可能要出事。我先拉个影响评估，下午给你排期。', effects: { performance: 10, blame: 0, mood: -3, network: 0 }, result: '群里安静了。王产品没再催你。', type: 'good' },
          { move: '把球踢给客户', text: '让客户直接跟我聊需求吧，我跟他确认下技术方案。', effects: { performance: 5, blame: 5, mood: 10, network: -5 }, result: '王产品赶紧说”不用了”，但你们的关系降到冰点。', type: 'mid' }
        ]
      },
      {
        text: '（转发群聊）领导，开发这边说排期要两天，但客户明天就要看...您看怎么处理？',
        options: [
          { move: '@领导晒排期', text: '@领导 刚做完评估，这个需求涉及结算、报表、权限三条线，最低2天。建议走正常迭代。', effects: { performance: 15, blame: 0, mood: 5, network: 10 }, result: '领导回复”按排期来”。王产品再也没敢在群里@你。', type: 'good' },
          { move: '留书面记录', text: '可以赶，但请发邮件确认需求范围和上线时间，我这边留档。', effects: { performance: 0, blame: 5, mood: -15 }, result: '审批流程护住了你，但你知道这个周末没了。', type: 'mid' },
          { move: '装死', text: '（暂不回复）', effects: { performance: -5, blame: 0, mood: 5, network: -10 }, result: '群里冷场。领导私聊问你”什么情况”。', type: 'bad' }
        ]
      }
    ],
    tools: {
      evidence: '需求池记录：这个字段关联结算、报表、权限三处，不是”改个字段”。',
      stall: '追问”上线范围只包含字段展示，还是包含结算链路？”王产品停了一下，问题暴露出真实体积。',
      meme: '整理逻辑：危险词是”很简单”和”明天”。正确打法不是接锅，而是把承诺改成评估流程。'
    },
    mind: '刚入职第一天，产品就来@我了...',
    messages: [
      { type: 'system', text: '周一 09:15' },
      { type: 'other', char: 'wangpm', text: '@你 在忙吗？客户那边刚问进度。' },
      { type: 'other', char: 'wangpm', text: '这个需求<em>很简单</em>吧，改个字段的事，<em>明天能上线</em>吗？客户催得紧。' }
    ],
    decode: { text: '「很简单」=他不懂技术；「客户催」=转移压力。典型的<em>”先承诺再逼开发”</em>。', hint: '把球踢回排期流程。' },
    options: [
      { move: '秒接', text: '好的，明天给你。', effects: { performance: -5, blame: 20, mood: -10 }, result: '接下不可能的任务。通宵改完，上线出bug。', type: 'bad' },
      { move: '怼回去', text: '简单？那你来写代码。', effects: { performance: 0, blame: 5, mood: 5, network: -15 }, result: '群里死寂。王产品截图发给了领导。', type: 'bad' },
      { move: '要排期', text: '我先评估技术影响，下午给排期。', effects: { performance: 10, blame: 0, mood: -5, network: 5 }, result: '守住边界。领导看到了你的靠谱。', type: 'good' },
      { move: '找领导', text: '得@领导确认优先级。', effects: { performance: 0, blame: 0, mood: 0, network: 0 }, result: '安全但平庸。显得没判断力。', type: 'mid' }
    ]
  },
  {
    id: 2, title: '我确认过了', speaker: 'wangpm',
    scene: { channel: '需求评审群 · 历史记录可查', risk: '高', brief: '对方开始改写共识，真正的战场不是记忆，是文档证据。' },
    loadout: { name: '记忆篡改者', stanceBonus: 3, recovery: 2, counterOnBad: true, counterBlame: 5, maxRounds: 3 },
    followups: [
      {
        text: '我记得很清楚，那天在茶水间聊的时候，你说的”没问题”。现在又说没印象，这就有点说不过去了吧？',
        options: [
          { move: '拉回到PRD', text: '茶水间聊的我不确定。不如按PRD来，要改的话走变更流程，我配合评估。', effects: { performance: 5, blame: 0, mood: -5, network: 3 }, result: '不再争记忆。话题拉回文档和流程。', type: 'good' },
          { move: '认错', text: '可能确实是我忘了。我这就改，下次注意。', effects: { performance: -10, blame: 15, mood: -15 }, result: '你背下了这次返工的全部责任。', type: 'bad' },
          { move: '要证据', text: '茶水间的话没有记录。PRD是有版本历史的，你找一下确认过的版本？', effects: { performance: 5, blame: 0, mood: 10, network: -10 }, result: '产品翻不出记录。但你这态度把人得罪了。', type: 'mid' }
        ]
      },
      {
        text: '算了，不跟你争这个了。我找研发总监安排人改，到时候影响上线你负责。',
        options: [
          { move: '拉公开评审', text: '好，我拉上研发总监、PMO一起看PRD和需求变更。大家公开对齐。', effects: { performance: 15, blame: 0, mood: 5, network: 5 }, result: '产品退缩了——他不想让总监看到PRD原稿。', type: 'good' },
          { move: '留邮件', text: '可以，我把当前PRD和你的要求整理成邮件，抄送相关人确认后交接。', effects: { performance: 5, blame: 3, mood: -5 }, result: '虽然没赢，但流程保护做好了。', type: 'mid' },
          { move: '硬杠', text: '你找谁改是你的事。PRD不是我写的，别把锅往我这甩。', effects: { performance: -5, blame: 5, mood: 5, network: -20 }, result: '研发总监看到了。你们俩像小学生吵架。', type: 'bad' }
        ]
      }
    ],
    tools: {
      evidence: 'PRD 截图：”默认开启”四个字还在第3页，版本记录没有修订痕迹。',
      stall: '追问”确认是口头确认，还是有文档变更？”对方开始绕开第3页。',
      meme: '整理逻辑：别争谁记错了。只要把话题拉回版本记录，对方的”我确认过了”就站不住。'
    },
    mind: '他在改口...PRD明明写的”默认开启”。',
    messages: [
      { type: 'system', text: '周三 14:30' },
      { type: 'other', char: 'wangpm', text: '刚看了测试环境，默认状态怎么还是开着的？' },
      { type: 'self', text: '我这边按上周PRD第3页做的。' },
      { type: 'other', char: 'wangpm', text: '这个方向不对，<em>我上周不是跟你确认过</em>要”默认关闭”吗？你理解错了？' }
    ],
    decode: { text: '他在<em>捏造记忆</em>。PRD白纸黑字写着”默认开启”。想甩锅让你返工。', hint: '证据是PRD文档。' },
    options: [
      { move: '认错', text: '可能是我记错了，这就改。', effects: { performance: -10, blame: 15, mood: -15 }, result: '替他背了锅。返工2天。', type: 'bad' },
      { move: '截图', text: 'PRD第3页写”默认开启”，我截图了。', effects: { performance: 5, blame: 0, mood: 5, network: -5 }, result: '铁证如山。王产品哑口无言。', type: 'good' },
      { move: '要变更单', text: '按流程要走变更单，我重新评估工期。', effects: { performance: 5, blame: 0, mood: -5 }, result: '守住流程底线。留下书面记录。', type: 'good' },
      { move: '找领导', text: '领导你来评评理。', effects: { performance: 0, blame: 5, network: -10 }, result: '领导最讨厌鸡毛蒜皮往上捅。', type: 'bad' }
    ]
  },
  {
    id: 3, title: '领导画饼', speaker: 'lilead',
    scene: { channel: '会议室 · 一对一谈话', risk: '中', brief: '私聊里没有旁证，所有承诺都可能变成”你自己理解的”。' },
    loadout: { name: '画饼大师', stanceBonus: 2, recovery: 1, counterOnBad: false, maxRounds: 4 },
    followups: [
      {
        text: '你再考虑考虑，不是每个人都值得我这样培养的。我是真心想带你，今年这个机会很难得。',
        options: [
          { move: '要书面', text: '我确实有兴趣。但能不能落到纸面上：具体承担哪几项、晋升的时间节点和评价标准？', effects: { performance: 10, blame: 0, mood: 0, network: 5 }, result: '领导开始认真想这件事的细节，而不是随口画饼。', type: 'good' },
          { move: '感动', text: '谢谢领导这么看重我，我一定不辜负你的培养。', effects: { performance: 0, blame: 10, mood: -5, network: 5 }, result: '你被纳入了”可加活名单”。', type: 'bad' },
          { move: '模糊答应', text: '那我先试着多承担一些，边做边看。', effects: { performance: 0, blame: 5, mood: -3, network: 3 }, result: '模糊的态度让你暂时安全，但没有解决根本问题。', type: 'mid' }
        ]
      },
      {
        text: '你这话是什么意思，不信任我是吧？我带人这么多年，从没亏待过谁。你是不是在外面听到什么了？',
        options: [
          { move: '讲逻辑', text: '不是不信任。只是书面确认对双方都是保护，免得后面扯皮。你的经验应该最清楚这个。', effects: { performance: 5, blame: 0, mood: 5, network: 5 }, result: '领导没法反驳这个逻辑。气氛缓和了。', type: 'good' },
          { move: '道歉', text: '没有没有，我绝对没有不信任你。是我多想了。', effects: { performance: 0, blame: 5, mood: -10 }, result: '你收回了质疑，但领导知道你可以被道德绑架。', type: 'bad' },
          { move: '沉默', text: '（沉默）', effects: { performance: 0, blame: 0, mood: -5, network: -3 }, result: '沉默让气氛更尴尬了。领导觉得你态度不好。', type: 'mid' }
        ]
      },
      {
        text: '行，你要这么较真，那我找别人。不过你要知道，机会就这一次。明年再想上，就不是我说了算了。',
        options: [
          { move: '坚持', text: '我理解。但我跟领导要的不只是一句话，是明确的成长路径。你如果愿意写下来，我全力以赴。', effects: { performance: 10, blame: 0, mood: 5, network: 3 }, result: '领导沉默了几秒。然后说”我回头给你个方案”。', type: 'good' },
          { move: '退缩', text: '等下，我再考虑考虑……好吧，我接受。', effects: { performance: -5, blame: 15, mood: -15 }, result: '你已经输了。领导知道你怕失去机会。', type: 'bad' },
          { move: '婉拒', text: '谢谢领导给机会。可能时机还不太合适，我先做好手头的事。', effects: { performance: 0, blame: 3, mood: 10, network: -5 }, result: '全身而退。但领导把你从”候选人”划掉了。', type: 'mid' }
        ]
      }
    ],
    tools: {
      evidence: '前任案例：上一位”准组长”多干了半年活，最后岗位给了空降的人。',
      stall: '追问”多承担具体是哪几项？晋升节点和评价标准怎么写？”画饼开始需要落字。',
      meme: '整理逻辑：私聊承诺不能当证据。要么拿到范围和时间线，要么这只是加活暗示。'
    },
    mind: '组长突然找我谈话...感觉有坑。',
    messages: [
      { type: 'system', text: '一对一谈话' },
      { type: 'other', char: 'lilead', text: '最近几个项目你扛得不错，我都看在眼里。' },
      { type: 'other', char: 'lilead', text: '今年发展很快，<em>我很看好你</em>。明年有个组长位置，你<em>多承担一些</em>，<em>表现好</em>的话我推荐你。' }
    ],
    decode: { text: '”看好你”=不加薪；”多承担”=加活不加钱。这是<em>期权式压榨</em>。', hint: '不要拒绝晋升，但要明确范围和回报。' },
    options: [
      { move: '吃饼', text: '谢谢领导！我一定加倍努力！', effects: { performance: 0, blame: 10, mood: -10, network: 5 }, result: '工作量翻倍，组长位置给了别人。', type: 'bad' },
      { move: '问条件', text: '能否明确”承担”的范围和晋升时间线？', effects: { performance: 5, blame: 0, mood: 0, network: 5 }, result: '领导愣了。但至少表明：饼不能白画。', type: 'good' },
      { move: '拒绝', text: '我更关注技术深度，管理暂不考虑。', effects: { performance: 0, blame: 0, mood: 5, network: -5 }, result: '领导把你从”自己人”名单划掉了。', type: 'mid' },
      { move: '谈钱', text: '能否先调P6+，待遇匹配再上？', effects: { performance: 5, blame: 0, mood: 10, network: 0 }, result: '直接谈条件。最后谈了10%涨薪。', type: 'good', require: { mood: 50 } }
    ]
  },
  {
    id: 4, title: '周五18:03', speaker: 'zhaocto',
    scene: { channel: '技术部大群 · 下班后突发', risk: '极高', brief: '高管公开抛任务但不点 owner，谁最先热血谁最先绑定责任。' },
    loadout: { name: '紧急轰炸', stanceBonus: 5, recovery: 2, counterOnBad: true, counterBlame: 4, maxRounds: 3 },
    followups: [
      {
        text: '（组长私聊你）群里表态一下吧，CTO在上面看着呢。你不发言我不好安排。',
        options: [
          { move: '要方案', text: '我确认下演示范围和owner，有书面方案后群里回复。', effects: { performance: 10, blame: 0, mood: 0, network: 10 }, result: '组长没法逼你在没有范围的情况下表态。', type: 'good' },
          { move: '顺从', text: '好的，我马上群里回复”收到”。', effects: { performance: -5, blame: 15, mood: -10 }, result: '你成了默认owner之一。周末没了。', type: 'bad' },
          { move: '找借口', text: '我这周末家里有事，可能不太方便。', effects: { performance: 0, blame: 3, mood: 5, network: -10 }, result: '组长在CTO面前帮你解释了。但你被记住了。', type: 'mid' }
        ]
      },
      {
        text: '（群里有人@你）你还没回复呢，这项目缺你不行啊，你可是最了解这块的。',
        options: [
          { move: '要清单', text: '谢谢认可。请CTO确认功能清单和验收标准，确认后我全力配合。', effects: { performance: 15, blame: 0, mood: 5, network: 10 }, result: '高帽被转成了正常的工作要求。没人能再逼你。', type: 'good' },
          { move: '接帽', text: '收到！交给我吧！周末我来搞定。', effects: { performance: -5, blame: 20, mood: -20 }, result: '全责锁定。演示出bug的时候CTO第一个找你。', type: 'bad' },
          { move: '消失', text: '（不回复，退群聊通知）', effects: { performance: -5, blame: 0, mood: 10, network: -20 }, result: '周一CTO：”那个谁，昨天怎么没来？”', type: 'bad' }
        ]
      }
    ],
    tools: {
      evidence: '你扫了一眼在线名单：组长在线、产品在线、测试没在线。这个演示根本没人兜底。',
      stall: '追问”演示 owner、功能清单和验收人分别是谁？”群里的热血口号被迫变成任务边界。',
      meme: '整理逻辑：公开群里不能第一个举手，也不能完全消失。先私聊确认 owner，再决定公开回应。'
    },
    mind: 'CTO在大群发话...这是坑。',
    messages: [
      { type: 'system', text: '周五 18:03 · 技术部大群' },
      { type: 'other', char: 'zhaocto', text: '大家先别下线，看一下新通知。' },
      { type: 'other', char: 'zhaocto', text: '老板通知，<em>下周一要给投资人演示新功能</em>。能上的都上，<em>周末加个班</em>，搞定了我请大家吃饭。<span class=”tag tag-urgent”>紧急</span>' },
      { type: 'other', char: 'lilead', text: '在线的同学先响应一下。' }
    ],
    decode: { text: '”请大家吃饭”=人均80火锅；CTO<em>大群@所有人</em>=不想指定责任人，谁跳出来谁接锅。', hint: '不要第一个回复，但也不能不回应。' },
    options: [
      { move: '举手', text: '收到！保证周一前搞定！', effects: { performance: -5, blame: 20, mood: -20 }, result: '成了默认owner。演示出bug，CTO问”谁负责的？”', type: 'bad' },
      { move: '私聊', text: '【私聊组长】任务的owner怎么定？', effects: { performance: 10, blame: 0, mood: 0, network: 10 }, result: '组长确认了owner是别人。你避开锅。', type: 'good', require: { network: 45 } },
      { move: '要清单', text: '【大群】请CTO确认功能清单。', effects: { performance: 5, blame: 5, mood: -10, network: -5 }, result: '组长觉得你”顶撞高管”。', type: 'mid' },
      { move: '下线', text: '装作没看见，关电脑走人。', effects: { performance: -10, blame: 0, mood: 15, network: -15 }, result: '周末很好。但周一CTO记住了你。', type: 'bad' }
    ]
  },
  {
    id: 5, title: '事故复盘会', speaker: 'liuops',
    scene: { channel: '事故复盘 · 录屏会议', risk: '极高', brief: '会议纪要会留下来，沉默或口误都会变成责任归属。' },
    loadout: { name: '甩锅专家', stanceBonus: 4, recovery: 1, counterOnBad: true, counterBlame: 5, maxRounds: 4 },
    followups: [
      {
        text: '变更单上就是你的签名，系统日志不会说谎。我不否认是我操作的，但审批是你通过的。审批人也要负责吧？',
        options: [
          { move: '划范围', text: '变更单上的审批范围写的是”应用发布”。你做的数据库配置变更，不在我的审批范围内。', effects: { performance: 10, blame: 0, mood: 0, network: -5 }, result: '范围一清二楚。刘运维脸绿了。', type: 'good' },
          { move: '认部分', text: '签名是我的，我确实也有责任。大家一起复盘，以后避免类似问题。', effects: { performance: -5, blame: 10, mood: -5 }, result: '刘运维笑纳了。你被记上了台账。', type: 'bad' },
          { move: '反问', text: '你先说说为什么改数据库配置？变更单上没有这项操作。', effects: { performance: 5, blame: 3, mood: 5, network: -10 }, result: '场面开始”狗咬狗”。领导皱眉头。', type: 'mid' }
        ]
      },
      {
        text: '（会议室里另一个人插话）审批都过了，那审批人确实有责任啊。操作只是执行，决策才是关键。',
        options: [
          { move: '分责任', text: '操作责任和审批责任是两回事。我是形式审查签字，他是实际操作。变更单上的操作范围他应该遵守。', effects: { performance: 10, blame: 0, mood: 0, network: -3 }, result: '逻辑清晰，无法反驳。插话的人闭嘴了。', type: 'good' },
          { move: '沉默', text: '(沉默，不接话)', effects: { performance: 0, blame: 8, mood: -10 }, result: '沉默被解读为默认。纪要上写了”审批责任”。', type: 'bad' },
          { move: '搅浑', text: '你们就是在找人背锅！我签的字我认，但别想让我一个人扛。', effects: { performance: -3, blame: 10, mood: 5, network: -15 }, result: '场面失控。领导强制暂停会议。', type: 'bad' }
        ]
      },
      {
        text: '结论初步定了：审批环节有疏漏。刘运维，你把这条写进会议纪要。小王，你有补充意见吗？',
        options: [
          { move: '留记录', text: '有补充：请备注”审批范围仅限应用发布，数据库配置变更不在审批范围内”。', effects: { performance: 15, blame: 0, mood: 10, network: 5 }, result: '纪要上的记录救了你。HR后来看到这条备注。', type: 'good' },
          { move: '放弃', text: '……没有补充。', effects: { performance: -10, blame: 15, mood: -15 }, result: '会议纪要上没有你的辩解。P0事故记录跟了你。', type: 'bad' },
          { move: '拖延', text: '我需要再核实一下变更单的详细信息，会后书面反馈。', effects: { performance: 5, blame: 3, mood: -3 }, result: '争取到了核实证据的时间，但还是要后续跟进。', type: 'mid' }
        ]
      }
    ],
    tools: {
      evidence: '你翻到变更单：审批范围写的是”应用发布”，数据库配置变更另有操作记录。',
      stall: '追问”这次故障点是应用发布，还是数据库配置？”对方把审批责任和操作责任混在一起的地方露出来了。',
      meme: '整理逻辑：不要说”我没责任”，要说”我的审批范围是什么、实际操作记录是什么”。'
    },
    mind: '刘运维在录屏会议上...当众甩锅给我？',
    messages: [
      { type: 'system', text: 'P0事故复盘 · 全员+录屏' },
      { type: 'other', char: 'liuops', text: '我先同步一下时间线，昨晚的变更单确实是走过审批的。' },
      { type: 'other', char: 'liuops', text: '这个变更是<em>张开发审批通过</em>的，我按流程走的。如果审批再严格点，可能就不会出问题了。' }
    ],
    decode: { text: '他在<em>当众甩锅</em>。运维改配置是他的操作，你签字只是形式审查。他在混淆<em>操作责任</em>和<em>审批责任</em>。', hint: '区分两种责任，不接不该接的锅。' },
    options: [
      { move: '接锅', text: '确实是我审批不够仔细。', effects: { performance: -15, blame: 25, mood: -20 }, result: '你接下了操作责任。复盘报告上”主要责任人”是你。', type: 'bad' },
      { move: '划边界', text: '变更单上我审批的是”应用发布”，数据库不在范围内。', effects: { performance: 10, blame: 0, mood: 5, network: -10 }, result: '拿出变更单。刘运维脸色铁青。', type: 'good' },
      { move: '和稀泥', text: '审批和操作是双重保障，建议会后拉专项细化流程。', effects: { performance: 15, blame: 0, mood: 0, network: 10 }, result: '高情商。没接锅也没怼人，引向流程改进。', type: 'good' },
      { move: '揭短', text: '当时是你凌晨2点催我签的字。', effects: { performance: -5, blame: 5, mood: 10, network: -20 }, result: '互相揭短。领导最讨厌”狗咬狗”。', type: 'bad' }
    ]
  }
];

// ============ 核心函数 ============
const careerMoveSets = {
  dev: {
    bad: ['裸改接口', '先上再说', '低头返工', '周末自燃', '审批自爆'],
    good: ['契约冻结', '时间线封存', '纪要反制', '发布边界', '操作切割'],
    mid: ['兼容缓冲', '上线观察', '局部让步', '私下待命', '流程复盘'],
    sharp: ['协议硬刚', '现场点名', '评论区开怼', '群里硬拒', '当场翻旧账']
  },
  pm: {
    bad: ['范围滑坡', '技债放行', '大屏开画', '顺手改稿', '认领误判'],
    good: ['范围冻结', 'MVP拆分', '指标定锚', '验收分流', '漏斗拆解'],
    mid: ['候选池暂存', '临时方案', '信息架构', '先记建议', '数据观察'],
    sharp: ['销售硬怼', '技术反压', '老板追问', '截图对线', '复盘反杀']
  },
  design: {
    bad: ['盲画高级', '插图救火', '无限出稿', '重新标注', '免费改稿'],
    good: ['参考定向', '层级重排', '双版定标', '组件举证', '确认截图'],
    mid: ['风格试探', '先补视觉', '风格跟随', '补标缓冲', '微调分流'],
    sharp: ['审美拆穿', '原型反压', '审美硬刚', '研发对线', '验收硬顶']
  },
  ops: {
    bad: ['默默认锅', '群聊授权', '违规放行', '补假记录', '运维拍板'],
    good: ['恢复分责', '审计锁人', '工单加急', '真实演练', 'Owner确认'],
    mid: ['先救火', '观察缓冲', '临时观察', '补材料', '继续观察'],
    sharp: ['甩回采购', '当场点号', '安全硬挡', '内控反问', '拒绝背决策']
  },
  civil: {
    bad: ['口头接令', '情绪承诺', '接收甩件', '倒签补档', '亮点注水'],
    good: ['依据成表', '程序告知', '职责依据', '情况说明', '台账包装'],
    mid: ['先汇总', '安抚登记', '协助登记', '补正记录', '宣传缓冲'],
    sharp: ['职责反问', '镜头前硬顶', '退回原件', '档案硬拒', '口径反问']
  },
  university: {
    bad: ['署名躺平', '临时接课', '用途改写', '直接改分', '空喊冲刺'],
    good: ['贡献清单', '工作量入账', '依据补说明', '规则复核', '资源清单'],
    mid: ['尊师缓冲', '先协调', '窗口缓冲', '答疑安抚', '表态缓冲'],
    sharp: ['排序追问', '教务硬拒', '票据反问', '评分硬顶', '支持追问']
  },
  stateOwned: {
    bad: ['先签后补', '粉饰口径', '熟人招呼', '指标硬扛', '补造台账'],
    good: ['前置补齐', '底表保真', '流程隔离', '资源联动', '缺口说明'],
    mid: ['流程暂存', '解释缓冲', '规则咨询', '阶梯认领', '材料整理'],
    sharp: ['会签反问', '数据硬顶', '推荐切断', '权重反问', '真实性硬挡']
  },
  privateBiz: {
    bad: ['成本线裸奔', '免费定制', '功劳隐身', '共体时艰', '热血翻倍'],
    good: ['让利绑条件', '售后切分', '贡献补位', '发薪落字', '资源配比'],
    mid: ['先测算', '关系缓冲', '团队缓冲', '情绪安抚', '阶梯挑战'],
    sharp: ['老板反问', '范围硬切', '当场抢话', '劳动合同', '预算反问']
  },
  selfEmployed: {
    bad: ['友情亏本', '口头涨租', '降价买流量', '熟人赊账', '随便归类'],
    good: ['折扣换范围', '合同锁租', '毛利线测算', '定金锁单', '凭证归类'],
    mid: ['老客缓冲', '续租预谈', '试单观察', '预留缓冲', '备注缓冲'],
    sharp: ['报价硬守', '租约硬挡', '平台反问', '账期硬切', '税务反问']
  }
};

const careerNewsMoves = {
  dev: [
    { move: '热搜甩锅声明', text: '我发一版“关于接口调整情况的说明”：高度重视、连夜排查、历史原因复杂。', result: '像极了热搜声明，气氛变轻松了，但问题还没真正落到协议上。' },
    { move: '截图反转现场', text: '我把监控截图、发布时间和变更记录拼成九宫格，标题就叫“慢查询反转”。', result: '证据很炸，大家开始认真看时间线，但也有人觉得你太会整活。' },
    { move: '评论区置顶', text: '我在 MR 里置顶一条“请先看会议纪要再开麦”。', result: '节目效果很强，评审区瞬间安静，但组长脸上挂不住。' },
    { move: '直播式更新', text: '我每半小时发一次“灰度进展通报”，把验收、回滚、值班都挂出来。', result: '透明度拉满，没人敢再口头画饼，但你也成了战情主播。' },
    { move: '事故小作文', text: '我写一篇复盘小作文：从审批范围到操作账号，三千字讲清楚。', result: '吃瓜感很足，证据也足，就是会议时间被你拉长了。' }
  ],
  pm: [
    { move: '热搜需求投票', text: '我把客户一句话做成“本期阻断还是后续增强”的投票，群里公开选。', result: '像热搜站队，范围被迫显形，但销售觉得你把事闹大了。' },
    { move: '反转长图', text: '我做一张“写死规则后续维护成本”长图，标题叫“看不出来的代价”。', result: '研发笑不出来了，方案开始回到成本讨论。' },
    { move: '声明三件套', text: '我回老板：观众是谁、看什么、算成功，三项未确认前不进入视觉生产。', result: '很像官方声明，冷静但有效，老板开始补目标。' },
    { move: '截图澄清', text: '我把验收清单和竞品截图并排贴出：一个是阻塞项，一个是建议项。', result: '评论区反转，大家发现这不是顺手改，是变更。' },
    { move: '复盘热搜榜', text: '我把转化没涨拆成曝光、点击、转化三个热搜词条，让数据自己说话。', result: '锅没法直接扣到你头上，但会场突然像数据发布会。' }
  ],
  design: [
    { move: '审美热搜榜', text: '我把“高级”拆成科技、奢华、年轻化三个热搜方向，让对方先投票。', result: '抽象审美被迫变成选择题，客户终于不能只说你懂吧。' },
    { move: '信息层级通报', text: '我发一张“按钮为何埋到第三屏”的情况通报，插图先别背锅。', result: '问题从视觉背锅反转成结构问题，产品开始改原型。' },
    { move: '双版声明', text: '我把昨天版和冲击版并排发出，标题写“关于风格调整的两种口径”。', result: '老板必须选边，漂移空间小了。' },
    { move: '组件截图流出', text: '我贴出 Figma 组件库截图：8px 间距规范从未下线。', result: '像截图流出一样有杀伤力，研发承认没用组件。' },
    { move: '验收反转帖', text: '我把上轮确认截图贴出来：不是没确认，是现在想新增。', result: '反转很清楚，返工开始有了收费口径。' }
  ],
  ops: [
    { move: '故障通报模板', text: '我先发“访问异常恢复中”，再补证书续费和审批链路。', result: '看起来像正式通报，先稳住现场，再拆责任。' },
    { move: '审计截图流出', text: '我贴堡垒机记录：谁执行、谁观察、谁授权，一屏说清。', result: '截图一出，群聊授权那套说法立刻站不住。' },
    { move: '流程声明', text: '我发“白名单加急不等于免工单”的声明，要求负责人确认风险。', result: '客户不爽，但安全边界被看见了。' },
    { move: '演练直播', text: '我提出本周真做一次恢复演练，全程记录，不补虚假旧账。', result: '材料室气氛微妙，但系统日志不会背刺你。' },
    { move: '回滚发布会', text: '我把回滚损失、继续观察损失列成两栏，请业务 owner 当场选择。', result: '现场很像发布会问答，决策终于回到业务。' }
  ],
  civil: [
    { move: '情况通报', text: '我发一版办理依据、协办科室、完成时限的“情况通报”。', result: '口头交办被写成清单，主任不好再让你无限牵头。' },
    { move: '镜头前声明', text: '我用通报口径回应：依法核对材料，告知渠道和期限。', result: '来访人还在拍，但你没有做超权限承诺。' },
    { move: '转办反转', text: '我把职责清单贴出来：首办科室是谁，协助科室是谁。', result: '群里出现反转，对方开始解释转办依据。' },
    { move: '档案声明', text: '我写“关于签收日期缺失的情况说明”，不倒签、不补事实。', result: '不够圆滑，但档案风险被你截住了。' },
    { move: '台账热搜', text: '我把真实台账做成亮点榜：办结、调解、机制改进三条。', result: '材料好看了，但没有脱离真实数据。' }
  ],
  university: [
    { move: '贡献截图流出', text: '我把实验、写作、投稿版本记录整理成“贡献链截图”。', result: '署名讨论从人情回到证据，但老师会觉得你不好糊弄。' },
    { move: '教务通报', text: '我请教务同步课时工作量、助教和备课周期，公开留痕。', result: '加课不再只是多锻炼，工作量开始入账。' },
    { move: '报销声明', text: '我写“用途按合同和发票一致原则说明”，请财务给制度依据。', result: '窗口没那么热闹了，但风险也没落到你身上。' },
    { move: '评分反转帖', text: '我公开评分细则和复核路径：难度反馈可以处理，卷面不能空改。', result: '学生情绪有出口，学院也不好直接暗示改分。' },
    { move: '资源发布会', text: '我把论文、项目、平台资源缺口做成清单，请学院逐项回应。', result: '压力不再只落在你个人身上，支持事项开始变具体。' }
  ],
  stateOwned: [
    { move: '会签通报', text: '我发“前置意见和附件未齐，收到后加急会签”的流程说明。', result: '不是你卡流程，是流程材料没到位。' },
    { move: '底表声明', text: '我把汇报口径和底表口径分开写，下降事实留在数据表。', result: '表面温和，底层真实，后续审计不怕翻。' },
    { move: '采购热搜线', text: '我只转采购规则链接，不替任何供应商说一声。', result: '熟人局冷了下来，但边界非常清楚。' },
    { move: '指标发布会', text: '我把新增指标、资源清单、考核权重做成三栏，当场请负责人确认。', result: '摊派变成资源谈判，会议突然认真了。' },
    { move: '巡视声明', text: '我写“缺失部分以情况说明列明”，不补造不存在的台账。', result: '材料不完美，但真实性保住了。' }
  ],
  privateBiz: [
    { move: '降价声明', text: '我把低价条件写成热搜标题：回款节点、服务范围、增购触发。', result: '老板知道你不是不拼，是不裸奔。' },
    { move: '售后反转帖', text: '我把合同售后条款截图贴出：修复免费，新增另算。', result: '客户的“服务好一点”变成了范围讨论。' },
    { move: '功劳小作文', text: '我补一段复盘小作文：团队配合之外，我负责的方案和数据。', result: '不撕破脸，但你的贡献从空气里浮出来了。' },
    { move: '发薪通报', text: '我请公司明确最晚发薪日期、金额和书面说明。', result: '群里开始安静转账表情，承诺终于有日期。' },
    { move: 'KPI发布会', text: '我把目标翻倍对应的预算、线索、优先级逐项列出来。', result: '热血口号被换算成资源模型。' }
  ],
  selfEmployed: [
    { move: '老客声明', text: '我发“老朋友价对应老朋友范围”：折扣可以，交付次数同步调整。', result: '关系还在，但利润没有被关系吃掉。' },
    { move: '租约通报', text: '我把合同租期和续租条款截图发出：当前不涨，续租另谈。', result: '房东的试探变成正式谈判。' },
    { move: '流量反转帖', text: '我算一张“低价流量真实利润”截图，低于毛利线的单不接。', result: '热闹和挣钱被分开了，账本松了一口气。' },
    { move: '熟人订单声明', text: '我发一句“熟人单也走定金”，尾款发货前结清。', result: '有点不近人情，但现金流活下来了。' },
    { move: '税务截图流出', text: '我把凭证和真实用途逐项对应，不确定的备注说明。', result: '省事路线没了，但抽查时你能讲清楚。' }
  ]
};

const fallbackMoveSet = {
  bad: '直接认领',
  good: '边界反制',
  mid: '暂存观察',
  sharp: '责任切断'
};

function getCareerMove(kind, scenario, idx) {
  const custom = scenario[`${kind}Move`];
  if (custom) return custom;
  const move = careerMoveSets[career] && careerMoveSets[career][kind] && careerMoveSets[career][kind][idx];
  return move || fallbackMoveSet[kind];
}

function inferIntent(text) {
  if (!text) return '🔥施压';
  const t = String(text);
  if (/催|急|马上|立刻|今天|下午|下班前|凌晨|必须拿下/.test(t)) return '💣紧急';
  if (/应该|顺手|多承担|盯|负责|你.*错|你.*问题|别卡|不就|配合/.test(t)) return '🔥施压';
  if (/确认|审批|责任|锅|签字|我.*说|我.*确认|如果.*更|就不会/.test(t)) return '🍳甩锅';
  if (/以后|看好|机会|发展|成长|潜力|赚回来|增购/.test(t)) return '🎨画饼';
  if (/怎么|是不是|吧|你觉得|你看|能不能|如何|怎样|对吗/.test(t)) return '🎭试探';
  return '🔥施压';
}

function getNewsOption(s, idx) {
  const item = careerNewsMoves[career] && careerNewsMoves[career][idx];
  const fallback = { move: '热搜同款', text: '我把现场整理成一条“情况说明”，让所有人当场看清楚边界。', result: '现场有了节目效果，但也增加了后续解释成本。' };
  const news = item || fallback;
  return {
    move: news.move,
    intent: news.intent || '新闻事件同款打法，节目效果强，但人际后坐力也强',
    text: news.text,
    effects: news.effects || { performance: 2, blame: 6, mood: 6, network: -4 },
    result: news.result || fallback.result,
    type: news.type || 'mid',
    news: true,
    heat: news.heat || 2
  };
}

function getDefaultFollowups(speaker, second) {
  const map = {
    wangpm: [
      '我跟客户那边聊过了，人家真的挺着急的。你就先搭个框架出来呗，后面细节慢慢补，这总行吧？',
      '你要是这个态度，我只能找研发总监安排了。到时候影响上线，你负责。'
    ],
    zhaocto: [
      '群里大家都在等，你先表个态？CTO在上面看着呢。',
      '算了，你不接我找别人。不过你最熟这块，后面出问题还是找你。'
    ],
    lilead: [
      '这事你再想想，不是谁都值得我亲自聊的。我是真心看好你。',
      '机会就这一次，明年再想上就不是我说了算了。你考虑清楚。'
    ],
    liuops: [
      '变更单上有你签名，系统日志不会说谎。审批人也要负责吧？',
      '会议纪要要出了，审批责任你自己看着办。这不是我一个人的意思。'
    ],
    client: [
      '这个改动不大的，你先做一版看看效果？有问题再调。',
      '不行的话我们只能换供应商了。你们服务跟不上，后面合作也难说。'
    ],
    boss: [
      '下周就要了，你先给我个方向。不用太细，有个框架就行。',
      '你要做不了，我就找别人了。但你最了解这块，换人成本也高。'
    ],
    chenhr: [
      '这个指标没达成，你这边是不是要复盘一下？看看哪里出了问题。',
      '这次考核结果会进档案，你自己考虑。公司对大家都是公平的。'
    ],
    teacher: [
      '署名的事我再想想。你还年轻，以后机会多，不要计较这一篇。',
      '你要这么较真，那署名我再调整。不过你毕业后的推荐信...'
    ],
    dean: [
      '这门课没人接，你先顶一下。年轻老师多锻炼，学院会看见的。',
      '你要是不接，那今年的课时考核你自己想办法。这不是威胁，是规定。'
    ],
    director: [
      '这个材料你抓紧弄一下，下午给我个结果。不用太复杂，有个样子就行。',
      '领导很重视这个事，别因为你这里卡进度。你先按我说的做。'
    ],
    visitor: [
      '你们就是互相推！今天不给我解决，我就发到网上让大家都看看！',
      '我现在就录像，你们等着上热搜吧！我看你们还敢不敢推！'
    ],
    officePeer: [
      '这个件你们熟一点，转给你们办比较顺。咱们互相帮忙嘛。',
      '我们先转过去了，你们办比较顺。交接单我后面补。'
    ],
    stateLead: [
      '领导等着看，别卡在你这里。你先签一下，后面有问题再补。',
      '领导很重视，别因为你这里耽误进度。前置意见后面补。'
    ],
    supplier: [
      '我们合作这么久，这点忙都不帮？后面还有大项目呢。',
      '你不帮忙打招呼，那我只能找别的关系了。这点小事至于吗？'
    ],
    manager: [
      '审计下周来，材料你补一下。以前应该做过，记录补齐就行。',
      '检查组快来了，这几份台账你补一下。别影响部门考核。'
    ],
    finance: [
      '这几笔支出类目不好分，你就先放办公费，一般没事。',
      '你就按我说的归类，出了事我担着。但你不配合，后面报销就难说了。'
    ],
    acquaintance: [
      '都熟人了，不会差你这点钱。月底一起给你，放心。',
      '下次我给你介绍个大单，这点钱算什么。你先记着，月底一起结。'
    ],
    regularCustomer: [
      '咱们都合作这么久了，这次你就按老朋友价。服务还是照旧。',
      '你要是这个价，我只能找别家了。市场上比你便宜的多的是。'
    ],
    landlord: [
      '附近租金都涨了，我这也是没办法。你就适当加一点。',
      '你不加的话，我后面可能要重新考虑了。这房子想租的人不少。'
    ],
    platformOps: [
      '你先降点利润保流量，后面再调回来。平台现在扶持期。',
      '你不降价，流量入口就给别人了。后面想回来都难。'
    ]
  };
  const texts = map[speaker] || ['你先推进一下，有问题随时沟通。', '你再想想，不着急答复。'];
  return [
    {
      text: texts[0],
      intent: inferIntent(second),
      options: [
        { move: '坚守边界', text: '我的立场说清楚了。要推进的话，请按流程来。', effects: { performance: 8, blame: 0, mood: -3, network: 3 }, result: '对方见你不动摇，开始后退半步。', type: 'good' },
        { move: '让步妥协', text: '好吧，我配合。但下次要提前沟通。', effects: { performance: -5, blame: 10, mood: -5, network: 5 }, result: '你退了半步，对方立刻踩上来。', type: 'bad' },
        { move: '拖延观望', text: '我需要再评估一下，稍后回复你。', effects: { performance: 0, blame: 3, mood: 0, network: 0 }, result: '争取了一点时间，但问题还悬着。', type: 'mid' }
      ]
    },
    {
      text: texts[1],
      intent: '💣威胁',
      options: [
        { move: '正面迎击', text: '好，那我整理好材料，一起向上汇报。', effects: { performance: 10, blame: 0, mood: 5, network: 5 }, result: '对方没想到你敢接招，气势弱了下来。', type: 'good' },
        { move: '认怂了事', text: '不用找领导了，我按你说的做吧。', effects: { performance: -5, blame: 12, mood: -10 }, result: '你认了，但心里的委屈没人看见。', type: 'bad' },
        { move: '保持沉默', text: '（不说话，等对方下一步动作）', effects: { performance: 0, blame: 5, mood: -3, network: -3 }, result: '沉默不是金，对方把你的沉默当默认。', type: 'mid' }
      ]
    }
  ];
}

function buildCareerLevel(s, idx) {
  const risk = s.risk || '高';
  const speaker = s.speaker || 'lilead';
  const loadoutNames = ['极限施压套装', '记忆篡改者', '画饼大师', '紧急轰炸', '甩锅专家', '流程套娃', '阴阳话术', '加班诱导器'];
  const recoveryMap = { '极高': 2, '高': 1 };
  const stanceMap = { '极高': 5, '高': 4 };
  return {
    id: idx + 1,
    title: s.title,
    speaker: speaker,
    scene: { channel: s.channel, risk: risk, brief: s.brief },
    loadout: {
      name: loadoutNames[idx % loadoutNames.length] || '默认出装',
      stanceBonus: stanceMap[risk] || 3,
      recovery: recoveryMap[risk] || 1,
      counterOnBad: true,
      counterBlame: risk === '极高' ? 5 : 3,
      maxRounds: 3
    },
    followups: (s.followups || getDefaultFollowups(speaker, s.second)),
    tools: {
      evidence: s.evidence,
      stall: s.press,
      meme: s.logic
    },
    mind: s.mind,
    intent: inferIntent(s.second),
    messages: [
      { type: 'system', text: s.time || `第 ${idx + 1} 个职场现场` },
      { type: 'other', char: speaker, text: s.first },
      { type: 'other', char: speaker, text: s.second }
    ],
    decode: { text: s.decode, hint: s.hint },
    options: [
      { move: getCareerMove('bad', s, idx), intent: '为了省事直接答应', text: s.trap, effects: { performance: -8, blame: 18, mood: -12, network: 0 }, result: '你把模糊责任接成了明确义务，后面每一步都更难退。', type: 'bad' },
      { move: getCareerMove('good', s, idx), intent: '用记录和边界回应', text: s.correct, effects: { performance: 10, blame: 0, mood: -3, network: 5 }, result: '你把压力转回事实和流程，对方很难继续空口压你。', type: 'good', require: idx >= 4 ? { performance: 50 } : idx >= 3 ? { network: 45 } : idx >= 2 ? { mood: 45 } : undefined },
      { move: getCareerMove('mid', s, idx), intent: '先稳住局面，但边界不够清楚', text: s.mid || '我先了解一下情况，稍后反馈。', effects: { performance: 0, blame: 5, mood: -5, network: 2 }, result: '气氛暂时缓和，但问题还会回来找你。', type: 'mid' },
      { move: getCareerMove('sharp', s, idx), intent: '当场拒绝，爽但容易升级', text: s.sharp || '这不该我负责，别都推给我。', effects: { performance: -3, blame: 5, mood: 5, network: -12 }, result: '你说出了真话，也让场面变得更难收拾。', type: 'bad' },
      getNewsOption(s, idx)
    ]
  };
}
function getActiveLevels() {
  const scenarios = careerScenarios[career];
  return scenarios ? scenarios.map(buildCareerLevel) : levels;
}
function startGame() {
  playSound('click');
  if (!career) return;
  initGame();
  clearSave();
  document.getElementById('career-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  updateStats();
  renderSkills();
  loadLevel(0);
}

function continueGame() {
  const data = loadSave();
  if (!data || !data.career) return;
  career = data.career;
  stats = { ...data.stats };
  currentLevel = data.currentLevel;
  playDeadUsed = data.playDeadUsed;
  newsHeat = data.newsHeat || 0;
  newsCount = data.newsCount || 0;
  audioEnabled = data.audioEnabled !== undefined ? data.audioEnabled : true;
  document.getElementById('audio-toggle').textContent = audioEnabled ? '🔊 音效' : '🔇 音效';
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  updateStats();
  renderSkills();
  loadLevel(currentLevel);
}

function updateStats() {
  const setStat = (id, val) => {
    const el = document.getElementById(id);
    el.textContent = val;
    const color = val >= 60 ? '#07c160' : val >= 30 ? '#ff9800' : '#e64340';
    el.style.color = id === 'st-blame' && val < 30 ? '#999' : id === 'st-net' && val < 30 ? '#999' : color;
  };
  setStat('st-perf', stats.performance);
  setStat('st-blame', stats.blame);
  setStat('st-mood', stats.mood);
  setStat('st-net', stats.network);
}

function renderSkills() {
  const panel = document.getElementById('skill-panel');
  const c = careers[career];
  panel.innerHTML = `<div class="skill-chip" title="${c.skill.name}">${c.skill.name}</div>`;
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function shuffleOptions(options) {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
function normalizeStats() {
  stats.performance = clamp(stats.performance, 0, 100);
  stats.blame = clamp(stats.blame, 0, 100);
  stats.mood = clamp(stats.mood, 0, 100);
  stats.network = clamp(stats.network, 0, 100);
}
function riskStance(risk) {
  if (risk === '极高') return 18;
  if (risk === '高') return 14;
  return 11;
}
function initDuel(level) {
  const baseStance = riskStance(level.scene && level.scene.risk);
  const lo = level.loadout || {};
  currentLoadout = lo;
  const bonus = lo.stanceBonus || 0;
  duelState = { stance: baseStance + bonus, maxStance: baseStance + bonus, focus: 0, maxFocus: 6, combo: 0 };
  const char = characters[level.speaker] || characters.lilead;
  const nameEl = document.getElementById('duel-opponent-name');
  const loadoutTag = lo.name ? ` [${lo.name}]` : '';
  if (nameEl) nameEl.textContent = `${char.name}${loadoutTag}`;
  const vsBadge = document.getElementById('duel-vs-badge');
  if (vsBadge) { vsBadge.textContent = '交锋'; vsBadge.classList.remove('combo-active'); }
  updateDuelDisplay();
}
function pulseMeter(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
}
function updateDuelDisplay() {
  const stancePct = duelState.maxStance ? (duelState.stance / duelState.maxStance) * 100 : 0;
  const focusPct = duelState.maxFocus ? (duelState.focus / duelState.maxFocus) * 100 : 0;
  const stanceFill = document.getElementById('opponent-stance-fill');
  const focusFill = document.getElementById('player-focus-fill');
  if (stanceFill) { stanceFill.style.width = `${clamp(stancePct, 0, 100)}%`; stanceFill.classList.toggle('danger', stancePct < 30); }
  if (focusFill) { focusFill.style.width = `${clamp(focusPct, 0, 100)}%`; focusFill.classList.toggle('danger', focusPct < 30); }
  const stanceNum = document.getElementById('opponent-stance-num');
  const focusNum = document.getElementById('player-focus-num');
  if (stanceNum) stanceNum.textContent = `${Math.max(0, duelState.stance)}`;
  if (focusNum) focusNum.textContent = `${duelState.focus}`;
  const vsBadge = document.getElementById('duel-vs-badge');
  if (vsBadge) {
    vsBadge.textContent = duelState.combo > 1 ? `${duelState.combo}HIT` : '交锋';
    vsBadge.classList.toggle('combo-active', duelState.combo > 1);
  }
}
function triggerImpact(kind, label, amount = 0) {
  const layer = document.getElementById('duel-impact-layer');
  if (layer) {
    const pop = document.createElement('div');
    pop.className = `floating-impact ${kind}`;
    pop.textContent = amount > 0 ? `${label} -${amount}` : label;
    layer.appendChild(pop);
    setTimeout(() => pop.remove(), 900);
  }
  // 容器震动
  const shell = document.getElementById('game-container');
  if (shell && kind !== 'good') {
    shell.classList.remove('screen-shake');
    void shell.offsetWidth;
    shell.classList.add('screen-shake');
  }
}
function showRoundAnnounce(text) {
  const arena = document.getElementById('duel-arena');
  if (!arena) return;
  const el = document.createElement('div');
  el.id = 'round-announce';
  el.textContent = text;
  arena.appendChild(el);
  setTimeout(() => el.remove(), 1900);
}
function showKO() {
  const shell = document.getElementById('game-container');
  if (shell) { shell.classList.add('fight-ko'); setTimeout(() => shell.classList.remove('fight-ko'), 700); }
  const vsBadge = document.getElementById('duel-vs-badge');
  if (vsBadge) { vsBadge.textContent = 'KO'; vsBadge.classList.add('combo-active'); }
  showRoundAnnounce('K.O.!');
}
function getRoundMultiplier(round) {
  if (round === 0) return 1;
  if (round === 1) return 1.2;
  return 1.5;
}
function scaleEffects(eff, mult) {
  const scaled = {};
  if (eff.performance) scaled.performance = Math.round(eff.performance * mult);
  if (eff.blame) scaled.blame = Math.round(eff.blame * mult);
  if (eff.mood) scaled.mood = Math.round(eff.mood * mult);
  if (eff.network) scaled.network = Math.round(eff.network * mult);
  return scaled;
}
function applyNpcCounter(optType) {
  const lo = currentLoadout;
  if (!lo || !lo.counterOnBad || optType !== 'bad') return;
  const counterBlame = lo.counterBlame || 3;
  stats.blame = clamp(stats.blame + counterBlame, 0, 100);
  updateStats();
}
function npcRecovery() {
  const lo = currentLoadout;
  if (!lo || !lo.recovery || duelState.stance <= 0) return;
  duelState.stance = clamp(duelState.stance + lo.recovery, 0, duelState.maxStance);
  updateDuelDisplay();
}
function finishLevel() {
  currentRound = 0;
  levelRoundEffects = { performance: 0, blame: 0, mood: 0, network: 0 };
  document.getElementById('wx-next-btn').classList.remove('hidden');
}
function startNextRound(level) {
  currentRound++;
  const lo = level.loadout || {};
  const maxRounds = lo.maxRounds || 3;
  if (currentRound >= maxRounds) {
    // 达到最大轮次，强制结算
    const chat = document.getElementById('wx-chat');
    const sysDiv = document.createElement('div');
    sysDiv.className = 'wx-system-msg';
    sysDiv.innerHTML = '<span>⏱ 对话结束</span>';
    chat.appendChild(sysDiv);
    chat.scrollTop = chat.scrollHeight;
    finishLevel();
    return;
  }
  answered = false;
  decoded = false;
  usedTools = {};
  lastToolUsed = null;
  predictCooldown = false;

  const chat = document.getElementById('wx-chat');
  const roundDiv = document.createElement('div');
  roundDiv.className = 'wx-system-msg';
  roundDiv.innerHTML = `<span>⚔ 第 ${currentRound + 1} 轮 · ${lo.name || '交锋'}</span>`;
  chat.appendChild(roundDiv);

  // NPC 恢复气势
  npcRecovery();

  // 轮次公告动画
  showRoundAnnounce(`ROUND ${currentRound + 1}`);

  // 发送 followup 消息
  const followups = level.followups || [];
  const fu = followups[currentRound - 1];
  if (fu) {
    const cdata = characters[level.speaker] || characters.lilead;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    const intentTag = (!isNewGamePlus && fu.intent)
      ? `<span style="font-size:11px;color:#d48806;margin-left:6px">${fu.intent}</span>` : '';
    typingDiv.innerHTML = `${renderAvatar(level.speaker)}<div style="display:flex;flex-direction:column;gap:3px"><div class="typing-dots"><span></span><span></span><span></span></div><div class="typing-text">${cdata.name} 正在输入…${intentTag}</div></div>`;
    chat.appendChild(typingDiv);
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
      typingDiv.remove();
      const row = document.createElement('div'); row.className = 'wx-msg-row';
      row.innerHTML = `${renderAvatar(level.speaker)}<div class="wx-bubble other">${fu.text}</div>`;
      chat.appendChild(row);
      chat.scrollTop = chat.scrollHeight;
      startReasoningPhase();
      setLevelControlsEnabled(true);
    }, 1200);
  } else {
    startReasoningPhase();
    setLevelControlsEnabled(true);
  }

  // 更新决斗区标题
  const nameEl = document.getElementById('duel-opponent-name');
  const char = characters[level.speaker] || characters.lilead;
  const loadoutTag = lo.name ? ` [${lo.name}]` : '';
  if (nameEl) nameEl.textContent = `${char.name} · ${level.title}${loadoutTag} · 第${currentRound + 1}轮`;

  // 使用 followup 自己的选项（不是第一轮的）
  const roundOpts = fu.options || level.options;
  const optsArea = document.getElementById('wx-options');
  optsArea.innerHTML = '';
  let allOpts = [...roundOpts];
  if (skills.taichi) {
    allOpts.push({
      move: '太极转场',
      intent: '把争议拉到流程/审计层面',
      text: '[太极] 这件事涉及多个环节，建议按流程拆分责任，或请审计介入。',
      effects: { performance: 8, blame: -5, mood: 0, network: 3 },
      result: '你把皮球踢回流程，对方被迫按规矩来。',
      type: 'good'
    });
  }
  allOpts = shuffleOptions(allOpts).slice(0, 4);
  currentOptions = allOpts;

  allOpts.forEach((opt, i) => {
    const btn = document.createElement('button');
    const locked = !meetsRequirement(opt.require);
    btn.className = locked ? 'wx-option locked' : 'wx-option';
    btn.innerHTML = renderOptionCard(opt);
    if (locked) {
      btn.onclick = () => {
        playSound('click');
        const chat2 = document.getElementById('wx-chat');
        const tip = document.createElement('div');
        tip.className = 'wx-system-msg';
        tip.innerHTML = `<span>🔒 属性不足：${getLockHint(opt.require)}</span>`;
        chat2.appendChild(tip);
        chat2.scrollTop = chat2.scrollHeight;
      };
    } else {
      btn.onclick = () => selectOption(i, allOpts);
    }
    optsArea.appendChild(btn);
  });

  // 装死按钮（多轮中仍可用，如果次数未满）
  const playDeadCharges = hasRelicEffect('blameReduction') ? 2 : 1;
  if (skills.playdead && playDeadUsed < playDeadCharges) {
    const pdBtn = document.createElement('button');
    pdBtn.className = 'wx-option';
    pdBtn.style.cssText = 'background:#f0f0ff;border-color:#7c4dff;color:#7c4dff;';
    const remaining = playDeadCharges - (playDeadUsed || 0);
    pdBtn.textContent = `🎭 装死（剩余${remaining}次）`;
    pdBtn.onclick = () => playDead(pdBtn);
    optsArea.appendChild(pdBtn);
  }

  setLevelControlsEnabled(false);
}

function playTacticCard({ damage = 0, focus = 0, label = '命中', kind = 'good' }) {
  duelState.stance = clamp(duelState.stance - damage, 0, duelState.maxStance);
  duelState.focus = clamp(duelState.focus + focus, 0, duelState.maxFocus);
  duelState.combo += 1;
  updateDuelDisplay();
  pulseMeter(damage > 0 ? 'opponent-stance-fill' : 'player-focus-fill');
  triggerImpact(kind, label, damage);
  if (duelState.stance <= 0 && damage > 0) {
    showKO();
    playSound('break');
  } else {
    playSound(kind === 'bad' ? 'counter' : 'hit');
  }
  refreshOptionCards();
}
function getOptionCardStats(opt) {
  const baseAttack = opt.type === 'good' ? 5 : opt.type === 'mid' ? 3 : 2;
  const attack = baseAttack + Math.floor(duelState.focus / 2);
  const guard = Math.max(0, (opt.effects.blame || 0) < 1 ? 2 : opt.type === 'mid' ? 1 : 0);
  return { attack, guard };
}
function renderOptionCard(opt) {
  const locked = !meetsRequirement(opt.require);
  const lockHint = locked ? `<span class="lock-hint"> 🔒${getLockHint(opt.require)}</span>` : '';
  return `<span class="wx-option-text">${escapeHtml(opt.move || opt.text)}</span>${lockHint}`;
}
function refreshOptionCards() {
  if (answered) return;
  document.querySelectorAll('#wx-options .wx-option').forEach((btn, i) => {
    if (!currentOptions[i]) return;
    btn.innerHTML = renderOptionCard(currentOptions[i]);
  });
}
function sceneColor(risk) {
  if (risk === '极高') return { color: '#e64340', bg: '#fff1f0' };
  if (risk === '高') return { color: '#fa8c16', bg: '#fff7e6' };
  return { color: '#07c160', bg: '#f0fff0' };
}
function renderSceneCard(scene) {
  const tone = sceneColor(scene.risk);
  return `<div class="scene-card" style="--scene-color:${tone.color}">${escapeHtml(scene.channel)} · 风险${escapeHtml(scene.risk)}</div>`;
}
function getDecodeCost() {
  return skills.literature ? 5 : 10;
}
function getDecodeButtonText() {
  return `🔮 潜台词解码 (-${getDecodeCost()}心情)`;
}
function renderPremonition(level) {
  return `Deadline预感：别急着表态。先抓关键词，再用证据或追问确认边界。${level.decode.hint}`;
}
function setLevelControlsEnabled(enabled) {
  document.querySelectorAll('#wx-options .wx-option').forEach(btn => { btn.disabled = !enabled; });
}
function addSelfMessage(text) {
  const chat = document.getElementById('wx-chat');
  const row = document.createElement('div');
  row.className = 'wx-msg-row self';
  row.innerHTML = `<div class="wx-bubble self">${escapeHtml(text)}</div>${renderAvatar('player')}`;
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}
function addToolBubble(title, text) {
  const chat = document.getElementById('wx-chat');
  const div = document.createElement('div');
  div.className = 'wx-tool-bubble';
  div.textContent = `${title} · ${text}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
function applyNewsLinkage(opt) {
  const heat = opt.heat || 1;
  newsCount += 1;
  newsHeat = clamp(newsHeat + heat, 0, 10);
  const networkCost = newsHeat >= 6 ? 2 : 1;
  stats.network = clamp(stats.network - networkCost, 0, 100);
  updateStats();
}
function useTool(type) {
  if (answered || usedTools[type]) return;
  const level = getActiveLevels()[currentLevel];
  const text = level.tools && level.tools[type];
  if (!text) return;

  usedTools[type] = true;

  // 检测连携
  const combo = checkCombo(type);
  if (combo) showComboEffect(combo);

  if (type === 'evidence') {
    let damage = 3 + getRelicEffect('evidenceBonus');
    if (combo && combo.bonusDamage) damage += combo.bonusDamage;
    addToolBubble('📁 证据袋', text);
    playTacticCard({ damage, focus: 1, label: combo ? combo.name : '证据压制', kind: 'good' });
  } else if (type === 'stall') {
    let damage = 2;
    if (combo && combo.bonusStance) {
      duelState.stance = clamp(duelState.stance - combo.bonusStance, 0, duelState.maxStance);
    }
    addSelfMessage('等一下，刚才这句话具体指什么？');
    addToolBubble('❓ 追问', text);
    playTacticCard({ damage, focus: 1, label: combo ? combo.name : '追问破绽', kind: 'mid' });
  } else if (type === 'meme') {
    let moodGain = 1;
    if (combo && combo.bonusMood) moodGain += combo.bonusMood;
    stats.mood += moodGain;
    normalizeStats();
    addToolBubble('🧩 整理逻辑', `${text}（心情 +${moodGain}）`);
    updateStats();
    playTacticCard({ damage: 1, focus: 2, label: combo ? combo.name : '蓄力', kind: 'good' });
  }
  lastToolUsed = type;
  setLevelControlsEnabled(true);
}

function loadLevel(idx) {
  const activeLevels = getActiveLevels();
  if (idx >= activeLevels.length) { startBossBattle(); return; }
  if (stats.blame >= 100) { showGameOver('背锅值爆表，被优化了'); return; }
  if (stats.mood <= 0) { showGameOver('心情归零，裸辞了'); return; }

  currentLevel = idx;
  const level = activeLevels[idx];
  currentRound = 0;
  levelRoundEffects = { performance: 0, blame: 0, mood: 0, network: 0 };
  answered = false;
  usedTools = {};
  playDeadUsed = false;
  lastToolUsed = null;
  initDuel(level);

  // 格斗开始公告
  showRoundAnnounce('FIGHT!');

  // 更新微信标题
  const char = characters[level.speaker] || characters.lilead;
  document.getElementById('wx-header-title').textContent = char.name;

  // 清空聊天
  const chat = document.getElementById('wx-chat');
  chat.innerHTML = '';

  // 系统提示
  const sysDiv = document.createElement('div');
  sysDiv.className = 'wx-system-msg';
  sysDiv.innerHTML = `<span>第 ${level.id} 关 · ${level.title}</span>`;
  chat.appendChild(sysDiv);

  // 场景卡
  if (level.scene) {
    chat.insertAdjacentHTML('beforeend', renderSceneCard(level.scene));
  }

  // 心理提示（二周目不显示）
  if (level.mind && !isNewGamePlus) {
    const mindDiv = document.createElement('div');
    mindDiv.className = 'mind-bubble';
    mindDiv.textContent = level.mind;
    chat.appendChild(mindDiv);
  }

  // 逐条添加消息
  let msgIdx = 0;
  let typingTimer = null;
  function clearTyping() {
    if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
    document.querySelectorAll('.typing-indicator, .predict-btn, .predict-hint').forEach(el => el.remove());
  }
  function showTypingIndicator(msg) {
    const cdata = characters[msg.char] || characters.lilead;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    const intentTag = (!isNewGamePlus && level.intent)
      ? `<span style="font-size:11px;color:#d48806;margin-left:6px">${level.intent}</span>` : '';
    typingDiv.innerHTML = `${renderAvatar(msg.char)}<div style="display:flex;flex-direction:column;gap:3px"><div class="typing-dots"><span></span><span></span><span></span></div><div class="typing-text">${cdata.name} 正在输入…${intentTag}</div></div>`;
    chat.appendChild(typingDiv);
    chat.scrollTop = chat.scrollHeight;

    // 预判按钮
    if (!predictCooldown) {
      const hint = document.createElement('div');
      hint.className = 'predict-hint';
      hint.textContent = `预判成功率 ${Math.round(getPredictSuccessRate() * 100)}%`;
      chat.appendChild(hint);

      const btn = document.createElement('button');
      btn.className = 'predict-btn';
      btn.innerHTML = '👀 预判意图';
      btn.onclick = () => {
        predictIntent();
        btn.disabled = true;
      };
      chat.appendChild(btn);
      chat.scrollTop = chat.scrollHeight;
    }
  }
  function addNextMsg() {
    clearTyping();
    if (msgIdx >= level.messages.length) {
      predictCooldown = false;
      setLevelControlsEnabled(true);
      startReasoningPhase();
      return;
    }
    const msg = level.messages[msgIdx];
    if (msg.type === 'other') {
      // 对方消息前显示"正在输入"
      showTypingIndicator(msg);
      typingTimer = setTimeout(() => {
        clearTyping();
        const row = document.createElement('div'); row.className = 'wx-msg-row';
        const cdata = characters[msg.char] || characters.lilead;
        row.innerHTML = `${renderAvatar(msg.char)}<div class="wx-bubble other">${msg.text}</div>`;
        chat.appendChild(row);
        chat.scrollTop = chat.scrollHeight;
        msgIdx++;
        setTimeout(addNextMsg, 350);
      }, 1200);
      return;
    }
    msgIdx++;
    if (msg.type === 'system') {
      const div = document.createElement('div'); div.className = 'wx-time'; div.textContent = msg.text; chat.appendChild(div);
    } else if (msg.type === 'self') {
      const row = document.createElement('div'); row.className = 'wx-msg-row self';
      row.innerHTML = `<div class="wx-bubble self">${msg.text}</div>${renderAvatar('player')}`;
      chat.appendChild(row);
    }
    chat.scrollTop = chat.scrollHeight;
    setTimeout(addNextMsg, 350);
  }
  addNextMsg();

  // 选项
  const optsArea = document.getElementById('wx-options');
  optsArea.innerHTML = '';

  let allOpts = [...level.options];
  if (skills.taichi) {
    allOpts.push({
      move: '太极转场',
      intent: '把争议拉到流程/审计层面',
      text: '[太极] 这件事涉及多个环节，建议按流程拆分责任，或请审计介入。',
      effects: { performance: 8, blame: -5, mood: 0, network: 3 },
      result: '你把皮球踢回流程，对方被迫按规矩来。',
      type: 'good'
    });
  }
  allOpts = shuffleOptions(allOpts).slice(0, 4);
  currentOptions = allOpts;

  allOpts.forEach((opt, i) => {
    const btn = document.createElement('button');
    const locked = !meetsRequirement(opt.require);
    btn.className = locked ? 'wx-option locked' : 'wx-option';
    btn.innerHTML = renderOptionCard(opt);
    if (locked) {
      btn.onclick = () => {
        playSound('click');
        const chat = document.getElementById('wx-chat');
        const tip = document.createElement('div');
        tip.className = 'wx-system-msg';
        tip.innerHTML = `<span>🔒 属性不足：${getLockHint(opt.require)}</span>`;
        chat.appendChild(tip);
        chat.scrollTop = chat.scrollHeight;
      };
    } else {
      btn.onclick = () => selectOption(i, allOpts);
    }
    optsArea.appendChild(btn);
  });

  const playDeadCharges = hasRelicEffect('blameReduction') ? 2 : 1;
  if (skills.playdead && playDeadUsed < playDeadCharges) {
    const pdBtn = document.createElement('button');
    pdBtn.className = 'wx-option';
    pdBtn.style.cssText = 'background:#f0f0ff;border-color:#7c4dff;color:#7c4dff;';
    const remaining = playDeadCharges - (playDeadUsed || 0);
    pdBtn.textContent = `🎭 装死（剩余${remaining}次）`;
    pdBtn.onclick = () => playDead(pdBtn);
    optsArea.appendChild(pdBtn);
  }

  setLevelControlsEnabled(false);
  document.getElementById('wx-next-btn').classList.add('hidden');
}

function playDead(btn) {
  if (answered) return;
  answered = true; playDeadUsed = (playDeadUsed || 0) + 1;
  clearInterval(timer);
  playSound('decode');

  document.querySelectorAll('.wx-option').forEach(b => b.disabled = true);

  const chat = document.getElementById('wx-chat');
  const selfRow = document.createElement('div'); selfRow.className = 'wx-msg-row self';
  selfRow.innerHTML = `<div class="wx-bubble self">对方正在输入...</div>${renderAvatar('player')}`;
  chat.appendChild(selfRow);
  chat.scrollTop = chat.scrollHeight;

  setTimeout(() => {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-bubble';
    resultDiv.textContent = '不表态就是最好的表态。';
    chat.appendChild(resultDiv);
    chat.scrollTop = chat.scrollHeight;
    // 多轮对话：装死直接结束本关
    const sysDiv = document.createElement('div');
    sysDiv.className = 'wx-system-msg';
    sysDiv.innerHTML = '<span>💨 对方见你不回应，放弃了</span>';
    chat.appendChild(sysDiv);
    chat.scrollTop = chat.scrollHeight;
    saveGame();
    finishLevel();
  }, 600);
}

function startReasoningPhase() {
  if (timer) clearInterval(timer);
  timer = null;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const label = document.getElementById('wx-timer-text');
  const num = document.getElementById('wx-timer-num');
  const bar = document.getElementById('wx-timer-bar');
  label.textContent = '🔎 推理阶段';
  num.textContent = '∞';
  num.className = 'timer-ok';
  bar.style.width = '100%';
  bar.style.background = '#07c160';
}

function decodeAir() {
  const cost = getDecodeCost();
  if (decoded || answered || stats.mood < cost) return;
  decoded = true; stats.mood -= cost; updateStats(); playSound('decode');
  const level = getActiveLevels()[currentLevel];
  const container = document.createElement('div');
  container.className = 'wx-decode-bubble';
  container.innerHTML = `<em>${level.decode.text}</em> · ${level.decode.hint}`;
  document.getElementById('wx-chat').appendChild(container);
  document.getElementById('wx-chat').scrollTop = document.getElementById('wx-chat').scrollHeight;
  document.getElementById('wx-decode-btn').disabled = true;
  document.getElementById('wx-decode-btn').textContent = '🔮 已解码';
}

function selectOption(idx, optList) {
  if (answered) return;
  answered = true; clearInterval(timer);
  const opt = optList[idx];
  const card = getOptionCardStats(opt);
  const hitKind = opt.type === 'good' ? 'good' : opt.type === 'mid' ? 'mid' : 'bad';
  const hitLabel = opt.type === 'good' ? '破防' : opt.type === 'mid' ? '格挡' : '反击';
  const damage = opt.type === 'bad' ? 1 : card.attack;
  playTacticCard({
    damage: damage,
    focus: opt.type === 'good' ? 1 : 0,
    label: hitLabel,
    kind: hitKind
  });
  let eff = { ...opt.effects };
  // 职业技能
  if (skills.papertrail && eff.blame > 0) eff.blame = Math.floor(eff.blame * 0.7);
  if (skills.countersign && eff.blame > 0) eff.blame = Math.max(0, eff.blame - 5);
  if (skills.cashflow && eff.mood < 0) eff.mood = Math.ceil(eff.mood * 0.5);
  if (skills.kpi && opt.type === 'good') eff.performance = (eff.performance || 0) + 5;
  if (skills.procedure && /流程|审批|确认|范围|边界|变更/.test(`${opt.intent}${opt.text}`)) {
    eff.blame = (eff.blame || 0) - 3;
    eff.network = (eff.network || 0) + 3;
  }
  // 遗物效果
  if (hasRelicEffect('blameReduction') && eff.blame > 0) eff.blame = Math.floor(eff.blame * getRelicEffect('blameReduction'));
  if (hasRelicEffect('perfBonus') && eff.performance > 0) eff.performance = (eff.performance || 0) + getRelicEffect('perfBonus');
  if (hasRelicEffect('netBonus')) {
    if (eff.network > 0) eff.network = (eff.network || 0) + getRelicEffect('netBonus');
    if (eff.network < 0) eff.network = Math.ceil(eff.network * 0.5);
  }

  if (eff.performance) stats.performance += eff.performance;
  if (eff.blame) stats.blame += eff.blame;
  if (eff.mood) stats.mood += eff.mood;
  if (eff.network) stats.network += eff.network;
  stats.performance = clamp(stats.performance, 0, 100);
  stats.blame = clamp(stats.blame, 0, 100);
  stats.mood = clamp(stats.mood, 0, 100);
  stats.network = clamp(stats.network, 0, 100);
  updateStats();
  playSound(opt.type === 'good' ? 'good' : opt.type === 'bad' ? 'bad' : 'click');

  // 累积本关效果
  if (levelRoundEffects) {
    if (eff.performance) levelRoundEffects.performance += eff.performance;
    if (eff.blame) levelRoundEffects.blame += eff.blame;
    if (eff.mood) levelRoundEffects.mood += eff.mood;
    if (eff.network) levelRoundEffects.network += eff.network;
  }

  const buttons = document.querySelectorAll('.wx-option');
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === idx && !isNewGamePlus) btn.classList.add(opt.type);
  });
  const chat = document.getElementById('wx-chat');
  const selfRow = document.createElement('div'); selfRow.className = 'wx-msg-row self';
  selfRow.innerHTML = `<div class="wx-bubble self">${opt.text.replace(/【.*?】/g, '')}</div>${renderAvatar('player')}`;
  chat.appendChild(selfRow);

  // 极简反馈：只显示结果描述
  const resultDiv = document.createElement('div');
  resultDiv.className = 'result-bubble';
  resultDiv.textContent = opt.result;
  chat.appendChild(resultDiv);

  // NPC羁绊更新（静默，不显示）
  const level = getActiveLevels()[currentLevel];
  if (level && level.speaker) updateNpcFavor(level.speaker, opt.type);

  // NPC 反击（静默）
  applyNpcCounter(opt.type);

  // 热搜联动（静默）
  if (opt.news) applyNewsLinkage(opt);
  chat.scrollTop = chat.scrollHeight;

  // 多轮判断：对方气势还在，继续下一轮
  if (duelState.stance > 0) {
    setTimeout(() => {
      startNextRound(level);
    }, 900);
  } else {
    // NPC 被打败
    const breakDiv = document.createElement('div');
    breakDiv.className = 'wx-system-msg';
    breakDiv.innerHTML = '<span>💥 对方气势耗尽，对话结束</span>';
    chat.appendChild(breakDiv);
    chat.scrollTop = chat.scrollHeight;
    finishLevel();
  }
  saveGame();
}

function nextLevel() { playSound('click'); loadLevel(currentLevel + 1); }

// ============ Boss战 ============
const bossRounds = [
  { speaker: 'chenhr', text: '请先自我介绍，重点讲今年产出。', decode: '她在测试你会不会"谦虚"。过度谦虚=没价值，过度吹嘘=不靠谱。', options: [
    { text: '主要负责日常需求和bug修复。', score: 1, result: '太谦虚。HR记录："无突出产出"。' },
    { text: '主导3个核心项目，带来200万收入，数据见附件。', score: 3, result: '有数据有附件。HR点头记录。' },
    { text: '主要是团队努力，我做了点微小工作。', score: 0, result: 'HR微笑：又一个可被优化的。' },
    { text: '完成领导交办的各项任务，服从安排。', score: 1, result: 'HR记录："缺乏主动性"。' }
  ]},
  { speaker: 'lilead', text: '如果带5人小组，你怎么管理？', decode: '她在试探你有没有"被压榨的觉悟"。说"以身作则加班"=适合当韭菜。', options: [
    { text: '以身作则，带头加班。', score: 1, result: '组长微笑：又一个自燃型。' },
    { text: '明确目标、合理分工、定期复盘，关注成长。', score: 3, result: '有方法论。组长心里打勾。' },
    { text: '我没带过团队，需要先学习。', score: 2, result: '诚实但扣分。职场不奖励诚实。' },
    { text: '先把绩效差的优化掉。', score: 0, result: 'HR和组长交换眼神：此人危险。' }
  ]},
  { speaker: 'wangpm', text: '你和产品配合怎么样？有冲突吗？', decode: '产品在挖坑。说"配合很好"=没独立思考；说"经常冲突"=你难搞。', options: [
    { text: '配合一直很好，产品都很专业。', score: 1, result: '产品点头，但HR觉得你在敷衍。' },
    { text: '偶尔有分歧，但都通过流程解决了，目标一致。', score: 3, result: '成熟回答。承认分歧，强调结果。' },
    { text: '有些需求不合理，我一般直接怼回去。', score: 0, result: '产品脸色变了。HR打叉。' },
    { text: '我不太和产品打交道，专注技术。', score: 1, result: 'HR记录："缺乏跨部门沟通"。' }
  ]},
  { speaker: 'zhaocto', text: '公司正在组织优化，你怎么看岗位调整？', decode: '裁员信号。CTO在试探你的服从度。说"理解公司"=容易被调。', options: [
    { text: '我理解公司，服从组织安排。', score: 1, result: 'CTO点头：又一个不会反抗的。' },
    { text: '希望深耕现有岗位，但合理范围内愿意配合。', score: 3, result: '"合理范围"是关键。有底线，也有弹性。' },
    { text: '不接受调岗，不在合同范围内。', score: 0, result: 'CTO微笑：此人已上优化名单。' },
    { text: '如果调岗能带来成长，可以考虑。', score: 2, result: 'CTO觉得你有野心，可能不稳定。' }
  ]},
  { speaker: 'chenhr', text: '你对明年的绩效目标有什么期待？', decode: '最后一个陷阱。说"3.75"=野心太大；说"3.5"=不上进。', options: [
    { text: '希望冲击3.75，我相信自己实力。', score: 2, result: 'HR记录：有野心。完不成会反噬。' },
    { text: '3.5就好，稳定发挥，不给团队拖后腿。', score: 1, result: 'HR记录：缺乏进取心。' },
    { text: '目标是3.75，但团队需要时我以团队优先。', score: 3, result: '完美。有目标，有团队意识。' },
    { text: '没什么期待，做好本职就行。', score: 0, result: 'HR合上笔记本：适合优化。' }
  ]}
];

const careerBossProfiles = {
  dev: { title: 'BOSS战：技术述职', subtitle: '代码之外的责任边界', speaker: 'zhaocto', reviewer: '技术委员会', work: '系统交付', metric: '稳定性和故障处理', boundary: '发布、变更和 owner 边界' },
  pm: { title: 'BOSS战：产品复盘', subtitle: '需求价值和范围管理', speaker: 'boss', reviewer: '业务评审会', work: '产品迭代', metric: '转化、留存和交付节奏', boundary: '需求范围、验收和数据归因' },
  design: { title: 'BOSS战：设计评审', subtitle: '审美背后的决策证据', speaker: 'client', reviewer: '品牌评审会', work: '设计交付', metric: '一致性、验收效率和返工率', boundary: '风格基准、确认记录和修改轮次' },
  ops: { title: 'BOSS战：事故问责会', subtitle: '稳定性不是一个人的锅', speaker: 'zhaocto', reviewer: '技术复盘会', work: '系统保障', metric: '可用性、恢复速度和审计记录', boundary: '监控、操作、审批和业务决策边界' },
  civil: { title: 'BOSS战：年度考核谈话', subtitle: '程序合规和群众工作', speaker: 'director', reviewer: '考核组', work: '依法办理', metric: '办件质量、程序规范和群众沟通', boundary: '职责依据、办理期限和档案真实性' },
  university: { title: 'BOSS战：聘期考核', subtitle: '论文、课题和教学三线拉扯', speaker: 'dean', reviewer: '学院考核会', work: '科研教学', metric: '论文、项目、课程和学生反馈', boundary: '署名贡献、资源承诺和评分规则' },
  stateOwned: { title: 'BOSS战：年终述职', subtitle: '指标、合规和会签留痕', speaker: 'stateLead', reviewer: '经营班子会', work: '经营支撑', metric: '指标完成、合规风险和协同效率', boundary: '会签、采购、数据口径和检查材料' },
  privateBiz: { title: 'BOSS战：绩效复盘', subtitle: '增长、回款和资源交换', speaker: 'boss', reviewer: '老板办公会', work: '业务增长', metric: '利润、回款、客户和 KPI', boundary: '报价、交付范围和资源匹配' },
  selfEmployed: { title: 'BOSS战：年底算账', subtitle: '现金流比面子重要', speaker: 'ledger', reviewer: '自己的账本', work: '小生意经营', metric: '现金流、利润率和复购', boundary: '合同、定金、服务范围和真实票据' }
};

function buildBossRounds(profile) {
  return [
    { speaker: profile.speaker, text: `${profile.reviewer}要你总结今年${profile.work}最大的成果。`, decode: `别只说辛苦。要把${profile.metric}讲成可验证的结果。`, options: [
      { text: `我主要做了很多日常${profile.work}工作。`, score: 1, result: '太虚。听起来像没有沉淀。' },
      { text: `我用三组数据说明${profile.metric}的改善，并附关键证据。`, score: 3, result: '有结果、有证据、有口径。对方很难挑刺。' },
      { text: '主要都是团队努力，我只是配合。', score: 0, result: '过度谦虚，等于把价值让出去。' },
      { text: '我今年非常不容易，大家都看得到。', score: 1, result: '情绪是真的，但考核只认证据。' }
    ]},
    { speaker: profile.speaker, text: `如果明年继续压${profile.metric}，你需要什么条件？`, decode: `这是资源谈判题。只表忠心会变成无条件加码。`, options: [
      { text: '我会尽最大努力，不提条件。', score: 1, result: '态度好，但等于默认资源不变。' },
      { text: `目标可以提高，但需要同步${profile.boundary}、资源和优先级。`, score: 3, result: '把目标和资源绑定，守住边界。' },
      { text: '资源不给就做不了。', score: 1, result: '话没错，但太硬，容易被贴不配合标签。' },
      { text: '看领导安排，我服从。', score: 0, result: '服从过头，后面很难再谈条件。' }
    ]},
    { speaker: profile.speaker, text: `今年${profile.boundary}上有没有值得复盘的问题？`, decode: `这是甩锅题。不能全认，也不能全推。`, options: [
      { text: '主要是外部原因，我这边没什么问题。', score: 0, result: '听起来像逃避复盘。' },
      { text: `有问题，但我按事实拆成${profile.boundary}，逐项给改进动作。`, score: 3, result: '承认问题，但不乱接锅。' },
      { text: '都是我没做好，我负责。', score: 1, result: '态度满分，责任爆炸。' },
      { text: '这个不好说，情况比较复杂。', score: 1, result: '模糊回答会让别人替你下结论。' }
    ]},
    { speaker: profile.speaker, text: `别人评价你“边界感太强”，你怎么看？`, decode: `这是人格化陷阱。要把边界讲成组织效率，不是个人计较。`, options: [
      { text: '我就是不喜欢别人占我便宜。', score: 0, result: '真实，但会被理解成难协作。' },
      { text: `边界不是推事，是为了让${profile.work}有 owner、有记录、可复盘。`, score: 3, result: '把个人边界升格成组织方法。' },
      { text: '以后我会尽量少提边界。', score: 1, result: '你把护城河自己拆了。' },
      { text: '大家误会我了。', score: 1, result: '解释太软，没讲出方法。' }
    ]},
    { speaker: profile.speaker, text: `最后，明年你准备怎么提升${profile.work}？`, decode: `结尾题要有目标、有动作、有交换条件。`, options: [
      { text: '继续努力，争取更好。', score: 1, result: '正确但空。' },
      { text: `围绕${profile.metric}定三个目标，同时提前锁定${profile.boundary}。`, score: 3, result: '目标清楚，边界也清楚。' },
      { text: '明年看情况吧，现在不好说。', score: 0, result: '没有计划感。' },
      { text: '只要资源到位，我肯定能做好。', score: 2, result: '方向对，但还缺具体动作。' }
    ]}
  ];
}

function getActiveBossProfile() {
  return careerBossProfiles[career] || careerBossProfiles.dev;
}

function getActiveBossRounds() {
  return buildBossRounds(getActiveBossProfile());
}

function startBossBattle() {
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('boss-screen').classList.remove('hidden');
  currentBossRound = 0; bossScore = 0;
  loadBossRound(0);
}

function startBossTimer() {
  if (bossTimer) clearInterval(bossTimer);
  const maxTime = isNewGamePlus ? 10 : 15;
  bossTimeLeft = maxTime;
  bossTimerActive = true;
  const bar = document.getElementById('boss-timer-bar');
  const num = document.getElementById('boss-timer-num');
  bar.style.width = '100%';
  bar.style.background = '#07c160';
  num.textContent = String(maxTime);
  num.className = '';
  num.style.color = '#07c160';

  bossTimer = setInterval(() => {
    bossTimeLeft--;
    const maxT = isNewGamePlus ? 10 : 15;
    const pct = (bossTimeLeft / maxT) * 100;
    bar.style.width = `${pct}%`;
    num.textContent = bossTimeLeft;
    if (bossTimeLeft <= 5) {
      bar.style.background = '#e64340';
      num.style.color = '#e64340';
      num.className = 'timer-danger';
      if (bossTimeLeft > 0) playSound('heartbeat');
    } else if (bossTimeLeft <= 8) {
      bar.style.background = '#ff9800';
      num.style.color = '#ff9800';
    }
    if (bossTimeLeft <= 0) {
      clearInterval(bossTimer);
      bossTimerActive = false;
      // 超时自动选第一个选项（通常是最差的）
      selectBossOption(0, true);
    }
  }, 1000);
}

function stopBossTimer() {
  if (bossTimer) { clearInterval(bossTimer); bossTimer = null; }
  bossTimerActive = false;
}

function loadBossRound(round) {
  const activeBossRounds = getActiveBossRounds();
  const bossProfile = getActiveBossProfile();
  if (round >= activeBossRounds.length) { endBossBattle(); return; }
  currentBossRound = round;
  const data = activeBossRounds[round];
  const char = characters[data.speaker] || characters.chenhr;

  document.getElementById('boss-round').textContent = `第 ${round + 1} / ${activeBossRounds.length} 轮`;
  document.getElementById('boss-header-title').textContent = `⚠️ ${bossProfile.title}`;
  document.getElementById('boss-header-sub').textContent = bossProfile.subtitle;
  document.getElementById('boss-hp-bar-inner').style.width = ((activeBossRounds.length - round) / activeBossRounds.length * 100) + '%';

  const chat = document.getElementById('boss-chat');
  if (round === 0) chat.innerHTML = '';

  // 心理提示
  const mindDiv = document.createElement('div');
  mindDiv.className = 'mind-bubble';
  mindDiv.textContent = data.decode;
  chat.appendChild(mindDiv);

  const row = document.createElement('div'); row.className = 'wx-msg-row';
  row.innerHTML = `${renderAvatar(data.speaker)}<div class="wx-bubble other">${data.text}</div>`;
  chat.appendChild(row);

  const opts = document.getElementById('boss-options');
  opts.innerHTML = '';
  data.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'wx-option';
    btn.textContent = opt.text;
    btn.onclick = () => selectBossOption(i);
    opts.appendChild(btn);
  });
  chat.scrollTop = chat.scrollHeight;
  startBossTimer();
}

function selectBossOption(idx, isTimeout) {
  if (!bossTimerActive && !isTimeout) return;
  stopBossTimer();
  const data = getActiveBossRounds()[currentBossRound];
  const opt = data.options[idx];
  bossScore += opt.score;

  document.querySelectorAll('#boss-options .wx-option').forEach((btn, i) => {
    btn.disabled = true;
    if (i === idx) btn.classList.add(opt.score >= 3 ? 'good' : opt.score <= 1 ? 'bad' : 'mid');
  });
  playSound(opt.score >= 3 ? 'good' : opt.score <= 1 ? 'bad' : 'click');

  const chat = document.getElementById('boss-chat');
  const selfRow = document.createElement('div'); selfRow.className = 'wx-msg-row self';
  selfRow.innerHTML = `<div class="wx-bubble self">${opt.text}</div>${renderAvatar('player')}`;
  chat.appendChild(selfRow);

  const resultDiv = document.createElement('div');
  resultDiv.className = 'result-bubble';
  resultDiv.textContent = opt.result;
  chat.appendChild(resultDiv);
  chat.scrollTop = chat.scrollHeight;

  setTimeout(() => loadBossRound(currentBossRound + 1), 1200);
}

function endBossBattle() {
  if (bossScore >= 13) { stats.performance += 15; stats.network += 10; }
  else if (bossScore >= 10) { stats.performance += 10; stats.network += 5; }
  else if (bossScore >= 7) { stats.performance += 5; }
  else { stats.blame += 10; stats.mood -= 10; }
  stats.performance = clamp(stats.performance, 0, 100);
  stats.blame = clamp(stats.blame, 0, 100);
  stats.mood = clamp(stats.mood, 0, 100);
  stats.network = clamp(stats.network, 0, 100);
  showEnding();
}

// ============ 结束 ============
const careerEndingCopy = {
  default: {
    collapse: '你背的锅太多，终于被优化了。HR的谈话比你想的简短。',
    burnout: '你提交了辞职信。领导没有挽留。但至少，今晚可以睡个好觉。',
    danger: '你勉强活到了年终，但背锅值高得吓人。HR看你的眼神像在看一个即将被优化的人。',
    winner: '绩效高、锅少、人脉广。组长年会上表扬你。最好的结局。',
    happy: '你不在乎升职加薪，只想活得开心。同事们觉得你"心态好"，其实你最清醒。',
    network: '你深谙办公室政治。虽然绩效不是最高，但人人都觉得你靠谱。',
    normal: '一年下来，没有大喜也没有大悲。3.5的绩效，不多不少的背锅。这就是大多数职场人的真实写照。'
  },
  selfEmployed: {
    collapse: '应收款、房租和税务一起压上来，账本终于撑不住了。你暂停接单，先把现金流救回来。',
    burnout: '你关掉接单群，给自己放了一个真正的空档。摊子还在，先让人缓过来。',
    danger: '你勉强撑到了年底，但账本上的应收、房租、税务和赊账都在闪红灯。再靠面子做生意，现金流会先倒下。',
    winner: '现金流稳住了，利润率也守住了。你没有把小生意做成免费客服，这是最难的胜利。',
    happy: '你没有盲目扩张，也不为了热闹接亏本单。小生意还小，但你睡得着。',
    network: '老客、同行和平台关系都还在，但你没有用利润无限换人情。这个分寸很值钱。',
    normal: '一年下来，小赚小亏都有。你保住了现金流，也学会了把关系和账期分开。'
  }
};

function getCareerEndingCopy(key) {
  const pack = careerEndingCopy[career] || careerEndingCopy.default;
  return pack[key] || careerEndingCopy.default[key];
}

function getGameOverReason(reason) {
  if (career !== 'selfEmployed') return reason;
  if (stats.blame >= 100) return '经营风险爆表，现金流被拖垮了';
  if (stats.mood <= 0) return '心态归零，暂停接单了';
  return reason;
}

function withNewsEnding(desc) {
  if (newsHeat < 4) return desc;
  const note = newsHeat >= 8
    ? `本局你打出 ${newsCount} 次新闻同款打法，舆论热度 ${newsHeat}/10，场面很炸，但后续解释成本也很高。`
    : `本局你打出 ${newsCount} 次新闻同款打法，舆论热度 ${newsHeat}/10，确实多了些节目效果。`;
  return `${desc}${note}`;
}

function getNpcFavorSummary() {
  const entries = Object.entries(npcFavor)
    .filter(([k, v]) => k !== 'player' && characters[k])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  if (entries.length === 0) return '';
  return entries.map(([k, v]) => {
    const c = characters[k];
    const label = getNpcFavorLabel(v);
    return `${c.name}: ${v} (${label})`;
  }).join(' · ');
}

function showGameOver(reason) {
  playSound('bad');
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('boss-screen').classList.add('hidden');
  document.getElementById('end-screen').classList.remove('hidden');
  document.getElementById('end-emoji').textContent = '💀';
  document.getElementById('end-title').textContent = career === 'selfEmployed' ? '小生意暂停营业' : '职场生涯终结';
  document.getElementById('end-title').style.color = '#e64340';
  document.getElementById('end-subtitle').textContent = getGameOverReason(reason);

  const favorSummary = getNpcFavorSummary();
  document.getElementById('end-stats').innerHTML = `
    <div class="end-stat-row"><span>存活关卡</span><span>${currentLevel + 1} / ${getActiveLevels().length}</span></div>
    <div class="end-stat-row"><span>最终绩效</span><span style="color:${stats.performance>=60?'#07c160':'#e64340'}">${stats.performance}</span></div>
    <div class="end-stat-row"><span>累计背锅</span><span style="color:#e64340">${stats.blame}</span></div>
    <div class="end-stat-row"><span>剩余心情</span><span style="color:${stats.mood>=50?'#07c160':'#e64340'}">${stats.mood}</span></div>
    <div class="end-stat-row"><span>人脉值</span><span>${stats.network}</span></div>
    ${activeRelics.length > 0 ? `<div class="end-stat-row"><span>携带遗物</span><span>${activeRelics.map(r => r.icon + ' ' + r.name).join(', ')}</span></div>` : ''}
    ${favorSummary ? `<div class="end-stat-row"><span>关系TOP3</span><span style="font-size:10px">${favorSummary}</span></div>` : ''}
    ${newsHeat > 0 ? `<div class="end-stat-row"><span>舆论热度</span><span style="color:${newsHeat>=7?'#e64340':'#ff9800'}">${newsHeat}/10</span></div>` : ''}
  `;
  const desc = stats.blame >= 100
    ? getCareerEndingCopy('collapse')
    : getCareerEndingCopy('burnout');
  document.getElementById('end-desc').textContent = withNewsEnding(desc);
}

function showEnding() {
  document.getElementById('boss-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('end-screen').classList.remove('hidden');

  const bossLabel = getActiveBossProfile().title.replace('BOSS战：', '');
  let ending = '', emoji = '', color = '', desc = '';
  if (stats.blame >= 80) {
    ending = '⚠️ 如履薄冰'; emoji = '😰'; color = '#ff9800';
    desc = getCareerEndingCopy('danger');
  } else if (bossScore >= 13 && stats.performance >= 60) {
    ending = '👑 终局王者'; emoji = '👑'; color = '#07c160';
    desc = `${bossLabel}${bossScore}/15分！你用证据、边界和结果把最后一关打穿。`;
  } else if (stats.performance >= 70 && stats.blame < 30) {
    ending = '🏆 职场赢家'; emoji = '🏆'; color = '#07c160';
    desc = getCareerEndingCopy('winner');
  } else if (stats.mood >= 70) {
    ending = '😌 快乐摸鱼'; emoji = '😌'; color = '#2196f3';
    desc = getCareerEndingCopy('happy');
  } else if (stats.network >= 70) {
    ending = '🤝 人脉王'; emoji = '🤝'; color = '#b08cc4';
    desc = getCareerEndingCopy('network');
  } else {
    ending = '😐 普通打工人'; emoji = '😐'; color = '#888';
    desc = getCareerEndingCopy('normal');
  }

  document.getElementById('end-emoji').textContent = emoji;
  document.getElementById('end-title').textContent = ending;
  document.getElementById('end-title').style.color = color;
  document.getElementById('end-subtitle').textContent = `${bossLabel} ${bossScore}/15 · 年度生存报告`;

  const favorSummary = getNpcFavorSummary();
  document.getElementById('end-stats').innerHTML = `
    <div class="end-stat-row"><span>最终绩效</span><span style="color:${stats.performance>=60?'#07c160':stats.performance>=30?'#ff9800':'#e64340'}">${stats.performance}</span></div>
    <div class="end-stat-row"><span>累计背锅</span><span style="color:${stats.blame>=50?'#e64340':'#07c160'}">${stats.blame}</span></div>
    <div class="end-stat-row"><span>最终心情</span><span style="color:${stats.mood>=60?'#07c160':stats.mood>=30?'#ff9800':'#e64340'}">${stats.mood}</span></div>
    <div class="end-stat-row"><span>人脉积累</span><span style="color:${stats.network>=60?'#07c160':stats.network>=30?'#ff9800':'#e64340'}">${stats.network}</span></div>
    <div class="end-stat-row"><span>${bossLabel}评分</span><span style="color:${bossScore>=10?'#07c160':bossScore>=7?'#ff9800':'#e64340'}">${bossScore}/15</span></div>
    ${activeRelics.length > 0 ? `<div class="end-stat-row"><span>携带遗物</span><span>${activeRelics.map(r => r.icon + ' ' + r.name).join(', ')}</span></div>` : ''}
    ${favorSummary ? `<div class="end-stat-row"><span>关系TOP3</span><span style="font-size:10px">${favorSummary}</span></div>` : ''}
    ${newsHeat > 0 ? `<div class="end-stat-row"><span>舆论热度</span><span style="color:${newsHeat>=7?'#e64340':'#ff9800'}">${newsHeat}/10</span></div>` : ''}
  `;

  // 羁绊评语
  const ally = Object.entries(npcFavor).find(([k, v]) => k !== 'player' && v >= 80);
  const enemy = Object.entries(npcFavor).find(([k, v]) => k !== 'player' && v <= 20);
  let bondDesc = desc;
  if (ally) {
    bondDesc += ` ${characters[ally[0]].name}成了你的盟友，下次遇到他可能会有意想不到的帮助。`;
  }
  if (enemy) {
    bondDesc += ` 但${characters[enemy[0]].name}已经视你为眼中钉，后面的路会更难走。`;
  }
  // 二周目标注
  if (isNewGamePlus) {
    bondDesc += ' 【真实职场模式通关】你已经在没有提示的情况下 survive 了整场。';
  }
  document.getElementById('end-desc').textContent = withNewsEnding(bondDesc);

  // 通关记录 + 遗物选择（游戏未结束时）
  if (stats.blame < 100 && stats.mood > 0) {
    recordCompletion();
    setTimeout(() => showRelicSelect(), 2500);
  }
}

// ============ 页面加载初始化 ============
document.addEventListener('DOMContentLoaded', () => {
  initAudioFromStorage();
  loadCompletion();
  if (hasSave()) {
    const btn = document.getElementById('continue-btn');
    if (btn) btn.style.display = 'block';
  }
  if (hasCompleted()) {
    const ngpBtn = document.getElementById('start-ngp-btn');
    if (ngpBtn) ngpBtn.style.display = 'block';
    const hint = document.getElementById('start-hint');
    if (hint) {
      hint.style.display = 'block';
      hint.textContent = `已通关 ${completionCount} 次 · 解锁「真实职场」模式（无提示 · 无颜色标记 · Boss战10秒）`;
    }
  }
});
