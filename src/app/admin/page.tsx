"use client";
import React, { useState, useEffect } from 'react';
import { Activity, FolderKanban, MessageSquare, Eye, ArrowUpRight, Plus, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import './AdminDashboard.scss';

export default function AdminDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [noteData, setNoteData] = useState({ text: 'Завантаження...', status: '...' });
  const [backendStatus, setBackendStatus] = useState<'Checking' | 'Online' | 'Offline'>('Checking');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('adminToken');
        
        // Робимо 3 запити одночасно: Проекти, Повідомлення, Налаштування
        const [projRes, msgRes, setRes] = await Promise.all([
          axios.get(`${API_URL}/api/projects`),
          axios.get(`${API_URL}/api/messages`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
          axios.get(`${API_URL}/api/settings`).catch(() => null)
        ]);
        
        // 1. Проекти
        const projData = projRes.data.success ? projRes.data.data : projRes.data;
        setProjects(Array.isArray(projData) ? projData : []);
        
        // 2. Повідомлення (рахуємо тільки статус 'new')
        if (msgRes?.data) {
          const msgs = msgRes.data.success ? msgRes.data.data : msgRes.data;
          const unread = Array.isArray(msgs) ? msgs.filter(m => m.status === 'new').length : 0;
          setNewMessagesCount(unread);
        }

        // 3. Системна нотатка
        if (setRes?.data?.systemNote) {
          setNoteData(setRes.data.systemNote);
        } else {
          setNoteData({ text: 'Нотатка порожня. Заповніть її в налаштуваннях.', status: 'Інфо' });
        }

        setBackendStatus('Online');
      } catch (error) {
        console.error("Помилка завантаження даних Дашборду:", error);
        setBackendStatus('Offline');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Динамічна статистика
  const stats = [
    { title: 'Всього проектів', value: loading ? '...' : projects.length.toString(), icon: FolderKanban, color: '#8b0000', trend: 'У базі даних' },
    { title: 'Перегляди сайту', value: '...', icon: Eye, color: '#4a90e2', trend: 'Скоро додамо' }, // <--- Тут потім підключимо лічильник
    { title: 'Нові повідомлення', value: loading ? '...' : newMessagesCount.toString(), icon: MessageSquare, color: newMessagesCount > 0 ? '#f39c12' : '#2ecc71', trend: newMessagesCount > 0 ? 'Потребують відповіді' : 'Все прочитано' },
  ];

  const recentProjects = projects.slice(0, 3);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div><h1 className="hero-title">Контроль Панель</h1><p className="hero-subtitle">Керуй своїм портфоліо та відслідковуй статистику.</p></div>
        <Link href="/admin/create" className="new-task-btn"><Plus size={20} /><span>Новий проект</span></Link>
      </div>

      <div className="dashboard-grid">
        <div className="main-column">
          <div className="stats-row">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="glass-card stat-card">
                  <div className="stat-header">
                    <div className="icon-wrapper" style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.05), transparent)` }}><Icon size={24} color={stat.color} /></div>
                    <ArrowUpRight size={20} className="trend-icon" />
                  </div>
                  <div className="stat-info">
                    <h3>{stat.value}</h3><p>{stat.title}</p><span className="trend-text" style={{ color: stat.color }}>{stat.trend}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-card recent-card">
            <div className="card-header"><h2>Останні проекти</h2></div>
            <div className="recent-list">
              {recentProjects.map(project => (
                  <div key={project._id} className="recent-item">
                    <div className="item-icon" style={{ background: 'rgba(139, 0, 0, 0.2)', color: '#b30000' }}>
                      {project.techStack && project.techStack[0] ? project.techStack[0].substring(0, 2).toUpperCase() : 'PR'}
                    </div>
                    <div className="item-details">
                      <h4>{project.translations?.en?.title || project.translations?.uk?.title || 'Без назви'}</h4>
                      <p>{project.techStack?.join(', ') || 'Технології не вказані'}</p>
                    </div>
                    <div className={`item-status ${project.stage === 'STAGE_3' ? 'completed' : 'in-progress'}`}>
                      {project.stage ? project.stage.replace('_', ' ') : 'STAGE 1'}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="side-column">
          {/* СИСТЕМНА НОТАТКА ОЖИЛА! */}
          <div className="glass-card widget-card highlight-card">
            <div className="card-header">
              <h2>Системна Нотатка</h2>
              <Link href="/admin/settings" className="icon-btn"><Plus size={18} /></Link>
            </div>
            <div className="note-content">
              <p>{noteData.text}</p>
              <div className="note-meta">
                <span>Статус</span>
                <button className="action-pill">{noteData.status}</button>
              </div>
            </div>
          </div>

          <div className="glass-card widget-card">
            <div className="card-header"><h2>Статус Системи</h2></div>
            <div className="system-status">
              <div className="status-row"><span>Backend API</span><span className={`status-indicator online`}>Online</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}