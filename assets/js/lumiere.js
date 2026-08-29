(() => {
  const shell = document.querySelector("#reader-shell");
  if (!shell) return;

  const book = new URLSearchParams(window.location.search).get("book");

  function safe(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]
    );
  }

  function emptyState(title, message, actionHtml = "") {
    shell.innerHTML = `
      <div class="reader-empty">
        <img class="reader-empty-logo" src="/assets/Lumiere01.png" alt="VMH Lumière">
        <div class="reader-empty-message">
          <h1>${safe(title)}</h1>
          <p>${safe(message)}</p>
          ${actionHtml}
        </div>
      </div>`;
  }

  if (!book) {
    emptyState(
      "VMH Lumière is ready.",
      "Open a title from Your Library to begin reading. Eligible eBooks purchased through Valois Media will appear in your library after you sign in.",
      '<a class="button" href="/library/">Open Your Library</a>'
    );
    return;
  }

  if (!VMH_AUTH.token) {
    emptyState(
      "Sign in to VMH Lumière.",
      "This title is connected to a customer library. Sign in to verify your access and continue reading.",
      '<a class="button" href="/account/">Sign In</a>'
    );
    return;
  }

  let manifest;
  let index = 0;

  const content = () => shell.querySelector(".reader-content");

  async function chapter(chapterIndex) {
    const item = manifest.spine[chapterIndex];
    if (!item) return;

    const response = await VMH_API.get("reader-chapter", {
      token: VMH_AUTH.token,
      product: book,
      chapter: item.id
    });

    if (!response.ok) {
      throw new Error(response.error || "The chapter could not be loaded.");
    }

    content().innerHTML = response.data.html;
    index = chapterIndex;

    await VMH_API.post("save-reading-progress", {
      token: VMH_AUTH.token,
      product: book,
      reading_progress: Math.round(((chapterIndex + 1) / manifest.spine.length) * 100),
      reading_location: item.id
    });
  }

  async function initializeReader() {
    try {
      emptyState(
        "Preparing VMH Lumière…",
        "Verifying your library and loading this title."
      );

      const response = await VMH_API.get("reader-manifest", {
        token: VMH_AUTH.token,
        product: book
      });

      if (!response.ok) {
        throw new Error(response.error || "Reader access could not be verified.");
      }

      manifest = response.data;

      shell.innerHTML = `
        <div class="reader-toolbar">
          <img src="/assets/Lumiere01.png" alt="VMH Lumière">
          <button type="button" data-prev>Previous</button>
          <button type="button" data-next>Next</button>
          <button type="button" data-theme="light">Light</button>
          <button type="button" data-theme="sepia">Sepia</button>
          <button type="button" data-theme="dark">Dark</button>
          <a class="button secondary" href="/library/">Library</a>
        </div>
        <article class="reader-content" aria-live="polite"></article>`;

      shell.addEventListener("click", event => {
        if (event.target.matches("[data-prev]")) {
          chapter(Math.max(0, index - 1)).catch(showReaderError);
        }

        if (event.target.matches("[data-next]")) {
          chapter(Math.min(manifest.spine.length - 1, index + 1)).catch(showReaderError);
        }

        if (event.target.dataset.theme) {
          shell.classList.remove("reader-dark", "reader-sepia");
          if (event.target.dataset.theme !== "light") {
            shell.classList.add(`reader-${event.target.dataset.theme}`);
          }
        }
      });

      const savedIndex = manifest.spine.findIndex(
        item => item.id === manifest.reading_location
      );
      const start = Math.max(0, savedIndex);

      await chapter(start);
    } catch (error) {
      showReaderError(error);
    }
  }

  function showReaderError(error) {
    emptyState(
      "VMH Lumière could not open this title.",
      error?.message || "Reader access is temporarily unavailable.",
      '<a class="button" href="/library/">Return to Your Library</a>'
    );
  }

  initializeReader();
})();