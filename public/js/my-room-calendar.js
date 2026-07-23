/* My room — inline minimalist lesson calendar */

(function () {
  const grid = document.getElementById("roomCalGrid");
  const monthLabel = document.getElementById("roomCalMonth");
  const dayPanel = document.getElementById("roomCalDay");
  const dayLabel = document.getElementById("roomCalDayLabel");
  const dayList = document.getElementById("roomCalDayList");
  if (!grid || !monthLabel) return;

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
  let lessonsByDate = {};

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function dateKeyFromParts(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function todayKey() {
    const t = new Date();
    return dateKeyFromParts(t.getFullYear(), t.getMonth(), t.getDate());
  }

  function formatDisplayDate(key) {
    const [y, m, d] = String(key).split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("he-IL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  function indexLessons(entries) {
    lessonsByDate = {};
    (entries || []).forEach((entry) => {
      const key =
        entry.dateKey ||
        window.UserData?.dateKeyFromTimestamp?.(entry.playedAt) ||
        "";
      if (!key) return;
      if (!lessonsByDate[key]) lessonsByDate[key] = [];
      lessonsByDate[key].push(entry);
    });
  }

  function renderGrid() {
    monthLabel.textContent = `${HEB_MONTHS[viewMonth]} ${viewYear}`;

    const first = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startDow = first.getDay();
    const today = todayKey();

    let html = HEB_DAYS.map((d) => `<div class="room-cal-weekday" role="columnheader">${d}</div>`).join("");

    for (let i = 0; i < startDow; i++) {
      html += `<div class="room-cal-cell room-cal-cell--empty" aria-hidden="true"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = dateKeyFromParts(viewYear, viewMonth, day);
      const count = lessonsByDate[key]?.length || 0;
      const isToday = key === today;
      const isSelected = key === selectedDate;
      const title = count ? `${count} שיעורים` : "";

      html += `<button type="button" class="room-cal-cell${isToday ? " is-today" : ""}${
        isSelected ? " is-selected" : ""
      }${count ? " has-lessons" : ""}" data-date="${key}" aria-label="${day}${
        count ? ` — ${count} שיעורים` : ""
      }"${title ? ` title="${title}"` : ""}>
        <span class="room-cal-num">${day}</span>
        ${count ? `<span class="room-cal-mark" aria-hidden="true">${count > 1 ? count : ""}</span>` : ""}
      </button>`;
    }

    grid.innerHTML = html;

    grid.querySelectorAll(".room-cal-cell[data-date]").forEach((btn) => {
      btn.addEventListener("click", () => selectDay(btn.dataset.date));
    });

    if (selectedDate && !lessonsByDate[selectedDate]?.length) {
      const inMonth =
        selectedDate.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-`);
      if (!inMonth) selectedDate = null;
    }

    renderDayPanel();
  }

  function renderDayPanel() {
    if (!selectedDate) {
      dayPanel.hidden = true;
      return;
    }

    const items = lessonsByDate[selectedDate] || [];
    dayLabel.textContent = formatDisplayDate(selectedDate);
    dayPanel.hidden = false;

    if (!items.length) {
      dayList.innerHTML = `<li class="room-cal-day-empty">אין שיעורים ביום זה</li>`;
      return;
    }

    dayList.innerHTML = items
      .map((entry) => {
        const title = escapeHtml(entry.gameTitle || entry.gameId || "שיעור");
        const meta = entry.reason
          ? escapeHtml(entry.reason)
          : entry.score != null
            ? `ניקוד ${entry.score}`
            : "";
        return `<li><span class="room-cal-lesson-title">${title}</span>${
          meta ? `<span class="room-cal-lesson-meta">${meta}</span>` : ""
        }</li>`;
      })
      .join("");
  }

  function selectDay(key) {
    selectedDate = selectedDate === key ? null : key;
    renderGrid();
  }

  function changeMonth(delta) {
    viewMonth += delta;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    } else if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    renderGrid();
  }

  document.getElementById("roomCalPrev")?.addEventListener("click", () => changeMonth(-1));
  document.getElementById("roomCalNext")?.addEventListener("click", () => changeMonth(1));

  window.MyRoomCalendar = {
    setHistory(entries) {
      indexLessons(entries);
      renderGrid();
    },
  };
})();
