import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';

export function Location() {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="location animated" id="location">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('location.title') || "Bizning manzil"}
        </motion.h2>
        <div className="location-content">
          <motion.div 
            className="location-info"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="location-item" variants={itemVariants}>
              <div className="location-icon">📍</div>
              <div>
                <h4>{t('location.addressTitle') || "Manzil"}</h4>
                <p>
                  Toshkent shahri, Mirzo Ulug'bek tumani,
                  <br />
                  5-y proyezd Sayram 4A
                  <br />
                  Sayram biznes markazi, 7-etaj
                </p>
              </div>
            </motion.div>
            <motion.div className="location-item" variants={itemVariants}>
              <div className="location-icon">Ⓜ️</div>
              <div>
                <h4>{t('location.nearbyTitle') || "Yaqin atrofda"}</h4>
                <p>Buyuk ipak yo'li Metro - 5-6 daqiqa</p>
              </div>
            </motion.div>
            <motion.div className="location-item" variants={itemVariants}>
              <div className="location-icon">📞</div>
              <div>
                <h4>{t('location.phoneTitle') || "Telefon"}</h4>
                <p><a href="tel:+998712000811">+998 71 200 08 11</a></p>
              </div>
            </motion.div>
            <motion.div className="location-item" variants={itemVariants}>
              <div className="location-icon">✉️</div>
              <div>
                <h4>{t('location.emailTitle') || "Email"}</h4>
                <p><a href="mailto:info@buranconsulting.uz">info@buranconsulting.uz</a></p>
              </div>
            </motion.div>
          </motion.div>
          <motion.div 
            className="location-map"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.8636833799776!2d69.27876651536883!3d41.34106970925988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b534a68f5fd%3A0x8b3f5b3e5b3f5b3e!2sSayram%20Business%20Center!5e0!3m2!1sen!2s!4v1620000000000!5m2!1sen!2s"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Buran Consulting location"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Location;
