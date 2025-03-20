// 공통 구역 카드 컴포넌트
import { format } from 'date-fns';

export default function TerritoryCard({ territory, onClick, onChangeStatus }) {
  const statusColors = {
    disponible: 'bg-green-100 text-green-800 border-green-200',
    asignado: 'bg-blue-100 text-blue-800 border-blue-200',
    completado: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const handleStatusChange = (newStatus, e) => {
    e.stopPropagation();
    if (onChangeStatus) {
      onChangeStatus(territory.id, newStatus);
    }
  };

  // 안전한 날짜 포맷팅
  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'yyyy-MM-dd');
    } catch (e) {
      return date;
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick && onClick(territory)}
    >
      <div className="p-4">
        <div className="flex justify-between">
          <h3 className="font-medium text-lg">{territory.name || '이름 없음'}</h3>
          <span 
            className={`px-2 py-1 text-xs rounded-full ${statusColors[territory.status] || 'bg-gray-100'}`}
          >
            {territory.status || '상태 없음'}
          </span>
        </div>
        
        {territory.publisher && (
          <p className="mt-2 text-sm text-gray-600">
            담당자: {territory.publisher}
          </p>
        )}
        
        <div className="mt-3 flex text-xs text-gray-500">
          <div className="flex-1">
            <p>할당일: {formatDate(territory.assignedDate)}</p>
            <p>마감일: {formatDate(territory.completionDate)}</p>
          </div>
        </div>
        
        {onChangeStatus && (
          <div className="mt-3 flex justify-end space-x-2">
            <button 
              onClick={(e) => handleStatusChange('disponible', e)}
              className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100"
            >
              사용 가능
            </button>
            <button 
              onClick={(e) => handleStatusChange('asignado', e)}
              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100"
            >
              할당
            </button>
            <button 
              onClick={(e) => handleStatusChange('completado', e)}
              className="px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded border border-gray-200 hover:bg-gray-100"
            >
              완료
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 