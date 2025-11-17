// Color mapping for user preferences
export const colorMap = {
  blue: {
    primary: '#3B82F6',
    secondary: '#DBEAFE',
    gradient: 'from-blue-400 via-blue-500 to-blue-600',
    light: 'from-blue-50 to-blue-100',
    accent: '#1D4ED8'
  },
  green: {
    primary: '#10B981',
    secondary: '#D1FAE5',
    gradient: 'from-green-400 via-green-500 to-green-600',
    light: 'from-green-50 to-green-100',
    accent: '#047857'
  },
  purple: {
    primary: '#8B5CF6',
    secondary: '#EDE9FE',
    gradient: 'from-purple-400 via-purple-500 to-purple-600',
    light: 'from-purple-50 to-purple-100',
    accent: '#7C3AED'
  },
  pink: {
    primary: '#EC4899',
    secondary: '#FCE7F3',
    gradient: 'from-pink-400 via-pink-500 to-pink-600',
    light: 'from-pink-50 to-pink-100',
    accent: '#DB2777'
  },
  orange: {
    primary: '#F97316',
    secondary: '#FED7AA',
    gradient: 'from-orange-400 via-orange-500 to-orange-600',
    light: 'from-orange-50 to-orange-100',
    accent: '#EA580C'
  },
  red: {
    primary: '#EF4444',
    secondary: '#FEE2E2',
    gradient: 'from-red-400 via-red-500 to-red-600',
    light: 'from-red-50 to-red-100',
    accent: '#DC2626'
  },
  yellow: {
    primary: '#EAB308',
    secondary: '#FEF3C7',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    light: 'from-yellow-50 to-yellow-100',
    accent: '#CA8A04'
  },
  teal: {
    primary: '#14B8A6',
    secondary: '#CCFBF1',
    gradient: 'from-teal-400 via-teal-500 to-teal-600',
    light: 'from-teal-50 to-teal-100',
    accent: '#0D9488'
  }
};

/**
 * Get color configuration for a user's favorite color
 * @param {string} favoriteColor - User's favorite color
 * @returns {Object} Color configuration object
 */
export const getUserColorConfig = (favoriteColor = 'blue') => {
  return colorMap[favoriteColor] || colorMap.blue;
};

/**
 * Generate CSS custom properties for dynamic theming
 * @param {string} favoriteColor - User's favorite color
 * @returns {Object} CSS custom properties
 */
export const generateColorVariables = (favoriteColor = 'blue') => {
  const config = getUserColorConfig(favoriteColor);
  
  return {
    '--color-primary': config.primary,
    '--color-secondary': config.secondary,
    '--color-accent': config.accent,
    '--gradient-primary': config.gradient,
    '--gradient-light': config.light
  };
};

/**
 * Apply dynamic colors to document root
 * @param {string} favoriteColor - User's favorite color
 */
export const applyDynamicColors = (favoriteColor = 'blue') => {
  const variables = generateColorVariables(favoriteColor);
  const root = document.documentElement;
  
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

/**
 * Get personalized greeting based on user preferences
 * @param {Object} userData - User data including preferences
 * @returns {string} Personalized greeting
 */
export const getPersonalizedGreeting = (userData) => {
  const { name, preferences } = userData;
  const { favoritePlace, hobbies } = preferences || {};
  
  const greetings = [
    `Welcome back, ${name}! 💙`,
    `Hello ${name}! Ready for another great day? ✨`,
    `Hi ${name}! How are you feeling today? 🌟`,
    `Good to see you, ${name}! 💫`
  ];
  
  if (favoritePlace) {
    const placeGreetings = {
      'Beach': `Welcome back, ${name}! Ready to catch some positive waves? 🏖️`,
      'Mountains': `Hello ${name}! Let's climb to new heights today! 🏔️`,
      'Forest': `Hi ${name}! Time to find peace in nature! 🌲`,
      'City': `Welcome back, ${name}! Ready to conquer the urban jungle? 🏙️`,
      'Library': `Hello ${name}! Let's explore new knowledge today! 📚`,
      'Cafe': `Hi ${name}! Ready for some cozy conversations? ☕`,
      'Park': `Welcome back, ${name}! Let's enjoy some fresh air! 🌳`,
      'Home': `Hello ${name}! Ready to make today comfortable and great? 🏠`
    };
    
    if (placeGreetings[favoritePlace]) {
      return placeGreetings[favoritePlace];
    }
  }
  
  if (hobbies && hobbies.length > 0) {
    const hobbyGreetings = {
      'Reading': `Welcome back, ${name}! Ready to dive into some great conversations? 📚`,
      'Music': `Hello ${name}! Let's create some beautiful moments today! 🎵`,
      'Photography': `Hi ${name}! Ready to capture some amazing memories? 📸`,
      'Cooking': `Welcome back, ${name}! Let's cook up some positivity! 👨‍🍳`,
      'Gaming': `Hello ${name}! Ready to level up your day? 🎮`,
      'Travel': `Hi ${name}! Let's explore new horizons together! ✈️`,
      'Art': `Welcome back, ${name}! Ready to paint your day with joy? 🎨`,
      'Sports': `Hello ${name}! Let's score some great moments today! ⚽`,
      'Writing': `Hi ${name}! Ready to write your success story? ✍️`,
      'Gardening': `Welcome back, ${name}! Let's grow some positivity today! 🌱`
    };
    
    const firstHobby = hobbies[0];
    if (hobbyGreetings[firstHobby]) {
      return hobbyGreetings[firstHobby];
    }
  }
  
  return greetings[Math.floor(Math.random() * greetings.length)];
};

/**
 * Get personalized AI response context based on user preferences
 * @param {Object} userData - User data including preferences
 * @returns {string} Context string for AI responses
 */
export const getPersonalizedContext = (userData) => {
  const { preferences } = userData;
  if (!preferences) return '';
  
  const { favoritePlace, hobbies, entertainment, additionalInfo } = preferences;
  
  let context = '';
  
  if (favoritePlace) {
    context += `The user's favorite place is ${favoritePlace}. `;
  }
  
  if (hobbies && hobbies.length > 0) {
    context += `Their hobbies include: ${hobbies.join(', ')}. `;
  }
  
  if (entertainment) {
    context += `They enjoy ${entertainment} for entertainment. `;
  }
  
  if (additionalInfo) {
    context += `Additional info: ${additionalInfo}. `;
  }
  
  return context.trim();
};

/**
 * Generate dynamic background class based on favorite color
 * @param {string} favoriteColor - User's favorite color
 * @returns {string} Tailwind CSS classes for background
 */
export const getDynamicBackgroundClass = (favoriteColor = 'blue') => {
  const config = getUserColorConfig(favoriteColor);
  return `bg-gradient-to-br ${config.light}`;
};

/**
 * Generate dynamic button class based on favorite color
 * @param {string} favoriteColor - User's favorite color
 * @returns {string} Tailwind CSS classes for buttons
 */
export const getDynamicButtonClass = (favoriteColor = 'blue') => {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    pink: 'bg-pink-500 hover:bg-pink-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
    red: 'bg-red-500 hover:bg-red-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    teal: 'bg-teal-500 hover:bg-teal-600'
  };
  
  return colorClasses[favoriteColor] || colorClasses.blue;
};

export default {
  colorMap,
  getUserColorConfig,
  generateColorVariables,
  applyDynamicColors,
  getPersonalizedGreeting,
  getPersonalizedContext,
  getDynamicBackgroundClass,
  getDynamicButtonClass
};
