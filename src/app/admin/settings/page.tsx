"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Save, Tag as TagIcon, Plus, Trash2, User, Link as LinkIcon, FileText } from 'lucide-react';
import './AdminSettings.scss';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Стейт Налаштувань (відповідає твоїй моделі Mongoose)
  const [settings, setSettings] = useState({
    email: '',
    phones: [''], // Масив для телефонів
    cvLink: '',
    isLookingForWork: true,
    socials: { github: '', discord: '', telegram: '', instagram: '' },
    systemNote: { text: '', status: 'План розробки' }
  });

  // Стейт для Тегів
  const [tags, setTags] = useState<any[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#b30000');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');
      
      const [settingsRes, tagsRes] = await Promise.all([
        axios.get(`${API_URL}/api/settings`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        axios.get(`${API_URL}/api/tags`).catch(() => null)
      ]);

      if (settingsRes?.data) {
        const data = settingsRes.data;
        setSettings({
          email: data.email || '',
          phones: data.phones && data.phones.length > 0 ? data.phones : [''],
          cvLink: data.cvLink || '',
          isLookingForWork: data.isLookingForWork ?? true,
          socials: {
            github: data.socials?.github || '',
            discord: data.socials?.discord || '',
            telegram: data.socials?.telegram || '',
            instagram: data.socials?.instagram || ''
          },
          systemNote: {
            text: data.systemNote?.text || '',
            status: data.systemNote?.status || 'План розробки'
          }
        });
      }

      if (tagsRes?.data?.success || Array.isArray(tagsRes?.data)) {
        setTags(tagsRes.data.data || tagsRes.data);
      }
    } catch (error) {
      console.error("Помилка завантаження даних:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Функції для телефонів ---
  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...settings.phones];
    newPhones[index] = value;
    setSettings({ ...settings, phones: newPhones });
  };

  const addPhoneField = () => {
    setSettings({ ...settings, phones: [...settings.phones, ''] });
  };

  const removePhoneField = (index: number) => {
    const newPhones = settings.phones.filter((_, i) => i !== index);
    setSettings({ ...settings, phones: newPhones.length ? newPhones : [''] });
  };

  // --- Збереження Налаштувань ---
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');
      
      if (!settings.email) {
        alert("Email є обов'язковим полем!");
        setSaving(false);
        return;
      }

      // Відфільтровуємо порожні інпути телефонів
      const payload = {
        ...settings,
        phones: settings.phones.filter(p => p.trim() !== '') 
      };
      
      await axios.post(`${API_URL}/api/settings`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      alert("Налаштування успішно збережено!");
    } catch (error) {
      console.error("Помилка збереження:", error);
      alert("Не вдалося зберегти налаштування.");
    } finally {
      setSaving(false);
    }
  };

  // --- Управління Тегами ---
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(`${API_URL}/api/tags`, { name: newTagName, color: newTagColor }, { headers: { Authorization: `Bearer ${token}` } });
      setTags([...tags, res.data.data || res.data]);
      setNewTagName(''); 
    } catch (error) { console.error("Помилка створення тегу:", error); }
  };

  const handleDeleteTag = async (id: string) => {
    if (!window.confirm("Видалити цей тег?")) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/api/tags/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTags(tags.filter(t => t._id !== id));
    } catch (error) { console.error("Помилка видалення тегу:", error); }
  };

  if (loading) return <div className="admin-settings-page" style={{padding: '50px', color: '#fff'}}>Завантаження...</div>;

  return (
    <div className="admin-settings-page">
      <div className="settings-header">
        <h1 className="hero-title"><SettingsIcon size={28}/> Налаштування Системи</h1>
        <p className="hero-subtitle">Керуй глобальними параметрами, контактами та соцмережами</p>
      </div>

      <div className="settings-grid">
        
        {/* ЛІВА КОЛОНКА */}
        <div className="column">
          
          <div className="glass-panel settings-card">
            <div className="card-header"><h2><User size={20}/> Контакти та Статус</h2></div>
            
            <div className="input-group">
              <label>Головний Email *</label>
              <input type="email" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} placeholder="you@example.com" required />
            </div>

            <div className="input-group">
              <label>Телефони</label>
              {settings.phones.map((phone, index) => (
                <div key={index} className="phone-row">
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={e => handlePhoneChange(index, e.target.value)} 
                    placeholder="+48..., +380..." 
                  />
                  <button type="button" className="btn-remove" onClick={() => removePhoneField(index)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn-add-phone" onClick={addPhoneField}>
                <Plus size={16} /> Додати ще один номер
              </button>
            </div>

            <div className="input-group">
              <label>Посилання на Резюме (CV)</label>
              <input type="url" value={settings.cvLink} onChange={e => setSettings({...settings, cvLink: e.target.value})} placeholder="https://drive.google.com/..." />
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="workStatus" checked={settings.isLookingForWork} onChange={e => setSettings({...settings, isLookingForWork: e.target.checked})} />
              <label htmlFor="workStatus">Я відкритий до пропозицій роботи (Open to work)</label>
            </div>
          </div>

          <div className="glass-panel settings-card" style={{ marginTop: '25px' }}>
            <div className="card-header"><h2><FileText size={20}/> Системна Нотатка (Дашборд)</h2></div>
            <div className="input-group">
              <textarea rows={3} value={settings.systemNote.text} onChange={e => setSettings({...settings, systemNote: {...settings.systemNote, text: e.target.value}})} placeholder="Текст нотатки..." />
            </div>
            <div className="input-group">
              <select value={settings.systemNote.status} onChange={e => setSettings({...settings, systemNote: {...settings.systemNote, status: e.target.value}})}>
                <option value="План розробки">План розробки</option>
                <option value="В процесі">В процесі</option>
                <option value="Важливо">Важливо</option>
                <option value="Виконано">Виконано</option>
              </select>
            </div>
          </div>

        </div>

        {/* ПРАВА КОЛОНКА */}
        <div className="column">
          
          <div className="glass-panel settings-card">
            <div className="card-header"><h2><LinkIcon size={20}/> Соціальні мережі</h2></div>
            
            <div className="input-group">
              <label>GitHub</label>
              <input type="url" value={settings.socials.github} onChange={e => setSettings({...settings, socials: {...settings.socials, github: e.target.value}})} />
            </div>
            <div className="input-group">
              <label>Telegram</label>
              <input type="url" value={settings.socials.telegram} onChange={e => setSettings({...settings, socials: {...settings.socials, telegram: e.target.value}})} />
            </div>
            <div className="input-group">
              <label>Instagram</label>
              <input type="url" value={settings.socials.instagram} onChange={e => setSettings({...settings, socials: {...settings.socials, instagram: e.target.value}})} />
            </div>
            <div className="input-group">
              <label>Discord</label>
              <input type="text" value={settings.socials.discord} onChange={e => setSettings({...settings, socials: {...settings.socials, discord: e.target.value}})} />
            </div>
          </div>

          <div className="glass-panel settings-card" style={{ marginTop: '25px' }}>
            <div className="card-header"><h2><TagIcon size={20}/> Управління Тегами</h2></div>
            <form className="add-tag-form" onSubmit={handleAddTag}>
              <input type="text" placeholder="Назва (напр. React)" value={newTagName} onChange={e => setNewTagName(e.target.value)} required />
              <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} title="Вибрати колір" />
              <button type="submit" className="add-btn"><Plus size={18}/></button>
            </form>
            <div className="tags-list">
              {tags.map(tag => (
                <div key={tag._id} className="tag-item" style={{ borderLeftColor: tag.color || '#888' }}>
                  <span className="tag-name">{tag.name}</span>
                  <button className="delete-tag-btn" onClick={() => handleDeleteTag(tag._id)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="settings-footer">
        <button className="save-btn" onClick={handleSaveSettings} disabled={saving}>
          <Save size={20} /> {saving ? 'Збереження...' : 'Зберегти всі налаштування'}
        </button>
      </div>

    </div>
  );
}