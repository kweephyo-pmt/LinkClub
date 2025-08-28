import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { notificationManager } from "../lib/notifications";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  lastMessages: {}, // Store last message for each user
  unreadMessages: {}, // Track unread messages count for each user

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      const usersData = Array.isArray(res.data) ? res.data : [];
      set({ users: usersData });
      
      // Fetch last messages for each user
      get().getLastMessages();
    } catch (error) {
      console.error("Error fetching users:", error);
      // Set empty array on error
      set({ users: [] });
      
      // Only show error if it's not an auth issue
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to fetch users");
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getLastMessages: async () => {
    try {
      const { users } = get();
      if (!users || !Array.isArray(users)) {
        console.warn("Users not available or not an array");
        return;
      }
      
      const lastMessagesPromises = users.map(async (user) => {
        try {
          const res = await axiosInstance.get(`/messages/${user._id}?limit=1`);
          const messages = res.data;
          return {
            userId: user._id,
            lastMessage: (Array.isArray(messages) && messages.length > 0) ? messages[messages.length - 1] : null
          };
        } catch {
          return { userId: user._id, lastMessage: null };
        }
      });

      const results = await Promise.all(lastMessagesPromises);
      const lastMessages = {};
      results.forEach(({ userId, lastMessage }) => {
        lastMessages[userId] = lastMessage;
      });

      set({ lastMessages });
    } catch (error) {
      console.error("Error fetching last messages:", error);
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      
      // Mark all received messages as seen when opening chat
      const { authUser } = useAuthStore.getState();
      const unseenMessages = res.data.filter(msg => 
        msg.senderId !== authUser._id && msg.status !== "seen"
      );
      
      unseenMessages.forEach(msg => {
        get().markMessageAsSeen(msg._id);
      });

      // Clear unread count for this user when opening chat
      const { unreadMessages } = get();
      set({
        unreadMessages: {
          ...unreadMessages,
          [userId]: 0
        }
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Handle different error types
      if (error.response?.status === 401) {
        // Auth error - don't show to user
      } else if (error.response?.status === 403) {
        // Friend restriction - show friendly message
        toast.error("You can only view messages from friends. Add them as a friend first!");
        set({ messages: [] });
      } else {
        // Other errors
        toast.error(error.response?.data?.message || "Failed to fetch messages");
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
      
      // Update last message for this user
      const { lastMessages } = get();
      set({
        lastMessages: {
          ...lastMessages,
          [selectedUser._id]: res.data
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to send message");
      }
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { authUser } = useAuthStore.getState();
      const { selectedUser } = get();
      
      // Always update last message for any user (global update)
      const { lastMessages, users, unreadMessages } = get();
      const otherUserId = newMessage.senderId === authUser._id ? newMessage.receiverId : newMessage.senderId;
      
      set({
        lastMessages: {
          ...lastMessages,
          [otherUserId]: newMessage
        }
      });

      // Only update chat messages if this message is from/to the selected user
      const isMessageFromSelectedChat = selectedUser && 
        (newMessage.senderId === selectedUser._id || 
         (newMessage.senderId === authUser._id && newMessage.receiverId === selectedUser._id));

      if (isMessageFromSelectedChat) {
        set({
          messages: [...get().messages, newMessage],
        });

        // Mark message as seen when received (if chat is open)
        if (newMessage.senderId !== authUser._id && !document.hidden) {
          get().markMessageAsSeen(newMessage._id);
        }
      }

      // Track unread messages (only for received messages and not in active chat)
      if (newMessage.senderId !== authUser._id && !isMessageFromSelectedChat) {
        set({
          unreadMessages: {
            ...unreadMessages,
            [otherUserId]: (unreadMessages[otherUserId] || 0) + 1
          }
        });
      }

      // Show notification if message is from someone else
      if (newMessage.senderId !== authUser._id) {
        const sender = users.find(user => user._id === newMessage.senderId);
        console.log('Attempting to show notification for sender:', sender);
        if (sender) {
          console.log('Calling notification manager with:', sender.fullName, newMessage.text);
          notificationManager.showMessageNotification(
            sender.fullName,
            newMessage.text,
            sender.profilePic
          );
          notificationManager.playNotificationSound();
        } else {
          console.log('Sender not found in users list');
        }
      }
    });

    // Listen for message status updates
    socket.on("messageDelivered", (data) => {
      const { messages } = get();
      const updatedMessages = messages.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, status: data.status, deliveredAt: data.deliveredAt }
          : msg
      );
      set({ messages: updatedMessages });
    });

    socket.on("messageSeen", (data) => {
      const { messages } = get();
      const updatedMessages = messages.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, status: data.status, seenAt: data.seenAt }
          : msg
      );
      set({ messages: updatedMessages });
    });
  },

  markMessageAsSeen: async (messageId) => {
    try {
      await axiosInstance.patch(`/messages/seen/${messageId}`);
    } catch (error) {
      console.error("Error marking message as seen:", error);
    }
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageDelivered");
    socket.off("messageSeen");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
