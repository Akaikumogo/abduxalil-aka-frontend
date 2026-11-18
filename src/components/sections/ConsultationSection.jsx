import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { applicationsApi, sendToGoogleSheets } from '../../services/api';

export function ConsultationSection() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', country: '' });

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
    await applicationsApi.submit({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      country: formData.country.trim(),
      formType: 'consultation',
    });

    // Also send to Google Sheets as backup
    sendToGoogleSheets({
      timestamp: new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" }),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      country: formData.country.trim(),
      formType: 'Consultation Form',
    });

    alert("Rahmat! Sizning so'rovingiz qabul qilindi. Tez orada siz bilan bog'lanamiz.");
    setFormData({ name: '', phone: '', country: '' });
    setIsSubmitting(false);
  };

  return (
    <section className="consultation-section animated" id="consultation-section">
      <div className="container">
        <motion.div 
          className="consultation-wrapper"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="consultation-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {t('consultation.title')}
          </motion.h2>
          <motion.p 
            className="consultation-subtitle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {t('consultation.subtitle')}
          </motion.p>
          <motion.form 
            className="simple-consultation-form" 
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
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
              className="btn-consultation-red"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? "Yuborilmoqda..." : (t('consultation.submit') || "Konsultatsiya olish")}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}

export default ConsultationSection;
