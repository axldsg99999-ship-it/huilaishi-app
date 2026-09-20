// Isolated combat experiment. No DOM, storage, main-game rewards or save imports.
export const LAB_VERSION = 'battle-lab-1';
export const STANCES = Object.freeze(['attack', 'break', 'guard']);
export const BEATS = Object.freeze({attack:'break', break:'guard', guard:'attack'});
export const ENEMIES = Object.freeze({
  normal: {hp:68, pattern:'constant', name:['基础陪练','คู่ฝึกพื้นฐาน']},
  elite: {hp:104, pattern:'hold', name:['停顿精英','คู่ประลองหยุดจังหวะ']},
});
export function relation(stance, enemy) {
  if (!STANCES.includes(stance) || !STANCES.includes(enemy)) return null;
  return stance === enemy ? 'even' : BEATS[stance] === enemy ? 'counter' : 'exposed';
}
export function cursorAt(elapsed, duration, pattern='constant') {
  const t = Math.max(0, Math.min(1, elapsed / Math.max(1, duration)));
  if (pattern !== 'hold') return t;
  // Fixed telegraph: advance to 44%, hold, then continue. No random jumps.
  if (t < .36) return t / .36 * .44;
  if (t < .53) return .44;
  return .44 + (t - .53) / .47 * .56;
}
export function timingAt(cursor) {
  if (cursor >= .72 && cursor <= .81) return 'perfect';
  if (cursor >= .60 && cursor <= .89) return 'good';
  return 'ordinary';
}
export function questionAt(deck, round, seed=0) {
  if (!Array.isArray(deck) || deck.length < 3) throw Error('At least three language units required');
  if (new Set(deck.map(u=>u.id)).size !== deck.length) throw Error('Duplicate unit IDs');
  const index = ((round + seed) % deck.length + deck.length) % deck.length;
  const units = [deck[index], deck[(index+1)%deck.length], deck[(index+3)%deck.length]];
  if (new Set(units.map(u=>u.id)).size < 3) units[2]=deck[(index+2)%deck.length];
  const offset=((round+seed)%3+3)%3;
  return {unit:deck[index], options:units.slice(offset).concat(units.slice(0,offset))};
}
export function createBattle({kind='normal', world='th', relaxed=true, seed=0}={}) {
  if (!ENEMIES[kind]) throw Error('Unknown practice opponent');
  return {version:LAB_VERSION, kind, world:world==='cn'?'cn':'th', relaxed:!!relaxed,
    seed:Math.abs(Math.trunc(seed)||0), phase:'prepare', paused:false, round:0,
    hp:100, maxHp:100, enemyHp:ENEMIES[kind].hp, enemyMax:ENEMIES[kind].hp,
    elapsed:0, duration:relaxed?7200:5100, stance:null, enemyStance:'guard',
    promptReady:false, assisted:false, echo:false, echoUsed:false,
    hero:false, heroUsed:false, records:[], last:null, outcome:null};
}
export function preparePrompt(b, assisted=false) {
  if (b.phase !== 'prepare' || b.paused) return false;
  b.promptReady=true; b.assisted ||= assisted; return true;
}
export function awardRepeat(b, matched) {
  if (b.phase !== 'prepare' || b.paused || !b.promptReady || !matched || b.echoUsed) return false;
  b.echo=true; b.echoUsed=true; return true;
}
export function chooseStance(b, stance) {
  if (!STANCES.includes(stance) || b.paused || !b.promptReady) return false;
  if (b.phase === 'prepare') {
    b.stance=stance; b.phase='active'; b.elapsed=0; return true;
  }
  if (b.phase !== 'active' || progress(b) >= .60 || b.stance === stance) return false;
  b.stance=stance; b.elapsed+=200; return true;
}
export function progress(b) {
  return cursorAt(b.elapsed, b.duration*(b.echo?1.35:1), b.kind==='elite'?'hold':'constant');
}
export function advance(b, milliseconds) {
  if (b.phase !== 'active' || b.paused) return false;
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return false;
  b.elapsed+=milliseconds;
  return progress(b)>=1;
}
export function resolveAnswer(b, question, selectedId=null) {
  if (b.phase !== 'active' || b.paused) return null;
  if (selectedId !== null && !question.options.some(u=>u.id===selectedId)) return null;
  const timedOut=progress(b)>=1 || selectedId===null;
  const correct=!timedOut && selectedId===question.unit.id;
  const timing=timedOut?'miss':timingAt(progress(b));
  const tactical=relation(b.stance,b.enemyStance);
  let dealt=0, taken=0;
  if (correct) {
    dealt=tactical==='counter'?20:tactical==='even'?14:8;
    if(timing==='good')dealt+=3;
    if(timing==='perfect')dealt+=7;
    if(b.stance==='guard')dealt=Math.max(4,dealt-5);
    taken=tactical==='exposed'?(timing==='perfect'?2:7):0;
    if(b.hero && tactical==='counter' && timing!=='ordinary')dealt=b.enemyHp;
  } else taken=b.stance==='guard'?7:12;
  // Give the elite exactly one decisive exchange before a potential finishing hit.
  if(b.kind==='elite' && !b.heroUsed && !b.hero)dealt=Math.min(dealt,Math.max(0,b.enemyHp-18));
  dealt=Math.min(b.enemyHp,dealt); taken=Math.min(b.hp,taken);
  b.enemyHp-=dealt; b.hp-=taken;
  const record={round:b.round+1,unitId:question.unit.id,target:question.unit[b.world==='cn'?'zh':'th'],
    meaning:question.unit[b.world==='cn'?'th':'zh'],selectedId,correct,timedOut,
    timing,tactical,stance:b.stance,enemyStance:b.enemyStance,dealt,taken,
    assisted:b.assisted,echo:b.echo,hero:b.hero};
  b.records.push(record);b.last=record;
  if(b.hero)b.heroUsed=true;
  b.outcome=b.enemyHp<=0?'win':b.hp<=0?'lose':null;
  b.phase='resolved';return record;
}
export function nextRound(b) {
  if(b.phase!=='resolved'||b.paused)return false;
  if(b.outcome){b.phase='complete';return true;}
  b.round++;b.hero=b.kind==='elite'&&!b.heroUsed&&b.enemyHp<=35;
  b.phase='prepare';b.elapsed=0;b.stance=null;b.promptReady=false;b.assisted=false;b.echo=false;b.echoUsed=false;
  b.enemyStance=['guard','attack','break'][b.round%3];b.last=null;
  return true;
}
export function summary(b) {
  return {version:LAB_VERSION,kind:b.kind,world:b.world,relaxed:b.relaxed,outcome:b.outcome,
    attempts:b.records.length,correct:b.records.filter(r=>r.correct).length,
    answered:b.records.filter(r=>!r.timedOut).length,timeouts:b.records.filter(r=>r.timedOut).length,
    independent:b.records.filter(r=>r.correct&&!r.assisted).length,
    perfect:b.records.filter(r=>r.correct&&r.timing==='perfect').length,
    counters:b.records.filter(r=>r.correct&&r.tactical==='counter').length,
    records:b.records.map(r=>({...r})),scope:'experiment-only; no main-game rewards'};
}
