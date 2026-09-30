// Session 04 interactive visuals
(function () {
  const C = { ink: "#1b2a41", soft: "#5d6b82", grid: "#e3e9f3", accent: "#0e8c7f", light: "#9fd5ce", violet: "#6b5fd3", rose: "#d94f70", amber: "#d98a0b", sky: "#3a8dde" };
  const PAL = [C.accent, C.violet, C.amber, C.rose, C.sky];
  const $ = (r, s) => r.querySelector(s);
  const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function normal(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.soft}" text-anchor="${o.anchor || "start"}" ${o.bold ? 'font-weight="700"' : ""}>${s}</text>`;

  /* ------------------------------------------------------------
     1. Chart chooser
  ------------------------------------------------------------ */
  (function charts() {
    const root = document.getElementById("viz-charts");
    if (!root) return;
    const bar = $(root, ".controls");
    const svg = $(root, "svg");
    const out = $(root, ".viz-out");
    const W = 640, H = 300, L = 50, R = 20, T = 24, B = 44;

    function frame(yMax, step, yLabel, fmt = (v) => v, yMin = 0) {
      const Y = (v) => T + (1 - (v - yMin) / (yMax - yMin)) * (H - T - B);
      let g = "";
      for (let v = yMin; v <= yMax + 1e-9; v += step) {
        g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, fmt(v), { anchor: "end" });
      }
      g += txt(L - 44, T - 10, yLabel);
      return [g, Y];
    }

    const r = rng(11);
    const ages = Array.from({ length: 240 }, () => Math.max(18, Math.min(79, 38 + normal(r) * 11 + (r() < 0.25 ? 10 : 0))));
    const scatter = Array.from({ length: 60 }, () => { const a = 20 + r() * 55; return [a, 95 + a * 0.62 + normal(r) * 7]; });
    const groups = [["Treatment A", 14, 3.2], ["Treatment B", 11, 2.4], ["Treatment C", 17, 4.5]].map(([n, m, sd]) => {
      const v = Array.from({ length: 40 }, () => Math.max(4, m + normal(r) * sd)); v.push(m + sd * 3.4); return [n, v.sort((a, b) => a - b)];
    });

    const CH = {
      bar: { q: "Compare categories", name: "Bar chart", ex: "Sales by region",
        why: "Bars make it easy to compare quantities across categories. Sort them and start the axis at zero so lengths are honest.",
        draw() {
          const d = [["North", 690], ["South", 640], ["East", 560], ["West", 720], ["Central", 480]];
          let [g, Y] = frame(800, 200, "Sales (₹ lakh)");
          const bw = (W - L - R) / d.length;
          d.forEach(([n, v], i) => {
            const x = L + bw * i + bw * 0.2;
            g += `<rect x="${x}" y="${Y(v)}" width="${bw * 0.6}" height="${Y(0) - Y(v)}" rx="5" fill="${C.accent}"/>` + txt(x + bw * 0.3, Y(v) - 6, v, { anchor: "middle", fill: C.ink, bold: 1 }) + txt(x + bw * 0.3, H - 24, n, { anchor: "middle", fill: C.ink });
          });
          return g;
        } },
      hist: { q: "Show a distribution", name: "Histogram", ex: "Age of 240 customers",
        why: "A histogram groups a numeric variable into ranges (bins) to show its shape: where values cluster, how spread out they are, and whether the distribution is skewed.",
        draw() {
          const bins = []; for (let a = 15; a < 80; a += 5) bins.push([a, ages.filter((x) => x >= a && x < a + 5).length]);
          const max = Math.ceil(Math.max(...bins.map((b) => b[1])) / 10) * 10;
          let [g, Y] = frame(max, max / 4, "Customers");
          const X = (a) => L + ((a - 15) / 65) * (W - L - R);
          bins.forEach(([a, n]) => (g += `<rect x="${X(a) + 1}" y="${Y(n)}" width="${X(a + 5) - X(a) - 2}" height="${Y(0) - Y(n)}" fill="${C.violet}" rx="2"/>`));
          for (let a = 20; a <= 80; a += 10) g += txt(X(a), H - 24, a, { anchor: "middle" });
          g += txt((W + L) / 2, H - 6, "Age (years)", { anchor: "middle" });
          return g;
        } },
      pie: { q: "Show parts of a whole", name: "Pie chart", ex: "Market share of brands",
        why: "A pie shows proportions of a total. It works best with a few slices; beyond five or six, a bar chart is easier to read.",
        draw() {
          const d = [["Brand A", 38], ["Brand B", 27], ["Brand C", 18], ["Brand D", 11], ["Others", 6]];
          const cx = 220, cy = 150, rr = 115; let a0 = -Math.PI / 2, g = "";
          d.forEach(([n, v], i) => {
            const a1 = a0 + (v / 100) * 2 * Math.PI, big = a1 - a0 > Math.PI ? 1 : 0;
            g += `<path d="M${cx},${cy} L${cx + rr * Math.cos(a0)},${cy + rr * Math.sin(a0)} A${rr},${rr} 0 ${big} 1 ${cx + rr * Math.cos(a1)},${cy + rr * Math.sin(a1)} Z" fill="${PAL[i]}" stroke="#fff" stroke-width="2"/>`;
            const am = (a0 + a1) / 2;
            if (v >= 11) g += txt(cx + rr * 0.62 * Math.cos(am), cy + rr * 0.62 * Math.sin(am) + 4, v + "%", { anchor: "middle", fill: "#fff", bold: 1, size: 12 });
            g += `<rect x="400" y="${70 + i * 32}" width="14" height="14" rx="3" fill="${PAL[i]}"/>` + txt(422, 82 + i * 32, `${n}: ${v}%`, { fill: C.ink, size: 13 });
            a0 = a1;
          });
          return g;
        } },
      line: { q: "Show a trend over time", name: "Line chart", ex: "Monthly sales for a year",
        why: "Lines connect values in time order, so rises, falls and seasonal patterns stand out.",
        draw() {
          const d = [480, 520, 510, 580, 600, 560, 610, 590, 570, 640, 660, 700], m = "JFMAMJJASOND".split("");
          let [g, Y] = frame(800, 200, "Sales (₹000)");
          const X = (i) => L + 20 + (i / 11) * (W - L - R - 40);
          g += `<polyline points="${d.map((v, i) => `${X(i)},${Y(v)}`).join(" ")}" fill="none" stroke="${C.accent}" stroke-width="3" stroke-linejoin="round"/>`;
          d.forEach((v, i) => (g += `<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="#fff" stroke="${C.accent}" stroke-width="2.5"/>` + txt(X(i), H - 24, m[i], { anchor: "middle" })));
          return g;
        } },
      scatter: { q: "Show a relationship", name: "Scatter plot", ex: "Age vs. blood pressure",
        why: "Each dot is one person. A scatter plot reveals whether two numeric variables move together, how strongly, and which points don't fit.",
        draw() {
          let [g, Y] = frame(160, 20, "Systolic BP", (v) => v, 80);
          const X = (a) => L + ((a - 15) / 65) * (W - L - R);
          scatter.forEach(([a, b]) => (g += `<circle cx="${X(a)}" cy="${Y(b)}" r="5" fill="${C.rose}" fill-opacity=".75" stroke="#fff"/>`));
          for (let a = 20; a <= 80; a += 10) g += txt(X(a), H - 24, a, { anchor: "middle" });
          g += txt((W + L) / 2, H - 6, "Age (years)", { anchor: "middle" });
          return g;
        } },
      box: { q: "Show spread and outliers", name: "Box plot", ex: "Patient recovery times by treatment",
        why: "The box spans the middle 50% of values (Q1 to Q3), the line inside is the median, whiskers show the typical range, and dots beyond them are outliers.",
        draw() {
          let [g, Y] = frame(35, 5, "Recovery (days)");
          const q = (a, p) => { const i = (a.length - 1) * p, lo = Math.floor(i); return a[lo] + (a[Math.ceil(i)] - a[lo]) * (i - lo); };
          const gw = (W - L - R) / groups.length;
          groups.forEach(([n, v], k) => {
            const cx = L + gw * (k + 0.5), q1 = q(v, 0.25), md = q(v, 0.5), q3 = q(v, 0.75), iqr = q3 - q1;
            const lo = v.find((x) => x >= q1 - 1.5 * iqr), hi = [...v].reverse().find((x) => x <= q3 + 1.5 * iqr);
            g += `<line x1="${cx}" x2="${cx}" y1="${Y(hi)}" y2="${Y(lo)}" stroke="${C.ink}"/>`;
            g += `<line x1="${cx - 14}" x2="${cx + 14}" y1="${Y(hi)}" y2="${Y(hi)}" stroke="${C.ink}"/><line x1="${cx - 14}" x2="${cx + 14}" y1="${Y(lo)}" y2="${Y(lo)}" stroke="${C.ink}"/>`;
            g += `<rect x="${cx - 40}" y="${Y(q3)}" width="80" height="${Y(q1) - Y(q3)}" fill="${PAL[k]}" fill-opacity=".25" stroke="${PAL[k]}" stroke-width="2" rx="4"/>`;
            g += `<line x1="${cx - 40}" x2="${cx + 40}" y1="${Y(md)}" y2="${Y(md)}" stroke="${PAL[k]}" stroke-width="3"/>`;
            v.filter((x) => x < lo || x > hi).forEach((x) => (g += `<circle cx="${cx}" cy="${Y(x)}" r="4.5" fill="${C.rose}"/>`));
            g += txt(cx, H - 24, n, { anchor: "middle", fill: C.ink });
          });
          return g;
        } },
      heat: { q: "Show correlations", name: "Heatmap", ex: "Correlation matrix of store metrics",
        why: "Color intensity encodes each value, so a correlation matrix shows at a glance which variables move together (teal) or in opposite directions (rose).",
        draw() {
          const v = ["Ad spend", "Footfall", "Sales", "Discount", "Returns"];
          const m = [[1, .72, .81, .35, .05], [.72, 1, .88, .22, .1], [.81, .88, 1, .41, -.18], [.35, .22, .41, 1, .46], [.05, .1, -.18, .46, 1]];
          const cs = 50, x0 = 170, y0 = 6; let g = "";
          const col = (x) => { const t = Math.abs(x), base = x >= 0 ? [14, 140, 127] : [217, 79, 112]; return `rgb(${base.map((c) => Math.round(255 - (255 - c) * t)).join(",")})`; };
          v.forEach((n, i) => {
            g += txt(x0 - 10, y0 + cs * i + cs / 2 + 4, n, { anchor: "end", fill: C.ink });
            g += `<text x="${x0 + cs * i + cs / 2}" y="${y0 + cs * 5 + 16}" font-size="10.5" fill="${C.ink}" text-anchor="middle">${n.split(" ")[0]}</text>`;
            v.forEach((_, j) => {
              const x = m[i][j];
              g += `<rect x="${x0 + cs * j}" y="${y0 + cs * i}" width="${cs - 2}" height="${cs - 2}" rx="4" fill="${col(x)}"/>` + txt(x0 + cs * j + cs / 2 - 1, y0 + cs * i + cs / 2 + 4, x.toFixed(2), { anchor: "middle", fill: Math.abs(x) > 0.55 ? "#fff" : C.ink, size: 11 });
            });
          });
          g += txt(450, 60, "+1: move together", { fill: C.accent, bold: 1 }) + txt(450, 82, "0: no relationship", { fill: C.soft }) + txt(450, 104, "−1: move oppositely", { fill: C.rose, bold: 1 });
          return g;
        } },
    };

    const btns = Object.entries(CH).map(([k, c]) => {
      const b = document.createElement("button");
      b.className = "btn"; b.type = "button"; b.textContent = c.q;
      b.addEventListener("click", () => show(k, b));
      bar.appendChild(b);
      return b;
    });
    function show(k, b) {
      press(btns, b);
      const c = CH[k];
      svg.innerHTML = c.draw();
      out.innerHTML = `<h5>${c.name}: ${c.ex}</h5><p>${c.why}</p>`;
    }
    show("bar", btns[0]);
  })();

  /* ------------------------------------------------------------
     2. Case study tabs
  ------------------------------------------------------------ */
  (function cases() {
    const root = document.getElementById("viz-cases");
    if (!root) return;
    const tabs = [...root.querySelectorAll("[data-tab]")];
    const panels = [...root.querySelectorAll("[data-panel]")];
    tabs.forEach((t) => t.addEventListener("click", () => {
      press(tabs, t);
      tabs.forEach((x) => x.setAttribute("aria-selected", String(x === t)));
      panels.forEach((p) => (p.hidden = p.dataset.panel !== t.dataset.tab));
    }));
  })();

  /* ------------------------------------------------------------
     3. Walmart stocking simulation
  ------------------------------------------------------------ */
  (function stock() {
    const root = document.getElementById("viz-stock");
    if (!root) return;
    const svg = $(root, "svg");
    const out = $(root, ".viz-out");
    const evBtns = [...root.querySelectorAll("[data-ev]")];
    const modeBtns = [...root.querySelectorAll("[data-mode]")];
    const ev = { heat: false, fest: false, rain: false };
    let mode = "fixed";

    const base = [500, 520, 510, 530, 515, 525, 510, 520];
    const noise = [1.02, 0.98, 1.03, 0.99, 1.01, 0.97, 1.02, 0.99];
    const FIXED = 540;

    function render() {
      const forecast = base.map((v, w) => {
        let f = v;
        if (ev.heat && (w === 2 || w === 3)) f *= 1.4;
        if (ev.fest && w === 5) f *= 1.3;
        if (ev.rain && w === 7) f *= 0.75;
        return f;
      });
      const actual = forecast.map((f, w) => Math.round(f * noise[w]));
      const stock = forecast.map((f) => (mode === "fixed" ? FIXED : Math.round(f * 1.05)));
      let short = 0, over = 0, total = 0;
      actual.forEach((a, w) => { short += Math.max(0, a - stock[w]); over += Math.max(0, stock[w] - a); total += a; });

      const W = 640, H = 270, L = 48, R = 16, T = 26, B = 34;
      const Y = (v) => T + (1 - v / 800) * (H - T - B);
      const sw = (W - L - R) / 8, bw = sw * 0.55;
      let g = "";
      for (let v = 0; v <= 800; v += 200) g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.grid}"/>` + txt(L - 8, Y(v) + 4, v, { anchor: "end" });
      g += txt(L - 40, T - 12, "Units per week");
      const X = (w) => L + sw * (w + 0.5);
      stock.forEach((s, w) => {
        g += `<rect x="${X(w) - bw / 2}" y="${Y(s)}" width="${bw}" height="${Y(0) - Y(s)}" rx="4" fill="${C.light}"/>`;
        if (actual[w] > s) g += `<rect x="${X(w) - bw / 2}" y="${Y(actual[w])}" width="${bw}" height="${Y(s) - Y(actual[w])}" rx="3" fill="${C.rose}" fill-opacity=".85"/>`;
        g += txt(X(w), H - 12, "W" + (w + 1), { anchor: "middle" });
      });
      g += `<polyline points="${actual.map((a, w) => `${X(w)},${Y(a)}`).join(" ")}" fill="none" stroke="${C.ink}" stroke-width="2.5"/>`;
      actual.forEach((a, w) => (g += `<circle cx="${X(w)}" cy="${Y(a)}" r="4" fill="${C.ink}"/>`));
      svg.innerHTML = g;

      const avail = 1 - short / total;
      $(root, '[data-stat="avail"]').textContent = (avail * 100).toFixed(1) + "%";
      $(root, '[data-stat="short"]').textContent = short.toLocaleString("en-IN");
      $(root, '[data-stat="over"]').textContent = over.toLocaleString("en-IN");

      const anyEv = ev.heat || ev.fest || ev.rain;
      out.innerHTML = !anyEv
        ? "<p>With steady demand, a fixed stock level works reasonably well. Turn on some events to see what happens when demand changes.</p>"
        : mode === "fixed"
        ? `<p>The fixed plan ignores the forecast, so the store runs short during demand spikes and over-stocks in quiet weeks. That is <b>${short.toLocaleString("en-IN")}</b> lost sales and <b>${over.toLocaleString("en-IN")}</b> surplus units. Switch to data-driven stocking.</p>`
        : `<p>Stock now follows the forecast, with a 5% safety buffer. Shortfalls almost disappear and surplus stays small, which is how Walmart improved on-shelf availability while cutting waste.</p>`;
    }

    evBtns.forEach((b) => b.addEventListener("click", () => { ev[b.dataset.ev] = !ev[b.dataset.ev]; b.setAttribute("aria-pressed", String(ev[b.dataset.ev])); render(); }));
    modeBtns.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; press(modeBtns, b); render(); }));
    render();
  })();

  /* ------------------------------------------------------------
     4. Uber surge pricing
  ------------------------------------------------------------ */
  (function surge() {
    const root = document.getElementById("viz-surge");
    if (!root) return;
    const svg = $(root, "svg");
    const out = $(root, ".viz-out");
    const dIn = $(root, '[data-in="d"]'), sIn = $(root, '[data-in="s"]');
    const evBtn = $(root, "[data-event]");
    let concert = false;

    function render() {
      const d = +dIn.value + (concert ? 90 : 0), s = +sIn.value;
      $(root, '[data-out="d"]').textContent = +dIn.value + (concert ? " + 90 from the concert" : "");
      $(root, '[data-out="s"]').textContent = s;
      const cap = s * 1.1;
      const ratio = d / cap;
      const mult = ratio <= 1 ? 1 : Math.min(3, Math.round((1 + (ratio - 1) * 0.9) * 10) / 10);
      const s2 = s * (1 + 0.4 * (mult - 1)), d2 = d * (1 - 0.2 * (mult - 1));
      const served1 = Math.min(1, cap / d), served2 = Math.min(1, (s2 * 1.1) / d2);
      const wait = Math.round(3 + 14 * (1 - served2) + 2 * Math.min(1, d2 / (s2 * 1.1)));

      const W = 640, L = 190, R = 60, bh = 26;
      let g = "";
      [["Fixed pricing", served1, C.soft], ["Dynamic pricing", served2, C.accent]].forEach(([n, v, col], i) => {
        const y = 22 + i * 52;
        g += txt(L - 12, y + 18, n, { anchor: "end", fill: C.ink, bold: 1, size: 13 });
        g += `<rect x="${L}" y="${y}" width="${W - L - R}" height="${bh}" rx="8" fill="${C.grid}"/>`;
        g += `<rect x="${L}" y="${y}" width="${(W - L - R) * v}" height="${bh}" rx="8" fill="${col}"/>`;
        g += txt(L + (W - L - R) * v + 8, y + 18, Math.round(v * 100) + "%", { fill: C.ink, bold: 1, size: 13 });
      });
      g += txt(L, 130, "Share of ride requests that get a car", {});
      svg.innerHTML = g;

      $(root, '[data-stat="mult"]').textContent = mult.toFixed(1) + "×";
      $(root, '[data-stat="fare"]').textContent = "₹" + Math.round(180 * mult);
      $(root, '[data-stat="wait"]').textContent = wait + " min";

      out.innerHTML = mult === 1
        ? "<p>Drivers can cover demand, so prices stay normal. Push ride requests up, or tap the concert button, to create a shortage.</p>"
        : `<p>Demand is ${ratio.toFixed(1)}× what drivers can handle. A ${mult.toFixed(1)}× price draws more drivers into the area and leads some riders to wait or share, so <b>${Math.round(served2 * 100)}%</b> of requests are served instead of <b>${Math.round(served1 * 100)}%</b>.</p>`;
    }
    dIn.addEventListener("input", render);
    sIn.addEventListener("input", render);
    evBtn.addEventListener("click", () => { concert = !concert; evBtn.setAttribute("aria-pressed", String(concert)); render(); });
    render();
  })();
})();
