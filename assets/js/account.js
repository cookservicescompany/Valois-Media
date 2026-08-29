(() => {
  const portal = document.querySelector("#account-portal");
  if (!portal) return;

  const signedOut = portal.querySelector("[data-account-signed-out]");
  const signedIn = portal.querySelector("[data-account-signed-in]");
  const status = portal.querySelector("[data-account-status]");
  const name = portal.querySelector("[data-account-name]");
  const email = portal.querySelector("[data-account-email]");
  const verification = portal.querySelector("[data-account-verification]");
  const libraryCount = portal.querySelector("[data-account-library-count]");
  const signOutButton = portal.querySelector("[data-sign-out]");

  function showSignedOut(message = "") {
    signedOut.hidden = false;
    signedIn.hidden = true;
    if (status) {
      status.hidden = !message;
      status.className = "notice error";
      status.textContent = message;
    }
  }

  function showSignedIn(accountData) {
    const user = accountData.user || {};
    const library = Array.isArray(accountData.library) ? accountData.library : [];

    signedOut.hidden = true;
    signedIn.hidden = false;

    if (status) status.hidden = true;
    if (name) name.textContent = user.display_name || "Valois Media Reader";
    if (email) email.textContent = user.email || "";
    if (verification) {
      verification.textContent = user.email_verified ? "Verified" : "Verification required";
      verification.className = user.email_verified ? "badge account-verified" : "badge account-unverified";
    }
    if (libraryCount) {
      libraryCount.textContent = `${library.length} ${library.length === 1 ? "title" : "titles"}`;
    }
  }

  async function loadAccount() {
    if (!VMH_AUTH.token) {
      showSignedOut();
      return;
    }

    if (status) {
      status.hidden = false;
      status.className = "notice";
      status.textContent = "Loading your account…";
    }

    try {
      const response = await VMH_API.post("account", { token: VMH_AUTH.token });

      if (!response.ok) {
        throw new Error(response.error || "Your session could not be verified.");
      }

      showSignedIn(response.data || {});
    } catch (error) {
      VMH_AUTH.clear();
      showSignedOut(
        `${error.message || "Your session has expired."} Please sign in again.`
      );
    }
  }

  signOutButton?.addEventListener("click", async () => {
    signOutButton.disabled = true;
    await VMH_AUTH.signOut();
    showSignedOut("You have been signed out.");
    signOutButton.disabled = false;
  });

  window.addEventListener("vmh:authchange", () => {
    if (VMH_AUTH.token) {
      loadAccount();
    } else {
      showSignedOut();
    }
  });

  loadAccount();
})();