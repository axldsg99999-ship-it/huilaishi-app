/* V131: a scene-first presentation. The arcade remains the authority for
   timers, answers, rewards and saves; this module never writes progress. */
(function (root) {
  'use strict';
  const words = {
    zh: { hear:'听听它说什么', read:'看清它的言术', replay:'再听一次', pronounce:'听读音 · 辅助', loading:'正在准备声音…', speaking:'仔细听…', failed:'声音没播完 · 点此重试', ready:'想法正在浮现…', thoughts:'我想，是这个…', waiting:'听懂这一声，想到下一招。', reading:'看懂这个词，想到下一招。', choose:'点一个想法，化成招式', result:'这一招，记住了', tactic:'招式', info:'对手的招式与故事', mic:'开口出招', micRetry:'重试语音', micUnavailable:'语音未就绪，点想法继续', micHint:'识别匹配，不是专业发音评分', next:'点画面继续', note:'听完才计时 · 不方便开口也能玩', failedNote:'声音没播完，不计时、不扣血。', text:'改用文字题', book:'认字', sound:'听音', burst:'默契合击' },
    th: { hear:'ฟังเสียงคู่ต่อสู้', read:'อ่านคำเวท', replay:'ฟังอีกครั้ง', pronounce:'ฟังเสียง · ตัวช่วย', loading:'กำลังเตรียมเสียง…', speaking:'ตั้งใจฟัง…', failed:'เสียงไม่จบ · แตะลองใหม่', ready:'ความคิดกำลังปรากฏ…', thoughts:'ฉันคิดว่า…', waiting:'ฟังให้เข้าใจ แล้วคิดท่าต่อไป', reading:'อ่านคำให้เข้าใจ แล้วออกท่า', choose:'เลือกความคิดเพื่อออกท่า', result:'จำคำนี้ไว้', tactic:'ท่า', info:'สกิลและเรื่องราวคู่ต่อสู้', mic:'พูดเพื่อโจมตี', micRetry:'ลองพูดอีกครั้ง', micUnavailable:'เสียงยังไม่พร้อม เลือกคำตอบได้', micHint:'จับคู่คำที่ถอดเสียง ไม่ใช่คะแนนออกเสียง', next:'แตะฉากเพื่อไปต่อ', note:'ฟังจบจึงจับเวลา · เลือกคำตอบแทนพูดได้', failedNote:'เสียงยังไม่จบ ไม่จับเวลาและไม่เสีย HP', text:'ใช้โจทย์ข้อความ', book:'อ่าน', sound:'ฟัง', burst:'ท่าประสาน' }
  };
  function phase(game) {
    return game.answered ? 'result' : game.cueFailed ? 'failed' : game.thoughtsReady&&!game.timerActive ? 'reveal' : game.busy
      ? (game.timerActive ? 'microphone' : game.cueStarted ? 'speaking' : 'loading')
      : game.timerActive ? 'answer' : game.thoughtsReady ? 'reveal' : 'plan';
  }
  function sourceLabel(game, language='zh') {
    const c=words[language]||words.zh,p=phase(game);
    return p==='failed'?c.failed:p==='loading'?c.loading:p==='speaking'?c.speaking:
      p==='reveal'?c.ready:p==='answer'?(game.questionMode==='read'?c.pronounce:c.replay):game.questionMode==='read'?c.read:c.hear;
  }
  function mount(stage, language='zh') {
    if(!stage)return;
    const world=stage.querySelector('.arcade-monster-world'),command=stage.querySelector('.arcade-monster-command');
    if(!world||!command||world.classList.contains('thought-stage'))return;
    const c=words[language]||words.zh;
    const make=(tag,cls)=>{const n=document.createElement(tag);n.className=cls;return n;};
    const take=(selector,parent)=>{const n=stage.querySelector(selector);if(n)parent.append(n);return n;};
    world.classList.add('thought-stage');
    world.dataset.thoughtLanguage=language;
    const shade=make('div','thought-shade');shade.setAttribute('aria-hidden','true');world.append(shade);
    // Keep the command node for the existing game observers, but remove its
    // side-panel geometry. No duplicate question, audio or answer controls.
    world.append(command);
    const head=make('section','thought-source');head.setAttribute('aria-label',c.hear);
    const trigger=make('button','thought-source-button');trigger.type='button';trigger.dataset.thoughtCue='';
    trigger.setAttribute('data-speech-skip','');
    trigger.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8q4 4 0 8M20 5q6 7 0 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-thought-source-label></span><i class="thought-sound-bars" aria-hidden="true"><i></i><i></i><i></i></i>';
    head.append(trigger);take('[data-campus-target]',head);world.append(head);
    const label=make('div','thought-caption');
    label.innerHTML='<span class="thought-trail" aria-hidden="true"><i></i><i></i><i></i></span><b data-thought-caption></b>';
    world.append(label);
    const options=take('.arcade-monster-options',world);
    options.setAttribute('role','group');options.setAttribute('aria-label',c.thoughts);
    options.querySelectorAll('button').forEach((button,i)=>{
      button.classList.add('thought-option');button.style.setProperty('--thought-order',i);
      // Position is a property of the slot, never of which answer is correct.
      button.setAttribute('data-speech-skip','');
    });
    const note=make('p','thought-guidance');note.dataset.thoughtGuidance='';world.append(note);
    const result=take('[data-monster-round-result]',world);
    if(result){result.classList.add('thought-result');result.removeAttribute('aria-hidden');result.setAttribute('role','status');}
    take('.arcade-monster-attack',world)?.classList.add('thought-microphone');
    take('[data-monster-audio-recovery]',world)?.classList.add('thought-recovery');
    // Tactics are optional, readable and untimed; they never cover live answers.
    const drawer=make('details','thought-tactics');
    const summary=make('summary','thought-tactics-toggle');summary.textContent=c.info;drawer.append(summary);
    const body=make('div','thought-tactics-body');drawer.append(body);
    take('.arcade-monster-cue',body);take('[data-monster-skill-card]',body);
    take('.arcade-monster-intent',body);take('[data-campus-explore]',body);
    world.append(drawer);
    take('[data-monster-burst]',world)?.classList.add('thought-burst');
    // Retain one accessible status message, visually keep the guidance concise.
    stage.querySelector('.arcade-monster-first-mission')?.remove();
    world.querySelector('[data-monster-audio]')?.setAttribute('tabindex','-1');
  }
  function sync(stage, game, language='zh') {
    const world=stage?.querySelector('.thought-stage');if(!world||!game)return;
    const c=words[language]||words.zh,p=phase(game),previousPhase=world.dataset.thoughtPhase;
    world.dataset.thoughtPhase=p;world.dataset.questionMode=game.questionMode;
    world.dataset.thoughtAssisted=String(Boolean(game.answerAssisted));
    world.dataset.thoughtsReady=String(Boolean(game.thoughtsReady||game.timerActive||game.answered));
    world.dataset.thoughtCount=String(game.options?.length||4);
    world.dataset.thoughtLong=String(Boolean(game.options?.some(option=>String(option.view?.meaning||'').length>22)));
    if(p==='reveal'&&previousPhase!==p){
      const hero=world.querySelector('.arcade-player-avatar')?.getBoundingClientRect();
      if(hero)world.querySelectorAll('.thought-option').forEach(option=>{
        const slot=option.getBoundingClientRect();
        option.style.setProperty('--thought-origin-x',(hero.x+hero.width*.55-slot.x-slot.width*.5)+'px');
        option.style.setProperty('--thought-origin-y',(hero.y+hero.height*.2-slot.y-slot.height*.5)+'px');
      });
    }
    const set=(selector,text)=>{const node=world.querySelector(selector);if(node)node.textContent=text;};
    set('[data-thought-source-label]',sourceLabel(game,language));
    set('[data-thought-caption]',p==='result'?c.result:game.inputNotice?c.micUnavailable:c.thoughts);
    set('[data-thought-guidance]',p==='failed'?c.failedNote:p==='answer'?c.choose:p==='microphone'?c.micHint:
      game.questionMode==='read'?c.reading:c.waiting);
    const button=world.querySelector('[data-thought-cue]');
    if(button){button.disabled=game.answered||game.busy||p==='reveal';button.setAttribute('aria-label',sourceLabel(game,language));button.setAttribute('aria-busy',String(game.busy&&!game.timerActive));}
    const mic=world.querySelector('[data-monster-voice]');
    if(mic){mic.setAttribute('aria-label',p==='failed'?c.text:c.mic+' · '+c.micHint);set('[data-monster-voice-label]',p==='failed'?c.text:game.inputNotice?c.micRetry:c.mic);}
    const drawer=world.querySelector('.thought-tactics');
    if(drawer&&p!=='plan'&&p!=='failed')drawer.open=false;
    const burst=world.querySelector('[data-monster-burst]');
    if(burst){const charge=Number(game.burstCharge)||0;const armed=Boolean(game.burstArmed);set('[data-monster-burst-label]',c.burst+' '+(armed?'✓':charge+'/3'));}
  }
  root.XULONG_THOUGHT_BATTLE=Object.freeze({mount,sync,phase,sourceLabel});
})(globalThis);
