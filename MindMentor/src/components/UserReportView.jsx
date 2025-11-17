import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Calendar, Heart, MessageSquare, BarChart3, X, Phone } from 'lucide-react';
import { 
  getUserMoodHistoryForDoctor, 
  sendDoctorMessage,
  getUserDocument,
  initiateVideoCall
} from '../services/firebaseService';
import { getCallRoomName } from '../services/twilioService';
import VideoCall from './VideoCall';

const UserReportView = ({ userId, userName, onBack }) => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);

  useEffect(() => {
    loadUserReport();
    loadUserData();
  }, [userId]);

  const loadUserReport = async () => {
    setLoading(true);
    try {
      const history = await getUserMoodHistoryForDoctor(userId, 100);
      setMoodHistory(history);
    } catch (error) {
      console.error('Error loading user report:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const data = await getUserDocument(userId);
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      await sendDoctorMessage(userId, message);
      setMessage('');
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const moodColors = {
    happy: '#10B981',
    sad: '#3B82F6',
    angry: '#EF4444',
    tired: '#F59E0B'
  };

  const moodEmojis = {
    happy: '😊',
    sad: '😔',
    angry: '😡',
    tired: '😴'
  };

  // Calculate mood statistics
  const getMoodStats = () => {
    const moodCounts = moodHistory.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, 'happy'
    );

    return { moodCounts, mostCommonMood, totalEntries: moodHistory.length };
  };

  const stats = getMoodStats();

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-4 flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Patient Report: {userName || 'User'}
            </h1>
            <p className="text-slate-600 text-sm">
              {userData?.email || ''} • {stats.totalEntries} mood entries
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Video Call Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              try {
                // Initiate call to patient
                const roomName = getCallRoomName(userId);
                await initiateVideoCall('doctor', userId, 'Doctor', roomName);
                setShowVideoCall(true);
              } catch (error) {
                console.error('Error initiating call:', error);
                setShowVideoCall(true); // Still open video call
              }
            }}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
            title="Video Call with Patient"
          >
            <Phone className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="glass-effect p-4 rounded-xl text-center">
            <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800">{stats.totalEntries}</div>
            <div className="text-sm text-slate-600">Total Entries</div>
          </div>
          
          <div className="glass-effect p-4 rounded-xl text-center">
            <div className="text-3xl mb-2">
              {stats.mostCommonMood ? moodEmojis[stats.mostCommonMood] : '📊'}
            </div>
            <div className="text-sm font-medium text-slate-800 capitalize">
              {stats.mostCommonMood || 'No Data'}
            </div>
            <div className="text-xs text-slate-600">Most Common</div>
          </div>
          
          <div className="glass-effect p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-slate-800">
              {stats.moodCounts.happy || 0}
            </div>
            <div className="text-sm text-slate-600">Happy Days</div>
          </div>
          
          <div className="glass-effect p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-slate-800">
              {stats.moodCounts.sad || 0}
            </div>
            <div className="text-sm text-slate-600">Sad Days</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mood History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-effect p-6 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-slate-800">Mood History</h2>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Loading mood history...</p>
              </div>
            ) : moodHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                <div className="text-4xl mb-2">📊</div>
                <p>No mood entries found for this user.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {moodHistory.map((mood, index) => (
                  <motion.div
                    key={mood.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{moodEmojis[mood.mood]}</div>
                      <div>
                        <div className="font-medium text-slate-800 capitalize">
                          {mood.mood}
                        </div>
                        <div className="text-sm text-slate-600">
                          {new Date(mood.createdAt).toLocaleDateString()} at{' '}
                          {new Date(mood.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                    {mood.note && (
                      <div className="text-sm text-slate-600 max-w-xs truncate">
                        "{mood.note}"
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Send Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-effect p-6 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-slate-800">Send Message</h2>
            </div>

            <div className="space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a message for the patient..."
                className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
                rows={6}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendMessage}
                disabled={!message.trim() || sending}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  !message.trim() || sending
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </motion.button>

              <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg">
                <Heart className="w-4 h-4 inline mr-1" />
                Your message will be visible to the patient in their dashboard.
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Call Component */}
      {showVideoCall && userId && (
        <VideoCall
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          identity="doctor"
          roomName={getCallRoomName(userId)}
          displayName={userName || 'Patient'}
          isDoctor={true}
        />
      )}
    </div>
  );
};

export default UserReportView;

