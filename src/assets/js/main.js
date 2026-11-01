/* SCIPS — progressive enhancements. The site works without JavaScript. */
(() => {
  "use strict";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Gentle reveal for sections as they scroll into view */
  if (!reducedMotion && "IntersectionObserver" in window) {
    const targets = $$("main .section-head, main .task-list, main .facts, main .ruled-grid, main .photo-grid .figure, main .guides-strip, main .carousel__track, main .steps, main .accordion, main .guide-list, main .service, main .map-card, .cta__grid");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach((el) => { if (el.getBoundingClientRect().top > window.innerHeight) { el.setAttribute("data-reveal", ""); io.observe(el); } });
  }

  /* Header gains a shadow once the page scrolls */
  const masthead = $(".masthead");
  if (masthead) {
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:0;height:1px;width:1px";
    document.body.prepend(sentinel);
    new IntersectionObserver(([e]) => masthead.classList.toggle("is-stuck", !e.isIntersecting), { rootMargin: "80px 0px 0px 0px" }).observe(sentinel);
  }

  /* Mobile navigation ---------------------------------------------------- */
  const toggle = $(".menu-toggle");
  const nav = $("#site-nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
  }


  /* Search suggestions: popular searches on focus, live Pagefind results as you type */
  const box = $("[data-search-box]");
  if (box) {
    const input = $("input", box);
    const panel = $("[data-suggest]", box);
    const list = $("[data-suggest-list]", box);
    const heading = $("[data-suggest-heading]", box);
    const status = $("[data-suggest-status]", box);
    const siteBase = document.querySelector('link[rel="icon"]').getAttribute("href").replace("favicon.svg", "");
    const popular = JSON.parse(panel.dataset.popular || "[]");
    const icon = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 11l4 4" stroke="currentColor" stroke-width="2"/></svg>';
    let pagefind, items = [], active = -1, token = 0;

    const withBase = (url) => (url.startsWith("/") ? siteBase + url.slice(1) : url);
    const getPagefind = async () => (pagefind ??= await import(`${siteBase}pagefind/pagefind.js`).then(async (pf) => { await pf.options({ excerptLength: 18 }); return pf; }));

    const open = () => { panel.hidden = false; input.setAttribute("aria-expanded", "true"); };
    const close = () => { panel.hidden = true; input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); active = -1; };
    const setActive = (i) => {
      items.forEach((el, n) => el.setAttribute("aria-selected", String(n === i)));
      active = i;
      if (i >= 0) { input.setAttribute("aria-activedescendant", items[i].id); items[i].scrollIntoView({ block: "nearest" }); }
      else input.removeAttribute("aria-activedescendant");
    };
    const render = (rows, title) => {
      heading.textContent = title;
      list.replaceChildren(...rows.map((r, i) => {
        const li = document.createElement("li");
        li.id = `suggest-${i}`;
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", "false");
        li.className = `suggest__item ${r.kind ? `suggest__item--${r.kind}` : ""}`;
        li.dataset.url = r.url;
        li.innerHTML = r.html;
        li.addEventListener("mousedown", (e) => { e.preventDefault(); location.href = r.url; });
        return li;
      }));
      items = [...list.children];
      active = -1;
      open();
    };
    const showPopular = () => render(
      popular.map((p) => ({ kind: "popular", url: withBase(p.url), html: `${icon}<span class="suggest__title">${p.label}</span>` })),
      "Popular searches"
    );
    const showResults = async (q) => {
      const mine = ++token;
      try {
        const pf = await getPagefind();
        const search = await pf.debouncedSearch(q, {}, 180);
        if (!search || mine !== token) return;
        const data = await Promise.all(search.results.slice(0, 5).map((r) => r.data()));
        if (mine !== token) return;
        const rows = [];
        data.forEach((d) => {
          const sub = (d.sub_results || []).find((s) => s.url !== d.url && s.excerpt.includes("<mark>"));
          rows.push({ url: (sub || d).url, html: `<span class="suggest__title">${sub ? `${d.meta.title} › ${sub.title}` : d.meta.title}</span><span class="suggest__excerpt">${(sub || d).excerpt}</span>` });
        });
        const all = withBase(`/search/?q=${encodeURIComponent(q)}`);
        if (rows.length) {
          rows.push({ kind: "all", url: all, html: `See all results for “${q.replace(/[<>&"]/g, "")}” →` });
          render(rows, `${search.results.length} ${search.results.length === 1 ? "result" : "results"}`);
          status.textContent = `${search.results.length} results. Use up and down arrows to choose.`;
        } else {
          heading.textContent = "No matches";
          list.innerHTML = `<li class="suggest__empty" role="presentation">Nothing found for “${q.replace(/[<>&"]/g, "")}”. Try another word, or call 0121 544 1230.</li>`;
          items = [];
          open();
          status.textContent = "No results.";
        }
      } catch {
        close(); // search index unavailable (e.g. local dev without a build): fall back to the form
      }
    };

    input.addEventListener("focus", () => { input.value.trim().length < 2 ? showPopular() : showResults(input.value.trim()); getPagefind().catch(() => {}); });
    input.addEventListener("input", () => { const q = input.value.trim(); q.length < 2 ? showPopular() : showResults(q); });
    input.addEventListener("keydown", (e) => {
      if (panel.hidden && (e.key === "ArrowDown" || e.key === "ArrowUp")) { open(); }
      if (e.key === "ArrowDown") { e.preventDefault(); if (items.length) setActive((active + 1) % items.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (items.length) setActive(active <= 0 ? items.length - 1 : active - 1); }
      else if (e.key === "Enter" && active >= 0) { e.preventDefault(); location.href = items[active].dataset.url; }
      else if (e.key === "Escape") { if (!panel.hidden) { e.stopPropagation(); close(); } }
    });
    input.addEventListener("blur", () => setTimeout(close, 120));
  }

  /* Translate menu: close on outside click / Escape ---------------------- */
  const translate = $("[data-translate]");
  if (translate) {
    document.addEventListener("click", (e) => { if (!translate.contains(e.target)) translate.open = false; });
    translate.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { translate.open = false; $("summary", translate).focus(); }
    });
  }

  /* Hero slideshow (WCAG 2.2.2: can be paused; no autoplay if reduced motion) */
  const show = $("[data-slideshow]");
  if (show) {
    const slides = $$(".slideshow__slide", show);
    const captions = $$(".slideshow__captions p", show);
    const count = $("[data-slideshow-count]", show);
    const btn = $("[data-slideshow-toggle]", show);
    const icons = {
      pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2h3v12H4zM9 2h3v12H9z" fill="currentColor"/></svg>',
      play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z" fill="currentColor"/></svg>',
    };
    let index = 0, timer = null, playing = !reducedMotion;

    const goTo = (n) => {
      slides[index].classList.remove("is-active");
      slides[index].setAttribute("aria-hidden", "true");
      captions[index].classList.remove("is-active");
      index = (n + slides.length) % slides.length;
      slides[index].classList.add("is-active");
      slides[index].removeAttribute("aria-hidden");
      captions[index].classList.add("is-active");
      count.textContent = `${index + 1} / ${slides.length}`;
    };
    const setPlaying = (p) => {
      playing = p;
      clearInterval(timer);
      if (p) timer = setInterval(() => goTo(index + 1), 7000);
      btn.innerHTML = p ? icons.pause : icons.play;
      btn.setAttribute("aria-label", p ? "Pause slideshow" : "Play slideshow");
    };
    btn.addEventListener("click", () => setPlaying(!playing));
    document.addEventListener("visibilitychange", () => { if (document.hidden) clearInterval(timer); else if (playing) setPlaying(true); });
    setPlaying(playing);
  }

  /* Carousel: scroll-snap list with previous/next buttons ---------------- */
  $$("[data-carousel]").forEach((root) => {
    const track = $("[data-carousel-track]", root);
    const prev = $("[data-carousel-prev]", root);
    const next = $("[data-carousel-next]", root);
    const status = $("[data-carousel-status]", root);
    const items = $$(".carousel__item", track);
    $(".carousel__nav", root).hidden = false;

    const step = () => items[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
      const first = Math.round(track.scrollLeft / step()) + 1;
      status.textContent = `${Math.min(first, items.length)} of ${items.length}`;
    };
    const behavior = reducedMotion ? "auto" : "smooth";
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior }));
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); track.scrollBy({ left: step(), behavior }); }
      if (e.key === "ArrowLeft") { e.preventDefault(); track.scrollBy({ left: -step(), behavior }); }
    });
    let raf;
    track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* Table of contents: highlight the section in view --------------------- */
  const toc = $("[data-toc]");
  if (toc && "IntersectionObserver" in window) {
    const links = new Map($$("a", toc).map((a) => [a.hash.slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.remove("is-current"));
        links.get(entry.target.id)?.classList.add("is-current");
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    links.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* Map: static image first; becomes a movable map (Leaflet + OpenStreetMap) on request */
  const loadLeaflet = (() => {
    let promise;
    return (base) => promise ??= new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = `${base}assets/vendor/leaflet/leaflet.css`;
      document.head.append(css);
      const js = document.createElement("script");
      js.src = `${base}assets/vendor/leaflet/leaflet.js`;
      js.onload = () => resolve(window.L);
      js.onerror = reject;
      document.head.append(js);
    });
  })();
  const base = document.querySelector('link[rel="icon"]').getAttribute("href").replace("favicon.svg", "");

  $$("[data-map]").forEach((root) => {
    const canvas = $("[data-map-canvas]", root);
    const btn = $("[data-map-activate]", root);
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "Loading map…";
      try {
        const L = await loadLeaflet(base);
        const pos = [parseFloat(root.dataset.lat), parseFloat(root.dataset.lng)];
        canvas.replaceChildren();
        canvas.classList.add("is-live");
        const map = L.map(canvas, { center: pos, zoom: 16, scrollWheelZoom: false, zoomControl: true, attributionControl: true });
        map.attributionControl.setPrefix(false);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19, minZoom: 12,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        const pin = L.divIcon({
          className: "scips-pin",
          html: '<span class="map-card__label">SCIPS<span>National Metalforming Centre</span></span><svg viewBox="0 0 30 40" aria-hidden="true"><path d="M15 0C6.7 0 0 6.6 0 14.8 0 26 15 40 15 40s15-14 15-25.2C30 6.6 23.3 0 15 0z" fill="#191a17"/><circle cx="15" cy="14.5" r="6" fill="#e2792a"/></svg>',
          iconSize: [30, 40], iconAnchor: [15, 40],
        });
        L.marker(pos, { icon: pin, keyboard: false, title: "SCIPS office" }).addTo(map);
        map.on("click focus", () => map.scrollWheelZoom.enable());
        map.on("mouseout", () => map.scrollWheelZoom.disable());
        const hint = document.createElement("span");
        hint.className = "map-hint";
        hint.textContent = "Drag to move · use + and − to zoom";
        canvas.append(hint);
        setTimeout(() => (hint.style.opacity = "0"), 3500);
        canvas.setAttribute("aria-label", "Interactive map. Use arrow keys to move and plus or minus to zoom.");
        canvas.focus({ preventScroll: true });
      } catch {
        btn.disabled = false;
        btn.textContent = "Map couldn't load. Try again";
      }
    });
  });

  /* Contact form: validation with an error summary, then open email ------- */
  const form = $("[data-contact-form]");
  if (form) {
    const summary = $("[data-error-summary]");
    const list = $("[data-error-list]");
    const notice = $("[data-form-notice]");
    const topic = new URLSearchParams(location.search).get("topic");
    if (topic && form.topic.querySelector(`option[value="${CSS.escape(topic)}"]`)) form.topic.value = topic;

    const rules = [
      ["name", (f) => f.name.value.trim() !== ""],
      ["email", (f) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())],
      ["message", (f) => f.message.value.trim() !== ""],
      ["consent", (f) => f.consent.checked],
    ];

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (form.website.value) return; // honeypot
      list.replaceChildren();
      let firstError = null;
      rules.forEach(([name, valid]) => {
        const field = $(`#field-${name}`);
        const ok = valid(form);
        field.classList.toggle("has-error", !ok);
        form[name].setAttribute("aria-invalid", String(!ok));
        if (!ok) {
          firstError ??= name;
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = `#${name}`;
          a.textContent = $(".error-message", field).textContent.replace(/^Error:\s*/, "");
          a.addEventListener("click", (ev) => { ev.preventDefault(); form[name].focus(); });
          li.append(a);
          list.append(li);
        }
      });
      if (firstError) {
        summary.classList.add("is-visible");
        notice.classList.remove("is-visible");
        summary.focus();
        return;
      }
      summary.classList.remove("is-visible");
      const topicText = form.topic.options[form.topic.selectedIndex].text;
      const body = [
        `Name: ${form.name.value.trim()}`,
        `Email: ${form.email.value.trim()}`,
        `Phone: ${form.phone.value.trim() || "Not given"}`,
        `Town: ${form.town.value || "Not given"}`,
        "",
        form.message.value.trim(),
      ].join("\n");
      window.location.href = `mailto:${form.getAttribute("action").replace("mailto:", "")}?subject=${encodeURIComponent(`Website enquiry: ${topicText}`)}&body=${encodeURIComponent(body)}`;
      notice.classList.add("is-visible");
      notice.focus();
    });
  }
})();
