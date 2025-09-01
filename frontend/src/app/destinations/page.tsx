import Link from 'next/link';

export default function DestinationsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Destinations</h2>
          <p className="mt-2 text-gray-600">Destinations listing will be implemented here</p>
          <Link href="/" className="mt-4 inline-block text-primary-600 hover:text-primary-500">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
