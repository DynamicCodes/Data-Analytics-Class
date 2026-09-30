// Renders the session cards from SESSIONS (see sessions.js)
(function () {
  const grid = document.getElementById("session-grid");
  const count = document.getElementById("session-count");
  if (!grid || typeof SESSIONS === "undefined") return;

  if (count) count.textContent = `${SESSIONS.length} sessions`;

  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);

  grid.innerHTML = SESSIONS.map((s, i) => {
    const num = String(s.number).padStart(2, "0");
    const ready = s.title.trim() !== "";
    const title = ready ? escape(s.title) : "";
    const desc = ready && s.description ? escape(s.description) : "";

    return `
      <li>
        <a class="session-card${ready ? "" : " is-pending"}" href="${escape(s.page)}" style="--i:${i}">
          <span class="session-num"><small>Session</small>${num}</span>
          ${title ? `<h2 class="session-title">${title}</h2>` : ""}
          ${desc ? `<p class="session-desc">${desc}</p>` : ""}
          <span class="session-open">${ready ? "Open session" : "Coming soon"}</span>
        </a>
      </li>`;
  }).join("");
})();
