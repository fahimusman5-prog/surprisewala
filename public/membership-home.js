(() => {
  const accountLink = document.querySelector("[data-account-link]");
  const menuNavigation = document.querySelector(".premium-menu__nav");
  let knownAuthenticationState = null;

  function createMenuLink(label, href) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    link.setAttribute("data-menu-link", "");
    return link;
  }

  async function logout(button) {
    if (button.disabled) return;
    button.disabled = true;
    button.textContent = "Logging out…";

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Logout failed");
      localStorage.setItem("surprisewala:auth-event", String(Date.now()));
      window.location.assign("/");
    } catch {
      button.disabled = false;
      button.textContent = "Logout";
      window.alert("We could not log you out. Please check your connection and try again.");
    }
  }

  function renderNavigation(session) {
    document.querySelector("[data-member-auth-nav]")?.remove();

    if (accountLink) {
      accountLink.href = session.authenticated ? "/dashboard" : "/login";
      accountLink.setAttribute(
        "aria-label",
        session.authenticated
          ? `Open ${session.name || "your"} account dashboard`
          : "Log in to your account",
      );
      accountLink.classList.toggle("is-member", Boolean(session.authenticated));
    }

    if (!menuNavigation) return;

    const group = document.createElement("div");
    group.className = "member-menu-auth";
    group.setAttribute("data-member-auth-nav", "");

    if (session.authenticated) {
      const label = document.createElement("p");
      label.className = "member-menu-auth__label";
      label.textContent = session.name || "My Account";
      group.append(
        label,
        createMenuLink("Dashboard", "/dashboard"),
        createMenuLink("Orders", "/dashboard"),
      );

      if (session.role === "admin") {
        group.append(createMenuLink("Admin Dashboard", "/admin"));
      }

      const logoutButton = document.createElement("button");
      logoutButton.type = "button";
      logoutButton.className = "member-menu-auth__logout";
      logoutButton.textContent = "Logout";
      logoutButton.addEventListener("click", () => logout(logoutButton));
      group.append(logoutButton);
    } else {
      group.append(
        createMenuLink("Login", "/login"),
        createMenuLink("Create Account", "/signup"),
      );
    }

    menuNavigation.append(group);
  }

  function showMembershipPrompt() {
    if (sessionStorage.getItem("surprisewalaLoginPromptShown")) return;
    sessionStorage.setItem("surprisewalaLoginPromptShown", "true");

    window.setTimeout(() => {
      if (knownAuthenticationState !== false) return;

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
        if (event.key === "Escape") {
          close();
          document.removeEventListener("keydown", escapePrompt);
        }
      });
      document.body.appendChild(backdrop);
      requestAnimationFrame(() => {
        backdrop.classList.add("is-visible");
        backdrop.querySelector("a")?.focus();
      });
    }, 1500);
  }

  async function refreshAuthentication({ initial = false } = {}) {
    try {
      const response = await fetch("/api/me", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Session lookup failed");
      const session = await response.json();
      const authenticated = Boolean(session.authenticated);

      if (
        knownAuthenticationState !== null &&
        knownAuthenticationState !== authenticated
      ) {
        window.location.reload();
        return;
      }

      knownAuthenticationState = authenticated;
      renderNavigation(session);
      if (initial && !authenticated) showMembershipPrompt();
    } catch {
      // Do not show login prompts when the real session state cannot be verified.
    }
  }

  document.addEventListener("surprisewala:order-submitted", (event) => {
    fetch("/api/orders", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event.detail),
    }).catch(() => {});
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshAuthentication();
  });
  window.addEventListener("storage", (event) => {
    if (event.key === "surprisewala:auth-event") window.location.reload();
  });

  refreshAuthentication({ initial: true });
})();
