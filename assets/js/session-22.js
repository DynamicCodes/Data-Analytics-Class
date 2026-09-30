// Session 22 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b", sky: "#3a8dde" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const gauss = (r) => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const pct = (v, d = 1) => (v * 100).toFixed(d) + "%";
  const CONTRACTS = ["Monthly", "One year", "Two year"];

  /* the raw "CSV file" */
  const RAW = (() => {
    const r = rng(2222);
    return Array.from({ length: 400 }, (_, i) => {
      const ct = r() < 0.5 ? 0 : r() < 0.55 ? 1 : 2;
      const tenure = Math.max(1, Math.min(72, Math.round([12, 30, 45][ct] + gauss(r) * 12)));
      const monthly = Math.round(Math.max(300, Math.min(1200, 700 + gauss(r) * 180)));
      const calls = Math.max(0, Math.round(1.4 + gauss(r) * 1.3 + (r() < 0.15 ? 2 : 0)));
      const z = -0.9 + [1.4, 0, -1.3][ct] - 0.035 * tenure + 0.003 * (monthly - 700) + 0.35 * (calls - 1.5);
      return { id: "C" + String(1001 + i), tenure, monthly: r() < 0.08 ? null : monthly, calls, contract: CONTRACTS[ct], churn: r() < 1 / (1 + Math.exp(-z)) ? "Yes" : "No" };
    });
  })();
  const FEAT = (d) => [d.tenure, d.monthly, d.calls, CONTRACTS.indexOf(d.contract)];
  const FNAME = ["tenure", "monthly charges", "support calls", "contract"];

  /* models */
  function trainTree(rows, maxD) {
    const gini = (a) => { if (!a.length) return 0; const p = a.filter((d) => d.churn === "Yes").length / a.length; return 2 * p * (1 - p); };
    const cands = [0, 1, 2, 3].map((f) => { const v = [...new Set(rows.map((d) => FEAT(d)[f]))].sort((a, b) => a - b); if (v.length <= 20) return v.slice(1).map((x, i) => (x + v[i]) / 2); return Array.from({ length: 19 }, (_, i) => v[Math.floor(((i + 1) * v.length) / 20)]); });
    const build = (data, depth) => {
      const p = data.filter((d) => d.churn === "Yes").length / (data.length || 1), node = { p, n: data.length };
      if (depth >= maxD || data.length < 10 || p === 0 || p === 1) return node;
      let best = null;
      cands.forEach((ts, f) => ts.forEach((t) => { const L = data.filter((d) => FEAT(d)[f] < t), R = data.filter((d) => FEAT(d)[f] >= t); if (!L.length || !R.length) return; const s = (L.length * gini(L) + R.length * gini(R)) / data.length; if (!best || s < best.s) best = { f, t, s, L, R }; }));
      if (!best || best.s >= gini(data) - 1e-9) return node;
      return { ...node, f: best.f, t: best.t, left: build(best.L, depth + 1), right: build(best.R, depth + 1) };
    };
    const root = build(rows, 0);
    const prob = (d, nd = root) => (nd.left ? prob(d, FEAT(d)[nd.f] < nd.t ? nd.left : nd.right) : nd.p);
    const cond = (f, t, lt) => (f === 3 ? (lt ? (t < 1 ? "contract = Monthly" : "contract ≠ Two year") : t < 1 ? "contract ≠ Monthly" : "contract = Two year") : `${FNAME[f]} ${lt ? "<" : "≥"} ${Math.round(t * 10) / 10}`);
    const rules = []; const walk = (nd, path) => { if (!nd.left) { rules.push([path.join(" AND ") || "all customers", nd.p, nd.n]); return; } walk(nd.left, [...path, cond(nd.f, nd.t, true)]); walk(nd.right, [...path, cond(nd.f, nd.t, false)]); }; walk(root, []);
    return { kind: "tree", prob, rules, desc: `Decision tree, maximum depth ${maxD}, ${rules.length} leaves` };
  }
  function trainLogit(rows) {
    const X0 = rows.map((d) => [d.tenure, d.monthly, d.calls]), mu = [0, 1, 2].map((j) => mean(X0.map((x) => x[j]))), sd = [0, 1, 2].map((j) => Math.sqrt(mean(X0.map((x) => (x[j] - mu[j]) ** 2))) || 1);
    const enc = (d) => [1, (d.tenure - mu[0]) / sd[0], (d.monthly - mu[1]) / sd[1], (d.calls - mu[2]) / sd[2], d.contract === "One year" ? 1 : 0, d.contract === "Two year" ? 1 : 0];
    const X = rows.map(enc), y = rows.map((d) => (d.churn === "Yes" ? 1 : 0)), p = 6; let w = new Array(p).fill(0);
    for (let it = 0; it < 12; it++) { const g = new Array(p).fill(0), H = Array.from({ length: p }, () => new Array(p).fill(0)); X.forEach((x, i) => { const pr = 1 / (1 + Math.exp(-x.reduce((s, v, j) => s + v * w[j], 0))), s = pr * (1 - pr); for (let a = 0; a < p; a++) { g[a] += (y[i] - pr) * x[a]; for (let b = 0; b < p; b++) H[a][b] += s * x[a] * x[b] + (a === b ? 1e-6 : 0); } }); const M = H.map((r, i) => [...r, g[i]]); for (let c = 0; c < p; c++) { let q = c; for (let r2 = c + 1; r2 < p; r2++) if (Math.abs(M[r2][c]) > Math.abs(M[q][c])) q = r2; [M[c], M[q]] = [M[q], M[c]]; for (let r2 = 0; r2 < p; r2++) if (r2 !== c) { const f = M[r2][c] / M[c][c]; for (let k = c; k <= p; k++) M[r2][k] -= f * M[c][k]; } } w = w.map((v, i) => v + M[i][p] / M[i][i]); }
    return { kind: "logit", prob: (d) => 1 / (1 + Math.exp(-enc(d).reduce((s, v, j) => s + v * w[j], 0))), w, desc: "Logistic regression on standardized numeric features plus contract dummies" };
  }

  /* 1. Workflow simulator */
  (function knime() {
    const root = document.getElementById("viz-knime");
    if (!root) return;
    const cfg = $(root, "[data-config]"), svg = $(root, "svg"), out = $(root, "[data-output]");
    const S = { reader: "csv", prep: "none", part: "none", model: "tree", depth: 3, train: 70, score: "scorer", output: "bar" };
    const GOOD = { reader: "csv", prep: "mean", part: "part", model: "tree", depth: 3, train: 70, score: "scorer", output: "bar" };
    const OPTS = {
      reader: ["Data input", [["csv", "CSV Reader"], ["excel", "Excel Reader"]]],
      prep: ["Preparation", [["none", "(no node)"], ["mean", "Missing Value: fill with mean"], ["drop", "Missing Value: remove rows"]]],
      part: ["Split", [["none", "(no node)"], ["part", "Partitioning"]]],
      model: ["Model", [["tree", "Decision Tree Learner + Predictor"], ["logit", "Logistic Regression Learner + Predictor"]]],
      score: ["Evaluation", [["none", "(no node)"], ["scorer", "Scorer"]]],
      output: ["Output", [["none", "(no node)"], ["bar", "Bar Chart"], ["excel", "Excel Writer"]]],
    };
    let run = null, sel = null;
    function buildConfig() {
      cfg.innerHTML = `<div class="controls" style="gap:.6rem 1rem">${Object.entries(OPTS).map(([k, [lab, opts]]) => `<label style="display:grid;gap:.2rem;font-size:.85rem;font-weight:700;min-width:12rem;flex:1">${lab}<select class="num-input" data-k="${k}">${opts.map(([v, t]) => `<option value="${v}" ${S[k] === v ? "selected" : ""}>${t}</option>`).join("")}</select></label>`).join("")}</div><div class="controls"><label class="range">Partitioning: training share <span data-out="train">${S.train}%</span><input type="range" min="50" max="90" step="5" value="${S.train}" data-p="train" /></label><label class="range">Decision tree: maximum depth <span data-out="depth">${S.depth}</span><input type="range" min="1" max="8" value="${S.depth}" data-p="depth" /></label></div>`;
      $$(cfg, "select").forEach((el) => el.addEventListener("change", () => { S[el.dataset.k] = el.value; run = null; sel = null; draw(); }));
      $$(cfg, "[data-p]").forEach((el) => el.addEventListener("input", () => { S[el.dataset.p] = +el.value; $(cfg, `[data-out="${el.dataset.p}"]`).textContent = el.value + (el.dataset.p === "train" ? "%" : ""); run = null; sel = null; draw(); }));
    }
    const nodes = () => {
      const n = [{ id: "reader", label: S.reader === "csv" ? "CSV Reader" : "Excel Reader", cat: "io" }];
      if (S.prep !== "none") n.push({ id: "prep", label: "Missing Value", cat: "manip" });
      if (S.part !== "none") n.push({ id: "part", label: "Partitioning", cat: "manip" });
      n.push({ id: "learn", label: S.model === "tree" ? "Decision Tree Learner" : "Logistic Regr. Learner", cat: "model" });
      n.push({ id: "pred", label: S.model === "tree" ? "Decision Tree Predictor" : "Logistic Regr. Predictor", cat: "model" });
      if (S.score !== "none") n.push({ id: "score", label: "Scorer", cat: "eval" });
      if (S.output !== "none") n.push({ id: "out", label: S.output === "bar" ? "Bar Chart" : "Excel Writer", cat: S.output === "bar" ? "viz" : "io" });
      return n;
    };
    function execute() {
      const R = { status: {}, data: {}, msg: {} }, ok = (id, d, m) => { R.status[id] = "ok"; R.data[id] = d; R.msg[id] = m; }, fail = (id, m) => { R.status[id] = "fail"; R.msg[id] = m; };
      let table = RAW.map((d) => ({ ...d }));
      ok("reader", table, `Read ${table.length} rows × 6 columns from ${S.reader === "csv" ? "churn.csv" : "churn.xlsx"}. ${table.filter((d) => d.monthly === null).length} rows have a missing monthly charge ("?").`);
      if (S.prep !== "none") {
        const miss = table.filter((d) => d.monthly === null).length;
        if (S.prep === "mean") { const m = Math.round(mean(table.filter((d) => d.monthly !== null).map((d) => d.monthly))); table = table.map((d) => (d.monthly === null ? { ...d, monthly: m, filled: true } : d)); ok("prep", table, `Replaced ${miss} missing monthly charges with the column mean (₹${m}). ${table.length} rows remain.`); }
        else { table = table.filter((d) => d.monthly !== null); ok("prep", table, `Removed ${miss} rows with missing values. ${table.length} rows remain.`); }
      }
      let train = table, test = table;
      if (S.part !== "none") { const r = rng(7), idx = table.map((_, i) => i).sort(() => r() - 0.5), cut = Math.round((table.length * S.train) / 100); train = idx.slice(0, cut).map((i) => table[i]); test = idx.slice(cut).map((i) => table[i]); ok("part", { train, test }, `Random split: ${train.length} rows to the top port (training), ${test.length} to the bottom port (test).`); }
      if (train.some((d) => d.monthly === null)) { fail("learn", `Execution failed: input table contains missing values in column "monthly charges". Add a Missing Value node before the learner.`); return R; }
      const model = S.model === "tree" ? trainTree(train, S.depth) : trainLogit(train);
      ok("learn", model, `Trained on ${train.length} rows. ${model.desc}.`);
      const scored = test.map((d) => { const p = model.prob(d); return { ...d, prob: p, pred: p >= 0.5 ? "Yes" : "No" }; });
      ok("pred", scored, `Applied the model to ${scored.length} ${S.part !== "none" ? "test" : "training"} rows, adding "Prediction (churn)" and "P(churn=Yes)" columns.`);
      if (S.score !== "none") {
        const k = { tp: 0, fp: 0, fn: 0, tn: 0 }; scored.forEach((d) => { if (d.churn === "Yes") d.pred === "Yes" ? k.tp++ : k.fn++; else d.pred === "Yes" ? k.fp++ : k.tn++; });
        const acc = (k.tp + k.tn) / scored.length, base = Math.max(scored.filter((d) => d.churn === "Yes").length, scored.filter((d) => d.churn === "No").length) / scored.length;
        R.status.score = S.part === "none" ? "warn" : "ok"; R.data.score = { k, acc, base, n: scored.length }; R.msg.score = S.part === "none" ? "Executed, but on the same rows the model was trained on: this accuracy is optimistic." : `Accuracy ${pct(acc)} on ${scored.length} unseen test rows.`;
      }
      if (S.output !== "none") {
        if (S.output === "bar") ok("out", scored, "Bar chart of predicted churn rate by contract type.");
        else ok("out", scored, `Wrote ${scored.length} scored rows to churn_scored.xlsx (simulated).`);
      }
      return R;
    }
    function draw() {
      const N = nodes(), W = 640, gap = W / N.length, bw = Math.min(78, gap - 12), y = 40, bh = 52;
      const col = { io: C.amber, manip: C.sky, model: C.violet, eval: C.accent, viz: C.rose };
      let g = "";
      N.forEach((nd, i) => {
        const x = gap * i + gap / 2;
        if (i) { const px = gap * (i - 1) + gap / 2, model = nd.id === "pred"; g += `<line x1="${px + bw / 2}" y1="${y + bh / 2 + (model ? -12 : 8)}" x2="${x - bw / 2}" y2="${y + bh / 2 + (model ? -12 : 8)}" stroke="${model ? C.violet : C.ink}" stroke-width="2"/>`; if (model && S.part !== "none") { const pi = N.findIndex((q) => q.id === "part"), ppx = gap * pi + gap / 2; g += `<path d="M${ppx + bw / 2},${y + bh / 2 + 14} C${ppx + bw / 2 + 30},${y + bh + 40} ${x - bw / 2 - 30},${y + bh + 40} ${x - bw / 2},${y + bh / 2 + 14}" fill="none" stroke="${C.ink}" stroke-width="2"/>` + txt((ppx + x) / 2, y + bh + 36, "test data", { anchor: "middle", size: 9.5 }); } }
        const st = run ? run.status[nd.id] : null, light = st === "ok" ? "#2fa84f" : st === "fail" ? C.rose : st === "warn" ? C.amber : "#e0b400", on = sel === nd.id;
        g += `<g data-node="${nd.id}" style="cursor:${run && st ? "pointer" : "default"}"><rect x="${x - bw / 2}" y="${y}" width="${bw}" height="${bh}" rx="8" fill="${col[nd.cat]}" opacity="${on ? 1 : 0.85}" stroke="${on ? C.ink : "none"}" stroke-width="3"/>`;
        if (i) g += `<polygon points="${x - bw / 2},${y + bh / 2} ${x - bw / 2 + 7},${y + bh / 2 + 4 + 4} ${x - bw / 2},${y + bh / 2 + 16}" fill="${C.ink}"/>`;
        if (nd.id === "pred") g += `<rect x="${x - bw / 2 - 1}" y="${y + bh / 2 - 17}" width="8" height="8" fill="${C.violet}" stroke="#fff"/>`;
        if (nd.id === "learn") g += `<rect x="${x + bw / 2 - 7}" y="${y + bh / 2 - 17}" width="8" height="8" fill="${C.violet}" stroke="#fff"/>`;
        const words = nd.label.split(" "), lines = []; let cur = ""; words.forEach((w) => { if ((cur + " " + w).trim().length > 11) { lines.push(cur.trim()); cur = w; } else cur += " " + w; }); lines.push(cur.trim());
        lines.slice(0, 3).forEach((l, k) => (g += txt(x, y + 16 + k * 12 - (lines.length - 1) * 2, l, { anchor: "middle", fill: "#fff", bold: 1, size: 9.5 })));
        g += `<rect x="${x - 16}" y="${y + bh + 6}" width="32" height="10" rx="5" fill="#fff" stroke="${C.line}"/><circle cx="${x - 9}" cy="${y + bh + 11}" r="3.5" fill="${st === "fail" ? C.rose : C.line}"/><circle cx="${x}" cy="${y + bh + 11}" r="3.5" fill="${!st ? "#e0b400" : st === "warn" ? C.amber : C.line}"/><circle cx="${x + 9}" cy="${y + bh + 11}" r="3.5" fill="${st === "ok" ? "#2fa84f" : C.line}"/></g>`;
      });
      g += txt(10, 16, run ? "Executed. Click a node to inspect its output." : "Configured (yellow lights). Click Execute all.", { fill: C.ink, bold: 1, size: 11 });
      svg.innerHTML = g;
      showOutput();
    }
    function table(rows, cols) { return `<div class="table-wrap"><table><thead><tr>${cols.map((c) => `<th>${c[0]}</th>`).join("")}</tr></thead><tbody>${rows.slice(0, 6).map((d) => `<tr>${cols.map((c) => `<td>${c[1](d)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p class="tree-note" style="margin:.3rem 0 0">Showing 6 of ${rows.length} rows.</p>`; }
    const baseCols = [["ID", (d) => d.id], ["Tenure", (d) => d.tenure], ["Monthly (₹)", (d) => (d.monthly === null ? '<b style="color:#d94f70">?</b>' : d.filled ? `<b style="color:#0e8c7f">${d.monthly}</b>` : d.monthly)], ["Calls", (d) => d.calls], ["Contract", (d) => d.contract], ["Churn", (d) => d.churn]];
    function showOutput() {
      if (!run) { out.innerHTML = `<p>${S.prep === "none" ? "Tip: this workflow has no Missing Value node; see what happens when you execute it." : S.part === "none" ? "Tip: without a Partitioning node, the Scorer will evaluate on the training data." : "Ready to run."}</p>`; return; }
      const failed = Object.entries(run.status).find(([, s]) => s === "fail");
      const id = sel || (failed ? failed[0] : run.status.score ? "score" : "pred"), st = run.status[id], d = run.data[id];
      let h = `<h5>${nodes().find((n) => n.id === id)?.label || ""} — ${st === "ok" ? "executed" : st === "warn" ? "executed with a warning" : st === "fail" ? "failed" : "not executed"}</h5><p>${run.msg[id] || "This node didn't run because an upstream node failed."}</p>`;
      if (st === "ok" || st === "warn") {
        if (id === "reader" || id === "prep") h += table(id === "prep" && S.prep === "mean" ? [...d.filter((r) => r.filled), ...d] : d.filter((r, i) => r.monthly === null || i < 3), baseCols);
        if (id === "part") h += `<p>Training: ${d.train.length} rows (${pct(d.train.filter((r) => r.churn === "Yes").length / d.train.length)} churn). Test: ${d.test.length} rows (${pct(d.test.filter((r) => r.churn === "Yes").length / d.test.length)} churn).</p>`;
        if (id === "learn") h += d.kind === "tree" ? `<div class="table-wrap"><table><thead><tr><th>Rule (leaf)</th><th>P(churn)</th><th>Rows</th></tr></thead><tbody>${d.rules.slice(0, 8).map(([r, p, n]) => `<tr><td>${r}</td><td>${pct(p, 0)}</td><td>${n}</td></tr>`).join("")}</tbody></table></div>${d.rules.length > 8 ? `<p class="tree-note">…and ${d.rules.length - 8} more leaves.</p>` : ""}` : `<div class="table-wrap"><table><thead><tr><th>Term</th><th>Coefficient</th></tr></thead><tbody>${["Intercept", "Tenure (std.)", "Monthly charges (std.)", "Support calls (std.)", "Contract: One year", "Contract: Two year"].map((t, i) => `<tr><td>${t}</td><td>${d.w[i].toFixed(3)}</td></tr>`).join("")}</tbody></table></div>`;
        if (id === "pred") h += table(d, [...baseCols.slice(0, 1), ...baseCols.slice(4), ["Prediction", (r) => `<b>${r.pred}</b>`], ["P(churn=Yes)", (r) => r.prob.toFixed(3)]]);
        if (id === "score") h += `<div class="table-wrap"><table class="error-grid"><thead><tr><th></th><th>Predicted Yes</th><th>Predicted No</th></tr></thead><tbody><tr><th>Actual Yes</th><td class="good">${d.k.tp}</td><td class="bad">${d.k.fn}</td></tr><tr><th>Actual No</th><td class="bad">${d.k.fp}</td><td class="good">${d.k.tn}</td></tr></tbody></table></div><p><b>Accuracy ${pct(d.acc)}</b> vs. ${pct(d.base)} for always predicting the majority class (the baseline). Recall ${pct(d.k.tp / (d.k.tp + d.k.fn || 1))}, precision ${pct(d.k.tp / (d.k.tp + d.k.fp || 1))}.${st === "warn" ? " Add a Partitioning node to get an honest estimate." : ""}${S.model === "tree" && S.depth >= 6 && S.part !== "none" ? " A deep tree may be overfitting: compare with depth 3." : ""}</p>`;
        if (id === "out" && S.output === "bar") { const rates = CONTRACTS.map((c) => { const g2 = d.filter((r) => r.contract === c); return [c, g2.length ? g2.filter((r) => r.pred === "Yes").length / g2.length : 0, g2.length]; }); h += `<svg viewBox="0 0 600 120" style="max-width:600px">${rates.map(([c, v, n], i) => `<text x="110" y="${28 + i * 34}" font-size="12" text-anchor="end" fill="${C.ink}" font-weight="700">${c}</text><rect x="120" y="${14 + i * 34}" width="400" height="20" rx="6" fill="${C.grid}"/><rect x="120" y="${14 + i * 34}" width="${400 * v}" height="20" rx="6" fill="${C.rose}"/><text x="${128 + 400 * v}" y="${29 + i * 34}" font-size="11" fill="${C.ink}">${pct(v, 0)} predicted to churn (${n} customers)</text>`).join("")}</svg>`; }
      }
      out.innerHTML = h;
    }
    svg.addEventListener("click", (e) => { const n = e.target.closest("[data-node]"); if (!n || !run) return; sel = n.dataset.node; draw(); });
    $(root, "[data-exec]").addEventListener("click", () => { run = execute(); sel = null; draw(); });
    $(root, "[data-good]").addEventListener("click", () => { Object.assign(S, GOOD); run = null; sel = null; buildConfig(); draw(); });
    buildConfig(); draw();
  })();

  /* 2. Which node quiz */
  (function quiz() {
    const root = document.getElementById("viz-quiz");
    if (!root) return;
    const box = $(root, "[data-quiz]"), score = $(root, "[data-score]");
    const Q = [
      ["Load last month's sales from a .csv file.", ["CSV Reader", "Excel Writer", "Joiner", "Scorer"], 0, "Reader nodes bring data into a workflow; CSV Reader handles comma-separated files."],
      ["Fill in blank age values with the median age.", ["Row Filter", "Missing Value", "Normalizer", "Partitioning"], 1, "Missing Value lets you choose a strategy per column: mean, median, a fixed value, or removing the row."],
      ["Keep only customers from Maharashtra.", ["Column Filter", "Row Filter", "GroupBy", "Sorter"], 1, "Row Filter keeps or drops rows by a condition; Column Filter removes columns."],
      ["Combine the customer table with the orders table on customer ID.", ["Concatenate", "Joiner", "Pivot", "Row Filter"], 1, "Joiner matches rows from two tables on a key column, like a SQL join; Concatenate just stacks tables."],
      ["Split data into 70% training and 30% test.", ["Partitioning", "Row Sampling", "Scorer", "Cross Validation"], 0, "Partitioning outputs two tables: the training share on the top port and the rest on the bottom port."],
      ["Compare predictions with actual labels to get accuracy and a confusion matrix.", ["Scorer", "Bar Chart", "Statistics", "Predictor"], 0, "Scorer compares two columns and reports the confusion matrix, accuracy and other metrics."],
    ];
    const ans = {};
    function render() {
      box.innerHTML = Q.map(([q, opts, c, why], i) => `<div class="quiz-q viz-out" style="margin:0 0 .6rem"><p style="margin:0"><b>${i + 1}.</b> ${q}</p><div class="controls">${opts.map((t, k) => `<button class="btn${ans[i] === undefined ? "" : k === c ? " right" : k === ans[i] ? " wrong" : ""}" data-q="${i}" data-k="${k}" ${ans[i] !== undefined ? "disabled" : ""}>${t}</button>`).join("")}</div>${ans[i] !== undefined ? `<p style="margin:.5rem 0 0">${ans[i] === c ? "✓ Correct." : "✗ Not quite."} ${why}</p>` : ""}</div>`).join("");
      const done = Object.keys(ans).length, right = Object.entries(ans).filter(([i, k]) => Q[i][2] === k).length;
      score.innerHTML = done ? `Score: ${right} of ${done}${done === Q.length ? ` &nbsp;<button class="btn ghost" data-reset>Try again</button>` : ""}` : "";
    }
    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-reset]")) { Object.keys(ans).forEach((k) => delete ans[k]); render(); return; }
      const b = e.target.closest("[data-q]"); if (!b || b.disabled) return;
      ans[+b.dataset.q] = +b.dataset.k; render();
    });
    render();
  })();
})();
