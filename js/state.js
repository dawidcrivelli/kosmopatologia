// ---------- state ----------
let G=null;
const idx=(x,y)=>y*GW+x, inb=(x,y)=>x>=0&&y>=0&&x<GW&&y<GH;
const key=(x,y)=>x+','+y, unkey=k=>k.split(',').map(Number);
function isHull(x,y){return inb(x,y)&&G.hm[idx(x,y)]===1;}
function walk(x,y){return isHull(x,y)&&!G.occ[idx(x,y)];}
const lm=m=>1+.5*(m.lvl-1);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

function freshLevelState(){return {t:0,day:1,prog:0,hull:100,o2:100,shield:0,shieldFlash:0,pr:1,prod:0,cons:0,
  fires:new Map(),breaches:new Map(),aliens:[],ext:[],proj:[],parts:[],decals:[],beams:[],booms:[],timers:[],evQueue:[],scriptI:0,
  nextEv:20,evCool:0,grav:null,tilt:0,kurdel:null,psych:null,psychHidden:[],swarm:null,dragon:null,blackout:0,engBuf:null,
  flashes:[],acid:[],nades:[],fakeBlips:null,pingT:0,cd:{grenade:0,salvo:0,sluza:0},chatCd:0,shake:0,flash:0,alarm:0,scare:null,meteorQ:0,meteorT:0,warp:0,starOff:0,modal:false,running:true,firstKill:false,ncd:0,cloneEndLog:false};}

function startLevel(snap,demo){
  G=Object.assign(freshLevelState(),{lvl:snap.lvl,money:snap.money,bonusPow:snap.bonusPow||0,starsGone:snap.starsGone||0,nid:0,
    mods:[],crew:[],log:[],extra:(snap.extra||[]).map(r=>r.slice()),tips:new Set(),kills:snap.kills||0,snap:JSON.parse(JSON.stringify(snap)),pralkiOK:!!snap.pralkiOK,demo:!!demo});
  buildHull();
  for(const m of snap.mods){const s=MOD[m.t].s;let ok=true;for(let y=m.gy;y<m.gy+s;y++)for(let x=m.gx;x<m.gx+s;x++)if(!isHull(x,y)||G.occ[idx(x,y)])ok=false;
    if(ok)addMod(m.t,m.gx,m.gy,m.lvl);else G.money+=MOD[m.t].cost;}
  for(const c of snap.crew){const n=newCrew(c.name,c.g,c.role);placeUnit(n);G.crew.push(n);}
  G.stars=[];for(let i=0;i<220;i++)G.stars.push({x:R(),y:R(),z:.2+R()*.8,b:R(),i:R()});
  fitCam();
  UI.popT0=UI.time;
  if(!demo){saveSnap(snap);showIntro();}
}
function newGame(demo){
  startLevel({lvl:0,money:700,kills:0,bonusPow:0,starsGone:0,
    crew:[{name:'Bogumił',g:'m',role:'mech'},{name:'Zdzisława',g:'f',role:'mech'},{name:'Kazimierz',g:'m',role:'guard'}],
    mods:[{t:'reactor',gx:10,gy:10,lvl:1},{t:'engine',gx:14,gy:10,lvl:1},{t:'o2',gx:10,gy:13,lvl:1},{t:'quarters',gx:14,gy:13,lvl:1}]},demo);
}
function snapNext(){return {lvl:G.lvl+1,money:Math.floor(G.money)+LEVELS[G.lvl+1].bonus,kills:G.kills,bonusPow:G.bonusPow,starsGone:G.starsGone,pralkiOK:G.pralkiOK,extra:G.extra,
  crew:G.crew.filter(c=>!c.clone).map(c=>({name:c.name,g:c.g,role:c.role})),mods:G.mods.map(m=>({t:m.t,gx:m.gx,gy:m.gy,lvl:m.lvl}))};}
const SKEY='kosmopatologia_v1';
function saveSnap(s){try{localStorage.setItem(SKEY,JSON.stringify(s));}catch(e){}}
function loadSnap(){try{const s=localStorage.getItem(SKEY);return s?JSON.parse(s):null;}catch(e){return null;}}

function buildHull(bornSet){
  G.hm=new Uint8Array(GW*GH);G.occ=new Int32Array(GW*GH);G.vents=[];const born=bornSet||new Set();
  for(let l=0;l<=G.lvl;l++){for(const [x0,y0,w,h] of LEVELS[l].rects)for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){if(!bornSet&&l===G.lvl&&l>0&&!G.hm[idx(x,y)])born.add(key(x,y));G.hm[idx(x,y)]=1;}
    G.vents.push(...LEVELS[l].vents);}
  for(const [x0,y0,w,h] of (G.extra||[]))for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)G.hm[idx(x,y)]=1;
  G.tiles=[];G.lamps=[];G.edge=[];let sx=0,sy=0,minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
  const ventSet=new Set(G.vents.map(v=>key(v[0],v[1])));
  for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){if(!isHull(x,y))continue;
    const h=hash(x,y,3);let fk=h<.5?'plate'+Math.floor(hash(x,y,4)*3):h<.74?'grate'+Math.floor(hash(x,y,6)*2):h<.84?'rust0':h<.87?'hazard0':'plate0';
    if(ventSet.has(key(x,y)))fk='vent0';
    const deco=d=>{const q=hash(x,y,d);return q<.26?'lamp':q<.42?'window':q<.52?'screen':q<.64?'pipe':q<.71?'vent':q<.76?'warn':q<.8?'blood':'plain';};
    const t={x,y,fk,wl:!isHull(x-1,y),wr:!isHull(x,y-1),sl:!isHull(x,y+1),sr:!isHull(x+1,y),dl:deco(11),dr:deco(12),vs:(hash(x,y,5)<.5?0:1),pd:born.has(key(x,y))?(bornSet?.05+R()*.25:.2+(x+y)*.06+R()*.3):-1};
    G.tiles.push(t);sx+=x+.5;sy+=y+.5;
    if(t.wl||t.wr||t.sl||t.sr)G.edge.push([x,y]);
    const wx=IX(x,y),wy=IY(x,y);
    if(t.wl&&t.dl==='lamp')G.lamps.push({x:wx-8.5,y:wy-15,s:x*31+y,bad:hash(x,y,21)<.18});
    if(t.wr&&t.dr==='lamp')G.lamps.push({x:wx+7.5,y:wy-16,s:x*17+y*3,bad:hash(x,y,22)<.18});
    minX=Math.min(minX,wx-16);maxX=Math.max(maxX,wx+16);minY=Math.min(minY,wy-WH);maxY=Math.max(maxY,wy+16+SL);}
  G.tiles.sort((a,b)=>(a.x+a.y)-(b.x+b.y));
  G.cx=sx/G.tiles.length;G.cy=sy/G.tiles.length;G.bounds={minX,maxX,minY,maxY};
  if(G.mods)rebuildOcc();
}
function rebuildOcc(){G.occ.fill(0);for(const m of G.mods){const s=MOD[m.t].s;for(let y=m.gy;y<m.gy+s;y++)for(let x=m.gx;x<m.gx+s;x++)G.occ[idx(x,y)]=m.id;}}
function addMod(t,gx,gy,lvl){const m={ammo:150,resin:0,id:++G.nid,t,gx,gy,lvl:lvl||1,wear:rnd(0,20),broken:false,bt:0,rp:0,needs2:false,hot:0,cd:R(),ang:0,anim:R()*10};
  G.mods.push(m);rebuildOcc();return m;}
function modAt(x,y){if(!inb(x,y))return null;const id=G.occ[idx(x,y)];return id?G.mods.find(m=>m.id===id):null;}
function adjMod(m,x,y){if(!walk(x,y))return false;const s=MOD[m.t].s;
  return (y>=m.gy&&y<m.gy+s&&(x===m.gx-1||x===m.gx+s))||(x>=m.gx&&x<m.gx+s&&(y===m.gy-1||y===m.gy+s));}
function hasAccess(m){const s=MOD[m.t].s;for(let y=m.gy-1;y<=m.gy+s;y++)for(let x=m.gx-1;x<=m.gx+s;x++)if(adjMod(m,x,y))return true;return false;}
function fireOnMod(m){const s=MOD[m.t].s;for(let y=m.gy;y<m.gy+s;y++)for(let x=m.gx;x<m.gx+s;x++){const k=key(x,y);if(G.fires.has(k))return k;}return null;}
function walkTiles(){return G.tiles.filter(t=>walk(t.x,t.y));}
function randomWalkable(){const w=walkTiles();return w.length?pick(w):G.tiles[0];}
function connected(){const w=walkTiles();if(!w.length)return false;const seen=new Set([key(w[0].x,w[0].y)]);const q=[[w[0].x,w[0].y]];
  while(q.length){const [x,y]=q.pop();for(const [dx,dy] of DIRS){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(walk(nx,ny)&&!seen.has(k)){seen.add(k);q.push([nx,ny]);}}}
  if(seen.size!==w.length)return false;return G.mods.every(hasAccess);}
function canPlace(t,gx,gy){const d=MOD[t],s=d.s;
  if(d.hullSeg){let adj=false;for(let y=gy;y<gy+s;y++)for(let x=gx;x<gx+s;x++){if(x<1||y<1||x>=GW-1||y>=GH-1)return 'Za daleko od stoczni.';if(isHull(x,y))return 'Tu już jest kadłub. Segment dospawasz na zewnątrz, przy burcie.';for(const [dx,dy] of DIRS)if(isHull(x+dx,y+dy))adj=true;}
    if(!adj)return 'Segment musi dotykać burty.';if(G.money<d.cost)return 'Za mało kredytów (₵'+d.cost+').';return null;}
  for(let y=gy;y<gy+s;y++)for(let x=gx;x<gx+s;x++){if(!isHull(x,y))return 'Poza kadłubem.';if(G.occ[idx(x,y)])return 'To miejsce jest zajęte.';
    if(G.fires.has(key(x,y))||G.breaches.has(key(x,y)))return 'Najpierw ugaś pożar i załataj dziurę.';}
  if(d.edge){let e=false;for(let y=gy;y<gy+s;y++)for(let x=gx;x<gx+s;x++)for(const [dx,dy] of DIRS)if(!isHull(x+dx,y+dy))e=true;if(!e)return 'Wieżyczka musi stać przy burcie.';}
  const tmp={id:-1,t,gx,gy};G.mods.push(tmp);rebuildOcc();const ok=connected();G.mods.pop();rebuildOcc();
  if(!ok)return 'Zablokowałbyś przejście albo dostęp do modułu.';
  if(G.money<d.cost)return 'Za mało kredytów (₵'+d.cost+').';
  return null;}
function unstick(u){if(walk(u.x|0,u.y|0))return;let best=null,bd=1e9;for(const t of walkTiles()){const d=Math.hypot(t.x+.5-u.x,t.y+.5-u.y);if(d<bd){bd=d;best=t;}}
  if(best){u.x=best.x+.5;u.y=best.y+.5;u.path=null;}}
function placeUnit(u){const used=new Set(G.crew.map(c=>key(c.x|0,c.y|0)));const w=walkTiles().filter(t=>!used.has(key(t.x,t.y)));const t=w.length?pick(w):randomWalkable();u.x=t.x+.5;u.y=t.y+.5;}

