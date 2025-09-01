'use client';

import { useEffect, useRef, useState } from 'react';
import { Place } from '@/app/path/page';

interface MapComponentProps {
  places: Place[];
  center: { lat: number; lng: number };
  onPlaceSelect?: (place: Place) => void;
}

// Declare global google maps types
declare global {
  interface Window {
    google: any;
  }
}

export default function MapComponent({ places, center, onPlaceSelect }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);

  // For demo purposes, we'll create a mock map component
  // In production, replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual API key
  const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

  // Load Google Maps Script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof window !== 'undefined' && !window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setIsGoogleMapsLoaded(true);
        script.onerror = () => {
          console.warn('Google Maps failed to load. Using mock map.');
          setIsGoogleMapsLoaded(false);
        };
        document.head.appendChild(script);
      } else if (window.google) {
        setIsGoogleMapsLoaded(true);
      }
    };

    // For demo, we'll skip loading Google Maps and show a mock
    // Remove this setTimeout and uncomment loadGoogleMaps() for production
    setTimeout(() => setIsGoogleMapsLoaded(false), 1000);
    // loadGoogleMaps();
  }, []);

  // Mock Map Visualization
  const renderMockMap = () => {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg border border-gray-300 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10B981" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Title */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="text-sm text-gray-700">
            <div className="font-semibold">Sri Lanka Route Map</div>
            <div>{places.length} {places.length === 1 ? 'stop' : 'stops'}</div>
            {places.length > 1 && (
              <div className="text-emerald-600">Route planned ✓</div>
            )}
          </div>
        </div>

        {/* Mock markers for places */}
        {places.map((place, index) => {
          // Calculate position based on lat/lng (simplified)
          const x = ((place.lng - 79.8) * 300) + 200; // Rough Sri Lanka longitude range
          const y = ((8.2 - place.lat) * 250) + 100;  // Rough Sri Lanka latitude range
          
          return (
            <div
              key={place.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ 
                left: `${Math.max(50, Math.min(x, 550))}px`, 
                top: `${Math.max(50, Math.min(y, 350))}px` 
              }}
            >
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
                {index + 1}
              </div>
              <div className="bg-white rounded-lg shadow-lg p-2 mt-2 text-xs whitespace-nowrap max-w-32">
                <div className="font-semibold text-gray-900 truncate">{place.name}</div>
                <div className="text-gray-600">{place.category}</div>
              </div>
            </div>
          );
        })}

        {/* Mock route line */}
        {places.length > 1 && (
          <svg className="absolute inset-0 w-full h-full z-10" xmlns="http://www.w3.org/2000/svg">
            <path
              d={`M ${places.map((place, index) => {
                const x = ((place.lng - 79.8) * 300) + 200;
                const y = ((8.2 - place.lat) * 250) + 100;
                return `${Math.max(50, Math.min(x, 550))},${Math.max(50, Math.min(y, 350))}`;
              }).join(' L ')}`}
              stroke="#10B981"
              strokeWidth="3"
              fill="none"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Center message when no places */}
        {places.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white rounded-lg p-6 shadow-lg">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-600">Add places to see them on the map</p>
              <p className="text-xs text-gray-500 mt-1">🗺️ Interactive map preview</p>
            </div>
          </div>
        )}

        {/* Map controls */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2">
          <div className="flex flex-col space-y-2">
            <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm font-bold">+</button>
            <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm font-bold">−</button>
          </div>
        </div>

        {/* Google Maps integration note */}
        <div className="absolute bottom-4 left-4 bg-yellow-100 border border-yellow-300 rounded-lg p-2">
          <p className="text-xs text-yellow-800">
            📍 Demo Mode: Add Google Maps API key for full functionality
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Render mock map or loading state */}
      {!isGoogleMapsLoaded ? (
        renderMockMap()
      ) : (
        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg border border-gray-300"
          style={{ minHeight: '400px' }}
        />
      )}
    </div>
  );
}
