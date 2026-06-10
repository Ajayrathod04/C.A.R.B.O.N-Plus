import React, { createContext, useContext, useState, useEffect } from 'react';
import translations, { languages } from '../i18n/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  // Try to load language from localStorage or default to English
  const [currentLang, setCurrentLang] = useState(() => {
    const saved = localStorage.getItem('carbon_plus_lang');
    return saved && translations[saved] ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('carbon_plus_lang', currentLang);
  }, [currentLang]);

  // Translate function
  const t = (key) => {
    // Attempt language translation
    if (translations[currentLang] && translations[currentLang][key] !== undefined) {
      return translations[currentLang][key];
    }
    // Fallback to English
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    // Fallback to key name if missing entirely
    return key;
  };

  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setCurrentLang(langCode);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, languages, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
