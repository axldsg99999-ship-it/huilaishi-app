/* V125: additive themed expeditions; old routes and hero statistics stay intact.
   New Thai editorial copy awaits native-language review. No assets load until a theme is opened. */
(function(root){
"use strict";
const monsters=[
  {
    "id": "thai-orchid-mantis",
    "direction": "zh-th",
    "elite": true,
    "mechanic": "mirror",
    "zh": "折扇兰螳",
    "th": "ตั๊กแตนกล้วยไม้พัดกระดาษ",
    "storyZh": "夜市小戏班的学徒，最擅长把你的上一次招式学走。",
    "storyTh": "นักแสดงฝึกหัดในตลาด ชอบเลียนแบบท่าที่คุณเพิ่งใช้",
    "art": "./assets/game/thai-orchid-mantis-v125-idle.webp",
    "frames": {
      "idle": "./assets/game/thai-orchid-mantis-v125-idle.webp",
      "windup": "./assets/game/thai-orchid-mantis-v125-windup.webp",
      "strike": "./assets/game/thai-orchid-mantis-v125-strike.webp",
      "hit": "./assets/game/thai-orchid-mantis-v125-hit.webp"
    }
  },
  {
    "id": "thai-tide-ray",
    "direction": "zh-th",
    "boss": true,
    "mechanic": "satellites",
    "zh": "河灯莲鳐",
    "th": "กระเบนโคมบัว",
    "storyZh": "守着失散声页的河灯领航员，带着两盏莲灯一起巡夜。",
    "storyTh": "ผู้นำทางโคมริมน้ำ คอยเฝ้าหน้ากระดาษพร้อมโคมบัวสองดวง",
    "art": "./assets/game/thai-tide-ray-v125-idle.webp",
    "frames": {
      "idle": "./assets/game/thai-tide-ray-v125-idle.webp",
      "windup": "./assets/game/thai-tide-ray-v125-windup.webp",
      "strike": "./assets/game/thai-tide-ray-v125-strike.webp",
      "hit": "./assets/game/thai-tide-ray-v125-hit.webp"
    }
  },
  {
    "id": "chinese-ink-tortoise",
    "direction": "th-zh",
    "elite": true,
    "mechanic": "seal",
    "zh": "书脊砚甲龟",
    "th": "เต่าเกราะสันหนังสือ",
    "storyZh": "书摊的慢性子管理员，连续读懂两次，才肯翻开自己的书壳。",
    "storyTh": "ผู้ดูแลร้านหนังสือใจเย็น ยอมเปิดกระดองเมื่อตอบถูกติดกันสองครั้ง",
    "art": "./assets/game/chinese-ink-tortoise-v125-idle.webp",
    "frames": {
      "idle": "./assets/game/chinese-ink-tortoise-v125-idle.webp",
      "windup": "./assets/game/chinese-ink-tortoise-v125-windup.webp",
      "strike": "./assets/game/chinese-ink-tortoise-v125-strike.webp",
      "hit": "./assets/game/chinese-ink-tortoise-v125-hit.webp"
    }
  },
  {
    "id": "chinese-bell-lion",
    "direction": "th-zh",
    "boss": true,
    "mechanic": "drum",
    "zh": "墨巷铜铃狮",
    "th": "สิงโตกระดิ่งตรอกหมึก",
    "storyZh": "书街闭店前的巡巷搭档，总会先敲出节拍，再跳下石阶。",
    "storyTh": "ผู้เดินตรวจถนนหนังสือ เคาะจังหวะก่อนกระโดดลงจากบันได",
    "art": "./assets/game/chinese-bell-lion-v125-idle.webp",
    "frames": {
      "idle": "./assets/game/chinese-bell-lion-v125-idle.webp",
      "windup": "./assets/game/chinese-bell-lion-v125-windup.webp",
      "strike": "./assets/game/chinese-bell-lion-v125-strike.webp",
      "hit": "./assets/game/chinese-bell-lion-v125-hit.webp"
    }
  }
];
const themes=[
  {
    "id": "theme-th-nightmarket",
    "direction": "zh-th",
    "level": 1,
    "sceneChapter": 2,
    "scenes": ["./assets/game/th-port-market-v125.webp", "./assets/game/th-dye-yard-v125.webp", "./assets/game/th-river-dock-v125.webp"],
    "zh": "莲潮港 · 河灯夜市",
    "th": "ท่าเรือคลื่นบัว · ตลาดโคมริมน้ำ",
    "roster": [
      "wok-crab",
      "tuk-gecko",
      "umbrella-hornbill",
      "market-elephant",
      "thai-orchid-mantis",
      "thai-tide-ray"
    ],
    "elite": "thai-orchid-mantis",
    "boss": "thai-tide-ray"
  },
  {
    "id": "theme-cn-bookstreet",
    "direction": "th-zh",
    "level": 1,
    "sceneChapter": 5,
    "scenes": ["./assets/game/cn-book-lane-v125.webp", "./assets/game/cn-print-workshop-v125.webp", "./assets/game/cn-watch-rooftop-v125.webp"],
    "zh": "砚桥城 · 墨巷书街",
    "th": "เมืองสะพานหมึก · ถนนหนังสือ",
    "roster": [
      "rumor-moth",
      "logic-pangolin",
      "ink-peacock",
      "debate-hornbill",
      "chinese-ink-tortoise",
      "chinese-bell-lion"
    ],
    "elite": "chinese-ink-tortoise",
    "boss": "chinese-bell-lion"
  }
];
const outfits={
  "chinese": {
    "zh": "小艾 · 河畔采风装",
    "th": "小艾 · ชุดสำรวจริมน้ำ",
    "profile": "theme-th-nightmarket",
    "frames": {
      "idle": "./assets/game/xiaoai-explorer-v125-idle.webp",
      "run": "./assets/game/xiaoai-explorer-v125-run.webp",
      "windup": "./assets/game/xiaoai-explorer-v125-windup.webp",
      "strike": "./assets/game/xiaoai-explorer-v125-strike.webp",
      "recover": "./assets/game/xiaoai-explorer-v125-recover.webp",
      "hit": "./assets/game/xiaoai-explorer-v125-hit.webp",
      "dodge": "./assets/game/xiaoai-explorer-v125-dodge.webp",
      "victory": "./assets/game/xiaoai-explorer-v125-victory.webp"
    }
  },
  "thai": {
    "zh": "CHANINDA · 书街社团装",
    "th": "CHANINDA · ชุดชมรมถนนหนังสือ",
    "profile": "theme-cn-bookstreet",
    "frames": {
      "idle": "./assets/game/chaninda-varsity-v125-idle.webp",
      "run": "./assets/game/chaninda-varsity-v125-run.webp",
      "windup": "./assets/game/chaninda-varsity-v125-windup.webp",
      "strike": "./assets/game/chaninda-varsity-v125-strike.webp",
      "recover": "./assets/game/chaninda-varsity-v125-recover.webp",
      "hit": "./assets/game/chaninda-varsity-v125-hit.webp",
      "dodge": "./assets/game/chaninda-varsity-v125-dodge.webp",
      "victory": "./assets/game/chaninda-varsity-v125-victory.webp"
    }
  }
};

const lore={
  "thai-orchid-mantis": {
    "titleZh": "借招客 · 兰刃",
    "titleTh": "นักลอกท่า · คมกล้วยไม้",
    "storyZh": "兰刃替夜市戏班保管着 CHANINDA 的第一段留言。它把每一句话、每一个动作都照搬得分毫不差，却不知道恋人的话为什么不能只靠模仿。",
    "storyTh": "คมกล้วยไม้เก็บข้อความแรกของ CHANINDA ไว้กับคณะละครตลาด มันเลียนแบบทุกคำทุกท่าได้ แต่ยังไม่เข้าใจว่าคำพูดของคนรักไม่ใช่แค่การทำตาม",
    "clearZh": "兰刃收起折扇：“原来，换一种说法也能抵达同一个人。”它归还了那张留言纸。",
    "clearTh": "คมกล้วยไม้เก็บพัดแล้วคืนกระดาษข้อความ วิธีพูดต่างกันก็ส่งความหมายถึงคนคนเดียวกันได้"
  },
  "thai-tide-ray": {
    "titleZh": "守潮者 · 末灯",
    "titleTh": "ผู้เฝ้ากระแสน้ำ · โคมสุดท้าย",
    "storyZh": "末灯驮着莲潮港所有未送达的声音。失语风暴来临后，它用两盏纸灯封住航道；其中一盏，藏着 CHANINDA 留给小艾的方向。它不愿再让任何声音沉没。",
    "storyTh": "โคมสุดท้ายแบกเสียงที่ยังส่งไม่ถึงจากท่าเรือ หลังพายุไร้ภาษา มันใช้โคมกระดาษสองดวงปิดทางน้ำ หนึ่งในนั้นซ่อนคำบอกทางที่ CHANINDA ฝากถึง小艾 มันไม่อยากเสียเสียงใดไปอีก",
    "clearZh": "末灯松开了航道。纸灯没有熄灭，而是载着两人的留言驶向另一座城。",
    "clearTh": "โคมสุดท้ายเปิดทางน้ำ โคมไม่ได้ดับ แต่พาข้อความของทั้งคู่ลอยไปยังอีกเมือง"
  },
  "chinese-ink-tortoise": {
    "titleZh": "缄页官 · 砚守",
    "titleTh": "ผู้รักษาหน้าหนังสือ · ยามหมึก",
    "storyZh": "砚守把失踪者的名字锁进书壳，防止它们被“静白”抹去。它发现 CHANINDA 正在寻找小艾，但只有连续读懂两道书页的人，才能证明自己不是一段会消散的回声。",
    "storyTh": "ยามหมึกเก็บชื่อผู้สูญหายไว้ในกระดอง ป้องกันความเงียบสีขาวลบชื่อทิ้ง มันรู้ว่า CHANINDA ตามหา小艾 แต่ต้องอ่านเข้าใจสองครั้งติดกันจึงเชื่อว่าเธอไม่ใช่เสียงก้องที่กำลังหายไป",
    "clearZh": "书壳打开了。小艾的名字还在，旁边多了一行字：“他也正在找你。”",
    "clearTh": "กระดองหนังสือเปิด ชื่อ小艾ยังอยู่ และมีข้อความใหม่ว่า เขาก็กำลังตามหาเธอ"
  },
  "chinese-bell-lion": {
    "titleZh": "终巡者 · 铜律",
    "titleTh": "ผู้ตรวจตราสุดท้าย · จังหวะทองแดง",
    "storyZh": "铜律曾用三拍铃声为砚桥城报时。如今，“静白”正在吞掉最后一拍。它把所有靠近钟楼的人都当成偷走声音的来客，只有听清预警、守住节拍，才能让它停下来。",
    "storyTh": "จังหวะทองแดงเคยบอกเวลาด้วยกระดิ่งสามจังหวะ แต่ความเงียบสีขาวกำลังกลืนจังหวะสุดท้าย มันคิดว่าทุกคนที่เข้าใกล้หอนาฬิกาจะขโมยเสียง ต้องอ่านสัญญาณและตั้งรับตามจังหวะเพื่อให้มันหยุด",
    "clearZh": "铜律放下前爪。钟楼响起短短一声，像是另一边的小艾正在回应。",
    "clearTh": "จังหวะทองแดงลดอุ้งเท้าลง หอนาฬิกาดังสั้น ๆ ราวกับ小艾กำลังตอบจากอีกฝั่ง"
  }
};
for(const m of monsters)Object.assign(m,lore[m.id]);
const world={
  "titleZh": "折声界 · 双界恋歌",
  "titleTh": "โลกเสียงพับ · บทเพลงรักสองโลก",
  "premiseZh": "小艾和 CHANINDA 是一对恋人。一场失语风暴将他们分开：小艾坠入以泰语运转的莲潮港，CHANINDA 醒在以中文运转的砚桥城。这里，理解一种语言，就能把它变成力量。",
  "premiseTh": "小艾กับ CHANINDA เป็นคู่รัก พายุไร้ภาษาแยกทั้งคู่: 小艾ตกสู่ท่าเรือบัวที่ใช้ภาษาไทย ส่วน CHANINDA ตื่นในเมืองสะพานหมึกที่ใช้ภาษาจีน ที่นี่ ความเข้าใจภาษาเปลี่ยนเป็นพลังได้",
  "goalZh": "沿着彼此留下的声页，学会从一个词到一段完整心意的言术。成为双界最强的言术师，才有力量同时打开重逢之门。",
  "goalTh": "ตามหน้ากระดาษเสียงที่ฝากให้กัน ฝึกวิชาถ้อยคำจากคำเดียวสู่ความรู้สึกเต็มประโยค จนเป็นผู้ใช้ถ้อยคำที่แข็งแกร่งที่สุดของสองโลก และเปิดประตูพบกันพร้อมกัน",
  "ruleZh": "战斗是读懂言术、解除失语封锁的试炼；守城者不是邪神。真实中泰语按日常含义学习，言术与世界均为虚构，不采用真实宗教经咒。",
  "ruleTh": "การต่อสู้คือบททดสอบความเข้าใจเพื่อคลายการปิดกั้นภาษา ผู้เฝ้าเมืองไม่ใช่เทพร้าย ภาษาจีนและไทยใช้ความหมายจริง ส่วนวิชาและโลกเป็นเรื่องสมมติ ไม่ใช้บทสวดศาสนา",
  "antagonistZh": "“静白”并非神明，而是一道失控的修补程序。它以为抹去所有不同的语言，就能抹去误解；也因此抹去了人与人之间的联系。",
  "antagonistTh": "ความเงียบสีขาวไม่ใช่เทพ แต่เป็นระบบซ่อมแซมที่เสียการควบคุม มันคิดว่าลบภาษาที่ต่างกันแล้วจะลบความเข้าใจผิดได้ แต่กลับลบสายสัมพันธ์ไปด้วย"
};
function theme(id){return themes.find(t=>t.id===id)||null;}
function hero(base,profile,classic=false){
 const outfit=outfits[base?.id];
 return outfit&&outfit.profile===profile&&!classic?{...base,frames:outfit.frames,art:outfit.frames.idle,outfit}:base;
}
function initial(id){
 const m=monsters.find(m=>m.id===id);
 return m?{kind:m.mechanic,lastStyle:"",chain:0,stagger:0,guards:m.mechanic==="satellites"?2:0,target:"body"}:null;
}
function intent(e){
 const s=e?.special;if(!s)return null;
 if(s.stagger>0)return {kind:"mechanic",weak:"rush",damage:0,cue:"open"};
 if(s.kind==="mirror")return {kind:"mechanic",weak:s.lastStyle==="rush"?"pierce":"rush",damage:8,cue:"mirror",lastStyle:s.lastStyle};
 if(s.kind==="seal")return {kind:"mechanic",weak:"pierce",damage:8,cue:"seal",chain:s.chain};
 if(s.kind==="satellites")return {kind:"mechanic",weak:s.guards?"pierce":"rush",damage:8+s.guards*3,cue:"satellites",guards:s.guards};
 const beat=e.turn%(e.phase===2?2:3);
 return {kind:"mechanic",weak:beat===(e.phase===2?1:2)?"guard":"rush",damage:beat===(e.phase===2?1:2)?20:7,cue:"drum",beat:beat+1,total:e.phase===2?2:3};
}
function strike(e,correct,style,damage){
 const s=e.special,notes=[];if(!s)return {damage,notes};
 if(!correct){s.chain=0;if(s.stagger>0)s.stagger--;return {damage:0,notes};}
 if(s.stagger>0){s.stagger--;return {damage:damage+12,notes:["open-hit"]};}
 if(s.kind==="mirror"){
  const repeat=s.lastStyle===style;damage=repeat?Math.ceil(damage*.45):damage+10;
  notes.push(repeat?"mirrored":"outsmarted");s.lastStyle=style;
 }else if(s.kind==="seal"){
  s.chain++;
  if(s.chain>=2){s.chain=0;s.stagger=2;damage+=10;notes.push("seal-open");}
  else {damage=Math.ceil(damage*.35);notes.push("seal-charge");}
 }else if(s.kind==="satellites"&&s.guards){
  if(s.target==="guards"){s.guards--;damage=0;notes.push("guard-cleared");if(!s.guards)s.target="body";}
  else {damage=Math.ceil(damage*.35);notes.push("body-protected");}
 }
 return {damage,notes};
}
function retaliation(e,incoming,correct,style){
 const s=e.special;if(!s)return null;
 if(incoming.cue==="open")return 0;
 if(s.kind==="drum"&&incoming.weak==="guard"&&correct&&style==="guard"){
  s.stagger=1;return 0;
 }
 if(!correct)return incoming.damage+7;
 if(s.kind==="drum"&&incoming.weak==="guard")return incoming.damage;
 if(s.kind==="mirror"&&incoming.lastStyle===style)return 6;
 return s.kind==="satellites"?2+s.guards*2:2;
}
function phase(e){if(e.special?.kind==="satellites"){e.special.guards=2;e.special.target="body";}}
function valid(e){
 const expected=initial(e.id),s=e.special;
 if(!expected)return s==null;
 return !!s&&s.kind===expected.kind&&["","rush","pierce","guard"].includes(s.lastStyle)&&
 Number.isInteger(s.chain)&&s.chain>=0&&s.chain<=1&&Number.isInteger(s.stagger)&&s.stagger>=0&&s.stagger<=2&&
 Number.isInteger(s.guards)&&s.guards>=0&&s.guards<=2&&["body","guards"].includes(s.target)&&
 (s.kind==="satellites"||(s.guards===0&&s.target==="body"));
}
root.XULONG_EXPEDITION_THEMES=Object.freeze({monsters,themes,outfits,world,theme,hero,initial,intent,strike,retaliation,phase,valid});
})(globalThis);
