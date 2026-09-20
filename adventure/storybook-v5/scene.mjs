import { atlas } from "./runtime/renderer.mjs";
import { loadBattleArt, crop } from "./assets/battle-art-v2.mjs";
import {Exchange} from './assets/exchange-v4.mjs';
const file = (name) => new URL("./assets/" + name, import.meta.url).href;
const image = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(Error("画面未能加载：" + src));
    img.src = src;
  });
// Authored atlas has variable-width action silhouettes. Explicit envelopes
// prevent a sweeping sleeve or outstretched foot sampling the adjacent pose.
const HERO_BOUNDS = [
  [130, 0, 280, 474],
  [529, 0, 282, 474],
  [920, 10, 326, 464],
  [1380, 0, 333, 463],
  [40, 473, 471, 414],
  [515, 479, 376, 408],
  [936, 473, 357, 414],
  [1404, 464, 332, 423],
];
const POSES = {
  idle: 0,
  think: 1,
  listen: 2,
  speak: 3,
  strike: 4,
  guard: 5,
  hit: 6,
  victory: 7,
  wave: 7,
};
export async function loadArt() {
  const [hero, backdrop, enemy, dogSheet, comic, battle, route] = await Promise.all([
    image(file("xiaoai-qingzhu-poses-v1.png")),
    image(file("river-pier-v1.png")),
    atlas("orchid-v7.png"),
    image(file("ajian-dog-v3.png")),
    image(file("memory-dog-v3.png")),
    loadBattleArt(),
    image(file("river-route-v3.png")),
  ]);
  const dogFrames=Array.from({length:4},(_,i)=>crop(dogSheet,[i%2*dogSheet.width/2,Math.floor(i/2)*dogSheet.height/2,dogSheet.width/2,dogSheet.height/2],true));
  const petCanvas=document.createElement('canvas');petCanvas.width=1200;petCanvas.height=400;
  const petCtx=petCanvas.getContext('2d'),petFrames=[];
  dogFrames.forEach((im,i)=>{const scale=Math.min(270/im.height,290/im.width),h=im.height*scale,w=im.width*scale;petCtx.drawImage(im,i*300+(300-w)/2,400-h,w,h);petFrames.push({x:i*300+(300-w)/2,y:400-h,w,h});});
  // Existing pet interactions use 0=idle, 2=help, 3=celebrate, 8=outfit.
  const pet={canvas:petCanvas,frames:Array.from({length:16},(_,i)=>petFrames[[0,3,2,1,0,3,2,1][i%8]])};
  const frames = HERO_BOUNDS.map(([x, y, w, h]) => ({ x, y, w, h }));
  const portrait = document.createElement("canvas");
  portrait.width = 160;
  portrait.height = 160;
  const c = portrait.getContext("2d");
  c.fillStyle = "#e6d3ab";
  c.fillRect(0, 0, 160, 160);
  c.drawImage(hero, 205, 0, 144, 144, 0, 0, 160, 160);
  return {
    hero: { canvas: hero, frames },
    backdrop,
    enemy,
    pet,
    comic,
    portrait: portrait.toDataURL(),
    battle,
    route,
  };
}
export class PierScene {
  constructor(canvas, art, { motion = true, onTick = () => {} } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.art = art;
    this.motion = motion;
    this.onTick = onTick;
    this.view = "home";
    this.time = 0;
    this.last = performance.now();
    this.pose = "idle";
    this.poseEnd = 0;
    this.enemyPose = 0;
    this.petPose = 0;
    this.petEnd = 0;
    this.enemyEnd = 0;
    this.effects = [];
    this.paused = false;
    this.charm = false;
    this.resize = () => {
      this.w = canvas.clientWidth;
      this.h = canvas.clientHeight;
      const d = Math.min(devicePixelRatio || 1, 2);
      canvas.width = this.w * d;
      canvas.height = this.h * d;
      this.ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(canvas);
    this.resize();
    this.frame = requestAnimationFrame((t) => this.loop(t));
  }
  setView(view) {
    this.exchange=null;
    this.enemyTell=null;
    this.view = view;
    this.effects = [];
    this.pose = "idle";
    this.enemyPose = 0;
    this.petPose = 0;
    this.poseEnd = 0;
    this.enemyEnd = 0;
  }
  act(pose, ms = 1400) {
    this.pose = pose;
    this.poseEnd = this.time + ms;
  }
  enemyAct(pose, ms = 1200) {
    this.enemyPose = pose;
    this.enemyEnd = this.time + ms;
  }
  petAct(pose = 3, ms = 1700) {
    this.petPose = pose;
    this.petEnd = this.time + ms;
  }
  burst(kind = "correct", x = 0.76, y = 0.6) {
    if (this.motion) this.effects.push({ kind, x, y, at: this.time });
  }
  setEncounter(id='orchid'){this.encounter=this.art.battle.roster[id]||this.art.battle;this.enemyId=id;}
  setTell(stance){this.enemyTell=stance;}
  exchangeAnswer(record,callbacks={}){
    this.exchange=new Exchange(record,{...callbacks,motion:this.motion});
    this.act(record.correct?(record.stance==='guard'?'guard':'strike'):'guard',1300);
    this.enemyAct(record.correct?0:6,1300);
  }
  setPaused(value) {
    this.paused = value;
    this.last = performance.now();
  }
  destroy() {
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
  }
  loop(t) {
    const dt = Math.min(50, Math.max(0, t - this.last));
    this.last = t;
    if (!this.paused) {
      this.time += dt;
      this.exchange?.tick(dt);
      this.onTick(dt);
    }
    this.draw();
    this.frame = requestAnimationFrame((t) => this.loop(t));
  }
  actor(
    atlas,
    frame,
    x,
    y,
    height,
    baseHeight,
    { lean = 0, lift = 0, dx = 0 } = {},
  ) {
    const c = this.ctx,
      f = atlas.frames[frame] || atlas.frames[0],
      scale = height / baseHeight,
      w = f.w * scale,
      h = f.h * scale;
    c.save();
    c.translate(x + dx, y - lift);
    c.rotate(lean);
    c.drawImage(atlas.canvas, f.x, f.y, f.w, f.h, -w / 2, -h, w, h);
    c.restore();
  }
  shadow(x, y, width) {
    const c = this.ctx,
      g = c.createRadialGradient(x, y, 1, x, y, width);
    g.addColorStop(0, "#18251970");
    g.addColorStop(1, "#18251900");
    c.save();
    c.translate(0, y * 0.77);
    c.scale(1, 0.23);
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(x, y, width, width, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
  battleActor(frames, frame, x, y, height, {dx=0,lift=0,lean=0}={}) {
    const c=this.ctx, im=frames[frame] || frames[0];
    const width=im.width/im.height*height;
    // Faint compressed reflection and broad contact shadow tie feet to wood.
    c.save(); c.translate(x+dx,y); c.scale(1,-0.16);
    c.globalAlpha=0.10; c.drawImage(im,-width/2,-height,width,height); c.restore();
    this.shadow(x+dx,y,width*.38);
    c.save();c.translate(x+dx,y-lift);c.rotate(lean);
    c.drawImage(im,-width/2,-height,width,height);c.restore();
  }
  draw() {
    const c = this.ctx,
      w = this.w,
      h = this.h,
      t = this.time,
      art = this.art;
    if (!w || !h) return;
    c.clearRect(0, 0, w, h);
    const encounter=this.encounter||art.battle;
    const backdrop=['battle','series'].includes(this.view) ? encounter.backdrop : ['map','route','route-end'].includes(this.view)?art.route:art.backdrop;
    const scale = Math.max(w / backdrop.width, h / backdrop.height),
      bw = backdrop.width * scale,
      bh = backdrop.height * scale;
    // Keep the landing under the actors when wide phones crop the illustration.
    const grounded=['map','battle','route','route-end','series'].includes(this.view);
    c.drawImage(backdrop, (w - bw) / 2, grounded?h-bh:(h-bh)/2, bw, bh);
    // Glints sit in the river plane; nothing drifts over the answer text.
    if (this.motion) {
      c.save();
      for (let i = 0; i < 26; i++) {
        const x = w * (0.29 + ((i * 73) % 400) / 1000),
          y = h * (0.5 + ((i * 17) % 150) / 1000);
        c.globalAlpha = 0.12 + 0.09 * Math.sin(t / 1000 + i);
        c.fillStyle = "#fff0ba";
        c.fillRect(x + Math.sin(t / 1500 + i) * 3, y, 2 + (i % 6), 1);
      }
      c.restore();
    }
    const shade = c.createLinearGradient(0, 0, 0, h);
    shade.addColorStop(0, this.view==='battle' ? '#122820b5' : "#081b2066");
    shade.addColorStop(0.22, "#081b2000");
    shade.addColorStop(0.74, "#081b2000");
    shade.addColorStop(1, this.view==='battle' ? '#21180a60' : "#081b2099");
    c.fillStyle = shade;
    c.fillRect(0, 0, w, h);
    if(this.view==='series')return;
    if(this.view==='map'){
      this.battleActor(art.battle.heroFrames,0,w*.48,h*.83,h*.31,{lift:this.motion?Math.sin(t/1100)*h*.001:0});
      this.shadow(w*.555,h*.835,w*.021);
      this.actor(art.pet,0,w*.555,h*.835,h*.125,270,{lean:this.motion?Math.sin(t/900)*.012:0});
      return;
    }
    if (["memory","route","route-end"].includes(this.view)) return;
    if (this.poseEnd && t > this.poseEnd) {
      this.pose = "idle";
      this.poseEnd = 0;
    }
    if (this.enemyEnd && t > this.enemyEnd) {
      this.enemyPose = 0;
      this.enemyEnd = 0;
    }
    if (this.petEnd && t > this.petEnd) {
      this.petPose = 0;
      this.petEnd = 0;
    }
    const combat = this.view === "battle",
      reward = this.view === "reward";
    const hx = w * (combat ? 0.24 : reward ? 0.28 : 0.4),
      ground = h * (combat ? 0.77 : 0.82),
      heroHeight = h * (combat ? 0.405 : 0.56),
      base = 470;
    const breathe = this.motion ? Math.sin(t / 1000) * h * 0.0012 : 0;
    const actionProgress = this.poseEnd
      ? Math.max(0, 1 - (this.poseEnd - t) / 1100)
      : 0;
    const lunge =
      this.motion && this.pose === "strike"
        ? Math.sin(Math.min(1, actionProgress) * Math.PI) * w * 0.045
        : 0;
    if(combat) {
      const action=this.exchange?.pose()||{heroDx:0,enemyDx:0,shake:0};
      const frame={strike:1,guard:2,hit:2,speak:3,wave:3,victory:3}[this.pose] || 0;
      this.battleActor(art.battle.heroFrames,frame,hx,ground,h*.43,{
        lift:breathe,dx:this.exchange?action.heroDx*w+action.shake:lunge,lean:this.motion&&this.pose==='hit'?-.065:0,
      });
    } else {
      this.shadow(hx, ground, w * 0.043);
      this.actor(art.hero, POSES[this.pose] ?? 0, hx, ground, heroHeight, base, {
      lift: breathe,
      dx: lunge,
      lean: this.motion && this.pose === "hit" ? -0.055 : 0,
      });
    }
    const px = hx - w * (combat ? 0.1 : 0.105),
      ph = h * (combat?.14:.17);
    this.shadow(px, ground, w * 0.022);
    const petFrame = (this.charm ? 8 : 0) + this.petPose;
    this.actor(art.pet, petFrame, px, ground, ph, 270, {
      lift:
        this.motion && this.petPose === 3
          ? Math.abs(Math.sin(t / 200)) * h * 0.022
          : 0,
    });
    if(this.charm){
      c.save();c.fillStyle='#b64737';c.strokeStyle='#efd69b';c.lineWidth=1;
      c.translate(px+ph*.19,ground-ph*.52);c.rotate(.2);c.fillRect(-4,-4,8,8);c.strokeRect(-4,-4,8,8);c.restore();
    }
    if (combat || (reward && h > 500)) {
      const ex = w * (combat ? 0.755 : 0.48),
        eh = h * (combat ? 0.37 : 0.31);
      if(combat) {
        const action=this.exchange?.pose()||{enemyDx:0,shake:0};
        const tell=this.enemyTell,calling=[12,14].includes(this.enemyPose);
        const frame=this.enemyPose===6?1:this.enemyPose===8?2:calling?3:tell==='attack'?1:0;
        const tellDx=tell==='break'?(this.motion?Math.sin(t/500)*w*.012:0):tell==='guard'?w*.012:0;
        this.battleActor(encounter.enemyFrames,frame,ex,ground,h*(this.enemyId==='elephant'?.40:.435),{
          dx:action.enemyDx*w+action.shake+tellDx,lift:breathe*.7,lean:this.motion&&this.enemyPose===8?.055:tell==='guard'?.025:0,
        });
        if(tell&&!calling)this.drawTell(tell,ex+tellDx,ground);
      } else {
        this.shadow(ex, ground, w * 0.044);
        this.actor(art.enemy, this.enemyPose, ex, ground, eh, 194, {
        lift: breathe * 0.7,
        lean: this.motion && this.enemyPose === 8 ? 0.08 : 0,
        });
      }
    }
    this.drawEffects();
    if(combat)this.drawExchange();
  }
  drawExchange(){
    const e=this.exchange;if(!e)return;
    const c=this.ctx,w=this.w,h=this.h,t=e.elapsed,r=e.record;
    if(t>1550)return;
    const target=r.correct?.755:.24,source=r.correct?.31:.70;
    const palette=this.enemyId==='orchid'?['#e8aab3','#f9e4ca','#b66561']:this.enemyId==='kite'?['#acd3c2','#f4e6c4','#cfac62']:['#e4b768','#f5e7cf','#668b7c'];
    c.save();
    if(this.motion&&t>90&&t<e.hitAt){
      const p=(t-90)/(e.hitAt-90),x=w*(source+(target-source)*p),y=h*(.58-Math.sin(p*Math.PI)*.08);
      c.strokeStyle=palette[0];c.lineWidth=3;c.lineCap='round';c.shadowColor=palette[1];c.shadowBlur=8;
      c.beginPath();c.moveTo(w*source,h*.60);c.quadraticCurveTo(w*.5,h*.43,x,y);c.stroke();
      if(r.stance==='break'){c.strokeStyle='#f3d083';c.beginPath();c.moveTo(w*source,h*.54);c.quadraticCurveTo(w*.5,h*.70,x,y+8);c.stroke();}
      c.translate(x,y);c.rotate(p*4);c.fillStyle=palette[1];c.beginPath();c.moveTo(-13,-6);c.lineTo(15,0);c.lineTo(-9,8);c.lineTo(-3,0);c.closePath();c.fill();
    }
    c.restore();
    if(t<e.hitAt)return;
    const age=t-e.hitAt,p=Math.min(1,age/900),x=w*target,y=h*.54;
    c.save();c.globalAlpha=Math.max(0,1-p*.8);
    if(r.stance==='guard'){
      c.strokeStyle='#a4d6ba';c.lineWidth=3;c.beginPath();c.ellipse(w*.31,h*.59,h*.055,h*.12,0,-1.5,1.5);c.stroke();
    }
    if(this.motion){
      c.strokeStyle=palette[1];c.lineWidth=3*(1-p)+.4;
      c.beginPath();c.ellipse(x,y,14+p*45,22+p*28,-.3,0,Math.PI*2);c.stroke();
      for(let i=0;i<24;i++){
        const a=i*2.399,d=(18+i%6*9)*Math.sin(p*Math.PI/2);
        c.save();c.translate(x+Math.cos(a)*d,y+Math.sin(a)*d+p*p*55);c.rotate(a+p*4);c.fillStyle=palette[i%3];
        // Folded paper diamonds and a small ink fleck, not neon explosions.
        c.beginPath();c.moveTo(-5,0);c.lineTo(0,-3);c.lineTo(8,0);c.lineTo(0,4);c.closePath();c.fill();c.restore();
      }
    }
    c.textAlign='center';c.textBaseline='middle';c.font='bold '+Math.max(24,h*.075)+'px Georgia';
    c.lineWidth=4;c.strokeStyle='#25342ad9';c.fillStyle=r.correct?'#fff0bd':'#ffd4c6';
    const label='−'+(r.correct?r.dealt:r.taken),yy=h*.40-(this.motion?p*22:0);
    c.strokeText(label,x,yy);c.fillText(label,x,yy);
    if(r.correct&&r.taken){c.font='bold '+Math.max(20,h*.055)+'px Georgia';c.fillStyle='#ffd4c6';c.strokeText('−'+r.taken,w*.24,yy);c.fillText('−'+r.taken,w*.24,yy);}
    if(r.armorBroken||r.sealBroken||r.correct&&(r.timing==='perfect'||r.tactical==='counter')){
      c.save();c.translate(x+h*.16,y);c.rotate(-.12);c.strokeStyle='#f8d896';c.lineWidth=1.5;
      const s=Math.max(24,h*.07);c.strokeRect(-s/2,-s/2,s,s);c.strokeRect(-s/2-3,-s/2-3,s+6,s+6);
      c.font='bold '+(s*.7)+'px Wenkai';c.fillStyle='#ffe7b8';c.fillText(r.armorBroken||r.sealBroken?'破':r.tactical==='counter'?'克':'合',0,0);c.restore();
    }
    c.restore();
  }
  drawTell(stance,x,y){
    const c=this.ctx,h=this.h,t=this.motion?this.time:0;c.save();c.lineCap='round';c.lineWidth=1.6;
    if(stance==='guard'){
      c.translate(x-h*.18,y-h*.21);const size=h*.10;c.strokeStyle='#d2dcaf';c.fillStyle='#e8e0bd44';
      c.beginPath();c.moveTo(0,size*.65);c.arc(0,size*.65,size,-2.55,-.60);c.closePath();c.fill();c.stroke();
      for(let i=0;i<4;i++){const a=-2.55+i*.65;c.beginPath();c.moveTo(0,size*.65);c.lineTo(Math.cos(a)*size,size*.65+Math.sin(a)*size);c.stroke();}
    }else if(stance==='attack'){
      c.strokeStyle='#eed3a3';for(let i=0;i<3;i++){c.globalAlpha=.4+i*.18;c.beginPath();c.moveTo(x+h*(.18+i*.018),y-h*(.05+i*.025));c.lineTo(x+h*(.27+i*.025),y-h*(.065+i*.025));c.stroke();}
    }else{
      for(let i=0;i<3;i++){const a=t/1300+i*2.1;c.save();c.translate(x+Math.cos(a)*h*.20,y-h*.23+Math.sin(a)*h*.065);c.rotate(a);c.fillStyle=['#efe0b4','#bcd5bd','#dea48b'][i];c.beginPath();c.moveTo(-7,0);c.quadraticCurveTo(0,-5,8,0);c.quadraticCurveTo(0,4,-7,0);c.fill();c.restore();}
    }
    c.restore();
  }
  drawEffects() {
    const c = this.ctx,
      w = this.w,
      h = this.h,
      t = this.time;
    this.effects = this.effects.filter((e) => t - e.at < 1300);
    for (const e of this.effects) {
      const p = (t - e.at) / 1300,
        opacity = 1 - p;
      if (p < 0) continue;
      c.save();
      c.globalAlpha = opacity;
      const x = e.x * w,
        y = e.y * h;
      if (e.kind === "correct" || e.kind === "perfect") {
        // Two brush ribbons taper from Xiao Ai's sleeve toward the guardian.
        c.lineCap = "round";
        c.strokeStyle = e.kind === "perfect" ? "#ffe5a1" : "#e9d6ad";
        c.lineWidth = (1 - p) * 3;
        c.beginPath();
        c.moveTo(w * 0.35, h * 0.62);
        c.quadraticCurveTo(w * 0.58, h * (0.39 + p * 0.13), x, y);
        c.stroke();
      }
      for (let i = 0; i < (e.kind === "reward" ? 35 : 16); i++) {
        const angle = i * 2.399,
          dist = (22 + (i % 5) * 13) * Math.sin((p * Math.PI) / 2),
          xx = x + Math.cos(angle) * dist,
          yy = y + Math.sin(angle) * dist + p * p * 65;
        c.save();
        c.translate(xx, yy);
        c.rotate(angle + p * (i % 2 ? 3 : -3));
        c.fillStyle = ["#e9d4a5", "#f2e9d2", "#b45940", "#739489"][i % 4];
        c.beginPath();
        c.moveTo(-4, -2);
        c.quadraticCurveTo(2, -6, 7, -1);
        c.quadraticCurveTo(2, 6, -4, -2);
        c.fill();
        c.restore();
      }
      c.restore();
    }
  }
}
