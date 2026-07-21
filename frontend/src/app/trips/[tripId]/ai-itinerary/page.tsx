'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import MapPanel from '@/components/ui/MapPanel';
import { Trip, Place } from '@/types/trip';
import { optimizeItinerary } from '@/services/aiService';

export default function AiItineraryPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiItinerary, setAiItinerary] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Fetch trip details from backend
  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch trip main details
      const response = await fetch(`http://localhost:5000/api/trips/${tripId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Trip not found');
        }
        throw new Error('Failed to fetch trip details');
      }

      const tripData = await response.json();

      // Fetch detailed places associated with this trip
      let fullPlaces: Place[] = [];
      try {
        const placesResponse = await fetch(`http://localhost:5000/api/trips/${tripId}/places`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (placesResponse.ok) {
          const placesData = await placesResponse.json();
          fullPlaces = placesData.places || [];
        }
      } catch (placeErr) {
        console.error('Error fetching trip places:', placeErr);
      }

      const mergedTripData = {
        ...tripData,
        places: fullPlaces,
      };

      setTrip(mergedTripData);

      // Now load or generate AI optimized itinerary
      await handleAiItineraryLoad(mergedTripData);
    } catch (err) {
      console.error('Error fetching trip details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  // Load from cache or generate AI optimization
  const handleAiItineraryLoad = async (tripData: Trip) => {
    const cached = localStorage.getItem(`aiItinerary_${tripId}`);
    if (cached) {
      try {
        setAiItinerary(JSON.parse(cached));
        return;
      } catch (e) {
        console.error('Failed to parse cached itinerary, regenerating...', e);
      }
    }

    // Auto-generate AI itinerary if not cached
    if (tripData.places && tripData.places.length > 0) {
      try {
        setLoadingAi(true);
        // Calculate number of travel days
        const start = new Date(tripData.startDate);
        const end = new Date(tripData.endDate);
        const timeDiff = end.getTime() - start.getTime();
        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

        // Extract starting location from trip description
        const desc = (tripData as any).description || '';
        const startPointMatch = desc.match(/Starting location:\s*([^.]+)/);
        const startPoint = startPointMatch ? startPointMatch[1].trim() : undefined;

        const response = await optimizeItinerary({
          places: tripData.places.map((p) => ({
            name: p.name,
            district: p.district,
            category: p.category,
            lat: (p as any).latitude || p.lat || 0,
            lng: (p as any).longitude || p.lng || 0,
            description: (p as any).description || '',
          })),
          days: isNaN(days) || days <= 0 ? 3 : days,
          budget: (tripData as any).budget ? (tripData as any).budget.toString() : 'Medium',
          startPoint: startPoint
        });

        setAiItinerary(response);
        localStorage.setItem(`aiItinerary_${tripId}`, JSON.stringify(response));
      } catch (err) {
        console.error('Error generating AI itinerary:', err);
      } finally {
        setLoadingAi(false);
      }
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]);

  // Helper to find place details from the main trip places list by name
  const getPlaceByName = (name: string): Place | undefined => {
    if (!trip || !trip.places || !name) return undefined;
    const targetName = name.toLowerCase().trim();
    return trip.places.find((p) => {
      if (!p || !p.name) return false;
      const placeName = p.name.toLowerCase().trim();
      return (
        placeName === targetName ||
        placeName.includes(targetName) ||
        targetName.includes(placeName)
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading AI Smart Plan</h3>
            <p className="text-gray-600">Retrieving trip routing and generating optimized path...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{error || 'Trip Not Found'}</h3>
            <p className="text-gray-600 mb-6">Failed to load itinerary. Please return to your dashboard.</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const daysKeys = aiItinerary && aiItinerary.itinerary ? Object.keys(aiItinerary.itinerary) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
        {/* Navigation */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            ← Back to Dashboard
          </Link>

          <Link
            href={`/trips/${tripId}`}
            className="inline-flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            📋 View Standard Trip List
          </Link>
        </div>

        {/* Heading banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl shadow-xl p-8 md:p-12 text-white mb-8 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 text-9xl select-none">🌴</div>
          <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            🤖 AI-Powered Geographic Itinerary
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-4 mb-2">
            {trip.tripName}
          </h1>
          <p className="text-blue-100 max-w-2xl text-sm md:text-base leading-relaxed">
            Your attractions have been geographically sorted and grouped day-by-day to minimize your travel time. Follow this path for a optimized Sri Lankan adventure!
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Day-by-Day AI Suggestions (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">

            {loadingAi && (
              <div className="bg-white rounded-2xl shadow p-8 text-center animate-pulse">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h4 className="text-sm font-bold text-gray-900">Regenerating AI itinerary...</h4>
              </div>
            )}

            {!loadingAi && daysKeys.length > 0 ? (
              daysKeys.map((dayKey) => {
                const dayData = aiItinerary.itinerary[dayKey];
                const dayNumber = dayKey.replace('day', '');

                return (
                  <div key={dayKey} className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 md:p-8 space-y-6">
                    {/* Day Banner Header */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="text-xl font-extrabold text-blue-950 flex items-center">
                          📅 Day {dayNumber} — {dayData.district || 'Destinations'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          District Focus: {dayData.district}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
                        {dayData.places.length} {dayData.places.length === 1 ? 'Stop' : 'Stops'}
                      </span>
                    </div>

                    {/* Places chronological lists */}
                    <div className="relative border-l-2 border-blue-100 ml-4 pl-6 md:pl-8 space-y-6 py-2">
                      {dayData.places.map((placeName: string, index: number) => {
                        const placeDetails = getPlaceByName(placeName);

                        return (
                          <div key={index} className="relative group">
                            {/* Marker Icon */}
                            <span className="absolute -left-10 md:-left-12 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-blue-500 text-xs font-bold text-blue-600 shadow-sm z-10">
                              {index + 1}
                            </span>

                            <div className="bg-gray-50/50 hover:bg-blue-50/10 border border-gray-100 rounded-xl p-4 transition-colors">
                              <h4 className="text-base font-bold text-gray-950">
                                {placeName}
                              </h4>

                              {placeDetails ? (
                                <div className="mt-2 text-xs text-gray-600 leading-relaxed space-y-1">
                                  <p className="font-semibold text-emerald-800">
                                    🏷️ {placeDetails.category} • 📍 {placeDetails.district}
                                  </p>
                                  {(placeDetails as any).description && (
                                    <p className="text-gray-500 italic mt-1 font-normal">
                                      &ldquo;{(placeDetails as any).description}&rdquo;
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500 italic mt-1 font-normal">
                                  Custom added place on route path.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              !loadingAi && (
                <div className="bg-white rounded-2xl p-12 text-center border">
                  <span className="text-4xl">🏝️</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">No AI Itinerary Found</h3>
                  <button
                    onClick={() => handleAiItineraryLoad(trip)}
                    className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                  >
                    ⚡ Generate AI Smart Itinerary Now
                  </button>
                </div>
              )
            )}
          </div>

          {/* RIGHT COLUMN: Route Map (1/3 width) */}
          <div className="lg:col-span-1">
            <MapPanel
              places={trip.places || []}
              tripName={trip.tripName}
              startPoint={trip.startPoint}
              startPointLat={trip.startPointLat}
              startPointLng={trip.startPointLng}
            />
          </div>

        </div>
      </main>
    </div>
  );
}
