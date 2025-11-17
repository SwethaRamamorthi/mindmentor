/**
 * Twilio Video Service
 * Handles video call functionality with Twilio
 */

// Use local server in development, or specify your server URL for production
const TWILIO_SERVER_URL = import.meta.env.VITE_TWILIO_SERVER_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : 'http://localhost:3001');

/**
 * Get an access token for Twilio Video
 * @param {string} identity - User identity (userId or 'doctor')
 * @param {string} roomName - Room name for the call
 * @returns {Promise<string>} Access token
 */
export const getTwilioToken = async (identity, roomName) => {
  try {
    console.log(`🔑 Requesting Twilio token from ${TWILIO_SERVER_URL}/getToken`);
    console.log(`   Identity: ${identity}, Room: ${roomName}`);
    
    const response = await fetch(`${TWILIO_SERVER_URL}/getToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identity: identity,
        roomName: roomName,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText || response.statusText };
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.token) {
      throw new Error('Token not found in server response');
    }

    console.log('✅ Twilio token received successfully');
    return data.token;
  } catch (error) {
    console.error('❌ Error getting Twilio token:', error);
    
    // Provide helpful error messages
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(
        `Cannot connect to token server at ${TWILIO_SERVER_URL}.\n` +
        `Please ensure:\n` +
        `1. The server is running (npm run server or npm start)\n` +
        `2. Server is accessible at ${TWILIO_SERVER_URL}\n` +
        `3. CORS is enabled on the server`
      );
    }
    
    throw error;
  }
};

/**
 * Generate a unique room name for a call between user and doctor
 * @param {string} userId - User's ID
 * @returns {string} Room name
 */
export const generateRoomName = (userId) => {
  // Create a consistent room name based on user ID
  return `call-${userId}`;
};

/**
 * Create room name for doctor-to-user call
 * @param {string} userId - User's ID
 * @returns {string} Room name
 */
export const getCallRoomName = (userId) => {
  return generateRoomName(userId);
};
