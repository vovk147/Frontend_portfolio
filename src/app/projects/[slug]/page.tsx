"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, ExternalLink, Calendar, Activity, CheckCircle, FileText, LayoutDashboard, Tag as TagIcon } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";
import './ProjectDetails.scss';

export default function ProjectDetails() {
  const params = useParams();
  const slug = params.slug;
  const { lang } = useLanguage();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/projects/slug/${slug}`);
        if (res.data) setProject(res.data.success ? res.data.data : res.data);
        else setError(true);
      } catch (err) {
        console.error("Помилка завантаження проекту:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProject();
  }, [slug]);

  const getContent = (field: 'title' | 'description' | 'fullCaseStudy') => {
    if (!project || !project.translations) return '';
    return project.translations[lang]?.[field] || project.translations['en']?.[field] || '';
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${API_URL}/${path.replace(/\\/g, '/')}`;
  };

  if (loading) return <div className="project-details-loading"><Activity size={50} className="spin-icon" color="#b30000" /><p>Завантаження даних...</p></div>;
  if (error || !project) return <div className="project-details-error container"><h1>Проект не знайдено</h1><Link href="/#projects" className="btn-back-prominent"><ArrowLeft size={20}/> Повернутися до портфоліо</Link></div>;

  const title = getContent('title');
  const description = getContent('description');
  const fullCaseStudy = getContent('fullCaseStudy');
  const displayTags = project.tags && project.tags.length > 0 ? project.tags : project.techStack?.map((t: string) => ({ name: t, color: '#888' })) || [];

  return (
    <main className="project-details-page">
      <div className="ambient-glow center-top"></div>

      {/* 1. ПОМІТНА КНОПКА ПОВЕРНЕННЯ */}
      <nav className="project-navigation container">
        <Link href="/#projects" className="btn-back-prominent">
          <div className="icon-wrap"><ArrowLeft size={20} /></div>
          <span>Повернутися до всіх проектів</span>
        </Link>
      </nav>

      <div className="container">
        
        {/* 2. АКУРАТНИЙ ХЕДЕР ТА ФОТО (2 колонки) */}
        <header className="project-header glass-panel">
          <div className="header-info">
            <div className="badges">
              <span className={`status-badge ${project.stage === 'STAGE_3' ? 'done' : 'progress'}`}>
                {project.stage === 'STAGE_3' ? <CheckCircle size={14}/> : <Activity size={14}/>}
                {project.stage ? project.stage.replace('_', ' ') : 'STAGE 1'}
              </span>
              <span className="date-badge"><Calendar size={14} /> {new Date(project.createdAt).getFullYear()}</span>
            </div>
            
            <h1 className="project-title">{title}</h1>
            <p className="project-subtitle">{description}</p>

            <div className="action-links">
              {project.links?.live && (
                <a href={project.links.live} target="_blank" rel="noreferrer" className="btn-primary">
                  <ExternalLink size={18} /> Переглянути сайт
                </a>
              )}
              {project.links?.github && (
                <a href={project.links.github} target="_blank" rel="noreferrer" className="btn-glass">
                  <Github size={18} /> Код на GitHub
                </a>
              )}
            </div>
          </div>

          <div className="header-visual">
            <img src={getImageUrl(project.mainImage)} alt={title} className="main-image" />
          </div>
        </header>

        {/* 3. ЗРУЧНИЙ ДЛЯ ЧИТАННЯ БЛОК (Case Study + Сайдбар з Тегами) */}
        <section className="content-layout">
          
          <article className="main-article glass-panel">
            <h2 className="article-title"><FileText size={22} color="#b30000"/> Огляд проекту</h2>
            {fullCaseStudy ? (
              <div className="formatted-text" dangerouslySetInnerHTML={{ __html: fullCaseStudy.replace(/\n/g, '<br/>') }} />
            ) : (
              <p className="empty-text">Детальний опис ще не додано.</p>
            )}
          </article>

          <aside className="project-sidebar">
            <div className="glass-panel sticky-box">
              <h3 className="sidebar-title"><TagIcon size={20} color="#b30000"/> Технології</h3>
              <div className="tags-list">
                {displayTags.map((tag: any, i: number) => (
                  <span key={i} className="tech-tag" style={{ borderLeftColor: tag.color || '#888' }}>
                    <span className="dot" style={{ backgroundColor: tag.color || '#888' }}></span> {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </aside>

        </section>

        {/* 4. ГАЛЕРЕЯ */}
        {project.gallery && project.gallery.length > 0 && (
          <section className="gallery-section glass-panel">
            <h2 className="article-title"><LayoutDashboard size={22} color="#b30000"/> Галерея</h2>
            <div className="gallery-grid">
              {project.gallery.map((img: string, i: number) => (
                <a key={i} href={getImageUrl(img)} target="_blank" rel="noreferrer" className="gallery-item">
                  <img src={getImageUrl(img)} alt={`Скріншот ${i + 1}`} loading="lazy" />
                  <div className="hover-overlay"><ExternalLink size={24} /></div>
                </a>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}