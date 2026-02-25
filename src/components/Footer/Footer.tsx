"use client";
import React from "react";
import { ArrowUp, Github, Linkedin, Mail, Code2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import uk from "@/locales/uk.json";
import pl from "@/locales/pl.json";
import "./Footer.scss";

const translations: any = { en, uk, pl };

const Footer = () => {
  const { lang } = useLanguage();
  const t = (path: string) => {
    const keys = path.split(".");
    let res = translations[lang];
    keys.forEach((k) => { if (res) res = res[k]; });
    return res || path;
  };

  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="glass-footer">
      <div className="footer-glow"></div>
      
      <div className="container">
        <div className="footer-grid">
          
          {/* КОЛОНКА 1: БРЕНД И СТАТУС */}
          <div className="footer-brand">
            <h2 className="footer-logo">
              <Code2 className="logo-icon" />
              SYSTEM_LOG //
            </h2>
            <p className="footer-desc">
              Building high-performance digital experiences. 
            </p>
            <div className="terminal-status">
              <span className="prompt">{'>_'}</span> 
              <span className="status-text">{t('footer.system_status')}</span>
              <span className="cursor"></span>
            </div>
          </div>

          {/* КОЛОНКА 2: НАВИГАЦИЯ */}
          <div className="footer-nav">
            <h3 className="column-title">{t('footer.nav_title')}</h3>
            <ul className="nav-list">
              <li><a href="#home">{t('footer.link_home')}</a></li>
              <li><a href="#about">{t('footer.link_about')}</a></li>
              <li><a href="#skills">{t('footer.link_skills')}</a></li>
              <li><a href="#projects">{t('footer.link_projects')}</a></li>
              <li><a href="#contact">{t('footer.link_contact')}</a></li>
            </ul>
          </div>

          {/* КОЛОНКА 3: СЕТЬ И СОЦСЕТИ (С ТУЛТИПАМИ!) */}
          <div className="footer-social">
            <h3 className="column-title">{t('footer.social_title')}</h3>
            <div className="social-links">
              <a href="#" target="_blank" rel="noreferrer" className="social-btn" data-tooltip="GitHub">
                <Github size={20} />
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="social-btn" data-tooltip="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="mailto:vovk.zheka1@outlook.com" className="social-btn" data-tooltip="Outlook">
                <Mail size={20} />
              </a>
            </div>
            
            <button onClick={scrollToTop} className="back-to-top">
              <span>{t('footer.back_to_top')}</span>
              <ArrowUp size={16} className="arrow-icon" />
            </button>
          </div>

        </div>

        {/* НИЖНЯЯ ПАНЕЛЬ С КОПИРАЙТОМ */}
        <div className="footer-bottom">
          <div className="copyright">
            © {currentYear} Yevhen Vovk. {t('footer.rights')}
          </div>
          <div className="tech-stack">
            {t('footer.built_with')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;