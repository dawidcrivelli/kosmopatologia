// ---------- characters ----------
const CREW_TOP=["...dHHd...","..dHHHHd..","..dHVVVV..","..dHHHHH..","..dHVVVd..","...dHHd...",".SSBBBBSS.",".SBBBBBBS.",".ABBBBBBA.",".ABDBBDBA.","..BBBBBB..","..LLDDLL.."];
const LEGS=[["..LL..LL..","..LL..LL..","..KK..KK..",".KKK..KKK."],[".LL....LL.",".LL....LL.",".KK....KK.","KKK....KKK"],["...LLLL...","...LLLL...","...KKKK...","..KKKKKK.."]];
const CPAL={
  mech:{d:'#6e3a12',H:'#d07a2a',V:'#8ff7ff',S:'#e8963a',B:'#9a5a2a',A:'#7a4422',D:'#4a2a14',L:'#4e3a2c',K:'#221a14'},
  guard:{d:'#3c4048',H:'#868c98',V:'#ff6a5a',S:'#a33a2c',B:'#555a66',A:'#40444e',D:'#2a2d34',L:'#3a3e48',K:'#16181c'},
  ghost:{d:'#8a98b8',H:'#dfe8ff',V:'#ffffff',S:'#c8d4ee',B:'#b0c0e4',A:'#98a8c8',D:'#8090b0',L:'#a0b0d0',K:'#7080a0'},
  mimic:{d:'#6e3a12',H:'#d07a2a',V:'#ff9ad0',S:'#e8963a',B:'#9a5a2a',A:'#7a4422',D:'#4a2a14',L:'#4e3a2c',K:'#221a14'},
  clone:{d:'#1a3a7a',H:'#5a9aff',V:'#e0ffff',S:'#7ab4ff',B:'#3a6ad0',A:'#2a50a8',D:'#1a3070',L:'#2a4a90',K:'#10204a'}};
const AMAP={
  mlask:[["....fFFFf.....","..fFFFFFFFf...",".fFFeFFFeFFf..","fFFFFFFFFFFFf.","fFMtMtMtMFFFfs",".fMMMMMMMFFf.s",".l.l.l..l.l...","l..l..l..l..l.",".............."],
         ["....fFFFf.....","..fFFFFFFFf...",".fFFeFFFeFFf..","fFFFFFFFFFFFf.","fFMtMtMtMFFFfs",".fMMMMMMMFFf.s","l.l..l.l..l...",".l..l...l..l..",".............."]],
  gebo:[[".....fFFf.....","....fFFFFf....","....FwoFwo....","....fFFFFf....",".b..fFFFFf..b.",".bb.FFFFFF.bb.","..bbFFFFFFbb..","...bFMtMtFb...","....FMMMMF....","....FtMtMF....","....fFFFFf....","....fF..Ff....","....fF..Ff....","...fF....Ff...","...fF....Ff...","..ff......ff.."],
        [".....fFFf.....","....fFFFFf....","....FwoFwo....","....fFFFFf....",".b..fFFFFf..b.",".bb.FFFFFF.bb.","..bbFFFFFFbb..","...bFMtMtFb...","....FMMMMF....","....FtMtMF....","....fFFFFf....","....fF.Ff.....",".....fFf......","....fF.Ff.....","...fF...Ff....","...ff...ff...."]]};
function mkSkok(f){const {c,g}=mk(14,8);ell(g,6,4,3.5,2.4,'#d8cfa8');ell(g,6,3.6,2.4,1.5,'#efe6c4');
  for(let i=0;i<4;i++){const x=3+i*2;line(g,x,5,x-1+(f?(i%2?1:-1):0)*1,7,'#b8ae88');}line(g,9,4,12,3+f,'#c8be98');line(g,12,3+f,13,5,'#c8be98');P(g,4,3,'#7a2a1a');return c;}
function mkQueen(f){const {c,g}=mk(32,28);ell(g,16,18,11,7,'#7a3a34');ell(g,16,16,10,6,'#c98a7c');
  for(let i=0;i<6;i++){const x=7+i*3.6;line(g,x,21,x-2+(f?1:-1)*(i%2?1:-1),27,'#3e2420');}
  ell(g,16,9,7,6,'#c98a7c');poly(g,[[9,6],[11,0],[13,5],[16,-1],[19,5],[21,0],[23,6]],'#f0e6d0');
  ell(g,13,8,1.5,1.5,'#ffe14a');ell(g,19,8,1.5,1.5,'#ffe14a');ell(g,16,13,5,2.5,'#4a0a10');for(let i=0;i<5;i++)P(g,12+i*2,12,'#f5efe0');
  line(g,4,14,0,8+f,'#f2ecda');line(g,28,14,31,8+f,'#f2ecda');for(let i=0;i<8;i++)P(g,8+R()*16,15+R()*6,'#7cff5a');return c;}
function mkEgg(){const {c,g}=mk(7,8);ell(g,3.5,4.5,3.2,3.5,'#7a6040');ell(g,3,4,2,2.5,'#9a7a52');line(g,2,1,5,1,'#4a3020');line(g,3.5,0,3.5,2,'#4a3020');return c;}
const APAL={mlask:{f:'#7a3a34',F:'#c98a7c',e:'#ffe14a',M:'#4a0a10',t:'#f5efe0',l:'#3e2420',s:'#7cff5a'},
  gebo:{F:'#d8c6a4',f:'#8a7256',b:'#f2ecda',w:'#ffffff',o:'#111111',M:'#5a0a10',t:'#f5efe0'}};
function mkPralka(hostile,f){const {c,g}=mk(12,16);RC(g,0,0,12,14,'#e4e7eb');RC(g,0,0,12,1,'#ffffff');RC(g,11,0,1,14,'#aab0b8');RC(g,0,13,12,1,'#9aa0a8');
  RC(g,1,1,10,3,'#cfd4da');P(g,2,2,'#e03a3a');P(g,4,2,'#3a8ae0');RC(g,7,2,3,1,'#2a2a2a');
  ell(g,6,8.5,4.3,4.3,'#8a929c');ell(g,6,8.5,3.3,3.3,hostile?'#3a0a10':'#2a4a7a');
  RC(g,4,7,2,2,'#ffffff');RC(g,7,7,2,2,'#ffffff');P(g,5,8,hostile?'#ff3030':'#111');P(g,8,8,hostile?'#ff3030':'#111');
  if(hostile){line(g,3,5,5,6,'#222');line(g,9,5,7,6,'#222');}
  RC(g,1+f,14,2,2,'#555');RC(g,9-f,14,2,2,'#555');return c;}
function mkRhino(f){const {c,g}=mk(18,11);ell(g,8,5,6.5,3.5,'#8a8f96');ell(g,14,5,3.5,2.6,'#9aa0a8');RC(g,16,2,1,2,'#e8e0d0');P(g,17,1,'#e8e0d0');
  P(g,14,4,'#111');RC(g,12,2,1,1,'#6a6f76');RC(g,4,8,2,3-f,'#6a6f76');RC(g,8,8,2,2+f,'#6a6f76');RC(g,12,8,2,3-f,'#6a6f76');return c;}
function mkBunny(f){const {c,g}=mk(11,11);RC(g,3,0,2,4,'#ffc0dd');RC(g,6,0,2,4,'#ffc0dd');P(g,3,1,'#ff80b0');P(g,6,1,'#ff80b0');
  ell(g,5.5,6,4,3,'#ffd0e8');ell(g,5.5,7.5,4.5,3,'#ffb6d9');P(g,4,5,'#222');P(g,7,5,'#222');P(g,5,6,'#ff4080');RC(g,2+f,10,2,1,'#ff9ac8');RC(g,7-f,10,2,1,'#ff9ac8');return c;}
function mkSaucer(f){const {c,g}=mk(30,18);for(let i=0;i<4;i++)line(g,8+i*4.5,11,6+i*5+(f?1:-1),17,'#5a2a80');
  ell(g,15,9,14,4,'#5a2a90');ell(g,15,8,13,3,'#8a5ad0');ell(g,15,5,6,4.5,'#7fe8ff');ell(g,13,4,2,1.5,'#e0ffff');
  for(let i=0;i<6;i++)P(g,4+i*4.4,9,(i+f)%2?'#ffe14a':'#ff4a8a');return c;}
function mkMeteor(){const {c,g}=mk(11,11);ell(g,5.5,5.5,5,4.6,'#6a5a4a');ell(g,4.5,4.5,3.5,3,'#8a7a62');ell(g,6.5,6.5,1.5,1.3,'#4a3e32');ell(g,3.5,6.8,1,1,'#4a3e32');P(g,3,3,'#b0a080');return c;}
function mkKurdel(){const {c,g}=mk(150,92);ell(g,82,48,66,34,'#4e5c34');ell(g,82,60,58,20,'#7a7a4a');
  for(let k=0;k<40;k++){const x=30+R()*110,y=18+R()*30;ell(g,x,y,2+R()*5,1.5+R()*3,R()<.5?'#3e4a28':'#5e6c3e');}
  poly(g,[[140,40],[150,18],[146,52]],'#3e4a28');poly(g,[[140,56],[150,82],[144,60]],'#3e4a28');
  ell(g,28,56,24,15,'#2a0608');ell(g,28,60,18,8,'#5a0a14');
  for(let i=0;i<9;i++){const x=10+i*4.4;poly(g,[[x,43],[x+3,43],[x+1.5,49]],'#efe6d0');poly(g,[[x,69],[x+3,69],[x+1.5,63]],'#efe6d0');}
  for(const [x,y,r] of [[44,30,5],[56,24,4],[68,22,3.5],[40,40,3],[80,20,3]]){ell(g,x,y,r,r,'#f0d040');ell(g,x+.5,y,r*.45,r*.8,'#111111');P(g,x-r*.4,y-r*.5,'#ffffff');}
  for(let i=0;i<5;i++)line(g,20,48+i*3,2,40+i*6,'#3a4424');return c;}
function mkFace(){const {c,g}=mk(24,26);ell(g,12,12,10,11.5,'#cdbda0');ell(g,12,15,8,7,'#b8a688');ell(g,7.5,9,3,3.5,'#0a0505');ell(g,16.5,9,3,3.5,'#0a0505');
  P(g,7,9,'#ff2020');P(g,16,9,'#ff2020');ell(g,12,18,5,3.2,'#1a0505');
  for(let i=0;i<5;i++){RC(g,8+i*2,16,1,2,'#efe6d0');RC(g,8+i*2,19,1,2,'#efe6d0');}
  for(let i=0;i<6;i++)RC(g,5+i*3,21+hash(i,1,4)*2,1,4,'#7a0a10');RC(g,9,12,1,3,'#7a0a10');return c;}
function mkNeb(cols){const {c,g}=mk(160,100);g.fillStyle='#05040b';g.fillRect(0,0,160,100);
  for(let i=0;i<34;i++){g.globalAlpha=.07+R()*.1;ell(g,R()*160,R()*100,10+R()*42,6+R()*22,pick(cols));}g.globalAlpha=1;return c;}
function mkFlesh(){const {c,g}=mk(120,80);g.fillStyle='#38050c';g.fillRect(0,0,120,80);
  for(let i=0;i<60;i++)ell(g,R()*120,R()*80,3+R()*10,2+R()*6,pick(['#4a0810','#5a0c16','#2a0308']));
  for(let i=0;i<16;i++){let x=R()*120,y=R()*80;const col=pick(['#8a1424','#a01c2c','#6a0c1a']);for(let k=0;k<70;k++){P(g,x,y,col);x+=rnd(-1,1.6);y+=rnd(-1,1);}}
  for(let i=0;i<30;i++)P(g,R()*120,R()*80,'#d0a080');return c;}

const SPR={};
function makeSprites(){
  SPR.floor={};for(const k of ['plate0','plate1','plate2','grate0','grate1','rust0','hazard0','vent0'])SPR.floor[k]=mkFloor(k.slice(0,-1),+k.slice(-1)+3);
  SPR.wall={L:{},R:{}};for(const s of ['L','R'])for(const d of DECOS)SPR.wall[s][d]=[mkWall(s,d,1),mkWall(s,d,2)];
  SPR.slabL=mkSlab('L');SPR.slabR=mkSlab('R');SPR.breach=mkBreach();
  SPR.mod={};for(const t in MOD)SPR.mod[t]=mkMod(t);
  SPR.crew={};for(const r of ['mech','guard','clone','ghost','mimic']){const fr=LEGS.map(l=>fromMap(CREW_TOP.concat(l),CPAL[r]));SPR.crew[r]=fr.concat(fr.map(flipH));}
  SPR.alien={};for(const t of ['mlask','gebo']){const fr=AMAP[t].map(m=>fromMap(m,APAL[t]));SPR.alien[t]=fr.concat(fr.map(flipH));}
  {const fr=[mkPralka(true,0),mkPralka(true,1)];SPR.alien.pralka=fr.concat(fr.map(flipH));}
  {const fr=[mkSkok(0),mkSkok(1)];SPR.alien.skok=fr.concat(fr.map(flipH));}
  {const fr=[mkQueen(0),mkQueen(1)];SPR.alien.krolowa=fr.concat(fr.map(flipH));}
  {const fr=AMAP.gebo.map(m=>fromMap(m,{F:'#8ab0c8',f:'#3a5a74',b:'#e0f2fa',w:'#ffffff',o:'#0a2a3a',M:'#0a2a3a',t:'#e0f2fa'}));SPR.alien.mimik=fr.concat(fr.map(flipH));}
  SPR.egg=mkEgg();
  {const fr=[mkRhino(0),mkRhino(1)];SPR.alien.rhino=fr.concat(fr.map(flipH));}
  {const fr=[mkBunny(0),mkBunny(1)];SPR.bunny=fr.concat(fr.map(flipH));}
  SPR.saucer=[mkSaucer(0),mkSaucer(1)];SPR.meteor=mkMeteor();SPR.kurdel=mkKurdel();SPR.face=mkFace();SPR.flesh=mkFlesh();
  SPR.neb=LEVELS.map(L=>mkNeb(L.neb));
}
