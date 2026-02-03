import React, { useEffect, useState, useRef } from "react";
import { translations } from "./translations.js";
import { 
  heroApi, statsApi, featuresApi, programsApi, countriesApi, 
  stepsApi, videoApi, testimonialsApi, tipsApi, faqApi, contactApi,
  applicationsApi, chatApi, sendToGoogleSheets, getImageUrl 
} from "./services/api.js";

export default function App() {
  const [heroImageSrc, setHeroImageSrc] = useState("");
  const [language, setLanguage] = useState("uz");
  
  // API data states
  const [stats, setStats] = useState([]);
  const [features, setFeatures] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [countries, setCountries] = useState([]);
  const [steps, setSteps] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [testimonials, setTestimonials] = useState([]);
  const [tips, setTips] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [mapUrl, setMapUrl] = useState("");

  useEffect(() => {
    const cleanups = [];
    const addListener = (el, event, handler, options) => {
      if (!el) return;
      el.addEventListener(event, handler, options);
      cleanups.push(() => el.removeEventListener(event, handler, options));
    };

    // Load API data
    const loadApiData = async () => {
      try {
        const [
          statsData, featuresData, programsData, countriesData, 
          stepsData, videoData, testimonialsData, tipsData, faqData, heroData, contactData
        ] = await Promise.all([
          statsApi.getAll().catch(() => []),
          featuresApi.getAll().catch(() => []),
          programsApi.getAll().catch(() => []),
          countriesApi.getAll().catch(() => []),
          stepsApi.getAll().catch(() => []),
          videoApi.get().catch(() => null),
          testimonialsApi.getAll().catch(() => []),
          tipsApi.getAll().catch(() => []),
          faqApi.getAll().catch(() => []),
          heroApi.getSettings().catch(() => null),
          contactApi.get().catch(() => null),
        ]);

        if (statsData?.length) setStats(statsData);
        if (featuresData?.length) setFeatures(featuresData);
        if (programsData?.length) setPrograms(programsData);
        if (countriesData?.length) setCountries(countriesData);
        if (stepsData?.length) setSteps(stepsData.sort((a, b) => (a.order || 0) - (b.order || 0)));
        if (videoData?.videoUrl) setVideoUrl(videoData.videoUrl);
        if (testimonialsData?.length) setTestimonials(testimonialsData);
        if (tipsData?.length) setTips(tipsData);
        if (faqData?.length) setFaqs(faqData);

        // Hero image from API
        if (heroData) {
          const lang = localStorage.getItem("selectedLanguage") || "uz";
          const imgPath = lang === "en" ? heroData.imageEn : heroData.imageUz;
          if (imgPath) setHeroImageSrc(getImageUrl(imgPath));
        }
        if (contactData?.mapUrl) setMapUrl(contactData.mapUrl);
      } catch (error) {
        console.error("Failed to load API data:", error);
      }
    };

    loadApiData();

    // Translation system
    const initTranslation = () => {
      const translatePage = (lang) => {
        if (!translations || !translations[lang]) return;
        localStorage.setItem("selectedLanguage", lang);
        document.documentElement.lang = lang;
        setLanguage(lang);
        const t = translations[lang];

        document.querySelectorAll("[data-i18n]").forEach((element) => {
          const key = element.getAttribute("data-i18n");
          const keys = key.split(".");
          let value = t;
          for (let i = 0; i < keys.length; i++) {
            if (value && typeof value === "object" && keys[i] in value) {
              value = value[keys[i]];
            } else return;
          }
          if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
            element.placeholder = value;
          } else if (element.hasAttribute("data-i18n-html")) {
            element.innerHTML = value.replace("+998712000811", '<a href="tel:+998712000811">+998712000811</a>');
          } else {
            element.textContent = value;
          }
        });

        document.querySelectorAll(".lang").forEach((btn) => {
          btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
        });

        // Update hero image based on language
        heroApi.getSettings().then((data) => {
          if (data) {
            const imgPath = lang === "en" ? data.imageEn : data.imageUz;
            if (imgPath) setHeroImageSrc(getImageUrl(imgPath));
          }
        }).catch(() => {});
      };

      const savedLang = localStorage.getItem("selectedLanguage") || "uz";
      translatePage(savedLang);

      document.querySelectorAll(".lang").forEach((btn) => {
        addListener(btn, "click", (e) => {
          e.preventDefault();
          const lang = btn.getAttribute("data-lang");
          if (lang) translatePage(lang);
        });
      });
    };

    // Menu and scrolling
    const initMenuAndScrolling = () => {
      const menuToggle = document.getElementById("menuToggle");
      const navMenu = document.getElementById("navMenu");
      const body = document.body;

      if (menuToggle && navMenu) {
        addListener(menuToggle, "click", (e) => {
          e.stopPropagation();
          const isActive = navMenu.classList.contains("active");
          navMenu.classList.toggle("active");
          menuToggle.classList.toggle("active");
          body.style.overflow = isActive ? "" : "hidden";
        });

        document.querySelectorAll(".nav-menu a").forEach((link) => {
          addListener(link, "click", () => {
            navMenu.classList.remove("active");
            menuToggle.classList.remove("active");
            body.style.overflow = "";
          });
        });

        addListener(document, "click", (e) => {
          if (navMenu.classList.contains("active") && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove("active");
            menuToggle.classList.remove("active");
            body.style.overflow = "";
          }
        });
      }

      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        addListener(anchor, "click", (e) => {
          const target = document.querySelector(anchor.getAttribute("href"));
          if (!target) return;
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    };

    // FAQ
    const initFaq = () => {
      document.querySelectorAll(".faq-item").forEach((item) => {
        const question = item.querySelector(".faq-question");
        if (!question) return;
        addListener(question, "click", () => {
          const isActive = item.classList.contains("active");
          document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("active"));
          if (!isActive) item.classList.add("active");
        });
      });
    };

    // Consultation Modal
    const initConsultationModal = () => {
      const modal = document.getElementById("consultationModal");
      const overlay = document.getElementById("modalOverlay");
      const closeBtn = document.getElementById("modalClose");

      const openModal = () => {
        if (modal) {
          modal.classList.add("active");
          document.body.style.overflow = "hidden";
        }
      };

      const closeModal = () => {
        if (modal) {
          modal.classList.remove("active");
          document.body.style.overflow = "";
        }
      };

      addListener(overlay, "click", closeModal);
      addListener(closeBtn, "click", closeModal);
      addListener(document, "keydown", (e) => {
        if (e.key === "Escape" && modal?.classList.contains("active")) closeModal();
      });

      addListener(document, "click", (e) => {
        if (e.target.closest(".btn-hero-gradient") || e.target.closest(".btn-primary")) {
          e.preventDefault();
          openModal();
        } else if (e.target.closest(".btn-link")) {
          e.preventDefault();
          document.getElementById("consultation-section")?.scrollIntoView({ behavior: "smooth" });
        }
      });
    };

    // Form submissions
    const initConsultationForms = () => {
      let isSubmitting = false;

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        isSubmitting = true;

        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.dataset.originalText = submitBtn.textContent;
          submitBtn.classList.add("btn-loading");
          submitBtn.disabled = true;
        }

        const name = form.querySelector('input[name="name"]')?.value.trim() || "";
        const phone = form.querySelector('input[name="phone"]')?.value.trim() || "";
        const country = form.querySelector('select[name="country"]')?.value.trim() || "";

        if (!name || !phone) {
          alert("Iltimos, ism va telefon raqamini to'ldiring!");
          if (submitBtn) {
            submitBtn.classList.remove("btn-loading");
            submitBtn.disabled = false;
          }
          isSubmitting = false;
          return;
        }

        const data = {
          timestamp: new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" }),
          name, phone, country,
          formType: form.id === "simpleConsultationForm" ? "Simple Form" : "Modal Form"
        };

        // Send to API
        await applicationsApi.submit({ name, phone, country, formType: data.formType });
        // Backup to Google Sheets
        await sendToGoogleSheets(data);

        alert("Rahmat! Sizning so'rovingiz qabul qilindi. Tez orada siz bilan bog'lanamiz.");
        form.reset();

        const modal = document.getElementById("consultationModal");
        if (modal?.classList.contains("active")) {
          modal.classList.remove("active");
          document.body.style.overflow = "";
        }

        setTimeout(() => {
          isSubmitting = false;
          if (submitBtn) {
            submitBtn.classList.remove("btn-loading");
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText;
          }
        }, 2000);
      };

      addListener(document.getElementById("simpleConsultationForm"), "submit", handleSubmit);
      addListener(document.getElementById("modalConsultationForm"), "submit", handleSubmit);
    };

    // Stats animation
    const initStatsAnimation = () => {
      const animateValue = (element, start, end, duration, options = {}) => {
        const { prefix = "", suffix = "" } = options;
        let startTimestamp = null;
        const step = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(easeOut * (end - start) + start);
          element.textContent = prefix + current.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else element.textContent = prefix + end.toLocaleString() + suffix;
        };
        requestAnimationFrame(step);
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains("animate")) {
            entry.target.classList.add("animate");
            const statNumber = entry.target.querySelector(".stat-number-value");
            const original = entry.target.getAttribute("data-value") || "0";
            const value = parseInt(original.replace(/[^0-9]/g, ""), 10) || 0;
            const prefix = original.includes("$") ? "$" : original.startsWith("+") ? "+" : "";
            const suffix = original.includes("%") ? "%" : original.endsWith("+") ? "+" : "";
            if (statNumber) {
              setTimeout(() => animateValue(statNumber, 0, value, 2500, { prefix, suffix }), 300);
            }
          }
        });
      }, { threshold: 0.2 });

      document.querySelectorAll(".stat-card").forEach((card) => observer.observe(card));
      cleanups.push(() => observer.disconnect());
    };

    // About slider
    const initAboutSlider = () => {
      const container = document.querySelector(".about-slider-container");
      const dotsContainer = document.querySelector(".about-slider-dots");
      if (!container || !dotsContainer) return;

      const formats = ["webp", "jpg", "jpeg", "png"];
      const checkImage = (src) => new Promise((r) => {
        const img = new Image();
        img.onload = () => r(true);
        img.onerror = () => r(false);
        img.src = src;
      });

      const findImages = async () => {
        const found = [];
        for (let i = 1; i <= 20; i++) {
          for (const fmt of formats) {
            const path = `images/about/${i}.${fmt}`;
            if (await checkImage(path)) {
              found.push({ index: i - 1, path });
              break;
            }
          }
        }
        return found.sort((a, b) => a.index - b.index);
      };

      const createSlider = (images) => {
        if (!images.length) return;
        container.innerHTML = "";
        dotsContainer.innerHTML = "";

        images.forEach((img, i) => {
          const slide = document.createElement("div");
          slide.className = `about-slide ${i === 0 ? "active" : ""}`;
          slide.innerHTML = `<img src="${img.path}" alt="Buran ${i + 1}" class="about-img">`;
          container.appendChild(slide);

          const dot = document.createElement("span");
          dot.className = `about-dot ${i === 0 ? "active" : ""}`;
          dot.dataset.slide = i;
          dotsContainer.appendChild(dot);
        });

        let current = 0;
        let interval = null;
        const slides = container.querySelectorAll(".about-slide");
        const dots = dotsContainer.querySelectorAll(".about-dot");

        const show = (idx) => {
          slides.forEach((s) => s.classList.remove("active"));
          dots.forEach((d) => d.classList.remove("active"));
          slides[idx]?.classList.add("active");
          dots[idx]?.classList.add("active");
          current = idx;
        };

        const next = () => show((current + 1) % slides.length);
        const prev = () => show((current - 1 + slides.length) % slides.length);
        const start = () => { interval = setInterval(next, 4000); };
        const reset = () => { clearInterval(interval); start(); };

        document.querySelector(".about-slider-next")?.addEventListener("click", () => { next(); reset(); });
        document.querySelector(".about-slider-prev")?.addEventListener("click", () => { prev(); reset(); });
        dots.forEach((d, i) => d.addEventListener("click", () => { show(i); reset(); }));

        const slider = document.querySelector(".about-slider");
        slider?.addEventListener("mouseenter", () => clearInterval(interval));
        slider?.addEventListener("mouseleave", start);

        start();
        cleanups.push(() => clearInterval(interval));
      };

      findImages().then(createSlider);
    };

    // Student images
    const initStudentImages = () => {
      document.querySelectorAll("img[data-student-img]").forEach((img) => {
        const num = img.getAttribute("data-student-img");
        const tryLoad = (formats, i = 0) => {
          if (i >= formats.length) return;
          const testImg = new Image();
          testImg.onload = () => { img.src = formats[i]; };
          testImg.onerror = () => tryLoad(formats, i + 1);
          testImg.src = formats[i];
        };
        tryLoad([`images/students/${num}.webp`, `images/students/${num}.jpg`, `images/students/${num}.png`]);
      });
    };

    // Chat widget
    const initChatWidget = () => {
      const chatButton = document.getElementById("chatButton");
      const chatWindow = document.getElementById("chatWindow");
      const chatClose = document.getElementById("chatClose");
      const chatInput = document.getElementById("chatInput");
      const chatSend = document.getElementById("chatSend");
      const chatMessages = document.getElementById("chatMessages");

      if (!chatButton || !chatWindow) return;

      let isOpen = false;
      const shownIds = new Set();
      const shownTexts = new Set();

      const toggleChat = () => {
        isOpen = !isOpen;
        chatWindow.classList.toggle("active", isOpen);
        if (isOpen) loadMessages();
      };

      const addMessage = (text, isUser, id = null, timestamp = null) => {
        // Duplicate prevention by ID
        if (id && shownIds.has(String(id))) return;
        
        // Duplicate prevention by text (for temp messages)
        const textKey = `${isUser ? 'u' : 'o'}_${text.trim()}`;
        if (shownTexts.has(textKey)) return;
        
        if (id) shownIds.add(String(id));
        shownTexts.add(textKey);

        const div = document.createElement("div");
        div.className = `chat-message ${isUser ? "chat-message-user" : "chat-message-operator"}`;
        const time = timestamp 
          ? new Date(timestamp).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
          : new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
        div.innerHTML = `<div class="chat-message-content"><p>${text.replace(/\n/g, "<br>")}</p><span class="chat-message-time">${time}</span></div>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      };

      const loadMessages = async () => {
        const data = await chatApi.getMessages();
        if (data.success && data.messages) {
          data.messages.forEach((m) => addMessage(m.text, m.isUser, m.id, m.timestamp || m.createdAt));
        }
      };

      const sendMessage = async () => {
        const text = chatInput.value.trim();
        if (!text) return;
        chatInput.value = "";
        
        // Add message locally with temp ID
        const tempId = `temp_${Date.now()}`;
        addMessage(text, true, tempId);
        
        // Send to server
        await chatApi.sendMessage(text);
      };

      addListener(chatButton, "click", toggleChat);
      addListener(chatClose, "click", toggleChat);
      addListener(chatSend, "click", sendMessage);
      addListener(chatInput, "keypress", (e) => { if (e.key === "Enter") sendMessage(); });

      // Poll for new messages
      const pollInterval = setInterval(async () => {
        if (isOpen) await loadMessages();
      }, 3000);
      cleanups.push(() => clearInterval(pollInterval));
    };

    // Resolve hero image if not from API
    const resolveHeroImage = () => {
      if (heroImageSrc) return;
      const candidates = ["images/hero/hero-students.webp", "images/hero/hero-students.jpg"];
      const tryNext = (i) => {
        if (i >= candidates.length) return;
        const img = new Image();
        img.onload = () => setHeroImageSrc(candidates[i]);
        img.onerror = () => tryNext(i + 1);
        img.src = candidates[i];
      };
      tryNext(0);
    };

    resolveHeroImage();
    initTranslation();
    initMenuAndScrolling();
    initFaq();
    initConsultationModal();
    initConsultationForms();
    initStatsAnimation();
    initAboutSlider();
    initStudentImages();
    initChatWidget();

    return () => cleanups.forEach((c) => c());
  }, []);

  // Helper to get localized content
  const t = (item, field) => {
    if (!item) return "";
    return language === "en" ? (item[`${field}En`] || item[field] || "") : (item[`${field}Uz`] || item[field] || "");
  };

  // Default data for fallback
  const defaultStats = [
    { id: "1", value: 10000, prefix: "$", suffix: "", descriptionUz: "10000$ gacha grant yutib olish imkoniyati", descriptionEn: "Win up to $10,000 grant" },
    { id: "2", value: 300, prefix: "+", suffix: "", descriptionUz: "Biz orqali chet elda talaba bo'lganlar soni", descriptionEn: "Students who studied abroad through us" },
    { id: "3", value: 100, prefix: "", suffix: "%", descriptionUz: "Biz qonuniy faoliyat olib boramiz", descriptionEn: "We operate legally" },
    { id: "4", value: 400, prefix: "", suffix: "+", descriptionUz: "Dunyo bo'ylab 400 dan ortiq universitetlar", descriptionEn: "400+ universities worldwide" },
  ];

  const defaultFeatures = [
    { id: "1", icon: "🎓", titleUz: "Tajriba", titleEn: "Experience", descriptionUz: "Uzoq yillik tajriba va ko'plab muvaffaqiyatli keyslar", descriptionEn: "Years of experience and many success stories" },
    { id: "2", icon: "👔", titleUz: "Professionallik", titleEn: "Professionalism", descriptionUz: "Kuchli va o'z ishini ustalari bo'lgan konsultantlar", descriptionEn: "Strong and skilled consultants" },
    { id: "3", icon: "🤝", titleUz: "Do'stonalik", titleEn: "Friendliness", descriptionUz: "Talabalik safarlarida ham qo'llab quvvatlov", descriptionEn: "Support throughout your student journey" },
    { id: "4", icon: "🔄", titleUz: "Kompleks xizmat", titleEn: "Complete Service", descriptionUz: "O'qish tanlashdan tortib viza jarayonlarigacha", descriptionEn: "From choosing studies to visa process" },
    { id: "5", icon: "✅", titleUz: "Ishonch", titleEn: "Trust", descriptionUz: "Jarayon shaffofligi va kafolatlangan natija", descriptionEn: "Process transparency and guaranteed results" },
    { id: "6", icon: "🤝", titleUz: "Hamkorliklar", titleEn: "Partnerships", descriptionUz: "Ko'plab o'quv yurtlari bilan shartnomalar", descriptionEn: "Contracts with many educational institutions" },
  ];

  const defaultCountries = [
    { nameUz: "Germaniya", nameEn: "Germany", bgText: "GERMANY", image: "images/countries/germany.webp" },
    { nameUz: "Latviya", nameEn: "Latvia", bgText: "LATVIA", image: "images/countries/latvia.webp" },
    { nameUz: "Avstraliya", nameEn: "Australia", bgText: "AUSTRALIA", image: "images/countries/australia.webp" },
    { nameUz: "Buyuk Britaniya", nameEn: "United Kingdom", bgText: "UNITED KINGDOM", image: "images/countries/uk.webp" },
    { nameUz: "Dubay", nameEn: "Dubai", bgText: "DUBAI", image: "images/countries/dubai.webp" },
    { nameUz: "Xitoy", nameEn: "China", bgText: "CHINA", image: "images/countries/china.webp" },
    { nameUz: "Korea", nameEn: "South Korea", bgText: "SOUTH KOREA", image: "images/countries/south-korea.webp" },
    { nameUz: "Singapur", nameEn: "Singapore", bgText: "SINGAPORE", image: "images/countries/singapore.webp" },
    { nameUz: "Malayziya", nameEn: "Malaysia", bgText: "MALAYSIA", image: "images/countries/malaysia.webp" },
    { nameUz: "Italiya", nameEn: "Italy", bgText: "ITALY", image: "images/countries/italy.webp" },
    { nameUz: "Kipr", nameEn: "Cyprus", bgText: "CYPRUS", image: "images/countries/cyprus.webp" },
    { nameUz: "Gollandiya", nameEn: "Netherlands", bgText: "NETHERLANDS", image: "images/countries/netherlands.webp" },
  ];

  const displayStats = stats.length ? stats : defaultStats;
  const displayFeatures = features.length ? features : defaultFeatures;
  const displayCountries = countries.length ? countries : defaultCountries;

  const getVideoId = (url) => {
    if (!url) return "T4Y_5AzRuag";
    if (url.includes("youtube.com/watch")) return new URL(url).searchParams.get("v") || "";
    if (url.includes("youtu.be/")) return url.split("youtu.be/")[1]?.split("?")[0] || "";
    if (url.includes("youtube.com/embed/")) return url.split("embed/")[1]?.split("?")[0] || "";
    return "";
  };

  return (
    <>
      <header className="header">
        <nav className="navbar">
          <div className="container">
            <div className="nav-wrapper">
              <div className="logo">
                <a href="#">
                  <img src="SVG/gorizontal logo qizil mark,qora type.svg" alt="Buran Consulting" className="logo-img" />
                </a>
              </div>
              <ul className="nav-menu" id="navMenu">
                <li><a href="#about" data-i18n="nav.about">Biz haqimizda</a></li>
                <li><a href="#programs" data-i18n="nav.programs">Dasturlar</a></li>
                <li><a href="#countries" data-i18n="nav.countries">Davlatlar</a></li>
                <li><a href="#results" data-i18n="nav.results">Natijalar</a></li>
                <li><a href="#faq" data-i18n="nav.faq">FAQ</a></li>
              </ul>
              <div className="nav-actions">
                <a href="tel:+998712000811" className="phone-link">+998 71 200 08 11</a>
                <div className="language-toggle">
                  <span className="lang active" data-lang="uz">Uz</span>
                  <span className="lang" data-lang="en">En</span>
                </div>
                <button className="btn-primary" data-i18n="register">Ro'yxatdan o'tish</button>
                <button className="menu-toggle" id="menuToggle">
                  <span></span><span></span><span></span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-background" style={heroImageSrc ? { backgroundImage: `linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%), url('${heroImageSrc}')` } : undefined}></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title" data-i18n="hero.title">Xalqaro talaba bo'lish biz bilan oson</h1>
              <p className="hero-subtitle" data-i18n="hero.subtitle">Buyuk Britaniya, Singapur, Avstraliya, Germaniya, Dubay va boshqa +15 davlatda ta'lim olish imkoniyati</p>
              <button className="btn-hero-gradient" data-i18n="hero.cta">KONSULTATSIYA OLISH</button>
            </div>
            <div className="hero-students">
              <img src={heroImageSrc || "images/hero/hero-students.webp"} alt="Talabalar" className="hero-students-img" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="statistics" id="statistics">
        <div className="container">
          <div className="stats-grid">
            {displayStats.map((stat, i) => {
              const val = stat.value || parseInt(String(stat.descriptionUz || "").replace(/[^0-9]/g, ""), 10) || 0;
              const display = `${stat.prefix || ""}${val}${stat.suffix || ""}`;
              return (
                <div className="stat-card" key={stat.id || i} data-value={display}>
                  <h2 className="stat-number">
                    <span className="stat-number-value">{display}</span>
                  </h2>
                  <div className="stat-line"></div>
                  <p className="stat-text">{t(stat, "description")}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="consultation-section" id="consultation-section">
        <div className="container">
          <div className="consultation-wrapper">
            <h2 className="consultation-title" data-i18n="consultation.title">Bepul konsultatsiya oling</h2>
            <p className="consultation-subtitle" data-i18n="consultation.subtitle">Quyidagi formani to'ldirib bepul konsultatsiyaga yoziling</p>
            <form className="simple-consultation-form" id="simpleConsultationForm">
              <div className="form-row">
                <input type="text" name="name" placeholder="Ismingiz" data-i18n="consultation.namePlaceholder" required />
                <input type="tel" name="phone" placeholder="Tel raqam" data-i18n="consultation.phonePlaceholder" required />
              </div>
              <div className="form-row">
                <select name="country" className="form-select" required>
                  <option value="" data-i18n="consultation.countryDefault">Qaysi davlatda o'qishni xohlaysiz?</option>
                  <option value="Buyuk Britaniya">Buyuk Britaniya</option>
                  <option value="Singapur">Singapur</option>
                  <option value="Avstraliya">Avstraliya</option>
                  <option value="Germaniya">Germaniya</option>
                  <option value="Dubay">Dubay</option>
                  <option value="Xitoy">Xitoy</option>
                  <option value="Korea">Korea</option>
                  <option value="Malayziya">Malayziya</option>
                  <option value="Italiya">Italiya</option>
                  <option value="Kipr">Kipr</option>
                  <option value="Gollandiya">Gollandiya</option>
                  <option value="Latviya">Latviya</option>
                  <option value="Boshqa">Boshqa</option>
                </select>
              </div>
              <button type="submit" className="btn-consultation-red" data-i18n="consultation.submit">Konsultatsiya olish</button>
            </form>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 data-i18n="about.title">Biz haqimizda</h2>
              <p data-i18n="about.text1">Buran Consulting 2018 yil tashkil topgan va ingliz zabon yurtdagi universitetlar bilan hamkorlikda ishlaydi. Shu vaqtgacha biz 500 ga yaqin insonlarga universitetga kirishda, universitetdan chegirma olishda va viza jarayonlarida ko'maklashgan.</p>
              <p data-i18n="about.text2">2023 yil Buran Consulting Oxford International Group tomonidan eng zo'r o'rta Osiyodagi agentlik deb topilgan. Bundan tashqari, Buran Consulting British council tomonidan tasdiqlangan agentlik hisoblanadi va ICEF jamg'armasi azosi hisoblanadi.</p>
              <a href="#consultation-section" className="btn-secondary" data-i18n="about.more">Batafsil</a>
            </div>
            <div className="about-image">
              <div className="about-slider">
                <div className="about-slider-container"></div>
                <div className="about-slider-dots"></div>
                <div className="about-slider-nav">
                  <button className="about-slider-prev" aria-label="Previous">‹</button>
                  <button className="about-slider-next" aria-label="Next">›</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="why-us" id="why-us">
        <div className="container">
          <h2 className="section-title" data-i18n="whyUs.title">Nima uchun Buran Consulting?</h2>
          <div className="features-grid">
            {displayFeatures.map((f, i) => (
              <div className="feature-card" key={f.id || i}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{t(f, "title")}</h3>
                <p>{t(f, "description")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="programs" id="programs">
        <div className="container">
          <h2 className="section-title" data-i18n="programs.title">Bizning dasturlar</h2>
          <p className="section-subtitle" data-i18n="programs.subtitle">Biz talabalarga quyidagi dasturlarni taklif qilamiz:</p>
          
          {programs.length > 0 ? programs.map((prog, i) => {
            const isLeft = i % 2 === 1;
            const num = String(i + 1).padStart(2, "0");
            const imgSrc = prog.imageUz ? getImageUrl(prog.imageUz) : `images/programs/program-${i + 1}.webp`;
            return (
              <div className={`program-item ${isLeft ? "program-item-left" : "program-item-right"}`} key={prog.id || i}>
                <div className="program-number">{num}</div>
                <div className="program-content">
                  {isLeft && <div className="program-image"><img src={imgSrc} alt={t(prog, "title")} className="program-img" loading="lazy" /></div>}
                  <div className="program-text">
                    <h3 className="program-title">{t(prog, "title")}</h3>
                    <p>{t(prog, "description1")}</p>
                    {t(prog, "description2") && <p><strong>{t(prog, "description2")}</strong></p>}
                    <button className="btn-link">Batafsil</button>
                  </div>
                  {!isLeft && <div className="program-image"><img src={imgSrc} alt={t(prog, "title")} className="program-img" loading="lazy" /></div>}
                </div>
              </div>
            );
          }) : (
            <>
              <div className="program-item program-item-right">
                <div className="program-number">01</div>
                <div className="program-content">
                  <div className="program-text">
                    <h3 className="program-title" data-i18n="programs.languagePrep.title">Language Preparation Courses</h3>
                    <p data-i18n="programs.languagePrep.text1">Ko'pchilik yoshlar ingliz tilini bilmagani sabab xorijda o'qish orzusi yopildi deb o'ylaydi.</p>
                    <p><strong data-i18n="programs.languagePrep.question">🔎 Qaysi davlatlar? Qanday shartlar?</strong></p>
                    <button className="btn-link">Batafsil</button>
                  </div>
                  <div className="program-image"><img src="images/programs/language-prep.webp" alt="Language Prep" className="program-img" loading="lazy" /></div>
                </div>
              </div>
              <div className="program-item program-item-left">
                <div className="program-number">02</div>
                <div className="program-content">
                  <div className="program-image"><img src="images/programs/foundation.webp" alt="Foundation" className="program-img" loading="lazy" /></div>
                  <div className="program-text">
                    <h3 className="program-title" data-i18n="programs.foundation.title">Foundation Programme</h3>
                    <p data-i18n="programs.foundation.text1">Dunyoning ko'plab universitetlarida bakalavr bosqichiga kirish uchun 12 yillik ta'lim talab qilinadi.</p>
                    <button className="btn-link">Batafsil</button>
                  </div>
                </div>
              </div>
              <div className="program-item program-item-right">
                <div className="program-number">03</div>
                <div className="program-content">
                  <div className="program-text">
                    <h3 className="program-title" data-i18n="programs.bachelor.title">Bachelor's Degree</h3>
                    <p data-i18n="programs.bachelor.text1">Xorijiy universitetlarda bakalavr ta'limi odatda 3 yil davom etadi.</p>
                    <button className="btn-link">Batafsil</button>
                  </div>
                  <div className="program-image"><img src="images/programs/bachelor.webp" alt="Bachelor" className="program-img" loading="lazy" /></div>
                </div>
              </div>
              <div className="program-item program-item-left">
                <div className="program-number">04</div>
                <div className="program-content">
                  <div className="program-image"><img src="images/programs/masters.webp" alt="Masters" className="program-img" loading="lazy" /></div>
                  <div className="program-text">
                    <h3 className="program-title" data-i18n="programs.masters.title">Master's Degree</h3>
                    <p data-i18n="programs.masters.text1">Magistratura bosqichi — bilimni chuqurlashtirish va xalqaro mehnat bozoriga chiqish uchun muhim qadam.</p>
                    <button className="btn-link">Batafsil</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="countries" id="countries">
        <div className="container">
          <h2 className="section-title" data-i18n="countries.title">BIZ O'QISHGA YUBORADIGAN DAVLATLAR</h2>
          <p className="section-subtitle" data-i18n="countries.subtitle">Dunyoning TOP universitetlarida o'qish imkoniyati</p>
          <div className="countries-grid-large">
            {displayCountries.map((c, i) => {
              const imgSrc = (c.imageUz || c.image) ? getImageUrl(c.imageUz || c.image) : `images/countries/country-${i + 1}.webp`;
              return (
                <div className="country-card-large" key={c.id || i}>
                  <div className="country-image">
                    <img src={imgSrc} alt={t(c, "name")} className="country-img" loading="lazy" />
                    <div className="country-overlay">{c.bgText || t(c, "name").toUpperCase()}</div>
                    <div className="country-name">{t(c, "name")}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2 className="section-title" data-i18n="howItWorks.title">Biz qanday ishlaymiz?</h2>
          <div className="timeline">
            {steps.length > 0 ? steps.map((step, i) => (
              <div className="timeline-item" key={step.id || i}>
                <div className="timeline-number">{i + 1}</div>
                <div className={`timeline-content ${i % 2 === 0 ? "right" : "left"}`}>
                  <h3>{t(step, "title")}</h3>
                  <p>{t(step, "description")}</p>
                </div>
              </div>
            )) : (
              <>
                <div className="timeline-item"><div className="timeline-number">1</div><div className="timeline-content right"><h3>Murojaat qilasiz</h3><p>Ushbu sayt orqali yoki 712000811 raqamiga qo'ng'iroq qilib konsultatsiya olasiz</p></div></div>
                <div className="timeline-item"><div className="timeline-number">2</div><div className="timeline-content right"><h3>Shartnoma bilan tanishasiz</h3><p>Biz yuborgan shartnoma shartlari bilan tanishib chiqib imzolaysiz</p></div></div>
                <div className="timeline-item"><div className="timeline-number">3</div><div className="timeline-content left"><h3>Suhbatdan o'tish</h3><p>Buran Consulting sizni suhbatdan oldin tayyorlaydi va siz suhbatdan o'tasiz</p></div></div>
                <div className="timeline-item"><div className="timeline-number">4</div><div className="timeline-content right"><h3>VISA olish</h3><p>BURAN CONSULTING VISA 100% chiqishi uchun hujjatlarni to'g'ri taqdim qilishda ko'maklashadi</p></div></div>
                <div className="timeline-item"><div className="timeline-number">5</div><div className="timeline-content left"><h3>Ketishga tayyorgarlik!</h3><p>VISAni olib, yotoqxonadan joy bron qilingandan keyin ketishga tayyorgarlik ko'ring!</p></div></div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="video-section" id="video-section">
        <div className="container">
          <h2 className="section-title" data-i18n="video.title">Qisqa videoni ko'ring</h2>
          <div className="video-wrapper">
            <iframe width="560" height="315" src={`https://www.youtube.com/embed/${getVideoId(videoUrl)}`} title="YouTube video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
        </div>
      </section>

      <section className="results" id="results">
        <div className="certificates">
          <div className="container">
            <h2 className="section-title" data-i18n="certificates.title">STUDENTLAR FIKRLARI</h2>
            <div className="student-testimonials-grid">
              {testimonials.length > 0 ? testimonials.slice(0, 3).map((test, i) => (
                <div className="student-testimonial-card" key={test.id || i}>
                  <div className="student-profile-img">
                    <img src={test.avatar ? getImageUrl(test.avatar) : `images/students/${i + 1}.webp`} alt={t(test, "name")} className="student-img" data-student-img={i + 1} />
                  </div>
                  <div className="student-testimonial-content">
                    <p className="student-testimonial-text">{t(test, "text")}</p>
                    <h3 className="student-name">{t(test, "name")}</h3>
                    <p className="student-university">{t(test, "university")}</p>
                  </div>
                </div>
              )) : (
                <>
                  <div className="student-testimonial-card">
                    <div className="student-profile-img"><img src="" alt="Student" className="student-img" data-student-img="1" /></div>
                    <div className="student-testimonial-content">
                      <p className="student-testimonial-text" data-i18n="certificates.students.student4.text">Hammaga salom. Men Muhammadali Sattorov...</p>
                      <h3 className="student-name" data-i18n="certificates.students.student4.name">Muhammadali Sattorov</h3>
                      <p className="student-university" data-i18n="certificates.students.student4.university">NJUPT University, China</p>
                    </div>
                  </div>
                  <div className="student-testimonial-card">
                    <div className="student-profile-img"><img src="" alt="Student" className="student-img" data-student-img="2" /></div>
                    <div className="student-testimonial-content">
                      <p className="student-testimonial-text" data-i18n="certificates.students.student5.text">Hello! My name is MUHAMMADALI...</p>
                      <h3 className="student-name" data-i18n="certificates.students.student5.name">Muhammadali Bakhtiyar</h3>
                      <p className="student-university" data-i18n="certificates.students.student5.university">Canadian University Dubai</p>
                    </div>
                  </div>
                  <div className="student-testimonial-card">
                    <div className="student-profile-img"><img src="" alt="Student" className="student-img" data-student-img="3" /></div>
                    <div className="student-testimonial-content">
                      <p className="student-testimonial-text" data-i18n="certificates.students.student6.text">Assalomu alaykum! Men Alibek Eshboltaev...</p>
                      <h3 className="student-name" data-i18n="certificates.students.student6.name">Alibek Eshboltaev</h3>
                      <p className="student-university" data-i18n="certificates.students.student6.university">Berlin, Germany</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="testimonials">
          <div className="container">
            <h2 className="section-title" data-i18n="testimonials.title">Chet elda ta'lim bo'yicha foydali tavsiyalar</h2>
            <div className="testimonials-video-grid">
              {tips.length > 0 ? tips.slice(0, 3).map((tip, i) => {
                const vid = getVideoId(tip.videoUrl || tip.youtubeUrl);
                if (!vid) return null;
                return (
                  <div className="testimonial-video-card" key={tip.id || i}>
                    <h3 className="testimonial-video-title">{t(tip, "title")}</h3>
                    <div className="testimonial-video-wrapper">
                      <iframe width="560" height="315" src={`https://www.youtube.com/embed/${vid}`} title={t(tip, "title")} frameBorder="0" allowFullScreen></iframe>
                    </div>
                  </div>
                );
              }) : (
                <>
                  <div className="testimonial-video-card"><h3 className="testimonial-video-title">IELTS siz yevropada o'qish</h3><div className="testimonial-video-wrapper"><iframe width="560" height="315" src="https://www.youtube.com/embed/l9qcWT7Tnxc" title="IELTS" frameBorder="0" allowFullScreen></iframe></div></div>
                  <div className="testimonial-video-card"><h3 className="testimonial-video-title">Dubayda o'qish</h3><div className="testimonial-video-wrapper"><iframe width="560" height="315" src="https://www.youtube.com/embed/Oxegp3kvqr4" title="Dubai" frameBorder="0" allowFullScreen></iframe></div></div>
                  <div className="testimonial-video-card"><h3 className="testimonial-video-title">Til bilmasdan</h3><div className="testimonial-video-wrapper"><iframe width="560" height="315" src="https://www.youtube.com/embed/_bmEEebUC84" title="No language" frameBorder="0" allowFullScreen></iframe></div></div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="faq" id="faq">
        <div className="container">
          <h2 className="section-title" data-i18n="faq.title">Ko'p beriladigan savollar</h2>
          <p className="faq-cta" data-i18n-html="faq.cta">O'z savolingizga javob topish uchun qo'ng'iroq qiling: <a href="tel:+998712000811">+998712000811</a></p>
          <div className="faq-list">
            {faqs.length > 0 ? faqs.map((faq, i) => (
              <div className="faq-item" key={faq.id || i}>
                <div className="faq-question"><h3>{t(faq, "question")}</h3><span className="faq-toggle">+</span></div>
                <div className="faq-answer"><p>{t(faq, "answer")}</p></div>
              </div>
            )) : (
              <>
                <div className="faq-item"><div className="faq-question"><h3 data-i18n="faq.questions.q1.question">O'qish davomida ishlash mumkinmi?</h3><span className="faq-toggle">+</span></div><div className="faq-answer"><p data-i18n="faq.questions.q1.answer">Ha, ko'plab davlatlarda talabalar o'qish davomida ishlash imkoniyatiga ega.</p></div></div>
                <div className="faq-item"><div className="faq-question"><h3 data-i18n="faq.questions.q2.question">Ingliz tilini yaxshi bilmayman?</h3><span className="faq-toggle">+</span></div><div className="faq-answer"><p data-i18n="faq.questions.q2.answer">Albatta! Ingliz tilini bilmasangiz ham chet elda o'qish imkoniyati bor.</p></div></div>
                <div className="faq-item"><div className="faq-question"><h3 data-i18n="faq.questions.q3.question">Kontrakt summasi nechpul?</h3><span className="faq-toggle">+</span></div><div className="faq-answer"><p data-i18n="faq.questions.q3.answer">Kontrakt summasi tanlangan dastur va universitetga qarab farq qiladi.</p></div></div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="location" id="location">
        <div className="container">
          <h2 className="section-title" data-i18n="location.title">Bizning manzil</h2>
          <div className="location-content">
            <div className="location-info">
              <div className="location-address"><h3 data-i18n="location.address.title">MANZIL</h3><p data-i18n="location.address.text">Toshkent shahri, Mirzo Ulug'bek t, 5-y proyezd Sayram 4A. Sayram bizness markazi, 7-etaj</p></div>
              <div className="location-landmarks"><h3 data-i18n="location.landmarks.title">LANDMARK</h3><p data-i18n="location.landmarks.text">Buyuk ipak yo'li Metro - 5-6 daqiqa</p></div>
              <div className="location-contact"><h3>TELEFON</h3><a href="tel:+998712000811">+998 71 200 08 11</a></div>
            </div>
            <div className="location-map">
              <iframe src={mapUrl || "https://yandex.uz/map-widget/v1/?um=constructor%3A9b8b9b8b9b8b9b8b9b8b9b8b9b8b9b8b&amp;source=constructor&amp;ll=69.285278%2C41.341389&amp;z=17&amp;pt=69.285278,41.341389,pm2rdm"} width="100%" height="400" frameBorder="0" allowFullScreen="" loading="lazy" title="Office location" style={{ borderRadius: '12px' }}></iframe>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <img src="SVG/gorizontal logo qizil mark,oq type.svg" alt="Buran Consulting" className="footer-logo" />
              <p className="footer-tagline" data-i18n="footer.tagline">Sizning xalqaro ta'lim bo'yicha ishonchli hamkoringiz</p>
            </div>
            <div className="footer-section">
              <h3 data-i18n="footer.quickLinks">Tezkor havolalar</h3>
              <ul className="footer-links">
                <li><a href="#about" data-i18n="nav.about">Biz haqimizda</a></li>
                <li><a href="#programs" data-i18n="nav.programs">Dasturlar</a></li>
                <li><a href="#countries" data-i18n="nav.countries">Davlatlar</a></li>
                <li><a href="#faq" data-i18n="nav.faq">FAQ</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3 data-i18n="footer.contact">Aloqa</h3>
              <ul className="footer-contact">
                <li><a href="tel:+998712000811">+998 71 200 08 11</a></li>
                <li><a href="mailto:info@buranconsulting.uz">info@buranconsulting.uz</a></li>
                <li>Toshkent, Sayram BC, 7-etaj</li>
              </ul>
            </div>
            <div className="footer-section">
              <h3 data-i18n="footer.social">Ijtimoiy tarmoqlar</h3>
              <div className="social-links">
                <a href="https://t.me/buranconsulting" target="_blank" rel="noopener noreferrer" aria-label="Telegram">📱</a>
                <a href="https://instagram.com/buranconsulting" target="_blank" rel="noopener noreferrer" aria-label="Instagram">📷</a>
                <a href="https://youtube.com/@buranconsulting" target="_blank" rel="noopener noreferrer" aria-label="YouTube">🎬</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Buran Consulting. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>

      {/* Consultation Modal */}
      <div className="consultation-modal" id="consultationModal">
        <div className="modal-overlay" id="modalOverlay"></div>
        <div className="modal-content">
          <button className="modal-close" id="modalClose" aria-label="Yopish"><span>×</span></button>
          <div className="modal-header-banner">
            <div className="modal-header-content">
              <div className="modal-header-text"><h3 className="modal-banner-title">KONSULTATSIYA</h3><h4 className="modal-banner-subtitle">CHET ELDA TA'LIM</h4></div>
              <div className="modal-header-logo"><img src="SVG/gorizontal logo qizil mark,qora type.svg" alt="Buran Consulting" className="modal-logo-img" /></div>
            </div>
          </div>
          <div className="modal-body">
            <h2 className="modal-title" data-i18n="consultation.title">BEPUL KONSULTATSIYA OLING</h2>
            <p className="modal-subtitle" data-i18n="consultation.subtitle">Buning uchun quyidagi formani to'ldiring</p>
            <form className="modal-consultation-form" id="modalConsultationForm">
              <div className="form-row">
                <input type="text" name="name" placeholder="Ismingiz" data-i18n="consultation.namePlaceholder" required />
                <input type="tel" name="phone" placeholder="Tel raqam" data-i18n="consultation.phonePlaceholder" required />
              </div>
              <div className="form-row">
                <select name="country" className="form-select" required>
                  <option value="">Qaysi davlatda o'qishni xohlaysiz?</option>
                  <option value="Buyuk Britaniya">Buyuk Britaniya</option>
                  <option value="Singapur">Singapur</option>
                  <option value="Avstraliya">Avstraliya</option>
                  <option value="Germaniya">Germaniya</option>
                  <option value="Dubay">Dubay</option>
                  <option value="Xitoy">Xitoy</option>
                  <option value="Korea">Korea</option>
                  <option value="Malayziya">Malayziya</option>
                  <option value="Italiya">Italiya</option>
                  <option value="Kipr">Kipr</option>
                  <option value="Gollandiya">Gollandiya</option>
                  <option value="Latviya">Latviya</option>
                  <option value="Boshqa">Boshqa</option>
                </select>
              </div>
              <button type="submit" className="btn-consultation-black" data-i18n="consultation.submit">Konsultatsiya olish</button>
            </form>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <div className="chat-widget" id="chatWidget">
        <button className="chat-button" id="chatButton" aria-label="Open chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/></svg>
        </button>
        <div className="chat-window" id="chatWindow">
          <div className="chat-header">
            <button className="chat-close" id="chatClose" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <div className="chat-header-info">
              <div className="chat-operator"><span className="chat-operator-name">Operator Safia</span><span className="chat-status-dot"></span></div>
              <div className="chat-operator-role">User</div>
              <div className="chat-operator-telegram">@buran_manager_sofia</div>
            </div>
          </div>
          <div className="chat-messages" id="chatMessages">
            <div className="chat-message chat-message-operator">
              <div className="chat-message-content"><p data-i18n="chat.welcome">Salom! Qanday yordam bera olaman?</p><span className="chat-message-time"></span></div>
            </div>
          </div>
          <div className="chat-input-container">
            <input type="text" className="chat-input" id="chatInput" placeholder="Xabar yozing..." />
            <button className="chat-send" id="chatSend" aria-label="Send">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
