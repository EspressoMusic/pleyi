/* Pleyi — Firebase Auth (Google sign-in) */

window.GameAuth = {
  _user: null,
  _listeners: [],
  _ready: false,
  _toastFn: null,
  _devPreviewActive: false,

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

    if (redirect && !/^\/games\/?$/.test(window.location.pathname)) {
      window.location.href = "/games";
      return true;
    }

    if (this._toastFn) this._toastFn("נכנסת לחדר בפיתוח");
    return true;
  },

  isDevPreviewUser() {
    return this._devPreviewActive || this._user?.uid === "dev-preview";
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
      if (fbUser) {
        this._user = this._mapUser(fbUser);
        this._devPreviewActive = false;
        sessionStorage.removeItem("pleyi-dev-preview");
      } else if (!this._isTeacherPreview() && !this._devPreviewActive) {
        this._user = null;
      }
      if (fbUser) await this._syncProfile(fbUser);
      if (fbUser && window.UserData?.ensureCreditsInitialized) {
        window.UserData.ensureCreditsInitialized().catch(() => {});
      }
      this._ready = true;
      this.updateNav();

      if (redirectWelcome && fbUser) {
        document.getElementById("loginModal")?.classList.add("hidden");
        if (!/^\/games\/?$/.test(window.location.pathname)) {
          window.location.href = "/games";
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

  async signInWithGoogle() {
    const ok = await FirebaseApp.ready;
    if (!ok) {
      return { ok: false, error: "Firebase לא מוגדר. הוסיפו data/firebase.json" };
    }
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await FirebaseApp.auth.signInWithRedirect(provider);
      return { ok: true, redirecting: true };
    } catch (err) {
      return { ok: false, error: this._authError(err) };
    }
  },

  _authError(err) {
    const code = err?.code || "";
    const map = {
      "auth/popup-closed-by-user": "החלון נסגר לפני סיום ההתחברות",
      "auth/cancelled-popup-request": "נסו שוב בעוד רגע",
      "auth/popup-blocked": "הדפדפן חסם את החלון — נסו שוב",
      "auth/network-request-failed": "בעיית רשת — בדקו חיבור לאינטרנט",
      "auth/unauthorized-domain": "הדומיין לא מורשה ב-Firebase — הוסיפו localhost",
      "auth/operation-not-allowed": "Google Auth לא מופעל ב-Firebase Console",
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

    if (user) {
      loginBtn?.classList.add("hidden");
      userMenu?.classList.remove("hidden");
      document.getElementById("mobileLoginBtn")?.classList.add("hidden");
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
      dropdown?.classList.add("hidden");
      avatarBtn?.setAttribute("aria-expanded", "false");
      if (userPhoto) {
        userPhoto.removeAttribute("src");
        userPhoto.classList.remove("hidden");
      }
      userInitial?.classList.add("hidden");
    }
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

    document.getElementById("googleSignInBtn")?.addEventListener("click", async () => {
      if (this.isDevHost()) {
        this.signInDevPreview({ redirect: true });
        return;
      }

      const err = document.getElementById("loginError");
      const btn = document.getElementById("googleSignInBtn");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "מעביר ל-Google…";
      }
      err?.classList.add("hidden");

      const res = await this.signInWithGoogle();
      if (!res.ok) {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "התחברות עם Google";
        }
        if (err) {
          err.textContent = res.error;
          err.classList.remove("hidden");
        }
      }
    });

    this.init();
  },
};

/* Pages without login modal (e.g. /play) still need redirect handling */
if (!document.getElementById("googleSignInBtn")) {
  GameAuth.init();
}
