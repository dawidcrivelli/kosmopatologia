// ---------- systems ----------
function power(){let prod=G.bonusPow,cons=0;for(const m of G.mods){if(m.broken)continue;const p=MOD[m.t].pow;if(p>0)prod+=p*lm(m);else cons-=p;}
  G.prod=prod;G.cons=cons;G.pr=cons>0?Math.min(1,prod/cons):1;}
function runSystems(dt){const L=LEVELS[G.lvl];
  let prod=0;for(const m of G.mods)if(m.t==='o2'&&!m.broken)prod+=1.4*lm(m)*G.pr;
  const use=realCrew().length*.11+G.breaches.size*.9+G.fires.size*.15;G.o2=clamp(G.o2+(prod-use)*dt,0,100);
  if(G.o2<=0)for(const c of [...G.crew])hurtCrew(c,1.6*dt);
  if(G.o2<25&&!G.o2warn){G.o2warn=true;showTip('o2');banner('🫁 Kończy się tlen');addLog('Tlen się kończy. Załoga oddycha oszczędnie i mówi tylko najważniejsze słowa, głównie brzydkie. Załataj dziury albo zbuduj drugie podtrzymanie życia.');}
  if(G.o2>50)G.o2warn=false;
  if(G.pr<.75&&!G.powwarn&&G.t>3){G.powwarn=true;showTip('power');banner('⚡ Za mało prądu');addLog('Prądu jest za mało: wszystko działa słabiej, a światła mrugają jak w horrorze. Postaw drugi reaktor albo ulepsz ten, który jest.');}
  if(G.pr>=1)G.powwarn=false;
  for(const [k] of G.breaches){const [x,y]=unkey(k);if(R()<dt*8)part(IX(x+.5,y+.5)+rnd(-14,14),IY(x+.5,y+.5)+rnd(-7,7),4,0,0,-6,pick(['#8a8f99','#c0c4cc','#5a5f69']),1,{g:0,life:.6});}
  let smax=0,sreg=0;for(const m of G.mods)if(m.t==='shield'&&!m.broken){smax+=35*lm(m)*G.pr;sreg+=3*lm(m)*G.pr;}
  G.smax=smax;G.shield=smax>0?Math.min(smax,G.shield+sreg*dt):0;
  let spd=0;for(const m of G.mods)if(m.t==='engine'&&!m.broken)spd+=.16*(1+.3*(m.lvl-1));
  let mul=G.pr;if(G.engBuf){mul*=G.engBuf.m;G.engBuf.t-=dt;if(G.engBuf.t<=0)G.engBuf=null;}
  if(G.kurdel&&G.kurdel.ph!=='app')mul=0;
  spd*=mul;G.warp=spd;G.prog=Math.min(L.dist,G.prog+spd*dt);G.money+=spd*dt*11;G.starOff+=spd*dt*8;
  for(const m of G.mods){if(m.broken)continue;if(m.t==='lab')G.money+=1.5*lm(m)*G.pr*dt;if(m.t==='sepul')G.money+=2.5*lm(m)*G.pr*dt;}
  const ws=G.mods.filter(m=>m.t==='workshop'&&!m.broken).length;
  if(G.hull>0&&G.hull<100)G.hull=Math.min(100,G.hull+(.04+.08*Math.min(2,ws))*dt);
  for(const m of G.mods){m.anim+=dt;
    if(m.hive){m.eggT=(m.eggT||8)-dt;if(m.eggT<=0){m.eggT=16;hatch(m);}}
    if(m.t==='sentry'&&!m.broken)runSentry(m,dt);
    if(m.broken){m.bt+=dt;if(m.hot>0){m.hot-=dt;if(m.hot<=0)explode(m);}
      if(R()<dt*3){const sp=SPR.mod[m.t];part(IX(m.gx,m.gy)+rnd(-sp.w/4,sp.w/4),IY(m.gx,m.gy)+sp.w/4+rnd(-4,4),rnd(10,sp.H*.6),rnd(-3,3),rnd(-2,2),rnd(6,14),'#4a4650',2,{g:-4,life:rnd(1,2),smoke:1});}
      if(R()<dt*2)burst(IX(m.gx,m.gy),IY(m.gx,m.gy)+SPR.mod[m.t].w/4-10,3,14,'#ffe070');
      continue;}
    const wr=.3*L.inten*(1-Math.min(.45,ws*.2))*(1-.22*(m.lvl-1))*(m.t==='quarters'?.4:1);
    m.wear=Math.min(100,m.wear+wr*dt);if(m.wear>65&&R()<dt*(m.wear-65)/260)breakMod(m,'wear');
    if(m.t==='turret')runTurret(m,dt);}}
function update(dt){G.t+=dt;G.day=1+Math.floor(G.t/40);
  power();runSystems(dt);
  for(const c of [...G.crew])if(!c.dead)runCrew(c,dt);
  for(const a of G.aliens)if(!a.dead)runAlien(a,dt);G.aliens=G.aliens.filter(a=>!a.dead);
  runExt(dt);runFires(dt);runSpecial(dt);runAliensX(dt);runEvents(dt);runFx(dt);checkEnd();}
function checkEnd(){if(!G.running||G.demo)return;const L=LEVELS[G.lvl];
  if(G.hull<=0){G.hull=0;gameOver('Kadłub rozpadł się na bardzo filozoficzne kawałki. Fragmenty dziennika dryfują w stronę najbliższej mgławicy.');return;}
  if(!realCrew().length){gameOver('Na pokładzie nie został nikt, kto mógłby prowadzić dziennik. Ten wpis napisała pralka.');return;}
  if(G.prog>=L.dist)levelDone();}
