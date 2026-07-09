/* Client helper — turn lesson text into game content via server AI */

(function () {
  let configured = null;

  async function checkStatus(force = false) {
    if (!force && configured !== null) return { configured };
    try {
      const res = await fetch("/api/ai/status");
      const data = await res.json();
      configured = !!data?.configured;
      return data;
    } catch {
      configured = false;
      return { configured: false };
    }
  }

  async function generate({ lessonText, subject = "english" }) {
    const res = await fetch("/api/ai/generate-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonText, subject }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.error || "שגיאה ביצירת המשחק");
    }
    return data;
  }

  async function bindGenerateButton(btn, getInput, options = {}) {
    if (!btn) return;
    const status = await checkStatus();
    if (!status.configured) {
      btn.classList.add("hidden");
      return;
    }
    btn.classList.remove("hidden");

    btn.addEventListener("click", async () => {
      const { text, subject } = getInput();
      if (!String(text || "").trim()) {
        options.onToast?.("הדביקו תוכן שיעור קודם");
        return;
      }

      const label = btn.dataset.aiLabel || btn.textContent;
      btn.disabled = true;
      btn.textContent = "מעבד…";
      btn.setAttribute("aria-busy", "true");

      try {
        const result = await generate({ lessonText: text, subject });
        await options.onSuccess?.(result);
        options.onToast?.(`נוצרו ${result.itemCount} פריטים`);
      } catch (e) {
        options.onToast?.(e.message || "שגיאה ב-AI");
      } finally {
        btn.disabled = false;
        btn.textContent = label;
        btn.dataset.aiLabel = label;
        btn.removeAttribute("aria-busy");
      }
    });
  }

  window.AI_LESSON = {
    checkStatus,
    generate,
    bindGenerateButton,
  };
})();
