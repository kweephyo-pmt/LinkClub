import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { notificationManager } from "../lib/notifications";
import { useAuthStore } from "./useAuthStore";

export const useFriendStore = create((set, get) => ({
  friends: [],
  friendRequests: { sent: [], received: [] },
  searchResults: [],
  isLoading: false,

  // Initialize socket listeners for friend request notifications
  initializeNotifications: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("friendRequest", (data) => {
      const { sender } = data;
      notificationManager.showFriendRequestNotification(
        sender.fullName,
        sender.profilePic
      );
      notificationManager.playNotificationSound();
      
      // Refresh friend requests to show the new one
      get().getFriendRequests();
    });

    socket.on("friendRequestAccepted", (data) => {
      const { friend } = data;
      notificationManager.showFriendAcceptedNotification(
        friend.fullName,
        friend.profilePic
      );
      notificationManager.playNotificationSound();
      
      // Refresh friends list
      get().getFriends();
    });
  },

  // Get friends list
  getFriends: async () => {
    try {
      const res = await axiosInstance.get("/friends");
      set({ friends: res.data });
    } catch (error) {
      console.error("Error fetching friends:", error);
      // Only show error if it's not an auth issue
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to fetch friends");
      }
    }
  },

  // Get friend requests
  getFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/requests");
      const requestsData = res.data || { sent: [], received: [] };
      
      // Ensure sent and received are arrays
      if (!Array.isArray(requestsData.sent)) requestsData.sent = [];
      if (!Array.isArray(requestsData.received)) requestsData.received = [];
      
      set({ friendRequests: requestsData });
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      // Set default empty arrays on error
      set({ friendRequests: { sent: [], received: [] } });
      
      // Only show error if it's not an auth issue
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to fetch friend requests");
      }
    }
  },

  // Send friend request
  sendFriendRequest: async (identifier) => {
    try {
      set({ isLoading: true });
      await axiosInstance.post("/friends/request", { identifier });
      toast.success("Friend request sent successfully");
      
      // Refresh friend requests
      get().getFriendRequests();
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error(error.response?.data?.message || "Failed to send friend request");
    } finally {
      set({ isLoading: false });
    }
  },

  // Accept friend request
  acceptFriendRequest: async (requesterId) => {
    try {
      const response = await axiosInstance.post(`/friends/accept/${requesterId}`);
      toast.success("Friend request accepted");
      
      // Show notification to the requester
      const acceptedUser = response.data?.user;
      if (acceptedUser) {
        notificationManager.showFriendAcceptedNotification(
          acceptedUser.fullName,
          acceptedUser.profilePic
        );
      }
      
      // Refresh friends and requests
      get().getFriends();
      get().getFriendRequests();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error(error.response?.data?.message || "Failed to accept friend request");
    }
  },

  // Reject friend request
  rejectFriendRequest: async (requesterId) => {
    try {
      await axiosInstance.post(`/friends/reject/${requesterId}`);
      toast.success("Friend request rejected");
      
      // Refresh friend requests
      get().getFriendRequests();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error(error.response?.data?.message || "Failed to reject friend request");
    }
  },

  // Remove friend (unfriend)
  removeFriend: async (friendId) => {
    try {
      await axiosInstance.delete(`/friends/remove/${friendId}`);
      toast.success("Friend removed successfully");
      
      // Refresh friends list
      get().getFriends();
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error(error.response?.data?.message || "Failed to remove friend");
    }
  },

  // Search users
  searchUsers: async (query) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.get(`/friends/search?query=${encodeURIComponent(query)}`);
      set({ searchResults: res.data });
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error(error.response?.data?.message || "Failed to search users");
      set({ searchResults: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // Clear search results
  clearSearchResults: () => {
    set({ searchResults: [] });
  },
}));
