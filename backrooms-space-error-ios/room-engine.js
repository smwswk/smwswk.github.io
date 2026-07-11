const DOORS = [
  { id: "left", label: "左" },
  { id: "center", label: "前" },
  { id: "right", label: "右" },
];

const DOOR_GEOMETRY = {
  origin: { turnDeg: 0, pushDepth: 0, lateralShift: 0 },
  left: { turnDeg: -18, pushDepth: 1.1, lateralShift: -0.22 },
  center: { turnDeg: 0, pushDepth: 1.35, lateralShift: 0 },
  right: { turnDeg: 18, pushDepth: 1.1, lateralShift: 0.22 },
  exit: { turnDeg: 0, pushDepth: 2.4, lateralShift: 0 },
};

const LEVEL_THEMES = [
  {
    id: "level-0",
    name: "Level 0 / 黄墙前厅",
    shortName: "黄墙",
    ambience: "嗡鸣",
    doorLabels: {
      left: "潮湿墙纸",
      center: "房间 118",
      right: "灯下空廊",
      exit: "静音金属",
    },
  },
  {
    id: "level-1",
    name: "Level 1 / 可居住区",
    shortName: "灰仓",
    ambience: "远处的配电声",
    doorLabels: {
      left: "灰柱区",
      center: "补给箱",
      right: "雾仓门",
      exit: "无编号门",
    },
  },
  {
    id: "level-2",
    name: "Level 2 / 管线走廊",
    shortName: "管线",
    ambience: "管道回流声",
    doorLabels: {
      left: "阀门",
      center: "热管线",
      right: "紫应急灯",
      exit: "停机门",
    },
  },
  {
    id: "level-4",
    name: "Level 4 / 空办公室",
    shortName: "空办公室",
    ambience: "空调低频",
    doorLabels: {
      left: "黑窗",
      center: "空办公区",
      right: "饮水机",
      exit: "下行楼梯",
    },
  },
  {
    id: "level-37",
    name: "Level 37 / Poolrooms",
    shortName: "浅水",
    ambience: "被水压低的回声",
    doorLabels: {
      left: "白瓷砖",
      center: "浅水厅",
      right: "蓝绿回声",
      exit: "无声水线",
    },
  },
];

const SIGN_POOLS = [
  ["出口在前方", "楼梯向左", "房间 118", "授权路线", "保持直行"],
  ["出口在你身后", "楼梯向右", "房间 118", "授权路线", "保持原路"],
  ["出口在前方", "前方没有出口", "房间 119", "房间 118", "向下即向上"],
  ["楼梯向左", "楼梯向右", "本房间在上一间之前", "本房间在上一间之后", "来路未登记"],
  ["防火门：保持关闭", "防火门：保持开启", "地图已更新", "地图已移除", "走廊已转向"],
  ["你在这里", "你曾在这里", "出口 3 米", "出口 300 米", "本层没有本层"],
  ["出口", "不是出口", "跟着嗡鸣走", "忽略嗡鸣", "请从背面进入正面"],
];

const OBJECTS = [
  "两把椅子面向「{door}」",
  "拖把桶停在「{door}」门槛前",
  "天花板格栅只在「{door}」上方下垂",
  "一摞复印纸整齐地偏向「{door}」",
  "唯一干燥的地毯痕迹通向「{door}」",
  "墙角电线沿着「{door}」延伸",
  "掉落的门牌背面朝向「{door}」",
  "浅水波纹只在「{door}」前方断开",
];

function hashText(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededPick(seed, index, list) {
  return list[hashText(`${seed}:${index}`) % list.length];
}

function targetDoorId(state) {
  const pattern = ["center", "right", "left", "center", "left", "right", "center", "right", "left"];
  return pattern[(hashText(state.seed) + state.roomIndex + state.proximity) % pattern.length];
}

function themeForState(state) {
  if (isExitAvailable(state)) return LEVEL_THEMES[4];
  if (state.roomIndex === 0) return LEVEL_THEMES[0];
  const index = Math.min(LEVEL_THEMES.length - 1, Math.floor((state.roomIndex + state.proximity) / 2));
  return LEVEL_THEMES[index % LEVEL_THEMES.length];
}

function audioLabelFor(theme, doorLabel, clueDoorId) {
  if (clueDoorId === "exit") return `低频停在「${doorLabel}」背后`;
  if (theme.id === "level-2") return `管道回流声贴着「${doorLabel}」`;
  if (theme.id === "level-4") return `空调低频只在「${doorLabel}」后方变稳`;
  if (theme.id === "level-37") return `水声只在「${doorLabel}」前方有回声`;
  if (theme.id === "level-1") return `配电声在「${doorLabel}」门缝里变清楚`;
  return `嗡鸣在「${doorLabel}」门缝里变薄`;
}

export function createInitialState(seed = "space-error") {
  return {
    seed,
    roomIndex: 0,
    proximity: 0,
    history: [],
    escaped: false,
    lastDoor: "origin",
    lastCorrect: false,
  };
}

export function getDoorChoices(state) {
  if (isExitAvailable(state)) {
    return [
      { id: "left", label: "左" },
      { id: "exit", label: "没有标牌的金属门" },
      { id: "right", label: "右" },
    ];
  }
  return DOORS;
}

export function isExitAvailable(state) {
  return state.proximity >= 9 && state.roomIndex >= 8;
}

export function getDoorGeometry(doorId) {
  return { ...(DOOR_GEOMETRY[doorId] ?? DOOR_GEOMETRY.origin) };
}

export function chooseDoor(state, doorId) {
  if (doorId === "exit" && isExitAvailable(state)) {
    return {
      ...state,
      roomIndex: state.roomIndex + 1,
      escaped: true,
      history: [...state.history, doorId],
      lastDoor: doorId,
      lastCorrect: true,
    };
  }

  const correctDoor = targetDoorId(state);
  const correct = doorId === correctDoor;
  const driftPenalty = state.roomIndex > 6 ? 2 : 1;
  const proximity = correct
    ? Math.min(10, state.proximity + (state.proximity > 6 ? 2 : 1))
    : Math.max(0, state.proximity - driftPenalty);

  return {
    ...state,
    roomIndex: state.roomIndex + 1,
    proximity,
    history: [...state.history, doorId],
    lastDoor: doorId,
    lastCorrect: correct,
  };
}

export function describeRoom(state) {
  const clueDoorId = isExitAvailable(state) ? "exit" : targetDoorId(state);
  const levelTheme = themeForState(state);
  const doorLabels = levelTheme.doorLabels;
  const clueDoorLabel = doorLabels[clueDoorId] ?? doorLabels.center;
  const contradictionLevel = Math.min(6, Math.floor(state.roomIndex / 2) + Math.max(0, state.proximity - 3));
  const pool = SIGN_POOLS[contradictionLevel];
  const shiftedPool = pool.map((_, index) => pool[(index + state.roomIndex) % pool.length]);
  const wallNoise = shiftedPool.filter((sign) => !sign.includes(clueDoorLabel));
  const roomCode = 118 + ((state.roomIndex * 7) % 13);
  const signs = isExitAvailable(state)
    ? [doorLabels.exit, "不是出口", "低频已经停止", levelTheme.shortName, "请勿确认安静"]
    : [
        levelTheme.shortName,
        wallNoise[0] ?? "出口在前方",
        wallNoise[1] ?? "楼梯向左",
        `编号 ${roomCode}`,
        wallNoise[2] ?? "授权路线",
      ];
  const objectPhrase = seededPick(state.seed, state.roomIndex, OBJECTS).replace("{door}", clueDoorLabel);
  const flicker = 0.18 + Math.min(0.55, state.roomIndex * 0.025 + state.proximity * 0.035);
  const entryGeometry = DOOR_GEOMETRY[state.lastDoor] ?? DOOR_GEOMETRY.origin;
  const wrongness = contradictionLevel / 6;

  return {
    roomNumber: roomCode,
    contradictionLevel,
    closeness: state.proximity / 10,
    flicker,
    humidity: 45 + ((state.roomIndex * 11 + state.proximity * 7) % 35),
    levelTheme,
    doorLabels,
    signs,
    spatialFeedback: {
      entryDirection: state.lastDoor,
      turnDeg: entryGeometry.turnDeg + (state.lastCorrect ? 0 : 9),
      pushDepth: entryGeometry.pushDepth + state.proximity * 0.08,
      lateralShift: entryGeometry.lateralShift + (state.lastCorrect ? 0 : -0.08),
      wrongness,
      corridorRepeats: 2 + Math.min(6, Math.floor(state.roomIndex / 2)),
    },
    audioClue: {
      doorId: clueDoorId,
      label: audioLabelFor(levelTheme, clueDoorLabel, clueDoorId),
      intensity: 0.25 + state.proximity * 0.07,
    },
    objectClue: {
      doorId: clueDoorId,
      label: clueDoorId === "exit" ? `所有散落物都让出一条通向「${clueDoorLabel}」的空路` : objectPhrase,
    },
  };
}
