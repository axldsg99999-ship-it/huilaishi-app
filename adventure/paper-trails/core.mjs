// Pure game rules. The six-chapter prototype never reads or writes formal saves.
export const SAVE_KEY = 'xulong.paper-trails.v1';
export const W = 1280, H = 720;
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function rng(seed = Date.now()) { let s = seed >>> 0; return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function shuffle(values, random = Math.random) { const a = [...values]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function rps(player, opponent) { if (![0, 1, 2].includes(player) || ![0, 1, 2].includes(opponent)) throw Error('Invalid gesture'); return player === opponent ? 0 : (player - opponent + 3) % 3 === 1 ? 1 : -1; }
// 0 rock; 1 paper; 2 scissors. Opponent is committed before the voice plays.
export const SLING = { x: 294, y: 447, gravity: 410, power: 8.1, maxPull: 113, minPull: 15 };
export function pullPoint(p) { let dx = clamp(p.x - SLING.x, -SLING.maxPull, 0), dy = clamp(p.y - SLING.y, -10, 94); const d = Math.hypot(dx, dy); if (d > SLING.maxPull) { dx *= SLING.maxPull / d; dy *= SLING.maxPull / d; } return { x: SLING.x + dx, y: SLING.y + dy }; }
// The gauge measures actual launch speed, not time held or a cosmetic charge.
export function slingTension(p = SLING) {
 const q=pullPoint(p||SLING), distance=Math.hypot(q.x-SLING.x,q.y-SLING.y), ratio=clamp(distance/SLING.maxPull,0,1);
 return {distance,ratio,percent:Math.round(ratio*100),band:ratio>=.985?3:ratio>=.7?2:ratio>=.35?1:0,canFire:distance>=SLING.minPull};
}
// Damped release oscillation. Reduced-motion mode renders a still resting sling.
export function slingRecoil(release, age, reduced=false) {
 if(!release||reduced||age<0||age>.7)return {x:0,y:0};
 const decay=Math.exp(-age*9),wave=Math.cos(age*28)*decay;
 return {x:(release.x-SLING.x)*wave,y:(release.y-SLING.y)*wave};
}
// Two-link inverse kinematics: the elbow bends; the hand stays on the draw pouch.
export function armJoints(root, hand, upper=86, fore=98) {
 const dx=hand.x-root.x,dy=hand.y-root.y,d=Math.max(.001,Math.hypot(dx,dy));
 const stretch=Math.max(1,d/(upper+fore-.01)),a=upper*stretch,b=fore*stretch;
 const along=clamp((a*a-b*b+d*d)/(2*d),-a,a),side=Math.sqrt(Math.max(0,a*a-along*along));
 return {root:{...root},elbow:{x:root.x+dx/d*along-dy/d*side,y:root.y+dy/d*along+dx/d*side},hand:{...hand},stretch};
}
export function launch(p) { const q = pullPoint(p); return { x: q.x, y: q.y, vx: (SLING.x - q.x) * SLING.power, vy: (SLING.y - q.y) * SLING.power, age: 0 }; }
export function ballistic(b, t) { return { x: b.x + b.vx * t, y: b.y + b.vy * t + SLING.gravity * t * t / 2 }; }
export function segmentCircle(a, b, c, radius) { const dx = b.x - a.x, dy = b.y - a.y; const d2 = dx * dx + dy * dy; const t = d2 ? clamp(((c.x - a.x) * dx + (c.y - a.y) * dy) / d2, 0, 1) : 0; return Math.hypot(a.x + dx * t - c.x, a.y + dy * t - c.y) <= radius; }
export function segmentRect(a,b,rect,padding=17){
 const minX=rect.x-padding,maxX=rect.x+rect.w+padding,minY=rect.y-padding,maxY=rect.y+rect.h+padding;let lo=0,hi=1;
 for(const [from,delta,min,max] of [[a.x,b.x-a.x,minX,maxX],[a.y,b.y-a.y,minY,maxY]]){
  if(Math.abs(delta)<1e-8){if(from<min||from>max)return false;continue;}
  const t1=(min-from)/delta,t2=(max-from)/delta;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));if(lo>hi)return false;
 }return hi>=0&&lo<=1;
}
// Assistance solves the entire arc, never through an earlier guardian.
export function solveAim(target, targets, obstacles=[]) {
 let best=null, score=Infinity;
 for(let dx=35;dx<=113;dx+=2)for(let dy=3;dy<=94;dy+=2){
  const p=pullPoint({x:SLING.x-dx,y:SLING.y+dy}), b=launch(p), t=(target.x-b.x)/b.vx;
  if(t<=0||t>3||Math.abs(ballistic(b,t).y-target.y)>42)continue;
  let previous=ballistic(b,0),first=null,ceiling=false;
  for(let s=.025;s<t+.08;s+=.025){const q=ballistic(b,s);if(q.y<164||obstacles.some(o=>segmentRect(previous,q,o))){ceiling=true;break;}first=targets.find(v=>!v.done&&segmentCircle(previous,q,v,47));if(first)break;previous=q;}
  if(ceiling||first!==target)continue;
  const d=Math.abs(ballistic(b,t).y-target.y)+t*.2;
  if(d<score){score=d;best=p;}
 }
 return best;
}
export function starsFor(errors, assists = 0) { return errors === 0 && assists === 0 ? 3 : errors <= 2 ? 2 : 1; }
export function cleanSave(raw) {
  const out = { version: 1, locale: 'zh', reduced: false, effects: true, levels: {} };
  if (!raw || typeof raw !== 'object') return out;
  out.locale = raw.locale === 'th' ? 'th' : 'zh'; out.reduced = raw.reduced === true; out.effects = raw.effects !== false;
  for (let i = 0; i < 6; i++) { const n = raw.levels?.[i]; if (n && Number.isFinite(n.stars) && Number.isFinite(n.score)) out.levels[i] = { stars: clamp(Math.floor(n.stars), 1, 3), score: clamp(Math.floor(n.score), 0, 100000) }; }
  return out;
}
export function mergeReward(save, level, reward) { const copy = cleanSave(save); const prev = copy.levels[level] || { stars: 0, score: 0 }; copy.levels[level] = { stars: Math.max(prev.stars, clamp(reward.stars, 1, 3)), score: Math.max(prev.score, Math.max(0, Math.round(reward.score))) }; return copy; }
export function memoryPattern(length, random = Math.random) { const a = []; for (let i = 0; i < length; i++) { let v = Math.floor(random() * 3); if (i && v === a[i - 1]) v = (v + 1 + Math.floor(random() * 2)) % 3; a.push(v); } return a; }
export function orderedIds(actual, expected) { return actual.length === expected.length && actual.every((n, i) => n === expected[i]); }
