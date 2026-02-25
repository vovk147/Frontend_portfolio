"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { RiMoonClearFill, RiSunFill, RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import Link from 'next/link'; // ИМПОРТИРУЕМ LINK ИЗ NEXT
import { usePathname, useRouter } from 'next/navigation'; // ХУКИ ДЛЯ УМНОЙ НАВИГАЦИИ
import en from '@/locales/en.json';
import uk from '@/locales/uk.json';
import pl from '@/locales/pl.json';
import './Header.scss';

const translations: any = { en, uk, pl };

const Header = () => {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // ПОДКЛЮЧАЕМ РОУТЕР
  const pathname = usePathname();
  const router = useRouter();

  const t = (path: string) => {
    const keys = path.split('.');
    let res = translations[lang];
    keys.forEach(k => { if (res) res = res[k]; });
    return res || path;
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const menuItems = [
    { id: '01', key: 'about', href: '#about' },
    { id: '02', key: 'skills', href: '#skills' },
    { id: '03', key: 'projects', href: '#projects' },
    { id: '04', key: 'contact', href: '#contact' }
  ];

  const LangSwitcher = () => (
    <div className="lang-switcher">
      {['uk', 'en', 'pl'].map((l) => (
        <button 
          key={l} 
          type="button"
          onClick={(e) => { e.preventDefault(); setLang(l as any); }} 
          className={`lang-btn ${lang === l ? 'active' : ''}`}
        >
          <span className="lang-text">{l.toUpperCase()}</span>
          {lang === l && (
            <motion.div 
              layoutId="activePill"
              className="active-bg"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );

  // ФУНКЦИЯ ДЛЯ ЛОГОТИПА
  const handleLogoClick = () => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/'); // Если не на главной - просто кидаем на главную наверх
    }
  };

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__container">
        
        {/* ЛОГОТИП С УМНЫМ КЛИКОМ */}
        <div className="logo" onClick={handleLogoClick}>
          <span className="logo__main">VOVK</span>
          <span className="logo__divider">//</span>
          <span className="logo__sub">DEV</span>
        </div>

        <nav className="nav-desktop">
          {menuItems.map((item) => {
            // УМНАЯ ССЫЛКА: Если мы на главной, то "#about", если в архиве - "/#about"
            const destination = pathname === '/' ? item.href : `/${item.href}`;
            return (
              <Link key={item.id} href={destination} className="nav-link">
                <span className="nav-link__id">{item.id}</span>
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="actions">
          <div className="desktop-langs">
            <LangSwitcher />
          </div>

          <button className="theme-toggle" type="button" onClick={() => {
            const next = !isDark;
            setIsDark(next);
            document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
          }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={isDark ? 'moon' : 'sun'}
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? <RiMoonClearFill /> : <RiSunFill />}
              </motion.div>
            </AnimatePresence>
          </button>

          <button className="burger-btn" type="button" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <RiCloseLine /> : <RiMenu3Line />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="mobile-menu__content">
              <nav className="mobile-nav">
                {menuItems.map((item, idx) => {
                  const destination = pathname === '/' ? item.href : `/${item.href}`;
                  return (
                    /* Используем passHref и legacyBehavior, чтобы motion.a работал внутри Link */
                    <Link key={item.id} href={destination} passHref legacyBehavior>
                      <motion.a 
                        onClick={() => setIsOpen(false)}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                      >
                        <span className="id">{item.id}</span>
                        <span className="text">{t(`nav.${item.key}`)}</span>
                      </motion.a>
                    </Link>
                  );
                })}
              </nav>
              <div className="mobile-footer">
                <p className="footer-label">SELECT LANGUAGE</p>
                <LangSwitcher />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;