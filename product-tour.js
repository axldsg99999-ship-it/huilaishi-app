(() => {
  "use strict";

  const VERSION = "1.1.0";
  let activeTour = null;
  let launchTimer = 0;
  let backgroundInertState = null;

  const isZh = () => !document.body.classList.contains("dir-th-zh");
  const lang = () => isZh() ? "zh-CN" : "th-TH";
  const visible = element => Boolean(element && !element.closest(".hidden") && element.getClientRects().length);
  const text = selector => document.querySelector(selector)?.textContent?.trim() || "";
  const registerCode = () => (text("#lesson-mode-chip") || `${text("#home-register-grade")} · ${text("#home-register-name")}`).trim();
  const grade = () => (registerCode().match(/S[1-5]/)?.[0] || "S4");

  function wording() {
    const current = registerCode();
    const recognitionOnly = grade() === "S1";
    if (isZh()) return {
      next: "下一步",
      previous: "上一步",
      done: "明白了",
      close: "关闭引导",
      progress: "{{current}} / {{total}}",
      home: [
        [`${current || "当前语域"}，不是装饰标签`, "首页任务、示例句、话术库和离线对话都会跟着这个档位更新。这里评价的是表达与场合，不是评价你这个人。"],
        ["先走一条完整路线", `点这里进入 ${current || "当前档"} 的首课：先听场景，再判断分寸，最后才开口。`],
        ["同一句，直接对比五档", "在这里切换 S5—S1，句子、适用场景、风险提示和声音类型会一起变化。S1 只用于识别风险台词。"],
        ["练习不是堆在一起", "实战、挑战、3000 词库和我的进度各有入口；当前方向与语域会贯穿所有页面。"]
      ],
      lesson: recognitionOnly ? [
        [`${current} · 本课只练识别`, "你选的是最低语域。本课用角色萌音呈现风险台词，但它不是标准发音，也不要求跟读。"],
        ["先听懂，不模仿", "点这里听角色台词，目标是识别攻击性、粗口和使用风险。题目随后会给出 S4 安全化解。"],
        ["答案只围绕这一档", "每题都从当前 S1 路线生成：找出风险，再选能保留边界、降低冲突的 S4 回应。"],
        ["检查后看为什么", "选好再检查。反馈会说明场合与风险，不会把粗口包装成推荐说法。"]
      ] : [
        [`${current} · 整课跟着它走`, "本课的场景、示范句、选项和反馈都从你刚选的语域生成，不会混入别档当作正确答案。"],
        ["第一步：听标准学习音", "点这里先听清目标句。需要更慢时，可回首页用“慢听”逐段比较。"],
        ["第二步：判断分寸", `从三种说法里选出符合 ${current} 的一句；错误选项会标明它实际属于哪一档。`],
        ["第三步：检查并理解", "检查后会解释为什么适合或不适合，再进入下一场景。先说准，再追求语速。"]
      ]
    };
    return {
      next: "ต่อไป",
      previous: "ย้อนกลับ",
      done: "เข้าใจแล้ว",
      close: "ปิดคำแนะนำ",
      progress: "{{current}} / {{total}}",
      home: [
        [`${current || "ระดับปัจจุบัน"} ไม่ใช่แค่ป้าย`, "ภารกิจ ตัวอย่าง คลังประโยค และบทสนทนาออฟไลน์จะเปลี่ยนตามระดับนี้ เราประเมินสำนวนและสถานการณ์ ไม่ได้ตัดสินตัวคุณ"],
        ["เริ่มจากเส้นทางเดียวให้จบ", `แตะเพื่อเริ่มบทแรกของ ${current || "ระดับนี้"}: ฟังฉาก แยกระดับภาษา แล้วจึงพูด`],
        ["ประโยคเดียว เทียบได้ 5 ระดับ", "สลับ S5—S1 แล้วดูประโยค บริบท ความเสี่ยง และชนิดเสียงเปลี่ยนพร้อมกัน S1 ใช้เพื่อรู้ทันคำเสี่ยงเท่านั้น"],
        ["แต่ละส่วนฝึกคนละทักษะ", "บทสนทนา เกม คลัง 3,000 คำ และความคืบหน้าแยกชัดเจน โดยใช้ทิศทางและระดับเดียวกันทั้งแอป"]
      ],
      lesson: recognitionOnly ? [
        [`${current} · บทนี้ฝึกเพื่อรู้ทัน`, "คุณเลือกระดับต่ำสุด เสียงตัวละครน่ารักใช้แสดงคำเสี่ยงเท่านั้น ไม่ใช่เสียงมาตรฐานและไม่ต้องพูดตาม"],
        ["ฟังให้เข้าใจ ไม่เลียนแบบ", "แตะเพื่อฟังคำของตัวละคร เป้าหมายคือจับความก้าวร้าว คำหยาบ และความเสี่ยง แล้วดูฉบับ S4 ที่ปลอดภัยกว่า"],
        ["คำตอบยึดระดับที่เลือก", "ทุกข้อสร้างจากเส้นทาง S1 ปัจจุบัน: หาจุดเสี่ยง แล้วเลือกคำตอบ S4 ที่คงขอบเขตแต่ลดความขัดแย้ง"],
        ["ตรวจแล้วอ่านเหตุผล", "เลือกก่อนแล้วค่อยตรวจ ฟีดแบ็กจะอธิบายบริบทและความเสี่ยง โดยไม่แนะนำให้ใช้คำหยาบ"]
      ] : [
        [`${current} · ทั้งบทใช้ระดับนี้`, "ฉาก เสียงตัวอย่าง ตัวเลือก และฟีดแบ็กมาจากระดับที่คุณเลือก คำตอบจากระดับอื่นจะไม่ถูกนำมาปนเป็นคำตอบที่ถูก"],
        ["ขั้นแรก: ฟังเสียงมาตรฐาน", "แตะเพื่อฟังประโยคเป้าหมายให้ชัด หากต้องการช้ากว่านี้ กลับหน้าแรกแล้วใช้ปุ่มฟังช้า"],
        ["ขั้นสอง: แยกระดับภาษา", `เลือกประโยคที่ตรงกับ ${current} ตัวเลือกที่ผิดจะบอกว่าจริง ๆ อยู่ระดับไหน`],
        ["ขั้นสาม: ตรวจและเข้าใจ", "หลังตรวจ ระบบจะอธิบายว่าเหมาะหรือไม่เหมาะกับสถานการณ์อย่างไร ออกเสียงให้ชัดก่อนค่อยเพิ่มความเร็ว"]
      ]
    };
  }

  function decoratePopover(popover, copy) {
    popover.wrapper.classList.add("huilaishi-tour");
    popover.wrapper.setAttribute("role", "dialog");
    popover.wrapper.setAttribute("aria-modal", "true");
    const title = popover.wrapper.querySelector(".driver-popover-title");
    const description = popover.wrapper.querySelector(".driver-popover-description");
    if (title) { title.id = "huilaishi-tour-title"; popover.wrapper.setAttribute("aria-labelledby", title.id); }
    if (description) { description.id = "huilaishi-tour-description"; popover.wrapper.setAttribute("aria-describedby", description.id); }
    popover.closeButton.setAttribute("aria-label", copy.close);
    [
      [popover.closeButton, isZh() ? "关闭" : "ปิด"],
      [popover.nextButton, activeTour?.isLastStep?.() ? copy.done : copy.next]
    ].forEach(([button, label]) => {
      if (!button) return;
      button.dataset.speakText = label;
      button.dataset.speakLang = lang();
      button.dataset.speechTrack = "navigation";
    });
  }

  function setBackgroundInert(active) {
    const app = document.querySelector("#app");
    if (!app) return;
    if (active) {
      if (backgroundInertState) return;
      backgroundInertState = { inert: Boolean(app.inert) };
      app.inert = true;
      return;
    }
    if (!backgroundInertState) return;
    app.inert = backgroundInertState.inert;
    backgroundInertState = null;
  }

  function buildTour(steps) {
    const factory = globalThis.driver?.js?.driver;
    if (typeof factory !== "function") return null;
    const copy = wording();
    activeTour?.destroy?.();
    activeTour = factory({
      animate: !globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
      allowClose: true,
      allowKeyboardControl: true,
      overlayClickBehavior: "close",
      overlayColor: "#142f27",
      overlayOpacity: .76,
      stagePadding: 8,
      stageRadius: 9,
      popoverClass: "huilaishi-tour",
      showProgress: true,
      progressText: copy.progress,
      nextBtnText: copy.next,
      prevBtnText: copy.previous,
      doneBtnText: copy.done,
      showButtons: ["next", "close"],
      skipMissingElement: true,
      onPopoverRender: popover => decoratePopover(popover, copy),
      onDestroyed: () => { setBackgroundInert(false); activeTour = null; }
    });
    activeTour.setSteps(steps);
    return activeTour;
  }

  function launch(kind, { automatic = false } = {}) {
    clearTimeout(launchTimer);
    const copy = wording();
    const lesson = kind === "lesson";
    const key = `huilaishi-guide-v12:${lesson ? "lesson" : "home"}:${isZh() ? "zh-th" : "th-zh"}:${grade()}`;
    if (automatic) {
      try { if (globalThis.HUILAISHI_STORAGE?.getItem(key) === "1") return false; } catch (_) {}
    }
    const selectors = lesson
      ? ["#lesson-mode-chip", "#speak-npc", "#answer-list", "#lesson-next"]
      : [".register-brief", "#start-lesson", "#vibe-card", ".bottom-nav"];
    if (!visible(document.querySelector(selectors[0]))) return false;
    const content = lesson ? copy.lesson : copy.home;
    const tour = buildTour(selectors.map((element, index) => ({
      element,
      popover: {
        title: content[index][0],
        description: content[index][1],
        side: index === selectors.length - 1 ? "top" : "bottom",
        align: "center"
      }
    })));
    if (!tour) return false;
    try { globalThis.HUILAISHI_STORAGE?.setItem(key, "1"); } catch (_) {}
    globalThis.HUILAISHI_SPEECH?.stop?.();
    setBackgroundInert(true);
    try { tour.drive(); }
    catch (_) { setBackgroundInert(false); activeTour = null; return false; }
    return true;
  }

  function syncButtons() {
    const zh = isZh();
    const home = document.querySelector("#open-guide");
    const lesson = document.querySelector("#lesson-guide");
    if (home) {
      const value = zh ? "查看本档学习引导" : "ดูคำแนะนำของระดับนี้";
      home.setAttribute("aria-label", value);
      home.dataset.speakText = zh ? "查看" : "ดู";
      home.dataset.speakLang = lang();
    }
    if (lesson) {
      const value = zh ? "查看本课引导" : "ดูคำแนะนำบทนี้";
      lesson.setAttribute("aria-label", value);
      lesson.dataset.speakText = zh ? "查看" : "ดู";
      lesson.dataset.speakLang = lang();
    }
  }

  function init() {
    syncButtons();
    document.querySelector("#open-guide")?.addEventListener("click", () => {
      const home = document.querySelector("#view-home");
      if (!home?.classList.contains("active")) document.querySelector(".logo-button")?.click?.();
      launchTimer = setTimeout(() => launch("home"), 180);
    });
    document.querySelector("#lesson-guide")?.addEventListener("click", () => launch("lesson"));
    // Guidance is intentionally opt-in. On a phone, an automatic four-step
    // modal made the first lesson feel blocked immediately after onboarding.
    new MutationObserver(syncButtons).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  globalThis.HUILAISHI_GUIDE = Object.freeze({ launch, version: VERSION });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
