import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Send, Smile, Frown, Angry, Moon, Mic, MicOff, Square, Play, Pause, BarChart3, Settings, Newspaper, Music, Heart, MessageSquare, X, Phone } from 'lucide-react';
import HumanLikeCharacter from '../components/HumanLikeCharacter';
import NewsModal from '../components/NewsModal';
import MusicRecommendations from '../components/MusicRecommendations';
import VideoCall from '../components/VideoCall';
import IncomingCall from '../components/IncomingCall';
import { getUserDocument } from '../services/firebaseService';
import { getPersonalizedGreeting, getDynamicBackgroundClass, applyDynamicColors } from '../services/themeService';
import { 
  signOutUser, 
  onAuthStateChange, 
  listenToMessages, 
  sendMessage, 
  sendAIResponse, 
  generateAIResponse,
  addMoodEntry,
  listenToDoctorMessages,
  markDoctorMessageAsRead,
  listenToIncomingCalls,
  initiateVideoCall
} from '../services/firebaseService';
import { getCallRoomName } from '../services/twilioService';

const Home = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [personalizedGreeting, setPersonalizedGreeting] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showDoctorMessages, setShowDoctorMessages] = useState(false);
  const [doctorMessages, setDoctorMessages] = useState([]);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const audioRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const navigate = useNavigate();

  const moods = [
    { emoji: '😊', label: 'Happy', icon: Smile, color: 'text-yellow-400' },
    { emoji: '😔', label: 'Sad', icon: Frown, color: 'text-blue-400' },
    { emoji: '😡', label: 'Angry', icon: Angry, color: 'text-red-400' },
    { emoji: '😴', label: 'Tired', icon: Moon, color: 'text-purple-400' }
  ];

  useEffect(() => {
    let messagesUnsubscribe = null;
    let doctorMessagesUnsubscribe = null;
    let incomingCallsUnsubscribe = null;

    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        setUser(user);
        
        // Load regular messages
        messagesUnsubscribe = loadMessages(user.uid);
        
        // Load doctor messages
        doctorMessagesUnsubscribe = listenToDoctorMessages(user.uid, (messagesData) => {
          console.log('📬 Updating doctor messages:', messagesData);
          setDoctorMessages(messagesData);
        });
        
        // Listen to incoming calls
        incomingCallsUnsubscribe = listenToIncomingCalls(user.uid, (call) => {
          if (call) {
            console.log('📞 Incoming call received:', call);
            setIncomingCall(call);
          } else {
            setIncomingCall(null);
          }
        });
        
        // Load user data and apply theming
        try {
          const userDoc = await getUserDocument(user.uid);
          setUserData(userDoc);
          
          // Apply dynamic colors based on favorite color
          if (userDoc.preferences?.favoriteColor) {
            applyDynamicColors(userDoc.preferences.favoriteColor);
          }
          
          // Generate personalized greeting
          const greeting = getPersonalizedGreeting(userDoc);
          setPersonalizedGreeting(greeting);
        } catch (error) {
          console.error('Error loading user data:', error);
          // Fallback greeting
          setPersonalizedGreeting(`Welcome back, ${user.displayName || 'Friend'} 💬`);
        }
      } else {
        navigate('/login');
      }
    });

    return () => {
      unsubscribe();
      if (messagesUnsubscribe) messagesUnsubscribe();
      if (doctorMessagesUnsubscribe) doctorMessagesUnsubscribe();
      if (incomingCallsUnsubscribe) incomingCallsUnsubscribe();
    };
  }, [navigate]);

  const loadDoctorMessages = (userId) => {
    return listenToDoctorMessages(userId, (messagesData) => {
      setDoctorMessages(messagesData);
    });
  };

  const handleMarkAsRead = async (messageId) => {
    if (user) {
      try {
        await markDoctorMessageAsRead(user.uid, messageId);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const unreadCount = doctorMessages.filter(msg => !msg.read).length;

  const loadMessages = (userId) => {
    return listenToMessages(userId, (messagesData) => {
      setMessages(messagesData);
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigateToMoodTracking = () => {
    navigate('/mood-tracking');
  };

  const handleNavigateToSettings = () => {
    navigate('/settings');
  };

  const handleShowNews = () => {
    setShowNewsModal(true);
  };

  const handleShowMusic = () => {
    setShowMusicModal(true);
  };


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      // Send user message
      await sendMessage(user.uid, newMessage, selectedMood);
      
      // Add mood entry if mood is selected
      if (selectedMood) {
        await addMoodEntry(user.uid, selectedMood, newMessage);
      }
      
      setNewMessage('');
      setIsTyping(true);

      // Generate and send AI response using Gemini
      setTimeout(async () => {
        try {
          const aiResponse = await generateAIResponse(newMessage, selectedMood, user.displayName || '');
          await sendAIResponse(user.uid, aiResponse);
        } catch (error) {
          console.error('Error generating AI response:', error);
          // Fallback response if Gemini fails
          const fallbackResponse = "I'm here to listen and support you 💭 How are you feeling today?";
          await sendAIResponse(user.uid, fallbackResponse);
        } finally {
          setIsTyping(false);
        }
      }, 1500);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };


  const handleCharacterClick = (interaction) => {
    // Focus on the message input
    const messageInput = document.querySelector('input[placeholder="Type your message..."]');
    if (messageInput) {
      messageInput.focus();
    }
    
    console.log('Character clicked:', interaction);
  };

  const handleCharacterSpeak = (speech) => {
    // You can add additional logic here when character speaks
    console.log('Character speaking:', speech);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioChunks([]);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      setAudioChunks(chunks);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      console.log('🎤 Started recording...');
    } catch (error) {
      console.error('🎤 Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      console.log('🎤 Stopped recording...');
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const sendVoiceMessage = async () => {
    if (audioBlob && user) {
      try {
        // Convert audio blob to text using Web Speech API or send as audio
        // For now, we'll send it as a voice message with a placeholder text
        const voiceMessage = {
          text: "🎤 Voice message",
          sender: 'user',
          timestamp: new Date(),
          mood: selectedMood,
          type: 'voice',
          audioBlob: audioBlob
        };

        await sendMessage(user.uid, voiceMessage.text, selectedMood);
        
        // Clear the recording
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        
        // Generate AI response
        setTimeout(async () => {
          setIsTyping(true);
          const aiResponse = await generateAIResponse(voiceMessage.text, selectedMood);
          await sendAIResponse(user.uid, aiResponse);
          setIsTyping(false);
        }, 1000);

        console.log('🎤 Voice message sent!');
      } catch (error) {
        console.error('🎤 Error sending voice message:', error);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    clearInterval(recordingIntervalRef.current);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Get dynamic background class based on user's favorite color
  const dynamicBgClass = userData?.preferences?.favoriteColor 
    ? getDynamicBackgroundClass(userData.preferences.favoriteColor)
    : 'gradient-bg';

  return (
    <div className={`min-h-screen ${dynamicBgClass}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-3 md:p-4 flex justify-between items-center"
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-xl font-semibold text-slate-800 truncate">
            {personalizedGreeting || `Welcome back, ${user?.displayName || 'Friend'} 💬`}
          </h1>
          <p className="text-slate-600 text-xs md:text-sm">How are you feeling today?</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Video Call Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              if (user) {
                try {
                  // Initiate call to doctor
                  const roomName = getCallRoomName(user.uid);
                  await initiateVideoCall(user.uid, 'doctor', user.displayName || 'User', roomName);
                  setShowVideoCall(true);
                } catch (error) {
                  console.error('Error initiating call:', error);
                  setShowVideoCall(true); // Still open video call
                }
              }
            }}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors flex-shrink-0"
            title="Video Call with Doctor"
          >
            <Phone className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>

          {/* Doctor Messages Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDoctorMessages(true)}
            className="relative p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition-colors flex-shrink-0"
            title="Doctor Messages"
          >
            <Heart className="w-4 h-4 md:w-5 md:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShowMusic}
            className="p-2 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-600 transition-colors flex-shrink-0"
            title="Tamil Motivational Songs"
          >
            <Music className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShowNews}
            className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition-colors flex-shrink-0"
            title="Mental Health News"
          >
            <Newspaper className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNavigateToMoodTracking}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors flex-shrink-0"
            title="View Mood Tracking"
          >
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNavigateToSettings}
          className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors flex-shrink-0"
          title="Settings"
        >
          <Settings className="w-4 h-4 md:w-5 md:h-5" />
        </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors flex-shrink-0 ml-2"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        {/* Animated Character */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-14 md:mb-18 character-section"
        >
          <HumanLikeCharacter 
            mood={selectedMood} 
            userName={user?.displayName}
            onCharacterClick={handleCharacterClick}
            onCharacterSpeak={handleCharacterSpeak}
          />
        </motion.div>

        {/* Mood Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 md:mb-10 mood-section"
        >
          <h3 className="text-slate-800 text-center mb-6 text-lg md:text-xl">How are you feeling?</h3>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {moods.map((mood, index) => (
              <motion.button
                key={mood.label}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMood(mood.label.toLowerCase())}
                className={`p-4 md:p-5 rounded-xl md:rounded-2xl glass-effect transition-all duration-200 min-w-[80px] md:min-w-[100px] ${
                  selectedMood === mood.label.toLowerCase()
                    ? 'bg-blue-100 scale-105 md:scale-110 border-blue-300 shadow-lg'
                    : 'bg-white/80 hover:bg-blue-50 border-blue-200/50'
                }`}
              >
                <div className="text-3xl md:text-4xl mb-2 md:mb-3">{mood.emoji}</div>
                <div className="text-slate-700 text-xs md:text-sm font-medium">{mood.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/90 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 shadow-2xl border border-blue-200/30 chat-section"
        >
          {/* Messages */}
          <div className="h-64 md:h-96 overflow-y-auto mb-4 space-y-3 md:space-y-4 custom-scrollbar">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white ml-auto' 
                        : 'bg-slate-100 text-slate-800 mr-auto'
                    }`}
                  >
                    <div className="text-sm md:text-base">{message.text}</div>
                    {message.mood && (
                      <div className="text-xs opacity-70 mt-1">
                        Mood: {message.mood}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="max-w-xs md:max-w-md px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl bg-slate-100 text-slate-800 mr-auto">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-white border border-blue-200 rounded-lg md:rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-sm md:text-base"
            />
            
            {/* Voice Recording Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 md:p-3 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
              title={isRecording ? 'Stop recording' : 'Start voice recording'}
            >
              {isRecording ? <Square className="w-4 h-4 md:w-5 md:h-5" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
            </motion.button>

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 md:p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          </div>

          {/* Voice Recording Controls */}
          {(isRecording || audioBlob) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-white/90 backdrop-blur-md rounded-lg border border-blue-200/30"
            >
              {isRecording ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-700">
                      Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cancelRecording}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              ) : audioBlob ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={isPlaying ? pauseRecording : playRecording}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </motion.button>
                    <span className="text-sm text-slate-700">Voice message ready</span>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={cancelRecording}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendVoiceMessage}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                      Send Voice
                    </motion.button>
                  </div>
                </div>
              ) : null}
              
              {/* Hidden audio element for playback */}
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                />
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Floating Affirmations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center space-y-2"
        >
          <p className="text-white/60 text-sm animate-pulse">
            "You're doing great 💖"
          </p>
        </motion.div>
      </div>

      {/* News Modal */}
      <NewsModal 
        isOpen={showNewsModal} 
        onClose={() => setShowNewsModal(false)} 
      />

      {/* Music Recommendations Modal */}
      <MusicRecommendations 
        isOpen={showMusicModal} 
        onClose={() => setShowMusicModal(false)}
        mood={selectedMood}
        interests={userData?.preferences?.hobbies || []}
      />

      {/* Incoming Call Notification */}
      {incomingCall && user && (
        <IncomingCall
          call={{ ...incomingCall, receiverId: user.uid }}
          onAccept={(call) => {
            setIncomingCall(null);
            setShowVideoCall(true);
          }}
          onReject={(callId) => {
            setIncomingCall(null);
          }}
          onTimeout={(callId) => {
            setIncomingCall(null);
          }}
        />
      )}

      {/* Video Call Component */}
      {showVideoCall && user && (
        <VideoCall
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          identity={user.uid}
          roomName={getCallRoomName(user.uid)}
          displayName="Doctor"
          isDoctor={false}
        />
      )}

      {/* Doctor Messages Modal */}
      <AnimatePresence>
        {showDoctorMessages && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-effect rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-green-200/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Messages from Doctor
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'No unread messages'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDoctorMessages(false)}
                  className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {doctorMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">💬</div>
                    <p className="text-slate-600">No messages from your doctor yet.</p>
                    <p className="text-sm text-slate-500 mt-2">Your doctor will send you messages here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {doctorMessages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => !message.read && handleMarkAsRead(message.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          message.read
                            ? 'bg-white/50 border-green-200'
                            : 'bg-green-50 border-green-400 shadow-md cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-700">From Doctor</span>
                          </div>
                          {!message.read && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-slate-800 mb-2">{message.text}</p>
                        <div className="text-xs text-slate-500">
                          {message.createdAt ? (
                            <>
                              {new Date(message.createdAt).toLocaleDateString()} at{' '}
                              {new Date(message.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </>
                          ) : (
                            'Just now'
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
