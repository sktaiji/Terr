'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';

// 백업 및 복원 컴포넌트
const BackupRestore = () => {
  // 모든 데이터 가져오기
  const getData = () => {
    const data = {
      territories: JSON.parse(localStorage.getItem('territories') || '[]'),
      publishers: JSON.parse(localStorage.getItem('publishers') || '[]'),
      notices: JSON.parse(localStorage.getItem('notices') || '[]'),
      cleaningGroups: JSON.parse(localStorage.getItem('cleaningGroups') || '[]'),
      settings: JSON.parse(localStorage.getItem('settings') || '{}')
    };
    return data;
  };
  
  // 백업 데이터 다운로드
  const handleBackup = () => {
    const data = getData();
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // 데이터 복원
  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // 데이터 유효성 검사
        if (!data.territories || !data.publishers || !data.notices || !data.cleaningGroups) {
          alert('El archivo de copia de seguridad no es válido o está dañado.');
          return;
        }
        
        // 확인 요청
        if (window.confirm('¿Está seguro de que desea restaurar los datos? Todos los datos actuales serán reemplazados.')) {
          // 로컬 스토리지에 데이터 저장
          localStorage.setItem('territories', JSON.stringify(data.territories));
          localStorage.setItem('publishers', JSON.stringify(data.publishers));
          localStorage.setItem('notices', JSON.stringify(data.notices));
          localStorage.setItem('cleaningGroups', JSON.stringify(data.cleaningGroups));
          if (data.settings) {
            localStorage.setItem('settings', JSON.stringify(data.settings));
          }
          
          alert('Los datos se han restaurado con éxito. La página se actualizará.');
          window.location.reload();
        }
      } catch (error) {
        alert('Error al restaurar los datos: ' + error.message);
      }
    };
    reader.readAsText(file);
  };
  
  // 모든 데이터 삭제
  const handleClear = () => {
    if (window.confirm('¿Está seguro de que desea eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
      if (window.confirm('¡ADVERTENCIA! Todos los datos de territorios, publicadores, anuncios y configuraciones se eliminarán permanentemente. ¿Continuar?')) {
        localStorage.removeItem('territories');
        localStorage.removeItem('publishers');
        localStorage.removeItem('notices');
        localStorage.removeItem('cleaningGroups');
        localStorage.removeItem('settings');
        
        alert('Todos los datos han sido eliminados. La página se actualizará.');
        window.location.reload();
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-medium mb-3">Copia de Seguridad y Restauración</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Haga una copia de seguridad de todos los datos (territorios, publicadores, anuncios y configuraciones) en un archivo JSON.
          </p>
          <button
            onClick={handleBackup}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Descargar Copia de Seguridad
          </button>
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-600 mb-2">
            Restaure los datos desde una copia de seguridad JSON previamente guardada.
          </p>
          <div>
            <label 
              htmlFor="restore-file" 
              className="cursor-pointer inline-block px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Restaurar desde Archivo
            </label>
            <input 
              type="file" 
              id="restore-file" 
              accept=".json" 
              onChange={handleRestore} 
              className="hidden" 
            />
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-600 mb-2">
            Elimine todos los datos y restablezca la aplicación a su estado inicial.
          </p>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Eliminar Todos los Datos
          </button>
        </div>
      </div>
    </div>
  );
};

// 웹사이트 설정 컴포넌트
const WebsiteSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Voluntarios JW',
    congregationName: '',
    welcomeMessage: '¡Bienvenido a nuestra plataforma de voluntarios!',
    primaryColor: '#0ea5e9', // sky-500
    showWeeklyService: true,
    enableRegistration: true,
    requireApproval: true,
    enableNotifications: false,
    contactEmail: '',
    logo: ''
  });
  
  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('settings') || '{}');
    setSettings(prev => ({ ...prev, ...savedSettings }));
  }, []);
  
  // 설정 저장하기
  const saveSettings = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('La configuración se ha guardado correctamente.');
  };
  
  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-medium mb-3">Configuración General</h3>
      
      <form onSubmit={(e) => { e.preventDefault(); saveSettings(); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Sitio
            </label>
            <input 
              type="text"
              name="siteName"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={settings.siteName}
              onChange={handleChange}
              placeholder="Nombre del sitio web"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Congregación
            </label>
            <input 
              type="text"
              name="congregationName"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={settings.congregationName}
              onChange={handleChange}
              placeholder="Nombre de la congregación (opcional)"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje de Bienvenida
          </label>
          <textarea 
            name="welcomeMessage"
            rows="2"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            value={settings.welcomeMessage}
            onChange={handleChange}
            placeholder="Mensaje de bienvenida para la página principal"
          ></textarea>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color Primario
            </label>
            <div className="flex items-center">
              <input 
                type="color"
                name="primaryColor"
                className="h-10 w-10 border border-gray-300 rounded"
                value={settings.primaryColor}
                onChange={handleChange}
              />
              <input 
                type="text"
                className="ml-2 flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                value={settings.primaryColor}
                onChange={handleChange}
                name="primaryColor"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email de Contacto
            </label>
            <input 
              type="email"
              name="contactEmail"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={settings.contactEmail}
              onChange={handleChange}
              placeholder="Email de contacto"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL del Logo (opcional)
          </label>
          <input 
            type="url"
            name="logo"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            value={settings.logo}
            onChange={handleChange}
            placeholder="https://ejemplo.com/logo.png"
          />
          {settings.logo && (
            <div className="mt-2 border rounded-md p-2 bg-gray-50">
              <img 
                src={settings.logo} 
                alt="Logo preview" 
                className="h-12 object-contain mx-auto" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/200x60?text=Logo+Error";
                }}
              />
            </div>
          )}
        </div>
        
        <div className="space-y-3 mb-4">
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox"
                name="showWeeklyService"
                checked={settings.showWeeklyService}
                onChange={handleChange}
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm">Mostrar servicios semanales en la página principal</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox"
                name="enableRegistration"
                checked={settings.enableRegistration}
                onChange={handleChange}
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm">Permitir registro de nuevos voluntarios</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox"
                name="requireApproval"
                checked={settings.requireApproval}
                onChange={handleChange}
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm">Requerir aprobación del administrador para nuevos voluntarios</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox"
                name="enableNotifications"
                checked={settings.enableNotifications}
                onChange={handleChange}
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm">Habilitar notificaciones por correo electrónico</span>
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
        >
          Guardar Configuración
        </button>
      </form>
    </div>
  );
};

// 통계 정보 컴포넌트
const Statistics = () => {
  const [stats, setStats] = useState({
    territories: 0,
    publishers: 0,
    notices: 0,
    cleaningGroups: 0
  });
  
  // 통계 정보 불러오기
  useEffect(() => {
    const territories = JSON.parse(localStorage.getItem('territories') || '[]');
    const publishers = JSON.parse(localStorage.getItem('publishers') || '[]');
    const notices = JSON.parse(localStorage.getItem('notices') || '[]');
    const cleaningGroups = JSON.parse(localStorage.getItem('cleaningGroups') || '[]');
    
    setStats({
      territories: territories.length,
      publishers: publishers.length,
      notices: notices.length,
      cleaningGroups: cleaningGroups.length
    });
  }, []);
  
  // 영역 상태 통계
  const TerritoryStatusStats = () => {
    const [statusCounts, setStatusCounts] = useState({
      inicio: 0,
      proceso: 0,
      completado: 0
    });
    
    useEffect(() => {
      const territories = JSON.parse(localStorage.getItem('territories') || '[]');
      const counts = territories.reduce((acc, territory) => {
        const status = territory.status || 'inicio';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      setStatusCounts(counts);
    }, []);
    
    return (
      <div className="mt-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Estado de Territorios</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-sky-50 p-2 rounded-md text-center">
            <span className="text-sky-600 font-medium">{statusCounts.inicio || 0}</span>
            <p className="text-xs text-gray-500">Inicio</p>
          </div>
          <div className="bg-yellow-50 p-2 rounded-md text-center">
            <span className="text-yellow-600 font-medium">{statusCounts.proceso || 0}</span>
            <p className="text-xs text-gray-500">Proceso</p>
          </div>
          <div className="bg-green-50 p-2 rounded-md text-center">
            <span className="text-green-600 font-medium">{statusCounts.completado || 0}</span>
            <p className="text-xs text-gray-500">Completado</p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-medium mb-3">Estadísticas</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-sky-400 to-sky-500 p-3 rounded-lg text-white">
          <div className="text-3xl font-semibold">{stats.territories}</div>
          <div className="text-sm mt-1">Territorios</div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-400 to-indigo-500 p-3 rounded-lg text-white">
          <div className="text-3xl font-semibold">{stats.publishers}</div>
          <div className="text-sm mt-1">Publicadores</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-400 to-purple-500 p-3 rounded-lg text-white">
          <div className="text-3xl font-semibold">{stats.notices}</div>
          <div className="text-sm mt-1">Anuncios</div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-400 to-pink-500 p-3 rounded-lg text-white">
          <div className="text-3xl font-semibold">{stats.cleaningGroups}</div>
          <div className="text-sm mt-1">Grupos de Limpieza</div>
        </div>
      </div>
      
      <TerritoryStatusStats />
    </div>
  );
};

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'backup', 'stats'
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
          <Link 
            href="/admin" 
            className="flex items-center justify-center bg-white text-sky-600 border border-sky-200 rounded-md px-4 py-2 text-sm font-medium shadow-sm hover:bg-sky-50"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Admin
          </Link>
        </div>
        
        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex text-sm flex-wrap">
            <button
              className={`py-3 px-4 font-medium ${
                activeTab === 'general' 
                  ? 'bg-sky-500 text-white' 
                  : 'text-gray-500 hover:text-sky-600'
              } ${activeTab === 'general' ? '' : 'rounded-tl-lg'}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              className={`py-3 px-4 font-medium ${
                activeTab === 'backup' 
                  ? 'bg-sky-500 text-white' 
                  : 'text-gray-500 hover:text-sky-600'
              }`}
              onClick={() => setActiveTab('backup')}
            >
              Copia de Seguridad
            </button>
            <button
              className={`py-3 px-4 font-medium ${
                activeTab === 'stats' 
                  ? 'bg-sky-500 text-white' 
                  : 'text-gray-500 hover:text-sky-600'
              }`}
              onClick={() => setActiveTab('stats')}
            >
              Estadísticas
            </button>
          </div>
        </div>
        
        {/* 선택된 탭 내용 */}
        {activeTab === 'general' && <WebsiteSettings />}
        {activeTab === 'backup' && <BackupRestore />}
        {activeTab === 'stats' && <Statistics />}
      </div>
    </Layout>
  );
} 