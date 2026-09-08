/* Scene-first chapter and notebook. All effects/voices begin with a gesture. */
(function (root) {
  'use strict';
  const M=root.XULONG_WORLD;
  if(!M)return;
  let host,dir,state,view,mode='home',task=null,replay=false,heard=false,assisted=false,settled=false,stroke=0,ink=[],drawing=false,pointId=null,epoch=0,audioTimer=0,busy=false;
  let wardrobeHero='chinese',wardrobeSelection='',wardrobeConfirm=false,wardrobeMessage='',wardrobeReturn='home',wardrobeTimer=0;
  const wardrobe=()=>root.XULONG_CAMPUS_REWARDS;
  const q=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const zh=()=>dir==='zh-th', t=(a,b)=>zh()?a:b, copy=a=>a[zh()?0:1];
  const asset=src=>root.HUILAISHI_NATIVE_LIGHTWEIGHT?'':(root.XULONG_WORLD_ART?.[src]||src);
  const target=w=>zh()?w.th:w.zh, meaning=w=>zh()?w.zh:w.th;
  const b=(action,label,extra='',cls='')=>`<button type="button" class="wj-button ${cls}" data-wj="${action}" ${extra}>${label}</button>`;
  const icon=(id)=>`<svg aria-hidden="true" viewBox="0 0 24 24">${id==='book'?'<path d="M3 5q5-2 9 1 4-3 9-1v15q-5-2-9 0-4-2-9 0ZM12 6v14" fill="none" stroke="currentColor" stroke-width="1.7"/>':id==='location'?'<path d="M12 22S4 14 4 9a8 8 0 0 1 16 0c0 5-8 13-8 13ZM9 9a3 3 0 1 0 6 0 3 3 0 1 0-6 0" fill="none" stroke="currentColor" stroke-width="1.7"/>':`<use href="#i-${id}"></use>`}</svg>`;
  function objectArt(kind) {
    const body={
      water:'<path fill="#7baaba" d="M43 24h34l-2 12 10 16v55l-6 7H40l-6-7V52l11-16z"/><path fill="#f4ecd9" d="M34 62h51v30H34z"/><path fill="#3b6578" d="M41 15h37v15H41z"/><path d="M44 51v53m9-40 7-12 8 12c7 14-23 14-15 0"/>',
      rice:'<path fill="#faf3df" d="M25 65q-4-31 17-27 8-24 21-9 21-11 28 9 20 5 9 27z"/><path fill="#bb6646" d="M20 64h84q-4 44-42 45-34-1-42-45z"/><path fill="#efc996" d="M20 64h84v9H20z"/><path d="m37 49 7-4m12-6 7 5m14 4 7-4M45 84h34"/>',
      bag:'<path fill="#b8794c" d="m24 43 69-6 13 70-75 9z"/><path fill="#d9bb84" d="m24 43 69-6 3 15-69 7z"/><path d="m43 43-2-16q16-22 32-4l3 17M49 75l32-3 2 23-31 3z"/><path fill="#f5eedb" d="m73 45 14-1 4 17-14 2z"/>',
      book:'<path fill="#f5eeda" d="m22 23 66-6 16 90-66 11z"/><path fill="#486d87" d="m18 17 66-6 16 90-66 11z"/><path fill="#cb8957" d="m18 17 9-1 16 90-9 6z"/><path fill="#f4e9ce" d="m38 38 40-5 5 25-40 6z"/><path d="m45 45 27-4m-24 13 20-3M40 105l58-10"/>'
    }[kind];
    return `<svg class="wj-object" viewBox="0 0 124 130" aria-hidden="true"><g stroke="#304d59" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
  }
  function readState(){try{return M.normalize(JSON.parse(host.storage.getItem(M.key(dir))||'null'),dir);}catch(_){return M.normalize(null,dir);}}
  function save(){host.storage.setItem(M.key(dir),JSON.stringify(state));}
  let syncing=false;
  async function flush(){
    if(syncing || !state.pending.length)return;syncing=true;
    const d=dir;
    try {
      if(!await host.prepareLearning() || d!==dir)return;
      for(const e of [...state.pending]) {
        if(d!==dir)return;
        if(root.VocabUI?.recordGamePractice(e.word,e.correct,e.id)) {state=M.acknowledge(state,e.id);save();}
      }
    } finally {syncing=false;}
  }
  function stop(){clearTimeout(wardrobeTimer);epoch++;clearTimeout(audioTimer);root.HUILAISHI_SPEECH?.stop();root.XULONG_MUSIC?.release('world');drawing=false;pointId=null;busy=false;const button=q('#wj-listen');if(button?.disabled&&!settled){button.disabled=false;status(t('播放已暂停，可以重新听。','หยุดเสียงแล้ว แตะฟังใหม่ได้'));}}
  function status(message){const node=q('#wj-status');if(node)node.textContent=message;}
  function focus(){q('#wj-focus')?.focus({preventScroll:true});}
  function sceneIndex(){return task?task.scene:(M.next(state)?.scene??2);}
  function hero(frame='idle'){const equipped=wardrobe()?.appearance(zh()?'chinese':'thai');if(equipped?.frames[frame])return equipped.frames[frame];return zh()?`assets/game/xiaoai-explorer-v125-${frame}.webp`:`assets/game/chaninda-varsity-v125-${frame}.webp`;}
  function picture(scene,character=true){
    const src=asset(scene.art),person=asset(hero());
    return `<div class="wj-scenery">${src?`<img class="wj-backdrop" src="${esc(src)}" alt="" decoding="async" fetchpriority="high">`:''}<div class="wj-light"></div>${character&&person?`<img class="wj-actor" src="${person}" alt="${zh()?'小艾':'CHANINDA'}" decoding="async">`:''}</div>`;
  }
  function pageTop(kicker,title,sub=''){return `<header class="wj-page-title"><span class="wj-kicker">${kicker}</span><h1 id="wj-focus" tabindex="-1">${title}</h1>${sub?`<p>${sub}</p>`:''}</header>`;}
  function world(){
    const s=M.stats(state),next=M.next(state),scene=M.scenes[dir][next?.scene??2];
    return `<div class="wj-world wj-world-play">
      <section class="wj-cover wj-play-cover" aria-label="${esc(scene.name)}">${picture(scene)}
        <div class="wj-play-title"><span class="wj-kicker">${t('校园声斗赛 · 中泰双界冒险','ศึกเสียง · ผจญภัยสองโลก')}</span><h1 id="wj-focus" tabindex="-1">${t('把听懂的，\n变成下一招。','ฟังให้เข้าใจ\nแล้วเปลี่ยนเป็นท่าโจมตี')}</h1><p>${t('跟着小艾，找回她留下的声音。','เดินทางกับ CHANINDA ตามหาเสียงของคนรัก')}</p></div>
        <span class="wj-play-location">${icon('location')}${esc(scene.name)}</span>
        <div class="wj-play-start">${b('campus',`<span><small>${t('听音破招 · 认字施法','ฟังเพื่อออกท่า · อ่านเพื่อร่ายเวท')}</small><b>${t('进入声斗赛','เข้าสู่ศึกเสียง')}</b></span><i aria-hidden="true">↗</i>`,'','wj-primary')}<p>${t('首次通关获得换装点数 · 不必开启麦克风','ผ่านครั้งแรกสะสมแต้มแลกชุด · ไม่ต้องใช้ไมค์')}</p></div>
      </section>
      <section class="wj-next"><div><span class="wj-kicker">${t('另一边的故事','เรื่องราวอีกฟากหนึ่ง')} · ${s.steps}/${s.total}</span><h2>${next?copy(next.title):t('你的回信，已经出发。','จดหมายของคุณออกเดินทางแล้ว')}</h2><p>${t('散落的留言，等你慢慢找回来。','ค่อย ๆ ตามหาข้อความที่กระจัดกระจาย')}</p></div>${b(next?'start':'notebook',next?t('继续故事','เดินทางต่อ'):t('旅行册','สมุดเดินทาง'))}</section>
      <div class="wj-world-tools">${b('wardrobe',`${icon('cards')}<span><b>${t('我的衣橱','ตู้เสื้อผ้า')}</b><small>${t('换一套喜欢的，再出发','ใส่ชุดที่ชอบแล้วออกเดินทาง')}</small></span><i>↗</i>`)}${b('notebook',`${icon('book')}<span><b>${t('旅行册','สมุดเดินทาง')}</b><small>${t('听过的，读过的，再练一次','ทบทวนคำที่เคยฟังและอ่าน')}</small></span><i>↗</i>`)}</div>
      <div class="wj-tools-inline">${b('map',t('沿河的足迹 · 世界地图','รอยเท้าริมแม่น้ำ · แผนที่โลก'),'','wj-quiet')}</div>
      <p class="wj-bottom-note">${t('世界与战斗分开推进，练过的词会带在身上。','เรื่องราวกับการต่อสู้มีความคืบหน้าแยกกัน แต่ใช้บันทึกคำศัพท์ร่วมกัน')}</p></div>`;
  }
  function notebook(){
    const sections=[['listen','volume',t('听声音','ฟังเสียง'),t('先听，再找对应的东西','ฟังแล้วหาสิ่งของที่ตรงกัน')],['read','book',t('认字词','อ่านคำ'),t('把字词和真实物品联系起来','เชื่อมคำกับสิ่งของ')],['write','cards',t('写一写','ลองเขียน'),t('对照临摹 · 不自动评字','ฝึกเขียน 水 ตามลำดับขีด')]];
    return `${b('home','← '+t('回到世界','กลับสู่โลก'),'','wj-back')}${pageTop(t('随身旅行册','สมุดเดินทาง'),t('把不会的，\n再玩一次。','คำที่ยังไม่คุ้น\nลองเล่นอีกครั้ง'),t('短练习不推进剧情，也不重复发放奖励。','การฝึกสั้น ๆ ไม่เลื่อนเนื้อเรื่องและไม่ให้รางวัลซ้ำ'))}<div class="wj-notebook">${sections.map(([type,ic,title,sub])=>`<section class="wj-notebook-section"><header>${icon(ic)}<h2>${title}</h2><p>${sub}</p></header>${M.tasks.filter(x=>x.type===type).map(x=>b('practice',`<span>${copy(x.title)}</span><i>↗</i>`,`data-task="${x.id}"`)).join('')}</section>`).join('')}</div><div class="wj-tools-inline">${b('vocab',t('完整词库与到期复习','คลังคำศัพท์และทบทวน'))}${b('conversation',t('对话与跟读工具','ฝึกสนทนาและพูดตาม'))}</div>`;
  }
  function map(){return `${b('home','← '+t('回到世界','กลับสู่โลก'),'','wj-back')}${pageTop(t('第一章 · 路线','เส้นทาง · บทที่ 1'),t('沿河，去找你。','ตามสายน้ำไปหาเธอ'))}<div class="wj-map">${M.scenes[dir].map((s,i)=>{const done=M.tasks.filter(x=>x.scene===i&&state.completed[x.id]).length;return `<article>${asset(s.art)?`<img src="${esc(asset(s.art))}" alt="" loading="lazy">`:''}<div><span class="wj-kicker">0${i+1} / ${done}/2</span><h2>${esc(s.name)}</h2><p>${esc(s.detail)}</p></div></article>`;}).join('')}</div>${b('start',t('继续当前故事','เดินทางต่อจากจุดเดิม'),'','wj-primary')}`;}
  function exercise(){
    const scene=M.scenes[dir][task.scene],w=M.words[task.word],label=task.type==='listen'?t('听声音 · 找物品','ฟังเสียง · หาสิ่งของ'):task.type==='read'?t('认字词 · 找线索','อ่านคำ · หาเบาะแส'):task.type==='write'?t('笔迹工坊','มุมฝึกเขียน'):t('恋人的来信','จดหมายจากคนรัก');
    return `<div class="wj-exercise">${b(replay?'notebook':'home','← '+(replay?t('旅行册','สมุดเดินทาง'):t('暂别故事','พักเรื่องราว')),'','wj-back')}<div class="wj-task-scene">${picture(scene)}<div class="wj-task-place"><span>${esc(scene.name)}</span><small>${replay?t('旅行册练习','ฝึกในสมุดเดินทาง'):t('声页','หน้ากระดาษ')+' '+(M.tasks.indexOf(task)+1)+'/6'}</small></div></div>
      <section class="wj-task-paper" data-task-kind="${task.type}"><span class="wj-kicker">${label}</span><h1 id="wj-focus" tabindex="-1">${copy(task.title)}</h1><p class="wj-task-brief">${copy(task.brief)}</p>
      ${task.type==='letter'?letter():task.type==='write'?writing():`<div class="wj-prompt">${task.type==='read'?`<span class="wj-word" lang="${zh()?'th':'zh'}">${esc(target(w))}</span>`:'<span class="wj-sound-lines" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>'}${b('listen',icon('volume')+' '+t('听声音','ฟังเสียง'),'id="wj-listen"')}${b('hint',t('需要提示','ขอคำใบ้'),'','wj-quiet')}<span id="wj-hint" class="wj-hint" hidden></span></div><div class="wj-objects">${task.options.map(k=>b('answer',`${objectArt(k)}<span>${esc(meaning(M.words[k]))}</span>`,`data-answer="${k}" ${task.type==='listen'?'disabled':''}`,'wj-object-choice')).join('')}</div>`}
      <p id="wj-status" class="wj-status" role="status" aria-live="polite">${task.type==='listen'?t('先点“听声音”。不方便听，可以使用文字提示。','แตะฟังเสียงก่อน ถ้าไม่สะดวกฟัง ใช้คำใบ้แบบข้อความได้'):''}</p><div id="wj-feedback" hidden></div></section></div>`;
  }
  function letter(){return `<div class="wj-letter"><span>${t('CHANINDA 的字迹','ลายมือของ小艾')}</span><p>${t('「先把那些普通的词记住吧。水、饭、书，还有我们。它们会带你找到我。」','“เริ่มจากคำธรรมดาก่อนนะ น้ำ ข้าว หนังสือ และคำว่าเรา คำเหล่านี้จะพาเธอมาหาฉัน”')}</p><small>${t('选择你的回信 · 没有标准答案','เลือกข้อความตอบกลับ · ไม่มีคำตอบผิด')}</small></div><div class="wj-letter-choices">${b('reply',t('沿着你的声音，我会找到你。','ฉันจะตามเสียงของเธอไปให้พบ'),'data-reply="follow"')}${b('reply',t('等我，我也有很多话想告诉你。','รอฉันนะ มีหลายเรื่องอยากเล่าให้ฟัง'),'data-reply="wait"')}</div>`;}
  function writing(){
    return `<div class="wj-writing-layout"><div class="wj-writing-note"><span class="wj-word" lang="${zh()?'th':'zh'}">${zh()?'น้ำ':'水'}</span><p>${zh()?'水 · 请对照上方的完整字形。':'shuǐ · น้ำ'}</p>${b('listen',icon('volume')+' '+t('听读音','ฟังเสียง'))}${!zh()?b('demo',t('看笔顺示范','ดูลำดับขีด')):''}${b('erase',t('重新写','เขียนใหม่'))}${b('alternate',t('不方便写？改用认字','ไม่สะดวกเขียน? ฝึกอ่านแทน'),'','wj-quiet')}</div><div><svg id="wj-pad" viewBox="0 0 1024 1024" role="img" aria-label="${t('自由临摹区，可用手指或鼠标书写','พื้นที่ฝึกเขียนตามขีดสีแดง ใช้นิ้วหรือเมาส์')}" class="wj-pad"><path class="wj-grid" d="M512 0V1024M0 512H1024M0 0L1024 1024M1024 0L0 1024"/><g id="wj-guides"></g><g id="wj-ink"></g><path id="wj-live"/></svg><p id="wj-stroke-note">${t('自由临摹，不做自动发音或字形评分。','เริ่มที่จุดสีแดง แล้วลากตามขีดที่ 1 จาก 4')}</p>${zh()?b('self-review',t('对照原字，完成临摹','ตรวจเทียบต้นแบบแล้ว'),'id="wj-self-review" disabled'):''}</div></div>`;
  }
  function battle(){return `${pageTop(t('战斗 · 独立进度','สนามต่อสู้ · บันทึกแยก'),t('校园声斗赛','ศึกเสียงในรั้วโรงเรียน'),t('从常用词出发。听懂、答对，走向下一关。','เริ่มจากคำพื้นฐาน ฟังให้เข้าใจ ตอบถูก แล้วไปด่านถัดไป'))}<div class="wj-battle-cover">${picture(M.scenes[dir][2],false)}${asset(zh()?'assets/game/thai-tide-ray-v125-idle.webp':'assets/game/chinese-bell-lion-v125-idle.webp')?`<img class="wj-battle-monster" src="${asset(zh()?'assets/game/thai-tide-ray-v125-idle.webp':'assets/game/chinese-bell-lion-v125-idle.webp')}" alt="${t('潮汐鳐','สิงโตระฆัง')}">`:''}<div><span class="wj-kicker">${t('由易到难 · 36 关','จากง่ายไปยาก · 36 ด่าน')}</span><h2>${t('听懂这一声，\n打出下一招。','ฟังเสียงให้เข้าใจ\nแล้วออกท่าต่อไป')}</h2><p>${t('从常用词开始，越往后越有挑战。','เริ่มจากคำพื้นฐาน แล้วท้าทายขึ้นทีละด่าน')}</p>${b('monsters',t('进入声斗赛','เข้าสู่ศึกเสียง'),'','wj-primary')}</div></div>${wardrobeStrip()}<div class="wj-battle-modes">${b('rogue',`<span class="wj-mode-number">01</span><span><b>${t('自由远征','ผจญภัยอิสระ')}</b><small>${t('路线选择 · 本局道具','เลือกเส้นทาง · ไอเทมเฉพาะรอบ')}</small></span><i>↗</i>`)}${b('duel',`<span class="wj-mode-number">02</span><span><b>${t('同机双人','สองคนบนเครื่องเดียว')}</b><small>${t('面对面比一场 · 不是联网匹配','ท้าทายเพื่อนข้าง ๆ · ไม่ใช่จับคู่ออนไลน์')}</small></span><i>↗</i>`)}</div><p id="wj-battle-status" role="status"></p>${b('more-games',t('其他小游戏与规则','มินิเกมอื่น ๆ และกติกา'),'aria-expanded="false"','wj-quiet')}`;}
  function growth(){const s=M.stats(state);return `${pageTop(t('记录 · 旅行手册','บันทึกการเดินทาง'),t('走过的路，\n会留下回声。','ทุกก้าวที่เดิน\nจะทิ้งเสียงสะท้อนไว้'),t('已走过的剧情，和练习过的词，都在这里。','ดูเรื่องราวที่ผ่านและคำศัพท์ที่ฝึกแล้ว'))}<div class="wj-growth-strip"><div><small>${t('故事足迹','เส้นทางเรื่องราว')}</small><strong>${s.steps}<span> / ${s.total}</span></strong></div><div><small>${t('无提示答对','ตอบถูกโดยไม่มีคำใบ้')}</small><strong>${s.recall}<span> ${t('次','ครั้ง')}</span></strong></div><div><small>${t('描写体验','ฝึกเขียนตามแบบ')}</small><strong>${s.writing}<span> ${t('次','ครั้ง')}</span></strong></div></div><p class="wj-bottom-note">${t('一次答对不代表掌握；看过提示和临摹不计入独立回忆。','ตอบถูกครั้งเดียวไม่ได้แปลว่าจำได้แล้ว การใช้คำใบ้และเขียนตามแบบไม่นับเป็นการจำได้เอง')}</p><section class="wj-memory"><span class="wj-kicker">${t('回信匣','กล่องจดหมาย')}</span><h2>${state.reply?t('第一封回信已寄出','ส่งจดหมายฉบับแรกแล้ว'):t('留一个位置，给她的来信。','เว้นที่ไว้ให้จดหมายของเขา')}</h2><p>${state.reply?t('你们正在不同的世界，学着说同一种心意。','แม้อยู่คนละโลก คุณทั้งคู่กำลังเรียนรู้ที่จะสื่อความรู้สึกเดียวกัน'):t('完成第一章，把散落的词串成你们的新约定。','จบบทแรก แล้วเชื่อมคำที่พบให้กลายเป็นคำสัญญาใหม่')}</p>${b('world-return',t('回世界继续','กลับไปเดินทางต่อ'))}${b('vocab',t('查看词汇复习记录','ดูบันทึกทบทวนคำศัพท์'),'','wj-quiet')}</section>${wardrobeStrip()}<h2 class="wj-settings-heading">${t('学习档案与设置','บันทึกการเรียนและการตั้งค่า')}</h2>`;}
  function wardrobeStrip(){
    const s=wardrobe()?.read();if(!s)return '';
    return `<div class="wj-wallet-strip"><span><small>${t('衣橱点数','แต้มตู้เสื้อผ้า')}</small><b>${s.balance}</b></span><p>${t('每关首通 30 点 · 90 点兑换一套常驻装','ผ่านครั้งแรก 30 แต้ม · ชุดถาวร 90 แต้ม')}</p>${b('wardrobe',t('换套衣服','เปลี่ยนชุด'))}</div>`;
  }
  function wardrobePage(){
    const api=wardrobe(),s=api.read(),list=api.outfits.filter(o=>o.hero===wardrobeHero);
    const o=list.find(o=>o.id===wardrobeSelection)||list[0];wardrobeSelection=o.id;
    const owned=s.owned.includes(o.id),worn=s.equipped[o.hero]===o.id;
    const message=wardrobeMessage||t('预览不扣点。衣服只改外观，不增加伤害。','ดูตัวอย่างไม่เสียแต้ม ชุดเปลี่ยนรูปลักษณ์เท่านั้น ไม่เพิ่มดาเมจ');
    return `${b('wardrobe-back','← '+t('返回','กลับ'),'','wj-back')}${pageTop(t('课后衣橱 · 本机收藏','ตู้เสื้อผ้าหลังเลิกเรียน · บันทึกในเครื่อง'),t('换上喜欢的，\n再出发。','ใส่ชุดที่ชอบ\nแล้วออกเดินทาง'))}
      <div class="wj-wardrobe-top"><div role="group" aria-label="${t('选择角色','เลือกตัวละคร')}">${['chinese','thai'].map(h=>b('wardrobe-hero',h==='chinese'?'小艾':'CHANINDA','data-hero="'+h+'" aria-pressed="'+(h===wardrobeHero)+'"')).join('')}</div><span>${t('可用点数','แต้มที่ใช้ได้')} <b>${s.balance}</b></span></div>
      <div class="wj-wardrobe"><div class="wj-fitting" data-outfit="${o.id}"><img class="wj-fitting-scene" src="${esc(asset(M.scenes[dir][0].art))}" alt="" decoding="async"><img id="wj-outfit-actor" class="wj-fitting-actor" src="${esc(asset(o.frames.idle))}" alt="${esc(zh()?o.zh:o.th)}" decoding="async"><span class="wj-fitting-tag">${t('试衣间','ห้องลองชุด')}</span><div class="wj-fitting-actions">${b('wardrobe-motion',t('看看出招动作','ดูท่าโจมตี'))}<small id="wj-motion-label" aria-live="polite">${t('待机','ยืน')}</small></div></div>
      <section class="wj-outfit-sheet"><span class="wj-kicker">${t('同一角色 · 完整配套动作','ตัวละครเดิม · ท่าทางครบชุด')}</span><h2>${esc(zh()?o.zh:o.th)}</h2>
      <div class="wj-outfit-options" role="group" aria-label="${t('选择服装','เลือกชุด')}">${list.map(x=>b('wardrobe-select','<b>'+esc(zh()?x.zh:x.th)+'</b><small>'+ (s.owned.includes(x.id)?t('已拥有','มีแล้ว'):x.price+' '+t('点 · 常驻外观','แต้ม · ชุดถาวร'))+'</small>','data-outfit="'+x.id+'" aria-pressed="'+(o.id===x.id)+'"')).join('')}</div>
      <p class="wj-outfit-detail">${t('待机、跑动、蓄力、出招、受击、闪避、收招、胜利，八个动作都跟着换。','เปลี่ยนครบแปดท่า: ยืน วิ่ง เตรียมโจมตี โจมตี รับการโจมตี หลบ คืนท่า และฉลอง')}</p>
      ${wardrobeConfirm&&!owned?`<section class="wj-redeem-confirm" aria-label="${t('确认兑换','ยืนยันแลกชุด')}"><b>${t('确认用 90 点兑换？','ยืนยันใช้ 90 แต้มแลกชุด?')}</b><p>${t('兑换后剩余 '+Math.max(0,s.balance-o.price)+' 点。','หลังแลกเหลือ '+Math.max(0,s.balance-o.price)+' แต้ม')}</p><div>${b('wardrobe-buy',t('确认兑换','ยืนยันแลก'),'','wj-primary')}${b('wardrobe-cancel',t('再想想','ไว้ก่อน'))}</div></section>`:b(owned?'wardrobe-wear':'wardrobe-confirm',worn?t('正在穿着','กำลังสวมใส่'):owned?t('穿这套出战','สวมชุดนี้ต่อสู้'):s.balance>=o.price?t('用 90 点兑换','แลกด้วย 90 แต้ม'):t('还差 '+(o.price-s.balance)+' 点','ขาดอีก '+(o.price-s.balance)+' แต้ม'),worn||(!owned&&s.balance<o.price)?'disabled':'','wj-primary')}
      <p id="wj-wardrobe-status" class="wj-status" role="status">${esc(message)}</p><details class="wj-points-rules"><summary>${t('点数怎么获得？','รับแต้มได้อย่างไร?')}</summary><p>${t('校园声斗赛每关首次击败：通关 20 点 + 角色成长 10 点；剧情每个节点首次完成 10 点。重玩不重复发奖。两条语言路线共用衣橱，学习和关卡进度分开保存。','ศึกเสียงผ่านแต่ละด่านครั้งแรก: ผ่านด่าน 20 + เติบโต 10 แต้ม เนื้อเรื่องแต่ละจุดครั้งแรก 10 แต้ม เล่นซ้ำไม่รับซ้ำ สองเส้นทางใช้ตู้เสื้อผ้าร่วมกัน แต่แยกบันทึกการเรียนและด่าน')}</p><p>${t('这些是本机游戏点数，不售卖、不抽奖。原有远征场景的服装试穿仍然保留。','เป็นแต้มเกมในเครื่อง ไม่จำหน่ายและไม่สุ่มรางวัล ยังลองชุดประจำพื้นที่ในโหมดผจญภัยได้เหมือนเดิม')}</p></details></section></div>`;
  }
  function render(){
    if(mode==='wardrobe'){const el=q(view==='home'?'#world-journey':view==='battle'?'#world-battle':'#world-growth');el.innerHTML=wardrobePage();return;}
    if(view==='home'){const el=q('#world-journey');el.innerHTML=mode==='task'?exercise():mode==='notebook'?notebook():mode==='map'?map():world();if(mode==='task'&&task.type==='write')initPad();}
    else if(view==='battle')q('#world-battle').innerHTML=battle();
    else if(view==='profile')q('#world-growth').innerHTML=growth();
  }
  function expose(){if(task?.type==='listen')q('#world-journey')?.querySelectorAll('[data-wj="answer"]').forEach(b=>b.disabled=false);}
  function markAssisted(wrong=false){assisted=true;if(!replay){if(!state.assisted.includes(task.id))state.assisted.push(task.id);if(wrong&&!state.failed.includes(task.id))state.failed.push(task.id);save();}}
  function hint(){markAssisted();const el=q('#wj-hint');if(el){el.hidden=false;el.textContent=target(M.words[task.word])+' · '+meaning(M.words[task.word]);}expose();status(t('已显示提示，这次记为辅助练习。','แสดงคำใบ้แล้ว ครั้งนี้บันทึกเป็นการฝึกแบบช่วยเหลือ'));}
  function listen(){
    if(!task||settled)return;const w=M.words[task.word],token=++epoch;clearTimeout(audioTimer);
    if(task.type==='read')markAssisted();
    const button=q('#wj-listen');if(button)button.disabled=true;
    root.XULONG_MUSIC?.hold('world');status(t('正在播放，听完再选。','กำลังเล่นเสียง ฟังให้จบก่อนเลือก'));
    let ended=false;
    const finish=ok=>{if(token!==epoch||ended)return;ended=true;clearTimeout(audioTimer);root.XULONG_MUSIC?.release('world');if(button)button.disabled=false;if(ok){heard=true;expose();status(t('听到了吗？找找它在哪里。','ได้ยินแล้วใช่ไหม ลองหาว่าอยู่ตรงไหน'));}else status(t('声音没有播完。可以重试，或点“需要提示”继续。','เสียงยังเล่นไม่จบ ลองใหม่หรือใช้คำใบ้ได้'));};
    audioTimer=setTimeout(()=>{root.HUILAISHI_SPEECH?.stop();finish(false);},15000);
    try{const ok=root.HUILAISHI_SPEECH?.speak(target(w),{lang:zh()?'th-TH':'zh-CN',track:'standard',voicePackLevel:1,direction:dir,audioKey:`vocab:${w.id}:word:${zh()?'th':'zh'}`,onEnd:()=>finish(true),onError:()=>finish(false)});if(!ok)finish(false);}catch(_){finish(false);}
  }
  function finish(evidence){
    if(settled)return;settled=true;stop();
    if(M.tasks.find(t=>t.id===task.id)?.type==='write'&&task.type==='read')evidence='alternate';
    if(!replay){state=M.complete(state,task.id,evidence);save();wardrobe()?.reconcile(dir,'story',Object.keys(state.completed));void flush();}
    const el=q('#wj-feedback');el.hidden=false;el.innerHTML=`<span class="wj-kicker">${t('声页亮起来了','หน้ากระดาษส่องสว่างแล้ว')}</span><h2>${task.type==='letter'?t('总有一天，我们会读懂彼此。','สักวันเราจะเข้าใจกัน'):t('这一小步，走到了。','ผ่านก้าวเล็ก ๆ นี้แล้ว')}</h2><p>${task.word?`${esc(target(M.words[task.word]))} · ${esc(meaning(M.words[task.word]))} — `:''}${evidence==='recall'?t('无提示答对，已加入词汇复习。','ตอบถูกโดยไม่มีคำใบ้ เพิ่มในรายการทบทวนแล้ว'):t('已记录体验，不标记为掌握。','บันทึกการฝึกแล้ว ยังไม่ระบุว่าจำได้')}</p>${b(replay?'notebook':'next',replay?t('回旅行册','กลับสมุดเดินทาง'):M.next(state)?t('翻到下一页','เปิดหน้าถัดไป'):t('回到世界','กลับสู่โลก'),'','wj-primary')}`;
    q('#world-journey').querySelectorAll('[data-wj="answer"],[data-wj="reply"],[data-wj="hint"],[data-wj="listen"],[data-wj="self-review"],[data-wj="alternate"],[data-wj="erase"],[data-wj="demo"]').forEach(b=>b.disabled=true);
    status(host.storage.persistent===false?t('当前仅保存在本次会话；关闭应用可能丢失。','บันทึกได้เฉพาะช่วงนี้ ปิดแอปแล้วข้อมูลอาจหาย'):t('已保存。你可以继续，也可以从底部离开。','บันทึกแล้ว ไปต่อหรือออกทางเมนูด้านล่างได้'));el.querySelector('button')?.focus({preventScroll:true});el.scrollIntoView({block:'nearest',behavior:'auto'});
  }
  function begin(item,practice=false){stop();task=item;replay=practice;mode='task';heard=false;assisted=state.assisted.includes(item.id);settled=false;stroke=0;ink=[];render();focus();}
  const medians=()=>root.XULONG_WATER_STROKES.map(p=>p.map(([x,y])=>[x,900-y]));
  const path=p=>p.map((v,i)=>(i?'L':'M')+v.join(' ')).join(' ');
  function drawGuides(){const g=q('#wj-guides');if(!g||zh())return;g.innerHTML=medians().map((m,i)=>`<path d="${path(m)}" class="${i<stroke?'wj-stroke-done':i===stroke?'wj-stroke-current':'wj-stroke-later'}"/>${i===stroke?`<circle cx="${m[0][0]}" cy="${m[0][1]}" r="20"/>`:''}`).join('');}
  function initPad(){
    const pad=q('#wj-pad');drawGuides();
    const point=e=>{const r=pad.getBoundingClientRect();return [(e.clientX-r.left)*1024/r.width,(e.clientY-r.top)*1024/r.height];};
    pad.addEventListener('pointerdown',e=>{if(settled||drawing||(!zh()&&stroke>=4))return;e.preventDefault();drawing=true;pointId=e.pointerId;ink=[point(e)];pad.setPointerCapture(e.pointerId);});
    pad.addEventListener('pointermove',e=>{if(!drawing||e.pointerId!==pointId)return;e.preventDefault();ink.push(point(e));q('#wj-live').setAttribute('d',path(ink));});
    const cancel=()=>{drawing=false;pointId=null;ink=[];q('#wj-live')?.removeAttribute('d');};
    pad.addEventListener('pointercancel',cancel);
    pad.addEventListener('lostpointercapture',()=>{if(drawing)cancel();});
    pad.addEventListener('pointerup',e=>{if(!drawing||e.pointerId!==pointId)return;drawing=false;pointId=null;ink.push(point(e));
      if(zh()) {if(M.sample(ink).length){q('#wj-ink').insertAdjacentHTML('beforeend',`<path d="${path(ink)}"/>`);if(q('#wj-ink').children.length>=2)q('#wj-self-review').disabled=false;}status(t('请对照原字。点完成只记录临摹体验。','ตรวจเทียบต้นแบบก่อนยืนยัน'));}
      else if(M.matchStroke(ink,medians()[stroke])){stroke++;drawGuides();q('#wj-stroke-note').textContent=stroke<4?`ขีดที่ ${stroke+1} จาก 4 · เริ่มที่จุดสีแดง`:'ครบ 4 ขีดแล้ว';if(stroke===4)finish('traced');}
      else status('ลองขีดนี้อีกครั้ง เริ่มจากจุดสีแดงแล้วลากตามแนว');
      q('#wj-live')?.removeAttribute('d');ink=[];
    });
  }
  async function action(button){
    const a=button.dataset.wj;if(button.disabled)return;
    if(state.pending.length)void flush();
    if(a==='campus'){stop();host.navigate('battle');const start=q('[data-wj="monsters"]');if(start)void action(start);return;}
    if(a==='wardrobe'){
      if(!wardrobe())return;stop();wardrobeReturn=mode;mode='wardrobe';wardrobeHero=zh()?'chinese':'thai';wardrobeSelection=wardrobe().read().equipped[wardrobeHero];wardrobeConfirm=false;wardrobeMessage='';render();q('.app-scroll')?.scrollTo?.(0,0);focus();return;
    }
    if(a.startsWith('wardrobe-')){
      if(mode!=='wardrobe')return;
      clearTimeout(wardrobeTimer);
      const api=wardrobe();
      if(a==='wardrobe-back'){mode=wardrobeReturn;render();focus();return;}
      if(a==='wardrobe-hero'){if(!['chinese','thai'].includes(button.dataset.hero))return;wardrobeHero=button.dataset.hero;wardrobeSelection=api.read().equipped[wardrobeHero];wardrobeConfirm=false;wardrobeMessage='';}
      if(a==='wardrobe-select'){const o=api.outfits.find(o=>o.id===button.dataset.outfit&&o.hero===wardrobeHero);if(!o)return;wardrobeSelection=o.id;wardrobeConfirm=false;wardrobeMessage='';}
      if(a==='wardrobe-confirm'){wardrobeConfirm=true;}
      if(a==='wardrobe-cancel'){wardrobeConfirm=false;}
      if(a==='wardrobe-buy'||a==='wardrobe-wear'){
        if(a==='wardrobe-buy'&&!wardrobeConfirm)return;
        const result=a==='wardrobe-buy'?api.buy(wardrobeSelection):api.wear(wardrobeSelection);
        wardrobeConfirm=false;
        wardrobeMessage=!result.ok?result.reason==='balance'?t('点数不足，先去赢下一关吧。','แต้มไม่พอ ลองผ่านด่านต่อไปก่อน'):t('没能保存，请检查本机存储后重试。','บันทึกไม่ได้ ตรวจสอบพื้นที่เก็บข้อมูลแล้วลองใหม่'):result.reason==='purchased'?t('已兑换。点“穿这套出战”，下场战斗就换上。','แลกแล้ว แตะสวมชุดนี้ต่อสู้เพื่อใช้ในรอบถัดไป'):t('已经换好，下次出战会使用这套动作。','เปลี่ยนแล้ว รอบถัดไปจะใช้ท่าทางของชุดนี้');
        if(result.ok&&!result.durable)wardrobeMessage+=' · '+t('目前仅本次会话有效','ขณะนี้บันทึกได้เฉพาะช่วงนี้');
      }
      if(a==='wardrobe-motion'){
        const o=api.outfits.find(o=>o.id===wardrobeSelection),token=epoch,frames=['windup','strike','hit','dodge','run','recover','victory','idle'];
        const labels=zh()?['蓄力','出招','受击','闪避','跑动','收招','胜利','待机']:['เตรียมโจมตี','โจมตี','รับการโจมตี','หลบ','วิ่ง','คืนท่า','ฉลอง','ยืน'];let index=0;
        const next=()=>{const img=q('#wj-outfit-actor');if(!img||epoch!==token||mode!=='wardrobe')return;img.src=asset(o.frames[frames[index]]);q('#wj-motion-label').textContent=labels[index];index++;if(index<frames.length)wardrobeTimer=setTimeout(next,400);};
        next();return;
      }
      render();return;
    }
    if(['home','notebook','map'].includes(a)){stop();mode=a;task=null;render();focus();return;}
    if(a==='start'||a==='next'){const next=M.next(state);if(next)begin(next);else{mode='home';task=null;render();focus();}return;}
    if(a==='practice'){const item=M.tasks.find(t=>t.id===button.dataset.task);if(item)begin(item,true);return;}
    if(a==='listen'){listen();return;}
    if(a==='hint'){if(!settled)hint();return;}
    if(a==='answer'){
      if(settled||!task.options.includes(button.dataset.answer)||(task.type==='listen'&&!heard&&!assisted))return;
      if(button.dataset.answer!==task.word){markAssisted(true);button.dataset.wrong='true';status(t('还不是它。再看一看，或用提示听懂这个词。','ยังไม่ใช่ ลองดูอีกครั้งหรือใช้คำใบ้'));return;}
      finish(assisted?'assisted':'recall');return;
    }
    if(a==='reply'){if(settled)return;state.reply=button.dataset.reply;finish('story');return;}
    if(a==='erase'){stroke=0;ink=[];q('#wj-ink').innerHTML='';drawGuides();if(q('#wj-self-review'))q('#wj-self-review').disabled=true;status(t('纸面已清空，可以重新写。','ล้างกระดาษแล้ว เริ่มเขียนใหม่ได้'));return;}
    if(a==='demo'){const line=q('.wj-stroke-current');if(!line)return;line.classList.remove('wj-demo');void line.getBoundingClientRect();line.classList.add('wj-demo');status('ดูทิศทางของขีดสีแดง แล้วลองเขียนตาม');return;}
    if(a==='self-review'){finish('self-review');return;}
    if(a==='alternate'){task={...task,type:'read',options:['book','water','bag']};assisted=true;render();status(t('已改为认字，不计书写进度。','เปลี่ยนเป็นอ่านคำ ไม่นับเป็นการฝึกเขียน'));return;}
    if(a==='vocab'){stop();host.navigate('library');return;}
    if(a==='conversation'){stop();host.navigate('live');return;}
    if(a==='world-return'){host.navigate('home');return;}
    if(a==='more-games'){const on=q('#view-battle').classList.toggle('wj-show-legacy');button.setAttribute('aria-expanded',String(on));return;}
    if(['rogue','monsters','duel'].includes(a)){
      if(busy)return;busy=true;const token=epoch,bd=dir;button.disabled=true;q('#wj-battle-status').textContent=t('正在准备战斗内容…','กำลังเตรียมเนื้อหาการต่อสู้…');
      try{const ok=await host.prepareBattle();if(token!==epoch||bd!==dir||view!=='battle')return;if(!ok)throw new Error('unavailable');if(a==='rogue')await root.ArcadeUI?.openRogue({direct:true});else if(a==='monsters')root.ArcadeUI?.openStoryChapter();else q('#pass-phone')?.click();q('#wj-battle-status').textContent='';}
      catch(_){if(token===epoch)q('#wj-battle-status').textContent=t('战斗资源暂未就绪，请联网重试；剧情仍可继续。','ยังโหลดการต่อสู้ไม่ได้ ลองเชื่อมต่อแล้วเปิดใหม่ เรื่องราวยังเล่นต่อได้');}
      finally{busy=false;if(button.isConnected)button.disabled=false;}return;
    }
  }
  document.addEventListener('click',e=>{const button=e.target.closest('[data-wj]');if(button && !button.disabled)void action(button);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  root.XULONG_WORLD_UI=Object.freeze({
    show(nextView,adapter){stop();host=adapter;const changed=dir!==host.direction();dir=host.direction();state=readState();wardrobe()?.reconcile(dir,'story',Object.keys(state.completed));const previousView=view;view=nextView;if(changed||view==='home'||previousView!==view){mode='home';task=null;}
      document.documentElement.classList.add('wj-ready');
      if(['home','battle','profile'].includes(view))render();
      // Do not hydrate the full vocabulary during native cold start. The outbox
      // is flushed by the next user gesture or a completed story exercise.
    },
    start(){if(view==='home'){const next=M.next(state);if(next)begin(next);}},
    leave:stop
  });
})(globalThis);
