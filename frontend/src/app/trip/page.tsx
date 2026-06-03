'use client';

import Link from 'next/link';
import { useState } from 'react';
import { tripApi } from '@/utils/api';

export default function TripPlannerPage() {
  const [tripData, setTripData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    districts: [] as string[],
    budget: '100000-200000',
    interests: [] as string[],
    startPoint: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const interestOptions = [
    'Historical Sites',
    'Beaches',
    'Wildlife',
    'Adventure Sports',
    'Cultural Experiences',
    'Tea Plantations',
    'Religious Sites',
    'Hill Country'
  ];

  const districtOptions = [
    'Colombo',
    'Kandy',
    'Galle',
    'Nuwara Eliya',
    'Anuradhapura',
    'Jaffna',
    'Polonnaruwa',
    'Matale',
    'Ratnapura',
    'Hambantota',
    'Matara',
    'Badulla',
    'Kurunegala',
    'Puttalam',
    'Kalutara',
    'Gampaha',
    'Kegalle',
    'Monaragala',
    'Ampara',
    'Batticaloa',
    'Trincomalee',
    'Vavuniya',
    'Mannar',
    'Mullaitivu',
    'Kilinochchi'
  ];

  const handleInterestToggle = (interest: string) => {
    setTripData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleDistrictToggle = (district: string) => {
    setTripData(prev => ({
      ...prev,
      districts: prev.districts.includes(district)
        ? prev.districts.filter(d => d !== district)
        : [...prev.districts, district]
    }));
  };

  const removeDistrict = (districtToRemove: string) => {
    setTripData(prev => ({
      ...prev,
      districts: prev.districts.filter(d => d !== districtToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!tripData.name || !tripData.startDate || !tripData.endDate || tripData.districts.length === 0 || !tripData.startPoint) {
      setError('Please fill in all required fields: Trip Name, Starting Location, Dates, and at least one District');
      return;
    }

    if (tripData.interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call the suggestion API
      const response = await tripApi.suggestPlaces({
        districts: tripData.districts,
        interests: tripData.interests,
        budget: tripData.budget,
        travelers: tripData.travelers,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
      });

      console.log('Suggested places:', response);
      
      if (response.places && response.places.length > 0) {
        // Store trip data and suggestions in localStorage for the path page
        localStorage.setItem('tripData', JSON.stringify(tripData));
        localStorage.setItem('suggestedPlaces', JSON.stringify(response.places));
        localStorage.setItem('suggestionsSummary', JSON.stringify(response.summary));
        
        // Navigate to path page
        window.location.href = '/path';
      } else {
        setError('No places found matching your preferences. Try adjusting your filters.');
      }
    } catch (err: any) {
      console.error('Error fetching suggestions:', err);
      setError('Failed to get suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Create New Trip</h1>
            <Link
              href="/dashboard"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Trip Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tripName" className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Name
                </label>
                <input
                  type="text"
                  id="tripName"
                  value={tripData.name}
                  onChange={(e) => setTripData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Cultural Heritage Tour"
                  required
                />
              </div>

              <div>
                <label htmlFor="startPoint" className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Starting Location
                </label>
                <input
                  type="text"
                  id="startPoint"
                  value={tripData.startPoint}
                  onChange={(e) => setTripData(prev => ({ ...prev, startPoint: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Bandaranaike International Airport (CMB) or Colombo Fort"
                  required
                />
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={tripData.startDate}
                  onChange={(e) => setTripData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={tripData.endDate}
                  onChange={(e) => setTripData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Districts Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select District(s) to Visit
              </label>
              
              {/* Selected Districts Tags */}
              {tripData.districts.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {tripData.districts.map((district) => (
                      <span
                        key={district}
                        className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full"
                      >
                        {district}
                        <button
                          type="button"
                          onClick={() => removeDistrict(district)}
                          className="ml-2 text-emerald-600 hover:text-emerald-800 focus:outline-none"
                          aria-label={`Remove ${district} from selection`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* District Selection Dropdown */}
              <div className="relative">
                <label htmlFor="districtSelect" className="sr-only">
                  Select districts for your trip
                </label>
                <select
                  id="districtSelect"
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !tripData.districts.includes(e.target.value)) {
                      handleDistrictToggle(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="">Select districts to add to your trip...</option>
                  {districtOptions
                    .filter(district => !tripData.districts.includes(district))
                    .map(district => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                </select>
              </div>

              {/* Popular Districts Quick Select */}
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Popular destinations:</p>
                <div className="flex flex-wrap gap-2">
                  {['Colombo', 'Kandy', 'Galle', 'Nuwara Eliya', 'Anuradhapura', 'Jaffna']
                    .filter(district => !tripData.districts.includes(district))
                    .map(district => (
                      <button
                        key={district}
                        type="button"
                        onClick={() => handleDistrictToggle(district)}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-700 rounded-full border border-gray-200 hover:border-emerald-200 transition-colors duration-200"
                      >
                        + {district}
                      </button>
                    ))}
                </div>
              </div>
            </div>



            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What interests you? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors duration-200 ${
                      tripData.interests.includes(interest)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting Suggestions...
                  </div>
                ) : (
                  'Create Trip & Plan Route'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Feature Preview */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How it works:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Select your preferences</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Get smart suggestions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Build your itinerary</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
