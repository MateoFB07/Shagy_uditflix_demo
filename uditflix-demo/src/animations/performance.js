import { createRuntime } from './runtime.js';
/** Optional development HUD. FPS measures browser callbacks, not GPU presentation. */
export function mountPerformance(root) {
  if (new URLSearchParams(location.search).get('perf') !== '1') return () => {};
  const rt=createRuntime(), hud=document.createElement('output');
  hud.setAttribute('aria-label','Diagnóstico de rendimiento');
  hud.style.cssText='position:fixed;z-index:1000;top:8px;left:8px;padding:7px 10px;background:#151415ed;color:#f1ede5;font:11px/1.5 monospace;white-space:pre;border:1px solid #ffffff40;border-radius:5px;pointer-events:none;';
  root.append(hud);let start=0,count=0,longTasks=0,observer;
  if(window.PerformanceObserver?.supportedEntryTypes?.includes('longtask')){observer=new PerformanceObserver(list=>{longTasks+=list.getEntries().length;});observer.observe({type:'longtask'});}
  function frame(now){if(!start){start=now;count=0;}count++;const elapsed=now-start;if(elapsed>=1000){const renderer=id=>root.querySelector(id)?.dataset.renderer||'n/d';hud.textContent=`FPS (rAF): ${Math.round(count*1000/elapsed)}\nCinta: ${renderer('#ribbon')} · Humo: ${renderer('#udSmoke')}\nTareas largas: ${longTasks}`;start=now;count=0;longTasks=0;}rt.frame(frame);}
  rt.listen(document,'visibilitychange',()=>{start=0;count=0;longTasks=0;});rt.frame(frame);
  return ()=>{rt.dispose();observer?.disconnect();hud.remove();};
}
