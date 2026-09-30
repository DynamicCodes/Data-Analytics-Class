// Session 19 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b", sky: "#3a8dde" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const gauss = (r) => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
  const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
  const pct = (v, d = 0) => (v * 100).toFixed(d) + "%";

  /* 1. Campaign decision tree */
  (function dtree() {
    const root = document.getElementById("viz-dtree");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), dIn = $(root, '[data-in="pd"]'), tIn = $(root, '[data-in="pt"]');
    const OPT = [
      { k: "d", name: "Digital campaign", cost: 4, hi: 12, lo: 5 },
      { k: "t", name: "TV campaign", cost: 10, hi: 25, lo: 8 },
      { k: "n", name: "No campaign", cost: 0, base: 3 },
    ];
    const f1 = (v) => (v < 0 ? "−" : "") + "₹" + Math.abs(v).toFixed(1) + "L";
    function render() {
      const pd = +dIn.value / 100, pt = +tIn.value / 100;
      $(root, '[data-out="pd"]').textContent = pd.toFixed(2); $(root, '[data-out="pt"]').textContent = pt.toFixed(2);
      const P = { d: pd, t: pt };
      OPT.forEach((o) => { if (o.k === "n") { o.emv = o.base; o.min = o.max = o.base; } else { o.emv = P[o.k] * o.hi + (1 - P[o.k]) * o.lo - o.cost; o.min = o.lo - o.cost; o.max = o.hi - o.cost; } });
      const best = OPT.reduce((b, o) => (o.emv > b.emv ? o : b), OPT[0]);
      let g = "";
      const dx = 30, dy = 150, cx = 250, ys = [55, 150, 250], lx = 470;
      g += `<rect x="${dx - 14}" y="${dy - 14}" width="28" height="28" fill="${C.ink}"/>` + txt(dx, dy + 34, "Decide", { anchor: "middle", fill: C.ink, bold: 1, size: 10 });
      OPT.forEach((o, i) => {
        const y = ys[i], win = o === best;
        g += `<line x1="${dx + 14}" y1="${dy}" x2="${cx - 12}" y2="${y}" stroke="${win ? C.accent : C.line}" stroke-width="${win ? 4 : 2}"/>`;
        g += txt((dx + cx) / 2 + 10, (dy + y) / 2 - 6, `${o.name}${o.cost ? ` (−₹${o.cost}L)` : ""}`, { anchor: "middle", fill: win ? C.accent : C.ink, bold: 1, size: 10.5 });
        if (o.k === "n") { g += `<polygon points="${lx},${y} ${lx + 14},${y - 9} ${lx + 14},${y + 9}" fill="${C.soft}"/><line x1="${cx - 12}" y1="${y}" x2="${lx}" y2="${y}" stroke="${win ? C.accent : C.line}" stroke-width="${win ? 4 : 2}"/>` + txt(lx + 20, y + 4, `Baseline revenue ₹${o.base}L`, { fill: C.ink, size: 10.5 }); }
        else {
          g += `<circle cx="${cx}" cy="${y}" r="12" fill="${C.amber}"/>`;
          [[o.hi, P[o.k], "High response", -34], [o.lo, 1 - P[o.k], "Low response", 34]].forEach(([rev, p, lab, off]) => {
            const yy = y + off * 0.9;
            g += `<line x1="${cx + 12}" y1="${y}" x2="${lx}" y2="${yy}" stroke="${C.line}" stroke-width="2"/>` + txt((cx + lx) / 2, (y + yy) / 2 - 4, `${lab} (p = ${p.toFixed(2)})`, { anchor: "middle", size: 9.5 });
            g += `<polygon points="${lx},${yy} ${lx + 14},${yy - 9} ${lx + 14},${yy + 9}" fill="${C.soft}"/>` + txt(lx + 20, yy + 4, `₹${rev}L − ₹${o.cost}L = ${f1(rev - o.cost)}`, { fill: C.ink, size: 10.5 });
          });
        }
        g += `<rect x="${cx - 44}" y="${y + 16}" width="88" height="20" rx="10" fill="${win ? C.accent : C.bg}"/>` + txt(cx, y + 30, `EMV ${f1(o.emv)}`, { anchor: "middle", fill: win ? "#fff" : C.ink, bold: 1, size: 10.5 });
      });
      svg.innerHTML = g;
      const d = OPT[0], t = OPT[1], be = (d.emv - (t.lo - t.cost)) / (t.hi - t.lo); // pt where TV EMV = digital EMV
      out.innerHTML = `<div class="formula">EMV(TV) = ${pt.toFixed(2)} × 25 + ${(1 - pt).toFixed(2)} × 8 − 10 = ${f1(t.emv)} &nbsp;·&nbsp; EMV(digital) = ${pd.toFixed(2)} × 12 + ${(1 - pd).toFixed(2)} × 5 − 4 = ${f1(d.emv)}</div><p><b>Recommendation by expected value: ${best.k === "t" ? "the TV campaign" : best.k === "d" ? "the digital campaign" : "no campaign"}</b> (EMV ${f1(best.emv)}). But look at the risk: TV's outcomes range from ${f1(t.min)} to ${f1(t.max)}, while digital's range from ${f1(d.min)} to ${f1(d.max)}. A cautious company might prefer digital even when TV's EMV is a little higher. ${be > 0 && be < 1 ? `Sensitivity: with digital's probability at ${pd.toFixed(2)}, TV beats digital only if its chance of a high response exceeds ${be.toFixed(2)}.` : ""}</p>`;
    }
    [dIn, tIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* 2. Confusion matrix + threshold + costs */
  (function cm() {
    const root = document.getElementById("viz-cm");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), tbl = $(root, "[data-matrix]"), met = $(root, "[data-metrics]"), tIn = $(root, '[data-in="t"]'), cB = $$(root, "[data-case]");
    const CASES = {
      fraud: { n: 5000, prev: 0.02, sep: 2.6, fn: 20000, fp: 500, pos: "fraudulent", neg: "legitimate", unit: "₹", fnLab: "missed fraud", fpLab: "legitimate payment blocked" },
      medical: { n: 5000, prev: 0.1, sep: 2.0, fn: 50, fp: 1, pos: "sick", neg: "healthy", unit: "", fnLab: "missed diagnosis", fpLab: "unnecessary follow-up test", costUnit: "cost units" },
      spam: { n: 5000, prev: 0.3, sep: 2.8, fn: 1, fp: 20, pos: "spam", neg: "real", unit: "", fnLab: "spam reaching the inbox", fpLab: "real email blocked", costUnit: "cost units" },
    };
    let cs = "fraud", lazy = false, data;
    const build = () => { const c = CASES[cs], r = rng(cs.length * 31), nPos = Math.round(c.n * c.prev); data = Array.from({ length: c.n }, (_, i) => { const y = i < nPos ? 1 : 0; const z = (y ? c.sep / 2 : -c.sep / 2) + gauss(r); return { y, s: 1 / (1 + Math.exp(-(z * 1.3 - (y ? 0 : 0)))) }; }); };
    const counts = (t) => { let tp = 0, fp = 0, fn = 0, tn = 0; data.forEach((d) => { const p = !lazy && d.s >= t; if (d.y) p ? tp++ : fn++; else p ? fp++ : tn++; }); return { tp, fp, fn, tn }; };
    const costOf = (k) => k.fn * CASES[cs].fn + k.fp * CASES[cs].fp;
    const bestT = () => { const sv = lazy; lazy = false; let b = 0.5, bc = Infinity; for (let t = 0.01; t <= 0.991; t += 0.01) { const c = costOf(counts(t)); if (c < bc) { bc = c; b = t; } } lazy = sv; return b; };
    function render() {
      const c = CASES[cs], t = +tIn.value / 100; $(root, '[data-out="t"]').textContent = lazy ? "flag nothing" : t.toFixed(2);
      const bt = bestT();
      // histograms
      const bins = 50, hp = new Array(bins).fill(0), hn = new Array(bins).fill(0);
      data.forEach((d) => { const b = Math.min(bins - 1, Math.floor(d.s * bins)); (d.y ? hp : hn)[b]++; });
      const mp = Math.max(...hp), mn = Math.max(...hn), W = 640, L = 20, Rt = 20, T = 14, B = 170, X = (v) => L + v * (W - L - Rt), bw = (W - L - Rt) / bins;
      let g = "";
      hn.forEach((v, i) => (g += `<rect x="${L + i * bw}" y="${B - (v / mn) * (B - T) * 0.95}" width="${bw - 1}" height="${(v / mn) * (B - T) * 0.95}" fill="${C.accent}" opacity=".35"/>`));
      hp.forEach((v, i) => (g += `<rect x="${L + i * bw}" y="${B - (v / mp) * (B - T) * 0.95}" width="${bw - 1}" height="${(v / mp) * (B - T) * 0.95}" fill="${C.rose}" opacity=".55"/>`));
      g += `<line x1="${L}" x2="${W - Rt}" y1="${B}" y2="${B}" stroke="${C.line}"/>`;
      for (let v = 0; v <= 1.001; v += 0.25) g += txt(X(v), B + 14, v.toFixed(2), { anchor: "middle", size: 10 });
      g += txt((W + L) / 2, B + 32, `Model score (each color scaled to its own height: ${Math.round(c.n * c.prev)} ${c.pos}, ${c.n - Math.round(c.n * c.prev)} ${c.neg})`, { anchor: "middle", size: 10 });
      g += `<line x1="${X(bt)}" x2="${X(bt)}" y1="${T}" y2="${B}" stroke="${C.violet}" stroke-dasharray="5 4"/>` + txt(X(bt) + 4, T + 10, "lowest cost", { fill: C.violet, bold: 1, size: 10 });
      if (!lazy) g += `<rect x="${X(t)}" y="${T}" width="${X(1) - X(t)}" height="${B - T}" fill="${C.ink}" opacity=".05"/><line x1="${X(t)}" x2="${X(t)}" y1="${T - 4}" y2="${B}" stroke="${C.ink}" stroke-width="2.5"/>` + txt(X(t) + 4, B - 6, "flagged →", { fill: C.ink, bold: 1, size: 10 });
      svg.innerHTML = g;
      const k = counts(t), n = c.n, acc = (k.tp + k.tn) / n, prec = k.tp + k.fp ? k.tp / (k.tp + k.fp) : 0, rec = k.tp / (k.tp + k.fn), spec = k.tn / (k.tn + k.fp), f1 = prec + rec ? (2 * prec * rec) / (prec + rec) : 0, cost = costOf(k);
      tbl.innerHTML = `<thead><tr><th></th><th>Predicted ${c.pos}</th><th>Predicted ${c.neg}</th></tr></thead><tbody><tr><th>Actually ${c.pos}</th><td class="good" style="text-align:center"><b>TP ${k.tp}</b></td><td class="bad" style="text-align:center"><b>FN ${k.fn}</b><br /><span style="font-size:.85em">${c.fnLab}</span></td></tr><tr><th>Actually ${c.neg}</th><td class="bad" style="text-align:center"><b>FP ${k.fp}</b><br /><span style="font-size:.85em">${c.fpLab}</span></td><td class="good" style="text-align:center"><b>TN ${k.tn}</b></td></tr></tbody>`;
      const fmtC = (v) => (c.unit === "₹" ? "₹" + Math.round(v).toLocaleString("en-IN") : Math.round(v).toLocaleString("en-IN") + (Math.round(v) === 1 ? " cost unit" : " cost units"));
      met.innerHTML = [["Accuracy", pct(acc, 1)], ["Precision", k.tp + k.fp ? pct(prec, 1) : "–"], ["Recall", pct(rec, 1)], ["Specificity", pct(spec, 1)], ["F1", f1.toFixed(3)], ["Total cost", fmtC(cost)]].map(([a, b]) => `<div class="stat"><b>${b}</b><span>${a}</span></div>`).join("");
      out.innerHTML = lazy
        ? `<p><b>The accuracy paradox.</b> A "model" that never flags anything is ${pct(acc, 1)} accurate, because only ${pct(c.prev, 0)} of cases are ${c.pos}. But its recall is 0%: it catches nothing, and every ${c.fnLab} costs ${fmtC(c.fn)}, for a total of ${fmtC(cost)}. That's why accuracy alone misleads on imbalanced data. Move the threshold to switch the real model back on.</p>`
        : `<p>At threshold ${t.toFixed(2)} the model flags ${k.tp + k.fp} cases: it catches ${pct(rec)} of ${c.pos} cases (recall), and ${pct(prec)} of flags are right (precision). A ${c.fnLab} costs ${fmtC(c.fn)} and a ${c.fpLab} costs ${fmtC(c.fp)}, so the cost-minimizing threshold is <b>${bt.toFixed(2)}</b>. ${c.fn > c.fp ? "Because missing a positive is far costlier, the best threshold is low: accept more false alarms to maximize recall." : "Because a false alarm is far costlier, the best threshold is high: prioritize precision."}</p>`;
    }
    cB.forEach((b) => b.addEventListener("click", () => { cs = b.dataset.case; press(cB, b); lazy = false; build(); render(); }));
    tIn.addEventListener("input", () => { lazy = false; render(); });
    $(root, "[data-lazy]").addEventListener("click", () => { lazy = true; render(); });
    $(root, "[data-best]").addEventListener("click", () => { lazy = false; tIn.value = Math.round(bestT() * 100); render(); });
    build(); render();
  })();

  /* 3. ROC and PR */
  (function roc() {
    const root = document.getElementById("viz-roc");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), pIn = $(root, '[data-in="pr"]'), sIn = $(root, '[data-in="s"]');
    const PREV = [0.5, 0.3, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005];
    pIn.max = PREV.length - 1; pIn.value = 2;
    function render() {
      const pi = PREV[+pIn.value], s = +sIn.value / 10;
      $(root, '[data-out="pr"]').textContent = (pi * 100 >= 1 ? Math.round(pi * 100) : pi * 100) + "%"; $(root, '[data-out="s"]').textContent = s.toFixed(1);
      const ts = []; for (let t = 6; t >= -6; t -= 0.05) ts.push(t);
      const pts = ts.map((t) => { const tpr = 1 - Phi(t - s), fpr = 1 - Phi(t), prec = tpr * pi + fpr * (1 - pi) > 0 ? (tpr * pi) / (tpr * pi + fpr * (1 - pi)) : 1; return { tpr, fpr, prec }; });
      const auc = Phi(s / Math.SQRT2);
      const at80 = pts.reduce((b, p) => (Math.abs(p.tpr - 0.8) < Math.abs(b.tpr - 0.8) ? p : b), pts[0]);
      const pan = (x0, title, xl, yl) => { const S = 220, Y0 = 30; let g = txt(x0, 18, title, { fill: C.ink, bold: 1 }) + `<rect x="${x0}" y="${Y0}" width="${S}" height="${S}" fill="${C.bg}" rx="6"/>`; for (let v = 0; v <= 1.001; v += 0.25) g += txt(x0 - 6, Y0 + S - v * S + 4, v.toFixed(2), { anchor: "end", size: 9 }) + txt(x0 + v * S, Y0 + S + 13, v.toFixed(2), { anchor: "middle", size: 9 }); g += txt(x0 + S / 2, Y0 + S + 26, xl, { anchor: "middle", size: 10 }) + txt(x0 + S + 6, Y0 + 10, yl, { size: 10 }); return [g, (v) => x0 + v * S, (v) => Y0 + S - v * S]; };
      let [g1, X1, Y1] = pan(60, `ROC curve (AUC = ${auc.toFixed(3)})`, "False positive rate", "");
      g1 += `<line x1="${X1(0)}" y1="${Y1(0)}" x2="${X1(1)}" y2="${Y1(1)}" stroke="${C.soft}" stroke-dasharray="4 3"/>` + txt(X1(0.62), Y1(0.5), "random", { size: 9.5 });
      g1 += `<polyline points="${pts.map((p) => `${X1(p.fpr)},${Y1(p.tpr)}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/><circle cx="${X1(at80.fpr)}" cy="${Y1(at80.tpr)}" r="5" fill="${C.violet}"/>`;
      let [g2, X2, Y2] = pan(380, "Precision–recall curve", "Recall", "");
      g2 += `<line x1="${X2(0)}" y1="${Y2(pi)}" x2="${X2(1)}" y2="${Y2(pi)}" stroke="${C.soft}" stroke-dasharray="4 3"/>` + txt(X2(0.98), Y2(pi) - 4, "random = " + (pi * 100 >= 1 ? Math.round(pi * 100) : pi * 100) + "%", { anchor: "end", size: 9.5 });
      g2 += `<polyline points="${pts.filter((p) => p.tpr > 0.001).map((p) => `${X2(p.tpr)},${Y2(p.prec)}`).join(" ")}" fill="none" stroke="${C.rose}" stroke-width="2.5"/><circle cx="${X2(at80.tpr)}" cy="${Y2(at80.prec)}" r="5" fill="${C.violet}"/>`;
      svg.innerHTML = g1 + g2;
      out.innerHTML = `<p>The violet dot is the threshold that catches 80% of positives. There, the false positive rate is ${pct(at80.fpr, 1)}, identical at any class balance. But precision is <b>${pct(at80.prec)}</b> when ${pi * 100 >= 1 ? Math.round(pi * 100) : pi * 100}% of cases are positive: ${at80.prec < 0.5 ? "most flags are false alarms, because the few positives are swamped by the many negatives" : "most flags are genuine"}. ${pi <= 0.05 ? "This is why precision–recall curves are preferred for rare-event problems like fraud: the ROC curve alone looks deceptively good." : "Make positives rarer to see the precision–recall curve collapse while ROC stays put."} ${s < 0.3 ? "With no separation the model is guessing: AUC ≈ 0.5." : ""}</p>`;
    }
    [pIn, sIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* 4. Frameworks */
  (function frame() {
    const root = document.getElementById("viz-frame");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), fB = $$(root, "[data-fw]");
    const FW = {
      crisp: { name: "CRISP-DM", sub: "Cross-Industry Standard Process for Data Mining", kind: "cycle", stages: [
        ["Business understanding", "Define the objective and success criteria: reduce monthly churn from 3% to 2% within six months, and decide what a retention offer may cost."],
        ["Data understanding", "Explore CRM records, billing, support tickets and usage logs. Initial EDA shows churners call support more often and are on monthly contracts."],
        ["Data preparation", "Clean and join tables, handle missing values, and engineer features such as tenure, calls in the last 90 days and plan changes."],
        ["Modelling", "Train candidate models (logistic regression, random forest) to predict each customer's churn probability."],
        ["Evaluation", "Check recall and precision on held-out customers, and whether the model meets the business goal. If not, loop back to earlier phases."],
        ["Deployment", "Score customers weekly and send the riskiest to the retention team. Monitor results, which feed the next cycle."],
      ] },
      ooda: { name: "OODA loop", sub: "A fast cycle for strategic and operational decisions", kind: "cycle", stages: [
        ["Observe", "The dashboard shows a spike in churn in one region this week."],
        ["Orient", "Put it in context: a competitor launched a cheaper plan there, and our churn model flags 1,200 at-risk customers in that region."],
        ["Decide", "Offer those customers a matching plan for three months."],
        ["Act", "Launch the offer, then observe the effect, starting the loop again. The team that cycles faster adapts better."],
      ] },
      dikw: { name: "DIKW pyramid", sub: "From raw data to wise action", kind: "pyramid", stages: [
        ["Data", "Raw facts with no context: 'Customer 48213, plan B, 7 support calls, contract ends 30 June'."],
        ["Information", "Data organized and summarized: 'Customers with 5+ support calls churn at 18%, versus 3% overall'."],
        ["Knowledge", "Understanding why: 'Unresolved network complaints drive churn among heavy callers'."],
        ["Wisdom", "Knowing what to do: 'Fix the network hotspots and proactively contact heavy callers; it costs less than losing them'."],
      ] },
    };
    let fw = "crisp", sel = 0;
    function render() {
      const F = FW[fw], n = F.stages.length;
      let g = txt(20, 20, F.name, { fill: C.ink, bold: 1, size: 14 }) + txt(20, 38, F.sub, { size: 10.5 });
      if (F.kind === "cycle") {
        const cx = 320, cy = 165, R = 105;
        g += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.line}" stroke-width="3" stroke-dasharray="6 6"/>`;
        if (fw === "crisp") g += `<circle cx="${cx}" cy="${cy}" r="34" fill="${C.lilac}"/>` + txt(cx, cy + 5, "Data", { anchor: "middle", fill: C.violet, bold: 1, size: 13 });
        F.stages.forEach(([lab], i) => {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / n, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), on = i === sel, w = Math.max(92, lab.length * 6.6 + 16);
          g += `<g data-i="${i}" style="cursor:pointer"><rect x="${x - w / 2}" y="${y - 17}" width="${w}" height="34" rx="17" fill="${on ? C.accent : "#fff"}" stroke="${C.accent}" stroke-width="2"/>` + txt(x, y + 4, lab, { anchor: "middle", fill: on ? "#fff" : C.ink, bold: 1, size: 11 }) + `</g>`;
          const a2 = a + Math.PI / n, ax = cx + (R + 1) * Math.cos(a2), ay = cy + (R + 1) * Math.sin(a2);
          g += txt(ax, ay + 5, "›", { anchor: "middle", fill: C.accent, bold: 1, size: 18 });
        });
      } else {
        const top = 60, base = 280, cx = 320, hw = 240;
        F.stages.forEach(([lab], i) => {
          const lvl = n - 1 - i, y0 = top + (lvl * (base - top)) / n, y1 = top + ((lvl + 1) * (base - top)) / n, w0 = (hw * (lvl) ) / n, w1 = (hw * (lvl + 1)) / n, on = i === sel;
          g += `<g data-i="${i}" style="cursor:pointer"><polygon points="${cx - w0},${y0 + 2} ${cx + w0},${y0 + 2} ${cx + w1},${y1 - 2} ${cx - w1},${y1 - 2}" fill="${on ? C.accent : [C.light, "#bfe3de", C.lilac, "#fdf0dc"][i]}" stroke="#fff" stroke-width="2"/>` + txt(cx, (y0 + y1) / 2 + 5, lab, { anchor: "middle", fill: on ? "#fff" : C.ink, bold: 1, size: 12 }) + `</g>`;
        });
        g += txt(cx + hw / 2 + 60, 80, "more value,", { size: 10 }) + txt(cx + hw / 2 + 60, 94, "more context ↑", { size: 10 });
      }
      svg.innerHTML = g;
      const [lab, desc] = F.stages[sel];
      out.innerHTML = `<h5>${fw === "dikw" ? "" : `Stage ${sel + 1}: `}${lab}</h5><p>${desc}</p>`;
    }
    svg.addEventListener("click", (e) => { const g = e.target.closest("[data-i]"); if (!g) return; sel = +g.dataset.i; render(); });
    fB.forEach((b) => b.addEventListener("click", () => { fw = b.dataset.fw; sel = 0; press(fB, b); render(); }));
    render();
  })();

  /* 5. A/B test */
  (function ab() {
    const root = document.getElementById("viz-ab");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), nIn = $(root, '[data-in="n"]'), aIn = $(root, '[data-in="a"]'), bIn = $(root, '[data-in="b"]');
    const NS = [250, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
    function render() {
      const n = NS[+nIn.value], pa = +aIn.value / 1000, pb = +bIn.value / 1000;
      $(root, '[data-out="n"]').textContent = n.toLocaleString("en-IN"); $(root, '[data-out="a"]').textContent = pct(pa, 1); $(root, '[data-out="b"]').textContent = pct(pb, 1);
      const ca = Math.round(pa * n), cb = Math.round(pb * n), ra = ca / n, rb = cb / n;
      const pp = (ca + cb) / (2 * n), se0 = Math.sqrt(pp * (1 - pp) * (2 / n)), z = se0 ? (rb - ra) / se0 : 0, p = 2 * (1 - Phi(Math.abs(z)));
      const se = Math.sqrt((ra * (1 - ra)) / n + (rb * (1 - rb)) / n), lo = rb - ra - 1.96 * se, hi = rb - ra + 1.96 * se;
      const ciA = 1.96 * Math.sqrt((ra * (1 - ra)) / n), ciB = 1.96 * Math.sqrt((rb * (1 - rb)) / n);
      const vmax = Math.max(ra + ciA, rb + ciB) * 1.15 || 0.1, L = 110, R = 620, X = (v) => L + (v / vmax) * (R - L);
      let g = "";
      [["Model A", ra, ciA, C.soft, 40], ["Model B", rb, ciB, C.accent, 90]].forEach(([lab, r, ci, col, y]) => {
        g += txt(L - 12, y + 5, lab, { anchor: "end", fill: C.ink, bold: 1, size: 12 }) + `<rect x="${L}" y="${y - 12}" width="${X(r) - L}" height="24" rx="6" fill="${col}" opacity=".35"/>`;
        g += `<line x1="${X(Math.max(0, r - ci))}" x2="${X(r + ci)}" y1="${y}" y2="${y}" stroke="${C.ink}" stroke-width="2"/><line x1="${X(Math.max(0, r - ci))}" x2="${X(Math.max(0, r - ci))}" y1="${y - 7}" y2="${y + 7}" stroke="${C.ink}" stroke-width="2"/><line x1="${X(r + ci)}" x2="${X(r + ci)}" y1="${y - 7}" y2="${y + 7}" stroke="${C.ink}" stroke-width="2"/><circle cx="${X(r)}" cy="${y}" r="5" fill="${C.ink}"/>` + txt(X(r + ci) + 8, y + 4, `${pct(r, 2)} (${(lab === "Model A" ? ca : cb).toLocaleString("en-IN")} of ${n.toLocaleString("en-IN")})`, { size: 10.5, fill: C.ink });
      });
      for (let v = 0; v <= vmax; v += vmax > 0.1 ? 0.05 : 0.02) g += txt(X(v), 132, pct(v, 0), { anchor: "middle", size: 9.5 });
      const dm = Math.max(Math.abs(lo), Math.abs(hi), 0.005) * 1.3, DX = (v) => 320 + (v / dm) * 200;
      g += txt(20, 172, "Difference B − A", { fill: C.ink, bold: 1 }) + `<line x1="120" x2="520" y1="170" y2="170" stroke="${C.line}"/><line x1="${DX(0)}" x2="${DX(0)}" y1="158" y2="182" stroke="${C.ink}" stroke-dasharray="3 3"/>` + txt(DX(0), 196, "no difference", { anchor: "middle", size: 9.5 });
      const sig = lo > 0 || hi < 0;
      g += `<line x1="${DX(lo)}" x2="${DX(hi)}" y1="170" y2="170" stroke="${sig ? C.accent : C.rose}" stroke-width="5" stroke-linecap="round"/><circle cx="${DX(rb - ra)}" cy="170" r="6" fill="${C.ink}"/>` + txt(530, 174, `${(rb - ra >= 0 ? "+" : "") + ((rb - ra) * 100).toFixed(2)} pts`, { fill: C.ink, bold: 1, size: 10.5 });
      svg.innerHTML = g;
      const lift = ra ? (rb - ra) / ra : 0;
      out.innerHTML = `<div class="formula">z = (${pct(rb, 2)} − ${pct(ra, 2)}) ÷ ${(se0 * 100).toFixed(3)}% = ${z.toFixed(2)} &nbsp;·&nbsp; p-value = ${p < 0.001 ? "&lt; 0.001" : p.toFixed(3)} &nbsp;·&nbsp; 95% CI for the difference: ${(lo * 100).toFixed(2)} to ${(hi * 100).toFixed(2)} points</div><p>${sig ? `<b>Model B wins.</b> Its conversion rate is ${(lift * 100).toFixed(0)}% higher in relative terms, and the confidence interval for the difference excludes zero (p ${p < 0.001 ? "&lt; 0.001" : "= " + p.toFixed(3)}), so this is unlikely to be chance.` : `<b>Not conclusive.</b> B's rate is ${(lift * 100).toFixed(0)}% ${lift >= 0 ? "higher" : "lower"} in relative terms, but the confidence interval includes zero (p = ${p.toFixed(3)}), so the gap could easily be chance. ${Math.abs(pb - pa) > 0.002 ? "More traffic would settle it." : ""}`} Small real differences need large samples to detect; the test also says nothing about whether the lift is worth the cost of switching.</p>`;
    }
    [nIn, aIn, bIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* 6. Baseline → performance → investment */
  (function roi() {
    const root = document.getElementById("viz-roi");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out");
    const [b0In, b1In, vIn, cIn] = ["b0", "b1", "v", "c"].map((k) => $(root, `[data-in="${k}"]`));
    const EX = { ret: [78, 91, 15, 5], fc: [65, 86, 5, 4], fraud: [60, 95, 6, 5] };
    const NOTE = { ret: "Customer retention (the slides: 'expand the project')", fc: "Demand forecast accuracy (the slides: '₹10M saved in inventory, continue ML funding')", fraud: "Fraud detection (the slides: 'invest in real-time analytics')" };
    let ex = "ret";
    function render() {
      const b0 = +b0In.value, b1 = +b1In.value, v = +vIn.value / 10, cost = +cIn.value;
      $(root, '[data-out="b0"]').textContent = b0 + "%"; $(root, '[data-out="b1"]').textContent = b1 + "%"; $(root, '[data-out="v"]').textContent = v.toFixed(1); $(root, '[data-out="c"]').textContent = cost;
      const pp = b1 - b0, rel = pp / b0, val = Math.max(0, pp) * v, rodi = val / cost, net = (val - cost) / cost, pay = val > 0 ? (cost / val) * 12 : Infinity;
      const L = 20, W = 640;
      let g = txt(L, 16, "Metric", { fill: C.ink, bold: 1 });
      const X = (p) => L + 70 + (p / 100) * 240;
      [["Baseline", b0, C.soft, 40], ["After", b1, C.accent, 80]].forEach(([lab, p, col, y]) => (g += txt(L, y + 5, lab, { fill: C.ink, size: 11 }) + `<rect x="${X(0)}" y="${y - 11}" width="${X(p) - X(0)}" height="22" rx="6" fill="${col}"/>` + txt(X(p) + 6, y + 5, p + "%", { fill: C.ink, bold: 1 })));
      if (pp > 0) g += `<rect x="${X(b0)}" y="${80 - 11}" width="${X(b1) - X(b0)}" height="22" rx="0" fill="${C.amber}" opacity=".7"/>` + txt((X(b0) + X(b1)) / 2, 116, `+${pp} points`, { anchor: "middle", fill: C.amber, bold: 1 });
      const L2 = 380, mv = Math.max(val, cost, 1) * 1.15, Y2 = (m) => 170 - (m / mv) * 130;
      g += txt(L2, 16, "First-year value vs. cost (₹M)", { fill: C.ink, bold: 1 });
      [["Cost", cost, C.rose, L2 + 30], ["Value", val, C.accent, L2 + 130]].forEach(([lab, m, col, x]) => (g += `<rect x="${x}" y="${Y2(m)}" width="70" height="${170 - Y2(m)}" rx="6" fill="${col}" opacity=".85"/>` + txt(x + 35, Y2(m) - 6, "₹" + m.toFixed(1) + "M", { anchor: "middle", fill: C.ink, bold: 1 }) + txt(x + 35, 188, lab, { anchor: "middle", fill: C.ink })));
      svg.innerHTML = g;
      $(root, '[data-stat="pp"]').textContent = (pp >= 0 ? "+" : "") + pp + " pts";
      $(root, '[data-stat="rel"]').textContent = (rel >= 0 ? "+" : "") + (rel * 100).toFixed(1) + "%";
      $(root, '[data-stat="rodi"]').textContent = rodi.toFixed(2) + "×";
      $(root, '[data-stat="pay"]').textContent = pay === Infinity ? "never" : pay < 1 ? "< 1 month" : pay.toFixed(1) + " months";
      const verdict = pp <= 0 ? "There's no improvement over the baseline, so there's nothing to pay back the cost: pause or rethink the initiative." : rodi >= 2 ? "<b>Scale it up:</b> the value comfortably exceeds the cost." : rodi >= 1 ? "<b>Optimize:</b> it pays for itself, but only just; look for ways to cut cost or widen its use." : "<b>Pause or rethink:</b> in the first year the value doesn't cover the cost.";
      out.innerHTML = `<p>${ex ? `<i>${NOTE[ex]}.</i> ` : ""}The metric rose from ${b0}% to ${b1}%: <b>${pp >= 0 ? "+" : ""}${pp} percentage points</b>, which is a <b>${(rel * 100).toFixed(1)}% relative</b> improvement. Reporting "+${pp}%" would blur the two. At ₹${v.toFixed(1)}M per point, that's ₹${val.toFixed(1)}M of value a year against a ₹${cost}M cost: RODI = ${val.toFixed(1)} ÷ ${cost} = ${rodi.toFixed(2)} (net ROI ${(net * 100).toFixed(0)}%). ${verdict} The value per point and costs here are illustrative; in practice they come from finance.</p>`;
    }
    $$(root, "[data-ex]").forEach((b) => b.addEventListener("click", () => { ex = b.dataset.ex; const [a, c, v, k] = EX[ex]; b0In.value = a; b1In.value = c; vIn.value = v; cIn.value = k; render(); }));
    [b0In, b1In, vIn, cIn].forEach((el) => el.addEventListener("input", () => { ex = null; render(); }));
    render();
  })();
})();
