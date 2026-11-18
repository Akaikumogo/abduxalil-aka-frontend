import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { testimonialsApi, getImageUrl } from '../../services/api';
import { EmptyState, LoadingState } from '../ui/EmptyState';

function TestimonialCard({ testimonial, language, getLocalized }) {
  const name = getLocalized(testimonial, 'name');
  const university = getLocalized(testimonial, 'university');
  const text = getLocalized(testimonial, 'text');
  const avatarSrc = testimonial.avatar?.startsWith('/uploads') 
    ? getImageUrl(testimonial.avatar) 
    : testimonial.avatar || 'images/testimonials/default-avatar.webp';

  return (
    <motion.div 
      className="testimonial-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      <div className="testimonial-header">
        <img src={avatarSrc} alt={name} className="testimonial-avatar" loading="lazy" />
        <div className="testimonial-info">
          <h4 className="testimonial-name">{name}</h4>
          <p className="testimonial-university">{university}</p>
        </div>
      </div>
      <p className="testimonial-text">{text}</p>
    </motion.div>
  );
}

export function Testimonials() {
  const { t, language, getLocalized } = useLanguage();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    const loadTestimonials = async () => {
      setLoading(true);
      try {
        const data = await testimonialsApi.getAll();
        setTestimonials(data || []);
        setError(false);
      } catch (err) {
        setError(true);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    loadTestimonials();
  }, []);

  const getVisibleCards = useCallback(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }, []);

  const [visibleCards, setVisibleCards] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(getVisibleCards());
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getVisibleCards]);

  const maxIndex = Math.max(0, testimonials.length - visibleCards);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // Auto-slide
  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [maxIndex, testimonials.length]);

  return (
    <section className="testimonials animated" id="results">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('testimonials.title')}
        </motion.h2>
        
        {loading ? (
          <LoadingState message="Fikrlar yuklanmoqda..." />
        ) : error || testimonials.length === 0 ? (
          <EmptyState message="Talabalar fikrlari yo'q" icon="💬" />
        ) : (
          <>
            <div className="testimonials-slider">
              <motion.button 
                className="slider-btn slider-prev" 
                onClick={prevSlide}
                disabled={currentIndex === 0}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ‹
              </motion.button>
              <div className="testimonials-track-wrapper">
                <motion.div 
                  className="testimonials-track" 
                  ref={sliderRef}
                  animate={{ x: `-${currentIndex * (100 / visibleCards)}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {testimonials.map((testimonial) => (
                    <div 
                      key={testimonial.id} 
                      className="testimonial-slide"
                      style={{ flex: `0 0 ${100 / visibleCards}%` }}
                    >
                      <TestimonialCard
                        testimonial={testimonial}
                        language={language}
                        getLocalized={getLocalized}
                      />
                    </div>
                  ))}
                </motion.div>
              </div>
              <motion.button 
                className="slider-btn slider-next" 
                onClick={nextSlide}
                disabled={currentIndex === maxIndex}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ›
              </motion.button>
            </div>
            <div className="testimonials-dots">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <motion.span
                  key={index}
                  className={`testimonial-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Testimonials;
