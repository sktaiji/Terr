'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, addMonths, subMonths, addDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import Layout from '../components/Layout';

// 봉사 카테고리 정보
const serviceCategories = [
  { id: 'house', name: 'Casas', emoji: '🏠' },
  { id: 'revisit', name: 'Revisitas/Estudios', emoji: '📚' },
  { id: 'cart', name: 'Carrito', emoji: '🛒' },
  { id: 'letter', name: 'Cartas/Llamadas', emoji: '✉️' }
];

// 카테고리 ID로 카테고리 정보 찾기 (메모이제이션)
const getCategoryById = (categoryId) => {
  return serviceCategories.find(cat => cat.id === categoryId) || serviceCategories[0]; // 기본값은 호별
};

// 봉사 카드 컴포넌트 - 불필요한 리렌더링 방지를 위해 memo 사용 고려
const ServiceCard = ({ service, onRegister, onToggleCart }) => {
  // service 객체가 없거나 date가 없는 경우 처리
  if (!service || !service.date) {
    return <div className="bg-white rounded-lg shadow-sm p-3">데이터 로딩 중...</div>;
  }

  const isToday = format(parseISO(service.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isUpcoming = new Date(service.date) > new Date();
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-3 ${isToday ? 'ring-2 ring-sky-300' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <span className="text-lg mr-1.5">
            {service.category === 'house' ? '🏠' : 
             service.category === 'revisit' ? '📚' : 
             service.category === 'cart' ? '🛒' : '✉️'}
          </span>
          <h3 className="font-medium text-base">{service.title || service.location}</h3>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {format(parseISO(service.date), 'HH:mm')}
        </span>
      </div>
      
      <div className="mb-1.5">
        <p className="text-xs text-gray-600 mb-0.5">{service.location}</p>
        <p className="text-xs text-gray-500">
          <span className="inline-flex bg-sky-50 text-sky-700 rounded px-1.5 mr-1">
            <span className="font-medium">{service.participants?.length || 0}</span>/{service.maxParticipants || 0}
          </span>
          Capitán: {service.captain || 'Sin asignar'}
        </p>
      </div>
      
      {service.participants?.length > 0 && (
        <div className="mb-1.5">
        <div className="flex flex-wrap gap-1">
            {service.participants.filter(p => p.isRegular).map((participant, idx) => (
              <span key={idx} className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium">
                {participant.name}
              </span>
            ))}
            {service.participants.filter(p => !p.isRegular).map((participant, idx) => (
              <span key={idx} className="inline-block bg-sky-100 rounded-full px-2 py-0.5 text-xs font-medium">
                {participant.name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        {onToggleCart && (
                    <button
            onClick={() => onToggleCart(service)}
            className={`text-xs rounded px-2 py-1 ${
              service.inCart 
                ? 'bg-sky-100 text-sky-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {service.inCart ? 'En carrito' : 'Agregar al carrito'}
                  </button>
              )}
        
        {onRegister && isUpcoming && service.category === 'cart' && (service.participants?.length || 0) < service.maxParticipants && (
            <button
            onClick={() => onRegister(service)}
            className="text-xs bg-sky-500 hover:bg-sky-600 text-white rounded px-2 py-1"
            >
            Solicitar participación
            </button>
        )}
      </div>
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
        h-16 p-2 border transition-all cursor-pointer
        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-gray-50'}
        ${isToday ? 'border-sky-500 ring-1 ring-sky-200' : 'border-gray-200'}
        ${isSelected ? 'bg-sky-50 border-sky-500 shadow-sm' : ''}
        rounded-lg
      `}
    >
      <div className="flex flex-col h-full">
        <div className={`text-right text-sm font-medium
          ${!isCurrentMonth ? 'text-gray-400' : isToday ? 'text-sky-600' : ''}
          ${date.getDay() === 0 ? 'text-sky-600' : date.getDay() === 6 ? 'text-sky-600' : ''}
        `}>
          {date.getDate()}
        </div>
        
        {Object.keys(categories).length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1 justify-center">
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

// 검색 모달 컴포넌트
const SearchModal = ({ isOpen, onClose, onSubmit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ term: searchTerm, type: searchType });
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Buscar Servicios</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Término de búsqueda
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Ubicación, capitán..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de servicio
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="all">Todos los servicios</option>
                <option value="house">Casas</option>
                <option value="revisit">Revisitas/Estudios</option>
                <option value="cart">Carrito</option>
                <option value="letter">Cartas/Llamadas</option>
              </select>
            </div>
            
            <button 
              type="submit"
              className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// 참여 신청 모달 컴포넌트
const RegisterModal = ({ isOpen, onClose, onSubmit, service, publishers }) => {
  const [selectedPublisherId, setSelectedPublisherId] = useState('');
  
  // 전시대 가능한 출판자만 필터링
  const eligiblePublishers = publishers.filter(publisher => publisher.isCart);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPublisherId) {
      onSubmit(selectedPublisherId);
      onClose();
    }
  };
  
  if (!isOpen || !service) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Solicitar participación</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seleccione su nombre
              </label>
              {eligiblePublishers.length > 0 ? (
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  value={selectedPublisherId}
                  onChange={(e) => setSelectedPublisherId(e.target.value)}
                  required
                >
                  <option value="">-- Seleccione --</option>
                  {eligiblePublishers.map(publisher => (
                    <option key={publisher.id} value={publisher.id}>
                      {publisher.name} {publisher.gender === 'brother' ? '(Hermano)' : '(Hermana)'}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-red-600">No hay publicadores elegibles registrados para el carrito.</p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={!selectedPublisherId || eligiblePublishers.length === 0}
                className={`flex-1 py-2 bg-sky-500 text-white rounded-lg transition-colors ${
                  !selectedPublisherId || eligiblePublishers.length === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-sky-600'
                }`}
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function ServicePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [sortType, setSortType] = useState('latest');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  
  // 초기 데이터 로드
  useEffect(() => {
    // 로컬 스토리지에서 서비스 일정 불러오기
    const savedServices = JSON.parse(localStorage.getItem('schedules') || '[]');
    
    // 서비스 데이터 가공 및 설정
    const processedServices = savedServices.map(service => ({
      ...service,
      date: service.date || format(new Date(), 'yyyy-MM-dd'),
      participants: service.participants || []
    }));
    
    setServices(processedServices);
    
    // 오늘 날짜 선택 처리
    setSelectedDate(startOfDay(new Date()));
    
    // 출판자 데이터 불러오기
      const savedPublishers = JSON.parse(localStorage.getItem('publishers') || '[]');
      setPublishers(savedPublishers);
    
    // 장바구니 데이터 불러오기
    const savedCartItems = JSON.parse(localStorage.getItem('serviceCart') || '[]');
    setCartItems(savedCartItems);
  }, []);
  
  // 일정 필터링 (선택된 날짜에 따라)
  useEffect(() => {
    if (!selectedDate) return;
    
    // 현재 선택된 날짜의 서비스 찾기
    const filtered = services.filter(service => {
      const serviceDate = parseISO(service.date);
      return isSameDay(serviceDate, selectedDate);
    });
    
    // 정렬 적용
    const sorted = sortServices(filtered, sortType);
    
    // 장바구니 상태 업데이트
    const withCartStatus = sorted.map(service => ({
      ...service,
      inCart: cartItems.some(item => item.id === service.id)
    }));
    
    setFilteredServices(withCartStatus);
  }, [selectedDate, services, cartItems, sortType]);
  
  // 서비스 정렬 함수
  const sortServices = (servicesToSort, type) => {
    const sorted = [...servicesToSort];
    
    if (type === 'latest') {
      // 최신순 정렬 (날짜 및 시간)
      sorted.sort((a, b) => {
        const dateA = parseISO(`${a.date}T${a.time}`);
        const dateB = parseISO(`${b.date}T${b.time}`);
        return dateA - dateB;
      });
    } else if (type === 'type') {
      // 종류별 정렬
      const order = { house: 1, revisit: 2, cart: 3, letter: 4 };
      sorted.sort((a, b) => {
        return (order[a.category] || 99) - (order[b.category] || 99);
      });
    }
    
    return sorted;
  };
  
  // 정렬 변경 핸들러
  const handleSortChange = (sortType) => {
    setSortType(sortType);
  };
  
  // 이전/다음 달 이동 핸들러
  const handleMonthChange = (delta) => {
    setCurrentDate(current => {
      const newDate = delta > 0 ? addMonths(current, 1) : subMonths(current, 1);
      return newDate;
    });
  };
  
  // 검색 핸들러
  const handleSearch = ({ term, type }) => {
    if (!term && type === 'all') {
      // 검색 조건이 없으면 기본 상태로 돌아가기
      const today = startOfDay(new Date());
      setSelectedDate(today);
      return;
    }
    
    // 검색 조건에 맞는 서비스 찾기
    let searchResults = [...services];
    
    if (type !== 'all') {
      searchResults = searchResults.filter(service => service.category === type);
    }
    
    if (term) {
      const searchTerm = term.toLowerCase();
      searchResults = searchResults.filter(service => 
        (service.location && service.location.toLowerCase().includes(searchTerm)) ||
        (service.captain && service.captain.toLowerCase().includes(searchTerm))
      );
    }
    
    if (searchResults.length > 0) {
      // 검색 결과가 있으면 가장 가까운 날짜의 서비스 선택
      const firstResult = searchResults[0];
      setSelectedDate(parseISO(firstResult.date));
    }
  };
  
  // 참여 신청 핸들러
  const handleRegister = (scheduleId, publisherId) => {
    const selectedPublisher = publishers.find(p => p.id === publisherId);
    
    if (!selectedPublisher) return;
    
    const updatedServices = services.map(service => {
      if (service.id === scheduleId) {
        // 중복 참여 방지
        const isAlreadyRegistered = service.participants.some(p => p.id === publisherId);
        
        if (!isAlreadyRegistered) {
          const updatedParticipants = [
            ...service.participants,
            {
              id: publisherId,
              name: selectedPublisher.name,
              isRegular: false
            }
          ];
          
          return {
            ...service,
            participants: updatedParticipants
          };
        }
      }
      return service;
    });
    
    setServices(updatedServices);
    localStorage.setItem('schedules', JSON.stringify(updatedServices));
  };
  
  // 장바구니 토글 핸들러
  const handleToggleCart = (service) => {
    let updatedCart;
    
    if (cartItems.some(item => item.id === service.id)) {
      // 이미 장바구니에 있으면 제거
      updatedCart = cartItems.filter(item => item.id !== service.id);
    } else {
      // 없으면 추가
      updatedCart = [...cartItems, { 
        id: service.id, 
        date: service.date,
        time: service.time,
        location: service.location,
        category: service.category
      }];
    }
    
    setCartItems(updatedCart);
    localStorage.setItem('serviceCart', JSON.stringify(updatedCart));
  };
  
  // 참여 신청 모달 열기 핸들러
  const openRegisterModal = (service) => {
    setSelectedService(service);
    setRegisterModalOpen(true);
  };
  
  // 캘린더 데이터 생성
  const calendarDays = useMemo(() => {
    // 캘린더 데이터 생성 로직 (첫날과 마지막날, 및 이전/다음 달 표시 일 계산)
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // 이전 달 마지막 일 계산
    const prevMonthDays = startingDayOfWeek;
    
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isSelected: selectedDate && isSameDay(date, selectedDate),
        categories: {}
      });
    }
    
    // 현재 달 일 계산
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
        isSelected: selectedDate && isSameDay(date, selectedDate),
        categories: {}
      });
    }
    
    // 서비스 일정 데이터 캘린더에 추가
    services.forEach(service => {
      const serviceDate = parseISO(service.date);
      
      // 현재 표시 중인 월과 같은지 확인
      if (serviceDate.getMonth() === month && serviceDate.getFullYear() === year) {
        const dayIndex = days.findIndex(day => 
          day.isCurrentMonth && day.date.getDate() === serviceDate.getDate()
        );
        
        if (dayIndex !== -1) {
          const categoryId = service.category || 'other';
          days[dayIndex].categories[categoryId] = (days[dayIndex].categories[categoryId] || 0) + 1;
        }
      }
    });
    
    return days;
  }, [currentDate, services, selectedDate]);
  
  // 주간 집단 봉사 데이터 (예시 데이터)
  const groupServices = [
    { id: 'group1', date: '2024-07-15', title: '집단 봉사', location: 'Plaza Central', captain: 'Juan Carlos' },
    { id: 'group2', date: '2024-07-29', title: '집단 봉사', location: 'Norte Shopping', captain: 'María García' },
  ];
  
  // 봉사 감독자 방문 데이터 (예시 데이터)
  const supervisorVisit = { date: '2024-07-20', name: 'Carlos Rodríguez' };
  
  // 요일 이름 배열
  const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Servicios</h1>
      </div>
      
      {/* 캘린더 섹션 */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <button
              onClick={() => handleMonthChange(-1)}
              className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Mes anterior"
          >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
            <h2 className="text-lg font-medium text-gray-800">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <button
              onClick={() => handleMonthChange(1)}
              className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Mes siguiente"
          >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
          {/* 캘린더 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-1">
            {weekdayNames.map((day, idx) => (
              <div 
                key={idx}
                className={`text-center text-sm font-medium py-1
                  ${idx === 0 || idx === 6 ? 'text-sky-600' : 'text-gray-600'}
                `}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* 캘린더 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => (
                <CalendarDay 
                key={idx} 
                  day={day} 
                onClick={(date) => setSelectedDate(date)}
                />
              ))}
            </div>
        </div>
        
        {/* 정렬 및 검색 옵션 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${sortType === 'latest' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'}
              `}
              onClick={() => handleSortChange('latest')}
            >
              Por fecha
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${sortType === 'type' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'}
              `}
              onClick={() => handleSortChange('type')}
            >
              Por tipo
            </button>
            </div>
          
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center px-3 py-1.5 bg-white text-sky-700 rounded-lg border border-sky-200 hover:bg-sky-50 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar
          </button>
        </div>
        
        {/* 서비스 목록 섹션 */}
        {selectedDate && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3 text-gray-800">
              Servicios para {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
            </h2>
            
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredServices.map(service => (
                  <ServiceCard 
                    key={service.id} 
                    service={service}
                    onRegister={() => openRegisterModal(service)}
                    onToggleCart={handleToggleCart}
              />
            ))}
          </div>
        ) : (
              <div className="bg-white rounded-lg p-6 text-center text-gray-500 shadow-sm">
                <p>No hay servicios programados para esta fecha.</p>
              </div>
            )}
          </div>
        )}
        
        {/* 집단 봉사 섹션 */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="text-lg font-medium mb-3 text-gray-800">Servicio en Grupo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-sky-50 rounded-lg p-3">
              <h3 className="font-medium mb-2 text-sky-700">Campaña de este mes</h3>
              <div className="text-sm">
                {groupServices.map(service => (
                  <div key={service.id} className="mb-2 last:mb-0 border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{format(parseISO(service.date), 'dd/MM/yyyy', { locale: es })}</span>
                      <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                        Grupo
                      </span>
                    </div>
                    <p>{service.location}</p>
                    <p className="text-xs text-gray-500">Capitán: {service.captain}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-sky-50 rounded-lg p-3">
              <h3 className="font-medium mb-2 text-sky-700">Visita del Superintendente</h3>
              {supervisorVisit ? (
                <div className="text-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{format(parseISO(supervisorVisit.date), 'dd/MM/yyyy', { locale: es })}</span>
                    <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                      Visita
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Superintendente: {supervisorVisit.name}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay visitas programadas para este mes.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* 검색 모달 */}
        <SearchModal 
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onSubmit={handleSearch}
        />
        
        {/* 참여 신청 모달 */}
        <RegisterModal
          isOpen={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          onSubmit={(publisherId) => handleRegister(selectedService?.id, publisherId)}
          service={selectedService}
          publishers={publishers.filter(p => p.isCart)}
        />
      </div>
    </Layout>
  );
} 