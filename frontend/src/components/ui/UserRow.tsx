'use client';

import Image from 'next/image';
import { AdminUser } from '@/types/admin';
import { getDefaultAvatar, getRoleBadgeColor, formatDate } from '@/utils/mockUsers';

interface UserRowProps {
  user: AdminUser;
  onViewDetails: (user: AdminUser) => void;
  onRemoveUser: (userId: string) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, onViewDetails, onRemoveUser }) => {
  const avatarSrc = user.profilePicture || getDefaultAvatar(user.fullName);

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove ${user.fullName}? This action cannot be undone.`)) {
      onRemoveUser(user.userId);
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Profile Picture */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
          <Image
            src={avatarSrc}
            alt={`${user.fullName}'s profile`}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = getDefaultAvatar(user.fullName);
            }}
          />
        </div>
      </td>

      {/* Name and Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
          <div className="flex items-center mt-1 space-x-2">
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                user.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className="text-xs text-gray-500">
              Last active: {formatDate(user.lastActive)}
            </span>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.email}</div>
        <div className="text-sm text-gray-500">{user.country}</div>
      </td>

      {/* Role */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}
        >
          {user.role}
        </span>
      </td>

      {/* Stats */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex flex-col">
          <span className="font-medium">{user.tripsCount} trips</span>
          <span className="text-gray-500">{user.placesVisited} places</span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onViewDetails(user)}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200"
            title="View user details"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </button>
          
          {user.role !== 'ADMIN' && (
            <button
              onClick={handleRemove}
              className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200"
              title="Remove user"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default UserRow;
