import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { countriesApi, getImageUrl } from '../../services/api';
import { EmptyState, LoadingState } from '../ui/EmptyState';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4 }
  }
};

function CountryCard({ country, language, getLocalized }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageError, setImageError] = useState(false);
  const name = getLocalized(country, 'name');

  useEffect(() => {
    const apiImage = country.imageUz || country.image;
    if (apiImage) {
      const src = apiImage.startsWith('/uploads') 
        ? getImageUrl(apiImage) 
        : apiImage;
      setImageSrc(src);
    }
  }, [country]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <motion.div 
      className="country-card"
      variants={itemVariants}
      whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
    >
      <div className="country-image-wrapper">
        {imageSrc && !imageError ? (
          <img 
            src={imageSrc} 
            alt={name} 
            className="country-img" 
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="country-placeholder">
            <span>🌍</span>
          </div>
        )}
      </div>
      <div className="country-overlay">
        <h4>{name}</h4>
      </div>
    </motion.div>
  );
}

export function Countries() {
  const { t, language, getLocalized } = useLanguage();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadCountries = async () => {
      setLoading(true);
      try {
        const data = await countriesApi.getAll();
        setCountries(data || []);
        setError(false);
      } catch (err) {
        setError(true);
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };
    loadCountries();
  }, []);

  return (
    <section className="countries animated" id="countries">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('countries.title')}
        </motion.h2>
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {t('countries.subtitle')}
        </motion.p>
        
        {loading ? (
          <LoadingState message="Davlatlar yuklanmoqda..." />
        ) : error || countries.length === 0 ? (
          <EmptyState message="Davlatlar ro'yxati bo'sh" icon="🌍" />
        ) : (
          <motion.div 
            className="countries-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {countries.map((country) => (
              <CountryCard 
                key={country.id} 
                country={country} 
                language={language}
                getLocalized={getLocalized}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default Countries;
