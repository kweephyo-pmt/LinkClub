import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { notificationManager } from "../lib/notifications.js";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "https://linkclub-backend.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);

      // Store token in localStorage as fallback for Safari
      if (res.data.token) {
        localStorage.setItem('jwt-token', res.data.token);
      }

      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem('jwt-token'); // Clear token from localStorage
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Request notification permission when connecting
    notificationManager.requestPermission();

    // Initialize friend notifications (import dynamically to avoid circular dependency)
    setTimeout(() => {
      import("./useFriendStore").then(({ useFriendStore }) => {
        useFriendStore.getState().initializeNotifications();
      });

      // Initialize global message subscription for last message updates
      import("./useChatStore").then(({ useChatStore }) => {
        useChatStore.getState().subscribeToMessages();
      });

      // Initialize call notifications
      import("./useCallStore").then(({ useCallStore }) => {
        const callStore = useCallStore.getState();


        socket.on("incoming-call", (data) => {
          callStore.setIncomingCall(data);
        });

        socket.on("call-response", () => {
          // Handle call response if needed
        });

        socket.on("call-failed", (data) => {
          import("react-hot-toast").then(({ default: toast }) => {
            toast.error(data.reason);
          });
        });


      });
    }, 100);
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
