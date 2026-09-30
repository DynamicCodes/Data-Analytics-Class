// Session 02 interactive visuals (plain JavaScript + SVG, no libraries)
(function () {
  const C = {
    ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3",
    accent: "#0e8c7f", violet: "#6b5fd3", amber: "#d98a0b", rose: "#d94f70",
  };
  const $ = (root, sel) => root.querySelector(sel);
  const $$ = (root, sel) => [...root.querySelectorAll(sel)];

  /* ------------------------------------------------------------
     1. Approval gates
  ------------------------------------------------------------ */
  (function gates() {
    const root = document.getElementById("viz-gates");
    if (!root) return;
    const list = $(root, ".gates");
    const fill = $(root, ".progress-fill");
    const out = $(root, ".viz-out");

    const GATES = [
      { name: "Project initiation", what: "Scope, objectives and expected deliverables. Budget, team and tools are authorized." },
      { name: "Data acquisition and processing", what: "Data sources, collection methods and any use of sensitive data. ETL and preprocessing meet compliance and quality standards." },
      { name: "Analytics and modeling", what: "Analytical method, model choice and assumptions. Performance metrics and validation approach are reviewed." },
      { name: "Reporting and insights", what: "Dashboards, visuals and final reports before distribution. Conclusions match strategic goals." },
      { name: "Deployment and monitoring", what: "Putting models or automation into production. Monitoring metrics and a maintenance plan are agreed." },
    ];
    let approved = 0;

    function render(msg) {
      list.innerHTML = GATES.map((g, i) => {
        const done = i < approved;
        const next = i === approved;
        return `<li class="gate${done ? " is-approved" : ""}">
          <span class="gate-icon" aria-hidden="true">${done ? "✓" : i + 1}</span>
          <div><h5>${g.name}</h5><p>${g.what}</p></div>
          <button class="btn${next ? " is-on" : ""}" data-i="${i}" ${done ? "disabled" : ""}>${done ? "Approved" : "Approve"}</button>
        </li>`;
      }).join("");
      fill.style.width = (approved / GATES.length) * 100 + "%";
      out.innerHTML = msg || (approved === GATES.length
        ? "<h5>All five gates approved</h5><p>The project has leadership sign-off at every stage and can move into production with clear accountability.</p>"
        : `<p><b>${approved} of ${GATES.length}</b> gates approved. Next up: <b>${GATES[approved].name}</b>.</p>`);
    }

    list.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]");
      if (!b) return;
      const i = +b.dataset.i;
      if (i === approved) { approved++; render(); }
      else if (i > approved) {
        render(`<h5>Not yet</h5><p>“${GATES[i].name}” can't be approved before “${GATES[approved].name}”. Skipping gates is how projects end up with unapproved data or untested models in production.</p>`);
      }
    });
    $(root, "[data-reset]").addEventListener("click", () => { approved = 0; render(); });
    render();
  })();

  /* ------------------------------------------------------------
     2. Installation workflow
  ------------------------------------------------------------ */
  (function install() {
    const root = document.getElementById("viz-install");
    if (!root) return;
    const term = $(root, ".terminal");
    const out = $(root, ".viz-out");
    const dots = $(root, ".step-dots");
    const back = $(root, '[data-dir="-1"]');
    const next = $(root, '[data-dir="1"]');

    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const STEPS = [
      { title: "Install Python and create an environment",
        text: "Install Python, create an isolated conda environment for the project, then install the core libraries.",
        lines: [["cmd", "conda create -n analytics python=3.11"], ["cmd", "conda activate analytics"], ["cmd", "pip install pandas numpy scikit-learn matplotlib seaborn"], ["ok", "Successfully installed pandas numpy scikit-learn matplotlib seaborn"]] },
      { title: "Install a database client and connect",
        text: "Install the driver for your database, then check that you can reach the data source.",
        lines: [["cmd", "pip install psycopg2-binary sqlalchemy"], ["cmd", "python -c \"import sqlalchemy as sa; sa.create_engine(URL).connect()\""], ["ok", "Connected to sales_db (PostgreSQL 16)"]] },
      { title: "Install Jupyter and test code execution",
        text: "Install JupyterLab and run a small piece of code to confirm the environment works.",
        lines: [["cmd", "pip install jupyterlab"], ["cmd", "jupyter lab"], ["out", "Jupyter Server is running at http://localhost:8888/lab"], ["out", ">>> import pandas as pd; pd.__version__"], ["ok", "'2.2.2'"]] },
      { title: "Connect visualization tools to sample data",
        text: "Install Tableau or Power BI Desktop and connect it to a sample dataset to check the whole chain works.",
        lines: [["out", "Power BI Desktop → Get data → Text/CSV"], ["out", "Selected: sample_sales.csv (12,480 rows)"], ["ok", "Data loaded. Report canvas ready."]] },
      { title: "Document the setup for the team",
        text: "Export the exact environment so teammates can recreate it, and commit it with a short README.",
        lines: [["cmd", "conda env export > environment.yml"], ["cmd", "pip freeze > requirements.txt"], ["cmd", "git add environment.yml requirements.txt README.md"], ["cmd", "git commit -m \"Document analytics environment\""], ["ok", "Setup documented. Anyone can run: conda env create -f environment.yml"]] },
    ];
    let i = 0;
    dots.innerHTML = "<span></span>".repeat(STEPS.length);

    function render() {
      const s = STEPS[i];
      out.innerHTML = `<h5>Step ${i + 1} of ${STEPS.length}: ${s.title}</h5><p>${s.text}</p>`;
      term.innerHTML = s.lines.map(([k, t]) => `<div class="${k}">${esc(t)}</div>`).join("");
      [...dots.children].forEach((d, k) => d.classList.toggle("is-on", k <= i));
      back.disabled = i === 0;
      next.disabled = i === STEPS.length - 1;
    }
    back.addEventListener("click", () => { if (i > 0) { i--; render(); } });
    next.addEventListener("click", () => { if (i < STEPS.length - 1) { i++; render(); } });
    render();
  })();

  /* ------------------------------------------------------------
     3. UAT checklist
  ------------------------------------------------------------ */
  (function uat() {
    const root = document.getElementById("viz-uat");
    if (!root) return;
    const list = $(root, ".checklist");
    const badge = $(root, ".badge");
    const ITEMS = [
      "Sales totals match the finance system for the last three months",
      "Regional managers can filter to their own region and understand every chart",
      "Forecast accuracy meets the agreed target on historical data",
      "Customer data is masked in line with the privacy policy",
      "The dashboard refreshes automatically every morning by 8 AM",
      "Assumptions and methods have been presented to stakeholders and feedback addressed",
    ];
    list.innerHTML = ITEMS.map((t, k) => `<li><label><input type="checkbox" data-k="${k}" /><span>${t}</span></label></li>`).join("");
    const boxes = $$(list, "input");

    function render() {
      const n = boxes.filter((b) => b.checked).length;
      const ready = n === ITEMS.length;
      badge.classList.toggle("is-ready", ready);
      badge.textContent = ready ? "All criteria passed: ready for formal sign-off" : `${n} of ${ITEMS.length} criteria verified`;
    }
    boxes.forEach((b) => b.addEventListener("change", render));
    render();
  })();

  /* ------------------------------------------------------------
     4. Production monitoring and drift
  ------------------------------------------------------------ */
  (function monitor() {
    const root = document.getElementById("viz-monitor");
    if (!root) return;
    const svg = $(root, "svg");
    const input = $(root, '[data-in="th"]');
    const btn = $(root, "[data-retrain]");
    const out = $(root, ".viz-out");
    let retrain = false;

    // fixed noise so the chart is the same each visit
    const noise = [0.4, -0.8, 0.9, -0.3, 0.6, -1.1, 0.2, 0.8, -0.6, 0.3, -0.9, 1.0, -0.2, 0.5, -1.0, 0.7, -0.4, 0.2, -0.7, 0.9, -0.5, 0.4, -0.8, 0.6, -0.3, 0.1];
    const WEEKS = 26;

    function simulate(th) {
      const acc = [], events = [];
      let d = 0, shockActive = false;
      for (let w = 0; w < WEEKS; w++) {
        if (w === 14) shockActive = true; // a shift in customer behavior
        const v = 93 - 0.55 * d - (shockActive ? 3.5 : 0) + noise[w];
        acc.push(v);
        d++;
        if (retrain && v < th && w < WEEKS - 1) { events.push(w + 1); d = 0; shockActive = false; }
      }
      return { acc, events };
    }

    const W = 640, H = 260, L = 44, R = 16, T = 30, B = 36;
    const X = (w) => L + (w / (WEEKS - 1)) * (W - L - R);
    const Y = (v) => T + (1 - (v - 70) / 26) * (H - T - B);

    function render() {
      const th = +input.value;
      $(root, '[data-out="th"]').textContent = th + "%";
      const { acc, events } = simulate(th);

      let g = "";
      for (let v = 70; v <= 95; v += 5) {
        g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>`;
        g += `<text x="${L - 8}" y="${Y(v) + 4}" font-size="11" fill="${C.soft}" text-anchor="end">${v}%</text>`;
      }
      for (let w = 0; w < WEEKS; w += 5) g += `<text x="${X(w)}" y="${H - 16}" font-size="11" fill="${C.soft}" text-anchor="middle">W${w + 1}</text>`;
      g += `<text x="${(W + L) / 2}" y="${H - 1}" font-size="11" fill="${C.soft}" text-anchor="middle">Week in production</text>`;
      g += `<text x="${L - 36}" y="${T - 16}" font-size="11" fill="${C.soft}">Accuracy</text>`;

      g += `<rect x="${L}" y="${Y(th)}" width="${W - L - R}" height="${Y(70) - Y(th)}" fill="${C.rose}" opacity="0.06"/>`;
      g += `<line x1="${L}" x2="${W - R}" y1="${Y(th)}" y2="${Y(th)}" stroke="${C.rose}" stroke-width="1.5" stroke-dasharray="6 4"/>`;
      g += `<text x="${W - R}" y="${Y(th) - 6}" font-size="11" fill="${C.rose}" text-anchor="end" font-weight="700">Alert at ${th}%</text>`;

      events.forEach((w) => {
        g += `<line x1="${X(w)}" x2="${X(w)}" y1="${T}" y2="${Y(70)}" stroke="${C.violet}" stroke-width="1.5" stroke-dasharray="3 3"/>`;
        g += `<text x="${X(w) + 4}" y="${T + 10}" font-size="10" fill="${C.violet}" font-weight="700">Retrained</text>`;
      });

      g += `<polyline points="${acc.map((v, w) => `${X(w)},${Y(v)}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5" stroke-linejoin="round"/>`;
      acc.forEach((v, w) => {
        const low = v < th;
        g += `<circle cx="${X(w)}" cy="${Y(v)}" r="${low ? 5 : 3.5}" fill="${low ? C.rose : C.accent}" stroke="#fff" stroke-width="1.5"><title>Week ${w + 1}: ${v.toFixed(1)}%</title></circle>`;
      });
      svg.innerHTML = g;

      const alerts = acc.filter((v) => v < th).length;
      const avg = acc.reduce((a, b) => a + b, 0) / acc.length;
      $(root, '[data-stat="alerts"]').textContent = alerts;
      $(root, '[data-stat="avg"]').textContent = avg.toFixed(1) + "%";
      $(root, '[data-stat="retrains"]').textContent = events.length;

      out.innerHTML = retrain
        ? `<p>With automatic retraining, each alert triggers a retrain on recent data and accuracy recovers. Average accuracy is <b>${avg.toFixed(1)}%</b> with <b>${events.length}</b> retrain${events.length === 1 ? "" : "s"}. A higher threshold keeps accuracy up but means retraining more often, which costs time and computing.</p>`
        : `<p>Without retraining, accuracy keeps sliding as the data drifts, and drops sharply in week 15 when customer behavior shifts. <b>${alerts}</b> of ${WEEKS} weeks fall below the ${th}% threshold. Monitoring catches the problem, but someone has to act on it.</p>`;
    }

    input.addEventListener("input", render);
    btn.addEventListener("click", () => { retrain = !retrain; btn.setAttribute("aria-pressed", String(retrain)); render(); });
    render();
  })();
})();
