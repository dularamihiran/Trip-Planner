import { Traveler } from '@/types/user';

export const mockTravelers: Traveler[] = [
  {
    id: 'traveler-001',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    userType: 'traveler',
    joinedDate: '2024-01-15'
  },
  {
    id: 'traveler-002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    userType: 'traveler',
    joinedDate: '2024-02-10'
  }
];

export const addTraveler = (traveler: Omit<Traveler, 'id' | 'joinedDate'>): Traveler => {
  const newTraveler: Traveler = {
    ...traveler,
    id: `traveler-${Date.now()}`,
    joinedDate: new Date().toISOString()
  };
  mockTravelers.push(newTraveler);
  return newTraveler;
};

export const authenticateTraveler = (email: string, password: string): Traveler | null => {
  return mockTravelers.find(traveler => 
    traveler.email === email && traveler.password === password
  ) || null;
};
