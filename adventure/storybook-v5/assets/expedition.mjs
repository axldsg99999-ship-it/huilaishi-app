// Original short-run route design. This module never accesses main-game saves.
import {createBattle,migrateBattle} from './combat-v3.mjs';
export const RUN_KEY='xulong.storybook.expedition.v1';
export const NODES=Object.freeze([
  {id:'dock',type:'start',name:'河畔邮筒',x:7,y:51,to:['market','letter'],note:'一封梅花信，指向学院钟楼。'},
  {id:'market',type:'battle',name:'河市切磋',x:24,y:29,to:['tea','orchid'],note:'普通切磋 · 敌方 44 体力 · 胜后选一枚旅途印记。'},
  {id:'letter',type:'event',name:'遗落画笺',x:24,y:76,to:['tea','orchid'],note:'奇遇 · 留下体力拓印线索，或帮忙拾起信笺。'},
  {id:'tea',type:'rest',name:'茶棚歇脚',x:43,y:19,to:['ferry','artisan'],note:'休息 · 恢复 26 体力，或研习现有招式。'},
  {id:'orchid',type:'elite',name:'花影试炼',x:43,y:65,to:['ferry','artisan'],note:'精英 · 敌方 78 体力 · 停顿节奏，强化额外升一级。'},
  {id:'ferry',type:'event',name:'渡口来信',x:62,y:29,to:['courtyard','veranda'],note:'奇遇 · 付 12 纸币换一条线索，或替船家整理信件。'},
  {id:'artisan',type:'shop',name:'匠人小铺',x:62,y:81,to:['courtyard','veranda'],note:'商店 · 花 18 纸币选一枚印记；也可以直接离开。'},
  {id:'courtyard',type:'rest',name:'钟楼茶亭',x:79,y:27,to:['bell'],note:'休息 · 最后一次补给，也可以选择冒险研习。'},
  {id:'veranda',type:'battle',name:'廊下切磋',x:79,y:74,to:['bell'],note:'普通切磋 · 敌方 56 体力 · 争取最后一枚强化。'},
  {id:'bell',type:'boss',name:'守信者',x:94,y:51,to:[],note:'章节守关 · 敌方 112 体力 · 找回她留在钟楼的信。'},
]);
export const nodeById=id=>NODES.find(n=>n.id===id);
export const POWERS=Object.freeze([
  {id:'cinnabar',name:'朱砂印',icon:'attack',color:'#a84132',text:'答对且选进攻时，每级额外造成 4 点伤害。'},
  {id:'jade',name:'竹玉扣',icon:'guard',color:'#517967',text:'选择守势时，每级减少 3 点受到的伤害。'},
  {id:'orchid',name:'兰花结',icon:'break',color:'#735786',text:'选择破势并答对时，每级额外造成 5 点伤害。'},
  {id:'echo',name:'回声铃',icon:'sound',color:'#ad8335',text:'精准答对后，每级回复 3 点体力。'},
  {id:'pet',name:'阿笺信袋',icon:'paw',color:'#b26936',text:'每级让阿笺开场多 1 点助战充能（最多 2 点）。'},
  {id:'bamboo',name:'青竹书签',icon:'book',color:'#477777',text:'每场首次答错时，每级减免 5 点伤害。'},
]);
export const powerById=id=>POWERS.find(p=>p.id===id);
export function createRun(seed=Date.now()%10000){return {version:1,seed:Math.abs(Math.floor(seed))%10000,hp:100,maxHp:100,coins:20,path:['dock'],active:null,stage:'map',powers:{},offers:[],rewardLevels:1,battle:null,words:[],correct:0,finished:false,failed:false};}
export function availableNodes(run){return run.stage==='map'&&!run.finished&&!run.failed?nodeById(run.path.at(-1)).to:[];}
export function enterNode(run,id){
  if(!availableNodes(run).includes(id))return false;
  const node=nodeById(id);run.active=id;run.stage=['battle','elite','boss'].includes(node.type)?'battle':node.type;run.offers=[];
  if(run.stage==='shop')run.offers=offerPowers(run);
  return true;
}
export function offerPowers(run){
  const pool=POWERS.filter(p=>(run.powers[p.id]||0)<3);
  const offset=(run.seed+run.path.length*3+NODES.findIndex(n=>n.id===run.active))%Math.max(1,pool.length);
  return [...pool.slice(offset),...pool.slice(0,offset)].slice(0,3).map(p=>p.id);
}
export function makeRouteBattle(run){
  if(run.stage!=='battle'||run.battle)return run.battle;
  const n=nodeById(run.active),b=createBattle({kind:n.type==='battle'?'normal':'elite',seed:run.seed,relaxed:true});
  b.hp=run.hp;b.enemyHp=b.enemyMax=n.type==='boss'?112:n.type==='elite'?78:n.id==='veranda'?56:44;
  b.routeNode=n.id;b.routePetUsed=false;b.routeFirstMistake=false;b.routeApplied=-1;
  run.battle=b;return b;
}
export function applyRouteAnswer(run,b,result){
  if(!result||b!==run.battle||b.routeApplied===result.round)return;
  b.routeApplied=result.round;
  let extra=0,saved=0,heal=0;
  if(result.correct){
    if(result.stance==='attack')extra+=4*(run.powers.cinnabar||0);
    if(result.stance==='break')extra+=5*(run.powers.orchid||0);
    if(result.timing==='perfect')heal+=3*(run.powers.echo||0);
  }
  if(result.stance==='guard')saved+=3*(run.powers.jade||0);
  if(!result.correct&&!b.routeFirstMistake){saved+=5*(run.powers.bamboo||0);b.routeFirstMistake=true;}
  extra=Math.min(extra,b.enemyHp);
  // Mitigate before HP clamping. Otherwise a low-HP guard could become immortal.
  const beforeHp=result.hpBefore;
  const rawTaken=result.rawTaken;
  const actualTaken=Math.min(beforeHp,Math.max(0,rawTaken-saved));
  const blocked=result.taken-actualTaken;
  const actualHeal=Math.min(heal,100-(beforeHp-actualTaken));
  b.enemyHp-=extra;b.hp=beforeHp-actualTaken+actualHeal;
  result.dealt+=extra;result.taken=actualTaken;result.routeBonus=extra;result.routeBlocked=blocked;result.routeHeal=actualHeal;
  b.outcome=b.enemyHp<=0?'win':b.hp<=0?'lose':null;
  run.hp=b.hp;
}
function finishNode(run){
  if(!run.active||run.path.includes(run.active))return false;
  run.path.push(run.active);run.active=null;run.stage='map';run.offers=[];run.battle=null;return true;
}
export function settleBattle(run){
  const b=run.battle;if(run.stage!=='battle'||!b||b.phase!=='complete'||!b.outcome)return false;
  run.hp=b.hp;run.correct+=b.records.filter(r=>r.correct).length;
  run.words=[...new Set([...run.words,...b.records.filter(r=>r.correct).map(r=>r.unitId)])];
  if(b.outcome==='lose'){run.failed=true;run.stage='ending';return true;}
  const n=nodeById(run.active);run.coins+=n.type==='elite'?22:n.type==='boss'?30:12;
  if(n.type==='boss'){finishNode(run);run.finished=true;run.stage='ending';return true;}
  run.stage='reward';run.rewardLevels=n.type==='elite'?2:1;run.offers=offerPowers(run);return true;
}
export function choosePower(run,id){
  if(!['reward','shop'].includes(run.stage)||!run.offers.includes(id))return false;
  if(run.stage==='shop'&&run.coins<18)return false;
  if(run.stage==='shop')run.coins-=18;
  run.powers[id]=Math.min(3,(run.powers[id]||0)+(run.stage==='reward'?run.rewardLevels:1));
  return finishNode(run);
}
export function skipShop(run){return run.stage==='shop'?finishNode(run):false;}
export function restChoice(run,choice){
  if(run.stage!=='rest')return false;
  if(choice==='heal'){run.hp=Math.min(100,run.hp+26);return finishNode(run);}
  if(choice==='train'){run.stage='reward';run.rewardLevels=1;run.offers=offerPowers(run);return true;}
  return false;
}
export function eventChoice(run,choice){
  if(run.stage!=='event')return false;
  const first=run.active==='letter';
  if(choice==='help'){run.hp=Math.min(100,run.hp+(first?8:10));run.coins+=5;return finishNode(run);}
  if(choice!=='trace')return false;
  if(first){if(run.hp<=8)return false;run.hp-=8;}
  else {if(run.coins<12)return false;run.coins-=12;}
  run.stage='reward';run.rewardLevels=1;run.offers=offerPowers(run);return true;
}
export function readRun(raw){
  try{
    const r=typeof raw==='string'?JSON.parse(raw):raw;
    if(!r||r.version!==1||!Array.isArray(r.path)||r.path[0]!=='dock'||r.path.length>6)return null;
    if(new Set(r.path).size!==r.path.length)return null;
    for(let i=1;i<r.path.length;i++)if(!nodeById(r.path[i-1])?.to.includes(r.path[i]))return null;
    if(!Number.isInteger(r.seed)||!Number.isFinite(r.hp)||r.hp<0||r.hp>100||!Number.isFinite(r.coins)||r.coins<0||r.coins>1000)return null;
    if(!['map','battle','event','rest','shop','reward','ending'].includes(r.stage))return null;
    if(r.active!==null&&!nodeById(r.path.at(-1))?.to.includes(r.active))return null;
    if(['battle','event','rest','shop','reward'].includes(r.stage)&&!r.active)return null;
    if(r.stage==='map'&&r.active!==null)return null;
    if(!r.powers||typeof r.powers!=='object'||Object.entries(r.powers).some(([id,n])=>!powerById(id)||!Number.isInteger(n)||n<1||n>3))return null;
    if(!Array.isArray(r.offers)||r.offers.length>3||r.offers.some(id=>!powerById(id)))return null;
    if(![1,2].includes(r.rewardLevels)||!Array.isArray(r.words)||!Number.isFinite(r.correct))return null;
    if(r.stage==='battle'&&r.battle){
      const b=r.battle,n=nodeById(r.active);
      if(!['battle','elite','boss'].includes(n.type)||b.routeNode!==n.id||!['prepare','active','resolved','complete'].includes(b.phase))return null;
      if(![b.hp,b.enemyHp,b.enemyMax,b.round,b.elapsed,b.duration].every(Number.isFinite)||b.hp<0||b.hp>100||b.enemyHp<0||b.enemyHp>b.enemyMax||b.round<0||b.round>200||b.elapsed<0||b.duration<=0)return null;
      if(!Array.isArray(b.records)||b.records.length>201)return null;
      if(!migrateBattle(b))return null;
      if(b.stance!==null&&!['attack','break','guard'].includes(b.stance))return null;
      b.paused=false;
    }
    if(r.finished&&(r.path.at(-1)!=='bell'||r.stage!=='ending'))return null;
    return {...createRun(r.seed),...r,maxHp:100};
  }catch{return null;}
}
