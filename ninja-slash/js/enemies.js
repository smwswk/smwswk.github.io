// ═══════════════════════════════════════════════
// ENEMIES — more types, musou feel
// ═══════════════════════════════════════════════
const ET={
  // Level 1 — fruit zombies
  apple:{w:18,h:20,hp:2,spd:0.8,dmg:1,c:'#e33',sc:10},
  watermelon:{w:28,h:26,hp:5,spd:0.4,dmg:2,c:'#3a3',sc:30,xp:true},
  grape:{w:12,h:12,hp:1,spd:2.4,dmg:1,c:'#94c',sc:5},
  pineapple:{w:20,h:24,hp:3,spd:0.55,dmg:1,c:'#da2',sc:20,spike:true},
  banana:{w:14,h:28,hp:2,spd:1.6,dmg:1,c:'#ed3',sc:15,slip:true},
  orange:{w:20,h:20,hp:4,spd:1.0,dmg:2,c:'#f80',sc:25,roll:true},
  coconut:{w:16,h:16,hp:7,spd:0.3,dmg:2,c:'#864',sc:35,armored:true},
  cherrybomb:{w:14,h:14,hp:1,spd:1.5,dmg:2,c:'#c11',sc:15,bomb:true},
  // Level 2 — ice/frozen enemies
  iceShard:{w:10,h:24,hp:1,spd:2.0,dmg:1,c:'#8cf',sc:8,sharp:true},
  frostOrb:{w:18,h:18,hp:3,spd:0.5,dmg:1,c:'#aef',sc:20,shoots:true},
  snowBeast:{w:30,h:28,hp:8,spd:0.35,dmg:3,c:'#ddeeff',sc:40,xp:true},
  glacier:{w:24,h:22,hp:9,spd:0.2,dmg:2,c:'#bcd',sc:45,armored:true,heavy:true},
  frozenGrape:{w:12,h:12,hp:1,spd:2.2,dmg:1,c:'#adf',sc:5},
  crystal:{w:16,h:22,hp:4,spd:0,dmg:2,c:'#cdf',sc:25,static:true,spike:true},
  // Level 3 — Volcanic/Inferno
  fireImp:{w:14,h:16,hp:2,spd:2.2,dmg:1,c:'#f52',sc:12},
  lavaGolem:{w:30,h:28,hp:10,spd:0.25,dmg:4,c:'#c40',sc:50,xp:true,armored:true},
  flameSerpent:{w:18,h:22,hp:3,spd:1.4,dmg:1,c:'#f80',sc:22,slip:true},
  emberWisp:{w:10,h:14,hp:1,spd:1.8,dmg:1,c:'#fe0',sc:10,shoots:true},
  // Level 4 — Shadow/Underworld
  shadowStalker:{w:16,h:24,hp:3,spd:2.5,dmg:2,c:'#224',sc:25,sharp:true},
  voidBeast:{w:32,h:30,hp:12,spd:0.3,dmg:4,c:'#112',sc:60,xp:true,heavy:true},
  wraith:{w:18,h:20,hp:2,spd:1.2,dmg:1,c:'#448',sc:18,static:true,shoots:true},
  darkCrystal:{w:16,h:22,hp:5,spd:0,dmg:2,c:'#336',sc:30,static:true,spike:true,armored:true},
};
const EN=[];
const ENEMY_LOADOUTS={
  apple:['advance'],
  watermelon:['rush'],
  grape:['skitterHop'],
  pineapple:['guard'],
  banana:['leapStrike'],
  orange:['rollRush'],
  coconut:['guard'],
  cherrybomb:['suicideFuse'],
  iceShard:['skitterHop'],
  frostOrb:['arcShot'],
  snowBeast:['rush','groundPound'],
  glacier:['guard','groundPound'],
  frozenGrape:['skitterHop'],
  crystal:['radialPulse'],
  fireImp:['leapStrike','arcShot'],
  lavaGolem:['guard','groundPound'],
  flameSerpent:['rush'],
  emberWisp:['volley'],
  shadowStalker:['blinkBehind','rush'],
  voidBeast:['guard','rush','groundPound'],
  wraith:['blinkBehind','arcShot'],
  darkCrystal:['guard','radialPulse'],
};
function enemyLoadout(tp){return ENEMY_LOADOUTS[tp]||['advance']}
function actionReady(e,id,cd){if(!e.actCD)e.actCD={};if(e.actCD[id]>0)return false;e.actCD[id]=cd;return true}
function markAction(e,id,t){e.action=id;e.actionT=t||18}
const ENEMY_ACTIONS={
  advance(e,s){return false},
  skitterHop(e,s){if(!s.aggro||!e.ground||s.dist>130||!actionReady(e,'skitterHop',55))return false;e.vy=-5.5;e.vx=Math.sign(s.dx)*e.spd*2.4;e.ground=false;markAction(e,'skitterHop',16);return true},
  leapStrike(e,s){if(!s.aggro||!e.ground||s.dist>160||!actionReady(e,'leapStrike',70))return false;e.vy=-6.4;e.vx=Math.sign(s.dx)*e.spd*3.1;e.ground=false;markAction(e,'leapStrike',18);ps(e.x+e.w/2,e.y+e.h,5,e.c,2,12);return true},
  rush(e,s){if(!s.aggro||s.dist<45||s.dist>220||!actionReady(e,'rush',95))return false;e.vx=Math.sign(s.dx)*Math.max(e.spd*4.2,4);markAction(e,'rush',24);ps(e.x+e.w/2,e.y+e.h,7,e.c,2,16);return true},
  rollRush(e,s){if(!s.aggro||!e.ground||s.dist>150||!actionReady(e,'rollRush',90))return false;e.rollT=34;e.vx=Math.sign(s.dx)*Math.max(e.spd*4.5,4.5);e.vy=-1.5;markAction(e,'rollRush',28);return true},
  arcShot(e,s){if(!s.aggro||s.dist>300||!actionReady(e,'arcShot',75))return false;const dir=Math.sign(s.dx)||1;sp(e.x+e.w/2,e.y+e.h/2,dir*3.2,-2.4+s.dy*0.006,1,e.tp==='fireImp'?'#f80':'#8ef',6,6,110,true);markAction(e,'arcShot',16);return true},
  volley(e,s){if(!s.aggro||s.dist>280||!actionReady(e,'volley',95))return false;const dir=Math.sign(s.dx)||1;for(let k=-1;k<=1;k++)sp(e.x+e.w/2,e.y+e.h/2,dir*(3.1+Math.abs(k)*0.4),k*0.85,1,'#fe0',5,5,95,true);markAction(e,'volley',20);return true},
  groundPound(e,s){if(!s.aggro||!e.ground||s.dist>160||!actionReady(e,'groundPound',140))return false;e.vy=-7;e.vx=Math.sign(s.dx)*e.spd*1.2;e.pounding=1;e.ground=false;markAction(e,'groundPound',32);shake(4);return true},
  blinkBehind(e,s){if(!s.aggro||s.dist<60||s.dist>280||!actionReady(e,'blinkBehind',140))return false;ps(e.x+e.w/2,e.y+e.h/2,12,'#70a',3,18);const side=s.dx<0?-1:1;e.x=Math.max(0,Math.min(LW-e.w,P.x+side*(P.w+34)));e.y=Math.min(P.y,FLOOR-e.h);e.vx=-side*e.spd*1.8;markAction(e,'blinkBehind',24);ps(e.x+e.w/2,e.y+e.h/2,12,'#a4f',3,18);return true},
  guard(e,s){if(!s.aggro||s.dist<70||s.dist>210||!actionReady(e,'guard',110))return false;e.guardT=46;markAction(e,'guard',22);return false},
  radialPulse(e,s){if(!s.aggro||s.dist>180||!actionReady(e,'radialPulse',120))return false;for(let jj=0;jj<8;jj++){const aa=jj*Math.PI/4;sp(e.x+e.w/2,e.y+e.h/2,Math.cos(aa)*2.4,Math.sin(aa)*2.4,1,e.tp==='darkCrystal'?'#70a':'#8ef',4,4,80,true)}markAction(e,'radialPulse',26);ps(e.x+e.w/2,e.y+e.h/2,8,e.c,2,18);return true},
  suicideFuse(e,s){if(!s.aggro||s.dist>42||!actionReady(e,'suicideFuse',30))return false;e.hp=0;killE(e);markAction(e,'suicideFuse',10);return true},
};
function runEnemyActions(e,s){for(const id of e.acts||enemyLoadout(e.tp)){const fn=ENEMY_ACTIONS[id];if(fn&&fn(e,s))return true}return false}
function spE(tp,x,y){if(EN.length>=40)return;const t=ET[tp];EN.push({tp,x,y:y||FLOOR-t.h,w:t.w,h:t.h,vx:0,vy:0,hp:t.hp,mhp:t.hp,spd:t.spd,dmg:t.dmg,c:t.c,sc:t.sc,spike:t.spike||false,xp:t.xp||false,slip:t.slip||false,roll:t.roll||false,armored:t.armored||false,bomb:t.bomb||false,sharp:t.sharp||false,shoots:t.shoots||false,heavy:t.heavy||false,static:t.static||false,acts:enemyLoadout(tp).slice(),actCD:{},action:'',actionT:0,guardT:0,ground:false,aiT:30+Math.random()*40,atkT:0,hurtT:0,dead:false,dieT:0,h1:null,h2:null,anim:Math.random()*100,spT:25,rollT:0,shootT:60+Math.random()*40,telegraphT:0,parryStunT:0,frozenT:0})}

function upE(){
  for(let i=EN.length-1;i>=0;i--){const e=EN[i];e.anim++;if(e.spT>0){e.spT--;if(e.spT===0)sfx('spawn');continue}
    if(e.dead){e.dieT--;if(e.h1){e.h1.x+=e.h1.vx;e.h1.y+=e.h1.vy;e.h1.vy+=0.4;e.h1.r+=0.15}if(e.h2){e.h2.x+=e.h2.vx;e.h2.y+=e.h2.vy;e.h2.vy+=0.4;e.h2.r-=0.15}if(e.dieT<=0)EN.splice(i,1);continue}
    if(!e.actCD)e.actCD={};for(const k in e.actCD){if(e.actCD[k]>0)e.actCD[k]--}if(e.actionT>0)e.actionT--;else e.action='';if(e.guardT>0)e.guardT--;
    if(e.hurtT>0)e.hurtT--;
    if(e.telegraphT>0)e.telegraphT--;
    if(e.parryStunT>0)e.parryStunT--;
    // Frozen state — completely immobile
    if(e.frozenT>0){e.frozenT--;if(e.frozenT%12===0)ps(e.x+e.w/2,e.y+e.h/2,2,'#8cf',0.8,4);e.x=Math.max(0,Math.min(LW-e.w,e.x));continue}
    // Parry stun — long stun after successful parry
    if(e.parryStunT>0){e.parryStunT--;e.vx*=0.9;if(e.y+e.h<FLOOR||e.vy!==0){e.vy+=G;e.y+=e.vy;const gnd=getGround(e.x,e.h,e.y+e.h);if(e.y+e.h>=gnd&&e.vy>=0){e.y=gnd-e.h;e.vy=0;e.ground=true}else e.ground=false}else{e.ground=true}e.x=Math.max(0,Math.min(LW-e.w,e.x));continue}
    // Stun / knockback state machine
    if(e.stunT>0){e.stunT--;e.vx*=0.85;e.x+=e.vx;if(e.y+e.h<FLOOR||e.vy!==0){e.vy+=G;e.y+=e.vy;const gnd=getGround(e.x,e.h,e.y+e.h);if(e.y+e.h>=gnd&&e.vy>=0){e.y=gnd-e.h;e.vy=0;e.ground=true}else e.ground=false}else{e.ground=true}e.x=Math.max(0,Math.min(LW-e.w,e.x));continue}
    if(e.knockT>0){e.knockT--;e.x+=e.vx;if(e.y+e.h<FLOOR||e.vy!==0){e.vy+=G;e.y+=e.vy;const gnd=getGround(e.x,e.h,e.y+e.h);if(e.y+e.h>=gnd&&e.vy>=0){e.y=gnd-e.h;e.vy=0;e.ground=true}else e.ground=false}else{e.ground=true}e.x=Math.max(0,Math.min(LW-e.w,e.x));if(e.knockT<=0){e.stunT=8}continue}
    const dx=P.x-e.x,dy=P.y-e.y,dist=Math.abs(dx);const aggro=dist<240&&Math.abs(dy)<90;
    // Cull distant enemies — freeze AI and skip detailed updates
    if(Math.abs(dx)>500){e.x=Math.max(0,Math.min(LW-e.w,e.x));if(e.x<P.x-700)EN.splice(i,1);continue}
    e.aiT--;
    // Corruption scaling: faster, tougher enemies over time
    const corrMul=1+corruption*0.008;
    if(e.hurtT<=0&&e.aiT<=0){
      e.aiT=Math.max(8,18+Math.random()*35-corruption*0.15);
      if(aggro){
        runEnemyActions(e,{dx,dy,dist,aggro});
        // Type-specific chase behavior
        if(e.tp==='grape'){e.vx=Math.sign(dx)*e.spd*(0.8+Math.random()*0.5)}
        else if(e.tp==='watermelon'){e.vx=Math.sign(dx)*(dist<60?e.spd*2.8:e.spd)}
        else if(e.tp==='pineapple'){e.vx=Math.sign(dx)*e.spd*(dist<80?0:0.7)}
        else if(e.tp==='banana'){e.vx=Math.sign(dx)*e.spd;if(dist<50&&e.ground&&Math.random()<0.2){e.vy=-6;e.vx=Math.sign(dx)*e.spd*3;e.ground=false}} // slip dash
        else if(e.tp==='orange'){if(!e.rollT&&dist<70&&e.ground&&Math.random()<0.15){e.rollT=30;e.vx=Math.sign(dx)*e.spd*3.5;e.vy=-2}} // start roll
        else if(e.tp==='coconut'){e.vx=Math.sign(dx)*e.spd} // slow but tough
        else if(e.tp==='cherrybomb'){e.vx=Math.sign(dx)*e.spd*1.2;if(dist<35&&Math.random()<0.08){e.hp=0;killE(e);return}}
        else if(e.tp==='iceShard'){e.vx=Math.sign(dx)*e.spd*(0.9+Math.random()*0.3)} // fast erratic
        else if(e.tp==='frostOrb'){e.vx=Math.sign(dx)*e.spd} // slow float
        else if(e.tp==='snowBeast'){e.vx=Math.sign(dx)*(dist<50?e.spd*3:e.spd)} // charge close
        else if(e.tp==='glacier'){e.vx=Math.sign(dx)*e.spd;if(dist<70&&Math.random()<0.1){shake(4);ps(e.x+e.w/2,FLOOR,12,'#ff8',3,18)}} // ground pound
        else if(e.tp==='frozenGrape'){e.vx=Math.sign(dx)*e.spd*(0.7+Math.random()*0.6)}
        else if(e.tp==='crystal'){e.vx=0} // stationary
        else if(e.tp==='fireImp'){e.vx=Math.sign(dx)*e.spd*(1+Math.random()*0.4);if(dist<40&&e.ground&&Math.random()<0.05){e.vy=-4.5;e.ground=false;ps(e.x+e.w/2,e.y+e.h,3,'#f52')}}
        else if(e.tp==='lavaGolem'){e.vx=Math.sign(dx)*e.spd;if(!e.poundT)e.poundT=120+Math.random()*60;e.poundT--;if(e.poundT<=0&&e.ground&&dist<120){e.vy=-6;e.ground=false;e.pounding=1;e.poundT=140+Math.random()*40}if(e.pounding&&e.ground){e.pounding=0;shake(8);sfx('heavy');for(let ii=0;ii<6;ii++)sp(e.x+e.w/2,e.y+e.h-4,(ii-2.5)*1.6,-2-Math.random(),1,'#c40',4,4,60,false);ps(e.x+e.w/2,e.y+e.h,8,'#f80')}}
        else if(e.tp==='flameSerpent'){if(!e.slipT)e.slipT=80+Math.random()*40;e.slipT--;if(e.slipT<=0&&aggro){e.slipping=18;e.slipT=110+Math.random()*60}if(e.slipping>0){e.vx=Math.sign(dx)*e.spd*3.2;e.slipping--;ps(e.x+e.w/2,e.y+e.h/2,1,'#f80')}else{e.vx=Math.sign(dx)*e.spd*(0.7+Math.sin(e.x*0.05)*0.3)}}
        else if(e.tp==='emberWisp'){e.vy=Math.sin(Date.now()*0.005+e.x*0.02)*0.6;if(dist<70)e.vx=-Math.sign(dx)*e.spd*0.6;else if(dist>140)e.vx=Math.sign(dx)*e.spd;else e.vx=Math.sign(dx)*e.spd*0.2;e.ground=false}
        else if(e.tp==='shadowStalker'){e.vx=Math.sign(dx)*e.spd*(1.1+Math.random()*0.3);if(dist<80&&dist>30&&e.ground&&Math.random()<0.04){e.vy=-5.2;e.ground=false;e.vx=Math.sign(dx)*e.spd*1.6}if(Math.random()<0.2)ps(e.x+e.w/2,e.y+e.h/2,1,'#224')}
        else if(e.tp==='voidBeast'){if(!e.chargeT)e.chargeT=160+Math.random()*60;e.chargeT--;if(e.chargeT<=0&&aggro&&dist<240){e.charging=40;e.chargeT=220+Math.random()*80;shake(3)}if(e.charging>0){e.vx=Math.sign(dx)*e.spd*8;e.charging--;ps(e.x+e.w/2,e.y+e.h-2,2,'#112');if(e.charging===0)shake(4)}else{e.vx=Math.sign(dx)*e.spd}}
        else if(e.tp==='wraith'){e.vx=Math.sign(dx)*e.spd*0.4;e.vy=Math.sin(Date.now()*0.003+e.y*0.01)*0.3;e.ground=false}
        else if(e.tp==='darkCrystal'){e.vx=0;e.vy=0;if(!e.pulseT)e.pulseT=70;e.pulseT--;if(e.pulseT<=0&&dist<90){e.pulseT=90+Math.random()*30;for(let jj=0;jj<8;jj++){let aa=jj*Math.PI/4;sp(e.x+e.w/2,e.y+e.h/2,Math.cos(aa)*2.2,Math.sin(aa)*2.2,1,'#336',4,4,70,false)}ps(e.x+e.w/2,e.y+e.h/2,5,'#448')}}
        else{e.vx=Math.sign(dx)*e.spd}
        // Corruption speed boost
        e.vx*=corrMul;
        // Jump toward player
        if(e.ground&&dy<-40&&Math.random()<0.25){e.vy=-5.5-Math.random()*2.5;e.ground=false}
        else if(e.ground&&dy>0&&Math.random()<0.1){e.vy=-3-Math.random()*2;e.ground=false}
      }else{
        e.vx=(Math.random()-0.5)*e.spd*0.5*corrMul;if(Math.random()<0.15)e.vx=0;
      }
    }
    if(e.rollT>0){e.rollT--;if(e.rollT<=0)e.vx=0}
    // Differentiated shooting
    if(e.shoots&&aggro&&e.shootT>0)e.shootT--;
    if(e.shoots&&aggro&&e.shootT<=0&&e.hurtT<=0){
      if(e.tp==='emberWisp'){e.shootT=40+Math.random()*20;for(var k=-1;k<=1;k++)sp(e.x+e.w/2,e.y+e.h/2,Math.sign(dx)*3.2+k*0.4,Math.sin(dy*0.01)*1.2+k*0.6,1,'#fe0',4,4,80,true)}
      else if(e.tp==='wraith'){e.shootT=70+Math.random()*40;sp(e.x+e.w/2,e.y+e.h/2,Math.sign(dx)*2.4,dy*0.012,1,'#448',6,6,120,true);sp(e.x+e.w/2,e.y+e.h/2,Math.sign(dx)*2.2,dy*0.012-0.5,1,'#448',5,5,120,true)}
      else{e.shootT=50+Math.random()*30;sp(e.x+e.w/2,e.y+e.h/2,Math.sign(dx)*3,Math.sin(dy*0.01)*1.5,1,'#8ef',5,5,90,true)}
    }
    // Melee attack check — with telegraph window for parry
    const canAtk=!e.static||(e.static&&dist<e.w*1.5);
    if(e.hurtT<=0&&canAtk&&e.parryStunT<=0){
      if(dist<e.w*1.8&&Math.abs(dy)<36&&e.atkT<=0&&Math.random()<0.025){
        e.telegraphT=14; e.atkT=40+Math.random()*40;
      }
    }
    if(e.telegraphT===1&&e.hurtT<=0&&canAtk){hurt(Math.ceil(e.dmg*corrMul),e.x)}
    if(e.atkT>0)e.atkT--;e.x+=e.vx;
    // Gravity + ground
    if(e.y+e.h<FLOOR||e.vy!==0){e.vy+=G;e.y+=e.vy;const gnd=getGround(e.x,e.h,e.y+e.h);if(e.y+e.h>=gnd&&e.vy>=0){e.y=gnd-e.h;e.vy=0;e.ground=true}else e.ground=false}else{e.ground=true}
    // Fall off bottom
    if(e.y>H+50)EN.splice(i,1);
    e.x=Math.max(0,Math.min(LW-e.w,e.x));if(e.x<P.x-700)EN.splice(i,1);
  }
}

function dmgE(e,m){
  if(e.dead)return;
  let rawDmg=m;
  // Crit chance
  if(UPG.critHeart>0&&Math.random()<(0.2+UPG.critHeart*0.05)){rawDmg*=2;ps(e.x+e.w/2,e.y-10,8,'#fd0',4,14)}
  const d=Math.ceil(rawDmg*(e.armored?0.5:1)*(e.guardT>0?0.35:1));e.hp-=Math.max(1,d);e.hurtT=7;
  // Parry: if enemy is in telegraph window, trigger parry stun
  if(e.telegraphT>0&&P.atk>0){e.parryStunT=35;P.inv=Math.max(P.inv,12);ps(P.x+P.w/2,P.y+P.h/2,16,'#fff',5,18);sfx('combo');triggerHitstop(5)}
  // Enhanced hit reaction: stun / knockback based on damage
  else if(d>=5){e.knockT=18;e.vx=(P.x<e.x?6:-6);e.vy=-5.5;triggerHitstop(4)}
  else if(d>=3){e.stunT=10;e.vx=(P.x<e.x?3.5:-3.5);e.vy=-3.5;triggerHitstop(3)}
  else{e.vx=(P.x<e.x?2.5:-2.5);e.vy=-3.5;triggerHitstop(d>=2?2:1)}
  // Frost bite freeze
  if(UPG.frostBite>0&&Math.random()<(0.3+UPG.frostBite*0.08)){e.frozenT=72+UPG.frostBite*12;ps(e.x+e.w/2,e.y+e.h/2,10,'#8cf',3,12)}
  // Chain lightning
  if(UPG.chainLightning>0&&Math.random()<(0.25+UPG.chainLightning*0.08)){
    for(const o of EN){if(o===e||o.dead||o.spT>0)continue;if(Math.hypot(o.x-e.x,o.y-e.y)<90){dmgE(o,Math.max(1,d*0.6));sp(e.x+e.w/2,e.y+e.h/2,(o.x-e.x)*0.08,(o.y-e.y)*0.08,0.8,'#fd0',4,4,20,false);break}}
  }
  P.combo++;P.cT=55;if(P.combo>P.mxC)P.mxC=P.combo;P.killIntent=Math.min(100,P.killIntent+4+d);
  // Lifesteal: combo 20+ or lifesteal upgrade
  if((P.combo>=20||UPG.lifesteal>0)&&P.wp===0&&P.combo%(3-UPG.lifesteal)===0){P.hp=Math.min(P.mhp,P.hp+1);ps(P.x+P.w/2,P.y+P.h/2,3,'#f44',1,8)}
  // Combo FX
  if(P.combo===5){ps(P.x+P.w/2,P.y+P.h/2,8,'#fff',2,10)}
  else if(P.combo===10){shake(3);ps(P.x+P.w/2,P.y+P.h/2,12,'#fd0',4,14);sfx('combo')}
  else if(P.combo===20){shake(6);ps(P.x+P.w/2,P.y+P.h/2,20,'#ff0',6,20);sfx('heavy')}
  else if(P.combo===30){shake(12);P.inv=20;ps(P.x+P.w/2,P.y+P.h/2,30,'#fff',8,25);sfx('bossHit')}
  if(P.combo>=10)sfx('combo');else sfx('hit');
  if(e.spike&&P.wp===0)hurt(1,e.x);
  ps(e.x+e.w/2,e.y+e.h/2,d*4,'#fff',3,10);hs=Math.max(hs,d>=2?3:1);
  if(e.hp<=0){triggerHitstop(5);killE(e)}
}

function dropItem(x,y,type){
  const items={heart:{c:'#f44',hc:'#faa',heal:2},atkUp:{c:'#f80',hc:'#fc6',buff:'atkBuff',dur:480},
    spdUp:{c:'#48f',hc:'#8cf',buff:'spdBuff',dur:300},shield:{c:'#fd0',hc:'#ff8',buff:'shield'},
    magnet:{c:'#c4f',hc:'#eaf',buff:'magnet',dur:360},
    dinoMount:{c:'#4a8',hc:'#9fc',mount:'dino',life:540},
    pteraMount:{c:'#69c',hc:'#bef',mount:'ptera',life:540},
    raptorMount:{c:'#7c6',hc:'#dfc',mount:'raptor',life:540},
    trikeMount:{c:'#b86',hc:'#fdc',mount:'trike',life:540}};
  const it=items[type];if(!it)return;
  PU.push({x:x-6,y:y-6,w:12,h:12,vx:(Math.random()-0.5)*3,vy:-4,life:it.life||360,ground:false,type,heal:it.heal||0,
    buff:it.buff||null,mount:it.mount||null,dur:it.dur||0,c:it.c,hc:it.hc});
}
const MOUNT_DROP_ORDER=['dinoMount','raptorMount','trikeMount','pteraMount'];
function mountDropType(){return MOUNT_DROP_ORDER[(LV+waveCleared)%MOUNT_DROP_ORDER.length]}
function dropMount(x,y){dropItem(x,y,mountDropType())}

function killE(e){
  e.dead=true;e.dieT=28;P.combo+=2;P.cT=55;P.kills++;
  // Kill bomb explosion on death
  if(UPG.killBomb>0){
    const rad=45+UPG.killBomb*15, dmg=2+UPG.killBomb;
    ps(e.x+e.w/2,e.y+e.h/2,18,'#f80',5,26);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;sp(e.x+e.w/2,e.y+e.h/2,Math.cos(a)*4,Math.sin(a)*4,1,'#f60',8,8,40,false)}
    for(const o of EN){if(o===e||o.dead||o.spT>0)continue;if(Math.hypot(o.x-e.x,o.y-e.y)<rad)dmgE(o,dmg)}
    if(BS.on&&!BS.dead){for(const j of BS.jt){if(j.dead||j.armor)continue;if(Math.hypot(j.x-e.x,j.y-e.y)<rad)dmgJ(j,dmg)}}
  }
  // XP gain
  const xpVals={grape:8,frozenGrape:8,apple:12,iceShard:12,banana:15,cherrybomb:18,orange:20,frostOrb:20,pineapple:22,crystal:25,coconut:30,glacier:35,watermelon:35,snowBeast:40,fireImp:10,emberWisp:8,flameSerpent:18,lavaGolem:45,shadowStalker:20,wraith:15,darkCrystal:25,voidBeast:55};
  gainXP(xpVals[e.tp]||15);
  // Themed kill burst
  if(LV===3){
    ps(e.x+e.w/2,e.y+e.h/2,18,'#111',7,28);
    ps(e.x+e.w/2,e.y+e.h/2,12,'#222',4,20);
    ps(e.x+e.w/2,e.y+e.h/2,8,'#333',3,16);
    for(let i=0;i<6;i++){const a=Math.random()*Math.PI*2;sp(e.x+e.w/2,e.y+e.h/2,Math.cos(a)*4,Math.sin(a)*2-3,0,'#1a1a2a',6,5,22,false);}
  }else if(LV===0){
    ps(e.x+e.w/2,e.y+e.h/2,14,e.c,5,24);
    ps(e.x+e.w/2,e.y+e.h/2,8,'#f84',3,15);
    ps(e.x+e.w/2,e.y+e.h/2,5,'#fca',2,10);
  }else if(LV===1){
    ps(e.x+e.w/2,e.y+e.h/2,14,e.c,5,24);
    ps(e.x+e.w/2,e.y+e.h/2,8,'#bef',3,15);
    ps(e.x+e.w/2,e.y+e.h/2,5,'#fff',2,10);
  }else{
    ps(e.x+e.w/2,e.y+e.h/2,16,e.c,6,26);
    ps(e.x+e.w/2,e.y+e.h/2,10,'#631',4,18);
    ps(e.x+e.w/2,e.y+e.h/2,6,'#fd0',3,12);
  }
  if(P.wp===0&&!e.bomb){e.h1={x:e.x,y:e.y,vx:-4,vy:-6,r:0,w:e.w/2,h:e.h,c:e.c};e.h2={x:e.x+e.w/2,y:e.y,vx:4,vy:-6,r:0,w:e.w/2,h:e.h,c:e.c}}
  if(e.xp){ps(e.x+e.w/2,e.y+e.h/2,25,'#3c3',6,28);ps(e.x+e.w/2,e.y+e.h/2,15,'#f44',3,20);for(const o of EN){if(o===e||o.dead)continue;if(Math.hypot(o.x-e.x,o.y-e.y)<70)dmgE(o,1)}shake(6);sfx('explode')}
  if(e.bomb){ps(e.x+e.w/2,e.y+e.h/2,25,'#f80',7,30);ps(e.x+e.w/2,e.y+e.h/2,15,'#f40',5,22);for(const o of EN){if(o===e||o.dead)continue;if(Math.hypot(o.x-e.x,o.y-e.y)<55)dmgE(o,2)}shake(8);sfx('explode')}
  // Mission tracking
  if(!MISSION.done&&MISSION.t==='kills'){MISSION.p++;if(MISSION.p>=MISSION.tg)completeMission()}
  // Loot drops
  const r=Math.random();
  if((e.xp||e.heavy)&&Math.random()<0.35)dropMount(e.x+e.w/2,e.y);
  if(r<0.18)dropItem(e.x+e.w/2,e.y,'heart');
  else if(r<0.24)dropItem(e.x+e.w/2,e.y,'atkUp');
  else if(r<0.28)dropItem(e.x+e.w/2,e.y,'spdUp');
  else if(r<0.31)dropItem(e.x+e.w/2,e.y,'shield');
  else if(r<0.33)dropItem(e.x+e.w/2,e.y,'magnet');
}
function gainXP(amt){
  P.xp+=amt;
  while(P.level<XP_TABLE.length-1&&P.xp>=XP_TABLE[P.level]){
    P.xp-=XP_TABLE[P.level];P.level++;
    // Apply level-up rewards immediately
    P.mhp=12+UPG.maxHp*4+applyLevelBonus('hp');P.hp=Math.min(P.mhp,P.hp+3);
    P.mj=3+UPG.extraJump+(applyLevelBonus('jump')||0);
    ps(P.x+P.w/2,P.y+P.h/2,25,'#fd0',6,28);sfx('win');
    notiT=60;notiMsg='升级! Lv.'+P.level+' 获得永久强化';
  }
}
function completeMission(){
  if(MISSION.done)return;MISSION.done=true;
  applyUpgrade(MISSION.rw);
  shake(14);sfx('win');
  ps(P.x+P.w/2,P.y+P.h/2,40,'#fd0',8,36);
  // Show brief notification
  notiT=90;notiMsg='任务完成: '+MISSION.rw.toUpperCase()+' 已升级!';
}
let notiT=0,notiMsg='';

// ── ENEMY SPRITES ──────────────────────────────
function dE(){
  for(const e of EN){
    // Cull off-screen enemies (skip rendering, still update)
    const sx=e.x-camX;if(sx<-50||sx>W+50)continue;
    if(e.dead){for(const h of[e.h1,e.h2]){if(!h)continue;ctx.fillStyle=h.c;ctx.fillRect(Math.round(h.x-camX),Math.round(h.y+camY),h.w,h.h);ctx.fillStyle='#f66';ctx.fillRect(Math.round(h.x-camX)+h.w/2,Math.round(h.y+camY)+h.h,2,4)}continue}
    let ex=Math.round(sx),ey=Math.round(e.y+camY);const fl=e.hurtT>0&&e.hurtT%2===0;
    if(e.spT>0){const p=e.spT/25,rise=(1-p)*e.h;ctx.globalAlpha=p;ctx.fillStyle=e.c;ctx.fillRect(ex,ey+rise,e.w,e.h-rise);ctx.globalAlpha=1;continue}
    ctx.save();ctx.translate(ex+e.w/2,ey+e.h);ctx.scale(1.25,1.25);ex=Math.round(-e.w/2);ey=-e.h;
    ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(ex-3,ey+e.h-2,e.w+6,4);
    ctx.fillStyle=fl?'#fff':e.c;ctx.fillRect(ex,ey,e.w,e.h);
    if(e.tp==='apple'){ctx.fillStyle='#520';ctx.fillRect(ex+e.w/2-1,ey-4,3,5);ctx.fillStyle='#a00';ctx.fillRect(ex+1,ey+1,16,18);ctx.fillStyle=fl?'#fff':'#e33';ctx.fillRect(ex+2,ey+2,14,16);ctx.fillStyle='#f88';ctx.fillRect(ex+4,ey+3,3,3);ctx.fillRect(ex+11,ey+3,3,3);ctx.fillStyle='#000';ctx.fillRect(ex+5,ey+7,2,2);ctx.fillRect(ex+12,ey+7,2,2);ctx.fillStyle='#400';ctx.fillRect(ex+5,ey+13,8,3);ctx.fillStyle='#fcc';ctx.fillRect(ex+8,ey+3,3,4)}
    else if(e.tp==='watermelon'){ctx.fillStyle='#1a1';ctx.fillRect(ex+2,ey,24,26);ctx.fillStyle='#3a3';for(let s=0;s<28;s+=7)ctx.fillRect(ex+s,ey+1,5,24);ctx.fillStyle='#282';for(let s=2;s<26;s+=6)ctx.fillRect(ex+s,ey+3,4,20);ctx.fillStyle='#fff';ctx.fillRect(ex+7,ey+8,6,6);ctx.fillRect(ex+15,ey+7,6,6);ctx.fillStyle='#000';ctx.fillRect(ex+8,ey+9,3,3);ctx.fillRect(ex+16,ey+8,3,3);ctx.fillStyle='#400';ctx.fillRect(ex+8,ey+18,12,4);ctx.fillStyle='rgba(0,0,0,0.15)';for(let s=0;s<24;s+=6)ctx.fillRect(ex+3+s,ey+4,2,2)}
    else if(e.tp==='grape'){ctx.fillStyle=fl?'#fff':'#70a';ctx.fillRect(ex+2,ey,8,12);ctx.fillStyle=fl?'#fff':'#94c';ctx.fillRect(ex+1,ey+1,10,10);ctx.fillStyle=fl?'#fff':'#b5d';ctx.fillRect(ex+2,ey+2,8,8);ctx.fillStyle='#000';ctx.fillRect(ex+3,ey+4,2,2);ctx.fillRect(ex+7,ey+4,2,2);ctx.fillStyle='#fff';ctx.fillRect(ex+4,ey+5,1,1);ctx.fillRect(ex+8,ey+5,1,1)}
    else if(e.tp==='pineapple'){ctx.fillStyle='#3a3';for(let s=0;s<e.w;s+=5)ctx.fillRect(ex+s,ey-4,3,5);ctx.fillStyle='#981';for(let s=0;s<e.w;s+=6)ctx.fillRect(ex+s,ey,e.h>e.w?2:e.w,2);ctx.fillStyle='#fff';ctx.fillRect(ex+3,ey+7,4,4);ctx.fillRect(ex+11,ey+7,4,4);ctx.fillStyle='#000';ctx.fillRect(ex+4,ey+8,2,2);ctx.fillRect(ex+12,ey+8,2,2);if(e.spike)ctx.fillRect(ex+e.w/2-2,ey-6,4,4)}
    else if(e.tp==='banana'){ctx.fillStyle='#ed3';ctx.fillRect(ex+1,ey,12,26);ctx.fillStyle='#ca1';ctx.fillRect(ex+3,ey+2,8,22);ctx.fillStyle='#000';ctx.fillRect(ex+4,ey+8,2,2);ctx.fillRect(ex+8,ey+8,2,2);ctx.fillStyle='#864';ctx.fillRect(ex+2,ey-3,3,6);ctx.fillRect(ex+9,ey-3,3,6)}
    else if(e.tp==='orange'){const rr=e.rollT>0;ctx.fillStyle='#f80';ctx.fillRect(ex,ey,20,20);ctx.fillStyle='#fa2';ctx.fillRect(ex+2,ey+2,16,16);ctx.fillStyle='#fff';ctx.fillRect(ex+5,ey+5,4,4);ctx.fillRect(ex+11,ey+5,4,4);ctx.fillStyle='#000';ctx.fillRect(ex+6,ey+6,2,2);ctx.fillRect(ex+12,ey+6,2,2);ctx.fillStyle='#3a2';ctx.fillRect(ex+8,ey-4,4,6);if(rr){ctx.fillStyle='rgba(255,136,0,0.4)';ctx.fillRect(ex-4,ey-4,28,28)}}
    else if(e.tp==='coconut'){ctx.fillStyle='#864';ctx.fillRect(ex,ey,16,16);ctx.fillStyle='#753';ctx.fillRect(ex+2,ey+2,12,12);ctx.fillStyle='#642';ctx.fillRect(ex+4,ey+4,8,8);ctx.fillStyle='#fff';ctx.fillRect(ex+5,ey+5,8,2);ctx.fillStyle='#000';ctx.fillRect(ex+5,ey+7,3,3);ctx.fillRect(ex+9,ey+7,3,3);if(e.armored&&e.hurtT>0){ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(ex-1,ey-1,18,18)}}
    else if(e.tp==='cherrybomb'){const bf=e.hurtT>0;const bp=Math.sin(Date.now()*0.02)*0.3+0.7;ctx.fillStyle=`rgba(255,40,0,${bp*0.4})`;ctx.fillRect(ex-3,ey-3,20,20);ctx.fillStyle=bf?'#fff':'#c11';ctx.fillRect(ex,ey,14,14);ctx.fillStyle=bf?'#faa':'#e22';ctx.fillRect(ex+1,ey+1,12,12);ctx.fillStyle=bf?'#fcc':'#f33';ctx.fillRect(ex+3,ey+3,8,8);ctx.fillStyle='#000';ctx.fillRect(ex+4,ey+5,2,3);ctx.fillRect(ex+9,ey+5,2,3);ctx.fillStyle='#3a2';ctx.fillRect(ex+6,ey-4,2,6)}
    // Ice enemies
    else if(e.tp==='iceShard'){ctx.fillStyle='#bdf';ctx.fillRect(ex+1,ey,8,24);ctx.fillStyle='#8cf';ctx.fillRect(ex+2,ey+2,6,20);ctx.fillStyle='#fff';ctx.fillRect(ex+4,ey+3,2,3);ctx.fillStyle='#eef';ctx.fillRect(ex+3,ey-2,4,6)}
    else if(e.tp==='frostOrb'){const fp=Math.sin(e.anim*0.08)*0.3+0.7;ctx.fillStyle=`rgba(180,220,255,${fp})`;ctx.fillRect(ex-2,ey-2,22,22);ctx.fillStyle='#aef';ctx.fillRect(ex+1,ey+1,16,16);ctx.fillStyle='#fff';ctx.fillRect(ex+4,ey+4,10,10);ctx.fillStyle='#8cf';ctx.fillRect(ex+6,ey+6,6,6);ctx.fillStyle='#fff';ctx.fillRect(ex+7,ey+3,4,4)}
    else if(e.tp==='snowBeast'){ctx.fillStyle='#eee';ctx.fillRect(ex,ey,30,28);ctx.fillStyle='#ddd';ctx.fillRect(ex+3,ey+3,24,22);ctx.fillStyle='#fff';ctx.fillRect(ex+5,ey+5,20,18);ctx.fillStyle='#8cf';ctx.fillRect(ex+2,ey+2,6,6);ctx.fillRect(ex+22,ey+2,6,6);ctx.fillStyle='#000';ctx.fillRect(ex+4,ey+4,3,3);ctx.fillRect(ex+24,ey+4,3,3);ctx.fillStyle='#f88';ctx.fillRect(ex+10,ey+14,10,6);ctx.fillStyle='#cdf';for(let s=0;s<30;s+=7)ctx.fillRect(ex+s,ey+26,4,4)}
    else if(e.tp==='glacier'){ctx.fillStyle='#abc';ctx.fillRect(ex,ey,24,22);ctx.fillStyle='#bcd';ctx.fillRect(ex+2,ey+2,20,18);ctx.fillStyle='#cde';ctx.fillRect(ex+4,ey+4,16,14);ctx.fillStyle='#8af';ctx.fillRect(ex+6,ey+6,4,4);ctx.fillRect(ex+14,ey+6,4,4);ctx.fillStyle='#000';ctx.fillRect(ex+7,ey+7,2,2);ctx.fillRect(ex+15,ey+7,2,2);ctx.fillStyle='#eff';ctx.fillRect(ex+8,ey+12,8,4);if(e.armored){ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(ex+1,ey+1,22,20)}}
    else if(e.tp==='frozenGrape'){ctx.fillStyle=fl?'#fff':'#adf';ctx.fillRect(ex+1,ey+1,10,10);ctx.fillStyle='#cdf';ctx.fillRect(ex+2,ey+2,8,8);ctx.fillStyle='#fff';ctx.fillRect(ex+4,ey+3,2,2);ctx.fillRect(ex+7,ey+3,2,2)}
    else if(e.tp==='crystal'){ctx.fillStyle='#cdf';ctx.fillRect(ex,ey+4,16,18);ctx.fillStyle='#bef';ctx.fillRect(ex+2,ey+6,12,14);ctx.fillStyle='#fff';ctx.fillRect(ex+4,ey+8,8,10);ctx.fillStyle='#adf';ctx.fillRect(ex+1,ey,4,8);ctx.fillRect(ex+11,ey,4,8);ctx.fillStyle='#fff';ctx.fillRect(ex+6,ey+2,4,6);if(e.spike){ctx.fillStyle='#faa';ctx.fillRect(ex+6,ey-4,4,6)}}
    else if(e.tp==='fireImp'){ctx.fillStyle=fl?'#fff':'#f80';ctx.fillRect(ex+2,ey+2,10,10);ctx.fillStyle='#fd0';ctx.fillRect(ex+3,ey+1,2,2);ctx.fillRect(ex+9,ey+1,2,2);ctx.fillStyle='#ff0';ctx.fillRect(ex+4,ey+5,2,2);ctx.fillRect(ex+8,ey+5,2,2);ctx.fillStyle='#f00';ctx.fillRect(ex+3,ey+12,8,4);ctx.fillStyle='#fd0';ctx.fillRect(ex+5+Math.round(Math.sin(Date.now()*0.02)),ey-2,4,3)}
    else if(e.tp==='lavaGolem'){ctx.fillStyle=fl?'#fff':'#530';ctx.fillRect(ex+2,ey+4,26,22);ctx.fillStyle='#840';ctx.fillRect(ex,ey+6,4,18);ctx.fillRect(ex+26,ey+6,4,18);ctx.fillStyle='#f40';ctx.fillRect(ex+6,ey+10,4,2);ctx.fillRect(ex+20,ey+8,3,5);ctx.fillRect(ex+10,ey+20,8,2);ctx.fillStyle=Math.sin(Date.now()*0.02)>0?'#ff0':'#f80';ctx.fillRect(ex+12,ey+12,6,6);ctx.fillStyle='#fd0';ctx.fillRect(ex+8,ey+2,3,2);ctx.fillRect(ex+19,ey+2,3,2)}
    else if(e.tp==='flameSerpent'){const w=Math.round(Math.sin(e.anim*0.15)*2);ctx.fillStyle=fl?'#fff':'#f80';ctx.fillRect(ex+4+w,ey+2,10,4);ctx.fillRect(ex+4-w,ey+8,10,4);ctx.fillRect(ex+4+w,ey+14,10,4);ctx.fillStyle='#fd0';ctx.fillRect(ex+6+w,ey+3,6,2);ctx.fillRect(ex+6-w,ey+9,6,2);ctx.fillStyle='#f00';ctx.fillRect(ex+10+w,ey,4,3);ctx.fillStyle='#ff0';ctx.fillRect(ex+11+w,ey+1,1,1)}
    else if(e.tp==='emberWisp'){const yb=Math.round(Math.sin(e.anim*0.1)*2),sp=Math.sin(Date.now()*0.02);ctx.fillStyle=fl?'#fff':'#fe0';ctx.fillRect(ex+2,ey+4+yb,6,8);ctx.fillStyle='#ff8';ctx.fillRect(ex+3,ey+5+yb,4,4);ctx.fillStyle='#fff';ctx.fillRect(ex+4,ey+6+yb,2,2);if(sp>0){ctx.fillStyle='#ff0';ctx.fillRect(ex,ey+yb,1,1);ctx.fillRect(ex+9,ey+8+yb,1,1)}else{ctx.fillStyle='#fd0';ctx.fillRect(ex+9,ey+2+yb,1,1);ctx.fillRect(ex+1,ey+12+yb,1,1)}}
    else if(e.tp==='shadowStalker'){ctx.fillStyle=fl?'#fff':'#224';ctx.fillRect(ex+4,ey+4,8,18);ctx.fillStyle='#113';ctx.fillRect(ex+3,ey+8,2,10);ctx.fillRect(ex+11,ey+8,2,10);ctx.fillStyle='#a0f';ctx.fillRect(ex+5,ey+6,2,2);ctx.fillRect(ex+9,ey+6,2,2);ctx.fillStyle='#557';ctx.fillRect(ex+1,ey+10,3,1);ctx.fillRect(ex+12,ey+10,3,1);ctx.fillStyle='#000';ctx.fillRect(ex+5,ey+22,2,2);ctx.fillRect(ex+9,ey+22,2,2)}
    else if(e.tp==='voidBeast'){ctx.fillStyle=fl?'#fff':'#112';ctx.fillRect(ex+2,ey+4,28,24);ctx.fillStyle='#000';ctx.fillRect(ex,ey+8,4,16);ctx.fillRect(ex+28,ey+8,4,16);ctx.fillStyle=Math.sin(Date.now()*0.02)>0?'#a0f':'#608';ctx.fillRect(ex+6,ey+10,3,8);ctx.fillRect(ex+22,ey+12,4,6);ctx.fillRect(ex+14,ey+20,6,3);ctx.fillStyle='#f0f';ctx.fillRect(ex+10,ey+8,3,3);ctx.fillRect(ex+19,ey+8,3,3)}
    else if(e.tp==='wraith'){const yb=Math.round(Math.sin(e.anim*0.1)*2);ctx.fillStyle=fl?'#fff':'#448';ctx.fillRect(ex+3,ey+2+yb,12,14);ctx.fillStyle='#336';ctx.fillRect(ex+2,ey+10+yb,2,8);ctx.fillRect(ex+14,ey+10+yb,2,8);ctx.fillRect(ex+5,ey+16+yb,2,4);ctx.fillRect(ex+11,ey+16+yb,2,4);ctx.fillStyle='#cce';ctx.fillRect(ex+5,ey+5+yb,2,2);ctx.fillRect(ex+11,ey+5+yb,2,2);ctx.fillStyle='#88f';ctx.fillRect(ex+8,ey+8+yb,2,1)}
    else if(e.tp==='darkCrystal'){ctx.fillStyle=fl?'#fff':'#336';ctx.fillRect(ex+2,ey+6,12,16);ctx.fillStyle='#224';ctx.fillRect(ex,ey+10,2,10);ctx.fillRect(ex+14,ey+10,2,10);ctx.fillStyle='#447';ctx.fillRect(ex+6,ey,4,8);ctx.fillRect(ex+4,ey+4,2,4);ctx.fillRect(ex+10,ey+4,2,4);ctx.fillStyle=Math.sin(Date.now()*0.02)>0?'#a0f':'#70a';ctx.fillRect(ex+5,ey+12,6,4);ctx.fillStyle='#f0f';ctx.fillRect(ex+7,ey+13,2,2)}
    if(e.guardT>0){ctx.strokeStyle='#fd8';ctx.lineWidth=1;ctx.strokeRect(ex-3,ey-3,e.w+6,e.h+6)}
    if(e.actionT>0){ctx.fillStyle=e.action==='blinkBehind'?'rgba(160,80,255,0.35)':'rgba(255,220,120,0.18)';ctx.fillRect(ex-4,ey-4,e.w+8,3)}
    // Telegraph flash — parry window indicator
    if(e.telegraphT>0){const tp=Math.sin(Date.now()*0.15)*0.3+0.7;ctx.fillStyle=`rgba(255,255,255,${tp*0.5})`;ctx.fillRect(ex-2,ey-2,e.w+4,e.h+4)}
    // Frozen visual
    if(e.frozenT>0){ctx.fillStyle='rgba(160,220,255,0.45)';ctx.fillRect(ex-3,ey-3,e.w+6,e.h+6);ctx.fillStyle='#fff';ctx.fillRect(ex+2,ey+2,e.w-4,e.h-4)}
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════
