import { createRuntime } from './runtime.js';

export function mountNavigation(root) {
const rt = createRuntime();
const buttons=[...root.querySelectorAll('.seq-format')],chips=[...root.querySelectorAll('.chip')],search=root.querySelector('#search'),catalog=root.querySelector('#explorar');const update=()=>{let active=chips.find(c=>c.getAttribute('aria-pressed')==='true');buttons.forEach(b=>{if(active&&active.dataset.type===b.dataset.format)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')})};buttons.forEach(b=>rt.listen(b,'click',()=>{if(search.value){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}chips.find(c=>c.dataset.type===b.dataset.format)?.click();catalog.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});update()}));rt.observer(MutationObserver,update).observe(root.querySelector('.chips'),{subtree:true,attributes:true,attributeFilter:['aria-pressed']});update()
return () => { rt.dispose();  };
}
