(function () {
  let lastPlan = null;
  let aiConfigured = false;

  const $ = (id) => document.getElementById(id);

  function toast(msg) {
    const el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.add("hidden"), 2800);
  }

  function showError(msg) {
    const el = $("lpError");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
  }

  function hideError() {
    $("lpError")?.classList.add("hidden");
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function planToText(plan) {
    if (!plan) return "";
    const lines = [
      plan.title,
      plan.gradeLevel ? `כיתה: ${plan.gradeLevel}` : "",
      `משך: ${plan.durationMinutes} דקות`,
      "",
      `מטרה: ${plan.goal}`,
      "",
    ].filter(Boolean);

    plan.sections.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.title} (${s.duration} דק')`);
      lines.push(s.content);
      lines.push("");
    });

    if (plan.materials?.length) {
      lines.push("חומרים:", ...plan.materials.map((m) => `• ${m}`), "");
    }
    if (plan.tips?.length) {
      lines.push("טיפים:", ...plan.tips.map((t) => `• ${t}`));
    }

    return lines.join("\n").trim();
  }

  function renderPlan(plan) {
    lastPlan = plan;
    $("lpEmptyState")?.classList.add("hidden");
    $("lpResultWrap")?.classList.remove("hidden");

    const sourceEl = $("lpResultSource");
    if (sourceEl) {
      sourceEl.textContent =
        plan.source === "ai" ? "נוצר עם AI" : "טיוטה (AI יתחבר בהמשך)";
    }

    $("lpResultTitle").textContent = plan.title || "מערך שיעור";
    const metaParts = [`${plan.durationMinutes} דקות`];
    if (plan.gradeLevel) metaParts.unshift(`כיתה ${plan.gradeLevel}`);
    if (plan.topic) metaParts.push(plan.topic);
    $("lpResultMeta").textContent = metaParts.join(" · ");
    $("lpGoal").textContent = plan.goal || "";

    $("lpSections").innerHTML = (plan.sections || [])
      .map(
        (s) => `
        <li class="lp-section">
          <div class="lp-section-head">
            <h3>${escapeHtml(s.title)}</h3>
            <span class="lp-section-duration">${escapeHtml(String(s.duration))} דק'</span>
          </div>
          <p>${escapeHtml(s.content)}</p>
        </li>`
      )
      .join("");

    const materialsWrap = $("lpMaterialsWrap");
    const materialsList = $("lpMaterials");
    if (plan.materials?.length && materialsWrap && materialsList) {
      materialsWrap.classList.remove("hidden");
      materialsList.innerHTML = plan.materials.map((m) => `<li>${escapeHtml(m)}</li>`).join("");
    } else {
      materialsWrap?.classList.add("hidden");
    }

    const tipsWrap = $("lpTipsWrap");
    const tipsList = $("lpTips");
    if (plan.tips?.length && tipsWrap && tipsList) {
      tipsWrap.classList.remove("hidden");
      tipsList.innerHTML = plan.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join("");
    } else {
      tipsWrap?.classList.add("hidden");
    }

    $("lpResultWrap")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function checkAiStatus() {
    try {
      const res = await fetch("/api/ai/status");
      const data = await res.json();
      aiConfigured = !!data?.configured;
    } catch {
      aiConfigured = false;
    }
  }

  $("lpForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const topic = $("lpTopic")?.value.trim() || "";
    const material = $("lpMaterial")?.value.trim() || "";
    const gradeLevel = $("lpGrade")?.value || "";
    const durationMinutes = Number($("lpDuration")?.value) || 45;
    const btn = $("lpSubmit");

    if (!topic && !material) return showError("נא להזין נושא או חומר");
    if (material.length < 8 && !topic) return showError("הוסיפו עוד פרטים בחומר השיעור");

    const label = btn?.textContent || "צור מערך שיעור";
    if (btn) {
      btn.disabled = true;
      btn.textContent = aiConfigured ? "יוצר עם AI…" : "מארגן…";
    }

    try {
      const res = await fetch("/api/lesson-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, material, durationMinutes, gradeLevel }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "שגיאה ביצירת המערך");

      renderPlan(data.plan);
      toast(data.plan?.source === "ai" ? "מערך השיעור מוכן!" : "טיוטה מוכנה — AI ישדרג בהמשך");
    } catch (err) {
      showError(err.message || "שגיאה");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = label;
      }
    }
  });

  $("lpCopyBtn")?.addEventListener("click", async () => {
    if (!lastPlan) return;
    try {
      await navigator.clipboard.writeText(planToText(lastPlan));
      toast("הועתק!");
    } catch {
      toast("לא הצלחנו להעתיק");
    }
  });

  $("lpNewBtn")?.addEventListener("click", () => {
    $("lpResultWrap")?.classList.add("hidden");
    $("lpEmptyState")?.classList.remove("hidden");
    lastPlan = null;
    $("lpTopic")?.focus();
  });

  checkAiStatus();
})();
