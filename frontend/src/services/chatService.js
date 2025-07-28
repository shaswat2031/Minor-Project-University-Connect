import axios from "axios";
import { io } from "socket.io-client";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/chat`;

class ChatService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.eventListeners = new Map();
  }

  // Initialize socket connection with proper management
  connect(token) {
    // Prevent multiple connections
    if (this.socket && this.isConnected) {
      console.log("Socket already connected");
      return this.socket;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.disconnect();
    }

    const authToken = token || localStorage.getItem("token");
    if (!authToken) {
      console.error("No token available for socket connection");
      return null;
    }

    try {
      this.socket = io(import.meta.env.VITE_API_URL, {
        auth: { token: authToken },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      this.setupSocketEventListeners();
      return this.socket;
    } catch (error) {
      console.error("Error creating socket connection:", error);
      return null;
    }
  }

  setupSocketEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to chat server");
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from chat server:", reason);
      this.isConnected = false;

      // Auto-reconnect for certain reasons
      if (reason === "io server disconnect") {
        // Server disconnected the client, try to reconnect
        console.log("Server disconnected, attempting reconnection...");
        setTimeout(() => {
          if (this.socket && !this.isConnected) {
            this.socket.connect();
          }
        }, 1000);
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      this.isConnected = false;
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
        this.disconnect();
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Re-emit user online status after reconnection
      const userInfo = {
        name: localStorage.getItem("userName") || "User",
      };
      this.emitUserOnline(userInfo);
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error.message);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Failed to reconnect after maximum attempts");
      this.isConnected = false;
    });
  }

  // Disconnect socket with cleanup
  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.eventListeners.clear();
      console.log("Socket disconnected and cleaned up");
    }
  }

  // Check if connected
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  // Send message via socket with fallback
  sendMessage(receiverId, content, messageType = "text") {
    if (!receiverId || !content) {
      console.error("Missing receiverId or content");
      return Promise.reject(new Error("Missing required fields"));
    }

    if (this.isSocketConnected()) {
      return new Promise((resolve, reject) => {
        // Set up a timeout for socket response
        const timeout = setTimeout(() => {
          console.warn("Socket message timeout, falling back to HTTP");
          this.sendMessageHTTP(receiverId, content, messageType)
            .then(resolve)
            .catch(reject);
        }, 5000);

        // Set up success handler
        const onSuccess = (message) => {
          clearTimeout(timeout);
          this.socket.off("message-sent", onSuccess);
          this.socket.off("message-error", onError);
          resolve(message);
        };

        // Set up error handler
        const onError = (error) => {
          clearTimeout(timeout);
          this.socket.off("message-sent", onSuccess);
          this.socket.off("message-error", onError);
          console.warn("Socket message failed, falling back to HTTP:", error);
          this.sendMessageHTTP(receiverId, content, messageType)
            .then(resolve)
            .catch(reject);
        };

        // Listen for response
        this.socket.once("message-sent", onSuccess);
        this.socket.once("message-error", onError);

        // Send the message
        this.socket.emit("send-message", {
          receiverId,
          content,
          messageType,
        });
      });
    } else {
      console.warn("Socket not connected, using HTTP fallback");
      return this.sendMessageHTTP(receiverId, content, messageType);
    }
  }

  // Listen for incoming messages with proper cleanup
  onMessage(callback) {
    if (this.socket) {
      // Remove existing listener to prevent duplicates
      this.socket.off("receive-message");
      this.socket.on("receive-message", callback);
      this.eventListeners.set("receive-message", callback);
    }
  }

  // Listen for message sent confirmation
  onMessageSent(callback) {
    if (this.socket) {
      this.socket.off("message-sent");
      this.socket.on("message-sent", callback);
      this.eventListeners.set("message-sent", callback);
    }
  }

  // Listen for message errors
  onMessageError(callback) {
    if (this.socket) {
      this.socket.off("message-error");
      this.socket.on("message-error", callback);
      this.eventListeners.set("message-error", callback);
    }
  }

  // Listen for typing indicators
  onTyping(callback) {
    if (this.socket) {
      this.socket.off("user-typing");
      this.socket.on("user-typing", callback);
      this.eventListeners.set("user-typing", callback);
    }
  }

  // Emit typing indicator
  emitTyping(receiverId) {
    if (this.isSocketConnected() && receiverId) {
      this.socket.emit("typing", { receiverId });
    }
  }

  // Emit stop typing indicator
  emitStopTyping(receiverId) {
    if (this.isSocketConnected() && receiverId) {
      this.socket.emit("stop-typing", { receiverId });
    }
  }

  // Emit user online status
  emitUserOnline(userInfo) {
    if (this.isSocketConnected() && userInfo) {
      this.socket.emit("user-online", userInfo);
    }
  }

  // Listen for online users
  onOnlineUsers(callback) {
    if (this.socket) {
      this.socket.off("online-users-list");
      this.socket.on("online-users-list", callback);
      this.eventListeners.set("online-users-list", callback);
    }
  }

  // Listen for user status changes
  onUserStatusChange(callback) {
    if (this.socket) {
      this.socket.off("user-status-change");
      this.socket.on("user-status-change", callback);
      this.eventListeners.set("user-status-change", callback);
    }
  }

  // Get conversations with better error handling
  async getConversations() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await axios.get(`${API_BASE_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching conversations:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return [];
    }
  }

  // Get messages with a specific user
  async getMessages(otherUserId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      if (!otherUserId) {
        throw new Error("No user ID provided");
      }

      const response = await axios.get(
        `${API_BASE_URL}/messages/${otherUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return [];
    }
  }

  // Send message via HTTP (fallback)
  async sendMessageHTTP(receiverId, content, messageType = "text") {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await axios.post(
        `${API_BASE_URL}/send`,
        {
          receiverId,
          content,
          messageType,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return 0;
      }

      const response = await axios.get(`${API_BASE_URL}/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      return response.data.unreadCount || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }

  // Mark messages as read
  async markAsRead(otherUserId) {
    try {
      const token = localStorage.getItem("token");
      if (!token || !otherUserId) return;

      await axios.put(
        `${API_BASE_URL}/mark-read/${otherUserId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        }
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }
}

// Export singleton instance
export default new ChatService();
