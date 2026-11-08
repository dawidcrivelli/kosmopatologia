'use strict';
const $=s=>document.querySelector(s);
const R=Math.random,rnd=(a,b)=>a+R()*(b-a),ri=(a,b)=>Math.floor(a+R()*(b-a+1)),pick=a=>a[Math.floor(R()*a.length)];
const _bags=new Map();function pk(arr){let b=_bags.get(arr);if(!b||!b.length){b=arr.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[b[i],b[j]]=[b[j],b[i]];}_bags.set(arr,b);}return b.pop();}
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function hash(x,y,s){let h=(x*374761393+y*668265263+(s||0)*1442695041)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');return {c,g};}
function P(g,x,y,col){g.fillStyle=col;g.fillRect(Math.floor(x),Math.floor(y),1,1);}
function RC(g,x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function poly(g,pts,col){let y0=1e9,y1=-1e9;for(const p of pts){if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1];}g.fillStyle=col;
  for(let y=Math.floor(y0);y<Math.ceil(y1);y++){const yc=y+.5,xs=[];
    for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];
      if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc))xs.push(a[0]+(yc-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
    xs.sort((p,q)=>p-q);
    for(let k=0;k+1<xs.length;k+=2){const xa=Math.round(xs[k]),xb=Math.round(xs[k+1]);if(xb>xa)g.fillRect(xa,y,xb-xa,1);}}}
function line(g,x0,y0,x1,y1,col){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
  const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;g.fillStyle=col;
  for(let n=0;n<600;n++){g.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}
function ell(g,cx,cy,rx,ry,col){g.fillStyle=col;for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++){const dy=(y+.5-cy)/ry;if(dy<-1||dy>1)continue;
  const hw=rx*Math.sqrt(1-dy*dy);const xa=Math.round(cx-hw),xb=Math.round(cx+hw);if(xb>xa)g.fillRect(xa,y,xb-xa,1);}}
function hx(c){c=c.replace('#','');return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)];}
function sh(c,f){const v=hx(c).map(x=>clamp(Math.round(f>0?x+(255-x)*f:x*(1+f)),0,255));return '#'+v.map(x=>x.toString(16).padStart(2,'0')).join('');}
const _shc=new Map();function shc(c,f){const k=c+f;let v=_shc.get(k);if(!v){v=sh(c,f);_shc.set(k,v);}return v;}
function prism(g,cx,cy,a,h,col,o){o=o||{};const b=a/2;
  poly(g,[[cx-a,cy],[cx,cy+b],[cx,cy+b-h],[cx-a,cy-h]],o.l||sh(col,-.12));
  poly(g,[[cx,cy+b],[cx+a,cy],[cx+a,cy-h],[cx,cy+b-h]],o.r||sh(col,-.38));
  poly(g,[[cx,cy-b-h],[cx+a,cy-h],[cx,cy+b-h],[cx-a,cy-h]],o.t||sh(col,.15));
  line(g,cx-a,cy-h,cx-1,cy+b-h-.5,sh(o.t||col,.3));line(g,cx,cy+b-h,cx+a-1,cy-h,sh(col,0));
  if(h>2)line(g,cx,cy+b-h+1,cx,cy+b-1,sh(col,-.22));}
const LF=(cx,cy,a,u,v)=>[cx-a+u*a,cy+u*a/2-v];
const RF=(cx,cy,a,u,v)=>[cx+u*a,cy+a/2-u*a/2-v];
function cyl(g,cx,cy,r,h,col,top){const ry=r/2;
  for(let x=Math.floor(cx-r);x<Math.ceil(cx+r);x++){const t=(x+.5-cx)/r;if(t<-1||t>1)continue;
    const f=t<-.45?.18:t<.15?0:t<.6?-.22:-.4;const yb=cy+ry*Math.sqrt(1-t*t);
    g.fillStyle=shc(col,f);g.fillRect(x,Math.round(cy-h),1,Math.max(1,Math.round(yb-(cy-h))));}
  ell(g,cx,cy-h,r,ry,top||sh(col,.25));}
function dRows(w,h){const rows=[];for(let y=0;y<h;y++){const k=y<h/2?y+1:h-y;const hw=k*(w/h);rows.push([y,Math.round(w/2-hw),Math.round(w/2+hw)]);}return rows;}
function fromMap(rows,pal){const h=rows.length,w=rows[0].length;const {c,g}=mk(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ch=rows[y][x];if(ch!=='.'&&pal[ch])P(g,x,y,pal[ch]);}return c;}
function flipH(c){const o=mk(c.width,c.height);o.g.translate(c.width,0);o.g.scale(-1,1);o.g.drawImage(c,0,0);return o.c;}

