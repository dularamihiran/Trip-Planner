'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import HotelCard from '@/components/ui/HotelCard';
import FilterBar from '@/components/ui/FilterBar';
import BookingModal from '@/components/ui/BookingModal';
import { hotelApi } from '@/utils/api';
import { isAuthenticated } from '@/utils/auth';

// Type definitions
export interface Hotel {
  hotelId: string;
  id?: string;
  name: string;
  location?: string;
  address?: string;
  district: string;
  city?: string;
  rating?: number;
  price: number;
  pricePerNight?: number;
  description?: string;
  image?: string;
  images?: string[];
  amenities?: string[];
  availableRooms?: number;
  rooms?: number;
}

export interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  district: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  bookingDate: string;
}

export interface FilterOptions {
  district: string;
  sortBy: string;
  searchQuery: string;
}

export default function HotelsPage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    district: 'all',
    sortBy: 'name',
    searchQuery: ''
  });

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Load hotels from API on component mount
  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await hotelApi.getAll();
      
      // Backend returns { count, hotels } object
      const hotelsList = response.hotels || [];
      
      console.log('📊 Hotels loaded from API:', hotelsList.length);
      console.log('📋 Hotel data:', hotelsList);
      
      // Transform API data to match component expectations
      const transformedHotels = hotelsList.map((hotel: any) => ({
        ...hotel,
        id: hotel.hotelId,
        pricePerNight: hotel.price,
        location: hotel.address || hotel.city || hotel.district,
        image: hotel.images?.[0] || '/api/placeholder/400/300',
        rating: hotel.rating || 4,
      }));
      
      setHotels(transformedHotels);
      setFilteredHotels(transformedHotels);
    } catch (err: any) {
      console.error('Failed to load hotels:', err);
      setError('Failed to load hotels. Please try again later.');
      // Show empty array if API fails (no mock data)
      setHotels([]);
      setFilteredHotels([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique districts for filter dropdown
  const districts = ['all', ...Array.from(new Set(hotels.map(hotel => hotel.district)))];

  // Apply filters whenever filters or hotels change
  useEffect(() => {
    let result = [...hotels];

    // Filter by district
    if (filters.district !== 'all') {
      result = result.filter(hotel => hotel.district === filters.district);
    }

    // Filter by search query
    if (filters.searchQuery) {
      result = result.filter(hotel =>
        hotel.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (hotel.location && hotel.location.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
        hotel.district.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Sort results
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.pricePerNight || a.price || 0) - (b.pricePerNight || b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.pricePerNight || b.price || 0) - (a.pricePerNight || a.price || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredHotels(result);
  }, [filters, hotels]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleBookHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowBookingModal(true);
  };

  const handleBookingConfirm = (bookingData: Omit<Booking, 'id' | 'bookingDate'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `booking-${Date.now()}`,
      bookingDate: new Date().toISOString()
    };

    setBookings(prev => [...prev, newBooking]);
    setShowBookingModal(false);
    setSelectedHotel(null);

    // Show success message
    alert(`Booking confirmed for ${bookingData.hotelName}!\nBooking ID: ${newBooking.id}`);
    
    // TODO: In real app, send booking to backend
    console.log('New booking:', newBooking);
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setSelectedHotel(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Hotels
          </h1>
          <p className="text-gray-600">
            Find and book the perfect accommodation for your Sri Lankan adventure
          </p>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          districts={districts}
          onFilterChange={handleFilterChange}
          resultCount={filteredHotels.length}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="mt-4 text-gray-600">Loading hotels...</p>
          </div>
        ) : (
          <>
            {/* Hotels Grid */}
            {filteredHotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onBookHotel={handleBookHotel}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => setFilters({ district: 'all', sortBy: 'name', searchQuery: '' })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
          </>
        )}

        {/* Booking Summary */}
        {bookings.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Bookings ({bookings.length})
            </h3>
            <div className="space-y-3">
              {bookings.slice(-3).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">{booking.hotelName}</h4>
                    <p className="text-sm text-gray-600">
                      {booking.checkIn} to {booking.checkOut} • {booking.guests} guest(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-600">
                      Rs. {booking.totalPrice.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.district}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedHotel && (
        <BookingModal
          hotel={selectedHotel}
          onConfirm={handleBookingConfirm}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
