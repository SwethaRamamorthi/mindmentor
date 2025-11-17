import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, User } from 'lucide-react';
import { acceptVideoCall, rejectVideoCall } from '../services/firebaseService';

const IncomingCall = ({ call, onAccept, onReject, onTimeout }) => {
  const timeoutRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (call) {
      // Play ringtone (optional - you can add a sound file)
      // const ringtone = new Audio('/ringtone.mp3');
      // ringtone.loop = true;
      // audioRef.current = ringtone;
      // ringtone.play().catch(e => console.log('Could not play ringtone:', e));

      // Auto-timeout after 30 seconds
      timeoutRef.current = setTimeout(() => {
        if (onTimeout) {
          onTimeout(call.id);
        }
      }, 30000);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        // if (audioRef.current) {
        //   audioRef.current.pause();
        //   audioRef.current = null;
        // }
      };
    }
  }, [call, onTimeout]);

  if (!call) return null;

  const handleAccept = async () => {
    try {
      await acceptVideoCall(call.receiverId, call.id);
      if (onAccept) {
        onAccept(call);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectVideoCall(call.receiverId, call.id);
      if (onReject) {
        onReject(call.id);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-white/20"
        >
          {/* Caller Avatar */}
          <div className="flex flex-col items-center mb-6">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md border-4 border-white/30"
            >
              <User className="w-16 h-16 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Incoming Call</h2>
            <p className="text-white/90 text-lg">{call.callerName || 'Someone'}</p>
            <p className="text-white/70 text-sm mt-1">Video Call</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6">
            {/* Reject Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleReject}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-colors"
            >
              <PhoneOff className="w-8 h-8 text-white" />
            </motion.button>

            {/* Accept Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAccept}
              className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg transition-colors"
            >
              <Phone className="w-10 h-10 text-white" />
            </motion.button>
          </div>

          {/* Status Text */}
          <p className="text-center text-white/70 text-sm mt-6">
            Tap to answer or reject
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IncomingCall;

