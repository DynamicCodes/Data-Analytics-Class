// Session 05 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", rose: "#d94f70", amber: "#d98a0b" };
  const $ = (r, s) => r.querySelector(s);
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  const fmt = (v, d = 2) => (Number.isInteger(v) ? v.toLocaleString("en-IN") : (+v.toFixed(d)).toLocaleString("en-IN"));

  // shared statistics helpers
  const S = {
    mean: (a) => a.reduce((x, y) => x + y, 0) / a.length,
    q: (sorted, p) => { const i = (sorted.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo); },
    variance: (a, sample) => { const m = S.mean(a); return a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - (sample ? 1 : 0)); },
    modes: (a) => { const c = new Map(); a.forEach((v) => c.set(v, (c.get(v) || 0) + 1)); const mx = Math.max(...c.values()); return mx < 2 ? [] : [...c].filter(([, n]) => n === mx).map(([v]) => v); },
  };

  /* ------------------------------------------------------------
     1. Shape explorer
  ------------------------------------------------------------ */
  (function shape() {
    const root = document.getElementById("viz-shape");
    if (!root) return;
    const svg = $(root, "svg");
    const out = $(root, ".viz-out");
    const skIn = $(root, '[data-in="sk"]');
    const kBtns = [...root.querySelectorAll("[data-k]")];
    let beta = 2;

    const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
    const Phi = (x) => 0.5 * (1 + erf(x / Math.SQRT2));

    function render() {
      const a = +skIn.value;
      const xs = [], ys = [];
      for (let x = -3.5; x <= 3.5001; x += 0.02) { xs.push(x); ys.push(Math.exp(-Math.pow(Math.abs(x), beta)) * 2 * Phi(a * x)); }
      const dx = 0.02, area = ys.reduce((s, y) => s + y * dx, 0);
      const p = ys.map((y) => y / area);
      const mean = xs.reduce((s, x, i) => s + x * p[i] * dx, 0);
      let cum = 0, median = 0;
      for (let i = 0; i < xs.length; i++) { cum += p[i] * dx; if (cum >= 0.5) { median = xs[i]; break; } }
      const mode = xs[p.indexOf(Math.max(...p))];
      const m2 = xs.reduce((s, x, i) => s + (x - mean) ** 2 * p[i] * dx, 0);
      const m3 = xs.reduce((s, x, i) => s + (x - mean) ** 3 * p[i] * dx, 0);
      const m4 = xs.reduce((s, x, i) => s + (x - mean) ** 4 * p[i] * dx, 0);
      const skew = m3 / Math.pow(m2, 1.5), kurt = m4 / (m2 * m2) - 3;

      const W = 640, H = 250, L = 20, R = 20, T = 18, B = 34;
      const X = (x) => L + ((x + 3.5) / 7) * (W - L - R);
      const yMax = Math.max(...p) * 1.1;
      const Y = (y) => T + (1 - y / yMax) * (H - T - B);
      const path = xs.map((x, i) => `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(p[i]).toFixed(1)}`).join(" ");
      let g = `<line x1="${L}" x2="${W - R}" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.grid}" stroke-width="2"/>`;
      g += `<path d="${path} L${X(3.5)},${Y(0)} L${X(-3.5)},${Y(0)} Z" fill="${C.accent}" fill-opacity=".12"/>`;
      g += `<path d="${path}" fill="none" stroke="${C.accent}" stroke-width="2.5"/>`;
      const mk = (x, col, lab, row) => `<line x1="${X(x)}" x2="${X(x)}" y1="${T + 6}" y2="${Y(0)}" stroke="${col}" stroke-width="2" ${lab === "Mean" ? 'stroke-dasharray="5 3"' : ""}/>` + txt(X(x), H - 18 + row * 12, lab, { anchor: "middle", fill: col, bold: 1, size: 10.5 });
      g += mk(mode, C.amber, "Mode", 0) + mk(median, C.accent, "Median", Math.abs(median - mode) < 0.3 ? 1 : 0) + mk(mean, C.violet, "Mean", Math.abs(mean - median) < 0.3 ? 2 : 0);
      svg.innerHTML = g;

      $(root, '[data-out="sk"]').textContent = a === 0 ? "None" : a > 0 ? "Right (positive)" : "Left (negative)";
      const kName = beta < 2 ? "leptokurtic (tall and narrow, with heavy tails)" : beta > 2 ? "platykurtic (flat, with light tails)" : "mesokurtic (normal shape)";
      const skewTxt = Math.abs(skew) < 0.05
        ? "The distribution is symmetric, so the mean, median and mode coincide."
        : skew > 0
        ? "The long tail is on the right. Extreme high values pull the mean above the median, which sits above the mode. Incomes and house prices often look like this."
        : "The long tail is on the left. Extreme low values pull the mean below the median, which sits below the mode. Scores on an easy exam often look like this.";
      out.innerHTML = `<p>${skewTxt}</p><p>The peak is ${kName}.</p><div class="tag-grid"><div class="tag-cell"><span>Skewness</span><b>${skew.toFixed(2)}</b></div><div class="tag-cell"><span>Excess kurtosis</span><b>${kurt.toFixed(2)}</b></div></div>`;
    }
    skIn.addEventListener("input", render);
    kBtns.forEach((b) => b.addEventListener("click", () => { beta = +b.dataset.k; press(kBtns, b); render(); }));
    render();
  })();

  /* ------------------------------------------------------------
     2. Statistics calculator
  ------------------------------------------------------------ */
  (function calc() {
    const root = document.getElementById("viz-stats");
    if (!root) return;
    const input = $(root, "#stats-input");
    const svg = $(root, "svg");
    const out = $(root, ".viz-out");
    const grid = $(root, "[data-stats]");
    const pIn = $(root, '[data-in="p"]');
    const sBtn = $(root, "[data-sample]");
    const pBtns = [...root.querySelectorAll("[data-preset]")];
    let sample = false;

    const PRESETS = {
      sales: "480, 520, 510, 580, 600, 560, 610, 590, 570, 640, 660, 700",
      ages: "32, 35, 38, 39, 41, 42, 43, 43, 44, 46, 47, 49, 52, 55, 58, 61, 68",
      scores: "62, 68, 71, 74, 75, 75, 78, 80, 81, 83, 85, 86, 88, 90, 93",
    };
    input.value = PRESETS.sales;

    const ord = (n) => n + ((n % 100 >= 11 && n % 100 <= 13) ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th"));

    function render() {
      const data = input.value.split(/[\s,;]+/).map(Number).filter((v) => input.value.trim() && Number.isFinite(v));
      const p = +pIn.value;
      $(root, '[data-out="p"]').textContent = ord(p);
      if (data.length < 2) { svg.innerHTML = ""; grid.innerHTML = ""; out.innerHTML = "<p>Enter at least two numbers, separated by commas.</p>"; return; }

      const a = [...data].sort((x, y) => x - y);
      const n = a.length, mean = S.mean(a), med = S.q(a, 0.5), q1 = S.q(a, 0.25), q3 = S.q(a, 0.75), iqr = q3 - q1;
      const v = S.variance(a, sample), sd = Math.sqrt(v), cv = (sd / mean) * 100, pv = S.q(a, p / 100), modes = S.modes(a);

      const cells = [
        ["Count (n)", n], ["Mean", fmt(mean)], ["Median", fmt(med)], ["Mode", modes.length ? modes.slice(0, 3).map((x) => fmt(x)).join(", ") : "None"],
        ["Range", fmt(a[n - 1] - a[0])], ["Q1", fmt(q1)], ["Q3", fmt(q3)], ["IQR", fmt(iqr)],
        [sample ? "Variance (s²)" : "Variance (σ²)", fmt(v, 1)], [sample ? "Std dev (s)" : "Std dev (σ)", fmt(sd)], ["CV", cv.toFixed(1) + "%"], [ord(p) + " percentile", fmt(pv)],
      ];
      grid.innerHTML = cells.map(([k, val]) => `<div class="stat"><b>${val}</b><span>${k}</span></div>`).join("");

      // chart
      const W = 640, L = 24, R = 24, span = a[n - 1] - a[0] || 1;
      const lo = a[0] - span * 0.05, hi = a[n - 1] + span * 0.05;
      const X = (x) => L + ((x - lo) / (hi - lo)) * (W - L - R);
      let g = "";
      const stacks = new Map();
      a.forEach((x) => { const k = Math.round(X(x) / 9); const h = stacks.get(k) || 0; stacks.set(k, h + 1); g += `<circle cx="${X(x)}" cy="${96 - h * 11}" r="5" fill="${C.accent}" fill-opacity=".8" stroke="#fff"/>`; });
      g += `<line x1="${L}" x2="${W - R}" y1="104" y2="104" stroke="${C.grid}" stroke-width="2"/>`;
      // box plot
      const wlo = a.find((x) => x >= q1 - 1.5 * iqr), whi = [...a].reverse().find((x) => x <= q3 + 1.5 * iqr);
      g += `<line x1="${X(wlo)}" x2="${X(whi)}" y1="150" y2="150" stroke="${C.ink}"/><line x1="${X(wlo)}" x2="${X(wlo)}" y1="140" y2="160" stroke="${C.ink}"/><line x1="${X(whi)}" x2="${X(whi)}" y1="140" y2="160" stroke="${C.ink}"/>`;
      g += `<rect x="${X(q1)}" y="132" width="${Math.max(2, X(q3) - X(q1))}" height="36" rx="5" fill="${C.light}" fill-opacity=".6" stroke="${C.accent}" stroke-width="2"/>`;
      a.filter((x) => x < wlo || x > whi).forEach((x) => (g += `<circle cx="${X(x)}" cy="150" r="5" fill="${C.rose}"/>`));
      g += `<line x1="${X(med)}" x2="${X(med)}" y1="20" y2="168" stroke="${C.accent}" stroke-width="2.5"/>`;
      g += `<line x1="${X(mean)}" x2="${X(mean)}" y1="20" y2="168" stroke="${C.violet}" stroke-width="2.5" stroke-dasharray="5 3"/>`;
      g += `<path d="M${X(pv) - 6},184 L${X(pv) + 6},184 L${X(pv)},174 Z" fill="${C.amber}"/>`;
      g += txt(X(q1), 125, "Q1", { anchor: "middle", fill: C.ink }) + txt(X(q3), 125, "Q3", { anchor: "middle", fill: C.ink });
      [a[0], a[n - 1]].forEach((x) => (g += txt(X(x), 205, fmt(x), { anchor: "middle" })));
      svg.innerHTML = g;

      const diff = mean - med;
      const shapeTxt = Math.abs(diff) < sd * 0.1
        ? "The mean and median are close, so the data is roughly symmetric."
        : diff > 0 ? `The mean is ${fmt(diff)} above the median: a few high values are pulling it up (right skew).`
        : `The mean is ${fmt(-diff)} below the median: a few low values are pulling it down (left skew).`;
      const outl = a.filter((x) => x < wlo || x > whi).length;
      out.innerHTML = `<p>${shapeTxt} ${outl ? `${outl} value${outl > 1 ? "s lie" : " lies"} beyond 1.5 × IQR from the box and ${outl > 1 ? "are" : "is"} flagged as ${outl > 1 ? "outliers" : "an outlier"}.` : ""} ${cv < 15 ? "A CV of " + cv.toFixed(1) + "% indicates low relative variability." : "A CV of " + cv.toFixed(1) + "% indicates considerable relative variability."}</p>`;
    }

    pBtns.forEach((b) => b.addEventListener("click", () => { press(pBtns, b); input.value = PRESETS[b.dataset.preset]; render(); }));
    $(root, "[data-outlier]").addEventListener("click", () => {
      const nums = input.value.split(/[\s,;]+/).map(Number).filter(Number.isFinite);
      if (!nums.length) return;
      const mx = Math.max(...nums), mn = Math.min(...nums);
      input.value = input.value.trim().replace(/,\s*$/, "") + ", " + Math.round(mx + (mx - mn) * 2.5);
      render();
    });
    sBtn.addEventListener("click", () => { sample = !sample; sBtn.setAttribute("aria-pressed", String(sample)); render(); });
    input.addEventListener("input", () => { pBtns.forEach((b) => b.setAttribute("aria-pressed", "false")); render(); });
    pIn.addEventListener("input", render);
    render();
  })();

  /* ------------------------------------------------------------
     3. Monthly sales time series
  ------------------------------------------------------------ */
  (function sales() {
    const root = document.getElementById("viz-sales");
    if (!root) return;
    const svg = $(root, "svg");
    const out = $(root, ".viz-out");
    const btns = [...root.querySelectorAll("[data-layer]")];
    const on = { mean: true, sd: false, range: false, trend: false };
    let last = "mean";

    const d = [480, 520, 510, 580, 600, 560, 610, 590, 570, 640, 660, 700];
    const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mean = S.mean(d), sd = Math.sqrt(S.variance(d, false));
    const xs = d.map((_, i) => i + 1), mx = S.mean(xs);
    const slope = xs.reduce((s, x, i) => s + (x - mx) * (d[i] - mean), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
    const icpt = mean - slope * mx;

    const copy = {
      mean: `<p>The mean of ₹585k runs through the middle of the year: early months sit below it and later months above it, a first sign of growth.</p>`,
      sd: `<p>The band covers the mean ± one standard deviation (₹524k to ₹646k). Seven of the twelve months fall inside it. The five outside it are the first three and last two months, exactly where an upward trend would push values.</p>`,
      range: `<p>The range runs from ₹480k in January to ₹700k in December, a spread of ₹220k. Because the lowest and highest months are the first and last, the range here mostly reflects growth rather than instability.</p>`,
      trend: `<p>A straight-line trend fitted to the data rises by about ₹16k per month. Growth is steady, with a dip in September before a strong finish in the last quarter.</p>`,
    };

    function render() {
      const W = 640, H = 280, L = 48, R = 70, T = 24, B = 34;
      const Y = (v) => T + (1 - (v - 400) / 350) * (H - T - B);
      const X = (i) => L + 16 + (i / 11) * (W - L - R - 32);
      let g = "";
      for (let v = 400; v <= 750; v += 50) g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
      m.forEach((s, i) => (g += txt(X(i), H - 12, s, { anchor: "middle" })));
      if (on.sd) {
        g += `<rect x="${L}" y="${Y(mean + sd)}" width="${W - L - R}" height="${Y(mean - sd) - Y(mean + sd)}" fill="${C.violet}" opacity=".1"/>`;
        g += txt(W - R + 6, Y(mean + sd) + 4, "+1σ", { fill: C.violet, bold: 1 }) + txt(W - R + 6, Y(mean - sd) + 4, "−1σ", { fill: C.violet, bold: 1 });
      }
      if (on.range) {
        [[700, "Max 700"], [480, "Min 480"]].forEach(([v, l]) => (g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.rose}" stroke-dasharray="3 3"/>` + txt(W - R + 6, Y(v) + 4, l, { fill: C.rose, bold: 1 })));
      }
      if (on.mean) g += `<line x1="${L}" x2="${W - R}" y1="${Y(mean)}" y2="${Y(mean)}" stroke="${C.violet}" stroke-width="2" stroke-dasharray="6 4"/>` + txt(W - R + 6, Y(mean) + 4, "Mean 585", { fill: C.violet, bold: 1 });
      if (on.trend) g += `<line x1="${X(0)}" x2="${X(11)}" y1="${Y(icpt + slope)}" y2="${Y(icpt + slope * 12)}" stroke="${C.amber}" stroke-width="2.5"/>`;
      g += `<polyline points="${d.map((v, i) => `${X(i)},${Y(v)}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="3" stroke-linejoin="round"/>`;
      d.forEach((v, i) => {
        const inBand = Math.abs(v - mean) <= sd;
        g += `<circle cx="${X(i)}" cy="${Y(v)}" r="5" fill="${on.sd && !inBand ? C.rose : "#fff"}" stroke="${C.accent}" stroke-width="2.5"><title>${m[i]}: ₹${v}k</title></circle>`;
      });
      svg.innerHTML = g;
      out.innerHTML = copy[last];
    }

    btns.forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.layer; on[k] = !on[k]; b.setAttribute("aria-pressed", String(on[k]));
      if (on[k]) last = k;
      render();
    }));
    render();
  })();
})();
