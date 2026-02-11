/**
 * Admin utility functions
 */
import { AdminUser } from '@/types/admin';

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

// Admin login credentials (for development only - should be moved to backend authentication)
export const validateAdminCredentials = (email: string, password: string): boolean => {
  // TODO: Replace with real backend authentication
  const expectedEmail = 'admin@tripplanner.com';
  const expectedPassword = 'admin123';
  
  console.log('🔍 Validating credentials:');
  console.log('  Received email:', email);
  console.log('  Expected email:', expectedEmail);
  console.log('  Email match:', email === expectedEmail);
  console.log('  Received password:', password);
  console.log('  Expected password:', expectedPassword);
  console.log('  Password match:', password === expectedPassword);
  
  return email === expectedEmail && password === expectedPassword;
};
