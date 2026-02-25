"use client";
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ExternalLink, Activity, AlertTriangle, ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useLanguage } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import uk from "@/locales/uk.json";
import pl from "@/locales/pl.json";
import './Projects.scss';

const translations: any = { en, uk, pl };

interface Tag { _id: string; name: string; color: string; slug: string; }
interface Project {
  _id: string; slug: string; stage: string; techStack: string[]; tags: Tag[]; mainImage: string;
  links: { github: string; live: string; }; isFeatured: boolean;
  translations: { en: { title: string; description: string; }; uk: { title: string; description: string; }; pl: { title: string; description: string; }; };
}

const Projects = () => {
  const { lang } = useLanguage();
  const t = (path: string) => {
    const keys = path.split('.');
    let res = translations[lang];
    keys.forEach(k => { if (res) res = res[k]; });
    return res || path;
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/projects?featured=true&limit=8');
        if (res.data.success && Array.isArray(res.data.data)) { setProjects(res.data.data); } 
        else if (Array.isArray(res.data)) { setProjects(res.data); } 
        else { setProjects([]); }
        setLoading(false);
      } catch (err) {
        console.error("Uplink failed:", err);
        setError(true); setLoading(false);
      }
    };
    fetchFeaturedProjects();
  }, []);

  const filters = useMemo(() => {
    const allTech = projects.flatMap(p => p.techStack || []);
    const uniqueTech = Array.from(new Set(allTech.map(t => t.toUpperCase())));
    return ['ALL', ...uniqueTech.slice(0, 5)]; 
  }, [projects]);

  const filteredProjects = projects.filter(project => {
    if (activeFilter === 'ALL') return true;
    return project.techStack?.some(t => t.toUpperCase() === activeFilter);
  }).slice(0, 8);

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000/${path.replace(/\\/g, '/')}`; 
  };

  const getTranslation = (project: Project, field: 'title' | 'description') => {
    const currentLang = lang as keyof typeof project.translations;
    return project.translations?.[currentLang]?.[field] || project.translations?.en?.[field] || t(`projects.no_${field}`);
  };

  if (loading) return (
    <section className="projects-section loading-state">
      <div className="loader-box"><Activity className="pulse-icon" size={40} /><span>{t('projects.loading')}</span></div>
    </section>
  );

  if (error) return (
    <section className="projects-section error-state">
      <div className="error-box"><AlertTriangle size={40} /> {t('projects.error')}</div>
    </section>
  );

  return (
    <section className="projects-section" id="projects">
      {/* ФИКС ОБРЕЗКИ ФОНА: Пятна строго по центру секции, чтобы не бились об края */}
      <div className="ambient-glow center-right"></div>
      <div className="ambient-glow center-left"></div>

      <div className="container">
        
        <motion.div 
          className="projects-section__header"
          initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="section-title">
            <span className="accent-number">03.</span> SYSTEM_LOG // <span className="glow-text">{t('projects.section_title')}</span>
          </h2>
          <div className="header-line"></div>
        </motion.div>

        {projects.length > 0 && (
          <motion.div className="filter-bar" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="filter-scroll">
              {filters.map(tag => (
                <button key={tag} onClick={() => setActiveFilter(tag)} className={`filter-btn ${activeFilter === tag ? 'active' : ''}`}>
                  {tag === 'ALL' ? t('projects.filter_all') : tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div layout className="projects-grid">
          <AnimatePresence mode='popLayout'>
            {filteredProjects.map((project) => (
              <motion.div 
                layout key={project._id} className="project-card"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}
              >
                <div className="card-visual">
                  <div className="stage-badge">{project.stage ? project.stage.replace('_', ' ') : 'PRODUCTION'}</div>
                  {project.mainImage ? (
                    <img src={getImageUrl(project.mainImage)} alt={getTranslation(project, 'title')} className="project-img" />
                  ) : (<div className="no-signal">NO SIGNAL</div>)}

                  <div className="image-overlay">
                     <Link href={`/projects/${project.slug}`} className="view-btn"><Eye size={18} /> {t('projects.view_case')}</Link>
                  </div>
                </div>

                <div className="card-content">
                  <div className="tags-row">
                    {project.tags && project.tags.map((tag) => (
                      <span key={tag._id} className="color-tag" style={{ borderLeftColor: tag.color }}>
                        <span className="tag-dot" style={{ backgroundColor: tag.color }}></span> {tag.name}
                      </span>
                    ))}
                  </div>

                  <h3 className="p-title">{getTranslation(project, 'title')}</h3>
                  
                  <div className="tech-row">
                    {project.techStack?.slice(0, 4).map((t, i) => (<span key={i} className="mini-tag">{t}</span>))}
                  </div>

                  <p className="p-description">{getTranslation(project, 'description')}</p>
                  
                  <div className="card-footer">
                    <div className="external-links">
                      {project.links?.github && (<a href={project.links.github} target="_blank" rel="noreferrer" className="icon-btn"><Github size={20} /></a>)}
                      {project.links?.live && (<a href={project.links.live} target="_blank" rel="noreferrer" className="icon-btn"><ExternalLink size={20} /></a>)}
                    </div>
                    <Link href={`/projects/${project.slug}`} className="details-link">{t('projects.details')} <ArrowRight size={16} /></Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div className="archive-container" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Link href="/archive" className="btn-archive">{t('projects.open_archive')}</Link>
        </motion.div>

      </div>
    </section>
  );
};

export default Projects;