// A teaching encounter is deliberately isolated from mastery and currency.
export const TUTORIAL_IDS = Object.freeze(['a0-0','a0-1','a0-2']);
export function tutorialStatus(raw, world) {
  const value=raw?.onboarding?.[world];
  if(['new','skipped','complete'].includes(value))return value;
  const progress=raw?.worlds?.[world];
  return progress?.cleared?.length||Object.keys(progress?.mastery||{}).length?'skipped':'new';
}
export function needsTutorial(save,world=save.world){return tutorialStatus(save,world)==='new';}
export function createTutorial(ids=TUTORIAL_IDS){
  return {ids:[...new Set(ids)].slice(0,3),index:0,phase:'question',correct:false,attempts:0};
}
export function answerTutorial(state,id,correct){
  if(!state||state.phase!=='question'||state.ids[state.index]!==id)return false;
  state.phase='review';state.correct=correct===true;state.attempts++;
  return true;
}
export function advanceTutorial(state){
  if(!state||state.phase!=='review')return false;
  if(state.correct)state.index++;
  state.phase=state.index===state.ids.length?'complete':'question';state.correct=false;
  return true;
}
export function completeTutorial(save,state){
  if(!state||state.phase!=='complete'||!['th','cn'].includes(save.world))return false;
  save.onboarding??={th:'new',cn:'new'};
  save.onboarding[save.world]='complete';return true;
}
