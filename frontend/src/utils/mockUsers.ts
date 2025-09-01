import { AdminUser, AdminCredentials, AdminStats } from '@/types/admin';

export const mockAdminCredentials: AdminCredentials = {
  email: 'admin@tripplanner.com',
  password: 'admin123'
};

export const mockUsers: AdminUser[] = [
  {
    userId: 'user-001',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    role: 'USER',
    profilePicture: '',
    joinedDate: '2024-01-15',
    lastActive: '2025-08-28',
    isActive: true,
    tripsCount: 12,
    placesVisited: 45,
    country: 'United States',
    phoneNumber: '+1 (555) 123-4567'
  },
  {
    userId: 'user-002',
    fullName: 'Michael Chen',
    email: 'michael.chen@email.com',
    role: 'USER',
    profilePicture: '',
    joinedDate: '2024-02-20',
    lastActive: '2025-08-27',
    isActive: true,
    tripsCount: 8,
    placesVisited: 32,
    country: 'Canada',
    phoneNumber: '+1 (416) 987-6543'
  },
  {
    userId: 'user-003',
    fullName: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    role: 'MODERATOR',
    profilePicture: '',
    joinedDate: '2023-11-10',
    lastActive: '2025-08-28',
    isActive: true,
    tripsCount: 25,
    placesVisited: 78,
    country: 'United Kingdom',
    phoneNumber: '+44 20 7946 0958'
  },
  {
    userId: 'user-004',
    fullName: 'Raj Patel',
    email: 'raj.patel@email.com',
    role: 'USER',
    profilePicture: '',
    joinedDate: '2024-03-05',
    lastActive: '2025-08-26',
    isActive: true,
    tripsCount: 15,
    placesVisited: 62,
    country: 'India',
    phoneNumber: '+91 98765 43210'
  },
  {
    userId: 'user-005',
    fullName: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    role: 'USER',
    profilePicture: '',
    joinedDate: '2024-04-12',
    lastActive: '2025-08-25',
    isActive: false,
    tripsCount: 3,
    placesVisited: 12,
    country: 'Australia',
    phoneNumber: '+61 2 9876 5432'
  },
  {
    userId: 'user-006',
    fullName: 'David Rodriguez',
    email: 'david.rodriguez@email.com',
    role: 'USER',
    profilePicture: '',
    joinedDate: '2024-01-30',
    lastActive: '2025-08-28',
    isActive: true,
    tripsCount: 18,
    placesVisited: 55,
    country: 'Spain',
    phoneNumber: '+34 91 123 4567'
  },
  {
    userId: 'user-007',
    fullName: 'Sophie Martin',
    email: 'sophie.martin@email.com',
    role: 'USER',
    profilePicture: '',
    joinedDate: '2023-12-08',
    lastActive: '2025-08-27',
    isActive: true,
    tripsCount: 22,
    placesVisited: 68,
    country: 'France',
    phoneNumber: '+33 1 42 86 83 26'
  },
  {
    userId: 'user-008',
    fullName: 'James Thompson',
    email: 'james.thompson@email.com',
    role: 'ADMIN',
    profilePicture: '',
    joinedDate: '2023-10-01',
    lastActive: '2025-08-28',
    isActive: true,
    tripsCount: 35,
    placesVisited: 95,
    country: 'United States',
    phoneNumber: '+1 (555) 987-6543'
  }
];

export const mockAdminStats: AdminStats = {
  totalUsers: mockUsers.length,
  activeUsers: mockUsers.filter(user => user.isActive).length,
  totalTrips: mockUsers.reduce((sum, user) => sum + user.tripsCount, 0),
  totalBookings: 156
};

export const getDefaultAvatar = (name: string): string => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&background=059669&color=fff&size=200`;
};

export const getRoleBadgeColor = (role: AdminUser['role']): string => {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'MODERATOR':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'USER':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const validateAdminCredentials = (email: string, password: string): boolean => {
  return email === mockAdminCredentials.email && password === mockAdminCredentials.password;
};
