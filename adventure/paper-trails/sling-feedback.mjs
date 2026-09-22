import {SLING, slingTension, slingRecoil, ballistic} from './core.mjs?v=draw2';
import {sprite} from './art.mjs?v=draw2';

export const SLING_COPY={
 zh:{power:'拉力',low:'轻拉',mid:'蓄力',high:'强弦',full:'满弦',release:'松手发射',return:'收回弓兜可取消',cancel:'收弓',weak:'再往后拉一点',aim:'已辅助瞄准',drag:'拉开弓兜，松手发射',sent:'已发射',unit:'拉力'},
 th:{power:'แรงดึง',low:'เบา',mid:'ปานกลาง',high:'แรง',full:'เต็มแรง',release:'ปล่อยเพื่อยิง',return:'ลากกลับเพื่อยกเลิก',cancel:'เก็บคันยิง',weak:'ดึงถอยอีกนิด',aim:'ช่วยเล็งแล้ว',drag:'ดึงถอย แล้วปล่อยเพื่อยิง',sent:'ยิงแล้ว',unit:'แรงดึง'}
};
export function chargeMarkup(locale){
 const s=SLING_COPY[locale];
 return '<aside id="sling-charge" class="sling-charge" hidden aria-label="'+s.power+'">'+
 '<div class="charge-dial" role="meter" aria-label="'+s.power+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">'+
 '<svg viewBox="0 0 150 150" aria-hidden="true"><path class="dial-paper" d="M74 14Q113 10 132 46Q149 81 119 117Q79 146 38 121Q4 99 15 58Q29 17 74 14Z"/>'+ 
 '<circle class="dial-track" cx="75" cy="75" r="61"/><circle class="dial-ink" cx="75" cy="75" r="61" pathLength="100"/>'+Array.from({length:11},(_,i)=>{const a=(135+i*27)*Math.PI/180;return '<path class="dial-tick" d="M'+(75+Math.cos(a)*51)+' '+(75+Math.sin(a)*51)+' L'+(75+Math.cos(a)*55)+' '+(75+Math.sin(a)*55)+'"/>';}).join('')+'<path class="dial-leaf" d="M75 10Q87 -3 94 5Q87 18 75 10Z"/></svg>'+ 
 '<div class="dial-type"><small>'+s.power+'</small><strong><span class="charge-number">0</span><em>%</em></strong><span class="charge-band">'+s.low+'</span></div></div>'+ 
 '<p class="charge-instruction">'+s.release+'</p><small class="charge-return">'+s.return+'</small></aside>';
}
export function updateCharge(stage,run,locale){
 const el=stage.querySelector('#sling-charge');if(!el)return;
 const active=run?.mode==='sling'&&run.phase==='aim'&&!!run.pull;
 el.hidden=!active;if(!active)return;
 const s=SLING_COPY[locale],v=slingTension(run.pull),colour=['#527b7a','#527b7a','#a77b35','#ae583c'][v.band];
 el.style.setProperty('--charge-ink',colour);el.style.setProperty('--charge',v.ratio);el.dataset.band=String(v.band);
 el.querySelector('.dial-ink').style.strokeDasharray=(v.ratio*75)+' 100';
 el.querySelector('.charge-number').textContent=v.percent;
 el.querySelector('.charge-band').textContent=[s.low,s.mid,s.high,s.full][v.band];
 el.querySelector('[role=meter]').setAttribute('aria-valuenow',v.percent);
 el.querySelector('.charge-instruction').textContent=!v.canFire?s.weak:run.dragging?s.release:s.aim;
 el.querySelector('.charge-return').textContent=run.dragging?s.return:s.release;
 const fire=stage.querySelector('[data-action=fire]');if(fire)fire.disabled=!v.canFire;
}

// Layered cords: paper fibres, a coloured core and a tiny moving highlight.
function cord(c,from,to,power,t,reduced){
 const mid={x:(from.x+to.x)/2,y:(from.y+to.y)/2},v=power>.9&&!reduced?Math.sin(t*39)*.65:0;
 c.beginPath();c.moveTo(from.x,from.y);c.quadraticCurveTo(mid.x,mid.y+v,to.x,to.y);
 c.lineWidth=7-power*2;c.strokeStyle='#60473b';c.stroke();
 c.lineWidth=3.7-power;c.strokeStyle=power>.985?'#bc7749':power>.7?'#c4a366':'#d7c4a1';c.stroke();
 c.lineWidth=.9;c.strokeStyle='#f9eccb';c.stroke();
}
export function drawSling(c,art,r,t,reduced){
 const tension=slingTension(r.pull),pwr=tension.ratio,age=r.releaseAt==null?9:r.clock-r.releaseAt;
 const rec=slingRecoil(r.releasePull,age,reduced),p=r.pull||{x:SLING.x+rec.x,y:SLING.y+rec.y};
 const firing=age>=0&&age<.7,drawn=r.phase==='aim'&&!!r.pull;
 c.save();c.lineCap='round';
 // The tiny lean is anchored at the base so the fork feels elastic, not floating.
 const lean=reduced?0:drawn?-.026*pwr:firing?Math.sin(age*28)*Math.exp(-age*9)*.036*(r.shotPower||0):0;
 const left={x:264-5*pwr,y:398+3*pwr},right={x:322-5*pwr,y:399+3*pwr};
 cord(c,left,p,pwr,t,reduced);
 sprite(c,art.sling,292,568,176,{angle:lean,sx:1-pwr*.015,sy:1-pwr*.016});
 cord(c,right,p,pwr,t,reduced);
 // Folded leather-and-paper pocket follows the finger exactly.
 c.save();c.translate(p.x,p.y);c.rotate(-pwr*.17);c.fillStyle='#846951';c.strokeStyle='#e7d0a4';c.lineWidth=1;
 c.beginPath();c.moveTo(-19,-6);c.quadraticCurveTo(0,12,20,-6);c.lineTo(16,12);c.quadraticCurveTo(-1,21,-18,9);c.closePath();c.fill();c.stroke();c.restore();
 if(drawn){
  // An outlined finger-grip halo remains at the pocket, away from the readout.
  c.strokeStyle=pwr>.985?'#aa613e':'#537974';c.globalAlpha=.45;c.lineWidth=1.5;c.setLineDash([3,6]);c.beginPath();c.arc(p.x,p.y,46+(!reduced?Math.sin(t*5)*2:0),0,Math.PI*2);c.stroke();c.setLineDash([]);c.globalAlpha=1;
  if(pwr>.35&&!reduced){
   for(let i=0;i<7;i++){const phase=(t*(.6+pwr*.55)+i/7)%1,a=i*2.4+t*.13,rad=63*(1-phase)+29;
    c.save();c.globalAlpha=Math.sin(phase*Math.PI)*pwr*.62;c.translate(p.x+Math.cos(a)*rad,p.y+Math.sin(a)*rad);c.rotate(a);c.fillStyle=i%2?'#bd8151':'#637f76';c.beginPath();c.moveTo(-4,0);c.quadraticCurveTo(1,-4,7,0);c.quadraticCurveTo(1,4,-4,0);c.fill();c.restore();
   }
  }
 }
 if(r.selected!=null&&!r.projectile&&!r.used.has(r.selected)){
  const creature=['swallow','rabbit','squirrel'][r.selected],flutter=!reduced&&drawn?Math.sin(t*(4+pwr*7))*.018*pwr:0;
  sprite(c,art[creature],p.x,p.y+25,67,{angle:drawn?-.12-pwr*.15+flutter:Math.sin(t*2)*.025,sx:1+pwr*.12,sy:1-pwr*.1});
 }
 if(drawn&&tension.canFire){
  const flight={x:p.x,y:p.y,vx:(SLING.x-p.x)*SLING.power,vy:(SLING.y-p.y)*SLING.power};
  // Animated, short ink-dash arc. The prediction uses the same physics as the shot.
  for(let s=.035;s<1.4;s+=.065){const q=ballistic(flight,s);if(q.y>610||q.x>1240||q.y<148)break;
   const q2=ballistic(flight,s+.012),shine=reduced?.72:.55+.25*Math.sin(t*7-s*11);
   c.globalAlpha=shine*(1-s/1.8);c.lineWidth=4-s;c.strokeStyle=pwr>.7?'#8d552e':'#315b61';c.beginPath();c.moveTo(q.x,q.y);c.lineTo(q2.x,q2.y);c.stroke();
  }c.globalAlpha=1;
 }
 if(firing&&!reduced){const k=age/.7;c.globalAlpha=(1-k)*.8;c.strokeStyle='#b78550';c.lineWidth=3*(1-k);c.beginPath();c.ellipse(SLING.x+age*115,SLING.y-12,14+age*53,28+age*62,-.35,0,Math.PI*2);c.stroke();}
 if(r.projectile){
  const b=r.projectile,pt=ballistic(b,b.age),strength=r.shotPower||.5,trail=r.trail||[];
  for(let i=1;i<trail.length;i++){const a=trail[i-1],v=trail[i],alpha=i/trail.length;
   c.globalAlpha=alpha*.45;c.lineWidth=(3+strength*9)*alpha;c.strokeStyle=['#b67954','#b18c48','#62847e'][r.selected];c.beginPath();c.moveTo(a.x,a.y);c.lineTo(v.x,v.y);c.stroke();
   c.lineWidth=Math.max(1,(1+strength*2)*alpha);c.strokeStyle='#fff1d1';c.stroke();
  }c.globalAlpha=1;
  const stretch=!reduced?1+.1*strength:1;
  sprite(c,art[['swallow','rabbit','squirrel'][r.selected]],pt.x,pt.y+29,75,{angle:Math.atan2(b.vy+SLING.gravity*b.age,b.vx)*.4,sx:stretch,sy:1/stretch});
 }
 c.restore();
}
