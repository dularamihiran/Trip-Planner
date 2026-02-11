'use client';

import { Hotel } from '@/app/hotels/page';

interface HotelCardProps {
  hotel: Hotel;
  onBookHotel: (hotel: Hotel) => void;
}

export default function HotelCard({ hotel, onBookHotel }: HotelCardProps) {
  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const getAvailabilityStatus = (rooms?: number) => {
    if (!rooms) return { text: 'Contact for availability', color: 'text-gray-600' };
    if (rooms <= 3) return { text: 'Limited availability', color: 'text-red-600' };
    if (rooms <= 7) return { text: 'Available', color: 'text-yellow-600' };
    return { text: 'Good availability', color: 'text-green-600' };
  };

  const availability = getAvailabilityStatus(hotel.availableRooms || hotel.rooms);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Hotel Image */}
      <div className="h-48 bg-gradient-to-r from-emerald-400 to-blue-500 flex items-center justify-center relative overflow-hidden">
        {hotel.images && hotel.images.length > 0 ? (
          <img 
            src={hotel.images[0]} 
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        ) : hotel.image ? (
          <img 
            src={hotel.image} 
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-center">
            <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-sm opacity-80">No Image</p>
          </div>
        )}
      </div>

      {/* Hotel Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{hotel.name}</h3>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{hotel.location}, {hotel.district}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {hotel.description}
        </p>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {hotel.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{hotel.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Availability */}
        <div className="mb-4">
          <span className={`text-sm font-medium ${availability.color}`}>
            {availability.text} • {hotel.availableRooms || hotel.rooms || 0} rooms left
          </span>
        </div>

        {/* Price and Book Button */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(hotel.pricePerNight || hotel.price || 0)}
            </span>
            <span className="text-sm text-gray-600 ml-1">/ night</span>
          </div>
          <button
            onClick={() => onBookHotel(hotel)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
          >
            Book Hotel
          </button>
        </div>
      </div>
    </div>
  );
}
