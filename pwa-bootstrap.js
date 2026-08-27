(() => {
  "use strict";

  const root = typeof document === "undefined" ? null : document.documentElement;
  const isIos = /iPad|iPhone|iPod/u.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (root) {
    root.classList.remove("ios", "md");
    root.classList.add(isIos ? "ios" : "md");
    root.dataset.uiPlatform = isIos ? "ios" : "md";
  }

  const CACHE_VERSION = "huilaishi-offline-v59";
  const noServiceWorker = /(?:^|[?&])nosw=1(?:&|$)/u.test(location.search);

  // Register from the tiny bootstrap instead of waiting for the much larger
  // application bundle. A stale Samsung Internet worker can then repair
  // itself even when the previous app bundle fails before init().
  if (!noServiceWorker && "serviceWorker" in navigator && /^https?:$/u.test(location.protocol)) {
    navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" }).catch(() => {});
  }

  if (noServiceWorker && "serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations?.()
      .then(registrations => Promise.all(registrations.map(registration => registration.unregister())))
      .catch(() => []);
    if (typeof caches !== "undefined") caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("huilaishi-")).map(key => caches.delete(key))))
      .catch(() => []);
  }

  const revealBootRecovery = () => {
    if (!root || root.dataset.appReady === "true") return;
    const shell = document.getElementById("app");
    if (shell && innerWidth <= 430) {
      shell.style.setProperty("position", "fixed", "important");
      shell.style.setProperty("inset", "0", "important");
      shell.style.setProperty("width", "100%", "important");
      shell.style.setProperty("height", "auto", "important");
    }
    const direction = document.getElementById("direction-screen");
    if (!direction) return;
    direction.classList.remove("hidden");
    ["onboarding", "main-app", "lesson"].forEach(id => document.getElementById(id)?.classList.add("hidden"));
    if (document.getElementById("boot-recovery-action")) return;
    const action = document.createElement("button");
    action.id = "boot-recovery-action";
    action.type = "button";
    action.textContent = "页面没有正常启动 · 清理旧缓存并重开";
    action.setAttribute("aria-label", action.textContent);
    action.addEventListener("click", () => {
      action.disabled = true;
      action.textContent = "正在恢复…";
      const unregister = navigator.serviceWorker?.getRegistrations?.()
        .then(registrations => Promise.all(registrations.map(registration => registration.unregister())))
        .catch(() => []);
      const clearCaches = typeof caches === "undefined" ? Promise.resolve([]) : caches.keys()
        .then(keys => Promise.all(keys
          .filter(key => key.startsWith("huilaishi-"))
          .map(key => caches.delete(key))))
        .catch(() => []);
      Promise.all([unregister, clearCaches]).finally(() => {
        const url = new URL(location.href);
        url.searchParams.set("recovery", Date.now().toString(36));
        location.replace(url.href);
      });
    });
    direction.append(action);
  };

  const armBootRecovery = () => setTimeout(revealBootRecovery, 4500);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", armBootRecovery, { once: true });
  else armBootRecovery();

  if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) return;

  // The previous worker can serve the new HTML together with its old cached
  // CSS/JS during an upgrade. Reload exactly once after the new atomic shell
  // takes control so the visible page and its assets always come from one
  // release. This file is intentionally loaded before the cached app scripts.
  const refreshKey = `huilaishi-shell-refresh:${CACHE_VERSION}`;
  let memoryGuard = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (memoryGuard) return;
    memoryGuard = true;
    try {
      if (sessionStorage.getItem(refreshKey) === "1") return;
      sessionStorage.setItem(refreshKey, "1");
    } catch (_) {
      // A private WebView may deny sessionStorage; the in-memory guard still
      // prevents a reload loop for the lifetime of this document.
    }
    location.reload();
  });
})();
