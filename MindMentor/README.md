# 🧠 MindMentor - AI Mental Health Companion

A modern React-based mental health application with AI chat, mood tracking, video calling, doctor dashboard, and admin features.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Twilio Video Calling Setup](#twilio-video-calling-setup)
- [Project Structure](#project-structure)
- [Key Features](#key-features)

## ✨ Features

- 🤖 **AI Chat Interface** - Interactive AI companion for mental health support
- 📊 **Mood Tracking** - Visualize mood history with charts (Line, Bar, Doughnut)
- 🎥 **Video Calling** - Real-time video calls between users and doctors
- 💬 **Doctor Messaging** - Doctors can send messages to users
- 🎵 **Music Recommendations** - AI-powered Tamil motivational song recommendations
- 📧 **Email Notifications** - Daily mental health emails
- 👨‍⚕️ **Doctor Dashboard** - View all users, reports, and manage patient care
- 👨‍💼 **Admin Dashboard** - User management and analytics

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Firebase Project** with:
  - Authentication enabled (Email/Password)
  - Firestore Database enabled
  - Firestore security rules configured

## 🚀 Installation

### 1. Clone/Navigate to Project

```bash
cd "d:\Swetha App\MindMentor\MindMentor"
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React and React Router
- Firebase (Authentication & Firestore)
- Twilio Video SDK
- Chart.js for data visualization
- Framer Motion for animations
- And other dependencies...

## ⚙️ Configuration

### 1. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** with Email/Password provider
3. Enable **Firestore Database**
4. Update `src/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

5. Update Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Update with proper security rules for production
    }
  }
}
```

### 2. Twilio Video Setup

1. Get your Twilio credentials from [Twilio Console](https://console.twilio.com/):
   - **Account SID** (starts with `AC...`)
   - Create an **API Key** and save:
     - **API Key SID** (starts with `SK...`)
     - **API Secret** (shown only once!)

2. Update `server.js` with your credentials:

```javascript
const TWILIO_ACCOUNT_SID = 'your_account_sid';
const TWILIO_API_KEY = 'your_api_key';
const TWILIO_API_SECRET = 'your_api_secret';
```

Or create a `.env` file (recommended):

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret_here
PORT=3001
```

## 🏃 Running the Application

### Option 1: Run Both Server and Frontend (Recommended)

You need **two terminal windows**:

#### Terminal 1 - Start Backend Server (Twilio Token Server)

```bash
npm run server
```

Or:

```bash
npm start
```

You should see:
```
🚀 Twilio Token Server running on http://localhost:3001
✅ Server is ready to generate tokens!
```

#### Terminal 2 - Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Option 2: Run Only Frontend (Without Video Calls)

```bash
npm run dev
```

> **Note:** Video calling will not work without the backend server running.

## 🌐 Accessing the Application

### User Application
- **Home**: http://localhost:5173/home
- **Login**: http://localhost:5173/login
- **Register**: http://localhost:5173/register
- **Mood Tracking**: http://localhost:5173/mood-tracking
- **Settings**: http://localhost:5173/settings

### Doctor Dashboard
- **Doctor Login**: http://localhost:5173/doctor/login
- **Doctor Dashboard**: http://localhost:5173/doctor/dashboard
- **Default Credentials**:
  - Email: `doctor@gmail.com`
  - Password: `doctor2024`

### Admin Dashboard
- **Admin Login**: http://localhost:5173/admin/login
- **Admin Dashboard**: http://localhost:5173/admin/dashboard
- **Default Credentials**:
  - Username: `admin`
  - Password: `mindmentor2024`

## 📞 Video Calling Features

### For Users
1. Click the **phone icon** button in the header
2. Grant camera/microphone permissions
3. Wait for doctor to join or start calling

### For Doctors
1. Login to doctor dashboard
2. Click on a user to view their report
3. Click the **phone icon** button to call the patient
4. Patient will receive an incoming call notification

### Incoming Call Notification
- Beautiful animated UI appears when someone calls
- Accept (green) or Reject (red) buttons
- Auto-times out after 30 seconds if not answered

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start Vite dev server (frontend)

# Backend Server
npm run server       # Start Twilio token server
npm start            # Same as npm run server

# Build
npm run build        # Build for production

# Preview
npm run preview      # Preview production build

# Testing
npm run test-email   # Test email functionality
```

## 📁 Project Structure

```
MindMentor/
├── src/
│   ├── components/          # Reusable components
│   │   ├── VideoCall.jsx          # Video calling interface
│   │   ├── IncomingCall.jsx       # Incoming call notification
│   │   ├── UserReportView.jsx     # Doctor's user report view
│   │   ├── MusicRecommendations.jsx
│   │   ├── NewsModal.jsx
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── Home.jsx                # Main user home page
│   │   ├── Login.jsx               # User login
│   │   ├── Register.jsx            # User registration
│   │   ├── MoodTracking.jsx       # Mood tracking & charts
│   │   ├── DoctorLogin.jsx         # Doctor login
│   │   ├── DoctorDashboard.jsx    # Doctor dashboard
│   │   └── ...
│   ├── services/            # Service layer
│   │   ├── firebaseService.js      # Firebase operations
│   │   ├── twilioService.js        # Twilio video service
│   │   ├── musicService.js         # Music recommendations
│   │   ├── geminiService.js        # AI integration
│   │   └── ...
│   ├── App.jsx              # Main app component
│   ├── firebase.js          # Firebase configuration
│   └── main.jsx             # App entry point
├── server.js                # Twilio token server
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## 🔧 Troubleshooting

### Video Not Showing

1. **Check browser console** for errors
2. **Verify camera/microphone permissions** are granted
3. **Check if server is running**: `http://localhost:3001/health`
4. **Verify Twilio credentials** in `server.js`
5. **Check network tab** to see if token is being generated

### Cannot Connect to Server

1. **Verify server is running**: `npm run server`
2. **Check port 3001** is not in use
3. **Verify CORS** is enabled (already configured in server.js)
4. **Check browser console** for connection errors

### Twilio Token Generation Fails

1. **Verify credentials** in `server.js` or `.env`
2. **Check Twilio Console** to ensure API Key is active
3. **Verify Account SID** is correct
4. **Check server logs** for detailed error messages

### Firebase Errors

1. **Verify Firebase config** in `src/firebase.js`
2. **Check Firestore rules** in Firebase Console
3. **Ensure Authentication** is enabled
4. **Verify Firestore Database** is created

## 📝 Environment Variables (Optional)

Create a `.env` file in the project root:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret_here

# Server Port
PORT=3001

# Frontend Twilio Server URL (optional)
VITE_TWILIO_SERVER_URL=http://localhost:3001
```

## 🎯 Quick Start Checklist

- [ ] Install Node.js (v16+)
- [ ] Run `npm install`
- [ ] Configure Firebase (`src/firebase.js`)
- [ ] Get Twilio credentials
- [ ] Update `server.js` with Twilio credentials
- [ ] Start server: `npm run server` (Terminal 1)
- [ ] Start frontend: `npm run dev` (Terminal 2)
- [ ] Open http://localhost:5173
- [ ] Register a new user or login
- [ ] Test video calling!

## 📚 Additional Documentation

- [Twilio Video Calling Setup](./README_TWILIO.md) - Detailed Twilio setup guide
- [Firebase Documentation](https://firebase.google.com/docs)
- [Twilio Video SDK](https://www.twilio.com/docs/video)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Check server terminal for backend errors
4. Verify all credentials are correct

## 📄 License

This project is part of the MindMentor mental health application.

---

**Happy Coding! 🚀**
