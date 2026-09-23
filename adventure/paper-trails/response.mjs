import { Effects, seal } from './art.mjs?v=feel1';

// An outcome belongs to an actual scored answer, never to a tap or a physical miss.
export const RESPONSE = {
 sling:{ink:'#aa5946',glyph:'✦',zh:'词意送达',th:'ส่งความหมายถึงแล้ว'},
 duel:{ink:'#426e79',glyph:'✧',zh:'听声破势',th:'ฟังออก ชนะแล้ว'},
 echo:{ink:'#538278',glyph:'✓',zh:'原来是这个意思',th:'เข้าใจความหมายแล้ว'},
 bridge:{ink:'#638774',glyph:'◇',zh:'一句话，连起两岸',th:'หนึ่งประโยคเชื่อมสองฝั่ง'},
 courier:{ink:'#b07a38',glyph:'✦',zh:'小狗接住啦',th:'น้องหมารับได้แล้ว'},
 memory:{ink:'#b18442',glyph:'✧',zh:'回声点亮了',th:'แสงแห่งเสียงสว่างแล้ว'}
};
export function awardPoints(combo){return 100+Math.min(Math.max(0,combo-1),4)*25;}
export function feedbackHold(mode,good=true){return good?(mode==='bridge'?2.65:1.85):2.75;}
export function rewardStatus(previous,next){
 if(!previous)return 'new';
 return next.score>previous.score||next.stars>previous.stars?'best':'revisit';
}
export function collectPosition(event,age,reduced=false){
 const p=Math.max(0,Math.min(1,(age-.48)/.84)),t=p*p*(3-2*p);
 const start={x:event.x,y:event.y-30},end={x:1149,y:128};
 if(reduced)return {...end,progress:p};
 const control={x:(start.x+end.x)/2-120,y:Math.min(start.y,end.y)-110};
 return {x:(1-t)**2*start.x+2*(1-t)*t*control.x+t*t*end.x,y:(1-t)**2*start.y+2*(1-t)*t*control.y+t*t*end.y,progress:p};
}
export class ResponseEffects extends Effects {
 constructor(){super();this.responses=[];this.links=[];}
 clear(){super.clear();this.responses=[];this.links=[];}
 success(mode,x,y,points,combo,locale){
  const style=RESPONSE[mode]||RESPONSE.sling;
  this.responses.push({mode,x,y,points,combo,locale,age:0,style});
  this.responses=this.responses.slice(-8);
  // Short freeze and paper impact only; no whole-screen white flash.
  this.burst(x,y,.66+Math.min(combo,4)*.08,Object.keys(RESPONSE).indexOf(mode));
  this.freeze=this.reduced?0:(mode==='sling'||mode==='duel'?.075:.025);
  this.shake=this.reduced?0:(mode==='sling'||mode==='duel'?.23:.07);
 }
 link(x,y,tx,ty,colour='#d5ae65'){
  this.links.push({x,y,tx,ty,colour,age:0});this.links=this.links.slice(-16);
 }
 update(dt){super.update(dt);for(const e of this.responses)e.age+=dt;this.responses=this.responses.filter(e=>e.age<2.25);for(const e of this.links)e.age+=dt;this.links=this.links.filter(e=>e.age<1.2);}
 draw(c){
  super.draw(c);c.save();
  for(const e of this.links){
   const p=Math.min(1,e.age/.4);c.globalAlpha=Math.min(1,(1.2-e.age)*2);c.lineWidth=2.5;c.strokeStyle=e.colour;
   c.beginPath();c.moveTo(e.x,e.y);c.quadraticCurveTo((e.x+e.tx)/2,Math.min(e.y,e.ty)-55,e.x+(e.tx-e.x)*p,e.y+(e.ty-e.y)*p);c.stroke();
  }
  for(const e of this.responses){
   const {age:a,style}=e;const impact=Math.max(0,1-a/.55);
   if(impact>0&&!this.reduced){
    c.save();c.translate(e.x,e.y);c.globalAlpha=impact*.7;
    const glow=c.createRadialGradient(0,0,4,0,0,100);glow.addColorStop(0,'#fff5cfb0');glow.addColorStop(1,'#f4daa700');c.fillStyle=glow;c.fillRect(-100,-100,200,200);
    c.strokeStyle=style.ink;c.lineCap='round';
    for(let n=0;n<3;n++){const r=18+a*170+n*14;c.lineWidth=(7-n*2)*impact;c.beginPath();c.ellipse(0,0,r,r*.59,-.3,Math.PI*(.15+n*.38),Math.PI*(1.03+n*.38));c.stroke();}
    c.restore();
   }
   // A legible gain appears at the event, then a folded leaf joins the progress HUD.
   const opacity=Math.min(1,a/.1,Math.max(0,(1.75-a)/.35));
   if(opacity>0){
    const x=Math.max(94,Math.min(1160,e.x)),y=Math.max(192,e.y-108-(this.reduced?0:Math.min(a,.8)*18));
    c.save();c.translate(x,y);c.globalAlpha=opacity;
    c.fillStyle='#fbf3df';c.shadowColor='#31453b22';c.shadowBlur=9;
    c.beginPath();c.moveTo(-69,-28);c.lineTo(62,-32);c.lineTo(72,18);c.lineTo(-63,25);c.closePath();c.fill();c.shadowBlur=0;
    c.strokeStyle=style.ink;c.lineWidth=1;c.beginPath();c.moveTo(-56,22);c.lineTo(61,17);c.stroke();
    c.fillStyle=style.ink;c.textAlign='center';c.font='bold 36px Georgia,serif';c.fillText('+'+e.points,0,10);
    if(e.combo>1){c.font='18px Thai,WenKai,serif';c.fillStyle='#314e50';c.fillText((e.locale==='th'?'ต่อเนื่อง ':'连对 ')+e.combo,0,50);}
    c.restore();
   }
   if(a>.48&&a<1.42){
    const p=collectPosition(e,a,this.reduced);c.save();c.translate(p.x,p.y);c.globalAlpha=Math.min(1,(1.42-a)*10);c.rotate(this.reduced?-.4:-.5+p.progress*2);
    c.fillStyle=style.ink;c.strokeStyle='#fff2cf';c.lineWidth=1.2;c.beginPath();c.moveTo(-13,5);c.quadraticCurveTo(-13,-19,14,-12);c.quadraticCurveTo(21,7,-13,5);c.fill();c.stroke();c.beginPath();c.moveTo(-12,5);c.lineTo(13,-11);c.stroke();c.restore();
   }
   if(a<1.65){c.save();c.globalAlpha=Math.min(1,a*6,(1.65-a)*3);seal(c,e.x,e.y+16,22,style.ink,style.glyph);c.restore();}
  }
  c.restore();
 }
}
