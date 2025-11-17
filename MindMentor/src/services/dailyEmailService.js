// Daily Email Service - Background Service
// This service runs daily emails automatically

import EmailService from './emailService';

class DailyEmailService {
  constructor() {
    this.emailService = new EmailService();
    this.isRunning = false;
    this.intervalId = null;
    this.lastRun = null;
    this.stats = { sent: 0, failed: 0, total: 0 };
  }

  // Start the daily email service
  start() {
    if (this.isRunning) {
      console.log('📧 Daily email service is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting daily email service...');

    // Run immediately
    this.runDailyEmails();

    // Set up interval to check every hour
    this.intervalId = setInterval(() => {
      this.checkAndSendEmails();
    }, 60000); // Check every minute

    console.log('✅ Daily email service started');
  }

  // Stop the daily email service
  stop() {
    if (!this.isRunning) {
      console.log('📧 Daily email service is not running');
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('⏹️ Daily email service stopped');
  }

  // Check if it's time to send emails and send them
  checkAndSendEmails() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Send emails at scheduled times (8 AM, 12 PM, 6 PM)
    if ((hour === 8 || hour === 12 || hour === 18) && minute === 0) {
      let messageType = 'morning';
      if (hour === 12) messageType = 'midday';
      if (hour === 18) messageType = 'evening';

      console.log(`🕐 Time to send ${messageType} emails!`);
      this.runDailyEmails(messageType);
    }
  }

  // Run daily emails
  async runDailyEmails(messageType = 'morning') {
    try {
      console.log(`📧 Running daily ${messageType} email campaign...`);
      
      const result = await this.emailService.sendDailyEmailsToAllUsers(messageType);
      
      if (result.success) {
        this.stats = {
          sent: result.sent,
          failed: result.failed,
          total: result.total
        };
        this.lastRun = new Date().toLocaleString();
        
        console.log(`✅ Daily email campaign completed:`);
        console.log(`   📧 Sent: ${result.sent}`);
        console.log(`   ❌ Failed: ${result.failed}`);
        console.log(`   👥 Total Users: ${result.total}`);
        
        // Save stats to localStorage
        this.saveStats();
        
        return result;
      } else {
        console.error('❌ Daily email campaign failed:', result.error);
        return result;
      }
      
    } catch (error) {
      console.error('❌ Error in daily email campaign:', error);
      return { success: false, error: error.message };
    }
  }

  // Save stats to localStorage
  saveStats() {
    const statsData = {
      stats: this.stats,
      lastRun: this.lastRun,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('dailyEmailStats', JSON.stringify(statsData));
  }

  // Load stats from localStorage
  loadStats() {
    try {
      const savedData = localStorage.getItem('dailyEmailStats');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.stats = data.stats || { sent: 0, failed: 0, total: 0 };
        this.lastRun = data.lastRun || null;
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      stats: this.stats,
      nextRun: this.getNextRunTime()
    };
  }

  // Get next run time
  getNextRunTime() {
    const now = new Date();
    const morning = new Date(now);
    morning.setHours(8, 0, 0, 0);
    
    const midday = new Date(now);
    midday.setHours(12, 0, 0, 0);
    
    const evening = new Date(now);
    evening.setHours(18, 0, 0, 0);

    let nextTime = null;
    if (now < morning) {
      nextTime = morning;
    } else if (now < midday) {
      nextTime = midday;
    } else if (now < evening) {
      nextTime = evening;
    } else {
      // Next day morning
      nextTime = new Date(now);
      nextTime.setDate(nextTime.getDate() + 1);
      nextTime.setHours(8, 0, 0, 0);
    }

    return nextTime.toLocaleString();
  }

  // Manual email sending
  async sendManualEmails(messageType = 'morning') {
    console.log(`📧 Sending manual ${messageType} emails...`);
    return await this.runDailyEmails(messageType);
  }
}

// Create singleton instance
const dailyEmailService = new DailyEmailService();

// Load saved stats on initialization
dailyEmailService.loadStats();

export default dailyEmailService;
