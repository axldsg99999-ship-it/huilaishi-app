import {createBattle,resolveAnswer,migrateBattle} from './combat-v3.mjs';

export const SERIES_KEY='xulong.storybook.three-letters.v4';
export const ENCOUNTERS=Object.freeze([
 {id:'elephant',name:'晨市小象',chapter:'第一封 · 果篮里的问候',place:'晨市',hp:64,offset:0,
  trait:'藤篮护甲',tip:'藤篮挡住前 12 点伤害。用破势克制守势时，直接拆开护甲。',
  intro:'阿笺从果篮下嗅到一角信纸。小象笑着拦住你：先听懂它的问候。',
  memory:'“她帮我捡起了散落的水果，还教我说谢谢。”小象把第一枚花印放进你手心。',stamp:'花',color:'#e7b65d'},
 {id:'orchid',name:'绣风兰螳',chapter:'第二封 · 花廊里的回声',place:'花廊',hp:84,offset:3,
  trait:'连心花瓣',tip:'连续答对会共鸣：第二次起追加伤害，答错会中断。',
  intro:'兰螳把信藏进花瓣。它还记得她教过的词，等一个能接住回声的人。',
  memory:'“她把不会说的话，画在信上。”兰螳递来第二枚叶印，信纸上出现了钟楼。',stamp:'叶',color:'#eeb4ac'},
 {id:'kite',name:'钟楼守信兽',chapter:'第三封 · 纸翼归来',place:'钟楼',hp:108,offset:5,
  trait:'两重纸封',tip:'纸封每层减伤 4。精准或成功克制拆一层，过半血后答错更危险。',
  intro:'暮色里，一只纸翼小龙守着最后的信。拆开纸封，才能听见她留下的完整心意。',
  memory:'“如果你也来到这里，就替我对这个世界说一句：你好。”三枚印记终于合成她的来信。',stamp:'信',color:'#b4d8c6'},
]);
export function newSeries(){return {version:4,step:0,hp:100,coins:0,stamps:[],perks:[],reports:[],stage:'intro',battle:null,finished:false};}
export const currentEncounter=s=>ENCOUNTERS[Math.min(2,s?.step||0)];
export function startEncounter(s){
 if(!s||s.finished||!['intro','battle'].includes(s.stage))return null;
 if(s.battle)return s.battle;
 const e=currentEncounter(s),b=createBattle({kind:e.id==='kite'?'elite':'normal',relaxed:true,enemyId:e.id});
 Object.assign(b,{enemyId:e.id,enemyMax:e.hp,enemyHp:e.hp,hp:s.hp,armor:e.id==='elephant'?12:0,
  seals:e.id==='kite'?2:0,combo:0,awakened:false,perks:[...s.perks],seriesStep:s.step});
 s.battle=b;s.stage='battle';return b;
}
export function resolveEncounter(b,q,id){
 const before=b.enemyHp,armorBefore=b.armor,sealsBefore=b.seals;
 const r=resolveAnswer(b,q,id);if(!r)return null;
 r.enemyHpBefore=before;r.armorBefore=armorBefore;r.sealsBefore=sealsBefore;
 b.combo=r.correct?b.combo+1:0;
 let damage=r.dealt,block=0;
 r.notes=[];
 if(r.correct){
  if(b.perks.includes('cinnabar'))damage+=3;
  if(b.enemyId==='elephant'&&b.armor){
   const shatter=r.stance==='break'&&r.tactical==='counter';
   block=shatter?0:Math.min(b.armor,damage);
   b.armor=shatter?0:b.armor-block;
   r.notes.push(b.armor===0?'藤篮破开':'藤篮挡下 '+block);r.armorBroken=b.armor===0;
  }
  if(b.enemyId==='orchid'&&b.combo>=2){const bonus=Math.min(12,(b.combo-1)*4);damage+=bonus;r.notes.push(b.combo+' 连心 · 共鸣 +'+bonus);}
  if(b.enemyId==='kite'){
   if(b.seals&&(r.tactical==='counter'||r.timing==='perfect')){b.seals--;r.sealBroken=true;r.notes.push('纸封散开');}
   block=b.seals*4;
   if(block)r.notes.push('纸封减伤 '+block);
  }
 }
 damage=r.correct?Math.max(1,damage-block):0;
 r.blocked=block;r.dealt=Math.min(before,damage);b.enemyHp=before-r.dealt;
 let risk=r.rawTaken;
 if(!r.correct&&b.awakened){risk+=4;r.notes.push('暮钟回响');}
 if(b.perks.includes('jade')){r.mitigated=Math.min(3,risk);risk-=r.mitigated;}
 r.taken=Math.min(r.hpBefore,risk);b.hp=r.hpBefore-r.taken;
 if(r.correct&&r.taken)r.notes.push('对方回击 −'+r.taken);
 if(b.enemyId==='kite'&&!b.awakened&&b.enemyHp>0&&b.enemyHp<=b.enemyMax/2){b.awakened=true;r.awakened=true;r.notes.push('暮钟响起');}
 r.combo=b.combo;r.enemyId=b.enemyId;
 b.outcome=b.enemyHp<=0?'win':b.hp<=0?'lose':null;
 return r;
}
export function settleEncounter(s){
 const b=s?.battle;if(s?.stage!=='battle'||b?.phase!=='complete'||!b.outcome)return false;
 s.hp=b.hp;
 if(b.outcome==='lose'){s.stage='lost';return true;}
 const e=currentEncounter(s);
 if(!s.stamps.includes(e.id)){
  s.stamps.push(e.id);s.coins+=[18,24,36][s.step];
  s.reports.push({id:e.id,correct:b.records.filter(r=>r.correct).length,perfect:b.records.filter(r=>r.correct&&r.timing==='perfect').length});
 }
 s.stage='reward';return true;
}
export function collectEncounter(s,perk){
 if(s?.stage!=='reward')return false;
 if(s.step<2&&!['cinnabar','jade'].includes(perk))return false;
 if(s.step===2){s.finished=true;s.stage='complete';return true;}
 // Choices last for the remaining series; duplicate choices refresh, not stack.
 if(!s.perks.includes(perk))s.perks.push(perk);
 s.hp=Math.min(100,s.hp+24);s.step++;s.battle=null;s.stage='intro';return true;
}
export function retryEncounter(s){if(s?.stage!=='lost')return false;s.hp=100;s.battle=null;s.stage='intro';return true;}
export function readSeries(raw){
 try{
  const s=JSON.parse(raw);if(!s||s.version!==4||!Number.isInteger(s.step)||s.step<0||s.step>2||
   !['intro','battle','reward','lost','complete'].includes(s.stage)||!Number.isFinite(s.hp)||s.hp<0||s.hp>100||
   !Number.isFinite(s.coins)||s.coins<0||!Array.isArray(s.stamps)||new Set(s.stamps).size!==s.stamps.length||
   s.stamps.some(id=>!ENCOUNTERS.some(e=>e.id===id))||!Array.isArray(s.perks)||s.perks.some(p=>!['jade','cinnabar'].includes(p))||!Array.isArray(s.reports))return null;
  if(['battle','reward','lost','complete'].includes(s.stage)){
   const b=s.battle;if(!b||b.enemyId!==currentEncounter(s).id||!['prepare','active','resolved','complete'].includes(b.phase)||!Array.isArray(b.records)||
    !Number.isFinite(b.hp)||b.hp<0||b.hp>100||!Number.isFinite(b.enemyHp)||b.enemyHp<0||b.enemyHp>b.enemyMax||
    b.enemyMax!==currentEncounter(s).hp||!Number.isFinite(b.duration)||b.duration<=0||!Number.isFinite(b.elapsed)||b.elapsed<0||
    !Number.isInteger(b.round)||b.round<0||!Number.isInteger(b.combo)||b.combo<0||
    !Number.isFinite(b.armor)||b.armor<0||b.armor>12||!Number.isInteger(b.seals)||b.seals<0||b.seals>2||
    !Array.isArray(b.perks)||b.perks.some(p=>!['jade','cinnabar'].includes(p)))return null;
   if(['resolved','complete'].includes(b.phase)&&(!b.last||!Number.isFinite(b.last.dealt)||!Number.isFinite(b.last.taken)))return null;
   if(!migrateBattle(b))return null;
   b.paused=false;
   // On return, offer the same sentence again rather than resuming a timed action.
   if(b.phase==='active'){b.phase='prepare';b.elapsed=0;b.stance=null;b.promptReady=false;}
  }
  return s;
 }catch{return null;}
}

export function traitLabel(b){
 if(b.enemyId==='elephant')return b.armor?'藤篮护甲 '+b.armor:'藤篮已破';
 if(b.enemyId==='orchid')return '连心 '+b.combo+' · 连对有共鸣';
 if(b.enemyId==='kite')return '纸封 '+b.seals+'/2'+(b.awakened?' · 暮钟回响':'');
 return '';
}
