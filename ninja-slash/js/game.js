// ═══════════════════════════════════════════════
// GAME STATE & MAIN LOOP
// ═══════════════════════════════════════════════
let GS='intro',DT=0,iT=60,liT=0; // liT = level intro timer
let mapSel=0; // selected map node
let fallY=-80,fallT=0,fallAfter=[];
let corruption=0; // Risk of Rain style difficulty ramp
function reset(){
  for(const k in K)K[k]=false;for(const k in PV)PV[k]=false;
  resetUPG();LV=0;EN.length=0;PR.length=0;PT.length=0;JR.length=0;PU.length=0;BP.length=0;
  BS.on=false;BS.dead=false;BS.jt=[];
  camX=0;camY=0;shX=0;shY=0;shT=0;hs=0;
  P.kills=0;P.mxC=0;gameTime=0;P.atkBuff=0;P.spdBuff=0;P.shield=0;P.magnet=0;
  notiT=0;notiMsg='';P.level=1;P.xp=0;P.mount=null;P.mtT=0;P.bladeTrail=[];
  WST.p=-1;fallY=-80;fallT=0;fallAfter=[];
  loadLevel(0);
  if(typeof spawnPrisoners==='function')spawnPrisoners();
  GS='intro';DT=0;iT=35;mapSel=0;
  initPetals();
  corruption=0;timeScale=1;focus=focusMax;
}

function update(){
  if(AC&&(GS==='intro'||GS==='levelIntro'||GS==='map'||GS==='play'||GS==='boss_intro'||GS==='boss'))sBGM();
  if(GS==='play'||GS==='boss'){gameTime++;corruption+=0.018}
  // Time slow — hold T to slow time (consumes focus)
  if((K['t']||K['T'])&&focus>0&&GS==='play'){timeScale=0.35;focus-=0.6}else{timeScale=1;if(focus<focusMax)focus+=0.15}
  if(GS==='title'){
    sBGM();
    // Check any key press to start
    const anyKey=Object.values(K).some(v=>v);
    if(anyKey){reset();GS='intro';iT=40;for(const k in K)K[k]=false;return}
    if(jp('m')||jp('M')){GS='meta';metaSel=0;for(const k in K)K[k]=false}
    return;
  }
  if(GS==='meta'){upMetaShop();return}
  if(hs>0){hs--;return}
  // Hitstop: freeze gameplay frames on impact for better feel
  if(hitStopT>0&&(GS==='play'||GS==='boss')){hitStopT--;upPT();upPR();upPU();upC();if(shT>0){shX=(Math.random()-0.5)*shT;shY=(Math.random()-0.5)*shT;shT*=0.82;if(shT<0.2)shT=0}else{shX=0;shY=0}return}
  if(GS==='intro'){fallT++;
    if(fallT%3===0)fallAfter.push({y:fallY,l:15});
    for(let i=fallAfter.length-1;i>=0;i--){fallAfter[i].l--;if(fallAfter[i].l<=0)fallAfter.splice(i,1)}
    if(fallY<FLOOR-P.h-2){fallY+=Math.min(12,G+(fallT*0.3));}
    else{fallY=FLOOR-P.h;if(fallT===Math.ceil(25+(FLOOR-P.h+80)/4)){shake(10);ps(P.x+P.w/2,FLOOR,30,'#ccc',4,20);sfx('land')}
    if(fallT>55){GS='levelIntro';liT=30;fallY=-80;fallT=0;fallAfter=[];return}}return}
  if(GS==='levelIntro'){liT--;if(liT<=0)GS='play';upC();return}
  if(GS==='map'){upPetals();
    if(jp('ArrowLeft')||jp('a')||jp('A')){mapSel=Math.max(0,mapSel-1);while(mapSel>0&&!MAP_NODES[mapSel].unlocked)mapSel--}
    if(jp('ArrowRight')||jp('d')||jp('D')){mapSel=Math.min(MAP_NODES.length-1,mapSel+1);while(mapSel<MAP_NODES.length-1&&!MAP_NODES[mapSel].unlocked)mapSel++}
    if(jp(' ')||jp('Enter')||jp('w')||jp('W')){
      if(MAP_NODES[mapSel].unlocked){
        loadLevel(mapSel);GS='intro';fallY=-80;fallT=0;fallAfter=[];P.x=100;P.y=FLOOR-P.h;
      }}
    if(jp('r')||jp('R')){GS='title';initTitle()}
    return}
  if(GS==='die'){xBGM();DT--;upPR();upPT();upPU();JR.length=0;
    // Award souls on death for meta-progression
    if(DT===70){const soulsGained=P.kills*2+P.mxC*3+P.level*10;META.souls+=soulsGained;saveMeta();notiT=90;notiMsg='获得 '+soulsGained+' 灵魂 | 总计: '+META.souls}
    if(DT<=0&&jp('r'))reset();return}
  if(GS==='upgrade'){
    if(upgCooldown>0)upgCooldown--;
    if(!upgradeInputArmed&&!upgradeSelectHeld())upgradeInputArmed=true;
    if(upgCooldown<=0&&upgradeInputArmed){
      const idx=upgradeSelectIndex();
      if(idx>=0&&upgradeChoices[idx]){applyUpgrade(upgradeChoices[idx].id);GS='play'}
    }
    return
  }
  if(GS==='ending'){xBGM();upPT();upPR();upPU();upEnding();if(WST.p===0&&WST.t%3===0)shake(3);return}
  if(GS==='boss_intro'){BS.introT--;upC();for(const pf of BP){if(pf.settling)pf.y=lerp(pf.y,pf.settleY,0.06)}if(BS.introT<=0)GS='boss';if(shT>0){shX=(Math.random()-0.5)*shT;shY=(Math.random()-0.5)*shT;shT*=0.82;if(shT<0.2)shT=0}else{shX=0;shY=0}return}
  upP();upEnv();upE();upBS();upPR();upPT();upPU();upPetals();ckL();upC();upPrisoners();
  // Notification timer
  if(notiT>0)notiT--;
  // Remove expired jump rings
  for(let i=JR.length-1;i>=0;i--){JR[i].l--;JR[i].r+=2;if(JR[i].l<=0)JR.splice(i,1)}
  if(shT>0){shX=(Math.random()-0.5)*shT;shY=(Math.random()-0.5)*shT;shT*=0.82;if(shT<0.2)shT=0}else{shX=0;shY=0}
  // Boss defeat: check mission, then branch to next level or ending
  if(BS.dead&&BS.dieT<=0&&GS==='boss'){
    // Check no-hit mission
    if(!MISSION.done&&MISSION.t==='noHitBoss'&&noHitBoss){MISSION.p=1;completeMission()}
    loadNextLevel();
  }
  if(P.hp<=0&&(GS==='play'||GS==='boss')){GS='die';DT=75;if(BS.on)BS.on=false}
}

function upPR(){for(let i=PR.length-1;i>=0;i--){const p=PR[i];p.x+=p.vx;p.y+=p.vy;if(p.vy<8)p.vy+=0.08;p.lf--;if(p.lf<=0||p.x<-50||p.x>LW+50||p.y>H+50||p.y<-50){PR.splice(i,1);continue}if(p.en){if(hitR(p.x,p.y,p.w,p.h,P.x,P.y,P.w,P.h)){hurt(p.d,P.x);PR.splice(i,1)}}else{let hit=false;for(const e of EN){if(e.dead||e.spT>0)continue;if(hitR(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h)){dmgE(e,p.d);hit=true;if(!p.pierce||p.pierce<=0)break;else p.pierce--}}if(!hit&&BS.on&&!BS.dead){for(const j of BS.jt){if(j.dead||j.armor)continue;if(hitR(p.x,p.y,p.w,p.h,j.x,j.y,j.w,j.h)){dmgJ(j,p.d);hit=true;if(!p.pierce||p.pierce<=0)break;else p.pierce--}}}if(hit&&(!p.pierce||p.pierce<=0)){ps(p.x,p.y,3,'#fff',1,6);PR.splice(i,1)}}}if(PR.length>200)PR.splice(0,PR.length-200)}
function upPT(){for(let i=PT.length-1;i>=0;i--){const p=PT[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.12;p.l--;if(p.l<=0)PT.splice(i,1)}if(PT.length>300)PT.splice(0,PT.length-300)}
function upPU(){for(let i=PU.length-1;i>=0;i--){const u=PU[i];u.life--;if(u.life<=0){PU.splice(i,1);continue}u.x+=u.vx;u.vy+=G;u.y+=u.vy;const gnd=getGround(u.x,u.h,u.y+u.h);if(u.y+u.h>=gnd&&u.vy>=0){u.y=gnd-u.h;u.vy=0;u.vx*=0.8}else{u.ground=false}if(u.y>H+50)PU.splice(i,1)}}

function render(){
  ctx.save();ctx.translate(Math.round(shX),Math.round(shY));
  if(GS==='title'){drawTitle();ctx.restore();return}
  if(GS==='meta'){drawMetaShop();ctx.restore();return}
  if(GS==='upgrade'){drawUpgrade();ctx.restore();return}
  if(GS==='map'){drawMap();ctx.restore();return}
  if(GS==='ending'){renderEnding();ctx.restore();return}
  if(GS==='intro'){
    dBg();drawTerrain();
    for(let i=0;i<fallAfter.length;i++){
      const a=fallAfter[i],alpha=(a.l/15)*0.25;
      ctx.globalAlpha=alpha;
      const py=a.y+camY;
      dNB(Math.round(P.x-camX),Math.round(py),P.dir,fallT+i*3,true);
    }
    ctx.globalAlpha=1;
    dNB(Math.round(P.x-camX),Math.round(fallY+camY),P.dir,fallT,false);
    const fi=Math.min(1,fallT/25);
    ctx.fillStyle='rgba(0,0,0,'+((1-fi)*0.7)+')';ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';
    if(fallT>30){
      const l=curLvl();
      ctx.fillStyle='#fff';ctx.font='bold 16px monospace';ctx.fillText(l.n,W/2,H/2-10);
      ctx.fillStyle='#f84';ctx.font='10px monospace';ctx.fillText('任务: '+l.ms.d,W/2,H/2+10);
    }
    ctx.textAlign='start';
    ctx.restore();return}
  dBg();drawTerrain();drawBoulders();drawEnv();dE();dBS();dP();dPR();dPT();dJR();drawPU();drawPrisoners();dHUD();
  // Cherry blossom petals (during gameplay)
  if(GS==='play'||GS==='boss'){
    for(const p of PETALS){
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.r);
      ctx.globalAlpha=p.o*0.7;
      ctx.fillStyle='#f9c';ctx.fillRect(-p.s,-p.s/2,p.s*2,p.s);
      ctx.fillStyle='#fad';ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);
      ctx.restore();
    }
    ctx.globalAlpha=1;
    for(let i=0;i<18;i++){const x=((i*97+Date.now()*0.018)-(camX*0.04))%(W+40)-20,y=30+((i*53)%190);ctx.fillStyle=i%3===0?'rgba(255,230,150,0.24)':'rgba(255,160,190,0.18)';ctx.fillRect(x,y,2+(i%3),2+(i%2))}
  }
  // Japanese woodblock-style border
  if(GS==='play'||GS==='boss'){
    const bw=10;
    ctx.fillStyle='rgba(20,10,24,0.9)';ctx.fillRect(0,0,W,bw);ctx.fillRect(0,H-bw,W,bw);
    ctx.fillStyle='rgba(210,58,62,0.44)';ctx.fillRect(0,bw-3,W,2);ctx.fillRect(0,H-bw+1,W,2);
    ctx.fillStyle='rgba(245,190,90,0.55)';ctx.fillRect(0,bw-1,W,1);ctx.fillRect(0,H-bw,W,1);
    for(let x=8;x<W;x+=28){ctx.fillStyle='rgba(245,190,90,0.28)';ctx.fillRect(x,2,12,3);ctx.fillRect(x,H-5,12,3);ctx.fillStyle='rgba(200,80,90,0.22)';ctx.fillRect(x+4,5,4,3);ctx.fillRect(x+4,H-8,4,3)}
    ctx.fillStyle='rgba(20,10,24,0.45)';ctx.fillRect(0,0,6,H);ctx.fillRect(W-6,0,6,H);
    ctx.fillStyle='rgba(245,190,90,0.35)';ctx.fillRect(6,0,1,H);ctx.fillRect(W-7,0,1,H);
  }
  // Notification overlay
  if(notiT>0){ctx.textAlign='center';const na=Math.min(1,notiT/20,notiT/60);ctx.fillStyle=`rgba(0,0,0,${na*0.7})`;ctx.fillRect(W/2-160,4,320,28);ctx.fillStyle=`rgba(255,210,0,${na})`;ctx.font='bold 10px monospace';ctx.fillText(notiMsg,W/2,22);ctx.textAlign='start'}
  if(GS==='levelIntro'){const la=Math.min(1,liT/30,liT/60);ctx.fillStyle=`rgba(0,0,0,${la*0.92})`;ctx.fillRect(0,0,W,H);ctx.textAlign='center';const l=curLvl();ctx.fillStyle=LV===0?'#f84':LV===1?'#8cf':LV===2?'#f80':'#a8f';ctx.font='bold 18px monospace';ctx.fillText(l.n,W/2,H/2-24);ctx.fillStyle='#fff';ctx.font='11px monospace';ctx.fillText(l.st,W/2,H/2+2);ctx.fillStyle='#888';ctx.font='9px monospace';ctx.fillText('任务: '+l.ms.d,W/2,H/2+22);ctx.textAlign='start'}
  if(GS==='boss_intro'){const a=0.3+Math.sin(Date.now()*0.01)*0.1;ctx.fillStyle=`rgba(0,0,0,${a})`;ctx.fillRect(0,0,W,H);ctx.textAlign='center';const bNames=['果实巨像','冰霜巨像','熔岩巨像','暗影巨像'],bColors=['#f84','#8cf','#f80','#a8f'];ctx.fillStyle=bColors[LV]||'#f84';ctx.font='bold 14px monospace';ctx.fillText(bNames[LV]||'未知巨像',W/2,H/2);ctx.textAlign='start'}
  // Damage flash — red vignette when player is hurt
  if(damageFlashT>0){const fa=damageFlashT/12;ctx.fillStyle=`rgba(255,20,20,${fa*0.35})`;ctx.fillRect(0,0,W,18);ctx.fillRect(0,H-18,W,18);ctx.fillRect(0,0,14,H);ctx.fillRect(W-14,0,14,H);ctx.fillStyle=`rgba(255,40,40,${fa*0.15})`;ctx.fillRect(0,0,W,H)}
  // Time slow visual effect — blue overlay
  if(timeScale<1){ctx.fillStyle=`rgba(80,120,255,${0.08+(1-timeScale)*0.12})`;ctx.fillRect(0,0,W,H)}
  ctx.restore()
}

function loop(){
  try{update();render()}catch(e){
    ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#f00';ctx.font='12px monospace';
    const lines=(e.stack||String(e)).split('\n');
    for(let i=0;i<lines.length&&i<25;i++)ctx.fillText(lines[i],10,20+i*14);
    return}
  requestAnimationFrame(loop)
}
initTitle();GS='title';requestAnimationFrame(loop);
