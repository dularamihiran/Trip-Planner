/**
 * Authentication utility functions
 */

export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  userId: string;
  email: string;
  name: string; // Primary name field from backend
  fullName?: string; // Optional secondary name field
  role: UserRole;
  token?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Check if user is logged in
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  return !!(user && token);
};

/**
 * Get current logged in user
 */
export const getCurrentUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Get user role
 */
export const getUserRole = (): UserRole | null => {
  const user = getCurrentUser();
  return user?.role || null;
};

/**
 * Check if user has specific role
 */
export const hasRole = (role: UserRole): boolean => {
  const userRole = getUserRole();
  return userRole === role;
};

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  return hasRole('ADMIN');
};

/**
 * Check if user is regular user
 */
export const isRegularUser = (): boolean => {
  return hasRole('USER');
};

/**
 * Login user
 */
export const login = (user: AuthUser, token: string) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};

/**
 * Logout user
 */
export const logout = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('tripData');
  localStorage.removeItem('suggestedPlaces');
  
  // Redirect to home
  window.location.href = '/';
};

/**
 * Get auth token
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('token');
};

/**
 * Require authentication - redirect to login if not authenticated
 */
export const requireAuth = (router?: any) => {
  if (!isAuthenticated()) {
    if (router) {
      router.push('/login');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return false;
  }
  return true;
};

/**
 * Require specific role - redirect if user doesn't have role
 */
export const requireRole = (role: UserRole, redirectPath: string = '/dashboard') => {
  if (!isAuthenticated()) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return false;
  }
  
  if (!hasRole(role)) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectPath;
    }
    return false;
  }
  
  return true;
};
