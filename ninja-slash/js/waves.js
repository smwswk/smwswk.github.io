// LEVEL — denser waves, Metal Slug prisoner system
// ═══════════════════════════════════════════════
const LEV_WAVES=[
  [ // Level 1 — 5 waves, fruit zombies
    {tx:100,es:[{t:'apple',x:230},{t:'apple',x:260},{t:'grape',x:300},{t:'grape',x:312},{t:'grape',x:324},{t:'grape',x:336},{t:'apple',x:370},{t:'banana',x:400}]},
    {tx:550,es:[{t:'watermelon',x:600},{t:'orange',x:640},{t:'grape',x:680},{t:'grape',x:692},{t:'grape',x:704},{t:'apple',x:740},{t:'cherrybomb',x:680,y:FLOOR-60-12},{t:'coconut',x:780}]},
    {tx:1000,es:[{t:'pineapple',x:1050},{t:'pineapple',x:1090},{t:'banana',x:1130},{t:'banana',x:1160},{t:'apple',x:1200},{t:'apple',x:1230},{t:'grape',x:1060},{t:'grape',x:1072},{t:'grape',x:1084},{t:'watermelon',x:1280},{t:'orange',x:1320},{t:'cherrybomb',x:1360}]},
    {tx:1450,es:[{t:'coconut',x:1500},{t:'watermelon',x:1550},{t:'pineapple',x:1600},{t:'orange',x:1650},{t:'banana',x:1700},{t:'cherrybomb',x:1750},{t:'apple',x:1800},{t:'grape',x:1580},{t:'grape',x:1592},{t:'grape',x:1604},{t:'watermelon',x:1850},{t:'coconut',x:1900}]},
    {tx:1700,es:[{t:'watermelon',x:1750},{t:'watermelon',x:1800},{t:'pineapple',x:1850},{t:'pineapple',x:1900},{t:'cherrybomb',x:1780,y:FLOOR-60-12},{t:'cherrybomb',x:1820,y:FLOOR-60-12},{t:'coconut',x:1950},{t:'apple',x:2000},{t:'apple',x:2030},{t:'orange',x:2080},{t:'orange',x:2120}]},
  ],
  [ // Level 2 — 5 waves, ice enemies
    {tx:100,es:[{t:'iceShard',x:230},{t:'iceShard',x:260},{t:'frozenGrape',x:300},{t:'frozenGrape',x:312},{t:'frozenGrape',x:324},{t:'frostOrb',x:360},{t:'iceShard',x:390},{t:'crystal',x:420}]},
    {tx:550,es:[{t:'snowBeast',x:600},{t:'glacier',x:650},{t:'frozenGrape',x:700},{t:'frozenGrape',x:712},{t:'iceShard',x:750},{t:'iceShard',x:770},{t:'frostOrb',x:810},{t:'crystal',x:840},{t:'glacier',x:880},{t:'snowBeast',x:920}]},
    {tx:1050,es:[{t:'crystal',x:1100},{t:'crystal',x:1140},{t:'iceShard',x:1180},{t:'iceShard',x:1200},{t:'frostOrb',x:1240},{t:'frozenGrape',x:1280},{t:'frozenGrape',x:1292},{t:'frozenGrape',x:1304},{t:'snowBeast',x:1340},{t:'glacier',x:1390},{t:'frostOrb',x:1440},{t:'snowBeast',x:1490}]},
    {tx:1550,es:[{t:'glacier',x:1600},{t:'glacier',x:1650},{t:'snowBeast',x:1700},{t:'iceShard',x:1750},{t:'iceShard',x:1770},{t:'iceShard',x:1790},{t:'crystal',x:1830},{t:'frostOrb',x:1870},{t:'frostOrb',x:1900},{t:'snowBeast',x:1950},{t:'glacier',x:2000}]},
    {tx:1800,es:[{t:'snowBeast',x:1850},{t:'snowBeast',x:1900},{t:'glacier',x:1950},{t:'crystal',x:2000},{t:'crystal',x:2040},{t:'frozenGrape',x:1880,y:FLOOR-65-12},{t:'frozenGrape',x:1895,y:FLOOR-65-12},{t:'frostOrb',x:2100},{t:'frostOrb',x:2130},{t:'snowBeast',x:2180}]},
  ],
  [ // Level 3 — 5 waves, fire enemies
    {tx:100,es:[{t:'fireImp',x:230},{t:'fireImp',x:260},{t:'fireImp',x:290},{t:'flameSerpent',x:330},{t:'emberWisp',x:360},{t:'fireImp',x:390},{t:'flameSerpent',x:420},{t:'emberWisp',x:450},{t:'fireImp',x:350,y:FLOOR-70-14}]},
    {tx:550,es:[{t:'flameSerpent',x:600},{t:'fireImp',x:640},{t:'fireImp',x:660},{t:'emberWisp',x:700},{t:'emberWisp',x:720},{t:'lavaGolem',x:770},{t:'flameSerpent',x:820},{t:'fireImp',x:850},{t:'fireImp',x:870},{t:'emberWisp',x:660,y:FLOOR-100-14}]},
    {tx:1050,es:[{t:'lavaGolem',x:1100},{t:'fireImp',x:1150},{t:'fireImp',x:1170},{t:'flameSerpent',x:1210},{t:'emberWisp',x:1250},{t:'emberWisp',x:1270},{t:'fireImp',x:1310},{t:'fireImp',x:1330},{t:'lavaGolem',x:1370},{t:'flameSerpent',x:1420},{t:'emberWisp',x:1470},{t:'fireImp',x:1510}]},
    {tx:1600,es:[{t:'lavaGolem',x:1650},{t:'lavaGolem',x:1710},{t:'flameSerpent',x:1770},{t:'flameSerpent',x:1810},{t:'emberWisp',x:1850},{t:'emberWisp',x:1870},{t:'fireImp',x:1910},{t:'fireImp',x:1930},{t:'fireImp',x:1950},{t:'flameSerpent',x:2000},{t:'lavaGolem',x:2050}]},
    {tx:1900,es:[{t:'lavaGolem',x:1950},{t:'fireImp',x:2010},{t:'fireImp',x:2030},{t:'fireImp',x:2050},{t:'flameSerpent',x:2090},{t:'flameSerpent',x:2130},{t:'emberWisp',x:1990,y:FLOOR-70-14},{t:'emberWisp',x:2060,y:FLOOR-70-14},{t:'lavaGolem',x:2190},{t:'emberWisp',x:2240}]},
  ],
  [ // Level 4 — 5 waves, shadow enemies
    {tx:100,es:[{t:'shadowStalker',x:230},{t:'shadowStalker',x:260},{t:'darkCrystal',x:300},{t:'wraith',x:330},{t:'shadowStalker',x:370},{t:'darkCrystal',x:400},{t:'wraith',x:430},{t:'shadowStalker',x:460}]},
    {tx:550,es:[{t:'wraith',x:600},{t:'darkCrystal',x:640},{t:'shadowStalker',x:680},{t:'shadowStalker',x:700},{t:'wraith',x:740},{t:'voidBeast',x:790},{t:'darkCrystal',x:840},{t:'shadowStalker',x:880},{t:'shadowStalker',x:900},{t:'voidBeast',x:950}]},
    {tx:1100,es:[{t:'voidBeast',x:1150},{t:'shadowStalker',x:1210},{t:'shadowStalker',x:1230},{t:'darkCrystal',x:1270},{t:'wraith',x:1310},{t:'shadowStalker',x:1350},{t:'wraith',x:1390},{t:'shadowStalker',x:1430},{t:'voidBeast',x:1480},{t:'darkCrystal',x:1520},{t:'wraith',x:1570},{t:'shadowStalker',x:1610}]},
    {tx:1700,es:[{t:'voidBeast',x:1750},{t:'voidBeast',x:1810},{t:'shadowStalker',x:1870},{t:'shadowStalker',x:1890},{t:'darkCrystal',x:1930},{t:'wraith',x:1970},{t:'wraith',x:1990},{t:'shadowStalker',x:2030},{t:'shadowStalker',x:2050},{t:'voidBeast',x:2100},{t:'darkCrystal',x:2150}]},
    {tx:2000,es:[{t:'voidBeast',x:2050},{t:'shadowStalker',x:2120},{t:'shadowStalker',x:2140},{t:'wraith',x:2180},{t:'wraith',x:2200},{t:'darkCrystal',x:2240},{t:'shadowStalker',x:2290},{t:'shadowStalker',x:2310},{t:'voidBeast',x:2360},{t:'wraith',x:2400}]},
  ],
  [ // Bonus — baozi only
  ]
];
let WV=[];let SPW=[],SPC=[];let bOK=false;

function ckL(){
  if(curLvl().bonus){
    if(MISSION.done&&GS==='play'){notiT=90;notiMsg='包子祭完成!';loadNextLevel()}
    return
  }
  for(let i=0;i<WV.length;i++){
    if(!SPW[i]&&P.x>=WV[i].tx){SPW[i]=true;for(const e of WV[i].es){const ey=e.y||(FLOOR-ET[e.t].h);spE(e.t,e.x,ey)}}
    // Wave cleared: spawned + all enemies dead → show upgrade
    if(SPW[i]&&!SPC[i]&&EN.length===0&&!bOK&&GS==='play'){
      SPC[i]=true;waveCleared++;
      dropMount(Math.max(30,Math.min(LW-40,P.x+P.dir*92)),P.y+8);
      notiT=90;notiMsg='新坐骑符出现: 靠近按 F 换乘'
      if(i<WV.length-1||!SPW.every(s=>s)){if(showUpgradeScreen())return}
    }
  }
  if(SPW.every(s=>s)&&EN.length===0&&!bOK&&P.x>=BTX-150){bOK=true;GS='boss_intro';initB()}
}

// ═══════════════════════════════════════════════
// PRISONER RESCUE SYSTEM — Metal Slug style
// ═══════════════════════════════════════════════
const PRISONERS=[];
function spawnPrisoners(){
  PRISONERS.length=0;
  const l=curLvl?curLvl():null;
  if(!l||l.bonus)return;
  // Contra-style upper/lower alternating layouts
  const layouts=[
    [{x:380,y:FLOOR-40,layer:'lower'},{x:530,y:FLOOR-114,layer:'upper'},{x:880,y:FLOOR-40,layer:'lower'},{x:1220,y:FLOOR-124,layer:'upper'},{x:1600,y:FLOOR-40,layer:'lower'}],
    [{x:400,y:FLOOR-40,layer:'lower'},{x:570,y:FLOOR-119,layer:'upper'},{x:980,y:FLOOR-40,layer:'lower'},{x:1330,y:FLOOR-124,layer:'upper'},{x:1780,y:FLOOR-40,layer:'lower'}],
    [{x:450,y:FLOOR-40,layer:'lower'},{x:620,y:FLOOR-124,layer:'upper'},{x:1130,y:FLOOR-40,layer:'lower'},{x:1580,y:FLOOR-134,layer:'upper'},{x:2280,y:FLOOR-40,layer:'lower'}],
    [{x:410,y:FLOOR-40,layer:'lower'},{x:600,y:FLOOR-124,layer:'upper'},{x:1100,y:FLOOR-40,layer:'lower'},{x:1580,y:FLOOR-84,layer:'upper'},{x:2220,y:FLOOR-40,layer:'lower'}],
    []
  ];
  const positions=layouts[LV]||[];
  const validWeapons=['saberRange','saberDmg','flameDmg','atkSpeed','maxHp','beamSaber','multiKunai','inferno','shockwave','pierceArrow'];
  for(let i=0;i<positions.length;i++){
    const pos=positions[i];
    if(pos.x<(l.lw||2000)-100){
      PRISONERS.push({x:pos.x,y:pos.y,w:16,h:24,rescued:false,animT:Math.random()*100,layer:pos.layer||'lower',weapon:validWeapons[Math.floor(Math.random()*validWeapons.length)]});
    }
  }
}

function upPrisoners(){
  if(!PRISONERS||PRISONERS.length===0)return;
  if(typeof P==='undefined'||!P)return;
  for(const p of PRISONERS){
    if(!p||p.rescued)continue;
    p.animT=(p.animT||0)+1;
    // Check if player is near and pressing F
    const near=hitR(P.x-20,P.y-20,P.w+40,P.h+40,p.x,p.y,p.w,p.h);
    if(near&&(jp('f')||jp('F'))){
      p.rescued=true;
      // Apply a free upgrade as reward
      if(typeof applyUpgrade==='function'&&p.weapon)applyUpgrade(p.weapon);
      if(typeof shake==='function')shake(8);
      if(typeof sfx==='function')sfx('win');
      if(typeof ps==='function')ps(p.x+p.w/2,p.y+p.h/2,30,'#fd0',6,28);
      notiT=90;
      const upgName=typeof UPGRADE_POOL!=='undefined'?UPGRADE_POOL.find(u=>u.id===p.weapon):null;
      notiMsg='人质获救! 获得: '+(upgName?upgName.name:p.weapon);
    }
  }
}

function drawPrisoners(){
  if(!PRISONERS||PRISONERS.length===0)return;
  if(typeof ctx==='undefined'||!ctx)return;
  for(const p of PRISONERS){
    if(!p)continue;
    const px=Math.round(p.x-(typeof camX!=='undefined'?camX:0));
    const py=Math.round(p.y+(typeof camY!=='undefined'?camY:0));
    if(px<-50||px>(typeof W!=='undefined'?W:800)+50)continue;
    if(p.rescued){
      ctx.fillStyle='#fd0';ctx.globalAlpha=0.4+Math.sin(Date.now()*0.03)*0.3;
      ctx.fillRect(px-4,py-4,(p.w||16)+8,(p.h||24)+8);
      ctx.globalAlpha=1;
      ctx.fillStyle='#fff';ctx.font='bold 8px monospace';
      ctx.fillText('OK',px+(p.w||16)/2-4,py-8);
      continue;
    }
    const bob=Math.sin((p.animT||0)*0.05)*2;
    const isUpper=p.layer==='upper';
    if(isUpper){
      const cy=py+bob;
      // Chain
      ctx.fillStyle='#555';ctx.fillRect(px+6,cy-36,4,36);
      ctx.fillStyle='#777';ctx.fillRect(px+7,cy-34,2,32);
      // Cage frame
      ctx.fillStyle='#642';ctx.fillRect(px-2,cy,20,28);
      ctx.fillStyle='#431';ctx.fillRect(px,cy+2,16,24);
      // Cage bars
      ctx.fillStyle='#864';
      ctx.fillRect(px+4,cy+2,2,24);ctx.fillRect(px+10,cy+2,2,24);
      ctx.fillRect(px,cy+10,16,2);
      // Prisoner inside
      ctx.fillStyle='#fc8';ctx.fillRect(px+4,cy+6,8,14);
      ctx.fillStyle='#dca';ctx.fillRect(px+5,cy+2,6,6);
      ctx.fillStyle='#000';ctx.fillRect(px+6,cy+4,1,1);ctx.fillRect(px+9,cy+4,1,1);
      // Hands gripping bars
      ctx.fillStyle='#dca';ctx.fillRect(px+2,cy+12,2,4);ctx.fillRect(px+12,cy+12,2,4);
    }else{
      const cy=py+bob;
      // Stake/post
      ctx.fillStyle='#642';ctx.fillRect(px+5,cy+8,6,18);
      ctx.fillStyle='#431';ctx.fillRect(px+6,cy+10,4,14);
      // Rope around stake
      ctx.fillStyle='#a62';ctx.fillRect(px+3,cy+8,10,3);
      ctx.fillRect(px+3,cy+14,10,3);
      // Prisoner kneeling
      ctx.fillStyle='#fc8';ctx.fillRect(px+2,cy+4,12,14);
      ctx.fillStyle='#dca';ctx.fillRect(px+4,cy,8,7);
      ctx.fillStyle='#000';ctx.fillRect(px+6,cy+3,1,1);ctx.fillRect(px+9,cy+3,1,1);
      // Bound arms behind
      ctx.fillStyle='#c94';ctx.fillRect(px,cy+6,2,8);ctx.fillRect(px+14,cy+6,2,8);
      // Rope on arms
      ctx.fillStyle='#a62';ctx.fillRect(px,cy+8,16,2);
    }
    // Exclamation mark when near
    if(typeof P!=='undefined'&&P&&hitR(P.x-20,P.y-20,P.w+40,P.h+40,p.x,p.y,p.w,p.h)){
      const blink=Math.sin(Date.now()*0.08)>0;
      if(blink){ctx.fillStyle='#fff';ctx.font='bold 10px monospace';ctx.fillText('F 救援',px-8,py-16+bob)}
    }
  }
}

// ═══════════════════════════════════════════════
// CAMERA — player+boss midpoint during boss
// ═══════════════════════════════════════════════
let camX=0,camY=0;
function upC(){
  if(GS==='boss_intro'){
    const bw=BS.bw||350;
    camX=lerp(camX,Math.max(0,BS.x+bw-W),0.08)
  }
  else if(GS==='boss'){
    const bw=BS.bw||350;
    const minCam=Math.max(0,BS.x+bw-W);
    const maxCam=Math.max(minCam,BS.x+120);
    const tx=P.x-W/3+P.dir*36;
    camX=lerp(camX,Math.max(minCam,Math.min(maxCam,tx)),0.1)
  }
  else{const tx=P.x-W/3;camX=lerp(camX,tx,0.06);camX=lerp(camX,tx+P.dir*40,0.03)}
  camX=Math.max(0,camX);
  if(GS!=='boss'&&GS!=='boss_intro')camX=Math.min(camX,LW-W);
  camY=lerp(camY,Math.min(0,(P.y+P.h-FLOOR)*0.3),0.05);
}
