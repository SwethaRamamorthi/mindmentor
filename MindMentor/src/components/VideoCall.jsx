import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { connect, createLocalVideoTrack, createLocalAudioTrack } from 'twilio-video';
import { getTwilioToken } from '../services/twilioService';

const VideoCall = ({ 
  isOpen, 
  onClose, 
  identity, 
  roomName, 
  displayName,
  isDoctor = false 
}) => {
  const [room, setRoom] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteParticipant, setRemoteParticipant] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callStatus, setCallStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected'
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const videoContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && identity && roomName) {
      connectToRoom();
    } else if (!isOpen && room) {
      disconnectFromRoom();
    }

    return () => {
      if (room) {
        disconnectFromRoom();
      }
    };
  }, [isOpen, identity, roomName]);

  const connectToRoom = async () => {
    try {
      setIsConnecting(true);
      setCallStatus('connecting');
      setError(null);

      console.log('📞 Connecting to room:', roomName, 'as', identity);

      // Get access token
      const token = await getTwilioToken(identity, roomName);
      
      // Create local video track
      const localVidTrack = await createLocalVideoTrack({
        width: 1280,
        height: 720,
        frameRate: 24,
      });
      setLocalVideoTrack(localVidTrack);
      if (localVideoRef.current) {
        // Clear any existing content
        localVideoRef.current.innerHTML = '';
        localVideoRef.current.style.width = '100%';
        localVideoRef.current.style.height = '100%';
        localVideoRef.current.style.position = 'relative';
        localVideoRef.current.style.overflow = 'hidden';
        
        // Create video element manually first
        let videoElement = localVideoRef.current.querySelector('video');
        if (!videoElement) {
          videoElement = document.createElement('video');
          videoElement.autoplay = true;
          videoElement.playsInline = true;
          videoElement.muted = true; // Mute local video to prevent echo
          videoElement.style.width = '100%';
          videoElement.style.height = '100%';
          videoElement.style.objectFit = 'cover';
          videoElement.style.display = 'block';
          localVideoRef.current.appendChild(videoElement);
          console.log('📹 Created local video element manually');
        }
        
        // Create a MutationObserver to detect when Twilio attaches
        const observer = new MutationObserver((mutations) => {
          const vidElement = localVideoRef.current?.querySelector('video');
          if (vidElement && vidElement.srcObject) {
            vidElement.style.width = '100%';
            vidElement.style.height = '100%';
            vidElement.style.objectFit = 'cover';
            vidElement.style.display = 'block';
            console.log('✅ Local video track attached and styled via MutationObserver');
            observer.disconnect();
          }
        });
        
        // Start observing
        observer.observe(localVideoRef.current, {
          childList: true,
          subtree: true,
          attributes: true
        });
        
        // Attach the track to the video element
        try {
          localVidTrack.attach(videoElement);
          console.log('📹 Attached local video track to video element');
        } catch (err) {
          // Fallback to container
          localVidTrack.attach(localVideoRef.current);
          console.log('📹 Attached local video track to container (fallback)');
        }
        
        // Style video immediately and retry
        const styleVideo = () => {
          const vid = localVideoRef.current?.querySelector('video');
          if (vid) {
            vid.style.width = '100%';
            vid.style.height = '100%';
            vid.style.objectFit = 'cover';
            vid.style.display = 'block';
            console.log('✅ Local video styled');
            observer.disconnect();
            return true;
          }
          return false;
        };
        
        if (!styleVideo()) {
          setTimeout(() => {
            if (!styleVideo()) {
              setTimeout(() => {
                styleVideo();
                observer.disconnect();
              }, 500);
            }
          }, 200);
        }
        
        setTimeout(() => observer.disconnect(), 2000);
      }

      // Create local audio track
      const localAudTrack = await createLocalAudioTrack();
      setLocalAudioTrack(localAudTrack);

      // Connect to room
      const newRoom = await connect(token, {
        name: roomName,
        tracks: [localVidTrack, localAudTrack],
        dominantSpeaker: true,
      });

      setRoom(newRoom);
      setCallStatus('connected');
      setIsConnecting(false);

      console.log('✅ Connected to room');

      // Handle remote participants
      newRoom.on('participantConnected', (participant) => {
        console.log('👤 Remote participant connected:', participant.identity);
        setRemoteParticipant(participant);
        attachRemoteTracks(participant);
      });

      newRoom.on('participantDisconnected', (participant) => {
        console.log('👤 Remote participant disconnected:', participant.identity);
        setRemoteParticipant(null);
        if (remoteVideoRef.current) {
          // Detach all tracks
          participant.tracks.forEach((publication) => {
            if (publication.track) {
              publication.track.detach();
            }
          });
          remoteVideoRef.current.innerHTML = '';
        }
      });

      // Handle existing participants
      newRoom.participants.forEach((participant) => {
        setRemoteParticipant(participant);
        attachRemoteTracks(participant);
      });

      // Handle disconnection
      newRoom.on('disconnected', () => {
        console.log('📞 Disconnected from room');
        setCallStatus('disconnected');
        setRemoteParticipant(null);
        cleanup();
      });

    } catch (err) {
      console.error('❌ Error connecting to room:', err);
      
      // Provide user-friendly error message
      let errorMessage = 'Failed to connect to video call.';
      
      if (err.message.includes('Unable to connect to Twilio server')) {
        errorMessage = 'Unable to connect to video call server. Please check your connection and try again.';
      } else if (err.message.includes('Network error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Video call server endpoint not found. Please contact support.';
      } else {
        errorMessage = err.message || 'Failed to connect to video call.';
      }
      
      setError(errorMessage);
      setCallStatus('disconnected');
      setIsConnecting(false);
      cleanup();
    }
  };

  const attachRemoteTracks = (participant) => {
    console.log('📹 Attaching tracks for participant:', participant.identity);
    console.log('📹 Available tracks:', participant.tracks.size);
    
    participant.tracks.forEach((publication) => {
      console.log('📹 Track publication:', publication.kind, 'subscribed:', publication.isSubscribed);
      if (publication.isSubscribed) {
        const track = publication.track;
        attachRemoteTrack(track);
      } else {
        // Subscribe to track if not already subscribed
        publication.on('subscribed', (track) => {
          console.log('📹 Track subscribed:', track.kind);
          attachRemoteTrack(track);
        });
      }
    });

    participant.on('trackSubscribed', (track) => {
      console.log('📹 New track subscribed:', track.kind);
      attachRemoteTrack(track);
    });
    
    participant.on('trackUnsubscribed', (track) => {
      console.log('📹 Track unsubscribed:', track.kind);
      track.detach();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = '';
      }
    });
  };

  const attachRemoteTrack = (track) => {
    if (track.kind === 'video') {
      if (remoteVideoRef.current) {
        // Clear existing content
        remoteVideoRef.current.innerHTML = '';
        
        // Ensure container is visible first
        remoteVideoRef.current.style.display = 'block';
        remoteVideoRef.current.style.width = '100%';
        remoteVideoRef.current.style.height = '100%';
        remoteVideoRef.current.style.position = 'absolute';
        remoteVideoRef.current.style.top = '0';
        remoteVideoRef.current.style.left = '0';
        
        // Create video element manually if needed
        let videoElement = remoteVideoRef.current.querySelector('video');
        if (!videoElement) {
          videoElement = document.createElement('video');
          videoElement.autoplay = true;
          videoElement.playsInline = true;
          videoElement.style.width = '100%';
          videoElement.style.height = '100%';
          videoElement.style.objectFit = 'cover';
          videoElement.style.display = 'block';
          videoElement.style.position = 'absolute';
          videoElement.style.top = '0';
          videoElement.style.left = '0';
          videoElement.style.zIndex = '1';
          remoteVideoRef.current.appendChild(videoElement);
          console.log('📹 Created video element manually');
        }
        
        // Create a MutationObserver to detect when Twilio attaches
        const observer = new MutationObserver((mutations) => {
          const vidElement = remoteVideoRef.current?.querySelector('video');
          if (vidElement && vidElement.srcObject) {
            // Style the video element
            vidElement.style.width = '100%';
            vidElement.style.height = '100%';
            vidElement.style.objectFit = 'cover';
            vidElement.style.display = 'block';
            vidElement.style.position = 'absolute';
            vidElement.style.top = '0';
            vidElement.style.left = '0';
            vidElement.style.zIndex = '1';
            console.log('✅ Remote video track attached and styled via MutationObserver');
            observer.disconnect();
          }
        });
        
        // Start observing
        observer.observe(remoteVideoRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['src']
        });
        
        // Attach the track - Twilio will use our video element or create one
        try {
          track.attach(videoElement);
          console.log('📹 Attached remote video track to video element');
        } catch (err) {
          // If attach fails, try attaching to container
          track.attach(remoteVideoRef.current);
          console.log('📹 Attached remote video track to container (fallback)');
        }
        
        // Styling retries
        const styleVideo = () => {
          const vid = remoteVideoRef.current?.querySelector('video');
          if (vid) {
            vid.style.width = '100%';
            vid.style.height = '100%';
            vid.style.objectFit = 'cover';
            vid.style.display = 'block';
            vid.style.position = 'absolute';
            vid.style.top = '0';
            vid.style.left = '0';
            vid.style.zIndex = '1';
            console.log('✅ Remote video styled');
            observer.disconnect();
            return true;
          }
          return false;
        };
        
        // Try styling immediately
        if (!styleVideo()) {
          // Retry after short delay
          setTimeout(() => {
            if (!styleVideo()) {
              setTimeout(() => {
                styleVideo();
                observer.disconnect();
              }, 500);
            }
          }, 200);
        }
        
        // Final cleanup
        setTimeout(() => observer.disconnect(), 2000);
      } else {
        console.warn('⚠️ remoteVideoRef.current is null');
      }
    } else if (track.kind === 'audio') {
      // Audio tracks are handled automatically by Twilio
      track.attach();
      console.log('✅ Remote audio track attached');
    }
  };

  const disconnectFromRoom = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
    }
    cleanup();
    setCallStatus('disconnected');
    setRemoteParticipant(null);
  };

  const cleanup = () => {
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.detach();
      setLocalVideoTrack(null);
    }
    if (localAudioTrack) {
      localAudioTrack.stop();
      setLocalAudioTrack(null);
    }
    if (localVideoRef.current) {
      localVideoRef.current.innerHTML = '';
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.innerHTML = '';
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      if (isVideoEnabled) {
        localVideoTrack.disable();
      } else {
        localVideoTrack.enable();
      }
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (localAudioTrack) {
      if (isAudioEnabled) {
        localAudioTrack.disable();
      } else {
        localAudioTrack.enable();
      }
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const handleEndCall = () => {
    disconnectFromRoom();
    onClose();
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (videoContainerRef.current?.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-7xl h-full max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
          ref={videoContainerRef}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold">
                {callStatus === 'connected' 
                  ? `Call with ${displayName}` 
                  : callStatus === 'connecting' 
                  ? 'Connecting...' 
                  : 'Call Ended'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleEndCall}
                className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Video Container */}
          <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
            {callStatus === 'connecting' ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white text-lg">Connecting to call...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                  <PhoneOff className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-lg">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEndCall}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Close
                </motion.button>
              </div>
            ) : (
              <>
                {/* Remote Video (Main View) */}
                <div className="absolute inset-0 w-full h-full bg-slate-900">
                  {/* Remote video container - always present for track attachment */}
                  <div 
                    ref={remoteVideoRef}
                    id="remote-video-container"
                    className="w-full h-full"
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      overflow: 'hidden',
                      display: remoteParticipant ? 'block' : 'none',
                      zIndex: 1
                    }}
                  />
                  {/* Waiting message - shown when no participant */}
                  {!remoteParticipant && (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center">
                          <Video className="w-16 h-16 text-slate-400" />
                        </div>
                        <p className="text-slate-400 text-lg">Waiting for {isDoctor ? 'patient' : 'doctor'} to join...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Local Video (Picture-in-Picture) */}
                {isVideoEnabled && localVideoTrack && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-20 right-4 w-64 h-48 bg-slate-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-20"
                  >
                    <div 
                      ref={localVideoRef}
                      id="local-video-container"
                      className="w-full h-full bg-slate-700"
                      style={{ 
                        position: 'relative', 
                        overflow: 'hidden',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-xs">
                      You
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Controls */}
          {callStatus === 'connected' && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6"
            >
              <div className="flex items-center justify-center gap-4">
                {/* Toggle Audio */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleAudio}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isAudioEnabled 
                      ? 'bg-white/20 hover:bg-white/30 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </motion.button>

                {/* Toggle Video */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleVideo}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isVideoEnabled 
                      ? 'bg-white/20 hover:bg-white/30 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </motion.button>

                {/* End Call */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg"
                >
                  <PhoneOff className="w-7 h-7" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VideoCall;

