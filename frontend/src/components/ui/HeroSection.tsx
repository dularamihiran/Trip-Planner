'use client';

import Link from 'next/link';

/**
 * Hero Section component for the home page
 * Features: Main heading, subtitle, CTA button, and background styling
 */
export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-8 animate-fade-in-up">
          <span className="w-2 h-2 bg-primary-600 rounded-full mr-2 animate-pulse"></span>
          Plan Your Perfect Sri Lankan Adventure
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up animation-delay-300">
          Plan Your Perfect Trip in{' '}
          <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent">
            Sri Lanka
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-600">
          Discover breathtaking attractions, book comfortable hotels, and explore optimized routes easily. 
          Your gateway to the pearl of the Indian Ocean awaits.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-900">
          <Link href="/trip" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
            Start Planning
            <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          
          <Link href="/destinations" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
            Explore Destinations
          </Link>
        </div>

        {/* Stats or features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-1200">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">200+</div>
            <div className="text-gray-600">Tourist Attractions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">500+</div>
            <div className="text-gray-600">Hotels & Resorts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">24/7</div>
            <div className="text-gray-600">Customer Support</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
