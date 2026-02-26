"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon, Link as LinkIcon, Code2, FileText, Star, Activity } from 'lucide-react';
import Link from 'next/link';

// ІМПОРТУЄМО СТИЛІ ЗІ СТОРІНКИ СТВОРЕННЯ (щоб не дублювати код)
import '../../../create/AdminCreate.scss';

export default function AdminEditProject() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id; // Отримуємо ID з URL

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'en' | 'uk' | 'pl'>('uk');

  // Дані проекту
  const [slug, setSlug] = useState('');
  const [stage, setStage] = useState('STAGE_1');
  const [techStack, setTechStack] = useState('');
  const [github, setGithub] = useState('');
  const [live, setLive] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Файли
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  
  // Переклади
  const [translations, setTranslations] = useState({
    uk: { title: '', description: '', fullCaseStudy: '' },
    en: { title: '', description: '', fullCaseStudy: '' },
    pl: { title: '', description: '', fullCaseStudy: '' },
  });

  // 1. ЗАВАНТАЖЕННЯ ДАНИХ ПРОЕКТУ
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/projects/${projectId}`);
        const project = res.data.success ? res.data.data : res.data;

        // Заповнюємо стейти даними з бази
        setSlug(project.slug || '');
        setStage(project.stage || 'STAGE_1');
        setIsFeatured(project.isFeatured || false);
        setTechStack(project.techStack ? project.techStack.join(', ') : '');
        setGithub(project.links?.github || '');
        setLive(project.links?.live || '');
        
        // Встановлюємо прев'ю існуючої картинки (якщо вона є)
        if (project.mainImage) {
          setMainImagePreview(project.mainImage);
        }

        if (project.translations) {
          setTranslations({
            uk: { 
              title: project.translations.uk?.title || '', 
              description: project.translations.uk?.description || '', 
              fullCaseStudy: project.translations.uk?.fullCaseStudy || '' 
            },
            en: { 
              title: project.translations.en?.title || '', 
              description: project.translations.en?.description || '', 
              fullCaseStudy: project.translations.en?.fullCaseStudy || '' 
            },
            pl: { 
              title: project.translations.pl?.title || '', 
              description: project.translations.pl?.description || '', 
              fullCaseStudy: project.translations.pl?.fullCaseStudy || '' 
            },
          });
        }
      } catch (error) {
        console.error("Помилка завантаження проекту:", error);
        alert("Не вдалося завантажити проект. Можливо, він був видалений.");
        router.push('/admin/projects');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchProject();
  }, [projectId, router]);

  // Обробка зміни головного фото
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleTranslationChange = (lang: 'en' | 'uk' | 'pl', field: string, value: string) => {
    setTranslations(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
  };

  // 2. ЗБЕРЕЖЕННЯ ЗМІН (ОНОВЛЕННЯ)
 // 2. ЗБЕРЕЖЕННЯ ЗМІН (ОНОВЛЕННЯ)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('adminToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const formData = new FormData();
      formData.append('slug', slug);
      formData.append('stage', stage);
      formData.append('isFeatured', String(isFeatured));
      
      // Твій бекенд (parseTechStack) вміє різати строку по комах, тому просто відправляємо строку!
      formData.append('techStack', techStack);

      // Відправляємо як JSON-рядок (твій safeParse на бекенді це розпарсить!)
      formData.append('links', JSON.stringify({ github, live }));
      formData.append('translations', JSON.stringify(translations));

      // Додаємо нове фото, тільки якщо користувач його вибрав
      if (mainImage) {
        formData.append('mainImage', mainImage);
      }

      // Зверни увагу: тут метод PATCH
      await axios.patch(`${API_URL}/api/projects/${projectId}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data' 
        }
      });

      alert("Проект успішно оновлено!");
      router.push('/admin/projects');
    } catch (error: any) {
      console.error("Помилка оновлення:", error);
      alert(error.response?.data?.message || "Помилка при збереженні.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-create-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Activity size={40} color="#b30000" style={{ animation: 'spin 2s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="admin-create-page">
      <div className="create-header">
        <Link href="/admin/projects" className="back-btn"><ArrowLeft size={20} /> Назад</Link>
        <div className="title-row">
          <h1 className="hero-title">Редагувати проект</h1>
          
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
              <label><Code2 size={16}/> Технології (через кому)</label>
              <input type="text" value={techStack} onChange={e => setTechStack(e.target.value)} />
            </div>

            <div className="links-grid">
              <div className="input-group"><label><LinkIcon size={16}/> GitHub Link</label><input type="url" value={github} onChange={e => setGithub(e.target.value)} /></div>
              <div className="input-group"><label><LinkIcon size={16}/> Live Site Link</label><input type="url" value={live} onChange={e => setLive(e.target.value)} /></div>
            </div>
          </div>

          <div className="glass-panel form-section">
            <h2 className="section-title"><ImageIcon size={18}/> Головне зображення</h2>
            
            <div className="input-group file-upload-group">
              <label>Завантажити нове (замінить старе)</label>
              <div className={`file-drop-area ${mainImagePreview ? 'has-image' : ''}`}>
                {mainImagePreview ? (
                  <img src={mainImagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <>
                    <UploadCloud size={30} className="upload-icon" />
                    <p>Натисни, щоб обрати файл</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>
            </div>
            
            {/* Галерею поки що приховуємо для редагування, щоб не ускладнювати бекенд */}
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '15px' }}>
              * Щоб змінити галерею, краще видалити проект і створити наново, або додати окремий ендпоінт на бекенді.
            </p>
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
          <button type="submit" className="save-btn" disabled={saving}>
            <Save size={20} /> {saving ? 'Оновлення...' : 'Зберегти зміни'}
          </button>
        </div>
      </form>
    </div>
  );
}