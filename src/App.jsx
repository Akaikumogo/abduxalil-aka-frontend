import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import SplashScreen from "./components/ui/SplashScreen.jsx";
import { translations } from "./translations.js";
import { 
  heroApi, statsApi, featuresApi, programsApi, countriesApi, 
  stepsApi, videoApi, testimonialsApi, tipsApi, faqApi, aboutApi, aboutImagesApi, contactApi,
  applicationsApi, chatApi, sendToGoogleSheets, getImageUrl 
} from "./services/api.js";

const SPLASH_STORAGE_KEY = "buran_splash_shown";

export default function App() {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem(SPLASH_STORAGE_KEY));
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
  const [aboutSettings, setAboutSettings] = useState(null);

  // Helper: preload hero image before ko'rsatish
  const preloadImage = (src, onLoad) => {
    if (!src) return;
    const img = new Image();
    img.onload = () => onLoad(src);
    img.onerror = () => onLoad(src); // xato bo'lsa ham URLni o'rnatamiz
    img.src = src;
  };

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
          stepsData, videoData, testimonialsData, tipsData, faqData, heroData, contactData, aboutData
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
          aboutApi.get().catch(() => null),
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

        // Hero image from API (preload first)
        if (heroData) {
          const lang = localStorage.getItem("selectedLanguage") || "uz";
          const imgPath = lang === "en" ? heroData.imageEn : heroData.imageUz;
          const fullUrl = imgPath ? getImageUrl(imgPath) : null;
          if (fullUrl) {
            preloadImage(fullUrl, setHeroImageSrc);
          }
        }
        if (contactData?.mapUrl) setMapUrl(contactData.mapUrl);
        if (aboutData) setAboutSettings(aboutData);
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

        // Update hero image based on language (preload)
        heroApi.getSettings().then((data) => {
          if (data) {
            const imgPath = lang === "en" ? data.imageEn : data.imageUz;
            const fullUrl = imgPath ? getImageUrl(imgPath) : null;
            if (fullUrl) {
              preloadImage(fullUrl, setHeroImageSrc);
            }
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
      // Event delegation: works even when FAQ items render later from API
      addListener(document, "click", (e) => {
        const target = e.target;
        const question = target?.closest ? target.closest(".faq-question") : null;
        if (!question) return;
        const item = question.closest?.(".faq-item");
        if (!item) return;

          const isActive = item.classList.contains("active");
        document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("active"));
        if (!isActive) item.classList.add("active");
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

    // About slider — avval backenddan rasmlar, bo'lmasa public/images/about/*
    const initAboutSlider = () => {
      const sliderContainer = document.querySelector(".about-slider-container");
      const dotsContainer = document.querySelector(".about-slider-dots");
      const prevBtn = document.querySelector(".about-slider-prev");
      const nextBtn = document.querySelector(".about-slider-next");

      if (!sliderContainer || !dotsContainer) return;

      const maxImages = 20;
      const imageFormats = ["jpg", "jpeg", "png", "webp"];

      const checkImageExists = (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = src;
        });

      // Avval backenddagi gallery dan rasmlar olamiz, bo'lmasa public papkadan qidiramiz
      const findAvailableImages = async () => {
        // 1) Backend gallery
        try {
          const apiImages = await aboutImagesApi.getAll();
          if (Array.isArray(apiImages) && apiImages.length) {
            const mapped = apiImages
              .slice()
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((item, index) => ({
                index,
                path: getImageUrl(item.imageUrl) || item.imageUrl,
              }))
              .filter((img) => !!img.path);

            if (mapped.length) return mapped;
          }
        } catch (e) {
          // ignore and fallback to static files
        }

        // 2) Fallback: public/images/about/*
        const foundImages = [];
        for (let i = 1; i <= maxImages; i += 1) {
          let imageFound = false;
          for (let j = 0; j < imageFormats.length; j += 1) {
            const format = imageFormats[j];
            const imagePath = `images/about/${i}.${format}`;
            // eslint-disable-next-line no-await-in-loop
            const exists = await checkImageExists(imagePath);
            if (exists && !imageFound) {
              imageFound = true;
              foundImages.push({ index: i - 1, path: imagePath });
            }
          }
        }
        return foundImages.sort((a, b) => a.index - b.index);
      };

      const createSlider = (images) => {
        if (images.length === 0) {
          sliderContainer.innerHTML = `
            <div class="about-slide active">
              <div style="width: 100%; height: 100%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999;">
                <p>Rasmlar topilmadi</p>
              </div>
            </div>
          `;
          return;
        }

        sliderContainer.innerHTML = "";
        dotsContainer.innerHTML = "";

        images.forEach((img, index) => {
          const slide = document.createElement("div");
          slide.className = `about-slide ${index === 0 ? "active" : ""}`;
          slide.innerHTML = `<img src="${img.path}" alt="Buran Consulting ${index + 1}" class="about-img" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">`;
          sliderContainer.appendChild(slide);

          const dot = document.createElement("span");
          dot.className = `about-dot ${index === 0 ? "active" : ""}`;
          dot.setAttribute("data-slide", index);
          dotsContainer.appendChild(dot);
        });

        const slides = document.querySelectorAll(".about-slide");
        const dots = document.querySelectorAll(".about-dot");
        let currentSlide = 0;
        let slideInterval = null;

        const showSlide = (index) => {
          slides.forEach((slide) => slide.classList.remove("active"));
          dots.forEach((dot) => dot.classList.remove("active"));
          if (slides[index]) slides[index].classList.add("active");
          if (dots[index]) dots[index].classList.add("active");
          currentSlide = index;
        };

        const nextSlide = () => showSlide((currentSlide + 1) % slides.length);
        const prevSlide = () => showSlide((currentSlide - 1 + slides.length) % slides.length);
        const startInterval = () => {
          slideInterval = setInterval(nextSlide, 4000);
        };
        const resetInterval = () => {
          clearInterval(slideInterval);
          startInterval();
        };

        if (nextBtn) addListener(nextBtn, "click", () => { nextSlide(); resetInterval(); });
        if (prevBtn) addListener(prevBtn, "click", () => { prevSlide(); resetInterval(); });
        dots.forEach((dot, index) => {
          addListener(dot, "click", () => {
            showSlide(index);
            resetInterval();
          });
        });

        const slider = document.querySelector(".about-slider");
        if (slider) {
          addListener(slider, "mouseenter", () => clearInterval(slideInterval));
          addListener(slider, "mouseleave", () => startInterval());
        }

        startInterval();
        cleanups.push(() => clearInterval(slideInterval));
      };

      findAvailableImages().then(createSlider);
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

    initTranslation();
    initMenuAndScrolling();
    initFaq();
    initConsultationModal();
    initConsultationForms();
    initAboutSlider();
    initStudentImages();
    initChatWidget();

    return () => cleanups.forEach((c) => c());
  }, []);

  // Stats raqam animatsiyasi — stats/displayStats o‘zgaganda yangi kartalarga observer ulanadi
  useEffect(() => {
    // Animatsiya faqat raqamni (va prefix) o‘z ichiga oladi, suffix alohida .stat-number-label da
    const animateValue = (element, start, end, duration, options = {}) => {
      const { prefix = "" } = options;
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * (end - start) + start);
        element.textContent = prefix + current.toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
        else element.textContent = prefix + end.toLocaleString();
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
          if (statNumber) {
            setTimeout(() => animateValue(statNumber, 0, value, 2500, { prefix }), 300);
          }
        }
      });
    }, { threshold: 0.2 });

    const scheduleObserve = () => {
      document.querySelectorAll(".stat-card").forEach((card) => observer.observe(card));
    };
    const t = setTimeout(scheduleObserve, 0);
    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, [stats]);

  // Helper to get localized content
  const t = (item, field) => {
    if (!item) return "";
    return language === "en" ? (item[`${field}En`] || item[field] || "") : (item[`${field}Uz`] || item[field] || "");
  };

  const aboutT = (fieldBase, fallback = "") => {
    if (!aboutSettings) return fallback;
    return language === "en" ? (aboutSettings[`${fieldBase}En`] || fallback) : (aboutSettings[`${fieldBase}Uz`] || fallback);
  };

  const sectionAnim = {
    initial: { y: 24 },
    whileInView: { y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, ease: "easeOut" },
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
      {showSplash && (
        <SplashScreen
          onComplete={() => {
            sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
            setShowSplash(false);
          }}
        />
      )}
      <header className="header">
        <nav className="navbar">
          <div className="container">
            <div className="nav-wrapper">
              <div className="logo">
                <a href="#">
                  <img src="SVG/gorizontal logo qizil mark,qora type.svg" alt="Buran Consulting" className="logo-img" loading="eager" decoding="async" />
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

      <motion.section {...sectionAnim} className="hero">
        <div
          className="hero-background"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%), url('${
              heroImageSrc || "https://aa.akaikumogo.uz/uploads/hero/hero_uz_1770042347905.webp"
            }')`,
          }}
        ></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title" data-i18n="hero.title">Xalqaro talaba bo'lish biz bilan oson</h1>
              <p className="hero-subtitle" data-i18n="hero.subtitle">Buyuk Britaniya, Singapur, Avstraliya, Germaniya, Dubay va boshqa +15 davlatda ta'lim olish imkoniyati</p>
              <button className="btn-hero-gradient" data-i18n="hero.cta">KONSULTATSIYA OLISH</button>
            </div>
            <div className="hero-students">
              {heroImageSrc && <img src={heroImageSrc} alt="Talabalar" className="hero-students-img" loading="eager" fetchPriority="high" decoding="async" />}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionAnim} className="statistics" id="statistics">
        <div className="container">
          <div className="stats-grid">
            {displayStats.map((stat, i) => {
              const rawVal = stat.value ?? (parseInt(String(stat.descriptionUz || "").replace(/[^0-9]/g, ""), 10) || 0);
              const numVal = typeof rawVal === "number" ? rawVal : (parseInt(String(rawVal).replace(/[^0-9]/g, ""), 10) || 0);

              let valueText = "";
              if (typeof rawVal === "string") {
                const s = rawVal.trim();
                const m = s.match(/^([+\$]?\d[\d.,]*%?)(?:\s*)(.*)$/);
                valueText = (m?.[1] || s).trim();
              } else {
                valueText = `${stat.prefix || ""}${rawVal}`;
              }
              const displayValue = `${stat.prefix || ""}${numVal}`;

              return (
                <div className="stat-card" key={stat.id || i} data-value={valueText}>
                  <h2 className="stat-number">
                    <span className="stat-number-value">{displayValue}</span>
                    {stat?.suffix ? <span className="stat-number-label">{stat.suffix}</span> : null}
                  </h2>
              <div className="stat-line"></div>
                  <p className="stat-text">{t(stat, "description")}</p>
            </div>
              );
            })}
            </div>
            </div>
      </motion.section>

      <motion.section {...sectionAnim} className="consultation-section" id="consultation-section">
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
      </motion.section>

      <motion.section {...sectionAnim} className="about" id="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>{aboutT("title", "Biz haqimizda")}</h2>
              <p>{aboutT("text1", "Buran Consulting 2018 yil tashkil topgan va ingliz zabon yurtdagi universitetlar bilan hamkorlikda ishlaydi. Shu vaqtgacha biz 500 ga yaqin insonlarga universitetga kirishda, universitetdan chegirma olishda va viza jarayonlarida ko'maklashgan.")}</p>
              <p>{aboutT("text2", "2023 yil Buran Consulting Oxford International Group tomonidan eng zo'r o'rta Osiyodagi agentlik deb topilgan. Bundan tashqari, Buran Consulting British council tomonidan tasdiqlangan agentlik hisoblanadi va ICEF jamg'armasi azosi hisoblanadi.")}</p>
              <a href="#consultation-section" className="btn-secondary">{aboutT("buttonText", "Batafsil")}</a>
            </div>
            <div className="about-image">
              <div className="about-slider">
                <div className="about-slider-container"></div>
                <div className="about-slider-dots"></div>
                <div className="about-slider-nav">
                  <button type="button" className="about-slider-prev" aria-label="Previous slide">
                    ‹
                  </button>
                  <button type="button" className="about-slider-next" aria-label="Next slide">
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionAnim} className="why-us" id="why-us">
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
      </motion.section>

      <motion.section {...sectionAnim} className="programs" id="programs">
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
                  {isLeft && <div className="program-image"><img src={imgSrc} alt={t(prog, "title")} className="program-img" loading="lazy" decoding="async" /></div>}
                  <div className="program-text">
                    <h3 className="program-title">{t(prog, "title")}</h3>
                    <p>{t(prog, "description1")}</p>
                    {t(prog, "description2") && <p><strong>{t(prog, "description2")}</strong></p>}
                    <button className="btn-link">Batafsil</button>
                  </div>
                  {!isLeft && <div className="program-image"><img src={imgSrc} alt={t(prog, "title")} className="program-img" loading="lazy" decoding="async" /></div>}
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
                  <div className="program-image"><img src="images/programs/language-prep.webp" alt="Language Prep" className="program-img" loading="lazy" decoding="async" /></div>
              </div>
            </div>
          <div className="program-item program-item-left">
            <div className="program-number">02</div>
            <div className="program-content">
                  <div className="program-image"><img src="images/programs/foundation.webp" alt="Foundation" className="program-img" loading="lazy" decoding="async" /></div>
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
                  <div className="program-image"><img src="images/programs/bachelor.webp" alt="Bachelor" className="program-img" loading="lazy" decoding="async" /></div>
              </div>
            </div>
          <div className="program-item program-item-left">
            <div className="program-number">04</div>
            <div className="program-content">
                  <div className="program-image"><img src="images/programs/masters.webp" alt="Masters" className="program-img" loading="lazy" decoding="async" /></div>
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
      </motion.section>

      <motion.section {...sectionAnim} className="countries" id="countries">
        <div className="container">
          <h2 className="section-title" data-i18n="countries.title">BIZ O'QISHGA YUBORADIGAN DAVLATLAR</h2>
          <p className="section-subtitle" data-i18n="countries.subtitle">Dunyoning TOP universitetlarida o'qish imkoniyati</p>
          <div className="countries-grid-large">
            {displayCountries.map((c, i) => {
              const imgSrc = (c.imageUz || c.image) ? getImageUrl(c.imageUz || c.image) : `images/countries/country-${i + 1}.webp`;
              return (
                <div className="country-card-large" key={c.id || i}>
              <div className="country-image">
                    <img src={imgSrc} alt={t(c, "name")} className="country-img" loading="lazy" decoding="async" />
                    <div className="country-overlay">{c.bgText || t(c, "name").toUpperCase()}</div>
                    <div className="country-name">{t(c, "name")}</div>
              </div>
            </div>
              );
            })}
              </div>
            </div>
      </motion.section>

      <motion.section {...sectionAnim} className="how-it-works" id="how-it-works">
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
      </motion.section>

      <motion.section {...sectionAnim} className="video-section" id="video-section">
        <div className="container">
          <h2 className="section-title" data-i18n="video.title">Qisqa videoni ko'ring</h2>
          <div className="video-wrapper">
            <iframe width="560" height="315" src={`https://www.youtube.com/embed/${getVideoId(videoUrl)}`} title="YouTube video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionAnim} className="results" id="results">
        <div className="certificates">
          <div className="container">
            <h2 className="section-title" data-i18n="certificates.title">STUDENTLAR FIKRLARI</h2>
            <div className="student-testimonials-grid">
              {testimonials.length > 0 ? testimonials.slice(0, 3).map((test, i) => {
                const hasAvatar = !!test.avatar;
                const imgSrc = hasAvatar
                  ? getImageUrl(test.avatar)
                  : `images/students/${i + 1}.webp`;

                return (
                  <div className="student-testimonial-card" key={test.id || i}>
                    <div className="student-profile-img">
                      <img
                        src={imgSrc}
                        alt={t(test, "name")}
                        className="student-img"
                        data-student-img={hasAvatar ? undefined : i + 1}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="student-testimonial-content">
                      <p className="student-testimonial-text">{t(test, "text")}</p>
                      <h3 className="student-name">{t(test, "name")}</h3>
                      <p className="student-university">{t(test, "university")}</p>
                    </div>
                  </div>
                );
              }) : (
                <>
              <div className="student-testimonial-card">
                    <div className="student-profile-img"><img src="" alt="Student" className="student-img" data-student-img="1" loading="lazy" decoding="async" /></div>
                <div className="student-testimonial-content">
                      <p className="student-testimonial-text" data-i18n="certificates.students.student4.text">Hammaga salom. Men Muhammadali Sattorov...</p>
                      <h3 className="student-name" data-i18n="certificates.students.student4.name">Muhammadali Sattorov</h3>
                      <p className="student-university" data-i18n="certificates.students.student4.university">NJUPT University, China</p>
                </div>
              </div>
              <div className="student-testimonial-card">
                    <div className="student-profile-img"><img src="" alt="Student" className="student-img" data-student-img="2" loading="lazy" decoding="async" /></div>
                    <div className="student-testimonial-content">
                      <p className="student-testimonial-text" data-i18n="certificates.students.student5.text">Hello! My name is MUHAMMADALI...</p>
                      <h3 className="student-name" data-i18n="certificates.students.student5.name">Muhammadali Bakhtiyar</h3>
                      <p className="student-university" data-i18n="certificates.students.student5.university">Canadian University Dubai</p>
                </div>
                  </div>
                  <div className="student-testimonial-card">
                    <div className="student-profile-img"><img src="" alt="Student" className="student-img" data-student-img="3" loading="lazy" decoding="async" /></div>
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
      </motion.section>

      <motion.section {...sectionAnim} className="faq" id="faq">
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
      </motion.section>

      <motion.section {...sectionAnim} className="location" id="location">
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
      </motion.section>

  <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <img src="SVG/gorizontal logo oq.svg" alt="Buran Consulting" className="footer-logo-img" />
              </div>
              <p data-i18n="footer.tagline">Eng yaxshi universitetlar talabasi bo'ling</p>
            </div>
            <div className="footer-section">
              <h4 data-i18n="footer.pages">Sahifalar</h4>
              <ul>
                <li>
                  <a href="#about" data-i18n="nav.about">Biz haqimizda</a>
                </li>
                <li>
                  <a href="#programs" data-i18n="nav.programs">Bizning dasturlar</a>
                </li>
                <li>
                  <a href="#countries" data-i18n="nav.countries">Davlatlar</a>
                </li>
                <li>
                  <a href="#results" data-i18n="nav.results">Natijalar</a>
                </li>
                <li>
                  <a href="#faq" data-i18n="nav.faq">Savollar</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 data-i18n="footer.contact">Aloqa</h4>
              <p>
                <a href="tel:+998712000811">+998 71 200 08 11</a>
              </p>
              <p>
                <a href="mailto:info@buranconsulting.uz">
                  info@buranconsulting.uz
                </a>
              </p>
              <div className="footer-address">
                <p>
                  <strong data-i18n="location.address.title">MANZIL:</strong>{' '}
                  <span data-i18n="location.address.text">Toshkent shahri, Mirzo Ulug'bek t, 5-y proyezd Sayram 4A. Sayram bizness markazi, 7-etaj</span>
                </p>
                <p>
                  <strong>Ⓜ️</strong>{' '}
                  <span data-i18n="location.metro.text">Buyuk ipak yo'li Metro 5-6 daqiqa.</span>
                </p>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Buran Consulting. <span data-i18n="footer.copyright">Barcha huquqlar himoyalangan.</span></p>
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
              <div className="modal-header-logo"><img src="SVG/gorizontal logo qizil mark,qora type.svg" alt="Buran Consulting" className="modal-logo-img" loading="lazy" decoding="async" /></div>
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
