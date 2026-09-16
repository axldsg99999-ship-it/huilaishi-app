import {ASSET,HEROES,LESSONS,MONSTERS,chapterScene} from '../content.mjs?v=0.4.8';
import {Stage,HERO_MOMENTS} from '../renderer.mjs?v=0.4.8';
import {speak,stopAudio,startVoice,stopVoice,cancelVoice} from '../voice.mjs?v=0.4.8';
import {matchSpeech} from '../core.mjs?v=0.4.8';
import {voiceIssue} from '../speech-status.mjs?v=0.4.8';
import {LAB_VERSION,STANCES,BEATS,ENEMIES,createBattle,questionAt,preparePrompt,
  awardRepeat,chooseStance,progress,advance,resolveAnswer,nextRound,summary} from './engine.mjs?v=battle-lab-1-20260916';

// The main game is never loaded into this page. No browser storage is read or written.
const root=document.querySelector('#lab'),dialog=document.querySelector('#lab-dialog');
dialog.className='lab-dialog';
const params=new URLSearchParams(location.search);
let world=params.get('world')==='cn'?'cn':'th',relaxed=true,motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
let b=null,q=null,stage=null,opponent=null,view='lobby',media=null,mediaEpoch=0,
  lastFrame=performance.now(),resolvedMs=0,frameId=0,userPaused=false,hiddenPaused=document.hidden,
  portraitPaused=innerHeight>innerWidth,networkConsent=false,disposed=false;
let revealed=false,voiceState='',artWarning=false,pendingRiposte=0;
const deck=LESSONS[0];
const tx=(zh,th)=>world==='cn'?th:zh;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>root.querySelector(s);
const words=u=>u[world==='cn'?'zh':'th'];
const meaning=u=>u[world==='cn'?'th':'zh'];
const names={attack:['进攻','โจมตี'],break:['破势','เจาะ'],guard:['守势','ตั้งรับ']};
const name=s=>tx(...names[s]);
const svg=(kind='sound')=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+({sound:'<path d="M3 9h4l5-4v14l-5-4H3zM16 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',mic:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/>',back:'<path d="m14 5-7 7 7 7"/>',pause:'<path d="M9 5v14m6-14v14"/>'}[kind]||'')+'</svg>';
const btn=(action,text,cls='',attrs='')=>'<button type="button" class="'+cls+'" data-action="'+action+'" '+attrs+'>'+text+'</button>';
const back=()=>'<a class="back" href="../index.html">'+svg('back')+tx('原游戏','เกมเดิม')+'</a>';
function background(){return '<img class="scene-art" src="'+chapterScene(world,0)+'" alt=""><div class="scene-shade"></div><canvas class="actors" aria-hidden="true"></canvas>';}
function destroyStage(){stage?.destroy();stage=null;}
function cancelMedia(){
  const wasVoice=media==='voice';mediaEpoch++;stopAudio();cancelVoice();media=null;
  if(wasVoice){const message=dialog.querySelector('#voice-message');if(message)message.textContent=tx('录音已停止，可关闭后重新跟读，不扣血。','หยุดไมค์แล้ว ปิดหน้าต่างแล้วลองใหม่ได้ ไม่เสียพลัง');const stop=dialog.querySelector('[data-action=voice-stop]');if(stop)stop.disabled=true;}
}
function clearScene(){cancelMedia();destroyStage();if(dialog.open)dialog.close();userPaused=false;artWarning=false;}
function mountStage(enemy=null){
  const canvas=$('canvas');
  const combat=view==='battle';
  stage=new Stage(canvas,{battle:combat,ground:combat?.83:view==='result'?.88:.93,
    heroScale:view==='result'?.48:.30,homeAnchor:combat?undefined:[view==='result'?.76:.43,view==='result'?.88:.93],enemyX:.79,onError:()=>{
    artWarning=true;const node=$('.art-warning');if(node)node.hidden=false;
  }});
  stage.setMotion(motion);stage.equip(HEROES[world].sheet);
  if(enemy&&combat){stage.opponent(enemy,b?.kind==='elite'?2:0);if(motion)stage.loadFx();}
  stage.setPose('listen');applyPause();
}
function syncPortrait(){
  portraitPaused=innerHeight>innerWidth;
  root.querySelector('.portrait-message')?.remove();
  if(portraitPaused){const gate=document.createElement('section');gate.className='portrait-message';gate.innerHTML='<h2>'+tx('横过来，进入试验场','หมุนจอเพื่อเข้าลานทดลอง')+'</h2><p>'+tx('战斗与录音已暂停。横屏后点继续，不会扣血。','หยุดการต่อสู้และไมค์แล้ว หมุนจอแล้วกดต่อ ไม่เสียพลัง')+'</p><a href="../index.html">'+tx('返回原游戏','กลับเกมเดิม')+'</a>';$('.lab-scene')?.append(gate);}
  if(portraitPaused && b){userPaused=true;cancelMedia();}
  applyPause();
}
function applyPause(){
  const paused=userPaused||hiddenPaused||portraitPaused||dialog.open;
  if(b)b.paused=paused;
  stage?.setPaused(paused);
  const overlay=$('.paused-scrim');if(overlay)overlay.hidden=!userPaused||portraitPaused||dialog.open;
  for(const node of root.querySelectorAll('.lab-scene > :not(.paused-scrim):not(.portrait-message)'))node.inert=paused;
  lastFrame=performance.now();updateControls();
}
function pause(){
  if(!b)return;userPaused=true;cancelMedia();applyPause();
  $('[data-action=resume]')?.focus();
  status(tx('已暂停。点击继续后才恢复交锋。','หยุดแล้ว กดต่อเพื่อดำเนินการประลอง'));
}
function setView(content,cls){
  root.innerHTML='<main class="lab-scene '+cls+'" data-world="'+world+'">'+content+'</main>';
  document.documentElement.lang=world==='cn'?'th':'zh-CN';
}
function lobby(){
  clearScene();b=null;q=null;view='lobby';
  setView(background()+'<header class="topbar">'+back()+'<div class="top-title"><p class="eyebrow">XULONG PASA / PLAYTEST 01</p><h1>'+tx('战斗试验场','ลานทดลองการต่อสู้')+'</h1><p class="isolation">'+tx('独立试玩 · 不改正式进度 · 不含地图','ทดลองแยก · ไม่เปลี่ยนความคืบหน้าเกมเดิม · ไม่มีแผนที่')+'</p></div></header>'+
    '<section class="lobby-copy"><h2>'+tx('听懂这一句。<br>把握出手的一刻。','เข้าใจคำนี้<br>แล้วเลือกจังหวะลงมือ')+'</h2><p>'+tx('先听清意思，再选进攻、破势或守势。点击脑海中的正确答案，就是出招。','ฟังความหมาย เลือกโจมตี ทำลายการ์ด หรือตั้งรับ แล้วแตะคำตอบในความคิดเพื่อออกท่า')+'</p></section>'+
    '<section class="lobby-controls" aria-label="'+tx('试玩选择','เลือกการทดลอง')+'"><nav class="language-tabs">'+
    btn('world-th','中文 → ไทย','','aria-pressed="'+(world==='th')+'"')+btn('world-cn','ไทย → 中文','','aria-pressed="'+(world==='cn')+'"')+'</nav>'+
    btn('start-normal','<b>'+tx('01 / 基础陪练','01 / ฝึกพื้นฐาน')+'</b><small>'+tx('匀速节奏 · 清楚预告 · 先熟悉三种应对','จังหวะคงที่ · บอกท่าล่วงหน้า · เรียนรู้สามท่า')+'</small>','mode-choice')+
    btn('start-elite','<b>'+tx('02 / 停顿精英','02 / จังหวะหยุดพัก')+'</b><small>'+tx('停一下再出手 · 固定规律 · 一次决胜机会','หยุดแล้วเดินต่อ · รูปแบบแน่นอน · โอกาสตัดสินหนึ่งครั้ง')+'</small>','mode-choice elite')+
    '<label class="lab-setting"><input type="checkbox" data-setting="relaxed" '+(relaxed?'checked':'')+'>'+tx('舒缓节奏（只调整交锋速度）','จังหวะผ่อนคลาย (ปรับความเร็วเท่านั้น)')+'</label>'+
    '<label class="lab-setting"><input type="checkbox" data-setting="motion" '+(motion?'checked':'')+'>'+tx('人物动作与轻量反馈','ท่าทางและเอฟเฟกต์เบา ๆ')+'</label></section>'+
    '<p class="lobby-footer">'+tx('本次只测战斗。复用已有美术与词句；试玩成绩只在本页保留，刷新会清除，不发放正式奖励。','ทดลองเฉพาะการต่อสู้ ใช้ภาพและคำเดิม ผลอยู่ในหน้านี้เท่านั้น รีเฟรชแล้วหาย ไม่ให้รางวัลเกมเดิม')+'</p>','lobby-scene');
  mountStage();syncPortrait();
}
function start(kind){
  clearScene();b=createBattle({kind,world,relaxed,seed:Math.floor(Math.random()*1000)});view='battle';
  opponent=MONSTERS.find(m=>m.id===(world==='cn'?(kind==='elite'?'tortoise':'fox'):(kind==='elite'?'umbrella':'market-elephant')));
  setView(background()+'<header><button type="button" class="pause" data-action="pause" aria-label="'+tx('暂停战斗','หยุดการต่อสู้')+'" style="position:absolute;left:18px;top:12px;z-index:4"><img src="'+ASSET(HEROES[world].portrait)+'" alt=""><small>Ⅱ</small></button>'+
    '<section class="combat-hud"><b>'+esc(HEROES[world].name)+'</b><div class="hp-track"><div id="player-fill" class="hp-fill"></div></div><small id="player-hp"></small></section>'+
    '<section class="battle-title"><b>'+tx(...ENEMIES[kind].name)+'</b><small>'+tx('独立试玩 · 不写入正式存档','ทดลองแยก · ไม่บันทึกในเกมเดิม')+'</small></section>'+
    '<section class="combat-hud enemy"><b>'+esc(world==='cn'?opponent.th:opponent.zh)+'</b><div class="hp-track"><div id="enemy-fill" class="hp-fill"></div></div><small id="enemy-hp"></small></section></header>'+
    '<p class="hero-call" hidden>'+tx('决胜交锋','จังหวะตัดสิน')+'</p><p class="thought-label">'+tx('我的理解','ความเข้าใจของฉัน')+'</p><div class="answers"></div>'+
    '<p class="enemy-intent"></p><section class="thought enemy-thought"></section><span class="actor-badge">'+(world==='cn'?'C':'艾')+'</span>'+
    '<p class="lab-status" role="status" aria-live="polite"></p><div class="combat-dock"><nav class="stances" aria-label="'+tx('战术选择','เลือกท่า')+'">'+STANCES.map(s=>btn('stance-'+s,'<span>'+name(s)+'</span><small>'+tx('克制','ชนะ')+' '+name(BEATS[s])+'</small>','','aria-pressed="false"')).join('')+'</nav>'+
    '<section class="timing"><div class="timing-label"><span id="timing-label"></span><span>'+tx('点击答案出招','แตะคำตอบออกท่า')+'</span></div><div class="track" role="meter" aria-label="'+tx('出招时机','จังหวะออกท่า')+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="good-zone"></span><span class="perfect-zone"></span><i class="cursor"></i></div><div class="timing-key"><span>'+tx('常规','ปกติ')+'</span><span>'+tx('绿：良机 / 金：精准','เขียว: ดี / ทอง: แม่น')+'</span></div></section></div>'+
    btn('repeat',svg('mic')+'<span>'+tx('跟读稳心','พูดตาม ตั้งสมาธิ')+'</span>','voice-action')+
    btn('next',tx('下一次交锋','ประลองต่อ'),'resolve-next','hidden')+btn('menu',tx('退出','ออก'),'battle-back','aria-label="'+tx('退出试玩','ออกจากการทดลอง')+'"')+
    '<small class="art-warning" hidden>'+tx('部分美术未加载；可退出重试。','ภาพบางส่วนไม่พร้อม ออกแล้วลองใหม่ได้')+'</small>'+
    '<section class="paused-scrim" hidden><h2>'+tx('交锋暂停','หยุดการประลอง')+'</h2><p>'+tx('时间、动作和录音都已停下。准备好再继续。','เวลา ท่าทาง และไมค์หยุดแล้ว พร้อมแล้วค่อยเล่นต่อ')+'</p>'+btn('resume',tx('继续','เล่นต่อ'))+btn('menu',tx('结束本次试玩','จบการทดลองนี้'))+'</section>','battle-scene');
  mountStage(opponent);renderRound();syncPortrait();
}
function status(text){const el=$('.lab-status');if(el)el.textContent=text;}
function renderRound(){
  q=questionAt(deck,b.round,b.seed);revealed=false;resolvedMs=0;voiceState='';pendingRiposte=0;
  $('.hero-call').hidden=!b.hero;
  $('.answers').innerHTML=q.options.map((u,i)=>'<div class="thought choice" data-unit="'+u.id+'" data-locked="true">'+btn('answer-'+u.id,esc(meaning(u)),'answer','disabled lang="'+(world==='cn'?'th':'zh-CN')+'"')+btn('option-'+u.id,svg(), 'sound','aria-label="'+esc(tx('试听：','ฟัง: ')+meaning(u))+'"')+'</div>').join('');
  $('.enemy-intent').textContent=tx('它将使用：','ท่าถัดไป: ')+name(b.enemyStance);
  renderPrompt();updateHealth();updateControls();
  stage?.setPose('listen');stage?.exchange('waiting','lab',b.round);
  status(b.hero?tx('决胜机会：听懂、克制，再抓住绿色或金色时机。','โอกาสตัดสิน: เข้าใจ ชนะทาง แล้วกดในช่วงเขียวหรือทอง'):tx('先听它说。选定一种应对后开始交锋；等待时不计时。','ฟังก่อน เลือกท่าแล้วจังหวะจะเริ่ม ระหว่างรอไม่จับเวลา'));
}
function renderPrompt(){
  const text=revealed?esc(words(q.unit)):tx('听它说一句','ฟังคำพูดของคู่ต่อสู้');
  $('.enemy-thought').innerHTML=btn('hear',svg(),'sound','aria-label="'+tx('播放题目','ฟังโจทย์')+'"')+'<b lang="'+(revealed?(world==='cn'?'zh-CN':'th'):(world==='cn'?'th':'zh-CN'))+'">'+text+'</b><small>'+tx(b.kind==='elite'?'固定节奏：前进 → 停顿 → 前进':'基础节奏：游标匀速前进',b.kind==='elite'?'เดิน → หยุด → เดินต่อ':'ตัวชี้เดินด้วยความเร็วคงที่')+'</small>'+btn('reveal',revealed?tx('文字辅助已开启','เปิดคำใบ้แล้ว'):tx('看文字辅助','ดูคำใบ้ตัวอักษร'),'hint-link');
}
function updateHealth(){
  if(!b||view!=='battle')return;
  $('#player-fill').style.width=b.hp+'%';$('#enemy-fill').style.width=b.enemyHp/b.enemyMax*100+'%';
  $('#player-hp').textContent=b.hp+' / 100';$('#enemy-hp').textContent=b.enemyHp+' / '+b.enemyMax;
}
function updateControls(){
  if(!b||view!=='battle')return;
  const ready=b.phase==='prepare'&&!b.paused&&!media;
  for(const el of root.querySelectorAll('[data-action^="stance-"]')){
    const s=el.dataset.action.slice(7);el.setAttribute('aria-pressed',String(b.stance===s));
    el.disabled=!!media||b.paused||!b.promptReady||!['prepare','active'].includes(b.phase)||(b.phase==='active'&&progress(b)>=.60);
  }
  for(const el of root.querySelectorAll('.answer'))el.disabled=b.paused||b.phase!=='active'||!!media;
  for(const el of root.querySelectorAll('.choice'))el.dataset.locked=String(b.paused||b.phase!=='active');
  for(const el of root.querySelectorAll('[data-action^="option-"]'))el.disabled=!ready;
  for(const id of ['hear','reveal']){const el=$('[data-action='+id+']');if(el)el.disabled=!ready;}
  const repeat=$('[data-action=repeat]');repeat.hidden=b.phase==='resolved';repeat.disabled=!ready||!b.promptReady||b.echoUsed;
  const next=$('[data-action=next]');next.hidden=b.phase!=='resolved';next.disabled=b.paused||resolvedMs<850;
  next.textContent=b.outcome?tx('查看试玩结果','ดูผลการทดลอง'):tx('下一次交锋','ประลองต่อ');
  const meter=$('.track');const p=b.phase==='prepare'?0:progress(b);
  $('.cursor').style.left=(p*100)+'%';meter.setAttribute('aria-valuenow',String(Math.round(p*100)));
  $('#timing-label').textContent=b.phase==='prepare'?tx(b.echo?'跟读已稳心':'准备 · 不计时',b.echo?'พูดตามแล้ว':'เตรียม · ไม่จับเวลา'):b.phase==='resolved'?tx('交锋结束','จบจังหวะ'):progress(b)>=.60?tx('应对已锁定','ล็อกท่าแล้ว'):tx('可换势 · 消耗一点时机','เปลี่ยนท่าได้ · ใช้เวลาเล็กน้อย');
}
async function play(text,language,asPrompt=false){
  if(!b||b.phase!=='prepare'||b.paused||media)return;
  const token=++mediaEpoch,owner=b;media='audio';updateControls();stage?.setPose('listen');
  status(tx('正在播放；准备阶段不计时。','กำลังเล่นเสียง ระหว่างเตรียมไม่จับเวลา'));
  let timeout;
  // Also bound a stalled audio-index fetch, before a player has been created.
  const deadline=new Promise(resolve=>{timeout=setTimeout(()=>{if(token===mediaEpoch)stopAudio();resolve(false);},10000);});
  try{
    const ok=await Promise.race([speak(text,language),deadline]);
    if(token!==mediaEpoch||b!==owner)return;
    media=null;
    if(ok&&asPrompt)preparePrompt(b);
    status(ok?tx('听完了。选一种应对，开始交锋。','ฟังจบแล้ว เลือกท่าเพื่อเริ่ม'):tx('这句语音暂不可用。可看文字辅助继续，不扣血。','เสียงนี้ไม่พร้อม ใช้คำใบ้ตัวอักษรต่อได้ ไม่เสียพลัง'));
  }catch{if(token===mediaEpoch){media=null;status(tx('播放未完成，可看文字辅助继续。','เล่นเสียงไม่จบ ใช้คำใบ้ต่อได้'));}}
  finally{clearTimeout(timeout);updateControls();}
}
function openDialog(title,body,actions){
  dialog.innerHTML='<h2>'+esc(title)+'</h2>'+body+'<div>'+actions+'</div>';
  dialog.showModal();applyPause();
}
function askRepeat(){
  if(!b||b.phase!=='prepare'||b.paused||media||!b.promptReady||b.echoUsed)return;
  if(!networkConsent){openDialog(tx('跟读稳心 · 可选','พูดตามตั้งสมาธิ · ทางเลือก'),'<p>'+tx('跟读刚听到的泰语，只核对识别文字，不评价口音或声调。成功后本回合游标放慢，不能叠加。','พูดภาษาจีนที่เพิ่งฟัง ตรวจข้อความเท่านั้น ไม่ให้คะแนนสำเนียงหรือวรรณยุกต์ สำเร็จแล้วตัวชี้ช้าลงในรอบนี้ สะสมไม่ได้')+'</p><p>'+tx('系统或浏览器服务可能联网处理声音。本试玩页不保存录音，也不改正式游戏的语音设置。拒绝不影响触控试玩。','บริการระบบหรือเบราว์เซอร์อาจส่งเสียงออนไลน์ หน้าทดลองไม่เก็บเสียงและไม่แก้การตั้งค่าเกมเดิม ปฏิเสธแล้วยังแตะเล่นได้')+'</p>',btn('voice-consent',tx('同意并尝试跟读','ยินยอมและลองพูด'))+btn('dialog-close',tx('先用触控','ใช้การแตะก่อน'),'quiet'));return;}
  runRepeat();
}
function runRepeat(){
  if(!b||b.phase!=='prepare'||b.paused||media)return;
  // The repeat prompt displays the target text, so this is assisted practice.
  preparePrompt(b,true);
  const token=++mediaEpoch,owner=b;media='voice';stage?.setPose('speak');
  openDialog(tx('跟读这一句','พูดประโยคนี้ตาม'),'<p lang="'+(world==='cn'?'zh-CN':'th')+'" style="font-size:28px">'+esc(words(q.unit))+'</p><p id="voice-message">'+tx('正在准备麦克风…','กำลังเตรียมไมค์…')+'</p><p>'+tx('不做专业发音评分；服务失败不扣血。','ไม่ให้คะแนนการออกเสียง บริการล้มเหลวไม่เสียพลัง')+'</p>',btn('voice-stop',tx('说完了','พูดเสร็จแล้ว'))+btn('dialog-close',tx('取消，继续触控','ยกเลิก ใช้การแตะต่อ'),'quiet'));
  startVoice(world==='cn'?'zh':'th',{allowNetwork:true,maxMs:15000,
    onState:(state,details={})=>{
      if(token!==mediaEpoch||b!==owner||media!=='voice')return;
      const message=dialog.querySelector('#voice-message');if(!message)return;
      const texts={preparing:tx('准备麦克风…','เตรียมไมค์…'),listening:tx('我在听，说完请点“说完了”。','กำลังฟัง พูดเสร็จแล้วกดปุ่ม'),processing:tx('正在核对识别文字…','กำลังตรวจข้อความ…'),interim:tx('继续说…','พูดต่อ…')};
      if(texts[state])message.textContent=texts[state];
      else if(state!=='result'){
        const issue=voiceIssue(state,world);voiceState=state;media=null;
        message.textContent=issue.message;
        if(!message.textContent)message.textContent=tx('本次没有可用识别结果，可返回触控，不扣血。','ยังไม่มีผลรู้จำ กลับไปแตะเล่นได้ ไม่เสียพลัง');
        dialog.querySelector('[data-action=voice-stop]').disabled=true;
      }
    },
    onResult:text=>{
      if(token!==mediaEpoch||b!==owner)return;
      media=null;dialog.close();applyPause();
      // The modal paused the battle; award only after it is explicitly closed.
      const matched=matchSpeech(text,words(q.unit)).matched;
      if(awardRepeat(b,matched))status(tx('识别文字匹配：本回合节奏放慢。现在选择应对。','ข้อความตรงกัน จังหวะรอบนี้ช้าลง เลือกท่าได้เลย'));
      else status(tx('这次未确认到目标表达，可重试或直接触控，不扣血。','ยังยืนยันข้อความไม่ได้ ลองใหม่หรือแตะเล่นต่อ ไม่เสียพลัง'));
      stage?.setPose('listen');updateControls();
    }});
}
function resolve(id=null){
  const r=resolveAnswer(b,q,id);if(!r)return;
  resolvedMs=0;
  $('.answers').querySelectorAll('.choice').forEach(el=>{
    el.dataset.selected=String(el.dataset.unit===id);
    el.dataset.correct=String(el.dataset.unit===q.unit.id);
    el.dataset.wrong=String(el.dataset.unit===id&&!r.correct);
  });
  revealed=true;renderPrompt();
  const meaningNote=words(q.unit)+' = '+meaning(q.unit);
  let text=r.correct?tx('意思正确','เข้าใจถูกต้อง'):r.timedOut?tx('这次未出手，不判断为语言错误','รอบนี้ไม่ได้ออกท่า ไม่ถือว่าเข้าใจภาษาผิด'):tx('意思未对应','ความหมายยังไม่ตรง');
  if(r.correct)text+=' · '+tx(r.tactical==='counter'?'克制成功':r.tactical==='exposed'?'应对被克':'双方同势',r.tactical==='counter'?'ชนะทาง':r.tactical==='exposed'?'เสียเปรียบท่า':'ท่าเหมือนกัน')+' · '+tx(r.timing==='perfect'?'精准':r.timing==='good'?'良机':'普通时机',r.timing==='perfect'?'แม่นยำ':r.timing==='good'?'จังหวะดี':'จังหวะปกติ');
  status(text+' · '+meaningNote);
  if(r.correct){stage?.swing('hero',r.timing==='perfect',b.stance==='guard'?'guard':b.stance==='break'?'steady':'quick');stage?.hitText('−'+r.dealt,true);pendingRiposte=r.taken;}
  else {stage?.setPose(b.stance==='guard'?'guard':'hit');stage?.swing('enemy');stage?.hitText('−'+r.taken,false);}
  updateHealth();updateControls();
}
function finish(){
  const report=summary(b),previous=b,won=b.outcome==='win';cancelMedia();destroyStage();view='result';
  const remembered=[...new Map(report.records.map(r=>[r.unitId,r])).values()];
  setView(background()+'<header class="topbar">'+back()+'<div class="top-title"><p class="eyebrow">XULONG PASA / PLAYTEST 01</p><h1>'+tx('试玩回顾','สรุปการทดลอง')+'</h1></div></header>'+
    '<section class="result-copy"><h2>'+tx(won?'这次交锋，接住了。':'先记住，再来一次。',won?'รับจังหวะนี้ได้แล้ว':'จำไว้ แล้วลองอีกครั้ง')+'</h2><p>'+tx('这里只记录本次表现，不代表已经长期掌握，也不发放正式奖励。','บันทึกผลงานครั้งนี้เท่านั้น ไม่ใช่หลักฐานว่าจำได้ระยะยาว และไม่มีรางวัลเกมเดิม')+'</p><div class="result-stats"><span><b>'+report.correct+' / '+report.answered+'</b><small>'+tx('已作答中，意思正确','ตอบความหมายถูก / ที่ตอบ')+'</small></span><span><b>'+report.perfect+'</b><small>'+tx('理解正确且精准','เข้าใจถูกและแม่น')+'</small></span><span><b>'+report.timeouts+'</b><small>'+tx('未出手 · 不计语言错题','ไม่ได้ออกท่า · ไม่ใช่ตอบภาษาผิด')+'</small></span></div>'+
    '<div class="result-words">'+remembered.map(r=>'<span>'+esc(r.target)+' · '+esc(r.meaning)+'</span>').join('')+'</div><p>'+tx('对比重点：是听懂了但没抓住时机，还是还需要记住意思？','ลองแยกว่า เข้าใจแล้วแต่พลาดจังหวะ หรือยังต้องจำความหมาย')+'</p><div class="result-actions">'+btn('retry',tx('再试这一场','ลองสนามนี้อีกครั้ง'))+btn('menu',tx('切换陪练','เลือกคู่ฝึก'))+btn('export',tx('下载试玩记录','ดาวน์โหลดผลทดลอง'),'quiet')+'</div></section>','result-scene');
  b=previous;mountStage(opponent);if(won)stage?.perform(HERO_MOMENTS.cheer);syncPortrait();
}
function exportReport(){
  const blob=new Blob([JSON.stringify(summary(b),null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='XULONG-battle-lab-result.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function action(id){
  if(id==='dialog-close'){cancelMedia();dialog.close();applyPause();return;}
  if(id==='voice-consent'){networkConsent=true;dialog.close();applyPause();runRepeat();return;}
  if(id==='voice-stop'){stopVoice();return;}
  if(id==='menu'){if(view==='battle'&&b&&!b.outcome){pause();openDialog(tx('结束本次试玩？','จบการทดลองนี้?'),'<p>'+tx('本次临时成绩将清除；正式存档不会改变。','ผลชั่วคราวจะหาย เกมเดิมไม่เปลี่ยน')+'</p>',btn('quit-confirm',tx('结束试玩','จบการทดลอง'))+btn('keep-playing',tx('继续这场','เล่นรอบนี้ต่อ'),'quiet'));}else lobby();return;}
  if(id==='quit-confirm'){lobby();return;}
  if(id==='keep-playing'){dialog.close();userPaused=false;applyPause();return;}
  if(id.startsWith('world-')&&view==='lobby'){world=id.slice(6)==='cn'?'cn':'th';lobby();return;}
  if(id.startsWith('start-')&&view==='lobby'){start(id.slice(6));return;}
  if(id==='pause'){pause();return;}
  if(id==='resume'){userPaused=false;applyPause();status(tx('已继续。','เล่นต่อแล้ว'));return;}
  if(id==='retry'&&view==='result'){start(b.kind);return;}
  if(id==='export'&&view==='result'){exportReport();return;}
  if(!b||view!=='battle'||b.paused)return;
  if(id==='hear'){play(words(q.unit),world==='cn'?'zh':'th',true);return;}
  if(id==='reveal'&&b.phase==='prepare'&&!media){revealed=true;preparePrompt(b,true);renderPrompt();status(tx('文字辅助：选应对开始；本题会标记为辅助练习。','ใช้คำใบ้แล้ว เลือกท่าเพื่อเริ่ม รอบนี้บันทึกว่าใช้ตัวช่วย'));updateControls();return;}
  if(id==='repeat'){askRepeat();return;}
  if(id.startsWith('option-')){const unit=q.options.find(u=>u.id===id.slice(7));if(unit)play(meaning(unit),world==='cn'?'th':'zh');return;}
  if(id.startsWith('stance-')&&!media){
    const was=b.phase;if(chooseStance(b,id.slice(7))){stage?.setPose(b.stance==='guard'?'guard':'windup');lastFrame=performance.now();status(was==='prepare'?tx('交锋开始。绿色是良机，金色是精准；点正确意思出招。','เริ่มแล้ว เขียวคือจังหวะดี ทองคือแม่น แตะความหมายที่ถูก'):tx('已换势，消耗少量时机。','เปลี่ยนท่าแล้ว ใช้เวลาเล็กน้อย'));updateControls();}return;
  }
  if(id.startsWith('answer-')&&!media){resolve(id.slice(7));return;}
  if(id==='next'&&resolvedMs>=850){if(nextRound(b)){if(b.phase==='complete')finish();else renderRound();}return;}
}
root.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(el&&!el.disabled)action(el.dataset.action);});
dialog.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(el&&!el.disabled)action(el.dataset.action);});
dialog.addEventListener('cancel',()=>cancelMedia());dialog.addEventListener('close',()=>applyPause());
root.addEventListener('change',e=>{if(e.target.dataset.setting==='relaxed')relaxed=e.target.checked;if(e.target.dataset.setting==='motion'){motion=e.target.checked;stage?.setMotion(motion);}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&view==='battle'&&!dialog.open){e.preventDefault();if(userPaused){userPaused=false;applyPause();}else pause();}});
document.addEventListener('visibilitychange',()=>{hiddenPaused=document.hidden;if(hiddenPaused){cancelMedia();if(b)userPaused=true;}applyPause();});
window.addEventListener('resize',syncPortrait);
window.addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(frameId);cancelMedia();destroyStage();});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
function tick(now){
  if(disposed)return;const dt=now-lastFrame;lastFrame=now;
  if(b&&view==='battle'&&!b.paused&&!media){
    if(b.phase==='active'){if(advance(b,dt))resolve();updateControls();}
    else if(b.phase==='resolved'){resolvedMs+=dt;if(pendingRiposte&&resolvedMs>=400){stage?.swing('enemy');stage?.hitText('−'+pendingRiposte,false);pendingRiposte=0;}updateControls();}
  }
  frameId=requestAnimationFrame(tick);
}
// Read-only diagnostic snapshot: no state mutation or developer-only win button.
Object.defineProperty(window,'__battleLab',{get:()=>({version:LAB_VERSION,view,world,phase:b?.phase,paused:b?.paused,progress:b?progress(b):0,round:b?.round,hero:b?.hero,hp:b?.hp,enemyHp:b?.enemyHp,media,voiceState,artWarning,summary:b?summary(b):null})});
lobby();frameId=requestAnimationFrame(tick);
