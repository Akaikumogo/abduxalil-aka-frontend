/* Buran Consulting — vanilla JS, no dependencies */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  root.classList.add("js");

  // Lead endpoint (same Google Sheet the old site wrote to)
  var SHEET_URL = "https://script.google.com/macros/s/AKfycbzIuKKLnno4ft6uZkoZPR-wO7qiWYO7ju0fLK5yzWvwmqL0IEVCjKNmngqIC1ONVG_Teg/exec";

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Header: scrolled state + mobile menu ---------- */
  var header = $(".header"), burger = $(".burger"), nav = $("#nav"), mbar = $(".mbar");
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 8);
    if (mbar) mbar.classList.toggle("is-on", y > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    d.body.style.overflow = "";
  }
  burger.addEventListener("click", function () {
    var open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    d.body.style.overflow = open ? "hidden" : "";
  });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", closeMenu); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- Active nav link + reveal on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var links = {};
    $$('.nav a[href^="#"]').forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (a && en.isIntersecting) {
          $$(".nav a.is-active").forEach(function (x) { x.classList.remove("is-active"); });
          a.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) { var s = d.getElementById(id); if (s) spy.observe(s); });

    var rv = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); rv.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".section__head, .why li, .program, .countries li, .steps li, .review, .yt, .about__text, .about__media, .form, .faq details, .badges li").forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 4) * 60 + "ms";
      rv.observe(el);
    });
  }

  /* ---------- Country / program shortcuts prefill the form ---------- */
  var form = $("#leadForm");
  function goToForm(country, program) {
    if (country) form.country.value = country;
    if (program !== undefined) form.program.value = program;
    $("#lead").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setTimeout(function () { form.name.focus({ preventScroll: true }); }, 600);
  }
  $$("[data-country]").forEach(function (b) {
    b.addEventListener("click", function () { goToForm(b.getAttribute("data-country")); });
  });
  $$("[data-program]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); goToForm(null, a.getAttribute("data-program")); });
  });

  /* ---------- Phone mask: +998 XX XXX XX XX ---------- */
  var phone = form.phone;
  function fmtPhone(v) {
    var n = v.replace(/\D/g, "");
    if (n.indexOf("998") !== 0) n = "998" + n.replace(/^998/, "");
    n = n.slice(0, 12);
    var p = n.slice(3), out = "+998";
    if (p.length) out += " " + p.slice(0, 2);
    if (p.length > 2) out += " " + p.slice(2, 5);
    if (p.length > 5) out += " " + p.slice(5, 7);
    if (p.length > 7) out += " " + p.slice(7, 9);
    return out;
  }
  phone.addEventListener("input", function () { phone.value = fmtPhone(phone.value); phone.removeAttribute("aria-invalid"); });
  phone.addEventListener("focus", function () { if (!phone.value) phone.value = "+998 "; });
  form.name.addEventListener("input", function () { form.name.removeAttribute("aria-invalid"); });

  /* ---------- Form submit ---------- */
  var msg = $(".form__msg", form);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var digits = phone.value.replace(/\D/g, "");
    var bad = false;
    if (name.length < 2) { form.name.setAttribute("aria-invalid", "true"); bad = true; }
    if (digits.length !== 12) { phone.setAttribute("aria-invalid", "true"); bad = true; }
    msg.className = "form__msg";
    if (bad) {
      msg.textContent = t("f.err");
      msg.classList.add("err");
      (name.length < 2 ? form.name : phone).focus();
      return;
    }
    var btn = $("button[type=submit]", form);
    btn.disabled = true;
    var program = form.program.value;
    var payload = {
      timestamp: new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" }),
      name: name,
      phone: "+" + digits,
      country: form.country.value + (program ? " · " + program : ""),
      formType: "Simple Form"
    };
    fetch(SHEET_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function () {
      msg.textContent = t("f.ok");
      msg.classList.add("ok");
      form.reset();
      phone.value = "+998 ";
      form.program.value = "";
    }).catch(function () {
      msg.textContent = t("f.fail");
      msg.classList.add("err");
    }).then(function () { btn.disabled = false; });
  });

  /* ---------- YouTube facade: load iframe only on click ---------- */
  $$(".yt").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = d.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + b.getAttribute("data-id") + "?autoplay=1&rel=0";
      f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen = true;
      f.title = b.getAttribute("aria-label");
      b.innerHTML = ""; b.appendChild(f);
    }, { once: true });
  });

  /* ---------- Map: load Yandex iframe on demand / when near viewport ---------- */
  var map = $("#map"), mapLoaded = false;
  function loadMap() {
    if (mapLoaded) return; mapLoaded = true;
    var f = d.createElement("iframe");
    f.src = "https://yandex.uz/map-widget/v1/?ll=69.285278%2C41.341389&z=17&pt=69.285278,41.341389,pm2rdm";
    f.title = "Buran Consulting — xarita";
    f.loading = "lazy";
    map.innerHTML = ""; map.appendChild(f);
  }
  $(".map__load", map).addEventListener("click", loadMap);
  if ("IntersectionObserver" in window) {
    var mo = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { loadMap(); mo.disconnect(); } }, { rootMargin: "200px" });
    mo.observe(map);
  }

  /* ---------- i18n (UZ default in HTML, EN dictionary here) ---------- */
  var EN = {
    "nav.about": "About us", "nav.programs": "Programs", "nav.countries": "Countries", "nav.reviews": "Results", "nav.faq": "FAQ", "nav.contact": "Contact",
    "cta.short": "Free consultation", "cta.consult": "Get a consultation", "cta.countries": "Explore countries",
    "hero.eyebrow": "Since 2018 · British Council certified",
    "hero.title": "Becoming an international student <em>is easy with us</em>",
    "hero.sub": "Admission, scholarships and visas for universities in the UK, Singapore, Australia, Germany, Dubai and 15+ more countries — with one team.",
    "hero.visa": "Full support through the visa process",
    "trust.icef": "ICEF member", "trust.oxford": "Oxford International — Best agency in Central Asia",
    "stat.grant.short": "in scholarships", "stat.grant": "scholarship opportunities of up to", "stat.students": "students went abroad through us",
    "stat.unis": "partner universities worldwide", "stat.legal": "licensed, transparent contracts",
    "about.kicker": "About us", "about.title": "Since 2018 we have been taking students to the world's universities",
    "about.p1": "Buran Consulting works in partnership with universities in English-speaking countries. So far we have helped about 500 people with university admission, tuition discounts and visa processes.",
    "about.b1": "2023 — Best agency in Central Asia", "about.b2": "Certified agency", "about.b3": "Member", "about.verify": "Verify ↗",
    "why.title": "Why Buran Consulting?",
    "why.1t": "Experience", "why.1d": "Years of experience and many successful cases",
    "why.2t": "Professionalism", "why.2d": "Strong consultants who are masters of their craft",
    "why.3t": "Friendliness", "why.3d": "We support you during your studies too",
    "why.4t": "Full service", "why.4d": "From choosing a course to the visa process",
    "why.5t": "Trust", "why.5d": "Transparent process and guaranteed result",
    "why.6t": "Partnerships", "why.6d": "Official agreements with many institutions",
    "prog.kicker": "Programs", "prog.title": "You can start from any level", "prog.sub": "Whether you don't speak English yet or just finished school — there is a path for you.",
    "prog.1t": "Language preparation", "prog.1d": "Not knowing English is not a barrier. University language courses let you start from zero.",
    "prog.2t": "Foundation", "prog.2d": "A pre-bachelor stage that brings your academic knowledge and English up to university level.",
    "prog.3t": "Bachelor's", "prog.3d": "Usually 3 years. Intakes twice a year — autumn and winter. Requirements vary by subject and university.",
    "prog.4t": "Master's", "prog.4d": "Deepen your knowledge and enter the global job market with practical experience and a recognised degree.",
    "prog.more": "See requirements →",
    "c.kicker": "Countries", "c.title": "Study at the world's TOP universities", "c.sub": "Pick a country to book a free consultation for that destination.",
    "cn.uk": "United Kingdom", "cn.de": "Germany", "cn.ae": "Dubai", "cn.sg": "Singapore", "cn.au": "Australia", "cn.cn": "China",
    "cn.kr": "South Korea", "cn.my": "Malaysia", "cn.it": "Italy", "cn.cy": "Cyprus", "cn.nl": "Netherlands", "cn.lv": "Latvia",
    "p.kicker": "Process", "p.title": "How we work — 5 steps",
    "p.1t": "You apply", "p.1d": "Get a consultation on this website or by calling +998 71 200 08 11.",
    "p.2t": "Contract", "p.2d": "Review the contract terms and sign.",
    "p.3t": "Interview", "p.3d": "We prepare you for the university interview in advance.",
    "p.4t": "Visa", "p.4d": "We help you submit your documents correctly.",
    "p.5t": "Get ready to go", "p.5d": "Visa and accommodation are done — time to pack!",
    "r.kicker": "Results", "r.title": "What our students say",
    "v.title": "Useful videos about studying abroad", "v.1": "Studying in Europe without IELTS", "v.2": "Studying in Dubai", "v.3": "Studying without the language",
    "f.kicker": "Free consultation", "f.title": "Let's find the right country and program for you",
    "f.c1": "A list of universities that match your level", "f.c2": "Tuition, living costs and scholarship options", "f.c3": "A clear plan for documents and visa",
    "f.call": "Or call us now:", "f.name": "Your name", "f.name.ph": "Full name", "f.phone": "Phone number", "f.country": "Where would you like to study?",
    "f.note": "Your details are used only to contact you.",
    "f.err": "Please enter your name and a full phone number.",
    "f.ok": "Thank you! Your request has been received. We will contact you shortly.",
    "f.fail": "Something went wrong. Please call +998 71 200 08 11.",
    "q.title": "Frequently asked questions", "q.sub": "Didn't find an answer? Call us:",
    "q.1q": "Can I work while studying?", "q.1a": "Yes, in many countries students can work during their studies. In the UK, for example, up to 20 hours a week during term and full-time during holidays. Other countries offer similar options.",
    "q.2q": "My English isn't good. Can I still study abroad?", "q.2a": "Absolutely! Universities offer language preparation courses: you learn the language first, then move on to the main program. We will help you choose the best fit.",
    "q.3q": "How much is tuition?", "q.3a": "It depends on the country, university and program, so we calculate it individually. Book a free consultation to get exact prices.",
    "q.4q": "Can I get a scholarship or discount?", "q.4a": "Yes. Partner universities offer scholarships and discounts of up to $10,000. In the consultation we'll tell you which ones you can apply for.",
    "ct.kicker": "Contact", "ct.title": "Visit our office", "ct.addr": "Address", "ct.land": "Landmark", "ct.phone": "Phone",
    "ct.addr.v": "Tashkent, Mirzo Ulugbek district, 5th passage Sayram 4A, Sayram Business Center, 7th floor",
    "ct.land.v": "Bo'z bozor, British School, Anor Bank · 5–6 min from Buyuk Ipak Yo'li metro",
    "ct.route": "Get directions ↗", "ct.map": "Show map",
    "ft.tag": "Become a student at the best universities.", "ft.pages": "Pages", "ft.rights": "All rights reserved.",
    "mbar.call": "Call"
  };
  var UZ_MSG = {
    "f.err": "Iltimos, ismingiz va to'liq telefon raqamingizni kiriting.",
    "f.ok": "Rahmat! So'rovingiz qabul qilindi. Tez orada siz bilan bog'lanamiz.",
    "f.fail": "Xatolik yuz berdi. Iltimos, +998 71 200 08 11 raqamiga qo'ng'iroq qiling."
  };
  var lang = "uz", orig = new Map();

  function t(key) { return lang === "en" ? (EN[key] || UZ_MSG[key]) : UZ_MSG[key]; }

  function setLang(l) {
    lang = l;
    root.lang = l;
    $$("[data-i18n]").forEach(function (el) {
      if (!orig.has(el)) orig.set(el, el.innerHTML);
      var k = el.getAttribute("data-i18n");
      el.innerHTML = l === "en" && EN[k] ? EN[k] : orig.get(el);
    });
    $$("[data-i18n-ph]").forEach(function (el) {
      if (!el.dataset.phUz) el.dataset.phUz = el.placeholder;
      var k = el.getAttribute("data-i18n-ph");
      el.placeholder = l === "en" && EN[k] ? EN[k] : el.dataset.phUz;
    });
    $$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === l)); });
    store("lang", l);
  }
  $$(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });
  if (store("lang") === "en") setLang("en");

  /* ---------- Logo: back to top ---------- */
  $(".logo").addEventListener("click", function (e) {
    if (location.pathname !== "/" && location.pathname !== "/index.html") return;
    e.preventDefault();
    closeMenu();
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  });

  $("#year").textContent = new Date().getFullYear();
})();
