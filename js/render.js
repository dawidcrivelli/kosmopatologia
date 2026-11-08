// ---------- render ----------
const cv=$('#cv'),ctx=cv.getContext('2d');const lc=document.createElement('canvas');const lg=lc.getContext('2d');
let W=0,H=0,DPR=1;const cam={x:0,y:0,z:3};let CX=0,CY=0,Z=3;
const IX=(x,y)=>(x-y)*16, IY=(x,y)=>(x+y)*8;
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);W=Math.floor(innerWidth*DPR);H=Math.floor(innerHeight*DPR);cv.width=W;cv.height=H;lc.width=Math.ceil(W/4);lc.height=Math.ceil(H/4);}
function fitCam(){const b=G.bounds;const bw=b.maxX-b.minX+40,bh=b.maxY-b.minY+40;
  cam.z=clamp(Math.max(Math.floor(Math.min(W*1.1/bw,H*.66/bh)+.3),Math.round(1.5*DPR)),1,12);cam.x=W/2-(b.minX+b.maxX)/2*cam.z;cam.y=H*.5-(b.minY+b.maxY)/2*cam.z;}
const sx=wx=>Math.round(wx*Z+CX), sy=wy=>Math.round(wy*Z+CY);
function dI(img,wx,wy){ctx.drawImage(img,sx(wx),sy(wy),img.width*Z,img.height*Z);}
function wr(wx,wy,w,h,col){ctx.fillStyle=col;ctx.fillRect(sx(wx),sy(wy),Math.max(1,Math.round(w*Z)),Math.max(1,Math.round(h*Z)));}
function pxLine(x1,y1,x2,y2,col,w){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x2-x1),Math.abs(y2-y1))));ctx.fillStyle=col;const s=Math.max(1,Math.round((w||1)*Z));
  for(let i=0;i<=n;i+=1){const x=x1+(x2-x1)*i/n,y=y1+(y2-y1)*i/n;ctx.fillRect(sx(x),sy(y),s,s);}}
const LABELS=[];
function render(T){
  ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
  Z=cam.z;CX=Math.round(cam.x);CY=Math.round(cam.y);
  drawBackground(T);
  if(!G){return;}
  ctx.save();
  if(Math.abs(G.tilt)>.001){ctx.translate(W/2,H/2);ctx.rotate(G.tilt);ctx.translate(-W/2,-H/2);}
  if(G.shake>0)ctx.translate((R()-.5)*G.shake*16*DPR,(R()-.5)*G.shake*12*DPR);
  const k=G.kurdel;if(k&&k.ph!=='in')drawKurdelOut(k,T);
  const cxy=G.cx+G.cy;
  for(const e of G.ext)if(e.x+e.y<cxy)drawExt(e,T);
  if(G.dragon&&G.dragon.x+G.dragon.y<cxy)drawDragon(T);
  drawShip(T);
  drawLighting(T);
  for(const e of G.ext)if(e.x+e.y>=cxy)drawExt(e,T);
  if(G.dragon&&G.dragon.x+G.dragon.y>=cxy)drawDragon(T);
  for(const p of G.proj){const x=IX(p.x,p.y),y=IY(p.x,p.y)-18;wr(x-1.5,y-1.5,3,3,'#ff6af0');wr(x-.5,y-.5,1,1,'#ffffff');}
  if(G.swarm)drawSwarm(T);
  drawFxTop(T);
  if(G.shieldFlash>0||(G.shield>0&&G.smax>0&&(T*2%6)<.25))drawShield(T);
  drawLabels(T);
  drawBuildGhost(T);
  ctx.restore();
  drawOverlays(T);}
function drawBackground(T){
  if(G&&G.kurdel&&G.kurdel.ph==='in'){const img=SPR.flesh,s=Math.max(W/120,H/80)*1.1;ctx.drawImage(img,(W-120*s)/2+Math.sin(T*.7)*6*DPR,(H-80*s)/2,120*s,80*s);
    ctx.fillStyle=`rgba(255,30,60,${.06+.05*Math.sin(T*2.4)})`;ctx.fillRect(0,0,W,H);return;}
  if(G&&G.psych){const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ffd6ec');g.addColorStop(.5,'#d8e8ff');g.addColorStop(1,'#fff0c8');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);return;}
  const lv=G?G.lvl:0,img=SPR.neb[lv],s=Math.max(W/160,H/100)*1.25;
  ctx.drawImage(img,(W-160*s)/2+(CX-W/2)*.03,(H-100*s)/2+(CY-H/2)*.03,160*s,100*s);
  if(!G)return;const keep=G.starsGone?.55:1,warp=G.warp;
  for(const st of G.stars){if(st.i>keep)continue;
    let x=((st.x*W+(CX-W/2)*st.z*.06-G.starOff*st.z*W*.02)%W+W)%W,y=((st.y*H+(CY-H/2)*st.z*.06)%H+H)%H;
    const sz=Math.max(1,Math.round(st.z*1.8*DPR));const tw=.55+.45*Math.sin(T*(1+st.b*3)+st.b*20);
    ctx.fillStyle=st.b<.15?`rgba(255,200,170,${tw})`:st.b<.3?`rgba(170,200,255,${tw})`:`rgba(235,235,255,${tw*st.z})`;
    ctx.fillRect(x|0,y|0,sz+Math.round(warp*st.z*40*DPR),sz);}}
function tileDrop(t){if(t.pd<0)return 0;const tt=UI.time-UI.popT0-t.pd;if(tt<0)return null;if(tt>.6)return 0;const e=1-tt/.6;return -e*e*140;}
function drawShip(T){
  const ps=!!G.psych;
  for(const t of G.tiles){const d=tileDrop(t);if(d===null)continue;const wx=IX(t.x,t.y),wy=IY(t.x,t.y)+d;
    dI(SPR.floor[t.fk],wx-16,wy);if(t.sl)dI(SPR.slabL,wx-16,wy);if(t.sr)dI(SPR.slabR,wx,wy);}
  for(const dc of G.decals){ctx.globalAlpha=Math.min(1,dc.life/dc.max*2);
    if(ps){wr(dc.x-1,dc.y-1,2,2,'#ff8ac8');wr(dc.x-.5,dc.y-.5,1,1,'#fff27a');}else wr(dc.x-dc.s/2,dc.y-dc.s/4,dc.s,dc.s/2,dc.col);}
  ctx.globalAlpha=1;drawAcid(T);
  for(const [k,b] of G.breaches){const [x,y]=unkey(k);dI(SPR.breach,IX(x,y)-16,IY(x,y));if(b.p>0)LABELS.push({k:'bar',x:IX(x+.5,y+.5),y:IY(x+.5,y+.5)-6,v:b.p,col:'#ffd070'});}
  for(const t of G.tiles){const d=tileDrop(t);if(d===null)continue;const wx=IX(t.x,t.y),wy=IY(t.x,t.y)+d;
    if(t.wl)dI(SPR.wall.L[t.dl][t.vs],wx-16,wy-WH);if(t.wr)dI(SPR.wall.R[t.dr][t.vs],wx,wy-WH);}
  const obj=[];
  for(const m of G.mods)obj.push({d:m.gx+m.gy+MOD[m.t].s,f:()=>drawMod(m,T)});
  for(const c of G.crew)obj.push({d:c.x+c.y+.01,f:()=>drawCrew(c,T)});
  for(const a of G.aliens)obj.push({d:a.x+a.y+(a.latch?.05:.01),f:()=>drawAlien(a,T)});
  for(const [k,f] of G.fires){const [x,y]=unkey(k);obj.push({d:x+y+1.02,f:()=>drawFire(x,y,f,T)});}
  obj.sort((a,b)=>a.d-b.d);for(const o of obj)o.f();drawNades(T);}
function drawFire(x,y,f,T){const cx=IX(x+.5,y+.5),cy=IY(x+.5,y+.5);const ps=G.psych;
  for(let i=0;i<7;i++){const ox=(hash(x,y,i)-.5)*18,oy=(hash(x,y,i+9)-.5)*8;const h=(3+8*f.v)*(.6+.4*Math.sin(T*11+i*1.7));
    const bx=cx+ox,by=cy+oy;
    if(ps){wr(bx-1,by-h*.5,2,2,'#ff8ac8');continue;}
    wr(bx-1.5,by-h,3,h,'#ff5a1a');wr(bx-1,by-h*.8,2,h*.7,'#ffb030');wr(bx-.5,by-h*.5,1,h*.4,'#fff2a0');}}
function drawMod(m,T){const sp=SPR.mod[m.t];const bx=IX(m.gx,m.gy),by=IY(m.gx,m.gy);const ox=bx-sp.ox,oy=by-sp.oy;
  dI(sp.c,ox,oy);if(m.resin>0||m.hive)drawHive(m,T,ox,oy,sp);const on=!m.broken&&G.pr>.05&&!G.blackout;const cx=ox+sp.cx,cy=oy+sp.cy;
  switch(m.t){
  case 'reactor':if(!m.broken){ctx.globalAlpha=.55;for(let k=0;k<3;k++){const yy=cy-27+((T*14*G.pr+k*6)%17);wr(cx-9,yy,18,1,'#e8ffff');}ctx.globalAlpha=1;}
    else{ctx.globalAlpha=.5+.3*Math.sin(T*12);wr(cx-9,cy-27,18,17,'#ff2030');ctx.globalAlpha=1;}break;
  case 'engine':if(!m.broken&&G.warp>0)for(const nx of [-11,11])for(let i=0;i<5;i++){const h=3+((T*30+i*7+nx)%6);wr(cx+nx-3+i*1.3,cy-22-h,1.3,h,i%2?'#4ac8ff':'#c8f6ff');}break;
  case 'shield':if(!m.broken){ctx.globalAlpha=.25+.2*Math.sin(T*3);wr(cx-7,cy-34,14,14,'#bfe0ff');ctx.globalAlpha=1;}break;
  case 'lab':if(on)for(let i=0;i<3;i++)if(Math.sin(T*5+i*2)>0)wr(cx-15+i*5,cy-11+i*2,2,1,'#9fffff');break;
  case 'o2':if(on)for(let i=0;i<3;i++){const yy=(T*6+i*5)%16;wr(cx+i*6-2,cy-6-yy,1,1,'#d0fff0');}break;
  case 'nmach':wr(cx-14,cy-20,2,2,Math.sin(T*4)>0?'#ffe08a':'#5a3a1a');wr(cx-10,cy-18,2,2,Math.sin(T*4+2)>0?'#7fe8ff':'#1a3a4a');break;
  case 'sepul':LABELS.push({k:'q',x:cx,y:cy-50+Math.sin(T*2)*2});break;
  case 'sentry':{const tx=cx,ty=cy-11;const dx=Math.cos(m.ang),dy=Math.sin(m.ang);pxLine(tx,ty,tx+dx*8,ty+dy*8,'#1e2228',2);pxLine(tx,ty,tx+dx*7,ty+dy*7,'#8a96a8',1);
    if(G.alert||m.ammo<50)LABELS.push({k:'ammo',x:cx,y:oy+2,v:m.ammo});break;}
  case 'turret':{const tx=cx,ty=cy-9;const dx=Math.cos(m.ang),dy=Math.sin(m.ang);pxLine(tx,ty,tx+dx*9,ty+dy*9,'#2a2e36',2);pxLine(tx,ty,tx+dx*8,ty+dy*8,'#9aa4b8',1);break;}}
  if(m.lvl>1)for(let i=0;i<m.lvl-1;i++)wr(ox+sp.w*.18+i*3,oy+sp.H+sp.w/4-2,2,2,'#ffd04a');
  if(m.broken){if(Math.sin(T*8)>0)wr(cx-1,oy+6,2,2,'#ff3030');
    LABELS.push({k:'mod',x:cx,y:oy+2,m});}}
function gravPose(u,T){const g=G.grav;if(!g)return {lift:0,flip:false,sq:1};
  if(g.type==='float')return {lift:5+3*Math.sin(T*2+u.id),flip:false,sq:1};if(g.type==='ceiling')return {lift:WH-3,flip:true,sq:1};
  if(g.type==='heavy')return {lift:0,flip:false,sq:.7};return {lift:0,flip:false,sq:1};}
function drawSpr(img,fx,fy,pose,alpha){const w=img.width,h=img.height;
  if(!pose.flip){ctx.globalAlpha=.35*(pose.lift>0?.5:1);wr(fx-3,fy-1,6,2,'#000000');}
  const hh=Math.round(h*pose.sq),ww=Math.round(w*(pose.sq<1?1.2:1));const X=sx(fx-ww/2);ctx.globalAlpha=alpha;let Y,Hs;
  if(pose.flip){Y=sy(fy-pose.lift);ctx.save();ctx.translate(X,Y+h*Z);ctx.scale(1,-1);ctx.drawImage(img,0,0,w*Z,h*Z);ctx.restore();Hs=h*Z;}
  else{Y=sy(fy-hh+1-pose.lift);ctx.drawImage(img,X,Y,ww*Z,hh*Z);Hs=hh*Z;}
  ctx.globalAlpha=1;return {X,Y,W:ww*Z,H:Hs,cx:X+ww*Z/2,top:pose.flip?Y+Hs:Y};}
function drawCrew(c,T){const set=SPR.crew[c.clone?'clone':c.role];const fr=c.moving?(Math.floor(c.anim)%2?1:2):0;const img=set[fr+(c.face<0?3:0)];
  const fx=IX(c.x,c.y),fy=IY(c.x,c.y),pose=gravPose(c,T);
  if(UI.sel===c){ctx.globalAlpha=.5+.4*Math.sin(T*8);pxLine(fx-7,fy,fx,fy-3.5,'#6ff0ff');pxLine(fx,fy-3.5,fx+7,fy,'#6ff0ff');pxLine(fx+7,fy,fx,fy+3.5,'#6ff0ff');pxLine(fx,fy+3.5,fx-7,fy,'#6ff0ff');ctx.globalAlpha=1;}
  const r=drawSpr(img,fx,fy,pose,c.clone?.55+.2*Math.sin(T*18+c.id):(c.hurtT>0&&Math.sin(T*60)>0?.4:1));
  if(!pose.flip&&!c.clone){const bx=r.X+(c.face>0?1:8)*Z*(r.W/(10*Z)),by=r.Y+6*Z*(r.H/(16*Z)),bh=5*Z*(r.H/(16*Z));
    const hp=clamp(c.hp/100,0,1),col=hp>.6?'#3dff8a':hp>.3?'#ffd030':(Math.sin(T*12)>0?'#ff3040':'#601018');
    ctx.fillStyle='#111';ctx.fillRect(Math.round(bx),Math.round(by),Math.max(1,Z),Math.round(bh));ctx.fillStyle=col;const fh=Math.round(bh*hp);ctx.fillRect(Math.round(bx),Math.round(by+bh-fh),Math.max(1,Z),fh);}
  if(c.work&&R()<.3)wr(fx+c.face*6,fy-8-R()*3,1,1,'#ffe070');
  c._scr={x:r.cx,y:(r.Y+r.H/2),r:Math.max(16*DPR,r.H*.6)};
  if(c.say)LABELS.push({k:'say',x:r.cx,y:pose.flip?r.Y+r.H+4*DPR:r.top-4*DPR,txt:c.say.txt,clone:c.clone});
  if(c.confused>0&&!c.say)LABELS.push({k:'say',x:r.cx,y:r.top-4*DPR,txt:'?'});}
function drawAlien(a,T){const fx=IX(a.x,a.y),fy=IY(a.x,a.y);let pose=gravPose(a,T);const fr=a.moving?(Math.floor(a.anim)%2):0;
  if(a.spawnT>0){if(a.drop&&a.spawnT<.6){pose={lift:pose.lift+WH*a.spawnT/.6,flip:false,sq:1};}else{ctx.globalAlpha=.3;wr(fx-4,fy-2,8,3,'#000');ctx.globalAlpha=1;a._scr=null;return;}}
  if(a.lift)pose={lift:pose.lift+a.lift,flip:pose.flip,sq:pose.sq};
  let img,alpha=1;
  if(a.disg){const fr2=a.moving?(Math.floor(a.anim)%2?1:2):0;img=SPR.crew.mimic[fr2+(a.face<0?3:0)];}
  else if(a.t==='gosc'){const fr2=a.moving?(Math.floor(a.anim)%2?1:2):0;img=SPR.crew.ghost[fr2+(a.face<0?3:0)];alpha=.55+.2*Math.sin(T*3+a.id);}
  else if(G.psych&&a.t!=='rhino')img=SPR.bunny[fr+(a.face<0?2:0)];else img=SPR.alien[a.t][fr+(a.face<0?2:0)];
  const r=drawSpr(img,fx+(a.bite>0?a.face*2:0),fy,pose,alpha);a._scr={x:r.cx,y:r.Y+r.H/2,r:Math.max(16*DPR,r.H*.7)};
  if(!G.psych&&a.t==='mlask'&&R()<.04)decal(fx+rnd(-3,3),fy+rnd(-1,1),'#3a6a20',1.5,8);
  if(a.hp<a.max&&!a.friendly&&!a.disg)LABELS.push({k:'hp',x:r.cx,y:r.top-3*DPR,v:a.hp/a.max});
  if(a.say)LABELS.push({k:'say',x:r.cx,y:r.top-6*DPR,txt:G.psych?'♥':a.say.txt,alien:!a.disg&&a.t!=='gosc',clone:a.t==='gosc'});}
function drawExt(e,T){const x=IX(e.x,e.y),y=IY(e.x,e.y)-18;
  if(e.k==='ship'){const img=G.psych?SPR.bunny[0]:SPR.saucer[(T*4|0)%2];if(e.big){const s=1.8;ctx.drawImage(img,sx(x-img.width*s/2),sy(y-img.height*s/2),img.width*s*Z,img.height*s*Z);}else dI(img,x-img.width/2,y-img.height/2);}
  else if(e.k==='bolid'){const s=2.6;ctx.drawImage(SPR.meteor,sx(x-5*s),sy(y-5*s),11*s*Z,11*s*Z);if(R()<.6)part(x+rnd(-8,8),y+rnd(-6,6)+18,18,rnd(-6,6),rnd(-4,4),0,pick(['#ff7a2a','#ffd070','#ff3a1a']),2,{g:0,life:.5});
    LABELS.push({k:'hp',x:sx(x),y:sy(y-18),v:e.hp/(150+G.lvl*30)});}
  else{dI(SPR.meteor,x-5,y-5);}}
function drawKurdelOut(k,T){const q=k.ph==='app'?1-k.t/9:k.t/3;const s=(.7+1.7*q)*Z;const img=SPR.kurdel;
  const wx=IX(G.cx,G.cy)+(k.ph==='app'?(260-200*q):(320-260*q)),wy=IY(G.cx,G.cy)-40+Math.sin(T)*4;
  ctx.globalAlpha=k.ph==='app'?Math.min(1,q*2):Math.min(1,q);ctx.drawImage(img,Math.round(sx(wx)-img.width*s/2),Math.round(sy(wy)-img.height*s/2),Math.round(img.width*s),Math.round(img.height*s));ctx.globalAlpha=1;}
function drawDragon(T){const d=G.dragon;const x=IX(d.x,d.y),y=IY(d.x,d.y)-34;ctx.globalAlpha=clamp(d.p*1.1,.08,.95);
  for(let i=11;i>=0;i--){const px=x-i*5*Math.cos(d.a+1.6),py=y+Math.sin(T*3+i*.7)*5-i*1.5;const r=i===0?6:5-i*.3;
    wr(px-r,py-r*.7,r*2,r*1.4,i===0?'#7a2ad0':i%2?'#5a1aa0':'#8a3ae0');if(i%3===0)wr(px-1,py-r,2,2,'#ffd040');}
  wr(x-3,y-3,2,2,'#ffff60');wr(x+1,y-3,2,2,'#ffff60');ctx.globalAlpha=1;
  d._scr={x:sx(x),y:sy(y),r:Math.max(40*DPR,30*Z)};LABELS.push({k:'say',x:sx(x),y:sy(y-14),txt:Math.round(d.p*100)+'% smoka'});}
function drawSwarm(T){const s=G.swarm;const x=IX(s.x,s.y),y=IY(s.x,s.y)-20;
  for(let i=0;i<70;i++){const a=i*2.4+T*(.6+(i%5)*.15),r=6+(i%9)*3.2+Math.sin(T*2+i)*3;wr(x+Math.cos(a)*r*1.6,y+Math.sin(a)*r*.8,1,1,i%4?'#14121c':'#b0b4c4');}}
function drawShield(T){const b=G.bounds;const cx=(b.minX+b.maxX)/2,cy=(b.minY+b.maxY)/2,rx=(b.maxX-b.minX)/2+14,ry=(b.maxY-b.minY)/2+12;
  ctx.globalAlpha=G.shieldFlash>0?.4+G.shieldFlash:.18;for(let i=0;i<120;i++){const a=i/120*Math.PI*2+T*.2;wr(cx+Math.cos(a)*rx,cy+Math.sin(a)*ry,1,1,'#7ff0ff');}ctx.globalAlpha=1;}
function drawFxTop(T){
  for(const p of G.parts){const a=1-p.t/p.life;ctx.globalAlpha=p.smoke?a*.5:Math.min(1,a*1.5);const s=p.smoke?p.s*(1+p.t):p.s;
    wr(p.x-s/2,p.y-p.h-s/2,s,s,G.psych&&p.blood?'#ff9ac8':p.col);}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='lighter';
  for(const b of G.beams){ctx.globalAlpha=Math.min(1,b.t/.12);pxLine(b.x1,b.y1,b.x2,b.y2,b.col,b.w||1);}
  for(const f of G.flashes){ctx.globalAlpha=1;wr(f.x-1.5,f.y-1.5,3,3,'#fff6c0');wr(f.x-.5,f.y-2.5,1,5,'#ffd060');}
  for(const b of G.booms){const r=b.r*(.3+b.t*1.4);ctx.globalAlpha=Math.max(0,1-b.t/.7);const g=ctx.createRadialGradient(sx(b.x),sy(b.y),0,sx(b.x),sy(b.y),r*Z);
    g.addColorStop(0,'rgba(255,240,180,1)');g.addColorStop(.4,'rgba(255,140,40,.7)');g.addColorStop(1,'rgba(255,60,20,0)');ctx.fillStyle=g;ctx.fillRect(sx(b.x)-r*Z,sy(b.y)-r*Z,r*Z*2,r*Z*2);}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
function lightList(T){const Ls=[];const off=G.blackout>0;const flick=G.pr<.75;
  if(!off)for(const l of G.lamps){if(flick&&hash(l.s,(T*6)|0,3)<(.75-G.pr)*1.6)continue;if(l.bad&&hash(l.s,(T*9)|0,1)<.3)continue;
    if(G.alert){const p=.5+.5*Math.sin(T*5+l.s);Ls.push({x:l.x,y:l.y+16,r:84,i:.55+.4*p,col:p>.5?'255,40,25':null});}else Ls.push({x:l.x,y:l.y+16,r:84,i:1});}
  for(const m of G.mods){const sp=SPR.mod[m.t];const ox=IX(m.gx,m.gy)-sp.ox,oy=IY(m.gx,m.gy)-sp.oy;
    if(m.broken){Ls.push({x:ox+sp.cx,y:oy+sp.cy-10,r:22,i:Math.sin(T*8)>0?.7:.2,col:'255,40,40'});continue;}
    for(const gl of sp.glow)Ls.push({x:ox+gl.x,y:oy+gl.y,r:gl.r*(off?.7:1)*(.4+.6*G.pr),i:off?.6:.85,col:gl.col});}
  for(const c of G.crew)Ls.push({x:IX(c.x,c.y)+c.face*6,y:IY(c.x,c.y)-6,r:off?44:30,i:.9});
  for(const [k,f] of G.fires){const [x,y]=unkey(k);Ls.push({x:IX(x+.5,y+.5),y:IY(x+.5,y+.5)-4,r:(30+22*f.v)*(.85+.15*Math.sin(T*13+x)),i:.95,col:'255,120,30'});}
  for(const b of G.beams)Ls.push({x:b.x2,y:b.y2,r:14,i:.7});
  for(const f of G.flashes)Ls.push({x:f.x,y:f.y,r:30,i:1,col:'255,200,90'});
  for(const b of G.booms)Ls.push({x:b.x,y:b.y,r:b.r*1.5,i:1,col:'255,160,60'});
  return Ls;}
function drawLighting(T){const L=LEVELS[G.lvl];let amb=clamp(L.amb+(1-G.pr)*.25+(G.blackout>0?.32:0),0,.9);if(G.psych)amb=.05;
  const s=.25,Ls=lightList(T);lg.setTransform(1,0,0,1,0,0);lg.globalCompositeOperation='source-over';lg.clearRect(0,0,lc.width,lc.height);
  lg.fillStyle=`rgba(3,2,9,${amb})`;lg.beginPath();
  for(const t of G.tiles){const d=tileDrop(t);if(d===null)continue;const wx=IX(t.x,t.y),wy=IY(t.x,t.y)+d;const top=Math.max(WH,40);
    const pts=[[wx-16,wy+8-top],[wx,wy-top],[wx+16,wy+8-top],[wx+16,wy+8+SL],[wx,wy+16+SL],[wx-16,wy+8+SL]];
    lg.moveTo(sx(pts[0][0])*s,sy(pts[0][1])*s);for(let i=1;i<6;i++)lg.lineTo(sx(pts[i][0])*s,sy(pts[i][1])*s);lg.closePath();}
  lg.fill();lg.globalCompositeOperation='destination-out';
  for(const l of Ls){const x=sx(l.x)*s,y=sy(l.y)*s,r=l.r*Z*s;const g=lg.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(0,0,0,${l.i})`);g.addColorStop(1,'rgba(0,0,0,0)');lg.fillStyle=g;lg.fillRect(x-r,y-r,r*2,r*2);}
  lg.globalCompositeOperation='source-over';
  ctx.imageSmoothingEnabled=true;ctx.drawImage(lc,0,0,lc.width/s,lc.height/s);ctx.imageSmoothingEnabled=false;
  ctx.globalCompositeOperation='lighter';
  for(const l of Ls){if(!l.col)continue;const x=sx(l.x),y=sy(l.y),r=l.r*Z*.7;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${l.col},.22)`);g.addColorStop(1,`rgba(${l.col},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
  ctx.globalCompositeOperation='source-over';}
function bubble(x,y,txt,o){o=o||{};const fs=Math.round(15*DPR);ctx.font=`${fs}px VT323,monospace`;const w=Math.min(ctx.measureText(txt).width,240*DPR)+10*DPR,h=fs+4*DPR;
  const X=Math.round(x-w/2),Y=Math.round(y-h);ctx.fillStyle=o.alien?'rgba(40,6,10,.9)':o.clone?'rgba(10,26,60,.9)':'rgba(12,10,22,.9)';ctx.fillRect(X,Y,w,h);
  ctx.fillStyle=o.alien?'#ff6a6a':o.clone?'#9cc8ff':'#6a5fa0';ctx.fillRect(X,Y+h,w,Math.max(1,DPR));ctx.fillRect(Math.round(x-DPR),Y+h,2*DPR,3*DPR);
  ctx.fillStyle=o.alien?'#ffd0d0':'#f2eeff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,x,Y+h/2+DPR,240*DPR);}
function drawLabels(T){
  for(const L of LABELS){
    if(L.k==='say')bubble(L.x,L.y,L.txt,L);
    else if(L.k==='hp'){const w=14*DPR;ctx.fillStyle='#200';ctx.fillRect(L.x-w/2,L.y,w,3*DPR);ctx.fillStyle='#ff3a3a';ctx.fillRect(L.x-w/2,L.y,w*clamp(L.v,0,1),3*DPR);}
    else if(L.k==='bar'){const w=14*Z,x=sx(L.x)-w/2,y=sy(L.y);ctx.fillStyle='#111';ctx.fillRect(x,y,w,Math.max(2,Z));ctx.fillStyle=L.col;ctx.fillRect(x,y,w*L.v,Math.max(2,Z));}
    else if(L.k==='ammo'){bubble(sx(L.x),sy(L.y),'⦿ '+L.v,{alien:L.v<30});}
    else if(L.k==='q'){const fs=Math.max(10,8*Z);ctx.font=`${fs}px VT323,monospace`;ctx.textAlign='center';ctx.fillStyle='#e0a0ff';ctx.fillText('?',sx(L.x),sy(L.y));}
    else if(L.k==='mod'){const m=L.m,x=sx(L.x),y=sy(L.y);let t='🔧';if(m.hot>0)t='☢ '+Math.ceil(m.hot)+' s';else if(m.needs2)t='🔧×2';
      bubble(x,y,t,{alien:m.hot>0});if(m.rp>0){const w=18*Z;ctx.fillStyle='#111';ctx.fillRect(x-w/2,y+3*DPR,w,Math.max(2,Z));ctx.fillStyle='#7ff8ff';ctx.fillRect(x-w/2,y+3*DPR,w*m.rp,Math.max(2,Z));}}}
  LABELS.length=0;}
function diamond(x,y,s,fill){const p=[[IX(x,y),IY(x,y)],[IX(x+s,y),IY(x+s,y)],[IX(x+s,y+s),IY(x+s,y+s)],[IX(x,y+s),IY(x,y+s)]];
  ctx.beginPath();ctx.moveTo(sx(p[0][0]),sy(p[0][1]));for(let i=1;i<4;i++)ctx.lineTo(sx(p[i][0]),sy(p[i][1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
function drawBuildGhost(T){const b=UI.build;if(!b||b.gx==null)return;const s=MOD[b.t].s;diamond(b.gx,b.gy,s,b.why?'rgba(255,60,80,.38)':'rgba(80,255,170,.35)');
  const sp=SPR.mod[b.t];ctx.globalAlpha=.55+.15*Math.sin(T*6);dI(sp.c,IX(b.gx,b.gy)-sp.ox,IY(b.gx,b.gy)-sp.oy);ctx.globalAlpha=1;}
function drawOverlays(T){
  if(G.psych){ctx.fillStyle=`rgba(255,170,220,${.12+.05*Math.sin(T*2)})`;ctx.fillRect(0,0,W,H);
    const fs=Math.round(16*DPR);ctx.font=`${fs}px VT323,monospace`;ctx.textAlign='center';ctx.fillStyle='rgba(255,90,170,.8)';
    for(let i=0;i<5;i++){const x=(i*W/5+T*30*DPR)%W,y=H*.25+Math.sin(T+i)*H*.2;ctx.fillText(['♥','✿','☺','♥','✿'][i],x,y);}}
  const danger=G.alarm>0||G.alert;
  if(danger&&!G.psych){const p=.5+.5*Math.sin(T*5);const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,'rgba(255,0,30,0)');g.addColorStop(1,`rgba(255,0,30,${.12+.12*p})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  if(G.flash>0){ctx.fillStyle=`rgba(255,250,235,${G.flash*.6})`;ctx.fillRect(0,0,W,H);}
  if(G.scare){ctx.fillStyle=`rgba(255,10,30,${Math.min(.45,G.scare.t)})`;ctx.fillRect(0,0,W,H);}
  drawTracker(T);}
