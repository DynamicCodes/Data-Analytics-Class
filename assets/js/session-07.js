// Session 07 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  const f3 = (v) => (Math.abs(v) < 0.0005 && v !== 0 ? v.toExponential(1) : v.toFixed(3));
  const f2 = (v) => v.toFixed(2);

  // maths
  const LF = [0];
  const logFact = (n) => { for (let i = LF.length; i <= n; i++) LF[i] = LF[i - 1] + Math.log(i); return LF[n]; };
  const choose = (n, k) => Math.round(Math.exp(logFact(n) - logFact(k) - logFact(n - k)));
  const binom = (n, k, p) => (k < 0 || k > n ? 0 : p === 0 ? +(k === 0) : p === 1 ? +(k === n) : Math.exp(logFact(n) - logFact(k) - logFact(n - k) + k * Math.log(p) + (n - k) * Math.log(1 - p)));
  const pois = (l, k) => (k < 0 ? 0 : Math.exp(-l + k * Math.log(l) - logFact(k)));
  const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
  const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
  const npdf = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
  const ncdf = (x, m, s) => Phi((x - m) / s);
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const sdev = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
  const R = Math.random;
  const gauss = () => { let u = 0, v = 0; while (!u) u = R(); while (!v) v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  function frame(W, H, L, Rt, T, B, yMax, yStep, fmt = (v) => v) {
    const Y = (v) => T + (1 - v / yMax) * (H - T - B);
    let g = "";
    for (let v = 0; v <= yMax + 1e-9; v += yStep) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, fmt(v), { anchor: "end" });
    return [g, Y];
  }
  const niceStep = (max) => { const raw = max / 4, p = Math.pow(10, Math.floor(Math.log10(raw))); const m = raw / p; return (m < 1.5 ? 1 : m < 3.5 ? 2.5 : m < 7.5 ? 5 : 10) * p; };

  /* ------------------------------------------------------------
     1. Random variable mapping
  ------------------------------------------------------------ */
  (function rv() {
    const root = document.getElementById("viz-rv");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), eBtns = $$(root, "[data-exp]");
    const dice = [1, 2, 3, 4, 5, 6];
    const EXP = {
      coin: { outs: ["H", "T"], x: (o) => (o === "H" ? 1 : 0), def: "X = 1 for heads, 0 for tails" },
      die: { outs: dice.map(String), x: (o) => +o, def: "X = the number showing" },
      three: { outs: ["HHH", "HHT", "HTH", "THH", "HTT", "THT", "TTH", "TTT"], x: (o) => o.split("").filter((c) => c === "H").length, def: "X = number of heads" },
      sum: { outs: dice.flatMap((a) => dice.map((b) => a + "," + b)), x: (o) => o.split(",").reduce((s, v) => s + +v, 0), def: "X = sum of the two dice" },
    };
    let key = "coin", last = null, runs = [];

    function render() {
      const e = EXP[key], n = e.outs.length;
      const vals = [...new Set(e.outs.map(e.x))].sort((a, b) => a - b);
      const P = vals.map((v) => e.outs.filter((o) => e.x(o) === v).length / n);
      const EX = vals.reduce((s, v, i) => s + v * P[i], 0), VX = vals.reduce((s, v, i) => s + (v - EX) ** 2 * P[i], 0);
      const H = 300, top = 34, rowH = Math.min(40, (H - top - 16) / vals.length), vx = 300, bx = 340, bw = 190;
      const vy = (i) => top + rowH * (i + 0.5);
      const maxP = Math.max(...P);
      let g = txt(20, 18, "Sample space S", { fill: C.ink, bold: 1 }) + txt(vx, 18, "X", { fill: C.ink, bold: 1, anchor: "middle" }) + txt(bx, 18, "P(X = x)", { fill: C.ink, bold: 1 });
      // outcomes
      let pos;
      if (n <= 8) { const oh = Math.min(40, (H - top - 16) / n); pos = e.outs.map((o, i) => [90, top + oh * (i + 0.5)]); }
      else pos = e.outs.map((o, i) => [30 + (i % 6) * 36, top + 14 + Math.floor(i / 6) * 38]);
      e.outs.forEach((o, i) => {
        const [x, y] = pos[i], hot = o === last, vi = vals.indexOf(e.x(o));
        if (n <= 8 || hot) g += `<line x1="${x + (n <= 8 ? 34 : 16)}" y1="${y}" x2="${vx - 16}" y2="${vy(vi)}" stroke="${hot ? C.amber : C.line}" stroke-width="${hot ? 2.5 : 1.2}"/>`;
        const w = n <= 8 ? 64 : 32;
        g += `<rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="8" fill="${hot ? C.amber : "#fff"}" stroke="${hot ? C.amber : C.line}"/>` + txt(x, y + 4, o, { anchor: "middle", fill: hot ? "#fff" : C.ink, bold: 1, size: n <= 8 ? 12 : 9.5 });
      });
      vals.forEach((v, i) => {
        const hot = last && e.x(last) === v;
        g += `<circle cx="${vx}" cy="${vy(i)}" r="14" fill="${hot ? C.amber : C.accent}"/>` + txt(vx, vy(i) + 4, v, { anchor: "middle", fill: "#fff", bold: 1, size: 12 });
        const w = (P[i] / maxP) * bw;
        g += `<rect x="${bx}" y="${vy(i) - Math.min(11, rowH / 2 - 2)}" width="${w}" height="${Math.min(22, rowH - 4)}" rx="4" fill="${hot ? C.amber : C.light}"/>`;
        const frac = Math.round(P[i] * n);
        g += txt(bx + w + 6, vy(i) + 4, `${frac}/${n} = ${P[i].toFixed(3)}`, { fill: C.ink, size: 10.5 });
      });
      svg.innerHTML = g;
      $(root, '[data-stat="ex"]').textContent = +EX.toFixed(3);
      $(root, '[data-stat="var"]').textContent = +VX.toFixed(3);
      $(root, '[data-stat="sd"]').textContent = +Math.sqrt(VX).toFixed(3);
      const avg = runs.length ? mean(runs) : null;
      out.innerHTML = `<p><b>${e.def}.</b> ${last ? `Outcome <b>${last}</b> gives X = <b>${e.x(last)}</b>. ` : ""}${runs.length ? `Your ${runs.length} run${runs.length > 1 ? "s" : ""} average ${avg.toFixed(2)}; with many runs this settles on E[X] = ${+EX.toFixed(3)}.` : "Run the experiment to see an outcome mapped to its value."} All the probabilities add up to 1.</p>`;
    }
    eBtns.forEach((b) => b.addEventListener("click", () => { key = b.dataset.exp; press(eBtns, b); last = null; runs = []; render(); }));
    $(root, "[data-run]").addEventListener("click", () => { const e = EXP[key]; last = e.outs[Math.floor(R() * e.outs.length)]; runs.push(e.x(last)); render(); });
    render();
  })();

  /* ------------------------------------------------------------
     2. Probability as bars and area
  ------------------------------------------------------------ */
  (function area() {
    const root = document.getElementById("viz-area");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out");
    const tBtns = $$(root, "[data-t]"), cdfBtn = $(root, "[data-cdf]");
    const aIn = $(root, '[data-in="a"]'), bIn = $(root, '[data-in="b"]');
    const dsum = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => [s, (6 - Math.abs(7 - s)) / 36]);
    let type = "disc", cdf = false;
    const W = 640, H = 260, L = 46, Rt = 18, T = 20, B = 36;
    function setRanges() {
      if (type === "disc") Object.assign(aIn, { min: 2, max: 12, step: 1 }), Object.assign(bIn, { min: 2, max: 12, step: 1 }), (aIn.value = 5), (bIn.value = 9);
      else Object.assign(aIn, { min: 135, max: 195, step: 1 }), Object.assign(bIn, { min: 135, max: 195, step: 1 }), (aIn.value = 157), (bIn.value = 173);
    }
    function render(ch) {
      let a = +aIn.value, b = +bIn.value;
      if (a > b) { if (ch === aIn) bIn.value = b = a; else aIn.value = a = b; }
      $(root, '[data-out="a"]').textContent = a;
      $(root, '[data-out="b"]').textContent = b;
      let g = "", p;
      if (type === "disc") {
        const X = (s) => L + ((s - 1.5) / 11) * (W - L - Rt), bw = (W - L - Rt) / 11 * 0.7;
        if (!cdf) {
          const [fr, Y] = frame(W, H, L, Rt, T, B, 0.18, 0.06, f2); g += fr;
          dsum.forEach(([s, q]) => { const on = s >= a && s <= b; g += `<rect x="${X(s) - bw / 2}" y="${Y(q)}" width="${bw}" height="${Y(0) - Y(q)}" rx="4" fill="${on ? C.accent : C.light}" opacity="${on ? 1 : 0.6}"/>` + txt(X(s), Y(q) - 5, Math.round(q * 36) + "/36", { anchor: "middle", size: 9.5, fill: on ? C.ink : C.soft }); });
        } else {
          const [fr, Y] = frame(W, H, L, Rt, T, B, 1, 0.25, f2); g += fr;
          let cum = 0;
          dsum.forEach(([s, q]) => { cum += q; g += `<line x1="${X(s) - bw / 2 - 6}" x2="${X(s) + bw / 2 + 6}" y1="${Y(cum)}" y2="${Y(cum)}" stroke="${s === b || s === a - 1 ? C.violet : C.accent}" stroke-width="3"/><circle cx="${X(s) - bw / 2 - 6}" cy="${Y(cum)}" r="3.5" fill="${C.accent}"/>`; });
        }
        dsum.forEach(([s]) => (g += txt(X(s), H - 18, s, { anchor: "middle", fill: C.ink })));
        g += txt((W + L) / 2, H - 3, "Sum of two dice", { anchor: "middle" });
        p = dsum.filter(([s]) => s >= a && s <= b).reduce((t, [, q]) => t + q, 0);
        const Fb = dsum.filter(([s]) => s <= b).reduce((t, [, q]) => t + q, 0), Fa = dsum.filter(([s]) => s <= a - 1).reduce((t, [, q]) => t + q, 0);
        out.innerHTML = cdf
          ? `<p>The CDF climbs in steps, one at each possible value. P(${a} ≤ X ≤ ${b}) = F(${b}) − F(${a - 1}) = ${Fb.toFixed(3)} − ${Fa.toFixed(3)} = <b>${p.toFixed(3)}</b>.</p>`
          : `<p>Add the shaded bars: P(${a} ≤ X ≤ ${b}) = ${Math.round(p * 36)}/36 = <b>${p.toFixed(3)}</b>. Each bar is a real probability, so a single value such as P(X = 7) = 6/36 is meaningful.</p>`;
      } else {
        const m = 165, s = 8, X = (x) => L + ((x - 133) / 64) * (W - L - Rt);
        const xs = []; for (let x = 133; x <= 197; x += 0.5) xs.push(x);
        if (!cdf) {
          const [fr, Y] = frame(W, H, L, Rt, T, B, 0.06, 0.02, f2); g += fr;
          const sh = xs.filter((x) => x >= a && x <= b);
          if (sh.length) g += `<path d="M${X(a)},${Y(0)} ${sh.map((x) => `L${X(x)},${Y(npdf(x, m, s))}`).join(" ")} L${X(b)},${Y(npdf(b, m, s))} L${X(b)},${Y(0)} Z" fill="${C.accent}" opacity=".35"/>`;
          g += `<path d="${xs.map((x, i) => `${i ? "L" : "M"}${X(x)},${Y(npdf(x, m, s))}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/>`;
          g += txt(L - 40, T - 6, "Density f(x)");
        } else {
          const [fr, Y] = frame(W, H, L, Rt, T, B, 1, 0.25, f2); g += fr;
          g += `<path d="${xs.map((x, i) => `${i ? "L" : "M"}${X(x)},${Y(ncdf(x, m, s))}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/>`;
          [[a, ncdf(a, m, s)], [b, ncdf(b, m, s)]].forEach(([x, v]) => (g += `<line x1="${X(x)}" x2="${X(x)}" y1="${Y(0)}" y2="${Y(v)}" stroke="${C.violet}" stroke-dasharray="4 3"/><line x1="${L}" x2="${X(x)}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.violet}" stroke-dasharray="4 3"/><circle cx="${X(x)}" cy="${Y(v)}" r="4" fill="${C.violet}"/>`));
        }
        for (let x = 135; x <= 195; x += 10) g += txt(X(x), H - 18, x, { anchor: "middle", fill: C.ink });
        g += txt((W + L) / 2, H - 3, "Height (cm)", { anchor: "middle" });
        p = ncdf(b, m, s) - ncdf(a, m, s);
        const za = (a - m) / s, zb = (b - m) / s;
        const rule = a === 157 && b === 173 ? " This is μ ± 1σ, which always holds about 68% of a normal distribution." : a === 149 && b === 181 ? " This is μ ± 2σ: about 95%." : a === 141 && b === 189 ? " This is μ ± 3σ: about 99.7%." : "";
        out.innerHTML = `<p>${cdf ? `P(${a} ≤ X ≤ ${b}) = F(${b}) − F(${a}) = ${ncdf(b, m, s).toFixed(3)} − ${ncdf(a, m, s).toFixed(3)}` : `The shaded area is P(${a} ≤ X ≤ ${b})`} = <b>${p.toFixed(3)}</b>. In z-scores that is from ${za.toFixed(2)} to ${zb.toFixed(2)} standard deviations.${rule} Move a and b together: the area, and so P(X = x) for a single exact height, shrinks to 0.</p>`;
      }
      svg.innerHTML = g;
    }
    tBtns.forEach((btn) => btn.addEventListener("click", () => { type = btn.dataset.t; press(tBtns, btn); setRanges(); render(); }));
    cdfBtn.addEventListener("click", () => { cdf = !cdf; cdfBtn.setAttribute("aria-pressed", String(cdf)); render(); });
    [aIn, bIn].forEach((el) => el.addEventListener("input", () => render(el)));
    setRanges(); render();
  })();

  /* ------------------------------------------------------------
     3. Empirical vs theoretical
  ------------------------------------------------------------ */
  (function lln() {
    const root = document.getElementById("viz-lln");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), eBtns = $$(root, "[data-e]");
    let kind = "coin", counts, path, total;
    const reset = () => { counts = new Array(kind === "coin" ? 2 : 6).fill(0); path = []; total = 0; };
    function add(n) {
      const k = counts.length;
      for (let i = 0; i < n; i++) { counts[Math.floor(R() * k)]++; total++; path.push(counts[0] / total); }
    }
    function render() {
      const k = counts.length, labels = kind === "coin" ? ["Head", "Tail"] : ["1", "2", "3", "4", "5", "6"], th = 1 / k;
      const W = 640, H = 260, T = 24, B = 36;
      let g = "";
      // left: bars
      const L1 = 40, R1 = 320, Y = (v) => T + (1 - v / 1) * (H - T - B), yMax = kind === "coin" ? 1 : 0.4, Y1 = (v) => T + (1 - v / yMax) * (H - T - B);
      for (let v = 0; v <= yMax + 1e-9; v += yMax / 4) g += `<line x1="${L1}" x2="${R1}" y1="${Y1(v)}" y2="${Y1(v)}" stroke="${C.grid}"/>` + txt(L1 - 6, Y1(v) + 4, v.toFixed(2), { anchor: "end", size: 10 });
      const gw = (R1 - L1) / k;
      labels.forEach((lab, i) => {
        const f = total ? counts[i] / total : 0, cx = L1 + gw * (i + 0.5), bw = Math.min(28, gw * 0.35);
        g += `<rect x="${cx - bw - 1}" y="${Y1(f)}" width="${bw}" height="${Y1(0) - Y1(f)}" rx="3" fill="${C.accent}"/><rect x="${cx + 1}" y="${Y1(th)}" width="${bw}" height="${Y1(0) - Y1(th)}" rx="3" fill="${C.violet}" opacity=".7"/>`;
        g += txt(cx, H - 18, lab, { anchor: "middle", fill: C.ink });
        if (total) g += txt(cx - bw / 2 - 1, Y1(f) - 4, f.toFixed(2), { anchor: "middle", size: 9.5, fill: C.ink });
      });
      g += txt(L1, T - 8, "Relative frequency", { fill: C.ink, bold: 1 });
      // right: running proportion
      const L2 = 380, R2 = 626, lo = 0, hi = kind === "coin" ? 1 : 0.4, Y2 = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
      g += txt(L2, T - 8, `Running share of ${kind === "coin" ? "heads" : "ones"}`, { fill: C.ink, bold: 1 });
      g += `<line x1="${L2}" x2="${R2}" y1="${Y2(th)}" y2="${Y2(th)}" stroke="${C.violet}" stroke-width="2" stroke-dasharray="5 3"/>` + txt(R2, Y2(th) - 5, th.toFixed(3), { anchor: "end", fill: C.violet, bold: 1 });
      g += `<line x1="${L2}" x2="${R2}" y1="${Y2(lo)}" y2="${Y2(lo)}" stroke="${C.line}"/>`;
      if (path.length > 1) {
        const step = Math.max(1, Math.floor(path.length / 400));
        const pts = []; for (let i = 0; i < path.length; i += step) pts.push(`${L2 + (i / (path.length - 1)) * (R2 - L2)},${Y2(Math.min(hi, path[i]))}`);
        pts.push(`${R2},${Y2(Math.min(hi, path[path.length - 1]))}`);
        g += `<polyline points="${pts.join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2"/>`;
      }
      g += txt(L2, H - 18, "1", { fill: C.soft }) + txt(R2, H - 18, total.toLocaleString("en-IN"), { anchor: "end", fill: C.soft }) + txt((L2 + R2) / 2, H - 3, "Number of trials", { anchor: "middle" });
      svg.innerHTML = g;
      const dev = total ? Math.max(...counts.map((c) => Math.abs(c / total - th))) : 0;
      out.innerHTML = total
        ? `<p>After <b>${total.toLocaleString("en-IN")}</b> trials, the observed frequencies are at most <b>${dev.toFixed(3)}</b> away from the theoretical ${th.toFixed(3)}. ${total < 100 ? "With so little data, the empirical distribution can be well off, like the 0.6/0.4 split in the slide's 10 tosses." : "As data grows, the empirical distribution converges on the theoretical one (the law of large numbers)."}</p>`
        : "<p>Start tossing. The first bars on the left are the observed relative frequencies; the purple bars are the theoretical probabilities.</p>";
    }
    eBtns.forEach((b) => b.addEventListener("click", () => { kind = b.dataset.e; press(eBtns, b); reset(); render(); }));
    $$(root, "[data-add]").forEach((b) => b.addEventListener("click", () => { const n = +b.dataset.add; n ? add(n) : reset(); render(); }));
    reset(); add(10); render();
  })();

  /* ------------------------------------------------------------
     4. Distribution explorer
  ------------------------------------------------------------ */
  (function dist() {
    const root = document.getElementById("viz-dist");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), tabBar = $(root, ".controls"), pBar = $(root, "[data-params]");
    const D = {
      binom: { name: "Binomial", p: [["n", "Trials n", 1, 50, 1, 3], ["p", "Success probability p", 0.05, 0.95, 0.05, 0.5], ["k", "k successes", 0, 50, 1, 2]] },
      pois: { name: "Poisson", p: [["l", "Rate λ", 0.5, 20, 0.5, 4], ["k", "k events", 0, 40, 1, 2]] },
      norm: { name: "Normal", p: [["m", "Mean μ", 50, 90, 1, 70], ["s", "SD σ", 2, 20, 1, 10], ["x", "x", 20, 120, 1, 80]] },
      unif: { name: "Uniform", p: [["a", "Lower a", 0, 9, 0.5, 0], ["b", "Upper b", 1, 10, 0.5, 1], ["x", "x", 0, 10, 0.1, 0.3]] },
      expo: { name: "Exponential", p: [["l", "Rate λ", 0.1, 3, 0.1, 0.5], ["x", "x", 0, 16, 0.1, 2]] },
    };
    let cur = "binom", v = {};
    const tabs = Object.entries(D).map(([k, d]) => { const b = document.createElement("button"); b.className = "btn"; b.textContent = d.name; b.addEventListener("click", () => { cur = k; press(tabs, b); build(); }); tabBar.appendChild(b); return b; });

    function build() {
      v = {};
      pBar.innerHTML = D[cur].p.map(([id, lab, mn, mx, st, df]) => { v[id] = df; return `<label class="range">${lab} <span data-o="${id}">${df}</span><input type="range" min="${mn}" max="${mx}" step="${st}" value="${df}" data-p="${id}" /></label>`; }).join("");
      $$(pBar, "input").forEach((el) => el.addEventListener("input", () => { v[el.dataset.p] = +el.value; render(); }));
      render();
    }

    function render() {
      const W = 640, H = 270, L = 50, Rt = 18, T = 22, B = 36;
      let g = "", html = "", mu, va, shape;
      if (cur === "binom" && v.b <= v.a) v.b = v.a + 0.5;
      if (cur === "binom") { v.k = Math.min(v.k, v.n); $(pBar, '[data-p="k"]').max = v.n; $(pBar, '[data-p="k"]').value = v.k; }
      if (cur === "unif") { if (v.b <= v.a) { v.b = v.a + 0.5; $(pBar, '[data-p="b"]').value = v.b; } }
      Object.keys(v).forEach((k) => { const o = $(pBar, `[data-o="${k}"]`); if (o) o.textContent = +(+v[k]).toFixed(2); });

      if (cur === "binom" || cur === "pois") {
        const kmax = cur === "binom" ? v.n : Math.max(12, Math.ceil(v.l + 4 * Math.sqrt(v.l)));
        const ks = Array.from({ length: kmax + 1 }, (_, k) => k);
        const P = ks.map((k) => (cur === "binom" ? binom(v.n, k, v.p) : pois(v.l, k)));
        const ym = Math.max(...P) * 1.15, [fr, Y] = frame(W, H, L, Rt, T, B, ym, niceStep(ym), (x) => +x.toFixed(3)); g += fr;
        const bw = (W - L - Rt) / ks.length, X = (k) => L + bw * (k + 0.5);
        ks.forEach((k) => {
          const on = k === v.k;
          g += `<rect data-k="${k}" x="${X(k) - bw * 0.38}" y="${Y(P[k])}" width="${bw * 0.76}" height="${Math.max(0, Y(0) - Y(P[k]))}" rx="3" fill="${on ? C.violet : C.accent}" style="cursor:pointer"/>`;
          if (ks.length <= 26 || k % 5 === 0) g += txt(X(k), H - 20, k, { anchor: "middle", fill: C.ink, size: 10 });
        });
        g += txt((W + L) / 2, H - 4, cur === "binom" ? "Number of successes k" : "Number of events k", { anchor: "middle" }) + txt(L - 44, T - 8, "P(X = k)");
        const pk = P[v.k] || 0;
        if (cur === "binom") {
          mu = v.n * v.p; va = mu * (1 - v.p); shape = Math.abs(v.p - 0.5) < 0.001 ? "Symmetric" : v.p < 0.5 ? "Right-skewed" : "Left-skewed";
          html = `<div class="formula">P(X = ${v.k}) = C(${v.n}, ${v.k}) × ${v.p}<sup>${v.k}</sup> × ${+(1 - v.p).toFixed(2)}<sup>${v.n - v.k}</sup> = ${choose(v.n, v.k).toLocaleString("en-IN")} × ${f3(Math.pow(v.p, v.k) * Math.pow(1 - v.p, v.n - v.k))} = <b>${f3(pk)}</b></div><p>The chance of exactly ${v.k} successes in ${v.n} trials. ${v.n === 3 && v.p === 0.5 && v.k === 2 ? "This is the slide's example: 2 heads in 3 fair tosses." : ""}</p>`;
        } else {
          mu = v.l; va = v.l; shape = v.l < 10 ? "Right-skewed" : "Nearly symmetric";
          html = `<div class="formula">P(X = ${v.k}) = e<sup>−${v.l}</sup> × ${v.l}<sup>${v.k}</sup> ÷ ${v.k}! = <b>${f3(pk)}</b></div><p>The chance of exactly ${v.k} events when ${v.l} are expected on average. ${v.l === 4 && v.k === 2 ? "This is the slide's example: 2 patients in an hour at a clinic that averages 4." : ""}</p>`;
        }
      } else {
        let lo, hi, pdf, cdfv, x = v.x;
        if (cur === "norm") { lo = v.m - 4 * v.s; hi = v.m + 4 * v.s; pdf = (t) => npdf(t, v.m, v.s); cdfv = ncdf(x, v.m, v.s); mu = v.m; va = v.s * v.s; shape = "Symmetric bell"; }
        else if (cur === "unif") { lo = 0; hi = 10; pdf = (t) => (t >= v.a && t <= v.b ? 1 / (v.b - v.a) : 0); cdfv = Math.min(1, Math.max(0, (x - v.a) / (v.b - v.a))); mu = (v.a + v.b) / 2; va = (v.b - v.a) ** 2 / 12; shape = "Flat"; }
        else { lo = 0; hi = 16; pdf = (t) => (t < 0 ? 0 : v.l * Math.exp(-v.l * t)); cdfv = 1 - Math.exp(-v.l * Math.max(0, x)); mu = 1 / v.l; va = 1 / (v.l * v.l); shape = "Right-skewed"; }
        const xs = []; for (let i = 0; i <= 300; i++) xs.push(lo + ((hi - lo) * i) / 300);
        if (cur === "unif") xs.push(v.a - 1e-9, v.a, v.b, v.b + 1e-9), xs.sort((p, q) => p - q);
        const ym = Math.max(...xs.map(pdf)) * 1.15, [fr, Y] = frame(W, H, L, Rt, T, B, ym, niceStep(ym), (t) => +t.toFixed(3)); g += fr;
        const X = (t) => L + ((t - lo) / (hi - lo)) * (W - L - Rt);
        const xc = Math.max(lo, Math.min(hi, x));
        const sh = xs.filter((t) => t <= xc);
        if (sh.length) g += `<path d="M${X(lo)},${Y(0)} ${sh.map((t) => `L${X(t)},${Y(pdf(t))}`).join(" ")} L${X(xc)},${Y(0)} Z" fill="${C.violet}" opacity=".25"/>`;
        g += `<path d="${xs.map((t, i) => `${i ? "L" : "M"}${X(t)},${Y(pdf(t))}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/>`;
        g += `<line x1="${X(xc)}" x2="${X(xc)}" y1="${T}" y2="${Y(0)}" stroke="${C.violet}" stroke-width="2"/>` + txt(X(xc) + 5, T + 10, "x = " + +x.toFixed(2), { fill: C.violet, bold: 1 });
        for (let i = 0; i <= 8; i++) { const t = lo + ((hi - lo) * i) / 8; g += txt(X(t), H - 20, +t.toFixed(1), { anchor: "middle", fill: C.ink, size: 10 }); }
        g += txt(L - 44, T - 8, "Density f(x)");
        if (cur === "norm") {
          const z = (x - v.m) / v.s;
          html = `<div class="formula">z = (${x} − ${v.m}) ÷ ${v.s} = ${z.toFixed(2)} &nbsp;⇒&nbsp; P(X ≤ ${x}) = Φ(${z.toFixed(2)}) = <b>${cdfv.toFixed(3)}</b></div><p>The shaded area. Change μ to slide the curve and σ to widen or narrow it; the total area stays 1.</p>`;
        } else if (cur === "unif") html = `<div class="formula">P(X ≤ ${+x.toFixed(2)}) = (${+x.toFixed(2)} − ${v.a}) ÷ (${v.b} − ${v.a}) = <b>${cdfv.toFixed(3)}</b></div><p>Every value between a and b is equally likely, so probability is just the share of the interval. With a = 0 and b = 1 this is a random number between 0 and 1.</p>`;
        else html = `<div class="formula">P(X ≤ ${+x.toFixed(2)}) = 1 − e<sup>−${v.l} × ${+x.toFixed(2)}</sup> = <b>${cdfv.toFixed(3)}</b></div><p>Time until the next event when events happen at rate λ. With λ = ${v.l} per minute, the average wait is ${+(1 / v.l).toFixed(2)} minutes. It is the continuous partner of the Poisson distribution.</p>`;
      }
      svg.innerHTML = g;
      $(root, '[data-stat="mean"]').textContent = +mu.toFixed(3);
      $(root, '[data-stat="var"]').textContent = +va.toFixed(3);
      $(root, '[data-stat="shape"]').textContent = shape;
      out.innerHTML = html;
    }
    svg.addEventListener("click", (e) => { const r = e.target.closest("[data-k]"); if (!r) return; v.k = +r.dataset.k; const el = $(pBar, '[data-p="k"]'); if (el) el.value = v.k; render(); });
    press(tabs, tabs[0]); build();
  })();

  /* ------------------------------------------------------------
     5. Choosing a distribution
  ------------------------------------------------------------ */
  (function chooser() {
    const root = document.getElementById("viz-choose");
    if (!root) return;
    const scen = $(root, "[data-scen]"), qa = $(root, "[data-qa]");
    const Q = {
      q1: { q: "Is the outcome a count or yes/no, or a measurement or duration?", a: [["A count or yes/no", "q2"], ["A measurement or duration", "q3"]] },
      q2: { q: "How is it counted?", a: [["One yes/no trial", "bern"], ["Successes in a fixed number of trials", "binom"], ["Events in a window of time or space", "pois"]] },
      q3: { q: "Is it the time until the next event?", a: [["Yes", "expo"], ["No", "q4"]] },
      q4: { q: "Is every value in a range equally likely?", a: [["Yes", "unif"], ["No", "q5"]] },
      q5: { q: "Does it naturally cluster around a center?", a: [["Yes, roughly symmetric", "norm"], ["No, it's skewed", "skew"]] },
    };
    const RES = {
      bern: ["Bernoulli", "A single trial with two outcomes, success with probability p. It is the building block of the binomial."],
      binom: ["Binomial", "Counts successes in n independent trials with the same success probability p. Mean np, variance np(1 − p)."],
      pois: ["Poisson", "Counts events in a fixed interval at an average rate λ. Mean and variance both λ."],
      expo: ["Exponential", "Waiting time until the next event when events occur at rate λ. The continuous partner of the Poisson."],
      unif: ["Uniform", "Every value between a and b is equally likely: a flat density."],
      norm: ["Normal", "Continuous data clustering symmetrically around a mean. The strong default for natural measurements."],
      skew: ["A skewed distribution", "Consider a skewed model such as the log-normal, or transform the data. If you are studying averages of large samples, the central limit theorem makes the normal work anyway."],
    };
    const SC = [
      ["Will this customer churn?", ["q1:0", "q2:0"]],
      ["Defective items in a batch of 50", ["q1:0", "q2:1"]],
      ["Calls to a help desk per hour", ["q1:0", "q2:2"]],
      ["Minutes until the next customer arrives", ["q1:1", "q3:0"]],
      ["A random number between 0 and 1", ["q1:1", "q3:1", "q4:0"]],
      ["Adult heights", ["q1:1", "q3:1", "q4:1", "q5:0"]],
    ];
    let path = [];
    function render() {
      let node = "q1", html = "";
      path.forEach(([qid, ai]) => {
        const q = Q[qid];
        html += `<div class="viz-out" style="margin:0 0 .5rem"><p style="margin:0 0 .4rem"><b>${q.q}</b></p><div class="controls" style="margin:0">${q.a.map(([t], i) => `<button class="btn" aria-pressed="${i === ai}" data-q="${qid}" data-i="${i}">${t}</button>`).join("")}</div></div>`;
        node = q.a[ai][1];
      });
      if (Q[node]) {
        const q = Q[node];
        html += `<div class="viz-out" style="margin:0 0 .5rem"><p style="margin:0 0 .4rem"><b>${q.q}</b></p><div class="controls" style="margin:0">${q.a.map(([t], i) => `<button class="btn" aria-pressed="false" data-q="${node}" data-i="${i}">${t}</button>`).join("")}</div></div>`;
      } else {
        const [n, d] = RES[node];
        html += `<div class="definition" style="margin:.25rem 0 0"><strong>${n}</strong>${d}</div><div class="controls" style="margin-top:.75rem"><button class="btn ghost" data-restart>Start over</button></div>`;
      }
      qa.innerHTML = html;
    }
    qa.addEventListener("click", (e) => {
      if (e.target.closest("[data-restart]")) { path = []; $$(scen, "button").forEach((b) => b.setAttribute("aria-pressed", "false")); render(); return; }
      const b = e.target.closest("[data-q]"); if (!b) return;
      const idx = path.findIndex(([q]) => q === b.dataset.q);
      path = idx >= 0 ? path.slice(0, idx) : path;
      path.push([b.dataset.q, +b.dataset.i]);
      $$(scen, "button").forEach((x) => x.setAttribute("aria-pressed", "false"));
      render();
    });
    scen.innerHTML = SC.map(([t], i) => `<button class="btn" aria-pressed="false" data-s="${i}">${t}</button>`).join("");
    $$(scen, "button").forEach((b) => b.addEventListener("click", () => { path = SC[+b.dataset.s][1].map((s) => { const [q, i] = s.split(":"); return [q, +i]; }); press($$(scen, "button"), b); render(); }));
    render();
  })();

  /* ------------------------------------------------------------
     6. Limits between distributions
  ------------------------------------------------------------ */
  (function limit() {
    const root = document.getElementById("viz-limit");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), mBtns = $$(root, "[data-lm]"), inp = $(root, '[data-in="v"]'), lab = $(root, "[data-lab]"), leg = $(root, "[data-legend]");
    let mode = "bp";
    function setup() {
      if (mode === "bp") { Object.assign(inp, { min: 5, max: 200, step: 1 }); inp.value = 8; lab.textContent = "Trials n (with λ = np = 4)"; leg.innerHTML = '<span><i style="background:#9fd5ce"></i>Binomial(n, 4/n)</span><span><i style="background:#6b5fd3"></i>Poisson(4)</span>'; }
      else { Object.assign(inp, { min: 1, max: 60, step: 1 }); inp.value = 3; lab.textContent = "Rate λ"; leg.innerHTML = '<span><i style="background:#9fd5ce"></i>Poisson(λ)</span><span><i style="background:#6b5fd3"></i>Normal(μ = λ, σ² = λ)</span>'; }
    }
    function render() {
      const val = +inp.value;
      $(root, '[data-out="v"]').textContent = val;
      const W = 640, H = 260, L = 50, Rt = 18, T = 20, B = 36;
      let g = "", ks, A, Bv;
      if (mode === "bp") { ks = Array.from({ length: 15 }, (_, k) => k); A = ks.map((k) => binom(val, k, 4 / val)); Bv = ks.map((k) => pois(4, k)); }
      else { const lo = Math.max(0, Math.floor(val - 4 * Math.sqrt(val))), hi = Math.ceil(val + 4 * Math.sqrt(val)) + 1; ks = []; for (let k = lo; k <= hi; k++) ks.push(k); A = ks.map((k) => pois(val, k)); Bv = ks.map((k) => npdf(k, val, Math.sqrt(val))); }
      const ym = Math.max(...A, ...Bv) * 1.15, [fr, Y] = frame(W, H, L, Rt, T, B, ym, niceStep(ym), (t) => +t.toFixed(3)); g += fr;
      const bw = (W - L - Rt) / ks.length, X = (i) => L + bw * (i + 0.5);
      ks.forEach((k, i) => { g += `<rect x="${X(i) - bw * 0.38}" y="${Y(A[i])}" width="${bw * 0.76}" height="${Y(0) - Y(A[i])}" rx="3" fill="${C.light}"/>`; if (ks.length <= 25 || i % 5 === 0) g += txt(X(i), H - 20, k, { anchor: "middle", fill: C.ink, size: 10 }); });
      if (mode === "bp") ks.forEach((k, i) => (g += `<circle cx="${X(i)}" cy="${Y(Bv[i])}" r="4.5" fill="${C.violet}"/>`));
      else { const pts = []; for (let t = 0; t <= (ks.length - 1) * 10; t++) { const x = ks[0] + t / 10; pts.push(`${X(t / 10)},${Y(npdf(x, val, Math.sqrt(val)))}`); } g += `<polyline points="${pts.join(" ")}" fill="none" stroke="${C.violet}" stroke-width="2.5"/>`; }
      g += txt((W + L) / 2, H - 4, "k", { anchor: "middle" });
      svg.innerHTML = g;
      const diff = Math.max(...A.map((a, i) => Math.abs(a - Bv[i])));
      out.innerHTML = mode === "bp"
        ? `<p>With n = ${val} and p = ${(4 / val).toFixed(3)}, the largest gap between the two distributions is <b>${diff.toFixed(3)}</b>. ${val < 20 ? "They differ noticeably while n is small." : "As n grows and p shrinks with np fixed, the binomial becomes the Poisson: many trials, each with a rare success."}</p>`
        : `<p>With λ = ${val}, the largest gap between the Poisson and the normal curve is <b>${diff.toFixed(3)}</b>. ${val < 10 ? "For small λ the Poisson is clearly right-skewed." : "For large λ the Poisson becomes symmetric and bell-shaped, matching a normal with mean and variance λ."}</p>`;
    }
    mBtns.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.lm; press(mBtns, b); setup(); render(); }));
    inp.addEventListener("input", render);
    setup(); render();
  })();

  /* ------------------------------------------------------------
     7. CLT simulator
  ------------------------------------------------------------ */
  (function clt() {
    const root = document.getElementById("viz-clt");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), pBtns = $$(root, "[data-pop]"), nIn = $(root, '[data-in="n"]');
    const POP = {
      exp: { lo: 0, hi: 40, mu: 10, sd: 10, draw: () => -10 * Math.log(1 - R()), name: "waiting times (skewed right)" },
      unif: { lo: 0, hi: 10, mu: 5, sd: 10 / Math.sqrt(12), draw: () => R() * 10, name: "a uniform population" },
      bim: { lo: 0, hi: 12, mu: 6, sd: Math.sqrt(10), draw: () => (R() < 0.5 ? 3 : 9) + gauss(), name: "a population with two peaks" },
      die: { lo: 0.5, hi: 6.5, mu: 3.5, sd: Math.sqrt(35 / 12), draw: () => 1 + Math.floor(R() * 6), name: "die rolls (flat, discrete)" },
    };
    let pop = "exp", means = [];
    const popHist = {};
    Object.entries(POP).forEach(([k, p]) => { const bins = 30, c = new Array(bins).fill(0), w = (p.hi - p.lo) / bins; for (let i = 0; i < 20000; i++) { const x = p.draw(); const b = Math.floor((x - p.lo) / w); if (b >= 0 && b < bins) c[b]++; } popHist[k] = c; });

    function render() {
      const p = POP[pop], n = +nIn.value, se = p.sd / Math.sqrt(n);
      $(root, '[data-out="n"]').textContent = n;
      const H = 260, T = 26, B = 36;
      let g = "";
      // population
      const L1 = 16, R1 = 226, c = popHist[pop], cm = Math.max(...c), bw1 = (R1 - L1) / c.length;
      g += txt(L1, 16, "Population", { fill: C.ink, bold: 1 });
      c.forEach((v, i) => (g += `<rect x="${L1 + i * bw1}" y="${H - B - (v / cm) * (H - T - B)}" width="${bw1 - 1}" height="${(v / cm) * (H - T - B)}" fill="${C.light}"/>`));
      g += `<line x1="${L1}" x2="${R1}" y1="${H - B}" y2="${H - B}" stroke="${C.line}"/>` + txt(L1, H - B + 16, +p.lo.toFixed(1), { size: 10 }) + txt(R1, H - B + 16, p.hi, { anchor: "end", size: 10 });
      const Xp = (x) => L1 + ((x - p.lo) / (p.hi - p.lo)) * (R1 - L1);
      g += `<line x1="${Xp(p.mu)}" x2="${Xp(p.mu)}" y1="${T}" y2="${H - B}" stroke="${C.ink}" stroke-dasharray="4 3"/>` + txt(Xp(p.mu) + 3, T + 8, "μ", { fill: C.ink, bold: 1 });
      // sample means
      const L2 = 262, R2 = 626, bins = 60, w = (p.hi - p.lo) / bins, X = (x) => L2 + ((x - p.lo) / (p.hi - p.lo)) * (R2 - L2);
      const cnt = new Array(bins).fill(0); means.forEach((m) => { const b = Math.floor((m - p.lo) / w); if (b >= 0 && b < bins) cnt[b]++; });
      const expPeak = means.length * w * npdf(p.mu, p.mu, se);
      const ym = Math.max(...cnt, expPeak, 5) * 1.1, Y = (v) => T + (1 - v / ym) * (H - T - B);
      g += txt(L2, 16, `Distribution of sample means (n = ${n})`, { fill: C.ink, bold: 1 });
      cnt.forEach((v, i) => v && (g += `<rect x="${X(p.lo + i * w)}" y="${Y(v)}" width="${Math.max(1, X(p.lo + w) - X(p.lo) - 0.5)}" height="${Y(0) - Y(v)}" fill="${C.accent}"/>`));
      if (means.length >= 50) { const pts = []; for (let i = 0; i <= 300; i++) { const x = p.lo + ((p.hi - p.lo) * i) / 300; pts.push(`${X(x)},${Y(means.length * w * npdf(x, p.mu, se))}`); } g += `<polyline points="${pts.join(" ")}" fill="none" stroke="${C.violet}" stroke-width="2.2"/>`; }
      g += `<line x1="${L2}" x2="${R2}" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.line}"/>`;
      for (let i = 0; i <= 4; i++) { const x = p.lo + ((p.hi - p.lo) * i) / 4; g += txt(X(x), H - B + 16, +x.toFixed(1), { anchor: "middle", size: 10 }); }
      if (!means.length) g += txt((L2 + R2) / 2, H / 2, "Draw samples to build this histogram", { anchor: "middle", size: 12 });
      svg.innerHTML = g;
      $(root, "[data-mu]").textContent = +p.mu.toFixed(2);
      $(root, "[data-se]").textContent = se.toFixed(2);
      $(root, '[data-stat="k"]').textContent = means.length.toLocaleString("en-IN");
      $(root, '[data-stat="mm"]').textContent = means.length ? mean(means).toFixed(2) : "–";
      $(root, '[data-stat="sm"]').textContent = means.length > 1 ? sdev(means).toFixed(2) : "–";
      out.innerHTML = `<p>The population is ${p.name}. ${n === 1 ? "With n = 1 each \"mean\" is just one value, so the histogram copies the population's shape." : n < 10 ? "With small samples the means still carry some of the population's shape." : n >= 30 ? "With n ≥ 30, the sample means form a clear bell curve centered on μ, even though the population isn't normal." : "The means are already bunching into a bell shape around μ."} Their spread matches σ/√n = ${se.toFixed(2)}: quadruple n to halve it.</p>`;
    }
    pBtns.forEach((b) => b.addEventListener("click", () => { pop = b.dataset.pop; press(pBtns, b); means = []; render(); }));
    nIn.addEventListener("input", () => { means = []; render(); });
    $$(root, "[data-draw]").forEach((b) => b.addEventListener("click", () => { const p = POP[pop], n = +nIn.value; for (let k = 0; k < +b.dataset.draw; k++) { let s = 0; for (let i = 0; i < n; i++) s += p.draw(); means.push(s / n); } render(); }));
    render();
  })();

  /* ------------------------------------------------------------
     8. Standard error example
  ------------------------------------------------------------ */
  (function se() {
    const root = document.getElementById("viz-se");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), nIn = $(root, '[data-in="n"]'), cIn = $(root, '[data-in="c"]');
    function render() {
      const n = +nIn.value, c = +cIn.value, mu = 70, sg = 10, s = sg / Math.sqrt(n);
      $(root, '[data-out="n"]').textContent = n;
      $(root, '[data-out="c"]').textContent = c;
      const W = 640, H = 230, L = 20, Rt = 20, T = 20, B = 34;
      const X = (x) => L + ((x - 40) / 60) * (W - L - Rt), ym = npdf(mu, mu, s) * 1.1, Y = (v) => T + (1 - v / ym) * (H - T - B);
      const xs = []; for (let x = 40; x <= 100; x += 0.1) xs.push(x);
      let g = "";
      const sh = xs.filter((x) => x >= c);
      g += `<path d="M${X(c)},${Y(0)} ${sh.map((x) => `L${X(x)},${Y(npdf(x, mu, s))}`).join(" ")} L${X(100)},${Y(0)} Z" fill="${C.rose}" opacity=".35"/>`;
      g += `<path d="${xs.map((x, i) => `${i ? "L" : "M"}${X(x)},${Y(npdf(x, mu, sg))}`).join(" ")}" fill="none" stroke="${C.soft}" stroke-width="2" stroke-dasharray="5 4"/>`;
      g += `<path d="${xs.map((x, i) => `${i ? "L" : "M"}${X(x)},${Y(npdf(x, mu, s))}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/>`;
      g += `<line x1="${X(c)}" x2="${X(c)}" y1="${T}" y2="${Y(0)}" stroke="${C.rose}" stroke-width="2"/>` + txt(X(c) + 4, T + 10, "cut-off " + c, { fill: C.rose, bold: 1 });
      g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.line}"/>`;
      for (let x = 40; x <= 100; x += 10) g += txt(X(x), H - 16, x, { anchor: "middle", fill: C.ink });
      g += `<line x1="${L + 10}" x2="${L + 34}" y1="${T + 2}" y2="${T + 2}" stroke="${C.accent}" stroke-width="2.5"/>` + txt(L + 40, T + 6, "Sample means (σ/√n)") + `<line x1="${L + 170}" x2="${L + 194}" y1="${T + 2}" y2="${T + 2}" stroke="${C.soft}" stroke-width="2" stroke-dasharray="5 4"/>` + txt(L + 200, T + 6, "Individuals (σ = 10)");
      svg.innerHTML = g;
      const z = (c - mu) / s, pm = 1 - Phi(z), pi = 1 - Phi((c - mu) / sg);
      out.innerHTML = `<div class="formula">σ<sub>X̄</sub> = 10 ÷ √${n} = ${s.toFixed(2)} &nbsp;·&nbsp; z = (${c} − 70) ÷ ${s.toFixed(2)} = ${z.toFixed(2)} &nbsp;·&nbsp; P(X̄ > ${c}) = <b>${pm < 0.0005 ? "< 0.001" : pm.toFixed(3)}</b></div><p>One individual above ${c} has probability ${pi.toFixed(3)}, but the average of ${n} being above ${c} has probability ${pm < 0.0005 ? "below 0.001" : pm.toFixed(3)}. Averages vary far less than individuals, which is why larger samples give more precise estimates.${n === 36 ? " With n = 36 the standard error is the slide's 1.67." : ""}</p>`;
    }
    [nIn, cIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();
})();
