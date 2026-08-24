(function (root) {
  "use strict";

  const STORAGE_KEY = "huilaishi-battle-records-v1";
  const SCHEMA_VERSION = 1;
  const MAX_RECORDS = 30;
  const DEFAULT_RECENT_LIMIT = 10;
  const SUMMARY_RECENT_LIMIT = 5;
  const MAX_NAME_LENGTH = 18;
  const MAX_MODE_LENGTH = 24;
  const MAX_SCORE = 999999;
  const MAX_ANSWERED = 999;
  const MAX_TOTAL_MS = 86400000;
  const GRADES = new Set(["S5", "S4", "S3", "S2", "S1"]);
  const DIRECTIONS = new Set(["zh-th", "th-zh"]);
  const hasOwn = Function.call.bind(Object.prototype.hasOwnProperty);

  let injectedStorage;
  let lastError = null;

  function error(code) {
    lastError = code || null;
  }

  function ownValue(value, key) {
    if (!value || (typeof value !== "object" && typeof value !== "function")) return undefined;
    try { return hasOwn(value, key) ? value[key] : undefined; }
    catch (_) { return undefined; }
  }

  function safeText(value, maxLength, fallback = "") {
    let text;
    try { text = value == null ? "" : String(value); }
    catch (_) { text = ""; }
    try { text = text.normalize("NFC"); } catch (_) {}
    text = text.replace(/[\p{Cc}\p{Cf}]/gu, " ").replace(/\s+/gu, " ").trim();
    const clipped = Array.from(text).slice(0, maxLength).join("");
    return clipped || fallback;
  }

  function boundedInteger(value, maximum, fallback = 0) {
    let number;
    try { number = Number(value); } catch (_) { return fallback; }
    if (!Number.isFinite(number)) return fallback;
    return Math.min(maximum, Math.max(0, Math.trunc(number)));
  }

  function normalizeGrade(value) {
    const grade = safeText(value, 2).toUpperCase();
    return GRADES.has(grade) ? grade : "S4";
  }

  function normalizeDirection(value) {
    const direction = safeText(value, 5).toLowerCase();
    return DIRECTIONS.has(direction) ? direction : "zh-th";
  }

  function oppositeDirection(direction) {
    return direction === "th-zh" ? "zh-th" : "th-zh";
  }

  function defaultPlayerName(index, direction) {
    return `${direction === "th-zh" ? "ผู้เล่น" : "玩家"} ${index === 0 ? "A" : "B"}`;
  }

  function normalizeTime(value) {
    let timestamp = NaN;
    if (typeof value === "number") timestamp = value;
    else {
      const text = safeText(value, 64);
      if (/^\d+(?:\.\d+)?$/u.test(text)) timestamp = Number(text);
      else if (text) timestamp = Date.parse(text);
    }
    if (!Number.isFinite(timestamp) || timestamp < 0) {
      try { timestamp = Date.now(); } catch (_) { timestamp = 0; }
    }
    return Math.min(8640000000000000, Math.max(0, Math.trunc(timestamp)));
  }

  function normalizePlayer(value, index, direction) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const answered = boundedInteger(ownValue(value, "answered"), MAX_ANSWERED);
    return {
      name: safeText(ownValue(value, "name"), MAX_NAME_LENGTH, defaultPlayerName(index, direction)),
      score: boundedInteger(ownValue(value, "score"), MAX_SCORE),
      correct: Math.min(answered, boundedInteger(ownValue(value, "correct"), MAX_ANSWERED)),
      answered,
      totalMs: boundedInteger(ownValue(value, "totalMs"), MAX_TOTAL_MS)
    };
  }

  function matchTime(detail) {
    for (const key of ["playedAt", "timestamp", "time"]) {
      const value = ownValue(detail, key);
      if (value != null && value !== "") return normalizeTime(value);
    }
    return normalizeTime(undefined);
  }

  function normalizeMatch(detail) {
    if (!detail || typeof detail !== "object" || Array.isArray(detail)) return null;
    const rawPlayers = ownValue(detail, "players");
    if (!Array.isArray(rawPlayers) || rawPlayers.length < 2) return null;

    const direction = normalizeDirection(ownValue(detail, "direction"));
    const players = [
      normalizePlayer(rawPlayers[0], 0, direction),
      normalizePlayer(rawPlayers[1], 1, oppositeDirection(direction))
    ];
    if (!players[0] || !players[1]) return null;

    const tie = players[0].score === players[1].score;
    const winner = tie ? null : (players[0].score > players[1].score ? 0 : 1);
    return {
      mode: safeText(ownValue(detail, "mode"), MAX_MODE_LENGTH, "local-battle"),
      grade: normalizeGrade(ownValue(detail, "grade")),
      direction,
      playedAt: matchTime(detail),
      players,
      winner,
      winnerName: winner == null ? "" : players[winner].name,
      tie
    };
  }

  function copyRecord(record) {
    return {
      mode: record.mode,
      grade: record.grade,
      direction: record.direction,
      playedAt: record.playedAt,
      players: record.players.map(player => ({ ...player })),
      winner: record.winner,
      winnerName: record.winnerName,
      tie: record.tie
    };
  }

  function resolveStorage() {
    if (injectedStorage !== undefined) return { value: injectedStorage, source: "injected" };
    try {
      if (root.HUILAISHI_STORAGE) return { value: root.HUILAISHI_STORAGE, source: "HUILAISHI_STORAGE" };
    } catch (_) {
      error("storage-discovery-failed");
      return { value: null, source: "unavailable" };
    }
    try {
      if (root.localStorage) return { value: root.localStorage, source: "localStorage" };
    } catch (_) {
      error("storage-discovery-failed");
      return { value: null, source: "unavailable" };
    }
    return { value: null, source: "unavailable" };
  }

  function storageMethod(storage, name) {
    try {
      const method = storage?.[name];
      return typeof method === "function" ? method : null;
    } catch (_) { return null; }
  }

  function readRecords() {
    const resolved = resolveStorage();
    const storage = resolved.value;
    const getItem = storageMethod(storage, "getItem");
    if (!storage || !getItem) {
      error("storage-unavailable");
      return { ok: false, records: [], source: resolved.source };
    }

    let raw;
    try { raw = getItem.call(storage, STORAGE_KEY); }
    catch (_) {
      error("storage-read-failed");
      return { ok: false, records: [], source: resolved.source };
    }
    if (raw == null || raw === "") {
      error(null);
      return { ok: true, records: [], source: resolved.source };
    }

    let payload;
    try { payload = JSON.parse(String(raw)); }
    catch (_) {
      error("invalid-json");
      return { ok: true, records: [], source: resolved.source };
    }
    const rows = ownValue(payload, "records");
    if (!payload || typeof payload !== "object" || Array.isArray(payload)
      || ownValue(payload, "version") !== SCHEMA_VERSION || !Array.isArray(rows)) {
      error("invalid-payload");
      return { ok: true, records: [], source: resolved.source };
    }

    const records = rows.map(normalizeMatch).filter(Boolean).slice(-MAX_RECORDS);
    error(null);
    return { ok: true, records, source: resolved.source };
  }

  function writeRecords(records) {
    const resolved = resolveStorage();
    const storage = resolved.value;
    const setItem = storageMethod(storage, "setItem");
    if (!storage || !setItem) {
      error("storage-unavailable");
      return false;
    }
    try {
      setItem.call(storage, STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, records: records.slice(-MAX_RECORDS) }));
      error(null);
      return true;
    } catch (_) {
      error("storage-write-failed");
      return false;
    }
  }

  function normalizeLimit(value, fallback = DEFAULT_RECENT_LIMIT) {
    if (value === undefined) return fallback;
    return boundedInteger(value, MAX_RECORDS, 0);
  }

  function normalizedLookupName(value) {
    return safeText(value, MAX_NAME_LENGTH).toLowerCase();
  }

  function recentResult(record, playerIndex) {
    const player = record.players[playerIndex];
    const opponent = record.players[playerIndex === 0 ? 1 : 0];
    return {
      playedAt: record.playedAt,
      mode: record.mode,
      grade: record.grade,
      direction: record.direction,
      result: record.tie ? "tie" : (record.winner === playerIndex ? "win" : "loss"),
      score: player.score,
      opponent: opponent.name,
      opponentScore: opponent.score
    };
  }

  const API = {
    init(config = {}) {
      try { injectedStorage = hasOwn(config, "storage") ? config.storage : undefined; }
      catch (_) { injectedStorage = undefined; }
      error(null);
      return API;
    },

    recordMatch(detail) {
      let record;
      try { record = normalizeMatch(detail); }
      catch (_) { record = null; }
      if (!record) {
        error("invalid-match");
        return null;
      }
      const stored = readRecords();
      if (!stored.ok) return null;
      const records = [...stored.records, record].slice(-MAX_RECORDS);
      return writeRecords(records) ? copyRecord(record) : null;
    },

    getRecent(limit) {
      const count = normalizeLimit(limit);
      if (!count) return [];
      const stored = readRecords();
      if (!stored.ok) return [];
      return stored.records.slice(-count).reverse().map(copyRecord);
    },

    getSummary(playerName, seatIndex) {
      // Without a name, a match is summarized from seat A's perspective; the
      // record-level direction also describes seat A. A supplied name switches
      // the perspective to that player regardless of which seat they occupied.
      const requestedName = playerName === undefined ? "" : normalizedLookupName(playerName);
      const preferredSeat = seatIndex === 0 || seatIndex === 1 ? seatIndex : null;
      const stored = readRecords();
      const rows = stored.ok ? stored.records : [];
      const appearances = [];
      rows.forEach(record => {
        let playerIndex = 0;
        if (requestedName) {
          playerIndex = preferredSeat !== null
            && normalizedLookupName(record.players[preferredSeat]?.name) === requestedName
            ? preferredSeat
            : record.players.findIndex(player => normalizedLookupName(player.name) === requestedName);
          if (playerIndex < 0) return;
        }
        appearances.push({ record, playerIndex });
      });
      const wins = appearances.filter(item => !item.record.tie && item.record.winner === item.playerIndex).length;
      const losses = appearances.filter(item => !item.record.tie && item.record.winner !== item.playerIndex).length;
      const ties = appearances.filter(item => item.record.tie).length;
      const total = appearances.length;
      const bestScore = appearances.reduce((best, item) => Math.max(best, item.record.players[item.playerIndex].score), 0);
      return {
        playerName: requestedName ? safeText(playerName, MAX_NAME_LENGTH) : null,
        scope: requestedName ? "player" : "player-a",
        total,
        wins,
        losses,
        ties,
        winRate: total ? Math.round(wins / total * 1000) / 10 : 0,
        bestScore,
        recent: appearances.slice(-SUMMARY_RECENT_LIMIT).reverse().map(item => recentResult(item.record, item.playerIndex))
      };
    },

    clear() {
      const resolved = resolveStorage();
      const storage = resolved.value;
      if (!storage) {
        error("storage-unavailable");
        return false;
      }
      try {
        const removeItem = storageMethod(storage, "removeItem");
        const setItem = storageMethod(storage, "setItem");
        if (removeItem) removeItem.call(storage, STORAGE_KEY);
        else if (setItem) setItem.call(storage, STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, records: [] }));
        else throw new Error("storage-clear-unavailable");
        error(null);
        return true;
      } catch (_) {
        error("storage-clear-failed");
        return false;
      }
    },

    inspect() {
      const stored = readRecords();
      return {
        key: STORAGE_KEY,
        version: SCHEMA_VERSION,
        maxRecords: MAX_RECORDS,
        defaultRecentLimit: DEFAULT_RECENT_LIMIT,
        storageSource: stored.source,
        storageAvailable: stored.ok,
        count: stored.records.length,
        lastError
      };
    }
  };

  root.HUILAISHI_BATTLE_RECORDS = Object.freeze(API);
})(typeof window !== "undefined" ? window : globalThis);
