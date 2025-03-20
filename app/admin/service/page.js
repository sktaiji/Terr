'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { format, parseISO, isBefore, startOfDay, addDays, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import Layout from '../../components/Layout';

// 봉사 카테고리 정보
const serviceCategories = [
  { id: 'house', name: 'Tiendas/Casas', emoji: '🏠' },
  { id: 'revisit', name: 'Revisitas/Estudios', emoji: '📚' },
  { id: 'cart', name: 'Carrito', emoji: '🛒' },
  { id: 'letter', name: 'Zoom/Cartas', emoji: '🖥️' }
];

// 시간 포맷 함수
function formatTimeDisplay(time) {
  if (!time) return '';
  
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${ampm} ${displayHour}:${minutes}`;
  } catch (e) {
    return time;
  }
}

// 구역 카드 컴포넌트 - 간결하게 압축
const TerritoryCard = ({ territory, isSelected, onSelect }) => {
  // 카테고리 및 장소 타입 이모지
  const categoryEmoji = { 'centro': '🏛️', 'polanco': '🏙️', 'fuera': '🌆', 'edo': '🏞️' };
  const placeTypeEmoji = { 'tienda': '🏪', 'casa': '🏡', 'comercial': '🏢', 'almacen': '🏭', 'cart': '🛒' };

  return (
    <div 
      className={`bg-white border ${isSelected ? 'border-sky-500 bg-sky-50' : 'border-gray-200'} rounded-md p-2 flex items-center cursor-pointer text-sm`}
      onClick={() => onSelect(territory.id, !isSelected)}
    >
      <input
        type="checkbox"
        checked={isSelected || false}
        onChange={(e) => {
          e.stopPropagation();
          onSelect(territory.id, e.target.checked);
        }}
        className="mr-2 h-4 w-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
      />
      <div className="flex-grow truncate">
        <div className="flex items-center">
          <span className="mr-1">{categoryEmoji[territory.category] || '🗺️'}</span>
          <span className="font-medium">{territory.number}</span>
          <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-sky-100 text-sky-700">
            {placeTypeEmoji[territory.placeType] || '📍'} {territory.placeType}
          </span>
        </div>
      </div>
    </div>
  );
};

// 봉사 일정 카드 컴포넌트
const ServiceCard = ({ schedule, onEdit, onDelete, isSelected, onSelect }) => {
  const date = parseISO(schedule.date);
  const formattedDate = format(date, 'dd/MM/yyyy', { locale: es });
  const isPast = isBefore(date, startOfDay(new Date()));
  const category = serviceCategories.find(cat => cat.id === schedule.category) || serviceCategories[0];
  
  return (
    <div className={`bg-white border ${isSelected ? 'border-sky-500 bg-sky-50' : 'border-gray-200'} rounded-md overflow-hidden`}>
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={(e) => onSelect(schedule.id, e.target.checked)}
            className="mr-2 h-4 w-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
          />
          <span className="mr-1">{category.emoji}</span>
          <span className="font-medium text-sm">{schedule.location}</span>
        </div>
        <span className="px-1.5 py-0.5 text-xs rounded bg-sky-100 text-sky-700">
          {category.name}
        </span>
      </div>
      
      <div className="px-3 py-2 text-sm">
        <div className="grid grid-cols-2 gap-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Fecha:</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Hora:</span>
            <span className="font-medium">{formatTimeDisplay(schedule.time)}</span>
          </div>
        </div>
        
        <div className="mt-1 flex justify-between">
          <span className="text-gray-500">Participantes:</span>
          <span className="font-medium">{schedule.participants?.length || 0}/{schedule.maxParticipants}</span>
        </div>
        
        {schedule.territoryId && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-gray-500">Territorio:</span>
            <span className="font-medium text-sky-600 flex items-center">
              {schedule.territoryNumber || schedule.territoryId}
              {schedule.territoryAddress && (
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(schedule.territoryAddress)}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="ml-2 text-xs text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ver mapa
                </a>
              )}
            </span>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex justify-end space-x-2">
        <button
          className="text-sky-600 hover:text-sky-900"
          onClick={() => onEdit(schedule)}
          title="Editar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          className="text-red-600 hover:text-red-900"
          onClick={() => onDelete(schedule.id)}
          title="Eliminar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default function ServiceManagementPage() {
  // 상태 변수 정의 - 최소화
  const [schedules, setSchedules] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedScheduleIds, setSelectedScheduleIds] = useState([]);
  const [selectedTerritoryIds, setSelectedTerritoryIds] = useState([]);
  const [territorySearchTerm, setTerritorySearchTerm] = useState('');
  const [showTerritorySelector, setShowTerritorySelector] = useState(false);
  
  // 초기 폼 상태
  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    location: '',
    time: '10:00',
    maxParticipants: 10,
    participants: [],
    category: 'house',
    isRecurring: false,
    endDate: addDays(new Date(), 30).toISOString().split('T')[0],
    territoryId: '',
    territoryNumber: '',
    territoryAddress: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);

  // 일정 저장 함수
  function saveSchedules(updatedSchedules) {
    try {
      const sortedSchedules = [...updatedSchedules].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
      
      setSchedules(sortedSchedules);
      localStorage.setItem('schedules', JSON.stringify(sortedSchedules));
    } catch (error) {
      console.error('Error al guardar los horarios:', error);
    }
  }
  
  // 필터링된 구역 목록
  const filteredTerritories = useMemo(() => {
    if (!territorySearchTerm || territorySearchTerm.trim() === '') {
      return territories;
    }
    
    const searchTermLower = territorySearchTerm.toLowerCase().trim();
    return territories.filter(territory => 
      (territory.number && territory.number.toString().includes(searchTermLower)) ||
      (territory.address && territory.address.toLowerCase().includes(searchTermLower)) ||
      (territory.captain && territory.captain.toLowerCase().includes(searchTermLower)) ||
      (territory.category && territory.category.toLowerCase().includes(searchTermLower)) ||
      (territory.placeType && territory.placeType.toLowerCase().includes(searchTermLower))
    );
  }, [territorySearchTerm, territories]);

  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // 봉사 일정 불러오기
        const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
        
        // 기존 데이터에 카테고리가 없으면 기본값 추가
        const updatedSchedules = savedSchedules.map(schedule => 
          schedule.category ? schedule : { ...schedule, category: 'house' }
        );
        
        if (JSON.stringify(savedSchedules) !== JSON.stringify(updatedSchedules)) {
          localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
        }
        
        setSchedules(updatedSchedules);

        // 구역 데이터 불러오기
        const savedTerritories = JSON.parse(localStorage.getItem('territories') || '[]');
        setTerritories(savedTerritories);
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
        setSchedules([]);
        setTerritories([]);
      }
    }
  }, []);

  // 구역 선택 핸들러
  function handleTerritorySelect(territoryId, isSelected) {
    setSelectedTerritoryIds(prev => {
      if (isSelected) {
        return [...prev, territoryId];
      } else {
        return prev.filter(id => id !== territoryId);
      }
    });
  }

  // 스케줄 선택 핸들러
  function handleScheduleSelect(scheduleId, isSelected) {
    setSelectedScheduleIds(prev => {
      if (isSelected) {
        return [...prev, scheduleId];
      } else {
        return prev.filter(id => id !== scheduleId);
      }
    });
  }

  // 모두 선택 핸들러
  function handleSelectAll() {
    if (selectedScheduleIds.length === schedules.length) {
      setSelectedScheduleIds([]);
    } else {
      setSelectedScheduleIds(schedules.map(schedule => schedule.id));
    }
  }

  // 삭제 핸들러
  function handleDelete(scheduleId) {
    if (window.confirm('¿Está seguro de que desea eliminar este horario?')) {
      const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
      saveSchedules(updatedSchedules);
    }
  }

  // 선택된 일정 삭제 핸들러
  function handleDeleteSelected() {
    if (selectedScheduleIds.length === 0) return;

    if (window.confirm(`¿Está seguro de que desea eliminar ${selectedScheduleIds.length} horarios seleccionados?`)) {
      const updatedSchedules = schedules.filter(schedule => !selectedScheduleIds.includes(schedule.id));
      saveSchedules(updatedSchedules);
      setSelectedScheduleIds([]);
    }
  }

  // 구역에서 서비스 생성 핸들러
  function handleCreateServices() {
    if (selectedTerritoryIds.length === 0) {
      alert('Por favor, seleccione al menos un territorio para crear un servicio.');
      return;
    }

    // 현재 날짜와 시간으로 기본값 설정
    const today = new Date();
    const defaultDate = today.toISOString().split('T')[0];
    const defaultTime = '10:00';
    
    const newSchedules = [];
    
    // 선택된 모든 구역에 대해 서비스 생성
    selectedTerritoryIds.forEach(territoryId => {
      const territory = territories.find(t => t.id === territoryId);
      if (!territory) return;
      
      const scheduleData = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        date: defaultDate,
        time: defaultTime,
        location: `Territorio ${territory.number || ''}`,
        maxParticipants: 10,
        participants: [],
        category: territory.placeType === 'cart' ? 'cart' : 'house',
        isRecurring: false,
        territoryId: territory.id,
        territoryNumber: territory.number,
        territoryAddress: territory.address || '',
        allowRegistration: territory.placeType === 'cart'
      };
      
      newSchedules.push(scheduleData);
    });
    
    // 생성된 모든 스케줄 저장
    if (newSchedules.length > 0) {
      const updatedSchedules = [...schedules, ...newSchedules];
      saveSchedules(updatedSchedules);
      alert(`Se han creado ${newSchedules.length} servicios de territorios.`);
      
      setShowTerritorySelector(false);
      setTerritorySearchTerm('');
      setSelectedTerritoryIds([]);
    }
  }
  
  // 선택한 단일 구역으로 서비스 생성
  function handleSelectTerritory(territory) {
    if (!territory) return;
    
    // 폼 데이터 업데이트
    setFormData({
      ...initialFormState,
      location: `Territorio ${territory.number || ''}`,
      category: territory.placeType === 'cart' ? 'cart' : 'house',
      territoryId: territory.id,
      territoryNumber: territory.number,
      territoryAddress: territory.address || ''
    });
    
    setShowTerritorySelector(false);
    setTerritorySearchTerm('');
  }

  // 입력 변경 핸들러
  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'maxParticipants' ? parseInt(value, 10) : value
    }));
  }

  // 카테고리 선택 핸들러
  function handleCategorySelect(categoryId) {
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      allowRegistration: categoryId === 'cart'
    }));
  }

  // 반복 일정 생성 함수
  function createRecurringSchedules(baseSchedule) {
    try {
      const startDate = parseISO(baseSchedule.date);
      const endDate = parseISO(baseSchedule.endDate);
      
      // 시작일부터 종료일까지의 매주 같은 요일 날짜 배열 생성
      const weeklyDates = [];
      let currentDate = startDate;
      
      while (!isBefore(endDate, currentDate)) {
        weeklyDates.push(currentDate);
        currentDate = addWeeks(currentDate, 1);
      }
      
      // 각 날짜에 대한 일정 생성
      return weeklyDates.map((date, index) => ({
        ...baseSchedule,
        id: `${baseSchedule.id}-${index}`,
        date: format(date, 'yyyy-MM-dd'),
        isRecurring: index === 0
      }));
    } catch (error) {
      console.error('반복 일정 생성 오류:', error);
      return [baseSchedule]; // 오류 발생 시 기본 일정만 반환
    }
  }

  // 일정 제출 핸들러
  function handleSubmit(e) {
    e.preventDefault();
    
    try {
      // 입력된 데이터로 일정 객체 생성
      const scheduleData = {
        ...formData,
        id: editingSchedule ? editingSchedule.id : Date.now().toString(),
        participants: editingSchedule ? (editingSchedule.participants || []) : [],
        allowRegistration: formData.category === 'cart'
      };
      
      if (editingSchedule) {
        // 일정 수정
        const updatedSchedules = schedules.map(schedule => 
          schedule.id === editingSchedule.id ? scheduleData : schedule
        );
        saveSchedules(updatedSchedules);
        setEditingSchedule(null);
      } else {
        // 새 일정 추가
        if (formData.isRecurring) {
          // 반복 일정 생성
          const recurringSchedules = createRecurringSchedules(scheduleData);
          saveSchedules([...schedules, ...recurringSchedules]);
        } else {
          // 단일 일정 추가
          saveSchedules([...schedules, scheduleData]);
        }
      }
      
      // 폼 초기화
      setFormData(initialFormState);
    } catch (error) {
      console.error('일정 제출 오류:', error);
      alert('Ha ocurrido un error al procesar el formulario. Por favor, inténtelo de nuevo.');
    }
  }

  // 수정 모드 핸들러
  function handleEdit(schedule) {
    setEditingSchedule(schedule);
    setFormData({
      date: schedule.date,
      location: schedule.location,
      time: schedule.time,
      maxParticipants: schedule.maxParticipants,
      category: schedule.category || 'house',
      isRecurring: schedule.isRecurring || false,
      endDate: schedule.endDate || addDays(new Date(), 30).toISOString().split('T')[0],
      territoryId: schedule.territoryId || '',
      territoryNumber: schedule.territoryNumber || '',
      territoryAddress: schedule.territoryAddress || '',
      allowRegistration: schedule.category === 'cart'
    });
  }

  // 폼 리셋 핸들러
  function resetForm() {
    setEditingSchedule(null);
    setFormData(initialFormState);
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Administración de Servicios</h1>
          <Link 
            href="/admin" 
            className="flex items-center justify-center bg-white text-sky-600 border border-sky-200 rounded-md px-4 py-2 text-sm font-medium shadow-sm hover:bg-sky-50"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Admin
          </Link>
        </div>
        
        <div className="flex flex-col space-y-6">
          {/* 상단: 폼 */}
          <div className="w-full">
            {/* 일정 입력 폼 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-sky-500 text-white px-4 py-2">
                <h2 className="font-medium">{editingSchedule ? 'Editar Horario' : 'Registrar Nuevo Horario'}</h2>
              </div>
              
              <div className="p-4">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora <span className="text-red-500">*</span>
                        </label>
                        <div className="flex h-10 items-center">
                          <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
                            required
                          />
                          <span className="ml-2 text-gray-600 text-sm whitespace-nowrap" aria-hidden="true">
                            {formatTimeDisplay(formData.time)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lugar <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
                          required
                          placeholder="Ingrese el lugar"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTerritorySelector(!showTerritorySelector)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sky-600"
                          title="Seleccionar territorio"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      
                      {showTerritorySelector && (
                        <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-sm w-full max-w-sm max-h-64 overflow-y-auto">
                          <div className="p-2 sticky top-0 bg-white border-b">
                            <input
                              type="text"
                              placeholder="Buscar territorio..."
                              value={territorySearchTerm}
                              onChange={(e) => setTerritorySearchTerm(e.target.value)}
                              className="w-full h-8 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
                            />
                          </div>
                          <div className="p-2 space-y-1">
                            {filteredTerritories.length === 0 ? (
                              <p className="text-gray-500 text-sm text-center py-2">No hay territorios disponibles</p>
                            ) : (
                              filteredTerritories.map(territory => (
                                <TerritoryCard 
                                  key={territory.id} 
                                  territory={territory}
                                  isSelected={selectedTerritoryIds.includes(territory.id)}
                                  onSelect={() => handleSelectTerritory(territory)}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* 반복 설정 */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        name="isRecurring"
                        checked={formData.isRecurring}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
                      />
                      <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700">
                        Semanales
                      </label>
                      
                      {formData.isRecurring && (
                        <div className="ml-4 flex-grow">
                          <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            min={formData.date}
                            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
                            required={formData.isRecurring}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Servicio <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {serviceCategories.map(category => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => handleCategorySelect(category.id)}
                            className={`flex items-center justify-center h-10 px-3 border rounded-md transition-all text-sm ${formData.category === category.id ? 'border-sky-500 bg-sky-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}
                          >
                            <span className="mr-1">{category.emoji}</span>
                            <span>{category.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Participantes <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleInputChange}
                        min="1"
                        max="50"
                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end items-end mt-8">
                      {editingSchedule && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-4 py-2 mr-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors text-sm font-medium"
                      >
                        {editingSchedule ? 'Actualizar' : 'Registrar'} Horario
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* 하단: 서비스 목록 */}
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-sky-500 text-white px-4 py-2 flex justify-between items-center">
                <h2 className="font-medium">Horarios de Servicio</h2>
                
                {schedules.length > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center px-2 py-1 bg-white/20 rounded-md text-xs font-medium text-white hover:bg-white/30"
                    >
                      {selectedScheduleIds.length === schedules.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                    
                    {selectedScheduleIds.length > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        className="flex items-center px-2 py-1 bg-red-600/20 rounded-md text-xs font-medium text-white hover:bg-red-600/30"
                      >
                        Eliminar ({selectedScheduleIds.length})
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="max-h-[calc(70vh-5rem)] overflow-y-auto p-4">
                {schedules.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay horarios registrados.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {schedules.map(schedule => (
                      <ServiceCard 
                        key={schedule.id} 
                        schedule={schedule}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isSelected={selectedScheduleIds.includes(schedule.id)}
                        onSelect={handleScheduleSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 