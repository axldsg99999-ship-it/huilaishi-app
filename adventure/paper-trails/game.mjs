import { SAVE_KEY, clamp, rng, shuffle, rps, SLING, launch, pullPoint, slingTension, ballistic, segmentCircle, solveAim, starsFor, cleanSave, mergeReward, memoryPattern, orderedIds } from './core.mjs?v=draw3';
import { WORDS, SENTENCES, LEVELS, COPY } from './content.mjs';
import { loadArt } from './art.mjs?v=feel1';
import { paintWorld } from './render.mjs?v=feel1';
import { Sound } from './audio.mjs?v=feel1';
import { ResponseEffects, RESPONSE, awardPoints, feedbackHold, rewardStatus } from './response.mjs?v=feel1';
import { rewardMarkup } from './rewards.mjs?v=feel1';
import { SLING_COPY, chargeMarkup, updateCharge } from './sling-feedback.mjs?v=draw3';
import { slingExpression,faceKey } from './expressions.mjs?v=draw3';

const $ = id => document.getElementById(id);
const stage=$('stage'), canvas=$('world'), ctx=canvas.getContext('2d',{alpha:false});
const params=new URLSearchParams(location.search), random=rng(Number(params.get('seed'))||Date.now());
let save;try{save=cleanSave(JSON.parse(localStorage.getItem(SAVE_KEY)||'null'));}catch{save=cleanSave(null);}
if(params.get('lang'))save.locale=params.get('lang')==='th'?'th':'zh';
const systemReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let locale=save.locale, art={}, run=null, clock=0, paused=false, modal=null, token=0, jobs=[], pointer=null, keys=new Set(), focusBefore=null;
let mouse={x:640,y:360}, scale=1, last=performance.now(), lastAmbient=0, frame=0;
const fx=new ResponseEffects();fx.reduced=save.reduced||systemReduced;
const C=()=>COPY[locale], source=()=>locale==='zh'?'th':'zh', text=(pair)=>pair[locale==='zh'?0:1];
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const paths={back:'M18 5 7 16l11 11',arrow:'M5 16h22M17 6l10 10-10 10',pause:'M11 6v20M21 6v20',speaker:'M5 12h5l7-6v20l-7-6H5zM22 11q6 5 0 10M25 6q11 10 0 20',book:'M16 7Q8 2 3 5v22q7-3 13 1q6-4 13-1V5q-6-3-13 2v21',replay:'M6 12A11 11 0 1 1 5 21M6 4v8h8',gear:'M16 3l3 4 5 1 1 5 4 3-4 3-1 5-5 1-3 4-3-4-5-1-1-5-4-3 4-3 1-5 5-1zM21 16a5 5 0 1 1-10 0a5 5 0 1 1 10 0',check:'M5 16l7 7L27 7',close:'M7 7l18 18M25 7 7 25',star:'m16 3 4 9 10 1-8 7 2 10-8-5-8 5 2-10-8-7 10-1z',rock:'M7 26 4 16l3-5 5 1 1-8h4l2 9 4-3 5 4-1 12z',paper:'M8 27 5 14l3-2 4 6V5l3-1 2 13V3l3 1 1 14 1-12 3 1v13l2-7 3 1-3 13z',scissors:'M10 26 6 19l2-6 6 4L8 4l3-2 7 13 5-12 3 2-5 16-2 5z'};
function icon(name){return '<svg class="icon" viewBox="0 0 32 32" aria-hidden="true"><path d="'+(paths[name]||paths.star)+'"/></svg>';}
function button(action,label,cls='text-btn',extra=''){return '<button type="button" class="'+cls+'" data-action="'+action+'" '+extra+'>'+label+'</button>';}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch{ /* Game remains playable with memory-only progress. */ }}
function later(delay,fn){jobs.push({at:clock+delay,token,fn});}
function nextFrame(delay=.2){return new Promise(resolve=>later(delay,resolve));}
const sound=new Sound(status=>{if(run)run.speaking=status==='playing';document.querySelectorAll('.speak-button').forEach(b=>b.classList.toggle('playing',status==='playing'));if(status==='error'){$('audio-status').textContent=C().audioFail;$('audio-status').classList.add('show');}else if(status==='playing')$('audio-status').classList.remove('show');});
sound.enabled=save.effects;
function resetTimers(){cancelDraw(false);token++;jobs=[];sound.stop();fx.clear();keys.clear();releasePointer();}
function setPhase(p){if(run)run.phase=p;stage.dataset.phase=p;}
function refreshLanguage(){document.documentElement.lang=locale==='th'?'th':'zh-CN';stage.lang=locale;stage.classList.toggle('reduced',fx.reduced);$('rotate').querySelector('h1').textContent=C().rotate;$('rotate').querySelector('p').textContent=C().rotateSmall;}
function resize(){scale=Math.min(innerWidth/1280,innerHeight/720);stage.style.setProperty('--scale',String(scale));const resolution=Math.min(devicePixelRatio||1,2)*Math.min(1,Math.max(.65,scale));canvas.width=Math.round(1280*resolution);canvas.height=Math.round(720*resolution);ctx.setTransform(resolution,0,0,resolution,0,0);stage.inert=innerHeight>innerWidth;if(innerHeight>innerWidth&&run&&!modal)openPause();}
function header(){
 const l=run&&LEVELS[run.index];
 $('header').innerHTML=(run?button('pause','<img src="./assets/'+(locale==='th'?'girl-avatar':'hero-avatar')+'.webp" alt=""><span class="pause-mark">Ⅱ</span>','avatar-btn','aria-label="'+esc(C().pause)+'"'): '<div><div class="brand">XULONG <i>pasa</i></div><div class="brand-tag">'+C().brand+'</div></div>')+
 (l?'<div class="chapter-header"><small>CHAPTER 0'+(run.index+1)+' / 06</small><h2>'+esc(l[locale])+'</h2><p>'+esc(text(l.type))+'</p></div>':'')+
 '<div class="header-right">'+(!run?button('locale',locale==='zh'?C().learnThai:C().learnChinese,'locale-btn'):'')+button('notebook',icon('book'),'round-btn','aria-label="'+C().notebook+'"')+button('settings',icon('gear'),'round-btn','aria-label="'+C().settings+'"')+'</div>';
}
function home(){resetTimers();run=null;paused=false;hideModal();stage.classList.remove('night');stage.dataset.mode='home';setPhase('home');$('play').hidden=true;$('home').hidden=false;$('feedback').className='';$('audio-status').className='';refreshLanguage();header();const completed=Object.keys(save.levels).length;
 $('home').innerHTML='<div class="home-copy"><span class="eyebrow">PAPER TRAILS · 纸上六程</span><h1>'+C().title.replace(locale==='zh'?'，':' ',locale==='zh'?'，<br>':'<br>')+'</h1><p>'+C().subtitle+'</p></div><nav class="route" aria-label="'+C().home+'">'+LEVELS.map((l,i)=>'<button class="route-node '+(!save.levels[i]&&Object.keys(save.levels).length===i?'selected':'')+'" data-action="level" data-index="'+i+'"><span class="number">0'+(i+1)+'</span><span class="route-image"><img src="./assets/'+l.scene+'.webp" alt=""><img class="route-creature" src="./assets/'+['swallow','mantis','elephant','rabbit','dog-paw','squirrel'][i]+'.webp" alt=""></span><strong>'+esc(l[locale])+'</strong><small>'+esc(text(l.type))+'</small>'+(save.levels[i]?'<span class="stars">'+'✦'.repeat(save.levels[i].stars)+'</span>':'')+'</button>').join('')+'</nav><p class="home-foot">'+C().independent+'</p><div class="home-count">'+icon('star')+' '+completed+' / 6 '+C().collected+'</div>';
}
function showModal(html,kind){focusBefore=document.activeElement;cancelDraw();modal=kind;paused=true;keys.clear();releasePointer();sound.stop();$('overlay').innerHTML=html;$('overlay').hidden=false;$('header').inert=true;$('home').inert=true;$('play').inert=true;requestAnimationFrame(()=>$('overlay').querySelector('button')?.focus());}
function hideModal(){modal=null;paused=false;$('overlay').hidden=true;$('overlay').innerHTML='';$('header').inert=false;$('home').inert=false;$('play').inert=false;if(focusBefore?.isConnected)focusBefore.focus({preventScroll:true});}
function vocabulary(entry){return button('vocab',icon('speaker')+'<span>'+esc(entry[source()])+'</span><small>'+esc(entry[locale])+'</small>','', 'data-word="'+entry.id+'"');}
function intro(i){
 resetTimers();const l=LEVELS[i];run={index:i,mode:l.id,scene:l.scene,phase:'intro',clock:0,score:0,errors:0,assists:0,combo:0,maxCombo:0,lives:4,cleared:0,round:0,finished:false,speaking:false,selected:0,used:new Set(),targets:[],lamps:WORDS.slice(0,3),items:[],dogX:640,history:[],helper:false,ready:false,lit:-1};
 stage.dataset.mode=l.id;stage.classList.toggle('night',i===5);$('home').hidden=true;$('play').hidden=false;$('controls').innerHTML='';$('tools').innerHTML='';$('hint').textContent='';$('feedback').className='';$('audio-status').className='';header();hud();
 const vocab=i===1?WORDS.slice(3,6):WORDS.slice(0,3);const creature=['swallow','mantis','elephant','rabbit','dog','squirrel'][i];
 showModal('<article class="sheet" role="dialog" aria-modal="true" aria-labelledby="intro-title">'+button('home',icon('close'),'close','aria-label="'+C().leave+'"')+'<span class="eyebrow">CHAPTER 0'+(i+1)+' · '+text(l.type)+'</span><h2 id="intro-title">'+esc(l[locale])+'</h2><p>'+esc(text(l.desc))+'</p><div class="intro-layout"><img class="intro-art" src="./assets/'+creature+'.webp" alt=""><div><p class="intro-steps">'+esc(text(l.hint))+'</p><div class="mini-vocab">'+vocab.map(vocabulary).join('')+'</div></div></div><p class="intro-note">'+C().independent+'</p><div class="actions">'+button('start',C().play+icon('arrow'),'primary')+'</div></article>','intro');
}
function start(){if(!run)return;hideModal();clock=0;run.clock=0;sound.unlock();sound.fx('select');initRound(true);}
function hud(event=''){if(!run)return;const r=run,l=LEVELS[r.index];$('meter').innerHTML='<span class="hearts '+(event==='loss'?'heart-lost':'')+'" aria-label="'+r.lives+'">'+'✦'.repeat(r.lives)+'<span style="opacity:.24">'+'✦'.repeat(4-r.lives)+'</span></span><span class="meter-score '+(event==='gain'?'scored':'')+'">'+(event==='gain'?r.score-r.lastGain:r.score)+'</span>'+(r.combo>1?'<span class="streak">'+C().combo+' ×'+r.combo+'</span>':'');$('objective').innerHTML='<span>'+r.cleared+' / '+l.goal+'</span>'+Array.from({length:l.goal},(_,i)=>'<i class="progress-petal '+(i<r.cleared?'full':'')+(event==='gain'&&i===r.cleared-1?' new-petal':'')+'"></i>').join('');}
function initRound(first=false){
 if(!run||run.finished)return;const r=run;r.helper=false;r.ready=false;r.revealed=null;r.hitAt=null;r.lit=-1;r.allLit=false;r.chosen=null;$('feedback').className='';$('audio-status').className='';
 if(r.mode==='sling'){
  if(first){r.ammo=shuffle(WORDS.slice(0,3),random);r.targets=shuffle(WORDS.slice(0,3),random).map((word,i)=>({word,x:[752,942,1114][i],y:[423,333,426][i],monster:['elephant','mantis','bear'][i],done:false}));r.heard=new Set();r.used=new Set();r.selected=0;}else r.selected=[0,1,2].find(i=>!r.used.has(i));
  r.pull=null;r.projectile=null;r.trail=[];r.dragging=false;r.releaseAt=null;r.chargeStep=0;r.reaction=null;setPhase('ready');controls();
 }else if(r.mode==='duel'){
  r.enemyMove=Math.floor(random()*3);r.word=WORDS[3+r.enemyMove];setPhase('ready');controls();later(.25,listen);
 }else if(r.mode==='echo'){
  if(first)r.questions=shuffle([0,1,2,6,7,8],random).slice(0,4).map(i=>WORDS[i]);r.word=r.questions[r.round];r.options=shuffle([r.word,...shuffle(WORDS.filter(w=>![3,4,5].includes(WORDS.indexOf(w))&&w.id!==r.word.id),random).slice(0,2)],random);setPhase('ready');controls();later(.25,listen);
 }else if(r.mode==='bridge'){
  r.sentence=SENTENCES[r.round];r.tiles=shuffle(r.sentence.chunks[source()].map((word,id)=>({word,id})),random);r.placed=[];r.walk=0;r.walkTo=0;setPhase('ready');controls();later(.25,listen);
 }else if(r.mode==='courier'){
  r.word=WORDS[Math.floor(random()*3)];r.items=[];r.dogX=640;r.dogTarget=640;r.ready=false;setPhase('ready');controls();later(.25,listen);
 }else if(r.mode==='memory'){
  r.lamps=shuffle(WORDS.slice(0,3),random);r.pattern=memoryPattern(2+r.round,random);r.entered=[];r.seqToken=(r.seqToken||0)+1;setPhase('ready');controls();later(.4,sequence);
 }
 hud();
}
function currentWord(){return run?.mode==='sling'?run.ammo[run.selected]:run?.mode==='bridge'?run.sentence:run?.word;}
async function listen(){
 const r=run;if(!r||r.finished||paused||r.phase==='flight'||r.phase==='feedback'||r.phase==='catching')return;
 if(r.mode==='memory'){sequence();return;}const word=currentWord();if(!word)return;
 const epoch=token,selected=r.selected;r.listenTicket=(r.listenTicket||0)+1;const ticket=r.listenTicket;
 const oldPhase=r.phase;setPhase('listening');controls();const ok=await sound.word(word.id,source());
 if(run!==r||token!==epoch||ticket!==r.listenTicket)return;
 if(ok){r.ready=true;if(r.mode==='sling')r.heard.add(selected);}
 if(r.phase==='listening')setPhase(oldPhase==='aim'?'aim':'ready');controls();
}
function tools(speaker=true){const r=run;let html='';if(speaker)html+=button('listen',icon('speaker')+'<span>'+C().listen+'</span>','speak-button'+(sound.playing?' playing':''),'aria-label="'+C().listen+'"');html+='<div class="toolbar">'+button('helper',C().helper)+'</div>';if(r.helper&&currentWord()){const w=currentWord();html+='<div class="word-help" lang="'+source()+'">'+esc(w[source()])+(w.roman?'<small>'+esc(source()==='th'?w.roman:w.pinyin)+'</small>':'')+'</div>';}return html;}
function controls(){
 if(!run)return;const r=run,busy=['feedback','flight','sequence','listening'].includes(r.phase);let html='',tool='',hint=text(LEVELS[r.index].hint);
 if(r.mode==='sling'){
  html='<div class="companions" aria-label="'+C().choose+'">'+r.ammo.map((w,i)=>'<button data-action="animal" data-index="'+i+'" class="companion '+(r.selected===i?'selected ':'')+(r.used.has(i)?'done':'')+'" '+(r.used.has(i)||r.phase==='flight'||r.phase==='feedback'?'disabled':'')+' aria-label="'+['纸鸢燕','月灯兔','织霞松鼠'][i]+' · '+C().listen+'"><img src="./assets/'+['swallow','rabbit','squirrel'][i]+'.webp" alt="">'+icon('speaker')+'<span lang="'+source()+'">'+(r.heard.has(i)?esc(w[source()]):'· · ·')+'</span></button>').join('')+'</div>';
  html+=r.targets.map((tg,i)=>tg.done?'':'<button class="aim-target" style="left:'+(tg.x-67)+'px;top:'+(tg.y-70)+'px" data-action="aim" data-index="'+i+'" aria-label="'+C().targets+' '+esc(tg.word[locale])+'" '+(busy?'disabled':'')+'><span class="target-name">'+esc(tg.word[locale])+'</span></button>').join('');
  html+=chargeMarkup(locale);
  if(r.pull&&!r.dragging)html+=button('fire',C().fire+icon('arrow'),'fire-btn',!r.heard.has(r.selected)||busy?'disabled':'')+button('cancelDraw',SLING_COPY[locale].cancel,'sling-cancel text-btn');
  tool='<div class="toolbar">'+button('helper',C().helper)+button('aimHelp',icon('star'),'round-btn','aria-label="'+C().guided+'" title="'+C().guided+'"')+'</div>';hint=r.phase==='aim'?SLING_COPY[locale].drag:!r.heard.has(r.selected)?C().lock:text(LEVELS[0].hint);
 }else if(r.mode==='duel'){
  html='<div class="rps-choices">'+WORDS.slice(3,6).map((w,i)=>button('gesture','<img src="./assets/gesture-'+w.id+'.webp" alt="">'+'<strong>'+esc(w[locale])+'</strong><small>'+esc(w[source()])+'</small>','gesture','data-index="'+i+'" '+(busy||!r.ready?'disabled':''))).join('')+'</div>';tool=tools();hint='';html+='<p class="gesture-rule">'+text(LEVELS[1].hint)+'</p>';
 }else if(r.mode==='echo'){
  const pos=[[48,235],[269,165],[403,325]];html=r.options.map((w,i)=>button('answer',esc(w[locale]),'thought'+(r.phase==='feedback'?(w.id===r.word.id?' answer-correct':i===r.chosen?' answer-wrong':' answer-quiet'):''),'style="left:'+pos[i][0]+'px;top:'+pos[i][1]+'px" data-index="'+i+'" '+(busy||!r.ready?'disabled':''))).join('');tool=tools();
 }else if(r.mode==='bridge'){
  html='<div class="bridge-translation">'+esc(r.sentence[locale])+'</div><div class="centre-tools">'+button('listen',icon('speaker')+C().listen)+'</div><div class="bridge-slots">'+Array.from({length:3},(_,i)=>'<button class="bridge-slot '+(r.placed[i]!=null?'full':'')+'" data-action="slot" data-index="'+i+'" aria-label="'+(i+1)+'" '+(busy?'disabled':'')+'>'+ (r.placed[i]!=null?esc(r.sentence.chunks[source()][r.placed[i]]):'·')+'</button>').join('')+'</div><div class="bridge-tray">'+r.tiles.map(w=>button('tile',esc(w.word),'word-tile','data-id="'+w.id+'" '+(r.placed.includes(w.id)||busy?'disabled':'')+' draggable="true"')).join('')+'</div><div class="bridge-actions">'+button('undo',icon('back'),'text-btn','aria-label="'+C().undo+'" '+(busy?'disabled':''))+button('checkSentence',C().send,'primary',r.placed.length!==3||busy?'disabled':'')+'</div>';tool='';
 }else if(r.mode==='courier'){
  html='<div class="catch-target">'+(r.helper?esc(r.word[source()])+' · '+esc(r.word[locale]):C().catchReady)+'</div><div class="catch-replay">'+button('listen',icon('speaker')+C().listen,'text-btn',r.phase==='catching'?'disabled':'')+'</div><div class="dog-control">'+button('left',icon('back'),'','aria-label="向左 / ซ้าย"')+button('right',icon('arrow'),'','aria-label="向右 / ขวา"')+'</div>';
  if(r.phase==='ready'||r.phase==='listening')html+='<div class="catch-start">'+button('catchStart',C().ready+icon('arrow'),'primary',!r.ready||busy?'disabled':'')+'</div>';tool='<div class="toolbar">'+button('helper',C().helper)+'</div>';
 }else if(r.mode==='memory'){
  html='<div class="memory-caption">'+(r.phase==='sequence'?C().remember:C().yourTurn)+'</div><div class="sequence-progress">'+r.pattern.map((_,i)=>'<i class="'+(i<r.entered.length?'full':'')+'"></i>').join('')+'</div>'+r.lamps.map((w,i)=>button('lamp','<strong>'+esc(w[locale])+'</strong>','lantern-hit','style="left:'+(308+i*238)+'px" data-index="'+i+'" '+(r.phase!=='ready'||!r.ready?'disabled':''))).join('')+'<div class="memory-tools">'+button('sequence',icon('speaker')+C().replaySequence,'text-btn',r.phase==='feedback'?'disabled':'')+'</div>';tool='';
 }
 if(r.mode==='bridge')tool='<div class="toolbar">'+button('helper',C().helper)+'</div>'+(r.helper?'<div class="bridge-help">'+esc(r.sentence[source()])+'</div>':'');
 if(r.mode==='memory'){tool='<div class="toolbar">'+button('helper',C().helper)+'</div>';if(r.helper)html+='<div class="memory-help" lang="'+source()+'">'+r.pattern.map(i=>esc(r.lamps[i][source()])).join(' → ')+'</div>';}
 $('controls').innerHTML=html;$('tools').innerHTML=tool;$('hint').textContent=hint;stage.dataset.phase=r.phase;stage.classList.toggle('sling-dragging',!!r.dragging);updateCharge(stage,r,locale);
}
function feedback(title,detail,good=true){$('feedback').innerHTML='<strong>'+esc(title)+'</strong>'+(detail?'<small>'+detail+'</small>':'');$('feedback').className='visible'+(good?'':' bad');}
function wordDetail(w){return '<b>'+esc(w[source()])+'</b> · '+esc(w[locale]);}
function pulse(x,y,power=1){fx.burst(x,y,power,run?.index||0);if(!fx.reduced&&navigator.vibrate)navigator.vibrate(22);}
function winPoint(word,x=990,y=407,detail=''){
 const r=run;r.combo++;r.maxCombo=Math.max(r.maxCombo,r.combo);r.lastGain=awardPoints(r.combo);r.score+=r.lastGain;r.scoreAt=r.clock;r.castUntil=r.clock+1.25;r.hitAt=r.clock;r.response={good:true,at:r.clock,x,y};r.history.push(word);
 fx.success(r.mode,x,y,r.lastGain,r.combo,locale);if(r.mode==='duel')fx.sweep(298,413,x,y);if(r.mode==='echo')fx.link(335,380,x,y,'#6a9180');
 sound.reward(r.mode,r.combo);tactile([18,35,12]);feedback(RESPONSE[r.mode][locale],detail||wordDetail(word),true);hud('gain');
}
function failPoint(word,detail,title=C().wrong){const r=run;r.errors++;r.lives=Math.max(0,r.lives-1);r.combo=0;r.enemyCastUntil=r.clock+.9;r.response={good:false,at:r.clock};sound.fx('wrong');if(r.mode==='duel')fx.sweep(979,411,310,454,'#b27361');fx.shake=fx.reduced?0:.12;feedback(title,detail||wordDetail(word),false);hud('loss');}
async function concludeFeedback(word,fn,good=true){const r=run,epoch=token,began=clock;setPhase('feedback');controls();
 // Let the impact read first. Speech and the visual hold then overlap rather than stack.
 await nextFrame(good?.28:.15);if(run!==r||token!==epoch||r.finished)return;if(word)await sound.word(word.id,source());
 if(run!==r||token!==epoch||r.finished)return;later(Math.max(.12,feedbackHold(r.mode,good)-(clock-began)),()=>{if(r.lives<=0)finish(false);else fn();});}
function finish(won){
 if(!run||run.finished)return;const r=run;r.finished=true;setPhase('finished');sound.stop();keys.clear();pointer=null;const stars=starsFor(r.errors,r.assists);
 const status=rewardStatus(save.levels[r.index],{stars,score:r.score});r.rewardStatus=won?status:null;
 if(won){save=mergeReward(save,r.index,{stars,score:r.score});persist();sound.fx('win');fx.burst(640,440,.75,r.index);r.response={good:true,at:r.clock};}
 const unique=[...new Map(r.history.filter(Boolean).map(w=>[w.id,w])).values()].slice(0,4);
 later(.65,()=>showModal(rewardMarkup({run:r,won,stars,status,levels:LEVELS,save,locale,copy:C(),esc,button,icon,vocabulary,words:unique}),'result'));
}

function releasePointer(){const id=pointer;pointer=null;if(id!=null&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}
function tactile(ms){if(save.effects&&!fx.reduced)try{navigator.vibrate?.(ms);}catch{}}
function cancelDraw(refresh=true,cue=false){
 sound.stopTension();releasePointer();stage.classList.remove('sling-dragging');
 if(run?.mode!=='sling'||!run.pull)return;
 run.pull=null;run.dragging=false;run.chargeStep=0;if(run.phase==='aim')setPhase('ready');
 if(cue)sound.fx('unstring');if(refresh)controls();
}
function setDraw(p){
 const r=run;r.pull=pullPoint(p);const v=slingTension(r.pull);
 if(r.dragging)sound.tension(v.ratio);
 if(v.band>(r.chargeStep||0)){
  r.chargeStep=v.band;
  sound.fx(v.band===3?'fullDraw':'tensionStep',v.band);tactile(v.band===3?18:7);
 }
 updateCharge(stage,r,locale);
}
function chooseAnimal(i){const r=run;if(!r||r.mode!=='sling'||r.used.has(i)||['flight','feedback'].includes(r.phase))return;cancelDraw(false);r.selected=i;r.pull=null;r.ready=r.heard.has(i);setPhase('ready');sound.fx('select');controls();listen();}
function assistedAim(i){const r=run;if(!r||r.mode!=='sling'||!r.heard.has(r.selected)||['flight','feedback','listening'].includes(r.phase))return;const target=r.targets[i];if(!target||target.done)return;const best=solveAim(target,r.targets);
 if(best){cancelDraw(false);r.pull=best;r.dragging=false;setPhase('aim');if(!r.aimAssist){r.assists++;r.aimAssist=true;}controls();sound.fx('select');}
}
function fire(){
 const r=run;if(!r||r.mode!=='sling'||!r.heard.has(r.selected)||!r.pull||r.phase!=='aim')return;
 const strength=slingTension(r.pull);if(!strength.canFire){cancelDraw(true,true);return;}
 releasePointer();sound.stop();r.shotPower=strength.ratio;r.releasePull={...r.pull};r.releaseAt=r.clock;
 r.projectile=launch(r.pull);r.pull=null;r.dragging=false;r.trail=[];r.castUntil=r.clock+.7;setPhase('flight');
 fx.release(SLING.x,SLING.y,strength.ratio);sound.fx('launch',strength.ratio);tactile(9+Math.round(strength.ratio*14));controls();
}
function slingImpact(target){const r=run;r.projectile=null;r.trail=[];const w=r.ammo[r.selected];target.hitAt=r.clock;
 r.reaction=w.id===target.word.id?'happy':'oops';r.reactionAt=r.clock;
 if(w.id===target.word.id){target.done=true;target.clearedAt=r.clock;r.used.add(r.selected);r.cleared++;winPoint(w,target.x,target.y);concludeFeedback(w,()=>r.cleared===3?finish(true):initRound(),true);}
 else{failPoint(w,wordDetail(w)+'<br>'+ (locale==='zh'?'这位守信者需要：':'ผู้พิทักษ์นี้ต้องการ: ')+esc(target.word[locale]));concludeFeedback(w,()=>{r.pull=null;setPhase('ready');$('feedback').className='';controls();},false);}
}
function slingMiss(){const r=run;r.projectile=null;r.trail=[];r.reaction='oops';r.reactionAt=r.clock;sound.fx('miss');feedback(C().miss,C().missSub,false);setPhase('feedback');controls();later(1.45,()=>{setPhase('ready');$('feedback').className='';controls();});}
function gesture(i){const r=run;if(!r||r.mode!=='duel'||r.phase!=='ready'||!r.ready)return;const enemy=r.enemyMove,outcome=rps(i,enemy);r.revealed=enemy;r.ready=false;setPhase('feedback');
 const player=WORDS[3+i],opponent=WORDS[3+enemy];const detail=wordDetail(opponent)+'<br>'+esc(player[locale])+' '+(outcome===0?'＝':outcome>0?'＞':'＜')+' '+esc(opponent[locale]);
 if(outcome>0){r.cleared++;r.round++;winPoint(opponent,1000,405,detail);}
 else if(outcome<0){failPoint(opponent,detail,C().lose);}
 else{sound.fx('select');feedback(C().draw,detail);}
 concludeFeedback(opponent,()=>r.cleared===3?finish(true):initRound(),outcome>=0);
}
function answer(i){const r=run;if(!r||r.mode!=='echo'||r.phase!=='ready'||!r.ready)return;const ok=r.options[i].id===r.word.id;r.chosen=i;r.ready=false;setPhase('feedback');
 if(ok){r.cleared++;r.round++;winPoint(r.word);}else failPoint(r.word);
 concludeFeedback(r.word,()=>r.cleared===4?finish(true):ok?initRound():(r.ready=true,setPhase('ready'),$('feedback').className='',controls()),ok);
}
function tile(id){const r=run;if(!r||r.mode!=='bridge'||r.phase==='feedback'||r.phase==='listening'||r.placed.includes(id)||r.placed.length>=3)return;r.placed.push(id);sound.fx('step');controls();}
function undo(slot){const r=run;if(!r||r.mode!=='bridge'||r.phase==='feedback')return;if(slot!=null)r.placed.splice(slot,1);else r.placed.pop();controls();sound.fx('select');}
function checkSentence(){const r=run;if(!r||r.mode!=='bridge'||r.phase!=='ready'||r.placed.length!==3)return;const ok=orderedIds(r.placed,[0,1,2]);
 if(ok){r.cleared++;r.round++;winPoint(r.sentence,815,427);r.walkTo=1;}else failPoint(r.sentence);
 concludeFeedback(r.sentence,()=>{if(r.cleared===3)finish(true);else if(ok)initRound();else{r.placed=[];setPhase('ready');$('feedback').className='';controls();}},ok);
}
function spawnParcels(){const r=run;if(!r||r.mode!=='courier'||!r.ready)return;const order=shuffle([0,1,2],random),xs=shuffle([427,672,905],random);r.items=order.map((id,i)=>({word:WORDS[id],x:xs[i],y:174-i*76,lane:i,vy:72+r.cleared*10,gone:false}));setPhase('catching');controls();}
function parcelCollision(item){const r=run;item.gone=true;r.catchUntil=r.clock+.6;
 const ok=item.word.id===r.word.id;
 if(ok){r.cleared++;r.round++;winPoint(r.word,item.x,item.y);concludeFeedback(r.word,()=>r.cleared===4?finish(true):initRound());}
 else{failPoint(r.word,(locale==='zh'?'这次要接住：':'ครั้งนี้ต้องรับ: ')+wordDetail(r.word));concludeFeedback(r.word,()=>{setPhase('catching');$('feedback').className='';controls();},false);}
}
async function sequence(){
 const r=run;if(!r||r.mode!=='memory'||r.finished||paused||r.phase==='feedback')return;const epoch=token,ticket=++r.seqToken;r.entered=[];r.ready=false;r.lit=-1;r.helper=false;setPhase('sequence');controls();
 for(const i of r.pattern){if(run!==r||epoch!==token||ticket!==r.seqToken||paused)return;const ok=await sound.word(r.lamps[i].id,source());if(run!==r||epoch!==token||ticket!==r.seqToken||paused)return;if(!ok){setPhase('ready');controls();return;}await nextFrame(.28);}
 if(run!==r||epoch!==token||ticket!==r.seqToken||paused)return;r.ready=true;setPhase('ready');controls();sound.fx('select');
}
function lamp(i){const r=run;if(!r||r.mode!=='memory'||r.phase!=='ready'||!r.ready)return;r.lit=i;sound.fx('lamp',i);const n=r.entered.length;r.entered.push(i);later(.35,()=>{r.lit=-1;});
 if(i===r.pattern[n]&&n>0)fx.link(403+r.pattern[n-1]*238,356,403+i*238,356);
 if(i!==r.pattern[n]){r.ready=false;failPoint(r.lamps[r.pattern[n]],wordDetail(r.lamps[r.pattern[n]]),C().sequenceWrong);concludeFeedback(r.lamps[r.pattern[n]],()=>{setPhase('ready');$('feedback').className='';sequence();},false);}
 else if(r.entered.length===r.pattern.length){r.cleared++;r.round++;r.allLit=true;winPoint(r.lamps[i],640,353);concludeFeedback(r.lamps[i],()=>r.cleared===3?finish(true):initRound());}
 else {tactile(9);controls();}
}
function helper(){const r=run;if(!r||['flight','feedback','catching'].includes(r.phase))return;if(!r.helper){r.assists++;r.helper=true;}
 cancelDraw(false);
 sound.stop();$('audio-status').className='';r.ready=true;if(r.mode==='sling')r.heard.add(r.selected);if(r.mode==='memory'){r.seqToken++;r.entered=[];}setPhase('ready');controls();
 if(r.mode==='memory')$('controls').querySelector('.memory-caption').textContent=C().yourTurn;
}
function openPause(){if(!run||modal)return;if(run.mode==='memory'&&run.phase==='sequence'){run.seqToken++;run.repeatSequence=true;}
 showModal('<article class="sheet pause-sheet" role="dialog" aria-modal="true" aria-labelledby="pause-title"><span class="eyebrow">TAKE A BREATH</span><h2 id="pause-title">'+C().pause+'</h2><div class="actions">'+button('resume',C().resume+icon('arrow'),'primary')+button('restart',C().restart)+button('home',C().leave)+'</div></article>','pause');
}
function resume(){const repeat=run?.repeatSequence;hideModal();last=performance.now();if(repeat){run.repeatSequence=false;setPhase('ready');sequence();}else controls();}
function settings(){if(run?.mode==='memory'&&run.phase==='sequence'){run.seqToken++;run.repeatSequence=true;}showModal('<article class="sheet pause-sheet" role="dialog" aria-modal="true" aria-labelledby="settings-title">'+button('closeModal',icon('close'),'close','aria-label="关闭 / ปิด"')+'<h2 id="settings-title">'+C().settings+'</h2><div class="settings-list"><label class="setting">'+C().effects+'<input type="checkbox" data-setting="effects" '+(save.effects?'checked':'')+'></label><label class="setting">'+C().motion+'<input type="checkbox" data-setting="motion" '+(save.reduced?'checked':'')+'></label><div class="setting">'+C().language+button('locale',locale==='zh'?C().learnThai:C().learnChinese,'text-btn',run?'disabled':'')+'</div></div><div class="actions">'+button('closeModal',C().resume,'primary')+'</div></article>','settings');}
function notebook(){if(run?.mode==='memory'&&run.phase==='sequence'){run.seqToken++;run.repeatSequence=true;}showModal('<article class="sheet" role="dialog" aria-modal="true" aria-labelledby="notebook-title">'+button('closeModal',icon('close'),'close','aria-label="关闭 / ปิด"')+'<span class="eyebrow">A LETTER BETWEEN WORLDS</span><h2 id="notebook-title">'+C().notebook+'</h2><p>'+C().completeNote+'</p><div class="settings-list">'+LEVELS.map((l,i)=>'<div class="setting"><span>0'+(i+1)+' · '+esc(text(l.reward))+'</span><span style="color:#a66044">'+(save.levels[i]?'✦'.repeat(save.levels[i].stars):'—')+'</span></div>').join('')+'</div><div class="actions">'+button('closeModal',C().resume,'primary')+'</div></article>','notebook');}
function finale(){if(Object.keys(save.levels).length<6){home();return;}showModal('<article class="sheet finale-sheet" role="dialog" aria-modal="true" aria-labelledby="finale-title"><img class="finale-art" src="./assets/memory.webp" alt="两位主角与小狗在河岸分享一封信"><div class="finale-copy"><span class="eyebrow">SIX SEALS · ONE LETTER</span><h2 id="finale-title">'+C().finale+'</h2><p>'+C().finaleSub+'</p><div class="actions">'+button('home',C().home+icon('arrow'),'primary')+'</div></div></article>','finale');}
function closeModal(){if(run?.finished){home();return;}if(run)resume();else{hideModal();home();}}
stage.addEventListener('click',event=>{
 const b=event.target.closest('button[data-action]');if(!b||b.disabled)return;const a=b.dataset.action,i=Number(b.dataset.index);sound.unlock();
 if(a==='level')intro(i);else if(a==='home')home();else if(a==='start')start();else if(a==='next')intro(run.index+1);else if(a==='restart')intro(run.index);else if(a==='pause')openPause();else if(a==='resume')resume();else if(a==='settings')settings();else if(a==='notebook')notebook();else if(a==='closeModal')closeModal();else if(a==='finale')finale();
 else if(a==='locale'&&!run){locale=locale==='zh'?'th':'zh';save.locale=locale;persist();home();}
 else if(a==='vocab'){const w=[...WORDS,...SENTENCES].find(v=>v.id===b.dataset.word);if(w)sound.word(w.id,source());}
 else if(paused)return;
 else if(a==='animal')chooseAnimal(i);else if(a==='listen')listen();else if(a==='helper')helper();else if(a==='aim')assistedAim(i);else if(a==='aimHelp'){feedback(C().guided,'',true);later(2.8,()=>$('feedback').className='');}
 else if(a==='fire')fire();else if(a==='cancelDraw')cancelDraw(true,true);else if(a==='gesture')gesture(i);else if(a==='answer')answer(i);else if(a==='tile')tile(Number(b.dataset.id));else if(a==='undo')undo();else if(a==='slot')undo(i);else if(a==='checkSentence')checkSentence();else if(a==='catchStart')spawnParcels();else if(a==='left')run.dogTarget=clamp(run.dogTarget-100,310,1040);else if(a==='right')run.dogTarget=clamp(run.dogTarget+100,310,1040);else if(a==='sequence')sequence();else if(a==='lamp')lamp(i);
});
stage.addEventListener('change',e=>{const key=e.target.dataset.setting;if(key==='effects'){save.effects=e.target.checked;sound.enabled=save.effects;if(!sound.enabled)sound.stopTension();}if(key==='motion'){save.reduced=e.target.checked;fx.reduced=save.reduced||systemReduced;refreshLanguage();}persist();});
function point(e){const box=stage.getBoundingClientRect();return{x:(e.clientX-box.left)/scale,y:(e.clientY-box.top)/scale};}
canvas.addEventListener('pointerdown',e=>{
 if(!run||paused||e.button>0||pointer!=null||e.isPrimary===false)return;const p=point(e);sound.unlock();
 if(run.mode==='sling'&&['ready','aim'].includes(run.phase)&&run.heard.has(run.selected)&&Math.min(Math.hypot(p.x-SLING.x,p.y-SLING.y),run.pull?Math.hypot(p.x-run.pull.x,p.y-run.pull.y):999)<95){pointer=e.pointerId;canvas.setPointerCapture(e.pointerId);run.dragging=true;run.chargeStep=0;run.pull=pullPoint(p);setPhase('aim');controls();setDraw(p);e.preventDefault();}
 if(run.mode==='courier'&&run.phase==='catching'){pointer=e.pointerId;canvas.setPointerCapture(e.pointerId);run.dogTarget=clamp(p.x,310,1040);e.preventDefault();}
});
canvas.addEventListener('pointermove',e=>{mouse=point(e);if(pointer!==e.pointerId||paused||!run)return;if(run.mode==='sling')setDraw(mouse);if(run.mode==='courier')run.dogTarget=clamp(mouse.x,310,1040);});
canvas.addEventListener('pointerup',e=>{if(pointer!==e.pointerId)return;if(run?.mode==='sling'&&!paused){setDraw(point(e));fire();}else releasePointer();});
canvas.addEventListener('pointercancel',e=>{if(pointer===e.pointerId)cancelDraw();});
canvas.addEventListener('lostpointercapture',e=>{if(pointer===e.pointerId)cancelDraw();});
stage.addEventListener('dragstart',e=>{const tile=e.target.closest('[data-action="tile"]');if(tile&&!tile.disabled)e.dataTransfer.setData('text/plain',tile.dataset.id);else e.preventDefault();});
stage.addEventListener('dragover',e=>{if(e.target.closest('.bridge-slots'))e.preventDefault();});
stage.addEventListener('drop',e=>{if(e.target.closest('.bridge-slots')){e.preventDefault();const id=Number(e.dataTransfer.getData('text/plain'));if(Number.isInteger(id)&&id>=0&&id<3)tile(id);}});
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();if(!modal&&run?.mode==='sling'&&run.phase==='aim')cancelDraw(true,true);else if(modal&&modal!=='intro'&&modal!=='result')closeModal();else if(run&&!modal)openPause();return;}
 if(modal){if(e.key==='Tab'){const f=[...$('overlay').querySelectorAll('button:not(:disabled),input')];if(!f.length)return;const index=f.indexOf(document.activeElement);if(e.shiftKey&&index<=0){e.preventDefault();f.at(-1).focus();}else if(!e.shiftKey&&index===f.length-1){e.preventDefault();f[0].focus();}}return;}
 if(!run||paused||e.target.matches('input,select,textarea'))return;
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();keys.add(e.key);
 const idx=Number(e.key)-1;if(idx>=0&&idx<3){if(run.mode==='sling')chooseAnimal(idx);if(run.mode==='duel')gesture(idx);if(run.mode==='echo')answer(idx);if(run.mode==='memory')lamp(idx);}
 if(e.key===' '){if(run.mode==='sling')fire();else listen();}
 if(run.mode==='sling'&&run.heard.has(run.selected)&&['ready','aim'].includes(run.phase)&&e.key.startsWith('Arrow')){run.pull||={x:SLING.x-78,y:SLING.y+40};setPhase('aim');setDraw({x:run.pull.x+(e.key==='ArrowLeft'?-4:e.key==='ArrowRight'?4:0),y:run.pull.y+(e.key==='ArrowUp'?-4:e.key==='ArrowDown'?4:0)});controls();}
});
window.addEventListener('keyup',e=>keys.delete(e.key));
window.addEventListener('blur',()=>{keys.clear();if(run&&!modal)openPause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();if(run&&!modal)openPause();else sound.stop();}last=performance.now();});
window.addEventListener('resize',resize);

function update(dt){
 if(!run)return;const r=run;r.clock+=dt;
 if(r.walkTo)r.walk=Math.min(r.walkTo,(r.walk||0)+dt*.42);
 if(r.mode==='sling'&&r.phase==='flight'&&r.projectile){const p=r.projectile,a=ballistic(p,p.age);p.age+=dt;const b=ballistic(p,p.age);r.trail.push(b);if(r.trail.length>20)r.trail.shift();const hit=r.targets.find(t=>!t.done&&segmentCircle(a,b,t,47));if(hit){slingImpact(hit);return;}if(b.x>1320||b.y>637||p.age>3.5)slingMiss();}
 if(r.mode==='courier'&&r.phase==='catching'){
  if(keys.has('ArrowLeft'))r.dogTarget=clamp(r.dogTarget-480*dt,310,1040);if(keys.has('ArrowRight'))r.dogTarget=clamp(r.dogTarget+480*dt,310,1040);
  r.dogX+=(r.dogTarget-r.dogX)*Math.min(1,dt*11);
  for(const item of r.items){if(item.gone)continue;item.y+=item.vy*dt;item.x+=Math.sin(r.clock*1.9+item.lane)*dt*13;if(item.y>505&&item.y<578&&Math.abs(item.x-r.dogX)<66){parcelCollision(item);return;}if(item.y>625){item.gone=true;if(item.word.id===r.word.id){sound.fx('miss');feedback(C().miss,C().missSub,false);setPhase('feedback');controls();later(1.4,()=>{$('feedback').className='';r.ready=true;spawnParcels();});return;}}}
 }
}
function loop(now){
 const dt=Math.min(.033,Math.max(0,(now-last)/1000));last=now;frame++;
 if(!paused&&!document.hidden){clock+=dt;fx.update(dt);if(fx.freeze<=0)update(dt);const due=jobs.filter(j=>j.at<=clock);jobs=jobs.filter(j=>j.at>clock);for(const j of due)if(j.token===token)j.fn();if(clock-lastAmbient>7){lastAmbient=clock;sound.ambience(run?.scene||'river');}}
 if(art.river)paintWorld(ctx,art,{run,time:clock,locale,reduced:fx.reduced,mouse},fx);
 if(run?.scoreAt!=null&&run.clock-run.scoreAt<.6){const el=$('meter').querySelector('.meter-score');if(el)el.textContent=String(Math.round(run.score-run.lastGain*(1-Math.min(1,(run.clock-run.scoreAt)/.42))**3));}
 if(run?.mode==='sling'){
  const face=slingExpression(run),avatar=stage.querySelector('.avatar-btn img'),key=faceKey(locale,face);
  if(avatar&&art[key]&&avatar.dataset.face!==face){avatar.src=art[key].src;avatar.dataset.face=face;avatar.classList.add('expression-avatar');}
 }
 requestAnimationFrame(loop);
}
async function boot(){
 refreshLanguage();resize();$('loader').querySelector('p').textContent=C().loading;
 try{art=await loadArt(n=>$('loader').querySelector('progress').value=n);$('loader').hidden=true;home();const idx=Number(params.get('level'));if(params.has('level')&&Number.isInteger(idx)&&idx>=1&&idx<=6)intro(idx-1);requestAnimationFrame(loop);}
 catch(error){$('loader').innerHTML='<p>'+C().loadFail+'</p>'+button('reload',C().retry,'primary');$('loader').querySelector('button').onclick=()=>location.reload();console.error('Paper trails asset load failure',error);}
}
if(params.has('qa'))window.paperTrails={inspect:()=>({mode:run?.mode||'home',phase:run?.phase,paused,modal,locale,clock,run:run?JSON.parse(JSON.stringify({...run,heard:run.heard?[...run.heard]:[],used:[...run.used]})):null,save:cleanSave(save),jobs:jobs.length,particleCount:fx.bits.length,audio:{tension:!!sound.string,enabled:sound.enabled,playing:sound.playing},reduced:fx.reduced}),stage:()=>stage.getBoundingClientRect().toJSON()};
boot();
