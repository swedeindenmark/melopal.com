/* Melopal landing - ink sketch outlines, plucked-string physics,
   logo spin, staff-divider melody, reveals.

   The outline engine mirrors the app's SketchyCard `stringHover` system:
   every .sk element gets a segmented SVG outline (4 corners + 4 sides).
   At rest the sides carry a seeded hand-drawn wobble; on pointer enter/
   leave the edge closest to the cursor "plucks" with a decaying sine
   vibration, like a guitar string. Touch and keyboard focus pluck the
   top and bottom edges together. */

(function () {
  "use strict";

  /* ---------- shared header & footer (single source of truth) ---------- */

  var WEB_APP_URL = "https://app.melopal.com";
  // Paste the App Store URL here when you want iOS visitors routed there.
  // Non-iOS visitors always open the web app.
  var IOS_APP_URL = "";
  var CONTACT = "/contact";
  var NAV_LINKS = [
    { href: "/#how", label: "How it works" },
    { href: "/ipad", label: "iPad teachers" },
    { href: "/students", label: "For students" },
    { href: "/pricing", label: "Pricing" },
    { href: "/faq", label: "FAQ" }
  ];

  function currentPage() {
    return (location.pathname.split("/").pop() || "index.html").replace(/\/$/, "") || "index.html";
  }

  function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function appUrl() {
    return isIOSDevice() && IOS_APP_URL ? IOS_APP_URL : WEB_APP_URL;
  }

  function navLinksHTML(page) {
    return NAV_LINKS.map(function (l) {
      var active = l.href.replace(/^\//, "") === page && l.href.indexOf("#") === -1;
      var activeClass = l.href === "/students" ? "active active-green" : "active";
      return '<a href="' + l.href + '"' + (active ? ' class="' + activeClass + '"' : '') + '>' + l.label + '</a>';
    }).join("\n      ");
  }

  function renderChrome() {
    var header = document.getElementById("site-header");
    if (header) {
      header.outerHTML =
        '<div class="nav-outer">' +
        '<nav class="nav sk" data-jitter="1.4" data-stroke="1.7" aria-label="Main">' +
        '<a class="brand" href="/"><img class="logo-mark" src="assets/logo.png" alt="Melopal logo"> Melopal</a>' +
        '<div class="links">' +
        navLinksHTML(currentPage()) +
        '<a class="btn btn-ghost" style="padding:9px 16px" href="' + appUrl() + '" target="_blank" rel="noopener">Log in</a>' +
        '</div>' +
        '<a class="btn btn-lilac cta sk" data-jitter="1" data-stroke="1.6" href="' + appUrl() + '" target="_blank" rel="noopener">Try Melopal free</a>' +
        '<button class="nav-burger" aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>' +
        '</nav>' +
        '</div>';
    }

    var footer = document.getElementById("site-footer");
    if (footer) {
      footer.outerHTML =
        '<footer><div class="wrap foot">' +
        '<div>' +
        '<div class="brand"><img class="logo-mark" src="assets/logo.png" alt="Melopal logo"> Melopal</div>' +
        '<p class="muted small mt-8" style="max-width:26em">Built for music teachers by a music teacher who got tired of sending sheet music into the void.</p>' +
        footerSignupHTML() +
        '</div>' +
        '<nav aria-label="Footer">' +
        '<a href="/#how">How it works</a>' +
        '<a href="/ipad">iPad teachers</a>' +
        '<a href="/students">For students</a>' +
        '<a href="/pricing">Pricing</a>' +
        '<a href="/faq">FAQ</a>' +
        '<a href="' + appUrl() + '" target="_blank" rel="noopener">Open the app</a>' +
        '<a href="/privacy-policy/">Privacy Policy</a>' +
        '<a href="' + CONTACT + '">Contact</a>' +
        '</nav>' +
        '<div class="legal">' +
        '<span>© <span data-year>2026</span> Melopal</span>' +
        '<span>Sheet music belongs on the stand. Not buried in your chat history.</span>' +
        '</div>' +
        '</div></footer>';
    }
  }

  function footerSignupHTML() {
    return '' +
      '<form class="footer-signup" action="/api/subscribe" method="post" data-signup-form>' +
        '<label for="footer-signup-email">Get Melopal updates and help your students practice smarter.</label>' +
        '<div class="footer-signup-row">' +
          '<input id="footer-signup-email" type="email" name="email" autocomplete="email" placeholder="Email address" required>' +
          '<button class="btn btn-lilac" type="submit">Join</button>' +
        '</div>' +
        '<input class="hp-field" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<input type="hidden" name="consentText" value="Send me Melopal product updates and teaching workflow ideas.">' +
        '<p class="footer-signup-status" data-signup-status aria-live="polite"></p>' +
      '</form>';
  }

  function normalizeAppLinks() {
    document.querySelectorAll('a[href="https://assignmus.vercel.app"], a[href="' + WEB_APP_URL + '"], a[data-app-link]').forEach(function (link) {
      link.setAttribute("href", appUrl());
    });
  }

  function setupPricingCurrency() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-currency]"));
    if (!buttons.length) return;

    var prices = {
      DKK: { teacher: "299 kr", plus: "499 kr" },
      EUR: { teacher: "€39.99", plus: "€65.99" },
      USD: { teacher: "$45.99", plus: "$75.99" }
    };
    var euroRegions = {
      AT: true, BE: true, HR: true, CY: true, EE: true, FI: true, FR: true,
      DE: true, GR: true, IE: true, IT: true, LV: true, LT: true, LU: true,
      MT: true, NL: true, PT: true, SK: true, SI: true, ES: true
    };

    function regionFromLocale(locale) {
      var parts = String(locale || "").split("-");
      return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
    }

    function detectedCurrency() {
      var locales = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
      for (var i = 0; i < locales.length; i += 1) {
        var region = regionFromLocale(locales[i]);
        if (region === "DK") return "DKK";
        if (euroRegions[region]) return "EUR";
      }
      return "USD";
    }

    function setCurrency(currency) {
      var next = prices[currency] ? currency : "USD";
      buttons.forEach(function (button) {
        var isActive = button.getAttribute("data-currency") === next;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      document.querySelectorAll("[data-price]").forEach(function (el) {
        var plan = el.getAttribute("data-price");
        if (prices[next][plan]) el.textContent = prices[next][plan];
      });
    }

    setCurrency(detectedCurrency());
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        setCurrency(button.getAttribute("data-currency"));
      });
    });
  }

  /* ---------- seeded random so outlines are stable per element ---------- */
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- segmented string outline ---------- */

  var PAD = 7;            // matches .ink-svg inset
  var SIDES = ["top", "right", "bottom", "left"];
  var STATIC_PHASE = { top: 0.3, right: 1.1, bottom: 2.2, left: 3.4 };
  var PLUCK_MS = 780;
  var STEPS = 18;
  var NS = "http://www.w3.org/2000/svg";

  function cornerD(st) {
    var L = PAD, T = PAD, R = PAD + st.w, B = PAD + st.h, r = st.r;
    return [
      "M" + L + "," + (T + r) + " Q" + L + "," + T + " " + (L + r) + "," + T,
      "M" + (R - r) + "," + T + " Q" + R + "," + T + " " + R + "," + (T + r),
      "M" + R + "," + (B - r) + " Q" + R + "," + B + " " + (R - r) + "," + B,
      "M" + (L + r) + "," + B + " Q" + L + "," + B + " " + L + "," + (B - r)
    ];
  }

  /* One side of the outline. progress === null → resting hand-drawn
     wobble; progress 0..1 → the app's pluck: quick onset, traveling
     phase, exponential decay, with the rest wobble fading back in. */
  function sideD(st, side, progress) {
    var L = PAD, T = PAD, R = PAD + st.w, B = PAD + st.h, r = st.r;
    var j = st.jitter[side];
    var phase = progress === null
      ? STATIC_PHASE[side]
      : STATIC_PHASE[side] + progress * Math.PI * 7.6;
    var onset = progress === null ? 0 : Math.sin(Math.min(progress / 0.08, 1) * Math.PI / 2);
    var decay = progress === null ? 0 : Math.exp(-progress * 2.9);
    var amp = 2.17 * onset * decay;
    var restBlend = progress === null ? 1 : 1 - onset * decay;

    var pts = [];
    for (var i = 0; i <= STEPS; i++) {
      var t = i / STEPS;
      var env = Math.sin(Math.PI * t);
      var rest = (
        Math.sin(t * Math.PI * 2 + STATIC_PHASE[side]) * 0.22 +
        Math.sin(t * Math.PI * 1.35 + j.a) * 0.62 * j.amp +
        Math.sin(t * Math.PI * 3.2 + j.b) * 0.3 * j.amp
      ) * env;
      var vib = (
        Math.sin(t * Math.PI + phase) * 0.82 +
        Math.sin(t * Math.PI * 3 - phase * 0.92) * 0.18
      ) * amp * env;
      var off = progress === null ? rest : vib + rest * restBlend;

      var x, y;
      if (side === "top") { x = L + r + (R - L - r * 2) * t; y = T + off; }
      else if (side === "right") { x = R + off; y = T + r + (B - T - r * 2) * t; }
      else if (side === "bottom") { x = R - r - (R - L - r * 2) * t; y = B + off; }
      else { x = L + off; y = B - r - (B - T - r * 2) * t; }
      pts.push((i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2));
    }
    return pts.join(" ");
  }

  function closestEdge(rect, x, y) {
    var d = [
      { side: "top", dist: Math.abs(y - rect.top) },
      { side: "right", dist: Math.abs(rect.right - x) },
      { side: "bottom", dist: Math.abs(rect.bottom - y) },
      { side: "left", dist: Math.abs(x - rect.left) }
    ];
    d.sort(function (a, b) { return a.dist - b.dist; });
    return d[0].side;
  }

  function pluck(el, sides) {
    var st = el.__ink;
    if (!st || reducedMotion()) return;

    if (st.raf) cancelAnimationFrame(st.raf);
    if (st.active) {
      st.active.forEach(function (s) {
        st.paths[s].setAttribute("d", sideD(st, s, null));
      });
    }
    st.active = sides;
    var start = performance.now();

    function tick(now) {
      var p = Math.min((now - start) / PLUCK_MS, 1);
      st.active.forEach(function (s) {
        st.paths[s].setAttribute("d", sideD(st, s, p < 1 ? p : null));
      });
      if (p < 1) {
        st.raf = requestAnimationFrame(tick);
      } else {
        st.active = null;
        st.raf = null;
      }
    }
    st.raf = requestAnimationFrame(tick);
  }

  function sidesForPointer(el, e) {
    // mouse/trackpad & pen pluck the edge you cross; touch plucks top+bottom
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      return [closestEdge(el.getBoundingClientRect(), e.clientX, e.clientY)];
    }
    return ["top", "bottom"];
  }

  function bindPluck(el) {
    if (el.dataset.inkBound) return;
    el.dataset.inkBound = "1";
    el.addEventListener("pointerenter", function (e) { pluck(el, sidesForPointer(el, e)); });
    el.addEventListener("pointerleave", function (e) { pluck(el, sidesForPointer(el, e)); });
    el.addEventListener("focusin", function () { pluck(el, ["top", "bottom"]); });
  }

  function drawInk(el, idx) {
    // <details> hides non-summary children while closed, so the
    // outline svg must live inside the always-visible <summary>.
    var host = el.tagName === "DETAILS" ? el.querySelector(":scope > summary") : el;
    if (!host) return;
    el.querySelectorAll(":scope > .ink-svg, :scope > summary > .ink-svg").forEach(function (s) { s.remove(); });

    if (el.tagName === "DETAILS" && !el.dataset.inkToggle) {
      el.dataset.inkToggle = "1";
      el.addEventListener("toggle", function () {
        queueInkRedraw();
        setTimeout(drawAll, 180);
      });
    }

    var w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) return;

    var rnd = mulberry32(1234 + idx * 97);
    var style = getComputedStyle(el);
    var r = Math.max(0, Math.min(parseFloat(style.borderTopLeftRadius) || 14, w / 2, h / 2));
    var jAmp = parseFloat(el.dataset.jitter || (w > 360 ? 1.5 : 1.0));
    var stroke = parseFloat(el.dataset.stroke || (w > 360 ? 1.9 : 1.6));

    var st = { w: w, h: h, r: r, paths: {}, jitter: {}, active: null, raf: null };
    SIDES.forEach(function (s) {
      st.jitter[s] = {
        a: rnd() * Math.PI * 2,
        b: rnd() * Math.PI * 2,
        amp: jAmp * (0.75 + rnd() * 0.5)
      };
    });

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "ink-svg");
    svg.setAttribute("viewBox", "0 0 " + (w + PAD * 2) + " " + (h + PAD * 2));
    svg.setAttribute("aria-hidden", "true");

    cornerD(st).forEach(function (d) {
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("stroke-width", stroke);
      svg.appendChild(p);
    });
    SIDES.forEach(function (s) {
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", sideD(st, s, null));
      p.setAttribute("stroke-width", stroke);
      svg.appendChild(p);
      st.paths[s] = p;
    });

    host.appendChild(svg);
    el.__ink = st;
    bindPluck(el);
  }

  function drawAll() {
    document.querySelectorAll(".sk").forEach(drawInk);
  }

  var inkRedrawQueued = false;
  function queueInkRedraw() {
    if (inkRedrawQueued) return;
    inkRedrawQueued = true;
    requestAnimationFrame(function () {
      inkRedrawQueued = false;
      drawAll();
    });
  }

  function setupInkResizeObserver() {
    if (!("ResizeObserver" in window)) return;

    var sizes = new WeakMap();
    var observer = new ResizeObserver(function (entries) {
      var changed = false;

      entries.forEach(function (entry) {
        var size = Math.round(entry.contentRect.width) + "x" + Math.round(entry.contentRect.height);
        if (sizes.get(entry.target) === size) return;
        sizes.set(entry.target, size);
        changed = true;
      });

      if (changed) queueInkRedraw();
    });

    document.querySelectorAll(".sk").forEach(function (el) {
      observer.observe(el);
    });
  }

  var rT;
  window.addEventListener("resize", function () {
    clearTimeout(rT);
    rT = setTimeout(drawAll, 160);
  });

  /* ---------- logo spin (playful, like the app) ---------- */
  function setupLogo() {
    var marks = document.querySelectorAll(".logo-mark");
    if (!marks.length) return;
    var reduced = reducedMotion();

    function spin(el) {
      var cls = Math.random() > 0.5 ? "spin-h" : "spin-v";
      el.classList.remove("spin-h", "spin-v");
      void el.offsetWidth; // restart animation
      el.classList.add(cls);
    }
    marks.forEach(function (el) {
      el.addEventListener("click", function () { spin(el); });
      if (reduced) return;
      setTimeout(function () { spin(el); }, 700);
      (function loop() {
        setTimeout(function () { spin(el); loop(); }, 7000 + Math.random() * 9000);
      })();
    });
  }

  /* ---------- staff divider: notes drift to new pitches ---------- */
  function setupStaffNotes() {
    var divider = document.querySelector(".staff-divider");
    if (!divider) return;
    var notes = divider.querySelectorAll(".sd-note");
    if (!notes.length) return;
    // staff lines sit at y 10/17/24/31/38 - pitches are lines + spaces
    var pitches = [10, 13.5, 17, 20.5, 24, 27.5, 31, 34.5, 38];
    var MIDDLE = 24;

    function setNote(el, y) {
      el.style.transform = "translate(" + el.dataset.x + "px," + y + "px)";
      el.dataset.y = y;
      // notation rule: head above the middle line → stem down, below → stem up
      el.querySelector(".stem-up").classList.toggle("on", y > MIDDLE);
      el.querySelector(".stem-down").classList.toggle("on", y <= MIDDLE);
    }

    function shuffle() {
      notes.forEach(function (el) {
        var cur = parseFloat(el.dataset.y);
        var next = cur;
        while (next === cur) {
          next = pitches[Math.floor(Math.random() * pitches.length)];
        }
        setNote(el, next);
      });
    }

    divider.addEventListener("click", shuffle);

    if (reducedMotion()) return;

    (function loop() {
      setTimeout(function () {
        shuffle();
        loop();
      }, 5000 + Math.random() * 3000);
    })();
  }

  /* ---------- reveal on scroll ---------- */
  function setupReveals() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- mobile nav ---------- */
  function setupNav() {
    var burger = document.querySelector(".nav-burger");
    var links = document.querySelector(".nav .links");
    if (!burger || !links) return;
    burger.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  function setupTeacherShare() {
    var link = document.querySelector("[data-share-teacher]");
    if (!link) return;

    var subject = "Could we use Melopal for my music lessons?";
    var body = "Hi!\n\nI found Melopal and thought it looked really useful. It keeps my sheet music, your instructions and recordings together in one place.\n\nWould you have a look?\n\nhttps://melopal.com";
    var shareUrl = "https://melopal.com/students";
    var mailto = "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

    link.setAttribute("href", mailto);
    link.addEventListener("click", function (e) {
      if (!navigator.share) return;

      e.preventDefault();
      navigator.share({
        title: subject,
        text: body,
        url: shareUrl
      }).catch(function (err) {
        if (!err || err.name !== "AbortError") {
          window.location.href = mailto;
        }
      });
    });
  }

  function setupContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;

    var status = document.querySelector("[data-contact-status]");
    var button = form.querySelector("button[type='submit']");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (status) status.textContent = "Sending...";
      if (button) button.disabled = true;

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (response) {
        return response.json().catch(function () {
          return { ok: false, error: "Could not send the message right now." };
        }).then(function (body) {
          if (!response.ok || !body.ok) throw new Error(body.error || "Could not send the message right now.");
          form.reset();
          if (status) status.textContent = "Message sent. Thank you.";
        });
      }).catch(function (error) {
        if (status) status.textContent = error.message || "Could not send the message right now.";
      }).finally(function () {
        if (button) button.disabled = false;
      });
    });
  }

  function setupEmailSignupCapture() {
    var forceSignup = new URLSearchParams(location.search).get("signup") === "1";
    if (!forceSignup && storageGet("melopal_email_signup_done") === "1") return;

    var dismissedAt = 0;
    dismissedAt = parseInt(storageGet("melopal_email_signup_dismissed_at") || "0", 10);
    if (!forceSignup && dismissedAt && Date.now() - dismissedAt < 1000 * 60 * 60 * 24 * 7) return;

    var shown = false;
    var readyAt = forceSignup ? Date.now() : Date.now() + 2500;

    function show() {
      if (shown || Date.now() < readyAt) return;
      shown = true;

      var overlay = document.createElement("div");
      overlay.className = "signup-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-labelledby", "signup-title");
      overlay.innerHTML =
        '<div class="signup-modal sk" data-jitter="1.1" data-stroke="1.7">' +
          '<button class="signup-close" type="button" aria-label="Close">&times;</button>' +
          '<span class="pill pill-lilac">For music teachers</span>' +
          '<h2 id="signup-title">Make your students practice more. And smarter.</h2>' +
          '<form class="signup-form" action="/api/subscribe" method="post" data-signup-form>' +
            '<input type="email" name="email" autocomplete="email" placeholder="you@example.com" aria-label="Email address" required>' +
            '<input class="hp-field" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<input type="hidden" name="sourcePath" value="' + escapeAttr(location.pathname) + '">' +
            '<input type="hidden" name="sourceUrl" value="' + escapeAttr(location.href) + '">' +
            '<input type="hidden" name="consentText" value="Send me Melopal product updates and teaching workflow ideas.">' +
            '<button class="btn btn-lilac sk sk-pluck" data-jitter="1" type="submit">Get Melopal updates <svg><use href="#i-arrow-right"/></svg></button>' +
          '</form>' +
          '<p class="signup-copy">Do you teach music one-to-one? Get useful product updates and teaching workflow ideas as Melopal grows.</p>' +
          '<p class="signup-note">Unsubscribe anytime. Your email is stored safely by Melopal, and not shared with anyone.</p>' +
          '<p class="signup-status" data-signup-status aria-live="polite"></p>' +
        '</div>';

      document.body.appendChild(overlay);
      document.body.classList.add("signup-open");
      setTimeout(function () {
        overlay.classList.add("is-visible");
        drawAll();
        var input = overlay.querySelector("input[type='email']");
        if (input && window.matchMedia("(min-width: 760px)").matches) input.focus();
      }, 20);

      function dismiss() {
        storageSet("melopal_email_signup_dismissed_at", String(Date.now()));
        overlay.classList.remove("is-visible");
        document.body.classList.remove("signup-open");
        setTimeout(function () { overlay.remove(); }, 180);
      }

      overlay.querySelector(".signup-close").addEventListener("click", dismiss);
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) dismiss();
      });
      document.addEventListener("keydown", function onKeydown(event) {
        if (event.key !== "Escape" || !document.body.contains(overlay)) return;
        document.removeEventListener("keydown", onKeydown);
        dismiss();
      });

      setupSignupForms(overlay);
    }

    function maybeShowForMouse(event) {
      if (event.clientY <= 8) show();
    }

    document.addEventListener("mouseout", maybeShowForMouse);

    if (forceSignup) {
      setTimeout(show, 400);
    }

    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      setTimeout(function () {
        if (window.scrollY > document.documentElement.scrollHeight * 0.35) show();
      }, 15000);
    }
  }

  function setupSignupForms(root) {
    root.querySelectorAll("[data-signup-form]").forEach(function (form) {
      if (form.dataset.signupBound) return;
      form.dataset.signupBound = "1";

      var status = form.querySelector("[data-signup-status]") || root.querySelector("[data-signup-status]");
      var button = form.querySelector("button[type='submit']");

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (status) status.textContent = "Saving...";
        if (button) button.disabled = true;

        var data = new FormData(form);
        data.set("sourcePath", location.pathname);
        data.set("sourceUrl", location.href);
        if (!data.get("consentText")) {
          data.set("consentText", "Send me Melopal product updates and teaching workflow ideas.");
        }

        fetch(form.action, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" }
        }).then(function (response) {
          return response.json().catch(function () {
            return { ok: false, error: "Could not save your email right now." };
          }).then(function (body) {
            if (!response.ok || !body.ok) throw new Error(body.error || "Could not save your email right now.");
            storageSet("melopal_email_signup_done", "1");
            form.reset();
            if (status) status.textContent = "Done. Thanks for joining the list.";
            if (root.classList && root.classList.contains("signup-overlay")) {
              setTimeout(function () {
                root.classList.remove("is-visible");
                document.body.classList.remove("signup-open");
                setTimeout(function () { root.remove(); }, 180);
              }, 1300);
            }
          });
        }).catch(function (error) {
          if (status) status.textContent = error.message || "Could not save your email right now.";
        }).finally(function () {
          if (button) button.disabled = false;
        });
      });
    });
  }

  function escapeAttr(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function storageGet(key) {
    try {
      return window.localStorage ? localStorage.getItem(key) : null;
    } catch (error) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      if (window.localStorage) localStorage.setItem(key, value);
    } catch (error) {
      // Storage can be blocked by privacy settings. The form should still work.
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    normalizeAppLinks();
    drawAll();
    setupInkResizeObserver();
    // redraw once fonts are in (text metrics change element sizes)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { setTimeout(drawAll, 50); });
    }
    setupLogo();
    setupStaffNotes();
    setupReveals();
    setupNav();
    setupPricingCurrency();
    setupTeacherShare();
    setupContactForm();
    setupEmailSignupCapture();
    setupSignupForms(document);
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
