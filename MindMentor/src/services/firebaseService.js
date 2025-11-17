import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  limit,
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '../firebase';

// ==================== AUTHENTICATION SERVICES ====================

/**
 * Register a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} name - User's display name
 * @param {Object} preferences - User's preferences (optional)
 * @returns {Promise<Object>} User object
 */
export const registerUser = async (email, password, name, preferences = {}) => {
  try {
    console.log('🚀 Starting user registration...');
    console.log('Email:', email);
    console.log('Name:', name);
    
    // Create user account
    console.log('1️⃣ Creating user account...');
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ User account created:', user.uid);
    
    // Update user profile with display name
    console.log('2️⃣ Updating user profile...');
    await updateProfile(user, {
      displayName: name
    });
    console.log('✅ User profile updated');

    // Create user document in Firestore
    console.log('3️⃣ Creating user document in Firestore...');
    const userData = {
      uid: user.uid,
      name: name,
      email: email,
      createdAt: serverTimestamp(),
      preferences: {
        theme: 'calm',
        notifications: true,
        emailNotifications: true,
        // User's personal preferences
        favoriteColor: preferences.favoriteColor || 'blue',
        favoritePlace: preferences.favoritePlace || '',
        hobbies: preferences.hobbies || [],
        entertainment: preferences.entertainment || '',
        additionalInfo: preferences.additionalInfo || ''
      }
    };
    
    console.log('User data to store:', userData);
    
    await createUserDocument(user.uid, userData);
    console.log('✅ User document created in Firestore');

    // Sign out the user so they need to login again
    await signOut(auth);
    console.log('✅ User signed out after registration');

    console.log('🎉 Registration completed successfully!');
    return { success: true, user };
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

/**
 * Sign in user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User object
 */
export const signInUser = async (email, password) => {
  try {
    // Trim whitespace from inputs
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      throw new Error('Email and password are required');
    }

    const { user } = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
    return { success: true, user };
  } catch (error) {
    console.error('Sign in error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'Failed to sign in. Please try again.';
    
    if (error.code === 'auth/invalid-login-credentials' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password. Please check your credentials or sign up if you don\'t have an account.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address. Please enter a valid email.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled. Please contact support.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed login attempts. Please try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    // Create a new error with user-friendly message
    const friendlyError = new Error(errorMessage);
    friendlyError.code = error.code;
    friendlyError.originalError = error;
    throw friendlyError;
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ==================== USER SERVICES ====================

/**
 * Create a new user document in Firestore
 * @param {string} userId - User's UID
 * @param {Object} userData - User data to store
 * @returns {Promise<void>}
 */
export const createUserDocument = async (userId, userData) => {
  try {
    console.log('📝 Creating user document...');
    console.log('User ID:', userId);
    console.log('User data:', userData);
    
    const userDocRef = doc(db, 'users', userId);
    console.log('Document reference:', userDocRef);
    
    const documentData = {
      uid: userId,
      ...userData
    };
    
    console.log('Final document data:', documentData);
    
    await setDoc(userDocRef, documentData);
    console.log('✅ User document created successfully');
    
    // Verify the document was created
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      console.log('✅ Document verification successful');
      console.log('Document data:', docSnap.data());
    } else {
      console.log('❌ Document verification failed - document does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error creating user document:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

/**
 * Get user document from Firestore
 * @param {string} userId - User's UID
 * @returns {Promise<Object>} User document
 */
export const getUserDocument = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      throw new Error('User document not found');
    }
  } catch (error) {
    console.error('Error getting user document:', error);
    throw error;
  }
};

/**
 * Update user document in Firestore
 * @param {string} userId - User's UID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateUserDocument = async (userId, updateData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }
};

/**
 * Update user email notification preferences
 * @param {string} userId - User's UID
 * @param {boolean} emailNotifications - Whether to enable email notifications
 * @returns {Promise<void>}
 */
export const updateEmailPreferences = async (userId, emailNotifications) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      emailNotifications: emailNotifications,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating email preferences:', error);
    throw error;
  }
};

// ==================== CHAT SERVICES ====================

/**
 * Send a message to the chat
 * @param {string} userId - User's UID
 * @param {string} message - Message text
 * @param {string} mood - User's current mood
 * @returns {Promise<string>} Message ID
 */
export const sendMessage = async (userId, message, mood = null) => {
  try {
    const messageData = {
      text: message,
      sender: 'user',
      userId: userId,
      mood: mood,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'users', userId, 'messages'), messageData);
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Send AI response message
 * @param {string} userId - User's UID
 * @param {string} response - AI response text
 * @returns {Promise<string>} Message ID
 */
export const sendAIResponse = async (userId, response) => {
  try {
    const messageData = {
      text: response,
      sender: 'ai',
      userId: userId,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'users', userId, 'messages'), messageData);
    return docRef.id;
  } catch (error) {
    console.error('Error sending AI response:', error);
    throw error;
  }
};

/**
 * Get all messages for a user
 * @param {string} userId - User's UID
 * @returns {Promise<Array>} Array of messages
 */
export const getMessages = async (userId) => {
  try {
    const messagesRef = collection(db, 'users', userId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

/**
 * Listen to real-time messages for a user
 * @param {string} userId - User's UID
 * @param {Function} callback - Callback function to handle message updates
 * @returns {Function} Unsubscribe function
 */
export const listenToMessages = (userId, callback) => {
  try {
    const messagesRef = collection(db, 'users', userId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  } catch (error) {
    console.error('Error listening to messages:', error);
    throw error;
  }
};

/**
 * Delete a message
 * @param {string} userId - User's UID
 * @param {string} messageId - Message ID to delete
 * @returns {Promise<void>}
 */
export const deleteMessage = async (userId, messageId) => {
  try {
    const messageRef = doc(db, 'users', userId, 'messages', messageId);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// ==================== MOOD TRACKING SERVICES ====================

/**
 * Add mood entry to user's mood history
 * @param {string} userId - User's UID
 * @param {string} mood - Mood value (happy, sad, angry, tired)
 * @param {string} note - Optional note about the mood
 * @returns {Promise<string>} Mood entry ID
 */
export const addMoodEntry = async (userId, mood, note = '') => {
  try {
    const moodData = {
      userId: userId,
      mood: mood,
      note: note,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    // Store in top-level moodHistory collection for admin access
    const docRef = await addDoc(collection(db, 'moodHistory'), moodData);
    
    // Also store in user's subcollection for user access
    await addDoc(collection(db, 'users', userId, 'moodHistory'), moodData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding mood entry:', error);
    throw error;
  }
};

/**
 * Get user's mood history
 * @param {string} userId - User's UID
 * @param {number} limit - Number of entries to retrieve (default: 30)
 * @returns {Promise<Array>} Array of mood entries
 */
export const getMoodHistory = async (userId, limit = 30) => {
  try {
    const moodRef = collection(db, 'users', userId, 'moodHistory');
    const q = query(moodRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting mood history:', error);
    throw error;
  }
};

/**
 * Listen to real-time mood history
 * @param {string} userId - User's UID
 * @param {Function} callback - Callback function to handle mood updates
 * @returns {Function} Unsubscribe function
 */
export const listenToMoodHistory = (userId, callback) => {
  try {
    const moodRef = collection(db, 'users', userId, 'moodHistory');
    const q = query(moodRef, orderBy('timestamp', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const moods = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(moods);
    });
  } catch (error) {
    console.error('Error listening to mood history:', error);
    throw error;
  }
};

// ==================== ANALYTICS SERVICES ====================

/**
 * Get user analytics data
 * @param {string} userId - User's UID
 * @returns {Promise<Object>} Analytics data
 */
export const getUserAnalytics = async (userId) => {
  try {
    const [messages, moods] = await Promise.all([
      getMessages(userId),
      getMoodHistory(userId, 100)
    ]);

    // Calculate mood distribution
    const moodDistribution = moods.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    // Calculate message statistics
    const messageStats = {
      totalMessages: messages.length,
      userMessages: messages.filter(msg => msg.sender === 'user').length,
      aiMessages: messages.filter(msg => msg.sender === 'ai').length,
      averageResponseTime: calculateAverageResponseTime(messages)
    };

    return {
      moodDistribution,
      messageStats,
      lastActive: moods[0]?.createdAt || null
    };
  } catch (error) {
    console.error('Error getting user analytics:', error);
    throw error;
  }
};

/**
 * Calculate average response time between user and AI messages
 * @param {Array} messages - Array of messages
 * @returns {number} Average response time in seconds
 */
const calculateAverageResponseTime = (messages) => {
  const responseTimes = [];
  
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].sender === 'user' && messages[i + 1].sender === 'ai') {
      const userTime = new Date(messages[i].createdAt).getTime();
      const aiTime = new Date(messages[i + 1].createdAt).getTime();
      responseTimes.push((aiTime - userTime) / 1000); // Convert to seconds
    }
  }
  
  return responseTimes.length > 0 
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
    : 0;
};

// ==================== AI RESPONSE GENERATOR ====================

import geminiService from './geminiService.js';

/**
 * Generate AI response using Gemini 2.5 Flash
 * @param {string} message - User's message
 * @param {string} mood - User's current mood
 * @param {string} userName - User's name (optional)
 * @returns {Promise<string>} AI response
 */
export const generateAIResponse = async (message, mood, userName = '') => {
  try {
    return await geminiService.generateResponse(message, mood, userName);
  } catch (error) {
    console.error('Error generating AI response:', error);
    // Fallback to simple response if Gemini fails
    return getFallbackResponse(mood);
  }
};

/**
 * Get fallback response if Gemini fails
 * @param {string} mood - User's mood
 * @returns {string} Fallback response
 */
const getFallbackResponse = (mood) => {
  const fallbackResponses = {
    happy: "I'm so glad you're feeling happy! 🌟 What's bringing you joy today?",
    sad: "I'm here for you 💙 It's okay to feel sad sometimes. Would you like to talk about what's on your mind?",
    angry: "I understand you're feeling frustrated 💪 Let's work through this together. What's bothering you?",
    tired: "You sound like you need some rest 🌙 Take care of yourself. What helps you relax?",
    anxious: "I'm here to help you feel calm 🌸 Take a deep breath with me. You're safe here.",
    stressed: "Stress can be overwhelming 💙 Let's tackle this one step at a time. What's on your mind?",
    default: "I'm here to listen and support you 💭 How are you feeling today?"
  };

  return fallbackResponses[mood] || fallbackResponses.default;
};


// ==================== ADMIN SERVICES ====================

/**
 * Get all users from the database (Admin only)
 * @returns {Promise<Array>} Array of all users
 */
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date()
      };
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

/**
 * Get all mood entries from the database (Admin only)
 * @param {number} limit - Number of entries to retrieve (default: 100)
 * @returns {Promise<Array>} Array of all mood entries
 */
export const getAllMoodEntries = async (limit = 100) => {
  try {
    const moodRef = collection(db, 'moodHistory');
    const q = query(moodRef, orderBy('timestamp', 'desc'), limit(limit));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().timestamp?.toDate?.() || new Date(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date()
    }));
  } catch (error) {
    console.error('Error fetching all mood entries:', error);
    throw error;
  }
};

/**
 * Listen to all mood entries in real-time (Admin only)
 * @param {Function} callback - Callback function to handle mood data
 * @param {number} limit - Number of entries to retrieve (default: 100)
 * @returns {Function} Unsubscribe function
 */
export const listenToAllMoodEntries = (callback, limit = 100) => {
  try {
    const moodRef = collection(db, 'moodHistory');
    const q = query(moodRef, orderBy('timestamp', 'desc'), limit(limit));
    
    return onSnapshot(q, (querySnapshot) => {
      const moodEntries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().timestamp?.toDate?.() || new Date(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }));
      callback(moodEntries);
    });
  } catch (error) {
    console.error('Error listening to mood entries:', error);
    throw error;
  }
};

/**
 * Create a test user for admin testing (if no users exist)
 * @returns {Promise<string>} Test user ID
 */
export const createTestUser = async () => {
  try {
    const testUserData = {
      name: 'Test User',
      email: 'test@mindmentor.com',
      createdAt: serverTimestamp(),
      emailNotifications: true,
      preferences: {
        theme: 'calm',
        notifications: true,
        emailNotifications: true
      }
    };
    
    const docRef = await addDoc(collection(db, 'users'), testUserData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
};
export const getUserStatistics = async () => {
  try {
    const users = await getAllUsers();
    const totalUsers = users.length;
    
    // Calculate active users (logged in within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsers = users.filter(user => {
      const lastActive = user.lastActive?.toDate?.() || user.createdAt;
      return lastActive >= sevenDaysAgo;
    }).length;
    
    const usersWithEmailNotifications = users.filter(user => user.emailNotifications).length;
    
    return {
      totalUsers,
      activeUsers,
      usersWithEmailNotifications,
      inactiveUsers: totalUsers - activeUsers
    };
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw error;
  }
};

/**
 * Get mood statistics (Admin only)
 * @returns {Promise<Object>} Mood statistics
 */
export const getMoodStatistics = async () => {
  try {
    const moodEntries = await getAllMoodEntries(1000); // Get more entries for better stats
    const totalMoods = moodEntries.length;
    
    // Calculate mood distribution
    const moodCounts = moodEntries.reduce((acc, mood) => {
      acc[mood.mood] = (acc[mood.mood] || 0) + 1;
      return acc;
    }, {});
    
    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, 'happy'
    );
    
    // Calculate daily averages
    const moodByDate = {};
    moodEntries.forEach(mood => {
      const date = mood.createdAt.toLocaleDateString();
      if (!moodByDate[date]) {
        moodByDate[date] = 0;
      }
      moodByDate[date]++;
    });
    
    const uniqueDays = Object.keys(moodByDate).length;
    const averageMoodsPerDay = uniqueDays > 0 ? (totalMoods / uniqueDays).toFixed(1) : 0;
    
    return {
      totalMoods,
      moodCounts,
      mostCommonMood,
      averageMoodsPerDay,
      uniqueDays,
      moodDistribution: moodCounts
    };
  } catch (error) {
    console.error('Error fetching mood statistics:', error);
    throw error;
  }
};

// ==================== DOCTOR AUTHENTICATION SERVICES ====================

/**
 * Get doctor credentials from database
 * @returns {Promise<Object>} Doctor credentials
 */
export const getDoctorCredentials = async () => {
  try {
    const doctorRef = doc(db, 'doctors', 'doctor1');
    const doctorSnap = await getDoc(doctorRef);
    
    if (doctorSnap.exists()) {
      const data = doctorSnap.data();
      return {
        id: 'doctor1',
        email: data.email || 'doctor@gmail.com',
        password: data.password || 'doctor2024',
        name: data.name || 'Dr. MindMentor',
        role: 'doctor',
        active: data.active !== undefined ? data.active : true
      };
    } else {
      // Create default doctor if doesn't exist
      const defaultDoctor = {
        id: 'doctor1',
        email: 'doctor@gmail.com',
        password: 'doctor2024',
        name: 'Dr. MindMentor',
        role: 'doctor',
        createdAt: serverTimestamp(),
        active: true
      };
      
      await setDoc(doctorRef, defaultDoctor);
      console.log('✅ Default doctor credentials created in database');
      return defaultDoctor;
    }
  } catch (error) {
    console.error('Error getting doctor credentials:', error);
    // Fallback credentials if database fails
    console.log('⚠️ Using fallback credentials');
    return {
      id: 'doctor1',
      email: 'doctor@gmail.com',
      password: 'doctor2024',
      name: 'Dr. MindMentor',
      role: 'doctor',
      active: true
    };
  }
};

/**
 * Verify doctor login credentials
 * @param {string} email - Doctor's email
 * @param {string} password - Doctor's password
 * @returns {Promise<Object>} Verification result with doctor data
 */
export const verifyDoctorLogin = async (email, password) => {
  try {
    const doctorData = await getDoctorCredentials();
    const inputEmail = email.trim().toLowerCase();
    const doctorEmail = doctorData.email.toLowerCase();
    const inputPassword = password.trim();
    
    console.log('Verifying login:', {
      inputEmail,
      doctorEmail,
      emailMatch: inputEmail === doctorEmail,
      passwordMatch: inputPassword === doctorData.password,
      active: doctorData.active
    });

    const emailMatch = inputEmail === doctorEmail;
    const passwordMatch = inputPassword === doctorData.password;
    const isActive = doctorData.active !== false; // Default to true if not set

    if (emailMatch && passwordMatch && isActive) {
      return { 
        success: true, 
        doctor: {
          id: doctorData.id,
          email: doctorData.email,
          name: doctorData.name || 'Doctor'
        }
      };
    } else {
      let errorMsg = 'Invalid doctor credentials';
      if (!emailMatch) {
        errorMsg = `Email does not match. Expected: ${doctorEmail}`;
      } else if (!passwordMatch) {
        errorMsg = 'Invalid password';
      } else if (!isActive) {
        errorMsg = 'Doctor account is inactive';
      }
      
      return { 
        success: false, 
        error: errorMsg
      };
    }
  } catch (error) {
    console.error('Error verifying doctor login:', error);
    return { 
      success: false, 
      error: 'Failed to verify credentials. Please try again.' 
    };
  }
};

// ==================== DOCTOR MESSAGING SERVICES ====================

/**
 * Send a message from doctor to a user
 * @param {string} userId - User's UID
 * @param {string} message - Doctor's message
 * @returns {Promise<string>} Message ID
 */
export const sendDoctorMessage = async (userId, message) => {
  try {
    if (!userId || !message) {
      throw new Error('User ID and message are required');
    }

    const messageData = {
      text: message.trim(),
      sender: 'doctor',
      userId: userId,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
      read: false
    };

    console.log('📤 Sending doctor message to user:', userId, messageData);

    // Store in user's doctorMessages subcollection
    const docRef = await addDoc(collection(db, 'users', userId, 'doctorMessages'), messageData);
    
    console.log('✅ Doctor message sent successfully:', docRef.id);

    // Also store in top-level collection for easy access (optional)
    try {
      await addDoc(collection(db, 'doctorMessages'), {
        ...messageData,
        messageId: docRef.id,
        userId: userId
      });
    } catch (topLevelError) {
      // Non-critical error, just log it
      console.warn('Could not store in top-level collection:', topLevelError);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error sending doctor message:', error);
    throw error;
  }
};

/**
 * Get all doctor messages for a user
 * @param {string} userId - User's UID
 * @returns {Promise<Array>} Array of doctor messages
 */
export const getDoctorMessages = async (userId) => {
  try {
    const messagesRef = collection(db, 'users', userId, 'doctorMessages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting doctor messages:', error);
    throw error;
  }
};

/**
 * Listen to real-time doctor messages for a user
 * @param {string} userId - User's UID
 * @param {Function} callback - Callback function to handle message updates
 * @returns {Function} Unsubscribe function
 */
export const listenToDoctorMessages = (userId, callback) => {
  try {
    if (!userId) {
      console.error('No userId provided to listenToDoctorMessages');
      return () => {}; // Return empty unsubscribe function
    }

    const messagesRef = collection(db, 'users', userId, 'doctorMessages');
    
    // Try ordering by timestamp first, fallback to createdAt if needed
    let q;
    try {
      q = query(messagesRef, orderBy('timestamp', 'desc'));
    } catch (err) {
      // If timestamp ordering fails (e.g., no index), try createdAt
      console.warn('Could not order by timestamp, using createdAt:', err);
      q = query(messagesRef, orderBy('createdAt', 'desc'));
    }
    
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure createdAt is properly formatted
        let createdAt = data.createdAt;
        if (data.timestamp) {
          // Handle Firestore Timestamp
          if (data.timestamp.toDate) {
            createdAt = data.timestamp.toDate().toISOString();
          } else if (data.timestamp.seconds) {
            // Handle Timestamp object with seconds
            createdAt = new Date(data.timestamp.seconds * 1000).toISOString();
          }
        }
        
        // Fallback if no timestamp or createdAt
        if (!createdAt) {
          createdAt = new Date().toISOString();
        }
        
        return {
          id: doc.id,
          ...data,
          createdAt: createdAt,
          read: data.read || false,
          text: data.text || ''
        };
      });
      
      // Sort by createdAt as additional safety (newest first)
      messages.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      
      console.log('📬 Doctor messages received:', messages.length, messages);
      callback(messages);
    }, (error) => {
      console.error('Error in doctor messages listener:', error);
      
      // If ordering by timestamp fails, try without ordering
      if (error.code === 'failed-precondition') {
        console.log('Retrying without orderBy...');
        const messagesRef = collection(db, 'users', userId, 'doctorMessages');
        const fallbackUnsubscribe = onSnapshot(messagesRef, (querySnapshot) => {
          const messages = querySnapshot.docs.map(doc => {
            const data = doc.data();
            let createdAt = data.createdAt;
            if (data.timestamp && data.timestamp.toDate) {
              createdAt = data.timestamp.toDate().toISOString();
            } else if (!createdAt) {
              createdAt = new Date().toISOString();
            }
            return {
              id: doc.id,
              ...data,
              createdAt: createdAt,
              read: data.read || false,
              text: data.text || ''
            };
          });
          messages.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
          });
          console.log('📬 Doctor messages received (fallback):', messages.length);
          callback(messages);
        });
        return fallbackUnsubscribe;
      } else {
        callback([]); // Return empty array on error
        return () => {}; // Return empty unsubscribe
      }
    });
  } catch (error) {
    console.error('Error setting up doctor messages listener:', error);
    callback([]); // Return empty array on error
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Mark doctor message as read
 * @param {string} userId - User's UID
 * @param {string} messageId - Message ID
 * @returns {Promise<void>}
 */
export const markDoctorMessageAsRead = async (userId, messageId) => {
  try {
    const messageRef = doc(db, 'users', userId, 'doctorMessages', messageId);
    await updateDoc(messageRef, {
      read: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

/**
 * Get user mood history for doctor review
 * @param {string} userId - User's UID
 * @param {number} entryLimit - Number of entries to retrieve
 * @returns {Promise<Array>} Array of mood entries
 */
export const getUserMoodHistoryForDoctor = async (userId, entryLimit = 100) => {
  try {
    const moodRef = collection(db, 'users', userId, 'moodHistory');
    const q = query(moodRef, orderBy('timestamp', 'desc'), limit(entryLimit));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings for consistency
      createdAt: doc.data().createdAt || doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error getting user mood history:', error);
    throw error;
  }
};

// ==================== VIDEO CALL SERVICES ====================

/**
 * Initiate a video call (doctor calls user or user calls doctor)
 * @param {string} callerId - ID of the caller
 * @param {string} receiverId - ID of the receiver
 * @param {string} callerName - Name of the caller
 * @param {string} roomName - Room name for the call
 * @returns {Promise<string>} Call ID
 */
export const initiateVideoCall = async (callerId, receiverId, callerName, roomName) => {
  try {
    const callData = {
      callerId: callerId,
      receiverId: receiverId,
      callerName: callerName,
      roomName: roomName,
      status: 'ringing', // 'ringing', 'accepted', 'rejected', 'cancelled'
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    // Store call notification for receiver
    const callRef = await addDoc(collection(db, 'users', receiverId, 'incomingCalls'), callData);
    
    // Also store in a top-level collection for easy cleanup
    await setDoc(doc(db, 'videoCalls', callRef.id), {
      ...callData,
      callId: callRef.id
    });

    console.log('📞 Video call initiated:', callRef.id);
    return callRef.id;
  } catch (error) {
    console.error('Error initiating video call:', error);
    throw error;
  }
};

/**
 * Listen to incoming video calls for a user
 * @param {string} userId - User's UID
 * @param {Function} callback - Callback function to handle incoming calls
 * @returns {Function} Unsubscribe function
 */
export const listenToIncomingCalls = (userId, callback) => {
  try {
    if (!userId) {
      console.error('No userId provided to listenToIncomingCalls');
      return () => {};
    }

    const callsRef = collection(db, 'users', userId, 'incomingCalls');
    const q = query(callsRef, orderBy('timestamp', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const calls = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt || (data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString())
          };
        })
        .filter(call => call.status === 'ringing'); // Only active ringing calls
      
      console.log('📞 Incoming calls received:', calls.length);
      if (calls.length > 0) {
        callback(calls[0]); // Return the most recent ringing call
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error in incoming calls listener:', error);
      callback(null);
    });
  } catch (error) {
    console.error('Error setting up incoming calls listener:', error);
    callback(null);
    return () => {};
  }
};

/**
 * Accept a video call
 * @param {string} userId - User's UID
 * @param {string} callId - Call ID
 * @returns {Promise<void>}
 */
export const acceptVideoCall = async (userId, callId) => {
  try {
    const callRef = doc(db, 'users', userId, 'incomingCalls', callId);
    await updateDoc(callRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp()
    });
    
    // Also update top-level call
    const topLevelCallRef = doc(db, 'videoCalls', callId);
    const topLevelCall = await getDoc(topLevelCallRef);
    if (topLevelCall.exists()) {
      await updateDoc(topLevelCallRef, {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      });
    }
    
    console.log('✅ Call accepted:', callId);
  } catch (error) {
    console.error('Error accepting call:', error);
    throw error;
  }
};

/**
 * Reject a video call
 * @param {string} userId - User's UID
 * @param {string} callId - Call ID
 * @returns {Promise<void>}
 */
export const rejectVideoCall = async (userId, callId) => {
  try {
    const callRef = doc(db, 'users', userId, 'incomingCalls', callId);
    await updateDoc(callRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp()
    });
    
    // Also update top-level call
    const topLevelCallRef = doc(db, 'videoCalls', callId);
    const topLevelCall = await getDoc(topLevelCallRef);
    if (topLevelCall.exists()) {
      await updateDoc(topLevelCallRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      });
    }
    
    console.log('❌ Call rejected:', callId);
  } catch (error) {
    console.error('Error rejecting call:', error);
    throw error;
  }
};

/**
 * Cancel a video call (by caller)
 * @param {string} receiverId - Receiver's UID
 * @param {string} callId - Call ID
 * @returns {Promise<void>}
 */
export const cancelVideoCall = async (receiverId, callId) => {
  try {
    const callRef = doc(db, 'users', receiverId, 'incomingCalls', callId);
    await updateDoc(callRef, {
      status: 'cancelled',
      cancelledAt: serverTimestamp()
    });
    
    // Also update top-level call
    const topLevelCallRef = doc(db, 'videoCalls', callId);
    const topLevelCall = await getDoc(topLevelCallRef);
    if (topLevelCall.exists()) {
      await updateDoc(topLevelCallRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp()
      });
    }
    
    console.log('🚫 Call cancelled:', callId);
  } catch (error) {
    console.error('Error cancelling call:', error);
    throw error;
  }
};

// ==================== EXPORT ALL SERVICES ====================

export default {
  // Authentication
  registerUser,
  signInUser,
  signOutUser,
  onAuthStateChange,
  
  // User Management
  createUserDocument,
  getUserDocument,
  updateUserDocument,
  updateEmailPreferences,
  
  // Chat Services
  sendMessage,
  sendAIResponse,
  getMessages,
  listenToMessages,
  deleteMessage,
  
  // Mood Tracking
  addMoodEntry,
  getMoodHistory,
  listenToMoodHistory,
  
  // Admin services
  getAllUsers,
  getAllMoodEntries,
  listenToAllMoodEntries,
  getUserStatistics,
  getMoodStatistics,
  createTestUser,
  
  // Analytics
  getUserAnalytics,
  
  // AI Response
  generateAIResponse,
  
  // Doctor Authentication
  getDoctorCredentials,
  verifyDoctorLogin,
  
  // Doctor Messaging
  sendDoctorMessage,
  getDoctorMessages,
  listenToDoctorMessages,
  markDoctorMessageAsRead,
  
  // Video Call Services
  initiateVideoCall,
  listenToIncomingCalls,
  acceptVideoCall,
  rejectVideoCall,
  cancelVideoCall,
  getUserMoodHistoryForDoctor
};
