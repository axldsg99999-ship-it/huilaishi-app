import {slingTension} from './core.mjs?v=draw3';

export const FACE_NAMES=['rest','focus','strain','release','happy','oops'];
export function slingExpression(run){
 if(!run)return 'rest';
 if(run.phase==='feedback'||run.phase==='finished')return run.reaction||'rest';
 if(run.phase==='flight')return 'release';
 if(run.phase==='aim'&&run.pull){
  const power=slingTension(run.pull).ratio;
  return power>=.78?'strain':power>.06?'focus':'rest';
 }
 return 'rest';
}
export const faceKey=(locale,expression)=>'draw3-'+(locale==='th'?'girl':'hero')+'-face-'+expression;
