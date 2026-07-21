'use client';

import { useState, useEffect } from 'react';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import PlaceList from '@/components/ui/PlaceList';
import GoogleMapComponent from '@/components/ui/GoogleMapComponent';
import SearchBar from '@/components/ui/SearchBar';
import AiRecommendations from '@/components/ui/AiRecommendations';

// Type definitions
export interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  description?: string;
  isSelected: boolean;
  estimatedCost?: number;
}

// Mock suggested places based on popular Sri Lankan destinations
const mockSuggestedPlaces: Place[] = [
  {
    id: '1',
    name: 'Sigiriya Rock Fortress',
    category: 'Historical',
    address: 'Sigiriya, Matale District',
    lat: 7.9570,
    lng: 80.7603,
    description: 'Ancient rock fortress with stunning frescoes',
    isSelected: false
  },
  {
    id: '2',
    name: 'Temple of the Tooth',
    category: 'Religious',
    address: 'Kandy, Central Province',
    lat: 7.2936,
    lng: 80.6400,
    description: 'Sacred Buddhist temple housing Buddha\'s tooth relic',
    isSelected: false
  },
  {
    id: '3',
    name: 'Galle Fort',
    category: 'Historical',
    address: 'Galle, Southern Province',
    lat: 6.0329,
    lng: 80.2168,
    description: 'Dutch colonial fort overlooking the ocean',
    isSelected: false
  },
  {
    id: '4',
    name: 'Ella Rock',
    category: 'Nature',
    address: 'Ella, Badulla District',
    lat: 6.8667,
    lng: 81.0500,
    description: 'Scenic hiking spot with panoramic views',
    isSelected: false
  },
  {
    id: '5',
    name: 'Yala National Park',
    category: 'Wildlife',
    address: 'Yala, Southern Province',
    lat: 6.3725,
    lng: 81.5185,
    description: 'Premier wildlife sanctuary with leopards',
    isSelected: false
  },
  {
    id: '6',
    name: 'Nuwara Eliya',
    category: 'Hill Station',
    address: 'Nuwara Eliya, Central Province',
    lat: 6.9497,
    lng: 80.7891,
    description: 'Cool climate hill station with tea plantations',
    isSelected: false
  }
];

export default function PathCreationPage() {
  const [suggestedPlaces, setSuggestedPlaces] = useState<Place[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [activeTab, setActiveTab] = useState<'database' | 'ai'>('ai');
  const [daysCount, setDaysCount] = useState<number>(3);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<string>('');
  const [mapCenter, setMapCenter] = useState({ lat: 7.8731, lng: 80.7718 }); // Sri Lanka center
  const [tripInfo, setTripInfo] = useState<any>(null);

  // Load suggestions from database or localStorage on mount
  useEffect(() => {
    const loadFromDatabaseOrStorage = async () => {
      // Parse tripId search param safely in useEffect
      const params = new URLSearchParams(window.location.search);
      const tripIdParam = params.get('tripId');

      if (tripIdParam) {
        try {
          // 1. Fetch trip details from backend database
          const response = await fetch(`http://localhost:5000/api/trips/${tripIdParam}`);
          if (!response.ok) throw new Error('Trip not found in database');

          const tripData = await response.json();

          // Parse starting point from description if available
          let startPoint = '';
          if (tripData.description && tripData.description.includes('Starting location:')) {
            const match = tripData.description.match(/Starting location:\s*([^.]+)/);
            if (match && match[1]) {
              startPoint = match[1].trim();
            }
          }

          const info = {
            name: tripData.tripName,
            startDate: tripData.startDate.split('T')[0],
            endDate: tripData.endDate.split('T')[0],
            budget: tripData.budget || 250000,
            startPoint: tripData.startPoint || startPoint || 'Colombo',
            startPointLat: tripData.startPointLat,
            startPointLng: tripData.startPointLng,
            districts: tripData.districts || []
          };
          setTripInfo(info);

          // Center the map at the user's starting point coordinates
          if (tripData.startPointLat && tripData.startPointLng) {
            setMapCenter({ lat: tripData.startPointLat, lng: tripData.startPointLng });
          }

          // Calculate number of days
          if (tripData.startDate && tripData.endDate) {
            const start = new Date(tripData.startDate);
            const end = new Date(tripData.endDate);
            const timeDiff = end.getTime() - start.getTime();
            const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
            if (!isNaN(days) && days > 0) {
              setDaysCount(days);
            }
          }

          // 2. Fetch detailed places for this trip from backend database
          const placesResponse = await fetch(`http://localhost:5000/api/trips/${tripIdParam}/places`);
          let transformedSelected: Place[] = [];
          if (placesResponse.ok) {
            const placesData = await placesResponse.json();
            const apiPlaces = placesData.places || [];

            // Transform detailed places and filter out duplicates by name
            const uniquePlaces: any[] = [];
            const seenNames = new Set<string>();

            for (const place of apiPlaces) {
              const nameLower = place.name.toLowerCase().trim();
              if (!seenNames.has(nameLower)) {
                seenNames.add(nameLower);
                uniquePlaces.push(place);
              }
            }

            transformedSelected = uniquePlaces.map((place: any) => ({
              id: place.placeId,
              name: place.name,
              category: place.category,
              address: place.district,
              lat: place.latitude || place.lat || 0,
              lng: place.longitude || place.lng || 0,
              description: place.description || '',
              isSelected: true,
              estimatedCost: place.estimatedCost || 0
            }));
            setSelectedPlaces(transformedSelected);

            if (transformedSelected.length > 0) {
              setMapCenter({ lat: transformedSelected[0].lat, lng: transformedSelected[0].lng });
            }
          }

          // 3. Fetch attraction suggestions for the trip's districts to show in Suggested Places
          if (tripData.districts && tripData.districts.length > 0) {
            try {
              const suggestions = await fetch('http://localhost:5000/api/trips/suggest-places', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  districts: tripData.districts,
                  interests: ['Historical Sites', 'Beaches', 'Wildlife', 'Adventure Sports', 'Cultural Experiences', 'Tea Plantations', 'Religious Sites', 'Hill Country'],
                  budget: '100000-200000',
                  travelers: 1
                })
              });

              if (suggestions.ok) {
                const suggData = await suggestions.json();
                const suggPlaces = suggData.places || [];

                // De-duplicate suggested attractions by name
                const uniqueSugg: any[] = [];
                const seenSuggNames = new Set<string>();
                for (const p of suggPlaces) {
                  const nameLower = p.name.toLowerCase().trim();
                  if (!seenSuggNames.has(nameLower)) {
                    seenSuggNames.add(nameLower);
                    uniqueSugg.push(p);
                  }
                }

                const transformedSuggested: Place[] = uniqueSugg.map((place: any) => {
                  const isAlreadySelected = transformedSelected.some(
                    (sp) => sp.name.toLowerCase().trim() === place.name.toLowerCase().trim()
                  );
                  return {
                    id: place.placeId,
                    name: place.name,
                    category: place.category,
                    address: place.district,
                    lat: place.lat || place.latitude || 0,
                    lng: place.lng || place.longitude || 0,
                    description: place.description || '',
                    isSelected: isAlreadySelected,
                    estimatedCost: place.estimatedCost || 0
                  };
                });
                setSuggestedPlaces(transformedSuggested);

                if (transformedSelected.length === 0 && transformedSuggested.length > 0) {
                  setMapCenter({ lat: transformedSuggested[0].lat, lng: transformedSuggested[0].lng });
                }
              } else {
                setSuggestedPlaces(mockSuggestedPlaces);
              }
            } catch (err) {
              console.error('Error loading dynamic suggestions:', err);
              setSuggestedPlaces(mockSuggestedPlaces);
            }
          } else {
            setSuggestedPlaces(mockSuggestedPlaces);
          }

        } catch (error) {
          console.error('Error loading trip from database:', error);
          setSuggestedPlaces(mockSuggestedPlaces);
        }
      } else {
        // Normal creation flow: load from localStorage
        const storedPlaces = localStorage.getItem('suggestedPlaces');
        const storedTripData = localStorage.getItem('tripData');

        if (storedPlaces) {
          try {
            const apiPlaces = JSON.parse(storedPlaces);

            // Transform API place format to our Place interface
            const transformedPlaces: Place[] = apiPlaces.map((place: any) => ({
              id: place.placeId,
              name: place.name,
              category: place.category,
              address: place.district,
              lat: place.lat,
              lng: place.lng,
              description: place.description,
              isSelected: false,
              estimatedCost: place.estimatedCost
            }));

            setSuggestedPlaces(transformedPlaces);

            // Set map center to first place with valid coordinates
            const firstValidPlace = transformedPlaces.find(p => p.lat != null && p.lng != null);
            if (firstValidPlace) {
              setMapCenter({ lat: firstValidPlace.lat, lng: firstValidPlace.lng });
            }
          } catch (error) {
            console.error('Error loading suggestions:', error);
            setSuggestedPlaces(mockSuggestedPlaces);
          }
        } else {
          setSuggestedPlaces(mockSuggestedPlaces);
        }

        if (storedTripData) {
          try {
            const parsed = JSON.parse(storedTripData);
            setTripInfo(parsed);

            // Center the map at the user's starting point coordinates
            if (parsed.startPointLat && parsed.startPointLng) {
              setMapCenter({ lat: parsed.startPointLat, lng: parsed.startPointLng });
            }

            // Calculate number of days
            if (parsed.startDate && parsed.endDate) {
              const start = new Date(parsed.startDate);
              const end = new Date(parsed.endDate);
              const timeDiff = end.getTime() - start.getTime();
              const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
              if (!isNaN(days) && days > 0) {
                setDaysCount(days);
              }
            }
          } catch (error) {
            console.error('Error loading trip data:', error);
          }
        }
      }
    };

    loadFromDatabaseOrStorage();
  }, []);

  // Calculate route statistics when selected places change or tripInfo changes
  useEffect(() => {
    const calculateRouteStats = () => {
      // Find start point coordinates if available
      const startPointPlace = tripInfo?.startPointLat && tripInfo?.startPointLng ? {
        lat: typeof tripInfo.startPointLat === 'string' ? parseFloat(tripInfo.startPointLat) : tripInfo.startPointLat,
        lng: typeof tripInfo.startPointLng === 'string' ? parseFloat(tripInfo.startPointLng) : tripInfo.startPointLng,
      } : null;

      // Group all points including startPoint
      const points = startPointPlace
        ? [startPointPlace, ...selectedPlaces]
        : selectedPlaces;

      // If we don't have enough points for a route, reset
      if (points.length < 2) {
        setTotalDistance(0);
        setTotalDuration('');
        return;
      }

      // Proper Haversine formula for accurate distance calculation
      let distance = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const place1 = points[i];
        const place2 = points[i + 1];

        // Haversine formula for great-circle distance
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

      setTotalDistance(Math.round(distance));

      // Estimate driving time (assuming average 50km/h for Sri Lankan roads)
      const totalMinutes = Math.round((distance / 50) * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      setTotalDuration(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`);
    };

    calculateRouteStats();
  }, [selectedPlaces, tripInfo]);

  const handleAddToPath = (place: Place) => {
    // Prevent duplicate additions by name
    if (selectedPlaces.some(p => p.name.toLowerCase().trim() === place.name.toLowerCase().trim())) {
      return;
    }

    // Add to selected places
    setSelectedPlaces(prev => [...prev, { ...place, isSelected: true }]);

    // Update suggested places to mark as selected by name
    setSuggestedPlaces(prev =>
      prev.map(p => p.name.toLowerCase().trim() === place.name.toLowerCase().trim() ? { ...p, isSelected: true } : p)
    );
  };

  const handleRemoveFromPath = (placeId: string) => {
    // Find name of place being removed
    const placeToRemove = selectedPlaces.find(p => p.id === placeId);
    if (!placeToRemove) return;

    // Remove from selected places
    setSelectedPlaces(prev => prev.filter(p => p.id !== placeId));

    // Update suggested places to mark as not selected by name
    setSuggestedPlaces(prev =>
      prev.map(p => p.name.toLowerCase().trim() === placeToRemove.name.toLowerCase().trim() ? { ...p, isSelected: false } : p)
    );
  };

  const handleApplyItinerary = (itineraryPlaces: Place[]) => {
    setSelectedPlaces(itineraryPlaces.map(p => ({ ...p, isSelected: true })));

    // Also update suggestedPlaces selected state by name
    const selectedNames = new Set(itineraryPlaces.map(p => p.name.toLowerCase().trim()));
    setSuggestedPlaces(prev =>
      prev.map(p => ({ ...p, isSelected: selectedNames.has(p.name.toLowerCase().trim()) }))
    );

    alert('🎉 AI Suggested Itinerary applied successfully! You can now reorder, add, or remove places using the standard controls.');
  };

  const handleSearchResult = (newPlace: Place) => {
    // Prevent duplicate additions by name
    if (selectedPlaces.some(p => p.name.toLowerCase().trim() === newPlace.name.toLowerCase().trim())) {
      alert(`"${newPlace.name}" is already in your travel path!`);
      return;
    }

    // Add the searched place to both lists
    setSuggestedPlaces(prev => {
      if (prev.some(p => p.name.toLowerCase().trim() === newPlace.name.toLowerCase().trim())) {
        return prev.map(p => p.name.toLowerCase().trim() === newPlace.name.toLowerCase().trim() ? { ...p, isSelected: true } : p);
      }
      return [...prev, newPlace];
    });
    setSelectedPlaces(prev => [...prev, { ...newPlace, isSelected: true }]);
  };

  const handleSaveTripPlan = async () => {
    if (selectedPlaces.length === 0) {
      alert('Please select at least one place to visit');
      return;
    }

    try {
      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Please login to save your trip');
        window.location.href = '/login';
        return;
      }

      const user = JSON.parse(userStr);

      let tripId = '';
      const params = new URLSearchParams(window.location.search);
      const tripIdParam = params.get('tripId');
      const isEditing = !!tripIdParam;

      if (isEditing) {
        tripId = tripIdParam;

        // 1. Update trip details in database
        const updateResponse = await fetch(`http://localhost:5000/api/trips/${tripId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tripName: tripInfo?.name || 'My Sri Lankan Adventure',
            startDate: tripInfo?.startDate || new Date().toISOString().split('T')[0],
            endDate: tripInfo?.endDate || new Date().toISOString().split('T')[0],
            districts: Array.from(new Set(selectedPlaces.map(p => p.address))),
            budget: tripInfo?.budget ? parseInt(tripInfo.budget) : undefined,
            description: `Starting location: ${tripInfo?.startPoint || 'Not Specified'}. Trip with ${selectedPlaces.length} places, ${totalDistance} km total distance.`,
            startPoint: tripInfo?.startPoint,
            startPointLat: tripInfo?.startPointLat,
            startPointLng: tripInfo?.startPointLng,
          }),
        });

        if (!updateResponse.ok) {
          throw new Error('Failed to update trip details');
        }

        // 2. Clear old places from database using our custom endpoint
        const clearResponse = await fetch(`http://localhost:5000/api/trips/${tripId}/places`, {
          method: 'DELETE',
        });

        if (!clearResponse.ok) {
          throw new Error('Failed to clear old itinerary destinations');
        }
      } else {
        // Create trip in MongoDB (Creation Mode)
        const tripResponse = await fetch('http://localhost:5000/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.userId,
            tripName: tripInfo?.name || 'My Sri Lankan Adventure',
            startDate: tripInfo?.startDate || new Date().toISOString().split('T')[0],
            endDate: tripInfo?.endDate || new Date().toISOString().split('T')[0],
            districts: Array.from(new Set(selectedPlaces.map(p => p.address))),
            budget: tripInfo?.budget ? parseInt(tripInfo.budget) : undefined,
            description: `Starting location: ${tripInfo?.startPoint || 'Not Specified'}. Trip with ${selectedPlaces.length} places, ${totalDistance} km total distance.`,
            startPoint: tripInfo?.startPoint,
            startPointLat: tripInfo?.startPointLat,
            startPointLng: tripInfo?.startPointLng,
          }),
        });

        const tripData = await tripResponse.json();

        if (!tripData.trip) {
          throw new Error(tripData.error || 'Failed to create trip');
        }

        tripId = tripData.trip.tripId;
      }

      // 3. Add all selected places to the trip
      for (const place of selectedPlaces) {
        await fetch(`http://localhost:5000/api/trips/${tripId}/places`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: place.name,
            category: place.category,
            district: place.address,
            latitude: place.lat,
            longitude: place.lng,
            description: place.description
          }),
        });
      }

      console.log('✅ Trip details and places saved successfully!');

      // 4. Fetch AI Route Optimization for the selected places
      try {
        const optimizeResponse = await fetch('http://localhost:5000/api/ai/optimize-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            places: selectedPlaces.map(p => ({
              name: p.name,
              district: p.address,
              category: p.category,
              lat: p.lat,
              lng: p.lng,
              description: p.description,
              estimatedCost: p.estimatedCost || 0
            })),
            days: daysCount,
            budget: tripInfo?.budget || 'Medium',
            startPoint: tripInfo?.startPoint || ''
          })
        });

        if (optimizeResponse.ok) {
          const optimizeData = await optimizeResponse.json();
          localStorage.setItem(`aiItinerary_${tripId}`, JSON.stringify(optimizeData));
          console.log('✅ AI Itinerary generated & saved!', optimizeData);
        }
      } catch (optimizeError) {
        console.error('Error generating AI itinerary:', optimizeError);
      }

      // 5. Save trip plan data to localStorage
      const tripPlan = {
        tripId,
        selectedPlaces,
        totalDistance,
        totalDuration,
        districts: Array.from(new Set(selectedPlaces.map(p => p.address))),
        savedAt: new Date().toISOString()
      };

      localStorage.setItem('savedTripPlan', JSON.stringify(tripPlan));

      if (isEditing) {
        alert('🎉 Itinerary path updated and dynamically reordered!');
        window.location.href = `/trips/${tripId}`;
      } else {
        alert('🎉 Trip saved & AI Optimized successfully! Redirecting to your AI Smart Plan Itinerary.');
        window.location.href = `/trips/${tripId}/ai-itinerary`;
      }
    } catch (error: any) {
      console.error('Error saving trip plan:', error);
      alert('Failed to save trip: ' + error.message);
    }
  };

  const reorderSelectedPlaces = (fromIndex: number, toIndex: number) => {
    const updatedPlaces = [...selectedPlaces];
    const [reorderedPlace] = updatedPlaces.splice(fromIndex, 1);
    updatedPlaces.splice(toIndex, 0, reorderedPlace);
    setSelectedPlaces(updatedPlaces);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {tripInfo?.name || 'Create Your Travel Path'}
          </h1>
          <p className="text-gray-600">
            {tripInfo ? (
              <>
                {tripInfo.startDate} to {tripInfo.endDate} • {tripInfo.travelers} {tripInfo.travelers === 1 ? 'Traveler' : 'Travelers'}
                {tripInfo.districts?.length > 0 && ` • ${tripInfo.districts.join(', ')}`}
              </>
            ) : (
              'Select places to visit and plan your route through Sri Lanka'
            )}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column: Suggested Places */}
          <div className="space-y-6">
            <PlaceList
              title="Suggested Places"
              places={suggestedPlaces}
              onAddToPath={handleAddToPath}
              onRemoveFromPath={handleRemoveFromPath}
              selectedPlaces={selectedPlaces}
              onReorder={reorderSelectedPlaces}
            />
          </div>

          {/* Right Column: Map */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Map View</h3>
              <GoogleMapComponent
                places={selectedPlaces}
                center={mapCenter}
                onPlaceSelect={handleAddToPath}
                startPoint={tripInfo?.startPoint}
                startPointLat={tripInfo?.startPointLat}
                startPointLng={tripInfo?.startPointLng}
                onRouteCalculated={(distance, duration) => {
                  setTotalDistance(distance);
                  setTotalDuration(duration);
                }}
              />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onPlaceFound={handleSearchResult} />
        </div>

        {/* Trip Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Trip Summary</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{selectedPlaces.length}</div>
              <div className="text-sm text-gray-600">Places to Visit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalDistance} km</div>
              <div className="text-sm text-gray-600">Estimated Distance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalDuration || 'TBD'}</div>
              <div className="text-sm text-gray-600">Total Trip Duration</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSaveTripPlan}
              disabled={selectedPlaces.length === 0}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all duration-200"
            >
              ⚡ Create Trip with AI
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Back to Trip Form
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
