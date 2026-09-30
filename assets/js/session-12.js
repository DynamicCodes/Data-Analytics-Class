// Session 12 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b", sky: "#3a8dde" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const gauss = (r) => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;

  // least squares via normal equations with Gaussian elimination (small, well-scaled problems)
  function lstsq(X, y, ridge = 0) {
    const p = X[0].length, A = Array.from({ length: p }, () => new Array(p + 1).fill(0));
    X.forEach((row, i) => { for (let a = 0; a < p; a++) { A[a][p] += row[a] * y[i]; for (let b = 0; b < p; b++) A[a][b] += row[a] * row[b]; } });
    for (let a = 0; a < p; a++) A[a][a] += ridge;
    for (let c = 0; c < p; c++) {
      let piv = c; for (let r = c + 1; r < p; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      [A[c], A[piv]] = [A[piv], A[c]];
      for (let r = 0; r < p; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k <= p; k++) A[r][k] -= f * A[c][k]; }
    }
    return A.map((row, i) => row[p] / row[i]);
  }

  /* 1. Model family gallery */
  (function gallery() {
    const root = document.getElementById("viz-types");
    if (!root) return;
    const bar = $(root, ".controls"), svg = $(root, "svg"), out = $(root, ".viz-out"), extra = $(root, "[data-extra]");
    const r = rng(9);
    const blobs = [[160, 90], [420, 80], [300, 190]].flatMap(([cx, cy]) => Array.from({ length: 22 }, () => [cx + gauss(r) * 45, cy + gauss(r) * 28]));
    let km = { k: 3, cents: null, assign: null, it: 0 };
    const kInit = () => { km.cents = Array.from({ length: km.k }, (_, i) => [...blobs[(i * 23 + 5) % blobs.length]]); km.assign = null; km.it = 0; };
    const kStep = () => {
      km.assign = blobs.map((p) => { let best = 0, bd = 1e9; km.cents.forEach((c, j) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; best = j; } }); return best; });
      km.cents = km.cents.map((c, j) => { const m = blobs.filter((_, i) => km.assign[i] === j); return m.length ? [mean(m.map((p) => p[0])), mean(m.map((p) => p[1]))] : c; });
      km.it++;
    };
    const COL = [C.accent, C.violet, C.amber, C.rose, C.sky];
    const F = {
      reg: ["Regression", "Predicts a continuous number, such as sales or a house price, by fitting a line (or curve) through the data. Linear regression for straight-line relationships, polynomial regression for curves.", () => { let g = ""; const r2 = rng(3); for (let i = 0; i < 30; i++) { const x = 60 + i * 17 + r2() * 10, y = 220 - (x - 60) * 0.33 + gauss(r2) * 16; g += `<circle cx="${x}" cy="${y}" r="5" fill="${C.accent}" opacity=".8"/>`; } return g + `<line x1="50" y1="224" x2="590" y2="44" stroke="${C.violet}" stroke-width="3"/>` + txt(590, 36, "fitted line: ŷ = β₀ + β₁x", { anchor: "end", fill: C.violet, bold: 1 }); }],
      cls: ["Classification", "Predicts a category, such as buy / don't buy. The model learns a boundary that separates the classes; new points are labeled by which side they fall on. Algorithms: logistic regression, decision trees, random forests, SVM, naive Bayes.", () => { let g = `<path d="M40,240 L600,30 L600,250 Z" fill="${C.rose}" opacity=".07"/><path d="M40,240 L600,30 L40,30 Z" fill="${C.accent}" opacity=".07"/>`; const r2 = rng(4); for (let i = 0; i < 50; i++) { const x = 50 + r2() * 540, y = 30 + r2() * 210, above = y < 240 - (x - 40) * 0.375 + gauss(r2) * 18; g += above ? `<circle cx="${x}" cy="${y}" r="5.5" fill="${C.accent}"/>` : `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" fill="${C.rose}"/>`; } return g + `<line x1="40" y1="240" x2="600" y2="30" stroke="${C.ink}" stroke-width="2.5" stroke-dasharray="7 4"/>` + txt(60, 50, "Buys", { fill: C.accent, bold: 1, size: 13 }) + txt(580, 235, "Doesn't buy", { fill: C.rose, bold: 1, size: 13, anchor: "end" }); }],
      ts: ["Time series", "Predicts future values of a sequence from its own past: trend, seasonality and recent level. Algorithms: ARIMA, exponential smoothing, LSTM neural networks.", () => { const pts = [], f = []; for (let t = 0; t < 30; t++) pts.push([40 + t * 15, 180 - t * 2 - 30 * Math.sin(t / 1.9)]); for (let t = 29; t < 40; t++) f.push([40 + t * 15, 180 - t * 2 - 30 * Math.sin(t / 1.9)]); return `<path d="M${f.map((p, i) => `${p[0]},${p[1] - 8 - i * 3}`).join(" L")} L${[...f].reverse().map((p, i) => `${p[0]},${p[1] + 8 + (f.length - 1 - i) * 3}`).join(" L")} Z" fill="${C.amber}" opacity=".18"/><polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${C.ink}" stroke-width="2.5"/><polyline points="${f.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${C.amber}" stroke-width="2.5" stroke-dasharray="7 4"/>` + txt(470, 40, "forecast with uncertainty", { fill: C.amber, bold: 1 }) + txt(40, 245, "past months", { fill: C.ink }); }],
      clu: ["Clustering", "Groups similar items when there is no target to predict, such as customer segments. K-means repeatedly assigns each point to its nearest center, then moves each center to the middle of its points. Use the controls to run it.", () => { let g = ""; blobs.forEach((p, i) => (g += `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${km.assign ? COL[km.assign[i]] : C.soft}" opacity=".75"/>`)); km.cents.forEach((c, j) => (g += `<path d="M${c[0] - 10},${c[1]} L${c[0] + 10},${c[1]} M${c[0]},${c[1] - 10} L${c[0]},${c[1] + 10}" stroke="${C.ink}" stroke-width="5"/><path d="M${c[0] - 9},${c[1]} L${c[0] + 9},${c[1]} M${c[0]},${c[1] - 9} L${c[0]},${c[1] + 9}" stroke="${COL[j]}" stroke-width="3"/>`)); return g + txt(600, 245, `k = ${km.k}, iteration ${km.it}`, { anchor: "end", fill: C.ink, bold: 1 }); }],
      ens: ["Ensemble", "Combines many models so their errors cancel out. Bagging (random forests) trains models on resampled data and takes a vote; boosting (XGBoost, AdaBoost, LightGBM) trains models in sequence, each fixing the last one's mistakes; stacking learns how to combine different models.", () => { let g = ""; const votes = ["Yes", "Yes", "No", "Yes", "No", "Yes", "Yes"]; votes.forEach((v, i) => { const x = 50 + i * 80; g += `<rect x="${x}" y="40" width="64" height="44" rx="10" fill="${C.bg}" stroke="${C.line}"/>` + txt(x + 32, 58, "Model " + (i + 1), { anchor: "middle", size: 10, fill: C.ink }) + txt(x + 32, 75, v, { anchor: "middle", bold: 1, fill: v === "Yes" ? C.accent : C.rose }) + `<line x1="${x + 32}" y1="86" x2="320" y2="160" stroke="${v === "Yes" ? C.accent : C.rose}" stroke-width="1.5" opacity=".6"/>`; }); return g + `<rect x="230" y="160" width="180" height="60" rx="14" fill="${C.accent}"/>` + txt(320, 185, "Majority vote", { anchor: "middle", fill: "#fff", bold: 1 }) + txt(320, 206, "Yes (5 of 7)", { anchor: "middle", fill: "#fff", size: 13, bold: 1 }); }],
      deep: ["Deep learning", "Neural networks with many layers learn complex patterns from large datasets: convolutional networks (CNN) for images, recurrent networks (RNN) for sequences and language. Powerful, but data-hungry and hard to interpret.", () => { const layers = [4, 6, 6, 2], xs = [90, 240, 390, 540]; let g = ""; const pos = layers.map((n, l) => Array.from({ length: n }, (_, i) => [xs[l], 130 + (i - (n - 1) / 2) * 34])); for (let l = 0; l < 3; l++) pos[l].forEach((a) => pos[l + 1].forEach((b) => (g += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${C.line}"/>`))); pos.forEach((ps, l) => ps.forEach((p) => (g += `<circle cx="${p[0]}" cy="${p[1]}" r="11" fill="${l === 0 ? C.accent : l === 3 ? C.violet : C.light}" stroke="#fff" stroke-width="2"/>`))); return g + txt(90, 250, "Input", { anchor: "middle", fill: C.ink, bold: 1 }) + txt(315, 250, "Hidden layers", { anchor: "middle", fill: C.ink, bold: 1 }) + txt(540, 250, "Output", { anchor: "middle", fill: C.ink, bold: 1 }); }],
    };
    let cur = "reg";
    const btns = Object.entries(F).map(([k, [n]]) => { const b = document.createElement("button"); b.className = "btn"; b.textContent = n; b.addEventListener("click", () => { cur = k; press(btns, b); render(); }); bar.appendChild(b); return b; });
    press(btns, btns[0]);
    function render() {
      svg.innerHTML = F[cur][2]();
      out.innerHTML = `<h5>${F[cur][0]}</h5><p>${F[cur][1]}</p>`;
      if (cur === "clu") {
        if (!extra.innerHTML) {
          extra.innerHTML = `<label class="range" style="min-width:160px">Clusters k <span data-out="k">${km.k}</span><input type="range" min="2" max="5" value="${km.k}" data-in="k" /></label><button class="btn is-on" data-kstep>Next iteration</button><button class="btn ghost" data-kreset>Restart</button>`;
          $(extra, "[data-in=k]").addEventListener("input", (e) => { km.k = +e.target.value; $(extra, "[data-out=k]").textContent = km.k; kInit(); render(); });
          $(extra, "[data-kstep]").addEventListener("click", () => { kStep(); render(); });
          $(extra, "[data-kreset]").addEventListener("click", () => { kInit(); render(); });
        }
        extra.hidden = false;
      } else extra.hidden = true;
    }
    kInit(); render();
  })();

  /* 2. House price regression */
  (function house() {
    const root = document.getElementById("viz-house");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), aIn = $(root, '[data-in="a"]'), bIn = $(root, '[data-in="b"]');
    const r = rng(40);
    const H = Array.from({ length: 40 }, () => { const bed = 1 + Math.floor(r() * 4.5); const area = Math.round(400 + bed * 280 + gauss(r) * 180); return { area, bed, price: 12 + 0.045 * area + 4.5 * bed + gauss(r) * 7 }; });
    const beta = lstsq(H.map((h) => [1, h.area / 1000, h.bed]), H.map((h) => h.price));
    const pred = (a, b) => beta[0] + (beta[1] * a) / 1000 + beta[2] * b;
    const res = H.map((h) => h.price - pred(h.area, h.bed)), my = mean(H.map((h) => h.price));
    const sse = res.reduce((s, v) => s + v * v, 0), sst = H.reduce((s, h) => s + (h.price - my) ** 2, 0);
    const R2 = 1 - sse / sst, RMSE = Math.sqrt(sse / H.length);
    const BC = [C.light, C.accent, C.violet, C.amber, C.rose];
    function render() {
      const a = +aIn.value, b = +bIn.value, p = pred(a, b);
      $(root, '[data-out="a"]').textContent = a.toLocaleString("en-IN") + " sq ft";
      $(root, '[data-out="b"]').textContent = b;
      const W = 640, Ht = 280, L = 50, Rt = 16, T = 20, B = 36, X = (v) => L + ((v - 400) / 2200) * (W - L - Rt), Y = (v) => T + (1 - (v - 20) / 160) * (Ht - T - B);
      let g = "";
      for (let v = 20; v <= 180; v += 40) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, "₹" + v + "L", { anchor: "end" });
      for (let v = 500; v <= 2500; v += 500) g += txt(X(v), Ht - 18, v.toLocaleString("en-IN"), { anchor: "middle" });
      g += txt((W + L) / 2, Ht - 2, "Area (sq ft)", { anchor: "middle" });
      g += `<line x1="${X(500)}" y1="${Y(pred(500, b))}" x2="${X(2500)}" y2="${Y(pred(2500, b))}" stroke="${BC[b - 1]}" stroke-width="2.5" stroke-dasharray="7 4"/>` + txt(X(2500), Y(pred(2500, b)) - 8, `model for ${b} bedroom${b > 1 ? "s" : ""}`, { anchor: "end", fill: C.ink, bold: 1, size: 10.5 });
      H.forEach((h) => (g += `<circle cx="${X(h.area)}" cy="${Y(h.price)}" r="${h.bed === b ? 6 : 4}" fill="${BC[h.bed - 1]}" opacity="${h.bed === b ? 0.95 : 0.35}" stroke="#fff"/>`));
      g += `<circle cx="${X(a)}" cy="${Y(p)}" r="10" fill="none" stroke="${C.ink}" stroke-width="2.5"/><circle cx="${X(a)}" cy="${Y(p)}" r="4" fill="${C.ink}"/>` + txt(X(a) + 14, Y(p) + 4, "₹" + p.toFixed(1) + " lakh", { fill: C.ink, bold: 1, size: 12 });
      svg.innerHTML = g;
      $(root, '[data-stat="pred"]').textContent = "₹" + p.toFixed(1) + " lakh";
      $(root, '[data-stat="r2"]').textContent = R2.toFixed(3);
      $(root, '[data-stat="rmse"]').textContent = "± ₹" + RMSE.toFixed(1) + " lakh";
      out.innerHTML = `<div class="formula">Price = ${beta[0].toFixed(1)} + ${(beta[1]).toFixed(1)} × (area ÷ 1000) + ${beta[2].toFixed(1)} × bedrooms = ₹${p.toFixed(1)} lakh</div><p>Each extra 1,000 sq ft adds about ₹${beta[1].toFixed(1)} lakh, and each extra bedroom about ₹${beta[2].toFixed(1)} lakh, holding the other fixed. The model explains ${(R2 * 100).toFixed(0)}% of the variation in prices (R²), and its predictions are typically off by about ₹${RMSE.toFixed(1)} lakh (RMSE). ${a > 2300 || (b === 5 && a < 900) || (b === 1 && a > 1600) ? "<b>Careful:</b> this combination is outside most of the training data, so the prediction is an extrapolation." : ""}</p>`;
    }
    [aIn, bIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* 3. Exponential smoothing */
  (function smooth() {
    const root = document.getElementById("viz-smooth");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), aIn = $(root, '[data-in="al"]'), tBtn = $(root, "[data-trend]");
    const r = rng(12);
    const A = Array.from({ length: 24 }, (_, t) => Math.round(300 + 3.2 * t + 38 * Math.sin((2 * Math.PI * (t - 3)) / 12) + gauss(r) * 10));
    const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let trend = false;
    function render() {
      const al = +aIn.value / 100, be = 0.2;
      $(root, '[data-out="al"]').textContent = al.toFixed(2);
      const F = [null];
      let lev = A[0], tr = A[1] - A[0];
      for (let t = 1; t < 24; t++) {
        F.push(trend ? lev + tr : lev);
        if (trend) { const nl = al * A[t] + (1 - al) * (lev + tr); tr = be * (nl - lev) + (1 - be) * tr; lev = nl; }
        else lev = al * A[t] + (1 - al) * lev;
      }
      const fut = [1, 2, 3].map((h) => (trend ? lev + h * tr : lev));
      const mae = mean(F.slice(1).map((f, i) => Math.abs(A[i + 1] - f)));
      const W = 640, Ht = 260, L = 46, Rt = 16, T = 20, B = 36, n = 27, X = (i) => L + (i / (n - 1)) * (W - L - Rt), lo = 220, hi = 420, Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (Ht - T - B);
      let g = "";
      for (let v = lo; v <= hi; v += 40) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
      for (let i = 0; i < n; i += 3) g += txt(X(i), Ht - 18, M[i % 12] + (i >= 24 ? "*" : ""), { anchor: "middle", size: 10 });
      g += txt((W + L) / 2, Ht - 2, "Month (* = forecast)", { anchor: "middle" }) + txt(L - 40, T - 8, "GWh");
      g += `<rect x="${X(23.5)}" y="${T}" width="${X(26) - X(23.5) + 8}" height="${Ht - T - B}" fill="${C.amber}" opacity=".07"/>`;
      g += `<polyline points="${A.map((v, i) => `${X(i)},${Y(v)}`).join(" ")}" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
      A.forEach((v, i) => (g += `<circle cx="${X(i)}" cy="${Y(v)}" r="3" fill="${C.ink}"/>`));
      g += `<polyline points="${F.slice(1).map((v, i) => `${X(i + 1)},${Y(v)}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/>`;
      g += `<polyline points="${[[23, A[23]], ...fut.map((v, h) => [24 + h, v])].map(([i, v]) => `${X(i)},${Y(v)}`).join(" ")}" fill="none" stroke="${C.amber}" stroke-width="2.5" stroke-dasharray="6 4"/>`;
      fut.forEach((v, h) => (g += `<circle cx="${X(24 + h)}" cy="${Y(v)}" r="4.5" fill="${C.amber}"/>`));
      svg.innerHTML = g;
      $(root, '[data-stat="mae"]').textContent = mae.toFixed(1) + " GWh";
      $(root, '[data-stat="next"]').textContent = fut[0].toFixed(0) + " GWh";
      out.innerHTML = `<p>${al >= 0.7 ? "A high α reacts quickly, so the forecast chases the latest month and lags one step behind every swing." : al <= 0.2 ? "A low α averages over a long history, so the forecast is smooth but slow to catch up with changes." : "A middle α balances reacting to change against smoothing out noise."} ${trend ? "Holt's method adds a trend term, so forecasts keep rising with the long-run growth." : "Simple smoothing has no trend term, so its forecast for every future month is the same flat value."} Neither captures the summer peak; Holt-Winters, ARIMA or LSTM models add seasonality.</p>`;
    }
    aIn.addEventListener("input", render);
    tBtn.addEventListener("click", () => { trend = !trend; tBtn.setAttribute("aria-pressed", String(trend)); render(); });
    render();
  })();

  /* 4. Ensemble voting */
  (function ens() {
    const root = document.getElementById("viz-ensemble");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), pIn = $(root, '[data-in="p"]'), rIn = $(root, '[data-in="rho"]');
    const LF = [0]; const lf = (n) => { for (let i = LF.length; i <= n; i++) LF[i] = LF[i - 1] + Math.log(i); return LF[n]; };
    const maj = (n, p) => { let s = 0; for (let k = Math.floor(n / 2) + 1; k <= n; k++) s += Math.exp(lf(n) - lf(k) - lf(n - k) + k * Math.log(p) + (n - k) * Math.log(1 - p)); return s; };
    const acc = (n, p, rho) => { const ne = n / (1 + (n - 1) * rho); const lo = Math.max(1, Math.floor(ne)), odd = (m) => (m % 2 ? m : m + 1); const a = maj(odd(lo), p), b = maj(odd(lo + 1), p), f = ne - lo; return a + (b - a) * Math.min(1, f); };
    function render() {
      const p = +pIn.value / 100, rho = +rIn.value / 100;
      $(root, '[data-out="p"]').textContent = Math.round(p * 100) + "%";
      $(root, '[data-out="rho"]').textContent = Math.round(rho * 100) + "%";
      const W = 640, Ht = 240, L = 50, Rt = 20, T = 20, B = 36, X = (n) => L + ((n - 1) / 100) * (W - L - Rt), Y = (v) => T + (1 - (v - 0.5) / 0.5) * (Ht - T - B);
      let g = "";
      for (let v = 0.5; v <= 1.0001; v += 0.1) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, Math.round(v * 100) + "%", { anchor: "end" });
      for (let n = 1; n <= 101; n += 20) g += txt(X(n), Ht - 18, n, { anchor: "middle" });
      g += txt((W + L) / 2, Ht - 2, "Number of models voting", { anchor: "middle" });
      const ns = []; for (let n = 1; n <= 101; n += 2) ns.push(n);
      g += `<polyline points="${ns.map((n) => `${X(n)},${Y(maj(n, p))}`).join(" ")}" fill="none" stroke="${C.light}" stroke-width="2.5" stroke-dasharray="6 4"/>`;
      g += `<polyline points="${ns.map((n) => `${X(n)},${Y(acc(n, p, rho))}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="3"/>`;
      g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(p)}" y2="${Y(p)}" stroke="${C.rose}" stroke-dasharray="4 3"/>` + txt(W - Rt, Y(p) - 6, "one model: " + Math.round(p * 100) + "%", { anchor: "end", fill: C.rose, bold: 1 });
      g += txt(X(101), Y(maj(101, p)) - 8, "independent mistakes", { anchor: "end", fill: C.accent, size: 10 });
      svg.innerHTML = g;
      out.innerHTML = `<p>With 25 models that are each ${Math.round(p * 100)}% accurate, a majority vote is right <b>${(acc(25, p, rho) * 100).toFixed(1)}%</b> of the time${rho ? `, compared with ${(maj(25, p) * 100).toFixed(1)}% if their mistakes were fully independent` : ""}. ${rho >= 0.5 ? "When models make the same mistakes, adding more barely helps; this is why random forests train each tree on different resampled data and features." : "Diverse models that make different mistakes are what make ensembles powerful."}</p>`;
    }
    [pIn, rIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* 5. Overfitting */
  (function overfit() {
    const root = document.getElementById("viz-overfit");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), dIn = $(root, '[data-in="d"]');
    const f = (x) => Math.sin(2.5 * Math.PI * x) * 0.9 + 0.6 * x;
    let seed = 5, train, test;
    const gen = () => { const r = rng(seed); train = Array.from({ length: 15 }, (_, i) => { const x = (i + 0.2 + r() * 0.6) / 15; return [x, f(x) + gauss(r) * 0.25]; }); test = Array.from({ length: 40 }, () => { const x = r(); return [x, f(x) + gauss(r) * 0.25]; }); };
    const feats = (x, d) => { const z = 2 * x - 1, v = [1]; for (let k = 1; k <= d; k++) v.push(z ** k); return v; };
    const fit = (d) => lstsq(train.map(([x]) => feats(x, d)), train.map((p) => p[1]), 1e-9);
    const ev = (w, x) => feats(x, w.length - 1).reduce((s, v, i) => s + v * w[i], 0);
    const rmse = (w, pts) => Math.sqrt(mean(pts.map(([x, y]) => (ev(w, x) - y) ** 2)));
    function render() {
      const d = +dIn.value;
      $(root, '[data-out="d"]').textContent = d;
      const errs = []; for (let k = 1; k <= 12; k++) { const w = fit(k); errs.push([rmse(w, train), rmse(w, test)]); }
      const w = fit(d);
      // left: fit
      const L = 20, R1 = 390, T = 16, B = 280, X = (x) => L + x * (R1 - L), lo = -1.8, hi = 2.4, Y = (v) => T + (1 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (B - T);
      let g = `<rect x="${L}" y="${T}" width="${R1 - L}" height="${B - T}" fill="${C.bg}" rx="8"/>`;
      const tp = []; for (let i = 0; i <= 200; i++) tp.push(`${X(i / 200)},${Y(f(i / 200))}`);
      g += `<polyline points="${tp.join(" ")}" fill="none" stroke="${C.soft}" stroke-width="1.5" stroke-dasharray="4 4"/>`;
      const fp = []; for (let i = 0; i <= 300; i++) { const x = i / 300; fp.push(`${X(x)},${Y(ev(w, x))}`); }
      g += `<polyline points="${fp.join(" ")}" fill="none" stroke="${C.violet}" stroke-width="3"/>`;
      test.forEach(([x, y]) => (g += `<circle cx="${X(x)}" cy="${Y(y)}" r="3.5" fill="${C.rose}" opacity=".7"/>`));
      train.forEach(([x, y]) => (g += `<circle cx="${X(x)}" cy="${Y(y)}" r="5.5" fill="${C.accent}" stroke="#fff"/>`));
      g += txt(L + 8, T + 16, `Degree ${d} fit`, { fill: C.violet, bold: 1 }) + txt(L + 8, T + 32, "dashed: true pattern", { size: 10 });
      // right: errors
      const L2 = 440, R2 = 626, T2 = 30, B2 = 250, X2 = (k) => L2 + ((k - 1) / 11) * (R2 - L2), em = 0.8, Y2 = (v) => T2 + (1 - Math.min(v, em) / em) * (B2 - T2);
      g += txt(L2, 18, "Error (RMSE) by degree", { fill: C.ink, bold: 1 });
      for (let v = 0; v <= em + 1e-9; v += 0.2) g += `<line x1="${L2}" x2="${R2}" y1="${Y2(v)}" y2="${Y2(v)}" stroke="${C.grid}"/>` + txt(L2 - 6, Y2(v) + 4, v.toFixed(1), { anchor: "end", size: 10 });
      for (let k = 1; k <= 12; k += 1) if (k === 1 || k % 3 === 0) g += txt(X2(k), B2 + 16, k, { anchor: "middle", size: 10 });
      g += `<line x1="${X2(d)}" x2="${X2(d)}" y1="${T2}" y2="${B2}" stroke="${C.violet}" stroke-dasharray="3 3"/>`;
      g += `<polyline points="${errs.map((e, i) => `${X2(i + 1)},${Y2(e[0])}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/>`;
      g += `<polyline points="${errs.map((e, i) => `${X2(i + 1)},${Y2(e[1])}`).join(" ")}" fill="none" stroke="${C.rose}" stroke-width="2.5"/>`;
      g += txt(R2, Y2(errs[11][0]) + 14, "training", { anchor: "end", fill: C.accent, bold: 1, size: 10 }) + txt(R2, Math.max(T2 + 10, Y2(Math.min(em, errs[11][1])) - 6), "test", { anchor: "end", fill: C.rose, bold: 1, size: 10 });
      svg.innerHTML = g;
      const best = errs.reduce((b, e, i) => (e[1] < errs[b][1] ? i : b), 0) + 1;
      const [tr, te] = errs[d - 1];
      out.innerHTML = `<p>Training error ${tr.toFixed(2)}, test error ${te.toFixed(2)}. ${d <= 2 ? "<b>Underfitting:</b> the model is too simple to follow the pattern, so it does badly on both training and test data." : d >= best + 3 ? "<b>Overfitting:</b> the curve bends to pass through the training points, noise and all. Training error keeps falling, but on new data it gets worse." : "<b>A good fit:</b> the model follows the real pattern without chasing noise."} For this data, test error is lowest at degree ${best}. That's why models are always judged on data they weren't trained on, often with cross-validation.</p>`;
    }
    dIn.addEventListener("input", render);
    $(root, "[data-newdata]").addEventListener("click", () => { seed = Math.floor(Math.random() * 1e6); gen(); render(); });
    gen(); render();
  })();
})();
