// Session 18 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b", sky: "#3a8dde" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const gauss = (r) => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const sdev = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };

  // polynomial helpers on z = 2x - 1 (keeps powers well scaled)
  const truth = (x) => 0.9 * Math.sin(2 * Math.PI * x) + 0.4 * x;
  const feats = (x, d) => { const z = 2 * x - 1, v = []; for (let k = 1; k <= d; k++) v.push(z ** k); return v; };
  function solve(A, b) { const n = b.length, M = A.map((r, i) => [...r, b[i]]); for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]]; for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; } } return M.map((r, i) => r[n] / r[i]); }
  function polyFit(pts, d, ridge = 1e-9) { const X = pts.map(([x]) => [1, ...feats(x, d)]), p = d + 1, A = Array.from({ length: p }, (_, a) => Array.from({ length: p }, (_, b) => X.reduce((s, r) => s + r[a] * r[b], 0) + (a === b && a > 0 ? ridge : 0))), b = Array.from({ length: p }, (_, a) => X.reduce((s, r, i) => s + r[a] * pts[i][1], 0)); return solve(A, b); }
  const polyEval = (w, x) => w[0] + feats(x, w.length - 1).reduce((s, v, i) => s + v * w[i + 1], 0);

  /* 1. Bias–variance */
  (function bv() {
    const root = document.getElementById("viz-bv");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), dIn = $(root, '[data-in="d"]');
    const NOISE = 0.3, grid = Array.from({ length: 61 }, (_, i) => i / 60);
    let seed = 3, fits = {}, decomp = [];
    const sample = (r) => Array.from({ length: 10 }, (_, i) => { const x = (i + r()) / 10; return [x, truth(x) + gauss(r) * NOISE]; });
    function compute() {
      const r = rng(seed); fits = {}; decomp = [];
      const sets = Array.from({ length: 60 }, () => sample(r));
      for (let d = 1; d <= 9; d++) {
        const preds = sets.map((s) => { const w = polyFit(s, d); return grid.map((x) => polyEval(w, x)); });
        fits[d] = preds.slice(0, 25);
        const avg = grid.map((_, j) => mean(preds.map((p) => p[j])));
        const bias2 = mean(grid.map((x, j) => (avg[j] - truth(x)) ** 2));
        const vari = mean(grid.map((_, j) => mean(preds.map((p) => (p[j] - avg[j]) ** 2))));
        decomp.push({ d, bias2, vari, avg });
      }
    }
    function render() {
      const d = +dIn.value; $(root, '[data-out="d"]').textContent = d;
      const L = 20, R1 = 360, T = 16, B = 270, X = (x) => L + x * (R1 - L), lo = -2, hi = 2.4, Y = (v) => T + (1 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (B - T);
      let g = `<rect x="${L}" y="${T}" width="${R1 - L}" height="${B - T}" rx="8" fill="${C.bg}"/>`;
      fits[d].forEach((p) => (g += `<polyline points="${p.map((v, j) => `${X(grid[j])},${Y(v)}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="1" opacity=".35"/>`));
      g += `<polyline points="${grid.map((x) => `${X(x)},${Y(truth(x))}`).join(" ")}" fill="none" stroke="${C.ink}" stroke-width="2" stroke-dasharray="6 4"/>`;
      g += `<polyline points="${decomp[d - 1].avg.map((v, j) => `${X(grid[j])},${Y(v)}`).join(" ")}" fill="none" stroke="${C.violet}" stroke-width="3"/>`;
      g += txt(L + 8, T + 16, "teal: 25 fitted models · violet: their average · dashed: truth", { size: 10, fill: C.ink });
      // right: stacked error bars
      const L2 = 410, R2 = 628, BT = 40, BB = 250, cap = 1.0, Y2 = (v) => BB - (Math.min(v, cap) / cap) * (BB - BT), bw = (R2 - L2) / 9;
      g += txt(L2, 16, "Expected test error by degree", { fill: C.ink, bold: 1 }) + txt(L2, 30, "bias² · variance · noise", { size: 10 });
      decomp.forEach((q, i) => {
        const x = L2 + i * bw + 3, w = bw - 6, parts = [[NOISE * NOISE, C.line], [q.bias2, C.amber], [q.vari, C.rose]];
        let base = 0; parts.forEach(([v, col]) => { const y0 = Y2(base), y1 = Y2(base + v); if (y0 > y1) g += `<rect x="${x}" y="${y1}" width="${w}" height="${y0 - y1}" fill="${col}"/>`; base += v; });
        if (base > cap) g += txt(x + w / 2, BT - 3, "↑", { anchor: "middle", fill: C.rose, bold: 1 });
        g += txt(x + w / 2, BB + 14, q.d, { anchor: "middle", fill: q.d === d ? C.ink : C.soft, bold: q.d === d });
        if (q.d === d) g += `<rect x="${x - 2}" y="${BT - 2}" width="${w + 4}" height="${BB - BT + 4}" fill="none" stroke="${C.ink}" stroke-width="1.5" rx="3"/>`;
      });
      g += `<rect x="${L2}" y="275" width="10" height="10" fill="${C.amber}"/>` + txt(L2 + 14, 284, "bias²", { size: 10 }) + `<rect x="${L2 + 60}" y="275" width="10" height="10" fill="${C.rose}"/>` + txt(L2 + 74, 284, "variance", { size: 10 }) + `<rect x="${L2 + 134}" y="275" width="10" height="10" fill="${C.line}"/>` + txt(L2 + 148, 284, "noise", { size: 10 });
      svg.innerHTML = g;
      const q = decomp[d - 1], tot = q.bias2 + q.vari + NOISE * NOISE, best = decomp.reduce((b, x) => (x.bias2 + x.vari < b.bias2 + b.vari ? x : b), decomp[0]);
      out.innerHTML = `<p>Degree ${d}: bias² = ${q.bias2.toFixed(3)}, variance = ${q.vari > 100 ? q.vari.toExponential(1) : q.vari.toFixed(3)}, noise = ${(NOISE * NOISE).toFixed(3)}, so expected test error ≈ ${tot > 100 ? tot.toExponential(1) : tot.toFixed(3)}. ${d <= 2 ? "<b>High bias:</b> every fitted line misses the curve in the same way, no matter which sample it saw. That's underfitting." : q.vari > q.bias2 * 3 && d >= best.d + 2 ? "<b>High variance:</b> on average the fits follow the truth, but each one swings wildly depending on its sample. That's overfitting." : "<b>A good balance:</b> the fits follow the truth without scattering much."} The lowest total error here is at degree ${best.d}. Noise is the same for every model: no model can predict it.</p>`;
    }
    dIn.addEventListener("input", render);
    $(root, "[data-resample]").addEventListener("click", () => { seed = Math.floor(Math.random() * 1e6); compute(); render(); });
    compute(); render();
  })();

  /* 2. Regularization: coordinate descent for ridge / lasso / elastic net */
  (function reg() {
    const root = document.getElementById("viz-reg");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), lIn = $(root, '[data-in="l"]'), pB = $$(root, "[data-p]");
    const D = 9, r = rng(18);
    const train = Array.from({ length: 10 }, (_, i) => { const x = (i + 0.2 + r() * 0.6) / 10; return [x, truth(x) + gauss(r) * 0.25]; });
    const test = Array.from({ length: 80 }, () => { const x = r(); return [x, truth(x) + gauss(r) * 0.25]; });
    const Xtr = train.map(([x]) => feats(x, D)), ytr = train.map((p) => p[1]), n = train.length;
    const lam = (v) => (v === 0 ? 0 : Math.pow(10, -5 + (v * 5) / 60));
    const ALPHA = { l2: 0, l1: 1, en: 0.5 };
    let pen = "l2", cache = {};
    function fitCD(L, a) {
      if (L === 0) { const w = polyFit(train, D); return { b0: w[0], w: w.slice(1) }; }
      let w = new Array(D).fill(0), b0 = mean(ytr);
      const zj = Array.from({ length: D }, (_, j) => mean(Xtr.map((row) => row[j] ** 2)));
      const res = ytr.map((y, i) => y - b0 - Xtr[i].reduce((s, v, j) => s + v * w[j], 0));
      for (let it = 0; it < 3000; it++) {
        let maxd = 0;
        for (let j = 0; j < D; j++) {
          let rho = 0; for (let i = 0; i < n; i++) rho += Xtr[i][j] * (res[i] + Xtr[i][j] * w[j]); rho /= n;
          const st = Math.sign(rho) * Math.max(0, Math.abs(rho) - L * a), nw = st / (zj[j] + L * (1 - a)), dw = nw - w[j];
          if (dw) { for (let i = 0; i < n; i++) res[i] -= Xtr[i][j] * dw; w[j] = nw; maxd = Math.max(maxd, Math.abs(dw)); }
        }
        const db = mean(res); b0 += db; for (let i = 0; i < n; i++) res[i] -= db;
        if (maxd < 1e-7) break;
      }
      return { b0, w };
    }
    const predict = (m, x) => m.b0 + feats(x, D).reduce((s, v, j) => s + v * m.w[j], 0);
    const rmse = (m, pts) => Math.sqrt(mean(pts.map(([x, y]) => (predict(m, x) - y) ** 2)));
    function curve(p) { if (!cache[p]) cache[p] = Array.from({ length: 61 }, (_, v) => { const m = fitCD(lam(v), ALPHA[p]); return { v, test: rmse(m, test), train: rmse(m, train), m }; }); return cache[p]; }
    function render() {
      const v = +lIn.value, L = lam(v), cv = curve(pen), cur = cv[v].m;
      $(root, '[data-out="l"]').textContent = L === 0 ? "0" : L < 0.001 ? L.toExponential(0) : L.toFixed(3);
      // left: fit
      const L1 = 20, R1 = 340, T = 16, B = 280, X = (x) => L1 + x * (R1 - L1), lo = -2, hi = 2.4, Y = (y) => T + (1 - (Math.max(lo, Math.min(hi, y)) - lo) / (hi - lo)) * (B - T);
      let g = `<rect x="${L1}" y="${T}" width="${R1 - L1}" height="${B - T}" rx="8" fill="${C.bg}"/>`;
      g += `<polyline points="${Array.from({ length: 101 }, (_, i) => `${X(i / 100)},${Y(truth(i / 100))}`).join(" ")}" fill="none" stroke="${C.ink}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
      test.forEach(([x, y]) => (g += `<circle cx="${X(x)}" cy="${Y(y)}" r="2.5" fill="${C.rose}" opacity=".45"/>`));
      g += `<polyline points="${Array.from({ length: 201 }, (_, i) => `${X(i / 200)},${Y(predict(cur, i / 200))}`).join(" ")}" fill="none" stroke="${C.violet}" stroke-width="3"/>`;
      train.forEach(([x, y]) => (g += `<circle cx="${X(x)}" cy="${Y(y)}" r="5.5" fill="${C.accent}" stroke="#fff"/>`));
      g += txt(L1 + 8, T + 16, "teal: 10 training points · rose: test data", { size: 10, fill: C.ink });
      // right top: coefficients
      const L2 = 380, R2 = 628, cmax = Math.max(0.5, ...cur.w.map(Math.abs)), bw = (R2 - L2) / D, CY = (w) => 80 - (Math.max(-cmax, Math.min(cmax, w)) / cmax) * 55;
      g += txt(L2, 16, "Coefficients w₁ … w₉", { fill: C.ink, bold: 1 }) + `<line x1="${L2}" x2="${R2}" y1="80" y2="80" stroke="${C.ink}"/>`;
      cur.w.forEach((w, j) => { const x = L2 + j * bw + 3, zero = Math.abs(w) < 1e-6; g += zero ? `<circle cx="${x + (bw - 6) / 2}" cy="80" r="3.5" fill="none" stroke="${C.rose}" stroke-width="1.5"/>` : `<rect x="${x}" y="${Math.min(80, CY(w))}" width="${bw - 6}" height="${Math.max(1, Math.abs(CY(w) - 80))}" fill="${w > 0 ? C.accent : C.amber}"/>`; g += txt(x + (bw - 6) / 2, 150, "w" + (j + 1), { anchor: "middle", size: 9.5 }); });
      g += txt(R2, 30, `largest |w| = ${cmax >= 100 ? Math.round(cmax).toLocaleString("en-IN") : cmax.toFixed(2)}`, { anchor: "end", size: 9.5, fill: C.ink, bold: 1 });
      // right bottom: error vs lambda
      const bestT = Math.min(...cv.map((c) => c.test)), T3 = 180, B3 = 272, em = Math.max(0.5, 3 * bestT), X3 = (v2) => L2 + (v2 / 60) * (R2 - L2), Y3 = (e) => B3 - (Math.min(e, em) / em) * (B3 - T3);
      g += txt(L2, T3 - 8, "RMSE as λ grows", { fill: C.ink, bold: 1 });
      g += `<polyline points="${cv.map((c) => `${X3(c.v)},${Y3(c.train)}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2"/><polyline points="${cv.map((c) => `${X3(c.v)},${Y3(c.test)}`).join(" ")}" fill="none" stroke="${C.rose}" stroke-width="2.5"/>`;
      g += `<line x1="${X3(v)}" x2="${X3(v)}" y1="${T3}" y2="${B3}" stroke="${C.violet}" stroke-dasharray="3 3"/>` + txt(L2, B3 + 14, "λ = 0", { size: 9.5 }) + txt(R2, B3 + 14, "λ = 1", { size: 9.5, anchor: "end" }) + txt(R2, T3 + 2, "test (clipped at top)", { anchor: "end", fill: C.rose, bold: 1, size: 10 }) + txt(R2, B3 - 4, "train", { anchor: "end", fill: C.accent, bold: 1, size: 10 });
      svg.innerHTML = g;
      const best = cv.reduce((b, c) => (c.test < b.test ? c : b), cv[0]), nz = cur.w.filter((w) => Math.abs(w) > 1e-6).length;
      out.innerHTML = `<p>Training RMSE ${cv[v].train.toFixed(3)}, test RMSE ${cv[v].test.toFixed(3)}. ${v === 0 ? "With no penalty, the curve passes through all 10 points and swings wildly between them: classic overfitting, with enormous coefficients." : cv[v].test <= best.test * 1.12 ? "<b>Near the sweet spot:</b> the penalty removed the wild swings without flattening the real pattern." : v > best.v ? "Too much penalty: the model is now too constrained and starts to underfit." : "Some improvement; keep increasing λ."} ${pen === "l1" ? `Lasso has set ${D - nz} of the 9 coefficients exactly to zero (circles), dropping those terms.` : pen === "en" ? `Elastic Net keeps ${nz} of 9 coefficients, mixing Lasso's selection with Ridge's smooth shrinkage.` : "Ridge shrinks every coefficient but keeps all 9."} Training error always rises with λ; test error falls first, then rises.</p>`;
    }
    pB.forEach((b) => b.addEventListener("click", () => { pen = b.dataset.p; press(pB, b); render(); }));
    lIn.addEventListener("input", render);
    render();
  })();

  /* 3. Early stopping */
  (function early() {
    const root = document.getElementById("viz-early");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), eIn = $(root, '[data-in="e"]'), dBtn = $(root, "[data-drop]");
    let drop = false;
    const wig = (e) => 0.012 * Math.sin(e * 1.7) + 0.008 * Math.sin(e * 4.3);
    const trainL = (e) => (drop ? 0.14 + 0.85 * Math.exp(-e / 34) : 0.03 + 0.9 * Math.exp(-e / 30)) + wig(e) * 0.5;
    const valL = (e) => (drop ? 0.19 + 0.8 * Math.exp(-e / 32) + 0.00045 * Math.max(0, e - 80) ** 1.25 : 0.22 + 0.78 * Math.exp(-e / 26) + 0.0012 * Math.max(0, e - 40) ** 1.2) + wig(e + 5);
    const bestEpoch = () => { let b = 1; for (let e = 1; e <= 200; e++) if (valL(e) < valL(b)) b = e; return b; };
    function render() {
      const e = +eIn.value; $(root, '[data-out="e"]').textContent = e;
      const W = 640, H = 260, L = 50, Rt = 20, T = 16, B = 36, X = (v) => L + (v / 200) * (W - L - Rt), Y = (v) => T + (1 - v / 1.1) * (H - T - B);
      let g = "";
      for (let v = 0; v <= 1.0001; v += 0.25) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v.toFixed(2), { anchor: "end" });
      for (let v = 0; v <= 200; v += 40) g += txt(X(v), H - 18, v, { anchor: "middle" });
      g += txt((W + L) / 2, H - 2, "Epoch", { anchor: "middle" }) + txt(L - 44, T - 4, "Loss");
      const be = bestEpoch();
      g += `<rect x="${X(e)}" y="${T}" width="${X(200) - X(e)}" height="${H - T - B}" fill="${C.bg}" opacity=".8"/>`;
      const ep = Array.from({ length: 200 }, (_, i) => i + 1);
      g += `<polyline points="${ep.map((v) => `${X(v)},${Y(trainL(v))}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/><polyline points="${ep.map((v) => `${X(v)},${Y(valL(v))}`).join(" ")}" fill="none" stroke="${C.rose}" stroke-width="2.5"/>`;
      g += `<line x1="${X(be)}" x2="${X(be)}" y1="${T}" y2="${H - B}" stroke="${C.rose}" stroke-dasharray="4 3"/>` + txt(X(be) + 4, T + 12, "lowest validation loss", { fill: C.rose, bold: 1, size: 10 });
      g += `<line x1="${X(e)}" x2="${X(e)}" y1="${T}" y2="${H - B}" stroke="${C.ink}" stroke-width="2.5"/>` + `<circle cx="${X(e)}" cy="${Y(valL(e))}" r="5" fill="${C.rose}"/><circle cx="${X(e)}" cy="${Y(trainL(e))}" r="5" fill="${C.accent}"/>`;
      svg.innerHTML = g;
      const gap = valL(e) - trainL(e);
      out.innerHTML = `<p>Stopping at epoch ${e}: training loss ${trainL(e).toFixed(3)}, validation loss ${valL(e).toFixed(3)} (gap ${gap.toFixed(3)}). ${e < be - 15 ? "Stopped too early: both losses are still falling, so the model is underfit." : Math.abs(e - be) <= 15 ? "<b>Good stopping point:</b> close to the epoch with the lowest validation loss (" + be + ")." : `Past epoch ${be}, validation loss rises while training loss keeps falling: the network is memorizing the training set. Early stopping would keep the weights from epoch ${be}.`} ${drop ? "With dropout, training loss is higher (the network is deliberately handicapped during training), but validation loss rises much more slowly, so the model tolerates longer training and generalizes better." : "Try switching on dropout."} Curves are illustrative.</p>`;
    }
    eIn.addEventListener("input", render);
    dBtn.addEventListener("click", () => { drop = !drop; dBtn.setAttribute("aria-pressed", String(drop)); render(); });
    $(root, "[data-best]").addEventListener("click", () => { eIn.value = bestEpoch(); render(); });
    render();
  })();

  /* 4. Tree pruning */
  (function prune() {
    const root = document.getElementById("viz-prune");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), dIn = $(root, '[data-in="dp"]');
    const r = rng(44);
    const gen = (n) => Array.from({ length: n }, () => { const x = r(), y = r(), inside = (x - 0.45) ** 2 + ((y - 0.55) ** 2) * 1.3 < 0.1; return { x, y, c: (r() < 0.13 ? !inside : inside) ? 1 : 0 }; });
    const train = gen(200), test = gen(600);
    const gini = (a) => { if (!a.length) return 0; const p = a.filter((d) => d.c).length / a.length; return 2 * p * (1 - p); };
    function build(data, depth, maxD, box) {
      const p = data.filter((d) => d.c).length / (data.length || 1), node = { box, pred: p >= 0.5 ? 1 : 0, n: data.length };
      if (depth >= maxD || data.length < 2 || p === 0 || p === 1) return node;
      let best = null;
      ["x", "y"].forEach((f) => {
        const vals = [...new Set(data.map((d) => d[f]))].sort((a, b) => a - b);
        for (let i = 1; i < vals.length; i++) {
          const t = (vals[i - 1] + vals[i]) / 2, L = data.filter((d) => d[f] < t), R = data.filter((d) => d[f] >= t);
          const s = (L.length * gini(L) + R.length * gini(R)) / data.length;
          if (!best || s < best.s - 1e-12) best = { f, t, s, L, R };
        }
      });
      if (!best || best.s >= gini(data) - 1e-12) return node;
      const [x0, x1, y0, y1] = box;
      node.split = best;
      node.left = build(best.L, depth + 1, maxD, best.f === "x" ? [x0, best.t, y0, y1] : [x0, x1, y0, best.t]);
      node.right = build(best.R, depth + 1, maxD, best.f === "x" ? [best.t, x1, y0, y1] : [x0, x1, best.t, y1]);
      return node;
    }
    const pred = (nd, d) => (nd.split ? pred(d[nd.split.f] < nd.split.t ? nd.left : nd.right, d) : nd.pred);
    const leaves = (nd) => (nd.split ? [...leaves(nd.left), ...leaves(nd.right)] : [nd]);
    const acc = (tree, set) => set.filter((d) => pred(tree, d) === d.c).length / set.length;
    const trees = Array.from({ length: 10 }, (_, i) => build(train, 0, i + 1, [0, 1, 0, 1]));
    const scores = trees.map((t) => ({ tr: acc(t, train), te: acc(t, test), lv: leaves(t).length }));
    function render() {
      const d = +dIn.value, tree = trees[d - 1]; $(root, '[data-out="dp"]').textContent = d;
      const S = 270, ox = 20, oy = 14, X = (v) => ox + v * S, Y = (v) => oy + (1 - v) * S;
      let g = "";
      leaves(tree).forEach((lf) => { const [x0, x1, y0, y1] = lf.box; g += `<rect x="${X(x0)}" y="${Y(y1)}" width="${X(x1) - X(x0)}" height="${Y(y0) - Y(y1)}" fill="${lf.pred ? C.accent : C.rose}" opacity=".16" stroke="#fff" stroke-width=".6"/>`; });
      train.forEach((p) => (g += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="3.4" fill="${p.c ? C.accent : C.rose}"/>`));
      g += `<rect x="${ox}" y="${oy}" width="${S}" height="${S}" fill="none" stroke="${C.line}"/>`;
      // accuracy chart
      const L2 = 350, R2 = 628, T2 = 30, B2 = 260, X2 = (k) => L2 + ((k - 1) / 9) * (R2 - L2), Y2 = (v) => B2 - ((v - 0.6) / 0.4) * (B2 - T2);
      g += txt(L2, 16, "Accuracy by maximum depth", { fill: C.ink, bold: 1 });
      for (let v = 0.6; v <= 1.0001; v += 0.1) g += `<line x1="${L2}" x2="${R2}" y1="${Y2(v)}" y2="${Y2(v)}" stroke="${C.grid}"/>` + txt(L2 - 6, Y2(v) + 4, Math.round(v * 100) + "%", { anchor: "end", size: 10 });
      for (let k = 1; k <= 10; k++) g += txt(X2(k), B2 + 14, k, { anchor: "middle", size: 10, fill: k === d ? C.ink : C.soft, bold: k === d });
      g += `<polyline points="${scores.map((s, i) => `${X2(i + 1)},${Y2(s.tr)}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/><polyline points="${scores.map((s, i) => `${X2(i + 1)},${Y2(s.te)}`).join(" ")}" fill="none" stroke="${C.rose}" stroke-width="2.5"/>`;
      g += `<line x1="${X2(d)}" x2="${X2(d)}" y1="${T2}" y2="${B2}" stroke="${C.violet}" stroke-dasharray="3 3"/>` + txt(R2, Y2(scores[9].tr) - 6, "training", { anchor: "end", fill: C.accent, bold: 1, size: 10 }) + txt(R2, Y2(scores[9].te) + 14, "test", { anchor: "end", fill: C.rose, bold: 1, size: 10 });
      svg.innerHTML = g;
      const s = scores[d - 1], bestD = scores.reduce((b, x, i) => (x.te > scores[b].te ? i : b), 0) + 1;
      out.innerHTML = `<p>Depth ${d}: ${s.lv} leaves, training accuracy ${(s.tr * 100).toFixed(0)}%, test accuracy ${(s.te * 100).toFixed(0)}%. ${d <= 2 ? "The tree is too shallow to trace the curved boundary: it underfits." : d > bestD + 1 ? "The tree has grown tiny leaves around individual mislabeled points. Training accuracy climbs toward 100%, but test accuracy falls: it's memorizing noise." : "A good depth: the leaves follow the real boundary."} Test accuracy peaks at depth ${bestD}. Pruning cuts the tree back to about that size, and cross-validation is the usual way to choose it.</p>`;
    }
    dIn.addEventListener("input", render);
    render();
  })();

  /* 5. K-fold stepper */
  (function kfold() {
    const root = document.getElementById("viz-kfold");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), kIn = $(root, '[data-in="k"]'), sBtn = $(root, "[data-strat]");
    const back = $(root, '[data-dir="-1"]'), next = $(root, '[data-dir="1"]');
    const r = rng(40), items = Array.from({ length: 40 }, (_, i) => ({ id: i, churn: i < 10 }));
    const shuffled = [...items]; for (let i = 39; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    let strat = false, it = 0;
    const COLS = [C.accent, C.violet, C.amber, C.sky, C.rose, "#5aa36a", "#b0578f", "#7a8a2e", "#4f6fbf", "#c06b3e"];
    function folds(k) {
      const f = Array.from({ length: k }, () => []);
      if (!strat) shuffled.forEach((d, i) => f[Math.floor((i * k) / 40)].push(d));
      else { let a = 0; shuffled.filter((d) => d.churn).forEach((d) => f[a++ % k].push(d)); shuffled.filter((d) => !d.churn).forEach((d) => f[a++ % k].push(d)); }
      return f;
    }
    function render() {
      const k = +kIn.value; $(root, '[data-out="k"]').textContent = k;
      if (it >= k) it = k - 1;
      const F = folds(k), W = 640;
      let g = txt(20, 18, `Iteration ${it + 1} of ${k}: fold ${it + 1} is the test set, folds ${F.map((_, i) => i + 1).filter((i) => i !== it + 1).join(", ")} train the model`, { fill: C.ink, bold: 1 });
      const gap = 8, fw = (W - 40 - gap * (k - 1)) / k;
      F.forEach((fold, i) => {
        const x0 = 20 + i * (fw + gap), test = i === it;
        g += `<rect x="${x0}" y="34" width="${fw}" height="120" rx="10" fill="${test ? "#fff" : C.bg}" stroke="${test ? C.ink : C.line}" stroke-width="${test ? 3 : 1}"/>` + txt(x0 + fw / 2, 52, `Fold ${i + 1}`, { anchor: "middle", fill: test ? C.ink : C.soft, bold: 1, size: 10.5 }) + txt(x0 + fw / 2, 170, test ? "TEST" : "train", { anchor: "middle", fill: test ? C.rose : C.accent, bold: 1, size: 10.5 });
        const cols = Math.max(1, Math.floor((fw - 8) / 12));
        fold.forEach((d, j) => (g += `<circle cx="${x0 + 10 + (j % cols) * 12}" cy="${66 + Math.floor(j / cols) * 12}" r="4.5" fill="${d.churn ? C.rose : C.light}"/>`));
        const rate = fold.filter((d) => d.churn).length / fold.length;
        g += `<rect x="${x0}" y="184" width="${fw}" height="10" rx="5" fill="${C.grid}"/><rect x="${x0}" y="184" width="${fw * rate}" height="10" rx="5" fill="${C.rose}"/>` + txt(x0 + fw / 2, 210, Math.round(rate * 100) + "% churn", { anchor: "middle", size: 9.5 });
      });
      g += txt(20, 238, `Overall churn rate: 25% · each iteration trains on ${40 - F[it].length} customers and tests on ${F[it].length}`, { size: 10.5 });
      svg.innerHTML = g;
      const rates = F.map((f) => f.filter((d) => d.churn).length / f.length), lo = Math.min(...rates), hi = Math.max(...rates);
      out.innerHTML = `<p>After all ${k} iterations, every customer has been in the test set exactly once, and the model's score is the average of the ${k} test scores. ${k === 2 ? "With k = 2 each model trains on only half the data." : k === 10 ? "With k = 10 each model trains on 90% of the data, but the model is trained 10 times." : ""} ${strat ? `<b>Stratified:</b> every fold has the same 25% churn rate as the full data, so each test is representative.` : `Without stratification, fold churn rates range from ${Math.round(lo * 100)}% to ${Math.round(hi * 100)}%${hi - lo > 0.2 ? ", so some tests are unrepresentative" : ""}. Try Stratified.`} With k = n (here 40), this becomes leave-one-out cross-validation.</p>`;
      back.disabled = it === 0; next.disabled = it === k - 1;
    }
    kIn.addEventListener("input", () => { it = 0; render(); });
    sBtn.addEventListener("click", () => { strat = !strat; sBtn.setAttribute("aria-pressed", String(strat)); render(); });
    back.addEventListener("click", () => { if (it > 0) { it--; render(); } });
    next.addEventListener("click", () => { if (it < +kIn.value - 1) { it++; render(); } });
    render();
  })();

  /* 6. Holdout vs CV stability */
  (function stability() {
    const root = document.getElementById("viz-stability");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), nIn = $(root, '[data-in="n"]');
    const SIZES = [100, 200, 500, 1000, 2000];
    let runSeed = 1, results = null;
    const dataFor = (n) => { const r = rng(n * 7 + 1); return Array.from({ length: n }, () => { const a = gauss(r), b = gauss(r), p = 1 / (1 + Math.exp(-(0.3 + 1.2 * a - 0.9 * b))); return [a, b, r() < p ? 1 : 0]; }); };
    function fitLR(D) { let w = [0, 0, 0]; for (let it = 0; it < 8; it++) { const g = [0, 0, 0], H = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; D.forEach(([a, b, y]) => { const x = [1, a, b], p = 1 / (1 + Math.exp(-(w[0] + w[1] * a + w[2] * b))), s = p * (1 - p); for (let i = 0; i < 3; i++) { g[i] += (y - p) * x[i]; for (let j = 0; j < 3; j++) H[i][j] += s * x[i] * x[j] + (i === j ? 1e-6 : 0); } }); w = w.map((v, i) => v + solve(H, g)[i]); } return w; }
    const accOf = (w, D) => D.filter(([a, b, y]) => (w[0] + w[1] * a + w[2] * b > 0 ? 1 : 0) === y).length / D.length;
    function run() {
      const n = SIZES[+nIn.value], D = dataFor(n), r = rng(runSeed * 97 + n), hold = [], cv = [];
      const shuf = () => { const s = [...D]; for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; } return s; };
      for (let rep = 0; rep < 60; rep++) {
        const s = shuf(), cut = Math.floor(n * 0.8); hold.push(accOf(fitLR(s.slice(0, cut)), s.slice(cut)));
        const s2 = shuf(), sc = []; for (let f = 0; f < 5; f++) { const a = Math.floor((f * n) / 5), b = Math.floor(((f + 1) * n) / 5); sc.push(accOf(fitLR([...s2.slice(0, a), ...s2.slice(b)]), s2.slice(a, b))); } cv.push(mean(sc));
      }
      results = { n, hold, cv };
    }
    function render() {
      $(root, '[data-out="n"]').textContent = SIZES[+nIn.value].toLocaleString("en-IN");
      if (!results || results.n !== SIZES[+nIn.value]) run();
      const { n, hold, cv } = results, all = [...hold, ...cv], lo = Math.min(...all) - 0.02, hi = Math.max(...all) + 0.02;
      const W = 640, L = 150, Rt = 20, X = (v) => L + ((v - lo) / (hi - lo)) * (W - L - Rt);
      let g = "";
      const step = hi - lo > 0.2 ? 0.05 : 0.02;
      for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) g += `<line x1="${X(v)}" x2="${X(v)}" y1="20" y2="190" stroke="${C.grid}"/>` + txt(X(v), 206, Math.round(v * 100) + "%", { anchor: "middle", size: 10 });
      [[hold, "80/20 holdout", 60, C.amber], [cv, "5-fold CV", 145, C.accent]].forEach(([arr, lab, y, col]) => {
        g += txt(L - 12, y + 4, lab, { anchor: "end", fill: C.ink, bold: 1, size: 12 });
        const st = {}; arr.forEach((v) => { const k = Math.round(X(v) / 5), h = (st[k] = (st[k] || 0) + 1); g += `<circle cx="${X(v)}" cy="${y - 18 + ((h * 7) % 36)}" r="3.5" fill="${col}" opacity=".7"/>`; });
        const m = mean(arr), s = sdev(arr);
        g += `<rect x="${X(m - s)}" y="${y + 22}" width="${X(m + s) - X(m - s)}" height="6" rx="3" fill="${col}" opacity=".5"/><line x1="${X(m)}" x2="${X(m)}" y1="${y - 22}" y2="${y + 30}" stroke="${C.ink}" stroke-width="2"/>`;
      });
      g += txt((W + L) / 2, 224, "Estimated accuracy (each dot = one evaluation with a different random split)", { anchor: "middle", size: 10 });
      svg.innerHTML = g;
      const sh = sdev(hold), sc = sdev(cv);
      out.innerHTML = `<p>With ${n.toLocaleString("en-IN")} samples, the holdout estimates range from ${(Math.min(...hold) * 100).toFixed(1)}% to ${(Math.max(...hold) * 100).toFixed(1)}% (SD ${(sh * 100).toFixed(1)} points), purely depending on which rows landed in the test set. Five-fold CV estimates vary with an SD of just ${(sc * 100).toFixed(1)} points: about ${(sh / sc).toFixed(1)}× more stable. ${n <= 200 ? "On small datasets a single holdout split can badly mislead you." : n >= 1000 ? "With lots of data even a holdout test set is large enough to be fairly stable, which is why holdout is fine for large datasets." : "Try a smaller or larger dataset."}</p>`;
    }
    nIn.addEventListener("input", render);
    $(root, "[data-rerun]").addEventListener("click", () => { runSeed++; results = null; render(); });
    render();
  })();
})();
