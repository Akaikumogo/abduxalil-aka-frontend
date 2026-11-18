import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { statsApi } from '../../services/api';
import { EmptyState, LoadingState } from '../ui/EmptyState';

function StatCard({ stat, index, language }) {
  const cardRef = useRef(null);
  const [animated, setAnimated] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  const description = language === 'en' ? stat.descriptionEn : stat.descriptionUz;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated) {
          setAnimated(true);
          animateValue(0, stat.value, 2500);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [stat.value, animated]);

  const animateValue = (start, end, duration) => {
    let startTimestamp = null;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOutCubic * (end - start) + start);
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  };

  const formatNumber = () => {
    let formatted = '';
    if (stat.prefix) formatted += stat.prefix;
    formatted += displayValue.toLocaleString();
    if (stat.suffix) formatted += ' ' + stat.suffix;
    return formatted;
  };

  return (
    <motion.div 
      className="stat-card"
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <h2 className="stat-number">
        <span className="stat-number-value">{formatNumber()}</span>
      </h2>
      <div className="stat-line"></div>
      <p className="stat-text">{description}</p>
    </motion.div>
  );
}

export function Statistics() {
  const { language } = useLanguage();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const data = await statsApi.getAll();
        setStats(data || []);
        setError(false);
      } catch (err) {
        setError(true);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <section className="statistics animated" id="statistics">
      <div className="container">
        {loading ? (
          <LoadingState message="Statistika yuklanmoqda..." />
        ) : error || stats.length === 0 ? (
          <EmptyState message="Statistika ma'lumotlari yo'q" icon="📊" />
        ) : (
          <motion.div 
            className="stats-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {stats.map((stat, index) => (
              <StatCard key={stat.id} stat={stat} index={index} language={language} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default Statistics;
