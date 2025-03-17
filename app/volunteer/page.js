'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, addDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

// 봉사 카테고리 정보
const serviceCategories = [
  { id: 'house', name: 'Por Casas', emoji: '🏠' },
  { id: 'revisit', name: 'Revisitas/Estudios', emoji: '📚' },
  { id: 'cart', name: 'Carrito', emoji: '🛒' },
  { id: 'letter', name: 'Cartas/Llamadas', emoji: '✉️' }
];

// 카테고리 ID로 카테고리 정보 찾기
const getCategoryById = (categoryId) => {
  return serviceCategories.find(cat => cat.id === categoryId) || serviceCategories[0]; // 기본값은 호별
};

// 봉사 카드 컴포넌트
const VolunteerCard = ({ schedule, onApply }) => {
  const date = parseISO(schedule.date);
  const formattedDate = format(date, 'yyyy년 MM월 dd일 (EEE)', { locale: ko });
  const guidesCount = schedule.participants.length;
  const isFull = guidesCount >= schedule.maxParticipants;
  const category = getCategoryById(schedule.category);
  
  const [name, setName] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && !isFull) {
      onApply(schedule.id, name.trim());
      setName('');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center flex-wrap">
          <span className="text-xl mr-2">{category.emoji}</span>
          <h3 className="font-bold text-lg">{schedule.location}</h3>
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{category.name}</span>
          {schedule.isRecurring && (
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Recurrente Semanal</span>
          )}
        </div>
        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
          {guidesCount}/{schedule.maxParticipants} personas
        </span>
      </div>
      
      <div className="mb-3">
        <div className="flex items-center mb-1 text-sm text-gray-600">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formattedDate}
        </div>
        <div className="flex items-center mb-1 text-sm text-gray-600">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {schedule.time}
        </div>
      </div>
      
      <div className="mb-3">
        <h4 className="font-medium text-sm mb-1">Guías</h4>
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
      
      {!isFull && (
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ingrese su nombre"
            className="flex-grow p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Solicitar
          </button>
        </form>
      )}
    </div>
  );
};

// 날짜 칸 컴포넌트 - 가독성을 위해 컴포넌트로 분리
const CalendarDay = ({ day, onClick }) => {
  const { date, isCurrentMonth, isToday, isSelected, categories } = day;
  
  return (
    <div
      onClick={() => onClick(date)}
      className={`
        p-1 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors
        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
        ${isToday ? 'border-blue-500' : 'border-gray-200'}
        ${isSelected ? 'bg-blue-50 border-blue-600' : ''}
      `}
    >
      <div className="flex flex-col">
        <div className={`text-right text-sm font-medium
          ${!isCurrentMonth ? 'text-gray-400' : isToday ? 'text-blue-600' : ''}
          ${date.getDay() === 0 ? 'text-red-500' : date.getDay() === 6 ? 'text-blue-500' : ''}
        `}>
          {date.getDate()}
        </div>
        
        {Object.keys(categories).length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {Object.entries(categories).map(([categoryId, count]) => {
              const category = getCategoryById(categoryId);
              return (
                <div key={categoryId} className="flex items-center justify-center">
                  <span className="text-xs">{category.emoji}</span>
                  {count > 1 && (
                    <span className="text-xs text-gray-600 ml-1">{count}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default function VolunteerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [schedulesForSelectedDate, setSchedulesForSelectedDate] = useState([]);
  
  // 로컬 스토리지에서 일정 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      
      // 날짜 문자열을 Date 객체로 변환하는 대신 문자열로 유지하고 필요할 때 파싱
      setSchedules(savedSchedules);
      
      // 선택된 날짜의 일정 필터링
      filterSchedulesForSelectedDate(savedSchedules, selectedDate);
    }
  }, [selectedDate]);
  
  // 선택된 날짜의 일정 필터링
  const filterSchedulesForSelectedDate = (scheduleList, date) => {
    const filtered = scheduleList.filter(schedule => {
      const scheduleDate = parseISO(schedule.date);
      return isSameDay(scheduleDate, date);
    });
    setSchedulesForSelectedDate(filtered);
  };
  
  // 이전 달로 이동
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  // 다음 달로 이동
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // 날짜 선택 핸들러
  const handleDateClick = (date) => {
    setSelectedDate(date);
    filterSchedulesForSelectedDate(schedules, date);
  };
  
  // 캘린더 데이터 생성
  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 달의 첫 날
    const firstDayOfMonth = new Date(year, month, 1);
    // 달의 마지막 날
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // 첫 주의 시작 날짜 (일요일부터 시작)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // 카테고리별 일정 수집
    const getSchedulesByCategory = (date) => {
      const categories = {};
      const daySchedules = schedules.filter(schedule => {
        const scheduleDate = parseISO(schedule.date);
        return isSameDay(scheduleDate, date);
      });
      
      daySchedules.forEach(schedule => {
        const categoryId = schedule.category || 'house';
        if (categories[categoryId]) {
          categories[categoryId]++;
        } else {
          categories[categoryId] = 1;
        }
      });
      
      return { categories, count: daySchedules.length };
    };
    
    // 캘린더 데이터 생성 (5주만 표시)
    const calendarWeeks = [];
    let currentWeek = [];
    
    // 최대 42일 (6주) 대신 35일 (5주)로 제한
    for (let i = 0; i < 35; i++) {
      const date = addDays(startDate, i);
      const scheduleData = getSchedulesByCategory(date);
      
      const day = {
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: isSameDay(date, new Date()),
        isSelected: isSameDay(date, selectedDate),
        hasSchedule: scheduleData.count > 0,
        scheduleCount: scheduleData.count,
        categories: scheduleData.categories
      };
      
      currentWeek.push(day);
      
      // 토요일이면 새 주 시작
      if (date.getDay() === 6) {
        calendarWeeks.push([...currentWeek]);
        currentWeek = [];
      }
    }
    
    // 마지막 주가 있으면 추가
    if (currentWeek.length > 0) {
      calendarWeeks.push(currentWeek);
    }
    
    return calendarWeeks;
  };
  
  // 봉사 신청 핸들러
  const handleApply = (scheduleId, name) => {
    const updatedSchedules = schedules.map(schedule => {
      if (schedule.id === scheduleId) {
        return {
          ...schedule,
          participants: [...schedule.participants, name]
        };
      }
      return schedule;
    });
    
    setSchedules(updatedSchedules);
    localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
    
    // 선택된 날짜의 일정 다시 필터링
    filterSchedulesForSelectedDate(updatedSchedules, selectedDate);
  };
  
  // 캘린더 주간 데이터
  const calendarWeeks = generateCalendarData();
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Horarios de Servicio</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          Volver al Inicio
        </Link>
      </div>
      
      {/* 캘린더 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-3 mb-6">
        {/* 캘린더 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Mes anterior"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg sm:text-xl font-medium">
            {format(currentDate, 'yyyy년 MM월', { locale: ko })}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Mes siguiente"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, index) => (
            <div
              key={index}
              className={`text-center text-xs sm:text-sm font-medium py-1
                ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'}`}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* 캘린더 그리드 */}
        <div className="space-y-1">
          {calendarWeeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => (
                <CalendarDay 
                  key={dayIndex} 
                  day={day} 
                  onClick={handleDateClick} 
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* 캘린더 범례 */}
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
          {serviceCategories.map(category => (
            <div key={category.id} className="flex items-center">
              <span className="text-sm">{category.emoji}</span>
              <span className="text-xs text-gray-600 ml-1">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 선택된 일정 표시 섹션 */}
      <div className="mb-6">
        <h3 className="font-medium mb-3 text-lg">
          Horarios de servicio para el {format(selectedDate, 'dd/MM/yyyy (EEE)', { locale: ko })}
        </h3>
        
        {schedulesForSelectedDate.length > 0 ? (
          <div className="space-y-4">
            {schedulesForSelectedDate.map(schedule => (
              <VolunteerCard
                key={schedule.id}
                schedule={schedule}
                onApply={handleApply}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            <p>No hay horarios de servicio para esta fecha.</p>
            <p className="mt-2 text-sm">Seleccione otra fecha o regístrese en la página de administrador.</p>
          </div>
        )}
      </div>
    </div>
  );
} 