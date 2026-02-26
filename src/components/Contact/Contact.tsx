"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MapPin, Activity, CheckCircle, AlertTriangle, Github, Linkedin, Mail, Phone } from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import uk from "@/locales/uk.json";
import pl from "@/locales/pl.json";
import "./Contact.scss";

const translations: any = { en, uk, pl };

const Contact = () => {
  const { lang } = useLanguage();
  const t = (path: string) => {
    const keys = path.split(".");
    let res = translations[lang];
    keys.forEach((k) => { if (res) res = res[k]; });
    return res || path;
  };

  // 1. СТЕЙТ ДЛЯ НАЛАШТУВАНЬ З БЕКЕНДУ
  const [settings, setSettings] = useState<any>(null);

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // 2. ЗАВАНТАЖЕННЯ ДАНИХ
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/settings`);
        if (res.data) setSettings(res.data);
      } catch (error) {
        console.error("Помилка завантаження налаштувань:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    setFieldErrors({});

    try {
      const res = await axios.post("http://localhost:5000/api/contact", formData);
      if (res.data.success) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => setStatus("idle"), 6000); 
      }
    } catch (error: any) {
      setStatus("error");
      if (error.response) {
        if (error.response.status === 422 && error.response.data.errors) {
          const errorsObj: { [key: string]: string } = {};
          error.response.data.errors.forEach((err: any) => {
            const key = Object.keys(err)[0];
            errorsObj[key] = err[key];
          });
          setFieldErrors(errorsObj);
          setErrorMessage("Please check the form fields.");
        } else if (error.response.status === 429) {
          setErrorMessage(t("contact.rate_limit_msg"));
        } else {
          setErrorMessage(error.response.data.message || "Transmission failed.");
        }
      } else {
        setErrorMessage("Network error. Server is unreachable.");
      }
    }
  };

  // Фолбеки на випадок, якщо дані ще не завантажились
  const displayEmail = settings?.email || "vovk.zheka1@outlook.com";
  const displayPhones = settings?.phones?.length > 0 ? settings.phones : ["+48 739 500 702", "+380 99 313 3600"];

  return (
    <section className="contact-glass" id="contact">
      <div className="ambient-glow center-left"></div>
      <div className="container">
        <motion.div className="contact-glass__header" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }}>
          <h2 className="section-title">
            <span className="accent-number">04.</span> SYSTEM_LOG // <span className="glow-text">{t('contact.section_title')}</span>
          </h2>
          <div className="header-line"></div>
        </motion.div>

        <div className="contact-grid">
          <motion.div className="contact-info-card split-bg-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="info-title">{t('contact.info_title')}</h3>
            <p className="info-desc">{t('contact.info_desc')}</p>

            <div className="info-specs">
              <div className="spec-item">
                <MapPin className="spec-icon" />
                <div className="spec-text">
                  <span className="label">{t('contact.location_label')}</span>
                  <span className="value">{t('contact.location_val')}</span>
                </div>
              </div>
              
              <div className="spec-item">
                <Mail className="spec-icon" />
                <div className="spec-text">
                  <span className="label">DIRECT EMAIL</span>
                  <span className="value">{displayEmail}</span>
                </div>
              </div>

              <div className="spec-item">
                <Phone className="spec-icon" />
                <div className="spec-text">
                  <span className="label">SECURE LINES</span>
                  {displayPhones.map((phone: string, idx: number) => (
                    <span key={idx} className="value">{phone}</span>
                  ))}
                </div>
              </div>

              <div className="spec-item">
                <Activity className="spec-icon pulse" />
                <div className="spec-text">
                  <span className="label">{t('contact.status_label')}</span>
                  <span className="value text-green">{settings?.isLookingForWork ? t('contact.status_val') : "Currently Employed"}</span>
                </div>
              </div>
            </div>

            <div className="social-links">
              <a href={settings?.socials?.github || "#"} target="_blank" rel="noreferrer" className="social-btn" data-tooltip="GitHub"><Github size={20} /></a>
              <a href={settings?.socials?.linkedin || "#"} target="_blank" rel="noreferrer" className="social-btn" data-tooltip="LinkedIn"><Linkedin size={20} /></a>
              <a href={`mailto:${displayEmail}`} className="social-btn" data-tooltip="Email"><Mail size={20} /></a>
            </div>
          </motion.div>

          {/* ... Твоя форма залишається без змін ... */}
          <motion.div className="contact-form-card split-bg-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: 0.1 }}>
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div key="success" className="success-state" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 100 }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
                    <CheckCircle size={80} className="success-icon" />
                  </motion.div>
                  <h3>TRANSMISSION COMPLETE</h3>
                  <p>{t('contact.success_msg')}</p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="rs-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="form-group">
                    <label htmlFor="name">{t('contact.form_name')}</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={fieldErrors.name ? "error-border" : ""} placeholder="John Doe" />
                    {fieldErrors.name && <span className="error-text">{fieldErrors.name}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">{t('contact.form_email')}</label>
                      <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={fieldErrors.email ? "error-border" : ""} placeholder="name@domain.com" />
                      {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">{t('contact.form_phone')}</label>
                      <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={fieldErrors.phone ? "error-border" : ""} placeholder="+48 XXX XXX XXX" />
                      {fieldErrors.phone && <span className="error-text">{fieldErrors.phone}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">{t('contact.form_msg')}</label>
                    <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} required className={fieldErrors.message ? "error-border" : ""} placeholder="Let's build something great..."></textarea>
                    {fieldErrors.message && <span className="error-text">{fieldErrors.message}</span>}
                  </div>
                  <AnimatePresence>
                    {status === "error" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="global-error">
                        <AlertTriangle size={18} /> {errorMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.button type="submit" className={`submit-btn ${status === "loading" ? "loading" : ""}`} disabled={status === "loading"} whileTap={{ scale: 0.97 }}>
                    <AnimatePresence mode="wait">
                      {status === "loading" ? (
                        <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="btn-content">
                          <Activity className="spin-icon" size={18} /> {t('contact.btn_sending')}
                        </motion.div>
                      ) : (
                        <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="btn-content">
                          <Send size={18} /> {t('contact.btn_send')}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;