import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/ui/HeroSection';

/**
 * Home Page Component
 * Features: Navbar, Hero section with CTA, responsive design
 */
export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Additional sections can be added here */}
      {/* Features Section, Popular Destinations, etc. */}
    </main>
  );
}
