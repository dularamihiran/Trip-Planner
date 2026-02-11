'use client';

import { useState, useEffect } from 'react';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import PlaceList from '@/components/ui/PlaceList';
import FreeMapComponent from '@/components/ui/FreeMapComponent';
import SearchBar from '@/components/ui/SearchBar';

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
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<string>('');
  const [mapCenter, setMapCenter] = useState({ lat: 7.8731, lng: 80.7718 }); // Sri Lanka center
  const [tripInfo, setTripInfo] = useState<any>(null);

  // Load suggestions from localStorage on mount
  useEffect(() => {
    const storedPlaces = localStorage.getItem('suggestedPlaces');
    const storedTripData = localStorage.getItem('tripData');
    const storedSummary = localStorage.getItem('suggestionsSummary');

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
          isSelected: false
        }));
        
        setSuggestedPlaces(transformedPlaces);
        
        // Set map center to first place
        if (transformedPlaces.length > 0) {
          setMapCenter({ lat: transformedPlaces[0].lat, lng: transformedPlaces[0].lng });
        }
      } catch (error) {
        console.error('Error loading suggestions:', error);
        // Fallback to mock data
        setSuggestedPlaces(mockSuggestedPlaces);
      }
    } else {
      // No suggestions in storage, use mock data
      setSuggestedPlaces(mockSuggestedPlaces);
    }

    if (storedTripData) {
      try {
        setTripInfo(JSON.parse(storedTripData));
      } catch (error) {
        console.error('Error loading trip data:', error);
      }
    }
  }, []);

  // Calculate route statistics when selected places change
  useEffect(() => {
    const calculateRouteStats = () => {
      // Proper Haversine formula for accurate distance calculation
      let distance = 0;
      for (let i = 0; i < selectedPlaces.length - 1; i++) {
        const place1 = selectedPlaces[i];
        const place2 = selectedPlaces[i + 1];
        
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
      
      // Estimate driving time (assuming average 40km/h for Sri Lankan roads)
      const hours = Math.floor(distance / 40);
      const minutes = Math.round((distance % 40) * 1.5);
      setTotalDuration(`${hours}h ${minutes}m`);
    };

    if (selectedPlaces.length > 1) {
      calculateRouteStats();
    } else {
      setTotalDistance(0);
      setTotalDuration('');
    }
  }, [selectedPlaces]);

  const handleAddToPath = (place: Place) => {
    // Add to selected places
    setSelectedPlaces(prev => [...prev, { ...place, isSelected: true }]);
    
    // Update suggested places to mark as selected
    setSuggestedPlaces(prev =>
      prev.map(p => p.id === place.id ? { ...p, isSelected: true } : p)
    );
  };

  const handleRemoveFromPath = (placeId: string) => {
    // Remove from selected places
    setSelectedPlaces(prev => prev.filter(p => p.id !== placeId));
    
    // Update suggested places to mark as not selected
    setSuggestedPlaces(prev =>
      prev.map(p => p.id === placeId ? { ...p, isSelected: false } : p)
    );
  };

  const handleSearchResult = (newPlace: Place) => {
    // Add the searched place to both lists
    setSuggestedPlaces(prev => [...prev, newPlace]);
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
      
      // Create trip in MongoDB
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
          description: `Trip with ${selectedPlaces.length} places, ${totalDistance} km total distance`
        }),
      });

      const tripData = await tripResponse.json();
      
      if (!tripData.trip) {
        throw new Error(tripData.error || 'Failed to create trip');
      }

      const tripId = tripData.trip.tripId;
      
      // Add all selected places to the trip
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

      console.log('✅ Trip saved successfully!', tripData);
      
      // Save trip plan data to localStorage for hotel suggestions
      const tripPlan = {
        tripId,
        selectedPlaces,
        totalDistance,
        totalDuration,
        districts: Array.from(new Set(selectedPlaces.map(p => p.address))),
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('savedTripPlan', JSON.stringify(tripPlan));
      
      alert('🎉 Trip saved successfully! Now let\'s find some hotels.');
      
      // Navigate to hotels page to see hotel suggestions
      window.location.href = '/hotels';
    } catch (error: any) {
      console.error('Error saving trip:', error);
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
              <FreeMapComponent
                places={selectedPlaces}
                center={mapCenter}
                onPlaceSelect={handleAddToPath}
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
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Save Trip Plan
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
