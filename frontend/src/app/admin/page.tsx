'use client';

import { useState, useEffect } from 'react';
import AdminLogin from '@/components/ui/AdminLogin';
import UserTable from '@/components/ui/UserTable';
import UserDetailsModal from '@/components/ui/UserDetailsModal';
import { AdminUser, AdminStats } from '@/types/admin';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if user is already authenticated (in a real app, check JWT token)
  useEffect(() => {
    const checkAuth = () => {
      // For demo purposes, check sessionStorage
      const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
      setIsAuthenticated(isLoggedIn);
    };
    checkAuth();
  }, []);

  // Load users data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadUsersData();
    }
  }, [isAuthenticated]);

  const loadUsersData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch real users from backend admin endpoint
      const usersResponse = await fetch('http://localhost:5000/api/admin', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken') || ''}`
        },
      });

      // 2. Fetch admin stats from database stats endpoint
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken') || ''}`
        },
      });

      if (!usersResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch admin dashboard details');
      }

      const usersData = await usersResponse.json();
      const statsData = await statsResponse.json();

      const apiUsers = usersData.data || [];
      const dbStats = statsData.data || { totalUsers: 0, activeUsers: 0, totalTrips: 0 };

      // Transform backend users to AdminUser format
      const transformedUsers: AdminUser[] = apiUsers.map((user: any) => ({
        userId: user.userId,
        fullName: user.name || user.fullName || 'User',
        email: user.email,
        role: user.role || 'USER',
        profilePicture: user.profilePicture || '',
        joinedDate: user.createdAt,
        lastActive: user.updatedAt || user.createdAt,
        isActive: user.isActive !== false,
        tripsCount: user.tripsCount || 0, // Loaded dynamically from database count in backend!
        placesVisited: 0,
        country: user.country || 'Sri Lanka',
        phoneNumber: user.phone || 'Not specified'
      }));

      setUsers(transformedUsers);
      setStats({
        totalUsers: dbStats.totalUsers,
        activeUsers: dbStats.activeUsers,
        totalTrips: dbStats.totalTrips
      });
    } catch (error) {
      console.error('Error loading users:', error);
      // Set empty state on error
      setUsers([]);
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalTrips: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    // For demo purposes, store in sessionStorage
    sessionStorage.setItem('adminLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminLoggedIn');
    setUsers([]);
    setStats(null);
  };

  const handleViewDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      // Call backend API to delete user
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken') || ''}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      console.log('✅ Admin - User deleted:', userId);
      
      // Remove from local state
      setUsers(prev => prev.filter(user => user.userId !== userId));
      
      // Update stats
      const removedUser = users.find(user => user.userId === userId);
      if (removedUser && stats) {
        setStats(prev => prev ? {
          ...prev,
          totalUsers: Math.max(0, prev.totalUsers - 1),
          activeUsers: removedUser.isActive ? Math.max(0, prev.activeUsers - 1) : prev.activeUsers,
          totalTrips: Math.max(0, prev.totalTrips - (removedUser.tripsCount || 0))
        } : null);
      }

      alert('✅ User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Failed to delete user. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };



  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              </div>


            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Overview of platform statistics, active users, and travel itineraries</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Users Section */}
        <div className="mb-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
              <button
                onClick={loadUsersData}
                disabled={loading}
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2M15 15v5h.582m0 0a8.001 8.001 0 01-15.356-2M15 15v-5a8 8 0 00-15.356 2" />
                    </svg>
                    Refresh Data
                  </>
                )}
              </button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : (
              /* Users Table */
              <UserTable
                users={users}
                onViewDetails={handleViewDetails}
                onRemoveUser={handleRemoveUser}
              />
            )}
          </div>
        </div>

      </main>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
