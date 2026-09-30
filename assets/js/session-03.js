// Session 03 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", rose: "#d94f70", amber: "#d98a0b" };
  const $ = (r, s) => r.querySelector(s);
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));

  /* 1. Nature of data: field profiler */
  (function nature() {
    const root = document.getElementById("viz-nature");
    if (!root) return;
    const bar = $(root, ".controls");
    const out = $(root, ".viz-out");
    const F = [
      { f: "Gender", m: "Qualitative", q: "Not applicable", s: "Primary", st: "Structured",
        use: "A categorical variable. Encode it (for example one-hot) before modeling, and summarize it with counts and percentages, not averages." },
      { f: "Blood group", m: "Qualitative", q: "Not applicable", s: "Primary", st: "Structured",
        use: "Categorical with several levels (A, B, AB, O). Use frequency tables and bar charts; if it is the target, the task is classification." },
      { f: "Wound type", m: "Qualitative", q: "Not applicable", s: "Primary", st: "Structured",
        use: "A category such as surgical, burn or ulcer. Useful for grouping patients and comparing healing across groups." },
      { f: "Age", m: "Quantitative", q: "Continuous (usually recorded in whole years)", s: "Primary", st: "Structured",
        use: "Numeric, so mean, median and standard deviation apply. Scale it alongside other numeric features before distance-based models." },
      { f: "Wound size (cm²)", m: "Quantitative", q: "Continuous", s: "Primary", st: "Structured",
        use: "A continuous measurement. Check the distribution with a histogram and normalize it if it sits on a very different scale from other features." },
      { f: "Number of visits", m: "Quantitative", q: "Discrete", s: "Primary", st: "Structured",
        use: "A count, so only whole numbers make sense. Report medians and ranges; count models suit it better than plain regression." },
      { f: "Healing time (days)", m: "Quantitative", q: "Continuous", s: "Primary", st: "Structured",
        use: "A numeric target, so predicting it is a regression problem. This is likely the main outcome of the study." },
      { f: "Past admissions", m: "Quantitative", q: "Discrete", s: "Secondary (hospital records)", st: "Structured",
        use: "Collected earlier for another purpose, so check its definitions and quality before relying on it." },
      { f: "Doctor's notes", m: "Qualitative", q: "Not applicable", s: "Primary", st: "Unstructured (text)",
        use: "Free text needs natural language processing (such as keyword extraction or sentiment) to turn it into features." },
      { f: "Wound photo", m: "Qualitative", q: "Not applicable", s: "Primary", st: "Unstructured (image)",
        use: "Images need computer vision techniques, such as deep learning models, to extract measurable features." },
      { f: "Lab report (JSON)", m: "Mixed", q: "Contains both types", s: "Primary", st: "Semi-structured",
        use: "Tagged fields can be parsed into columns, then each field is treated according to its own type." },
    ];
    const btns = F.map((d) => {
      const b = document.createElement("button");
      b.className = "btn"; b.type = "button"; b.textContent = d.f; b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => show(d, b));
      bar.appendChild(b);
      return b;
    });
    function show(d, b) {
      press(btns, b);
      out.innerHTML = `<h5>${d.f}</h5>
        <div class="tag-grid">
          <div class="tag-cell"><span>Measurement</span><b>${d.m}</b></div>
          <div class="tag-cell"><span>Quantitative subtype</span><b>${d.q}</b></div>
          <div class="tag-cell"><span>Source</span><b>${d.s}</b></div>
          <div class="tag-cell"><span>Structure</span><b>${d.st}</b></div>
        </div>
        <p style="margin:.9rem 0 0"><b>For analysis:</b> ${d.use}</p>`;
    }
    show(F[6], btns[6]);
  })();

  /* 2. Reporting vs analysis */
  (function report() {
    const root = document.getElementById("viz-report");
    if (!root) return;
    const svg = $(root, "svg");
    const out = $(root, ".viz-out");
    const btns = [...root.querySelectorAll("[data-view]")];
    const W = 640, H = 290, L = 48, R = 16, T = 30, B = 40;

    const regions = [["North", 820, 690], ["South", 610, 640], ["East", 540, 560], ["West", 700, 720]];
    const steps = [["Q1 sales", 820, "total"], ["Competitor opened", -70], ["Price increase", -45], ["Fewer promotions", -30], ["New online channel", 15], ["Q2 sales", 690, "total"]];

    function axis(max, step) {
      const Y = (v) => T + (1 - v / max) * (H - T - B);
      let g = "";
      for (let v = 0; v <= max; v += step) {
        g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>`;
        g += `<text x="${L - 8}" y="${Y(v) + 4}" font-size="11" fill="${C.soft}" text-anchor="end">${v}</text>`;
      }
      g += `<text x="${L - 40}" y="${T - 16}" font-size="11" fill="${C.soft}">Sales (₹ lakh)</text>`;
      return [g, Y];
    }

    function renderReport() {
      let [g, Y] = axis(900, 300);
      const gw = (W - L - R) / regions.length, bw = gw * 0.28;
      regions.forEach(([name, a, b], i) => {
        const cx = L + gw * (i + 0.5);
        const drop = b < a;
        g += `<rect x="${cx - bw - 3}" y="${Y(a)}" width="${bw}" height="${Y(0) - Y(a)}" rx="4" fill="${C.light}"/>`;
        g += `<rect x="${cx + 3}" y="${Y(b)}" width="${bw}" height="${Y(0) - Y(b)}" rx="4" fill="${drop ? C.rose : C.accent}"/>`;
        g += `<text x="${cx + 3 + bw / 2}" y="${Y(b) - 6}" font-size="11" text-anchor="middle" fill="${drop ? C.rose : C.ink}" font-weight="700">${b}</text>`;
        g += `<text x="${cx}" y="${H - 18}" font-size="12" text-anchor="middle" fill="${C.ink}" font-weight="600">${name}</text>`;
      });
      g += `<rect x="${W - R - 150}" y="${T - 26}" width="10" height="10" rx="2" fill="${C.light}"/><text x="${W - R - 136}" y="${T - 17}" font-size="11" fill="${C.soft}">Q1</text>`;
      g += `<rect x="${W - R - 100}" y="${T - 26}" width="10" height="10" rx="2" fill="${C.accent}"/><text x="${W - R - 86}" y="${T - 17}" font-size="11" fill="${C.soft}">Q2</text>`;
      svg.innerHTML = g;
      out.innerHTML = `<h5>What happened?</h5><p>Three regions grew slightly, but North fell from ₹820 lakh to ₹690 lakh, a 16% drop. The report states the fact clearly. It doesn't say why.</p>`;
    }

    function renderAnalysis() {
      let [g, Y] = axis(900, 300);
      const sw = (W - L - R) / steps.length, bw = sw * 0.58;
      let run = 0;
      steps.forEach(([label, v, kind], i) => {
        const cx = L + sw * (i + 0.5);
        let top, bot, fill;
        if (kind === "total") { top = v; bot = 0; fill = i === 0 ? C.light : C.rose; run = v; }
        else { const next = run + v; top = Math.max(run, next); bot = Math.min(run, next); fill = v < 0 ? C.amber : C.accent; run = next; }
        g += `<rect x="${cx - bw / 2}" y="${Y(top)}" width="${bw}" height="${Math.max(2, Y(bot) - Y(top))}" rx="4" fill="${fill}"/>`;
        g += `<text x="${cx}" y="${Y(top) - 6}" font-size="11" text-anchor="middle" font-weight="700" fill="${C.ink}">${kind === "total" ? v : (v > 0 ? "+" : "−") + Math.abs(v)}</text>`;
        const words = label.split(" ");
        const l1 = words.slice(0, Math.ceil(words.length / 2)).join(" "), l2 = words.slice(Math.ceil(words.length / 2)).join(" ");
        g += `<text x="${cx}" y="${H - 22}" font-size="10.5" text-anchor="middle" fill="${C.ink}">${l1}</text><text x="${cx}" y="${H - 9}" font-size="10.5" text-anchor="middle" fill="${C.ink}">${l2}</text>`;
        if (i < steps.length - 1) g += `<line x1="${cx + bw / 2}" x2="${cx + sw - bw / 2}" y1="${Y(run)}" y2="${Y(run)}" stroke="${C.soft}" stroke-dasharray="3 3"/>`;
      });
      svg.innerHTML = g;
      out.innerHTML = `<h5>Why did it happen?</h5><p>A regression on store-level data splits the ₹130 lakh drop into its drivers. A competitor opening nearby explains the largest share, followed by the price increase and fewer promotions. The new online channel partly offset the loss.</p><p><b>What next?</b> Reversing the price increase is the quickest lever; the model estimates it would recover about ₹45 lakh next quarter.</p>`;
    }

    btns.forEach((b) => b.addEventListener("click", () => { press(btns, b); b.dataset.view === "report" ? renderReport() : renderAnalysis(); }));
    renderReport();
  })();

  /* 3. Tool categories */
  (function tools() {
    const root = document.getElementById("viz-tools");
    if (!root) return;
    const bar = $(root, ".controls");
    const out = $(root, ".viz-out");
    const CATS = [
      { n: "Data management and integration", p: "Collecting, cleaning, transforming and integrating data from many sources.",
        t: [["SQL / MySQL / PostgreSQL", "Querying and managing structured data"], ["Talend / Informatica", "Data integration and ETL (extract, transform, load)"], ["Apache NiFi / Airbyte", "Automating data flow between systems"], ["Snowflake / Google BigQuery", "Cloud data warehousing with fast queries"]] },
      { n: "Visualization and BI", p: "Presenting data visually for quick understanding and reporting.",
        t: [["Tableau", "Interactive dashboards and drag-and-drop analytics"], ["Microsoft Power BI", "Excel integration and real-time dashboards"], ["Qlik Sense", "Self-service analytics with associative data modeling"], ["Looker / Google Data Studio", "Web-based, customizable reporting"]] },
      { n: "Statistical and predictive", p: "Advanced statistical modeling, hypothesis testing and prediction.",
        t: [["R", "Statistical computing and visualization"], ["Python (pandas, NumPy, scikit-learn)", "Flexible, with AI/ML and visualization libraries"], ["SPSS / SAS", "Professional statistical and predictive modeling"], ["RapidMiner", "No-code predictive modeling and machine learning"]] },
      { n: "Machine learning and AI", p: "Building systems that learn from data to predict or classify.",
        t: [["TensorFlow / Keras", "Deep learning frameworks from Google"], ["PyTorch", "Flexible deep learning library from Meta"], ["H2O.ai / DataRobot", "AutoML for automated model building"], ["MLflow", "Managing the ML life cycle from training to deployment"]] },
      { n: "Big data analytics", p: "Handling large, distributed datasets efficiently.",
        t: [["Apache Hadoop", "Distributed storage and batch processing"], ["Apache Spark", "In-memory processing for real-time analytics"], ["Databricks", "Cloud platform for collaborative big data and ML"], ["Hive / Pig", "SQL-like querying of large datasets"]] },
      { n: "Cloud analytics platforms", p: "Scalable, on-demand analytics without local infrastructure.",
        t: [["AWS (Redshift, QuickSight)", "End-to-end analytics in the cloud"], ["Google Cloud (BigQuery, Looker)", "Real-time analysis with AI integration"], ["Azure Synapse Analytics", "Unified integration, warehousing and ML"], ["IBM Watson Analytics", "AI-powered insights and visualization"]] },
    ];
    const btns = CATS.map((c) => {
      const b = document.createElement("button");
      b.className = "btn"; b.type = "button"; b.textContent = c.n;
      b.addEventListener("click", () => show(c, b));
      bar.appendChild(b);
      return b;
    });
    function show(c, b) {
      press(btns, b);
      out.innerHTML = `<h5>${c.n}</h5><p>${c.p}</p><div class="table-wrap" style="margin-bottom:0"><table><thead><tr><th>Tool</th><th>Key features</th></tr></thead><tbody>${c.t.map(([a, f]) => `<tr><td><b>${a}</b></td><td>${f}</td></tr>`).join("")}</tbody></table></div>`;
    }
    show(CATS[0], btns[0]);
  })();
})();
