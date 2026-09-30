// Session 17 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b", sky: "#3a8dde" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const gauss = (r) => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const quant = (s, p) => s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))];
  const inr = (v) => (v < 0 ? "−₹" : "₹") + Math.abs(Math.round(v)).toLocaleString("en-IN");

  /* 1. Bank teller DES */
  (function bank() {
    const root = document.getElementById("viz-bank");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), kIn = $(root, '[data-in="k"]'), lIn = $(root, '[data-in="lam"]');
    const SVC = 4.5, DAY = 480;
    let seed = 7;
    function simulate(k, lam) {
      const r = rng(seed), arr = []; let t = 0;
      while (true) { t += -Math.log(1 - r()) * (60 / lam); if (t > DAY) break; arr.push(t); }
      const free = new Array(k).fill(0), start = [], end = [];
      arr.forEach((a) => { let j = 0; for (let i = 1; i < k; i++) if (free[i] < free[j]) j = i; const s = Math.max(a, free[j]), d = -Math.log(1 - r()) * SVC; start.push(s); end.push(s + d); free[j] = s + d; });
      const waits = arr.map((a, i) => start[i] - a);
      const q = []; for (let m = 0; m <= DAY; m += 2) q.push(arr.filter((a, i) => a <= m && start[i] > m).length);
      const busy = start.reduce((s, st, i) => s + Math.max(0, Math.min(end[i], DAY) - Math.min(st, DAY)), 0);
      return { n: arr.length, waits, q, util: busy / (k * DAY) };
    }
    function render() {
      const k = +kIn.value, lam = +lIn.value;
      $(root, '[data-out="k"]').textContent = k; $(root, '[data-out="lam"]').textContent = lam;
      const s = simulate(k, lam), rho = (lam * SVC) / (60 * k);
      const W = 640, H = 240, L = 44, Rt = 16, T = 16, B = 36, qm = Math.max(5, ...s.q), X = (m) => L + (m / DAY) * (W - L - Rt), Y = (v) => T + (1 - v / qm) * (H - T - B);
      let g = "";
      const step = qm > 40 ? 10 : qm > 15 ? 5 : 1;
      for (let v = 0; v <= qm; v += step) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
      for (let h = 0; h <= 8; h++) g += txt(X(h * 60), H - 18, (9 + h > 12 ? 9 + h - 12 : 9 + h) + (9 + h >= 12 ? " pm" : " am"), { anchor: "middle", size: 10 });
      g += `<path d="M${X(0)},${Y(0)} ${s.q.map((v, i) => `L${X(i * 2)},${Y(v)}`).join(" ")} L${X(DAY)},${Y(0)} Z" fill="${C.rose}" opacity=".25"/><polyline points="${s.q.map((v, i) => `${X(i * 2)},${Y(v)}`).join(" ")}" fill="none" stroke="${C.rose}" stroke-width="2"/>`;
      g += txt(L - 38, T - 4, "People waiting") + txt((W + L) / 2, H - 2, "Time of day", { anchor: "middle" });
      svg.innerHTML = g;
      const aw = s.waits.length ? mean(s.waits) : 0, p10 = s.waits.length ? s.waits.filter((w) => w > 10).length / s.waits.length : 0;
      $(root, '[data-stat="w"]').textContent = aw.toFixed(1) + " min";
      $(root, '[data-stat="p"]').textContent = Math.round(p10 * 100) + "%";
      $(root, '[data-stat="q"]').textContent = Math.max(...s.q);
      $(root, '[data-stat="u"]').textContent = Math.round(s.util * 100) + "%";
      out.innerHTML = `<p>${s.n} customers arrived; each took ${SVC} minutes to serve on average. ${rho >= 1 ? `<b>The tellers can't keep up:</b> customers arrive faster than ${k} teller${k > 1 ? "s" : ""} can serve them (load ${Math.round(rho * 100)}%), so the queue grows all day.` : aw > 10 ? `The tellers are busy ${Math.round(s.util * 100)}% of the time, and waits are long. Try adding a teller.` : aw < 1 && k > 1 ? `Hardly anyone waits, but tellers are idle ${100 - Math.round(s.util * 100)}% of the time. Could one fewer teller cope?` : "A reasonable balance between waiting time and idle tellers."} Simulation lets the bank test staffing levels without making real customers wait.</p>`;
    }
    [kIn, lIn].forEach((el) => el.addEventListener("input", render));
    $(root, "[data-run]").addEventListener("click", () => { seed = Math.floor(Math.random() * 1e6); render(); });
    render();
  })();

  /* 2. SIR system dynamics */
  (function sir() {
    const root = document.getElementById("viz-sir");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), bIn = $(root, '[data-in="b"]'), dIn = $(root, '[data-in="d"]');
    function render() {
      const beta = +bIn.value / 100, dur = +dIn.value, gam = 1 / dur, N = 100000, days = 180, dt = 0.25;
      $(root, '[data-out="b"]').textContent = beta.toFixed(2); $(root, '[data-out="d"]').textContent = dur;
      let S = N - 10, I = 10, R = 0; const hist = [[S, I, R]];
      for (let t = 0; t < days; t += dt) { const inf = (beta * S * I) / N, rec = gam * I; S -= inf * dt; I += (inf - rec) * dt; R += rec * dt; if (Math.abs(t + dt - Math.round(t + dt)) < 1e-9) hist.push([S, I, R]); }
      const W = 640, H = 250, L = 56, Rt = 16, T = 16, B = 36, X = (d) => L + (d / days) * (W - L - Rt), Y = (v) => T + (1 - v / N) * (H - T - B);
      let g = "";
      for (let v = 0; v <= N; v += 25000) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v.toLocaleString("en-IN"), { anchor: "end", size: 10 });
      for (let d = 0; d <= days; d += 30) g += txt(X(d), H - 18, d, { anchor: "middle" });
      g += txt((W + L) / 2, H - 2, "Day", { anchor: "middle" });
      [[0, C.sky], [1, C.rose], [2, C.accent]].forEach(([k, col]) => (g += `<polyline points="${hist.map((h, d) => `${X(d)},${Y(h[k])}`).join(" ")}" fill="none" stroke="${col}" stroke-width="2.5"/>`));
      const peak = hist.reduce((b, h, d) => (h[1] > b[1] ? [d, h[1]] : b), [0, 0]);
      if (peak[1] > 50) g += `<circle cx="${X(peak[0])}" cy="${Y(peak[1])}" r="5" fill="${C.rose}"/>` + txt(X(peak[0]) + 7, Y(peak[1]) - 6, `peak day ${peak[0]}`, { fill: C.rose, bold: 1 });
      svg.innerHTML = g;
      const R0 = beta * dur, fin = hist[hist.length - 1][2] + hist[hist.length - 1][1];
      out.innerHTML = `<div class="formula">R₀ = β × days infectious = ${beta.toFixed(2)} × ${dur} = ${R0.toFixed(2)}</div><p>${R0 < 1 ? "Each infected person infects fewer than one other on average, so the balancing loop wins and the outbreak fizzles out." : `Each case initially infects ${R0.toFixed(1)} others: the reinforcing loop drives exponential growth until so few people are susceptible that the balancing loop takes over. Infections peak at ${Math.round(peak[1]).toLocaleString("en-IN")} on day ${peak[0]}, and ${Math.round((fin / N) * 100)}% of the city is eventually infected.`} Reducing contacts (lowering β) flattens and delays the peak, which is what system dynamics models help health planners test.</p>`;
    }
    [bIn, dIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* 3. Investment Monte Carlo */
  (function invest() {
    const root = document.getElementById("viz-invest");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), muIn = $(root, '[data-in="mu"]'), sdIn = $(root, '[data-in="sd"]');
    let P = [];
    const r = rng(8);
    function render() {
      const mu = +muIn.value / 100, sd = +sdIn.value / 100;
      $(root, '[data-out="mu"]').textContent = Math.round(mu * 100) + "%"; $(root, '[data-out="sd"]').textContent = Math.round(sd * 100) + "%";
      const lo = 100000 * (mu - 4 * sd), hi = 100000 * (mu + 4 * sd), bins = 60, w = (hi - lo) / bins, cnt = new Array(bins).fill(0);
      const S = [...P].sort((a, b) => a - b), p5 = S.length ? quant(S, 0.05) : null;
      P.forEach((v) => { const b = Math.floor((v - lo) / w); if (b >= 0 && b < bins) cnt[b]++; });
      const W = 640, H = 250, L = 20, Rt = 20, T = 16, B = 40, cm = Math.max(1, ...cnt), X = (v) => L + ((v - lo) / (hi - lo)) * (W - L - Rt), Y = (v) => T + (1 - v / cm) * (H - T - B);
      let g = "";
      cnt.forEach((c, i) => { const x0 = lo + i * w; g += `<rect x="${X(x0) + 0.5}" y="${Y(c)}" width="${Math.max(1, X(x0 + w) - X(x0) - 1)}" height="${Y(0) - Y(c)}" fill="${p5 !== null && x0 + w <= p5 ? C.rose : C.accent}" opacity=".8"/>`; });
      g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.line}"/>`;
      for (let k = -4; k <= 4; k += 2) { const v = 100000 * (mu + k * sd); g += txt(X(v), H - 22, inr(v), { anchor: "middle", size: 10 }); }
      if (lo < 0 && hi > 0) g += `<line x1="${X(0)}" x2="${X(0)}" y1="${T}" y2="${Y(0)}" stroke="${C.ink}" stroke-dasharray="4 3"/>` + txt(X(0) + 4, T + 10, "break-even", { size: 10, fill: C.ink });
      if (p5 !== null) g += `<line x1="${X(p5)}" x2="${X(p5)}" y1="${T}" y2="${Y(0)}" stroke="${C.rose}" stroke-width="2"/>` + txt(X(p5) - 4, T + 24, "5th percentile", { anchor: "end", fill: C.rose, bold: 1, size: 10 });
      g += txt((W + L) / 2, H - 4, "Profit after one year", { anchor: "middle" });
      if (!P.length) g += txt(W / 2, H / 2, "Add simulations to build the distribution", { anchor: "middle", size: 12 });
      svg.innerHTML = g;
      $(root, '[data-stat="n"]').textContent = P.length.toLocaleString("en-IN");
      if (!P.length) { ["mean", "ci", "loss", "var", "cvar"].forEach((k) => ($(root, `[data-stat="${k}"]`).textContent = "–")); out.innerHTML = "<p>Each simulation draws one possible return from Normal(" + Math.round(mu * 100) + "%, " + Math.round(sd * 100) + "%) and computes the profit on ₹1,00,000.</p>"; return; }
      const m = mean(P), p025 = quant(S, 0.025), p975 = quant(S, 0.975), pl = P.filter((v) => v < 0).length / P.length, tail = S.slice(0, Math.max(1, Math.floor(S.length * 0.05))), cv = mean(tail);
      $(root, '[data-stat="mean"]').textContent = inr(m);
      $(root, '[data-stat="ci"]').textContent = `${inr(p025)} to ${inr(p975)}`;
      $(root, '[data-stat="loss"]').textContent = (pl * 100).toFixed(1) + "%";
      $(root, '[data-stat="var"]').textContent = p5 < 0 ? inr(-p5) + " loss" : "No loss";
      $(root, '[data-stat="cvar"]').textContent = cv < 0 ? inr(-cv) + " loss" : inr(cv) + " profit";
      out.innerHTML = `<p>After ${P.length.toLocaleString("en-IN")} simulated years, the average profit is ${inr(m)}, and 95% of outcomes fall between ${inr(p025)} and ${inr(p975)}. ${p5 < 0 ? `<b>VaR (95%):</b> in the worst 5% of years you lose at least ${inr(-p5)}; <b>CVaR:</b> in those bad years the average loss is ${inr(-cv)}.` : `Even the worst 5% of years earn at least ${inr(p5)}, so there's no loss at the 95% level; still, ${cv < 0 ? `a few of those worst years are losses, and on average they lose ${inr(-cv)}` : `those bad years average ${inr(cv)} profit`}.`} ${P.length < 1000 ? "With few runs the histogram is ragged; more runs give more stable estimates." : ""} Raise the volatility to see risk grow while the expected profit stays the same.</p>`;
    }
    $$(root, "[data-add]").forEach((b) => b.addEventListener("click", () => { const n = +b.dataset.add; if (!n) P = []; const mu = +muIn.value / 100, sd = +sdIn.value / 100; for (let i = 0; i < n; i++) P.push(100000 * (mu + sd * gauss(r))); render(); }));
    [muIn, sdIn].forEach((el) => el.addEventListener("input", () => { P = []; render(); }));
    render();
  })();

  /* 4. Startup profit + tornado */
  (function startup() {
    const root = document.getElementById("viz-startup");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out");
    const [pIn, cIn, dIn] = ["up", "uc", "ud"].map((k) => $(root, `[data-in="${k}"]`));
    const r = rng(17), U = Array.from({ length: 20000 }, () => [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1]);
    function render() {
      const up = +pIn.value / 100, uc = +cIn.value / 100, ud = +dIn.value / 100;
      [pIn, cIn, dIn].forEach((el) => ($(root, `[data-out="${el.dataset.in}"]`).textContent = el.value + "%"));
      const prof = (p, c, d) => (p - c) * d;
      const P = U.map(([a, b, c]) => prof(100 * (1 + up * a), 60 * (1 + uc * b), 1000 * (1 + ud * c))).sort((x, y) => x - y);
      const m = mean(P), p5 = quant(P, 0.05), p95 = quant(P, 0.95);
      const lo = Math.min(0, P[0]), hi = Math.max(80000, P[P.length - 1]), bins = 50, w = (hi - lo) / bins, cnt = new Array(bins).fill(0);
      P.forEach((v) => cnt[Math.min(bins - 1, Math.floor((v - lo) / w))]++);
      const W = 640, L = 20, Rt = 20, T = 20, H1 = 170, cm = Math.max(...cnt), X = (v) => L + ((v - lo) / (hi - lo)) * (W - L - Rt), Y = (v) => T + (1 - v / cm) * (H1 - T);
      let g = txt(L, 12, "Distribution of profit (20,000 simulations)", { fill: C.ink, bold: 1 });
      cnt.forEach((c, i) => { const x0 = lo + i * w; g += `<rect x="${X(x0) + 0.5}" y="${Y(c)}" width="${Math.max(1, X(x0 + w) - X(x0) - 1)}" height="${Y(0) - Y(c)}" fill="${x0 + w <= p5 || x0 >= p95 ? C.amber : C.accent}" opacity=".85"/>`; });
      [[p5, "5th"], [m, "mean"], [p95, "95th"]].forEach(([v, l]) => (g += `<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${Y(0)}" stroke="${C.ink}" stroke-dasharray="3 3"/>` + txt(X(v), Y(0) + 14, `${l}: ${inr(v)}`, { anchor: "middle", fill: C.ink, bold: 1, size: 10 })));
      // tornado
      const base = prof(100, 60, 1000);
      const TR = [["Demand", prof(100, 60, 1000 * (1 - ud)), prof(100, 60, 1000 * (1 + ud))], ["Price", prof(100 * (1 - up), 60, 1000), prof(100 * (1 + up), 60, 1000)], ["Cost", prof(100, 60 * (1 + uc), 1000), prof(100, 60 * (1 - uc), 1000)]].sort((a, b) => b[2] - b[1] - (a[2] - a[1]));
      const tT = 210, tlo = Math.min(...TR.map((t) => t[1]), base - 1000), thi = Math.max(...TR.map((t) => t[2]), base + 1000), TX = (v) => 140 + ((v - tlo) / (thi - tlo)) * (W - 140 - 90);
      g += txt(L, tT - 8, "Tornado chart: profit when one input moves to its low or high end", { fill: C.ink, bold: 1 });
      TR.forEach(([n, a, b], i) => { const y = tT + i * 36; g += txt(130, y + 18, n, { anchor: "end", fill: C.ink, bold: 1 }) + `<rect x="${TX(a)}" y="${y + 4}" width="${Math.max(1, TX(base) - TX(a))}" height="22" fill="${C.rose}" opacity=".75"/><rect x="${TX(base)}" y="${y + 4}" width="${Math.max(1, TX(b) - TX(base))}" height="22" fill="${C.accent}" opacity=".75"/>` + txt(TX(a) - 4, y + 19, inr(a), { anchor: "end", size: 9.5 }) + txt(TX(b) + 4, y + 19, inr(b), { size: 9.5 }); });
      g += `<line x1="${TX(base)}" x2="${TX(base)}" y1="${tT}" y2="${tT + 3 * 36}" stroke="${C.ink}"/>` + txt(TX(base), tT + 3 * 36 + 12, "base " + inr(base), { anchor: "middle", size: 10, fill: C.ink });
      svg.innerHTML = g;
      $(root, '[data-stat="mean"]').textContent = inr(m); $(root, '[data-stat="p5"]').textContent = inr(p5); $(root, '[data-stat="p95"]').textContent = inr(p95);
      const loss = P.filter((v) => v < 0).length / P.length;
      out.innerHTML = `<p>There's a 5% chance profit falls below <b>${inr(p5)}</b>, so the startup can plan a safety buffer of that size. <b>${TR[0][0]}</b> is the biggest driver of risk (the widest tornado bar), so better demand forecasts would reduce uncertainty the most. ${loss > 0.001 ? `There's a ${(loss * 100).toFixed(1)}% chance of making a loss.` : ""} Scenario analysis corresponds to the extremes: worst case (low price, high cost, low demand) ${inr(prof(100 * (1 - up), 60 * (1 + uc), 1000 * (1 - ud)))}, best case ${inr(prof(100 * (1 + up), 60 * (1 - uc), 1000 * (1 + ud)))}; simulation shows how unlikely those extremes are.</p>`;
    }
    [pIn, cIn, dIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* 5. LP graphical */
  (function lp() {
    const root = document.getElementById("viz-lp");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), tbl = $(root, "[data-verts]");
    const zIn = $(root, '[data-in="z"]'), c1In = $(root, '[data-in="c1"]'), c2In = $(root, '[data-in="c2"]');
    const V = [[0, 0], [50, 0], [42, 16], [0, 30]];
    function render(from) {
      const c1 = +c1In.value, c2 = +c2In.value;
      const Zs = V.map(([a, b]) => c1 * a + c2 * b), zmax = Math.max(...Zs), bi = Zs.indexOf(zmax);
      zIn.max = Math.ceil(zmax * 1.3);
      if (from !== zIn && from) zIn.value = Math.min(+zIn.value, +zIn.max);
      const z = +zIn.value;
      $(root, '[data-out="z"]').textContent = z; $(root, '[data-out="c1"]').textContent = c1; $(root, '[data-out="c2"]').textContent = c2;
      const W = 640, H = 320, L = 50, Rt = 20, T = 16, B = 40, X = (v) => L + (v / 70) * (W - L - Rt), Y = (v) => T + (1 - v / 50) * (H - T - B);
      let g = "";
      for (let v = 0; v <= 50; v += 10) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
      for (let v = 0; v <= 70; v += 10) g += txt(X(v), H - 22, v, { anchor: "middle" });
      g += txt((W + L) / 2, H - 4, "x₁", { anchor: "middle", bold: 1, fill: C.ink }) + txt(L - 30, T + 4, "x₂", { bold: 1, fill: C.ink });
      g += `<polygon points="${V.map(([a, b]) => `${X(a)},${Y(b)}`).join(" ")}" fill="${C.accent}" opacity=".15"/>`;
      g += `<line x1="${X(0)}" y1="${Y(Math.min(50, 100))}" x2="${X(50)}" y2="${Y(0)}" stroke="none"/>`;
      g += `<line x1="${X(25)}" y1="${Y(50)}" x2="${X(50)}" y2="${Y(0)}" stroke="${C.violet}" stroke-width="2.5"/>` + txt(X(27), Y(46), "2x₁ + x₂ ≤ 100", { fill: C.violet, bold: 1, size: 10.5 });
      g += `<line x1="${X(0)}" y1="${Y(30)}" x2="${X(70)}" y2="${Y(20 / 3)}" stroke="${C.amber}" stroke-width="2.5"/>` + txt(X(62), Y(20 / 3 + 2.6), "x₁ + 3x₂ ≤ 90", { fill: C.amber, bold: 1, size: 10.5, anchor: "middle" });
      const iso = []; for (let x = 0; x <= 70; x += 0.5) { const y = (z - c1 * x) / c2; if (y >= 0 && y <= 50) iso.push(`${X(x)},${Y(y)}`); }
      const touching = z <= zmax + 1e-9;
      if (iso.length > 1) g += `<polyline points="${iso.join(" ")}" fill="none" stroke="${touching ? C.rose : C.soft}" stroke-width="2.5" stroke-dasharray="8 5"/>`;
      V.forEach(([a, b], i) => (g += `<circle cx="${X(a)}" cy="${Y(b)}" r="${i === bi ? 9 : 5.5}" fill="${i === bi ? C.rose : "#fff"}" stroke="${i === bi ? "#fff" : C.ink}" stroke-width="2"/>` + txt(X(a) + 10, Y(b) - 8, `(${a}, ${b})`, { fill: i === bi ? C.rose : C.ink, bold: i === bi, size: 10.5 })));
      g += `<rect x="${X(30) - 5}" y="${Y(20) - 5}" width="10" height="10" fill="${C.amber}" transform="rotate(45 ${X(30)} ${Y(20)})"/>` + txt(X(30) - 8, Y(20) + 4, "slide's (30, 20)", { anchor: "end", fill: C.amber, bold: 1, size: 10 });
      svg.innerHTML = g;
      tbl.innerHTML = `<thead><tr><th>Corner point (x₁, x₂)</th><th>Z = ${c1}x₁ + ${c2}x₂</th></tr></thead><tbody>${V.map(([a, b], i) => `<tr style="${i === bi ? "background:var(--accent-soft);font-weight:700" : ""}"><td>(${a}, ${b})${i === 2 ? " — where both constraints meet" : ""}</td><td>${Zs[i]}${i === bi ? " ← maximum" : ""}</td></tr>`).join("")}<tr><td>Slide's point (30, 20), not a corner</td><td>${c1 * 30 + c2 * 20}</td></tr></tbody>`;
      out.innerHTML = `<p>${z > zmax + 1e-9 ? `No feasible plan reaches Z = ${z}: the iso-profit line has left the region entirely.` : z > zmax - 3 ? `<b>The line is about to leave the region at the corner (${V[bi].join(", ")})</b>, the optimum, with Z = ${zmax}.` : `Every point on the dashed line gives Z = ${z}. Slide it outward to increase Z.`} Corner (42, 16) is where 2x₁ + x₂ = 100 and x₁ + 3x₂ = 90 intersect: substitute x₁ = 90 − 3x₂ into the first to get x₂ = 16, x₁ = 42. ${bi !== 2 ? "With these coefficients the iso-profit line is steep or flat enough that a different corner wins." : "The slide's (30, 20) only reaches Z = " + (c1 * 30 + c2 * 20) + ", because it uses up the second constraint but leaves 20 units of the first unused."}</p>`;
    }
    [zIn, c1In, c2In].forEach((el) => el.addEventListener("input", () => render(el)));
    render();
  })();

  /* 6. Lagrange */
  (function lagrange() {
    const root = document.getElementById("viz-lagrange");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), xIn = $(root, '[data-in="x"]');
    const f = (a, b) => a * a + 3 * b * b;
    function render() {
      const x1 = +xIn.value, x2 = 10 - x1, fv = f(x1, x2);
      $(root, '[data-out="x"]').textContent = x1.toFixed(1);
      const W = 640, H = 300, L = 40, Rt = 20, T = 16, B = 36, X = (v) => L + (v / 12) * (W - L - Rt) * 0.62, Y = (v) => T + (1 - v / 11) * (H - T - B);
      let g = "";
      for (let v = 0; v <= 11; v += 2) g += `<line x1="${X(0)}" x2="${X(12)}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
      for (let v = 0; v <= 12; v += 2) g += txt(X(v), H - 20, v, { anchor: "middle" });
      g += txt(X(6), H - 4, "x₁", { anchor: "middle", bold: 1, fill: C.ink }) + txt(L - 30, T + 4, "x₂", { bold: 1, fill: C.ink });
      const ell = (c, col, w, dash) => { const a = Math.sqrt(c), b = Math.sqrt(c / 3), pts = []; for (let t = 0; t <= Math.PI / 2 + 1e-9; t += Math.PI / 120) { const px = a * Math.cos(t), py = b * Math.sin(t); if (px <= 12 && py <= 11) pts.push(`${X(px)},${Y(py)}`); } return `<polyline points="${pts.join(" ")}" fill="none" stroke="${col}" stroke-width="${w}" ${dash ? 'stroke-dasharray="5 4"' : ""}/>`; };
      [25, 50, 100, 150, 200, 300].forEach((c) => (g += ell(c, C.line, 1.5)));
      g += ell(75, C.accent, 2.5, false) + txt(X(Math.sqrt(75)) - 4, Y(0) - 6, "f = 75", { anchor: "end", fill: C.accent, bold: 1, size: 10 });
      if (Math.abs(fv - 75) > 0.5) g += ell(fv, C.violet, 2, true);
      g += `<line x1="${X(0)}" y1="${Y(10)}" x2="${X(10)}" y2="${Y(0)}" stroke="${C.ink}" stroke-width="2.5"/>` + txt(X(1.2), Y(9.6), "x₁ + x₂ = 10", { fill: C.ink, bold: 1 });
      // gradient arrow of f at point (scaled)
      const gx = 2 * x1, gy = 6 * x2, gl = Math.hypot(gx, gy) || 1, s = 1.6;
      g += `<defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${C.rose}"/></marker><marker id="ar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${C.ink}"/></marker></defs>`;
      g += `<line x1="${X(x1)}" y1="${Y(x2)}" x2="${X(x1 + (gx / gl) * s)}" y2="${Y(x2 + (gy / gl) * s)}" stroke="${C.rose}" stroke-width="3" marker-end="url(#ar)"/>`;
      g += `<line x1="${X(x1)}" y1="${Y(x2)}" x2="${X(x1 + s / Math.SQRT2)}" y2="${Y(x2 + s / Math.SQRT2)}" stroke="${C.ink}" stroke-width="2" stroke-dasharray="3 2" marker-end="url(#ar2)"/>`;
      g += `<circle cx="${X(x1)}" cy="${Y(x2)}" r="7" fill="${C.violet}" stroke="#fff" stroke-width="2"/><circle cx="${X(7.5)}" cy="${Y(2.5)}" r="4" fill="${C.accent}"/>`;
      // side panel
      const px = 440; g += txt(px, 40, "Current point", { fill: C.ink, bold: 1, size: 12 }) + txt(px, 62, `x₁ = ${x1.toFixed(1)}, x₂ = ${x2.toFixed(1)}`, { fill: C.ink }) + txt(px, 84, `f = ${fv.toFixed(2)}`, { fill: C.violet, bold: 1, size: 14 }) + txt(px, 112, `∇f = (2x₁, 6x₂) = (${gx.toFixed(1)}, ${gy.toFixed(1)})`, { fill: C.rose, size: 10.5 }) + txt(px, 132, "constraint normal: (1, 1)", { fill: C.ink, size: 10.5 });
      const pts = []; for (let t = 0; t <= 10; t += 0.1) pts.push(`${px + t * 18},${260 - (f(t, 10 - t) / 300) * 100}`);
      g += txt(px, 150, "f along the line", { size: 10 }) + `<polyline points="${pts.join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2"/><circle cx="${px + x1 * 18}" cy="${260 - (fv / 300) * 100}" r="5" fill="${C.violet}"/>` + txt(px, 276, "x₁ = 0", { size: 9 }) + txt(px + 180, 276, "10", { size: 9, anchor: "end" });
      svg.innerHTML = g;
      const at = Math.abs(x1 - 7.5) < 0.06;
      out.innerHTML = `<p>${at ? `<b>This is the constrained minimum: f = 75.</b> The constraint line is tangent to the contour f = 75, and ∇f = (15, 15) is parallel to the constraint's normal (1, 1). That is exactly the Lagrange condition ∇f = λ∇h, here with λ = 15.` : `Here f = ${fv.toFixed(2)}, higher than 75. The rose gradient arrow isn't parallel to the constraint's normal, which means sliding along the line ${x1 < 7.5 ? "toward larger x₁" : "toward smaller x₁"} still lowers f.`} Notice the optimum isn't at a corner, unlike linear programming: curved objectives can have their best point anywhere.</p>`;
    }
    xIn.addEventListener("input", render);
    render();
  })();

  /* 7. Gradient descent */
  (function gd() {
    const root = document.getElementById("viz-gd");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), sIn = $(root, '[data-in="s"]'), lIn = $(root, '[data-in="lr"]');
    const f = (x) => 0.12 * (x - 6.2) ** 2 + 1.1 * Math.sin(1.9 * x) + 0.4 * Math.cos(4.1 * x) + 2.5;
    const df = (x) => (f(x + 1e-4) - f(x - 1e-4)) / 2e-4;
    const grid = []; for (let x = 0; x <= 10; x += 0.001) grid.push([x, f(x)]);
    const glob = grid.reduce((b, p) => (p[1] < b[1] ? p : b), grid[0]);
    let path = [], multi = [];
    const reset = () => { path = [+sIn.value]; multi = []; };
    const stepFrom = (x, lr) => Math.max(0, Math.min(10, x - lr * df(x)));
    function render() {
      const lr = +lIn.value / 100;
      $(root, '[data-out="s"]').textContent = (+sIn.value).toFixed(1); $(root, '[data-out="lr"]').textContent = lr.toFixed(2);
      const W = 640, H = 260, L = 30, Rt = 16, T = 16, B = 30, X = (v) => L + (v / 10) * (W - L - Rt), lo = 0, hi = 9, Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
      let g = `<polyline points="${grid.filter((_, i) => i % 20 === 0).map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="none" stroke="${C.ink}" stroke-width="2.5"/>`;
      for (let v = 0; v <= 10; v += 1) g += txt(X(v), H - 10, v, { anchor: "middle", size: 10 });
      g += `<circle cx="${X(glob[0])}" cy="${Y(glob[1])}" r="6" fill="none" stroke="${C.accent}" stroke-width="2.5"/>` + txt(X(glob[0]), Y(glob[1]) + 20, "global minimum", { anchor: "middle", fill: C.accent, bold: 1, size: 10 });
      multi.forEach(([s, e]) => (g += `<line x1="${X(s)}" y1="${Y(f(s))}" x2="${X(e)}" y2="${Y(f(e))}" stroke="${C.amber}" opacity=".5"/><circle cx="${X(s)}" cy="${Y(f(s))}" r="3" fill="${C.amber}"/><circle cx="${X(e)}" cy="${Y(f(e))}" r="6" fill="${Math.abs(e - glob[0]) < 0.1 ? C.accent : C.rose}" opacity=".85"/>`));
      if (path.length > 1) g += `<polyline points="${path.map((x) => `${X(x)},${Y(f(x))}`).join(" ")}" fill="none" stroke="${C.violet}" stroke-width="1.5" stroke-dasharray="3 2"/>`;
      path.forEach((x, i) => (g += `<circle cx="${X(x)}" cy="${Y(f(x))}" r="${i === path.length - 1 ? 7 : 3.5}" fill="${C.violet}" opacity="${i === path.length - 1 ? 1 : 0.5}"/>`));
      svg.innerHTML = g;
      const x = path[path.length - 1], moving = path.length > 1 && Math.abs(path[path.length - 1] - path[path.length - 2]) > 1e-3;
      const osc = path.length > 4 && Math.sign(path[path.length - 1] - path[path.length - 2]) !== Math.sign(path[path.length - 2] - path[path.length - 3]) && Math.abs(path[path.length - 1] - path[path.length - 2]) > 0.05;
      if (multi.length) { const hit = multi.filter(([, e]) => Math.abs(e - glob[0]) < 0.1).length; out.innerHTML = `<p><b>${hit} of ${multi.length}</b> random starts reached the global minimum (teal); the rest got stuck in local minima (rose). Restarting from several points is a simple defense; genetic algorithms and other global methods search more broadly.</p>`; return; }
      out.innerHTML = `<div class="formula">x<sub>new</sub> = x − learning rate × f′(x) = ${x.toFixed(3)} after ${path.length - 1} step${path.length === 2 ? "" : "s"}, f = ${f(x).toFixed(3)}</div><p>${path.length === 1 ? "Take steps downhill: each step moves opposite to the slope." : osc ? "The steps are bouncing back and forth: the learning rate is too large, so it overshoots the valley floor." : !moving ? (Math.abs(x - glob[0]) < 0.1 ? "<b>Converged to the global minimum.</b>" : "<b>Converged, but to a local minimum.</b> The slope is zero here, so gradient descent can't tell there's a deeper valley elsewhere. Try another starting point.") : "Still descending."}</p>`;
    }
    $(root, "[data-step]").addEventListener("click", () => { multi = []; path.push(stepFrom(path[path.length - 1], +lIn.value / 100)); render(); });
    $(root, "[data-run]").addEventListener("click", () => { multi = []; for (let i = 0; i < 50; i++) path.push(stepFrom(path[path.length - 1], +lIn.value / 100)); render(); });
    $(root, "[data-reset]").addEventListener("click", () => { reset(); render(); });
    $(root, "[data-multi]").addEventListener("click", () => { path = [+sIn.value]; multi = Array.from({ length: 10 }, () => { let x = Math.random() * 10; const s = x; for (let i = 0; i < 300; i++) x = stepFrom(x, Math.min(+lIn.value / 100, 0.1)); return [s, x]; }); render(); });
    [sIn, lIn].forEach((el) => el.addEventListener("input", () => { reset(); render(); }));
    reset(); render();
  })();
})();
