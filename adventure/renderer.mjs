import { ASSET } from "./content.mjs";
const atlases = new Map();
let frameMetadata;
const metadata=()=>frameMetadata||(frameMetadata=fetch(new URL('./data/sprite-frames.json',import.meta.url)).then(r=>r.ok?r.json():{}).catch(()=>({})));
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
      if (g > 120 && g > r * 1.35 && g > b * 1.35) {
        const dominance = g - Math.max(r, b);
        d[i + 3] = Math.round(d[i + 3] * (1 - Math.min(1, dominance / 80)));
        if (d[i + 3] > 0) d[i + 1] = Math.min(g, Math.max(r, b) + 16);
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
    if(measured?.length===8)return {canvas,frames:measured};
    for (let f = 0; f < 8; f++) {
      const x = Math.floor(((f % 4) * canvas.width) / 4),
        y = Math.floor((Math.floor(f / 4) * canvas.height) / 2),
        w = Math.floor(canvas.width / 4),
        h = Math.floor(canvas.height / 2);
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
    this.frame = 0;
    this.disposed = false;
    this.heroX = 0.3;
    this.heroFacing = 1;
    this.moving = 0;
    this.effects = [];
    this.attack = null;
    this.enemyAction = null;
    this.damageText = null;
    this.motion = true;
    this.resize = new ResizeObserver(() => this.fit());
    this.resize.observe(canvas);
    this.fit();
    this.tick = this.tick.bind(this);
    this.id = requestAnimationFrame(this.tick);
  }
  fit() {
    const r = this.canvas.getBoundingClientRect(),
      d = Math.min(devicePixelRatio || 1, 1.5);
    this.w = r.width;
    this.h = r.height;
    this.canvas.width = Math.round(r.width * d);
    this.canvas.height = Math.round(r.height * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  async equip(name) {
    this.heroName = name;
    this.canvas.dataset.artReady = "false";
    try {
      const a = await atlas(name);
      if (!this.disposed && this.heroName === name) {
        this.hero = a;
        this.canvas.dataset.artReady = "true";
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
    this.canvas.dataset.enemyReady='false';
    try {
      let a;
      if(descriptor.animation){
        const poses=await Promise.all(descriptor.animation.map(p=>atlas(p,true)));
        a={frames:[0,0,0,1,2,3,0,0].map(i=>({...poses[i].frames[0],canvas:poses[i].canvas}))};
      }else a=await atlas(name,descriptor.single===true);
      if (!this.disposed && this.enemyName === name) {this.enemy=a;this.canvas.dataset.enemyReady='true';}
    } catch (e) {
      this.options.onError?.(e);
    }
  }
  setMotion(value) {
    this.motion = value;
  }
  swing(who = "hero", crit = false) {
    const t = performance.now();
    if (who === "hero") this.attack = { start: t, crit };
    else this.enemyAction = { start: t };
    this.options.onImpact?.(who, crit);
  }
  celebrate() {
    this.victoryUntil = performance.now() + 2500;
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
    const f = a.frames[frame];
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
    const dt = Math.min((now - this.last) / 1000, 0.045);
    this.last = now;
    if (!document.hidden) {
      if (this.moving) {
        this.heroX = Math.max(
          0.1,
          Math.min(0.88, this.heroX + this.moving * dt * 0.2),
        );
        this.heroFacing = this.moving;
        this.options.onMove?.(this.heroX);
      }
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      let hf = this.moving ? (Math.floor(now / 170) % 2) + 1 : 0,
        ef = this.phase ? 7 : 0,
        hoff = 0,
        eoff = 0,
        erot = 0,
        fxFrame = -1;
      const hs = this.h * (this.options.large ? 0.57 : 0.35),
        es = this.h * (this.options.codex ? 0.66 : this.rank === 2 ? 0.43 : 0.35);
      if (this.attack) {
        const t = now - this.attack.start;
        hf = t < 180 ? 3 : t < 380 ? 4 : t < 600 ? 6 : 0;
        if (t > 240 && t < 540) {
          ef = 5;
          eoff = Math.sin(((t - 240) / 300) * Math.PI) * this.w * 0.025;
          fxFrame = t < 330 ? 3 : t < 420 ? 4 : 5;
        }
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
          hf = 5;
          hoff = -Math.sin(((t - 290) / 230) * Math.PI) * this.w * 0.014;
        }
        if (t > 750) this.enemyAction = null;
      }
      if (now < this.victoryUntil) hf = 7;
      const breath =
        this.motion && !this.moving && !this.attack
          ? Math.sin(now / 480) * 0.0015
          : 0;
      const ground = this.options.ground ?? 0.8;
      const flipped =
        this.enemyName === "hornbill-actions.png"
          ? [3, 4, 5, 6, 7].includes(ef)
          : this.enemyName === "orchid-actions.png"
            ? [2, 3].includes(ef)
            : false;
      this.actor(
        this.hero,
        hf,
        this.heroX,
        ground,
        hs * (1 + breath),
        this.heroFacing,
        0,
        hoff,
      );
      this.actor(
        this.enemy,
        ef,
        this.options.codex ? 0.5 : (this.options.enemyX??0.74),
        ground,
        es,
        this.options.enemyFacing ?? (flipped ? -1 : 1),
        erot,
        eoff,
      );
      if (this.fx && fxFrame >= 0 && this.motion)
        this.actor(this.fx, fxFrame, 0.73, 0.73, this.h * 0.24, 1);
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
          const x = this.damageText.x * this.w,
            y = this.h * 0.4 - elapsed * 0.02;
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
    this.hero = this.enemy = null;
    this.canvas.width = 1;
    this.canvas.height = 1;
  }
}
