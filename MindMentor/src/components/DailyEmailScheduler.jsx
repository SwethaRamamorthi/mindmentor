import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Mail, Users, Play, Pause, Settings, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import EmailService from '../services/emailService';
import dailyEmailService from '../services/dailyEmailService';

const DailyEmailScheduler = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [nextRun, setNextRun] = useState(null);
  const [stats, setStats] = useState({ sent: 0, failed: 0, total: 0 });
  const [scheduleStatus, setScheduleStatus] = useState('stopped');
  const [emailHistory, setEmailHistory] = useState([]);
  const emailService = new EmailService();

  // Calculate next run times
  const getNextRunTimes = () => {
    const now = new Date();
    const morning = new Date(now);
    morning.setHours(8, 0, 0, 0);
    
    const midday = new Date(now);
    midday.setHours(12, 0, 0, 0);
    
    const evening = new Date(now);
    evening.setHours(18, 0, 0, 0);

    // Find next scheduled time
    let nextTime = null;
    if (now < morning) {
      nextTime = morning;
    } else if (now < midday) {
      nextTime = midday;
    } else if (now < evening) {
      nextTime = evening;
    } else {
      // Next day morning
      nextTime = new Date(now);
      nextTime.setDate(nextTime.getDate() + 1);
      nextTime.setHours(8, 0, 0, 0);
    }

    return {
      morning: morning.toLocaleTimeString(),
      midday: midday.toLocaleTimeString(),
      evening: evening.toLocaleTimeString(),
      next: nextTime.toLocaleString()
    };
  };

  const [scheduleTimes] = useState(getNextRunTimes());

  // Send emails to all users
  const sendEmailsToAllUsers = async (messageType = 'morning') => {
    try {
      console.log(`📧 Starting daily ${messageType} email campaign...`);
      
      const result = await emailService.sendDailyEmailsToAllUsers(messageType);
      
      if (result.success) {
        setStats({
          sent: result.sent,
          failed: result.failed,
          total: result.total
        });
        setLastRun(new Date().toLocaleString());
        
        // Add to email history
        const historyEntry = {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          type: messageType,
          sent: result.sent,
          failed: result.failed,
          total: result.total,
          success: result.sent > 0
        };
        setEmailHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10
        
        console.log(`✅ Email campaign completed: ${result.sent}/${result.total} sent`);
        return result;
      } else {
        console.error('❌ Email campaign failed:', result.error);
        return result;
      }
      
    } catch (error) {
      console.error('❌ Error sending emails:', error);
      return { success: false, error: error.message };
    }
  };

  // Start daily email scheduler
  const startDailyScheduler = () => {
    dailyEmailService.start();
    setIsRunning(true);
    setScheduleStatus('running');
    console.log('🕐 Daily email scheduler started');
  };

  // Stop daily email scheduler
  const stopDailyScheduler = () => {
    dailyEmailService.stop();
    setIsRunning(false);
    setScheduleStatus('stopped');
    console.log('⏹️ Daily email scheduler stopped');
  };

  // Toggle scheduler
  const toggleScheduler = () => {
    if (isRunning) {
      stopDailyScheduler();
    } else {
      startDailyScheduler();
    }
  };

  // Manual email sending
  const sendManualEmails = async (messageType) => {
    const result = await dailyEmailService.sendManualEmails(messageType);
    
    if (result.success) {
      setStats({
        sent: result.sent,
        failed: result.failed,
        total: result.total
      });
      setLastRun(new Date().toLocaleString());
      
      // Add to email history
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        type: messageType,
        sent: result.sent,
        failed: result.failed,
        total: result.total,
        success: result.sent > 0
      };
      setEmailHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10
    }
    
    return result;
  };

  // Load saved data on component mount
  useEffect(() => {
    // Load data from background service
    const serviceStatus = dailyEmailService.getStatus();
    setStats(serviceStatus.stats);
    setLastRun(serviceStatus.lastRun);
    setNextRun(serviceStatus.nextRun);
    setIsRunning(serviceStatus.isRunning);
    
    // Load additional data from localStorage
    const savedHistory = localStorage.getItem('emailHistory');
    if (savedHistory) setEmailHistory(JSON.parse(savedHistory));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('emailStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('emailHistory', JSON.stringify(emailHistory));
  }, [emailHistory]);

  useEffect(() => {
    localStorage.setItem('scheduleStatus', scheduleStatus);
  }, [scheduleStatus]);

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6 rounded-xl mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Daily Email Scheduler</h1>
              <p className="text-slate-600">Automatically send positive messages to all MindMentor users</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Morning</h3>
              <p className="text-blue-700">8:00 AM</p>
              <p className="text-sm text-blue-600">Start your day with positivity</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Midday</h3>
              <p className="text-yellow-700">12:00 PM</p>
              <p className="text-sm text-yellow-600">Midday motivation boost</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Evening</h3>
              <p className="text-purple-700">6:00 PM</p>
              <p className="text-sm text-purple-600">Evening reflection time</p>
            </div>
          </div>
        </motion.div>

        {/* Scheduler Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect p-6 rounded-xl mb-6"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Scheduler Controls</h2>
          
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleScheduler}
              className={`p-4 rounded-lg transition-colors flex items-center gap-2 ${
                isRunning
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isRunning ? 'Stop Daily Scheduler' : 'Start Daily Scheduler'}
            </motion.button>
            
            <div className="text-sm text-slate-600">
              Status: <span className={isRunning ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {isRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendManualEmails('morning')}
              className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Send Morning Emails Now
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendManualEmails('midday')}
              className="p-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Send Midday Emails Now
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendManualEmails('evening')}
              className="p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Send Evening Emails Now
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect p-6 rounded-xl mb-6"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Email Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
              <div className="text-sm text-green-700">Emails Sent</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700">Total Users</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}%
              </div>
              <div className="text-sm text-purple-700">Success Rate</div>
            </div>
          </div>
        </motion.div>

        {/* Email History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-effect p-6 rounded-xl mb-6"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Email History</h2>
          
          {emailHistory.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No emails sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {entry.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium text-slate-800">
                        {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} Emails
                      </div>
                      <div className="text-sm text-slate-600">{entry.timestamp}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    {entry.sent}/{entry.total} sent
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Schedule Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-effect p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Schedule Information</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
              <span className="font-medium">Last Run:</span>
              <span className="text-slate-600">{lastRun || 'Never'}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
              <span className="font-medium">Next Scheduled:</span>
              <span className="text-slate-600">{scheduleTimes.next}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
              <span className="font-medium">EmailJS Status:</span>
              <span className="text-green-600 font-medium">✅ Connected</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
              <span className="font-medium">Firebase Status:</span>
              <span className="text-green-600 font-medium">✅ Connected</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DailyEmailScheduler;