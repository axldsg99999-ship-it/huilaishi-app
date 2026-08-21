(() => {
  "use strict";

  const state = { initialized: false, direction: "zh-th", statuses: [], controllers: new Map(), bodyObserver: null, lastFocus: null };
  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const currentDirection = () => document.body.classList.contains("dir-th-zh") ? "th-zh" : "zh-th";
  const isThaiUi = () => currentDirection() === "th-zh";
  const ui = () => isThaiUi() ? {
    title: "ชุดเสียงนมหวานแยกตามระดับ", summary: "ดาวน์โหลดทีละระดับ ฟังคำศัพท์และประโยคตัวอย่างได้แม้ออฟไลน์", action: "จัดการ",
    sheetKicker: "MILKCANDY · OFFLINE AUDIO", sheetTitle: "เลือกชุดเสียงตามระดับ", close: "ปิดชุดเสียง",
    privacy: "ดาวน์โหลดเฉพาะเสียงสังเคราะห์สำหรับบทเรียน ไม่รวมเสียงอัดของคุณ iPhone อาจล้างข้อมูลออฟไลน์เมื่อพื้นที่ไม่พอ",
    wifi: "แต่ละระดับมีทั้งคำศัพท์ 500 คำและประโยคตัวอย่าง แนะนำให้ใช้ Wi‑Fi และเปิดหน้านี้ไว้จนตรวจสอบเสร็จ",
    installed: "ติดตั้งแล้ว", install: "ดาวน์โหลด", delete: "ลบ", cancel: "ยกเลิก", planned: "กำลังจัดทำเสียง", partial: "ยังสร้างไม่ครบ", failed: "ดาวน์โหลดไม่สำเร็จ", checking: "กำลังตรวจสอบ…", unavailable: "ใช้ได้ในเวอร์ชันออนไลน์/PWA เท่านั้น", loading: "กำลังอ่านชุดเสียง…",
    levelNames: ["เอาตัวรอด", "ชีวิตประจำวัน", "เที่ยวและเข้าสังคม", "งานและชีวิต", "แสดงความคิดเห็น", "ภาษาและวัฒนธรรม"],
    readySummary: count => `ติดตั้งแล้ว ${count}/6 ระดับ`, noneSummary: "เลือกดาวน์โหลดเฉพาะระดับที่เรียน", confirmDelete: "แตะอีกครั้งเพื่อลบ", network: "ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อดาวน์โหลดครั้งแรก", quota: "พื้นที่ว่างอาจไม่พอสำหรับชุดนี้", done: "ติดตั้งชุดเสียงแล้ว", removed: "ลบชุดเสียงแล้ว"
  } : {
    title: "分级奶糖点读包", summary: "按等级下载，词汇和例句断网也能听清", action: "管理",
    sheetKicker: "MILKCANDY · OFFLINE AUDIO", sheetTitle: "选择要装的声音等级", close: "关闭声音包",
    privacy: "只下载合成学习音频，不包含你的录音。iPhone 可能在空间不足时清理离线数据。",
    wifi: "每级包含 500 个词和对应例句；建议连接 Wi‑Fi，并保持页面打开直到校验完成。",
    installed: "已安装", install: "下载", delete: "删除", cancel: "取消", planned: "音频制作中", partial: "尚未完整生成", failed: "下载失败", checking: "正在校验…", unavailable: "仅在线版/PWA 可安装", loading: "正在读取声音包…",
    levelNames: ["生存开口", "日常基础", "旅行社交", "工作生活", "观点表达", "文化进阶"],
    readySummary: count => `已安装 ${count}/6 级`, noneSummary: "只装正在学习的等级，节省手机空间", confirmDelete: "再点一次确认删除", network: "首次下载需要联网", quota: "手机剩余空间可能不足", done: "声音包安装完成", removed: "声音包已删除"
  };

  function formatBytes(bytes) {
    const value = Number(bytes || 0);
    if (!value) return "—";
    return value >= 1048576 ? `${(value / 1048576).toFixed(value >= 104857600 ? 0 : 1)} MB` : `${Math.ceil(value / 1024)} KB`;
  }

  function inject() {
    const anchor = $("#preview-sugarblade-voice");
    if (anchor && !$("#manage-cute-voice-packs")) {
      anchor.insertAdjacentHTML("afterend", `
        <button class="settings-row voice-pack-setting" id="manage-cute-voice-packs" type="button" data-speech-policy="none" aria-controls="voice-pack-sheet" aria-expanded="false">
          <span class="voice-setting-copy"><b id="cute-pack-title"></b><small id="cute-pack-summary"></small></span>
          <strong id="cute-pack-action"></strong><span class="cute-pack-glyph" aria-hidden="true">↓</span>
        </button>`);
    }
    const before = $("#pass-sheet") || $("#vocab-quiz-sheet");
    if (before && !$("#voice-pack-sheet")) {
      before.insertAdjacentHTML("beforebegin", `
        <section class="bottom-sheet voice-pack-sheet hidden" id="voice-pack-sheet" role="dialog" aria-modal="true" aria-labelledby="voice-pack-sheet-title">
          <div class="sheet-handle"></div>
          <div class="sheet-heading"><div><p class="eyebrow dark" id="voice-pack-kicker"></p><h2 id="voice-pack-sheet-title"></h2></div><button class="round-icon light" type="button" data-voice-pack-close aria-label="关闭"><svg><use href="#i-x"></use></svg></button></div>
          <div class="voice-pack-intro"><span aria-hidden="true">♪</span><p id="voice-pack-privacy"></p></div>
          <p class="voice-pack-wifi" id="voice-pack-wifi"></p>
          <div class="voice-pack-list" id="voice-pack-list" aria-live="polite"></div>
        </section>`);
    }
  }

  function applyCopy() {
    const c = ui();
    if (!$("#manage-cute-voice-packs")) return;
    $("#cute-pack-title").textContent = c.title;
    $("#cute-pack-action").textContent = c.action;
    $("#voice-pack-kicker").textContent = c.sheetKicker;
    $("#voice-pack-sheet-title").textContent = c.sheetTitle;
    $("[data-voice-pack-close]").setAttribute("aria-label", c.close);
    $("#voice-pack-privacy").textContent = c.privacy;
    $("#voice-pack-wifi").textContent = c.wifi;
    const installed = state.statuses.filter(item => item.direction === currentDirection() && item.installed).length;
    $("#cute-pack-summary").textContent = installed ? c.readySummary(installed) : c.summary;
  }

  function open() {
    const button = $("#manage-cute-voice-packs");
    state.lastFocus = document.activeElement;
    if (typeof window.openSheet === "function") window.openSheet("voice-pack-sheet");
    else {
      $("#voice-pack-sheet")?.classList.remove("hidden");
      $("#modal-backdrop")?.classList.remove("hidden");
    }
    button?.setAttribute("aria-expanded", "true");
    loadStatuses();
    requestAnimationFrame(() => $("#voice-pack-sheet [data-voice-pack-close]")?.focus());
  }

  function close() {
    $("#voice-pack-sheet")?.classList.add("hidden");
    $("#modal-backdrop")?.classList.add("hidden");
    $("#manage-cute-voice-packs")?.setAttribute("aria-expanded", "false");
    (state.lastFocus?.isConnected ? state.lastFocus : $("#manage-cute-voice-packs"))?.focus?.();
  }

  function statusLabel(item) {
    const c = ui();
    if (item.installing) return `${Math.round(item.progress || 0)}%`;
    if (item.installed) return c.installed;
    if (item.error) return c.failed;
    if (item.state === "partial") return `${c.partial} ${item.readyClipCount || 0}/${item.clipCount || 0}`;
    if (item.state !== "ready") return c.planned;
    return formatBytes(item.bytes || item.estimatedBytes);
  }

  function render() {
    applyCopy();
    const list = $("#voice-pack-list");
    if (!list) return;
    const c = ui();
    const rows = state.statuses.filter(item => item.direction === currentDirection());
    if (!rows.length) { list.innerHTML = `<p class="voice-pack-empty">${escapeHtml(c.loading)}</p>`; return; }
    list.innerHTML = rows.map(item => {
      const level = Number(item.level);
      const disabled = item.state !== "ready" && !item.installed;
      const action = item.installing ? c.cancel : item.installed ? c.delete : item.state === "ready" ? c.install : c.planned;
      const classes = [item.installed ? "is-installed" : "", item.installing ? "is-installing" : "", item.error ? "has-error" : ""].filter(Boolean).join(" ");
      return `<article class="voice-pack-row ${classes}" data-pack-row="${escapeHtml(item.id)}">
        <span class="voice-pack-level">L${level}</span>
        <div><b>${escapeHtml(c.levelNames[level - 1])}</b><small>${escapeHtml(statusLabel(item))}</small><i><em style="width:${Math.round(item.progress || (item.installed ? 100 : 0))}%"></em></i></div>
        <button type="button" data-pack-action="${item.installing ? "cancel" : item.installed ? "delete" : "install"}" data-pack-id="${escapeHtml(item.id)}" ${disabled ? "disabled" : ""}>${escapeHtml(action)}</button>
      </article>`;
    }).join("");
  }

  async function loadStatuses() {
    const manager = window.HUILAISHI_VOICE_PACKS;
    const list = $("#voice-pack-list");
    if (!manager) { if (list) list.innerHTML = `<p class="voice-pack-empty">${escapeHtml(ui().unavailable)}</p>`; return; }
    if (list) list.innerHTML = `<p class="voice-pack-empty">${escapeHtml(ui().loading)}</p>`;
    try {
      const catalog = await manager.catalog();
      const summaries = catalog.packs.filter(item => item.direction === currentDirection());
      const results = [];
      for (const summary of summaries) {
        try { results.push(await manager.packStatus(summary.id)); }
        catch (_) { results.push({ ...summary, installed: false, error: true }); }
      }
      state.statuses = [
        ...state.statuses.filter(item => item.direction !== currentDirection()),
        ...results
      ];
      render();
    } catch (_) {
      if (window.location.protocol === "file:") {
        state.statuses = state.statuses.filter(item => item.direction !== currentDirection());
        applyCopy();
        if (list) list.innerHTML = `<p class="voice-pack-file-note">${escapeHtml(ui().unavailable)}</p>`;
        return;
      }
      state.statuses = Array.from({ length: 6 }, (_, index) => ({ id: `${currentDirection()}-l${index + 1}`, direction: currentDirection(), level: index + 1, state: "planned", installed: false }));
      render();
    }
  }

  async function install(packId) {
    const manager = window.HUILAISHI_VOICE_PACKS;
    const item = state.statuses.find(value => value.id === packId);
    if (!manager || !item || item.installing || state.controllers.has(packId)) return;
    if (!navigator.onLine) { window.showToast?.(ui().network); return; }
    const controller = new AbortController();
    state.controllers.set(packId, controller);
    Object.assign(item, { installing: true, progress: 0, error: false });
    render();
    try {
      const space = await manager.storageEstimate(packId);
      if (controller.signal.aborted) throw new DOMException("Voice-pack install aborted", "AbortError");
      if (space.fits === false) { window.showToast?.(ui().quota); return; }
      await manager.installPack(packId, {
        signal: controller.signal,
        onProgress: progress => {
          item.progress = progress.totalClips ? progress.completedClips / progress.totalClips * 100 : 0;
          render();
        }
      });
      Object.assign(item, await manager.packStatus(packId), { installing: false, progress: 100, error: false });
      window.showToast?.(ui().done);
    } catch (error) {
      item.installing = false;
      if (error?.name !== "AbortError") { item.error = true; window.showToast?.(error?.message || ui().failed); }
    } finally {
      item.installing = false;
      state.controllers.delete(packId);
      render();
    }
  }

  async function remove(packId, button) {
    if (button.dataset.confirm !== "1") {
      button.dataset.confirm = "1";
      button.textContent = ui().confirmDelete;
      setTimeout(() => { if (button.isConnected) { delete button.dataset.confirm; button.textContent = ui().delete; } }, 2600);
      return;
    }
    try {
      await window.HUILAISHI_VOICE_PACKS?.deletePack?.(packId);
      const item = state.statuses.find(value => value.id === packId);
      if (item) Object.assign(item, { installed: false, partial: false, cachedClips: 0, cachedBytes: 0, progress: 0 });
      window.showToast?.(ui().removed);
      render();
    } catch (error) { window.showToast?.(error?.message || ui().failed); }
  }

  function handleClick(event) {
    if (event.target.closest("#manage-cute-voice-packs")) { event.preventDefault(); open(); return; }
    if (event.target.closest("[data-voice-pack-close]")) { close(); return; }
    const button = event.target.closest("[data-pack-action]");
    if (!button) return;
    const packId = button.dataset.packId;
    if (button.dataset.packAction === "install") install(packId);
    else if (button.dataset.packAction === "cancel") state.controllers.get(packId)?.abort();
    else if (button.dataset.packAction === "delete") remove(packId, button);
  }

  function handleKeydown(event) {
    const sheet = $("#voice-pack-sheet");
    if (!sheet || sheet.classList.contains("hidden")) return;
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    if (event.key !== "Tab") return;
    const focusable = [...sheet.querySelectorAll("button:not(:disabled)")].filter(node => node.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function handleDirection() {
    const next = currentDirection();
    if (next === state.direction) return;
    state.direction = next;
    applyCopy();
    if (!$("#voice-pack-sheet")?.classList.contains("hidden")) loadStatuses();
  }

  function init() {
    if (state.initialized) return;
    inject();
    state.initialized = true;
    state.direction = currentDirection();
    applyCopy();
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);
    $("#modal-backdrop")?.addEventListener("click", () => {
      if ($("#manage-cute-voice-packs")?.getAttribute("aria-expanded") === "true") close();
    });
    state.bodyObserver = new MutationObserver(handleDirection);
    state.bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("huilaishi:voicepack:installed", loadStatuses);
    window.addEventListener("huilaishi:voicepack:deleted", loadStatuses);
    loadStatuses();
  }

  const api = { init, open, close, refresh: loadStatuses, onDirectionChange: handleDirection };
  window.VoicePackUI = api;
  document.addEventListener("DOMContentLoaded", init);
})();
