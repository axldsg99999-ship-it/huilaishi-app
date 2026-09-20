// Three equal basic stances. An opponent's move is locked before input.
import {cursorAt,timingAt,relation} from '../runtime/lab/engine.mjs';
export {relation} from '../runtime/lab/engine.mjs';
export const COMBAT_VERSION='storybook-combat-5';
export const STANCES=Object.freeze(['attack','break','guard']);
export const BEATS=Object.freeze({attack:'break',break:'guard',guard:'attack'});
export const TACTICS=Object.freeze({
 attack:{label:'进攻',note:'克破势 · 怕守势'},
 break:{label:'破势',note:'克守势 · 怕进攻'},
 guard:{label:'守势',note:'克进攻 · 怕破势'},
});
// Hand-authored tells, not a choice made in response to the player's stance.
const PLANS=Object.freeze({
 elephant:['guard','attack','break','guard','break','attack'],
 orchid:['break','guard','attack','guard','break','attack'],
 kite:['attack','break','guard','attack','guard','break'],
});
const planned=b=>{const plan=PLANS[b.enemyId]||PLANS.orchid;return plan[(b.round+Math.abs(Math.trunc(b.seed)||0))%plan.length];};
function lockIntent(b){b.enemyStance=planned(b);b.intentRound=b.round;}
export function migrateBattle(b){
 if(b.version!==COMBAT_VERSION){
  b.version=COMBAT_VERSION;lockIntent(b);
  if(['prepare','active'].includes(b.phase)){b.phase='prepare';b.elapsed=0;b.stance=null;b.promptReady=false;}
 }
 delete b.focus;
 return b.intentRound===b.round&&STANCES.includes(b.enemyStance)&&b.enemyStance===planned(b);
}
export function createBattle({kind='normal',world='th',relaxed=true,seed=0,enemyId='orchid'}={}){
 if(!['normal','elite'].includes(kind))throw Error('Unknown encounter');
 const b={version:COMBAT_VERSION,kind,world,relaxed,seed:Math.abs(Math.trunc(seed)||0),enemyId,phase:'prepare',paused:false,round:0,
 hp:100,maxHp:100,enemyHp:kind==='elite'?104:68,enemyMax:kind==='elite'?104:68,
 duration:relaxed?7200:5100,elapsed:0,stance:null,promptReady:false,assisted:false,
 echo:false,hero:false,records:[],last:null,outcome:null};
 lockIntent(b);return b;
}
export function preparePrompt(b,assisted=false){if(b.phase!=='prepare'||b.paused)return false;b.promptReady=true;b.assisted||=assisted;return true;}
export function progress(b){return cursorAt(b.elapsed,b.duration,b.kind==='elite'?'hold':'constant');}
export function chooseStance(b,s){
 if(!TACTICS[s]||b.paused||!b.promptReady)return false;
 if(b.phase==='prepare'){b.stance=s;b.phase='active';b.elapsed=0;return true;}
 if(b.phase!=='active'||progress(b)>=.6||b.stance===s)return false;
 b.stance=s;b.elapsed+=200;return true;
}
export function advance(b,ms){if(b.phase!=='active'||b.paused||!Number.isFinite(ms)||ms<0)return false;b.elapsed+=ms;return progress(b)>=1;}
export function resolveAnswer(b,q,id=null){
 if(b.phase!=='active'||b.paused||!TACTICS[b.stance]||b.intentRound!==b.round||!STANCES.includes(b.enemyStance)||id!==null&&!q.options.some(u=>u.id===id))return null;
 const timedOut=progress(b)>=1||id===null,correct=!timedOut&&id===q.unit.id;
 const timing=timedOut?'miss':timingAt(progress(b)),tactical=relation(b.stance,b.enemyStance);
 const rawTaken=correct?(tactical==='exposed'?(timing==='perfect'?3:7):0):12;
 const rawDamage=correct?({counter:24,even:16,exposed:9}[tactical]+(timing==='perfect'?6:timing==='good'?3:0)):0;
 const dealt=Math.min(b.enemyHp,rawDamage),taken=Math.min(b.hp,rawTaken);
 const record={round:b.round+1,unitId:q.unit.id,selectedId:id,correct,timedOut,timing,stance:b.stance,
 tactical,enemyStance:b.enemyStance,dealt,taken,rawTaken,hpBefore:b.hp,enemyHpBefore:b.enemyHp,assisted:b.assisted,echo:false,hero:false};
 b.enemyHp-=dealt;b.hp-=taken;b.records.push(record);b.last=record;
 b.outcome=b.enemyHp<=0?'win':b.hp<=0?'lose':null;b.phase='resolved';return record;
}
export function nextRound(b){
 if(b.phase!=='resolved'||b.paused)return false;
 if(b.outcome){b.phase='complete';return true;}
 b.round++;b.phase='prepare';b.elapsed=0;b.stance=null;b.promptReady=false;b.assisted=false;b.last=null;lockIntent(b);return true;
}
export function summary(b){return {outcome:b.outcome,correct:b.records.filter(r=>r.correct).length,
 perfect:b.records.filter(r=>r.correct&&r.timing==='perfect').length,counters:b.records.filter(r=>r.correct&&r.tactical==='counter').length,records:b.records.map(r=>({...r}))};}
