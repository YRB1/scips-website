/* SCIPS — progressive enhancements. The site works without JavaScript. */
(() => {
  "use strict";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Gentle reveal for sections as they scroll into view */
  if (!reducedMotion && "IntersectionObserver" in window) {
    const targets = $$("main .section-head, main .task-list, main .facts, main .ruled-grid, main .guides-strip, main .steps, main .accordion, main .guide-list, main .service, main .map-card, .cta__grid, .xs__facts, .xt__rows, .xr__grid, .xg__list, .xp__intro .container, .xc__grid > div");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach((el) => { if (el.getBoundingClientRect().top > window.innerHeight) { el.setAttribute("data-reveal", ""); io.observe(el); } });
  }

  /* Scroll engine -----------------------------------------------------------
     One rAF-throttled pass per scroll: the header picks a light or dark look
     from the section beneath it, the contact pill steps aside near the
     footer, and [data-scene] elements get their progress. Scenes only run
     when html has .motion (set in the <head>, off with "reduce motion"). */
  const root = document.documentElement;
  const motion = root.classList.contains("motion");
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const range = (v, a, b) => clamp((v - a) / (b - a));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let H = window.innerHeight;

  const head = $("[data-site-head]");
  const darks = $$("[data-theme='dark']");
  const pill = $("[data-pill]");
  const pillStops = $$("[data-hide-pill]");

  const chrome = () => {
    if (head) {
      const y = head.getBoundingClientRect().bottom - 20;
      const dark = darks.some((d) => { const r = d.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
      head.classList.toggle("is-light", !dark);
      head.classList.toggle("is-scrolled", window.scrollY > 24);
      head.style.setProperty("--progress", clamp(window.scrollY / (root.scrollHeight - H)).toFixed(4));
    }
    if (pill) {
      const near = pillStops.some((s) => { const r = s.getBoundingClientRect(); return r.top < H - 60 && r.bottom > 0; });
      pill.classList.toggle("is-hidden", near || root.classList.contains("menu-is-open"));
      // Tuck the pill away while reading down a page; bring it back on the way up
      const y = window.scrollY, dy = y - (pill._y ?? y);
      if (Math.abs(dy) > 6) { pill.classList.toggle("is-tucked", dy > 0 && y > H && !pill.contains(document.activeElement)); pill._y = y; }
      pill._y ??= y;
    }
  };

  /* Hero: the house window grows until the photo fills the screen */
  const hero = (el) => {
    const stage = el.firstElementChild;
    const r = el.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - H));
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const small = sw < 768;
    const w0 = small ? clamp(sw * 0.52, 176, 240) : clamp(sw * 0.25, 208, 384);
    const h0 = Math.min(sh * (small ? 0.52 : 0.6), w0 * (small ? 1.45 : 1.5));
    const roof = 0.26, cy = sh * 0.54;
    const S = Math.max(sw / w0, cy / (h0 * (0.5 - roof)), (sh - cy) / (h0 * 0.5)) * 1.08;
    const e = ease(range(p, 0, 0.7));
    const s = 1 + (S - 1) * e;
    const w = w0 * s, h = h0 * s;
    const after = ease(range(p, 0.66, 0.9));
    stage.style.cssText =
      `--ww:${w}px;--wh:${h}px;--wx:${(sw - w) / 2}px;--wy:${cy - h / 2}px;--sw:${sw}px;--sh:${sh}px;` +
      `--zoom:${1.12 - 0.12 * e};--split:${e * sw * 0.5}px;--blur:${e * 16}px;--to:${1 - range(p, 0, 0.45)};` +
      `--ui:${1 - range(p, 0, 0.12)};--bars:${0.55 * (1 - range(p, 0, 0.3))};--frame:${1 - range(p, 0.1, 0.5)};` +
      `--shade:${0.2 + 0.6 * range(p, 0.5, 0.85)};--after:${after}`;
    stage.querySelector(".xh__after").style.pointerEvents = after > 0.5 ? "auto" : "none";
  };

  /* Statement: words light up as the paragraph moves up the screen */
  const words = new Map();
  $$("[data-words]").forEach((p) => {
    if (!motion) return;
    const esc = (t) => t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    p.innerHTML = p.textContent.trim().split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
    words.set(p, $$(".w", p));
  });
  const reveal = (el) => {
    words.forEach((spans, p) => {
      if (!el.contains(p)) return;
      const t = p.getBoundingClientRect();
      const prog = clamp((H * 0.85 - t.top) / (t.height + H * 0.35));
      const n = spans.length;
      spans.forEach((s, i) => { s.style.opacity = (0.14 + 0.86 * clamp(prog * (n + 3) - i)).toFixed(3); });
    });
    $$("[data-speed]", el).forEach((f) => {
      const r = el.getBoundingClientRect();
      f.style.setProperty("--y", `${((r.top + r.height / 2 - H / 2) * parseFloat(f.dataset.speed)).toFixed(1)}px`);
    });
  };

  /* Situations: one at a time while the section is held on screen */
  const steps = (el) => {
    const r = el.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - H));
    const items = $$("[data-step]", el);
    const n = items.length;
    const i = Math.min(n - 1, Math.floor(p * n * 0.999));
    if (el._step !== i) {
      el._step = i;
      items.forEach((it, k) => { it.classList.toggle("is-active", k === i); it.classList.toggle("is-past", k < i); });
      const cur = $("[data-step-current]", el);
      if (cur) cur.textContent = String(i + 1).padStart(2, "0");
    }
    el.style.setProperty("--p", ((i + 1) / n).toFixed(3));
  };

  /* Places: each panel settles as it slides over the last, which dims */
  const panels = $$(".xp__panel");
  const panel = (el) => {
    const r = el.getBoundingClientRect();
    const enter = clamp(1 - r.top / H);
    el.style.setProperty("--zoom", (1.15 - 0.15 * ease(enter)).toFixed(4));
    el.style.setProperty("--ny", `${((1 - enter) * 60).toFixed(1)}px`);
    const prev = panels[panels.indexOf(el) - 1];
    if (prev) prev.style.setProperty("--dim", enter.toFixed(3));
  };

  /* Track record: outlined words drift sideways */
  const drift = (el) => {
    const r = el.getBoundingClientRect();
    const t = $(".xr__drift", el);
    const p = clamp((H - r.top) / (H + r.height));
    t.style.setProperty("--dx", `${(-p * (t.scrollWidth - root.clientWidth) * 0.6).toFixed(1)}px`);
  };

  /* Inner page header: photo drifts slower than the page */
  const header = (el) => {
    const r = el.getBoundingClientRect();
    const bg = $(".page-header__bg img", el);
    if (bg) bg.style.setProperty("--py", `${(-r.top * 0.28).toFixed(1)}px`);
  };

  const sceneFns = { hero, reveal, steps, panel, drift, header };
  const scenes = motion ? $$("[data-scene]").filter((el) => sceneFns[el.dataset.scene]) : [];

  /* Tasks: the photo follows the row you point at, or the row mid-screen */
  const tasks = $("[data-tasks]");
  let pointing = false;
  const setTask = (i) => {
    if (!tasks || tasks._i === i) return;
    tasks._i = i;
    $$("[data-task]", tasks).forEach((a) => a.classList.toggle("is-active", +a.dataset.task === i));
    $$("[data-task-img]", tasks).forEach((m) => m.classList.toggle("is-active", +m.dataset.taskImg === i));
  };
  if (tasks) {
    const rows = $$("[data-task]", tasks);
    rows.forEach((a) => {
      a.addEventListener("mouseenter", () => { pointing = true; setTask(+a.dataset.task); });
      a.addEventListener("focus", () => setTask(+a.dataset.task));
    });
    $(".xt__rows", tasks).addEventListener("mouseleave", () => { pointing = false; });
    setTask(0);
  }
  const taskByScroll = () => {
    if (!tasks || pointing || window.matchMedia("(max-width: 60em)").matches) return;
    const r = tasks.getBoundingClientRect();
    if (r.bottom < 0 || r.top > H) return;
    let best = 0, dist = Infinity;
    $$("[data-task]", tasks).forEach((a, i) => {
      const b = a.getBoundingClientRect();
      const d = Math.abs(b.top + b.height / 2 - H * 0.5);
      if (d < dist) { dist = d; best = i; }
    });
    setTask(best);
  };

  let ticking = false;
  const frame = () => {
    ticking = false;
    chrome();
    taskByScroll();
    scenes.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > -H && r.top < H * 2) sceneFns[el.dataset.scene](el);
    });
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", () => { H = window.innerHeight; request(); });
  frame();

  /* Smooth wheel scrolling (mouse and trackpad, motion on). The page still
     scrolls natively, so keyboard, scrollbar, touch, anchors and find-in-page
     behave as normal; only wheel input is eased. */
  if (motion && window.matchMedia("(pointer: fine)").matches) {
    let target = window.scrollY, current = target, running = false, then = 0;
    const loop = (now) => {
      const dt = Math.min(64, now - (then || now - 16.7));
      then = now;
      current += (target - current) * (1 - Math.pow(1 - 0.1, dt / 16.7));
      if (Math.abs(target - current) < 0.4) { current = target; running = false; }
      window.scrollTo({ top: current, behavior: "instant" });
      if (running) requestAnimationFrame(loop);
    };
    window.addEventListener("wheel", (e) => {
      if (e.ctrlKey || e.defaultPrevented || root.classList.contains("menu-is-open")) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.target.closest(".suggest, .translate, .leaflet-container, .nav.is-open, textarea, [data-native-scroll]")) return;
      e.preventDefault();
      const d = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * H : e.deltaY;
      if (!running) { current = window.scrollY; target = current; }
      target = clamp(target + d, 0, root.scrollHeight - H);
      if (!running) { running = true; then = 0; requestAnimationFrame(loop); }
    }, { passive: false });
    window.addEventListener("scroll", () => { if (!running) target = current = window.scrollY; }, { passive: true });
  }

  /* Headings slide up word by word as they come into view */
  if (motion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -10% 0px" });
    const esc = (t) => t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    $$("[data-split]").forEach((el) => {
      let i = 0;
      const build = (node) => [...node.childNodes].map((n) => {
        if (n.nodeType === 3) return n.textContent.replace(/\S+/g, (w) => `<span class="sw" aria-hidden="true"><span class="si" style="--i:${i++}">${esc(w)}</span></span>`);
        if (n.nodeType !== 1) return "";
        const tag = n.tagName.toLowerCase();
        return `<${tag}${n.className ? ` class="${n.className}"` : ""}>${build(n)}</${tag}>`;
      }).join("");
      el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
      el.innerHTML = build(el).trim();
      io.observe(el);
    });
  }

  /* Town names drift sideways, faster while you scroll */
  const marquee = $("[data-marquee]");
  if (marquee && motion) {
    const track = marquee.firstElementChild;
    let x = 0, lastY = window.scrollY, vel = 0, on = false, then = 0;
    const tick = (now) => {
      const dt = Math.min(64, now - (then || now - 16.7)); then = now;
      const y = window.scrollY;
      vel += ((y - lastY) - vel) * 0.12; lastY = y;
      const half = track.scrollWidth / 2;
      x -= (0.045 * dt) + vel * 0.6;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      if (on) requestAnimationFrame(tick);
    };
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) { then = 0; requestAnimationFrame(tick); } }).observe(marquee);
  }

  /* A label bubble follows the pointer over cards ("Read", "Open") */
  if (motion && window.matchMedia("(pointer: fine)").matches) {
    const bubble = document.createElement("div");
    bubble.className = "cursor";
    bubble.setAttribute("aria-hidden", "true");
    bubble.innerHTML = "<span></span>";
    document.body.append(bubble);
    const label = bubble.firstChild;
    let mx = 0, my = 0, bx = 0, by = 0, live = false;
    const follow = () => {
      bx += (mx - bx) * 0.2; by += (my - by) * 0.2;
      bubble.style.transform = `translate3d(${bx.toFixed(1)}px,${by.toFixed(1)}px,0)`;
      if (live || Math.abs(mx - bx) > 0.5) requestAnimationFrame(follow);
    };
    document.addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      const host = e.target.closest?.("[data-cursor]");
      const link = e.target.closest?.("a, button, input, summary");
      const show = !!host && (!link || link === host) && e.pointerType === "mouse";
      if (show) label.textContent = host.dataset.cursor;
      if (show && !live) { bx = mx; by = my; requestAnimationFrame(follow); }
      live = show;
      bubble.classList.toggle("is-on", show);
    }, { passive: true });
    document.addEventListener("pointerleave", () => { live = false; bubble.classList.remove("is-on"); });
  }

  /* Footer is uncovered from beneath the page, when it fits on screen */
  const footer = $(".site-footer");
  const fitFooter = () => root.classList.toggle("footer-reveal", motion && !!footer && footer.offsetHeight < H * 0.92 && root.clientWidth >= 768);
  fitFooter();
  window.addEventListener("resize", fitFooter);

  /* Intro: on the first visit to the home page in a session */
  const intro = $("[data-intro]");
  if (intro) {
    if (!root.classList.contains("intro-on")) intro.remove();
    else {
      const count = $("[data-intro-count]", intro);
      const img = $(".xh__photo img");
      const ready = Promise.race([
        Promise.all([img?.decode?.().catch(() => {}), document.fonts?.ready]),
        new Promise((r) => setTimeout(r, 2200)),
      ]);
      const start = performance.now();
      let done = false;
      const counter = (now) => {
        const p = Math.min(done ? 100 : 92, Math.round(((now - start) / 1100) * 100));
        count.textContent = String(p).padStart(3, "0");
        if (p < 100) requestAnimationFrame(counter);
      };
      requestAnimationFrame(counter);
      Promise.all([ready, new Promise((r) => setTimeout(r, 1150))]).then(() => {
        done = true;
        setTimeout(() => {
          intro.classList.add("is-leaving");
          root.classList.remove("intro-on");
          try { sessionStorage.setItem("scips-intro", "1"); } catch {}
          setTimeout(() => intro.remove(), 1100);
        }, 180);
      });
    }
  }

  /* Keyboard users tabbing into the hero's buttons: scroll them into view */
  $$(".xh__after a").forEach((a) => a.addEventListener("focus", () => {
    if (!motion) return;
    const el = a.closest(".xh");
    const end = el.offsetTop + el.offsetHeight - H;
    if (window.scrollY < end - 4) window.scrollTo({ top: end, behavior: "instant" });
  }));

  /* Guide: copy link + feedback */
  $$("[data-share]").forEach((root) => {
    const btn = $("[data-copy]", root);
    if (!btn || !navigator.clipboard) return;
    btn.hidden = false;
    btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(root.dataset.url);
      const label = $("span", btn);
      label.textContent = "Link copied";
      setTimeout(() => (label.textContent = "Copy link"), 2500);
    });
  });
  $$("[data-feedback]").forEach((root) => {
    $$("[data-fb]", root).forEach((b) => b.addEventListener("click", () => {
      $$("[data-fb]", root).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      $("[data-fb-yes]", root).hidden = b.dataset.fb !== "yes";
      $("[data-fb-no]", root).hidden = b.dataset.fb !== "no";
    }));
  });

  /* Mobile navigation ---------------------------------------------------- */
  const toggle = $(".menu-toggle");
  const nav = $("#site-nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      head?.classList.toggle("menu-open", open);
      root.classList.toggle("menu-is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
      chrome();
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia("(min-width: 68.0625em)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
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
