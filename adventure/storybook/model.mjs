import {LESSONS} from './runtime/content.mjs';
export {createBattle,preparePrompt,chooseStance,progress,advance,resolveAnswer,nextRound,summary,relation,BEATS,STANCES} from './runtime/lab/engine.mjs';

export const PROFILE_KEY='xulong.storybook.pier.v1';
export const DECK=['a1-1','a0-5','a1-0','a1-3','a1-2','a1-4','a0-0','a0-2'].map(id=>LESSONS.flat().find(x=>x.id===id));
export function freshProfile(){return {version:1,completed:false,claimed:false,coins:0,closeness:0,charm:false,charmEquipped:false,calm:true,motion:true,sound:true,words:[],best:0};}
export function readProfile(raw){
  const p=freshProfile();
  try{
    const s=typeof raw==='string'?JSON.parse(raw):raw;
    if(!s||s.version!==1)return p;
    for(const key of ['completed','claimed','charm','charmEquipped','calm','motion','sound'])if(typeof s[key]==='boolean')p[key]=s[key];
    for(const key of ['coins','closeness','best'])if(Number.isFinite(s[key]))p[key]=Math.max(0,Math.min(999,Math.floor(s[key])));
    p.words=Array.isArray(s.words)?[...new Set(s.words.filter(id=>DECK.some(u=>u.id===id)))]:[];
    if(!p.charm)p.charmEquipped=false;
  }catch{}
  return p;
}
export function claimReward(profile,battle){
  if(battle?.outcome!=='win')return {granted:false,coins:0};
  profile.completed=true;
  profile.words=[...new Set([...profile.words,...battle.records.filter(r=>r.correct).map(r=>r.unitId)])];
  profile.best=Math.max(profile.best,battle.records.filter(r=>r.correct&&r.timing==='perfect').length);
  if(profile.claimed)return {granted:false,coins:0};
  profile.claimed=true;profile.coins+=36;profile.closeness+=12;profile.charm=true;
  return {granted:true,coins:36};
}
export function createPetSupport(){return {charge:0,used:false};}
export function chargePetSupport(pet,correct){if(correct&&!pet.used)pet.charge=Math.min(2,pet.charge+1);}
export function takePetSupport(pet,battle){
  if(pet.used||pet.charge<2||battle.phase!=='prepare'||battle.paused)return false;
  pet.used=true;pet.charge=0;return true;
}
export function questionFor(round){
  const unit=DECK[round%DECK.length];
  const options=[unit,DECK[(round+2)%DECK.length],DECK[(round+4)%DECK.length]];
  const shift=(round*2+1)%3;
  return {unit,options:[...options.slice(shift),...options.slice(0,shift)]};
}
