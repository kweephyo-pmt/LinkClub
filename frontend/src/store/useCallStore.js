import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

export const useCallStore = create((set, get) => ({
  // Call state
  incomingCall: null,
  isCallModalOpen: false,
  
  // Actions
  setIncomingCall: (callData) => {
    set({ incomingCall: callData, isCallModalOpen: true });
  },
  
  clearIncomingCall: () => {
    set({ incomingCall: null, isCallModalOpen: false });
  },
  
  acceptCall: (callId) => {
    const { socket } = useAuthStore.getState();
    const { incomingCall } = get();
    
    if (socket && incomingCall) {
      socket.emit("call-response", {
        targetUserId: incomingCall.fromUserId,
        callId,
        accepted: true
      });
    }
    
    set({ incomingCall: null, isCallModalOpen: false });
  },
  
  rejectCall: (callId) => {
    const { socket } = useAuthStore.getState();
    const { incomingCall } = get();
    
    if (socket && incomingCall) {
      socket.emit("call-response", {
        targetUserId: incomingCall.fromUserId,
        callId,
        accepted: false
      });
    }
    
    set({ incomingCall: null, isCallModalOpen: false });
  },
  
  sendCallInvitation: (targetUserId, callId, callType) => {
    const { socket, authUser } = useAuthStore.getState();
    
    
    if (socket && authUser) {
      
      socket.emit("call-invitation", {
        targetUserId,
        callId,
        callType,
        callerInfo: {
          id: authUser._id,
          name: authUser.fullName,
          profilePic: authUser.profilePic
        }
      });
      
    }
  }
}));
