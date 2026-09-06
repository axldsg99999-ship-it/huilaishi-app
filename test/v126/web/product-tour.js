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
        ["你的下一站在这里", "继续未完成的远征；沿途学词、选择强化，找回散落的声页。退出会保留已记录的路线。"],
        ["也可以专心学语言", "从词汇和发音开始，不必先打怪。学习方向的记录分别保存。"],
        ["新手演练，随时重来", "用点选熟悉攻击和强化，不要求麦克风，也不会覆盖已有远征或重复刷经验。"],
        ["地图、练习与成长", "底部切换页面；更多玩法在对战页，学习记录在“我的”。"]
      ],
      lesson: recognitionOnly ? [
        [`${current} · 冲突降级`, "用清晰、尊重的说法暂停争执、表达边界和安全离开。这里不教辱骂，也不评价人的高低。"],
        ["先听，再开口", "点这里听学习示范音，先理解场景，再练习暂停、设限和安全退出。"],
        ["答案只围绕这一档", "根据当前场景选择回应，理解什么时候暂停、什么时候直接说明自己的界限。"],
        ["检查后看为什么", "选好再检查。反馈会说明人物关系、使用场合和更自然的表达方式。"]
      ] : [
        [`${current} · 整课跟着它走`, "本课的场景、示范句、选项和反馈都从你刚选的语域生成，不会混入别档当作正确答案。"],
        ["第一步：听学习示范音", "点这里先听清目标句。需要更慢时，可回首页用“慢听”逐段比较。"],
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
        ["จุดหมายถัดไปอยู่ตรงนี้", "เล่นรอบที่ค้างไว้ต่อ เรียนคำ เลือกพลังเสริม แล้วตามหาหน้ากระดาษ เส้นทางที่บันทึกไว้ยังอยู่เมื่อออก"],
        ["อยากฝึกภาษาอย่างเดียวก็ได้", "เริ่มจากคำศัพท์และการออกเสียง โดยไม่ต้องสู้มอนสเตอร์ บันทึกแยกตามภาษาที่เรียน"],
        ["เล่นบทฝึกซ้ำได้เสมอ", "แตะเลือกเพื่อฝึกโจมตีและรับพลังเสริม ไม่ต้องใช้ไมโครโฟน ไม่ทับเซฟเดิมหรือเพิ่มประสบการณ์ซ้ำ"],
        ["แผนที่ การฝึก และการเติบโต", "สลับหน้าจากเมนูล่าง เกมอื่นอยู่หน้าต่อสู้ บันทึกการเรียนอยู่ที่หน้าของฉัน"]
      ],
      lesson: recognitionOnly ? [
        [`${current} · คลี่คลายความขัดแย้ง`, "ฝึกหยุดการโต้เถียง ตั้งขอบเขต และออกอย่างปลอดภัยด้วยคำที่ชัดเจนและให้เกียรติ ไม่สอนคำด่าหรือตัดสินคุณค่าของคน"],
        ["ฟังก่อน แล้วค่อยพูด", "แตะเพื่อฟังเสียงตัวอย่าง เข้าใจฉาก แล้วฝึกหยุด ตั้งขอบเขต และออกจากสถานการณ์อย่างปลอดภัย"],
        ["คำตอบยึดระดับที่เลือก", "เลือกคำตอบตามสถานการณ์ เข้าใจว่าเมื่อไรควรหยุด และเมื่อไรควรบอกขอบเขตของตนอย่างชัดเจน"],
        ["ตรวจแล้วอ่านเหตุผล", "เลือกก่อนแล้วค่อยตรวจ ฟีดแบ็กจะอธิบายความสัมพันธ์ สถานการณ์ และวิธีพูดที่เป็นธรรมชาติขึ้น"]
      ] : [
        [`${current} · ทั้งบทใช้ระดับนี้`, "ฉาก เสียงตัวอย่าง ตัวเลือก และฟีดแบ็กมาจากระดับที่คุณเลือก คำตอบจากระดับอื่นจะไม่ถูกนำมาปนเป็นคำตอบที่ถูก"],
        ["ขั้นแรก: ฟังเสียงตัวอย่างเพื่อเรียน", "แตะเพื่อฟังประโยคเป้าหมายให้ชัด หากต้องการช้ากว่านี้ กลับหน้าแรกแล้วใช้ปุ่มฟังช้า"],
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
      : ["#hub-adventure", "#hub-study", "#hub-replay", ".bottom-nav"];
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
      const value = zh ? "查看冒险与学习引导" : "ดูคำแนะนำการผจญภัยและเรียนภาษา";
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
