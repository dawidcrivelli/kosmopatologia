// ---------- floor, walls, hull ----------
function mkFloor(kind,seed){const {c,g}=mk(32,16);
  for(const [y,x0,x1] of dRows(32,16))for(let x=x0;x<x1;x++){
    const u=(x+.5-16)/16,v=(y+.5-8)/8,A=(u+v+1)*1.5,B=(v-u+1)*1.5,fa=A-Math.floor(A),fb=B-Math.floor(B);
    let col='#363c48',f=0;
    if(kind==='hazard')col=((((x>>1)+y)>>1)&1)?'#a8841c':'#2a2a2c';
    if(kind==='rust'&&hash(x>>1,y,seed)<.35)col='#5a3c28';
    if(kind==='grate'){f=(((x+2*y)&3)<1||((x-2*y+64)&3)<1)?-.42:.04;}
    else if(kind==='vent'&&Math.abs(u+v)<.55&&Math.abs(v-u)<.55){col='#15171d';f=((x+2*y)%3===0)?.35:0;}
    else{const n=hash(x,y,seed);if(n<.07)f-=.13;else if(n>.975)f+=.16;}
    if(fa<.1||fb<.1)f-=.28;
    if(x===x0||x===x1-1)f-=.25;
    P(g,x,y,shc(col,f));}
  return c;}
const WH=28,SL=7;
const DECOS=['plain','lamp','window','screen','pipe','vent','warn','blood'];
function mkWall(side,deco,seed){const {c,g}=mk(16,WH+8);const base=side==='L'?'#4b5364':'#353b48';
  for(let x=0;x<16;x++){const yt=side==='L'?Math.max(0,Math.ceil((14-x)/2)):Math.floor(x/2);
    for(let r=0;r<WH;r++){const y=yt+WH-1-r;let col=base,f=0;
      if(r>=WH-2)f=.28;else if(r===WH-3)f=-.35;
      if(r<3){col='#272b34';if(r===2)f=.18;}
      if((x&7)===0)f-=.14;
      if(r===13)f-=.25;else if(r===14)f+=.08;
      if(hash(x,r,seed)<.05)f-=.1;
      if(deco==='lamp'&&x>=5&&x<=10&&r>=17&&r<=20){col='#fff0b8';f=(r===17||r===20||x===5||x===10)?-.45:0;}
      else if(deco==='window'){const d=Math.hypot(x-7.5,r-16.5);if(d<4.3){col='#090d26';f=0;if(hash(x,r,seed+9)<.1)col='#d6e4ff';}else if(d<5.5){col='#8b94a8';f=d<4.9?.12:-.22;}}
      else if(deco==='screen'&&x>=3&&x<=12&&r>=10&&r<=17){if(x===3||x===12||r===10||r===17)col='#1a1e26';else{col='#0b2a1a';if(r%2===1&&hash(x,r,seed+3)<.6)col='#39e07a';}f=0;}
      else if(deco==='pipe'&&r>=7&&r<=9){col='#8a6a3a';f=r===9?.22:r===7?-.3:0;}
      else if(deco==='pipe'&&x===11&&r>9&&r<WH-3){col='#7a5a30';}
      else if(deco==='vent'&&x>=4&&x<=11&&r>=5&&r<=11){col=r%2?'#161920':'#4a505c';f=0;}
      else if(deco==='warn'&&r>=3&&r<=5){col=(((x+r)>>1)&1)?'#a8841c':'#222226';f=0;}
      else if(deco==='blood'){const n=hash(x*3,r*5,seed+1);if(r>2&&r<16&&n<(r<7?.4:.16)){col='#6a0c12';f=n<.08?.12:0;}}
      P(g,x,y,shc(col,f));}}
  return c;}
function mkSlab(side){const {c,g}=mk(16,16+SL+1);
  for(let x=0;x<16;x++){const yb=side==='L'?Math.floor((x+16)/2):Math.ceil((32-x)/2)-1;
    for(let r=1;r<=SL;r++){let col=side==='L'?'#2c313c':'#1e222a',f=0;if(r===1)f=.3;if(r===SL)f=-.35;if((x&7)===0)f-=.15;
      if(r===4&&(x&7)===4)col='#ff4a3a';P(g,x,yb+r,shc(col,f));}}
  return c;}
function mkBreach(){const {c,g}=mk(32,16);
  for(const [y,x0,x1] of dRows(32,16))for(let x=x0;x<x1;x++){const u=(x+.5-16)/16,v=(y+.5-8)/8;
    const d=Math.abs(u)+Math.abs(v)+(hash(x,y,77)-.5)*.35;
    if(d<.6)P(g,x,y,hash(x,y,5)<.06?'#cfe0ff':'#03030b');else if(d<.76)P(g,x,y,hash(x,y,8)<.5?'#7a808c':'#3a3f4a');}
  return c;}

