// ═══════════════════════════════════════════════
// PLAYER
// ═══════════════════════════════════════════════
const WEAPON_DATA=[
  {id:'saber',name:'光剑',color:'#f42'},
  {id:'flame',name:'火焰',color:'#f60'},
  {id:'hammer',name:'战锤',color:'#fc8'},
  {id:'bow',name:'灵弓',color:'#cf8'},
];
const P={x:100,y:0,w:24,h:32,vx:0,vy:0,hp:12,mhp:12,wp:0,dir:1,ground:false,jumps:0,mj:3,coyote:0,jumpBuf:0,jumpHold:0,atk:0,chain:0,cd:0,combo:0,cT:0,mxC:0,hurtT:0,inv:0,flCD:0,flMax:22,dashT:0,dashCD:0,trails:[],anim:0,kills:0,xp:0,level:1,mount:null,mtT:0,killIntent:0};
function rP(){Object.assign(P,{x:100,y:0,vx:0,vy:0,hp:12,wp:0,dir:1,ground:false,jumps:0,coyote:0,jumpBuf:0,jumpHold:0,atk:0,chain:0,cd:0,combo:0,cT:0,mxC:0,hurtT:0,inv:0,flCD:0,dashT:0,dashCD:0,trails:[],anim:0,kills:0,mtT:0,wallSlide:0,smash:0,smashActive:false,killIntent:0});
  P.y=FLOOR-P.h;P.mhp=12+UPG.maxHp*4+applyLevelBonus('hp')+(META.startingHPBonus||0);P.hp=P.mhp;P.mj=3+UPG.extraJump+(applyLevelBonus('jump')||0);P.mount=null}
function applyLevelBonus(type){let total=0;for(let lv=2;lv<=P.level;lv++){const b=LEVEL_BONUS[lv];if(b&&b[type])total+=b[type]}return total}

// ═══ ROGUELIKE UPGRADE SYSTEM ═══
const UPG={saberRange:0,saberDmg:0,atkSpeed:0,flameDmg:0,flameRange:0,flameCD:0,maxHp:0,extraJump:0,moveSpeed:0,lifesteal:0,dashCD:0,frostBite:0,killBomb:0,critHeart:0,chainLightning:0,beamSaber:0,multiKunai:0,inferno:0,shockwave:0,pierceArrow:0};
const UPGRADE_POOL=[
  // Numeric upgrades
  {id:'saberRange',name:'延长刀刃',desc:'光剑范围 +25%',maxLv:4},
  {id:'saberDmg',name:'锋利之刃',desc:'光剑伤害 +30%',maxLv:4},
  {id:'atkSpeed',name:'疾风斩击',desc:'攻击速度 +20%',maxLv:4},
  {id:'flameDmg',name:'烈焰强化',desc:'火焰伤害 +35%',maxLv:4},
  {id:'flameRange',name:'广域灼烧',desc:'火焰范围 +25%',maxLv:3},
  {id:'flameCD',name:'火遁精通',desc:'火焰冷却 -25%',maxLv:3},
  {id:'maxHp',name:'生命力',desc:'最大HP +4 并恢复',maxLv:5},
  {id:'extraJump',name:'忍者飞跃',desc:'+1 空中跳跃',maxLv:2},
  {id:'moveSpeed',name:'风行者',desc:'移动速度 +15%',maxLv:3},
  {id:'lifesteal',name:'嗜血',desc:'击杀回复HP',maxLv:3},
  {id:'dashCD',name:'影舞',desc:'冲刺冷却 -30%',maxLv:3},
  // Qualitative upgrades (transformative)
  {id:'frostBite',name:'冰冻之刃',desc:'攻击30%几率冰冻敌人1.2秒',maxLv:3},
  {id:'killBomb',name:'爆裂核心',desc:'击杀时小范围爆炸(伤害+范围随等级)',maxLv:3},
  {id:'critHeart',name:'暴击之心',desc:'20%几率造成2倍伤害',maxLv:3},
  {id:'chainLightning',name:'雷神之怒',desc:'攻击弹射到附近敌人',maxLv:3},
  // Weapon-specific transformative upgrades
  {id:'beamSaber',name:'光束刃',desc:'光剑范围+40%且终结技射出剑气',maxLv:3},
  {id:'multiKunai',name:'多重手里剑',desc:'手里剑数量+2且扇形散射',maxLv:3},
  {id:'inferno',name:'炼狱',desc:'火焰在地面留下燃烧区域',maxLv:3},
  {id:'shockwave',name:'冲击波',desc:'锤击产生前行冲击波',maxLv:3},
  {id:'pierceArrow',name:'穿透箭',desc:'弓箭穿透敌人且+40%伤害',maxLv:3},
];
function resetUPG(){for(const k in UPG)UPG[k]=0}
function applyUpgrade(id){
  const def=UPGRADE_POOL.find(u=>u.id===id);
  if(!def||UPG[id]>=def.maxLv)return;
  UPG[id]++;
  if(id==='maxHp'){P.mhp=12+UPG.maxHp*4+applyLevelBonus('hp');P.hp=Math.min(P.mhp,P.hp+4)}
  if(id==='extraJump')P.mj=3+UPG.extraJump+(applyLevelBonus('jump')||0);
}
function getUpgradeChoices(){
  // Filter by meta-unlocked upgrades
  let pool=UPGRADE_POOL.filter(u=>UPG[u.id]<u.maxLv);
  if(typeof META!=='undefined'&&META.unlocked){
    pool=pool.filter(u=>META.unlocked.has(u.id)||!['frostBite','killBomb','critHeart','chainLightning'].includes(u.id));
  }
  // Shuffle and pick 3 (+ extra choices from meta)
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  const count=3+(META?META.extraChoices:0);
  return pool.slice(0,count);
}
let upgradeChoices=[],waveCleared=0;
let upgCooldown=0;
let upgradeInputArmed=false;
const UPG_SELECT_KEYS=['1','2','3','Enter',' '];
function upgradeSelectHeld(){return UPG_SELECT_KEYS.some(k=>K[k])}
function upgradeSelectIndex(){
  if(jp('1'))return 0;
  if(jp('2'))return 1;
  if(jp('3'))return 2;
  if(jp('4'))return 3;
  if(jp('Enter')||jp(' '))return 0;
  return -1;
}
function showUpgradeScreen(){
  upgradeChoices=getUpgradeChoices();
  if(upgradeChoices.length===0)return false;
  GS='upgrade';upgCooldown=15;upgradeInputArmed=false;return true; // wait for carried keys to be released
}

function mountPlayer(u){
  P.mount=u.mount;P.mtT=MOUNT_DATA[u.mount].dur;P.jumps=0;P.inv=Math.max(P.inv,24);
  notiT=90;notiMsg=mountName(u.mount)+' 已骑乘!';
  shake(8);ps(u.x+u.w/2,u.y+u.h/2,24,u.mount==='dino'?'#6f8':'#8cf',5,22);
}

function hurt(d,sx){
  if(P.inv>0||P.hurtT>0)return;
  if(P.shield>0){P.shield=0;ps(P.x+P.w/2,P.y+P.h/2,12,'#fd0',3,12);sfx('combo');P.inv=30;return}
  P.hp=Math.max(0,P.hp-d);P.hurtT=14;P.inv=40;
  P.vx=(P.x<sx?-5:5);P.vy=-5;P.combo=0;P.cT=0;P.chain=0;
  shake(8);ps(P.x+P.w/2,P.y+P.h/2,10,'#f33',4,20);
  // Damage flash effect
  damageFlashT=12;
  // Track no-hit mission
  if(GS==='boss')noHitBoss=false;
  if(P.hp<=0){GS='die';DT=70;sfx('die')}else sfx('hit')
}

function upP(){
  if(GS!=='play'&&GS!=='boss')return;P.anim++;
  if(P.atk>0)P.atk--;if(P.cd>0)P.cd--;if(P.hurtT>0)P.hurtT--;if(P.inv>0)P.inv--;if(P.flCD>0)P.flCD--;if(P.dashT>0)P.dashT--;if(P.dashCD>0)P.dashCD--;if(P.cT>0){P.cT--;if(P.cT<=0)P.combo=0}
  if(P.coyote>0)P.coyote--;if(P.jumpBuf>0)P.jumpBuf--;if(P.wallSlide>0)P.wallSlide--;if(P.smash>0)P.smash--;
  if(damageFlashT>0)damageFlashT--;
  P.trails=P.trails.filter(t=>{t.l--;return t.l>0});
  // Blade trail decay
  if(P.bladeTrail){P.bladeTrail=P.bladeTrail.filter(t=>{t.l--;return t.l>0})}else P.bladeTrail=[];
  // Mount timer
  if(P.mtT>0){P.mtT--;if(P.mtT<=0){P.mount=null;ps(P.x+P.w/2,P.y+P.h/2,15,'#fff',3,14)}}
  const mt=P.mount?MOUNT_DATA[P.mount]:null;
  const mtSpd=mt?mt.spdMul:1, mtJump=mt&&mt.jumpPow?mt.jumpPow:-8.5;
  const spdMul=(1+UPG.moveSpeed*0.15)*(P.spdBuff>0?1.4:1)*mtSpd*(1+applyLevelBonus('spd'));
  const SP=3.2*spdMul,AC=0.58,FR=0.65;let mx=0;
  const wasGround=P.ground;
  // Attack cancel chain — jump/dash can cancel attack recovery
  const atkCancel=P.atk>0&&(jp(' ')||jp('w')||jp('W')||jp('ArrowUp')||jp('Shift'));
  if(atkCancel&&P.hurtT<=0){P.atk=0;P.cd=Math.min(P.cd,2)}
  if(P.hurtT<=0&&P.atk<=0){if(K['a']||K['A'])mx=-1;if(K['d']||K['D'])mx=1}
  if(mx!==0){P.dir=mx;P.vx=lerp(P.vx,mx*SP,AC)}else{P.vx*=FR;if(Math.abs(P.vx)<0.1)P.vx=0}
  // Dash
  const dashCDmax=Math.max(10,Math.floor(28/(1+UPG.dashCD*0.3)));
  if(jp('Shift')&&P.dashCD<=0&&P.hurtT<=0){P.dashT=8;P.dashCD=dashCDmax;P.vx=P.dir*9;P.inv=8;ps(P.x+P.w/2,P.y+P.h/2,6,'#aac',3,12);sfx('slash')}
  if(P.dashT>0)P.vy=Math.min(P.vy,0);
  // Wall slide + wall kick
  let onWall=false;
  if(!P.ground&&!P.mount&&P.vy>0){
    const wallLeft=P.x<=2||(getGround(P.x-2,P.h,P.y+P.h/2)>P.y+P.h/2+10&&P.x>2);
    const wallRight=P.x>=LW-P.w-2||(getGround(P.x+P.w+2,P.h,P.y+P.h/2)>P.y+P.h/2+10&&P.x<LW-P.w-2);
    if((wallLeft&&(K['a']||K['A']))||(wallRight&&(K['d']||K['D']))){
      onWall=true;P.vy=Math.min(P.vy,1.2);P.wallSlide=4;
      if(P.wallSlide>0&&P.anim%10===0)ps(P.x+P.w/2,P.y+P.h/2,1,'#aac',0.8,6);
    }
  }
  // Jump
  const wJ=jp(' ')||jp('w')||jp('W')||jp('ArrowUp');
  if(wJ)P.jumpBuf=8;
  let jumpedThisFrame=false;
  function groundJump(){
    P.vy=mtJump;P.ground=false;P.jumps=0;P.coyote=0;P.jumpBuf=0;P.jumpHold=9;jumpedThisFrame=true;
    sfx(P.mount?'jump2':'jump');ps(P.x+P.w/2,P.y+P.h,10,'#fff',2.5,14,2);addJR(P.x+P.w/2,P.y+P.h,0)
  }
  function airJump(){
    const pw=[-7.8,-7.2,-6.5,-6.2,-6.0],idx=Math.min(P.jumps,pw.length-1);
    P.vy=Math.min(P.vy,pw[idx]);const jc=['#adf','#fc8','#f68','#9f8','#caf'],js=['jump2','jump3','jump3','jump2','jump3'];
    sfx(js[idx]);P.jumps++;P.jumpBuf=0;P.jumpHold=6;jumpedThisFrame=true;ps(P.x+P.w/2,P.y+P.h,14,jc[idx],3.5,16,2);addJR(P.x+P.w/2,P.y+P.h,P.jumps)
  }
  // Wall kick
  if(P.jumpBuf>0&&onWall&&P.hurtT<=0){
    const wallDir=(K['a']||K['A'])?1:-1;
    P.vy=-8.5;P.vx=wallDir*6;P.dir=wallDir;P.ground=false;P.wallSlide=0;
    P.jumpBuf=0;P.jumpHold=6;jumpedThisFrame=true;
    sfx('jump2');ps(P.x+P.w/2,P.y+P.h,12,'#adf',3,14);addJR(P.x+P.w/2,P.y+P.h,1);
  }
  else if(P.jumpBuf>0&&P.hurtT<=0){
    if(P.ground||P.coyote>0)groundJump();
    else if(P.jumps<P.mj)airJump();
  }
  if(P.jumpHold>0&&P.vy<0&&(K[' ']||K['w']||K['W']||K['ArrowUp'])){P.vy-=0.18;P.jumpHold--}
  else P.jumpHold=0;
  // Smash attack — air + down
  const smashing=!P.ground&&(K['s']||K['S']||K['ArrowDown'])&&!P.mount;
  if(smashing&&P.hurtT<=0&&P.vy>-8){P.vy+=1.8;P.smash=6;P.smashActive=true;}
  else if(P.ground&&P.smashActive){P.smashActive=false}
  // Ptera flight — hold space to glide
  if(P.mount==='ptera'&&!P.ground&&(K[' ']||K['w']||K['W']||K['ArrowUp'])){P.vy=Math.max(P.vy,-mt.flySpd);P.vy+=mt.flyGrav}
  else if(P.dashT<=0&&!onWall){const grav=P.mount==='ptera'&&!P.ground?G*0.5:G;P.vy+=grav;if(P.vy>12)P.vy=12}
  P.x+=P.vx;P.y+=P.vy;
  // Ground resolve
  const gnd=getGround(P.x,P.h,P.y+P.h);
  if(P.y+P.h>=gnd&&P.vy>=0){
    if(!P.ground&&P.vy>3){
      sfx('land');ps(P.x+P.w/2,P.y+P.h,6,'#ccc',1.5,10);
      // Smash landing AOE
      if(P.smashActive&&P.vy>6){smashLanding()}
    }
    P.y=gnd-P.h;P.vy=0;P.ground=true;P.jumps=0;P.smashActive=false
  }else P.ground=false;
  const landed=!wasGround&&P.ground;
  if(P.ground)P.coyote=8;else if(wasGround&&!jumpedThisFrame)P.coyote=Math.max(P.coyote,8);
  if(landed&&P.jumpBuf>0&&P.hurtT<=0)groundJump();
  // Spike trap damage
  if(P.ground&&typeof TRAPS!=='undefined'){const feetX=P.x+P.w/2;for(const t of TRAPS){if(t.type==='spike'&&feetX>=t.x&&feetX<=t.x+t.w){hurt(3,P.x);P.vy=-5;shake(5);sfx('hit');ps(P.x+P.w/2,P.y+P.h,10,'#f44',3,12);}}}
  // Fall off bottom
  if(P.y>H+100){
    if(GS==='boss'){
      P.x=Math.max(BS.x-250,Math.min(BS.x+90,P.x));
      P.y=FLOOR-P.h;P.vx=0;P.vy=0;P.ground=true;P.jumps=0;P.coyote=8;P.jumpBuf=0;P.jumpHold=0;
      hurt(2,BS.x);
      shake(10);ps(P.x+P.w/2,FLOOR,18,'#70a',4,18);
    }else{P.hp=0;GS='die';DT=40;sfx('die')}
  }
  // Bounds
  if(GS==='boss')P.x=Math.max(BS.x-280,Math.min(BS.x+440,P.x));
  else P.x=Math.max(0,Math.min(LW-P.w,P.x));
  if(P.y<-60){P.y=-60;P.vy=0}
  // Weapon switch with benefit — small AOE + brief iframe
  let switched=false;
  if(jp('1')){P.wp=0;switched=true}
  if(jp('2')){P.wp=1;switched=true}
  if(jp('3')){P.wp=2;switched=true}
  if(jp('4')){P.wp=3;switched=true}
  if(switched&&P.hurtT<=0){P.inv=Math.max(P.inv,8);ps(P.x+P.w/2,P.y+P.h/2,16,'#fff',4,18);shH(P.x-20,P.y-10,64,52,2)}
  // BUFF timers
  if(P.atkBuff>0)P.atkBuff--;if(P.spdBuff>0)P.spdBuff--;if(P.magnet>0)P.magnet--;
  // Kill Intent release — press C to unleash full-screen slash
  if((jp('c')||jp('C'))&&P.killIntent>=30&&P.hurtT<=0){
    const potency=P.killIntent;P.killIntent=0;
    shake(18);sfx('bossHit');
    // Full screen slash AOE
    const rx=P.x-200,ry=P.y-80,rw=424,rh=192;
    const dmg=potency*0.18*(1+applyLevelBonus('dmg'));
    shH(rx,ry,rw,rh,dmg);
    for(const e of EN){if(!e.dead&&e.spT<=0&&Math.abs(e.x-P.x)<220){e.vx=(e.x<P.x?-8:8);e.vy=-6}}
    ps(P.x+P.w/2,P.y+P.h/2,40,'#fff',8,36);
    for(let i=0;i<20;i++){const a=Math.random()*Math.PI*2;sp(P.x+P.w/2,P.y+P.h/2,Math.cos(a)*8,Math.sin(a)*8,2,'#fff',12,3,30,false)}
    hs=6;
  }
  // PICKUP check
  for(let i=PU.length-1;i>=0;i--){const u=PU[i];
    if(u.mount){
      const near=hitR(P.x-14,P.y-18,P.w+28,P.h+28,u.x,u.y,u.w,u.h);
      if(near&&(jp('f')||jp('F'))){mountPlayer(u);sfx('pickup');PU.splice(i,1)}
      continue;
    }
    if(hitR(P.x,P.y,P.w,P.h,u.x,u.y,u.w,u.h)){
    if(u.heal){P.hp=Math.min(P.mhp,P.hp+u.heal)}
    if(u.baozi&&!MISSION.done&&MISSION.t==='baozi'){MISSION.p++;if(MISSION.p>=MISSION.tg)completeMission()}
    if(u.buff){if(u.buff==='shield')P.shield=1;else if(u.buff==='atkBuff')P.atkBuff=u.dur;else if(u.buff==='spdBuff')P.spdBuff=u.dur;else if(u.buff==='magnet')P.magnet=u.dur}
    sfx('pickup');ps(u.x+u.w/2,u.y+u.h/2,8,u.c,2,12);PU.splice(i,1)}
  }
  // Magnet pull
  if(P.magnet>0){for(const u of PU){if(Math.hypot(P.x+P.w/2-u.x,P.y+P.h/2-u.y)<80){u.vx+=(P.x+P.w/2-u.x)*0.08;u.vy+=(P.y+P.h/2-u.y)*0.08}}}
  // Attack
  if(P.mount){
    if(P.mount==='dino'){
      if(jp('j')||jp('J')||jp('z')||jp('Z'))atkDinoFire();
      if(jp('k')||jp('K')||jp('x')||jp('X'))atkDinoWind();
    }else if(P.mount==='raptor'){
      if(jp('j')||jp('J')||jp('z')||jp('Z'))atkRaptorDash();
      if(jp('k')||jp('K')||jp('x')||jp('X'))atkRaptorClaw();
    }else if(P.mount==='trike'){
      if(jp('j')||jp('J')||jp('z')||jp('Z'))atkTrikeCharge();
      if(jp('k')||jp('K')||jp('x')||jp('X'))atkTrikeQuake();
    }else{
      if(jp('j')||jp('J')||jp('z')||jp('Z'))atkPteraDive();
      if(jp('k')||jp('K')||jp('x')||jp('X'))atkDinoWind();
    }
  }else{
    if(jp('j')||jp('J')||jp('z')||jp('Z')){
      if(P.wp===0)atkS();else if(P.wp===1)atkF();else if(P.wp===2)atkHammer();else if(P.wp===3)atkBow();
    }
    if(jp('k')||jp('K')||jp('x')||jp('X')){
      atkK();
    }
  }
}

// Smash landing AOE
function smashLanding(){
  shake(14);sfx('heavy');
  ps(P.x+P.w/2,P.y+P.h,28,'#ccc',6,26);
  const rx=P.x-50,ry=P.y-20,rw=124,rh=60;
  shH(rx,ry,rw,rh,5*(1+applyLevelBonus('dmg')));
  for(let i=0;i<16;i++){sp(P.x+P.w/2,FLOOR,(Math.random()-0.5)*6,-3-Math.random()*3,1,'#ccc',10,8,28,false)}
}

// WEAPONS
function atkS(){const realCD=Math.max(2,Math.floor(5/(1+UPG.atkSpeed*0.2)));if(P.cd>0)return;P.atk=7;P.cd=realCD;sfx('slash');P.chain=(P.chain+1)%3;
  const pow=P.combo>=20?1.5:1;
  const baseDmg=(P.chain===2?5.0:2.2)*(1+UPG.saberDmg*0.3+applyLevelBonus('dmg'))*(P.atkBuff>0?1.5:1);
  const m=baseDmg*pow;
  const baseW=50+UPG.saberRange*12+UPG.beamSaber*18,baseH=22+UPG.saberRange*3+UPG.beamSaber*2;
  const rw=P.chain===0?baseW:P.chain===1?baseW*1.15:baseW*1.3;
  const rh=P.chain===1?baseH+4:baseH;
  const rx=P.x+(P.dir>0?P.w:-rw+8),ry=P.y+4;shH(rx,ry,rw,rh,m);
  const cl=P.combo>=20?['#fd0','#fd0','#fff']:['#f53','#f73','#fd0'];
  P.trails.push({x:rx,y:ry,w:rw,h:rh,l:8,dir:P.dir,c:cl[P.chain]});
  ps(rx+(P.dir>0?rw:0),ry+rh/2,12,cl[P.chain],5,14);hs=P.chain===2?6:4;triggerHitstop(P.chain===2?4:2);
  // Beam saber: chain finisher fires a projectile wave
  if(UPG.beamSaber>0&&P.chain===2){
    sp(P.x+(P.dir>0?P.w+rw:-rw),P.y+P.h/2-4,P.dir*(8+UPG.beamSaber*3),0,m*0.6,'#fff',30,6,60+UPG.beamSaber*15);
    shake(4);
  }}
function shH(rx,ry,rw,rh,m){for(const e of EN){if(e.dead||e.spT>0)continue;if(hitR(rx,ry,rw,rh,e.x,e.y,e.w,e.h))dmgE(e,m)}if(BS.on&&!BS.dead){for(const j of BS.jt){if(j.dead||j.armor)continue;if(hitR(rx,ry,rw,rh,j.x,j.y,j.w,j.h))dmgJ(j,m)}}}
function atkK(){if(P.cd>0)return;P.cd=7;sfx('slash',99);const sx=P.x+(P.dir>0?P.w:-6),sy=P.y+12;
  const extraKunai=UPG.multiKunai||0;
  for(let k=-extraKunai;k<=extraKunai;k++){
    const spreadY=k*2.5,spreadVX=P.dir*(7-Math.abs(k)*1.2);
    sp(sx,sy+spreadY*2,spreadVX,-1.5+Math.abs(k)*0.3,1,'#8df',8,4,50);
    setTimeout(()=>{if(GS==='play'||GS==='boss')sp(sx,sy+4+spreadY*2,spreadVX,0+Math.abs(k)*0.2,1,'#8df',8,4,50)},50);
    setTimeout(()=>{if(GS==='play'||GS==='boss')sp(sx,sy+8+spreadY*2,spreadVX,1.5+Math.abs(k)*0.2,1,'#8df',8,4,50)},100);
  }
  ps(sx,sy,3+extraKunai*2,'#adf',1.5+extraKunai*0.5,8)}
function atkF(){const realMax=Math.max(8,Math.floor(18/(1+UPG.flameCD*0.25)));if(P.flCD>0||P.cd>0)return;P.flCD=realMax;P.cd=8;sfx('heavy');const fx=P.x+(P.dir>0?P.w:-55),fy=P.y+P.h-10;
  const rng=36+UPG.flameRange*8,count=32+UPG.flameRange*5,dmg=2.2*(1+UPG.flameDmg*0.35+applyLevelBonus('dmg'))*(P.atkBuff>0?1.5:1);
  for(let i=0;i<count;i++){
    const ox=fx+P.dir*(i*3),oy=fy-rng+(Math.random()*rng*1.5);
    sp(ox,oy,P.dir*(3+Math.random()*6),(Math.random()-0.5)*2.5,dmg,Math.random()>0.5?'#f60':'#fa0',10,8,24+Math.random()*14);
  }
  ps(fx+P.dir*24,P.y+P.h/2,35,'#f40',6,30);hs=5;shake(8);triggerHitstop(3);
  // Inferno: lingering fire on ground
  if(UPG.inferno>0){for(let i=0;i<6+UPG.inferno*4;i++){const gx=fx+P.dir*(i*10)+Math.random()*20,gy=FLOOR-6-Math.random()*8;sp(gx,gy,(Math.random()-0.5)*1.2,-1.5-Math.random()*2,UPG.inferno*1.2,'#f60',20,14,40+UPG.inferno*15,true)}}}
function atkHammer(){if(P.cd>0)return;P.cd=22;P.atk=22;sfx('heavy');shake(16);
  const rw=90,rh=52,rx=P.x+(P.dir>0?P.w-2:-rw+2),ry=P.y-10;
  shH(rx,ry,rw,rh,8.0*(1+UPG.saberDmg*0.25+applyLevelBonus('dmg'))*(P.atkBuff>0?1.5:1));
  for(let i=0;i<24;i++)ps(P.x+(P.dir>0?P.w+8:-8),P.y+P.h-2,1,'#fc8',8,22,5);
  hs=5;triggerHitstop(4);
  // Shockwave: traveling ground wave
  if(UPG.shockwave>0){sp(P.x+(P.dir>0?P.w+rw:-rw),FLOOR-14,P.dir*(5+UPG.shockwave*2),0,4+UPG.shockwave*2.5,'#fd8',28,16,80+UPG.shockwave*15);shake(4)}}
function atkHammerUpper(){if(P.cd>0)return;P.cd=20;P.atk=20;sfx('heavy');shake(10);
  const rw=P.w+36,rh=88,rx=P.x+(P.dir>0?P.w-8:-rw+8),ry=P.y-58,m=5.2*(1+UPG.saberDmg*0.2+applyLevelBonus('dmg'))*(P.atkBuff>0?1.5:1);
  shH(rx,ry,rw,rh,m);
  for(const e of EN){if(!e.dead&&e.spT<=0&&hitR(rx,ry,rw,rh,e.x,e.y,e.w,e.h)){e.vy=-8;e.vx+=P.dir*2.5}}
  for(let i=0;i<14;i++)sp(P.x+P.w/2,P.y+P.h,P.dir*(1+Math.random()*2),-7-Math.random()*4,1,'#fd8',10,8,26,false);
  hs=3
}
function atkBow(){if(P.cd>0)return;P.cd=8;P.atk=8;sfx('slash');
  const sx=P.x+(P.dir>0?P.w+3:-20),sy=P.y+11,d=3.8*(1+UPG.saberDmg*0.18+applyLevelBonus('dmg')+UPG.pierceArrow*0.4)*(P.atkBuff>0?1.5:1);
  sp(sx,sy,P.dir*13,-0.2,d,'#cf8',22,4,80,false,UPG.pierceArrow);ps(sx,sy,6,'#cf8',3,12);triggerHitstop(1)
}
function atkBowSpread(){if(P.cd>0)return;P.cd=14;P.atk=12;sfx('slash');
  const sx=P.x+(P.dir>0?P.w+3:-20),sy=P.y+12,d=2.5*(1+UPG.saberDmg*0.15+applyLevelBonus('dmg')+UPG.pierceArrow*0.3)*(P.atkBuff>0?1.5:1);
  for(let i=-2;i<=2;i++)sp(sx,sy+i*4,P.dir*(10.5-Math.abs(i)*1.2),i*1.6,d,'#df8',20,3,68,false,UPG.pierceArrow);
  ps(sx,sy,10,'#df8',3,14);triggerHitstop(2)
}
function atkDinoFire(){if(P.cd>0)return;P.cd=18;P.atk=22;sfx('heavy');shake(16);const fx=P.x+(P.dir>0?P.w+18:-205),fy=P.y+P.h-46,rw=205,rh=78;
  shH(fx,fy,rw,rh,12+UPG.flameDmg*2.4+applyLevelBonus('dmg')*4);
  for(let i=0;i<76;i++){const ox=P.x+(P.dir>0?P.w+18:-14),oy=P.y+P.h-42+Math.random()*50;sp(ox,oy,P.dir*(7+Math.random()*10),(Math.random()-0.55)*3.1,4.8,'#f60',18,12,40+Math.random()*18)}
  for(let i=0;i<26;i++)ps(P.x+(P.dir>0?P.w+20:-10),P.y+P.h-20,1,i%2?'#fd0':'#f40',9,28,4);hs=5}
function atkDinoWind(){if(P.cd>0)return;P.cd=20;P.atk=18;sfx('slash');shake(12);const rx=P.x+(P.dir>0?P.w+8:-230),ry=P.y-42,rw=230,rh=122;
  for(const e of EN){if(e.dead||e.spT>0)continue;if(hitR(rx,ry,rw,rh,e.x,e.y,e.w,e.h)){dmgE(e,4.5);e.vx=P.dir*13;e.vy=-7.2;e.hurtT=Math.max(e.hurtT,18)}}
  if(BS.on&&!BS.dead){for(const j of BS.jt){if(j.dead||j.armor)continue;if(hitR(rx,ry,rw,rh,j.x,j.y,j.w,j.h))dmgJ(j,4)}}
  for(let i=0;i<10;i++){const wx=P.x+(P.dir>0?P.w+10:-42),wy=P.y-32+i*13;sp(wx,wy,P.dir*(8+i*0.55),(i-5)*0.15,1,'#cdf',34+i*5,4,30,false)}
  ps(P.x+(P.dir>0?P.w+18:-10),P.y+P.h/2,36,'#bdf',8,24,3);hs=4}
function atkRaptorDash(){if(P.cd>0)return;P.cd=12;P.atk=16;P.dashT=12;P.inv=Math.max(P.inv,14);P.vx=P.dir*17;sfx('slash');shake(8);
  const rx=P.x+(P.dir>0?P.w:-150),ry=P.y-12,rw=160,rh=P.h+28;shH(rx,ry,rw,rh,7.5+UPG.saberDmg*1.7+applyLevelBonus('dmg')*3);
  for(let i=0;i<20;i++){sp(P.x+P.w/2,P.y+P.h/2,(Math.random()*3+8)*P.dir,(Math.random()-0.5)*2.4,1.5,i%2?'#dfc':'#7f6',22,4,20,false)}
}
function atkRaptorClaw(){if(P.cd>0)return;P.cd=14;P.atk=16;sfx('slash');const rx=P.x+(P.dir>0?P.w:-130),ry=P.y-8,rw=135,rh=P.h+24;
  shH(rx,ry,rw,rh,6+UPG.saberDmg*1.8+applyLevelBonus('dmg')*2.5);for(let i=0;i<5;i++)sp(P.x+(P.dir>0?P.w:-8),P.y+3+i*8,P.dir*(7+i),-1.4+i*0.45,1.5,'#efe',48,3,22,false);hs=4
}
function atkTrikeCharge(){if(P.cd>0)return;P.cd=24;P.atk=24;P.inv=Math.max(P.inv,24);P.vx=P.dir*13;sfx('heavy');shake(14);
  const rx=P.x+(P.dir>0?P.w:-175),ry=P.y-2,rw=180,rh=P.h+28;shH(rx,ry,rw,rh,10+UPG.saberDmg*1.5+applyLevelBonus('dmg')*3);
  for(let i=0;i<30;i++)ps(P.x+(P.dir>0?P.w:-4),P.y+P.h,1,'#cb8',8,22,5);hs=6
}
function atkTrikeQuake(){if(P.cd>0)return;P.cd=30;P.atk=26;sfx('heavy');shake(24);const rx=P.x-185,ry=FLOOR-86,rw=390,rh=92;
  shH(rx,ry,rw,rh,8.5+applyLevelBonus('dmg')*2);for(let i=0;i<18;i++)sp(P.x-175+i*22,FLOOR+4,(i-9)*0.35,-6-Math.random()*4,1.8,'#b86',13,10,42,false);ps(P.x+P.w/2,FLOOR,48,'#fd8',7,32,6);hs=8
}
function atkPteraDive(){if(P.cd>0)return;P.cd=15;P.atk=18;sfx('slash');P.vy=6.5;const rx=P.x+(P.dir>0?P.w:-140),ry=P.y-8,rw=145,rh=100;
  shH(rx,ry,rw,rh,6.5+applyLevelBonus('dmg')*2);for(let i=0;i<13;i++)sp(P.x+P.w/2,P.y+P.h/2,P.dir*(5+i*0.5),2+i*0.22,1.4,'#bef',40+i*4,3,26,false);shake(7)
}

// ═══════════════════════════════════════════════
// PICKUPS (hearts)
// ═══════════════════════════════════════════════
const PU=[]; // {x,y,w,h,vx,vy,heal,life}
function dropHeart(x,y){
  PU.push({x:x-4,y:y-4,w:8,h:8,vx:(Math.random()-0.5)*3,vy:-4,heal:2,life:300,ground:false});
}
function drawPU(){
  for(const u of PU){
    const ux=Math.round(u.x-camX),uy=Math.round(u.y+camY);
    const pulse=Math.sin(Date.now()*0.008)*0.2+0.8;
    ctx.fillStyle=`rgba(255,255,255,${pulse*0.5})`;ctx.fillRect(ux-2,uy-2,16,16);
    const c=u.c||'#f44',hc=u.hc||'#faa';
    ctx.fillStyle=c;ctx.fillRect(ux,uy,12,12);
    ctx.fillStyle=hc;ctx.fillRect(ux+2,uy+2,8,8);
    // Icon hint
    ctx.fillStyle='#fff';
    if(u.type==='atkUp'){ctx.fillRect(ux+6,uy+4,2,5);ctx.fillRect(ux+3,uy+5,6,3)}
    else if(u.type==='spdUp'){ctx.fillRect(ux+4,uy+5,6,2);ctx.fillRect(ux+4,uy+3,2,4);ctx.fillRect(ux+8,uy+3,2,4)}
    else if(u.type==='shield'){ctx.fillRect(ux+4,uy+3,6,7);ctx.fillRect(ux+5,uy+4,4,5);ctx.fillStyle=c;ctx.fillRect(ux+6,uy+5,2,3)}
    else if(u.type==='magnet'){ctx.fillRect(ux+4,uy+6,6,2);ctx.fillRect(ux+5,uy+3,4,2);ctx.fillRect(ux+4,uy+4,2,4);ctx.fillRect(ux+8,uy+4,2,4)}
    else if(u.type==='dinoMount'){ctx.fillRect(ux+2,uy+6,8,3);ctx.fillRect(ux+7,uy+3,4,4);ctx.fillRect(ux+3,uy+9,2,3);ctx.fillRect(ux+8,uy+9,2,3)}
    else if(u.type==='pteraMount'){ctx.fillRect(ux+5,uy+4,3,5);ctx.fillRect(ux+1,uy+5,5,2);ctx.fillRect(ux+7,uy+5,5,2);ctx.fillRect(ux+8,uy+3,2,2)}
    else if(u.type==='raptorMount'){ctx.fillRect(ux+2,uy+5,7,4);ctx.fillRect(ux+8,uy+2,4,4);ctx.fillRect(ux+4,uy+9,2,4);ctx.fillRect(ux+9,uy+8,2,4)}
    else if(u.type==='trikeMount'){ctx.fillRect(ux+1,uy+6,10,5);ctx.fillRect(ux+8,uy+3,4,4);ctx.fillRect(ux+10,uy+2,2,2);ctx.fillRect(ux+3,uy+10,2,3);ctx.fillRect(ux+8,uy+10,2,3)}
    else if(u.type==='baozi'){ctx.fillStyle='#ffd';ctx.fillRect(ux+2,uy+3,8,7);ctx.fillStyle='#b76';ctx.fillRect(ux+4,uy+5,2,2);ctx.fillRect(ux+8,uy+5,2,2);ctx.fillStyle='#fff';ctx.fillRect(ux+5,uy+2,4,2)}
    else{ctx.fillRect(ux+3,uy+1,2,2);ctx.fillRect(ux+6,uy+3,2,2)} // heart
    if(u.mount){ctx.fillStyle='#fff';ctx.font='bold 7px monospace';ctx.fillText(mountName(u.mount),ux-6,uy-8)}
    if(u.mount&&hitR(P.x-14,P.y-18,P.w+28,P.h+28,u.x,u.y,u.w,u.h)){ctx.fillStyle='#fff';ctx.font='bold 8px monospace';ctx.fillText('F',ux+3,uy-18)}
  }
}

// ═══════════════════════════════════════════════
// EQUIPMENT BUFFS on player
// ═══════════════════════════════════════════════
P.atkBuff=0;P.spdBuff=0;P.shield=0;P.magnet=0;
