/* Kelassy Academy — maquette : interactions (aucun envoi réseau, aucun stockage) */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  /* En-tête : ombre au défilement */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  var menu = document.getElementById("menu");
  var openBtn = document.querySelector("[data-menu-open]");
  var closeBtn = document.querySelector("[data-menu-close]");
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) { menu.removeAttribute("inert"); } else { menu.setAttribute("inert", ""); }
    document.body.classList.toggle("menu-open", open);
    if (openBtn) openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { (closeBtn || menu).focus(); } else if (openBtn) { openBtn.focus(); }
  }
  if (openBtn) openBtn.addEventListener("click", function () { setMenu(true); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setMenu(false); });
  if (menu) {
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false); });
  }

  /* Apparition discrète au défilement */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Rail des formations : points + flèches */
  document.querySelectorAll("[data-rail]").forEach(function (rail) {
    var items = Array.prototype.slice.call(rail.children);
    var dotsWrap = document.querySelector('[data-rail-dots="' + rail.id + '"]');
    var dots = [];
    if (dotsWrap) {
      items.forEach(function (item, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Formation " + (i + 1) + " sur " + items.length);
        b.addEventListener("click", function () { rail.scrollTo({ left: item.offsetLeft - rail.offsetLeft - parseFloat(getComputedStyle(rail).paddingLeft), behavior: "smooth" }); });
        dotsWrap.appendChild(b); dots.push(b);
      });
    }
    function update() {
      var railBox = rail.getBoundingClientRect();
      var best = 0, bestD = Infinity;
      items.forEach(function (item, i) {
        var d = Math.abs(item.getBoundingClientRect().left - railBox.left - parseFloat(getComputedStyle(rail).paddingLeft));
        if (d < bestD) { bestD = d; best = i; }
      });
      dots.forEach(function (d, i) { d.setAttribute("aria-current", i === best ? "true" : "false"); });
      var prev = document.querySelector('[data-rail-prev="' + rail.id + '"]');
      var next = document.querySelector('[data-rail-next="' + rail.id + '"]');
      if (prev) prev.disabled = rail.scrollLeft < 8;
      if (next) next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8;
    }
    var t;
    rail.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(update, 60); }, { passive: true });
    window.addEventListener("resize", update);
    ["prev", "next"].forEach(function (dir) {
      var btn = document.querySelector('[data-rail-' + dir + '="' + rail.id + '"]');
      if (btn) btn.addEventListener("click", function () {
        var step = items[0] ? items[0].getBoundingClientRect().width + 16 : rail.clientWidth * .8;
        rail.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
      });
    });
    update();
  });

  /* Catalogue : filtres par domaine */
  var chips = document.querySelectorAll("[data-filter]");
  var rows = document.querySelectorAll("[data-domain]");
  var count = document.querySelector("[data-count]");
  function applyFilter(value) {
    var n = 0;
    chips.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-filter") === value ? "true" : "false"); });
    rows.forEach(function (r) {
      var show = value === "tout" || r.getAttribute("data-domain").split(" ").indexOf(value) > -1;
      r.hidden = !show; if (show) n++;
    });
    if (count) count.textContent = n + (n > 1 ? " formations affichées" : " formation affichée");
  }
  chips.forEach(function (c) { c.addEventListener("click", function () { applyFilter(c.getAttribute("data-filter")); }); });
  if (chips.length) applyFilter("tout");

  /* Fiche : sommaire actif */
  var ficheLinks = document.querySelectorAll(".fiche-nav a");
  if (ficheLinks.length && "IntersectionObserver" in window) {
    var map = {};
    ficheLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          ficheLinks.forEach(function (a) { a.classList.remove("is-active"); });
          var a = map[en.target.id]; a.classList.add("is-active");
          var ul = a.closest("ul");
          if (ul && ul.scrollWidth > ul.clientWidth) {
            ul.scrollTo({ left: a.parentNode.offsetLeft - (ul.clientWidth - a.parentNode.offsetWidth) / 2, behavior: "smooth" });
          }
        }
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* Contact : onglets */
  var tabs = document.querySelectorAll('[role="tab"]');
  function selectTab(name, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-tab") === name;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute("aria-controls"));
      if (p) p.hidden = !on;
      if (on && focus) t.focus();
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t.getAttribute("data-tab")); history.replaceState(null, "", "#" + t.getAttribute("data-tab")); });
    t.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var j = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[j].getAttribute("data-tab"), true);
    });
  });
  if (tabs.length) {
    var hash = (location.hash || "").slice(1);
    var valid = Array.prototype.some.call(tabs, function (t) { return t.getAttribute("data-tab") === hash; });
    selectTab(valid ? hash : tabs[0].getAttribute("data-tab"));
  }

  /* Pré-sélection de la formation depuis une fiche (?formation=slug) */
  var params = new URLSearchParams(location.search);
  var wanted = params.get("formation");
  if (wanted) {
    document.querySelectorAll("select[data-formations]").forEach(function (s) {
      if (s.querySelector('option[value="' + wanted + '"]')) s.value = wanted;
    });
  }

  /* Formulaires de démonstration : validation locale, rien n'est envoyé ni conservé */
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll("[required]").forEach(function (input) {
        var wrap = input.closest(".field, .check");
        var ok = input.type === "checkbox" ? input.checked : input.checkValidity() && input.value.trim() !== "";
        if (wrap) wrap.classList.toggle("has-error", !ok);
        input.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); return; }
      var success = document.getElementById(form.getAttribute("data-success"));
      /* Site en ligne : la demande s'ouvre, pré-remplie, dans la messagerie du visiteur */
      var to = form.getAttribute("data-mailto");
      if (to) {
        var lines = [];
        form.querySelectorAll("input, select, textarea").forEach(function (el) {
          if (el.type === "checkbox" || (el.type === "radio" && !el.checked)) return;
          var v = el.tagName === "SELECT" ? (el.selectedIndex > 0 ? el.options[el.selectedIndex].text : "") : el.value.trim();
          if (!v) return;
          var lab = el.type === "radio" ? el.closest("fieldset").querySelector("legend") : form.querySelector('label[for="' + el.id + '"]');
          lines.push((lab ? lab.childNodes[0].textContent.trim() : el.name) + " : " + v);
        });
        window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(form.getAttribute("data-subject") || "Demande depuis le site") + "&body=" + encodeURIComponent(lines.join("\n"));
      }
      form.reset();
      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.setAttribute("tabindex", "-1");
        success.focus();
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    form.addEventListener("input", function (e) {
      var wrap = e.target.closest(".field, .check");
      if (wrap && wrap.classList.contains("has-error")) {
        var ok = e.target.type === "checkbox" ? e.target.checked : e.target.checkValidity();
        if (ok) { wrap.classList.remove("has-error"); e.target.setAttribute("aria-invalid", "false"); }
      }
    });
  });
  document.querySelectorAll("[data-reset-form]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var form = document.getElementById(btn.getAttribute("data-reset-form"));
      var success = btn.closest(".success");
      if (success) success.hidden = true;
      if (form) { form.hidden = false; var f = form.querySelector("input, select, textarea"); if (f) f.focus(); }
    });
  });
})();
