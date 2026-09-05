/* A read-only travel/bestiary overlay; inspection records never alter combat or learning. */
(function(root) {
"use strict";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let session=0;
function open({stage,sheet,dir,locale,chapter,groups,onBack}) {
  const model=root.HUILAISHI_WORLD_ATLAS;
  if(!model || !stage || !sheet || sheet.dataset.arcadePhase!=="monster-ready") return false;
  const zh=locale==="zh", tx=(a,b)=>zh?a:b, text=o=>o[zh?"zh":"th"];
  const token=++session;
  let tab="world",route=dir,region=Math.max(1,Math.min(6,chapter||1)),act=0,group=0,monster=0;
  let demo=0;
  const key=()=>`huilaishi-world-postcards-${route}`;
  const visits=()=>{try{return model.normalizeVisits(JSON.parse(root.HUILAISHI_STORAGE?.getItem(key())||"[]"),route);}catch(_){return [];}};
  const regionNames=zh?["失控校园","莲火夜市","风筝渡口","雷鸣工坊","墨色书街","双铃舞台"]:["วิทยาเขตวุ่นวาย","ตลาดบัวไฟ","ท่าเรือว่าว","โรงงานสายฟ้า","ถนนหนังสือหมึก","เวทีระฆังคู่"];
  function render(focus) {
    if(session!==token)return;
    demo++;
    sheet.dataset.arcadePhase="world-atlas";
    const place=model.scene(route,region,act*2), stamps=visits(), items=groups[group].items;
    monster=Math.min(monster,items.length-1);
    const selected=items[monster], animated=selected.frames?.windup && selected.frames?.strike;
    stage.innerHTML=`<section class="world-atlas" aria-label="${tx("世界手册","สมุดโลก")}">
      <header class="atlas-header"><div><small>${tx("双城冒险 · 手工世界","ผจญภัยสองเมือง · โลกงานมือ")}</small><h3 tabindex="-1">${tx("沿着纸页，去远一点。","ตามหน้ากระดาษ ออกไปให้ไกลอีกนิด")}</h3></div><button data-atlas-action="back" data-speech-skip>${tx("返回冒险","กลับผจญภัย")} ↗</button></header>
      <div class="atlas-tabs" aria-label="${tx("手册栏目","หมวดสมุด")}"><button data-atlas-action="tab" data-value="world" aria-pressed="${tab==="world"}" data-speech-skip>${tx("世界漫游 · 36景","สำรวจโลก · 36 ฉาก")}</button><button data-atlas-action="tab" data-value="bestiary" aria-pressed="${tab==="bestiary"}" data-speech-skip>${tx("纸怪图鉴 · 56形象","สมุดมอนสเตอร์ · 56 แบบ")}</button></div>
      ${tab==="world"?`<div class="atlas-route" aria-label="${tx("预览学习路线","เส้นทางตัวอย่าง")}">${[["zh-th",tx("学泰语的世界","โลกสำหรับเรียนไทย")],["th-zh",tx("学中文的世界","โลกสำหรับเรียนจีน")]].map(([id,name])=>`<button data-atlas-action="route" data-value="${id}" aria-pressed="${route===id}" data-speech-skip>${name}</button>`).join("")}</div>
      <nav class="atlas-regions" aria-label="${tx("六大区域","หกเขต")}">${regionNames.map((name,i)=>`<button data-atlas-action="region" data-value="${i+1}" aria-pressed="${region===i+1}" data-speech-skip><small>0${i+1}</small><span>${name}</span></button>`).join("")}</nav>
      <div class="atlas-layout"><div class="atlas-picture"><img src="${esc(place.art)}" alt="${esc(text(place.title))}" decoding="async"/><span class="atlas-scene-index">0${region} / 0${act+1}</span><div class="atlas-hotspots">${place.props.map((p,i)=>`<button data-atlas-action="inspect" data-value="${p.id}" aria-controls="atlas-discovery" aria-expanded="false" data-speech-skip><i aria-hidden="true">${stamps.includes(p.id)?"✓":"+"}</i>${esc(text(p.label))}</button>`).join("")}</div></div>
      <div class="atlas-page"><small class="atlas-eyebrow">${tx("地点手记","บันทึกสถานที่")}</small><h4>${esc(text(place.title))}</h4><p>${esc(text(place.intro))}</p><div class="atlas-discovery" id="atlas-discovery" role="status" tabindex="-1"><b>${tx("这里藏着两处小故事","มีเรื่องเล็ก ๆ ซ่อนอยู่สองจุด")}</b><p>${tx("点击画面里的纸签，看看纸怪留下了什么。","แตะป้ายกระดาษในภาพ ดูว่ามอนสเตอร์ทิ้งอะไรไว้")}</p></div><p class="atlas-counter" data-atlas-counter>${tx("本路线发现","ค้นพบในเส้นทางนี้")} ${stamps.length}/36</p><small class="atlas-fair-note">${tx("漫游不切换课程、不解锁章节，也不增加经验或词汇熟练度。","การสำรวจไม่เปลี่ยนบทเรียน ไม่ปลดล็อกบท และไม่เพิ่มประสบการณ์หรือความชำนาญคำศัพท์")}</small></div></div>
      <div class="atlas-scenes" aria-label="${tx("本章三个地点","สามสถานที่ในบทนี้")}">${model.chapter(route,region).map((s,i)=>`<button data-atlas-action="act" data-value="${i}" aria-pressed="${act===i}" data-speech-skip><img src="${esc(s.art)}" alt="" loading="lazy" decoding="async"/><span><small>0${i+1}</small>${esc(text(s.title))}</span></button>`).join("")}</div>`:
      `<p class="atlas-count-note">${tx("36只主线怪 + 20种巡游原型。巡游原型各有5种装备变体，共100场巡游挑战。","มอนสเตอร์เนื้อเรื่อง 36 ตัว + ต้นแบบทัวร์ 20 แบบ แต่ละต้นแบบมีอุปกรณ์ 5 แบบ รวม 100 ด่านทัวร์")}</p>
      <label class="atlas-select-label">${tx("选择栖息地","เลือกถิ่นอาศัย")}<select data-atlas-group aria-label="${tx("怪物栖息地","ถิ่นมอนสเตอร์")}">${groups.map((g,i)=>`<option value="${i}" ${i===group?"selected":""}>${esc(g.title)}</option>`).join("")}</select></label>
      <div class="atlas-monster-layout"><div class="atlas-specimen" data-motion="${esc(selected.motion||"spring")}"><span class="atlas-specimen-number">Nº ${String(monster+1).padStart(2,"0")}</span><img data-atlas-monster src="${esc(selected.art)}" alt="${esc(selected.name)}"/><span class="atlas-specimen-ground" aria-hidden="true"></span></div><div class="atlas-page"><small class="atlas-eyebrow">${esc(groups[group].title)}</small><h4>${esc(selected.name)}</h4><p>${esc(selected.lore||groups[group].lore)}</p><div class="atlas-skill"><b>${tx("应对笔记","บันทึกวิธีรับมือ")}</b><p>${esc(selected.hint)}</p></div><button class="atlas-demo" data-atlas-action="demo" data-speech-skip>${animated?tx("看出招动作","ดูท่าโจมตี"):tx("看纸偶动态","ดูการเคลื่อนไหวหุ่นกระดาษ")}</button><small data-atlas-demo-status role="status">${animated?tx("待机 → 蓄力 → 出招 → 恢复","ยืน → เตรียม → โจมตี → กลับท่า"):tx("当前为原画纸偶动效，尚非逐帧动画。","ขณะนี้เป็นภาพหุ่นกระดาษเคลื่อนไหว ยังไม่ใช่แอนิเมชันรายเฟรม")}</small></div></div>
      <div class="atlas-monster-strip">${items.map((m,i)=>`<button data-atlas-action="monster" data-value="${i}" aria-pressed="${monster===i}" data-speech-skip><img src="${esc(m.art)}" alt="" loading="lazy" decoding="async"/><span>${esc(m.name)}</span></button>`).join("")}</div>`}
      <footer>${tx("原创架空双城 · 可自由预览所有地点，返回后继续原来的冒险。","สองเมืองสมมติ · ดูทุกสถานที่ได้ กลับแล้วผจญภัยเดิมต่อ")}</footer></section>`;
    const area=stage.querySelector(".world-atlas");
    area.onclick=e=>{
      const b=e.target.closest("[data-atlas-action]");if(!b)return;
      const action=b.dataset.atlasAction,value=b.dataset.value;
      if(action==="back"){session++;demo++;onBack();return;}
      if(action==="inspect"){
        const result=model.inspect(visits(),route,place.id,value);if(!result.prop)return;
        try { root.HUILAISHI_STORAGE?.setItem(key(),JSON.stringify(result.visits)); } catch (_) {}
        const panel=area.querySelector("#atlas-discovery");
        panel.innerHTML=`<b>${esc(text(result.prop.label))}</b><p>${esc(text(result.prop.text))}</p>`;
        area.querySelectorAll('[data-atlas-action="inspect"]').forEach(x=>x.setAttribute("aria-expanded",String(x===b)));
        b.querySelector("i").textContent="✓";
        area.querySelector("[data-atlas-counter]").textContent=tx("本路线发现","ค้นพบในเส้นทางนี้")+" "+result.visits.length+"/36";
        return;
      }
      if(action==="demo"){
        const image=area.querySelector("[data-atlas-monster]"), status=area.querySelector("[data-atlas-demo-status]");
        const sequence=++demo;b.disabled=true;
        const valid=()=>session===token && sequence===demo && area.isConnected && sheet.dataset.arcadePhase==="world-atlas";
        if(animated){
          image.src=selected.frames.windup;status.textContent=tx("蓄力：观察动作预兆。","เตรียมท่า: ดูสัญญาณก่อนโจมตี");
          setTimeout(()=>{if(valid()){image.src=selected.frames.strike;status.textContent=tx("出招：判断时机，不扣血。","ออกท่า: อ่านจังหวะ ไม่ลดพลัง");}},550);
        }else {area.querySelector(".atlas-specimen").classList.remove("is-moving");void image.offsetWidth;area.querySelector(".atlas-specimen").classList.add("is-moving");}
        setTimeout(()=>{if(valid()){image.src=selected.art;b.disabled=false;status.textContent=tx("观察完成 · 可以再次播放","ดูเสร็จแล้ว · เล่นซ้ำได้");}},1300);
        return;
      }
      if(action==="tab")tab=value;
      if(action==="route"){route=value;act=0;}
      if(action==="region"){region=Number(value);act=0;}
      if(action==="act")act=Number(value);
      if(action==="monster")monster=Number(value);
      render(`[data-atlas-action="${action}"][data-value="${value}"]`);
    };
    const select=area.querySelector("[data-atlas-group]");
    if(select)select.onchange=()=>{group=Number(select.value);monster=0;render("[data-atlas-group]");};
    if(focus)area.querySelector(focus)?.focus({preventScroll:true});
  }
  render();
  sheet.scrollTop=0;stage.querySelector("h3")?.focus({preventScroll:true});
  return true;
}
root.HUILAISHI_WORLD_ATLAS_UI=Object.freeze({open});
})(globalThis);
