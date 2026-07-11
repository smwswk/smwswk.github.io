// ═══════════════════════════════════════════════
// LEVEL SYSTEM — 2 themed levels
// ═══════════════════════════════════════════════
let LV=0; // current level index (0 or 1)
const LORE='在遥远的东方，忍者、恐龙与植物僵尸共存于崩坏的大陆。腐化的果灵吞噬村庄，极寒的冰兽封冻大地，熔岩中的火魔焚烧一切，暗影里的邪灵操控人心。唯有影之一族的最后传人，能以殺意之刃斩断诅咒，重铸世界秩序。';
const LVL=[
  { // Level 1: 腐果园
    n:'腐果园',st:'果灵瘟疫地带',
    lw:3200,bt:1950,
    sky:['#0a0a20','#141030','#180c16'],mt:['#1a1a36','#1d1d3e'],gc:'#1a102a',gl:'#3a2a4a',
    gap:[{x:580,w:50},{x:950,w:40},{x:1450,w:55}],
    traps:[{x:450,w:50,type:'spike'},{x:780,w:40,type:'spike'},{x:1150,w:45,type:'spike'},{x:1700,w:60,type:'spike'}],
    boulders:[{x:600,dir:1,period:220},{x:1400,dir:-1,period:260}],
    pl:[{x:400,y:FLOOR-60,w:70,h:14},{x:500,y:FLOOR-90,w:55,h:14},{x:720,y:FLOOR-70,w:80,h:14},{x:850,y:FLOOR-110,w:50,h:14},{x:1050,y:FLOOR-60,w:90,h:14},{x:1200,y:FLOOR-100,w:65,h:14},{x:1550,y:FLOOR-80,w:75,h:14},{x:1680,y:FLOOR-120,w:55,h:14}],
    ms:{d:'击杀 35 只敌人',t:'kills',tg:35,rw:'maxHp'},
    et:['apple','grape','banana','orange','coconut','cherrybomb','watermelon','pineapple'],
    env:{kind:'orchardBramble',mechanics:['brambleSlow','springLaunch','swayPlatforms'],
      bramble:[{x:620,w:120},{x:1160,w:150},{x:1740,w:130}],
      springs:[{x:360,y:FLOOR-10,w:32,pow:-12.8},{x:1320,y:FLOOR-10,w:32,pow:-12.2}],
      movers:[{i:1,dx:46,dy:0,sp:0.025,ph:0},{i:5,dx:0,dy:22,sp:0.032,ph:1.4}]},
  },
  { // Level 2: 冰封荒原
    n:'冰封荒原',st:'冰河世纪领域',
    lw:3400,bt:2150,
    sky:['#080e22','#0e1638','#101828'],mt:['#182640','#1a2848'],gc:'#182040',gl:'#2a3a58',
    gap:[{x:500,w:55},{x:920,w:60},{x:1400,w:50},{x:1700,w:65}],
    traps:[{x:350,w:45,type:'spike'},{x:700,w:50,type:'spike'},{x:1200,w:40,type:'spike'},{x:1650,w:55,type:'spike'}],
    boulders:[{x:800,dir:1,period:200},{x:1500,dir:-1,period:240}],
    pl:[{x:380,y:FLOOR-65,w:65,h:14},{x:550,y:FLOOR-95,w:55,h:14},{x:750,y:FLOOR-75,w:70,h:14},{x:950,y:FLOOR-110,w:60,h:14},{x:1100,y:FLOOR-60,w:80,h:14},{x:1300,y:FLOOR-100,w:65,h:14},{x:1550,y:FLOOR-85,w:70,h:14},{x:1750,y:FLOOR-115,w:60,h:14},{x:1950,y:FLOOR-90,w:55,h:14}],
    ms:{d:'无伤击败Boss一个阶段',t:'noHitBoss',tg:1,rw:'saberDmg'},
    et:['iceShard','frostOrb','snowBeast','glacier','frozenGrape','crystal'],
    env:{kind:'snowWind',mechanics:['windGust','iceSlide','fallingIcicle'],
      gust:0.07,
      ice:[{x:440,w:230},{x:1020,w:260},{x:1810,w:230}],
      icicles:[{x:690,period:110,phase:20},{x:1480,period:135,phase:50},{x:2030,period:120,phase:80}]},
  },
  { // Level 3: 熔岩深渊
    n:'熔岩深渊',st:'烈焰炼狱',
    lw:3500,bt:2200,
    sky:['#1a0808','#2a1010','#180808'],mt:['#3a1818','#2a1010'],gc:'#1a0808',gl:'#4a2020',
    gap:[{x:550,w:50},{x:1050,w:60},{x:1600,w:55},{x:2100,w:65}],
    traps:[{x:400,w:50,type:'spike'},{x:850,w:40,type:'spike'},{x:1300,w:50,type:'spike'},{x:1850,w:60,type:'spike'}],
    boulders:[{x:750,dir:1,period:180},{x:1600,dir:-1,period:220}],
    pl:[{x:420,y:FLOOR-70,w:70,h:14},{x:600,y:FLOOR-100,w:55,h:14},{x:850,y:FLOOR-65,w:80,h:14},{x:1100,y:FLOOR-120,w:60,h:14},{x:1350,y:FLOOR-75,w:70,h:14},{x:1550,y:FLOOR-110,w:65,h:14},{x:1800,y:FLOOR-80,w:75,h:14},{x:2000,y:FLOOR-95,w:55,h:14},{x:2250,y:FLOOR-120,w:60,h:14}],
    ms:{d:'击杀 40 只敌人',t:'kills',tg:40,rw:'flameDmg'},
    et:['fireImp','lavaGolem','flameSerpent','emberWisp'],
    env:{kind:'lavaRain',mechanics:['lavaRain','lavaVent','heatUpdraft'],
      rate:64,
      vents:[{x:730,period:96,phase:24},{x:1240,period:112,phase:48},{x:1880,period:104,phase:72},{x:2360,period:130,phase:30}]},
  },
  { // Level 4: 影之国度
    n:'影之国度',st:'虚空裂隙',
    lw:3600,bt:2300,
    sky:['#050510','#0a0a18','#050508'],mt:['#0f0f20','#0a0a18'],gc:'#080818',gl:'#2a2a48',
    gap:[{x:500,w:60},{x:1000,w:55},{x:1500,w:65},{x:2000,w:50}],
    traps:[{x:350,w:50,type:'spike'},{x:780,w:45,type:'spike'},{x:1250,w:55,type:'spike'},{x:1750,w:50,type:'spike'}],
    boulders:[{x:900,dir:1,period:160},{x:1800,dir:-1,period:200}],
    pl:[{x:380,y:FLOOR-65,w:65,h:14},{x:580,y:FLOOR-100,w:55,h:14},{x:800,y:FLOOR-120,w:60,h:14},{x:1080,y:FLOOR-75,w:70,h:14},{x:1300,y:FLOOR-110,w:65,h:14},{x:1550,y:FLOOR-60,w:80,h:14},{x:1750,y:FLOOR-120,w:60,h:14},{x:1950,y:FLOOR-85,w:70,h:14},{x:2200,y:FLOOR-110,w:55,h:14},{x:2450,y:FLOOR-90,w:65,h:14}],
    ms:{d:'无伤击败Boss一个阶段',t:'noHitBoss',tg:1,rw:'lifesteal'},
    et:['shadowStalker','voidBeast','wraith','darkCrystal'],
    env:{kind:'shadowRift',mechanics:['shadowPulse','riftWarp','phasePlatforms'],
      pulse:120,
      rifts:[{x:720,to:1420,cd:90},{x:1640,to:2260,cd:90},{x:2380,to:1840,cd:90}]},
  },
  { // Bonus: 包子祭台
    n:'包子祭台',st:'短暂补给奖励关',
    lw:1900,bt:1750,bonus:true,
    sky:['#102018','#183020','#203818'],mt:['#24482c','#1d3c26'],gc:'#102410',gl:'#4a7a3a',
    gap:[{x:760,w:60},{x:1280,w:50}],
    pl:[{x:280,y:FLOOR-65,w:90,h:14},{x:470,y:FLOOR-105,w:70,h:14},{x:660,y:FLOOR-75,w:80,h:14},{x:900,y:FLOOR-110,w:85,h:14},{x:1120,y:FLOOR-70,w:90,h:14},{x:1360,y:FLOOR-105,w:80,h:14},{x:1580,y:FLOOR-82,w:85,h:14}],
    ms:{d:'吃掉 18 个包子',t:'baozi',tg:18,rw:'maxHp'},
    et:[],
    env:{kind:'baoziFestival',mechanics:['baoziFountain','safeRewardRoute']},
  }
];
const PETALS=[];
const ENV={t:0};
let BTX=1950,GAPS=[],PLAT=[],BP=[],TRAPS=[],MISSION={d:'',t:'',tg:0,p:0,done:false,rw:''};
let noHitBoss=true; // track if player took damage during boss phase
function curLvl(){return LVL[LV]}
let totalKills=0,totalMxC=0;
function loadLevel(lv){
  const prevStats=LV!==lv?{kills:P.kills,mxC:P.mxC}:null;
  LV=lv;const l=curLvl();
  LW=l.lw;BTX=l.bt;
  GAPS.length=0;for(const g of l.gap)GAPS.push({...g});
  PLAT.length=0;for(const p of l.pl)PLAT.push({...p,baseX:p.x,baseY:p.y});
  if(l.env&&l.env.movers){for(const m of l.env.movers){const pf=PLAT[m.i];if(pf)pf.move={...m}}}
  MISSION={d:l.ms.d,t:l.ms.t,tg:l.ms.tg,p:0,done:false,rw:l.ms.rw};
  // Load waves from level data
  WV.length=0;const lvWaves=LEV_WAVES[LV]||[];
  for(let i=0;i<lvWaves.length;i++){
    WV.push({tx:lvWaves[i].tx,es:lvWaves[i].es.map(e=>({...e}))});
  }
  SPW.length=WV.length;SPC.length=WV.length;
  for(let i=0;i<SPW.length;i++){SPW[i]=false;SPC[i]=false}
  bOK=false;waveCleared=0;noHitBoss=true;ENV.t=0;ENV.riftCD=0;
  TRAPS.length=0;const ltr=curLvl();if(ltr&&ltr.traps){for(const t of ltr.traps)TRAPS.push({...t});}
  BOULDERS.length=0;BP.length=0;EN.length=0;PR.length=0;PT.length=0;PU.length=0;BS.on=false;BS.dead=false;BS.jt=[];
  // Accumulate total stats across levels
  if(prevStats){totalKills+=prevStats.kills;totalMxC=Math.max(totalMxC,prevStats.mxC)}
  rP();P.x=100;P.y=FLOOR-P.h;
  if(l.bonus)spawnBonusBaozi();
  if(!prevStats){totalKills=0;totalMxC=0}
}
function spawnBonusBaozi(){
  for(let i=0;i<MISSION.tg;i++){
    const x=220+i*85+(i%3)*22;
    const lane=i%4;
    const y=lane===0?FLOOR-85:lane===1?FLOOR-130:lane===2?FLOOR-55:FLOOR-165;
    PU.push({x,y,w:14,h:14,vx:0,vy:0,life:9999,ground:false,type:'baozi',baozi:true,heal:1,c:'#d98',hc:'#ffd'});
  }
}
function loadNextLevel(){
  // Mark current level as cleared
  if(LV<MAP_NODES.length)MAP_NODES[LV].cleared=true;
  // Unlock next level
  if(LV+1<MAP_NODES.length)MAP_NODES[LV+1].unlocked=true;
  // Go to map
  if(LV+1<LVL.length){
    GS='map';mapSel=LV+1;
  }else{
    if(curLvl().bonus){BS.x=P.x;BS.y=P.y}
    GS='ending';startEnding();
  }
}

// TERRAIN — level-driven
function initBP(){
  BP.length=0;
  BP.push({x:BS.x+50, y:FLOOR-85, w:60, h:12, vy:0, settling:true, settleY:FLOOR-85});
  BP.push({x:BS.x+180,y:FLOOR-120,w:50,h:12, vy:0, settling:true, settleY:FLOOR-120});
  BP.push({x:BS.x+280,y:FLOOR-95, w:55,h:12, vy:0, settling:true, settleY:FLOOR-95});
}

function getGround(x,entH,entBottomY){
  // Returns the y-position where an entity's feet should land, or 999 if none
  const feetX=x+12; // center-ish of entity
  let best=999;
  // Check platforms — only if entity's feet are at/above the platform top (not walking under)
  for(const pf of PLAT){if(feetX>=pf.x-2&&feetX<=pf.x+pf.w+2&&entBottomY<=pf.y+4)best=Math.min(best,pf.y)}
  for(const pf of BP){if(feetX>=pf.x-2&&feetX<=pf.x+pf.w+2&&entBottomY<=pf.y+4)best=Math.min(best,pf.y)}
  // Check ground (not in gap)
  let inGap=false;
  for(const gp of GAPS){if(feetX>=gp.x&&feetX<=gp.x+gp.w){inGap=true;break}}
  if(!inGap)best=Math.min(best,FLOOR);
  return best;
}

function upEnv(){
  const e=curLvl().env;if(!e||GS!=='play')return;ENV.t++;
  if(e.movers){for(const m of e.movers){const pf=PLAT[m.i];if(!pf)continue;const t=ENV.t*(m.sp||0.02)+(m.ph||0);pf.x=pf.baseX+Math.sin(t)*(m.dx||0);pf.y=pf.baseY+Math.sin(t)*(m.dy||0)}}
  if(e.kind==='orchardBramble'){
    for(const b of e.bramble){
      if(P.x+P.w>b.x&&P.x<b.x+b.w&&P.ground){
        P.vx*=0.78;
        if(ENV.t%18===0)PT.push({x:P.x+P.w/2,y:FLOOR-4,vx:(Math.random()-0.5)*1.4,vy:-1-Math.random()*1.5,l:18,c:'#6a3',s:2});
      }
    }
    if(e.springs){for(const s of e.springs){if(P.ground&&P.x+P.w>s.x&&P.x<s.x+s.w&&P.y+P.h>=s.y-8){P.vy=s.pow||-12;P.ground=false;P.coyote=0;P.jumpBuf=0;shake(4);sfx('jump2');ps(P.x+P.w/2,P.y+P.h,14,'#9f8',3,16);break}}}
  }else if(e.kind==='snowWind'){
    const gust=Math.sin(ENV.t*0.025)*e.gust+(Math.floor(ENV.t/180)%2?e.gust*0.7:-e.gust*0.7);
    P.vx+=gust*(P.ground?1:0.62);
    for(const en of EN){if(!en.dead&&!en.static)en.vx+=gust*0.35}
    if(e.ice){for(const ice of e.ice){if(P.ground&&P.x+P.w>ice.x&&P.x<ice.x+ice.w){P.vx*=1.04;P.vx+=(P.vx>=0?0.08:-0.08);if(ENV.t%12===0)PT.push({x:P.x+P.w/2,y:FLOOR-4,vx:(Math.random()-0.5)*1.2,vy:-0.6-Math.random(),l:18,c:'#dff',s:2})}}}
    if(e.icicles){for(const ic of e.icicles){if(ENV.t%(ic.period||120)===(ic.phase||0)&&ic.x>camX-40&&ic.x<camX+W+40){sp(ic.x,camY-30,0,6.2,2,'#dff',8,26,95,true);notiT=28;notiMsg='冰锥坠落!'}}}
    if(ENV.t%8===0)PT.push({x:camX+W+20,y:60+Math.random()*(FLOOR-80),vx:-5-Math.random()*5,vy:(Math.random()-0.5)*0.7,l:38,c:'#dff',s:2});
  }else if(e.kind==='lavaRain'){
    if(ENV.t%(e.rate||64)===0){
      const x=camX+80+Math.random()*(W-160);
      sp(x,-30,(Math.random()-0.5)*1.4,5+Math.random()*2.5,2,'#f80',15,18,130,true);
      notiT=34;notiMsg='熔岩坠落!';
    }
    if(e.vents){for(const v of e.vents){if(ENV.t%(v.period||100)===(v.phase||0)){sp(v.x,FLOOR-18,0,-8.5,2,'#f80',18,34,88,true);ps(v.x,FLOOR-4,18,'#f80',5,24);if(Math.abs((P.x+P.w/2)-v.x)<28&&P.y+P.h>FLOOR-90)hurt(1,v.x);notiT=28;notiMsg='熔岩喷口!'}}}
    if(ENV.t%10===0)PT.push({x:camX+Math.random()*W,y:FLOOR+4,vx:(Math.random()-0.5)*0.8,vy:-1-Math.random()*2,l:25,c:Math.random()<0.5?'#f80':'#fd0',s:2+Math.random()*3});
  }else if(e.kind==='shadowRift'){
    if(ENV.riftCD>0)ENV.riftCD--;
    if(e.rifts&&ENV.riftCD<=0){for(const r of e.rifts){if(Math.abs((P.x+P.w/2)-r.x)<30&&P.y+P.h>FLOOR-90){ps(P.x+P.w/2,P.y+P.h/2,24,'#70a',5,26);P.x=r.to;P.y=Math.min(P.y,FLOOR-P.h);P.vx=P.dir*3;P.inv=Math.max(P.inv,18);ENV.riftCD=r.cd||90;shake(8);sfx('slash');ps(P.x+P.w/2,P.y+P.h/2,24,'#a4f',5,26);notiT=38;notiMsg='穿过影缝';break}}}
    if(ENV.t%(e.pulse||120)===0){
      const sx=P.x+(Math.random()<0.5?-120:120);
      sp(sx,FLOOR-36,Math.sign(P.x-sx)*2.4,-1.2,1,'#70a',20,30,70,true);
      shake(5);notiT=36;notiMsg='影缝逼近!';
    }
    if(ENV.t%16===0)PT.push({x:camX+Math.random()*W,y:FLOOR-20-Math.random()*120,vx:(Math.random()-0.5)*0.8,vy:-0.4-Math.random()*0.7,l:40,c:'#70a',s:2});
  }else if(e.kind==='baoziFestival'){
    if(ENV.t%150===0&&PU.filter(u=>u.baozi).length<MISSION.tg+8){const x=camX+120+(ENV.t*13%(W-240));PU.push({x,y:70,w:14,h:14,vx:0,vy:0.5,life:520,ground:false,type:'baozi',baozi:true,heal:1,c:'#d98',hc:'#ffd'})}
    if(ENV.t%20===0)PT.push({x:camX+Math.random()*W,y:40+Math.random()*120,vx:(Math.random()-0.5)*1.2,vy:0.8+Math.random()*0.8,l:50,c:Math.random()<0.5?'#ffd':'#f9c',s:2+Math.random()*2});
  }
  // Boulder generation — read from level root, not env
  const clb=curLvl();if(clb&&clb.boulders){for(const bd of clb.boulders){if(ENV.t%bd.period===0){BOULDERS.push({x:bd.x,y:-30,w:18,h:18,vx:bd.dir*2.8,vy:0,dir:bd.dir});}}}
  // Update boulders
  for(let i=BOULDERS.length-1;i>=0;i--){const b=BOULDERS[i];b.x+=b.vx;b.vy+=0.35;b.y+=b.vy;const gnd=getGround(b.x,b.h,b.y+b.h);if(b.y+b.h>=gnd&&b.vy>=0){b.y=gnd-b.h;b.vy=-b.vy*0.35;if(Math.abs(b.vy)<1)b.vy=0;}
    if(typeof P!=='undefined'&&P&&hitR(b.x,b.y,b.w,b.h,P.x,P.y,P.w,P.h)){hurt(2,b.x);shake(6);sfx('heavy');b.vx=-b.dir*3;b.vy=-4;ps(P.x+P.w/2,P.y+P.h/2,12,'#f80',4,16);}
    if(b.x<-80||b.x>LW+80||b.y>H+80)BOULDERS.splice(i,1);
  }
}

function drawTerrain(){
  const l=curLvl();const gY=FLOOR+camY;
  // Main ground (with gaps)
  ctx.fillStyle=l.gc;
  let gx=0;for(const gp of GAPS){ctx.fillRect(gx-camX,gY,gp.x-gx,H-gY);gx=gp.x+gp.w}
  ctx.fillRect(gx-camX,gY,LW-gx,H-gY);
  // Ground line
  ctx.strokeStyle=l.gl;ctx.lineWidth=2;
  gx=0;for(const gp of GAPS){ctx.beginPath();ctx.moveTo(gx-camX,gY);ctx.lineTo(gp.x-camX,gY);ctx.stroke();gx=gp.x+gp.w}
  ctx.beginPath();ctx.moveTo(gx-camX,gY);ctx.lineTo(LW-camX,gY);ctx.stroke();
  // Ground texture
  ctx.fillStyle=l.gc.replace('1a','2a').replace('20','30');
  for(let x=0;x<LW;x+=40){let gg=true;for(const gp of GAPS){if(x>=gp.x&&x<=gp.x+gp.w){gg=false;break}}if(!gg)continue;const tx=x-camX;if(tx<-40||tx>W+40)continue;ctx.fillRect(tx,gY+4,22,2);ctx.fillRect(tx+6,gY+10,16,2);ctx.fillRect(tx+10,gY+16,10,2)}
  // Spike traps
  for(const t of TRAPS){
    if(t.type!=='spike')continue;
    const tx=t.x-camX;if(tx<-t.w||tx>W)continue;
    const sc=['#5a3','#8cf','#f40','#a4f'][LV]||'#f44';
    ctx.fillStyle=sc;
    for(let i=0;i<t.w;i+=10){
      const spikeH=14+Math.sin(i*0.7+ENV.t*0.05)*3;
      ctx.beginPath();ctx.moveTo(tx+i,FLOOR+camY);ctx.lineTo(tx+i+5,FLOOR+camY-spikeH);ctx.lineTo(tx+i+10,FLOOR+camY);ctx.fill();
    }
    ctx.fillStyle=sc+'18';ctx.fillRect(tx,FLOOR+camY-20,t.w,20);
  }
  // Platforms
  for(const pf of[...PLAT,...BP]){
    const px=pf.x-camX,py=pf.y+camY;
    ctx.fillStyle='#2a2040';ctx.fillRect(px,py,pf.w,pf.h);
    ctx.fillStyle='#3a3050';ctx.fillRect(px+2,py+2,pf.w-4,pf.h-4);
    ctx.fillStyle='#4a4060';ctx.fillRect(px+2,py+2,pf.w-4,3);
    // Support pillars for grounded platforms
    if(pf.y>=FLOOR-70){ctx.fillStyle='#2a2040';ctx.fillRect(px+pf.w/2-4,gY,8,py-gY)}
  }
}

function drawBoulders(){
  for(const b of BOULDERS){
    const bx=Math.round(b.x-camX),by=Math.round(b.y+camY);
    if(bx<-40||bx>W+40)continue;
    ctx.fillStyle=LV===1?'#abc':LV===2?'#840':'#864';
    ctx.fillRect(bx,by,b.w,b.h);
    ctx.fillStyle=LV===1?'#eef':LV===2?'#c40':'#a75';
    ctx.fillRect(bx+3,by+3,b.w-6,b.h-6);
    ctx.fillStyle='#fff';
    const rx=bx+5+Math.sin((b.x+b.y)*0.12)*4,ry=by+5+Math.cos((b.x+b.y)*0.12)*4;
    ctx.fillRect(rx,ry,3,3);
  }
}

function drawEnv(){
  const e=curLvl().env;if(!e)return;const gY=FLOOR+camY;
  if(e.kind==='orchardBramble'){
    for(const b of e.bramble){
      const x=b.x-camX;if(x<-b.w||x>W)continue;
      ctx.fillStyle='#183818';ctx.fillRect(x,gY-7,b.w,7);
      ctx.fillStyle='#5a3';
      for(let i=0;i<b.w;i+=12){ctx.fillRect(x+i,gY-14,5,12);ctx.fillStyle='#a6d';ctx.fillRect(x+i+3,gY-18,4,4);ctx.fillStyle='#5a3'}
    }
    if(e.springs){for(const s of e.springs){const x=s.x-camX;if(x<-40||x>W+40)continue;ctx.fillStyle='#7c5';ctx.fillRect(x,gY-9,s.w,4);ctx.fillStyle='#df8';for(let i=0;i<s.w;i+=8)ctx.fillRect(x+i,gY-16,4,8)}}
  }else if(e.kind==='snowWind'){
    ctx.fillStyle='rgba(220,245,255,0.18)';
    for(let i=0;i<18;i++){const x=((i*103-Date.now()*0.08)%(W+80))-40,y=50+(i*37)%(FLOOR-80);ctx.fillRect(x,y,42,2)}
    if(e.ice){ctx.fillStyle='rgba(210,245,255,0.22)';for(const ice of e.ice){const x=ice.x-camX;if(x<-ice.w||x>W)continue;ctx.fillRect(x,gY-3,ice.w,3);for(let i=0;i<ice.w;i+=18)ctx.fillRect(x+i,gY-8,10,2)}}
  }else if(e.kind==='lavaRain'){
    ctx.fillStyle='rgba(255,80,0,0.28)';
    for(let x=-40;x<W+50;x+=70){const xx=x+(camX*0.2%70);ctx.fillRect(xx,gY-4,36,5);ctx.fillStyle='rgba(255,200,0,0.28)';ctx.fillRect(xx+12,gY-6,12,2);ctx.fillStyle='rgba(255,80,0,0.28)'}
    if(e.vents){for(const v of e.vents){const x=v.x-camX;if(x<-30||x>W+30)continue;ctx.fillStyle='rgba(255,90,0,0.55)';ctx.fillRect(x-12,gY-8,24,8);ctx.fillStyle='rgba(255,220,0,0.45)';ctx.fillRect(x-4,gY-18,8,14)}}
  }else if(e.kind==='shadowRift'){
    const a=0.08+Math.sin(Date.now()*0.003)*0.04;ctx.fillStyle=`rgba(20,0,30,${a})`;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(120,0,180,0.25)';for(let x=80;x<W;x+=180)ctx.fillRect(x+Math.sin(Date.now()*0.002+x)*12,gY-30,18,30);
    if(e.rifts){for(const r of e.rifts){const x=r.x-camX;if(x<-40||x>W+40)continue;const h=34+Math.sin(Date.now()*0.008+r.x)*8;ctx.fillStyle='rgba(150,60,255,0.32)';ctx.fillRect(x-8,gY-h,16,h);ctx.fillStyle='rgba(230,210,255,0.35)';ctx.fillRect(x-2,gY-h+6,4,h-12)}}
  }else if(e.kind==='baoziFestival'){
    ctx.fillStyle='rgba(255,220,120,0.18)';
    for(let x=60;x<W;x+=120){ctx.fillRect(x,36,28,20);ctx.fillStyle='rgba(255,120,140,0.24)';ctx.fillRect(x+6,38,16,14);ctx.fillStyle='rgba(255,220,120,0.18)'}
  }
}
