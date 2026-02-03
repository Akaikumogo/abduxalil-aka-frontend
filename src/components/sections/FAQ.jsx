import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { faqApi } from '../../services/api';
import { EmptyState, LoadingState } from '../ui/EmptyState';

function FAQItem({ faq, isOpen, onToggle, language, getLocalized }) {
  const question = getLocalized(faq, 'question');
  const answer = getLocalized(faq, 'answer');

  return (
    <motion.div 
      className={`faq-item ${isOpen ? 'active' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <motion.button 
        className="faq-question" 
        onClick={onToggle}
        whileHover={{ backgroundColor: 'rgba(228, 47, 29, 0.02)' }}
      >
        <span>{question}</span>
        <motion.span 
          className="faq-icon"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          +
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  const { t, language, getLocalized } = useLanguage();
  const [faqs, setFaqs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [faqData, settingsData] = await Promise.all([
          faqApi.getAll(),
          faqApi.getSettings(),
        ]);
        
        setFaqs(faqData || []);
        setSettings(settingsData);
        setError(false);
      } catch (err) {
        setError(true);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  const title = settings 
    ? (language === 'en' ? settings.titleEn : settings.titleUz)
    : t('faq.title');
    
  const subtitle = settings
    ? (language === 'en' ? settings.subtitleEn : settings.subtitleUz)
    : t('faq.subtitle');

  return (
    <section className="faq animated" id="faq">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {title || "Ko'p so'raladigan savollar"}
        </motion.h2>
        {subtitle && (
          <motion.p 
            className="section-subtitle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {subtitle}
          </motion.p>
        )}
        
        {loading ? (
          <LoadingState message="Savollar yuklanmoqda..." />
        ) : error || faqs.length === 0 ? (
          <EmptyState message="Savollar yo'q" icon="❓" />
        ) : (
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
                language={language}
                getLocalized={getLocalized}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FAQ;
