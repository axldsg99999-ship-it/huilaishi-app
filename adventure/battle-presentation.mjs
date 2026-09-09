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
 return '<img class="thought-paper thought-paint thought-paint-'+variant+'" src="./assets/thought-'+material+'-'+(long?'wide-':'')+'v1.png" alt="" aria-hidden="true" focusable="false" draggable="false" decoding="async">';
}
export function thoughtCue(b) {
 if(b.echoPrepared||b.mode!=='listen')return 'off';
 if(b.phase==='ready')return b.paused?'held':'open';
 if(b.phase==='audio')return 'hearing';
 if(b.phase==='resolving')return 'sent';
 return 'held';
}
