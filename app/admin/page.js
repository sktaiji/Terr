'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 관리 카드 컴포넌트
const AdminCard = ({ title, description, icon, href }) => {
  return (
    <Link 
      href={href} 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-lg text-gray-900">{title}</h3>
            <p className="text-gray-500 text-sm">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState({
    recentApplications: 0,
    scheduledEvents: 0,
    volunteerHours: 0,
    unprocessedDocs: 0
  });
  
  // 로컬 스토리지에서 데이터를 불러와 요약 정보 업데이트
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 공지사항 불러오기
      const notices = JSON.parse(localStorage.getItem('notices') || '[]');
      
      // 봉사 일정 불러오기
      const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      
      // PDF 파일 불러오기
      const pdfFiles = JSON.parse(localStorage.getItem('pdfFiles') || '[]');
      
      // 현재 날짜
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      // 오늘 신청한 봉사자 수 집계
      let recentApplications = 0;
      
      // 이번 주 봉사 일정 집계
      const scheduledEvents = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate >= today && scheduleDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      }).length;
      
      // 이번 달 총 봉사 시간 (예상치)
      const volunteerHours = schedules.length * 2; // 한 일정당 평균 2시간으로 가정
      
      // 미처리된 구역 문서 (시작 전 상태인 문서)
      const unprocessedDocs = pdfFiles.filter(file => file.status === '시작전').length;
      
      setSummary({
        recentApplications,
        scheduledEvents,
        volunteerHours,
        unprocessedDocs
      });
    }
  }, []);
  
  const adminMenuItems = [
    {
      id: 'dashboard',
      title: 'Panel de Control',
      description: 'Información general y estadísticas',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      href: '/admin'
    },
    {
      id: 'schedule',
      title: 'Gestión de Horarios',
      description: 'Registrar, modificar y eliminar horarios',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: '/admin/schedule'
    },
    {
      id: 'area',
      title: 'Gestión de Territorios',
      description: 'Documentos y estado de territorios',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      href: '/admin/area'
    },
    {
      id: 'members',
      title: 'Gestión de Voluntarios',
      description: 'Lista y actividades de voluntarios',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      href: '/admin/members'
    },
    {
      id: 'notices',
      title: 'Gestión de Anuncios',
      description: 'Crear y administrar anuncios',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      href: '/admin/notices'
    },
    {
      id: 'settings',
      title: 'Configuración',
      description: 'Configuración del sistema',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: '/admin/settings'
    }
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Página de Administración</h1>
        <Link 
          href="/"
          className="text-sm text-blue-600 hover:underline"
        >
          Volver al Inicio
        </Link>
      </div>
      
      {/* 관리 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {adminMenuItems.map(item => (
          <AdminCard
            key={item.id}
            title={item.title}
            description={item.description}
            icon={item.icon}
            href={item.href}
          />
        ))}
      </div>
      
      {/* 최근 활동 요약 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Resumen de Actividades Recientes</h2>
        <div className="space-y-4">
          <div className="border-b pb-3">
            <p className="text-sm text-gray-600">Solicitudes de servicio hoy: <span className="font-medium text-blue-600">{summary.recentApplications} personas</span></p>
          </div>
          <div className="border-b pb-3">
            <p className="text-sm text-gray-600">Horarios de servicio esta semana: <span className="font-medium text-blue-600">{summary.scheduledEvents} eventos</span></p>
          </div>
          <div className="border-b pb-3">
            <p className="text-sm text-gray-600">Total de horas de servicio este mes: <span className="font-medium text-blue-600">{summary.volunteerHours} horas</span></p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Documentos de territorio pendientes: <span className="font-medium text-red-600">{summary.unprocessedDocs} documentos</span></p>
          </div>
        </div>
      </div>
      
      {/* 공지사항 관리 버튼 */}
      <div className="flex justify-end">
        <Link 
          href="/admin/notices" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Crear Anuncio
        </Link>
      </div>
    </div>
  );
} 