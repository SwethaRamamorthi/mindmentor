import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, ExternalLink, RefreshCw, X, Search } from 'lucide-react';
import { 
  getDailySongRecommendations, 
  getMoodBasedMessage,
  getAIRecommendationExplanation,
  searchSongs 
} from '../services/musicService';

const MusicRecommendations = ({ isOpen, onClose, mood, interests = [] }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [isAIEnabled, setIsAIEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadRecommendations();
    }
  }, [isOpen, mood, interests]);

  const loadRecommendations = async () => {
    setLoading(true);
    setAiMessage('');
    try {
      // Load AI-powered recommendations
      const songs = await getDailySongRecommendations(mood, interests, 5, isAIEnabled);
      setRecommendations(songs);
      
      // Get AI-generated explanation message
      if (isAIEnabled && mood) {
        try {
          const explanation = await getAIRecommendationExplanation(mood, interests);
          setAiMessage(explanation);
        } catch (error) {
          console.error('Error getting AI explanation:', error);
          setAiMessage(getMoodBasedMessage(mood));
        }
      } else {
        setAiMessage(getMoodBasedMessage(mood));
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setAiMessage(getMoodBasedMessage(mood));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadRecommendations();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    
    const results = searchSongs(query);
    setSearchResults(results);
    setShowSearch(true);
  };

  const openYouTube = (youtubeId, title, artist) => {
    // Open YouTube video or search in new tab
    let url;
    if (youtubeId === 'search' || !youtubeId) {
      // Open YouTube search for the song
      const searchQuery = encodeURIComponent(`${title} ${artist || ''} Tamil motivational song`);
      url = `https://www.youtube.com/results?search_query=${searchQuery}`;
    } else {
      // Open direct YouTube video
      url = `https://www.youtube.com/watch?v=${youtubeId}`;
    }
    window.open(url, '_blank');
  };

  const openSpotify = (spotifyUrl) => {
    if (spotifyUrl && spotifyUrl !== 'https://open.spotify.com/track/example') {
      window.open(spotifyUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-effect rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-200/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Music className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  🎵 Tamil Motivational Songs
                  {isAIEnabled && (
                    <span className="ml-2 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full font-medium">
                      ✨ AI-Powered
                    </span>
                  )}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {aiMessage || (mood ? getMoodBasedMessage(mood) : 'Personalized recommendations just for you!')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                title="Refresh Recommendations"
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for Tamil motivational songs..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-blue-200 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading recommendations...</p>
                </div>
              </div>
            ) : showSearch && searchResults.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Search Results ({searchResults.length})
                </h3>
                {searchResults.map((song, index) => (
                  <motion.div
                    key={`${song.title}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-effect p-4 rounded-xl hover:bg-blue-50/50 transition-colors"
                  >
                    <SongCard song={song} openYouTube={openYouTube} openSpotify={openSpotify} />
                  </motion.div>
                ))}
              </div>
            ) : showSearch && searchResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎵</div>
                <p className="text-slate-600">No songs found matching "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearch(false);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Show Recommendations
                </button>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {isAIEnabled ? '✨ AI ' : ''}Recommendations for {mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : 'You'}
                  </h3>
                  <span className="text-sm text-slate-600">
                    {recommendations.length} songs
                  </span>
                </div>
                {recommendations.map((song, index) => (
                  <motion.div
                    key={`${song.title}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-effect p-5 rounded-xl hover:bg-blue-50/50 transition-all duration-200 hover:shadow-lg"
                  >
                    <SongCard song={song} openYouTube={openYouTube} openSpotify={openSpotify} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎵</div>
                <p className="text-slate-600">No recommendations available at the moment.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadRecommendations}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </motion.button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-blue-200/30">
            <p className="text-xs text-center text-slate-500">
              💡 Tip: Songs are updated daily based on your mood and interests
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Song Card Component
const SongCard = ({ song, openYouTube, openSpotify }) => {
  const getEnergyBadge = (energy) => {
    const colors = {
      'very-high': 'bg-red-100 text-red-700',
      'high': 'bg-orange-100 text-orange-700',
      'medium': 'bg-yellow-100 text-yellow-700',
      'low': 'bg-blue-100 text-blue-700'
    };
    
    return colors[energy] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-1">
              {song.title}
            </h4>
            <p className="text-sm text-slate-600 mb-2">
              by {song.artist}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEnergyBadge(song.energy)}`}>
            {song.energy} energy
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-3">
          {song.description}
        </p>
        {song.interests && song.interests.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {song.interests.map((interest, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openYouTube(song.youtubeId, song.title, song.artist)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          title={`Play ${song.title} on YouTube`}
        >
          <Play className="w-4 h-4" />
          <span className="hidden sm:inline">YouTube</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openSpotify(song.spotifyUrl)}
          disabled={song.spotifyUrl === 'https://open.spotify.com/track/example'}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">Spotify</span>
        </motion.button>
      </div>
    </div>
  );
};

export default MusicRecommendations;

