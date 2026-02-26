"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MailOpen, Trash2, Clock, CheckCircle2, Phone, Mail, Search, CheckSquare, Square, AlertTriangle, X } from 'lucide-react';
import './AdminMessages.scss';

interface Message {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: string;
  createdAt: string;
}

// Тип для нашого кастомного модального вікна
interface ModalConfig {
  isOpen: boolean;
  title: string;
  text: string;
  type: 'danger' | 'info';
  onConfirm: () => void;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Фільтри та пошук
  const [filter, setFilter] = useState<'all' | 'new'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Масові дії
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Кастомна Модалка
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false, title: '', text: '', type: 'info', onConfirm: () => {}
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/api/messages`, { headers: { Authorization: `Bearer ${token}` }});
      
      const data = res.data.success ? res.data.data : res.data;
      const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
      setMessages(sorted);
    } catch (error) {
      console.error("Помилка завантаження повідомлень:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ЛОГІКА ДІЙ ---

  const executeMarkAsRead = async (ids: string[]) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');
      
      // Відправляємо запити паралельно для всіх вибраних ID
      await Promise.all(ids.map(id => 
        axios.patch(`${API_URL}/api/messages/${id}`, { status: 'read' }, { headers: { Authorization: `Bearer ${token}` }})
      ));

      setMessages(prev => prev.map(msg => ids.includes(msg._id) ? { ...msg, status: 'read' } : msg));
      setSelectedIds([]); // Очищаємо вибір
      closeModal();
    } catch (error) {
      console.error("Помилка оновлення статусу:", error);
    }
  };

  const executeDelete = async (ids: string[]) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');
      
      await Promise.all(ids.map(id => 
        axios.delete(`${API_URL}/api/messages/${id}`, { headers: { Authorization: `Bearer ${token}` }})
      ));

      setMessages(prev => prev.filter(msg => !ids.includes(msg._id)));
      setSelectedIds([]);
      closeModal();
    } catch (error) {
      console.error("Помилка видалення:", error);
    }
  };

  // --- ВИКЛИКИ МОДАЛОК ---

  const confirmDelete = (id: string) => {
    setModal({
      isOpen: true, type: 'danger',
      title: 'Видалити повідомлення?',
      text: 'Ця дія незворотня. Повідомлення буде видалено з бази даних.',
      onConfirm: () => executeDelete([id])
    });
  };

  const confirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setModal({
      isOpen: true, type: 'danger',
      title: `Видалити ${selectedIds.length} повідомлень?`,
      text: 'Ці повідомлення будуть назавжди видалені з вашої бази даних.',
      onConfirm: () => executeDelete(selectedIds)
    });
  };

  const confirmBulkRead = () => {
    if (selectedIds.length === 0) return;
    executeMarkAsRead(selectedIds); // Для прочитання модалку можна не показувати, або додати за бажанням
  };

  const closeModal = () => setModal({ ...modal, isOpen: false });

  // --- ЛОГІКА ВИБОРУ (CHECKBOXES) ---

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Фільтрація та пошук
  const filteredMessages = messages.filter(m => {
    const matchesFilter = filter === 'all' || m.status === filter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(searchLower) || 
                          m.email.toLowerCase().includes(searchLower) || 
                          m.message.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMessages.length) {
      setSelectedIds([]); // Зняти всі
    } else {
      setSelectedIds(filteredMessages.map(m => m._id)); // Вибрати всі відфільтровані
    }
  };

  const unreadCount = messages.filter(m => m.status === 'new').length;

  return (
    <div className="admin-messages-page">
      
      {/* --- КАСТОМНА МОДАЛКА --- */}
      {modal.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <button className="close-modal" onClick={closeModal}><X size={20}/></button>
            <div className={`modal-icon ${modal.type}`}>
              <AlertTriangle size={30} />
            </div>
            <h3>{modal.title}</h3>
            <p>{modal.text}</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeModal}>Скасувати</button>
              <button className={`btn-confirm ${modal.type}`} onClick={modal.onConfirm}>Підтвердити</button>
            </div>
          </div>
        </div>
      )}

      <div className="messages-header">
        <div>
          <h1 className="hero-title">Повідомлення</h1>
          <p className="hero-subtitle">Управління вхідними заявками</p>
        </div>
        
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Шукати за ім'ям, email або текстом..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="messages-filter">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              Всі ({messages.length})
            </button>
            <button className={`filter-btn ${filter === 'new' ? 'active' : ''}`} onClick={() => setFilter('new')}>
              Нові {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* ПАНЕЛЬ МАСОВИХ ДІЙ (з'являється тільки якщо щось вибрано) */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions-panel glass-panel">
          <div className="selected-info">
            <span className="count">{selectedIds.length}</span> повідомлень вибрано
          </div>
          <div className="bulk-buttons">
            <button className="bulk-btn read" onClick={confirmBulkRead}>
              <MailOpen size={16}/> Позначити як прочитані
            </button>
            <button className="bulk-btn delete" onClick={confirmBulkDelete}>
              <Trash2 size={16}/> Видалити вибрані
            </button>
          </div>
        </div>
      )}

      <div className="messages-container">
        
        {/* Кнопка "Вибрати всі" */}
        {filteredMessages.length > 0 && (
          <div className="select-all-wrapper">
            <button className="select-all-btn" onClick={toggleSelectAll}>
              {selectedIds.length === filteredMessages.length ? <CheckSquare size={18} className="checked"/> : <Square size={18}/>}
              <span>Вибрати всі</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="glass-panel empty-state">Завантаження...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="glass-panel empty-state">
            <CheckCircle2 size={40} className="success-icon" />
            <h3>Нічого не знайдено</h3>
            <p>{searchQuery ? 'За вашим запитом немає повідомлень.' : 'Ви відповіли на всі вхідні заявки.'}</p>
          </div>
        ) : (
          <div className="messages-grid">
            {filteredMessages.map((msg) => (
              <div key={msg._id} className={`glass-panel message-card ${msg.status === 'new' ? 'unread' : ''} ${selectedIds.includes(msg._id) ? 'selected' : ''}`}>
                
                {/* ЧЕКБОКС ВИБОРУ */}
                <div className="card-checkbox" onClick={() => toggleSelect(msg._id)}>
                   {selectedIds.includes(msg._id) ? <CheckSquare size={20} className="checked"/> : <Square size={20}/>}
                </div>

                {msg.status === 'new' && <div className="unread-dot"></div>}
                
                <div className="msg-top">
                  <div className="sender-info">
                    <div className="avatar">{msg.name.charAt(0).toUpperCase()}</div>
                    <div className="sender-contacts">
                      <h3 className="sender-name">{msg.name}</h3>
                      <div className="contact-links">
                        <a href={`mailto:${msg.email}`} className="sender-contact"><Mail size={12}/> {msg.email}</a>
                        {msg.phone && <a href={`tel:${msg.phone}`} className="sender-contact"><Phone size={12}/> {msg.phone}</a>}
                      </div>
                    </div>
                  </div>
                  <div className="msg-date">
                    <Clock size={14} />
                    {new Date(msg.createdAt).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' })}
                  </div>
                </div>

                <div className="msg-body">
                  <p>{msg.message}</p>
                </div>

                <div className="msg-actions">
                  {msg.status === 'new' ? (
                    <button className="action-btn mark-read" onClick={() => executeMarkAsRead([msg._id])}>
                      <MailOpen size={16} /> Прочитати
                    </button>
                  ) : (
                    <span className="status-read"><CheckCircle2 size={16}/> Переглянуто</span>
                  )}
                  
                  <button className="action-btn delete" onClick={() => confirmDelete(msg._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}