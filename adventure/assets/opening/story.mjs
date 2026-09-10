// Bilingual, authored opening. No gameplay/progress or network side effects.
export const OPENING_SCENES = Object.freeze([
 {id:'promise',title:['同一张纸上的约定','คำสัญญาบนกระดาษแผ่นเดียว'],
  body:['小艾与 CHANINDA 是一对恋人。放学后的河畔，他们写下一份约定：一起去看更远的世界。','Xiao Ai กับ CHANINDA เป็นคู่รักกัน หลังเลิกเรียน ทั้งสองเขียนคำสัญญาริมคลองว่า จะออกไปเห็นโลกกว้างด้วยกัน'],
  art:'opening/promise-v1.webp',alt:['两位恋人在河畔一起折好一封信。','คู่รักพับจดหมายด้วยกันที่ริมคลอง']},
 {id:'separation',title:['风把世界撕成两半','เมื่อลมฉีกโลกออกเป็นสองฝั่ง'],
  body:['突如其来的风暴撕开信纸。小艾落入说泰语的河城，CHANINDA 来到说中文的墨城；他们各自握着半封信。','พายุฉีกจดหมาย Xiao Ai ตกลงในเมืองสายน้ำที่พูดภาษาไทย ส่วน CHANINDA ไปอยู่เมืองหมึกที่พูดภาษาจีน แต่ละคนถือจดหมายไว้ครึ่งหนึ่ง'],
  art:'opening/separation-v1.webp',alt:['纸页裂隙隔开两位伸手相望的恋人。','รอยฉีกของกระดาษแยกคู่รักที่ยื่นมือหากัน']},
 {id:'language',title:['这里，语言能唤醒信纸','ที่นี่ ภาษาปลุกจดหมายให้ตื่น'],
  body:['两座城的声音被困在守信者身上。听懂它们的话、学会新的表达，便能找回散落的纸页，让信送到对方手里。','เสียงของสองเมืองติดอยู่กับเหล่าผู้พิทักษ์จดหมาย ฟังให้เข้าใจ เรียนรู้คำใหม่ แล้วตามหาหน้ากระดาษที่หายไป เพื่อส่งจดหมายถึงคนรัก'],
  art:'home-themes/th-river-rift-v1.webp',alt:['泰国河城与中国墨城被同一道纸页裂隙连接。','เมืองสายน้ำและเมืองหมึกเชื่อมกันผ่านรอยฉีกของกระดาษ']},
 {id:'journey',title:['把下一句话，带到你身边','ส่งถ้อยคำต่อไปให้ถึงเธอ'],
  body:['从一声问候，到完整的一封信。每次听懂、每次开口，都让你更接近重逢。现在，选择你要走向的世界。','จากคำทักทายสั้น ๆ สู่จดหมายทั้งฉบับ ทุกครั้งที่ฟังเข้าใจและกล้าพูด เราก็ใกล้วันพบกันอีกนิด เลือกโลกที่จะออกเดินทางได้เลย'],
  art:'home-themes/th-journey-stage-v1.webp',alt:['通往河城的纸上舞台，等待旅人出发。','ฉากกระดาษที่ทอดสู่เมืองสายน้ำ รอผู้เดินทางออกเดินทาง']}
].map(Object.freeze));
export function openingPage(value) {const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(OPENING_SCENES.length-1,Math.trunc(n))):0}
export function openingLocale(value) {return String(value).toLowerCase().startsWith('th')?'th':'zh'}
export function startupRoute(save) {return !save.intro?'intro':save.worldChosen===false?'worlds':'home'}
