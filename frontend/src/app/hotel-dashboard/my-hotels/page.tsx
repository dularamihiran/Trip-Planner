'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { HotelOwner, Hotel } from '@/types/user';
import { updateHotel, deleteHotel, sriLankanDistricts } from '@/utils/mockHotels';

export default function MyHotelsPage() {
  const router = useRouter();
  const [hotelOwner, setHotelOwner] = useState<HotelOwner | null>(null);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is a hotel owner
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.userType === 'hotel_owner') {
        setHotelOwner(user);
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
  };

  const handleDelete = async (hotelId: string) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) {
      return;
    }

    setIsLoading(true);
    try {
      const success = deleteHotel(hotelId);
      if (success && hotelOwner) {
        const updatedHotels = hotelOwner.hotels.filter(h => h.id !== hotelId);
        const updatedOwner = { ...hotelOwner, hotels: updatedHotels };
        setHotelOwner(updatedOwner);
        localStorage.setItem('currentUser', JSON.stringify(updatedOwner));
      }
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Failed to delete hotel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateHotel = async (updatedHotel: Hotel) => {
    setIsLoading(true);
    try {
      const result = updateHotel(updatedHotel.id, updatedHotel);
      if (result && hotelOwner) {
        const updatedHotels = hotelOwner.hotels.map(h => 
          h.id === updatedHotel.id ? updatedHotel : h
        );
        const updatedOwner = { ...hotelOwner, hotels: updatedHotels };
        setHotelOwner(updatedOwner);
        localStorage.setItem('currentUser', JSON.stringify(updatedOwner));
        setEditingHotel(null);
      }
    } catch (error) {
      console.error('Error updating hotel:', error);
      alert('Failed to update hotel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hotelOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/hotel-dashboard" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TP</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">My Hotels</h1>
                  <p className="text-sm text-gray-500">{hotelOwner.ownerName}</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/hotel-dashboard/add-hotel"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Add Hotel
              </Link>
              <Link
                href="/hotel-dashboard"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Hotels</h2>
                <div className="text-sm text-gray-500">
                  {hotelOwner.hotels.length} hotel(s) registered
                </div>
              </div>

              {hotelOwner.hotels.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hotels</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding your first hotel.</p>
                  <div className="mt-6">
                    <Link
                      href="/hotel-dashboard/add-hotel"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Hotel
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotelOwner.hotels.map((hotel) => (
                    <div key={hotel.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="aspect-w-16 aspect-h-9">
                        <Image
                          src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}
                          alt={hotel.name}
                          width={400}
                          height={240}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{hotel.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{hotel.district}</p>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{hotel.address}</p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-bold text-primary-600">
                            LKR {hotel.price.toLocaleString()}/night
                          </span>
                          <span className="text-sm text-gray-500">
                            {hotel.rooms} rooms
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(hotel)}
                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(hotel.id)}
                            disabled={isLoading}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors duration-200 disabled:opacity-75"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editingHotel && (
        <EditHotelModal
          hotel={editingHotel}
          onSave={handleUpdateHotel}
          onCancel={() => setEditingHotel(null)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// Edit Hotel Modal Component
interface EditHotelModalProps {
  hotel: Hotel;
  onSave: (hotel: Hotel) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function EditHotelModal({ hotel, onSave, onCancel, isLoading }: EditHotelModalProps) {
  const [formData, setFormData] = useState({
    name: hotel.name,
    district: hotel.district,
    address: hotel.address,
    description: hotel.description,
    price: hotel.price.toString(),
    rooms: hotel.rooms.toString(),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedHotel: Hotel = {
      ...hotel,
      name: formData.name,
      district: formData.district,
      address: formData.address,
      description: formData.description,
      price: parseInt(formData.price),
      rooms: parseInt(formData.rooms),
    };
    onSave(updatedHotel);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Hotel</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter hotel name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="edit-district" className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <select
                id="edit-district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                required
                title="Select district"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {sriLankanDistricts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Enter full address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="Describe your hotel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">Price per Night (LKR)</label>
                <input
                  type="number"
                  id="edit-price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="e.g., 15000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="edit-rooms" className="block text-sm font-medium text-gray-700 mb-1">Available Rooms</label>
                <input
                  type="number"
                  id="edit-rooms"
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="e.g., 50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
