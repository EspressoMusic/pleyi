/* GameClass — Firebase Auth (Google sign-in) */

window.GameAuth = {
  _user: null,
  _listeners: [],
  _ready: false,
  _toastFn: null,

  getUser() {
    return this._user;
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
      this._user = this._mapUser(fbUser);
      if (fbUser) await this._syncProfile(fbUser);
      this._ready = true;
      this.updateNav();
      this._notify();

      if (redirectWelcome && fbUser && this._toastFn) {
        this._toastFn(`שלום, ${redirectWelcome}!`);
        redirectWelcome = null;
        document.getElementById("loginModal")?.classList.add("hidden");
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

  bindModals(showToast) {
    const toast = showToast || ((m) => alert(m));
    this._toastFn = toast;
    const open = (id) => document.getElementById(id)?.classList.remove("hidden");
    const close = (id) => document.getElementById(id)?.classList.add("hidden");

    document.getElementById("authLoginBtn")?.addEventListener("click", () => open("loginModal"));
    document.getElementById("mobileLoginBtn")?.addEventListener("click", () => open("loginModal"));

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
