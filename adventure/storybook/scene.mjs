import { atlas } from "./runtime/renderer.mjs";
import { loadBattleArt } from "./assets/battle-art-v2.mjs";
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
  const [hero, backdrop, enemy, pet, comic, battle] = await Promise.all([
    image(file("xiaoai-qingzhu-poses-v1.png")),
    image(file("river-pier-v1.png")),
    atlas("orchid-v7.png"),
    atlas("companions-young-v2.png"),
    image(file("memory-letter-v1.png")),
    loadBattleArt(),
  ]);
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
    const backdrop=this.view==='battle' ? art.battle.backdrop : art.backdrop;
    const scale = Math.max(w / backdrop.width, h / backdrop.height),
      bw = backdrop.width * scale,
      bh = backdrop.height * scale;
    c.drawImage(backdrop, (w - bw) / 2, (h - bh) / 2, bw, bh);
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
    shade.addColorStop(0, this.view==='battle' ? '#241a0e12' : "#081b2066");
    shade.addColorStop(0.22, "#081b2000");
    shade.addColorStop(0.74, "#081b2000");
    shade.addColorStop(1, this.view==='battle' ? '#21180a60' : "#081b2099");
    c.fillStyle = shade;
    c.fillRect(0, 0, w, h);
    if (["memory","map","route","route-end"].includes(this.view)) return;
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
    const hx = w * (combat ? 0.285 : reward ? 0.28 : 0.4),
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
      const frame={strike:1,guard:2,hit:2,speak:3,wave:3,victory:3}[this.pose] || 0;
      this.battleActor(art.battle.heroFrames,frame,hx,ground,h*.46,{
        lift:breathe,dx:lunge,lean:this.motion&&this.pose==='hit'?-.045:0,
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
      ph = h * 0.17;
    this.shadow(px, ground, w * 0.022);
    const petFrame = (this.charm ? 8 : 0) + this.petPose;
    this.actor(art.pet, petFrame, px, ground, ph, 235, {
      lift:
        this.motion && this.petPose === 3
          ? Math.abs(Math.sin(t / 200)) * h * 0.022
          : 0,
    });
    if (combat || (reward && h > 500)) {
      const ex = w * (combat ? 0.755 : 0.48),
        eh = h * (combat ? 0.37 : 0.31);
      if(combat) {
        const frame=this.enemyPose===6?1:this.enemyPose===8?2:[12,14].includes(this.enemyPose)?3:0;
        this.battleActor(art.battle.enemyFrames,frame,ex,ground,h*.435,{
          lift:breathe*.7,lean:this.motion&&this.enemyPose===8?.045:0,
        });
      } else {
        this.shadow(ex, ground, w * 0.044);
        this.actor(art.enemy, this.enemyPose, ex, ground, eh, 194, {
        lift: breathe * 0.7,
        lean: this.motion && this.enemyPose === 8 ? 0.08 : 0,
        });
      }
    }
    this.drawEffects();
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
