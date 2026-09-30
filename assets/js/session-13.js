// Session 13 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b", sky: "#3a8dde" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const gauss = (r) => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const log2 = (x) => Math.log(x) / Math.LN2;
  const Hb = (y, n) => { if (!n || !y || y === n) return 0; const p = y / n; return -(p * log2(p) + (1 - p) * log2(1 - p)); };
  const corr = (x, y) => { const mx = mean(x), my = mean(y); let a = 0, b = 0, c = 0; x.forEach((v, i) => { a += (v - mx) * (y[i] - my); b += (v - mx) ** 2; c += (y[i] - my) ** 2; }); return b && c ? a / Math.sqrt(b * c) : 0; };
  const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const yy = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? yy : -yy; };
  const pct = (v) => Math.round(v * 100) + "%";
  const riskCol = (p) => { const t = Math.min(1, p / 0.7); return `rgb(${Math.round(217 * t + 14 * (1 - t))},${Math.round(79 * t + 140 * (1 - t))},${Math.round(112 * t + 127 * (1 - t))})`; };

  /* 1. Supervised vs unsupervised */
  (function supUnsup() {
    const root = document.getElementById("viz-supunsup");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), tbl = $(root, "[data-seg]"), mB = $$(root, "[data-m]");
    const r = rng(31);
    const pts = Array.from({ length: 300 }, (_, i) => {
      const u = [12, 32, 50][i % 3] + gauss(r) * 5, s = 1 + r() * 9;
      const p = s >= 5 ? 0.06 : u >= 25 ? 0.3 : 0.72;
      return { u: Math.max(1, Math.min(62, u)), s, churn: r() < p };
    });
    const mu = mean(pts.map((p) => p.u)), su = Math.sqrt(mean(pts.map((p) => (p.u - mu) ** 2))), ms = mean(pts.map((p) => p.s)), ss = Math.sqrt(mean(pts.map((p) => (p.s - ms) ** 2)));
    const z = pts.map((p) => [(p.u - mu) / su, (p.s - ms) / ss]);
    let cents = [z[0], z[1], z[2]], lab = [];
    for (let it = 0; it < 25; it++) { lab = z.map((q) => { let b = 0, bd = 1e9; cents.forEach((c, j) => { const d = (q[0] - c[0]) ** 2; if (d < bd) { bd = d; b = j; } }); return b; }); cents = cents.map((c, j) => { const m = z.filter((_, i) => lab[i] === j); return m.length ? [mean(m.map((q) => q[0])), mean(m.map((q) => q[1]))] : c; }); }
    const ordK = [0, 1, 2].sort((a, b) => cents[a][0] - cents[b][0]);
    const kName = ["Light users", "Medium users", "Heavy users"];
    const supLab = (p) => (p.s >= 5 ? 0 : p.u >= 25 ? 1 : 2);
    const supName = ["A: satisfied", "B: unhappy, high usage", "C: unhappy, low usage"];
    const SEGC = [C.accent, C.amber, C.violet];
    let m = "none";
    function render() {
      const W = 640, H = 300, L = 46, Rt = 16, T = 16, B = 36, X = (v) => L + (v / 64) * (W - L - Rt), Y = (v) => T + (1 - v / 10) * (H - T - B);
      let g = "";
      for (let v = 0; v <= 10; v += 2) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
      for (let v = 0; v <= 60; v += 10) g += txt(X(v), H - 18, v, { anchor: "middle" });
      g += txt((W + L) / 2, H - 2, "Monthly usage (hours)", { anchor: "middle" }) + txt(L - 40, T - 4, "Satisfaction");
      if (m === "sup") {
        g += `<rect x="${X(0)}" y="${Y(10)}" width="${X(64) - X(0)}" height="${Y(5) - Y(10)}" fill="${SEGC[0]}" opacity=".08"/><rect x="${X(25)}" y="${Y(5)}" width="${X(64) - X(25)}" height="${Y(0) - Y(5)}" fill="${SEGC[1]}" opacity=".1"/><rect x="${X(0)}" y="${Y(5)}" width="${X(25) - X(0)}" height="${Y(0) - Y(5)}" fill="${SEGC[2]}" opacity=".1"/>`;
        g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(5)}" y2="${Y(5)}" stroke="${C.ink}" stroke-width="2"/><line x1="${X(25)}" x2="${X(25)}" y1="${Y(5)}" y2="${Y(0)}" stroke="${C.ink}" stroke-width="2"/>`;
        g += txt(W - Rt - 6, Y(9.4), "A", { anchor: "end", fill: SEGC[0], bold: 1, size: 16 }) + txt(W - Rt - 6, Y(0.4), "B", { anchor: "end", fill: SEGC[1], bold: 1, size: 16 }) + txt(X(1), Y(0.4), "C", { fill: SEGC[2], bold: 1, size: 16 });
      }
      pts.forEach((p, i) => {
        const seg = m === "unsup" ? ordK.indexOf(lab[i]) : m === "sup" ? supLab(p) : -1;
        const stroke = seg >= 0 ? SEGC[seg] : "#fff";
        g += p.churn ? `<circle cx="${X(p.u)}" cy="${Y(p.s)}" r="4.5" fill="${C.rose}" stroke="${stroke}" stroke-width="${seg >= 0 ? 2 : 1}"/>` : `<circle cx="${X(p.u)}" cy="${Y(p.s)}" r="4.5" fill="${seg >= 0 ? SEGC[seg] : C.light}" fill-opacity="${seg >= 0 ? 0.35 : 0.8}" stroke="${stroke}" stroke-width="${seg >= 0 ? 1.5 : 1}"/>`;
      });
      svg.innerHTML = g;
      const overall = pts.filter((p) => p.churn).length / 300;
      if (m === "none") { tbl.innerHTML = ""; out.innerHTML = `<p>Overall churn is ${pct(overall)}. Customers naturally form three usage groups, but churners (rose) are concentrated among low-satisfaction customers.</p>`; return; }
      const segOf = (p, i) => (m === "unsup" ? ordK.indexOf(lab[i]) : supLab(p));
      const names = m === "unsup" ? kName : supName;
      const rows = [0, 1, 2].map((s) => { const mem = pts.filter((p, i) => segOf(p, i) === s); const c = mem.filter((p) => p.churn).length; return [names[s], mem.length, mem.length ? c / mem.length : 0]; });
      tbl.innerHTML = `<thead><tr><th>Segment</th><th>Customers</th><th>Churn rate</th><th></th></tr></thead><tbody>${rows.map(([n, k, cr], s) => `<tr><td><b style="color:${SEGC[s]}">${n}</b></td><td>${k}</td><td>${pct(cr)}</td><td><span style="display:inline-block;height:10px;width:${cr * 200}px;background:${riskCol(cr)};border-radius:99px"></span></td></tr>`).join("")}</tbody>`;
      const rates = rows.map((q) => q[2]), spread = Math.max(...rates) - Math.min(...rates);
      out.innerHTML = m === "unsup"
        ? `<p>K-means finds the natural light, medium and heavy usage groups, but it never looks at churn, so the clusters separate churn risk much less well: their churn rates are only ${Math.round(spread * 100)} points apart. Switch to the supervised view to compare. Useful for describing customers, not for targeting retention.</p>`
        : `<p>Guided by churn, the rules split first on satisfaction, then on usage. Churn rates now range from ${pct(Math.min(...rates))} to ${pct(Math.max(...rates))}: segment C is where retention effort should go. That's supervised segmentation.</p>`;
    }
    mB.forEach((b) => b.addEventListener("click", () => { m = b.dataset.m; press(mB, b); render(); }));
    render();
  })();

  /* 2. Probability bands + gains chart */
  (function bands() {
    const root = document.getElementById("viz-bands");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), c1In = $(root, '[data-in="c1"]'), c2In = $(root, '[data-in="c2"]');
    const r = rng(58);
    const cust = Array.from({ length: 1000 }, () => { const z = -1.6 + gauss(r) * 1.2; const p = 1 / (1 + Math.exp(-z)); return { p, y: r() < p }; }).sort((a, b) => b.p - a.p);
    const totalY = cust.filter((c) => c.y).length, base = totalY / 1000;
    function render(ch) {
      let c1 = +c1In.value / 100, c2 = +c2In.value / 100;
      if (c1 >= c2) { if (ch === c1In) c2 = Math.min(0.95, c1 + 0.05); else c1 = Math.max(0.05, c2 - 0.05); c1In.value = Math.round(c1 * 100); c2In.value = Math.round(c2 * 100); }
      $(root, '[data-out="c1"]').textContent = c1.toFixed(2); $(root, '[data-out="c2"]').textContent = c2.toFixed(2);
      const segs = [["High", (c) => c.p >= c2, C.rose], ["Medium", (c) => c.p >= c1 && c.p < c2, C.amber], ["Low", (c) => c.p < c1, C.accent]].map(([n, f, col]) => { const m = cust.filter(f); return { n, col, size: m.length, rate: m.length ? m.filter((c) => c.y).length / m.length : 0, caught: m.filter((c) => c.y).length }; });
      let g = txt(16, 18, "Actual churn rate by segment", { fill: C.ink, bold: 1 });
      const bx = 16, bw = 240;
      segs.forEach((s, i) => { const y = 40 + i * 62; g += txt(bx, y + 4, `${s.n} risk · ${s.size} customers`, { fill: C.ink, bold: 1 }) + `<rect x="${bx}" y="${y + 12}" width="${bw}" height="16" rx="8" fill="${C.grid}"/><rect x="${bx}" y="${y + 12}" width="${Math.max(3, s.rate * bw)}" height="16" rx="8" fill="${s.col}"/>` + txt(bx + Math.max(3, s.rate * bw) + 6, y + 25, `${pct(s.rate)} (lift ${(s.rate / base).toFixed(1)}×)`, { fill: C.ink, size: 10.5 }); });
      g += txt(bx, 232, `Overall churn: ${pct(base)}`, { size: 10.5 });
      const L = 350, Rt = 624, T = 24, B = 222, X = (v) => L + v * (Rt - L), Y = (v) => B - v * (B - T);
      g += txt(L, 14, "Cumulative gains", { fill: C.ink, bold: 1 });
      for (let v = 0; v <= 1.001; v += 0.25) g += `<line x1="${L}" x2="${Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 6, Y(v) + 4, pct(v), { anchor: "end", size: 10 }) + txt(X(v), B + 14, pct(v), { anchor: "middle", size: 10 });
      g += txt((L + Rt) / 2, B + 30, "Share of customers targeted (riskiest first)", { anchor: "middle", size: 10 });
      let cum = 0; const pts = [[0, 0]]; cust.forEach((c, i) => { if (c.y) cum++; if (i % 10 === 9) pts.push([(i + 1) / 1000, cum / totalY]); });
      g += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(1)}" stroke="${C.soft}" stroke-dasharray="5 4"/>` + txt(X(0.66), Y(0.56), "random", { size: 10 });
      g += `<polyline points="${pts.map(([a, b]) => `${X(a)},${Y(b)}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/>`;
      const hiShare = segs[0].size / 1000, hiCap = segs[0].caught / totalY, mdShare = (segs[0].size + segs[1].size) / 1000, mdCap = (segs[0].caught + segs[1].caught) / totalY;
      g += `<circle cx="${X(hiShare)}" cy="${Y(hiCap)}" r="6" fill="${C.rose}"/><circle cx="${X(mdShare)}" cy="${Y(mdCap)}" r="6" fill="${C.amber}"/>`;
      svg.innerHTML = g;
      out.innerHTML = `<p>Targeting only the <b>High</b> segment (${pct(hiShare)} of customers) reaches <b>${pct(hiCap)}</b> of all churners; adding Medium (${pct(mdShare)} of customers) reaches ${pct(mdCap)}. The further the gains curve bows above the diagonal, the better the model separates churners from loyal customers. Lift compares each segment's churn rate with the ${pct(base)} average.</p>`;
    }
    [c1In, c2In].forEach((el) => el.addEventListener("input", () => render(el)));
    render();
  })();

  /* 3. Attribute audit */
  (function audit() {
    const root = document.getElementById("viz-audit");
    if (!root) return;
    const tbl = $(root, "[data-audit]"), info = $(root, "[data-stepinfo]"), dots = $(root, ".step-dots");
    const back = $(root, '[data-dir="-1"]'), next = $(root, '[data-dir="1"]');
    const r = rng(77), n = 800;
    const rows = Array.from({ length: n }, (_, i) => {
      const income = Math.max(15, 55 + gauss(r) * 22), credit = Math.round(Math.max(420, Math.min(850, 690 + gauss(r) * 70))), dti = Math.max(0.05, 0.32 + gauss(r) * 0.12), age = Math.round(22 + r() * 45), loans = Math.max(0, Math.round(1 + gauss(r) * 1.1));
      const z = -2.2 - 0.02 * (income - 55) - 0.012 * (credit - 690) + 4.5 * (dti - 0.32) + 0.5 * (loans - 1) - 0.03 * (age - 45);
      return { id: 100000 + i, country: "India", income, credit, dti, age, ysb: age, purpose: Math.floor(r() * 9), survey: r() < 0.92 ? null : Math.floor(r() * 5), loans, def: r() < 1 / (1 + Math.exp(-z)) ? 1 : 0 };
    });
    const y = rows.map((d) => d.def);
    const ig = (vals) => { const ok = vals.map((v, i) => [v, y[i]]).filter(([v]) => v !== null); const s = ok.map((q) => q[0]).sort((a, b) => a - b); const cut = [0.25, 0.5, 0.75].map((p) => s[Math.floor(p * (s.length - 1))]); const bins = [[], [], [], []]; ok.forEach(([v, t]) => bins[v <= cut[0] ? 0 : v <= cut[1] ? 1 : v <= cut[2] ? 2 : 3].push(t)); const tot = ok.length, yy = ok.filter((q) => q[1]).length; return Hb(yy, tot) - bins.reduce((a, b) => a + (b.length / tot) * Hb(b.filter(Boolean).length, b.length), 0); };
    const A = [
      ["id", "Applicant ID", "Numeric (identifier)"], ["country", "Country", "Categorical"], ["income", "Income (₹000)", "Numeric"], ["credit", "Credit score", "Numeric"], ["dti", "Debt-to-income ratio", "Numeric"], ["age", "Age", "Numeric"], ["ysb", "Years since birth", "Numeric"], ["purpose", "Loan purpose code", "Categorical code"], ["survey", "Survey rating", "Numeric"], ["loans", "Existing loans", "Numeric"],
    ].map(([k, name, type]) => {
      const vals = rows.map((d) => d[k]);
      const miss = vals.filter((v) => v === null).length / n, distinct = new Set(vals.filter((v) => v !== null)).size;
      const ok = rows.filter((d) => d[k] !== null && typeof d[k] === "number");
      const rr = distinct > 1 && ok.length ? corr(ok.map((d) => d[k]), ok.map((d) => d.def)) : 0;
      const t = rr * Math.sqrt((ok.length - 2) / (1 - rr * rr)), p = distinct > 1 ? 2 * (1 - 0.5 * (1 + erf(Math.abs(t) / Math.SQRT2))) : 1;
      return { k, name, type, miss, distinct, r: rr, p, ig: distinct > 1 && typeof vals.find((v) => v !== null) === "number" ? ig(vals) : 0 };
    });
    const STEPS = [
      ["Understand the data", "Ten candidate attributes and their types. The target is loan default (yes/no), which affects about " + pct(mean(y)) + " of applicants.", {}],
      ["Clean: sparse and constant attributes", "Survey rating is missing for over 90% of applicants (sparse), and Country has the same value for everyone (constant). Neither can help a model.", { survey: "Sparse", country: "Constant" }],
      ["Filter: test each attribute against default", "Correlation tests flag attributes with no significant relationship to default (p ≥ 0.05): " + A.filter((a) => a.p >= 0.05 && !["survey", "country"].includes(a.k)).map((a) => a.name).join(", ") + ". Applicant ID and loan purpose code are just labels, so this is expected.", Object.fromEntries(A.filter((a) => a.p >= 0.05 && !["survey", "country"].includes(a.k)).map((a) => [a.k, "Irrelevant"]))],
      ["Remove redundancy", `Years since birth is identical to Age (r = ${corr(rows.map((d) => d.age), rows.map((d) => d.ysb)).toFixed(2)}): it adds no new information, so it is removed.`, { ysb: "Redundant" }],
      ["Validate with model-based importance", "Information gain, as a decision tree would measure it, confirms the ranking among what's left. Attributes marked weak add very little; a lean model could drop them.", {}],
      ["Retain the top predictors", "Keep the attributes marked Keep. Reassess regularly, because informative attributes can change as data and behavior evolve.", {}],
    ];
    let step = 0;
    dots.innerHTML = "<span></span>".repeat(STEPS.length);
    function render() {
      const removed = {};
      for (let s = 0; s <= step; s++) Object.assign(removed, STEPS[s][2]);
      const showStats = step >= 2, showIG = step >= 4;
      const order = step >= 4 ? [...A].sort((a, b) => (removed[a.k] ? 1 : 0) - (removed[b.k] ? 1 : 0) || b.ig - a.ig) : A;
      tbl.innerHTML = `<thead><tr><th>Attribute</th>${showStats ? "" : "<th>Type</th>"}<th>Missing</th><th>Distinct</th>${showStats ? "<th>r with default</th><th>p-value</th>" : ""}${showIG ? "<th>Info gain</th>" : ""}<th>Status</th></tr></thead><tbody>${order.map((a) => { const rm = removed[a.k], weak = step >= 4 && !rm && a.ig < 0.01; return `<tr style="${rm ? "opacity:.45" : ""}"><td><b>${a.name}</b></td>${showStats ? "" : `<td>${a.type}</td>`}<td>${pct(a.miss)}</td><td>${a.distinct.toLocaleString("en-IN")}</td>${showStats ? `<td>${a.distinct > 1 ? a.r.toFixed(3) : "–"}</td><td>${a.distinct > 1 ? (a.p < 0.001 ? "< 0.001" : a.p.toFixed(3)) : "–"}</td>` : ""}${showIG ? `<td>${rm ? "–" : a.ig.toFixed(4)}</td>` : ""}<td>${rm ? `<span class="flag" style="background:#fde7ec;color:#a3203f">${rm}</span>` : weak ? `<span class="flag" style="background:#fdf0dc;color:#8a5a06">Weak</span>` : step === 0 ? "" : `<span class="flag on">Keep</span>`}</td></tr>`; }).join("")}</tbody>`;
      info.innerHTML = `<h5>Step ${step + 1}: ${STEPS[step][0]}</h5><p>${STEPS[step][1]}</p>`;
      [...dots.children].forEach((d, k) => d.classList.toggle("is-on", k <= step));
      back.disabled = step === 0; next.disabled = step === STEPS.length - 1;
    }
    back.addEventListener("click", () => { if (step) { step--; render(); } });
    next.addEventListener("click", () => { if (step < STEPS.length - 1) { step++; render(); } });
    render();
  })();

  /* 4. Progressive segmentation builder */
  (function grow() {
    const root = document.getElementById("viz-grow");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), choices = $(root, "[data-choices]");
    const r = rng(404);
    const D = Array.from({ length: 600 }, () => {
      const sat = r() < 0.55 ? "High" : "Low", use = r() < 0.5 ? "High" : "Low", tix = r() < 0.4 ? "Frequent" : "Few", reg = ["North", "South", "East", "West"][Math.floor(r() * 4)];
      const p = sat === "High" ? 0.07 : use === "High" ? 0.28 : tix === "Frequent" ? 0.78 : 0.38;
      return { sat, use, tix, reg, churn: r() < p };
    });
    const ATT = { sat: ["Satisfaction", ["High", "Low"]], use: ["Usage", ["High", "Low"]], tix: ["Tickets", ["Frequent", "Few"]], reg: ["Region", ["North", "South", "East", "West"]] };
    const MIN = 30;
    let nodes, sel;
    const reset = () => { nodes = [{ id: 0, idx: D.map((_, i) => i), cond: "All customers", used: [], kids: null, depth: 0 }]; sel = 0; };
    const stats = (nd) => { const y = nd.idx.filter((i) => D[i].churn).length; return { n: nd.idx.length, y, rate: nd.idx.length ? y / nd.idx.length : 0, h: Hb(y, nd.idx.length) }; };
    const gain = (nd, a) => { const s = stats(nd); return s.h - ATT[a][1].reduce((t, v) => { const sub = nd.idx.filter((i) => D[i][a] === v); const y = sub.filter((i) => D[i].churn).length; return t + (sub.length / s.n) * Hb(y, sub.length); }, 0); };
    const split = (nd, a) => {
      nd.kids = ATT[a][1].map((v) => { const k = { id: nodes.length, idx: nd.idx.filter((i) => D[i][a] === v), cond: `${ATT[a][0]} ${v}`, used: [...nd.used, a], kids: null, depth: nd.depth + 1, parent: nd.id }; nodes.push(k); return k; });
      sel = nd.kids.reduce((b, k) => (stats(k).rate > stats(b).rate ? k : b), nd.kids[0]).id;
    };
    function layout() {
      const leaves = []; const walk = (nd) => (nd.kids ? nd.kids.forEach(walk) : leaves.push(nd)); walk(nodes[0]);
      const pos = {};
      leaves.forEach((l, i) => (pos[l.id] = (640 / leaves.length) * (i + 0.5)));
      const place = (nd) => { if (nd.kids) { nd.kids.forEach(place); pos[nd.id] = mean(nd.kids.map((k) => pos[k.id])); } };
      place(nodes[0]);
      return { pos, leaves };
    }
    const path = (l) => { const parts = []; let c = l; while (c && c.id !== 0) { parts.unshift(c.cond); c = nodes[c.parent]; } return parts.join(" + ") || "All customers"; };
    function render() {
      const { pos, leaves } = layout();
      const depth = Math.max(...nodes.map((n) => n.depth));
      const bw = Math.min(118, 640 / Math.max(leaves.length, 1) - 6), bh = 50, dy = Math.min(88, (330 - bh) / Math.max(1, depth));
      let g = "";
      nodes.forEach((nd) => { if (nd.kids) nd.kids.forEach((k) => (g += `<line x1="${pos[nd.id]}" y1="${8 + nd.depth * dy + bh}" x2="${pos[k.id]}" y2="${8 + k.depth * dy}" stroke="${C.line}" stroke-width="2"/>`)); });
      nodes.forEach((nd) => {
        const s = stats(nd), x = pos[nd.id] - bw / 2, y = 8 + nd.depth * dy, on = nd.id === sel, small = bw < 90;
        g += `<g data-node="${nd.id}" style="cursor:pointer"><rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="10" fill="#fff" stroke="${on ? C.ink : riskCol(s.rate)}" stroke-width="${on ? 3 : 2}"/><rect x="${x + 2}" y="${y + 2}" width="${bw - 4}" height="6" rx="3" fill="${riskCol(s.rate)}"/>`;
        g += txt(pos[nd.id], y + 23, nd.cond, { anchor: "middle", fill: C.ink, bold: 1, size: small ? 8.5 : 10.5 }) + txt(pos[nd.id], y + 39, small ? `${s.n} · ${pct(s.rate)}` : `n=${s.n} · churn ${pct(s.rate)}`, { anchor: "middle", size: small ? 8.5 : 10 }) + `</g>`;
      });
      svg.innerHTML = g;
      const nd = nodes[sel], s = stats(nd);
      const opts = Object.keys(ATT).filter((a) => !nd.used.includes(a)).map((a) => [a, gain(nd, a)]).sort((p, q) => q[1] - p[1]);
      const tooSmall = s.n < MIN * 2;
      choices.innerHTML = nd.kids ? `<span class="tree-note">This segment is already split. Select a leaf (a box with no children).</span>` : opts.length && !tooSmall ? `<b style="font-size:.9rem">Split "${nd.cond}" by:</b>` + opts.map(([a, g2]) => `<button class="btn" data-att="${a}">${ATT[a][0]} (IG ${g2.toFixed(3)})</button>`).join("") : `<span class="tree-note">${tooSmall ? `Stopping: this segment has only ${s.n} customers, too few to split reliably.` : "No attributes left to split on."}</span>`;
      const leafRows = leaves.map((l) => [l, stats(l)]).sort((p, q) => q[1].rate - p[1].rate);
      out.innerHTML = `<p><b>Selected:</b> ${path(nd)} (${s.n} customers, churn ${pct(s.rate)}, entropy ${s.h.toFixed(3)}). ${!nd.kids && opts.length && !tooSmall ? `Best next attribute: <b>${ATT[opts[0][0]][0]}</b>${opts[0][1] < 0.01 ? ", but its gain is tiny, a sign to stop here" : ""}.` : ""}</p><p><b>Segments, riskiest first:</b> ${leafRows.map(([l, st]) => `${path(l)} → ${pct(st.rate)} (${st.n})`).join("; ")}.</p>${opts.some(([a]) => a === "reg") && !nd.kids && !tooSmall ? `<p class="tree-note" style="margin:0">Region never helps: its information gain stays near zero, so a good segmentation leaves it out.</p>` : ""}`;
    }
    svg.addEventListener("click", (e) => { const g2 = e.target.closest("[data-node]"); if (!g2) return; sel = +g2.dataset.node; render(); });
    choices.addEventListener("click", (e) => { const b = e.target.closest("[data-att]"); if (!b) return; split(nodes[sel], b.dataset.att); render(); });
    $(root, "[data-auto]").addEventListener("click", () => {
      const nd = nodes[sel]; if (nd.kids || nd.idx.length < MIN * 2) return;
      const opts = Object.keys(ATT).filter((a) => !nd.used.includes(a)).map((a) => [a, gain(nd, a)]).sort((p, q) => q[1] - p[1]);
      if (opts.length) { split(nd, opts[0][0]); render(); }
    });
    $(root, "[data-reset]").addEventListener("click", () => { reset(); render(); });
    reset(); render();
  })();

  /* 5. Induction and prediction */
  (function induct() {
    const root = document.getElementById("viz-induct");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), met = $(root, "[data-metrics]"), sB = $$(root, "[data-st]"), ns = $(root, "[data-newstudent]");
    const hIn = $(root, '[data-in="h"]'), aIn = $(root, '[data-in="at"]');
    const r = rng(64);
    const S = Array.from({ length: 80 }, () => { const h = r() * 28, at = 45 + r() * 55; return { h, at, y: Math.min(100, Math.max(15, 18 + 1.5 * h + 0.38 * at + gauss(r) * 7)) }; });
    const train = S.slice(0, 60), test = S.slice(60);
    const fit = (() => { const A = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]; train.forEach((s) => { const row = [1, s.h, s.at]; for (let a = 0; a < 3; a++) { A[a][3] += row[a] * s.y; for (let b = 0; b < 3; b++) A[a][b] += row[a] * row[b]; } }); for (let c = 0; c < 3; c++) for (let rr = 0; rr < 3; rr++) if (rr !== c) { const f = A[rr][c] / A[c][c]; for (let k = c; k < 4; k++) A[rr][k] -= f * A[c][k]; } return A.map((row, i) => row[3] / row[i]); })();
    const pred = (h, at) => fit[0] + fit[1] * h + fit[2] * at;
    const metrics = (set) => { const e = set.map((s) => s.y - pred(s.h, s.at)), my = mean(set.map((s) => s.y)); const sse = e.reduce((a, v) => a + v * v, 0), sst = set.reduce((a, s) => a + (s.y - my) ** 2, 0); return { r2: 1 - sse / sst, rmse: Math.sqrt(sse / set.length), mae: mean(e.map(Math.abs)) }; };
    const mTr = metrics(train), mTe = metrics(test);
    let st = "ind";
    function render() {
      ns.hidden = st !== "pred";
      const W = 640, H = 280, L = 50, Rt = 20, T = 20, B = 36;
      let g = "";
      if (st !== "pred") {
        const X = (v) => L + ((v - 20) / 80) * (W - L - Rt), Y = (v) => T + (1 - (v - 20) / 80) * (H - T - B);
        for (let v = 20; v <= 100; v += 20) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" }) + txt(X(v), H - 18, v, { anchor: "middle" });
        g += txt((W + L) / 2, H - 2, "Predicted score", { anchor: "middle" }) + txt(L - 44, T - 6, "Actual score");
        g += `<line x1="${X(20)}" y1="${Y(20)}" x2="${X(100)}" y2="${Y(100)}" stroke="${C.soft}" stroke-dasharray="5 4"/>` + txt(X(98), Y(98) + 16, "perfect prediction", { anchor: "end", size: 10 });
        train.forEach((s) => (g += `<circle cx="${X(pred(s.h, s.at))}" cy="${Y(s.y)}" r="5" fill="${C.accent}" opacity="${st === "ind" ? 0.85 : 0.25}"/>`));
        if (st === "val") test.forEach((s) => (g += `<circle cx="${X(pred(s.h, s.at))}" cy="${Y(s.y)}" r="6" fill="${C.rose}" stroke="#fff"/>`));
        const m = st === "ind" ? mTr : mTe;
        met.innerHTML = [["R²", m.r2.toFixed(3)], ["RMSE", m.rmse.toFixed(1) + " marks"], ["MAE", m.mae.toFixed(1) + " marks"]].map(([k, v]) => `<div class="stat"><b>${v}</b><span>${k} on ${st === "ind" ? "training" : "test"} data</span></div>`).join("");
        out.innerHTML = st === "ind"
          ? `<div class="formula">f*: score = ${fit[0].toFixed(1)} + ${fit[1].toFixed(2)} × study hours + ${fit[2].toFixed(2)} × attendance %</div><p>From 60 past students, the model <b>induced</b> that each extra weekly study hour is worth about ${fit[1].toFixed(1)} marks and each attendance point about ${fit[2].toFixed(2)} marks. These parameters are the model.</p>`
          : `<p>On 20 students the model never saw (rose), R² is ${mTe.r2.toFixed(2)} vs. ${mTr.r2.toFixed(2)} on training data, and the typical error is ${mTe.rmse.toFixed(1)} marks. Similar numbers mean the model <b>generalizes</b>; a big drop would signal overfitting.</p>`;
      } else {
        const h = +hIn.value, at = +aIn.value, p = pred(h, at), pc = Math.min(100, p);
        $(root, '[data-out="h"]').textContent = h; $(root, '[data-out="at"]').textContent = at + "%";
        const X = (v) => L + (v / 30) * (W - L - Rt), Y = (v) => T + (1 - (v - 20) / 80) * (H - T - B);
        for (let v = 20; v <= 100; v += 20) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
        for (let v = 0; v <= 30; v += 5) g += txt(X(v), H - 18, v, { anchor: "middle" });
        g += txt((W + L) / 2, H - 2, "Study hours per week", { anchor: "middle" }) + txt(L - 44, T - 6, "Exam score");
        S.forEach((s) => (g += `<circle cx="${X(s.h)}" cy="${Y(s.y)}" r="4" fill="${C.light}"/>`));
        g += `<line x1="${X(0)}" y1="${Y(pred(0, at))}" x2="${X(30)}" y2="${Y(Math.min(100, pred(30, at)))}" stroke="${C.violet}" stroke-width="2.5" stroke-dasharray="7 4"/>` + txt(X(29), Y(Math.min(100, pred(29, at))) + 16, `f* at ${at}% attendance`, { anchor: "end", fill: C.violet, bold: 1, size: 10 });
        g += `<circle cx="${X(h)}" cy="${Y(pc)}" r="11" fill="none" stroke="${C.ink}" stroke-width="2.5"/><circle cx="${X(h)}" cy="${Y(pc)}" r="4" fill="${C.ink}"/>` + txt(X(h) + (h > 24 ? -16 : 16), Y(pc) + 4, "predicted " + p.toFixed(0), { fill: C.ink, bold: 1, size: 12, anchor: h > 24 ? "end" : "start" });
        met.innerHTML = `<div class="stat"><b>${p.toFixed(1)}</b><span>Predicted exam score</span></div><div class="stat"><b>± ${mTe.rmse.toFixed(0)}</b><span>Typical error (test RMSE)</span></div>`;
        out.innerHTML = `<div class="formula">Ŷ = f*(X′) = ${fit[0].toFixed(1)} + ${fit[1].toFixed(2)} × ${h} + ${fit[2].toFixed(2)} × ${at} = ${p.toFixed(1)}</div><p><b>Prediction</b> applies what was learned to a new student. Expect the real score within roughly ±${mTe.rmse.toFixed(0)} marks. ${p > 100 ? "The formula goes above 100 here, a reminder that models can extrapolate beyond sensible limits." : ""}</p>`;
      }
      svg.innerHTML = g;
    }
    sB.forEach((b) => b.addEventListener("click", () => { st = b.dataset.st; press(sB, b); render(); }));
    [hIn, aIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();
})();
