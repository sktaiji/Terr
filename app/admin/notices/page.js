'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { parseISO, isBefore, startOfDay } from 'date-fns';

// 공지사항 카테고리 이모티콘
const categoryEmojis = {
  '회중': '🏛️',
  '순회구': '🔄',
  '기타': '📢'
};

// 중요도 이모티콘
const importanceLevels = [
  { value: 'low', label: '낮음', emoji: '🔽' },
  { value: 'medium', label: '보통', emoji: '⏺️' },
  { value: 'high', label: '높음', emoji: '🔼' }
];

// 공지사항 카드 컴포넌트
const NoticeCard = ({ notice, onEdit, onDelete }) => {
  // 오늘 날짜와 비교하여 지난 공지사항인지 확인
  const today = startOfDay(new Date());
  const noticeDate = parseISO(notice.date);
  const isPast = isBefore(noticeDate, today);
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden mb-3 p-4 ${isPast ? 'grayscale' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center">
            <span className="text-xl mr-2">{categoryEmojis[notice.category]}</span>
            <h3 className="font-bold text-lg">{notice.title}</h3>
            {notice.importance === 'high' && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">중요</span>
            )}
            {isPast && (
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">지난 공지</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{notice.date} • {notice.category}</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(notice)}
            className="text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(notice.id)}
            className="text-red-600 hover:text-red-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-2">
        <p className="text-gray-700 whitespace-pre-line">{notice.content}</p>
      </div>
    </div>
  );
};

export default function NoticesManagementPage() {
  const [notices, setNotices] = useState([]);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '회중',
    date: new Date().toISOString().split('T')[0],
    content: '',
    importance: 'medium'
  });

  // 로컬 스토리지에서 공지사항 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNotices = JSON.parse(localStorage.getItem('notices') || '[]');
      setNotices(savedNotices);
    }
  }, []);

  // 공지사항 저장
  const saveNotices = (updatedNotices) => {
    setNotices(updatedNotices);
    localStorage.setItem('notices', JSON.stringify(updatedNotices));
  };

  // 입력 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 공지사항 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingNotice) {
      // 공지사항 수정
      const updatedNotices = notices.map(notice => 
        notice.id === editingNotice.id 
          ? { ...formData, id: editingNotice.id } 
          : notice
      );
      saveNotices(updatedNotices);
      setEditingNotice(null);
    } else {
      // 새 공지사항 추가
      const newNotice = {
        ...formData,
        id: Date.now().toString(),
      };
      saveNotices([...notices, newNotice]);
    }
    
    // 폼 초기화
    setFormData({
      title: '',
      category: '회중',
      date: new Date().toISOString().split('T')[0],
      content: '',
      importance: 'medium'
    });
  };

  // 수정 모드 핸들러
  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      category: notice.category,
      date: notice.date,
      content: notice.content,
      importance: notice.importance
    });
    
    // 폼으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 삭제 핸들러
  const handleDelete = (id) => {
    if (confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
      const updatedNotices = notices.filter(notice => notice.id !== id);
      saveNotices(updatedNotices);
    }
  };

  // 폼 취소 핸들러
  const handleCancel = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      category: '회중',
      date: new Date().toISOString().split('T')[0],
      content: '',
      importance: 'medium'
    });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        <Link 
          href="/admin"
          className="text-sm text-blue-600 hover:underline"
        >
          관리자 페이지로 돌아가기
        </Link>
      </div>
      
      {/* 공지사항 입력 폼 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="font-medium mb-4">{editingNotice ? '공지사항 수정' : '새 공지사항 작성'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                날짜 <span className="text-red-500">*</span>
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(categoryEmojis).map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setFormData({ ...formData, category })}
                    className={`flex items-center justify-center p-2 border rounded-lg ${formData.category === category ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span className="text-xl mr-2">{categoryEmojis[category]}</span>
                    <span>{category}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                중요도
              </label>
              <div className="grid grid-cols-3 gap-2">
                {importanceLevels.map(level => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, importance: level.value })}
                    className={`flex items-center justify-center p-2 border rounded-lg ${formData.importance === level.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span className="text-xl mr-2">{level.emoji}</span>
                    <span>{level.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="5"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            {editingNotice && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editingNotice ? '수정하기' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
      
      {/* 공지사항 목록 */}
      <div className="mb-6">
        <h2 className="font-medium mb-4">공지사항 목록</h2>
        
        {notices.length > 0 ? (
          <div className="space-y-4">
            {notices.map(notice => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            <p>등록된 공지사항이 없습니다.</p>
            <p className="mt-2 text-sm">위의 폼을 통해 공지사항을 작성해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
} 