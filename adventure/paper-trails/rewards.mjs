export const REWARD_COPY={
 zh:{new:'新印记 · 已收入手记',best:'新纪录 · 手记已更新',revisit:'再次抵达 · 印记已收藏',words:'这次听懂了',again:'旅途未完，下次再试',saved:'六枚印记，拼起一封信',caption:[
  '你把听见的词，准确送到了守信者身边。',
  '先听懂，再出招。你在声音中找到了机会。',
  '陌生的声音，开始变成你熟悉的意思。',
  '散开的词连成一句话，两岸因此靠近。',
  '你听懂的方向，让小狗送对了每一份心意。',
  '你记住了一串声音，也点亮了今晚的灯。']},
 th:{new:'ตราใหม่ · บันทึกแล้ว',best:'สถิติใหม่ · บันทึกแล้ว',revisit:'กลับมาอีกครั้ง · มีตรานี้แล้ว',words:'คำที่ฟังเข้าใจในครั้งนี้',again:'การเดินทางยังไม่จบ ลองอีกครั้งนะ',saved:'หกตรา รวมเป็นจดหมายหนึ่งฉบับ',caption:[
  'คุณส่งคำที่ได้ยินถึงผู้พิทักษ์ได้อย่างถูกต้อง',
  'ฟังให้เข้าใจก่อนออกท่า คุณพบโอกาสจากเสียง',
  'เสียงที่ไม่คุ้นเคย เริ่มมีความหมายที่คุณรู้จัก',
  'คำเรียงเป็นประโยค เชื่อมสองฝั่งให้ใกล้กัน',
  'สิ่งที่คุณฟังเข้าใจ ช่วยให้น้องหมาส่งของได้ถูกชิ้น',
  'คุณจำลำดับเสียงได้ และจุดโคมให้คืนนี้สว่าง']}
};
export function rewardMarkup({run:r,won,stars,status,levels,save,locale,copy,esc,button,icon,vocabulary,words}){
 const text=v=>v[locale==='th'?1:0],l=levels[r.index],t=REWARD_COPY[locale],hero=locale==='th'?'girl-cast':'hero-cheer';
 const companion=['elephant-cheer','mantis','elephant-cheer','swallow','dog-catch','squirrel'][r.index];
 const primary=won?button(r.index===5?(Object.keys(save.levels).length===6?'finale':'home'):'next',r.index===5?(Object.keys(save.levels).length===6?copy.done:copy.home):copy.next+icon('arrow'),'primary'):button('restart',copy.replay+icon('replay'),'primary');
 return '<article class="sheet result-sheet keepsake '+(won?'earned':'unfinished')+'" role="dialog" aria-modal="true" aria-labelledby="result-title">'+
 '<div class="keepsake-art" aria-hidden="true"><img class="keepsake-scene" src="./assets/'+l.scene+'.webp"><div class="keepsake-light"></div><img class="keepsake-hero" src="./assets/'+hero+'.webp"><img class="keepsake-companion" src="./assets/'+companion+'.webp">'+(r.mode==='courier'?'':'<img class="keepsake-dog" src="./assets/dog-paw.webp">')+'<span class="postmark">PAPER TRAILS<br>0'+(r.index+1)+' / 06</span><div class="keepsake-caption">'+esc(won?t.caption[r.index]:t.again)+'</div></div>'+
 '<div class="keepsake-content"><span class="eyebrow">CHAPTER 0'+(r.index+1)+' · '+(won?'COMPLETE':'TRY AGAIN')+'</span><h2 id="result-title">'+(won?copy.won:copy.failed)+'</h2><p class="keepsake-chapter">'+esc(l[locale])+'</p>'+
 (won?'<div class="earned-stamp"><img src="./assets/seal.webp" alt=""><div><p class="reward-name">'+esc(text(l.reward))+'</p><span class="reward-status" data-reward-status="'+status+'">'+t[status]+'</span><div class="reward-stars" aria-label="'+stars+' / 3">'+Array.from({length:3},(_,i)=>'<i class="'+(i<stars?'lit':'')+'" style="--order:'+i+'">✦</i>').join('')+'</div></div></div>':'')+
 '<div class="result-stats"><span><strong>'+r.score+'</strong>'+copy.score+'</span><span><strong>'+r.maxCombo+'</strong>'+copy.combo+'</span><span><strong>'+Object.keys(save.levels).length+' / 6</strong>'+copy.collected+'</span></div>'+
 (words.length?'<p class="keepsake-words-title">'+t.words+'</p><div class="result-words">'+words.map(vocabulary).join('')+'</div>':'')+
 '<div class="seal-collection" aria-label="'+esc(t.saved)+'">'+levels.map((level,i)=>'<span class="'+(save.levels[i]?'collected ':'')+(i===r.index&&won?'just-earned':'')+'" title="'+esc(text(level.reward))+'">'+(save.levels[i]?'✦':'·')+'</span>').join('')+'</div>'+
 '<div class="actions">'+button('home',copy.home)+(won?button('restart',copy.replay):'')+primary+'</div></div></article>';
}
