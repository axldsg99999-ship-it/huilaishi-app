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

  const CACHE_VERSION = "huilaishi-offline-v118";
  const standaloneBuild = typeof SINGLE_FILE_BUILD !== "undefined" && Boolean(SINGLE_FILE_BUILD);
  const explicitNoServiceWorker = /(?:^|[?&])nosw=1(?:&|$)/u.test(location.search);
  const noServiceWorker = standaloneBuild || explicitNoServiceWorker;

  // CacheStorage and registrations are shared by every app on this origin.
  // Remove only our shell entries, never an entire shared cache or voice pack.
  async function recoverAppShell() {
    if (standaloneBuild || !/^https?:$/u.test(location.protocol)) return;
    const scope = new URL("./", location.href);
    const script = new URL("service-worker.js", scope).href;
    const belongsToApp = registration => {
      if (registration.scope !== scope.href) return false;
      const workers = [registration.active, registration.waiting, registration.installing].filter(Boolean);
      return workers.length > 0 && workers.every(worker => {
        try {
          const url = new URL(worker.scriptURL);
          url.search = "";
          url.hash = "";
          return url.href === script;
        } catch (_) { return false; }
      });
    };
    const unregister = async () => {
      const registrations = await navigator.serviceWorker?.getRegistrations?.() || [];
      await Promise.allSettled(registrations.filter(belongsToApp).map(registration => registration.unregister()));
    };
    const clearShell = async () => {
      if (typeof caches === "undefined") return;
      const names = (await caches.keys()).filter(name => /^huilaishi-(?:offline|runtime)-v\d+(?:-installing)?$/u.test(name));
      await Promise.allSettled(names.map(async name => {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        await Promise.allSettled(requests.filter(request => {
          const url = new URL(request.url);
          if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return false;
          const relativePath = url.pathname.slice(scope.pathname.length);
          return !/(?:^|\/)(?:audio[^/]*|voice-packs)(?:\/|$)|\.(?:mp3|m4a|wav|ogg|opus)$|__huilaishi_audio_/iu.test(relativePath);
        }).map(request => cache.delete(request)));
      }));
    };
    await Promise.allSettled([unregister(), clearShell()]);
  }

  // Register from the tiny bootstrap instead of waiting for the much larger
  // application bundle. A stale Samsung Internet worker can then repair
  // itself even when the previous app bundle fails before init().
  if (!noServiceWorker && "serviceWorker" in navigator && /^https?:$/u.test(location.protocol)) {
    navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" }).catch(() => {});
  }

  // `nosw=1` is an explicit recovery request and may clear this app's old
  // worker. A standalone HTML file only needs registration disabled; it must
  // not remove registrations or caches belonging to another page on the host.
  if (explicitNoServiceWorker) recoverAppShell().catch(() => {});

  let restoreRecoveryLayout = () => {};
  let recoveryTimer;
  const clearBootRecovery = () => {
    if (root?.dataset.appReady !== "true") return;
    document.getElementById("boot-recovery-action")?.remove();
    restoreRecoveryLayout();
  };
  // Slow but successful startup must not leave a stale error button or forced
  // recovery positioning behind after the normal app takes over.
  if (root && typeof MutationObserver !== "undefined") {
    const readyObserver = new MutationObserver(() => {
      if (root.dataset.appReady !== "true") return;
      clearTimeout(recoveryTimer);
      clearBootRecovery();
      readyObserver.disconnect();
    });
    readyObserver.observe(root, { attributes: true, attributeFilter: ["data-app-ready"] });
  }

  const revealBootRecovery = () => {
    if (!root || root.dataset.appReady === "true") return;
    if (document.getElementById("boot-recovery-action")) return;
    const shell = document.getElementById("app");
    if (shell && innerWidth <= 430) {
      const properties = { position: "fixed", inset: "0px", width: "100%", height: "auto" };
      const previous = Object.keys(properties).map(name => [name, shell.style.getPropertyValue(name), shell.style.getPropertyPriority(name)]);
      for (const [name, value] of Object.entries(properties)) shell.style.setProperty(name, value, "important");
      restoreRecoveryLayout = () => {
        for (const [name, value, priority] of previous) {
          if (shell.style.getPropertyValue(name) !== properties[name] || shell.style.getPropertyPriority(name) !== "important") continue;
          if (value) shell.style.setProperty(name, value, priority);
          else shell.style.removeProperty(name);
        }
      };
    }
    const direction = document.getElementById("direction-screen");
    if (!direction) return;
    direction.classList.remove("hidden");
    ["onboarding", "main-app", "lesson"].forEach(id => document.getElementById(id)?.classList.add("hidden"));
    const action = document.createElement("button");
    action.id = "boot-recovery-action";
    action.type = "button";
    const thai = /^th(?:-|$)/iu.test(root.lang || "");
    action.textContent = thai
      ? "เปิดแอปไม่สำเร็จ · ลองเปิดใหม่ (เก็บความคืบหน้าและเสียงไว้)"
      : "启动未完成 · 修复并重开（保留进度和语音）";
    action.setAttribute("aria-label", action.textContent);
    action.addEventListener("click", () => {
      action.disabled = true;
      action.textContent = thai ? "กำลังกู้คืน…" : "正在恢复…";
      action.setAttribute("aria-label", action.textContent);
      // Storage APIs can hang in a damaged WebView. Keep the retry usable even
      // then; recovery never touches localStorage or packaged native voices.
      let timeout;
      Promise.race([recoverAppShell(), new Promise(resolve => { timeout = setTimeout(resolve, 5000); })]).finally(() => {
        clearTimeout(timeout);
        const url = new URL(location.href);
        url.searchParams.set("recovery", Date.now().toString(36));
        if (!standaloneBuild && /^https?:$/u.test(url.protocol)) url.searchParams.set("nosw", "1");
        location.replace(url.href);
      });
    });
    direction.append(action);
  };

  // A stalled application script can itself block DOMContentLoaded. Start the
  // deadline now, then retry once the DOM is available if parsing was slower.
  let bootDeadlineReached = false;
  recoveryTimer = setTimeout(() => { bootDeadlineReached = true; revealBootRecovery(); }, 4500);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => {
    if (bootDeadlineReached) revealBootRecovery();
  }, { once: true });

  if (noServiceWorker || !("serviceWorker" in navigator) || !navigator.serviceWorker.controller) return;

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
