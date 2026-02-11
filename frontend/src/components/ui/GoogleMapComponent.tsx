'use client';

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { Place } from '@/app/path/page';

interface GoogleMapComponentProps {
  places: Place[];
  center: { lat: number; lng: number };
  onPlaceSelect?: (place: Place) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 7.8731,
  lng: 80.7718
};

// Google Maps libraries to load
const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

export default function GoogleMapComponent({ places, center, onPlaceSelect }: GoogleMapComponentProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Map options
  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  };

  // Calculate and display route when places change
  const calculateRoute = useCallback(async () => {
    // Filter places that have valid coordinates
    const placesWithCoords = places.filter(p => p.lat != null && p.lng != null);
    if (placesWithCoords.length < 2) return;

    setIsCalculatingRoute(true);
    
    try {
      const directionsService = new google.maps.DirectionsService();
      
      // Create waypoints for places in between start and end
      const waypoints = placesWithCoords.slice(1, -1).map(place => ({
        location: { lat: place.lat!, lng: place.lng! },
        stopover: true
      }));

      const results = await directionsService.route({
        origin: { lat: placesWithCoords[0].lat!, lng: placesWithCoords[0].lng! },
        destination: { lat: placesWithCoords[placesWithCoords.length - 1].lat!, lng: placesWithCoords[placesWithCoords.length - 1].lng! },
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false // Keep user's order
      });

      setDirectionsResponse(results);
    } catch (error) {
      console.error('Error calculating route:', error);
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [places]);

  useEffect(() => {
    if (places.length >= 2 && map) {
      calculateRoute();
    } else {
      setDirectionsResponse(null);
    }
  }, [places, map, calculateRoute]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Fit bounds to show all markers
  useEffect(() => {
    if (map && places.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      const placesWithCoords = places.filter(p => p.lat != null && p.lng != null);
      placesWithCoords.forEach(place => {
        bounds.extend({ lat: place.lat!, lng: place.lng! });
      });
      if (placesWithCoords.length > 0) {
        map.fitBounds(bounds);
      }
    }
  }, [map, places]);

  // Custom marker icons based on order
  const getMarkerLabel = (index: number) => ({
    text: (index + 1).toString(),
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold'
  });

  const getMarkerIcon = (index: number) => {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: index === 0 ? '#10B981' : index === places.length - 1 ? '#EF4444' : '#3B82F6',
      fillOpacity: 1,
      strokeColor: 'white',
      strokeWeight: 2,
      scale: 12
    };
  };

  // Show loading or error state if no API key
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <div className="w-full h-[500px] bg-gradient-to-br from-blue-100 to-green-100 rounded-lg border border-gray-300 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-6 shadow-lg max-w-md">
          <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Google Maps API Key Required</h3>
          <p className="text-sm text-gray-600 mb-4">
            To see the interactive map with routes, please add your Google Maps API key to the <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file.
          </p>
          <div className="bg-gray-50 rounded p-3 text-left">
            <p className="text-xs text-gray-700 font-mono mb-2">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
            </p>
            <a 
              href="https://console.cloud.google.com/google/maps-apis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Get API Key →
            </a>
          </div>
          {places.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>{places.length}</strong> places ready to display
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={places.length > 0 ? { lat: places[0].lat, lng: places[0].lng } : center}
          zoom={places.length === 0 ? 8 : 12}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* Display route if we have directions */}
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                suppressMarkers: true, // We'll use custom markers
                polylineOptions: {
                  strokeColor: '#10B981',
                  strokeWeight: 4,
                  strokeOpacity: 0.8
                }
              }}
            />
          )}

          {/* Display markers for all places */}
          {!directionsResponse && places.filter(p => p.lat != null && p.lng != null).map((place, index) => (
            <Marker
              key={place.id}
              position={{ lat: place.lat!, lng: place.lng! }}
              label={getMarkerLabel(index)}
              icon={getMarkerIcon(index)}
              onClick={() => setSelectedPlace(place)}
              title={place.name}
            />
          ))}

          {/* Custom markers when showing route */}
          {directionsResponse && places.filter(p => p.lat != null && p.lng != null).map((place, index) => (
            <Marker
              key={place.id}
              position={{ lat: place.lat!, lng: place.lng! }}
              label={getMarkerLabel(index)}
              icon={getMarkerIcon(index)}
              onClick={() => setSelectedPlace(place)}
              title={place.name}
            />
          ))}

          {/* Info Window for selected place */}
          {selectedPlace && selectedPlace.lat != null && selectedPlace.lng != null && (
            <InfoWindow
              position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div className="p-2">
                <h3 className="font-semibold text-gray-900 mb-1">{selectedPlace.name}</h3>
                <p className="text-xs text-gray-600 mb-1">{selectedPlace.category}</p>
                <p className="text-xs text-gray-500">{selectedPlace.address}</p>
                {selectedPlace.description && (
                  <p className="text-xs text-gray-600 mt-2">{selectedPlace.description}</p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Route calculation loading indicator */}
      {isCalculatingRoute && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm text-gray-700">Calculating route...</span>
          </div>
        </div>
      )}

      {/* Route info display */}
      {directionsResponse && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <div className="text-sm">
            <div className="font-semibold text-gray-900 mb-1">Route Summary</div>
            <div className="text-gray-600">
              Distance: <span className="font-medium">{directionsResponse.routes[0].legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0) / 1000} km</span>
            </div>
            <div className="text-gray-600">
              Duration: <span className="font-medium">{Math.round(directionsResponse.routes[0].legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0) / 60)} min</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
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
    </div>
  );
}
