'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { getDefaultAvatar } from '@/utils/mockUser';

interface AvatarUploaderProps {
  currentAvatar: string;
  userName: string;
  onAvatarChange: (newAvatar: string) => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatar,
  userName,
  onAvatarChange
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setUploading(true);

    // Simulate upload process with FileReader for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Simulate upload delay
      setTimeout(() => {
        onAvatarChange(result);
        setUploading(false);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const avatarSrc = currentAvatar || getDefaultAvatar(userName);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
          {uploading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <Image
              src={avatarSrc}
              alt={`${userName}'s profile`}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default avatar if image fails to load
                e.currentTarget.src = getDefaultAvatar(userName);
              }}
            />
          )}
        </div>
        
        {/* Upload Overlay */}
        {!uploading && (
          <button
            onClick={handleUploadClick}
            className="absolute inset-0 w-32 h-32 rounded-full bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center group"
            title="Change profile picture"
          >
            <svg 
              className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </button>
        )}
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUploadClick}
        disabled={uploading}
        className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Uploading...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload New Picture
          </>
        )}
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload profile picture"
      />

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Choose a photo that represents you well. JPG, PNG or GIF. Max size 5MB.
      </p>
    </div>
  );
};

export default AvatarUploader;
