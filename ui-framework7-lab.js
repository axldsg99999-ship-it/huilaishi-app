(() => {
  "use strict";

  const app = new Framework7({
    el: "#ui-lab",
    name: "萨瓦迪卡 UI Lab",
    theme: "auto",
    mdColorScheme: "monochrome",
    colors: {
      primary: "#14786c",
    },
    touchRipple: true,
    darkMode: false,
  });

  const openRegister = event => {
    event?.preventDefault();
    app.sheet.open(".demo-register-sheet");
  };

  document.querySelector("#lab-open-register")?.addEventListener("click", openRegister);
  document.querySelector("#lab-open-register-2")?.addEventListener("click", openRegister);

  document.querySelectorAll("[data-demo-toast]").forEach(node => {
    node.addEventListener("click", event => {
      event.preventDefault();
      app.toast.create({
        text: node.dataset.demoToast,
        closeTimeout: 1500,
        position: "center",
      }).open();
    });
  });

  document.querySelectorAll('input[name="demo-register"]').forEach(input => {
    input.addEventListener("change", () => {
      const label = input.closest("label")?.querySelector("b")?.textContent || input.value;
      app.toast.create({ text: `已选择 ${label}`, closeTimeout: 1200 }).open();
    });
  });
})();
