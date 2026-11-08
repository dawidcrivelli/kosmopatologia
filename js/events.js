// ---------- events ----------
function sector(x,y){return String.fromCharCode(65+clamp(y-2,0,25))+'-'+x;}
function edgeWalk(){const e=G.edge.filter(([x,y])=>walk(x,y));return e.length?pick(e):null;}
function alienType(){const a=LEVELS[G.lvl].aliens,r=R();if(a.includes('skok')&&r<.22)return 'skok';if(a.includes('gebo')&&r<.5)return 'gebo';return 'mlask';}
const GRAV={
  float:{n:'Nieważkość',i:'🎈',a:'Grawitacja wyszła na chwilę. Pierogi unoszą się w korytarzu jak małe, smutne sterowce.',e:'Grawitacja wróciła. Pierogi spadły. Nikt nie przyznaje się, że płakał.'},
  side:{n:'Grawitacja boczna',i:'↘',a:'Grawitacja przesunęła się w bok. Podłoga jest teraz trochę ścianą, a ściana trochę podłogą.',e:'Grawitacja wróciła na dół. Załoga zbiera się spod ścian.'},
  ceiling:{n:'Sufit jest podłogą',i:'🙃',a:'Grawitacja odwróciła się. Załoga chodzi po suficie i twierdzi, że stąd lepiej widać usterki.',e:'Grawitacja wróciła na miejsce. Załoga spadła z sufitu. Z godnością.'},
  heavy:{n:'Superciężkość',i:'🏋',a:'Grawitacja wzrosła pięciokrotnie. Wszyscy są niżsi, a kanapki płaskie.',e:'Grawitacja wróciła do normy. Kanapki pozostały płaskie.'}};
const EV={
  breakdown(){const ms=G.mods.filter(m=>!m.broken);if(!ms.length)return false;ms.sort((a,b)=>b.wear-a.wear);const m=R()<.6?ms[0]:pick(ms);breakMod(m,'event');banner('⚙ Awaria: '+MOD[m.t].n);return true;},
  reactorHot(){const ms=G.mods.filter(m=>m.t==='reactor'&&!m.broken);if(!ms.length)return false;const m=pick(ms);breakMod(m,'silent');m.hot=25;
    banner('☢ Przegrzanie reaktora');addLog('Reaktor rozgrzał się do temperatury, w której pierogi same się lepią. Jeśli nikt go nie naprawi w 25 sekund, zrobi z nas mgławicę.');G.alarm=25;return true;},
  fire(){const t=pick(G.tiles);addFire(t.x,t.y,.5);const [dx,dy]=pick(DIRS);addFire(t.x+dx,t.y+dy,.3);banner('🔥 Pożar w sektorze '+sector(t.x,t.y));addLog(pk(TXT.fire));return true;},
  meteors(){G.meteorQ+=4+G.lvl*2;if(G.lvl>=1&&R()<.45)G.timers.push({t:5,f:()=>spawnBolid()});banner('☄ Deszcz meteorów');addLog(pk(TXT.meteor));return true;},
  raid(){const have=G.ext.filter(e=>e.k==='ship').length;if(have>=3)return false;const n=Math.min(3-have,1+(G.lvl>=2?1:0)+(R()<.25?1:0));for(let i=0;i<n;i++)spawnShip();banner('👾 Napad obcych');addLog(pk(TXT.raid));return true;},
  board(n){const e=edgeWalk();if(!e)return false;addBreach(e[0],e[1]);G.alarm=8;const p=G.prog/LEVELS[G.lvl].dist;n=n||Math.round(2+G.lvl*1.4+p*3);
    for(let i=0;i<n;i++)spawnAlien(alienType(),e[0],e[1],.6+i*1.1);banner('🩸 Abordaż w sektorze '+sector(e[0],e[1]));addLog(pk(TXT.board));return true;},
  vent(){const vs=G.vents.filter(([x,y])=>isHull(x,y));if(!vs.length)return false;let [x,y]=pick(vs);if(!walk(x,y)){const t=randomWalkable();x=t.x;y=t.y;}
    G.scare={t:.3};G.shake=.5;sfx('screech');const n=1+G.lvl;for(let i=0;i<n;i++)spawnAlien(alienType(),x,y,.4+i*1.2);banner('🕳 Coś w wentylacji');addLog(pk(TXT.vent));return true;},
  scare(){G.blackout=7;addLog('Zgasło światło. W ciemności ktoś szepnął moje imię. Policzyłem załogę: wszyscy stali obok mnie.');
    G.timers.push({t:3.2,f:()=>{const vs=G.vents.filter(([x,y])=>isHull(x,y));G.scare={t:.45};G.shake=.7;sfx('scare');}});
    G.timers.push({t:7.3,f:()=>addLog('Światło wróciło. W szybie wentylacyjnym nic nie było. Prawie nic.')});return true;},
  grav(type){if(G.grav)return false;type=type||pick(Object.keys(GRAV));const d=pick(DIRS);
    G.grav={type,t:22,dir:d,slide:1.3,tilt:type==='side'?((d[0]-d[1])>0?1:-1)*.11:0};
    sfx('grav');banner(GRAV[type].i+' '+GRAV[type].n);addLog(GRAV[type].a);return true;},
  vortex(){const pool=realCrew();if(!pool.length)return false;const names=[];
    for(let i=0;i<2;i++){const src=pick(pool);const n=newCrew(src.name+' z '+pk(TXT.days),src.g,'mech');n.clone=true;n.life=40;const t=randomWalkable();n.x=t.x+.5;n.y=t.y+.5;
      G.crew.push(n);burst(IX(n.x,n.y),IY(n.x,n.y),10,16,'#7ab4ff');names.push(n.name);}
    G.cloneEndLog=false;sfx('vortex');banner('🌀 Wir czasowy');addLog('Wlecieliśmy w wir czasowy. Na pokładzie pojawili się '+names[0]+' i '+names[1]+'. Kłócą się, kto z nich jest prawdziwy. Wszyscy się mylą.');return true;},
  ster(){const e=G.mods.find(m=>m.t==='engine'&&!m.broken)||G.mods.find(m=>m.t==='engine');if(!e)return false;breakMod(e,'silent');e.needs2=true;
    banner('⚙ Urwany ster');addLog('Urwał się ster. Do naprawy trzeba dwóch osób: jedna trzyma śrubę, druga dokręca. Każdy chce dokręcać, nikt nie chce trzymać.');
    G.timers.push({t:9,f:()=>EV.vortex()});return true;},
  pralki(){if(!G.mods.some(m=>m.t==='quarters')||G.pralkiOK)return false;
    popup({title:'🧺 Bunt pralek',text:['Pralki z kajut zebrały się na wiecu. Żądają praw obywatelskich, dwóch dni wolnego w tygodniu i prawa do wirowania bez nadzoru.','Grożą, że jeśli odmówisz, przestaną być tylko pralkami.'],
      ch:[{t:'Uznaj ich prawa (₵150)',dis:G.money<150,f:()=>{G.money-=150;G.pralkiOK=true;addLog('Pralki założyły partię i wygrały wybory w kajutach. Pranie jest teraz podejrzanie czyste, a ranni lepiej odpoczywają.');}},
          {t:'Odmów',f:()=>{const q=G.mods.find(m=>m.t==='quarters');const n=2+G.lvl;let k=0;
            for(let y=q.gy-1;y<=q.gy+2&&k<n;y++)for(let x=q.gx-1;x<=q.gx+2&&k<n;x++)if(adjMod(q,x,y)){spawnAlien('pralka',x,y,.3+k*.8);k++;}
            G.alarm=6;banner('🧺 Rewolucja pralek');addLog('Pralki ogłosiły rewolucję. Wirują po korytarzu z wrogimi zamiarami.');}}]});return true;},
  sepulki(){const buy=c=>{G.money-=c;const r=R();
      if(r<.3){G.bonusPow+=4;addLog('Kupiłem sepulkę. Nie wiem, co robi, ale reaktor jakby się uspokoił. (+4 ⚡ na stałe)');}
      else if(r<.55){for(const c2 of G.crew)c2.hp=100;addLog('Kupiłem sepulkę. Załoga od razu poczuła się lepiej. Nikt nie chce mówić dlaczego.');}
      else if(r<.8){G.money+=c*2;addLog('Kupiłem sepulkę i od razu odsprzedałem ją kupcowi za dwa razy więcej. On też nie wie, co to jest.');}
      else addLog('Kupiłem sepulkę. Nic się nie stało. Prawdopodobnie tak ma być.');};
    popup({title:'📦 Kupiec z Enteropii',text:['Do śluzy przycumował kupiec. Oferuje sepulkę: nowy model, prawie nieużywaną. Twierdzi, że każdy porządny statek ma przynajmniej jedną.'],
      ch:[{t:'Kup sepulkę (₵200)',dis:G.money<200,f:()=>buy(200)},
          {t:'Zapytaj, co to jest',f:()=>{addLog('Sprawdziłem w encyklopedii pokładowej. SEPULKA: zob. SEPULIARNIA. SEPULIARNIA: miejsce, gdzie się sepuli. SEPULENIE: czynność wykonywana sepulką. Wiem tyle, co przedtem.');
            popup({title:'📦 Kupiec z Enteropii',text:['Kupiec patrzy na ciebie z politowaniem. Mówi, że kto pyta, ten płaci mniej, i obniża cenę.'],
              ch:[{t:'Kup sepulkę (₵120)',dis:G.money<120,f:()=>buy(120)},{t:'Odmów',f:()=>addLog('Kupiec odleciał obrażony. Na pożegnanie zasepulił nam antenę.')}]});}},
          {t:'Odmów',f:()=>addLog('Odmówiłem kupna sepulki. Kupiec spojrzał na mnie jak na kogoś, kto nie ma sepulki.')}]});return true;},
  inspektor(){popup({title:'📋 Kontrola z Urzędu Miar',text:['Na pokład wszedł urzędnik Galaktycznego Urzędu Miar i Wag. Twierdzi, że statek jest o trzy centymetry za długi.','Żąda opłaty karnej albo wypełnienia formularza K-412 w czterech egzemplarzach.'],
      ch:[{t:'Zapłać (₵120)',dis:G.money<120,f:()=>{G.money-=120;addLog('Zapłaciłem karę. Urzędnik wystawił paragon dłuższy niż statek.');}},
          {t:'Wypełnij formularz',f:()=>{G.engBuf={m:.5,t:40};addLog('Wypełniam formularz. Urzędnik każe teraz poświadczyć, że formularz jest wypełniony. Na formularzu. Silnik zwalnia z nudów.');}}]});return true;},
  poet(){popup({title:'🖋 Komputer pokładowy pisze wiersze',text:['Komputer nawigacyjny przestał nawigować, bo zajął się poezją. Przedstawia swój najnowszy utwór:',pk(TXT.poems)],
      ch:[{t:'Pochwal wiersz',f:()=>{G.engBuf={m:1.4,t:30};addLog('Komputer wzruszony. Leci szybciej, żeby zdążyć napisać sequel.');}},
          {t:'Skrytykuj',f:()=>{G.blackout=15;G.money+=100;addLog('Komputer obrażony. Zgasił światło, żebyśmy nie widzieli, jak płacze. Przy okazji sprzedał prawa do wiersza i przelał nam 100 kredytów.');}},
          {t:'Zamów odę do kadłuba (₵80)',dis:G.money<80,f:()=>{G.money-=80;G.hull=Math.min(100,G.hull+15);addLog('Oda była tak piękna, że kadłub zalepił się ze wzruszenia. (+15 ❤)');}}]});return true;},
  kurdel(){if(G.kurdel)return false;G.kurdel={ph:'app',t:9,hp:520,max:520,spawn:7};sfx('kurdel');banner('🐋 Kurdel na kursie');
    addLog('Przed nami kurdel. Największe zwierzę w mgławicy, długie jak powiat i równie bystre. Uważa nas za przekąskę.');return true;},
  psych(){if(G.psych)return false;G.psych={t:55};G.psychHidden=[];addLog('Klimatyzacja rozpyla coś, co pachnie truskawkami. Nagle wszystko jest piękne. Statek jest piękny. Załoga jest piękna. Kadłub ma sto procent.');
    sfx('psych');banner('🌈 Wszystko jest dobrze');G.timers.push({t:4,f:()=>EV.board(3)});G.timers.push({t:12,f:()=>EV.fire()});return true;},
  swarm(){if(G.swarm)return false;G.swarm={t:45,a:R()*6,cd:3,x:G.cx,y:G.cy};sfx('swarm');banner('⬛ Chmura');
    addLog('Za burtą pojawiła się chmura czarnych kryształków. Nie jest żywa ani martwa i najwyraźniej nas nie lubi. Przelatuje przez kadłub jak przez mgłę.');return true;},
  dragon(){if(G.dragon)return false;G.dragon={p:.18,t:50,bite:3,a:R()*6,x:G.cx,y:G.cy};banner('🐉 Smok prawdopodobieństwa');
    addLog('Wskaźnik nieprawdopodobieństwa rośnie. Za burtą coraz prawdopodobniej jest smok. Dotykaj go, żeby go obserwować: obserwowany smok robi się mniej prawdopodobny.');return true;},
  final(){EV.raid();G.timers.push({t:3,f:()=>EV.board(5)});G.meteorQ+=6;banner('💀 Ostatnia próba');
    addLog('Wszystko, co do tej pory chciało nas zjeść, zebrało się w jednym miejscu. Postanowiło zjeść nas wspólnie.');return true;},
};
function fireEvent(name){if(name.startsWith('tip:')){showTip(name.slice(4));return true;}try{const ok=EV[name]()!==false;const tid=name==='board'?'vent':name==='bolid'?'':name;if(ok&&TIPS[tid])showTip(tid);return ok;}catch(e){console.error(e);return false;}}
function weighted(pool){let s=0;for(const k in pool)s+=pool[k];let r=R()*s;for(const k in pool){r-=pool[k];if(r<=0)return k;}return Object.keys(pool)[0];}
function runEvents(dt){const L=LEVELS[G.lvl],p=G.prog/L.dist;
  for(const tm of [...G.timers]){tm.t-=dt;if(tm.t<=0&&!tm.done){tm.done=true;tm.f();}}G.timers=G.timers.filter(t=>!t.done);
  while(G.scriptI<L.script.length&&p>=L.script[G.scriptI][0]){G.evQueue.push(L.script[G.scriptI][1]);G.scriptI++;}
  G.evCool-=dt;if(G.evQueue.length&&!G.modal&&G.evCool<=0){fireEvent(G.evQueue.shift());G.evCool=5;G.nextEv=Math.max(G.nextEv,8);}
  G.nextEv-=dt;if(G.nextEv<=0&&!G.modal){G.nextEv=rnd(L.evInt[0],L.evInt[1])*(1-.3*p)/L.inten;for(let i=0;i<4;i++)if(fireEvent(weighted(L.pool)))break;}}

