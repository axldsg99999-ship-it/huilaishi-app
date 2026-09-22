export class Sound {
 constructor(onStatus) { this.onStatus = onStatus; this.token = 0; this.enabled = true; this.current = null; this.playing = false; this.ctx = null; this.endCurrent = null; this.buffers=new Map(); this.request=null; }
 unlock() { try { const AC = window.AudioContext || window.webkitAudioContext; this.ctx ||= new AC(); if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); } catch {} }
 stop() { this.token++;this.request?.abort();this.request=null;if(this.current){this.current.onended=null;try{this.current.stop();}catch{}}this.current=null;this.playing=false;this.endCurrent?.(false);this.endCurrent=null;this.onStatus?.('idle'); }
 async word(id, lang) {
  // One gesture-unlocked AudioContext for all speech: no per-question autoplay element.
  this.stop();this.unlock();const token=this.token,key=id+'-'+lang;
  this.playing=true;this.onStatus?.('playing');
  return new Promise(resolve => {
   let done=false,audio=null;const request=new AbortController();this.request=request;
   const finish=ok=>{if(done)return;done=true;clearTimeout(timer);if(audio){audio.onended=null;try{audio.stop();}catch{}}request.abort();if(token===this.token){this.playing=false;this.current=null;this.request=null;this.endCurrent=null;this.onStatus?.(ok?'idle':'error');}resolve(ok);};
   const timer=setTimeout(()=>finish(false),10000);this.endCurrent=finish;
   (async()=>{
    if(!this.ctx)throw Error('Audio not supported');await this.ctx.resume();
    let buffer=this.buffers.get(key);
    if(!buffer){const response=await fetch(new URL('./assets/audio/'+key+'.mp3',import.meta.url),{signal:request.signal});if(!response.ok)throw Error('Voice unavailable');buffer=await this.ctx.decodeAudioData(await response.arrayBuffer());this.buffers.set(key,buffer);}
    if(done||token!==this.token)return;audio=this.ctx.createBufferSource();const gain=this.ctx.createGain();gain.gain.value=.95;audio.buffer=buffer;audio.connect(gain);gain.connect(this.ctx.destination);this.current=audio;audio.onended=()=>finish(true);audio.start();
   })().catch(()=>finish(false));
  });
 }
 tone(freq, duration, volume = 0.06, type = 'sine', delay = 0, endFreq) {
  if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
  const c = this.ctx, t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
  g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(volume, t + 0.015); g.gain.exponentialRampToValueAtTime(0.001, t + duration);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + duration + 0.04);
 }
 noise(duration = 0.18, volume = 0.045, high = 1200) {
  if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
  const c = this.ctx, buffer = c.createBuffer(1, Math.ceil(c.sampleRate * duration), c.sampleRate), a = buffer.getChannelData(0);
  for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / a.length, 2);
  const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); n.buffer = buffer; f.type = 'bandpass'; f.frequency.value = high; g.gain.value = volume; n.connect(f); f.connect(g); g.connect(c.destination); n.start();
 }
 fx(kind, combo = 0) {
  if (kind === 'select') { this.tone(480, .07, .024); this.noise(.055, .035, 2300); }
  if (kind === 'pull') this.tone(150 + combo * 190, .06, .012, 'triangle');
  if (kind === 'launch') { this.noise(.23, .12, 750); this.tone(330, .25, .05, 'triangle', 0, 90); }
  if (kind === 'hit') { this.noise(.2, .16, 1400); this.tone(95, .18, .15, 'triangle', 0, 35); [523,659,784].forEach((n, i) => this.tone(n * (1 + Math.min(combo, 5) * .035), .34, .06, 'sine', .055 + i * .07)); }
  if (kind === 'wrong') { this.noise(.14, .06, 650); this.tone(240, .2, .05, 'triangle', 0, 150); }
  if (kind === 'miss') { this.noise(.28, .07, 500); this.tone(340, .18, .022, 'sine', .06, 240); }
  if (kind === 'step') { this.noise(.1, .045, 1800); this.tone(420, .12, .025); }
  if (kind === 'win') [392,523,659,784,1046].forEach((n,i)=>this.tone(n,.65,.065,'sine',i*.11));
  if (kind === 'lamp') this.tone(440 * Math.pow(2, combo / 5), .5, .065);
 }
 ambience(scene) { if (this.playing) return; const f = { river: 760, courtyard: 980, market: 600, bridge: 690, library: 430, lantern: 1120 }[scene] || 660; this.tone(f, 1.9, .006); this.noise(.6, .008, scene === 'library' ? 2000 : 440); }
}
