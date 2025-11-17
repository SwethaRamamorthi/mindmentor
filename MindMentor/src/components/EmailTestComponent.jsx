import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, AlertCircle, Users, Clock } from 'lucide-react';
import EmailService from '../services/emailService';

const EmailTestComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [result, setResult] = useState(null);
  const [allUsersResult, setAllUsersResult] = useState(null);
  const emailService = new EmailService();

  const testEmail = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const success = await emailService.testEmail('rswetha2807@gmail.com');
      
      if (success) {
        setResult({
          type: 'success',
          message: 'Email sent successfully! Check your inbox.'
        });
      } else {
        setResult({
          type: 'error',
          message: 'Failed to send email. Check console for details.'
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: `Error: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailToAllUsers = async () => {
    setIsLoadingAll(true);
    setAllUsersResult(null);

    try {
      const result = await emailService.testEmailToAllUsers('morning');
      
      if (result.success) {
        setAllUsersResult({
          type: 'success',
          message: `Email campaign completed! Sent ${result.sent}/${result.total} emails successfully.`,
          details: result
        });
      } else {
        setAllUsersResult({
          type: 'error',
          message: `Email campaign failed: ${result.error}`
        });
      }
    } catch (error) {
      setAllUsersResult({
        type: 'error',
        message: `Error: ${error.message}`
      });
    } finally {
      setIsLoadingAll(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-8 rounded-xl max-w-md w-full text-center"
      >
        <div className="mb-6">
          <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            EmailJS Test
          </h1>
          <p className="text-slate-600">
            Test your EmailJS configuration
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Configuration:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>Service ID: service_alsloth</div>
            <div>Template ID: template_4o6zy24</div>
            <div>Public Key: EEwF1Zda2o8ilaO_G</div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={testEmail}
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            isLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Test Email
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={testEmailToAllUsers}
          disabled={isLoadingAll}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 mt-3 ${
            isLoadingAll
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isLoadingAll ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending to All Users...
            </>
          ) : (
            <>
              <Users className="w-5 h-5" />
              Send to All Users (Firebase)
            </>
          )}
        </motion.button>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
              result.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {result.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{result.message}</span>
          </motion.div>
        )}

        {allUsersResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
              allUsersResult.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {allUsersResult.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <div className="text-sm">
              <div>{allUsersResult.message}</div>
              {allUsersResult.details && (
                <div className="mt-2 text-xs opacity-75">
                  <div>✅ Successful: {allUsersResult.details.sent}</div>
                  <div>❌ Failed: {allUsersResult.details.failed}</div>
                  <div>📧 Total: {allUsersResult.details.total}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="mt-6 text-xs text-slate-500">
          <p>Single test: Email will be sent to: rswetha2807@gmail.com</p>
          <p>All users: Emails will be sent to users with email notifications enabled</p>
          <p>Check your inbox after clicking the button</p>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailTestComponent;
