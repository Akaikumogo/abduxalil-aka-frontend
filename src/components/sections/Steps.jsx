import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { stepsApi } from '../../services/api';
import { EmptyState, LoadingState } from '../ui/EmptyState';

function StepCard({ step, index, isActive, language, getLocalized }) {
  const title = getLocalized(step, 'title');
  const description = getLocalized(step, 'description');

  return (
    <motion.div 
      className={`step ${isActive ? 'active' : ''}`}
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <motion.div 
        className="step-number"
        animate={{ 
          scale: isActive ? 1.1 : 1,
          backgroundColor: isActive ? 'var(--brand-red)' : '#e5e7eb'
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </motion.div>
      <div className="step-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </motion.div>
  );
}

export function Steps() {
  const { t, language, getLocalized } = useLanguage();
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const loadSteps = async () => {
      setLoading(true);
      try {
        const data = await stepsApi.getAll();
        if (data && data.length > 0) {
          const sorted = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
          setSteps(sorted);
        } else {
          setSteps([]);
        }
        setError(false);
      } catch (err) {
        setError(true);
        setSteps([]);
      } finally {
        setLoading(false);
      }
    };
    loadSteps();
  }, []);

  useEffect(() => {
    if (steps.length === 0) return;
    
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const stepElements = sectionRef.current.querySelectorAll('.step');
      const viewportMiddle = window.innerHeight / 2;
      
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      stepElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const elementMiddle = rect.top + rect.height / 2;
        const distance = Math.abs(viewportMiddle - elementMiddle);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      
      setActiveStep(closestIndex);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [steps.length]);

  return (
    <section className="how-it-works animated" id="how-it-works" ref={sectionRef}>
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('howItWorks.title')}
        </motion.h2>
        
        {loading ? (
          <LoadingState message="Qadamlar yuklanmoqda..." />
        ) : error || steps.length === 0 ? (
          <EmptyState message="Qadamlar ma'lumotlari yo'q" icon="📋" />
        ) : (
          <div className="steps-container">
            <div className="timeline-line">
              <motion.div 
                className="timeline-progress" 
                animate={{ height: `${((activeStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="steps-content">
              {steps.map((step, index) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={index}
                  isActive={index <= activeStep}
                  language={language}
                  getLocalized={getLocalized}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Steps;
