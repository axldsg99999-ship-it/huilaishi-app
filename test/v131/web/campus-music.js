/* One opt-in, pre-rendered campus loop. Never instantiate audio during boot. */
(() => {
  'use strict';
  const KEY = 'huilaishi-campus-music-v1';
  const source = () => window.XULONG_BGM_SOURCE || 'assets/audio/music/after-school-v123.mp3';
  let enabled = false, volume = .35, unlocked = false, audio = null, context = null, gain = null;
  let state = 'off', generation = 0, startTimer = 0, loadTimer = 0, pageAway = false;
  const holds = new Set();
  const visible = id => { const el = document.getElementById(id); return el && !el.hidden && !el.classList.contains('hidden'); };
  const thai = () => document.body.classList.contains('dir-th-zh');
  const words = () => thai() ? {
    title:'หลังเลิกเรียน',note:'เพลงแคมป์ · ดนตรีสังเคราะห์ต้นฉบับ',off:'เปิดเพลง',ready:'แตะเพื่อเล่น',loading:'กำลังโหลด',playing:'ปิดเพลง',paused:'เปิดอยู่ · พักเสียง',error:'แตะเพื่อลองใหม่',blocked:'แตะเพื่อเล่น',volume:'ระดับเสียงเพลง',help:'เพลงเล่นเฉพาะหน้าเริ่มต้น แคมป์ และการตั้งค่า หยุดระหว่างเรียน ต่อสู้ และฟังเสียงอ่าน',limited:'อุปกรณ์นี้ใช้ปุ่มระดับเสียงของเครื่อง',
  } : {
    title:'放学后，世界见',note:'营地原声 · 原创合成配乐',off:'开启音乐',ready:'轻点播放',loading:'正在加载',playing:'关闭音乐',paused:'已开启 · 暂停中',error:'加载失败 · 重试',blocked:'轻点播放',volume:'背景音乐音量',help:'仅开场、营地和设置页播放；学习、战斗与朗读时暂停。',limited:'此设备请使用系统音量键调节',
  };
  function routeAllowed() {
    if (visible('modal-backdrop') || visible('local-battle-root') || visible('lesson')) return false;
    if (visible('direction-screen')) return true;
    if (visible('onboarding') && document.getElementById('onboarding')?.classList.contains('welcome-visible')) return true;
    return visible('main-app') && ['view-home','view-profile'].some(id => document.getElementById(id)?.classList.contains('active'));
  }
  const desired = () => enabled && unlocked && !document.hidden && !pageAway && !holds.size && routeAllowed();
  function save() { try { window.HUILAISHI_STORAGE?.setItem(KEY, JSON.stringify({enabled,volume})); } catch (_) {} }
  function render() {
    const w=words(), label = !enabled ? w.off : !unlocked ? w.ready : w[state] || w.paused;
    document.querySelectorAll('[data-music-toggle]').forEach(button => {
      button.setAttribute('aria-pressed',String(enabled));
      button.setAttribute('aria-label',label+' · '+w.title);
      button.dataset.musicState = state;
      button.querySelector('[data-music-action]').textContent=label;
    });
    document.querySelectorAll('[data-music-copy]').forEach(el => { const value=w[el.dataset.musicCopy]; if(el.textContent!==value) el.textContent=value; });
    document.querySelectorAll('[data-music-volume]').forEach(input=>{
      input.value=String(Math.round(volume*100)); input.setAttribute('aria-label',w.volume);
      input.closest('label').querySelector('output').textContent=Math.round(volume*100)+'%';
    });
  }
  function cancelPending() { clearTimeout(startTimer);clearTimeout(loadTimer);startTimer=0;loadTimer=0; }
  function pause() {
    generation++;cancelPending();audio?.pause();
    state = enabled ? 'paused' : 'off';render();
  }
  function setGain(fade=false) {
    if(gain && context) {
      const now=context.currentTime;gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(fade ? 0 : gain.gain.value,now);
      gain.gain.linearRampToValueAtTime(volume,now+(fade ? .45 : .16));
    } else if(audio) audio.volume=volume;
  }
  function ensureAudio() {
    if(audio) return;
    audio=document.createElement('audio');audio.id='campus-background-music';
    audio.loop=true;audio.preload='none';audio.hidden=true;
    audio.setAttribute('playsinline','');audio.setAttribute('aria-hidden','true');
    audio.src=source();document.body.appendChild(audio);
    // A gain node provides independent volume on WebKit as well as Chromium.
    // It is created only inside the explicit music-button gesture.
    try {
      const Constructor=window.AudioContext || window.webkitAudioContext;
      if(Constructor) { context=new Constructor();gain=context.createGain();context.createMediaElementSource(audio).connect(gain);gain.connect(context.destination);audio.volume=1; }
    } catch (_) { gain=null;context=null; }
    setGain();
    audio.addEventListener('error',()=>{
      generation++;cancelPending();audio.pause();state='error';render();
    });
    audio.addEventListener('playing',()=>{
      if(!desired() || !['loading','playing'].includes(state)){audio.pause();return;}
      clearTimeout(loadTimer);state='playing';render();
    });
  }
  function start() {
    if(!desired() || !audio) return;
    if(state==='loading' || (!audio.paused && state==='playing')) return;
    const ticket=++generation;state='loading';render();setGain(true);
    loadTimer=setTimeout(()=>{
      if(ticket!==generation) return;
      generation++;audio.pause();state='error';render();
    },12000);
    // Call play synchronously in the gesture; don't await context.resume first.
    const resumed=context?.state==='suspended' ? context.resume() : undefined;
    Promise.all([resumed,audio.play()]).then(()=>{
      if(ticket!==generation) { if(!desired() || !['loading','playing'].includes(state)) audio.pause();return; }
      clearTimeout(loadTimer);
      if(!desired()){pause();return;}state='playing';render();
    }).catch(error=>{
      if(ticket!==generation) return;
      clearTimeout(loadTimer);audio.pause();state=error?.name==='NotAllowedError' ? 'blocked' : 'error';render();
    });
  }
  function sync() {
    if(!desired()){pause();return;}
    if(['error','blocked'].includes(state)) { render();return; }
    clearTimeout(startTimer);startTimer=setTimeout(start,280);render();
  }
  function toggle() {
    if(enabled && unlocked && !['error','blocked'].includes(state)) { enabled=false;save();pause();return; }
    enabled=true;unlocked=true;save();
    try { ensureAudio();if(audio.error) audio.load();state='paused';start();render(); }
    catch (_) { state='error';render(); }
  }
  function setVolume(value) {
    const n=Number(value);if(!Number.isFinite(n)) return;
    volume=Math.max(0,Math.min(1,n));setGain();save();render();
  }
  function init() {
    try {
      const stored=JSON.parse(window.HUILAISHI_STORAGE?.getItem(KEY)||'null');
      enabled=stored?.enabled===true;
      if(typeof stored?.volume==='number' && Number.isFinite(stored.volume)) volume=Math.max(0,Math.min(1,stored.volume));
    } catch (_) {}
    const rack=()=>`<div class="campus-music-rack" data-speech-policy="none"><span class="music-cassette" aria-hidden="true"><i></i><i></i><b>pasa / A</b></span><span class="music-track"><b data-music-copy="title"></b><small data-music-copy="note"></small></span><button type="button" data-music-toggle data-speech-skip aria-pressed="false"><span aria-hidden="true" class="music-bars"><i></i><i></i><i></i></span><span data-music-action></span></button></div>`;
    document.querySelector('#direction-screen .direction-footer')?.insertAdjacentHTML('beforebegin',rack());
    document.querySelector('#welcome-skip')?.insertAdjacentHTML('afterend',rack());
    document.querySelector('#hub-shortcuts')?.insertAdjacentHTML('afterend',rack());
    document.querySelector('#profile-audio-settings summary')?.insertAdjacentHTML('afterend',`<section class="campus-music-settings" data-speech-policy="none">${rack()}<label><span data-music-copy="volume"></span><output>35%</output><input type="range" min="0" max="100" step="5" value="35" data-music-volume data-speech-skip /></label><p data-music-copy="help"></p></section>`);
    document.querySelectorAll('[data-music-toggle]').forEach(button=>button.addEventListener('click',toggle));
    document.querySelectorAll('[data-music-volume]').forEach(input=>input.addEventListener('input',()=>setVolume(Number(input.value)/100)));
    const observer=new MutationObserver(sync);
    for(const id of ['direction-screen','onboarding','main-app','lesson','view-home','view-profile','modal-backdrop','local-battle-root']) {
      const el=document.getElementById(id);if(el)observer.observe(el,{attributes:true,attributeFilter:['class','hidden']});
    }
    observer.observe(document.body,{attributes:true,attributeFilter:['class']});
    document.addEventListener('visibilitychange',sync);
    window.addEventListener('pagehide',()=>{pageAway=true;pause();});
    window.addEventListener('pageshow',()=>{pageAway=false;sync();});
    render(); // Deliberately no Audio, fetch, play or AudioContext on startup.
  }
  window.XULONG_MUSIC=Object.freeze({
    hold(reason){holds.add(reason);sync();},release(reason){holds.delete(reason);sync();},
    sync,setVolume,
    status:()=>({enabled,volume,state,unlocked,created:Boolean(audio),holds:[...holds],allowed:routeAllowed()}),
  });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
