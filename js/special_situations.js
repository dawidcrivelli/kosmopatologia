// ---------- special situations ----------
function runSpecial(dt){
  const g=G.grav;
  if(g){g.t-=dt;
    if(g.type==='side'){g.slide-=dt;if(g.slide<=0){g.slide=1.3;let moved=false;
      for(const u of [...G.crew,...G.aliens]){const nx=(u.x|0)+g.dir[0],ny=(u.y|0)+g.dir[1];if(walk(nx,ny)){u.x+=g.dir[0];u.y+=g.dir[1];u.path=null;moved=true;}}
      if(moved)G.shake=Math.max(G.shake,.25);}}
    if(g.type==='float'&&R()<dt*6){const t=pick(G.tiles);part(IX(t.x+.5,t.y+.5),IY(t.x+.5,t.y+.5),rnd(2,12),rnd(-3,3),rnd(-2,2),rnd(2,5),pick(['#e8d0a0','#c0c4cc','#d07a2a']),2,{g:0,life:3});}
    if(g.t<=0){addLog(GRAV[g.type].e);if(g.type==='ceiling')for(const c of [...G.crew])hurtCrew(c,4);G.grav=null;}}
  const k=G.kurdel;
  if(k){if(k.ph==='app'){k.t-=dt;if(k.t<=0){k.ph='in';sfx('kurdel');G.shake=1;G.flash=.4;banner('🐋 Połknięci!');
        addLog('Zostaliśmy połknięci. W środku kurdla jest ciepło, wilgotno i bardzo źle pachnie. Wieżyczki strzelają w żołądek, żeby kurdel kichnął.');}}
    else if(k.ph==='in'){k.hp-=dt*2.5;if(G.shield>0)G.shield=Math.max(0,G.shield-dt*3);else G.hull-=dt*.45;
      k.spawn-=dt;if(k.spawn<=0){k.spawn=9;const e=edgeWalk();if(e){spawnAlien('mlask',e[0],e[1],.3);}}
      if(R()<dt*2)G.shake=Math.max(G.shake,.15);
      if(k.hp<=0){k.ph='out';sfx('sneeze');k.t=3;G.shake=1;G.flash=.9;G.money+=250;banner('🤧 Kurdel kichnął!');
        addLog('Kurdel kichnął! Wylecieliśmy z prędkością, za którą należałby się mandat. Razem z nami wyleciały monety poprzednich ofiar. (+₵250)');}}
    else{k.t-=dt;if(k.t<=0)G.kurdel=null;}}
  const ps=G.psych;
  if(ps){ps.t-=dt*(G.mods.some(m=>m.t==='medbay'&&!m.broken)?1.3:1);if(ps.t<=0)endPsych();}
  const sw=G.swarm;
  if(sw){sw.t-=dt;sw.a+=dt*.35;sw.x=G.cx+Math.cos(sw.a)*6;sw.y=G.cy+Math.sin(sw.a)*6;sw.cd-=dt;
    if(sw.cd<=0){sw.cd=5.5;if(G.shield>5){G.shield=Math.max(0,G.shield-18);G.shieldFlash=.5;}
      else{const v=G.crew.filter(c=>c.confused<=0),nc=G.crew.length-v.length;if(v.length&&nc<Math.floor(G.crew.length/2)){const c=pick(v);c.confused=9;c.cmd=null;c.task={k:'idle'};say(c,pk(TXT.confused));}}}
    if(sw.t<=0){G.swarm=null;addLog('Chmura odleciała. Załoga powoli przypomina sobie, jak się nazywa. Ktoś twierdzi, że zawsze był pralką.');}}
  const d=G.dragon;
  if(d){d.t-=dt;d.p=Math.min(1,d.p+dt*.02);d.a+=dt*.25;d.x=G.cx+Math.cos(d.a)*9;d.y=G.cy+Math.sin(d.a)*9;
    if(d.p>=.5){d.bite-=dt;if(d.bite<=0){d.bite=4;const e=pick(G.edge);hullHit(3+5*d.p,e[0],e[1],.1);}}
    if(d.p<=0){G.dragon=null;G.money+=200;addLog('Smok przestał być prawdopodobny. Zostawił po sobie łuskę wartą 200 kredytów, co jest wysoce nieprawdopodobne.');}
    else if(d.t<=0){G.dragon=null;addLog('Smok uznał nas za zbyt nieprawdopodobnych i odleciał.');}}}
function endPsych(){if(!G.psych)return;G.psych=null;sfx('unpsych');sfx('scare');G.scare={t:.5};G.shake=.8;G.flash=.5;banner('😱 Otrzeźwienie');
  addLog('Psychemikalia przestały działać. To nie były króliczki. Pod kocem nie było pikniku. Kadłub nie miał stu procent.');
  for(const e of G.psychHidden)G.log.unshift(e);G.psychHidden=[];renderLogMini();}
function observeDragon(){const d=G.dragon;if(!d)return;d.p=Math.max(0,d.p-.12);sfx('chime');burst(IX(d.x,d.y),IY(d.x,d.y)-30,8,20,'#ffd0ff');
  if(R()<.5)toast(pick(['Obserwujesz smoka. Smok czuje się obserwowany.','Prawdopodobieństwo smoka maleje.','Smok robi się mniej pewny siebie.']));}
function nMachine(m){if(G.ncd>0){toast('Maszyna wciąż się zastanawia ('+Math.ceil(G.ncd)+' s).');return;}
  if(m.broken){toast('Maszyna jest zepsuta. Zrobiła Niesprawność.');return;}G.ncd=40;const r=R();
  if(r<.2){for(const o of G.mods)if(o.broken)fixMod(o);addLog('Maszyna na N zrobiła Naprawę. Wszystko działa. To podejrzane.');}
  else if(r<.38){G.money+=250;addLog('Maszyna na N zrobiła Nagrodę. 250 kredytów, w drobnych.');}
  else if(r<.54){for(const c of G.crew)c.hp=100;addLog('Maszyna na N zrobiła Naleśniki. Załoga zjadła i wyzdrowiała.');}
  else if(r<.68){const t=randomWalkable();const a=spawnAlien('rhino',t.x,t.y,0);a.life=40;addLog('Maszyna na N zrobiła Nosorożca. Nikt nie wie, co z nim zrobić. Nosorożec też nie.');}
  else if(r<.8){const t=randomWalkable();spawnAlien('mlask',t.x,t.y,.3);spawnAlien('mlask',t.x,t.y,1.2);addLog('Maszyna na N zrobiła Napastników. To było zupełnie niepotrzebne.');}
  else if(r<.9){if(!EV.grav('float'))G.money+=100;addLog('Maszyna na N zrobiła Nieważkość.');}
  else{if(!G.starsGone){G.starsGone=1;addLog('Maszyna na N zrobiła Nic. Z nieba zniknęło kilka gwiazd. Lepiej tego nie powtarzać.');}else addLog('Maszyna na N znów zrobiła Nic. Tym razem nikt nie zauważył.');}
  burst(IX(m.gx,m.gy),IY(m.gx,m.gy)+10,16,24,'#ffe08a');}
