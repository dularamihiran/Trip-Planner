import express, { Request, Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Initialize S3 client with explicit region configuration
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1';
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: false, // Use virtual-hosted-style URLs
  useAccelerateEndpoint: false,
});

/**
 * POST /api/upload/single
 * Upload a single image to S3
 */
router.post('/single', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const bucketName = process.env.AWS_S3_BUCKET;
    if (!bucketName) {
      return res.status(500).json({ error: 'S3 bucket not configured' });
    }

    const folder = (req.body.folder as string) || 'uploads';
    const timestamp = Date.now();
    const sanitizedFileName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3Client.send(command);

    const url = `https://${bucketName}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    res.status(200).json({
      success: true,
      url,
      key,
    });
  } catch (error: any) {
    console.error('❌ Single Upload Error:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.Code || error.$metadata?.httpStatusCode);
    console.error('Full Error:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: error.message || 'Failed to upload image',
      details: {
        name: error.name,
        code: error.Code,
        region: AWS_REGION,
        bucket: process.env.AWS_S3_BUCKET
      }
    });
  }
});

/**
 * POST /api/upload/multiple
 * Upload multiple images to S3
 */
router.post('/multiple', upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const bucketName = process.env.AWS_S3_BUCKET;
    if (!bucketName) {
      return res.status(500).json({ error: 'S3 bucket not configured' });
    }

    const folder = (req.body.folder as string) || 'uploads';
    const uploadPromises = files.map(async (file) => {
      const timestamp = Date.now();
      const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `${folder}/${timestamp}-${uuidv4()}-${sanitizedFileName}`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);

      const url = `https://${bucketName}.s3.${AWS_REGION}.amazonaws.com/${key}`;

      return { url, key };
    });

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      files: results,
    });
  } catch (error: any) {
    console.error('❌ Multiple Upload Error:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.Code || error.$metadata?.httpStatusCode);
    console.error('Full Error:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: error.message || 'Failed to upload images',
      details: {
        name: error.name,
        code: error.Code,
        region: AWS_REGION,
        bucket: process.env.AWS_S3_BUCKET
      }
    });
  }
});

/**
 * GET /api/upload/health
 * Check if S3 upload is configured
 */
router.get('/health', (req: Request, res: Response) => {
  const isConfigured = !!(
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  );

  res.status(200).json({
    configured: isConfigured,
    bucket: process.env.AWS_S3_BUCKET || 'Not set',
    region: AWS_REGION,
  });
});

export default router;
