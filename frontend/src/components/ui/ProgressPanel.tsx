'use client';

import { Place } from '@/types/trip';

interface ProgressPanelProps {
  places: Place[];
  currentStopIndex: number;
  completedPlaces: string[];
  onMarkDone: () => void;
  onSkipStop: () => void;
  onRecenterMap: () => void;
  googleMapsLink: string;
  isCompleted: boolean;
}

export default function ProgressPanel({
  places,
  currentStopIndex,
  completedPlaces,
  onMarkDone,
  onSkipStop,
  onRecenterMap,
  googleMapsLink,
  isCompleted
}: ProgressPanelProps) {
  const getPlaceStatus = (place: Place, index: number) => {
    if (completedPlaces.includes(place.placeId)) {
      return 'DONE';
    } else if (index === currentStopIndex) {
      return 'CURRENT';
    } else if (index < currentStopIndex) {
      return 'SKIPPED';
    } else {
      return 'UPCOMING';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-600 text-green-100';
      case 'CURRENT':
        return 'bg-yellow-600 text-yellow-100';
      case 'SKIPPED':
        return 'bg-gray-600 text-gray-100';
      case 'UPCOMING':
        return 'bg-gray-700 text-gray-300';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        );
      case 'CURRENT':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        );
      case 'SKIPPED':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        );
      case 'UPCOMING':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const currentPlace = places[currentStopIndex];
  const progressPercentage = ((completedPlaces.length + (currentStopIndex > completedPlaces.length ? currentStopIndex - completedPlaces.length : 0)) / places.length) * 100;

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Trip Progress</h2>
          <span className="text-sm text-gray-400">
            {Math.min(currentStopIndex + 1, places.length)}/{places.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>{completedPlaces.length} completed</span>
          <span>{Math.round(progressPercentage)}% done</span>
        </div>
      </div>

      {/* Action Buttons */}
      {!isCompleted && currentPlace && (
        <div className="p-4 border-b border-gray-700 space-y-3">
          <div className="text-sm text-gray-300 mb-2">
            <span className="font-medium">Current Stop:</span>
            <div className="text-white font-semibold">{currentPlace.name}</div>
            <div className="text-gray-400 text-xs">{currentPlace.district}</div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={onMarkDone}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark Current Stop Done
            </button>

            <button
              onClick={onSkipStop}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Skip Stop
            </button>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {isCompleted && (
        <div className="p-4 border-b border-gray-700">
          <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-400 mb-1">Trip Completed!</h3>
            <p className="text-sm text-green-300">Congratulations on finishing your Sri Lankan adventure!</p>
          </div>
        </div>
      )}

      {/* Places List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">All Stops</h3>
          <div className="space-y-2">
            {places.map((place, index) => {
              const status = getPlaceStatus(place, index);
              const statusColor = getStatusColor(status);
              const statusIcon = getStatusIcon(status);

              return (
                <div
                  key={place.placeId}
                  className={`p-3 rounded-lg border transition-colors duration-200 ${
                    status === 'CURRENT' 
                      ? 'bg-yellow-600/20 border-yellow-500/50' 
                      : 'bg-gray-700/50 border-gray-600'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 flex items-center">
                      <div className="w-6 h-6 bg-gray-600 text-gray-300 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                        {index + 1}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusColor}`}>
                        {statusIcon}
                        <span>{status}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{place.name}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                        <span>{place.district}</span>
                        <span>•</span>
                        <span className="bg-gray-600 px-2 py-0.5 rounded">{place.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <button
          onClick={onRecenterMap}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Recenter Map
        </button>

        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
