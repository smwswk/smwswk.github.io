// ═══════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════
function dBg(){
  const l=curLvl();const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,l.sky[0]);g.addColorStop(0.4,l.sky[1]);g.addColorStop(1,l.sky[2]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const sunX=W-80-(camX*0.025%80),sunY=44+Math.sin(Date.now()*0.0006)*5;
  ctx.fillStyle=LV===1?'rgba(210,245,255,0.55)':'rgba(255,200,120,0.5)';
  ctx.fillRect(sunX-18,sunY-18,36,36);ctx.fillRect(sunX-25,sunY-8,50,16);ctx.fillRect(sunX-8,sunY-25,16,50);
  ctx.fillStyle='rgba(255,240,190,0.16)';
  for(let r=0;r<8;r++){const a=r*Math.PI/4;ctx.fillRect(sunX+Math.cos(a)*36-4,sunY+Math.sin(a)*36-4,8,8)}
  for(let i=0;i<40;i++){const sx=((i*117+37)%W)-(camX*0.02%W),sy=((i*89+23)%210),b=0.25+((i*73)%80)/200;ctx.fillStyle=`rgba(255,255,255,${b})`;ctx.fillRect(((sx%W+W)%W),sy,1,(i%3===0?2:1))}
  ctx.fillStyle=LV===2?'rgba(255,110,40,0.16)':LV===1?'rgba(210,245,255,0.14)':'rgba(255,190,170,0.14)';
  for(let c=0;c<9;c++){const cx=((c*133+40)-(camX*0.12))%(W+180)-90,cy=42+(c%4)*25;ctx.fillRect(cx,cy,86,8);ctx.fillRect(cx+16,cy-7,54,9);ctx.fillRect(cx+35,cy+7,68,7)}
  ctx.fillStyle=l.mt[0];for(let x=-60;x<W+60;x+=50){const mx=x-(camX*0.2%50),h=35+Math.sin(x*0.013+1.7)*22+Math.sin(x*0.038)*10;ctx.fillRect(mx,FLOOR-10-h,50,h+10)}
  ctx.fillStyle=l.mt[1];for(let x=-50;x<W+50;x+=45){const mx=x-(camX*0.5%45),h=22+Math.sin(x*0.018+3.5)*16+Math.sin(x*0.05)*8;ctx.fillRect(mx,FLOOR-5-h,45,h+5)}
  ctx.fillStyle='rgba(10,8,20,0.32)';
  for(let x=-90;x<W+110;x+=80){const tx=x-(camX*0.72%80),ty=FLOOR-38-Math.sin(x*0.03)*10;ctx.fillRect(tx+20,ty,8,46);ctx.fillRect(tx,ty-7,50,12);ctx.fillRect(tx+6,ty-16,42,12);ctx.fillRect(tx+13,ty-25,30,12)}
}

function dP(){
  if(GS==='die')return;const bl=P.inv>0&&Math.floor(P.inv/3)%2===0;if(bl&&P.inv>5)return;
  const px=Math.round(P.x-camX),py=Math.round(P.y+camY),d=P.dir,a=P.anim;
  if(P.dashT>0){for(let i=1;i<=3;i++){ctx.globalAlpha=0.12/i;dNB(px-d*(i*7),py,d,a,true)}ctx.globalAlpha=1}
  for(const t of P.trails){ctx.globalAlpha=(t.l/7)*0.4;ctx.fillStyle=t.c;const tx=t.x-camX;ctx.fillRect(t.dir>0?tx:tx-t.w,Math.round(t.y+camY),t.w,t.h)}ctx.globalAlpha=1;
  // Combo aura
  if(P.combo>=30){const au=Math.sin(Date.now()*0.006)*0.3+0.7;ctx.fillStyle=`rgba(255,255,100,${au*0.4})`;ctx.fillRect(px-5,py-5,P.w+10,P.h+10)}
  else if(P.combo>=20){const au=Math.sin(Date.now()*0.008)*0.25+0.75;ctx.fillStyle=`rgba(255,200,50,${au*0.3})`;ctx.fillRect(px-4,py-4,P.w+8,P.h+8)}
  else if(P.combo>=10){const au=Math.sin(Date.now()*0.01)*0.3+0.7;ctx.fillStyle=`rgba(255,140,50,${au*0.18})`;ctx.fillRect(px-3,py-3,P.w+6,P.h+6)}
  // Killing Intent indicator
  if(P.combo>=20){ctx.fillStyle='rgba(255,220,50,0.25)';ctx.fillRect(px-2,py-2,P.w+4,P.h+4)}
  const shY=FLOOR+camY+2;ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(px+2,shY,P.w-4,3);
  // Mount rendering (drawn underneath player)
  if(P.mount){
    const mx=px+P.w/2,my=py+P.h;
    if(P.mount==='dino'){
      ctx.fillStyle='#163';ctx.fillRect(mx-23,my-4,46,15);ctx.fillRect(mx-15,my-17,20,17);
      ctx.fillStyle='#4c9';ctx.fillRect(mx-20,my-6,39,11);ctx.fillRect(mx-13,my-15,15,13);
      ctx.fillStyle='#9fc';ctx.fillRect(mx-10,my-11,6,3);ctx.fillStyle='#041';ctx.fillRect(mx-11,my-12,2,2);
      ctx.fillStyle='#2a6';ctx.fillRect(mx+17,my+2,15,6);ctx.fillRect(mx-14,my+7,7,7);ctx.fillRect(mx+5,my+7,8,7);
    }else if(P.mount==='raptor'){
      ctx.fillStyle='#263';ctx.fillRect(mx-18,my-6,34,12);ctx.fillRect(mx+7,my-15,15,13);
      ctx.fillStyle='#7c6';ctx.fillRect(mx-16,my-8,29,11);ctx.fillRect(mx+8,my-13,11,10);
      ctx.fillStyle='#dfc';ctx.fillRect(mx+15,my-10,3,2);ctx.fillStyle='#020';ctx.fillRect(mx+16,my-10,1,1);
      ctx.fillStyle='#494';ctx.fillRect(mx-10,my+4,5,13);ctx.fillRect(mx+8,my+3,5,14);ctx.fillRect(mx-24,my-2,12,4);
    }else if(P.mount==='trike'){
      ctx.fillStyle='#432';ctx.fillRect(mx-26,my-8,50,17);ctx.fillRect(mx+12,my-18,19,16);
      ctx.fillStyle='#b86';ctx.fillRect(mx-24,my-10,46,15);ctx.fillRect(mx+13,my-16,16,13);
      ctx.fillStyle='#fdc';ctx.fillRect(mx+27,my-18,9,3);ctx.fillRect(mx+22,my-21,4,7);ctx.fillRect(mx+12,my-20,4,7);
      ctx.fillStyle='#854';ctx.fillRect(mx-16,my+5,7,10);ctx.fillRect(mx+8,my+5,8,10);ctx.fillRect(mx-28,my-3,9,5);
    }else if(P.mount==='ptera'){
      ctx.fillStyle='#357';ctx.fillRect(mx-10,my-20,20,9);
      ctx.fillStyle='#8ac';ctx.fillRect(mx-8,my-21,16,8);
      ctx.fillStyle='#6ae';ctx.fillRect(mx+4,my-28,8,12);
      ctx.fillStyle='#001';ctx.fillRect(mx+7,my-25,2,2);
      const wf=Math.sin(P.anim*0.2)*5;
      ctx.fillStyle='#8ac';
      ctx.fillRect(mx-28+wf,my-22,24,6);
      ctx.fillRect(mx+4-wf,my-22,24,6);
    }
  }
  dNB(px,py,d,a,false);
}
function dNB(px,py,d,a,gh){
  ctx.save();
  const cx=px+P.w/2;
  ctx.translate(cx,0);ctx.scale(d,1);ctx.translate(-cx,0);
  const bob=P.ground?Math.abs(Math.sin(a*0.1))*2:0,ay=py-bob;
  if(!gh){ctx.fillStyle='rgba(255,220,160,0.08)';ctx.fillRect(px-4,ay-10,P.w+8,P.h+10);ctx.fillStyle='rgba(0,0,0,0.42)';ctx.fillRect(px+2,ay-8,P.w-4,P.h+7)}
  if(gh){ctx.fillStyle='#89c'}
  else ctx.fillStyle='#1a1030';
  // Legs
  const lS=P.ground?Math.sin(a*0.2)*4:2;
  ctx.fillRect(px+4,ay+20,6,10+lS);ctx.fillRect(px+14,ay+20,6,10-lS);
  ctx.fillStyle=gh?ctx.fillStyle:'#0a0a14';ctx.fillRect(px+3,ay+28+Math.max(0,lS),8,3);ctx.fillRect(px+13,ay+28-Math.min(0,lS),8,3);
  // Arms & scarf
  ctx.fillStyle=gh?ctx.fillStyle:'#8a2040';
  const sfx=Math.cos(a*0.15)*4;ctx.fillRect(px+(d>0?-4:P.w-2)+sfx,ay+8,4,8+Math.abs(sfx));
  if(P.atk>0&&P.wp===0){ctx.fillStyle=gh?ctx.fillStyle:'#1a1030';ctx.fillRect(px+(d>0?14:P.w-16)+Math.cos(a*0.2)*2,ay+3,d>0?12:-12,4)}
  else{ctx.fillStyle=gh?ctx.fillStyle:'#1a1030';ctx.fillRect(px-2,ay+6,3,8);ctx.fillRect(px+P.w-1,ay+6,3,8)}
  // Torso
  ctx.fillStyle=gh?ctx.fillStyle:'#2a1840';ctx.save();ctx.translate(px+P.w/2,ay+14);ctx.rotate(P.vx*0.03);ctx.fillRect(-10,-12,20,24);
  ctx.fillStyle=gh?ctx.fillStyle:'#3a2858';ctx.fillRect(-8,-10,16,18);
  ctx.fillStyle=gh?ctx.fillStyle:'#333';ctx.fillRect(-10,6,20,3);ctx.fillRect(-7,-6,14,10);
  ctx.fillStyle=gh?ctx.fillStyle:'#fd0';ctx.fillRect(-2,7,4,3);
  if(!gh){ctx.fillStyle='#41205a';ctx.fillRect(-7,-3,14,2);ctx.fillStyle='#f04';ctx.fillRect(5,-8,3,12)}
  ctx.restore();
  // Head
  ctx.fillStyle=gh?ctx.fillStyle:'#1a1030';ctx.fillRect(px+6,ay-6,12,12);ctx.fillRect(px+9,ay-9,6,4);
  ctx.fillStyle=gh?ctx.fillStyle:'#c8a080';ctx.fillRect(px+8,ay-4,8,8);
  if(!gh){ctx.fillStyle='#fff';ctx.fillRect(px+9,ay-1,3,2);ctx.fillRect(px+14,ay-1,3,2);ctx.fillStyle=P.combo>=20?'#fd0':'#000';ctx.fillRect(px+10,ay-1,2,2);ctx.fillRect(px+15,ay-1,2,2)}
  ctx.fillStyle=gh?ctx.fillStyle:'#222';ctx.fillRect(px+8,ay+3,8,3);
  // Scarf front
  ctx.fillStyle=gh?ctx.fillStyle:'#8a2040';ctx.fillRect(px+P.w/2-2,ay+2,4,10);if(!gh){const tail=Math.sin(a*0.12)*5;ctx.fillRect(px-8-tail,ay+4,13,4);ctx.fillRect(px-14-tail,ay+8,9,3)}
  // Weapon — smooth arc swing
  if(P.atk>0&&P.wp===0&&!gh){
    const bx=px+P.w+10;
    const atkProg=1-(P.atk/8);
    P.bladeTrail=P.bladeTrail||[];
    if(P.atk===8)P.bladeTrail=[];
    if(P.atk>4)P.bladeTrail.push({x:bx,y:ay+5,dir:d,prog:atkProg});
    P.bladeTrail=P.bladeTrail.filter(t=>{t.l=(t.l||6)-1;return t.l>0});
    for(const t of P.bladeTrail){
      ctx.globalAlpha=t.l/6*0.5;
      ctx.fillStyle='#8cf';
      ctx.fillRect(t.x,t.y-t.prog*20,20,3);
      ctx.globalAlpha=1;
    }
    const arcY=ay+5-Math.sin(atkProg*Math.PI)*15;
    ctx.fillStyle='rgba(80,180,255,0.3)';ctx.fillRect(bx-3,arcY-3,30,8);
    ctx.fillStyle=P.combo>=20?'#fd0':P.chain===2?'#ff0':P.chain===1?'#f84':'#fff';
    ctx.fillRect(bx,arcY,28,2);
    ctx.fillStyle='#fff';
    ctx.fillRect(bx+24,arcY-1,4,4);
  }else if(P.atk>0&&P.wp===1&&!gh){
    const bx=px+P.w-6,by=ay+2;
    ctx.fillStyle='rgba(255,210,120,0.26)';ctx.fillRect(bx-15,by+4,36,22);
    ctx.fillStyle='#fc8';ctx.fillRect(bx+6,by-2,8,20);ctx.fillRect(bx-8,by-5,22,9);
    ctx.fillStyle='#642';ctx.fillRect(bx+8,by+14,4,17)
  }else if(P.atk>0&&P.wp===3&&!gh){
    const bx=px+P.w-2,by=ay+7;
    ctx.strokeStyle='#cf8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx,by+5,12,-1.2,1.2);ctx.stroke();ctx.lineWidth=1;
    ctx.fillStyle='#df8';ctx.fillRect(bx,by+5,24,2)
  }else if(P.wp===0){ctx.fillStyle=gh?ctx.fillStyle:'#333';ctx.fillRect(px+P.w/2-1,ay-8,2,24);ctx.fillStyle=gh?ctx.fillStyle:'#8a2040';ctx.fillRect(px+P.w/2-3,ay-10,6,4)}
  else if(P.wp===1){ctx.fillStyle=gh?ctx.fillStyle:'#f60';ctx.fillRect(px+P.w-5,ay+10,5,5)}
  else if(P.wp===2){ctx.fillStyle=gh?ctx.fillStyle:'#fc8';ctx.fillRect(px+P.w-8,ay+3,11,6);ctx.fillRect(px+P.w-3,ay+7,4,18)}
  else{ctx.strokeStyle=gh?ctx.strokeStyle:'#cf8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px+P.w-1,ay+11,9,-1.1,1.1);ctx.stroke();ctx.lineWidth=1;ctx.fillStyle=gh?ctx.fillStyle:'#df8';ctx.fillRect(px+P.w-2,ay+11,12,1)}
  // Combo aura
  if(!gh&&P.combo>=30){const au=Math.sin(a*0.2)*0.3+0.7;ctx.fillStyle=`rgba(255,255,100,${au*0.25})`;ctx.fillRect(px-3,ay-2,P.w+6,P.h+4)}
  ctx.restore();
}

// ── FX renders ─────────────────────────────────
function dPR(){for(const p of PR){const px=Math.round(p.x-camX),py=Math.round(p.y+camY);ctx.fillStyle=p.c;ctx.fillRect(px,py,p.w,p.h);if(!p.en&&p.w>6){ctx.fillStyle=p.c+'44';ctx.fillRect(px-(p.vx>0?5:-5),py-1,5,p.h+2)}}}
function dPT(){for(const p of PT){const a=Math.min(1,p.l/8);ctx.globalAlpha=a;ctx.fillStyle=p.c;ctx.fillRect(Math.round(p.x-camX),Math.round(p.y+camY),p.s,p.s)}ctx.globalAlpha=1}
function dJR(){for(const r of JR){const a=r.l/r.ml;ctx.strokeStyle=r.c;ctx.globalAlpha=a*0.5;ctx.lineWidth=2;ctx.beginPath();ctx.arc(Math.round(r.x-camX),Math.round(r.y+camY),r.r,0,Math.PI*2);ctx.stroke()}ctx.globalAlpha=1;ctx.lineWidth=1}

// ── HUD ────────────────────────────────────────
function dHUD(){
  // XP bar
  if(GS==='play'||GS==='boss'){
    const xpNeeded=XP_TABLE[Math.min(P.level,XP_TABLE.length-1)]||9999;
    ctx.fillStyle='#222';ctx.fillRect(2,2,W-4,3);
    ctx.fillStyle='#8cf';ctx.fillRect(2,2,(W-4)*Math.min(1,P.xp/xpNeeded),3);
    ctx.fillStyle='#fff';ctx.font='6px monospace';ctx.fillText('Lv'+P.level,4,9);
  }
  ctx.fillStyle='#fff';ctx.font='8px monospace';ctx.fillText('HP',6,18);
  for(let i=0;i<P.mhp;i++){ctx.fillStyle=i<P.hp?'#f44':'#222';ctx.fillRect(24+i*10,11,8,8)}
  const wd=WEAPON_DATA[P.wp]||WEAPON_DATA[0];ctx.fillStyle=wd.color;ctx.fillText(wd.name,6,34);
  ctx.font='8px monospace';
  if(P.wp===1&&P.flCD>0){const p=P.flCD/P.flMax;ctx.fillStyle='#222';ctx.fillRect(6,38,50,4);ctx.fillStyle='#f60';ctx.fillRect(6,38,50*(1-p),4)}
  ctx.fillStyle=P.dashCD>0?'#444':'#555';ctx.fillText(P.dashCD>0?'冲刺中...':'Shift:冲刺',6,50);
  // Buffs
  let by=59;ctx.font='7px monospace';
  if(P.shield>0){ctx.fillStyle='#fd0';ctx.fillText('护盾',6,by);by+=10}
  if(P.atkBuff>0){ctx.fillStyle='#f80';ctx.fillText('攻击↑ '+Math.ceil(P.atkBuff/60)+'s',6,by);by+=10}
  if(P.spdBuff>0){ctx.fillStyle='#48f';ctx.fillText('速度↑ '+Math.ceil(P.spdBuff/60)+'s',6,by);by+=10}
  if(P.magnet>0){ctx.fillStyle='#c4f';ctx.fillText('磁铁 '+Math.ceil(P.magnet/60)+'s',6,by);by+=10}
  // Focus bar (time slow resource)
  if(GS==='play'||GS==='boss'){
    ctx.fillStyle='#222';ctx.fillRect(6,by,50,4);
    ctx.fillStyle=focus<20?'#844':focus<50?'#884':'#4a8';
    ctx.fillRect(6,by,50*(focus/focusMax),4);
    ctx.fillStyle='#888';ctx.font='6px monospace';ctx.fillText('集中',6,by+10);by+=14}
  // Corruption indicator
  if(GS==='play'&&corruption>10){ctx.fillStyle=corruption>60?'#f44':corruption>30?'#f84':'#444';ctx.font='7px monospace';ctx.fillText('腐败 '+Math.floor(corruption),6,by);by+=10}
  // Kill Intent bar
  if(GS==='play'||GS==='boss'){const ki=P.killIntent||0;ctx.fillStyle='#222';ctx.fillRect(6,by,50,4);ctx.fillStyle=ki>=80?'#fff':ki>=50?'#fd0':'#844';ctx.fillRect(6,by,50*(ki/100),4);ctx.fillStyle='#888';ctx.font='6px monospace';ctx.fillText('杀意 C释放',6,by+10);by+=14}
  // Mount status
  if(P.mount){ctx.fillStyle=P.mount==='dino'?'#8f4':P.mount==='ptera'?'#8cf':P.mount==='raptor'?'#cf8':'#fc8';ctx.font='8px monospace';
    const mtTxt={dino:'霸王龙 J火 K风',ptera:'翼龙 J俯冲 K风',raptor:'迅猛龙 J冲 K爪',trike:'三角龙 J撞 K震'}[P.mount]||mountName(P.mount);
    ctx.fillText(mtTxt,6,by);by+=10}
  // Combo + Killing Intent
  if(P.combo>0){ctx.textAlign='right';
    const sz=P.combo>=30?'bold 20px':P.combo>=20?'bold 16px':P.combo>=10?'bold 13px':'12px';
    ctx.font=sz+' monospace';
    ctx.fillStyle=P.combo>=30?'#fff':P.combo>=20?'#fd0':P.combo>=10?'#f84':'#fff';
    let txt=P.combo+' 连击';
    if(P.combo>=20)txt='殺 '+txt;
    ctx.fillText(txt,W-6,16);
    if(P.mxC>0){ctx.font='8px monospace';ctx.fillStyle='#555';ctx.fillText('最高:'+P.mxC+' | 击杀:'+P.kills,W-6,30)}
    ctx.textAlign='start'}
  // Boss HP
  if(BS.on&&!BS.dead&&BS.introT<=0){ctx.textAlign='center';for(let i=0;i<BS.jt.length;i++){const j=BS.jt[i];if(j.dead)continue;ctx.fillStyle=j.armor?'#888':'#fa0';ctx.font='7px monospace';ctx.fillText(j.name+' '+'■'.repeat(j.hp)+'□'.repeat(j.mhp-j.hp),W/2,9+i*8)}if(BS.telegraph>0){ctx.fillStyle=`rgba(255,50,50,${0.5+Math.sin(Date.now()*0.05)*0.3})`;ctx.font='bold 11px monospace';ctx.fillText('！！警告！！',W/2,H-16)}ctx.textAlign='start'}
  // Mission progress
  if(GS==='play'||GS==='boss'){
    ctx.fillStyle='#888';ctx.font='7px monospace';ctx.fillText('任务',6,H-26);
    const mp=MISSION.done?MISSION.tg:Math.min(MISSION.p,MISSION.tg);
    const mc=MISSION.done?'#fd0':'#fff';ctx.fillStyle=mc;
    ctx.fillText(MISSION.d+' ('+mp+'/'+MISSION.tg+')'+(MISSION.done?' ✓':''),6,H-16);
  }
  if(GS==='die'){ctx.fillStyle='rgba(0,0,0,'+(DT/75)+')';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#f33';ctx.font='bold 22px monospace';ctx.fillText('你死了',W/2,H/2-14);ctx.fillStyle='#fff';ctx.font='11px monospace';ctx.fillText('击杀: '+P.kills+' | 最高连击: '+P.mxC,W/2,H/2+6);ctx.fillText('按 R 重试',W/2,H/2+22);ctx.textAlign='start'}
  // Level indicator
  ctx.textAlign='right';ctx.fillStyle='#555';ctx.font='7px monospace';ctx.fillText('第'+(LV+1)+'关 '+curLvl().n,W-6,H-4);ctx.textAlign='start'}
