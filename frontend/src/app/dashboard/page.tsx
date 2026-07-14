'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import TripCard from '@/components/ui/TripCard';
import TripFilterBar from '@/components/ui/TripFilterBar';
import Link from 'next/link';
import { Trip, FilterOptions } from '@/types/trip';
import { fetchUserTrips } from '@/utils/tripHelpers';
import { downloadItinerary, printTripItinerary } from '@/utils/pdfGenerator';

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'ALL',
    sortBy: 'desc'
  });

  // Fetch trips on component mount
  useEffect(() => {
    const loadTrips = async () => {
      try {
        setLoading(true);
        const userTrips = await fetchUserTrips();
        setTrips(userTrips);
        setError(null);
      } catch (err) {
        setError('Failed to load trips. Please try again.');
        console.error('Error loading trips:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, []);

  // Filter and sort trips based on current filters
  const filteredTrips = useMemo(() => {
    let filtered = [...trips];

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(trip =>
        trip.tripName.toLowerCase().includes(searchTerm) ||
        trip.districts.some(district => district.toLowerCase().includes(searchTerm))
      );
    }

    // Apply status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(trip => trip.status === filters.status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return filters.sortBy === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [trips, filters]);

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

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Trips</h1>
            <p className="text-gray-600">
              Manage your travel plans and explore beautiful Sri Lanka
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/trip"
              className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Trip
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-gray-600">Loading your trips...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Trips</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Filter Bar */}
            {trips.length > 0 && (
              <TripFilterBar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                totalTrips={trips.length}
                filteredTrips={filteredTrips.length}
              />
            )}

            {/* Trips Grid */}
            {filteredTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips.map((trip) => (
                  <TripCard
                    key={trip.tripId}
                    trip={trip}
                    onDownloadPDF={handleDownloadPDF}
                    onPrintItinerary={handlePrintItinerary}
                  />
                ))}
              </div>
            ) : trips.length > 0 ? (
              /* No trips match current filters */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
                <p className="text-gray-600 mb-4">
                  No trips match your current search criteria. Try adjusting your filters.
                </p>
                <button
                  onClick={() => setFilters({ search: '', status: 'ALL', sortBy: 'desc' })}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              /* No trips at all */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Sri Lankan Adventure</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven&apos;t created any trips yet. Start planning your perfect Sri Lankan getaway with our intelligent trip planner.
                </p>
                <Link
                  href="/trip"
                  className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Trip
                </Link>
              </div>
            )}
          </>
        )}

        {/* Quick Stats */}
        {!loading && !error && trips.length > 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                {trips.length}
              </div>
              <div className="text-sm text-gray-600">Total Trips</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {trips.reduce((sum, trip) => sum + (trip.places?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Places to Visit</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {new Set(trips.flatMap(trip => trip.districts)).size}
              </div>
              <div className="text-sm text-gray-600">Districts Explored</div>
            </div>
          </div>
        )
        }
      </main>
    </div>
  );
}
