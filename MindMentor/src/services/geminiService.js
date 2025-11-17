// Gemini AI Service for MindMentor
// This service handles AI responses using Google's Gemini 2.5 Flash API

import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    // Initialize Gemini with your API key
    this.apiKey = 'AIzaSyC8f5vUsuzQYyXx7-NmCMmsZiSmn9Gxng0';
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  /**
   * Generate AI response using Gemini 2.5 Flash
   * @param {string} userMessage - User's message
   * @param {string} mood - User's current mood (happy, sad, angry, tired, etc.)
   * @param {string} userName - User's name (optional)
   * @returns {Promise<string>} AI response
   */
  async generateResponse(userMessage, mood = 'default', userName = '') {
    try {
      // Create a comprehensive prompt for mental health support
      const systemPrompt = this.createSystemPrompt(mood, userName);
      
      const prompt = `${systemPrompt}

User's current mood: ${mood}
User's message: "${userMessage}"

Please provide a supportive, empathetic, and helpful response. Keep it conversational and warm, appropriate for a mental health companion.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text.trim();
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      
      // Fallback to a simple response if Gemini fails
      return this.getFallbackResponse(mood);
    }
  }

  /**
   * Create system prompt based on mood and context
   * @param {string} mood - User's mood
   * @param {string} userName - User's name
   * @returns {string} System prompt
   */
  createSystemPrompt(mood, userName) {
    const basePrompt = `You are MindMentor, a compassionate AI mental health companion. You provide supportive, empathetic responses to help users with their mental wellbeing. You are warm, understanding, and non-judgmental.

Key guidelines:
- Always be supportive and encouraging
- Use appropriate emojis to convey warmth
- Keep responses conversational and personal
- Provide practical advice when appropriate
- Never give medical advice - always encourage professional help for serious concerns
- Be empathetic and validate their feelings
- Ask follow-up questions to show you care
- Keep responses concise but meaningful (2-4 sentences typically)

${userName ? `The user's name is ${userName}.` : ''}`;

    const moodSpecificGuidance = {
      happy: "The user is feeling happy - celebrate with them, ask what's bringing them joy, and encourage them to savor the moment.",
      sad: "The user is feeling sad - be extra gentle and supportive, validate their feelings, and offer comfort. Ask if they want to talk about what's bothering them.",
      angry: "The user is feeling angry - acknowledge their frustration, help them process these feelings constructively, and suggest calming techniques.",
      tired: "The user is feeling tired - be understanding about their fatigue, suggest rest or relaxation, and ask what might help them recharge.",
      anxious: "The user is feeling anxious - be calming and reassuring, suggest breathing techniques, and help them feel safe and supported.",
      stressed: "The user is feeling stressed - offer practical stress management tips, validate their feelings, and help them break down overwhelming situations.",
      default: "The user hasn't specified a mood - be warm and welcoming, ask how they're feeling, and let them know you're there to listen."
    };

    return `${basePrompt}\n\nMood-specific guidance: ${moodSpecificGuidance[mood] || moodSpecificGuidance.default}`;
  }

  /**
   * Get fallback response if Gemini API fails
   * @param {string} mood - User's mood
   * @returns {string} Fallback response
   */
  getFallbackResponse(mood) {
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
  }

  /**
   * Generate a daily positive message
   * @param {string} userName - User's name
   * @param {string} messageType - Type of message (morning, evening, etc.)
   * @returns {Promise<string>} Daily message
   */
  async generateDailyMessage(userName = '', messageType = 'morning') {
    try {
      const timeContext = {
        morning: "morning motivation and encouragement",
        evening: "evening reflection and gratitude",
        afternoon: "afternoon check-in and support"
      };

      const prompt = `Generate a short, uplifting ${timeContext[messageType] || 'supportive'} message for a mental health app. 
      ${userName ? `Address the user as ${userName}.` : ''} 
      Keep it positive, encouraging, and under 50 words. Include appropriate emojis.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text.trim();
    } catch (error) {
      console.error('Error generating daily message:', error);
      return this.getFallbackDailyMessage(messageType, userName);
    }
  }

  /**
   * Get fallback daily message
   * @param {string} messageType - Type of message
   * @param {string} userName - User's name
   * @returns {string} Fallback message
   */
  getFallbackDailyMessage(messageType, userName) {
    const name = userName ? ` ${userName}` : '';
    
    const messages = {
      morning: `Good morning${name}! 🌅 Today is a new opportunity to take care of your mental health. You've got this! 💪`,
      evening: `Good evening${name}! 🌙 Take a moment to reflect on today's small victories. You're doing great! ✨`,
      afternoon: `Good afternoon${name}! ☀️ Remember to take breaks and be kind to yourself today. 💙`
    };

    return messages[messageType] || `Hello${name}! 💙 Remember, you're stronger than you think. Take care of yourself today! 🌟`;
  }

  /**
   * Generate AI-powered Tamil motivational song recommendations based on mood and interests
   * @param {string} mood - User's current mood (happy, sad, angry, tired, etc.)
   * @param {Array} interests - User's interests/hobbies
   * @param {number} count - Number of song recommendations to generate (default: 5)
   * @returns {Promise<Array>} Array of song recommendations with title, artist, description
   */
  async generateSongRecommendations(mood = 'default', interests = [], count = 5) {
    try {
      const moodContext = {
        happy: "energetic, uplifting, celebratory Tamil motivational songs that enhance positive energy",
        sad: "soothing, healing, comforting Tamil songs that provide emotional support and hope",
        angry: "powerful, empowering Tamil anthems that channel strength and determination",
        tired: "energizing, motivational Tamil tracks that boost energy and motivation",
        anxious: "calming, peaceful Tamil songs that promote relaxation and peace",
        stressed: "motivational, inspiring Tamil songs that help manage stress",
        default: "motivational and inspiring Tamil songs"
      };

      const interestsText = interests && interests.length > 0 
        ? `The user's interests include: ${interests.join(', ')}. Consider songs that might relate to these interests.`
        : '';

      const prompt = `You are a music recommendation expert specializing in Tamil motivational songs. 

User's current mood: ${mood}
${interestsText}

Recommend ${count} popular Tamil motivational songs that would be most beneficial for this user's current mood and interests.

For each song, provide:
1. Exact song title (in Tamil or English)
2. Artist/Composer name (e.g., A.R. Rahman, Anirudh Ravichander, Dhanush, etc.)
3. A brief description (1 sentence) explaining why this song suits their mood
4. Energy level: "low", "medium", "high", or "very-high"
5. Relevant interests the song might relate to (from: Music, Sports, Gaming, Art, Reading, etc.)

Format your response as a JSON array. Each song should have:
{
  "title": "Song Title",
  "artist": "Artist Name",
  "description": "Why this song is recommended for their mood",
  "energy": "high",
  "interests": ["Music", "Sports"],
  "mood": "${mood}"
}

Return ONLY the JSON array, no additional text. Ensure it's valid JSON.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Extract JSON from the response (handle cases where AI adds markdown or extra text)
      let jsonText = text;
      if (text.startsWith('```json')) {
        jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (text.startsWith('```')) {
        jsonText = text.replace(/```\n?/g, '').trim();
      }
      
      try {
        const songs = JSON.parse(jsonText);
        // Ensure it's an array
        return Array.isArray(songs) ? songs.slice(0, count) : [songs].slice(0, count);
      } catch (parseError) {
        console.error('Error parsing AI song recommendations:', parseError);
        console.error('Response text:', text);
        return this.getFallbackSongRecommendations(mood, count);
      }
    } catch (error) {
      console.error('Error generating AI song recommendations:', error);
      return this.getFallbackSongRecommendations(mood, count);
    }
  }

  /**
   * Get fallback song recommendations if AI fails
   * @param {string} mood - User's mood
   * @param {number} count - Number of recommendations
   * @returns {Array} Fallback song recommendations
   */
  getFallbackSongRecommendations(mood, count = 5) {
    const fallbackSongs = {
      happy: [
        { title: "Verithanam", artist: "A.R. Rahman", description: "High-energy motivational track to boost your spirits", energy: "very-high", interests: ["Sports", "Music"], mood: "happy" },
        { title: "Singappenney", artist: "A.R. Rahman", description: "Celebratory song that empowers and energizes", energy: "high", interests: ["Music", "Sports"], mood: "happy" },
        { title: "Rowdy Baby", artist: "Dhanush, Anirudh Ravichander", description: "Catchy beat that brings positive energy", energy: "high", interests: ["Music", "Gaming"], mood: "happy" }
      ],
      sad: [
        { title: "Idhazhin Oram", artist: "A.R. Rahman", description: "Soothing melody that brings hope and comfort", energy: "low", interests: ["Music", "Reading"], mood: "sad" },
        { title: "Vellai Pookal", artist: "A.R. Rahman", description: "Peaceful and healing melody", energy: "low", interests: ["Music", "Art"], mood: "sad" }
      ],
      angry: [
        { title: "Vikram Title Track", artist: "Anirudh Ravichander", description: "Intense and empowering motivational track", energy: "very-high", interests: ["Music", "Sports"], mood: "angry" },
        { title: "Thee Thalapathy", artist: "Anirudh Ravichander", description: "Powerful anthem for inner strength and resilience", energy: "very-high", interests: ["Music", "Sports"], mood: "angry" }
      ],
      tired: [
        { title: "Beast Mode", artist: "Anirudh Ravichander", description: "Get ready to conquer the day with renewed energy", energy: "very-high", interests: ["Music", "Sports"], mood: "tired" },
        { title: "Neruppu Da", artist: "Anirudh Ravichander", description: "Fire up your motivation and energy levels", energy: "high", interests: ["Music", "Sports"], mood: "tired" }
      ]
    };

    return (fallbackSongs[mood] || fallbackSongs.happy).slice(0, count);
  }
}

// Create and export a singleton instance
const geminiService = new GeminiService();
export default geminiService;

