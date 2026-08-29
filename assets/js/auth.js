const AUTH = {
  get token() {
    return localStorage.getItem("vmh_session") || "";
  },

  set token(value) {
    if (value) {
      localStorage.setItem("vmh_session", value);
    } else {
      localStorage.removeItem("vmh_session");
    }
    window.dispatchEvent(
      new CustomEvent("vmh:authchange", {
        detail: { signedIn: Boolean(value) }
      })
    );
  },

  clear() {
    this.token = "";
  },

  async signOut() {
    const currentToken = this.token;
    try {
      if (currentToken) {
        await VMH_API.post("logout", { token: currentToken });
      }
    } catch (_) {
      // Local sign-out must still complete if the API is unavailable.
    } finally {
      this.clear();
    }
  }
};

document.addEventListener("submit", async event => {
  const form = event.target;
  if (!form.matches("[data-auth-form]")) return;

  event.preventDefault();

  const action = form.dataset.authForm;
  const payload = Object.fromEntries(new FormData(form).entries());

  if (AUTH.token) payload.token = AUTH.token;

  try {
    const response = await VMH_API.post(action, payload);

    if (!response.ok) {
      throw new Error(response.error || "Request failed.");
    }

    if (response.token) AUTH.token = response.token;

    formMessage(form, response.message || "Success.", true);

    if (action === "login") {
      window.location.href = "/account/";
    }
  } catch (error) {
    formMessage(form, error.message || "Request failed.");
  }
});

window.VMH_AUTH = AUTH;