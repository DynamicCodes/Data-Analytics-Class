// Session 14 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const gauss = (r) => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const quant = (a, p) => { const s = [...a].sort((x, y) => x - y), i = (s.length - 1) * p, lo = Math.floor(i); return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo); };
  const pct1 = (v) => (v * 100).toFixed(1) + "%";

  /* 1. Visualization gallery */
  (function gallery() {
    const root = document.getElementById("viz-gallery");
    if (!root) return;
    const bar = $(root, ".controls"), svg = $(root, "svg"), out = $(root, ".viz-out");
    const r = rng(14);
    const SEG = [
      { k: "A", name: "A", col: C.accent, n: 250, def: 3, inc: 18, hist: 12, score: 780, emp: 11 },
      { k: "B", name: "B", col: C.amber, n: 375, def: 18, inc: 9.5, hist: 7, score: 700, emp: 7 },
      { k: "C", name: "C", col: C.rose, n: 280, def: 35, inc: 4.5, hist: 2.5, score: 610, emp: 3 },
    ];
    const P = [];
    SEG.forEach((s, si) => { for (let i = 0; i < s.n; i++) P.push({ s: si, inc: Math.max(1.5, s.inc * (1 + gauss(r) * 0.22)), hist: Math.max(0.2, s.hist + gauss(r) * 2.2), score: Math.min(850, Math.max(450, s.score + gauss(r) * 38)), emp: Math.max(0, s.emp + gauss(r) * 2.5), def: i < s.def }); });
    const N = P.length, FEAT = [["inc", "Income (₹ lakh)"], ["hist", "Credit history (yrs)"], ["score", "Credit score"], ["emp", "Years employed"]];
    const rng2 = (k) => [Math.min(...P.map((p) => p[k])), Math.max(...P.map((p) => p[k]))];
    const R2 = Object.fromEntries(FEAT.map(([k]) => [k, rng2(k)]));
    const norm = (p, k) => (p[k] - R2[k][0]) / (R2[k][1] - R2[k][0]);
    const segMean = (si, k) => mean(P.filter((p) => p.s === si).map((p) => p[k]));
    // PCA (top 2 components of standardized data, by power iteration)
    const Z = P.map((p) => FEAT.map(([k]) => { const m = mean(P.map((q) => q[k])), sd = Math.sqrt(mean(P.map((q) => (q[k] - m) ** 2))); return (p[k] - m) / sd; }));
    const cov = FEAT.map((_, a) => FEAT.map((_, b) => mean(Z.map((z) => z[a] * z[b]))));
    const power = (M, avoid) => { let v = [1, 0.5, 0.2, 0.1]; for (let it = 0; it < 200; it++) { let w = M.map((row) => row.reduce((s, x, j) => s + x * v[j], 0)); if (avoid) { const d = w.reduce((s, x, j) => s + x * avoid[j], 0); w = w.map((x, j) => x - d * avoid[j]); } const nrm = Math.hypot(...w); v = w.map((x) => x / nrm); } return v; };
    const pc1 = power(cov), pc2 = power(cov, pc1);
    const proj = Z.map((z) => [z.reduce((s, x, j) => s + x * pc1[j], 0), z.reduce((s, x, j) => s + x * pc2[j], 0)]);
    const W = 640, H = 290;
    const V = {
      tree: ["Tree diagram", "Structure: the rules that define each segment. Trace a path from the root to see why a borrower lands in a segment.", () => {
        const box = (x, y, t1, t2, col) => `<rect x="${x - 88}" y="${y}" width="176" height="46" rx="10" fill="#fff" stroke="${col || C.line}" stroke-width="2"/>` + txt(x, y + 19, t1, { anchor: "middle", fill: C.ink, bold: 1 }) + txt(x, y + 35, t2, { anchor: "middle", size: 10.5 });
        const ln = (x1, y1, x2, y2, l) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.line}" stroke-width="2"/>` + txt((x1 + x2) / 2 + (x2 > x1 ? 6 : -6), (y1 + y2) / 2, l, { anchor: x2 > x1 ? "start" : "end", fill: C.ink, size: 10.5 });
        return ln(320, 56, 170, 120, "income ≥ ₹12L") + ln(320, 56, 470, 120, "income < ₹12L") + ln(470, 166, 365, 220, "history ≥ 4 yrs") + ln(470, 166, 560, 220, "history < 4 yrs") + box(320, 10, "All borrowers", `${N} · default ${pct1(SEG.reduce((t, x) => t + x.def, 0) / N)}`) + box(170, 120, "Segment A", `${SEG[0].n} · default 1.2%`, C.accent) + box(470, 120, "Income < ₹12L", `${SEG[1].n + SEG[2].n} borrowers`) + box(365, 220, "Segment B", `${SEG[1].n} · default 4.8%`, C.amber) + box(555, 220, "Segment C", `${SEG[2].n} · default 12.5%`, C.rose);
      }],
      bar: ["Bar chart", "Performance: the default rate per segment, the single most important comparison for a risk team.", () => {
        let g = ""; const Y = (v) => 250 - (v / 0.15) * 220;
        for (let v = 0; v <= 0.15; v += 0.05) g += `<line x1="70" x2="620" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(62, Y(v) + 4, Math.round(v * 100) + "%", { anchor: "end" });
        SEG.forEach((s, i) => { const x = 120 + i * 170, v = s.def / s.n; g += `<rect x="${x}" y="${Y(v)}" width="100" height="${Y(0) - Y(v)}" rx="6" fill="${s.col}"/>` + txt(x + 50, Y(v) - 8, pct1(v), { anchor: "middle", fill: C.ink, bold: 1, size: 13 }) + txt(x + 50, 270, "Segment " + s.k, { anchor: "middle", fill: C.ink }); });
        return g + txt(70, 16, "Default rate", { fill: C.ink, bold: 1 });
      }],
      pie: ["Donut chart", "Composition: how big each segment is. Segment B is the largest group; C is smaller but carries most of the risk.", () => {
        let g = "", a0 = -Math.PI / 2; const cx = 200, cy = 145, R = 115, r0 = 62;
        SEG.forEach((s) => { const a1 = a0 + (s.n / N) * 2 * Math.PI, big = a1 - a0 > Math.PI ? 1 : 0, p = (a, rr) => `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`; g += `<path d="M${p(a0, R)} A${R},${R} 0 ${big} 1 ${p(a1, R)} L${p(a1, r0)} A${r0},${r0} 0 ${big} 0 ${p(a0, r0)} Z" fill="${s.col}" stroke="#fff" stroke-width="3"/>`; const am = (a0 + a1) / 2; g += txt(cx + 89 * Math.cos(am), cy + 89 * Math.sin(am) + 4, Math.round((s.n / N) * 100) + "%", { anchor: "middle", fill: "#fff", bold: 1, size: 13 }); a0 = a1; });
        g += txt(cx, cy - 2, N, { anchor: "middle", fill: C.ink, bold: 1, size: 20 }) + txt(cx, cy + 16, "borrowers", { anchor: "middle" });
        const defs = SEG.reduce((s, x) => s + x.def, 0);
        SEG.forEach((s, i) => (g += `<rect x="380" y="${70 + i * 50}" width="16" height="16" rx="4" fill="${s.col}"/>` + txt(406, 83 + i * 50, `Segment ${s.k}: ${s.n} borrowers`, { fill: C.ink, bold: 1, size: 12 }) + txt(406, 99 + i * 50, `${Math.round((s.def / defs) * 100)}% of all defaults`, { size: 10.5 })));
        return g;
      }],
      scatter: ["2D segment map", "Separation: income against credit history, one dot per borrower. Little overlap between colors means the segments are genuinely distinct.", () => {
        let g = ""; const X = (v) => 60 + (v / 30) * 560, Y = (v) => 260 - (v / 20) * 240;
        for (let v = 0; v <= 20; v += 5) g += `<line x1="60" x2="620" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(52, Y(v) + 4, v, { anchor: "end" });
        for (let v = 0; v <= 30; v += 5) g += txt(X(v), 278, v, { anchor: "middle" });
        P.forEach((p) => (g += `<circle cx="${X(Math.min(30, p.inc))}" cy="${Y(Math.min(20, p.hist))}" r="3" fill="${SEG[p.s].col}" opacity=".55"/>`));
        return g + txt(620, 272, "Income (₹ lakh)", { anchor: "end", size: 10 }) + txt(60, 14, "Credit history (years)", { size: 10 });
      }],
      parallel: ["Parallel coordinates", "Multi-dimensional profile: each line is a borrower across four attributes. Segments with similar line patterns share behavior; A runs high on every axis, C low.", () => {
        let g = ""; const xs = FEAT.map((_, i) => 80 + i * 160), Y = (v) => 250 - v * 220;
        const r3 = rng(3); P.filter(() => r3() < 0.18).forEach((p) => (g += `<polyline points="${FEAT.map(([k], i) => `${xs[i]},${Y(norm(p, k))}`).join(" ")}" fill="none" stroke="${SEG[p.s].col}" stroke-width="1" opacity=".35"/>`));
        FEAT.forEach(([, l], i) => (g += `<line x1="${xs[i]}" x2="${xs[i]}" y1="${Y(1)}" y2="${Y(0)}" stroke="${C.ink}" stroke-width="1.5"/>` + txt(xs[i], 272, l, { anchor: "middle", fill: C.ink, bold: 1, size: 10.5 }) + txt(xs[i] + 4, Y(1) - 4, "high", { size: 9 }) + txt(xs[i] + 4, Y(0) + 12, "low", { size: 9 })));
        return g;
      }],
      heat: ["Heatmap", "Attribute strength: average values per segment, shaded relative to the other segments. Darker cells show which attributes set a segment apart.", () => {
        let g = ""; const cw = 118, ch = 58, x0 = 150, y0 = 30;
        FEAT.forEach(([k, l], j) => { g += txt(x0 + j * cw + cw / 2, y0 - 10, l, { anchor: "middle", fill: C.ink, bold: 1, size: 10.5 }); const ms = SEG.map((_, si) => segMean(si, k)), lo = Math.min(...ms), hi = Math.max(...ms); ms.forEach((m, si) => { const t = (m - lo) / (hi - lo || 1); g += `<rect x="${x0 + j * cw + 2}" y="${y0 + si * ch + 2}" width="${cw - 4}" height="${ch - 4}" rx="8" fill="rgb(${Math.round(233 - t * 219)},${Math.round(245 - t * 105)},${Math.round(243 - t * 116)})"/>` + txt(x0 + j * cw + cw / 2, y0 + si * ch + ch / 2 + 5, k === "score" ? Math.round(m) : m.toFixed(1), { anchor: "middle", fill: t > 0.55 ? "#fff" : C.ink, bold: 1, size: 13 }); }); });
        SEG.forEach((s, si) => (g += txt(x0 - 12, y0 + si * ch + ch / 2 + 5, "Segment " + s.k, { anchor: "end", fill: s.col, bold: 1, size: 12 })));
        return g + txt(x0, y0 + 3 * ch + 24, "Default rate: A 1.2% · B 4.8% · C 12.5%", { fill: C.ink, size: 11 });
      }],
      box: ["Box plots", "Within-segment spread: income by segment. Different medians with little overlap mean income differentiates the segments strongly; box width shows how consistent each segment is.", () => {
        let g = ""; const Y = (v) => 250 - (v / 30) * 225;
        for (let v = 0; v <= 30; v += 5) g += `<line x1="70" x2="620" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(62, Y(v) + 4, v, { anchor: "end" });
        SEG.forEach((s, si) => { const v = P.filter((p) => p.s === si).map((p) => p.inc), q1 = quant(v, 0.25), md = quant(v, 0.5), q3 = quant(v, 0.75), lo = quant(v, 0.02), hi = quant(v, 0.98), cx = 170 + si * 170; g += `<line x1="${cx}" x2="${cx}" y1="${Y(Math.min(30, hi))}" y2="${Y(lo)}" stroke="${C.ink}"/><rect x="${cx - 45}" y="${Y(q3)}" width="90" height="${Y(q1) - Y(q3)}" rx="6" fill="${s.col}" opacity=".3" stroke="${s.col}" stroke-width="2"/><line x1="${cx - 45}" x2="${cx + 45}" y1="${Y(md)}" y2="${Y(md)}" stroke="${s.col}" stroke-width="3"/>` + txt(cx, 272, "Segment " + s.k, { anchor: "middle", fill: C.ink }); });
        return g + txt(70, 16, "Income (₹ lakh)", { fill: C.ink, bold: 1 });
      }],
      radar: ["Radar chart", "Multi-attribute contrast: each polygon is a segment's average profile, scaled 0–1 per attribute. Very different shapes mean clearly different kinds of borrower.", () => {
        let g = ""; const cx = 320, cy = 150, R = 115, n = FEAT.length, ang = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
        [0.25, 0.5, 0.75, 1].forEach((t) => (g += `<polygon points="${FEAT.map((_, i) => `${cx + R * t * Math.cos(ang(i))},${cy + R * t * Math.sin(ang(i))}`).join(" ")}" fill="none" stroke="${C.grid}"/>`));
        FEAT.forEach(([, l], i) => (g += `<line x1="${cx}" y1="${cy}" x2="${cx + R * Math.cos(ang(i))}" y2="${cy + R * Math.sin(ang(i))}" stroke="${C.grid}"/>` + txt(cx + (R + 16) * Math.cos(ang(i)), cy + (R + 16) * Math.sin(ang(i)) + 4, l, { anchor: Math.abs(Math.cos(ang(i))) < 0.2 ? "middle" : Math.cos(ang(i)) > 0 ? "start" : "end", fill: C.ink, bold: 1, size: 10.5 })));
        SEG.forEach((s, si) => { const vals = FEAT.map(([k]) => { const lo = R2[k][0], hi = R2[k][1]; return (segMean(si, k) - lo) / (hi - lo); }); g += `<polygon points="${vals.map((v, i) => `${cx + R * v * Math.cos(ang(i))},${cy + R * v * Math.sin(ang(i))}`).join(" ")}" fill="${s.col}" fill-opacity=".18" stroke="${s.col}" stroke-width="2.5"/>`; });
        return g;
      }],
      lift: ["Gains chart", "Predictive power: reviewing borrowers segment by segment, riskiest first. Segment C alone is about a third of borrowers but contains most defaults; a random order would follow the diagonal.", () => {
        let g = ""; const L = 80, R = 600, T = 20, B = 250, X = (v) => L + v * (R - L), Y = (v) => B - v * (B - T);
        for (let v = 0; v <= 1.001; v += 0.25) g += `<line x1="${L}" x2="${R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, Math.round(v * 100) + "%", { anchor: "end" }) + txt(X(v), B + 16, Math.round(v * 100) + "%", { anchor: "middle" });
        const defs = SEG.reduce((s, x) => s + x.def, 0); let cx = 0, cy = 0; const pts = [[0, 0]];
        [2, 1, 0].forEach((si) => { cx += SEG[si].n / N; cy += SEG[si].def / defs; pts.push([cx, cy, si]); });
        g += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(1)}" stroke="${C.soft}" stroke-dasharray="5 4"/>`;
        g += `<polyline points="${pts.map(([a, b]) => `${X(a)},${Y(b)}`).join(" ")}" fill="none" stroke="${C.ink}" stroke-width="2.5"/>`;
        pts.slice(1).forEach(([a, b, si]) => (g += `<circle cx="${X(a)}" cy="${Y(b)}" r="7" fill="${SEG[si].col}"/>` + txt(X(a) + (a > 0.9 ? -10 : 10), Y(b) + 18, `+ ${SEG[si].k}: ${Math.round(b * 100)}% of defaults`, { fill: C.ink, size: 10.5, anchor: a > 0.9 ? "end" : "start" })));
        return g + txt((L + R) / 2, B + 32, "Share of borrowers reviewed", { anchor: "middle", size: 10.5 }) + txt(L, 14, "Share of defaults caught", { size: 10.5 });
      }],
      pca: ["PCA projection", "High-dimensional view: all four attributes compressed into two principal components. Well-separated color groups confirm real underlying differences between segments.", () => {
        let g = ""; const xs = proj.map((p) => p[0]), ys = proj.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
        const X = (v) => 40 + ((v - x0) / (x1 - x0)) * 560, Y = (v) => 260 - ((v - y0) / (y1 - y0)) * 235;
        proj.forEach((p, i) => (g += `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="3" fill="${SEG[P[i].s].col}" opacity=".55"/>`));
        return g + txt(600, 280, "Principal component 1", { anchor: "end", size: 10 }) + txt(40, 16, "Principal component 2", { size: 10 });
      }],
    };
    let cur = "tree";
    const btns = Object.entries(V).map(([k, [n]]) => { const b = document.createElement("button"); b.className = "btn"; b.textContent = n; b.addEventListener("click", () => { cur = k; press(btns, b); render(); }); bar.appendChild(b); return b; });
    press(btns, btns[0]);
    function render() { svg.innerHTML = V[cur][2](); out.innerHTML = `<h5>${V[cur][0]}</h5><p>${V[cur][1]}</p>`; }
    render();
  })();

  /* 2. Tree as rules */
  (function tree() {
    const root = document.getElementById("viz-tree");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), rulesT = $(root, "[data-rules]");
    const aB = $$(root, "[data-age]"), sB = $$(root, "[data-stu]"), iB = $$(root, "[data-inc]"), lap = $(root, "[data-lap]");
    let age = "young", stu = "yes", inc = "medium", smooth = false;
    const LEAF = [
      { id: 0, cond: "Age ≤ 30 AND Student = Yes", yes: 9, no: 1, x: 90 },
      { id: 1, cond: "Age ≤ 30 AND Student = No", yes: 3, no: 7, x: 245 },
      { id: 2, cond: "Age > 30 AND Income = High", yes: 2, no: 8, x: 395 },
      { id: 3, cond: "Age > 30 AND Income ≠ High", yes: 6, no: 4, x: 550 },
    ];
    const prob = (l) => (smooth ? (l.yes + 1) / (l.yes + l.no + 2) : l.yes / (l.yes + l.no));
    const leafOf = () => (age === "young" ? (stu === "yes" ? 0 : 1) : inc === "high" ? 2 : 3);
    function render() {
      const act = leafOf();
      const onPath = (node) => (node === "root") || (node === "L" && age === "young") || (node === "R" && age === "old");
      const box = (x, y, w, t1, t2, hot, col) => `<rect x="${x - w / 2}" y="${y}" width="${w}" height="46" rx="10" fill="${hot ? (col || C.ink) : "#fff"}" stroke="${hot ? (col || C.ink) : C.line}" stroke-width="2"/>` + txt(x, y + 19, t1, { anchor: "middle", fill: hot ? "#fff" : C.ink, bold: 1, size: 11 }) + txt(x, y + 35, t2, { anchor: "middle", fill: hot ? "#fff" : C.soft, size: 10 });
      const edge = (x1, y1, x2, y2, l, hot) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${hot ? C.ink : C.line}" stroke-width="${hot ? 3 : 2}"/>` + txt((x1 + x2) / 2 + (x2 > x1 ? 6 : -6), (y1 + y2) / 2, l, { anchor: x2 > x1 ? "start" : "end", fill: hot ? C.ink : C.soft, bold: hot, size: 10.5 });
      let g = "";
      g += edge(320, 56, 168, 110, "yes", age === "young") + edge(320, 56, 472, 110, "no", age === "old");
      g += edge(168, 156, 90, 206, "yes", age === "young" && stu === "yes") + edge(168, 156, 245, 206, "no", age === "young" && stu === "no");
      g += edge(472, 156, 395, 206, "yes", age === "old" && inc === "high") + edge(472, 156, 550, 206, "no", age === "old" && inc !== "high");
      g += box(320, 10, 170, "Age ≤ 30?", "root: all 40 people", true, C.violet);
      g += box(168, 110, 150, "Student?", "20 people", onPath("L"), C.violet) + box(472, 110, 150, "Income = High?", "20 people", onPath("R"), C.violet);
      LEAF.forEach((l) => { const p = prob(l), yesCls = p >= 0.5; g += `<g data-leaf="${l.id}" style="cursor:pointer">` + box(l.x, 206, 140, `Buys: ${yesCls ? "Yes" : "No"}`, `${l.yes} yes / ${l.no} no`, l.id === act, yesCls ? C.accent : C.rose) + `</g>`; });
      svg.innerHTML = g;
      const L = LEAF[act], p = prob(L), cls = p >= 0.5 ? "Yes" : "No", pc = cls === "Yes" ? p : 1 - p;
      out.innerHTML = `<p><b>Rule ${act + 1}:</b> IF ${L.cond.replace(" AND ", " AND ")} THEN Buys_Computer = <b>${cls}</b></p><div class="formula">P(${cls} | leaf) = ${smooth ? `(${cls === "Yes" ? L.yes : L.no} + 1) ÷ (${L.yes + L.no} + 2)` : `${cls === "Yes" ? L.yes : L.no} ÷ ${L.yes + L.no}`} = ${pc.toFixed(2)}</div><p>${age === "young" ? "Income doesn't matter on this path: the tree only asks about it for people over 30." : "Student status doesn't matter on this path: the tree only asks about it for people 30 or under."} ${smooth ? "Laplace smoothing pulls every probability slightly toward 0.5, most noticeably in small leaves." : ""}</p>`;
      rulesT.innerHTML = `<thead><tr><th>#</th><th>IF</th><th>THEN</th><th>Probability</th></tr></thead><tbody>${LEAF.map((l) => { const q = prob(l), c = q >= 0.5 ? "Yes" : "No"; return `<tr style="${l.id === act ? "background:var(--accent-soft);font-weight:700" : ""}"><td>${l.id + 1}</td><td>${l.cond}</td><td>Buys = ${c}</td><td>P(${c}) = ${(c === "Yes" ? q : 1 - q).toFixed(2)}</td></tr>`; }).join("")}</tbody>`;
    }
    aB.forEach((b) => b.addEventListener("click", () => { age = b.dataset.age; press(aB, b); render(); }));
    sB.forEach((b) => b.addEventListener("click", () => { stu = b.dataset.stu; press(sB, b); render(); }));
    iB.forEach((b) => b.addEventListener("click", () => { inc = b.dataset.inc; press(iB, b); render(); }));
    lap.addEventListener("click", () => { smooth = !smooth; lap.setAttribute("aria-pressed", String(smooth)); render(); });
    svg.addEventListener("click", (e) => {
      const g = e.target.closest("[data-leaf]"); if (!g) return;
      const id = +g.dataset.leaf;
      age = id < 2 ? "young" : "old"; if (id === 0) stu = "yes"; if (id === 1) stu = "no"; if (id === 2) inc = "high"; if (id === 3 && inc === "high") inc = "medium";
      press(aB, aB.find((b) => b.dataset.age === age)); press(sB, sB.find((b) => b.dataset.stu === stu)); press(iB, iB.find((b) => b.dataset.inc === inc));
      render();
    });
    render();
  })();

  /* 3. Loan rule regions */
  (function loan() {
    const root = document.getElementById("viz-loan");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), iIn = $(root, '[data-in="i"]'), cIn = $(root, '[data-in="c"]');
    const RULES = [
      ["Rule 1", "IF Income > 50,000 AND Credit_Score > 700 → Approved", (i, c) => i > 50000 && c > 700, C.accent, "Approved"],
      ["Rule 2", "IF Income ≤ 50,000 AND Credit_Score ≤ 600 → Denied", (i, c) => i <= 50000 && c <= 600, C.rose, "Denied"],
      ["Rule 3", "IF Income > 50,000 AND Credit_Score ≤ 700 → Review", (i, c) => i > 50000 && c <= 700, C.amber, "Review"],
    ];
    function render() {
      const inc = +iIn.value, cs = +cIn.value;
      $(root, '[data-out="i"]').textContent = inc.toLocaleString("en-IN"); $(root, '[data-out="c"]').textContent = cs;
      const L = 70, Rt = 20, T = 16, B = 244, X = (v) => L + ((v - 20000) / 80000) * (640 - L - Rt), Y = (v) => B - ((v - 450) / 400) * (B - T);
      let g = `<defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="${C.soft}" stroke-width="2" opacity=".35"/></pattern></defs>`;
      g += `<rect x="${X(50000)}" y="${Y(850)}" width="${X(100000) - X(50000)}" height="${Y(700) - Y(850)}" fill="${C.accent}" opacity=".22"/>`;
      g += `<rect x="${X(50000)}" y="${Y(700)}" width="${X(100000) - X(50000)}" height="${Y(450) - Y(700)}" fill="${C.amber}" opacity=".22"/>`;
      g += `<rect x="${X(20000)}" y="${Y(600)}" width="${X(50000) - X(20000)}" height="${Y(450) - Y(600)}" fill="${C.rose}" opacity=".22"/>`;
      g += `<rect x="${X(20000)}" y="${Y(850)}" width="${X(50000) - X(20000)}" height="${Y(600) - Y(850)}" fill="url(#hatch)" stroke="${C.soft}" stroke-dasharray="4 3"/>`;
      g += txt(X(75000), Y(780), "APPROVED (rule 1)", { anchor: "middle", fill: C.accent, bold: 1, size: 12 }) + txt(X(75000), Y(580), "REVIEW (rule 3)", { anchor: "middle", fill: C.amber, bold: 1, size: 12 }) + txt(X(35000), Y(520), "DENIED (rule 2)", { anchor: "middle", fill: C.rose, bold: 1, size: 12 }) + txt(X(35000), Y(730), "NO RULE", { anchor: "middle", fill: C.ink, bold: 1, size: 12 });
      for (let v = 20000; v <= 100000; v += 20000) g += txt(X(v), B + 16, "₹" + v / 1000 + "k", { anchor: "middle" });
      for (let v = 450; v <= 850; v += 100) g += txt(L - 8, Y(v) + 4, v, { anchor: "end" });
      g += txt((640 + L) / 2, B + 32, "Income", { anchor: "middle" }) + txt(L - 60, T - 4, "Credit score", { size: 10 });
      g += `<circle cx="${X(inc)}" cy="${Y(cs)}" r="9" fill="${C.ink}" stroke="#fff" stroke-width="3"/>`;
      svg.innerHTML = g;
      const fired = RULES.filter((rr) => rr[2](inc, cs));
      out.innerHTML = fired.length
        ? `<p><b>${fired[0][0]} fires:</b> ${fired[0][1]}. Decision: <b style="color:${fired[0][3]}">${fired[0][4]}</b>. Every decision comes with the rule that explains it.</p>`
        : `<p><b>No rule fires.</b> An applicant earning ₹50,000 or less with a credit score above 600 isn't covered by any of the three rules, so the system can't decide. Rule sets extracted from a full tree always cover every case; when rules are pruned or hand-edited, check <b>coverage</b> (every case gets a rule) and <b>consistency</b> (no case gets two conflicting rules). A fourth rule, such as "IF Income ≤ 50,000 AND Credit_Score > 600 → Review", would close the gap.</p>`;
    }
    [iIn, cIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* 4. Smoothing and forest averaging */
  (function prob() {
    const root = document.getElementById("viz-prob");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), ctl = $(root, "[data-pctl]"), mB = $$(root, "[data-pm]");
    let mode = "leaf", n = 3, nc = 3, trees = [], thr = 30;
    const growForest = () => { const r = rng(Math.floor(Math.random() * 1e6)); trees = Array.from({ length: 25 }, () => { const size = 3 + Math.floor(r() * 25); const p = Math.max(0, Math.min(1, 0.22 + gauss(r) * 0.14)); const k = Math.round(p * size); return { size, k, p: k / size }; }); };
    function controls() {
      ctl.innerHTML = mode === "leaf"
        ? `<label class="range">Samples in the leaf n <span data-out="n">${n}</span><input type="range" min="1" max="60" value="${n}" data-in="n" /></label><label class="range">"Yes" samples <span data-out="nc">${nc}</span><input type="range" min="0" max="${n}" value="${nc}" data-in="nc" /></label>`
        : `<button class="btn is-on" data-grow>Grow a new forest</button><label class="range">Approve if P(default) &lt; <span data-out="t">${(thr / 100).toFixed(2)}</span><input type="range" min="5" max="60" value="${thr}" data-in="t" /></label>`;
      ctl.querySelectorAll("input").forEach((el) => el.addEventListener("input", () => { if (el.dataset.in === "n") { n = +el.value; nc = Math.min(nc, n); const c2 = $(ctl, '[data-in="nc"]'); c2.max = n; c2.value = nc; } if (el.dataset.in === "nc") nc = +el.value; if (el.dataset.in === "t") thr = +el.value; render(); }));
      const gb = $(ctl, "[data-grow]"); if (gb) gb.addEventListener("click", () => { growForest(); render(); });
    }
    function render() {
      let g = "";
      if (mode === "leaf") {
        $(ctl, '[data-out="n"]').textContent = n; $(ctl, '[data-out="nc"]').textContent = nc;
        const raw = nc / n, sm = (nc + 1) / (n + 2);
        const L = 170, Rt = 60, X = (v) => L + v * (640 - L - Rt);
        [["Raw estimate", raw, C.violet, `${nc} ÷ ${n}`], ["Laplace smoothed", sm, C.accent, `(${nc} + 1) ÷ (${n} + 2)`]].forEach(([lab, v, col, f], i) => {
          const y = 40 + i * 80;
          g += txt(L - 12, y + 20, lab, { anchor: "end", fill: C.ink, bold: 1, size: 12 }) + txt(L - 12, y + 36, f, { anchor: "end", size: 10.5 });
          g += `<rect x="${L}" y="${y}" width="${640 - L - Rt}" height="34" rx="10" fill="${C.grid}"/><rect x="${L}" y="${y}" width="${Math.max(2, v * (640 - L - Rt))}" height="34" rx="10" fill="${col}"/>` + txt(L + Math.max(2, v * (640 - L - Rt)) + 8, y + 22, v.toFixed(3), { fill: C.ink, bold: 1, size: 13 });
        });
        for (let v = 0; v <= 1.001; v += 0.25) g += txt(X(v), 220, v.toFixed(2), { anchor: "middle" });
        svg.innerHTML = g;
        out.innerHTML = `<p>${n <= 5 && (nc === 0 || nc === n) ? `With only ${n} sample${n > 1 ? "s" : ""}, the raw estimate claims ${nc === n ? "certainty (1.0)" : "impossibility (0.0)"}, which is overconfident. Smoothing gives ${sm.toFixed(2)} instead.` : n >= 40 ? "With a large leaf, smoothing barely changes the estimate: the data speaks for itself." : "Smoothing matters most for small leaves and extreme counts."} The slide's example leaf, 8 Yes out of 10, gives 0.80 raw and ${(9 / 12).toFixed(2)} smoothed.</p>`;
      } else {
        if (!trees.length) growForest();
        $(ctl, '[data-out="t"]').textContent = (thr / 100).toFixed(2);
        const avg = mean(trees.map((t) => t.p)), L = 40, Rt = 20, X = (v) => L + v * (640 - L - Rt);
        g += txt(L, 18, "Each dot: one tree's leaf estimate of P(default) for the same applicant", { fill: C.ink, bold: 1 });
        for (let v = 0; v <= 1.001; v += 0.1) g += `<line x1="${X(v)}" x2="${X(v)}" y1="30" y2="190" stroke="${C.grid}"/>` + txt(X(v), 206, v.toFixed(1), { anchor: "middle" });
        g += `<rect x="${X(0)}" y="30" width="${X(thr / 100) - X(0)}" height="160" fill="${C.accent}" opacity=".08"/>` + txt(X(thr / 100) - 4, 44, "approve zone", { anchor: "end", fill: C.accent, bold: 1, size: 10 });
        const st = {};
        trees.forEach((t) => { const k = Math.round(X(t.p) / 12), h = (st[k] = (st[k] || 0) + 1); g += `<circle cx="${X(t.p)}" cy="${178 - (h - 1) * 16}" r="${4 + Math.min(6, t.size / 5)}" fill="${C.light}" stroke="${C.accent}"/>`; });
        g += `<line x1="${X(avg)}" x2="${X(avg)}" y1="30" y2="192" stroke="${C.violet}" stroke-width="3"/>` + txt(X(avg) + 5, 60, "forest average " + avg.toFixed(2), { fill: C.violet, bold: 1 });
        g += `<line x1="${X(thr / 100)}" x2="${X(thr / 100)}" y1="30" y2="192" stroke="${C.ink}" stroke-dasharray="4 3"/>`;
        g += txt(L, 232, "Dot size = number of training samples in that tree's leaf", { size: 10 });
        svg.innerHTML = g;
        const lo = Math.min(...trees.map((t) => t.p)), hi = Math.max(...trees.map((t) => t.p));
        out.innerHTML = `<div class="formula">P(default | X) = (1/25) Σ P<sub>t</sub>(default | X) = ${avg.toFixed(3)}</div><p>Individual trees disagree widely (from ${lo.toFixed(2)} to ${hi.toFixed(2)}), especially those with small leaves. Averaging 25 trees gives a steadier estimate. With the threshold at ${(thr / 100).toFixed(2)}, the loan is <b>${avg < thr / 100 ? "approved" : "not approved"}</b>. Illustrative simulation.</p>`;
      }
    }
    mB.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.pm; press(mB, b); controls(); render(); }));
    controls(); render();
  })();
})();
