import {ALL_LESSONS} from './content.mjs?v=0.3.1';
import {shuffled} from './core.mjs?v=0.3.1';

// Authored intentions, not generated near-synonyms. The response is an existing
// curriculum expression. Reading a situation never earns listening credit.
export const REPLY_SCENES = [
 ['a1-0','早上第一次见到摊主，你先向他打个招呼。','ตอนเช้าคุณเพิ่งเจอแม่ค้าเป็นครั้งแรกวันนี้ ทักทายเธอก่อน'],
 ['a1-1','摊主帮你捡起掉落的钱包。向他表达感谢。','คนขายช่วยเก็บกระเป๋าเงินที่คุณทำตก กล่าวขอบคุณเขา'],
 ['a1-2','你不小心碰倒了旁边的菜篮，想先向摊主道歉。','คุณเผลอชนตะกร้าผักล้ม อยากขอโทษคนขายก่อน'],
 ['a1-3','伙伴迟到后向你道歉。你没有介意，想让他放心。','เพื่อนขอโทษที่มาสาย คุณไม่ได้ถือโทษ อยากบอกให้เขาสบายใจ'],
 ['a1-4','逛完市场，你要和刚认识的摊主道别，期待下次再见。','คุณเดินตลาดเสร็จแล้ว จะบอกลาคนขายที่เพิ่งรู้จักและหวังว่าจะได้พบกันอีก'],
 ['a1-5','你想买一篮水果，但篮子上没有标价。先问价格。','คุณอยากซื้อตะกร้าผลไม้ แต่ไม่มีป้ายราคา ถามราคาก่อน'],
 ['a1-6','摊主说得太快了，你想请他放慢一点。','คนขายพูดเร็วเกินไป คุณอยากขอให้เขาพูดช้าลงหน่อย'],
 ['a1-7','摊主问了一个问题，但你没有明白，先如实告诉他。','คนขายถามคำถามหนึ่ง แต่คุณไม่เข้าใจ บอกเขาตามตรงก่อน'],
 ['a3-0','寄信处在左边，停车场在右边。有人问去寄信处的方向，你怎么指路？','ที่ส่งจดหมายอยู่ซ้าย ลานจอดรถอยู่ขวา มีคนถามทางไปส่งจดหมาย จะบอกทางอย่างไร?'],
 ['a3-1','收信处在桥那头的右手边。旅人站在你这一侧，怎么告诉他路线？','ที่รับจดหมายอยู่ทางขวาหลังข้ามสะพาน คนเดินทางอยู่ฝั่งเดียวกับคุณ จะบอกทางอย่างไร?'],
 ['a3-2','车站紧挨着书店。乘客问车站的位置，该怎么回答？','สถานีอยู่ข้างร้านหนังสือ ผู้โดยสารถามว่าสถานีอยู่ไหน จะตอบอย่างไร?'],
 ['a3-3','信要暂时放在桌上。快递员问：“这封信放在哪里？”','ต้องวางจดหมายไว้บนโต๊ะชั่วคราว คนส่งถามว่า “ให้วางจดหมายไว้ที่ไหน?”'],
 ['a3-4','你想去码头，却不确定眼前这条路能不能到。向路人怎么问？','คุณจะไปท่าเรือ แต่ไม่แน่ใจว่าถนนนี้ไปถึงไหม จะถามคนแถวนั้นอย่างไร?'],
 ['a3-5','你和伙伴决定在门口等朋友。给朋友捎句话，告诉他你们在哪等。','คุณกับเพื่อนจะรออีกคนที่หน้าประตู ฝากบอกเขาว่าพวกคุณรออยู่ที่ไหน'],
 ['a3-6','屋里太闷了。你想请伙伴先打开窗户，再做别的事。','ในห้องอับ คุณอยากขอให้เพื่อนเปิดหน้าต่างก่อนทำอย่างอื่น'],
 ['a3-7','伙伴一会儿要回去，外面可能下雨。提醒他带上伞。','เพื่อนกำลังจะกลับและฝนอาจตก เตือนเขาให้เอาร่มกลับไปด้วย'],
 ['a6-0','你先前误以为他生气，刚刚才知道他只是太累。向伙伴说明这个误会。','ก่อนหน้านี้คุณคิดว่าเขาโกรธ แต่เพิ่งรู้ว่าเขาแค่เหนื่อยมาก อธิบายความเข้าใจผิดนี้ให้เพื่อนฟัง'],
 ['a6-1','你现在走不开，但对方愿意稍等的话，你能带他去她常去的茶铺。','ตอนนี้คุณยังไปไม่ได้ แต่ถ้าอีกฝ่ายรอสักครู่ คุณพาเขาไปร้านชาที่เธอไปประจำได้'],
 ['a6-2','同伴弄错了码头。请他转告船夫：去桥东边，不是西边。','เพื่อนจำท่าเรือผิด ขอให้เขาบอกคนขับเรือว่าไปฝั่งตะวันออกของสะพาน ไม่ใช่ฝั่งตะวันตก'],
 ['a6-3','伙伴话没听完就急着猜。建议他先听完整句话。','เพื่อนรีบเดาทั้งที่ยังฟังไม่จบ แนะนำให้เขาฟังทั้งประโยคก่อน'],
 ['a6-4','收信人已经去了远方。你承诺，不管她走到哪里，都把信亲手交给她。','ผู้รับเดินทางไปไกลแล้ว คุณสัญญาว่าไม่ว่าเธออยู่ที่ไหน จะส่งจดหมายถึงมือเธอ'],
 ['a6-5','他边说话边一直望着门口。你猜他正在等一个重要的人，向伙伴描述这个观察。','เขาพูดไปมองประตูไปตลอด คุณคิดว่าเขากำลังรอคนสำคัญ เล่าสิ่งที่สังเกตให้เพื่อนฟัง'],
].map(([id,zh,th])=>({id,zh,th}));

export function makeReply(queue,index,rng=Math.random) {
 if(!queue?.length)return null;
 for(let offset=0;offset<queue.length;offset++){
  const unit=queue[((index+offset)%queue.length+queue.length)%queue.length];
  const scene=REPLY_SCENES.find(s=>s.id===unit.id);
  if(!scene)continue;
  const alternatives=shuffled(ALL_LESSONS.filter(u=>u.chapter===unit.chapter&&u.id!==unit.id),rng).slice(0,2);
  if(alternatives.length!==2)return null;
  return {scene,unit,choices:shuffled([unit,...alternatives],rng),selected:null,committed:false};
 }
 return null;
}
export function selectReply(reply,id) {
 if(!reply||reply.committed||!reply.choices.some(u=>u.id===id))return false;
 reply.selected=id;return true;
}
// Read-time allowance, not a measured proficiency score. Longer authored
// choices should not receive the same countdown as three short responses.
export function replyReadAllowance(reply,world) {
 const key=world==='th'?'th':'zh';
 const length=(reply?.choices||[]).reduce((n,u)=>n+Array.from(u[key]||'').length,0);
 return Math.max(12,Math.min(32,Math.ceil(length/(world==='th'?10:5))+4));
}
export function submitReply(reply) {
 if(!reply||reply.committed||!reply.choices.some(u=>u.id===reply.selected))return {kind:'ignored'};
 reply.committed=true;return {kind:reply.selected===reply.unit.id?'correct':'wrong'};
}
