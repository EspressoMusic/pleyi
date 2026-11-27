/* A class's join page (/c/<code>) — the link the teacher sends the class
   (lib/classes.js). The student writes their name and gets a file of that
   teacher, in the class; a device already linked to a file of the same
   teacher joins with it. Either way the device keeps the file's key and
   goes to the student's page, to the class's updates (/s/<key>#class). */

(function () {
  const app = document.getElementById("joinApp");
  const code = decodeURIComponent(location.pathname.split("/")[2] || "").toUpperCase();
  const deviceKey = () => window.StudentProgress?.key() || "";

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function lines(text) {
    return String(text || "")
      .split("\n")
      .map((l) => `<p class="stu-join-line">${esc(l)}</p>`)
      .join("");
  }

  function goToClass(key) {
    location.replace(`/s/${encodeURIComponent(key)}#class`);
  }

  async function api(path, { method = "GET", body } = {}) {
    const key = deviceKey();
    const res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json", ...(key ? { "x-student-key": key } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw Object.assign(new Error(data.error || "משהו השתבש — נסו שוב"), { status: res.status });
    return data;
  }

  function headHtml(cls) {
    return `
      <p class="stu-join-name"><span class="stu-key">${esc(cls.name)}</span></p>
      ${cls.teacherName ? `<p class="stu-join-line">הכיתה של ${esc(cls.teacherName)}</p>` : ""}`;
  }

  function nameFormHtml() {
    return `
      <form class="stu-join-form" id="joinForm" novalidate>
        <label class="stu-join-label" for="joinName">השם שלי</label>
        <input type="text" class="stu-join-input" id="joinName" maxlength="80" autocomplete="name" required />
        <p class="stu-join-tip">שם פרטי ואות ראשונה משם המשפחה</p>
        <button type="submit" class="btn btn-primary btn-candy stu-btn stu-join-go">הצטרפות</button>
        <div class="stu-join-error" role="alert" hidden></div>
      </form>`;
  }

  // `me`: this device's file, when it's the class teacher's.
  function render(cls, me, askName = false) {
    let body;
    if (!cls.open && !me?.member) {
      body = `
        <p class="stu-join-line">ההצטרפות לכיתה סגורה כרגע.</p>
        <p class="stu-join-line">אפשר לבקש מהמורה לפתוח אותה.</p>`;
    } else if (me && !askName) {
      body = `
        <button type="button" class="btn btn-primary btn-candy stu-btn stu-join-go" id="joinMe">הצטרפות בתור ${esc(me.name)}</button>
        <button type="button" class="stu-join-other" id="joinOther">זה לא אני</button>
        <div class="stu-join-error" role="alert" hidden></div>`;
    } else {
      body = nameFormHtml();
    }
    app.innerHTML = `<section class="stu-join">${headHtml(cls)}${body}</section>`;
    bind(cls, me);
  }

  function showError(err) {
    const box = app.querySelector(".stu-join-error");
    if (!box) return;
    box.innerHTML = lines(err.message);
    box.hidden = false;
  }

  function bind(cls, me) {
    app.querySelector("#joinOther")?.addEventListener("click", () => {
      render(cls, me, true);
      app.querySelector("#joinName")?.focus();
    });

    app.querySelector("#joinMe")?.addEventListener("click", async (e) => {
      e.currentTarget.disabled = true;
      try {
        const data = await api(`/api/class/${encodeURIComponent(code)}/join`, { method: "POST", body: {} });
        goToClass(data.key);
      } catch (err) {
        e.currentTarget.disabled = false;
        showError(err);
      }
    });

    const form = app.querySelector("#joinForm");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.querySelector("#joinName").value.trim();
      if (name.length < 2) {
        showError(new Error("כתבו את השם שלכם"));
        return;
      }
      const go = form.querySelector(".stu-join-go");
      go.disabled = true;
      try {
        // A new name is a new file: the device's own file isn't sent along.
        const res = await fetch(`/api/class/${encodeURIComponent(code)}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || "משהו השתבש — נסו שוב");
        window.StudentProgress?.setKey(data.key);
        goToClass(data.key);
      } catch (err) {
        go.disabled = false;
        showError(err);
      }
    });
  }

  function renderMessage(...text) {
    app.innerHTML = `<section class="stu-join">${text.map((t) => `<p class="stu-join-line">${esc(t)}</p>`).join("")}</section>`;
  }

  async function init() {
    if (!/^[A-Z2-9]{6}$/.test(code)) {
      renderMessage("הקישור לכיתה לא תקין.", "בקשו מהמורה קישור חדש.");
      return;
    }
    try {
      const { class: cls, me } = await api(`/api/class/${encodeURIComponent(code)}`);
      document.title = `${cls.name} — Pleyi`;
      // Already in the class: straight to its updates.
      if (me?.member) {
        goToClass(deviceKey());
        return;
      }
      render(cls, me);
    } catch (err) {
      if (err.status === 404) renderMessage("הקישור לכיתה לא תקין.", "בקשו מהמורה קישור חדש.");
      else renderMessage("לא הצלחנו לטעון את הכיתה.", "בדקו את החיבור לאינטרנט ונסו לרענן.");
    }
  }

  init();
})();
