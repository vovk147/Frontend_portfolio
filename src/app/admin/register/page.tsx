"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, Mail, Lock, User, ShieldCheck } from 'lucide-react';

export default function AdminRegister() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Паролі не співпадають!' });
      return;
    }

    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken'); // Беремо токен поточного адміна
      
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      }, {
        headers: { Authorization: `Bearer ${token}` } // Відправляємо токен для підтвердження прав
      });

      setMessage({ type: 'success', text: `Супер! Адміністратора ${res.data.name} успішно створено.` });
      setFormData({ name: '', email: '', password: '', confirmPassword: '' }); // Очищаємо форму
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Помилка створення адміністратора' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-page" style={{ paddingBottom: '50px' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
          <ShieldCheck size={32} color="#b30000" /> Команда Адмінів
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0 }}>
          Створити новий обліковий запис для доступу до панелі управління.
        </p>
      </div>

      <div style={{ background: 'rgba(15, 17, 26, 0.6)', backdropFilter: 'blur(25px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '40px', maxWidth: '600px', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
        
        {message.text && (
          <div style={{ background: message.type === 'error' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(46, 204, 113, 0.1)', color: message.type === 'error' ? '#ff4d4d' : '#2ecc71', padding: '15px', borderRadius: '12px', marginBottom: '25px', textAlign: 'center', fontWeight: 600 }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontWeight: 600, fontSize: '0.85rem' }}>Ім'я нового адміна</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '14px 14px 14px 45px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', boxSizing: 'border-box' }} placeholder="Наприклад: Влад" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontWeight: 600, fontSize: '0.85rem' }}>Email доступу</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '14px 14px 14px 45px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', boxSizing: 'border-box' }} placeholder="admin@example.com" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontWeight: 600, fontSize: '0.85rem' }}>Пароль</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '14px 14px 14px 45px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', boxSizing: 'border-box' }} placeholder="••••••••" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontWeight: 600, fontSize: '0.85rem' }}>Підтвердіть пароль</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input type="password" required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} style={{ width: '100%', padding: '14px 14px 14px 45px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', boxSizing: 'border-box' }} placeholder="••••••••" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #b30000, #8b0000)', color: '#fff', padding: '16px', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer', marginTop: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(139,0,0,0.3)', transition: '0.3s' }}>
            <UserPlus size={20} />
            {loading ? 'Створення...' : 'Зареєструвати адміністратора'}
          </button>
        </form>
      </div>
    </div>
  );
}