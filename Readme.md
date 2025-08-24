   ---

# 🎓 University Connect - Complete Student Platform

A comprehensive full-stack web platform designed to connect university students, showcase their skills, and provide certification opportunities. Built with React.js frontend and Node.js backend with MongoDB database.

---

## 🌟 Features Overview

### 🔐 Authentication System
- **User Registration & Login** - Secure JWT-based authentication
- **Profile Management** - Complete profile setup with multiple sections
- **Password Security** - Encrypted password storage with bcrypt

### 👥 Student Connect
- **Student Discovery** - Browse all registered students with search functionality
- **Profile Viewing** - Detailed student profiles with all information
- **Real-time Chat** - Socket.io powered messaging system
- **Online Status** - See who's currently online
- **Profile Completion Tracking** - Progress indicators for profile setup

### 🏆 Certification System
- **Multiple Categories** - React, Java, Python, JavaScript, Data Structures, Algorithms, Web Development
- **Mixed Question Types** - MCQ and Coding questions
- **Timed Examinations** - 30-minute time limits with auto-submission
- **Certificate Generation** - Downloadable PDF certificates
- **Badge System** - Bronze, Silver, Gold, Platinum badges based on performance
- **Progress Tracking** - View all earned certifications

### 🛣️ AI-Powered Learning Roadmaps
- **Personalized Learning Plans** - AI-generated learning roadmaps based on your goals and experience level
- **Day-by-Day Structure** - Detailed daily learning plans with estimated time commitments
- **Resource Links** - Curated learning resources for each topic (documentation, videos, tutorials)
- **Theme Options** - Light and dark theme support for better user experience
- **Progress Tracking** - Track your progress through the roadmap

### 💼 Talent Marketplace
- **Service Listings** - Students can offer their skills as services
- **Category-based Services** - Web Development, Mobile Apps, Tutoring, etc.
- **Service Discovery** - Browse and search available services
- **Contact Integration** - Direct messaging for service inquiries

### 💬 Real-time Messaging
- **One-on-one Chat** - Private messaging between students
- **Message History** - Persistent chat conversations
- **Online Indicators** - Real-time online/offline status
- **Message Notifications** - Unread message counts

### 📝 Profile Builder
- **Multi-step Setup** - Guided profile creation process
- **Complete Information** - Personal info, education, experience, projects, social links
- **Skills Management** - Add and manage technical skills
- **Project Showcase** - Display projects with GitHub/live demo links
- **Social Integration** - LinkedIn, GitHub, Instagram, Portfolio links
- **Profile Images** - Custom profile picture support

---

## 🛠️ Tech Stack

### Frontend (React + Vite)
```json
{
  "framework": "React 18 with Vite",
  "styling": "Tailwind CSS",
  "animations": "Framer Motion",
  "http": "Axios",
  "routing": "React Router DOM",
  "realtime": "Socket.io Client",
  "pdf": "jsPDF",
  "icons": "React Icons",
  "ui": "Custom components"
}
```

### Backend (Node.js + Express)
```json
{
  "framework": "Express.js",
  "database": "MongoDB with Mongoose",
  "authentication": "JWT (JSON Web Tokens)",
  "realtime": "Socket.io",
  "password": "bcryptjs",
  "pdf": "PDFKit",
  "cors": "CORS middleware",
  "validation": "Express validation"
}
```

---

## 📁 Project Structure

```
Minor-Project-University-Connect/
├── frontend/                          # React frontend application
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── components/               # Reusable React components
│   │   │   ├── CertificationBadge.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProfileBuilder.jsx
│   │   │   └── ServiceCard.jsx
│   │   ├── pages/                    # Main application pages
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Login.jsx            # Authentication
│   │   │   ├── Register.jsx         # User registration
│   │   │   ├── StudentConnect.jsx   # Student discovery
│   │   │   ├── ProfilePage.jsx      # Public profile view
│   │   │   ├── MyProfile.jsx        # User's own profile
│   │   │   ├── ProfileSetup.jsx     # Profile creation/editing
│   │   │   ├── Certifications.jsx   # Certification tests
│   │   │   ├── TalentMarketplace.jsx # Service marketplace
│   │   │   └── Messages.jsx         # Chat interface
│   │   ├── services/                # API service files
│   │   │   ├── chatService.js
│   │   │   └── api/
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # App entry point
│   │   └── index.css                # Global styles
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.js              # Vite configuration
├── university-connect-backend/        # Node.js backend
│   ├── models/                       # MongoDB schemas
│   │   ├── User.js                  # User authentication model
│   │   ├── Profile.js               # User profile model
│   │   ├── Question.js              # MCQ questions model
│   │   ├── CodingQuestion.js        # Coding questions model
│   │   ├── Certification.js         # Certification records
│   │   ├── Message.js               # Chat messages
│   │   ├── Conversation.js          # Chat conversations
│   │   └── Service.js               # Marketplace services
│   ├── routes/                       # API route handlers
│   │   ├── authRoutes.js            # Authentication endpoints
│   │   ├── profileRoutes.js         # Profile management
│   │   ├── studentRoutes.js         # Student discovery
│   │   ├── certificationRoutes.js   # Certification system
│   │   ├── questionRoutes.js        # Question management
│   │   ├── chatRoutes.js            # Messaging system
│   │   ├── serviceRoutes.js         # Marketplace services
│   │   └── adminRoutes.js           # Admin functionality
│   ├── middleware/                   # Custom middleware
│   │   └── authMiddleware.js        # JWT verification
│   ├── certificates/                # Generated certificates storage
│   ├── server.js                    # Main server file
│   ├── addmcq.js                    # Database seeding script
│   ├── test.js                      # Testing utilities
│   ├── package.json                 # Backend dependencies
│   └── .env                         # Environment variables
└── README.md                         # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (Local installation or MongoDB Atlas)
- **Git** - [Download](https://git-scm.com/)
- **Modern Web Browser** (Chrome, Firefox, Safari)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/Minor-Project-University-Connect.git
cd Minor-Project-University-Connect
```

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd university-connect-backend

# Install dependencies
npm install

# Create .env file with the following variables:
```

Create `.env` file in `university-connect-backend/`:
```env
# Database Configuration
MONGODB_URI=mongodb+srv://your-username:password@cluster.mongodb.net/university-connect

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Origins (add your frontend URL)
FRONTEND_URL=http://localhost:5173
```

```bash
# Seed the database with sample questions
npm run seed

# Start backend server
npm start
# or for development with auto-restart
npm run dev
```

### Step 3: Frontend Setup
```bash
# Navigate to frontend directory (open new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file for frontend
```

Create `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000
```

```bash
# Start frontend development server
npm run dev
```

### Step 4: Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

---

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Profile Model
```javascript
{
  user: ObjectId (ref: User),
  name: String,
  bio: String,
  skills: [String],
  education: [{
    degree: String,
    institution: String,
    fieldOfStudy: String,
    startYear: String,
    endYear: String,
    grade: String,
    description: String,
    current: Boolean
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    description: String,
    current: Boolean
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    githubUrl: String,
    liveUrl: String,
    startDate: String,
    endDate: String,
    featured: Boolean
  }],
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    instagram: String,
    portfolio: String
  },
  profileImage: String,
  certifications: [{
    category: String,
    score: Number,
    totalQuestions: Number,
    percentage: Number,
    certificateId: String,
    badgeType: String,
    earnedAt: Date
  }],
  completionPercentage: Number,
  isPublic: Boolean
}
```

### Certification Model
```javascript
{
  userId: ObjectId (ref: User),
  userName: String,
  category: String,
  score: Number,
  totalQuestions: Number,
  mcqScore: Number,
  mcqTotal: Number,
  percentage: Number,
  passed: Boolean,
  answers: Mixed,
  certificateId: String,
  certificateUrl: String,
  badgeType: String,
  earnedAt: Date
}
```

---

## 🔗 API Endpoints

### Authentication Routes (`/api/auth`)
```javascript
POST /register          // User registration
POST /login             // User login
GET  /verify            // Verify JWT token
```

### Profile Routes (`/api/users`)
```javascript
POST /setup             // Create/update profile
GET  /profile           // Get current user profile
GET  /profile/:id       // Get public profile by ID
POST /add-certification // Add certification to profile
```

### Student Routes (`/api/students`)
```javascript
GET  /                  // Get all students
GET  /me                // Get current user profile
GET  /:id               // Get specific student profile
```

### Certification Routes (`/api/certification`)
```javascript
GET  /questions         // Get test questions by category
POST /submit            // Submit test answers
GET  /my-certifications // Get user's certifications
GET  /user/:userId      // Get user's public certifications
```

### Chat Routes (`/api/chat`)
```javascript
GET  /conversations     // Get user conversations
GET  /messages/:userId  // Get messages with specific user
POST /send              // Send message (HTTP endpoint)
GET  /unread-count      // Get unread message count
PUT  /mark-read/:userId // Mark messages as read
```

### Service Routes (`/api/services`)
```javascript
GET  /                  // Get all services
POST /                  // Create new service
GET  /:id               // Get specific service
PUT  /:id               // Update service
DELETE /:id             // Delete service
```

---

## 🎯 Key Features Deep Dive

### 1. Student Connect System
- **Advanced Search**: Find students by name, skills, or location
- **Profile Discovery**: View complete student profiles with all information
- **Real-time Chat**: Instant messaging with online/offline indicators
- **Profile Completion**: Visual progress tracking for profile setup

### 2. Certification Platform
- **7 Categories**: Comprehensive coverage of technical subjects
- **Mixed Questions**: Both MCQ and coding problems in single test
- **Proctoring Features**: Fullscreen mode, time limits, copy-paste prevention
- **Certificate Generation**: Professional PDF certificates with verification IDs
- **Badge System**: Performance-based badge allocation

### 3. Profile Builder
- **6-Step Process**: Guided profile creation with validation
- **Rich Information**: Education, experience, projects, skills, social links
- **Image Support**: Profile picture and cover image upload
- **Completion Tracking**: Real-time calculation of profile completeness
- **Social Integration**: Links to professional and social media profiles

### 4. Real-time Messaging
- **WebSocket Implementation**: Socket.io for real-time communication
- **Message Persistence**: All conversations stored in MongoDB
- **Online Presence**: Real-time user status updates
- **Message Notifications**: Unread count tracking

### 5. Talent Marketplace
- **Service Listings**: Students can offer their skills as services
- **Category Organization**: Services organized by type and skill
- **Contact Integration**: Direct messaging for service inquiries
- **Rating System**: (Future enhancement)

---

## 🎨 UI/UX Features

### Design System
- **Dark Theme**: Modern dark color scheme with blue accents
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for enhanced user experience
- **Loading States**: Comprehensive loading indicators throughout app
- **Error Handling**: User-friendly error messages and fallbacks

### Interactive Elements
- **Hover Effects**: Subtle animations on buttons and cards
- **Progress Indicators**: Visual feedback for multi-step processes
- **Modal Dialogs**: Clean modal interfaces for forms and confirmations
- **Toast Notifications**: Success and error message notifications
- **Skeleton Loading**: Loading placeholders for better perceived performance

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Route Protection**: Protected routes requiring authentication
- **Token Expiration**: Automatic token refresh handling

### Data Protection
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **SQL Injection Prevention**: MongoDB ODM protection
- **XSS Prevention**: Input sanitization and output encoding

### Exam Security
- **Fullscreen Mode**: Prevents tab switching during exams
- **Time Limits**: Auto-submission when time expires
- **Copy-Paste Prevention**: Disabled during examinations
- **Session Management**: Secure exam session handling

---

## 📈 Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Lazy loading of route components
- **Image Optimization**: Efficient image loading and caching
- **Bundle Optimization**: Vite for fast development and optimized builds
- **Memoization**: React.memo and useMemo for expensive computations

### Backend Optimizations
- **Database Indexing**: Optimized MongoDB queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Caching**: Strategic caching of frequently accessed data
- **Pagination**: Efficient data loading for large datasets

---

## 🧪 Testing

### Backend Testing
```bash
# Run comprehensive API tests
npm test

# Test specific certification flow
npm run test-cert

# Database seeding for testing
npm run seed
```

### Frontend Testing
```bash
# Run component tests
npm run test

# Run E2E tests
npm run test:e2e
```

---

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)
1. Create account on Railway or Heroku
2. Connect GitHub repository
3. Set environment variables
4. Deploy backend service

### Frontend Deployment (Vercel/Netlify)
1. Create account on Vercel or Netlify
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set environment variables
5. Deploy frontend application

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create new cluster
3. Set up database user and network access
4. Update MONGODB_URI in environment variables

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Required
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=5000

# Optional
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

#### Frontend (.env)
```env
# Required
VITE_API_URL=https://your-backend-domain.com

# Optional
VITE_ENVIRONMENT=production
```

---

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style
- **Frontend**: ESLint + Prettier configuration
- **Backend**: Node.js best practices
- **Commits**: Conventional commit messages
- **Documentation**: JSDoc for complex functions

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Frontend Development**: React.js, Tailwind CSS, Framer Motion
- **Backend Development**: Node.js, Express.js, MongoDB
- **Real-time Features**: Socket.io implementation
- **Security**: JWT authentication, bcrypt password hashing
- **Testing**: Comprehensive API and component testing

---

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@universityconnect.com
- Documentation: [Wiki](https://github.com/your-repo/wiki)

---

## 🔮 Future Enhancements

### Planned Features
- **Video Calling**: WebRTC integration for video chats
- **Group Study Rooms**: Virtual study spaces
- **Assignment Collaboration**: Shared project workspaces
- **Event Management**: University event organization
- **Mobile App**: React Native mobile application
- **AI Recommendations**: ML-based student matching
- **Advanced Analytics**: User engagement insights
- **Multi-language Support**: Internationalization

### Technical Improvements
- **GraphQL API**: Enhanced data fetching
- **Microservices**: Service-oriented architecture
- **Redis Caching**: Advanced caching layer
- **Email Notifications**: Automated email system
- **File Upload**: Cloud storage integration
- **Advanced Security**: Two-factor authentication

---

## 📊 Project Statistics

```
Total Files: 50+
Lines of Code: 15,000+
Components: 25+
API Endpoints: 30+
Database Models: 8
Features: 20+
```

---

**🎓 University Connect - Connecting Students, Building Futures**

*Built with ❤️ for the student community*
