// Session 16 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b", sky: "#3a8dde" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const gauss = (r) => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  function lgamma(x) { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t); let s = 1.000000000190015; for (const k of c) s += k / ++y; return -t + Math.log((2.5066282746310005 * s) / x); }
  function betacf(a, b, x) { let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - (qab * x) / qap; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d; let h = d; for (let m = 1; m <= 300; m++) { const m2 = 2 * m; let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2)); d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; h *= d * c; aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2)); d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 3e-12) break; } return h; }
  function ibeta(a, b, x) { if (x <= 0) return 0; if (x >= 1) return 1; const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x)); return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b; }
  const tP = (t, df) => ibeta(df / 2, 0.5, df / (df + t * t));
  const fP = (f, d1, d2) => ibeta(d2 / 2, d1 / 2, d2 / (d2 + d1 * f));
  const fmtP = (p) => (p < 0.001 ? "< 0.001" : p.toFixed(3));
  function invert(M) { const n = M.length, A = M.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => +(i === j))]); for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]]; const d = A[c][c]; for (let k = 0; k < 2 * n; k++) A[c][k] /= d; for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c]; for (let k = 0; k < 2 * n; k++) A[r][k] -= f * A[c][k]; } } return A.map((r) => r.slice(n)); }
  function ols(X, y) { const p = X[0].length, XtX = Array.from({ length: p }, (_, a) => Array.from({ length: p }, (_, b) => X.reduce((s, r) => s + r[a] * r[b], 0))), Xty = Array.from({ length: p }, (_, a) => X.reduce((s, r, i) => s + r[a] * y[i], 0)), inv = invert(XtX); return { beta: inv.map((row) => row.reduce((s, v, j) => s + v * Xty[j], 0)), inv }; }

  /* 1. Least squares by hand */
  (function fit() {
    const root = document.getElementById("viz-fit");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), w0In = $(root, '[data-in="w0"]'), w1In = $(root, '[data-in="w1"]');
    const X = [10, 20, 30, 40], Y = [25, 40, 60, 80], my = mean(Y), sst = Y.reduce((s, v) => s + (v - my) ** 2, 0);
    function render() {
      const w0 = +w0In.value, w1 = +w1In.value;
      $(root, '[data-out="w0"]').textContent = w0.toFixed(1); $(root, '[data-out="w1"]').textContent = w1.toFixed(2);
      const W = 640, H = 300, L = 50, Rt = 20, T = 16, B = 36, PX = (v) => L + (v / 55) * (W - L - Rt), PY = (v) => T + (1 - v / 120) * (H - T - B);
      const sc = (PY(0) - PY(1));
      let g = "";
      for (let v = 0; v <= 120; v += 20) g += `<line x1="${L}" x2="${W - Rt}" y1="${PY(v)}" y2="${PY(v)}" stroke="${C.grid}"/>` + txt(L - 8, PY(v) + 4, v, { anchor: "end" });
      for (let v = 0; v <= 55; v += 10) g += txt(PX(v), H - 18, v, { anchor: "middle" });
      g += txt((W + L) / 2, H - 2, "Advertising spend X (₹ lakh)", { anchor: "middle" }) + txt(L - 44, T - 4, "Sales Y");
      let sse = 0;
      X.forEach((x, i) => { const yh = w0 + w1 * x, e = Y[i] - yh; sse += e * e; const side = Math.abs(e) * sc; g += `<rect x="${PX(x)}" y="${Math.min(PY(Y[i]), PY(yh))}" width="${side}" height="${side}" fill="${C.rose}" opacity=".18" stroke="${C.rose}" stroke-opacity=".5"/><line x1="${PX(x)}" x2="${PX(x)}" y1="${PY(Y[i])}" y2="${PY(yh)}" stroke="${C.rose}" stroke-width="2"/>`; });
      g += `<line x1="${PX(0)}" y1="${PY(w0)}" x2="${PX(55)}" y2="${PY(w0 + w1 * 55)}" stroke="${C.violet}" stroke-width="2.5"/>`;
      X.forEach((x, i) => (g += `<circle cx="${PX(x)}" cy="${PY(Y[i])}" r="7" fill="${C.accent}" stroke="#fff" stroke-width="2"/>`));
      const p50 = w0 + w1 * 50;
      g += `<circle cx="${PX(50)}" cy="${PY(Math.min(120, p50))}" r="7" fill="none" stroke="${C.violet}" stroke-width="2.5" stroke-dasharray="3 2"/>` + txt(PX(50) - 10, PY(Math.min(120, p50)) + 4, "X = 50 → " + p50.toFixed(1), { anchor: "end", fill: C.violet, bold: 1 });
      svg.innerHTML = g;
      const r2 = 1 - sse / sst;
      $(root, '[data-stat="sse"]').textContent = sse.toFixed(1);
      $(root, '[data-stat="r2"]').textContent = r2.toFixed(4);
      $(root, '[data-stat="p50"]').textContent = p50.toFixed(1);
      const isLS = Math.abs(w0 - 5) < 0.01 && Math.abs(w1 - 1.85) < 0.001;
      out.innerHTML = `<div class="formula">Ŷ = ${w0.toFixed(1)} + ${w1.toFixed(2)}X &nbsp;·&nbsp; SSE = Σ(Y − Ŷ)² = ${sse.toFixed(1)}</div><p>${isLS ? `<b>This is the least-squares line.</b> Slope W₁ = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)² = 925 ÷ 500 = 1.85: each extra ₹1 lakh of advertising brings about ₹1.85 lakh in sales. Intercept W₀ = ȳ − W₁x̄ = 51.25 − 1.85 × 25 = 5. No other line has a smaller SSE, and it explains ${(r2 * 100).toFixed(1)}% of the variation in sales.` : Math.abs(w0 - 5) < 0.01 && Math.abs(w1 - 2) < 0.001 ? "This is the slide's line, Y = 5 + 2X. It's close, but its SSE is much larger than the least-squares line's 7.5, because the slope is a little too steep; so its prediction at X = 50 (105) is too high." : sse < 12 ? "Very close to the best fit." : "Try to shrink the total shaded area."}</p>`;
    }
    [w0In, w1In].forEach((el) => el.addEventListener("input", render));
    $(root, "[data-ls]").addEventListener("click", () => { w0In.value = 5; w1In.value = 1.85; render(); });
    $(root, "[data-deck]").addEventListener("click", () => { w0In.value = 5; w1In.value = 2; render(); });
    render();
  })();

  /* 2. Logistic regression */
  (function logit() {
    const root = document.getElementById("viz-logit");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), tIn = $(root, '[data-in="t"]'), xIn = $(root, '[data-in="x"]');
    const r = rng(21);
    const D = Array.from({ length: 70 }, () => { const x = r() * 30; return { x, y: r() < 1 / (1 + Math.exp(-(-4 + 0.32 * x))) ? 1 : 0, j: r() }; });
    let b0 = 0, b1 = 0;
    for (let it = 0; it < 25; it++) { let g0 = 0, g1 = 0, h00 = 0, h01 = 0, h11 = 0; D.forEach((d) => { const p = 1 / (1 + Math.exp(-(b0 + b1 * d.x))), w = p * (1 - p); g0 += d.y - p; g1 += (d.y - p) * d.x; h00 += w; h01 += w * d.x; h11 += w * d.x * d.x; }); const det = h00 * h11 - h01 * h01; b0 += (h11 * g0 - h01 * g1) / det; b1 += (-h01 * g0 + h00 * g1) / det; }
    const P = (x) => 1 / (1 + Math.exp(-(b0 + b1 * x)));
    function render() {
      const t = +tIn.value / 100, xv = +xIn.value;
      $(root, '[data-out="t"]').textContent = t.toFixed(2); $(root, '[data-out="x"]').textContent = xv;
      const W = 640, H = 260, L = 50, Rt = 20, T = 20, B = 36, X = (v) => L + (v / 30) * (W - L - Rt), Y = (v) => T + (1 - v) * (H - T - B);
      let g = "";
      for (let v = 0; v <= 1.001; v += 0.25) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v.toFixed(2), { anchor: "end" });
      for (let v = 0; v <= 30; v += 5) g += txt(X(v), H - 18, v, { anchor: "middle" });
      g += txt((W + L) / 2, H - 2, "Minutes on site", { anchor: "middle" }) + txt(L - 44, T - 6, "P(buy)");
      const xc = (Math.log(t / (1 - t)) - b0) / b1;
      if (xc > 0 && xc < 30) g += `<rect x="${X(xc)}" y="${T}" width="${X(30) - X(xc)}" height="${H - T - B}" fill="${C.accent}" opacity=".06"/><line x1="${X(xc)}" x2="${X(xc)}" y1="${T}" y2="${H - B}" stroke="${C.accent}" stroke-dasharray="4 3"/>` + txt(X(xc) + 6, Y(0.3), `predict "buy" beyond ${xc.toFixed(1)} min`, { fill: C.accent, bold: 1, size: 10.5 });
      g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(t)}" y2="${Y(t)}" stroke="${C.amber}" stroke-dasharray="6 4"/>`;
      D.forEach((d) => (g += `<circle cx="${X(d.x)}" cy="${Y(d.y) + (d.y ? 1 : -1) * (d.j * 12)}" r="4" fill="${d.y ? C.accent : C.rose}" opacity=".7"/>`));
      const pts = []; for (let v = 0; v <= 30; v += 0.25) pts.push(`${X(v)},${Y(P(v))}`);
      g += `<polyline points="${pts.join(" ")}" fill="none" stroke="${C.violet}" stroke-width="3"/>`;
      g += `<circle cx="${X(xv)}" cy="${Y(P(xv))}" r="9" fill="${C.violet}" stroke="#fff" stroke-width="2"/>`;
      svg.innerHTML = g;
      const pred = D.map((d) => (P(d.x) >= t ? 1 : 0)), tp = D.filter((d, i) => d.y && pred[i]).length, fp = D.filter((d, i) => !d.y && pred[i]).length, fn = D.filter((d, i) => d.y && !pred[i]).length, acc = D.filter((d, i) => d.y === pred[i]).length / D.length;
      out.innerHTML = `<div class="formula">P(buy) = 1 ÷ (1 + e<sup>−(${b0.toFixed(2)} + ${b1.toFixed(3)} × minutes)</sup>) = ${P(xv).toFixed(2)} for ${xv} minutes</div><p>The new visitor is predicted to <b>${P(xv) >= t ? "buy" : "not buy"}</b>. At threshold ${t.toFixed(2)}, the model is ${(acc * 100).toFixed(0)}% accurate on these visitors: ${tp} buyers caught, ${fn} missed, ${fp} false alarms. Lowering the threshold catches more buyers at the cost of more false alarms.</p>`;
    }
    [tIn, xIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* 3. Multiple regression and adjusted R² */
  (function multi() {
    const root = document.getElementById("viz-multi");
    if (!root) return;
    const bar = $(root, "[data-preds]"), tbl = $(root, "[data-coef]"), out = $(root, ".viz-out");
    const r = rng(24), n = 24;
    const S = Array.from({ length: n }, (_, i) => { const ad = 2 + r() * 10, size = 5 + r() * 15; return { ad, size, month: 1 + Math.floor(r() * 12), idd: i % 10, paint: Math.floor(r() * 6), temp: 22 + r() * 12, y: 20 + 1.6 * ad + 0.9 * size + gauss(r) * 4 }; });
    const PR = [["ad", "Advertising (₹ lakh)", true], ["size", "Store size (000 sq ft)", false], ["month", "Manager's birth month", false], ["idd", "Last digit of store ID", false], ["paint", "Wall paint color code", false]];
    const on = new Set(["ad"]);
    const btns = PR.map(([k, lab]) => { const b = document.createElement("button"); b.className = "btn"; b.textContent = lab; b.setAttribute("aria-pressed", String(on.has(k))); b.addEventListener("click", () => { on.has(k) ? on.delete(k) : on.add(k); if (!on.size) on.add(k); b.setAttribute("aria-pressed", String(on.has(k))); render(); }); bar.appendChild(b); return b; });
    function render() {
      const ks = PR.filter(([k]) => on.has(k)), k = ks.length;
      const X = S.map((s) => [1, ...ks.map(([kk]) => s[kk])]), y = S.map((s) => s.y);
      const { beta, inv } = ols(X, y);
      const yh = X.map((row) => row.reduce((s, v, j) => s + v * beta[j], 0)), my = mean(y);
      const sse = y.reduce((s, v, i) => s + (v - yh[i]) ** 2, 0), sst = y.reduce((s, v) => s + (v - my) ** 2, 0), df = n - k - 1;
      const r2 = 1 - sse / sst, ar2 = 1 - (1 - r2) * (n - 1) / df, s2 = sse / df, F = ((sst - sse) / k) / s2;
      const rows = ks.map(([kk, lab, real], j) => { const se = Math.sqrt(s2 * inv[j + 1][j + 1]), t = beta[j + 1] / se, p = tP(t, df); return { lab, b: beta[j + 1], se, t, p, real: kk === "ad" || kk === "size" }; });
      tbl.innerHTML = `<thead><tr><th>Predictor</th><th>Coefficient</th><th>Std. error</th><th>t</th><th>p-value</th><th></th></tr></thead><tbody><tr><td>Intercept</td><td>${beta[0].toFixed(2)}</td><td colspan="4"></td></tr>${rows.map((q) => `<tr><td><b>${q.lab}</b></td><td>${q.b.toFixed(3)}</td><td>${q.se.toFixed(3)}</td><td>${q.t.toFixed(2)}</td><td>${fmtP(q.p)}</td><td>${q.p < 0.05 ? '<span class="flag on">Significant</span>' : '<span class="flag" style="background:#fde7ec;color:#a3203f">Not significant</span>'}</td></tr>`).join("")}</tbody>`;
      $(root, '[data-stat="r2"]').textContent = r2.toFixed(3);
      $(root, '[data-stat="ar2"]').textContent = ar2.toFixed(3);
      $(root, '[data-stat="f"]').textContent = `${F.toFixed(1)} (${fmtP(fP(F, k, df))})`;
      $(root, '[data-stat="rmse"]').textContent = Math.sqrt(sse / n).toFixed(2);
      const noise = rows.filter((q) => !q.real).length;
      out.innerHTML = `<p>${noise ? `You've added ${noise} noise predictor${noise > 1 ? "s" : ""}. R² crept up (it can never fall when a predictor is added), but adjusted R² penalizes the extra complexity, and the p-values show the noise predictors aren't significant. Remove them.` : on.has("size") ? "Both real drivers are in: each is highly significant, and adjusted R² is close to R². This is the model to keep: sales rise by about ₹" + rows[0].b.toFixed(1) + " lakh per ₹1 lakh of advertising, holding store size fixed." : "Advertising alone explains part of the variation. Add store size, the other real driver, and watch both R² and adjusted R² jump."} The F-test checks whether the model as a whole beats predicting the average.</p>`;
    }
    render();
  })();

  /* 4. Residual diagnostics */
  (function resid() {
    const root = document.getElementById("viz-resid");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), dB = $$(root, "[data-d]");
    const mk = (seed, f) => { const r = rng(seed); return Array.from({ length: 40 }, (_, i) => { const x = 1 + (i / 39) * 9; return [x, f(x, r)]; }); };
    const DS = {
      good: [mk(1, (x, r) => 5 + 2 * x + gauss(r) * 1.5), "Residuals form a shapeless band around zero with even spread. The linear model is appropriate."],
      curve: [mk(2, (x, r) => 2 + 0.35 * x * x + gauss(r) * 1.2), "Residuals form a U shape: positive at both ends, negative in the middle. The relationship is curved, so try polynomial regression or a transformation."],
      fan: [mk(3, (x, r) => 5 + 2 * x + gauss(r) * 0.4 * x), "Residuals fan out as fitted values grow: the error variance isn't constant (heteroscedasticity). Coefficients are still unbiased, but p-values and intervals become unreliable. A log transform often helps."],
      out: [(() => { const d = mk(4, (x, r) => 5 + 2 * x + gauss(r) * 1.2); d[37] = [d[37][0], d[37][1] - 16]; return d; })(), "One point sits far below the rest. It pulls the whole line toward itself and has a huge residual. Check it for data errors before deciding how to handle it."],
    };
    let d = "good";
    function render() {
      const pts = DS[d][0], xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const { beta } = ols(pts.map((p) => [1, p[0]]), ys);
      const fitv = xs.map((x) => beta[0] + beta[1] * x), res = ys.map((y, i) => y - fitv[i]);
      const ylo = Math.min(...ys, ...fitv) - 2, yhi = Math.max(...ys, ...fitv) + 2, rm = Math.max(...res.map(Math.abs)) * 1.15;
      let g = "";
      // left: data + fit
      const L1 = 40, R1 = 300, T = 24, B = 230, X1 = (v) => L1 + ((v - 0.5) / 10) * (R1 - L1), Y1 = (v) => B - ((v - ylo) / (yhi - ylo)) * (B - T);
      g += txt(L1, 14, "Data and fitted line", { fill: C.ink, bold: 1 }) + `<rect x="${L1}" y="${T}" width="${R1 - L1}" height="${B - T}" fill="${C.bg}" rx="6"/>`;
      g += `<line x1="${X1(0.5)}" y1="${Y1(beta[0] + beta[1] * 0.5)}" x2="${X1(10.5)}" y2="${Y1(beta[0] + beta[1] * 10.5)}" stroke="${C.violet}" stroke-width="2.5"/>`;
      pts.forEach(([x, y], i) => (g += `<circle cx="${X1(x)}" cy="${Y1(y)}" r="4" fill="${d === "out" && i === 37 ? C.rose : C.accent}"/>`));
      g += txt((L1 + R1) / 2, 252, "X", { anchor: "middle" });
      // right: residuals vs fitted
      const L2 = 360, R2 = 624, flo = Math.min(...fitv), fhi = Math.max(...fitv), X2 = (v) => L2 + ((v - flo) / (fhi - flo)) * (R2 - L2), Y2 = (v) => (T + B) / 2 - (v / rm) * ((B - T) / 2);
      g += txt(L2, 14, "Residuals vs. fitted values", { fill: C.ink, bold: 1 }) + `<rect x="${L2}" y="${T}" width="${R2 - L2}" height="${B - T}" fill="${C.bg}" rx="6"/>`;
      g += `<line x1="${L2}" x2="${R2}" y1="${Y2(0)}" y2="${Y2(0)}" stroke="${C.ink}" stroke-dasharray="5 3"/>`;
      res.forEach((e, i) => (g += `<circle cx="${X2(fitv[i])}" cy="${Y2(e)}" r="4" fill="${d === "out" && i === 37 ? C.rose : C.violet}" opacity=".8"/>`));
      g += txt((L2 + R2) / 2, 252, "Fitted value", { anchor: "middle" }) + txt(L2 - 6, Y2(0) + 4, "0", { anchor: "end" });
      svg.innerHTML = g;
      out.innerHTML = `<p>${DS[d][1]}</p>`;
    }
    dB.forEach((b) => b.addEventListener("click", () => { d = b.dataset.d; press(dB, b); render(); }));
    render();
  })();

  /* 5. Delphi */
  (function delphi() {
    const root = document.getElementById("viz-delphi");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out");
    const init = [2200, 3500, 4200, 4800, 5200, 6000, 7500, 9500, 14000];
    let rounds;
    const reset = () => { rounds = [init.slice()]; };
    const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[4]; };
    const q = (a, p) => { const s = [...a].sort((x, y) => x - y), i = (s.length - 1) * p, lo = Math.floor(i); return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo); };
    function step() { if (rounds.length >= 4) return; const cur = rounds[rounds.length - 1], m = med(cur), r = rng(rounds.length * 7); rounds.push(cur.map((v, i) => Math.round(v + (i === 8 ? 0.2 : 0.5) * (m - v) + gauss(r) * 150))); }
    function render() {
      const W = 640, H = 260, L = 60, Rt = 20, T = 20, B = 40, X = (i) => L + 40 + (i / 3) * (W - L - Rt - 80), lo = 0, hi = 15000, Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
      let g = "";
      for (let v = 0; v <= hi; v += 3000) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v.toLocaleString("en-IN"), { anchor: "end", size: 10 });
      [0, 1, 2, 3].forEach((i) => (g += txt(X(i), H - 18, "Round " + (i + 1), { anchor: "middle", fill: i < rounds.length ? C.ink : C.line, bold: i === rounds.length - 1 })));
      rounds.forEach((rd, i) => {
        const q1 = q(rd, 0.25), q3 = q(rd, 0.75), m = med(rd);
        g += `<rect x="${X(i) - 30}" y="${Y(q3)}" width="60" height="${Y(q1) - Y(q3)}" rx="8" fill="${C.accent}" opacity=".15"/><line x1="${X(i) - 34}" x2="${X(i) + 34}" y1="${Y(m)}" y2="${Y(m)}" stroke="${C.accent}" stroke-width="3"/>`;
        rd.forEach((v, k) => (g += `<circle cx="${X(i) - 24 + k * 6}" cy="${Y(v)}" r="4.5" fill="${k === 8 ? C.amber : C.violet}" opacity=".8"/>`));
        if (i) rounds[i - 1].forEach((v, k) => (g += `<line x1="${X(i - 1) - 24 + k * 6}" y1="${Y(v)}" x2="${X(i) - 24 + k * 6}" y2="${Y(rd[k])}" stroke="${C.line}"/>`));
        g += txt(X(i) + 38, Y(m) + 4, m.toLocaleString("en-IN"), { fill: C.accent, bold: 1, size: 10.5 });
      });
      svg.innerHTML = g;
      const cur = rounds[rounds.length - 1], first = rounds[0], iq = (a) => q(a, 0.75) - q(a, 0.25);
      out.innerHTML = `<p><b>Round ${rounds.length}:</b> median ${med(cur).toLocaleString("en-IN")} scooters; middle 50% of experts between ${Math.round(q(cur, 0.25)).toLocaleString("en-IN")} and ${Math.round(q(cur, 0.75)).toLocaleString("en-IN")}${rounds.length > 1 ? `, a range ${Math.round((1 - iq(cur) / iq(first)) * 100)}% narrower than in round 1` : ""}. ${rounds.length === 1 ? "Opinions start far apart." : rounds.length < 4 ? "Experts move toward the group, but each keeps their own reasoning." : "The panel has converged enough to report a forecast. The amber expert still stands apart: Delphi asks outliers to explain their reasoning, which can reveal risks others missed."}</p>`;
      $(root, "[data-next]").disabled = rounds.length >= 4;
    }
    $(root, "[data-next]").addEventListener("click", () => { step(); render(); });
    $(root, "[data-reset]").addEventListener("click", () => { reset(); render(); });
    reset(); render();
  })();

  /* shared demand series */
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const SER = (() => { const r = rng(36); return Array.from({ length: 36 }, (_, t) => +(50 + 0.8 * t + 10 * Math.sin((2 * Math.PI * (t - 7)) / 12) + gauss(r) * 2.5).toFixed(1)); })();

  /* 6. Forecast comparator */
  (function fc() {
    const root = document.getElementById("viz-fc");
    if (!root) return;
    const bar = $(root, ".controls"), prm = $(root, "[data-param]"), svg = $(root, "svg"), tbl = $(root, "[data-acc]"), out = $(root, ".viz-out");
    const NTR = 30, train = SER.slice(0, NTR), test = SER.slice(NTR);
    let n = 3, alpha = 0.3;
    const trendFit = () => { const t = train.map((_, i) => i), mt = mean(t), my = mean(train); const b = t.reduce((s, v, i) => s + (v - mt) * (train[i] - my), 0) / t.reduce((s, v) => s + (v - mt) ** 2, 0); return [my - b * mt, b]; };
    const M = {
      naive: ["Naive", "Next period = last period. For a 6-month horizon, every forecast equals the last known month.", () => { const fit = [null, ...train.slice(0, -1)]; return { fit, fc: test.map(() => train[NTR - 1]) }; }],
      ma: ["Moving average", "The average of the last n months. Smooths noise but lags behind trends and ignores seasonality.", () => { const fit = train.map((_, i) => (i >= n ? mean(train.slice(i - n, i)) : null)); const f = mean(train.slice(-n)); return { fit, fc: test.map(() => f) }; }],
      wma: ["Weighted MA", "Weights 3, 2, 1 on the last three months (most recent heaviest), divided by 6. Reacts faster than a plain moving average.", () => { const w = (a) => (3 * a[2] + 2 * a[1] + a[0]) / 6; const fit = train.map((_, i) => (i >= 3 ? w(train.slice(i - 3, i)) : null)); const f = w(train.slice(-3)); return { fit, fc: test.map(() => f) }; }],
      ses: ["Exponential smoothing", "F(t+1) = αY(t) + (1 − α)F(t). All past months count, with exponentially less weight the older they are.", () => { const fit = [null]; let F = train[0]; for (let i = 1; i < NTR; i++) { fit.push(F); F = alpha * train[i] + (1 - alpha) * F; } fit[1] = train[0]; return { fit, fc: test.map(() => F) }; }],
      trend: ["Trend projection", "A regression line through time (Y = a + b·t), extended forward. Captures growth but not the seasonal swings.", () => { const [a, b] = trendFit(); return { fit: train.map((_, i) => a + b * i), fc: test.map((_, h) => a + b * (NTR + h)) }; }],
      seas: ["Trend + seasonality", "Trend projection plus a seasonal index for each calendar month, estimated from the training residuals. The idea behind seasonal decomposition and seasonal ARIMA.", () => { const [a, b] = trendFit(); const idx = MON.map((_, m) => mean(train.map((v, i) => [i, v - (a + b * i)]).filter(([i]) => i % 12 === m).map((q) => q[1]))); return { fit: train.map((_, i) => a + b * i + idx[i % 12]), fc: test.map((_, h) => a + b * (NTR + h) + idx[(NTR + h) % 12]) }; }],
    };
    let cur = "ses";
    const btns = Object.entries(M).map(([k, [nm]]) => { const b = document.createElement("button"); b.className = "btn"; b.textContent = nm; b.addEventListener("click", () => { cur = k; press(btns, b); render(); }); bar.appendChild(b); return b; });
    press(btns, btns[3]);
    const metrics = (fc) => { const e = test.map((v, i) => v - fc[i]); const mse = mean(e.map((x) => x * x)); return { mse, rmse: Math.sqrt(mse), mape: mean(e.map((x, i) => Math.abs(x) / test[i])) * 100, bias: mean(e) }; };
    function render() {
      prm.innerHTML = cur === "ma" ? `<label class="range">Window n <span data-out="n">${n}</span><input type="range" min="2" max="12" value="${n}" data-in="n" /></label>` : cur === "ses" ? `<label class="range">Smoothing constant α <span data-out="a">${alpha.toFixed(2)}</span><input type="range" min="5" max="95" step="5" value="${alpha * 100}" data-in="a" /></label>` : "";
      const pi = $(prm, "input"); if (pi) pi.addEventListener("input", (e) => { if (e.target.dataset.in === "n") n = +e.target.value; else alpha = +e.target.value / 100; render(); });
      const res = M[cur][2]();
      const W = 640, H = 280, L = 46, Rt = 16, T = 16, B = 40, X = (i) => L + (i / 35) * (W - L - Rt), lo = 35, hi = 95, Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
      let g = `<rect x="${X(29.5)}" y="${T}" width="${X(35) - X(29.5) + 6}" height="${H - T - B}" fill="${C.amber}" opacity=".08"/>` + txt(X(32.5), T + 12, "test period", { anchor: "middle", fill: C.amber, bold: 1, size: 10 });
      for (let v = 40; v <= 90; v += 10) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
      for (let i = 0; i < 36; i += 3) g += txt(X(i), H - 22, MON[i % 12], { anchor: "middle", size: 9.5 });
      [0, 12, 24].forEach((i, y) => (g += txt(X(i), H - 8, "Year " + (y + 1), { size: 9.5, fill: C.ink })));
      g += `<polyline points="${SER.map((v, i) => `${X(i)},${Y(v)}`).join(" ")}" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
      SER.forEach((v, i) => (g += `<circle cx="${X(i)}" cy="${Y(v)}" r="2.6" fill="${C.ink}"/>`));
      const fp = res.fit.map((v, i) => (v === null ? null : `${X(i)},${Y(v)}`)).filter(Boolean);
      g += `<polyline points="${fp.join(" ")}" fill="none" stroke="${C.accent}" stroke-width="1.8" opacity=".7"/>`;
      g += `<polyline points="${res.fc.map((v, h) => `${X(NTR + h)},${Y(v)}`).join(" ")}" fill="none" stroke="${C.rose}" stroke-width="3"/>`;
      res.fc.forEach((v, h) => (g += `<circle cx="${X(NTR + h)}" cy="${Y(v)}" r="4" fill="${C.rose}"/>`));
      g += txt(L + 4, H - B - 6, "black: actual · teal: fitted (in-sample) · rose: forecast", { size: 10 });
      svg.innerHTML = g;
      const all = Object.entries(M).map(([k, [nm, , f]]) => { const keepN = n, keepA = alpha; const m = metrics(f().fc); n = keepN; alpha = keepA; return [k, nm, m]; });
      const bestK = all.reduce((b, q) => (q[2].rmse < b[2].rmse ? q : b), all[0])[0];
      tbl.innerHTML = `<thead><tr><th>Method</th><th>MSE</th><th>RMSE</th><th>MAPE</th><th>Bias</th></tr></thead><tbody>${all.map(([k, nm, m]) => `<tr style="${k === cur ? "background:var(--accent-soft);font-weight:700" : ""}"><td>${nm}${k === bestK ? ' <span class="flag on">Most accurate</span>' : ""}</td><td>${m.mse.toFixed(1)}</td><td>${m.rmse.toFixed(2)}</td><td>${m.mape.toFixed(1)}%</td><td>${m.bias >= 0 ? "+" : ""}${m.bias.toFixed(2)}</td></tr>`).join("")}</tbody>`;
      const m = metrics(res.fc);
      out.innerHTML = `<p><b>${M[cur][0]}:</b> ${M[cur][1]}</p><p>Over the 6 test months it is off by ${m.rmse.toFixed(1)} thousand orders on a typical month (RMSE), ${m.mape.toFixed(1)}% on average (MAPE), and its bias of ${m.bias >= 0 ? "+" : ""}${m.bias.toFixed(1)} means it ${m.bias > 0.5 ? "under-forecasts" : m.bias < -0.5 ? "over-forecasts" : "is roughly unbiased"}. ${cur !== "seas" ? "This series has both trend and seasonality, so methods that ignore them fall behind." : "Modelling both trend and seasonality wins on this series."}</p>`;
    }
    render();
  })();

  /* 7. Seasonal decomposition */
  (function decomp() {
    const root = document.getElementById("viz-decomp");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), mIn = $(root, '[data-in="mo"]');
    const n = SER.length;
    const trend = SER.map((_, t) => (t < 6 || t > n - 7 ? null : (0.5 * SER[t - 6] + SER.slice(t - 5, t + 6).reduce((a, b) => a + b, 0) + 0.5 * SER[t + 6]) / 12));
    const raw = MON.map((_, m) => mean(SER.map((v, t) => [t, v]).filter(([t]) => t % 12 === m && trend[t] !== null).map(([t, v]) => v - trend[t])));
    const adj = mean(raw), seas = raw.map((v) => v - adj);
    const S = SER.map((_, t) => seas[t % 12]), R = SER.map((v, t) => (trend[t] === null ? null : v - trend[t] - S[t]));
    function render() {
      const mo = +mIn.value;
      $(root, '[data-out="mo"]').textContent = `${MON[mo % 12]}, year ${Math.floor(mo / 12) + 1}`;
      const W = 640, L = 90, Rt = 16, X = (i) => L + (i / 35) * (W - L - Rt);
      const panels = [["Observed", SER, [35, 95], C.ink], ["Trend", trend, [35, 95], C.violet], ["Seasonal", S, [-14, 14], C.accent], ["Remainder", R, [-8, 8], C.rose]];
      let g = "";
      panels.forEach(([name, data, [lo, hi], col], p) => {
        const top = 8 + p * 92, h = 76, Y = (v) => top + (1 - (v - lo) / (hi - lo)) * h;
        g += `<rect x="${L}" y="${top}" width="${W - L - Rt}" height="${h}" rx="6" fill="${C.bg}"/>` + txt(L - 10, top + h / 2 + 4, name, { anchor: "end", fill: col, bold: 1, size: 12 });
        if (lo < 0) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.line}"/>`;
        const pts = data.map((v, i) => (v === null ? null : `${X(i)},${Y(v)}`)).filter(Boolean);
        g += p === 3 ? data.map((v, i) => (v === null ? "" : `<line x1="${X(i)}" x2="${X(i)}" y1="${Y(0)}" y2="${Y(v)}" stroke="${col}" stroke-width="3"/>`)).join("") : `<polyline points="${pts.join(" ")}" fill="none" stroke="${col}" stroke-width="2.2"/>`;
        if (data[mo] !== null) g += `<circle cx="${X(mo)}" cy="${Y(data[mo])}" r="5.5" fill="${col}" stroke="#fff" stroke-width="2"/>`;
      });
      g += `<line x1="${X(mo)}" x2="${X(mo)}" y1="4" y2="${8 + 4 * 92 - 12}" stroke="${C.amber}" stroke-dasharray="4 3"/>`;
      [0, 12, 24].forEach((i, y) => (g += txt(X(i), 378, "Year " + (y + 1), { size: 10, fill: C.ink })));
      svg.innerHTML = g;
      out.innerHTML = trend[mo] === null
        ? `<p>The trend here is a 12-month centered moving average, which needs 6 months on either side, so it isn't available for the first and last 6 months. Pick a month in the middle.</p>`
        : `<div class="formula">${SER[mo].toFixed(1)} (observed) = ${trend[mo].toFixed(1)} (trend) ${S[mo] >= 0 ? "+" : "−"} ${Math.abs(S[mo]).toFixed(1)} (seasonal) ${R[mo] >= 0 ? "+" : "−"} ${Math.abs(R[mo]).toFixed(1)} (remainder)</div><p>${MON[mo % 12]} is typically ${Math.abs(S[mo]).toFixed(1)} thousand orders ${S[mo] >= 0 ? "above" : "below"} trend. The trend shows steady growth of about ${((trend[29] - trend[6]) / 23 * 12).toFixed(0)} thousand orders a year; the remainder is the unpredictable noise left over. Forecasting each part separately and adding them back is how seasonal models work.</p>`;
    }
    mIn.addEventListener("input", render);
    render();
  })();
})();
