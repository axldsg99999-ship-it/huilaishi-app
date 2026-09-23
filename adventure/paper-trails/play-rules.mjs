import { clamp, pullPoint } from './core.mjs?v=play2';
export {segmentRect} from './core.mjs?v=play2';

export const STANCES=['attack','break','guard'];
export const BEATS={attack:'break',break:'guard',guard:'attack'};
export const DUEL_ENEMIES=[
 {monster:'elephant',hp:46,duration:7,pattern:'steady',plan:['guard','attack','break']},
 {monster:'bear',hp:62,duration:6.4,pattern:'hold',plan:['attack','break','guard']},
 {monster:'mantis',hp:80,duration:6,pattern:'steady',plan:['break','guard','attack']}
];
export function stanceRelation(player,enemy){
 if(!STANCES.includes(player)||!STANCES.includes(enemy))throw Error('Unknown stance');
 return player===enemy?'even':BEATS[player]===enemy?'counter':'exposed';
}
export function timingProgress(age,duration,pattern='steady'){
 const t=clamp(age/duration,0,1);
 if(pattern==='hold')return t<.36?t/.36*.44:t<.53?.44:.44+(t-.53)/.47*.56;
 return t;
}
export function timingGrade(p){return p>=.7&&p<=.84?'perfect':p>=.5&&p<=.94?'good':'ordinary';}
export function combatResult({stance,enemy,correct,progress=0,timedOut=false}){
 const relation=stanceRelation(stance,enemy),timing=timedOut?'miss':timingGrade(progress),understood=correct&&!timedOut;
 const dealt=understood?{counter:22,even:14,exposed:7}[relation]+(timing==='perfect'?7:timing==='good'?3:0):0;
 const taken=understood?(relation==='exposed'?(timing==='perfect'?2:6):0):timedOut?5:10;
 return {correct:understood,timedOut,timing,relation,dealt,taken,stance,enemy};
}
export function dragPull(anchor,p){
 // Relative pickup prevents tapping near the fork from teleporting to full draw.
 // 166 stage-pixels of finger travel yield 113 pixels of actual elastic stretch.
 return pullPoint({x:anchor.pull.x+(p.x-anchor.pointer.x)*.68,y:anchor.pull.y+(p.y-anchor.pointer.y)*.68});
}
export function obstaclesFor(cleared=0){
 const lower={id:'basket',x:550,y:436,w:72,h:149};
 return cleared===0?[lower]:[lower,{id:'canopy',x:623,y:194,w:86,h:81}];
}
export function correctPrefix(placed){let n=0;while(n<placed.length&&placed[n]===n)n++;return n;}
export function memoryExpected(pattern,reverse=false){return reverse?[...pattern].reverse():[...pattern];}
export function orderLength(round){return round<2?1:2;}
export const PLAY_COPY={
 zh:{stance:['进攻','破势','守势'],relation:{counter:'姿态克制',even:'同势交锋',exposed:'姿态被克'},timing:{perfect:'精准',good:'良机',ordinary:'普通时机',miss:'错过时机'},duelTitle:'听懂，再出招',duelPrepare:'先听词义，再选姿态；点正确意思就是出招。',duelActive:'在合适时机点意思出招 · 末段不能换势',duelRule:'进攻克破势 · 破势克守势 · 守势克进攻',duelLock:'已锁势',duelTimeout:'只是错过时机，不算语言答错',duelWrong:'词义还没对上，这一招未打出',duelClear:'守信者让开了路',duelTaken:'受伤',duelDamage:'造成',duelTip:'看动作判断，不提前公布对方招式',hp:'体力',enemyHp:'对手体力',attackHelp:'三势同等可用 · 无点数消耗',loaded:'已装填',animals:['纸鸢燕','月灯兔','织霞松鼠'],basketHit:'碰到竹篓了',canopyHit:'碰到悬幔了',basketTip:'往左下拉，让弧线越过竹篓。',canopyTip:'弧线太高，放缓一点，从悬幔下穿过。',obstacleRule:'越过竹篓 · 第二程留意悬幔',drawGuide:'按住弓兜后向左下拖，拉力随距离增加',order:'订单',dash:'小狗冲刺',dashReady:'可冲刺',dashWait:'歇一歇',doubleOrder:'双份委托 · 一件接好，再听下一件',singleOrder:'听清目标，再带小狗去接',partDelivered:'这一件送对了',bridgeRule:'放满三片自动试桥 · 可点已放的词撤回',bridgeKept:'前面的正确词片保留了',bridgeDistractor:'留意多余的词片',reverse:'这次倒着点灯',forward:'按听到的顺序点灯',memoryKept:'前面的灯保留了，从下一盏继续',echoWord:'听懂一个词',echoSentence:'听懂完整意思',complete:'已完成'},
 th:{stance:['รุก','ทลายท่า','ตั้งรับ'],relation:{counter:'ท่าได้เปรียบ',even:'ท่าเสมอกัน',exposed:'ท่าเสียเปรียบ'},timing:{perfect:'แม่นยำ',good:'จังหวะดี',ordinary:'จังหวะธรรมดา',miss:'พลาดจังหวะ'},duelTitle:'ฟังเข้าใจ แล้วออกท่า',duelPrepare:'ฟังความหมาย เลือกท่า แล้วแตะคำตอบเพื่อออกท่า',duelActive:'แตะความหมายให้ถูกจังหวะ · ช่วงท้ายเปลี่ยนท่าไม่ได้',duelRule:'รุกชนะทลายท่า · ทลายท่าชนะตั้งรับ · ตั้งรับชนะรุก',duelLock:'ล็อกท่าแล้ว',duelTimeout:'พลาดแค่จังหวะ ไม่นับว่าภาษาไม่ถูก',duelWrong:'ความหมายยังไม่ตรง จึงออกท่าไม่ได้',duelClear:'ผู้พิทักษ์เปิดทางแล้ว',duelTaken:'เสียพลัง',duelDamage:'ทำความเสียหาย',duelTip:'สังเกตท่าทาง ไม่มีข้อความบอกท่าล่วงหน้า',hp:'พลัง',enemyHp:'พลังคู่ต่อสู้',attackHelp:'ใช้ได้เท่ากันทั้งสามท่า · ไม่เสียแต้ม',loaded:'บรรจุแล้ว',animals:['นกว่าว','กระต่ายโคม','กระรอกผ้า'],basketHit:'ชนตะกร้าแล้ว',canopyHit:'ชนผ้าแขวนแล้ว',basketTip:'ดึงไปซ้ายล่าง ให้เส้นโค้งข้ามตะกร้า',canopyTip:'วิถีสูงไป ผ่อนแรงแล้วยิงลอดใต้ผ้า',obstacleRule:'ยิงข้ามตะกร้า · ช่วงต่อไประวังผ้าแขวน',drawGuide:'จับถุงยิงแล้วลากซ้ายล่าง แรงเพิ่มตามระยะ',order:'คำสั่งส่งของ',dash:'น้องหมาวิ่งเร็ว',dashReady:'พร้อมวิ่งเร็ว',dashWait:'พักแป๊บ',doubleOrder:'ส่งสองชิ้น · รับชิ้นแรกแล้วฟังชิ้นต่อไป',singleOrder:'ฟังเป้าหมาย แล้วพาน้องหมาไปรับ',partDelivered:'ส่งชิ้นนี้ถูกแล้ว',bridgeRule:'ครบสามคำจะลองสะพานเอง · แตะคำที่วางเพื่อนำออก',bridgeKept:'เก็บคำที่เรียงถูกด้านหน้าไว้แล้ว',bridgeDistractor:'ระวังคำที่เกินมา',reverse:'ครั้งนี้แตะโคมย้อนลำดับ',forward:'แตะโคมตามลำดับที่ได้ยิน',memoryKept:'เก็บโคมที่ถูกไว้แล้ว เริ่มจากโคมถัดไป',echoWord:'ฟังคำให้เข้าใจ',echoSentence:'ฟังความหมายทั้งประโยค',complete:'สำเร็จแล้ว'}
};
