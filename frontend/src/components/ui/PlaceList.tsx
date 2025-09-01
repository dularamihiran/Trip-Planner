'use client';

import { useState } from 'react';
import { Place } from '@/app/path/page';

interface PlaceListProps {
  title: string;
  places: Place[];
  onAddToPath: (place: Place) => void;
  onRemoveFromPath: (placeId: string) => void;
  selectedPlaces: Place[];
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export default function PlaceList({ 
  title, 
  places, 
  onAddToPath, 
  onRemoveFromPath, 
  selectedPlaces,
  onReorder 
}: PlaceListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
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
    <div className="space-y-6">
      {/* Suggested Places */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {places.map((place) => (
            <div
              key={place.id}
              className={`p-4 border rounded-lg transition-all duration-200 ${
                place.isSelected 
                  ? 'border-emerald-200 bg-emerald-50' 
                  : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
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
                
                <div className="ml-4">
                  {place.isSelected ? (
                    <button
                      onClick={() => onRemoveFromPath(place.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => onAddToPath(place)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Add to Path
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Path */}
      {selectedPlaces.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Travel Path ({selectedPlaces.length} places)
          </h3>
          <div className="space-y-3">
            {selectedPlaces.map((place, index) => (
              <div
                key={`selected-${place.id}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="p-4 border border-emerald-200 bg-emerald-50 rounded-lg cursor-move hover:bg-emerald-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{place.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(place.category)}`}>
                        {place.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{place.address}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <button
                      onClick={() => onRemoveFromPath(place.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove from path"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Drag and drop places to reorder your travel path for optimal routing!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
