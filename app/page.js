'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isBefore, isAfter, addDays, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

// 샘플 데이터 - 최근 공지사항 및 봉사 일정
const notices = [
  { id: 1, title: '6월 봉사활동 계획 안내', date: '2023-06-01', type: '공지' },
  { id: 2, title: '신규 봉사자 교육 일정', date: '2023-06-05', type: '안내' },
  { id: 3, title: '전시대 봉사 장소 변경 안내', date: '2023-06-08', type: '중요' },
];

const schedules = [
  { id: 1, title: '중앙역 광장 전시대', date: '2023-06-10', participants: 2, max: 6 },
  { id: 2, title: '시민 공원 봉사활동', date: '2023-06-15', participants: 3, max: 6 },
  { id: 3, title: '북부 전시관 안내', date: '2023-06-20', participants: 1, max: 4 },
];

// 공지사항 카테고리 이모티콘
const categoryEmojis = {
  '회중': '🏛️',
  '순회구': '🔄',
  '기타': '📢'
};

// 중요도 이모티콘
const importanceLevelEmojis = {
  'high': '🔼',
  'medium': '⏺️',
  'low': '🔽'
};

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

// 공지사항 카드 컴포넌트
const NoticeCard = ({ notice, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center mb-2">
        <span className="text-xl mr-2">{categoryEmojis[notice.category]}</span>
        <h3 className="font-bold text-lg">{notice.title}</h3>
        {notice.importance === 'high' && (
          <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Importante</span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-2">{notice.date} • {notice.category}</p>
      <p className="text-gray-700 line-clamp-2">{notice.content}</p>
    </div>
  );
};

// 봉사 일정 카드 컴포넌트
const ScheduleCard = ({ schedule, onClick }) => {
  const date = parseISO(schedule.date);
  const formattedDate = format(date, 'MM.dd (EEE)', { locale: ko });
  const guidesCount = schedule.participants.length;
  const category = getCategoryById(schedule.category);
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between mb-2">
        <div className="flex items-center">
          <span className="text-xl mr-2">{category.emoji}</span>
          <h3 className="font-bold">{schedule.location}</h3>
        </div>
        <span className="text-sm font-medium text-blue-600">
          {guidesCount}/{schedule.maxParticipants} personas
        </span>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{schedule.time}</span>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{category.name}</span>
      </div>
    </div>
  );
};

// 공지사항 모달 컴포넌트
const NoticeModal = ({ notice, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-2">{categoryEmojis[notice.category]}</span>
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
          <p className="text-sm text-gray-500 mb-4">{notice.date} • {notice.category}</p>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-gray-700 whitespace-pre-line">{notice.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 봉사 일정 모달 컴포넌트
const ScheduleModal = ({ schedule, onClose, onApply }) => {
  const [name, setName] = useState('');
  const date = parseISO(schedule.date);
  const formattedDate = format(date, 'yyyy년 MM월 dd일 (EEE)', { locale: ko });
  const guidesCount = schedule.participants.length;
  const isFull = guidesCount >= schedule.maxParticipants;
  const category = getCategoryById(schedule.category);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && !isFull) {
      onApply(name.trim());
      setName('');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center flex-wrap">
              <span className="text-2xl mr-2">{category.emoji}</span>
              <h2 className="text-xl font-bold">{schedule.location}</h2>
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{category.name}</span>
              {schedule.isRecurring && (
                <span className="ml-2 mt-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Recurrente Semanal</span>
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
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-700">{formattedDate}</p>
            </div>
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-700">{schedule.time}</p>
            </div>
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-700">Guías: {guidesCount}/{schedule.maxParticipants} personas</p>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4 mb-4">
            <h3 className="font-medium mb-2">Lista de Guías</h3>
            {schedule.participants.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {schedule.participants.map((participant, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                  >
                    {participant}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay guías registrados.</p>
            )}
          </div>
          
          {!isFull && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-medium mb-2">Solicitud de Servicio</h3>
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ingrese su nombre"
                  className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Solicitar
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [notices, setNotices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  
  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 공지사항 불러오기
      const savedNotices = JSON.parse(localStorage.getItem('notices') || '[]');
      setNotices(savedNotices);
      
      // 봉사 일정 불러오기
      const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      setSchedules(savedSchedules);
    }
  }, []);
  
  // 오늘 날짜
  const today = startOfDay(new Date());
  
  // 공지사항 정렬 (중요도 내림차순, 날짜 내림차순) 및 지난 공지사항 필터링
  const sortedNotices = [...notices]
    .filter(notice => {
      // 공지사항은 당일까지 표시
      const noticeDate = parseISO(notice.date);
      return !isBefore(noticeDate, today);
    })
    .sort((a, b) => {
      // 먼저 중요도로 정렬
      const importanceOrder = { 'high': 0, 'medium': 1, 'low': 2 };
      if (importanceOrder[a.importance] !== importanceOrder[b.importance]) {
        return importanceOrder[a.importance] - importanceOrder[b.importance];
      }
      // 다음으로 날짜 내림차순 정렬
      return new Date(b.date) - new Date(a.date);
    });
  
  // 다가오는 일정 필터링 및 정렬 (날짜 오름차순)
  const upcomingSchedules = schedules
    .filter(schedule => {
      // 지난 일정 제외
      const scheduleDate = startOfDay(parseISO(schedule.date));
      return !isBefore(scheduleDate, today);
    })
    .sort((a, b) => parseISO(a.date) - parseISO(b.date));
  
  // 봉사 신청 핸들러
  const handleApply = (name) => {
    if (selectedSchedule) {
      const updatedSchedules = schedules.map(schedule =>
        schedule.id === selectedSchedule.id
          ? {
              ...schedule,
              participants: [...schedule.participants, name]
            }
          : schedule
      );
      
      // 로컬 스토리지에 저장
      localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
      setSchedules(updatedSchedules);
      
      // 선택된 일정 업데이트
      const updatedSchedule = updatedSchedules.find(s => s.id === selectedSchedule.id);
      setSelectedSchedule(updatedSchedule);
    }
  };
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* 상단 배너 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <h1 className="font-bold text-xl sm:text-2xl mb-2">Congregación Viaducto Chino</h1>
        <p>Gracias por su amor y esfuerzo</p>
      </div>
      
      {/* 공지사항 섹션 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg sm:text-xl">Anuncios</h2>
          <Link href="/admin/notices" className="text-sm text-blue-600 hover:underline">
            Ver más
          </Link>
        </div>
        
        {sortedNotices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedNotices.slice(0, 4).map(notice => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                onClick={() => setSelectedNotice(notice)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            <p>No hay anuncios para mostrar.</p>
          </div>
        )}
      </div>
      
      {/* 다가오는 봉사 일정 섹션 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg sm:text-xl">Próximos Horarios de Servicio</h2>
          <Link 
            href="/volunteer"
            className="text-sm text-blue-600 hover:underline"
          >
            Ver más horarios
          </Link>
        </div>
        
        {upcomingSchedules.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {upcomingSchedules.slice(0, 6).map(schedule => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onClick={() => setSelectedSchedule(schedule)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            <p>No hay horarios de servicio para mostrar.</p>
          </div>
        )}
      </div>
      
      {/* 모달 */}
      {selectedNotice && (
        <NoticeModal
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
        />
      )}
      
      {selectedSchedule && (
        <ScheduleModal
          schedule={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          onApply={handleApply}
        />
      )}
    </div>
  );
} 