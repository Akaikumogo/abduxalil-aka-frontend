import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { programsApi, getImageUrl } from '../../services/api';
import { EmptyState, LoadingState } from '../ui/EmptyState';

function ProgramCard({ program, index, language, getLocalized, onConsultation }) {
  const isLeft = index % 2 === 1;
  const number = String(index + 1).padStart(2, '0');
  
  const title = getLocalized(program, 'title');
  const description1 = getLocalized(program, 'description1');
  const description2 = getLocalized(program, 'description2');
  const image = program.imageUz 
    ? (program.imageUz.startsWith('/uploads') ? getImageUrl(program.imageUz) : program.imageUz) 
    : `images/programs/language-prep.webp`;

  return (
    <motion.div 
      className={`program-item ${isLeft ? 'program-item-left' : 'program-item-right'}`}
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className="program-number">{number}</div>
      <div className="program-content">
        {isLeft && (
          <motion.div 
            className="program-image"
            whileHover={{ scale: 1.02 }}
          >
            <img src={image} alt={title} className="program-img" loading="lazy" />
          </motion.div>
        )}
        <div className="program-text">
          <h3 className="program-title">{title}</h3>
          <p>{description1}</p>
          {description2 && <p><strong>{description2}</strong></p>}
          <motion.button 
            className="btn-link" 
            onClick={onConsultation}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            {language === 'en' ? 'Learn More' : 'Batafsil'}
          </motion.button>
        </div>
        {!isLeft && (
          <motion.div 
            className="program-image"
            whileHover={{ scale: 1.02 }}
          >
            <img src={image} alt={title} className="program-img" loading="lazy" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function Programs() {
  const { t, language, getLocalized } = useLanguage();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadPrograms = async () => {
      setLoading(true);
      try {
        const data = await programsApi.getAll();
        setPrograms(data || []);
        setError(false);
      } catch (err) {
        setError(true);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };
    loadPrograms();
  }, []);

  const scrollToConsultation = () => {
    const section = document.getElementById('consultation-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="programs animated" id="programs">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('programs.title')}
        </motion.h2>
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {t('programs.subtitle')}
        </motion.p>

        {loading ? (
          <LoadingState message="Dasturlar yuklanmoqda..." />
        ) : error || programs.length === 0 ? (
          <EmptyState message="Dasturlar ma'lumotlari yo'q" icon="📚" />
        ) : (
          programs.map((program, index) => (
            <ProgramCard
              key={program.id}
              program={program}
              index={index}
              language={language}
              getLocalized={getLocalized}
              onConsultation={scrollToConsultation}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default Programs;
