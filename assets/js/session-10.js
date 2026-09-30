// Session 10 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", rose: "#d94f70", amber: "#d98a0b" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const gauss = (r) => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const vari = (a) => { const m = mean(a); return a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1); };
  const corr = (x, y) => { const mx = mean(x), my = mean(y); let sxy = 0, sxx = 0, syy = 0; x.forEach((v, i) => { sxy += (v - mx) * (y[i] - my); sxx += (v - mx) ** 2; syy += (y[i] - my) ** 2; }); return sxy / Math.sqrt(sxx * syy); };

  // distributions
  const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
  const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
  const npdf = (x) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  function lgamma(x) { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t); let s = 1.000000000190015; for (const k of c) s += k / ++y; return -t + Math.log((2.5066282746310005 * s) / x); }
  function betacf(a, b, x) { let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - (qab * x) / qap; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d; let h = d; for (let m = 1; m <= 300; m++) { const m2 = 2 * m; let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2)); d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; h *= d * c; aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2)); d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 3e-12) break; } return h; }
  function ibeta(a, b, x) { if (x <= 0) return 0; if (x >= 1) return 1; const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x)); return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b; }
  const tTwoSided = (t, df) => ibeta(df / 2, 0.5, df / (df + t * t));
  function gammaQ(a, x) { // upper regularized incomplete gamma
    if (x <= 0) return 1;
    if (x < a + 1) { let sum = 1 / a, del = sum, ap = a; for (let n = 0; n < 500; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-14) break; } return 1 - sum * Math.exp(-x + a * Math.log(x) - lgamma(a)); }
    let b = x + 1 - a, c = 1e30, d = 1 / b, h = d; for (let i = 1; i < 500; i++) { const an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-30) d = 1e-30; c = b + an / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-14) break; } return Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
  }
  const chiP = (x, df) => gammaQ(df / 2, x / 2);
  const fmtP = (p) => (p < 0.0001 ? "< 0.0001" : p.toFixed(4));

  /* 1. Test mapper */
  (function mapper() {
    const root = document.getElementById("viz-map");
    if (!root) return;
    const out = $(root, ".viz-out"), fB = $$(root, "[data-f]"), tB = $$(root, "[data-t]");
    let f = "num", t = "bin";
    const M = {
      "num-num": ["Correlation test (Pearson or Spearman)", "Does the feature rise or fall with the target? Test whether r differs from 0. Example: advertising spend (feature) vs. sales (target)."],
      "num-bin": ["t-test (or Z-test for a large sample with known σ)", "Compare the feature's mean in the two target groups. Example: do churners have higher monthly charges than customers who stay? (ANOVA gives the same answer, since F = t².)"],
      "num-multi": ["ANOVA F-test", "Compare the feature's mean across three or more target classes. Example: does average age differ between Basic, Standard and Premium plan buyers?"],
      "cat-num": ["ANOVA F-test", "Group the numeric target by the feature's categories and compare means. Example: does average order value differ by region?"],
      "cat-bin": ["Chi-square test of independence", "Cross-tabulate the feature against the target and compare observed and expected counts. Example: is contract type related to churn?"],
      "cat-multi": ["Chi-square test of independence", "Same idea with a larger table. Example: is gender related to product preference across four products?"],
    };
    function render() { const [n, d] = M[`${f}-${t}`]; out.innerHTML = `<h5>${n}</h5><p>${d}</p><p class="tree-note" style="margin:0">Summary from the procedure: numerical–numerical → correlation / Z-test / t-test; numerical–categorical → ANOVA (t-test for two groups); categorical–categorical → chi-square.</p>`; }
    fB.forEach((b) => b.addEventListener("click", () => { f = b.dataset.f; press(fB, b); render(); }));
    tB.forEach((b) => b.addEventListener("click", () => { t = b.dataset.t; press(tB, b); render(); }));
    render();
  })();

  /* shared churn dataset */
  const DATA = (() => {
    const r = rng(2024), rows = [];
    for (let i = 0; i < 500; i++) {
      const u = r(), contract = u < 0.5 ? "Monthly" : u < 0.78 ? "One year" : "Two year";
      const tenure = Math.max(1, Math.round((contract === "Monthly" ? 14 : contract === "One year" ? 32 : 48) + gauss(r) * 12));
      const monthly = Math.round(Math.max(250, 700 + gauss(r) * 150));
      const total = monthly * tenure * (0.9 + r() * 0.2);
      const calls = Math.max(0, Math.round(1.5 + gauss(r) * 1.3 + (r() < 0.2 ? 2 : 0)));
      const age = Math.round(22 + r() * 48);
      const pay = ["Card", "Bank transfer", "E-wallet", "Cash"][Math.floor(r() * 4)];
      const gender = r() < 0.5 ? "Female" : "Male";
      const z = -1.1 + (contract === "Monthly" ? 1.3 : contract === "One year" ? 0 : -1.2) - 0.035 * tenure + 0.0045 * (monthly - 700) + 0.3 * (calls - 2) + (pay === "E-wallet" ? 0.35 : 0);
      rows.push({ monthly, tenure, total, calls, age, contract, pay, gender, churn: r() < 1 / (1 + Math.exp(-z)) ? 1 : 0 });
    }
    return rows;
  })();
  const FEATS = [["monthly", "Monthly charges", "num"], ["tenure", "Tenure (months)", "num"], ["total", "Total charges", "num"], ["calls", "Support calls", "num"], ["age", "Age", "num"], ["contract", "Contract type", "cat"], ["pay", "Payment method", "cat"], ["gender", "Gender", "cat"]];

  /* 2. Filter lab */
  (function filterLab() {
    const root = document.getElementById("viz-filter");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), tbl = $(root, "[data-tbl]"), aIn = $(root, '[data-in="a"]'), cBtn = $(root, "[data-corr]");
    const AL = [0.1, 0.05, 0.01, 0.001];
    let showCorr = false;
    const y = DATA.map((d) => d.churn), rate = mean(y);
    const res = FEATS.map(([k, name, type]) => {
      if (type === "num") {
        const a = DATA.filter((d) => d.churn).map((d) => d[k]), b = DATA.filter((d) => !d.churn).map((d) => d[k]);
        const va = vari(a) / a.length, vb = vari(b) / b.length, t = (mean(a) - mean(b)) / Math.sqrt(va + vb), df = (va + vb) ** 2 / (va * va / (a.length - 1) + vb * vb / (b.length - 1));
        return { k, name, type, test: "t-test", stat: t, statTxt: "t = " + t.toFixed(2), p: tTwoSided(t, df), detail: `churners ${mean(a).toFixed(k === "total" ? 0 : 1)} vs. others ${mean(b).toFixed(k === "total" ? 0 : 1)}` };
      }
      const levels = [...new Set(DATA.map((d) => d[k]))];
      let chi = 0; const rows = [];
      levels.forEach((l) => { const g = DATA.filter((d) => d[k] === l); const o1 = g.filter((d) => d.churn).length, o0 = g.length - o1; const e1 = g.length * rate, e0 = g.length * (1 - rate); chi += (o1 - e1) ** 2 / e1 + (o0 - e0) ** 2 / e0; rows.push(`${l} ${Math.round((o1 / g.length) * 100)}%`); });
      const df = levels.length - 1;
      return { k, name, type, test: "chi-square", stat: chi, statTxt: `χ² = ${chi.toFixed(1)} (df ${df})`, p: chiP(chi, df), detail: "churn rate: " + rows.join(", ") };
    }).sort((p, q) => p.p - q.p);

    function render() {
      const alpha = AL[+aIn.value];
      $(root, '[data-out="a"]').textContent = alpha;
      const W = 640, L = 150, Rt = 60, T = 20, rowH = 32, maxS = 12;
      const S = (p) => Math.min(maxS, -Math.log10(Math.max(p, 1e-12)));
      const X = (v) => L + (v / maxS) * (W - L - Rt);
      let g = "";
      for (let v = 0; v <= maxS; v += 2) g += `<line x1="${X(v)}" x2="${X(v)}" y1="${T - 4}" y2="${T + rowH * FEATS.length}" stroke="${C.grid}"/>` + txt(X(v), T + rowH * FEATS.length + 16, v === 0 ? "1" : "10⁻" + v, { anchor: "middle", size: 10 });
      g += txt((L + W - Rt) / 2, T + rowH * FEATS.length + 34, "p-value (log scale; longer bar = stronger evidence)", { anchor: "middle", size: 10.5 });
      const thr = X(-Math.log10(alpha));
      res.forEach((d, i) => {
        const keep = d.p <= alpha, yy = T + i * rowH;
        g += txt(L - 10, yy + rowH / 2 + 4, d.name, { anchor: "end", fill: C.ink, bold: 1, size: 12 });
        g += `<rect x="${L}" y="${yy + 5}" width="${Math.max(2, X(S(d.p)) - L)}" height="${rowH - 10}" rx="5" fill="${keep ? C.accent : C.line}"/>`;
        g += txt(Math.max(L + 4, X(S(d.p))) + 6, yy + rowH / 2 + 4, keep ? "keep" : "drop", { fill: keep ? C.accent : C.soft, bold: 1, size: 10.5 });
      });
      g += `<line x1="${thr}" x2="${thr}" y1="${T - 8}" y2="${T + rowH * FEATS.length}" stroke="${C.rose}" stroke-width="2" stroke-dasharray="5 3"/>` + txt(thr, T - 10, "α = " + alpha, { anchor: "middle", fill: C.rose, bold: 1, size: 10.5 });
      svg.innerHTML = g;
      if (!showCorr) {
        tbl.innerHTML = `<thead><tr><th>Feature</th><th>Type</th><th>Test</th><th>Statistic</th><th>p-value</th><th>What the data shows</th></tr></thead><tbody>${res.map((d) => `<tr><td><b>${d.name}</b></td><td>${d.type === "num" ? "Numerical" : "Categorical"}</td><td>${d.test}</td><td>${d.statTxt}</td><td>${fmtP(d.p)}</td><td>${d.detail}</td></tr>`).join("")}</tbody>`;
      } else {
        const nums = FEATS.filter((f) => f[2] === "num");
        tbl.innerHTML = `<thead><tr><th>r</th>${nums.map((f) => `<th>${f[1]}</th>`).join("")}</tr></thead><tbody>${nums.map((a) => `<tr><th>${a[1]}</th>${nums.map((b) => { const r = corr(DATA.map((d) => d[a[0]]), DATA.map((d) => d[b[0]])); const hi = a !== b && Math.abs(r) > 0.7; return `<td style="${hi ? "background:#fde7ec;font-weight:700" : a === b ? "color:#aab" : ""}">${r.toFixed(2)}</td>`; }).join("")}</tr>`).join("")}</tbody>`;
      }
      const kept = res.filter((d) => d.p <= alpha).map((d) => d.name);
      const rTT = corr(DATA.map((d) => d.tenure), DATA.map((d) => d.total));
      out.innerHTML = showCorr
        ? `<p><b>Redundancy check.</b> Tenure and total charges are correlated at r = ${rTT.toFixed(2)}: total charges is roughly monthly charges × tenure. Both pass the filter, but keeping both adds little information. A good filter keeps features correlated with the target <i>but not with each other</i>, so drop one of them (usually the less interpretable one).</p>`
        : `<p>At α = ${alpha}, the filter keeps <b>${kept.length}</b> of 8 features: ${kept.join(", ")}. ${alpha >= 0.1 ? "A loose α lets weaker features through, including some that may be noise." : alpha <= 0.001 ? "A strict α keeps only the strongest signals." : ""} Age and gender show no relationship with churn. Note what the filter can't see: whether two kept features carry the same information. Try "Check redundancy".</p>`;
    }
    aIn.addEventListener("input", render);
    cBtn.addEventListener("click", () => { showCorr = !showCorr; cBtn.setAttribute("aria-pressed", String(showCorr)); render(); });
    render();
  })();

  /* 3. Wrapper: forward / backward */
  (function wrapper() {
    const root = document.getElementById("viz-wrap");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), chips = $(root, "[data-chips]"), dB = $$(root, "[data-dir]");
    const G = { contract: 0.058, tenure: 0.034, monthly: 0.022, calls: 0.016, pay: 0.006, total: 0.012, age: 0, gender: 0 };
    const name = Object.fromEntries(FEATS.map((f) => [f[0], f[1]]));
    const acc = (set) => {
      let gains = Object.keys(G).filter((k) => set.has(k)).map((k) => (k === "total" && set.has("tenure") ? 0.002 : k === "tenure" && set.has("total") && !set.has("tenure") ? 0 : G[k])).sort((a, b) => b - a);
      let s = 0.742 + gains.reduce((t, g, i) => t + g * (1 - i * 0.06), 0);
      s -= 0.003 * [...set].filter((k) => G[k] === 0).length;
      s -= 0.0015 * Math.max(0, set.size - 5);
      return s;
    };
    let dir = "fwd", set, hist, done, log;
    const reset = () => { set = new Set(dir === "fwd" ? [] : Object.keys(G)); hist = [acc(set)]; done = false; log = []; };
    function step() {
      if (done) return;
      const cands = dir === "fwd" ? Object.keys(G).filter((k) => !set.has(k)) : [...set];
      if (!cands.length) { done = true; return; }
      const cur = acc(set);
      const scored = cands.map((k) => { const s = new Set(set); dir === "fwd" ? s.add(k) : s.delete(k); return [k, acc(s)]; }).sort((a, b) => b[1] - a[1]);
      const [best, sc] = scored[0];
      if (dir === "fwd" ? sc - cur < 0.002 : cur - sc > 0.002) { done = true; log.push(dir === "fwd" ? `Adding any remaining feature improves accuracy by less than 0.2%, so the search stops.` : `Removing any remaining feature would cost more than 0.2% accuracy, so the search stops.`); return; }
      dir === "fwd" ? set.add(best) : set.delete(best);
      hist.push(sc);
      log.push(`${dir === "fwd" ? "Added" : "Removed"} <b>${name[best]}</b> (tried ${cands.length} options): accuracy ${(sc * 100).toFixed(1)}%.`);
    }
    function render() {
      chips.innerHTML = FEATS.map((f) => `<li style="${set.has(f[0]) ? "" : "background:var(--bg-grid);color:var(--ink-soft);text-decoration:line-through"}">${f[1]}</li>`).join("");
      const W = 640, H = 220, L = 50, Rt = 20, T = 20, B = 36, n = 9, lo = 0.72, hi = 0.9;
      const X = (i) => L + (i / (n - 1)) * (W - L - Rt), Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
      let g = "";
      for (let v = lo; v <= hi + 1e-9; v += 0.04) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, Math.round(v * 100) + "%", { anchor: "end" });
      for (let i = 0; i < n; i++) g += txt(X(i), H - 18, i, { anchor: "middle" });
      g += txt((W + L) / 2, H - 2, "Step", { anchor: "middle" });
      g += `<polyline points="${hist.map((v, i) => `${X(i)},${Y(v)}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/>`;
      hist.forEach((v, i) => (g += `<circle cx="${X(i)}" cy="${Y(v)}" r="5" fill="${i === hist.length - 1 ? C.amber : C.accent}" stroke="#fff"/>` + txt(X(i), Y(v) - 10, (v * 100).toFixed(1), { anchor: "middle", size: 10, fill: C.ink })));
      svg.innerHTML = g;
      out.innerHTML = `<p>${log.length ? log.slice(-3).join("<br />") : dir === "fwd" ? "Start with no features (the model just predicts \"no churn\" for everyone, about 74% accurate). Each step adds the single feature that helps most." : "Start with all 8 features. Each step removes the feature whose removal helps most, or hurts least."}</p>${done ? `<p><b>Final subset (${set.size} features):</b> ${[...set].map((k) => name[k]).join(", ")}. ${set.has("total") && set.has("tenure") ? "" : "Total charges was left out because tenure already carries the same information: wrappers see interactions that filters miss."}</p>` : ""}`;
      $(root, "[data-step]").disabled = done; $(root, "[data-all]").disabled = done;
    }
    dB.forEach((b) => b.addEventListener("click", () => { dir = b.dataset.dir; press(dB, b); reset(); render(); }));
    $(root, "[data-step]").addEventListener("click", () => { step(); render(); });
    $(root, "[data-all]").addEventListener("click", () => { let k = 0; while (!done && k++ < 10) step(); render(); });
    $(root, "[data-reset]").addEventListener("click", () => { reset(); render(); });
    reset(); render();
  })();

  /* 4. LASSO / Ridge / trees */
  (function lasso() {
    const root = document.getElementById("viz-lasso");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), mB = $$(root, "[data-m]"), lIn = $(root, '[data-in="l"]'), lamBox = $(root, "[data-lam]");
    const B = [["Contract: monthly", 0.9], ["Tenure", -0.7], ["Monthly charges", 0.45], ["Support calls", 0.35], ["Total charges", -0.25], ["Payment: e-wallet", 0.15], ["Age", 0.05], ["Gender", -0.03]];
    const TREE = [0.31, 0.24, 0.16, 0.11, 0.09, 0.05, 0.03, 0.01];
    let m = "lasso";
    function render() {
      const lam = +lIn.value / 100;
      $(root, '[data-out="l"]').textContent = lam.toFixed(2);
      lamBox.hidden = m === "tree";
      const vals = B.map(([, b], i) => (m === "lasso" ? Math.sign(b) * Math.max(0, Math.abs(b) - lam) : m === "ridge" ? b / (1 + 3 * lam) : TREE[i]));
      const W = 640, L = 160, Rt = 30, T = 16, rowH = 32, X = m === "tree" ? (v) => L + (v / 0.35) * (W - L - Rt) : (v) => L + ((v + 1) / 2) * (W - L - Rt);
      let g = "";
      if (m !== "tree") { for (let v = -1; v <= 1.001; v += 0.5) g += `<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${T + rowH * 8}" stroke="${v === 0 ? C.ink : C.grid}"/>` + txt(X(v), T + rowH * 8 + 16, v, { anchor: "middle" }); g += txt((L + W - Rt) / 2, T + rowH * 8 + 32, "Standardized coefficient", { anchor: "middle" }); }
      else { for (let v = 0; v <= 0.35; v += 0.05) g += `<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${T + rowH * 8}" stroke="${C.grid}"/>` + txt(X(v), T + rowH * 8 + 16, v.toFixed(2), { anchor: "middle" }); g += txt((L + W - Rt) / 2, T + rowH * 8 + 32, "Share of total importance", { anchor: "middle" }); }
      vals.forEach((v, i) => {
        const y = T + i * rowH, zero = Math.abs(v) < 1e-9, x0 = m === "tree" ? X(0) : X(0);
        g += txt(L - 10, y + rowH / 2 + 4, B[i][0], { anchor: "end", fill: zero ? C.soft : C.ink, bold: !zero, size: 11.5 });
        if (zero) g += `<circle cx="${x0}" cy="${y + rowH / 2}" r="4" fill="none" stroke="${C.rose}" stroke-width="2"/>` + txt(x0 + 10, y + rowH / 2 + 4, "removed", { fill: C.rose, bold: 1, size: 10 });
        else g += `<rect x="${Math.min(x0, X(v))}" y="${y + 6}" width="${Math.abs(X(v) - x0)}" height="${rowH - 12}" rx="4" fill="${m === "tree" ? C.violet : v > 0 ? C.accent : C.amber}"/>`;
      });
      svg.innerHTML = g;
      const nz = vals.filter((v) => Math.abs(v) > 1e-9).length;
      out.innerHTML = m === "lasso" ? `<p><b>${nz} of 8 features survive.</b> LASSO subtracts the penalty from every coefficient's size, so small, weak coefficients hit exactly zero and those features drop out of the model entirely. ${lam === 0 ? "With λ = 0 this is ordinary regression." : ""} Raise λ to keep only the strongest predictors.</p>`
        : m === "ridge" ? `<p>Ridge shrinks every coefficient proportionally, so all ${nz} features stay in the model with a reduced impact. It tames large coefficients and multicollinearity, but it doesn't select features.</p>`
        : `<p>A random forest measures how much each feature improves its splits. Contract type and tenure dominate; age and gender contribute almost nothing and are candidates to drop. Importance comes from the specific model, so different models can rank features differently.</p>`;
    }
    mB.forEach((b) => b.addEventListener("click", () => { m = b.dataset.m; press(mB, b); render(); }));
    lIn.addEventListener("input", render);
    render();
  })();

  /* 5. Z-test */
  (function ztest() {
    const root = document.getElementById("viz-z");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), xIn = $(root, '[data-in="x"]'), nIn = $(root, '[data-in="n"]'), aIn = $(root, '[data-in="a"]');
    const AL = [0.1, 0.05, 0.01], ZC = [1.645, 1.96, 2.576];
    function render() {
      const x = +xIn.value, n = +nIn.value, a = AL[+aIn.value], zc = ZC[+aIn.value], se = 150 / Math.sqrt(n), z = (x - 700) / se, p = 2 * (1 - Phi(Math.abs(z)));
      $(root, '[data-out="x"]').textContent = x; $(root, '[data-out="n"]').textContent = n; $(root, '[data-out="a"]').textContent = a;
      const W = 640, H = 230, L = 20, Rt = 20, T = 30, B = 32, X = (v) => L + ((v + 4.5) / 9) * (W - L - Rt), Y = (v) => T + (1 - v / 0.44) * (H - T - B);
      const xs = []; for (let v = -4.5; v <= 4.5001; v += 0.03) xs.push(v);
      const shade = (f, col, op) => { const s = xs.filter(f); return s.length ? `<path d="M${X(s[0])},${Y(0)} ${s.map((v) => `L${X(v)},${Y(npdf(v))}`).join(" ")} L${X(s[s.length - 1])},${Y(0)} Z" fill="${col}" opacity="${op}"/>` : ""; };
      const az = Math.min(4.5, Math.abs(z));
      let g = shade((v) => v <= -zc, C.rose, 0.18) + shade((v) => v >= zc, C.rose, 0.18) + shade((v) => v <= -az, C.amber, 0.55) + shade((v) => v >= az, C.amber, 0.55);
      g += `<path d="${xs.map((v, i) => `${i ? "L" : "M"}${X(v)},${Y(npdf(v))}`).join(" ")}" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
      g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.line}"/>`;
      for (let v = -4; v <= 4; v++) g += txt(X(v), H - 12, v, { anchor: "middle" });
      [-zc, zc].forEach((c) => (g += `<line x1="${X(c)}" x2="${X(c)}" y1="${T}" y2="${Y(0)}" stroke="${C.rose}" stroke-dasharray="4 3"/>`));
      g += txt(X(-zc) - 4, T + 8, "±" + zc, { fill: C.rose, bold: 1, size: 10, anchor: "end" });
      const zc2 = Math.max(-4.4, Math.min(4.4, z)), reject = p <= a;
      g += `<line x1="${X(zc2)}" x2="${X(zc2)}" y1="${T - 12}" y2="${Y(0)}" stroke="${reject ? C.rose : C.accent}" stroke-width="3"/>` + txt(X(zc2), T - 16, "Z = " + z.toFixed(2), { anchor: "middle", fill: reject ? C.rose : C.accent, bold: 1, size: 12 });
      svg.innerHTML = g;
      $(root, '[data-stat="z"]').textContent = z.toFixed(3);
      $(root, '[data-stat="p"]').textContent = fmtP(p);
      $(root, '[data-stat="d"]').textContent = reject ? "Reject H₀" : "Fail to reject";
      $(root, '[data-stat="d"]').style.color = reject ? C.rose : C.accent;
      out.innerHTML = `<div class="formula">Z = (${x} − 700) ÷ (150 / √${n}) = ${x - 700} ÷ ${se.toFixed(2)} = ${z.toFixed(3)}</div><p>The amber area, the p-value, is ${fmtP(p)}. ${reject ? `It is at or below α = ${a}, so churners' average bill differs significantly from ₹700: keep monthly charges as a feature.` : `It is above α = ${a}, so this sample doesn't show a significant difference: on this evidence, monthly charges wouldn't pass the filter.`} ${Math.abs(x - 700) < 25 && n >= 150 ? "With a large sample even a small difference becomes significant, so also ask whether the difference is big enough to matter." : ""}</p>`;
    }
    [xIn, nIn, aIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();
})();
