'use client';

import { Place, Trip } from '@/types/trip';
import { useState } from 'react';

interface TripPlaceListProps {
  places: Place[];
  tripStatus: Trip['status'];
  onMarkDone: (placeId: string) => void;
  onRemovePlace: (placeId: string) => void;
}

interface PlaceWithStatus extends Place {
  visitStatus?: 'DONE' | 'NEXT' | 'UPCOMING';
}

const TripPlaceList: React.FC<TripPlaceListProps> = ({ 
  places, 
  tripStatus, 
  onMarkDone, 
  onRemovePlace 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  // Mock visit status based on trip progress (in real app, this would come from API)
  const getPlaceStatus = (index: number): 'DONE' | 'NEXT' | 'UPCOMING' => {
    if (tripStatus === 'PLANNED') return 'UPCOMING';
    if (tripStatus === 'COMPLETED') return 'DONE';
    
    // For IN_PROGRESS trips, simulate some places being done
    if (index === 0) return 'DONE';
    if (index === 1) return 'NEXT';
    return 'UPCOMING';
  };

  const getStatusBadge = (status: 'DONE' | 'NEXT' | 'UPCOMING') => {
    switch (status) {
      case 'DONE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'NEXT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'UPCOMING':
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: 'DONE' | 'NEXT' | 'UPCOMING') => {
    switch (status) {
      case 'DONE':
        return (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'NEXT':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        );
      case 'UPCOMING':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const handleMarkDone = async (placeId: string) => {
    setLoadingStates(prev => ({ ...prev, [placeId]: true }));
    try {
      await onMarkDone(placeId);
    } catch (error) {
      console.error('Error marking place as done:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [placeId]: false }));
    }
  };

  const handleRemovePlace = async (placeId: string, placeName: string) => {
    const confirmed = window.confirm(`Are you sure you want to remove "${placeName}" from your itinerary?`);
    if (!confirmed) return;

    setLoadingStates(prev => ({ ...prev, [`remove-${placeId}`]: true }));
    try {
      await onRemovePlace(placeId);
    } catch (error) {
      console.error('Error removing place:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`remove-${placeId}`]: false }));
    }
  };

  const doneCount = places.filter((_, index) => getPlaceStatus(index) === 'DONE').length;
  const totalPlaces = places.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-900">Places in Itinerary</h2>
          <span className="bg-emerald-100 text-emerald-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {doneCount}/{totalPlaces} completed
          </span>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-6 pb-6">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round((doneCount / totalPlaces) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 relative">
              <div 
                className={`bg-emerald-600 h-2 rounded-full transition-all duration-300 ${
                  doneCount === 0 ? 'w-0' :
                  doneCount === totalPlaces ? 'w-full' :
                  doneCount / totalPlaces <= 0.25 ? 'w-1/4' :
                  doneCount / totalPlaces <= 0.5 ? 'w-1/2' :
                  doneCount / totalPlaces <= 0.75 ? 'w-3/4' : 'w-full'
                }`}
              ></div>
            </div>
          </div>

          {/* Places List */}
          {places.length > 0 ? (
            <div className="space-y-3">
              {places.map((place, index) => {
                const status = getPlaceStatus(index);
                const isLoading = loadingStates[place.placeId];
                const isRemoving = loadingStates[`remove-${place.placeId}`];
                
                return (
                  <div
                    key={place.placeId}
                    className={`p-4 border rounded-lg transition-all duration-200 ${
                      status === 'DONE' ? 'bg-green-50 border-green-200' :
                      status === 'NEXT' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Order Number */}
                        <div className="flex-shrink-0 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        
                        {/* Place Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`text-lg font-medium ${status === 'DONE' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {place.name}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(status)}`}>
                              {getStatusIcon(status)}
                              <span className="ml-1">{status}</span>
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span className="inline-flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {place.district}
                            </span>
                            <span className="bg-gray-200 px-2 py-0.5 rounded text-xs">
                              {place.category}
                            </span>
                            <span className="text-gray-400">
                              ({place.lat.toFixed(4)}, {place.lng.toFixed(4)})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 ml-4">
                        {status !== 'DONE' && tripStatus === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleMarkDone(place.placeId)}
                            disabled={isLoading}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded transition-colors duration-200"
                          >
                            {isLoading ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Done
                              </>
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleRemovePlace(place.placeId, place.name)}
                          disabled={isRemoving}
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded transition-colors duration-200"
                        >
                          {isRemoving ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p>No places in your itinerary yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TripPlaceList;
