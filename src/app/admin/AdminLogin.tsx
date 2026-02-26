"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Lock, User, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void; 
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });

      if (res.data.token) {
        // ЗБЕРІГАЄМО ТОКЕН ТА ІМ'Я
        localStorage.setItem('adminToken', res.data.token);
        if (res.data.name) {
          localStorage.setItem('adminName', res.data.name);
        }
        
        onSuccess(); 
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка доступу. Перевірте дані.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-glow glow-1"></div>
      <div className="admin-glow glow-2"></div>
      
      <div className="login-glass-panel">
        <div className="login-header">
          <div className="logo-icon">V</div>
          <h2>Admin.Access</h2>
          <p>Введіть секретні дані для доступу</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="error-message">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="input-group">
            <User className="input-icon" size={18} />
            <input 
              type="email" 
              placeholder="Admin Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Перевірка...' : 'Увійти в систему'}
          </button>
        </form>
      </div>
    </div>
  );
}