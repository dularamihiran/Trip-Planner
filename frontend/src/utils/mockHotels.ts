import { Hotel, HotelOwner } from '@/types/user';

export const mockHotelOwners: HotelOwner[] = [
  {
    id: 'owner-001',
    ownerName: 'Resort Manager',
    email: 'owner@hotel.com',
    password: 'owner123',
    userType: 'hotel_owner',
    hotelName: 'Paradise Resort',
    location: 'Colombo',
    contactNumber: '+94 11 123 4567',
    joinedDate: '2024-01-10',
    hotels: []
  }
];

export const mockHotels: Hotel[] = [
  {
    id: 'hotel-001',
    name: 'Paradise Resort',
    district: 'Colombo',
    address: '123 Beach Road, Colombo 03',
    price: 15000,
    rooms: 50,
    description: 'A beautiful beachfront resort with stunning ocean views and world-class amenities.',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    ownerId: 'owner-001',
    createdDate: '2024-01-15'
  }
];

// Sri Lankan districts for dropdown
export const sriLankanDistricts = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
  'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa',
  'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

export const addHotelOwner = (owner: Omit<HotelOwner, 'id' | 'joinedDate' | 'hotels'>): HotelOwner => {
  const newOwner: HotelOwner = {
    ...owner,
    id: `owner-${Date.now()}`,
    joinedDate: new Date().toISOString(),
    hotels: []
  };
  mockHotelOwners.push(newOwner);
  return newOwner;
};

export const addHotel = (hotel: Omit<Hotel, 'id' | 'createdDate'>, ownerId: string): Hotel => {
  const newHotel: Hotel = {
    ...hotel,
    id: `hotel-${Date.now()}`,
    ownerId,
    createdDate: new Date().toISOString()
  };
  
  mockHotels.push(newHotel);
  
  // Add to owner's hotels array
  const owner = mockHotelOwners.find(o => o.id === ownerId);
  if (owner) {
    owner.hotels.push(newHotel);
  }
  
  return newHotel;
};

export const updateHotel = (hotelId: string, updates: Partial<Hotel>): Hotel | null => {
  const hotelIndex = mockHotels.findIndex(h => h.id === hotelId);
  if (hotelIndex === -1) return null;
  
  mockHotels[hotelIndex] = { ...mockHotels[hotelIndex], ...updates };
  
  // Update in owner's hotels array as well
  const owner = mockHotelOwners.find(o => o.id === mockHotels[hotelIndex].ownerId);
  if (owner) {
    const ownerHotelIndex = owner.hotels.findIndex(h => h.id === hotelId);
    if (ownerHotelIndex !== -1) {
      owner.hotels[ownerHotelIndex] = mockHotels[hotelIndex];
    }
  }
  
  return mockHotels[hotelIndex];
};

export const deleteHotel = (hotelId: string): boolean => {
  const hotelIndex = mockHotels.findIndex(h => h.id === hotelId);
  if (hotelIndex === -1) return false;
  
  const hotel = mockHotels[hotelIndex];
  
  // Remove from main array
  mockHotels.splice(hotelIndex, 1);
  
  // Remove from owner's hotels array
  const owner = mockHotelOwners.find(o => o.id === hotel.ownerId);
  if (owner) {
    const ownerHotelIndex = owner.hotels.findIndex(h => h.id === hotelId);
    if (ownerHotelIndex !== -1) {
      owner.hotels.splice(ownerHotelIndex, 1);
    }
  }
  
  return true;
};

export const getHotelsByOwner = (ownerId: string): Hotel[] => {
  return mockHotels.filter(hotel => hotel.ownerId === ownerId);
};

export const authenticateHotelOwner = (email: string, password: string): HotelOwner | null => {
  return mockHotelOwners.find(owner => 
    owner.email === email && owner.password === password
  ) || null;
};
