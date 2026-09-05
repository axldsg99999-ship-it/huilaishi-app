(() => {
  "use strict";

  const root = globalThis;
  const query = new URLSearchParams(root.location?.search || "");
  const nativeDistribution = root.HUILAISHI_DISTRIBUTION || {};
  const nativeCommerce = nativeDistribution.commerce || {};
  const nativePlatform = Boolean(root.Capacitor?.isNativePlatform?.());
  const localPreview = !nativePlatform && query.get("commerce") === "preview";
  const mode = nativeCommerce.mode || (localPreview ? "preview" : "disabled");
  const ENTITLEMENT_ID = nativeCommerce.entitlementId || "pro";
  const OFFERING_ID = nativeCommerce.offeringId || "default";
  const PRODUCT_ID = nativeCommerce.productId || "";
  const FREE_GAMES = new Set(["voice", "monster", "match", "audio"]);
  const FREE_DUEL_MODES = new Set(["voice", "standard"]);

  const state = {
    locale: "zh",
    mode,
    status: mode === "disabled" ? "disabled" : "loading",
    entitled: false,
    configured: false,
    offering: null,
    package: null,
    price: "",
    error: "",
    supportId: "",
    feature: "",
    pending: false,
  };

  let purchases = null;
  let initialization = null;
  let refreshing = null;
  let transaction = null;
  let listenerBound = false;
  let customerRevision = 0;
  let lastAccess = "";
  let ui = { openSheet: null, closeSheets: null, toast: null };

  const COPY = {
    zh: {
      profileKicker: "完整版 · 一次买断",
      profileTitle: "解锁完整中泰校园",
      profileCopy: "六级词库、全游戏、完整怪物远征与发音课",
      profileReady: "查看权益",
      profileOwned: "已永久解锁",
      profilePreview: "查看商业版",
      eyebrow: "PRO LIFETIME · 永久完整版",
      title: "把整座中泰校园带走",
      subtitle: "一次购买，同时解锁中国人学泰语与泰国人学中文两条路线；没有自动续费。",
      freeTitle: "免费体验",
      freeItems: ["L1 · 500 张训练卡", "首节发音课", "4 款核心游戏", "怪物故事第 1 章", "开口格斗与均衡赛"],
      proTitle: "永久完整版",
      proItems: ["L1–L6 · 3,000 张训练卡", "完整发音课程", "全部 14 款游戏", "完整怪物图鉴与远征", "全部 4 种同机对战"],
      owned: "当前商店账号已永久解锁",
      continueLearning: "继续学习",
      close: "关闭完整版说明",
      loading: "正在连接商店…",
      buy: price => `以 ${price} 永久解锁`,
      buyUnknown: "正在获取本地价格…",
      preview: "预览版不会发起真实付款；原生沙盒包会显示商店本地价格。",
      unavailable: "暂时无法读取商店商品，请检查网络后重试。",
      retry: "重新连接商店",
      pending: "正在等待商店确认。请勿重复购买；确认后会自动解锁，也可以恢复购买。",
      restoreFailed: "恢复购买暂未完成，请检查网络后重试",
      restore: "恢复购买",
      restoring: "正在恢复…",
      restored: "购买记录已恢复",
      nothingToRestore: "当前商店账号没有可恢复的完整版记录",
      purchasing: "正在打开商店确认页…",
      success: "完整版已永久解锁",
      cancelled: "已取消本次购买",
      purchaseFailed: "购买没有完成，请稍后再试",
      storeNote: "由 App Store 或 Google Play 安全结算 · 一次购买 · 不自动续费",
      support: "复制购买支持编号",
      supportCopied: "购买支持编号已复制",
      supportPending: "连接商店后可生成支持编号",
      privacy: "隐私说明",
      terms: "购买条款",
      feature: "此内容属于永久完整版",
    },
    th: {
      profileKicker: "เวอร์ชันเต็ม · ซื้อครั้งเดียว",
      profileTitle: "ปลดล็อกทั้งแคมปัสจีน–ไทย",
      profileCopy: "คำศัพท์ 6 ระดับ เกมทั้งหมด ด่านมอนสเตอร์ และคอร์สออกเสียง",
      profileReady: "ดูสิทธิ์ทั้งหมด",
      profileOwned: "ปลดล็อกถาวรแล้ว",
      profilePreview: "ดูเวอร์ชันขายจริง",
      eyebrow: "PRO LIFETIME · เวอร์ชันเต็มถาวร",
      title: "พกทั้งแคมปัสจีน–ไทยไปด้วย",
      subtitle: "ซื้อครั้งเดียว ปลดล็อกทั้งเส้นทางคนจีนเรียนไทยและคนไทยเรียนจีน ไม่มีต่ออายุอัตโนมัติ",
      freeTitle: "ทดลองฟรี",
      freeItems: ["L1 · การ์ดฝึก 500 ใบ", "บทออกเสียงบทแรก", "เกมหลัก 4 แบบ", "เรื่องมอนสเตอร์บทที่ 1", "ดวลพูดและรอบสมดุล"],
      proTitle: "เวอร์ชันเต็มถาวร",
      proItems: ["L1–L6 · การ์ดฝึก 3,000 ใบ", "คอร์สออกเสียงครบ", "เกมครบ 14 แบบ", "สมุดภาพและการผจญภัยมอนสเตอร์", "ดวลในเครื่องครบ 4 แบบ"],
      owned: "บัญชีร้านค้านี้ปลดล็อกถาวรแล้ว",
      continueLearning: "เรียนต่อ",
      close: "ปิดรายละเอียดเวอร์ชันเต็ม",
      loading: "กำลังเชื่อมต่อร้านค้า…",
      buy: price => `ปลดล็อกถาวรในราคา ${price}`,
      buyUnknown: "กำลังโหลดราคาท้องถิ่น…",
      preview: "หน้าพรีวิวจะไม่เรียกเก็บเงินจริง รุ่นทดสอบบนมือถือจะแสดงราคาจากร้านค้า",
      unavailable: "ยังโหลดสินค้าจากร้านค้าไม่ได้ โปรดตรวจอินเทอร์เน็ตแล้วลองใหม่",
      retry: "เชื่อมต่อร้านค้าอีกครั้ง",
      pending: "กำลังรอร้านค้ายืนยัน โปรดอย่าซื้อซ้ำ เมื่อยืนยันแล้วจะปลดล็อกอัตโนมัติ หรือกู้คืนการซื้อได้",
      restoreFailed: "ยังกู้คืนการซื้อไม่ได้ โปรดตรวจอินเทอร์เน็ตแล้วลองใหม่",
      restore: "กู้คืนการซื้อ",
      restoring: "กำลังกู้คืน…",
      restored: "กู้คืนการซื้อแล้ว",
      nothingToRestore: "บัญชีร้านค้านี้ยังไม่มีเวอร์ชันเต็มให้กู้คืน",
      purchasing: "กำลังเปิดหน้าชำระเงินของร้านค้า…",
      success: "ปลดล็อกเวอร์ชันเต็มถาวรแล้ว",
      cancelled: "ยกเลิกการซื้อครั้งนี้แล้ว",
      purchaseFailed: "การซื้อยังไม่สำเร็จ โปรดลองอีกครั้ง",
      storeNote: "ชำระอย่างปลอดภัยผ่าน App Store หรือ Google Play · ซื้อครั้งเดียว · ไม่ต่ออายุอัตโนมัติ",
      support: "คัดลอกรหัสช่วยเหลือการซื้อ",
      supportCopied: "คัดลอกรหัสช่วยเหลือแล้ว",
      supportPending: "เชื่อมต่อร้านค้าก่อนเพื่อสร้างรหัสช่วยเหลือ",
      privacy: "ความเป็นส่วนตัว",
      terms: "เงื่อนไขการซื้อ",
      feature: "เนื้อหานี้อยู่ในเวอร์ชันเต็มถาวร",
    },
  };

  function copy() {
    return COPY[state.locale] || COPY.zh;
  }

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function entitlementFrom(customerInfo) {
    const item = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
    return item?.isActive === true;
  }

  function applyCustomerInfo(result) {
    customerRevision += 1;
    state.entitled = entitlementFrom(result?.customerInfo || result);
    if (state.entitled) state.pending = false;
    render();
  }

  // Only reads are bounded. A live payment stays exclusive until the store settles it.
  function storeRead(action) {
    let timer;
    return Promise.race([
      Promise.resolve().then(action),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("Store read timed out")), 12000); }),
    ]).finally(() => clearTimeout(timer));
  }

  function syncAccessClasses() {
    const body = document.body;
    if (!body) return;
    const enabled = state.mode !== "disabled";
    body.classList.toggle("commerce-enabled", enabled);
    body.classList.toggle("commerce-entitled", enabled && state.entitled);
    body.classList.toggle("commerce-locked", state.mode === "production" && !state.entitled);
    body.dataset.commerceMode = state.mode;
    body.dataset.commerceStatus = state.status;
    const access = `${state.mode}:${state.entitled}`;
    if (access !== lastAccess) {
      lastAccess = access;
      document.dispatchEvent(new CustomEvent("sawadeeka:entitlement-change", { detail: { entitled: state.entitled, mode: state.mode } }));
    }
  }

  function renderLists() {
    const c = copy();
    const free = document.querySelector("#premium-free-list");
    const pro = document.querySelector("#premium-pro-list");
    if (free) free.innerHTML = c.freeItems.map(item => `<li><span aria-hidden="true">✓</span>${escapeHtml(item)}</li>`).join("");
    if (pro) pro.innerHTML = c.proItems.map(item => `<li><span aria-hidden="true">✦</span>${escapeHtml(item)}</li>`).join("");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;")
      .replace(/"/gu, "&quot;").replace(/'/gu, "&#039;");
  }

  function render() {
    if (state.mode === "disabled") return;
    const c = copy();
    const entry = document.querySelector("#open-premium");
    entry?.classList.remove("hidden");
    entry?.classList.toggle("is-owned", state.entitled);
    setText("#premium-entry-kicker", c.profileKicker);
    setText("#premium-entry-title", state.entitled ? c.profileOwned : c.profileTitle);
    setText("#premium-entry-copy", c.profileCopy);
    setText("#premium-entry-action", state.entitled ? c.profileOwned : state.mode === "preview" ? c.profilePreview : c.profileReady);
    setText("#premium-eyebrow", c.eyebrow);
    setText("#premium-title", c.title);
    setText("#premium-subtitle", c.subtitle);
    setText("#premium-free-title", c.freeTitle);
    setText("#premium-pro-title", c.proTitle);
    setText("#premium-store-note", c.storeNote);
    setText("#premium-restore", state.status === "restoring" ? c.restoring : c.restore);
    setText("#premium-support-copy", c.support);
    setText("#premium-privacy-link", c.privacy);
    setText("#premium-terms-link", c.terms);
    setText("#premium-retry", c.retry);
    document.querySelector("#premium-close")?.setAttribute("aria-label", c.close);
    renderLists();

    const buy = document.querySelector("#premium-buy");
    const retry = document.querySelector("#premium-retry");
    const restore = document.querySelector("#premium-restore");
    const status = document.querySelector("#premium-status");
    let statusText = "";
    let buyText = c.buyUnknown;
    let buyDisabled = true;

    if (state.entitled) {
      statusText = c.owned;
      buyText = c.continueLearning;
      buyDisabled = false;
    } else if (state.mode === "preview") {
      statusText = c.preview;
      buyText = c.profilePreview;
    } else if (state.status === "purchasing") {
      statusText = c.purchasing;
      buyText = c.purchasing;
    } else if (state.status === "restoring") {
      statusText = c.restoring;
    } else if (state.pending) {
      statusText = c.pending;
      buyText = c.pending;
    } else if (state.status === "unavailable" || state.status === "error") {
      statusText = c[state.error] || c.unavailable;
    } else if (state.status === "ready") {
      statusText = state.feature ? c.feature : c.storeNote;
      buyText = state.price ? c.buy(state.price) : c.buyUnknown;
      buyDisabled = !state.package || !state.price;
    } else {
      statusText = c.loading;
    }

    if (status) {
      status.textContent = statusText;
      status.dataset.state = state.entitled ? "owned" : state.status;
    }
    if (buy) {
      buy.textContent = buyText;
      buy.disabled = buyDisabled || state.mode !== "production" || Boolean(transaction);
    }
    if (restore) restore.disabled = state.mode !== "production" || !state.configured || Boolean(transaction) || Boolean(refreshing);
    retry?.classList.toggle("hidden", !["unavailable", "error"].includes(state.status) && !state.pending);
    if (retry) retry.disabled = Boolean(transaction) || Boolean(refreshing) || state.status === "loading";
    const support = document.querySelector("#premium-support-copy");
    if (support) support.disabled = state.mode !== "production" || !state.configured;
    syncAccessClasses();
  }

  function canAccess(feature) {
    if (state.mode !== "production" || state.entitled) return true;
    if (!feature) return false;
    if (feature.startsWith("arcade:")) return FREE_GAMES.has(feature.slice(7));
    if (feature.startsWith("duel:")) return FREE_DUEL_MODES.has(feature.slice(5));
    if (feature === "monster:story-1") return true;
    return false;
  }

  function selectPackage(offerings) {
    const offering = offerings?.all?.[OFFERING_ID]
      || (offerings?.current?.identifier === OFFERING_ID ? offerings.current : null);
    if (!offering) return { offering: null, selected: null };
    const packages = Array.isArray(offering.availablePackages) ? offering.availablePackages : [];
    const selected = [offering.lifetime, ...packages].find(item =>
      item?.product?.identifier === PRODUCT_ID && PRODUCT_ID
      && item.packageType === "LIFETIME" && item.identifier
      && item.presentedOfferingContext?.offeringIdentifier === OFFERING_ID
      && item.product.productCategory === "NON_SUBSCRIPTION"
      && !item.product.subscriptionPeriod
      && typeof item.product.priceString === "string" && item.product.priceString.trim()) || null;
    return { offering, selected };
  }

  async function refreshStore() {
    if (state.mode !== "production" || !purchases || !state.configured) return;
    if (transaction) return;
    if (refreshing) return refreshing;
    state.status = "loading";
    state.error = "";
    const revision = customerRevision;
    refreshing = (async () => {
      const customer = storeRead(() => purchases.getCustomerInfo()).then(result => {
        if (revision === customerRevision) applyCustomerInfo(result);
      });
      const [customerResult, offeringsResult] = await Promise.allSettled([
        customer, storeRead(() => purchases.getOfferings()),
      ]);
      const selection = selectPackage(offeringsResult.status === "fulfilled" ? offeringsResult.value : null);
      state.offering = selection.offering;
      state.package = selection.selected;
      state.price = selection.selected?.product?.priceString || "";
      state.status = state.entitled || (state.package && customerResult.status === "fulfilled") ? "ready" : "unavailable";
      if (state.status === "unavailable") state.error = "unavailable";
      void storeRead(() => purchases.getAppUserID()).then(user => { state.supportId = user?.appUserID || ""; }).catch(() => {});
    })().finally(() => { refreshing = null; render(); });
    render();
    return refreshing;
  }

  async function initialize() {
    if (initialization) return initialization;
    if (state.configured) return refreshStore();
    initialization = (async () => {
      if (state.mode === "disabled") return;
      if (state.mode === "preview") {
        state.status = "preview";
        render();
        return;
      }
      const apiKey = String(nativeCommerce.apiKey || "").trim();
      if (!nativePlatform || !nativeDistribution.store || !apiKey || typeof root.Capacitor?.registerPlugin !== "function") {
        state.status = "unavailable";
        state.error = "unavailable";
        render();
        return;
      }
      try {
        state.status = "loading";
        state.error = "";
        render();
        purchases = root.Capacitor.registerPlugin("Purchases");
        await storeRead(() => purchases.configure({ apiKey }));
        state.configured = true;
        if (!listenerBound) {
          try {
            await storeRead(() => purchases.addCustomerInfoUpdateListener(applyCustomerInfo));
            listenerBound = true;
          } catch (_) {}
        }
        await refreshStore();
      } catch (_) {
        state.status = "unavailable";
        state.error = "unavailable";
        render();
      }
    })().finally(() => { initialization = null; });
    return initialization;
  }

  function openPaywall(feature = "") {
    if (state.mode === "disabled") return false;
    state.feature = feature;
    render();
    if (typeof ui.openSheet === "function") ui.openSheet("premium-sheet");
    else {
      document.querySelector("#modal-backdrop")?.classList.remove("hidden");
      document.querySelector("#premium-sheet")?.classList.remove("hidden");
    }
    if (state.mode === "production" && (!state.configured || !state.package)) void initialize();
    return true;
  }

  async function purchase() {
    if (state.mode !== "production" || transaction || refreshing || !purchases) return;
    if (state.entitled) { ui.closeSheets?.(); return; }
    if (state.pending || state.status !== "ready" || !state.package || !state.price) return;
    transaction = "purchasing";
    state.status = "purchasing";
    state.error = "";
    render();
    try {
      const result = await purchases.purchasePackage({ aPackage: state.package });
      applyCustomerInfo(result);
      state.status = "ready";
      if (state.entitled) {
        ui.toast?.(copy().success);
      } else { state.pending = true; ui.toast?.(copy().pending); }
    } catch (error) {
      state.status = "ready";
      if (error?.userCancelled === true || String(error?.code) === "1") ui.toast?.(copy().cancelled);
      else if (String(error?.code) === "20") { state.pending = true; ui.toast?.(copy().pending); }
      else {
        state.status = "error";
        state.error = "purchaseFailed";
        ui.toast?.(copy().purchaseFailed);
      }
    } finally {
      transaction = null;
      render();
    }
  }

  async function restore() {
    if (state.mode !== "production" || !purchases || !state.configured || transaction || refreshing) return;
    transaction = "restoring";
    state.status = "restoring";
    state.error = "";
    render();
    try {
      const result = await purchases.restorePurchases();
      applyCustomerInfo(result);
      state.status = state.entitled || state.package ? "ready" : "unavailable";
      ui.toast?.(state.entitled ? copy().restored : copy().nothingToRestore);
    } catch (_) {
      state.status = "error";
      state.error = "restoreFailed";
      ui.toast?.(copy().restoreFailed);
    } finally {
      transaction = null;
      render();
    }
  }

  async function copySupportId() {
    if (!state.supportId && purchases) {
      try { state.supportId = (await purchases.getAppUserID())?.appUserID || ""; } catch (_) {}
    }
    if (!state.supportId) {
      ui.toast?.(copy().supportPending);
      return;
    }
    try {
      await navigator.clipboard.writeText(state.supportId);
      ui.toast?.(copy().supportCopied);
    } catch (_) {
      ui.toast?.(state.supportId);
    }
  }

  function bindUi(nextUi = {}) {
    ui = { ...ui, ...nextUi };
  }

  function setLocale(direction) {
    state.locale = direction === "th-zh" || direction === "th" ? "th" : "zh";
    render();
  }

  function bindDom() {
    document.querySelector("#open-premium")?.addEventListener("click", () => openPaywall("profile"));
    document.querySelector("#premium-buy")?.addEventListener("click", () => void purchase());
    document.querySelector("#premium-restore")?.addEventListener("click", () => void restore());
    document.querySelector("#premium-retry")?.addEventListener("click", () => void initialize());
    document.querySelector("#premium-support-copy")?.addEventListener("click", () => void copySupportId());
    document.addEventListener("click", event => {
      const target = event.target?.closest?.("[data-premium-feature]");
      if (!target || canAccess(target.dataset.premiumFeature)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openPaywall(target.dataset.premiumFeature);
    }, true);
    render();
    void initialize();
    document.addEventListener("visibilitychange", () => { if (!document.hidden) void initialize(); });
    root.addEventListener?.("online", () => void initialize());
  }

  const api = Object.freeze({
    initialize,
    bindUi,
    setLocale,
    openPaywall,
    canAccess,
    isEntitled: () => state.entitled,
    mode: () => state.mode,
    freeGames: () => [...FREE_GAMES],
    freeDuelModes: () => [...FREE_DUEL_MODES],
  });
  root.SawadeekaCommerce = api;
  document.addEventListener("DOMContentLoaded", bindDom);
})();
