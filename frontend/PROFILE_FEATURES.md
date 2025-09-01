# Profile Page (User Dashboard) Documentation

## Overview
The Profile Page provides a comprehensive user dashboard where users can manage their account information, view travel statistics, and update personal preferences for the Trip Planning Web Application.

## Features Implemented

### 🎭 **Avatar Management**
- **Default Avatar**: Auto-generated avatar using user's initials with emerald background
- **Upload Functionality**: Simulated image upload with preview (ready for backend integration)
- **File Validation**: Image type and size validation (max 5MB)
- **Responsive Design**: Circular avatar with hover effects and loading states

### 📝 **Profile Information Management**
- **Editable Fields**:
  - Full Name (required, min 2 characters)
  - Phone Number (required, validated format)
  - Country (dropdown with 50+ countries)
  - Bio/About Me (optional, max 500 characters)
- **Read-only Field**:
  - Email Address (shown but not editable)

### 📊 **Travel Statistics Dashboard**
- Total Trips count
- Completed Trips count
- Places Visited count
- Favorite Destination display
- Color-coded statistics cards

### 🎨 **User Interface Features**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Edit Mode**: Toggle between view and edit modes
- **Form Validation**: Real-time validation with error messages
- **Loading States**: Spinners and disabled states during operations
- **Error Handling**: Graceful error display with retry options

## Component Architecture

### 1. **ProfileCard** (`/components/ui/ProfileCard.tsx`)
- Main container component
- Manages edit/view state
- Handles avatar updates
- Displays user information and statistics

### 2. **AvatarUploader** (`/components/ui/AvatarUploader.tsx`)
- Profile picture management
- File upload simulation
- Image preview functionality
- Error handling for invalid files

### 3. **EditForm** (`/components/ui/EditForm.tsx`)
- Form validation and submission
- Input field management
- Country dropdown
- Character counting for bio field

### 4. **Profile Page** (`/app/profile/page.tsx`)
- Main page component
- Data loading and error states
- Integration with DashboardNavbar
- Additional account actions

## Data Management

### **Mock Data** (`/utils/mockUser.ts`)
```typescript
interface User {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  country: string;
  bio: string;
  profilePicture?: string;
  joinedDate: string;
  lastActive: string;
}

interface UserProfile {
  user: User;
  stats: {
    totalTrips: number;
    completedTrips: number;
    placesVisited: number;
    favoriteDestination: string;
  };
}
```

### **Validation Functions**
- `validatePhoneNumber()` - Phone format validation
- `validateEmail()` - Email format validation
- `getDefaultAvatar()` - Generates avatar URL from initials

## User Experience Flow

### **View Mode**
1. User navigates to `/profile`
2. Loading state displays while fetching user data
3. Profile information displayed with statistics
4. "Edit Profile" button available in top-right

### **Edit Mode**
1. User clicks "Edit Profile" button
2. Form fields become editable
3. Real-time validation on input changes
4. Save/Cancel buttons at bottom
5. Success feedback on successful update

### **Avatar Upload**
1. User clicks avatar or "Upload New Picture" button
2. File picker opens (image files only)
3. File validation (type, size)
4. Upload simulation with loading state
5. Preview updates immediately

## Navigation Integration

### **Navbar Links**
- Back to Dashboard (breadcrumb)
- Consistent with existing DashboardNavbar

### **Account Actions**
- View My Trips (links to dashboard)
- Change Password (placeholder for backend)
- Account Settings (placeholder for backend)

## Styling and Responsiveness

### **Design System**
- **Colors**: Emerald primary, gray neutrals, status colors
- **Typography**: Clear hierarchy with Tailwind font classes
- **Spacing**: Consistent padding and margins
- **Shadows**: Subtle elevation with shadow-lg

### **Responsive Breakpoints**
- **Mobile (< 640px)**: Single column layout, stacked elements
- **Tablet (640px - 1024px)**: Two-column grid for statistics
- **Desktop (> 1024px)**: Full layout with optimal spacing

### **Interactive Elements**
- Hover states on buttons and links
- Focus states for accessibility
- Loading animations and spinners
- Smooth transitions (200ms duration)

## Technical Implementation

### **State Management**
- React useState for component state
- Optimistic UI updates
- Error boundary handling

### **Form Handling**
- Controlled components
- Real-time validation
- Character counting
- Error message display

### **Image Handling**
- FileReader API for preview
- Next.js Image optimization
- External domain configuration (ui-avatars.com)

## Backend Integration Points

### **API Endpoints (Ready for Implementation)**
```typescript
// GET /api/user/profile - Fetch user profile
// PUT /api/user/profile - Update user profile
// POST /api/user/avatar - Upload profile picture
// PUT /api/user/password - Change password
```

### **Authentication**
- JWT token handling (commented placeholder code)
- Authorization headers for API calls
- Error handling for auth failures

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and alt text
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG compliant color combinations

## Testing Considerations

### **Manual Testing Checklist**
- [ ] Profile loads correctly
- [ ] Edit mode toggles properly
- [ ] Form validation works
- [ ] Avatar upload simulation
- [ ] Responsive design on all screen sizes
- [ ] Error states display correctly
- [ ] Navigation links work

### **Browser Compatibility**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## Future Enhancements

1. **Real Avatar Upload**: Backend integration for image storage
2. **Password Change**: Secure password update functionality
3. **Notification Preferences**: Email and push notification settings
4. **Travel Preferences**: Favorite activities, budget ranges, etc.
5. **Social Features**: Travel buddy connections, shared itineraries
6. **Privacy Settings**: Profile visibility controls

## Files Structure
```
/src
├── app/profile/page.tsx          # Main profile page
├── components/ui/
│   ├── ProfileCard.tsx           # Profile container component
│   ├── AvatarUploader.tsx        # Avatar management
│   └── EditForm.tsx              # Profile edit form
├── types/user.ts                 # TypeScript interfaces
└── utils/mockUser.ts             # Mock data and utilities
```

The Profile Page is now fully functional with comprehensive user management features, ready for backend integration and production deployment.
