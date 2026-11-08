// ---------- UI ----------
const UI={time:0,popT0:0,paused:false,speed:1,sel:null,build:null,sheet:null,hudT:0,statStr:'',confirmSell:false};
const sheet=$('#sheet'),hint=$('#hint');
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
let toastT=0;function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),1800);}
let banT=0;function banner(t){if(!G||G.demo)return;sfx(/^[☢🩸🕳💀🔥👾☄💥🫁⚡🐉⬛]/u.test(t)?'alarm':'banner');const el=$('#banner');el.textContent=t;el.classList.add('show');clearTimeout(banT);banT=setTimeout(()=>el.classList.remove('show'),2800);}
function addLog(t){if(!G||G.demo)return;const e='Dzień '+G.day+'. '+t;
  if(G.psych){G.psychHidden.push(e);G.log.unshift('Dzień '+G.day+'. Wszystko w porządku. 🌸');}else G.log.unshift(e);
  if(G.log.length>120)G.log.length=120;renderLogMini();if(UI.sheet&&UI.sheet.mode==='log')openLog();}
let tipT=0;
function showTip(id){if(!G||G.demo||!G.tips||G.tips.has(id))return;if(!LEVELS[G.lvl].tut&&!TIP_ANY.has(id))return;G.tips.add(id);
  if(id==='turret')G.money+=150;const el=$('#tip');el.innerHTML='<span>💡 '+esc(TIPS[id])+'</span><button class="b" data-tip="ok">OK</button>';el.classList.add('show');
  $('#logmini').innerHTML='';clearTimeout(tipT);tipT=setTimeout(hideTip,26000);sfx('chime');}
function hideTip(){$('#tip').classList.remove('show');renderLogMini();}
$('#tip').addEventListener('click',e=>{if(e.target.closest('[data-tip]')){sfx('click');hideTip();}});
function renderLogMini(){const el=$('#logmini');if(!G||UI.build||$('#tip').classList.contains('show')){el.innerHTML='';return;}
  el.innerHTML=G.log.slice(0,2).map(t=>'<div>'+esc(t.length>150?t.slice(0,147)+'…':t)+'</div>').join('');}
function thumb(canvas,img){const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,canvas.width,canvas.height);
  const s=Math.min(canvas.width/img.width,canvas.height/img.height);g.drawImage(img,(canvas.width-img.width*s)/2,(canvas.height-img.height*s)/2,img.width*s,img.height*s);}
function closeSheet(){sheet.classList.remove('show');UI.sheet=null;UI.confirmSell=false;renderLogMini();}
function showSheet(){sheet.classList.add('show');$('#logmini').innerHTML='';}
function upCost(m){return Math.round(MOD[m.t].cost*.6*m.lvl);}
function effText(m){const l=lm(m);switch(m.t){
  case 'reactor':return 'Daje '+Math.round(MOD.reactor.pow*l)+' ⚡.';case 'engine':return 'Prędkość: '+(.16*(1+.3*(m.lvl-1))*100).toFixed(0)+' jednostek.';
  case 'o2':return '+'+(1.4*l).toFixed(1)+' O₂ na sekundę.';case 'turret':return 'Obrażenia '+Math.round(10*l)+', zasięg '+(11+m.lvl)+' pól.';
  case 'quarters':return '+2 miejsca dla załogi.';case 'workshop':return 'Naprawy +50%, zużycie wolniejsze o 20%, kadłub +0,08 ❤ na sekundę.';
  case 'medbay':return 'Leczenie '+Math.round(9*l)+' HP na sekundę.';case 'lab':return '+₵'+(1.5*l).toFixed(1)+' na sekundę.';
  case 'armory':return 'Siła ognia załogi ×'+(1.5+.25*(m.lvl-1)).toFixed(2)+'.';case 'shield':return 'Tarcza do '+Math.round(35*l)+' punktów.';
  case 'nmach':return 'Jeden przycisk, wiele liter N. Odpoczywa 40 s po każdym użyciu.';case 'sentry':return 'Amunicja: '+m.ammo+'/150. Obrażenia '+(2.6*l).toFixed(1)+' na pocisk, zasięg 4 pola.';case 'hull':return '';case 'sepul':return '+₵'+(2.5*l).toFixed(1)+' na sekundę. Sepulenie: tak.';}return '';}
function modStatus(m){if(m.broken){let s=m.needs2?'Zepsute: naprawa wymaga dwóch osób':'Zepsute';if(m.hot>0)s+=' · ☢ wybuch za '+Math.ceil(m.hot)+' s';if(m.rp>0)s+=' · naprawa '+Math.round(m.rp*100)+'%';return s;}
  return G.pr<1&&MOD[m.t].pow<0?'Działa słabiej: za mało prądu':'Działa';}
function openMod(m){UI.sheet={mode:'mod',m};UI.confirmSell=false;const d=MOD[m.t];const sell=Math.floor(d.cost*.4*m.lvl);
  sheet.innerHTML=`<div class="card" style="cursor:default"><canvas width="112" height="112" id="mth"></canvas><div><div class="t">${d.n} <span class="d">poziom ${m.lvl}</span></div>
  <div class="d" id="mSt"></div><div class="wear"><div id="mWe"></div></div></div></div><p class="d">${d.d}</p><p class="d">${effText(m)}</p>
  <div class="row"><button class="b" data-act="fix">🔧 Wyślij mechanika</button>${m.lvl<3?`<button class="b" data-act="up">⬆ Ulepsz ₵${upCost(m)}</button>`:''}
  ${m.t==='nmach'?'<button class="b" data-act="nm">Zrób coś na N</button>':''}${m.t==='sentry'?'<button class="b" data-act="ammo">⦿ Dosyp amunicji ₵30</button>':''}<button class="b" data-act="sell" id="bSell">♻ Rozbierz +₵${sell}</button><button class="b" data-act="close">Zamknij</button></div>`;
  thumb($('#mth'),SPR.mod[m.t].c);showSheet();sheetTick();}
function openBuild(){UI.sheet={mode:'build'};let h='<div class="sh" style="margin-bottom:6px">Buduj moduł</div>';
  for(const t in MOD){const d=MOD[t];const lock=d.ul>G.lvl;
    h+=`<div class="card ${lock||G.money<d.cost?'dis':''}" data-act="${lock?'':'b:'+t}"><canvas width="112" height="112" data-th="${t}"></canvas><div><div class="t">${d.n} · ₵${d.cost}</div>
    <div class="d">${lock?'Dostępne od: '+LEVELS[d.ul].t.toLowerCase()+'.':esc(d.d)+(d.pow?' '+(d.pow>0?'+':'')+d.pow+' ⚡':'')}</div></div></div>`;}
  sheet.innerHTML=h+'<div class="row"><button class="b" data-act="close">Zamknij</button></div>';
  sheet.querySelectorAll('canvas[data-th]').forEach(c=>thumb(c,SPR.mod[c.dataset.th].c));showSheet();}
function taskName(c){if(c.confused>0)return 'nie pamięta, kim jest';const t=c.task;if(!t)return 'myśli';
  return {fire:'gasi pożar',breach:'łata dziurę',repair:'naprawia: '+(t.m?MOD[t.m.t].n.toLowerCase():''),maint:'konserwuje: '+(t.m?MOD[t.m.t].n.toLowerCase():''),heal:'leczy się',fight:'walczy',move:'idzie we wskazane miejsce',idle:c.hold>0?'pilnuje miejsca':'nudzi się'}[t.k]||'';}
function openCrew(){UI.sheet={mode:'crew'};const cap=crewCap(),rc=realCrew();let h='<div class="sh">Załoga</div><p class="d" style="margin:2px 0 8px">Dotknij osoby, a potem celu na statku, żeby wydać rozkaz.</p>';
  for(const c of G.crew){h+=`<div class="card" data-act="sel:${c.id}"><canvas width="40" height="64" data-cr="${c.id}" style="width:28px;height:44px"></canvas><div><div class="t">${esc(c.name)}</div>
    <div class="d">${c.clone?'kopia z innego dnia':(c.g==='f'?ROLE[c.role].nf:ROLE[c.role].n)} · <span id="cr${c.id}"></span></div></div></div>`;}
  h+=`<p class="d">Miejsca: ${rc.length}/${cap}. Więcej miejsc dają kajuty.</p><div class="row">
    <button class="b" data-act="hire:mech" ${rc.length>=cap||G.money<ROLE.mech.hire?'disabled':''}>Zatrudnij mechanika ₵${ROLE.mech.hire}</button>
    <button class="b" data-act="hire:guard" ${rc.length>=cap||G.money<ROLE.guard.hire?'disabled':''}>Zatrudnij komandosa ₵${ROLE.guard.hire}</button>
    <button class="b" data-act="close">Zamknij</button></div>`;
  sheet.innerHTML=h;sheet.querySelectorAll('canvas[data-cr]').forEach(cv2=>{const c=G.crew.find(o=>o.id==cv2.dataset.cr);if(c)thumb(cv2,SPR.crew[c.clone?'clone':c.role][0]);});showSheet();sheetTick();}
function openLog(){UI.sheet={mode:'log'};sheet.innerHTML='<div class="sh">Dziennik pokładowy</div>'+(G.log.length?G.log.map(t=>`<p class="d" style="color:var(--ink)">${esc(t)}</p>`).join(''):'<p class="d">Jeszcze pusto. To się szybko zmieni.</p>')+'<div class="row"><button class="b" data-act="close">Zamknij</button></div>';showSheet();}
function sheetTick(){const s=UI.sheet;if(!s)return;
  if(s.mode==='mod'){const m=s.m;if(!G.mods.includes(m)){closeSheet();return;}const st=$('#mSt'),we=$('#mWe');if(st)st.textContent=modStatus(m);if(we)we.style.width=Math.round(m.broken?100:m.wear)+'%';}
  if(s.mode==='crew')for(const c of G.crew){const el=$('#cr'+c.id);if(el)el.textContent='HP '+Math.max(0,Math.round(c.hp))+' · '+taskName(c)+(c.clone?' · znika za '+Math.ceil(c.life)+' s':'');}}
sheet.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el||!G)return;sfx('click');const a=el.dataset.act;if(!a)return;
  if(a==='close'){closeSheet();return;}
  if(a.startsWith('b:')){enterBuild(a.slice(2));return;}
  if(a.startsWith('sel:')){const c=G.crew.find(o=>o.id==a.slice(4));if(c){UI.sel=c;closeSheet();showHint(c.name+': dotknij celu na statku.',true);}return;}
  if(a.startsWith('hire:')){hire(a.slice(5));openCrew();return;}
  const m=UI.sheet&&UI.sheet.m;if(!m)return;
  if(a==='fix'){const cs=realCrew().filter(c=>c.confused<=0).sort((p,q)=>(p.role==='mech'?0:1)-(q.role==='mech'?0:1)||Math.hypot(p.x-m.gx,p.y-m.gy)-Math.hypot(q.x-m.gx,q.y-m.gy));
    if(!cs.length){toast('Nie ma kogo wysłać.');return;}setCmd(cs[0],m.broken?{k:'repair',m}:{k:'maint',m});toast(cs[0].name+' już idzie.');closeSheet();}
  else if(a==='up'){const c=upCost(m);if(G.money<c){toast('Za mało kredytów.');return;}G.money-=c;m.lvl++;m.wear=0;burst(IX(m.gx,m.gy),IY(m.gx,m.gy)+10,16,20,'#ffd04a');
    if(R()<.5)addLog('Ulepszyłem moduł: '+MOD[m.t].n.toLowerCase()+'. Teraz psuje się z większą klasą.');openMod(m);}
  else if(a==='nm'){nMachine(m);closeSheet();}
  else if(a==='ammo'){if(G.money<30){toast('Za mało kredytów.');return;}G.money-=30;m.ammo=150;sfx('reload');toast('Działko załadowane.');openMod(m);}
  else if(a==='sell'){const same=G.mods.filter(o=>o.t===m.t).length;if((m.t==='engine'||m.t==='reactor')&&same<=1){toast('To ostatni taki moduł. Bez niego nie dolecisz.');return;}
    if(!UI.confirmSell){UI.confirmSell=true;$('#bSell').textContent='Na pewno? Dotknij jeszcze raz';return;}
    G.money+=Math.floor(MOD[m.t].cost*.4*m.lvl);G.mods.splice(G.mods.indexOf(m),1);rebuildOcc();closeSheet();}});
function hire(role){const cap=crewCap(),rc=realCrew();const cost=ROLE[role].hire;if(rc.length>=cap){toast('Brak miejsc. Zbuduj kajuty.');return;}if(G.money<cost){toast('Za mało kredytów.');return;}
  const used=new Set(G.crew.map(c=>c.name));const free=NAMES.filter(n=>!used.has(n[0]));const [name,g]=free.length?pick(free):[pick(NAMES)[0]+' II',pick(['m','f'])];
  G.money-=cost;const c=newCrew(name,g,role);placeUnit(c);G.crew.push(c);burst(IX(c.x,c.y),IY(c.x,c.y),10,14,'#7ff8ff');
  addLog('Zatrudniłem: '+name+'. W CV '+(g==='f'?'wpisała':'wpisał')+' „wieloletnie doświadczenie z próżnią”.');}
function showHint(html,cancel){hint.innerHTML='<span>'+html+'</span>'+(cancel?'<button class="b" data-h="x">Anuluj</button>':'');hint.classList.add('show');}
function hideHint(){hint.classList.remove('show');}
hint.addEventListener('click',e=>{const b=e.target.closest('[data-h]');if(!b)return;if(b.dataset.h==='x'){UI.build=null;UI.sel=null;UI.ability=null;hideHint();renderLogMini();}
  if(b.dataset.h==='ok'&&UI.build)tryPlace();});
function enterBuild(t){closeSheet();if(G.money<MOD[t].cost){toast('Za mało kredytów (₵'+MOD[t].cost+').');return;}UI.build={t,gx:null,gy:null,why:null};UI.sel=null;
  showHint('Stawiasz: '+MOD[t].n+'. Dotknij miejsca na statku.',true);renderLogMini();}
function tryPlace(){const b=UI.build;if(!b||b.gx==null)return;b.why=canPlace(b.t,b.gx,b.gy);if(b.why){toast(b.why);return;}
  G.money-=MOD[b.t].cost;
  if(MOD[b.t].hullSeg){G.extra.push([b.gx,b.gy,2,2]);const nb=new Set([key(b.gx,b.gy),key(b.gx+1,b.gy),key(b.gx,b.gy+1),key(b.gx+1,b.gy+1)]);buildHull(nb);UI.popT0=UI.time;sfx('weld');
    if(!G.tips.has('seglog')){G.tips.add('seglog');addLog('Dospawałem kawałek kadłuba. Spawy trzymają, a przynajmniej tak twierdzą.');}UI.build=null;hideHint();renderLogMini();return;}
  sfx('build');const m=addMod(b.t,b.gx,b.gy,1);m.wear=0;for(const u of [...G.crew,...G.aliens])unstick(u);
  burst(IX(b.gx,b.gy),IY(b.gx,b.gy)+10,18,22,'#7ff8ff');UI.build=null;hideHint();renderLogMini();}
function buildTap(tx,ty){const b=UI.build,s=MOD[b.t].s;const gx=s===2?Math.round(tx-1):Math.floor(tx),gy=s===2?Math.round(ty-1):Math.floor(ty);
  if(b.gx===gx&&b.gy===gy&&!b.why){tryPlace();return;}b.gx=gx;b.gy=gy;b.why=canPlace(b.t,gx,gy);
  showHint(b.why?esc(b.why):'Dobre miejsce. Dotknij jeszcze raz albo:'+' <button class="b" data-h="ok">Postaw ₵'+MOD[b.t].cost+'</button>',true);}

// HUD
function setChip(id,txt,low){const el=$('#'+id);if(el.textContent!==txt)el.textContent=txt;el.classList.toggle('low',!!low);}
function hud(){renderAbil();if(!G)return;const f=!!G.psych;const L=LEVELS[G.lvl];
  const hl=Math.max(0,Math.ceil(G.hull));setChip('hHull','❤ '+(f?100:hl),!f&&hl<30);
  const sh=$('#hShield');if(G.smax>0){sh.style.display='';setChip('hShield','🛡 '+Math.round(G.shield),false);}else sh.style.display='none';
  setChip('hO2','O₂ '+(f?100:Math.round(G.o2))+'%',!f&&G.o2<30);
  setChip('hPow',f?'⚡ ∞':'⚡ '+Math.round(G.prod)+'/'+Math.round(G.cons),!f&&G.pr<1);
  setChip('hMoney','₵ '+Math.floor(G.money),false);setChip('hCrew','👥 '+realCrew().length+'/'+crewCap(),false);
  $('#progT').textContent=L.t+': '+Math.floor(G.prog/L.dist*100)+'% · dzień '+G.day;$('#progfill').style.width=(G.prog/L.dist*100)+'%';
  const it=[];
  for(const m of G.mods)if(m.hot>0)it.push('☢ Reaktor wybuchnie za '+Math.ceil(m.hot)+' s');
  if(G.grav)it.push(GRAV[G.grav.type].i+' '+GRAV[G.grav.type].n+': '+Math.ceil(G.grav.t)+' s');
  const k=G.kurdel;if(k)it.push(k.ph==='app'?'🐋 Kurdel się zbliża':k.ph==='in'?'🐋 W kurdlu. Kichnięcie: '+Math.round(100-k.hp/k.max*100)+'%':'🤧 Na zewnątrz!');
  if(G.dragon)it.push('🐉 Smok: '+Math.round(G.dragon.p*100)+'%. Dotykaj go!');
  if(G.swarm)it.push('⬛ Chmura: '+Math.ceil(G.swarm.t)+' s');
  const cl=G.crew.filter(c=>c.clone);if(cl.length)it.push('🌀 Kopie z innych dni: '+Math.ceil(Math.max(...cl.map(c=>c.life)))+' s');
  if(G.engBuf)it.push((G.engBuf.m>1?'🚀 Silnik szybciej: ':'🐌 Silnik wolniej: ')+Math.ceil(G.engBuf.t)+' s');
  if(G.blackout>0)it.push('🌑 Ciemność');
  const na=G.aliens.filter(hostile).length;if(na&&!f)it.push('🩸 Obcy na pokładzie: '+na);
  let str=it.join(' · ');if(f)str='🌈 Wszystko jest dobrze <button data-x="pill">💊 Otrzeźwij ₵100</button>';
  const st=$('#hStat');if(str!==UI.statStr){UI.statStr=str;st.innerHTML=str;st.style.display=str?'':'none';}}
$('#hStat').addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(!b||!G)return;if(b.dataset.x==='pill'){if(G.money<100){toast('Za mało kredytów.');return;}G.money-=100;endPsych();}});

// modals
function modal(html,onClick){const mb=$('#mbox');mb.innerHTML=html;$('#modal').classList.add('show');mb.onclick=onClick;mb.scrollTop=0;}
function closeModal(){$('#modal').classList.remove('show');if(G)G.modal=false;}
function popup(o){G.modal=true;closeSheet();
  modal(`<h2>${o.title}</h2>${o.text.map(p=>'<p>'+esc(p)+'</p>').join('')}<div class="choices">${o.ch.map((c,i)=>`<button class="b" data-i="${i}" ${c.dis?'disabled':''}>${esc(c.t)}</button>`).join('')}</div>`,
  e=>{const b=e.target.closest('button[data-i]');if(!b||b.disabled)return;const c=o.ch[+b.dataset.i];closeModal();if(c.f)c.f();});}
function showIntro(){G.modal=true;const L=LEVELS[G.lvl];const un=Object.keys(MOD).filter(t=>MOD[t].ul===G.lvl&&G.lvl>0).map(t=>MOD[t].n);
  modal(`<h2>${L.t}</h2><div class="sub">${L.sub}</div><p>Dzień pierwszy. ${esc(L.intro)}</p><p><b>Cel:</b> ${esc(L.goal)}</p>
  ${G.lvl>0?'<p><b>Statek urósł.</b> Stocznia dospawała nowe sekcje kadłuba.'+(un.length?' Nowe moduły: '+un.join(', ')+'.':'')+(G.lvl===1?' Nowa umiejętność: 🌬 Śluza.':'')+'</p>':''}
  ${L.tut?'<p><b>To jest samouczek.</b> W trakcie lotu pojawią się podpowiedzi 💡. Załoga sama gasi, naprawia i walczy. Ty budujesz, ulepszasz i wydajesz rozkazy: dotknij członka załogi, potem celu.</p>':''}
  <div class="choices"><button class="b" data-go="1">Start</button></div>`,
  e=>{if(e.target.closest('[data-go]')){closeModal();UI.popT0=UI.time;addLog(L.intro.split('. ')[0]+'.');}});}
function levelDone(){sfx('win');G.running=false;G.modal=true;closeSheet();const L=LEVELS[G.lvl];const last=G.lvl>=LEVELS.length-1;
  modal(`<h2>${L.t}: koniec</h2><p>${esc(L.outro)}</p><p class="d">Dni w podróży: ${G.day}. Kredyty: ₵${Math.floor(G.money)}${last?'':' (+₵'+LEVELS[G.lvl+1].bonus+' premii)'}. Pokonani obcy: ${G.kills}.</p>
  <div class="choices">${last?'<button class="b" data-go="menu">Wróć do menu</button>':'<button class="b" data-go="next">Dalej: '+LEVELS[G.lvl+1].t.toLowerCase()+'</button>'}</div>`,
  e=>{const b=e.target.closest('[data-go]');if(!b)return;if(b.dataset.go==='next'){const s=snapNext();closeModal();startLevel(s);}else{closeModal();saveSnap(null);try{localStorage.removeItem(SKEY);}catch(e2){}title();}});}
function gameOver(why){sfx('lose');G.running=false;G.modal=true;closeSheet();
  modal(`<h2>Koniec podróży</h2><p>${esc(why)}</p><p class="d">Dotarłeś do ${Math.floor(G.prog/LEVELS[G.lvl].dist*100)}% trasy. Możesz zacząć tę podróż od nowa, ze statkiem i kredytami z jej początku.</p>
  <div class="choices"><button class="b" data-go="retry">Spróbuj jeszcze raz</button><button class="b" data-go="menu">Menu</button></div>`,
  e=>{const b=e.target.closest('[data-go]');if(!b)return;closeModal();if(b.dataset.go==='retry')startLevel(G.snap);else title();});}
function title(){if(!G||!G.demo){newGame(true);}G.modal=true;const s=loadSnap();
  modal(`<h1>Kosmopatologia</h1><div class="sub">Dzienniki z rakiety, która ciągle się psuje</div>
  <p>Jesteś kapitanem starego statku. Wieziesz pierogi, filozofów i siebie. Po drodze psuje się wszystko, co może, a także kilka rzeczy, które nie powinny.</p>
  <div class="choices">${s&&s.lvl!==undefined?`<button class="b" data-go="cont">Kontynuuj: ${LEVELS[s.lvl].t.toLowerCase()}</button>`:''}<button class="b" data-go="new">Nowa gra</button><button class="b" data-go="help">Jak grać</button></div>`,
  e=>{const b=e.target.closest('[data-go]');if(!b)return;const g=b.dataset.go;if(g==='new'){closeModal();newGame(false);}else if(g==='cont'){closeModal();startLevel(s);}else if(g==='help')help();});}
function help(){modal(`<h2>Jak grać</h2>
  <p>Statek leci sam, dopóki działa silnik. Pasek u góry pokazuje, ile zostało do celu. Gdy dolecisz, podróż się kończy, a statek rośnie.</p>
  <p>Pilnuj trzech rzeczy: ❤ kadłub, O₂ tlen i ⚡ prąd. Gdy prądu jest za mało, wszystko działa słabiej i gaśnie światło.</p>
  <p>Załoga sama gasi pożary, łata dziury, naprawia i walczy. Możesz wydać rozkaz: dotknij osoby, potem celu (obcego, modułu, pożaru albo podłogi).</p>
  <p>🔧 Buduj stawia nowe moduły na wolnych polach. Wieżyczki stoją tylko przy burcie. Dotknij modułu, żeby go ulepszyć, naprawić albo rozebrać.</p>
  <p>Przesuwaj statek palcem, przybliżaj dwoma palcami. Gra zapisuje się na początku każdej podróży.</p>
  <div class="choices"><button class="b" data-go="back">Wróć</button></div>`,e=>{if(e.target.closest('[data-go]'))title();});}

// input
const ptrs=new Map();let drag=null,pinch=null;
function zoomAt(px,py,nz){nz=clamp(nz,1,12);if(nz===cam.z)return;const wx=(px-cam.x)/cam.z,wy=(py-cam.y)/cam.z;cam.z=nz;cam.x=px-wx*nz;cam.y=py-wy*nz;}
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===1)drag={moved:false,sx:e.clientX,sy:e.clientY,lx:e.clientX,ly:e.clientY};
  else if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:cam.z,mx:(a.x+b.x)/2,my:(a.y+b.y)/2};if(drag)drag.moved=true;}});
cv.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;p.x=e.clientX;p.y=e.clientY;
  if(pinch&&ptrs.size>=2){const [a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
    cam.x+=(mx-pinch.mx)*DPR;cam.y+=(my-pinch.my)*DPR;pinch.mx=mx;pinch.my=my;zoomAt(mx*DPR,my*DPR,Math.round(pinch.z*d/pinch.d));}
  else if(drag){const dx=e.clientX-drag.lx,dy=e.clientY-drag.ly;drag.lx=e.clientX;drag.ly=e.clientY;
    if(!drag.moved&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>9)drag.moved=true;if(drag.moved){cam.x+=dx*DPR;cam.y+=dy*DPR;}}});
function pend(e){if(!ptrs.has(e.pointerId))return;ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;
  if(ptrs.size===0){if(drag&&!drag.moved&&e.type==='pointerup')tap(e.clientX*DPR,e.clientY*DPR);drag=null;}}
cv.addEventListener('pointerup',pend);cv.addEventListener('pointercancel',pend);
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.clientX*DPR,e.clientY*DPR,cam.z+(e.deltaY<0?1:-1));},{passive:false});
function pickU(list,px,py){let best=null,bd=1e9;for(const u of list){const s=u._scr;if(!s)continue;const d=Math.hypot(px-s.x,py-s.y);if(d<s.r&&d<bd){bd=d;best=u;}}return best;}
function pickMod(px,py,gx,gy){const m=modAt(gx,gy);if(m)return m;
  const ms=[...G.mods].sort((a,b)=>(b.gx+b.gy)-(a.gx+a.gy));
  for(const o of ms){const sp=SPR.mod[o.t];const X=sx(IX(o.gx,o.gy)-sp.ox),Y=sy(IY(o.gx,o.gy)-sp.oy);if(px>=X+sp.w*Z*.15&&px<=X+sp.w*Z*.85&&py>=Y&&py<=Y+sp.H*Z+4*Z)return o;}return null;}
function tap(px,py){if(!G||G.modal)return;
  if(Math.abs(G.tilt)>.001){const dx=px-W/2,dy=py-H/2,c=Math.cos(-G.tilt),s=Math.sin(-G.tilt);px=W/2+dx*c-dy*s;py=H/2+dx*s+dy*c;}
  const wx=(px-CX)/Z,wy=(py-CY)/Z,tx=(wx/16+wy/8)/2,ty=(wy/8-wx/16)/2,gx=Math.floor(tx),gy=Math.floor(ty);
  if(UI.build){buildTap(tx,ty);return;}
  if(UI.ability){abilityTap(px,py,tx,ty,gx,gy);return;}
  {const lat=G.crew.find(c=>c.latched&&c._scr&&Math.hypot(px-c._scr.x,py-c._scr.y)<c._scr.r);if(lat){ripOff(lat);return;}}
  {const pool=[...G.crew,...G.aliens.filter(a=>a.disg)];const u=pickU(pool,px,py);if(u&&u.disg){if(UI.sel){UI.sel=null;hideHint();}tapMimic(u);return;}}
  if(G.dragon&&G.dragon._scr&&Math.hypot(px-G.dragon._scr.x,py-G.dragon._scr.y)<G.dragon._scr.r){observeDragon();return;}
  const c=pickU(G.crew,px,py);
  if(c&&c!==UI.sel){UI.sel=c;closeSheet();showHint(esc(c.name)+': dotknij celu na statku.',true);return;}
  if(UI.sel){const s=UI.sel;UI.sel=null;hideHint();renderLogMini();if(!G.crew.includes(s))return;if(c===s){toast('Rozkaz anulowany.');return;}
    const a=pickU(G.aliens.filter(a=>!a.friendly),px,py);if(a){setCmd(s,{k:'fight',a});return;}
    const k=key(gx,gy);if(G.fires.has(k)){setCmd(s,{k:'fire',key:k});return;}if(G.breaches.has(k)){setCmd(s,{k:'breach',key:k});return;}
    const m=pickMod(px,py,gx,gy);if(m){setCmd(s,m.broken?{k:'repair',m}:{k:'maint',m});return;}
    if(walk(gx,gy)){setCmd(s,{k:'move',x:gx,y:gy});return;}toast('Tam nie da się dojść.');return;}
  const m=pickMod(px,py,gx,gy);if(m){openMod(m);return;}
  closeSheet();}

$('#bBuild').onclick=()=>{if(!G||G.modal)return;if(UI.sheet&&UI.sheet.mode==='build')closeSheet();else openBuild();};
$('#bCrew').onclick=()=>{if(!G||G.modal)return;if(UI.sheet&&UI.sheet.mode==='crew')closeSheet();else openCrew();};
$('#bLog').onclick=()=>{if(!G||G.modal)return;if(UI.sheet&&UI.sheet.mode==='log')closeSheet();else openLog();};
$('#bPause').onclick=()=>{UI.paused=!UI.paused;$('#bPause').textContent=UI.paused?'▶':'⏸';$('#bPause').setAttribute('aria-label',UI.paused?'Wznów':'Pauza');if(UI.paused)toast('Pauza');};
$('#bSnd').onclick=()=>{audioInit();setSound(!SND.on);$('#bSnd').textContent=SND.on?'🔊':'🔇';};
$('#bSnd').textContent=SND.on?'🔊':'🔇';
$('#bSpeed').onclick=()=>{UI.speed=UI.speed===1?2:1;$('#bSpeed').textContent=UI.speed+'×';};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G&&!G.demo&&!UI.paused)$('#bPause').click();});
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();$('#bPause').click();}});
addEventListener('resize',()=>{resize();});

// loop
let last=performance.now(),tickT=0;
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;UI.time+=dt;
  if(G&&G.running&&!G.modal&&!UI.paused&&!G.demo){let rem=dt*UI.speed;while(rem>1e-4){const d=Math.min(rem,.034);update(d);rem-=d;}}
  if(G&&G.demo){G.t+=dt;G.warp=.16;G.starOff+=dt*1.3;}
  try{render(UI.time);}catch(err){console.error(err);}
  tickT-=dt;if(tickT<=0){tickT=.2;hud();sheetTick();ambTick();}
  requestAnimationFrame(frame);}
