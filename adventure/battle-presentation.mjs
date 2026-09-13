// Presentation decisions do not grant points, change mastery or advance turns.
export const CHALLENGE_LABELS=Object.freeze({
 listen:['听懂回应','ฟังแล้วตอบ'],chain:['双声接力','จำเสียงสองช่วง'],
 cloze:['缺页补句','เติมส่วนที่หาย'],sequence:['句序重组','เรียงประโยค'],
 pairs:['心意相通','สื่อใจตรงกัน'],hunt:['听声找信','ฟังแล้วหาจดหมาย'],
 proof:['译文校勘','ตรวจคำแปล'],reply:['情境接话','ตอบตามสถานการณ์'],
});
export function exchangeState(b) {
  const listening=['listen','chain','sequence'].includes(b.mode);
  return {
    phase:b.phase,
    headAudio:listening&&!b.revealed&&!b.echoPrepared,
    footerAudio:!!(!listening||b.revealed||b.echoPrepared),
    answering:b.phase==='ready'&&!b.paused,
    playing:b.phase==='audio'&&!b.paused,
  };
}
export function responseHoldMs(correct,units=[]) {
  const long=units.length>1||units.some(u=>(u.zh?.length||0)>12||(u.th?.length||0)>35);
  return correct?(long?2700:1900):(long?4600:3600);
}

// Character-material illustration, not a rectangular UI skin. Each choice
// reuses its hero's local alpha asset; words and stable hit targets stay DOM.
export function thoughtSkin(index=0,long=false,hero='neutral') {
 const value=Number.isFinite(index)?Math.trunc(index):0,variant=(value%3+3)%3;
 const material=hero==='xiaoai'||hero==='chaninda'?hero:'gouache';
 const file=material==='gouache'?'thought-gouache-'+(long?'wide-':'')+'v1.png':'thought-'+material+'-quiet-v5.webp';
 const source='src="./assets/'+file+'"'+(material==='gouache'?'':' data-thought-shape="cloud"');
 return '<img class="thought-paper thought-paint thought-paint-'+variant+'" '+source+' alt="" aria-hidden="true" focusable="false" draggable="false" decoding="async">';
}
// Both lengths orbit the actor. 'reading' reserves wider petals, never a
// central list. Thai combining marks retain their line room, not extra length.
export function thoughtLayout(words=[],world='th',chapter=0) {
 const limit=world==='cn'?16:6;
 return chapter>=3||words.some(text=>Array.from(String(text).normalize('NFC').replace(/\p{M}/gu,'')).length>limit)?'reading':'orbit';
}
export function thoughtCue(b) {
 if(b.echoPrepared||b.mode!=='listen')return 'off';
 if(b.phase==='ready')return b.paused?'held':'open';
 if(b.phase==='audio')return 'hearing';
 if(b.phase==='resolving')return 'sent';
 return 'held';
}

// Stable hitboxes form an open fan above and beside the player's head. The
// gap below the first petal is reserved for the entire character, not text.
export function actorThoughtSlots({width:w,height:h,heroX=w*.25,heroY=h*.48,long=false,count=3,top=78,left=12,right=w*.69,bottom=h-66}) {
 const gap=Math.max(10,Math.min(18,h*.03));
 const tall=long||count>3;
 const startRight=Math.max(heroX+w*.09,Math.min(w*.38,right-160));
 const aboveGap=12;
 const targetHeight=Math.min(tall?104:82,h*(tall?.255:.205));
 const cap=Math.max(54,Math.min(targetHeight,(bottom-top-gap)/2,heroY-top-aboveGap));
 const sideHeight=Math.max(54,Math.min(targetHeight,(bottom-top-gap)/2));
 // A compact cloud, never a stretched ribbon. Long copy gains height first.
 const sideWidth=Math.max(120,Math.min(sideHeight*(tall?2.05:1.8),tall?214:164,right-startRight));
 const aboveWidth=Math.min(cap*(tall?2.25:1.95),tall?w*.27:w*.22,tall?214:164);
 const aboveLeft=Math.max(left,heroX-aboveWidth*.72);
 const y1=Math.max(top,heroY-cap-aboveGap);
 const y2=Math.max(top,Math.min(heroY-sideHeight*.58,bottom-sideHeight*2-gap));
 const y3=Math.min(bottom-sideHeight,y2+sideHeight+gap);
 let slots=[{x:aboveLeft,y:y1,w:aboveWidth,h:cap},{x:startRight,y:y2,w:sideWidth,h:sideHeight},{x:startRight+(tall?0:Math.min(16,right-startRight-sideWidth)),y:y3,w:sideWidth,h:sideHeight}];
 // Sentence fragments retain the same two fans, arranged in short rows.
 if(count>3){
  const rows=count-1,cellH=Math.max(44,(bottom-top-gap*(rows-1))/rows);
  slots=[slots[0],...Array.from({length:rows},(_,i)=>({x:startRight,y:top+i*(cellH+gap),w:Math.min(sideWidth,cellH*2.35),h:cellH}))];
 }
 return slots.slice(0,count).map((slot,i)=>({...slot,originX:heroX-(slot.x+slot.w/2),originY:heroY-(slot.y+slot.h/2),index:i}));
}

// Two independent fans, one belonging to each speaker. No central list or
// crossing lines. Narrow outer margins use a lower inner petal, not tiny type.
export function connectionThoughtSlots({width:w,height:h,heroX=w*.25,heroY=h*.46,enemyX=w*.78,enemyY=h*.44,count=3,top=80,bottom=h-65}) {
 const edge=12,mid=w/2,gap=12,hh=Math.min(96,Math.max(78,h*.235));
 const wide=Math.min(184,w*.235),innerW=Math.min(176,w*.23);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const fan=(x,y,right)=>{
  const aboveH=Math.min(hh,Math.max(66,y-top-10));
  const above={x:clamp(x-wide*(right?.4:.6),right?mid+gap:edge,right?w-edge-wide:mid-gap-wide),y:top,w:wide,h:aboveH};
  const innerX=right?mid+gap:x+w*.06;
  const iw=Math.min(innerW,right?x-w*.075-innerX:mid-gap-innerX);
  const inner={x:innerX,y:clamp(y-hh*.5,top+aboveH+gap, bottom-hh),w:Math.max(124,iw),h:hh};
  const ow=right?w-edge-(x+w*.075):x-w*.065-edge;
  let outer;
  if(ow>=140){outer={x:right?w-edge-Math.min(ow,176):edge,y:clamp(y+32,top+aboveH+gap,bottom-hh),w:Math.min(ow,176),h:hh};}
  else{
   // Keep both lower petals distinct in x and y when a monster fills its flank.
   inner.y=Math.max(top+aboveH+gap,Math.min(inner.y,bottom-hh*2-8));
   inner.h=Math.max(68,Math.min(hh,(bottom-inner.y-8)/2));
   outer={x:inner.x+(right?Math.min(16,Math.max(0,iw-136)):-8),y:inner.y+inner.h+8,w:inner.w,h:inner.h};
  }
  return [above,inner,outer].slice(0,count);
 };
 return {left:fan(heroX,heroY,false),right:fan(enemyX,enemyY,true)};
}

export function focusedThoughtSlots({width:w,height:h,heroX=w*.25,heroY=h*.46,enemyX=w*.78,enemyY=h*.44,count=3}){
 const top=Math.max(80,h*.20),bottom=h-Math.max(74,h*.18);
 const original=actorThoughtSlots({width:w,height:h,heroX,heroY,long:true,count,top,right:w*.56,bottom});
 const left=original.map((s,i)=>({...s,x:s.x+(i?0:s.w*.10),w:Math.min(180,s.w*.86),h:Math.max(54,Math.min(78,s.h*.84))}));
 const cw=Math.min(194,w*.25),ch=Math.min(84,Math.max(68,h*.20));
 const right=[{x:Math.min(w-12-cw,Math.max(w*.65,enemyX-cw*.5)),y:Math.max(top,Math.min(enemyY-ch-12,h*.27)),w:cw,h:ch}];
 return {left,right};
}
