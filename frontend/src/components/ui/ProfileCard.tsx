'use client';

import { useState } from 'react';
import { User, UserProfile } from '@/types/user';
import AvatarUploader from './AvatarUploader';
import EditForm from './EditForm';
import { getDefaultAvatar } from '@/utils/mockUser';

interface ProfileCardProps {
  userProfile: UserProfile;
  onProfileUpdate: (updatedUser: User) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userProfile, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(userProfile.user);

  const handleAvatarChange = (newAvatar: string) => {
    const updatedUser = { ...currentUser, profilePicture: newAvatar };
    setCurrentUser(updatedUser);
    onProfileUpdate(updatedUser);
  };

  const handleSaveChanges = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    onProfileUpdate(updatedUser);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setCurrentUser(userProfile.user); // Reset to original data
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const avatarSrc = currentUser.profilePicture || getDefaultAvatar(currentUser.fullName);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 px-8 py-6">
        <div className="flex flex-col items-center text-white">
          <AvatarUploader
            currentAvatar={currentUser.profilePicture || ''}
            userName={currentUser.fullName}
            onAvatarChange={handleAvatarChange}
          />
          
          {!isEditing && (
            <div className="text-center mt-4">
              <h1 className="text-2xl font-bold">{currentUser.fullName}</h1>
              <p className="text-emerald-100 text-sm">{currentUser.email}</p>
              <p className="text-emerald-100 text-xs mt-1">
                Member since {formatDate(currentUser.createdAt)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-8 py-6">
        {isEditing ? (
          /* Edit Mode */
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Edit Profile</h2>
              <p className="text-gray-600 text-sm">Update your personal information below.</p>
            </div>
            
            <EditForm
              user={currentUser}
              onSave={handleSaveChanges}
              onCancel={handleCancelEdit}
            />
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {/* Profile Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                    <p className="text-gray-900 font-medium">{currentUser.fullName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-gray-900">{currentUser.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                    <p className="text-gray-900">{currentUser.phoneNumber || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Country</label>
                    <p className="text-gray-900">{currentUser.country || 'Not provided'}</p>
                  </div>
                </div>

                {/* Travel Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Travel Statistics</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-emerald-600">{userProfile.stats.totalTrips}</div>
                      <div className="text-sm text-emerald-800">Total Trips</div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{userProfile.stats.completedTrips}</div>
                      <div className="text-sm text-blue-800">Completed</div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{userProfile.stats.placesVisited}</div>
                      <div className="text-sm text-purple-800">Places Visited</div>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{userProfile.stats.favoriteDestination}</div>
                      <div className="text-sm text-orange-800">Favorite District</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {currentUser.bio && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About Me</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{currentUser.bio}</p>
                </div>
              </div>
            )}

            {/* Activity Info */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Last active: {currentUser.lastActive ? formatDate(currentUser.lastActive) : 'Recently'}</span>
                <span>Joined: {formatDate(currentUser.createdAt)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
