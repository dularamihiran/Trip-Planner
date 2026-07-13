'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import TripHeader from '@/components/ui/TripHeader';
import TripPlaceList from '@/components/ui/TripPlaceList';
import MapPanel from '@/components/ui/MapPanel';
import { Trip } from '@/types/trip';
import { downloadItinerary, printTripItinerary } from '@/utils/pdfGenerator';

export default function TripDetailsPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      let fullPlaces: any[] = [];
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

      // Parse starting location from description if not stored directly
      let startPoint = tripData.startPoint;
      if (!startPoint && tripData.description && tripData.description.includes('Starting location:')) {
        const match = tripData.description.match(/Starting location:\s*([^.]+)/);
        if (match && match[1]) {
          startPoint = match[1].trim();
        }
      }

      const mergedTrip = {
        ...tripData,
        startPoint: startPoint || 'Colombo Fort',
        places: fullPlaces
      };

      setTrip(mergedTrip);
    } catch (err) {
      console.error('Error fetching trip details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]);

  // Handle trip status change
  const handleTripStatusChange = async (tripId: string, newStatus: Trip['status']) => {
    if (!trip) return;

    try {
      // Optimistic update
      setTrip(prev => prev ? { ...prev, status: newStatus } : null);

      const response = await fetch(`http://localhost:5000/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update trip status');
      }

      console.log(`Trip ${tripId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating trip status:', error);
      fetchTripDetails();
    }
  };

  // Handle place status change
  const handlePlaceStatusChange = async (placeId: string, status: 'PLANNED' | 'DONE') => {
    if (!trip || !trip.places) return;

    try {
      // Optimistic update
      const updatedPlaces = trip.places.map((place) => {
        if (place.placeId === placeId) {
          return { ...place, visitStatus: status };
        }
        return place;
      });
      setTrip(prev => prev ? { ...prev, places: updatedPlaces } : null);

      // Make actual PATCH API call to backend
      const response = await fetch(`http://localhost:5000/api/trips/${trip.tripId}/places/${placeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitStatus: status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update place status');
      }

      console.log(`Place ${placeId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating place status:', error);
      // Revert on error
      fetchTripDetails();
    }
  };

  // Handle removing place from trip
  const handleRemovePlace = async (placeId: string) => {
    if (!trip || !trip.places) return;

    try {
      // Optimistic update
      const updatedPlaces = trip.places.filter(place => place.placeId !== placeId);
      setTrip(prev => prev ? { ...prev, places: updatedPlaces } : null);

      // Make actual DELETE API call
      const response = await fetch(`http://localhost:5000/api/trips/${trip.tripId}/places/${placeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove place');
      }

      console.log(`Removed place ${placeId} from trip`);
    } catch (error) {
      console.error('Error removing place:', error);
      fetchTripDetails();
    }
  };


  // Handle PDF download
  const handleDownloadPDF = async (trip: Trip) => {
    try {
      await downloadItinerary(trip);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  // Handle print itinerary
  const handlePrintItinerary = async (trip: Trip) => {
    try {
      await printTripItinerary(trip);
    } catch (error) {
      console.error('Error printing itinerary:', error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Trip Details</h3>
              <p className="text-gray-600">Please wait while we fetch your trip information...</p>
            </div>
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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Trip Not Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {error === 'Trip not found'
                ? "The trip you're looking for doesn't exist or has been removed."
                : 'There was an error loading the trip details. Please try again.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              {error && error !== 'Trip not found' && (
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2M15 15v5h.582m0 0a8.001 8.001 0 01-15.356-2M15 15v-5a8 8 0 00-15.356 2" />
                  </svg>
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trip Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Header */}
            <TripHeader
              trip={trip}
              onStatusChange={handleTripStatusChange}
              onDownloadPDF={handleDownloadPDF}
              onPrintItinerary={handlePrintItinerary}
            />

            {/* Next Destination Banner Widget */}
            {(() => {
              const plannedPlaces = trip.places?.filter(p => p.visitStatus !== 'DONE') || [];
              const nextPlace = plannedPlaces[0];

              if (trip.places && trip.places.length > 0 && plannedPlaces.length === 0) {
                return (
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden animate-fadeIn border border-emerald-400/20">
                    <div className="absolute right-4 bottom-0 opacity-15 text-7xl select-none">🏆</div>
                    <span className="bg-emerald-400/35 border border-emerald-300/40 text-white text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      Trip Accomplished
                    </span>
                    <h3 className="text-xl font-extrabold mt-3 mb-1">🎉 Adventure Completed!</h3>
                    <p className="text-sm text-emerald-100 font-medium">
                      Congratulations! You have successfully visited all {trip.places.length} places in your itinerary.
                    </p>
                  </div>
                );
              }

              if (nextPlace) {
                return (
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden border border-blue-500/20 animate-fadeIn">
                    <div className="absolute right-4 bottom-0 opacity-10 text-7xl select-none">🚀</div>

                    <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      Next Stop on Route
                    </span>

                    <h3 className="text-2xl font-extrabold mt-3 mb-1 text-white truncate">
                      {nextPlace.name}
                    </h3>

                    <p className="text-sm text-blue-100 flex items-center mb-4 font-semibold">
                      🏷️ {nextPlace.category} • 📍 {nextPlace.district}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-blue-800/50 pt-4">
                      <div className="text-xs text-blue-200 font-medium">
                        {plannedPlaces.length - 1 === 0
                          ? 'This is the final destination on your route!'
                          : `Then ${plannedPlaces.length - 1} remaining destinations left on your trip path.`
                        }
                      </div>

                      <button
                        onClick={() => handlePlaceStatusChange(nextPlace.placeId, 'DONE')}
                        className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
                      >
                        ✅ Mark as Completed
                      </button>
                    </div>
                  </div>
                );
              }

              return null;
            })()}

            {/* Places in Itinerary */}
            <TripPlaceList
              places={trip.places || []}
              tripStatus={trip.status}
              tripId={trip.tripId}
              onMarkDone={(placeId) => handlePlaceStatusChange(placeId, 'DONE')}
              onRemovePlace={handleRemovePlace}
              onStatusChange={handlePlaceStatusChange}
            />

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href={`/path?tripId=${trip.tripId}`}
                  className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow transition-colors duration-200"
                >
                  🗺️ View Route Planning
                </Link>

                <Link
                  href={`/trips/${trip.tripId}/ai-itinerary`}
                  className="inline-flex items-center justify-center bg-indigo-900 hover:bg-indigo-950 text-white px-6 py-3 rounded-xl font-bold shadow transition-colors duration-200"
                >
                  ⚡ View AI Smart Path
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Map Panel */}
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
      </div>
    </div>
  );
}
