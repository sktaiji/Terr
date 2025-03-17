'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 이모티콘 매핑
const categoryEmojis = {
  'Centro': '🏙️', // 도심 이모티콘
  'Polanco': '🏢', // 비즈니스 구역 이모티콘
  'Fuera': '🏘️', // 외곽 지역 이모티콘
};

const placeTypeEmojis = {
  '가게': '🏪',
  '식당': '🍽️',
  '집': '🏠',
  '사무실': '💼',
  '창고': '📦',
  '기타': '📍',
};

// 상태 표시 컴포넌트
const StatusBadge = ({ status }) => {
  let bgColor = 'bg-gray-100 text-gray-800';
  let statusText = status;
  
  if (status === '시작전') {
    bgColor = 'bg-blue-100 text-blue-800';
    statusText = 'Pendiente';
  } else if (status === '진행중') {
    bgColor = 'bg-yellow-100 text-yellow-800';
    statusText = 'En Progreso';
  } else if (status === '완성') {
    bgColor = 'bg-green-100 text-green-800';
    statusText = 'Completado';
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
      {statusText}
    </span>
  );
};

// 상태 버튼 컴포넌트
const StatusButton = ({ status, currentStatus, onClick, size = 'sm' }) => {
  let bgColor = 'bg-gray-100 text-gray-800 border-gray-200';
  let activeClass = '';
  let statusText = status;
  
  if (status === '시작전') {
    bgColor = 'bg-blue-50 text-blue-800 border-blue-200';
    activeClass = currentStatus === status ? 'bg-blue-100 border-blue-300 font-medium' : '';
    statusText = 'Pendiente';
  } else if (status === '진행중') {
    bgColor = 'bg-yellow-50 text-yellow-800 border-yellow-200';
    activeClass = currentStatus === status ? 'bg-yellow-100 border-yellow-300 font-medium' : '';
    statusText = 'En Progreso';
  } else if (status === '완성') {
    bgColor = 'bg-green-50 text-green-800 border-green-200';
    activeClass = currentStatus === status ? 'bg-green-100 border-green-300 font-medium' : '';
    statusText = 'Completado';
  }
  
  const sizeClass = size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1 text-xs';
  
  return (
    <button
      onClick={() => onClick(status)}
      className={`${bgColor} ${activeClass} ${sizeClass} rounded border hover:shadow-sm transition-all`}
    >
      {statusText}
    </button>
  );
};

// 봉사 현황 카드 컴포넌트
const StatusSummaryCard = ({ inProgressNumbers, completedNumbers }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="font-medium text-lg mb-3 text-blue-800">
        <span className="font-bold">En progreso actualmente:</span> {inProgressNumbers.length === 0 ? 'Ninguno' : inProgressNumbers.join(', ')}
      </h2>
      <div className="border-t pt-3">
        <h3 className="font-medium mb-2 text-green-800">Servicio completado:</h3>
        <div className="bg-gray-50 p-3 rounded">
          {completedNumbers.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay servicio completado</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {completedNumbers.map(number => (
                <span key={number} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  {number}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// PDF 모달 컴포넌트
const PDFModal = ({ file, onClose, onStatusChange }) => {
  if (!file) return null;

  // PDF 공유 함수
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: file.name,
          text: `Compartiendo territorio: ${file.name} - ${file.category} - ${file.number}`,
          url: file.url
        });
      } else {
        // 공유 API가 지원되지 않는 경우 URL 복사
        navigator.clipboard.writeText(file.url);
        alert('Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{file.name}</h2>
            <div className="flex flex-wrap space-x-3 mt-1">
              <StatusBadge status={file.status} />
              <span className="text-sm text-gray-600">Número: {file.number}</span>
              <span className="text-sm text-gray-600">Zona: {categoryEmojis[file.category]} {file.category}</span>
              <span className="text-sm text-gray-600">Lugar: {placeTypeEmojis[file.placeType]} {file.placeType}</span>
              {file.startDate && <span className="text-sm text-gray-600">Fecha inicio: {file.startDate}</span>}
              {file.endDate && <span className="text-sm text-gray-600">Fecha fin: {file.endDate}</span>}
            </div>
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
        <div className="flex-1 p-4 overflow-auto">
          <iframe 
            src={file.url} 
            className="w-full h-full border"
            title={file.name}
          />
        </div>
        <div className="p-4 border-t flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <span className="mr-3 text-sm font-medium">Cambiar estado:</span>
            <div className="flex space-x-2">
              <StatusButton
                status="시작전"
                currentStatus={file.status}
                onClick={(status) => onStatusChange(file.id, status)}
                size="lg"
              />
              <StatusButton
                status="진행중"
                currentStatus={file.status}
                onClick={(status) => onStatusChange(file.id, status)}
                size="lg"
              />
              <StatusButton
                status="완성"
                currentStatus={file.status}
                onClick={(status) => onStatusChange(file.id, status)}
                size="lg"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleShare}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
              </svg>
              Compartir
            </button>
            <button 
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PDF 카드 컴포넌트
const PDFCard = ({ file, onStatusChange, onClick }) => {
  // PDF 공유 함수
  const handleShare = async (e) => {
    e.stopPropagation(); // 클릭 이벤트 버블링 방지
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: file.name,
          text: `Compartiendo territorio: ${file.name} - ${file.category} - ${file.number}`,
          url: file.url
        });
      } else {
        // 공유 API가 지원되지 않는 경우 URL 복사
        navigator.clipboard.writeText(file.url);
        alert('Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-64 flex flex-col">
      <div 
        className="p-3 cursor-pointer hover:bg-blue-50 transition-colors flex-1 flex flex-col"
        onClick={() => onClick(file)}
      >
        {/* 상단: 파일명과 상태 */}
        <div className="border-b pb-2 mb-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-sm truncate max-w-[70%]">{file.name}</h3>
            <StatusBadge status={file.status} />
          </div>
          <div className="font-medium text-blue-700 text-base mt-1 flex items-center">
            <span className="mr-2">
              {categoryEmojis[file.category]} {placeTypeEmojis[file.placeType]}
            </span>
            <span>Número: {file.number}</span>
          </div>
        </div>
        
        {/* 중간: 파일 정보 */}
        <div className="flex-1 overflow-y-auto text-gray-500 text-xs">
          <div className="grid grid-cols-2 gap-1">
            <div className="truncate"><span className="font-medium">Zona:</span> {categoryEmojis[file.category]} {file.category}</div>
            <div className="truncate"><span className="font-medium">Lugar:</span> {placeTypeEmojis[file.placeType]} {file.placeType}</div>
            {file.startDate && <div className="truncate"><span className="font-medium">Inicio:</span> {file.startDate}</div>}
            {file.endDate && <div className="truncate"><span className="font-medium">Fin:</span> {file.endDate}</div>}
          </div>
        </div>
        
        {/* 하단: 상태 변경 버튼 */}
        <div className="mt-auto border-t pt-2">
          <div className="text-xs text-gray-600 mb-1">Cambiar estado:</div>
          <div className="flex justify-between space-x-1" onClick={(e) => e.stopPropagation()}>
            <StatusButton
              status="시작전"
              currentStatus={file.status}
              onClick={(status) => onStatusChange(file.id, status)}
            />
            <StatusButton
              status="진행중"
              currentStatus={file.status}
              onClick={(status) => onStatusChange(file.id, status)}
            />
            <StatusButton
              status="완성"
              currentStatus={file.status}
              onClick={(status) => onStatusChange(file.id, status)}
            />
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            <button 
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
              onClick={(e) => {
                e.stopPropagation(); // 이벤트 버블링 방지
                onClick(file);
              }}
            >
              Ver
            </button>
            <button 
              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 flex items-center justify-center"
              onClick={handleShare}
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
              </svg>
              Compartir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AreaPage() {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // 선택된 파일 (모달용)
  const [inProgressNumbers, setInProgressNumbers] = useState([]);
  const [completedNumbers, setCompletedNumbers] = useState([]);
  
  // 로컬 스토리지에서 PDF 파일 목록 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFiles = JSON.parse(localStorage.getItem('pdfFiles') || '[]');
      setPdfFiles(savedFiles);
      
      // 진행 중 및 완료된 파일 번호 추출
      const inProgress = savedFiles
        .filter(file => file.status === '진행중')
        .map(file => file.number);
      
      const completed = savedFiles
        .filter(file => file.status === '완성')
        .map(file => file.number);
      
      setInProgressNumbers(inProgress);
      setCompletedNumbers(completed);
    }
  }, []);
  
  // PDF 파일 저장 (상태 변경시에만 사용)
  const savePdfFiles = (files) => {
    setPdfFiles(files);
    localStorage.setItem('pdfFiles', JSON.stringify(files));
    
    // 진행 중 및 완료된 파일 번호 업데이트
    const inProgress = files
      .filter(file => file.status === '진행중')
      .map(file => file.number);
    
    const completed = files
      .filter(file => file.status === '완성')
      .map(file => file.number);
    
    setInProgressNumbers(inProgress);
    setCompletedNumbers(completed);
  };
  
  // 상태 변경 처리
  const handleStatusChange = (id, newStatus) => {
    const updatedFiles = pdfFiles.map(file => {
      if (file.id === id) {
        // 상태 변경 시 날짜 업데이트
        let updatedFile = { ...file, status: newStatus };
        
        if (newStatus === '시작전') {
          updatedFile.startDate = new Date().toLocaleDateString();
        } else if (newStatus === '완성') {
          updatedFile.endDate = new Date().toLocaleDateString();
        }
        
        return updatedFile;
      }
      return file;
    });
    
    savePdfFiles(updatedFiles);
  };
  
  // 파일 보기 (모달 열기)
  const handleViewFile = (file) => {
    setSelectedFile(file);
  };
  
  // 모달 닫기
  const handleCloseModal = () => {
    setSelectedFile(null);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Territorios</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          Volver al Inicio
        </Link>
      </div>
      
      {/* 현재 진행중인 구역 요약 */}
      <StatusSummaryCard
        inProgressNumbers={inProgressNumbers}
        completedNumbers={completedNumbers}
      />
      
      {/* 구역 필터 및 검색 (추후 구현) */}
      
      {/* 구역 목록 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pdfFiles.map(file => (
          <PDFCard
            key={file.id}
            file={file}
            onStatusChange={handleStatusChange}
            onClick={handleViewFile}
          />
        ))}
      </div>
      
      {/* PDF 뷰어 모달 */}
      {selectedFile && (
        <PDFModal
          file={selectedFile}
          onClose={handleCloseModal}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
} 