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
  
  if (status === '시작전') {
    bgColor = 'bg-blue-100 text-blue-800';
  } else if (status === '진행중') {
    bgColor = 'bg-yellow-100 text-yellow-800';
  } else if (status === '완성') {
    bgColor = 'bg-green-100 text-green-800';
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
      {status}
    </span>
  );
};

// 상태 버튼 컴포넌트
const StatusButton = ({ status, currentStatus, onClick, size = 'sm' }) => {
  let bgColor = 'bg-gray-100 text-gray-800 border-gray-200';
  let activeClass = '';
  
  if (status === '시작전') {
    bgColor = 'bg-blue-50 text-blue-800 border-blue-200';
    activeClass = currentStatus === status ? 'bg-blue-100 border-blue-300 font-medium' : '';
  } else if (status === '진행중') {
    bgColor = 'bg-yellow-50 text-yellow-800 border-yellow-200';
    activeClass = currentStatus === status ? 'bg-yellow-100 border-yellow-300 font-medium' : '';
  } else if (status === '완성') {
    bgColor = 'bg-green-50 text-green-800 border-green-200';
    activeClass = currentStatus === status ? 'bg-green-100 border-green-300 font-medium' : '';
  }
  
  const sizeClass = size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1 text-xs';
  
  return (
    <button
      onClick={() => onClick(status)}
      className={`${bgColor} ${activeClass} ${sizeClass} rounded border hover:shadow-sm transition-all`}
    >
      {status}
    </button>
  );
};

// PDF 모달 컴포넌트
const PDFModal = ({ file, onClose, onStatusChange, onDelete }) => {
  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{file.name}</h2>
            <div className="flex flex-wrap space-x-3 mt-1">
              <StatusBadge status={file.status} />
              <span className="text-sm text-gray-600">번호: {file.number}</span>
              <span className="text-sm text-gray-600">구역: {categoryEmojis[file.category]} {file.category}</span>
              <span className="text-sm text-gray-600">장소: {placeTypeEmojis[file.placeType]} {file.placeType}</span>
              <span className="text-sm text-gray-600">업로드: {file.uploadDate}</span>
              {file.startDate && <span className="text-sm text-gray-600">시작일: {file.startDate}</span>}
              {file.endDate && <span className="text-sm text-gray-600">종료일: {file.endDate}</span>}
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
        <div className="p-4 border-t flex justify-between items-center">
          <div className="flex items-center">
            <span className="mr-3 text-sm font-medium">상태 변경:</span>
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
          <div className="flex space-x-3">
            <button 
              onClick={() => onDelete(file.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              삭제
            </button>
            <button 
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PDF 카드 컴포넌트
const PDFCard = ({ file, onStatusChange, onClick, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-3 w-full">
      <div className="p-4 cursor-pointer hover:bg-blue-50 transition-colors">
        <div className="flex flex-wrap items-center">
          {/* 왼쪽: 번호와 파일명 */}
          <div className="flex-grow flex items-center cursor-pointer" onClick={() => onClick(file)}>
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex flex-col items-center justify-center text-blue-700 font-bold mr-3">
              <div className="text-xs flex items-center">
                <span className="mr-1">{categoryEmojis[file.category]}</span>
                <span className="mr-1">{placeTypeEmojis[file.placeType]}</span>
              </div>
              <div>{file.number}</div>
            </div>
            <div>
              <h3 className="font-medium truncate">{file.name}</h3>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <span className="mr-3">구역: {categoryEmojis[file.category]} {file.category}</span>
                <span className="mr-3">장소: {placeTypeEmojis[file.placeType]} {file.placeType}</span>
                <span className="mr-3">업로드: {file.uploadDate}</span>
                {file.startDate && <span className="mr-3">시작일: {file.startDate}</span>}
                {file.endDate && <span className="mr-3">종료일: {file.endDate}</span>}
              </div>
            </div>
          </div>
          
          {/* 오른쪽: 상태 및 액션 버튼 */}
          <div className="flex items-center mt-3 sm:mt-0 sm:ml-4">
            <StatusBadge status={file.status} />
            <div className="flex ml-4 space-x-2" onClick={(e) => e.stopPropagation()}>
              <button 
                className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(file);
                }}
              >
                보기
              </button>
              <button 
                className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(file.id, '시작전');
                }}
              >
                시작
              </button>
              <button 
                className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(file.id, '진행중');
                }}
              >
                진행
              </button>
              <button 
                className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(file.id, '완성');
                }}
              >
                완료
              </button>
              <button 
                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(file.id);
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 카테고리 옵션 (구역)
const categoryOptions = [
  'Centro',
  'Polanco',
  'Fuera'
];

// 장소 유형 옵션
const placeTypeOptions = [
  '가게',
  '식당',
  '집',
  '사무실',
  '창고',
  '기타'
];

// 이모티콘 선택 컴포넌트
const EmojiSelector = ({ options, emojis, value, onChange, name }) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange({ target: { name, value: option }})}
          className={`flex items-center justify-center p-2 border rounded-lg ${value === option ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
        >
          <span className="text-xl mr-2">{emojis[option]}</span>
          <span>{option}</span>
        </button>
      ))}
    </div>
  );
};

export default function AreaManagementPage() {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // 선택된 파일 (모달용)
  
  // 새 파일 정보
  const [newFileInfo, setNewFileInfo] = useState({
    number: '',
    category: 'Centro',
    placeType: '가게'
  });
  
  // 로컬 스토리지에서 PDF 파일 목록 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFiles = JSON.parse(localStorage.getItem('pdfFiles') || '[]');
      setPdfFiles(savedFiles);
    }
  }, []);
  
  // PDF 파일 저장
  const savePdfFiles = (files) => {
    setPdfFiles(files);
    localStorage.setItem('pdfFiles', JSON.stringify(files));
  };
  
  // 파일 정보 변경 핸들러
  const handleFileInfoChange = (e) => {
    const { name, value } = e.target;
    setNewFileInfo({
      ...newFileInfo,
      [name]: value
    });
  };
  
  // 파일 업로드 처리
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.includes('pdf')) {
      alert('PDF 파일만 업로드 가능합니다.');
      return;
    }
    
    if (!newFileInfo.number.trim()) {
      alert('번호를 입력해주세요.');
      return;
    }
    
    setIsUploading(true);
    
    // 파일 데이터 URL 생성 (실제로는 서버에 업로드하고 URL을 받아와야 함)
    const reader = new FileReader();
    reader.onload = () => {
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: reader.result,
        uploadDate: new Date().toLocaleDateString(),
        status: '시작전',
        number: newFileInfo.number,
        category: newFileInfo.category,
        placeType: newFileInfo.placeType,
        startDate: null,
        endDate: null
      };
      
      const updatedFiles = [...pdfFiles, newFile];
      savePdfFiles(updatedFiles);
      setIsUploading(false);
      
      // 입력 필드 초기화
      setNewFileInfo({
        number: '',
        category: 'Centro',
        placeType: '가게'
      });
    };
    
    reader.readAsDataURL(file);
    e.target.value = null;  // 파일 입력 초기화
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
  
  // 파일 삭제 처리
  const handleDeleteFile = (id) => {
    if (confirm('정말 이 파일을 삭제하시겠습니까?')) {
      const updatedFiles = pdfFiles.filter(file => file.id !== id);
      savePdfFiles(updatedFiles);
      
      // 모달이 열려있고 삭제된 파일이라면 모달 닫기
      if (selectedFile && selectedFile.id === id) {
        setSelectedFile(null);
      }
    }
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
        <h1 className="text-2xl font-bold">구역 관리</h1>
        <Link 
          href="/admin"
          className="text-sm text-blue-600 hover:underline"
        >
          관리자 페이지로 돌아가기
        </Link>
      </div>
      
      {/* 파일 업로드 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="font-medium mb-4">PDF 파일 업로드</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="number"
            value={newFileInfo.number}
            onChange={handleFileInfoChange}
            placeholder="예: 001, A-12 등"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            구역
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categoryOptions.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => handleFileInfoChange({ target: { name: 'category', value: category }})}
                className={`flex items-center justify-center p-2 border rounded-lg ${newFileInfo.category === category ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <span className="text-xl mr-2">{categoryEmojis[category]}</span>
                <span>{category}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            장소 유형
          </label>
          <EmojiSelector 
            options={placeTypeOptions}
            emojis={placeTypeEmojis}
            value={newFileInfo.placeType}
            onChange={handleFileInfoChange}
            name="placeType"
          />
        </div>
        
        <label className="block w-full">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {isUploading && <p className="mt-2 text-sm text-blue-600">업로드 중...</p>}
        </label>
      </div>
      
      {/* PDF 파일 목록 */}
      <div className="mb-6">
        <h2 className="font-medium mb-4">업로드된 PDF 파일</h2>
        
        {pdfFiles.length > 0 ? (
          <div className="space-y-0">
            {pdfFiles.map(file => (
              <PDFCard
                key={file.id}
                file={file}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteFile}
                onClick={handleViewFile}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            <p>업로드된 PDF 파일이 없습니다.</p>
            <p className="mt-2 text-sm">위의 폼을 통해 PDF 파일을 업로드해주세요.</p>
          </div>
        )}
      </div>
      
      {/* PDF 모달 */}
      {selectedFile && (
        <PDFModal 
          file={selectedFile} 
          onClose={handleCloseModal} 
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteFile}
        />
      )}
    </div>
  );
} 