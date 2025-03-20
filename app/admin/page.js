'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

// Common CSS classes
const cls = {
  icon: "w-6 h-6 text-sky-600",
  statCard: "bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden h-24 flex flex-col",
  statHeader: "bg-gray-50 px-3 py-2 border-b border-gray-200",
  statLabel: "text-sm font-medium text-gray-500 uppercase",
  statValue: "text-2xl font-semibold text-gray-900",
  iconContainer: "bg-gray-50 rounded-full p-3 mr-4 flex-shrink-0"
};

// SVG paths for icons - more compact representation
const svgPaths = {
  territory: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  publishers: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  announcements: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
  services: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
};

// Icon creator function
const createIcon = path => (
  <svg className={cls.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

// 관리자 메뉴 아이템 컴포넌트
const AdminMenuItem = ({ title, description, icon, link }) => (
  <Link href={link}>
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border-l-4 border-sky-500 h-full flex items-center">
      <div className="flex items-center">
        <div className={cls.iconContainer}>{icon}</div>
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
  // Menu items with icon paths
  const menuItems = [
    {title: "Territorios", description: "Administrar territorios, asignar capitanes y ver progreso", path: svgPaths.territory, link: "/admin/territory"},
    {title: "Publicadores", description: "Gestionar publicadores, privilegios y grupos", path: svgPaths.publishers, link: "/admin/publicadores"},
    {title: "Anuncios", description: "Publicar y gestionar anuncios y grupos de limpieza", path: svgPaths.announcements, link: "/admin/anuncio"},
    {title: "Servicios", description: "Administrar horarios de servicio y voluntarios", path: svgPaths.services, link: "/admin/service"},
    {title: "Configuración", description: "Ajustes del sitio, copias de seguridad y más", path: svgPaths.settings, link: "/admin/configuracion"}
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
              icon={createIcon(item.path)} 
            />
          ))}
        </div>
      </div>
    </Layout>
  );
} 