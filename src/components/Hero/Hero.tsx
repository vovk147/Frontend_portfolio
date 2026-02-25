"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import uk from "@/locales/uk.json";
import pl from "@/locales/pl.json";
import { FaGithub, FaTelegramPlane, FaLinkedinIn, FaDiscord, FaInstagram } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import "./Hero.scss";

const translations: any = { en, uk, pl };

const Hero = () => {
  // ==========================================
  // ВОТ ЭТА ФУНКЦИЯ ПОТЕРЯЛАСЬ, ВЕРНУЛ ЕЁ НА МЕСТО:
  // ==========================================
  const { lang } = useLanguage();
  const t = (path: string) => {
    const keys = path.split('.');
    let res = translations[lang];
    keys.forEach(k => { if (res) res = res[k]; });
    return res || path;
  };

  // Твои реальные ссылки на соцсети
  const socialLinks = [
    { id: 'github', icon: FaGithub, url: 'https://github.com/vovk147', label: 'GitHub' },
    { id: 'telegram', icon: FaTelegramPlane, url: 'https://t.me/vovk147', label: 'Telegram' },
    { id: 'discord', icon: FaDiscord, url: 'https://discord.com/users/1060982121092612197/', label: 'Discord' },
    { id: 'instagram', icon: FaInstagram, url: 'https://www.instagram.com/vovk1471/', label: 'Instagram' },
    { id: 'linkedin', icon: FaLinkedinIn, url: '#', label: 'LinkedIn' }, 
    { id: 'email', icon: MdEmail, url: 'mailto:vovk.zheka1@outlook.com', label: 'Email' },
  ];

  // ==========================================
  // ЛОГИКА СПИДОМЕТРА
  // ==========================================
  const totalTicks = 64; 
  const maxSpeed = 320;
  const startAngle = -135; 
  const totalAngleSpan = 270; 

  const getAngle = (speed: number) => startAngle + (speed / maxSpeed) * totalAngleSpan;

  const showNumberAt = [0, 10, 20, 30, 40, 50, 60, 70, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320];
  const redZoneStart = 280;

  const gaugeElements = Array.from({ length: totalTicks + 1 }, (_, i) => {
    const currentSpeed = i * 5;
    const angle = getAngle(currentSpeed);
    return { speed: currentSpeed, angle, isNumber: showNumberAt.includes(currentSpeed), isMajor: currentSpeed % 10 === 0, isRedZone: currentSpeed >= redZoneStart };
  });

  // ==========================================
  // 3D ПАРАЛЛАКС ФИЗИКА
  // ==========================================
  const gaugeRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 120 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 120 });
  
  const rotateX = useTransform(smoothY, [-200, 200], [20, -20]); 
  const rotateY = useTransform(smoothX, [-200, 200], [-20, 20]);
  const glareX = useTransform(smoothX, [-200, 200], [40, -40]);
  const glareY = useTransform(smoothY, [-200, 200], [40, -40]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gaugeRef.current) return;
    const rect = gaugeRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const charVariants = { hidden: { opacity: 0, display: "none" }, visible: { opacity: 1, display: "inline-block" } };

  return (
    <section className="hero">
      <div className="ambient-glow center"></div>
      <div className="hero__carbon-overlay" />

      <div className="hero__container container">
        <div className="hero__grid">
          
          {/* БЛОК ВИЗУАЛА (СПИДОМЕТР) */}
          <div className="hero__visual" ref={gaugeRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <motion.div 
              className="rs-gauge" 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              style={{ rotateX, rotateY, perspective: 1200, transformStyle: "preserve-3d" }}
            >
              <div className="rs-gauge__body">
                
                <div className="deco-ring deco-ring-1" style={{ transform: "translateZ(10px)" }}></div>
                <div className="deco-ring deco-ring-2" style={{ transform: "translateZ(20px)" }}></div>
                
                <div className="tech-labels" style={{ transform: "translateZ(20px)" }}>
                  <span className="label-boost">BOOST: MAX</span>
                  <span className="label-temp">OIL: 90°C</span>
                  <span className="label-sys">SYS: OK</span>
                </div>
                
                <div className="rs-gauge__ticks" style={{ transform: "translateZ(30px)" }}>
                  {gaugeElements.map((el) => (
                    <div key={`tick-${el.speed}`} className={`tick ${el.isMajor ? 'tick--major' : 'tick--minor'} ${el.isRedZone ? 'tick--red' : ''}`} style={{ '--angle': `${el.angle}deg` } as React.CSSProperties} />
                  ))}
                </div>
                
                <div className="rs-gauge__numbers" style={{ transform: "translateZ(40px)" }}>
                  {gaugeElements.filter(el => el.isNumber).map((el) => (
                    <span key={`num-${el.speed}`} className={`num ${el.isRedZone ? 'num--red' : ''}`} style={{ '--angle': `${el.angle}deg` } as React.CSSProperties}>{el.speed}</span>
                  ))}
                  <span className="kmh-label">km/h</span>
                </div>
                
                <div className="rs-gauge__needle-wrapper" style={{ transform: "translate(-50%, -50%) translateZ(45px)" }}>
                  <motion.div 
                    className="rs-gauge__needle-rotator" 
                    initial={{ rotate: getAngle(0) }} 
                    animate={{ rotate: [getAngle(0), getAngle(320), getAngle(0)] }} 
                    transition={{ duration: 1.8, ease: "easeInOut", delay: 0.3 }}
                  >
                    <div className="needle-shadow"></div>
                    <div className="needle-glow"></div>
                    <div className="needle-body"></div>
                  </motion.div>
                </div>
                
                <div className="rs-gauge__center-wrap" style={{ transform: "translateZ(60px)" }}>
                  <Image 
                    src="/photo_5253467588765882365_w.jpg" 
                    alt="Profile" 
                    fill 
                    sizes="(max-width: 768px) 150px, 250px" 
                    quality={100} 
                    priority 
                    className="profile-img" 
                  />
                  <div className="center-bezel"></div>
                </div>

                <div className="rs-gauge__glass" style={{ transform: "translateZ(90px)" }}>
                  <motion.div className="dynamic-glare" style={{ x: glareX, y: glareY }} />
                </div>

              </div>
            </motion.div>
          </div>

          {/* БЛОК ТЕКСТА И КНОПОК */}
          <div className="hero__main-content">
            <motion.div className="hero__status" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <span className="rs-badge">RS6</span>
              <span className="status-text">
                {"STAGE_3 // MTM_EDITION_".split("").map((char, index) => (
                  <motion.span key={index} variants={charVariants}>{char}</motion.span>
                ))}
              </span>
            </motion.div>

            <motion.h1 className="hero__title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              FULLSTACK <br /><span className="glow-text">ENGINEER</span>
            </motion.h1>

            <motion.div className="hero__bio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <ul className="sys-specs">
                <li>
                  <span className="spec-key">{t('hero.specs.location_label')}</span> 
                  <span className="spec-val">{t('hero.specs.location_value')}</span>
                </li>
                <li>
                  <span className="spec-key">{t('hero.specs.stack_label')}</span> 
                  <span className="spec-val">{t('hero.specs.stack_value')}</span>
                </li>
                <li>
                  <span className="spec-key">{t('hero.specs.training_label')}</span> 
                  <span className="spec-val">{t('hero.specs.training_value')}</span>
                </li>
                <li>
                  <span className="spec-key">{t('hero.specs.languages_label')}</span> 
                  <span className="spec-val">{t('hero.specs.languages_value')}</span>
                </li>
              </ul>
            </motion.div>

            <motion.div className="hero__socials" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div className="socials-grid">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                      <Icon size={22} />
                      <span className="social-tooltip">{link.label}</span>
                    </a>
                  );
                })}
              </div>
            </motion.div>

            {/* КНОПКИ ДЕЙСТВИЯ */}
            <motion.div className="hero__actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <a href="#projects" className="btn-primary">
                <span className="btn-text">{t('hero.actions.primary')}</span>
                <div className="btn-glare"></div>
              </a>
              <a href="#contact" className="btn-glass">
                <span className="btn-text">{t('hero.actions.secondary')}</span>
              </a>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;