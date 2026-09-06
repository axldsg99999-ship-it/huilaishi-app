/* V127: a small, authored story. Story checkpoints never award combat power. */
(function (root) {
  'use strict';
  const words = Object.freeze({
    water:{id:'l1-034',zh:'水',th:'น้ำ',py:'shuǐ',icon:'water'},
    rice:{id:'l1-071',zh:'饭',th:'ข้าว',py:'fàn',icon:'rice'},
    bag:{id:'l1-037',zh:'包',th:'กระเป๋า',py:'bāo',icon:'bag'},
    book:{id:'l1-201',zh:'书',th:'หนังสือ',py:'shū',icon:'book'}
  });
  const scenes = {
    'zh-th':[
      {name:'莲潮港',subtitle:'潮水送来一封没有地址的信。',art:'assets/game/th-port-market-v125.webp',detail:'摊主把一瓶水推到你面前。纸船上的字，似乎有了声音。'},
      {name:'渡口的蓝信箱',subtitle:'过河之前，找回她留下的行李。',art:'assets/game/th-river-dock-v125.webp',detail:'船已经靠岸。旧信箱里有半张字迹模糊的留言，和你们约定的蓝色。'},
      {name:'染坊的晚风',subtitle:'那些没说完的话，正在重新显影。',art:'assets/game/th-dye-yard-v125.webp',detail:'风穿过晾晒的布。书页在蓝色的影子里翻动，有人曾在这里等你。'}
    ],
    'th-zh':[
      {name:'ตรอกหนังสือ',subtitle:'สายน้ำพาจดหมายที่ไม่มีที่อยู่มาให้',art:'assets/game/cn-book-lane-v125.webp',detail:'คนขายส่งน้ำให้คุณ ข้อความบนเรือกระดาษเริ่มมีเสียงขึ้นมา'},
      {name:'โรงพิมพ์ริมคลอง',subtitle:'ตามหากระเป๋าที่เขาฝากไว้',art:'assets/game/cn-print-workshop-v125.webp',detail:'ในตู้ไปรษณีย์มีข้อความจาง ๆ อยู่ครึ่งแผ่น พร้อมสีฟ้าที่คุณทั้งคู่จำได้'},
      {name:'หอนาฬิกายามเย็น',subtitle:'ถ้อยคำที่ค้างไว้เริ่มกลับมาชัดเจน',art:'assets/game/cn-watch-rooftop-v125.webp',detail:'ลมพลิกหน้าหนังสือบนหอนาฬิกา ดูเหมือนมีใครเคยรอคุณอยู่ที่นี่'}
    ]
  };
  const tasks = [
    {id:'first-sound',scene:0,type:'listen',word:'water',options:['bag','water','book'],title:['听见第一声','เสียงแรกที่ได้ยิน'],brief:['摊主说了一个词。听一听，把对应的物品递给他。','ฟังคำที่คนขายพูด แล้วเลือกสิ่งของให้ตรงกับเสียง']},
    {id:'market-label',scene:0,type:'read',word:'rice',options:['rice','book','water'],title:['读懂小纸签','อ่านป้ายกระดาษ'],brief:['纸袋的标签写着什么？帮摊主找到对应的东西。','บนถุงเขียนว่าอะไร ช่วยคนขายเลือกของให้ถูกต้อง']},
    {id:'ferry-parcel',scene:1,type:'listen',word:'bag',options:['water','book','bag'],title:['渡口的失物','ของที่ฝากไว้'],brief:['船夫记得她留下的东西。听清楚，找回它。','คนเรือจำของที่เขาฝากไว้ได้ ฟังแล้วตามหาของชิ้นนั้น']},
    {id:'restore-ink',scene:1,type:'write',word:'water',title:['修复褪色的字','เติมตัวอักษรที่จางหาย'],brief:['照着留言临摹一次「น้ำ」。这是自由临摹，由你对照，不自动评分。','ลองเขียน 水 ตามลำดับขีด นี่คือการฝึกตามแบบ ยังไม่ใช่การทดสอบความจำ']},
    {id:'book-message',scene:2,type:'read',word:'book',options:['water','bag','book'],title:['藏在书里的话','ข้อความในหนังสือ'],brief:['最后一条线索在这个词指向的物品里。','เบาะแสสุดท้ายซ่อนอยู่ในสิ่งของที่ตรงกับคำนี้']},
    {id:'reply',scene:2,type:'letter',title:['给她一封回信','เขียนจดหมายกลับหาเขา'],brief:['「小艾，如果这张声页找到你，就沿着河岸走。我也在学你的语言。」','“CHANINDA ถ้าหน้ากระดาษนี้ไปถึงเธอ ให้เดินตามแม่น้ำ ฉันก็กำลังเรียนภาษาของเธออยู่”']}
  ];
  const key = dir => 'huilaishi-world-journey-v1-'+dir;
  const validDir = dir => dir === 'th-zh' ? dir : 'zh-th';
  function normalize(raw,dir) {
    dir=validDir(dir); const state={version:1,direction:dir,completed:{},pending:[],assisted:[],failed:[],reply:null};
    if (!raw || raw.direction!==dir) return state;
    for (const task of tasks) {
      const item=raw.completed?.[task.id];
      if (item && Number.isFinite(item.at) && ['recall','assisted','traced','self-review','alternate','story'].includes(item.evidence)) state.completed[task.id]={at:item.at,evidence:item.evidence};
    }
    if (['wait','follow'].includes(raw.reply)) state.reply=raw.reply;
    state.assisted=tasks.filter(t=>Array.isArray(raw.assisted)&&raw.assisted.includes(t.id)).map(t=>t.id);
    state.failed=tasks.filter(t=>Array.isArray(raw.failed)&&raw.failed.includes(t.id)).map(t=>t.id);
    state.pending=(Array.isArray(raw.pending)?raw.pending:[]).filter(e=>tasks.some(t=>t.id===e.task && words[t.word]?.id===e.word) && typeof e.correct==='boolean' && e.id===`world:${dir}:${e.task}:first`).slice(0,tasks.length);
    return state;
  }
  function next(state) { return tasks.find(t=>!state.completed[t.id]) || null; }
  function complete(state,taskId,evidence,now=Date.now()) {
    const s=normalize(state,state.direction), task=tasks.find(t=>t.id===taskId);
    if(!task || s.completed[taskId] || next(s)?.id!==taskId) return s;
    const allowed=task.type==='letter'?['story']:task.type==='write'?['traced','self-review','alternate']:['recall','assisted'];
    if(!allowed.includes(evidence)) return s;
    if(evidence==='recall' && (s.assisted.includes(taskId)||s.failed.includes(taskId))) evidence='assisted';
    s.completed[taskId]={at:now,evidence};
    if(evidence==='recall') s.pending.push({id:`world:${s.direction}:${task.id}:first`,task:task.id,word:words[task.word].id,correct:true});
    else if(['read','listen'].includes(task.type)&&s.failed.includes(taskId)) s.pending.push({id:`world:${s.direction}:${task.id}:first`,task:task.id,word:words[task.word].id,correct:false});
    return s;
  }
  function acknowledge(state,id) { const s=normalize(state,state.direction);s.pending=s.pending.filter(e=>e.id!==id);return s; }
  function stats(state) { const a=Object.values(state.completed);return {steps:a.length,total:tasks.length,recall:a.filter(x=>x.evidence==='recall').length,assisted:a.filter(x=>x.evidence==='assisted').length,writing:a.filter(x=>['traced','self-review'].includes(x.evidence)).length}; }
  function sample(points,count=32) {
    if(!Array.isArray(points)||points.length<2 || points.some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)))return [];
    const lengths=[0]; for(let i=1;i<points.length;i++) lengths.push(lengths[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
    const total=lengths[lengths.length-1];if(total<1)return [];
    return Array.from({length:count},(_,i)=>{const d=total*i/(count-1);let j=1;while(j<lengths.length-1&&lengths[j]<d)j++;const f=(d-lengths[j-1])/(lengths[j]-lengths[j-1]||1);return points[j].map((n,k)=>points[j-1][k]+(n-points[j-1][k])*f);});
  }
  // Ordered, length-normalized comparison: a dot, reverse stroke or scribble cannot pass.
  function matchStroke(points,median) {
    const a=sample(points),b=sample(median);if(!a.length||!b.length)return false;
    const dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
    const len=p=>p.slice(1).reduce((n,v,i)=>n+dist(v,p[i]),0);
    const ratio=len(points)/len(median);
    return ratio>.65 && ratio<1.55 && dist(a[0],b[0])<100 && dist(a[a.length-1],b[b.length-1])<110 && a.reduce((n,p,i)=>n+dist(p,b[i]),0)/a.length<65;
  }
  root.XULONG_WORLD=Object.freeze({words,scenes,tasks,key,normalize,next,complete,acknowledge,stats,matchStroke,sample});
})(globalThis);
