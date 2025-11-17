import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Mail, 
  BarChart3, 
  Settings, 
  LogOut, 
  Clock, 
  TrendingUp, 
  Activity,
  Send,
  Play,
  Pause,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import EmailService from '../services/emailService';
import dailyEmailService from '../services/dailyEmailService';
import { 
  getAllUsers, 
  getAllMoodEntries, 
  getUserStatistics, 
  getMoodStatistics,
  listenToAllMoodEntries,
  createTestUser
} from '../services/firebaseService';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [emailStats, setEmailStats] = useState({ sent: 0, failed: 0, total: 0 });
  const [isEmailServiceRunning, setIsEmailServiceRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ totalUsers: 0, activeUsers: 0, usersWithEmailNotifications: 0 });
  const [moodStats, setMoodStats] = useState({ totalMoods: 0, moodCounts: {}, mostCommonMood: 'happy' });
  const emailService = new EmailService();

  // Load all users from Firebase
  const loadUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load mood data from all users
  const loadMoodData = async () => {
    try {
      const moodHistory = await getAllMoodEntries(100);
      setMoodData(moodHistory);
    } catch (error) {
      console.error('Error loading mood data:', error);
    }
  };

  // Load email statistics
  const loadEmailStats = () => {
    const serviceStatus = dailyEmailService.getStatus();
    setEmailStats(serviceStatus.stats);
    setIsEmailServiceRunning(serviceStatus.isRunning);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load basic data
      await Promise.all([
        loadUsers(),
        loadMoodData(),
        loadEmailStats()
      ]);
      
      // Load statistics
      try {
        const [userStatsData, moodStatsData] = await Promise.all([
          getUserStatistics(),
          getMoodStatistics()
        ]);
        setUserStats(userStatsData);
        setMoodStats(moodStatsData);
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Send emails to all users
  const sendEmailsToAllUsers = async (messageType = 'morning') => {
    try {
      const result = await emailService.sendDailyEmailsToAllUsers(messageType);
      if (result.success) {
        setEmailStats({
          sent: result.sent,
          failed: result.failed,
          total: result.total
        });
      }
      return result;
    } catch (error) {
      console.error('Error sending emails:', error);
      return { success: false, error: error.message };
    }
  };

  // Toggle email service
  const toggleEmailService = () => {
    if (isEmailServiceRunning) {
      dailyEmailService.stop();
      setIsEmailServiceRunning(false);
    } else {
      dailyEmailService.start();
      setIsEmailServiceRunning(true);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadMoodData(),
        loadEmailStats()
      ]);
      
      const [userStatsData, moodStatsData] = await Promise.all([
        getUserStatistics(),
        getMoodStatistics()
      ]);
      
      setUserStats(userStatsData);
      setMoodStats(moodStatsData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setLoading(false);
  };

  // Create test data if no users exist
  const createTestData = async () => {
    try {
      await createTestUser();
      await refreshData();
    } catch (error) {
      console.error('Error creating test data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-4 flex justify-between items-center"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800">MindMentor Admin Panel</h1>
          <p className="text-slate-600 text-sm">Manage users and email campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            disabled={loading}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect p-4 mb-6 rounded-xl"
        >
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'users', label: 'Users', icon: Users },
              { id: 'moods', label: 'Mood Data', icon: BarChart3 },
              { id: 'emails', label: 'Email Campaigns', icon: Mail },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-blue-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="glass-effect p-4 rounded-xl text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800">{userStats.totalUsers || 0}</div>
            <div className="text-sm text-slate-600">Total Users</div>
          </div>
          
          <div className="glass-effect p-4 rounded-xl text-center">
            <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800">{userStats.activeUsers}</div>
            <div className="text-sm text-slate-600">Active Users</div>
          </div>
          
          <div className="glass-effect p-4 rounded-xl text-center">
            <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800">{moodStats.totalMoods || 0}</div>
            <div className="text-sm text-slate-600">Mood Entries</div>
          </div>
          
          <div className="glass-effect p-4 rounded-xl text-center">
            <Mail className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800">{emailStats.sent}</div>
            <div className="text-sm text-slate-600">Emails Sent</div>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-effect p-6 rounded-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">All Users</h2>
              {users.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createTestData}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                >
                  Create Test User
                </motion.button>
              )}
            </div>
            
            {users.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No users found</p>
                <p className="text-sm mb-4">The database appears to be empty or there's a connection issue.</p>
                <div className="space-y-2 text-xs">
                  <p>• Check Firebase connection</p>
                  <p>• Verify database rules</p>
                  <p>• Try creating a test user</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Joined</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Email Notifications</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-slate-800">{user.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-slate-600">{user.email}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {user.createdAt.toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {user.emailNotifications ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            userStats.activeUsers > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'moods' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-effect p-6 rounded-xl"
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Mood Entries</h2>
            <div className="space-y-3">
              {moodData.slice(0, 20).map((mood) => {
                // Find user info for this mood entry
                const user = users.find(u => u.id === mood.userId);
                return (
                  <div key={mood.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {mood.mood === 'happy' ? '😊' : 
                         mood.mood === 'sad' ? '😔' : 
                         mood.mood === 'angry' ? '😡' : '😴'}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 capitalize">{mood.mood}</div>
                        <div className="text-sm text-slate-600">
                          {user ? `${user.name || user.email}` : 'Unknown User'} • {mood.createdAt.toLocaleDateString()} at {mood.createdAt.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    {mood.note && (
                      <div className="text-sm text-slate-600 max-w-xs truncate">
                        "{mood.note}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'emails' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Email Service Controls */}
            <div className="glass-effect p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Email Service Controls</h2>
              
              <div className="flex items-center gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleEmailService}
                  className={`p-4 rounded-lg transition-colors flex items-center gap-2 ${
                    isEmailServiceRunning
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isEmailServiceRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isEmailServiceRunning ? 'Stop Email Service' : 'Start Email Service'}
                </motion.button>
                
                <div className="text-sm text-slate-600">
                  Status: <span className={isEmailServiceRunning ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {isEmailServiceRunning ? 'Running' : 'Stopped'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendEmailsToAllUsers('morning')}
                  className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Morning Emails
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendEmailsToAllUsers('midday')}
                  className="p-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Midday Emails
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendEmailsToAllUsers('evening')}
                  className="p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Evening Emails
                </motion.button>
              </div>
            </div>

            {/* Email Statistics */}
            <div className="glass-effect p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Email Statistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{emailStats.sent}</div>
                  <div className="text-sm text-green-700">Emails Sent</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{emailStats.failed}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{emailStats.total}</div>
                  <div className="text-sm text-blue-700">Total Users</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {emailStats.total > 0 ? Math.round((emailStats.sent / emailStats.total) * 100) : 0}%
                  </div>
                  <div className="text-sm text-purple-700">Success Rate</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-effect p-6 rounded-xl"
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Admin Settings</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">EmailJS Configuration</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>Service ID: service_alsloth</div>
                  <div>Template ID: template_4o6zy24</div>
                  <div>Public Key: EEwF1Zda2o8ilaO_G</div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">System Status</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>✅ Firebase Connected</div>
                  <div>✅ EmailJS Connected</div>
                  <div>✅ Daily Email Service: {isEmailServiceRunning ? 'Running' : 'Stopped'}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
