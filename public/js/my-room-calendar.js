/* My room — monthly calendar (played + planned games) */

(function () {
  const modal = document.getElementById("calendarModal");
  if (!modal) return;

  const calGrid = document.getElementById("calGrid");
  const calMonthLabel = document.getElementById("calMonthLabel");
  const calCreditsRemain = document.getElementById("calCreditsRemain");
  const calDayPanel = document.getElementById("calDayPanel");
  const calDayTitle = document.getElementById("calDayTitle");
  const calDayList = document.getElementById("calDayList");
  const calPlanForm = document.getElementById("calPlanForm");
  const calPlanTitle = document.getElementById("calPlanTitle");
  const calPlanNotes = document.getElementById("calPlanNotes");

  const HEB_MONTHS = [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ];

  const HEB_DAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

  let viewYear = new Date().getFullYear();
  let viewMonth = new Date().getMonth();
  let selectedDate = null;
  let playedByDate = {};
  let plannedByDate = {};
  let plannedItems = [];

  const PREVIEW_PLANNED = [
    { id: "p1", title: "אוצר מילים — כיתה ד׳", date: formatDateKey(new Date(Date.now() + 2 * 86400000)) },
    { id: "p2", title: "חיבור וחיסור", date: formatDateKey(new Date(Date.now() + 5 * 86400000)) },
  ];

  function formatDateKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function parseDateKey(key) {
    const [y, m, d] = String(key).split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function formatDisplayDate(key) {
    const d = parseDateKey(key);
    return d.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function usePreviewData() {
    return (
      (location.hostname === "localhost" &&
        new URLSearchParams(location.search).get("preview") === "teacher") ||
      window.GameAuth?.isDevPreviewUser?.() ||
      sessionStorage.getItem("pleyi-guest-preview") === "1"
    );
  }

  function indexHistory(history) {
    playedByDate = {};
    (history || []).forEach((entry) => {
      const key =
        entry.dateKey ||
        UserData.dateKeyFromTimestamp(entry.playedAt) ||
        UserData.dateKeyFromTimestamp(entry.playedAt?.toMillis?.() ? entry.playedAt : null);
      if (!key) return;
      if (!playedByDate[key]) playedByDate[key] = [];
      playedByDate[key].push(entry);
    });
  }

  function indexPlanned(items) {
    plannedItems = items || [];
    plannedByDate = {};
    plannedItems.forEach((item) => {
      const key = item.date;
      if (!key) return;
      if (!plannedByDate[key]) plannedByDate[key] = [];
      plannedByDate[key].push(item);
    });
  }

  async function loadCalendarData() {
    if (usePreviewData()) {
      indexHistory(window.__myRoomPlayHistory || []);
      indexPlanned(PREVIEW_PLANNED);
      return;
    }

    const [history, planned] = await Promise.all([
      UserData.getPlayHistory(200),
      UserData.getPlannedGames(),
    ]);
    indexHistory(history);
    indexPlanned(planned);
  }

  async function updateCreditsLabel() {
    if (!calCreditsRemain) return;
    const { balance, allowance } = await UserData.getCredits();
    calCreditsRemain.textContent = `${balance} קרדיטים נותרו (מתוך ${allowance})`;
  }

  function renderGrid() {
    if (!calGrid) return;

    calMonthLabel.textContent = `${HEB_MONTHS[viewMonth]} ${viewYear}`;

    const first = new Date(viewYear, viewMonth, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayKey = formatDateKey(new Date());

    let html = HEB_DAYS.map((d) => `<div class="cal-weekday">${d}</div>`).join("");

    for (let i = 0; i < startDay; i++) {
      html += `<div class="cal-cell cal-cell--empty" aria-hidden="true"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = formatDateKey(new Date(viewYear, viewMonth, day));
      const played = playedByDate[key]?.length || 0;
      const planned = plannedByDate[key]?.length || 0;
      const isToday = key === todayKey;
      const isSelected = key === selectedDate;

      html += `
        <button type="button" class="cal-cell${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}"
          data-date="${key}" aria-label="${day} ${HEB_MONTHS[viewMonth]}">
          <span class="cal-day-num">${day}</span>
          <span class="cal-day-dots">
            ${played ? '<span class="cal-dot cal-dot--played" title="שוחק"></span>' : ""}
            ${planned ? '<span class="cal-dot cal-dot--planned" title="מתוכנן"></span>' : ""}
          </span>
        </button>`;
    }

    calGrid.innerHTML = html;

    calGrid.querySelectorAll("[data-date]").forEach((btn) => {
      btn.addEventListener("click", () => selectDay(btn.dataset.date));
    });
  }

  function renderDayPanel(key) {
    if (!calDayPanel) return;

    selectedDate = key;
    calDayTitle.textContent = formatDisplayDate(key);

    const played = playedByDate[key] || [];
    const planned = plannedByDate[key] || [];
    const parts = [];

    if (played.length) {
      parts.push(
        `<div class="cal-day-section">
          <h4 class="cal-day-section-title">שוחק</h4>
          <ul class="cal-day-items">
            ${played
              .map(
                (e) =>
                  `<li><strong>${escapeHtml(e.gameTitle)}</strong>${e.reason ? ` · ${escapeHtml(e.reason)}` : e.score != null ? ` · ניקוד ${e.score}` : ""}</li>`
              )
              .join("")}
          </ul>
        </div>`
      );
    }

    if (planned.length) {
      parts.push(
        `<div class="cal-day-section">
          <h4 class="cal-day-section-title">מתוכנן</h4>
          <ul class="cal-day-items">
            ${planned
              .map(
                (p) =>
                  `<li class="cal-planned-row">
                    <span><strong>${escapeHtml(p.title)}</strong>${p.notes ? `<br><small>${escapeHtml(p.notes)}</small>` : ""}</span>
                    <button type="button" class="cal-delete-plan" data-delete-plan="${escapeHtml(p.id)}" aria-label="מחק">×</button>
                  </li>`
              )
              .join("")}
          </ul>
        </div>`
      );
    }

    if (!parts.length) {
      parts.push('<p class="cal-day-empty">אין משחקים ביום זה.</p>');
    }

    calDayList.innerHTML = parts.join("");

    calDayList.querySelectorAll("[data-delete-plan]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("למחוק את התכנון?")) return;
        await UserData.deletePlannedGame(btn.dataset.deletePlan);
        await loadCalendarData();
        renderGrid();
        renderDayPanel(key);
      });
    });

    if (calPlanForm) {
      calPlanForm.classList.remove("hidden");
      calPlanForm.dataset.date = key;
    }
    if (calPlanTitle) calPlanTitle.value = "";
    if (calPlanNotes) calPlanNotes.value = "";

    renderGrid();
  }

  function selectDay(key) {
    renderDayPanel(key);
  }

  async function openCalendar() {
    await loadCalendarData();
    await updateCreditsLabel();
    selectedDate = formatDateKey(new Date());
    renderGrid();
    renderDayPanel(selectedDate);
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeCalendar() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    selectedDate = null;
  }

  /* Calendar opens via MyRoomCalendar.open when enabled */
  document.getElementById("calendarModalClose")?.addEventListener("click", closeCalendar);
  modal.addEventListener("click", (e) => {
    if (e.target.id === "calendarModal") closeCalendar();
  });

  document.getElementById("calPrevMonth")?.addEventListener("click", () => {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    renderGrid();
  });

  document.getElementById("calNextMonth")?.addEventListener("click", () => {
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    renderGrid();
  });

  calPlanForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = calPlanForm.dataset.date;
    const title = calPlanTitle?.value?.trim();
    if (!date || !title) return;

    const res = await UserData.savePlannedGame({
      title,
      date,
      notes: calPlanNotes?.value || "",
    });

    if (!res.ok) {
      alert(res.error || "לא ניתן לשמור");
      return;
    }

    await loadCalendarData();
    renderDayPanel(date);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeCalendar();
  });

  document.addEventListener("credits-updated", () => updateCreditsLabel());

  window.MyRoomCalendar = { open: openCalendar, refresh: loadCalendarData };
})();
