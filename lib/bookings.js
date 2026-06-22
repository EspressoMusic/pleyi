const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "data");
const SETTINGS_PATH = path.join(DATA_DIR, "settings.json");
const BOOKINGS_PATH = path.join(DATA_DIR, "bookings.json");

const DEFAULT_SETTINGS = {
  teacherPin: "teacher2026",
  pricePerLesson: 299,
  currency: "ILS",
  currencySymbol: "₪",
  lessonDurationMinutes: 50,
  lessonName: "שיעור אנגלית פרטי",
  workingDays: [0, 1, 2, 3, 4],
  workingHours: { start: 9, end: 20 },
  slotIntervalMinutes: 50,
  bookingHorizonDays: 30,
  bitPhone: "050-0000000",
  bitPayName: "English Play",
};

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function getSettings() {
  return { ...DEFAULT_SETTINGS, ...readJson(SETTINGS_PATH, DEFAULT_SETTINGS) };
}

function getBookings() {
  return readJson(BOOKINGS_PATH, []);
}

function saveBookings(bookings) {
  writeJson(BOOKINGS_PATH, bookings);
}

function generateId() {
  return crypto.randomBytes(8).toString("hex");
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function toLocalIso(date) {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${y}-${m}-${d}T${h}:${min}`;
}

function parseLocalIso(iso) {
  const [datePart, timePart] = iso.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, min] = timePart.split(":").map(Number);
  return new Date(y, m - 1, d, h, min, 0, 0);
}

function isSlotBooked(iso, bookings) {
  return bookings.some(
    (b) => b.slotStart === iso && b.status !== "cancelled"
  );
}

function generateSlotsForDate(dateStr, settings, bookings) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const day = new Date(y, m - 1, d);
  if (!settings.workingDays.includes(day.getDay())) return [];

  const { start, end } = settings.workingHours;
  const interval = settings.slotIntervalMinutes;
  const slots = [];
  const now = new Date();

  let cursor = new Date(y, m - 1, d, start, 0, 0, 0);
  const dayEnd = new Date(y, m - 1, d, end, 0, 0, 0);

  while (cursor < dayEnd) {
    const slotEnd = new Date(cursor.getTime() + interval * 60000);
    if (slotEnd > dayEnd) break;
    if (cursor > now) {
      const iso = toLocalIso(cursor);
      slots.push({
        start: iso,
        label: `${pad(cursor.getHours())}:${pad(cursor.getMinutes())}`,
        available: !isSlotBooked(iso, bookings),
      });
    }
    cursor = slotEnd;
  }
  return slots;
}

function getMonthAvailability(year, month, settings, bookings) {
  const days = [];
  const lastDay = new Date(year, month, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + settings.bookingHorizonDays);

  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month - 1, d);
    if (date < today || date > horizon) {
      days.push({ date: `${year}-${pad(month)}-${pad(d)}`, hasSlots: false, past: date < today });
      continue;
    }
    const dateStr = `${year}-${pad(month)}-${pad(d)}`;
    const slots = generateSlotsForDate(dateStr, settings, bookings);
    days.push({
      date: dateStr,
      hasSlots: slots.some((s) => s.available),
      past: false,
    });
  }
  return days;
}

function createBooking(payload) {
  const settings = getSettings();
  const bookings = getBookings();

  if (!payload.slotStart || !payload.studentName || !payload.studentPhone) {
    throw new Error("חסרים פרטים חובה — שם וטלפון");
  }

  if (isSlotBooked(payload.slotStart, bookings)) {
    throw new Error("התור כבר תפוס");
  }

  const slotDate = parseLocalIso(payload.slotStart);
  if (slotDate <= new Date()) {
    throw new Error("לא ניתן לקבוע תור בעבר");
  }

  const booking = {
    id: generateId(),
    slotStart: payload.slotStart,
    slotEnd: toLocalIso(
      new Date(slotDate.getTime() + settings.lessonDurationMinutes * 60000)
    ),
    studentName: payload.studentName.trim(),
    studentEmail: (payload.studentEmail || "").trim(),
    studentPhone: payload.studentPhone.trim(),
    notes: (payload.notes || "").trim(),
    price: settings.pricePerLesson,
    currency: settings.currency,
    status: "pending_payment",
    paymentId: null,
    paidAt: null,
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  saveBookings(bookings);
  return booking;
}

function markBookingPaid(bookingId, paymentId, method) {
  const bookings = getBookings();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) throw new Error("תור לא נמצא");
  if (booking.status === "paid") return booking;
  if (booking.status === "cancelled") throw new Error("התור בוטל");

  booking.status = "paid";
  booking.paymentId = paymentId;
  booking.paymentMethod = method || "bit";
  booking.paidAt = new Date().toISOString();
  saveBookings(bookings);
  return booking;
}

function updateBookingStatus(bookingId, status) {
  const bookings = getBookings();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) throw new Error("תור לא נמצא");
  booking.status = status;
  if (status === "cancelled") booking.cancelledAt = new Date().toISOString();
  saveBookings(bookings);
  return booking;
}

function getTeacherBookings() {
  return getBookings()
    .filter((b) => b.status !== "cancelled" || b.cancelledAt)
    .sort((a, b) => a.slotStart.localeCompare(b.slotStart));
}

function verifyTeacherPin(pin) {
  const settings = getSettings();
  return pin === settings.teacherPin;
}

function processDemoPayment(bookingId) {
  const paymentId = "demo_" + crypto.randomBytes(6).toString("hex");
  return markBookingPaid(bookingId, paymentId, "card");
}

function processBitPayment(bookingId) {
  const paymentId = "bit_" + crypto.randomBytes(6).toString("hex");
  return markBookingPaid(bookingId, paymentId, "bit");
}

module.exports = {
  getSettings,
  getBookings,
  getMonthAvailability,
  generateSlotsForDate,
  createBooking,
  markBookingPaid,
  updateBookingStatus,
  getTeacherBookings,
  verifyTeacherPin,
  processDemoPayment,
  processBitPayment,
  parseLocalIso,
};
