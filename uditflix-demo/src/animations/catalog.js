import { entries } from '../data/catalog';
import { createRuntime } from './runtime.js';

export function mountCatalog(root) {
const rt = createRuntime();
let filter='Todos';const grid=root.querySelector('#grid'),search=root.querySelector('#search'),dialog=root.querySelector('#dialog'),reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;let drag=null,raf=0,suppressClick=0;function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}function detail(i){const c=entries[i];if(!c)return;root.querySelector('#detailImage').src=c.image;root.querySelector('#detailImage').alt='Imagen de '+c.title;root.querySelector('#detailTitle').textContent=c.title;root.querySelector('#detailGenre').textContent=c.type+' · '+c.genre;root.querySelector('#detailDescription').textContent=c.description;dialog.showModal();}

const section=root.querySelector('#explorar'),sticky=section.querySelector('.explore-sticky'),rail=root.querySelector('#railWrap');
const track=grid.querySelector('.motion-track');
const prevButton=root.querySelector('#railPrev'),nextButton=root.querySelector('#railNext'),pill=root.querySelector('#railPrevPill');
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=(a,b,x)=>{let t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
let gridWidth=0,sectionTop=0,mode=false,steps=0,range=0,openCount=1,openW=0,spineW=0,gap=0,position=0,target=0,frame=0,lastTime=0,gesture=null,resizeFrame=0;
const startY=()=>sectionTop;
const allCards=()=>[...track.children];
const cards=()=>allCards().filter(card=>!card.hidden);
function progress(p){p=clamp(p,0,1);const bar=root.querySelector('#railProgress');bar.style.width='100%';bar.style.transformOrigin='left';bar.style.transform=`scaleX(${p})`;prevButton.disabled=p<.001;pill.disabled=prevButton.disabled;nextButton.disabled=p>.999;}
function nativeProgress(){if(mode)return;const max=grid.scrollWidth-grid.clientWidth;progress(max>0?grid.scrollLeft/max:1);}
function paint(p){const list=cards();if(!mode||!list.length)return;const base=Math.min(Math.floor(p),steps),u=base===steps?0:p-base;const t=smooth(0,1,u);let sum=0;
 for(let i=0;i<list.length;i++){const c=list[i];let a=i>=base&&i<base+openCount?1:0;if(base<steps){if(i===base)a=1-t;if(i===base+openCount)a=t;}const w=spineW+(openW-spineW)*a;sum+=w;const copy=smooth(.78,.98,a);const width=w.toFixed(2)+'px';if(c.style.getPropertyValue('--panel-width')===width)continue;c.style.setProperty('--panel-width',width);c.style.setProperty('--copy-opacity',copy.toFixed(3));c.style.setProperty('--copy-visibility',copy>.01?'visible':'hidden');c.style.setProperty('--art-opacity',smooth(.12,.64,a).toFixed(3));c.style.setProperty('--spine-opacity',(1-smooth(.06,.30,a)).toFixed(3));c.style.setProperty('--panel-radius',Math.min(32,w*.5).toFixed(2)+'px');c.dataset.open=String(a>.88);}
 const max=Math.max(0,sum+gap*(list.length-1)-gridWidth);const shift=clamp((p-1)*(spineW+gap),0,max);track.style.transform=`translate3d(${-shift}px,0,0)`;progress(steps?p/steps:1);
}
function cancelMotion(){if(frame)rt.cancelFrame(frame);frame=0;lastTime=0;}
function tick(t){const dt=lastTime?Math.min(t-lastTime,50):16;lastTime=t;position+=(target-position)*(1-Math.exp(-dt/66));if(Math.abs(position-target)<.001)position=target;paint(position);if(position!==target)frame=rt.frame(tick);else{frame=0;lastTime=0;}}
function sync(immediate=false){if(!mode)return;target=steps*clamp((scrollY-startY())/range,0,1);if(immediate){cancelMotion();position=target;paint(position);}else if(!frame&&Math.abs(position-target)>.001)frame=rt.frame(tick);}
function layout(reset=false){cancelMotion();const list=cards(),v=grid.clientWidth,h=innerHeight,old=mode;gridWidth=v;sectionTop=section.getBoundingClientRect().top+scrollY;const n=list.length;openCount=v>=1000?3:v>=600?2:1;steps=Math.max(0,n-openCount);mode=!reduceMotion&&h>=570&&v>0&&steps>0;
 section.classList.toggle('accordion-motion',mode);section.classList.remove('scroll-motion');section.style.height='';track.style.transform='';grid.scrollLeft=0;
 if(!mode){for(const c of list){for(const key of ['--panel-width','--copy-opacity','--copy-visibility','--art-opacity','--spine-opacity','--panel-radius'])c.style.removeProperty(key);delete c.dataset.open;}nativeProgress();return;}
 gap=v<500?10:v<850?18:Math.min(32,v*.023);spineW=v<500?24:v<850?34:Math.min(52,v*.04);const extra=Math.min(2,steps);openW=(v-extra*spineW-(openCount+extra-1)*gap)/openCount;
 const pad=clamp(openW*.085,17,38),font=clamp(openW*.116,25,52);const panelH=clamp(h-(v<500?275:265),295,510);
 section.style.setProperty('--motion-gap',gap+'px');section.style.setProperty('--open-width',openW+'px');section.style.setProperty('--panel-pad',pad+'px');section.style.setProperty('--panel-font',font+'px');section.style.setProperty('--panel-height',panelH+'px');range=steps*clamp(h*.47,245,440);section.style.height=Math.ceil(Math.max(h,sticky.offsetHeight)+range)+'px';
 if(reset&&scrollY>=startY()-5)window.scrollTo({top:startY(),behavior:'instant'});sync(true);
}
function step(dir){if(mode){const p=clamp((dir>0?Math.floor(target+.02)+1:Math.ceil(target-.02)-1),0,steps);window.scrollTo({top:startY()+range*p/steps,behavior:reduceMotion?'instant':'smooth'});}else{grid.scrollBy({left:dir*grid.clientWidth*.85,behavior:reduceMotion?'instant':'smooth'});}}
function reveal(i){if(!mode)return;const p=clamp(i-openCount+1,0,steps);const before=clamp(i,0,steps);const to=i<position?before:p;window.scrollTo({top:startY()+range*to/steps,behavior:'smooth'});}
function render(){
 const q=norm(search.value.trim()); let n=0;
 for(const b of allCards()){
  const i=Number(b.dataset.entryIndex), c=entries[i];
  b.hidden=(filter!=='Todos'&&filter!==c.type)||!norm(c.title+' '+c.genre+' '+c.type).includes(q);
  if(!b.hidden){n++;b.querySelector('.spine').textContent=String(n).padStart(2,'0')+' / '+c.type;}
 }
 root.querySelector('#count').textContent=n+(n===1?' título':' títulos');root.querySelector('#empty').hidden=n!==0;rail.hidden=n===0;root.querySelector('#railFoot').hidden=n===0;grid.scrollLeft=0;layout(true);
}
for(const b of allCards()){
 rt.listen(b,'click',()=>{if(performance.now()<suppressClick)return;const idx=cards().indexOf(b);if(mode&&b.dataset.open!=='true'){reveal(idx);return;}detail(Number(b.dataset.entryIndex));});
 rt.listen(b,'focus',()=>{if(mode&&b.matches(':focus-visible')&&b.dataset.open!=='true')reveal(cards().indexOf(b));});
}
// Vertical native scrolling is the master timeline. Horizontal drag/wheel maps to that same timeline.
rt.listen(grid,'pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY,scroll:scrollY,left:grid.scrollLeft,active:false};});
rt.listen(grid,'pointermove',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(!gesture.active&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)*1.25){gesture.active=true;grid.setPointerCapture(e.pointerId);grid.classList.add('dragging');}if(gesture.active){if(mode){const perStep=Math.max(150,openW*.82);const p=clamp((gesture.scroll-startY())/range*steps-dx/perStep,0,steps);window.scrollTo({top:startY()+p/steps*range,behavior:'instant'});}else grid.scrollLeft=gesture.left-dx;e.preventDefault();}});
function release(e){if(!gesture||gesture.id!==e.pointerId)return;if(gesture.active){suppressClick=performance.now()+280;if(grid.hasPointerCapture(e.pointerId))grid.releasePointerCapture(e.pointerId);}gesture=null;grid.classList.remove('dragging');}
rt.listen(grid,'pointerup',release);rt.listen(grid,'pointercancel',release);rt.listen(grid,'pointerleave',()=>{if(gesture&&!gesture.active)gesture=null;});rt.listen(grid,'wheel',e=>{if(mode&&Math.abs(e.deltaX)>Math.abs(e.deltaY)&&scrollY>=startY()-5&&scrollY<=startY()+range+5){e.preventDefault();window.scrollTo({top:clamp(scrollY+e.deltaX,startY(),startY()+range),behavior:'instant'});}},{passive:false});
rt.listen(grid,'scroll',nativeProgress,{passive:true});rt.listen(grid,'keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowLeft'?-1:1);}});prevButton.onclick=()=>step(-1);pill.onclick=()=>step(-1);nextButton.onclick=()=>step(1);
let hover=null;rt.listen(grid,'pointermove',e=>{if(e.pointerType!=='mouse'||reduceMotion||gesture?.active)return;const c=e.target.closest('.comic');if(hover&&hover!==c){hover.style.removeProperty('--mx');hover.style.removeProperty('--my');}hover=c;if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--mx',((e.clientX-r.left)/r.width-.5)*-12+'px');c.style.setProperty('--my',((e.clientY-r.top)/r.height-.5)*-8+'px');});rt.listen(grid,'pointerleave',()=>{if(hover){hover.style.removeProperty('--mx');hover.style.removeProperty('--my');hover=null;}});
root.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{filter=b.dataset.type;root.querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();});rt.listen(search,'input',render);root.querySelector('#featuredDetail').onclick=e=>detail(Number(e.currentTarget.dataset.index));root.querySelector('#searchJump').onclick=()=>{section.scrollIntoView();search.focus({preventScroll:true});};root.querySelector('#close').onclick=()=>dialog.close();rt.listen(dialog,'click',e=>{if(e.target===dialog){let r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
const navLinks=[...root.querySelectorAll('.nav a')];function navState(){if(!navLinks.length)return;const active=sectionTop-scrollY<innerHeight*.38?1:0;navLinks.forEach((a,i)=>{a.classList.toggle('active',i===active);if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
rt.listen(window,'scroll',()=>{sync();navState();},{passive:true});rt.listen(window,'resize',()=>{rt.cancelFrame(resizeFrame);resizeFrame=rt.frame(()=>layout());});rt.observer(ResizeObserver,()=>{sectionTop=section.getBoundingClientRect().top+scrollY;}).observe(root.querySelector('.hero'));render();navState();


return () => { rt.dispose(); root.querySelectorAll('.chip,#railPrev,#railNext,#railPrevPill,#featuredDetail,#searchJump,#close').forEach(el => el.onclick = null); if (dialog.open) dialog.close(); };
}
