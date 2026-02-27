"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Search, Plus, Edit, Trash2, ExternalLink, Filter, Activity, Star, CheckSquare } from 'lucide-react';
import './AdminProjects.scss';

interface Tag {
  _id: string;
  name: string;
  color: string;
}

interface Project {
  _id: string;
  slug: string;
  stage: string;
  techStack: string[];
  tags: Tag[];
  isFeatured: boolean;
  links: { live: string; github: string };
  translations: { en: { title: string }, uk: { title: string } };
  createdAt: string;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Стейти для фільтрів
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stageFilter, setStageFilter] = useState('ALL');
  const [featuredFilter, setFeaturedFilter] = useState('ALL');

  // Стейт для масового виділення
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

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

  // Одинарне видалення
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Ти впевнений, що хочеш назавжди видалити проект "${title}"?`)) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken'); 
      
      await axios.delete(`${API_URL}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` } 
      });

      setProjects(projects.filter(p => p._id !== id));
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id)); // Прибираємо з вибраних, якщо був там
    } catch (error) {
      console.error("Помилка видалення:", error);
      alert("Не вдалося видалити проект.");
    }
  };

  // === НОВА ЛОГІКА: МАСОВЕ ВИДАЛЕННЯ ===
  const handleBulkDelete = async () => {
    if (!window.confirm(`УВАГА! Ти збираєшся видалити ${selectedIds.length} проектів назавжди. Продовжити?`)) return;

    setIsDeletingBulk(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken'); 
      
      // Розсилаємо запити на видалення паралельно для швидкості
      await Promise.all(
        selectedIds.map(id => 
          axios.delete(`${API_URL}/api/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );

      // Оновлюємо стейт
      setProjects(projects.filter(p => !selectedIds.includes(p._id)));
      setSelectedIds([]); // Очищаємо вибір
      alert("Вибрані проекти успішно видалено!");
    } catch (error) {
      console.error("Помилка масового видалення:", error);
      alert("Сталася помилка при видаленні деяких проектів.");
    } finally {
      setIsDeletingBulk(false);
    }
  };

  // Фільтрація
  const filteredProjects = projects.filter(p => {
    const search = searchTerm.toLowerCase();
    const titleEn = p.translations?.en?.title?.toLowerCase() || '';
    const titleUk = p.translations?.uk?.title?.toLowerCase() || '';
    const tagNames = p.tags?.map(t => t.name.toLowerCase()).join(' ') || '';
    const techStack = p.techStack?.join(' ').toLowerCase() || '';
    
    const matchesSearch = titleEn.includes(search) || titleUk.includes(search) || tagNames.includes(search) || techStack.includes(search);
    const matchesStage = stageFilter === 'ALL' || p.stage === stageFilter;
    const matchesFeatured = featuredFilter === 'ALL' || (featuredFilter === 'FEATURED' && p.isFeatured) || (featuredFilter === 'REGULAR' && !p.isFeatured);

    return matchesSearch && matchesStage && matchesFeatured;
  });

  // Логіка чекбоксів
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProjects.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  return (
    <div className="admin-projects-page">
      
      <div className="projects-toolbar glass-panel">
        <div className="toolbar-top">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Шукати за назвою або тегом..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="toolbar-actions">
            <button className={`filter-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <Filter size={18} /> Фільтри
            </button>
            <Link href="/admin/create" className="create-btn">
              <Plus size={18} /> Створити
            </Link>
          </div>
        </div>

        {showFilters && (
          <div className="filters-dropdown">
            <div className="filter-group">
              <label>Стадія розробки:</label>
              <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
                <option value="ALL">Всі стадії</option>
                <option value="STAGE_1">STAGE 1 (Дизайн)</option>
                <option value="STAGE_2">STAGE 2 (В розробці)</option>
                <option value="STAGE_3">STAGE 3 (Завершено)</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Публікація:</label>
              <select value={featuredFilter} onChange={e => setFeaturedFilter(e.target.value)}>
                <option value="ALL">Всі проекти</option>
                <option value="FEATURED">Тільки на Головній (Featured)</option>
                <option value="REGULAR">Звичайні</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ПАНЕЛЬ МАСОВИХ ДІЙ (з'являється тільки якщо вибрано хоча б 1 елемент) */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions-bar glass-panel">
          <div className="bulk-info">
            <CheckSquare size={20} color="#4a90e2" />
            <span>Вибрано проектів: <strong>{selectedIds.length}</strong></span>
          </div>
          <div className="bulk-buttons">
            <button className="btn-cancel" onClick={() => setSelectedIds([])} disabled={isDeletingBulk}>
              Скасувати
            </button>
            <button className="btn-delete-bulk" onClick={handleBulkDelete} disabled={isDeletingBulk}>
              <Trash2 size={18} /> {isDeletingBulk ? 'Видалення...' : 'Видалити вибрані'}
            </button>
          </div>
        </div>
      )}

      <div className="projects-table-container glass-panel">
        {loading ? (
          <div className="loading-state">
            <Activity className="spin-icon" size={40} />
            <p>Завантаження бази даних...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <p>За вашим запитом проектів не знайдено.</p>
            <button onClick={() => { setSearchTerm(''); setStageFilter('ALL'); setFeaturedFilter('ALL'); }} className="reset-btn">
              Скинути фільтри
            </button>
          </div>
        ) : (
          <table className="projects-table">
            <thead>
              <tr>
                {/* ЧЕКБОКС "ВИБРАТИ ВСІ" */}
                <th className="checkbox-col">
                  <input 
                    type="checkbox" 
                    className="custom-checkbox"
                    checked={selectedIds.length === filteredProjects.length && filteredProjects.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Назва проекту</th>
                <th>Технології</th>
                <th>Статус</th>
                <th>Дата</th>
                <th className="actions-col">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const displayTags = project.tags && project.tags.length > 0 ? project.tags.map(t => t.name) : project.techStack || [];
                const isSelected = selectedIds.includes(project._id);

                return (
                  <tr key={project._id} className={isSelected ? 'selected-row' : ''}>
                    
                    {/* ЧЕКБОКС РЯДКА */}
                    <td className="checkbox-col">
                      <input 
                        type="checkbox" 
                        className="custom-checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(project._id)}
                      />
                    </td>

                    <td className="title-cell">
                      <div className="title-wrapper">
                        <div className="title-icon">
                          {displayTags[0]?.substring(0, 2).toUpperCase() || 'PR'}
                        </div>
                        <div>
                          <strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {project.translations?.en?.title || project.translations?.uk?.title || 'Без назви'}
                            {project.isFeatured && <Star size={14} color="#f1c40f" fill="#f1c40f" title="Featured" />}
                          </strong>
                          <a href={`/projects/${project.slug}`} target="_blank" rel="noreferrer" className="view-link">
                            <ExternalLink size={12} /> /projects/{project.slug}
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className="tech-cell">
                      <div className="tech-pills">
                        {displayTags.slice(0, 3).map((tech, i) => (
                          <span key={i} className="mini-pill">{tech}</span>
                        ))}
                        {displayTags.length > 3 && <span className="mini-pill">+{displayTags.length - 3}</span>}
                      </div>
                    </td>

                    <td className="status-cell">
                      <span className={`status-badge ${project.stage === 'STAGE_3' ? 'done' : 'progress'}`}>
                        {project.stage ? project.stage.replace('_', ' ') : 'STAGE 1'}
                      </span>
                    </td>

                    <td className="date-cell">
                      {new Date(project.createdAt).toLocaleDateString('uk-UA')}
                    </td>

                    <td className="actions-cell">
                      <div className="action-buttons">
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}