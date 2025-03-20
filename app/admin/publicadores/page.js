'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';

// 전도인 특권(직분) 목록
const privileges = [
  { id: 'publisher', name: 'Publicador' },
  { id: 'ministerial_servant', name: 'Siervo Ministerial' },
  { id: 'elder', name: 'Anciano' }
];

// 파이오니아 유형 목록
const pioneerTypes = [
  { id: 'none', name: 'No Aplica' },
  { id: 'auxiliary', name: 'Pionero Auxiliar' },
  { id: 'regular', name: 'Pionero Regular' },
  { id: 'special', name: 'Precursor Especial' }
];

// 전도인 카드 컴포넌트
const PublisherCard = ({ publisher, onEdit, onDelete }) => {
  // 파이오니아 타입에 따른 배지 색상
  const pioneerBadgeColor = {
    'none': 'bg-gray-100 text-gray-800',
    'auxiliary': 'bg-yellow-100 text-yellow-800',
    'regular': 'bg-green-100 text-green-800',
    'special': 'bg-purple-100 text-purple-800'
  };
  
  // 특권에 따른 배지 색상
  const privilegeBadgeColor = {
    'publisher': 'bg-sky-100 text-sky-800',
    'ministerial_servant': 'bg-indigo-100 text-indigo-800',
    'elder': 'bg-red-100 text-red-800'
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-sky-500 to-indigo-500 p-3 text-white flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-lg mr-2">{publisher.gender === 'brother' ? '👨' : '👩'}</span>
          <h3 className="font-medium">{publisher.name}</h3>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(publisher)}
            className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(publisher.id)}
            className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${privilegeBadgeColor[publisher.privilege]}`}>
            {privileges.find(p => p.id === publisher.privilege)?.name}
          </span>
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${pioneerBadgeColor[publisher.pioneerType]}`}>
            {pioneerTypes.find(p => p.id === publisher.pioneerType)?.name}
          </span>
          {publisher.isCaptain && (
            <span className="inline-block bg-sky-100 text-sky-800 px-2 py-1 text-xs font-medium rounded-full">
              Capitán
            </span>
          )}
          {publisher.isCart && (
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full">
              Carrito
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-1 text-sm">
          <div>
            <p className="text-gray-500">Número:</p>
            <p className="font-medium">{publisher.number || '---'}</p>
          </div>
          <div>
            <p className="text-gray-500">Grupo:</p>
            <p className="font-medium">{publisher.group || '---'}</p>
          </div>
          <div className="col-span-2 mt-1">
            <p className="text-gray-500">Teléfono:</p>
            <a 
              href={`tel:${publisher.phone}`} 
              className="text-sky-600 hover:underline"
            >
              {publisher.phone || '---'}
            </a>
          </div>
          <div className="col-span-2 mt-1">
            <p className="text-gray-500">Correo:</p>
            <a 
              href={`mailto:${publisher.email}`} 
              className="text-sky-600 hover:underline truncate block"
            >
              {publisher.email || '---'}
            </a>
          </div>
          <div className="col-span-2 mt-1">
            <p className="text-gray-500">Dirección:</p>
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(publisher.address || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:underline text-xs"
            >
              {publisher.address || '---'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// 전도인 폼 컴포넌트
const PublisherForm = ({ onSubmit, editingPublisher, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    group: '',
    gender: 'brother',
    phone: '',
    email: '',
    address: '',
    privilege: 'publisher',
    pioneerType: 'none',
    isCaptain: false,
    isCart: false
  });
  
  // 수정 모드로 전환 시 데이터 설정
  useEffect(() => {
    if (editingPublisher) {
      setFormData({ ...editingPublisher });
    } else {
      // 폼 초기화
      setFormData({
        name: '',
        group: '',
        gender: 'brother',
        phone: '',
        email: '',
        address: '',
        privilege: 'publisher',
        pioneerType: 'none',
        isCaptain: false,
        isCart: false
      });
    }
  }, [editingPublisher]);
  
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
    if (!formData.name) {
      alert('Por favor, ingrese al menos el nombre del publicador.');
      return;
    }
    
    // 제출 데이터 준비
    const publisherData = {
      ...formData,
      id: editingPublisher ? editingPublisher.id : `publisher-${Date.now()}`
    };
    
    // 부모 컴포넌트로 데이터 전달
    onSubmit(publisherData, !!editingPublisher);
    
    // 폼 초기화
    if (!editingPublisher) {
      setFormData({
        name: '',
        group: '',
        gender: 'brother',
        phone: '',
        email: '',
        address: '',
        privilege: 'publisher',
        pioneerType: 'none',
        isCaptain: false,
        isCart: false
      });
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-medium mb-3">
        {editingPublisher ? 'Editar Publicador' : 'Registrar Nuevo Publicador'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre*
            </label>
            <input 
              type="text"
              name="name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nombre Completo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="gender" 
                  value="brother"
                  checked={formData.gender === 'brother'}
                  onChange={handleChange}
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300"
                />
                <span className="ml-2 text-sm">Hermano</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="gender" 
                  value="sister"
                  checked={formData.gender === 'sister'}
                  onChange={handleChange}
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300"
                />
                <span className="ml-2 text-sm">Hermana</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grupo
            </label>
            <select
              name="group"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.group}
              onChange={handleChange}
            >
              <option value="">-- Seleccionar grupo --</option>
              <option value="1">Grupo 1</option>
              <option value="2">Grupo 2</option>
              <option value="3">Grupo 3</option>
              <option value="4">Grupo 4</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input 
              type="tel"
              name="phone"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Número de teléfono"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input 
              type="email"
              name="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo electrónico"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input 
              type="text"
              name="address"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.address}
              onChange={handleChange}
              placeholder="Dirección completa"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Privilegio
            </label>
            <select
              name="privilege"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.privilege}
              onChange={handleChange}
            >
              {privileges.map(privilege => (
                <option key={privilege.id} value={privilege.id}>
                  {privilege.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precursor
            </label>
            <select
              name="pioneerType"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.pioneerType}
              onChange={handleChange}
            >
              {pioneerTypes.map(pioneerType => (
                <option key={pioneerType.id} value={pioneerType.id}>
                  {pioneerType.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox"
                name="isCaptain"
                checked={formData.isCaptain}
                onChange={handleChange}
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm">Asignable como Capitán</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox"
                name="isCart"
                checked={formData.isCart}
                onChange={handleChange}
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm">Puede servir en Carrito</span>
            </label>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {editingPublisher && (
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
            {editingPublisher ? 'Actualizar Publicador' : 'Registrar Publicador'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default function AdminPublisherPage() {
  const [publishers, setPublishers] = useState([]);
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  
  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    const savedPublishers = JSON.parse(localStorage.getItem('publishers') || '[]');
    setPublishers(savedPublishers);
  }, []);
  
  // 전도인 데이터 저장하기
  const savePublishers = (updatedPublishers) => {
    localStorage.setItem('publishers', JSON.stringify(updatedPublishers));
    setPublishers(updatedPublishers);
  };
  
  // 전도인 추가/수정 핸들러
  const handlePublisherSubmit = (publisherData, isEditing) => {
    let updatedPublishers;
    
    if (isEditing) {
      // 기존 전도인 수정
      updatedPublishers = publishers.map(publisher => 
        publisher.id === publisherData.id ? publisherData : publisher
      );
    } else {
      // 새 전도인 추가
      updatedPublishers = [...publishers, publisherData];
    }
    
    savePublishers(updatedPublishers);
    setEditingPublisher(null);
  };
  
  // 전도인 삭제 핸들러
  const handleDeletePublisher = (publisherId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este publicador?')) {
      const updatedPublishers = publishers.filter(
        publisher => publisher.id !== publisherId
      );
      savePublishers(updatedPublishers);
    }
  };
  
  // 전도인 수정 모드 핸들러
  const handleEditPublisher = (publisher) => {
    setEditingPublisher(publisher);
    // 스크롤 상단으로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 정렬 핸들러
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // 정렬된 데이터 가져오기
  const getSortedPublishers = () => {
    if (!sortConfig.key) {
      return publishers;
    }
    
    return [...publishers].sort((a, b) => {
      // 정렬 키에 따라 처리
      if (sortConfig.key === 'id') {
        return sortConfig.direction === 'ascending'
          ? parseInt(a.id.replace('publisher-', '')) - parseInt(b.id.replace('publisher-', ''))
          : parseInt(b.id.replace('publisher-', '')) - parseInt(a.id.replace('publisher-', ''));
      }
      
      if (sortConfig.key === 'name' || sortConfig.key === 'address') {
        const valueA = (a[sortConfig.key] || '').toLowerCase();
        const valueB = (b[sortConfig.key] || '').toLowerCase();
        
        if (valueA < valueB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      }
      
      if (sortConfig.key === 'isCaptain' || sortConfig.key === 'isCart') {
        const boolA = a[sortConfig.key] || false;
        const boolB = b[sortConfig.key] || false;
        
        if (boolA === boolB) return 0;
        return sortConfig.direction === 'ascending'
          ? (boolA ? 1 : -1)
          : (boolA ? -1 : 1);
      }
      
      // 나머지 필드에 대한 정렬
      const valueA = a[sortConfig.key] || '';
      const valueB = b[sortConfig.key] || '';
      
      if (valueA < valueB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  // 약자 변환 함수들
  const getGenderAbbr = (gender) => {
    return gender === 'brother' ? 'H' : 'M'; // Hermano -> H, Hermana -> M (Mujer)
  };

  const getPioneerAbbr = (pioneerType) => {
    const typeMap = {
      'none': '-',
      'auxiliary': 'PA',
      'regular': 'PR',
      'special': 'PE'
    };
    return typeMap[pioneerType] || '-';
  };

  const getPrivilegeAbbr = (privilege) => {
    const privMap = {
      'publisher': 'PUB',
      'ministerial_servant': 'SM',
      'elder': 'ANC'
    };
    return privMap[privilege] || '-';
  };

  // 정렬 방향 표시 아이콘
  const getSortDirectionIcon = (name) => {
    if (sortConfig.key !== name) {
      return <span className="text-gray-300 ml-1">⇅</span>;
    }
    
    return sortConfig.direction === 'ascending' 
      ? <span className="text-sky-500 ml-1">↑</span> 
      : <span className="text-sky-500 ml-1">↓</span>;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Administración de Publicadores</h1>
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
        
        {/* 전도인 등록 폼 */}
        <div className="mb-6">
          <PublisherForm 
            onSubmit={handlePublisherSubmit} 
            editingPublisher={editingPublisher}
            onCancelEdit={() => setEditingPublisher(null)}
          />
        </div>
        
        {/* 전도인 목록 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">
            Lista de Publicadores
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({publishers.length})
            </span>
          </h2>
          
          {publishers.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="h-12">
                    <th scope="col" className="px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <button className="hover:text-sky-700 font-semibold flex items-center" onClick={() => requestSort('id')}>
                        No{getSortDirectionIcon('id')}
                      </button>
                    </th>
                    <th scope="col" className="px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                      <button className="hover:text-sky-700 font-semibold flex items-center" onClick={() => requestSort('name')}>
                        Nombre{getSortDirectionIcon('name')}
                      </button>
                    </th>
                    <th scope="col" className="px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      <button className="hover:text-sky-700 font-semibold flex items-center justify-center" onClick={() => requestSort('gender')}>
                        Género{getSortDirectionIcon('gender')}
                      </button>
                    </th>
                    <th scope="col" className="px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                      <button className="hover:text-sky-700 font-semibold flex items-center justify-center" onClick={() => requestSort('phone')}>
                        Teléfono{getSortDirectionIcon('phone')}
                      </button>
                    </th>
                    <th scope="col" className="px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                      <button className="hover:text-sky-700 font-semibold flex items-center justify-center" onClick={() => requestSort('pioneerType')}>
                        Pionero{getSortDirectionIcon('pioneerType')}
                      </button>
                    </th>
                    <th scope="col" className="px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      <button className="hover:text-sky-700 font-semibold flex items-center justify-center" onClick={() => requestSort('group')}>
                        Grupo{getSortDirectionIcon('group')}
                      </button>
                    </th>
                    <th scope="col" className="px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                      <button className="hover:text-sky-700 font-semibold flex items-center justify-center" onClick={() => requestSort('privilege')}>
                        Privilegio{getSortDirectionIcon('privilege')}
                      </button>
                    </th>
                    <th scope="col" className="px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      <button className="hover:text-sky-700 font-semibold flex items-center justify-center" onClick={() => requestSort('isCaptain')}>
                        Capitán{getSortDirectionIcon('isCaptain')}
                      </button>
                    </th>
                    <th scope="col" className="px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      <button className="hover:text-sky-700 font-semibold flex items-center justify-center" onClick={() => requestSort('isCart')}>
                        Carrito
                      </button>
                    </th>
                    <th scope="col" className="px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[220px]">
                      <button className="hover:text-sky-700 font-semibold flex items-center" onClick={() => requestSort('address')}>
                        Dirección{getSortDirectionIcon('address')}
                      </button>
                    </th>
                    <th scope="col" className="px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Gestionar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSortedPublishers().map((publisher, index) => (
                    <tr key={publisher.id} className={`h-14 ${index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <td className="px-3 text-sm text-gray-900 text-center font-medium">{index + 1}</td>
                      <td className="px-3 text-sm">
                        <div className="flex items-center">
                          <span className="font-medium text-sky-600 truncate max-w-[180px]" title={publisher.name}>
                            {publisher.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 text-base text-gray-900 text-center">
                        {getGenderAbbr(publisher.gender)}
                      </td>
                      <td className="px-3 text-sm text-blue-600 text-center">
                        {publisher.phone ? (
                          <a href={`tel:${publisher.phone}`} className="hover:underline">{publisher.phone}</a>
                        ) : '-'}
                      </td>
                      <td className="px-3 text-base text-gray-900 text-center font-medium">
                        {getPioneerAbbr(publisher.pioneerType)}
                      </td>
                      <td className="px-3 text-base text-gray-900 text-center">
                        {publisher.group || '-'}
                      </td>
                      <td className="px-3 text-base text-gray-900 text-center font-medium">
                        {getPrivilegeAbbr(publisher.privilege)}
                      </td>
                      <td className="px-3 text-base text-center">
                        {publisher.isCaptain ? (
                          <span className="inline-flex items-center justify-center text-lg text-sky-600" title="Capitán">
                            👨‍✈️
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-3 text-base text-center">
                        {publisher.isCart ? (
                          <span className="inline-flex items-center justify-center text-lg text-blue-600" title="Carrito">
                            🛒
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-3 text-sm text-blue-600">
                        {publisher.address ? (
                          <a 
                            href={`https://maps.google.com/?q=${encodeURIComponent(publisher.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline line-clamp-1"
                            title={publisher.address}
                          >
                            {publisher.address}
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-3 text-sm font-medium">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEditPublisher(publisher)}
                            className="text-sky-600 hover:text-sky-900"
                            title="Editar publicador"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeletePublisher(publisher.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar publicador"
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
            <div className="bg-white p-6 text-center rounded-lg shadow-sm">
              <p className="text-gray-600 mb-1">No se encontraron publicadores</p>
              <p className="text-sm text-gray-500">Agregue publicadores utilizando el formulario de arriba</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 