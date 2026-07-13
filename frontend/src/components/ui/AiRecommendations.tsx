import React, { useState, useEffect } from 'react';
import { getAiRecommendations, AiRecommendationResponse, RecommendedPlace } from '../../services/aiService';

// Define the Place structure as expected by the path planning page
interface AppPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  description?: string;
  isSelected: boolean;
  estimatedCost?: number;
}

interface AiRecommendationsProps {
  districts: string[];
  interests: string[];
  budget: string;
  days: number;
  suggestedPlaces: AppPlace[]; // Filtered database places from parent
  selectedPlaces: AppPlace[]; // Selected places in current path
  onAddToPath: (place: AppPlace) => void;
  onRemoveFromPath: (placeId: string) => void;
  onApplyItinerary: (itineraryPlaces: AppPlace[]) => void;
}

const loadingTips = [
  "🗺️ Mapping historic landmarks in Colombo, Kandy, and Galle...",
  "🍃 Calculating scenic tea plantation paths and mountain hikes...",
  "🐘 Finding wildlife sanctuaries and safari routes in Yala and Bundala...",
  "🚗 Grouping locations geographically to minimize driving time on Sri Lankan roads...",
  "💰 Matching attractions against your budget level...",
  "☀️ Designing the ultimate tropical itinerary just for you...",
];

export default function AiRecommendations({
  districts,
  interests,
  budget,
  days,
  suggestedPlaces,
  selectedPlaces,
  onAddToPath,
  onRemoveFromPath,
  onApplyItinerary,
}: AiRecommendationsProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<AiRecommendationResponse | null>(null);
  const [activeDay, setActiveDay] = useState<string>('day1');
  const [tipIndex, setTipIndex] = useState<number>(0);

  // Cycle through travel tips while loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Fetch AI Recommendations
  const fetchAiPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAiRecommendations({
        districts,
        interests,
        budget,
        days,
      });

      setRecommendations(response);
      
      // Reset active day to day1
      if (response && response.itinerary) {
        const daysKeys = Object.keys(response.itinerary);
        if (daysKeys.length > 0) {
          setActiveDay(daysKeys[0]);
        }
      }
    } catch (err: any) {
      console.error('Error loading AI Recommendations:', err);
      setError(err.message || 'Failed to load AI Recommendations. Please ensure the backend is running and your OpenAI API key is valid.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger recommendation load on mount or filters change
  useEffect(() => {
    if (districts && districts.length > 0) {
      fetchAiPlan();
    }
  }, [districts, interests, budget, days]);

  // Helper to find a database place by name
  const findDbPlaceByName = (name: string): AppPlace | undefined => {
    if (!name) return undefined;
    
    // Attempt exact match or substring match
    return suggestedPlaces.find(
      (p) => 
        p.name.toLowerCase().trim() === name.toLowerCase().trim() ||
        p.name.toLowerCase().trim().includes(name.toLowerCase().trim()) ||
        name.toLowerCase().trim().includes(p.name.toLowerCase().trim())
    );
  };

  // Helper to check if a suggested place is already selected in the route path
  const isPlaceSelected = (name: string): boolean => {
    const dbPlace = findDbPlaceByName(name);
    if (!dbPlace) return false;
    return selectedPlaces.some((p) => p.id === dbPlace.id);
  };

  // Toggle place addition to path
  const handleTogglePlace = (name: string) => {
    const dbPlace = findDbPlaceByName(name);
    if (!dbPlace) {
      alert(`Could not find coordinates for "${name}" in database places. You can search for it in the search bar below!`);
      return;
    }
    
    const isSelected = selectedPlaces.some((p) => p.id === dbPlace.id);
    if (isSelected) {
      onRemoveFromPath(dbPlace.id);
    } else {
      onAddToPath(dbPlace);
    }
  };

  // Add all recommended attractions for the current day to path
  const handleAddDayPlacesToPath = (dayPlaces: string[]) => {
    let addedCount = 0;
    dayPlaces.forEach((name) => {
      const dbPlace = findDbPlaceByName(name);
      if (dbPlace && !selectedPlaces.some((p) => p.id === dbPlace.id)) {
        onAddToPath(dbPlace);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      alert(`Added ${addedCount} places from current day to your trip plan!`);
    } else {
      alert('All places for this day are already in your trip plan!');
    }
  };

  // Loading State UI
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8 text-center animate-pulse">
        <div className="flex flex-col items-center justify-center space-y-6 py-12">
          {/* Animated Spinner with Gradient ring */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-xl">🤖</div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">AI Travel Assistant is planning...</h3>
            <p className="text-emerald-700 font-medium text-sm transition-opacity duration-500 ease-in-out">
              {loadingTips[tipIndex]}
            </p>
          </div>

          {/* Skeleton Loaders */}
          <div className="w-full space-y-3 mt-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-24 bg-gray-100 rounded-lg"></div>
              <div className="h-24 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State UI
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">AI Recommendation Failed</h3>
          <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">{error}</p>
          <button
            onClick={fetchAiPlan}
            className="inline-flex items-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow transition-colors"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // No Recommendations yet (e.g. user hasn't selected filters)
  if (!recommendations) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="py-8">
          <span className="text-4xl">🌴</span>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Generate Your AI Travel Plan</h3>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Choose your districts and interests in the form to get personalized, AI-optimized itineraries.
          </p>
        </div>
      </div>
    );
  }

  const { recommendedPlaces, itinerary } = recommendations;
  const daysKeys = Object.keys(itinerary || {});

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: RECOMMENDED ATTRACTIONS */}
      <div className="bg-white rounded-2xl shadow-xl border border-emerald-50 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-6 gap-2">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
              <span className="mr-2">⭐</span> AI-Recommended Attractions
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Personalized matches selected based on your selected interests
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-100 uppercase tracking-wider">
            🤖 GPT-4o-Mini Powered
          </span>
        </div>

        {/* Recommendations Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedPlaces.map((place: RecommendedPlace, index: number) => {
            const dbPlace = findDbPlaceByName(place.name);
            const isSelected = isPlaceSelected(place.name);
            
            return (
              <div
                key={index}
                className="group relative flex flex-col justify-between bg-gradient-to-br from-white to-emerald-50/20 border border-gray-100 hover:border-emerald-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                      {place.name}
                    </h3>
                    {dbPlace && (
                      <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full border border-gray-200">
                        {dbPlace.category}
                      </span>
                    )}
                  </div>
                  
                  {dbPlace && (
                    <p className="text-gray-500 text-xs font-medium mb-3 flex items-center">
                      <span className="mr-1">📍</span> {dbPlace.address} District
                      {dbPlace.estimatedCost !== undefined && dbPlace.estimatedCost > 0 ? (
                        <span className="ml-2 px-1.5 py-0.2 bg-emerald-100/50 text-emerald-800 text-[10px] font-bold rounded">
                          LKR {dbPlace.estimatedCost.toLocaleString()}
                        </span>
                      ) : (
                        <span className="ml-2 px-1.5 py-0.2 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">
                          Free
                        </span>
                      )}
                    </p>
                  )}

                  <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">
                    "{place.reason}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100/60 pt-4 mt-auto">
                  {dbPlace && (
                    <button
                      onClick={() => handleTogglePlace(place.name)}
                      className={`inline-flex items-center text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${
                        isSelected
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-100'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <span className="mr-1">➖</span> Remove from Path
                        </>
                      ) : (
                        <>
                          <span className="mr-1">➕</span> Add to Path
                        </>
                      )}
                    </button>
                  )}
                  {!dbPlace && (
                    <span className="text-[11px] text-amber-600 font-medium italic flex items-center">
                      ⚠️ Search to locate on Map
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: DAY-BY-DAY SUGGESTED ITINERARY */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-50 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-6 gap-2">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
              <span className="mr-2">🗓️</span> Suggested Day-by-Day Itinerary
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Geographically optimized route path across your travel duration
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {itinerary && (
              <button
                onClick={() => {
                  const itineraryPlaces: AppPlace[] = [];
                  daysKeys.forEach((dayKey) => {
                    if (itinerary[dayKey]) {
                      itinerary[dayKey].forEach((placeName) => {
                        const dbPlace = findDbPlaceByName(placeName);
                        if (dbPlace && !itineraryPlaces.some(p => p.id === dbPlace.id)) {
                          itineraryPlaces.push(dbPlace);
                        }
                      });
                    }
                  });
                  
                  if (itineraryPlaces.length === 0) {
                    alert('No matching database places found to apply.');
                    return;
                  }
                  
                  onApplyItinerary(itineraryPlaces);
                }}
                className="text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow transition-colors flex items-center"
              >
                ⚡ Apply AI Itinerary to Route
              </button>
            )}

            {itinerary && itinerary[activeDay] && (
              <button
                onClick={() => handleAddDayPlacesToPath(itinerary[activeDay])}
                className="text-xs font-semibold px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-200 transition-colors"
              >
                🚀 Add Active Day to Path
              </button>
            )}
          </div>
        </div>

        {/* Day Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {daysKeys.map((dayKey) => {
            const isActive = activeDay === dayKey;
            const dayNumber = dayKey.replace('day', '');
            
            return (
              <button
                key={dayKey}
                onClick={() => setActiveDay(dayKey)}
                className={`px-5 py-2.5 font-bold text-sm rounded-xl border transition-all duration-200 flex items-center ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1.5">📅</span> Day {dayNumber}
              </button>
            );
          })}
        </div>

        {/* Active Day Timeline */}
        <div className="relative border-l-2 border-dashed border-blue-200 ml-4 pl-6 md:pl-8 space-y-8 py-2">
          {itinerary && itinerary[activeDay] && itinerary[activeDay].length > 0 ? (
            itinerary[activeDay].map((placeName: string, index: number) => {
              const dbPlace = findDbPlaceByName(placeName);
              const isSelected = isPlaceSelected(placeName);
              
              return (
                <div key={index} className="relative group">
                  {/* Timeline Dot Icon */}
                  <span className="absolute -left-11 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-blue-500 text-xs font-bold text-blue-600 shadow-sm z-10">
                    {index + 1}
                  </span>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 group-hover:bg-blue-50/20 border border-gray-100 group-hover:border-blue-100 rounded-xl p-4 transition-all duration-200">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                        {placeName}
                      </h4>
                      {dbPlace ? (
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1 font-medium">
                          <span>📍 {dbPlace.address}</span>
                          <span>•</span>
                          <span>🏷️ {dbPlace.category}</span>
                          {dbPlace.description && (
                            <>
                              <span>•</span>
                              <span className="text-gray-600 line-clamp-1 italic font-normal">
                                "{dbPlace.description}"
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-amber-600 italic font-medium mt-1">
                          Custom attraction recommended by AI (Not in default list)
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {dbPlace ? (
                        <button
                          onClick={() => handleTogglePlace(placeName)}
                          className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                            isSelected
                              ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                              : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                          }`}
                        >
                          {isSelected ? '➖ Remove' : '➕ Add to Path'}
                        </button>
                      ) : (
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200">
                          AI custom place
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No attractions scheduled for this day by the AI planner.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
