'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { Place } from '@/app/path/page';

interface GoogleMapComponentProps {
  places: Place[];
  center: { lat: number; lng: number };
  onPlaceSelect?: (place: Place) => void;
  startPoint?: string;
  startPointLat?: number;
  startPointLng?: number;
  onRouteCalculated?: (distanceKm: number, durationText: string) => void;
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

export default function GoogleMapComponent({
  places,
  center,
  onPlaceSelect,
  startPoint,
  startPointLat,
  startPointLng,
  onRouteCalculated
}: GoogleMapComponentProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [resolvedStartPoint, setResolvedStartPoint] = useState<Place | null>(null);

  const onRouteCalculatedRef = useRef(onRouteCalculated);
  useEffect(() => {
    onRouteCalculatedRef.current = onRouteCalculated;
  }, [onRouteCalculated]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: libraries
  });

  // Resolve startPoint coords or dynamically geocode
  useEffect(() => {
    if (!isLoaded || !startPoint) {
      setResolvedStartPoint(null);
      return;
    }

    if (startPointLat && startPointLng) {
      setResolvedStartPoint({
        id: 'start-point',
        name: `Start: ${startPoint}`,
        category: 'Start',
        address: startPoint,
        lat: typeof startPointLat === 'string' ? parseFloat(startPointLat) : startPointLat,
        lng: typeof startPointLng === 'string' ? parseFloat(startPointLng) : startPointLng,
        isSelected: true,
        description: 'Trip Starting Location'
      });
      return;
    }

    // Dynamic geocoding fallback for string-only start points
    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: `${startPoint}, Sri Lanka` }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          setResolvedStartPoint({
            id: 'start-point',
            name: `Start: ${startPoint}`,
            category: 'Start',
            address: startPoint,
            lat: loc.lat(),
            lng: loc.lng(),
            isSelected: true,
            description: 'Geocoded Trip Starting Location'
          });
        } else {
          console.warn('Failed to geocode starting point:', startPoint, status);
        }
      });
    } catch (err) {
      console.error('Error initializing geocoder:', err);
    }
  }, [isLoaded, startPoint, startPointLat, startPointLng]);

  // Combine resolved start point with other places, filtering out duplicate start points
  const allPlacesForRoute = resolvedStartPoint && !places.some(p => p.id === 'start-point' || p.category === 'Start')
    ? [resolvedStartPoint, ...places]
    : places;

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

  const routeSignature = allPlacesForRoute.map(p => `${p.id}-${p.lat || 0}-${p.lng || 0}`).join('|');

  // Calculate and display route when allPlacesForRoute changes
  const calculateRoute = useCallback(async () => {
    // Filter places that have valid coordinates
    const placesWithCoords = allPlacesForRoute.filter(p => p.lat != null && p.lng != null);
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

      // Invoke callback with actual total distance & duration if defined
      if (onRouteCalculatedRef.current) {
        const totalDistanceMeters = results.routes[0].legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0);
        const totalDurationSeconds = results.routes[0].legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0);

        const distanceKm = Math.round(totalDistanceMeters / 1000);
        const totalTimeMinutes = Math.round(totalDurationSeconds / 60);
        const hours = Math.floor(totalTimeMinutes / 60);
        const mins = totalTimeMinutes % 60;
        const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        onRouteCalculatedRef.current(distanceKm, durationText);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [routeSignature]);

  useEffect(() => {
    if (allPlacesForRoute.length >= 2 && map) {
      calculateRoute();
    } else {
      setDirectionsResponse(null);
    }
  }, [routeSignature, map, calculateRoute]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Fit bounds to show all markers
  useEffect(() => {
    if (map && allPlacesForRoute.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      const placesWithCoords = allPlacesForRoute.filter(p => p.lat != null && p.lng != null);
      placesWithCoords.forEach(place => {
        bounds.extend({ lat: place.lat!, lng: place.lng! });
      });
      if (placesWithCoords.length > 0) {
        map.fitBounds(bounds);
      }
    }
  }, [map, allPlacesForRoute]);

  // Custom marker icons based on order
  const getMarkerLabel = (index: number) => {
    let labelText = (index + 1).toString();
    if (index === 0 && (allPlacesForRoute[0]?.category === 'Start' || allPlacesForRoute[0]?.id === 'start-point')) {
      labelText = 'S';
    } else if (index === allPlacesForRoute.length - 1 && allPlacesForRoute.length > 2) {
      labelText = 'E';
    }
    return {
      text: labelText,
      color: 'white',
      fontSize: '14px',
      fontWeight: 'bold'
    };
  };

  const getMarkerIcon = (index: number) => {
    if (
      typeof window === 'undefined' ||
      !(window as any).google ||
      !(window as any).google.maps ||
      !(window as any).google.maps.SymbolPath
    ) {
      return undefined;
    }
    return {
      path: (window as any).google.maps.SymbolPath.CIRCLE,
      fillColor: index === 0 ? '#10B981' : index === allPlacesForRoute.length - 1 ? '#EF4444' : '#3B82F6',
      fillOpacity: 1,
      strokeColor: 'white',
      strokeWeight: 2,
      scale: 12
    };
  };

  // Show loading or error state if loadError or not loaded
  if (loadError) {
    return (
      <div className="w-full h-full min-h-[300px] bg-red-50 text-red-800 p-6 rounded-lg text-center flex items-center justify-center border border-red-300">
        <div>Error loading maps. Check your console for details.</div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gray-100 animate-pulse text-gray-500 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
          <p className="text-sm font-semibold">Initializing interactive map...</p>
        </div>
      </div>
    );
  }

  // Show loading or error state if no API key
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <div className="w-full h-[500px] bg-gradient-to-br from-blue-105 to-green-105 rounded-lg border border-gray-308 flex items-center justify-center">
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
          {allPlacesForRoute.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>{allPlacesForRoute.length}</strong> places ready to display
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={allPlacesForRoute.length > 0 ? { lat: allPlacesForRoute[0].lat, lng: allPlacesForRoute[0].lng } : center}
        zoom={allPlacesForRoute.length === 0 ? 8 : 12}
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
        {!directionsResponse && allPlacesForRoute.filter(p => p.lat != null && p.lng != null).map((place, index) => (
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
        {directionsResponse && allPlacesForRoute.filter(p => p.lat != null && p.lng != null).map((place, index) => (
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
              <p className="text-xs text-gray-655 mb-1">{selectedPlace.category}</p>
              <p className="text-xs text-gray-500">{selectedPlace.address}</p>
              {selectedPlace.description && (
                <p className="text-xs text-gray-600 mt-2">{selectedPlace.description}</p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

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
          {allPlacesForRoute.length > 2 && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-gray-700">Stops</span>
            </div>
          )}
          {allPlacesForRoute.length > 1 && (
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
