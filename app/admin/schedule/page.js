'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, parseISO, isBefore, startOfDay, addDays, addWeeks, eachWeekOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';

// 봉사 카테고리 정보
const serviceCategories = [
  { id: 'house', name: 'Por Casas', emoji: '🏠' },
  { id: 'revisit', name: 'Revisitas/Estudios', emoji: '📚' },
  { id: 'cart', name: 'Carrito', emoji: '🛒' },
  { id: 'letter', name: 'Cartas/Llamadas', emoji: '✉️' }
];

// 봉사 일정 카드 컴포넌트
const ScheduleCard = ({ schedule, onEdit, onDelete }) => {
  const date = parseISO(schedule.date);
  const formattedDate = format(date, 'yyyy.MM.dd', { locale: ko });
  const guidesCount = schedule.participants.length;
  
  // 오늘 날짜와 비교하여 지난 일정인지 확인
  const today = startOfDay(new Date());
  const isPast = isBefore(date, today);
  
  // 카테고리 정보 찾기
  const category = serviceCategories.find(cat => cat.id === schedule.category) || serviceCategories[0];
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden mb-3 p-4 ${isPast ? 'grayscale' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center flex-wrap">
            <span className="text-xl mr-2">{category.emoji}</span>
            <h3 className="font-bold text-lg">{schedule.location}</h3>
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{category.name}</span>
            {isPast && (
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">Evento pasado</span>
            )}
            {schedule.isRecurring && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Recurrente Semanal</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {formattedDate} • {schedule.time} • Guías: {guidesCount}/{schedule.maxParticipants} personas
            {schedule.isRecurring && schedule.endDate && (
              <> • Fin: {format(parseISO(schedule.endDate), 'yyyy.MM.dd', { locale: ko })}</>
            )}
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(schedule)}
            className="text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(schedule.id)}
            className="text-red-600 hover:text-red-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* 인도자 목록 */}
      <div className="border-t border-gray-100 pt-2 mt-2">
        <p className="text-sm font-medium mb-1">Lista de Guías</p>
        <div className="flex flex-wrap gap-1">
          {schedule.participants.length > 0 ? (
            schedule.participants.map((participant, index) => (
              <span 
                key={index}
                className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
              >
                {participant}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No hay guías registrados.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ScheduleManagementPage() {
  const [schedules, setSchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    location: '',
    time: '',
    maxParticipants: 10,
    participants: [],
    category: 'house', // 기본값은 호별
    isRecurring: false,
    endDate: addDays(new Date(), 30).toISOString().split('T')[0] // 기본 종료일은 30일 후
  });

  // 로컬 스토리지에서 일정 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      
      // 기존 데이터에 카테고리가 없으면 기본값 추가
      const updatedSchedules = savedSchedules.map(schedule => {
        if (!schedule.category) {
          return { ...schedule, category: 'house' }; // 기본값은 호별
        }
        return schedule;
      });
      
      if (JSON.stringify(savedSchedules) !== JSON.stringify(updatedSchedules)) {
        // 업데이트된 데이터가 있으면 저장
        localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
      }
      
      setSchedules(updatedSchedules);
    }
  }, []);

  // 일정 저장
  const saveSchedules = (updatedSchedules) => {
    // 날짜를 기준으로 오름차순 정렬
    const sortedSchedules = [...updatedSchedules].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
    
    setSchedules(sortedSchedules);
    localStorage.setItem('schedules', JSON.stringify(sortedSchedules));
  };

  // 입력 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              name === 'maxParticipants' ? parseInt(value, 10) : value
    });
  };

  // 반복 일정 생성 함수
  const createRecurringSchedules = (baseSchedule) => {
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
      // 첫 번째 일정이 아닌 경우 isRecurring을 false로 설정하여 개별 일정처럼 보이게 함
      isRecurring: index === 0
    }));
  };

  // 일정 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 입력된 데이터로 일정 객체 생성
    const scheduleData = {
      ...formData,
      id: editingSchedule ? editingSchedule.id : Date.now().toString(),
    };
    
    if (editingSchedule) {
      // 일정 수정
      const updatedSchedules = schedules.map(schedule => 
        schedule.id === editingSchedule.id 
          ? scheduleData
          : schedule
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
    setFormData({
      date: new Date().toISOString().split('T')[0],
      location: '',
      time: '',
      maxParticipants: 10,
      participants: [],
      category: 'house', // 기본값은 호별
      isRecurring: false,
      endDate: addDays(new Date(), 30).toISOString().split('T')[0]
    });
  };

  // 수정 모드 핸들러
  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      date: schedule.date,
      location: schedule.location,
      time: schedule.time,
      maxParticipants: schedule.maxParticipants,
      participants: schedule.participants,
      category: schedule.category || 'house', // 기존 데이터에 카테고리가 없으면 기본값
      isRecurring: schedule.isRecurring || false,
      endDate: schedule.endDate || addDays(new Date(), 30).toISOString().split('T')[0]
    });
    
    // 폼으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 참여자 추가 핸들러
  const handleAddParticipant = (e) => {
    e.preventDefault();
    const participantName = e.target.elements.participantName.value.trim();
    
    if (participantName && formData.participants.length < formData.maxParticipants) {
      setFormData({
        ...formData,
        participants: [...formData.participants, participantName]
      });
      e.target.elements.participantName.value = '';
    }
  };

  // 참여자 삭제 핸들러
  const handleRemoveParticipant = (index) => {
    const updatedParticipants = [...formData.participants];
    updatedParticipants.splice(index, 1);
    setFormData({
      ...formData,
      participants: updatedParticipants
    });
  };

  // 일정 삭제 핸들러
  const handleDelete = (id) => {
    if (confirm('정말 이 일정을 삭제하시겠습니까?')) {
      const updatedSchedules = schedules.filter(schedule => schedule.id !== id);
      saveSchedules(updatedSchedules);
    }
  };

  // 폼 취소 핸들러
  const handleCancel = () => {
    setEditingSchedule(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      location: '',
      time: '',
      maxParticipants: 10,
      participants: [],
      category: 'house', // 기본값은 호별
      isRecurring: false,
      endDate: addDays(new Date(), 30).toISOString().split('T')[0]
    });
  };

  // 카테고리 선택 핸들러
  const handleCategorySelect = (categoryId) => {
    setFormData({
      ...formData,
      category: categoryId
    });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Horarios de Servicio</h1>
        <Link 
          href="/admin"
          className="text-sm text-blue-600 hover:underline"
        >
          Volver a la página de administración
        </Link>
      </div>
      
      {/* 일정 입력 폼 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="font-medium mb-4">{editingSchedule ? 'Editar Horario' : 'Registrar Nuevo Horario'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          {/* 반복 설정 */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
                Recurrente Semanal
              </label>
            </div>
            
            {formData.isRecurring && (
              <div className="mt-2 ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Finalización <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.date}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={formData.isRecurring}
                />
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría de Servicio <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {serviceCategories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  className={`flex items-center justify-center p-2 border rounded-lg ${formData.category === category.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <span className="text-xl mr-2">{category.emoji}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lugar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Ingrese el lugar de servicio"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de Guías <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                min="1"
                max="50"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          {/* 인도자 관리 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Gestión de Guías ({formData.participants.length}/{formData.maxParticipants})
              </label>
            </div>
            
            <div className="p-3 border border-gray-200 rounded bg-gray-50 mb-2">
              {formData.participants.length > 0 ? (
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.participants.map((participant, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                    >
                      {participant}
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(index)}
                        className="ml-1 text-blue-800 hover:text-blue-900"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay guías registrados.</p>
              )}
              
              {formData.participants.length < formData.maxParticipants && (
                <form onSubmit={handleAddParticipant} className="flex mt-2">
                  <input
                    type="text"
                    name="participantName"
                    placeholder="Nombre del guía"
                    className="flex-grow p-1 text-sm border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-blue-600 text-white text-sm rounded-r hover:bg-blue-700"
                  >
                    Añadir
                  </button>
                </form>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editingSchedule ? 'Guardar Cambios' : 'Registrar Horario'}
            </button>
            {editingSchedule && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* 일정 목록 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="font-medium mb-4">Lista de Horarios de Servicio</h2>
        
        {schedules.length > 0 ? (
          <div className="space-y-4">
            {schedules.map(schedule => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-gray-500">No hay horarios registrados.</p>
        )}
      </div>
    </div>
  );
} 