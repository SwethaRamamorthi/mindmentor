import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  LogOut, 
  Eye, 
  Search,
  User,
  Mail,
  Calendar,
  Heart
} from 'lucide-react';
import { getAllUsers } from '../services/firebaseService';
import UserReportView from '../components/UserReportView';

const DoctorDashboard = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(user => 
          (user.name && user.name.toLowerCase().includes(query)) ||
          (user.email && user.email.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <UserReportView 
        userId={selectedUser.id} 
        userName={selectedUser.name || selectedUser.email}
        onBack={handleBack}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading patient records...</div>
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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Doctor Dashboard</h1>
            <p className="text-slate-600 text-sm">Patient Records & Reports</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLogout}
          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </motion.button>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <div className="glass-effect p-4 rounded-xl text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800">{users.length}</div>
            <div className="text-sm text-slate-600">Total Patients</div>
          </div>
          
          <div className="glass-effect p-4 rounded-xl text-center">
            <Heart className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800">{filteredUsers.length}</div>
            <div className="text-sm text-slate-600">Filtered Results</div>
          </div>
          
          <div className="glass-effect p-4 rounded-xl text-center">
            <Mail className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800">
              {users.filter(u => u.emailNotifications).length}
            </div>
            <div className="text-sm text-slate-600">Active Users</div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect p-4 mb-6 rounded-xl"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect p-6 rounded-xl"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">All Patients</h2>
          </div>
          
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? 'No patients found' : 'No patients in database'}
              </p>
              <p className="text-sm">
                {searchQuery 
                  ? 'Try adjusting your search query'
                  : 'Patients will appear here once they register'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUserClick(user)}
                  className="bg-white/80 p-4 rounded-xl cursor-pointer hover:bg-white transition-colors border border-blue-200 hover:border-green-400 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {user.name || 'Anonymous User'}
                        </h3>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                    </div>
                    <Eye className="w-5 h-5 text-green-500" />
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {user.createdAt?.toLocaleDateString() || 'N/A'}
                    </div>
                    {user.emailNotifications && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Mail className="w-4 h-4" />
                        Active
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      Click to view report and send message
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

