'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import Icon from '../../components/Icon';

// Common CSS classes
const cls = {
  statCard: "bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden h-24 flex flex-col",
  statHeader: "bg-gray-50 px-3 py-2 border-b border-gray-200",
  statLabel: "text-sm font-medium text-gray-500 uppercase",
  statValue: "text-2xl font-semibold text-gray-900",
  iconContainer: "bg-gray-50 rounded-full p-3 mr-4 flex-shrink-0"
};

// 관리자 메뉴 아이템 컴포넌트
const AdminMenuItem = ({ title, description, iconName, link }) => (
  <Link href={link}>
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border-l-4 border-sky-500 h-full flex items-center">
      <div className="flex items-center">
        <div className={cls.iconContainer}>
          <Icon name={iconName} className="w-6 h-6 text-sky-600" />
        </div>
        <div>
          <h3 className="font-medium text-lg mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </div>
  </Link>
);

// 통계 요약 컴포넌트
const StatsSummary = () => {
  const [stats, setStats] = useState({
    territories: 0, publishers: 0, notices: 0, completedTerritories: 0
  });
  
  useEffect(() => {
    const getItem = key => JSON.parse(localStorage.getItem(key) || '[]');
    const territories = getItem('territories');
    const publishers = getItem('publishers');
    const notices = getItem('notices');
    
    setStats({
      territories: territories.length,
      publishers: publishers.length,
      notices: notices.length,
      completedTerritories: territories.filter(t => t.status === 'completado').length
    });
  }, []);
  
  const statItems = [
    { label: 'Territorios', value: stats.territories },
    { label: 'Publicadores', value: stats.publishers },
    { label: 'Anuncios', value: stats.notices },
    { label: 'Completados', value: stats.completedTerritories }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statItems.map(({label, value}, i) => (
        <div key={i} className={cls.statCard}>
          <div className={cls.statHeader}>
            <div className={cls.statLabel}>{label}</div>
          </div>
          <div className="px-3 py-2 flex-grow flex items-center">
            <div className={cls.statValue}>{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AdminPage() {
  // Menu items with icon names
  const menuItems = [
    {title: "Territorios", description: "Administrar territorios, asignar capitanes y ver progreso", iconName: "territory", link: "/admin/territory"},
    {title: "Publicadores", description: "Gestionar publicadores, privilegios y grupos", iconName: "publishers", link: "/admin/publicadores"},
    {title: "Anuncios", description: "Publicar y gestionar anuncios y grupos de limpieza", iconName: "announcements", link: "/admin/anuncio"},
    {title: "Servicios", description: "Administrar horarios de servicio y voluntarios", iconName: "services", link: "/admin/service"},
    {title: "Configuración", description: "Ajustes del sitio, copias de seguridad y más", iconName: "settings", link: "/admin/configuracion"}
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
        </div>
        <div className="mb-6"><StatsSummary /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {menuItems.map((item, i) => (
            <AdminMenuItem 
              key={i} 
              {...item}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
} 