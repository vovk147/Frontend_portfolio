"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Хук для получения [slug] из URL
import { motion } from 'framer-motion';
import { ArrowLeft, Github, ExternalLink, Activity, AlertTriangle, Layers, Code2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useLanguage } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import uk from "@/locales/uk.json";
import pl from "@/locales/pl.json";
import './ProjectDetail.scss';

const translations: any = { en, uk, pl };

interface Tag { _id: string; name: string; color: string; slug: string; }
interface Project {
  _id: string; slug: string; stage: string; techStack: string[]; tags: Tag[]; mainImage: string;
  links: { github: string; live: string; }; isFeatured: boolean;
  translations: { en: { title: string; description: string; }; uk: { title: string; description: string; }; pl: { title: string; description: string; }; };
}

const ProjectDetail = () => {
  const { lang } = useLanguage();
  const params = useParams(); 
  const slug = params.slug; // Получаем slug или id из URL

  const t = (path: string) => {
    const keys = path.split('.');
    let res = translations[lang];
    keys.forEach(k => { if (res) res = res[k]; });
    return res || path;
  };

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchProject = async () => {
      try {
        // Делаем запрос к твоему API по конкретному slug/id
        const res = await axios.get(`http://localhost:5000/api/projects/${slug}`);
        if (res.data.success && res.data.data) {
            setProject(res.data.data);
        } else if (res.data && !res.data.success) {
            setProject(res.data); // На случай если бекенд отдает сразу объект
        } else {
            setError(true);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch project:", err);
        setError(true);
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  const getImageUrl = (path: string) => path ? (path.startsWith('http') ? path : `http://localhost:5000/${path.replace(/\\/g, '/')}`) : '';
  const getTranslation = (p: Project, field: 'title' | 'description') => p.translations?.[lang as keyof typeof p.translations]?.[field] || p.translations?.en?.[field] || '';

  if (loading) return (
    <section className="project-detail-loading">
      <Activity className="pulse-icon" size={50} />
      <span>LOADING CLASSIFIED DATA...</span>
    </section>
  );

  if (error || !project) return (
    <section className="project-detail-error">
      <AlertTriangle size={60} className="error-icon" />
      <h2>{t('projects.not_found')}</h2>
      <Link href="/archive" className="back-btn">{t('projects.back_to_archive')}</Link>
    </section>
  );

  return (
    <section className="project-detail-section">
      <div className="ambient-glow top-right"></div>
      <div className="ambient-glow center-left"></div>

      <div className="container">
        
        {/* КНОПКА НАЗАД */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="top-navigation">
          <Link href="/archive" className="back-link">
            <ArrowLeft size={16} /> {t('projects.back_to_archive')}
          </Link>
        </motion.div>

        {/* ГЛАВНЫЙ ЗАГОЛОВОК */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="project-header">
          <h1 className="project-title">{getTranslation(project, 'title')}</h1>
          <div className="project-meta">
            <span className="stage-badge">{project.stage ? project.stage.replace('_', ' ') : 'PRODUCTION'}</span>
            <div className="tags-container">
              {project.tags?.map(tag => (
                <span key={tag._id} className="color-tag" style={{ borderLeftColor: tag.color }}>{tag.name}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ОГРОМНАЯ КАРТИНКА ГЕРОЯ */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="project-hero-image">
          {project.mainImage ? (
            <img src={getImageUrl(project.mainImage)} alt={getTranslation(project, 'title')} />
          ) : (
            <div className="no-signal-hero">NO VISUAL DATA AVAILABLE</div>
          )}
        </motion.div>

        {/* СЕТКА ИНФОРМАЦИИ */}
        <div className="project-info-grid">
          
          {/* ЛЕВАЯ КОЛОНКА (ОПИСАНИЕ) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="info-main">
            <div className="glass-panel">
              <h3 className="panel-title"><Layers size={18}/> {t('projects.overview')}</h3>
              <div className="description-content">
                {/* Если описание содержит переносы строк, красиво их выводим */}
                {getTranslation(project, 'description').split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ПРАВАЯ КОЛОНКА (СПЕЦИФИКАЦИИ И ССЫЛКИ) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="info-sidebar">
            
            {/* ТЕХНОЛОГИИ */}
            <div className="glass-panel tech-panel">
              <h3 className="panel-title"><Code2 size={18}/> {t('projects.tech_specs')}</h3>
              <div className="tech-pills">
                {project.techStack?.map((tech, idx) => (
                  <span key={idx} className="tech-pill">{tech}</span>
                ))}
              </div>
            </div>

            {/* ССЫЛКИ */}
            <div className="glass-panel links-panel">
              <h3 className="panel-title"><ExternalLink size={18}/> {t('projects.external_links')}</h3>
              <div className="links-wrapper">
                {project.links?.live && (
                  <a href={project.links.live} target="_blank" rel="noreferrer" className="action-btn primary-btn">
                    <Activity size={18} /> {t('projects.live_site')}
                  </a>
                )}
                {project.links?.github && (
                  <a href={project.links.github} target="_blank" rel="noreferrer" className="action-btn secondary-btn">
                    <Github size={18} /> {t('projects.source_code')}
                  </a>
                )}
                {(!project.links?.live && !project.links?.github) && (
                  <p className="no-links">Private / NDA restricted</p>
                )}
              </div>
            </div>

          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default ProjectDetail;