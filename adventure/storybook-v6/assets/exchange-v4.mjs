// One animation clock: pausing the scene also pauses the impact and completion.
export class Exchange {
 constructor(record,{impact=()=>{},finish=()=>{},motion=true}={}){this.record=record;this.elapsed=0;this.impacted=false;this.finished=false;this.impact=impact;this.finish=finish;this.motion=motion;this.hitAt=motion?380:80;this.endAt=motion?1180:420;}
 tick(dt){this.elapsed+=Math.max(0,dt);if(this.finished)return;if(!this.impacted&&this.elapsed>=this.hitAt){this.impacted=true;this.impact();}if(!this.finished&&this.elapsed>=this.endAt){this.finished=true;this.finish();}}
 pose(){
  if(!this.motion)return {heroDx:0,enemyDx:0,shake:0};
  const t=this.elapsed,r=this.record,recoil=Math.max(0,1-Math.max(0,t-440)/600),attack=Math.min(1,Math.max(0,(t-90)/260));
  return {heroDx:r.correct?(r.stance==='guard'?0:(t<430?attack*.075:recoil*.065)):(t>380?-recoil*.035:0),
   enemyDx:r.correct?(t>380?recoil*.035:0):-(t<430?attack*.075:recoil*.065),
   shake:t>380&&t<490?Math.sin(t*.18)*1.8:0};
 }
}
