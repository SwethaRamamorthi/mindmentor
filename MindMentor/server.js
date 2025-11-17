import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Twilio configuration
// Get Account SID from your Twilio Console: https://console.twilio.com/
// IMPORTANT: Never commit your Twilio credentials to git!
// Set them as environment variables or in a .env file (which is gitignored)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'YOUR_ACCOUNT_SID_HERE';
const TWILIO_API_KEY = process.env.TWILIO_API_KEY || 'YOUR_API_KEY_HERE';
const TWILIO_API_SECRET = process.env.TWILIO_API_SECRET || 'YOUR_API_SECRET_HERE';

// Initialize Twilio client (for token generation)
const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

/**
 * Generate a Twilio Video access token
 * POST /getToken
 * Body: { identity: string, roomName: string }
 */
app.post('/getToken', async (req, res) => {
  try {
    const { identity, roomName } = req.body;

    // Validate input
    if (!identity || !roomName) {
      return res.status(400).json({
        error: 'Missing required fields: identity and roomName are required'
      });
    }

    // Check if Twilio credentials are configured
    if (TWILIO_ACCOUNT_SID === 'YOUR_ACCOUNT_SID_HERE' || !TWILIO_ACCOUNT_SID) {
      return res.status(500).json({
        error: 'Twilio Account SID not configured. Please set TWILIO_ACCOUNT_SID environment variable. Get it from: https://console.twilio.com/'
      });
    }

    if (!TWILIO_API_KEY || TWILIO_API_KEY === 'YOUR_API_KEY') {
      return res.status(500).json({
        error: 'Twilio API Key not configured. Please set TWILIO_API_KEY environment variable.'
      });
    }

    if (!TWILIO_API_SECRET || TWILIO_API_SECRET === 'YOUR_API_SECRET') {
      return res.status(500).json({
        error: 'Twilio API Secret not configured. Please set TWILIO_API_SECRET environment variable.'
      });
    }

    console.log(`📞 Generating token for identity: ${identity}, room: ${roomName}`);

    // Create access token
    const token = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY,
      TWILIO_API_SECRET,
      { identity: identity }
    );

    // Grant video access
    const videoGrant = new VideoGrant({
      room: roomName,
    });

    token.addGrant(videoGrant);

    // Generate and return token
    const jwtToken = token.toJwt();

    console.log(`✅ Token generated successfully for ${identity}`);

    res.json({
      token: jwtToken,
      identity: identity,
      roomName: roomName
    });

  } catch (error) {
    console.error('❌ Error generating token:', error);
    res.status(500).json({
      error: 'Failed to generate token',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Twilio token server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Twilio Video Token Server',
    endpoints: {
      'POST /getToken': 'Generate Twilio Video access token',
      'GET /health': 'Health check'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Twilio Token Server running on http://localhost:${PORT}`);
  console.log(`\n📋 Twilio Configuration:`);
  console.log(`   ✅ API Key: ${TWILIO_API_KEY.substring(0, 10)}...${TWILIO_API_KEY.substring(TWILIO_API_KEY.length - 4)}`);
  console.log(`   ✅ API Secret: ${TWILIO_API_SECRET.substring(0, 6)}...${TWILIO_API_SECRET.substring(TWILIO_API_SECRET.length - 4)}`);
  
  if (TWILIO_ACCOUNT_SID === 'YOUR_ACCOUNT_SID_HERE' || !TWILIO_ACCOUNT_SID) {
    console.log(`\n⚠️  WARNING: Twilio Account SID not configured!`);
    console.log(`   Get your Account SID from: https://console.twilio.com/`);
    console.log(`   It starts with "AC" and set it as environment variable TWILIO_ACCOUNT_SID`);
    console.log(`   Or update server.js directly.`);
  } else {
    console.log(`   ✅ Account SID: ${TWILIO_ACCOUNT_SID.substring(0, 10)}...${TWILIO_ACCOUNT_SID.substring(TWILIO_ACCOUNT_SID.length - 4)}`);
    console.log(`\n✅ Server is ready to generate tokens!`);
  }
});

