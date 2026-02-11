'use client';

import Image from 'next/image';
import { AdminUser } from '@/types/admin';
import { getDefaultAvatar, formatDate } from '@/utils/adminUtils';

interface UserDetailsModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  const avatarSrc = user.profilePicture || getDefaultAvatar(user.fullName);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close modal"
            aria-label="Close user details modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
              <Image
                src={avatarSrc}
                alt={`${user.fullName}'s profile`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getDefaultAvatar(user.fullName);
                }}
              />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900">{user.fullName}</h4>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center mt-1">
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
                    user.role === 'ADMIN'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : user.role === 'MODERATOR'
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }`}
                >
                  {user.role}
                </span>
                <span
                  className={`ml-2 inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Personal Information
            </h5>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Phone Number:</span>
                <span className="text-sm font-medium text-gray-900">{user.phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Country:</span>
                <span className="text-sm font-medium text-gray-900">{user.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Joined Date:</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(user.joinedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Active:</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(user.lastActive)}</span>
              </div>
            </div>
          </div>

          {/* Travel Statistics */}
          <div>
            <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Travel Statistics
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-emerald-600">{user.tripsCount}</div>
                <div className="text-xs text-emerald-800">Total Trips</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-600">{user.placesVisited}</div>
                <div className="text-xs text-blue-800">Places Visited</div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Account Status
            </h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Status:</span>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User ID:</span>
                <span className="text-xs font-mono text-gray-500">{user.userId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Close
          </button>
          <button
            onClick={() => alert('Edit user functionality will be implemented with backend')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Edit User
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
