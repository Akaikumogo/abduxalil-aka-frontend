import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { featuresApi } from '../../services/api';
import { EmptyState, LoadingState } from '../ui/EmptyState';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export function WhyUs() {
  const { t, language, getLocalized } = useLanguage();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadFeatures = async () => {
      setLoading(true);
      try {
        const data = await featuresApi.getAll();
        setFeatures(data || []);
        setError(false);
      } catch (err) {
        setError(true);
        setFeatures([]);
      } finally {
        setLoading(false);
      }
    };
    loadFeatures();
  }, []);

  return (
    <section className="why-us animated" id="why-us">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {t('whyUs.title')}
        </motion.h2>
        
        {loading ? (
          <LoadingState message="Yuklanmoqda..." />
        ) : error || features.length === 0 ? (
          <EmptyState message="Ma'lumot yo'q" icon="✨" />
        ) : (
          <motion.div 
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div 
                key={feature.id} 
                className="feature-card"
                variants={itemVariants}
                whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{getLocalized(feature, 'title')}</h3>
                <p>{getLocalized(feature, 'description')}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default WhyUs;
