(() => {
  "use strict";

  const CACHE_VERSION = "huilaishi-offline-v38";
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
