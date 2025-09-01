'use client';

import { FilterOptions } from '@/app/hotels/page';

interface FilterBarProps {
  filters: FilterOptions;
  districts: string[];
  onFilterChange: (filters: FilterOptions) => void;
  resultCount: number;
}

export default function FilterBar({ filters, districts, onFilterChange, resultCount }: FilterBarProps) {
  const handleDistrictChange = (district: string) => {
    onFilterChange({ ...filters, district });
  };

  const handleSortChange = (sortBy: string) => {
    onFilterChange({ ...filters, sortBy });
  };

  const handleSearchChange = (searchQuery: string) => {
    onFilterChange({ ...filters, searchQuery });
  };

  const handleClearFilters = () => {
    onFilterChange({ district: 'all', sortBy: 'name', searchQuery: '' });
  };

  const formatDistrictName = (district: string) => {
    return district === 'all' ? 'All Districts' : district;
  };

  const getSortLabel = (sortBy: string) => {
    switch (sortBy) {
      case 'name': return 'Name (A-Z)';
      case 'price-low': return 'Price (Low to High)';
      case 'price-high': return 'Price (High to Low)';
      case 'rating': return 'Rating (High to Low)';
      default: return 'Sort by';
    }
  };

  const hasActiveFilters = filters.district !== 'all' || filters.searchQuery !== '' || filters.sortBy !== 'name';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Search Bar */}
        <div className="flex-1 lg:max-w-md">
          <div className="relative">
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search hotels by name or location..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* District Filter */}
          <div>
            <label htmlFor="district-filter" className="block text-sm font-medium text-gray-700 mb-1">
              District
            </label>
            <select
              id="district-filter"
              value={filters.district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {districts.map((district) => (
                <option key={district} value={district}>
                  {formatDistrictName(district)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              id="sort-filter"
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="rating">Rating (High to Low)</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{resultCount}</span> hotel{resultCount !== 1 ? 's' : ''} 
            {filters.district !== 'all' && (
              <span> in <span className="font-semibold">{filters.district}</span></span>
            )}
            {filters.searchQuery && (
              <span> matching "<span className="font-semibold">{filters.searchQuery}</span>"</span>
            )}
          </div>

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              {filters.district !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                  {filters.district}
                  <button
                    onClick={() => handleDistrictChange('all')}
                    className="ml-1 text-emerald-600 hover:text-emerald-800"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {filters.sortBy !== 'name' && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {getSortLabel(filters.sortBy)}
                  <button
                    onClick={() => handleSortChange('name')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {filters.searchQuery && (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  Search: {filters.searchQuery}
                  <button
                    onClick={() => handleSearchChange('')}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
