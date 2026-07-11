export const CARDS = {
  deep_breath: {
    id: "deep_breath",
    name: "深呼吸",
    region: "基础",
    type: "charge",
    qi: 1,
    text: "攒 1 气。红领巾会额外 +1。"
  },
  desk_charge: {
    id: "desk_charge",
    name: "课桌蓄力",
    region: "北京",
    type: "charge",
    qi: 2,
    text: "攒 2 气。"
  },
  double_clap: {
    id: "double_clap",
    name: "双拍攒",
    region: "天津",
    type: "charge",
    qi: 1,
    block: 3,
    text: "攒 1 气，获得 3 挡。"
  },
  fake_charge: {
    id: "fake_charge",
    name: "假攒",
    region: "武汉",
    type: "charge",
    qi: 1,
    dodge: 4,
    text: "攒 1 气，本回合受伤 -4。"
  },
  snack_sugar: {
    id: "snack_sugar",
    name: "小卖部糖块",
    region: "事件",
    type: "charge",
    qi: 3,
    exhaust: true,
    text: "攒 3 气，消耗。"
  },
  cross_guard: {
    id: "cross_guard",
    name: "交叉格挡",
    region: "基础",
    type: "guard",
    block: 9,
    text: "获得 9 挡。"
  },
  turtle_guard: {
    id: "turtle_guard",
    name: "龟缩",
    region: "大连",
    type: "guard",
    block: 14,
    text: "获得 14 挡；下回合少抽 1 张。"
  },
  desk_duck: {
    id: "desk_duck",
    name: "蹲桌",
    region: "基础",
    type: "guard",
    block: 6,
    qi: 1,
    text: "获得 6 挡，若挡住攻击则攒 1 气。"
  },
  mirror_palm: {
    id: "mirror_palm",
    name: "反弹掌",
    region: "卡牌化",
    type: "guard",
    block: 5,
    reflect: 5,
    text: "获得 5 挡；若挡住波，反弹 5 伤害。"
  },
  absorb_wave: {
    id: "absorb_wave",
    name: "吸波",
    region: "卡牌化",
    type: "guard",
    block: 4,
    absorb: 1,
    text: "获得 4 挡；若挡住波，攒 1 气。"
  },
  small_wave: {
    id: "small_wave",
    name: "小波",
    region: "基础",
    type: "wave",
    cost: 1,
    damage: 8,
    text: "耗 1 气，造成 8 伤害。"
  },
  middle_wave: {
    id: "middle_wave",
    name: "中波",
    region: "基础",
    type: "wave",
    cost: 2,
    damage: 14,
    text: "耗 2 气，造成 14 伤害。"
  },
  wave_fist: {
    id: "wave_fist",
    name: "波动拳",
    region: "街机",
    type: "wave",
    cost: 2,
    damage: 11,
    vulnerable: 1,
    text: "耗 2 气，造成 11 伤害，下回合敌人受伤 +3。"
  },
  kamehameha: {
    id: "kamehameha",
    name: "龟派气功",
    region: "龙珠",
    type: "wave",
    cost: 5,
    damage: 28,
    pierce: true,
    text: "耗 5 气，造成 28 破防伤害。"
  },
  yuanqi_bomb: {
    id: "yuanqi_bomb",
    name: "元气弹",
    region: "终结",
    type: "wave",
    cost: 8,
    damage: 46,
    pierce: true,
    exhaust: true,
    text: "耗 8 气，造成 46 破防伤害，消耗。"
  },
  one_inch_wave: {
    id: "one_inch_wave",
    name: "寸波",
    region: "武侠",
    type: "wave",
    cost: 1,
    damage: 5,
    pierce: true,
    text: "耗 1 气，造成 5 破防伤害。"
  },
  combo_wave: {
    id: "combo_wave",
    name: "连波",
    region: "多人",
    type: "wave",
    cost: 3,
    damage: 7,
    hits: 3,
    text: "耗 3 气，打 3 次，每次 7 伤害。"
  },
  group_wave: {
    id: "group_wave",
    name: "群波",
    region: "班级战",
    type: "wave",
    cost: 3,
    damage: 18,
    splash: true,
    text: "耗 3 气，造成 18 伤害；后续可扩成全体。"
  },
  poison_spit: {
    id: "poison_spit",
    name: "毒波",
    region: "卡牌化",
    type: "wave",
    cost: 2,
    damage: 6,
    poison: 4,
    text: "耗 2 气，造成 6 伤害，附加 4 毒。"
  },
  seal_break: {
    id: "seal_break",
    name: "打断结印",
    region: "火影",
    type: "wave",
    cost: 1,
    damage: 4,
    interruptBonus: 8,
    text: "耗 1 气，若敌人攒气，额外 8 伤害。"
  },
  stare_face: {
    id: "stare_face",
    name: "盯表情",
    region: "读心",
    type: "skill",
    reveal: true,
    text: "揭示敌人的真实动作。"
  },
  listen_rhythm: {
    id: "listen_rhythm",
    name: "听拍手节奏",
    region: "读心",
    type: "skill",
    reveal: true,
    qi: 1,
    text: "揭示真实动作，并攒 1 气。"
  },
  feint: {
    id: "feint",
    name: "虚晃",
    region: "心理战",
    type: "skill",
    block: 3,
    nextDamage: 3,
    text: "获得 3 挡；下张波 +3 伤害。"
  },
  change_target: {
    id: "change_target",
    name: "换目标",
    region: "多人",
    type: "skill",
    block: 2,
    text: "获得 2 挡；后续多人模式用于转火。"
  },
  sushi_tuna: {
    id: "sushi_tuna",
    name: "金枪鱼寿司",
    region: "日本",
    type: "charge",
    qi: 2,
    text: "攒 2 气。寿司流派会让高气牌更便宜。"
  },
  sushi_abalone: {
    id: "sushi_abalone",
    name: "鲍鱼寿司",
    region: "日本",
    type: "wave",
    cost: 6,
    damage: 22,
    pierce: true,
    qi: 2,
    text: "耗 6 气，造成 22 破防伤害，然后返还 2 气。"
  },
  hamburger: {
    id: "hamburger",
    name: "汉堡汉堡",
    region: "口语MOD",
    type: "charge",
    qi: 1,
    heal: 3,
    exhaust: true,
    text: "攒 1 气，回复 3 生命，消耗。"
  },
  chalk_dust: {
    id: "chalk_dust",
    name: "粉笔灰",
    region: "教室",
    type: "skill",
    weak: 4,
    text: "敌人本回合波伤害 -4。"
  },
  duty_badge: {
    id: "duty_badge",
    name: "值日压制",
    region: "班干部",
    type: "skill",
    block: 7,
    reveal: true,
    text: "获得 7 挡并揭示真实动作。"
  },
  afterimage: {
    id: "afterimage",
    name: "残影",
    region: "武侠",
    type: "guard",
    block: 3,
    dodge: 8,
    text: "获得 3 挡，本回合受伤 -8。"
  }
};

export function getEnergyCost(card) {
  if (!card) return 0;
  if (card.energy !== undefined) return card.energy;
  if (card.id === "stare_face") return 0;
  if (card.id === "change_target") return 0;
  if (card.id === "kamehameha" || card.id === "yuanqi_bomb" || card.id === "combo_wave") return 2;
  return 1;
}

export const RELICS = {
  red_scarf: {
    id: "red_scarf",
    name: "红领巾",
    bonusCharge: 1,
    text: "每次攒气额外 +1。"
  },
  marble: {
    id: "marble",
    name: "玻璃弹珠",
    text: "每场战斗第一次小波 +5 伤害。"
  },
  duty_armband: {
    id: "duty_armband",
    name: "值日袖章",
    blockStart: 4,
    text: "每场战斗开始获得 4 挡。"
  },
  borrowed_comic: {
    id: "borrowed_comic",
    name: "借来的漫画",
    maxQi: 12,
    text: "气上限提高到 12。"
  },
  shop_tab: {
    id: "shop_tab",
    name: "赊账本",
    healAfterElite: 8,
    text: "精英战后回复 8。"
  },
  chalk_stub: {
    id: "chalk_stub",
    name: "粉笔头",
    weakStart: 3,
    text: "敌人第一回合波伤害 -3。"
  },
  class_bell: {
    id: "class_bell",
    name: "上课铃",
    turnLimitDamage: 4,
    text: "第 6 回合后，每回合敌我各掉 4 血。"
  },
  eraser: {
    id: "eraser",
    name: "板擦",
    bonusPierce: 2,
    text: "破防波额外 +2 伤害。"
  },
  lunch_card: {
    id: "lunch_card",
    name: "饭卡",
    healStart: 5,
    text: "每场战斗开始回复 5。"
  },
  paper_plane: {
    id: "paper_plane",
    name: "纸飞机",
    scout: true,
    text: "每场战斗第一回合自动揭示真实动作。"
  }
};

export const ENEMIES = {
  desk_neighbor: {
    id: "desk_neighbor",
    name: "同桌试探者",
    hp: 42,
    pattern: [
      {
        label: "手心向上",
        hint: "大概率攒气，小概率突然小波",
        actions: [
          { chance: 0.7, type: "charge", qi: 2, text: "偷偷攒气" },
          { chance: 0.3, type: "wave", damage: 7, qiCost: 1, text: "小波试探" }
        ]
      },
      {
        label: "手臂交叉",
        hint: "偏向防御",
        actions: [
          { chance: 0.75, type: "guard", block: 8, text: "交叉格挡" },
          { chance: 0.25, type: "charge", qi: 1, text: "边挡边攒" }
        ]
      }
    ]
  },
  turtle_king: {
    id: "turtle_king",
    name: "龟缩王",
    hp: 58,
    pattern: [
      {
        label: "缩进课桌后",
        hint: "高概率防御，普通波会亏",
        actions: [
          { chance: 0.82, type: "guard", block: 10, text: "缩壳防御" },
          { chance: 0.18, type: "charge", qi: 2, text: "壳里攒气" }
        ]
      },
      {
        label: "露出一只手",
        hint: "可能偷小波",
        actions: [
          { chance: 0.55, type: "wave", damage: 9, qiCost: 1, text: "壳中小波" },
          { chance: 0.45, type: "guard", block: 12, text: "继续龟缩" }
        ]
      }
    ]
  },
  ninja_kid: {
    id: "ninja_kid",
    name: "结印忍者",
    hp: 46,
    pattern: [
      {
        label: "手指飞快",
        hint: "攒气或强波",
        actions: [
          { chance: 0.55, type: "charge", qi: 3, text: "结印攒气" },
          { chance: 0.45, type: "wave", damage: 12, qiCost: 2, text: "忍术波" }
        ]
      }
    ]
  },
  sushi_master: {
    id: "sushi_master",
    name: "寿司猜拳王",
    hp: 52,
    pattern: [
      {
        label: "开始握寿司",
        hint: "攒气偏多，但高气后会破防",
        actions: [
          { chance: 0.62, type: "charge", qi: 2, text: "握寿司" },
          { chance: 0.38, type: "wave", damage: 10, qiCost: 2, text: "海胆一击" }
        ]
      }
    ]
  },
  monitor: {
    id: "monitor",
    name: "班长裁判",
    hp: 54,
    pattern: [
      {
        label: "抬手喊停",
        hint: "会防御，也会压制你的波",
        actions: [
          { chance: 0.5, type: "guard", block: 9, text: "纪律防御" },
          { chance: 0.5, type: "wave", damage: 11, qiCost: 2, text: "值日压制" }
        ]
      }
    ]
  },
  next_class_trio: {
    id: "next_class_trio",
    name: "隔壁班三人组",
    hp: 64,
    pattern: [
      {
        label: "三个人对眼神",
        hint: "伤害波动很大",
        actions: [
          { chance: 0.34, type: "charge", qi: 3, text: "集体攒气" },
          { chance: 0.33, type: "guard", block: 11, text: "互相掩护" },
          { chance: 0.33, type: "wave", damage: 15, qiCost: 3, text: "三连波" }
        ]
      }
    ]
  },
  final_boss: {
    id: "final_boss",
    name: "元气弹同学",
    hp: 88,
    pattern: [
      {
        label: "全班开始起哄",
        hint: "攒到足够气会放破防大招",
        actions: [
          { chance: 0.52, type: "charge", qi: 4, text: "收集元气" },
          { chance: 0.28, type: "guard", block: 12, text: "拖到大招" },
          { chance: 0.2, type: "wave", damage: 24, qiCost: 5, pierce: true, text: "元气弹雏形" }
        ]
      }
    ]
  }
};

export const STARTER_DECK = [
  "deep_breath",
  "deep_breath",
  "deep_breath",
  "cross_guard",
  "cross_guard",
  "desk_duck",
  "small_wave",
  "small_wave",
  "small_wave",
  "stare_face"
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hasRelic(state, relicId) {
  return state.relicIds.includes(relicId);
}

export function predictIntent(enemy, roll = Math.random(), turn = 0) {
  const stance = enemy.pattern[turn % enemy.pattern.length];
  let cursor = 0;
  for (const action of stance.actions) {
    cursor += action.chance;
    if (roll <= cursor) {
      return {
        label: stance.label,
        hint: stance.hint,
        revealed: { ...action }
      };
    }
  }
  return {
    label: stance.label,
    hint: stance.hint,
    revealed: { ...stance.actions.at(-1) }
  };
}

export function createCombat({
  enemyId = "desk_neighbor",
  relicIds = [],
  deck = STARTER_DECK,
  rng = Math.random
} = {}) {
  const enemyTemplate = ENEMIES[enemyId];
  const maxQi = relicIds.includes("borrowed_comic") ? RELICS.borrowed_comic.maxQi : 10;
  const predicted = predictIntent(enemyTemplate, rng(), 0);
  const player = {
    hp: 72,
    maxHp: 72,
    qi: 0,
    maxQi,
    energy: 3,
    maxEnergy: 3,
    block: relicIds.includes("duty_armband") ? RELICS.duty_armband.blockStart : 0
  };
  if (relicIds.includes("lunch_card")) {
    player.hp = clamp(player.hp + RELICS.lunch_card.healStart, 0, player.maxHp);
  }
  return {
    turn: 1,
    relicIds: [...relicIds],
    player,
    enemy: {
      id: enemyTemplate.id,
      name: enemyTemplate.name,
      hp: enemyTemplate.hp,
      maxHp: enemyTemplate.hp,
      qi: 0,
      block: 0,
      stance: predicted.label,
      hint: predicted.hint,
      intent: predicted.revealed,
      revealed: true
    },
    deck: [...deck],
    log: [`${enemyTemplate.name}摆出「${predicted.label}」：${predicted.hint}`]
  };
}

export function resolveTurn(state, cardIds) {
  const next = clone(state);
  next.player.block = 0;
  next.enemy.block = 0;
  const cards = cardIds.map((id) => CARDS[id]).filter(Boolean);
  const playerWave = {
    damage: 0,
    pierce: false,
    poison: 0,
    used: false
  };
  const defense = {
    block: 0,
    reflect: 0,
    absorb: 0,
    dodge: 0,
    weak: 0,
    reveal: false
  };

  for (const card of cards) {
    const energy = getEnergyCost(card);
    if (energy > next.player.energy) {
      next.log.push(`能量不够，${card.name}没有打出。`);
      continue;
    }
    const cost = card.cost ?? 0;
    if (cost > next.player.qi) {
      next.log.push(`气不够，${card.name}没有打出。`);
      continue;
    }
    next.player.energy -= energy;
    next.player.qi -= cost;

    if (card.type === "charge") {
      const bonus = hasRelic(next, "red_scarf") ? RELICS.red_scarf.bonusCharge : 0;
      const gained = (card.qi ?? 0) + bonus;
      next.player.qi = clamp(next.player.qi + gained, 0, next.player.maxQi);
      next.player.block += card.block ?? 0;
      defense.dodge += card.dodge ?? 0;
      if (card.heal) {
        next.player.hp = clamp(next.player.hp + card.heal, 0, next.player.maxHp);
      }
      next.log.push(`${card.name}：攒 ${gained} 气。`);
    }

    if (card.type === "guard") {
      next.player.block += card.block ?? 0;
      defense.block += card.block ?? 0;
      defense.reflect += card.reflect ?? 0;
      defense.absorb += card.absorb ?? 0;
      defense.dodge += card.dodge ?? 0;
      next.log.push(`${card.name}：获得 ${card.block ?? 0} 挡。`);
    }

    if (card.type === "wave") {
      const hits = card.hits ?? 1;
      let damage = (card.damage ?? 0) * hits;
      if (next.pendingDamage) {
        damage += next.pendingDamage;
        next.pendingDamage = 0;
      }
      if (card.interruptBonus && next.enemy.intent.type === "charge") {
        damage += card.interruptBonus;
      }
      if (card.pierce && hasRelic(next, "eraser")) {
        damage += RELICS.eraser.bonusPierce;
      }
      playerWave.damage += damage;
      playerWave.pierce ||= Boolean(card.pierce);
      playerWave.poison += card.poison ?? 0;
      playerWave.used = true;
      next.player.qi = clamp(next.player.qi + (card.qi ?? 0), 0, next.player.maxQi);
      next.log.push(`${card.name}：蓄出 ${damage} 点波。`);
    }

    if (card.type === "skill") {
      defense.reveal ||= Boolean(card.reveal);
      next.player.block += card.block ?? 0;
      next.player.qi = clamp(next.player.qi + (card.qi ?? 0), 0, next.player.maxQi);
      next.pendingDamage = (next.pendingDamage ?? 0) + (card.nextDamage ?? 0);
      defense.weak += card.weak ?? 0;
      if (card.reveal) {
        next.enemy.revealed = true;
      }
      next.log.push(`${card.name}：${card.text}`);
    }
  }

  resolvePlayerWave(next, playerWave);
  resolveEnemyIntent(next, defense, playerWave.used);

  if (next.poisonEnemy) {
    next.enemy.hp = clamp(next.enemy.hp - next.poisonEnemy, 0, next.enemy.maxHp);
    next.log.push(`毒波结算：敌人失去 ${next.poisonEnemy} 生命。`);
  }

  if (hasRelic(next, "class_bell") && next.turn >= 6) {
    next.player.hp = clamp(next.player.hp - RELICS.class_bell.turnLimitDamage, 0, next.player.maxHp);
    next.enemy.hp = clamp(next.enemy.hp - RELICS.class_bell.turnLimitDamage, 0, next.enemy.maxHp);
    next.log.push("上课铃催场：双方各失去 4 生命。");
  }

  const template = ENEMIES[next.enemy.id];
  const predicted = predictIntent(template, Math.random(), next.turn);
  next.turn += 1;
  next.player.energy = next.player.maxEnergy;
  next.enemy.stance = predicted.label;
  next.enemy.hint = predicted.hint;
  next.enemy.intent = predicted.revealed;
  next.enemy.revealed = true;
  return next;
}

function resolvePlayerWave(state, wave) {
  if (!wave.used) {
    return;
  }
  const intent = state.enemy.intent;
  if (intent.type === "guard") {
    state.enemy.block = intent.block ?? 0;
    if (wave.pierce) {
      state.enemy.hp = clamp(state.enemy.hp - wave.damage, 0, state.enemy.maxHp);
      state.log.push(`破防命中：无视 ${state.enemy.block} 挡，造成 ${wave.damage} 伤害。`);
    } else {
      const dealt = Math.max(0, wave.damage - state.enemy.block);
      state.enemy.hp = clamp(state.enemy.hp - dealt, 0, state.enemy.maxHp);
      state.log.push(`撞上防御：造成 ${dealt} 伤害。`);
    }
    state.poisonEnemy = (state.poisonEnemy ?? 0) + wave.poison;
    return;
  }

  if (intent.type === "charge") {
    state.enemy.hp = clamp(state.enemy.hp - wave.damage, 0, state.enemy.maxHp);
    state.poisonEnemy = (state.poisonEnemy ?? 0) + wave.poison;
    state.log.push(`命中攒气：造成 ${wave.damage} 伤害，打断对面的节奏。`);
    return;
  }

  if (intent.type === "wave") {
    const enemyDamage = intent.damage ?? 0;
    if (wave.damage >= enemyDamage) {
      const spill = wave.damage - enemyDamage;
      state.enemy.hp = clamp(state.enemy.hp - spill, 0, state.enemy.maxHp);
      state.log.push(`对波压过：抵消敌方波并溢出 ${spill} 伤害。`);
    } else {
      state.log.push("对波吃亏：敌方波会继续压过来。");
    }
    state.poisonEnemy = (state.poisonEnemy ?? 0) + wave.poison;
  }
}

function resolveEnemyIntent(state, defense, playerUsedWave) {
  const intent = state.enemy.intent;
  if (intent.type === "charge") {
    state.enemy.qi = clamp(state.enemy.qi + (intent.qi ?? 0), 0, 10);
    if (!playerUsedWave) {
      state.log.push(`${state.enemy.name}${intent.text}，攒了 ${intent.qi ?? 0} 气。`);
    }
    return;
  }

  if (intent.type === "guard") {
    state.enemy.block = intent.block ?? 0;
    if (!playerUsedWave) {
      state.log.push(`${state.enemy.name}${intent.text}，获得 ${intent.block ?? 0} 挡。`);
    }
    return;
  }

  if (intent.type === "wave") {
    const incoming = Math.max(0, (intent.damage ?? 0) - defense.weak - defense.dodge);
    if (state.player.block >= incoming) {
      if (defense.reflect) {
        state.enemy.hp = clamp(state.enemy.hp - defense.reflect, 0, state.enemy.maxHp);
      }
      if (defense.absorb) {
        state.player.qi = clamp(state.player.qi + defense.absorb, 0, state.player.maxQi);
      }
      state.log.push(`挡住${intent.text}：没有受伤。`);
      return;
    }
    const taken = incoming - state.player.block;
    state.player.hp = clamp(state.player.hp - taken, 0, state.player.maxHp);
    state.log.push(`${intent.text}命中：受到 ${taken} 伤害。`);
  }
}
