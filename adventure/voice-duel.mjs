import {matchSpeech} from './core.mjs?v=0.4.6';

// Optional spoken encounters reuse their resident's authored art. No speech
// recognizer confidence is ever treated as a pronunciation / accent score.
export const VOICE_DUELS = Object.freeze([
 {id:'first-echo',chapter:0,rank:0,hp:160,penalty:9,reward:6,
  residents:{th:'umbrella',cn:'fox'},zh:'初声 · 接住一个词',th:'เสียงแรก · รับหนึ่งคำ',
  storyZh:'风把信里的词吹散了。它只认得声音，不认得指向答案的手。听它说完，用正在学习的语言把这个词送回来。',
  storyTh:'ลมพัดคำในจดหมายกระจัดกระจาย มันจำได้เฉพาะเสียง ฟังให้จบแล้วพูดคำนั้นกลับด้วยภาษาที่กำลังเรียน'},
 {id:'daily-echo',chapter:1,rank:1,hp:210,penalty:11,reward:8,
  residents:{th:'karaoke-myna',cn:'porcelain-lion'},zh:'接声 · 把问候说出口',th:'เสียงตอบ · กล่าวคำทักทาย',
  storyZh:'第二支麦克风一直空着。今天不用替它选纸条；把问候和感谢亲口说出来，让这段独唱有一个回应。',
  storyTh:'ไมโครโฟนตัวที่สองยังว่าง วันนี้ไม่ต้องเลือกกระดาษ พูดคำทักทายและขอบคุณให้เพลงเดี่ยวนี้มีเสียงตอบ'},
 {id:'sentence-echo',chapter:3,rank:2,hp:250,penalty:13,reward:10,
  residents:{th:'debate-hornbill',cn:'twin-bell'},zh:'长声 · 把一句话说完整',th:'เสียงต่อเนื่อง · พูดให้ครบประโยค',
  storyZh:'两城的回声停在了半句话上。它会耐心念完一封短笺，只有把整句话接回来，沉默的纸扣才会打开。',
  storyTh:'เสียงสะท้อนของสองเมืองหยุดอยู่กลางประโยค ฟังข้อความสั้นให้จบ แล้วพูดกลับให้ครบเพื่อเปิดตัวล็อกกระดาษ'},
]);
export function voiceDuel(id){return VOICE_DUELS.find(d=>d.id===id)||null;}
export function voiceDuelOpen(save,duel){return !!duel&&Number(save.worlds?.[save.world]?.chapter)>=duel.chapter;}
export function voiceCaptureMs(text){return Math.min(32000,Math.max(12000,7000+Array.from(String(text).replace(/\p{M}/gu,'')).length*330));}
export function judgeVoiceDuel(text,target,meta={}){
 const transcript=typeof text==='string'?text.trim():'';
 if(!transcript||!String(target||'').trim())return {outcome:'retry',reason:'no-speech',kind:'transcript-match'};
 // 0 / missing / -1 often mean "not supplied". A reported low nonzero
 // confidence is reason to retry, not evidence the learner is wrong.
 if(Number.isFinite(meta.confidence)&&meta.confidence>0&&meta.confidence<.5)
  return {outcome:'retry',reason:'uncertain-speech',kind:'transcript-match'};
 const result=matchSpeech(transcript,target);
 return {...result,outcome:result.matched?'hit':'miss'};
}
export function rewardVoiceDuel(save,b){
 const d=voiceDuel(b?.practice?.voiceDuel);
 if(!d||b.phase!=='ended'||b.enemyHp>0||b.hp<=0||b.correct<6||b.mode!=='voice-duel'||!['th','cn'].includes(b.world))return {points:0};
 const key='voice-duel:'+b.world+':'+d.id;
 if(save.earned.includes(key))return {points:0,firstClear:false};
 save.earned.push(key);save.points+=d.reward;
 return {points:d.reward,firstClear:true};
}
