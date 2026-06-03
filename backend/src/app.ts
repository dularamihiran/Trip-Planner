import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { initializeMongoDB } from './config/mongodb';

// Import routes
import userRoutes from './routes/userRoutes';
import tripRoutes from './routes/tripRoutes';
import adminRoutes from './routes/adminRoutes';
import aiRoutes from './routes/aiRoutes';

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    process.env.CORS_ORIGIN || ''
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}

// Root route welcome message
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to the Smart Trip Planner API',
    status: 'Running',
    healthCheck: `http://localhost:${PORT}/health`,
    version: '1.0.0'
  });
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Smart Trip Planner API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'MongoDB',
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    path: req.path,
  });
});

// Global error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message,
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message || 'Authentication required',
    });
  }

  // Default error response
  return res.status(error.status || 500).json({
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Start server (only if not in Lambda environment)
if (process.env.NODE_ENV !== 'production' || !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  // Initialize MongoDB before starting server
  initializeMongoDB()
    .then(() => {
      console.log('✅ Database initialized successfully');

      app.listen(PORT, () => {
        console.log('='.repeat(60));
        console.log(`🚀 Smart Trip Planner API Server`);
        console.log(`📍 Server running on: http://localhost:${PORT}`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📊 Database: MongoDB (${process.env.DB_NAME || 'trip_planner'})`);
        console.log('='.repeat(60));
      });
    })
    .catch((error) => {
      console.error('❌ Failed to initialize database:', error);
      process.exit(1);
    });
}

// Export app for Lambda handler
export default app;
