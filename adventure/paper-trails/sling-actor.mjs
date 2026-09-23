import {SLING,slingTension,armJoints,clamp,ballistic} from './core.mjs?v=play2';
import {shadow} from './art.mjs?v=draw3';
import {slingExpression} from './expressions.mjs?v=draw3';

export function slingActorPose(r,t,meta,reduced=false){
 const age=r.releaseAt==null?9:r.clock-r.releaseAt,drawn=r.phase==='aim'&&r.pull;
 const power=drawn?slingTension(r.pull).ratio:age<.9?(r.shotPower||0)*Math.exp(-age*5):0;
 const down=drawn?Math.max(0,(r.pull.y-SLING.y)/SLING.maxPull):0;
 const angle=reduced?0:-power*.125+(age<.65?Math.sin(age*12)*Math.exp(-age*6)*.055:0);
 const verticalReach=drawn?clamp((r.pull.x-245)/49,0,1)*down*42:0;
 const s=332/meta.body.height,sy=s*(1-down*.08),x=183-(reduced?0:power*19)+verticalReach,foot=610;
 const mood=slingExpression(r),reactAge=r.reactionAt==null?9:r.clock-r.reactionAt;
 const gaze=r.projectile?ballistic(r.projectile,r.projectile.age):null;
 const headAngle=reduced?0:gaze?clamp(Math.atan2(gaze.y-342,gaze.x-222)*.13,-.085,.065):mood==='happy'&&reactAge<1?Math.sin(reactAge*9)*.035:mood==='oops'&&reactAge<1.4?Math.sin(reactAge*7)*.035:0;
 const bounce=!reduced&&mood==='happy'&&reactAge<.75?Math.sin(reactAge/.75*Math.PI)*7:0;
 const origin={x,y:foot-bounce},rot=(px,py)=>({x:x+px*Math.cos(angle)-py*Math.sin(angle),y:origin.y+px*Math.sin(angle)+py*Math.cos(angle)});
 const onBody=p=>rot((p.x-meta.body.width/2)*s,(p.y-meta.body.height)*sy);
 let hand=drawn?{...r.pull}:{x:SLING.x,y:SLING.y};
 if(!drawn&&age>=0&&age<.8&&r.releasePull){
  if(age<.2){const snap=reduced?0:Math.sin(age/.2*Math.PI);hand={x:r.releasePull.x-22*snap,y:r.releasePull.y-9*snap};}
  else{const k=clamp((age-.2)/.6,0,1),ease=k*k*(3-2*k);hand={x:r.releasePull.x+(SLING.x-r.releasePull.x)*ease,y:r.releasePull.y+(SLING.y-r.releasePull.y)*ease};}
 }
 const upper=86*332/300,fore=98*332/300,arm=armJoints(onBody(meta.body.pull),hand,upper,fore),hold={x:292-power*2,y:500};
 return {origin,s,sy,angle,power,arm,upper,fore,holdRoot:onBody(meta.body.hold),hold,age,down,mood,reactAge,headAngle};
}

function bone(c,image,meta,from,to,thickness,flutter=0){
 const sx=meta.to.x-meta.from.x,sy=meta.to.y-meta.from.y,natural=Math.hypot(sx,sy),target=Math.hypot(to.x-from.x,to.y-from.y);
 const a=Math.atan2(to.y-from.y,to.x-from.x),sourceAngle=Math.atan2(sy,sx);
 c.save();c.translate(from.x,from.y);c.rotate(a);c.scale(target/natural,thickness);
 // Hide the assembly socket inside the previous layer; preserve the original alpha.
 c.beginPath();c.moveTo(20,-2000);c.lineTo(3000,-2000);c.lineTo(3000,2000);c.lineTo(20,2000);c.lineTo(20,140);c.bezierCurveTo(-84,140,-84,-140,20,-140);c.closePath();c.clip();
 c.rotate(-sourceAngle+flutter);c.translate(-meta.from.x,-meta.from.y);c.drawImage(image,0,0);c.restore();
}
export function paintSlingActor(c,art,meta,pose,layer,t,reduced){
 const p=pose,flap=reduced?0:Math.sin(t*3)*.006;
 if(layer==='back'){
  shadow(c,p.origin.x,p.origin.y+1,78,.15);
  bone(c,art[meta.hold.key],meta.hold,p.holdRoot,p.hold,.22);
  const girl=meta.body.key.includes('girl'),head=girl?{x:190,y:-14,size:210,cut:110}:{x:305,y:-16,size:190,cut:110};
  c.save();c.translate(p.origin.x,p.origin.y);c.rotate(p.angle);c.scale(p.s,p.sy);c.translate(-meta.body.width/2,-meta.body.height);
  // Replace the original head, keeping the painted torso and long trailing hair.
  c.drawImage(art[meta.body.key],0,head.cut,meta.body.width,meta.body.height-head.cut,0,head.cut,meta.body.width,meta.body.height-head.cut);
  const face=art['draw3-'+(girl?'girl':'hero')+'-face-'+p.mood];
  if(face){const neck=girl?{x:330,y:164}:{x:380,y:160};c.save();c.translate(neck.x,neck.y);c.rotate(p.headAngle);c.drawImage(face,head.x-neck.x,head.y-neck.y,head.size,head.size);c.restore();}
  c.restore();
 }else{
  bone(c,art[meta.upper.key],meta.upper,p.arm.root,p.arm.elbow,.225,flap*.35);
  bone(c,art[meta.fore.key],meta.fore,p.arm.elbow,p.arm.hand,.24);
  // Fingers sit in front of the wooden handle while the arm passes behind it.
  c.save();c.beginPath();c.ellipse(p.hold.x,p.hold.y,16,19,0,0,Math.PI*2);c.clip();
  bone(c,art[meta.hold.key],meta.hold,p.holdRoot,p.hold,.22);c.restore();
 }
}
