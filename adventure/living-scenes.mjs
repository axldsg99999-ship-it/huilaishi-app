// Living paintings: the original composition remains a still, readable base.
// Only authored local regions move. No camera zoom, full-image wobble or GIF decode.
export const LOOP_MS=12000;
export const phaseAt=ms=>((Math.max(0,ms)%LOOP_MS)/LOOP_MS)*Math.PI*2;
const box=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
const scene=(mood,water=[],lights=[],foliage=[],mist=[])=>({mood,water,lights,foliage,mist});
const riverTH=scene('river',[[[.4,.69],[.48,.7],[.59,.7],[.57,.77],[.41,.765]]],[[.324,.33,.015],[.106,.37,.012]],[[.01,.01,.135,.125],[.76,0,.2,.14]],[[.45,.38,.16,.08]]);
const riverCN=scene('canal',[[[.51,.71],[.76,.71],[.73,.743],[.48,.743]]],[[.367,.305,.02],[.97,.418,.016]],[[0,.095,.09,.16],[.9,0,.1,.15]],[[.47,.23,.29,.07]]);
export const SCENE_LOOPS=Object.freeze({
 'th-home-v4.png':riverTH,'cn-home-v4.png':riverCN,
 'th-dawn.webp':scene('market',[],[],[],[[.39,.26,.25,.08]]),
 'cn-teahouse.png':scene('tea',[],[[.35,.115,.017],[.173,.19,.014],[.91,.19,.015]],[],[]),
 'th-market.png':scene('market',[box(.54,.57,.07,.075)],[[.165,.327,.018]],[[0,.015,.14,.16],[.83,.01,.16,.13]]),
 'cn-night-market.webp':scene('night-market',[],[[.236,.155,.021],[.34,.168,.022],[.514,.163,.019],[.701,.142,.022],[.841,.105,.021]]),
 'th-station.webp':scene('station',[],[],[[.32,.19,.065,.07]],[[.37,.49,.18,.05]]),
 'cn-canal.webp':scene('canal',[],[],[[.02,0,.13,.14],[.86,0,.13,.12]],[[.49,.35,.17,.06]]),
 'th-crossing.png':scene('ferry',[box(.57,.49,.17,.10)],[[.13,.26,.021],[.264,.322,.015]],[[.01,.01,.1,.11]]),
 'cn-workshop.png':scene('workshop',[],[[.174,.39,.018],[.70,.4,.018],[.95,.372,.013]]),
 'th-archive.png':scene('archive',[box(.39,.84,.28,.11)],[[.304,.20,.016],[.51,.239,.015],[.84,.209,.017]],[[.014,.01,.11,.16]]),
 'cn-library.webp':scene('library',[],[[.14,.338,.019],[.806,.424,.014],[.885,.235,.026]]),
 'th-bookstreet.webp':scene('bookstreet',[],[],[[.70,0,.20,.13]],[[.61,.51,.13,.08]]),
 'cn-backstage.webp':scene('backstage',[],[],[[.285,.025,.10,.095],[.87,.008,.11,.10]]),
 'th-bells.webp':scene('bells',[],[[.185,.45,.013],[.81,.445,.015],[.48,.505,.018]]),
 'clock-canal.png':scene('clock',[box(.375,.665,.36,.10)],[[.169,.207,.016],[.775,.225,.018],[.9,.155,.021]],[[.085,0,.095,.11]]),
 'campus-gate-v1.png':scene('school',[],[],[[.40,.025,.115,.15],[.77,.035,.17,.16]]),
 'campus-dorm-v1.png':scene('dorm',[],[],[[.545,.13,.08,.14]]),
 'campus-academy-v1.png':scene('academy',[],[[.82,.22,.013]],[[.1,.12,.07,.12]]),
 'campus-classroom-v1.png':scene('classroom',[],[],[[.097,.22,.12,.13]]),
 'campus-sports-v1.png':scene('sports',[],[],[[.035,.01,.20,.15],[.8,.025,.16,.14]]),
 'th-wardrobe.png':scene('workshop',[],[[.65,.25,.018]]),
});
const themeMoods={'river-rift':'river','open-letter':'library','bridge-stage':'canal','curtain-city':'backstage','post-dock':'ferry','campus-wings':'school','night-rift':'night-market','day-paper':'school','letter-window':'dorm','journey-stage':'station'};
const themeDetails={
 'open-letter':{foliage:[[.005,.79,.11,.18],[.90,.80,.095,.18]]},
 'bridge-stage':{foliage:[[.005,.845,.13,.14],[.86,.81,.13,.16]],water:[box(.49,.63,.085,.085)]},
 'curtain-city':{foliage:[[.10,.13,.10,.09],[.885,.77,.10,.17]],lights:[[.032,.25,.025]]},
 'post-dock':{foliage:[[.005,.79,.115,.18],[.9,.79,.095,.18]],lights:[[.604,.195,.015]],water:[box(.385,.61,.11,.035)]},
 'campus-wings':{foliage:[[.035,.81,.12,.17],[.88,.80,.10,.18]]},
 'night-rift':{lights:[[.215,.307,.02],[.32,.367,.014],[.414,.45,.013]],water:[box(.70,.67,.115,.08)]},
 'day-paper':{foliage:[[.005,.80,.12,.18],[.86,.77,.13,.16]]},
 'letter-window':{foliage:[[.005,.815,.13,.17],[.90,.11,.095,.14]]},
 'journey-stage':{foliage:[[.005,.81,.12,.16],[.9,.80,.095,.17]],lights:[[.93,.10,.022]]},
};
export function sceneProfile(src=''){
 const file=String(src||'').split('/').pop().split(/[?#]/)[0];
 // Public packaging changes selected PNG masters to lossless WebP. Keep their
 // authored regions and sound identity instead of silently losing the loop.
 const canonical=SCENE_LOOPS[file]?file:file.replace(/\.webp$/,'.png'),known=SCENE_LOOPS[canonical];
 if(known)return {...known,key:canonical};
 const theme=/^(th|cn)-(.+)-v1\.webp$/.exec(file);
 if(theme&&themeMoods[theme[2]]){
  const p={...scene(themeMoods[theme[2]]),...themeDetails[theme[2]]};p.key=file;
  if(theme[2]==='river-rift'){
   p.world=theme[1];p.cameo=true;
   if(p.world==='cn')p.mood='canal';
   p.water=theme[1]==='th'?[box(.465,.642,.047,.027),box(.55,.75,.018,.045)]:[box(.599,.787,.043,.023),box(.466,.72,.019,.041)];
   p.lights=theme[1]==='th'?[[.138,.28,.012],[.634,.202,.012]]:[[.136,.281,.012],[.65,.207,.024],[.895,.077,.03]];
   p.foliage=[[.005,.79,.13,.18],[.86,.84,.135,.15]];
  }
  return p;
 }
 return null;
}
// A short greeting, then a long quiet hold. Repeated taps never queue acting.
export function cameoFrame(ms,active=false){
 const sequence=active?[[1,400],[2,280],[3,440],[4,300],[3,440],[5,500],[6,1250],[7,1000]]:[[0,3000],[1,550],[2,300],[3,550],[4,350],[7,900]];
 let t=Math.max(0,ms);for(const [frame,duration]of sequence){if(t<duration)return frame;t-=duration;}return 0;
}
export function imagePlacement(sw,sh,w,h,fit='cover',px=.5,py=.5){
 if(fit==='fill')return {x:0,y:0,w,h};const scale=(fit==='contain'?Math.min:Math.max)(w/sw,h/sh);
 return {x:(w-sw*scale)*px,y:(h-sh*scale)*py,w:sw*scale,h:sh*scale};
}
function softPatch(image,region){
 const [x,y,w,h]=region,iw=image.naturalWidth,ih=image.naturalHeight;
 const c=document.createElement('canvas');c.width=Math.ceil(w*iw);c.height=Math.ceil(h*ih);const ctx=c.getContext('2d');
 ctx.drawImage(image,x*iw,y*ih,w*iw,h*ih,0,0,c.width,c.height);
 ctx.globalCompositeOperation='destination-in';
 const edge=Math.min(10,c.width/5,c.height/5),g=ctx.createLinearGradient(0,0,c.width,0);
 g.addColorStop(0,'transparent');g.addColorStop(edge/c.width,'black');g.addColorStop(1-edge/c.width,'black');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height);
 const gy=ctx.createLinearGradient(0,0,0,c.height);gy.addColorStop(0,'transparent');gy.addColorStop(edge/c.height,'black');gy.addColorStop(1-edge/c.height,'black');gy.addColorStop(1,'transparent');ctx.fillStyle=gy;ctx.fillRect(0,0,c.width,c.height);
 return {canvas:c,region};
}
export class LivingScene{
 constructor(image,{loadAtlas,onGreeting,sceneKey}={}){
  this.image=image;this.sceneKey=sceneKey;this.profile=sceneProfile(sceneKey||image?.getAttribute('src'));if(!this.profile)return;
  this.loadAtlas=loadAtlas;this.onGreeting=onGreeting;this.patches=[];this.start=performance.now();this.time=0;this.lastDraw=-Infinity;this.frameCount=0;
  this.canvas=document.createElement('canvas');this.canvas.className='living-painting';this.canvas.setAttribute('aria-hidden','true');
  Object.assign(this.canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'0'});
  image.after(this.canvas);this.ctx=this.canvas.getContext('2d');
  this.loaded=()=>this.prepare();image.addEventListener('load',this.loaded);
  if(image.complete&&image.naturalWidth)this.prepare();
 }
 async prepare(){
  if(this.disposed||!this.canvas)return;
  // A theme may have fallen back to another image after a network error.
  this.profile=sceneProfile(this.sceneKey||this.image.getAttribute('src'));this.patches=[];
  if(!this.profile){this.canvas.hidden=true;this.button?.remove();return;}
  if(!this.profile.cameo){this.clean=this.cameo=this.cleanPatch=null;this.button?.remove();this.button=null;}
  this.canvas.hidden=false;this.canvas.dataset.scene=this.profile.key;
  for(const rect of this.profile.foliage)this.patches.push(softPatch(this.image,rect));
  this.fit();
  if(this.profile.cameo&&!this.cameoLoading){
   this.cameoLoading=true;const world=this.profile.world;
   try{
    const clean=new Image();clean.src=new URL('./assets/living-scenes/'+world+'-river-clean-v1.webp',import.meta.url).href;
    const [,atlas]=await Promise.all([clean.decode(),this.loadAtlas?.('living-scenes/'+(world==='th'?'chaninda':'xiaoai')+'-window-matte-v1.png')]);
    if(this.disposed||this.profile.world!==world||!atlas)return;
    this.clean=clean;this.cameo=atlas;this.cleanPatch=softPatch(clean,world==='th'?[.275,.14,.08,.14]:[.268,.13,.092,.197]);
    const button=document.createElement('button');button.className='window-greeting';button.type='button';
    button.setAttribute('aria-label',world==='th'?'向另一边的 CHANINDA 挥手':'โบกมือให้ Xiao Ai อีกฝั่ง');
    button.addEventListener('click',()=>this.greet());this.canvas.parentElement.append(button);this.button=button;this.fit();this.canvas.dataset.cameoReady='true';
   }catch{this.canvas.dataset.cameoReady='false';} // Original painted person remains intact.
  }
 }
 fit(){
  if(!this.canvas||this.disposed)return;
  const parent=this.canvas.parentElement,r=parent.getBoundingClientRect(),ir=this.image.getBoundingClientRect();
  this.w=r.width;this.h=r.height;if(!this.w||!this.h)return;
  const d=Math.min(1.25,Math.sqrt(895000/(this.w*this.h)));this.canvas.width=Math.ceil(this.w*d);this.canvas.height=Math.ceil(this.h*d);this.ctx.setTransform(d,0,0,d,0,0);
  const css=getComputedStyle(this.image),pos=css.objectPosition.split(' ').map(v=>parseFloat(v)/100),p=imagePlacement(this.image.naturalWidth||1844,this.image.naturalHeight||853,ir.width,ir.height,css.objectFit,pos[0]||.5,pos[1]||.5);
  this.place={x:p.x+ir.left-r.left,y:p.y+ir.top-r.top,w:p.w,h:p.h};this.canvas.style.filter=css.filter;
  if(this.button){Object.assign(this.button.style,{left:(this.place.x+this.place.w*.268)+'px',top:(this.place.y+this.place.h*.13)+'px',width:Math.max(44,this.place.w*.093)+'px',height:Math.max(44,this.place.h*.17)+'px'});}
  this.lastDraw=-Infinity;
 }
 greet(){if(!this.cameo||this.paused||this.disposed)return false;if(this.greetAt!=null&&this.time-this.greetAt<1500)return false;this.greetAt=this.time;this.onGreeting?.();return true;}
 draw(ms,motion=true,paused=false){
  if(!this.canvas||this.canvas.hidden||this.disposed||!this.place)return;
  this.paused=paused;this.time=ms;this.canvas.dataset.loopState=paused?'paused':motion?'playing':'still';
  const elapsed=Math.max(0,ms),stamp=motion?Math.floor(elapsed/50):0;
  if(stamp===this.lastDraw&&motion===this.lastMotion)return;this.lastDraw=stamp;this.lastMotion=motion;
  this.canvas.dataset.loopState=paused?'paused':motion?'playing':'still';
  const c=this.ctx,p=this.place,phase=phaseAt(motion?elapsed:0);c.clearRect(0,0,this.w,this.h);c.save();c.translate(p.x,p.y);c.scale(p.w,p.h);
  if(motion){
   // Refract only water pixels in deliberately small, obstacle-free polygons.
   for(const polygon of this.profile.water){
    c.save();c.beginPath();polygon.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
    const min=Math.min(...polygon.map(a=>a[1])),max=Math.max(...polygon.map(a=>a[1]));
    const iw=this.image.naturalWidth,ih=this.image.naturalHeight;
    for(let y=min;y<max;y+=.0035){const delta=Math.sin(y*240+phase*2)*.0017;c.drawImage(this.image,0,y*ih,iw,.004*ih,delta,y,1,.004);}
    c.restore();
   }
   this.patches.forEach(({canvas,region:[x,y,w,h]},i)=>{c.drawImage(canvas,x+Math.sin(phase+i)*.0009,y+Math.cos(phase+i)*.00045,w,h);});
   this.profile.lights.forEach(([x,y,r],i)=>{c.save();c.translate(x,y);c.scale(r,r*1.8);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'rgba(255,214,126,'+(.12+.055*Math.sin(phase*2+i))+')');g.addColorStop(1,'rgba(255,203,113,0)');c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore();});
   this.profile.mist.forEach(([x,y,w,h],i)=>{c.save();c.translate(x+w/2+Math.sin(phase+i)*.007,y+h/2);c.scale(w/2,h/2);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'rgba(204,222,219,.07)');g.addColorStop(1,'rgba(204,222,219,0)');c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore();});
   // A few soft airborne paper fibres, never confetti or a foreground snowstorm.
   const indoor=['tea','workshop','archive','library','dorm','academy','classroom','backstage'].includes(this.profile.mood);
   const seed=[...this.profile.key].reduce((a,b)=>a+b.charCodeAt(0),0);
   for(let i=0;i<(indoor?5:3);i++){
    const a=phase+i*1.8+seed*.01,x=.16+((seed*7+i*163)%650)/1000+Math.sin(a)*.023,y=.18+((seed+i*61)%230)/1000+Math.cos(a)*.022;
    c.save();c.translate(x,y);c.scale(1/p.w,1/p.h);const g=c.createRadialGradient(0,0,0,0,0,1.35);g.addColorStop(0,'rgba(255,224,161,'+(indoor?.25:.17)+')');g.addColorStop(1,'rgba(255,224,161,0)');c.fillStyle=g;c.fillRect(-1.4,-1.4,2.8,2.8);c.restore();
   }
  }
  if(this.cameo&&this.cleanPatch){
   const {canvas,region:[x,y,w,h]}=this.cleanPatch;c.drawImage(canvas,x,y,w,h);
   const triggered=this.greetAt!=null&&elapsed-this.greetAt<5000,age=triggered?elapsed-this.greetAt:elapsed%32000;
   const frame=motion?cameoFrame(age,triggered):0;
   // Fixed cell size is intentional: poses must not swell as their hands move.
   const source=this.cameo.canvas,cw=source.width/4,ch=source.height/2;
   const dh=.168,dw=dh*(cw/ch)*(p.h/p.w),cx=.315,foot=this.profile.world==='th'?.282:.303;
   c.drawImage(source,(frame%4)*cw,Math.floor(frame/4)*ch,cw,ch,cx-dw/2,foot-dh,dw,dh);
   // Occlude the waist behind the existing bridge, not a floating portrait box.
   const railY=foot-.011,railH=.014;c.drawImage(this.clean,(cx-dw/2)*this.clean.naturalWidth,railY*this.clean.naturalHeight,dw*this.clean.naturalWidth,railH*this.clean.naturalHeight,cx-dw/2,railY,dw,railH);
   this.canvas.dataset.cameoFrame=String(frame);
  }
  c.restore();this.frameCount++;this.canvas.dataset.loopFrames=String(this.frameCount);
 }
 destroy(){this.disposed=true;this.image?.removeEventListener('load',this.loaded);this.button?.remove();this.canvas?.remove();for(const p of this.patches||[])p.canvas.width=1;this.patches=[];this.clean=this.cameo=this.cleanPatch=null;if(this.canvas)this.canvas.width=this.canvas.height=1;}
}
