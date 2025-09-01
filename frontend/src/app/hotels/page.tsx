'use client';

import { useState, useEffect } from 'react';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import HotelCard from '@/components/ui/HotelCard';
import FilterBar from '@/components/ui/FilterBar';
import BookingModal from '@/components/ui/BookingModal';

// Type definitions
export interface Hotel {
  id: string;
  name: string;
  location: string;
  district: string;
  rating: number;
  pricePerNight: number;
  description: string;
  image: string;
  amenities: string[];
  availableRooms: number;
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

// Mock hotel data for Sri Lankan destinations
const mockHotels: Hotel[] = [
  {
    id: '1',
    name: 'Cinnamon Grand Colombo',
    location: 'Colombo City Center',
    district: 'Colombo',
    rating: 5,
    pricePerNight: 25000,
    description: 'Luxury hotel in the heart of Colombo with world-class amenities and service.',
    image: '/api/placeholder/400/300',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Business Center'],
    availableRooms: 12
  },
  {
    id: '2',
    name: 'Hotel Suisse Kandy',
    location: 'Kandy Lake View',
    district: 'Kandy',
    rating: 4,
    pricePerNight: 18000,
    description: 'Charming hotel overlooking Kandy Lake with traditional Sri Lankan hospitality.',
    image: '/api/placeholder/400/300',
    amenities: ['WiFi', 'Restaurant', 'Lake View', 'Room Service'],
    availableRooms: 8
  },
  {
    id: '3',
    name: 'Galle Face Hotel',
    location: 'Galle Face Green',
    district: 'Colombo',
    rating: 5,
    pricePerNight: 32000,
    description: 'Historic luxury hotel facing the Indian Ocean with colonial charm.',
    image: '/api/placeholder/400/300',
    amenities: ['WiFi', 'Ocean View', 'Pool', 'Spa', 'Multiple Restaurants'],
    availableRooms: 5
  },
  {
    id: '4',
    name: 'Fortress Resort & Spa',
    location: 'Koggala Beach',
    district: 'Galle',
    rating: 5,
    pricePerNight: 45000,
    description: 'Beachfront resort with stunning architecture and world-class spa facilities.',
    image: '/api/placeholder/400/300',
    amenities: ['Beach Access', 'Spa', 'Pool', 'WiFi', 'Water Sports'],
    availableRooms: 3
  },
  {
    id: '5',
    name: 'Grand Hotel Nuwara Eliya',
    location: 'Nuwara Eliya Town',
    district: 'Nuwara Eliya',
    rating: 4,
    pricePerNight: 22000,
    description: 'Colonial-era hotel in the cool hill country with beautiful gardens.',
    image: '/api/placeholder/400/300',
    amenities: ['WiFi', 'Restaurant', 'Garden View', 'Fireplace', 'Golf Course'],
    availableRooms: 7
  },
  {
    id: '6',
    name: 'Heritance Kandalama',
    location: 'Dambulla',
    district: 'Matale',
    rating: 5,
    pricePerNight: 38000,
    description: 'Eco-friendly luxury resort built into a rock face with stunning lake views.',
    image: '/api/placeholder/400/300',
    amenities: ['Lake View', 'Eco Resort', 'Spa', 'Pool', 'Wildlife Viewing'],
    availableRooms: 4
  },
  {
    id: '7',
    name: 'Maalu Maalu Resort',
    location: 'Pasikuda Beach',
    district: 'Batticaloa',
    rating: 4,
    pricePerNight: 28000,
    description: 'Beachfront resort on the pristine Pasikuda Beach with water sports.',
    image: '/api/placeholder/400/300',
    amenities: ['Beach Access', 'Water Sports', 'Pool', 'Restaurant', 'WiFi'],
    availableRooms: 9
  },
  {
    id: '8',
    name: 'Cinnamon Lodge Habarana',
    location: 'Habarana',
    district: 'Anuradhapura',
    rating: 4,
    pricePerNight: 20000,
    description: 'Nature resort perfect for exploring ancient cities and wildlife parks.',
    image: '/api/placeholder/400/300',
    amenities: ['Nature Setting', 'Pool', 'Safari Tours', 'Restaurant', 'WiFi'],
    availableRooms: 11
  },
  {
    id: '9',
    name: 'Jetwing Lighthouse',
    location: 'Galle Fort Area',
    district: 'Galle',
    rating: 5,
    pricePerNight: 35000,
    description: 'Boutique hotel near historic Galle Fort with contemporary design.',
    image: '/api/placeholder/400/300',
    amenities: ['Historic Location', 'Pool', 'Spa', 'Restaurant', 'WiFi'],
    availableRooms: 6
  }
];

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>(mockHotels);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>(mockHotels);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    district: 'all',
    sortBy: 'name',
    searchQuery: ''
  });

  // Get unique districts for filter dropdown
  const districts = ['all', ...Array.from(new Set(hotels.map(hotel => hotel.district)))];

  // Apply filters whenever filters change
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
        hotel.location.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        hotel.district.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Sort results
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case 'price-high':
        result.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
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
