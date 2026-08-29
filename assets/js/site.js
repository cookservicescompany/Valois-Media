(() => {
  const c = window.VMH_CONFIG;
  const page = document.body.dataset.page || "";

  const signedIn = () => Boolean(localStorage.getItem("vmh_session"));

  const nav = [
    { label: "Home", url: "/", key: "home" },
    { label: "Books", url: "/books/", key: "books" },
    { label: "Authors", url: "/contributors/", key: "contributors" },
    { label: "VMH Lumière", url: "/lumiere/", key: "lumiere" },
    { label: "Library", url: "/library/", key: "library" },
    { label: "About", url: "/about/", key: "about" },
    { label: "Contact", url: "/contact/", key: "contact" },
    {
      label: signedIn() ? "Account" : "Login",
      url: "/account/",
      key: "account",
      className: "nav-account"
    }
  ];

  const navLink = ({ label, url, key, className = "" }) => {
    const current = page === key ? ' aria-current="page"' : "";
    const klass = className ? ` class="${className}"` : "";
    return `<a${klass} href="${url}" data-nav-key="${key}"${current}>${label}</a>`;
  };

  const header = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="header-inner">
        <a class="brand-link" href="${c.logoHomeUrl}" aria-label="Valois Media Holdings home">
          <img src="/assets/VMHLogo01.png" alt="Valois Media Holdings">
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
          Menu
        </button>
        <nav id="site-nav" class="site-nav" aria-label="Primary">
          ${nav.map(navLink).join("")}
        </nav>
      </div>
    </header>`;

  const footer = `
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-grid">
          <div>
            <a href="${c.logoHomeUrl}" aria-label="Valois Media Holdings home">
              <img class="footer-logo" src="/assets/VMHLogo01.png" alt="Valois Media Holdings">
            </a>
            <p>Independent books, distinctive editions, and a protected digital reading experience through VMH Lumière.</p>
          </div>
          <div>
            <h3>Explore</h3>
            <div class="footer-links">
              <a href="/books/">Books</a>
              <a href="/contributors/">Contributors</a>
              <a href="/library/">Your Library</a>
              <a href="/lumiere/">VMH Lumière</a>
              <a href="/account/">Account</a>
            </div>
          </div>
          <div>
            <h3>Legal</h3>
            <div class="footer-links">
              <a href="/terms/">Terms of Service</a>
              <a href="/privacy/">Privacy Policy</a>
              <a href="/copyright/">Copyright</a>
              <a href="/contact/">Contact</a>
            </div>
          </div>
        </div>
        <div class="copyright-line">
          <a href="/copyright/">Copyright © 2026 Valois Media Holdings. All Rights Reserved.</a>
          <br>Operated by <a href="${c.operatorUrl}">Cook Services Company, LLC</a>.
        </div>
      </div>
    </footer>`;

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);

  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#site-nav");

  toggle?.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  const updateAccountNavigation = () => {
    const accountLink = document.querySelector('[data-nav-key="account"]');
    if (!accountLink) return;
    accountLink.textContent = signedIn() ? "Account" : "Login";
    accountLink.setAttribute(
      "aria-label",
      signedIn() ? "Open your Valois Media account" : "Sign in to your Valois Media account"
    );
  };

  window.addEventListener("vmh:authchange", updateAccountNavigation);
  window.addEventListener("storage", event => {
    if (event.key === "vmh_session") updateAccountNavigation();
  });

  updateAccountNavigation();
})();
