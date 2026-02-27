"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import uk from "@/locales/uk.json";
import pl from "@/locales/pl.json";
import {
  FaServer,
  FaCode,
  FaDatabase,
  FaTimes,
  FaAngleRight,
  FaChevronLeft,
  FaChevronRight,
  FaExpandArrowsAlt,
  FaMicrochip,
  FaMemory,
  FaDesktop,
  FaHeadset,
  FaSearchPlus,
  FaSearchMinus,
} from "react-icons/fa";
import "./About.scss";

const translations: any = { en, uk, pl };

const About = () => {
  const { lang } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const t = (path: string) => {
    const keys = path.split(".");
    let res = translations[lang];
    keys.forEach((k) => {
      if (res) res = res[k];
    });
    return res || path;
  };

  const galleryImages = [
    "/photo_5253467588765882365_w.jpg",
    "/setup/keyboard.jpg",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (
      isAutoPlaying &&
      isModalOpen &&
      !lightboxImage &&
      galleryImages.length > 1
    ) {
      interval = setInterval(() => {
        setCurrentSlide((prev) =>
          prev === galleryImages.length - 1 ? 0 : prev + 1,
        );
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, isModalOpen, lightboxImage, galleryImages.length]);

  const handleNav = (direction: "next" | "prev") => {
    setIsAutoPlaying(false);
    if (direction === "next") {
      setCurrentSlide((prev) =>
        prev === galleryImages.length - 1 ? 0 : prev + 1,
      );
    } else {
      setCurrentSlide((prev) =>
        prev === 0 ? galleryImages.length - 1 : prev - 1,
      );
    }
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Правильная блокировка скролла с очисткой
  useEffect(() => {
    if (isModalOpen || lightboxImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup: если компонент умирает, обязательно возвращаем скролл сайту
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen, lightboxImage]);

  // 👇 ТУТ ВИПРАВЛЕНО: Додано : Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  
  // 👇 ТУТ ВИПРАВЛЕНО: Додано : Variants та as const
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100 },
    },
  };

  return (
    <section className="about" id="about">
      <div className="ambient-glow center-left"></div>

      <div className="container">
        <motion.div
          className="about__header"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="section-title">
            <span className="accent-number">01.</span> SYSTEM_LOG //{" "}
            <span className="glow-text">ABOUT_ME</span>
          </h2>
          <div className="header-line"></div>
        </motion.div>

        <motion.div
          className="bento-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="bento-card card-bio" variants={itemVariants}>
            <div className="card-glare"></div>
            <h3 className="bento-title">{t("about.title_1")}</h3>
            <p className="bento-text">{t("about.bio")}</p>
            <div className="status-indicator">
              <span className="dot"></span>
              <span className="status-label">{t("about.status")}</span>
            </div>
          </motion.div>

          <motion.div className="bento-card card-stack" variants={itemVariants}>
            <h3 className="bento-title">{t("about.title_2")}</h3>
            <div className="stack-modules">
              <div className="module">
                <FaCode className="module-icon" />
                <span>React / Next.js / TS</span>
              </div>
              <div className="module">
                <FaServer className="module-icon" />
                <span>Node.js / Express</span>
              </div>
              <div className="module">
                <FaDatabase className="module-icon" />
                <span>MongoDB</span>
              </div>
            </div>
          </motion.div>

          {/* КАРТОЧКА 3 - ТЕПЕРЬ С ОТСТУПАМИ ИЗ SCSS */}
          <motion.div className="bento-card card-edu" variants={itemVariants}>
            <h3 className="bento-title">{t("about.title_3")}</h3>
            <ul className="edu-list">
              <li>
                <span className="key">{t("about.edu_academy")}</span>
                <span className="val">{t("about.edu_academy_val")}</span>
              </li>
              <li>
                <span className="key">{t("about.edu_practice")}</span>
                <span className="val">{t("about.edu_practice_val")}</span>
              </li>
              <li>
                <span className="key">{t("about.edu_langs")}</span>
                <span className="val">{t("about.edu_langs_val")}</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            className="bento-card card-workspace"
            variants={itemVariants}
          >
            <Image
              src={galleryImages[0]}
              alt="Setup"
              fill
              className="workspace-bg"
            />
            <div className="workspace-overlay"></div>
            <div className="workspace-content">
              <h3 className="bento-title">{t("about.title_4")}</h3>
              <div className="workspace-tags">
                <span className="tag">Intel Core Ultra 5</span>
                <span className="tag">RTX 4060</span>
              </div>
              <button
                className="btn-details"
                onClick={() => setIsModalOpen(true)}
              >
                {t("about.btn_details")} <FaAngleRight />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="setup-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="setup-modal-content"
              initial={{ y: 50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 className="modal-title">{t("about.modal_title")}</h3>
                <button
                  className="close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  <FaTimes /> {t("about.modal_close")}
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-visuals">
                  <div
                    className="slider-container"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="slide-image-wrapper"
                      >
                        <Image
                          src={galleryImages[currentSlide]}
                          alt="Setup"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="slide-img"
                        />
                      </motion.div>
                    </AnimatePresence>

                    {galleryImages.length > 1 && (
                      <>
                        <button
                          className="slider-btn prev"
                          onClick={() => handleNav("prev")}
                        >
                          <FaChevronLeft />
                        </button>
                        <button
                          className="slider-btn next"
                          onClick={() => handleNav("next")}
                        >
                          <FaChevronRight />
                        </button>
                        <div className="slider-dots">
                          {galleryImages.map((_, idx) => (
                            <span
                              key={idx}
                              className={`dot ${idx === currentSlide ? "active" : ""}`}
                              onClick={() => {
                                setCurrentSlide(idx);
                                setIsAutoPlaying(false);
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    <button
                      className="expand-btn"
                      onClick={() => {
                        setLightboxImage(galleryImages[currentSlide]);
                        setIsZoomed(false);
                      }}
                    >
                      <FaExpandArrowsAlt /> {t("about.modal_fullscreen")}
                    </button>
                  </div>

                  {/* ТЕЛЕМЕТРИЯ */}
                  <div className="live-telemetry">
                    <h4 className="telemetry-title">
                      <span className="blink-dot"></span>{" "}
                      {t("about.telemetry_title")}
                    </h4>
                    <div className="telemetry-grid">
                      <div className="t-item">
                        <span className="t-label">CPU_TEMP</span>
                        <span className="t-val">38°C</span>
                      </div>
                      <div className="t-item">
                        <span className="t-label">GPU_TEMP</span>
                        <span className="t-val">34°C</span>
                      </div>
                      <div className="t-item">
                        <span className="t-label">FANS_RPM</span>
                        <span className="t-val">1150</span>
                      </div>
                      <div className="t-item">
                        <span className="t-label">NET_PING</span>
                        <span className="t-val">12ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="spec-card">
                    <div className="spec-header">
                      <FaHeadset /> <span>{t("about.spec_periph")}</span>
                    </div>
                    <div className="spec-item">
                      <strong>CASE</strong> MSI MAG Pano M100R PZ
                    </div>
                    <div className="spec-item">
                      <strong>BOARD</strong> AULA F75 Mechanical
                    </div>
                    <div className="spec-item">
                      <strong>MOUSE</strong> Bloody W60 Max Black
                    </div>
                    <div className="spec-item">
                      <strong>AUDIO</strong> HyperX Cloud III / Defender SPK-240
                    </div>
                    <div className="spec-item">
                      <strong>DESK</strong> {t("about.hw_desk")}
                    </div>
                  </div>
                </div>

                <div className="modal-specs-clean">
                  <div className="setup-philosophy">
                    <h4>{t("about.phil_title")}</h4>
                    <p>{t("about.phil_text")}</p>
                  </div>

                  <div className="spec-card">
                    <div className="spec-header">
                      <FaMicrochip /> <span>{t("about.spec_power")}</span>
                    </div>
                    <div className="spec-item">
                      <strong>CPU</strong> Intel Core Ultra 5 245KF (
                      {t("about.hw_cores")})
                    </div>
                    <div className="spec-item">
                      <strong>GPU</strong> MSI GeForce RTX 4060 8GB GDDR6
                    </div>
                    <div className="spec-item">
                      <strong>MOBO</strong> MSI Z890 GAMING PLUS WIFI
                    </div>
                  </div>

                  <div className="spec-card">
                    <div className="spec-header">
                      <FaMemory /> <span>{t("about.spec_memory")}</span>
                    </div>
                    <div className="spec-item">
                      <strong>RAM</strong> {t("about.hw_ram")}
                    </div>
                    <div className="spec-item">
                      <strong>OS</strong> Windows 11 Home (64-bit)
                    </div>
                  </div>

                  <div className="spec-card">
                    <div className="spec-header">
                      <FaDesktop /> <span>{t("about.spec_displays")}</span>
                    </div>
                    <div className="spec-item spec-item--detailed">
                      <strong>MAIN (GAMING)</strong> <span>AOC G2 Q27G2S</span>
                      <span className="sub-text">
                        27" 2K QHD IPS • 165Hz • 1ms • G-Sync
                      </span>
                    </div>
                    <div className="spec-item spec-item--detailed">
                      <strong>SEC (WORK)</strong>{" "}
                      <span>Lenovo Legion 27q-10</span>
                      <span className="sub-text">
                        27" 2K QHD IPS • 165Hz • 1ms
                      </span>
                    </div>
                    <div className="spec-item spec-item--detailed">
                      <strong>DASHBOARD</strong>{" "}
                      <span>Lenovo Xiaoxin Pad Pro 12.7</span>
                      <span className="sub-text">
                        144Hz • 256GB • MediaTek Dimensity 8300
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              className={`lightbox-content ${isZoomed ? "zoomed" : ""}`}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
            >
              <button
                className="lightbox-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImage(null);
                }}
              >
                <FaTimes /> {t("about.lightbox_close")}
              </button>
              <div className="lightbox-hint">
                {isZoomed ? (
                  <>
                    <FaSearchMinus /> {t("about.lightbox_zoom_out")}
                  </>
                ) : (
                  <>
                    <FaSearchPlus /> {t("about.lightbox_zoom_in")}
                  </>
                )}
              </div>
              <Image
                src={lightboxImage}
                alt="Setup Fullscreen"
                fill
                sizes="100vw"
                className="lightbox-img"
                quality={100}
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default About;