// Session 01 interactive visuals (plain JavaScript + SVG, no libraries)
(function () {
  const C = {
    ink: "#1b2a41", soft: "#5d6b82", line: "#dde4ef", grid: "#e3e9f3",
    accent: "#0e8c7f", accentSoft: "#d9f1ee", violet: "#6b5fd3", amber: "#d98a0b", rose: "#d94f70",
  };

  // Small seeded random generator so the data is the same on every visit
  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  const $ = (root, sel) => root.querySelector(sel);
  const $$ = (root, sel) => [...root.querySelectorAll(sel)];
  const pct = (v) => `${Math.round(v * 100)}%`;

  function press(buttons, active) {
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === active)));
  }

  /* ------------------------------------------------------------
     1. Descriptive / predictive / prescriptive
  ------------------------------------------------------------ */
  (function types() {
    const root = document.getElementById("viz-types");
    if (!root) return;
    const svg = $(root, "svg");
    const out = $(root, ".viz-out");
    const btns = $$(root, "[data-mode]");

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const hist = [42, 45, 43, 50, 54, 52, 58, 61, 59];
    const fc = [63, 66, 72];
    const rec = [67, 73, 81];
    const W = 640, H = 280, L = 44, R = 16, T = 32, B = 34;
    const yMin = 30, yMax = 90;
    const x = (i) => L + (i + 0.5) * ((W - L - R) / 12);
    const bw = ((W - L - R) / 12) * 0.62;
    const y = (v) => T + (1 - (v - yMin) / (yMax - yMin)) * (H - T - B);

    const copy = {
      descriptive: `<h5>What happened?</h5><p>Sales rose from ₹42 lakh in January to ₹59 lakh in September, about 40% growth. August was the best month and the monthly average was ₹52 lakh. This is the view a dashboard or monthly report gives you.</p>`,
      predictive: `<h5>What could happen?</h5><p>A forecast model trained on the past nine months expects around ₹63, ₹66 and ₹72 lakh for October to December, driven by the upward trend and the festive season. The shaded band shows the uncertainty around that forecast.</p>`,
      prescriptive: `<h5>What should we do?</h5><p>Comparing scenarios, the model recommends increasing festive stock by 15% and moving ad budget into October. The projected result is about ₹221 lakh for the quarter against ₹201 lakh on the current plan.</p>`,
    };

    function render(mode) {
      let g = "";
      for (let v = 30; v <= 90; v += 15) {
        g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${C.grid}"/>`;
        g += `<text x="${L - 8}" y="${y(v) + 4}" font-size="11" fill="${C.soft}" text-anchor="end">${v}</text>`;
      }
      g += `<text x="${L - 36}" y="${T - 18}" font-size="11" fill="${C.soft}">₹ lakh</text>`;
      months.forEach((m, i) => (g += `<text x="${x(i)}" y="${H - 12}" font-size="11" fill="${C.soft}" text-anchor="middle">${m}</text>`));

      const maxI = hist.indexOf(Math.max(...hist));
      hist.forEach((v, i) => {
        const fill = mode === "descriptive" && i === maxI ? C.accent : mode === "descriptive" ? "#7cc3bb" : "#b7dfda";
        g += `<rect x="${x(i) - bw / 2}" y="${y(v)}" width="${bw}" height="${y(yMin) - y(v)}" rx="5" fill="${fill}"/>`;
      });

      if (mode === "descriptive") {
        const avg = hist.reduce((a, b) => a + b, 0) / hist.length;
        g += `<line x1="${x(0) - bw / 2}" x2="${x(8) + bw / 2}" y1="${y(avg)}" y2="${y(avg)}" stroke="${C.ink}" stroke-dasharray="5 4"/>`;
        g += `<text x="${x(8) + bw / 2 + 6}" y="${y(avg) + 4}" font-size="11" fill="${C.ink}">Average ${avg.toFixed(0)}</text>`;
        g += `<text x="${x(maxI)}" y="${y(hist[maxI]) - 8}" font-size="11" font-weight="700" fill="${C.accent}" text-anchor="middle">Best: ${hist[maxI]}</text>`;
      }

      if (mode !== "descriptive") {
        const pts = [[8, hist[8]], ...fc.map((v, k) => [9 + k, v])];
        const up = pts.map(([i, v], k) => `${x(i)},${y(v + k * 2.2)}`).join(" ");
        const dn = pts.map(([i, v], k) => `${x(i)},${y(v - k * 2.2)}`).reverse().join(" ");
        g += `<polygon points="${up} ${dn}" fill="${C.amber}" opacity="0.14"/>`;
        g += `<polyline points="${pts.map(([i, v]) => `${x(i)},${y(v)}`).join(" ")}" fill="none" stroke="${C.amber}" stroke-width="2.5" stroke-dasharray="6 4"/>`;
        fc.forEach((v, k) => (g += `<circle cx="${x(9 + k)}" cy="${y(v)}" r="4.5" fill="#fff" stroke="${C.amber}" stroke-width="2.5"/>`));
        g += `<text x="${x(10)}" y="${y(fc[1]) + 24}" font-size="11" fill="${C.amber}" text-anchor="middle" font-weight="700">${mode === "predictive" ? "Forecast" : "Current plan"}</text>`;
      }

      if (mode === "prescriptive") {
        const pts = [[8, hist[8]], ...rec.map((v, k) => [9 + k, v])];
        g += `<polyline points="${pts.map(([i, v]) => `${x(i)},${y(v)}`).join(" ")}" fill="none" stroke="${C.violet}" stroke-width="3"/>`;
        rec.forEach((v, k) => (g += `<circle cx="${x(9 + k)}" cy="${y(v)}" r="5" fill="${C.violet}"/>`));
        g += `<text x="${x(11)}" y="${y(rec[2]) - 10}" font-size="11" fill="${C.violet}" text-anchor="end" font-weight="700">Recommended action</text>`;
      }

      svg.innerHTML = g;
      out.innerHTML = copy[mode];
    }

    btns.forEach((b) => b.addEventListener("click", () => { press(btns, b); render(b.dataset.mode); }));
    render("descriptive");
  })();

  /* ------------------------------------------------------------
     2. Life cycle ring
  ------------------------------------------------------------ */
  (function ring() {
    const root = document.getElementById("viz-ring");
    if (!root) return;
    const box = $(root, ".ring");
    const svg = $(box, "svg");
    const out = $(root, ".viz-out");

    const stages = [
      { name: "Data collection", sub: "Gathering relevant information",
        text: "Data comes from structured databases, unstructured text, sensors and social media. It is gathered through surveys, interviews, web scraping and automated logging. Quality matters from the start: check accuracy, completeness, consistency and timeliness." },
      { name: "Processing and cleaning", label: "Processing and cleaning", sub: "Preparing data for analysis",
        text: "Raw data is converted into a usable format through normalization, encoding and scaling. Missing values are handled by imputation or deletion, and transformations such as aggregation, pivoting and feature extraction make the data fit for analysis." },
      { name: "Data analysis", sub: "Extracting insights",
        text: "Statistical methods (regression, hypothesis testing, descriptive statistics) and machine learning (prediction, classification, clustering) uncover patterns. R, Python, Tableau and SAS are common tools." },
      { name: "Interpretation", sub: "Making sense of the results",
        text: "Results are read in context, conclusions are tied back to the original objectives, and findings are communicated in clear language suited to the audience." },
      { name: "Visualization", sub: "Turning data into visual insight",
        text: "Charts and dashboards simplify complex data so people can decide faster. Tools like Tableau and Power BI help, and good visuals stay clear, simple and relevant, without distorting the message." },
      { name: "Implementation and monitoring", label: "Implement and monitor", sub: "Turning insight into action",
        text: "Insights are built into business strategy, outcomes are monitored, and the strategy is adjusted. Feedback from this stage starts the next round of the cycle." },
    ];

    const R = 38;
    const pos = stages.map((_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / stages.length;
      return [50 + R * Math.cos(a), 50 + R * Math.sin(a)];
    });

    // arrows between stages along the ring
    let g = `<circle cx="50" cy="50" r="${R}" fill="none" stroke="${C.line}" stroke-width="1.2" stroke-dasharray="1.5 2"/>`;
    g += `<defs><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${C.accent}"/></marker></defs>`;
    stages.forEach((_, i) => {
      const a = -Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / stages.length;
      const a0 = a - 0.08, a1 = a + 0.08;
      g += `<path d="M${50 + R * Math.cos(a0)},${50 + R * Math.sin(a0)} A${R},${R} 0 0 1 ${50 + R * Math.cos(a1)},${50 + R * Math.sin(a1)}" fill="none" stroke="${C.accent}" stroke-width="1.2" marker-end="url(#ah)"/>`;
    });
    svg.innerHTML = g;

    const buttons = stages.map((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = s.label || s.name;
      b.style.left = pos[i][0] + "%";
      b.style.top = pos[i][1] + "%";
      b.addEventListener("click", () => select(i));
      b.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); select((i + 1) % stages.length, true); }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); select((i - 1 + stages.length) % stages.length, true); }
      });
      box.appendChild(b);
      return b;
    });

    function select(i, focus) {
      buttons.forEach((b, k) => { b.classList.toggle("is-on", k === i); b.setAttribute("aria-pressed", String(k === i)); });
      if (focus) buttons[i].focus();
      const s = stages[i];
      out.innerHTML = `<h5>${i + 1}. ${s.name}</h5><p style="color:${C.soft};margin:0 0 .5rem">${s.sub}</p><p>${s.text}</p>`;
    }
    select(0);
  })();

  /* ------------------------------------------------------------
     3. EDA scatter
  ------------------------------------------------------------ */
  (function eda() {
    const root = document.getElementById("viz-eda");
    if (!root) return;
    const svg = $(root, "svg");
    const out = $(root, ".viz-out");
    const state = { trend: false, anomaly: false };
    const r = rng(7);

    const pts = Array.from({ length: 40 }, (_, i) => {
      const x = 10 + r() * 90;
      return { x, y: 25 + 1.55 * x + (r() - 0.5) * 26, note: "" };
    });
    Object.assign(pts[7], { x: 62, y: 48, note: "Stock-out week: ads ran but shelves were empty" });
    Object.assign(pts[22], { x: 45, y: 205, note: "Festival week: sales spiked beyond what ads explain" });
    Object.assign(pts[31], { x: 94, y: 70, note: "Possible data entry error in the sales figure" });

    const n = pts.length;
    const mx = pts.reduce((a, p) => a + p.x, 0) / n;
    const my = pts.reduce((a, p) => a + p.y, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    pts.forEach((p) => { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) ** 2; syy += (p.y - my) ** 2; });
    const slope = sxy / sxx, icpt = my - slope * mx, corr = sxy / Math.sqrt(sxx * syy);
    const res = pts.map((p) => p.y - (icpt + slope * p.x));
    const sd = Math.sqrt(res.reduce((a, v) => a + v * v, 0) / n);
    pts.forEach((p, i) => (p.out = Math.abs(res[i]) > 2 * sd));

    const W = 640, H = 300, L = 48, Rm = 16, T = 30, B = 40;
    const X = (v) => L + (v / 110) * (W - L - Rm);
    const Y = (v) => T + (1 - v / 240) * (H - T - B);

    function render() {
      let g = "";
      for (let v = 0; v <= 240; v += 60) {
        g += `<line x1="${L}" x2="${W - Rm}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>`;
        g += `<text x="${L - 8}" y="${Y(v) + 4}" font-size="11" fill="${C.soft}" text-anchor="end">${v}</text>`;
      }
      for (let v = 0; v <= 100; v += 20) g += `<text x="${X(v)}" y="${H - 20}" font-size="11" fill="${C.soft}" text-anchor="middle">${v}</text>`;
      g += `<text x="${(W + L) / 2}" y="${H - 3}" font-size="11" fill="${C.soft}" text-anchor="middle">Ad spend (₹ thousand per week)</text>`;
      g += `<text x="${L - 40}" y="${T - 16}" font-size="11" fill="${C.soft}">Sales (₹ thousand)</text>`;

      if (state.trend) {
        g += `<line x1="${X(5)}" y1="${Y(icpt + slope * 5)}" x2="${X(105)}" y2="${Y(icpt + slope * 105)}" stroke="${C.violet}" stroke-width="2.5"/>`;
      }
      pts.forEach((p) => {
        const hot = state.anomaly && p.out;
        g += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="${hot ? 7 : 5}" fill="${hot ? C.rose : C.accent}" fill-opacity="${hot ? 1 : 0.7}" stroke="#fff" stroke-width="1.5"><title>${p.note || `Spend ${p.x.toFixed(0)}, sales ${p.y.toFixed(0)}`}</title></circle>`;
        if (hot && p.note) g += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="13" fill="none" stroke="${C.rose}" stroke-width="1.5" stroke-dasharray="3 3"/>`;
      });
      svg.innerHTML = g;

      $(root, '[data-stat="r"]').textContent = state.trend ? corr.toFixed(2) : "–";
      $(root, '[data-stat="a"]').textContent = state.anomaly ? pts.filter((p) => p.out).length : "?";

      const notes = pts.filter((p) => p.out && p.note).map((p) => `<li>${p.note}</li>`).join("");
      out.innerHTML = state.anomaly
        ? `<h5>Three points break the pattern</h5><p>Each lies far from the trend. Before removing them, find out why:</p><ul class="plain" style="margin:0">${notes}</ul>`
        : state.trend
        ? `<h5>Strong positive relationship (r = ${corr.toFixed(2)})</h5><p>Weeks with more ad spend tend to have higher sales. Correlation shows the two move together; it doesn't prove that ads cause the sales.</p>`
        : `<p>Look at the cloud of points. Do sales seem to rise with ad spend? Are any weeks out of place?</p>`;
    }

    $$(root, "[data-toggle]").forEach((b) =>
      b.addEventListener("click", () => {
        state[b.dataset.toggle] = !state[b.dataset.toggle];
        b.setAttribute("aria-pressed", String(state[b.dataset.toggle]));
        render();
      })
    );
    render();
  })();

  /* ------------------------------------------------------------
     4. Data cleaning sandbox
  ------------------------------------------------------------ */
  (function clean() {
    const root = document.getElementById("viz-clean");
    if (!root) return;
    const tbody = $(root, "tbody");
    const meter = $(root, ".meter");
    const stepBtns = $$(root, "[data-step]:not([data-step='reset'])");

    const RAW = [
      { id: "C101", name: "Asha Rao", city: "delhi", age: 34, spend: 12400 },
      { id: "C102", name: "Rahul Mehta", city: "Mumbai", age: null, spend: 8900 },
      { id: "C103", name: "Priya Singh", city: "DELHI", age: 29, spend: 15200 },
      { id: "C102", name: "Rahul Mehta", city: "Mumbai", age: null, spend: 8900, dup: true },
      { id: "C104", name: "Vikram Iyer", city: "Bengaluru", age: 240, spend: 9700 },
      { id: "C105", name: "Neha Gupta", city: "N/A", age: 41, spend: 11300 },
      { id: "C106", name: "Arjun Das", city: " mumbai ", age: 38, spend: null },
      { id: "C103", name: "Priya Singh", city: "DELHI", age: 29, spend: 15200, dup: true },
    ];
    const CANON = ["Delhi", "Mumbai", "Bengaluru", "Unknown"];
    const steps = { dedupe: false, standardize: false, impute: false, outlier: false };

    const median = (arr) => { const s = [...arr].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };
    const isMissingCity = (c) => c == null || c.trim() === "" || c.trim().toUpperCase() === "N/A";
    const validAge = (a) => a != null && a > 0 && a <= 110;

    function compute() {
      const rows = RAW.map((r) => ({ ...r, fixed: {}, removed: false }));
      if (steps.dedupe) rows.forEach((r) => (r.removed = !!r.dup));
      const live = rows.filter((r) => !r.removed);

      if (steps.standardize) live.forEach((r) => {
        if (!isMissingCity(r.city)) {
          const t = r.city.trim().toLowerCase();
          const c = t.charAt(0).toUpperCase() + t.slice(1);
          if (c !== r.city) { r.city = c; r.fixed.city = true; }
        }
      });
      const medAge = median(live.map((r) => r.age).filter(validAge));
      const medSpend = median(live.map((r) => r.spend).filter((v) => v != null));
      if (steps.outlier) live.forEach((r) => { if (r.age != null && !validAge(r.age)) { r.age = medAge; r.fixed.age = "outlier"; } });
      if (steps.impute) live.forEach((r) => {
        if (r.age == null) { r.age = medAge; r.fixed.age = true; }
        if (r.spend == null) { r.spend = medSpend; r.fixed.spend = true; }
        if (isMissingCity(r.city)) { r.city = "Unknown"; r.fixed.city = true; }
      });

      // quality scores
      const keys = live.map((r) => `${r.id}|${r.name}`);
      const uniq = new Set(keys).size / live.length;
      let filled = 0, total = 0;
      live.forEach((r) => { total += 3; filled += (!isMissingCity(r.city)) + (r.age != null) + (r.spend != null); });
      const cities = live.filter((r) => !isMissingCity(r.city));
      const consist = cities.filter((r) => CANON.includes(r.city)).length / (cities.length || 1);
      const ages = live.filter((r) => r.age != null);
      const valid = ages.filter((r) => validAge(r.age)).length / (ages.length || 1);
      return { rows, live, scores: { Uniqueness: uniq, Completeness: filled / total, Consistency: consist, Validity: valid } };
    }

    function cell(v, cls, fmt) {
      const txt = v == null ? "—" : fmt ? fmt(v) : v;
      return `<td class="${cls || ""}">${txt}</td>`;
    }

    function render() {
      const { rows, live, scores } = compute();
      tbody.innerHTML = rows.map((r) => {
        const cityBad = isMissingCity(r.city) || !CANON.includes(r.city);
        const ageBad = r.age == null || !validAge(r.age);
        const rowCls = r.removed ? "removed" : "";
        return `<tr class="${rowCls}">
          <td class="${r.dup && !r.removed ? "bad" : ""}">${r.id}</td>
          <td>${r.name}</td>
          ${cell(r.city === " mumbai " ? "&nbsp;mumbai&nbsp;" : r.city, r.removed ? "" : r.fixed.city ? "fixed" : cityBad ? "bad" : "")}
          ${cell(r.age, r.removed ? "" : r.fixed.age ? "fixed" : ageBad ? "bad" : "")}
          ${cell(r.spend, r.removed ? "" : r.fixed.spend ? "fixed" : r.spend == null ? "bad" : "", (v) => v.toLocaleString("en-IN"))}
        </tr>`;
      }).join("");

      const vals = Object.values(scores);
      const overall = vals.reduce((a, b) => a + b, 0) / vals.length;
      meter.innerHTML =
        Object.entries(scores).map(([k, v]) =>
          `<div class="meter-row"><span>${k}</span><div class="meter-track"><div class="meter-fill" style="width:${v * 100}%;background:${v >= 0.999 ? C.accent : v >= 0.8 ? C.amber : C.rose}"></div></div><b>${pct(v)}</b></div>`
        ).join("") +
        `<div class="meter-row"><span><b style="text-align:left">Overall</b></span><div class="meter-track"><div class="meter-fill" style="width:${overall * 100}%"></div></div><b>${pct(overall)}</b></div>
         <p style="margin:.4rem 0 0;font-size:.85rem;color:${C.soft}">${live.length} rows in the dataset${overall > 0.999 ? ". The data is ready for analysis." : ""}</p>`;
    }

    stepBtns.forEach((b) => b.addEventListener("click", () => {
      steps[b.dataset.step] = !steps[b.dataset.step];
      b.setAttribute("aria-pressed", String(steps[b.dataset.step]));
      render();
    }));
    $(root, "[data-step='reset']").addEventListener("click", () => {
      Object.keys(steps).forEach((k) => (steps[k] = false));
      stepBtns.forEach((b) => b.setAttribute("aria-pressed", "false"));
      render();
    });
    render();
  })();

  /* ------------------------------------------------------------
     5. Train / validation / test split
  ------------------------------------------------------------ */
  (function split() {
    const root = document.getElementById("viz-split");
    if (!root) return;
    const tr = $(root, '[data-in="train"]');
    const va = $(root, '[data-in="val"]');
    const grid = $(root, ".dot-grid");
    const out = $(root, ".viz-out");
    grid.innerHTML = "<span></span>".repeat(100);
    const dots = [...grid.children];

    function render(changed) {
      let t = +tr.value, v = +va.value;
      if (t + v > 95) { if (changed === tr) v = 95 - t; else t = 95 - v; tr.value = t; va.value = v; }
      const s = 100 - t - v;
      $(root, '[data-out="train"]').textContent = t + "%";
      $(root, '[data-out="val"]').textContent = v + "%";
      dots.forEach((d, i) => (d.style.background = i < t ? C.accent : i < t + v ? C.violet : C.amber));

      let msg;
      if (s < 10) msg = "The test set is very small, so the final performance estimate will be unreliable. Keep at least 10–15% for testing.";
      else if (v === 0) msg = "No validation set. That can work if you tune the model with cross-validation on the training data instead.";
      else if (t < 60) msg = "The model has less data to learn from, which can make it underfit. Large validation and test sets suit very big datasets.";
      else if (t === 70 && v === 15) msg = "A common starting point: 70% to learn from, 15% to tune the model, and 15% held back for the final, unbiased test.";
      else msg = "A workable split. The test set should stay untouched until the very end, so it gives an honest estimate of performance on new data.";
      out.innerHTML = `<h5>${t}% training, ${v}% validation, ${s}% test</h5><p>${msg}</p>`;
    }
    tr.addEventListener("input", () => render(tr));
    va.addEventListener("input", () => render(va));
    render();
  })();

  /* ------------------------------------------------------------
     6. Classification threshold and metrics
  ------------------------------------------------------------ */
  (function threshold() {
    const root = document.getElementById("viz-threshold");
    if (!root) return;
    const svg = $(root, "svg");
    const input = $(root, '[data-in="t"]');
    const out = $(root, ".viz-out");
    const r = rng(21);

    const items = [
      ...Array.from({ length: 12 }, () => ({ y: 1, p: Math.min(0.97, 0.32 + r() * 0.62) })),
      ...Array.from({ length: 28 }, () => ({ y: 0, p: Math.max(0.03, 0.04 + r() * 0.58) })),
    ];
    items.forEach((it) => (it.j = r()));

    const W = 640, H = 170, L = 20, Rm = 20;
    const X = (p) => L + p * (W - L - Rm);

    function render() {
      const t = +input.value / 100;
      $(root, '[data-out="t"]').textContent = t.toFixed(2);
      let tp = 0, fp = 0, fn = 0, tn = 0;
      items.forEach((it) => {
        const flag = it.p >= t;
        if (flag && it.y) tp++; else if (flag) fp++; else if (it.y) fn++; else tn++;
      });

      let g = `<rect x="${X(t)}" y="8" width="${X(1) - X(t)}" height="118" fill="${C.rose}" opacity="0.07" rx="6"/>`;
      g += `<text x="${X(t) + 8}" y="22" font-size="11" fill="${C.rose}" font-weight="700">Flagged as risky</text>`;
      g += `<line x1="${L}" x2="${W - Rm}" y1="67" y2="67" stroke="${C.grid}"/>`;
      items.forEach((it) => {
        const cy = it.y ? 30 + it.j * 30 : 78 + it.j * 40;
        g += `<circle cx="${X(it.p)}" cy="${cy}" r="6" fill="${it.y ? C.rose : C.accent}" fill-opacity=".85" stroke="#fff" stroke-width="1.5"/>`;
      });
      g += `<line x1="${X(t)}" x2="${X(t)}" y1="4" y2="132" stroke="${C.ink}" stroke-width="2"/>`;
      for (let v = 0; v <= 1.001; v += 0.25) g += `<text x="${X(v)}" y="150" font-size="11" fill="${C.soft}" text-anchor="middle">${v.toFixed(2)}</text>`;
      g += `<text x="${W / 2}" y="167" font-size="11" fill="${C.soft}" text-anchor="middle">Predicted probability of default</text>`;
      svg.innerHTML = g;

      const acc = (tp + tn) / items.length;
      const prec = tp + fp ? tp / (tp + fp) : 0;
      const rec = tp + fn ? tp / (tp + fn) : 0;
      const f1 = prec + rec ? (2 * prec * rec) / (prec + rec) : 0;
      $(root, '[data-stat="acc"]').textContent = pct(acc);
      $(root, '[data-stat="prec"]').textContent = pct(prec);
      $(root, '[data-stat="rec"]').textContent = pct(rec);
      $(root, '[data-stat="f1"]').textContent = f1.toFixed(2);

      const verdict = t < 0.35
        ? "A low threshold catches nearly every defaulter (high recall), but flags many good customers too (low precision)."
        : t > 0.65
        ? "A high threshold means almost every flag is correct (high precision), but many defaulters slip through (low recall)."
        : "A middle threshold balances the two. The right choice depends on which mistake costs the business more.";
      out.innerHTML = `<p><b>${tp}</b> defaulters caught, <b>${fn}</b> missed, <b>${fp}</b> good customers wrongly flagged, <b>${tn}</b> correctly cleared.</p><p>${verdict}</p>`;
    }
    input.addEventListener("input", render);
    render();
  })();
})();
