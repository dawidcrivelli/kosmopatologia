// ---------- fx helpers (world px) ----------
function part(x,y,h,vx,vy,vh,col,s,o){if(G.parts.length>700)return;G.parts.push(Object.assign({x,y,h,vx,vy,vh,col,s:s||1,t:0,life:1,g:90},o||{}));}
function burst(x,y,n,sp,col){for(let i=0;i<n;i++)part(x,y,6,rnd(-sp,sp),rnd(-sp/2,sp/2),rnd(sp*.3,sp*1.2),col,1,{life:rnd(.3,.8),spark:1});}
function spray(c,tx,ty,col){const x0=IX(c.x,c.y)+c.face*4,y0=IY(c.x,c.y),x1=IX(tx,ty),y1=IY(tx,ty);part(x0,y0,9,(x1-x0)*1.8+rnd(-6,6),(y1-y0)*1.8+rnd(-4,4),rnd(-4,8),col,1,{g:20,life:.45,spark:1});}
function decal(x,y,col,s,life){if(G.decals.length>160)G.decals.shift();G.decals.push({x,y,col,s,life,max:life});}
function beam(x1,y1,x2,y2,col){G.beams.push({x1,y1,x2,y2,col,t:.12});}
function boom(x,y,r){sfx('boom');G.booms.push({x,y,r,t:0});for(let i=0;i<26;i++)part(x,y,8,rnd(-50,50),rnd(-26,26),rnd(10,60),pick(['#fff0a0','#ffb040','#ff5a20','#5a5560']),2,{g:40,life:rnd(.5,1.3),spark:1});}
function runFx(dt){for(const p of G.parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.h+=p.vh*dt;p.vh-=p.g*dt;p.vx*=1-dt*1.5;p.vy*=1-dt*1.5;
    if(p.h<0&&!p.smoke){if(p.blood&&R()<.5&&!G.psych)decal(p.x,p.y,'#6a0a12',1+R()*1.5,50);if(p.limb){p.h=0;p.vh=-p.vh*.3;p.vx*=.5;p.vy*=.5;}else p.t=p.life;}}
  G.parts=G.parts.filter(p=>p.t<p.life);
  for(const d of G.decals)d.life-=dt;G.decals=G.decals.filter(d=>d.life>0);
  for(const f of G.flashes)f.t-=dt;G.flashes=G.flashes.filter(f=>f.t>0);
  for(const b of G.beams)b.t-=dt;G.beams=G.beams.filter(b=>b.t>0);
  for(const b of G.booms)b.t+=dt;G.booms=G.booms.filter(b=>b.t<.7);
  G.shake=Math.max(0,G.shake-dt*2.2);G.flash=Math.max(0,G.flash-dt*2.5);G.alarm=Math.max(0,G.alarm-dt);G.shieldFlash=Math.max(0,G.shieldFlash-dt);
  if(G.scare){G.scare.t-=dt;if(G.scare.t<=0)G.scare=null;}
  G.blackout=Math.max(0,G.blackout-dt);G.chatCd-=dt;G.ncd=Math.max(0,G.ncd-dt);
  const tt=G.grav&&G.grav.type==='side'?G.grav.tilt:0;G.tilt+=(tt-G.tilt)*Math.min(1,dt*3);}

