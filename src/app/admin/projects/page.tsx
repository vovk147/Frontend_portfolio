"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Search, Plus, Edit, Trash2, ExternalLink, Filter, Activity } from 'lucide-react';
import './AdminProjects.scss';

interface Project {
  _id: string;
  slug: string;
  stage: string;
  techStack: string[];
  links: { live: string; github: string };
  translations: { en: { title: string }, uk: { title: string } };
  createdAt: string;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Завантаження проектів
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/projects`);
      const data = res.data.success ? res.data.data : res.data;
      
      const sorted = Array.isArray(data) 
        ? data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];
      
      setProjects(sorted);
    } catch (error) {
      console.error("Помилка завантаження проектів:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Видалення проекту (Захищений роут!)
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Ти впевнений, що хочеш назавжди видалити проект "${title}"?`)) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken'); // Дістаємо твій ключ доступу
      
      await axios.delete(`${API_URL}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` } // Відправляємо ключ на бекенд
      });

      // Оновлюємо список (прибираємо видалений проект з екрану)
      setProjects(projects.filter(p => p._id !== id));
    } catch (error) {
      console.error("Помилка видалення:", error);
      alert("Не вдалося видалити проект. Перевір консоль.");
    }
  };

  // 3. Фільтрація пошуком
  const filteredProjects = projects.filter(p => {
    const titleEn = p.translations?.en?.title?.toLowerCase() || '';
    const titleUk = p.translations?.uk?.title?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return titleEn.includes(search) || titleUk.includes(search);
  });

  return (
    <div className="admin-projects-page">
      
      {/* Верхня панель дій (Пошук і Кнопка додавання) */}
      <div className="projects-toolbar glass-panel">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Шукати проект за назвою..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="toolbar-actions">
          <button className="filter-btn">
            <Filter size={18} /> Фільтри
          </button>
          <Link href="/admin/create" className="create-btn">
            <Plus size={18} /> Створити
          </Link>
        </div>
      </div>

      {/* Таблиця проектів */}
      <div className="projects-table-container glass-panel">
        {loading ? (
          <div className="loading-state">
            <Activity className="spin-icon" size={40} />
            <p>Завантаження бази даних...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <p>Проектів не знайдено.</p>
          </div>
        ) : (
          <table className="projects-table">
            <thead>
              <tr>
                <th>Назва проекту</th>
                <th>Технології</th>
                <th>Статус</th>
                <th>Дата</th>
                <th className="actions-col">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project._id}>
                  {/* НАЗВА */}
                  <td className="title-cell">
                    <div className="title-wrapper">
                      <div className="title-icon">
                        {project.techStack?.[0]?.substring(0, 2).toUpperCase() || 'PR'}
                      </div>
                      <div>
                        <strong>{project.translations?.en?.title || project.translations?.uk?.title || 'Без назви'}</strong>
                        <a href={`/projects/${project.slug}`} target="_blank" rel="noreferrer" className="view-link">
                          <ExternalLink size={12} /> /projects/{project.slug}
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* ТЕХНОЛОГІЇ */}
                  <td className="tech-cell">
                    <div className="tech-pills">
                      {project.techStack?.slice(0, 3).map((tech, i) => (
                        <span key={i} className="mini-pill">{tech}</span>
                      ))}
                      {project.techStack?.length > 3 && <span className="mini-pill">+{project.techStack.length - 3}</span>}
                    </div>
                  </td>

                  {/* СТАТУС */}
                  <td className="status-cell">
                    <span className={`status-badge ${project.stage === 'STAGE_3' ? 'done' : 'progress'}`}>
                      {project.stage ? project.stage.replace('_', ' ') : 'STAGE 1'}
                    </span>
                  </td>

                  {/* ДАТА */}
                  <td className="date-cell">
                    {new Date(project.createdAt).toLocaleDateString('uk-UA')}
                  </td>

                  {/* ДІЇ (РЕДАГУВАТИ / ВИДАЛИТИ) */}
                  <td className="actions-cell">
                    <div className="action-buttons">
                      {/* Поки що ведемо на заглушку редагування */}
                      <Link href={`/admin/projects/edit/${project._id}`} className="action-btn edit" title="Редагувати">
                        <Edit size={16} />
                      </Link>
                      <button 
                        className="action-btn delete" 
                        title="Видалити"
                        onClick={() => handleDelete(project._id, project.translations?.uk?.title || 'Проект')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}