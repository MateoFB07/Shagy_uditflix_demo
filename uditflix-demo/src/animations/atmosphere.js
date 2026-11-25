import { createRuntime } from './runtime.js';
import { createAtmosphereGPU } from './atmosphereGPU.js';

export function mountAtmosphere(root) {
const rt = createRuntime();
const hero=root.querySelector('.hero'),detail=root.querySelector('#featuredDetail'),dots=[...root.querySelectorAll('.ud-ribbon-dots i')],intensity=root.querySelector('#udFogIntensity'),cv=root.querySelector('#udSmoke');
const colors=[['#ae9676','#745b4d','#b97b59'],['#8781bc','#454b88','#9890c8'],['#bc9853','#776443','#b8945d'],['#849b7f','#465f55','#a2b49a'],['#b2aa94','#756d63','#c7bda6']];
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
let prev=-1,target=colors[2].map(rgb),current=target.map(a=>a.slice());
function sync(){const n=Number(detail.dataset.index);if(n===prev||!colors[n])return;prev=n;target=colors[n].map(rgb);dots.forEach((el,i)=>el.classList.toggle('is-current',i===n));}
rt.observer(MutationObserver,sync).observe(detail,{attributes:true,attributeFilter:['data-index']});sync();current=target.map(a=>a.slice());
let ctx=null,gpu=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const ribbon=root.querySelector('#ribbon');
let visible=true,enabled=Number(intensity.value)>0,raf=0,last=0,t=0,drift=0,flow=0,W=0,H=0,img;
// Repeatable 2D noise. Advection and domain warping form evolving wisps instead of moving blobs.
const N=128,mask=N-1,table=new Float32Array(N*N);let seed=94721;
for(let i=0;i<table.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;table[i]=seed/4294967296;}
gpu=createAtmosphereGPU(cv,table);if(!gpu)ctx=cv.getContext('2d',{alpha:true});cv.dataset.renderer=gpu?'webgl':'canvas2d';if(!gpu&&!ctx)return () => rt.dispose();
function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y);let u=x-ix,v=y-iy;u=u*u*(3-2*u);v=v*v*(3-2*v);const a=(iy&mask)*N,b=((iy+1)&mask)*N,j=ix&mask,k=(ix+1)&mask;return (table[a+j]+(table[a+k]-table[a+j])*u)*(1-v)+(table[b+j]+(table[b+k]-table[b+j])*u)*v;}
function fb(x,y){return .56*noise(x,y)+.27*noise(x*2.03+19,y*2.03-11)+.12*noise(x*4.17-7,y*4.17+23)+.05*noise(x*8.31+13,y*8.31+5);}
function smooth(a,b,x){let k=Math.max(0,Math.min(1,(x-a)/(b-a)));return k*k*(3-2*k);}
function resize(){const r=hero.getBoundingClientRect();W=gpu?(innerWidth<600?220:480):(innerWidth<600?120:200);H=Math.max(65,Math.min(gpu?300:125,Math.round(W*r.height/Math.max(1,r.width))));if(gpu){gpu.resize(W,H);}else{cv.width=W;cv.height=H;img=ctx.createImageData(W,H);}if(reduced.matches||!enabled)draw(0);else start();}
// Long, softly folded ink veils; each has a distinct cross section and depth.
function draw(dt){
 const f=reduced.matches?1:1-Math.exp(-dt/1.25);
 for(let i=0;i<3;i++)for(let j=0;j<3;j++)current[i][j]+=(target[i][j]-current[i][j])*f;
 if(gpu){gpu.draw(t,drift,current);return;}
 const data=img.data, g=x=>Math.exp(-x*x), P=Math.PI*2;
 for(let i=0;i<W;i++){
  const u=(i+.5)/W, x=u*4.7+drift*1.9;
  const n=fb(x*.7+17,t*.38+4)-.5;
  const m=fb(x*.58-13,t*.32+33)-.5;
  const y1=.49+.12*Math.sin(x*1.18+t*.48)+.045*Math.sin(x*2.6-t*.29)+n*.16;
  const y2=.63+.10*Math.sin(x*1.34-t*.36+2.4)+.043*Math.sin(x*2.9+t*.21)+m*.14;
  const y3=.38+.095*Math.sin(x*.94+t*.31+4.3)+m*.11;
  const w1=.085+.033*(.5+.5*Math.sin(x*1.6+t*.22));
  const w2=.10+.035*(.5+.5*Math.sin(x*1.4-t*.24+1));
  const w3=.064+.025*(.5+.5*Math.sin(x*1.1+t*.33+2));
  const fade=g((u-.52)/.325)*smooth(0,.18,u)*smooth(0,.18,1-u);
  for(let j=0;j<H;j++){
   const v=(j+.5)/H;
   const warp=(noise(x*1.18+4,v*3.8+t*.19)-.5)*.041;
   const z1=(v-y1+warp)/w1,z2=(v-y2-warp*.8)/w2,z3=(v-y3+warp*.5)/w3;
   // Broad translucent folds rather than speckled clouds or uniform gradients.
   const a=(.46*g(z1)+.21*g((z1+.43)*1.8))*fade;
   const b=(.36*g(z2)+.15*g((z2-.45)*1.5))*fade;
   const c=(.23*g(z3)+.09*g((z3+.35)*1.5))*fade;
   const haze=.09*g((v-.53)/.25)*fade;
   const weight=a+b+c+haze, k=(j*W+i)*4;
   const alpha=(1-Math.exp(-weight*1.42))*smooth(0,.15,v)*smooth(0,.14,1-v);
   for(let ch=0;ch<3;ch++){
    const tint=(current[0][ch]*a+current[1][ch]*(b+haze)+current[2][ch]*c)/Math.max(weight,.00001);
    data[k+ch]=tint*.83+15;
   }
   data[k+3]=Math.round(255*alpha);
  }
 }
 ctx.putImageData(img,0,0);
}
function tick(now){raf=0;if(!visible||!enabled||document.hidden||reduced.matches)return;if(!last)last=now;let dt=(now-last)/1000;if(dt>=(gpu?1/27:1/15)){dt=Math.min(.10,dt);last=now;const velocity=Math.max(-1.5,Math.min(1.5,(ribbon.__udFlowSpeed||0)/.23));flow+=(velocity-flow)*(1-Math.exp(-dt/.95));t+=dt*(.08+.11*Math.min(1.5,Math.abs(flow)));drift+=dt*.09*flow;draw(dt);}raf=rt.frame(tick);}
function stop(){if(raf)rt.cancelFrame(raf);raf=0;last=0;}
function start(){if(visible&&enabled&&!document.hidden&&!reduced.matches&&!raf){last=0;raf=rt.frame(tick);}}
rt.listen(intensity,'change',()=>{hero.style.setProperty('--fog-strength',intensity.value);enabled=Number(intensity.value)>0;if(enabled){draw(reduced.matches?0:1/27);start();}else stop();});
rt.observer(IntersectionObserver,([e])=>{visible=e.isIntersecting;if(visible){draw(reduced.matches?0:1/27);start();}else stop();}).observe(hero);
rt.observer(ResizeObserver,resize).observe(hero);rt.listen(document,'visibilitychange',()=>{if(document.hidden)stop();else start();});rt.listen(reduced,'change',()=>{stop();if(reduced.matches)draw(0);else start();});
rt.observer(MutationObserver,()=>{if(reduced.matches&&(img||gpu))draw(0);}).observe(detail,{attributes:true,attributeFilter:['data-index']});
function labVisibility(){document.body.classList.toggle('ud-fog-away',innerWidth>520&&hero.getBoundingClientRect().bottom<innerHeight*.55);}rt.listen(window,'scroll',labVisibility,{passive:true});rt.listen(window,'resize',labVisibility);labVisibility();resize();draw(1/27);
if(gpu)rt.listen(gpu.surface,'webglcontextlost',e=>{e.preventDefault();gpu.dispose();gpu=null;ctx=cv.getContext('2d',{alpha:true});cv.dataset.renderer='canvas2d';if(ctx){resize();draw(0);}else stop();});
return () => { rt.dispose(); gpu?.dispose(); document.body.classList.remove('ud-fog-away'); };
}
