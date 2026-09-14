import {PETS,PET_OUTFITS,companionArt,petGrowth,petEvolution,petLearnedLines,adoptPet,feedPet,dressPet,evolvePet,completePetPlay} from './core.mjs?v=0.4.7';
import {LivingScene} from './living-scenes.mjs?v=0.4.7';

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const materialCopy={
 'cat-plum':['朱砂梅枝 · 棉布小褂','กิ่งเหมยสีชาด · เสื้อผ้าฝ้าย'],
 'cat-school':['藏青领结 · 放学后的信使','โบสีน้ำเงิน · ผู้ส่งสารหลังเลิกเรียน'],
 'cat-rain':['青瓷色披风 · 把细雨披在肩上','ผ้าคลุมสีหยก · รับสายฝนบนบ่า'],
 'squirrel-indigo':['靛蓝织纹 · 叶片小书签','ลายทอคราม · ที่คั่นใบไม้'],
 'squirrel-school':['茉莉色领口 · 校园里的新朋友','ปกสีมะลิ · เพื่อนใหม่ในโรงเรียน'],
 'squirrel-rain':['暖金织线 · 雨天也要出门','ด้ายสีทอง · พร้อมออกไปในวันฝนตก'],
};

// Preview state never reaches the save. All spending occurs on a named confirm action.
export function createCompanionRoom({panel,save,selected,atlas,asset,icon,lessons,speak,stopAudio,onChange,onClose,onJourney}){
 const t=(zh,th)=>save.world==='cn'?th:zh,name=o=>t(o.zh,o.th);
 let pet=PETS.find(p=>p.id===selected)||PETS[0],tab='care',preview=null,evolutionPreview=false;
 let disposed=false,generation=0,artToken=0,art=null,pose='idle',elapsed=0,last=performance.now(),raf=0,lastDraw=0;
 let busy=false,offering=false,game=null,receipt='',saved=true,lineIndex=0;
 let roomLife=null,roomTime=0;const roomResize=new ResizeObserver(()=>roomLife?.fit());roomResize.observe(panel);
 const timers=new Set(),media=matchMedia('(prefers-reduced-motion: reduce)');
 const owned=()=>save.companions.owned.includes(pet.id);
 const moving=()=>save.settings.motion&&!media.matches;
 const pause=()=>document.hidden||!document.hasFocus()||innerHeight>innerWidth;
 const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(!disposed)fn();},ms);timers.add(id);};
 const button=(action,label,glyph='',cls='',disabled=false)=>'<button type="button" data-room-action="'+action+'" aria-label="'+escape(label)+'" class="'+cls+'"'+(disabled?' disabled':'')+'>'+(glyph?icon(glyph):'')+'<span>'+escape(label)+'</span></button>';
 const status=text=>{const node=panel.querySelector('.pet-room-speech');if(node)node.textContent=text;};
 const moment=(kind,text)=>{pose=kind;elapsed=0;panel.dataset.moment=kind;if(text)status(text);draw();};
 const updateBalance=()=>{panel.querySelectorAll('[data-room-balance]').forEach(n=>n.textContent=save.points);};
 const record=(text,kind='cheer')=>{saved=onChange(kind)!==false;receipt=text;updateBalance();renderDetails();moment(kind,text);};
 function loadArt(){
  const token=++artToken,choice=companionArt(pet.row,preview,petEvolution(save,pet.id).evolved||evolutionPreview);
  const canvas=panel.querySelector('[data-pet-preview]');if(!canvas)return;
  canvas.dataset.artReady='false';canvas.dataset.outfit=preview||'original';canvas.dataset.form=evolutionPreview?'preview':petEvolution(save,pet.id).evolved?'evolved':'young';
  art=null;draw();
  atlas(choice.file).then(a=>{if(disposed||token!==artToken)return;art={atlas:a,row:choice.row};canvas.dataset.artReady='true';draw();}).catch(()=>{if(!disposed&&token===artToken)status(t('插画未加载，点“重试插画”。','ภาพยังไม่พร้อม แตะลองโหลดอีกครั้ง'));});
 }
 function draw(){
  const canvas=panel.querySelector('[data-pet-preview]');if(!canvas)return;
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,480,420);if(!art)return;
  const active=elapsed<1600,poseIndex=active?({idle:0,eat:1,support:2,cheer:3}[pose]||0):moving()&&elapsed%8000>6500?2:0;
  const frames=art.atlas.frames.slice(art.row*4,art.row*4+4),frame=frames[poseIndex];
  const scale=Math.min(360/Math.max(...frames.map(f=>f.w)),340/Math.max(...frames.map(f=>f.h)));
  const breath=moving()?Math.sin(elapsed/550)*1.3:0,lift=moving()&&active&&pose==='cheer'?Math.sin(elapsed/1600*Math.PI)*17:0;
  ctx.drawImage(art.atlas.canvas,frame.x,frame.y,frame.w,frame.h,240-frame.w*scale/2,398-frame.h*scale-breath-lift,frame.w*scale,frame.h*scale);
  canvas.dataset.pose=String(poseIndex);
 }
 function tick(now){
  if(disposed)return;
  if(!pause()){const dt=Math.min(100,now-last);elapsed+=dt;roomTime+=dt;roomLife?.draw(roomTime,moving());if(now-lastDraw>90){draw();lastDraw=now;}}
  last=now;raf=requestAnimationFrame(tick);
 }
 function render(){
  generation++;game=null;offering=false;busy=false;evolutionPreview=false;preview=save.companions.dressed[pet.id]||null;
  panel.classList.add('pet-room');panel.dataset.pet=pet.id;panel.dataset.roomTab=tab;
  roomLife?.destroy();
  panel.innerHTML='<div class="pet-room-backdrop"><img class="backdrop" src="'+escape(asset(save.world==='th'?'th-wardrobe.png':'cn-workshop.png'))+'" alt=""></div>'+
   '<header class="pet-room-header"><div><small>'+t('河岸小屋 / COMPANIONS','บ้านริมฝั่ง / COMPANIONS')+'</small><h2 id="panel-title">'+t('伙伴小屋','บ้านเพื่อนร่วมทาง')+'</h2></div><div class="pet-room-wallet">'+icon('coin')+'<span data-room-balance>'+save.points+'</span></div>'+button('close',t('返回旅途','กลับไปเดินทาง'),'close','pet-room-close')+'</header>'+
   '<section class="pet-room-stage" aria-label="'+t('和伙伴互动','เล่นกับเพื่อน')+'"><div class="pet-room-petnav" role="group" aria-label="'+t('选择伙伴','เลือกเพื่อน')+'">'+PETS.map(p=>'<button data-room-action="pet:'+p.id+'" aria-pressed="'+(p.id===pet.id)+'">'+escape(name(p))+'</button>').join('')+'</div>'+
   '<p class="pet-room-speech" role="status" aria-live="polite">'+t('把手伸过来，我认得你。','ยื่นมือมาสิ ฉันจำเธอได้')+'</p>'+
   '<button class="pet-room-actor" data-room-action="touch" aria-label="'+escape(t('摸摸','ลูบ ')+name(pet))+'"><canvas data-pet-preview width="480" height="420" role="img" aria-label="'+escape(name(pet))+'"></canvas></button>'+
   '<span class="pet-room-floor"></span><div class="pet-room-playfield"></div><div class="pet-room-stage-note"><b>'+escape(name(pet))+'</b><span data-room-wearing></span>'+button('reload',t('重试插画','ลองโหลดภาพใหม่'),'replay','pet-room-reload')+'</div></section>'+
   '<section class="pet-room-desk"><nav class="pet-room-tabs" aria-label="'+t('伙伴生活','ชีวิตของเพื่อน')+'">'+[['care','相伴','อยู่ด้วยกัน'],['closet','试衣铺','ลองชุด'],['growth','成长','เติบโต'],['words','小词袋','ถุงคำศัพท์']].map(([id,zh,th])=>'<button data-room-action="tab:'+id+'" aria-pressed="'+(tab===id)+'">'+t(zh,th)+'</button>').join('')+'</nav><div class="pet-room-details" tabindex="0"></div><footer class="pet-room-decision"></footer></section>';
  roomLife=new LivingScene(panel.querySelector('.pet-room-backdrop img'),{loadAtlas:atlas});loadArt();renderDetails();
 }
 function renderDetails(){
  if(disposed)return;
  const p=save.companions,g=petGrowth(p.growth[pet.id]),e=petEvolution(save,pet.id),body=panel.querySelector('.pet-room-details'),foot=panel.querySelector('.pet-room-decision');
  if(!body||!foot)return;panel.dataset.roomTab=tab;panel.dataset.preview=preview||'original';
  const active=document.activeElement,restoreFocus=body.contains(active)||foot.contains(active),focusedAction=restoreFocus?active?.dataset.roomAction:null,scrollTop=body.scrollTop;
  panel.querySelectorAll('.pet-room-tabs button').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.roomAction==='tab:'+tab)));
  const worn=PET_OUTFITS.find(o=>o.id===preview);
  panel.querySelector('[data-room-wearing]').textContent=evolutionPreview?t('未来形态 · 仅预览','ร่างในอนาคต · ตัวอย่าง'):preview!==(p.dressed[pet.id]||null)?t('试穿中 · 未扣币','กำลังลอง · ไม่หักเหรียญ'):worn?name(worn):t('原来的围巾','ผ้าพันคอเดิม');
  const notice=receipt?'<div class="pet-room-receipt" role="status">'+escape(receipt)+(saved?'':button('retry-save',t('未保存 · 重试保存','ยังไม่บันทึก · ลองอีกครั้ง'),'replay'))+'</div>':'';
  if(tab==='care'){
   body.innerHTML='<small class="room-eyebrow">'+t(owned()?'今天，想一起做什么？':'免费领养 · 随行伙伴',owned()?'วันนี้ทำอะไรด้วยกันดี?':'รับเพื่อนร่วมทางฟรี')+'</small><h3>'+escape(name(pet))+'</h3><p>'+escape(t(pet.storyZh,pet.storyTh))+'</p>'+
    '<div class="pet-room-bond"><span>'+t(['初识','熟悉','信赖','默契'][g.level-1],['แรกพบ','คุ้นเคย','เชื่อใจ','รู้ใจ'][g.level-1])+'</span><b>'+g.xp+' / 200</b><progress max="200" value="'+g.xp+'" aria-label="'+t('伙伴成长','การเติบโตของเพื่อน')+'"></progress></div>'+
    (owned()?'<p class="room-hint">'+t('点伙伴也能互动。找回3片叶子；每章首次完成 +6成长。离线不会挨饿。','แตะตัวเพื่อนเพื่อเล่น หาใบไม้ 3 ใบ ครั้งแรกในแต่ละบทเติบโต +6 ออฟไลน์ไม่หิว')+'</p>'+button(p.active===pet.id?'rest':'adopt',p.active===pet.id?t('让它在小屋休息','ให้พักที่บ้าน'):t('带它一起出发','พาไปด้วยกัน'),'leaf','',busy):'<p class="room-hint">'+t('免费成为伙伴。不会因为你没上线而离开。','รับเป็นเพื่อนฟรี ไม่หนีไปเมื่อคุณไม่ได้เข้าเกม')+'</p>')+notice;
   foot.innerHTML=offering?'<p>'+t('一份点心：12纸币，成长 +20（上限200）。','ขนม 12 เหรียญ เติบโต +20 (สูงสุด 200)')+'</p><div>'+button('feed',t('递给它 · 12纸币','ส่งขนมให้ · 12 เหรียญ'),'gift','room-primary',busy||save.points<12)+button('cancel',t('先不喂','ไว้ก่อน'))+'</div>':game?'<p>'+t('书签 '+game.count+'/3 · 点场景里的叶片','ที่คั่น '+game.count+'/3 · แตะใบไม้ในฉาก')+'</p>'+button('cancel',t('结束玩耍','หยุดเล่น')):owned()?'<div class="pet-room-care-actions">'+button('pat',t('摸摸头','ลูบหัว'),'leaf','',busy)+button('offer',t('给点心 · 12','ให้ขนม · 12'),'gift','',busy||g.next===null)+button('play',t('找回书签','ตามหาที่คั่น'),'book','',busy)+'</div>':button('adopt',t('和它成为伙伴 · 免费','รับเป็นเพื่อน · ฟรี'),'leaf','room-primary',busy);
  }else if(tab==='closet'){
   const offers=[{id:'original',zh:'原来的围巾',th:'ผ้าพันคอเดิม',cost:0},...PET_OUTFITS.filter(o=>o.pet===pet.id)];
   body.innerHTML='<small class="room-eyebrow">'+t('试穿不扣币 · 喜欢再带走','ลองฟรี · ชอบแล้วค่อยแลก')+'</small><h3>'+t('伙伴试衣铺','ร้านลองชุดของเพื่อน')+'</h3><div class="pet-room-outfits">'+offers.map(o=>'<button data-room-action="try:'+o.id+'" aria-pressed="'+((preview||'original')===o.id)+'"><canvas width="160" height="150" data-room-thumb="'+o.id+'" aria-hidden="true"></canvas><b>'+escape(name(o))+'</b><small>'+((p.dressed[pet.id]||'original')===o.id?t('正在穿','สวมอยู่'):o.id==='original'||p.clothes.includes(o.id)?t('已拥有','มีแล้ว'):o.cost+' '+t('纸币','เหรียญ'))+'</small></button>').join('')+'</div><p class="room-material">'+(materialCopy[preview]?t(...materialCopy[preview]):t('柔软的旧围巾，记得第一次相遇。','ผ้าพันคอเก่านุ่ม ๆ จำวันที่พบกันครั้งแรก'))+'</p><p class="room-hint">'+t('只换外观，不卖战力；进化后仍可穿。','เปลี่ยนแค่รูปลักษณ์ ไม่เพิ่มพลัง วิวัฒนาการแล้วก็ยังสวมได้')+'</p>'+notice;
   const own=!preview||p.clothes.includes(preview),cost=own?0:worn.cost,wearing=(p.dressed[pet.id]||null)===preview;
   foot.innerHTML='<p>'+(!owned()?t('先和它成为伙伴，再带走衣服。','รับเป็นเพื่อนก่อน แล้วค่อยแลกชุด'):wearing?t('这就是它现在的样子。','นี่คือชุดที่สวมอยู่ตอนนี้'):t('可用 '+save.points+' → 兑换后 '+Math.max(0,save.points-cost),'มี '+save.points+' → หลังแลก '+Math.max(0,save.points-cost)))+'</p>'+button('wear',!owned()?t('尚未领养','ยังไม่ได้รับเป็นเพื่อน'):wearing?t('正在穿着','กำลังสวม'):save.points<cost?t('还差 '+(cost-save.points)+' 纸币','ขาดอีก '+(cost-save.points)+' เหรียญ'):own?t('穿上这套','สวมชุดนี้'):t('兑换并穿上 · '+cost,'แลกแล้วสวม · '+cost),'shirt','room-primary',busy||!owned()||wearing||save.points<cost);
   thumbnails();
  }else if(tab==='growth'){
   body.innerHTML='<small class="room-eyebrow">'+t('一起长大','เติบโตด้วยกัน')+'</small><h3>'+t(pet.id==='letter-cat'?'云笺灵猫':'听风灵松',pet.id==='letter-cat'?'แมวเมฆส่งสาร':'กระรอกฟังลม')+'</h3><p>'+t('认真记住的话，会成为它身上的新纹样。','คำที่เรียนรู้ด้วยกันจะกลายเป็นลวดลายใหม่บนตัวเพื่อน')+'</p><div class="pet-room-milestones"><label>'+t('相伴成长','เติบโตด้วยกัน')+'<b>'+Math.min(100,g.xp)+'/100</b><progress max="100" value="'+g.xp+'"></progress></label><label>'+t('20个词，各独立答对2次','20 คำ ตอบถูกเองคำละ 2 ครั้ง')+'<b>'+Math.min(20,e.learned)+'/20</b><progress max="20" value="'+e.learned+'"></progress></label></div>'+button('future',evolutionPreview?t('看看现在的它','ดูร่างปัจจุบัน'):t('看看未来的它','ดูร่างในอนาคต'),'leaf')+button('demo',t('看看助战动作','ดูท่าช่วยต่อสู้'),'sword')+'<p class="room-hint">'+t('连续独立答对3次，每场主动助战一次：','ตอบถูกเองติดต่อกัน 3 ครั้ง กดช่วยได้หนึ่งครั้งต่อการต่อสู้: ')+(pet.skill==='shield'?t('抵挡 '+(g.shield+(e.evolved?1:0))+' 点伤害。','ป้องกัน '+(g.shield+(e.evolved?1:0))+' หน่วย'):t('答题增加 '+(g.seconds+(e.evolved?1:0))+' 秒。','เพิ่มเวลาตอบ '+(g.seconds+(e.evolved?1:0))+' วินาที'))+'</p>'+notice;
   foot.innerHTML=button(e.canEvolve?'evolve':'journey',e.evolved?t('和它继续旅途','เดินทางต่อด้วยกัน'):e.canEvolve?t('一起进化 · 免费','วิวัฒนาการด้วยกัน · ฟรี'):t('去旅途中学会更多','ไปเรียนรู้ระหว่างทาง'),e.canEvolve?'leaf':'arrow','room-primary',busy);
  }else{
   const known=petLearnedLines(save,pet.id,lessons),unit=known[lineIndex%Math.max(1,known.length)];
   body.innerHTML='<small class="room-eyebrow">'+t('它也记住了你走过的路','เพื่อนก็จำเส้นทางที่เธอผ่านมา')+'</small><h3>'+t('口袋里的小小声音','เสียงเล็ก ๆ ในกระเป๋า')+'</h3>'+(unit?'<p class="pet-room-word" lang="'+(save.world==='th'?'th':'zh')+'">'+escape(save.world==='th'?unit.th:unit.zh)+'</p><p>'+escape(save.world==='th'?unit.zh:unit.th)+'</p>'+button('say',t('听它念一遍','ฟังเพื่อนอ่าน'),'paper-sound')+button('next-word',t('再翻一张','ดูอีกคำ'),'right'):'<p>'+t('先一起完成一场旅途。你学会的词，会慢慢装进它的小口袋。','เดินทางด้วยกันหนึ่งด่านก่อน คำที่เรียนรู้จะค่อย ๆ มาอยู่ในกระเป๋าเพื่อน')+'</p>')+'<p class="room-hint">'+t('只出现已通关并答对过的词。使用课程示范音，不是宠物专属配音。','แสดงเฉพาะคำที่ผ่านด่านและตอบถูกแล้ว ใช้เสียงตัวอย่างจากบทเรียน ไม่ใช่เสียงพากย์เฉพาะเพื่อน')+'</p>'+notice;
   foot.innerHTML=button('journey',t('带它继续冒险','พาไปผจญภัยต่อ'),'arrow','room-primary');
  }
  body.scrollTop=scrollTop;
  if(restoreFocus){
   const replacement=[...panel.querySelectorAll('[data-room-action]')].find(n=>n.dataset.roomAction===focusedAction&&!n.disabled);
   (replacement||body).focus({preventScroll:true});
  }
 }
 function thumbnails(){
  const token=generation;
  panel.querySelectorAll('[data-room-thumb]').forEach(canvas=>{
   const id=canvas.dataset.roomThumb,choice=companionArt(pet.row,id==='original'?null:id,petEvolution(save,pet.id).evolved);
   atlas(choice.file).then(a=>{if(disposed||token!==generation||!canvas.isConnected)return;const f=a.frames[choice.row*4],scale=Math.min(132/f.w,140/f.h),ctx=canvas.getContext('2d');ctx.clearRect(0,0,160,150);ctx.drawImage(a.canvas,f.x,f.y,f.w,f.h,(160-f.w*scale)/2,148-f.h*scale,f.w*scale,f.h*scale);canvas.dataset.artReady='true';}).catch(()=>{if(canvas.isConnected)canvas.setAttribute('aria-label',t('预览暂不可用','ภาพตัวอย่างยังไม่พร้อม'));});
  });
 }
 function cancelActivity(){offering=false;game=null;busy=false;panel.querySelector('.pet-room-playfield').replaceChildren();}
 function leaf(){
  const field=panel.querySelector('.pet-room-playfield');field.innerHTML=button('catch',t('捡起叶片书签','เก็บที่คั่นใบไม้'),'leaf','pet-room-leaf');
  const target=field.firstElementChild,positions=[[17,63],[76,42],[62,72]],point=positions[game.count];target.style.left=point[0]+'%';target.style.top=point[1]+'%';
 }
 function lockBriefly(){busy=true;renderDetails();const token=generation;later(()=>{if(token!==generation)return;busy=false;renderDetails();},1600);}
 async function click(event){
  const control=event.target.closest('[data-room-action]');if(!control||control.disabled||disposed)return;
  event.stopPropagation();const [action,id]=control.dataset.roomAction.split(':');
  if(action==='close'){onClose();return;}
  if(action==='retry-save'){saved=onChange('idle')!==false;renderDetails();return;}
  if(action==='reload'){loadArt();return;}
  if(action==='cancel'){cancelActivity();renderDetails();status(t('没关系，我在这里等你。','ไม่เป็นไร ฉันรออยู่ตรงนี้'));return;}
  if(busy&&['feed','wear','evolve','adopt','rest','offer','play','touch','pat','pet','tab','try'].includes(action))return;
  if(action==='pet'){stopAudio();pet=PETS.find(p=>p.id===id)||pet;receipt='';tab='care';render();return;}
  if(action==='tab'){stopAudio();cancelActivity();tab=['care','closet','growth','words'].includes(id)?id:'care';evolutionPreview=false;preview=save.companions.dressed[pet.id]||null;renderDetails();loadArt();return;}
  if(action==='pat'||action==='touch'){moment('cheer',t(['蹭蹭你的手，再靠近一点。','耳朵竖起来啦，是你！','这一声呼噜，留给你。'][lineIndex++%3],['ขอซบมือเธอ ใกล้อีกนิดนะ','หูตั้งแล้ว เธอนี่เอง!','เสียงครางเบา ๆ นี้ ให้เธอเลย'][lineIndex%3]));return;}
  if(action==='adopt'){const fresh=!owned();if(adoptPet(save,pet.id).ok){record(fresh?t('从今天起，我们一起走。免费领养成功。','ตั้งแต่วันนี้ ไปด้วยกันนะ รับเป็นเพื่อนแล้ว ฟรี'):t('已经跟上你啦。','ตามเธอไปแล้ว'));lockBriefly();}return;}
  if(action==='rest'){if(save.companions.active===pet.id){save.companions.active=null;record(t('在小屋休息，不会掉成长。','พักที่บ้าน ไม่เสียการเติบโต'),'idle');}return;}
  if(action==='offer'){if(!owned())return;offering=true;game=null;renderDetails();moment('support',t('闻到点心的味道了……','ได้กลิ่นขนมแล้ว…'));return;}
  if(action==='feed'){
   if(!offering)return;const result=feedPet(save,pet.id);offering=false;
   if(result.ok){record(t('吃光啦！成长 +'+(result.after.xp-result.before.xp)+' · 纸币 −12','กินหมดแล้ว! เติบโต +'+(result.after.xp-result.before.xp)+' · เหรียญ −12'),'eat');lockBriefly();}
   else{renderDetails();status(t('纸币不足，或成长已满。这次没有扣币。','เหรียญไม่พอ หรือเติบโตเต็มแล้ว ไม่หักเหรียญ'));}return;
  }
  if(action==='play'){
   if(!owned())return;offering=false;game={count:0};renderDetails();leaf();moment('support',t('风把书签吹跑啦，帮我找3片！','ลมพัดที่คั่นไปแล้ว ช่วยหา 3 ใบหน่อย!'));return;
  }
  if(action==='catch'){
   if(!game)return;game.count++;moment('cheer',t('接住啦！'+game.count+'/3','รับได้แล้ว! '+game.count+'/3'));
   if(game.count<3){leaf();renderDetails();}else{const result=completePetPlay(save,pet.id);cancelActivity();record(t('书签找齐了！'+(result.growth?'成长 +'+result.growth:'这次一起玩，不重复领取成长。'),'ได้ที่คั่นครบแล้ว! '+(result.growth?'เติบโต +'+result.growth:'เล่นด้วยกัน ไม่รับการเติบโตซ้ำ')));lockBriefly();}return;
  }
  if(action==='try'){const item=PET_OUTFITS.find(o=>o.id===id&&o.pet===pet.id);if(id!=='original'&&!item)return;preview=item?.id||null;renderDetails();loadArt();moment('support',t('先试试看，喜欢再带走。','ลองดูก่อน ชอบแล้วค่อยแลกนะ'));return;}
  if(action==='wear'){
   if(!owned())return;const before=save.points;
   if(preview){if(!dressPet(save,preview).ok){status(t('纸币不足，没有扣币。','เหรียญไม่พอ ไม่หักเหรียญ'));return;}}
   else save.companions.dressed[pet.id]=null;
   record(t('穿好啦！'+(before>save.points?'纸币 −'+(before-save.points):'已拥有，不扣币。'),'สวมแล้ว! '+(before>save.points?'เหรียญ −'+(before-save.points):'มีอยู่แล้ว ไม่หักเหรียญ')));loadArt();lockBriefly();return;
  }
  if(action==='future'){evolutionPreview=!evolutionPreview;renderDetails();loadArt();status(t(evolutionPreview?'未来的样子，先偷偷看一眼。':'我还是你熟悉的那个小家伙。',evolutionPreview?'แอบดูร่างในอนาคตกันก่อน':'ยังเป็นเพื่อนตัวน้อยที่เธอรู้จัก'));return;}
  if(action==='evolve'){if(evolvePet(save,pet.id).ok){evolutionPreview=false;record(t('长大了，也还是最初的我们。','เติบโตแล้ว แต่ยังเป็นเราเหมือนเดิม'));loadArt();lockBriefly();}return;}
  if(action==='demo'){moment('support',t('助战动作预览 · 不消耗次数。','ตัวอย่างท่าช่วย · ไม่ใช้สิทธิ์'));return;}
  if(action==='next-word'){lineIndex++;stopAudio();renderDetails();moment('support');return;}
  if(action==='say'){
   const known=petLearnedLines(save,pet.id,lessons),unit=known[lineIndex%Math.max(1,known.length)];if(!unit)return;
   const token=generation;moment('support',t('这一句，我记住了。','ประโยคนี้ ฉันจำได้แล้ว'));
   const ok=await speak(save.world==='th'?unit.th:unit.zh,save.world==='th'?'th':'zh',{rate:save.settings.speechRate});
   if(!disposed&&token===generation&&!ok)status(t('声音暂不可用，文字仍可阅读。','เสียงยังไม่พร้อม ยังอ่านข้อความได้'));return;
  }
  if(action==='journey'){onClose();onJourney();}
 }
 const stop=()=>{stopAudio();};
 panel.addEventListener('click',click);window.addEventListener('blur',stop);document.addEventListener('visibilitychange',stop);
 render();raf=requestAnimationFrame(tick);
 return {dispose(){disposed=true;roomLife?.destroy();roomResize.disconnect();generation++;artToken++;cancelAnimationFrame(raf);timers.forEach(clearTimeout);timers.clear();stopAudio();panel.removeEventListener('click',click);window.removeEventListener('blur',stop);document.removeEventListener('visibilitychange',stop);}};
}
