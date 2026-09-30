// Session 09 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", rose: "#d94f70", amber: "#d98a0b" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const gauss = (r) => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const cov = (x, y) => { const mx = mean(x), my = mean(y); return x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / (x.length - 1); };
  const sd = (a) => Math.sqrt(cov(a, a));
  const pear = (x, y) => cov(x, y) / (sd(x) * sd(y));
  const fit = (x, y) => { const b = cov(x, y) / cov(x, x); return [mean(y) - b * mean(x), b]; };
  const ranks = (a) => { const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]); const r = new Array(a.length); let i = 0; while (i < idx.length) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r; };
  const quant = (a, p) => { const s = [...a].sort((x, y) => x - y), i = (s.length - 1) * p, lo = Math.floor(i); return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo); };
  const median = (a) => quant(a, 0.5);
  const band = (r) => { const a = Math.abs(r); if (a > 0.995) return r > 0 ? "Perfect positive" : "Perfect negative"; if (a >= 0.7) return (r > 0 ? "Strong positive" : "Strong negative"); if (a >= 0.3) return (r > 0 ? "Moderate positive" : "Moderate negative"); if (a >= 0.1) return (r > 0 ? "Weak positive" : "Weak negative"); return "No correlation"; };

  function axes(W, H, L, Rt, T, B, xr, yr, xs, ys, xl, yl) {
    const X = (v) => L + ((v - xr[0]) / (xr[1] - xr[0])) * (W - L - Rt), Y = (v) => T + (1 - (v - yr[0]) / (yr[1] - yr[0])) * (H - T - B);
    let g = "";
    for (let v = yr[0]; v <= yr[1] + 1e-9; v += ys) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, +v.toFixed(2), { anchor: "end" });
    for (let v = xr[0]; v <= xr[1] + 1e-9; v += xs) g += txt(X(v), H - B + 16, +v.toFixed(2), { anchor: "middle" });
    if (xl) g += txt((W + L) / 2, H - 3, xl, { anchor: "middle" });
    if (yl) g += txt(L - 40, T - 10, yl);
    return [g, X, Y];
  }

  function draggable(svg, onMove) {
    let drag = null;
    const pt = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    svg.addEventListener("pointerdown", (e) => { const c = e.target.closest("[data-drag]"); if (!c) return; drag = +c.dataset.drag; svg.setPointerCapture(e.pointerId); e.preventDefault(); });
    svg.addEventListener("pointermove", (e) => { if (drag === null) return; const p = pt(e); onMove(drag, p.x, p.y); });
    const end = () => (drag = null);
    svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
  }

  /* 1. Dial a correlation */
  (function dial() {
    const root = document.getElementById("viz-r");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), rIn = $(root, '[data-in="r"]'), lineBtn = $(root, "[data-line]");
    const r0 = rng(5); let zx = Array.from({ length: 60 }, () => gauss(r0)), ze = Array.from({ length: 60 }, () => gauss(r0));
    const std = (a) => { const m = mean(a), s = Math.sqrt(a.reduce((t, v) => t + (v - m) ** 2, 0) / a.length); return a.map((v) => (v - m) / s); };
    zx = std(zx); ze = std(ze); const b = ze.reduce((s, v, i) => s + v * zx[i], 0) / zx.length; ze = std(ze.map((v, i) => v - b * zx[i]));
    let line = true;
    function render() {
      const r = +rIn.value / 100;
      $(root, '[data-out="r"]').textContent = r.toFixed(2);
      const ys = zx.map((x, i) => r * x + Math.sqrt(Math.max(0, 1 - r * r)) * ze[i]);
      const [g0, X, Y] = axes(640, 300, 40, 16, 16, 30, [-3, 3], [-3, 3], 1, 1);
      let g = g0;
      if (line) g += `<line x1="${X(-3)}" y1="${Y(-3 * r)}" x2="${X(3)}" y2="${Y(3 * r)}" stroke="${C.violet}" stroke-width="2.5" stroke-dasharray="7 4"/>`;
      zx.forEach((x, i) => (g += `<circle cx="${X(Math.max(-3, Math.min(3, x)))}" cy="${Y(Math.max(-3, Math.min(3, ys[i])))}" r="5.5" fill="${C.accent}" fill-opacity=".75" stroke="#fff"/>`));
      svg.innerHTML = g;
      out.innerHTML = `<p><b>r = ${r.toFixed(2)}: ${band(r)}.</b> ${Math.abs(r) > 0.995 ? "Every point sits exactly on a straight line." : Math.abs(r) < 0.1 ? "The points form a shapeless cloud: knowing X tells you nothing about Y." : `Points ${r > 0 ? "rise" : "fall"} from left to right${Math.abs(r) >= 0.7 ? ", tightly around the line" : Math.abs(r) >= 0.3 ? ", with plenty of scatter around the line" : ", but only just"}.`}</p>`;
    }
    rIn.addEventListener("input", render);
    lineBtn.addEventListener("click", () => { line = !line; lineBtn.setAttribute("aria-pressed", String(line)); render(); });
    $$(root, "[data-ex]").forEach((b) => b.addEventListener("click", () => { rIn.value = Math.round(+b.dataset.ex * 100); render(); }));
    render();
  })();

  /* 2. Covariance rectangles */
  (function covViz() {
    const root = document.getElementById("viz-cov");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), dBtns = $$(root, "[data-ds]"), uBtn = $(root, "[data-unit]");
    const DS = { ex: { pts: [[2, 40], [3, 50], [5, 80]], xr: [0, 7], yr: [20, 100], xs: 1, ys: 20 }, more: { pts: [[1, 35], [2, 42], [3, 48], [4, 44], [5, 60], [6, 66], [7, 61], [8, 78]], xr: [0, 9], yr: [20, 100], xs: 1, ys: 20 } };
    let ds = "ex", pts = DS.ex.pts.map((p) => [...p]), rupee = false, geo;
    function render() {
      const d = DS[ds], xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1] * (rupee ? 1000 : 1));
      const mx = mean(xs), my = mean(pts.map((p) => p[1]));
      const [g0, X, Y] = axes(640, 300, 50, 16, 20, 34, d.xr, d.yr, d.xs, d.ys, "Advertising (₹1000)", rupee ? "Sales (₹1000s shown)" : "Sales (₹1000)");
      geo = { X, Y, d };
      let g = g0;
      pts.forEach(([x, y]) => { const pos = (x - mx) * (y - my) >= 0; g += `<rect x="${Math.min(X(x), X(mx))}" y="${Math.min(Y(y), Y(my))}" width="${Math.abs(X(x) - X(mx))}" height="${Math.abs(Y(y) - Y(my))}" fill="${pos ? C.accent : C.rose}" opacity=".18" stroke="${pos ? C.accent : C.rose}" stroke-opacity=".6"/>`; });
      g += `<line x1="${X(mx)}" x2="${X(mx)}" y1="20" y2="${300 - 34}" stroke="${C.ink}" stroke-dasharray="4 3"/><line x1="50" x2="624" y1="${Y(my)}" y2="${Y(my)}" stroke="${C.ink}" stroke-dasharray="4 3"/>`;
      g += txt(X(mx) + 4, 30, "x̄ = " + mx.toFixed(2), { fill: C.ink, bold: 1 }) + txt(620, Y(my) - 6, "ȳ = " + my.toFixed(2), { fill: C.ink, bold: 1, anchor: "end" });
      pts.forEach(([x, y], i) => (g += `<circle data-drag="${i}" cx="${X(x)}" cy="${Y(y)}" r="9" fill="${C.violet}" stroke="#fff" stroke-width="2" style="cursor:grab"/>`));
      svg.innerHTML = g;
      const c = cov(xs, ys), r = pear(xs, ys);
      $(root, '[data-stat="cov"]').textContent = c.toLocaleString("en-IN", { maximumFractionDigits: 2 });
      $(root, '[data-stat="sx"]').textContent = sd(xs).toFixed(2);
      $(root, '[data-stat="sy"]').textContent = sd(ys).toLocaleString("en-IN", { maximumFractionDigits: 2 });
      $(root, '[data-stat="r"]').textContent = r.toFixed(3);
      const prods = pts.map(([x, y]) => (x - mx) * (y * (rupee ? 1000 : 1) - my * (rupee ? 1000 : 1)));
      out.innerHTML = `<div class="formula">Cov = (${prods.map((p) => p.toLocaleString("en-IN", { maximumFractionDigits: 2 })).join(" + ")}) ÷ ${pts.length - 1} = ${c.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div><p>${rupee ? `Measuring sales in rupees multiplies the covariance by 1,000, yet the relationship hasn't changed at all: r is still ${r.toFixed(3)}. That is why covariance's size is hard to interpret and correlation is preferred for strength.` : c > 0 ? "Teal areas outweigh rose ones, so the covariance is positive: more advertising goes with more sales." : c < 0 ? "Rose areas outweigh teal ones, so the covariance is negative." : "Teal and rose areas cancel out."} r = Cov ÷ (σ<sub>X</sub> σ<sub>Y</sub>) = ${r.toFixed(3)}.</p>`;
    }
    draggable(svg, (i, px, py) => {
      const { X, Y, d } = geo;
      const x = d.xr[0] + ((px - 50) / (624 - 50)) * (d.xr[1] - d.xr[0]), y = d.yr[0] + (1 - (py - 20) / (300 - 20 - 34)) * (d.yr[1] - d.yr[0]);
      pts[i] = [Math.round(Math.max(d.xr[0], Math.min(d.xr[1], x)) * 10) / 10, Math.round(Math.max(d.yr[0], Math.min(d.yr[1], y)))];
      render();
    });
    dBtns.forEach((b) => b.addEventListener("click", () => { ds = b.dataset.ds; press(dBtns, b); pts = DS[ds].pts.map((p) => [...p]); render(); }));
    uBtn.addEventListener("click", () => { rupee = !rupee; uBtn.setAttribute("aria-pressed", String(rupee)); render(); });
    render();
  })();

  /* 3. Drag an outlier */
  (function dragOut() {
    const root = document.getElementById("viz-drag");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out");
    const r = rng(12), base = Array.from({ length: 20 }, () => { const h = 20 + r() * 60; return [h, 40 + 1.4 * h + gauss(r) * 9]; });
    const P = { in: [70, 140], off: [45, 190], lever: [95, 60] };
    let o = [...P.in];
    const xr = [10, 100], yr = [20, 200];
    const W = 640, H = 300, L = 50, Rt = 16, T = 20, B = 34;
    function render() {
      const [g0, X, Y] = axes(W, H, L, Rt, T, B, xr, yr, 10, 20, "Machine hours", "Output (units)");
      let g = g0;
      const bx = base.map((p) => p[0]), by = base.map((p) => p[1]), ax = [...bx, o[0]], ay = [...by, o[1]];
      const [a0, b0] = fit(bx, by), [a1, b1] = fit(ax, ay);
      g += `<line x1="${X(xr[0])}" y1="${Y(a0 + b0 * xr[0])}" x2="${X(xr[1])}" y2="${Y(a0 + b0 * xr[1])}" stroke="${C.soft}" stroke-width="2" stroke-dasharray="6 4"/>`;
      g += `<line x1="${X(xr[0])}" y1="${Y(Math.max(yr[0] - 40, Math.min(yr[1] + 40, a1 + b1 * xr[0])))}" x2="${X(xr[1])}" y2="${Y(Math.max(yr[0] - 40, Math.min(yr[1] + 40, a1 + b1 * xr[1])))}" stroke="${C.amber}" stroke-width="2.5"/>`;
      base.forEach(([x, y]) => (g += `<circle cx="${X(x)}" cy="${Y(y)}" r="5.5" fill="${C.accent}" fill-opacity=".75" stroke="#fff"/>`));
      g += `<circle data-drag="0" cx="${X(o[0])}" cy="${Y(o[1])}" r="11" fill="${C.amber}" stroke="${C.ink}" stroke-width="2" style="cursor:grab"/>`;
      svg.innerHTML = g;
      const rr0 = pear(bx, by), rr1 = pear(ax, ay);
      $(root, '[data-stat="r0"]').textContent = rr0.toFixed(3);
      $(root, '[data-stat="r1"]').textContent = rr1.toFixed(3);
      const d = rr1 - rr0;
      out.innerHTML = `<p>${Math.abs(d) < 0.03 ? "The point fits the pattern, so r barely changes." : `One point out of 21 moves r from ${rr0.toFixed(2)} to ${rr1.toFixed(2)}${rr1 < 0 && rr0 > 0 ? ", even flipping its sign" : ""}. The orange trend line tilts toward it.`} Points far from the others in the X direction have the most pull (high leverage).</p>`;
    }
    draggable(svg, (i, px, py) => {
      o = [Math.max(xr[0], Math.min(xr[1], xr[0] + ((px - L) / (W - L - Rt)) * (xr[1] - xr[0]))), Math.max(yr[0], Math.min(yr[1], yr[0] + (1 - (py - T) / (H - T - B)) * (yr[1] - yr[0])))];
      render();
    });
    $$(root, "[data-pos]").forEach((b) => b.addEventListener("click", () => { o = [...P[b.dataset.pos]]; render(); }));
    render();
  })();

  /* 4. Pearson vs Spearman */
  (function spear() {
    const root = document.getElementById("viz-spear");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), dBtns = $$(root, "[data-d]"), rBtn = $(root, "[data-ranks]");
    const r = rng(33), n = 15;
    const lin = Array.from({ length: n }, (_, i) => { const x = i + 1; return [x, 5 + 2 * x + gauss(r) * 2.5]; });
    const curve = Array.from({ length: n }, (_, i) => { const x = i + 1; return [x, Math.exp(x / 3.2) + x * 0.1]; });
    const outl = lin.map((p) => [...p]); outl[n - 1] = [n, -12];
    const D = { lin: [lin, "Linear"], curve: [curve, "Curved"], out: [outl, "Outlier"] };
    let d = "lin", rk = false;
    const TXT = {
      lin: "For a straight-line relationship, both measures agree closely.",
      curve: "The relationship always rises but bends upward. Spearman gives a perfect 1 because the ranks match exactly; Pearson is lower because the points don't lie on a straight line.",
      out: "One extreme value drags Pearson's r down sharply. Spearman only sees that point's rank, so it is much less affected.",
    };
    function render() {
      const pts = D[d][0], xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const rx = ranks(xs), ry = ranks(ys);
      const px = rk ? rx : xs, py = rk ? ry : ys;
      const ymin = Math.min(...py), ymax = Math.max(...py), pad = (ymax - ymin) * 0.1 || 1;
      const raw = (ymax - ymin + 2 * pad) / 5, p10 = Math.pow(10, Math.floor(Math.log10(raw))), ys2 = [1, 2, 5, 10].map((k) => k * p10).find((k) => k >= raw);
      const y0 = Math.floor((ymin - pad) / ys2) * ys2, y1 = Math.ceil((ymax + pad) / ys2) * ys2;
      const [g0, X, Y] = axes(640, 280, 50, 16, 20, 34, [0, 16], [y0, y1], 2, ys2, rk ? "Rank of X" : "X", rk ? "Rank of Y" : "Y");
      let g = g0;
      const [a, b] = fit(px, py);
      g += `<line x1="${X(0.5)}" y1="${Y(a + b * 0.5)}" x2="${X(15.5)}" y2="${Y(a + b * 15.5)}" stroke="${C.violet}" stroke-width="2" stroke-dasharray="6 4"/>`;
      px.forEach((x, i) => (g += `<circle cx="${X(x)}" cy="${Y(py[i])}" r="6" fill="${d === "out" && i === n - 1 ? C.rose : C.accent}" stroke="#fff"/>`));
      svg.innerHTML = g;
      const R = pear(xs, ys), rho = pear(rx, ry);
      $(root, '[data-stat="r"]').textContent = R.toFixed(3);
      $(root, '[data-stat="rho"]').textContent = rho.toFixed(3);
      out.innerHTML = `<p>${TXT[d]}${rk ? " In rank space, Spearman's ρ is just Pearson's r calculated on the ranks." : ""}</p>`;
    }
    dBtns.forEach((b) => b.addEventListener("click", () => { d = b.dataset.d; press(dBtns, b); render(); }));
    rBtn.addEventListener("click", () => { rk = !rk; rBtn.setAttribute("aria-pressed", String(rk)); render(); });
    render();
  })();

  /* 5. Correlation vs causation */
  (function cause() {
    const root = document.getElementById("viz-cause");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), vBtns = $$(root, "[data-v]");
    const r = rng(77);
    const temp = Array.from({ length: 24 }, (_, m) => 26 + 8 * Math.sin(((m % 12) - 3) / 12 * 2 * Math.PI) + gauss(r) * 1.2);
    const ice = temp.map((t) => Math.round(20 + 6 * t + gauss(r) * 12));
    const drown = temp.map((t) => Math.max(0, Math.round(-6 + 0.4 * t + gauss(r) * 1.3)));
    const [ia, ib] = fit(temp, ice), [da, db] = fit(temp, drown);
    const iceR = ice.map((v, i) => v - (ia + ib * temp[i])), drR = drown.map((v, i) => v - (da + db * temp[i]));
    const tmin = Math.min(...temp), tmax = Math.max(...temp);
    const tcol = (t) => { const u = (t - tmin) / (tmax - tmin); return `rgb(${Math.round(58 + u * 159)},${Math.round(141 - u * 62)},${Math.round(222 - u * 110)})`; };
    let v = "raw";
    function render() {
      let g;
      if (v !== "ctrl") {
        const [g0, X, Y] = axes(640, 280, 50, 16, 20, 34, [100, 260], [0, 10], 20, 2, "Ice cream sales (₹000 per month)", "Drownings");
        g = g0;
        ice.forEach((x, i) => (g += `<circle cx="${X(x)}" cy="${Y(drown[i])}" r="7" fill="${v === "temp" ? tcol(temp[i]) : C.accent}" fill-opacity=".85" stroke="#fff"/>`));
        if (v === "temp") g += txt(620, 34, `Blue = cool month (${tmin.toFixed(0)}°C), red = hot month (${tmax.toFixed(0)}°C)`, { anchor: "end", fill: C.ink });
      } else {
        const [g0, X, Y] = axes(640, 280, 50, 16, 20, 34, [-40, 40], [-4, 4], 10, 2, "Ice cream sales not explained by temperature", "Unexplained drownings");
        g = g0;
        iceR.forEach((x, i) => (g += `<circle cx="${X(x)}" cy="${Y(Math.max(-4, Math.min(4, drR[i])))}" r="7" fill="${C.violet}" fill-opacity=".8" stroke="#fff"/>`));
      }
      svg.innerHTML = g;
      const rRaw = pear(ice, drown), rPart = pear(iceR, drR);
      out.innerHTML = v === "raw" ? `<p>Ice cream sales and drownings are strongly correlated: <b>r = ${rRaw.toFixed(2)}</b>. Should the town ban ice cream?</p>`
        : v === "temp" ? `<p>Coloring by temperature reveals the pattern: hot months (red) have both high ice cream sales and more drownings, because more people buy ice cream <i>and</i> go swimming. Temperature is a <b>confounding variable</b>. Ice cream vs. temperature: r = ${pear(temp, ice).toFixed(2)}; drownings vs. temperature: r = ${pear(temp, drown).toFixed(2)}.</p>`
        : `<p>After removing the part of each variable explained by temperature, what's left is essentially unrelated: <b>r = ${rPart.toFixed(2)}</b> (the partial correlation). The original correlation came entirely from the weather.</p>`;
    }
    vBtns.forEach((b) => b.addEventListener("click", () => { v = b.dataset.v; press(vBtns, b); render(); }));
    render();
  })();

  /* 6. Detect and handle outliers */
  (function outliers() {
    const root = document.getElementById("viz-out");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), inp = $(root, "[data-vals]");
    const sBtns = $$(root, "[data-set]"), mBtns = $$(root, "[data-m]"), hBtns = $$(root, "[data-h]");
    const SETS = { h: ["150, 152, 151, 153, 155, 210", "cm"], s: ["1.2, 1.5, 1.8, 1.4, 1.6, 1.3, 1.9, 1.7, 10, 1.5, 1.6, 1.4", "₹ lakh"] };
    let set = "h", m = "iqr", h = "keep";
    inp.value = SETS.h[0];
    const f = (v) => (+v.toFixed(2)).toLocaleString("en-IN");
    function render() {
      const data = inp.value.split(/[\s,;]+/).map(Number).filter((v) => Number.isFinite(v) && inp.value.trim());
      if (data.length < 3) { out.innerHTML = "<p>Enter at least three numbers.</p>"; svg.innerHTML = ""; return; }
      const mu = mean(data), s = sd(data), med = median(data);
      let lo, hi, flag, rule;
      if (m === "iqr") { const q1 = quant(data, 0.25), q3 = quant(data, 0.75), iqr = q3 - q1; lo = q1 - 1.5 * iqr; hi = q3 + 1.5 * iqr; rule = `Q1 = ${f(q1)}, Q3 = ${f(q3)}, IQR = ${f(iqr)}, so the fences are ${f(lo)} and ${f(hi)}.`; }
      else if (m === "z") { lo = mu - 2 * s; hi = mu + 2 * s; rule = `Mean ${f(mu)}, SD ${f(s)}: values beyond ${f(lo)} or ${f(hi)} have |Z| &gt; 2.`; }
      else { const mad = median(data.map((v) => Math.abs(v - med))); const k = (3.5 * mad) / 0.6745; lo = med - k; hi = med + k; rule = `Median ${f(med)}, MAD ${f(mad)}: values beyond ${f(lo)} or ${f(hi)} have |M| &gt; 3.5.`; }
      flag = data.map((v) => v < lo || v > hi);
      let handled = data.map((v, i) => ({ v, o: flag[i], show: true, moved: false }));
      if (h === "remove") handled = handled.map((d) => ({ ...d, show: !d.o }));
      if (h === "cap") handled = handled.map((d) => (d.o ? { ...d, v: d.v > hi ? hi : lo, moved: true } : d));
      const vals = handled.filter((d) => d.show).map((d) => d.v);
      const logMode = h === "log";
      const disp = logMode ? data.map(Math.log) : handled.map((d) => d.v);
      // chart
      const W = 640, L = 30, Rt = 30, all = logMode ? disp : [...data, lo, hi];
      const a = Math.min(...all), b = Math.max(...all), pad = (b - a) * 0.06 || 1, x0 = a - pad, x1 = b + pad;
      const X = (v) => L + ((v - x0) / (x1 - x0)) * (W - L - Rt);
      let g = `<line x1="${L}" x2="${W - Rt}" y1="100" y2="100" stroke="${C.line}" stroke-width="2"/>`;
      if (!logMode) {
        if (lo >= x0) g += `<line x1="${X(lo)}" x2="${X(lo)}" y1="30" y2="110" stroke="${C.rose}" stroke-dasharray="5 3"/>` + txt(X(lo), 24, "lower " + f(lo), { anchor: "middle", fill: C.rose, bold: 1, size: 10 });
        g += `<line x1="${X(hi)}" x2="${X(hi)}" y1="30" y2="110" stroke="${C.rose}" stroke-dasharray="5 3"/>` + txt(X(hi), 24, "upper " + f(hi), { anchor: "middle", fill: C.rose, bold: 1, size: 10 });
      }
      const stack = {};
      (logMode ? data.map((v, i) => ({ v: disp[i], o: flag[i], show: true })) : handled).forEach((d) => {
        if (!d.show) return;
        const k = Math.round(X(d.v) / 10), n = (stack[k] = (stack[k] || 0) + 1);
        g += `<circle cx="${X(d.v)}" cy="${92 - (n - 1) * 13}" r="6" fill="${d.moved ? C.amber : d.o ? C.rose : C.accent}" stroke="#fff"/>`;
      });
      if (h === "remove") handled.filter((d) => !d.show).forEach((d) => (g += `<circle cx="${X(d.v)}" cy="92" r="6" fill="none" stroke="${C.rose}" stroke-dasharray="2 2"/>`));
      g += `<line x1="${X(logMode ? mean(disp) : mean(vals))}" x2="${X(logMode ? mean(disp) : mean(vals))}" y1="112" y2="130" stroke="${C.violet}" stroke-width="3"/>` + txt(X(logMode ? mean(disp) : mean(vals)), 145, "mean", { anchor: "middle", fill: C.violet, bold: 1, size: 10 });
      g += `<line x1="${X(logMode ? median(disp) : median(vals))}" x2="${X(logMode ? median(disp) : median(vals))}" y1="112" y2="130" stroke="${C.accent}" stroke-width="3"/>` + txt(X(logMode ? median(disp) : median(vals)), 160, "median", { anchor: "middle", fill: C.accent, bold: 1, size: 10 });
      if (logMode) g += txt(L, 24, "Values shown on a log scale", { fill: C.ink, bold: 1, size: 10 });
      svg.innerHTML = g;
      const gm = Math.exp(mean(data.map(Math.log)));
      $(root, '[data-stat="mean"]').textContent = logMode ? f(gm) + "*" : f(mean(vals));
      $(root, '[data-stat="med"]').textContent = f(median(vals));
      $(root, '[data-stat="sd"]').textContent = logMode ? f(sd(disp)) + " (log)" : f(sd(vals));
      $(root, '[data-stat="n"]').textContent = flag.filter(Boolean).length;
      const nf = flag.filter(Boolean).length;
      const HT = {
        keep: `Kept as is, the outlier${nf === 1 ? "" : "s"} pull${nf === 1 ? "s" : ""} the mean to ${f(mu)} while the median stays at ${f(med)}.`,
        remove: `Removing ${nf} flagged value${nf === 1 ? "" : "s"} brings the mean to ${f(mean(vals))} and the SD down from ${f(s)} to ${f(sd(vals))}. Only do this for genuine errors.`,
        cap: `Capping replaces extreme values with the fence value (amber), keeping every observation but limiting its pull: mean ${f(mean(vals))}, SD ${f(sd(vals))}.`,
        log: `A log transform compresses large values, so the extreme point sits much closer to the rest. *The mean shown is the back-transformed (geometric) mean, ${f(gm)}.`,
      };
      out.innerHTML = `<p>${rule} <b>${nf ? `${nf} value${nf === 1 ? "" : "s"} flagged` : "Nothing flagged"}.</b>${m === "z" && set === "h" ? " Notice that with a stricter |Z| &gt; 3 rule, 210 would slip through: the outlier inflates the SD it is judged by. The modified Z-score avoids this." : ""}</p><p>${HT[h]}</p>`;
    }
    sBtns.forEach((b) => b.addEventListener("click", () => { set = b.dataset.set; press(sBtns, b); inp.value = SETS[set][0]; render(); }));
    mBtns.forEach((b) => b.addEventListener("click", () => { m = b.dataset.m; press(mBtns, b); render(); }));
    hBtns.forEach((b) => b.addEventListener("click", () => { h = b.dataset.h; press(hBtns, b); render(); }));
    inp.addEventListener("input", render);
    render();
  })();
})();
