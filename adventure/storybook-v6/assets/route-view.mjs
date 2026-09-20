import {NODES,POWERS,nodeById,availableNodes} from './expedition.mjs';
const symbols={start:'mail',battle:'attack',elite:'break',rest:'tea',event:'book',shop:'coin',boss:'leaf'};
const types={start:'出发',battle:'切磋',elite:'精英',rest:'休息',event:'奇遇',shop:'小铺',boss:'守关'};
export function routeMapHTML(run,selected,{btn,icon,esc}) {
  const ready=availableNodes(run),choices=run.active?[run.active]:ready;
  const target=nodeById(choices.includes(selected)?selected:choices[0])||nodeById(run.path.at(-1));
  const places=choices.map((id,i)=>({n:nodeById(id),x:choices.length===1?65:i?78:30,y:choices.length===1?37:i?39:34}));
  const lines=places.filter(({n})=>n.id===target.id).map(({x,y})=>'<path class="chosen" d="M 520 650 Q '+(x*10)+' 630 '+(x*10)+' '+(y*10+60)+'"/>').join('');
  const shortNames={market:'河市',letter:'画笺',tea:'茶棚',orchid:'花影',ferry:'渡口',artisan:'小铺',courtyard:'庭院',veranda:'回廊',bell:'钟楼'};
  const current=nodeById(run.path.at(-1));
  const previews={market:['语言切磋','44 体力对手 · 胜后选 1 枚印记'],letter:['寻找她留下的画笺','可消耗 8 体力换印记，也可免费助人'],tea:['歇脚或研习','回复 26 体力 / 选择一枚印记'],orchid:['精英切磋','78 体力对手 · 获得双级印记'],ferry:['船家的旧信','花 12 纸币换印记 / 免费整理信件'],artisan:['沿途小铺','18 纸币购一枚印记 · 可跳过'],courtyard:['守关前的歇脚处','回复 26 体力 / 研习印记'],veranda:['语言切磋','56 体力对手 · 胜后选 1 枚印记'],bell:['章节守关','112 体力对手 · 找回她留下的信']};
  const preview=previews[target.id]||['远行完成','收好这段旅途的记忆'];
  return '<header class="route-top">'+btn('home',icon('back')+'码头','route-back')+
    '<div class="journey-heading"><h1>循着她的痕迹</h1><small>第一章 · 河畔 / '+Math.min(5,run.path.length)+' · 5</small></div><div class="route-vitals"><span>'+icon('leaf')+run.hp+'/100</span><span>'+icon('coin')+run.coins+'</span></div></header>'+
    '<section class="route-map" aria-label="下一程，选择沿河地点"><svg class="route-lines" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">'+lines+'</svg>'+
    places.map(({n,x,y})=>btn('route-peek:'+n.id,'<span class="place-mark">'+icon(symbols[n.type])+'</span><b>'+shortNames[n.id]+'</b>','route-node '+(target.id===n.id?'selected':''),
    'style="--x:'+x+'%;--y:'+y+'%" aria-label="'+n.name+'，'+types[n.type]+'，点击预览" aria-pressed="'+(target.id===n.id)+'"')).join('')+
    '<span class="current-place">'+esc(current.name)+' · 此刻</span></section>'+
    '<footer class="route-bottom"><div class="destination-preview"><small>'+preview[0]+'</small><h2>'+target.name+'</h2><p>'+preview[1]+'</p></div>'+
    (run.stage!=='map'?btn('route-continue','继续这一站 '+icon('arrow'),'route-primary'):btn('route-go:'+target.id,'启程 '+icon('arrow'),'route-primary',ready.includes(target.id)?'':'disabled'))+'</footer>'+
    btn('route-powers',icon('book')+'旅途手记','journey-journal')+'<div class="journey-departure" aria-live="polite" hidden></div>';
}
function cards(run,{btn,icon}) {
 return '<div class="route-powers">'+run.offers.map(id=>{
   const p=POWERS.find(x=>x.id===id),level=run.powers[id]||0,next=Math.min(3,level+(run.stage==='reward'?run.rewardLevels:1));
   return btn('route-take:'+id,'<span class="power-seal" style="--power-color:'+p.color+'">'+icon(p.icon)+'</span><small>'+(run.stage==='shop'?'18 纸币':'本次只选一个')+'</small><h3>'+p.name+'</h3><p>'+p.text+'</p><b>'+ (level?'等级 '+level+' → '+next:'获得 · '+next+' 级')+'</b>',
   'power-choice',run.stage==='shop'&&run.coins<18?'disabled':'');
 }).join('')+'</div>';
}
export function routeStageHTML(run,{btn,icon,esc}) {
 const n=nodeById(run.active), tools={btn,icon};
 let title='',copy='',content='';
 if(run.stage==='reward'){
  title=run.rewardLevels===2?'花影散开，留下双重回响。':'带走一枚旅途印记。';
  copy='选择会改变接下来的战斗。所有强化只在这次远行生效。';content=cards(run,tools);
 } else if(run.stage==='rest'){
  title='在茶香里，歇一会儿。';copy='阿笺趴在你的衣角。茶还温着，信里的路也还长。';
  content='<div class="route-story-choices">'+btn('route-rest:heal',icon('tea')+'<h3>喝一盏热茶</h3><p>恢复 26 体力</p>','story-choice',run.hp>=100?'disabled':'')+
    btn('route-rest:train',icon('book')+'<h3>温习途中听到的话</h3><p>不回血，选择一枚印记强化</p>','story-choice')+'</div>';
 } else if(run.stage==='event'){
  const first=n.id==='letter';title=first?'她在纸上，画了一朵梅花。':'船家还记得，那个女孩。';
  copy=first?'风吹散了画笺。背面浅浅的笔迹，似乎是她留下的方向。':'“她问过学院的钟声。”船家从一叠旧信中，抽出了一页熟悉的信纸。';
  const can=first?run.hp>8:run.coins>=12;
  content='<div class="route-story-choices">'+btn('route-event:trace',icon('mail')+'<h3>'+(first?'仔细拓下笔迹':'买下这封旧信')+'</h3><p>'+(first?'消耗 8 体力':'消耗 12 纸币')+'，获得一枚印记</p>','story-choice',can?'':'disabled')+
    btn('route-event:help',icon('paw')+'<h3>'+(first?'和阿笺一起拾起画笺':'替船家整理信件')+'</h3><p>恢复 '+(first?8:10)+' 体力，获得 5 纸币</p>','story-choice')+'</div>';
 } else if(run.stage==='shop'){
  title='把沿途的心意，系在身上。';copy='这里的纸币来自本次远行。每站只能买一枚，也可以什么都不买。';content=cards(run,tools)+btn('route-skip','收好钱袋，继续走 '+icon('arrow'),'route-skip');
 }
 return '<header class="route-top">'+btn('route-map',icon('back')+'查看路线','route-back')+'<div><small>沿途 · '+esc(n?.name||'')+'</small><h1>'+ (run.stage==='reward'?'旅途回馈':esc(n?.name||''))+'</h1></div><div class="route-vitals"><span>体力 <b>'+run.hp+'</b>/100</span><span>'+icon('coin')+run.coins+'</span></div></header>'+
   '<section class="route-event-sheet"><p class="route-eyebrow">一封信 · 两个世界</p><h2>'+title+'</h2><p class="route-story-copy">'+copy+'</p>'+content+'</section>';
}
export function routeEndingHTML(run,{btn,icon}) {
 const win=run.finished;
 return '<article class="route-ending"><small>独立远行 · '+(win?'第一章完成':'暂歇')+'</small><h1>'+(win?'钟声响起。<br>她真的来过这里。':'先歇一歇，<br>信里的路还在。')+'</h1><p>'+(win?'守信者把梅花信放在你的掌心。背面画着两扇窗，一扇朝向中国，一扇朝向泰国。阿笺用额头轻轻碰了碰信封。':'阿笺把散落的信纸收好。这次的体力已耗尽，但听懂的话不会白费。换一条路线，再试一次。')+'</p><div class="route-run-summary"><span><b>'+run.path.length+'</b>走过的地点</span><span><b>'+run.correct+'</b>听懂的回应</span><span><b>'+Object.values(run.powers).reduce((a,b)=>a+b,0)+'</b>印记等级</span></div><p class="ending-note">'+(win?'这一章的痕迹已找到；地图重开时，本局体力、纸币和印记重新开始。':'下次可以选择茶棚补给，或带上竹玉扣与青竹书签。')+'</p>'+btn('route-new',icon('leaf')+'再走一条路','route-primary')+btn('home','收起地图，回到码头','text-button')+'</article>';
}
