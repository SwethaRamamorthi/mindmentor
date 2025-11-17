import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import emailjs from '@emailjs/browser';

const DirectEmailTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const testDirectEmail = async () => {
    setIsLoading(true);
    setResult(null);
    setDebugInfo(null);

    try {
      console.log('🧪 Testing EmailJS directly...');
      
      // Initialize EmailJS
      emailjs.init('EEwF1Zda2o8ilaO_G');
      
      const templateParams = {
        to_email: 'rswetha2807@gmail.com',
        to_name: 'Test User',
        message_type: 'morning',
        message: 'This is a direct test message from MindMentor!',
        from_name: 'MindMentor',
        reply_to: 'rswetha2807@gmail.com'
      };
      
      console.log('📧 Template parameters:', templateParams);
      setDebugInfo(templateParams);
      
      const response = await emailjs.send(
        'service_alsloth',
        'template_4o6zy24',
        templateParams
      );
      
      console.log('✅ Email sent successfully:', response);
      setResult({
        type: 'success',
        message: 'Email sent successfully! Check your inbox.',
        response: response
      });
      
    } catch (error) {
      console.error('❌ Error sending email:', error);
      setResult({
        type: 'error',
        message: `Error: ${error.text || error.message}`,
        error: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-8 rounded-xl max-w-2xl w-full"
      >
        <div className="mb-6">
          <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">
            Direct EmailJS Test
          </h1>
          <p className="text-slate-600 text-center">
            Test EmailJS directly without Firebase
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
          onClick={testDirectEmail}
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
              Testing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Test Direct Email
            </>
          )}
        </motion.button>

        {debugInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg"
          >
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Debug Info - Template Parameters:
            </h4>
            <pre className="text-xs text-gray-700 bg-white p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </motion.div>
        )}

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
            <div className="text-sm">
              <div>{result.message}</div>
              {result.error && (
                <div className="mt-2 text-xs opacity-75">
                  <div>Status: {result.error.status}</div>
                  <div>Text: {result.error.text}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="mt-6 text-xs text-slate-500 text-center">
          <p>This test sends an email directly to: rswetha2807@gmail.com</p>
          <p>Check your inbox after clicking the button</p>
        </div>
      </motion.div>
    </div>
  );
};

export default DirectEmailTest;
