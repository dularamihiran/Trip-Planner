# Trip Planning Web Application for Sri Lanka

A comprehensive trip planning platform that allows tourists to plan customized trips by selecting districts, categories (beaches, hiking, ancient sites), and number of days. The system suggests tourist places, enables users to manage favorite places, generates optimized routes on maps, and provides hotel booking and transport options.

## 🌟 Features

- **District & Category Search**: Find attractions by district and category (beaches, hiking, ancient sites)
- **Trip Planning**: Add/remove favorite places to build personalized trip itineraries
- **Route Optimization**: Generate optimized paths using Google Maps API
- **Hotel Booking**: Hotels can register through the platform, users can book accommodations
- **Authentication**: Secure signup/login with AWS Cognito (tourists, hotel owners, admin)
- **Media Storage**: Hotel & place images stored in AWS S3
- **Responsive Design**: Modern UI that works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Google Maps API** for route visualization

### Backend
- **Node.js** with **TypeScript**
- **Express.js** for API framework
- **AWS SDK** for cloud services integration

### Database & Storage
- **AWS DynamoDB** (NoSQL database)
- **AWS S3** (image storage)

### Authentication & Security
- **AWS Cognito** for user authentication

### Infrastructure & Deployment
- **AWS CDK** for infrastructure as code
- **AWS Lambda** for serverless functions
- **API Gateway** for API management
- **Vercel/AWS Amplify** for frontend deployment

## 📁 Project Structure

```
trip-planner/
├── frontend/          # Next.js React application
│   ├── src/
│   │   ├── app/       # Next.js App Router pages
│   │   └── components/ # Reusable UI components
│   ├── package.json
│   └── tailwind.config.js
├── backend/           # Node.js + TypeScript API
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── routes/     # API route definitions
│   │   ├── services/   # Business logic
│   │   └── models/     # Data models
│   └── package.json
├── cdk/              # AWS CDK infrastructure
│   ├── lib/          # CDK stack definitions
│   └── bin/          # CDK app entry point
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- AWS CLI configured
- AWS CDK CLI installed

### Frontend Development

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

### Backend Development

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### AWS Infrastructure

1. Navigate to CDK directory:
   ```bash
   cd cdk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Deploy infrastructure:
   ```bash
   cdk deploy
   ```

## 🔌 API Endpoints (Planned)

### Places & Attractions
- `GET /api/places?district=Colombo&category=beaches` - Get places by district and category
- `GET /api/places/:id` - Get specific place details
- `POST /api/places` - Add new place (admin only)

### Trip Planning
- `POST /api/trips` - Save user's trip plan
- `GET /api/trips/:userId` - Get user's saved trips
- `PUT /api/trips/:id` - Update trip plan
- `DELETE /api/trips/:id` - Delete trip plan

### Hotels
- `GET /api/hotels?district=Kandy` - Get hotels by district
- `POST /api/hotels` - Register hotel (hotel owner)
- `POST /api/bookings` - Book a hotel
- `GET /api/bookings/:userId` - Get user's bookings

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

## 🎨 UI Components

### Current Implementation
- ✅ **Navbar**: Responsive navigation with site branding and authentication link
- ✅ **Hero Section**: Modern landing section with gradient background and call-to-action
- ✅ **Layout**: Root layout with proper metadata and font loading

### Planned Components
- 🔄 Search filters for districts and categories
- 🔄 Place cards with images and details
- 🔄 Interactive map with route visualization
- 🔄 Trip itinerary builder
- 🔄 Hotel booking forms
- 🔄 User authentication forms

## 🌏 Sri Lanka Districts & Categories

### Districts
- Colombo, Kandy, Galle, Anuradhapura, Polonnaruwa, Sigiriya, Ella, Nuwara Eliya, Bentota, Mirissa, Arugam Bay, Yala, and more...

### Categories
- **Beaches**: Coastal attractions and water activities
- **Hiking**: Mountain trails and nature walks
- **Ancient Sites**: Historical temples and archaeological sites
- **Wildlife**: National parks and safari experiences
- **Cultural**: Museums, cultural centers, and local experiences

## 🔧 Development Status

### Completed ✅
- Project structure setup
- Next.js frontend with TypeScript and Tailwind CSS
- Responsive home page with modern UI
- Navigation structure
- Development environment configuration

### In Progress 🔄
- Backend API development
- Database schema design
- AWS infrastructure setup

### Planned 📝
- Google Maps integration
- Authentication implementation
- Image upload functionality
- Hotel booking system
- Trip optimization algorithms

## 📄 License

This project is part of a 3rd-year university assignment and is for educational purposes.

---

**Note**: This is an active development project. Features and documentation will be updated as development progresses.
