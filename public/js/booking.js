/* Student booking flow — calendar + Bit payment */



const Booking = {

  settings: null,

  selectedDate: null,

  selectedSlot: null,

  pendingBooking: null,

  calYear: new Date().getFullYear(),

  calMonth: new Date().getMonth() + 1,

  step: 1,

  payMethod: "bit",



  async init() {

    await this.loadSettings();

    this.bindNav();

    this.bindPaymentTabs();

    if (document.getElementById("booking")) {

      this.renderStep();

      this.loadMonth();

    }

  },



  async loadSettings() {

    const res = await fetch("/api/booking/settings");

    const data = await res.json();

    if (data.ok) this.settings = data;

  },



  bindNav() {

    document.getElementById("heroBookBtn")?.addEventListener("click", () => {

      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });

    });

  },



  bindPaymentTabs() {

    document.querySelectorAll(".pay-tab").forEach((tab) => {

      tab.addEventListener("click", () => {

        this.payMethod = tab.dataset.pay;

        document.querySelectorAll(".pay-tab").forEach((t) => t.classList.toggle("active", t === tab));

        document.getElementById("payPanelBit")?.classList.toggle("hidden", this.payMethod !== "bit");

        document.getElementById("payPanelCard")?.classList.toggle("hidden", this.payMethod !== "card");

      });

    });

  },



  monthLabel() {

    const months = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

    return `${months[this.calMonth - 1]} ${this.calYear}`;

  },



  async loadMonth() {

    const grid = document.getElementById("calGrid");

    if (!grid) return;

    grid.innerHTML = '<p class="cal-loading">טוען יומן...</p>';



    const res = await fetch(`/api/booking/month?year=${this.calYear}&month=${this.calMonth}`);

    const data = await res.json();

    if (!data.ok) return;



    const dayNames = ["א","ב","ג","ד","ה","ו","ש"];

    let html = dayNames.map((d) => `<div class="cal-head">${d}</div>`).join("");



    const firstDow = new Date(this.calYear, this.calMonth - 1, 1).getDay();

    for (let i = 0; i < firstDow; i++) html += `<div class="cal-empty"></div>`;



    data.days.forEach((day) => {

      const d = day.date.split("-")[2].replace(/^0/, "");

      const cls = [

        "cal-day",

        day.past ? "past" : "",

        day.hasSlots ? "available" : "full",

        this.selectedDate === day.date ? "selected" : "",

      ].filter(Boolean).join(" ");

      const disabled = day.past || !day.hasSlots;

      html += `<button type="button" class="${cls}" data-date="${day.date}" ${disabled ? "disabled" : ""}>${d}</button>`;

    });



    grid.innerHTML = html;

    document.getElementById("calMonthLabel").textContent = this.monthLabel();



    grid.querySelectorAll(".cal-day:not([disabled])").forEach((btn) => {

      btn.addEventListener("click", () => {

        this.selectedDate = btn.dataset.date;

        this.selectedSlot = null;

        this.loadMonth();

        this.loadSlots();

      });

    });

  },



  async loadSlots() {

    const wrap = document.getElementById("slotList");

    if (!wrap || !this.selectedDate) {

      wrap && (wrap.innerHTML = '<p class="slot-hint">בחרו תאריך ביומן</p>');

      return;

    }



    wrap.innerHTML = '<p class="cal-loading">טוען שעות...</p>';

    const res = await fetch(`/api/booking/slots?date=${this.selectedDate}`);

    const data = await res.json();

    if (!data.ok) return;



    const avail = data.slots.filter((s) => s.available);

    if (!avail.length) {

      wrap.innerHTML = '<p class="slot-hint">אין שעות פנויות ביום זה</p>';

      return;

    }



    wrap.innerHTML = avail

      .map(

        (s) =>

          `<button type="button" class="slot-btn ${this.selectedSlot === s.start ? "selected" : ""}" data-start="${s.start}">${s.label}</button>`

      )

      .join("");



    wrap.querySelectorAll(".slot-btn").forEach((btn) => {

      btn.addEventListener("click", () => {

        this.selectedSlot = btn.dataset.start;

        this.loadSlots();

        document.getElementById("bookingNext1")?.removeAttribute("disabled");

      });

    });



    const sym = this.settings?.currencySymbol || "₪";

    const price = data.settings.pricePerLesson;

    const mins = data.settings.lessonDurationMinutes;

    document.getElementById("bookingPriceLabel").textContent = `${price}${sym} · ${mins} דקות`;

  },



  renderStep() {

    document.querySelectorAll(".booking-step").forEach((el) => el.classList.add("hidden"));

    document.getElementById(`bookingStep${this.step}`)?.classList.remove("hidden");

    document.querySelectorAll(".booking-progress-dot").forEach((dot, i) => {

      dot.classList.toggle("active", i + 1 <= this.step);

      dot.classList.toggle("done", i + 1 < this.step);

    });

  },



  goStep(n) {

    this.step = n;

    this.renderStep();

    if (n === 1) this.loadMonth();

    if (n >= 3 && this.pendingBooking) {

      this.showSummary();

      this.setupBitPanel();

    }

  },



  showSummary() {

    const b = this.pendingBooking;

    const sym = this.settings?.currencySymbol || "₪";

    const el = document.getElementById("paySummary");

    if (!el || !b) return;

    const [date, time] = b.slotStart.split("T");

    el.innerHTML = `

      <div class="pay-summary-row"><span>תאריך</span><strong>${date.split("-").reverse().join("/")}</strong></div>

      <div class="pay-summary-row"><span>שעה</span><strong dir="ltr">${time}</strong></div>

      <div class="pay-summary-row"><span>שם</span><strong>${b.studentName}</strong></div>

      <div class="pay-summary-row"><span>טלפון</span><strong dir="ltr">${b.studentPhone || "—"}</strong></div>

      <div class="pay-summary-row total"><span>לתשלום</span><strong>${b.price}${sym}</strong></div>

    `;

  },



  setupBitPanel() {

    const sym = this.settings?.currencySymbol || "₪";

    const price = this.pendingBooking?.price || this.settings?.pricePerLesson || 299;

    document.getElementById("bitPayAmount").textContent = `סכום לתשלום: ${price}${sym}`;

    document.getElementById("bitPayPhone").textContent = this.settings?.bitPhone || "050-0000000";

    document.getElementById("bitPayName").textContent = `שם לתשלום: ${this.settings?.bitPayName || "English Play"}`;

  },



  async submitDetails(e) {

    e.preventDefault();

    const form = e.target;

    const phone = form.studentPhone.value.trim();

    const payload = {

      slotStart: this.selectedSlot,

      studentName: form.studentName.value.trim(),

      studentPhone: phone,

      studentEmail: form.studentEmail?.value?.trim() || "",

    };



    const err = document.getElementById("bookingFormError");

    err.classList.add("hidden");



    if (!this.selectedSlot) {

      err.textContent = "בחרו תאריך ושעה";

      err.classList.remove("hidden");

      return;

    }

    if (!phone || phone.length < 9) {

      err.textContent = "נא להזין מספר טלפון תקין";

      err.classList.remove("hidden");

      return;

    }



    const res = await fetch("/api/bookings", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(payload),

    });

    const data = await res.json();

    if (!data.ok) {

      err.textContent = data.error || "שגיאה";

      err.classList.remove("hidden");

      return;

    }



    this.pendingBooking = data.booking;

    this.step = 3;

    this.renderStep();

    this.showSummary();

    this.setupBitPanel();

  },



  async processPayment(method) {

    const err = document.getElementById("payFormError");

    err.classList.add("hidden");

    if (!this.pendingBooking) return;



    if (method === "card") {

      const card = document.getElementById("cardNumber")?.value.replace(/\s/g, "") || "";

      if (card.length < 12) {

        err.textContent = "מספר כרטיס לא תקין";

        err.classList.remove("hidden");

        return;

      }

    }



    const btn = method === "bit" ? document.getElementById("bitConfirmBtn") : document.getElementById("paySubmitBtn");

    if (btn) {

      btn.disabled = true;

      btn.textContent = "מעבד...";

    }



    const res = await fetch(`/api/bookings/${this.pendingBooking.id}/pay`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ method }),

    });

    const data = await res.json();



    if (btn) {

      btn.disabled = false;

      btn.textContent = method === "bit" ? "אישרתי ששילמתי בביט" : "שלם ואשר תור";

    }



    if (!data.ok) {

      err.textContent = data.error || "שגיאה בתשלום";

      err.classList.remove("hidden");

      return;

    }



    this.step = 4;

    this.renderStep();

    const confirm = document.getElementById("bookingConfirm");

    const [date, time] = data.booking.slotStart.split("T");

    confirm.innerHTML = `

      <h3>התור נקבע ושולם!</h3>

      <p>${date.split("-").reverse().join("/")} בשעה ${time} · 50 דקות</p>

      <p class="confirm-id">אישור: ${data.booking.paymentId}</p>

      <p class="confirm-note">נתראה בשיעור! המורה ישלח קישור לחדר המשחקים לפני השיעור.</p>

    `;

  },

};



document.addEventListener("DOMContentLoaded", () => {

  Booking.init();



  document.getElementById("calPrev")?.addEventListener("click", () => {

    Booking.calMonth--;

    if (Booking.calMonth < 1) { Booking.calMonth = 12; Booking.calYear--; }

    Booking.loadMonth();

  });

  document.getElementById("calNext")?.addEventListener("click", () => {

    Booking.calMonth++;

    if (Booking.calMonth > 12) { Booking.calMonth = 1; Booking.calYear++; }

    Booking.loadMonth();

  });



  document.getElementById("bookingNext1")?.addEventListener("click", () => {

    if (!Booking.selectedSlot) return;

    Booking.step = 2;

    Booking.renderStep();

  });

  document.getElementById("bookingBack2")?.addEventListener("click", () => Booking.goStep(1));

  document.getElementById("bookingBack3")?.addEventListener("click", () => Booking.goStep(2));



  document.getElementById("bookingDetailsForm")?.addEventListener("submit", (e) => Booking.submitDetails(e));

  document.getElementById("paymentForm")?.addEventListener("submit", (e) => {

    e.preventDefault();

    Booking.processPayment("card");

  });

  document.getElementById("bitConfirmBtn")?.addEventListener("click", () => Booking.processPayment("bit"));



  document.getElementById("bookingNext1")?.setAttribute("disabled", "");

});

