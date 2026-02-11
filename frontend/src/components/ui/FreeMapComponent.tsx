'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Place } from '@/app/path/page';

interface FreeMapComponentProps {
  places: Place[];
  center: { lat: number; lng: number };
  onPlaceSelect?: (place: Place) => void;
}

// Fix for default marker icons in Leaflet
const createNumberedIcon = (number: number, isStart: boolean = false, isEnd: boolean = false) => {
  const color = isStart ? '#10B981' : isEnd ? '#EF4444' : '#3B82F6';
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${number}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Component to fit bounds when places change
function FitBounds({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    const validPlaces = places.filter(p => p.lat != null && p.lng != null);
    if (validPlaces.length > 0) {
      const bounds = L.latLngBounds(validPlaces.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [places, map]);

  return null;
}

// Component to draw route line
function RouteLine({ places }: { places: Place[] }) {
  const validPlaces = places.filter(p => p.lat != null && p.lng != null);
  if (validPlaces.length < 2) return null;

  const positions: [number, number][] = validPlaces.map(p => [p.lat, p.lng]);

  return (
    <Polyline
      positions={positions}
      color="#10B981"
      weight={4}
      opacity={0.8}
      dashArray="10, 10"
    />
  );
}

// Component to display route info
function RouteInfo({ places }: { places: Place[] }) {
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState('');

  useEffect(() => {
    const validPlaces = places.filter(p => p.lat != null && p.lng != null);
    if (validPlaces.length < 2) {
      setDistance(0);
      setDuration('');
      return;
    }

    // Calculate approximate distance using Haversine formula
    let totalDistance = 0;
    for (let i = 0; i < validPlaces.length - 1; i++) {
      const lat1 = validPlaces[i].lat;
      const lon1 = validPlaces[i].lng;
      const lat2 = validPlaces[i + 1].lat;
      const lon2 = validPlaces[i + 1].lng;

      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      totalDistance += d;
    }

    setDistance(Math.round(totalDistance));
    
    // Calculate estimated duration (assuming 50 km/h average)
    const hours = Math.floor(totalDistance / 50);
    const minutes = Math.round((totalDistance % 50) * 1.2);
    setDuration(`${hours}h ${minutes}m`);
  }, [places]);

  if (places.length < 2) return null;

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
      <div className="text-sm">
        <div className="font-semibold text-gray-900 mb-1">Route Summary</div>
        <div className="text-gray-600">
          Distance: <span className="font-medium">{distance} km</span>
        </div>
        <div className="text-gray-600">
          Duration: <span className="font-medium">{duration}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {places.filter(p => p.lat != null && p.lng != null).length} stops • Estimated time
        </div>
      </div>
    </div>
  );
}

export default function FreeMapComponent({ places, center, onPlaceSelect }: FreeMapComponentProps) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  const getMapCenter = () => {
    const validPlaces = places.filter(p => p.lat != null && p.lng != null);
    if (validPlaces.length > 0) {
      return [validPlaces[0].lat, validPlaces[0].lng];
    }
    return [center.lat, center.lng];
  };

  return (
    <div className="relative">
      <MapContainer
        center={getMapCenter() as [number, number]}
        zoom={places.filter(p => p.lat != null && p.lng != null).length === 0 ? 8 : 10}
        style={{ height: '500px', width: '100%', borderRadius: '0.5rem' }}
        className="z-0"
      >
        {/* OpenStreetMap tiles - 100% FREE! */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw route line between places */}
        <RouteLine places={places} />

        {/* Place markers */}
        {places.filter(p => p.lat != null && p.lng != null).map((place, index) => (
          <Marker
            key={place.id}
            position={[place.lat!, place.lng!]}
            icon={createNumberedIcon(
              index + 1,
              index === 0,
              index === places.length - 1
            )}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900 mb-1">{place.name}</h3>
                <p className="text-xs text-gray-600 mb-1">
                  <span className="inline-block bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {place.category}
                  </span>
                </p>
                <p className="text-xs text-gray-500">{place.address}</p>
                {place.description && (
                  <p className="text-xs text-gray-600 mt-2">{place.description}</p>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  Stop #{index + 1} of {places.length}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Auto-fit bounds */}
        <FitBounds places={places} />
      </MapContainer>

      {/* Route info overlay */}
      <RouteInfo places={places} />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="text-xs space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
            <span className="text-gray-700">Start Point</span>
          </div>
          {places.length > 2 && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-gray-700">Stops</span>
            </div>
          )}
          {places.length > 1 && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-gray-700">End Point</span>
            </div>
          )}
        </div>
      </div>

      {/* Free map badge */}
      <div className="absolute bottom-4 right-4 bg-emerald-600 text-white rounded-lg shadow-lg px-3 py-2 z-[1000]">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-semibold">100% FREE</span>
        </div>
      </div>

      {/* Empty state message */}
      {places.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[999] pointer-events-none">
          <div className="text-center bg-white rounded-lg p-6 shadow-lg">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-600 font-medium">Add places to see them on the map</p>
            <p className="text-xs text-gray-500 mt-1">🗺️ OpenStreetMap - Free & Open Source</p>
          </div>
        </div>
      )}
    </div>
  );
}
