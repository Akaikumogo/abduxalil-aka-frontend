import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';

export function About() {
  const { t } = useLanguage();
  const sliderRef = useRef(null);
  const [images, setImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const findAvailableImages = async () => {
      const foundImages = [];
      const imageFormats = ["jpg", "jpeg", "png", "webp"];
      
      for (let i = 1; i <= 10; i++) {
        for (const format of imageFormats) {
          const imagePath = `images/about/${i}.${format}`;
          try {
            const img = new Image();
            const exists = await new Promise((resolve) => {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
              img.src = imagePath;
            });
            if (exists) {
              foundImages.push({ index: i - 1, path: imagePath });
              break;
            }
          } catch {
            continue;
          }
        }
      }
      
      setImages(foundImages.sort((a, b) => a.index - b.index));
    };

    findAvailableImages();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);

  return (
    <section className="about animated" id="about">
      <div className="container">
        <div className="about-content">
          <motion.div 
            className="about-text"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>{t('about.title')}</h2>
            <p>{t('about.text1')}</p>
            <p>{t('about.text2')}</p>
            <motion.a 
              href="#consultation-section" 
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('about.more')}
            </motion.a>
          </motion.div>
          <motion.div 
            className="about-image"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="about-slider" ref={sliderRef}>
              <div className="about-slider-container">
                <AnimatePresence mode="wait">
                  {images.length > 0 ? (
                    <motion.div
                      key={currentSlide}
                      className="about-slide active"
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img src={images[currentSlide]?.path} alt={`Buran Consulting ${currentSlide + 1}`} className="about-img" />
                    </motion.div>
                  ) : (
                    <div className="about-slide active">
                      <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                        <p>Rasmlar yuklanmoqda...</p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
              <div className="about-slider-dots">
                {images.map((_, index) => (
                  <motion.span
                    key={index}
                    className={`about-dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  />
                ))}
              </div>
              <div className="about-slider-nav">
                <motion.button 
                  className="about-slider-prev" 
                  onClick={prevSlide} 
                  aria-label="Previous slide"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ‹
                </motion.button>
                <motion.button 
                  className="about-slider-next" 
                  onClick={nextSlide} 
                  aria-label="Next slide"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ›
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default About;
