// Reading helpers shared by all session pages
(function () {
  // Reading progress bar
  const bar = document.querySelector(".progress-bar");
  if (bar) {
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
    };
    document.addEventListener("scroll", update, { passive: true });
    update();
  }

  // Highlight the section being read in the contents list
  const links = [...document.querySelectorAll(".toc a[href^='#']")];
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const sections = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const visible = new Set();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      const current = sections.find((s) => visible.has(s));
      if (!current) return;
      links.forEach((a) => a.classList.remove("is-active"));
      map.get(current.id).classList.add("is-active");
    },
    { rootMargin: "-20% 0px -65% 0px" }
  );
  sections.forEach((s) => io.observe(s));

  // On small screens, collapse the contents after choosing a section
  const toc = document.querySelector("details.toc");
  links.forEach((a) =>
    a.addEventListener("click", () => {
      if (toc && window.innerWidth < 1080) toc.open = false;
    })
  );
  if (toc && window.innerWidth >= 1080) toc.open = true;
})();
