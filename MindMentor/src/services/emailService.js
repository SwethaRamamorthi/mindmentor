// EmailJS Service for MindMentor
// This replaces NodeMailer and works directly from frontend

import emailjs from '@emailjs/browser';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import geminiService from './geminiService.js';

class EmailService {
  constructor() {
    // EmailJS Configuration - Your actual credentials
    this.serviceId = 'service_alsloth'; // Your EmailJS service ID
    this.templateId = 'template_4o6zy24'; // Your EmailJS template ID
    this.publicKey = 'EEwF1Zda2o8ilaO_G'; // Your EmailJS public key
    
    // Initialize EmailJS
    emailjs.init(this.publicKey);
  }

  // Send daily positive message to a specific user
  async sendDailyMessage(userEmail, userName, messageType = 'morning') {
    try {
      console.log(`📧 Sending ${messageType} message to ${userEmail}`);
      console.log('🔍 DEBUG: userEmail value:', userEmail);
      console.log('🔍 DEBUG: userName value:', userName);
      
      // Validate email address
      if (!userEmail || userEmail.trim() === '') {
        throw new Error('Email address is empty or invalid');
      }
      
      // Generate AI-powered message using Gemini
      const aiMessage = await geminiService.generateDailyMessage(userName, messageType);
      
      const templateParams = {
        to_email: userEmail,
        to_name: userName,
        message_type: messageType,
        message: aiMessage,
        from_name: 'MindMentor',
        reply_to: 'rswetha2807@gmail.com'
      };
      
      console.log('🔍 DEBUG: templateParams:', templateParams);

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      console.log('✅ Email sent successfully:', response);
      return { success: true, response };
      
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return { success: false, error };
    }
  }

  // Get all users with email notifications enabled from Firebase
  async getUsersForDailyEmails() {
    try {
      console.log('🔍 Fetching users with email notifications enabled...');
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('emailNotifications', '==', true));
      const querySnapshot = await getDocs(q);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log('🔍 DEBUG: User data:', userData);
        if (userData.email && userData.emailNotifications) {
          users.push({
            id: doc.id,
            email: userData.email,
            name: userData.name || userData.displayName || 'Friend',
            emailNotifications: userData.emailNotifications
          });
        }
      });
      
      console.log(`📊 Found ${users.length} users with email notifications enabled`);
      console.log('🔍 DEBUG: Users array:', users);
      return users;
      
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      return [];
    }
  }

  // Send daily emails to all users with notifications enabled
  async sendDailyEmailsToAllUsers(messageType = 'morning') {
    try {
      console.log(`📧 Starting daily ${messageType} email campaign...`);
      
      const users = await this.getUsersForDailyEmails();
      
      if (users.length === 0) {
        console.log('ℹ️ No users found with email notifications enabled');
        return { success: true, sent: 0, users: [] };
      }

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      // Send emails to all users
      for (const user of users) {
        try {
          console.log(`📤 Sending email to ${user.email} (${user.name})`);
          
          const result = await this.sendDailyMessage(user.email, user.name, messageType);
          
          if (result.success) {
            successCount++;
            results.push({
              user: user.email,
              status: 'success',
              message: 'Email sent successfully'
            });
          } else {
            errorCount++;
            results.push({
              user: user.email,
              status: 'error',
              message: result.error?.message || 'Unknown error'
            });
          }

          // Add delay between emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          errorCount++;
          console.error(`❌ Error sending email to ${user.email}:`, error);
          results.push({
            user: user.email,
            status: 'error',
            message: error.message
          });
        }
      }

      console.log(`📊 Email campaign completed:`);
      console.log(`   ✅ Successful: ${successCount}`);
      console.log(`   ❌ Failed: ${errorCount}`);
      console.log(`   📧 Total: ${users.length}`);

      return {
        success: true,
        sent: successCount,
        failed: errorCount,
        total: users.length,
        results: results
      };
      
    } catch (error) {
      console.error('❌ Error in daily email campaign:', error);
      return { success: false, error: error.message };
    }
  }

  // Get message based on type
  getMessageByType(type) {
    const messages = {
      morning: [
        "Good morning! 🌅 Today is a fresh start filled with endless possibilities. You have the power to make it amazing!",
        "Rise and shine! ☀️ Every morning is a chance to be better than yesterday. You've got this!",
        "Morning vibes! 🌸 Today, choose joy, choose growth, choose to be the best version of yourself."
      ],
      midday: [
        "Midday check-in! 🌟 You're halfway through your day. Keep that positive energy flowing!",
        "Lunch break reminder: You're doing amazing! 🎯 Take a moment to appreciate your progress.",
        "Midday motivation! 💫 You've already accomplished so much today. Keep going!"
      ],
      evening: [
        "Evening reflection time! 🌙 What's one thing you're grateful for today?",
        "Good evening! 🌟 You made it through another day. That's something to celebrate!",
        "Evening wind-down! 🕯️ Take a moment to appreciate how far you've come."
      ]
    };

    const typeMessages = messages[type] || messages.morning;
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  }

  // Test email functionality
  async testEmail(testEmail = 'rswetha2807@gmail.com') {
    try {
      console.log('🧪 Testing EmailJS service...');
      
      const result = await this.sendDailyMessage(
        testEmail,
        'Test User',
        'morning'
      );

      if (result.success) {
        console.log('✅ EmailJS test successful!');
        console.log('📬 Check your inbox for the test email');
        return true;
      } else {
        console.log('❌ EmailJS test failed:', result.error);
        return false;
      }
      
    } catch (error) {
      console.error('❌ EmailJS test error:', error);
      return false;
    }
  }

  // Test sending emails to all users
  async testEmailToAllUsers(messageType = 'morning') {
    try {
      console.log('🧪 Testing email campaign to all users...');
      
      const result = await this.sendDailyEmailsToAllUsers(messageType);
      
      if (result.success) {
        console.log('✅ Email campaign test successful!');
        console.log(`📊 Results: ${result.sent}/${result.total} emails sent`);
        return result;
      } else {
        console.log('❌ Email campaign test failed:', result.error);
        return result;
      }
      
    } catch (error) {
      console.error('❌ Email campaign test error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export for use in React components
export default EmailService;

// Test functions
export const testEmailJS = async () => {
  const emailService = new EmailService();
  return await emailService.testEmail();
};

export const testEmailToAllUsers = async (messageType = 'morning') => {
  const emailService = new EmailService();
  return await emailService.testEmailToAllUsers(messageType);
};
