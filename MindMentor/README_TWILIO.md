# 🎥 Twilio Video Calling Setup

## Prerequisites

1. **Twilio Account**: Sign up at [https://www.twilio.com/](https://www.twilio.com/)
2. **Twilio Console Access**: Get your credentials from [https://console.twilio.com/](https://console.twilio.com/)

## Setup Instructions

### 1. Get Twilio Credentials

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Account** → **API Keys & Tokens**
3. Note down your:
   - **Account SID** (starts with `AC...`)
   - Create an **API Key**:
     - Go to **API Keys** section
     - Click **Create API Key**
     - Save the **API Key SID** (starts with `SK...`)
     - Save the **API Secret** (shown only once!)

### 2. Configure Environment Variables

1. Create a `.env` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env
```

2. Edit `.env` and add your Twilio credentials:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret_here
PORT=3001
```

### 3. Start the Server

In one terminal, start the token server:

```bash
npm run server
```

Or:

```bash
npm start
```

You should see:
```
🚀 Twilio Token Server running on http://localhost:3001
```

### 4. Start the Frontend

In another terminal, start the Vite dev server:

```bash
npm run dev
```

The frontend will automatically use `http://localhost:3001` for token generation.

## Testing

1. Open the app in your browser
2. Click the video call button (phone icon)
3. Grant camera/microphone permissions
4. The call should connect!

## Troubleshooting

### Server not starting
- Check if port 3001 is already in use
- Verify all dependencies are installed: `npm install`
- Check `.env` file exists and has correct credentials

### Token generation fails
- Verify Twilio credentials in `.env` are correct
- Check server console for error messages
- Ensure Account SID, API Key, and API Secret are all set

### CORS errors
- The server is configured with CORS enabled
- If issues persist, check server is running on correct port

### Video call not connecting
- Check browser console for errors
- Verify camera/microphone permissions are granted
- Check network tab to see if token request succeeds

## Production Deployment

For production, set the server URL in your environment:

1. Set `VITE_TWILIO_SERVER_URL` to your production server URL
2. Or update `twilioService.js` to use your production endpoint

Example:
```env
VITE_TWILIO_SERVER_URL=https://your-server.com
```

## Server Endpoints

- `POST /getToken` - Generate Twilio Video access token
  - Body: `{ identity: string, roomName: string }`
  - Returns: `{ token: string, identity: string, roomName: string }`

- `GET /health` - Health check endpoint

- `GET /` - Server info endpoint

