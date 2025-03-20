'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// 공지사항 카드 컴포넌트
const NoticeCard = ({ notice, onEdit, onDelete }) => {
  const formattedDate = notice.date 
    ? format(new Date(notice.date), 'dd/MM/yyyy', { locale: es })
    : '';
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-lg mr-2">📢</span>
          <h3 className="font-medium">{notice.title}</h3>
          {notice.important && (
            <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">Importante</span>
          )}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(notice)}
            className="text-sky-600 hover:text-sky-900"
            title="Editar anuncio"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(notice.id)}
            className="text-red-600 hover:text-red-900"
            title="Eliminar anuncio"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="px-3 py-3">
        <div className="mb-3">
          <div className="flex items-center mb-1">
            <span className="text-gray-500 text-xs">Fecha:</span>
            <span className="ml-1 text-sm">{formattedDate}</span>
          </div>
          {notice.expireDate && (
            <div className="flex items-center">
              <span className="text-gray-500 text-xs">Expira:</span>
              <span className="ml-1 text-sm">
                {format(new Date(notice.expireDate), 'dd/MM/yyyy', { locale: es })}
              </span>
            </div>
          )}
        </div>
        <p className="text-sm line-clamp-2 mb-2">{notice.content}</p>
        {notice.imageUrl && (
          <div className="border border-gray-200 rounded-md p-1 bg-gray-50 mt-2 mb-2">
            <img 
              src={notice.imageUrl} 
              alt={notice.title} 
              className="h-20 w-full object-cover rounded" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

// 공지사항 폼 컴포넌트
const NoticeForm = ({ onSubmit, editingNotice, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    expireDate: '',
    important: false,
    imageUrl: ''
  });
  
  // 수정 모드로 전환 시 데이터 설정
  useEffect(() => {
    if (editingNotice) {
      const formattedData = {
        ...editingNotice,
        date: editingNotice.date 
          ? format(new Date(editingNotice.date), 'yyyy-MM-dd')
          : format(new Date(), 'yyyy-MM-dd'),
        expireDate: editingNotice.expireDate
          ? format(new Date(editingNotice.expireDate), 'yyyy-MM-dd')
          : ''
      };
      setFormData(formattedData);
    } else {
      // 폼 초기화
      setFormData({
        title: '',
        content: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        expireDate: '',
        important: false,
        imageUrl: ''
      });
    }
  }, [editingNotice]);
  
  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 필수 필드 확인
    if (!formData.title || !formData.content) {
      alert('Por favor, complete al menos el título y el contenido del anuncio.');
      return;
    }
    
    // 날짜 형식 변환
    const noticeData = {
      ...formData,
      id: editingNotice ? editingNotice.id : `notice-${Date.now()}`,
      date: new Date(formData.date).toISOString(),
      expireDate: formData.expireDate ? new Date(formData.expireDate).toISOString() : null,
      createdAt: editingNotice ? editingNotice.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 부모 컴포넌트로 데이터 전달
    onSubmit(noticeData, !!editingNotice);
    
    // 폼 초기화 (수정 모드가 아닌 경우)
    if (!editingNotice) {
      setFormData({
        title: '',
        content: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        expireDate: '',
        important: false,
        imageUrl: ''
      });
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-medium mb-3">
        {editingNotice ? 'Editar Anuncio' : 'Crear Nuevo Anuncio'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título*
          </label>
          <input 
            type="text"
            name="title"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Título del anuncio"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contenido*
          </label>
          <textarea 
            name="content"
            rows="4"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            value={formData.content}
            onChange={handleChange}
            required
            placeholder="Contenido del anuncio"
          ></textarea>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Publicación
            </label>
            <input 
              type="date"
              name="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Expiración
            </label>
            <input 
              type="date"
              name="expireDate"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.expireDate}
              onChange={handleChange}
              min={formData.date}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL de Imagen
          </label>
          <input 
            type="url"
            name="imageUrl"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          {formData.imageUrl && (
            <div className="mt-2 border rounded-md p-2">
              <img 
                src={formData.imageUrl} 
                alt="Vista previa" 
                className="h-32 w-full object-cover rounded" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/300x150?text=Error+de+imagen";
                }}
              />
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="flex items-center">
            <input 
              type="checkbox"
              name="important"
              checked={formData.important}
              onChange={handleChange}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm">Marcar como importante</span>
          </label>
        </div>
        
        <div className="flex space-x-2">
          {editingNotice && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            {editingNotice ? 'Actualizar Anuncio' : 'Publicar Anuncio'}
          </button>
        </div>
      </form>
    </div>
  );
};

// 청소 그룹 관리 컴포넌트
const CleaningGroupManager = () => {
  const [groups, setGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    groupNumber: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    leader: '',
    members: []
  });
  
  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    const savedGroups = JSON.parse(localStorage.getItem('cleaningGroups') || '[]');
    setGroups(savedGroups);
  }, []);
  
  // 그룹 데이터 저장하기
  const saveGroups = (updatedGroups) => {
    localStorage.setItem('cleaningGroups', JSON.stringify(updatedGroups));
    setGroups(updatedGroups);
  };
  
  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.groupNumber) {
      alert('Por favor, ingrese al menos el número de grupo.');
      return;
    }
    
    let updatedGroups;
    const groupData = {
      ...formData,
      id: editingGroup ? editingGroup.id : `group-${Date.now()}`,
      date: new Date(formData.date).toISOString()
    };
    
    if (editingGroup) {
      // 기존 그룹 수정
      updatedGroups = groups.map(group => 
        group.id === groupData.id ? groupData : group
      );
    } else {
      // 새 그룹 추가
      updatedGroups = [...groups, groupData];
    }
    
    saveGroups(updatedGroups);
    
    // 폼 초기화
    setFormData({
      groupNumber: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      leader: '',
      members: []
    });
    setEditingGroup(null);
  };
  
  // 그룹 수정 핸들러
  const handleEditGroup = (group) => {
    const formattedGroup = {
      ...group,
      date: format(new Date(group.date), 'yyyy-MM-dd')
    };
    setFormData(formattedGroup);
    setEditingGroup(group);
  };
  
  // 그룹 삭제 핸들러
  const handleDeleteGroup = (groupId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este grupo?')) {
      const updatedGroups = groups.filter(
        group => group.id !== groupId
      );
      saveGroups(updatedGroups);
    }
  };
  
  // 취소 핸들러
  const handleCancel = () => {
    setFormData({
      groupNumber: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      leader: '',
      members: []
    });
    setEditingGroup(null);
  };
  
  // 멤버 추가 핸들러
  const handleAddMember = () => {
    setFormData({
      ...formData,
      members: [...formData.members, '']
    });
  };
  
  // 멤버 변경 핸들러
  const handleMemberChange = (index, value) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index] = value;
    setFormData({
      ...formData,
      members: updatedMembers
    });
  };
  
  // 멤버 제거 핸들러
  const handleRemoveMember = (index) => {
    const updatedMembers = formData.members.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      members: updatedMembers
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-medium mb-3">
        {editingGroup ? 'Editar Grupo de Limpieza' : 'Agregar Grupo de Limpieza'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Grupo*
            </label>
            <input 
              type="text"
              name="groupNumber"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.groupNumber}
              onChange={handleChange}
              required
              placeholder="Ej: Grupo 1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Limpieza
            </label>
            <input 
              type="date"
              name="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Líder del Grupo
          </label>
          <input 
            type="text"
            name="leader"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            value={formData.leader}
            onChange={handleChange}
            placeholder="Nombre del líder"
          />
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Miembros del Grupo
            </label>
            <button 
              type="button"
              onClick={handleAddMember}
              className="text-sky-600 text-sm hover:text-sky-800"
            >
              + Agregar Miembro
            </button>
          </div>
          
          {formData.members.length > 0 ? (
            <div className="space-y-2">
              {formData.members.map((member, index) => (
                <div key={index} className="flex items-center">
                  <input 
                    type="text"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    value={member}
                    onChange={(e) => handleMemberChange(index, e.target.value)}
                    placeholder={`Miembro ${index + 1}`}
                  />
                  <button 
                    type="button"
                    onClick={() => handleRemoveMember(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay miembros agregados</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          {editingGroup && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            {editingGroup ? 'Actualizar Grupo' : 'Agregar Grupo'}
          </button>
        </div>
      </form>
      
      <div className="mt-6">
        <h4 className="font-medium mb-3">Grupos de Limpieza</h4>
        
        {groups.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="h-12">
                  <th scope="col" className="px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-semibold">Grupo</th>
                  <th scope="col" className="px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-semibold">Fecha</th>
                  <th scope="col" className="px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-semibold">Líder</th>
                  <th scope="col" className="px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-semibold">Miembros</th>
                  <th scope="col" className="px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider font-semibold w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groups.map((group, index) => (
                  <tr key={group.id} className={`h-14 ${index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    <td className="px-3 text-sm text-gray-900 font-medium">{group.groupNumber}</td>
                    <td className="px-3 text-sm text-gray-900">
                      {format(new Date(group.date), 'dd/MM/yyyy', { locale: es })}
                    </td>
                    <td className="px-3 text-sm text-gray-900">{group.leader || '-'}</td>
                    <td className="px-3 text-sm text-gray-900">
                      {group.members && group.members.length > 0 ? (
                        <span>{group.members.join(', ')}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-3 text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditGroup(group)}
                          className="text-sky-600 hover:text-sky-900"
                          title="Editar grupo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar grupo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No hay grupos de limpieza registrados</p>
        )}
      </div>
    </div>
  );
};

export default function AdminAnnouncementPage() {
  const [notices, setNotices] = useState([]);
  const [editingNotice, setEditingNotice] = useState(null);
  const [filterImportant, setFilterImportant] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('notices'); // 'notices' or 'cleaning'
  
  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    const savedNotices = JSON.parse(localStorage.getItem('notices') || '[]');
    setNotices(savedNotices);
  }, []);
  
  // 공지사항 데이터 저장하기
  const saveNotices = (updatedNotices) => {
    localStorage.setItem('notices', JSON.stringify(updatedNotices));
    setNotices(updatedNotices);
  };
  
  // 공지사항 추가/수정 핸들러
  const handleNoticeSubmit = (noticeData, isEditing) => {
    let updatedNotices;
    
    if (isEditing) {
      // 기존 공지사항 수정
      updatedNotices = notices.map(notice => 
        notice.id === noticeData.id ? noticeData : notice
      );
    } else {
      // 새 공지사항 추가
      updatedNotices = [...notices, noticeData];
    }
    
    saveNotices(updatedNotices);
    setEditingNotice(null);
  };
  
  // 공지사항 삭제 핸들러
  const handleDeleteNotice = (noticeId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este anuncio?')) {
      const updatedNotices = notices.filter(
        notice => notice.id !== noticeId
      );
      saveNotices(updatedNotices);
    }
  };
  
  // 공지사항 수정 모드 핸들러
  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    // 스크롤 상단으로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // 필터링된 공지사항 목록
  const filteredNotices = notices.filter(notice => {
    // 필터 조건 검사
    const importantMatch = !filterImportant || notice.important;
    
    // 검색어 검사
    const searchMatch = !searchTerm || 
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return importantMatch && searchMatch;
  });
  
  // 정렬된 공지사항 목록 (최신순)
  const sortedNotices = [...filteredNotices].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Administración de Anuncios</h1>
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
        
        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex text-sm">
            <button
              className={`py-3 px-4 font-medium rounded-tl-lg ${
                activeTab === 'notices' 
                  ? 'bg-sky-500 text-white' 
                  : 'text-gray-500 hover:text-sky-600'
              }`}
              onClick={() => setActiveTab('notices')}
            >
              Anuncios
            </button>
            <button
              className={`py-3 px-4 font-medium ${
                activeTab === 'cleaning' 
                  ? 'bg-sky-500 text-white' 
                  : 'text-gray-500 hover:text-sky-600'
              }`}
              onClick={() => setActiveTab('cleaning')}
            >
              Limpieza de Salón
            </button>
          </div>
        </div>
        
        {activeTab === 'notices' ? (
          <>
            {/* 공지사항 등록 폼 */}
            <div className="mb-6">
              <NoticeForm 
                onSubmit={handleNoticeSubmit} 
                editingNotice={editingNotice}
                onCancelEdit={() => setEditingNotice(null)}
              />
            </div>
            
            {/* 검색 및 필터 */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar en título o contenido..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox"
                      checked={filterImportant}
                      onChange={(e) => setFilterImportant(e.target.checked)}
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm">Solo anuncios importantes</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* 공지사항 목록 */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">
                Anuncios
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({sortedNotices.length} de {notices.length})
                </span>
              </h2>
              
              {sortedNotices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedNotices.map(notice => (
                    <NoticeCard
                      key={notice.id}
                      notice={notice}
                      onEdit={handleEditNotice}
                      onDelete={handleDeleteNotice}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  <p className="text-gray-600 mb-1">No se encontraron anuncios</p>
                  <p className="text-sm text-gray-500">
                    {searchTerm || filterImportant 
                      ? 'Intente con otros filtros de búsqueda' 
                      : 'Agregue anuncios utilizando el formulario de arriba'}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          // 청소 그룹 관리 탭
          <CleaningGroupManager />
        )}
      </div>
    </Layout>
  );
} 