'use client';

import { useState } from 'react';
import { Place } from '@/app/path/page';

interface SearchBarProps {
  onPlaceFound: (place: Place) => void;
}

// Mock search results for Sri Lankan places
const mockSearchResults = [
  {
    id: 'search-1',
    name: 'Horton Plains National Park',
    category: 'Nature',
    address: 'Horton Plains, Nuwara Eliya District',
    lat: 6.8067,
    lng: 80.8081,
    description: 'High-altitude plateau with World\'s End cliff',
    isSelected: false
  },
  {
    id: 'search-2',
    name: 'Dambulla Cave Temple',
    category: 'Religious',
    address: 'Dambulla, Central Province',
    lat: 7.8567,
    lng: 80.6489,
    description: 'Ancient cave monastery with Buddha statues',
    isSelected: false
  },
  {
    id: 'search-3',
    name: 'Pinnawala Elephant Orphanage',
    category: 'Wildlife',
    address: 'Pinnawala, Sabaragamuwa Province',
    lat: 7.2983,
    lng: 80.3889,
    description: 'Elephant sanctuary and rehabilitation center',
    isSelected: false
  },
  {
    id: 'search-4',
    name: 'Unawatuna Beach',
    category: 'Beach',
    address: 'Unawatuna, Galle District',
    lat: 6.0108,
    lng: 80.2475,
    description: 'Golden sandy beach with coral reef',
    isSelected: false
  },
  {
    id: 'search-5',
    name: 'Adam\'s Peak (Sri Pada)',
    category: 'Nature',
    address: 'Ratnapura District, Sabaragamuwa Province',
    lat: 6.8095,
    lng: 80.4989,
    description: 'Sacred mountain peak pilgrimage site',
    isSelected: false
  },
  {
    id: 'search-6',
    name: 'Bentota Beach',
    category: 'Beach',
    address: 'Bentota, Galle District',
    lat: 6.4267,
    lng: 79.9961,
    description: 'Popular beach resort destination',
    isSelected: false
  },
  {
    id: 'search-7',
    name: 'Udawalawe National Park',
    category: 'Wildlife',
    address: 'Udawalawe, Ratnapura District',
    lat: 6.4372,
    lng: 80.8889,
    description: 'Elephant watching and safari destination',
    isSelected: false
  },
  {
    id: 'search-8',
    name: 'Polonnaruwa Ancient City',
    category: 'Historical',
    address: 'Polonnaruwa, North Central Province',
    lat: 7.9403,
    lng: 81.0188,
    description: 'Medieval capital with ancient ruins',
    isSelected: false
  }
];

export default function SearchBar({ onPlaceFound }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Mock search - filter results based on query
      const filtered = mockSearchResults.filter(place =>
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        place.category.toLowerCase().includes(query.toLowerCase()) ||
        place.address.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(filtered);
      setShowResults(true);
      setIsSearching(false);
    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleSelectPlace = (place: Place) => {
    // Generate unique ID for the selected place
    const newPlace = {
      ...place,
      id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isSelected: true
    };
    
    onPlaceFound(newPlace);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Historical': 'bg-amber-100 text-amber-800',
      'Religious': 'bg-purple-100 text-purple-800',
      'Nature': 'bg-green-100 text-green-800',
      'Wildlife': 'bg-orange-100 text-orange-800',
      'Beach': 'bg-blue-100 text-blue-800',
      'Hill Station': 'bg-indigo-100 text-indigo-800',
      'Cultural': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Search for More Places
      </h3>
      
      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search for attractions, beaches, temples, parks..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {searchResults.map((place) => (
              <div
                key={place.id}
                onClick={() => handleSelectPlace(place)}
                className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{place.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(place.category)}`}>
                        {place.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{place.address}</p>
                    {place.description && (
                      <p className="text-sm text-gray-500">{place.description}</p>
                    )}
                  </div>
                  <button className="ml-4 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200">
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {showResults && searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
          <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          <p className="text-sm text-gray-600">No places found for &ldquo;{searchQuery}&rdquo;</p>
            <p className="text-xs text-gray-500 mt-1">Try searching for beaches, temples, or national parks</p>
          </div>
        )}
      </div>

      {/* Search Tips */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Search Tips:</strong> Try searching for specific attractions like &ldquo;Sigiriya&rdquo;, categories like &ldquo;beach&rdquo; or &ldquo;temple&rdquo;, or locations like &ldquo;Kandy&rdquo; or &ldquo;Galle&rdquo;
        </p>
      </div>

      {/* Popular Searches */}
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Popular searches:</p>
        <div className="flex flex-wrap gap-2">
          {['Horton Plains', 'Dambulla Cave', 'Pinnawala', 'Unawatuna', 'Adam\'s Peak', 'Bentota'].map((term) => (
            <button
              key={term}
              onClick={() => {
                setSearchQuery(term);
                handleSearch(term);
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-700 rounded-full border border-gray-200 hover:border-emerald-200 transition-colors duration-200"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
