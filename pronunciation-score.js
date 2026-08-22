(() => {
  "use strict";

  const VERSION = "1.1.0";
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
      note: "先听标准音，再完整说一遍。评分看字词匹配、完整度、流利度和语速；本机音高镜会对照相对升降，泰语声调仍以母语教师终审为准。",
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
      disclaimer: "文字分只比较设备转写与目标句；音高镜只比较有声音段的相对升降，不能精确判断词汇声调、长短元音、送气或口音。请继续对照示范音并由母语教师终审。",
      pitchTitle: "声调 / 音高镜",
      pitchKicker: "ON-DEVICE PITCH MIRROR",
      pitchScore: "走势接近",
      pitchReference: "标准音",
      pitchMine: "我的声音",
      pitchUnavailable: "这次有声音段太少，暂时画不出可靠走势。靠近手机、完整说一遍再试。",
      pitchGood: "整体升降已经接近。下一遍继续听转折时机，并单独留意长短元音和尾音。",
      pitchMid: "大方向接近，但转折出现得偏早或偏晚。先慢听，再按同样停顿跟一遍。",
      pitchLow: "升降走向差异较大。先不要追求快，逐段模仿标准音的高低变化。",
      pitchDisclaimer: "实验性设备反馈：已消除男女与绝对音高差，只比较相对走势；不等于声调判定或母语认证。",
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
      note: "ฟังเสียงต้นแบบก่อน แล้วพูดทั้งประโยค ระบบประเมินความตรงของคำ ความครบ ความลื่นไหล และความเร็ว พร้อมกระจกเทียบแนวระดับเสียงในเครื่อง ส่วนวรรณยุกต์ให้ครูเจ้าของภาษาตรวจรอบสุดท้าย",
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
      disclaimer: "คะแนนข้อความเปรียบเทียบเฉพาะคำที่อุปกรณ์ถอดได้ ส่วนกระจกระดับเสียงเปรียบเทียบเพียงแนวขึ้นลงของช่วงที่มีเสียง จึงยังตัดสินวรรณยุกต์ ความยาวสระ เสียงพ่นลม หรือสำเนียงอย่างแม่นยำไม่ได้ ควรเทียบเสียงตัวอย่างและให้ครูเจ้าของภาษาตรวจรอบสุดท้าย",
      pitchTitle: "กระจกวรรณยุกต์ / ระดับเสียง",
      pitchKicker: "ON-DEVICE PITCH MIRROR",
      pitchScore: "แนวเสียงใกล้เคียง",
      pitchReference: "เสียงมาตรฐาน",
      pitchMine: "เสียงของฉัน",
      pitchUnavailable: "ช่วงที่มีเสียงครั้งนี้สั้นเกินไป จึงยังวาดแนวเสียงที่น่าเชื่อถือไม่ได้ ลองพูดให้ครบใกล้โทรศัพท์อีกครั้ง",
      pitchGood: "แนวขึ้นลงโดยรวมใกล้เคียงแล้ว รอบต่อไปฟังจังหวะที่เสียงเปลี่ยน และแยกตรวจความยาวสระกับเสียงท้าย",
      pitchMid: "ทิศทางโดยรวมใกล้เคียง แต่จุดเปลี่ยนมาเร็วหรือช้าไป ลองฟังช้าแล้วพูดตามด้วยช่วงหยุดแบบเดียวกัน",
      pitchLow: "แนวขึ้นลงยังต่างจากเสียงมาตรฐานมาก อย่าเพิ่งเร่งความเร็ว ลองเลียนระดับเสียงทีละช่วง",
      pitchDisclaimer: "ฟีดแบ็กทดลองในเครื่อง: ระบบตัดความต่างของเพศและระดับเสียงสัมบูรณ์ออก แล้วเทียบเฉพาะแนวสัมพัทธ์ ไม่ใช่การรับรองวรรณยุกต์หรือเจ้าของภาษา",
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

  const referenceBufferCache = new Map();

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

  async function decodeAudioData(arrayBuffer) {
    if (!arrayBuffer?.byteLength) return null;
    const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Context) return null;
    const context = new Context();
    try {
      return await context.decodeAudioData(arrayBuffer.slice(0));
    } catch (_) {
      return null;
    } finally {
      context.close?.();
    }
  }

  async function decodeBlob(blob) {
    if (!blob?.size) return null;
    return decodeAudioData(await blob.arrayBuffer());
  }

  function referenceBuffer(audioKey) {
    const source = globalThis.PRONUNCIATION_AUDIO?.[audioKey];
    if (!source || typeof fetch !== "function") return Promise.resolve(null);
    if (referenceBufferCache.has(audioKey)) return referenceBufferCache.get(audioKey);
    const pending = fetch(source)
      .then(response => response.ok ? response.arrayBuffer() : null)
      .then(data => data ? decodeAudioData(data) : null)
      .catch(() => null);
    referenceBufferCache.set(audioKey, pending);
    return pending;
  }

  function median(values) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function resampleContour(points, bins = 52) {
    if (points.length < 2) return [];
    const result = [];
    let cursor = 1;
    for (let index = 0; index < bins; index += 1) {
      const target = index / (bins - 1);
      while (cursor < points.length - 1 && points[cursor].time < target) cursor += 1;
      const right = points[cursor];
      const left = points[Math.max(0, cursor - 1)];
      const width = Math.max(.0001, right.time - left.time);
      const amount = clamp((target - left.time) / width, 0, 1);
      result.push(left.value + (right.value - left.value) * amount);
    }
    return result;
  }

  async function pitchContour(buffer) {
    const Detector = globalThis.HUILAISHI_PITCHY?.PitchDetector;
    if (!buffer?.length || typeof Detector?.forFloat32Array !== "function") return null;
    const channel = buffer.getChannelData(0);
    const frameSize = 2048;
    if (channel.length < frameSize) return null;
    const hop = Math.max(256, Math.round(buffer.sampleRate * .018));
    const detector = Detector.forFloat32Array(frameSize);
    let peak = 0;
    for (let index = 0; index < channel.length; index += 16) peak = Math.max(peak, Math.abs(channel[index]));
    const minRms = Math.max(.004, Math.min(.018, peak * .02));
    const voiced = [];
    let previousPitch = 0;
    let frames = 0;
    const maxSamples = Math.min(channel.length, Math.round(buffer.sampleRate * 12.5));
    for (let offset = 0; offset + frameSize <= maxSamples; offset += hop) {
      const frame = channel.subarray(offset, offset + frameSize);
      let energy = 0;
      for (let index = 0; index < frame.length; index += 4) energy += frame[index] * frame[index];
      const rms = Math.sqrt(energy / Math.ceil(frame.length / 4));
      if (rms >= minRms) {
        let [pitch, clarity] = detector.findPitch(frame, buffer.sampleRate);
        if (Number.isFinite(pitch) && clarity >= .82 && pitch >= 60 && pitch <= 760) {
          if (previousPitch) {
            while (pitch / previousPitch > 1.82) pitch /= 2;
            while (previousPitch / pitch > 1.82 && pitch * 2 <= 760) pitch *= 2;
          }
          previousPitch = pitch;
          voiced.push({ seconds: (offset + frameSize / 2) / buffer.sampleRate, pitch, clarity });
        }
      }
      frames += 1;
      if (frames % 70 === 0) await new Promise(resolve => requestAnimationFrame(resolve));
    }
    if (voiced.length < 10) return null;
    const center = median(voiced.map(point => point.pitch));
    const start = voiced[0].seconds;
    const span = Math.max(.08, voiced[voiced.length - 1].seconds - start);
    const normalized = voiced.map((point, index) => {
      const nearby = voiced.slice(Math.max(0, index - 1), Math.min(voiced.length, index + 2));
      const smoothed = median(nearby.map(item => 12 * Math.log2(item.pitch / center)));
      return { time: (point.seconds - start) / span, value: clamp(smoothed, -9, 9) };
    });
    return {
      values: resampleContour(normalized),
      coverage: voiced.length / Math.max(1, frames),
      voicedFrames: voiced.length
    };
  }

  function compareContours(reference, attempt) {
    if (!reference?.values?.length || !attempt?.values?.length || reference.coverage < .09 || attempt.coverage < .09) return { available: false };
    const left = reference.values;
    const right = attempt.values;
    let best = Infinity;
    let bestShift = 0;
    for (let shift = -4; shift <= 4; shift += 1) {
      let valueError = 0;
      let slopeError = 0;
      let count = 0;
      for (let index = 1; index < left.length; index += 1) {
        const other = index + shift;
        if (other < 1 || other >= right.length) continue;
        valueError += Math.abs(left[index] - right[other]);
        slopeError += Math.abs((left[index] - left[index - 1]) - (right[other] - right[other - 1]));
        count += 1;
      }
      if (!count) continue;
      const cost = valueError / count + slopeError / count * .35;
      if (cost < best) { best = cost; bestShift = shift; }
    }
    const score = Math.round(clamp(100 - best * 15));
    return { available: Number.isFinite(score), score, reference: left, attempt: right, shift: bestShift };
  }

  async function analysePitch(reference, attempt) {
    if (!reference || !attempt) return { available: false };
    try {
      const [model, user] = await Promise.all([pitchContour(reference), pitchContour(attempt)]);
      return compareContours(model, user);
    } catch (_) {
      return { available: false };
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

  function contourPoints(values) {
    if (!values?.length) return "";
    return values.map((value, index) => {
      const x = values.length === 1 ? 50 : index / (values.length - 1) * 100;
      const y = clamp(26 - value * 2.35, 4, 48);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  }

  function pitchMarkup(pitch) {
    const c = ui();
    if (!pitch?.available) return `
      <section class="ps-pitch-card is-unavailable" aria-labelledby="ps-pitch-title">
        <div class="ps-pitch-head"><div><small>${escapeHtml(c.pitchKicker)}</small><h4 id="ps-pitch-title">${escapeHtml(c.pitchTitle)}</h4></div><b>—</b></div>
        <p>${escapeHtml(c.pitchUnavailable)}</p>
      </section>`;
    const message = pitch.score >= 80 ? c.pitchGood : pitch.score >= 58 ? c.pitchMid : c.pitchLow;
    const aria = `${c.pitchTitle}，${c.pitchScore} ${pitch.score}%`;
    return `
      <section class="ps-pitch-card" aria-labelledby="ps-pitch-title">
        <div class="ps-pitch-head"><div><small>${escapeHtml(c.pitchKicker)}</small><h4 id="ps-pitch-title">${escapeHtml(c.pitchTitle)}</h4></div><p><span>${escapeHtml(c.pitchScore)}</span><b>${pitch.score}%</b></p></div>
        <div class="ps-pitch-chart" role="img" aria-label="${escapeHtml(aria)}">
          <svg viewBox="0 0 100 52" preserveAspectRatio="none" aria-hidden="true">
            <path class="ps-pitch-grid" d="M0 13H100M0 26H100M0 39H100" />
            <polyline class="ps-pitch-reference" points="${contourPoints(pitch.reference)}" />
            <polyline class="ps-pitch-attempt" points="${contourPoints(pitch.attempt)}" />
          </svg>
        </div>
        <div class="ps-pitch-legend"><span class="reference">${escapeHtml(c.pitchReference)}</span><span class="attempt">${escapeHtml(c.pitchMine)}</span></div>
        <p class="ps-pitch-feedback">${escapeHtml(message)}</p>
        <p class="ps-pitch-disclaimer">${escapeHtml(c.pitchDisclaimer)}</p>
      </section>`;
  }

  function resultMarkup(target, heard, textResult, rhythm, pitch, overall, modelKey) {
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
      ${pitchMarkup(pitch)}
      <p class="ps-tip">${escapeHtml(feedbackFor({ ...textResult, ...rhythm, overall }))}</p>
      <div class="ps-result-actions"><button type="button" data-ps-action="replay">▶ ${escapeHtml(c.replay)}</button><button type="button" data-ps-action="start">↻ ${escapeHtml(c.retry)}</button></div>
      <p class="ps-disclaimer">${escapeHtml(c.disclaimer)}</p>`;
  }

  function audioOnlyMarkup(audio, reference, pitch) {
    const c = ui();
    const userSeconds = Math.max(.1, audio.duration).toFixed(1);
    const referenceSeconds = reference > 0 ? `${reference.toFixed(1)}s` : "—";
    return `
      <div class="ps-result-head"><div><small>${escapeHtml(c.audioOnlyTitle)}</small></div></div>
      <div class="ps-audio-only-stats"><p><small>${escapeHtml(c.duration)}</small><b>${userSeconds}s</b></p><p><small>${escapeHtml(c.reference)}</small><b>${referenceSeconds}</b></p></div>
      ${pitchMarkup(pitch)}
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
    const [buffer, modelBuffer] = await Promise.all([decodeBlob(blob), referenceBuffer(model.audioKey)]);
    if (session.id !== state.runId || session.cancelled) return;
    const reference = modelBuffer?.duration || await referenceDuration(model.audioKey, model.target);
    const pitch = await analysePitch(modelBuffer, buffer);
    if (session.id !== state.runId || session.cancelled) return;
    const audio = analyseAudio(buffer, fallbackDuration);
    const rhythm = scoreRhythm(audio, reference);
    const result = state.root?.querySelector(".ps-result");
    if (session.audioOnly || !session.transcript) {
      if (result) { result.hidden = false; result.innerHTML = audioOnlyMarkup(audio, reference, pitch); }
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
      result.innerHTML = resultMarkup(model.target, session.transcript, textResult, rhythm, pitch, overall, model.modelKey);
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

  const api = {
    init,
    destroy,
    stop: () => stopSession({ abort: true }),
    scoreText,
    normalize,
    analysePitch,
    compareContours,
    version: VERSION
  };
  globalThis.PronunciationScorer = api;
})();
