// ═══════════════════════════════════════════════
// ENDING SYSTEM — scores, rating, credits, world peace
// ═══════════════════════════════════════════════
let gameTime=0;
const WST={p:-1,t:0,pts:0,disp:0,rating:'D',scores:[],time:'',kills:0,combo:0,dmgTaken:0,base:0,bonus:0,mult:1,final:0};
function loadScores(){try{const j=localStorage.getItem('ninja_scores');return j?JSON.parse(j):[]}catch(e){return[]}}
function saveScores(s){try{localStorage.setItem('ninja_scores',JSON.stringify(s.slice(0,10)))}catch(e){}}
function calcScore(){
  const kills=totalKills+P.kills,combo=Math.max(totalMxC,P.mxC),time=gameTime/60;
  let base=kills*100+combo*50,bonus=0;
  if(time<40)bonus=5000;else if(time<55)bonus=3000;else if(time<75)bonus=1500;else bonus=500;
  let mult=1;const dmgPct=(P.mhp-P.hp)/P.mhp;
  if(P.hp>=P.mhp)mult=2.0;else if(dmgPct<0.25)mult=1.5;else if(dmgPct<0.5)mult=1.2;
  const final=Math.floor((base+bonus)*mult);
  let rating='D';
  if(P.hp>=P.mhp&&time<40&&combo>=30)rating='S';
  else if(dmgPct<0.25&&combo>=20)rating='A';
  else if(dmgPct<0.5&&combo>=10)rating='B';
  else if(dmgPct<0.75)rating='C';
  return {kills,combo,time:time.toFixed(1),dmgTaken:P.mhp-P.hp,base,bonus,mult,final,rating};
}
function startEnding(){
  const s=calcScore();
  const scores=loadScores();
  scores.push({score:s.final,rating:s.rating,time:s.time,kills:s.kills,combo:s.combo,date:new Date().toLocaleDateString()});
  scores.sort((a,b)=>b.score-a.score);
  const top10=scores.slice(0,10);
  saveScores(top10);
  Object.assign(WST,s,{p:0,t:0,disp:0,scores:top10});
  BS.on=false;
  // Massive boss explosion
  for(let i=0;i<100;i++){const a=Math.random()*Math.PI*2,sp=3+Math.random()*10;PT.push({x:BS.x+160+Math.cos(a)*30,y:BS.y+100+Math.sin(a)*20,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-Math.random()*6,l:40+Math.random()*50,c:['#f80','#f40','#fd0','#fff','#f60'][Math.floor(Math.random()*5)],s:Math.random()*5+2})}
  shake(45);sfx('bossDie');
}
function upEnding(){
  if(WST.p<0)return;
  if(shT>0){shX=(Math.random()-0.5)*shT;shY=(Math.random()-0.5)*shT;shT*=0.82;if(shT<0.2){shT=0;shX=0;shY=0}}else{shX=0;shY=0}
  if(WST.p===0){WST.t++;if(WST.t>=80){WST.p=1;WST.t=0;shake(10);for(let i=0;i<60;i++){PT.push({x:BS.x+120+Math.random()*80,y:BS.y+50+Math.random()*120,vx:(Math.random()-0.5)*8,vy:(Math.random()-0.5)*8-Math.random()*4,l:30+Math.random()*40,c:'#fff',s:Math.random()*4+2})}}}
  else if(WST.p===1){WST.t++;if(WST.t>=150){WST.p=2;WST.t=0;WST.disp=0}}
  else if(WST.p===2){WST.t++;WST.disp=Math.min(WST.final,Math.floor((WST.t/90)*WST.final)+Math.floor(Math.random()*60));if(WST.t>=90&&WST.disp>=WST.final){WST.p=3;WST.t=0;WST.disp=WST.final}}
  // Phase 0 extra explosion particles
  if(WST.p===0&&WST.t%2===0){PT.push({x:BS.x+100+Math.random()*120,y:BS.y+50+Math.random()*100,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6-Math.random()*3,l:25+Math.random()*25,c:['#f80','#fd0','#f40'][Math.floor(Math.random()*3)],s:Math.random()*4+2})}
  if(WST.p===1&&WST.t%4===0){PT.push({x:camX+Math.random()*W,y:Math.random()*H*0.7,vx:0,vy:-0.5-Math.random()*1.5,l:50+Math.random()*50,c:['#ffcccc','#ffffcc','#ccffcc','#ccccff'][Math.floor(Math.random()*4)],s:2+Math.random()*3})}
  // Phase 3: wait for R to proceed to credits
  if(WST.p===3&&jp('r')){WST.p=4;WST.t=0}
  // Phase 4: credits auto-scroll, R to skip
  if(WST.p===4){WST.t++;if(WST.t>750||jp('r')){reset();WST.p=-1}}
}
const CREDITS=[
  {t:'NINJA SLASH',s:18,c:'#f84'},{t:'',s:10},{t:'果灵僵尸斩灭录',s:11,c:'#fff'},{t:'',s:10},
  {t:'代码与设计',s:11,c:'#fd0'},{t:'匿名忍者',s:9,c:'#fff'},{t:'',s:10},
  {t:'引擎',s:11,c:'#fd0'},{t:'Vanilla JS + Canvas 2D',s:9,c:'#fff'},{t:'',s:10},
  {t:'音频',s:11,c:'#fd0'},{t:'Web Audio API 合成器',s:9,c:'#fff'},{t:'',s:10},
  {t:'像素美术',s:11,c:'#fd0'},{t:'纯 fillRect() 手绘',s:9,c:'#fff'},{t:'',s:10},
  {t:'特别鸣谢',s:11,c:'#fd0'},{t:'Capcom — 打击感启发',s:9,c:'#fff'},{t:'Team ICO — 巨像概念',s:9,c:'#fff'},{t:'Star Wars — 光剑传承',s:9,c:'#fff'},{t:'',s:20},
  {t:'感谢游玩',s:16,c:'#f84'},{t:'',s:12},{t:'按 R 重新开始',s:10,c:'#666'},
];
function renderEnding(){
  if(WST.p<0)return;const W2=W/2;
  if(WST.p===0){// Boss explosion
    dPT();dPR();const a=Math.min(1,WST.t/25);ctx.fillStyle=`rgba(0,0,0,${a*0.75})`;ctx.fillRect(0,0,W,H);
    const bx=BS.x-camX,by=BS.y+camY;
    for(let i=0;i<14;i++){const fx=bx+Math.random()*350,fy=by+Math.random()*200,ft=WST.t*0.9+i*3.5;ctx.fillStyle=i%3===0?'#f80':i%3===1?'#630':'#420';ctx.fillRect(fx+Math.sin(ft*0.09)*ft*0.6,fy+Math.cos(ft*0.07)*ft*0.35,14-i*0.9,12-i*0.7)}
    ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 20px monospace';ctx.fillText('巨像已被摧毁',W2,H/2);ctx.textAlign='start';
  }else if(WST.p===1){// World peace
    dPT();const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3388cc');g.addColorStop(0.3,'#66aaee');g.addColorStop(0.55,'#aaddff');g.addColorStop(0.8,'#ddeeff');g.addColorStop(1,'#ffffff');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // Sun
    ctx.fillStyle='#ffe880';const sx=W-65,sy=22;ctx.fillRect(sx,sy,34,34);ctx.fillRect(sx-5,sy+5,44,24);ctx.fillRect(sx+3,sy-3,28,40);
    for(let r=0;r<10;r++){const a=r/10*Math.PI*2;ctx.fillRect(sx+13+Math.cos(a)*20,sy+13+Math.sin(a)*20,5,5)}
    // Clouds
    ctx.fillStyle='#fff';for(let c=0;c<6;c++){const cx=((c*145+50)+(WST.t*0.1))%(W+120)-40,cy=38+c*22;ctx.fillRect(cx,cy,50,12);ctx.fillRect(cx+12,cy-5,32,12);ctx.fillRect(cx+25,cy-2,38,10)}
    // Rolling hills
    const hc=['#4a8a2a','#559933','#66aa44','#77bb55','#88cc66'];
    for(let h=0;h<5;h++){ctx.fillStyle=hc[h];const by0=H-45+h*16;ctx.fillRect(0,by0,W,H-by0);for(let x=0;x<W;x+=2){const hh=Math.sin(x*0.007+h*1.5)*20+Math.sin(x*0.017+h*2.8)*14+Math.sin(x*0.004+h*0.7)*26;ctx.fillRect(x,by0-hh,3,hh+2)}}
    // Small trees
    ctx.fillStyle='#3a6018';for(let t=0;t<8;t++){const tx=((t*183+66)%W),ty=H-55+Math.sin(tx*0.007)*20+Math.sin(tx*0.017)*14+Math.sin(tx*0.004)*26;ctx.fillRect(tx-2,ty-18,5,20);ctx.fillStyle='#2a4a10';ctx.fillRect(tx-8,ty-22,17,8);ctx.fillStyle='#3a6018';ctx.fillRect(tx-6,ty-26,13,6)}
    // Flowers
    for(let f=0;f<30;f++){const fx=((f*167+41)%W),fy=H-55+Math.sin(fx*0.007+f*0.8)*20+Math.sin(fx*0.017+f*0.6)*14+Math.sin(fx*0.004+f*0.3)*26;if(fy>H-8)continue;ctx.fillStyle=['#ff6688','#ffaa44','#ffee44','#ff4488','#ffffff'][f%5];ctx.fillRect(fx,fy,3,3);ctx.fillRect(fx-1,fy-2,1,1);ctx.fillRect(fx+3,fy-2,1,1);ctx.fillStyle='#559933';ctx.fillRect(fx+1,fy+2,2,5)}
    // Peace text
    const fi=Math.min(1,WST.t/40);ctx.globalAlpha=fi;ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 18px monospace';ctx.fillText('PEACE  RESTORED',W2,H-12);ctx.textAlign='start';ctx.globalAlpha=1;
  }else if(WST.p>=2){// Score screen
    ctx.fillStyle='rgba(0,0,0,0.93)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#111';ctx.strokeStyle='#f84';ctx.lineWidth=2;ctx.fillRect(28,10,W-56,H-20);ctx.strokeRect(28,10,W-56,H-20);
    ctx.textAlign='center';ctx.fillStyle='#fd0';ctx.font='bold 14px monospace';ctx.fillText('★ 任务完成 ★',W2,30);
    const y0=50;ctx.font='9px monospace';
    const st=[['通关时间',WST.time+'s'],['击杀敌数',String(WST.kills)],['最高连击',WST.combo+' 连击'],['受到伤害',WST.dmgTaken+'/'+P.mhp+' HP']];
    for(let i=0;i<st.length;i++){ctx.fillStyle='#888';ctx.fillText(st[i][0],W2-55,y0+i*17);ctx.fillStyle='#fff';ctx.fillText(st[i][1],W2+55,y0+i*17)}
    if(WST.p===2){ctx.fillStyle='#fd0';ctx.font='bold 26px monospace';ctx.fillText(WST.disp.toLocaleString(),W2,y0+78)}
    else{ctx.fillStyle='#fd0';ctx.font='bold 26px monospace';ctx.fillText(WST.final.toLocaleString()+' 分',W2,y0+75);ctx.fillStyle='#666';ctx.font='7px monospace';ctx.fillText('基础 '+WST.base+' + 奖励 '+WST.bonus+' ×'+WST.mult.toFixed(1),W2,y0+88)}
    if(WST.p>=3){const rc={S:'#fd0',A:'#f84',B:'#fff',C:'#8cf',D:'#888'};ctx.fillStyle=rc[WST.rating];ctx.font='bold 42px monospace';ctx.fillText(WST.rating,W2,y0+122);ctx.fillStyle=rc[WST.rating];ctx.font='9px monospace';const rd={S:'完美忍者',A:'卓越忍者',B:'优秀忍者',C:'新手忍者',D:'见习忍者'};ctx.fillText(rd[WST.rating],W2,y0+138);
      ctx.fillStyle='#888';ctx.font='8px monospace';ctx.fillText('── 最高分排行 ──',W2,y0+158);ctx.font='7px monospace';
      for(let i=0;i<Math.min(5,WST.scores.length);i++){const s=WST.scores[i];const hl=s.score===WST.final&&s.rating===WST.rating;ctx.fillStyle=hl?'#fd0':'#555';ctx.fillText((i+1)+'. '+s.score+'分  '+s.rating+'  '+s.time+'s  '+s.date,W2,y0+172+i*13)}
      ctx.fillStyle='#666';ctx.font='8px monospace';ctx.fillText('按 R 查看制作名单',W2,H-15)}
    if(WST.p>=4){const sy=H-WST.t*0.7;ctx.fillStyle='rgba(0,0,0,0.9)';ctx.fillRect(0,0,W,H);ctx.textAlign='center';
      for(let i=0;i<CREDITS.length;i++){const c=CREDITS[i],cy=sy+i*28;if(cy<-20||cy>H+20)continue;ctx.fillStyle=c.c||'#888';ctx.font=`bold ${c.s||8}px monospace`;ctx.fillText(c.t,W2,cy)}ctx.textAlign='start'}
  }
}

// ═══════════════════════════════════════════════
// TITLE SCREEN — pixel 3D rendered
// ═══════════════════════════════════════════════
let titleStars=[],titleT=0;
function initTitle(){
  titleStars=[];titleT=0;
  for(let i=0;i<80;i++)titleStars.push({x:Math.random()*W,y:Math.random()*H,z:0.3+Math.random()*1.5,s:0.5+Math.random()*1.5});
}
function drawTitle(){
  titleT++;
  // Starfield
  ctx.fillStyle='#08081a';ctx.fillRect(0,0,W,H);
  for(const s of titleStars){
    const tw=s.z*0.4+0.6,b=tw*(0.4+Math.sin(titleT*0.03+s.x)*0.3);
    ctx.fillStyle=`rgba(255,255,255,${b})`;ctx.fillRect(Math.round(s.x),Math.round(s.y),s.s,s.s);
  }
  // Ninja silhouette on the side
  const nt=titleT*0.04,nx=W-90,ny=H-70;
  ctx.fillStyle='#0c0c24';
  // Body
  ctx.fillRect(nx+8,ny+5,22,38);ctx.fillRect(nx,ny+2,38,28); // head+torso
  ctx.fillRect(nx+4,ny+42,8,22);ctx.fillRect(nx+26,ny+42,8,22); // legs
  ctx.fillRect(nx-6,ny+14,18,6);ctx.fillRect(nx+26,ny+14,18,6); // arms
  // Sword glow
  const sg=Math.sin(titleT*0.08)*0.3+0.7;
  ctx.fillStyle=`rgba(255,80,40,${sg*0.4})`;ctx.fillRect(nx+20,ny-22,4,30);
  ctx.fillStyle=`rgba(255,200,100,${sg*0.2})`;ctx.fillRect(nx+16,ny-30,12,46);

  // 3D Title — layered extrusion
  const cx=W/2,ty=38;
  ctx.textAlign='center';
  const extrusions=[
    {ox:7,oy:5,c:'#1a0010'},{ox:6,oy:4,c:'#2a0018'},{ox:5,oy:4,c:'#3a0020'},
    {ox:4,oy:3,c:'#500028'},{ox:3,oy:2,c:'#700030'},{ox:2,oy:2,c:'#900038'},
    {ox:2,oy:1,c:'#b00040'},{ox:1,oy:1,c:'#d00048'},{ox:1,oy:0,c:'#f05058'},
    {ox:0,oy:0,c:'#ff6068'},
  ];
  ctx.font='bold 38px monospace';
  for(const e of extrusions){ctx.fillStyle=e.c;ctx.fillText('NINJA SLASH',cx+e.ox,ty+e.oy)}
  // Highlight edge
  ctx.fillStyle='#ffa0a8';ctx.fillText('NINJA SLASH',cx-1,ty-1);

  // Subtitle
  ctx.font='bold 10px monospace';
  const subEx=[
    {ox:3,oy:2,c:'#1a1000'},{ox:2,oy:2,c:'#2a1800'},{ox:2,oy:1,c:'#3a2008'},
    {ox:1,oy:1,c:'#5a3020'},{ox:1,oy:0,c:'#8a4038'},{ox:0,oy:0,c:'#f84'},
  ];
  const sty=ty+28;
  for(const e of subEx){ctx.fillStyle=e.c;ctx.fillText('果灵僵尸斩灭录',cx+e.ox,sty+e.oy)}
  ctx.fillStyle='#fca';ctx.fillText('果灵僵尸斩灭录',cx-1,sty-1);

  // Blink "PRESS ANY KEY"
  const blink=Math.sin(titleT*0.06)>-0.3;
  if(blink){ctx.fillStyle='#fff';ctx.font='bold 11px monospace';ctx.fillText('按任意键开始游戏',cx,H-60)}

  // Controls hint
  ctx.fillStyle='#444';ctx.font='8px monospace';
  ctx.fillText('A/D 移动  空格 跳跃(×3)   S/↓ 下砸   J/Z 攻击   K/X 副攻击   Shift 冲刺',cx,H-52);
  ctx.fillText('贴墙滑行+跳=踢墙跳   F 骑乘   1-4 武器切换',cx,H-38);
  ctx.fillStyle='#666';ctx.font='8px monospace';
  ctx.fillText('按 M 进入灵魂祭坛 (已累积 '+META.souls+' 灵魂)',cx,H-24);

  // Decorative pixel flames
  const flX=[cx-90,cx+90],flY=ty+32;
  for(const fx of flX){
    for(let i=0;i<5;i++){
      const fh=6+Math.sin(titleT*0.12+i*1.5)*3;
      ctx.fillStyle=['#f80','#f60','#f40','#f20','#ff0'][i];
      ctx.fillRect(fx+i*5-10,flY-fh,4,fh+2);
    }
  }
  ctx.textAlign='start';
}

function drawUpgrade(){
  ctx.fillStyle='rgba(0,0,0,0.88)';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.fillStyle='#fd0';ctx.font='bold 22px monospace';ctx.fillText('选择升级',W/2,56);
  ctx.fillStyle='#888';ctx.font='12px monospace';ctx.fillText('第 '+(waveCleared)+' 波清除 — 选择一项强化',W/2,80);
  if(!upgradeInputArmed){ctx.fillStyle='#f84';ctx.font='10px monospace';ctx.fillText('松开攻击/跳跃键后再选择',W/2,100)}
  const cards=upgradeChoices;
  const nCards=Math.min(5,cards.length);
  // Dynamic card sizing based on number of options
  const cw=nCards>=5?140:nCards>=4?160:190;
  const ch=260,gap=nCards>=5?14:24;
  const start=(W-(cw*nCards+gap*(nCards-1)))/2;
  for(let i=0;i<nCards;i++){
    const c=cards[i],cx=start+i*(cw+gap),cy=130;
    const lv=UPG[c.id]||0;
    // Card background
    ctx.fillStyle='#111';ctx.strokeStyle='#f84';ctx.lineWidth=2;
    ctx.fillRect(cx,cy,cw,ch);ctx.strokeRect(cx,cy,cw,ch);
    // Header
    ctx.fillStyle='#222';ctx.fillRect(cx+6,cy+6,cw-12,38);
    ctx.fillStyle='#fff';ctx.font='bold 13px monospace';ctx.fillText(c.name,cx+cw/2,cy+28);
    // Description
    ctx.fillStyle='#ccc';ctx.font='10px monospace';ctx.fillText(c.desc,cx+cw/2,cy+68);
    // Level indicator
    ctx.fillStyle='#666';ctx.font='10px monospace';
    ctx.fillText('LV '+(lv+1)+' / '+c.maxLv,cx+cw/2,cy+96);
    // Level pips
    const pipW=Math.min(18,Math.floor((cw-20)/c.maxLv));
    for(let p=0;p<c.maxLv;p++){
      ctx.fillStyle=p<=lv?'#fd0':'#333';
      ctx.fillRect(cx+10+p*(pipW+2),cy+108,pipW,10);
    }
    // Key hint
    ctx.fillStyle=upgradeInputArmed?'#f84':'#555';ctx.font='bold 20px monospace';ctx.fillText('['+(i+1)+']',cx+cw/2,cy+ch-22);
  }
  ctx.textAlign='start';
}

function drawMap(){
  const t=Date.now()*0.001;
  ctx.fillStyle='#0a0a18';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,0.04)';ctx.lineWidth=1;
  for(let gx=0;gx<W;gx+=20){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}
  for(let gy=0;gy<H;gy+=20){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}
  ctx.strokeStyle='rgba(255,100,50,0.12)';ctx.lineWidth=2;
  ctx.strokeRect(8,8,W-16,H-16);
  ctx.strokeStyle='rgba(255,100,50,0.06)';ctx.lineWidth=1;
  ctx.strokeRect(14,14,W-28,H-28);
  ctx.textAlign='center';
  ctx.fillStyle='#f84';ctx.font='bold 14px monospace';ctx.fillText('—— 世界地图 ——',W/2,28);
  ctx.fillStyle='#555';ctx.font='7px monospace';ctx.fillText('选择你的战场',W/2,42);
  for(let i=0;i<MAP_NODES.length-1;i++){
    const a=MAP_NODES[i],b=MAP_NODES[i+1];
    const midX=(a.x+b.x)/2,midY=Math.min(a.y,b.y)-25;
    ctx.strokeStyle=b.unlocked||a.cleared?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.06)';
    ctx.lineWidth=1.5;
    ctx.setLineDash([4,6]);
    ctx.beginPath();
    ctx.moveTo(a.x,a.y);
    ctx.quadraticCurveTo(midX,midY,b.x,b.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  for(let i=0;i<MAP_NODES.length;i++){
    const n=MAP_NODES[i],nx=n.x,ny=n.y;
    const isSelected=i===mapSel;
    const lvlData=LVL[n.id];
    const pulse=isSelected?Math.sin(t*3)*0.2+0.8:1;
    const r=isSelected?18:14;
    if(isSelected){
      ctx.fillStyle='rgba(255,136,68,'+(0.12+Math.sin(t*4)*0.06)+')';
      ctx.beginPath();ctx.arc(nx,ny,r+8,0,Math.PI*2);ctx.fill();
    }
    if(n.cleared){ctx.fillStyle='#1a3a1a';ctx.strokeStyle='#3a6a3a';ctx.lineWidth=2;}
    else if(n.unlocked){ctx.fillStyle='#1a1a30';ctx.strokeStyle='#f84';ctx.lineWidth=2;}
    else{ctx.fillStyle='#111';ctx.strokeStyle='#333';ctx.lineWidth=1.5;}
    ctx.beginPath();ctx.arc(nx,ny,r,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle=n.cleared?'rgba(80,200,80,0.15)':n.unlocked?'rgba(255,136,68,0.1)':'rgba(255,255,255,0.03)';
    ctx.beginPath();ctx.arc(nx-2,ny-2,r-4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=n.cleared?'#6c6':n.unlocked?'#fff':'#444';
    ctx.font='bold 11px monospace';
    ctx.fillText(n.id+1,nx,ny+4);
    if(n.cleared){ctx.fillStyle='#4a4';ctx.font='10px monospace';ctx.fillText('✓',nx,ny-13);}
    else if(!n.unlocked){ctx.fillStyle='#555';ctx.fillRect(nx-4,ny-13,8,6);ctx.fillRect(nx-1,ny-7,2,4);}
    if(isSelected){
      const blinkAlpha=Math.sin(t*5)>-0.2?1:0;
      ctx.fillStyle='rgba(255,136,68,'+(blinkAlpha*0.9)+')';
      ctx.beginPath();
      ctx.moveTo(nx,ny+r+6);
      ctx.lineTo(nx-6,ny+r+14);
      ctx.lineTo(nx+6,ny+r+14);
      ctx.closePath();ctx.fill();
    }
    if(lvlData){
      const labelY=ny+r+22;
      ctx.fillStyle=isSelected?'#fff':'#555';
      ctx.font='8px monospace';
      ctx.fillText(lvlData.n,nx,labelY);
      ctx.fillStyle='#444';ctx.font='6px monospace';
      ctx.fillText(lvlData.st,nx,labelY+10);
      if(n.cleared){ctx.fillStyle='#4a4';ctx.font='6px monospace';ctx.fillText('已通关',nx,labelY+19);}
      else if(n.unlocked){ctx.fillStyle='#f84';ctx.font='6px monospace';ctx.fillText('可挑战',nx,labelY+19);}
    }
  }
  ctx.textAlign='center';
  ctx.fillStyle='#444';ctx.font='8px monospace';
  ctx.fillText('← → 选择关卡   空格/Enter 进入   R 返回标题',W/2,H-14);
  ctx.textAlign='start';
  for(const p of PETALS){
    ctx.save();
    ctx.translate(p.x,p.y);
    ctx.rotate(p.r);
    ctx.globalAlpha=p.o;
    ctx.fillStyle='#f9c';ctx.fillRect(-p.s,-p.s/2,p.s*2,p.s);
    ctx.fillStyle='#fad';ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);
    ctx.restore();
  }
  ctx.globalAlpha=1;
}

function initPetals(){
  PETALS.length=0;
  for(let i=0;i<25;i++){
    PETALS.push({
      x:Math.random()*W,
      y:Math.random()*H,
      vx:-0.3-Math.random()*0.6,
      vy:0.2+Math.random()*0.5,
      r:Math.random()*Math.PI*2,
      rv:(Math.random()-0.5)*0.05,
      s:1+Math.random()*2,
      o:0.3+Math.random()*0.5
    });
  }
}
function upPetals(){
  for(const p of PETALS){
    p.x+=p.vx;p.y+=p.vy;p.r+=p.rv;
    if(p.x<-20)p.x=W+20;if(p.x>W+20)p.x=-20;
    if(p.y>H+20)p.y=-20;if(p.y<-20)p.y=H+20;
  }
}

// ═══════════════════════════════════════════════
// META SHOP — permanent progression across runs
// ═══════════════════════════════════════════════
let metaSel=0;
const META_ITEMS=[
  {id:'unlockFrost',name:'解锁: 冰冻之刃',desc:'升级池加入冰冻之刃',cost:25,check:()=>META.unlocked.has('frostBite'),unlock:()=>META.unlocked.add('frostBite')},
  {id:'unlockBomb',name:'解锁: 爆裂核心',desc:'升级池加入爆裂核心',cost:25,check:()=>META.unlocked.has('killBomb'),unlock:()=>META.unlocked.add('killBomb')},
  {id:'unlockCrit',name:'解锁: 暴击之心',desc:'升级池加入暴击之心',cost:25,check:()=>META.unlocked.has('critHeart'),unlock:()=>META.unlocked.add('critHeart')},
  {id:'unlockChain',name:'解锁: 雷神之怒',desc:'升级池加入雷神之怒',cost:25,check:()=>META.unlocked.has('chainLightning'),unlock:()=>META.unlocked.add('chainLightning')},
  {id:'startHP',name:'起始生命 +1',desc:'每局起始HP+1 (可叠加, 上限5)',cost:20,check:()=>META.startingHPBonus>=5,unlock:()=>{META.startingHPBonus++;saveMeta()}},
  {id:'extraChoice',name:'额外选项',desc:'升级时多一个选项 (上限2)',cost:50,check:()=>META.extraChoices>=2,unlock:()=>{META.extraChoices++;saveMeta()}},
];
function drawMetaShop(){
  ctx.fillStyle='#08081a';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.fillStyle='#fd0';ctx.font='bold 18px monospace';ctx.fillText('☆ 灵魂祭坛 ☆',W/2,30);
  ctx.fillStyle='#888';ctx.font='10px monospace';ctx.fillText('累积灵魂: '+META.souls,W/2,48);
  const items=META_ITEMS.filter(it=>!it.check());
  for(let i=0;i<items.length;i++){
    const it=items[i],y=70+i*42;
    const hl=i===metaSel;
    ctx.fillStyle=hl?'#1a1a30':'#111';ctx.strokeStyle=hl?'#f84':'#333';ctx.lineWidth=hl?2:1;
    ctx.fillRect(30,y,W-60,36);ctx.strokeRect(30,y,W-60,36);
    ctx.fillStyle=META.souls>=it.cost?(hl?'#fff':'#ccc'):'#555';ctx.font=hl?'bold 12px monospace':'12px monospace';
    ctx.fillText(it.name+' — '+it.cost+' 灵魂',W/2,y+16);
    ctx.fillStyle='#888';ctx.font='9px monospace';ctx.fillText(it.desc,W/2,y+30);
  }
  if(items.length===0){ctx.fillStyle='#555';ctx.font='12px monospace';ctx.fillText('所有物品已解锁',W/2,150)}
  ctx.fillStyle='#444';ctx.font='8px monospace';ctx.fillText('↑↓ 选择 | 空格/Enter 购买 | M 返回',W/2,H-12);
  ctx.textAlign='start';
}
function upMetaShop(){
  const items=META_ITEMS.filter(it=>!it.check());
  if(jp('ArrowUp')||jp('w')||jp('W'))metaSel=Math.max(0,metaSel-1);
  if(jp('ArrowDown')||jp('s')||jp('S'))metaSel=Math.min(items.length-1,metaSel+1);
  if((jp(' ')||jp('Enter'))&&items[metaSel]&&META.souls>=items[metaSel].cost){
    META.souls-=items[metaSel].cost;items[metaSel].unlock();saveMeta();sfx('pickup');shake(6);
  }
  if(jp('m')||jp('M')){GS='title';metaSel=0}
}
