/* Newsletter sign-up under "מה חדש" on the home page.

   - The form shows only when the server says the Brevo list is set up
     (/api/newsletter/status), so a half-ready sign-up is never on screen.
   - On success the form row is replaced by a thank-you line. */

(function () {
  const form = document.getElementById("newsletterForm");
  if (!form) return;
  const input = form.querySelector(".newsletter-input");
  const button = form.querySelector(".newsletter-btn");
  const msg = form.querySelector(".newsletter-msg");
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  fetch("/api/newsletter/status")
    .then((r) => r.json())
    .then((data) => {
      if (data.enabled) form.hidden = false;
    })
    .catch(() => {});

  function say(text, kind) {
    msg.textContent = text;
    msg.dataset.kind = kind || "";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!EMAIL_RE.test(email)) {
      say("כתובת המייל לא נראית תקינה", "error");
      input.focus();
      return;
    }
    button.disabled = true;
    say("שולחים...");
    try {
      const resp = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: form.elements.website.value }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) throw new Error(data.error || "משהו השתבש. נסו שוב מאוחר יותר");
      form.classList.add("is-done");
      say("תודה! נשלח לכם מייל כשיש משהו חדש", "ok");
    } catch (err) {
      say(err.message || "משהו השתבש. נסו שוב מאוחר יותר", "error");
      button.disabled = false;
    }
  });
})();
