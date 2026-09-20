// Player-owned tactics. No hidden enemy stance or rock-paper-scissors roll.
import {cursorAt,timingAt} from '../runtime/lab/engine.mjs';
export const STANCES=Object.freeze(['attack','break','guard']);
export const TACTICS=Object.freeze({
 attack:{label:'进攻',note:'高伤 · 非精准会受伤',damage:22,risk:4,miss:12},
 break:{label:'破势',note:'耗 2 蓄力 · 答对打断',damage:32,risk:0,miss:10},
 guard:{label:'守势',note:'低伤 · 减伤 · 蓄力 +1',damage:11,risk:0,miss:5},
});
export function createBattle({kind='normal',world='th',relaxed=true,seed=0}={}){
 if(!['normal','elite'].includes(kind))throw Error('Unknown encounter');
 return {version:'storybook-combat-3',kind,world,relaxed,seed,phase:'prepare',paused:false,round:0,
 hp:100,maxHp:100,enemyHp:kind==='elite'?104:68,enemyMax:kind==='elite'?104:68,
 duration:relaxed?7200:5100,elapsed:0,stance:null,focus:0,promptReady:false,assisted:false,
 echo:false,hero:false,records:[],last:null,outcome:null};
}
export function preparePrompt(b,assisted=false){if(b.phase!=='prepare'||b.paused)return false;b.promptReady=true;b.assisted||=assisted;return true;}
export function progress(b){return cursorAt(b.elapsed,b.duration,b.kind==='elite'?'hold':'constant');}
export function chooseStance(b,s){
 if(!TACTICS[s]||b.paused||!b.promptReady||s==='break'&&b.focus<2)return false;
 if(b.phase==='prepare'){b.stance=s;b.phase='active';b.elapsed=0;return true;}
 if(b.phase!=='active'||progress(b)>=.6||b.stance===s)return false;
 b.stance=s;b.elapsed+=200;return true;
}
export function advance(b,ms){if(b.phase!=='active'||b.paused||!Number.isFinite(ms)||ms<0)return false;b.elapsed+=ms;return progress(b)>=1;}
export function resolveAnswer(b,q,id=null){
 if(b.phase!=='active'||b.paused||!TACTICS[b.stance]||id!==null&&!q.options.some(u=>u.id===id))return null;
 if(b.stance==='break'&&b.focus<2)return null;
 const timedOut=progress(b)>=1||id===null,correct=!timedOut&&id===q.unit.id;
 const timing=timedOut?'miss':timingAt(progress(b)),t=TACTICS[b.stance],focusBefore=b.focus;
 const rawTaken=correct?(timing==='perfect'?0:t.risk):t.miss;
 const rawDamage=correct?t.damage+(timing==='perfect'?7:timing==='good'?3:0):0;
 if(b.stance==='break')b.focus-=2;else if(correct)b.focus=Math.min(3,b.focus+1);
 const dealt=Math.min(b.enemyHp,rawDamage),taken=Math.min(b.hp,rawTaken);
 const record={round:b.round+1,unitId:q.unit.id,selectedId:id,correct,timedOut,timing,stance:b.stance,
 tactical:b.stance==='break'&&correct?'interrupt':b.stance==='guard'?'shelter':'advance',
 dealt,taken,rawTaken,hpBefore:b.hp,focusBefore,focusAfter:b.focus,assisted:b.assisted,echo:false,hero:false};
 b.enemyHp-=dealt;b.hp-=taken;b.records.push(record);b.last=record;
 b.outcome=b.enemyHp<=0?'win':b.hp<=0?'lose':null;b.phase='resolved';return record;
}
export function nextRound(b){
 if(b.phase!=='resolved'||b.paused)return false;
 if(b.outcome){b.phase='complete';return true;}
 b.round++;b.phase='prepare';b.elapsed=0;b.stance=null;b.promptReady=false;b.assisted=false;b.last=null;return true;
}
export function summary(b){return {outcome:b.outcome,correct:b.records.filter(r=>r.correct).length,
 perfect:b.records.filter(r=>r.correct&&r.timing==='perfect').length,records:b.records.map(r=>({...r}))};}
