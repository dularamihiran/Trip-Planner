# 🤖 Sri Lanka Smart Trip Planner - AI Recommendation Integration

This guide details the architecture, file structures, and steps to run and validate the newly integrated **AI-Powered Smart Recommendation Engine & Day-by-Day Itinerary Planner** for your Sri Lankan Trip Planner application.

---

## 🌟 How It Works

1. **User Preferences**: The user creates a trip via the frontend interface, choosing their **visited districts**, **interests**, **budget level**, and **travel dates (days duration)**.
2. **MongoDB Pre-Filtering**: The backend queries your **MongoDB Atlas Places collection** (containing your 100 seeded attractions), dynamically selects matches within the chosen districts, and filters them using a smart interest-to-category mapping (e.g. matching `'Adventure Sports'` to `'Adventure'` or `'Hiking'`).
3. **OpenAI Synthesis (`gpt-3.5-turbo`)**: The matching database places and user filters are formulated into an optimized system/user prompt and sent to OpenAI.
4. **Structured JSON Itinerary**: Using OpenAI's JSON output capability, the API retrieves a clean, geographically optimized day-by-day route timeline, accompanied by targeted reasoning on why each spot was selected.
5. **Interactive Map Integration**: The frontend maps these recommendations directly to your route paths, allowing users to instantly **Add/Remove** places to/from the active map canvas with a single click.

---

## 📁 Integrated Components

### 1. Backend Service & Endpoints (`backend/`)
- **API Endpoint**: `POST /api/ai/recommend-trip`
- **Environment Variables (`.env`)**:
  - Saved your secure key under `OPENAI_API_KEY`.
- **Core Files Added**:
  - [aiService.ts](file:///e:/Trip-planning-web/trip-planner/New-folder/backend/src/services/aiService.ts): Connects to the native MongoDB collection, handles category filtering with fallbacks, initializes the OpenAI client using `'gpt-3.5-turbo'`, and parses structured JSON.
  - [aiController.ts](file:///e:/Trip-planning-web/trip-planner/New-folder/backend/src/controllers/aiController.ts): Manages API validation checks and parses incoming requests.
  - [aiRoutes.ts](file:///e:/Trip-planning-web/trip-planner/New-folder/backend/src/routes/aiRoutes.ts): Registers the `/recommend-trip` endpoint.
- **Modified Files**:
  - [app.ts](file:///e:/Trip-planning-web/trip-planner/New-folder/backend/src/app.ts): Registered `/api/ai` namespace.

### 2. Frontend Recommendations UI (`frontend/`)
- **Core Files Added**:
  - [aiService.ts](file:///e:/Trip-planning-web/trip-planner/New-folder/frontend/src/services/aiService.ts): Frontend API client connecting to `http://localhost:5000/api/ai/recommend-trip`.
  - [AiRecommendations.tsx](file:///e:/Trip-planning-web/trip-planner/New-folder/frontend/src/components/ui/AiRecommendations.tsx): Gorgeous premium React component built with glassmorphism styling, loading skeleton views featuring rotating Sri Lankan travel trivia, detailed recommendations, and interactive day-by-day tabs connected to a vertical timeline.
- **Modified Files**:
  - [page.tsx](file:///e:/Trip-planning-web/trip-planner/New-folder/frontend/src/app/path/page.tsx): Embedded tab-switcher ("📍 Database Suggestions" vs "🤖 AI Smart Plan") and dynamically computes `daysCount` from dates in local storage.

---

## 🚀 How to Run & Verify

Since ports may be occupied on your local system, the dev servers are pre-configured to handle port collision gracefully:

### 1. Start the Backend API
Navigate to your backend directory and run:
```bash
cd backend
npm run dev
```
- **Port**: Listened on `http://localhost:5000`.
- **Status**: The backend will connect to your MongoDB Atlas cluster (`trip_planner` database) and initialize the routes.

### 2. Start the Frontend Application
Navigate to your frontend directory and run:
```bash
cd frontend
npm run dev
```
- **Port**: Next.js will automatically detect occupied ports and spin up on **`http://localhost:3001`** (or `http://localhost:3000` if free).
- **Status**: Ready for browser interactions.

---

## 🧪 Testing the AI Engine

1. Open your browser and navigate to the trip creation page (`/trip`).
2. Input a test trip:
   - **Name**: "Southern Sunshine Tour"
   - **Start/End Dates**: Select a 3-day duration.
   - **Districts**: Choose `Galle` and `Matara`.
   - **Interests**: Select `Beaches` and `Historical Sites`.
   - **Budget**: Select any budget (e.g. `Rs. 100,000 - Rs. 200,000`).
3. Click **Create Trip & Plan Route**.
4. You will be redirected to the Path Creation page (`/path`).
5. Click the **🤖 AI Smart Plan** tab on the left.
6. The loader will start cycling travel tips, and within seconds, your **personalized itinerary** and **attraction cards** will render beautifully.
7. Click **➕ Add to Path** on any AI recommended card to instantly render it on the map and calculate distances!
