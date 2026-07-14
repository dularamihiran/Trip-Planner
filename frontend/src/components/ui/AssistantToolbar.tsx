'use client';

import { Place } from '@/types/trip';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface AssistantToolbarProps {
  userLocation: LocationCoords | null;
  currentPlace: Place | undefined;
  isOnline: boolean;
  isDemoMode: boolean;
  locationError: string | null;
}

export default function AssistantToolbar({
  userLocation,
  currentPlace,
  isOnline,
  isDemoMode,
  locationError
}: AssistantToolbarProps) {
  // Calculate mock ETA and distance (in demo mode)
  const getMockETA = () => {
    if (!userLocation || !currentPlace) return null;

    // Mock calculation based on coordinates
    const latDiff = Math.abs((currentPlace.lat || 0) - userLocation.latitude);
    const lngDiff = Math.abs((currentPlace.lng || 0) - userLocation.longitude);
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

    // Convert to approximate km and time
    const estimatedKm = Math.round(distance * 111); // Rough conversion to km
    const estimatedMinutes = Math.round(estimatedKm * 1.5); // ~1.5 min per km

    return {
      distance: estimatedKm,
      eta: estimatedMinutes
    };
  };

  const formatETA = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const mockData = getMockETA();

  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between text-sm">
          {/* Left Section - Navigation Info */}
          <div className="flex items-center space-x-6">
            {currentPlace && userLocation && mockData ? (
              <>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-300">ETA:</span>
                  <span className="text-white font-medium">
                    {isDemoMode ? `${formatETA(mockData.eta)} (estimated)` : 'Calculating...'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-300">Distance:</span>
                  <span className="text-white font-medium">
                    {isDemoMode ? `~${mockData.distance} km` : 'Calculating...'}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {!userLocation && !locationError
                    ? 'Getting location...'
                    : !currentPlace
                      ? 'No active destination'
                      : 'Calculating route...'}
                </span>
              </div>
            )}
          </div>

          {/* Center Section - Current Location */}
          <div className="hidden md:flex items-center space-x-2">
            {userLocation ? (
              <div className="flex items-center space-x-2 text-gray-300">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                <span className="text-xs">
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </span>
              </div>
            ) : locationError ? (
              <div className="flex items-center space-x-2 text-red-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-xs">Location unavailable</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                <span className="text-xs">Locating...</span>
              </div>
            )}
          </div>

          {/* Right Section - Status */}
          <div className="flex items-center space-x-4">
            {/* Demo Mode Indicator */}
            {isDemoMode && (
              <div className="flex items-center space-x-2 bg-yellow-600/20 px-2 py-1 rounded">
                <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-yellow-400 font-medium">Demo</span>
              </div>
            )}

            {/* Network Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={`text-xs font-medium ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Navigation Mode */}
            <div className="flex items-center space-x-1">
              {currentPlace ? (
                <div className="flex items-center space-x-1 text-emerald-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-xs font-medium">Navigating</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  <span className="text-xs">Standby</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Additional Info */}
        <div className="md:hidden mt-2 pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            {userLocation ? (
              <span className="text-gray-400">
                Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </span>
            ) : (
              <span className="text-gray-400">Location: Unavailable</span>
            )}

            {currentPlace && (
              <span className="text-emerald-400 font-medium">
                → {currentPlace.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
