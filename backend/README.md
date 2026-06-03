# Trip Planner Backend

Backend API for the Trip Planning Web Application built with Node.js, Express, TypeScript, and MongoDB.

## ✅ Status: CONNECTED TO MONGODB

The backend is now fully configured and connected to your MongoDB Atlas cluster!

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The server will run on http://localhost:5000
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Check if the API is running

### User Routes (`/api/users`)
- `POST /api/users/register` - Register a new user
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile

### Trip Routes (`/api/trips`)
- `GET /api/trips/user/:userId` - Get all trips for a user
- `GET /api/trips/:tripId` - Get single trip
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:tripId` - Update trip
- `DELETE /api/trips/:tripId` - Delete trip

### Admin Routes (`/api/admin`)
- `POST /api/admin/login` - Admin login
- `GET /api/admin` - Get all users (Admin only)
- `GET /api/admin/stats` - Get dashboard statistics
- `DELETE /api/admin/users/:userId` - Delete user (Admin only)

## 🗄️ Database: MongoDB Atlas
- **Status**: ✅ Connected
- **Database Name**: trip_planner
- **Collections**: users, trips, places

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── mongodb.ts        # MongoDB connection
│   ├── models/
│   │   └── index.ts          # TypeScript interfaces
│   ├── routes/
│   │   ├── adminRoutes.ts    # Admin endpoints
│   │   ├── userRoutes.ts     # User endpoints
│   │   └── tripRoutes.ts     # Trip endpoints
│   └── index.ts              # Express app entry point
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

## ✅ Testing

Visit `http://localhost:5000/health` to verify the server is running.

## 🔐 Environment Variables

Located in `.env` file (already configured with your MongoDB credentials)
