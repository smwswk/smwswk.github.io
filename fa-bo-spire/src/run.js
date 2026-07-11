export const RULE_PACKS = {
  beijing: {
    id: "beijing",
    name: "北京基础流",
    tag: "拍拍攒",
    description: "最接近童年母版：攒、防、小波循环，靠读心和破防结束龟缩局。",
    hp: 74,
    deck: [
      "deep_breath",
      "deep_breath",
      "desk_charge",
      "cross_guard",
      "cross_guard",
      "desk_duck",
      "small_wave",
      "small_wave",
      "small_wave",
      "stare_face"
    ],
    relicIds: ["red_scarf"],
    rewards: [
      "desk_charge",
      "mirror_palm",
      "middle_wave",
      "wave_fist",
      "one_inch_wave",
      "seal_break",
      "listen_rhythm",
      "feint",
      "chalk_dust",
      "kamehameha"
    ]
  },
  tianjin: {
    id: "tianjin",
    name: "天津憋气流",
    tag: "拍拍憋",
    description: "边憋边挡，前几回合抗压攒气，再用中波和必杀翻盘。",
    hp: 78,
    deck: [
      "deep_breath",
      "deep_breath",
      "double_clap",
      "double_clap",
      "cross_guard",
      "turtle_guard",
      "small_wave",
      "small_wave",
      "middle_wave",
      "stare_face"
    ],
    relicIds: ["duty_armband"],
    rewards: [
      "double_clap",
      "turtle_guard",
      "absorb_wave",
      "mirror_palm",
      "middle_wave",
      "kamehameha",
      "hamburger",
      "chalk_dust",
      "duty_badge",
      "afterimage"
    ]
  },
  sushi: {
    id: "sushi",
    name: "日本寿司流",
    tag: "寿司猜拳",
    description: "攒气像握寿司，高气牌有返还，适合做大资源循环。",
    hp: 70,
    deck: [
      "deep_breath",
      "sushi_tuna",
      "sushi_tuna",
      "cross_guard",
      "absorb_wave",
      "desk_duck",
      "small_wave",
      "small_wave",
      "sushi_abalone",
      "listen_rhythm"
    ],
    relicIds: ["borrowed_comic"],
    rewards: [
      "sushi_tuna",
      "sushi_abalone",
      "snack_sugar",
      "absorb_wave",
      "middle_wave",
      "yuanqi_bomb",
      "listen_rhythm",
      "hamburger",
      "feint",
      "duty_badge"
    ]
  },
  multiplayer: {
    id: "multiplayer",
    name: "多人班战流",
    tag: "隔壁班约战",
    description: "多段、群波、换目标、反弹，偏混战和连续压制。",
    hp: 76,
    deck: [
      "deep_breath",
      "deep_breath",
      "double_clap",
      "cross_guard",
      "mirror_palm",
      "change_target",
      "small_wave",
      "small_wave",
      "combo_wave",
      "group_wave"
    ],
    relicIds: ["paper_plane"],
    rewards: [
      "combo_wave",
      "group_wave",
      "change_target",
      "mirror_palm",
      "poison_spit",
      "seal_break",
      "duty_badge",
      "afterimage",
      "wave_fist",
      "kamehameha"
    ]
  }
};

const LAYER_TYPES = [
  ["combat", "combat", "event"],
  ["combat", "event", "shop"],
  ["elite", "combat", "rest"],
  ["combat", "shop", "event"],
  ["elite", "combat", "rest"],
  ["shop", "rest", "combat"],
  ["boss"]
];

const ENEMY_BY_TYPE = {
  combat: ["desk_neighbor", "turtle_king", "ninja_kid", "sushi_master", "monitor"],
  elite: ["next_class_trio", "monitor"],
  boss: ["final_boss"]
};

const NODE_LABELS = {
  combat: "普通战",
  elite: "精英战",
  event: "事件",
  shop: "小卖部",
  rest: "医务室",
  boss: "Boss"
};

const NODE_ICONS = {
  combat: "战",
  elite: "精",
  event: "?",
  shop: "店",
  rest: "休",
  boss: "王"
};

export function generateMap({ seed = Date.now() } = {}) {
  const rng = mulberry32(seed);
  const layers = LAYER_TYPES.map((types, layerIndex) => {
    const offset = (3 - types.length) / 2;
    return types.map((type, columnIndex) => {
      const enemyPool = ENEMY_BY_TYPE[type] ?? [];
      return {
        id: `L${layerIndex}N${columnIndex}`,
        layer: layerIndex,
        column: columnIndex + offset,
        type,
        label: NODE_LABELS[type],
        icon: NODE_ICONS[type],
        enemyId: enemyPool.length ? enemyPool[Math.floor(rng() * enemyPool.length)] : null,
        next: []
      };
    });
  });

  for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex += 1) {
    const current = layers[layerIndex];
    const next = layers[layerIndex + 1];
    for (const node of current) {
      node.next = next
        .filter((target) => Math.abs(target.column - node.column) <= 1)
        .map((target) => target.id);
      if (node.next.length === 0) {
        const closest = next
          .slice()
          .sort((a, b) => Math.abs(a.column - node.column) - Math.abs(b.column - node.column))[0];
        node.next = [closest.id];
      }
    }
  }

  return {
    seed,
    layers,
    nodes: Object.fromEntries(layers.flat().map((node) => [node.id, node]))
  };
}

export function getReachableNodeIds(map, currentNodeId) {
  if (!currentNodeId) {
    return map.layers[0].map((node) => node.id);
  }
  return map.nodes[currentNodeId]?.next ?? [];
}

export function createInitialRun({ packId = "beijing", seed = Date.now() } = {}) {
  const pack = RULE_PACKS[packId] ?? RULE_PACKS.beijing;
  return {
    packId: pack.id,
    hp: pack.hp,
    maxHp: pack.hp,
    gold: 60,
    deck: [...pack.deck],
    relicIds: [...pack.relicIds],
    rewardPool: [...pack.rewards],
    map: generateMap({ seed }),
    currentNodeId: null,
    completedNodeIds: [],
    reachableNodeIds: []
  };
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function next() {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
