// Session 11 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", line: "#dde4ef", bg: "#f2f5fa", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", lilac: "#ebe8fb", rose: "#d94f70", amber: "#d98a0b" };
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  function lgamma(x) { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t); let s = 1.000000000190015; for (const k of c) s += k / ++y; return -t + Math.log((2.5066282746310005 * s) / x); }
  function gammaQ(a, x) {
    if (x <= 0) return 1;
    if (x < a + 1) { let sum = 1 / a, del = sum, ap = a; for (let n = 0; n < 500; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-14) break; } return 1 - sum * Math.exp(-x + a * Math.log(x) - lgamma(a)); }
    let b = x + 1 - a, c = 1e30, d = 1 / b, h = d; for (let i = 1; i < 500; i++) { const an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-30) d = 1e-30; c = b + an / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-14) break; } return Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
  }
  const chiP = (x, df) => gammaQ(df / 2, x / 2);
  const chiCrit = (df, a) => { let lo = 0, hi = 200; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; chiP(m, df) > a ? (lo = m) : (hi = m); } return (lo + hi) / 2; };
  const chiPdf = (x, k) => (x <= 0 ? 0 : Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.log(2) - lgamma(k / 2)));
  const fmtP = (p) => (p < 0.0001 ? "< 0.0001" : p.toFixed(4));
  const log2 = (x) => Math.log(x) / Math.LN2;
  const H = (counts) => { const n = counts.reduce((a, b) => a + b, 0); return counts.reduce((s, c) => (c ? s - (c / n) * log2(c / n) : s), 0); };

  /* 1. Goodness of fit */
  (function gof() {
    const root = document.getElementById("viz-gof");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), faces = $(root, "[data-faces]");
    let O = [8, 12, 9, 11, 10, 10];
    const E = 10, crit = chiCrit(5, 0.05);
    faces.innerHTML = [1, 2, 3, 4, 5, 6].map((f, i) => `<span style="display:inline-flex;align-items:center;gap:.25rem;background:var(--bg);border-radius:999px;padding:.2rem .35rem .2rem .7rem;font-size:.85rem;font-weight:700">${f}<button class="btn" style="padding:.1rem .55rem" data-i="${i}" data-d="-1" aria-label="Fewer ${f}s">−</button><button class="btn" style="padding:.1rem .55rem" data-i="${i}" data-d="1" aria-label="More ${f}s">+</button></span>`).join("");
    function render() {
      const n = O.reduce((a, b) => a + b, 0), e = n / 6, contrib = O.map((o) => (o - e) ** 2 / e), chi = contrib.reduce((a, b) => a + b, 0), p = chiP(chi, 5), rej = chi > crit;
      const W = 640, H2 = 240, L = 40, Rt = 16, T = 20, B = 44, ym = Math.max(20, ...O) + 4, Y = (v) => T + (1 - v / ym) * (H2 - T - B), gw = (W - L - Rt) / 6;
      let g = "";
      for (let v = 0; v <= ym; v += 5) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
      O.forEach((o, i) => {
        const cx = L + gw * (i + 0.5), bw = gw * 0.3;
        g += `<rect x="${cx - bw - 2}" y="${Y(o)}" width="${bw}" height="${Y(0) - Y(o)}" rx="4" fill="${C.accent}"/><rect x="${cx + 2}" y="${Y(e)}" width="${bw}" height="${Y(0) - Y(e)}" rx="4" fill="${C.violet}" opacity=".55"/>`;
        g += txt(cx - bw / 2 - 2, Y(o) - 5, o, { anchor: "middle", fill: C.ink, bold: 1 }) + txt(cx, H2 - B + 16, "Face " + (i + 1), { anchor: "middle", fill: C.ink });
        g += txt(cx, H2 - B + 31, "(O−E)²/E = " + contrib[i].toFixed(2), { anchor: "middle", size: 9.5, fill: contrib[i] > 3 ? C.rose : C.soft });
      });
      svg.innerHTML = g;
      $(root, '[data-stat="chi"]').textContent = chi.toFixed(2);
      $(root, '[data-stat="p"]').textContent = fmtP(p);
      $(root, '[data-stat="d"]').textContent = rej ? "Reject H₀" : "Fail to reject";
      $(root, '[data-stat="d"]').style.color = rej ? C.rose : C.accent;
      out.innerHTML = `<div class="formula">χ² = ${O.map((o) => `(${o} − ${+e.toFixed(1)})²/${+e.toFixed(1)}`).join(" + ")} = ${chi.toFixed(2)}</div><p>${n !== 60 ? `The die has now been rolled ${n} times, so each face is expected ${+e.toFixed(2)} times. ` : ""}${rej ? `χ² = ${chi.toFixed(2)} exceeds the table value 11.07, so we reject H₀: the die doesn't look fair.` : `χ² = ${chi.toFixed(2)} is below 11.07, so we fail to reject H₀: differences this size happen by chance with a fair die.`}</p>`;
    }
    faces.addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (!b) return; const i = +b.dataset.i; O[i] = Math.max(0, O[i] + +b.dataset.d); render(); });
    $$(root, "[data-roll]").forEach((b) => b.addEventListener("click", () => {
      const pr = b.dataset.roll === "fair" ? [1, 1, 1, 1, 1, 1].map((v) => v / 6) : [0.13, 0.13, 0.13, 0.13, 0.13, 0.35];
      O = [0, 0, 0, 0, 0, 0];
      for (let k = 0; k < 60; k++) { let u = Math.random(), i = 0; while (u > pr[i] && i < 5) { u -= pr[i]; i++; } O[i]++; }
      render();
    }));
    render();
  })();

  /* 2. Independence */
  (function ind() {
    const root = document.getElementById("viz-ind");
    if (!root) return;
    const obsT = $(root, "[data-obs]"), expT = $(root, "[data-exp]"), out = $(root, ".viz-out");
    const R = ["Male", "Female"], Cn = ["Product A", "Product B", "Product C"];
    const EX = { rel: [[40, 25, 15], [15, 30, 35]], ind: [[30, 28, 22], [29, 27, 24]], small: [[4, 2, 1], [1, 3, 2]] };
    let O = EX.rel.map((r) => [...r]);
    function buildObs() {
      obsT.innerHTML = `<caption style="text-align:left;font-weight:700;padding:.5rem .8rem">Observed counts O</caption><thead><tr><th></th>${Cn.map((c) => `<th>${c}</th>`).join("")}<th>Total</th></tr></thead><tbody>${R.map((r, i) => `<tr><th>${r}</th>${Cn.map((_, j) => `<td><input class="num-input" style="width:5rem;padding:.3rem .5rem" type="number" min="0" value="${O[i][j]}" data-i="${i}" data-j="${j}" aria-label="${r}, ${Cn[j]}" /></td>`).join("")}<td data-rt="${i}"></td></tr>`).join("")}<tr><th>Total</th>${Cn.map((_, j) => `<td data-ct="${j}"></td>`).join("")}<td data-gt></td></tr></tbody>`;
      $$(obsT, "input").forEach((el) => el.addEventListener("input", () => { O[+el.dataset.i][+el.dataset.j] = Math.max(0, Math.round(+el.value || 0)); render(); }));
    }
    function render() {
      const rt = O.map((r) => r.reduce((a, b) => a + b, 0)), ct = [0, 1, 2].map((j) => O[0][j] + O[1][j]), N = rt[0] + rt[1];
      rt.forEach((v, i) => ($(obsT, `[data-rt="${i}"]`).textContent = v)); ct.forEach((v, j) => ($(obsT, `[data-ct="${j}"]`).textContent = v)); $(obsT, "[data-gt]").textContent = N;
      if (!N) return;
      const E = O.map((r, i) => r.map((_, j) => (rt[i] * ct[j]) / N));
      const cont = O.map((r, i) => r.map((o, j) => (E[i][j] ? (o - E[i][j]) ** 2 / E[i][j] : 0)));
      const chi = cont.flat().reduce((a, b) => a + b, 0), p = chiP(chi, 2), low = E.flat().some((e) => e < 5), maxC = Math.max(...cont.flat(), 0.01);
      expT.innerHTML = `<caption style="text-align:left;font-weight:700;padding:.5rem .8rem">Expected counts E = row total × column total ÷ ${N}, with each cell's (O − E)²/E</caption><thead><tr><th></th>${Cn.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${R.map((r, i) => `<tr><th>${r}</th>${Cn.map((_, j) => `<td style="background:rgba(217,79,112,${(0.45 * cont[i][j]) / maxC});${E[i][j] < 5 ? "outline:2px solid #d98a0b;outline-offset:-2px" : ""}">${E[i][j].toFixed(1)} <span style="color:var(--ink-soft);font-size:.85em">(${cont[i][j].toFixed(2)})</span></td>`).join("")}</tr>`).join("")}</tbody>`;
      const rej = p <= 0.05;
      $(root, '[data-stat="chi"]').textContent = chi.toFixed(2);
      $(root, '[data-stat="p"]').textContent = fmtP(p);
      $(root, '[data-stat="d"]').textContent = rej ? "Reject H₀" : "Fail to reject";
      $(root, '[data-stat="d"]').style.color = rej ? C.rose : C.accent;
      const pct = (i) => Cn.map((c, j) => `${c.split(" ")[1]} ${rt[i] ? Math.round((O[i][j] / rt[i]) * 100) : 0}%`).join(", ");
      out.innerHTML = `<p>Male preferences: ${pct(0)}. Female preferences: ${pct(1)}. ${rej ? `The split differs more than chance would explain (χ² = ${chi.toFixed(2)} &gt; 5.99, the table value for df 2), so gender and product preference are <b>associated</b>.` : `The splits are similar enough (χ² = ${chi.toFixed(2)} ≤ 5.99) that we can't reject independence.`} Darker cells contribute most to χ².</p>${low ? `<p class="note" style="margin:.5rem 0 0">Outlined cells have expected counts below 5, which breaks an assumption of the test: the p-value isn't reliable. Collect more data or combine categories (or use Fisher's exact test).</p>` : ""}`;
    }
    $$(root, "[data-ex]").forEach((b) => b.addEventListener("click", () => { O = EX[b.dataset.ex].map((r) => [...r]); buildObs(); render(); }));
    buildObs(); render();
  })();

  /* 3. Chi-square distribution */
  (function chidist() {
    const root = document.getElementById("viz-chidist");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), dIn = $(root, '[data-in="df"]'), aIn = $(root, '[data-in="a"]');
    const AL = [0.1, 0.05, 0.01];
    function render() {
      const k = +dIn.value, a = AL[+aIn.value], crit = chiCrit(k, a);
      $(root, '[data-out="df"]').textContent = k; $(root, '[data-out="a"]').textContent = a;
      const xmax = Math.max(16, Math.ceil(k + 5 * Math.sqrt(2 * k))), W = 640, H2 = 240, L = 20, Rt = 20, T = 20, B = 30;
      const xs = []; for (let i = 1; i <= 400; i++) xs.push((xmax * i) / 400);
      const ys = xs.map((x) => chiPdf(x, k)), ym = Math.min(0.5, Math.max(...ys.slice(4))) * 1.15;
      const X = (x) => L + (x / xmax) * (W - L - Rt), Y = (v) => T + (1 - Math.min(v, ym) / ym) * (H2 - T - B);
      const sh = xs.filter((x) => x >= crit);
      let g = sh.length ? `<path d="M${X(sh[0])},${Y(0)} ${sh.map((x) => `L${X(x)},${Y(chiPdf(x, k))}`).join(" ")} L${X(xmax)},${Y(0)} Z" fill="${C.rose}" opacity=".35"/>` : "";
      g += `<path d="${xs.map((x, i) => `${i ? "L" : "M"}${X(x)},${Y(ys[i])}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/>`;
      g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.line}"/>`;
      const step = xmax > 60 ? 10 : 5; for (let x = 0; x <= xmax; x += step) g += txt(X(x), H2 - 10, x, { anchor: "middle" });
      g += `<line x1="${X(crit)}" x2="${X(crit)}" y1="${T}" y2="${Y(0)}" stroke="${C.rose}" stroke-width="2" stroke-dasharray="5 3"/>` + txt(X(crit) + 5, T + 10, "critical χ² = " + crit.toFixed(2), { fill: C.rose, bold: 1 });
      svg.innerHTML = g;
      out.innerHTML = `<p>With ${k} degree${k > 1 ? "s" : ""} of freedom, a calculated χ² above <b>${crit.toFixed(2)}</b> falls in the shaded rejection region (α = ${a}). ${k <= 2 ? "With few degrees of freedom the curve is highly skewed, piled up near zero." : k >= 20 ? "With many degrees of freedom it looks close to a normal curve centered on df." : "The curve is right-skewed; its mean equals the degrees of freedom."}</p>`;
    }
    [dIn, aIn].forEach((el) => el.addEventListener("input", render));
    render();
  })();

  /* 4. Entropy curve */
  (function entropy() {
    const root = document.getElementById("viz-entropy");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), kIn = $(root, '[data-in="k"]');
    function render() {
      const k = +kIn.value, p = k / 14, h = H([k, 14 - k]);
      $(root, '[data-out="k"]').textContent = k;
      const W = 640, H2 = 220, L = 50, Rt = 200, T = 16, B = 34, X = (v) => L + v * (W - L - Rt), Y = (v) => T + (1 - v) * (H2 - T - B);
      let g = "";
      for (let v = 0; v <= 1; v += 0.25) g += `<line x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v.toFixed(2), { anchor: "end" }) + txt(X(v), H2 - 16, v.toFixed(2), { anchor: "middle" });
      g += txt((L + W - Rt) / 2, H2 - 1, "Share of Yes", { anchor: "middle" }) + txt(L - 44, T - 4, "H (bits)");
      const pts = []; for (let i = 0; i <= 200; i++) { const q = i / 200; pts.push(`${X(q)},${Y(H([q, 1 - q]))}`); }
      g += `<polyline points="${pts.join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.5"/>`;
      g += `<line x1="${X(p)}" x2="${X(p)}" y1="${Y(h)}" y2="${Y(0)}" stroke="${C.violet}" stroke-dasharray="4 3"/><circle cx="${X(p)}" cy="${Y(h)}" r="7" fill="${C.violet}"/>`;
      // group of 14 dots
      for (let i = 0; i < 14; i++) g += `<circle cx="${W - Rt + 40 + (i % 7) * 20}" cy="${60 + Math.floor(i / 7) * 22}" r="8" fill="${i < k ? C.accent : C.rose}"/>`;
      g += txt(W - Rt + 40, 34, `${k} Yes, ${14 - k} No`, { fill: C.ink, bold: 1 }) + txt(W - Rt + 40, 124, "H = " + h.toFixed(3) + " bits", { fill: C.violet, bold: 1, size: 14 });
      svg.innerHTML = g;
      const terms = [k, 14 - k].filter((c) => c).map((c) => `${(c / 14).toFixed(3)} × log₂(${(c / 14).toFixed(3)})`).join(" + ");
      out.innerHTML = `<div class="formula">H = −(${terms}) = ${h.toFixed(3)} bits</div><p>${h === 0 ? "Everyone has the same answer, so there is no uncertainty at all." : Math.abs(p - 0.5) < 0.04 ? "An even split is the most uncertain a yes/no outcome can be: 1 bit." : `The group is ${p > 0.5 ? "mostly Yes" : "mostly No"}, so there's some uncertainty, but less than an even split.`} ${k === 9 ? "This is the tennis dataset below: 9 Yes and 5 No." : ""}</p>`;
    }
    kIn.addEventListener("input", render);
    render();
  })();

  /* 5. IG / MI stepper */
  (function igStep() {
    const root = document.getElementById("viz-ig");
    if (!root) return;
    const box = $(root, "[data-step]"), dots = $(root, ".step-dots"), fB = $$(root, "[data-feat]");
    const back = $(root, '[data-dir="-1"]'), next = $(root, '[data-dir="1"]');
    const raw = [["Sunny", "Weak", "No"], ["Sunny", "Strong", "No"], ["Overcast", "Weak", "Yes"], ["Rainy", "Weak", "Yes"], ["Rainy", "Weak", "Yes"], ["Rainy", "Strong", "No"], ["Overcast", "Strong", "Yes"], ["Sunny", "Weak", "No"], ["Sunny", "Weak", "Yes"], ["Rainy", "Weak", "Yes"], ["Sunny", "Strong", "Yes"], ["Overcast", "Strong", "Yes"], ["Overcast", "Weak", "Yes"], ["Rainy", "Strong", "No"]];
    const D = raw.map(([w, wind, play], i) => ({ w, wind, day: "Day " + (i + 1), play }));
    const NAMES = { w: "Weather", wind: "Wind", day: "Day number" };
    let feat = "w", step = 0;
    const yes = D.filter((d) => d.play === "Yes").length, HY = H([yes, 14 - yes]);
    const stats = (f) => {
      const vals = [...new Set(D.map((d) => d[f]))];
      const groups = vals.map((v) => { const g = D.filter((d) => d[f] === v), y = g.filter((d) => d.play === "Yes").length; return { v, n: g.length, y, h: H([y, g.length - y]) }; });
      const HYX = groups.reduce((s, g) => s + (g.n / 14) * g.h, 0), HX = H(groups.map((g) => g.n));
      const HXY = ["Yes", "No"].reduce((s, c) => { const sub = D.filter((d) => d.play === c); return s + (sub.length / 14) * H(vals.map((v) => sub.filter((d) => d[f] === v).length)); }, 0);
      return { groups, HYX, IG: HY - HYX, HX, HXY, GR: (HY - HYX) / HX };
    };
    const bar = (label, v, col, max = 1) => `<div style="display:flex;align-items:center;gap:.6rem;margin:.35rem 0;font-size:.9rem"><span style="min-width:9rem">${label}</span><span style="flex:1;height:14px;background:var(--bg-grid);border-radius:99px;overflow:hidden"><span style="display:block;height:100%;width:${(v / max) * 100}%;background:${col};border-radius:99px"></span></span><b style="min-width:5.5rem;text-align:right">${v.toFixed(4)} bits</b></div>`;
    const STEPS = [
      ["The dataset", () => `<p>14 days of records. The target is <b>PlayTennis</b> (Yes/No); the feature we analyze is <b>${NAMES[feat]}</b>.</p><div class="table-wrap"><table><thead><tr><th>#</th><th${feat === "w" ? ' style="background:var(--accent-soft)"' : ""}>Weather</th><th${feat === "wind" ? ' style="background:var(--accent-soft)"' : ""}>Wind</th><th>PlayTennis</th></tr></thead><tbody>${D.map((d, i) => `<tr><td${feat === "day" ? ' style="background:var(--accent-soft)"' : ""}>${i + 1}</td><td>${d.w}</td><td>${d.wind}</td><td style="color:${d.play === "Yes" ? C.accent : C.rose};font-weight:700">${d.play}</td></tr>`).join("")}</tbody></table></div><p>Yes = ${yes} days, No = ${14 - yes} days.</p>`],
      ["Entropy of the target H(Y)", () => `<p>How uncertain are we about PlayTennis before looking at any feature?</p><div class="formula">H(Y) = −(9/14 × log₂ 9/14 + 5/14 × log₂ 5/14) = −(0.643 × −0.637 + 0.357 × −1.485) = <b>${HY.toFixed(4)} bits</b></div><p>Close to the 1-bit maximum: without other information, we're quite unsure.</p>`],
      ["Conditional entropy H(Y | {F})", () => { const s = stats(feat); return `<p>Split the days by ${NAMES[feat]}, find the entropy of PlayTennis within each group, then take the weighted average.</p><div class="table-wrap"><table><thead><tr><th>${NAMES[feat]}</th><th>Days</th><th>Yes / No</th><th>H(Y | value)</th><th>Weight × H</th></tr></thead><tbody>${s.groups.map((g) => `<tr><td>${g.v}</td><td>${g.n}</td><td>${g.y} / ${g.n - g.y}</td><td>${g.h.toFixed(4)}</td><td>${((g.n / 14) * g.h).toFixed(4)}</td></tr>`).join("")}</tbody></table></div><div class="formula">H(Y | ${NAMES[feat]}) = <b>${s.HYX.toFixed(4)} bits</b></div><p>${feat === "w" ? "Overcast days are always Yes (entropy 0), so knowing it's overcast removes all doubt. Sunny and Rainy stay mixed." : feat === "wind" ? "Both wind groups stay mixed, so little uncertainty is removed." : "Every day is its own group of one, so each group is perfectly pure: entropy 0."}</p>`; }],
      ["Information gain", () => { const s = stats(feat); return `<div class="formula">IG = H(Y) − H(Y | ${NAMES[feat]}) = ${HY.toFixed(4)} − ${s.HYX.toFixed(4)} = <b>${s.IG.toFixed(4)} bits</b></div>${bar("H(Y) before", HY, C.accent)}${bar("H(Y | X) after", s.HYX, C.amber)}${bar("Information gain", s.IG, C.violet)}<p>Knowing ${NAMES[feat]} removes ${Math.round((s.IG / HY) * 100)}% of the uncertainty. ${feat === "day" ? "A perfect score, yet useless for predicting a new day: this is IG's bias toward features with many categories." : ""}</p>`; }],
      ["Mutual information", () => { const s = stats(feat); return `<p>Mutual information asks how much information the two variables share. Calculate it from either side and you get the same answer:</p><div class="formula">MI = H(Y) − H(Y | X) = ${HY.toFixed(4)} − ${s.HYX.toFixed(4)} = ${s.IG.toFixed(4)}</div><div class="formula">MI = H(X) − H(X | Y) = ${s.HX.toFixed(4)} − ${s.HXY.toFixed(4)} = ${(s.HX - s.HXY).toFixed(4)}</div><svg viewBox="0 0 400 150" role="img" aria-label="Information Venn diagram" style="max-width:420px"><ellipse cx="150" cy="75" rx="110" ry="60" fill="${C.accent}" fill-opacity=".18" stroke="${C.accent}"/><ellipse cx="250" cy="75" rx="110" ry="60" fill="${C.violet}" fill-opacity=".18" stroke="${C.violet}"/>${txt(95, 72, "H(Y | X)", { anchor: "middle", fill: C.ink, bold: 1 })}${txt(95, 88, s.HYX.toFixed(3), { anchor: "middle" })}${txt(200, 72, "MI", { anchor: "middle", fill: C.ink, bold: 1 })}${txt(200, 88, s.IG.toFixed(3), { anchor: "middle" })}${txt(305, 72, "H(X | Y)", { anchor: "middle", fill: C.ink, bold: 1 })}${txt(305, 88, s.HXY.toFixed(3), { anchor: "middle" })}${txt(95, 146, "PlayTennis", { anchor: "middle", fill: C.accent, bold: 1 })}${txt(305, 146, NAMES[feat], { anchor: "middle", fill: C.violet, bold: 1 })}</svg><p>The overlap is the shared information. For a feature and a target, MI is the same number as information gain.</p>`; }],
      ["Compare the features", () => { const all = ["w", "wind", "day"].map((f) => [f, stats(f)]); return `<div class="table-wrap"><table><thead><tr><th>Feature</th><th>Categories</th><th>Information gain</th><th>Gain ratio = IG ÷ H(X)</th></tr></thead><tbody>${all.map(([f, s]) => `<tr${f === feat ? ' style="background:var(--accent-soft)"' : ""}><td><b>${NAMES[f]}</b></td><td>${s.groups.length}</td><td>${s.IG.toFixed(4)}</td><td>${s.GR.toFixed(4)}</td></tr>`).join("")}</tbody></table></div><p>Between the real features, a decision tree would split on <b>Weather</b> first: it has far more information gain than Wind. Day number looks best on raw IG only because every value is unique. The gain ratio divides by the feature's own entropy, cutting Day number's score from 0.940 to 0.247; with only 14 rows it still ranks high, which is why ID-like columns should be removed before modeling.</p>`; }],
    ];
    dots.innerHTML = "<span></span>".repeat(STEPS.length);
    function render() {
      const [t, f] = STEPS[step];
      box.innerHTML = `<div class="viz-out" style="margin-top:0"><h5>Step ${step + 1}: ${t.replace("{F}", NAMES[feat])}</h5>${f()}</div>`;
      [...dots.children].forEach((d, k) => d.classList.toggle("is-on", k <= step));
      back.disabled = step === 0; next.disabled = step === STEPS.length - 1;
    }
    fB.forEach((b) => b.addEventListener("click", () => { feat = b.dataset.feat; press(fB, b); render(); }));
    back.addEventListener("click", () => { if (step) { step--; render(); } });
    next.addEventListener("click", () => { if (step < STEPS.length - 1) { step++; render(); } });
    render();
  })();

  /* 6. Skewness */
  (function skew() {
    const root = document.getElementById("viz-skew");
    if (!root) return;
    const svg = $(root, "svg"), out = $(root, ".viz-out"), inp = $(root, "[data-vals]"), sB = $$(root, "[data-sk]"), tB = $$(root, "[data-tr]");
    const SETS = {
      slide: "2, 3, 4, 5, 6, 8, 15",
      income: "3, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 9, 10, 12, 15, 22, 35",
      exam: "95, 92, 90, 88, 91, 85, 94, 89, 78, 93, 60, 87, 90, 72, 96",
      sym: "4, 5, 6, 6, 7, 7, 7, 8, 8, 9, 10",
    };
    let tr = "none";
    inp.value = SETS.slide;
    const g1 = (a) => { const n = a.length, m = mean(a), s = Math.sqrt(a.reduce((t, v) => t + (v - m) ** 2, 0) / (n - 1)); return s ? (n / ((n - 1) * (n - 2))) * a.reduce((t, v) => t + ((v - m) / s) ** 3, 0) : 0; };
    const interp = (v) => (Math.abs(v) < 0.5 ? "Fairly symmetric" : Math.abs(v) < 1 ? (v > 0 ? "Moderate right skew" : "Moderate left skew") : v > 0 ? "High right skew" : "High left skew");
    function render() {
      let data = inp.value.split(/[\s,;]+/).map(Number).filter((v) => Number.isFinite(v) && inp.value.trim());
      if (data.length < 3) { out.innerHTML = "<p>Enter at least three numbers.</p>"; svg.innerHTML = ""; return; }
      let note = "";
      if (tr !== "none" && data.some((v) => v <= 0)) { note = "Log and square root need positive values, so the transformation was skipped."; }
      else if (tr === "sqrt") data = data.map(Math.sqrt); else if (tr === "log") data = data.map(Math.log);
      const s = g1(data), m = mean(data), md = median(data);
      const lo = Math.min(...data), hi = Math.max(...data), bins = 10, w = (hi - lo) / bins || 1, c = new Array(bins).fill(0);
      data.forEach((v) => c[Math.min(bins - 1, Math.floor((v - lo) / w))]++);
      const W = 640, H2 = 220, L = 30, Rt = 20, T = 20, B = 30, cm = Math.max(...c), X = (v) => L + ((v - lo) / (hi - lo || 1)) * (W - L - Rt), Y = (v) => T + (1 - v / cm) * (H2 - T - B);
      let g = "";
      c.forEach((n, i) => (g += `<rect x="${X(lo + i * w) + 1}" y="${Y(n)}" width="${Math.max(1, X(lo + w) - X(lo) - 2)}" height="${Y(0) - Y(n)}" rx="3" fill="${C.light}"/>`));
      data.forEach((v) => (g += `<circle cx="${X(v)}" cy="${Y(0) + 8}" r="3" fill="${C.accent}"/>`));
      g += `<line x1="${X(m)}" x2="${X(m)}" y1="${T}" y2="${Y(0)}" stroke="${C.violet}" stroke-width="2.5" stroke-dasharray="6 3"/>` + txt(X(m) + (m >= md ? 5 : -5), T + 8, "mean", { fill: C.violet, bold: 1, anchor: m >= md ? "start" : "end" });
      g += `<line x1="${X(md)}" x2="${X(md)}" y1="${T}" y2="${Y(0)}" stroke="${C.accent}" stroke-width="2.5"/>` + txt(X(md) + (m >= md ? -5 : 5), T + 8, "median", { fill: C.accent, bold: 1, anchor: m >= md ? "end" : "start" });
      g += txt(L, H2 - 4, +lo.toFixed(2), {}) + txt(W - Rt, H2 - 4, +hi.toFixed(2), { anchor: "end" });
      svg.innerHTML = g;
      $(root, '[data-stat="g1"]').textContent = s.toFixed(3);
      $(root, '[data-stat="mean"]').textContent = +m.toFixed(3);
      $(root, '[data-stat="med"]').textContent = +md.toFixed(3);
      $(root, '[data-stat="int"]').textContent = interp(s);
      out.innerHTML = `<p>${s > 0.5 ? "A long tail on the right pulls the mean above the median." : s < -0.5 ? "A long tail on the left pulls the mean below the median." : "Mean and median are close: the data is roughly symmetric."} ${inp.value === SETS.slide && tr === "none" ? "In the slide's example, the value 15 drags the mean (6.14) above the median (5)." : ""} ${tr !== "none" && !note ? `The ${tr === "log" ? "log" : "square root"} transform compresses large values, bringing skewness to ${s.toFixed(2)}.` : ""} ${note}</p>`;
    }
    sB.forEach((b) => b.addEventListener("click", () => { press(sB, b); inp.value = SETS[b.dataset.sk]; render(); }));
    tB.forEach((b) => b.addEventListener("click", () => { tr = b.dataset.tr; press(tB, b); render(); }));
    inp.addEventListener("input", () => { sB.forEach((b) => b.setAttribute("aria-pressed", "false")); render(); });
    render();
  })();
})();
