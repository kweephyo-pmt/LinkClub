import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, X } from 'lucide-react';
import { webrtcManager } from '../lib/webrtc';
import SpeakerButton from './SpeakerButton';

const CallModal = ({ 
  isOpen, 
  onClose, 
  callType, // 'incoming', 'outgoing', 'active'
  callData, // { fromUser, toUser, type: 'audio'|'video' }
  onAccept,
  onReject,
  onEndCall
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const callStartTime = useRef(null);
  const durationInterval = useRef(null);

  useEffect(() => {
    if (callType === 'active' && !callStartTime.current) {
      callStartTime.current = Date.now();
      durationInterval.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }, 1000);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [callType]);

  useEffect(() => {
    console.log('CallModal: ===== SETTING UP REMOTE STREAM HANDLER =====');
    console.log('CallModal: Current webrtcManager.onRemoteStream:', !!webrtcManager.onRemoteStream);
    
    // Store the original callback if it exists
    const originalCallback = webrtcManager.onRemoteStream;
    
    webrtcManager.onRemoteStream = (stream) => {
      console.log('CallModal: ===== RECEIVED REMOTE STREAM =====');
      console.log('CallModal: Stream ID:', stream.id);
      console.log('CallModal: Stream tracks:', stream.getTracks().map(t => `${t.kind}: enabled=${t.enabled}, state=${t.readyState}`));
      console.log('CallModal: Call data type:', callData?.type);
      console.log('CallModal: Audio ref exists:', !!remoteAudioRef.current);
      console.log('CallModal: Video ref exists:', !!remoteVideoRef.current);
      
      // Call original callback first if it exists
      if (originalCallback) {
        originalCallback(stream);
      }
      
      // ALWAYS assign to remote audio element for audio playback
      if (remoteAudioRef.current) {
        console.log('CallModal: Assigning stream to remote audio element');
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.volume = 1.0;
        remoteAudioRef.current.muted = false;
        
        remoteAudioRef.current.play().then(() => {
          console.log('CallModal: Remote audio playing successfully');
        }).catch(e => {
          console.error('CallModal: Error playing remote audio:', e);
        });
        
        if (remoteAudioRef.current.setSinkId) {
          remoteAudioRef.current.setSinkId('default').catch(console.error);
        }
      } else {
        console.error('CallModal: Remote audio ref is null!');
      }
      
      // Handle video calls - also assign to video element
      if (callData?.type === 'video' && remoteVideoRef.current) {
        console.log('CallModal: Assigning stream to remote video element');
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.volume = 1.0;
        remoteVideoRef.current.muted = false;
        
        remoteVideoRef.current.play().then(() => {
          console.log('CallModal: Remote video playing successfully');
        }).catch(e => {
          console.error('CallModal: Error playing remote video:', e);
        });
        
        if (remoteVideoRef.current.setSinkId) {
          remoteVideoRef.current.setSinkId('default').catch(console.error);
        }
      }
      
      setConnectionStatus('connected');
    };
    
    console.log('CallModal: Remote stream handler set up complete');

    webrtcManager.onCallEnded = () => {
      console.log('CallModal: Call ended, closing modal');
      onClose();
    };
    
    webrtcManager.onError = (error) => {
      console.error('CallModal: WebRTC error:', error);
      setConnectionStatus('failed');
    };
    
    // Test if we can get existing streams
    const existingRemoteStream = webrtcManager.getRemoteStream();
    if (existingRemoteStream) {
      console.log('CallModal: Found existing remote stream:', existingRemoteStream.id);
      webrtcManager.onRemoteStream(existingRemoteStream);
    }

    // Set up local stream for active calls
    if (callType === 'active') {
      setTimeout(() => {
        console.log('CallModal: Setting up streams for active call');
        const localStream = webrtcManager.getLocalStream();
        const remoteStream = webrtcManager.getRemoteStream();
        
        console.log('CallModal: Local stream:', localStream);
        console.log('CallModal: Remote stream:', remoteStream);
        
        console.log('CallModal: Setting up streams - local:', localStream, 'remote:', remoteStream);
        
        if (localStream && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
          localVideoRef.current.muted = true; // Prevent echo
          localVideoRef.current.play().catch(e => {
            console.error('CallModal: Error playing local video:', e);
          });
        }
        
        // Set up local audio for audio calls
        if (localStream && localAudioRef.current) {
          localAudioRef.current.srcObject = localStream;
          localAudioRef.current.muted = true; // Prevent echo
        }
        
        if (remoteStream && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.volume = 1.0;
          remoteVideoRef.current.play().catch(e => {
            console.error('CallModal: Error playing remote video:', e);
          });
        }
        
        // Set up remote audio for audio calls
        if (remoteStream && remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.volume = 1.0;
          remoteAudioRef.current.play().catch(e => {
            console.error('CallModal: Error playing remote audio:', e);
          });
        }
      }, 500);
    }

    return () => {
      webrtcManager.onRemoteStream = null;
      webrtcManager.onCallEnded = null;
      webrtcManager.onError = null;
    };
  }, [onClose, callType, callData?.type]);

  useEffect(() => {
    if (callType === 'outgoing' || callType === 'active') {
      const localStream = webrtcManager.getLocalStream();
      console.log('CallModal: Setting local stream:', localStream);
      
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.muted = true; // Prevent echo
        
        localVideoRef.current.play().catch(e => {
          console.error('CallModal: Error playing local video:', e);
        });
        
        console.log('CallModal: Local stream tracks:', localStream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      }
      
      // Set up local audio stream for audio calls
      if (localStream && localAudioRef.current) {
        localAudioRef.current.srcObject = localStream;
        localAudioRef.current.muted = true; // Prevent echo
        console.log('CallModal: Local audio stream set up');
      }
    }
  }, [callType]);

  const handleAccept = async () => {
    const success = await webrtcManager.acceptCall(callData);
    if (success && onAccept) {
      onAccept();
    }
  };

  const handleReject = () => {
    webrtcManager.rejectCall(callData);
    if (onReject) {
      onReject();
    }
  };

  const handleEndCall = () => {
    webrtcManager.endCall(callData.fromUser?._id || callData.toUser?._id);
    if (onEndCall) {
      onEndCall();
    }
  };

  const toggleMute = () => {
    const muted = webrtcManager.toggleMute();
    setIsMuted(muted);
  };

  const toggleCamera = () => {
    const cameraOff = webrtcManager.toggleCamera();
    setIsCameraOff(cameraOff);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const isVideoCall = callData?.type === 'video';
  const otherUser = callData?.fromUser || callData?.toUser;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className={`bg-base-100 rounded-2xl shadow-2xl overflow-hidden ${
        isVideoCall ? 'w-full h-full max-w-4xl max-h-3xl' : 'w-96'
      }`}>
        
        {/* Video Call Layout */}
        {callData?.type === 'video' && (
          <div className="relative w-full h-full bg-gray-900">
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              controls={false}
              onLoadedMetadata={() => console.log('CallModal: Remote video metadata loaded')}
              onPlay={() => console.log('CallModal: Remote video started playing')}
              onError={(e) => console.error('CallModal: Remote video error:', e)}
            />
            
            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
                controls={false}
                onLoadedMetadata={() => console.log('CallModal: Local video metadata loaded')}
                onPlay={() => console.log('CallModal: Local video started playing')}
                onError={(e) => console.error('CallModal: Local video error:', e)}
              />
            </div>
            
            {/* Call Info Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-3 bg-black/50 rounded-lg p-3">
              <img
                src={otherUser?.profilePic || '/avatar.png'}
                alt={otherUser?.fullName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-white font-medium">{otherUser?.fullName}</p>
                <p className="text-white/70 text-sm">
                  {callType === 'active' ? formatDuration(callDuration) : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 
                   connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Audio Call Layout */}
        {!isVideoCall && (
          <div className="p-8 text-center">
            <div className="mb-6">
              <img
                src={otherUser?.profilePic || '/avatar.png'}
                alt={otherUser?.fullName}
                className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-primary/20"
              />
              <h3 className="text-xl font-semibold text-base-content mb-2">
                {otherUser?.fullName}
              </h3>
              <p className="text-base-content/60">
                {callType === 'incoming' && 'Incoming call...'}
                {callType === 'outgoing' && (connectionStatus === 'connecting' ? 'Connecting...' : 'Calling...')}
                {callType === 'active' && formatDuration(callDuration)}
              </p>
            </div>
            
            {/* Hidden audio elements for audio calls */}
            <audio
              ref={localAudioRef}
              autoPlay
              muted
              style={{ display: 'none' }}
            />
            <audio
              ref={remoteAudioRef}
              autoPlay
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Call Controls */}
        <div className={`${isVideoCall ? 'absolute bottom-8 left-1/2 transform -translate-x-1/2' : ''} 
          flex items-center justify-center gap-4 p-6 bg-base-100/90 backdrop-blur-sm ${isVideoCall ? 'rounded-2xl' : ''}`}>
          
          {/* Incoming Call Controls */}
          {callType === 'incoming' && (
            <>
              <button
                onClick={handleReject}
                className="btn btn-circle btn-lg bg-error hover:bg-error/80 text-white border-none"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={handleAccept}
                className="btn btn-circle btn-lg bg-success hover:bg-success/80 text-white border-none"
              >
                <Phone className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Active Call Controls */}
          {(callType === 'outgoing' || callType === 'active') && (
            <>
              <button
                onClick={toggleMute}
                className={`btn btn-circle btn-lg ${isMuted ? 'bg-error text-white' : 'bg-base-200 hover:bg-base-300'}`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {isVideoCall && (
                <button
                  onClick={toggleCamera}
                  className={`btn btn-circle btn-lg ${isCameraOff ? 'bg-error text-white' : 'bg-base-200 hover:bg-base-300'}`}
                >
                  {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              <SpeakerButton audioElement={remoteVideoRef.current} />

              <button
                onClick={handleEndCall}
                className="btn btn-circle btn-lg bg-error hover:bg-error/80 text-white border-none"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Close button for outgoing calls */}
        {callType === 'outgoing' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 btn btn-circle btn-sm bg-base-200/80 hover:bg-base-300/80"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CallModal;
