export const APP_ID = "com.xulong.pasa.adventure";
export const SAVE_KEY = "xulong.adventure.save.v1";
export const SCHEMA = 1;
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const freshWorld = () => ({
  chapter: 0,
  stage: 0,
  cleared: [],
  mastery: {},
  letters: [],
  encountered: [],
});
export function freshSave() {
  return {
    schema: SCHEMA,
    world: "th",
    intro: false,
    points: 0,
    earned: [],
    outfits: ["explorer", "varsity"],
    equipped: { th: "explorer", cn: "varsity" },
    worlds: { th: freshWorld(), cn: freshWorld() },
    settings: {
      music: false,
      motion: true,
      networkVoice: false,
      speechRate: 0.88,
    },
  };
}
export function sanitizeSave(raw) {
  const base = freshSave();
  if (!raw || raw.schema !== SCHEMA) return base;
  base.world = raw.world === "cn" ? "cn" : "th";
  base.intro = raw.intro === true;
  base.points = clamp(Math.floor(Number(raw.points) || 0), 0, 1e7);
  base.earned = Array.isArray(raw.earned)
    ? [...new Set(raw.earned.filter((x) => typeof x === "string"))].slice(
        0,
        12000,
      )
    : [];
  base.outfits = Array.isArray(raw.outfits)
    ? [
        ...new Set([
          ...base.outfits,
          ...raw.outfits.filter((x) =>
            ["explorer", "varsity", "denim", "linen"].includes(x),
          ),
        ]),
      ]
    : base.outfits;
  for (const world of ["th", "cn"]) {
    const a = raw.worlds?.[world] || {};
    base.worlds[world] = {
      chapter: clamp(Math.floor(Number(a.chapter) || 0), 0, 7),
      stage: clamp(Math.floor(Number(a.stage) || 0), 0, 2),
      cleared: Array.isArray(a.cleared)
        ? a.cleared.filter((x) => typeof x === "string").slice(0, 100)
        : [],
      letters: Array.isArray(a.letters)
        ? a.letters.filter((x) => Number.isInteger(x) && x >= 0 && x < 8)
        : [],
      encountered: Array.isArray(a.encountered)
        ? a.encountered.filter((x) => typeof x === "string").slice(0, 100)
        : [],
      mastery: {},
    };
    if (a.mastery && typeof a.mastery === "object")
      for (const [id, m] of Object.entries(a.mastery).slice(0, 12000)) {
        if (/^[a-z0-9:-]+$/i.test(id) && m && typeof m === "object")
          base.worlds[world].mastery[id] = {
            seen: clamp(Number(m.seen) || 0, 0, 99999),
            correct: clamp(Number(m.correct) || 0, 0, 99999),
            streak: clamp(Number(m.streak) || 0, 0, 999),
            due: Math.max(0, Number(m.due) || 0),
            last: Number(m.last) || 0,
          };
      }
    base.equipped[world] = base.outfits.includes(raw.equipped?.[world]) &&
      (world === 'th' ? ['explorer','denim'] : ['varsity','linen']).includes(raw.equipped?.[world])
      ? raw.equipped[world]
      : base.equipped[world];
  }
  base.settings = {
    music: raw.settings?.music === true,
    motion: raw.settings?.motion !== false,
    networkVoice: raw.settings?.networkVoice === true,
    speechRate: clamp(Number(raw.settings?.speechRate) || 0.88, 0.65, 1.05),
  };
  return base;
}
export function loadSave(storage) {
  try {
    return sanitizeSave(JSON.parse(storage.getItem(SAVE_KEY) || "null"));
  } catch {
    return freshSave();
  }
}
export function persistSave(storage, save) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}
export function normalized(text) {
  return String(text || "")
    .normalize("NFC")
    .toLocaleLowerCase()
    .replace(/[\s.,!?，。！？、：:;；"'“”‘’()（）-]/gu, "");
}
export function matchSpeech(spoken, expected) {
  const a = normalized(spoken),
    b = normalized(expected);
  return {
    matched: !!a && a === b,
    heard: String(spoken || ""),
    expected: String(expected || ""),
    kind: "transcript-match",
  };
}
export function noteAnswer(
  save,
  world,
  id,
  correct,
  assisted = false,
  now = Date.now(),
) {
  const m = save.worlds[world].mastery[id] || {
    seen: 0,
    correct: 0,
    streak: 0,
    due: 0,
    last: 0,
  };
  m.seen++;
  m.last = now;
  if (correct && !assisted) {
    m.correct++;
    m.streak++;
    m.due =
      now +
      [120000, 600000, 86400000, 259200000, 604800000][
        Math.min(m.streak - 1, 4)
      ];
  } else {
    m.streak = 0;
    m.due = now + 60000;
  }
  save.worlds[world].mastery[id] = m;
  return m;
}
export function completeEncounter(save, world, chapter, stage) {
  if (!['th','cn'].includes(world) || !canEnter(save,world,chapter,stage))
    return {points:0,firstClear:false,chapterComplete:false,invalid:true};
  const id = world + ":" + chapter + ":" + stage,
    w = save.worlds[world];
  let points = 0;
  if (!save.earned.includes(id)) {
    points = stage === 2 ? 72 : stage === 1 ? 48 : 36;
    save.points += points;
    save.earned.push(id);
  }
  if (!w.cleared.includes(id)) w.cleared.push(id);
  if (stage === 2 && !w.letters.includes(chapter)) w.letters.push(chapter);
  if (chapter === w.chapter && stage === w.stage) {
    if (stage < 2) w.stage++;
    else if (chapter < 7) {
      w.chapter++;
      w.stage = 0;
    }
  }
  return { points, firstClear: points > 0, chapterComplete: stage === 2, finale: chapter === 7 && stage === 2 };
}
export function campaignComplete(save, world) {
  return save.worlds[world]?.cleared.includes(world+':7:2') === true;
}
export function completePractice(save,world,ids) {
  if(!['th','cn'].includes(world))return {points:0};
  let points=0;
  for(const id of [...new Set(ids)].slice(0,12)){
    if(!/^[a-z0-9-]{1,70}$/i.test(id))continue;
    const key='practice:'+world+':'+id;
    if(!save.earned.includes(key)){save.earned.push(key);points++;}
  }
  save.points+=points;return {points,firstClear:points>0};
}
export function completeCampaignCount(save,world) {
  return new Set(save.worlds[world].cleared.filter(id=>new RegExp('^'+world+':[0-7]:[0-2]$').test(id))).size;
}
export function buyOutfit(save, id, cost = 108) {
  if (!["denim", "linen"].includes(id) || cost !== 108)
    return { ok: false, reason: "invalid" };
  if (save.outfits.includes(id)) return { ok: true, alreadyOwned: true };
  if (save.points < cost) return { ok: false, reason: "insufficient" };
  save.points -= cost;
  save.outfits.push(id);
  return { ok: true };
}
export function shuffled(values, rng = Math.random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function battleStats(chapter, stage) {
  return {
    hp: 110 + chapter * 8,
    enemyHp: 145 + chapter * 20 + stage * 75,
    baseDamage: 22 + chapter * 2,
    penalty: 12 + stage * 3,
    time: Math.max(12, 18 + chapter * 3 + stage * 2),
    shield: stage === 1 ? 22 : stage === 2 ? 38 : 0,
  };
}
export function damageFor({
  chapter = 0,
  combo = 0,
  elapsed = 15,
  limit = 18,
  assisted = false,
  stance = "steady",
}) {
  const base = 22 + chapter * 2;
  const speed = assisted ? 0 : clamp(1 - elapsed / limit, 0, 1) * 10;
  return Math.round(
    (base + speed) *
      (1 + Math.min(combo, 5) * 0.055) *
      (stance === "quick" ? 1.14 : stance === "guard" ? 0.78 : 1),
  );
}
export function dueWords(save, world, now = Date.now()) {
  return Object.entries(save.worlds[world].mastery)
    .filter(([, m]) => m.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id);
}
export function canEnter(save, world, chapter, stage = 0) {
  if (
    !Number.isInteger(chapter) ||
    chapter < 0 ||
    chapter > 7 ||
    !Number.isInteger(stage) ||
    stage < 0 ||
    stage > 2
  )
    return false;
  const w = save.worlds[world];
  return chapter < w.chapter || (chapter === w.chapter && stage <= w.stage);
}
