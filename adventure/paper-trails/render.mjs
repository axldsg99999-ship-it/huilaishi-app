import { sprite, cover, shadow, seal } from './art.mjs?v=draw2';
import { slingTension } from './core.mjs?v=draw2';
import { drawSling } from './sling-feedback.mjs?v=draw2';
export function paintWorld(c, art, state, fx) {
 const { run:r, time:t, locale, reduced, mouse }=state; const scene=r?.scene||'river';
 c.save(); if(fx.shake>0&&!reduced)c.translate(Math.sin(t*112)*fx.shake*12,Math.cos(t*91)*fx.shake*8);
 const px=reduced?0:(mouse.x-640)*.004,py=reduced?0:(mouse.y-360)*.003;
 cover(c,art[scene],-8+px,-5+py,1296,730);
 // Subtle animated ripples and floating fibres; no moving photographic plate.
 if(!reduced){c.save();c.globalAlpha=scene==='lantern'?.25:.12;c.strokeStyle=scene==='lantern'?'#efc279':'#f9f4df';c.lineWidth=1.5;
 for(let i=0;i<18;i++){let x=480+(i*73%630)+Math.sin(t*.5+i)*18,y=426+(i*21%120);c.beginPath();c.moveTo(x,y);c.lineTo(x+14+Math.sin(t+i)*9,y);c.stroke();}c.restore();
 for(let i=0;i<7;i++){const x=(i*197+t*(8+i%3*5))%1350-35,y=100+(i*79+t*12)%475;c.save();c.translate(x,y);c.rotate(t*.45+i);c.fillStyle=i%2?'rgba(174,113,81,.24)':'rgba(236,222,184,.57)';c.beginPath();c.ellipse(0,0,4,1.8,0,0,Math.PI*2);c.fill();c.restore();}}
 const breath=reduced?0:Math.sin(t*2)*2;
 const hero=(x,y,h,pose='idle',flip=false,lean=0)=>{if(r?.finished)pose='cheer';shadow(c,x,y+1,h*.2);const key=locale==='th'?(pose==='idle'?'girl-idle':'girl-cast'):'hero-'+pose;sprite(c,art[key]||art['hero-idle'],x,y+breath,h,{flip,angle:reduced?0:Math.sin(t*1.4)*.006+lean});};
 const dog=(x,y,h=86,jump=0)=>{
  const moving=r?.mode==='courier'&&Math.abs(r.dogTarget-r.dogX)>8,catching=r?.catchUntil>r?.clock;
  const key=catching?'dog-catch':moving&&!reduced?'dog-run-'+(1+Math.floor(t*9)%3):r?.mode==='courier'?'dog-sit':Math.floor(t/7)%3===1?'dog-paw':'dog';
  shadow(c,x,y,h*.35);sprite(c,art[key]||art.dog,x,y-jump-(moving&&!reduced?Math.abs(Math.sin(t*14))*5:0),h,{angle:reduced?0:Math.sin(t*3)*.014,flip:moving&&r.dogTarget<r.dogX});
 };
 const guardian=(name,x,y,h,hit=0,speaking=false,alpha=1)=>{
  const wobble=hit>0?Math.sin(hit*27)*Math.exp(-hit*3)*.16:0;
  let key=name;if(name==='elephant')key=speaking?'elephant-speak':hit>0&&hit<1.7?'elephant-cheer':name;
  if(name==='mantis')key=r?.enemyCastUntil>r?.clock?'mantis-cast':hit>0&&hit<1.5?'mantis-hit':name;
  if(name==='bear')key=r?.catchUntil>r?.clock?'bear-cheer':r?.phase==='catching'?'bear-cast':name;
  shadow(c,x,y,h*.25,alpha*.15);sprite(c,art[key]||art[name],x+(hit>0?Math.sin(hit*18)*Math.exp(-hit*2)*22:0),y+breath,h,{angle:wobble,sx:1+wobble*.7,sy:1-wobble*.5,alpha,flip:name==='elephant'&&key===name});
  if(speaking){c.save();c.strokeStyle='#c1854c';c.lineWidth=2;c.globalAlpha=.45+Math.sin(t*12)*.15;for(let i=0;i<3;i++){c.beginPath();c.arc(x-h*.28,y-h*.7,18+i*12+Math.sin(t*9)*3,Math.PI*.8,Math.PI*1.3);c.stroke();}c.restore();}
 };
 if(!r){
  shadow(c,225,620,58);sprite(c,art['hero-idle'],225,620+breath,315,{angle:reduced?0:Math.sin(t*1.4)*.006});shadow(c,455,625,45);sprite(c,art['girl-idle'],449,623-breath,297,{angle:reduced?0:Math.sin(t*1.8)*.007});dog(348,637,96,Math.max(0,Math.sin(t*1.7))*3);
  sprite(c,art.swallow,501+Math.sin(t*.5)*20,328+Math.sin(t*1.4)*12,94,{angle:Math.sin(t)*.08});
  c.restore();return;
 }
 const cast=r.castUntil>r.clock;const hitAge=r.hitAt==null?0:r.clock-r.hitAt;
 if(r.mode==='sling'){
  const draw=r.phase==='aim'?slingTension(r.pull).ratio:0;
  hero(143+(reduced?0:draw*45),569+(reduced?0:draw*4),264,cast||draw>.25?'cast':'idle',false,-draw*.036);
  dog(231,580,72,cast&&!reduced?Math.max(0,Math.sin((r.castUntil-r.clock)*5))*9:0);
  for(const target of r.targets||[]){
   const age=target.clearedAt==null?0:r.clock-target.clearedAt,alpha=target.done?Math.max(0,1-age*1.6):1;
   sprite(c,art.platform,target.x,target.y+130,76);
   if(alpha>0)guardian(target.monster,target.x,target.y+60,128,target.hitAt==null?0:r.clock-target.hitAt,false,alpha);
   if(!target.done){c.save();c.fillStyle='#f7eed9e8';c.beginPath();c.ellipse(target.x,target.y+102,49,37,0,0,Math.PI*2);c.fill();c.restore();sprite(c,art[target.word.id],target.x,target.y+123,53);}
   if(target.done)seal(c,target.x,target.y+85,26,'#9e6147','✓');
  }
  drawSling(c,art,r,t,reduced);
 }
 if(r.mode==='duel'||r.mode==='echo'){
  const lunge=cast&&!reduced?Math.sin(Math.max(0,r.castUntil-r.clock)*4)*28:0;hero(251+lunge,576,312,cast?'cast':'idle');dog(118,585,90,cast?12:Math.max(0,Math.sin(t*2))*3);
  guardian(r.mode==='duel'?'mantis':'elephant',1003,579,r.mode==='duel'?281:260,hitAge,r.speaking);
  if(r.mode==='duel'&&r.revealed!=null){const symbols=locale==='th'?['หิน','กระดาษ','กรรไกร']:['石','纸','剪'];c.save();c.fillStyle='#fbf3dce8';c.beginPath();c.ellipse(1004,291,62,36,0,0,Math.PI*2);c.fill();c.fillStyle='#36535b';c.font='26px Thai,WenKai';c.textAlign='center';c.fillText(symbols[r.revealed],1004,299);c.restore();}
 }
 if(r.mode==='bridge'){
  // The words make a physical folded-paper bridge, not a character walking on water.
  for(let i=0;i<8;i++){const x=298+i*85,built=r.walkTo||i<(r.placed?.length||0)*2.7;
   c.save();c.globalAlpha=built?1:.22;c.fillStyle=i%2?'#dfcdab':'#f1e6cc';c.strokeStyle='#947a54';c.lineWidth=1.1;c.beginPath();c.moveTo(x,537);c.lineTo(x+86,532);c.lineTo(x+91,552);c.lineTo(x+4,557);c.closePath();c.fill();c.stroke();c.fillStyle='#9b785744';c.fillRect(x+6,555,80,6);c.strokeStyle='#b0a08455';for(let f=0;f<4;f++){c.beginPath();c.moveTo(x+13+f*17,537);c.lineTo(x+17+f*17,552);c.stroke();}c.restore();
  }
  hero(161+(r.walk||0)*765,548,250,cast?'cast':'idle');shadow(c,1130,548,45);sprite(c,art[locale==='th'?'hero-idle':'girl-idle'],1130,548-breath,245,{flip:true});dog(225+(r.walk||0)*705,558,76);
  if(r.walk>0){for(let i=0;i<4;i++){c.save();c.globalAlpha=.55;sprite(c,art.swallow,355+i*155,290+Math.sin(t*2+i)*15,49,{angle:Math.sin(t+i)*.1});c.restore();}}
 }
 if(r.mode==='courier'){
  hero(144,566,238,cast?'cast':'idle');guardian('bear',1138,569,167,0,false,.92);
  const x=r.dogX||640;dog(x,590,122,r.catchUntil>r.clock?Math.sin((r.catchUntil-r.clock)*8)*15:0);
  for(const item of r.items||[]){if(item.gone)continue;c.save();c.globalAlpha=.8;c.strokeStyle='#b79871';c.lineWidth=1.3;c.beginPath();c.moveTo(item.x-28,item.y-40);c.quadraticCurveTo(item.x,item.y-82,item.x+28,item.y-40);c.stroke();c.beginPath();c.moveTo(item.x-28,item.y-40);c.lineTo(item.x,item.y-9);c.lineTo(item.x+28,item.y-40);c.stroke();c.fillStyle='#fbefdb';c.beginPath();c.ellipse(item.x,item.y-43,30,9,0,Math.PI,Math.PI*2);c.fill();c.restore();sprite(c,art[item.word.id],item.x,item.y+27,67,{angle:Math.sin(t*2+item.lane)*.09});}
 }
 if(r.mode==='memory'){
  hero(156,623,213);sprite(c,art[locale==='th'?'hero-idle':'girl-idle'],1138,623-breath,204,{flip:true});dog(250,633,76);
  for(let i=0;i<3;i++){
   const x=403+i*238,y=356+(reduced?0:Math.sin(t*1.2+i)*4),lit=r.lit===i||r.allLit;const glow=lit?1:.34;
   c.save();c.strokeStyle='#b29267';c.lineWidth=2;c.beginPath();c.moveTo(x,0);c.lineTo(x,y-101);c.stroke();
   const g=c.createRadialGradient(x,y,5,x,y,130);g.addColorStop(0,'rgba(255,210,124,'+(glow*.48)+')');g.addColorStop(1,'rgba(255,210,124,0)');c.fillStyle=g;c.fillRect(x-140,y-150,280,300);
   c.restore();sprite(c,art[(lit?'lamp-lit-':'lamp-')+(i+1)],x,y+157,284,{angle:reduced?0:Math.sin(t*1.2+i)*.012});
   sprite(c,art[r.lamps?.[i]?.id||'water'],x,y+30,74,{alpha:lit?1:.84});
  }
  if(r.phase==='sequence'){c.save();const g=c.createRadialGradient(641,204,3,641,204,40);g.addColorStop(0,'#fff5cd');g.addColorStop(1,'#edba5400');c.globalAlpha=.5+Math.sin(t*8)*.25;c.fillStyle=g;c.fillRect(601,164,80,80);c.restore();}
 }
 fx.draw(c);c.restore();
}
