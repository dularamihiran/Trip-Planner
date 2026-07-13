'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  // Demo map initialization
  const initializeDemoMap = () => {
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
  };

  // Google Maps initialization (when API key is available)
  const initializeGoogleMap = () => {
    // Check if Google Maps is loaded
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      const defaultCenter = userLocation
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : { lat: 7.8731, lng: 80.7718 }; // Center of Sri Lanka

      const map = new (window as any).google.maps.Map(mapRef.current, {
        zoom: userLocation ? 15 : 8,
        center: defaultCenter,
        mapTypeId: (window as any).google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMapInstance(map);

      // Add user location marker
      if (userLocation) {
        new (window as any).google.maps.Marker({
          position: { lat: userLocation.latitude, lng: userLocation.longitude },
          map: map,
          title: 'Your Location',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
              </svg>
            `),
            scaledSize: new (window as any).google.maps.Size(24, 24)
          }
        });
      }

      // Add place markers
      addPlaceMarkers(map);

      // Add route if current place exists
      if (userLocation && currentPlace) {
        showDirections(map, userLocation, currentPlace);
      }
    } else {
      // Google Maps not loaded, fall back to demo mode
      initializeDemoMap();
    }
  };

  const addPlaceMarkers = (map: any) => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: any[] = [];

    allPlaces.forEach((place, index) => {
      const isCompleted = completedPlaces.includes(place.placeId);
      const isCurrent = currentPlace?.placeId === place.placeId;

      let markerColor = '#6B7280'; // Gray for upcoming
      if (isCompleted) markerColor = '#10B981'; // Green for completed
      if (isCurrent) markerColor = '#F59E0B'; // Yellow for current

      const marker = new (window as any).google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: map,
        title: place.name,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold'
        },
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="${markerColor}" stroke="white" stroke-width="2"/>
              <text x="16" y="20" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle">${index + 1}</text>
            </svg>
          `)}`,
          scaledSize: new (window as any).google.maps.Size(32, 32)
        }
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  };

  const showDirections = (map: any, userLoc: LocationCoords, destination: Place) => {
    const directionsService = new (window as any).google.maps.DirectionsService();
    const directionsDisplay = new (window as any).google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#F59E0B',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });

    directionsDisplay.setMap(map);
    setDirectionsRenderer(directionsDisplay);

    directionsService.route({
      origin: { lat: userLoc.latitude, lng: userLoc.longitude },
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: (window as any).google.maps.TravelMode.DRIVING
    }, (result: any, status: any) => {
      if (status === 'OK') {
        directionsDisplay.setDirections(result);
      } else {
        console.error('Directions request failed:', status);
      }
    });
  };

  // Initialize Google Maps or demo map
  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = () => {
      if (isDemoMode) {
        initializeDemoMap();
        return;
      }

      // If not demo mode, load script if not loaded
      if (typeof window !== 'undefined' && !(window as any).google) {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
          initializeDemoMap();
          return;
        }

        // Check if script is already added to head
        const existingScript = document.getElementById('google-maps-script');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'google-maps-script';
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = () => {
            initializeGoogleMap();
          };
          script.onerror = () => {
            console.warn('Google Maps failed to load. Using mock map.');
            initializeDemoMap();
          };
          document.head.appendChild(script);
        }
      } else {
        initializeGoogleMap();
      }
    };

    initializeMap();
  }, [isDemoMode, userLocation, currentPlace]);

  // Update map when user location or current place changes
  useEffect(() => {
    if (mapInstance && !isDemoMode) {
      if (userLocation && currentPlace) {
        showDirections(mapInstance, userLocation, currentPlace);
      }
      addPlaceMarkers(mapInstance);
    }
  }, [userLocation, currentPlace, completedPlaces, mapInstance, isDemoMode]);

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
