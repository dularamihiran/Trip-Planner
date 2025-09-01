'use client';

import { FilterOptions, TripStatus, SortOrder } from '@/types/trip';
import { useState } from 'react';

interface TripFilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  totalTrips: number;
  filteredTrips: number;
}

const TripFilterBar: React.FC<TripFilterBarProps> = ({
  filters,
  onFiltersChange,
  totalTrips,
  filteredTrips
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleStatusChange = (status: TripStatus | "ALL") => {
    onFiltersChange({ ...filters, status });
    setIsDropdownOpen(false);
  };

  const handleSortChange = (sortBy: SortOrder) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const getStatusDisplayName = (status: TripStatus | "ALL") => {
    switch (status) {
      case "ALL":
        return "All Statuses";
      case "PLANNED":
        return "Planned";
      case "IN_PROGRESS":
        return "In Progress";
      case "COMPLETED":
        return "Completed";
      default:
        return status;
    }
  };

  const statusOptions: (TripStatus | "ALL")[] = ["ALL", "PLANNED", "IN_PROGRESS", "COMPLETED"];

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'ALL',
      sortBy: 'desc'
    });
  };

  const hasActiveFilters = filters.search !== '' || filters.status !== 'ALL';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left side - Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search trips by name..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {getStatusDisplayName(filters.status)}
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      filters.status === status ? 'bg-emerald-50 text-emerald-900' : 'text-gray-900'
                    }`}
                  >
                    {getStatusDisplayName(status)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>

        {/* Right side - Sort and Results */}
        <div className="flex items-center gap-4">
          {/* Results Counter */}
          <div className="text-sm text-gray-500">
            Showing {filteredTrips} of {totalTrips} trips
          </div>

          {/* Sort Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by date:</span>
            <button
              onClick={() => handleSortChange(filters.sortBy === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
            >
              {filters.sortBy === 'asc' ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  Oldest
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                  Newest
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Search: &ldquo;{filters.search}&rdquo;
                <button
                  onClick={() => handleSearchChange('')}
                  className="ml-1 text-emerald-600 hover:text-emerald-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.status !== 'ALL' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {getStatusDisplayName(filters.status)}
                <button
                  onClick={() => handleStatusChange('ALL')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Click outside handler */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default TripFilterBar;
