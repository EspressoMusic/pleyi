/* Pleyi — Firebase Auth (Google or email + password, as a teacher or a student) */

window.GameAuth = {
  _user: null,
  _listeners: [],
  _ready: false,
  _toastFn: null,
  _devPreviewActive: false,
  // The login dialog's "מורה" / "תלמיד" switch and its email form's mode.
  _role: "teacher",
  _mode: "signin",
  // A student signs in only for a moment, to fetch their link key — the
  // site doesn't treat them as a signed-in teacher meanwhile.
  _studentFlow: false,

  getUser() {
    return this._user;
  },

  isDevHost() {
    const host = location.hostname;
    return host === "localhost" || host === "127.0.0.1";
  },

  getDevPreviewUser() {
    return {
      uid: "dev-preview",
      name: "מורה לדוגמה",
      email: "dev@preview.local",
      photoURL: null,
    };
  },

  signInDevPreview({ redirect = false } = {}) {
    if (!this.isDevHost()) return false;

    this._devPreviewActive = true;
    sessionStorage.setItem("pleyi-dev-preview", "1");
    sessionStorage.setItem("pleyi-guest-preview", "1");
    this.setDevPreviewUser(this.getDevPreviewUser());
    document.getElementById("loginModal")?.classList.add("hidden");

    if (this._consumeLoginNext()) {
      if (this._toastFn) this._toastFn("התחברת בהצלחה");
      return true;
    }

    if (this._toastFn) this._toastFn("התחברת בהצלחה");
    return true;
  },

  isDevPreviewUser() {
    return this._devPreviewActive || this._user?.uid === "dev-preview";
  },

  _saveLoginNext(path) {
    if (path && String(path).startsWith("/") && !String(path).startsWith("//")) {
      sessionStorage.setItem("pleyi-login-next", path);
    }
  },

  _consumeLoginNext() {
    const next = sessionStorage.getItem("pleyi-login-next");
    if (!next || !next.startsWith("/") || next.startsWith("//")) return false;
    sessionStorage.removeItem("pleyi-login-next");
    if (window.location.pathname + window.location.search !== next) {
      window.location.href = next;
    }
    return true;
  },

  openLoginModal(nextPath) {
    if (nextPath) this._saveLoginNext(nextPath);
    document.getElementById("loginModal")?.classList.remove("hidden");
  },

  onUserChange(fn) {
    this._listeners.push(fn);
    if (this._ready) fn(this._user);
    return () => {
      this._listeners = this._listeners.filter((f) => f !== fn);
    };
  },

  _notify() {
    this._listeners.forEach((fn) => fn(this._user));
  },

  _mapUser(fbUser) {
    if (!fbUser) return null;
    return {
      uid: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split("@")[0] || "משתמש",
      email: fbUser.email,
      photoURL: fbUser.photoURL,
    };
  },

  async _syncProfile(fbUser) {
    if (!fbUser || !window.FirebaseApp?.db) return;
    await FirebaseApp.db.collection("users").doc(fbUser.uid).set(
      {
        name: fbUser.displayName || "",
        email: fbUser.email || "",
        photoURL: fbUser.photoURL || "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  },

  async init() {
    if (this.isDevHost() && sessionStorage.getItem("pleyi-dev-preview") === "1") {
      this._devPreviewActive = true;
      this.setDevPreviewUser(this.getDevPreviewUser());
    }

    const ok = await FirebaseApp.ready;
    if (!ok) {
      this._ready = true;
      this.updateNav();
      this._notify();
      return;
    }

    let redirectError = null;
    let redirectWelcome = null;

    try {
      const result = await FirebaseApp.auth.getRedirectResult();
      if (result?.user) {
        redirectWelcome = result.user.displayName || result.user.email?.split("@")[0] || "";
      }
    } catch (err) {
      redirectError = this._authError(err);
      console.error("Firebase redirect error:", err);
    }

    FirebaseApp.auth.onAuthStateChanged(async (fbUser) => {
      if (fbUser && this._studentFlow) return;
      if (fbUser) {
        this._user = this._mapUser(fbUser);
        this._devPreviewActive = false;
        sessionStorage.removeItem("pleyi-dev-preview");
      } else if (!this._isTeacherPreview() && !this._devPreviewActive) {
        this._user = null;
      }
      this._ready = true;
      this.updateNav();
      /* Background — a slow or failed Firestore write must not hide the signed-in UI */
      if (fbUser) {
        this._syncProfile(fbUser).catch((e) => console.warn("Profile sync failed:", e));
      }
      if (fbUser && window.UserData?.ensureCreditsInitialized) {
        window.UserData.ensureCreditsInitialized().catch(() => {});
      }

      if (redirectWelcome && fbUser) {
        document.getElementById("loginModal")?.classList.add("hidden");
        if (!this._consumeLoginNext()) {
          /* stay on current page */
        }
      }

      this._notify();

      if (redirectWelcome && fbUser && this._toastFn) {
        this._toastFn(`שלום, ${redirectWelcome}!`);
        redirectWelcome = null;
      }

      if (redirectError) {
        const errEl = document.getElementById("loginError");
        if (errEl) {
          errEl.textContent = redirectError;
          errEl.classList.remove("hidden");
        }
        document.getElementById("loginModal")?.classList.remove("hidden");
        redirectError = null;
      }
    });
  },

  isConfigured() {
    return FirebaseApp.configured;
  },

  setDevPreviewUser(user) {
    if (!user) return;
    this._user = user;
    this._ready = true;
    this.updateNav();
    this._notify();
  },

  _isTeacherPreview() {
    return (
      location.hostname === "localhost" &&
      new URLSearchParams(location.search).get("preview") === "teacher"
    );
  },

  _googlePopup() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return FirebaseApp.auth.signInWithPopup(provider);
  },

  async signInWithGoogle() {
    const ok = await FirebaseApp.ready;
    if (!ok) {
      return { ok: false, error: "Firebase לא מוגדר. הוסיפו data/firebase.json" };
    }
    try {
      const result = await this._googlePopup();
      return { ok: true, user: result.user };
    } catch (err) {
      return { ok: false, error: this._authError(err) };
    }
  },

  // `signup` opens the account (a teacher's `name` becomes its display name).
  async signInWithEmail({ email, password, name = "", signup = false, student = false }) {
    const ok = await FirebaseApp.ready;
    if (!ok) {
      return { ok: false, error: "Firebase לא מוגדר. הוסיפו data/firebase.json" };
    }
    const auth = FirebaseApp.auth;
    const signIn = () =>
      signup ? auth.createUserWithEmailAndPassword(email, password) : auth.signInWithEmailAndPassword(email, password);
    if (student) return this._studentSignIn(signIn);
    try {
      const { user } = await signIn();
      if (signup && name) {
        await user.updateProfile({ displayName: name });
        this._user = this._mapUser(user);
        this.updateNav();
        this._notify();
        this._syncProfile(user).catch((e) => console.warn("Profile sync failed:", e));
      }
      return { ok: true, user };
    } catch (err) {
      return { ok: false, error: this._authError(err) };
    }
  },

  // Firebase answers the same for a wrong password and an unknown email.
  async resetPassword(email) {
    const ok = await FirebaseApp.ready;
    if (!ok) {
      return { ok: false, error: "Firebase לא מוגדר. הוסיפו data/firebase.json" };
    }
    try {
      await FirebaseApp.auth.sendPasswordResetEmail(email);
      return { ok: true, notice: `אם המייל ⁨${email}⁩ רשום, שלחנו אליו קישור לבחירת סיסמה חדשה.` };
    } catch (err) {
      return { ok: false, error: this._authError(err) };
    }
  },

  // The student signs in only to prove the email is theirs: the server swaps
  // it for their file's link key (the teacher wrote the email on the file),
  // the account is signed out, and the page goes to /s/<key> — the same as
  // opening the link. An email + password account has to verify the email
  // first; Google's already is.
  async _studentSignIn(signIn) {
    const ok = await FirebaseApp.ready;
    if (!ok) {
      return { ok: false, error: "Firebase לא מוגדר. הוסיפו data/firebase.json" };
    }
    this._studentFlow = true;
    try {
      const { user } = await signIn();
      if (!user.emailVerified) {
        await user.sendEmailVerification();
        return {
          ok: false,
          notice: `שלחנו מייל אימות ל-⁨${user.email}⁩.\nלחצו על הקישור שבמייל, ואז חזרו לכאן ולחצו "כניסה".`,
        };
      }
      const resp = await fetch("/api/student-login", {
        method: "POST",
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) return { ok: false, error: data.error || "שגיאה בהתחברות. נסו שוב" };
      return { ok: true, students: data.students };
    } catch (err) {
      return { ok: false, error: this._authError(err) };
    } finally {
      await FirebaseApp.auth.signOut().catch(() => {});
      this._studentFlow = false;
    }
  },

  _authError(err) {
    const code = err?.code || "";
    const wrong = "המייל או הסיסמה לא נכונים";
    const map = {
      "auth/popup-closed-by-user": "החלון נסגר לפני סיום ההתחברות",
      "auth/cancelled-popup-request": "נסו שוב בעוד רגע",
      "auth/popup-blocked": "הדפדפן חסם את החלון — נסו שוב",
      "auth/network-request-failed": "בעיית רשת — בדקו חיבור לאינטרנט",
      "auth/unauthorized-domain": `ההתחברות עוד לא הופעלה בכתובת ${location.hostname} — יש להוסיף אותה לדומיינים המורשים ב-Firebase`,
      "auth/operation-not-allowed": "שיטת ההתחברות הזו עוד לא הופעלה ב-Firebase Console",
      "auth/invalid-credential": wrong,
      "auth/invalid-login-credentials": wrong,
      "auth/wrong-password": wrong,
      "auth/user-not-found": "המייל הזה עוד לא רשום — לחצו \"פעם ראשונה? הרשמה\"",
      "auth/email-already-in-use": "המייל הזה כבר רשום — לחצו \"כבר נרשמתם? כניסה\"",
      "auth/weak-password": "הסיסמה קצרה מדי — לפחות 6 תווים",
      "auth/invalid-email": "כתובת המייל לא תקינה",
      "auth/missing-password": "כתבו סיסמה",
      "auth/missing-email": "כתבו מייל",
      "auth/too-many-requests": "יותר מדי ניסיונות — נסו שוב בעוד כמה דקות",
      "auth/user-disabled": "החשבון הזה חסום",
    };
    return map[code] || err?.message || "שגיאה בהתחברות. נסו שוב";
  },

  async logout() {
    if (this._devPreviewActive) {
      this._devPreviewActive = false;
      sessionStorage.removeItem("pleyi-dev-preview");
      sessionStorage.removeItem("pleyi-guest-preview");
      this._user = null;
      this.updateNav();
      this._notify();
      return;
    }
    if (FirebaseApp.auth) await FirebaseApp.auth.signOut();
    this._user = null;
    this.updateNav();
    this._notify();
  },

  updateNav() {
    const user = this.getUser();
    const loginBtn = document.getElementById("authLoginBtn");
    const userMenu = document.getElementById("authUserMenu");
    const userName = document.getElementById("authUserName");
    const userPhoto = document.getElementById("authUserPhoto");
    const userInitial = document.getElementById("authUserInitial");
    const dropdown = document.getElementById("authUserDropdown");
    const avatarBtn = document.getElementById("authUserAvatar");
    const mobileUser = this._ensureMobileUserLinks();

    if (user) {
      loginBtn?.classList.add("hidden");
      userMenu?.classList.remove("hidden");
      document.getElementById("mobileLoginBtn")?.classList.add("hidden");
      mobileUser?.classList.remove("hidden");
      if (userName) userName.textContent = user.name;

      if (user.photoURL && userPhoto) {
        userPhoto.src = user.photoURL;
        userPhoto.alt = user.name;
        userPhoto.classList.remove("hidden");
        userInitial?.classList.add("hidden");
      } else if (userPhoto && userInitial) {
        userPhoto.removeAttribute("src");
        userPhoto.classList.add("hidden");
        userInitial.textContent = (user.name || "?").charAt(0).toUpperCase();
        userInitial.classList.remove("hidden");
      }
    } else {
      loginBtn?.classList.remove("hidden");
      userMenu?.classList.add("hidden");
      document.getElementById("mobileLoginBtn")?.classList.remove("hidden");
      mobileUser?.classList.add("hidden");
      dropdown?.classList.add("hidden");
      avatarBtn?.setAttribute("aria-expanded", "false");
      if (userPhoto) {
        userPhoto.removeAttribute("src");
        userPhoto.classList.remove("hidden");
      }
      userInitial?.classList.add("hidden");
    }
  },

  /* Phone menu: the avatar dropdown's links, shown in place of the login button */
  _ensureMobileUserLinks() {
    const existing = document.getElementById("mobileUserLinks");
    if (existing) return existing;
    const loginBtn = document.getElementById("mobileLoginBtn");
    if (!loginBtn) return null;

    const t = (key, fallback) => window.I18n?.t?.(key) || fallback;
    const wrap = document.createElement("div");
    wrap.id = "mobileUserLinks";
    wrap.className = "hidden";
    wrap.style.display = "contents";
    wrap.innerHTML = `
      <a href="/my-room" data-i18n="nav.myRoom"></a>
      <button type="button" class="mobile-nav-auth" id="mobileLogoutBtn" data-i18n="nav.logout"></button>`;
    wrap.querySelector('[data-i18n="nav.myRoom"]').textContent = t("nav.myRoom", "החדר שלי");
    wrap.querySelector("#mobileLogoutBtn").textContent = t("nav.logout", "יציאה");
    wrap.querySelector("#mobileLogoutBtn").addEventListener("click", async () => {
      document.getElementById("mobileNav")?.classList.remove("open");
      await this.logout();
      if (this._toastFn) this._toastFn("התנתקת בהצלחה");
    });
    loginBtn.after(wrap);
    return wrap;
  },

  _closeUserDropdown() {
    document.getElementById("authUserDropdown")?.classList.add("hidden");
    document.getElementById("authUserAvatar")?.setAttribute("aria-expanded", "false");
  },

  _toggleUserDropdown() {
    const dropdown = document.getElementById("authUserDropdown");
    const avatarBtn = document.getElementById("authUserAvatar");
    if (!dropdown || !avatarBtn) return;
    const open = dropdown.classList.toggle("hidden") === false;
    avatarBtn.setAttribute("aria-expanded", open ? "true" : "false");
  },

  handleLoginClick({ redirect = true } = {}) {
    if (this.isDevHost()) {
      return this.signInDevPreview({ redirect });
    }
    document.getElementById("loginModal")?.classList.remove("hidden");
    return false;
  },

  bindModals(showToast) {
    // Some pages load two scripts that both call this (service-landing +
    // ready-lessons). Binding twice toggles the avatar menu open and shut
    // in one click and starts Google sign-in twice.
    if (this._modalsBound) return;
    this._modalsBound = true;
    const toast = showToast || ((m) => alert(m));
    this._toastFn = toast;
    const open = (id) => document.getElementById(id)?.classList.remove("hidden");
    const close = (id) => document.getElementById(id)?.classList.add("hidden");

    document.getElementById("authLoginBtn")?.addEventListener("click", () => {
      this.handleLoginClick({ redirect: true });
    });
    document.getElementById("mobileLoginBtn")?.addEventListener("click", () => {
      this.handleLoginClick({ redirect: true });
    });

    document.getElementById("authLogoutBtn")?.addEventListener("click", async () => {
      this._closeUserDropdown();
      await this.logout();
      toast("התנתקת בהצלחה");
    });

    document.getElementById("authUserAvatar")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggleUserDropdown();
    });

    document.addEventListener("click", () => this._closeUserDropdown());
    document.getElementById("authUserMenu")?.addEventListener("click", (e) => e.stopPropagation());

    document.getElementById("loginModal")?.addEventListener("click", (e) => {
      if (e.target.id === "loginModal") close("loginModal");
    });
    document.getElementById("loginClose")?.addEventListener("click", () => close("loginModal"));

    this._buildEmailLogin();

    document.getElementById("googleSignInBtn")?.addEventListener("click", async () => {
      const student = this._role === "student";
      if (this.isDevHost() && !student) {
        this.signInDevPreview({ redirect: true });
        return;
      }

      const btn = document.getElementById("googleSignInBtn");
      const label = btn?.innerHTML;
      if (btn) {
        btn.disabled = true;
        btn.textContent = "מתחבר…";
      }
      this._loginMessage();

      const res = student ? await this._studentSignIn(() => this._googlePopup()) : await this.signInWithGoogle();
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = label;
      }
      if (student) {
        this._studentResult(res);
        return;
      }
      if (!res.ok) {
        this._loginMessage({ error: res.error });
        return;
      }

      close("loginModal");
      if (!this._consumeLoginNext()) {
        /* stay on current page */
      }
    });

    this._bindEmailLogin(() => close("loginModal"));

    this.init();
  },

  /* ── The login dialog's role switch and email form ──
     Every page carries the same dialog markup (Google only), so they're
     added here, around its Google button. */

  _buildEmailLogin() {
    const modal = document.querySelector("#loginModal .modal");
    const google = document.getElementById("googleSignInBtn");
    if (!modal || !google || document.getElementById("loginEmailForm")) return;

    if (!document.getElementById("loginEmailStyles")) {
      const style = document.createElement("style");
      style.id = "loginEmailStyles";
      style.textContent = LOGIN_EMAIL_CSS;
      document.head.appendChild(style);
    }
    modal.classList.add("login-email");

    google.insertAdjacentHTML(
      "beforebegin",
      `<div class="login-roles" role="tablist" aria-label="מי נכנס">
        <button type="button" role="tab" data-login-role="teacher" aria-selected="true">מורה</button>
        <button type="button" role="tab" data-login-role="student" aria-selected="false">תלמיד</button>
      </div>
      <p class="login-role-hint hidden" id="loginStudentHint">נכנסים עם המייל שהמורה רשם בתיק שלכם</p>`
    );
    google.insertAdjacentHTML(
      "afterend",
      `<p class="login-or"><span>או עם מייל</span></p>
      <form class="login-email-form" id="loginEmailForm" novalidate>
        <input type="text" id="loginName" class="hidden" maxlength="80" placeholder="שם" autocomplete="name" aria-label="שם" />
        <input type="email" id="loginEmail" maxlength="254" placeholder="מייל" autocomplete="email" dir="ltr" aria-label="מייל" required />
        <input type="password" id="loginPassword" placeholder="סיסמה" autocomplete="current-password" dir="ltr" aria-label="סיסמה" required />
        <button type="submit" class="btn btn-primary btn-full" id="loginEmailSubmit">כניסה</button>
        <div class="login-email-links">
          <button type="button" class="login-link" id="loginModeToggle">פעם ראשונה? הרשמה</button>
          <button type="button" class="login-link" id="loginForgot">שכחתי סיסמה</button>
        </div>
      </form>
      <p class="login-note hidden" id="loginNote" role="status"></p>
      <div class="login-pick hidden" id="loginPick"></div>`
    );
  },

  // No argument clears both lines.
  _loginMessage({ error = "", notice = "" } = {}) {
    const err = document.getElementById("loginError");
    const note = document.getElementById("loginNote");
    if (err) {
      err.textContent = error;
      err.classList.toggle("hidden", !error);
    }
    if (note) {
      note.textContent = notice;
      note.classList.toggle("hidden", !notice);
    }
    document.getElementById("loginPick")?.classList.add("hidden");
  },

  // One file goes straight to it; a student of two teachers picks one.
  _studentResult(res) {
    if (!res.ok) {
      this._loginMessage({ error: res.error, notice: res.notice });
      if (res.notice) this._setLoginMode("signin");
      return;
    }
    sessionStorage.removeItem("pleyi-login-next");
    const go = (key) => window.location.assign(`/s/${encodeURIComponent(key)}`);
    if (res.students.length === 1) {
      go(res.students[0].key);
      return;
    }
    const pick = document.getElementById("loginPick");
    if (!pick) return;
    const title = document.createElement("p");
    title.className = "login-pick-title";
    title.textContent = "לאיזה תיק להיכנס?";
    const buttons = res.students.map((s) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-primary btn-full";
      btn.textContent = s.name;
      btn.addEventListener("click", () => go(s.key));
      return btn;
    });
    pick.replaceChildren(title, ...buttons);
    pick.classList.remove("hidden");
  },

  _setLoginRole(role) {
    this._role = role === "student" ? "student" : "teacher";
    try {
      localStorage.setItem("pleyi-login-role", this._role);
    } catch {
      /* ignore */
    }
    document.querySelectorAll("[data-login-role]").forEach((btn) => {
      btn.setAttribute("aria-selected", String(btn.dataset.loginRole === this._role));
    });
    document.getElementById("loginStudentHint")?.classList.toggle("hidden", this._role !== "student");
    this._loginMessage();
    this._setLoginMode(this._mode);
  },

  _setLoginMode(mode) {
    this._mode = mode === "signup" ? "signup" : "signin";
    const signup = this._mode === "signup";
    const name = document.getElementById("loginName");
    // A teacher's name shows in the menu; a student's comes from the file.
    name?.classList.toggle("hidden", !signup || this._role === "student");
    document.getElementById("loginPassword")?.setAttribute("autocomplete", signup ? "new-password" : "current-password");
    const submit = document.getElementById("loginEmailSubmit");
    if (submit) submit.textContent = signup ? "הרשמה" : "כניסה";
    const toggle = document.getElementById("loginModeToggle");
    if (toggle) toggle.textContent = signup ? "כבר נרשמתם? כניסה" : "פעם ראשונה? הרשמה";
    document.getElementById("loginForgot")?.classList.toggle("hidden", signup);
  },

  _bindEmailLogin(closeModal) {
    const form = document.getElementById("loginEmailForm");
    if (!form) return;
    const field = (id) => document.getElementById(id);
    let saved = "";
    try {
      saved = localStorage.getItem("pleyi-login-role") || "";
    } catch {
      /* ignore */
    }
    this._setLoginRole(saved);
    // The verification and reset emails in Hebrew.
    FirebaseApp.ready.then((ok) => {
      if (ok) FirebaseApp.auth.languageCode = "he";
    });

    document.querySelectorAll("[data-login-role]").forEach((btn) => {
      btn.addEventListener("click", () => this._setLoginRole(btn.dataset.loginRole));
    });
    field("loginModeToggle").addEventListener("click", () => {
      this._loginMessage();
      this._setLoginMode(this._mode === "signup" ? "signin" : "signup");
    });

    field("loginForgot").addEventListener("click", async (e) => {
      const email = field("loginEmail").value.trim();
      if (!email) {
        this._loginMessage({ error: "כתבו קודם את המייל, ואז לחצו \"שכחתי סיסמה\"" });
        field("loginEmail").focus();
        return;
      }
      const btn = e.currentTarget;
      btn.disabled = true;
      this._loginMessage();
      const res = await this.resetPassword(email);
      btn.disabled = false;
      this._loginMessage(res.ok ? { notice: res.notice } : { error: res.error });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = field("loginEmail").value.trim();
      const password = field("loginPassword").value;
      if (!email || !password) {
        this._loginMessage({ error: "כתבו מייל וסיסמה" });
        return;
      }
      const submit = field("loginEmailSubmit");
      const label = submit.textContent;
      submit.disabled = true;
      submit.textContent = "מתחבר…";
      this._loginMessage();

      const student = this._role === "student";
      const res = await this.signInWithEmail({
        email,
        password,
        name: field("loginName").value.trim(),
        signup: this._mode === "signup",
        student,
      });
      submit.disabled = false;
      submit.textContent = label;
      if (student) {
        this._studentResult(res);
        return;
      }
      if (!res.ok) {
        this._loginMessage({ error: res.error });
        return;
      }
      form.reset();
      closeModal();
      if (this._toastFn) this._toastFn(`שלום, ${this._mapUser(res.user).name}!`);
      this._consumeLoginNext();
    });
  },
};

const LOGIN_EMAIL_CSS = `
#loginModal .modal.login-email {
  aspect-ratio: auto;
  width: min(340px, 92vw);
  max-width: min(340px, 92vw);
  max-height: calc(100dvh - 24px);
  overflow-y: auto;
  gap: 12px;
  padding: 40px 22px 22px;
}
#loginModal .login-email .btn-google {
  width: 100%;
  max-width: none;
}
#loginModal .login-roles {
  display: flex;
  gap: 4px;
  width: 100%;
  padding: 4px;
  border: 3px solid var(--ink);
  border-radius: 14px;
  background: color-mix(in srgb, var(--memteal) 55%, #fff);
  box-shadow: var(--shadow-candy);
}
#loginModal .login-roles button {
  flex: 1;
  padding: 8px 0;
  border: 2px solid transparent;
  border-radius: 10px;
  background: none;
  color: var(--ink);
  font: inherit;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
}
#loginModal .login-roles button[aria-selected="true"] {
  border-color: var(--ink);
  background: #eaf5ff;
  font-weight: 900;
}
#loginModal .login-role-hint {
  width: 100%;
  margin: 0;
  color: var(--ink);
  font-size: 15px;
  font-weight: 700;
}
#loginModal .login-or {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin: 0;
  color: var(--ink);
  font-size: 14px;
  font-weight: 800;
}
#loginModal .login-or::before,
#loginModal .login-or::after {
  content: "";
  flex: 1;
  border-top: 2px solid color-mix(in srgb, var(--ink) 35%, transparent);
}
#loginModal .login-email-form,
#loginModal .login-pick {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
#loginModal .login-email-form input {
  padding: 11px 14px;
  background: #eaf5ff;
  font-size: 16px;
}
#loginModal .login-email-form input:placeholder-shown {
  direction: rtl;
}
#loginModal .login-email-links {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
#loginModal .login-link {
  padding: 0;
  border: none;
  background: none;
  color: var(--ink);
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  text-decoration: underline;
  cursor: pointer;
}
/* Red text on the teal dialog is hard to read: the error gets a box too. */
#loginModal .login-email .form-error,
#loginModal .login-note {
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  border: 2px solid var(--ink);
  border-radius: 12px;
  background: #eaf5ff;
  box-shadow: 3px 3px 0 var(--ink);
  color: var(--ink);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.5;
  white-space: pre-line;
}
#loginModal .login-email .form-error {
  background: #ffd9d9;
}
#loginModal .login-pick-title {
  margin: 0;
  color: var(--ink);
  font-weight: 900;
}
#loginModal .login-legal-note {
  margin-top: 2px;
}
`;

/* Pages without login modal (e.g. /play) still need redirect handling */
if (!document.getElementById("googleSignInBtn")) {
  GameAuth.init();
}
