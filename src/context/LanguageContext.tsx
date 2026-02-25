'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type Lang = 'en' | 'uk' | 'pl';
const LanguageContext = createContext<any>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // Встановлюємо англійську як стартову
  const [lang, setLang] = useState<Lang>('en');

  const setLanguage = (newLang: Lang) => {
    if (newLang === lang) return;
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pref-lang', newLang);
    }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('pref-lang') as Lang;
    // Якщо в браузері збережена інша мова, ми її підтягнемо, 
    // але перший в житті захід буде на EN
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);