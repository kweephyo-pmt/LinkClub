import { create } from 'zustand';
import { webrtcManager } from '../lib/webrtc';
import { useAuthStore } from './useAuthStore';
import { useChatStore } from './useChatStore';
import toast from 'react-hot-toast';

export const useCallStore = create((set, get) => ({
  // Call state
  isCallModalOpen: false,
  callType: null, // 'incoming', 'outgoing', 'active'
  callData: null, // { fromUser, toUser, type: 'audio'|'video' }
  isInCall: false,

  // Initialize WebRTC
  initializeWebRTC: () => {
    const { socket } = useAuthStore.getState();
    console.log('Call store: Initializing WebRTC, socket:', socket?.connected);
    if (!socket) {
      console.log('Call store: No socket available');
      return;
    }

    console.log('Call store: Calling webrtcManager.init with socket');
    webrtcManager.init(socket);
    console.log('Call store: WebRTC manager initialized');

    // Set up event handlers
    webrtcManager.onRemoteStream = (stream) => {
      console.log('Call store: ===== REMOTE STREAM RECEIVED IN STORE =====');
      console.log('Call store: Stream ID:', stream.id);
      console.log('Call store: Stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      // The CallModal will handle the stream assignment
    };

    webrtcManager.onCallReceived = (data) => {
      console.log('Call store: ===== CALL RECEIVED =====');
      console.log('Call store: Call data:', data);
      
      // Get users from chat store
      const { users } = useChatStore.getState();
      const fromUser = users?.find(user => user._id === data.fromUserId) || {
        _id: data.fromUserId,
        fullName: 'Unknown User',
        profilePic: '/avatar.png'
      };
      
      console.log('Call store: Setting incoming call modal state');
      set({
        isCallModalOpen: true,
        callType: 'incoming',
        callData: {
          fromUser,
          type: data.callType,
          offer: data.offer,
          fromUserId: data.fromUserId
        }
      });
      
      console.log('Call store: Incoming call modal should be open now');

      // Show toast notification
      toast(`Incoming ${data.callType} call from ${fromUser.fullName}`, {
        duration: 10000,
        icon: '📞'
      });
    };

    webrtcManager.onCallAccepted = () => {
      console.log('Call store: ===== CALL ACCEPTED =====');
      set({ callType: 'active' });
      toast.success('Call connected');
    };

    webrtcManager.onCallRejected = () => {
      set({
        isCallModalOpen: false,
        callType: null,
        callData: null,
        isInCall: false
      });
      toast.error('Call was rejected');
    };

    webrtcManager.onCallEnded = () => {
      set({
        isCallModalOpen: false,
        callType: null,
        callData: null,
        isInCall: false
      });
      toast('Call ended');
    };

    webrtcManager.onError = (error) => {
      console.error('WebRTC error:', error);
      toast.error('Call failed: ' + error.message);
      set({
        isCallModalOpen: false,
        callType: null,
        callData: null,
        isInCall: false
      });
    };
  },

  // Start a call
  startCall: async (targetUser, callType = 'video') => {
    try {
      console.log('Call store: Starting call with type:', callType);
      console.log('Call store: Target user:', targetUser);
      
      // Immediately show outgoing call modal
      set({
        isCallModalOpen: true,
        callType: 'outgoing',
        callData: {
          toUser: targetUser,
          type: callType
        },
        isInCall: true
      });
      
      console.log('Call store: Modal should be open now');
      
      const success = await webrtcManager.startCall(targetUser._id, callType);
      
      if (!success) {
        console.error('Call store: Failed to start WebRTC call');
        // Close modal if call failed
        set({
          isCallModalOpen: false,
          callType: null,
          callData: null,
          isInCall: false
        });
        toast.error('Failed to start call');
        return false;
      }
      
      console.log('Call store: WebRTC call started successfully');
      return true;
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call');
      // Close modal on error
      set({
        isCallModalOpen: false,
        callType: null,
        callData: null,
        isInCall: false
      });
      return false;
    }
  },

  // Accept incoming call
  acceptCall: async () => {
    const { callData } = get();
    if (!callData) return false;

    try {
      const success = await webrtcManager.acceptCall(callData);
      if (success) {
        set({ 
          callType: 'active',
          isInCall: true 
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to accept call');
      return false;
    }
  },

  // Reject incoming call
  rejectCall: () => {
    const { callData } = get();
    if (callData) {
      webrtcManager.rejectCall(callData);
    }
    set({
      isCallModalOpen: false,
      callType: null,
      callData: null,
      isInCall: false
    });
  },

  // End active call
  endCall: () => {
    const { callData } = get();
    if (callData) {
      const targetUserId = callData.fromUser?._id || callData.toUser?._id;
      webrtcManager.endCall(targetUserId);
    }
    set({
      isCallModalOpen: false,
      callType: null,
      callData: null,
      isInCall: false
    });
  },

  // Close call modal
  closeCallModal: () => {
    const { callType } = get();
    
    // If it's an outgoing call that hasn't been answered, end it
    if (callType === 'outgoing') {
      get().endCall();
    } else {
      set({
        isCallModalOpen: false,
        callType: null,
        callData: null,
        isInCall: false
      });
    }
  },

  // Utility methods
  toggleMute: () => {
    return webrtcManager.toggleMute();
  },

  toggleCamera: () => {
    return webrtcManager.toggleCamera();
  },

  getLocalStream: () => {
    return webrtcManager.getLocalStream();
  },

  getRemoteStream: () => {
    return webrtcManager.getRemoteStream();
  }
}));
