'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Place } from '@/types/trip';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface AssistantMapProps {
  userLocation: LocationCoords | null;
  currentPlace: Place | undefined;
  allPlaces: Place[];
  completedPlaces: string[];
  isDemoMode: boolean;
  locationError: string | null;
  onLocationRequest: () => void;
}

export default function AssistantMap({
  userLocation,
  currentPlace,
  allPlaces,
  completedPlaces,
  isDemoMode,
  locationError,
  onLocationRequest
}: AssistantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // Demo map initialization
  const initializeDemoMap = useCallback(() => {
    if (!mapRef.current) return;

    // Clear existing content
    mapRef.current.innerHTML = '';

    // Create demo map container
    const demoMap = document.createElement('div');
    demoMap.className = 'w-full h-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 relative overflow-hidden';
    
    // Add demo map content
    demoMap.innerHTML = `
      <div class="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>
      
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center text-white">
          <div class="mb-4">
            <svg class="w-16 h-16 mx-auto mb-2 opacity-60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <h3 class="text-lg font-semibold">Demo Navigation Mode</h3>
            <p class="text-sm opacity-80">Mock map showing your journey through Sri Lanka</p>
          </div>
          ${userLocation ? `
            <div class="bg-black/20 rounded-lg p-3 mb-3">
              <p class="text-xs">Your Location</p>
              <p class="font-mono text-sm">${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}</p>
            </div>
          ` : ''}
          ${currentPlace ? `
            <div class="bg-emerald-600/40 rounded-lg p-3">
              <p class="text-xs">Next Destination</p>
              <p class="font-semibold">${currentPlace.name}</p>
              <p class="text-xs opacity-80">${currentPlace.district}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Add route visualization if we have user location and current place
    if (userLocation && currentPlace) {
      const routeLine = document.createElement('div');
      routeLine.className = 'absolute top-1/2 left-1/4 right-1/4 h-1 bg-yellow-400 rounded-full shadow-lg';
      routeLine.style.transform = 'translateY(-50%) rotate(15deg)';
      demoMap.appendChild(routeLine);

      // Add pulsing dots for start and end
      const startDot = document.createElement('div');
      startDot.className = 'absolute w-4 h-4 bg-blue-400 rounded-full shadow-lg animate-pulse';
      startDot.style.left = '20%';
      startDot.style.top = '45%';
      demoMap.appendChild(startDot);

      const endDot = document.createElement('div');
      endDot.className = 'absolute w-4 h-4 bg-red-400 rounded-full shadow-lg animate-bounce';
      endDot.style.right = '20%';
      endDot.style.top = '55%';
      demoMap.appendChild(endDot);
    }

    mapRef.current.appendChild(demoMap);
  }, [userLocation, currentPlace]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    initializeDemoMap();
  }, [initializeDemoMap]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Location Error Overlay */}
      {locationError && (
        <div className="absolute inset-x-4 top-4 bg-red-600/90 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-medium">Location Access Required</h4>
              <p className="text-sm text-red-100 mt-1">{locationError}</p>
              <button
                onClick={onLocationRequest}
                className="mt-2 bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Enable Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading User Location */}
      {!userLocation && !locationError && (
        <div className="absolute inset-x-4 top-4 bg-blue-600/90 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">Getting your location...</span>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button
          onClick={onLocationRequest}
          className="bg-white hover:bg-gray-100 p-3 rounded-lg shadow-lg transition-colors"
          title="Recenter map"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Current Destination Info */}
      {currentPlace && userLocation && (
        <div className="absolute inset-x-4 bottom-4 bg-gray-800/90 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{currentPlace.name}</h4>
              <p className="text-sm text-gray-300">{currentPlace.district} • {currentPlace.category}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-gray-300">
                {isDemoMode ? 'Demo Mode' : 'Turn-by-turn navigation'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
