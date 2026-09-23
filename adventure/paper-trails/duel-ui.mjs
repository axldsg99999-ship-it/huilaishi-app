import {PLAY_COPY,STANCES,BEATS,timingProgress,DUEL_ENEMIES} from './play-rules.mjs?v=play2';

// Fixed, hand-drawn action silhouettes. No rock/paper/scissors hand icons.
function stanceIcon(id){
 const limbs={attack:'M34 34 58 47 84 43M37 39 23 55 12 55M45 62 67 74 88 76M40 62 30 81 13 85',break:'M40 37 57 47 78 29M37 39 24 26 19 15M44 64 63 75 83 80M39 64 22 75 15 89',guard:'M40 36 62 31 67 18M36 39 27 51 48 54M44 64 61 80 80 83M39 65 23 78 15 87'}[id];
 return '<svg class="stance-figure" viewBox="0 0 100 100" aria-hidden="true"><path class="stance-wash" d="M11 63Q3 21 53 7Q88 4 92 45Q92 82 53 94Q7 103 11 63Z"/><circle cx="40" cy="22" r="9"/><path d="M39 32 31 58 47 68 55 48Z"/><path class="limbs" d="'+limbs+'"/><path class="coat" d="M34 48Q14 50 17 70L39 61 53 71 54 52Z"/></svg>';
}
export function duelMarkup(r,locale,{button,esc}){
 const p=PLAY_COPY[locale],d=r.duel,active=r.phase==='duel-active',busy=!['ready','duel-active'].includes(r.phase),progress=timingProgress(d.elapsed,d.duration,d.pattern),locked=active&&progress>=.8;
 const positions=[[28,206],[266,155],[409,301]];
 const options=r.options.map((w,i)=>button('duelAnswer',esc(w[locale]),'thought duel-answer'+(r.phase==='feedback'?(w.id===r.word.id?' answer-correct':' answer-quiet'):''),'data-index="'+i+'" style="left:'+positions[i][0]+'px;top:'+positions[i][1]+'px" '+(!active?'disabled':''))).join('');
 const stances='<div class="stance-choices">'+STANCES.map((stance,i)=>button('stance',stanceIcon(stance)+'<strong>'+p.stance[i]+'</strong><small>'+p.stance[i]+' → '+p.stance[STANCES.indexOf(BEATS[stance])]+'</small>','stance-choice '+stance,'data-index="'+i+'" aria-pressed="'+(d.stance===stance)+'" '+(!r.ready||busy||locked?'disabled':''))).join('')+'</div>';
 const bar='<div class="duel-timing '+(active?'running':'')+'"><div class="timing-label">'+(active?(locked?p.duelLock:p.duelActive):p.duelPrepare)+'</div><div class="timing-track" role="meter" aria-label="'+p.timing.good+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i class="good-zone"></i><i class="perfect-zone"></i><b class="timing-cursor"></b></div><small>'+p.timing.ordinary+' · '+p.timing.good+' · '+p.timing.perfect+'</small></div>';
 const hp='<div class="duel-enemy-hp"><span>'+p.enemyHp+' '+d.enemyHp+' / '+d.enemyMax+'</span><i><b style="width:'+(d.enemyHp/d.enemyMax*100)+'%"></b></i></div>';
 return options+stances+bar+hp;
}
export function updateDuelUI(stage,r,locale){
 if(r?.mode!=='duel'||!r.duel)return;
 const d=r.duel,p=timingProgress(d.elapsed,d.duration,d.pattern),active=r.phase==='duel-active';
 const cursor=stage.querySelector('.timing-cursor');if(cursor)cursor.style.left=(p*100)+'%';
 const meter=stage.querySelector('.timing-track');if(meter)meter.setAttribute('aria-valuenow',Math.round(p*100));
 if(active){stage.querySelectorAll('[data-action=stance]').forEach(b=>b.disabled=p>=.8);const label=stage.querySelector('.timing-label');if(label)label.textContent=p>=.8?PLAY_COPY[locale].duelLock:PLAY_COPY[locale].duelActive;}
}
