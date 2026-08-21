(function () {
  "use strict";

  const THAI = /[\u0E00-\u0E7F]/;
  const HAN = /[\u3400-\u9FFF]/;
  const DEDICATED_AUDIO = [
    "#speak-vibe", "#speak-vibe-slow", "#partner-audio", "#speak-npc",
    "#conversation-listen", "#vocab-quiz-audio", ".phrase-audio",
    "[data-vocab-audio]", "[data-vocab-slow-audio]", ".arcade-audio-orb",
    "[data-register-audio]", "#preview-alai-voice", "#preview-sugarblade-voice", "[data-pc-action]"
  ].join(",");
  const INTERACTIVE = "button, a, [role='button'], [data-tap-speak], [lang]:not(html):not(body), h1, h2, h3, h4, p, label, strong, b";
  const SKIP = "input, textarea, select, option, audio, video, [data-speech-skip], #record-practice, #start-local-voice, #live-send";
  const VOICE_HINTS = {
    "th-TH": ["premwadee", "natural", "neural", "google", "microsoft", "narisa", "kanya"],
    "zh-CN": ["xiaoxiao", "xiaoyi", "natural", "neural", "google", "microsoft", "huihui", "yaoyao"]
  };
  // V9「奶糖」点读：正常档保持接近日常语速，避免旧版慢拖后糊字；
  // 轻抬音高只用于设备 TTS，固定角色/课程音频使用单独的神经声线母带。
  const DEFAULT_RATE = { "th-TH": .92, "zh-CN": .94 };
  const SLOW_RATE = { "th-TH": .76, "zh-CN": .78 };
  const DEFAULT_PITCH = { "th-TH": 1.1, "zh-CN": 1.14 };
  const MAX_PITCH = { "th-TH": 1.13, "zh-CN": 1.17 };

  let voices = [];
  let activeUtterance = null;
  let activeAudio = null;
  let activeElement = null;
  let sequenceId = 0;
  let statusTimer = 0;

  function normalizeLang(lang, text = "") {
    const value = String(lang || "").toLowerCase();
    if (value.startsWith("th")) return "th-TH";
    if (value.startsWith("zh")) return "zh-CN";
    const hasThai = THAI.test(text);
    const hasHan = HAN.test(text);
    if (hasThai && hasHan) return document.documentElement.lang?.toLowerCase().startsWith("th") ? "th-TH" : "zh-CN";
    if (hasThai) return "th-TH";
    if (hasHan) return "zh-CN";
    return document.documentElement.lang?.toLowerCase().startsWith("th") ? "th-TH" : "zh-CN";
  }

  function cleanText(value, max = 180) {
    let text = String(value || "")
      .replace(/\s+/g, " ")
      .replace(/(?:中文近音|仅助记|拼音|罗马音|ฟังช้า|听发音|慢听)/g, " ")
      .trim();
    if (!text) return "";
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    const sentence = cut.match(/^.*?[。！？!?]/)?.[0];
    return (sentence || cut).trim();
  }

  function refreshVoices() {
    if (!("speechSynthesis" in window)) return [];
    voices = window.speechSynthesis.getVoices() || [];
    return voices;
  }

  function voiceScore(voice, lang) {
    const locale = String(voice.lang || "").toLowerCase();
    const exact = locale === lang.toLowerCase();
    const family = lang === "zh-CN"
      ? /^(zh-cn|zh-sg|zh-tw)(?:$|-)/.test(locale)
      : locale.startsWith(lang.slice(0, 2).toLowerCase());
    if (!family) return -1000;
    const name = String(voice.name || "").toLowerCase();
    let score = exact ? 80 : 45;
    if (voice.localService) score += 6;
    (VOICE_HINTS[lang] || []).forEach((hint, index) => {
      if (name.includes(hint)) score += 30 - index * 2;
    });
    if (/(xiaoxiao|xiaoyi|premwadee)/.test(name)) score += 54;
    if (/(natural|neural)/.test(name)) score += 44;
    if (/google/.test(name)) score += 34;
    if (/(compact|espeak|pattara|huihui|yaoyao)/.test(name)) score -= 20;
    return score;
  }

  function selectVoice(lang) {
    if (!voices.length) refreshVoices();
    const expected = lang.toLowerCase();
    return [...voices]
      .map(voice => {
        const locale = String(voice.lang || "").toLowerCase();
        const tier = locale === expected ? 3
          : (lang === "zh-CN" && locale.startsWith("zh-sg") ? 2
            : (lang === "zh-CN" && locale.startsWith("zh-tw") ? 1
              : (lang === "th-TH" && locale.startsWith("th-") ? 2 : 0)));
        return { voice, score: voiceScore(voice, lang), tier };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.tier - a.tier || b.score - a.score)[0]?.voice || null;
  }

  function statusNode() {
    let node = document.querySelector("#speech-status");
    if (node) return node;
    node = document.createElement("div");
    node.id = "speech-status";
    node.className = "speech-status";
    node.setAttribute("aria-hidden", "true");
    node.innerHTML = '<span class="speech-status-icon" aria-hidden="true"><i></i><i></i><i></i></span><span class="speech-status-copy"><b></b><small></small></span>';
    document.body.appendChild(node);
    return node;
  }

  function showStatus(text, lang, voice, state = "speaking") {
    const node = statusNode();
    clearTimeout(statusTimer);
    node.classList.toggle("is-speaking", state === "speaking");
    node.classList.add("is-visible");
    node.querySelector("b").textContent = cleanText(text, 46);
    const thaiUi = document.documentElement.lang?.toLowerCase().startsWith("th");
    const voiceName = String(voice?.name || "");
    const isMilkcandy = /(奶糖|นมหวาน)/i.test(voiceName);
    const isHighQuality = /(natural|neural|google|xiaoxiao|xiaoyi|premwadee|奶糖|นมหวาน|cute)/i.test(voiceName);
    const deviceVoice = voice
      ? (isMilkcandy
        ? (thaiUi ? "เสียงนมหวานออฟไลน์" : "奶糖离线萌音")
        : (isHighQuality ? (thaiUi ? "เสียงคุณภาพสูง" : "高清声线") : (thaiUi ? "เสียงระบบของเครื่อง" : "设备系统声线")))
      : (thaiUi ? "ใช้เสียงสำรองของระบบ" : "使用系统备用声线");
    node.querySelector("small").textContent = state === "error"
      ? (lang === "th-TH" ? (thaiUi ? "โปรดติดตั้งชุดเสียงภาษาไทย" : "请安装泰语语音包") : (thaiUi ? "โปรดติดตั้งชุดเสียงภาษาจีน" : "请安装中文语音包"))
      : `${lang === "th-TH" ? "ไทย" : "中文"} · ${deviceVoice}`;
    if (state !== "speaking") statusTimer = setTimeout(() => node.classList.remove("is-visible"), 1500);
  }

  function clearActive() {
    activeUtterance = null;
    activeAudio = null;
    activeElement?.classList.remove("speech-tap-active");
    activeElement = null;
    const node = document.querySelector("#speech-status");
    if (node) {
      node.classList.remove("is-speaking");
      statusTimer = setTimeout(() => node.classList.remove("is-visible"), 900);
    }
  }

  function stop() {
    sequenceId += 1;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
    }
    clearActive();
  }

  function bundledSource(text, lang) {
    const catalog = window.HUILAISHI_CUTE_AUDIO;
    if (!catalog) return "";
    if (typeof catalog.resolve === "function") return catalog.resolve(text, lang) || "";
    const normalized = String(text || "").replace(/\s+/g, " ").trim();
    return catalog[`${lang}|${normalized}`] || "";
  }

  function playBundled(text, lang, source, options, runId) {
    const audio = new Audio(source);
    const requestedRate = Number(options.rate);
    audio.preload = "auto";
    audio.volume = 0.96;
    audio.playbackRate = options.mode === "slow" || (Number.isFinite(requestedRate) && requestedRate <= .8) ? .88 : 1;
    if ("preservesPitch" in audio) audio.preservesPitch = true;
    if ("webkitPreservesPitch" in audio) audio.webkitPreservesPitch = true;
    audio.setAttribute("playsinline", "");
    activeAudio = audio;
    activeElement = options.element || null;
    activeElement?.classList.add("speech-tap-active");
    const voice = { name: lang === "th-TH" ? "奶糖离线泰语声线" : "奶糖离线中文声线" };
    const clear = () => { if (runId === sequenceId && activeAudio === audio) clearActive(); };
    audio.addEventListener("play", () => { if (runId === sequenceId) showStatus(text, lang, voice); }, { once: true });
    audio.addEventListener("ended", clear, { once: true });
    audio.addEventListener("error", () => {
      if (runId !== sequenceId || activeAudio !== audio) return;
      activeAudio = null;
      speak(text, { ...options, bundled: false, stopMedia: false });
    }, { once: true });
    showStatus(text, lang, voice);
    const playback = audio.play();
    playback?.catch(() => {
      if (runId !== sequenceId || activeAudio !== audio) return;
      activeAudio = null;
      speak(text, { ...options, bundled: false, stopMedia: false });
    });
    return { audio, lang, source };
  }

  function makeUtterance(text, options = {}) {
    const lang = normalizeLang(options.lang, text);
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = selectVoice(lang);
    const voiceMissing = voices.length > 0 && !voice;
    utterance.lang = lang;
    if (voice) utterance.voice = voice;
    const base = options.mode === "slow" ? SLOW_RATE[lang] : DEFAULT_RATE[lang];
    utterance.rate = Math.min(1.05, Math.max(.58, Number(options.rate ?? base)));
    utterance.pitch = Math.min(MAX_PITCH[lang], Math.max(.94, Number(options.pitch ?? DEFAULT_PITCH[lang])));
    utterance.volume = 1;
    return { utterance, voice, lang, voiceMissing };
  }

  function speak(value, options = {}) {
    const text = cleanText(value, options.maxLength || 220);
    if (!text) return false;
    if (options.stopMedia !== false) {
      window.stopAlaiVoice?.();
      window.ArcadeUI?.stopVoice?.();
      window.PronunciationCourse?.stopAudio?.();
    }
    const runId = ++sequenceId;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
    }
    activeElement?.classList.remove("speech-tap-active");
    activeElement = null;
    const bundledLang = normalizeLang(options.lang, text);
    const source = options.bundled === false ? "" : bundledSource(text, bundledLang);
    if (source) return playBundled(text, bundledLang, source, options, runId);
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      showStatus(text, bundledLang, null, "error");
      return false;
    }
    const { utterance, voice, lang, voiceMissing } = makeUtterance(text, options);
    if (voiceMissing) {
      clearActive();
      showStatus(text, lang, null, "error");
      return false;
    }
    activeUtterance = utterance;
    activeElement?.classList.remove("speech-tap-active");
    activeElement = options.element || null;
    activeElement?.classList.add("speech-tap-active");
    utterance.onstart = () => { if (runId === sequenceId) showStatus(text, lang, voice); };
    utterance.onend = () => { if (runId === sequenceId) clearActive(); };
    utterance.onerror = () => {
      if (runId !== sequenceId) return;
      clearActive();
      showStatus(text, lang, voice, "error");
    };
    showStatus(text, lang, voice);
    window.speechSynthesis.speak(utterance);
    return { utterance, voice, lang };
  }

  function speakSequence(parts, options = {}) {
    const items = (parts || []).map(item => typeof item === "string" ? { text: item } : item).filter(item => cleanText(item.text));
    if (!items.length || !("speechSynthesis" in window)) return false;
    if (options.stopMedia !== false) {
      window.stopAlaiVoice?.();
      window.ArcadeUI?.stopVoice?.();
      window.PronunciationCourse?.stopAudio?.();
    }
    const runId = ++sequenceId;
    window.speechSynthesis.cancel();
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
    }
    activeElement?.classList.remove("speech-tap-active");
    activeElement = null;
    activeElement = options.element || null;
    activeElement?.classList.add("speech-tap-active");
    let index = 0;
    const playNext = () => {
      if (runId !== sequenceId || index >= items.length) return;
      const item = items[index];
      const result = makeUtterance(cleanText(item.text), { ...options, ...item });
      if (result.voiceMissing) {
        clearActive();
        showStatus(item.text, result.lang, null, "error");
        return;
      }
      activeUtterance = result.utterance;
      result.utterance.onstart = () => { if (runId === sequenceId) showStatus(item.text, result.lang, result.voice); };
      result.utterance.onend = () => {
        if (runId !== sequenceId) return;
        index += 1;
        if (index >= items.length) clearActive();
        else setTimeout(playNext, Math.max(80, Number(options.gap || 120)));
      };
      result.utterance.onerror = () => {
        if (runId !== sequenceId) return;
        clearActive();
        showStatus(item.text, result.lang, result.voice, "error");
      };
      window.speechSynthesis.speak(result.utterance);
    };
    playNext();
    return { stop, id: runId };
  }

  function shortLabel(element, raw) {
    const explicit = element.dataset.speakText;
    if (explicit) return cleanText(explicit, 90);
    const exact = raw?.closest?.("[data-speak-text], [lang], h1, h2, h3, h4, p, strong, b");
    if (exact && element.contains(exact) && !exact.closest(".thai-phonetic-hint")) {
      const exactText = exact.dataset.speakText || exact.textContent;
      if (cleanText(exactText, 90)) return cleanText(exactText, 90);
    }
    const accessible = element.getAttribute("aria-label");
    if (accessible) return cleanText(accessible, 90);
    const preferred = element.matches("[lang]") ? element : element.querySelector("[data-speak-primary], [lang], h1, h2, h3, strong, b");
    if (preferred?.textContent?.trim()) return cleanText(preferred.textContent, 90);
    return cleanText(element.textContent, 90);
  }

  function tapPayload(event) {
    const raw = event.target instanceof Element ? event.target : null;
    if (!raw || raw.closest(SKIP) || raw.closest(DEDICATED_AUDIO) || raw.closest("[data-speech-policy='native'], [data-speech-policy='none']")) return null;
    const explicit = raw.closest("[data-speak-text], [data-tap-speak]");
    const actionable = raw.closest("button, a, [role='button']");
    const element = actionable && explicit && actionable !== explicit && explicit.contains(actionable)
      ? actionable
      : (explicit || raw.closest(INTERACTIVE));
    if (!element || element.closest("[aria-hidden='true']")) return null;
    const text = shortLabel(element, raw);
    if (!text || /^[\d\s+%·.\-/]+$/.test(text)) return null;
    const langNode = element.matches("[lang]") ? element : element.querySelector("[lang]");
    const lang = normalizeLang(element.dataset.speakLang || langNode?.lang, text);
    return { element, text, lang };
  }

  function handleTap(event) {
    const payload = tapPayload(event);
    if (!payload) return;
    // Some polished workplace replies exceed 90 characters. Keep enough text for the
    // bundled-audio identity to match instead of silently falling back to device TTS.
    speak(payload.text, { lang: payload.lang, element: payload.element, mode: payload.element.dataset.speakMode || "normal", maxLength: 180 });
  }

  function handleKeydown(event) {
    if (event.repeat) return;
    if (!event.target?.matches?.("[data-tap-speak]:not(button):not(a), [role='button']:not(button):not(a)")) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.target.click();
  }

  refreshVoices();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
    window.addEventListener("pagehide", stop);
  }
  document.addEventListener("click", handleTap);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("pointerdown", refreshVoices, { once: true, capture: true });

  window.HUILAISHI_SPEECH = {
    speak,
    speakSequence,
    stop,
    refreshVoices,
    selectVoice,
    normalizeLang,
    inspect: () => ({ voices: refreshVoices().map(voice => ({ name: voice.name, lang: voice.lang, local: voice.localService })) })
  };
})();
