// BOSS — shorter, all joints reachable
// ═══════════════════════════════════════════════
const BS={on:false,dead:false,dieT:0,x:0,y:0,jt:[],atkT:0,phase:0,introT:0,telegraph:0,dC:0};
function isCoreJoint(j){return j&&j.id==='core'}
function defeatBoss(){
  if(BS.dead)return;
  BS.dead=true;BS.dieT=110;shake(30);hs=10;sfx('bossDie');
}
const BOSS_DATA=[
  { // Level 1: 果实巨像 — 大体型近战型
    jt:[
      {name:'右踝', rx:270,ry:150,w:32,h:18,hp:5,mhp:5,dead:false,armor:false,hurtT:0},
      {name:'左膝', rx:30, ry:120,w:28,h:22,hp:5,mhp:5,dead:false,armor:false,hurtT:0},
      {name:'右腕', rx:320,ry:55, w:24,h:18,hp:5,mhp:5,dead:false,armor:false,hurtT:0},
      {name:'左肩', rx:15,ry:30, w:26,h:20,hp:5,mhp:5,dead:false,armor:false,hurtT:0},
      {name:'头部', rx:120,ry:25, w:32,h:30,hp:6,mhp:6,dead:false,armor:false,hurtT:0},
      {id:'core',name:'核心', rx:100,ry:70, w:42,h:36,hp:8,mhp:8,dead:false,armor:true,hurtT:0},
    ],atkT:[90,65,80],
    bodyC:'#3a2810',bodyC2:'#4a3418',bodyC3:'#2a1a08',jointC:'#fa0',jointC2:'#fc4',eyeC:'#f50',
    w:350,h:200, // body dimensions
  },
  { // Level 2: 冰霜巨像 — 瘦高远程型
    jt:[
      {name:'左踝', rx:80,ry:180,w:24,h:16,hp:6,mhp:6,dead:false,armor:false,hurtT:0},
      {name:'右膝', rx:280,ry:140,w:26,h:20,hp:6,mhp:6,dead:false,armor:false,hurtT:0},
      {name:'左腕', rx:20,ry:70, w:22,h:16,hp:6,mhp:6,dead:false,armor:false,hurtT:0},
      {name:'右肩', rx:310,ry:45, w:26,h:20,hp:6,mhp:6,dead:false,armor:false,hurtT:0},
      {name:'头部', rx:140,ry:5,  w:34,h:32,hp:7,mhp:7,dead:false,armor:false,hurtT:0},
      {id:'core',name:'核心', rx:110,ry:85, w:40,h:34,hp:10,mhp:10,dead:false,armor:true,hurtT:0},
    ],atkT:[70,50,65],
    bodyC:'#1a2a3a',bodyC2:'#2a3a4a',bodyC3:'#0a1a2a',jointC:'#8cf',jointC2:'#aef',eyeC:'#0ff',
    w:330,h:210,
  },
  { // Level 3: 熔岩巨像
    jt:[
      {name:'右踝', rx:260,ry:160,w:34,h:20,hp:6,mhp:6,dead:false,armor:false,hurtT:0},
      {name:'左腕', rx:20,ry:65,w:28,h:20,hp:6,mhp:6,dead:false,armor:false,hurtT:0},
      {name:'右肩', rx:310,ry:40,w:28,h:22,hp:6,mhp:6,dead:false,armor:false,hurtT:0},
      {name:'左膝', rx:60,ry:135,w:30,h:24,hp:6,mhp:6,dead:false,armor:false,hurtT:0},
      {name:'头部', rx:150,ry:15,w:34,h:32,hp:8,mhp:8,dead:false,armor:false,hurtT:0},
      {id:'core',name:'核心', rx:120,ry:80,w:44,h:38,hp:12,mhp:12,dead:false,armor:true,hurtT:0},
    ],atkT:[65,50,55],
    bodyC:'#3a1008',bodyC2:'#4a1808',bodyC3:'#2a0800',jointC:'#f60',jointC2:'#f80',eyeC:'#f20',
    w:340,h:210,
  },
  { // Level 4: 暗影巨像
    jt:[
      {name:'左踝', rx:60,ry:170,w:26,h:18,hp:7,mhp:7,dead:false,armor:false,hurtT:0},
      {name:'右腕', rx:320,ry:50,w:26,h:20,hp:7,mhp:7,dead:false,armor:false,hurtT:0},
      {name:'左肩', rx:15,ry:35,w:28,h:22,hp:7,mhp:7,dead:false,armor:false,hurtT:0},
      {name:'右膝', rx:290,ry:140,w:30,h:22,hp:7,mhp:7,dead:false,armor:false,hurtT:0},
      {name:'头部', rx:140,ry:-5,w:36,h:34,hp:9,mhp:9,dead:false,armor:false,hurtT:0},
      {id:'core',name:'核心', rx:110,ry:75,w:42,h:36,hp:14,mhp:14,dead:false,armor:true,hurtT:0},
    ],atkT:[60,45,55],
    bodyC:'#0a0a1a',bodyC2:'#151528',bodyC3:'#050510',jointC:'#66c',jointC2:'#88e',eyeC:'#c0f',
    w:350,h:200,
  },
];
function initB(){
  const bd=BOSS_DATA[LV]||BOSS_DATA[0];
  const bw=bd.w||350,bh=bd.h||200;
  const bx=Math.min(LW-bw-80,BTX+260),by=FLOOR-bh;
  const jtCopy=bd.jt.map(j=>({...j,dead:false,hurtT:0}));
  Object.assign(BS,{on:true,dead:false,dieT:0,x:bx,y:by,atkT:bd.atkT[0],phase:0,introT:70,telegraph:0,dC:0,jt:jtCopy,bd,bw,bh});
  initBP();sfx('bossIntro')
}

function upBS(){
  if(!BS.on)return;
  if(BS.dead){BS.dieT--;return}
  for(const j of BS.jt){j.x=BS.x+j.rx;j.y=BS.y+j.ry;if(j.hurtT>0)j.hurtT--}
  const core=BS.jt.find(isCoreJoint);
  if(core&&!core.dead)core.armor=BS.jt.filter(j=>!isCoreJoint(j)&&j.dead).length<4;
  // Settle boss platforms
  for(const pf of BP){if(pf.settling){pf.y=lerp(pf.y,pf.settleY,0.06);if(Math.abs(pf.y-pf.settleY)<1){pf.y=pf.settleY;pf.settling=false}}}
  if(BS.introT>0){BS.introT--;return}
  if(BS.telegraph>0)BS.telegraph--;
  BS.atkT--;
  const bd=BS.bd;
  if(BS.atkT<=0){BS.phase=(BS.phase+1)%3;BS.telegraph=30;BS.atkT=bd.atkT[BS.phase]}
  if(BS.telegraph===1){
    const coreAlive=!BS.jt.find(isCoreJoint).dead;
    const deadJoints=BS.jt.filter(j=>!isCoreJoint(j)&&j.dead).length;
    const enraged=deadJoints>=2||!coreAlive;
    if(LV===0){
      // Level 1: fruit-themed attacks
      if(BS.phase===0){
        const sy=BS.y+85;for(let i=0;i<45;i++)sp(BS.x-60+i*6,sy,0,0,1,'#f64',16,14,50,true);shake(10);sfx('heavy');
        // Enraged: fruit storm from above
        if(enraged){for(let i=0;i<12;i++){sp(BS.x+30+Math.random()*280,BS.y-40,0,3+Math.random()*3,1,'#f64',10,10,70,true)}shake(6);notiT=38;notiMsg='果实风暴!'}
      }
      else if(BS.phase===1){for(let i=0;i<14;i++){const a=-Math.PI*0.4+(Math.PI*0.8*i/13);sp(BS.x+140,BS.y+55,Math.cos(a)*4,Math.sin(a)*4,1,'#8f4',6,5,95,true)}shake(5);
        if(enraged){for(let i=0;i<6;i++){sp(BS.x+50+Math.random()*200,FLOOR-20,(Math.random()-0.5)*6,-4-Math.random()*3,1,'#8f4',8,6,60,true)}shake(4)}
      }
      else{shake(20);sfx('heavy');ps(BS.x+150,FLOOR,35,'#543',6,32);if(Math.abs(P.x-(BS.x+150))<130&&P.ground)hurt(2,BS.x);
        if(enraged){ps(BS.x+80,FLOOR,20,'#543',5,24);ps(BS.x+220,FLOOR,20,'#543',5,24);if(Math.abs(P.x-(BS.x+80))<80&&P.ground)hurt(1,BS.x);if(Math.abs(P.x-(BS.x+220))<80&&P.ground)hurt(1,BS.x);shake(8)}
      }
    }else if(LV===1){
      // Level 2: ice-themed attacks
      if(BS.phase===0){for(let i=0;i<8;i++){sp(BS.x+80+i*28,FLOOR-60,0,4,1,'#8cf',14,12,80,true);sp(BS.x+80+i*28,FLOOR-60,0,8,1,'#8cf',14,12,80,true)}shake(8);sfx('heavy');
        if(enraged){for(let i=0;i<5;i++){sp(BS.x+60+Math.random()*200,BS.y-30,0,5+Math.random()*4,1,'#0ff',10,10,75,true)}shake(6);notiT=36;notiMsg='冰锥齐射!'}
      }
      else if(BS.phase===1){for(let i=0;i<20;i++){const a=-Math.PI*0.5+(Math.PI*i/19);sp(BS.x+140,BS.y+55,Math.cos(a)*5,Math.sin(a)*3.5,1,'#0ff',5,5,100,true)}shake(6);sfx('bossHit');
        if(enraged){for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2;sp(BS.x+140,BS.y+55,Math.cos(a)*6,Math.sin(a)*6,1,'#0ff',5,5,80,true)}shake(8)}
      }
      else{shake(25);sfx('heavy');ps(BS.x+150,FLOOR,45,'#cdf',7,36);for(let i=0;i<12;i++){sp(BS.x+80+i*18,FLOOR+10,0,-3-Math.random()*4,1,'#bef',10,8,45,true)}if(Math.abs(P.x-(BS.x+150))<140&&P.ground)hurt(3,BS.x);
        if(enraged){ps(BS.x+150,FLOOR-60,30,'#cdf',6,28);for(let i=0;i<8;i++){sp(BS.x+80+i*18,FLOOR-50,0,-2-Math.random()*3,1,'#bef',8,8,55,true)}shake(10)}
      }
    }else if(LV===2){
      // Level 3: fire-themed attacks
      if(BS.phase===0){for(let i=0;i<50;i++)sp(BS.x-50+i*5,BS.y+120+(Math.random()*80),0,0,1,'#f60',12,10,40+Math.random()*20,true);shake(12);sfx('heavy');
        if(enraged){for(let i=0;i<3;i++){sp(BS.x+50+Math.random()*200,FLOOR-10,0,-8-Math.random()*4,2,'#f80',18,22,70,true)}shake(10);notiT=36;notiMsg='岩浆喷发!'}
      }
      else if(BS.phase===1){for(let i=0;i<16;i++){const a=-Math.PI*0.45+(Math.PI*0.9*i/15);sp(BS.x+140,BS.y+60,Math.cos(a)*5,Math.sin(a)*4.5,1,'#f80',6,5,100,true)}shake(8);sfx('bossHit');
        if(enraged){for(let i=0;i<20;i++){const a=Math.random()*Math.PI*2;sp(BS.x+140,BS.y+60,Math.cos(a)*4,Math.sin(a)*4,1,'#f80',6,5,90,true)}shake(10)}
      }
      else{shake(22);sfx('heavy');ps(BS.x+150,FLOOR,40,'#f40',7,35);for(let i=0;i<6;i++)sp(BS.x+100+i*40,FLOOR-30,-2+i,6+Math.random()*4,2,'#f80',14,10,50,true);if(Math.abs(P.x-(BS.x+150))<140&&P.ground)hurt(3,BS.x);
        if(enraged){ps(BS.x+100,FLOOR,25,'#f40',6,28);ps(BS.x+200,FLOOR,25,'#f40',6,28);for(let i=0;i<6;i++){sp(BS.x+80+i*40,FLOOR+5,0,-5-Math.random()*4,2,'#f80',12,10,50,true)}shake(12)}
      }
    }else{
      // Level 4: shadow-themed attacks
      if(BS.phase===0){for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2;sp(BS.x+150+Math.cos(a)*50,BS.y+80+Math.sin(a)*30,Math.cos(a)*3,Math.sin(a)*3,1,'#66c',8,6,120,true)}shake(8);sfx('bossHit');
        if(enraged){for(let i=0;i<4;i++){const sx=BS.x+50+Math.random()*200;sp(sx,BS.y+20,Math.sign(P.x-sx)*3,1,1,'#66c',10,10,100,true)}shake(6);notiT=36;notiMsg='暗影追踪!'}
      }
      else if(BS.phase===1){for(let i=0;i<25;i++)sp(BS.x+40+i*10,BS.y+Math.random()*150,3-Math.random()*6,0,1,'#c0f',8,6,80,true);shake(10);sfx('heavy');
        if(enraged){for(let i=0;i<8;i++){sp(BS.x+40+i*30,BS.y+Math.random()*100,Math.sign(P.x-(BS.x+140))*4,0,1,'#c0f',8,6,90,true)}shake(8)}
      }
      else{shake(30);sfx('heavy');ps(BS.x+150,FLOOR,50,'#c0f',8,40);for(let i=0;i<8;i++)sp(BS.x+40+i*35,FLOOR+5,0,-4-Math.random()*5,1,'#88e',12,8,55,true);if(Math.abs(P.x-(BS.x+150))<150)hurt(3,BS.x);
        if(enraged){ps(BS.x+100,FLOOR,30,'#c0f',7,32);ps(BS.x+200,FLOOR,30,'#c0f',7,32);if(Math.abs(P.x-(BS.x+100))<80)hurt(2,BS.x);if(Math.abs(P.x-(BS.x+200))<80)hurt(2,BS.x);shake(14)}
      }
    }
  }
}

function dmgJ(j,m){if(j.dead)return;const d=Math.ceil(m);j.hp-=d;j.hurtT=5;ps(j.x+j.w/2,j.y+j.h/2,d*6,'#fd0',4,14);P.combo++;P.cT=55;if(P.combo>P.mxC)P.mxC=P.combo;hs=Math.max(hs,3);
  // Hitstop based on damage / joint destruction
  if(isCoreJoint(j)){triggerHitstop(d>=4?5:4)}
  else if(j.hp<=0){triggerHitstop(5)}
  else{triggerHitstop(d>=3?3:2)}
  if(j.hp<=0){j.dead=true;BS.dC++;ps(j.x+j.w/2,j.y+j.h/2,35,'#f64',7,30);ps(j.x+j.w/2,j.y+j.h/2,22,'#fd0',5,24);shake(16);if(isCoreJoint(j)||BS.jt.every(k=>k.dead)){defeatBoss()}else sfx('bossHit')}else sfx('bossHit')}

function dBossIdentity(dx,dy,bw,bh,bd){
  const t=Date.now()*0.01;
  if(LV===0){
    ctx.fillStyle='#284018';ctx.fillRect(dx+18,dy+4,bw-36,10);
    ctx.fillStyle='#3a5a20';for(let x=38;x<bw-30;x+=42){ctx.fillRect(dx+x,dy-4,22,14);ctx.fillRect(dx+x+5,dy-10,12,8)}
    ctx.fillStyle='#e33';for(let x=70;x<bw-60;x+=78){ctx.fillRect(dx+x,dy+2,12,12);ctx.fillStyle='#fa4';ctx.fillRect(dx+x+3,dy+5,6,6);ctx.fillStyle='#e33'}
    ctx.fillStyle='#2d4a18';for(let y=52;y<bh-15;y+=24){ctx.fillRect(dx+5+Math.sin(t+y)*3,dy+y,8,18);ctx.fillRect(dx+bw-13+Math.cos(t+y)*3,dy+y,8,18)}
  }else if(LV===1){
    ctx.fillStyle='#dff';for(let x=30;x<bw-20;x+=38){const h=18+(x%3)*6;ctx.fillRect(dx+x,dy-h+8,12,h);ctx.fillStyle='#8cf';ctx.fillRect(dx+x+3,dy-h+12,6,h-8);ctx.fillStyle='#dff'}
    ctx.fillStyle='#bdf';ctx.fillRect(dx+bw/2-58,dy-32,16,30);ctx.fillRect(dx+bw/2+28,dy-34,16,32);
    ctx.fillStyle='rgba(170,230,255,0.35)';ctx.fillRect(dx+35,dy+62,bw-70,10);ctx.fillRect(dx+55,dy+128,bw-110,8);
    ctx.fillStyle='#eff';for(let x=70;x<bw-70;x+=50)ctx.fillRect(dx+x,dy+bh+10,8,18);
  }else if(LV===2){
    ctx.fillStyle='#2a0800';ctx.fillRect(dx+42,dy-18,22,34);ctx.fillRect(dx+bw-64,dy-22,22,38);
    ctx.fillStyle='#f60';ctx.fillRect(dx+47,dy-26-Math.sin(t)*4,12,14);ctx.fillRect(dx+bw-59,dy-30-Math.cos(t)*4,12,16);
    ctx.fillStyle='#f80';for(let x=75;x<bw-65;x+=54){ctx.fillRect(dx+x,dy+44,5,70);ctx.fillStyle='#fd0';ctx.fillRect(dx+x+2,dy+52,2,26);ctx.fillStyle='#f80'}
    ctx.fillStyle='#420';ctx.fillRect(dx+8,dy+bh-58,26,34);ctx.fillRect(dx+bw-34,dy+bh-58,26,34);
  }else{
    ctx.globalAlpha=0.55;ctx.fillStyle='#080818';ctx.fillRect(dx-54,dy+48,48,92);ctx.fillRect(dx+bw+6,dy+42,50,98);
    ctx.fillStyle='#181838';ctx.fillRect(dx-42,dy+66,34,38);ctx.fillRect(dx+bw+8,dy+62,36,42);ctx.globalAlpha=1;
    ctx.fillStyle='#70a';ctx.fillRect(dx+bw/2-52,dy-26,14,36);ctx.fillRect(dx+bw/2+26,dy-28,14,38);
    ctx.fillStyle='rgba(170,0,255,0.45)';ctx.fillRect(dx+82,dy+42,bw-164,8);ctx.fillRect(dx+104,dy+88,bw-208,8);
    ctx.fillStyle='#305';for(let x=34;x<bw-20;x+=62){ctx.fillRect(dx+x+Math.sin(t+x)*4,dy+bh-18,8,36)}
  }
}

// ── BOSS SPRITE ────────────────────────────────
function dBS(){
  if(!BS.on)return;const bx=BS.x-camX,by=BS.y+camY;
  if(BS.introT>0&&Math.floor(BS.introT/4)%2===0)return;
  const ds=BS.dead?Math.random()*8:0,dx=bx+ds,dy=by+ds;
  const bd=BS.bd||BOSS_DATA[0];
  const bw=BS.bw||350,bh=BS.bh||200;
  const bc=bd.bodyC,bc2=bd.bodyC2,bc3=bd.bodyC3;
  ctx.fillStyle='rgba(0,0,0,0.42)';ctx.fillRect(dx+3,dy+8,bw-6,bh+28);
  ctx.fillStyle='rgba(255,220,120,0.08)';ctx.fillRect(dx+22,dy+20,bw-44,bh-12);
  // Body
  ctx.fillStyle=bc;ctx.fillRect(dx+15,dy+15,bw-30,bh-15);
  ctx.fillStyle=bc2;ctx.fillRect(dx+25,dy+25,bw-50,bh-35);
  ctx.fillStyle=bc;for(let y=dy+35;y<dy+bh-20;y+=18)ctx.fillRect(dx+40,y,bw-80,4);
  ctx.fillStyle='rgba(255,255,255,0.08)';for(let x=dx+44;x<dx+bw-44;x+=34)ctx.fillRect(x,dy+36,5,bh-58);
  // Shoulders
  ctx.fillStyle=bc3;ctx.fillRect(dx+5,dy+10,bw-10,28);
  // Arms
  ctx.fillStyle=bc2;ctx.fillRect(dx-12,dy+38,38,bh-120);ctx.fillRect(dx+bw-26,dy+38,38,bh-120);
  ctx.fillStyle=bc3;ctx.fillRect(dx-18,dy+bh-85,28,22);ctx.fillRect(dx+bw-10,dy+bh-85,28,22);
  // Legs
  ctx.fillStyle=bc;ctx.fillRect(dx+50,dy+bh-5,46,28);ctx.fillRect(dx+bw-96,dy+bh-5,46,28);
  ctx.fillStyle=bc3;ctx.fillRect(dx+48,dy+bh+18,55,14);ctx.fillRect(dx+bw-98,dy+bh+18,55,14);
  // Head
  ctx.fillStyle=bc2;ctx.fillRect(dx+bw/2-46,dy-10,42,44);
  ctx.fillStyle=bc;ctx.fillRect(dx+bw/2-41,dy-14,32,8);
  const ef=BS.telegraph>0&&Math.floor(BS.telegraph/4)%2===0;
  ctx.fillStyle=ef?'#fff':BS.dead?'#f00':bd.eyeC;ctx.fillRect(dx+bw/2-39,dy+2,9,9);ctx.fillRect(dx+bw/2-19,dy+2,9,9);
  ctx.fillStyle='#200';ctx.fillRect(dx+bw/2-37,dy+18,24,10);ctx.fillStyle='#f44';ctx.fillRect(dx+bw/2-33,dy+19,4,4);ctx.fillRect(dx+bw/2-21,dy+19,4,4);
  ctx.fillStyle='#1a1a1a';ctx.fillRect(dx+bw/2-48,dy-20,8,12);ctx.fillRect(dx+bw/2-8,dy-20,8,12);
  dBossIdentity(dx,dy,bw,bh,bd);
  // Chest armor
  ctx.fillStyle=bc3;ctx.fillRect(dx+90,dy+50,bw-180,48);
  ctx.strokeStyle=['#5a4422','#7ac','#f60','#70a'][LV]||'#3a5a6a';ctx.lineWidth=2;ctx.strokeRect(dx+94,dy+54,bw-188,40);
  for(let r=0;r<2;r++)for(let c=0;c<5;c++)ctx.fillRect(dx+100+c*30,dy+56+r*22,3,3);
  ctx.fillStyle=bd.jointC2;ctx.fillRect(dx+bw/2-16,dy+62,32,20);ctx.fillStyle=bd.eyeC;ctx.fillRect(dx+bw/2-8,dy+67,16,10);
  // Joints
  const jc=bd.jointC,jc2=bd.jointC2;
  for(const j of BS.jt){
    const jx=j.x-camX,jy=j.y+camY;if(j.dead){ctx.fillStyle='#333';ctx.fillRect(jx+Math.random()*3,jy+Math.random()*3,j.w*0.5,j.h*0.5);continue}
    const fl=j.hurtT>0&&j.hurtT%2===0;
    if(j.armor){ctx.fillStyle=fl?'#fff':'#888';ctx.fillRect(jx,jy,j.w,j.h);ctx.fillStyle='#555';ctx.fillRect(jx+3,jy+3,j.w-6,j.h-6);ctx.fillStyle=LV===0?'#c33':'#3cc';ctx.fillRect(jx+j.w/2-3,jy+j.h/2-5,6,10);ctx.fillStyle=LV===0?'#f44':'#4ff';ctx.fillRect(jx+j.w/2-1,jy+j.h/2-3,2,4)}
    else{ctx.fillStyle=fl?'#fff':jc;ctx.fillRect(jx,jy,j.w,j.h);ctx.fillStyle=jc2;ctx.fillRect(jx+3,jy+3,j.w-6,j.h-6);for(let d=0;d<j.hp;d++)ctx.fillRect(jx+3+d*6,jy-6,4,4)}
  }
}

// ═══════════════════════════════════════════════
