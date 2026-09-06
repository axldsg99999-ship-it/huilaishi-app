/* First-run story: presentation only. Never changes a language route or a save. */
(function(root){
  'use strict';
  const KEY='huilaishi-opening-comic-v126';
  const panels=Object.freeze([
    {art:'assets/game/comic-together-v126.webp',seconds:7,zh:['失散之前','「下次，换你带我回家。」','小艾和 CHANINDA 把旅途贴进同一本手册。'],th:['ก่อนพลัดพราก','“คราวหน้า พาฉันไปบ้านเธอนะ”','小艾 และ CHANINDA เก็บความทรงจำการเดินทางไว้ในสมุดเล่มเดียวกัน']},
    {art:'assets/game/comic-rift-v126.webp',seconds:6,zh:['风暴撕开了书页','他们松开了手。','一半照片，一场突如其来的风暴。两个人落入不同的世界。'],th:['พายุฉีกหน้ากระดาษ','มือของทั้งคู่หลุดจากกัน','ภาพถ่ายขาดเป็นสองส่วน พายุพาทั้งสองไปยังคนละโลก']},
    {art:'assets/game/comic-letter-v126.webp',seconds:8,zh:['异乡的第一张声页','「你听得见我吗？」','陌生的语言封住了归途。读懂声页，就能让停下的世界重新回应。'],th:['หน้ากระดาษแผ่นแรกในต่างแดน','“ได้ยินฉันไหม?”','ภาษาที่ไม่คุ้นเคยขวางทางกลับ เมื่อเข้าใจหน้ากระดาษเสียง โลกที่หยุดนิ่งจะตอบรับอีกครั้ง']},
    {art:'assets/game/two-worlds-title-v125.webp',seconds:7,zh:['同一场冒险 · 两条归途','学会彼此的语言，再次相遇。','小艾在莲潮港学习泰语；CHANINDA 在砚桥城学习中文。现在，选择你的旅程。'],th:['การผจญภัยเดียวกัน · สองเส้นทาง','เรียนรู้ภาษาของกันและกัน เพื่อได้พบกันอีกครั้ง','小艾 เรียนภาษาไทยที่ท่าเรือบัว ส่วน CHANINDA เรียนภาษาจีนที่เมืองสะพานหมึก เลือกเส้นทางของคุณ']}
  ].map(Object.freeze));
  let current=null,seenInSession=false;
  const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduced=()=>Boolean(root.HUILAISHI_NATIVE_LIGHTWEIGHT||root.matchMedia?.('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motionEffective==='reduced');
  function eligible(storage){try{return !seenInSession&&!storage?.getItem(KEY)&&!storage?.getItem('learningDirection');}catch(_){return !seenInSession;}}
  function close(complete=false){
    const s=current;if(!s)return;current=null;clearTimeout(s.timer);
    document.removeEventListener('visibilitychange',s.visibility);root.removeEventListener('pagehide',s.pagehide);
    s.dialog.remove();s.app.inert=s.wasInert;document.body.style.overflow=s.overflow;
    if(complete){seenInSession=true;try{s.storage?.setItem(KEY,'seen');}catch(_){}s.onDone?.();}
    const focus=s.focus?.isConnected?s.focus:document.querySelector('[data-direction]');focus?.focus?.({preventScroll:true});
  }
  function schedule(s){clearTimeout(s.timer);if(current!==s||s.paused||document.hidden)return;s.timer=setTimeout(()=>next(s),panels[s.at].seconds*1000);}
  function next(s){if(current!==s)return;if(s.at===panels.length-1)close(true);else{s.at++;paint(s);}}
  function paint(s){
    const focusAction=s.dialog.contains(document.activeElement)?document.activeElement?.dataset.comic:null;
    const p=panels[s.at],th=s.locale==='th',t=p[s.locale],label=(zh,thai)=>th?thai:zh;
    s.dialog.lang=th?'th':'zh-CN';s.dialog.dataset.panel=String(s.at);s.dialog.dataset.paused=String(s.paused||document.hidden);s.dialog.dataset.reduced=String(reduced());
    s.dialog.innerHTML=`<header class="comic-toolbar"><span class="comic-brand">XULONG <i>pasa</i></span><div class="comic-tools"><button type="button" data-comic="lang" aria-label="${label('切换字幕为泰语','เปลี่ยนคำบรรยายเป็นภาษาจีน')}">${th?'中文':'ไทย'}</button><button type="button" data-comic="pause" aria-pressed="${s.paused}">${s.paused?label('播放','เล่น'):label('暂停','หยุด')}</button><button type="button" data-comic="skip">${label('跳过剧情','ข้ามเรื่อง')}</button></div></header><div class="comic-frame" data-comic="next" role="presentation">${root.HUILAISHI_NATIVE_LIGHTWEIGHT?'':`<img class="comic-art" src="${esc(root.XULONG_COMIC_ART?.[p.art]||p.art)}" alt="" decoding="async">`}<span class="comic-seam" aria-hidden="true"></span></div><section class="comic-caption" aria-live="polite"><p class="comic-chapter">${esc(t[0])}</p><h2 id="comic-heading">${esc(t[1])}</h2><p class="comic-description">${esc(t[2])}</p></section><footer class="comic-footer"><div class="comic-pages" aria-label="${s.at+1} / 4">${panels.map((_,i)=>`<span class="${i===s.at?'current':i<s.at?'passed':''}"></span>`).join('')}</div><nav><button type="button" data-comic="back" ${s.at===0?'disabled':''} aria-label="${label('上一格','ช่องก่อนหน้า')}">←</button><button type="button" data-comic="next">${s.at===3?label('选择我的世界','เลือกโลกของฉัน'):label('下一格','ช่องถัดไป')} <span aria-hidden="true">→</span></button></nav></footer>`;
    const img=s.dialog.querySelector('.comic-art');if(img)img.addEventListener('error',()=>{img.hidden=true;s.dialog.dataset.artFailed='true';},{once:true});
    schedule(s);
    if(focusAction)s.dialog.querySelector(`button[data-comic="${focusAction}"]:not(:disabled)`)?.focus({preventScroll:true});
  }
  function show({storage,locale='zh',onDone}={}){
    if(current)return;
    const app=document.getElementById('app');if(!app)return;
    const dialog=document.createElement('section');dialog.className='opening-comic';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','comic-heading');dialog.setAttribute('data-speech-policy','none');
    const s={dialog,app,storage,onDone,locale:locale==='th'?'th':'zh',at:0,paused:reduced(),focus:document.activeElement,wasInert:app.inert,overflow:document.body.style.overflow};
    current=s;app.inert=true;document.body.style.overflow='hidden';document.body.append(dialog);
    dialog.addEventListener('click',e=>{const b=e.target.closest('[data-comic]');if(!b||b.disabled)return;const a=b.dataset.comic;if(a==='next')next(s);else if(a==='skip')close(true);else if(a==='back'){s.at=Math.max(0,s.at-1);paint(s);}else if(a==='pause'){s.paused=!s.paused;paint(s);}else if(a==='lang'){s.locale=s.locale==='zh'?'th':'zh';paint(s);}if(current===s)s.dialog.querySelector(`[data-comic="${a}"]`)?.focus?.({preventScroll:true});});
    dialog.addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.preventDefault();close(true);}
      else if(e.key==='ArrowRight'){e.preventDefault();next(s);}
      else if(e.key==='ArrowLeft'){e.preventDefault();s.at=Math.max(0,s.at-1);paint(s);}
      else if(e.key==='Tab'){const buttons=[...dialog.querySelectorAll('button:not(:disabled)')],i=buttons.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();buttons.at(-1)?.focus();}else if(!e.shiftKey&&(i===buttons.length-1||i<0)){e.preventDefault();buttons[0]?.focus();}}
    });
    s.visibility=()=>{clearTimeout(s.timer);dialog.dataset.paused=String(s.paused||document.hidden);if(!document.hidden)schedule(s);};
    s.pagehide=()=>close(false);
    document.addEventListener('visibilitychange',s.visibility);root.addEventListener('pagehide',s.pagehide);
    paint(s);dialog.querySelector('[data-comic="skip"]').focus({preventScroll:true});
  }
  root.XULONG_COMIC=Object.freeze({panels,key:KEY,eligible,show,close,maybe(options){if(eligible(options?.storage))show(options);}});
})(globalThis);
