// ---------- modules ----------
function pad(g,H,w,col,haz){const h=w/2;
  for(const [y,x0,x1] of dRows(w,h))for(let x=x0;x<x1;x++){let c=col,f=0;
    if(x===x0||x===x1-1||y===0||y===h-1)f=.2;
    if(haz&&(x-x0<3||x1-x<=3))c=((((x>>1)+y)>>1)&1)?'#a8841c':'#222226';
    if(hash(x,y,31)<.05)f-=.1;P(g,x,y+H,shc(c,f));}}
function mkMod(t){const d=MOD[t],s=d.s,H=d.H,w=32*s;const {c,g}=mk(w,w/2+H);const cx=w/2,cy=H+w/4;const glow=[];
  switch(t){
  case 'reactor':
    pad(g,H,64,'#2b2f3a',true);prism(g,cx,cy,24,5,'#4a4f5c');
    cyl(g,cx-18,cy-1,3,15,'#8a6a3a');cyl(g,cx+18,cy-1,3,15,'#8a6a3a');
    line(g,cx-18,cy-16,cx-11,cy-24,'#8a6a3a');line(g,cx+18,cy-16,cx+11,cy-24,'#6a4a28');
    cyl(g,cx,cy-5,13,28,'#6b7385','#9aa4b8');
    for(let x=cx-9;x<=cx+8;x++)for(let y=cy-27;y<=cy-11;y++){const tt=Math.abs(x+.5-cx)/9;P(g,x,y,tt<.35?'#7ff8ff':tt<.7?'#2ad0e0':'#0b4a58');}
    RC(g,cx-13,cy-28,26,1,'#3a404c');RC(g,cx-13,cy-10,26,1,'#3a404c');
    cyl(g,cx,cy-33,7,4,'#4a505c','#2a2e36');line(g,cx+3,cy-40,cx+3,cy-45,'#aab0bb');P(g,cx+3,cy-45,'#ff4444');
    glow.push({x:cx,y:cy-19,r:56,col:'120,255,255'});break;
  case 'engine':
    pad(g,H,64,'#2b2f3a',true);prism(g,cx,cy,26,14,'#3d4049');
    for(let i=0;i<4;i++){const [x,y]=LF(cx,cy,26,.2+i*.18,4);RC(g,x,y-6,2,6,'#22242a');}
    for(let i=0;i<3;i++){const [x,y]=RF(cx,cy,26,.25+i*.22,5);RC(g,x,y-4,3,4,'#6a3a12');}
    cyl(g,cx-11,cy-14,7,7,'#5b606c','#1a0c06');ell(g,cx-11,cy-21,4,2,'#4ac8ff');
    cyl(g,cx+11,cy-14,7,7,'#5b606c','#1a0c06');ell(g,cx+11,cy-21,4,2,'#4ac8ff');
    glow.push({x:cx-11,y:cy-24,r:40,col:'90,200,255'},{x:cx+11,y:cy-24,r:40,col:'90,200,255'});break;
  case 'o2':{
    pad(g,H,64,'#2b3236');prism(g,cx+2,cy,26,5,'#3e4652');
    prism(g,cx+4,cy-5,17,20,'#2f6a63',{l:'#2a5e58',r:'#1c4542',t:'#4a9088'});
    for(let k=0;k<90;k++){const L=R()<.55;const u=.08+R()*.84,v=1+Math.pow(R(),1.6)*15;const [x,y]=(L?LF:RF)(cx+4,cy-5,17,u,v);P(g,x,y,pick(['#4fd36a','#2e9a48','#7ae05a','#e05aa0']));}
    const [a1,b1]=LF(cx+4,cy-5,17,.15,18),[a2,b2]=LF(cx+4,cy-5,17,.15,4);line(g,a1,b1,a2,b2,'#9ff0e0');
    cyl(g,cx-19,cy+3,5,18,'#c9d2dc','#eef2f6');cyl(g,cx-10,cy+9,5,13,'#b9c4d0','#eef2f6');RC(g,cx-21,cy-8,4,1,'#3a8ae0');
    glow.push({x:cx+4,y:cy-15,r:30,col:'80,255,180'});break;}
  case 'quarters':{
    pad(g,H,64,'#2e2a2c');prism(g,cx+2,cy-11,6,16,'#4a5a6a');
    RC(g,cx-22,cy-15,1,12,'#5a4636');RC(g,cx-2,cy-15,1,12,'#5a4636');
    prism(g,cx-12,cy-2,10,6,'#5a4636',{t:'#a8323a'});prism(g,cx-12,cy-12,10,2,'#5a4636',{t:'#3a5aa8'});
    prism(g,cx+13,cy-1,10,6,'#5a4636',{t:'#d9a030'});
    prism(g,cx+1,cy+9,6,10,'#e6e8ec',{t:'#f4f6f8',l:'#d6dae0',r:'#aab0b8'});
    const [px1,py1]=LF(cx+1,cy+9,6,.5,5);ell(g,px1,py1,2.2,2.2,'#7a8290');ell(g,px1,py1,1.3,1.3,'#3a6aa8');
    glow.push({x:cx,y:cy-8,r:24,col:'255,200,140'});break;}
  case 'hull':pad(g,H,64,'#4a5262',true);break;
  case 'sentry':
    pad(g,H,32,'#2b2f3a',true);line(g,cx-7,cy+3,cx,cy-6,'#5a6070');line(g,cx+7,cy+3,cx,cy-6,'#4a5060');line(g,cx,cy+5,cx,cy-6,'#6a7080');
    prism(g,cx,cy-6,5,6,'#3e4a3a',{t:'#5a6a4a'});prism(g,cx+5,cy+3,3,4,'#4a5a2a',{t:'#7a8a3a'});RC(g,cx-1,cy-14,2,2,'#ff3030');break;
  case 'turret':
    pad(g,H,32,'#2b2f3a',true);cyl(g,cx,cy,9,7,'#4c5462','#5f6878');
    for(let x=cx-8;x<cx+8;x+=3)RC(g,x,cy-3,1,2,'#a8841c');
    cyl(g,cx,cy-7,6,5,'#6a7382','#8a94a6');break;
  case 'workshop':{
    pad(g,H,64,'#2b2f3a');prism(g,cx-14,cy-9,7,11,'#4a5a3a',{t:'#6a7a4a'});
    prism(g,cx-4,cy+2,16,9,'#6b5233',{t:'#8a6a40'});
    RC(g,cx-10,cy-12,3,3,'#444a55');RC(g,cx-2,cy-9,6,1,'#c0c4cc');P(g,cx+2,cy-10,'#e03a3a');P(g,cx-6,cy-8,'#3a8ae0');
    cyl(g,cx+16,cy-2,5,6,'#d09a20','#e8b830');
    for(let k=0;k<2;k++){line(g,cx+16+k,cy-8,cx+20+k,cy-26,'#e0a820');line(g,cx+20+k,cy-26,cx+8+k,cy-31,'#e0a820');}
    ell(g,cx+21,cy-26,2,2,'#333');line(g,cx+8,cy-31,cx+6,cy-27,'#999');line(g,cx+9,cy-31,cx+10,cy-27,'#999');
    glow.push({x:cx+7,y:cy-27,r:20,col:'255,220,140'});break;}
  case 'medbay':{
    pad(g,H,64,'#263034');prism(g,cx-14,cy-8,5,20,'#e8eef2');
    const [qx,qy]=LF(cx-14,cy-8,5,.5,12);RC(g,qx-1,qy-3,2,6,'#e03a3a');RC(g,qx-3,qy-1,6,2,'#e03a3a');
    prism(g,cx-2,cy+3,15,7,'#cfd8e0',{t:'#9fe0d8'});prism(g,cx-11,cy-1,4,2,'#ffffff',{t:'#ffffff'});
    prism(g,cx+17,cy-3,2,18,'#5a6470');prism(g,cx+17,cy-21,6,7,'#1a2226',{l:'#0e2a24'});
    const pts=[0,0,0,2,-2,1,0,0,0];for(let i=0;i<pts.length;i++){const [x,y]=LF(cx+17,cy-21,6,.08+i*.1,3.5+pts[i]);P(g,x,y,'#3af07a');}
    line(g,cx+8,cy-6,cx+8,cy-24,'#aab0b8');RC(g,cx+6,cy-26,4,5,'#c8e8ff');
    glow.push({x:cx+17,y:cy-25,r:22,col:'80,255,140'});break;}
  case 'lab':{
    pad(g,H,64,'#262a36');prism(g,cx+4,cy-12,9,14,'#4a3a2a',{t:'#5a4a36'});
    for(let i=0;i<4;i++){const [x,y]=LF(cx+4,cy-12,9,.15+i*.22,9);RC(g,x,y-2,2,3,['#e05aa0','#5ae0a0','#e0d05a','#5aa0e0'][i]);}
    prism(g,cx-8,cy+2,16,8,'#3c4250',{t:'#5a6272'});
    prism(g,cx-14,cy-6,4,7,'#20242c',{l:'#1d6a8a'});prism(g,cx-4,cy-2,4,7,'#20242c',{l:'#2a8a5a'});
    cyl(g,cx+16,cy+3,6,12,'#7a3ad0','#b080ff');cyl(g,cx+16,cy-9,2,5,'#9a6ae0','#c0a0ff');
    glow.push({x:cx+16,y:cy-3,r:28,col:'180,100,255'});break;}
  case 'armory':{
    pad(g,H,64,'#2a2a2c',true);
    for(const [dx,dy] of [[-12,-8],[0,-2],[12,4]]){prism(g,cx+dx,cy+dy,6,22,'#4b5a48');
      for(let i=0;i<3;i++){const [x,y]=LF(cx+dx,cy+dy,6,.5,17-i*2);RC(g,x-2,y,4,1,'#2a3228');}
      const [lx,ly]=LF(cx+dx,cy+dy,6,.8,8);P(g,lx,ly,'#ffd04a');}
    prism(g,cx-6,cy+12,8,4,'#6a5030');P(g,cx-12,cy-33,'#ff3030');P(g,cx-11,cy-33,'#ff3030');
    glow.push({x:cx-12,y:cy-33,r:24,col:'255,60,40'});break;}
  case 'shield':
    pad(g,H,64,'#232a3a');prism(g,cx,cy,18,8,'#3d4560');cyl(g,cx,cy-8,10,6,'#56607a','#2a3040');
    cyl(g,cx-15,cy+1,2,20,'#8a96b0');cyl(g,cx+15,cy+1,2,20,'#8a96b0');
    ell(g,cx,cy-27,10,10,'#2d6ad8');ell(g,cx-2,cy-29,6,6,'#4a86f0');ell(g,cx-4,cy-31,2.5,2.5,'#cfe4ff');
    for(let k=0;k<48;k++){const a=k/48*Math.PI*2;const x=cx+Math.cos(a)*13,y=cy-25+Math.sin(a)*4;if(Math.sin(a)>0||Math.abs(x-cx)>9.5)P(g,x,y,'#7ff0ff');}
    glow.push({x:cx,y:cy-27,r:48,col:'90,160,255'});break;
  case 'nmach':{
    pad(g,H,64,'#2b2f3a');prism(g,cx,cy,24,22,'#8a5a2a',{t:'#a8743a'});
    const NG=['X...X','XX..X','X.X.X','X..XX','X...X'];
    for(let j=0;j<5;j++)for(let i=0;i<5;i++)if(NG[j][i]==='X'){const [x,y]=LF(cx,cy,24,.2+i*.13,19-j*3);RC(g,x,y,3,3,'#ffe08a');}
    cyl(g,cx+6,cy-22,6,5,'#b0b8c4','#2a2a2a');
    const [lx,ly]=RF(cx,cy,24,.6,10);line(g,lx,ly,lx+4,ly-12,'#888888');ell(g,lx+4,ly-13,2,2,'#e03030');
    const [gx2,gy2]=RF(cx,cy,24,.25,15);ell(g,gx2,gy2,3,3,'#e8e0c0');line(g,gx2,gy2,gx2+2,gy2-2,'#222222');
    glow.push({x:cx+6,y:cy-28,r:22,col:'255,200,80'});break;}
  case 'sepul':
    pad(g,H,64,'#1e1626');prism(g,cx,cy,16,6,'#3a2a4a');prism(g,cx,cy-6,9,34,'#4a2a6a',{t:'#c070ff'});
    for(let k=0;k<16;k++){const [x,y]=LF(cx,cy-6,9,.2+R()*.6,4+R()*28);P(g,x,y,'#c070ff');}
    glow.push({x:cx,y:cy-44,r:36,col:'200,110,255'});break;
  }
  return {c,ox:w/2,oy:H,glow,cx,cy,H,w};}

