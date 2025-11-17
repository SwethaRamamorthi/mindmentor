import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, Heart } from 'lucide-react';
import { verifyDoctorLogin } from '../services/firebaseService';

const DoctorLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);

  // Initialize doctor credentials in database on component mount
  useEffect(() => {
    const initializeDoctor = async () => {
      try {
        // This will create the doctor document in database if it doesn't exist
        const { getDoctorCredentials } = await import('../services/firebaseService');
        await getDoctorCredentials();
        console.log('✅ Doctor credentials initialized in database');
      } catch (error) {
        console.error('Error initializing doctor:', error);
      }
    };
    initializeDoctor();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verify credentials against database
      const result = await verifyDoctorLogin(credentials.email, credentials.password);

      if (result.success) {
        setDoctorInfo(result.doctor);
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));
        onLogin(true);
      } else {
        setError(result.error || 'Invalid doctor credentials. Please check your email and password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to connect to database. Please try again.');
    }
    
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-8 rounded-xl max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Doctor Login</h1>
          <p className="text-slate-600">Access Patient Records & Reports</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter doctor email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter doctor password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" />
                Sign In as Doctor
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p className="font-medium mb-2">Doctor credentials:</p>
          <p className="mb-1">📧 Email: doctor@gmail.com</p>
          <p>🔒 Password: doctor2024</p>
          <p className="mt-3 text-slate-400 italic">
            Credentials stored securely in database
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorLogin;

