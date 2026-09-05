(() => {
  "use strict";
  // This is a network preview, never an installed native application.
  Object.defineProperty(globalThis, "HUILAISHI_PUBLIC_TEST", { value: "v119-r2" });
  Object.defineProperty(globalThis, "HUILAISHI_DISTRIBUTION", {
    value: Object.freeze({ channel: "public-test", store: false, livePartner: false,
      commerce: Object.freeze({ mode: "disabled" }) })
  });
  const url = new URL(location.href);
  if (url.searchParams.get("nosw") !== "1") {
    url.searchParams.set("nosw", "1");
    history.replaceState(history.state, "", url.href);
  }
})();
