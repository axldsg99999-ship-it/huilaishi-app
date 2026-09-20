// Author-made PNG atlases remain separate from live text and hit targets.
const file = name => new URL(name, import.meta.url).href;
const image = src => new Promise((resolve, reject) => {
  const im = new Image(); im.onload = () => resolve(im);
  im.onerror = () => reject(new Error('战斗画面加载失败：' + src)); im.src = src;
});
export function crop(im, box, isolate = false) {
  const [x,y,w,h] = box;
  const canvas = document.createElement('canvas'); canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true}); ctx.drawImage(im,x,y,w,h,0,0,w,h);
  if (isolate) {
    // Adjacent hand-painted poses have unequal silhouettes. Retain the largest
    // connected silhouette within its envelope, not slivers from another pose.
    const pixels=ctx.getImageData(0,0,w,h), d=pixels.data;
    const marks=new Uint32Array(w*h), queue=new Uint32Array(w*h);
    let label=0, largest=0, best=0;
    for(let p=0;p<w*h;p++) {
      if(marks[p] || d[p*4+3]<12) continue;
      label++; let head=0, tail=1; queue[0]=p; marks[p]=label;
      while(head<tail) {
        const q=queue[head++], qx=q%w, qy=Math.floor(q/w);
        for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) {
          const xx=qx+dx, yy=qy+dy, n=yy*w+xx;
          if(xx<0||xx>=w||yy<0||yy>=h||marks[n]||d[n*4+3]<12) continue;
          marks[n]=label; queue[tail++]=n;
        }
      }
      if(tail>largest){largest=tail;best=label;}
    }
    for(let p=0;p<w*h;p++) if(marks[p]!==best) d[p*4+3]=0;
    ctx.putImageData(pixels,0,0);
  }
  const data=ctx.getImageData(0,0,w,h).data;
  let left=w,top=h,right=0,bottom=0;
  for(let yy=0;yy<h;yy++) for(let xx=0;xx<w;xx++) if(data[(yy*w+xx)*4+3]>12){
    left=Math.min(left,xx);top=Math.min(top,yy);right=Math.max(right,xx);bottom=Math.max(bottom,yy);
  }
  const trimmed=document.createElement('canvas');
  trimmed.width=right-left+1;trimmed.height=bottom-top+1;
  trimmed.getContext('2d').drawImage(canvas,left,top,trimmed.width,trimmed.height,0,0,trimmed.width,trimmed.height);
  return trimmed;
}
function portrait(im,box) {
  const c=document.createElement('canvas');c.width=192;c.height=192;
  const ctx=c.getContext('2d');ctx.fillStyle='#223831';ctx.fillRect(0,0,192,192);
  ctx.drawImage(im,...box,0,0,192,192);return c.toDataURL();
}
export async function loadBattleArt() {
  const [backdrop,hero,enemy,kit,callSheet]=await Promise.all([
    image(file('calm-stage-v3.png')),image(file('xiaoai-battle-v2.png')),
    image(file('orchid-battle-v2.png')),image(file('paper-skill-kit-v2.png')),
    image(file('orchid-call-v3.png')),
  ]);
  const heroFrames=[[0,0,552,700],[552,0,570,700],[0,700,606,702],[568,700,554,702]].map(b=>crop(hero,b,true));
  const enemyFrames=[[0,0,559,644],[495,0,627,644],[0,649,593,753],[589,649,533,753]].map(b=>crop(enemy,b,true));
  const boxes=[[0,55,452,390],[452,55,437,371],[887,110,416,289],[1303,70,471,352],
    [0,552,450,204],[452,448,443,404],[894,451,438,399],[1334,450,440,404]];
  const paper=boxes.map(b=>crop(kit,b).toDataURL());
  const callFrames=[0,1].map(i=>crop(callSheet,[i*callSheet.width/2,0,callSheet.width/2,callSheet.height]).toDataURL());
  return {backdrop,heroFrames,enemyFrames,paper,callFrames,
    portrait:portrait(hero,[246,17,160,160]),enemyPortrait:portrait(enemy,[114,120,170,170])};
}
