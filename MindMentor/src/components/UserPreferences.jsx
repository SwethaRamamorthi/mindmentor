import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, MapPin, Heart, Gamepad2, Film, Music, BookOpen, Camera, Coffee, Plane } from 'lucide-react';

const UserPreferences = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    favoriteColor: '',
    favoritePlace: '',
    hobbies: [],
    entertainment: '',
    additionalInfo: ''
  });

  const colors = [
    { name: 'Blue', value: 'blue', hex: '#3B82F6', icon: '💙' },
    { name: 'Green', value: 'green', hex: '#10B981', icon: '💚' },
    { name: 'Purple', value: 'purple', hex: '#8B5CF6', icon: '💜' },
    { name: 'Pink', value: 'pink', hex: '#EC4899', icon: '💖' },
    { name: 'Orange', value: 'orange', hex: '#F97316', icon: '🧡' },
    { name: 'Red', value: 'red', hex: '#EF4444', icon: '❤️' },
    { name: 'Yellow', value: 'yellow', hex: '#EAB308', icon: '💛' },
    { name: 'Teal', value: 'teal', hex: '#14B8A6', icon: '🤍' }
  ];

  const places = [
    { name: 'Beach', icon: '🏖️', description: 'Ocean views and sandy shores' },
    { name: 'Mountains', icon: '🏔️', description: 'Fresh air and scenic views' },
    { name: 'Forest', icon: '🌲', description: 'Peaceful nature walks' },
    { name: 'City', icon: '🏙️', description: 'Urban energy and culture' },
    { name: 'Library', icon: '📚', description: 'Quiet reading spaces' },
    { name: 'Cafe', icon: '☕', description: 'Cozy coffee shops' },
    { name: 'Park', icon: '🌳', description: 'Green spaces and fresh air' },
    { name: 'Home', icon: '🏠', description: 'Comfortable and familiar' }
  ];

  const hobbies = [
    { name: 'Reading', icon: BookOpen, description: 'Books and literature' },
    { name: 'Music', icon: Music, description: 'Playing or listening' },
    { name: 'Photography', icon: Camera, description: 'Capturing moments' },
    { name: 'Cooking', icon: Coffee, description: 'Culinary adventures' },
    { name: 'Gaming', icon: Gamepad2, description: 'Video games' },
    { name: 'Travel', icon: Plane, description: 'Exploring new places' },
    { name: 'Art', icon: Palette, description: 'Drawing and painting' },
    { name: 'Sports', icon: Heart, description: 'Physical activities' },
    { name: 'Writing', icon: BookOpen, description: 'Creative writing' },
    { name: 'Gardening', icon: Heart, description: 'Growing plants' }
  ];

  const entertainment = [
    { name: 'Movies', icon: Film, description: 'Cinema and films' },
    { name: 'TV Shows', icon: Film, description: 'Series and documentaries' },
    { name: 'Music', icon: Music, description: 'Concerts and albums' },
    { name: 'Books', icon: BookOpen, description: 'Reading novels' },
    { name: 'Games', icon: Gamepad2, description: 'Video games' },
    { name: 'Podcasts', icon: Music, description: 'Audio content' }
  ];

  const steps = [
    {
      title: 'Choose Your Favorite Color',
      subtitle: 'This will personalize your experience',
      icon: '🎨'
    },
    {
      title: 'Your Favorite Place',
      subtitle: 'Where do you feel most at peace?',
      icon: '📍'
    },
    {
      title: 'Your Hobbies',
      subtitle: 'What activities bring you joy?',
      icon: '🎯'
    },
    {
      title: 'Entertainment Preference',
      subtitle: 'How do you like to unwind?',
      icon: '🎬'
    },
    {
      title: 'Tell Us About Yourself',
      subtitle: 'Anything else you\'d like to share?',
      icon: '💭'
    }
  ];

  const handleColorSelect = (color) => {
    setPreferences(prev => ({ ...prev, favoriteColor: color }));
    nextStep();
  };

  const handlePlaceSelect = (place) => {
    setPreferences(prev => ({ ...prev, favoritePlace: place }));
    nextStep();
  };

  const handleHobbyToggle = (hobby) => {
    setPreferences(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby)
        ? prev.hobbies.filter(h => h !== hobby)
        : [...prev.hobbies, hobby]
    }));
  };

  const handleEntertainmentSelect = (entertainment) => {
    setPreferences(prev => ({ ...prev, entertainment }));
    nextStep();
  };

  const handleAdditionalInfoChange = (e) => {
    setPreferences(prev => ({ ...prev, additionalInfo: e.target.value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(preferences);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return preferences.favoriteColor !== '';
      case 1: return preferences.favoritePlace !== '';
      case 2: return preferences.hobbies.length > 0;
      case 3: return preferences.entertainment !== '';
      case 4: return true; // Optional step
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {colors.map((color) => (
                <motion.button
                  key={color.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleColorSelect(color.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    preferences.favoriteColor === color.value
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{color.icon}</div>
                    <div className="text-sm font-medium text-gray-800">{color.name}</div>
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mt-2 border-2 border-white shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    ></div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {places.map((place) => (
                <motion.button
                  key={place.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePlaceSelect(place.name)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    preferences.favoritePlace === place.name
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{place.icon}</div>
                    <div className="text-sm font-medium text-gray-800">{place.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{place.description}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {hobbies.map((hobby) => (
                <motion.button
                  key={hobby.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleHobbyToggle(hobby.name)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    preferences.hobbies.includes(hobby.name)
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <hobby.icon className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                    <div className="text-sm font-medium text-gray-800">{hobby.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{hobby.description}</div>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              Selected: {preferences.hobbies.length} hobby{preferences.hobbies.length !== 1 ? 'ies' : ''}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {entertainment.map((item) => (
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEntertainmentSelect(item.name)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    preferences.entertainment === item.name
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <item.icon className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                    <div className="text-sm font-medium text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <textarea
              value={preferences.additionalInfo}
              onChange={handleAdditionalInfoChange}
              placeholder="Tell us anything else about yourself that might help us personalize your experience... (Optional)"
              className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              rows={4}
            />
            <div className="text-sm text-gray-600 text-center">
              This helps us understand you better and provide more personalized support 💙
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-sm text-gray-600">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Header */}
      <div className="text-center mb-8">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl mb-4"
        >
          {steps[currentStep].icon}
        </motion.div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {steps[currentStep].title}
        </h2>
        <p className="text-gray-600">
          {steps[currentStep].subtitle}
        </p>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevStep}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {currentStep === 0 ? 'Back to Signup' : 'Previous'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextStep}
          disabled={!canProceed()}
          className={`px-6 py-3 rounded-lg transition-colors ${
            canProceed()
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default UserPreferences;
