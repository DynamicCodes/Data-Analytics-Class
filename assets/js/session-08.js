// Session 08 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  const inr = (v) => "₹" + Math.round(v).toLocaleString("en-IN");
  const R = Math.random;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const gauss = (r = R) => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
  const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  // distributions
  const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
  const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
  const npdf = (x, m = 0, s = 1) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
  function lgamma(x) { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t); let s = 1.000000000190015; for (const k of c) s += k / ++y; return -t + Math.log((2.5066282746310005 * s) / x); }
  function betacf(a, b, x) { let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - (qab * x) / qap; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d; let h = d; for (let m = 1; m <= 200; m++) { const m2 = 2 * m; let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2)); d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; h *= d * c; aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2)); d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 3e-12) break; } return h; }
  function ibeta(a, b, x) { if (x <= 0) return 0; if (x >= 1) return 1; const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x)); return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b; }
  const tcdf = (t, df) => { const x = df / (df + t * t), p = 0.5 * ibeta(df / 2, 0.5, x); return t >= 0 ? 1 - p : p; };
  const tpdf = (t, df) => Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI) - ((df + 1) / 2) * Math.log(1 + (t * t) / df));
  const inv = (cdf, p) => { let lo = -40, hi = 40; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; cdf(m) < p ? (lo = m) : (hi = m); } return (lo + hi) / 2; };

  // shared salary population for the CI visuals
  const POP_MU = 63150, POP_SD = 12800;
  const salaryPop = (() => { const r = rng(42); let a = Array.from({ length: 500 }, () => gauss(r)); const m = mean(a), s = Math.sqrt(a.reduce((t, v) => t + (v - m) ** 2, 0) / a.length); return a.map((v) => POP_MU + ((v - m) / s) * POP_SD); })();
  const sampleFrom = (pop, n) => Array.from({ length: n }, () => pop[Math.floor(R() * pop.length)]); // with replacement, as the CI formula assumes

  /* ------------------------------------------------------------
     1. Sampling methods
  ------------------------------------------------------------ */
  (function methods() {
    const root = document.getElementById("viz-methods");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), bar = $(root, "[data-mbtns]");
    const r = rng(7);
    const officeFx = [6000, 3500, 1500, 0, -1000, -2000, -3000, -4500, -5500, -7000];
    const emp = [];
    for (let o = 0; o < 10; o++) for (let i = 0; i < 50; i++) {
      const senior = r() < 0.3;
      emp.push({ id: emp.length, o, i, senior, s: (senior ? 84000 : 54000) + officeFx[o] + gauss(r) * (senior ? 8000 : 5500) });
    }
    const MU = mean(emp.map((e) => e.s)), SEN = emp.filter((e) => e.senior).length / 500;
    const M = {
      srs: ["Simple random", "Every employee has the same chance, like drawing 50 names from a hat. Sample means scatter evenly around μ.", () => shuffle(emp).slice(0, 50)],
      sys: ["Systematic", "A random start, then every 10th employee on the staff list. Easy to do and usually close to random, unless the list has a repeating pattern.", () => { const s = Math.floor(R() * 10); return emp.filter((e) => e.id % 10 === s); }],
      strat: ["Stratified", "Staff are split into juniors and seniors, and 35 juniors and 15 seniors are drawn at random, matching the 70/30 split. Seniors are always fairly represented, so estimates are the most precise.", () => [...shuffle(emp.filter((e) => !e.senior)).slice(0, 35), ...shuffle(emp.filter((e) => e.senior)).slice(0, 15)]],
      clus: ["Cluster", "One whole office is picked at random and everyone in it is surveyed. Cheap, but offices pay differently, so the estimate swings depending on which office you get.", () => { const o = Math.floor(R() * 10); return emp.filter((e) => e.o === o); }],
      conv: ["Convenience", "Survey the 50 people easiest to reach: everyone in the head office. Every sample is the same biased group, and head office pays above average.", () => emp.filter((e) => e.o === 0)],
      judg: ["Judgment", "A manager hand-picks the \"most experienced\" staff, mostly seniors. The sample mean lands far above the true mean.", () => [...shuffle(emp.filter((e) => e.senior)).slice(0, 40), ...shuffle(emp.filter((e) => !e.senior)).slice(0, 10)]],
      quota: ["Quota", "Fill a quota of 35 juniors and 15 seniors, but take whoever is available in the two nearest offices. The level mix is right, yet those offices pay more, so the estimate is biased.", () => { const near = emp.filter((e) => e.o < 2); return [...shuffle(near.filter((e) => !e.senior)).slice(0, 35), ...shuffle(near.filter((e) => e.senior)).slice(0, 15)]; }],
    };
    let m = "srs", picked = new Set(), hist = [], lastSen = null;
    const btns = Object.entries(M).map(([k, [name]]) => { const b = document.createElement("button"); b.className = "btn"; b.textContent = name; b.addEventListener("click", () => { m = k; press(btns, b); picked = new Set(); hist = []; lastSen = null; render(); }); bar.appendChild(b); return b; });
    press(btns, btns[0]);
    const draw = () => { const s = M[m][2](); picked = new Set(s.map((e) => e.id)); hist.push(mean(s.map((e) => e.s))); lastSen = s.filter((e) => e.senior).length / s.length; };

    function render() {
      let g = "";
      const bw = 122, bh = 74, gap = 8;
      emp.forEach((e) => {
        const bx = 4 + (e.o % 5) * (bw + gap), by = 4 + Math.floor(e.o / 5) * (bh + 12);
        if (e.i === 0) g += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10" fill="${C.bg}" stroke="${C.line}"/>` + txt(bx + 8, by + 14, e.o === 0 ? "Head office" : "Office " + (e.o + 1), { size: 10, fill: C.ink, bold: 1 });
        const x = bx + 12 + (e.i % 10) * 11, y = by + 26 + Math.floor(e.i / 10) * 10.5, on = picked.has(e.id);
        g += `<circle cx="${x}" cy="${y}" r="${on ? 4.6 : 3.6}" fill="${e.senior ? C.violet : C.accent}" opacity="${!picked.size || on ? 1 : 0.25}" ${on ? `stroke="${C.ink}" stroke-width="1.5"` : ""}/>`;
      });
      // sampling distribution strip
      const x0 = 30, x1 = 610, lo = 50000, hi = 80000, X = (v) => x0 + ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (x1 - x0), base = 300;
      g += txt(x0, 190, "Sample means so far", { fill: C.ink, bold: 1, size: 12 });
      g += `<line x1="${x0}" x2="${x1}" y1="${base}" y2="${base}" stroke="${C.line}" stroke-width="2"/>`;
      for (let v = lo; v <= hi; v += 5000) g += txt(X(v), base + 16, "₹" + v / 1000 + "k", { anchor: "middle", size: 10 });
      g += `<line x1="${X(MU)}" x2="${X(MU)}" y1="198" y2="${base}" stroke="${C.ink}" stroke-width="2" stroke-dasharray="5 3"/>` + txt(X(MU) + 4, 208, "μ", { fill: C.ink, bold: 1, size: 13 });
      const st = {};
      hist.forEach((v, k) => { const key = Math.round(X(v) / 5); const h = (st[key] = (st[key] || 0) + 1); if (h <= 20) g += `<circle cx="${X(v)}" cy="${base - 5 - (h - 1) * 4.6}" r="2.6" fill="${k === hist.length - 1 ? C.amber : C.accent}"/>`; });
      svg.innerHTML = g;
      const last = hist[hist.length - 1];
      $(root, '[data-stat="mu"]').textContent = inr(MU);
      $(root, "[data-sen]").textContent = Math.round(SEN * 100) + "%";
      $(root, '[data-stat="xbar"]').textContent = last ? inr(last) : "–";
      $(root, '[data-stat="sen"]').textContent = lastSen === null ? "–" : Math.round(lastSen * 100) + "%";
      const extra = hist.length > 5 ? ` Over ${hist.length} samples, x̄ averages ${inr(mean(hist))} (off by ${inr(Math.abs(mean(hist) - MU))}) with a spread of ${inr(sd(hist))}.` : "";
      out.innerHTML = `<p><b>${M[m][0]}${["conv", "judg", "quota"].includes(m) ? " (non-probability)" : " (probability)"}.</b> ${M[m][1]}${extra}</p>`;
    }
    $$(root, "[data-draw]").forEach((b) => b.addEventListener("click", () => { for (let i = 0; i < +b.dataset.draw; i++) draw(); render(); }));
    render();
  })();

  /* ------------------------------------------------------------
     2. Estimator properties
  ------------------------------------------------------------ */
  (function estimators() {
    const root = document.getElementById("viz-estimators");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), nIn = $(root, '[data-in="n"]');
    const MU = 70, SIG = 10, K = 500;
    const E = [
      ["Sample mean", (s) => mean(s)],
      ["Sample median", (s) => median(s)],
      ["First value only", (s) => s[0]],
      ["Drop-lowest mean", (s) => { const t = [...s].sort((a, b) => a - b).slice(1); return t.length ? mean(t) : s[0]; }],
    ];
    function render() {
      const n = +nIn.value;
      $(root, '[data-out="n"]').textContent = n;
      const res = E.map(() => []);
      for (let k = 0; k < K; k++) { const s = Array.from({ length: n }, () => MU + SIG * gauss()); E.forEach(([, f], i) => res[i].push(f(s))); }
      const L = 170, Rt = 616, lo = 45, hi = 95, X = (v) => L + ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (Rt - L), rowH = 62;
      let g = "";
      for (let v = 50; v <= 90; v += 10) g += `<line x1="${X(v)}" x2="${X(v)}" y1="14" y2="${14 + rowH * 4}" stroke="${C.grid}"/>` + txt(X(v), 14 + rowH * 4 + 16, v, { anchor: "middle" });
      g += `<line x1="${X(MU)}" x2="${X(MU)}" y1="8" y2="${14 + rowH * 4}" stroke="${C.violet}" stroke-width="2"/>` + txt(X(MU) + 4, 10, "μ = 70", { fill: C.violet, bold: 1 });
      const stats = res.map((a) => [mean(a) - MU, sd(a)]);
      res.forEach((a, i) => {
        const y0 = 14 + rowH * i;
        g += txt(L - 12, y0 + rowH / 2 - 2, E[i][0], { anchor: "end", fill: C.ink, bold: 1, size: 11.5 }) + txt(L - 12, y0 + rowH / 2 + 13, `bias ${stats[i][0] >= 0 ? "+" : ""}${stats[i][0].toFixed(2)} · SD ${stats[i][1].toFixed(2)}`, { anchor: "end", size: 10 });
        a.forEach((v, k) => (g += `<circle cx="${X(v).toFixed(1)}" cy="${(y0 + 10 + ((k * 37) % 41)).toFixed(1)}" r="1.8" fill="${[C.accent, C.violet, C.amber, C.rose][i]}" opacity=".45"/>`));
      });
      g += txt((L + Rt) / 2, 14 + rowH * 4 + 32, "Estimated mean score", { anchor: "middle" });
      svg.innerHTML = g;
      const [m, md, f, b] = stats;
      out.innerHTML = `<p><b>Sample mean:</b> unbiased, with the tightest spread of the unbiased estimators (SD ${m[1].toFixed(2)} ≈ σ/√n = ${(SIG / Math.sqrt(n)).toFixed(2)}), so it is efficient. <b>Median:</b> also centered on 70 but about ${(md[1] / m[1]).toFixed(2)}× as spread out: less efficient. <b>First value only:</b> unbiased but ignores the rest of the data, so it never improves with n: not consistent or sufficient. <b>Dropping the lowest score:</b> biased upward by ${b[0].toFixed(2)}. ${n < 20 ? "Increase n to see the good estimators tighten." : "Its bias shrinks as n grows, so it is consistent even though it is biased."}</p>`;
    }
    nIn.addEventListener("input", render);
    $(root, "[data-rerun]").addEventListener("click", render);
    render();
  })();

  /* ------------------------------------------------------------
     3. Confidence interval explorer
  ------------------------------------------------------------ */
  (function ci() {
    const root = document.getElementById("viz-ci");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), nIn = $(root, '[data-in="n"]'), cIn = $(root, '[data-in="c"]');
    const LV = [["90%", 1.645], ["95%", 1.96], ["99%", 2.576]];
    let sample = null;
    function render(resample) {
      const n = +nIn.value, [lab, z] = LV[+cIn.value];
      $(root, '[data-out="n"]').textContent = n;
      $(root, '[data-out="c"]').textContent = lab;
      if (resample || !sample || sample.length !== n) sample = sampleFrom(salaryPop, n);
      const xb = mean(sample), moe = (z * POP_SD) / Math.sqrt(n), lo = xb - moe, hi = xb + moe, hit = POP_MU >= lo && POP_MU <= hi;
      const L = 20, Rt = 620, a = 52000, b = 74000, X = (v) => L + ((Math.max(a, Math.min(b, v)) - a) / (b - a)) * (Rt - L);
      let g = "";
      for (let v = 52000; v <= 74000; v += 2000) g += `<line x1="${X(v)}" x2="${X(v)}" y1="30" y2="110" stroke="${C.grid}"/>` + txt(X(v), 128, "₹" + v / 1000 + "k", { anchor: "middle", size: 10 });
      g += `<line x1="${X(POP_MU)}" x2="${X(POP_MU)}" y1="18" y2="112" stroke="${C.amber}" stroke-width="2.5" stroke-dasharray="6 4"/>` + txt(X(POP_MU), 14, "True mean μ = " + inr(POP_MU), { anchor: "middle", fill: C.amber, bold: 1 });
      const col = hit ? C.accent : C.rose;
      g += `<rect x="${X(lo)}" y="60" width="${X(hi) - X(lo)}" height="20" rx="10" fill="${col}" opacity=".22"/><line x1="${X(lo)}" x2="${X(hi)}" y1="70" y2="70" stroke="${col}" stroke-width="3"/>`;
      g += `<line x1="${X(lo)}" x2="${X(lo)}" y1="58" y2="82" stroke="${col}" stroke-width="3"/><line x1="${X(hi)}" x2="${X(hi)}" y1="58" y2="82" stroke="${col}" stroke-width="3"/>`;
      g += `<circle cx="${X(xb)}" cy="70" r="7" fill="${C.ink}"/>` + txt(X(xb), 100, "x̄", { anchor: "middle", fill: C.ink, bold: 1, size: 12 });
      g += txt(L, 145, `${lab} interval, n = ${n}`, { size: 10 });
      svg.innerHTML = g;
      $(root, '[data-stat="xbar"]').textContent = inr(xb);
      $(root, '[data-stat="moe"]').textContent = "± " + inr(moe);
      $(root, '[data-stat="ci"]').textContent = `${inr(lo)} – ${inr(hi)}`;
      out.innerHTML = `<div class="formula">${inr(xb)} ± ${z} × 12,800 ÷ √${n} = ${inr(xb)} ± ${inr(moe)}</div><p>This interval ${hit ? "<b>captures</b>" : "<b>misses</b>"} the true mean. ${n < 40 ? "Small samples give wide intervals." : "Quadrupling n halves the margin of error."} ${lab === "99%" ? "Higher confidence needs a wider interval." : lab === "90%" ? "Lower confidence gives a narrower interval, but it misses more often." : ""}</p>`;
    }
    nIn.addEventListener("input", () => render(true));
    cIn.addEventListener("input", () => render(false));
    $(root, "[data-new]").addEventListener("click", () => render(true));
    render(true);
  })();

  /* ------------------------------------------------------------
     4. Coverage simulation
  ------------------------------------------------------------ */
  (function coverage() {
    const root = document.getElementById("viz-coverage");
    if (!root) return;
    const svg = $(root, "svg"), zBtns = $$(root, "[data-z]");
    let z = 1.96, means = [];
    const n = 50, se = POP_SD / Math.sqrt(n);
    function render() {
      const moe = z * se, show = means.slice(-40);
      const L = 16, Rt = 624, a = POP_MU - 4.2 * se, b = POP_MU + 4.2 * se, X = (v) => L + ((Math.max(a, Math.min(b, v)) - a) / (b - a)) * (Rt - L);
      let g = `<line x1="${X(POP_MU)}" x2="${X(POP_MU)}" y1="16" y2="300" stroke="${C.amber}" stroke-width="2" stroke-dasharray="6 4"/>` + txt(X(POP_MU), 12, "μ", { anchor: "middle", fill: C.amber, bold: 1, size: 13 });
      show.forEach((m, i) => {
        const y = 24 + i * 6.8, hit = Math.abs(m - POP_MU) <= moe, col = hit ? C.accent : C.rose;
        g += `<line x1="${X(m - moe)}" x2="${X(m + moe)}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="${hit ? 2 : 3}" opacity="${hit ? 0.8 : 1}"/><circle cx="${X(m)}" cy="${y}" r="2" fill="${col}"/>`;
      });
      for (let k = -4; k <= 4; k += 2) { const v = POP_MU + k * se; g += txt(X(v), 316, inr(v), { anchor: "middle", size: 9.5 }); }
      if (!means.length) g += txt(320, 160, "Add samples to draw intervals", { anchor: "middle", size: 12 });
      svg.innerHTML = g;
      const hits = means.filter((m) => Math.abs(m - POP_MU) <= moe).length;
      $(root, '[data-stat="n"]').textContent = means.length.toLocaleString("en-IN");
      $(root, '[data-stat="hit"]').textContent = means.length ? `${hits} (${((hits / means.length) * 100).toFixed(1)}%)` : "–";
      $(root, '[data-stat="miss"]').textContent = means.length ? `${means.length - hits} (${(((means.length - hits) / means.length) * 100).toFixed(1)}%)` : "–";
    }
    zBtns.forEach((b) => b.addEventListener("click", () => { z = +b.dataset.z; press(zBtns, b); render(); }));
    $$(root, "[data-add]").forEach((b) => b.addEventListener("click", () => { const k = +b.dataset.add; if (!k) means = []; for (let i = 0; i < k; i++) means.push(mean(sampleFrom(salaryPop, n))); render(); }));
    render();
  })();

  /* ------------------------------------------------------------
     5. Hypothesis test calculator
  ------------------------------------------------------------ */
  (function test() {
    const root = document.getElementById("viz-test");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), inBar = $(root, "[data-inputs]");
    const tBtns = $$(root, "[data-tt]"), aBtns = $$(root, "[data-a]");
    let mode = "one", alpha = 0.05, tails = "two", known = true;
    const F = {
      one: [["xbar", "Sample mean x̄", 49.5, 0.1], ["mu0", "H₀ mean μ₀", 50, 0.1], ["sd", "σ (or s)", 1.2, 0.1], ["n", "n", 25, 1]],
      two: [["m1", "Junior mean (₹)", 52000, 500], ["s1", "Junior SD", 8000, 500], ["n1", "Junior n", 40, 1], ["m2", "Senior mean (₹)", 57000, 500], ["s2", "Senior SD", 9500, 500], ["n2", "Senior n", 35, 1]],
    };
    function build() {
      inBar.innerHTML = F[mode].map(([id, lab, v, st]) => `<label style="display:grid;gap:.2rem;font-size:.85rem;font-weight:600;min-width:${mode === "two" ? "calc(33% - .5rem)" : "7.5rem"};flex:1">${lab}<input class="num-input" type="number" step="${st}" value="${v}" data-f="${id}" /></label>`).join("") +
        (mode === "one" ? `<div class="controls" style="margin:0;width:100%"><b style="font-size:.9rem">H₁</b><button class="btn" data-tail="two" aria-pressed="${tails === "two"}">μ ≠ μ₀</button><button class="btn" data-tail="left" aria-pressed="${tails === "left"}">μ &lt; μ₀</button><button class="btn" data-tail="right" aria-pressed="${tails === "right"}">μ &gt; μ₀</button><button class="btn" data-known aria-pressed="${known}">σ known (Z-test)</button></div>` : "");
      $$(inBar, "input").forEach((el) => el.addEventListener("input", render));
      $$(inBar, "[data-tail]").forEach((b) => b.addEventListener("click", () => { tails = b.dataset.tail; press($$(inBar, "[data-tail]"), b); render(); }));
      const kb = $(inBar, "[data-known]"); if (kb) kb.addEventListener("click", () => { known = !known; kb.setAttribute("aria-pressed", String(known)); kb.textContent = known ? "σ known (Z-test)" : "σ unknown (t-test)"; render(); });
      if (kb) kb.textContent = known ? "σ known (Z-test)" : "σ unknown (t-test)";
      render();
    }
    const val = (id) => parseFloat($(inBar, `[data-f="${id}"]`).value);

    function render() {
      let stat, df = null, name, H0, H1, tl = mode === "one" ? tails : "two", ctx = "";
      if (mode === "one") {
        const xb = val("xbar"), mu0 = val("mu0"), s = val("sd"), n = Math.max(2, Math.round(val("n")));
        if (![xb, mu0, s].every(Number.isFinite) || s <= 0) return;
        stat = (xb - mu0) / (s / Math.sqrt(n)); df = known ? null : n - 1; name = known ? "Z" : "t";
        H0 = `μ = ${mu0}`; H1 = `μ ${tl === "two" ? "≠" : tl === "left" ? "<" : ">"} ${mu0}`;
        ctx = `${name} = (${xb} − ${mu0}) ÷ (${s}/√${n}) = ${stat.toFixed(3)}${df ? `, with ${df} degrees of freedom` : ""}`;
      } else {
        const m1 = val("m1"), s1 = val("s1"), n1 = Math.max(2, Math.round(val("n1"))), m2 = val("m2"), s2 = val("s2"), n2 = Math.max(2, Math.round(val("n2")));
        if (![m1, s1, m2, s2].every(Number.isFinite) || s1 <= 0 || s2 <= 0) return;
        const v1 = (s1 * s1) / n1, v2 = (s2 * s2) / n2;
        stat = (m1 - m2) / Math.sqrt(v1 + v2); df = (v1 + v2) ** 2 / (v1 * v1 / (n1 - 1) + v2 * v2 / (n2 - 1)); name = "t";
        H0 = "μ<sub>junior</sub> = μ<sub>senior</sub>"; H1 = "μ<sub>junior</sub> ≠ μ<sub>senior</sub>";
        ctx = `t = (${inr(m1)} − ${inr(m2)}) ÷ √(${s1}²/${n1} + ${s2}²/${n2}) = ${stat.toFixed(3)}, with about ${df.toFixed(1)} degrees of freedom (Welch's t-test)`;
      }
      const cdf = df ? (x) => tcdf(x, df) : Phi, pdf = df ? (x) => tpdf(x, df) : (x) => npdf(x);
      let p, crit;
      if (tl === "two") { p = 2 * (1 - cdf(Math.abs(stat))); crit = inv(cdf, 1 - alpha / 2); }
      else if (tl === "left") { p = cdf(stat); crit = inv(cdf, alpha); }
      else { p = 1 - cdf(stat); crit = inv(cdf, 1 - alpha); }
      const reject = p <= alpha;

      const W = 640, H = 240, L = 20, Rt = 20, T = 26, B = 32, X = (x) => L + ((x + 4.5) / 9) * (W - L - Rt), ym = pdf(0) * 1.12, Y = (v) => T + (1 - v / ym) * (H - T - B);
      const xs = []; for (let x = -4.5; x <= 4.5001; x += 0.03) xs.push(x);
      const area = (f) => { const s = xs.filter(f); return s.length ? `<path d="M${X(s[0])},${Y(0)} ${s.map((x) => `L${X(x)},${Y(pdf(x))}`).join(" ")} L${X(s[s.length - 1])},${Y(0)} Z" fill="${C.rose}" opacity=".35"/>` : ""; };
      let g = "";
      if (tl === "two") g += area((x) => x <= -crit) + area((x) => x >= crit);
      else if (tl === "left") g += area((x) => x <= crit);
      else g += area((x) => x >= crit);
      g += `<path d="${xs.map((x, i) => `${i ? "L" : "M"}${X(x)},${Y(pdf(x))}`).join(" ")}" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
      g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.line}"/>`;
      for (let x = -4; x <= 4; x++) g += txt(X(x), H - 12, x, { anchor: "middle" });
      const crits = tl === "two" ? [-crit, crit] : [crit];
      crits.forEach((c) => (g += `<line x1="${X(c)}" x2="${X(c)}" y1="${T}" y2="${Y(0)}" stroke="${C.rose}" stroke-dasharray="4 3"/>` + txt(X(c), Y(0) - 6 - 0, c.toFixed(2), { anchor: "middle", fill: C.rose, bold: 1, size: 10 })));
      const sc = Math.max(-4.4, Math.min(4.4, stat)), col = reject ? C.rose : C.accent;
      g += `<line x1="${X(sc)}" x2="${X(sc)}" y1="${T - 8}" y2="${Y(0)}" stroke="${col}" stroke-width="3"/>` + txt(X(sc), T - 12, `${name} = ${stat.toFixed(2)}${Math.abs(stat) > 4.4 ? (stat > 0 ? " →" : " ←") : ""}`, { anchor: "middle", fill: col, bold: 1, size: 12 });
      g += txt(L + 4, T + 4, "Rejection region (α = " + alpha + ")", { fill: C.rose, size: 10 });
      svg.innerHTML = g;

      $(root, '[data-stat="stat"]').textContent = stat.toFixed(3);
      $(root, "[data-stat-l]").textContent = `Test statistic (${name})`;
      $(root, '[data-stat="crit"]').textContent = (tl === "two" ? "±" : "") + (tl === "two" ? Math.abs(crit) : crit).toFixed(3);
      $(root, '[data-stat="p"]').textContent = p < 0.0001 ? "< 0.0001" : p.toFixed(4);
      $(root, '[data-stat="dec"]').textContent = reject ? "Reject H₀" : "Fail to reject";
      $(root, '[data-stat="dec"]').style.color = reject ? C.rose : C.accent;
      out.innerHTML = `<p><b>H₀:</b> ${H0} &nbsp; <b>H₁:</b> ${H1}</p><div class="formula">${ctx}</div><p>If H₀ were true, a result at least this extreme would happen with probability <b>${p < 0.0001 ? "below 0.0001" : p.toFixed(4)}</b>. ${reject ? `That is at or below α = ${alpha}, so we <b>reject H₀</b>: the difference is statistically significant.` : `That is above α = ${alpha}, so we <b>fail to reject H₀</b>: there isn't enough evidence of a real difference. This doesn't prove H₀ is true.`}</p>`;
    }
    tBtns.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.tt; press(tBtns, b); build(); }));
    aBtns.forEach((b) => b.addEventListener("click", () => { alpha = +b.dataset.a; press(aBtns, b); render(); }));
    build();
  })();

  /* ------------------------------------------------------------
     6. Errors and power
  ------------------------------------------------------------ */
  (function power() {
    const root = document.getElementById("viz-power");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out");
    const muIn = $(root, '[data-in="mu"]'), nIn = $(root, '[data-in="n"]'), aIn = $(root, '[data-in="a"]');
    function render() {
      const mu1 = +muIn.value, n = +nIn.value, a = +aIn.value / 100, mu0 = 50, se = 1.2 / Math.sqrt(n);
      $(root, '[data-out="mu"]').textContent = mu1.toFixed(2);
      $(root, '[data-out="n"]').textContent = n;
      $(root, '[data-out="a"]').textContent = a.toFixed(2);
      const zc = inv(Phi, 1 - a / 2), lo = mu0 - zc * se, hi = mu0 + zc * se;
      const beta = Phi((hi - mu1) / se) - Phi((lo - mu1) / se), pw = 1 - beta;
      const W = 640, H = 250, L = 20, Rt = 20, T = 30, B = 32, A = 48.6, Bd = 51.0, X = (x) => L + ((x - A) / (Bd - A)) * (W - L - Rt);
      const ym = npdf(0, 0, se) * 1.12, Y = (v) => T + (1 - v / ym) * (H - T - B);
      const xs = []; for (let x = A; x <= Bd + 1e-9; x += (Bd - A) / 400) xs.push(x);
      const shade = (m, f, col, op) => { const s = xs.filter(f); return s.length ? `<path d="M${X(s[0])},${Y(0)} ${s.map((x) => `L${X(x)},${Y(npdf(x, m, se))}`).join(" ")} L${X(s[s.length - 1])},${Y(0)} Z" fill="${col}" opacity="${op}"/>` : ""; };
      const curve = (m, col, dash) => `<path d="${xs.map((x, i) => `${i ? "L" : "M"}${X(x)},${Y(npdf(x, m, se))}`).join(" ")}" fill="none" stroke="${col}" stroke-width="2.2" ${dash ? 'stroke-dasharray="6 4"' : ""}/>`;
      let g = "";
      g += shade(mu1, (x) => x < lo, C.accent, 0.3) + shade(mu1, (x) => x > hi, C.accent, 0.3) + shade(mu1, (x) => x >= lo && x <= hi, C.amber, 0.4);
      g += shade(mu0, (x) => x < lo, C.rose, 0.45) + shade(mu0, (x) => x > hi, C.rose, 0.45);
      g += curve(mu0, C.soft, true) + curve(mu1, C.accent);
      [lo, hi].forEach((c) => (g += `<line x1="${X(c)}" x2="${X(c)}" y1="${T - 6}" y2="${Y(0)}" stroke="${C.ink}" stroke-dasharray="3 3"/>`));
      g += txt(X(mu0), T - 12, "If H₀ true (μ = 50)", { anchor: "middle", fill: C.soft, bold: 1, size: 10.5 });
      if (Math.abs(mu1 - mu0) > 0.08) g += txt(X(mu1), T + 2, "Reality (μ = " + mu1.toFixed(2) + ")", { anchor: "middle", fill: C.accent, bold: 1, size: 10.5 });
      g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.line}"/>`;
      for (let x = 48.8; x <= 51.01; x += 0.4) g += txt(X(x), H - 12, x.toFixed(1), { anchor: "middle" });
      g += txt(W - Rt, H - 12, "x̄ (cm)", { anchor: "end", size: 10 });
      svg.innerHTML = g;
      $(root, '[data-stat="a"]').textContent = a.toFixed(2);
      $(root, '[data-stat="b"]').textContent = mu1 === mu0 ? "–" : beta.toFixed(3);
      $(root, '[data-stat="pw"]').textContent = mu1 === mu0 ? "–" : pw.toFixed(3);
      out.innerHTML = mu1 === mu0
        ? `<p>With no real drift, H₀ is true: the only possible mistake is a Type I error, which happens ${Math.round(a * 100)}% of the time. Drag the true mean away from 50.</p>`
        : `<p>We reject H₀ when x̄ falls outside ${lo.toFixed(2)}–${hi.toFixed(2)} cm. If the machine has drifted to ${mu1.toFixed(2)} cm, the test detects it with probability <b>${(pw * 100).toFixed(0)}%</b> (power) and misses it ${(beta * 100).toFixed(0)}% of the time (Type II error). ${pw < 0.8 ? "A bigger sample or a larger α would raise the power; a common target is 80%." : "That meets the common 80% power target."} Lowering α cuts false alarms but widens the acceptance zone, so β rises.</p>`;
    }
    [muIn, nIn, aIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* ------------------------------------------------------------
     7. Which test quiz
  ------------------------------------------------------------ */
  (function quiz() {
    const root = document.getElementById("viz-quiz");
    if (!root) return;
    const box = $(root, "[data-quiz]"), score = $(root, "[data-score]");
    const T = ["Z-test", "t-test", "χ² test", "F-test"];
    const Q = [
      ["Mean length of 200 rods, when the machine's σ is known from its specification.", 0, "Large sample and known σ: a Z-test."],
      ["Average delivery time from just 12 orders; σ is unknown.", 1, "Small sample, σ estimated from the data: a t-test."],
      ["Is preferred payment method related to customer age group?", 2, "Both variables are categorical, so test independence with chi-square."],
      ["Is machine A's output more variable than machine B's?", 3, "Comparing two variances is exactly what the F-test does."],
      ["Do two teams of 15 people have different mean salaries?", 1, "Two small samples with unknown σ: a two-sample t-test."],
      ["Do three store layouts produce different average sales?", 3, "Comparing three or more means is ANOVA, which uses an F-test."],
    ];
    const ans = {};
    function render() {
      box.innerHTML = Q.map(([q, c, why], i) => `<div class="quiz-q viz-out" style="margin:0 0 .6rem"><p style="margin:0"><b>${i + 1}.</b> ${q}</p><div class="controls">${T.map((t, k) => `<button class="btn${ans[i] === undefined ? "" : k === c ? " right" : k === ans[i] ? " wrong" : ""}" data-q="${i}" data-k="${k}" ${ans[i] !== undefined ? "disabled" : ""}>${t}</button>`).join("")}</div>${ans[i] !== undefined ? `<p style="margin:.5rem 0 0">${ans[i] === c ? "✓ Correct." : "✗ Not quite."} ${why}</p>` : ""}</div>`).join("");
      const done = Object.keys(ans).length, right = Object.entries(ans).filter(([i, k]) => Q[i][1] === k).length;
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
