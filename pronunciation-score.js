(() => {
  "use strict";

  const VERSION = "1.0.0";
  const MAX_RECORDING_MS = 12000;
  const state = {
    root: null,
    observer: null,
    recorder: null,
    stream: null,
    recognition: null,
    chunks: [],
    startedAt: 0,
    timer: 0,
    runId: 0,
    transcript: "",
    confidence: 0,
    mode: "checking",
    audioUrl: "",
    lastModelKey: "",
    audioOnly: false,
    lifecycleBound: false,
    starting: false,
    session: null,
    replayAudio: null
  };

  const copy = {
    "zh-th": {
      title: "跟读反馈（测试版）",
      kicker: "LOCAL SPEECH CHECK",
      note: "先听标准音，再完整说一遍。评分看字词匹配、完整度、流利度和语速；泰语声调仍以母语教师终审为准。",
      start: "开始跟读",
      stop: "说完了",
      recording: "正在听 · 说完整句",
      checking: "正在检查本机离线识别…",
      localReady: "本地识别已就绪 · 录音不会由本应用上传",
      localMissing: "本机没有可用的离线泰语识别包。可先安装离线识别语言包，或仅为本次允许设备联网初评。",
      noRecognition: "这个浏览器不能在本机转写泰语；仍可录音回放并检查节奏，但不会生成发音分。",
      allowNetwork: "允许本次联网初评",
      recordOnly: "只录音回放",
      networkReady: "声音可能发送给浏览器或系统语音服务商处理；不会发送到会来事服务器，只在本机临时内存保留供本次回放，关闭或刷新后清除。",
      permission: "需要麦克风权限，并通过 HTTPS 或安装后的 App 打开。",
      unclear: "没有识别清楚，请在安静处靠近手机再说一次。",
      error: "评分没有完成，请重试。",
      resultTitle: "设备初评",
      heard: "识别到",
      target: "目标句",
      replay: "听我的录音",
      retry: "再来一次",
      overall: "练习分",
      accuracy: "设备听懂度",
      completeness: "字词完整",
      fluency: "流利度",
      pace: "语速",
      best: "本课最好",
      disclaimer: "本功能只比较设备转写与目标句，不能精确判断声调、长短元音、送气或口音；请继续对照示范音并由母语教师终审。",
      audioOnlyTitle: "录音对照",
      audioOnlyNote: "已保存在本机临时内存中。先听自己的录音，再点标准音逐段比较；关闭或刷新页面后录音会清除。",
      duration: "你的时长",
      reference: "示范时长",
      tooFast: "有点快，放慢一点，把每个音节交代清楚。",
      tooSlow: "有点拖，先逐段说准，再缩短停顿。",
      missing: "有些字词没有被识别到，先点“逐段听”再跟读。",
      smooth: "字词很完整。下一遍保持自然节奏，别为了高分读成播报腔。",
      solid: "已经能听懂，再把容易含糊的字头和尾音说清。",
      beginning: "先别追求快，逐段模仿标准音会更稳。",
      localOnly: "离线优先",
      network: "本次联网"
    },
    "th-zh": {
      title: "ฟีดแบ็กการพูดตาม (รุ่นทดสอบ)",
      kicker: "LOCAL SPEECH CHECK",
      note: "ฟังเสียงต้นแบบก่อน แล้วพูดทั้งประโยค ระบบประเมินความตรงของคำ ความครบ ความลื่นไหล และความเร็ว ส่วนวรรณยุกต์ให้ครูเจ้าของภาษาตรวจรอบสุดท้าย",
      start: "เริ่มพูดตาม",
      stop: "พูดจบแล้ว",
      recording: "กำลังฟัง · พูดให้ครบประโยค",
      checking: "กำลังตรวจการรู้จำเสียงแบบออฟไลน์…",
      localReady: "พร้อมรู้จำในเครื่อง · แอปนี้จะไม่อัปโหลดไฟล์เสียง",
      localMissing: "เครื่องนี้ยังไม่มีชุดรู้จำภาษาจีนแบบออฟไลน์ ติดตั้งชุดภาษาก่อน หรืออนุญาตการประเมินออนไลน์เฉพาะครั้งนี้",
      noRecognition: "เบราว์เซอร์นี้ถอดเสียงภาษาจีนบนเครื่องไม่ได้ แต่ยังอัดเสียง ฟังซ้ำ และดูจังหวะได้ โดยจะไม่ให้คะแนนการออกเสียง",
      allowNetwork: "อนุญาตประเมินออนไลน์ครั้งนี้",
      recordOnly: "อัดเสียงไว้ฟังเท่านั้น",
      networkReady: "เสียงอาจถูกส่งไปยังผู้ให้บริการรู้จำเสียงของเบราว์เซอร์หรือระบบ แต่จะไม่ถูกส่งไปยังเซิร์ฟเวอร์会来事 และจะเก็บชั่วคราวในหน่วยความจำของเครื่องเพื่อฟังซ้ำครั้งนี้เท่านั้น เมื่อปิดหรือรีเฟรชหน้าจะถูกล้าง",
      permission: "ต้องอนุญาตไมโครโฟน และเปิดผ่าน HTTPS หรือแอปที่ติดตั้งแล้ว",
      unclear: "ยังฟังไม่ชัด ลองพูดใกล้โทรศัพท์ในที่เงียบอีกครั้ง",
      error: "ประเมินไม่สำเร็จ โปรดลองอีกครั้ง",
      resultTitle: "คะแนนเบื้องต้นจากอุปกรณ์",
      heard: "ระบบได้ยิน",
      target: "ประโยคเป้าหมาย",
      replay: "ฟังเสียงของฉัน",
      retry: "ลองอีกครั้ง",
      overall: "คะแนนฝึก",
      accuracy: "ความชัดที่อุปกรณ์ฟังได้",
      completeness: "คำครบ",
      fluency: "ความลื่นไหล",
      pace: "ความเร็ว",
      best: "ดีที่สุดในบทนี้",
      disclaimer: "ฟังก์ชันนี้เปรียบเทียบข้อความที่อุปกรณ์ถอดเสียงได้กับประโยคเป้าหมาย จึงไม่สามารถวัดวรรณยุกต์ ความยาวสระ เสียงพ่นลม หรือสำเนียงได้อย่างแม่นยำ ควรเทียบกับเสียงตัวอย่างและให้ครูเจ้าของภาษาตรวจรอบสุดท้าย",
      audioOnlyTitle: "อัดเสียงเพื่อเปรียบเทียบ",
      audioOnlyNote: "ไฟล์อยู่ในหน่วยความจำชั่วคราวของเครื่อง ลองฟังเสียงตัวเองแล้วเทียบทีละช่วงกับเสียงต้นแบบ ไฟล์จะถูกล้างเมื่อปิดหรือรีเฟรชหน้า",
      duration: "เวลาของคุณ",
      reference: "เวลาเสียงต้นแบบ",
      tooFast: "เร็วไปนิด ลดความเร็วและออกแต่ละพยางค์ให้ชัด",
      tooSlow: "ช้าและเว้นช่วงมากไป ฝึกทีละช่วงแล้วค่อยเชื่อมให้เป็นธรรมชาติ",
      missing: "บางคำยังไม่ถูกจับได้ ลองฟังทีละช่วงแล้วพูดตาม",
      smooth: "คำครบและชัดแล้ว รอบต่อไปรักษาจังหวะธรรมชาติ ไม่ต้องอ่านแบบผู้ประกาศ",
      solid: "ฟังเข้าใจแล้ว ลองทำพยัญชนะต้นและเสียงท้ายให้คมขึ้น",
      beginning: "ยังไม่ต้องรีบ เลียนเสียงต้นแบบทีละช่วงจะชัดกว่า",
      localOnly: "ออฟไลน์ก่อน",
      network: "ออนไลน์ครั้งนี้"
    }
  };

  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const direction = () => state.root?.querySelector(".pc-root")?.dataset.direction === "th-zh" ? "th-zh" : "zh-th";
  const ui = () => copy[direction()];
  const targetLang = () => direction() === "zh-th" ? "th-TH" : "zh-CN";

  function normalize(value, lang = targetLang()) {
    let text = String(value || "").normalize("NFKC").toLowerCase();
    text = text.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");
    if (lang.startsWith("th")) {
      text = text.replace(/[^\u0E01-\u0E3A\u0E40-\u0E590-9a-z]/g, "");
      const marks = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/;
      const order = value => ({ "ํ": 1, "ั": 2, "ิ": 3, "ี": 4, "ึ": 5, "ื": 6, "ุ": 7, "ู": 8, "ฺ": 9, "็": 10, "่": 11, "้": 12, "๊": 13, "๋": 14, "์": 15, "๎": 16 }[value] || 99);
      const chars = Array.from(text);
      const stable = [];
      for (let index = 0; index < chars.length; index += 1) {
        const char = chars[index];
        if (!marks.test(char)) { stable.push(char); continue; }
        const group = [char];
        while (index + 1 < chars.length && marks.test(chars[index + 1])) group.push(chars[++index]);
        stable.push(...group.sort((a, b) => order(a) - order(b)));
      }
      return stable.join("");
    }
    return text.replace(/[^\u3400-\u9FFF0-9a-zü]/g, "");
  }

  function units(value, lang = targetLang()) {
    const text = normalize(value, lang);
    if (!text) return [];
    if (globalThis.Intl?.Segmenter) {
      const locale = lang.startsWith("th") ? "th" : "zh";
      return [...new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(text)].map(item => item.segment);
    }
    if (!lang.startsWith("th")) return Array.from(text);
    const result = [];
    for (const char of Array.from(text)) {
      if (/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/.test(char) && result.length) result[result.length - 1] += char;
      else result.push(char);
    }
    return result;
  }

  function levenshtein(left, right) {
    const a = Array.isArray(left) ? left : Array.from(left || "");
    const b = Array.isArray(right) ? right : Array.from(right || "");
    const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      let diagonal = previous[0];
      previous[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const above = previous[j];
        previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
        diagonal = above;
      }
    }
    return previous[b.length];
  }

  function lcsMask(targetUnits, heardUnits) {
    const rows = targetUnits.length + 1;
    const cols = heardUnits.length + 1;
    const table = Array.from({ length: rows }, () => new Uint16Array(cols));
    for (let i = 1; i < rows; i += 1) {
      for (let j = 1; j < cols; j += 1) {
        table[i][j] = targetUnits[i - 1] === heardUnits[j - 1]
          ? table[i - 1][j - 1] + 1
          : Math.max(table[i - 1][j], table[i][j - 1]);
      }
    }
    const matched = new Set();
    let i = targetUnits.length;
    let j = heardUnits.length;
    while (i > 0 && j > 0) {
      if (targetUnits[i - 1] === heardUnits[j - 1]) { matched.add(i - 1); i -= 1; j -= 1; }
      else if (table[i - 1][j] >= table[i][j - 1]) i -= 1;
      else j -= 1;
    }
    return { length: table[targetUnits.length][heardUnits.length], matched };
  }

  function criticalTokens(value, lang) {
    const normalized = normalize(value, lang);
    if (lang.startsWith("th")) {
      return ["ไม่ได้", "อย่า", "ห้าม", "ไม่", ...(normalized.match(/\d+/g) || [])].filter(token => normalized.includes(token));
    }
    return ["不要", "不能", "没有", "没", "别", "不", "未", ...(normalized.match(/\d+/g) || [])].filter(token => normalized.includes(token));
  }

  function scoreText(target, heard) {
    const lang = targetLang();
    const expected = units(target, lang);
    const actual = units(heard, lang);
    if (!expected.length || !actual.length) return { accuracy: 0, completeness: 0, similarity: 0, criticalMissing: criticalTokens(target, lang), matched: new Set(), targetUnits: expected, heardUnits: actual };
    const distance = levenshtein(expected, actual);
    const similarity = clamp(1 - distance / Math.max(expected.length, actual.length), 0, 1);
    const lcs = lcsMask(expected, actual);
    const completeness = clamp(lcs.length / expected.length, 0, 1);
    const criticalMissing = criticalTokens(target, lang).filter(token => !normalize(heard, lang).includes(token));
    const cap = criticalMissing.length ? 62 : 100;
    return {
      accuracy: Math.round(Math.min(cap, 100 * similarity)),
      completeness: Math.round(Math.min(cap, 100 * completeness)),
      similarity,
      criticalMissing,
      matched: lcs.matched,
      targetUnits: expected,
      heardUnits: actual
    };
  }

  async function decodeBlob(blob) {
    if (!blob?.size) return null;
    const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Context) return null;
    const context = new Context();
    try {
      const buffer = await context.decodeAudioData(await blob.arrayBuffer());
      return buffer;
    } catch (_) {
      return null;
    } finally {
      context.close?.();
    }
  }

  function analyseAudio(buffer, fallbackDuration) {
    const duration = buffer?.duration || fallbackDuration || 0;
    if (!buffer || !buffer.length) return { available: false, duration, silenceRatio: null, breaks: null, level: null };
    const channel = buffer.getChannelData(0);
    const frame = Math.max(256, Math.round(buffer.sampleRate * .025));
    let silent = 0;
    let frames = 0;
    let activeRun = 0;
    let silentRun = 0;
    let breaks = 0;
    let sumSquares = 0;
    for (let offset = 0; offset < channel.length; offset += frame) {
      let energy = 0;
      const end = Math.min(channel.length, offset + frame);
      for (let i = offset; i < end; i += 1) energy += channel[i] * channel[i];
      const rms = Math.sqrt(energy / Math.max(1, end - offset));
      sumSquares += energy;
      frames += 1;
      if (rms < .012) {
        silent += 1;
        silentRun += 1;
        if (activeRun >= 4 && silentRun === 8) breaks += 1;
      } else {
        activeRun += 1;
        silentRun = 0;
      }
    }
    return {
      available: true,
      duration,
      silenceRatio: frames ? silent / frames : .25,
      breaks,
      level: Math.sqrt(sumSquares / Math.max(1, channel.length))
    };
  }

  function referenceDuration(audioKey, target) {
    return new Promise(resolve => {
      const source = globalThis.PRONUNCIATION_AUDIO?.[audioKey];
      if (!source || typeof Audio !== "function") {
        const count = Math.max(2, units(target).length);
        resolve(direction() === "zh-th" ? count / 4.6 : count / 3.2);
        return;
      }
      const audio = new Audio();
      let settled = false;
      const finish = value => {
        if (settled) return;
        settled = true;
        audio.removeAttribute("src");
        resolve(value);
      };
      audio.preload = "metadata";
      audio.addEventListener("loadedmetadata", () => finish(Number.isFinite(audio.duration) ? audio.duration : 0), { once: true });
      audio.addEventListener("error", () => finish(0), { once: true });
      audio.src = source;
      setTimeout(() => finish(0), 2800);
    });
  }

  function scoreRhythm(audio, referenceSeconds) {
    if (!audio?.available || !(referenceSeconds > 0)) return { available: false, pace: null, fluency: null, ratio: null };
    const voiceDuration = Math.max(.2, audio.duration * (1 - Math.min(.8, audio.silenceRatio * .65)));
    const reference = Math.max(.35, referenceSeconds || voiceDuration);
    const ratio = voiceDuration / reference;
    const pace = Math.round(clamp(100 - Math.abs(Math.log(Math.max(.15, ratio))) * 82));
    const silencePenalty = clamp((audio.silenceRatio - .18) * 145, 0, 45);
    const breakPenalty = Math.min(30, audio.breaks * 8);
    const fluency = Math.round(clamp(100 - silencePenalty - breakPenalty));
    return { available: true, pace, fluency, ratio };
  }

  function bestStorageKey(modelKey) { return `huilaishi-pronunciation-best:${modelKey}`; }

  function highlightedTarget(result) {
    return result.targetUnits.map((part, index) => result.matched.has(index)
      ? `<span>${escapeHtml(part)}</span>`
      : `<mark>${escapeHtml(part)}</mark>`).join("");
  }

  function feedbackFor(scores) {
    const c = ui();
    if (scores.completeness < 76) return c.missing;
    if (Number.isFinite(scores.pace) && scores.pace < 72 && scores.ratio < 1) return c.tooFast;
    if (Number.isFinite(scores.pace) && scores.pace < 72 && scores.ratio >= 1) return c.tooSlow;
    if (scores.overall >= 90) return c.smooth;
    if (scores.overall >= 72) return c.solid;
    return c.beginning;
  }

  function resultMarkup(target, heard, textResult, rhythm, overall, modelKey) {
    const c = ui();
    let previous = 0;
    try { previous = Number(localStorage.getItem(bestStorageKey(modelKey)) || 0); } catch (_) {}
    const best = Math.max(previous, overall);
    try { localStorage.setItem(bestStorageKey(modelKey), String(best)); } catch (_) {}
    return `
      <div class="ps-result-head"><div><small>${escapeHtml(c.resultTitle)}</small><strong>${overall}</strong><span>/ 100</span></div><p>${escapeHtml(c.best)} <b>${best}</b></p></div>
      <div class="ps-metrics" aria-label="${escapeHtml(c.resultTitle)}">
        ${metric(c.accuracy, textResult.accuracy)}${metric(c.completeness, textResult.completeness)}${metric(c.fluency, rhythm.fluency)}${metric(c.pace, rhythm.pace)}
      </div>
      <div class="ps-compare">
        <p><small>${escapeHtml(c.target)}</small><b lang="${targetLang()}">${highlightedTarget(textResult)}</b></p>
        <p><small>${escapeHtml(c.heard)}</small><b lang="${targetLang()}">${escapeHtml(heard)}</b></p>
      </div>
      <p class="ps-tip">${escapeHtml(feedbackFor({ ...textResult, ...rhythm, overall }))}</p>
      <div class="ps-result-actions"><button type="button" data-ps-action="replay">▶ ${escapeHtml(c.replay)}</button><button type="button" data-ps-action="start">↻ ${escapeHtml(c.retry)}</button></div>
      <p class="ps-disclaimer">${escapeHtml(c.disclaimer)}</p>`;
  }

  function audioOnlyMarkup(audio, reference) {
    const c = ui();
    const userSeconds = Math.max(.1, audio.duration).toFixed(1);
    const referenceSeconds = reference > 0 ? `${reference.toFixed(1)}s` : "—";
    return `
      <div class="ps-result-head"><div><small>${escapeHtml(c.audioOnlyTitle)}</small></div></div>
      <div class="ps-audio-only-stats"><p><small>${escapeHtml(c.duration)}</small><b>${userSeconds}s</b></p><p><small>${escapeHtml(c.reference)}</small><b>${referenceSeconds}</b></p></div>
      <p class="ps-tip">${escapeHtml(c.audioOnlyNote)}</p>
      <div class="ps-result-actions"><button type="button" data-ps-action="replay">▶ ${escapeHtml(c.replay)}</button><button type="button" data-ps-action="record-only">↻ ${escapeHtml(c.retry)}</button></div>
      <p class="ps-disclaimer">${escapeHtml(c.disclaimer)}</p>`;
  }

  function metric(label, value) {
    if (!Number.isFinite(value)) return `<div class="is-unavailable"><span>${escapeHtml(label)}</span><b>—</b><i></i></div>`;
    const safe = Math.round(clamp(value));
    return `<div><span>${escapeHtml(label)}</span><b>${safe}</b><i><em style="width:${safe}%"></em></i></div>`;
  }

  function setStatus(message, tone = "") {
    const status = state.root?.querySelector(".ps-status");
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  }

  function setRecording(recording) {
    const lab = state.root?.querySelector(".pc-score-lab");
    const button = lab?.querySelector("[data-ps-action='start'], [data-ps-action='stop']");
    if (!lab || !button) return;
    lab.classList.toggle("is-recording", recording);
    button.dataset.psAction = recording ? "stop" : "start";
    button.innerHTML = recording
      ? `<span class="ps-mic-dot" aria-hidden="true"></span>${escapeHtml(ui().stop)}`
      : `<span aria-hidden="true">●</span>${escapeHtml(ui().start)}`;
  }

  function stopStream(stream) { stream?.getTracks?.().forEach(track => track.stop()); }

  function stopReplay() {
    if (!state.replayAudio) return;
    state.replayAudio.pause?.();
    state.replayAudio.currentTime = 0;
    state.replayAudio = null;
  }

  function clearSession(session) {
    if (!session) return;
    clearTimeout(session.timer);
    clearTimeout(session.recognitionFallbackTimer);
    stopStream(session.stream);
    if (state.session === session) {
      state.session = null;
      state.stream = null;
      state.recorder = null;
      state.recognition = null;
    }
    setRecording(false);
  }

  function maybeFinalize(session) {
    if (!session || session.finalizing || session.cancelled || session.id !== state.runId) return;
    if (!session.recorderDone || !session.recognitionDone) return;
    session.finalizing = true;
    finalize(session);
  }

  function stopSession({ abort = false } = {}) {
    state.starting = false;
    const session = state.session;
    if (!session) { setRecording(false); return; }
    clearTimeout(session.timer);
    if (abort) {
      session.cancelled = true;
      try { session.recognition?.abort?.(); } catch (_) {}
      try { if (session.recorder?.state === "recording") session.recorder.stop(); } catch (_) {}
      clearSession(session);
      return;
    }
    try { if (session.recorder?.state === "recording") session.recorder.stop(); } catch (_) { session.recorderDone = true; }
    if (session.recognition) {
      try { session.recognition.stop(); } catch (_) { session.recognitionDone = true; }
      session.recognitionFallbackTimer = setTimeout(() => { session.recognitionDone = true; maybeFinalize(session); }, 900);
    } else session.recognitionDone = true;
    maybeFinalize(session);
    setRecording(false);
  }

  async function recognitionMode(lang, allowNetwork = false) {
    const Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    if (!Recognition) return "none";
    if (typeof Recognition.available === "function") {
      try {
        const availability = await Recognition.available({ langs: [lang], processLocally: true });
        if (availability === "available") {
          const probe = new Recognition();
          if ("processLocally" in probe) return "local";
          return allowNetwork ? "network" : "local-missing";
        }
        return allowNetwork ? "network" : "local-missing";
      } catch (_) { return allowNetwork ? "network" : "local-missing"; }
    }
    return allowNetwork ? "network" : "network-consent";
  }

  async function refreshCapability() {
    const runId = state.runId;
    setStatus(ui().checking);
    const mode = await recognitionMode(targetLang());
    if (runId !== state.runId) return;
    state.mode = mode;
    const lab = state.root?.querySelector(".pc-score-lab");
    const consent = lab?.querySelector(".ps-network-consent");
    if (consent) {
      consent.hidden = !(mode === "local-missing" || mode === "network-consent" || mode === "none");
      const networkButton = consent.querySelector("[data-ps-action='allow-network']");
      if (networkButton) networkButton.hidden = mode === "none";
      const paragraph = consent.querySelector("p");
      if (paragraph) paragraph.textContent = mode === "none" ? ui().noRecognition : ui().localMissing;
    }
    if (mode === "local") setStatus(`${ui().localReady} · ${ui().localOnly}`, "ok");
    else if (mode === "network") setStatus(`${ui().networkReady} · ${ui().network}`, "warn");
    else if (mode === "none") setStatus(ui().noRecognition, "error");
    else setStatus(ui().localMissing, "warn");
  }

  async function start(options = {}) {
    const lab = state.root?.querySelector(".pc-score-lab");
    if (!lab || state.starting || state.session?.recorder?.state === "recording") return;
    state.starting = true;
    const runId = ++state.runId;
    stopReplay();
    const model = currentModel();
    if (!model.target) { state.starting = false; return; }
    const audioOnly = Boolean(options.audioOnly);
    const mode = audioOnly ? "audio-only" : await recognitionMode(model.lang, Boolean(options.networkPermit));
    if (runId !== state.runId || currentModel().modelKey !== model.modelKey) { state.starting = false; return; }
    state.mode = mode;
    state.audioOnly = audioOnly;
    if (!audioOnly && (mode === "local-missing" || mode === "network-consent")) {
      lab.querySelector(".ps-network-consent").hidden = false;
      setStatus(ui().localMissing, "warn");
      state.starting = false;
      return;
    }
    if (!audioOnly && mode === "none") { setStatus(ui().noRecognition, "warn"); state.starting = false; return; }
    if (!globalThis.MediaRecorder || !navigator.mediaDevices?.getUserMedia || !globalThis.isSecureContext) {
      setStatus(ui().permission, "error");
      state.starting = false;
      return;
    }
    state.transcript = "";
    state.confidence = 0;
    state.chunks = [];
    lab.querySelector(".ps-result").innerHTML = "";
    lab.querySelector(".ps-result").hidden = true;
    globalThis.HUILAISHI_SPEECH?.stop?.();
    globalThis.PronunciationCourse?.stopAudio?.();
    globalThis.stopAlaiVoice?.();
    globalThis.ArcadeUI?.stopVoice?.();
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      } catch (error) {
        if (error?.name !== "OverconstrainedError") throw error;
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      if (runId !== state.runId || currentModel().modelKey !== model.modelKey) { stopStream(stream); state.starting = false; return; }
      const session = {
        id: runId, model, mode, audioOnly, stream, recorder: null, recognition: null, chunks: [], transcript: "", confidence: 0,
        startedAt: performance.now(), recorderDone: false, recognitionDone: audioOnly, finalizing: false, cancelled: false, timer: 0, recognitionFallbackTimer: 0
      };
      state.session = session;
      state.stream = stream;
      let recognition = null;
      if (!audioOnly) {
        const Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
        recognition = new Recognition();
        recognition.lang = model.lang;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        if (mode === "local" && "processLocally" in recognition) recognition.processLocally = true;
        session.recognition = recognition;
        state.recognition = recognition;
        recognition.onresult = event => {
          if (runId !== state.runId) return;
          let best = null;
          for (let i = 0; i < event.results.length; i += 1) {
            const result = event.results[i];
            if (!result.isFinal) continue;
            const option = result[0];
            if (option?.transcript?.trim()) best = { text: option.transcript.trim(), confidence: Number(option.confidence || 0) };
          }
          if (best?.text) {
            session.transcript = best.text;
            session.confidence = best.confidence;
            state.transcript = best.text;
            state.confidence = best.confidence;
            setStatus(`${ui().recording} · ${best.text}`, "live");
          }
        };
        recognition.onerror = event => {
          if (runId !== state.runId) return;
          if (["aborted", "no-speech"].includes(event.error)) return;
          setStatus(event.error === "not-allowed" ? ui().permission : ui().unclear, "error");
        };
        recognition.onend = () => {
          if (runId !== state.runId || session.cancelled) return;
          session.recognitionDone = true;
          if (session.recorder?.state === "recording") {
            try { session.recorder.stop(); } catch (_) { session.recorderDone = true; }
          }
          maybeFinalize(session);
        };
      }
      session.recorder = new MediaRecorder(stream);
      state.recorder = session.recorder;
      state.startedAt = session.startedAt;
      session.recorder.addEventListener("dataavailable", event => { if (runId === state.runId && event.data.size) session.chunks.push(event.data); });
      session.recorder.addEventListener("error", () => {
        if (runId !== state.runId) return;
        setStatus(ui().error, "error");
        stopSession({ abort: true });
      });
      session.recorder.addEventListener("stop", () => {
        session.recorderDone = true;
        stopStream(session.stream);
        maybeFinalize(session);
      });
      session.recorder.start(180);
      recognition?.start?.();
      state.starting = false;
      setRecording(true);
      setStatus(audioOnly ? ui().recording : `${ui().recording} · ${mode === "local" ? ui().localOnly : ui().network}`, "live");
      session.timer = setTimeout(() => stopSession(), MAX_RECORDING_MS);
    } catch (_) {
      stopSession({ abort: true });
      state.starting = false;
      setRecording(false);
      setStatus(ui().permission, "error");
    }
  }

  async function finalize(session) {
    if (!session || session.id !== state.runId || session.cancelled) return;
    clearTimeout(session.timer);
    clearTimeout(session.recognitionFallbackTimer);
    const model = session.model;
    const fallbackDuration = Math.max(.2, (performance.now() - session.startedAt) / 1000);
    const mime = session.recorder?.mimeType || session.chunks[0]?.type || "audio/webm";
    const blob = new Blob(session.chunks, { type: mime });
    stopStream(session.stream);
    if (!blob.size) {
      setStatus(ui().unclear, "error");
      clearSession(session);
      refreshCapability();
      return;
    }
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = blob.size ? URL.createObjectURL(blob) : "";
    setRecording(false);
    setStatus(ui().checking);
    const [buffer, reference] = await Promise.all([decodeBlob(blob), referenceDuration(model.audioKey, model.target)]);
    if (session.id !== state.runId || session.cancelled) return;
    const audio = analyseAudio(buffer, fallbackDuration);
    const rhythm = scoreRhythm(audio, reference);
    const result = state.root?.querySelector(".ps-result");
    if (session.audioOnly || !session.transcript) {
      if (result) { result.hidden = false; result.innerHTML = audioOnlyMarkup(audio, reference); }
      setStatus(session.audioOnly ? ui().audioOnlyTitle : ui().unclear, session.audioOnly ? "ok" : "warn");
      clearSession(session);
      refreshCapability();
      return;
    }
    const textResult = scoreText(model.target, session.transcript);
    const weighted = [
      [textResult.accuracy, .48], [textResult.completeness, .24],
      ...(rhythm.available ? [[rhythm.fluency, .18], [rhythm.pace, .10]] : [])
    ];
    const weightTotal = weighted.reduce((sum, item) => sum + item[1], 0);
    let overall = Math.round(weighted.reduce((sum, item) => sum + item[0] * item[1], 0) / weightTotal);
    if (textResult.criticalMissing.length) overall = Math.min(64, overall);
    if (result) {
      result.hidden = false;
      result.innerHTML = resultMarkup(model.target, session.transcript, textResult, rhythm, overall, model.modelKey);
    }
    setStatus(`${ui().resultTitle} · ${overall} / 100`, "ok");
    clearSession(session);
    refreshCapability();
  }

  function currentModel() {
    const modelText = state.root?.querySelector(".pc-model-text");
    const audioButton = state.root?.querySelector("[data-audio-key$='__model']");
    const target = modelText?.textContent?.trim() || "";
    const audioKey = audioButton?.dataset.audioKey || "";
    return { target, audioKey, lang: targetLang(), modelKey: `${direction()}:${audioKey || normalize(target)}` };
  }

  function labMarkup() {
    const c = ui();
    return `
      <section class="pc-score-lab" aria-labelledby="ps-title">
        <div class="ps-heading"><div><small>${escapeHtml(c.kicker)}</small><h3 id="ps-title">${escapeHtml(c.title)}</h3></div><span aria-hidden="true">声 / อ</span></div>
        <p class="ps-note">${escapeHtml(c.note)}</p>
        <p class="ps-status" role="status" aria-live="polite">${escapeHtml(c.checking)}</p>
        <div class="ps-controls">
          <button class="ps-record" type="button" data-ps-action="start"><span aria-hidden="true">●</span>${escapeHtml(c.start)}</button>
          <div class="ps-network-consent" hidden><p>${escapeHtml(c.localMissing)}</p><div><button type="button" data-ps-action="record-only">${escapeHtml(c.recordOnly)}</button><button type="button" data-ps-action="allow-network">${escapeHtml(c.allowNetwork)}</button></div></div>
        </div>
        <div class="ps-result" hidden></div>
      </section>`;
  }

  function hydrate() {
    const model = state.root?.querySelector(".pc-model");
    if (!model || state.root.querySelector(".pc-score-lab")) return;
    model.insertAdjacentHTML("afterend", labMarkup());
    const nextKey = currentModel().modelKey;
    if (state.lastModelKey && state.lastModelKey !== nextKey) {
      state.runId += 1;
      stopSession({ abort: true });
      if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
      state.audioUrl = "";
    }
    state.lastModelKey = nextKey;
    refreshCapability();
  }

  function handleClick(event) {
    const button = event.target.closest("[data-ps-action]");
    if (!button || !state.root?.contains(button)) return;
    event.stopPropagation();
    const action = button.dataset.psAction;
    if (action === "start") start();
    else if (action === "stop") stopSession();
    else if (action === "record-only") start({ audioOnly: true });
    else if (action === "allow-network") start({ networkPermit: true });
    else if (action === "replay" && state.audioUrl) {
      globalThis.HUILAISHI_SPEECH?.stop?.();
      stopReplay();
      const audio = new Audio(state.audioUrl);
      state.replayAudio = audio;
      audio.setAttribute("playsinline", "");
      const clear = () => { if (state.replayAudio === audio) state.replayAudio = null; };
      audio.addEventListener("ended", clear, { once: true });
      audio.addEventListener("error", clear, { once: true });
      audio.play().catch(() => { clear(); setStatus(ui().error, "error"); });
    }
  }

  function handleLifecycle() {
    if (document.visibilityState === "hidden") {
      state.runId += 1;
      stopSession({ abort: true });
      stopReplay();
    }
  }

  function init(options = {}) {
    destroy();
    state.root = typeof options.root === "string" ? document.querySelector(options.root) : options.root;
    if (!state.root) return false;
    state.root.addEventListener("click", handleClick);
    state.observer = new MutationObserver(() => queueMicrotask(hydrate));
    state.observer.observe(state.root, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-direction"] });
    document.addEventListener("visibilitychange", handleLifecycle);
    window.addEventListener("pagehide", handleLifecycle);
    state.lifecycleBound = true;
    hydrate();
    return api;
  }

  function destroy() {
    state.runId += 1;
    stopSession({ abort: true });
    state.root?.removeEventListener("click", handleClick);
    state.observer?.disconnect();
    if (state.lifecycleBound) {
      document.removeEventListener("visibilitychange", handleLifecycle);
      window.removeEventListener("pagehide", handleLifecycle);
    }
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    stopReplay();
    state.root = null;
    state.observer = null;
    state.audioUrl = "";
    state.lastModelKey = "";
    state.lifecycleBound = false;
  }

  const api = { init, destroy, stop: () => stopSession({ abort: true }), scoreText, normalize, version: VERSION };
  globalThis.PronunciationScorer = api;
})();
