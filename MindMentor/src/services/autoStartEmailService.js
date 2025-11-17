// Auto-start Daily Email Service
// This file automatically starts the daily email service when the app loads

import dailyEmailService from './dailyEmailService';

// Auto-start the daily email service
const initializeDailyEmailService = () => {
  console.log('🚀 Initializing Daily Email Service...');
  
  // Check if service should auto-start
  const autoStart = localStorage.getItem('emailServiceAutoStart');
  
  if (autoStart !== 'false') {
    console.log('📧 Auto-starting daily email service...');
    dailyEmailService.start();
  } else {
    console.log('📧 Daily email service auto-start disabled');
  }
  
  // Log service status
  const status = dailyEmailService.getStatus();
  console.log('📊 Daily Email Service Status:', status);
};

// Initialize when this module is imported
initializeDailyEmailService();

export default dailyEmailService;
