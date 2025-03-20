'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isBefore, isAfter, startOfDay, addDays, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import Layout from './components/Layout';

// 안전하게 날짜 처리하는 유틸리티 함수
const safeFormatDate = (dateString, formatPattern = 'dd/MM/yyyy', locale = es) => {
  if (!dateString) return '-';
  
  try {
    // 유효한 날짜 문자열인지 확인
    if (typeof dateString !== 'string') return '-';
    
    const date = parseISO(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // 파싱할 수 없는 경우 원본 반환
    }
    
    return format(date, formatPattern, { locale });
  } catch (error) {
    console.error('날짜 포맷 오류:', error);
    return dateString; // 오류 발생 시 원본 반환
  }
};

// 안전하게 ISO 날짜 파싱
const safeParseISO = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;
  
  try {
    const date = parseISO(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch (error) {
    console.error('날짜 파싱 오류:', error);
    return null;
  }
};

// 공지사항 카드 컴포넌트
const NoticeCard = ({ notice, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center mb-1">
        <span className="text-lg mr-1.5">
          {notice.category === 'congregación' ? '🏛️' : 
           notice.category === 'Circuito' ? '🔄' : '📢'}
        </span>
        <h3 className="font-medium text-base truncate">{notice.title}</h3>
        {notice.importance === 'high' && (
          <span className="ml-1.5 bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full">!</span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-1">
        {safeFormatDate(notice.date)}
      </p>
      <p className="text-sm text-gray-700 line-clamp-1">{notice.content}</p>
    </div>
  );
};

// 봉사 일정 카드 컴포넌트
const ScheduleCard = ({ schedule, onClick }) => {
  const date = safeParseISO(schedule.date);
  // 날짜가 유효하지 않은 경우 처리
  if (!date) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}>
        <div className="flex justify-between mb-1">
          <h3 className="font-medium text-base truncate">{schedule.location || 'Localización desconocida'}</h3>
        </div>
        <div className="text-xs text-gray-600">Fecha no válida</div>
      </div>
    );
  }
  
  const formattedDate = format(date, 'dd/MM/yyyy (EEE)', { locale: es });
  const guidesCount = schedule.participants ? schedule.participants.length : 0;
  
  // 봉사 카테고리 정보
  const serviceCategories = [
    { id: 'house', name: 'Casas', emoji: '🏠' },
    { id: 'revisit', name: 'Revisitas/Estudios', emoji: '📚' },
    { id: 'cart', name: 'Carrito', emoji: '🛒' },
    { id: 'letter', name: 'Cartas/Llamadas', emoji: '✉️' }
  ];
  
  const category = serviceCategories.find(cat => cat.id === schedule.category) || serviceCategories[0];
  
  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between mb-1">
        <div className="flex items-center">
          <span className="text-lg mr-1.5">{category.emoji}</span>
          <h3 className="font-medium text-base truncate">{schedule.location}</h3>
        </div>
        <span className="text-xs font-medium text-blue-600">
          {guidesCount}/{schedule.maxParticipants}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{schedule.time}</span>
        </div>
        <span className="bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">{category.name}</span>
      </div>
      {schedule.territoryAddress && (
        <div className="mt-2 text-xs">
          <a 
            href={`https://maps.google.com/?q=${encodeURIComponent(schedule.territoryAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {schedule.territoryNumber ? `Territorio ${schedule.territoryNumber}` : 'Ver ubicación'}
          </a>
        </div>
      )}
    </div>
  );
};

// 요일별 봉사 컴포넌트
const WeeklyServiceCard = ({ day, services }) => {
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className={`py-1.5 px-3 ${day === 0 || day === 6 ? 'bg-sky-500' : 'bg-gradient-to-r from-sky-400 to-indigo-400'} text-white`}>
        <h3 className="font-medium text-sm">{dayNames[day]}</h3>
      </div>
      <div className="p-2">
        {services.length > 0 ? (
          <div className="space-y-1.5">
            {services.map((service, idx) => (
              <div key={idx} className="flex items-center text-xs">
                <span className="text-base mr-1.5">
                  {service.category === 'house' ? '🏠' : 
                   service.category === 'revisit' ? '📚' : 
                   service.category === 'cart' ? '🛒' : '✉️'}
                </span>
                <div>
                  <p className="font-medium leading-tight">{service.location}</p>
                  <p className="text-gray-500 text-xs leading-tight">{service.time} • {service.captain || 'Sin capitán'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-1">No hay servicios</p>
        )}
      </div>
    </div>
  );
};

// 회관 청소 컴포넌트
const CleaningGroupCard = ({ group }) => {
  if (!group) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-3">
      <div className="flex items-center mb-1.5">
        <span className="text-lg mr-1.5">🧹</span>
        <h3 className="font-medium text-base">Limpieza de Salón</h3>
      </div>
      <div className="bg-sky-50 p-2 rounded-lg">
        <p className="text-xs font-medium mb-1">Grupo {group.number}</p>
        <p className="text-xs text-gray-600">Responsable: {group.supervisor}</p>
        <p className="text-xs text-gray-600">
          {safeFormatDate(group.startDate)} - 
          {safeFormatDate(group.endDate)}
        </p>
      </div>
    </div>
  );
};

// 공지사항 상세보기 모달
const NoticeDetailModal = ({ notice, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-2">
                {notice.category === 'congregación' ? '🏛️' : 
                 notice.category === 'Circuito' ? '🔄' : '📢'}
              </span>
              <h2 className="text-xl font-bold">{notice.title}</h2>
              {notice.importance === 'high' && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Importante</span>
              )}
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            {safeFormatDate(notice.date)} • {notice.category}
          </p>
          
          <div className="border-t border-gray-100 pt-4">
            <p className="text-gray-700 whitespace-pre-line">{notice.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 봉사 일정 상세보기 모달
const ScheduleModal = ({ schedule, onClose }) => {
  const date = safeParseISO(schedule.date);
  // 날짜가 유효하지 않은 경우 기본값 사용
  const formattedDate = date 
    ? format(date, 'dd/MM/yyyy (EEE)', { locale: es })
    : 'Fecha no disponible';
  
  const guidesCount = schedule.participants ? schedule.participants.length : 0;
  const serviceCategories = [
    { id: 'house', name: 'Casas', emoji: '🏠' },
    { id: 'revisit', name: 'Revisitas/Estudios', emoji: '📚' },
    { id: 'cart', name: 'Carrito', emoji: '🛒' },
    { id: 'letter', name: 'Cartas/Llamadas', emoji: '✉️' }
  ];
  const category = serviceCategories.find(cat => cat.id === schedule.category) || serviceCategories[0];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center flex-wrap">
              <span className="text-2xl mr-2">{category.emoji}</span>
              <h2 className="text-xl font-bold">{schedule.location}</h2>
              <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{category.name}</span>
              {schedule.isRecurring && (
                <span className="ml-2 mt-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Recurrente Semanal</span>
              )}
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-sky-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-700">{formattedDate}</p>
            </div>
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-sky-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-700">{schedule.time}</p>
            </div>
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-sky-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-700">Guías: {guidesCount}/{schedule.maxParticipants} personas</p>
            </div>
            {schedule.captain && (
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-sky-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-gray-700">Capitán: {schedule.captain}</p>
              </div>
            )}
            {schedule.territoryAddress && (
              <div className="mb-2">
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(schedule.territoryAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ver ubicación en Google Maps
                </a>
              </div>
            )}
          </div>
          
          {/* 날짜 안전하게 포맷팅하여 링크 생성 */}
          <Link
            href={`/service?date=${date ? format(date, 'yyyy-MM-dd') : ''}`}
            className="block w-full py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-center text-sm font-medium"
          >
            Ver más detalles y solicitar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [notices, setNotices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [weeklySchedules, setWeeklySchedules] = useState(Array(7).fill([]));
  const [cleaningGroup, setCleaningGroup] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [territories, setTerritories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  
  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 공지사항 불러오기
      const savedNotices = JSON.parse(localStorage.getItem('notices') || '[]');
      // 최신순으로 정렬
      const sortedNotices = savedNotices.sort((a, b) => {
        // 날짜 안전하게 비교
        const dateA = safeParseISO(a.date);
        const dateB = safeParseISO(b.date);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
      }).slice(0, 4); // 최근 4개만 표시
      setNotices(sortedNotices);
      
      // 봉사 일정 불러오기
      const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      
      // 날짜 기준으로 필터링 및 정렬
      const today = startOfDay(new Date());
      const upcomingSchedules = savedSchedules
        .filter(schedule => {
          const scheduleDate = safeParseISO(schedule.date);
          return scheduleDate && !isBefore(scheduleDate, today);
        })
        .sort((a, b) => {
          // 날짜로 정렬하되, 날짜가 같으면 시간으로 정렬
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.time.localeCompare(b.time);
        })
        .slice(0, 6); // 최대 6개만 표시
        
      // 구역 정보 추가
      const savedTerritories = JSON.parse(localStorage.getItem('territories') || '[]');
      setTerritories(savedTerritories);
      
      const upcomingWithTerritoryInfo = upcomingSchedules.map(schedule => {
        if (schedule.territoryId) {
          const territory = savedTerritories.find(t => t.id === schedule.territoryId);
          if (territory) {
            return {
              ...schedule,
              territoryNumber: territory.number,
              territoryAddress: territory.address
            };
          }
        }
        return schedule;
      });
      
      setSchedules(upcomingWithTerritoryInfo);
      
      // 요일별 반복 일정 분류
      const weeklyData = Array(7).fill().map(() => []);
      
      savedSchedules.forEach(schedule => {
        if (schedule.isRecurring) {
          const scheduleDate = safeParseISO(schedule.date);
          if (scheduleDate) {
            const dayOfWeek = scheduleDate.getDay();
            weeklyData[dayOfWeek].push(schedule);
          }
        }
      });
      
      setWeeklySchedules(weeklyData);
      
      // 회관 청소 집단 불러오기
      const savedCleaningGroups = JSON.parse(localStorage.getItem('cleaningGroups') || '[]');
      if (savedCleaningGroups.length > 0) {
        // 현재 날짜에 해당하는 청소 집단 찾기
        const currentDate = new Date();
        const currentGroup = savedCleaningGroups.find(group => {
          const startDate = safeParseISO(group.startDate);
          const endDate = safeParseISO(group.endDate);
          return startDate && endDate && currentDate >= startDate && currentDate <= endDate;
        });
        
        setCleaningGroup(currentGroup || null);
      }
      
      // 공개자 정보 불러오기
      const savedPublishers = JSON.parse(localStorage.getItem('publishers') || '[]');
      setPublishers(savedPublishers);
    }
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4">
        {/* 사이트 이름과 환영 메시지 */}
        <div className="bg-gradient-to-r from-sky-100 to-indigo-100 rounded-xl p-4 mb-6">
          <h1 className="text-2xl font-bold text-sky-800 mb-2">Bienvenido a Tu Plataforma de Voluntariado</h1>
          <p className="text-sky-700">Organiza, gestiona y participa en actividades de servicio voluntario</p>
        </div>
        
        {/* 메인 통계 섹션 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-sky-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-1">
              <span className="text-lg mr-2">🗺️</span>
              <h2 className="text-sky-800 font-medium">Territorios</h2>
            </div>
            <div className="text-2xl font-bold text-sky-900">{territories.length}</div>
          </div>
          
          <div className="bg-green-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-1">
              <span className="text-lg mr-2">👨‍👩‍👧‍👦</span>
              <h2 className="text-green-800 font-medium">Publicadores</h2>
            </div>
            <div className="text-2xl font-bold text-green-900">{publishers.length}</div>
          </div>
          
          <div className="bg-purple-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-1">
              <span className="text-lg mr-2">📢</span>
              <h2 className="text-purple-800 font-medium">Anuncios</h2>
            </div>
            <div className="text-2xl font-bold text-purple-900">{notices.length}</div>
          </div>
          
          <div className="bg-yellow-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-1">
              <span className="text-lg mr-2">🛒</span>
              <h2 className="text-yellow-800 font-medium">Servicios</h2>
            </div>
            <div className="text-2xl font-bold text-yellow-900">{schedules.length}</div>
          </div>
        </div>
        
        {/* 최근 등록된 공지 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Anuncios Recientes</h2>
            <Link href="/notice" className="text-xs text-sky-600">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {notices.map((notice) => (
              <NoticeCard 
                key={notice.id} 
                notice={notice}
                onClick={() => setSelectedNotice(notice)}
              />
            ))}
          </div>
        </div>
        
        {/* 다가오는 봉사 일정 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Próximos Servicios</h2>
            <Link href="/service" className="text-xs text-sky-600">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onClick={() => setSelectedSchedule(schedule)}
              />
            ))}
          </div>
        </div>
        
        {/* 요일별 정기 봉사 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Servicios Semanales</h2>
            <Link href="/service/weekly" className="text-xs text-sky-600">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <WeeklyServiceCard 
                key={day} 
                day={day} 
                services={weeklySchedules[day]}
              />
            ))}
          </div>
        </div>
        
        {/* 회관 청소 그룹 정보 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Limpieza de Salón</h2>
            <Link href="/cleaning" className="text-xs text-sky-600">Ver histórico →</Link>
          </div>
          <CleaningGroupCard group={cleaningGroup} />
        </div>
        
        {/* 모달 컴포넌트 */}
        {selectedNotice && (
          <NoticeDetailModal 
            notice={selectedNotice}
            onClose={() => setSelectedNotice(null)}
          />
        )}
        
        {selectedSchedule && (
          <ScheduleModal 
            schedule={selectedSchedule} 
            onClose={() => setSelectedSchedule(null)}
          />
        )}
      </div>
    </Layout>
  );
}; 