// Stable, scene-space thought trails. Decorative only: never move hit targets.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function thoughtSeeds(head,box,obstacles=[]){
 if(![head.x,head.y,box.x,box.y,box.w,box.h].every(Number.isFinite)||box.w<1||box.h<1)return [];
 const target={x:clamp(head.x,box.x+box.w*.15,box.x+box.w*.85),y:clamp(head.y,box.y+box.h*.13,box.y+box.h*.87)};
 // Finish outside the paper, not under its opaque centre. Even the short
 // head-to-cloud gap then retains two distinct thought marks.
 if(head.x<box.x)target.x=box.x-7;else if(head.x>box.x+box.w)target.x=box.x+box.w+7;
 if(head.y<box.y)target.y=box.y-7;else if(head.y>box.y+box.h)target.y=box.y+box.h+7;
 const dx=target.x-head.x,dy=target.y-head.y,d=Math.hypot(dx,dy);
 if(d<18)return [];
 const start={x:head.x+dx/d*9,y:head.y+dy/d*9};
 const bend=Math.min(19,d*.13),count=d>95?4:d>44?3:2;
 const control={x:(start.x+target.x)/2,y:(start.y+target.y)/2-bend};
 return Array.from({length:count},(_,i)=>{
  const t=(i+.35)/(count+.1),q=1-t,r=2.5+i*1.4;
  return {x:q*q*start.x+2*q*t*control.x+t*t*target.x,y:q*q*start.y+2*q*t*control.y+t*t*target.y,r,angle:(i%2?-13:18),delay:i*55};
 }).filter(p=>!obstacles.some(b=>p.x+p.r>b.x&&p.x-p.r<b.x+b.w&&p.y+p.r>b.y&&p.y-p.r<b.y+b.h));
}

export function sceneHeads(scene){
 const w=scene.clientWidth,h=scene.clientHeight,canvas=scene.querySelector('.actors'),style=getComputedStyle(scene);
 const sx=w/(Number(canvas?.dataset.anchorWidth)||w),sy=h/(Number(canvas?.dataset.anchorHeight)||h);
 const val=(key,fallback,scale)=>{const n=parseFloat(style.getPropertyValue(key));return Number.isFinite(n)?n*scale:fallback;};
 return {hero:{x:val('--hero-center-x',w*.25,sx),y:val('--hero-crown-y',h*.48,sy)},enemy:{x:val('--enemy-center-x',w*.78,sx),y:val('--enemy-crown-y',h*.44,sy)}};
}

export function syncThoughtOrigins(scene){
 let layer=scene.querySelector('.thought-origins');
 if(!layer){layer=document.createElement('div');layer.className='thought-origins';layer.setAttribute('aria-hidden','true');scene.append(layer);}
 if(scene.clientWidth<=scene.clientHeight||['resolving','ended'].includes(scene.dataset.exchange)||scene.dataset.reply==='shown'){
  layer.replaceChildren();delete layer.dataset.layout;return;
 }
 const bounds=scene.getBoundingClientRect(),heads=sceneHeads(scene);
 const visible=node=>{
  if(!node||!node.getClientRects().length)return false;
  for(let p=node;p&&p!==scene;p=p.parentElement){const s=getComputedStyle(p);if(s.visibility==='hidden'||s.display==='none'||Number(s.opacity)<.1)return false;}
  return true;
 };
 const rect=n=>{const r=n.getBoundingClientRect();return {x:r.left-bounds.left,y:r.top-bounds.top,w:r.width,h:r.height};};
 const hero=[];
 if(scene.dataset.choiceOrbit==='true')hero.push(...scene.querySelectorAll('.actor-thought'));
 if(scene.dataset.connectionSeal!=='true'&&scene.dataset.longPairs!=='true')hero.push(...scene.querySelectorAll('.connection-column[data-owner=hero] .connection-item'));
 const resident=[...scene.querySelectorAll('.connection-column[data-owner=enemy] .connection-item')];
 if(!resident.some(visible))resident.push(scene.querySelector('#question-bubble'));
 const entries=[...new Set(hero)].filter(visible).map(n=>({owner:'hero',box:rect(n)}))
  .concat(resident.filter(visible).map(n=>({owner:'enemy',box:rect(n)})));
 const blockers=entries.map(e=>e.box).concat([...scene.querySelectorAll('.battle-hud,.bottom-bar')].filter(visible).map(rect));
 const seeds=entries.flatMap(({owner,box})=>{
  const h=heads[owner],towards=box.x+box.w/2<h.x?-1:1;
  const head={x:h.x+towards*(owner==='enemy'?18:8),y:h.y+(owner==='enemy'?16:10)};
  return thoughtSeeds(head,box,blockers).map(p=>({...p,owner}));
 });
 const key=JSON.stringify(seeds);
 if(layer.dataset.layout===key)return;
 layer.dataset.layout=key;
 const fragment=document.createDocumentFragment();
 seeds.forEach(p=>{const node=document.createElement('i');node.className='thought-seed';node.dataset.owner=p.owner;
  node.style.cssText=`left:${p.x-p.r}px;top:${p.y-p.r}px;width:${p.r*2}px;height:${p.r*1.65}px;--seed-angle:${p.angle}deg;--seed-delay:${p.delay}ms;`;
  fragment.append(node);
 });
 layer.replaceChildren(fragment);
}
