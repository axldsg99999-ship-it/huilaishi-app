// Authored story rewards. Viewing is presentation only: never alters progress or money.
export const CHAPTER_CINEMATICS=Object.freeze({
 th:{id:'first-letter-th',chapter:0,art:'cinematics/first-letter-th-v1.png',title:['第一封信，终于抵达','จดหมายฉบับแรกมาถึงแล้ว'],pages:[
  ['停下来的风','ลมที่สงบลง','守信者收起翅膀。小艾没有追，它让开的木阶上，躺着一封被雨打湿的信。','ผู้พิทักษ์เก็บปีก Xiao Ai ไม่ได้ไล่ตาม บนขั้นไม้ที่มันว่างให้ มีจดหมายเปียกฝนอยู่ฉบับหนึ่ง'],
  ['熟悉的折角','มุมกระดาษที่คุ้นเคย','他认得那一针红线。以前她总嫌他把信折得太急，会把边角弄破。','เขาจำด้ายแดงเส้นนั้นได้ เธอเคยบ่นว่าเขาพับจดหมายรีบเกินไป จนมุมกระดาษขาด'],
  ['另一座城市','อีกเมืองหนึ่ง','同一刻，CHANINDA 手里的半封信暖了起来。她读到的不是完整句子，只是一声努力说清的问候。','ในเวลาเดียวกัน จดหมายครึ่งฉบับในมือ CHANINDA อุ่นขึ้น ไม่ใช่ประโยคยาว มีเพียงคำทักทายที่เขาพยายามพูดให้ชัด'],
  ['还有一句，想告诉你','ยังมีอีกคำที่อยากบอก','“我听见你了。”两个人仍隔着一座世界，但今晚，他们都知道下一封信该寄给谁。','“ฉันได้ยินเธอแล้ว” ทั้งสองยังอยู่คนละโลก แต่คืนนี้ต่างรู้ว่าจะส่งจดหมายฉบับต่อไปถึงใคร'],
 ]},
 cn:{id:'first-letter-cn',chapter:0,art:'cinematics/first-letter-cn-v1.png',title:['留给你的空位','ที่ว่างข้างฉัน'],pages:[
  ['台阶上的空位','ที่ว่างบนขั้นบันได','雨停了。CHANINDA 坐到书院门前，习惯地向旁边挪了一点，才记起身边没有人。','ฝนหยุดแล้ว CHANINDA นั่งหน้าสถาบัน ขยับเว้นที่ข้างตัวตามเคย ก่อนนึกได้ว่าตอนนี้ไม่มีใครอยู่ตรงนั้น'],
  ['不用说得很长','ไม่ต้องเป็นประโยคยาว','她看见信角熟悉的红线，终于笑了。这次不是为了让陌生人放心，是因为她自己安心了。','เมื่อเห็นด้ายแดงที่มุมจดหมาย เธอก็ยิ้มออก ครั้งนี้ไม่ได้ยิ้มให้คนแปลกหน้าสบายใจ แต่เพราะเธอสบายใจแล้วจริง ๆ'],
  ['一封慢慢写的回信','จดหมายตอบที่ค่อย ๆ เขียน','她把新学会的词念了一遍，再折好回信。写错的地方没有藏起来，她想让他知道自己也在努力。','เธออ่านคำที่เพิ่งเรียนซ้ำแล้วพับจดหมายตอบ ไม่ซ่อนรอยที่เขียนผิด เพราะอยากให้เขารู้ว่าเธอก็พยายามอยู่'],
  ['这次，换我找你','คราวนี้ ฉันจะตามหาเธอ','信离开指尖。河城的小艾抬起头，仿佛听见了那句熟悉的：“别走太快，等等我。”','จดหมายหลุดจากปลายนิ้ว Xiao Ai ในเมืองสายน้ำเงยหน้า ราวกับได้ยินคำคุ้นเคยว่า “อย่าเดินเร็วนัก รอฉันด้วย”'],
 ]},
});
export function cinematicUnlocked(save,world=save?.world,chapter=0){
 return !!save&&chapter===0&&['th','cn'].includes(world)&&[0,1,2].every(rank=>save.worlds?.[world]?.cleared?.includes(`${world}:0:${rank}`));
}
export function cinematicRewardAvailable(save,battle,reward){
 return !!(battle?.chapter===0&&reward?.firstClear&&reward.chapterComplete&&!battle.practice&&cinematicUnlocked(save,save?.world,battle.chapter));
}
export function createChapterCinematic({panel,definition,locale,asset,icon,onClose,motion=true}){
 let index=0,whole=false,disposed=false,token=0;const t=(zh,th)=>locale==='cn'?th:zh,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 panel.classList.add('chapter-cinematic');panel.dataset.motion=String(motion);
 const btn=(action,label,glyph)=>'<button data-cinema-action="'+action+'" aria-label="'+esc(label)+'">'+(glyph?icon(glyph):'')+'<span>'+esc(label)+'</span></button>';
 panel.innerHTML='<div class="cinema-art" aria-hidden="true"></div><header class="cinema-header"><div><small>'+t('章节插画 · 第一章','ภาพประจำบท · บทแรก')+'</small><h2 id="panel-title">'+esc(t(...definition.title))+'</h2></div>'+btn('close',t('返回游戏','กลับไปเล่น'),'close')+'</header><button class="cinema-next-area" data-cinema-action="next" aria-label="'+t('点击画面，继续故事','แตะภาพเพื่ออ่านต่อ')+'"></button><div class="cinema-loading" role="status">'+t('正在展开插画…','กำลังเปิดภาพ…')+'</div><section class="cinema-caption" aria-live="polite"><small></small><h3></h3><p></p></section><footer class="cinema-controls">'+btn('previous',t('上一幕','ก่อนหน้า'),'left')+btn('whole',t('展开漫画','ดูทั้งหน้า'),'book')+'<span class="cinema-count"></span>'+btn('next',t('下一幕','ต่อไป'),'right')+'</footer>';
 const art=panel.querySelector('.cinema-art'),caption=panel.querySelector('.cinema-caption');
 function render(){
  const page=definition.pages[index];panel.dataset.cinemaPage=String(index);panel.dataset.cinemaWhole=String(whole);
  art.style.backgroundPosition=(index%2?'100%':'0%')+' '+(index>1?'100%':'0%');
  caption.querySelector('small').textContent=t('未寄出的片段','ถ้อยคำระหว่างทาง');caption.querySelector('h3').textContent=t(page[0],page[1]);caption.querySelector('p').textContent=t(page[2],page[3]);
  panel.querySelector('.cinema-count').textContent=(index+1)+' / '+definition.pages.length;
  panel.querySelector('[data-cinema-action=previous]').disabled=index===0;
  const next=panel.querySelector('.cinema-controls [data-cinema-action=next]'),nextLabel=index===definition.pages.length-1?t('收进来信','เก็บในจดหมาย'):t('下一幕','ต่อไป');next.querySelector('span').textContent=nextLabel;next.setAttribute('aria-label',nextLabel);
  const toggle=panel.querySelector('[data-cinema-action=whole]'),label=whole?t('回到这一幕','กลับฉากนี้'):t('展开漫画','ดูทั้งหน้า');toggle.querySelector('span').textContent=label;toggle.setAttribute('aria-label',label);
 }
 function load(){
  const current=++token,img=new Image(),url=asset(definition.art);panel.dataset.cinemaReady='false';
  panel.querySelector('.cinema-loading').textContent=t('正在展开插画…','กำลังเปิดภาพ…');
  img.onload=()=>{if(disposed||current!==token)return;art.style.backgroundImage='url("'+img.src+'")';panel.dataset.cinemaReady='true';};
  img.onerror=()=>{if(disposed||current!==token)return;panel.querySelector('.cinema-loading').innerHTML=t('插画暂未加载，文字仍可阅读。','ภาพยังไม่พร้อม ยังอ่านข้อความได้')+btn('retry',t('重试插画','ลองโหลดภาพใหม่'),'replay');};
  // Failed image responses can remain in the in-memory browser cache. Retry the
  // actual request; do not keep redisplaying a cached failure or reload the app.
  img.src=current===1?url:url+(url.includes('?')?'&':'?')+'artRetry='+current;
 }
 function click(event){const b=event.target.closest('[data-cinema-action]');if(!b||b.disabled||disposed)return;event.stopPropagation();const a=b.dataset.cinemaAction;if(a==='close'){onClose();return;}if(a==='retry'){load();return;}if(a==='whole')whole=!whole;if(a==='previous'){whole=false;index=Math.max(0,index-1);}if(a==='next'){if(whole){whole=false;}else if(index===definition.pages.length-1){onClose();return;}else index++;}render();}
 panel.addEventListener('click',click);render();load();panel.querySelector('[data-cinema-action=close]').focus({preventScroll:true});
 return {dispose(){disposed=true;token++;panel.removeEventListener('click',click);}};
}
