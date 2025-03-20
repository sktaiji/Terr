'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import Layout from '../components/Layout';

// 관리 카드 컴포넌트
const AdminCard = ({ title, description, icon, href }) => {
  return (
    <Link 
      href={href} 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-0">
        <div className="bg-sky-500 p-2 text-white">
          <div className="p-2 flex items-center">
            <div className="bg-white p-3 rounded-full text-sky-600 mr-4">
              {icon}
            </div>
            <div>
              <h3 className="font-medium text-lg text-white">{title}</h3>
              <p className="text-white/80 text-sm">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// 통계 카드 컴포넌트
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

// 관리자 메뉴 아이템 컴포넌트
const AdminMenuItem = ({ title, description, icon, link, color }) => {
  return (
    <Link href={link}>
      <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border-l-4 ${color} h-full flex items-center`}>
        <div className="flex items-center">
          <div className="bg-gray-50 rounded-full p-3 mr-4 flex-shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-lg mb-1">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

// 통계 요약 컴포넌트
const StatsSummary = () => {
  const [stats, setStats] = useState({
    territories: 0,
    publishers: 0,
    notices: 0,
    completedTerritories: 0
  });
  
  useEffect(() => {
    // 데이터 로드 및 통계 계산
    const territories = JSON.parse(localStorage.getItem('territories') || '[]');
    const publishers = JSON.parse(localStorage.getItem('publishers') || '[]');
    const notices = JSON.parse(localStorage.getItem('notices') || '[]');
    
    // 완료된 구역 수 계산
    const completedTerritories = territories.filter(t => t.status === 'completado').length;
    
    setStats({
      territories: territories.length,
      publishers: publishers.length,
      notices: notices.length,
      completedTerritories
    });
  }, []);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden h-24 flex flex-col">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-500 uppercase">Territorios</div>
        </div>
        <div className="px-3 py-2 flex-grow flex items-center">
          <div className="text-2xl font-semibold text-gray-900">{stats.territories}</div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden h-24 flex flex-col">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-500 uppercase">Publicadores</div>
        </div>
        <div className="px-3 py-2 flex-grow flex items-center">
          <div className="text-2xl font-semibold text-gray-900">{stats.publishers}</div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden h-24 flex flex-col">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-500 uppercase">Anuncios</div>
        </div>
        <div className="px-3 py-2 flex-grow flex items-center">
          <div className="text-2xl font-semibold text-gray-900">{stats.notices}</div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden h-24 flex flex-col">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-500 uppercase">Completados</div>
        </div>
        <div className="px-3 py-2 flex-grow flex items-center">
          <div className="text-2xl font-semibold text-gray-900">{stats.completedTerritories}</div>
        </div>
      </div>
    </div>
  );
};

export default function AdminPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
        </div>
        
        {/* 통계 요약 */}
        <div className="mb-6">
          <StatsSummary />
        </div>
        
        {/* 관리자 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <AdminMenuItem 
            title="Territorios" 
            description="Administrar territorios, asignar capitanes y ver progreso" 
            icon={<svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
            link="/admin/territory"
            color="border-sky-500"
          />
          
          <AdminMenuItem 
            title="Publicadores" 
            description="Gestionar publicadores, privilegios y grupos" 
            icon={<svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            link="/admin/publicadores"
            color="border-sky-500"
          />
          
          <AdminMenuItem 
            title="Anuncios" 
            description="Publicar y gestionar anuncios y grupos de limpieza" 
            icon={<svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>}
            link="/admin/anuncio"
            color="border-sky-500"
          />
          
          <AdminMenuItem 
            title="Servicios" 
            description="Administrar horarios de servicio y voluntarios" 
            icon={<svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            link="/admin/service"
            color="border-sky-500"
          />
          
          <AdminMenuItem 
            title="Configuración" 
            description="Ajustes del sitio, copias de seguridad y más" 
            icon={<svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            link="/admin/configuracion"
            color="border-sky-500"
          />
        </div>
      </div>
    </Layout>
  );
} 