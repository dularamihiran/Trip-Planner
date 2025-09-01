'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import TripHeader from '@/components/ui/TripHeader';
import TripPlaceList from '@/components/ui/TripPlaceList';
import BookingList from '@/components/ui/BookingList';
import MapPanel from '@/components/ui/MapPanel';
import UpdateBookingModal from '@/components/ui/UpdateBookingModal';
import { Trip, Booking } from '@/types/trip';
import { mockTrips } from '@/utils/tripHelpers';
import { downloadItinerary, printTripItinerary } from '@/utils/pdfGenerator';

export default function TripDetailsPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [optimisticUpdates, setOptimisticUpdates] = useState<{ [key: string]: any }>({});

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
        
        // For now, use mock data with a delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const foundTrip = mockTrips.find(t => t.tripId === tripId);
        
        if (!foundTrip) {
          throw new Error('Trip not found');
        }
        
        setTrip(foundTrip);
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

  // Handle trip status change
  const handleTripStatusChange = async (tripId: string, newStatus: Trip['status']) => {
    if (!trip) return;

    try {
      // Optimistic update
      setTrip(prev => prev ? { ...prev, status: newStatus } : null);
      
      // TODO: Make actual API call
      // await fetch(`/api/trips/${tripId}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${getAuthToken()}`,
      //   },
      //   body: JSON.stringify({ status: newStatus }),
      // });
      
      console.log(`Trip ${tripId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating trip status:', error);
      // Revert optimistic update on error
      setTrip(prev => prev ? { ...prev, status: trip.status } : null);
    }
  };

  // Handle marking place as done
  const handleMarkPlaceDone = async (placeId: string) => {
    if (!trip) return;

    try {
      // TODO: Implement optimistic UI update for place status
      // For now, just log the action
      console.log(`Marking place ${placeId} as done`);
      
      // TODO: Make actual API call
      // await fetch(`/api/trips/${tripId}/places/${placeId}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${getAuthToken()}`,
      //   },
      //   body: JSON.stringify({ status: 'DONE' }),
      // });
      
      alert('Place marked as done! (This will be integrated with backend)');
    } catch (error) {
      console.error('Error marking place as done:', error);
    }
  };

  // Handle removing place from trip
  const handleRemovePlace = async (placeId: string) => {
    if (!trip) return;

    try {
      // Optimistic update
      const updatedPlaces = trip.places.filter(place => place.placeId !== placeId);
      setTrip(prev => prev ? { ...prev, places: updatedPlaces } : null);
      
      // TODO: Make actual API call
      // await fetch(`/api/trips/${tripId}/places/${placeId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${getAuthToken()}`,
      //   },
      // });
      
      console.log(`Removed place ${placeId} from trip`);
    } catch (error) {
      console.error('Error removing place:', error);
      // Revert optimistic update on error
      setTrip(prev => prev ? { ...prev, places: trip.places } : null);
    }
  };

  // Handle updating booking
  const handleUpdateBooking = (bookingId: string) => {
    if (!trip) return;
    const booking = trip.bookings.find(b => b.bookingId === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setIsUpdateModalOpen(true);
    }
  };

  // Handle booking update submission
  const handleBookingUpdateSubmit = async (bookingId: string, updates: Partial<Booking>) => {
    if (!trip) return;

    try {
      // Optimistic update
      const updatedBookings = trip.bookings.map(booking => 
        booking.bookingId === bookingId 
          ? { ...booking, ...updates }
          : booking
      );
      setTrip(prev => prev ? { ...prev, bookings: updatedBookings } : null);
      
      // TODO: Make actual API call
      // await fetch(`/api/bookings/${bookingId}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${getAuthToken()}`,
      //   },
      //   body: JSON.stringify(updates),
      // });
      
      console.log(`Updated booking ${bookingId}:`, updates);
      setIsUpdateModalOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      // Revert optimistic update on error
      setTrip(prev => prev ? { ...prev, bookings: trip.bookings } : null);
    }
  };

  // Handle PDF download
  const handleDownloadPDF = async (trip: Trip) => {
    try {
      await downloadItinerary(trip);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // You could add a toast notification here
    }
  };

  // Handle print itinerary
  const handlePrintItinerary = async (trip: Trip) => {
    try {
      await printTripItinerary(trip);
    } catch (error) {
      console.error('Error printing itinerary:', error);
      // You could add a toast notification here
    }
  };

  // Handle canceling booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!trip) return;

    try {
      // Optimistic update
      const updatedBookings = trip.bookings.map(booking => 
        booking.bookingId === bookingId 
          ? { ...booking, status: 'CANCELLED' as const }
          : booking
      );
      setTrip(prev => prev ? { ...prev, bookings: updatedBookings } : null);
      
      // TODO: Make actual API call
      // await fetch(`/api/bookings/${bookingId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${getAuthToken()}`,
      //   },
      // });
      
      console.log(`Cancelled booking ${bookingId}`);
    } catch (error) {
      console.error('Error canceling booking:', error);
      // Revert optimistic update on error
      setTrip(prev => prev ? { ...prev, bookings: trip.bookings } : null);
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
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
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

            {/* Places in Itinerary */}
            <TripPlaceList
              places={trip.places}
              tripStatus={trip.status}
              onMarkDone={handleMarkPlaceDone}
              onRemovePlace={handleRemovePlace}
            />

            {/* Hotel Bookings */}
            <BookingList
              bookings={trip.bookings}
              onUpdateBooking={handleUpdateBooking}
              onCancelBooking={handleCancelBooking}
            />

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href={`/assistant/${trip.tripId}`}
                  className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Open Trip Assistant
                </Link>
                
                <Link
                  href={`/path?tripId=${trip.tripId}`}
                  className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  View Route Planning
                </Link>
                
                <Link
                  href={`/hotels?tripId=${trip.tripId}`}
                  className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Manage Hotels
                </Link>
                
                <button
                  onClick={() => alert('Edit trip functionality will be implemented with backend integration')}
                  className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Trip Details
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Map Panel */}
          <div className="lg:col-span-1">
            <MapPanel 
              places={trip.places}
              tripName={trip.tripName}
            />
          </div>
        </div>
      </div>

      {/* Update Booking Modal */}
      <UpdateBookingModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onUpdate={handleBookingUpdateSubmit}
      />
    </div>
  );
}
