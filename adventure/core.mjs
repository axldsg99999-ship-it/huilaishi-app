import {sanitizeHomeTheme} from './assets/home-themes/catalog.mjs?v=0.4.1';
import {tutorialStatus} from './assets/onboarding/tutorial.mjs?v=0.4.1';
export const APP_ID = "com.xulong.pasa.adventure";
export const SAVE_KEY = "xulong.adventure.save.v1";
export const SCHEMA = 1;
// Locate the one mistranslated seal, then repair it. The donor is outside the
// displayed rows, so duplicated labels cannot give the error away visually.
export function makeProof(units,anchor,rng=Math.random) {
  const pool=makeConnections(units,anchor,3,rng).units;
  if(pool.length!==3||pool[0].id!==anchor?.id)return null;
  const [target,valid,donor]=pool;
  return {target:target.id,rows:shuffled([{source:target,printed:donor},{source:valid,printed:valid}],rng),choices:shuffled(pool,rng),phase:'locate',committed:false};
}
export function inspectProof(proof,index) {
  if(!proof||proof.committed||proof.phase!=='locate'||!Number.isInteger(index)||!proof.rows[index])return {kind:'ignored'};
  if(proof.rows[index].source.id!==proof.target){proof.committed=true;return {kind:'wrong'};}
  proof.phase='mend';return {kind:'located'};
}
export function mendProof(proof,id) {
  if(!proof||proof.committed||proof.phase!=='mend'||!proof.choices.some(u=>u.id===id))return {kind:'ignored'};
  proof.committed=true;return {kind:id===proof.target?'complete':'wrong'};
}
// Meaning -> sound: all alternatives are actual bilingual lessons, never
// invented phonetic distractors. Only the requested meaning is assessed.
export function makeSoundHunt(units,anchor,rng=Math.random) {
  const board=makeConnections(units,anchor,3,rng);
  if(board.units.length!==3||!board.units.some(u=>u.id===anchor?.id))return null;
  return {target:anchor.id,choices:shuffled(board.units,rng),heard:[],selected:null,committed:false};
}
export function markHuntHeard(hunt,index) {
  if(!hunt||!Number.isInteger(index)||!hunt.choices[index]||hunt.committed)return {valid:false};
  const replay=hunt.heard.includes(index);if(!replay)hunt.heard.push(index);
  return {valid:true,replay,ready:hunt.heard.length===hunt.choices.length};
}
export function submitSoundHunt(hunt,revealed=false) {
  if(!hunt||hunt.committed||!Number.isInteger(hunt.selected)||!hunt.choices[hunt.selected]||!revealed&&hunt.heard.length!==hunt.choices.length)return {valid:false};
  hunt.committed=true;
  return {valid:true,correct:hunt.choices[hunt.selected].id===hunt.target,id:hunt.target};
}
export function makeListeningChain(units, anchor, rng = Math.random) {
  const board=makeConnections(units,anchor,3,rng);
  if(board.units.length<3)return null;
  return {units:board.units.slice(0,2),choices:shuffled(board.units,rng),order:[]};
}
function supportsCloze(unit,world) {
  const parts=unit?.segments?.[world];
  return Array.isArray(parts)&&parts.length>=3&&new Set(parts.map(normalized)).size>=3;
}
export function unitForChallenge(queue,index,mode,world) {
  if(!queue?.length)return null;
  // Search cyclically within authored units only; never manufacture sentence
  // chunks to satisfy a mechanic. Other skills preserve the scheduled unit.
  for(let offset=0;offset<queue.length;offset++){
    const unit=queue[((index+offset)%queue.length+queue.length)%queue.length];
    if(mode==='cloze'?!supportsCloze(unit,world):mode==='sequence'&&!(unit?.segments?.[world]?.length>1))continue;
    return unit;
  }
  return null;
}
export function makeCloze(unit,world,rng=Math.random) {
  if(!supportsCloze(unit,world))return null;
  const parts=unit.segments[world];
  const missing=Math.floor(parts.length/2),text=parts[missing];
  const alternatives=shuffled(parts.filter(p=>normalized(p)!==normalized(text)),rng)
    .filter((p,i,a)=>a.findIndex(x=>normalized(x)===normalized(p))===i).slice(0,2);
  return {parts,missing,choices:shuffled([text,...alternatives],rng)};
}
export function craftPhase(b) {
  return b.monster.craft?.second && b.shield === 0 ? 1 : 0;
}
// Market baskets use two different checks, not two repeats of the same task.
// Text assistance can open a clasp; mastery is recorded separately by skill.
export function eliteArmorStep(b,correct) {
  const state={shield:b.shield,armorStreak:b.armorStreak||0,armorMarks:[...(b.armorMarks||[])]};
  if(b.rank!==1||b.shield<=0)return state;
  if(b.monster.armorRule==='market-baskets'){
    if(!correct)return state; // Keep earned understanding; the miss still costs HP.
    const mark=b.mode==='reply'?'courtesy':['listen','pairs','hunt','chain'].includes(b.mode)?'meaning':null;
    if(mark&&!state.armorMarks.includes(mark))state.armorMarks.push(mark);
    if(['meaning','courtesy'].every(m=>state.armorMarks.includes(m)))state.shield=0;
    return state;
  }
  state.armorStreak=correct?(['pairs','proof'].includes(b.mode)?2:state.armorStreak+1):0;
  if(state.armorStreak>=2)state.shield=0;
  return state;
}
export function selectChallenge(b) {
  if(b.practice?.campus && b.turn>1){const cycle=b.practice.trial?b.monster.trialCycle:b.practice.campus.cycle;return cycle[(b.turn-2)%cycle.length];}
  const boss=b.monster.boss;
  if(!b.practice&&b.monster.craft&&b.turn>1){
    const p=b.monster.craft,cycle=craftPhase(b)?p.second:p.first;
    // A broken shield starts the new routine at its first authored challenge.
    // The phase origin belongs to this encounter, never to the saved player.
    return cycle[Math.max(0,b.turn-(b.craftStartTurn||2))%cycle.length];
  }
  if(!b.practice&&b.monster.hunt&&b.turn>1&&b.turn%2===0)return 'hunt';
  // A boss uses its own cycle. The first round remains a familiar single cue.
  if(boss&&b.turn>1){
    const phase=b.enemyHp<=b.stats.enemyHp/2?1:0;
    const cycle=phase?boss.second:boss.first;
    return cycle[(b.turn-2)%cycle.length];
  }
  return b.sequence?'sequence':'listen';
}
// A connection is identified by the lesson ID, never by a translated label.
// Deduplicate both languages so a board cannot contain ambiguous endpoints.
export function makeConnections(units, anchor, count = 3, rng = Math.random) {
  const seenZh = new Set(), seenTh = new Set(), seenId = new Set();
  const chosen = [anchor, ...shuffled(units, rng)].filter(u => {
    if (!u?.id || !u.zh || !u.th) return false;
    const zh = normalized(u.zh), th = normalized(u.th);
    if (seenZh.has(zh) || seenTh.has(th) || seenId.has(u.id)) return false;
    seenZh.add(zh); seenTh.add(th); seenId.add(u.id); return true;
  }).slice(0, Math.max(2, Math.min(3, count)));
  return {units: chosen, left: shuffled(chosen, rng), right: shuffled(chosen, rng), linked: [], selected: null};
}
export function connectWord(board, side, id) {
  if (!board || !['left','right'].includes(side) || !board[side].some(u=>u.id===id) || board.linked.includes(id)) return {kind:'ignored'};
  if (!board.selected || board.selected.side === side) {
    board.selected = board.selected?.id === id ? null : {side,id};
    return {kind:'selected'};
  }
  const from = board.selected.id; board.selected = null;
  if (from !== id) return {kind:'wrong', id:from, other:id};
  board.linked.push(id);
  return {kind:board.linked.length===board.units.length?'complete':'linked',id};
}
// Repeating the target language earns time, never damage or vocabulary mastery.
export function awardEcho(battle, transcript, target) {
  if (!battle || battle.echoEarned || !matchSpeech(transcript, target).matched) return false;
  battle.echoEarned = true;
  battle.nextTimeBonus = 2;
  return true;
}
export function takeEchoTime(battle) {
  const bonus = battle.nextTimeBonus === 2 ? 2 : 0;
  battle.nextTimeBonus = 0;
  battle.echoEarned = false;
  return bonus;
}
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const freshWorld = () => ({
  chapter: 0,
  stage: 0,
  cleared: [],
  mastery: {},
  letters: [],
  encountered: [],
  discoveries: [],
  errands: [],
  campus: [],
  campusTrials: [],
});
export function freshSave() {
  return {
    schema: SCHEMA,
    world: "th",
    intro: false,
    worldChosen: false,
    onboarding: {th:'new',cn:'new'},
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
      homeTheme: 'river-rift',
    },
  };
}
export function sanitizeSave(raw) {
  const base = freshSave();
  if (!raw || raw.schema !== SCHEMA) return base;
  base.world = raw.world === "cn" ? "cn" : "th";
  base.intro = raw.intro === true;
  // Saves made before the illustrated opening already selected a world.
  base.worldChosen = typeof raw.worldChosen==='boolean'?raw.worldChosen:base.intro;
  base.onboarding={th:tutorialStatus(raw,'th'),cn:tutorialStatus(raw,'cn')};
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
      discoveries: Array.isArray(a.discoveries)
        ? [...new Set(a.discoveries.filter(x=>typeof x==='string' && new RegExp('^'+world+'-field-[0-7]$').test(x)))].slice(0,8)
        : [],
      errands: Array.isArray(a.errands) && a.errands.includes(world+'-supplies') ? [world+'-supplies'] : [],
      campus: Array.isArray(a.campus)?[...new Set(a.campus.filter(x=>['gate','dorm','academy','classroom','sports'].includes(x)))]:[],
      campusTrials: Array.isArray(a.campusTrials)?[...new Set(a.campusTrials.filter(x=>x===(world==='th'?'campus-takraw-bear':'campus-paper-carp')))]:[],
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
            skills: Object.fromEntries(['listening','reading','sequence'].map(k=>[k,{
              seen: clamp(Number(m.skills?.[k]?.seen)||0,0,99999),
              correct: clamp(Number(m.skills?.[k]?.correct)||0,0,99999),
            }])),
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
    homeTheme: sanitizeHomeTheme(raw.settings?.homeTheme),
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
  skill = 'listening',
) {
  const m = save.worlds[world].mastery[id] || {
    seen: 0,
    correct: 0,
    streak: 0,
    due: 0,
    last: 0,
  };
  m.seen++;
  if (!['listening','reading','sequence'].includes(skill)) skill = 'listening';
  m.skills ||= {};
  m.skills[skill] ||= {seen:0, correct:0};
  m.skills[skill].seen++;
  if (correct && !assisted) m.skills[skill].correct++;
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

// A recovery lesson is not a mastery judgment or a second reward source.
// Only this encounter's distinct mistakes are eligible; no save is mutated.
export function makeRevival(b, rng = Math.random) {
  if (!b || b.hp > 0 || b.enemyHp <= 0 || b.reviveUsed) return null;
  const units = [...new Map([...(b.mistakes?.values() || [])].map(u => [u.id, u])).values()].slice(-3);
  if (!units.length) return null;
  const target = u => b.world === 'th' ? u.th : u.zh;
  const source = u => b.world === 'th' ? u.zh : u.th;
  const pool = [...units, ...b.queue];
  const cards = units.map(unit => {
    const used = new Set([normalized(target(unit))]);
    const alternatives = pool.filter(u => {
      const text = normalized(target(u));
      if (used.has(text) || normalized(source(u)) === normalized(source(unit))) return false;
      used.add(text); return true;
    });
    return {unit, choices: shuffled([unit, ...shuffled(alternatives, rng).slice(0, 2)], rng)};
  });
  if (cards.some(c => c.choices.length < 2)) return null;
  return {cards, index: 0, phase: 'intro', wrong: 0, completed: false};
}
export function advanceRevival(r) {
  if (!r || r.completed) return false;
  if (r.phase === 'intro') {r.phase = 'review'; return true;}
  if (r.phase === 'repair') {r.phase = 'challenge'; return true;}
  if (r.phase !== 'review') return false;
  if (++r.index >= r.cards.length) {r.index = 0; r.phase = 'challenge';}
  return true;
}
export function answerRevival(r, id) {
  if (!r || r.phase !== 'challenge' || r.completed) return 'ignored';
  const card = r.cards[r.index];
  if (!card.choices.some(u => u.id === id)) return 'ignored';
  if (card.unit.id !== id) {r.wrong++; r.phase = 'repair'; return 'wrong';}
  if (++r.index === r.cards.length) {r.phase = 'complete'; return 'complete';}
  return 'correct';
}
export function applyRevival(b) {
  const r = b?.revival;
  if (!r || r.phase !== 'complete' || r.completed || b.reviveUsed || b.hp > 0 || b.enemyHp <= 0) return false;
  r.completed = true; b.reviveUsed = true;
  b.hp = Math.max(1, Math.ceil(b.stats.hp * .5)); b.combo = 0;
  b.interruptReady = false; b.nextTimeBonus = 0; b.echoEarned = false;
  b.relayWords = [];
  b.returnReady = false; b.returnBoost = false;
  return true;
}
export function campusStrike(b, correct, amount) {
  if(!b.monster.campusRule)return amount;
  const ids=b.response?.units?.map(u=>u.id)||[b.unit.id];
  if(b.monster.campusRule==='rally-return'){
    b.returnBoost=false;
    if(!correct){b.returnReady=false;return amount;}
    if(b.speechAnswer)return amount; // Echo practice never awards a hit.
    if(b.stance==='guard'){b.returnReady=true;return amount;}
    if(b.returnReady){b.returnReady=false;b.returnBoost=true;return Math.round(amount*1.4);}
    return amount;
  }
  if(b.monster.campusRule==='sentence-seal'){
    b.sentenceMarks ||= [];
    if(correct&&!b.speechAnswer&&['cloze','sequence'].includes(b.mode)&&!b.sentenceMarks.includes(b.mode))b.sentenceMarks.push(b.mode);
    if(b.sentenceMarks.length===2)b.shield=0;
    return amount;
  }
  if(b.monster.campusRule==='recall-seal'){
    b.sealWords ||= [];
    // Reading assistance can progress; it remains assisted in mastery. A
    // unavailable voice engine must never make this shield impossible to open.
    if(correct&&!b.speechAnswer)for(const id of ids)if(!b.sealWords.includes(id))b.sealWords.push(id);
    if(b.sealWords.length>=2)b.shield=0;
    return amount;
  }
  if(b.monster.campusRule!=='relay')return amount;
  b.relayWords ||= [];
  b.relayBoost=false;
  if(!correct){b.relayWords=[];return amount;}
  if(!b.assisted&&!b.speechAnswer){for(const id of ids)if(!b.relayWords.includes(id))b.relayWords.push(id);}
  if(b.relayWords.length>=3){b.relayWords=[];b.relayBoost=true;return Math.round(amount*1.3);}
  return amount;
}
