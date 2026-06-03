'use client';

import { Place } from '@/types/trip';
import { useState } from 'react';
import FreeMapComponent from './FreeMapComponent';

interface MapPanelProps {
  places: Place[];
  tripName: string;
}

const MapPanel: React.FC<MapPanelProps> = ({ places, tripName }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter out places that are already completed (visitStatus === 'DONE')
  const remainingPlaces = places.filter(p => p.visitStatus !== 'DONE');

  // Map remaining places to the format expected by FreeMapComponent
  const mappedPlacesForMap = remainingPlaces.map((p) => ({
    id: p.placeId,
    name: p.name,
    category: p.category,
    address: p.district,
    lat: p.lat || (p as any).latitude || 0,
    lng: p.lng || (p as any).longitude || 0,
    description: (p as any).description || '',
    isSelected: true,
  }));

  // Calculate mock distance and time based on remaining places
  const calculateTripStats = () => {
    if (remainingPlaces.length < 2) {
      return { distance: '0 km', time: '0 min' };
    }

    const avgDistancePerLeg = 85; // Average km between places in Sri Lanka
    const avgSpeedKmh = 45; // Average speed including stops
    
    const totalDistance = (remainingPlaces.length - 1) * avgDistancePerLeg;
    const totalTimeHours = totalDistance / avgSpeedKmh;
    const totalTimeMinutes = Math.round(totalTimeHours * 60);

    return {
      distance: `${totalDistance} km`,
      time: totalTimeMinutes > 60 
        ? `${Math.floor(totalTimeMinutes / 60)}h ${totalTimeMinutes % 60}m`
        : `${totalTimeMinutes}m`
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

  const stats = calculateTripStats();
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
        <FreeMapComponent
          places={mappedPlacesForMap}
          center={
            mappedPlacesForMap.length > 0
              ? { lat: mappedPlacesForMap[0].lat, lng: mappedPlacesForMap[0].lng }
              : { lat: 7.8731, lng: 80.7718 } // Center of Sri Lanka
          }
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
