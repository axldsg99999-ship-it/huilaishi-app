/* Campus rewards are local cosmetic points, never purchased power or assessment. */
(function (root) {
  'use strict';
  const KEY='xulong-campus-rewards-v1';
  const poses=Object.freeze(['idle','run','windup','strike','hit','dodge','recover','victory']);
  const outfits=Object.freeze([
    {id:'chinese-campus',hero:'chinese',zh:'小艾 · 课后常服',th:'小艾 · ชุดหลังเลิกเรียน',price:0,prefix:'hero-chinese-v116'},
    {id:'chinese-field',hero:'chinese',zh:'小艾 · 河岸探索装',th:'小艾 · ชุดสำรวจริมแม่น้ำ',price:90,prefix:'xiaoai-explorer-v125'},
    {id:'thai-campus',hero:'thai',zh:'CHANINDA · 声斗常服',th:'CHANINDA · ชุดประลองเสียง',price:0,prefix:'hero-thai-v116'},
    {id:'thai-varsity',hero:'thai',zh:'CHANINDA · 社团棒球服',th:'CHANINDA · แจ็กเก็ตชมรม',price:90,prefix:'chaninda-varsity-v125'}
  ].map(o=>Object.freeze({...o,frames:Object.freeze(Object.fromEntries(poses.map(p=>[p,'./assets/game/'+o.prefix+'-'+p+'.webp'])))})));
  const directions=['zh-th','th-zh'];
  const taskIds=['first-sound','market-label','ferry-parcel','restore-ink','book-message','reply'];
  const defaultOutfit=h=>h+'-campus';
  const validReceipt=id=>/^(zh-th|th-zh):clear:[a-z0-9-]{1,70}$/.test(id)||directions.some(d=>taskIds.some(t=>id===d+':story:'+t));
  function normalize(value) {
    const v=value&&typeof value==='object'?value:{};
    const receipts=[...new Set(Array.isArray(v.receipts)?v.receipts:[])].filter(id=>typeof id==='string'&&validReceipt(id)).slice(0,600);
    const earned=receipts.reduce((sum,id)=>sum+(id.includes(':clear:')?30:10),0);
    // Ownership is an ordered purchase ledger. A damaged balance cannot mint points.
    let spent=0;
    const purchases=[...new Set(Array.isArray(v.purchases)?v.purchases:[])].filter(id=>{
      const o=outfits.find(x=>x.id===id&&x.price>0);
      if(!o||spent+o.price>earned)return false;spent+=o.price;return true;
    });
    const owned=outfits.filter(o=>!o.price||purchases.includes(o.id)).map(o=>o.id);
    const equipped=Object.fromEntries(['chinese','thai'].map(hero=>[hero,outfits.some(o=>o.hero===hero&&o.id===v.equipped?.[hero]&&owned.includes(o.id))?v.equipped[hero]:defaultOutfit(hero)]));
    return {version:1,receipts,purchases,equipped,earned,spent,balance:earned-spent,owned};
  }
  function grant(value,dir,kind,ids) {
    const s=normalize(value);if(!directions.includes(dir)||!['clear','story'].includes(kind))return s;
    for(const id of Array.isArray(ids)?ids:[]) {
      const key=dir+':'+kind+':'+id;
      if(validReceipt(key)&&!s.receipts.includes(key))s.receipts.push(key);
    }
    return normalize(s);
  }
  function purchase(value,id) {
    const s=normalize(value),o=outfits.find(o=>o.id===id);
    if(!o)return {ok:false,reason:'unknown',state:s};
    if(s.owned.includes(id))return {ok:true,reason:'owned',state:s};
    if(s.balance<o.price)return {ok:false,reason:'balance',state:s};
    s.purchases.push(id);return {ok:true,reason:'purchased',state:normalize(s)};
  }
  function equip(value,id) {
    const s=normalize(value),o=outfits.find(o=>o.id===id);
    if(!o||!s.owned.includes(id))return {ok:false,reason:'locked',state:s};
    s.equipped[o.hero]=id;return {ok:true,reason:'equipped',state:normalize(s)};
  }
  function read() {try{return normalize(JSON.parse(root.HUILAISHI_STORAGE?.getItem(KEY)||'null'));}catch(_){return normalize(null);}}
  function transact(fn) {
    const before=read(),out=fn(before),next=out.state||out;
    if(out.ok===false)return out;
    const storage=root.HUILAISHI_STORAGE;
    try {
      if(!storage)throw Error('storage');
      const encoded=JSON.stringify(normalize(next));
      storage.setItem(KEY,encoded);
      if(storage.getItem(KEY)!==encoded)throw Error('readback');
      return {ok:true,reason:out.reason||'reward',state:normalize(next),added:next.earned-before.earned,durable:storage.persistent!==false};
    } catch(_) {return {ok:false,reason:'storage',state:before,added:0};}
  }
  function appearance(hero) {
    const s=read(),o=outfits.find(o=>o.id===s.equipped[hero]);
    const frames=o?Object.fromEntries(poses.map(p=>[p,root.XULONG_WORLD_ART?.[o.frames[p]]||o.frames[p]])):null;
    return o?{outfitId:o.id,art:frames.idle,frames}:null;
  }
  root.XULONG_CAMPUS_REWARDS=Object.freeze({key:KEY,poses,outfits,normalize,grant,purchase,equip,read,appearance,
    reconcile:(dir,kind,ids)=>transact(s=>grant(s,dir,kind,ids)),buy:id=>transact(s=>purchase(s,id)),wear:id=>transact(s=>equip(s,id))});
})(globalThis);
