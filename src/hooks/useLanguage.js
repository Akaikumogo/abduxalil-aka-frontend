import { useState, useEffect, useCallback } from 'react';
import { translations } from '../translations.js';

export function useLanguage() {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("selectedLanguage") || "uz";
  });

  const setLanguage = useCallback((lang) => {
    localStorage.setItem("selectedLanguage", lang);
    document.documentElement.lang = lang;
    setLanguageState(lang);
  }, []);

  const t = useCallback((key) => {
    if (!translations || !translations[language]) return key;
    
    const keys = key.split(".");
    let value = translations[language];
    
    for (let i = 0; i < keys.length; i++) {
      if (value && typeof value === "object" && keys[i] in value) {
        value = value[keys[i]];
      } else {
        return key;
      }
    }
    
    return value;
  }, [language]);

  // Get localized content from API data
  const getLocalized = useCallback((item, field) => {
    if (!item) return '';
    const localizedField = `${field}${language === 'en' ? 'En' : 'Uz'}`;
    return item[localizedField] || item[field] || '';
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return {
    language,
    setLanguage,
    t,
    getLocalized,
    isUz: language === 'uz',
    isEn: language === 'en',
  };
}

export default useLanguage;
