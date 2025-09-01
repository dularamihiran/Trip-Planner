'use client';

import { Booking } from '@/types/trip';
import { useState } from 'react';

interface BookingListProps {
  bookings: Booking[];
  onUpdateBooking: (bookingId: string) => void;
  onCancelBooking: (bookingId: string) => void;
}

const BookingList: React.FC<BookingListProps> = ({ 
  bookings, 
  onUpdateBooking, 
  onCancelBooking 
}) => {
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCancelBooking = async (bookingId: string, hotelName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel your booking at "${hotelName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setLoadingStates(prev => ({ ...prev, [`cancel-${bookingId}`]: true }));
    try {
      await onCancelBooking(bookingId);
    } catch (error) {
      console.error('Error canceling booking:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`cancel-${bookingId}`]: false }));
    }
  };

  const handleUpdateBooking = (bookingId: string) => {
    onUpdateBooking(bookingId);
  };

  const totalCost = bookings
    .filter(booking => booking.status === 'CONFIRMED')
    .reduce((sum, booking) => sum + booking.price, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Hotel Bookings</h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {bookings.filter(b => b.status === 'CONFIRMED').length} active
          </span>
        </div>

        {bookings.length > 0 ? (
          <>
            <div className="space-y-4">
              {bookings.map((booking) => {
                const isCancelling = loadingStates[`cancel-${booking.bookingId}`];
                const nights = calculateNights(booking.checkIn, booking.checkOut);
                
                return (
                  <div
                    key={booking.bookingId}
                    className={`p-4 border rounded-lg ${
                      booking.status === 'CANCELLED' 
                        ? 'bg-red-50 border-red-200 opacity-75' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`text-lg font-medium ${
                            booking.status === 'CANCELLED' ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {booking.hotelName}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium">District:</span>
                            <span className="ml-1">{booking.district}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span className="font-medium">Price:</span>
                            <span className="ml-1">LKR {booking.price.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">Check-in:</span>
                            <span className="ml-1">{formatDate(booking.checkIn)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">Check-out:</span>
                            <span className="ml-1">{formatDate(booking.checkOut)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">
                            {nights} {nights === 1 ? 'night' : 'nights'} • 
                            <span className="ml-1">LKR {Math.round(booking.price / nights).toLocaleString()} per night</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {booking.status === 'CONFIRMED' && (
                      <div className="flex space-x-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleUpdateBooking(booking.bookingId)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors duration-200"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Update
                        </button>
                        
                        <button
                          onClick={() => handleCancelBooking(booking.bookingId, booking.hotelName)}
                          disabled={isCancelling}
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded transition-colors duration-200"
                        >
                          {isCancelling ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          ) : (
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          Cancel
                        </button>
                      </div>
                    )}

                    {booking.status === 'CANCELLED' && (
                      <div className="pt-3 border-t border-red-200">
                        <p className="text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          This booking has been cancelled
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total Cost Summary */}
            {totalCost > 0 && (
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-800 font-medium">Total Accommodation Cost</span>
                  <span className="text-xl font-bold text-emerald-900">
                    LKR {totalCost.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-emerald-700 mt-1">
                  Based on {bookings.filter(b => b.status === 'CONFIRMED').length} confirmed booking(s)
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Hotel Bookings</h3>
            <p className="text-gray-600">You haven&apos;t booked any hotels for this trip yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingList;
