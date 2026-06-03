'use client';

import { Place, Trip } from '@/types/trip';
import { useState } from 'react';

interface TripPlaceListProps {
  places: Place[];
  tripStatus: Trip['status'];
  tripId: string;
  onMarkDone: (placeId: string) => void;
  onRemovePlace: (placeId: string) => void;
  onStatusChange: (placeId: string, status: 'PLANNED' | 'DONE') => void;
}

type VisitStatus = 'DONE' | 'NEXT' | 'UPCOMING';

const TripPlaceList: React.FC<TripPlaceListProps> = ({ 
  places, 
  tripStatus, 
  tripId,
  onMarkDone, 
  onRemovePlace,
  onStatusChange
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  // Get visit status based on actual data
  const getPlaceStatus = (place: Place, index: number): VisitStatus => {
    if (place.visitStatus === 'DONE') return 'DONE';
    
    // If trip is completed, all places are done
    if (tripStatus === 'COMPLETED') return 'DONE';
    
    // If trip is planned, all places are upcoming
    if (tripStatus === 'PLANNED') return 'UPCOMING';
    
    // For IN_PROGRESS or PLANNING trips, find the first non-done place and mark it as NEXT
    const firstNonDoneIndex = places.findIndex(p => p.visitStatus !== 'DONE');
    if (index === firstNonDoneIndex) return 'NEXT';
    
    return 'UPCOMING';
  };

  const getStatusBadge = (status: VisitStatus) => {
    switch (status) {
      case 'DONE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'NEXT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'UPCOMING':
        return 'bg-gray-100 text-gray-600 border-gray-250';
    }
  };

  const getStatusIcon = (status: VisitStatus) => {
    switch (status) {
      case 'DONE':
        return '✅';
      case 'NEXT':
        return '🚀';
      case 'UPCOMING':
        return '📅';
    }
  };

  const handleStatusChange = async (placeId: string, status: 'PLANNED' | 'DONE') => {
    setLoadingStates(prev => ({ ...prev, [placeId]: true }));
    try {
      await onStatusChange(placeId, status);
    } catch (error) {
      console.error('Error changing status:', error);
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

  const getCategoryEmoji = (category: string) => {
    const icons: { [key: string]: string } = {
      'Historical Sites': '🏛️',
      'Religious Sites': '🛕',
      'Nature': '🌿',
      'Wildlife': '🦌',
      'Beaches': '🏖️',
      'Cultural Experiences': '🎭',
      'Scenic Views': '🌄',
      'Hill Country': '⛰️',
      'Waterfalls': '🌊',
      'Hiking': '🥾',
      'Adventure': '⚡'
    };
    return icons[category] || '📍';
  };

  // Calculate actual progress based on visit status
  const doneCount = places.filter(place => place.visitStatus === 'DONE').length;
  const totalPlaces = places.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-150 mb-6 overflow-hidden">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 text-left focus:outline-none group"
          >
            <h2 className="text-xl font-extrabold text-blue-950 group-hover:text-emerald-700 transition-colors">
              Places in Itinerary
            </h2>
            <svg 
              className={`w-5 h-5 text-gray-500 transform transition-transform group-hover:text-emerald-700 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
            {doneCount}/{totalPlaces} Visited
          </span>
        </div>
        
        <div className="flex items-center">
          <a
            href={`/path?tripId=${tripId}`}
            className="inline-flex items-center px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-gray-200 hover:border-emerald-300 text-xs font-bold rounded-lg shadow-sm hover:shadow active:scale-95 transition-all duration-150"
          >
            ✏️ Edit & Reorder Places
          </a>
        </div>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6 bg-gray-50 border border-gray-100 rounded-xl p-4">
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <span>Trip Progress</span>
              <span className="text-emerald-700">{Math.round((doneCount / totalPlaces) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200/80 rounded-full h-3 relative overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalPlaces > 0 ? (doneCount / totalPlaces) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Places List (Vertical Timeline Style) */}
          {places.length > 0 ? (
            <div className="relative border-l-2 border-blue-50/80 ml-5 pl-6 md:pl-8 space-y-6 py-2">
              {places.map((place, index) => {
                const status = getPlaceStatus(place, index);
                const isLoading = loadingStates[place.placeId];
                const isRemoving = loadingStates[`remove-${place.placeId}`];
                
                return (
                  <div key={place.placeId} className="relative group animate-fadeIn">
                    {/* Number Dot Anchor */}
                    <span 
                      className={`absolute -left-[37px] md:-left-[41px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-sm transition-all duration-200 z-10 ${
                        status === 'DONE' 
                          ? 'bg-emerald-500 text-white border-2 border-white' 
                          : status === 'NEXT'
                          ? 'bg-blue-600 text-white border-2 border-white animate-pulse'
                          : 'bg-white border-2 border-blue-200 text-blue-600'
                      }`}
                    >
                      {index + 1}
                    </span>

                    {/* Card container */}
                    <div 
                      className={`border rounded-2xl p-5 transition-all duration-200 ${
                        status === 'DONE' 
                          ? 'bg-emerald-50/20 border-emerald-100/60 shadow-sm' 
                          : status === 'NEXT'
                          ? 'bg-blue-50/10 border-blue-200 shadow-md ring-1 ring-blue-100'
                          : 'bg-gray-50/30 border-gray-150 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        {/* Info details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 
                              className={`text-lg font-bold transition-all ${
                                status === 'DONE' 
                                  ? 'line-through text-gray-400 font-medium' 
                                  : 'text-gray-900 font-extrabold'
                              }`}
                            >
                              {place.name}
                            </h3>
                            
                            <span 
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${getStatusBadge(status)}`}
                            >
                              <span className="mr-1">{getStatusIcon(status)}</span>
                              {status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500 font-medium">
                            <span className="inline-flex items-center text-emerald-800">
                              <span className="mr-1">{getCategoryEmoji(place.category)}</span>
                              {place.category}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="inline-flex items-center text-indigo-900">
                              📍 {place.district}
                            </span>
                            
                            {((place as any).estimatedCost) && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-emerald-600 font-bold">
                                  Rs. {((place as any).estimatedCost).toLocaleString()}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Description if present */}
                          {(place as any).description && (
                            <p 
                              className={`text-xs leading-relaxed italic max-w-xl font-normal ${
                                status === 'DONE' ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              "{((place as any).description)}"
                            </p>
                          )}
                        </div>

                        {/* Interactive Status Selector & Options */}
                        <div className="flex items-center space-x-3 self-end md:self-start">
                          {/* Beautiful Select Dropdown */}
                          <div className="relative">
                            {isLoading ? (
                              <div className="flex items-center justify-center w-24 py-1.5">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                              </div>
                            ) : (
                              <select
                                value={place.visitStatus || 'PLANNED'}
                                onChange={(e) => handleStatusChange(place.placeId, e.target.value as 'PLANNED' | 'DONE')}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500 transition-colors shadow-sm ${
                                  place.visitStatus === 'DONE'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                    : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                                }`}
                              >
                                <option value="PLANNED">📅 Planned</option>
                                <option value="DONE">✅ Completed</option>
                              </select>
                            )}
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => handleRemovePlace(place.placeId, place.name)}
                            disabled={isRemoving}
                            className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl disabled:opacity-50 transition-all duration-150"
                            title="Remove from itinerary"
                          >
                            {isRemoving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-250">
              <span className="text-4xl block mb-3">🏝️</span>
              <p className="text-sm font-semibold text-gray-600 mb-2">No places in your itinerary yet.</p>
              <a
                href={`/path?tripId=${tripId}`}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-colors"
              >
                ➕ Add Attractions Now
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TripPlaceList;
