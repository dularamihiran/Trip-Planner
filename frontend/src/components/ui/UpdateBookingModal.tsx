'use client';

import { useState, useEffect } from 'react';
import { Booking } from '@/types/trip';

interface UpdateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onUpdate: (bookingId: string, updates: Partial<Booking>) => void;
}

const UpdateBookingModal: React.FC<UpdateBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
    specialRequests: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (booking) {
      setFormData({
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: 2, // Default guests since not in original booking interface
        specialRequests: ''
      });
    }
  }, [booking]);

  const validateDates = () => {
    const newErrors: { [key: string]: string } = {};
    const today = new Date().toISOString().split('T')[0];
    
    if (!formData.checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    } else if (formData.checkIn < today) {
      newErrors.checkIn = 'Check-in date cannot be in the past';
    }
    
    if (!formData.checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    } else if (formData.checkOut <= formData.checkIn) {
      newErrors.checkOut = 'Check-out date must be after check-in date';
    }
    
    if (formData.guests < 1 || formData.guests > 8) {
      newErrors.guests = 'Number of guests must be between 1 and 8';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    if (!booking) return 0;
    const nights = calculateNights();
    const pricePerNight = booking.price / calculateOriginalNights();
    return Math.round(pricePerNight * nights);
  };

  const calculateOriginalNights = () => {
    if (!booking) return 1;
    const start = new Date(booking.checkIn);
    const end = new Date(booking.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking || !validateDates()) return;

    setIsLoading(true);
    try {
      const updates: Partial<Booking> = {
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        price: calculateTotalPrice()
      };
      
      await onUpdate(booking.bookingId, updates);
      onClose();
    } catch (error) {
      console.error('Error updating booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      checkIn: '',
      checkOut: '',
      guests: 2,
      specialRequests: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen || !booking) return null;

  const nights = calculateNights();
  const totalPrice = calculateTotalPrice();
  const originalNights = calculateOriginalNights();
  const pricePerNight = Math.round(booking.price / originalNights);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Update Booking</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hotel Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-1">{booking.hotelName}</h4>
          <p className="text-sm text-gray-600">{booking.district}</p>
          <p className="text-sm text-emerald-600 font-medium mt-1">
            LKR {pricePerNight.toLocaleString()} per night
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Check-in Date */}
          <div>
            <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Date
            </label>
            <input
              type="date"
              id="checkIn"
              value={formData.checkIn}
              onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.checkIn ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.checkIn && <p className="text-red-500 text-xs mt-1">{errors.checkIn}</p>}
          </div>

          {/* Check-out Date */}
          <div>
            <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date
            </label>
            <input
              type="date"
              id="checkOut"
              value={formData.checkOut}
              onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.checkOut ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.checkOut && <p className="text-red-500 text-xs mt-1">{errors.checkOut}</p>}
          </div>

          {/* Number of Guests */}
          <div>
            <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Guests
            </label>
            <select
              id="guests"
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.guests ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
            {errors.guests && <p className="text-red-500 text-xs mt-1">{errors.guests}</p>}
          </div>

          {/* Special Requests */}
          <div>
            <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests (Optional)
            </label>
            <textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              rows={3}
              placeholder="Any special requests or preferences..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Price Summary */}
          {nights > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Duration</span>
                  <span>{nights} {nights === 1 ? 'night' : 'nights'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rate per night</span>
                  <span>LKR {pricePerNight.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Guests</span>
                  <span>{formData.guests} {formData.guests === 1 ? 'guest' : 'guests'}</span>
                </div>
                <div className="border-t border-emerald-300 pt-2">
                  <div className="flex justify-between font-semibold text-emerald-900">
                    <span>Total</span>
                    <span>LKR {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || nights === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBookingModal;
