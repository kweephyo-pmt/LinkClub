import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [searchParams] = useSearchParams();
  const callType = searchParams.get('type') || 'video';
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [streamToken, setStreamToken] = useState(null);
  const [callStartTime, setCallStartTime] = useState(null);

  const { authUser } = useAuthStore();

  // Get Stream token
  useEffect(() => {
    const getStreamToken = async () => {
      try {
        const response = await axiosInstance.get("/stream/token");
        setStreamToken(response.data.token);
      } catch (error) {
        toast.error("Failed to get stream token: " + (error.response?.data?.message || error.message));
        setIsConnecting(false);
      }
    };

    if (authUser) {
      getStreamToken();
    }
  }, [authUser]);

  useEffect(() => {
    const initCall = async () => {
      if (!streamToken || !authUser || !callId) {
        return;
      }

      try {
        
        if (!STREAM_API_KEY) {
          throw new Error("VITE_STREAM_API_KEY environment variable is not set");
        }

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };


        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: streamToken,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        // Set call start time when successfully joined
        setCallStartTime(Date.now());

        // Configure camera and microphone after joining
        if (callType === 'audio') {
          await callInstance.camera.disable();
        } else {
          await callInstance.camera.enable();
        }
        
        // Always enable microphone with explicit settings
        await callInstance.microphone.enable();
        
        // Debug audio tracks
        const audioTracks = await callInstance.microphone.listDevices();
        console.log("Available audio devices:", audioTracks);
        
        // Get local audio stream and verify it's working
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          console.log("Local audio stream:", stream);
          console.log("Audio tracks in stream:", stream.getAudioTracks());
          
          // Check if audio tracks are enabled
          stream.getAudioTracks().forEach((track, index) => {
            console.log(`Audio track ${index}:`, {
              enabled: track.enabled,
              muted: track.muted,
              readyState: track.readyState,
              label: track.label
            });
          });
        } catch (streamError) {
          console.error("Failed to get audio stream:", streamError);
        }

        // Enable speaker/audio output for mobile devices
        try {
          await callInstance.speaker.enable();
          console.log("Speaker enabled");
        } catch (speakerError) {
          console.warn("Speaker enable failed:", speakerError);
        }

        // Force audio context resume for mobile browsers
        if (typeof window !== 'undefined' && window.AudioContext) {
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') {
              await audioContext.resume();
              console.log("Audio context resumed");
            }
          } catch (audioContextError) {
            console.warn("Audio context error:", audioContextError);
          }
        }

        // Debug call participants and their audio status
        setTimeout(() => {
          const participants = callInstance.state.participants;
          console.log("Call participants:", participants);
          participants.forEach((participant, index) => {
            console.log(`Participant ${index}:`, {
              userId: participant.userId,
              isLocalParticipant: participant.isLocalParticipant,
              audioEnabled: participant.audioEnabled,
              publishedTracks: participant.publishedTracks
            });
          });
        }, 2000);

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        toast.error("Could not join the call: " + error.message);
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [streamToken, authUser, callId, callType]);

  if (isConnecting) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="size-10 animate-spin" />
          <p>Connecting to call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative w-full h-full">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent callId={callId} callType={callType} callStartTime={callStartTime} />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = ({ callId, callType, callStartTime }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  // Add user interaction handler for mobile audio
  useEffect(() => {
    const handleUserInteraction = async () => {
      try {
        // Resume audio context on user interaction (required for mobile)
        if (typeof window !== 'undefined' && window.AudioContext) {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
            console.log("Audio context resumed on user interaction");
          }
        }
      } catch (error) {
        console.warn("Audio context resume failed:", error);
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('click', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      // Calculate call duration
      const callDuration = callStartTime ? Date.now() - callStartTime : 0;
      
      // Send call history message with duration before navigating
      sendCallHistoryMessage(callId, callType, callDuration);
      navigate("/");
    }
  }, [callingState, navigate, callId, callType, callStartTime]);

  if (callingState === CallingState.LEFT) {
    return null;
  }

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

const sendCallHistoryMessage = async (callId, callType, duration) => {
  try {
    // Get the selected user from chat store to know who we were calling
    const { useChatStore } = await import("../store/useChatStore");
    const { selectedUser } = useChatStore.getState();
    if (!selectedUser) {
      console.error('No selected user found');
      return;
    }

    const formatDuration = (ms) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      
      if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      }
      return `${remainingSeconds}s`;
    };

    const durationText = duration ? formatDuration(duration) : '0s';
    
    await axiosInstance.post('/messages/call-history', {
      receiverId: selectedUser._id,
      callId,
      callType,
      text: `${callType === 'video' ? 'Video' : 'Audio'} call ended • ${durationText}`
    });
  } catch (error) {
    console.error('Failed to send call history message:', error);
  }
};

export default CallPage;
