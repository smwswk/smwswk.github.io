import { CARDS, ENEMIES, RELICS, createCombat, getEnergyCost, resolveTurn } from "./rules.js";
import { buildSelectionPreview, describeCombatGoal, recommendCardIndexes } from "./coach.js";
import { RULE_PACKS, createInitialRun, getReachableNodeIds } from "./run.js";

const RELIC_POOL = [
  "red_scarf",
  "marble",
  "duty_armband",
  "borrowed_comic",
  "shop_tab",
  "chalk_stub",
  "class_bell",
  "eraser",
  "lunch_card",
  "paper_plane"
];

const els = {
  packChip: document.querySelector("#pack-chip"),
  coachStep: document.querySelector("#coach-step"),
  coachTitle: document.querySelector("#coach-title"),
  coachBody: document.querySelector("#coach-body"),
  startPanel: document.querySelector("#start-panel"),
  packGrid: document.querySelector("#pack-grid"),
  mapPanel: document.querySelector("#map-panel"),
  mapCopy: document.querySelector("#map-copy"),
  map: document.querySelector("#map"),
  newRun: document.querySelector("#new-run"),
  arena: document.querySelector("#arena"),
  effectLayer: document.querySelector("#effect-layer"),
  controls: document.querySelector("#controls"),
  lower: document.querySelector("#lower"),
  playerHp: document.querySelector("#player-hp"),
  playerHpBar: document.querySelector("#player-hp-bar"),
  playerQi: document.querySelector("#player-qi"),
  playerBlock: document.querySelector("#player-block"),
  enemyName: document.querySelector("#enemy-name"),
  enemyHp: document.querySelector("#enemy-hp"),
  enemyHpBar: document.querySelector("#enemy-hp-bar"),
  enemyQi: document.querySelector("#enemy-qi"),
  enemyBlock: document.querySelector("#enemy-block"),
  enemyStance: document.querySelector("#enemy-stance"),
  enemyHint: document.querySelector("#enemy-hint"),
  enemyRevealed: document.querySelector("#enemy-revealed"),
  drawInfo: document.querySelector("#draw-info"),
  selectedInfo: document.querySelector("#selected-info"),
  energyInfo: document.querySelector("#energy-info"),
  turnGoal: document.querySelector("#turn-goal"),
  selectionPreview: document.querySelector("#selection-preview"),
  hand: document.querySelector("#hand"),
  recommendTurn: document.querySelector("#recommend-turn"),
  endTurn: document.querySelector("#end-turn"),
  relics: document.querySelector("#relics"),
  log: document.querySelector("#log"),
  rewardDialog: document.querySelector("#reward-dialog"),
  rewardTitle: document.querySelector("#reward-title"),
  rewardCopy: document.querySelector("#reward-copy"),
  rewardGrid: document.querySelector("#reward-grid"),
  skipReward: document.querySelector("#skip-reward")
};

const state = {
  packId: null,
  hp: 72,
  maxHp: 72,
  gold: 0,
  deck: [],
  relicIds: [],
  rewardPool: [],
  map: null,
  currentNodeId: null,
  completedNodeIds: [],
  reachableNodeIds: [],
  activeNode: null,
  drawPile: [],
  discardPile: [],
  hand: [],
  selected: new Set(),
  recommended: new Set(),
  combat: null,
  pendingRelic: false,
  finished: false,
  rewardDone: null
};

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sample(pool, count) {
  return shuffle(pool).slice(0, count);
}

function renderPackChoices() {
  els.packGrid.replaceChildren(
    ...Object.values(RULE_PACKS).map((pack) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pack-card";
      button.innerHTML = `
        <span>${pack.tag}</span>
        <h3>${pack.name}</h3>
        <p>${pack.description}</p>
      `;
      button.addEventListener("click", () => startRun(pack.id));
      return button;
    })
  );
}

function startRun(packId) {
  const initial = createInitialRun({
    packId,
    seed: Math.floor(Math.random() * 100000)
  });
  Object.assign(state, initial, {
    activeNode: null,
    drawPile: [],
    discardPile: [],
    hand: [],
    selected: new Set(),
    recommended: new Set(),
    combat: null,
    pendingRelic: false,
    finished: false,
    rewardDone: null
  });
  state.reachableNodeIds = getReachableNodeIds(state.map, null);
  renderMapMode("选择第一场课间冲突。");
}

function renderMapMode(copy = "选择一个可达节点继续。") {
  els.startPanel.classList.add("hidden");
  els.arena.classList.add("hidden");
  els.controls.classList.add("hidden");
  els.lower.classList.add("hidden");
  els.mapPanel.classList.remove("hidden");
  const pack = RULE_PACKS[state.packId];
  els.packChip.textContent = formatRunChip();
  els.mapCopy.textContent = copy;
  setCoach({
    step: "路线阶段",
    title: "选一个发亮节点",
    body: "地图从左往右走。蓝框节点能点：战=战斗，精=更难但给遗物，?=事件，店=小卖部，休=回血。"
  });
  renderMap();
  renderRelics();
}

function renderCombatMode() {
  els.startPanel.classList.add("hidden");
  els.mapPanel.classList.remove("hidden");
  els.arena.classList.remove("hidden");
  els.controls.classList.remove("hidden");
  els.lower.classList.remove("hidden");
  renderMap();
  renderStats();
  renderHand();
  renderSelectionPreview();
  renderRelics();
  renderLog();
}

function renderMap() {
  els.map.replaceChildren(
    ...state.map.layers.map((layer) => {
      const div = document.createElement("div");
      div.className = "map-layer";
      div.replaceChildren(...layer.map((node) => renderMapNode(node)));
      return div;
    })
  );
}

function renderMapNode(node) {
  const reachable = state.reachableNodeIds.includes(node.id);
  const done = state.completedNodeIds.includes(node.id);
  const current = state.currentNodeId === node.id;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "map-node";
  if (reachable) button.classList.add("reachable");
  if (done) button.classList.add("done");
  if (current) button.classList.add("current");
  button.disabled = !reachable || Boolean(state.combat) || state.finished;
  button.innerHTML = `<strong>${node.icon}</strong><small>${node.label}</small>`;
  button.title = node.enemyId ? ENEMIES[node.enemyId].name : node.label;
  button.addEventListener("click", () => enterNode(node.id));
  return button;
}

function enterNode(nodeId) {
  if (!state.reachableNodeIds.includes(nodeId)) {
    return;
  }
  const node = state.map.nodes[nodeId];
  state.currentNodeId = node.id;
  state.reachableNodeIds = [];
  renderMap();

  if (["combat", "elite", "boss"].includes(node.type)) {
    startCombat(node);
    return;
  }
  resolveUtilityNode(node);
}

function startCombat(node) {
  state.activeNode = node;
  state.drawPile = shuffle(state.deck);
  state.discardPile = [];
  state.hand = [];
  state.selected.clear();
  state.recommended.clear();
  state.combat = createCombat({
    enemyId: node.enemyId,
    relicIds: state.relicIds,
    deck: state.deck
  });
  state.combat.player.hp = state.hp;
  state.combat.player.maxHp = state.maxHp;
  if (node.type === "boss") {
    state.combat.log.unshift("午休前最后一战：对面开始收集全班元气。");
  }
  if (node.type === "elite") {
    state.combat.log.unshift("隔壁班围过来了，这场赢了会掉遗物。");
  }
  drawCards(5);
  renderCombatMode();
}

function drawCards(count) {
  while (state.hand.length < count) {
    if (state.drawPile.length === 0) {
      if (state.discardPile.length === 0) {
        break;
      }
      state.drawPile = shuffle(state.discardPile);
      state.discardPile = [];
    }
    state.hand.push(state.drawPile.pop());
  }
}

function endTurn() {
  if (state.finished || !state.combat || state.selected.size === 0) {
    return;
  }
  const before = state.combat;
  const chosenIndexes = [...state.selected];
  const chosen = chosenIndexes.map((index) => state.hand[index]);
  state.combat = resolveTurn(state.combat, chosen);
  state.hp = state.combat.player.hp;
  for (let index = 0; index < state.hand.length; index += 1) {
    const cardId = state.hand[index];
    if (!chosenIndexes.includes(index) || !CARDS[cardId].exhaust) {
      state.discardPile.push(cardId);
    }
  }
  state.hand = [];
  state.selected.clear();
  state.recommended.clear();

  if (state.combat.enemy.hp <= 0) {
    handleVictory();
    renderCombatMode();
    playTurnEffect(before, state.combat, chosen);
    return;
  }

  if (state.combat.player.hp <= 0) {
    state.finished = true;
    state.combat.log.push("下课铃还没响，你已经被发到没气了。");
    renderCombatMode();
    playTurnEffect(before, state.combat, chosen);
    return;
  }

  drawCards(5);
  renderCombatMode();
  playTurnEffect(before, state.combat, chosen);
}

function handleVictory() {
  const node = state.activeNode;
  completeNode(node.id);
  if (node.type === "boss") {
    state.finished = true;
    state.gold += 80;
    state.combat.log.push("你顶住了元气弹，成为走廊传说。");
    return;
  }
  const goldReward = node.type === "elite" ? 45 : 24;
  state.gold += goldReward;
  state.pendingRelic = node.type === "elite";
  state.combat.log.push(`${state.combat.enemy.name}认输，获得 ${goldReward} 金。`);
  openCardReward({
    title: node.type === "elite" ? "精英胜利" : "课间胜利",
    copy: `获得 ${goldReward} 金。再选一张地方规则加入牌组。`,
    onDone: () => {
      if (state.pendingRelic) {
        state.pendingRelic = false;
        openRelicReward({
          title: "精英奖励",
          copy: "选一个课间遗物。",
          onDone: returnToMap
        });
        return;
      }
      returnToMap();
    }
  });
}

function completeNode(nodeId) {
  if (!state.completedNodeIds.includes(nodeId)) {
    state.completedNodeIds.push(nodeId);
  }
  state.currentNodeId = nodeId;
  state.reachableNodeIds = getReachableNodeIds(state.map, nodeId);
}

function resolveUtilityNode(node) {
  if (node.type === "event") {
    openCardReward({
      title: "走廊事件",
      copy: "围观同学给你补了一条地方规则。",
      onDone: () => {
        completeNode(node.id);
        returnToMap("事件处理完了，继续选下一步。");
      }
    });
    return;
  }

  if (node.type === "shop") {
    openShop({
      title: "小卖部",
      copy: "金币有限，买牌、买遗物、删废牌只能挑重点。",
      onDone: () => {
        completeNode(node.id);
        returnToMap("小卖部出来了，继续走。");
      }
    });
    return;
  }

  if (node.type === "rest") {
    const heal = Math.ceil(state.maxHp * 0.28);
    state.hp = Math.min(state.maxHp, state.hp + heal);
    openNotice({
      title: "医务室",
      copy: `喝水休息，回复 ${heal} 生命。`,
      onDone: () => {
        completeNode(node.id);
        returnToMap("休息结束，继续选下一步。");
      }
    });
  }
}

function openCardReward({ title, copy, onDone }) {
  const choices = sample(state.rewardPool, 3);
  state.rewardDone = onDone;
  els.rewardTitle.textContent = title;
  els.rewardCopy.textContent = copy;
  els.rewardGrid.replaceChildren(...choices.map((id) => renderCard(id, { reward: true })));
  els.skipReward.textContent = "跳过";
  els.skipReward.onclick = () => {
    els.rewardDialog.close();
    state.rewardDone?.();
  };
  els.rewardDialog.showModal();
}

function openRelicReward({ title, copy, onDone }) {
  const available = RELIC_POOL.filter((id) => !state.relicIds.includes(id));
  state.rewardDone = onDone;
  if (available.length === 0) {
    onDone();
    return;
  }
  const choices = sample(available, 3);
  els.rewardTitle.textContent = title;
  els.rewardCopy.textContent = copy;
  els.skipReward.textContent = "跳过";
  els.rewardGrid.replaceChildren(
    ...choices.map((id) => {
      const relic = RELICS[id];
      const button = document.createElement("button");
      button.className = "card skill";
      button.type = "button";
      button.innerHTML = `<span class="meta"><span>遗物</span><span>${relic.id}</span></span><h3>${relic.name}</h3><p>${relic.text}</p>`;
      button.addEventListener("click", () => {
        state.relicIds.push(id);
        els.rewardDialog.close();
        state.rewardDone?.();
      });
      return button;
    })
  );
  els.skipReward.onclick = () => {
    els.rewardDialog.close();
    state.rewardDone?.();
  };
  els.rewardDialog.showModal();
}

function openShop({ title, copy, onDone }) {
  state.rewardDone = onDone;
  const cardChoices = sample(state.rewardPool, 2);
  const relicChoices = sample(
    RELIC_POOL.filter((id) => !state.relicIds.includes(id)),
    1
  );
  els.rewardTitle.textContent = title;
  els.rewardCopy.textContent = `${copy} 当前金币：${state.gold}`;
  els.skipReward.textContent = "离开";
  const items = [
    ...cardChoices.map((id) => ({ kind: "card", id, price: 35 })),
    ...relicChoices.map((id) => ({ kind: "relic", id, price: 70 })),
    { kind: "remove", id: "remove_basic", price: 45 }
  ];
  els.rewardGrid.replaceChildren(...items.map((item) => renderShopItem(item)));
  els.skipReward.onclick = () => {
    els.rewardDialog.close();
    state.rewardDone?.();
  };
  els.rewardDialog.showModal();
}

function renderShopItem(item) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "card skill";
  const affordable = state.gold >= item.price;
  button.disabled = !affordable;

  if (item.kind === "card") {
    const card = CARDS[item.id];
    button.className = `card ${card.type}`;
    button.innerHTML = `
      <span class="meta"><span>买牌</span><span>${item.price} 金</span></span>
      <h3>${card.name}</h3>
      <span class="cost">${formatCardCost(card)}</span>
      <p>${card.text}</p>
    `;
    button.addEventListener("click", () => {
      buyShopItem(button, item.price, () => state.deck.push(item.id));
    });
    return button;
  }

  if (item.kind === "relic") {
    const relic = RELICS[item.id];
    button.innerHTML = `
      <span class="meta"><span>买遗物</span><span>${item.price} 金</span></span>
      <h3>${relic.name}</h3>
      <p>${relic.text}</p>
    `;
    button.addEventListener("click", () => {
      buyShopItem(button, item.price, () => state.relicIds.push(item.id));
    });
    return button;
  }

  button.innerHTML = `
    <span class="meta"><span>整理牌组</span><span>${item.price} 金</span></span>
    <h3>撕掉一张废牌</h3>
    <p>移除牌组里第一张深呼吸、交叉格挡或小波。</p>
  `;
  button.addEventListener("click", () => {
    buyShopItem(button, item.price, removeBasicCard);
  });
  return button;
}

function buyShopItem(button, price, apply) {
  if (state.gold < price) return;
  state.gold -= price;
  apply();
  button.disabled = true;
  button.classList.add("selected");
  els.rewardCopy.textContent = `已购买。当前金币：${state.gold}`;
}

function removeBasicCard() {
  const index = state.deck.findIndex((id) =>
    ["deep_breath", "cross_guard", "small_wave"].includes(id)
  );
  if (index >= 0) {
    state.deck.splice(index, 1);
  }
}

function openNotice({ title, copy, onDone }) {
  state.rewardDone = onDone;
  els.rewardTitle.textContent = title;
  els.rewardCopy.textContent = copy;
  els.rewardGrid.replaceChildren();
  els.skipReward.textContent = "继续";
  els.skipReward.onclick = () => {
    els.rewardDialog.close();
    els.skipReward.textContent = "跳过";
    state.rewardDone?.();
  };
  els.rewardDialog.showModal();
}

function returnToMap(copy) {
  state.combat = null;
  state.activeNode = null;
  state.hand = [];
  state.selected.clear();
  state.recommended.clear();
  renderMapMode(copy);
}

function toggleCard(handIndex, cardElement) {
  if (state.selected.has(handIndex)) {
    state.selected.delete(handIndex);
    cardElement.classList.remove("selected");
  } else {
    state.selected.add(handIndex);
    cardElement.classList.add("selected");
  }
  state.recommended.clear();
  els.selectedInfo.textContent = `已选 ${state.selected.size} 张`;
  renderSelectionPreview();
  renderHand();
}

function renderStats() {
  const { player, enemy } = state.combat;
  els.playerHp.textContent = `${player.hp}/${player.maxHp}`;
  els.playerHpBar.style.width = `${Math.max(0, (player.hp / player.maxHp) * 100)}%`;
  els.playerQi.textContent = `气 ${player.qi}`;
  els.playerBlock.textContent = `挡 ${player.block}`;
  els.enemyName.textContent = enemy.name;
  els.enemyHp.textContent = `${enemy.hp}/${enemy.maxHp}`;
  els.enemyHpBar.style.width = `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`;
  els.enemyQi.textContent = `气 ${enemy.qi}`;
  els.enemyBlock.textContent = `挡 ${enemy.block}`;
  els.enemyStance.textContent = enemy.stance;
  els.enemyHint.textContent = enemy.hint;
  els.enemyRevealed.textContent = enemy.revealed ? `真实动作：${enemy.intent.text}` : "";
  els.drawInfo.textContent = `抽牌堆 ${state.drawPile.length} / 弃牌堆 ${state.discardPile.length}`;
  els.selectedInfo.textContent = `已选 ${state.selected.size} 张`;
  els.energyInfo.textContent = `能量 ${player.energy}/${player.maxEnergy}`;
  els.endTurn.disabled = state.finished;
  els.endTurn.textContent = state.finished ? "本局结束" : "结束回合";
  els.turnGoal.textContent = describeCombatGoal(enemy.intent);
  const pack = RULE_PACKS[state.packId];
  els.packChip.textContent = formatRunChip();
  setCoach({
    step: `战斗第 ${state.combat.turn} 回合`,
    title: `看姿态：${enemy.stance}`,
    body: "点牌会出现出招预览。新手可以先点“推荐出招”，再点“结束回合”看结算。"
  });
}

function renderHand() {
  els.hand.replaceChildren(...state.hand.map((id, index) => renderCard(id, { handIndex: index })));
}

function renderCard(id, { reward = false, handIndex = null } = {}) {
  const card = CARDS[id];
  const button = document.createElement("button");
  button.className = `card ${card.type}`;
  if (handIndex !== null && state.selected.has(handIndex)) {
    button.classList.add("selected");
  }
  if (handIndex !== null && state.recommended.has(handIndex)) {
    button.classList.add("recommended");
  }
  button.type = "button";
  const cost = formatCardCost(card);
  button.innerHTML = `
    <span class="meta"><span>${card.region}</span><span>${typeLabel(card.type)}</span></span>
    <h3>${card.name}</h3>
    <span class="cost">${cost}</span>
    <p>${card.text}</p>
  `;
  if (reward) {
    button.addEventListener("click", () => {
      state.deck.push(id);
      els.rewardDialog.close();
      state.rewardDone?.();
    });
    return button;
  }
  const unaffordable =
    (card.cost ?? 0) > state.combat.player.qi || getEnergyCost(card) > state.combat.player.energy;
  button.disabled = state.finished || unaffordable;
  if (unaffordable) {
    button.title = "能量或气不够";
  }
  button.addEventListener("click", () => toggleCard(handIndex, button));
  return button;
}

function renderSelectionPreview() {
  if (!state.combat) return;
  const selectedCards = [...state.selected].map((index) => state.hand[index]);
  if (selectedCards.length === 0) {
    els.selectionPreview.textContent = "点选卡牌后，会显示预计剩余气、获得挡、发波伤害和战术判断。";
    return;
  }
  const preview = buildSelectionPreview({
    cardIds: selectedCards,
    playerQi: state.combat.player.qi,
    playerEnergy: state.combat.player.energy,
    enemyIntent: state.combat.enemy.intent,
    relicIds: state.relicIds
  });
  els.selectionPreview.textContent = `预计：能量 ${preview.energyAfter} / 气 ${preview.qiAfter} / 挡 ${preview.block} / 波 ${preview.waveDamage}。${preview.read}`;
}

function renderRelics() {
  els.relics.replaceChildren(
    ...state.relicIds.map((id) => {
      const relic = RELICS[id];
      const div = document.createElement("div");
      div.className = "relic";
      div.innerHTML = `<strong>${relic.name}</strong><small>${relic.text}</small>`;
      return div;
    })
  );
}

function renderLog() {
  const entries = state.combat.log.slice(-10).reverse();
  els.log.replaceChildren(
    ...entries.map((entry) => {
      const li = document.createElement("li");
      li.textContent = entry;
      return li;
    })
  );
}

function resetToStart() {
  state.combat = null;
  state.map = null;
  state.finished = false;
  els.mapPanel.classList.add("hidden");
  els.arena.classList.add("hidden");
  els.controls.classList.add("hidden");
  els.lower.classList.add("hidden");
  els.startPanel.classList.remove("hidden");
  els.packChip.textContent = "未选择规则包";
  setCoach({
    step: "第 1 步",
    title: "先选一套童年规则",
    body: "新手建议北京基础流：攒气、防御、发波的关系最清楚。"
  });
}

function recommendTurn() {
  if (!state.combat || state.finished) return;
  state.selected.clear();
  state.recommended = new Set(
    recommendCardIndexes({
      hand: state.hand,
      playerQi: state.combat.player.qi,
      playerEnergy: state.combat.player.energy,
      enemyIntent: state.combat.enemy.intent
    })
  );
  for (const index of state.recommended) {
    state.selected.add(index);
  }
  renderHand();
  renderSelectionPreview();
  els.selectedInfo.textContent = `已选 ${state.selected.size} 张`;
}

function playTurnEffect(before, after, chosen) {
  els.effectLayer.replaceChildren();
  const enemyDamage = before.enemy.hp - after.enemy.hp;
  const playerDamage = before.player.hp - after.player.hp;
  const usedWave = chosen.some((id) => CARDS[id]?.type === "wave");
  const usedGuard = chosen.some((id) => CARDS[id]?.type === "guard");
  const usedCharge = chosen.some((id) => CARDS[id]?.type === "charge");

  if (usedWave) {
    els.effectLayer.appendChild(effectNode("wave-beam"));
  }
  if (usedGuard && playerDamage === 0) {
    els.effectLayer.appendChild(effectNode("guard-ring"));
  }
  if (usedCharge) {
    els.effectLayer.appendChild(effectNode("qi-spark"));
  }
  if (enemyDamage > 0) {
    const hit = effectNode("hit-pop");
    hit.textContent = `-${enemyDamage}`;
    els.effectLayer.appendChild(hit);
  }
  if (playerDamage > 0) {
    const hit = effectNode("hit-pop player-hit");
    hit.textContent = `你 -${playerDamage}`;
    els.effectLayer.appendChild(hit);
  }
}

function effectNode(className) {
  const div = document.createElement("div");
  div.className = className;
  return div;
}

function setCoach({ step, title, body }) {
  els.coachStep.textContent = step;
  els.coachTitle.textContent = title;
  els.coachBody.textContent = body;
}

function formatCardCost(card) {
  const energy = getEnergyCost(card);
  const qi = card.cost ?? 0;
  if (energy === 0 && qi === 0) return "免费";
  if (qi > 0) return `${energy} 能 / ${qi} 气`;
  return `${energy} 能`;
}

function formatRunChip() {
  const pack = RULE_PACKS[state.packId];
  return `${pack.name} · 生命 ${state.hp}/${state.maxHp} · 金币 ${state.gold} · 牌组 ${state.deck.length}`;
}

function typeLabel(type) {
  return {
    charge: "攒",
    guard: "挡",
    wave: "波",
    skill: "术"
  }[type];
}

els.endTurn.addEventListener("click", endTurn);
els.recommendTurn.addEventListener("click", recommendTurn);
els.newRun.addEventListener("click", resetToStart);
els.packChip.textContent = "未选择规则包";
setCoach({
  step: "第 1 步",
  title: "先选一套童年规则",
  body: "新手建议北京基础流：攒气、防御、发波的关系最清楚。"
});
renderPackChoices();
