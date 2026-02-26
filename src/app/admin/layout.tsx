"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderKanban, PlusSquare, MessageSquare, Settings, LogOut, Search, Bell } from 'lucide-react';
import AdminLogin from './AdminLogin'; 
import { UserPlus } from 'lucide-react';
import './AdminLayout.scss';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const name = localStorage.getItem('adminName');
    
    if (token) {
      setIsAuthenticated(true);
      if (name) setAdminName(name);
    }
    setIsChecking(false); 
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    setIsAuthenticated(false);
    router.push('/admin'); 
  };

  if (isChecking) return <div className="admin-bg-dark" style={{ height: '100vh', background: '#050608' }} />;

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => {
      const newName = localStorage.getItem('adminName');
      if (newName) setAdminName(newName);
      setIsAuthenticated(true);
    }} />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Всі проекти', path: '/admin/projects', icon: FolderKanban },
    { name: 'Створити', path: '/admin/create', icon: PlusSquare },
    { name: 'Повідомлення', path: '/admin/messages', icon: MessageSquare },
    { name: 'Додати адміна', path: '/admin/register', icon: UserPlus },
  ];

  // Получаем текущее название страницы для хлебных крошек
  const currentNav = navItems.find(item => pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/admin'))?.name || 'Dashboard';

  return (
    <div className="admin-layout">
      <div className="admin-glow glow-1"></div>
      <div className="admin-glow glow-2"></div>

      {/* ЛЕВЫЙ САЙДБАР КАК НА СКРИНЕ */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          {/* Иконка логотипа в стиле G.TAKE */}
          <span className="logo-icon">X</span>
          <h2>A.PANEL</h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/admin');
            const Icon = item.icon;
            return (
              <Link href={item.path} key={item.name} className={`nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <Link href="/admin/settings" className="nav-item" style={{display: 'flex', gap: '15px', padding: '14px 20px', color: '#6b7280', textDecoration: 'none', fontWeight: 600}}>
             <Settings size={20} /> Налаштування
          </Link>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Вийти</span>
          </button>
        </div>
      </aside>

      {/* ПРАВАЯ ЧАСТЬ ЭКРАНА */}
      <div className="admin-main-wrapper">
        
        {/* ВЕРХНЯЯ ШАПКА КАК НА СКРИНЕ */}
        <header className="admin-topbar">
          <div className="topbar-breadcrumbs">
            Home / <span className="current">{currentNav}</span>
          </div>

          <div className="topbar-profile">
            <span className="profile-name">{adminName}</span>
            <div className="profile-avatar">
              {adminName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* СЮДА БУДУТ ПОДГРУЖАТЬСЯ КАРТОЧКИ СТРАНИЦ */}
        <main className="admin-content">
          {children}
        </main>
      </div>

    </div>
  );
}