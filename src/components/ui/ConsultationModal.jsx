import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { applicationsApi, sendToGoogleSheets } from '../../services/api';

export function ConsultationModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', country: '' });

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Iltimos, ism va telefon raqamini to'ldiring!");
      return;
    }

    setIsSubmitting(true);

    // Send to backend
    const result = await applicationsApi.submit({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      country: formData.country.trim(),
      formType: 'modal',
    });

    // Also send to Google Sheets as backup
    sendToGoogleSheets({
      timestamp: new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' }),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      country: formData.country.trim(),
      formType: 'Modal Form',
    });

    alert("Rahmat! Sizning so'rovingiz qabul qilindi. Tez orada siz bilan bog'lanamiz.");
    setFormData({ name: '', phone: '', country: '' });
    setIsSubmitting(false);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="consultation-modal active" 
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button className="modal-close" onClick={onClose} aria-label="Yopish">
              <span>&times;</span>
            </button>

            {/* Header Banner */}
            <div className="modal-header-banner">
              <div className="modal-header-content">
                <div className="modal-header-text">
                  <h3 className="modal-banner-title">KONSULTATSIYA</h3>
                  <h4 className="modal-banner-subtitle">CHET ELDA TA'LIM</h4>
                </div>
                <div className="modal-header-logo">
                  <img
                    src="SVG/gorizontal logo qizil mark,qora type.svg"
                    alt="Buran Consulting"
                    className="modal-logo-img"
                  />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="modal-body">
              <h2 className="modal-title">
                {t('consultation.title') || "BEPUL KONSULTATSIYA OLING"}
              </h2>
              <p className="modal-subtitle">
                {t('consultation.subtitle') || "Buning uchun quyidagi formani to'ldiring"}
              </p>
              
              <form className="modal-consultation-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('consultation.namePlaceholder') || "Ismingiz"}
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('consultation.phonePlaceholder') || "Tel raqam"}
                    required
                  />
                </div>
                <div className="form-row">
                  <select 
                    name="country" 
                    className="form-select" 
                    value={formData.country}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('consultation.countryDefault') || "Qaysi davlatda o'qishni xohlaysiz?"}</option>
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
                <motion.button 
                  type="submit" 
                  className="btn-consultation-black"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? "Yuborilmoqda..." : (t('consultation.submit') || "Konsultatsiya olish")}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConsultationModal;
