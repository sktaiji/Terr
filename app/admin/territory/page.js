'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import Layout from '../../components/Layout';

// 구역 카테고리 데이터
const territoryCategories = [
  { id: 'centro', name: 'Centro', emoji: '🏛️' },
  { id: 'polanco', name: 'Polanco', emoji: '🏙️' },
  { id: 'fuera', name: 'Fuera', emoji: '🌆' },
  { id: 'edo', name: 'EDO', emoji: '🏞️' },
];

// 장소 타입 데이터
const placeTypes = [
  { id: 'tienda', name: 'Tienda', emoji: '🏪' },
  { id: 'casa', name: 'Casa', emoji: '🏡' },
  
  { id: 'comercial', name: 'Comercial', emoji: '🏢' },
  { id: 'almacen', name: 'Almacen', emoji: '🏭' },
  { id: 'cart', name: 'Cart', emoji: '🛒' },
];

// 구역 상태 데이터
const territoryStatuses = [
  { id: 'inicio', name: 'Inicio', color: 'bg-sky-100 text-sky-700' },
  { id: 'proceso', name: 'Proceso', color: 'bg-sky-200 text-sky-700' },
  { id: 'completado', name: 'Completado', color: 'bg-sky-300 text-sky-700' },
];

// 상태별 색상
const statusColors = {
  'inicio': 'bg-sky-100 text-sky-700',
  'proceso': 'bg-sky-200 text-sky-700',
  'completado': 'bg-sky-300 text-sky-700',
};

// 바닥글 컴포넌트 
const TerritoryStatusBadge = ({ status }) => {
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status === 'inicio' ? 'Inicio' : 
       status === 'proceso' ? 'Proceso' : 
       status === 'completado' ? 'Completado' : 'Desconocido'}
    </span>
  );
};

// 구역 카드 컴포넌트
const TerritoryCard = ({ territory, captains, onStatusChange, onDelete, onEdit, onCardClick, isSelected, onSelect }) => {
  // 상태 핸들링 함수
  const handleStatusChange = (newStatus, e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    
    if (onStatusChange) {
      const now = new Date();
      const historyEntry = {
        date: format(now, 'yyyy-MM-dd'),
        status: newStatus,
        timestamp: now.getTime(),
      };
      
      onStatusChange(territory.id, newStatus, historyEntry);
    }
  };
  
  // 완성 날짜 포맷팅
  const getCompletionDate = () => {
    if (territory.status === 'completado' && territory.history && territory.history.length > 0) {
      // 가장 최근 completado 상태의 히스토리 항목 찾기
      const lastCompletedEntry = [...territory.history]
        .reverse()
        .find(entry => entry.status === 'completado');
      
      if (lastCompletedEntry) {
        return `Completado: ${lastCompletedEntry.date}`;
      }
    }
    return null;
  };
  
  // 모비 맵 URL 생성 (가능한 경우)
  const getMapsUrl = () => {
    if (territory.address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(territory.address)}`;
    }
    return null;
  };
  
  // URL에서 파일명 추출
  const getFileName = () => {
    if (!territory.url) return '';
    
    try {
      // blob URL인 경우 처리
      if (territory.url.startsWith('blob:')) {
        return 'PDF';
      }
      
      // URL 객체 생성 시도
      const url = new URL(territory.url);
      
      // 경로의 마지막 부분을 파일명으로 추출
      const pathParts = url.pathname.split('/');
      let fileName = pathParts[pathParts.length - 1];
      
      // URL 디코딩
      fileName = decodeURIComponent(fileName);
      
      // 파일명이 비어있거나 '/'만 있는 경우
      if (!fileName || fileName === '/') {
        return 'PDF';
      }
      
      // 파일명이 너무 길면 축약
      if (fileName.length > 15) {
        return fileName.substring(0, 12) + '...';
      }
      
      return fileName;
    } catch (e) {
      // URL 파싱 오류 시 간단한 표시
      return 'PDF';
    }
  };
  
  const completionDate = getCompletionDate();
  
  // 카드 클릭 핸들러
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(territory);
    }
  };
  
  // 선택 체크박스 핸들러
  const handleSelectChange = (e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    if (onSelect) {
      onSelect(territory.id, e.target.checked);
    }
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-3 border border-sky-50 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 text-sky-600 border-gray-300 rounded cursor-pointer"
              checked={isSelected}
              onChange={handleSelectChange}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm mr-1">{
              territoryCategories.find(cat => cat.id === territory.category)?.emoji || '🗺️'
            }</span>
            <h3 className="font-medium text-sm">{territory.number}</h3>
            {territory.url && (
              <span className="ml-1 text-xs text-gray-500 truncate max-w-[120px]">- {getFileName()}</span>
            )}
          </div>
          <TerritoryStatusBadge status={territory.status} />
        </div>
        
        <div className="grid grid-cols-1 gap-1 text-sm mb-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Área:</span>
            <span className="font-medium">
              {territoryCategories.find(cat => cat.id === territory.category)?.name || 'Desconocido'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tipo:</span>
            <span className="font-medium flex items-center">
              <span className="mr-1">{placeTypes.find(type => type.id === territory.placeType)?.emoji || '📍'}</span>
              {placeTypes.find(type => type.id === territory.placeType)?.name || 'Otros'}
            </span>
          </div>
          {territory.address && (
            <div className="flex justify-between">
              <span className="text-gray-500">Dirección:</span>
              <a 
                href={getMapsUrl()} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sky-600 text-sm hover:underline truncate max-w-[60%] text-right"
                onClick={(e) => e.stopPropagation()} // 이벤트 버블링 방지
              >
                {territory.address}
              </a>
            </div>
          )}
          {territory.captain && (
            <div className="flex justify-between">
              <span className="text-gray-500">Publicador:</span>
              <span className="font-medium truncate max-w-[60%] text-right">{territory.captain}</span>
            </div>
          )}
          {territory.group && (
            <div className="flex justify-between">
              <span className="text-gray-500">Grupo:</span>
              <span className="font-medium">Grupo {territory.group}</span>
            </div>
          )}
          {completionDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha:</span>
              <span className="font-medium text-green-600">{completionDate}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-auto">
        <div className="flex gap-1 mb-1">
          <button
            className={`flex-1 text-center py-1 px-1 text-sm font-medium rounded ${territory.status === 'inicio' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'}`}
            onClick={(e) => handleStatusChange('inicio', e)}
          >
            Inicio
          </button>
          <button
            className={`flex-1 text-center py-1 px-1 text-sm font-medium rounded ${territory.status === 'proceso' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'}`}
            onClick={(e) => handleStatusChange('proceso', e)}
          >
            Proceso
          </button>
          <button
            className={`flex-1 text-center py-1 px-1 text-sm font-medium rounded ${territory.status === 'completado' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'}`}
            onClick={(e) => handleStatusChange('completado', e)}
          >
            Comp.
          </button>
        </div>
        
        <div className="flex gap-1">
          <button
            className="flex-1 text-center py-1 px-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(territory);
            }}
          >
            Editar
          </button>
          <button
            className="flex-1 text-center py-1 px-1 text-sm font-medium text-red-700 hover:bg-red-50 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(territory.id);
            }}
          >
            Elim.
    </button>
        </div>
      </div>
    </div>
  );
};

// 구역 진행 현황 컴포넌트
const TerritoryProgress = ({ territories }) => {
  // 상태별 구역 수 계산
  const statusCounts = territories.reduce((counts, territory) => {
    const status = territory.status || 'inicio';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  
  // 전체 구역 수
  const totalTerritories = territories.length;
  
  // 상태별 퍼센트 계산
  const getPercentage = (status) => {
    return totalTerritories > 0 
      ? Math.round((statusCounts[status] || 0) / totalTerritories * 100) 
      : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 w-full">
      <h3 className="text-lg font-medium mb-3">Progreso de Territorios</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

// 구역 업로드 폼 컴포넌트
const TerritoryUploadForm = ({ onSubmit, editingTerritory, onCancelEdit }) => {
  const [number, setNumber] = useState('');
  const [category, setCategory] = useState('');
  const [placeType, setPlaceType] = useState('');
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [captain, setCaptain] = useState('');
  const [captains, setCaptains] = useState([]);
  const [address, setAddress] = useState('');
  const [group, setGroup] = useState('');
  
  const fileInputRef = useRef(null);
  
  // 편집 모드 감지 및 데이터 불러오기
  useEffect(() => {
    if (editingTerritory) {
      setNumber(editingTerritory.number || '');
      setCategory(editingTerritory.category || '');
      setPlaceType(editingTerritory.placeType || '');
      setFileUrl(editingTerritory.url || '');
      setCaptain(editingTerritory.captain || '');
      setAddress(editingTerritory.address || '');
      setGroup(editingTerritory.group || '');
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [editingTerritory]);
  
  // 캡틴 목록 불러오기
  useEffect(() => {
    // 로컬 스토리지에서 publishers 가져오기
    const savedPublishers = JSON.parse(localStorage.getItem('publishers') || '[]');
    setCaptains(savedPublishers);
  }, []);
  
  // 파일 핸들링
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // 파일 URL 생성
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
    }
  };
  
  // 폼 리셋
  const resetForm = () => {
    setNumber('');
    setCategory('');
    setPlaceType('');
    setFile(null);
    setFileUrl('');
    setCaptain('');
    setAddress('');
    setGroup('');
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 필수 필드 확인
    if (!number || !category || !placeType || (!file && !fileUrl)) {
      alert('Por favor, complete todos los campos y suba un archivo PDF.');
      return;
    }
    
    // 제출 데이터 준비
    const territoryData = {
      id: isEditing ? editingTerritory.id : `territory-${Date.now()}`,
      number,
      category,
      placeType,
      url: fileUrl,
      address: address || null,
      group: group || null,
      uploadDate: format(new Date(), 'dd/MM/yyyy'),
      status: isEditing ? editingTerritory.status || 'inicio' : 'inicio',
      captain: captain || null,
      history: isEditing ? editingTerritory.history || [] : []
    };
    
    // 부모 컴포넌트로 데이터 전달
    onSubmit(territoryData, isEditing);
    
    // 폼 리셋
    resetForm();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-bold mb-4">
        {isEditing ? 'Editar Territorio' : 'Subir Nuevo Territorio'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Número*</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="123"
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría*</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">-- Seleccionar --</option>
              {territoryCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.emoji} {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo*</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={placeType}
              onChange={(e) => setPlaceType(e.target.value)}
              required
            >
              <option value="">-- Seleccionar --</option>
              {placeTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.emoji} {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF*</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Publicador</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={captain}
              onChange={(e) => setCaptain(e.target.value)}
            >
              <option value="">-- Seleccionar --</option>
              {captains.map(captain => (
                <option key={captain.id} value={captain.name}>
                  {captain.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              <option value="">-- Seleccionar --</option>
              <option value="1">Grupo 1</option>
              <option value="2">Grupo 2</option>
              <option value="3">Grupo 3</option>
              <option value="4">Grupo 4</option>
            </select>
          </div>
          
          <div className="mb-3 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección (opcional)</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Av. Principal 123, Ciudad"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="px-3 py-1.5 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700"
          >
            {isEditing ? 'Guardar Cambios' : 'Subir Territorio'}
          </button>
        </div>
      </form>
    </div>
  );
};

// 구역 상세 정보 모달 컴포넌트 추가
const TerritoryDetailModal = ({ isOpen, onClose, territory }) => {
  if (!isOpen || !territory) return null;
  
  // 완성 날짜 포맷팅
  const getCompletionDate = () => {
    if (territory.status === 'completado' && territory.history && territory.history.length > 0) {
      // 가장 최근 completado 상태의 히스토리 항목 찾기
      const lastCompletedEntry = [...territory.history]
        .reverse()
        .find(entry => entry.status === 'completado');
      
      if (lastCompletedEntry) {
        return `Completado: ${lastCompletedEntry.date}`;
      }
    }
    return null;
  };
  
  const completionDate = getCompletionDate();
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <span className="text-2xl mr-2">
              {territoryCategories.find(cat => cat.id === territory.category)?.emoji || '🗺️'}
            </span>
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
                <div>
                  <span className="text-gray-500 block text-sm">Área:</span>
                  <span className="font-medium">
                    {territoryCategories.find(cat => cat.id === territory.category)?.name || 'Desconocido'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-sm">Tipo:</span>
                  <span className="font-medium flex items-center">
                    <span className="mr-1">{placeTypes.find(type => type.id === territory.placeType)?.emoji || '📍'}</span>
                    {placeTypes.find(type => type.id === territory.placeType)?.name || 'Otros'}
                  </span>
        </div>
                {territory.address && (
                  <div>
                    <span className="text-gray-500 block text-sm">Dirección:</span>
          <div className="flex items-center">
                      <span className="mr-1">{territory.address}</span>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(territory.address)}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="ml-1 text-sky-600 hover:text-sky-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </a>
          </div>
        </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium mb-3">Estado y fechas</h3>
              <div className="space-y-3">
                {territory.captain && (
                  <div>
                    <span className="text-gray-500 block text-sm">Publicador:</span>
                    <span className="font-medium">{territory.captain}</span>
                  </div>
                )}
                {territory.group && (
                  <div>
                    <span className="text-gray-500 block text-sm">Grupo:</span>
                    <span className="font-medium">Grupo {territory.group}</span>
                  </div>
                )}
                {completionDate && (
                  <div>
                    <span className="text-gray-500 block text-sm">Fecha:</span>
                    <span className="font-medium text-green-600">{completionDate}</span>
                  </div>
                )}
            <div>
                  <span className="text-gray-500 block text-sm">Fecha de subida:</span>
                  <span className="font-medium">{territory.uploadDate || 'Desconocido'}</span>
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
                ></iframe>
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
          
          {/* 히스토리 섹션 - 아래쪽 */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Historial de estados</h3>
              {territory.history && territory.history.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr className="h-12">
                        <th scope="col" className="px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-semibold">Fecha</th>
                        <th scope="col" className="px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[...territory.history].reverse().map((entry, index) => (
                        <tr key={index} className="h-14">
                          <td className="px-3 text-sm text-gray-900">{entry.date}</td>
                          <td className="px-3">
                            <TerritoryStatusBadge status={entry.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay historial disponible.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TerritorioPage() {
  const [territories, setTerritories] = useState([]);
  const [captains, setCaptains] = useState([]);
  const [editingTerritory, setEditingTerritory] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTerritoryIds, setSelectedTerritoryIds] = useState([]);
  
  // 폼 상태 변수들 추가
  const [number, setNumber] = useState('');
  const [category, setCategory] = useState('');
  const [placeType, setPlaceType] = useState('');
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [captain, setCaptain] = useState('');
  const [address, setAddress] = useState('');
  const [group, setGroup] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const fileInputRef = useRef(null);
  
  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    // 구역 데이터 불러오기
    const savedTerritories = JSON.parse(localStorage.getItem('territories') || '[]');
    setTerritories(savedTerritories);
    
    // 캡틴(장로, 봉사의 종) 데이터 불러오기
    const savedPublishers = JSON.parse(localStorage.getItem('publishers') || '[]');
    setCaptains(savedPublishers);
  }, []);
  
  // 구역 데이터 저장하기
  const saveTerritories = (updatedTerritories) => {
    localStorage.setItem('territories', JSON.stringify(updatedTerritories));
    setTerritories(updatedTerritories);
  };
  
  // 편집 모드 감지 및 데이터 불러오기
  useEffect(() => {
    if (editingTerritory) {
      setNumber(editingTerritory.number || '');
      setCategory(editingTerritory.category || '');
      setPlaceType(editingTerritory.placeType || '');
      setFileUrl(editingTerritory.url || '');
      setCaptain(editingTerritory.captain || '');
      setAddress(editingTerritory.address || '');
      setGroup(editingTerritory.group || '');
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [editingTerritory]);
  
  // 파일 핸들링
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // 파일 URL 생성
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
    }
  };
  
  // 폼 리셋
  const resetForm = () => {
    setNumber('');
    setCategory('');
    setPlaceType('');
    setFile(null);
    setFileUrl('');
    setCaptain('');
    setAddress('');
    setGroup('');
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 필수 필드 확인
    if (!number || !category || !placeType || (!file && !fileUrl)) {
      alert('Por favor, complete todos los campos y suba un archivo PDF.');
      return;
    }
    
    // 제출 데이터 준비
    const territoryData = {
      id: isEditing ? editingTerritory.id : `territory-${Date.now()}`,
      number,
      category,
      placeType,
      url: fileUrl,
      address: address || null,
      group: group || null,
      uploadDate: format(new Date(), 'dd/MM/yyyy'),
      status: isEditing ? editingTerritory.status || 'inicio' : 'inicio',
      captain: captain || null,
      history: isEditing ? editingTerritory.history || [] : []
    };
    
    // 부모 컴포넌트로 데이터 전달
    handleTerritorySubmit(territoryData, isEditing);
    
    // 폼 리셋
    resetForm();
  };
  
  // 취소 핸들러
  const onCancelEdit = () => {
    setEditingTerritory(null);
    resetForm();
  };
  
  // 구역 추가/수정 핸들러
  const handleTerritorySubmit = (territoryData, isEditing) => {
    let updatedTerritories;
    
    if (isEditing) {
      // 기존 구역 수정
      updatedTerritories = territories.map(territory => 
        territory.id === territoryData.id ? territoryData : territory
      );
    } else {
      // 새 구역 추가
      updatedTerritories = [...territories, territoryData];
    }
    
    saveTerritories(updatedTerritories);
    setEditingTerritory(null);
  };
  
  // 구역 삭제 핸들러
  const handleDeleteTerritory = (territoryId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este territorio?')) {
      const updatedTerritories = territories.filter(
        territory => territory.id !== territoryId
      );
      saveTerritories(updatedTerritories);
    }
  };
  
  // 구역 수정 모드 핸들러
  const handleEditTerritory = (territory) => {
    setEditingTerritory(territory);
    // 스크롤 상단으로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // 구역 상태 변경 핸들러
  const handleStatusChange = (territoryId, newStatus, historyEntry) => {
    const updatedTerritories = territories.map(territory => {
      if (territory.id === territoryId) {
        const updatedHistory = territory.history ? [...territory.history, historyEntry] : [historyEntry];
        return {
          ...territory,
          status: newStatus,
          history: updatedHistory
        };
      }
      return territory;
    });
    
    saveTerritories(updatedTerritories);
  };
  
  // 구역 카드 클릭 핸들러
  const handleCardClick = (territory) => {
    setSelectedTerritory(territory);
    setDetailModalOpen(true);
  };
  
  // 구역 선택 핸들러
  const handleTerritorySelect = (territoryId, isSelected) => {
    if (isSelected) {
      setSelectedTerritoryIds(prev => [...prev, territoryId]);
    } else {
      setSelectedTerritoryIds(prev => prev.filter(id => id !== territoryId));
    }
  };
  
  // 모두 선택 핸들러
  const handleSelectAll = () => {
    if (selectedTerritoryIds.length === filteredTerritories.length) {
      // 모두 선택된 상태면 모두 해제
      setSelectedTerritoryIds([]);
    } else {
      // 아니면 모두 선택
      setSelectedTerritoryIds(filteredTerritories.map(territory => territory.id));
    }
  };
  
  // 선택 삭제 핸들러
  const handleDeleteSelected = () => {
    if (selectedTerritoryIds.length === 0) {
      alert('Por favor, seleccione al menos un territorio para eliminar.');
      return;
    }
    
    if (window.confirm(`¿Está seguro de que desea eliminar ${selectedTerritoryIds.length} territorios seleccionados?`)) {
      const updatedTerritories = territories.filter(
        territory => !selectedTerritoryIds.includes(territory.id)
      );
      saveTerritories(updatedTerritories);
      setSelectedTerritoryIds([]);
    }
  };
  
  // 필터링된 구역 목록
  const filteredTerritories = territories.filter(territory => {
    const categoryMatch = filterCategory === 'all' || territory.category === filterCategory;
    const statusMatch = filterStatus === 'all' || territory.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  // Render the component
  return (
    <Layout>
      <div className="container mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Administración de Territorios</h1>
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
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 구역 진행 현황 */}
          <div className="lg:col-span-3">
            <TerritoryProgress territories={territories} />
          </div>
        </div>
        
        {/* 업로드 폼 - 더 컴팩트하게 수정 */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingTerritory ? 'Editar Territorio' : 'Subir Nuevo Territorio'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número*</label>
          <input
            type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="123"
            required
          />
        </div>
        
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría*</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">-- Seleccionar --</option>
                    {territoryCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.emoji} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo*</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={placeType}
                    onChange={(e) => setPlaceType(e.target.value)}
                    required
                  >
                    <option value="">-- Seleccionar --</option>
                    {placeTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.emoji} {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF*</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    onChange={handleFileChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publicador</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={captain}
                    onChange={(e) => setCaptain(e.target.value)}
                  >
                    <option value="">-- Seleccionar --</option>
                    {captains.map(captain => (
                      <option key={captain.id} value={captain.name}>
                        {captain.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                  >
                    <option value="">-- Seleccionar --</option>
                    <option value="1">Grupo 1</option>
                    <option value="2">Grupo 2</option>
                    <option value="3">Grupo 3</option>
                    <option value="4">Grupo 4</option>
                  </select>
                </div>
                
                <div className="mb-3 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección (opcional)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Av. Principal 123, Ciudad"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                {isEditing && (
              <button
                type="button"
                    onClick={onCancelEdit}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700"
                >
                  {isEditing ? 'Guardar Cambios' : 'Subir Territorio'}
              </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* 구역 목록 - 3열 그리드로 변경 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              Territorios
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredTerritories.length} territorios)
              </span>
            </h2>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={handleSelectAll}
              >
                {selectedTerritoryIds.length === filteredTerritories.length && filteredTerritories.length > 0 
                  ? 'Deseleccionar todos' 
                  : 'Seleccionar todos'}
              </button>
              <button
                className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDeleteSelected}
                disabled={selectedTerritoryIds.length === 0}
              >
                Eliminar seleccionados ({selectedTerritoryIds.length})
              </button>
        </div>
      </div>
      
          {filteredTerritories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredTerritories.map(territory => (
                <TerritoryCard
                  key={territory.id}
                  territory={territory}
                  captains={captains}
                onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTerritory}
                  onEdit={handleEditTerritory}
                  onCardClick={handleCardClick}
                  isSelected={selectedTerritoryIds.includes(territory.id)}
                  onSelect={handleTerritorySelect}
              />
            ))}
          </div>
        ) : (
            <p className="text-gray-500 text-center p-4">
              No hay territorios que coincidan con los filtros seleccionados
            </p>
          )}
          </div>
      </div>
      
      {/* Territory Detail Modal */}
      {selectedTerritory && (
        <TerritoryDetailModal 
          territory={selectedTerritory}
          isOpen={detailModalOpen} 
          onClose={() => setDetailModalOpen(false)} 
        />
      )}
    </Layout>
  );
} 