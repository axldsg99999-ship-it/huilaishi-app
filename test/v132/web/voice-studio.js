/* V132: a short, honest speaking loop. No reward/mastery is inferred here. */
(function(root){
 'use strict';
 let panel,dir,word,returnFocus,epoch=0,busy=false,timer=0,recorder=null,stream=null,audioUrl='',replay=null,playing=false;
 const t=(zh,th)=>dir==='th-zh'?th:zh;
 const q=s=>panel?.querySelector(s);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const mic='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg>';
 const speaker='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8q4 4 0 8M20 5q6 7 0 14"/></svg>';
 function message(text,kind='idle'){if(q('#vs-status')){q('#vs-status').textContent=text;panel.dataset.state=kind;}}
 function paint(){
  if(!panel)return;
  q('[data-vs="speak"]').disabled=busy||playing;
  q('[data-vs="record"]').disabled=busy||playing;
  q('[data-vs="example"]').disabled=busy||playing;
  q('[data-vs="replay"]').disabled=!audioUrl||busy||playing;
  q('[data-vs="stop"]').hidden=!busy&&!playing;
  q('#vs-network').disabled=busy||playing;
  panel.setAttribute('aria-busy',String(busy));
 }
 function stop(){
  epoch++;clearTimeout(timer);busy=false;playing=false;
  root.PronunciationScorer?.cancelChallenge?.();root.HUILAISHI_SPEECH?.stop?.();
  const r=recorder;recorder=null;try{if(r?.state!=='inactive')r?.stop();}catch(_){}
  stream?.getTracks().forEach(track=>track.stop());stream=null;
  replay?.pause();replay=null;paint();
 }
 function close(){
  stop();root.XULONG_MUSIC?.release('voice-studio');
  if(audioUrl){URL.revokeObjectURL(audioUrl);audioUrl='';}
  if(panel?.open)panel.close();panel?.remove();panel=null;
  if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
 }
 const target=()=>dir==='th-zh'?word.zh:word.th;
 const lang=()=>dir==='th-zh'?'zh-CN':'th-TH';
 function errorText(code){
  const map={
   'none':['当前设备没有可用的语音识别。可以录音回听，或回游戏点选答案。','อุปกรณ์นี้ยังรู้จำเสียงไม่ได้ อัดเสียงฟังเองหรือเลือกคำตอบในเกมได้'],
   'network-consent':['本机识别不可用。需要联网时，请先勾选下方授权，再试一次。','รู้จำบนเครื่องไม่ได้ หากต้องการใช้เครือข่าย โปรดอนุญาตด้านล่างแล้วลองใหม่'],
   'local-missing':['未找到当前语言的本机语音包。可授权联网识别，或录音回听。','ไม่พบชุดภาษาบนเครื่อง อนุญาตเครือข่ายหรืออัดเสียงฟังเองได้'],
   'not-allowed':['麦克风权限未开启。请在系统或浏览器设置里允许麦克风，再重试。','ยังไม่ได้อนุญาตไมค์ เปิดสิทธิ์ในการตั้งค่าระบบหรือเบราว์เซอร์แล้วลองใหม่'],
   'no-speech':['没听清这一次。靠近麦克风，再说一遍，不扣分。','ยังฟังไม่ชัด ลองพูดใกล้ไมค์อีกครั้ง ไม่หักคะแนน'],
   'microphone-busy':['麦克风正被占用。结束通话或其他录音后重试。','ไมค์กำลังถูกใช้งาน จบการโทรหรือการอัดเสียงอื่นแล้วลองใหม่'],
   'language-unavailable':['系统识别服务暂不支持当前语言，可先录音回听。','บริการรู้จำยังไม่รองรับภาษานี้ ลองอัดเสียงฟังเองก่อน'],
   'insecure':['录音需要安全网址或新版安装包，请使用 HTTPS 测试入口。','การอัดเสียงต้องใช้ HTTPS หรือแอปรุ่นใหม่'],
   'timeout':['等待超时，已停止收音。可以再试一次。','รอนานเกินไป หยุดรับเสียงแล้ว ลองใหม่ได้'],
   'network-error':['识别服务连接失败。检查网络后重试，或录音回听。','เชื่อมต่อบริการไม่ได้ ตรวจสอบเครือข่ายหรืออัดเสียงฟังเอง'],
   'cancelled':['已停止。准备好可以再试。','หยุดแล้ว พร้อมเมื่อไหร่ลองใหม่ได้']
  };
  return (map[code]||[root.HUILAISHI_NATIVE_ANDROID?'语音服务未启动。请确认安装了带语音入口的新版；也可以录音回听。':'语音没有启动，请检查麦克风或换浏览器重试。','เริ่มรับเสียงไม่ได้ ตรวจสอบไมค์หรือใช้แอปรุ่นใหม่แล้วลองอีกครั้ง'])[dir==='th-zh'?1:0];
 }
 async function speak(){
  if(busy||playing)return;stop();busy=true;const token=epoch;paint();
  q('#vs-transcript').textContent='—';
  message(t('正在连接麦克风，请允许本次使用…','กำลังเชื่อมต่อไมค์ โปรดอนุญาตใช้งาน…'),'preparing');
  timer=setTimeout(()=>{if(token!==epoch)return;stop();message(errorText('timeout'),'error');},30000);
  try {
   const result=await root.PronunciationScorer?.recognizeTarget({
    target:target(),lang:lang(),threshold:78,maxMs:8000,allowNetwork:q('#vs-network').checked,
    onStatus:status=>{if(token!==epoch)return;if(status==='listening')message(t('正在听，请说出这个词…','กำลังฟัง พูดคำนี้ได้เลย…'),'listening');else if(status==='processing')message(t('收音结束，正在识别…','รับเสียงแล้ว กำลังรู้จำ…'),'processing');},
    onInterim:value=>{if(token===epoch)q('#vs-transcript').textContent=value.transcript||'…';}
   });
   if(token!==epoch)return;clearTimeout(timer);busy=false;paint();
   q('#vs-transcript').textContent=result?.transcript||'—';
   if(result?.passed)message(t('识别到了目标词。再和示范听一遍，留意声调。','รู้จำตรงกับคำเป้าหมาย ลองฟังเทียบเสียงวรรณยุกต์อีกครั้ง'),'matched');
   else if(result?.status==='result')message(t('识别结果和目标词不一致。听一次示范，再试试。','คำที่รู้จำได้ยังไม่ตรง ฟังตัวอย่างแล้วลองใหม่'),'retry');
   else message(errorText(result?.status||'none'),'error');
  }catch(_){if(token===epoch){clearTimeout(timer);busy=false;paint();message(errorText('start-failed'),'error');}}
 }
 function example(){
  if(busy||playing)return;stop();playing=true;const token=epoch;paint();message(t('正在播放示范…','กำลังเล่นตัวอย่าง…'),'playing');
  const done=error=>{if(token!==epoch)return;clearTimeout(timer);playing=false;paint();message(error?t('示范音暂不可用，请重试。','ยังเล่นตัวอย่างไม่ได้ ลองใหม่'):t('轮到你了，点麦克风说一次。','ตาคุณแล้ว แตะไมค์แล้วลองพูด'),'idle');};
  timer=setTimeout(()=>done(true),15000);
  try{root.HUILAISHI_SPEECH?.speak(target(),{lang:lang(),key:'vocab:'+word.id+':word:'+(dir==='th-zh'?'zh':'th'),audioKey:'vocab:'+word.id+':word:'+(dir==='th-zh'?'zh':'th'),kind:'word',track:'standard',voicePackLevel:1,direction:dir,onEnd:()=>done(false),onError:()=>done(true),onStart:()=>{},hideTranscript:true,statusPresentation:'scene'});}catch(_){done(true);}
 }
 async function record(){
  if(busy||playing)return;stop();busy=true;const token=epoch;paint();
  if(!root.navigator?.mediaDevices?.getUserMedia||!root.MediaRecorder){busy=false;paint();message(errorText(root.isSecureContext===false?'insecure':'none'),'error');return;}
  message(t('请允许麦克风；本次录音仅保留在页面内。','อนุญาตไมค์ เสียงนี้เก็บไว้เฉพาะในหน้านี้'),'preparing');
  timer=setTimeout(()=>{if(token===epoch){stop();message(errorText('timeout'),'error');}},30000);
  try {
   const tracks=await root.navigator.mediaDevices.getUserMedia({audio:true,video:false});
   if(token!==epoch){tracks.getTracks().forEach(t=>t.stop());return;}
   clearTimeout(timer);stream=tracks;
   const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(s=>MediaRecorder.isTypeSupported(s));
   recorder=mime?new MediaRecorder(tracks,{mimeType:mime}):new MediaRecorder(tracks);
   const active=recorder,chunks=[];
   active.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   active.onstop=()=>{
    tracks.getTracks().forEach(t=>t.stop());
    if(token!==epoch)return;
    clearTimeout(timer);recorder=null;stream=null;busy=false;
    if(audioUrl)URL.revokeObjectURL(audioUrl);
    audioUrl=chunks.length?URL.createObjectURL(new Blob(chunks,{type:active.mimeType})):'';paint();
    message(audioUrl?t('录好了。点“我的录音”，和示范比较；不自动评发音。','อัดแล้ว แตะเสียงของฉันเพื่อฟังเทียบ ไม่มีคะแนนออกเสียง'):errorText('no-speech'),audioUrl?'recorded':'error');
   };
   active.onerror=()=>{if(token===epoch){stop();message(errorText('start-failed'),'error');}};
   active.start();message(t('正在录音 · 最长 8 秒 · 点停止完成','กำลังอัด · ไม่เกิน 8 วินาที · แตะหยุดเมื่อเสร็จ'),'recording');
   timer=setTimeout(()=>{if(token===epoch&&active.state==='recording')active.stop();},8000);
  }catch(error){if(token===epoch){stop();message(errorText(error.name==='NotAllowedError'?'not-allowed':'start-failed'),'error');}}
 }
 function open(options){
  close();dir=options.direction;word=options.word;returnFocus=options.returnFocus||document.activeElement;
  panel=document.createElement('dialog');panel.id='voice-studio';panel.setAttribute('data-speech-skip','');panel.lang=dir==='th-zh'?'th':'zh-CN';panel.setAttribute('aria-labelledby','vs-title');
  panel.innerHTML='<header><span>'+t('开口练 · 不计时','ฝึกพูด · ไม่จับเวลา')+'</span><button data-vs="close" aria-label="'+t('返回主页','กลับหน้าหลัก')+'">×</button></header><div class="vs-scroll"><p class="vs-eyebrow">'+t('先听一遍，再说给我听','ฟังก่อน แล้วลองพูด')+'</p><h2 id="vs-title">'+t('试着说一句。','ลองพูดกัน')+'</h2><div class="vs-word"><b lang="'+lang()+'">'+esc(target())+'</b><p>'+esc(dir==='th-zh'?word.th:word.zh)+'</p></div><div class="vs-compare"><button data-vs="example">'+speaker+t('听示范','ฟังตัวอย่าง')+'</button><button data-vs="replay" disabled>'+speaker+t('我的录音','เสียงของฉัน')+'</button></div><div class="vs-feedback"><small>'+t('识别到的内容','คำที่ระบบได้ยิน')+'</small><p id="vs-transcript" aria-live="off">—</p><p id="vs-status" role="status">'+t('点击下方麦克风开始。不会自动收音。','แตะไมค์ด้านล่างเพื่อเริ่ม ไม่เปิดไมค์อัตโนมัติ')+'</p></div><label class="vs-consent"><input id="vs-network" type="checkbox"><span>'+t('允许本页练习联网识别：语音可能由系统或浏览器服务商处理。未勾选仅尝试本机识别。','อนุญาตเครือข่ายในหน้าฝึกนี้ ผู้ให้บริการระบบหรือเบราว์เซอร์อาจประมวลผลเสียง หากไม่เลือกจะลองบนเครื่องเท่านั้น')+'</span></label><p class="vs-disclosure">'+t('这里只核对识别出的文字，不是声调、音素或专业发音评分。录音回听不上服务器，关闭页面后清除，不发放通关点数。','ตรวจเฉพาะข้อความที่รู้จำ ไม่ใช่คะแนนวรรณยุกต์หรือหน่วยเสียง เสียงอัดฟังเองไม่อัปโหลดและลบเมื่อปิด ไม่ให้แต้มผ่านด่าน')+'</p></div><footer><button data-vs="speak" class="vs-mic">'+mic+t('点击说话','แตะเพื่อพูด')+'</button><button data-vs="record">'+t('只录音回听','อัดเสียงฟังเอง')+'</button><button data-vs="stop" hidden>'+t('停止','หยุด')+'</button></footer>';
  document.body.append(panel);panel.showModal();
  panel.addEventListener('cancel',e=>{e.preventDefault();close();});
  panel.addEventListener('click',e=>{
   const action=e.target.closest('[data-vs]')?.dataset.vs;
   if(action==='close')close();if(action==='speak')void speak();if(action==='example')example();if(action==='record')void record();
   if(action==='stop'){if(recorder?.state==='recording')recorder.stop();else{stop();message(errorText('cancelled'));}}
   if(action==='replay'&&audioUrl&&!busy&&!playing){stop();playing=true;replay=new Audio(audioUrl);paint();const token=epoch;const done=()=>{if(token===epoch){playing=false;paint();}};replay.onended=done;replay.onerror=done;replay.play().catch(done);}
  });
  root.XULONG_MUSIC?.hold?.('voice-studio');paint();
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&panel){stop();message(errorText('cancelled'));}});
 root.addEventListener('pagehide',close);
 root.XULONG_VOICE_STUDIO=Object.freeze({open,close});
})(globalThis);
