'use client';

import { Trip } from '@/types/trip';
import { useState } from 'react';

interface TripHeaderProps {
  trip: Trip;
  onStatusChange: (tripId: string, newStatus: Trip['status']) => void;
  onDownloadPDF: (trip: Trip) => void;
  onPrintItinerary: (trip: Trip) => void;
}

const TripHeader: React.FC<TripHeaderProps> = ({ trip, onStatusChange, onDownloadPDF, onPrintItinerary }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PLANNED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDisplay = (status: Trip['status']) => {
    switch (status) {
      case 'PLANNED':
        return 'Planned';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleStartTrip = async () => {
    if (trip.status !== 'PLANNED') return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(trip.tripId, 'IN_PROGRESS');
    } catch (error) {
      console.error('Error starting trip:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getDuration = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Trip Name and Status */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="flex-1 mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {trip.tripName}
          </h1>
          <div className="space-y-1">
            <p className="text-gray-600">
              <span className="font-medium">Start:</span> {formatDate(trip.startDate)}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">End:</span> {formatDate(trip.endDate)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:items-end gap-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(trip.status)}`}>
              {getStatusDisplay(trip.status)}
            </span>
            
            {/* Download/Print Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                title="Download & Print Options"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                  <button
                    onClick={() => {
                      onDownloadPDF(trip);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </button>
                  <button
                    onClick={() => {
                      onPrintItinerary(trip);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Itinerary
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {trip.status === 'PLANNED' && (
            <button
              onClick={handleStartTrip}
              disabled={isUpdating}
              className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-8V7a2 2 0 00-2-2H5a2 2 0 00-2 2v1m14 0h-5" />
                  </svg>
                  Start Trip
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Trip Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-xl font-bold text-emerald-600">{getDuration()}</div>
          <div className="text-xs text-gray-600">Days</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">{trip.places?.length || 0}</div>
          <div className="text-xs text-gray-600">Places</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600">{trip.districts?.length || 0}</div>
          <div className="text-xs text-gray-600">Districts</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-teal-600">
            {trip.places && trip.places.length > 0
              ? Math.round((trip.places.filter(p => p.visitStatus === 'DONE').length / trip.places.length) * 100)
              : 0}%
          </div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
      </div>

      {/* Premium Horizontal Progress Bar */}
      {trip.places && trip.places.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            <span>Overall Travel Progress</span>
            <span className="text-emerald-700">
              {trip.places.filter(p => p.visitStatus === 'DONE').length} of {trip.places.length} places visited
            </span>
          </div>
          <div className="w-full bg-gray-200/70 rounded-full h-3 overflow-hidden border border-gray-100">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${
                  ((trip.places.filter(p => p.visitStatus === 'DONE').length) /
                    trip.places.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Districts */}
      {trip.districts && trip.districts.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Districts Covered</h3>
          <div className="flex flex-wrap gap-2">
            {trip.districts.map((district) => (
              <span
                key={district}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
              >
                {district}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripHeader;
