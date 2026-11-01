/* SCIPS — progressive enhancements. The site works without JavaScript. */
(() => {
  "use strict";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* Map: only load OpenStreetMap when asked ------------------------------ */
  $$("[data-map]").forEach((map) => {
    $("[data-map-load]", map)?.addEventListener("click", () => {
      const frame = document.createElement("iframe");
      frame.title = "Map showing the SCIPS office at the National Metalforming Centre, West Bromwich";
      frame.src = map.dataset.src;
      frame.loading = "lazy";
      map.replaceChildren(frame);
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
