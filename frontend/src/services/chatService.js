import axios from "axios";
import { io } from "socket.io-client";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/chat`;

class ChatService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // Initialize socket connection
  connect() {
    const token = localStorage.getItem("token");
    if (!token || this.isConnected) return;

    this.socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
    });

    this.socket.on("connect", () => {
      console.log("Connected to chat server");
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from chat server");
      this.isConnected = false;
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Send message via socket
  sendMessage(receiverId, content, messageType = "text") {
    if (this.socket && this.isConnected) {
      this.socket.emit("send-message", {
        receiverId,
        content,
        messageType,
      });
    }
  }

  // Listen for incoming messages
  onMessage(callback) {
    if (this.socket) {
      this.socket.on("receive-message", callback);
    }
  }

  // Listen for typing indicators
  onTyping(callback) {
    if (this.socket) {
      this.socket.on("user-typing", callback);
    }
  }

  // Send typing indicator
  sendTyping(receiverId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("typing", { receiverId });
    }
  }

  // Stop typing indicator
  stopTyping(receiverId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("stop-typing", { receiverId });
    }
  }

  // Get conversations
  async getConversations() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }
  }

  // Get messages with a specific user
  async getMessages(otherUserId) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/messages/${otherUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  }

  // Send message via HTTP (fallback)
  async sendMessageHTTP(receiverId, content, messageType = "text") {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/send`,
        {
          receiverId,
          content,
          messageType,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
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
      const response = await axios.get(`${API_BASE_URL}/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.unreadCount;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }
}

export default new ChatService();
