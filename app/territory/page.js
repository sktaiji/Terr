'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { format, parseISO, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import Layout from '../components/Layout';

// 날짜 관련 유틸리티 함수들 - 단순화
// 기존 isValidDateString 함수 삭제
// safeFormatDate 함수만 유지

// safeFormatDate 함수 개선
const safeFormatDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    // 유효한 날짜 문자열인지 확인 (간단히)
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // 파싱할 수 없는 경우 원본 반환
    }
    
    // yyyy-MM-dd 형식 반환
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('날짜 포맷 오류:', error);
    return dateString; // 오류 발생 시 원본 반환
  }
};

// 완성 날짜 계산 유틸리티 함수 - find 대신 filter 사용
const getCompletionDate = (territory) => {
  if (!territory || !territory.status) return null;
  
  if ((territory.status === 'completado' || territory.status === 'completed') && territory.history) {
    try {
      // 배열인지 확인하고 안전하게 복사
      const historyArray = Array.isArray(territory.history) ? [...territory.history] : [];
      
      // find 대신 filter 사용하고 결과 배열에서 첫 번째 항목 가져오기
      const completedEntries = historyArray
        .filter(entry => entry && typeof entry === 'object') // 객체인지 확인
        .filter(entry => entry.date && typeof entry.date === 'string') // 날짜 필드가 있는지 확인
        .filter(entry => entry.status && 
               (entry.status === 'completado' || entry.status === 'completed')) // 상태 확인
        .sort((a, b) => {
          // 타임스탬프로 정렬 시도, 없으면 날짜 문자열로 비교
          if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp; // 최신 항목을 먼저
          }
          try {
            return new Date(b.date) - new Date(a.date); // 날짜 내림차순 정렬
          } catch (e) {
            return 0;
          }
        });
      
      // 배열이 비어있지 않은지 확인 후 첫 번째 항목 사용
      if (completedEntries.length > 0) {
        const lastCompletedEntry = completedEntries[0];
        if (lastCompletedEntry && lastCompletedEntry.date) {
          return lastCompletedEntry.date;
        }
      }
    } catch (error) {
      console.error('히스토리 처리 오류:', error);
    }
  }
  
  // 히스토리에서 찾지 못한 경우 lastWorkedDate 사용
  if (territory.lastWorkedDate && typeof territory.lastWorkedDate === 'string') {
    return territory.lastWorkedDate;
  }
  
  return null;
};

// 시작 날짜 계산 유틸리티 함수 - find 대신 filter 사용
const getStartDate = (territory) => {
  if (!territory) return null;
  
  if (territory.history) {
    try {
      // 배열인지 확인하고 안전하게 복사
      const historyArray = Array.isArray(territory.history) ? [...territory.history] : [];
      
      // find 대신 filter 사용하고 결과 배열에서 첫 번째 항목 가져오기
      const startEntries = historyArray
        .filter(entry => entry && typeof entry === 'object') // 객체인지 확인
        .filter(entry => entry.date && typeof entry.date === 'string') // 날짜 필드가 있는지 확인
        .filter(entry => entry.status && 
               (entry.status === 'inicio' || entry.status === 'available')) // 상태 확인
        .sort((a, b) => {
          try {
            return new Date(a.date) - new Date(b.date); // 날짜 오름차순 정렬
          } catch (e) {
            return 0;
          }
        });
      
      // 배열이 비어있지 않은지 확인 후 첫 번째 항목 사용
      if (startEntries.length > 0) {
        const firstStartEntry = startEntries[0];
        if (firstStartEntry && firstStartEntry.date) {
          return firstStartEntry.date;
        }
      }
    } catch (error) {
      console.error('히스토리 처리 오류:', error);
    }
  }
  
  // 히스토리에서 찾지 못한 경우 assignedDate 사용
  if (territory.assignedDate && typeof territory.assignedDate === 'string') {
    return territory.assignedDate;
  }
  
  return null;
};

// Emojis for categories (more subtle)
const categoryEmojis = {
  'Centro': '🏛️',
  'Norte': '🌲',
  'Sur': '🏝️',
  'Este': '🌅',
  'Oeste': '🌇',
};

// Place type emojis (more subtle)
const placeTypeEmojis = {
  'Tienda': '🛒',
  'Restaurante': '🍴',
  'Casa': '🏡',
  'Oficina': '💼',
  'Almacén': '📦',
  'Otros': '📍',
};

// Status colors (unified to light blue tones)
const statusColors = {
  'available': 'bg-sky-100 text-sky-700',
  'assigned': 'bg-sky-200 text-sky-700',
  'completed': 'bg-sky-300 text-sky-700',
  'inactive': 'bg-gray-100 text-gray-700',
  'inicio': 'bg-sky-100 text-sky-700',
  'proceso': 'bg-sky-200 text-sky-700',
  'completado': 'bg-sky-300 text-sky-700',
};

// Territory status badge component
const TerritoryStatusBadge = ({ status }) => {
  const statusNames = {
    'available': 'Disponible',
    'assigned': 'Asignado',
    'completed': 'Completado',
    'inactive': 'Inactivo',
    'inicio': 'Inicio',
    'proceso': 'Proceso',
    'completado': 'Completado',
  };
  
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[status] || statusColors.inactive}`}>
      {statusNames[status] || 'Desconocido'}
    </span>
  );
};

// Territory status summary component
const TerritoryStatusSummary = ({ territories }) => {
  const available = territories.filter(t => t.status === 'available').length;
  const assigned = territories.filter(t => t.status === 'assigned').length;
  const completed = territories.filter(t => t.status === 'completed').length;
  const total = territories.length;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
      <h3 className="text-lg font-medium mb-2">Estado de Territorios</h3>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-2xl font-bold text-sky-700">{total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-sky-700">{available}</div>
          <div className="text-xs text-gray-500">Disponibles</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-sky-700">{assigned}</div>
          <div className="text-xs text-gray-500">Asignados</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-sky-700">{completed}</div>
          <div className="text-xs text-gray-500">Completados</div>
        </div>
      </div>
    </div>
  );
};

// Territory card component - admin/territory 페이지와 유사하게 수정
const TerritoryCard = ({ territory, onClick, onChangeStatus }) => {
  // 상태 변경 핸들러
  const handleStatusChange = (newStatus, e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    
    if (onChangeStatus && typeof onChangeStatus === 'function') {
      try {
        const now = new Date();
        const dateStr = format(now, 'yyyy-MM-dd');
        
        const historyEntry = {
          date: dateStr,
          status: newStatus,
          timestamp: now.getTime(),
        };
        
        onChangeStatus(territory.id, newStatus, historyEntry);
      } catch (error) {
        console.error('상태 변경 오류:', error);
      }
    }
  };
  
  // 완성된 구역은 흑백으로 표시
  const isCompleted = territory.status === 'completed' || territory.status === 'completado';
  
  // URL에서 파일명 추출 - 안전하게 처리
  const getFileName = () => {
    // URL이 없는 경우
    if (!territory || !territory.url) return '';
    
    try {
      // 문자열이 아닌 경우 처리
      if (typeof territory.url !== 'string') {
        return 'PDF';
      }
      
      let fileName = 'PDF';
      
      try {
        // URL 객체 생성 시도
        const url = new URL(territory.url);
        
        // 경로가 있는지 확인
        if (url.pathname) {
          // split 대신 lastIndexOf와 substring 사용
          const lastSlashIndex = url.pathname.lastIndexOf('/');
          if (lastSlashIndex !== -1 && lastSlashIndex < url.pathname.length - 1) {
            fileName = url.pathname.substring(lastSlashIndex + 1);
            
            // URL 디코딩 시도
            try {
              fileName = decodeURIComponent(fileName);
            } catch (e) {
              // 디코딩 실패 시 원본 사용
            }
            
            // 파일명이 비어있는 경우
            if (!fileName) {
              return 'PDF';
            }
            
            // 파일명이 너무 길면 축약
            if (fileName.length > 15) {
              return fileName.substring(0, 12) + '...';
            }
          }
        }
      } catch (e) {
        // URL 파싱 실패 시 단순 파일명 추출 시도
        const urlStr = territory.url.toString();
        const lastSlashIndex = urlStr.lastIndexOf('/');
        
        if (lastSlashIndex !== -1 && lastSlashIndex < urlStr.length - 1) {
          fileName = urlStr.substring(lastSlashIndex + 1);
          
          // 파일명이 너무 길면 축약
          if (fileName.length > 15) {
            return fileName.substring(0, 12) + '...';
          }
        }
      }
      
      return fileName;
    } catch (e) {
      console.error('파일명 추출 오류:', e);
      return 'PDF';
    }
  };
  
  // 날짜 정보 가져오기 - 안전하게 처리
  const lastWorkedDate = territory.lastWorkedDate ? safeFormatDate(territory.lastWorkedDate) : null;
  
  // 완성 날짜 계산 및 포맷팅
  const completionDateValue = getCompletionDate(territory);
  const formattedCompletionDate = completionDateValue ? safeFormatDate(completionDateValue) : null;
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm p-3 border border-sky-50 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow ${isCompleted ? 'grayscale' : ''}`}
      onClick={() => onClick(territory)}
    >
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="text-sm mr-1">🗺️</span>
            <h3 className="font-medium text-sm">{territory.number}</h3>
            {territory.url && (
              <span className="ml-1 text-xs text-gray-500 truncate max-w-[120px]">- {getFileName()}</span>
            )}
          </div>
          <TerritoryStatusBadge status={territory.status} />
        </div>
        
        <div className="grid grid-cols-1 gap-1 text-sm mb-2">
          {territory.description && (
            <div className="flex justify-between">
              <span className="text-gray-500">Descripción:</span>
              <span className="font-medium truncate max-w-[60%] text-right">
                {territory.description}
              </span>
            </div>
          )}
          {territory.address && (
            <div className="flex justify-between">
              <span className="text-gray-500">Dirección:</span>
              <SafeLink 
                href={`https://www.google.com/maps/search/?api=1&query=${safeEncodeURIComponent(territory.address)}`} 
                className="text-sky-600 text-sm hover:underline truncate max-w-[60%] text-right"
                onClick={(e) => e.stopPropagation()}
              >
                {territory.address}
              </SafeLink>
            </div>
          )}
          {territory.assignedTo && (
            <div className="flex justify-between">
              <span className="text-gray-500">Publicador:</span>
              <span className="font-medium truncate max-w-[60%] text-right">{territory.assignedTo}</span>
            </div>
          )}
          {lastWorkedDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">Trabajado:</span>
              <span className="font-medium text-green-600">{lastWorkedDate}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-auto">
        <div className="flex gap-1 mb-1">
          <button
            className={`flex-1 text-center py-1 px-1 text-sm font-medium rounded ${
              territory.status === 'inicio' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
            }`}
            onClick={(e) => handleStatusChange('inicio', e)}
          >
            Inicio
          </button>
          <button
            className={`flex-1 text-center py-1 px-1 text-sm font-medium rounded ${
              territory.status === 'proceso' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
            }`}
            onClick={(e) => handleStatusChange('proceso', e)}
          >
            Proceso
          </button>
          <button
            className={`flex-1 text-center py-1 px-1 text-sm font-medium rounded ${
              territory.status === 'completado' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
            }`}
            onClick={(e) => handleStatusChange('completado', e)}
          >
            Comp.
          </button>
        </div>
      </div>
    </div>
  );
};

// Territory modal component with PDF display - 레이아웃 수정
const TerritoryModal = ({ territory, onClose, onAssign, onComplete, onMakeAvailable, onChangeStatus }) => {
  const mapRef = useRef(null);
  const mapInitializedRef = useRef(false);
  
  if (!territory) return null;
  
  const isAssigned = territory.status === 'assigned';
  const isCompleted = territory.status === 'completed' || territory.status === 'completado';
  const isAvailable = territory.status === 'available';
  
  // 주소 처리 함수 추가
  const processAddress = (address) => {
    if (!address || typeof address !== 'string') return '';
    try {
      return address.trim();
    } catch (e) {
      console.error('주소 처리 오류:', e);
      return '';
    }
  };
  
  // 상태 텍스트 가져오기 함수 추가
  const getStatusText = (status) => {
    const statusNames = {
      'available': 'Disponible',
      'assigned': 'Asignado',
      'completed': 'Completado',
      'inactive': 'Inactivo',
      'inicio': 'Inicio',
      'proceso': 'Proceso',
      'completado': 'Completado',
    };
    
    return statusNames[status] || 'Desconocido';
  };
  
  // 상태 색상 가져오기 함수 추가
  const getStatusColor = (status) => {
    const statusColors = {
      'available': 'sky-700',
      'assigned': 'sky-700',
      'completed': 'sky-700',
      'inactive': 'gray-700',
      'inicio': 'sky-700',
      'proceso': 'sky-700',
      'completado': 'sky-700',
    };
    
    return statusColors[status] || 'gray-500';
  };
  
  // Badge 컴포넌트 추가
  const Badge = ({ children, color = 'gray-500' }) => {
    // 클래스 이름 매핑 없이 직접 하드코딩
    let className = 'inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500';
    
    // 가장 많이 사용하는 색상에 대해서만 직접 하드코딩
    if (color === 'sky-700') {
      className = 'inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-sky-100 text-sky-700';
    } else if (color === 'gray-700') {
      className = 'inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700';
    } else if (color === 'green-600') {
      className = 'inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-600';
    }
    
    return (
      <span className={className}>
        {children}
      </span>
    );
  };
  
  // 상태 변경 핸들러
  const handleStatusChange = (newStatus) => {
    if (onChangeStatus && typeof onChangeStatus === 'function') {
      try {
        const now = new Date();
        const dateStr = format(now, 'yyyy-MM-dd');
        
        const historyEntry = {
          date: dateStr,
          status: newStatus,
          timestamp: now.getTime(),
        };
        
        onChangeStatus(territory.id, newStatus, historyEntry);
      } catch (error) {
        console.error('상태 변경 오류:', error);
      }
    }
  };
  
  // 모달 내부에 renderHistoryItems 함수 추가
  const renderHistoryItems = (history) => {
    // 유효하지 않은 입력 처리
    if (!history || !Array.isArray(history) || history.length === 0) {
      return <p className="text-gray-500 text-sm">히스토리가 없습니다.</p>;
    }

    try {
      // 정렬 시도 (타임스탬프 > 날짜)
      const validHistoryItems = [...history].filter(entry => entry && typeof entry === 'object');
      validHistoryItems.sort((a, b) => {
        try {
          // 타임스탬프가 있으면 사용
          if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp;
          }
          
          // 날짜가 있으면 문자열 비교
          if (a.date && b.date) {
            return a.date > b.date ? -1 : 1;
          }
          
          // 날짜가 없는 항목은 맨 뒤로
          if (!a.date) return 1;
          if (!b.date) return -1;
          
          return 0;
        } catch (error) {
          return 0;
        }
      });
      
      // 항목 렌더링
      return (
        <ul className="space-y-2">
          {validHistoryItems.map((entry, index) => {
            // 안전하게 상태 텍스트와 색상 가져오기
            let statusText = '상태 없음';
            let statusColor = 'gray-500';
            
            if (entry.status) {
              try {
                statusText = getStatusText(entry.status) || '상태 없음';
                statusColor = getStatusColor(entry.status) || 'gray-500';
              } catch (error) {
                console.error('상태 처리 오류:', error);
              }
            }
            
            return (
              <li key={index} className="flex justify-between items-center">
                <span>
                  <Badge color={statusColor}>{statusText}</Badge>
                </span>
                <span className="text-gray-600 text-sm">
                  {entry.date ? safeFormatDate(entry.date) : '-'}
                </span>
              </li>
            );
          })}
        </ul>
      );
    } catch (error) {
      console.error('히스토리 렌더링 오류:', error);
      return <p className="text-red-500 text-sm">히스토리 표시 중 오류가 발생했습니다.</p>;
    }
  };
  
  // 구글 맵 표시 구성
  useEffect(() => {
    if (!mapRef.current || !territory.address || mapInitializedRef.current) return;
    
    // 주소로 지도 초기화
    const initializeMap = async () => {
      try {
        const geocoder = new google.maps.Geocoder();
        const processedAddress = processAddress(territory.address);
        
        geocoder.geocode({ address: processedAddress }, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            const location = results[0].geometry.location;
            const mapOptions = {
              center: location,
              zoom: 15,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            
            const map = new google.maps.Map(mapRef.current, mapOptions);
            new google.maps.Marker({
              map: map,
              position: location,
              title: territory.number
            });
            
            mapInitializedRef.current = true;
          } else {
            console.error('구글 지오코딩 오류:', status);
          }
        });
      } catch (error) {
        console.error('구글 맵 초기화 오류:', error);
      }
    };
    
    // 구글 맵스 API 로드 확인
    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBLJhQ9-z_-E4HRGbjQH8O0xvOcK3lV14Q&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    }
    
    return () => {
      mapInitializedRef.current = false;
    };
  }, [territory]);
  
  // 날짜 데이터 계산
  const startDate = getStartDate(territory);
  
  // completionDate와 startDate 포맷팅
  const completionDate = getCompletionDate(territory);
  const formattedCompletionDate = completionDate ? safeFormatDate(completionDate) : null;
  const formattedStartDate = startDate ? safeFormatDate(startDate) : null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <span className="text-2xl mr-2">🗺️</span>
            Territorio #{territory.number}
            <TerritoryStatusBadge status={territory.status} className="ml-2" />
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          {/* 상세 정보 섹션 - 위쪽 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-lg font-medium mb-3">Detalles del Territorio</h3>
              <div className="space-y-3">
                {territory.name && (
                  <div>
                    <span className="text-gray-500 block text-sm">Nombre:</span>
                    <span className="font-medium">{territory.name}</span>
                  </div>
                )}
                {territory.category && (
                  <div>
                    <span className="text-gray-500 block text-sm">Categoría:</span>
                    <span className="font-medium">{territory.category}</span>
                  </div>
                )}
                {territory.type && (
                  <div>
                    <span className="text-gray-500 block text-sm">Tipo:</span>
                    <span className="font-medium">{territory.type}</span>
                  </div>
                )}
                {territory.address && (
                  <div>
                    <span className="text-gray-500 block text-sm">Dirección:</span>
                    <div className="flex items-center">
                      <span className="mr-1">{territory.address}</span>
                      <SafeLink 
                        href={`https://www.google.com/maps/search/?api=1&query=${safeEncodeURIComponent(territory.address)}`} 
                        className="ml-1 text-sky-600 hover:text-sky-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </SafeLink>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium mb-3">Estado y fechas</h3>
              <div className="space-y-3">
                {territory.assignedTo && (
                  <div>
                    <span className="text-gray-500 block text-sm">Publicador:</span>
                    <span className="font-medium">{territory.assignedTo}</span>
                  </div>
                )}
                {startDate && (
                  <div>
                    <span className="text-gray-500 block text-sm">Fecha de inicio:</span>
                    <span className="font-medium">{formattedStartDate}</span>
                  </div>
                )}
                {completionDate && (
                  <div>
                    <span className="text-gray-500 block text-sm">Fecha de completado:</span>
                    <span className="font-medium text-green-600">{formattedCompletionDate}</span>
                  </div>
                )}
                
                {/* 상태 변경 버튼 */}
                <div className="mt-3">
                  <span className="text-gray-500 block text-sm mb-1">Estado actual:</span>
                  <div className="flex gap-2">
                    <button
                      className={`flex-1 text-center py-1 px-1 text-sm font-medium rounded ${
                        territory.status === 'inicio' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                      }`}
                      onClick={() => handleStatusChange('inicio')}
                    >
                      Inicio
                    </button>
                    <button
                      className={`flex-1 text-center py-1 px-1 text-sm font-medium rounded ${
                        territory.status === 'proceso' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                      }`}
                      onClick={() => handleStatusChange('proceso')}
                    >
                      Proceso
                    </button>
                    <button
                      className={`flex-1 text-center py-1 px-1 text-sm font-medium rounded ${
                        territory.status === 'completado' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                      }`}
                      onClick={() => handleStatusChange('completado')}
                    >
                      Comp.
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* PDF 뷰어 섹션 - 중앙 */}
          <div>
            <h3 className="text-lg font-medium mb-3">Documento PDF</h3>
            {territory.url ? (
              <div className="border rounded-lg overflow-hidden h-[500px]">
                <iframe
                  src={territory.url}
                  className="w-full h-full"
                  title={`Territorio #${territory.number} PDF`}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border rounded-lg p-8 h-[500px]">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No hay documento PDF disponible.</p>
              </div>
            )}
          </div>
          
          {/* 히스토리 및 액션 버튼 섹션 - 아래쪽 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Historial de estados</h3>
              {renderHistoryItems(territory.history)}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Acciones</h3>
              <div className="space-y-2">
                {isAvailable && (
                  <button 
                    onClick={() => onAssign && onAssign(territory)}
                    className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Asignar territorio
                  </button>
                )}
                
                {isAssigned && (
                  <button 
                    onClick={() => onComplete && onComplete(territory)}
                    className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Marcar como completado
                  </button>
                )}
                
                {isCompleted && (
                  <button 
                    onClick={() => onMakeAvailable && onMakeAvailable(territory)}
                    className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Hacer disponible de nuevo
                  </button>
                )}
                
                {territory.url && (
                  <SafeLink 
                    href={territory.url}
                    className="block w-full text-center py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    Descargar PDF
                  </SafeLink>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Assign territory modal component
const AssignTerritoryModal = ({ territory, onClose, onAssign, publishers }) => {
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  
  useEffect(() => {
    // Default due date setting (2 months from now)
    const defaultDueDate = addMonths(new Date(), 2);
    setDueDate(format(defaultDueDate, 'yyyy-MM-dd'));
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPublisher || !dueDate) return;
    
    onAssign(territory.id, {
      assignedTo: selectedPublisher,
      dueDate: dueDate,
      assignedDate: format(new Date(), 'yyyy-MM-dd'),
      group: groupNumber
    });
  };
  
  if (!territory) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Asignar territorio #{territory.number}</h2>
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
                Publicador*
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                value={selectedPublisher}
                onChange={(e) => setSelectedPublisher(e.target.value)}
                required
              >
                <option value="">-- Seleccionar publicador --</option>
                {publishers.map(publisher => (
                  <option key={publisher.id} value={publisher.name}>
                    {publisher.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grupo
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                value={groupNumber}
                onChange={(e) => setGroupNumber(e.target.value)}
              >
                <option value="">-- Seleccionar grupo --</option>
                <option value="1">Grupo 1</option>
                <option value="2">Grupo 2</option>
                <option value="3">Grupo 3</option>
                <option value="4">Grupo 4</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha límite*
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Asignar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Territory progress component
const TerritoryProgress = ({ territories }) => {
  // Calculate status counts
  const statusCounts = territories.reduce((counts, territory) => {
    const status = territory.status || 'inicio';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  
  // Calculate total territories
  const totalTerritories = territories.length;
  
  // Calculate percentages
  const getPercentage = (status) => {
    return totalTerritories > 0 
      ? Math.round((statusCounts[status] || 0) / totalTerritories * 100) 
      : 0;
  };
  
  const territoryStatuses = [
    { id: 'inicio', name: 'Inicio', color: 'bg-sky-100 text-sky-700' },
    { id: 'proceso', name: 'Proceso', color: 'bg-sky-200 text-sky-700' },
    { id: 'completado', name: 'Completado', color: 'bg-sky-300 text-sky-700' },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-medium mb-3 text-sky-700">Progreso de Territorios</h3>
      
      <div className="space-y-3">
        {territoryStatuses.map(status => (
          <div key={status.id}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{status.name}</span>
              <span className="text-sm text-gray-500">
                {statusCounts[status.id] || 0} de {totalTerritories} ({getPercentage(status.id)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${status.id === 'inicio' ? 'bg-sky-500' : status.id === 'proceso' ? 'bg-sky-500' : 'bg-sky-500'}`} 
                style={{ width: `${getPercentage(status.id)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Google Map component - 안전하게 수정
const GoogleMap = ({ territories }) => {
  const mapRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  
  // 안전하게 주소 처리
  const processAddress = (address) => {
    if (!address || typeof address !== 'string') return '';
    try {
      return address.trim();
    } catch (e) {
      console.error('주소 처리 오류:', e);
      return '';
    }
  };
  
  // Initialize map
  useEffect(() => {
    // Check if Google Maps API script is loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      script.onload = initMap;
      return () => {
        document.head.removeChild(script);
      };
    } else {
      initMap();
    }
  }, []);
  
  // Initialize map function - 안전하게 수정
  const initMap = () => {
    if (!mapRef.current || !window.google) return;
    
    try {
      // Get current position
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            try {
              const { latitude, longitude } = position.coords;
              setCurrentPosition({ lat: latitude, lng: longitude });
              
              const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: latitude, lng: longitude },
                zoom: 15,
              });
              
              // Current position marker
              new window.google.maps.Marker({
                position: { lat: latitude, lng: longitude },
                map,
                title: 'Tu ubicación actual',
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 2,
                },
              });
              
              // Add territory markers - 모든 작업을 try-catch로 감싸기
              if (Array.isArray(territories)) {
                territories.forEach((territory) => {
                  try {
                    const address = processAddress(territory.address);
                    if (address) {
                      const geocoder = new window.google.maps.Geocoder();
                      geocoder.geocode({ address }, (results, status) => {
                        try {
                          if (status === 'OK' && results && results[0]) {
                            const marker = new window.google.maps.Marker({
                              position: results[0].geometry.location,
                              map,
                              title: `Territorio #${territory.number || ''}`,
                              icon: {
                                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                              },
                            });
                            
                            // Info window
                            const infoWindow = new window.google.maps.InfoWindow({
                              content: createInfoWindowContent(territory),
                            });
                            
                            marker.addListener('click', () => {
                              infoWindow.open(map, marker);
                              
                              // Route button event
                              setTimeout(() => {
                                try {
                                  const routeBtn = document.getElementById(`route-btn-${territory.id}`);
                                  if (routeBtn) {
                                    routeBtn.addEventListener('click', () => {
                                      try {
                                        calculateRoute(
                                          { lat: latitude, lng: longitude },
                                          results[0].geometry.location
                                        );
                                      } catch (error) {
                                        console.error('경로 계산 오류:', error);
                                      }
                                    });
                                  }
                                } catch (error) {
                                  console.error('버튼 이벤트 오류:', error);
                                }
                              }, 200);
                            });
                          }
                        } catch (error) {
                          console.error('지오코딩 결과 처리 오류:', error);
                        }
                      });
                    }
                  } catch (error) {
                    console.error('구역 마커 생성 오류:', error);
                  }
                });
              }
              
              // Directions service initialization
              try {
                const directionsService = new window.google.maps.DirectionsService();
                const directionsRenderer = new window.google.maps.DirectionsRenderer({
                  map,
                  suppressMarkers: false,
                });
                
                setDirectionsService(directionsService);
                setDirectionsRenderer(directionsRenderer);
              } catch (error) {
                console.error('방향 서비스 초기화 오류:', error);
              }
              
              // Autocomplete settings
              try {
                const input = document.getElementById('pac-input');
                if (input) {
                  const autocomplete = new window.google.maps.places.Autocomplete(input);
                  autocomplete.bindTo('bounds', map);
                  
                  autocomplete.addListener('place_changed', () => {
                    try {
                      const place = autocomplete.getPlace();
                      
                      if (!place.geometry || !place.geometry.location) {
                        return;
                      }
                      
                      if (place.geometry.viewport) {
                        map.fitBounds(place.geometry.viewport);
                      } else {
                        map.setCenter(place.geometry.location);
                        map.setZoom(17);
                      }
                      
                      // Destination setting
                      setDestination(place.geometry.location);
                      
                      // Marker creation
                      new window.google.maps.Marker({
                        position: place.geometry.location,
                        map,
                        title: place.name,
                      });
                    } catch (error) {
                      console.error('장소 변경 이벤트 처리 오류:', error);
                    }
                  });
                }
              } catch (error) {
                console.error('자동완성 설정 오류:', error);
              }
            } catch (error) {
              console.error('지도 초기화 오류:', error);
            }
          },
          (error) => {
            console.error('Error obteniendo la ubicación:', error);
            try {
              // Default position (Mexico City)
              const defaultPos = { lat: 19.4326, lng: -99.1332 };
              setCurrentPosition(defaultPos);
              
              const map = new window.google.maps.Map(mapRef.current, {
                center: defaultPos,
                zoom: 12,
              });
            } catch (mapError) {
              console.error('기본 지도 생성 오류:', mapError);
            }
          }
        );
      }
    } catch (error) {
      console.error('지도 초기화 전체 오류:', error);
    }
  };
  
  // Route calculation function - 안전하게 처리
  const calculateRoute = (origin, destination) => {
    if (!directionsService || !directionsRenderer) return;
    
    try {
      directionsService.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          try {
            if (status === 'OK') {
              directionsRenderer.setDirections(response);
            } else {
              console.error('경로 계산 실패:', status);
            }
          } catch (error) {
            console.error('경로 콜백 처리 오류:', error);
          }
        }
      );
    } catch (error) {
      console.error('경로 계산 오류:', error);
    }
  };
  
  // Search and route calculation
  const handleRouteSearch = (e) => {
    e.preventDefault();
    
    if (!currentPosition || !destination) return;
    
    try {
      calculateRoute(currentPosition, destination);
    } catch (error) {
      console.error('경로 검색 핸들러 오류:', error);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-medium mb-3 text-sky-700">Mapa de Territorios</h3>
      
      <div className="mb-4">
        <form onSubmit={handleRouteSearch} className="flex gap-2">
          <input
            id="pac-input"
            type="text"
            placeholder="Buscar dirección o territorio..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button
            type="submit"
            className="bg-sky-500 text-white px-4 py-2 rounded-md hover:bg-sky-600 transition-colors"
          >
            Ruta
          </button>
        </form>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-300"
      ></div>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        Haz clic en un marcador para ver la información del territorio y las opciones de ruta.
      </div>
    </div>
  );
};

// Main page component
export default function TerritoryPage() {
  const [territories, setTerritories] = useState([]);
  const [filteredTerritories, setFilteredTerritories] = useState([]);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [publishers, setPublishers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mapModalOpen, setMapModalOpen] = useState(false);
  
  // Load data from localStorage
  useEffect(() => {
    // Load territory data
    const savedTerritories = JSON.parse(localStorage.getItem('territories') || '[]');
    setTerritories(savedTerritories);
    setFilteredTerritories(savedTerritories);
    
    // Load publisher data
    const savedPublishers = JSON.parse(localStorage.getItem('publishers') || '[]');
    setPublishers(savedPublishers);
  }, []);
  
  // Filter logic
  useEffect(() => {
    let filtered = [...territories];
    
    // Status filter
    if (filter !== 'all') {
      filtered = filtered.filter(territory => territory.status === filter);
    }
    
    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(territory => 
        (territory.number && territory.number.toString().includes(term)) || 
        (territory.name && territory.name.toLowerCase().includes(term)) ||
        (territory.assignedTo && territory.assignedTo.toLowerCase().includes(term))
      );
    }
    
    setFilteredTerritories(filtered);
  }, [territories, filter, searchTerm]);
  
  // Territory selection handler
  const handleTerritoryClick = (territory) => {
    setSelectedTerritory(territory);
    setMapModalOpen(true);
  };
  
  // Open assign modal
  const openAssignModal = (territory) => {
    setSelectedTerritory(territory);
    setAssignModalOpen(true);
  };
  
  // Handle assign territory
  const handleAssignTerritory = (territoryId, assignData) => {
    if (!territoryId || !assignData) return;
    
    const now = new Date();
    const dateStr = assignData.assignedDate || format(now, 'yyyy-MM-dd');
    
    const updatedTerritories = territories.map(territory => {
      if (territory.id === territoryId) {
        // 히스토리 안전하게 처리
        const existingHistory = Array.isArray(territory.history) ? territory.history : [];
        
        return {
          ...territory,
          status: 'assigned',
          assignedTo: assignData.assignedTo,
          assignedDate: dateStr,
          dueDate: assignData.dueDate,
          group: assignData.group || null,
          history: [...existingHistory, {
            date: dateStr,
            status: 'assigned',
            assignedTo: assignData.assignedTo,
            timestamp: now.getTime()
          }]
        };
      }
      return territory;
    });
    
    setTerritories(updatedTerritories);
    localStorage.setItem('territories', JSON.stringify(updatedTerritories));
    setAssignModalOpen(false);
    setSelectedTerritory(null);
  };
  
  // Handle complete territory
  const handleCompleteTerritory = (territory) => {
    if (!territory || !territory.id) return;
    
    const now = new Date();
    const dateStr = format(now, 'yyyy-MM-dd');
    
    const updatedTerritories = territories.map(item => {
      if (item.id === territory.id) {
        // 히스토리 안전하게 처리
        const existingHistory = Array.isArray(item.history) ? item.history : [];
        
        return {
          ...item,
          status: 'completed',
          lastWorkedDate: dateStr,
          completedDate: dateStr,
          history: [...existingHistory, {
            date: dateStr,
            status: 'completed',
            timestamp: now.getTime()
          }]
        };
      }
      return item;
    });
    
    setTerritories(updatedTerritories);
    localStorage.setItem('territories', JSON.stringify(updatedTerritories));
    setSelectedTerritory(null);
  };
  
  // Handle make territory available
  const handleMakeAvailable = (territory) => {
    if (!territory || !territory.id) return;
    
    const now = new Date();
    const dateStr = format(now, 'yyyy-MM-dd');
    
    const updatedTerritories = territories.map(item => {
      if (item.id === territory.id) {
        // 히스토리 안전하게 처리
        const existingHistory = Array.isArray(item.history) ? item.history : [];
        
        return {
          ...item,
          status: 'available',
          assignedTo: null,
          assignedDate: null,
          dueDate: null,
          history: [...existingHistory, {
            date: dateStr,
            status: 'available',
            timestamp: now.getTime()
          }]
        };
      }
      return item;
    });
    
    setTerritories(updatedTerritories);
    localStorage.setItem('territories', JSON.stringify(updatedTerritories));
    setSelectedTerritory(null);
  };
  
  // handle change status function - 단순화 및 방어 코드 개선
  const handleChangeStatus = (territoryId, newStatus, historyEntry) => {
    // 유효하지 않은 ID 처리
    if (!territoryId) return;
    
    try {
      // 현재 날짜와 시간 정보
      const now = new Date();
      const dateStr = format(now, 'yyyy-MM-dd');
      const timestamp = now.getTime();
      
      // 기본 히스토리 항목 생성
      const defaultHistoryEntry = { 
        date: dateStr,
        status: newStatus,
        timestamp: timestamp
      };
      
      // 유효한 히스토리 항목 준비
      const validHistoryEntry = historyEntry && typeof historyEntry === 'object'
        ? {
            ...defaultHistoryEntry,
            ...historyEntry  // 제공된 항목으로 덮어쓰기
          }
        : defaultHistoryEntry;
      
      // 모든 구역 데이터 업데이트
      const updatedTerritories = territories.map(territory => {
        if (territory.id === territoryId) {
          // 히스토리 배열 안전하게 처리
          const existingHistory = Array.isArray(territory.history) ? [...territory.history] : [];
          
          // 중복 히스토리 항목 확인 (같은 날짜, 같은 상태)
          const isDuplicate = existingHistory.some(item => 
            item && 
            item.date === validHistoryEntry.date && 
            item.status === validHistoryEntry.status
          );
          
          // 중복이 아닌 경우만 추가
          const newHistory = isDuplicate 
            ? existingHistory 
            : [...existingHistory, validHistoryEntry];
          
          // 업데이트된 구역 정보
          return {
            ...territory,
            status: newStatus,
            history: newHistory,
            // 완료 상태로 변경 시 lastWorkedDate 업데이트
            ...(newStatus === 'completado' && { lastWorkedDate: validHistoryEntry.date })
          };
        }
        return territory;
      });
      
      // 상태 업데이트
      setTerritories(updatedTerritories);
      localStorage.setItem('territories', JSON.stringify(updatedTerritories));
      
      // 선택된 구역 정보도 업데이트
      if (selectedTerritory && selectedTerritory.id === territoryId) {
        const existingHistory = Array.isArray(selectedTerritory.history) ? [...selectedTerritory.history] : [];
        
        // 중복 히스토리 항목 확인
        const isDuplicate = existingHistory.some(item => 
          item && 
          item.date === validHistoryEntry.date && 
          item.status === validHistoryEntry.status
        );
        
        // 중복이 아닌 경우만 추가
        const newHistory = isDuplicate 
          ? existingHistory 
          : [...existingHistory, validHistoryEntry];
        
        // 선택된 구역 정보 업데이트
        setSelectedTerritory({
          ...selectedTerritory,
          status: newStatus,
          history: newHistory,
          ...(newStatus === 'completado' && { lastWorkedDate: validHistoryEntry.date })
        });
      }
    } catch (error) {
      console.error('상태 변경 중 오류 발생:', error);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Territorios</h1>
        </div>
        
        {/* Territory status summary */}
        <TerritoryStatusSummary territories={territories} />
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <h1 className="text-xl font-bold">Territorios</h1>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Buscar territorio..."
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                className="flex-1 sm:flex-none border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="available">Disponibles</option>
                <option value="assigned">Asignados</option>
                <option value="completed">Completados</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Territory grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTerritories.map(territory => (
            <TerritoryCard 
              key={territory.id} 
              territory={territory}
              onClick={handleTerritoryClick}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
        
        {filteredTerritories.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No se encontraron territorios</p>
          </div>
        )}
        
        {/* Territory Modal */}
        {mapModalOpen && selectedTerritory && (
          <TerritoryModal 
            territory={selectedTerritory}
            onClose={() => setMapModalOpen(false)}
            onAssign={openAssignModal}
            onComplete={handleCompleteTerritory}
            onMakeAvailable={handleMakeAvailable}
            onChangeStatus={handleChangeStatus}
          />
        )}
        
        {/* Assign territory modal */}
        {assignModalOpen && selectedTerritory && (
          <AssignTerritoryModal
            territory={selectedTerritory}
            onClose={() => setAssignModalOpen(false)}
            onAssign={handleAssignTerritory}
            publishers={publishers}
          />
        )}
      </div>
    </Layout>
  );
}

// Link 컴포넌트 사용 시 URL 안전하게 처리
const SafeLink = ({ href, children, className, onClick }) => {
  // href가 유효한지 확인
  const isValidHref = href && typeof href === 'string';
  
  // URL 검증
  let safeHref = '#';
  try {
    if (isValidHref) {
      // 상대경로 처리
      if (href.startsWith('/')) {
        safeHref = href;
      } else if (href.startsWith('http')) {
        // URL 객체로 파싱해서 유효성 검증
        new URL(href);
        safeHref = href;
      }
    }
  } catch (e) {
    console.error('잘못된 URL:', href, e);
    safeHref = '#';
  }
  
  // onClick 이벤트 처리
  const handleClick = (e) => {
    if (safeHref === '#') {
      e.preventDefault();
    }
    
    if (onClick && typeof onClick === 'function') {
      onClick(e);
    }
  };
  
  return (
    <a 
      href={safeHref}
      className={className || ''}
      onClick={handleClick}
      target={safeHref.startsWith('http') ? "_blank" : undefined}
      rel={safeHref.startsWith('http') ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
};

// 안전하게 URL 인코딩하는 유틸리티 함수
const safeEncodeURIComponent = (str) => {
  if (!str || typeof str !== 'string') return '';
  try {
    return encodeURIComponent(str);
  } catch (e) {
    console.error('URL 인코딩 오류:', e);
    return '';
  }
};

// 안전하게 info window 콘텐츠 생성
const createInfoWindowContent = (territory) => {
  try {
    if (!territory) return '';
    
    const number = territory.number || '';
    const address = processAddress(territory.address) || '';
    const id = territory.id || '';
    
    return `
      <div style="padding: 10px;">
        <h3 style="font-weight: bold; margin-bottom: 5px;">Territorio #${number}</h3>
        <p>${address}</p>
        <button id="route-btn-${id}" style="background-color: #4285F4; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-top: 5px; cursor: pointer;">
          Cómo llegar
        </button>
      </div>
    `;
  } catch (error) {
    console.error('인포윈도우 콘텐츠 생성 오류:', error);
    return '<div style="padding: 10px;">Error al cargar información</div>';
  }
}; 