import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MoodTracking from './pages/MoodTracking';
import Settings from './pages/Settings';
import EmailTestComponent from './components/EmailTestComponent';
import DailyEmailScheduler from './components/DailyEmailScheduler';
import DirectEmailTest from './components/DirectEmailTest';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DoctorLogin from './pages/DoctorLogin';
import DoctorDashboard from './pages/DoctorDashboard';
import { onAuthStateChange } from './services/firebaseService';
import './services/autoStartEmailService'; // Auto-start daily email service
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAdminLogin = (success) => {
    setIsAdmin(success);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
  };

  const handleDoctorLogin = (success) => {
    setIsDoctor(success);
  };

  const handleDoctorLogout = () => {
    setIsDoctor(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Admin Routes */}
          <Route 
            path="/admin/login" 
            element={!isAdmin ? <AdminLogin onLogin={handleAdminLogin} /> : <Navigate to="/admin/dashboard" />} 
          />
          <Route 
            path="/admin/dashboard" 
            element={isAdmin ? <AdminDashboard onLogout={handleAdminLogout} /> : <Navigate to="/admin/login" />} 
          />
          
          {/* Doctor Routes */}
          <Route 
            path="/doctor/login" 
            element={!isDoctor ? <DoctorLogin onLogin={handleDoctorLogin} /> : <Navigate to="/doctor/dashboard" />} 
          />
          <Route 
            path="/doctor/dashboard" 
            element={isDoctor ? <DoctorDashboard onLogout={handleDoctorLogout} /> : <Navigate to="/doctor/login" />} 
          />
          
          {/* User Routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/home" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/home" /> : <Register />} 
          />
          <Route 
            path="/home" 
            element={user ? <Home /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/mood-tracking" 
            element={user ? <MoodTracking /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/settings" 
            element={user ? <Settings /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/home" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
