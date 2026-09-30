// Session 06 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", accentSoft: "#d9f1ee", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function normal(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const sd = (a, sample = true) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - (sample ? 1 : 0))); };
  const quant = (a, p) => { const s = [...a].sort((x, y) => x - y), i = (s.length - 1) * p, lo = Math.floor(i); return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo); };
  const shuffle = (a, r) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const live = Math.random; // user-triggered draws use real randomness

  function histogram(values, lo, hi, bins) {
    const w = (hi - lo) / bins, c = new Array(bins).fill(0);
    values.forEach((v) => { const k = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / w))); c[k]++; });
    return { c, w };
  }

  /* ------------------------------------------------------------
     1. Population and sampling methods
  ------------------------------------------------------------ */
  (function sampling() {
    const root = document.getElementById("viz-sampling");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out");
    const mBtns = $$(root, "[data-m]"), nIn = $(root, '[data-in="n"]');
    const r = rng(3);
    const COLS = 20, ROWS = 20;
    const pop = Array.from({ length: COLS * ROWS }, (_, i) => {
      const row = Math.floor(i / COLS), year = Math.floor(row / 5);
      return { i, row, col: i % COLS, year, h: 158 + year * 3.2 + normal(r) * 6.5 };
    });
    const MU = mean(pop.map((p) => p.h));
    const hMin = Math.min(...pop.map((p) => p.h)), hMax = Math.max(...pop.map((p) => p.h));
    const byHeight = [...pop].sort((a, b) => b.h - a.h);
    let method = "random", picked = new Set(), history = [];

    const COPY = {
      random: "Every student has the same chance of selection, like drawing names from a hat. Sample means scatter on both sides of μ, and the scatter shrinks as the sample grows.",
      strat: "The population is split into groups (here, year of study) and the same share is drawn at random from each. Every year is represented, so sample means sit even closer to μ.",
      conv: "You survey whoever is easiest to reach, here the students sitting in the front rows. They are mostly first-years, who are shorter, so every sample underestimates μ. More data doesn't fix this bias.",
      purp: "Students are hand-picked because someone judged them relevant, here the basketball squad. Useful for expert opinion, but the sample doesn't represent the population, so x̄ lands far above μ.",
    };

    function draw() {
      const n = +nIn.value;
      let chosen;
      if (method === "random") chosen = shuffle(pop, live).slice(0, n);
      else if (method === "strat") chosen = [0, 1, 2, 3].flatMap((y) => shuffle(pop.filter((p) => p.year === y), live).slice(0, n / 4));
      else if (method === "conv") chosen = shuffle(pop.slice(0, Math.min(pop.length, Math.round(n * 1.5))), live).slice(0, n);
      else chosen = shuffle(byHeight.slice(0, Math.max(n, 120)), live).slice(0, n);
      picked = new Set(chosen.map((p) => p.i));
      history.push(mean(chosen.map((p) => p.h)));
    }

    function render() {
      const n = +nIn.value;
      $(root, '[data-out="n"]').textContent = n;
      let g = "";
      const cell = 15, gx = 14, gy = 14;
      [0, 1, 2, 3].forEach((y) => (g += txt(gx - 6, gy + y * 5 * cell + 2.5 * cell + 4, ["Y1", "Y2", "Y3", "Y4"][y], { anchor: "end", size: 9 })));
      pop.forEach((p) => {
        const t = (p.h - hMin) / (hMax - hMin);
        const on = picked.has(p.i);
        const col = `rgb(${Math.round(222 - t * 214)},${Math.round(240 - t * 146)},${Math.round(237 - t * 152)})`;
        g += `<circle cx="${gx + 8 + p.col * cell}" cy="${gy + p.row * cell + cell / 2}" r="${on ? 6 : 4.8}" fill="${col}" ${on ? `stroke="${C.ink}" stroke-width="2"` : `opacity="${picked.size ? 0.45 : 1}"`}/>`;
      });
      // sampling distribution strip
      const x0 = 350, x1 = 626, lo = 155, hi = 175;
      const X = (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0);
      const base = 280;
      g += txt(x0, 22, "Sample means so far", { fill: C.ink, bold: 1, size: 12 });
      g += `<line x1="${x0}" x2="${x1}" y1="${base}" y2="${base}" stroke="${C.line}" stroke-width="2"/>`;
      for (let v = 155; v <= 175; v += 5) g += txt(X(v), base + 16, v, { anchor: "middle" });
      g += txt((x0 + x1) / 2, base + 32, "Height (cm)", { anchor: "middle" });
      g += `<line x1="${X(MU)}" x2="${X(MU)}" y1="40" y2="${base}" stroke="${C.violet}" stroke-width="2" stroke-dasharray="5 3"/>` + txt(X(MU) + 4, 50, "μ", { fill: C.violet, bold: 1, size: 13 });
      const stacks = {};
      history.forEach((m, k) => {
        const key = Math.round(X(m) / 8);
        const h = (stacks[key] = (stacks[key] || 0) + 1);
        const last = k === history.length - 1;
        g += `<circle cx="${X(Math.max(lo, Math.min(hi, m)))}" cy="${base - 6 - (h - 1) * 9}" r="4" fill="${last ? C.amber : C.accent}" ${last ? `stroke="${C.ink}"` : ""}/>`;
      });
      if (!history.length) g += txt((x0 + x1) / 2, 170, "Draw a sample to start", { anchor: "middle", size: 12 });
      svg.innerHTML = g;

      const xbar = history[history.length - 1];
      $(root, '[data-stat="mu"]').textContent = MU.toFixed(1);
      $(root, '[data-stat="xbar"]').textContent = xbar ? xbar.toFixed(1) : "–";
      $(root, '[data-stat="err"]').textContent = xbar ? (xbar - MU > 0 ? "+" : "") + (xbar - MU).toFixed(1) : "–";
      const spread = history.length > 4 ? ` Across ${history.length} samples, the means have a spread (standard error) of about ${sd(history).toFixed(2)} cm and average ${mean(history).toFixed(1)} cm.` : "";
      out.innerHTML = `<p>${COPY[method]}${spread}</p>`;
    }

    mBtns.forEach((b) => b.addEventListener("click", () => { method = b.dataset.m; press(mBtns, b); history = []; picked = new Set(); render(); }));
    nIn.addEventListener("input", () => { history = []; picked = new Set(); render(); });
    $(root, "[data-draw]").addEventListener("click", () => { draw(); render(); });
    $(root, "[data-draw20]").addEventListener("click", () => { for (let k = 0; k < 20; k++) draw(); render(); });
    render();
  })();

  /* ------------------------------------------------------------
     2. Univariate vs bivariate
  ------------------------------------------------------------ */
  (function uniBi() {
    const root = document.getElementById("viz-uni-bi");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out");
    const vBtns = $$(root, "[data-v='uni'],[data-v='bi']"), lineBtn = $(root, "[data-v='line']");
    const r = rng(8);
    const S = Array.from({ length: 30 }, () => { const h = 1 + r() * 9; return { h, s: Math.min(99, Math.max(40, 46 + 5 * h + normal(r) * 5)) }; });
    const hs = S.map((p) => p.h), ss = S.map((p) => p.s);
    const mh = mean(hs), ms = mean(ss);
    const sxy = S.reduce((a, p) => a + (p.h - mh) * (p.s - ms), 0), sxx = hs.reduce((a, h) => a + (h - mh) ** 2, 0), syy = ss.reduce((a, s) => a + (s - ms) ** 2, 0);
    const slope = sxy / sxx, icpt = ms - slope * mh, rr = sxy / Math.sqrt(sxx * syy);
    let mode = "uni", showLine = false;
    const W = 640, H = 280, L = 50, R = 20, T = 26, B = 42;

    function render() {
      let g = "";
      if (mode === "uni") {
        const { c } = histogram(ss, 40, 100, 12);
        const mx = Math.max(...c) + 1;
        const Y = (v) => T + (1 - v / mx) * (H - T - B), X = (v) => L + ((v - 40) / 60) * (W - L - R);
        for (let v = 0; v <= mx; v += 2) g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
        c.forEach((n, k) => (g += `<rect x="${X(40 + k * 5) + 1}" y="${Y(n)}" width="${X(45) - X(40) - 2}" height="${Y(0) - Y(n)}" rx="3" fill="${C.accent}"/>`));
        for (let v = 40; v <= 100; v += 10) g += txt(X(v), H - 22, v, { anchor: "middle" });
        g += txt((W + L) / 2, H - 4, "Exam score", { anchor: "middle" }) + txt(L - 44, T - 10, "Students");
        g += `<line x1="${X(ms)}" x2="${X(ms)}" y1="${T}" y2="${Y(0)}" stroke="${C.violet}" stroke-width="2" stroke-dasharray="5 3"/>` + txt(X(ms) + 5, T + 10, "Mean " + ms.toFixed(1), { fill: C.violet, bold: 1 });
        out.innerHTML = `<p><b>One variable:</b> scores average ${ms.toFixed(1)} (median ${quant(ss, 0.5).toFixed(1)}) with a standard deviation of ${sd(ss).toFixed(1)}. The histogram describes the distribution, but can't say <i>why</i> some students scored higher.</p>`;
      } else {
        const Y = (v) => T + (1 - (v - 40) / 60) * (H - T - B), X = (v) => L + (v / 10) * (W - L - R);
        for (let v = 40; v <= 100; v += 10) g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
        for (let v = 0; v <= 10; v += 2) g += txt(X(v), H - 22, v, { anchor: "middle" });
        g += txt((W + L) / 2, H - 4, "Study hours per week", { anchor: "middle" }) + txt(L - 44, T - 10, "Exam score");
        if (showLine) g += `<line x1="${X(0.5)}" y1="${Y(icpt + slope * 0.5)}" x2="${X(10)}" y2="${Y(icpt + slope * 10)}" stroke="${C.violet}" stroke-width="2.5" stroke-dasharray="7 4"/>`;
        S.forEach((p) => (g += `<circle cx="${X(p.h)}" cy="${Y(p.s)}" r="6" fill="${C.accent}" fill-opacity=".8" stroke="#fff" stroke-width="1.5"/>`));
        out.innerHTML = `<p><b>Two variables:</b> the correlation is r = ${rr.toFixed(2)}, a strong positive relationship.${showLine ? ` The regression line predicts roughly <b>${slope.toFixed(1)} extra marks per extra hour</b> of study (score ≈ ${icpt.toFixed(0)} + ${slope.toFixed(1)} × hours).` : " Turn on the regression line to quantify it."}</p>`;
      }
      svg.innerHTML = g;
      lineBtn.hidden = mode !== "bi";
    }
    vBtns.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.v; press(vBtns, b); render(); }));
    lineBtn.addEventListener("click", () => { showLine = !showLine; lineBtn.setAttribute("aria-pressed", String(showLine)); render(); });
    render();
  })();

  /* ------------------------------------------------------------
     3. Resampling lab
  ------------------------------------------------------------ */
  (function resample() {
    const root = document.getElementById("viz-resample");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), ctl = $(root, "[data-rcontrols]");
    const tabs = $$(root, "[data-r]");
    const r = rng(19);
    const data = Array.from({ length: 50 }, () => Math.round((11 + Math.abs(normal(r)) * 5 + r() * 7) * 10) / 10);
    data[37] = 46.0; // one slow healer
    const group = data.map((_, i) => (i < 25 ? "A" : "B"));
    const dataAB = data.map((v, i) => (i === 37 ? 19.5 : v)).map((v, i) => (i >= 25 ? Math.round((v + 3.2) * 10) / 10 : v));
    const theta = mean(data);
    let mode = "boot", boots = [], lastBoot = null, k = 5, perms = [];
    const W = 640, H = 260, L = 46, R = 20, T = 30, B = 40;

    function axes(lo, hi, step, maxY, xLabel, yLabel = "Count") {
      const X = (v) => L + ((v - lo) / (hi - lo)) * (W - L - R), Y = (v) => T + (1 - v / maxY) * (H - T - B);
      let g = "";
      const ys = Math.max(1, Math.ceil(maxY / 4));
      for (let v = 0; v <= maxY; v += ys) g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
      for (let v = lo; v <= hi + 1e-9; v += step) g += txt(X(v), H - 22, +v.toFixed(1), { anchor: "middle" });
      g += txt((W + L) / 2, H - 4, xLabel, { anchor: "middle" }) + txt(L - 40, T - 12, yLabel);
      return [g, X, Y];
    }

    function controls() {
      const b = (attr, label, cls = "btn") => `<button class="${cls}" ${attr}>${label}</button>`;
      ctl.innerHTML = mode === "boot" ? b("data-a='one'", "Resample once") + b("data-a='many'", "Resample 500 times", "btn is-on") + b("data-a='reset'", "Reset", "btn ghost")
        : mode === "jack" ? ""
        : mode === "cv" ? `<label class="range">Number of folds (k) <span data-out="k">${k}</span><input type="range" min="2" max="10" value="${k}" data-in="k" /></label>`
        : b("data-a='pone'", "Shuffle labels once") + b("data-a='pmany'", "Shuffle 1,000 times", "btn is-on") + b("data-a='preset'", "Reset", "btn ghost");
    }

    function render() {
      let g = "", html = "";
      if (mode === "boot") {
        const lo = Math.floor(theta - 4), hi = lo + 8;
        const { c, w } = histogram(boots, lo, hi, 32);
        const [a, X, Y] = axes(lo, hi, 1, Math.max(10, Math.max(...c) + 2), "Mean healing time of each resample (days)");
        g += a;
        c.forEach((n, i) => (g += `<rect x="${X(lo + i * w) + 1}" y="${Y(n)}" width="${X(lo + w) - X(lo) - 2}" height="${Y(0) - Y(n)}" rx="2" fill="${C.accent}"/>`));
        g += `<line x1="${X(theta)}" x2="${X(theta)}" y1="${T}" y2="${Y(0)}" stroke="${C.violet}" stroke-width="2"/>` + txt(X(theta) + 4, T + 10, "Original mean " + theta.toFixed(1), { fill: C.violet, bold: 1 });
        if (boots.length >= 100) {
          const l = quant(boots, 0.025), h = quant(boots, 0.975);
          [l, h].forEach((v) => (g += `<line x1="${X(v)}" x2="${X(v)}" y1="${T + 18}" y2="${Y(0)}" stroke="${C.amber}" stroke-width="2" stroke-dasharray="5 3"/>`));
          g += txt(X(l), T + 30, "2.5%", { anchor: "end", fill: C.amber, bold: 1 }) + txt(X(h) + 4, T + 30, "97.5%", { fill: C.amber, bold: 1 });
          html = `<p><b>${boots.length}</b> bootstrap samples. The standard error of the mean is about <b>${sd(boots).toFixed(2)} days</b>, and the 95% confidence interval runs from <b>${l.toFixed(1)}</b> to <b>${h.toFixed(1)} days</b>. No formula needed: the spread of the resampled means is the uncertainty.</p>`;
        } else html = `<p>Each bootstrap sample draws 50 patients <i>with replacement</i> from the original 50, so some patients appear several times and others not at all.${lastBoot ? ` In the latest resample, <b>${lastBoot.rep}</b> patients appeared more than once and <b>${lastBoot.miss}</b> were left out; its mean was ${lastBoot.m.toFixed(2)} days.` : ""} Run at least 100 resamples to get a confidence interval.</p>`;
      } else if (mode === "jack") {
        const loo = data.map((_, i) => mean(data.filter((__, j) => j !== i)));
        const lm = mean(loo), n = data.length;
        const se = Math.sqrt(((n - 1) / n) * loo.reduce((s, v) => s + (v - lm) ** 2, 0));
        const dev = loo.map((v) => v - theta), mxd = Math.max(...dev.map(Math.abs));
        const Y = (v) => (T + (H - T - B) / 2) - (v / mxd) * ((H - T - B) / 2 - 6), bw = (W - L - R) / n;
        g += `<line x1="${L}" x2="${W - R}" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.ink}"/>` + txt(L - 40, T - 12, "Change in mean when this patient is left out (days)");
        [mxd, -mxd].forEach((v) => (g += txt(L - 8, Y(v) + 4, (v > 0 ? "+" : "") + v.toFixed(2), { anchor: "end" })));
        const big = dev.indexOf(Math.min(...dev));
        dev.forEach((d, i) => (g += `<rect x="${L + i * bw + 1}" y="${Math.min(Y(0), Y(d))}" width="${bw - 2}" height="${Math.max(1, Math.abs(Y(d) - Y(0)))}" fill="${i === big ? C.rose : C.accent}" rx="1"/>`));
        g += txt(L + big * bw + bw / 2, Y(dev[big]) + 16, "Patient " + (big + 1), { anchor: "middle", fill: C.rose, bold: 1 });
        g += txt((W + L) / 2, H - 4, "Each bar: one of 50 rounds, leaving one patient out", { anchor: "middle" });
        html = `<p>Fifty rounds, each dropping one patient and recomputing the mean on the other 49. Most bars are tiny, but leaving out patient ${big + 1} (healing time ${data[big]} days) lowers the mean by ${Math.abs(dev[big]).toFixed(2)} days, exposing an influential outlier. The jackknife standard error is <b>${se.toFixed(2)} days</b>. For the mean the jackknife bias estimate is zero; it matters more for statistics like the median or variance.</p>`;
      } else if (mode === "cv") {
        const n = 50, rowH = Math.min(20, (H - T - 20) / k), sz = (W - L - 150) / n;
        const rr = rng(100 + k);
        const accs = [];
        for (let f = 0; f < k; f++) {
          const y = T + f * rowH;
          const s = Math.floor((f * n) / k), e = Math.floor(((f + 1) * n) / k);
          g += txt(L - 6, y + rowH * 0.7, "Fold " + (f + 1), { anchor: "end", size: 10 });
          for (let i = 0; i < n; i++) g += `<rect x="${L + i * sz}" y="${y + 1}" width="${sz - 1}" height="${rowH - 3}" rx="2" fill="${i >= s && i < e ? C.amber : C.light}"/>`;
          const acc = 0.84 + normal(rr) * (0.2 / Math.sqrt(e - s)) ;
          accs.push(Math.min(0.99, acc));
          g += txt(W - R - 110, y + rowH * 0.7, "Accuracy " + (accs[f] * 100).toFixed(0) + "%", { fill: C.ink, size: 10.5 });
        }
        const ly = T + k * rowH + 14;
        g += `<rect x="${L}" y="${ly}" width="12" height="12" rx="2" fill="${C.light}"/>` + txt(L + 18, ly + 10, "Training data") + `<rect x="${L + 120}" y="${ly}" width="12" height="12" rx="2" fill="${C.amber}"/>` + txt(L + 138, ly + 10, "Test data");
        const testShare = Math.round(100 / k);
        html = `<p>With k = ${k}, the 50 patients are split into ${k} folds. Each round trains on ${100 - testShare}% of the data and tests on the remaining ${testShare}%, and every patient is tested exactly once. Averaging gives an accuracy of <b>${(mean(accs) * 100).toFixed(1)}%</b> ± ${(sd(accs) * 100).toFixed(1)}%, a fairer estimate than any single split.${k === 5 ? " This is the 80/20 split from the example, repeated five times." : ""}</p>`;
      } else {
        const obs = mean(dataAB.filter((_, i) => group[i] === "B")) - mean(dataAB.filter((_, i) => group[i] === "A"));
        const lo = -5, hi = 5;
        const { c, w } = histogram(perms, lo, hi, 40);
        const [a, X, Y] = axes(lo, hi, 1, Math.max(10, Math.max(...c) + 2), "Difference in mean healing time, B − A (days)");
        g += a;
        c.forEach((n, i) => { const x = lo + i * w; g += `<rect x="${X(x) + 1}" y="${Y(n)}" width="${X(lo + w) - X(lo) - 2}" height="${Y(0) - Y(n)}" rx="2" fill="${Math.abs(x + w / 2) >= obs ? C.rose : C.light}"/>`; });
        g += `<line x1="${X(obs)}" x2="${X(obs)}" y1="${T}" y2="${Y(0)}" stroke="${C.violet}" stroke-width="2.5"/>` + txt(X(obs) - 4, T + 10, "Observed " + obs.toFixed(2), { fill: C.violet, bold: 1, anchor: "end" });
        const extreme = perms.filter((d) => Math.abs(d) >= obs).length;
        html = perms.length
          ? `<p>After <b>${perms.length}</b> shuffles, <b>${extreme}</b> produced a difference at least as large as the real one, so the p-value is about <b>${(extreme / perms.length).toFixed(3)}</b>. ${extreme / perms.length < 0.05 ? "Chance alone rarely produces a gap this big: dressing B really does heal more slowly." : "Chance could easily produce a gap this big."}</p>`
          : `<p>25 patients got dressing A and 25 got dressing B. B's patients healed <b>${obs.toFixed(2)} days</b> slower on average. Could that be luck? Shuffling the A/B labels shows what differences chance alone produces.</p>`;
      }
      svg.setAttribute("viewBox", `0 0 640 ${mode === "cv" ? T + k * Math.min(20, (H - T - 20) / k) + 40 : H}`);
      svg.innerHTML = g;
      out.innerHTML = html;
    }

    ctl.addEventListener("click", (e) => {
      const a = e.target.closest("[data-a]")?.dataset.a;
      if (!a) return;
      const bootOnce = () => { const s = Array.from({ length: 50 }, () => data[Math.floor(live() * 50)]); boots.push(mean(s)); return s; };
      if (a === "one") { const idx = Array.from({ length: 50 }, () => Math.floor(live() * 50)); const cnt = {}; idx.forEach((i) => (cnt[i] = (cnt[i] || 0) + 1)); const m = mean(idx.map((i) => data[i])); boots.push(m); lastBoot = { rep: Object.values(cnt).filter((v) => v > 1).length, miss: 50 - Object.keys(cnt).length, m }; }
      if (a === "many") for (let i = 0; i < 500; i++) bootOnce();
      if (a === "reset") { boots = []; lastBoot = null; }
      const permOnce = () => { const lab = shuffle(group, live); perms.push(mean(dataAB.filter((_, i) => lab[i] === "B")) - mean(dataAB.filter((_, i) => lab[i] === "A"))); };
      if (a === "pone") permOnce();
      if (a === "pmany") for (let i = 0; i < 1000; i++) permOnce();
      if (a === "preset") perms = [];
      render();
    });
    ctl.addEventListener("input", (e) => { if (e.target.dataset.in === "k") { k = +e.target.value; $(root, '[data-out="k"]').textContent = k; render(); } });
    tabs.forEach((t) => t.addEventListener("click", () => { mode = t.dataset.r; press(tabs, t); controls(); render(); }));
    controls();
    render();
  })();

  /* ------------------------------------------------------------
     4. Events on a die
  ------------------------------------------------------------ */
  (function events() {
    const root = document.getElementById("viz-events");
    if (!root) return;
    const row = $(root, ".die-row"), ops = $(root, ".op-grid"), flags = $(root, ".flags");
    const eBtns = $$(root, "[data-edit]");
    let A = new Set([2, 4, 6]), B = new Set([4, 5, 6]), editing = "A";
    const S = [1, 2, 3, 4, 5, 6];
    const EX = { slide: [[2, 4, 6], [4, 5, 6]], simple: [[4], [1, 2, 3]], comp: [[2, 4, 6], [1, 3, 5]], mutex: [[1, 2], [5, 6]], exh: [[1, 2, 3, 4], [3, 4, 5, 6]], sure: [[1, 2, 3, 4, 5, 6], []] };
    const faces = S.map((f) => {
      const b = document.createElement("button");
      b.className = "die"; b.type = "button"; b.textContent = f;
      b.addEventListener("click", () => { const set = editing === "A" ? A : B; set.has(f) ? set.delete(f) : set.add(f); render(); });
      row.appendChild(b);
      return b;
    });
    const fmtSet = (s) => (s.length ? "{" + s.join(", ") + "}" : "∅");
    const frac = (n) => `${n}/6${n === 0 || n === 6 ? ` = ${n / 6}` : ` ≈ ${(n / 6).toFixed(3)}`}`;

    function kind(s) { return s.size === 0 ? "impossible" : s.size === 6 ? "sure" : s.size === 1 ? "simple" : "compound"; }

    function render() {
      faces.forEach((b, i) => {
        const f = i + 1, a = A.has(f), bb = B.has(f);
        b.className = "die" + (a && bb ? " in-ab" : a ? " in-a" : bb ? " in-b" : "");
        b.setAttribute("aria-label", `Face ${f}${a ? ", in A" : ""}${bb ? ", in B" : ""}`);
      });
      const a = S.filter((f) => A.has(f)), b = S.filter((f) => B.has(f));
      const uni = S.filter((f) => A.has(f) || B.has(f)), inter = S.filter((f) => A.has(f) && B.has(f));
      const comp = S.filter((f) => !A.has(f)), diff = S.filter((f) => A.has(f) && !B.has(f));
      ops.innerHTML = [
        ["Event A", fmtSet(a), `P(A) = ${frac(a.length)}`],
        ["Event B", fmtSet(b), `P(B) = ${frac(b.length)}`],
        ["Union A ∪ B", fmtSet(uni), `${a.length}/6 + ${b.length}/6 − ${inter.length}/6 = ${frac(uni.length)}`],
        ["Intersection A ∩ B", fmtSet(inter), `P(A ∩ B) = ${frac(inter.length)}`],
        ["Complement A′", fmtSet(comp), `1 − ${a.length}/6 = ${frac(comp.length)}`],
        ["Difference A − B", fmtSet(diff), `P(A − B) = ${frac(diff.length)}`],
      ].map(([t, s, p]) => `<div><b>${t}</b>${s}<br /><span style="color:${C.soft}">${p}</span></div>`).join("");
      const mutex = inter.length === 0, exh = uni.length === 6, compl = mutex && exh;
      const indep = inter.length * 6 === a.length * b.length;
      const F = [
        [`A is ${kind(A)}`, true], [`B is ${kind(B)}`, true],
        ["Mutually exclusive", mutex], ["Exhaustive", exh], ["Complementary", compl],
        [indep ? "Independent: P(A ∩ B) = P(A) × P(B)" : "Dependent: P(A ∩ B) ≠ P(A) × P(B)", indep],
      ];
      flags.innerHTML = F.map(([t, on]) => `<span class="flag${on ? " on" : ""}">${on || t.startsWith("Dep") ? t : "Not " + t.toLowerCase()}</span>`).join("");
    }

    eBtns.forEach((b) => b.addEventListener("click", () => { editing = b.dataset.edit; press(eBtns, b); }));
    $$(root, "[data-ex]").forEach((b) => b.addEventListener("click", () => { const [x, y] = EX[b.dataset.ex]; A = new Set(x); B = new Set(y); render(); }));
    render();
  })();

  /* ------------------------------------------------------------
     5. Two-way table
  ------------------------------------------------------------ */
  (function table() {
    const root = document.getElementById("viz-table");
    if (!root) return;
    const tbl = $(root, "table"), out = $(root, ".viz-out"), condBar = $(root, "[data-conds]");
    const dsBtns = $$(root, "[data-ds]");
    const DS = {
      students: { rows: ["Pass math (A)", "Fail math (A′)"], cols: ["Pass science (B)", "Fail science (B′)"], rs: ["A", "A′"], cs: ["B", "B′"], n: [[30, 30], [20, 20]], unit: "students" },
      patients: { rows: ["Has disease (D)", "No disease (D′)"], cols: ["Test positive (+)", "Test negative (−)"], rs: ["D", "D′"], cs: ["+", "−"], n: [[80, 20], [100, 800]], unit: "patients",
        names: { "D|+": "the positive predictive value (PPV)", "D′|+": "the false discovery rate", "D|−": "the chance a negative result is wrong", "D′|−": "the negative predictive value (NPV)", "+|D": "the test's sensitivity", "−|D": "the false negative rate", "+|D′": "the false positive rate", "−|D′": "the test's specificity" } },
    };
    let ds = "students", cond = null, sel = null;

    function renderConds() {
      const d = DS[ds];
      const opts = [[null, "No condition"], ...d.cs.map((c, j) => [["c", j], "Given " + c]), ...d.rs.map((r, i) => [["r", i], "Given " + r])];
      condBar.innerHTML = opts.map(([v, l], k) => `<button class="btn${k ? "" : " ghost"}" data-k="${k}" aria-pressed="${JSON.stringify(v) === JSON.stringify(cond)}">${l}</button>`).join("");
      $$(condBar, "button").forEach((b, k) => b.addEventListener("click", () => { cond = opts[k][0]; sel = null; renderConds(); render(); }));
    }

    function render() {
      const d = DS[ds], N = d.n.flat().reduce((a, b) => a + b, 0);
      const rt = d.n.map((r) => r[0] + r[1]), ct = [0, 1].map((j) => d.n[0][j] + d.n[1][j]);
      const p = (x) => (x / N).toFixed(2);
      const inU = (i, j) => !cond || (cond[0] === "c" ? j === cond[1] : i === cond[1]);
      const cell = (i, j, v, kind) => {
        const universe = cond && ((kind === "joint" && inU(i, j)) || (kind === "row" && cond[0] === "r" && cond[1] === i) || (kind === "col" && cond[0] === "c" && cond[1] === j));
        const dim = cond && !universe && kind !== "total";
        const isSel = sel && sel.i === i && sel.j === j && sel.kind === kind;
        return `<td class="${universe ? "universe " : ""}${dim ? "dim " : ""}${isSel ? "sel" : ""}" data-i="${i}" data-j="${j}" data-kind="${kind}" tabindex="0">${v} <span style="opacity:.7">(${p(v)})</span></td>`;
      };
      tbl.innerHTML = `<thead><tr><th></th><th${cond && cond[0] === "c" && cond[1] === 0 ? ' class="universe"' : ""}>${d.cols[0]}</th><th${cond && cond[0] === "c" && cond[1] === 1 ? ' class="universe"' : ""}>${d.cols[1]}</th><th>Total</th></tr></thead><tbody>` +
        [0, 1].map((i) => `<tr><th${cond && cond[0] === "r" && cond[1] === i ? ' class="universe"' : ""}>${d.rows[i]}</th>${cell(i, 0, d.n[i][0], "joint")}${cell(i, 1, d.n[i][1], "joint")}${cell(i, -1, rt[i], "row")}</tr>`).join("") +
        `<tr><th>Total</th>${cell(-1, 0, ct[0], "col")}${cell(-1, 1, ct[1], "col")}${cell(-1, -1, N, "total")}</tr></tbody>`;

      let h;
      if (!sel) {
        h = cond
          ? `<p>The shaded ${cond[0] === "c" ? "column" : "row"} is the new universe: only the ${cond[0] === "c" ? ct[cond[1]] : rt[cond[1]]} ${d.unit} where <b>${cond[0] === "c" ? d.cs[cond[1]] : d.rs[cond[1]]}</b> happened. Tap a shaded cell to compute its conditional probability.</p>`
          : `<p>Tap a cell. Inner cells are <b>joint</b> probabilities, the totals column and row are <b>marginal</b> probabilities, and all four inner cells add up to 1.</p>`;
      } else if (sel.kind === "total") h = `<p>The whole sample space: P(S) = ${N}/${N} = 1.</p>`;
      else if (sel.kind === "row" || sel.kind === "col") {
        const isRow = sel.kind === "row", idx = isRow ? sel.i : sel.j, v = isRow ? rt[idx] : ct[idx], lab = isRow ? d.rs[idx] : d.cs[idx];
        const parts = isRow ? d.n[idx] : [d.n[0][idx], d.n[1][idx]], other = isRow ? d.cs : d.rs;
        h = `<h5>Marginal probability P(${lab}) = ${p(v)}</h5><p>Add the joint probabilities across the ${isRow ? "row" : "column"}: P(${lab} ∩ ${other[0]}) + P(${lab} ∩ ${other[1]}) = ${p(parts[0])} + ${p(parts[1])} = ${p(v)}. It ignores the other variable entirely.</p>`;
      } else {
        const v = d.n[sel.i][sel.j], a = d.rs[sel.i], b = d.cs[sel.j];
        if (!cond) h = `<h5>Joint probability P(${a} ∩ ${b}) = ${p(v)}</h5><p>${v} of ${N} ${d.unit} are in both <b>${d.rows[sel.i].toLowerCase()}</b> and <b>${d.cols[sel.j].toLowerCase()}</b>: ${v} ÷ ${N} = ${p(v)}.</p>`;
        else {
          const byCol = cond[0] === "c", given = byCol ? b : a, target = byCol ? a : b, tot = byCol ? ct[sel.j] : rt[sel.i];
          const cp = v / tot, key = `${target}|${given}`, name = d.names && d.names[key];
          const marg = byCol ? rt[sel.i] / N : ct[sel.j] / N;
          h = `<h5>Conditional probability P(${target} | ${given}) = ${cp.toFixed(3)}</h5><div class="formula">P(${target} | ${given}) = P(${a} ∩ ${b}) ÷ P(${given}) = ${p(v)} ÷ ${p(tot)} = ${v}/${tot} = ${cp.toFixed(3)}</div><p>${name ? `This is ${name}. ` : ""}Compare it with the unconditional P(${target}) = ${marg.toFixed(2)}: ${Math.abs(cp - marg) < 0.005 ? `the same, so knowing ${given} tells you nothing about ${target}. The events are independent.` : `knowing ${given} changes the probability, so the events are dependent.`}</p>`;
        }
      }
      out.innerHTML = h;
    }

    tbl.addEventListener("click", (e) => {
      const td = e.target.closest("td"); if (!td) return;
      const i = +td.dataset.i, j = +td.dataset.j, kind = td.dataset.kind;
      if (cond && kind === "joint" && !(cond[0] === "c" ? j === cond[1] : i === cond[1])) return;
      sel = { i, j, kind }; render();
    });
    tbl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.target.click(); } });
    dsBtns.forEach((b) => b.addEventListener("click", () => { ds = b.dataset.ds; press(dsBtns, b); cond = null; sel = null; renderConds(); render(); }));
    renderConds();
    render();
  })();

  /* ------------------------------------------------------------
     6. Venn diagram
  ------------------------------------------------------------ */
  (function venn() {
    const root = document.getElementById("viz-venn");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out");
    const aIn = $(root, '[data-in="a"]'), bIn = $(root, '[data-in="b"]'), abIn = $(root, '[data-in="ab"]');
    const lens = (r1, r2, d) => {
      if (d >= r1 + r2) return 0;
      if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
      const a1 = Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1)), a2 = Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
      return r1 * r1 * (a1 - Math.sin(2 * a1) / 2) + r2 * r2 * (a2 - Math.sin(2 * a2) / 2);
    };

    function render(changed) {
      let a = +aIn.value / 100, b = +bIn.value / 100, ab = +abIn.value / 100;
      ab = Math.min(ab, a, b);
      if (a + b - ab > 1) ab = a + b - 1;
      abIn.value = Math.round(ab * 100);
      $(root, '[data-out="a"]').textContent = a.toFixed(2);
      $(root, '[data-out="b"]').textContent = b.toFixed(2);
      $(root, '[data-out="ab"]').textContent = ab.toFixed(2);

      const K = 55000, r1 = Math.sqrt((a * K) / Math.PI), r2 = Math.sqrt((b * K) / Math.PI), target = ab * K;
      let lo = Math.abs(r1 - r2), hi = r1 + r2;
      for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; lens(r1, r2, m) > target ? (lo = m) : (hi = m); }
      const d = (lo + hi) / 2, cx = 300, cy = 128, x1 = cx - d / 2, x2 = cx + d / 2;
      let g = `<rect x="6" y="6" width="628" height="238" rx="16" fill="${C.bg}" stroke="${C.line}"/>` + txt(20, 28, "S (sample space)", { fill: C.ink, bold: 1 });
      g += `<circle cx="${x1}" cy="${cy}" r="${r1}" fill="${C.accent}" fill-opacity=".28" stroke="${C.accent}" stroke-width="2"/>`;
      g += `<circle cx="${x2}" cy="${cy}" r="${r2}" fill="${C.violet}" fill-opacity=".28" stroke="${C.violet}" stroke-width="2"/>`;
      g += txt(x1 - r1 * 0.55, cy - r1 - 6 < 20 ? cy + 4 : cy - r1 - 6, "A", { fill: C.accent, bold: 1, size: 14, anchor: "middle" });
      g += txt(x2 + r2 * 0.55, cy - r2 - 6 < 20 ? cy + 4 : cy - r2 - 6, "B", { fill: C.violet, bold: 1, size: 14, anchor: "middle" });
      const onlyA = a - ab, onlyB = b - ab, neither = 1 - (a + b - ab);
      if (onlyA > 0.01) g += txt(x1 - Math.max(18, r1 * 0.45), cy + 4, onlyA.toFixed(2), { anchor: "middle", fill: C.ink, bold: 1 });
      if (onlyB > 0.01) g += txt(x2 + Math.max(18, r2 * 0.45), cy + 4, onlyB.toFixed(2), { anchor: "middle", fill: C.ink, bold: 1 });
      if (ab > 0) g += txt((x1 + r1 + x2 - r2) / 2, cy + 4, ab.toFixed(2), { anchor: "middle", fill: "#fff", bold: 1, size: 12 }).replace('fill="#fff"', `fill="${C.ink}"`);
      g += txt(620, 232, "Neither: " + neither.toFixed(2), { anchor: "end" });
      svg.innerHTML = g;

      const aGb = b ? ab / b : 0, bGa = a ? ab / a : 0, prod = a * b, indep = Math.abs(ab - prod) < 0.006;
      $(root, '[data-stat="aGb"]').textContent = aGb.toFixed(2);
      $(root, '[data-stat="bGa"]').textContent = bGa.toFixed(2);
      $(root, '[data-stat="aub"]').textContent = (a + b - ab).toFixed(2);
      $(root, '[data-stat="prod"]').textContent = prod.toFixed(3);
      out.innerHTML = indep
        ? `<p><b>Independent.</b> P(A ∩ B) equals P(A) × P(B)${Math.abs(ab - prod) > 0.0005 ? " (to within rounding)" : ""}, so P(A | B) = P(A) = ${a.toFixed(2)}: knowing B happened doesn't change the chance of A.</p>`
        : ab === 0
        ? `<p><b>Mutually exclusive.</b> The circles don't overlap, so if B happens A cannot: P(A | B) = 0. Mutually exclusive events (with nonzero probabilities) are always dependent.</p>`
        : `<p><b>${ab > prod ? "Positively" : "Negatively"} dependent.</b> Among the B region, the overlap takes up ${(aGb * 100).toFixed(0)}%, so P(A | B) = ${ab.toFixed(2)} ÷ ${b.toFixed(2)} = ${aGb.toFixed(2)}, ${ab > prod ? "higher" : "lower"} than P(A) = ${a.toFixed(2)}. Knowing B happened makes A ${ab > prod ? "more" : "less"} likely. Set P(A ∩ B) to ${prod.toFixed(2)} to make them independent.</p>`;
    }
    [aIn, bIn, abIn].forEach((el) => el.addEventListener("input", () => render(el)));
    render();
  })();

  /* ------------------------------------------------------------
     7. Bayes stepper (the slide example)
  ------------------------------------------------------------ */
  (function stepper() {
    const root = document.getElementById("viz-stepper");
    if (!root) return;
    const box = $(root, "[data-steps]"), dots = $(root, ".step-dots");
    const back = $(root, '[data-dir="-1"]'), next = $(root, '[data-dir="1"]');
    const STEPS = [
      ["The scenario", `<p>A disease affects <b>1%</b> of people. A test for it is <b>99% accurate</b>: it detects 99% of people who have the disease, and wrongly flags only 1% of people who don't. A patient tests positive. How likely is it that they have the disease?</p><p>Most people guess 99%. Let's work it out.</p>`],
      ["Step 1: the prior P(D)", `<p>Before the test, our belief is simply how common the disease is.</p><div class="formula">P(D) = 0.01 &nbsp;&nbsp; P(No disease) = 0.99</div><p>Out of 10,000 people, about 100 have the disease and 9,900 don't.</p>`],
      ["Step 2: the likelihoods", `<p>How likely is a positive result in each group?</p><div class="formula">P(Positive | D) = 0.99 &nbsp;&nbsp; P(Positive | No disease) = 0.01</div><p>Of the 100 sick people, 99 test positive. Of the 9,900 healthy people, 1% or 99 also test positive.</p>`],
      ["Step 3: the evidence P(Positive)", `<p>Add up every way a positive result can happen (the law of total probability):</p><div class="formula">P(Positive) = 0.99 × 0.01 + 0.01 × 0.99 = 0.0099 + 0.0099 = 0.0198</div><p>About 2% of everyone tests positive: 99 + 99 = 198 people out of 10,000.</p>`],
      ["Step 4: the posterior P(D | Positive)", `<div class="formula">P(D | Positive) = P(Positive | D) × P(D) ÷ P(Positive) = 0.0099 ÷ 0.0198 = 0.5</div><div class="big-stat"><b>50%</b><span>chance of having the disease after a positive result</span></div>`],
      ["Why so low?", `<p>Of the 198 people who test positive, 99 are sick and 99 are healthy people caught by the 1% false positive rate. Because healthy people vastly outnumber sick ones, even a small error rate produces as many false alarms as true cases.</p><p class="note" style="margin-bottom:0">The prior matters. If the disease affected 10% of people, the same test would give a posterior of about 92%. Try it in the calculator below.</p>`],
    ];
    let i = 0;
    dots.innerHTML = "<span></span>".repeat(STEPS.length);
    function render() {
      box.innerHTML = `<div class="viz-out" style="margin-top:0"><h5>${STEPS[i][0]}</h5>${STEPS[i][1]}</div>`;
      [...dots.children].forEach((d, k) => d.classList.toggle("is-on", k <= i));
      back.disabled = i === 0; next.disabled = i === STEPS.length - 1;
    }
    back.addEventListener("click", () => { if (i) { i--; render(); } });
    next.addEventListener("click", () => { if (i < STEPS.length - 1) { i++; render(); } });
    render();
  })();

  /* ------------------------------------------------------------
     8. Bayes calculator with frequency tree and repeated tests
  ------------------------------------------------------------ */
  (function bayes() {
    const root = document.getElementById("viz-bayes");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), fbox = $(root, "[data-formula]"), chainEl = $(root, "[data-chain]");
    const pIn = $(root, '[data-in="prev"]'), seIn = $(root, '[data-in="sens"]'), spIn = $(root, '[data-in="spec"]');
    let chain = [];
    const pct = (v) => (v * 100 < 1 ? (v * 100).toFixed(2) : v * 100 < 10 ? (v * 100).toFixed(1) : Math.round(v * 100)) + "%";
    const N = 10000;

    function box(x, y, n, label, fill, stroke, dark) {
      return `<rect x="${x - 72}" y="${y - 22}" width="144" height="44" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>` +
        txt(x, y - 3, Math.round(n).toLocaleString("en-IN"), { anchor: "middle", fill: dark ? "#fff" : C.ink, bold: 1, size: 14 }) +
        txt(x, y + 13, label, { anchor: "middle", fill: dark ? "#fff" : C.soft, size: 10.5 });
    }

    function render() {
      const prior = chain.length ? chain[chain.length - 1] : +pIn.value / 1000;
      const sens = +seIn.value / 100, spec = +spIn.value / 100, fpr = 1 - spec;
      $(root, '[data-out="prev"]').textContent = pct(+pIn.value / 1000);
      $(root, '[data-out="sens"]').textContent = pct(sens);
      $(root, '[data-out="spec"]').textContent = pct(spec);

      const sick = N * prior, well = N - sick, tp = sick * sens, fn = sick - tp, fp = well * fpr, tn = well - fp;
      const post = tp + fp ? tp / (tp + fp) : 0;
      const edge = (x1, y1, x2, y2, lab) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.line}" stroke-width="2"/>` + txt((x1 + x2) / 2 + (x2 > x1 ? 6 : -6), (y1 + y2) / 2, lab, { anchor: x2 > x1 ? "start" : "end", size: 10.5, fill: C.ink });
      let g = "";
      g += edge(320, 44, 160, 90, pct(prior)) + edge(320, 44, 480, 90, pct(1 - prior));
      g += edge(160, 134, 85, 178, pct(sens) + " +") + edge(160, 134, 235, 178, pct(1 - sens) + " −");
      g += edge(480, 134, 405, 178, pct(fpr) + " +") + edge(480, 134, 555, 178, pct(spec) + " −");
      g += box(320, 26, N, chain.length ? "people (after " + chain.length + " positive test" + (chain.length > 1 ? "s" : "") + ")" : "people", C.bg, C.line);
      g += box(160, 112, sick, "have the disease", C.surface || "#fff", C.line);
      g += box(480, 112, well, "don't", "#fff", C.line);
      g += box(85, 200, tp, "true positives", C.accent, C.accent, true);
      g += box(235, 200, fn, "false negatives", "#fff", C.line);
      g += box(405, 200, fp, "false positives", C.rose, C.rose, true);
      g += box(555, 200, tn, "true negatives", "#fff", C.line);
      g += txt(320, 246, `Positive tests: ${Math.round(tp).toLocaleString("en-IN")} true + ${Math.round(fp).toLocaleString("en-IN")} false`, { anchor: "middle", fill: C.ink, bold: 1 });
      svg.innerHTML = g;

      fbox.innerHTML = `P(D | +) = (${sens.toFixed(2)} × ${prior.toFixed(4)}) ÷ (${sens.toFixed(2)} × ${prior.toFixed(4)} + ${fpr.toFixed(2)} × ${(1 - prior).toFixed(4)}) = <b>${pct(post)}</b>`;
      chainEl.textContent = chain.length ? "Belief so far: " + [+pIn.value / 1000, ...chain, post].map(pct).join(" → ") : "";
      const verdict = post < 0.2 ? "Most positive results are false alarms: the low prior outweighs the test's accuracy."
        : post < 0.5 ? "A positive result raises the probability a lot, but the patient is still more likely healthy than sick. A second test would help."
        : post < 0.9 ? "A positive result now makes the disease more likely than not, but it isn't conclusive."
        : "A positive result is now strong evidence of disease.";
      out.innerHTML = `<div class="big-stat" style="margin-top:0"><b>${pct(post)}</b><span>probability of disease after ${chain.length ? "another" : "a"} positive result</span></div><p style="margin:.6rem 0 0">${verdict}${chain.length ? " Each positive result used the previous posterior as its prior." : ""}</p>`;
      return post;
    }
    [pIn, seIn, spIn].forEach((el) => el.addEventListener("input", () => { chain = []; render(); }));
    $(root, "[data-retest]").addEventListener("click", () => { const post = render(); if (chain.length < 5) { chain.push(post); render(); } });
    $(root, "[data-reset]").addEventListener("click", () => { chain = []; render(); });
    render();
  })();
})();
