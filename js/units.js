// ---------- units ----------
function newCrew(name,g,role){return {id:++G.nid,name,g,role,hp:100,x:0,y:0,path:null,task:null,cmd:null,cd:0,think:R()*.4,face:1,anim:0,say:null,
  sayCd:rnd(4,12),clone:false,life:0,confused:0,hold:0,work:false,repath:0,idleT:rnd(1,4),sp:ROLE[role].sp,moving:false};}
function say(u,txt,t){u.say={txt,t:t||2.6};u.sayCd=rnd(9,20);sfx(u.role?(u.clone?'blabC':'blab'):'blabA');}
function sayMaybe(u,arr,p){if(u.sayCd<=0&&G.chatCd<=0&&R()<(p||.3)){say(u,pk(arr));G.chatCd=rnd(1.8,3.5);}}
function crewCap(){return 3+2*G.mods.filter(m=>m.t==='quarters').length;}
function realCrew(){return G.crew.filter(c=>!c.clone);}
function healSpot(){return G.mods.find(m=>m.t==='medbay'&&!m.broken)||G.mods.find(m=>m.t==='quarters');}
function workshopMul(){return 1+.5*Math.min(2,G.mods.filter(m=>m.t==='workshop'&&!m.broken).length);}
function armoryMul(){const a=G.mods.filter(m=>m.t==='armory'&&!m.broken);return a.length?1.5+.25*(Math.max(...a.map(m=>m.lvl))-1):1;}
function gravMul(){const g=G.grav;if(!g)return {sp:1,work:1};return {float:{sp:.6,work:.6},side:{sp:.85,work:.6},ceiling:{sp:.9,work:.5},heavy:{sp:.45,work:.7}}[g.type];}
function taskKey(t){return t?t.k+':'+(t.key||(t.m&&t.m.id)||(t.a&&t.a.id)||(t.c&&'c'+t.c.id)||(t.x!==undefined?t.x+'_'+t.y:'')):'';}
function validTask(t){if(!t)return false;switch(t.k){
  case 'fire':return G.fires.has(t.key);case 'breach':return G.breaches.has(t.key);
  case 'repair':return G.mods.includes(t.m)&&t.m.broken;case 'maint':return G.mods.includes(t.m)&&!t.m.broken&&t.m.wear>=8;
  case 'fight':return G.aliens.includes(t.a)&&!t.a.dead&&!t.a.disg;case 'heal':return !!healSpot();
  case 'rescue':return G.crew.includes(t.c)&&!!t.c.latched;case 'ammo':return G.mods.includes(t.m)&&t.m.ammo<150&&G.money>=20;default:return true;}}
function chooseTask(c){const tx=c.x|0,ty=c.y|0;let best=null,bs=-1e9;const cur=taskKey(c.task);
  const cand=(task,score,limit)=>{const k=taskKey(task);let cl=0;for(const o of G.crew)if(o!==c&&taskKey(o.task)===k)cl++;if(cl>=limit)return;
    if(k===cur)score+=12;if(score>bs){bs=score;best=task;}};
  const md=(x,y)=>Math.abs(x-tx)+Math.abs(y-ty);
  if(c.hp<35&&!c.clone&&healSpot())cand({k:'heal'},95,99);
  for(const o of G.crew)if(o!==c&&o.latched)cand({k:'rescue',c:o},110-dist(o,c)*2,1);
  if(c.role==='mech'||c.clone)for(const m of G.mods)if(m.t==='sentry'&&m.ammo<50&&G.money>=20)cand({k:'ammo',m},60-md(m.gx,m.gy),1);
  for(const [k] of G.fires){const [x,y]=unkey(k);cand({k:'fire',key:k},(modAt(x,y)?100:90)-md(x,y)*1.5,2);}
  for(const a of G.aliens){if(!hostile(a))continue;const d=dist(a,c);if(c.role==='guard')cand({k:'fight',a},88-d*2,3);else if(d<5)cand({k:'fight',a},62-d*2,2);}
  for(const m of G.mods)if(m.broken&&!fireOnMod(m))cand({k:'repair',m},(c.role==='mech'||c.clone?84:70)+(m.hot?15:0)+(m.hive?18:0)-md(m.gx,m.gy)*1.2,m.needs2?2:1);
  for(const [k] of G.breaches){const [x,y]=unkey(k);cand({k:'breach',key:k},76+(G.o2<40?22:0)-md(x,y)*1.4,G.o2<40?2:1);}
  if(c.role==='mech'||c.clone)for(const m of G.mods)if(!m.broken&&m.wear>50)cand({k:'maint',m},30+m.wear*.2-md(m.gx,m.gy),1);
  if(!best)best=(c.hp<90&&!c.clone&&healSpot())?{k:'heal'}:{k:'idle'};
  if(taskKey(best)!==cur){c.task=best;c.path=null;c.repath=0;}}
function goalFor(c){const t=c.task;switch(t.k){
  case 'fire':case 'breach':{const [fx,fy]=unkey(t.key);return (x,y)=>Math.max(Math.abs(x-fx),Math.abs(y-fy))<=1;}
  case 'repair':case 'maint':case 'ammo':return (x,y)=>adjMod(t.m,x,y);
  case 'rescue':{const v=t.c;return (x,y)=>Math.max(Math.abs(x-(v.x|0)),Math.abs(y-(v.y|0)))<=1;}
  case 'heal':{const m=healSpot();return m?(x,y)=>adjMod(m,x,y):null;}
  case 'fight':{const a=t.a;return (x,y)=>Math.hypot(x+.5-a.x,y+.5-a.y)<=2.6;}
  case 'move':return (x,y)=>x===t.x&&y===t.y;}
  return null;}
function finishTask(c){c.path=null;if(c.cmd){c.hold=c.cmd.k==='move'?8:0;c.cmd=null;}c.task={k:'idle'};}
function setCmd(c,t){c.cmd=t;c.task=t;c.path=null;c.repath=0;c.confused=0;say(c,pk(TXT.order),1.6);}
function runCrew(c,dt){
  const gm=gravMul();c.sayCd-=dt;c.hurtT=Math.max(0,(c.hurtT||0)-dt);
  if(c.say){c.say.t-=dt;if(c.say.t<=0)c.say=null;}
  if(c.clone){c.life-=dt;if(c.life<=0){burst(IX(c.x,c.y),IY(c.x,c.y),8,14,'#7ab4ff');G.crew.splice(G.crew.indexOf(c),1);
    if(!G.cloneEndLog){G.cloneEndLog=true;addLog('Wir się rozwiał. Kopie wróciły do swoich dni. Jedna zabrała moją szczoteczkę do zębów.');}return;}
    sayMaybe(c,TXT.clone,.35);}
  c.work=false;c.hauntT=(c.hauntT||0)-dt;
  if(c.latched){if(c.latched.dead||!G.aliens.includes(c.latched))c.latched=null;else{c.moving=false;c.path=null;c.hp-=4*dt;c.hurtT=.1;
    if(R()<dt*3)part(IX(c.x,c.y),IY(c.x,c.y),12,rnd(-10,10),rnd(-5,5),rnd(5,20),'#a0101c',1,{g:60,blood:1,life:.7});
    sayMaybe(c,TXT.latched,.6);if(c.hp<=0)crewDie(c);return;}}
  if(c.confused>0){c.confused-=dt;if(!c.path||!c.path.length){if(R()<dt*.8)c.path=randomWalk(c);}moveUnit(c,c.sp*.6*gm.sp,dt);sayMaybe(c,TXT.confused,.5);return;}
  if(c.cmd&&!validTask(c.cmd))c.cmd=null;
  if(c.cmd)c.task=c.cmd;
  else{c.think-=dt;c.hold-=dt;if(c.think<=0){c.think=.4+R()*.2;if(c.hold<=0||!c.task||c.task.k==='idle'&&c.hold<=0)chooseTask(c);
      else if(c.hold>0){const near=G.aliens.find(a=>!a.friendly&&dist(a,c)<3);if(near)chooseTask(c);}}}
  if(!validTask(c.task)){c.task=null;chooseTask(c);}
  const t=c.task;
  if(t.k==='idle'){if(c.hold<=0&&(!c.path||!c.path.length)){c.idleT-=dt;if(c.idleT<=0){c.idleT=rnd(3,8);c.path=randomWalk(c);}}
    moveUnit(c,c.sp*.5*gm.sp,dt);sayMaybe(c,(G.blackout>0||G.pr<.7)?TXT.idleScary:TXT.idle,.025);crewShoot(c,dt);return;}
  const goal=goalFor(c);
  if(!goal){c.task={k:'idle'};return;}
  const here=goal(c.x|0,c.y|0)&&!(c.path&&c.path.length);
  if(!here){c.repath-=dt;
    if(!c.path||!c.path.length||c.repath<=0){c.repath=t.k==='fight'?.6:2.5;c.path=bfs(c.x|0,c.y|0,goal);
      if(c.path===null){if(c.cmd){c.cmd=null;say(c,'Nie dojdę tam.');}c.task={k:'idle'};c.hold=0;return;}}
    moveUnit(c,c.sp*gm.sp,dt);}
  else{c.path=null;doWork(c,t,dt,gm);}
  crewShoot(c,dt);}
function doWork(c,t,dt,gm){const rate=(c.role==='mech'||c.clone?1:.6)*workshopMul()*gm.work*(c.hauntT>0?.5:1);c.work=true;
  const faceTo=(x,y)=>{const s=(x-c.x)-(y-c.y);if(Math.abs(s)>.05)c.face=s>0?1:-1;};
  switch(t.k){
  case 'fire':{const f=G.fires.get(t.key);const [fx,fy]=unkey(t.key);faceTo(fx+.5,fy+.5);f.v-=dt*.6*rate;
    if(R()<dt*12)spray(c,fx+.5,fy+.5,'#e8f4ff');sayMaybe(c,TXT.firefight,.2);
    if(f.v<=0){G.fires.delete(t.key);finishTask(c);}break;}
  case 'breach':{const b=G.breaches.get(t.key);const [bx,by]=unkey(t.key);faceTo(bx+.5,by+.5);b.p+=dt*rate/6;if(R()<dt*10)spray(c,bx+.5,by+.5,'#ffd070');
    if(b.p>=1){G.breaches.delete(t.key);finishTask(c);}break;}
  case 'repair':{const m=t.m;faceTo(m.gx+MOD[m.t].s/2,m.gy+MOD[m.t].s/2);
    {const fk=fireOnMod(m);if(fk){say(c,pk(TXT.fireFirst),1.6);c.task={k:'fire',key:fk};if(c.cmd)c.cmd=c.task;c.path=null;break;}}
    if(m.needs2){const n=G.crew.filter(o=>o.task&&o.task.k==='repair'&&o.task.m===m&&o.work).length;if(n<2){sayMaybe(c,TXT.need2,.6);break;}}
    m.rp+=dt*rate/(m.hive?10:m.t==='reactor'?7:5);if(R()<dt*8)spray(c,m.gx+MOD[m.t].s/2,m.gy+MOD[m.t].s/2,'#ffe070');sayMaybe(c,TXT.repair,.15);
    if(m.rp>=1){fixMod(m,c);finishTask(c);}break;}
  case 'maint':{const m=t.m;faceTo(m.gx+1,m.gy+1);m.wear-=dt*9*rate;if(R()<dt*4)spray(c,m.gx+MOD[m.t].s/2,m.gy+MOD[m.t].s/2,'#ffe070');if(m.wear<8){m.wear=Math.max(0,m.wear);finishTask(c);}break;}
  case 'heal':{const m=healSpot();const r=m.t==='medbay'?9*lm(m)*Math.max(.3,G.pr):3*(G.pralkiOK?1.6:1);c.hp=Math.min(100,c.hp+r*dt);
    if(c.hp>=98)finishTask(c);break;}
  case 'move':finishTask(c);break;
  case 'rescue':{const v=t.c;faceTo(v.x,v.y);t.p=(t.p||0)+dt;if(t.p>1.1&&v.latched){const a=v.latched;v.latched=null;a.latch=null;hitAlien(a,999);say(c,pk(TXT.rescue),1.6);}if(!v.latched)finishTask(c);break;}
  case 'ammo':{const m=t.m;faceTo(m.gx+.5,m.gy+.5);t.p=(t.p||0)+dt*rate;if(t.p>1.5){m.ammo=150;G.money-=20;sfx('reload');finishTask(c);}break;}
  case 'fight':break;}}
function hostile(a){return !a.friendly&&!(a.spawnT>0)&&!a.disg&&!a.latch&&!a.dead;}
function crewShoot(c,dt){c.cd-=dt;if(c.confused>0||c.latched)return;
  if(c.burst>0){if(!c.btg||c.btg.dead){c.burst=0;}else{c.bt-=dt;if(c.bt<=0){c.bt=.09;c.burst--;fireAt(c,c.btg);}return;}}
  if(c.cd>0)return;const gun=c.role==='guard'&&!c.clone;let tg=null,bd=gun?3.8:3.2;
  if(c.task&&c.task.k==='fight'&&G.aliens.includes(c.task.a)&&hostile(c.task.a)){const d=dist(c,c.task.a);if(d<=bd){tg=c.task.a;bd=d;}}
  if(!tg)for(const a of G.aliens){if(!hostile(a))continue;const d=dist(c,a);if(d<bd){bd=d;tg=a;}}
  if(!tg)return;if(gun){c.cd=.85;c.burst=2;c.bt=.09;c.btg=tg;}else c.cd=.7;fireAt(c,tg);if(R()<.06)say(c,pk(TXT.fight),1.6);}
function fireAt(c,tg){const gun=c.role==='guard'&&!c.clone;sfx(gun?'pulse':'shot');const dmg=(gun?5.5:ROLE[c.role].dmg)*armoryMul()*(c.clone?.8:1);
  const s=(tg.x-c.x)-(tg.y-c.y);if(Math.abs(s)>.05)c.face=s>0?1:-1;const x0=IX(c.x,c.y)+c.face*5,y0=IY(c.x,c.y)-9;
  beam(x0,y0,IX(tg.x,tg.y)+rnd(-2,2),IY(tg.x,tg.y)-5+rnd(-2,2),gun?'#ffd27a':'#7ff8ff');
  if(gun){G.flashes.push({x:x0+c.face*2,y:y0,t:.06});part(x0,y0,9,rnd(-10,10),rnd(-6,6),rnd(10,25),'#d8b040',1,{g:90,life:.6,limb:1});}
  hitAlien(tg,dmg);}
function hurtCrew(c,d){if(!c.dead&&c.hp<50&&!c.clone&&G.tips&&!G.tips.has('hurt'))showTip('hurt');if(c.dead)return;c.hp-=d;if(d>1)sfx('hurt');c.hurtT=.25;const wx=IX(c.x,c.y),wy=IY(c.x,c.y);
  for(let i=0;i<5;i++)part(wx,wy,8,rnd(-14,14),rnd(-8,8),rnd(10,30),'#a0101c',1,{g:60,blood:1,life:rnd(.5,1)});
  if(R()<.25)say(c,pk(TXT.hurt),1.4);if(c.hp<=0)crewDie(c);}
function crewDie(c){c.dead=true;const i=G.crew.indexOf(c);if(i>=0)G.crew.splice(i,1);const wx=IX(c.x,c.y),wy=IY(c.x,c.y);
  for(let k=0;k<4;k++)decal(wx+rnd(-5,5),wy+rnd(-3,3),'#5a0810',rnd(3,6),80);
  for(let k=0;k<12;k++)part(wx,wy,8,rnd(-30,30),rnd(-20,20),rnd(20,50),pick(['#a0101c','#d07a2a','#888c96']),2,{g:80,life:rnd(.6,1.3),blood:1});
  if(c.clone){addLog(c.name+' przestał istnieć. Ten dzień tygodnia będzie dziwny.');return;}
  addLog(c.name+' '+(c.g==='f'?'zginęła':'zginął')+' na służbie. '+(c.g==='f'?'Zostawiła':'Zostawił')+' po sobie klucz francuski i niedokończoną krzyżówkę.');
  banner('💀 '+c.name+' nie żyje');}

// aliens
function spawnAlien(t,x,y,delay){const st=ALIEN[t];const a={id:++G.nid,t,hp:st.hp*(1+.18*G.lvl),max:st.hp*(1+.18*G.lvl),x:x+.5,y:y+.5,path:null,tgt:null,think:0,cd:st.cd,face:1,anim:0,
  say:null,sayCd:rnd(1,5),spawnT:delay||0,repath:0,dead:false,friendly:!!st.friendly,life:40,moving:false};G.aliens.push(a);return a;}
function retarget(a){let best=null,bd=8;for(const c of G.crew){const d=dist(a,c);if(d<bd){bd=d;best=c;}}
  if(!best&&G.mods.length){const ms=[...G.mods].sort((p,q)=>Math.hypot(p.gx+1-a.x,p.gy+1-a.y)-Math.hypot(q.gx+1-a.x,q.gy+1-a.y)).slice(0,3);best=pick(ms);}
  a.tgt=best;a.path=null;a.repath=0;}
function runAlien(a,dt){const st=ALIEN[a.t],gm=gravMul();a.sayCd-=dt;if(a.say){a.say.t-=dt;if(a.say.t<=0)a.say=null;}
  a.bite=Math.max(0,(a.bite||0)-dt);
  if(a.spawnT>0){a.spawnT-=dt;return;}
  if(alienSpecial(a,dt))return;
  if(a.friendly){a.life-=dt;if(a.life<=0){a.dead=true;burst(IX(a.x,a.y),IY(a.x,a.y),6,16,'#c0c4cc');addLog('Nosorożec zniknął tak samo nagle, jak się pojawił. Został po nim ślad kopyta i lekki niepokój.');return;}
    if(!a.path||!a.path.length){if(R()<dt*.5)a.path=randomWalk(a);}moveUnit(a,st.sp,dt);sayMaybe(a,TXT.alien.rhino,.1);return;}
  sayMaybe(a,TXT.alien[a.t],.12);
  a.think-=dt;const tg0=a.tgt;
  if(a.think<=0||!tg0||tg0.dead||(tg0.role===undefined&&!G.mods.includes(tg0))){a.think=.9;retarget(a);}
  const tg=a.tgt;if(!tg){if(!a.path||!a.path.length)a.path=randomWalk(a);moveUnit(a,st.sp*gm.sp,dt);return;}
  const isCrew=tg.role!==undefined;
  const near=isCrew?dist(a,tg)<=1.2:(adjMod(tg,a.x|0,a.y|0)&&!(a.path&&a.path.length));
  if(!near){a.repath-=dt;if(!a.path||!a.path.length||a.repath<=0){a.repath=isCrew?.7:2;
      const gx=tg.x|0,gy=tg.y|0;a.path=bfs(a.x|0,a.y|0,isCrew?(x,y)=>Math.abs(x-gx)+Math.abs(y-gy)<=1:(x,y)=>adjMod(tg,x,y));if(!a.path){a.tgt=null;a.path=null;}}
    moveUnit(a,st.sp*gm.sp,dt);}
  else{a.path=null;const s=isCrew?(tg.x-a.x)-(tg.y-a.y):(tg.gx+1-a.x)-(tg.gy+1-a.y);if(Math.abs(s)>.05)a.face=s>0?1:-1;
    a.cd-=dt;if(a.cd<=0){a.cd=st.cd;a.bite=.2;if(isCrew)hurtCrew(tg,st.dmg*(1+.1*G.lvl));else{tg.wear=Math.min(100,tg.wear+st.dmg*1.8);if(!tg.hive){tg.resin=Math.min(1,(tg.resin||0)+.07);if(tg.resin>=1)makeHive(tg);else if(!tg.broken&&R()<.12)breakMod(tg,'alien');}}}}}
function hitAlien(a,d){if(a.dead||a.friendly)return;if(a.disg)unmask(a);a.hp-=d;sfx('hit');const wx=IX(a.x,a.y),wy=IY(a.x,a.y);
  for(let i=0;i<3;i++)part(wx,wy,5,rnd(-16,16),rnd(-8,8),rnd(10,30),G.psych?'#ffb6d9':(R()<.5?'#c8e830':'#7a0a14'),1,{g:60,acid:1,blood:!G.psych,life:rnd(.4,.9)});
  if(a.hp<=0)alienDie(a);}
function alienDie(a){a.dead=true;sfx('splat');sfx('screech');if(a.latch){a.latch.latched=null;a.latch=null;}
  if(a.t!=='pralka'&&!G.psych){const tx=a.x|0,ty=a.y|0;if(walk(tx,ty)&&R()<(a.t==='krolowa'?1:a.t==='gebo'?.3:.12))G.acid.push({x:tx,y:ty,t:4,max:4});}
  if(a.t==='krolowa'){G.money+=0;boom(IX(a.x,a.y),IY(a.x,a.y),70);banner('👑 Królowa pokonana');addLog('Królowa Mlaskaczy padła. Jej korona okazała się zrobiona z pogryzionych kluczy francuskich. Zabieram ją na pamiątkę.');}const st=ALIEN[a.t];G.money+=st.bounty;G.kills++;const wx=IX(a.x,a.y),wy=IY(a.x,a.y);
  for(let k=0;k<3;k++)decal(wx+rnd(-6,6),wy+rnd(-3,3),a.t==='pralka'?'#3a5a7a':k?'#4a0810':'#6a8a10',rnd(3,7),70);
  for(let k=0;k<5;k++)part(wx,wy,6,rnd(-34,34),rnd(-18,18),rnd(30,60),a.t==='pralka'?'#e4e7eb':'#f0e6d0',2,{g:90,life:rnd(.8,1.4),limb:1});
  for(let k=0;k<10;k++)part(wx,wy,6,rnd(-30,30),rnd(-16,16),rnd(10,40),a.t==='pralka'?'#6aa8ff':'#9a0c18',1,{g:70,life:rnd(.5,1),blood:a.t!=='pralka'});
  if(!G.firstKill){G.firstKill=true;addLog('Pierwszy obcy pokonany. Instrukcja walki mówi: celuj w kończyny. Problem w tym, że nie wiadomo, które kończyny są do chodzenia, a które do myślenia.');}}

// modules
function breakMod(m,cause){if(m.broken)return;m.broken=true;sfx('clank');m.rp=0;m.bt=0;
  const sp=SPR.mod[m.t];burst(IX(m.gx,m.gy),IY(m.gx,m.gy)+sp.w/4,10,18,'#ffd060');
  if(cause!=='silent'&&TXT.brk[m.t])addLog(pk(TXT.brk[m.t]));}
function fixMod(m,c){sfx('fix');if(m.hive&&c)addLog(c.name+' '+(c.g==='f'?'wypaliła':'wypalił')+' gniazdo. Pachnie jak przypalona jajecznica z koszmaru.');m.hive=false;m.resin=0;m.broken=false;m.wear=0;m.rp=0;m.needs2=false;m.hot=0;burst(IX(m.gx,m.gy),IY(m.gx,m.gy)+SPR.mod[m.t].w/4,14,10,'#7ff8ff');
  if(c&&R()<.25)addLog(c.name+' '+(c.g==='f'?'naprawiła':'naprawił')+': '+MOD[m.t].n.toLowerCase()+'. Zostały dwie śrubki. Nikt nie wie skąd.');}
function explode(m){const cx=m.gx+1,cy=m.gy+1;G.hull-=18;G.shake=1;G.flash=.8;
  boom(IX(cx,cy),IY(cx,cy),90);
  for(let i=0;i<4;i++){const x=m.gx+ri(-1,2),y=m.gy+ri(-1,2);if(isHull(x,y))addFire(x,y,.7);}
  for(const c of [...G.crew])if(Math.hypot(c.x-cx,c.y-cy)<2.8)hurtCrew(c,35);
  for(const o of G.mods)if(o!==m&&Math.hypot(o.gx+1-cx,o.gy+1-cy)<3){o.wear=Math.min(100,o.wear+40);if(R()<.4)breakMod(o,'silent');}
  addLog('BUM. Reaktor wybuchł. Instrukcja opisywała tę sytuację na stronie 412, której nikt nie przeczytał.');banner('💥 Wybuch reaktora');}
function runTurret(m,dt){m.cd-=dt*G.pr;const tx=m.gx+.5,ty=m.gy+.5;let tg=null,bd=0,ext=null;
  if(!tg){bd=11+m.lvl;for(const e of G.ext){const d=Math.hypot(e.x-tx,e.y-ty);if(d<bd){bd=d;ext=e;}}}
  let px=null,py=null;if(tg){px=tg.x;py=tg.y;}else if(ext){px=ext.x;py=ext.y;}
  else if(G.kurdel&&G.kurdel.ph==='in'){if(!m.kt||m.kt.t<=0){const a=R()*Math.PI*2;m.kt={x:G.cx+Math.cos(a)*9,y:G.cy+Math.sin(a)*9,t:1.5};}m.kt.t-=dt;px=m.kt.x;py=m.kt.y;}
  else if(G.swarm){px=G.swarm.x;py=G.swarm.y;}
  if(px===null)return;
  const sx0=IX(tx,ty),sy0=IY(tx,ty)-13,sx1=IX(px,py),sy1=IY(px,py)-(tg?5:16);m.ang=Math.atan2(sy1-sy0,sx1-sx0);
  if(m.cd>0)return;m.cd=.9;sfx('turret');const dmg=10*lm(m);
  if(tg){beam(sx0,sy0,sx1,sy1,'#ffe070');hitAlien(tg,dmg);}
  else if(ext){beam(sx0,sy0,sx1,sy1,'#ffe070');ext.hp-=dmg*(1-(ext.armor||0));burst(sx1,sy1,3,10,ext.armor?'#a0c0ff':'#ffd060');if(ext.hp<=0)extDie(ext);}
  else if(G.kurdel&&G.kurdel.ph==='in'){beam(sx0,sy0,sx1,sy1,'#ffe070');G.kurdel.hp-=dmg;burst(sx1,sy1,4,14,'#c01020');}
  else if(G.swarm){beam(sx0,sy0,sx1,sy1,'#ffe070');if(!G.swarm.saidMiss){G.swarm.saidMiss=1;addLog('Wieżyczki strzelają w chmurę. Pociski przelatują przez nią i wracają do domu.');}}}

// fires & breaches
function addFire(x,y,v){if(!isHull(x,y))return;const k=key(x,y);if(G.breaches.has(k)||G.fires.size>24)return;const f=G.fires.get(k);if(f)f.v=Math.max(f.v,v||.3);else{G.fires.set(k,{v:v||.3});sfx('fire');}}
function addBreach(x,y){const k=key(x,y);G.fires.delete(k);if(!G.breaches.has(k))G.breaches.set(k,{p:0});}
function runFires(dt){for(const [k,f] of G.fires){f.v=Math.min(1,f.v+dt*.04);const [x,y]=unkey(k);
    if(R()<dt*.02*f.v){const [dx,dy]=pick(DIRS);addFire(x+dx,y+dy,.2);}
    for(const c of [...G.crew])if(Math.abs(c.x-(x+.5))<.8&&Math.abs(c.y-(y+.5))<.8)hurtCrew(c,7*f.v*dt);
    const m=modAt(x,y);if(m){m.wear=Math.min(100,m.wear+3*f.v*dt);if(!m.broken&&m.wear>70&&R()<dt*.01)breakMod(m,'fire');}
    if(R()<dt*6*f.v)part(IX(x+.5,y+.5)+rnd(-6,6),IY(x+.5,y+.5)+rnd(-3,3),8,rnd(-3,3),rnd(-2,2),rnd(8,16),'#5a5560',2,{g:-6,life:rnd(1,2),smoke:1});}}
function hullHit(dmg,x,y,breachP){if(G.lvl===0)dmg*=.6;const wx=IX(x+.5,y+.5),wy=IY(x+.5,y+.5);
  if(G.shield>0){G.shield=Math.max(0,G.shield-dmg*1.2);G.shieldFlash=.5;sfx('shield');burst(wx,wy-10,6,22,'#7ff0ff');return;}
  sfx('hull');G.hull-=dmg;G.shake=Math.min(1,G.shake+dmg/14);G.alarm=Math.max(G.alarm,3);burst(wx,wy-4,10,26,'#ffb040');
  const m=modAt(x,y);if(m){m.wear=Math.min(100,m.wear+dmg*2);if(!m.broken&&R()<.15)breakMod(m,'silent');}
  if(R()<breachP&&walk(x,y))addBreach(x,y);else if(R()<.22)addFire(x,y,.35);}

// external threats
function spawnShip(){const a=R()*Math.PI*2,r=19,big=G.lvl>=3&&R()<.35;G.ext.push({k:'ship',big,armor:big?.65:.45,id:++G.nid,x:G.cx+Math.cos(a)*r,y:G.cy+Math.sin(a)*r,hp:(60+G.lvl*25)*(big?2.5:1),ang:a,orb:rnd(8.5,10.5),cd:rnd(2,3),dir:R()<.5?1:-1,life:50});}
function spawnMeteor(){const a=R()*Math.PI*2,r=20,t=pick(G.edge);sfx('met');G.ext.push({k:'met',id:++G.nid,x:G.cx+Math.cos(a)*r,y:G.cy+Math.sin(a)*r,tx:t[0]+.5,ty:t[1]+.5,hp:12,sp:rnd(4,6)});}
function extDie(e){e.dead=true;const wx=IX(e.x,e.y),wy=IY(e.x,e.y)-18;if(e.k==='bolid'){boom(wx,wy,70);G.money+=120;G.shake=.6;addLog('Bolid rozpadł się na tysiąc kawałków. Każdy kawałek z osobna wygląda na obrażony.');}
  else if(e.k==='ship'){boom(wx,wy,50);G.money+=80;addLog(pick(['Obcy statek rozpadł się na części. Część z nich wciąż wykrzykuje.','Zestrzeliliśmy napastnika. Tłumacz twierdzi, że jego ostatnie słowo brzmiało „niesprawiedliwe”.']));}
  else{burst(wx,wy,8,20,'#b0a080');G.money+=5;}}
function runExt(dt){for(const e of G.ext){if(e.dead)continue;
    if(e.k==='ship'){e.life-=dt;if(e.life<=0){e.dead=true;addLog('Obcy statek odleciał. Chyba się znudził. Albo skończyły mu się wykrzykniki.');continue;}const dx=e.x-G.cx,dy=e.y-G.cy,d=Math.hypot(dx,dy);
      if(d>e.orb+.3){e.x-=dx/d*3*dt;e.y-=dy/d*3*dt;e.ang=Math.atan2(dy,dx);}
      else{e.ang+=dt*.18*e.dir;e.x=G.cx+Math.cos(e.ang)*e.orb;e.y=G.cy+Math.sin(e.ang)*e.orb;}
      e.cd-=dt;if(e.cd<=0&&d<e.orb+2){e.cd=rnd(3.5,4.6);for(let i=0;i<(e.big?3:1);i++){const t=pick(G.edge);G.proj.push({x:e.x,y:e.y,tx:t[0]+.5,ty:t[1]+.5,sp:7-i,dmg:3+G.lvl});}}}
    else if(e.k==='met'||e.k==='bolid'){const dx=e.tx-e.x,dy=e.ty-e.y,d=Math.hypot(dx,dy);
      if(d<.3){if(e.k==='bolid')bolidHit(e);else hullHit(5+G.lvl*1.5,e.tx|0,e.ty|0,.4);e.dead=true;}else{e.x+=dx/d*e.sp*dt;e.y+=dy/d*e.sp*dt;}
      if(R()<dt*20)part(IX(e.x,e.y),IY(e.x,e.y)-18,0,rnd(-4,4),rnd(-4,4),0,pick(['#ff9a3a','#ffd070','#6a5a4a']),1,{g:0,life:rnd(.3,.7)});}}
  G.ext=G.ext.filter(e=>!e.dead);
  for(const p of G.proj){const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy);if(d<.3){hullHit(p.dmg,p.tx|0,p.ty|0,.12);p.dead=true;}else{p.x+=dx/d*p.sp*dt;p.y+=dy/d*p.sp*dt;}}
  G.proj=G.proj.filter(p=>!p.dead);
  G.meteorT-=dt;if(G.meteorQ>0&&G.meteorT<=0){spawnMeteor();G.meteorQ--;G.meteorT=rnd(.6,1.4);}}

