// ---------- sound (procedural, WebAudio) ----------
const SND={ctx:null,on:true,master:null,noise:null,last:{},amb:null};
try{SND.on=localStorage.getItem('kosmopat_snd')!=='0';}catch(e){}
function audioInit(){
  if(SND.ctx){if(SND.ctx.state==='suspended')SND.ctx.resume();return;}
  try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const c=new A();SND.ctx=c;
    SND.master=c.createGain();SND.master.gain.value=SND.on?.7:0;
    const comp=c.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;SND.master.connect(comp);comp.connect(c.destination);
    const b=c.createBuffer(1,c.sampleRate,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;SND.noise=b;
    startAmb();}catch(e){SND.ctx=null;}}
function setSound(on){SND.on=on;try{localStorage.setItem('kosmopat_snd',on?'1':'0');}catch(e){}
  if(SND.master)SND.master.gain.setTargetAtTime(on?.7:0,SND.ctx.currentTime,.05);}
function tone(type,f0,f1,dur,vol,delay,dest){const c=SND.ctx,t=c.currentTime+(delay||0);const o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+Math.min(.015,dur/4));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(dest||SND.master);o.start(t);o.stop(t+dur+.05);return o;}
function noise(dur,vol,ftype,f0,f1,q,delay){const c=SND.ctx,t=c.currentTime+(delay||0);const s=c.createBufferSource();s.buffer=SND.noise;s.loop=true;
  const f=c.createBiquadFilter();f.type=ftype||'lowpass';f.frequency.setValueAtTime(f0||1000,t);if(f1)f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);f.Q.value=q||1;
  const g=c.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(SND.master);s.start(t,R()*.5);s.stop(t+dur+.05);}
const SLIM={pulse:.05,sentry:.08,ping:.2,screech:.25,leap:.2,egg:.3,siren:2.5,shot:.07,turret:.09,hit:.05,splat:.12,hurt:.15,blab:.12,blabC:.12,blabA:.25,hull:.12,spark:.25,fire:1.5,click:.03,shield:.1,met:.3};
function sfx(n,arg){if(!SND.ctx||!SND.on||!G||G.demo)return;const now=SND.ctx.currentTime;if(SND.last[n]&&now-SND.last[n]<(SLIM[n]||.06))return;SND.last[n]=now;
  try{switch(n){
  case 'shot':tone('square',1100,260,.09,.035);break;
  case 'shotG':tone('sawtooth',700,140,.12,.04);noise(.06,.03,'highpass',3000);break;
  case 'turret':tone('sawtooth',520,110,.13,.045);noise(.08,.05,'bandpass',1800,600,2);break;
  case 'hit':noise(.09,.07,'lowpass',900,200);tone('sine',190,80,.09,.05);break;
  case 'splat':noise(.3,.14,'bandpass',500,140,1.5);tone('sine',140,40,.25,.12);break;
  case 'hurt':tone('square',330,190,.12,.04);break;
  case 'boom':noise(1.4,.55,'lowpass',1400,60);tone('sine',70,28,1,.45);tone('triangle',110,40,.6,.2,.05);break;
  case 'hull':noise(.35,.3,'lowpass',500,80);tone('sine',90,40,.3,.25);break;
  case 'shield':tone('sine',1400,600,.18,.06);tone('sine',2100,900,.12,.03,.02);break;
  case 'clank':tone('triangle',240,110,.16,.12);tone('triangle',180,90,.14,.09,.11);noise(.25,.06,'highpass',4000,2000);break;
  case 'spark':noise(.12,.04,'highpass',5000,3000);break;
  case 'fix':tone('square',660,660,.07,.035);tone('square',990,990,.1,.035,.08);break;
  case 'fire':noise(1.2,.07,'bandpass',700,300,.8);break;
  case 'alarm':for(let i=0;i<3;i++){tone('square',880,880,.16,.04,i*.36);tone('square',660,660,.16,.04,i*.36+.18);}break;
  case 'banner':tone('triangle',520,780,.16,.06);break;
  case 'build':noise(.2,.15,'lowpass',500,120);tone('sine',220,110,.18,.12);tone('square',880,880,.05,.02,.2);break;
  case 'weld':for(let i=0;i<5;i++)noise(.09,.07,'highpass',3500,2500,1,i*.11);tone('sine',180,90,.4,.1,.5);break;
  case 'click':tone('square',1300,1300,.025,.02);break;
  case 'coin':tone('square',988,988,.06,.03);tone('square',1319,1319,.12,.03,.06);break;
  case 'grav':noise(1.1,.12,'bandpass',180,1600,3);tone('sine',90,240,1,.06);break;
  case 'vortex':{const o=tone('sine',300,900,1.4,.08);tone('sine',305,880,1.4,.06);noise(1.2,.05,'bandpass',400,2400,6);break;}
  case 'scare':tone('sawtooth',220,200,1.3,.14);tone('sawtooth',233,210,1.3,.14);tone('sawtooth',311,290,1.3,.1);noise(.9,.25,'bandpass',900,300,2);break;
  case 'kurdel':tone('sawtooth',48,36,2.2,.25);tone('sawtooth',51,38,2.2,.2);noise(2,.1,'lowpass',200,80);break;
  case 'sneeze':noise(.15,.15,'bandpass',800,1600,2);noise(.6,.4,'lowpass',3000,200,1,.18);tone('sine',300,80,.5,.2,.18);break;
  case 'psych':[523,659,784,1047].forEach((f,i)=>tone('sine',f,f,.35,.06,i*.12));break;
  case 'unpsych':[1047,784,622,466].forEach((f,i)=>tone('sawtooth',f,f*.97,.3,.06,i*.1));break;
  case 'chime':tone('sine',1568,1568,.4,.05);tone('sine',2093,2093,.5,.03,.06);break;
  case 'swarm':noise(1.5,.08,'highpass',6000,9000,1);break;
  case 'win':[523,659,784,1047,784,1047].forEach((f,i)=>tone('square',f,f,.16,.04,i*.13));break;
  case 'lose':[392,330,262,196].forEach((f,i)=>tone('triangle',f,f*.98,.35,.08,i*.25));break;
  case 'met':noise(.5,.06,'bandpass',300,900,2);break;
  case 'pulse':tone('square',180,90,.06,.06);noise(.05,.08,'highpass',2500,1200);break;
  case 'sentry':tone('square',240,120,.05,.045);noise(.04,.06,'highpass',3000);break;
  case 'reload':noise(.05,.08,'bandpass',2000,1500,4);noise(.05,.08,'bandpass',1500,1000,4,.12);tone('square',900,900,.04,.03,.22);break;
  case 'screech':tone('sawtooth',1400,600,.35,.07);tone('sawtooth',1480,520,.35,.05);noise(.3,.08,'bandpass',2500,1200,3);break;
  case 'leap':noise(.25,.1,'bandpass',3000,6000,4);tone('sawtooth',600,1400,.2,.04);break;
  case 'egg':noise(.35,.12,'lowpass',600,150,2);tone('sine',120,60,.3,.08);break;
  case 'ping':{const d=arg===undefined?5:arg;const f=1500+Math.max(0,6-d)*120;tone('sine',f,f,.12,.08);tone('sine',f*.5,f*.5,.18,.03,.02);break;}
  case 'siren':tone('sawtooth',440,700,.6,.025);tone('sawtooth',700,440,.6,.025,.6);break;
  case 'grenade':noise(.15,.05,'highpass',2000);tone('square',300,600,.12,.03);break;
  case 'salvo':for(let i=0;i<4;i++){tone('sawtooth',300,60,.3,.08,i*.06);noise(.25,.15,'lowpass',2000,200,1,i*.06);}break;
  case 'decomp':noise(1.8,.45,'bandpass',1200,120,1.2);tone('sine',60,30,1.2,.3);break;
  case 'blab':case 'blabC':case 'blabA':{const base=n==='blabA'?110:n==='blabC'?520:260+R()*140;const k=3+Math.floor(R()*4);
    for(let i=0;i<k;i++){const f=base*(.8+R()*.5);tone(n==='blabA'?'sawtooth':'square',f,f*(R()<.5?1.15:.85),.06,n==='blabA'?.035:.02,i*.075);}
    if(n==='blabA')noise(.18,.04,'bandpass',1200,500,3);break;}
  }}catch(e){}}
function startAmb(){const c=SND.ctx;const g=c.createGain();g.gain.value=.0001;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=220;f.Q.value=4;
  const o1=c.createOscillator(),o2=c.createOscillator(),lfo=c.createOscillator(),lg2=c.createGain();o1.type='sawtooth';o2.type='sawtooth';o1.frequency.value=55;o2.frequency.value=55.6;
  lfo.frequency.value=.07;lg2.gain.value=90;lfo.connect(lg2);lg2.connect(f.frequency);o1.connect(f);o2.connect(f);f.connect(g);g.connect(SND.master);o1.start();o2.start();lfo.start();
  SND.amb={g,f};}
function ambTick(){if(!SND.amb||!SND.ctx)return;const t=SND.ctx.currentTime;let v=.0001;
  if(G&&!G.demo&&!G.modal&&G.running){v=.035+(G.warp>0?.015:0)+(G.blackout>0?.03:0);if(G.kurdel&&G.kurdel.ph==='in')v+=.04;}
  if(UI.paused)v=.0001;SND.amb.g.gain.setTargetAtTime(v,t,.4);if(G&&G.alert&&!G.fakeBlips&&!UI.paused&&!G.modal)sfx('siren');}
addEventListener('pointerdown',()=>audioInit(),{capture:true});
