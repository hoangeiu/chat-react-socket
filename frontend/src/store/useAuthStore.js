import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5001"; // Update with your socket server URL

export const useAuthStore = create((set, get) => ({
  user: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await axiosInstance.get("/auth/check");
      set({ user: response.data });

      get().connectSocket(); // Connect socket after login
    } catch (error) {
      console.error("Error checking authentication:", error);
      set({ user: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const response = await axiosInstance.post("/auth/signup", data);
      set({ user: response.data });
      toast.success("Account created successfully!");

      get().connectSocket(); // Connect socket after login
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      set({ isSigningUp: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ user: null });
      toast.success("Logged out successfully!");

      get().disconnectSocket(); // Disconnect socket on logout
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error(error.response.data.message || "Failed to log out");
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const response = await axiosInstance.post("/auth/login", data);
      set({ user: response.data });
      toast.success("Logged in successfully!");

      get().connectSocket(); // Connect socket after login
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(error.response?.data?.message || "Failed to log in");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const response = await axiosInstance.put("/auth/update-profile", data);
      console.log(response);
      set({ user: response.data });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { user } = get();
    // If user is not logged in or socket is already connected, do nothing
    if (!user || get().socket?.connected) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      query: { userId: user._id },
    });

    socket.connect();

    set({ socket });

    // Listen for online users
    // getOnlineUsers is the key used in the backend to emit online users
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
      set({ socket: null });
    }
  },
}));
