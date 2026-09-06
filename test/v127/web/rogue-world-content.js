/* Authored extended sentences. Bilingual editorial drafts, NOT native-approved speech material. */
(function(root){
  'use strict';
  const sentences = [
    [3,'问路','请问，如果这班车不到夜市，我们应该在哪里换车呢？','ขอถามหน่อยค่ะ ถ้ารถคันนี้ไม่ไปตลาดกลางคืน เราควรเปลี่ยนรถที่ไหน'],
    [3,'住宿','我们订了两晚的房间，可以先寄存行李再去吃饭吗？','เราจองห้องพักไว้สองคืน ขอฝากกระเป๋าก่อนไปกินข้าวได้ไหม'],
    [3,'点餐','这道菜请不要放花生，因为我的朋友对花生过敏。','อาหารจานนี้ไม่ใส่ถั่วลิสงนะคะ เพราะเพื่อนของฉันแพ้ถั่วลิสง'],
    [3,'约定','如果明天下雨，我们就不去河边，改去博物馆吧。','ถ้าพรุ่งนี้ฝนตก เราไม่ไปริมแม่น้ำ แต่ไปพิพิธภัณฑ์แทนกันเถอะ'],
    [3,'购物','我想买这件衣服，不过可以先试一下大一号的吗？','ฉันอยากซื้อเสื้อตัวนี้ แต่ขอลองขนาดใหญ่ขึ้นหนึ่งไซซ์ก่อนได้ไหม'],
    [3,'交通','我们已经到车站了，你到了以后给我发个消息吧。','เราถึงสถานีแล้ว พอคุณมาถึง ส่งข้อความหาฉันด้วยนะ'],
    [3,'校园','今天的课比平时早半小时开始，别忘了带课本。','วันนี้เริ่มเรียนเร็วกว่าปกติครึ่งชั่วโมง อย่าลืมเอาหนังสือเรียนมาด้วย'],
    [3,'借物','这本书我还没有看完，可以下周一再还给你吗？','ฉันยังอ่านหนังสือเล่มนี้ไม่จบ ขอคืนให้คุณวันจันทร์หน้าได้ไหม'],
    [3,'请求','这里有点吵，你可以再说慢一点吗？我没听清最后一句。','ที่นี่เสียงดังนิดหน่อย คุณช่วยพูดช้าลงอีกหน่อยได้ไหม ฉันฟังประโยคสุดท้ายไม่ชัด'],
    [4,'工作','我已经把文件发给你了，如果有不清楚的地方，我们下午再讨论。','ฉันส่งเอกสารให้คุณแล้ว ถ้ามีส่วนไหนไม่ชัดเจน เราค่อยมาคุยกันตอนบ่าย'],
    [4,'安排','原定周五的会议改到周四了，请确认你是否有时间参加。','การประชุมที่เดิมกำหนดไว้วันศุกร์เปลี่ยนเป็นวันพฤหัสบดีแล้ว กรุณายืนยันว่าคุณสะดวกเข้าร่วมหรือไม่'],
    [4,'分工','你先整理调查结果，我来准备图片，最后我们一起检查。','คุณจัดผลสำรวจก่อน ส่วนฉันจะเตรียมรูปภาพ แล้วเราค่อยมาตรวจด้วยกันตอนท้าย'],
    [4,'生活','虽然搬家以后上班更远了，但是附近买东西很方便。','แม้ว่าย้ายบ้านแล้วที่ทำงานจะอยู่ไกลขึ้น แต่ซื้อของแถวบ้านสะดวกมาก'],
    [4,'沟通','我不是不愿意帮忙，只是今天必须先完成已经答应的事情。','ฉันไม่ได้ไม่อยากช่วย เพียงแต่วันนี้ต้องทำสิ่งที่รับปากไว้ให้เสร็จก่อน'],
    [4,'计划','我们先把最重要的部分做好，剩下的细节下次再调整。','เราทำส่วนที่สำคัญที่สุดให้ดีก่อน แล้วค่อยปรับรายละเอียดที่เหลือครั้งหน้า'],
    [4,'协商','如果这个时间对大家都不方便，我们可以再选一个日期。','ถ้าเวลานี้ไม่สะดวกสำหรับทุกคน เราสามารถเลือกวันใหม่ได้'],
    [4,'售后','我昨天买的耳机只有一边有声音，请问可以换一副吗？','หูฟังที่ฉันซื้อเมื่อวานมีเสียงแค่ข้างเดียว ขอเปลี่ยนเป็นอันใหม่ได้ไหม'],
    [4,'说明','因为路上发生了交通事故，我可能晚到十分钟，你们不用等我。','เพราะมีอุบัติเหตุบนถนน ฉันอาจไปถึงช้าสิบนาที ไม่ต้องรอฉันนะ'],
    [5,'观点','我同意你的目标，但我认为我们还需要比较其他几种方法。','ฉันเห็นด้วยกับเป้าหมายของคุณ แต่คิดว่าเรายังต้องเปรียบเทียบวิธีอื่นอีกหลายวิธี'],
    [5,'论证','这个方案的优点是成本低，缺点是需要更长的准备时间。','ข้อดีของแผนนี้คือมีต้นทุนต่ำ ส่วนข้อเสียคือต้องใช้เวลาเตรียมตัวนานขึ้น'],
    [5,'取舍','与其急着增加新功能，不如先解决用户最常遇到的问题。','แทนที่จะรีบเพิ่มฟังก์ชันใหม่ เราควรแก้ปัญหาที่ผู้ใช้พบบ่อยที่สุดก่อน'],
    [5,'条件','只有当双方都理解具体要求时，合作才能顺利进行。','ความร่วมมือจะดำเนินไปได้อย่างราบรื่นก็ต่อเมื่อทั้งสองฝ่ายเข้าใจข้อกำหนดที่ชัดเจน'],
    [5,'反思','这次失败并不意味着方向完全错误，也可能是执行过程出了问题。','ความล้มเหลวครั้งนี้ไม่ได้หมายความว่าแนวทางผิดทั้งหมด แต่อาจเกิดปัญหาในขั้นตอนการดำเนินงาน'],
    [5,'比较','这两种方法都有效，不过适合的人群和使用场景并不一样。','ทั้งสองวิธีนี้ได้ผล แต่เหมาะกับกลุ่มคนและสถานการณ์การใช้งานที่ต่างกัน'],
    [5,'建议','在作出最后决定之前，我建议先听听实际使用者的意见。','ก่อนตัดสินใจขั้นสุดท้าย ฉันแนะนำให้ฟังความคิดเห็นของผู้ใช้งานจริงก่อน'],
    [5,'责任','如果问题确实由我们造成，就应该说明原因并提出解决办法。','ถ้าปัญหาเกิดจากเราจริง เราก็ควรอธิบายสาเหตุและเสนอวิธีแก้ไข'],
    [5,'预期','我们不能保证所有人都满意，但可以清楚说明哪些地方还需要改进。','เราไม่สามารถรับประกันได้ว่าทุกคนจะพอใจ แต่สามารถอธิบายให้ชัดเจนว่าส่วนใดยังต้องปรับปรุง'],
    [6,'文化','同一句话在不同场合可能有不同的语气，不能只按字面意思理解。','ประโยคเดียวกันอาจมีน้ำเสียงต่างกันในแต่ละสถานการณ์ จึงไม่ควรเข้าใจจากความหมายตามตัวอักษรเพียงอย่างเดียว'],
    [6,'交流','了解一种文化不只是记住节日的名字，还要理解人们为什么重视它们。','การเข้าใจวัฒนธรรมหนึ่งไม่ได้หมายถึงแค่จำชื่อเทศกาล แต่ต้องเข้าใจด้วยว่าทำไมผู้คนจึงให้ความสำคัญกับเทศกาลเหล่านั้น'],
    [6,'语境','他没有直接拒绝，而是说需要再考虑一下，所以我们最好先确认他的意思。','เขาไม่ได้ปฏิเสธตรง ๆ แต่บอกว่าขอคิดดูก่อน ดังนั้นเราควรยืนยันความหมายของเขาก่อน'],
    [6,'表达','为了避免误会，你可以先说明自己的立场，再解释这样想的原因。','เพื่อหลีกเลี่ยงความเข้าใจผิด คุณสามารถบอกจุดยืนของตนก่อน แล้วค่อยอธิบายเหตุผลที่คิดเช่นนั้น'],
    [6,'研究','调查结果反映了这一组参与者的看法，但不一定代表所有人的意见。','ผลสำรวจสะท้อนมุมมองของผู้เข้าร่วมกลุ่มนี้ แต่อาจไม่ได้เป็นตัวแทนความคิดเห็นของทุกคน'],
    [6,'讨论','即使我们暂时无法达成一致，也可以先找出双方都能接受的部分。','แม้ตอนนี้เรายังตกลงกันไม่ได้ ก็สามารถหาส่วนที่ทั้งสองฝ่ายยอมรับได้ก่อน'],
    [6,'信息','在转发这条消息之前，最好核实来源，并确认它是否仍然符合现在的情况。','ก่อนส่งต่อข้อความนี้ ควรตรวจสอบแหล่งที่มาและยืนยันว่ายังตรงกับสถานการณ์ปัจจุบันหรือไม่'],
    [6,'成长','学习语言的目的不只是回答正确，而是在真实交流中理解别人并表达自己。','เป้าหมายของการเรียนภาษาไม่ใช่แค่ตอบให้ถูก แต่คือการเข้าใจผู้อื่นและสื่อสารความคิดของตนในการสนทนาจริง'],
    [6,'协作','当不同背景的人一起工作时，主动解释自己的习惯往往比猜测对方的想法更有效。','เมื่อคนที่มีภูมิหลังต่างกันทำงานร่วมกัน การอธิบายความเคยชินของตนมักได้ผลกว่าการเดาความคิดของอีกฝ่าย']
  ];
  const count={};
  root.HUILAISHI_ROGUE_SENTENCES=Object.freeze(sentences.map(([level,topic,zh,th])=>Object.freeze({id:`s${level}-${String(count[level]=(count[level]||0)+1).padStart(3,'0')}`,level,topic,zh,th,kind:'sentence',nativeReviewStatus:'pending',audioStatus:'not-recorded'})));
  let profiles=[],entries=[],monsters=[],poolCache=new Map();
  const TITLES=[['校园散页','หน้ากระดาษในโรงเรียน'],['莲火夜市','ตลาดบัวไฟ'],['风筝渡口','ท่าเรือว่าว'],['雷鸣工坊','โรงงานสายฟ้า'],['墨色书街','ถนนหนังสือหมึก'],['双铃舞台','เวทีระฆังคู่']];
  const RALLY_SCENES=[2,3,1,5,3,6,4,2,6,6];
  function configure(words,roster,zones){
    const extension=root.XULONG_EXPEDITION_THEMES;
    monsters=[...roster,...(extension?.monsters||[])];
    const pairs=new Set();
    entries=words.filter(w=>/^[lx][1-6]-\d{3}$/.test(w.id)&&w.level>=1&&w.level<=6&&w.zh&&w.th&&!w.reviewVariant).filter(w=>{const pair=`${w.zh.trim()}\0${w.th.trim()}`;if(pairs.has(pair))return false;pairs.add(pair);return true;});
    const primerIds=root.HUILAISHI_CAMPUS_CURRICULUM.lessons.flatMap(l=>l.ids);
    profiles=[{id:'primer',level:1,sceneChapter:1,zh:'新生序章',th:'บทนำเพื่อนใหม่',wordIds:primerIds,monsterIds:roster.filter(m=>(m.chapter===1&&!m.rally)||m.id==='rumor-moth').map(m=>m.id)}];
    for(let level=1;level<=6;level++)profiles.push({id:`story-${level}`,level,sceneChapter:level,zh:TITLES[level-1][0],th:TITLES[level-1][1],wordIds:entries.filter(w=>w.level===level).map(w=>w.id),monsterIds:roster.filter(m=>m.chapter===level&&!m.rally).map(m=>m.id)});
    zones.forEach((z,i)=>profiles.push({id:`rally-${i+1}`,level:z.level,sceneChapter:RALLY_SCENES[i],zh:z.zh,th:z.th,wordIds:entries.filter(w=>w.level===z.level).map(w=>w.id),monsterIds:roster.filter(m=>m.rallyZone===i+1).map(m=>m.id)}));
    for(const t of extension?.themes||[])profiles.push({...t,wordIds:entries.filter(w=>w.level===t.level).map(w=>w.id),monsterIds:t.roster});
    profiles=profiles.map(p=>Object.freeze({...p,wordIds:Object.freeze(p.wordIds),monsterIds:Object.freeze(p.monsterIds)}));
    poolCache=new Map();
    for(const p of profiles){const ids=new Set(p.wordIds);poolCache.set(`${p.id}:words`,Object.freeze(entries.filter(w=>ids.has(w.id))));poolCache.set(`${p.id}:sentences`,Object.freeze(root.HUILAISHI_ROGUE_SENTENCES.filter(w=>w.level===p.level)));}
  }
  function profile(id){return profiles.find(p=>p.id===id)||null;}
  function pool(id,kind){return poolCache.get(`${id}:${kind==='sentences'?'sentences':'words'}`)||[];}
  function sample(id,kind,seed){
    const a=[...pool(id,kind)];let rng=seed>>>0;
    for(let i=a.length-1;i>0;i--){rng=(Math.imul(rng,1664525)+1013904223)>>>0;const j=Math.floor(rng/4294967296*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    const zh=new Set(),th=new Set();return a.filter(w=>{if(zh.has(w.zh)||th.has(w.th))return false;zh.add(w.zh);th.add(w.th);return true;});
  }
  function metrics(){return {regions:profiles.length,wordPairs:entries.length,sentences:root.HUILAISHI_ROGUE_SENTENCES.length,monsterConfigurations:monsters.length,monsterArt:new Set(monsters.map(m=>m.art)).size,scenes:root.HUILAISHI_WORLD_ATLAS?.scenes?.length||0};}
  root.HUILAISHI_ROGUE_WORLD=Object.freeze({configure,profile,pool,sample,metrics,profiles:()=>profiles,monsters:()=>monsters,enemy:id=>monsters.find(m=>m.id===id),entries:()=>[...entries,...root.HUILAISHI_ROGUE_SENTENCES]});
})(globalThis);
