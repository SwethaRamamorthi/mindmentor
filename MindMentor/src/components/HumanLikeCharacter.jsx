import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Zap, MessageCircle, Eye, EyeOff, User, Brain, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const HumanLikeCharacter = ({ mood, userName, onCharacterClick, onCharacterSpeak }) => {
  const [isWaving, setIsWaving] = useState(false);
  const [currentExpression, setCurrentExpression] = useState('neutral');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [isBlinking, setIsBlinking] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [characterPersonality, setCharacterPersonality] = useState('friendly');
  
  // Voice-related states
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [currentVoice, setCurrentVoice] = useState(null);
  const recognitionRef = useRef(null);
  const speechRef = useRef(null);

  // Initialize voice capabilities
  useEffect(() => {
    initializeVoiceCapabilities();
  }, []);

  const initializeVoiceCapabilities = () => {
    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
      
      // Wait for voices to load
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Prefer female voices for a more friendly character
          const femaleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('zira') ||
            voice.name.toLowerCase().includes('susan')
          );
          setCurrentVoice(femaleVoice || voices[0]);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        console.log('🎤 Voice recognition started');
      };
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 User said:', transcript);
        handleUserVoiceInput(transcript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('🎤 Recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        console.log('🎤 Voice recognition ended');
      };
      
      setRecognition(recognitionInstance);
      recognitionRef.current = recognitionInstance;
    }
  };

  useEffect(() => {
    // Wave animation on mount
    const timer = setTimeout(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 2000);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Change expression based on mood
    if (mood) {
      setCurrentExpression(mood);
      setCharacterPersonality(getPersonalityFromMood(mood));
    }
  }, [mood]);

  useEffect(() => {
    // Auto-speak greeting when component mounts
    const greetingTimer = setTimeout(() => {
      const greeting = getPersonalizedGreeting();
      speakToUser(greeting);
    }, 2000);

    return () => clearTimeout(greetingTimer);
  }, [userName, characterPersonality]);

  useEffect(() => {
    // Blinking animation
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const getPersonalityFromMood = (mood) => {
    const personalities = {
      happy: 'cheerful',
      sad: 'empathetic',
      angry: 'calming',
      tired: 'gentle',
      default: 'friendly'
    };
    return personalities[mood] || personalities.default;
  };

  const getPersonalizedGreeting = () => {
    const greetings = {
      cheerful: [
        `Hey ${userName || 'Friend'}! You look amazing today! ✨`,
        `Hello there! I'm so excited to chat with you! 🌟`,
        `Hi ${userName || 'Friend'}! Ready for an awesome conversation? 💫`
      ],
      empathetic: [
        `Hello ${userName || 'Friend'}, I'm here for you 💙`,
        `Hi there, how are you feeling today? I'm listening 🤗`,
        `Hey ${userName || 'Friend'}, I care about you and I'm here to help 💜`
      ],
      calming: [
        `Hello ${userName || 'Friend'}, let's take a deep breath together 🧘`,
        `Hi there, I'm here to help you find peace 🌸`,
        `Hey ${userName || 'Friend'}, let's work through this together 💪`
      ],
      gentle: [
        `Hello ${userName || 'Friend'}, take your time, I'm patient 🌙`,
        `Hi there, I'm here whenever you're ready 💤`,
        `Hey ${userName || 'Friend'}, rest and recharge, I'll be here 🌿`
      ],
      friendly: [
        `Hey ${userName || 'Friend'}! How was your day? I'm MindMentor, here to listen 💙`,
        `Hello there! I'm your AI companion, ready to chat! 🤖`,
        `Hi ${userName || 'Friend'}! What's on your mind today? 💭`
      ]
    };

    const personalityGreetings = greetings[characterPersonality] || greetings.friendly;
    return personalityGreetings[Math.floor(Math.random() * personalityGreetings.length)];
  };

  const speakToUser = (text) => {
    setSpeechText(text);
    setIsSpeaking(true);
    setShowSpeechBubble(true);
    
    // Call the parent component's speak handler if provided
    if (onCharacterSpeak) {
      onCharacterSpeak(text);
    }
    
    // Use text-to-speech if enabled and not muted
    if (isVoiceEnabled && !isMuted && speechSynthesis && currentVoice) {
      // Stop any current speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = currentVoice;
      utterance.rate = 0.9; // Slightly slower for more natural speech
      utterance.pitch = 1.1; // Slightly higher pitch for friendliness
      utterance.volume = 0.8;
      
      utterance.onstart = () => {
        console.log('🔊 Character started speaking:', text);
      };
      
      utterance.onend = () => {
        console.log('🔊 Character finished speaking');
        setIsSpeaking(false);
        setTimeout(() => setShowSpeechBubble(false), 1000);
      };
      
      utterance.onerror = (event) => {
        console.error('🔊 Speech synthesis error:', event.error);
        setIsSpeaking(false);
        setTimeout(() => setShowSpeechBubble(false), 1000);
      };
      
      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
    } else {
      // Fallback to visual-only speech
      setTimeout(() => {
        setIsSpeaking(false);
        setTimeout(() => setShowSpeechBubble(false), 1000);
      }, text.length * 50 + 1000);
    }
  };

  const getCharacterColor = () => {
    switch (currentExpression) {
      case 'happy':
        return 'from-yellow-200 to-orange-200';
      case 'sad':
        return 'from-blue-200 to-indigo-200';
      case 'angry':
        return 'from-red-200 to-pink-200';
      case 'tired':
        return 'from-purple-200 to-violet-200';
      default:
        return 'from-blue-300 to-blue-400';
    }
  };

  const getCharacterName = () => {
    const names = {
      cheerful: 'Maya',
      empathetic: 'Luna',
      calming: 'Alex',
      gentle: 'Zoe',
      friendly: 'MindMentor'
    };
    return names[characterPersonality] || 'MindMentor';
  };

  const getCharacterDescription = () => {
    const descriptions = {
      cheerful: 'The Optimist',
      empathetic: 'The Listener',
      calming: 'The Peacekeeper',
      gentle: 'The Healer',
      friendly: 'Your AI Companion'
    };
    return descriptions[characterPersonality] || 'Your AI Companion';
  };

  const handleCharacterInteraction = () => {
    const interactions = {
      cheerful: [
        "Let's spread some positivity! 🌈",
        "I love your energy! Tell me more! ⚡",
        "You're amazing! What's making you smile? 😊"
      ],
      empathetic: [
        "I'm here to listen with my whole heart 💙",
        "Your feelings matter to me 🌸",
        "Let's work through this together 🤗"
      ],
      calming: [
        "Breathe with me... In... Out... 🧘",
        "Let's find your inner peace 🌿",
        "I'm here to help you feel centered ✨"
      ],
      gentle: [
        "Take your time, there's no rush 🌙",
        "I'm here whenever you need me 💤",
        "Rest and recharge, I'll wait 🌸"
      ],
      friendly: [
        "I'm here to listen! What's on your mind? 💭",
        "How can I help you today? 🌟",
        "Tell me about your day! 👂"
      ]
    };

    const personalityInteractions = interactions[characterPersonality] || interactions.friendly;
    const randomInteraction = personalityInteractions[Math.floor(Math.random() * personalityInteractions.length)];
    
    speakToUser(randomInteraction);
    
    if (onCharacterClick) {
      onCharacterClick(randomInteraction);
    }
  };

  // Voice interaction functions
  const startVoiceRecognition = () => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        console.log('🎤 Starting voice recognition...');
      } catch (error) {
        console.error('🎤 Error starting recognition:', error);
      }
    }
  };

  const stopVoiceRecognition = () => {
    if (recognition && isListening) {
      recognition.stop();
      console.log('🎤 Stopping voice recognition...');
    }
  };

  const handleUserVoiceInput = (transcript) => {
    console.log('🎤 Processing user voice input:', transcript);
    
    // Generate response based on user input
    const response = generateVoiceResponse(transcript);
    speakToUser(response);
    
    // Call parent callback with voice input
    if (onCharacterClick) {
      onCharacterClick('voice_input');
    }
  };

  const generateVoiceResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Mood-based responses
    if (input.includes('sad') || input.includes('depressed') || input.includes('down')) {
      return "I hear that you're feeling down. It's okay to feel this way. Would you like to talk about what's bothering you? 💙";
    }
    
    if (input.includes('happy') || input.includes('good') || input.includes('great')) {
      return "That's wonderful! I'm so happy to hear you're feeling good! What's bringing you joy today? ✨";
    }
    
    if (input.includes('anxious') || input.includes('worried') || input.includes('nervous')) {
      return "I understand you're feeling anxious. Let's take some deep breaths together. You're safe here 🌸";
    }
    
    if (input.includes('angry') || input.includes('mad') || input.includes('frustrated')) {
      return "I can feel your frustration. It's okay to feel angry sometimes. Let's work through this together 💪";
    }
    
    if (input.includes('tired') || input.includes('exhausted') || input.includes('sleepy')) {
      return "You sound tired. Rest is so important for your wellbeing. Would you like some relaxation tips? 🌙";
    }
    
    // Greeting responses
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return `Hello ${userName || 'there'}! It's so nice to hear your voice! How are you feeling today? 😊`;
    }
    
    // Help responses
    if (input.includes('help') || input.includes('support')) {
      return "I'm here to help you! Whether you need someone to listen, advice, or just a friendly chat, I'm here for you 💙";
    }
    
    // Default responses based on personality
    const defaultResponses = {
      cheerful: "That's interesting! Tell me more about that! I love hearing your thoughts! 🌈",
      empathetic: "I really appreciate you sharing that with me. Your feelings are valid and important 💙",
      calming: "Thank you for trusting me with your thoughts. Let's explore this together gently 🌿",
      gentle: "I'm listening carefully to what you're saying. Take your time 🌸",
      friendly: "That's really interesting! I'd love to hear more about your perspective on this 💭"
    };
    
    return defaultResponses[characterPersonality] || defaultResponses.friendly;
  };

  const toggleVoiceEnabled = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (isVoiceEnabled) {
      // Stop any current speech
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      // Stop any current speech
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    }
  };

  return (
    <div className="relative pt-8 md:pt-12 pb-16 md:pb-20">
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [0, -150],
              x: [0, (Math.random() - 0.5) * 400]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeOut"
            }}
            className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/50 rounded-full"
          />
        ))}
      </div>

      {/* Main Character */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          y: isWaving ? -20 : 0
        }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 20,
          duration: 0.8
        }}
        className="relative cursor-pointer"
        onClick={handleCharacterInteraction}
      >
        {/* Character Body - More Human-like */}
        <motion.div
          animate={{
            scale: isWaving ? 1.15 : 1,
            rotate: isWaving ? [0, -15, 15, -15, 0] : 0
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
          className={`w-32 h-32 md:w-48 md:h-48 mx-auto rounded-full bg-gradient-to-br ${getCharacterColor()} shadow-2xl flex items-center justify-center relative overflow-hidden`}
        >
          {/* Character Face - More Detailed */}
          <div className="text-5xl md:text-8xl z-10 relative">
            {/* Eyes */}
            <div className="flex justify-center items-center mb-2 md:mb-3">
              <motion.div
                animate={{
                  scaleY: isBlinking ? 0.1 : 1,
                  x: isSpeaking ? [0, 2, -2, 0] : 0
                }}
                transition={{ duration: 0.15 }}
                className="w-3 h-3 md:w-5 md:h-5 bg-white rounded-full mx-1 md:mx-2 relative shadow-lg"
              >
                <div className="w-2 h-2 md:w-3 md:h-3 bg-black rounded-full absolute top-0.5 md:top-1 left-0.5 md:left-1"></div>
                <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-white rounded-full absolute top-1 md:top-2 left-1 md:left-2"></div>
              </motion.div>
              <motion.div
                animate={{
                  scaleY: isBlinking ? 0.1 : 1,
                  x: isSpeaking ? [0, -2, 2, 0] : 0
                }}
                transition={{ duration: 0.15 }}
                className="w-3 h-3 md:w-5 md:h-5 bg-white rounded-full mx-1 md:mx-2 relative shadow-lg"
              >
                <div className="w-2 h-2 md:w-3 md:h-3 bg-black rounded-full absolute top-0.5 md:top-1 left-0.5 md:left-1"></div>
                <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-white rounded-full absolute top-1 md:top-2 left-1 md:left-2"></div>
              </motion.div>
            </div>
            
            {/* Nose */}
            <div className="w-1 h-1 md:w-2 md:h-2 bg-white/80 rounded-full mx-auto mb-1 md:mb-2"></div>
            
            {/* Mouth */}
            <motion.div
              animate={{
                scale: isSpeaking ? [1, 1.3, 1] : 1,
                borderRadius: isSpeaking ? ['50%', '30%', '50%'] : '50%'
              }}
              transition={{
                duration: 0.3,
                repeat: isSpeaking ? Infinity : 0
              }}
              className="w-4 h-2 md:w-8 md:h-4 bg-white rounded-full mx-auto shadow-lg"
            ></motion.div>
          </div>

          {/* Glow Effect */}
          <motion.div
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-white/25 rounded-full blur-2xl"
          />

          {/* Personality Indicators */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-3 -right-3"
          >
            <Brain className="w-7 h-7 text-yellow-300" />
          </motion.div>

          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 0.8, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-3 -left-3"
          >
            <Heart className="w-6 h-6 text-pink-300" />
          </motion.div>
        </motion.div>

        {/* Wave Animation */}
        {isWaving && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -right-16 top-1/2 transform -translate-y-1/2"
          >
            <motion.div
              animate={{
                rotate: [0, 25, 0],
                scale: [1, 1.3, 1]
              }}
              transition={{
                duration: 0.6,
                repeat: 3,
                ease: "easeInOut"
              }}
              className="text-6xl"
            >
              👋
            </motion.div>
          </motion.div>
        )}

        {/* Speech Bubble */}
        <AnimatePresence>
          {showSpeechBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute -top-32 md:-top-36 left-1/2 transform -translate-x-1/2 z-30"
            >
              <div className="bg-white backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl max-w-xs md:max-w-sm relative border-2 border-blue-400">
                {/* Speech bubble tail */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                  <div className="w-0 h-0 border-l-8 md:border-l-10 border-r-8 md:border-r-10 border-t-8 md:border-t-10 border-transparent border-t-white"></div>
                </div>
                
                {/* Character name and personality */}
                <div className="flex items-center mb-2 md:mb-3">
                  <div className="text-sm md:text-base font-bold text-slate-800">
                    {getCharacterName()}
                  </div>
                  <div className="text-xs text-slate-600 ml-2 hidden md:block">
                    • {getCharacterDescription()}
                  </div>
                </div>
                
                {/* Speech text */}
                <div className="text-sm md:text-base text-slate-800 leading-relaxed font-medium">
                  {speechText}
                </div>
                
                {/* Speaking indicator */}
                {isSpeaking && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="flex items-center mt-3 md:mt-4 text-sm text-blue-600 font-semibold bg-blue-50 px-3 py-2 rounded-lg"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Speaking...
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood Indicator */}
        {mood && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-white/90 backdrop-blur-md rounded-full px-5 py-2 text-slate-700 text-sm font-medium border border-blue-200/30">
              Feeling {mood} 💙
            </div>
          </motion.div>
        )}

        {/* Character Name and Description - Side by Side Layout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute -bottom-32 md:-bottom-36 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-blue-200/30">
            <div className="text-slate-800 text-lg md:text-xl font-bold">
              {getCharacterName()}
            </div>
            <div className="hidden md:block w-px h-6 bg-slate-300"></div>
            <div className="text-slate-600 text-sm">
              {getCharacterDescription()}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Breathing Animation */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-white/15 rounded-full blur-3xl"
      />

      {/* Voice Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="absolute top-4 right-4 z-20"
      >
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-blue-200/30">
          {/* Voice Recognition Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
            disabled={!recognition}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isListening 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            } ${!recognition ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isListening ? 'Stop listening' : 'Start voice chat'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </motion.button>

          {/* Voice Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleVoiceEnabled}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isVoiceEnabled 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isVoiceEnabled ? 'Voice enabled' : 'Voice disabled'}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </motion.button>

          {/* Mute Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isMuted 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </motion.button>
        </div>
      </motion.div>

      {/* Interactive Hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4 }}
        className="absolute -bottom-12 md:-bottom-16 left-1/2 transform -translate-x-1/2 text-center"
      >
        <div className="text-slate-600 text-xs md:text-sm animate-pulse">
          Click me to chat! 💬
        </div>
        <div className="text-slate-500 text-xs mt-1 hidden md:block">
          I adapt to your mood • Voice chat available
        </div>
      </motion.div>
    </div>
  );
};

export default HumanLikeCharacter;
