// Session 21 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b", sky: "#3a8dde" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const gauss = (r) => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const TAU = 2 * Math.PI, deg = (r) => ((r * 180) / Math.PI + 360) % 360;

  // Jacobi eigen-decomposition of a symmetric matrix → {vals, vecs (columns)} sorted descending
  function eig(A0) {
    const n = A0.length, A = A0.map((r) => [...r]), V = A.map((_, i) => A.map((_, j) => +(i === j)));
    for (let sweep = 0; sweep < 60; sweep++) {
      let off = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] ** 2;
      if (off < 1e-18) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-15) continue;
        const th = (A[q][q] - A[p][p]) / (2 * A[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
        for (let k = 0; k < n; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
        for (let k = 0; k < n; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
      }
    }
    const idx = A.map((_, i) => i).sort((a, b) => A[b][b] - A[a][a]);
    return { vals: idx.map((i) => A[i][i]), vecs: idx.map((i) => V.map((row) => row[i])) };
  }

  /* shared: 300 students, 5 subjects, 2 latent abilities */
  const SUBJ = ["Math", "Physics", "Literature", "History", "Art"];
  const TRUE_L = [[0.85, 0.1], [0.8, 0.15], [0.15, 0.8], [0.2, 0.75], [0.1, 0.65]];
  const R = (() => {
    const r = rng(21), n = 300, X = Array.from({ length: n }, () => { const f = [gauss(r), gauss(r)]; return TRUE_L.map(([a, b]) => a * f[0] + b * f[1] + Math.sqrt(1 - a * a - b * b) * gauss(r)); });
    const m = SUBJ.map((_, j) => mean(X.map((x) => x[j]))), sd = SUBJ.map((_, j) => Math.sqrt(mean(X.map((x) => (x[j] - m[j]) ** 2))));
    return SUBJ.map((_, a) => SUBJ.map((_, b) => mean(X.map((x) => ((x[a] - m[a]) / sd[a]) * ((x[b] - m[b]) / sd[b])))));
  })();
  const E = eig(R);
  const unrot = (m) => SUBJ.map((_, i) => Array.from({ length: m }, (_, j) => E.vecs[j][i] * Math.sqrt(E.vals[j]) * (E.vecs[j].reduce((s, v) => s + v, 0) < 0 ? -1 : 1)));
  function varimax(L) {
    const p = L.length, m = L[0].length; let A = L.map((r) => [...r]);
    for (let it = 0; it < 50; it++) {
      let changed = false;
      for (let a = 0; a < m; a++) for (let b = a + 1; b < m; b++) {
        let bestT = 0, bestV = -Infinity;
        for (let k = -90; k <= 90; k += 0.5) { const t = (k * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t); let v = 0; [a, b].forEach((col, ci) => { const vals = A.map((r) => (ci === 0 ? c * r[a] + s * r[b] : -s * r[a] + c * r[b]) ** 2); v += mean(vals.map((x) => x * x)) - mean(vals) ** 2; }); if (v > bestV + 1e-12) { bestV = v; bestT = t; } }
        if (Math.abs(bestT) > 1e-4) { changed = true; const c = Math.cos(bestT), s = Math.sin(bestT); A = A.map((r) => { const n2 = [...r]; n2[a] = c * r[a] + s * r[b]; n2[b] = -s * r[a] + c * r[b]; return n2; }); }
      }
      if (!changed) break;
    }
    for (let j = 0; j < m; j++) if (A.reduce((s, r) => s + r[j], 0) < 0) A = A.map((r) => { const n2 = [...r]; n2[j] = -n2[j]; return n2; });
    return A;
  }
  const vmCrit = (L2) => [0, 1].reduce((v, j) => { const sq = L2.map((r) => r[j] ** 2); return v + mean(sq.map((x) => x * x)) - mean(sq) ** 2; }, 0);
  const rotate = (L, t) => L.map(([a, b]) => [Math.cos(t) * a + Math.sin(t) * b, -Math.sin(t) * a + Math.cos(t) * b]);

  /* 1. Factor extraction */
  (function fa() {
    const root = document.getElementById("viz-fa");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), tbl = $(root, "[data-load]"), mIn = $(root, '[data-in="m"]'), rBtn = $(root, "[data-rot]");
    let rot = true;
    function render() {
      const m = +mIn.value; $(root, '[data-out="m"]').textContent = m;
      let g = txt(20, 16, "Correlation matrix", { fill: C.ink, bold: 1 });
      const cs = 42, x0 = 90, y0 = 30;
      SUBJ.forEach((s, i) => { g += txt(x0 - 8, y0 + i * cs + cs / 2 + 4, s, { anchor: "end", fill: C.ink, size: 10.5 }) + txt(x0 + i * cs + cs / 2, y0 + 5 * cs + 14, s.slice(0, 4), { anchor: "middle", size: 10 }); SUBJ.forEach((_, j) => { const v = R[i][j], t = Math.max(0, v); g += `<rect x="${x0 + j * cs + 1}" y="${y0 + i * cs + 1}" width="${cs - 2}" height="${cs - 2}" rx="4" fill="rgb(${Math.round(242 - t * 228)},${Math.round(245 - t * 105)},${Math.round(250 - t * 123)})"/>` + txt(x0 + j * cs + cs / 2, y0 + i * cs + cs / 2 + 4, v.toFixed(2), { anchor: "middle", fill: t > 0.55 ? "#fff" : C.ink, size: 10 }); }); });
      // scree
      const L = 380, Rr = 620, T = 30, B = 220, X = (k) => L + (k / 4) * (Rr - L), Y = (v) => B - (v / 3) * (B - T);
      g += txt(L, 16, "Scree plot (eigenvalues)", { fill: C.ink, bold: 1 });
      for (let v = 0; v <= 3; v += 1) g += `<line x1="${L}" x2="${Rr}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 6, Y(v) + 4, v, { anchor: "end", size: 10 });
      g += `<line x1="${L}" x2="${Rr}" y1="${Y(1)}" y2="${Y(1)}" stroke="${C.rose}" stroke-dasharray="5 3"/>` + txt(Rr, Y(1) - 5, "Kaiser: eigenvalue = 1", { anchor: "end", fill: C.rose, bold: 1, size: 10 });
      g += `<polyline points="${E.vals.map((v, k) => `${X(k)},${Y(v)}`).join(" ")}" fill="none" stroke="${C.violet}" stroke-width="2.5"/>`;
      E.vals.forEach((v, k) => (g += `<circle cx="${X(k)}" cy="${Y(v)}" r="${k < m ? 7 : 5}" fill="${k < m ? C.violet : "#fff"}" stroke="${C.violet}" stroke-width="2"/>` + txt(X(k), Y(v) - 11, v.toFixed(2), { anchor: "middle", fill: C.ink, size: 10 }) + txt(X(k), B + 16, "F" + (k + 1), { anchor: "middle", size: 10 })));
      svg.innerHTML = g;
      let Lm = unrot(m); if (rot && m >= 2) Lm = varimax(Lm);
      const names = Array.from({ length: m }, (_, j) => { if (m === 1) return "General ability"; const top = SUBJ.map((s, i) => [s, Math.abs(Lm[i][j])]).sort((a, b) => b[1] - a[1]); if (!rot) return "Factor " + (j + 1); if (top[0][1] < 0.5) return "Factor " + (j + 1) + " (weak)"; return ["Math", "Physics"].includes(top[0][0]) ? "Analytical" : "Verbal/creative"; });
      const comm = Lm.map((r) => r.reduce((s, v) => s + v * v, 0)), tot = E.vals.slice(0, m).reduce((a, b) => a + b, 0);
      tbl.innerHTML = `<thead><tr><th>Subject</th>${names.map((n) => `<th>${n}</th>`).join("")}<th>Communality</th></tr></thead><tbody>${SUBJ.map((s, i) => `<tr><td><b>${s}</b></td>${Lm[i].map((v) => `<td style="${Math.abs(v) >= 0.5 ? "background:var(--accent-soft);font-weight:700" : "color:var(--ink-soft)"}">${v.toFixed(2)}</td>`).join("")}<td>${comm[i].toFixed(2)}</td></tr>`).join("")}</tbody>`;
      const kaiser = E.vals.filter((v) => v > 1).length;
      out.innerHTML = `<p>Kaiser's rule keeps <b>${kaiser}</b> factors (eigenvalues above 1), and the scree plot's elbow agrees. ${m} factor${m > 1 ? "s" : ""} explain${m === 1 ? "s" : ""} ${((tot / 5) * 100).toFixed(0)}% of the total variance. ${m === 1 ? "One factor lumps all subjects together as general ability; communalities show how poorly it explains some of them." : m === 3 ? "The third factor has an eigenvalue well below 1 and no subject loads strongly on it: it's mostly noise." : rot ? "After Varimax rotation, Math and Physics load on one factor and Literature, History and Art on the other, so the factors can be named Analytical and Verbal/creative, exactly as in the slides." : "Unrotated, the first factor has high loadings on every subject, which is hard to interpret. Switch rotation on."} Communality is the share of each subject's variance the factors explain.</p>`;
    }
    mIn.addEventListener("input", render);
    rBtn.addEventListener("click", () => { rot = !rot; rBtn.setAttribute("aria-pressed", String(rot)); render(); });
    render();
  })();

  /* 2. Manual rotation */
  (function rotViz() {
    const root = document.getElementById("viz-rot");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), aIn = $(root, '[data-in="a"]');
    const L0 = unrot(2), angles = []; for (let k = -90; k <= 90; k++) angles.push([k, vmCrit(rotate(L0, (k * Math.PI) / 180))]);
    const best = angles.reduce((b, a) => (a[1] > b[1] ? a : b), angles[0]);
    function render() {
      const a = +aIn.value, t = (a * Math.PI) / 180; $(root, '[data-out="a"]').textContent = a + "°";
      const Lr = rotate(L0, t), cx = 150, cy = 150, S = 120, P = (x, y) => [cx + x * S, cy - y * S];
      let g = `<rect x="${cx - S}" y="${cy - S}" width="${2 * S}" height="${2 * S}" rx="8" fill="${C.bg}"/>`;
      // rotated axes: factor 1 axis direction in original coordinates is (cos t, sin t)
      const ax = [[Math.cos(t), Math.sin(t), "Factor 1"], [-Math.sin(t), Math.cos(t), "Factor 2"]];
      ax.forEach(([dx, dy, lab]) => { const [x1, y1] = P(-dx * 1.05, -dy * 1.05), [x2, y2] = P(dx * 1.05, dy * 1.05); g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.violet}" stroke-width="2"/>` + txt(x2 + 4, y2 + (dy > 0 ? -4 : 12), lab, { fill: C.violet, bold: 1, size: 10.5 }); });
      L0.forEach(([x, y], i) => { const [px, py] = P(x, y); g += `<circle cx="${px}" cy="${py}" r="6" fill="${i < 2 ? C.accent : C.amber}" stroke="#fff" stroke-width="1.5"/>` + txt(px + 8, py + 4, SUBJ[i], { fill: C.ink, bold: 1, size: 10.5 }); });
      // right: criterion curve + rotated loadings
      const L = 330, Rr = 620, T = 30, B = 140, mx = Math.max(...angles.map((q) => q[1])), X = (k) => L + ((k + 90) / 180) * (Rr - L), Y = (v) => B - (v / mx) * (B - T);
      g += txt(L, 16, "Varimax criterion (simplicity of the loadings)", { fill: C.ink, bold: 1, size: 10.5 });
      g += `<polyline points="${angles.map(([k, v]) => `${X(k)},${Y(v)}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2"/><line x1="${X(a)}" x2="${X(a)}" y1="${T}" y2="${B}" stroke="${C.violet}" stroke-dasharray="3 3"/><circle cx="${X(best[0])}" cy="${Y(best[1])}" r="4" fill="${C.accent}"/>`;
      [-90, 0, 90].forEach((k) => (g += txt(X(k), B + 14, k + "°", { anchor: "middle", size: 9.5 })));
      g += txt(L, 176, "Rotated loadings", { fill: C.ink, bold: 1, size: 10.5 }) + txt(L + 150, 176, "F1", { anchor: "middle", size: 10, bold: 1 }) + txt(L + 220, 176, "F2", { anchor: "middle", size: 10, bold: 1 });
      Lr.forEach(([f1, f2], i) => { const y = 194 + i * 20; g += txt(L, y, SUBJ[i], { fill: C.ink, size: 10.5 }); [f1, f2].forEach((v, j) => (g += `<rect x="${L + 125 + j * 70}" y="${y - 12}" width="50" height="16" rx="4" fill="${Math.abs(v) >= 0.5 ? C.accent : C.bg}" opacity="${Math.abs(v) >= 0.5 ? 0.25 : 1}"/>` + txt(L + 150 + j * 70, y, v.toFixed(2), { anchor: "middle", fill: C.ink, bold: Math.abs(v) >= 0.5, size: 10.5 }))); });
      svg.innerHTML = g;
      const near = Math.abs(a - best[0]) <= 2;
      out.innerHTML = `<p>${near ? `<b>This is the Varimax solution (${best[0]}°).</b> Math and Physics sit on the Factor 1 axis and the three humanities subjects on the Factor 2 axis: each subject now loads highly on just one factor, a "simple structure".` : a === 0 ? "Unrotated, every subject loads fairly strongly on Factor 1: it reads as general ability, and Factor 2 contrasts the two groups. Rotate the axes." : "Rotate until each subject sits close to one of the violet axes; the criterion curve peaks there."} Rotation moves the axes, not the points, so each subject's communality and the total variance explained stay exactly the same.</p>`;
    }
    aIn.addEventListener("input", render);
    $(root, "[data-vmax]").addEventListener("click", () => { aIn.value = best[0]; render(); });
    render();
  })();

  /* 3. Circular mean on a compass */
  (function circ() {
    const root = document.getElementById("viz-circ");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out");
    const EX = { wrap: [350, 10], north: [340, 355, 5, 15, 20, 350, 10, 0, 25, 330, 12, 348], spread: [5, 48, 95, 130, 182, 228, 262, 310, 140, 280], clear: [] };
    let obs = [...EX.wrap];
    const cx = 160, cy = 150, RAD = 115;
    const pt = (b, r) => [cx + r * Math.sin((b * Math.PI) / 180), cy - r * Math.cos((b * Math.PI) / 180)];
    const rayleighP = (n, Rb) => { if (n < 2) return 1; const z = n * Rb * Rb; const p = Math.exp(-z) * (1 + (2 * z - z * z) / (4 * n) - (24 * z - 132 * z * z + 76 * z ** 3 - 9 * z ** 4) / (288 * n * n)); return Math.max(0, Math.min(1, p)); };
    function render() {
      let g = `<circle cx="${cx}" cy="${cy}" r="${RAD}" fill="${C.bg}" stroke="${C.line}" stroke-width="2"/>`;
      [[0, "N"], [90, "E"], [180, "S"], [270, "W"]].forEach(([b, l]) => { const [x, y] = pt(b, RAD + 16); g += txt(x, y + 4, l + " " + b + "°", { anchor: "middle", fill: C.ink, bold: 1, size: 10.5 }); });
      for (let b = 0; b < 360; b += 30) { const [x1, y1] = pt(b, RAD - 6), [x2, y2] = pt(b, RAD); g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.soft}"/>`; }
      obs.forEach((b) => { const [x, y] = pt(b, RAD); g += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${C.accent}" stroke-width="1" opacity=".35"/><circle cx="${x}" cy="${y}" r="6" fill="${C.accent}" stroke="#fff" stroke-width="1.5"/>`; });
      const n = obs.length, Cb = n ? mean(obs.map((b) => Math.cos((b * Math.PI) / 180))) : 0, Sb = n ? mean(obs.map((b) => Math.sin((b * Math.PI) / 180))) : 0, Rb = Math.hypot(Cb, Sb), th = deg(Math.atan2(Sb, Cb)), lin = n ? mean(obs) : 0;
      const arrow = (b, r, col, w) => { const [x, y] = pt(b, r); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="${w + 1}" fill="${col}"/>`; };
      if (n) { g += arrow(lin, RAD * 0.92, C.rose, 3); if (Rb > 0.02) g += arrow(th, RAD * Rb, C.violet, 4.5); }
      g += `<circle cx="${cx}" cy="${cy}" r="4" fill="${C.ink}"/>`;
      // right: linear number line
      const L = 350, Rr = 620, X = (b) => L + (b / 360) * (Rr - L), y0 = 120;
      g += txt(L, 60, "The same angles on an ordinary number line", { fill: C.ink, bold: 1, size: 10.5 }) + `<line x1="${L}" x2="${Rr}" y1="${y0}" y2="${y0}" stroke="${C.ink}" stroke-width="1.5"/>`;
      [0, 90, 180, 270, 360].forEach((b) => (g += `<line x1="${X(b)}" x2="${X(b)}" y1="${y0 - 5}" y2="${y0 + 5}" stroke="${C.ink}"/>` + txt(X(b), y0 + 20, b + "°", { anchor: "middle", size: 10 })));
      obs.forEach((b) => (g += `<circle cx="${X(b)}" cy="${y0}" r="5" fill="${C.accent}" opacity=".8"/>`));
      if (n) g += `<line x1="${X(lin)}" x2="${X(lin)}" y1="${y0 - 26}" y2="${y0}" stroke="${C.rose}" stroke-width="3"/>` + txt(X(lin), y0 - 32, "arithmetic mean", { anchor: "middle", fill: C.rose, bold: 1, size: 10 });
      g += txt(L, 190, "0° and 360° are the same direction, but a number", { size: 10.5 }) + txt(L, 206, "line puts them at opposite ends.", { size: 10.5 }) + txt(L, 240, "Click the compass to add an observation.", { fill: C.ink, size: 10.5, bold: 1 });
      svg.innerHTML = g;
      const p = rayleighP(n, Rb);
      $(root, '[data-stat="lin"]').textContent = n ? lin.toFixed(1) + "°" : "–";
      $(root, '[data-stat="mean"]').textContent = n && Rb > 0.02 ? th.toFixed(1) + "°" : "–";
      $(root, '[data-stat="r"]').textContent = n ? Rb.toFixed(3) : "–";
      $(root, '[data-stat="p"]').textContent = n >= 2 ? (p < 0.001 ? "< 0.001" : p.toFixed(3)) : "–";
      out.innerHTML = n ? `<div class="formula">C̄ = ${Cb.toFixed(3)}, S̄ = ${Sb.toFixed(3)} &nbsp;·&nbsp; θ̄ = atan2(S̄, C̄) = ${Rb > 0.02 ? th.toFixed(1) + "°" : "undefined"} &nbsp;·&nbsp; R = ${Rb.toFixed(3)} &nbsp;·&nbsp; circular variance = ${(1 - Rb).toFixed(3)}${Rb > 0.01 && Rb < 1 ? ` &nbsp;·&nbsp; circular SD = ${(Math.sqrt(-2 * Math.log(Rb)) * 180 / Math.PI).toFixed(1)}°` : ""}</div><p>${Math.abs(((lin - th + 540) % 360) - 180) > 90 && Rb > 0.3 ? `The arithmetic mean says ${lin.toFixed(0)}°, pointing ${Math.round(Math.abs(((lin - th + 540) % 360) - 180))}° away from where the winds actually blow. The circular mean, ${th.toFixed(0)}°, is correct.` : Rb < 0.3 ? "The directions are spread out, so R is small and the mean direction means little." : "Here the arithmetic and circular means happen to be close, because the angles don't straddle 0°."} ${n >= 2 ? (p < 0.05 ? `The Rayleigh test rejects uniformity (p ${p < 0.001 ? "&lt; 0.001" : "= " + p.toFixed(3)}): there is a preferred direction.` : `The Rayleigh test finds no significant preferred direction (p = ${p.toFixed(3)}).`) : ""}</p>` : "<p>Click around the compass to add wind directions.</p>";
    }
    svg.addEventListener("click", (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); const dx = q.x - cx, dy = q.y - cy; if (Math.hypot(dx, dy) > RAD + 30) return; obs.push(Math.round(deg(Math.atan2(dx, -dy)))); render(); });
    $$(root, "[data-ex]").forEach((b) => b.addEventListener("click", () => { obs = [...EX[b.dataset.ex]]; render(); }));
    render();
  })();

  /* 4. Rose diagram + von Mises */
  (function rose() {
    const root = document.getElementById("viz-rose");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), muIn = $(root, '[data-in="mu"]'), kIn = $(root, '[data-in="k"]');
    const I = (nu, x) => { let s = 0, t = Math.pow(x / 2, nu) / (nu === 0 ? 1 : 1); for (let k = 0; k < 60; k++) { if (k > 0) t *= (x * x) / 4 / (k * (k + nu)); s += t; } return s; };
    const vmSample = (mu, k, r) => { if (k < 1e-6) return r() * TAU; const a = 1 + Math.sqrt(1 + 4 * k * k), b = (a - Math.sqrt(2 * a)) / (2 * k), rr = (1 + b * b) / (2 * b); while (true) { const u1 = r(), u2 = r(), u3 = r(), z = Math.cos(Math.PI * u1), f = (1 + rr * z) / (rr + z), c = k * (rr - f); if (c * (2 - c) - u2 > 0 || Math.log(c / u2) + 1 - c >= 0) { return (mu + (u3 > 0.5 ? 1 : -1) * Math.acos(f) + TAU) % TAU; } } };
    const clock = (h) => { const tot = ((Math.round(h * 60) % 1440) + 1440) % 1440, hh = Math.floor(tot / 60), mm = tot % 60; const h12 = hh % 12 === 0 ? 12 : hh % 12; return `${h12}:${String(mm).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`; };
    function render() {
      const hr = +muIn.value / 4, k = +kIn.value / 10, muDeg = hr * 15, mu = (muDeg * Math.PI) / 180;
      $(root, '[data-out="mu"]').textContent = `${clock(hr)} (${muDeg.toFixed(muDeg % 1 ? 1 : 0)}°)`; $(root, '[data-out="k"]').textContent = k.toFixed(1);
      const r = rng(2100), S = Array.from({ length: 1000 }, () => vmSample(mu, k, r));
      const bins = new Array(24).fill(0); S.forEach((a) => bins[Math.floor(((a / TAU) * 24) % 24)]++);
      const Cb = mean(S.map(Math.cos)), Sb = mean(S.map(Math.sin)), Rb = Math.hypot(Cb, Sb), th = deg(Math.atan2(Sb, Cb)), Rth = k > 0 ? I(1, k) / I(0, k) : 0;
      const cx = 160, cy = 150, RM = 120, bm = Math.max(...bins);
      const P = (ang, rad) => [cx + rad * Math.sin(ang), cy - rad * Math.cos(ang)];
      let g = "";
      [0.25, 0.5, 0.75, 1].forEach((f) => (g += `<circle cx="${cx}" cy="${cy}" r="${RM * f}" fill="none" stroke="${C.grid}"/>`));
      bins.forEach((c, i) => { const a0 = (i / 24) * TAU, a1 = ((i + 1) / 24) * TAU, rr = RM * Math.sqrt(c / bm); const [x0, y0] = P(a0, rr), [x1, y1] = P(a1, rr); g += `<path d="M${cx},${cy} L${x0},${y0} A${rr},${rr} 0 0 1 ${x1},${y1} Z" fill="${C.accent}" opacity=".75" stroke="#fff" stroke-width="1"/>`; });
      const dens = (a) => (k > 0 ? Math.exp(k * Math.cos(a - mu)) / (TAU * I(0, k)) : 1 / TAU);
      const cur = []; for (let i = 0; i <= 240; i++) { const a = (i / 240) * TAU, expected = 1000 * dens(a) * (TAU / 24); cur.push(P(a, Math.min(RM * 1.12, RM * Math.sqrt(expected / bm)))); }
      g += `<polyline points="${cur.map(([x, y]) => `${x},${y}`).join(" ")}" fill="none" stroke="${C.violet}" stroke-width="2"/>`;
      [0, 6, 12, 18].forEach((h) => { const [x, y] = P((h / 24) * TAU, RM + 16); g += txt(x, y + 4, ["12 AM", "6 AM", "12 PM", "6 PM"][h / 6], { anchor: "middle", fill: C.ink, bold: 1, size: 10 }); });
      const [ax, ay] = P((th * Math.PI) / 180, RM * Rb); g += `<line x1="${cx}" y1="${cy}" x2="${ax}" y2="${ay}" stroke="${C.rose}" stroke-width="4" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="4" fill="${C.ink}"/>`;
      const L = 340; g += txt(L, 40, "Summary of 1,000 purchases", { fill: C.ink, bold: 1, size: 12 });
      [["Mean purchase time", `${clock(th / 15)} (${th.toFixed(0)}°)`], ["Resultant length R", Rb.toFixed(3)], ["Theoretical R = I₁(κ) ÷ I₀(κ)", Rth.toFixed(3)], ["Circular variance 1 − R", (1 - Rb).toFixed(3)], ["Peak hour's share", ((bm / 1000) * 100).toFixed(1) + "%"]].forEach(([a, b], i) => (g += txt(L, 72 + i * 30, a, { size: 11 }) + txt(620, 72 + i * 30, b, { anchor: "end", fill: C.ink, bold: 1, size: 12 })));
      g += txt(L, 240, "teal petals: purchases per hour (area-true)", { size: 10 }) + txt(L, 256, "violet: fitted von Mises · rose arrow: mean, length R", { size: 10 });
      svg.innerHTML = g;
      out.innerHTML = `<p>${k === 0 ? "With κ = 0 the distribution is uniform: purchases are spread evenly around the clock, R is near 0, and there's no meaningful mean time." : `Purchases cluster around <b>${clock(th / 15)}</b> with R = ${Rb.toFixed(2)}. ${Math.abs(Rb - 0.85) < 0.03 ? "This matches the slides' R = 0.85 (high clustering)." : Rb > 0.85 ? "That's tighter clustering than the slides' R = 0.85." : "That's looser than the slides' R = 0.85; raise κ to about 3.6 to match."}`} ${Math.abs(muDeg - 210) < 0.5 ? "On this 24-hour scale, the slides' 210° is 2 PM; drag the peak to 300° to see an 8 PM peak." : ""} Use this to schedule campaigns, staffing or server capacity around the peak hour.</p>`;
    }
    [muIn, kIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* 5. Fourier smoothing */
  (function smooth() {
    const root = document.getElementById("viz-smooth");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), kIn = $(root, '[data-in="k"]');
    const N = 365, r = rng(365);
    const truth = (d) => 27 + 6 * Math.cos((TAU * (d - 140)) / 365) + 1.6 * Math.cos((2 * TAU * (d - 200)) / 365);
    const Y = Array.from({ length: N }, (_, d) => truth(d) + gauss(r) * 1.8);
    const coef = (K) => { const a0 = mean(Y), ab = []; for (let k = 1; k <= K; k++) { let a = 0, b = 0; Y.forEach((y, d) => { a += y * Math.cos((TAU * k * d) / N); b += y * Math.sin((TAU * k * d) / N); }); ab.push([(2 * a) / N, (2 * b) / N]); } return { a0, ab }; };
    const evalF = (c, d, upto = Infinity) => c.a0 + c.ab.slice(0, upto).reduce((s, [a, b], i) => s + a * Math.cos((TAU * (i + 1) * d) / N) + b * Math.sin((TAU * (i + 1) * d) / N), 0);
    function render() {
      const K = +kIn.value; $(root, '[data-out="k"]').textContent = K;
      const c = coef(K), fit = Y.map((_, d) => evalF(c, d));
      const eData = Math.sqrt(mean(Y.map((y, d) => (y - fit[d]) ** 2))), eTrue = Math.sqrt(mean(Y.map((_, d) => (truth(d) - fit[d]) ** 2)));
      const L = 40, Rr = 620, X = (d) => L + (d / 364) * (Rr - L), lo = 14, hi = 40, T = 16, B = 200, Yy = (v) => B - ((v - lo) / (hi - lo)) * (B - T);
      let g = "";
      for (let v = 15; v <= 40; v += 5) g += `<line x1="${L}" x2="${Rr}" y1="${Yy(v)}" y2="${Yy(v)}" stroke="${C.grid}"/>` + txt(L - 6, Yy(v) + 4, v + "°", { anchor: "end", size: 10 });
      ["Jan", "Apr", "Jul", "Oct"].forEach((m, i) => (g += txt(X(i * 91), B + 14, m, { anchor: "middle", size: 10 })));
      Y.forEach((y, d) => (g += `<circle cx="${X(d)}" cy="${Yy(y)}" r="1.6" fill="${C.soft}" opacity=".55"/>`));
      g += `<polyline points="${fit.map((v, d) => `${X(d)},${Yy(v)}`).join(" ")}" fill="none" stroke="${C.violet}" stroke-width="2.5"/>`;
      g += txt(L + 4, T + 8, `grey: 365 noisy daily readings · violet: smooth function with ${1 + 2 * K} coefficients`, { size: 10 });
      // basis panel
      const T2 = 232, B2 = 318, Yb = (v) => (T2 + B2) / 2 - (v / 7) * ((B2 - T2) / 2);
      g += txt(L, T2 - 6, "Basis functions, each scaled by its coefficient (first 3 harmonics)", { fill: C.ink, bold: 1, size: 10.5 }) + `<line x1="${L}" x2="${Rr}" y1="${Yb(0)}" y2="${Yb(0)}" stroke="${C.line}"/>`;
      const cols = [C.accent, C.amber, C.sky];
      c.ab.slice(0, 3).forEach(([a, b], i) => { const pts = []; for (let d = 0; d < N; d += 3) pts.push(`${X(d)},${Yb(a * Math.cos((TAU * (i + 1) * d) / N) + b * Math.sin((TAU * (i + 1) * d) / N))}`); g += `<polyline points="${pts.join(" ")}" fill="none" stroke="${cols[i]}" stroke-width="2"/>` + txt(Rr, T2 + 10 + i * 13, `harmonic ${i + 1}: amplitude ${Math.hypot(a, b).toFixed(2)}°`, { anchor: "end", fill: cols[i], bold: 1, size: 9.5 }); });
      if (!K) g += txt((L + Rr) / 2, Yb(0) - 8, "K = 0: just the constant mean", { anchor: "middle", size: 10.5 });
      svg.innerHTML = g;
      out.innerHTML = `<div class="formula">x(t) = c₀ + Σₖ₌₁^${K} [aₖ cos(2πkt/365) + bₖ sin(2πkt/365)] &nbsp;·&nbsp; ${1 + 2 * K} coefficients instead of 365 readings</div><p>Error against the readings: ${eData.toFixed(2)}°; error against the true underlying curve: <b>${eTrue.toFixed(2)}°</b>. ${K === 0 ? "A constant misses the seasons entirely." : K === 1 ? "One harmonic captures the main annual cycle, but misses its uneven shape." : K <= 4 ? "A few harmonics capture the true shape: summer peak, monsoon dip and all. This is the sweet spot." : "Many harmonics start following the day-to-day noise: the error against the readings keeps falling, but the error against the true curve rises. That's overfitting, just as in session 18."} Choosing the number of basis functions is the smoothing decision in FDA.</p>`;
    }
    kIn.addEventListener("input", render);
    render();
  })();

  /* 6. Functional PCA */
  (function fpca() {
    const root = document.getElementById("viz-fpca");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), s1In = $(root, '[data-in="s1"]'), s2In = $(root, '[data-in="s2"]');
    const r = rng(10), NP = 73, days = Array.from({ length: NP }, (_, i) => i * 5);
    const cities = Array.from({ length: 10 }, (_, i) => ({ name: "City " + "ABCDEFGHIJ"[i], lvl: gauss(r) * 5, amp: 7 + gauss(r) * 3, ph: gauss(r) * 6 }));
    const curves = cities.map((c) => days.map((d) => 22 + c.lvl + Math.max(1, c.amp) * Math.cos((TAU * (d - 180 - c.ph)) / 365) + gauss(r) * 0.6));
    const mu = days.map((_, j) => mean(curves.map((c) => c[j]))), Xc = curves.map((c) => c.map((v, j) => v - mu[j]));
    const G = Xc.map((a) => Xc.map((b) => a.reduce((s, v, j) => s + v * b[j], 0))), eg = eig(G);
    const pcs = [0, 1].map((k) => { let phi = days.map((_, j) => Xc.reduce((s, row, i) => s + row[j] * eg.vecs[k][i], 0)); const nrm = Math.hypot(...phi); phi = phi.map((v) => v / nrm); return phi; });
    if (mean(pcs[0]) < 0) pcs[0] = pcs[0].map((v) => -v);
    if (pcs[1][36] < 0) pcs[1] = pcs[1].map((v) => -v);
    const scores = Xc.map((row) => pcs.map((phi) => row.reduce((s, v, j) => s + v * phi[j], 0)));
    const sds = [0, 1].map((k) => Math.sqrt(mean(scores.map((s) => s[k] ** 2))));
    const totVar = eg.vals.reduce((a, b) => a + Math.max(0, b), 0), share = [0, 1].map((k) => eg.vals[k] / totVar);
    let sel = -1;
    function render() {
      const a1 = +s1In.value / 50, a2 = +s2In.value / 50; $(root, '[data-out="s1"]').textContent = (a1 >= 0 ? "+" : "") + a1.toFixed(1) + " SD"; $(root, '[data-out="s2"]').textContent = (a2 >= 0 ? "+" : "") + a2.toFixed(1) + " SD";
      const L = 40, Rr = 400, T = 16, B = 270, X = (d) => L + (d / 360) * (Rr - L), lo = 0, hi = 45, Y = (v) => B - ((v - lo) / (hi - lo)) * (B - T);
      let g = "";
      for (let v = 0; v <= 45; v += 10) g += `<line x1="${L}" x2="${Rr}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 6, Y(v) + 4, v + "°", { anchor: "end", size: 10 });
      ["Jan", "Apr", "Jul", "Oct"].forEach((m, i) => (g += txt(X(i * 91), B + 14, m, { anchor: "middle", size: 10 })));
      curves.forEach((c, i) => (g += `<polyline data-c="${i}" points="${c.map((v, j) => `${X(days[j])},${Y(v)}`).join(" ")}" fill="none" stroke="${i === sel ? C.amber : C.light}" stroke-width="${i === sel ? 3 : 1.8}" style="cursor:pointer" opacity="${sel === -1 || i === sel ? 1 : 0.5}"/>`));
      const mod = mu.map((m, j) => m + a1 * sds[0] * pcs[0][j] + a2 * sds[1] * pcs[1][j]);
      g += `<polyline points="${mu.map((v, j) => `${X(days[j])},${Y(v)}`).join(" ")}" fill="none" stroke="${C.ink}" stroke-width="2.5" stroke-dasharray="6 4"/>`;
      if (a1 || a2) g += `<polyline points="${mod.map((v, j) => `${X(days[j])},${Y(v)}`).join(" ")}" fill="none" stroke="${C.violet}" stroke-width="3"/>`;
      g += txt(L + 4, T + 8, "teal: 10 cities · dashed: mean curve · violet: mean + components", { size: 10 });
      // scores scatter
      const L2 = 440, R2 = 624, T2 = 40, B2 = 250, m1 = Math.max(...scores.map((s) => Math.abs(s[0]))) * 1.2, m2 = Math.max(...scores.map((s) => Math.abs(s[1]))) * 1.2, X2 = (v) => (L2 + R2) / 2 + (v / m1) * ((R2 - L2) / 2), Y2 = (v) => (T2 + B2) / 2 - (v / m2) * ((B2 - T2) / 2);
      g += txt(L2, 20, "FPCA scores", { fill: C.ink, bold: 1 }) + `<rect x="${L2}" y="${T2}" width="${R2 - L2}" height="${B2 - T2}" rx="6" fill="${C.bg}"/><line x1="${L2}" x2="${R2}" y1="${Y2(0)}" y2="${Y2(0)}" stroke="${C.line}"/><line x1="${X2(0)}" x2="${X2(0)}" y1="${T2}" y2="${B2}" stroke="${C.line}"/>`;
      g += txt(R2, B2 + 14, "PC1: hotter →", { anchor: "end", size: 9.5 }) + txt(L2, T2 - 4, "PC2: bigger seasons ↑", { size: 9.5 });
      scores.forEach(([p1, p2], i) => (g += `<circle data-c="${i}" cx="${X2(p1)}" cy="${Y2(p2)}" r="${i === sel ? 8 : 6}" fill="${i === sel ? C.amber : C.accent}" stroke="#fff" style="cursor:pointer"/>` + txt(X2(p1) + 9, Y2(p2) + 4, "ABCDEFGHIJ"[i], { size: 9.5, fill: C.ink })));
      svg.innerHTML = g;
      const c = sel >= 0 ? cities[sel] : null, sc = sel >= 0 ? scores[sel] : null;
      out.innerHTML = `<p><b>Component 1</b> explains ${(share[0] * 100).toFixed(0)}% of the variation between cities: adding it shifts the whole curve up or down, the <b>overall hotness level</b>. <b>Component 2</b> explains ${(share[1] * 100).toFixed(0)}%: it makes summers hotter and winters cooler at the same time, the <b>summer–winter contrast</b>. Together that's ${((share[0] + share[1]) * 100).toFixed(0)}%, so two scores per city summarize 73 readings.${c ? ` <b>${c.name}:</b> PC1 score ${sc[0].toFixed(1)} (${sc[0] > 0 ? "warmer" : "cooler"} than average), PC2 score ${sc[1].toFixed(1)} (${sc[1] > 0 ? "stronger" : "milder"} seasons).` : " Click a city's curve or dot."} Cities are illustrative.</p>`;
    }
    svg.addEventListener("click", (e) => { const t = e.target.closest("[data-c]"); sel = t ? (+t.dataset.c === sel ? -1 : +t.dataset.c) : -1; render(); });
    [s1In, s2In].forEach((el) => el.addEventListener("input", render));
    render();
  })();
})();
