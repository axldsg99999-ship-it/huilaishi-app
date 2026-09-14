import {tracePanels,TRACE_STORIES} from './trace-story.mjs?v=0.4.8';
import {HEROES,CHAPTERS,ASSET} from './content.mjs?v=0.4.8';
// Four static panels composed from the actual painted game cast. These are
// in-engine memory illustrations, not four newly commissioned CG paintings.
export function createTraceComic({panel,world,chapter,monster,nextName,atlas,icon,onClose,motion=true}){
 let disposed=false,generation=0;const t=(a,b)=>world==='cn'?b:a,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const pages=tracePanels(world,chapter,monster.id,nextName),story=TRACE_STORIES[monster.id],scene=CHAPTERS[chapter][world==='th'?'thScene':'cnScene'];
 panel.className='atelier-panel trace-comic';panel.dataset.motion=String(motion);panel.dataset.zoom='';
 panel.innerHTML='<header class="trace-header"><div><small>'+t('对方留下的痕迹 · '+monster.zh,'ร่องรอยของคนรัก · '+monster.th)+'</small><h2 id="panel-title">'+esc(t(...story.clue))+'</h2></div><button data-trace-action="close" aria-label="'+t('收好，继续旅途','เก็บไว้แล้วเดินทางต่อ')+'">'+icon('close')+'</button></header><section class="trace-page">'+pages.map((p,i)=>'<button class="trace-frame" data-trace-action="zoom" data-index="'+i+'" aria-label="'+esc(t(...p.time)+': '+t(...p.text))+'"><span class="trace-art"><canvas width="640" height="380" aria-hidden="true"></canvas><span class="trace-art-state">'+t('展开记忆…','กำลังเปิดความทรงจำ…')+'</span></span><span class="trace-copy"><small>0'+(i+1)+' · '+esc(t(...p.time))+'</small><span>'+esc(t(...p.text))+'</span></span></button>').join('')+'</section><footer class="trace-footer"><span>'+t('一页记忆 · 点画格可放大','หนึ่งหน้าความทรงจำ · แตะช่องเพื่อขยาย')+'</span><button data-trace-action="unzoom" hidden>'+t('回到整页','กลับทั้งหน้า')+'</button><button data-trace-action="retry" hidden>'+t('重试插画','ลองโหลดภาพใหม่')+'</button><button data-trace-action="close">'+icon('book')+t('收进痕迹手册','เก็บในสมุดร่องรอย')+'</button></footer>';
 const canvases=[...panel.querySelectorAll('canvas')];
 function actor(ctx,a,frame,x,ground,height){const f=a.frames[Math.min(frame,a.frames.length-1)];if(!f)return;const s=height/f.h;ctx.drawImage(a.canvas,f.x,f.y,f.w,f.h,x-f.w*s/2,ground-height,f.w*s,height);}
 async function load(){const current=++generation;panel.querySelector('[data-trace-action=retry]').hidden=true;
  try{const bg=new Image();bg.src=ASSET(scene);await bg.decode();const [hero,partner,enemy]=await Promise.all([atlas(HEROES[world].sheet),atlas(HEROES[world==='th'?'cn':'th'].sheet),atlas(monster.sheet)]);if(disposed||current!==generation)return;
   canvases.forEach((canvas,i)=>{const ctx=canvas.getContext('2d');ctx.clearRect(0,0,640,380);const s=Math.max(640/bg.width,380/bg.height);ctx.drawImage(bg,(640-bg.width*s)/2,(380-bg.height*s)/2,bg.width*s,bg.height*s);ctx.fillStyle=i<2?'#e4c99529':'#11352618';ctx.fillRect(0,0,640,380);
    if(i===0){actor(ctx,partner,12,210,369,260);actor(ctx,enemy,0,466,366,245);}if(i===1)actor(ctx,enemy,monster.poseCount===16?13:0,340,408,355);if(i===2){actor(ctx,hero,11,208,369,262);actor(ctx,enemy,monster.poseCount===16?14:0,466,366,245);}if(i===3)actor(ctx,hero,13,310,405,340);
    canvas.dataset.artReady='true';canvas.nextElementSibling.hidden=true;
   });
  }catch{if(disposed||current!==generation)return;panel.querySelectorAll('.trace-art-state').forEach(n=>n.textContent=t('插画暂不可用，故事仍可阅读','ภาพยังไม่พร้อม ยังอ่านเรื่องได้'));panel.querySelector('[data-trace-action=retry]').hidden=false;}
 }
 function click(e){const n=e.target.closest('[data-trace-action]');if(!n||disposed)return;e.stopPropagation();const a=n.dataset.traceAction;if(a==='close')onClose();if(a==='retry')load();if(a==='zoom'){panel.dataset.zoom=panel.dataset.zoom===n.dataset.index?'':n.dataset.index;panel.querySelector('[data-trace-action=unzoom]').hidden=panel.dataset.zoom==='';}if(a==='unzoom'){panel.dataset.zoom='';n.hidden=true;panel.querySelector('.trace-frame').focus();}}
 panel.addEventListener('click',click);load();panel.querySelector('[data-trace-action=close]').focus({preventScroll:true});
 return {dispose(){disposed=true;generation++;panel.removeEventListener('click',click);canvases.forEach(c=>{c.width=c.height=0;});}};
}
