import { sprite, cover, shadow, seal } from './art.mjs?v=play2';
import { drawSling } from './sling-feedback.mjs?v=play2';
import {DUEL_ENEMIES} from './play-rules.mjs?v=play2';

function drawObstacle(c,art,o,t,reduced){
 c.save();const hit=o.hitAt==null?9:t-o.hitAt;c.translate(o.x+(!reduced&&hit<1?Math.sin(hit*28)*Math.exp(-hit*5)*6:0),o.y);
 if(art['obstacle-'+o.id]){
  if(o.id==='basket'){sprite(c,art.platform,o.w/2,o.h+40,51);shadow(c,o.w/2,o.h,50,.13);c.drawImage(art['obstacle-basket'],-32,-6,136,161);}
  else{c.strokeStyle='#967a52';c.lineWidth=1.5;for(const x of [4,o.w-4]){c.beginPath();c.moveTo(x,-180);c.lineTo(x,-10);c.stroke();}c.drawImage(art['obstacle-canopy'],-26,-26,137,121);}
  c.restore();return;
 }
 if(o.id==='basket'){
  c.fillStyle='#b38c59';c.strokeStyle='#79613e';c.lineWidth=2;c.beginPath();c.moveTo(0,5);c.lineTo(o.w,5);c.lineTo(o.w-6,o.h);c.lineTo(6,o.h);c.closePath();c.fill();c.stroke();
  c.save();c.clip();for(let y=12;y<o.h;y+=9){c.strokeStyle=y%18?'#d3b67b':'#8a6e47';c.lineWidth=3;c.beginPath();c.moveTo(0,y);c.lineTo(o.w,y-4);c.stroke();}for(let x=5;x<o.w;x+=10){c.strokeStyle='#745c3d66';c.lineWidth=2;c.beginPath();c.moveTo(x,5);c.lineTo(x+5,o.h);c.stroke();}c.restore();
  c.fillStyle='#5a563a';c.beginPath();c.ellipse(o.w/2,6,o.w/2,9,0,0,Math.PI*2);c.fill();c.strokeStyle='#d7bc80';c.lineWidth=4;c.stroke();
 }else{
  c.strokeStyle='#967a52';c.lineWidth=2;for(const x of [5,o.w-5]){c.beginPath();c.moveTo(x,-160);c.lineTo(x,0);c.stroke();}
  c.fillStyle='#4e6b6d';c.beginPath();c.moveTo(0,0);c.lineTo(o.w,0);c.lineTo(o.w-1,o.h-5);c.quadraticCurveTo(o.w*.5,o.h+5,0,o.h-3);c.closePath();c.fill();
  c.strokeStyle='#d2b777';c.lineWidth=1.4;for(let y=12;y<o.h-10;y+=20){for(let x=13;x<o.w;x+=20){c.beginPath();c.moveTo(x,y-5);c.lineTo(x+5,y);c.lineTo(x,y+5);c.lineTo(x-5,y);c.closePath();c.stroke();}}c.strokeRect(5,5,o.w-10,o.h-12);
  for(let x=4;x<o.w;x+=8){c.beginPath();c.moveTo(x,o.h-4);c.lineTo(x+Math.sin(t*2+x)*(reduced?0:2),o.h+4);c.stroke();}
 }c.restore();
}
export function paintWorld(c, art, state, fx) {
 const { run:r, time:t, locale, reduced, mouse }=state; const scene=r?.scene||'river';
 c.save(); if(fx.shake>0&&!reduced)c.translate(Math.sin(t*112)*fx.shake*12,Math.cos(t*91)*fx.shake*8);
 const px=reduced?0:(mouse.x-640)*.004,py=reduced?0:(mouse.y-360)*.003;
 cover(c,art[scene],-8+px,-5+py,1296,730);
 // Subtle animated ripples and floating fibres; no moving photographic plate.
 if(!reduced){c.save();c.globalAlpha=scene==='lantern'?.25:.12;c.strokeStyle=scene==='lantern'?'#efc279':'#f9f4df';c.lineWidth=1.5;
 for(let i=0;i<18;i++){let x=480+(i*73%630)+Math.sin(t*.5+i)*18,y=426+(i*21%120);c.beginPath();c.moveTo(x,y);c.lineTo(x+14+Math.sin(t+i)*9,y);c.stroke();}c.restore();
 for(let i=0;i<7;i++){const x=(i*197+t*(8+i%3*5))%1350-35,y=100+(i*79+t*12)%475;c.save();c.translate(x,y);c.rotate(t*.45+i);c.fillStyle=i%2?'rgba(174,113,81,.24)':'rgba(236,222,184,.57)';c.beginPath();c.ellipse(0,0,4,1.8,0,0,Math.PI*2);c.fill();c.restore();}}
 const breath=reduced?0:Math.sin(t*2)*2,answerAge=r?.response?r.clock-r.response.at:99,celebrating=r?.response?.good&&answerAge<1.8;
 const hero=(x,y,h,pose='idle',flip=false,lean=0)=>{if(r?.finished||(celebrating&&answerAge>.32))pose='cheer';const hop=celebrating&&!reduced?Math.max(0,Math.sin(Math.min(1,answerAge/1.15)*Math.PI))*9:0;shadow(c,x,y+1,h*.2);const key=locale==='th'?(pose==='idle'?'girl-idle':'girl-cast'):'hero-'+pose;sprite(c,art[key]||art['hero-idle'],x,y+breath-hop,h,{flip,angle:reduced?0:Math.sin(t*1.4)*.006+lean});};
 const dog=(x,y,h=86,jump=0)=>{
  const moving=r?.mode==='courier'&&Math.abs(r.dogTarget-r.dogX)>8,catching=r?.catchUntil>r?.clock;
  const key=celebrating?(answerAge<.65?'dog-catch':'dog-paw'):catching?'dog-catch':moving&&!reduced?'dog-run-'+(1+Math.floor(t*9)%3):r?.mode==='courier'?'dog-sit':Math.floor(t/7)%3===1?'dog-paw':'dog';
  const cheerHop=celebrating&&!reduced?Math.abs(Math.sin(Math.min(1,answerAge/1.25)*Math.PI*2))*18:0;
  shadow(c,x,y,h*.35);sprite(c,art[key]||art.dog,x,y-(reduced?0:jump)-cheerHop-(moving&&!reduced?Math.abs(Math.sin(t*14))*5:0),h,{angle:reduced?0:Math.sin(t*3)*.014,flip:moving&&r.dogTarget<r.dogX});
 };
 const guardian=(name,x,y,h,hit=0,speaking=false,alpha=1)=>{
  const wobble=!reduced&&hit>0?Math.sin(hit*27)*Math.exp(-hit*3)*.16:0;
  let key=name;if(name==='elephant')key=speaking?'elephant-speak':hit>0&&hit<1.7?'elephant-cheer':name;
  if(name==='mantis')key=r?.enemyCastUntil>r?.clock?'mantis-cast':hit>0&&hit<1.5?'mantis-hit':name;
  if(name==='bear')key=celebrating||r?.catchUntil>r?.clock?'bear-cheer':r?.phase==='catching'||r?.enemyCastUntil>r?.clock?'bear-cast':name;
  const tell=r?.mode==='duel'&&r.phase==='duel-active'?r.duel.enemy:null,lean=tell==='attack'?-.075:tell==='guard'?.065:0,lift=tell==='break'&&!reduced?Math.abs(Math.sin(t*5))*9:0;
  shadow(c,x,y,h*.25,alpha*.15);sprite(c,art[key]||art[name],x+(!reduced&&hit>0?Math.sin(hit*18)*Math.exp(-hit*2)*22:0),y+breath-lift,h,{angle:wobble+lean,sx:1+wobble*.7,sy:1-wobble*.5,alpha,flip:name==='elephant'&&key===name});
  if(speaking){c.save();c.strokeStyle='#c1854c';c.lineWidth=2;c.globalAlpha=.45+Math.sin(t*12)*.15;for(let i=0;i<3;i++){c.beginPath();c.arc(x-h*.28,y-h*.7,18+i*12+Math.sin(t*9)*3,Math.PI*.8,Math.PI*1.3);c.stroke();}c.restore();}
 };
 if(!r){
  shadow(c,225,620,58);sprite(c,art['hero-idle'],225,620+breath,315,{angle:reduced?0:Math.sin(t*1.4)*.006});shadow(c,455,625,45);sprite(c,art['girl-idle'],449,623-breath,297,{angle:reduced?0:Math.sin(t*1.8)*.007});dog(348,637,96,Math.max(0,Math.sin(t*1.7))*3);
  sprite(c,art.swallow,501+Math.sin(t*.5)*20,328+Math.sin(t*1.4)*12,94,{angle:Math.sin(t)*.08});
  c.restore();return;
 }
 const cast=r.castUntil>r.clock;const hitAge=r.hitAt==null?0:r.clock-r.hitAt;
 if(r.mode==='sling'){
  dog(231,580,72,cast&&!reduced?Math.max(0,Math.sin((r.castUntil-r.clock)*5))*9:0);
  for(const obstacle of r.obstacles||[])drawObstacle(c,art,obstacle,r.clock,reduced);
  for(const target of r.targets||[]){
   const age=target.clearedAt==null?0:r.clock-target.clearedAt,alpha=target.done?Math.max(.32,1-Math.max(0,age-1.1)*.6):1;
   sprite(c,art.platform,target.x,target.y+130,76);
   if(alpha>0)guardian(target.monster,target.x,target.y+60,128,target.hitAt==null?0:r.clock-target.hitAt,false,alpha);
   if(!target.done){c.save();c.fillStyle='#f7eed9e8';c.beginPath();c.ellipse(target.x,target.y+102,49,37,0,0,Math.PI*2);c.fill();c.restore();sprite(c,art[target.word.id],target.x,target.y+123,53);}
   if(target.done){seal(c,target.x,target.y+91,27,'#9e6147','✓');if(age<1.8){c.save();c.fillStyle='#fbf4e0';c.strokeStyle='#9e6147';c.globalAlpha=Math.min(1,age*8);c.beginPath();c.ellipse(target.x,target.y+96,35,27,-.1,0,Math.PI*2);c.fill();c.stroke();sprite(c,art[target.word.id],target.x,target.y+120,44);c.restore();}}
  }
  drawSling(c,art,r,t,reduced,locale);
 }
 if(r.mode==='duel'||r.mode==='echo'){
  const stance=r.duel?.last?.stance||r.duel?.stance,lunge=cast&&!reduced?Math.sin(Math.max(0,r.castUntil-r.clock)*4)*(stance==='guard'?9:stance==='break'?47:65):0;
  hero(251+lunge,(r.mode==='echo'?598:576)-(cast&&stance==='break'&&!reduced?Math.abs(lunge)*.3:0),r.mode==='echo'?285:312,cast?'cast':'idle',false,stance==='guard'?.04:0);dog(118,r.mode==='echo'?601:585,90,cast?12:Math.max(0,Math.sin(t*2))*3);
  guardian(r.mode==='duel'?DUEL_ENEMIES[r.duel?.encounter||0].monster:'elephant',1003,579,r.mode==='duel'?281:260,hitAge,r.speaking);
  if(r.mode==='duel'&&r.duel?.last?.correct&&hitAge>0&&hitAge<.85&&!reduced){
   const k=hitAge/.85;c.save();c.globalAlpha=Math.sin(k*Math.PI)*.7;c.lineCap='round';c.strokeStyle=stance==='attack'?'#b56c51':stance==='break'?'#487980':'#768052';
   if(stance==='guard'){c.lineWidth=5*(1-k);c.beginPath();c.ellipse(337,439,46+k*34,74,-.18,Math.PI*1.3,Math.PI*.7);c.stroke();c.lineWidth=2;c.beginPath();c.ellipse(352,439,52+k*32,83,-.18,Math.PI*1.3,Math.PI*.7);c.stroke();}
   else for(let n=0;n<(stance==='break'?2:3);n++){c.lineWidth=(stance==='break'?5:8-n*2)*(1-k);c.beginPath();c.moveTo(420+n*8,462+n*12);c.bezierCurveTo(590,stance==='break'?560:418,740,stance==='break'?315:386,975,414+n*12);c.stroke();}
   c.restore();
  }
  if(r.mode==='echo')for(const [i,item] of (r.delivered||[]).entries()){const age=r.clock-item.at,k=Math.min(1,age/.8),x=420+(824+i*54-420)*k,y=524-Math.sin(k*Math.PI)*95;sprite(c,art[item.id.replace('sentence-','')],x,y,46,{angle:reduced?0:(1-k)*.5});}
 }
 if(r.mode==='bridge'){
  // The words make a physical folded-paper bridge, not a character walking on water.
  for(let i=0;i<8;i++){const x=298+i*85,built=r.walkTo||i<(r.placed?.length||0)*2.7;
   c.save();c.globalAlpha=built?1:.22;c.fillStyle=i%2?'#dfcdab':'#f1e6cc';c.strokeStyle='#947a54';c.lineWidth=1.1;c.beginPath();c.moveTo(x,537);c.lineTo(x+86,532);c.lineTo(x+91,552);c.lineTo(x+4,557);c.closePath();c.fill();c.stroke();c.fillStyle='#9b785744';c.fillRect(x+6,555,80,6);c.strokeStyle='#b0a08455';for(let f=0;f<4;f++){c.beginPath();c.moveTo(x+13+f*17,537);c.lineTo(x+17+f*17,552);c.stroke();}c.restore();
  }
  hero(161+(r.walk||0)*765,548,250,cast?'cast':'idle');shadow(c,1130,548,45);sprite(c,art[locale==='th'?'hero-idle':'girl-idle'],1130,548-breath,245,{flip:true});dog(225+(r.walk||0)*705,558,76);
  if(r.walk>0){
   c.save();c.strokeStyle='#ead09a';c.lineWidth=4;c.shadowColor='#f9d382';c.shadowBlur=reduced?0:12;c.beginPath();c.moveTo(300,546);c.lineTo(300+680*r.walk,541);c.stroke();c.restore();
   for(let i=0;i<4;i++){c.save();c.globalAlpha=.75;sprite(c,art.swallow,355+i*155,290+(reduced?0:Math.sin(t*2+i)*15),49,{angle:reduced?0:Math.sin(t+i)*.1});c.restore();}}
 }
 if(r.mode==='courier'){
  hero(144,566,238,cast?'cast':'idle');guardian('bear',1138,569,167,0,false,.92);
  const x=r.dogX||640;if(r.dashUntil>r.clock&&!reduced){c.save();c.strokeStyle='#9a7e4c';c.lineWidth=2;for(let i=0;i<4;i++){c.beginPath();c.moveTo(x-80-i*9,563+i*7);c.lineTo(x-45,559+i*7);c.stroke();}c.restore();}dog(x,590,122,r.catchUntil>r.clock?Math.sin((r.catchUntil-r.clock)*8)*15:0);
  if(celebrating){c.save();c.globalAlpha=Math.min(1,answerAge*8,(1.8-answerAge)*3);seal(c,x,620,29,'#a57340','✓');c.restore();}
  for(const item of r.items||[]){if(item.gone)continue;c.save();c.globalAlpha=.8;c.strokeStyle='#b79871';c.lineWidth=1.3;c.beginPath();c.moveTo(item.x-28,item.y-40);c.quadraticCurveTo(item.x,item.y-82,item.x+28,item.y-40);c.stroke();c.beginPath();c.moveTo(item.x-28,item.y-40);c.lineTo(item.x,item.y-9);c.lineTo(item.x+28,item.y-40);c.stroke();c.fillStyle='#fbefdb';c.beginPath();c.ellipse(item.x,item.y-43,30,9,0,Math.PI,Math.PI*2);c.fill();c.restore();sprite(c,art[item.word.id],item.x,item.y+27,67,{angle:Math.sin(t*2+item.lane)*.09});}
 }
 if(r.mode==='memory'){
  hero(156,623,213);sprite(c,art[locale==='th'?'hero-idle':'girl-idle'],1138,623-breath,204,{flip:true});dog(250,633,76);
  for(let i=0;i<3;i++){
   const x=403+i*238,y=356+(reduced?0:Math.sin(t*1.2+i)*4),lit=r.lit===i||r.allLit||r.entered?.includes(i);const glow=lit?1:.34;
   c.save();c.strokeStyle='#b29267';c.lineWidth=2;c.beginPath();c.moveTo(x,0);c.lineTo(x,y-101);c.stroke();
   const g=c.createRadialGradient(x,y,5,x,y,130);g.addColorStop(0,'rgba(255,210,124,'+(glow*.48)+')');g.addColorStop(1,'rgba(255,210,124,0)');c.fillStyle=g;c.fillRect(x-140,y-150,280,300);
   c.restore();sprite(c,art[(lit?'lamp-lit-':'lamp-')+(i+1)],x,y+157,284,{angle:reduced?0:Math.sin(t*1.2+i)*.012});
   sprite(c,art[r.lamps?.[i]?.id||'water'],x,y+30,74,{alpha:lit?1:.84});
   if(r.allLit){c.save();c.strokeStyle='#ffe1a1';c.lineWidth=1.5;c.globalAlpha=.75;for(let k=0;k<5;k++){const angle=k*Math.PI*2/5+(reduced?0:t*.18),ray=61;c.beginPath();c.moveTo(x+Math.cos(angle)*ray,y+Math.sin(angle)*ray);c.lineTo(x+Math.cos(angle)*(ray+9),y+Math.sin(angle)*(ray+9));c.stroke();}c.restore();}
  }
  if(r.phase==='sequence'){c.save();const g=c.createRadialGradient(641,204,3,641,204,40);g.addColorStop(0,'#fff5cd');g.addColorStop(1,'#edba5400');c.globalAlpha=.5+Math.sin(t*8)*.25;c.fillStyle=g;c.fillRect(601,164,80,80);c.restore();}
 }
 fx.draw(c);c.restore();
}
