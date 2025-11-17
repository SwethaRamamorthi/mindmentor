import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings as SettingsIcon, User, LogOut } from 'lucide-react';
import { 
  onAuthStateChange, 
  getUserDocument, 
  signOutUser 
} from '../services/firebaseService';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setUser(user);
        loadUserData(user.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadUserData = async (userId) => {
    try {
      const data = await getUserDocument(userId);
      setUserData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-3 md:p-4 flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackToHome}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-800">
              Settings ⚙️
            </h1>
            <p className="text-slate-600 text-xs md:text-sm">
              Manage your account preferences
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors flex-shrink-0 ml-2"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
        </motion.button>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* User Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect p-6 rounded-xl mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {userData?.name || 'User'}
              </h2>
              <p className="text-slate-600">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Display Name
                </label>
                <div className="p-3 bg-white/50 rounded-lg text-slate-800">
                  {userData?.name || 'Not set'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="p-3 bg-white/50 rounded-lg text-slate-800">
                  {user?.email}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Member Since
                </label>
                <div className="p-3 bg-white/50 rounded-lg text-slate-800">
                  {userData?.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Status
                </label>
                <div className="p-3 bg-green-50 rounded-lg text-green-800 font-medium">
                  Active
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* App Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect p-6 rounded-xl mb-6"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">About MindMentor</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
              <span className="font-medium text-slate-700">Version</span>
              <span className="text-slate-600">1.0.0</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
              <span className="font-medium text-slate-700">Mood Tracking</span>
              <span className="text-green-600 font-medium">Enabled</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
              <span className="font-medium text-slate-700">AI Chat</span>
              <span className="text-green-600 font-medium">Active</span>
            </div>
          </div>
        </motion.div>

        {/* Privacy & Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Privacy & Support</h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Your Privacy</h4>
              <p className="text-sm text-blue-700">
                Your mood data is stored securely and privately. Only you can access your personal information.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Data Security</h4>
              <p className="text-sm text-green-700">
                All data is encrypted and protected using industry-standard security measures.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Support</h4>
              <p className="text-sm text-purple-700">
                Need help? Contact our support team for assistance with your MindMentor experience.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;