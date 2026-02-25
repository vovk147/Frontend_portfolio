"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List as ListIcon, X, Github, ExternalLink, Activity, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import uk from "@/locales/uk.json";
import pl from "@/locales/pl.json";
import './Archive.scss';

const translations: any = { en, uk, pl };

interface Tag { _id: string; name: string; color: string; slug: string; }
interface Project {
  _id: string; slug: string; stage: string; techStack: string[]; tags: Tag[]; mainImage: string;
  links: { github: string; live: string; }; isFeatured: boolean;
  translations: { en: { title: string; description: string; }; uk: { title: string; description: string; }; pl: { title: string; description: string; }; };
}

const Archive = () => {
  const { lang } = useLanguage();
  const t = (path: string) => {
    const keys = path.split('.');
    let res = translations[lang];
    keys.forEach(k => { if (res) res = res[k]; });
    return res || path;
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/projects');
        if (res.data.success && Array.isArray(res.data.data)) { setProjects(res.data.data); } 
        else if (Array.isArray(res.data)) { setProjects(res.data); }
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch archive:", err);
        setLoading(false);
      }
    };
    fetchAllProjects();
  }, []);

  const availableTech = useMemo(() => {
    const all = projects.flatMap(p => p.techStack || []);
    return Array.from(new Set(all)).sort();
  }, [projects]);

  const availableCategories = useMemo(() => {
    const all = projects.flatMap(p => p.tags?.map(t => t.name) || []);
    return Array.from(new Set(all)).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const currentLang = lang as keyof typeof p.translations;
      const title = (p.translations?.[currentLang]?.title || p.translations?.en?.title || '').toLowerCase();
      const desc = (p.translations?.[currentLang]?.description || p.translations?.en?.description || '').toLowerCase();
      
      const matchesSearch = title.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
      const matchesTech = selectedTech.length === 0 || selectedTech.some(t => p.techStack?.includes(t));
      const matchesCat = selectedCategories.length === 0 || selectedCategories.some(c => p.tags?.some(tag => tag.name === c));

      return matchesSearch && matchesTech && matchesCat;
    });
  }, [projects, searchQuery, selectedTech, selectedCategories, lang]);

  const toggleTech = (tech: string) => {
    setSelectedTech(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const clearFilters = () => {
    setSearchQuery(''); setSelectedTech([]); setSelectedCategories([]);
  };

  const getImageUrl = (path: string) => path ? (path.startsWith('http') ? path : `http://localhost:5000/${path.replace(/\\/g, '/')}`) : '';
  const getTranslation = (p: Project, field: 'title' | 'description') => p.translations?.[lang as keyof typeof p.translations]?.[field] || p.translations?.en?.[field] || '';

  if (loading) return (
    <section className="archive-loading"><Activity className="pulse-icon" size={40} /><span>INITIALIZING DATABASE...</span></section>
  );

  return (
    <section className="archive-section">
      <div className="ambient-glow center-right"></div>
      
      <div className="container">
        <div className="archive-header">
          <h1 className="archive-title"><span className="accent">05.</span> SYSTEM_LOG // <span className="solid">{t('archive.title')}</span></h1>
          
          <div className="view-toggles">
            <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
              <LayoutGrid size={18} /> {t('archive.view_grid')}
            </button>
            <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
              <ListIcon size={18} /> {t('archive.view_list')}
            </button>
          </div>
        </div>

        <div className="archive-layout">
          {/* САЙДБАР */}
          <aside className="archive-sidebar">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder={t('archive.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {searchQuery && <X size={16} className="clear-search" onClick={() => setSearchQuery('')} />}
            </div>

            <div className="filter-group">
              <div className="filter-header">
                <h3>{t('archive.tech_stack')}</h3>
                {(selectedTech.length > 0 || selectedCategories.length > 0) && (
                  <button className="clear-all" onClick={clearFilters}>{t('archive.clear_all')}</button>
                )}
              </div>
              <div className="checkbox-list">
                {availableTech.map(tech => (
                  <label key={tech} className="custom-checkbox">
                    <input type="checkbox" checked={selectedTech.includes(tech)} onChange={() => toggleTech(tech)} />
                    <span className="checkmark"></span>
                    <span className="label-text">{tech}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-header">
                <h3>{t('archive.categories')}</h3>
              </div>
              <div className="checkbox-list">
                {availableCategories.map(cat => (
                  <label key={cat} className="custom-checkbox">
                    <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} />
                    <span className="checkmark"></span>
                    <span className="label-text">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* КОНТЕНТ */}
          <main className="archive-content">
            <div className="results-count">
              Found: <span>{filteredProjects.length}</span> records
            </div>

            {filteredProjects.length === 0 ? (
              <div className="no-results">
                <X size={40} className="x-icon" />
                <p>{t('archive.no_results')}</p>
                <button onClick={clearFilters}>RESET FILTERS</button>
              </div>
            ) : (
              <motion.div layout className={`projects-${viewMode}`}>
                <AnimatePresence mode="popLayout">
                  {filteredProjects.map(project => (
                    <motion.div 
                      layout key={project._id} 
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}
                      className={viewMode === 'grid' ? "archive-card" : "archive-row"}
                    >
                      {/* === РЕЖИМ СЕТКИ (ДОБАВЛЕНО ОПИСАНИЕ И СТАТУС) === */}
                      {viewMode === 'grid' && (
                        <>
                          <div className="card-visual">
                            {project.mainImage ? <img src={getImageUrl(project.mainImage)} alt="" /> : <div className="no-img">NO SIGNAL</div>}
                          </div>
                          <div className="card-body">
                            <div className="card-header-top">
                              <h3>{getTranslation(project, 'title')}</h3>
                              <span className="grid-stage">{project.stage ? project.stage.replace('_', ' ') : 'PRODUCTION'}</span>
                            </div>
                            {/* ОПИСАНИЕ */}
                            <p className="p-description">{getTranslation(project, 'description')}</p>
                            
                            <div className="tech-row">{project.techStack?.slice(0, 4).map((t, i) => <span key={i}>{t}</span>)}</div>
                            <div className="links">
                              {project.links?.github && <a href={project.links.github} target="_blank"><Github size={18}/></a>}
                              <a href={`/projects/${project.slug}`} className="details">DETAILS <ArrowRight size={16}/></a>
                            </div>
                          </div>
                        </>
                      )}

                      {/* === РЕЖИМ СПИСКА (ТЕРМИНАЛ - ДОБАВЛЕНО ОПИСАНИЕ) === */}
                      {viewMode === 'list' && (
                        <>
                          <div className="row-info">
                            <div className="row-title">
                              <h3>{getTranslation(project, 'title')}</h3>
                              <span className="row-stage">{project.stage ? project.stage.replace('_', ' ') : 'PRODUCTION'}</span>
                            </div>
                            <p className="row-desc">{getTranslation(project, 'description')}</p>
                          </div>
                          <div className="row-tech">{project.techStack?.slice(0, 4).join(' / ')}</div>
                          <div className="row-actions">
                            {project.links?.github && <a href={project.links.github} target="_blank"><Github size={18}/></a>}
                            {project.links?.live && <a href={project.links.live} target="_blank"><ExternalLink size={18}/></a>}
                            <a href={`/projects/${project.slug}`} className="btn-view">VIEW</a>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

export default Archive;