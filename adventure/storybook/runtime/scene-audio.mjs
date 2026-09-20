// Quiet, offline procedural ambience. These are designed textures, not field recordings
// or character voices. Teaching audio and microphone capture always own the foreground.
export const SOUNDSCAPES=Object.freeze({
 river:[430,.022,1200,7.8,'water'],canal:[350,.018,880,9.2,'water'],
 market:[660,.013,650,6.4,'wood'],'night-market':[310,.016,740,9.8,'metal'],
 tea:[800,.008,960,12.2,'ceramic'],station:[180,.021,180,10.4,'wood'],
 ferry:[260,.021,590,8.4,'water'],archive:[370,.012,760,14.4,'wood'],
 library:[270,.005,580,18.2,'paper'],bookstreet:[460,.011,720,13.6,'paper'],
 workshop:[230,.012,430,8.9,'wood'],backstage:[220,.009,530,12.8,'wood'],
 bells:[240,.014,440,16.4,'metal'],clock:[170,.017,330,11.8,'metal'],
 school:[700,.012,1580,10.9,'bird'],dorm:[420,.005,590,19.3,'paper'],
 academy:[290,.006,740,17.6,'paper'],classroom:[570,.006,800,15.7,'wood'],
 sports:[830,.017,220,7.3,'ball'],
});
export function soundSignature(key,mood){const preset=SOUNDSCAPES[mood];if(!preset)return null;const seed=[...key].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);return {key,mood,seed,filter:preset[0]+seed%57,volume:preset[1],pitch:preset[2]*(.93+(seed%17)/100),interval:preset[3]+(seed%10)/10,kind:preset[4]};}
let context,bus,source,filter,timer,enabled=false,hidden=false,scene=null,ducked=false,gesture=false,serial=0;
const blockers=new Set();
const accents=new Set();
export const sceneAudioState=()=>({enabled,scene:scene?.key||null,mood:scene?.mood||null,playing:!!source&&context?.state==='running'&&!blocked(),blocked:blockers.size,ducked,context:context?.state||'uninitialized',hidden,gesture});
function blocked(){return !enabled||hidden||blockers.size>0||!scene||!gesture;}
function stop(){if(timer)clearTimeout(timer);timer=null;for(const accent of accents){try{accent.osc.stop();}catch{}accent.osc.disconnect();accent.gain.disconnect();}accents.clear();if(source){try{source.stop();source.disconnect();}catch{}source=null;}filter?.disconnect();filter=null;}
function texture(ctx){const b=ctx.createBuffer(1,ctx.sampleRate*8,ctx.sampleRate),d=b.getChannelData(0);let seed=29,v=0;for(let i=0;i<d.length;i++){seed=(seed*1664525+1013904223)>>>0;v=.975*v+.025*(seed/2147483648-1);d[i]=v*3;}const edge=Math.floor(ctx.sampleRate*.035);for(let i=0;i<edge;i++){d[i]*=i/edge;d[d.length-1-i]*=i/edge;}return b;}
let noise;
function gain(){if(!context||!bus)return;bus.gain.cancelScheduledValues(context.currentTime);bus.gain.setTargetAtTime(blocked()?0:ducked?.008:1,context.currentTime,.16);}
function ornament(){
 if(blocked()||!source||!context)return;const stamp=serial,s=scene,t=context.currentTime;
 // Infrequent material accents: no whistles, intelligible crowd speech or alarms.
 const count=s.kind==='bird'?2:s.kind==='water'?3:1;
 for(let i=0;i<count;i++){
  const osc=context.createOscillator(),a=context.createGain();osc.type='sine';
  const start=t+i*.14,duration=s.kind==='metal'?1.2:s.kind==='water'?.3:.18;
  osc.frequency.setValueAtTime(s.pitch*(1+i*.18),start);osc.frequency.exponentialRampToValueAtTime(s.pitch*(s.kind==='bird'?1.28:.73),start+duration);
  a.gain.setValueAtTime(0,start);a.gain.linearRampToValueAtTime(s.kind==='metal'?.012:.009,start+.015);a.gain.exponentialRampToValueAtTime(.00001,start+duration);osc.connect(a).connect(bus);const accent={osc,gain:a};accents.add(accent);osc.start(start);osc.stop(start+duration+.02);osc.onended=()=>{accents.delete(accent);osc.disconnect();a.disconnect();};
 }
 timer=setTimeout(()=>{if(stamp===serial)ornament();},s.interval*1000);
}
function sync(){
 gain();if(blocked()){stop();if(context?.state==='running')context.suspend().catch(()=>{});return;}
 const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;
 try{
  context??=new Audio();bus??=context.createGain();if(!bus.connected){bus.connect(context.destination);bus.connected=true;}gain();
  context.resume().catch(()=>{});if(source)return;
  noise??=texture(context);source=context.createBufferSource();source.buffer=noise;source.loop=true;
  filter=context.createBiquadFilter();filter.type='bandpass';filter.frequency.value=scene.filter;filter.Q.value=.45;
  const a=context.createGain();a.gain.value=scene.volume;source.connect(filter).connect(a).connect(bus);source.onended=()=>a.disconnect();source.start();
  const stamp=serial;timer=setTimeout(()=>{if(stamp===serial)ornament();},2000+(scene.seed%1800));
 }catch{stop();}
}
export function setSoundScene(key,mood){const next=soundSignature(key,mood);if(scene?.key===next?.key)return;serial++;stop();scene=next;sync();}
export function setSceneSoundEnabled(value){enabled=!!value;sync();}
export function setSceneSoundHidden(value){hidden=!!value;sync();}
export function duckSceneSound(value){ducked=!!value;gain();}
export function blockSceneSound(key,value){if(value)blockers.add(key);else blockers.delete(key);sync();}
export function wakeSceneSound(){gesture=true;sync();}
if(typeof document!=='undefined'){
 document.addEventListener('pointerdown',wakeSceneSound,{passive:true});
 document.addEventListener('keydown',wakeSceneSound);
 document.addEventListener('visibilitychange',()=>setSceneSoundHidden(document.hidden));
 globalThis.addEventListener('pagehide',()=>setSceneSoundHidden(true));
 globalThis.addEventListener('pageshow',()=>setSceneSoundHidden(document.hidden));
 globalThis.addEventListener('blur',()=>setSceneSoundHidden(true));
 globalThis.addEventListener('focus',()=>setSceneSoundHidden(document.hidden));
}
