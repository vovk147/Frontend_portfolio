"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon, Link as LinkIcon, FileText, Star, Tag as TagIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import './AdminCreate.scss';

export default function AdminCreateProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'en' | 'uk' | 'pl'>('uk');

  // Дані проекту
  const [slug, setSlug] = useState('');
  const [stage, setStage] = useState('STAGE_1');
  const [github, setGithub] = useState('');
  const [live, setLive] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Файли
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<FileList | null>(null);

  // Теги
  const [dbTags, setDbTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');

  const [translations, setTranslations] = useState({
    uk: { title: '', description: '', fullCaseStudy: '' },
    en: { title: '', description: '', fullCaseStudy: '' },
    pl: { title: '', description: '', fullCaseStudy: '' },
  });

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/tags`);
        setDbTags(res.data.data || res.data || []);
      } catch (error) { console.error("Помилка завантаження тегів", error); }
    };
    fetchTags();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const formData = new FormData();
      formData.append('slug', slug);
      formData.append('stage', stage);
      formData.append('isFeatured', String(isFeatured));
      
      const tagsString = selectedTags.join(',');
      formData.append('techStack', tagsString);
      formData.append('tags', tagsString);

      formData.append('links', JSON.stringify({ github, live }));
      formData.append('translations', JSON.stringify(translations));

      if (mainImage) formData.append('mainImage', mainImage);
      if (gallery) { Array.from(gallery).forEach(file => formData.append('gallery', file)); }

      await axios.post(`${API_URL}/api/projects`, formData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      alert("Проект успішно створено!");
      router.push('/admin/projects');
    } catch (error: any) {
      alert(error.response?.data?.message || "Помилка при збереженні.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-page">
      <div className="create-header">
        <Link href="/admin/projects" className="back-btn"><ArrowLeft size={20} /> Назад до проектів</Link>
        <h1 className="hero-title">Створити новий проект</h1>
      </div>

      <form onSubmit={handleSubmit} className="create-layout-wrapper">
        
        {/* ЛІВА КОЛОНКА (ОСНОВНА) */}
        <div className="main-column">
          
          <div className="glass-panel">
            <h2 className="section-title"><FileText size={18}/> Основна інформація</h2>
            <div className="input-group">
              <label>Slug (URL проекту) *</label>
              <input type="text" required value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="наприклад: react-dashboard" />
            </div>

            <div className="language-tabs">
              <button type="button" className={`tab-btn ${activeTab === 'uk' ? 'active' : ''}`} onClick={() => setActiveTab('uk')}>Українська</button>
              <button type="button" className={`tab-btn ${activeTab === 'en' ? 'active' : ''}`} onClick={() => setActiveTab('en')}>English</button>
              <button type="button" className={`tab-btn ${activeTab === 'pl' ? 'active' : ''}`} onClick={() => setActiveTab('pl')}>Polski</button>
            </div>
            
            <div className="input-group">
              <label>Назва проекту ({activeTab.toUpperCase()}) *</label>
              <input type="text" required value={translations[activeTab].title} onChange={e => setTranslations(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], title: e.target.value } }))} />
            </div>
            <div className="input-group">
              <label>Короткий опис</label>
              <textarea rows={3} value={translations[activeTab].description} onChange={e => setTranslations(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], description: e.target.value } }))} />
            </div>
            <div className="input-group">
              <label>Повний Case Study</label>
              <textarea rows={8} value={translations[activeTab].fullCaseStudy} onChange={e => setTranslations(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], fullCaseStudy: e.target.value } }))} />
            </div>
          </div>

          <div className="glass-panel">
            <h2 className="section-title"><ImageIcon size={18}/> Медіа файли</h2>
            <div className="input-group">
              <label>Головне зображення (Main Image) *</label>
              <div className={`file-drop-area ${mainImagePreview ? 'has-image' : ''}`}>
                {mainImagePreview ? <img src={mainImagePreview} alt="Preview" className="image-preview" /> : <><UploadCloud size={30} className="upload-icon" /><p>Натисни, щоб обрати файл</p></>}
                <input type="file" required accept="image/*" onChange={handleImageChange} />
              </div>
            </div>
            <div className="input-group">
              <label>Галерея (до 10 фото)</label>
              <div className="file-drop-area">
                <UploadCloud size={30} className="upload-icon" />
                <p>{gallery && gallery.length > 0 ? `Обрано файлів: ${gallery.length}` : 'Натисни, щоб обрати файли'}</p>
                <input type="file" multiple accept="image/*" onChange={e => setGallery(e.target.files)} />
              </div>
            </div>
          </div>

        </div>

        {/* ПРАВА КОЛОНКА (САЙДБАР) */}
        <div className="sidebar-column">
          
          {/* Кнопка Збереження завжди зверху сайдбара */}
          <button type="submit" className="save-btn" disabled={loading}>
            <Save size={20} /> {loading ? 'Збереження...' : 'Опублікувати проект'}
          </button>

          <div className="glass-panel">
            <h2 className="section-title"><Settings size={18}/> Публікація</h2>
            <div className="input-group">
              <label>Стадія розробки</label>
              <select value={stage} onChange={e => setStage(e.target.value)}>
                <option value="STAGE_1">STAGE 1 (Дизайн)</option>
                <option value="STAGE_2">STAGE 2 (В розробці)</option>
                <option value="STAGE_3">STAGE 3 (Завершено)</option>
              </select>
            </div>
            <div className="feature-toggle" onClick={() => setIsFeatured(!isFeatured)}>
              <span>Головна сторінка (Featured)</span>
              <div className={`toggle-track ${isFeatured ? 'active' : ''}`}>
                <div className="toggle-thumb"><Star size={14} fill={isFeatured ? "#8b0000" : "transparent"}/></div>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <h2 className="section-title"><TagIcon size={18}/> Технології (Теги)</h2>
            <input type="text" placeholder="Пошук або створення..." value={tagSearch} onChange={e => setTagSearch(e.target.value)} className="sidebar-search" />
            
            <div className="tags-scroll-box">
              {dbTags.length === 0 ? <p style={{color: '#6b7280', fontSize: '0.9rem', textAlign: 'center'}}>Тегів ще немає</p> : 
                dbTags.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase())).map(tag => (
                  <label key={tag._id} className="tag-checkbox-item">
                    <input type="checkbox" checked={selectedTags.includes(tag.name)} onChange={(e) => {
                      if (e.target.checked) setSelectedTags([...selectedTags, tag.name]);
                      else setSelectedTags(selectedTags.filter(t => t !== tag.name));
                    }}/>
                    <span className="color-dot" style={{ backgroundColor: tag.color || '#888' }}></span>
                    <span className="tag-name">{tag.name}</span>
                  </label>
              ))}

              {tagSearch.trim() !== '' && !dbTags.some(t => t.name.toLowerCase() === tagSearch.trim().toLowerCase()) && (
                <button type="button" className="btn-create-tag-inline" onClick={() => { setSelectedTags([...selectedTags, tagSearch.trim()]); setTagSearch(''); }}>
                  + Створити "{tagSearch}"
                </button>
              )}
            </div>
          </div>

          <div className="glass-panel">
            <h2 className="section-title"><LinkIcon size={18}/> Посилання</h2>
            <div className="input-group"><label>GitHub Repository</label><input type="url" value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/..." /></div>
            <div className="input-group"><label>Live Site (Website)</label><input type="url" value={live} onChange={e => setLive(e.target.value)} placeholder="https://..." /></div>
          </div>

        </div>

      </form>
    </div>
  );
}