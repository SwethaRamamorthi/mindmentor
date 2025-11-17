/**
 * Tamil Motivational Songs Service
 * Provides daily song recommendations based on mood and interests
 * Now enhanced with AI-powered recommendations!
 */

import geminiService from './geminiService.js';

// Comprehensive Tamil motivational songs database
const tamilMotivationalSongs = {
  // Happy/Energized Mood Songs
  happy: [
    {
      title: "Singappenney",
      artist: "A.R. Rahman",
      youtubeId: "search", // Users can search for the song
      spotifyUrl: "https://open.spotify.com/search/singappenney",
      mood: "happy",
      interests: ["Music", "Sports", "Gaming"],
      description: "Celebratory song that empowers and energizes",
      energy: "high"
    },
    {
      title: "Verithanam",
      artist: "A.R. Rahman",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/verithanam",
      mood: "happy",
      interests: ["Sports", "Music"],
      description: "High-energy motivational track to boost your spirits",
      energy: "very-high"
    },
    {
      title: "Petta Parak",
      artist: "Anirudh Ravichander",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/petta%20parak",
      mood: "happy",
      interests: ["Music", "Sports"],
      description: "Power-packed motivational anthem",
      energy: "high"
    },
    {
      title: "Rowdy Baby",
      artist: "Dhanush, Anirudh Ravichander",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/rowdy%20baby",
      mood: "happy",
      interests: ["Music", "Gaming"],
      description: "Catchy beat that brings positive energy",
      energy: "high"
    },
    {
      title: "Kadhal Cricket",
      artist: "Anirudh Ravichander",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/kadhal%20cricket",
      mood: "happy",
      interests: ["Sports", "Music"],
      description: "Energetic song perfect for staying motivated",
      energy: "high"
    },
    {
      title: "Vellaikkara",
      artist: "Anirudh Ravichander",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/vellaikkara",
      mood: "happy",
      interests: ["Music", "Sports"],
      description: "Upbeat track to keep your spirits high",
      energy: "high"
    },
    {
      title: "Thee Illa Endha Tharam",
      artist: "Dhanush",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/thee%20illa",
      mood: "happy",
      interests: ["Music", "Art"],
      description: "Positive vibes with inspiring lyrics",
      energy: "medium"
    },
    {
      title: "Once Upon a Time",
      artist: "Anirudh Ravichander",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/once%20upon%20a%20time%20anirudh",
      mood: "happy",
      interests: ["Music", "Gaming"],
      description: "Energetic beat that motivates",
      energy: "high"
    }
  ],
  
  // Sad/Need Motivation Songs
  sad: [
    {
      title: "Idhazhin Oram",
      artist: "A.R. Rahman",
      youtubeId: "dQw4w9WgXcQ",
      spotifyUrl: "https://open.spotify.com/track/example",
      mood: "sad",
      interests: ["Music", "Reading", "Art"],
      description: "Soothing melody that brings hope",
      energy: "low"
    },
    {
      title: "Naan Pizhai",
      artist: "Santhosh Narayanan",
      youtubeId: "dQw4w9WgXcQ",
      spotifyUrl: "https://open.spotify.com/track/example",
      mood: "sad",
      interests: ["Music", "Reading"],
      description: "Emotional yet empowering track",
      energy: "low"
    },
    {
      title: "Vellai Pookal",
      artist: "A.R. Rahman",
      youtubeId: "dQw4w9WgXcQ",
      spotifyUrl: "https://open.spotify.com/track/example",
      mood: "sad",
      interests: ["Music", "Art"],
      description: "Peaceful and healing melody",
      energy: "low"
    },
    {
      title: "Azhagana Kattule",
      artist: "G.V. Prakash",
      youtubeId: "dQw4w9WgXcQ",
      spotifyUrl: "https://open.spotify.com/track/example",
      mood: "sad",
      interests: ["Music"],
      description: "Gentle encouragement and hope",
      energy: "low"
    },
    {
      title: "Kadhal Oru Aagayam",
      artist: "Harris Jayaraj",
      youtubeId: "dQw4w9WgXcQ",
      spotifyUrl: "https://open.spotify.com/track/example",
      mood: "sad",
      interests: ["Music", "Reading"],
      description: "Calming and motivational",
      energy: "low"
    },
    {
      title: "Nenjame Nenjame",
      artist: "A.R. Rahman",
      youtubeId: "dQw4w9WgXcQ",
      spotifyUrl: "https://open.spotify.com/track/example",
      mood: "sad",
      interests: ["Music", "Art"],
      description: "Heartfelt and inspiring",
      energy: "low"
    }
  ],
  
  // Angry/Need Strength Songs
  angry: [
    {
      title: "Thee Thalapathy",
      artist: "Anirudh Ravichander",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/thee%20thalapathy",
      mood: "angry",
      interests: ["Music", "Sports"],
      description: "Powerful anthem for inner strength and resilience",
      energy: "very-high"
    },
    {
      title: "Vikram Title Track",
      artist: "Anirudh Ravichander",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/vikram%20title",
      mood: "angry",
      interests: ["Music", "Sports"],
      description: "Intense and empowering motivational track",
      energy: "very-high"
    },
    {
      title: "Mersal Arasan",
      artist: "A.R. Rahman",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/mersal%20arasan",
      mood: "angry",
      interests: ["Music", "Sports"],
      description: "Bold and empowering track that builds confidence",
      energy: "very-high"
    },
    {
      title: "Beast Mode",
      artist: "Anirudh Ravichander",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/beast%20mode",
      mood: "angry",
      interests: ["Music", "Sports"],
      description: "Channel your energy into determination",
      energy: "very-high"
    },
    {
      title: "Neruppu Da",
      artist: "Anirudh Ravichander",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/neruppu%20da",
      mood: "angry",
      interests: ["Music", "Sports", "Gaming"],
      description: "Fire up your motivation and strength",
      energy: "very-high"
    },
    {
      title: "Oruviral Puratchi",
      artist: "A.R. Rahman",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/oruviral%20puratchi",
      mood: "angry",
      interests: ["Music"],
      description: "Revolutionary spirit and empowerment",
      energy: "very-high"
    }
  ],
  
  // Tired/Need Energy Songs
  tired: [
    {
      title: "Vikram Title Track",
      artist: "Anirudh Ravichander",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/vikram%20title",
      mood: "tired",
      interests: ["Music", "Sports", "Gaming"],
      description: "High-octane energy booster to recharge yourself",
      energy: "very-high"
    },
    {
      title: "Beast Mode",
      artist: "Anirudh Ravichander",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/beast%20mode",
      mood: "tired",
      interests: ["Music", "Sports"],
      description: "Get ready to conquer the day with renewed energy",
      energy: "very-high"
    },
    {
      title: "Neruppu Da",
      artist: "Anirudh Ravichander",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/neruppu%20da",
      mood: "tired",
      interests: ["Music", "Sports"],
      description: "Fire up your motivation and energy levels",
      energy: "high"
    },
    {
      title: "Thalaivar Theme",
      artist: "Anirudh Ravichander",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/thalaivar",
      mood: "tired",
      interests: ["Music", "Sports"],
      description: "Recharge your energy with this powerful track",
      energy: "high"
    },
    {
      title: "Verithanam",
      artist: "A.R. Rahman",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/verithanam",
      mood: "tired",
      interests: ["Music", "Sports"],
      description: "Energizing track to boost your spirits",
      energy: "very-high"
    },
    {
      title: "Rowdy Baby",
      artist: "Dhanush, Anirudh Ravichander",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/rowdy%20baby",
      mood: "tired",
      interests: ["Music", "Gaming"],
      description: "Energetic beat to wake you up and energize",
      energy: "high"
    },
    {
      title: "Singappenney",
      artist: "A.R. Rahman",
      youtubeId: "search",
      spotifyUrl: "https://open.spotify.com/search/singappenney",
      mood: "tired",
      interests: ["Music"],
      description: "Empowering track to revitalize your energy",
      energy: "high"
    }
  ]
};

/**
 * Get daily song recommendations based on mood and interests (with AI enhancement)
 * @param {string} mood - Current mood (happy, sad, angry, tired)
 * @param {Array} interests - User's interests/hobbies
 * @param {number} count - Number of songs to return (default: 5)
 * @param {boolean} useAI - Whether to use AI recommendations (default: true)
 * @returns {Promise<Array>} Array of recommended songs (now async for AI support)
 */
export const getDailySongRecommendations = async (mood, interests = [], count = 5, useAI = true) => {
  // Normalize mood
  if (!mood || !tamilMotivationalSongs[mood]) {
    mood = 'happy'; // Default to happy if mood is invalid
  }

  // Try AI recommendations first if enabled
  if (useAI) {
    try {
      const aiSongs = await geminiService.generateSongRecommendations(mood, interests, count);
      
      // Enhance AI songs with YouTube/Spotify links and ensure all fields are present
      const enhancedAISongs = aiSongs.map(song => ({
        ...song,
        youtubeId: 'search', // Will search on YouTube
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(song.title)}`,
        // Ensure mood is set
        mood: song.mood || mood,
        // Ensure interests array exists
        interests: song.interests || ['Music'],
        // Ensure energy level exists
        energy: song.energy || 'medium'
      }));

      // Combine AI recommendations with static database for best results
      // Take 60% AI recommendations, 40% static database
      const aiCount = Math.ceil(count * 0.6);
      const staticCount = count - aiCount;
      
      const staticSongs = getStaticSongRecommendations(mood, interests, staticCount);
      
      // Merge AI and static, prioritizing AI recommendations
      return [...enhancedAISongs.slice(0, aiCount), ...staticSongs.slice(0, staticCount)];
    } catch (error) {
      console.error('Error getting AI recommendations, falling back to static:', error);
      // Fall back to static recommendations if AI fails
      return getStaticSongRecommendations(mood, interests, count);
    }
  }

  // Use static recommendations if AI is disabled
  return getStaticSongRecommendations(mood, interests, count);
};

/**
 * Get static song recommendations from database (fallback/supplement)
 * @param {string} mood - Current mood
 * @param {Array} interests - User's interests
 * @param {number} count - Number of songs
 * @returns {Array} Array of recommended songs
 */
const getStaticSongRecommendations = (mood, interests = [], count = 3) => {
  let availableSongs = [...tamilMotivationalSongs[mood]];
  
  // If user has interests, prioritize songs matching their interests
  if (interests && interests.length > 0) {
    // Sort songs by interest match (songs with matching interests first)
    availableSongs.sort((a, b) => {
      const aMatches = a.interests.filter(interest => 
        interests.some(userInterest => 
          userInterest.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(userInterest.toLowerCase())
        )
      ).length;
      
      const bMatches = b.interests.filter(interest => 
        interests.some(userInterest => 
          userInterest.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(userInterest.toLowerCase())
        )
      ).length;
      
      return bMatches - aMatches;
    });
  }

  // Get day of year for daily rotation (1-365)
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today - startOfYear;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Rotate songs based on day to ensure daily variety
  const rotationIndex = dayOfYear % availableSongs.length;
  const rotatedSongs = [
    ...availableSongs.slice(rotationIndex),
    ...availableSongs.slice(0, rotationIndex)
  ];

  // Return top 'count' songs
  return rotatedSongs.slice(0, count);
};

/**
 * Get all songs for a specific mood
 * @param {string} mood - Mood type
 * @returns {Array} Array of all songs for that mood
 */
export const getSongsByMood = (mood) => {
  return tamilMotivationalSongs[mood] || [];
};

/**
 * Search songs by title or artist
 * @param {string} searchTerm - Search keyword
 * @returns {Array} Array of matching songs
 */
export const searchSongs = (searchTerm) => {
  const allSongs = Object.values(tamilMotivationalSongs).flat();
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return allSongs.filter(song => 
    song.title.toLowerCase().includes(lowerSearchTerm) ||
    song.artist.toLowerCase().includes(lowerSearchTerm) ||
    song.description.toLowerCase().includes(lowerSearchTerm)
  );
};

/**
 * Get song recommendation message based on mood
 * @param {string} mood - Current mood
 * @returns {string} Motivational message
 */
export const getMoodBasedMessage = (mood) => {
  const messages = {
    happy: "🎵 Keep the positive energy flowing with these uplifting Tamil songs!",
    sad: "💙 Music has the power to heal. Here are some soothing Tamil songs to lift your spirits.",
    angry: "🔥 Channel your energy into motivation with these powerful Tamil anthems!",
    tired: "⚡ Recharge and energize yourself with these high-energy Tamil motivational tracks!",
    default: "🎶 Here are some Tamil motivational songs to inspire your day!"
  };
  
  return messages[mood] || messages.default;
};

/**
 * Get AI-powered song recommendations message/explanation
 * @param {string} mood - Current mood
 * @param {Array} interests - User's interests
 * @returns {Promise<string>} AI-generated explanation for the recommendations
 */
export const getAIRecommendationExplanation = async (mood, interests = []) => {
  try {
    const prompt = `The user is in a ${mood} mood. ${interests.length > 0 ? `Their interests include: ${interests.join(', ')}.` : ''}

Provide a brief, warm, and encouraging message (2-3 sentences) explaining why Tamil motivational songs are being recommended for their current mood. Make it personal and supportive. Include an emoji.`;

    const result = await geminiService.model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error getting AI explanation:', error);
    return getMoodBasedMessage(mood);
  }
};

export default {
  getDailySongRecommendations,
  getSongsByMood,
  searchSongs,
  getMoodBasedMessage,
  getAIRecommendationExplanation,
  tamilMotivationalSongs
};

