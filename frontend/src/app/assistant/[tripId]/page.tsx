'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AssistantMap from '@/components/ui/AssistantMap';
import ProgressPanel from '@/components/ui/ProgressPanel';
import AssistantToolbar from '@/components/ui/AssistantToolbar';
import { Trip, Place } from '@/types/trip';
import { mockTrips } from '@/utils/tripHelpers';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface TripProgress {
  currentIndex: number;
  completedPlaces: string[];
}

export default function TripAssistantPage() {
  const params = useParams();
  const tripId = params.tripId as string;

  // Core state
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Location and progress state
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [completedPlaces, setCompletedPlaces] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Assistant state
  const [isDemoMode, setIsDemoMode] = useState(true); // Assume demo mode unless Google API key is detected
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);

  // Check if Google Maps API key is available
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
      setIsDemoMode(false);
    }
  }, []);

  // Fetch trip details
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with actual API call
        // const response = await fetch(`/api/trips/${tripId}`, {
        //   headers: {
        //     'Authorization': `Bearer ${getAuthToken()}`,
        //   },
        // });
        // 
        // if (!response.ok) {
        //   throw new Error('Failed to fetch trip details');
        // }
        // 
        // const tripData = await response.json();

        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        const foundTrip = mockTrips.find(t => t.tripId === tripId);

        if (!foundTrip) {
          throw new Error('Trip not found');
        }

        setTrip(foundTrip);

        // Initialize progress from trip data or fetch from API
        // TODO: Fetch actual progress from API
        // const progressResponse = await fetch(`/api/trips/${tripId}/progress`);
        // const progressData = await progressResponse.json();

        // For now, start at beginning
        setCurrentStopIndex(0);
        setCompletedPlaces([]);

      } catch (err) {
        console.error('Error fetching trip details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]);

  // Get user location and set up watching
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    };

    const onSuccess = (position: GeolocationPosition) => {
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      setLocationError(null);
    };

    const onError = (error: GeolocationPositionError) => {
      let errorMessage = 'Unable to get your location';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location services.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
      }
      setLocationError(errorMessage);
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    // Watch position changes every 15 seconds
    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      ...options,
      timeout: 15000
    });

    setLocationWatchId(watchId);
  }, []);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (locationWatchId !== null) {
      navigator.geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
    }
  }, [locationWatchId]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Start location tracking on mount, stop on unmount
  useEffect(() => {
    startLocationTracking();
    return () => {
      stopLocationTracking();
    };
  }, [startLocationTracking, stopLocationTracking]);

  // Handle marking current stop as done
  const handleMarkStopDone = async () => {
    if (!trip || !trip.places || currentStopIndex >= trip.places.length) return;

    const currentPlace = trip.places[currentStopIndex];
    const newCompletedPlaces = [...completedPlaces, currentPlace.placeId];
    const newCurrentIndex = Math.min(currentStopIndex + 1, trip.places.length);

    try {
      // Optimistic update
      setCompletedPlaces(newCompletedPlaces);
      setCurrentStopIndex(newCurrentIndex);

      // TODO: Make actual API call
      // await fetch(`/api/trips/${tripId}/progress`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${getAuthToken()}`,
      //   },
      //   body: JSON.stringify({
      //     currentIndex: newCurrentIndex,
      //     completedPlaces: newCompletedPlaces
      //   }),
      // });

      console.log(`Marked ${currentPlace.name} as done. Progress: ${newCurrentIndex}/${trip.places.length}`);
    } catch (error) {
      console.error('Error updating progress:', error);
      // Revert optimistic update
      setCompletedPlaces(completedPlaces);
      setCurrentStopIndex(currentStopIndex);
    }
  };

  // Handle skipping current stop
  const handleSkipStop = () => {
    if (!trip || !trip.places || currentStopIndex >= trip.places.length) return;

    const newCurrentIndex = Math.min(currentStopIndex + 1, trip.places.length);
    setCurrentStopIndex(newCurrentIndex);

    console.log(`Skipped stop. New index: ${newCurrentIndex}/${trip.places.length}`);
  };

  // Handle recenter map
  const handleRecenterMap = () => {
    if (userLocation) {
      // This will be handled by the AssistantMap component
      console.log('Recentering map to user location');
    } else {
      startLocationTracking();
    }
  };

  // Generate Google Maps link
  const getGoogleMapsLink = () => {
    if (!userLocation || !trip || !trip.places || currentStopIndex >= trip.places.length) return '#';

    const currentPlace = trip.places[currentStopIndex];
    const origin = `${userLocation.latitude},${userLocation.longitude}`;
    const destination = `${currentPlace.lat},${currentPlace.lng}`;

    return `https://www.google.com/maps/dir/${origin}/${destination}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-white mb-2">Loading Trip Assistant</h3>
          <p className="text-gray-400">Preparing your navigation experience...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {error || 'Trip Not Found'}
          </h3>
          <p className="text-gray-400 mb-6">
            Unable to load the trip assistant. Please check your connection and try again.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentPlace = trip.places?.[currentStopIndex];
  const isTripdCompleted = currentStopIndex >= (trip.places?.length || 0);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-yellow-600 text-yellow-100 px-4 py-2 text-center text-sm">
          <span className="font-medium">Demo Mode:</span> Google Maps integration requires API key.
          Using mock navigation for demonstration.
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link
              href={`/trips/${tripId}`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white">{trip.tripName}</h1>
              <div className="flex items-center space-x-2 text-sm">
                {isTripdCompleted ? (
                  <span className="bg-green-600 text-green-100 px-2 py-1 rounded text-xs font-medium">
                    Trip Completed! 🎉
                  </span>
                ) : currentPlace ? (
                  <span className="bg-blue-600 text-blue-100 px-2 py-1 rounded text-xs font-medium">
                    Next stop: {currentPlace.name}
                  </span>
                ) : (
                  <span className="bg-gray-600 text-gray-100 px-2 py-1 rounded text-xs font-medium">
                    Planning...
                  </span>
                )}
                <span className="text-gray-400">
                  Stop {Math.min(currentStopIndex + 1, trip.places?.length || 0)}/{trip.places?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Network Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-400">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Map Area */}
        <div className="flex-1 relative">
          <AssistantMap
            userLocation={userLocation}
            currentPlace={currentPlace}
            allPlaces={trip.places || []}
            completedPlaces={completedPlaces}
            isDemoMode={isDemoMode}
            locationError={locationError}
            onLocationRequest={startLocationTracking}
          />
        </div>

        {/* Progress Panel */}
        <div className="w-full lg:w-80 bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-700">
          <ProgressPanel
            places={trip.places || []}
            currentStopIndex={currentStopIndex}
            completedPlaces={completedPlaces}
            onMarkDone={handleMarkStopDone}
            onSkipStop={handleSkipStop}
            onRecenterMap={handleRecenterMap}
            googleMapsLink={getGoogleMapsLink()}
            isCompleted={isTripdCompleted}
          />
        </div>
      </div>

      {/* Sticky Footer Toolbar */}
      <AssistantToolbar
        userLocation={userLocation}
        currentPlace={currentPlace}
        isOnline={isOnline}
        isDemoMode={isDemoMode}
        locationError={locationError}
      />
    </div>
  );
}
