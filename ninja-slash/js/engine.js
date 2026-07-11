// ═══════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════
const W=960,H=540,G=0.5,FLOOR=461;let LW=4267;
let SCALE=Math.max(1,Math.min(3,Math.floor((window.innerWidth-24)/W),Math.floor((window.innerHeight-72)/H)));
// XP system
const XP_TABLE=[0,80,200,400,700,1100,1600,2200,3000,4000,5200]; // XP needed per level
const LEVEL_BONUS=[null,{hp:3},{dmg:0.15},{spd:0.1},{hp:4},{dmg:0.2},{jump:1},{hp:5},{dmg:0.25},{spd:0.15},{hp:6}]; // permanent level-up rewards
// Mount system
const MOUNT_DATA={
  dino:{spdMul:1.95,jumpPow:-12,dur:780,ramDmg:8,ramCD:50,w:40,h:28,color:'#4a8',color2:'#3a6'},
  ptera:{spdMul:1.0,flySpd:3.2,flyGrav:0.05,dur:660,w:36,h:20,color:'#8ac',color2:'#6ae'},
  raptor:{spdMul:2.45,jumpPow:-12.5,dur:720,w:34,h:26,color:'#7c6',color2:'#494'},
  trike:{spdMul:1.55,jumpPow:-9.5,dur:840,w:48,h:30,color:'#b86',color2:'#854'},
};
const MOUNT_NAMES={dino:'霸王龙',ptera:'翼龙',raptor:'迅猛龙',trike:'三角龙'};
function mountName(id){return MOUNT_NAMES[id]||'坐骑'}
// World map nodes
const MAP_NODES=[
  {id:0,x:110,y:300,unlocked:true,cleared:false},
  {id:1,x:300,y:250,unlocked:false,cleared:false},
  {id:2,x:490,y:320,unlocked:false,cleared:false},
  {id:3,x:680,y:250,unlocked:false,cleared:false},
  {id:4,x:850,y:305,unlocked:false,cleared:false},
];
const canvas=document.getElementById('game');
canvas.width=W;canvas.height=H;canvas.style.width=(W*SCALE)+'px';canvas.style.height=(H*SCALE)+'px';
const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;

// INPUT
const K={},PV={};
document.addEventListener('keydown',e=>{K[e.key]=true;iA();sBGM();e.preventDefault()});
document.addEventListener('keyup',e=>{K[e.key]=false;e.preventDefault()});
window.addEventListener('blur',()=>{for(const k in K)K[k]=false;for(const k in PV)PV[k]=false});
function jp(k){if(K[k]&&!PV[k]){PV[k]=true;return true}if(!K[k])PV[k]=false;return false}

// AUDIO
let AC=null;
function iA(){if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)()}if(AC.state==='suspended')AC.resume()}
function snd(t,f,d,v,w){if(!AC)return;const n=AC.currentTime;const o=AC.createOscillator(),g=AC.createGain();o.type=w||'square';o.frequency.setValueAtTime(f,n);if(t==='slide')o.frequency.linearRampToValueAtTime(f*0.3,n+d);g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(0.001,n+d);o.connect(g);g.connect(AC.destination);o.start(n);o.stop(n+d)}
function nz(d,v,lp){if(!AC)return;const n=AC.currentTime,ln=AC.sampleRate*d;const b=AC.createBuffer(1,ln,AC.sampleRate),dt=b.getChannelData(0);for(let i=0;i<ln;i++)dt[i]=(Math.random()*2-1)*Math.exp(-i/(ln*0.25));const s=AC.createBufferSource();s.buffer=b;const g=AC.createGain();g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(0.001,n+d);const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=lp||2000;s.connect(f);f.connect(g);g.connect(AC.destination);s.start(n)}
function sfx(t,wpOverride){iA();if(AC.state==='suspended')return;
  if(t==='slash'){
    const wp=wpOverride!==undefined?wpOverride:(typeof P!=='undefined'?P.wp:-1);
    if(wp===1){nz(0.08,0.14,1800);snd('slide',220,0.07,0.1,'sawtooth')} // flame: low, fiery
    else if(wp===2){nz(0.1,0.16,1200);snd('hit',90,0.08,0.14,'square')} // hammer: heavy thud
    else if(wp===3){nz(0.03,0.08,3600);snd('slide',1200,0.04,0.05,'triangle')} // bow: high, light
    else if(wp===99){nz(0.04,0.1,3200);snd('slide',950,0.05,0.06,'sine')} // kunai: high, clean
    else{nz(0.06,0.12,2800);snd('slide',800,0.06,0.07,'sawtooth')} // saber: default
  }
  else if(t==='hit'){nz(0.04,0.1,1400);snd('hit',180,0.03,0.08,'square')}
  else if(t==='heavy'){nz(0.1,0.15,2400);snd('hit',100,0.06,0.12,'sawtooth');snd('hit',60,0.08,0.1,'square')}
  else if(t==='jump'){snd('slide',350,0.1,0.04,'square')}
  else if(t==='jump2'){snd('slide',500,0.08,0.05,'triangle');snd('slide',700,0.06,0.03,'square')}
  else if(t==='jump3'){snd('slide',650,0.07,0.05,'triangle');snd('slide',900,0.05,0.04,'square');snd('hit',300,0.04,0.06,'sine')}
  else if(t==='land'){nz(0.05,0.06,700);snd('hit',90,0.04,0.05,'square')}
  else if(t==='die'){nz(0.3,0.2,900);snd('slide',250,0.4,0.15,'sawtooth')}
  else if(t==='explode'){nz(0.2,0.25,2800);snd('slide',120,0.3,0.18,'sawtooth')}
  else if(t==='bossHit'){nz(0.08,0.2,1800);snd('hit',70,0.08,0.12,'square');snd('hit',45,0.06,0.1,'triangle')}
  else if(t==='bossDie'){nz(0.6,0.35,3500);snd('slide',80,0.8,0.25,'sawtooth');snd('slide',35,1.0,0.2,'square')}
  else if(t==='bossIntro'){nz(0.4,0.2,600);snd('slide',60,0.5,0.2,'sawtooth');snd('slide',30,0.6,0.15,'square');setTimeout(()=>{nz(0.3,0.15,800);snd('slide',100,0.3,0.12,'sawtooth')},250)}
  else if(t==='win'){snd('slide',350,0.15,0.1,'square');setTimeout(()=>snd('slide',550,0.15,0.1,'square'),120);setTimeout(()=>snd('slide',750,0.2,0.12,'square'),240);setTimeout(()=>snd('slide',950,0.25,0.15,'triangle'),360)}
  else if(t==='combo'){snd('slide',500+Math.random()*300,0.05,0.04,'triangle')}
  else if(t==='spawn'){nz(0.08,0.06,500);snd('slide',150,0.06,0.05,'square')}
  else if(t==='pickup'){snd('slide',700,0.08,0.06,'sine');snd('slide',900,0.06,0.04,'triangle')}
}

// BGM — bright pentatonic themes
let BGM=null,BGMG=null;
function initBGM(){if(!AC)return;BGMG=AC.createGain();BGMG.gain.value=0.08;BGMG.connect(AC.destination)}
function bN(f,d,v,t){if(!AC||!BGMG)return;const n=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=t||'sine';o.frequency.setValueAtTime(f,n);g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(v,n+0.08);g.gain.exponentialRampToValueAtTime(0.001,n+d);o.connect(g);g.connect(BGMG);o.start(n);o.stop(n+d)}
const BGM_THEMES=[
  {root:130.81,chord:196,iv:360,scale:[261.63,293.66,329.63,392,440,523.25,587.33,659.25,783.99,880]},
  {root:146.83,chord:220,iv:430,scale:[293.66,329.63,369.99,440,493.88,587.33,659.25,739.99,880,987.77]},
  {root:164.81,chord:246.94,iv:310,scale:[329.63,392,440,493.88,587.33,659.25,783.99,880,987.77,1174.66]},
  {root:174.61,chord:261.63,iv:390,scale:[349.23,392,440,523.25,587.33,698.46,783.99,880,1046.5,1174.66]},
  {root:196,chord:293.66,iv:260,scale:[392,440,493.88,587.33,659.25,783.99,880,987.77,1174.66,1318.51]},
];
function bgmTheme(){return BGM_THEMES[Math.max(0,Math.min(BGM_THEMES.length-1,typeof LV==='number'?LV:0))]}
function bPerc(v){if(!AC||!BGMG)return;const n=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.setValueAtTime(110,n);o.frequency.exponentialRampToValueAtTime(55,n+0.12);g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(0.001,n+0.14);o.connect(g);g.connect(BGMG);o.start(n);o.stop(n+0.16)}
function bL(){if(!BGM)return;const now=Date.now(),th=bgmTheme();if(BGM.lv!==LV){BGM.lv=LV;if(BGM.d1)BGM.d1.frequency.setTargetAtTime(th.root,AC.currentTime,0.2);if(BGM.d2)BGM.d2.frequency.setTargetAtTime(th.chord,AC.currentTime,0.2)}
  if(now-BGM.ln>BGM.iv){BGM.ln=now;BGM.step=(BGM.step+1)%16;BGM.iv=th.iv+Math.random()*160;const idx=(BGM.step*2+(BGM.step%4===0?2:0)+Math.floor(Math.random()*3))%th.scale.length,f=th.scale[idx],v=0.11+Math.random()*0.13;
    bN(f,0.18+Math.random()*0.34,v,Math.random()<0.55?'triangle':'sine');
    if(BGM.step%4===0)bN(f*1.5,0.2,0.065,'triangle');
    if(BGM.step%8===0)bN(f*2,0.22,0.05,'sine');
    if((GS==='play'||GS==='boss')&&BGM.step%4===0)bPerc(0.035);
  }requestAnimationFrame(bL)}
function sBGM(){if(BGM)return;initBGM();if(!AC||!BGMG)return;const th=bgmTheme();BGM={ln:0,iv:300,step:0,lv:LV};bL();if(!BGM.d1){BGM.d1=AC.createOscillator();BGM.d1.type='sine';BGM.d1.frequency.value=th.root;const g1=AC.createGain();g1.gain.value=0.016;BGM.d1.connect(g1);g1.connect(BGMG);BGM.d1.start()}if(!BGM.d2){BGM.d2=AC.createOscillator();BGM.d2.type='triangle';BGM.d2.frequency.value=th.chord;const g2=AC.createGain();g2.gain.value=0.01;BGM.d2.connect(g2);g2.connect(BGMG);BGM.d2.start()}}
function xBGM(){if(!BGM)return;if(BGM.d1){BGM.d1.stop();BGM.d1=null}if(BGM.d2){BGM.d2.stop();BGM.d2=null}BGM=null}

// FX
let shX=0,shY=0,shT=0;function shake(d){shT=Math.max(shT,d)}
let hs=0;
// Hitstop — frame freeze on impact for better game feel
let hitStopT=0;function triggerHitstop(frames){hitStopT=Math.max(hitStopT,frames||2)}
// Damage flash — red vignette when player is hurt
let damageFlashT=0;
// Time slow — focus mechanic (Katana ZERO style)
let timeScale=1,focus=100,focusMax=100;
// Meta-progression — permanent unlocks across runs
const META={souls:0,unlocked:new Set(['saberRange','saberDmg','atkSpeed','maxHp','moveSpeed']),startingHPBonus:0,extraChoices:0,passiveIncome:0};
function loadMeta(){try{const j=localStorage.getItem('ninja_meta');if(j){const d=JSON.parse(j);META.souls=d.souls||0;META.startingHPBonus=d.startingHPBonus||0;META.extraChoices=d.extraChoices||0;META.passiveIncome=d.passiveIncome||0;if(d.unlocked)META.unlocked=new Set(d.unlocked)}}catch(e){}}
function saveMeta(){try{localStorage.setItem('ninja_meta',JSON.stringify({souls:META.souls,unlocked:[...META.unlocked],startingHPBonus:META.startingHPBonus,extraChoices:META.extraChoices,passiveIncome:META.passiveIncome}))}catch(e){}}
loadMeta();
const PT=[];function ps(x,y,n,c,sp,l,sz){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=sp*(0.4+Math.random()*0.8);PT.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-Math.random()*2,l:l||18,c,s:sz||(1+Math.random()*3)})}}
const PR=[];function sp(x,y,vx,vy,d,c,w,h,lf,en,pierce){PR.push({x,y,vx,vy,d,c,w:w||4,h:h||4,lf:lf||60,en:!!en,pierce:pierce||0})}
const JR=[];const BOULDERS=[];
function addJR(x,y,lvl){const c=['#ffffff','#aaddff','#ffcc88','#ff6688'][lvl];JR.push({x,y,r:4,l:14,ml:14,c})}
function hitR(x1,y1,w1,h1,x2,y2,w2,h2){return x1<x2+w2&&x1+w1>x2&&y1<y2+h2&&y1+h1>y2}
function lerp(a,b,t){return a+(b-a)*t}
