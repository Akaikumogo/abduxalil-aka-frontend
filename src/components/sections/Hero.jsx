import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { heroApi, getImageUrl } from '../../services/api';

export function Hero({ onOpenModal }) {
  const { t, language } = useLanguage();
  const [heroImageSrc, setHeroImageSrc] = useState("");

  useEffect(() => {
    const loadHeroImage = async () => {
      try {
        const settings = await heroApi.getSettings();
        const imagePath = language === 'en' ? settings.imageEn : settings.imageUz;
        
        if (imagePath) {
          const fullUrl = getImageUrl(imagePath);
          setHeroImageSrc(fullUrl);
        } else {
          resolveLocalHeroImage();
        }
      } catch (error) {
        resolveLocalHeroImage();
      }
    };

    const resolveLocalHeroImage = () => {
      const candidates = [
        "images/hero/hero-students.webp",
        "images/hero/hero-students.jpg",
        "images/hero/hero.webp"
      ];

      const tryNext = (index) => {
        if (index >= candidates.length) return;
        const src = candidates[index];
        const img = new Image();
        img.onload = () => setHeroImageSrc(src);
        img.onerror = () => tryNext(index + 1);
        img.src = src;
      };

      tryNext(0);
    };

    loadHeroImage();
  }, [language]);

  return (
    <section className="hero animated">
      <div
        className="hero-background"
        style={
          heroImageSrc
            ? {
                backgroundImage: `linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%), url('${heroImageSrc}')`
              }
            : undefined
        }
      ></div>
      <div className="container">
        <div className="hero-content">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {t('hero.title')}
            </motion.h1>
            <motion.p 
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {t('hero.subtitle')}
            </motion.p>
            <motion.button 
              className="btn-hero-gradient" 
              onClick={onOpenModal}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(228, 47, 29, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              {t('hero.cta')}
            </motion.button>
          </motion.div>
          <motion.div 
            className="hero-students"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {heroImageSrc && (
              <img
                src={heroImageSrc}
                alt="Talabalar"
                className="hero-students-img"
                loading="eager"
              />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
