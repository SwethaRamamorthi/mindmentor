import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock } from 'lucide-react';
import { signInUser } from '../services/firebaseService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Trim whitespace from inputs
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      if (!trimmedEmail || !trimmedPassword) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
      }

      await signInUser(trimmedEmail, trimmedPassword);
      setSuccess('Login successful! Redirecting...');
      setError('');
      
      // Show success message briefly, then redirect
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (error) {
      // Use the error message from firebaseService (already user-friendly)
      setError(error.message || 'Failed to log in. Please check your credentials and try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
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
              <span className="text-2xl">🧠</span>
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
              <span className="text-2xl">💙</span>
            </motion.div>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
            <span className="animate-bounce">🧠</span>
            MINDMENTOR
            <span className="animate-bounce" style={{ animationDelay: '0.5s' }}>💙</span>
          </h1>
          <p className="text-slate-600 text-sm flex items-center justify-center gap-1">
            <span>🌟</span>
            Your AI Mental Health Companion
            <span>✨</span>
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-semibold text-slate-800 text-center mb-6 flex items-center justify-center gap-2">
            <span>👋</span>
            Welcome Back
            <span>😊</span>
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4"
            >
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
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2 flex items-center gap-2">
                <span>📧</span>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  placeholder="Enter your password"
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
                  Signing In...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Sign In
                  <span>✨</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-slate-600 text-sm flex items-center justify-center gap-1">
              <span>🤔</span>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors flex items-center gap-1"
              >
                <span>🎉</span>
                Sign up here
                <span>👆</span>
              </Link>
            </p>
            
            {/* Doctor Login Quick Access */}
            <div className="pt-3 border-t border-slate-200">
              <Link
                to="/doctor/login"
                className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors flex items-center justify-center gap-1"
              >
                <span>👨‍⚕️</span>
                Doctor Login
                <span>→</span>
              </Link>
            </div>
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
            <span>💙</span>
            "You matter"
            <span>🌸</span>
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
              {['🧠', '💙', '✨', '🌟', '💫', '🦋', '🌸', '🕊️'][i]}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
