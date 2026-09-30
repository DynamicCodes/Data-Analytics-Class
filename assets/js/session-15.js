// Session 15 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const gauss = (r) => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const inr = (v) => "₹" + Math.round(v).toLocaleString("en-IN");
  const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
  const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
  const invPhi = (p) => { let lo = -8, hi = 8; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; Phi(m) < p ? (lo = m) : (hi = m); } return (lo + hi) / 2; };

  /* 1. Analytics continuum */
  (function continuum() {
    const root = document.getElementById("viz-continuum");
    if (!root) return;
    const bar = $(root, ".controls"), extra = $(root, "[data-extra]"), svg = $(root, "svg"), out = $(root, ".viz-out");
    const Q = ["Q1 '24", "Q2 '24", "Q3 '24", "Q4 '24", "Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25"];
    const spend = [12, 13, 12.5, 14, 13, 12, 11, 9.5];
    const noise = [0.8, -1.1, 0.6, 0.4, -0.7, 1.0, -0.5, -0.9];
    const salesOf = (s) => 20 + 40 * Math.log(s);
    const sales = spend.map((s, i) => salesOf(s) + noise[i]);
    const profitOf = (s) => 0.3 * salesOf(s) - s;
    let stage = "desc", chg = 0;
    const W = 640, H = 260, L = 50, Rt = 20, T = 20, B = 40;
    const S = {
      desc: ["Descriptive", "What happened?", () => {
        const Y = (v) => T + (1 - (v - 100) / 30) * (H - T - B), bw = (W - L - Rt) / 8;
        let g = ""; for (let v = 100; v <= 130; v += 10) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
        sales.forEach((v, i) => (g += `<rect x="${L + i * bw + 8}" y="${Y(v)}" width="${bw - 16}" height="${Y(100) - Y(v)}" rx="5" fill="${i === 7 ? C.rose : C.light}"/>` + txt(L + i * bw + bw / 2, H - 22, Q[i], { anchor: "middle", size: 10 }) + txt(L + i * bw + bw / 2, Y(v) - 5, v.toFixed(0), { anchor: "middle", size: 10, fill: C.ink })));
        return g + txt(L - 44, T - 6, "Sales (₹ crore)");
      }, () => `<p><b>Sales dropped last quarter</b>, to ₹${sales[7].toFixed(0)} crore, the lowest in two years. Descriptive analytics summarizes what happened, but not why.</p>`],
      diag: ["Diagnostic", "Why did it happen?", () => {
        const X = (v) => L + ((v - 9) / 6) * (W - L - Rt), Y = (v) => T + (1 - (v - 100) / 30) * (H - T - B);
        let g = ""; for (let v = 100; v <= 130; v += 10) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
        for (let v = 9; v <= 15; v++) g += txt(X(v), H - 22, "₹" + v, { anchor: "middle", size: 10 });
        const pts = []; for (let s = 9; s <= 15; s += 0.1) pts.push(`${X(s)},${Y(salesOf(s))}`);
        g += `<polyline points="${pts.join(" ")}" fill="none" stroke="${C.violet}" stroke-width="2.5" stroke-dasharray="7 4"/>`;
        spend.forEach((s, i) => (g += `<circle cx="${X(s)}" cy="${Y(sales[i])}" r="7" fill="${i === 7 ? C.rose : C.accent}" stroke="#fff" stroke-width="2"/>` + (i === 7 ? txt(X(s) + 12, Y(sales[i]) + 4, "last quarter", { fill: C.rose, bold: 1 }) : "")));
        return g + txt((W + L) / 2, H - 4, "Marketing spend (₹ crore)", { anchor: "middle" }) + txt(L - 44, T - 6, "Sales");
      }, () => `<p>Plotting sales against marketing spend shows the pattern: quarters with less spend had lower sales, and last quarter had the lowest spend (₹9.5 crore). <b>Reduced marketing spend explains the drop.</b> The dashed curve shows diminishing returns: each extra crore adds a bit less.</p>`],
      pred: ["Predictive", "What will happen next?", () => {
        const Y = (v) => T + (1 - (v - 100) / 30) * (H - T - B), X = (i) => L + (i / 9) * (W - L - Rt);
        let g = ""; for (let v = 100; v <= 130; v += 10) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
        [...Q, "Q1 '26", "Q2 '26"].forEach((q, i) => (g += txt(X(i), H - 22, q, { anchor: "middle", size: 10, fill: i > 7 ? C.amber : C.soft })));
        g += `<polyline points="${sales.map((v, i) => `${X(i)},${Y(v)}`).join(" ")}" fill="none" stroke="${C.ink}" stroke-width="2.5"/>`;
        const f = salesOf(9.5);
        g += `<path d="M${X(7)},${Y(sales[7])} L${X(9)},${Y(f + 4)} L${X(9)},${Y(f - 4)} Z" fill="${C.amber}" opacity=".18"/><polyline points="${X(7)},${Y(sales[7])} ${X(8)},${Y(f)} ${X(9)},${Y(f)}" fill="none" stroke="${C.amber}" stroke-width="2.5" stroke-dasharray="7 4"/>`;
        return g + txt(X(9), Y(f) - 12, "forecast", { anchor: "end", fill: C.amber, bold: 1 });
      }, () => `<p>If spend stays at ₹9.5 crore, the model forecasts sales of about ₹${salesOf(9.5).toFixed(0)} crore per quarter: <b>sales may stay low</b>. Prediction tells us what's likely, but not what to do.</p>`],
      presc: ["Prescriptive", "What should we do about it?", () => {
        const s0 = 10, X = (v) => L + ((v + 30) / 90) * (W - L - Rt), pr = (c) => profitOf(s0 * (1 + c / 100)), vals = []; for (let c = -30; c <= 60; c++) vals.push(pr(c));
        const lo = Math.min(...vals) - 0.3, hi = Math.max(...vals) + 0.3, Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
        let g = ""; for (let c = -30; c <= 60; c += 15) g += txt(X(c), H - 22, (c > 0 ? "+" : "") + c + "%", { anchor: "middle", size: 10 });
        g += `<polyline points="${vals.map((v, i) => `${X(i - 30)},${Y(v)}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/>`;
        const best = vals.indexOf(Math.max(...vals)) - 30;
        g += `<line x1="${X(best)}" x2="${X(best)}" y1="${T}" y2="${H - B}" stroke="${C.accent}" stroke-dasharray="4 3"/>` + txt(X(best) + 5, T + 10, "optimum " + (best > 0 ? "+" : "") + best + "%", { fill: C.accent, bold: 1 });
        g += `<circle cx="${X(chg)}" cy="${Y(pr(chg))}" r="8" fill="${C.violet}" stroke="#fff" stroke-width="2"/>`;
        return g + txt((W + L) / 2, H - 4, "Change in digital ad budget (from ₹10 crore)", { anchor: "middle" }) + txt(L - 44, T - 6, "Quarterly profit");
      }, () => { const s = 10 * (1 + chg / 100), p = profitOf(s), p0 = profitOf(10); return `<div class="formula">Profit = 30% margin × predicted sales − ad spend = 0.3 × ${salesOf(s).toFixed(1)} − ${s.toFixed(1)} = ₹${p.toFixed(2)} crore</div><p>${Math.abs(chg - 20) <= 2 ? "<b>This is the recommendation: increase the digital ad budget by about 20%</b>, the spend that maximizes profit." : chg < 20 ? "Spending more would still pay off: each extra crore brings in more than a crore of margin." : "Past the optimum, extra spend buys less than it costs, so profit falls."} Compared with ₹10 crore, profit changes by ₹${(p - p0).toFixed(2)} crore. Prescriptive analytics combines the predictive model with an objective (profit) to recommend an action.</p>`; }],
    };
    const btns = Object.entries(S).map(([k, [n, q]]) => { const b = document.createElement("button"); b.className = "btn"; b.innerHTML = `${n}<span style="font-weight:500;opacity:.8"> · ${q}</span>`; b.addEventListener("click", () => { stage = k; press(btns, b); render(); }); bar.appendChild(b); return b; });
    press(btns, btns[0]);
    extra.innerHTML = `<label class="range">Change in digital ad budget <span data-out="c">0%</span><input type="range" min="-30" max="60" value="0" data-in="c" /></label>`;
    $(extra, "input").addEventListener("input", (e) => { chg = +e.target.value; $(extra, "[data-out]").textContent = (chg > 0 ? "+" : "") + chg + "%"; render(); });
    function render() { extra.hidden = stage !== "presc"; svg.innerHTML = S[stage][2](); out.innerHTML = S[stage][3](); }
    render();
  })();

  /* 2. Linear programming */
  (function lp() {
    const root = document.getElementById("viz-lp");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out");
    const ins = ["p1", "p2", "m", "l"].map((k) => $(root, `[data-in="${k}"]`));
    function render() {
      const [p1, p2, M, Lh] = ins.map((el) => +el.value);
      ins.forEach((el) => ($(root, `[data-out="${el.dataset.in}"]`).textContent = (+el.value).toLocaleString("en-IN")));
      // constraints: x1 + 3x2 <= M ; 2x1 + 2x2 <= Lh
      const cands = [[0, 0], [Math.min(M, Lh / 2), 0], [0, Math.min(M / 3, Lh / 2)]];
      const x2i = (M - Lh / 2) / 2, x1i = Lh / 2 - x2i;
      if (x1i >= 0 && x2i >= 0) cands.push([x1i, x2i]);
      const feas = cands.filter(([a, b]) => a + 3 * b <= M + 1e-9 && 2 * a + 2 * b <= Lh + 1e-9);
      const verts = [...new Map(feas.map((v) => [v.map((x) => x.toFixed(4)).join(","), v])).values()].sort((a, b) => Math.atan2(a[1] - 5, a[0] - 5) - Math.atan2(b[1] - 5, b[0] - 5));
      const Z = (v) => p1 * v[0] + p2 * v[1];
      const best = feas.reduce((b, v) => (Z(v) > Z(b) ? v : b), feas[0]);
      const Lft = 56, Rt = 20, T = 16, B = 40, W = 640, H = 320, X = (v) => Lft + (v / 80) * (W - Lft - Rt), Y = (v) => T + (1 - v / 55) * (H - T - B);
      let g = "";
      for (let v = 0; v <= 55; v += 10) g += `<line x1="${Lft}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(Lft - 8, Y(v) + 4, v, { anchor: "end" });
      for (let v = 0; v <= 80; v += 10) g += txt(X(v), H - 22, v, { anchor: "middle" });
      g += txt((W + Lft) / 2, H - 4, "Chairs x₁", { anchor: "middle" }) + txt(Lft - 50, T - 4, "Tables x₂");
      const hull = [[0, 0], [Math.min(M, Lh / 2), 0]]; if (x1i >= 0 && x2i >= 0 && x1i <= Math.min(M, Lh / 2) && x2i <= Math.min(M / 3, Lh / 2)) hull.push([x1i, x2i]); hull.push([0, Math.min(M / 3, Lh / 2)]);
      g += `<polygon points="${hull.map(([a, b]) => `${X(a)},${Y(b)}`).join(" ")}" fill="${C.accent}" opacity=".15"/>`;
      const clipLine = (a, b, c, col, lab) => { const p = []; const y0 = c / b, x0 = c / a; p.push([0, y0], [x0, 0]); return `<line x1="${X(0)}" y1="${Y(Math.min(55, y0))}" x2="${X(Math.min(80, x0))}" y2="${Y(y0 > 55 ? 0 : 0)}" stroke="${col}" stroke-width="2"/>`; };
      // machine line x1 + 3x2 = M
      g += `<line x1="${X(0)}" y1="${Y(M / 3)}" x2="${X(Math.min(80, M))}" y2="${Y(Math.max(0, (M - Math.min(80, M)) / 3))}" stroke="${C.violet}" stroke-width="2.5"/>` + txt(X(Math.min(78, M * 0.75)) , Y(M / 3 - Math.min(78, M * 0.75) / 3) - 8, "machine: x₁ + 3x₂ ≤ " + M, { fill: C.violet, bold: 1, size: 10.5, anchor: "middle" });
      // labor line 2x1 + 2x2 = Lh
      g += `<line x1="${X(0)}" y1="${Y(Math.min(55, Lh / 2))}" x2="${X(Lh / 2 - Math.min(55, Lh / 2) >= 0 ? Lh / 2 : 0)}" y2="${Y(0)}" stroke="${C.amber}" stroke-width="2.5"/>` + txt(X(Lh / 2) - 4, Y(0) - 10, "labor: 2x₁ + 2x₂ ≤ " + Lh, { fill: C.amber, bold: 1, size: 10.5, anchor: "end" });
      // iso-profit line through best: p1 x1 + p2 x2 = Z*
      const zb = Z(best); const ya = zb / p2, xa = zb / p1;
      g += `<line x1="${X(0)}" y1="${Y(Math.min(55, ya))}" x2="${X(ya > 55 ? (zb - p2 * 55) / p1 : 0)}" y2="${Y(ya > 55 ? 55 : ya)}" stroke="none"/>`;
      const isoPts = []; for (let x = 0; x <= 80; x += 0.5) { const y = (zb - p1 * x) / p2; if (y >= 0 && y <= 55) isoPts.push(`${X(x)},${Y(y)}`); }
      g += `<polyline points="${isoPts.join(" ")}" fill="none" stroke="${C.rose}" stroke-width="2" stroke-dasharray="7 4"/>`;
      feas.forEach((v) => { const isB = v === best; g += `<circle cx="${X(v[0])}" cy="${Y(v[1])}" r="${isB ? 9 : 6}" fill="${isB ? C.rose : "#fff"}" stroke="${isB ? "#fff" : C.ink}" stroke-width="2"/>` + txt(X(v[0]) + 10, Y(v[1]) - 8, `(${v[0].toFixed(1).replace(".0", "")}, ${v[1].toFixed(1).replace(".0", "")}): ${inr(Z(v))}`, { fill: isB ? C.rose : C.ink, bold: isB, size: 10.5 }); });
      svg.innerHTML = g;
      $(root, '[data-stat="x1"]').textContent = +best[0].toFixed(1);
      $(root, '[data-stat="x2"]').textContent = +best[1].toFixed(1);
      $(root, '[data-stat="z"]').textContent = inr(zb);
      const bindM = Math.abs(best[0] + 3 * best[1] - M) < 1e-6, bindL = Math.abs(2 * best[0] + 2 * best[1] - Lh) < 1e-6;
      const frac = Math.abs(best[0] - Math.round(best[0])) > 1e-6 || Math.abs(best[1] - Math.round(best[1])) > 1e-6;
      out.innerHTML = `<div class="formula">Maximize Z = ${p1}x₁ + ${p2}x₂ &nbsp; subject to &nbsp; x₁ + 3x₂ ≤ ${M}, &nbsp; 2x₁ + 2x₂ ≤ ${Lh}, &nbsp; x₁, x₂ ≥ 0</div><p><b>Recommendation:</b> make ${+best[0].toFixed(1)} chairs and ${+best[1].toFixed(1)} tables for a profit of ${inr(zb)}. The dashed iso-profit line touches the feasible region only at this corner; the optimum of a linear program always sits at a corner. ${bindM && bindL ? "Both machine and labor hours are fully used (binding constraints), so more of either would raise profit." : bindM ? "Machine hours are the bottleneck; spare labor hours remain." : bindL ? "Labor hours are the bottleneck; spare machine hours remain." : ""} ${frac ? "The answer isn't a whole number, so in practice you'd use integer programming to pick whole chairs and tables." : ""} Change the profits and watch the recommendation jump to a different corner.</p>`;
    }
    ins.forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* 3. Churn prescription */
  (function churn() {
    const root = document.getElementById("viz-churn");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), tIn = $(root, '[data-in="t"]'), cIn = $(root, '[data-in="c"]'), eIn = $(root, '[data-in="e"]');
    const r = rng(15), V = 6000;
    const P = Array.from({ length: 2000 }, () => { const z = -1.4 + gauss(r) * 1.4; return 1 / (1 + Math.exp(-z)); }).sort((a, b) => b - a);
    const net = (t, c, e) => P.filter((p) => p >= t).reduce((s, p) => s + e * p * V - c, 0);
    function render() {
      const t = +tIn.value / 100, c = +cIn.value, e = +eIn.value / 100;
      $(root, '[data-out="t"]').textContent = t.toFixed(2); $(root, '[data-out="c"]').textContent = c.toLocaleString("en-IN"); $(root, '[data-out="e"]').textContent = Math.round(e * 100) + "%";
      const ts = []; for (let k = 0; k <= 100; k++) ts.push([k / 100, net(k / 100, c, e)]);
      const vals = ts.map((q) => q[1]), lo = Math.min(0, ...vals), hi = Math.max(...vals, 1);
      const W = 640, H = 260, L = 70, Rt = 20, T = 20, B = 40, X = (v) => L + v * (W - L - Rt), Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
      let g = "";
      const step = Math.pow(10, Math.floor(Math.log10((hi - lo) / 4 || 1))) * (((hi - lo) / 4) / Math.pow(10, Math.floor(Math.log10((hi - lo) / 4 || 1))) > 5 ? 5 : ((hi - lo) / 4) / Math.pow(10, Math.floor(Math.log10((hi - lo) / 4 || 1))) > 2 ? 2 : 1);
      for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${v === 0 ? C.ink : C.grid}"/>` + txt(L - 8, Y(v) + 4, (v < 0 ? "−₹" : "₹") + Math.abs(Math.round(v / 1000)).toLocaleString("en-IN") + "k", { anchor: "end", size: 10 });
      for (let v = 0; v <= 1.001; v += 0.1) g += txt(X(v), H - 22, v.toFixed(1), { anchor: "middle", size: 10 });
      g += txt((W + L) / 2, H - 4, "Offer threshold: offer to customers with churn probability ≥ this", { anchor: "middle", size: 10.5 });
      g += `<polyline points="${ts.map(([a, b]) => `${X(a)},${Y(b)}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/>`;
      const best = ts.reduce((b, q) => (q[1] > b[1] ? q : b), ts[0]);
      g += `<line x1="${X(best[0])}" x2="${X(best[0])}" y1="${T}" y2="${H - B}" stroke="${C.accent}" stroke-dasharray="4 3"/>` + txt(X(best[0]) + 5, T + 10, "best: " + best[0].toFixed(2), { fill: C.accent, bold: 1 });
      g += `<circle cx="${X(t)}" cy="${Y(net(t, c, e))}" r="8" fill="${C.violet}" stroke="#fff" stroke-width="2"/>`;
      svg.innerHTML = g;
      const off = P.filter((p) => p >= t), saved = off.reduce((s, p) => s + e * p, 0), nv = net(t, c, e), be = c / (e * V);
      $(root, '[data-stat="n"]').textContent = off.length.toLocaleString("en-IN");
      $(root, '[data-stat="saved"]').textContent = Math.round(saved);
      $(root, '[data-stat="net"]').textContent = (nv < 0 ? "−" : "") + inr(Math.abs(nv));
      out.innerHTML = `<div class="formula">Offer to a customer only if: expected value saved = churn probability × ${Math.round(e * 100)}% × ₹6,000 &gt; offer cost ₹${c.toLocaleString("en-IN")} &nbsp;⇒&nbsp; churn probability &gt; ${be > 1 ? "1 (never worth it)" : be.toFixed(2)}</div><p>${Math.abs(t - best[0]) <= 0.02 ? "<b>Your threshold is optimal.</b>" : t > best[0] ? `Your threshold is too strict: customers between ${best[0].toFixed(2)} and ${t.toFixed(2)} are worth saving but get no offer.` : `Your threshold is too loose: offers to low-risk customers cost more than they save.`} The deck's example uses 0.70; with these costs the best cut-off is ${best[0].toFixed(2)}. Change the offer cost or effectiveness and the best threshold moves: the prediction stays the same, but the prescription changes with the economics.</p>`;
    }
    [tIn, cIn, eIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* 4. Driver-route assignment */
  (function assign() {
    const root = document.getElementById("viz-assign");
    if (!root) return;
    const grid = $(root, "[data-grid]"), out = $(root, ".viz-out"), pIn = $(root, '[data-in="pen"]');
    const D = ["Driver A", "Driver B", "Driver C", "Driver D"], R = ["Route 5", "Route 7", "Route 2", "Route 9"];
    const dist = [[1400, 1900, 1100, 1700], [1600, 1300, 1500, 2000], [1200, 1800, 1700, 1300], [1900, 1500, 1400, 1100]];
    const delay = [[0.1, 0.35, 0.45, 0.2], [0.3, 0.1, 0.15, 0.4], [0.25, 0.2, 0.1, 0.5], [0.15, 0.3, 0.35, 0.05]];
    const perms = []; const permute = (a, k = 0) => { if (k === a.length) return perms.push([...a]); for (let i = k; i < a.length; i++) { [a[k], a[i]] = [a[i], a[k]]; permute(a, k + 1); [a[k], a[i]] = [a[i], a[k]]; } }; permute([0, 1, 2, 3]);
    let mine = [null, null, null, null], showOpt = false;
    const cost = (i, j, pen) => dist[i][j] + delay[i][j] * pen;
    function render() {
      const pen = +pIn.value; $(root, '[data-out="pen"]').textContent = pen.toLocaleString("en-IN");
      const total = (a) => a.reduce((s, j, i) => s + cost(i, j, pen), 0);
      const best = perms.reduce((b, p) => (total(p) < total(b) ? p : b), perms[0]);
      const worst = Math.max(...perms.map(total));
      grid.innerHTML = `<thead><tr><th></th>${R.map((r) => `<th>${r}</th>`).join("")}</tr></thead><tbody>${D.map((d, i) => `<tr><th>${d}</th>${R.map((_, j) => { const sel = mine[i] === j, opt = showOpt && best[i] === j; return `<td data-i="${i}" data-j="${j}" style="cursor:pointer;${sel ? "background:var(--accent);color:#fff;font-weight:700;" : ""}${opt ? "outline:3px solid #d94f70;outline-offset:-3px;" : ""}"><div>${inr(cost(i, j, pen))}</div><div style="font-size:.78em;opacity:.8">${inr(dist[i][j])} + ${Math.round(delay[i][j] * 100)}% × ${inr(pen)}</div></td>`; }).join("")}</tr>`).join("")}</tbody>`;
      const done = mine.every((v) => v !== null), mt = done ? total(mine) : null, bt = total(best);
      out.innerHTML = `<p>${done ? `Your assignment costs <b>${inr(mt)}</b>. ` : `Pick one route per driver (click a cell). `}${showOpt ? `<b>The optimal assignment</b> (outlined) is ${best.map((j, i) => `${D[i].replace("Driver ", "")} → ${R[j]}`).join(", ")}, costing <b>${inr(bt)}</b>, ${Math.round((1 - bt / worst) * 100)}% less than the worst assignment${done ? (mt - bt < 1 ? ". You found it!" : `, and ${inr(mt - bt)} less than yours`) : ""}.` : "Then compare it with the optimizer."} ${pen >= 4000 ? "With a high delay penalty, the optimizer favors reliable driver–route pairs even if they're longer." : pen <= 500 ? "With almost no delay penalty, only distance matters." : ""} Real problems have hundreds of drivers, where checking every possibility is impossible, so solvers use linear programming or the Hungarian algorithm.</p>`;
    }
    grid.addEventListener("click", (e) => { const td = e.target.closest("[data-i]"); if (!td) return; const i = +td.dataset.i, j = +td.dataset.j; mine = mine.map((v, k) => (k !== i && v === j ? null : v)); mine[i] = mine[i] === j ? null : j; render(); });
    $(root, "[data-opt]").addEventListener("click", () => { showOpt = true; render(); });
    $(root, "[data-clear]").addEventListener("click", () => { mine = [null, null, null, null]; render(); });
    pIn.addEventListener("input", render);
    render();
  })();

  /* 5. Monte Carlo newsvendor */
  (function mc() {
    const root = document.getElementById("viz-mc");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out");
    const [qIn, sdIn, mIn, oIn] = ["q", "sd", "m", "o"].map((k) => $(root, `[data-in="${k}"]`));
    const Z = (() => { const r = rng(1600); return Array.from({ length: 2000 }, () => gauss(r)); })();
    function render() {
      const q = +qIn.value, sd = +sdIn.value, m = +mIn.value, o = +oIn.value;
      [qIn, sdIn, mIn, oIn].forEach((el) => ($(root, `[data-out="${el.dataset.in}"]`).textContent = (+el.value).toLocaleString("en-IN")));
      const D = Z.map((z) => Math.max(0, 1000 + sd * z));
      const ep = (qq) => mean(D.map((d) => m * Math.min(qq, d) - o * Math.max(qq - d, 0)));
      const qs = []; for (let x = 600; x <= 1600; x += 10) qs.push([x, ep(x)]);
      const best = qs.reduce((b, p) => (p[1] > b[1] ? p : b), qs[0]);
      const cr = m / (m + o), theo = 1000 + sd * invPhi(cr);
      const W = 640, H = 280, L = 70, Rt = 20, T = 20, B = 40;
      const lo = Math.min(...qs.map((p) => p[1])), hi = best[1], X = (v) => L + ((v - 600) / 1000) * (W - L - Rt), Y = (v) => T + (1 - (v - lo) / (hi - lo || 1)) * (H - T - B - 50);
      let g = "";
      for (let x = 600; x <= 1600; x += 200) g += txt(X(x), H - 22, x.toLocaleString("en-IN"), { anchor: "middle", size: 10 });
      g += txt((W + L) / 2, H - 4, "Order quantity (units)", { anchor: "middle" }) + txt(L - 64, T - 6, "Expected profit");
      // demand histogram strip at bottom
      const bins = new Array(50).fill(0); D.forEach((d) => { const b = Math.floor((d - 600) / 20); if (b >= 0 && b < 50) bins[b]++; }); const bm = Math.max(...bins);
      bins.forEach((c, i) => (g += `<rect x="${X(600 + i * 20)}" y="${H - B - (c / bm) * 44}" width="${X(620) - X(600) - 1}" height="${(c / bm) * 44}" fill="${C.lilac}"/>`));
      g += txt(W - Rt, H - B - 48, "simulated demand", { anchor: "end", fill: C.violet, size: 10 });
      g += `<polyline points="${qs.map(([a, b]) => `${X(a)},${Y(b)}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/>`;
      g += `<line x1="${X(best[0])}" x2="${X(best[0])}" y1="${T}" y2="${H - B}" stroke="${C.accent}" stroke-dasharray="4 3"/>` + txt(X(best[0]) + 5, T + 10, "best " + best[0].toLocaleString("en-IN"), { fill: C.accent, bold: 1 });
      g += `<circle cx="${X(q)}" cy="${Y(ep(q))}" r="8" fill="${C.violet}" stroke="#fff" stroke-width="2"/>`;
      g += txt(L - 8, Y(hi) + 4, inr(hi), { anchor: "end", size: 10 }) + txt(L - 8, Y(lo) + 4, inr(lo), { anchor: "end", size: 10 });
      svg.innerHTML = g;
      const so = D.filter((d) => d > q).length / D.length;
      $(root, '[data-stat="ep"]').textContent = inr(ep(q));
      $(root, '[data-stat="best"]').textContent = best[0].toLocaleString("en-IN");
      $(root, '[data-stat="so"]').textContent = Math.round(so * 100) + "%";
      out.innerHTML = `<p>${Math.abs(q - best[0]) <= 20 ? "<b>You've found the best order.</b>" : `Ordering ${best[0].toLocaleString("en-IN")} instead would add about ${inr(best[1] - ep(q))} of expected profit.`} Because a lost sale (₹${m}) costs ${m > o ? "more" : m < o ? "less" : "the same as"} than an unsold unit (₹${o}), the best order sits ${m > o ? "above" : m < o ? "below" : "at"} the average forecast of 1,000. Theory agrees: stock up to the ${Math.round(cr * 100)}th percentile of demand (the critical ratio ${m} ÷ (${m} + ${o})), about ${Math.round(theo).toLocaleString("en-IN")} units. More uncertainty makes the choice matter more.</p>`;
    }
    [qIn, sdIn, mIn, oIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* 6. Use cases */
  (function cases() {
    const root = document.getElementById("viz-cases");
    if (!root) return;
    const bar = $(root, ".controls"), flow = $(root, "[data-flow]");
    const CS = {
      Amazon: ["Millions of products and orders a day across global warehouses: inventory, delivery routes and prices must all be managed.", "Forecast demand by region, time and season from purchase history, browsing and external factors like holidays and weather.", "Optimize stock per fulfillment center, choose routes that minimize cost and time, and set dynamic prices that maximize profit while staying competitive.", "Faster deliveries, lower logistics costs, prices that adjust in real time.", "Increase warehouse stock of electronics in Bengaluru by 18% next week to meet forecast Diwali demand."],
      Netflix: ["Decide what to recommend to each user and which shows to produce to keep people watching.", "Predict viewer preferences from watch history, ratings and demographics; forecast churn and content popularity.", "Optimize each user's recommendations to maximize watch time and reduce churn; decide which genres to invest in by region and when to release.", "A personalized experience, higher engagement, data-driven content investment.", "Recommend Money Heist to users who watched Breaking Bad and rated thrillers above 4 stars."],
      Uber: ["Balance driver availability, rider demand and trip efficiency in real time.", "Predict demand spikes by location, time and event (concerts, weather); estimate trip duration, wait times and surge likelihood.", "Use optimization and reinforcement learning to set surge pricing, move drivers to high-demand zones, and suggest the fastest or cheapest routes.", "Shorter waits, higher driver utilization, better profitability.", "Raise the fare multiplier to 1.3× in Koramangala between 6 and 8 PM to balance demand and supply."],
      Walmart: ["Thousands of stores need precise control of inventory, supply chain and store operations.", "Forecast demand and seasonal trends; predict stock-out risk and supplier delays.", "Optimize replenishment (how much, when, from whom), shelf placement, and transport logistics.", "Fewer stock-outs, less waste, lower supply chain costs.", "Shift 20% of regional bottled-water stock from Store A to Store B ahead of a local festival."],
      Zomato: ["Balance delivery times, restaurant demand and customer satisfaction across thousands of orders.", "Forecast order volume by area and time; predict restaurant preparation times and driver availability.", "Assign delivery partners to minimize delivery time, use discounts to smooth peaks, and recommend promotions by area.", "Faster deliveries, better driver utilization, more off-peak orders.", "Offer a 10% discount in Salt Lake between 3 and 5 PM to boost off-peak demand."],
    };
    const lab = [["Business challenge", C.soft], ["Predictive step", C.violet], ["Prescriptive step", C.accent], ["Outcome", C.amber], ["Example decision", C.rose]];
    const btns = Object.keys(CS).map((k) => { const b = document.createElement("button"); b.className = "btn"; b.textContent = k; b.addEventListener("click", () => { press(btns, b); render(k); }); bar.appendChild(b); return b; });
    function render(k) {
      flow.innerHTML = `<div style="display:grid;gap:.5rem">${CS[k].map((t, i) => `<div style="display:grid;grid-template-columns:9.5rem 1fr;gap:.8rem;align-items:start;background:${i === 4 ? "var(--accent-soft)" : "var(--bg)"};border-radius:14px;padding:.75rem .9rem;border-left:5px solid ${lab[i][1]}"><b style="color:${lab[i][1]};font-size:.88rem">${lab[i][0]}</b><span style="${i === 4 ? "font-weight:700" : ""}">${i === 4 ? "“" + t + "”" : t}</span></div>`).join('<div style="text-align:center;color:var(--ink-soft);line-height:1">↓</div>')}</div>`;
    }
    press(btns, btns[0]); render("Amazon");
  })();
})();
