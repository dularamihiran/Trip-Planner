import { Trip, Place } from '@/types/trip';

// Mock data for demonstration
export const mockTrips: Trip[] = [
  {
    tripId: 'trip-001',
    tripName: 'Cultural Heritage Tour',
    startDate: '2025-09-15',
    endDate: '2025-09-22',
    districts: ['Kandy', 'Anuradhapura', 'Polonnaruwa'],
    places: [
      {
        placeId: 'place-001',
        name: 'Temple of the Tooth',
        district: 'Kandy',
        category: 'Religious',
        lat: 7.2906,
        lng: 80.6337
      },
      {
        placeId: 'place-002',
        name: 'Sigiriya Rock Fortress',
        district: 'Matale',
        category: 'Historical',
        lat: 7.9571,
        lng: 80.7600
      },
      {
        placeId: 'place-003',
        name: 'Ancient City of Polonnaruwa',
        district: 'Polonnaruwa',
        category: 'Historical',
        lat: 7.9403,
        lng: 81.0188
      },
      {
        placeId: 'place-004',
        name: 'Dambulla Cave Temple',
        district: 'Matale',
        category: 'Religious',
        lat: 7.8567,
        lng: 80.6493
      }
    ],
    status: 'PLANNED'
  },
  {
    tripId: 'trip-002',
    tripName: 'Southern Coast Adventure',
    startDate: '2025-10-01',
    endDate: '2025-10-08',
    districts: ['Galle', 'Matara', 'Hambantota'],
    places: [
      {
        placeId: 'place-005',
        name: 'Galle Fort',
        district: 'Galle',
        category: 'Historical',
        lat: 6.0328,
        lng: 80.2168
      },
      {
        placeId: 'place-006',
        name: 'Mirissa Beach',
        district: 'Matara',
        category: 'Beach',
        lat: 5.9487,
        lng: 80.4564
      },
      {
        placeId: 'place-007',
        name: 'Yala National Park',
        district: 'Hambantota',
        category: 'Wildlife',
        lat: 6.3725,
        lng: 81.5185
      },
      {
        placeId: 'place-008',
        name: 'Unawatuna Beach',
        district: 'Galle',
        category: 'Beach',
        lat: 6.0104,
        lng: 80.2493
      },
      {
        placeId: 'place-009',
        name: 'Kataragama Temple',
        district: 'Hambantota',
        category: 'Religious',
        lat: 6.4139,
        lng: 81.3336
      }
    ],
    status: 'IN_PROGRESS'
  },
  {
    tripId: 'trip-003',
    tripName: 'Hill Country Escape',
    startDate: '2025-08-10',
    endDate: '2025-08-17',
    districts: ['Nuwara Eliya', 'Badulla', 'Kandy'],
    places: [
      {
        placeId: 'place-010',
        name: 'Horton Plains National Park',
        district: 'Nuwara Eliya',
        category: 'Nature',
        lat: 6.8069,
        lng: 80.7906
      },
      {
        placeId: 'place-011',
        name: 'Nine Arch Bridge',
        district: 'Badulla',
        category: 'Scenic',
        lat: 6.8731,
        lng: 81.0555
      },
      {
        placeId: 'place-012',
        name: 'Tea Plantation Tour',
        district: 'Nuwara Eliya',
        category: 'Cultural',
        lat: 6.9497,
        lng: 80.7891
      }
    ],
    status: 'COMPLETED'
  },
  {
    tripId: 'trip-004',
    tripName: 'Colombo City Break',
    startDate: '2025-11-05',
    endDate: '2025-11-07',
    districts: ['Colombo'],
    places: [
      {
        placeId: 'place-013',
        name: 'Gangaramaya Temple',
        district: 'Colombo',
        category: 'Religious',
        lat: 6.9220,
        lng: 79.8560
      },
      {
        placeId: 'place-014',
        name: 'National Museum',
        district: 'Colombo',
        category: 'Cultural',
        lat: 6.9108,
        lng: 79.8608
      }
    ],
    status: 'PLANNED'
  },
  {
    tripId: 'trip-005',
    tripName: 'Wildlife Safari Adventure',
    startDate: '2025-12-01',
    endDate: '2025-12-05',
    districts: ['Hambantota', 'Puttalam'],
    places: [
      {
        placeId: 'place-015',
        name: 'Yala National Park',
        district: 'Hambantota',
        category: 'Wildlife',
        lat: 6.3725,
        lng: 81.5185
      },
      {
        placeId: 'place-016',
        name: 'Wilpattu National Park',
        district: 'Puttalam',
        category: 'Wildlife',
        lat: 8.5374,
        lng: 80.0306
      }
    ],
    status: 'PLANNED'
  }
];

// PDF Export Helper (stub implementation)
export const downloadTripPDF = async (tripId: string): Promise<void> => {
  try {
    // Find the trip
    const trip = mockTrips.find(t => t.tripId === tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    // TODO: Implement actual PDF generation using a library like jsPDF or react-pdf
    // For now, we'll create a simple text representation and trigger download
    
    const pdfContent = generateTripPDFContent(trip);
    
    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trip.tripName.replace(/\s+/g, '_')}_Itinerary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`PDF generation triggered for trip: ${trip.tripName}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

// Generate text content for PDF (placeholder)
const generateTripPDFContent = (trip: Trip): string => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  let content = `
TRIP ITINERARY
==============

Trip Name: ${trip.tripName}
Duration: ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}
Status: ${trip.status}
Districts: ${trip.districts.join(', ')}

PLACES TO VISIT (${trip.places.length})
================
`;

  trip.places.forEach((place, index) => {
    content += `
${index + 1}. ${place.name}
   Category: ${place.category}
   District: ${place.district}
   Location: ${place.lat}, ${place.lng}
`;
  });

  content += `

Generated on: ${new Date().toLocaleString()}
Trip Planner App - Sri Lanka Travel Guide
`;

  return content;
};

// API call helper - fetch trips from MongoDB backend
export const fetchUserTrips = async (): Promise<Trip[]> => {
  try {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('No user found in localStorage');
      return [];
    }

    const user = JSON.parse(userStr);
    const userId = user.userId;

    if (!userId) {
      console.log('No userId found');
      return [];
    }

    // Fetch trips from backend
    const response = await fetch(`http://localhost:5000/api/trips/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch trips');
    }
    
    const data = await response.json();
    console.log('Trips fetched from backend:', data);
    
    // Backend returns { trips: [...] }
    return data.trips || [];
  } catch (error) {
    console.error('Error fetching trips:', error);
    return [];
  }
};
