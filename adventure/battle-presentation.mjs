// Presentation decisions do not grant points, change mastery or advance turns.
export const CHALLENGE_LABELS=Object.freeze({
 listen:['听懂回应','ฟังแล้วตอบ'],chain:['双声接力','จำเสียงสองช่วง'],
 cloze:['缺页补句','เติมส่วนที่หาย'],sequence:['句序重组','เรียงประโยค'],
 pairs:['双语连线','จับคู่สองภาษา'],hunt:['听声找信','ฟังแล้วหาจดหมาย'],
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
 const file=material==='gouache'?'thought-gouache-'+(long?'wide-':'')+'v1.png':'thought-'+material+'-ink-v2.png';
 const source=material==='gouache'?'src="./assets/'+file+'"':'data-material="'+material+'"';
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
 const sideWidth=Math.max(120,Math.min(tall?400:280,right-startRight));
 const cap=Math.max(54,Math.min(tall?180:96,(bottom-top-gap)/2,heroY-top-12));
 const aboveWidth=Math.min(tall?w*.34:w*.26,400);
 const aboveLeft=Math.max(left,heroX-aboveWidth*.72);
 const y1=Math.max(top,heroY-cap-18);
 const y2=tall?top:Math.max(top,Math.min(heroY-cap*.58,bottom-cap*2-gap));
 const y3=Math.min(bottom-cap,y2+cap+gap);
 const slots=[{x:aboveLeft,y:y1,w:aboveWidth,h:cap},{x:startRight,y:y2,w:sideWidth,h:cap},{x:startRight+(tall?0:Math.min(16,right-startRight-sideWidth)),y:y3,w:sideWidth,h:cap}];
 // Sentence fragments retain the same two fans, arranged in short rows.
 if(count>3){
  const rows=count-1,cellH=Math.max(44,(bottom-top-gap*(rows-1))/rows);
  return [slots[0],...Array.from({length:rows},(_,i)=>({x:startRight,y:top+i*(cellH+gap),w:sideWidth,h:cellH}))];
 }
 return slots.slice(0,count).map((slot,i)=>({...slot,originX:heroX-(slot.x+slot.w/2),originY:heroY-(slot.y+slot.h/2),index:i}));
}
