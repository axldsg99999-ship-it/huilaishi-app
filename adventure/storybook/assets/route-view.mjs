import {NODES,POWERS,nodeById,availableNodes} from './expedition.mjs';
const symbols={start:'mail',battle:'attack',elite:'break',rest:'tea',event:'book',shop:'coin',boss:'leaf'};
const types={start:'出发',battle:'切磋',elite:'精英',rest:'休息',event:'奇遇',shop:'小铺',boss:'守关'};
export function routeMapHTML(run,selected,{btn,icon,esc}) {
  const ready=availableNodes(run), target=nodeById(selected)||nodeById(run.active)||nodeById(ready[0])||nodeById(run.path.at(-1));
  const lines=NODES.flatMap(n=>n.to.map(id=>{
    const end=nodeById(id),visited=run.path.includes(n.id)&&run.path.includes(id),next=n.id===run.path.at(-1)&&ready.includes(id);
    return '<path class="'+(visited?'walked':next?'open':'')+'" d="M'+n.x*10+','+n.y*5+' C'+(n.x+8)*10+','+n.y*5+' '+(end.x-8)*10+','+end.y*5+' '+end.x*10+','+end.y*5+'"/>';
  })).join('');
  return '<header class="route-top">'+btn('home',icon('back')+'码头','route-back')+
    '<div><small>第一章 · 泰国河畔</small><h1>循着她的痕迹</h1></div><div class="route-vitals"><span>体力 <b>'+run.hp+'</b>/100</span><span>'+icon('coin')+run.coins+'</span>'+btn('route-powers',icon('leaf')+'印记 '+Object.values(run.powers).reduce((a,b)=>a+b,0))+'</div></header>'+
    '<section class="route-map" aria-label="分岔旅途地图"><div class="map-wash"></div><svg class="route-lines" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">'+lines+'</svg>'+
    NODES.map(n=>{
      const visited=run.path.includes(n.id),reachable=ready.includes(n.id),active=run.active===n.id;
      return btn('route-peek:'+n.id,'<span class="node-seal">'+icon(symbols[n.type])+(visited?'<i>✓</i>':'')+'</span><b>'+n.name+'</b><small>'+ (active?'尚未完成':visited?'已走过':reachable?types[n.type]+' · 可前往':types[n.type])+'</small>',
        'route-node '+n.type+(visited?' visited':'')+(reachable?' reachable':'')+(target.id===n.id?' selected':''),
        'style="--x:'+n.x+'%;--y:'+n.y+'%" aria-label="'+n.name+'，'+types[n.type]+'，'+(reachable?'可前往':visited?'已走过':'未抵达')+'" aria-pressed="'+(target.id===n.id)+'"');
    }).join('')+'<span class="map-caption">水路有分岔，心意会相逢。</span></section>'+
    '<footer class="route-bottom"><div><small>'+(run.stage==='map'?'点击地点查看，再决定下一步。':'这一站还没走完，可以随时继续。')+'</small><h2>'+target.name+'</h2><p>'+esc(target.note)+'</p></div>'+
    (run.stage!=='map'?btn('route-continue',icon('arrow')+'继续这一站','route-primary'):btn('route-go:'+target.id,'前往 '+target.name+' '+icon('arrow'),'route-primary',ready.includes(target.id)?'':'disabled'))+'</footer>'+
    '<p class="route-scope">独立远行试玩 · 血量与印记沿途保留 · 不影响正式游戏</p>';
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
