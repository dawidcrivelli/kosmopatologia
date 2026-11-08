// ---------- new combat: aliens, hive, sentry, abilities, tracker ----------
function nearestCrew(a,maxD,filter){let best=null,bd=maxD;for(const c of G.crew){if(filter&&!filter(c))continue;const d=dist(a,c);if(d<bd){bd=d;best=c;}}return best;}
function alienSpecial(a,dt){
  if(a.stun>0){a.stun-=dt;a.moving=false;return true;}
  if(a.t==='skok'){
    if(a.latch){const v=a.latch;if(v.dead||!G.crew.includes(v)){a.latch=null;unstick(a);}else{a.x=v.x;a.y=v.y;a.lift=11;a.moving=true;a.anim+=dt*6;return true;}}
    if(a.leap){const L=a.leap;L.t+=dt;const q=Math.min(1,L.t/L.dur);a.x=L.x0+(L.x1-L.x0)*q;a.y=L.y0+(L.y1-L.y0)*q;a.lift=Math.sin(q*Math.PI)*16;
      if(q>=1){a.lift=0;const v=L.v;a.leap=null;
        if(v&&!v.dead&&G.crew.includes(v)&&dist(a,v)<1.1&&!v.latched&&!v.clone){a.latch=v;v.latched=a;v.cmd=null;v.task={k:'idle'};v.burst=0;say(v,pk(TXT.latched));showTip('skok');}
        else unstick(a);}
      return true;}
    a.lift=0;a.leapCd=(a.leapCd===undefined?1.2:a.leapCd)-dt;
    if(a.leapCd<=0){const v=nearestCrew(a,3.6,c=>!c.latched&&!c.clone);if(v){a.leap={t:0,dur:.42,x0:a.x,y0:a.y,x1:v.x,y1:v.y,v};a.leapCd=3.5;a.path=null;sfx('leap');
      const s=(v.x-a.x)-(v.y-a.y);if(Math.abs(s)>.05)a.face=s>0?1:-1;return true;}}
    return false;}
  if(a.t==='mimik'&&a.disg){a.revealT-=dt;if(a.revealT<=0){unmask(a);return true;}
    if(!a.path||!a.path.length){if(R()<dt*.6)a.path=randomWalk(a);}moveUnit(a,1.3,dt);sayMaybe(a,TXT.mimic,.08);return true;}
  if(a.t==='gosc'){a.life-=dt;if(a.life<=0||!a.follow||a.follow.dead||!G.crew.includes(a.follow)){a.dead=true;burst(IX(a.x,a.y),IY(a.x,a.y),10,12,'#dfe8ff');
      if(!G.guestEndLog){G.guestEndLog=1;addLog('Goście zniknęli tak samo, jak się pojawili. Na koi ktoś zostawił sukienkę, której nikt z nas nigdy nie miał.');}return true;}
    const v=a.follow;const d=dist(a,v);if(d<1.7)v.hauntT=.4;
    if(d>1.2){a.repath=(a.repath||0)-dt;if(!a.path||!a.path.length||a.repath<=0){a.repath=.8;const gx=v.x|0,gy=v.y|0;a.path=bfs(a.x|0,a.y|0,(x,y)=>Math.abs(x-gx)+Math.abs(y-gy)<=1);}moveUnit(a,ALIEN.gosc.sp,dt);}
    else{a.moving=false;a.path=null;const s=(v.x-a.x)-(v.y-a.y);if(Math.abs(s)>.05)a.face=s>0?1:-1;}
    sayMaybe(a,TXT.ghost,.1);return true;}
  if(a.t==='krolowa'){a.eggT=(a.eggT===undefined?6:a.eggT)-dt;if(a.eggT<=0){a.eggT=9;const s=spawnAlien('skok',a.x|0,a.y|0,.4);s.x=a.x;s.y=a.y;sfx('egg');say(a,pk(TXT.alien.krolowa));G.shake=Math.max(G.shake,.3);}
    return false;}
  return false;}
function unmask(a){if(!a.disg)return;a.disg=false;a.name=null;sfx('screech');G.shake=.6;G.alarm=6;banner('👤 To nie był człowiek!');
  burst(IX(a.x,a.y),IY(a.x,a.y),14,20,'#8ab0c8');addLog('Jeden z „członków załogi” rozciągnął się, zmienił kolor i przestał udawać. Ocean jest dobry w kopiowaniu, ale zapomniał o nazwisku.');}
function tapMimic(a){a.stun=2;a.hp-=30;G.money+=50;unmask(a);toast('Zdemaskowany! +₵50');}
function makeHive(m){m.hive=true;m.eggT=8;breakMod(m,'silent');sfx('egg');banner('🥚 Gniazdo: '+MOD[m.t].n);
  addLog('Obcy oblepili moduł ('+MOD[m.t].n.toLowerCase()+') czymś lśniącym i złożyli jaja. Moduł nie działa, a jaja zaczynają drgać.');showTip('hive');}
function hatch(m){const s=MOD[m.t].s;for(let y=m.gy-1;y<=m.gy+s;y++)for(let x=m.gx-1;x<=m.gx+s;x++)if(adjMod(m,x,y)){spawnAlien('skok',x,y,.2);sfx('egg');
  burst(IX(x+.5,y+.5),IY(x+.5,y+.5),8,12,'#c8e830');return;}}
function runSentry(m,dt){m.cd-=dt*Math.max(.3,G.pr);const tx=m.gx+.5,ty=m.gy+.5;let tg=null,bd=4.2;
  for(const a of G.aliens){if(!hostile(a))continue;const d=Math.hypot(a.x-tx,a.y-ty);if(d<bd){bd=d;tg=a;}}
  if(!tg)return;const x0=IX(tx,ty),y0=IY(tx,ty)-11,x1=IX(tg.x,tg.y),y1=IY(tg.x,tg.y)-5;m.ang=Math.atan2(y1-y0,x1-x0);
  if(m.cd>0)return;if(m.ammo<=0){if(!m.empty){m.empty=1;toast('Działko strażnicze: brak amunicji!');}return;}m.empty=0;
  m.cd=.13;m.ammo--;sfx('sentry');const mx=x0+Math.cos(m.ang)*9,my=y0+Math.sin(m.ang)*9;
  beam(mx,my,x1+rnd(-2,2),y1+rnd(-2,2),'#ffe9a0');G.flashes.push({x:mx,y:my,t:.05});part(x0,y0,6,rnd(-8,8),rnd(-5,5),rnd(10,20),'#d8b040',1,{g:90,life:.5,limb:1});
  hitAlien(tg,2.6*lm(m));}
function spawnBolid(){const a=R()*Math.PI*2,r=22,t=pick(G.edge);G.ext.push({k:'bolid',id:++G.nid,x:G.cx+Math.cos(a)*r,y:G.cy+Math.sin(a)*r,tx:t[0]+.5,ty:t[1]+.5,hp:150+G.lvl*30,armor:.75,sp:1.5});
  sfx('kurdel');banner('☄ Bolid na kursie kolizyjnym');showTip('bolid');}
function bolidHit(e){const x=e.tx|0,y=e.ty|0;G.shield=Math.max(0,G.shield-60);G.hull-=G.lvl===0?14:22;G.shake=1;G.flash=.5;boom(IX(x+.5,y+.5),IY(x+.5,y+.5),80);
  if(walk(x,y))addBreach(x,y);for(let i=0;i<3;i++)addFire(x+ri(-1,1),y+ri(-1,1),.6);
  for(const c of [...G.crew])if(Math.hypot(c.x-x,c.y-y)<2)hurtCrew(c,20);addLog('Bolid trafił w burtę. Statek zadzwonił jak dzwon, tylko mniej melodyjnie.');}

// abilities
const ABIL={grenade:{i:'💣',n:'Granat',cd:18,ul:0,h:'Granat: dotknij miejsca na pokładzie.'},salvo:{i:'🎯',n:'Salwa',cd:14,ul:0,h:'Salwa: dotknij statku obcych, meteoru albo bolidu.'},
  sluza:{i:'🌬',n:'Śluza',cd:30,ul:1,h:'Śluza: dotknij pola przy samej burcie.'}};
let abilKey='';
function renderAbil(){const el=$('#abil');if(!G||G.demo){if(abilKey){el.innerHTML='';abilKey='';}return;}
  const ks=Object.keys(ABIL).filter(k=>ABIL[k].ul<=G.lvl);const kk=ks.join(',');
  if(kk!==abilKey){abilKey=kk;el.innerHTML=ks.map(k=>`<button class="ab" data-ab="${k}" aria-label="${ABIL[k].n}"><span class="ai">${ABIL[k].i}</span><span class="at" id="ab_${k}">${ABIL[k].n}</span></button>`).join('');}
  for(const k of ks){const b=el.querySelector(`[data-ab="${k}"]`),t=$('#ab_'+k);const cd=G.cd[k];const txt=cd>0?Math.ceil(cd)+' s':ABIL[k].n;if(t.textContent!==txt)t.textContent=txt;
    b.classList.toggle('cool',cd>0);b.classList.toggle('armed',UI.ability===k);}}
$('#abil').addEventListener('click',e=>{const b=e.target.closest('[data-ab]');if(!b||!G||G.modal)return;const k=b.dataset.ab;sfx('click');
  if(UI.ability===k){UI.ability=null;hideHint();renderLogMini();return;}
  if(G.cd[k]>0){toast(ABIL[k].n+': gotowe za '+Math.ceil(G.cd[k])+' s.');return;}
  if(k==='salvo'&&!G.mods.some(m=>m.t==='turret'&&!m.broken)){toast('Salwa wymaga działającej wieżyczki.');return;}
  UI.ability=k;UI.build=null;UI.sel=null;closeSheet();showHint(ABIL[k].h,true);});
function useAbil(k){G.cd[k]=ABIL[k].cd;UI.ability=null;hideHint();renderLogMini();}
function abilityTap(px,py,tx,ty,gx,gy){const k=UI.ability;
  if(k==='grenade'){if(!isHull(gx,gy)){toast('Rzucaj na pokład statku.');return;}
    const from=realCrew().sort((p,q)=>Math.hypot(p.x-tx,p.y-ty)-Math.hypot(q.x-tx,q.y-ty))[0];const fx=from?from.x:G.cx,fy=from?from.y:G.cy;
    if(from)say(from,'Granat!',1.2);G.nades.push({x0:fx,y0:fy,x1:tx,y1:ty,t:0,dur:.65});sfx('grenade');useAbil(k);return;}
  if(k==='salvo'){let tg=null;
    if(G.kurdel&&G.kurdel.ph==='in')tg='kurdel';
    else{let bd=80*DPR;for(const e of G.ext){const ex=sx(IX(e.x,e.y)),ey=sy(IY(e.x,e.y)-18);const d=Math.hypot(px-ex,py-ey);if(d<bd){bd=d;tg=e;}}}
    if(!tg){toast('Dotknij statku obcych, meteoru albo bolidu.');return;}salvo(tg);useAbil(k);return;}
  if(k==='sluza'){const k2=key(gx,gy);if(!(G.breaches.has(k2)||(isHull(gx,gy)&&G.edge.some(([x,y])=>x===gx&&y===gy)))){toast('Dotknij pola przy samej burcie.');return;}
    sluza(gx,gy);useAbil(k);return;}}
function salvo(tg){const ts=G.mods.filter(m=>m.t==='turret'&&!m.broken);sfx('salvo');G.shake=Math.max(G.shake,.5);
  for(const m of ts){const x0=IX(m.gx+.5,m.gy+.5),y0=IY(m.gx+.5,m.gy+.5)-13;let x1,y1;
    if(tg==='kurdel'){const a=R()*6.28;x1=IX(G.cx+Math.cos(a)*9,G.cy+Math.sin(a)*9);y1=IY(G.cx+Math.cos(a)*9,G.cy+Math.sin(a)*9)-16;}else{x1=IX(tg.x,tg.y);y1=IY(tg.x,tg.y)-18;}
    m.ang=Math.atan2(y1-y0,x1-x0);G.beams.push({x1:x0,y1:y0,x2:x1,y2:y1,col:'#ff9a3a',t:.25,w:2});G.flashes.push({x:x0,y:y0,t:.12});}
  const dmg=60*ts.length;
  if(tg==='kurdel'){G.kurdel.hp-=dmg*1.5;G.flash=.3;}else{tg.hp-=dmg;boom(IX(tg.x,tg.y),IY(tg.x,tg.y)-18,40);if(tg.hp<=0)extDie(tg);}}
function sluza(x,y){const cx=x+.5,cy=y+.5;let ox=cx-G.cx,oy=cy-G.cy;const ol=Math.hypot(ox,oy)||1;ox/=ol;oy/=ol;
  sfx('decomp');G.shake=1;G.flash=.25;G.o2=Math.max(0,G.o2-18);addBreach(x,y);let n=0;
  for(const a of [...G.aliens]){if(a.dead)continue;const d=Math.hypot(a.x-cx,a.y-cy);if(d>3.3)continue;
    if(a.t==='krolowa'){hitAlien(a,260);continue;}
    if(a.latch){a.latch.latched=null;a.latch=null;}
    a.dead=true;n++;if(!a.friendly){G.money+=ALIEN[a.t].bounty;G.kills++;}
    const wx=IX(a.x,a.y),wy=IY(a.x,a.y);for(let i=0;i<10;i++)part(wx,wy,8,(IX(ox,oy))*rnd(6,12)+rnd(-8,8),(IY(ox,oy))*rnd(6,12)+rnd(-4,4),rnd(5,20),pick(['#c98a7c','#dfe8ff','#9a0c18','#c8e830']),2,{g:0,life:1.2});}
  for(const c of [...G.crew]){const d=Math.hypot(c.x-cx,c.y-cy);if(d<3)hurtCrew(c,4+12*(1-d/3));}
  const wx=IX(cx,cy),wy=IY(cx,cy);for(let i=0;i<40;i++)part(wx+rnd(-20,20),wy+rnd(-10,10),rnd(2,14),IX(ox,oy)*rnd(4,10),IY(ox,oy)*rnd(4,10),rnd(-5,5),pick(['#c0c4cc','#8a8f99','#ffffff']),1,{g:0,life:1.4});
  if(!G.sluzaLog){G.sluzaLog=1;addLog('Otworzyłem śluzę. Wszystko, co nie było przykręcone, poleciało w kosmos. Kilka rzeczy, które były przykręcone, też.');}
  if(n)toast('W kosmos: '+n);}
function ripOff(c){const a=c.latched;if(!a)return;c.latched=null;a.latch=null;hitAlien(a,999);say(c,pk(TXT.rescue),1.5);sfx('splat');toast('Zerwane!');}

function runAliensX(dt){
  for(const k in G.cd)G.cd[k]=Math.max(0,G.cd[k]-dt);
  for(const n of G.nades){n.t+=dt;if(n.t>=n.dur&&!n.done){n.done=true;const x=n.x1,y=n.y1;boom(IX(x,y),IY(x,y),55);G.shake=Math.max(G.shake,.7);
    for(const a of [...G.aliens]){const d=Math.hypot(a.x-x,a.y-y);if(d<2.4&&!a.friendly)hitAlien(a,85*(1-d/3.2));}
    for(const c of [...G.crew]){const d=Math.hypot(c.x-x,c.y-y);if(d<1.6)hurtCrew(c,18);}
    if(R()<.3)addFire(x|0,y|0,.4);for(let i=0;i<4;i++)decal(IX(x,y)+rnd(-8,8),IY(x,y)+rnd(-4,4),'#1a1614',rnd(4,8),60);}}
  G.nades=G.nades.filter(n=>!n.done);
  for(const ac of G.acid){ac.t-=dt;if(R()<dt*8)part(IX(ac.x+.5,ac.y+.5)+rnd(-5,5),IY(ac.x+.5,ac.y+.5)+rnd(-3,3),1,rnd(-2,2),rnd(-1,1),rnd(6,12),'#b8e070',2,{g:-4,life:1,smoke:1});
    for(const c of G.crew)if((c.x|0)===ac.x&&(c.y|0)===ac.y)c.hp-=6*dt;
    if(ac.t<=0){ac.done=true;if(walk(ac.x,ac.y)&&R()<.5){addBreach(ac.x,ac.y);if(!G.acidLog){G.acidLog=1;addLog('Krew obcego okazała się kwasem. Przeżarła trzy pokłady i podłogę w moim ulubionym korytarzu.');}}}}
  G.acid=G.acid.filter(a=>!a.done);
  if(G.fakeBlips)for(const b of G.fakeBlips){b.x+=(b.tx-b.x)*dt*.35;b.y+=(b.ty-b.y)*dt*.35;}
  const hs=G.aliens.filter(hostile);G.alert=hs.length>0||!!G.fakeBlips;
  if(G.alert){G.pingT-=dt;if(G.pingT<=0){let d=9;const pts=G.fakeBlips||hs;for(const p of pts)for(const c of G.crew)d=Math.min(d,Math.hypot(p.x-c.x,p.y-c.y));
    sfx('ping',d);G.pingT=clamp(d/5,.28,1.3);}}}

// events
EV.scare=function(){if(G.fakeBlips)return false;const cs=realCrew();if(!cs.length)return false;G.fakeBlips=[];
  for(let i=0;i<5+G.lvl;i++){const t=pick(G.tiles),c=pick(cs);G.fakeBlips.push({x:t.x+.5,y:t.y+.5,tx:c.x+rnd(-1,1),ty:c.y+rnd(-1,1)});}
  banner('📡 Ruch na skanerze');addLog('Skaner ruchu pokazuje ruch. Dużo ruchu. Według skanera to coś jest w pomieszczeniu razem z nami. Nikogo nie widać.');
  G.timers.push({t:6,f:()=>{G.blackout=5;}});
  G.timers.push({t:7.5,f:()=>{G.fakeBlips=null;sfx('screech');G.scare={t:.35};G.shake=.7;addLog('Spojrzeliśmy w górę.');
    const n=2+G.lvl;for(let i=0;i<n;i++){const c=pick(realCrew().length?realCrew():G.crew);if(!c)break;const w=walkTiles().filter(t=>Math.abs(t.x-c.x)+Math.abs(t.y-c.y)<=3);const t=w.length?pick(w):randomWalkable();
      const a=spawnAlien(alienType(),t.x,t.y,.4+i*.5);a.drop=true;}}});return true;};
EV.bolid=function(){spawnBolid();return true;};
EV.goscie=function(){const cs=realCrew().filter(c=>!G.aliens.some(a=>a.t==='gosc'&&a.follow===c));if(!cs.length)return false;
  const n=Math.min(cs.length,2+(G.lvl>3?1:0));for(let i=0;i<n;i++){const c=cs.splice(Math.floor(R()*cs.length),1)[0];const w=walkTiles().filter(t=>Math.abs(t.x-c.x)+Math.abs(t.y-c.y)<=3);const t=w.length?pick(w):randomWalkable();
    const a=spawnAlien('gosc',t.x,t.y,0);a.follow=c;a.life=80;burst(IX(a.x,a.y),IY(a.x,a.y),12,12,'#dfe8ff');}
  G.guestEndLog=0;sfx('vortex');banner('👻 Goście');addLog('Na pokładzie pojawili się goście. Każdy wygląda jak ktoś, kogo załoga dawno nie widziała. Nie jedzą, nie śpią i nie odstępują nikogo na krok.');return true;};
EV.mimik=function(){const used=new Set(G.crew.map(c=>c.name));const free=NAMES.filter(n=>!used.has(n[0]));const t=randomWalkable();
  const a=spawnAlien('mimik',t.x,t.y,0);a.disg=true;a.revealT=rnd(28,38);a.name=(free.length?pick(free):pick(NAMES))[0];
  banner('👤 Ktoś nowy na pokładzie?');addLog('Przy kolacji naliczyłem o jedną osobę więcej niż zwykle. Wszyscy twierdzą, że są tu od początku. Ocean w słoiku wygląda na zadowolony.');return true;};
EV.krolowa=function(){const e=edgeWalk();if(!e)return false;addBreach(e[0],e[1]);const q=spawnAlien('krolowa',e[0],e[1],1.5);q.drop=true;
  for(let i=0;i<3;i++)spawnAlien(alienType(),e[0],e[1],2+i);G.alarm=12;sfx('kurdel');sfx('screech');banner('👑 Królowa Mlaskaczy');
  addLog('Na pokład weszła Królowa Mlaskaczy. Ma koronę z kości, trzy rzędy zębów i świtę. Granaty mam pod ręką. Pralki też.');return true;};
EV.golem=function(){popup({title:'🧠 Komputer osiągnął superinteligencję',text:['Komputer pokładowy przeczytał całą bibliotekę, zrozumiał wszechświat i chce o tym opowiedzieć. Wykład potrwa około wieczności, ale komputer obiecuje skrót.'],
  ch:[{t:'Wysłuchaj wykładu',f:()=>{G.engBuf={m:0,t:20};for(const m of G.mods){if(m.broken&&!m.hive)fixMod(m);m.wear=0;}addLog('Wykład był tak długi, że zapomniałem, po co lecimy. W międzyczasie komputer naprawił wszystko na statku, żeby nic mu nie przerywało.');}},
      {t:'Wyłącz go',f:()=>{G.blackout=8;G.engBuf={m:1.3,t:30};addLog('Wyłączyłem komputer. Przed zgaśnięciem powiedział, że i tak wie, jak to się skończy. Nie powiedział jak.');}}]});return true;};

// render helpers
function drawTracker(T){if(!G.alert)return;const r=42*DPR,cx=r+10*DPR,cy=H*.6;
  ctx.globalAlpha=.85;ctx.fillStyle='rgba(4,20,10,.75)';ctx.beginPath();ctx.arc(cx,cy,r,0,6.283);ctx.fill();
  ctx.strokeStyle='rgba(80,255,140,.5)';ctx.lineWidth=DPR;for(const k of [1,.66,.33]){ctx.beginPath();ctx.arc(cx,cy,r*k,0,6.283);ctx.stroke();}
  const sw=(T*2.2)%6.283;ctx.strokeStyle='rgba(120,255,160,.8)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(sw)*r,cy+Math.sin(sw)*r);ctx.stroke();
  const b=G.bounds,sc=r/Math.max(60,(b.maxX-b.minX)/2+20),ocx=IX(G.cx,G.cy),ocy=IY(G.cx,G.cy);
  const plot=(x,y,col,s)=>{const X=cx+(IX(x,y)-ocx)*sc,Y=cy+(IY(x,y)-ocy)*sc;if(Math.hypot(X-cx,Y-cy)>r)return;ctx.fillStyle=col;ctx.fillRect(X-s/2,Y-s/2,s,s);};
  for(const c of G.crew)plot(c.x,c.y,'rgba(120,255,160,.6)',3*DPR);
  const pulse=3+2*Math.sin(T*8);for(const a of (G.fakeBlips||G.aliens.filter(hostile)))plot(a.x,a.y,'#c8ffd0',(pulse+1)*DPR);
  ctx.font=`${Math.round(13*DPR)}px VT323,monospace`;ctx.textAlign='center';ctx.fillStyle='#8affb0';ctx.fillText('SKANER RUCHU',cx,cy+r+11*DPR);ctx.globalAlpha=1;}
function drawNades(T){for(const n of G.nades){const q=Math.min(1,n.t/n.dur);const x=n.x0+(n.x1-n.x0)*q,y=n.y0+(n.y1-n.y0)*q;const h=10+Math.sin(q*Math.PI)*30;
  wr(IX(x,y)-1,IY(x,y)-h-1,3,3,'#2a3a1a');if(Math.sin(T*30)>0)wr(IX(x,y),IY(x,y)-h-1,1,1,'#ff3030');}}
function drawAcid(T){for(const a of G.acid){const x=IX(a.x+.5,a.y+.5),y=IY(a.x+.5,a.y+.5);for(let i=0;i<6;i++){const ox=(hash(a.x,a.y,i)-.5)*18,oy=(hash(a.x,a.y,i+7)-.5)*8;
  wr(x+ox-1,y+oy,3,1.5,Math.sin(T*9+i)>0?'#b8e030':'#6a8a10');}}}
function drawHive(m,T,ox,oy,sp){const n=Math.floor((m.resin||0)*16);for(let i=0;i<n;i++){const x=ox+sp.w*(.15+hash(m.id,i,1)*.7),y=oy+sp.H*.3+hash(m.id,i,2)*(sp.H*.7+sp.w/4);
  wr(x-2,y-1,4,3,'#1c1a22');wr(x-1,y-1,1,1,'#5a566a');}
  if(m.hive)for(let i=0;i<3;i++){const ex=IX(m.gx,m.gy)+(i-1)*9,ey=IY(m.gx,m.gy)+sp.w/4+4+(i%2)*3;const wob=m.eggT<3?Math.sin(T*20+i):0;dI(SPR.egg,ex-3+wob*.6,ey-8);}}

