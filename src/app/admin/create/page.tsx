"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon, Link as LinkIcon, Code2, FileText, Star, Tag as TagIcon } from 'lucide-react';
import Link from 'next/link';
import './AdminCreate.scss';

export default function AdminCreateProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'en' | 'uk' | 'pl'>('uk');

  // Дані проекту
  const [slug, setSlug] = useState('');
  const [stage, setStage] = useState('STAGE_1');
  const [techStack, setTechStack] = useState('');
  const [github, setGithub] = useState('');
  const [live, setLive] = useState('');
  const [isFeatured, setIsFeatured] = useState(false); // 👈 Додали статус для головної сторінки

  // Файли та їх прев'ю 👈 ДОДАЛИ ПРЕВ'Ю
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<FileList | null>(null);

  // Теги з бази даних
  const [dbTags, setDbTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Переклади
  const [translations, setTranslations] = useState({
    uk: { title: '', description: '', fullCaseStudy: '' },
    en: { title: '', description: '', fullCaseStudy: '' },
    pl: { title: '', description: '', fullCaseStudy: '' },
  });

  // Завантажуємо існуючі теги з бекенду при відкритті сторінки
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/tags`);
        if (res.data.success || Array.isArray(res.data)) {
          setDbTags(res.data.data || res.data);
        }
      } catch (error) {
        console.log("Теги ще не створені на бекенді або маршрут недоступний", error);
      }
    };
    fetchTags();
  }, []);

  // Обробка вибору головного фото
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file)); // Створюємо тимчасовий URL для показу
    }
  };

  // Клік по тегу (додати/видалити)
  const toggleTag = (id: string) => {
    setSelectedTags(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleTranslationChange = (lang: 'en' | 'uk' | 'pl', field: string, value: string) => {
    setTranslations(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
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
      formData.append('isFeatured', String(isFeatured)); // 👈 Відправляємо статус на бекенд
      
      const techArray = techStack.split(',').map(t => t.trim()).filter(t => t);
      techArray.forEach(tech => formData.append('techStack[]', tech));

      // Відправляємо вибрані теги
      selectedTags.forEach(tagId => formData.append('tags[]', tagId));

      formData.append('links[github]', github);
      formData.append('links[live]', live);

      (['en', 'uk', 'pl'] as const).forEach(lang => {
        formData.append(`translations[${lang}][title]`, translations[lang].title);
        formData.append(`translations[${lang}][description]`, translations[lang].description);
        formData.append(`translations[${lang}][fullCaseStudy]`, translations[lang].fullCaseStudy);
      });

      if (mainImage) formData.append('mainImage', mainImage);
      if (gallery) { Array.from(gallery).forEach(file => formData.append('gallery', file)); }

      await axios.post(`${API_URL}/api/projects`, formData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      alert("Проект успішно створено!");
      router.push('/admin/projects');
    } catch (error: any) {
      console.error("Помилка створення:", error);
      alert(error.response?.data?.message || "Помилка при збереженні. Перевір консоль.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-page">
      <div className="create-header">
        <Link href="/admin/projects" className="back-btn"><ArrowLeft size={20} /> Назад</Link>
        <div className="title-row">
          <h1 className="hero-title">Створити новий проект</h1>
          
          {/* ПЕРЕМИКАЧ "ПОКАЗУВАТИ НА ГОЛОВНІЙ" */}
          <div className="feature-toggle" onClick={() => setIsFeatured(!isFeatured)}>
            <div className={`toggle-track ${isFeatured ? 'active' : ''}`}>
              <div className="toggle-thumb"><Star size={14} fill={isFeatured ? "#8b0000" : "transparent"}/></div>
            </div>
            <span>Показувати на головній (Featured)</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-grid">
          
          <div className="glass-panel form-section">
            <h2 className="section-title"><FileText size={18}/> Основна інформація</h2>
            <div className="input-group">
              <label>Slug (URL проекту) *</label>
              <input type="text" required value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} />
            </div>
            <div className="input-group">
              <label>Стадія розробки</label>
              <select value={stage} onChange={e => setStage(e.target.value)}>
                <option value="STAGE_1">STAGE 1 (Початок / Дизайн)</option>
                <option value="STAGE_2">STAGE 2 (Активна розробка)</option>
                <option value="STAGE_3">STAGE 3 (Завершено / Реліз)</option>
              </select>
            </div>
            
            <div className="input-group">
              <label><Code2 size={16}/> Технології (через кому, якщо немає в тегах)</label>
              <input type="text" placeholder="React, Node.js" value={techStack} onChange={e => setTechStack(e.target.value)} />
            </div>

            {/* ВИБІР ТЕГІВ З БАЗИ */}
            {dbTags.length > 0 && (
              <div className="input-group">
                <label><TagIcon size={16}/> Вибрати існуючі теги</label>
                <div className="tags-selector">
                  {dbTags.map(tag => (
                    <div 
                      key={tag._id} 
                      className={`tag-pill ${selectedTags.includes(tag._id) ? 'selected' : ''}`}
                      onClick={() => toggleTag(tag._id)}
                      style={{ borderLeftColor: tag.color || '#888' }}
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="links-grid">
              <div className="input-group"><label><LinkIcon size={16}/> GitHub Link</label><input type="url" value={github} onChange={e => setGithub(e.target.value)} /></div>
              <div className="input-group"><label><LinkIcon size={16}/> Live Site Link</label><input type="url" value={live} onChange={e => setLive(e.target.value)} /></div>
            </div>
          </div>

          <div className="glass-panel form-section">
            <h2 className="section-title"><ImageIcon size={18}/> Медіа файли</h2>
            
            <div className="input-group file-upload-group">
              <label>Головне зображення (Main Image) *</label>
              {/* ЗОНА ПРЕВ'Ю КАРТИНКИ */}
              <div className={`file-drop-area ${mainImagePreview ? 'has-image' : ''}`}>
                {mainImagePreview ? (
                  <img src={mainImagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <>
                    <UploadCloud size={30} className="upload-icon" />
                    <p>Натисни, щоб обрати файл</p>
                  </>
                )}
                <input type="file" required accept="image/*" onChange={handleImageChange} />
              </div>
            </div>

            <div className="input-group file-upload-group">
              <label>Галерея (до 10 фото)</label>
              <div className="file-drop-area">
                <UploadCloud size={30} className="upload-icon" />
                <p>{gallery && gallery.length > 0 ? `Обрано файлів: ${gallery.length}` : 'Натисни, щоб обрати файли'}</p>
                <input type="file" multiple accept="image/*" onChange={e => setGallery(e.target.files)} />
              </div>
            </div>
          </div>

        </div>

        <div className="glass-panel form-section full-width">
          <div className="translations-header">
            <h2 className="section-title">Контент та Переклади</h2>
            <div className="language-tabs">
              <button type="button" className={`tab-btn ${activeTab === 'uk' ? 'active' : ''}`} onClick={() => setActiveTab('uk')}>Українська</button>
              <button type="button" className={`tab-btn ${activeTab === 'en' ? 'active' : ''}`} onClick={() => setActiveTab('en')}>English</button>
              <button type="button" className={`tab-btn ${activeTab === 'pl' ? 'active' : ''}`} onClick={() => setActiveTab('pl')}>Polski</button>
            </div>
          </div>
          <div className="translation-content">
            <div className="input-group"><label>Назва ({activeTab.toUpperCase()}) *</label><input type="text" required value={translations[activeTab].title} onChange={e => handleTranslationChange(activeTab, 'title', e.target.value)} /></div>
            <div className="input-group"><label>Короткий опис</label><textarea rows={3} value={translations[activeTab].description} onChange={e => handleTranslationChange(activeTab, 'description', e.target.value)} /></div>
            <div className="input-group"><label>Повний Case Study</label><textarea rows={8} value={translations[activeTab].fullCaseStudy} onChange={e => handleTranslationChange(activeTab, 'fullCaseStudy', e.target.value)} /></div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={loading}>
            <Save size={20} /> {loading ? 'Збереження...' : 'Створити проект'}
          </button>
        </div>
      </form>
    </div>
  );
}