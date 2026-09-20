// Appearance is independent of progression, equipment and language level.
export const HOME_THEMES=Object.freeze([
  {
    "id": "river-rift",
    "zh": "裂页河岸",
    "th": "ริมฝั่งรอยกระดาษ",
    "layout": "letters",
    "hero": [
      0.44,
      0.81,
      0.38
    ],
    "tag": [
      "中泰双世界 · 手绘纸景",
      "สองโลกบนฉากกระดาษ"
    ]
  },
  {
    "id": "open-letter",
    "zh": "对开的信",
    "th": "จดหมายสองหน้า",
    "layout": "book",
    "hero": [
      0.46,
      0.73,
      0.34
    ],
    "tag": [
      "中泰双世界 · 手绘纸景",
      "สองโลกบนฉากกระดาษ"
    ]
  },
  {
    "id": "bridge-stage",
    "zh": "半桥来信",
    "th": "จดหมายจากอีกฝั่ง",
    "layout": "bridge",
    "hero": [
      0.48,
      0.81,
      0.37
    ],
    "tag": [
      "中泰双世界 · 手绘纸景",
      "สองโลกบนฉากกระดาษ"
    ]
  },
  {
    "id": "curtain-city",
    "zh": "开幕，入城",
    "th": "เปิดม่านเข้าเมือง",
    "layout": "curtain",
    "hero": [
      0.44,
      0.82,
      0.39
    ],
    "tag": [
      "中泰双世界 · 手绘纸景",
      "สองโลกบนฉากกระดาษ"
    ]
  },
  {
    "id": "post-dock",
    "zh": "信使码头",
    "th": "ท่าเรือส่งจดหมาย",
    "layout": "post",
    "hero": [
      0.45,
      0.8,
      0.37
    ],
    "tag": [
      "中泰双世界 · 手绘纸景",
      "สองโลกบนฉากกระดาษ"
    ]
  },
  {
    "id": "campus-wings",
    "zh": "双城课后",
    "th": "หลังเลิกเรียนสองเมือง",
    "layout": "campus",
    "hero": [
      0.46,
      0.79,
      0.35
    ],
    "tag": [
      "中泰双世界 · 手绘纸景",
      "สองโลกบนฉากกระดาษ"
    ]
  },
  {
    "id": "night-rift",
    "zh": "暮色回声",
    "th": "เสียงสะท้อนยามค่ำ",
    "layout": "night",
    "hero": [
      0.43,
      0.81,
      0.4
    ],
    "tag": [
      "中泰双世界 · 手绘纸景",
      "สองโลกบนฉากกระดาษ"
    ]
  },
  {
    "id": "day-paper",
    "zh": "晴空纸境",
    "th": "โลกกระดาษใต้ฟ้าใส",
    "layout": "day",
    "hero": [
      0.43,
      0.81,
      0.39
    ],
    "tag": [
      "中泰双世界 · 手绘纸景",
      "สองโลกบนฉากกระดาษ"
    ]
  },
  {
    "id": "letter-window",
    "zh": "窗外是你",
    "th": "เธออยู่นอกหน้าต่าง",
    "layout": "window",
    "hero": [
      0.4,
      0.84,
      0.45
    ],
    "tag": [
      "中泰双世界 · 手绘纸景",
      "สองโลกบนฉากกระดาษ"
    ]
  },
  {
    "id": "journey-stage",
    "zh": "下一幕，向你",
    "th": "ฉากต่อไป ไปหาเธอ",
    "layout": "journey",
    "hero": [
      0.45,
      0.75,
      0.36
    ],
    "tag": [
      "中泰双世界 · 手绘纸景",
      "สองโลกบนฉากกระดาษ"
    ]
  }
].map(Object.freeze));
export const ORIGINAL_HOME=Object.freeze({id:'original',zh:'原版河畔',th:'ริมคลองแบบเดิม',tag:['熟悉的出发地','จุดเริ่มต้นที่คุ้นเคย'],hero:[.47,.84,.315],layout:'original'});
export function homeTheme(id){return HOME_THEMES.find(t=>t.id===id)||ORIGINAL_HOME;}
export function sanitizeHomeTheme(id){return homeTheme(id).id;}
export function themePlate(id,world){const t=homeTheme(id);return t.id==='original'?null:'./assets/home-themes/'+(world==='cn'?'cn':'th')+'-'+t.id+'-v1.webp';}
export function themeThumbnail(id,world){const t=homeTheme(id);return t.id==='original'?null:'./assets/home-themes/'+(world==='cn'?'cn':'th')+'-'+t.id+'-preview.jpg';}
export function adjacentTheme(id,direction){const all=[ORIGINAL_HOME,...HOME_THEMES],i=all.findIndex(t=>t.id===sanitizeHomeTheme(id));return all[(i+(direction<0?-1:1)+all.length)%all.length].id;}
export function setHomeTheme(save,id){if(!save?.settings||sanitizeHomeTheme(id)!==id)return false;save.settings.homeTheme=id;return true;}
