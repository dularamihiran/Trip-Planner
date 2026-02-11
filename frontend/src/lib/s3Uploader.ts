/**
 * Secure S3 Upload via Backend API
 * This file now calls the backend API for image uploads instead of directly accessing S3.
 * AWS credentials are kept secure on the server side.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Upload a single file to S3 via backend API
 * @param file - The file to upload
 * @param folder - Optional folder path in S3 bucket (e.g., 'hotels')
 * @returns The public URL of the uploaded file
 */
export const uploadToS3 = async (file: File, folder: string = "hotels"): Promise<string> => {
  try {
    // Validate file first
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create FormData
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    // Send to backend API
    const response = await fetch(`${API_URL}/upload/single`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload file');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};

/**
 * Upload multiple files to S3 via backend API
 * @param files - Array of files to upload
 * @param folder - Optional folder path in S3 bucket
 * @returns Array of public URLs
 */
export const uploadMultipleToS3 = async (files: File[], folder: string = "hotels"): Promise<string[]> => {
  try {
    // Validate all files first
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new Error(`${file.name}: ${validation.error}`);
      }
    }

    // Create FormData
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('folder', folder);

    // Send to backend API
    const response = await fetch(`${API_URL}/upload/multiple`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload files');
    }

    const data = await response.json();
    return data.files.map((file: { url: string }) => file.url);
  } catch (error) {
    console.error('Multiple Upload Error:', error);
    throw error;
  }
};

/**
 * Validate file before upload
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns Validation result
 */
export const validateImageFile = (file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
};
