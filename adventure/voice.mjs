import {stopCreatureAudio} from './assets/creature-audio/player.mjs?v=0.4.4';
let activeAudio = null,
  utterance = null,
  recognizer = null,
  nativeId = null,
  voiceTimer = null,
  generation = 0,
  cancelPlayback = null;
let indexPromise;
export function audioIndex() {
  return (
    indexPromise ||
    (indexPromise = fetch(new URL("./data/audio-index.json", import.meta.url))
      .then((r) => {
        if (!r.ok) throw Error("audio-index");
        return r.json();
      })
      .then(async index => {
        const r = await fetch(new URL('./data/campaign-voice.json',import.meta.url)).catch(()=>null);
        if(r?.ok){const manifest=await r.json();for(const e of manifest.entries||[])if(e.ready)index[e.language+':'+e.text.normalize('NFC')]='@/'+e.file;}
        return index;
      })
      .catch(() => ({})))
  );
}
export function stopAudio() {
  stopCreatureAudio();
  generation++;
  const finish = cancelPlayback;
  cancelPlayback = null;
  finish?.();
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.removeAttribute("src");
    activeAudio.load();
    activeAudio = null;
  }
  if (globalThis.speechSynthesis) speechSynthesis.cancel();
  utterance = null;
}
export async function speak(
  text,
  lang,
  { rate = 0.88, onState = () => {} } = {},
) {
  stopAudio();
  const token = generation;
  const index = await audioIndex();
  if (token !== generation) return false;
  const clip = index[lang + ":" + text.normalize("NFC")];
  if (clip) {
    return new Promise((resolve) => {
      const a = new Audio(new URL(clip.startsWith('@/') ? './'+clip.slice(2) : '../'+clip, import.meta.url).href);
      activeAudio = a;
      a.playbackRate = rate;
      let settled = false;
      const done = (ok) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        a.onended = a.onerror = null;
        cancelPlayback = null;
        if (token === generation) onState(ok ? "ended" : "unavailable");
        resolve(ok);
      };
      const timer = setTimeout(() => done(false), 45000);
      cancelPlayback = () => done(false);
      a.onended = () => done(true);
      a.onerror = () => done(false);
      onState("playing");
      a.play().catch(() => done(false));
    });
  }
  if (!globalThis.speechSynthesis) {
    onState("unavailable");
    return false;
  }
  let voices = speechSynthesis.getVoices();
  if (!voices.length) await new Promise((resolve) => setTimeout(resolve, 180));
  if (token !== generation) return false;
  voices = speechSynthesis
    .getVoices()
    .filter((v) =>
      v.lang.toLowerCase().startsWith(lang === "th" ? "th" : "zh"),
    );
  if (!voices.length) {
    onState("unavailable");
    return false;
  }
  voices.sort((a, b) => Number(b.localService) - Number(a.localService));
  return new Promise((resolve) => {
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "th" ? "th-TH" : "zh-CN";
    utterance.rate = rate;
    utterance.voice = voices[0];
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cancelPlayback = null;
      if (token === generation) onState(ok ? "ended" : "unavailable");
      resolve(ok);
    };
    const timer = setTimeout(() => finish(false), 50000);
    cancelPlayback = () => finish(false);
    utterance.onend = () => finish(true);
    utterance.onerror = () => finish(false);
    onState("device-voice");
    speechSynthesis.speak(utterance);
  });
}
export function cancelVoice() {
  if (voiceTimer) clearTimeout(voiceTimer);
  voiceTimer = null;
  if (nativeId && globalThis.XulongNativeVoice) {
    try {
      XulongNativeVoice.postMessage(
        JSON.stringify({ id: nativeId, action: "cancel" }),
      );
    } catch {}
    nativeId = null;
    XulongNativeVoice.onmessage = null;
  }
  if (recognizer) {
    const r = recognizer;
    recognizer = null;
    r.onresult = r.onerror = r.onend = null;
    try {
      r.abort();
    } catch {}
  }
}
export function stopVoice() {
  if (nativeId && globalThis.XulongNativeVoice) {
    XulongNativeVoice.postMessage(
      JSON.stringify({ id: nativeId, action: "stop" }),
    );
    return;
  }
  try {
    recognizer?.stop();
  } catch {}
}
export function startVoice(
  lang,
  {
    allowNetwork = false,
    maxMs = 16000,
    onState = () => {},
    onResult = () => {},
  } = {},
) {
  cancelVoice();
  stopAudio();
  const language = lang === "th" ? "th-TH" : "zh-CN";
  if (globalThis.XulongNativeVoice?.postMessage) {
    const id = "voice-" + Date.now() + "-" + Math.floor(Math.random() * 1e6);
    nativeId = id;
    XulongNativeVoice.onmessage = (event) => {
      let result;
      try {
        result = JSON.parse(event.data);
      } catch {
        return;
      }
      if (result.id !== nativeId) return;
      onState(result.status, result);
      if (result.status === "result") {
        const text = result.transcript;
        cancelVoice();
        onResult(text);
      } else if (
        !["preparing", "listening", "processing", "interim"].includes(
          result.status,
        )
      ) {
        cancelVoice();
      }
    };
    onState("preparing");
    voiceTimer = setTimeout(() => {
      cancelVoice();
      onState("timeout");
    }, maxMs + 7000);
    try { XulongNativeVoice.postMessage(
      JSON.stringify({
        id,
        action: "start",
        lang: language,
        allowNetwork,
        maxMs,
      }),
    ); } catch { cancelVoice(); onState('native-bridge-missing'); return false; }
    return true;
  }
  if (globalThis.HuilaishiNative) { onState('native-bridge-missing'); return false; }
  if (globalThis.isSecureContext === false) { onState('insecure-context'); return false; }
  const SR = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
  if (!SR) {
    onState("none");
    return false;
  }
  if (!allowNetwork) {
    onState("network-consent");
    return false;
  }
  try {
    recognizer = new SR();
    recognizer.lang = language;
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;
    recognizer.continuous = false;
    let settled = false;
    const r = recognizer;
    r.onstart = () => onState("listening");
    r.onresult = (e) => {
      if (settled) return;
      settled = true;
      const text = e.results?.[0]?.[0]?.transcript || "";
      cancelVoice();
      if (text) onResult(text);
      else onState("no-speech");
    };
    r.onerror = (e) => {
      if (settled) return;
      settled = true;
      cancelVoice();
      onState(e.error || "recognition-error");
    };
    r.onend = () => {
      if (!settled) {
        settled = true;
        cancelVoice();
        onState("no-speech");
      }
    };
    r.start();
    onState("preparing");
    voiceTimer = setTimeout(() => {
      cancelVoice();
      onState("timeout");
    }, maxMs);
    return true;
  } catch {
    cancelVoice();
    onState("start-failed");
    return false;
  }
}
