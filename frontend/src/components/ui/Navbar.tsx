'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Navbar component for the Trip Planner application
 * Features: Site title, responsive design, and authentication link
 */
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2 group">
              {/* Logo icon - you can replace with actual logo */}
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors duration-200">
                <span className="text-white font-bold text-sm">TP</span>
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                Trip Planner
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/destinations" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              Destinations
            </Link>
            <Link 
              href="/hotels" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              Hotels
            </Link>
            <Link 
              href="/trip" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              Plan Trip
            </Link>
            <Link 
              href="/login" 
              className="btn-secondary"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/destinations"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Destinations
              </Link>
              <Link 
                href="/hotels"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Hotels
              </Link>
              <Link 
                href="/trip"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Plan Trip
              </Link>
              <Link 
                href="/login"
                className="block mt-4 mx-3 text-center btn-secondary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
