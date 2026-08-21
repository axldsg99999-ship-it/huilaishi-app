(() => {
  "use strict";

  const MAX_RECORDING_MS = 60000;

  const state = {
    initialized: false, tab: "live", module: null, session: null, role: "", stage: "hub", verification: "", offer: "", answer: "",
    messages: [], recorder: null, stream: null, chunks: [], recordStarted: 0, recording: null, recordingUrl: "", voiceUrls: new Set(),
    recordStarting: false, recordRun: 0, recordTimer: 0,
    correctionId: "", bodyObserver: null, lastDirection: "zh-th", lastFocus: null
  };
  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const direction = () => document.body.classList.contains("dir-th-zh") ? "th-zh" : "zh-th";
  const thaiUi = () => direction() === "th-zh";
  const targetLanguage = () => direction() === "zh-th" ? "th" : "zh";
  const config = () => window.HUILAISHI_PARTNER_CONFIG || {};
  const copy = () => thaiUi() ? {
    liveTab: "คู่ฝึกจริง", aiTab: "ฝึกกับ AI", eyebrow: "คู่ฝึกจริงวันนี้", title: "ชวนเพื่อนมาผลัดกันพูด",
    cardCopy: "เชื่อมต่อกับคนที่คุณรู้จัก ส่งข้อความ แก้ประโยค และฝากเสียงแบบคนละประโยค", open: "สร้างห้องเชิญ", trust: "คนจริง · ไม่มีคู่ฝึกปลอม",
    offline: "ตอนนี้ออฟไลน์ ฝึกกับ AI ต่อได้", centralOff: "การจับคู่แบบสุ่มยังไม่เปิด แต่ห้องเชิญเพื่อนใช้งานได้ทันที",
    sheetTitle: "ห้องฝึกกับเพื่อนจริง", close: "ย่อห้องคู่ฝึก", adult: "ฉันอายุ 18 ปีขึ้นไป และจะส่งรหัสเชิญให้คนที่ไว้ใจเท่านั้น",
    privacy: "รหัสเชิญอาจมีข้อมูลเครือข่าย ส่งให้เฉพาะคนที่ไว้ใจและตรวจรหัสยืนยันให้ตรงกัน ข้อความอยู่ในหน่วยความจำและหายเมื่อรีเฟรช",
    host: "ฉันสร้างคำเชิญ", guest: "ฉันมีรหัสเชิญ", random: "จับคู่แบบสุ่ม", disabled: "ยังไม่เปิดใช้",
    offerTitle: "1 · ส่งรหัสนี้ให้เพื่อน", offerNote: "รหัสหมดอายุใน 15 นาที เพื่อนจะส่งรหัสตอบกลับมาให้คุณ", answerPaste: "2 · วางรหัสตอบกลับ", connect: "เชื่อมต่อ",
    guestTitle: "วางรหัสเชิญจากเพื่อน", accept: "สร้างรหัสตอบกลับ", answerTitle: "ส่งรหัสตอบกลับให้ผู้เชิญ", waiting: "รอให้อีกฝ่ายเชื่อมต่อ…",
    copy: "คัดลอก", share: "แชร์", copied: "คัดลอกแล้ว", verify: "ตรวจรหัสนี้ผ่านช่องทางอื่น", loading: "กำลังสร้างการเชื่อมต่อจริง…",
    connected: "เชื่อมต่อกับเพื่อนจริงแล้ว", task: "ภารกิจ 5 นาที · ผลัดกันส่ง 1 ประโยค แล้วช่วยแก้ให้เป็นธรรมชาติ",
    placeholder: "พิมพ์ประโยคที่อยากฝึก", send: "ส่งข้อความ", record: "อัดเสียง", stop: "หยุดอัด", sendVoice: "ส่งเสียงนี้", discard: "ลบเสียง",
    correct: "ช่วยแก้", correction: "ประโยคที่เป็นธรรมชาติกว่า", note: "เหตุผลหรือบริบท (ไม่บังคับ)", sendCorrection: "ส่งคำแก้", cancel: "ยกเลิก",
    me: "ฉัน", peer: "คู่ฝึก", voice: "ข้อความเสียง", play: "ฟัง", report: "บันทึกเหตุการณ์", block: "บล็อกครั้งนี้", end: "จบการฝึก",
    localReport: "ดาวน์โหลดหลักฐานไว้ในเครื่องแล้ว ยังไม่ได้ส่งรายงานให้แพลตฟอร์ม", blocked: "บล็อกและปิดการเชื่อมต่อครั้งนี้แล้ว", ended: "จบห้องแล้ว",
    contact: "อย่าส่งลิงก์ เบอร์โทร หรือข้อมูลติดต่อในห้องฝึก", tooLong: "ข้อความยาวเกินไป", unsupported: "อุปกรณ์นี้เปิดห้องเชื่อมต่อโดยตรงไม่ได้ ใช้เวอร์ชัน HTTPS บนเบราว์เซอร์รุ่นใหม่",
    mic: "ต้องอนุญาตไมโครโฟนก่อน", voiceReady: "อัดแล้ว ฟังตรวจสอบก่อนกดส่ง", sending: "กำลังส่ง…", sent: "ส่งแล้ว", error: "เชื่อมต่อไม่สำเร็จ ลองสร้างรหัสใหม่หรือเปลี่ยนเครือข่าย",
    noServer: "ไม่มีบัญชี ไม่มีประวัติถาวร และไม่มีการรายงานส่วนกลาง โหมดนี้ใช้ WebRTC ที่เข้ารหัสระหว่างอุปกรณ์ แต่ STUN อาจเห็น IP และบางเครือข่ายต้องใช้ TURN",
    switchAi: "กลับไปฝึกกับ AI"
  } : {
    liveTab: "真人语伴", aiTab: "AI 体验", eyebrow: "今日真实语伴", title: "邀请朋友，一句换一句",
    cardCopy: "和你认识的人真实连接：发文字、互改表达、发送语音留言。", open: "创建邀请房", trust: "真人直连 · 不伪造在线状态",
    offline: "当前离线，可继续 AI 体验局", centralOff: "随机匹配尚未启用，但邀请认识的人现在就能用。",
    sheetTitle: "真人互助房", close: "收起真人语伴房", adult: "我已满 18 岁，并且只把邀请码发给我信任的人",
    privacy: "邀请码可能包含网络信息，只发给信任的人，并通过其他渠道核对验证码。消息只留在内存，刷新页面即清空。",
    host: "我来创建邀请", guest: "我有朋友的邀请码", random: "随机匹配", disabled: "尚未启用",
    offerTitle: "1 · 把这段邀请码发给朋友", offerNote: "邀请码 15 分钟后失效。朋友会把回答码发回来。", answerPaste: "2 · 粘贴朋友的回答码", connect: "连接朋友",
    guestTitle: "粘贴朋友发来的邀请码", accept: "生成回答码", answerTitle: "把回答码发回给邀请人", waiting: "等待邀请人完成连接…",
    copy: "复制", share: "分享", copied: "已复制", verify: "请通过另一条可信渠道核对验证码", loading: "正在建立真实连接…",
    connected: "真人已连接", task: "5 分钟任务 · 每人发一句，再帮对方改得更自然",
    placeholder: "输入你想练的句子", send: "发送文字", record: "录一段", stop: "停止录音", sendVoice: "发送这段语音", discard: "删除录音",
    correct: "帮 TA 改", correction: "更自然的说法", note: "原因或场合说明（可选）", sendCorrection: "发送修改", cancel: "取消",
    me: "我", peer: "语伴", voice: "语音留言", play: "播放", report: "保存事件证据", block: "屏蔽本次会话", end: "结束互助",
    localReport: "证据已下载到本机；当前没有提交到平台，也不会假装已受理。", blocked: "已屏蔽并关闭本次连接", ended: "本次互助已结束",
    contact: "练习房不发送链接、手机号或社交账号。", tooLong: "文字太长了", unsupported: "此设备不能建立点对点邀请房；请用 HTTPS 在线版和新版浏览器。",
    mic: "需要先允许麦克风权限", voiceReady: "录好了，先试听，确认后再发送。", sending: "正在发送…", sent: "已发送", error: "连接没有成功，请重建邀请码或换个网络。",
    noServer: "无账号、无永久聊天记录、无中央举报。此模式用 WebRTC 加密直连，但 STUN 服务会看到 IP，部分网络还需要 TURN 才能连通。",
    switchAi: "切回 AI 体验"
  };

  function notify(message) { if (window.showToast) window.showToast(message); else setStatus(message); }
  function setStatus(message, tone = "") { const node = $("#partner-live-status"); if (node) { node.textContent = message; node.dataset.tone = tone; } }
  function adultAccepted() { try { return localStorage.getItem("huilaishi-partner-adult") === "1"; } catch (_) { return false; } }
  function rememberAdult() { try { localStorage.setItem("huilaishi-partner-adult", "1"); } catch (_) {} }
  function available() { return window.isSecureContext && typeof RTCPeerConnection === "function" && Boolean(crypto?.subtle) && config().manualInviteEnabled !== false && location.protocol !== "file:"; }

  function inject() {
    const section = $(".partner-section");
    const aiCard = $("#open-partner");
    if (!section || !aiCard || $("#partner-mode-tabs")) return;
    aiCard.removeAttribute("role");
    aiCard.removeAttribute("tabindex");
    aiCard.removeAttribute("data-tap-speak");
    aiCard.dataset.partnerMode = "ai";
    aiCard.classList.add("partner-ai-card");
    const heading = section.querySelector(".partner-heading");
    heading?.insertAdjacentHTML("afterend", `<div class="partner-mode-tabs" id="partner-mode-tabs" role="tablist"><button type="button" role="tab" data-partner-tab="live" aria-selected="true"></button><button type="button" role="tab" data-partner-tab="ai" aria-selected="false"></button></div>`);
    aiCard.insertAdjacentHTML("beforebegin", `
      <article class="partner-live-card" id="partner-live-card" data-partner-mode="live">
        <div class="partner-live-top"><span class="partner-live-mark" aria-hidden="true">中 ↔ ท</span><span class="partner-live-trust" id="partner-live-trust"></span></div>
        <p class="eyebrow dark" id="partner-live-eyebrow"></p><h3 id="partner-live-title"></h3><p id="partner-live-copy"></p>
        <div class="partner-live-state"><i></i><span id="partner-live-state"></span></div>
        <button type="button" class="partner-live-open" id="open-live-partner" data-speech-policy="none" aria-controls="partner-live-sheet" aria-expanded="false"></button>
      </article>`);
    $("#partner-sheet")?.insertAdjacentHTML("beforebegin", `
      <section class="bottom-sheet partner-live-sheet hidden" id="partner-live-sheet" role="dialog" aria-modal="true" aria-labelledby="partner-live-sheet-title">
        <div class="sheet-handle"></div>
        <div class="partner-live-sheet-head"><div><p class="eyebrow dark">HUMAN RELAY · P2P</p><h2 id="partner-live-sheet-title"></h2></div><button class="round-icon light" type="button" data-partner-live-action="close" data-speech-policy="none" aria-label="关闭"><svg><use href="#i-x"></use></svg></button></div>
        <p class="partner-live-status" id="partner-live-status" role="status" aria-live="polite"></p>
        <div class="partner-live-body" id="partner-live-body"></div>
      </section>`);
  }

  function applyCopy() {
    const c = copy();
    const tabs = $("#partner-mode-tabs");
    if (!tabs) return;
    tabs.querySelector("[data-partner-tab='live']").textContent = c.liveTab;
    tabs.querySelector("[data-partner-tab='ai']").textContent = c.aiTab;
    $("#partner-live-trust").textContent = c.trust;
    $("#partner-live-eyebrow").textContent = c.eyebrow;
    $("#partner-live-title").textContent = c.title;
    $("#partner-live-copy").textContent = c.cardCopy;
    $("#open-live-partner").textContent = c.open;
    $("#partner-live-sheet-title").textContent = c.sheetTitle;
    $("[data-partner-live-action='close']").setAttribute("aria-label", c.close);
    $("#partner-live-state").textContent = navigator.onLine ? c.centralOff : c.offline;
    renderTab();
    renderStage();
  }

  function renderTab() {
    const live = state.tab === "live";
    $("#partner-live-card")?.classList.toggle("hidden", !live);
    $("#open-partner")?.classList.toggle("hidden", live);
    document.querySelectorAll("[data-partner-tab]").forEach(button => {
      const active = button.dataset.partnerTab === state.tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  function hubMarkup() {
    const c = copy();
    const accepted = adultAccepted();
    const support = available();
    return `<div class="partner-live-hub">
      <div class="partner-live-notice"><b>${escapeHtml(c.centralOff)}</b><p>${escapeHtml(c.noServer)}</p></div>
      <label class="partner-adult"><input type="checkbox" id="partner-adult" ${accepted ? "checked" : ""}><span>${escapeHtml(c.adult)}</span></label>
      <div class="partner-live-actions">
        <button type="button" data-partner-live-action="host" ${support ? "" : "disabled"}><span>01</span><b>${escapeHtml(c.host)}</b></button>
        <button type="button" data-partner-live-action="guest" ${support ? "" : "disabled"}><span>02</span><b>${escapeHtml(c.guest)}</b></button>
        <button type="button" disabled><span>—</span><b>${escapeHtml(c.random)}</b><small>${escapeHtml(c.disabled)}</small></button>
      </div>
      ${support ? "" : `<p class="partner-live-error">${escapeHtml(c.unsupported)}</p>`}
      <p class="partner-live-privacy">${escapeHtml(c.privacy)}</p>
    </div>`;
  }

  function codeBlock(label, value, key) {
    const c = copy();
    return `<div class="partner-code"><label>${escapeHtml(label)}</label><textarea readonly id="partner-${key}-code" spellcheck="false">${escapeHtml(value)}</textarea><div><button type="button" data-partner-live-action="copy" data-copy-target="partner-${key}-code">${escapeHtml(c.copy)}</button><button type="button" data-partner-live-action="share" data-copy-target="partner-${key}-code">${escapeHtml(c.share)}</button></div></div>`;
  }

  function setupMarkup() {
    const c = copy();
    if (state.stage === "loading") return `<div class="partner-connect-loading"><i></i><p>${escapeHtml(c.loading)}</p></div>`;
    if (state.stage === "host-offer") return `${codeBlock(c.offerTitle, state.offer, "offer")}<p class="partner-code-note">${escapeHtml(c.offerNote)}</p><div class="partner-verify"><small>${escapeHtml(c.verify)}</small><b>${escapeHtml(state.verification)}</b></div><label class="partner-code-input"><span>${escapeHtml(c.answerPaste)}</span><textarea id="partner-answer-input" spellcheck="false"></textarea></label><button class="primary-btn partner-connect" type="button" data-partner-live-action="accept-answer">${escapeHtml(c.connect)}</button>`;
    if (state.stage === "guest-input") return `<label class="partner-code-input"><span>${escapeHtml(c.guestTitle)}</span><textarea id="partner-offer-input" spellcheck="false"></textarea></label><button class="primary-btn partner-connect" type="button" data-partner-live-action="accept-offer">${escapeHtml(c.accept)}</button><p class="partner-live-privacy">${escapeHtml(c.privacy)}</p>`;
    if (state.stage === "guest-answer") return `${codeBlock(c.answerTitle, state.answer, "answer")}<div class="partner-verify"><small>${escapeHtml(c.verify)}</small><b>${escapeHtml(state.verification)}</b></div><p class="partner-waiting"><i></i>${escapeHtml(c.waiting)}</p>`;
    return hubMarkup();
  }

  function messageMarkup(message) {
    const c = copy();
    if (message.type === "correction") return `<article class="partner-message correction"><small>${message.mine ? escapeHtml(c.me) : escapeHtml(c.peer)} · ✎</small><p>${escapeHtml(message.correctedText)}</p>${message.note ? `<em>${escapeHtml(message.note)}</em>` : ""}</article>`;
    if (message.type === "voice") return `<article class="partner-message ${message.mine ? "mine" : "peer"}"><small>${message.mine ? escapeHtml(c.me) : escapeHtml(c.peer)} · ${escapeHtml(c.voice)}</small><button type="button" data-partner-live-action="play-voice" data-voice-index="${message.voiceIndex}">▶ ${escapeHtml(c.play)} · ${(message.durationMs / 1000).toFixed(1)}s</button></article>`;
    return `<article class="partner-message ${message.mine ? "mine" : "peer"}" data-message-id="${escapeHtml(message.id)}"><small>${message.mine ? escapeHtml(c.me) : escapeHtml(c.peer)}</small><p lang="${message.language === "th" ? "th" : "zh-CN"}">${escapeHtml(message.body)}</p>${message.mine ? "" : `<button type="button" data-partner-live-action="correct" data-message-id="${escapeHtml(message.id)}">${escapeHtml(c.correct)}</button>`}</article>`;
  }

  function connectedMarkup() {
    const c = copy();
    const correction = state.correctionId ? `<div class="partner-correction-box"><input id="partner-correction-text" maxlength="1000" placeholder="${escapeHtml(c.correction)}"><input id="partner-correction-note" maxlength="500" placeholder="${escapeHtml(c.note)}"><div><button type="button" data-partner-live-action="send-correction">${escapeHtml(c.sendCorrection)}</button><button type="button" data-partner-live-action="cancel-correction">${escapeHtml(c.cancel)}</button></div></div>` : "";
    const preview = state.recording ? `<div class="partner-record-preview"><audio controls src="${escapeHtml(state.recordingUrl)}"></audio><div><button type="button" data-partner-live-action="send-voice">${escapeHtml(c.sendVoice)}</button><button type="button" data-partner-live-action="discard-voice">${escapeHtml(c.discard)}</button></div></div>` : "";
    return `<div class="partner-connected">
      <div class="partner-connected-head"><span><i></i>${escapeHtml(c.connected)}</span><b>${escapeHtml(state.verification)}</b></div>
      <p class="partner-task">${escapeHtml(c.task)}</p>
      <div class="partner-message-list" id="partner-message-list" role="log" aria-live="polite">${state.messages.map(messageMarkup).join("") || `<p class="partner-empty-chat">${escapeHtml(c.task)}</p>`}</div>
      ${correction}
      <div class="partner-composer"><textarea id="partner-live-text" maxlength="1000" placeholder="${escapeHtml(c.placeholder)}"></textarea><div><button type="button" data-partner-live-action="send-text">${escapeHtml(c.send)}</button><button type="button" data-partner-live-action="record">● ${escapeHtml(c.record)}</button></div></div>
      ${preview}
      <div class="partner-safety-actions"><button type="button" data-partner-live-action="report">${escapeHtml(c.report)}</button><button type="button" data-partner-live-action="block">${escapeHtml(c.block)}</button><button type="button" data-partner-live-action="end">${escapeHtml(c.end)}</button></div>
    </div>`;
  }

  function renderStage(options = {}) {
    const body = $("#partner-live-body");
    if (!body) return;
    const active = document.activeElement;
    const activeId = body.contains(active) ? active.id : "";
    const draft = body.querySelector("#partner-live-text")?.value || "";
    const correctionText = body.querySelector("#partner-correction-text")?.value || "";
    const correctionNote = body.querySelector("#partner-correction-note")?.value || "";
    body.innerHTML = state.stage === "connected" ? connectedMarkup() : setupMarkup();
    body.querySelectorAll("[data-partner-live-action]").forEach(button => { button.dataset.speechPolicy = "none"; });
    const draftInput = body.querySelector("#partner-live-text");
    const correctionInput = body.querySelector("#partner-correction-text");
    const noteInput = body.querySelector("#partner-correction-note");
    if (draftInput) draftInput.value = draft;
    if (correctionInput) correctionInput.value = correctionText;
    if (noteInput) noteInput.value = correctionNote;
    requestAnimationFrame(() => {
      if (state.stage === "connected") {
        const log = $("#partner-message-list");
        if (log) log.scrollTop = log.scrollHeight;
      }
      const sheet = $("#partner-live-sheet");
      if (!sheet || sheet.classList.contains("hidden")) return;
      const sameControl = activeId ? document.getElementById(activeId) : null;
      const fallback = body.querySelector(
        "#partner-correction-text, #partner-live-text, #partner-answer-input, #partner-offer-input, #partner-offer-code, #partner-answer-code, #partner-adult, button:not(:disabled)"
      ) || sheet.querySelector("[data-partner-live-action='close']");
      if (options.focus || !sheet.contains(document.activeElement)) (sameControl || fallback)?.focus?.();
    });
  }

  async function loadTransport() {
    if (state.module) return state.module;
    const source = new URL(config().p2pModule || "partner/manual-peer.js", document.baseURI).href;
    state.module = await import(source);
    return state.module;
  }

  function requireAdult() {
    const input = $("#partner-adult");
    if (adultAccepted() || input?.checked) { rememberAdult(); return true; }
    input?.focus();
    setStatus(copy().adult, "warn");
    return false;
  }

  function bindSession(session) {
    state.session = session;
    session.addEventListener("state", event => {
      const next = event.detail.state;
      if (next === "connected") { state.stage = "connected"; setStatus(copy().connected, "ok"); renderStage({ focus: true }); }
      else if (["failed", "timed-out", "disconnected"].includes(next)) setStatus(copy().error, "error");
    });
    session.addEventListener("text", event => { state.messages.push({ ...event.detail, mine: false, type: "text" }); renderStage(); });
    session.addEventListener("correction", event => { state.messages.push({ ...event.detail, mine: false, type: "correction" }); renderStage(); });
    session.addEventListener("voice", event => {
      const url = URL.createObjectURL(event.detail.blob);
      state.voiceUrls.add(url);
      state.messages.push({ ...event.detail, mine: false, type: "voice", url, voiceIndex: state.messages.length });
      renderStage();
    });
    session.addEventListener("protocol-error", () => setStatus(copy().error, "error"));
  }

  async function host() {
    if (!requireAdult()) return;
    state.stage = "loading"; renderStage({ focus: true }); setStatus(copy().loading);
    try {
      const { ManualPeerSession } = await loadTransport();
      const session = new ManualPeerSession({ iceServers: config().p2pIceServers });
      bindSession(session);
      const created = await session.createOffer();
      state.offer = created.offerCode; state.verification = created.verificationCode; state.role = "host"; state.stage = "host-offer";
      renderStage({ focus: true }); setStatus(copy().offerNote, "ok");
    } catch (_) { resetSession(); setStatus(copy().error, "error"); }
  }

  async function acceptOffer() {
    const code = $("#partner-offer-input")?.value.trim();
    if (!code) return;
    state.stage = "loading"; renderStage({ focus: true }); setStatus(copy().loading);
    try {
      const { ManualPeerSession } = await loadTransport();
      const accepted = await ManualPeerSession.acceptOffer(code, { iceServers: config().p2pIceServers });
      bindSession(accepted.session);
      state.answer = accepted.answerCode; state.verification = accepted.verificationCode; state.role = "guest"; state.stage = "guest-answer";
      renderStage({ focus: true }); setStatus(copy().waiting);
    } catch (_) { resetSession(); state.stage = "guest-input"; renderStage({ focus: true }); setStatus(copy().error, "error"); }
  }

  async function acceptAnswer() {
    const code = $("#partner-answer-input")?.value.trim();
    if (!code || !state.session) return;
    setStatus(copy().loading);
    try { await state.session.acceptAnswer(code); }
    catch (_) { setStatus(copy().error, "error"); }
  }

  function containsContact(value) { return /(?:https?:\/\/|www\.|(?:line|wechat|微信|ไลน์)\s*[:：]?|@\w|\+?\d[\d\s-]{7,}\d)/i.test(value); }

  function sendText() {
    const input = $("#partner-live-text");
    const value = input?.value.trim() || "";
    if (!value) return;
    if (containsContact(value)) { setStatus(copy().contact, "warn"); return; }
    try {
      const message = state.session.sendText(value, { language: targetLanguage() });
      state.messages.push({ ...message, mine: true, type: "text" });
      input.value = ""; renderStage();
    } catch (_) { setStatus(copy().error, "error"); }
  }

  function sendCorrection() {
    const correctedText = $("#partner-correction-text")?.value.trim();
    const note = $("#partner-correction-note")?.value.trim() || null;
    if (!correctedText || !state.correctionId) return;
    if (containsContact(`${correctedText} ${note || ""}`)) { setStatus(copy().contact, "warn"); return; }
    try {
      const message = state.session.sendCorrection(state.correctionId, correctedText, { note });
      state.messages.push({ ...message, mine: true, type: "correction" });
      state.correctionId = ""; renderStage();
    } catch (_) { setStatus(copy().error, "error"); }
  }

  function pickMime() {
    return ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg;codecs=opus"].find(type => MediaRecorder.isTypeSupported?.(type)) || "";
  }

  async function startRecord() {
    if (state.recordStarting || state.recorder?.state === "recording" || !state.session || state.stage !== "connected") return;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder || !window.isSecureContext) { setStatus(copy().mic, "error"); return; }
    window.HUILAISHI_SPEECH?.stop?.();
    const run = ++state.recordRun;
    const session = state.session;
    state.recordStarting = true;
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (run !== state.recordRun || state.session !== session || state.stage !== "connected" || $("#partner-live-sheet")?.classList.contains("hidden")) {
        stream.getTracks?.().forEach(track => track.stop());
        return;
      }
      const chunks = [];
      const mimeType = pickMime();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const startedAt = performance.now();
      Object.assign(state, { stream, recorder, chunks, recordStarted: startedAt });
      recorder.addEventListener("dataavailable", event => { if (run === state.recordRun && event.data.size) chunks.push(event.data); });
      recorder.addEventListener("stop", () => finishRecord({ run, session, stream, recorder, chunks, startedAt }), { once: true });
      recorder.addEventListener("error", () => {
        if (run !== state.recordRun) return;
        cancelRecording();
        renderStage();
        setStatus(copy().mic, "error");
      }, { once: true });
      recorder.start(180);
      clearTimeout(state.recordTimer);
      state.recordTimer = setTimeout(() => { if (run === state.recordRun && recorder.state === "recording") recorder.stop(); }, MAX_RECORDING_MS);
      const button = $("[data-partner-live-action='record']");
      if (button) { button.dataset.partnerLiveAction = "stop-record"; button.textContent = `■ ${copy().stop}`; button.classList.add("recording"); }
      setStatus(copy().record, "live");
    } catch (_) {
      stream?.getTracks?.().forEach(track => track.stop());
      if (run === state.recordRun) cancelRecording();
      setStatus(copy().mic, "error");
    } finally {
      if (run === state.recordRun) state.recordStarting = false;
    }
  }

  function stopRecordTracks(stream = state.stream) {
    stream?.getTracks?.().forEach(track => track.stop());
    if (stream === state.stream) state.stream = null;
  }

  function stopRecord() {
    clearTimeout(state.recordTimer);
    state.recordTimer = 0;
    if (state.recorder?.state === "recording") state.recorder.stop();
  }

  function cancelRecording() {
    state.recordRun += 1;
    state.recordStarting = false;
    clearTimeout(state.recordTimer);
    state.recordTimer = 0;
    const recorder = state.recorder;
    const stream = state.stream;
    state.recorder = null;
    state.stream = null;
    state.chunks = [];
    try { if (recorder?.state === "recording") recorder.stop(); } catch (_) {}
    stopRecordTracks(stream);
    discardRecording();
  }

  function finishRecord({ run, session, stream, recorder, chunks, startedAt }) {
    stopRecordTracks(stream);
    if (run !== state.recordRun || state.session !== session || state.stage !== "connected") return;
    clearTimeout(state.recordTimer);
    state.recordTimer = 0;
    const durationMs = Math.max(250, Math.round(performance.now() - startedAt));
    const type = recorder?.mimeType || chunks[0]?.type || "audio/webm";
    const blob = new Blob(chunks, { type });
    state.recorder = null;
    state.stream = null;
    state.chunks = [];
    if (!blob.size) { setStatus(copy().mic, "error"); renderStage(); return; }
    discardRecording();
    state.recording = { blob, durationMs };
    state.recordingUrl = URL.createObjectURL(blob);
    setStatus(copy().voiceReady, "ok"); renderStage();
  }

  function discardRecording() {
    if (state.recordingUrl) URL.revokeObjectURL(state.recordingUrl);
    state.recordingUrl = ""; state.recording = null;
  }

  async function sendVoice() {
    if (!state.recording || !state.session) return;
    setStatus(copy().sending);
    try {
      const sent = await state.session.sendVoice(state.recording.blob, { durationMs: state.recording.durationMs, language: targetLanguage() });
      const url = state.recordingUrl;
      state.voiceUrls.add(url);
      state.messages.push({ ...sent, mine: true, type: "voice", url, voiceIndex: state.messages.length });
      state.recording = null; state.recordingUrl = "";
      setStatus(copy().sent, "ok"); renderStage();
    } catch (_) { setStatus(copy().error, "error"); }
  }

  function playVoice(index) {
    const message = state.messages[Number(index)];
    if (!message?.url) return;
    window.HUILAISHI_SPEECH?.stop?.();
    const audio = new Audio(message.url); audio.setAttribute("playsinline", ""); audio.play().catch(() => setStatus(copy().error, "error"));
  }

  function downloadIncident() {
    if (!state.session) return;
    const evidence = state.session.exportIncident({ reason: "user_saved_incident", details: "Saved locally by the learner." });
    const url = URL.createObjectURL(new Blob([JSON.stringify(evidence, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `huilaishi-incident-${Date.now()}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); notify(copy().localReport);
  }

  function resetSession(message = "") {
    try { state.session?.close?.("ui_reset"); } catch (_) {}
    cancelRecording();
    for (const url of state.voiceUrls) URL.revokeObjectURL(url);
    state.voiceUrls.clear();
    Object.assign(state, { session: null, role: "", stage: "hub", verification: "", offer: "", answer: "", messages: [], correctionId: "" });
    renderStage();
    if (message) setStatus(message, "ok");
  }

  function open() {
    state.lastFocus = document.activeElement;
    if (typeof window.openSheet === "function") window.openSheet("partner-live-sheet");
    else { $("#partner-live-sheet")?.classList.remove("hidden"); $("#modal-backdrop")?.classList.remove("hidden"); }
    $("#open-live-partner")?.setAttribute("aria-expanded", "true");
    renderStage();
    setStatus(navigator.onLine ? copy().centralOff : copy().offline, navigator.onLine ? "" : "warn");
    requestAnimationFrame(() => $("#partner-live-sheet [data-partner-live-action='close']")?.focus());
  }

  function close() {
    cancelRecording();
    renderStage();
    $("#partner-live-sheet")?.classList.add("hidden");
    $("#modal-backdrop")?.classList.add("hidden");
    $("#open-live-partner")?.setAttribute("aria-expanded", "false");
    (state.lastFocus?.isConnected ? state.lastFocus : $("#open-live-partner"))?.focus?.();
  }

  function handleKeydown(event) {
    const sheet = $("#partner-live-sheet");
    if (!sheet || sheet.classList.contains("hidden")) return;
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    if (event.key !== "Tab") return;
    const focusable = [...sheet.querySelectorAll("button:not(:disabled), textarea:not(:disabled), input:not(:disabled), audio[controls]")].filter(node => node.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  async function copyOrShare(targetId, share) {
    const value = $(`#${targetId}`)?.value || "";
    if (!value) return;
    try {
      if (share && navigator.share) await navigator.share({ title: copy().sheetTitle, text: value });
      else await navigator.clipboard.writeText(value);
      notify(copy().copied);
    } catch (_) { const field = $(`#${targetId}`); field?.focus(); field?.select?.(); }
  }

  function handleClick(event) {
    const tab = event.target.closest("[data-partner-tab]");
    if (tab) { state.tab = tab.dataset.partnerTab; renderTab(); return; }
    if (event.target.closest("#open-live-partner")) { open(); return; }
    const button = event.target.closest("[data-partner-live-action]");
    if (!button) return;
    event.preventDefault();
    const action = button.dataset.partnerLiveAction;
    if (action === "close") close();
    else if (action === "host") host();
    else if (action === "guest") { if (requireAdult()) { state.stage = "guest-input"; renderStage({ focus: true }); } }
    else if (action === "accept-offer") acceptOffer();
    else if (action === "accept-answer") acceptAnswer();
    else if (action === "copy" || action === "share") copyOrShare(button.dataset.copyTarget, action === "share");
    else if (action === "send-text") sendText();
    else if (action === "correct") { state.correctionId = button.dataset.messageId; renderStage({ focus: true }); }
    else if (action === "cancel-correction") { state.correctionId = ""; renderStage({ focus: true }); }
    else if (action === "send-correction") sendCorrection();
    else if (action === "record") startRecord();
    else if (action === "stop-record") stopRecord();
    else if (action === "send-voice") sendVoice();
    else if (action === "discard-voice") { discardRecording(); renderStage(); }
    else if (action === "play-voice") playVoice(button.dataset.voiceIndex);
    else if (action === "report") downloadIncident();
    else if (action === "block") { try { state.session?.blockPeer?.(); } catch (_) {} resetSession(copy().blocked); }
    else if (action === "end") resetSession(copy().ended);
  }

  function handleNetwork() {
    if (!navigator.onLine && state.session) resetSession(copy().offline);
    if (!navigator.onLine) { state.tab = "ai"; renderTab(); }
    applyCopy();
  }

  function handleDirection() {
    const next = direction();
    if (next === state.lastDirection) return;
    state.lastDirection = next;
    if (state.session) resetSession();
    applyCopy();
  }

  function init() {
    if (state.initialized) return;
    inject();
    state.initialized = true;
    state.lastDirection = direction();
    state.tab = navigator.onLine && available() ? "live" : "ai";
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);
    $("#modal-backdrop")?.addEventListener("click", () => { if ($("#open-live-partner")?.getAttribute("aria-expanded") === "true") close(); });
    window.addEventListener("online", handleNetwork);
    window.addEventListener("offline", handleNetwork);
    window.addEventListener("pagehide", () => resetSession());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "hidden") return;
      cancelRecording();
      renderStage();
    });
    state.bodyObserver = new MutationObserver(handleDirection);
    state.bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    applyCopy();
  }

  window.PartnerLiveUI = { init, open, close, reset: resetSession };
  document.addEventListener("DOMContentLoaded", init);
})();
