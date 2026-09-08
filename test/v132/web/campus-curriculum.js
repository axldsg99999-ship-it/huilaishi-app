(function (root) {
  "use strict";
  // IDs refer to the existing corpus. No generated examples or unreviewed tone
  // transcriptions are promoted to an approved curriculum by this manifest.
  const lessons = Object.freeze([
    { id: "wok-crab", zh: "食堂碰面", th: "เจอกันที่โรงอาหาร", ids: ["l1-034", "l1-071", "l1-041"], sceneZh: "在食堂，先认出水、饭和吃。", sceneTh: "ที่โรงอาหาร เริ่มจากคำว่า น้ำ ข้าว และกิน" },
    { id: "tuk-gecko", zh: "一起出发", th: "ออกเดินทางด้วยกัน", ids: ["l1-043", "l1-044", "l1-045"], sceneZh: "出发、招呼朋友过来，再回去。", sceneTh: "ฝึกคำว่า ไป มา และกลับ" },
    { id: "umbrella-hornbill", zh: "约好时间", th: "นัดเวลากัน", ids: ["l1-174", "l1-175", "l1-176"], sceneZh: "分清今天、明天和昨天。", sceneTh: "แยกให้ออกระหว่าง วันนี้ พรุ่งนี้ และเมื่อวาน" },
    { id: "backpack-buffalo", zh: "整理书包", th: "จัดกระเป๋า", ids: ["l1-037", "l1-201", "l1-202"], sceneZh: "带上包、书和笔，准备下一堂课。", sceneTh: "เตรียมกระเป๋า หนังสือ และปากกาสำหรับคาบต่อไป" },
    { id: "chalk-tokay", zh: "认识同伴", th: "รู้จักคนรอบตัว", ids: ["l1-010", "l1-020", "l1-021"], sceneZh: "在校园里认识朋友、老师和学生。", sceneTh: "รู้จักคำว่า เพื่อน ครู และนักเรียน" },
    { id: "lantern", zh: "课后大集合", th: "รวมพลหลังเลิกเรียน", ids: [], sceneZh: "BOSS 会混合前五站的 15 个词，不加新词。", sceneTh: "บอสจะทดสอบ 15 คำจากห้าด่านก่อนหน้า โดยไม่มีคำใหม่" }
  ].map(lesson => Object.freeze({ ...lesson, ids: Object.freeze(lesson.ids) })));

  function encounter(pool, index) {
    if (!Number.isInteger(index) || index < 0 || index >= lessons.length) return null;
    const lesson = lessons[index];
    const byId = new Map((Array.isArray(pool) ? pool : []).filter(word => word?.id && word.zh && word.th && Number(word.level) === 1).map(word => [word.id, word]));
    const previousIds = lessons.slice(0, index).flatMap(item => item.ids);
    const ids = lesson.ids.length ? lesson.ids : previousIds;
    if (!ids.length || [...ids, ...previousIds].some(id => !byId.has(id))) return null;
    const words = ids.map(id => byId.get(id));
    return { ...lesson, words, previous: previousIds.map(id => byId.get(id)), preview: lesson.ids.length ? words : [words[0], words[7], words[14]], final: index === 5 };
  }

  function battleWord(pool, index, round = 0) {
    const lesson = encounter(pool, index);
    if (!lesson) return null;
    const turn = Number.isFinite(Number(round)) ? Math.max(0, Math.floor(Number(round))) : 0;
    // Teach all three new words before interleaving any previous-stage recall.
    if (!lesson.final && turn < 3) return lesson.words[turn];
    if (!lesson.final && lesson.previous.length) {
      const offset = turn - 3;
      if (offset % 3 === 2) return lesson.previous[Math.floor(offset / 3) % lesson.previous.length];
      return lesson.words[(Math.floor(offset / 3) * 2 + offset % 3) % lesson.words.length];
    }
    return lesson.words[turn % lesson.words.length];
  }

  const world = Object.freeze({
    zh: "散页之城", th: "เมืองหน้ากระดาษที่กระจัดกระจาย",
    originZh: "小艾和 CHANINDA 在音浪节前夜被失语风暴分隔到两座城。她留下的声音化成声页，藏进锅铲、书包与纸灯。校园声斗赛是找回这些留言的第一段旅程。",
    originTh: "คืนก่อนเทศกาลเสียง พายุไร้ภาษาแยก CHANINDA กับ小艾ไปคนละเมือง ข้อความของคนรักกลายเป็นหน้ากระดาษเสียงที่ซ่อนในของใช้ ศึกเสียงในรั้วโรงเรียนคือการเดินทางตามหาข้อความเหล่านั้น",
    goalZh: "跟随恋人留下的回声，听懂纸怪的暗号，找回六张声页，重新点亮河畔舞台。跨界合击是回声的投影：你们尚未重逢，却能为彼此出招。",
    goalTh: "ตามเสียงสะท้อนของคนรัก ฟังรหัสของมอนสเตอร์ เก็บหน้ากระดาษเสียงหกแผ่น แล้วจุดเวทีริมแม่น้ำอีกครั้ง ท่าคู่คือภาพจากเสียงสะท้อน แม้ยังไม่พบกันก็ช่วยกันต่อสู้ได้",
    areas: Object.freeze([
      ["失控校园", "วิทยาเขตวุ่นวาย", "找回食堂与教室的声页", "ตามหาหน้ากระดาษเสียงในโรงอาหารและห้องเรียน"],
      ["莲火夜市", "ตลาดบัวไฟ", "追上混入夜市的纸怪", "ตามมอนสเตอร์ที่แฝงตัวในตลาด"],
      ["风筝渡口", "ท่าเรือว่าว", "把失散的声页带过河", "พาหน้ากระดาษเสียงข้ามแม่น้ำ"],
      ["雷鸣工坊", "โรงงานสายฟ้า", "让停摆的节庆工坊恢复运转", "ทำให้โรงงานเทศกาลกลับมาทำงาน"],
      ["墨色书街", "ถนนหนังสือหมึก", "寻回被墨迹藏住的舞台手记", "ตามหาสมุดเวทีที่ซ่อนอยู่ในรอยหมึก"],
      ["双铃舞台", "เวทีระฆังคู่", "敲响双铃，让音浪节开场", "สั่นระฆังคู่เพื่อเริ่มเทศกาลเสียง"]
    ].map(row => Object.freeze({ zh: row[0], th: row[1], goalZh: row[2], goalTh: row[3] })))
  });
  root.HUILAISHI_CAMPUS_CURRICULUM = Object.freeze({ version: 1, reviewStatus: "native-review-pending", lessons, encounter, battleWord, world });
})(globalThis);
