// Session 20 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b", sky: "#3a8dde" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  const pct = (v, d = 0) => (v * 100).toFixed(d) + "%";
  function lgamma(x) { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t); let s = 1.000000000190015; for (const k of c) s += k / ++y; return -t + Math.log((2.5066282746310005 * s) / x); }

  /* 1. One piece of evidence, as an icon array */
  (function update() {
    const root = document.getElementById("viz-update");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), eB = $$(root, "[data-ex]");
    const [pIn, aIn, bIn] = ["p", "a", "b"].map((k) => $(root, `[data-in="${k}"]`));
    const EX = { churn: [15, 80, 20, "will churn", "stay", "their usage dropped"], disease: [1, 99, 1, "have the disease", "are healthy", "tested positive"], fraud: [2, 60, 5, "are fraudulent", "are legitimate", "were made overseas"] };
    let ex = "churn";
    function render() {
      const p = +pIn.value / 100, a = +aIn.value / 100, b = +bIn.value / 100, [, , , hLab, nLab, eLab] = EX[ex] || [0, 0, 0, "H", "not H", "show the evidence"];
      $(root, '[data-out="p"]').textContent = p.toFixed(2); $(root, '[data-out="a"]').textContent = a.toFixed(2); $(root, '[data-out="b"]').textContent = b.toFixed(2);
      const N = 1000, nH = Math.round(N * p), nHE = Math.round(nH * a), nNE = Math.round((N - nH) * b), post = nHE + nNE ? nHE / (nHE + nNE) : 0, exact = (a * p) / (a * p + b * (1 - p));
      const cols = 40, sz = 6.4, gap = 0.6;
      const grid = (x0, y0, after) => { let g = ""; for (let i = 0; i < N; i++) { const isH = i < nH, hasE = isH ? i < nHE : i - nH < nNE; const x = x0 + (i % cols) * (sz + gap), y = y0 + Math.floor(i / cols) * (sz + gap); const col = isH ? C.rose : C.accent; const op = !after ? (isH ? 1 : 0.3) : hasE ? 1 : 0.08; g += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${sz}" height="${sz}" rx="1" fill="${col}" opacity="${op}"/>`; } return g; };
      let g = txt(20, 18, "Before the evidence (prior)", { fill: C.ink, bold: 1 }) + txt(345, 18, "After: only customers who " + eLab.replace("their usage dropped", "had a usage drop"), { fill: C.ink, bold: 1 });
      if (!EX[ex]) g = txt(20, 18, "Before the evidence (prior)", { fill: C.ink, bold: 1 }) + txt(345, 18, "After: only cases with the evidence", { fill: C.ink, bold: 1 });
      g += grid(20, 28, false) + grid(345, 28, true);
      g += txt(20, 222, `${nH} of 1,000: P(H) = ${pct(p, 1)}`, { fill: C.rose, bold: 1, size: 11.5 });
      g += txt(345, 222, `${nHE} of ${nHE + nNE} with it: P(H | E) = ${pct(exact, 1)}`, { fill: C.rose, bold: 1, size: 11.5 });
      g += `<rect x="20" y="236" width="275" height="12" rx="6" fill="${C.grid}"/><rect x="20" y="236" width="${275 * p}" height="12" rx="6" fill="${C.rose}"/><rect x="345" y="236" width="275" height="12" rx="6" fill="${C.grid}"/><rect x="345" y="236" width="${275 * exact}" height="12" rx="6" fill="${C.rose}"/>`;
      svg.innerHTML = g;
      const LR = a / b, po = p / (1 - p), qo = po * LR;
      out.innerHTML = `<div class="formula">P(H | E) = ${a.toFixed(2)} × ${p.toFixed(2)} ÷ (${a.toFixed(2)} × ${p.toFixed(2)} + ${b.toFixed(2)} × ${(1 - p).toFixed(2)}) = ${exact.toFixed(3)}</div><p>${ex === "churn" ? "The slides' churn example: a 15% prior becomes about 40% once usage drops, high enough to justify a retention offer. " : ex === "disease" ? "The slides' medical example: even a 99%-accurate test only raises a 1% prior to 50%, because healthy people vastly outnumber sick ones, so their 1% false positives match the true positives. " : ex === "fraud" ? "Overseas transactions are 12 times more common in fraud, yet only about 1 in 5 flagged transactions is fraudulent, because fraud is so rare. " : ""}The evidence is <b>${LR >= 1 ? LR.toFixed(1) + "× more likely" : (1 / LR).toFixed(1) + "× less likely"}</b> if H is true (the likelihood ratio). In odds form: prior odds ${po.toFixed(3)} × ${LR.toFixed(2)} = posterior odds ${qo.toFixed(3)}. ${LR === 1 ? "A likelihood ratio of 1 means the evidence tells us nothing." : ""}</p>`;
    }
    eB.forEach((btn) => btn.addEventListener("click", () => { ex = btn.dataset.ex; press(eB, btn); const [p, a, b] = EX[ex]; pIn.value = p; aIn.value = a; bIn.value = b; render(); }));
    [pIn, aIn, bIn].forEach((el) => el.addEventListener("input", () => { ex = null; eB.forEach((btn) => btn.setAttribute("aria-pressed", "false")); render(); }));
    render();
  })();

  /* 2. Naive Bayes spam: combining clues */
  (function spam() {
    const root = document.getElementById("viz-spam");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), box = $(root, "[data-clues]");
    const PRIOR = 0.4;
    const CL = [
      ["Contains the word \"offer\"", 0.9, 0.15],
      ["Contains the word \"free\"", 0.6, 0.08],
      ["Contains a link", 0.8, 0.5],
      ["Sender is in your contacts", 0.05, 0.6],
      ["Sent at 3 a.m.", 0.3, 0.05],
      ["Greets you by name", 0.2, 0.7],
    ];
    const st = CL.map(() => 0); // 0 unknown, 1 yes, 2 no
    const LAB = ["not set", "yes", "no"];
    function render() {
      box.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Clue</th><th>P(clue | spam)</th><th>P(clue | not spam)</th><th>This email</th></tr></thead><tbody>${CL.map(([n, a, b], i) => `<tr><td><b>${n}</b></td><td>${a}</td><td>${b}</td><td><button class="btn" data-c="${i}" style="min-width:6rem;${st[i] === 1 ? "background:var(--accent);border-color:var(--accent);color:#fff" : st[i] === 2 ? "background:#fde7ec;border-color:#d94f70;color:#a3203f" : ""}">${LAB[st[i]]}</button></td></tr>`).join("")}</tbody></table></div>`;
      const steps = [["Prior", PRIOR, null]];
      let ps = PRIOR, pn = 1 - PRIOR;
      CL.forEach(([n, a, b], i) => { if (!st[i]) return; const la = st[i] === 1 ? a : 1 - a, lb = st[i] === 1 ? b : 1 - b; ps *= la; pn *= lb; steps.push([n.replace("Contains the word ", "").replace(/"/g, "") + (st[i] === 2 ? " (no)" : ""), ps / (ps + pn), la / lb]); });
      const W = 640, L = 40, Rt = 20, T = 20, B = 170, bw = Math.min(90, (W - L - Rt) / steps.length - 10), Y = (v) => B - v * (B - T);
      let g = "";
      for (let v = 0; v <= 1.001; v += 0.25) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 6, Y(v) + 4, pct(v), { anchor: "end", size: 10 });
      g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(0.5)}" y2="${Y(0.5)}" stroke="${C.soft}" stroke-dasharray="4 3"/>`;
      steps.forEach(([n, v, lr], i) => {
        const x = L + 10 + i * (bw + 10);
        g += `<rect x="${x}" y="${Y(v)}" width="${bw}" height="${B - Y(v)}" rx="5" fill="${v >= 0.5 ? C.rose : C.accent}" opacity="${i === steps.length - 1 ? 1 : 0.55}"/>` + txt(x + bw / 2, Y(v) - 5, pct(v, 1), { anchor: "middle", fill: C.ink, bold: 1, size: 10.5 });
        g += txt(x + bw / 2, B + 14, n.length > 14 ? n.slice(0, 13) + "…" : n, { anchor: "middle", size: 9.5, fill: C.ink });
        if (lr) g += txt(x + bw / 2, B + 28, "× " + (lr >= 1 ? lr.toFixed(1) : lr.toFixed(2)), { anchor: "middle", size: 9.5, fill: lr >= 1 ? C.rose : C.accent, bold: 1 });
      });
      g += txt(L + 4, 14, "P(spam) after each clue · × = likelihood ratio", { size: 10 });
      svg.innerHTML = g;
      const used = CL.map((c, i) => [c, i]).filter(([, i]) => st[i]);
      const post = steps[steps.length - 1][1];
      out.innerHTML = used.length
        ? `<div class="formula">P(spam | clues) ∝ ${PRIOR} × ${used.map(([[, a], i]) => (st[i] === 1 ? a : +(1 - a).toFixed(2))).join(" × ")} = ${ps.toExponential(2)} &nbsp;·&nbsp; P(not spam | clues) ∝ ${(1 - PRIOR).toFixed(1)} × ${used.map(([[, , b], i]) => (st[i] === 1 ? b : +(1 - b).toFixed(2))).join(" × ")} = ${pn.toExponential(2)}</div><p>Normalizing: P(spam) = ${ps.toExponential(2)} ÷ (${ps.toExponential(2)} + ${pn.toExponential(2)}) = <b>${pct(post, 1)}</b> → ${post >= 0.5 ? "<b>send to the spam folder</b>" : "<b>keep in the inbox</b>"}. Clues with a likelihood ratio far from 1 move the belief most. The order doesn't matter: multiplication gives the same answer either way. This assumes the clues are independent given spam or not spam, which is the naive part of naive Bayes.</p>`
        : `<p>With no clues set, the belief is just the prior: 40% of email is spam. Click a clue's button to cycle through yes, no and not set.</p>`;
    }
    box.addEventListener("click", (e) => { const b = e.target.closest("[data-c]"); if (!b) return; const i = +b.dataset.c; st[i] = (st[i] + 1) % 3; render(); });
    render();
  })();

  /* 3. Belief narrowing: Beta updating */
  (function narrow() {
    const root = document.getElementById("viz-narrow");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), rv = $(root, "[data-reveal]"), pB = $$(root, "[data-prior]");
    let prior = "flat", truth, s, n, hist, reveal = false;
    const P0 = { flat: [1, 1], wrong: [40, 60] };
    const reset = () => { truth = 0.06 + Math.random() * 0.16; s = 0; n = 0; hist = []; };
    const pdf = (x, a, b) => (x <= 0 || x >= 1 ? 0 : Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) + lgamma(a + b) - lgamma(a) - lgamma(b)));
    const betaQ = (q, a, b) => { const xs = []; let cum = 0; const dx = 0.0005; for (let x = dx / 2; x < 1; x += dx) { cum += pdf(x, a, b) * dx; if (cum >= q) return x; } return 1; };
    function render() {
      const [a0, b0] = P0[prior], a = a0 + s, b = b0 + n - s, mean = a / (a + b), lo = betaQ(0.025, a, b), hi = betaQ(0.975, a, b);
      const W = 640, L = 30, Rt = 20, T = 20, B = 210, xs = []; for (let x = 0.001; x < 1; x += 0.0025) xs.push(x);
      const curves = [...hist.slice(-3), [a0, b0], [a, b]];
      const ym = Math.max(...curves.map(([aa, bb]) => Math.max(...xs.map((x) => pdf(x, aa, bb))))) * 1.08;
      const X = (v) => L + v * (W - L - Rt), Y = (v) => B - (v / ym) * (B - T);
      let g = "";
      for (let v = 0; v <= 1.001; v += 0.1) g += txt(X(v), B + 16, pct(v), { anchor: "middle", size: 10 });
      g += txt((W + L) / 2, B + 34, "Conversion rate", { anchor: "middle" });
      g += `<path d="M${X(lo)},${Y(0)} ${xs.filter((x) => x >= lo && x <= hi).map((x) => `L${X(x)},${Y(pdf(x, a, b))}`).join(" ")} L${X(hi)},${Y(0)} Z" fill="${C.violet}" opacity=".15"/>`;
      g += `<polyline points="${xs.map((x) => `${X(x)},${Y(pdf(x, a0, b0))}`).join(" ")}" fill="none" stroke="${C.soft}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
      hist.slice(-3).forEach(([aa, bb], i) => (g += `<polyline points="${xs.map((x) => `${X(x)},${Y(pdf(x, aa, bb))}`).join(" ")}" fill="none" stroke="${C.violet}" stroke-width="1.2" opacity="${0.2 + i * 0.15}"/>`));
      g += `<polyline points="${xs.map((x) => `${X(x)},${Y(pdf(x, a, b))}`).join(" ")}" fill="none" stroke="${C.violet}" stroke-width="3"/>`;
      g += `<line x1="${L}" x2="${W - Rt}" y1="${B}" y2="${B}" stroke="${C.line}"/>`;
      if (reveal) g += `<line x1="${X(truth)}" x2="${X(truth)}" y1="${T}" y2="${B}" stroke="${C.rose}" stroke-width="2.5"/>` + txt(X(truth) + 5, T + 10, "true rate " + pct(truth, 1), { fill: C.rose, bold: 1 });
      g += txt(W - Rt, T + 4, "dashed: prior · faint: earlier beliefs · bold: current", { anchor: "end", size: 10 });
      svg.innerHTML = g;
      out.innerHTML = `<p>${n ? `After <b>${n.toLocaleString("en-IN")}</b> visitors and <b>${s}</b> conversions, the best estimate is ${pct(mean, 1)}, and the rate is 95% likely to lie between ${pct(lo, 1)} and ${pct(hi, 1)} (shaded).` : "No evidence yet: the curve is just the prior."} ${prior === "wrong" && n < 200 ? "A confident but wrong prior takes a lot of evidence to overcome; this is the 'overconfidence in prior assumptions' challenge." : prior === "flat" && !n ? "Knowing nothing, every rate is equally plausible." : n >= 300 ? "With plenty of evidence, the belief is sharp and the prior barely matters." : "Each batch of evidence narrows the belief and shifts it toward the data."}</p>`;
    }
    $$(root, "[data-obs]").forEach((btn) => btn.addEventListener("click", () => { hist.push([P0[prior][0] + s, P0[prior][1] + n - s]); const k = +btn.dataset.obs; for (let i = 0; i < k; i++) if (Math.random() < truth) s++; n += k; render(); }));
    $(root, "[data-reset]").addEventListener("click", () => { reset(); render(); });
    rv.addEventListener("click", () => { reveal = !reveal; rv.setAttribute("aria-pressed", String(reveal)); render(); });
    pB.forEach((btn) => btn.addEventListener("click", () => { prior = btn.dataset.prior; press(pB, btn); const keep = truth; reset(); truth = keep; render(); }));
    reset(); render();
  })();

  /* 4. Dependent evidence */
  (function dep() {
    const root = document.getElementById("viz-dep");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), rIn = $(root, '[data-in="r"]');
    const P = 0.05, A = 0.9, B = 0.2;
    const post = (lh, ln) => (lh * P) / (lh * P + ln * (1 - P));
    function render() {
      const r = +rIn.value / 100; $(root, '[data-out="r"]').textContent = Math.round(r * 100) + "%";
      const one = post(A, B), naive = post(A * A, B * B), jointH = A * (r + (1 - r) * A), jointN = B * (r + (1 - r) * B), correct = post(jointH, jointN);
      const rows = [["Prior", P, C.soft], ["After one positive test", one, C.accent], ["Two positives, correct (joint)", correct, C.violet], ["Two positives, naive product", naive, C.rose]];
      const L = 230, R = 560;
      let g = "";
      rows.forEach(([lab, v, col], i) => { const y = 20 + i * 44; g += txt(L - 12, y + 16, lab, { anchor: "end", fill: C.ink, bold: 1, size: 11.5 }) + `<rect x="${L}" y="${y}" width="${R - L}" height="24" rx="8" fill="${C.grid}"/><rect x="${L}" y="${y}" width="${(R - L) * v}" height="24" rx="8" fill="${col}"/>` + txt(L + (R - L) * v + 8, y + 17, pct(v, 1), { fill: C.ink, bold: 1, size: 12 }); });
      svg.innerHTML = g;
      out.innerHTML = `<div class="formula">Correct: P(E₁, E₂ | disease) = P(E₁ | D) × P(E₂ | E₁, D) = 0.9 × ${(r + (1 - r) * A).toFixed(2)} = ${jointH.toFixed(3)} &nbsp;·&nbsp; Naive: 0.9 × 0.9 = 0.81</div><p>${r === 0 ? "With no overlap the tests really are independent given the disease, so the naive product is exactly right: the second test is genuinely new evidence." : r >= 0.99 ? `With complete overlap, the second test adds nothing: the correct posterior equals the one-test posterior (${pct(one, 1)}). The naive product still claims ${pct(naive, 1)}, counting the same evidence twice.` : `With ${Math.round(r * 100)}% overlap, the second result is partly a repeat of the first. The correct posterior is ${pct(correct, 1)}, but multiplying as if independent gives ${pct(naive, 1)}: overconfident.`} Bayesian networks avoid this by modelling how the pieces of evidence depend on each other.</p>`;
    }
    rIn.addEventListener("input", render);
    render();
  })();

  /* 5. Bayesian network by exact enumeration */
  (function bn() {
    const root = document.getElementById("viz-bn");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out");
    const V = ["S", "F", "L", "C", "X"];
    const NAME = { S: "Smoker", F: "Has flu", L: "Lung disease", C: "Cough", X: "Abnormal X-ray" };
    const POS = { S: [150, 50], F: [490, 50], L: [150, 160], C: [400, 270], X: [150, 270] };
    const pS = 0.3, pF = 0.1, pL = { 1: 0.1, 0: 0.01 }, pC = { "11": 0.95, "10": 0.8, "01": 0.7, "00": 0.05 }, pX = { 1: 0.9, 0: 0.05 };
    const joint = (s, f, l, c, x) => (s ? pS : 1 - pS) * (f ? pF : 1 - pF) * (l ? pL[s] : 1 - pL[s]) * (c ? pC["" + l + f] : 1 - pC["" + l + f]) * (x ? pX[l] : 1 - pX[l]);
    const ev = { S: null, F: null, L: null, C: null, X: null };
    const marg = () => { const tot = { S: 0, F: 0, L: 0, C: 0, X: 0 }; let Z = 0; for (let m = 0; m < 32; m++) { const v = { S: m & 1, F: (m >> 1) & 1, L: (m >> 2) & 1, C: (m >> 3) & 1, X: (m >> 4) & 1 }; if (V.some((k) => ev[k] !== null && ev[k] !== v[k])) continue; const p = joint(v.S, v.F, v.L, v.C, v.X); Z += p; V.forEach((k) => { if (v[k]) tot[k] += p; }); } V.forEach((k) => (tot[k] /= Z)); return tot; };
    const base = (() => { const sv = { ...ev }; V.forEach((k) => (ev[k] = null)); const m = marg(); Object.assign(ev, sv); return m; })();
    function render() {
      const m = marg();
      let g = `<defs><marker id="bnar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${C.soft}"/></marker></defs>`;
      [["S", "L"], ["L", "C"], ["F", "C"], ["L", "X"]].forEach(([a, b]) => { const [x1, y1] = POS[a], [x2, y2] = POS[b], dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy), ox = (dx / d), oy = (dy / d); g += `<line x1="${x1 + ox * 40}" y1="${y1 + oy * 34}" x2="${x2 - ox * 70}" y2="${y2 - oy * 38}" stroke="${C.soft}" stroke-width="2" marker-end="url(#bnar)"/>`; });
      V.forEach((k) => {
        const [x, y] = POS[k], e = ev[k], w = 150, h = 58;
        g += `<g data-n="${k}" style="cursor:pointer"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="12" fill="${e === null ? "#fff" : e ? "#e0f3f0" : "#fde7ec"}" stroke="${e === null ? C.line : e ? C.accent : C.rose}" stroke-width="${e === null ? 1.5 : 3}"/>`;
        g += txt(x, y - 10, NAME[k], { anchor: "middle", fill: C.ink, bold: 1, size: 12 }) + `<rect x="${x - w / 2 + 12}" y="${y + 1}" width="${w - 60}" height="10" rx="5" fill="${C.grid}"/><rect x="${x - w / 2 + 12}" y="${y + 1}" width="${(w - 60) * m[k]}" height="10" rx="5" fill="${e === null ? C.violet : e ? C.accent : C.rose}"/>` + txt(x + w / 2 - 12, y + 11, pct(m[k], 1), { anchor: "end", fill: C.ink, bold: 1, size: 11 });
        g += txt(x, y + 24, e === null ? "click to observe" : e ? "observed: yes" : "observed: no", { anchor: "middle", size: 9.5, fill: e === null ? C.soft : e ? C.accent : C.rose, bold: e !== null }) + `</g>`;
      });
      svg.innerHTML = g;
      const set = V.filter((k) => ev[k] !== null), q = V.filter((k) => ev[k] === null);
      let msg;
      if (!set.length) msg = `With no evidence, each bar shows the base rate: ${pct(m.L, 1)} of people have lung disease, and ${pct(m.C, 1)} have a cough.`;
      else if (ev.C === 1 && ev.F === 1 && ev.L === null) msg = `<b>Explaining away (abductive reasoning):</b> knowing the patient has flu provides a good explanation for the cough, so lung disease drops back to ${pct(m.L, 1)}. Flu and lung disease were independent until we observed their common effect.`;
      else if (ev.C === 1 && ev.L === null) msg = `<b>Backward (diagnostic) reasoning:</b> a cough raises lung disease from ${pct(base.L, 1)} to ${pct(m.L, 1)}, and flu from ${pct(base.F, 1)} to ${pct(m.F, 1)}, since either could explain it. Evidence even flows back up to smoking (${pct(m.S, 1)}). Now observe the flu.`;
      else if (ev.S === 1 && set.length === 1) msg = `<b>Forward (predictive) reasoning:</b> being a smoker raises lung disease from ${pct(base.L, 1)} to ${pct(m.L, 1)}, and with it the chance of a cough (${pct(m.C, 1)}) and an abnormal X-ray (${pct(m.X, 1)}).`;
      else msg = `Given ${set.map((k) => `${NAME[k].toLowerCase()} = ${ev[k] ? "yes" : "no"}`).join(", ")}: ${q.map((k) => `${NAME[k].toLowerCase()} ${pct(m[k], 1)}`).join(", ")}.`;
      out.innerHTML = `<p>${msg}</p><p class="tree-note" style="margin:.4rem 0 0">Computed exactly by adding up all 32 combinations of the five variables that agree with the evidence. Probabilities are illustrative.</p>`;
    }
    svg.addEventListener("click", (e) => { const n = e.target.closest("[data-n]"); if (!n) return; const k = n.dataset.n; ev[k] = ev[k] === null ? 1 : ev[k] === 1 ? 0 : null; render(); });
    $$(root, "[data-sc]").forEach((b) => b.addEventListener("click", () => { V.forEach((k) => (ev[k] = null)); const sc = b.dataset.sc; if (sc === "fwd") ev.S = 1; if (sc === "back") ev.C = 1; if (sc === "explain") { ev.C = 1; ev.F = 1; } render(); }));
    render();
  })();

  /* 6. Markov model */
  (function markov() {
    const root = document.getElementById("viz-markov");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out");
    const [arIn, raIn, rcIn] = ["ar", "ra", "rc"].map((k) => $(root, `[data-in="${k}"]`));
    function render(changed) {
      let ar = +arIn.value / 100, ra = +raIn.value / 100, rc = +rcIn.value / 100;
      if (ra + rc > 1) { if (changed === raIn) { rc = 1 - ra; rcIn.value = Math.round(rc * 100); } else { ra = 1 - rc; raIn.value = Math.round(ra * 100); } }
      $(root, '[data-out="ar"]').textContent = pct(ar); $(root, '[data-out="ra"]').textContent = pct(ra); $(root, '[data-out="rc"]').textContent = pct(rc);
      const rr = 1 - ra - rc, aa = 1 - ar;
      const hist = [[1000, 0, 0]];
      for (let t = 1; t <= 12; t++) { const [A, R, Ch] = hist[t - 1]; hist.push([A * aa + R * ra, A * ar + R * rr, Ch + R * rc]); }
      let g = `<defs><marker id="mk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${C.soft}"/></marker></defs>`;
      const N = { A: [60, 70, "Active", C.accent], R: [200, 70, "At risk", C.amber], Ch: [130, 215, "Churned", C.rose] };
      const arc = (x1, y1, x2, y2, bend, lab, lx, ly) => `<path d="M${x1},${y1} Q${(x1 + x2) / 2 + bend[0]},${(y1 + y2) / 2 + bend[1]} ${x2},${y2}" fill="none" stroke="${C.soft}" stroke-width="1.8" marker-end="url(#mk)"/>` + txt(lx, ly, lab, { anchor: "middle", fill: C.ink, bold: 1, size: 10.5 });
      g += arc(92, 58, 168, 58, [0, -26], pct(ar), 130, 34) + arc(168, 84, 92, 84, [0, 26], pct(ra), 130, 112) + arc(196, 102, 150, 188, [18, 0], pct(rc), 196, 156);
      g += txt(60, 26, "stay " + pct(aa), { anchor: "middle", size: 9.5 }) + txt(236, 26, "stay " + pct(rr), { anchor: "middle", size: 9.5 }) + txt(130, 262, "stays churned", { anchor: "middle", size: 9.5 });
      Object.values(N).forEach(([x, y, lab, col]) => (g += `<circle cx="${x}" cy="${y}" r="30" fill="${col}" opacity=".9"/>` + txt(x, y + 4, lab, { anchor: "middle", fill: "#fff", bold: 1, size: 11 })));
      const L = 300, R = 624, T = 20, B = 260, X = (t) => L + (t / 12) * (R - L), Y = (v) => B - (v / 1000) * (B - T);
      for (let v = 0; v <= 1000; v += 250) g += `<line x1="${L}" x2="${R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 6, Y(v) + 4, v, { anchor: "end", size: 9.5 });
      for (let t = 0; t <= 12; t += 2) g += txt(X(t), B + 14, t, { anchor: "middle", size: 10 });
      g += txt((L + R) / 2, B + 30, "Month", { anchor: "middle", size: 10 });
      const band = (lo, hi, col) => `<path d="M${hist.map((h, t) => `${X(t)},${Y(hi(h))}`).join(" L")} L${[...hist].reverse().map((h, i) => `${X(12 - i)},${Y(lo(h))}`).join(" L")} Z" fill="${col}" opacity=".85"/>`;
      g += band(() => 0, (h) => h[0], C.accent) + band((h) => h[0], (h) => h[0] + h[1], C.amber) + band((h) => h[0] + h[1], () => 1000, C.rose);
      svg.innerHTML = g;
      const e = hist[12]; // expected months to churn from Active solved below
      let tA = Infinity; if (rc > 0 && ar > 0) { const a11 = ar, a12 = -ar, a21 = -ra, a22 = ra + rc; const dd = a11 * a22 - a12 * a21; tA = (a22 - a12) / dd; }
      out.innerHTML = `<p>After 12 months: <b>${Math.round(e[0])}</b> active, <b>${Math.round(e[1])}</b> at risk, <b>${Math.round(e[2])}</b> churned. ${rc === 0 ? "With no path to churn, nobody ever leaves." : `Because churn is absorbing (no one comes back in this model), everyone eventually churns; a customer who starts active stays about <b>${tA.toFixed(1)} months</b> on average.`} Raising the win-back rate lengthens that lifetime, which is what a retention campaign is worth. The model only needs the current state to predict the next, the Markov property; the same idea predicts the next word in a sentence or the next move in a stock.</p>`;
    }
    [arIn, raIn, rcIn].forEach((el) => el.addEventListener("input", () => render(el)));
    render();
  })();
})();
