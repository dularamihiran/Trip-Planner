'use client';

import { Place } from '@/types/trip';
import { useState, useEffect } from 'react';
import GoogleMapComponent from './GoogleMapComponent';

interface MapPanelProps {
  places: Place[];
  tripName: string;
  startPoint?: string;
  startPointLat?: number;
  startPointLng?: number;
}

const MapPanel: React.FC<MapPanelProps> = ({ places, tripName, startPoint, startPointLat, startPointLng }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [realDistance, setRealDistance] = useState<string>('');
  const [realDuration, setRealDuration] = useState<string>('');

  // Clear real stats when places input changes (e.g. place checked/unchecked) to trigger recalculation
  useEffect(() => {
    setRealDistance('');
    setRealDuration('');
  }, [places]);

  // Filter out places that are already completed (visitStatus === 'DONE')
  const completedPlaces = places.filter(p => p.visitStatus === 'DONE');
  const remainingPlaces = places.filter(p => p.visitStatus !== 'DONE');
  const hasCompletedPlaces = completedPlaces.length > 0;

  // Decide the active start point: if any place has been completed, start route from the last completed place.
  let route起点: any[] = [];
  if (hasCompletedPlaces) {
    const lastCompleted = completedPlaces[completedPlaces.length - 1];
    const crudeLat = lastCompleted.lat || (lastCompleted as any).latitude || 0;
    const crudeLng = lastCompleted.lng || (lastCompleted as any).longitude || 0;
    route起点 = [{
      id: lastCompleted.placeId,
      name: `Visited: ${lastCompleted.name}`,
      category: 'Start', // Treated as start marker
      address: lastCompleted.district,
      lat: typeof crudeLat === 'string' ? parseFloat(crudeLat) : crudeLat,
      lng: typeof crudeLng === 'string' ? parseFloat(crudeLng) : crudeLng,
      description: (lastCompleted as any).description || 'Last visited location',
      isSelected: true,
    }];
  } else if (startPoint && startPointLat && startPointLng) {
    route起点 = [{
      id: 'start-point',
      name: `Start: ${startPoint}`,
      category: 'Start',
      address: startPoint,
      lat: typeof startPointLat === 'string' ? parseFloat(startPointLat) : startPointLat,
      lng: typeof startPointLng === 'string' ? parseFloat(startPointLng) : startPointLng,
      description: 'Trip Starting Location',
      isSelected: true,
    }];
  }

  // Map remaining places to the format expected by GoogleMapComponent
  const mappedPlacesForMap = [
    ...route起点,
    ...remainingPlaces.map((p) => {
      const crudeLat = p.lat || (p as any).latitude || 0;
      const crudeLng = p.lng || (p as any).longitude || 0;
      return {
        id: p.placeId,
        name: p.name,
        category: p.category,
        address: p.district,
        lat: typeof crudeLat === 'string' ? parseFloat(crudeLat) : crudeLat,
        lng: typeof crudeLng === 'string' ? parseFloat(crudeLng) : crudeLng,
        description: (p as any).description || '',
        isSelected: true,
      };
    })
  ];

  // Fallback calculation using Haversine on actual coordinates
  const calculateFallbackStats = () => {
    const points = mappedPlacesForMap.filter(p => p.lat != null && p.lng != null);
    if (points.length < 2) {
      return { distance: '0 km', time: '0 min' };
    }

    let distance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const place1 = points[i];
      const place2 = points[i + 1];

      // Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = (place2.lat - place1.lat) * Math.PI / 180;
      const dLng = (place2.lng - place1.lng) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(place1.lat * Math.PI / 180) * Math.cos(place2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const segmentDistance = R * c;
      distance += segmentDistance;
    }

    const roundedDistance = Math.round(distance);
    const totalMinutes = Math.round((distance / 50) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return {
      distance: `${roundedDistance} km`,
      time: durationText
    };
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Historical Sites': '🏛️',
      'Religious Sites': '🛕',
      'Nature': '🌿',
      'Wildlife': '🦌',
      'Beaches': '🏖️',
      'Cultural Experiences': '🎭',
      'Scenic Views': '🌄',
      'Hill Country': '⛰️',
      'Waterfalls': '🌊',
      'Hiking': '🥾',
      'Adventure': '⚡'
    };
    return icons[category] || '📍';
  };

  const fallbackStats = calculateFallbackStats();
  const stats = {
    distance: realDistance || fallbackStats.distance,
    time: realDuration || fallbackStats.time
  };
  const completedCount = places.length - remainingPlaces.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-150 sticky top-6 overflow-hidden">
      {/* Map Header */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-blue-950">Active Route Map</h3>
            <p className="text-xs text-gray-500 font-medium truncate max-w-[200px]">{tripName}</p>
          </div>
          {completedCount > 0 && (
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
              ✔️ Hidden {completedCount} Done
            </span>
          )}
        </div>
      </div>

      {/* Real Interactive Map Container */}
      <div className={`relative ${isFullscreen ? 'h-96' : 'h-80'} bg-gray-100`}>
        <GoogleMapComponent
          places={mappedPlacesForMap}
          center={
            mappedPlacesForMap.length > 0
              ? { lat: mappedPlacesForMap[0].lat, lng: mappedPlacesForMap[0].lng }
              : { lat: 7.8731, lng: 80.7718 } // Center of Sri Lanka
          }
          startPoint={hasCompletedPlaces ? undefined : startPoint}
          startPointLat={hasCompletedPlaces ? undefined : startPointLat}
          startPointLng={hasCompletedPlaces ? undefined : startPointLng}
          onRouteCalculated={(distance, duration) => {
            setRealDistance(`${distance} km`);
            setRealDuration(duration);
          }}
        />
      </div>

      {/* Place List */}
      {remainingPlaces.length > 0 && (
        <div className="p-5 border-t border-gray-100 max-h-48 overflow-y-auto">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Remaining Route Stops</h4>
          <div className="space-y-3">
            {remainingPlaces.map((place, index) => (
              <div key={place.placeId} className="flex items-center space-x-3 text-sm animate-fadeIn">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold border border-blue-100">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-base">{getCategoryIcon(place.category)}</span>
                    <p className="font-bold text-gray-900 truncate">{place.name}</p>
                  </div>
                  <p className="text-gray-500 text-[11px] font-medium">{place.district} • {place.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trip Statistics */}
      <div className="p-5 bg-gray-50/50 rounded-b-2xl border-t border-gray-100">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Active Route Stats</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="text-lg font-black text-blue-600">{stats.distance}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Remaining Dist</div>
          </div>
          <div className="text-center bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="text-lg font-black text-emerald-600">{stats.time}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Travel Duration</div>
          </div>
        </div>

        {remainingPlaces.length > 1 && (
          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-500 font-medium">
              🗺️ Route dynamically optimized for {remainingPlaces.length} remaining stops
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPanel;
