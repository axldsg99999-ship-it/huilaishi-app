/* Presentation only: no damage or learning decisions. */
(function(root){
"use strict";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const zh=s=>s.dir==="zh-th";
const label=(s,a,b)=>zh(s)?a:b;
const W=()=>root.HUILAISHI_ROGUE_WORLD;
const btn=(a,t,x="")=>'<button type="button" class="rx-button" data-rx="'+a+'" '+x+'>'+esc(t)+'</button>';
const style=(s,id)=>({rush:label(s,"速攻","บุกเร็ว"),pierce:label(s,"破盾","เจาะโล่"),guard:label(s,"防守","ตั้งรับ")})[id]||label(s,"尚未记录","ยังไม่มี");
function icon(id){const p={rush:"M5 20L19 6M9 6h10v10",pierce:"M12 3L21 12 12 21 3 12Z M12 7v10M8 12h8",guard:"M5 5L12 3 19 5v8c0 4-7 8-7 8s-7-4-7-8Z M8 12l3 3 5-6"};return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="'+p[id]+'"/></svg>';}
function intent(s,i){
 if(i.cue==="mirror")return label(s,'模仿上一招：'+style(s,i.lastStyle)+'。换招答对可破招。','เลียนแบบ: '+style(s,i.lastStyle)+' เปลี่ยนท่าแล้วตอบถูกเพื่อแก้ทาง');
 if(i.cue==="seal")return label(s,'书壳封印 '+i.chain+'/2 · 连答两次，打开两次破绽机会。','ผนึกกระดอง '+i.chain+'/2 · ตอบถูกติดกันสองครั้ง เปิดช่องโจมตีสองครั้ง');
 if(i.cue==="satellites")return label(s,'莲灯护卫 '+i.guards+'/2 · 可先选护卫清除，再攻击本体。','โคมคุ้มกัน '+i.guards+'/2 · เลือกทำลายโคมก่อน แล้วโจมตีร่างหลัก');
 if(i.cue==="drum")return label(s,'铜铃节拍 '+i.beat+'/'+i.total+(i.weak==="guard"?' · 重击将至！防守答对可打断。':' · 正在蓄力，可以进攻。'),'จังหวะกระดิ่ง '+i.beat+'/'+i.total+(i.weak==="guard"?' · โจมตีหนัก! ตั้งรับและตอบถูกเพื่อหยุด':' · กำลังสะสมพลัง โจมตีได้'));
 return label(s,'破绽打开 · 答对追加 12 伤害，本次没有反击。','เปิดช่องโหว่ · ตอบถูกเพิ่มดาเมจ 12 ครั้งนี้ไม่สวนกลับ');
}
function phase(s){
 return s.state.run.enemy.special?.kind==="satellites"?label(s,"第二阶段 · 两盏护卫重新点亮，请重新选择目标。","ช่วงที่สอง · โคมคุ้มกันสองดวงกลับมา เลือกเป้าหมายใหม่"):label(s,"第二阶段 · 三拍变两拍，留意下一次重击。","ช่วงที่สอง · จากสามเป็นสองจังหวะ ระวังโจมตีหนัก");
}
function wardrobe(s){
 const o=root.XULONG_EXPEDITION_THEMES?.outfits[s.baseHero.id];if(o?.profile!==s.profile)return "";
 return '<section class="rx-wardrobe"><div><small>'+label(s,"本区服装 · 外观不影响属性","ชุดประจำพื้นที่ · ไม่เปลี่ยนค่าสถานะ")+'</small><h4>'+esc(zh(s)?o.zh:o.th)+'</h4><p>'+label(s,"八个配套姿势：待机、跑动、蓄力、出手、收招、受击、闪避、胜利。","แปดท่า: ยืน วิ่ง เตรียมโจมตี โจมตี คืนท่า รับการโจมตี หลบ ฉลอง")+'</p></div><div class="rx-wardrobe-actions">'+btn("wardrobe",label(s,"场景装","ชุดประจำพื้นที่"),'data-value="scene" aria-pressed="'+!s.classic+'"')+btn("wardrobe",label(s,"校园装","ชุดโรงเรียน"),'data-value="classic" aria-pressed="'+!!s.classic+'"')+btn("motion-preview",label(s,"看看动作","ดูท่าทาง"))+'</div></section>';
}
function bestiary(s){
 const p=W().profile(s.profile);if(!p?.direction)return "";
 return '<section class="rx-bestiary"><h4>'+label(s,"本区居民 · 精英与首领","ผู้อาศัยในพื้นที่ · ชั้นยอดและบอส")+'</h4><div>'+p.monsterIds.map(id=>{
 const m=W().enemy(id);return '<article><img src="'+esc(m.art)+'" alt="" loading="lazy" decoding="async"><div><small>'+label(s,m.boss?"BOSS · 两阶段":m.elite?"精英":"巡游怪",m.boss?"บอส · สองช่วง":m.elite?"ชั้นยอด":"มอนสเตอร์")+'</small><b>'+esc(zh(s)?m.titleZh||m.zh:m.titleTh||m.th)+'</b>'+(m.storyZh?'<details><summary>'+label(s,"它的故事","เรื่องราว")+'</summary><p>'+esc(zh(s)?m.storyZh:m.storyTh)+'</p></details>':'')+'</div></article>';
 }).join('')+'</div></section>';
}
function brief(s){
 const m=W().enemy(s.state.run.enemy.id);if(!m?.mechanic)return "";
 return '<aside class="rx-foe-brief"><h4>'+esc(zh(s)?m.titleZh:m.titleTh)+'</h4><p>'+esc(zh(s)?m.storyZh:m.storyTh)+'</p><b>'+esc(intent(s,root.HUILAISHI_ROGUE.intent(s.state.run)))+'</b></aside>';
}
function targets(s){
 const e=s.state.run.enemy.special;if(e?.kind!=="satellites")return "";
 return '<div class="rx-targets" role="group" aria-label="'+label(s,"攻击目标","เป้าหมายโจมตี")+'">'+btn("target",label(s,"莲灯护卫 ","โคมคุ้มกัน ")+e.guards,'data-value="guards" aria-pressed="'+(e.target==="guards")+'" '+(!e.guards?'disabled':''))+btn("target",label(s,"鳐鱼本体","ร่างหลัก"),'data-value="body" aria-pressed="'+(e.target==="body")+'"')+'</div>';
}
const messages={
"open-hit":["抓住破绽 · 追加 12 伤害","โจมตีช่องโหว่ · ดาเมจเพิ่ม 12"],
"mirrored":["被模仿了 · 这招伤害降低，下次换招","ถูกเลียนแบบ · ดาเมจลดลง ครั้งหน้าเปลี่ยนท่า"],
"outsmarted":["变招成功 · 追加 10 伤害","เปลี่ยนท่าสำเร็จ · ดาเมจเพิ่ม 10"],
"seal-open":["书壳打开！接下来两次可攻击破绽","กระดองเปิด! โจมตีช่องโหว่ได้สองครั้ง"],
"seal-charge":["封印松动 · 再答对一次可开壳","ผนึกเริ่มคลาย · ตอบถูกอีกครั้ง"],
"guard-cleared":["击落一盏护卫 · 本次没有伤到本体","ทำลายโคมหนึ่งดวง · ร่างหลักยังไม่เสียพลัง"],
"body-protected":["本体受护卫保护 · 伤害降低","โคมป้องกันร่างหลัก · ดาเมจลดลง"],
"interrupted":["防守打断！下一题出现破绽","หยุดการโจมตีแล้ว! ข้อต่อไปเปิดช่องโหว่"]};
function feedback(s){
 const f=s.state.run.feedback,m=W().enemy(s.state.run.enemy.id);
 return (f.mechanicNotes||[]).map(k=>'<p class="rx-mechanic-result" role="status">'+esc(messages[k]?.[zh(s)?0:1]||"")+'</p>').join('')+
 (f.defeated&&m?.clearZh?'<aside class="rx-story-clear"><small>'+label(s,"声页回响","เสียงจากหน้ากระดาษ")+'</small><p>'+esc(zh(s)?m.clearZh:m.clearTh)+'</p></aside>':'');
}
function journal(s){
 if(!W().profile(s.profile)?.direction)return "";
 const w=root.XULONG_EXPEDITION_THEMES.world;
 return '<details class="rx-world-journal"><summary>'+esc(zh(s)?w.titleZh:w.titleTh)+'</summary><p>'+esc(zh(s)?w.premiseZh:w.premiseTh)+'</p><p>'+esc(zh(s)?w.goalZh:w.goalTh)+'</p><p>'+esc(zh(s)?w.antagonistZh:w.antagonistTh)+'</p><small>'+esc(zh(s)?w.ruleZh:w.ruleTh)+'</small></details>';
}
function satellites(s){
 const guards=s.state.run.enemy.special?.guards||0;
 return guards?'<div class="rx-satellites" aria-hidden="true">'+Array.from({length:guards},()=>'<img src="./assets/game/thai-tide-ray-v125-satellite.webp" alt="">').join('')+'</div>':"";
}
function copy(s,c){
 const p=W().profile(s.lobby?s.profile:s.state.run?.profile);if(!p?.direction)return c;
 c.world=label(s,p.direction==="zh-th"?"小艾抵达莲潮港。CHANINDA 的留言散在夜市，先找回通往她的第一张声页。":"CHANINDA 醒在砚桥城。有人在书页中藏起了小艾的名字，循着钟声去找他。",p.direction==="zh-th"?"小艾มาถึงท่าเรือบัว ข้อความของ CHANINDA กระจายอยู่ในตลาด ตามหาหน้ากระดาษแผ่นแรกที่นำไปหาเธอ":"CHANINDA ตื่นในเมืองสะพานหมึก ชื่อ小艾ซ่อนอยู่ในหน้าหนังสือ ตามเสียงกระดิ่งไปหาเขา");
 c.defeated=label(s,"封锁解除 · 选择强化","คลายการปิดกั้น · เลือกพลังเสริม");
 c.map=label(s,p.direction==="zh-th"?"莲潮港航线":"砚桥城巡线","แผนเส้นทาง");
 c.rest=label(s,p.direction==="zh-th"?"河岸茶棚":"书摊小憩",p.direction==="zh-th"?"ร้านชาริมน้ำ":"พักที่ร้านหนังสือ");
 c.shop=label(s,p.direction==="zh-th"?"铃匠换物摊":"装订坊",p.direction==="zh-th"?"ร้านแลกของช่างกระดิ่ง":"โรงเย็บหนังสือ");
 c.event=label(s,p.direction==="zh-th"?"搁浅的留言纸船":"散落的寻人书签",p.direction==="zh-th"?"เรือกระดาษข้อความเกยตื้น":"ที่คั่นหนังสือตามหาคน");
 c.eventNote=label(s,"一张写着陌生字句的声页被困住了。你决定怎样取回它？","หน้ากระดาษเสียงที่มีข้อความไม่คุ้นเคยติดอยู่ จะเก็บกลับอย่างไร?");
 c.help=label(s,"耐心整理 · 恢复 12 生命，获得 10 纸币","ค่อย ๆ จัดเก็บ · ฟื้นชีวิต 12 รับ 10 เหรียญ");
 c.risk=label(s,"绕路取回 · 消耗 10 生命，选择一件强化","อ้อมไปเก็บ · เสียชีวิต 10 เลือกพลังเสริม");
 c.won=label(s,"声页抵达 · 离重逢又近一步","หน้ากระดาษส่งถึงแล้ว · ใกล้พบกันอีกก้าว");
 return c;
}
function cancel(s){
 for(const id of s.motionTimers||[])clearTimeout(id);s.motionTimers=[];s.motionId=(s.motionId||0)+1;
 s.stage?.querySelector('[data-rx="skip-motion"]')?.remove();
 const next=s.stage?.querySelector('[data-rx="next"]');if(next)next.disabled=false;
 s.stage?.querySelector('.rx-arena')?.classList.remove('rx-contact','rx-casting');
}
function preload(s){
 if(!["prepare","battle","feedback"].includes(s.state.run?.phase))return;
 const foe=W().enemy(s.state.run.enemy.id);
 for(const src of [...Object.values(s.hero.frames||{}),...Object.values(foe?.frames||{})]){
  if(s.preloaded.has(src))continue;s.preloaded.add(src);const img=new Image();img.decoding="async";img.src=src;
 }
}
function animate(s,preview=false){
 cancel(s);
 const reduced=root.matchMedia?.("(prefers-reduced-motion: reduce)").matches||document.documentElement.dataset.motionEffective==="reduced"||document.body.classList.contains("reduce-motion");
 if(reduced||document.hidden)return;
 const hero=s.stage.querySelector(preview?".rx-cover-hero":".rx-hero"),foe=s.stage.querySelector(".rx-foe"),arena=s.stage.querySelector(".rx-arena");
 if(!hero)return;
 const m=W().enemy(s.state.run?.enemy?.id),f=s.state.run?.feedback,token=s.motionId;
 if(!preview&&f?.correct)arena?.classList.add('rx-casting');
 const poses=preview?[["idle","idle",0],["run","idle",250],["windup","idle",500],["strike","hit",730],["recover","idle",920],["hit","strike",1200],["dodge","idle",1450],["victory","idle",1720],["idle","idle",2250]]:
  f.correct?[["windup","idle",0],["strike","hit",180],["strike","hit",270],["recover",f.defeated?"hit":"windup",420],[(f.defeated?"victory":f.counter?"hit":"dodge"),f.defeated?"hit":"strike",620],[(f.defeated?"victory":"idle"),f.defeated?"hit":"idle",940]]:
  [["idle","windup",0],["hit","strike",200],["hit","hit",360],["recover","idle",580],["idle","idle",820]];
 const next=s.stage.querySelector('[data-rx="next"]');if(next)next.disabled=true;
 if(arena)arena.insertAdjacentHTML("beforeend",btn("skip-motion",label(s,"跳过动作","ข้ามท่าทาง")));
 for(const [hp,ep,ms] of poses)s.motionTimers.push(setTimeout(()=>{
  if(token!==s.motionId||!hero.isConnected)return;
  hero.src=s.hero.frames?.[hp]||s.hero.art;
  hero.dataset.pose=hp;
  if(foe)foe.src=m?.frames?.[ep]||m?.art;
  if(foe)foe.dataset.pose=ep;
  if(ms===180||ms===200){arena?.classList.add("rx-contact");s.impact?.(f?.correct?"hit":"counter");}
 },ms));
 s.motionTimers.push(setTimeout(()=>{if(token===s.motionId)cancel(s);},poses.at(-1)[2]+80));
}
root.XULONG_EXPEDITION_PRESENTATION=Object.freeze({wardrobe,bestiary,intent,brief,targets,feedback,cancel,preload,animate,icon,phase,journal,satellites,copy});
})(globalThis);
