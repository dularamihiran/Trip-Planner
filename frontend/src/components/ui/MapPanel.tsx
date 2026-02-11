'use client';

import { Place } from '@/types/trip';
import { useState } from 'react';

interface MapPanelProps {
  places: Place[];
  tripName: string;
}

const MapPanel: React.FC<MapPanelProps> = ({ places, tripName }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mock Google Maps integration (replace with real Google Maps API)
  const generateMapImageUrl = () => {
    if (places.length === 0) return null;
    
    // For demo purposes, create a placeholder map URL
    // In real implementation, use Google Maps Static API or embed
    const firstPlaceWithCoords = places.find(p => p.lat != null && p.lng != null);
    const center = firstPlaceWithCoords
      ? `${firstPlaceWithCoords.lat},${firstPlaceWithCoords.lng}`
      : '7.8731,80.7718'; // Center of Sri Lanka
    
    return `https://via.placeholder.com/600x400/e5e7eb/6b7280?text=Google+Maps+View+%5B${places.length}+places%5D`;
  };

  // Calculate mock distance and time
  const calculateTripStats = () => {
    if (places.length < 2) {
      return { distance: '0 km', time: '0 min' };
    }

    // Mock calculation based on number of places and rough distances
    const avgDistancePerLeg = 85; // Average km between places in Sri Lanka
    const avgSpeedKmh = 45; // Average speed including stops
    
    const totalDistance = (places.length - 1) * avgDistancePerLeg;
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
      'Historical': '🏛️',
      'Religious': '🛕',
      'Nature': '🌿',
      'Wildlife': '🦌',
      'Beach': '🏖️',
      'Cultural': '🎭',
      'Scenic': '🌄',
      'Hill Station': '⛰️'
    };
    return icons[category] || '📍';
  };

  const stats = calculateTripStats();
  const mapImageUrl = generateMapImageUrl();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
      {/* Map Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Route Map</h3>
            <p className="text-sm text-gray-600">{tripName}</p>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Toggle fullscreen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className={`relative ${isFullscreen ? 'h-96' : 'h-64'} bg-gray-100`}>
        {mapImageUrl ? (
          <div className="w-full h-full relative">
            {/* Mock Map Image */}
            <div 
              className="w-full h-full bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center rounded-b-lg relative"
            >
              <div className="text-center text-gray-600">
                <svg className="w-12 h-12 mx-auto mb-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-sm font-medium">Interactive Map</p>
                <p className="text-xs text-gray-500">
                  {places.length} {places.length === 1 ? 'location' : 'locations'} plotted
                </p>
              </div>
            </div>

            {/* Map Markers Overlay */}
            {places.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {places.slice(0, 5).map((place, index) => (
                  <div
                    key={place.placeId}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto ${
                      index === 0 ? 'left-[20%] top-[30%]' :
                      index === 1 ? 'left-[35%] top-[50%]' :
                      index === 2 ? 'left-[50%] top-[30%]' :
                      index === 3 ? 'left-[65%] top-[50%]' :
                      'left-[80%] top-[30%]'
                    }`}
                  >
                    <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
                      {index + 1}
                    </div>
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap max-w-32 truncate">
                      {place.name}
                    </div>
                  </div>
                ))}
                
                {/* Route Line */}
                {places.length > 1 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <polyline
                      points="20% 30%, 35% 50%, 50% 30%, 65% 50%, 80% 30%"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  </svg>
                )}
              </div>
            )}

            {/* Google Maps Integration Note */}
            <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600">
              🗺️ Mock Map View
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-lg font-medium">No places to map</p>
              <p className="text-sm">Add places to your itinerary to see the route</p>
            </div>
          </div>
        )}
      </div>

      {/* Place List */}
      {places.length > 0 && (
        <div className="p-4 border-t border-gray-200 max-h-48 overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Places on Route</h4>
          <div className="space-y-2">
            {places.map((place, index) => (
              <div key={place.placeId} className="flex items-center space-x-3 text-sm">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(place.category)}</span>
                    <p className="font-medium text-gray-900 truncate">{place.name}</p>
                  </div>
                  <p className="text-gray-500 text-xs">{place.district} • {place.category}</p>
                </div>
              </div>
            ))}
            
            {places.length > 5 && (
              <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                +{places.length - 5} more places
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trip Statistics */}
      <div className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Trip Statistics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{stats.distance}</div>
            <div className="text-xs text-gray-600">Total Distance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">{stats.time}</div>
            <div className="text-xs text-gray-600">Travel Time</div>
          </div>
        </div>
        
        {places.length > 1 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              📍 Route optimized for {places.length} stops
            </p>
          </div>
        )}

        {/* Google Maps Integration Note */}
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <p className="font-medium mb-1">🚀 Coming Soon: Real Google Maps</p>
          <p>Interactive maps with live directions, traffic updates, and Street View integration.</p>
        </div>
      </div>
    </div>
  );
};

export default MapPanel;
