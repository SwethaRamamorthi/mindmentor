import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User } from 'lucide-react';
import { registerUser } from '../services/firebaseService';
import UserPreferences from '../components/UserPreferences';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Proceed to preferences collection
    setShowPreferences(true);
  };

  const handlePreferencesComplete = async (preferences) => {
    setLoading(true);
    setError('');
    setUserPreferences(preferences);

    try {
      await registerUser(formData.email, formData.password, formData.name, preferences);
      setSuccess(true);
      setError('');
      
      // Show success message for 2 seconds, then redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError('Failed to create account. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesBack = () => {
    setShowPreferences(false);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {showPreferences ? (
        <UserPreferences 
          onComplete={handlePreferencesComplete}
          onBack={handlePreferencesBack}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
        {/* Animated Character */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-center mb-8"
        >
          {/* Multiple Character Icons */}
          <div className="flex justify-center items-center mb-4 space-x-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center backdrop-blur-md border border-blue-200"
            >
              <span className="text-2xl">🎯</span>
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center backdrop-blur-md border border-blue-300 shadow-lg"
            >
              <Heart className="w-10 h-10 text-blue-500 animate-pulse" />
            </motion.div>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center backdrop-blur-md border border-blue-200"
            >
              <span className="text-2xl">🚀</span>
            </motion.div>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
            <span className="animate-bounce">🎯</span>
            MINDMENTOR
            <span className="animate-bounce" style={{ animationDelay: '0.5s' }}>🚀</span>
          </h1>
          <p className="text-slate-600 text-sm flex items-center justify-center gap-1">
            <span>🌟</span>
            Your AI Mental Health Companion
            <span>✨</span>
          </p>
        </motion.div>

        {/* Register Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-semibold text-slate-800 text-center mb-6 flex items-center justify-center gap-2">
            <span>🎉</span>
            Create Account
            <span>✨</span>
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2"
            >
              <span>⚠️</span>
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2"
            >
              <span>✅</span>
              Account created successfully! Redirecting to login...
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2 flex items-center gap-2">
                <span>👤</span>
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2 flex items-center gap-2">
                <span>📧</span>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2 flex items-center gap-2">
                <span>🔒</span>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2 flex items-center gap-2">
                <span>🔐</span>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Creating Account...
                </>
              ) : (
                <>
                  <span>🎉</span>
                  Create Account
                  <span>🚀</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm flex items-center justify-center gap-1">
              <span>🤔</span>
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors flex items-center gap-1"
              >
                <span>👆</span>
                Sign in here
                <span>✨</span>
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Floating Affirmations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-600 text-sm animate-pulse flex items-center justify-center gap-2">
            <span>🌟</span>
            "Start your journey"
            <span>💫</span>
          </p>
        </motion.div>

        {/* Floating Background Emojis */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0, 
                scale: 0,
                x: Math.random() * 400,
                y: Math.random() * 600
              }}
              animate={{ 
                opacity: [0, 0.4, 0],
                scale: [0, 1, 0],
                y: [0, -50],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeOut"
              }}
              className="absolute text-xl"
            >
              {['🎯', '🚀', '✨', '🌟', '💫', '🦋', '🌸', '🕊️'][i]}
            </motion.div>
          ))}
        </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Register;
