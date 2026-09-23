export const NAMES = ['river','courtyard','market','bridge','library','lantern','memory','swallow','rabbit','squirrel','elephant','mantis','bear','hero-idle','hero-cast','hero-cheer','girl-idle','girl-cast','dog','water','book','rice','sling','platform','seal','elephant-speak','elephant-cheer','mantis-cast','mantis-hit','bear-cheer','bear-cast','dog-run-1','dog-run-2','dog-run-3','dog-sit','dog-catch','dog-paw'];
export async function loadArt(progress) {
 for(const person of ['hero','girl'])for(const face of ['rest','focus','strain','release','happy','oops']){const key='draw3-'+person+'-face-'+face;if(!NAMES.includes(key))NAMES.push(key);}
 if(!NAMES.includes('lamp-1'))NAMES.push('lamp-1','lamp-2','lamp-3','lamp-lit-1','lamp-lit-2','lamp-lit-3');
 const rigResponse=await fetch(new URL('./assets/draw3-rig.json',import.meta.url));if(!rigResponse.ok)throw Error('Draw rig unavailable');
 const art = {drawRig:await rigResponse.json()};
 for(const person of Object.values(art.drawRig))for(const part of Object.values(person))if(!NAMES.includes(part.key))NAMES.push(part.key);
 let done = 0;
 await Promise.all(NAMES.map(name => new Promise((resolve, reject) => {
  const image = new Image(); image.onload = () => { art[name] = image; progress?.(++done / NAMES.length); resolve(); }; image.onerror = () => reject(Error(name)); image.src = new URL('./assets/' + name + '.webp', import.meta.url).href;
 })));
 await Promise.all(['basket','canopy'].map(name=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{art['obstacle-'+name]=img;resolve();};img.onerror=()=>reject(Error('obstacle '+name));img.src=new URL('./assets/play2-'+name+'.webp',import.meta.url).href;})));
 return art;
}
export function sprite(c, image, x, foot, height, { angle = 0, sx = 1, sy = 1, alpha = 1, flip = false } = {}) {
 if (!image) return; const w = height * image.width / image.height;
 c.save(); c.translate(x, foot); c.rotate(angle); c.scale(flip ? -sx : sx, sy); c.globalAlpha *= alpha; c.drawImage(image, -w/2, -height, w, height); c.restore();
}
export function cover(c, image, x = 0, y = 0, w = 1280, h = 720) { const s = Math.max(w / image.width, h / image.height), dw = image.width * s, dh = image.height * s; c.drawImage(image, x + (w - dw)/2, y + (h - dh)/2, dw, dh); }
export const COLOURS = ['#cf795f', '#568c90', '#d3a653', '#eee1c7', '#314d57'];
export class Effects {
 constructor() { this.bits = []; this.rings = []; this.sweeps = []; this.shake = 0; this.freeze = 0; this.reduced = false; }
 clear() { this.bits = []; this.rings = []; this.sweeps = []; this.shake = 0; this.freeze = 0; }
 release(x,y,power) {
  this.shake=this.reduced?0:.04+power*.1;
  const count=this.reduced?5:Math.round(12+power*18);
  for(let i=0;i<count;i++){const a=Math.PI*.55+Math.random()*Math.PI*.8,v=35+Math.random()*(80+power*160);this.bits.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-90,life:.35+Math.random()*.5,max:1,size:2+Math.random()*4,angle:Math.random()*6,spin:(Math.random()-.5)*5,col:COLOURS[i%COLOURS.length],kind:i%4});}
 }
 burst(x, y, power = 1, tint = 0) {
  const count = this.reduced ? 16 : Math.round(48 + power * 20); this.shake = this.reduced ? 0 : .28; this.freeze = this.reduced ? 0 : .065;
  for (let i = 0; i < count; i++) { const a = Math.random() * Math.PI * 2, v = (80 + Math.random() * 250) * power; this.bits.push({ x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,life:.6+Math.random()*.9,max:1.5,size:3+Math.random()*9,angle:Math.random()*6,spin:(Math.random()-.5)*9,col:COLOURS[(i+tint)%COLOURS.length],kind:i%4 }); }
  this.rings.push({x,y,life:.6,col:COLOURS[tint%COLOURS.length],power});
  if (this.bits.length > 400) this.bits.splice(0, this.bits.length - 400);
 }
 sweep(x,y,tx,ty,col='#365d68') { this.sweeps.push({x,y,tx,ty,col,life:.5}); }
 update(dt) { this.shake=Math.max(0,this.shake-dt); this.freeze=Math.max(0,this.freeze-dt); for(const p of this.bits){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;p.vx*=Math.pow(.45,dt);p.angle+=p.spin*dt;} this.bits=this.bits.filter(p=>p.life>0);for(const p of this.rings)p.life-=dt;this.rings=this.rings.filter(p=>p.life>0);for(const p of this.sweeps)p.life-=dt;this.sweeps=this.sweeps.filter(p=>p.life>0); }
 draw(c) {
  c.save();
  for(const s of this.sweeps){const t=1-s.life/.5;c.globalAlpha=Math.sin(t*Math.PI)*.9;c.strokeStyle=s.col;c.lineWidth=11*(1-t)+2;c.lineCap='round';c.beginPath();c.moveTo(s.x,s.y);c.quadraticCurveTo((s.x+s.tx)/2,s.y-170,s.tx,s.ty);c.stroke();c.strokeStyle='#fff3d8';c.lineWidth=3;c.stroke();}
  for(const p of this.rings){const t=1-p.life/.6;c.globalAlpha=(1-t)*.8;c.strokeStyle=p.col;c.lineWidth=4*(1-t);c.beginPath();c.ellipse(p.x,p.y,20+t*95*p.power,10+t*50*p.power,-.2,0,Math.PI*2);c.stroke();for(let i=0;i<10;i++){const a=i*Math.PI/5;c.beginPath();c.moveTo(p.x+Math.cos(a)*t*80,p.y+Math.sin(a)*t*65);c.lineTo(p.x+Math.cos(a)*(t*100+12),p.y+Math.sin(a)*(t*85+12));c.stroke();}}
  for(const p of this.bits){c.save();c.globalAlpha=Math.min(1,p.life*2);c.translate(p.x,p.y);c.rotate(p.angle);c.fillStyle=p.col;if(p.kind===0){c.beginPath();c.ellipse(0,0,p.size,p.size*.35,0,0,Math.PI*2);c.fill();}else{c.beginPath();c.moveTo(-p.size,0);c.lineTo(0,-p.size*.5);c.lineTo(p.size*.7,0);c.lineTo(0,p.size*.65);c.closePath();c.fill();c.strokeStyle='rgba(70,50,35,.18)';c.lineWidth=.8;c.stroke();}c.restore();}
  c.restore();
 }
}
export function shadow(c,x,y,w,alpha=.16){c.save();c.fillStyle='rgba(35,40,41,'+alpha+')';c.beginPath();c.ellipse(x,y,w,w*.15,0,0,Math.PI*2);c.fill();c.restore();}
export function seal(c,x,y,r,col='#a95543',text='印'){c.save();c.translate(x,y);c.rotate(-.12);c.strokeStyle=col;c.fillStyle=col;c.lineWidth=2;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();c.beginPath();c.arc(0,0,r-6,0,Math.PI*2);c.stroke();c.font=(r*.9)+'px WenKai,serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,0,1);c.restore();}
