import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";
import {
  chooseDoor,
  createInitialState,
  describeRoom,
  getDoorChoices,
  getDoorGeometry,
  isExitAvailable,
} from "./room-engine.js";

const canvas = document.querySelector("#worldCanvas");
const fade = document.querySelector("#fade");
const timerEl = document.querySelector("#timer");
const roomLabel = document.querySelector("#roomLabel");
const meterFill = document.querySelector("#meterFill");
const statusEl = document.querySelector("#status");
const startButton = document.querySelector("#startButton");
const restartButton = document.querySelector("#restartButton");
const endingOverlay = document.querySelector("#endingOverlay");
const directionButtons = [...document.querySelectorAll("[data-door]")];

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x111006, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x181609, 0.035);

const camera = new THREE.PerspectiveCamera(72, 1, 0.1, 80);
camera.position.set(0, 1.38, 6.9);
camera.rotation.order = "YXZ";

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();

let state = createInitialState(String(Date.now()));
let roomGroup = new THREE.Group();
let portalMeshes = [];
let started = false;
let remainingSeconds = 180;
let timerId;
let audioSupported = true;
let audioContext;
let oscillator;
let lowOscillator;
let gain;
let panner;
let transition = null;

scene.add(new THREE.HemisphereLight(0xd8cd82, 0x1f1d10, 1.05));
const fillLight = new THREE.DirectionalLight(0xcfc079, 0.55);
fillLight.position.set(-3, 5, 4);
scene.add(fillLight);
scene.add(roomGroup);

function paletteForRoom(room) {
  const palettes = {
    "level-0": {
      wall: "#c8b763",
      wallLine: "rgba(65,59,33,.24)",
      floor: "#4c472b",
      ceiling: 0xbbae67,
      fog: 0x181609,
      accent: 0xd8c86e,
    },
    "level-1": {
      wall: "#8e8b7d",
      wallLine: "rgba(44,46,43,.28)",
      floor: "#3d3f3d",
      ceiling: 0x747466,
      fog: 0x171916,
      accent: 0xc9c18d,
    },
    "level-2": {
      wall: "#6c6658",
      wallLine: "rgba(31,29,25,.36)",
      floor: "#302f2b",
      ceiling: 0x565044,
      fog: 0x130f16,
      accent: 0xc9b36a,
    },
    "level-4": {
      wall: "#b7b9ad",
      wallLine: "rgba(49,54,56,.22)",
      floor: "#45505a",
      ceiling: 0x9fa39a,
      fog: 0x111418,
      accent: 0xd3cf9d,
    },
    "level-37": {
      wall: "#d9dfd7",
      wallLine: "rgba(68,91,96,.24)",
      floor: "#c7d5cf",
      ceiling: 0xd4dcd4,
      fog: 0x0e1a1b,
      accent: 0xd7eee8,
    },
  };
  return palettes[room.levelTheme.id] ?? palettes["level-0"];
}

function textureFromCanvas(width, height, draw) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function makeWallpaperTexture(room) {
  const palette = paletteForRoom(room);
  const texture = textureFromCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = palette.wall;
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 48) {
      ctx.fillStyle = y % 96 === 0 ? "rgba(101,91,47,.26)" : "rgba(60,54,30,.18)";
      ctx.fillRect(0, y, w, 2);
    }
    for (let x = 0; x < w; x += 58) {
      ctx.fillStyle = palette.wallLine;
      ctx.fillRect(x, 0, 2, h);
    }
    if (room.levelTheme.id === "level-37") {
      for (let y = 0; y < h; y += 42) {
        ctx.fillStyle = "rgba(255,255,255,.24)";
        ctx.fillRect(0, y, w, 2);
      }
      for (let x = 0; x < w; x += 42) {
        ctx.fillStyle = "rgba(255,255,255,.2)";
        ctx.fillRect(x, 0, 2, h);
      }
    }
    const wrong = room.spatialFeedback.wrongness;
    for (let i = 0; i < 900; i += 1) {
      const a = 0.015 + wrong * 0.025;
      ctx.fillStyle = `rgba(35,31,16,${a})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
  });
  texture.repeat.set(2.2, 1.2);
  return texture;
}

function makeCarpetTexture(room) {
  const palette = paletteForRoom(room);
  const texture = textureFromCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = palette.floor;
    ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 26) {
      ctx.fillStyle = "rgba(25,24,15,.22)";
      ctx.fillRect(x, 0, 1, h);
    }
    for (let i = 0; i < 700; i += 1) {
      ctx.fillStyle = "rgba(210,198,112,.035)";
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 1);
    }
  });
  texture.repeat.set(4, 4);
  return texture;
}

function makeSignTexture(text, width = 512, height = 180) {
  return textureFromCanvas(width, height, (ctx, w, h) => {
    ctx.fillStyle = "#d8c86e";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#232015";
    ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.fillStyle = "#17150f";
    ctx.font = "700 46px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = wrapText(ctx, text, w - 52);
    const start = h / 2 - (lines.length - 1) * 28;
    lines.forEach((line, index) => ctx.fillText(line, w / 2, start + index * 56));
  });
}

function wrapText(ctx, text, maxWidth) {
  const chars = [...text];
  const lines = [];
  let line = "";
  for (const ch of chars) {
    const next = `${line}${ch}`;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function material({ color, map, roughness = 0.92, metalness = 0.02, emissive = 0x000000, emissiveIntensity = 0 }) {
  return new THREE.MeshStandardMaterial({
    color,
    ...(map ? { map } : {}),
    roughness,
    metalness,
    emissive,
    emissiveIntensity,
  });
}

function clearRoom() {
  roomGroup.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
  });
  scene.remove(roomGroup);
  roomGroup = new THREE.Group();
  scene.add(roomGroup);
  portalMeshes = [];
}

function createBox(width, height, depth, mat, pos, rot = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  roomGroup.add(mesh);
  return mesh;
}

function createCylinder(radius, depth, mat, pos, rot = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, 24), mat);
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  roomGroup.add(mesh);
  return mesh;
}

function createPlane(width, height, mat, pos, rot = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  roomGroup.add(mesh);
  return mesh;
}

function createPortal({ id, label, x, y, z, ry, w, h, low = false }) {
  const frameMat = material({ color: 0x1c1b14, roughness: 0.78 });
  const doorMat = material({ color: id === "exit" ? 0x26362d : 0x3f3d31, roughness: 0.88 });
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = ry;
  roomGroup.add(group);

  const door = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.16), doorMat);
  door.position.y = h / 2;
  group.add(door);

  const sideW = 0.12;
  const topH = 0.13;
  const left = new THREE.Mesh(new THREE.BoxGeometry(sideW, h + topH, 0.22), frameMat);
  left.position.set(-w / 2 - sideW / 2, h / 2, 0.04);
  group.add(left);
  const right = left.clone();
  right.position.x = w / 2 + sideW / 2;
  group.add(right);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w + sideW * 2, topH, 0.22), frameMat);
  top.position.set(0, h + topH / 2, 0.04);
  group.add(top);

  const sign = createSign(label, w * (low ? 0.92 : 0.96), 0.34);
  sign.position.set(0, h + 0.26, 0.18);
  sign.rotation.y = Math.PI;
  group.add(sign);

  door.userData.doorId = id;
  portalMeshes.push(door);
  return group;
}

function createSign(text, width = 1.35, height = 0.48) {
  const tex = makeSignTexture(text);
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
}

function createWallSign(text, pos, rot = [0, 0, 0], size = [1.85, 0.56]) {
  const sign = createSign(text, size[0], size[1]);
  sign.position.set(...pos);
  sign.rotation.set(...rot);
  roomGroup.add(sign);
}

function createLightTube(x, z, flicker) {
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0xf0e8aa,
    emissive: 0xf1e9ab,
    emissiveIntensity: 1.25 + flicker,
    roughness: 0.2,
  });
  const tube = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 0.16), tubeMat);
  tube.position.set(x, 3.05, z);
  roomGroup.add(tube);
  const light = new THREE.PointLight(0xe9db8d, 1.45 + flicker * 0.9, 10);
  light.position.set(x, 2.88, z);
  roomGroup.add(light);
}

function createCeilingGrid(wrong) {
  const gridMat = material({ color: 0x6b6134, roughness: 0.95 });
  for (let x = -4.5; x <= 4.5; x += 1) {
    createBox(0.025, 0.035, 10, gridMat, [x + Math.sin(x * 2.1) * wrong * 0.04, 3.18, 0]);
  }
  for (let z = -4.5; z <= 4.5; z += 1) {
    createBox(10, 0.035, 0.025, gridMat, [0, 3.18, z + Math.cos(z * 1.7) * wrong * 0.04]);
  }
}

function createRoomDetails(room) {
  const wrong = room.spatialFeedback.wrongness;
  const trimMat = material({ color: 0x40391f, roughness: 0.92 });
  const stainMat = new THREE.MeshBasicMaterial({ color: 0x2e3021, transparent: true, opacity: 0.55, depthWrite: false });
  const dampMat = new THREE.MeshBasicMaterial({ color: 0x73805b, transparent: true, opacity: 0.16, depthWrite: false });

  createCeilingGrid(wrong);
  createBox(10, 0.08, 0.08, trimMat, [0, 0.08, -5.08]);
  createBox(0.08, 0.08, 10, trimMat, [-4.92, 0.08, 0]);
  createBox(0.08, 0.08, 10, trimMat, [4.92, 0.08, 0]);

  for (let z = -4.2; z <= 3.8; z += 1.25) {
    createBox(9.4, 0.012, 0.035, trimMat, [0, 0.022, z + wrong * 0.12], [0, wrong * 0.03, 0]);
  }
  for (let x = -4.2; x <= 4.2; x += 1.25) {
    createBox(0.035, 0.012, 9.4, trimMat, [x - wrong * 0.08, 0.024, 0]);
  }

  const stain1 = new THREE.Mesh(new THREE.CircleGeometry(0.9, 36), stainMat);
  stain1.position.set(-1.8 + wrong * 0.8, 0.028, 0.7);
  stain1.rotation.x = -Math.PI / 2;
  stain1.scale.set(1.5, 0.45, 1);
  roomGroup.add(stain1);

  const damp = new THREE.Mesh(new THREE.CircleGeometry(1.15, 42), dampMat);
  damp.position.set(2.5 - wrong * 0.7, 0.03, -1.8);
  damp.rotation.x = -Math.PI / 2;
  damp.scale.set(1.7, 0.34, 1);
  roomGroup.add(damp);
}

function createPipeRun(room) {
  const pipeMat = material({ color: 0x5d574d, roughness: 0.7, metalness: 0.25 });
  const violetMat = material({ color: 0x64538b, emissive: 0x3d2a66, emissiveIntensity: 0.35, roughness: 0.6 });
  createCylinder(0.055, 8.2, pipeMat, [0, 2.62, -4.86], [0, 0, Math.PI / 2]);
  createCylinder(0.04, 5.8, pipeMat, [-4.65, 1.86, -1.2], [Math.PI / 2, 0, 0]);
  createCylinder(0.04, 5.8, pipeMat, [4.65, 1.86, -1.2], [Math.PI / 2, 0, 0]);
  for (let x = -3; x <= 3; x += 3) {
    createCylinder(0.12, 0.04, violetMat, [x, 2.08, -5.05], [Math.PI / 2, 0, 0]);
  }
  if (room.levelTheme.id === "level-2") {
    const warning = createSign("压力表读数相同", 1.3, 0.36);
    warning.position.set(-3.25, 2.15, -5.02);
    roomGroup.add(warning);
  }
}

function createOfficeWindows() {
  const glassMat = new THREE.MeshBasicMaterial({ color: 0x020304, transparent: true, opacity: 0.88 });
  for (let x = -3.6; x <= 3.6; x += 2.4) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.86), glassMat);
    win.position.set(x, 2.0, -5.09);
    roomGroup.add(win);
  }
  const coolerMat = material({ color: 0xb8c0b5, roughness: 0.6 });
  const bottleMat = new THREE.MeshBasicMaterial({ color: 0x9cc7d1, transparent: true, opacity: 0.58 });
  createBox(0.34, 0.75, 0.28, coolerMat, [3.95, 0.38, -3.5]);
  createCylinder(0.16, 0.26, bottleMat, [3.95, 0.92, -3.5], [0, 0, 0]);
}

function createPoolWater(room) {
  const waterMat = new THREE.MeshBasicMaterial({ color: 0x6fb0b2, transparent: true, opacity: 0.28, depthWrite: false });
  const tileMat = material({ color: 0xdce6df, roughness: 0.92 });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1.35), waterMat);
  pool.position.set(-2.1, 0.045, -1.8);
  pool.rotation.x = -Math.PI / 2;
  roomGroup.add(pool);
  const pool2 = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.9), waterMat);
  pool2.position.set(2.35, 0.046, -3.0);
  pool2.rotation.x = -Math.PI / 2;
  roomGroup.add(pool2);
  createCylinder(0.22, 2.8, tileMat, [-4.1, 1.4, -2.8]);
  createCylinder(0.18, 2.8, tileMat, [4.2, 1.4, -2.2]);
  if (room.levelTheme.id === "level-37") {
    const sign = createSign("声音在水面以下", 1.65, 0.4);
    sign.position.set(2.9, 2.18, -5.02);
    roomGroup.add(sign);
  }
}

function createWarehouseDetails() {
  const crateMat = material({ color: 0x8b7753, roughness: 0.86 });
  const pillarMat = material({ color: 0x77756d, roughness: 0.92 });
  createCylinder(0.18, 3.0, pillarMat, [-4.15, 1.5, -3.15]);
  createCylinder(0.18, 3.0, pillarMat, [4.15, 1.5, -3.15]);
  createBox(0.72, 0.48, 0.62, crateMat, [-3.2, 0.24, -2.2]);
  createBox(0.52, 0.38, 0.52, crateMat, [-2.55, 0.19, -2.28]);
}

function createLevelDetails(room) {
  if (room.levelTheme.id === "level-1") createWarehouseDetails();
  if (room.levelTheme.id === "level-2") createPipeRun(room);
  if (room.levelTheme.id === "level-4") createOfficeWindows();
  if (room.levelTheme.id === "level-37") createPoolWater(room);
}

function createObjectClue(room) {
  const target = room.objectClue.doorId;
  const clueMat = material({ color: 0x9a8e52, roughness: 0.84 });
  const darkMat = material({ color: 0x343124, roughness: 0.8 });
  const positions = {
    left: [-3.7, 0.25, -2.8],
    center: [0.2, 0.25, -3.7],
    right: [3.7, 0.25, -2.8],
    exit: [0, 0.25, -3.8],
  };
  const [x, y, z] = positions[target] ?? [0, 0.25, -2.8];

  if (room.objectClue.label.includes("椅子")) {
    createBox(0.38, 0.5, 0.38, clueMat, [x - 0.35, y, z]);
    createBox(0.38, 0.5, 0.38, clueMat, [x + 0.35, y, z]);
    createBox(0.9, 0.08, 0.08, darkMat, [x, y + 0.35, z - 0.22]);
    return;
  }

  if (room.objectClue.label.includes("拖把桶")) {
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.42, 24), clueMat);
    bucket.position.set(x, y, z);
    roomGroup.add(bucket);
    createBox(0.05, 1.1, 0.05, darkMat, [x + 0.2, y + 0.5, z - 0.1], [0.32, 0, 0.18]);
    return;
  }

  if (room.objectClue.label.includes("天花板格栅")) {
    const tileMat = material({ color: 0xa99d59, roughness: 0.95 });
    createBox(0.9, 0.04, 0.65, tileMat, [x, 2.82, z], [0.32, 0.14, -0.2]);
    createBox(0.08, 0.72, 0.08, darkMat, [x + 0.28, 2.48, z - 0.16], [0.2, 0, 0.08]);
    return;
  }

  if (room.objectClue.label.includes("电线")) {
    for (let i = 0; i < 6; i += 1) {
      createBox(0.12, 0.05, 0.55, darkMat, [x + i * 0.22 - 0.55, 0.04, z - i * 0.28], [0, 0.35, 0]);
    }
    return;
  }

  if (room.objectClue.label.includes("地毯") || room.objectClue.label.includes("水渍")) {
    const trailMat = new THREE.MeshBasicMaterial({ color: 0xc4bd78, transparent: true, opacity: 0.22, depthWrite: false });
    for (let i = 0; i < 5; i += 1) {
      const trail = new THREE.Mesh(new THREE.CircleGeometry(0.32 + i * 0.04, 24), trailMat);
      trail.position.set(x * (i / 5), 0.034, 1.4 + (z - 1.4) * (i / 5));
      trail.rotation.x = -Math.PI / 2;
      trail.scale.set(1.5, 0.38, 1);
      roomGroup.add(trail);
    }
    return;
  }

  createBox(0.92, 0.18, 0.58, clueMat, [x, y, z]);
  createBox(0.7, 0.12, 0.48, darkMat, [x + 0.22, y + 0.18, z - 0.08]);
}

function createRoom() {
  clearRoom();
  const room = describeRoom(state);
  const palette = paletteForRoom(room);
  scene.fog.color.setHex(palette.fog);
  const wrong = room.spatialFeedback.wrongness;
  const wallTex = makeWallpaperTexture(room);
  const carpetTex = makeCarpetTexture(room);
  const wallMat = material({ color: 0xffffff, map: wallTex, roughness: 0.96 });
  const carpetMat = material({ color: 0xffffff, map: carpetTex, roughness: 1 });
  const ceilingMat = material({ color: palette.ceiling, roughness: 0.96 });

  const skew = wrong * 0.09;
  createPlane(10, 3.2, wallMat, [0, 1.6, -5.2], [0, 0 + skew, 0]);
  createPlane(12, 3.2, wallMat, [-5, 1.6, 0], [0, Math.PI / 2 - skew, 0]);
  createPlane(12, 3.2, wallMat, [5, 1.6, 0], [0, -Math.PI / 2 + skew, 0]);
  createPlane(10, 10, carpetMat, [0, 0, 0], [-Math.PI / 2, 0, 0]);
  createPlane(10, 10, ceilingMat, [0, 3.2, 0], [Math.PI / 2, 0, 0]);

  createLightTube(-2.6, -1.6, room.flicker);
  createLightTube(2.4, 1.2, room.flicker * 0.7);
  createRoomDetails(room);
  createLevelDetails(room);

  const available = getDoorChoices(state);
  const visibleDoorIds = new Set(available.map((door) => door.id));
  if (visibleDoorIds.has("left")) createPortal({ id: "left", label: room.doorLabels.left, x: -3.05, y: 0, z: -5.06, ry: 0.16, w: 1.22, h: 2.2 });
  if (visibleDoorIds.has("center")) createPortal({ id: "center", label: room.doorLabels.center, x: 0, y: 0, z: -5.08, ry: 0, w: 1.55, h: 2.35 });
  if (visibleDoorIds.has("right")) createPortal({ id: "right", label: room.doorLabels.right, x: 3.05, y: 0, z: -5.06, ry: -0.16, w: 1.22, h: 2.2 });
  if (visibleDoorIds.has("exit")) createPortal({ id: "exit", label: room.doorLabels.exit, x: 0, y: 0, z: -5.1, ry: 0, w: 1.55, h: 2.35 });

  const signs = room.signs.slice(0, 5);
  createWallSign(signs[0], [-4.9, 2.24, -2.35], [0, Math.PI / 2, 0], [1.42, 0.44]);
  createWallSign(signs[1], [4.9, 2.24, -2.35], [0, -Math.PI / 2, 0], [1.42, 0.44]);
  createWallSign(signs[2], [-4.9, 2.18, 1.1], [0, Math.PI / 2, 0], [1.42, 0.44]);
  createWallSign(signs[3], [4.9, 2.18, 1.1], [0, -Math.PI / 2, 0], [1.42, 0.44]);
  createWallSign(signs[4], [4.9, 1.42, 2.55], [0, -Math.PI / 2, 0], [1.42, 0.44]);

  createObjectClue(room);

  for (let i = 0; i < room.spatialFeedback.corridorRepeats; i += 1) {
    const z = -4.8 + i * 1.9;
    const frameMat = material({ color: 0x3a341e, roughness: 0.9 });
    createBox(0.08, 3.15, 0.08, frameMat, [-4.85 + wrong * i * 0.18, 1.55, z]);
    createBox(0.08, 3.15, 0.08, frameMat, [4.85 - wrong * i * 0.18, 1.55, z]);
  }

  updateHud(room);
  updateDirections(available);
  updateAudio(room);
}

function updateHud(room) {
  timerEl.textContent = formatTime(remainingSeconds);
  roomLabel.textContent = `${room.levelTheme.shortName} ${room.roomNumber}`;
  meterFill.style.width = `${Math.round(room.closeness * 100)}%`;
  statusEl.textContent = `${room.audioClue.label}。${room.objectClue.label}。`;
  if (state.escaped) {
    statusEl.textContent = "嗡鸣停了。下一间房间不再是房间。";
  } else if (remainingSeconds <= 0) {
    statusEl.textContent = "房间继续接收同一扇门。";
  }
}

function updateDirections(available) {
  const ids = new Set(available.map((door) => door.id));
  directionButtons.forEach((button) => {
    const visible = ids.has(button.dataset.door);
    button.classList.toggle("hidden", !visible);
    button.disabled = !started || state.escaped || remainingSeconds <= 0 || !visible;
  });
}

function formatTime(seconds) {
  const minute = String(Math.floor(seconds / 60)).padStart(2, "0");
  const second = String(seconds % 60).padStart(2, "0");
  return `${minute}:${second}`;
}

function ensureAudio() {
  if (!audioSupported) return false;
  if (audioContext) {
    if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
    return true;
  }

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    audioSupported = false;
    return false;
  }

  try {
    audioContext = new AudioContextCtor();
    oscillator = audioContext.createOscillator();
    lowOscillator = audioContext.createOscillator();
    gain = audioContext.createGain();
    panner = audioContext.createStereoPanner ? audioContext.createStereoPanner() : null;
  } catch {
    audioSupported = false;
    return false;
  }

  oscillator.type = "sawtooth";
  lowOscillator.type = "sine";
  oscillator.frequency.value = 74;
  lowOscillator.frequency.value = 38;
  gain.gain.value = 0.025;
  oscillator.connect(gain);
  lowOscillator.connect(gain);
  if (panner) {
    gain.connect(panner);
    panner.connect(audioContext.destination);
  } else {
    gain.connect(audioContext.destination);
  }
  oscillator.start();
  lowOscillator.start();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return true;
}

function panForDoor(doorId) {
  if (doorId === "left") return -0.72;
  if (doorId === "right") return 0.72;
  return 0;
}

function updateAudio(room) {
  if (!audioContext || !oscillator || !lowOscillator || !gain) return;
  const closeness = state.proximity / 10;
  oscillator.frequency.setTargetAtTime(74 + state.roomIndex * 1.2, audioContext.currentTime, 0.1);
  lowOscillator.frequency.setTargetAtTime(isExitAvailable(state) ? 58 : 38 + closeness * 12, audioContext.currentTime, 0.1);
  gain.gain.setTargetAtTime(0.02 + closeness * 0.04, audioContext.currentTime, 0.14);
  if (panner) panner.pan.setTargetAtTime(panForDoor(room.audioClue.doorId), audioContext.currentTime, 0.14);
}

function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    if (!started || state.escaped) return;
    remainingSeconds = Math.max(0, remainingSeconds - 1);
    updateHud(describeRoom(state));
    if (remainingSeconds === 0) {
      clearInterval(timerId);
      updateDirections(getDoorChoices(state));
    }
  }, 1000);
}

function startGame() {
  if (started) return;
  started = true;
  hideEnding();
  ensureAudio();
  startButton.textContent = "正在听";
  startButton.disabled = true;
  updateDirections(getDoorChoices(state));
  startTimer();
  createRoom();
}

function moveThroughDoor(doorId) {
  if (!started || state.escaped || remainingSeconds <= 0 || transition) return;
  const nextState = chooseDoor(state, doorId);
  const correct = nextState.proximity > state.proximity || nextState.escaped;
  state = nextState;
  const geom = getDoorGeometry(doorId);
  const turnRadians = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(geom.turnDeg * -0.72, -72, 72));
  const from = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
    ry: camera.rotation.y,
  };
  transition = {
    t: 0,
    duration: 0.68,
    correct,
    from,
    to: {
      x: geom.lateralShift * 2.4,
      y: 1.45,
      z: correct ? 2.1 - geom.pushDepth * 0.18 : 3.0 - geom.pushDepth * 0.12,
      ry: turnRadians,
    },
  };
  fade.classList.add("active");
}

function finishTransition() {
  camera.position.set(0, 1.38, 6.9);
  camera.rotation.set(0, 0, 0);
  createRoom();
  fade.classList.remove("active");
  transition = null;
  if (state.escaped) {
    clearInterval(timerId);
    updateDirections(getDoorChoices(state));
    showEnding();
  }
}

function showEnding() {
  startButton.textContent = "已离开";
  startButton.disabled = true;
  if (!endingOverlay) return;
  endingOverlay.classList.remove("hidden");
  requestAnimationFrame(() => endingOverlay.classList.add("show"));
}

function hideEnding() {
  if (!endingOverlay) return;
  endingOverlay.classList.remove("show");
  endingOverlay.classList.add("hidden");
}

function restartGame() {
  clearInterval(timerId);
  hideEnding();
  state = createInitialState(String(Date.now()));
  remainingSeconds = 180;
  started = false;
  transition = null;
  fade.classList.remove("active");
  camera.position.set(0, 1.38, 6.9);
  camera.rotation.set(0, 0, 0);
  startButton.textContent = "开始";
  startButton.disabled = false;
  createRoom();
  updateDirections(getDoorChoices(state));
}

function onCanvasPointer(event) {
  if (!started || transition) return;
  const rect = canvas.getBoundingClientRect();
  const x = "clientX" in event ? event.clientX : event.changedTouches?.[0]?.clientX;
  const y = "clientY" in event ? event.clientY : event.changedTouches?.[0]?.clientY;
  if (typeof x !== "number" || typeof y !== "number") return;
  pointer.x = ((x - rect.left) / rect.width) * 2 - 1;
  pointer.y = -(((y - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(portalMeshes, false)[0];
  if (hit?.object?.userData?.doorId) {
    moveThroughDoor(hit.object.userData.doorId);
  }
}

function bindPress(button, handler) {
  let lastTouchAt = 0;
  button.addEventListener(
    "touchend",
    (event) => {
      event.preventDefault();
      lastTouchAt = Date.now();
      handler();
    },
    { passive: false }
  );
  button.addEventListener("click", () => {
    if (Date.now() - lastTouchAt < 450) return;
    handler();
  });
}

function resize() {
  const width = window.innerWidth || 1;
  const height = window.innerHeight || 1;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (transition) {
    transition.t += dt / transition.duration;
    const t = Math.min(transition.t, 1);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    camera.position.x = THREE.MathUtils.lerp(transition.from.x, transition.to.x, eased);
    camera.position.y = THREE.MathUtils.lerp(transition.from.y, transition.to.y, eased);
    camera.position.z = THREE.MathUtils.lerp(transition.from.z, transition.to.z, eased);
    camera.rotation.y = THREE.MathUtils.lerp(transition.from.ry, transition.to.ry, eased);
    if (t >= 1) finishTransition();
  } else {
    const time = clock.elapsedTime;
    const room = describeRoom(state);
    camera.position.x = Math.sin(time * 0.19) * 0.035 * (1 + room.spatialFeedback.wrongness);
    camera.rotation.z = Math.sin(time * 0.11) * 0.006 * (1 + room.spatialFeedback.wrongness);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
canvas.addEventListener("click", onCanvasPointer);
canvas.addEventListener(
  "touchend",
  (event) => {
    event.preventDefault();
    onCanvasPointer(event);
  },
  { passive: false }
);

bindPress(startButton, startGame);
if (restartButton) bindPress(restartButton, restartGame);
directionButtons.forEach((button) => bindPress(button, () => moveThroughDoor(button.dataset.door)));

resize();
createRoom();
updateDirections(getDoorChoices(state));
animate();
