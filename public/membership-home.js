(() => {
  const accountLink = document.querySelector("[data-account-link]");

  fetch("/api/me", { credentials: "same-origin" })
    .then((response) => response.json())
    .then((session) => {
      if (session.authenticated && accountLink) {
        accountLink.href = "/dashboard";
        accountLink.setAttribute("aria-label", "Open your customer dashboard");
        accountLink.classList.add("is-member");
      }
    })
    .catch(() => {});

  document.addEventListener("surprisewala:order-submitted", (event) => {
    fetch("/api/orders", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event.detail),
    }).catch(() => {});
  });

  if (sessionStorage.getItem("surprisewalaLoginPromptShown")) return;
  sessionStorage.setItem("surprisewalaLoginPromptShown", "true");

  window.setTimeout(() => {
    const backdrop = document.createElement("div");
    backdrop.className = "member-prompt-backdrop";
    backdrop.innerHTML = `
      <section class="member-prompt" role="dialog" aria-modal="true" aria-labelledby="memberPromptTitle" aria-describedby="memberPromptCopy">
        <button class="member-prompt__close" type="button" aria-label="Close membership invitation" data-member-prompt-close></button>
        <p class="member-prompt__eyebrow">Surprisewala membership</p>
        <h2 id="memberPromptTitle">Get Special Updates</h2>
        <p id="memberPromptCopy">Login or create an account to receive exclusive surprise offers, order history, saved addresses, special member benefits and faster checkout.</p>
        <div class="member-prompt__actions">
          <a class="member-prompt__button member-prompt__button--primary" href="/login">Login</a>
          <a class="member-prompt__button" href="/signup">Create Account</a>
          <button class="member-prompt__guest" type="button" data-member-prompt-close>Continue as Guest</button>
        </div>
      </section>`;

    const close = () => {
      backdrop.classList.remove("is-visible");
      window.setTimeout(() => backdrop.remove(), 220);
    };
    backdrop.querySelectorAll("[data-member-prompt-close]").forEach((button) => button.addEventListener("click", close));
    backdrop.addEventListener("mousedown", (event) => { if (event.target === backdrop) close(); });
    document.addEventListener("keydown", function escapePrompt(event) {
      if (event.key === "Escape") { close(); document.removeEventListener("keydown", escapePrompt); }
    });
    document.body.appendChild(backdrop);
    requestAnimationFrame(() => { backdrop.classList.add("is-visible"); backdrop.querySelector("a").focus(); });
  }, 1500);
})();
