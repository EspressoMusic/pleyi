/* Teacher calendar dashboard */

const TeacherDash = {
  pin: null,
  bookings: [],
  filter: "upcoming",
  _authSeq: 0,

  init() {
    this.pin = localStorage.getItem("teacher-pin") || "";
    this.bindEvents();
  },

  bindEvents() {
    document.getElementById("roomCalendarTab")?.addEventListener("click", () => this.showInRoom());
    document.getElementById("roomGamesTab")?.addEventListener("click", () => this.hideInRoom());

    document.getElementById("teacherPinForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const pin = document.getElementById("teacherPinInput").value.trim();
      this.tryAuth(pin);
    });

    document.getElementById("teacherPinClose")?.addEventListener("click", () => {
      document.getElementById("teacherPinModal")?.classList.add("hidden");
    });

    document.getElementById("dashStartLessonBtn")?.addEventListener("click", () => {
      if (typeof openModal === "function") openModal("teacher");
    });

    document.querySelectorAll(".dash-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.filter = btn.dataset.filter;
        document.querySelectorAll(".dash-filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.renderList();
        this.renderList("roomBookingsList");
      });
    });

    if (typeof socket !== "undefined") {
      socket.on("booking:new", (b) => {
        this.bookings.push(b);
        this.renderList();
        this.showToast(`תור חדש: ${b.studentName}`);
        this.updateBadge();
      });
      socket.on("booking:paid", (b) => {
        const i = this.bookings.findIndex((x) => x.id === b.id);
        if (i >= 0) this.bookings[i] = b;
        else this.bookings.push(b);
        this.renderList();
        this.showToast(`תשלום התקבל — ${b.studentName}`);
        this.updateBadge();
      });
      socket.on("booking:updated", (b) => {
        const i = this.bookings.findIndex((x) => x.id === b.id);
        if (i >= 0) this.bookings[i] = b;
        this.renderList();
      });
    }
  },

  openPinModal() {
    document.getElementById("teacherPinModal")?.classList.remove("hidden");
    document.getElementById("teacherPinInput")?.focus();
  },

  tryAuth(pin, { showDashboard = true } = {}) {
    if (typeof socket === "undefined") return;
    const seq = ++this._authSeq;
    socket.emit("teacher:subscribe", { pin }, (res) => {
      if (seq !== this._authSeq) return;
      const err = document.getElementById("teacherPinError");
      if (!res?.ok) {
        if (showDashboard) {
          err.textContent = res?.error || "שגיאה";
          err.classList.remove("hidden");
        }
        return;
      }
      this.pin = pin;
      localStorage.setItem("teacher-pin", pin);
      this.bookings = res.bookings || [];
      document.getElementById("teacherPinModal")?.classList.add("hidden");
      err?.classList.add("hidden");
      if (showDashboard) this.showDashboard();
      this.renderList();
      this.updateBadge();
    });
  },

  showDashboard() {
    if (window.GameClassApp?.isInRoom?.()) return;
    document.getElementById("landingView")?.classList.add("hidden");
    document.getElementById("roomView")?.classList.add("hidden");
    document.getElementById("teacherDashView")?.classList.remove("hidden");
    window.scrollTo(0, 0);
  },

  showInRoom() {
    if (!this.pin) {
      this.openPinModal();
      return;
    }
    document.getElementById("lobbyPanel")?.classList.add("hidden");
    document.getElementById("gamePanel")?.classList.add("hidden");
    document.getElementById("roomCalendarPanel")?.classList.remove("hidden");
    document.getElementById("roomGamesTab")?.classList.remove("active");
    document.getElementById("roomCalendarTab")?.classList.add("active");
    this.renderList("roomBookingsList");
  },

  hideInRoom() {
    document.getElementById("roomCalendarPanel")?.classList.add("hidden");
    document.getElementById("lobbyPanel")?.classList.remove("hidden");
    document.getElementById("roomCalendarTab")?.classList.remove("active");
    document.getElementById("roomGamesTab")?.classList.add("active");
  },

  showToast(msg) {
    if (typeof showToast === "function") showToast(msg);
    else {
      const t = document.getElementById("toast");
      if (t) { t.textContent = msg; t.classList.remove("hidden"); }
    }
  },

  updateBadge() {
    const now = new Date().toISOString().slice(0, 16);
    const upcoming = this.bookings.filter(
      (b) => b.status === "paid" && b.slotStart >= now
    ).length;
    const badge = document.getElementById("calendarBadge");
    if (badge) {
      badge.textContent = upcoming;
      badge.classList.toggle("hidden", upcoming === 0);
    }
  },

  filteredBookings() {
    const now = new Date().toISOString().slice(0, 16);
    if (this.filter === "upcoming") {
      return this.bookings.filter((b) => b.slotStart >= now && b.status !== "cancelled");
    }
    if (this.filter === "paid") {
      return this.bookings.filter((b) => b.status === "paid");
    }
    return this.bookings;
  },

  statusLabel(s) {
    return { pending_payment: "ממתין לתשלום", paid: "שולם", cancelled: "בוטל", completed: "הושלם" }[s] || s;
  },

  renderList(targetId = "teacherBookingsList") {
    const el = document.getElementById(targetId);
    if (!el) return;

    const list = this.filteredBookings();
    if (!list.length) {
      el.innerHTML = '<p class="dash-empty">אין תורים להצגה</p>';
      return;
    }

    el.innerHTML = list
      .map((b) => {
        const [date, time] = b.slotStart.split("T");
        const statusCls = b.status === "paid" ? "paid" : b.status === "cancelled" ? "cancelled" : "pending";
        const actions =
          b.status === "paid"
            ? `<button class="btn btn-outline btn-xs" data-action="complete" data-id="${b.id}">סיים</button>
               <button class="btn btn-outline btn-xs danger" data-action="cancel" data-id="${b.id}">בטל</button>`
            : b.status === "pending_payment"
              ? `<button class="btn btn-outline btn-xs danger" data-action="cancel" data-id="${b.id}">בטל</button>`
              : "";
        return `
          <article class="booking-card ${statusCls}">
            <div class="booking-card-top">
              <strong>${b.studentName}</strong>
              <span class="booking-status">${this.statusLabel(b.status)}</span>
            </div>
            <div class="booking-card-meta">
              <span>${date.split("-").reverse().join("/")}</span>
              <span dir="ltr">${time}</span>
            </div>
            <div class="booking-card-contact">
              <span>${b.studentEmail}</span>
              ${b.studentPhone ? `<span dir="ltr">${b.studentPhone}</span>` : ""}
            </div>
            ${b.notes ? `<p class="booking-notes">${b.notes}</p>` : ""}
            ${b.paymentId ? `<p class="booking-pay-id">תשלום: ${b.paymentId}</p>` : ""}
            <div class="booking-card-price">${b.price}${b.currency === "ILS" ? "₪" : b.currency}</div>
            ${actions ? `<div class="booking-card-actions">${actions}</div>` : ""}
          </article>`;
      })
      .join("");

    el.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => this.handleAction(btn.dataset.action, btn.dataset.id));
    });
  },

  async handleAction(action, id) {
    if (!this.pin) return;
    const status = action === "cancel" ? "cancelled" : "completed";
    if (action === "cancel" && !confirm("לבטל את התור?")) return;

    const res = await fetch(`/api/teacher/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-teacher-pin": this.pin },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.ok) {
      const i = this.bookings.findIndex((b) => b.id === id);
      if (i >= 0) this.bookings[i] = data.booking;
      this.renderList();
      this.renderList("roomBookingsList");
      this.updateBadge();
    }
  },
};

document.addEventListener("DOMContentLoaded", () => TeacherDash.init());

// Subscribe to booking updates when teacher creates room — without leaving the room view
window.teacherDashAutoAuth = () => {
  const pin = TeacherDash.pin || localStorage.getItem("teacher-pin");
  if (pin) TeacherDash.tryAuth(pin, { showDashboard: false });
};

window.teacherDashShowInRoom = () => {
  const pin = TeacherDash.pin || localStorage.getItem("teacher-pin");
  if (pin) TeacherDash.tryAuth(pin, { showDashboard: false });
};
