/* PilotKYC documentation — client-side renderer.
 * Loads content/manifest.json + content/*.md, renders with marked (vendored), no build step.
 * Routes: #/<slug>  and  #/<slug>/<heading-id>
 */
(function () {
  "use strict";

  var CFG = window.PILOTKYC || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var state = { manifest: null, pages: [], bySlug: {}, raw: {}, current: null, index: [] };
  var currentSlug = "";

  /* ---------- safe storage ---------- */
  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function slugify(s) {
    return String(s).toLowerCase().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
  }
  function absUrl(rel) {
    try { return new URL(rel, window.location.href).href; } catch (e) { return rel; }
  }
  function subst(text) {
    var openapi = absUrl("../openapi.yaml");
    return text
      .replace(/\{\{BASE_URL\}\}/g, CFG.baseUrl || "")
      .replace(/\{\{API_ORIGIN\}\}/g, CFG.apiOrigin || "")
      .replace(/\{\{VERSION\}\}/g, CFG.version || "")
      .replace(/\{\{CONTACT_URL\}\}/g, CFG.contactUrl || "")
      .replace(/\{\{OPENAPI_URL\}\}/g, openapi)
      .replace(/\{\{SWAGGER_URL\}\}/g, "https://editor.swagger.io/?url=" + encodeURIComponent(openapi));
  }
  function fetchText(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " -> HTTP " + r.status);
      return r.text();
    });
  }

  /* ---------- marked setup ---------- */
  var usedIds = {};
  function uniqueId(base) {
    var id = base || "section", n = 1;
    while (usedIds[id]) { n += 1; id = base + "-" + n; }
    usedIds[id] = true;
    return id;
  }

  marked.use({
    gfm: true,
    breaks: false,
    renderer: {
      heading: function (text, level, raw) {
        var explicit = /\s*\{#([\w-]+)\}\s*$/.exec(raw);
        var cleanText = text.replace(/\s*\{#[\w-]+\}\s*$/, "");
        var id = uniqueId(explicit ? explicit[1] : slugify(raw));
        var anchor = level >= 2 && level <= 3
          ? '<a class="anchor" href="#/' + currentSlug + "/" + id + '" aria-label="Link to this section">#</a>' : "";
        return "<h" + level + ' id="' + id + '">' + cleanText + anchor + "</h" + level + ">\n";
      },
      code: function (code, infostring) {
        var m = /^(\S*)\s*(.*)$/.exec(infostring || "");
        var lang = (m && m[1]) || "text";
        var meta = (m && m[2]) || "";
        var tab = /tab="([^"]*)"/.exec(meta);
        var title = /title="([^"]*)"/.exec(meta);
        return '<pre class="raw-code" data-lang="' + esc(lang) + '"' +
          (tab ? ' data-tab="' + esc(tab[1]) + '"' : "") +
          (title ? ' data-title="' + esc(title[1]) + '"' : "") +
          "><code>" + esc(code) + "</code></pre>\n";
      },
      table: function (header, body) {
        return '<div class="table-wrap"><table><thead>' + header + "</thead><tbody>" + body + "</tbody></table></div>\n";
      },
      link: function (href, title, text) {
        var external = /^https?:\/\//i.test(href);
        return '<a href="' + esc(href) + '"' + (title ? ' title="' + esc(title) + '"' : "") +
          (external ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + text + "</a>";
      }
    }
  });

  /* ---------- post-processing of rendered HTML ---------- */
  function buildCallouts(root) {
    $$("blockquote", root).forEach(function (bq) {
      var p = bq.querySelector("p");
      if (!p) return;
      var m = /^\s*\[!(NOTE|TIP|WARNING|DANGER)\]\s*/i.exec(p.innerHTML);
      if (!m) return;
      var kind = m[1].toLowerCase();
      var titles = { note: "Note", tip: "Tip", warning: "Important", danger: "Caution" };
      p.innerHTML = p.innerHTML.slice(m[0].length);
      if (!p.textContent.trim()) p.remove();
      bq.classList.add("callout", kind);
      var t = document.createElement("div");
      t.className = "callout-title";
      t.textContent = titles[kind];
      bq.insertBefore(t, bq.firstChild);
    });
  }

  function copyText(text, btn) {
    function done() {
      var prev = btn.textContent;
      btn.textContent = "Copied";
      btn.classList.add("done");
      setTimeout(function () { btn.textContent = prev; btn.classList.remove("done"); }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { btn.textContent = "Error"; }
      document.body.removeChild(ta);
    }
  }

  function buildCodeBlocks(root) {
    var pres = $$("pre.raw-code", root);
    var seen = new Set();
    pres.forEach(function (pre) {
      if (seen.has(pre)) return;
      var group = [pre];
      seen.add(pre);
      if (pre.dataset.tab) {
        var n = pre.nextElementSibling;
        while (n && n.matches("pre.raw-code[data-tab]")) { group.push(n); seen.add(n); n = n.nextElementSibling; }
      }
      var wrap = document.createElement("div");
      wrap.className = "codeblock";
      var bar = document.createElement("div");
      bar.className = "codebar";
      var copy = document.createElement("button");
      copy.type = "button"; copy.className = "copy-btn"; copy.textContent = "Copy";

      if (group.length > 1 || pre.dataset.tab) {
        var tabs = document.createElement("div");
        tabs.className = "tabs"; tabs.setAttribute("role", "tablist");
        var panels = [];
        group.forEach(function (g, i) {
          var b = document.createElement("button");
          b.type = "button"; b.className = "tab-btn"; b.setAttribute("role", "tab");
          b.textContent = g.dataset.tab || g.dataset.lang;
          b.dataset.tab = g.dataset.tab || g.dataset.lang;
          b.setAttribute("aria-selected", i === 0 ? "true" : "false");
          tabs.appendChild(b);
          g.className = ""; g.hidden = i !== 0;
          panels.push(g);
        });
        bar.appendChild(tabs);
        bar.appendChild(copy);
        wrap.appendChild(bar);
        group[0].parentNode.insertBefore(wrap, group[0]);
        panels.forEach(function (g) { wrap.appendChild(g); });
        wrap._select = function (label) {
          var found = false;
          $$(".tab-btn", tabs).forEach(function (b, i) {
            var on = b.dataset.tab === label;
            if (on) { found = true; }
          });
          if (!found) return false;
          $$(".tab-btn", tabs).forEach(function (b, i) {
            var on = b.dataset.tab === label;
            b.setAttribute("aria-selected", on ? "true" : "false");
            panels[i].hidden = !on;
          });
          return true;
        };
        tabs.addEventListener("click", function (e) {
          var b = e.target.closest(".tab-btn");
          if (!b) return;
          lsSet("pk.docs.lang", b.dataset.tab);
          $$(".codeblock", root).forEach(function (cb) { if (cb._select) cb._select(b.dataset.tab); });
        });
        copy.addEventListener("click", function () {
          var vis = panels.filter(function (p) { return !p.hidden; })[0];
          copyText(vis ? vis.textContent : "", copy);
        });
        var pref = lsGet("pk.docs.lang");
        if (pref && wrap._select) wrap._select(pref);
      } else {
        var label = document.createElement("span");
        label.className = "label";
        label.textContent = pre.dataset.title || pre.dataset.lang;
        bar.appendChild(label);
        bar.appendChild(copy);
        wrap.appendChild(bar);
        pre.className = "";
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);
        copy.addEventListener("click", function () { copyText(pre.textContent, copy); });
      }
    });
  }

  /* ---------- webhook signature calculator widget ---------- */
  function mountSignatureCalculator(host) {
    host.className = "widget";
    host.innerHTML =
      "<h4>Webhook signature calculator</h4>" +
      "<p>Computes the <code>PilotKYC-Signature</code> header for a test payload in your browser. Use a throwaway secret, never a real one.</p>" +
      '<label>Webhook secret (test value)</label><input data-f="secret" autocomplete="off" spellcheck="false">' +
      '<label>Timestamp t (unix seconds)</label><input data-f="ts" autocomplete="off" spellcheck="false">' +
      '<label>Raw request body (signed byte-for-byte, exactly as received)</label><textarea data-f="body" rows="3" spellcheck="false"></textarea>' +
      '<button type="button" class="btn" data-act="now">Use current time</button>' +
      '<div class="out" data-out="canon"></div>' +
      '<div class="out sig" data-out="sig"></div>';
    var f = function (n) { return host.querySelector('[data-f="' + n + '"]'); };
    f("secret").value = "whsec_test_secret";
    f("ts").value = "1767225600";
    f("body").value = '{"id":"evt_test","type":"session.completed"}';

    function hex(buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    }
    function recompute() {
      var ts = f("ts").value.trim();
      var signed = ts + "." + f("body").value;
      host.querySelector('[data-out="canon"]').textContent = "Signed string:\n" + signed;
      var sigEl = host.querySelector('[data-out="sig"]');
      if (!window.crypto || !window.crypto.subtle) { sigEl.textContent = "WebCrypto is unavailable (HTTPS or localhost is required)."; return; }
      var enc = new TextEncoder();
      window.crypto.subtle.importKey("raw", enc.encode(f("secret").value), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
        .then(function (key) { return window.crypto.subtle.sign("HMAC", key, enc.encode(signed)); })
        .then(function (sig) { sigEl.textContent = "PilotKYC-Signature: t=" + ts + ",v1=" + hex(sig); })
        .catch(function () { sigEl.textContent = "Could not compute the signature."; });
    }
    host.addEventListener("input", recompute);
    host.querySelector('[data-act="now"]').addEventListener("click", function () {
      f("ts").value = String(Math.floor(Date.now() / 1000)); recompute();
    });
    recompute();
  }

  function mountWidgets(root) {
    $$("[data-widget]", root).forEach(function (el) {
      if (el.dataset.widget === "signature-calculator") mountSignatureCalculator(el);
    });
  }

  /* ---------- sidebar / nav ---------- */
  function buildNav() {
    var nav = $("#nav");
    nav.innerHTML = "";
    state.manifest.groups.forEach(function (g) {
      var wrap = document.createElement("div");
      wrap.className = "nav-group";
      var h = document.createElement("h4");
      h.textContent = g.title;
      wrap.appendChild(h);
      g.pages.forEach(function (p) {
        var a = document.createElement("a");
        a.className = "nav-link";
        a.href = "#/" + p.slug;
        a.dataset.slug = p.slug;
        var span = document.createElement("span");
        span.textContent = p.title;
        a.appendChild(span);
        if (p.tag) {
          var t = document.createElement("span");
          var kind = p.tag === "GET" ? "get" : p.tag === "POST" ? "post" : p.tag === "DELETE" ? "post" : p.tag === "soon" ? "soon" : "";
          t.className = "tag " + kind;
          t.textContent = p.tag;
          a.appendChild(t);
        }
        wrap.appendChild(a);
      });
      nav.appendChild(wrap);
    });
  }

  function markActive(slug) {
    $$(".nav-link").forEach(function (a) {
      var on = a.dataset.slug === slug;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  /* ---------- search ---------- */
  function buildIndex() {
    state.index = [];
    state.pages.forEach(function (p) {
      var text = state.raw[p.slug] || "";
      var lines = text.split("\n");
      var inFence = false;
      state.index.push({ type: "page", slug: p.slug, anchor: "", title: p.title, page: p.title, text: p.title });
      lines.forEach(function (line) {
        if (/^\s*```/.test(line)) { inFence = !inFence; return; }
        if (inFence) return;
        var h = /^(#{2,3})\s+(.*?)\s*(?:\{#([\w-]+)\})?\s*$/.exec(line);
        if (h) {
          var title = h[2].replace(/[`*_<>]/g, "").replace(/\s*\{#[\w-]+\}\s*$/, "");
          state.index.push({ type: "heading", slug: p.slug, anchor: h[3] || slugify(h[2].replace(/\s*\{#[\w-]+\}\s*$/, "")), title: title, page: p.title, text: title });
        }
      });
    });
  }

  function runSearch(q) {
    var res = $("#search-results"), nav = $("#nav");
    q = q.trim().toLowerCase();
    if (!q) { res.hidden = true; nav.hidden = false; return; }
    var hits = state.index.filter(function (e) { return e.text.toLowerCase().indexOf(q) !== -1; }).slice(0, 30);
    // body text matches as a lower-priority fallback
    if (hits.length < 10) {
      state.pages.forEach(function (p) {
        if (hits.length >= 20) return;
        var raw = state.raw[p.slug] || "";
        var i = raw.toLowerCase().indexOf(q);
        if (i !== -1 && !hits.some(function (h) { return h.slug === p.slug; })) {
          var s = raw.slice(Math.max(0, i - 30), i + 60).replace(/<[^>]*>|[\n`#|*{}]/g, " ").replace(/\s+/g, " ");
          hits.push({ type: "text", slug: p.slug, anchor: "", title: p.title, page: "…" + s + "…", text: s });
        }
      });
    }
    res.innerHTML = "";
    res.hidden = false; nav.hidden = true;
    if (!hits.length) { res.innerHTML = '<div class="empty">Nothing found</div>'; return; }
    hits.forEach(function (h) {
      var a = document.createElement("a");
      a.className = "res";
      a.href = "#/" + h.slug + (h.anchor ? "/" + h.anchor : "");
      var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      a.innerHTML = esc(h.title).replace(re, "<mark>$1</mark>") + "<small>" + esc(h.type === "heading" ? h.page : h.type === "page" ? "Page" : h.page) + "</small>";
      a.addEventListener("click", function () { $("#search").value = ""; runSearch(""); });
      res.appendChild(a);
    });
  }

  /* ---------- rendering a page ---------- */
  var spy = null;
  function buildToc(root) {
    var toc = $("#toc-list");
    toc.innerHTML = "";
    var heads = $$("h2[id], h3[id]", root);
    $("#toc").hidden = heads.length < 2;
    heads.forEach(function (h) {
      var a = document.createElement("a");
      a.className = h.tagName === "H3" ? "l3" : "l2";
      a.href = "#/" + currentSlug + "/" + h.id;
      a.textContent = h.firstChild ? h.firstChild.textContent : h.textContent;
      a.dataset.id = h.id;
      toc.appendChild(a);
    });
    if (spy) spy.disconnect();
    if ("IntersectionObserver" in window) {
      spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            $$("#toc-list a").forEach(function (a) { a.classList.toggle("active", a.dataset.id === en.target.id); });
          }
        });
      }, { rootMargin: "-70px 0px -70% 0px" });
      heads.forEach(function (h) { spy.observe(h); });
    }
  }

  function pagerHtml(slug) {
    var i = state.pages.findIndex(function (p) { return p.slug === slug; });
    var prev = state.pages[i - 1], next = state.pages[i + 1];
    var h = '<nav class="pager" aria-label="Pages">';
    if (prev) h += '<a class="prev" href="#/' + prev.slug + '"><small>← Previous</small>' + esc(prev.title) + "</a>";
    if (next) h += '<a class="next" href="#/' + next.slug + '"><small>Next →</small>' + esc(next.title) + "</a>";
    return h + "</nav>";
  }

  function renderPage(slug) {
    var page = state.bySlug[slug];
    var content = $("#content");
    currentSlug = slug;
    usedIds = {};
    var md = subst(state.raw[slug] || "");
    content.innerHTML = marked.parse(md);
    // First paragraph after h1 acts as a lead.
    var h1 = content.querySelector("h1");
    if (h1 && h1.nextElementSibling && h1.nextElementSibling.tagName === "P") h1.nextElementSibling.classList.add("lead");
    buildCallouts(content);
    buildCodeBlocks(content);
    mountWidgets(content);
    var tail = "";
    if (CFG.editBase) tail += '<p class="footer-note"><a href="' + esc(CFG.editBase + page.file) + '" target="_blank" rel="noopener noreferrer">Suggest an edit to this page</a></p>';
    content.insertAdjacentHTML("beforeend", pagerHtml(slug) + tail);
    document.title = page.title + " · " + (CFG.docsTitle || "PilotKYC Docs");
    markActive(slug);
    buildToc(content);
    state.current = slug;
  }

  function scrollToAnchor(anchor) {
    if (!anchor) { window.scrollTo(0, 0); return; }
    var el = document.getElementById(anchor);
    if (el) el.scrollIntoView();
    else window.scrollTo(0, 0);
  }

  function route() {
    var h = decodeURIComponent((location.hash || "").replace(/^#\/?/, ""));
    var parts = h.split("/");
    var slug = parts[0] || (CFG.defaultPage || "overview");
    var anchor = parts[1] || "";
    if (!state.bySlug[slug]) { slug = (CFG.defaultPage || "overview"); anchor = ""; }
    if (state.current !== slug) renderPage(slug);
    document.body.classList.remove("nav-open");
    scrollToAnchor(anchor);
  }

  /* ---------- theme ---------- */
  function applyTheme(t) {
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
    var dark = effectiveTheme() === "dark";
    var btn = $("#theme-btn");
    btn.textContent = dark ? "☀" : "☾";
    btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }
  function effectiveTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  /* ---------- init ---------- */
  function init() {
    $("#version-badge").textContent = CFG.version || "";
    $("#brand-name").textContent = CFG.docsTitle || "PilotKYC Docs";
    var stored = lsGet("pk.docs.theme");
    applyTheme(stored === "light" || stored === "dark" ? stored : "");
    $("#theme-btn").addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      lsSet("pk.docs.theme", next);
      applyTheme(next);
    });
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onMq = function () { if (!lsGet("pk.docs.theme")) applyTheme(""); };
      if (mq.addEventListener) mq.addEventListener("change", onMq);
    }
    $("#menu-btn").addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    $("#scrim").addEventListener("click", function () { document.body.classList.remove("nav-open"); });
    $("#search").addEventListener("input", function (e) { runSearch(e.target.value); });
    document.addEventListener("keydown", function (e) {
      var tag = (e.target && e.target.tagName) || "";
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(tag)) { e.preventDefault(); $("#search").focus(); }
      if (e.key === "Escape") { $("#search").value = ""; runSearch(""); $("#search").blur(); document.body.classList.remove("nav-open"); }
    });

    fetchText("content/manifest.json").then(function (txt) {
      state.manifest = JSON.parse(txt);
      state.manifest.groups.forEach(function (g) {
        g.pages.forEach(function (p) { state.pages.push(p); state.bySlug[p.slug] = p; });
      });
      buildNav();
      return Promise.all(state.pages.map(function (p) {
        return fetchText("content/" + p.file).then(function (t) { state.raw[p.slug] = t; });
      }));
    }).then(function () {
      buildIndex();
      window.addEventListener("hashchange", route);
      route();
    }).catch(function (err) {
      $("#content").innerHTML = '<div class="error-box"><strong>Could not load the documentation.</strong><p>' + esc(err.message) +
        "</p><p>If you opened index.html as a file (file://), start a local server: <code>python3 -m http.server</code>.</p></div>";
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
