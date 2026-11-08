// ---------- pathfinding ----------
const _prev=new Int32Array(GW*GH),_q=new Int32Array(GW*GH);
function bfs(sx,sy,goal){if(!inb(sx,sy))return null;if(goal(sx,sy))return [];_prev.fill(-2);let h=0,t=0;const s=idx(sx,sy);_prev[s]=-1;_q[t++]=s;
  while(h<t){const cur=_q[h++];const cx=cur%GW,cy=(cur/GW)|0;
    for(const [dx,dy] of DIRS){const nx=cx+dx,ny=cy+dy;if(!walk(nx,ny))continue;const ni=idx(nx,ny);if(_prev[ni]!==-2)continue;_prev[ni]=cur;
      if(goal(nx,ny)){const path=[];let k=ni;while(k!==s){path.push([k%GW,(k/GW)|0]);k=_prev[k];}return path.reverse();}
      _q[t++]=ni;}}
  return null;}
function moveUnit(u,sp,dt){if(!u.path||!u.path.length){u.moving=false;return true;}
  const [nx,ny]=u.path[0];if(!walk(nx,ny)){u.path=null;u.moving=false;return true;}
  const tx=nx+.5,ty=ny+.5,dx=tx-u.x,dy=ty-u.y,d=Math.hypot(dx,dy),step=sp*dt;
  if(d<=step){u.x=tx;u.y=ty;u.path.shift();}else{u.x+=dx/d*step;u.y+=dy/d*step;}
  const sdx=dx-dy;if(Math.abs(sdx)>.01)u.face=sdx>0?1:-1;u.moving=true;u.anim+=dt*sp*3;return false;}
function randomWalk(u){const x0=u.x|0,y0=u.y|0;const w=walkTiles().filter(t=>Math.abs(t.x-x0)+Math.abs(t.y-y0)<=5);if(!w.length)return null;
  const t=pick(w);return bfs(x0,y0,(x,y)=>x===t.x&&y===t.y);}

