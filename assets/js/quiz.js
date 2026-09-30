// Data-Class — end-of-session quiz. Renders window.QUIZZES[n] into .mcq[data-session="n"].
(function () {
  const L = ["A", "B", "C", "D"];
  document.querySelectorAll(".mcq[data-session]").forEach((root) => {
    const qs = (window.QUIZZES || {})[+root.dataset.session];
    if (!qs) { root.innerHTML = "<p>Quiz coming soon.</p>"; return; }
    const ans = new Array(qs.length).fill(null);

    function card(q, i) {
      const done = ans[i] !== null, right = done && ans[i] === q.a;
      const opts = q.o.map((t, k) => {
        let cls = "mcq-opt";
        if (done && k === q.a) cls += " is-right";
        else if (done && k === ans[i]) cls += " is-wrong";
        return `<li><button type="button" class="${cls}" data-q="${i}" data-k="${k}" ${done ? 'disabled aria-disabled="true"' : ""}><span class="mcq-letter" aria-hidden="true">${L[k]}</span><span>${t}</span></button></li>`;
      }).join("");
      const fb = done ? `<div class="mcq-feedback ${right ? "ok" : "no"}" role="status"><b>${right ? "✓ Correct." : `✗ Not quite. The answer is ${L[q.a]}.`}</b> ${q.e}</div>` : "";
      return `<fieldset class="mcq-q${done ? (right ? " done-right" : " done-wrong") : ""}"><legend><span class="mcq-num">${i + 1}</span>${q.q}</legend><ol class="mcq-opts">${opts}</ol>${fb}</fieldset>`;
    }

    function render(focusIdx) {
      const n = ans.filter((a) => a !== null).length, c = ans.filter((a, i) => a === qs[i].a).length;
      const bar = `<div class="mcq-progress" aria-live="polite"><div class="mcq-track"><span style="width:${(n / qs.length) * 100}%"></span></div><span>${n} of ${qs.length} answered · <b>${c} correct</b></span></div>`;
      let result = "";
      if (n === qs.length) {
        const msg = c === qs.length ? "Perfect score: you've mastered this session." : c >= 8 ? "Great work: you have a solid grasp of this session." : c >= 5 ? "Good effort. Review the explanations above for the ones you missed." : "Worth another look: revisit the session, then try again.";
        result = `<div class="mcq-result"><div class="mcq-score">${c}<small>/ ${qs.length}</small></div><div><b>${msg}</b><p>Scroll up to review the explanations, or revisit the session and try again.</p><button type="button" class="btn is-on" data-retake>Retake the quiz</button></div></div>`;
      }
      root.innerHTML = bar + qs.map(card).join("") + result;
      if (focusIdx !== undefined) { const fb = root.querySelectorAll(".mcq-q")[focusIdx]?.querySelector(".mcq-feedback"); if (fb) fb.setAttribute("tabindex", "-1"); }
    }

    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-retake]")) { ans.fill(null); render(); root.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      const b = e.target.closest("[data-q]");
      if (!b || b.disabled) return;
      const i = +b.dataset.q;
      if (ans[i] !== null) return;
      ans[i] = +b.dataset.k;
      render(i);
    });
    render();
  });
})();
