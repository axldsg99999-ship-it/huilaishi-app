import { ASSET, MONSTERS } from "./content.mjs?v=0.4.4";
const atlases = new Map();
const EXTENDED = {idle:0,walk:[1,2,3,4],windup:5,strike:6,recover:7,hit:8,guard:9,dodge:10,listen:11,speak:12,read:13,wave:14,victory:15};
const CLASSIC = {idle:0,walk:[1,2],windup:3,strike:4,recover:6,hit:5,guard:3,dodge:6,listen:0,speak:4,read:0,wave:0,victory:7};
export const INTERACTION_SHEETS=Object.freeze({'xiaoai-actions-v3.png':'xiaoai-interactions-v4.png','chaninda-actions-v3.png':'chaninda-interactions-v4.png','chaninda-indigo-v5.png':'chaninda-indigo-interactions-v5.png'});
export const EMOTION_SHEETS=Object.freeze({'xiaoai-actions-v3.png':'xiaoai-emotions-v6.png','chaninda-indigo-v5.png':'chaninda-emotions-v6.png'});
export const ENEMY_EMOTION_SHEETS=Object.freeze({'market-elephant-v9.png':'market-elephant-emotions-v10.png','wok-crab-v4.png':'wok-crab-emotions-v5.png'});
const interaction=(offset,pose,times)=>times.map((ms,i)=>({pose,interactionFrame:offset+i,ms}));
const feeling=(frames,pose,times)=>frames.map((emotionFrame,i)=>({pose,emotionFrame,ms:times[i]}));
// Base/letter timelines reuse the existing art. emotionFrame refers to the
// separately authored expression atlas, with a base-pose fallback per step.
export const HERO_MOMENTS = Object.freeze({
  idle:[{pose:'idle',ms:1600}],
  walk:[{pose:'walk',ms:1800},{pose:'idle',ms:500}],
  greet:[{pose:'wave',ms:850},{pose:'speak',ms:1300},{pose:'listen',ms:900},{pose:'read',ms:2200}],
  read:[{pose:'listen',ms:500},{pose:'read',ms:2200},{pose:'idle',ms:600}],
  echo:[{pose:'listen',ms:1300},{pose:'speak',ms:1500},{pose:'listen',ms:700}],
  attack:[{pose:'windup',ms:180},{pose:'strike',ms:200},{pose:'recover',ms:300},{pose:'idle',ms:600}],
  guard:[{pose:'guard',ms:1200},{pose:'recover',ms:300},{pose:'idle',ms:600}],
  dodge:[{pose:'dodge',ms:700},{pose:'recover',ms:300},{pose:'idle',ms:600}],
  hit:[{pose:'hit',ms:600},{pose:'recover',ms:400},{pose:'idle',ms:600}],
  victory:[{pose:'victory',ms:1700},{pose:'wave',ms:800},{pose:'idle',ms:600}],
  pickup:interaction(0,'read',[180,240,380,320]),
  unfold:interaction(4,'read',[280,330,1500,550]),
  offer:interaction(8,'speak',[280,340,900,450]),
  respond:interaction(12,'listen',[650,380,900,600]),
  think:feeling([0,1,2,3],'listen',[300,420,1000,450]),
  choose:feeling([3,4,5,7],'speak',[160,380,430,500]),
  retry:feeling([8,9,10,11],'read',[250,600,550,700]),
  curious:feeling([0,1,2,1],'listen',[400,700,900,550]),
  realize:feeling([2,3,4,7],'speak',[500,240,800,550]),
  explain:feeling([5,6,5,6,7],'speak',[400,320,430,350,650]),
  surprised:feeling([0,8,9,11],'hit',[250,450,550,700]),
  relieved:feeling([10,12,13,7],'listen',[650,550,850,500]),
  cheer:feeling([12,13,14,15],'victory',[400,450,850,800]),
});
export function enemyEmotion(mood='idle',elapsed=0){
 const beats={idle:[0],waiting:[0,1],audio:[2,1,2],ready:[1,3,1],choose:[1,3],linked:[4,6,7],retry:[3,5,1],listen:[1],skill:[3],read:[5],greet:[6,7],curious:[1],tease:[3],surprised:[4],warm:[7]};
 const frames=beats[mood]||beats.idle;
 return frames[Math.min(frames.length-1,Math.floor(Math.max(0,elapsed)/650))];
}
export function creatureMotionStyle(name=''){
 if(/crab|wok|pangolin|turtle|tortoise/.test(name))return 'armored';
 if(/elephant|bear|lion|tiger/.test(name))return 'heavy';
 if(/bird|hornbill|heron|kite|crane|orchid|moth/.test(name))return 'winged';
 return 'nimble';
}
// Small secondary movement only. Real authored poses still carry the acting;
// no free-running camera shake or movement of interactive answer hitboxes.
export function idleAccent(name='',elapsed=0,motion=true){
 if(!motion)return {lean:0,sway:0,lift:0,mood:null};
 const style=creatureMotionStyle(name),seed=[...name].reduce((n,c)=>n+c.charCodeAt(0),0)%1100;
 const t=Math.max(0,elapsed)+seed,beat=t%7800;
 const weights={heavy:[.002,.00045,0],armored:[.003,.0008,0],winged:[.004,.0006,.0007],nimble:[.003,.00055,0]}[style];
 const active=beat>6200&&beat<7350;
 return {lean:Math.sin(t/930)*weights[0],sway:Math.sin(t/1050)*weights[1],lift:Math.max(0,Math.sin(t/840))*weights[2],mood:active?(beat<6750?'listen':beat<7100?'greet':'read'):null};
}
// Existing drawn expressions, sequenced as acting beats, not new sprite art.
export function enemyActing(kind,elapsed=0,variant=0) {
 const beats={waiting:['read','greet','idle'],audio:['skill','listen','skill'],ready:['listen','read','idle'],choose:['listen','greet','listen'],linked:['greet','read','listen'],retry:['read','listen','greet']};
 const sequence=beats[kind]||beats.ready;
 return sequence[Math.min(2,Math.floor(Math.max(0,elapsed)/(variant%2?700:850)))];
}
export function heroFrame(count, action, elapsed=0) {
  const poses = count === 16 ? EXTENDED : CLASSIC;
  if(action==='walk') return poses.walk[Math.floor(Math.max(0,elapsed)/135)%poses.walk.length];
  return poses[action] ?? 0;
}
export function enemyFrame(count,classic,mood='idle',elapsed=0) {
  if(count!==16)return classic;
  if(classic===0||classic===7){
    if(mood==='walk')return [1,2,3,4][Math.floor(elapsed/160)%4];
    return ({listen:11,skill:12,read:13,greet:14,defeated:15,guard:9,dodge:10})[mood] ?? (classic===7?12:0);
  }
  return ({1:1,2:3,3:5,4:6,5:8,6:7})[classic]??0;
}
// Fit the entire animation envelope once, not each pose separately. Wide
// cloak/wing gestures then stay on screen without size-pumping between frames.
export function fittedActorHeight(frames, desired, maxWidth) {
  if(!frames?.length)return desired;
  const ratio=Math.max(...frames.map(f=>f.w))/frames[0].h;
  return ratio>0?Math.min(desired,maxWidth/ratio):desired;
}
export function composeBattleScene(profile,w,h,sourceWidth=1672,sourceHeight=941) {
  const portrait=h>w;
  // A deep foreground (e.g. the workshop floor) needs a shorter portrait
  // camera, otherwise its projected feet would sink into the answer controls.
  const portraitHeight=Math.min(.64,.52/(1-(1-profile.floor)*(profile.zoom||1)));
  const arenaH=h*(portrait?portraitHeight:1);
  const scale=Math.max(w/sourceWidth,arenaH/sourceHeight)*(profile.zoom||1);
  const width=sourceWidth*scale,height=sourceHeight*scale;
  const left=(w-width)*(profile.focusX??.5);
  const top=Math.max(arenaH-height,Math.min(0,h*(portrait?.52:.8)-profile.floor*height));
  return {width,height,left,top,arenaH,ground:(top+profile.floor*height)/h,heroX:portrait?.21:.16,enemyX:portrait?.75:.78,portrait};
}
export function fitActionEnvelope(frames,desired,maxWidth,maxHeight) {
  const widthFit=fittedActorHeight(frames,desired,maxWidth);
  if(!frames?.length)return Math.min(widthFit,maxHeight);
  return Math.min(widthFit,maxHeight*frames[0].h/Math.max(...frames.map(f=>f.h)));
}
export function codexFrame(count,pose,elapsed=0) {
  if(pose==='attack')return count===16?(elapsed%1000<220?5:elapsed%1000<500?6:7):(elapsed%1000<220?3:elapsed%1000<500?4:6);
  if(pose==='walk')return count===16?[1,2,3,4][Math.floor(elapsed/170)%4]:[1,2][Math.floor(elapsed/200)%2];
  const frames=count===16?{idle:0,windup:5,hit:8,guard:9,dodge:10,listen:11,skill:12,read:13,greet:14,defeated:15}:{idle:0,windup:3,hit:5,recover:6,skill:7};
  return frames[pose]??0;
}
// Measure travel in screen space: a normalized diagonal otherwise moves much
// faster horizontally on a wide phone. Ease the last few pixels, without
// asymptotically sliding forever or overshooting the requested position.
export function homeTravel(position,target,dt,w,h) {
  const dx=(target.x-position.x)*w,dy=(target.y-position.y)*h,distance=Math.hypot(dx,dy);
  if(distance<=.8)return {x:target.x,y:target.y,distance:0,arrived:true};
  const speed=Math.min(h*.34,Math.max(18,distance*5));
  const step=Math.min(distance,Math.max(0,dt)*speed),f=step/distance;
  return {x:position.x+dx*f/w,y:position.y+dy*f/h,distance:step,arrived:step===distance};
}
let frameMetadata;
const frameURL=new URL('./data/sprite-frames.json',import.meta.url);
frameURL.search=new URL(import.meta.url).search;
const metadata=()=>frameMetadata||(frameMetadata=fetch(frameURL).then(r=>r.ok?r.json():{}).catch(()=>({})));
export async function atlas(name, single = false) {
  const key=name+(single?':single':'');
  if (atlases.has(key)) return atlases.get(key);
  const task = (async () => {
    const image = new Image();
    image.src = ASSET(name);
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height),
      d = pixels.data;
    // Chroma is removed at render time. Source artwork is never overwritten.
    // The authoring spec reserves saturated green exclusively for the matte.
    let realAlpha=false;
    for(let i=3;i<d.length;i+=4)if(d[i]<250){realAlpha=true;break;}
    for (let i = 0; !realAlpha && i < d.length; i += 4) {
      const r = d[i],
        g = d[i + 1],
        b = d[i + 2];
      const magenta = name.includes('foreground-');
      if (magenta ? r>110 && b>110 && Math.min(r,b)>g*1.35 : g > 120 && g > r * 1.35 && g > b * 1.35) {
        const dominance = magenta ? Math.min(r,b)-g : g - Math.max(r, b);
        d[i + 3] = Math.round(d[i + 3] * (1 - Math.min(1, dominance / 80)));
        if (d[i + 3] > 0) {
          if(magenta){d[i]=Math.min(r,g+16);d[i+2]=Math.min(b,g+16);}
          else d[i + 1] = Math.min(g, Math.max(r, b) + 16);
        }
      }
    }
    ctx.putImageData(pixels, 0, 0);
    const frames = [];
    if(single){
      let x=canvas.width,y=canvas.height,r=0,b=0;
      for(let yy=0;yy<canvas.height;yy++)for(let xx=0;xx<canvas.width;xx++)if(d[(yy*canvas.width+xx)*4+3]>80){x=Math.min(x,xx);y=Math.min(y,yy);r=Math.max(r,xx);b=Math.max(b,yy)}
      if(r<=x||b<=y)throw Error('Empty sprite '+name);
      const f={x,y,w:r-x+1,h:b-y+1};return {canvas,frames:Array(8).fill(f),single:true};
    }
    const measured=(await metadata())[name];
    if(measured?.length>=8)return {canvas,frames:measured};
    // Expression sheets require their measured bounds: never show neighboring
    // drawings if a browser has stale/missing atlas metadata after an update.
    if(Object.values(EMOTION_SHEETS).includes(name)||Object.values(ENEMY_EMOTION_SHEETS).includes(name))throw Error('Expression crop metadata unavailable: '+name);
    const count=/^(xiaoai|chaninda)-(actions|denim|linen)-v3\.png$/.test(name)||name.endsWith('-interactions-v4.png')||name.startsWith('chaninda-indigo-')?16:MONSTERS.find(m=>m.sheet===name)?.poseCount||8;
    for (let f = 0; f < count; f++) {
      const x = Math.floor(((f % 4) * canvas.width) / 4),
        y = Math.floor((Math.floor(f / 4) * canvas.height) / (count/4)),
        w = Math.floor(canvas.width / 4),
        h = Math.floor(canvas.height / (count/4));
      let left = w,
        right = 0,
        top = h,
        bottom = 0;
      for (let yy = 2; yy < h - 2; yy++)
        for (let xx = 2; xx < w - 2; xx++) {
          const p = ((y + yy) * canvas.width + x + xx) * 4;
          if (d[p + 3] > 80) {
            left = Math.min(left, xx);
            right = Math.max(right, xx);
            top = Math.min(top, yy);
            bottom = Math.max(bottom, yy);
          }
        }
      frames.push(
        right > left
          ? {
              x: x + left,
              y: y + top,
              w: right - left + 1,
              h: bottom - top + 1,
            }
          : { x, y, w, h },
      );
    }
    return { canvas, frames };
  })().catch((error) => {
    atlases.delete(key);
    throw error;
  });
  atlases.set(key, task);
  if (atlases.size > 6) atlases.delete(atlases.keys().next().value);
  return task;
}
export class Stage {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.options = options;
    this.hero = null;
    this.enemy = null;
    this.last = performance.now();
    this.ambientStart=this.last;
    this.frame = 0;
    this.disposed = false;
    this.heroX = 0.3;
    this.heroY = options.ground ?? .8;
    this.pose = 'idle';
    this.poseUntil = 0;
    this.walkDistance = 0;
    this.performance = null;
    this.destination = null;
    this.heroFacing = 1;
    this.moving = 0;
    this.effects = [];
    this.attack = null;
    this.enemyAction = null;
    this.damageText = null;
    this.motion = true;
    this.resize = new ResizeObserver(() => this.fit());
    this.resize.observe(canvas);
    if(options.cameraImage){this.imageLoaded=()=>this.fit();options.cameraImage.addEventListener('load',this.imageLoaded);}
    this.fit();
    this.tick = this.tick.bind(this);
    this.id = requestAnimationFrame(this.tick);
    if(options.foreground)atlas(options.foreground,true).then(a=>{
      if(!this.disposed){this.foreground=a.canvas;this.canvas.dataset.foregroundReady='true';}
    }).catch(e=>this.options.onError?.(e));
  }
  fit() {
    const wasPortrait=this.h>this.w;
    const r = this.canvas.getBoundingClientRect(),
      d = Math.min(devicePixelRatio || 1, 1.5);
    this.w = r.width;
    this.h = r.height;
    if(this.options.composition){
      const image=this.options.cameraImage,p=this.options.composition;
      this.composition=composeBattleScene(p,this.w,this.h,image.naturalWidth||1672,image.naturalHeight||941);
      const c=this.composition;
      Object.assign(image.style,{width:c.width+'px',height:c.height+'px',left:c.left+'px',top:c.top+'px'});
      const scene=this.canvas.parentElement;
      scene.style.setProperty('--arena-height',c.arenaH+'px');scene.style.setProperty('--feet-y',c.ground*this.h+'px');
      scene.style.setProperty('--scene-ink',p.ink);scene.dataset.sceneLight=p.light;
      this.canvas.dataset.ground=String(c.ground);this.canvas.dataset.cameraTop=String(c.top);
    }
    if(this.options.depth && wasPortrait !== (this.h>this.w)){
      this.heroX=this.h>this.w?.25:.47;this.heroY=.84;this.destination=null;
    }
    this.canvas.width = Math.round(r.width * d);
    if(this.options.homeAnchor){this.heroX=this.options.homeAnchor[0];this.heroY=this.options.homeAnchor[1];}
    this.canvas.height = Math.round(r.height * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  async equip(name) {
    this.heroName = name;
    this.interactions=null;this.emotions=null;this.envelope=null;
    this.canvas.dataset.emotionReady='false';
    this.canvas.dataset.interactionReady='false';
    this.canvas.dataset.artReady = "false";
    try {
      const a = await atlas(name);
      if (!this.disposed && this.heroName === name) {
        this.hero = a;
        this.canvas.dataset.artReady = "true";
        this.canvas.dataset.poseCount = String(a.frames.length);
        if(INTERACTION_SHEETS[name]&&(this.options.depth||this.options.exploration||this.options.heroShowcase||this.options.battle)){
          const extra=await atlas(INTERACTION_SHEETS[name]);
          if(!this.disposed&&this.heroName===name){
            this.interactions=extra;this.canvas.dataset.interactionReady='true';
            const scale=a.frames[0].h/extra.frames[0].h;
            this.envelope=[...a.frames,...extra.frames.map(f=>({...f,w:f.w*scale,h:f.h*scale}))];
          }
        }
        if(EMOTION_SHEETS[name]){
          const art=await atlas(EMOTION_SHEETS[name]);
          if(!this.disposed&&this.heroName===name){
            this.emotions=art;this.canvas.dataset.emotionReady='true';
            const scale=a.frames[0].h/art.frames[0].h;
            this.envelope=[...(this.envelope||a.frames),...art.frames.map(f=>({...f,w:f.w*scale,h:f.h*scale}))];
          }
        }
      }
    } catch (e) {
      this.options.onError?.(e);
    }
  }
  async opponent(config, rank) {
    const descriptor=typeof config==='string'?{sheet:config}:config;
    const name=descriptor.sheet;
    this.rank = rank;
    this.enemyName = name;
    this.enemyEmotions=null;this.canvas.dataset.enemyEmotionReady='false';
    this.canvas.dataset.enemyReady='false';
    try {
      let a;
      if(descriptor.animation){
        const poses=await Promise.all(descriptor.animation.map(p=>atlas(p,true)));
        a={frames:[0,0,0,1,2,3,0,0].map(i=>({...poses[i].frames[0],canvas:poses[i].canvas}))};
      }else a=await atlas(name,descriptor.single===true);
      if (!this.disposed && this.enemyName === name) {
        this.enemy=a;this.canvas.dataset.enemyReady='true';
        if(ENEMY_EMOTION_SHEETS[name]){
          const art=await atlas(ENEMY_EMOTION_SHEETS[name]);
          if(!this.disposed&&this.enemyName===name){this.enemyEmotions=art;this.canvas.dataset.enemyEmotionReady='true';}
        }
      }
    } catch (e) {
      this.options.onError?.(e);
    }
  }
  setMotion(value) {
    this.motion = value && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  setPaused(value) {
    const now=performance.now();
    if(value){if(this.pausedAt==null)this.pausedAt=now;return;}
    if(this.pausedAt==null)return;
    const elapsed=now-this.pausedAt;
    for(const key of ['attack','enemyAction','damageText','performance','enemyPreview','emote'])if(this[key])this[key].start+=elapsed;
    for(const key of ['poseUntil','victoryUntil','enemyDefeatedAt','ambientStart'])if(Number.isFinite(this[key]))this[key]+=elapsed;
    for(const effect of this.effects||[])effect.start+=elapsed;
    this.last=now;this.pausedAt=null;
  }
  setPose(pose='idle', duration=Infinity) {
    this.performance=null;
    this.pose=pose;this.poseUntil=performance.now()+duration;
  }
  exchange(phase,mode,question) {
    const key=phase+':'+mode+':'+question;
    if(this.exchangeKey===key)return;this.exchangeKey=key;
    if(['waiting','audio','ready'].includes(phase)){
      this.emote={kind:phase,start:performance.now()};
      if(phase==='waiting')this.perform(HERO_MOMENTS.read);
      else if(phase==='audio')this.setPose('listen');
      else if(this.pose!=='guard')this.perform(HERO_MOMENTS.think);
    }else this.emote=null;
  }
  react(kind='choose') {
    if(this.attack||this.enemyAction)return;
    this.emote={kind,start:performance.now()};
    this.perform(HERO_MOMENTS[kind==='retry'?'retry':kind==='linked'?'relieved':'choose']);
    if(kind==='linked')this.emitAccent?.('paper','hero');
  }
  perform(steps) {
    this.destination=null;this.moving=0;
    this.pose='idle';this.poseUntil=0;
    this.performance={start:performance.now(),steps};
  }
  emitAccent(kind='dust',who='hero'){
    if(!this.motion||this.disposed)return;
    this.effects=this.effects.filter(e=>performance.now()-e.start<e.duration).slice(-5);
    this.effects.push({kind,who,start:performance.now(),duration:kind==='paper'?1050:720});
    if(!this.microFx&&!this.microFxTask)this.microFxTask=atlas('micro-accents-v1.png').then(a=>{if(!this.disposed)this.microFx=a;}).catch(()=>{}).finally(()=>{this.microFxTask=null;});
  }
  previewHero(moment='idle') {
    if(!Object.prototype.hasOwnProperty.call(HERO_MOMENTS,moment))return false;
    this.attack=this.enemyAction=null;this.victoryUntil=0;
    this.perform(HERO_MOMENTS[moment]);
    return true;
  }
  walkTo(x,y) {
    if(this.options.exploration){this.destination={x:Math.max(.12,Math.min(.64,x)),y:this.heroY};return;}
    if(!this.options.depth)return;
    const portrait=this.h>this.w;
    this.destination={x:Math.max(portrait?.18:.32,Math.min(portrait?.34:.61,x)),y:Math.max(.71,Math.min(.87,y))};
  }
  swing(who = "hero", crit = false) {
    // Interrupt a letter gesture before selecting the strike/hit atlas frame.
    this.performance=null;
    const t = performance.now();
    if (who === "hero") this.attack = { start: t, crit };
    else this.enemyAction = { start: t };
    this.emitAccent?.('dust',who);
    this.options.onImpact?.(who, crit);
  }
  previewEnemy(pose='idle') {
    if(!this.options.codex)return;
    this.enemyPreview={pose,start:performance.now()};this.enemyAction=null;
  }
  celebrate() {
    this.performance=null;
    this.victoryUntil = performance.now() + 2500;
    if(this.options.battle)this.enemyDefeatedAt=performance.now();
    if(this.emotions)this.perform(HERO_MOMENTS.cheer);
    this.emitAccent?.('paper','hero');
  }
  hitText(text, enemy = true) {
    this.damageText = {
      text,
      start: performance.now(),
      x: enemy ? 0.73 : this.heroX,
    };
  }
  async loadFx() {
    try {
      this.fx = await atlas("ink-impact.png");
    } catch {}
  }
  actor(a, frame, x, y, height, facing = 1, rotation = 0, offset = 0) {
    if (!a) return;
    const f = a.frames[frame] || a.frames[0];
    height *= f.h / a.frames[0].h;
    const width = (height * f.w) / f.h;
    this.ctx.save();
    this.ctx.translate(x * this.w + offset, y * this.h);
    this.ctx.scale(facing, 1);
    this.ctx.rotate(rotation);
    this.ctx.drawImage(
      f.canvas || a.canvas,
      f.x,
      f.y,
      f.w,
      f.h,
      -width / 2,
      -height,
      width,
      height,
    );
    this.ctx.restore();
  }
  tick(now) {
    if (this.disposed) return;
    // Hand-drawn poses do not need 120Hz redraws on high-refresh mobile screens.
    if(now-(this.drawAt||0)<1000/30){this.id=requestAnimationFrame(this.tick);return;}
    this.drawAt=now;
    if(this.pausedAt!=null)now=this.pausedAt;
    const dt = Math.max(0,Math.min((now - this.last) / 1000, 0.045));
    this.last = now;
    if (!document.hidden) {
      const previousX=this.heroX,previousY=this.heroY;
      let walking = false;
      if(this.moving)this.destination=null;
      else if(this.destination){
        const next=homeTravel({x:this.heroX,y:this.heroY},this.destination,dt,this.w,this.h);
        if(Math.abs(this.destination.x-this.heroX)*this.w>2)this.heroFacing=this.destination.x<this.heroX?-1:1;
        this.heroX=next.x;this.heroY=next.y;
        if(next.arrived)this.destination=null;
      }
      if (this.moving) {
        this.heroX = Math.max(
          this.options.depth ? (this.h>this.w?.18:.32) : this.options.exploration?.12:.1,
          Math.min(this.options.depth ? (this.h>this.w?.34:.61) : this.options.exploration?.64:.88, this.heroX + this.moving * dt * 0.2),
        );
        this.heroFacing = this.moving;
        this.options.onMove?.(this.heroX);
      }
      const travel=Math.hypot((this.heroX-previousX)*this.w,(this.heroY-previousY)*this.h);
      walking=travel>.001;
      if(walking){if(!this.wasWalking)this.walkDistance=0;this.walkDistance+=travel;this.performance=null;this.poseUntil=0;}
      this.wasWalking=walking;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      const count=this.hero?.frames.length||8;
      let action=walking?'walk':now<this.poseUntil?this.pose:'idle',interactionFrame=null,emotionFrame=null;
      if(!walking&&this.performance){
        let elapsed=now-this.performance.start;
        const step=this.performance.steps.find(s=>{if(elapsed<s.ms)return true;elapsed-=s.ms;return false;});
        if(step){
          action=step.pose;
          if(this.interactions&&Number.isInteger(step.interactionFrame))interactionFrame=this.motion?step.interactionFrame:[3,7,10,13][Math.floor(step.interactionFrame/4)];
          if(this.emotions&&Number.isInteger(step.emotionFrame))emotionFrame=this.motion?step.emotionFrame:(this.performance.steps.find(s=>Number.isInteger(s.emotionFrame))?.emotionFrame??0);
        }else this.performance=null;
      }
      if(!walking&&!this.performance&&now>=this.poseUntil&&this.emotions&&!this.attack&&!this.enemyAction&&(!this.emote||this.emote.kind==='ready')){
        const beat=(now-this.ambientStart)%8600;
        if(this.motion&&beat>6500&&beat<8200){emotionFrame=beat<7100?1:beat<7800?2:7;action='listen';}
      }
      // One four-drawing step cycle spans a consistent amount of ground.
      let hf = heroFrame(count,action,this.motion?(walking?this.walkDistance/Math.max(35,this.h*.12)*540:now):0),
        ef = this.phase ? 7 : 0,
        hoff = 0,
        eoff = 0,
        erot = 0,
        fxFrame = -1;
      const portraitBattle=(this.options.battle||this.options.exploration)&&this.h>this.w;
      const composed=this.composition;
      const orbit=this.options.battle&&!portraitBattle;
      const heroX=this.options.campus&&this.h>this.w?.28:orbit?.25:this.options.exploration?this.heroX:composed?.heroX ?? (portraitBattle?.21:this.heroX),enemyX=composed?.enemyX??(this.options.codex?.5:this.options.enemyX??.74);
      const ground=composed?.ground??(portraitBattle?.52:this.options.depth?this.heroY:(this.options.ground??.8));
      const envelope=this.envelope||this.hero?.frames;
      const hs = this.options.campus ? fitActionEnvelope(envelope,this.h*(this.h>this.w?.19:.32),this.w*(this.h>this.w?.35:.22),this.h*(this.h>this.w?.23:.35)) : (this.options.battle||this.options.exploration) ? fitActionEnvelope(envelope,this.h*(portraitBattle?.205:.34),this.w*(portraitBattle?.32:.20),this.h*(portraitBattle?.24:.38)) : this.options.heroShowcase ? fitActionEnvelope(envelope,this.h*.86,this.w*.82,this.h*.9) : this.h * (this.options.heroScale ?? (this.options.depth ? .23+(this.heroY-.71)*.65 : this.options.large ? 0.57 : 0.35)),
        es = (this.options.battle||this.options.exploration) ? fitActionEnvelope(this.enemy?.frames,this.h*(portraitBattle?.235:this.rank===2?.39:.33),this.w*(portraitBattle?.43:.35),this.h*Math.max(.10,ground-(portraitBattle?.34:.42))) : fitActionEnvelope(this.enemy?.frames,this.h*(this.options.codex?.66:this.rank===2?.43:.35),this.w*(this.options.codex?.88:.44),this.h*(ground-.04));
      if (this.attack) {
        let t = now - this.attack.start;
        if(this.motion&&t>300)t-=Math.min(t-300,this.attack.crit?70:40);
        action=t<180?'windup':t<380?'strike':t<630?'recover':'idle';
        hf = heroFrame(count,action);
        if (t > 240 && t < 540) {
          ef = 5;
          eoff = Math.sin(((t - 240) / 300) * Math.PI) * this.w * 0.025;
          fxFrame = t < 330 ? 3 : t < 420 ? 4 : 5;
        }
        if(this.motion&&t>=540&&t<700)eoff=Math.sin((t-540)/160*Math.PI*2)*(1-(t-540)/160)*this.w*.006;
        hoff =
          t < 430
            ? Math.sin(Math.min(t / 430, 1) * Math.PI) * this.w * 0.028
            : 0;
        if (t > 700) this.attack = null;
      }
      if (this.enemyAction) {
        const t = now - this.enemyAction.start;
        ef = t < 230 ? 3 : t < 440 ? 4 : 6;
        eoff=this.motion ? -Math.sin(Math.min(t/650,1)*Math.PI)*this.w*.035 : 0;
        if(this.enemy?.single && this.motion)erot=t<230?.055:t<440?-.09:.025;
        if (t > 290 && t < 520) {
          action=this.pose==='guard'?'guard':'hit';hf = heroFrame(count,action);
          hoff = -Math.sin(((t - 290) / 230) * Math.PI) * this.w * 0.014;
        }
        if (t > 750) this.enemyAction = null;
      }
      if (now < this.victoryUntil){action='victory';hf = heroFrame(count,action);}
      // Never allow a conversational face/body pose to conceal an actual hit.
      if(this.attack||this.enemyAction){emotionFrame=null;interactionFrame=null;}
      this.canvas.dataset.action=action;
      this.canvas.dataset.heroFrame=String(hf);
      this.canvas.dataset.interactionFrame=interactionFrame===null?'':String(interactionFrame);
      this.canvas.dataset.emotionFrame=emotionFrame===null?'':String(emotionFrame);
      this.canvas.dataset.heroSheet=emotionFrame!==null?EMOTION_SHEETS[this.heroName]:interactionFrame===null?this.heroName:INTERACTION_SHEETS[this.heroName];
      if(this.options.depth||this.options.exploration){this.canvas.dataset.heroX=String(this.heroX);this.canvas.dataset.heroY=String(ground);}
      const breath =
        this.motion && !walking && !this.attack
          ? Math.sin(now / 480) * 0.0015
          : 0;
      const calm=!this.attack&&!this.enemyAction;
      const heroIdle=idleAccent(this.heroName,now-this.ambientStart,this.motion&&calm&&!walking);
      const enemyIdle=idleAccent(this.enemyName,now-this.ambientStart,this.motion&&calm&&!this.enemyDefeatedAt);
      hoff+=heroIdle.sway*this.w;eoff+=enemyIdle.sway*this.w;erot+=enemyIdle.lean;
      if(!this.motion){hoff=0;eoff=0;erot=0;}
      if(this.options.depth){
        const g=ctx.createRadialGradient(this.heroX*this.w,ground*this.h,1,this.heroX*this.w,ground*this.h,hs*.25);
        g.addColorStop(0,'#0e25264a');g.addColorStop(1,'#0e252600');
        ctx.save();ctx.translate(0,ground*this.h*.74);ctx.scale(1,.26);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(this.heroX*this.w,ground*this.h,hs*.28,hs*.23,0,0,Math.PI*2);ctx.fill();ctx.restore();
        const spatial=[this.heroX.toFixed(4),ground.toFixed(4),(hs/this.h).toFixed(4),this.motion].join(':');
        if(spatial!==this.lastSpatial){this.lastSpatial=spatial;this.options.onSpatialUpdate?.(this.heroX,ground,hs/this.h,this.motion);}
      }
      if(this.options.battle||this.options.exploration||this.options.campus){
        for(const [x,height,offset] of [[heroX,hs,hoff],[enemyX,es,eoff]]){
          ctx.save();ctx.translate(x*this.w+offset,ground*this.h-1);ctx.scale(1,.2);
          const radius=height*.25,g=ctx.createRadialGradient(0,0,0,0,0,radius);
          g.addColorStop(0,'rgba(7,22,25,'+(this.options.composition?.shadow??.23)+')');g.addColorStop(1,'#0a212400');ctx.fillStyle=g;
          ctx.fillRect(-radius,-radius,radius*2,radius*2);ctx.restore();
        }
      }
      const flipped =
        this.enemyName === "hornbill-actions.png"
          ? [3, 4, 5, 6, 7].includes(ef)
          : this.enemyName === "orchid-actions.png"
            ? [2, 3].includes(ef)
            : false;
      const acting=this.emote&&!this.attack&&!this.enemyAction?enemyActing(this.emote.kind,this.motion?now-this.emote.start:0,(this.enemyName||'').length):enemyIdle.mood||this.enemyMood;
      ef=enemyFrame(this.enemy?.frames.length||8,ef,this.enemyDefeatedAt?(now-this.enemyDefeatedAt<1800?'defeated':'greet'):acting,this.motion?now:0);
      this.canvas.dataset.enemyMood=acting||'idle';
      if(this.enemyPreview)ef=codexFrame(this.enemy?.frames.length||8,this.enemyPreview.pose,this.motion?now-this.enemyPreview.start:400);
      this.canvas.dataset.enemyFrame=String(ef);
      this.canvas.dataset.enemyPoseCount=String(this.enemy?.frames.length||0);
      const heroArt=emotionFrame!==null?this.emotions:interactionFrame===null?this.hero:this.interactions,drawFrame=emotionFrame!==null?emotionFrame:interactionFrame===null?hf:interactionFrame;
      this.actor(
        heroArt,
        drawFrame,
        heroX,
        ground,
        hs * (1 + breath),
        this.heroFacing,
        heroIdle.lean,
        hoff,
      );
      // A small cloth pin fixed to the idle coat, never a floating name tag.
      // Extended gestures hide it rather than sliding it off the moving torso.
      if(this.options.namePin&&emotionFrame===null&&interactionFrame===null&&action==='idle'){
        const pinH=hs*.036,pinW=pinH*1.9;
        ctx.save();ctx.translate(heroX*this.w+hs*.025,ground*this.h-hs*.69);ctx.rotate(-.08);
        ctx.fillStyle=this.options.namePin==='艾'?'#8c3e2e':'#9a7440';ctx.fillRect(-pinW/2,-pinH/2,pinW,pinH);
        ctx.strokeStyle='#dccba0';ctx.lineWidth=.5;ctx.strokeRect(-pinW/2,-pinH/2,pinW,pinH);
        ctx.fillStyle='#fff0c9';ctx.font='600 '+(pinH*.8)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(this.options.namePin,0,0);ctx.restore();
      }
      if((this.options.heroShowcase||this.options.exploration||this.options.battle||this.options.campus)&&heroArt){
        const f=heroArt.frames[drawFrame],scale=hs/heroArt.frames[0].h;
        this.canvas.dataset.heroTop=String(ground*this.h-f.h*scale);
        this.canvas.dataset.heroBottom=String(ground*this.h);
        this.canvas.dataset.heroLeft=String(heroX*this.w-f.w*scale/2);
        this.canvas.dataset.heroRight=String(heroX*this.w+f.w*scale/2);
      }
      const useEnemyEmotion=this.enemyEmotions&&!this.attack&&!this.enemyAction&&!this.enemyDefeatedAt&&(!this.enemyPreview||['curious','tease','surprised','warm'].includes(this.enemyPreview.pose));
      const enemyArt=useEnemyEmotion?this.enemyEmotions:this.enemy;
      const expression=enemyEmotion(this.enemyPreview?.pose||this.emote?.kind||acting,this.motion&&this.emote?now-this.emote.start:0);
      const enemyDraw=useEnemyEmotion?expression:ef;
      this.canvas.dataset.enemyExpression=useEnemyEmotion?String(expression):'';
      this.actor(
        enemyArt,
        enemyDraw,
        enemyX,
        ground-enemyIdle.lift,
        es,
        this.options.enemyFacing ?? (flipped ? -1 : 1),
        erot,
        eoff,
      );
      if(this.options.battle||this.options.codex||this.options.exploration||this.options.campus){
        const f=enemyArt?.frames[enemyDraw];
        if(f){this.canvas.dataset.enemyTop=String(ground*this.h-es*f.h/enemyArt.frames[0].h);this.canvas.dataset.enemyLeft=String(enemyX*this.w+eoff-es*f.w/enemyArt.frames[0].h/2);this.canvas.dataset.enemyRight=String(enemyX*this.w+eoff+es*f.w/enemyArt.frames[0].h/2);}
        this.canvas.dataset.heroFeet=String(ground*this.h);this.canvas.dataset.enemyFeet=String(ground*this.h);
      }
      if(this.options.battle&&this.hero&&this.enemy){
        // Stable envelope anchors, not per-frame bobbing DOM labels. A raised
        // hand or recoil must never shove the audio control under a finger.
        const crown=ground*this.h-Math.max(...this.enemy.frames.map(f=>f.h))*es/this.enemy.frames[0].h;
        const anchors=[heroX*this.w,ground*this.h-hs,enemyX*this.w,crown].map(n=>n.toFixed(1));
        const key=anchors.join(':');
        if(key!==this.lastDialogueAnchors){
          this.lastDialogueAnchors=key;
          ['--hero-center-x','--hero-crown-y','--enemy-center-x','--enemy-crown-y'].forEach((name,i)=>this.canvas.parentElement.style.setProperty(name,anchors[i]+'px'));
          this.canvas.dispatchEvent(new Event('dialogueanchors'));
        }
      }
      if(this.foreground){
        const shift=this.motion?(this.heroX-.42)*-42:0,vertical=this.motion?(this.heroY-.79)*-35:0;
        ctx.drawImage(this.foreground,-this.w*.025+shift,-this.h*.025+vertical,this.w*1.05,this.h*1.05);
      }
      this.effects=this.effects.filter(e=>now-e.start<e.duration);
      this.canvas.dataset.microEffects=String(this.motion?this.effects.length:0);
      if(this.microFx&&this.motion)for(const e of this.effects){
        const t=Math.max(0,now-e.start)/e.duration,whoX=e.who==='hero'?heroX:enemyX;
        const indices=e.kind==='dust'?[0,1]:e.kind==='paper'?[2,3,6,7]:[4,5];
        const frame=indices[Math.min(indices.length-1,Math.floor(t*indices.length))];
        ctx.save();ctx.globalAlpha=(1-t)*.55;
        // Ground-level hand-painted accents never cover the answer/face lanes.
        this.actor(this.microFx,frame,whoX+(e.who==='hero'?.027:-.027),ground-(e.kind==='paper'?t*.04:0),this.h*(e.kind==='dust'?.035:.05),1,0,0);
        ctx.restore();
      }
      if (this.fx && fxFrame >= 0 && this.motion)
        this.actor(this.fx, fxFrame, enemyX, ground-es/this.h*.22, this.h * (portraitBattle?.11:.20), 1);
      if (this.damageText) {
        const elapsed = now - this.damageText.start;
        if (elapsed < 780) {
          ctx.save();
          ctx.globalAlpha = 1 - elapsed / 780;
          ctx.fillStyle = "#f6da88";
          ctx.strokeStyle = "#172b34";
          ctx.lineWidth = 5;
          ctx.font = "700 " + Math.max(21, this.h * 0.055) + "px system-ui";
          ctx.textAlign = "center";
          const isEnemy=this.damageText.x===.73;
          const x = (isEnemy?enemyX:heroX) * this.w,
            y = ground*this.h-(isEnemy?es:hs)*.8 - (this.motion?elapsed * 0.02:0);
          ctx.strokeText(this.damageText.text, x, y);
          ctx.fillText(this.damageText.text, x, y);
          ctx.restore();
        } else this.damageText = null;
      }
    }
    this.id = requestAnimationFrame(this.tick);
  }
  destroy() {
    this.disposed = true;
    cancelAnimationFrame(this.id);
    this.resize.disconnect();
    this.options.cameraImage?.removeEventListener('load',this.imageLoaded);
    this.hero = this.enemy = null;
    this.interactions=this.emotions=this.enemyEmotions=this.envelope=null;
    this.foreground=null;
    this.fx=null;
    this.microFx=null;this.effects=[];
    this.canvas.width = 1;
    this.canvas.height = 1;
  }
}
