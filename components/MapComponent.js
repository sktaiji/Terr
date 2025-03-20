// 별도 맵 컴포넌트 - 코드 분리용
import { useRef, useEffect, useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';

export default function MapComponent({ territories }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const processAddress = (address) => {
    if (!address) return '';
    // 주소 정규화 로직
    return address.replace(/\s+/g, ' ').trim();
  };

  useEffect(() => {
    if (!isLoaded) return;

    const initMap = () => {
      // 가상 좌표 (실제 앱에서는 실제 좌표로 대체)
      const center = { lat: 37.7749, lng: -122.4194 };

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      setMap(mapInstance);
      setInfoWindow(new window.google.maps.InfoWindow());
      setDirectionsService(new window.google.maps.DirectionsService());
      setDirectionsRenderer(new window.google.maps.DirectionsRenderer({ map: mapInstance }));

      // 마커 생성
      const territoryMarkers = territories.map(territory => {
        // 가상 좌표 (실제 데이터로 대체 필요)
        const position = { 
          lat: center.lat + Math.random() * 0.02 - 0.01, 
          lng: center.lng + Math.random() * 0.02 - 0.01 
        };

        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance,
          title: territory.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: getStatusColor(territory.status),
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#fff',
          }
        });

        marker.addListener('click', () => {
          const content = createInfoWindowContent(territory);
          infoWindow.setContent(content);
          infoWindow.open(mapInstance, marker);
        });

        return marker;
      });

      setMarkers(territoryMarkers);
    };

    initMap();

    return () => {
      // 정리
      markers.forEach(marker => marker.setMap(null));
    };
  }, [isLoaded, territories]);

  const calculateRoute = (origin, destination) => {
    if (!directionsService || !directionsRenderer) return;

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
          setError('');
        } else {
          directionsRenderer.setDirections({ routes: [] });
          setError('경로를 찾을 수 없습니다');
        }
      }
    );
  };

  const handleRouteSearch = (e) => {
    e.preventDefault();
    if (origin && destination) {
      calculateRoute(origin, destination);
    }
  };

  if (!isLoaded) return <div className="bg-gray-100 p-4 rounded-lg">지도 로딩 중...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-sky-50 flex flex-col gap-4 md:flex-row">
        <form onSubmit={handleRouteSearch} className="flex flex-col md:flex-row gap-2 flex-1">
          <input
            type="text"
            placeholder="출발지"
            className="flex-1 p-2 border rounded"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
          <input
            type="text"
            placeholder="도착지"
            className="flex-1 p-2 border rounded"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
            경로 찾기
          </button>
        </form>
      </div>
      {error && <div className="p-2 text-red-500 text-sm">{error}</div>}
      <div ref={mapRef} style={{ height: '500px', width: '100%' }}></div>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'disponible': return '#4ADE80'; // 녹색
    case 'asignado': return '#3B82F6'; // 파란색
    case 'completado': return '#6B7280'; // 회색
    default: return '#3B82F6'; // 기본 파란색
  }
}

function createInfoWindowContent(territory) {
  return `
    <div style="max-width: 200px; padding: 5px;">
      <h3 style="font-weight: bold; margin-bottom: 5px;">${territory.name || '이름 없음'}</h3>
      <p style="margin: 5px 0;">상태: ${territory.status || ''}</p>
      ${territory.publisher ? `<p style="margin: 5px 0;">담당자: ${territory.publisher}</p>` : ''}
      ${territory.address ? `<p style="margin: 5px 0; font-size: 0.9em;">주소: ${territory.address}</p>` : ''}
    </div>
  `;
} 