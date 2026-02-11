import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const region = process.env.AWS_REGION || 'eu-north-1';
const bucketName = process.env.PHOTOS_BUCKET;

if (!bucketName) {
  console.warn('⚠️  PHOTOS_BUCKET environment variable not set');
}

// Create S3 client
const s3Client = new S3Client({
  region,
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
});

/**
 * Generate a presigned URL for uploading a file to S3
 * @param filename - Original filename (will be sanitized and made unique)
 * @param contentType - MIME type of the file (e.g., 'image/jpeg')
 * @param folder - Optional folder path in the bucket (e.g., 'hotels', 'avatars')
 * @returns Object containing uploadUrl and fileKey
 */
export const createUploadUrl = async (
  filename: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<{ uploadUrl: string; fileKey: string; fileUrl: string }> => {
  if (!bucketName) {
    throw new Error('PHOTOS_BUCKET is not configured');
  }

  // Sanitize filename and add UUID to prevent conflicts
  const ext = filename.split('.').pop() || 'jpg';
  const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueFilename = `${uuidv4()}-${sanitizedName}`;
  const fileKey = `${folder}/${uniqueFilename}`;

  // Create PutObject command
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    ContentType: contentType,
    // Optional: Add metadata
    Metadata: {
      originalFilename: filename,
      uploadedAt: new Date().toISOString(),
    },
  });

  // Generate presigned URL (expires in 5 minutes)
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  // Generate the public URL (assumes bucket is public or has proper ACL)
  const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;

  return {
    uploadUrl, // Use this URL to upload the file
    fileKey, // Store this key in DynamoDB
    fileUrl, // This is the public URL to access the file
  };
};

/**
 * Generate a presigned URL for uploading a hotel image
 * @param filename - Original filename
 * @param contentType - MIME type
 * @returns Upload URL and file information
 */
export const createHotelImageUploadUrl = async (
  filename: string,
  contentType: string = 'image/jpeg'
): Promise<{ uploadUrl: string; fileKey: string; fileUrl: string }> => {
  return createUploadUrl(filename, contentType, 'hotels');
};

/**
 * Generate a presigned URL for uploading a user avatar
 * @param filename - Original filename
 * @param contentType - MIME type
 * @returns Upload URL and file information
 */
export const createAvatarUploadUrl = async (
  filename: string,
  contentType: string = 'image/jpeg'
): Promise<{ uploadUrl: string; fileKey: string; fileUrl: string }> => {
  return createUploadUrl(filename, contentType, 'avatars');
};

/**
 * Generate a presigned URL for uploading a place/destination image
 * @param filename - Original filename
 * @param contentType - MIME type
 * @returns Upload URL and file information
 */
export const createPlaceImageUploadUrl = async (
  filename: string,
  contentType: string = 'image/jpeg'
): Promise<{ uploadUrl: string; fileKey: string; fileUrl: string }> => {
  return createUploadUrl(filename, contentType, 'places');
};

/**
 * Generate multiple presigned URLs for batch upload
 * @param files - Array of file information
 * @param folder - Folder path in bucket
 * @returns Array of upload URLs
 */
export const createBatchUploadUrls = async (
  files: Array<{ filename: string; contentType: string }>,
  folder: string = 'uploads'
): Promise<Array<{ uploadUrl: string; fileKey: string; fileUrl: string }>> => {
  const uploadPromises = files.map((file) =>
    createUploadUrl(file.filename, file.contentType, folder)
  );
  return Promise.all(uploadPromises);
};

export default {
  createUploadUrl,
  createHotelImageUploadUrl,
  createAvatarUploadUrl,
  createPlaceImageUploadUrl,
  createBatchUploadUrls,
};
