import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import chatService from "../services/chatService";
import { useToast } from "../components/Toast";

const Messages = () => {
  const { error } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(
    location.state?.selectedUser || null
  );
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [socketConnected, setSocketConnected] = useState(false);

  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Helper function for time formatting
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing with debounce
  const handleTypingDebounce = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedUser) {
        chatService.emitStopTyping(selectedUser.id);
      }
    }, 1000);
  }, [selectedUser]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Connect to chat service
    const socket = chatService.connect(token);

    if (!socket) {
      console.error("Failed to establish socket connection");
      setLoading(false);
      return;
    }

    setSocketConnected(true);

    // Emit user online status
    const userInfo = {
      name: localStorage.getItem("userName") || "User",
    };
    chatService.emitUserOnline(userInfo);

    // Setup event listeners
    chatService.onOnlineUsers((users) => {
      const usersMap = new Map();
      if (Array.isArray(users)) {
        users.forEach((user) => {
          if (user && user.id) {
            usersMap.set(user.id, user);
          }
        });
      }
      setOnlineUsers(usersMap);
    });

    chatService.onUserStatusChange((data) => {
      if (!data || !data.userId) return;

      setOnlineUsers((prev) => {
        const newMap = new Map(prev);
        if (data.status === "online") {
          newMap.set(data.userId, {
            id: data.userId,
            name: data.name,
            status: "online",
          });
        } else {
          newMap.delete(data.userId);
        }
        return newMap;
      });
    });

    chatService.onMessage((message) => {
      if (!message || !message._id) return;

      setMessages((prev) => {
        // Check if message already exists
        const exists = prev.find((m) => m._id === message._id);
        if (exists) return prev;

        return [...prev, message];
      });

      // Mark as read if this is the selected conversation
      if (
        selectedUser &&
        message.sender &&
        message.sender._id === selectedUser.id
      ) {
        chatService.markAsRead(selectedUser.id);
      }
    });

    chatService.onMessageSent((message) => {
      if (!message || !message._id) return;

      setMessages((prev) => {
        // Check if message already exists
        const exists = prev.find((m) => m._id === message._id);
        if (exists) return prev;

        return [...prev, message];
      });
    });

    chatService.onMessageError((error) => {
      console.error("Message error:", error);
      const errorMessage =
        error?.error ||
        error?.message ||
        "Failed to send message. Please try again.";
      error(errorMessage);

      // Show additional debugging info in console
      console.error("Full error object:", error);
      console.error("Socket connected:", chatService.isSocketConnected());
      console.error("Selected user:", selectedUser);
    });

    chatService.onTyping((data) => {
      if (!data || !data.senderId || !selectedUser) return;

      if (data.senderId === selectedUser.id) {
        setTypingUser(data.isTyping ? { name: data.senderName || 'User', id: data.senderId } : null);
      }
    });

    // Fetch conversations
    fetchConversations();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      chatService.disconnect();
      setSocketConnected(false);
    };
  }, [token, navigate, selectedUser]);

  useEffect(() => {
    if (selectedUser?.id) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  const fetchConversations = async () => {
    try {
      const conversationsData = await chatService.getConversations();
      setConversations(
        Array.isArray(conversationsData) ? conversationsData : []
      );
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    if (!userId) return;

    try {
      const messagesData = await chatService.getMessages(userId);
      setMessages(Array.isArray(messagesData) ? messagesData : []);

      // Mark messages as read
      await chatService.markAsRead(userId);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser?.id) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    if (isTyping) {
      setIsTyping(false);
      chatService.emitStopTyping(selectedUser.id);
    }

    try {
      // Try socket first, with HTTP fallback
      if (chatService.isSocketConnected()) {
        console.log("Sending message via socket...");
        await chatService.sendMessage(selectedUser.id, messageContent);
      } else {
        console.log("Socket not connected, using HTTP fallback...");
        await chatService.sendMessageHTTP(selectedUser.id, messageContent);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageContent); // Restore message on error

      // Provide more specific error messages
      let errorMessage = "Failed to send message. Please try again.";
      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
        localStorage.removeItem("token");
        navigate("/login");
        return;
      } else if (error.response?.status === 404) {
        errorMessage =
          "User not found. They may have deactivated their account.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please check your connection.";
      } else if (!navigator.onLine) {
        errorMessage = "No internet connection. Please check your network.";
      }

      error(errorMessage);
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (selectedUser?.id && value.trim() && !isTyping) {
      setIsTyping(true);
      chatService.emitTyping(selectedUser.id);
    }

    handleTypingDebounce();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isUserOnline = (userId) => {
    return userId && onlineUsers.has(userId);
  };

  const selectUser = (user) => {
    if (!user || !user.id) return;

    setSelectedUser({
      id: user.id,
      name: user.name,
      isOnline: isUserOnline(user.id),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
      <div className="flex h-screen">
        {/* Enhanced Conversations Sidebar */}
        <div className="w-1/3 bg-gray-800/80 backdrop-blur-sm border-r border-gray-700/50">
          <div className="p-4 border-b border-gray-700/50">
            <h2 className="text-xl font-bold text-blue-400">Messages</h2>
            <p className="text-sm text-gray-400">
              {socketConnected ? (
                <span className="text-green-400">✓ Connected</span>
              ) : (
                <span className="text-yellow-400">⚠ Connecting...</span>
              )}
            </p>
          </div>
          <div className="overflow-y-auto h-full">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => {
                if (!conversation?.otherUser) return null;

                return (
                  <div
                    key={conversation._id}
                    onClick={() => selectUser(conversation.otherUser)}
                    className={`p-4 border-b border-gray-700/50 cursor-pointer transition-all duration-200 hover:bg-gray-700/50 relative ${
                      selectedUser?.id === conversation.otherUser.id
                        ? "bg-blue-600/20 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 text-white font-semibold shadow-lg">
                          {conversation.otherUser.name.charAt(0).toUpperCase()}
                        </div>
                        {/* Online indicator */}
                        {isUserOnline(conversation.otherUser.id) && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-white truncate">
                            {conversation.otherUser.name}
                          </h3>
                          {conversation.lastMessage?.createdAt && (
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {formatMessageTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-400 truncate">
                          {conversation.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                      
                      {/* Unread indicator */}
                      {conversation.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                          <span className="text-xs text-white font-bold">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Enhanced Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {selectedUser ? (
            <>
              {/* Enhanced Chat Header */}
              <div className="p-4 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 text-white font-semibold">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    {isUserOnline(selectedUser.id) && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-400">
                      {isUserOnline(selectedUser.id) ? (
                        <span className="text-green-400">● Online</span>
                      ) : (
                        "Offline"
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Chat actions */}
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Enhanced Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-900 to-gray-800">
                {messages.map((message, index) => {
                  if (!message || !message._id || !message.sender) return null;

                  const isCurrentUser = message.sender._id === currentUserId;
                  const showAvatar = index === 0 || messages[index - 1]?.sender._id !== message.sender._id;
                  const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.sender._id !== message.sender._id;

                  return (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {!isCurrentUser && showAvatar && (
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {message.sender.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
                        <div
                          className={`px-4 py-2 rounded-2xl shadow-lg ${
                            isCurrentUser
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                              : "bg-gray-700 text-white rounded-bl-md"
                          } ${!showAvatar && !isCurrentUser ? 'ml-10' : ''}`}
                        >
                          {!isCurrentUser && showAvatar && (
                            <p className="text-xs text-gray-300 mb-1 font-medium">
                              {message.sender.name}
                            </p>
                          )}
                          
                          <p className="break-words">{message.content}</p>
                          
                          {isLastInGroup && (
                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-400'}`}>
                              {formatMessageTime(message.createdAt)}
                              {isCurrentUser && (
                                <span className="ml-2">
                                  {message.read ? '✓✓' : '✓'}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Enhanced Typing Indicator */}
                {typingUser && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-end space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {typingUser.name?.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-md">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-300 mr-2">{typingUser.name} is typing</span>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Message Input */}
              <div className="p-4 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      disabled={!socketConnected}
                      className="w-full p-3 pr-12 bg-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                    />
                    
                    {/* Emoji button */}
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" />
                      </svg>
                    </button>
                  </div>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !socketConnected}
                    className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                
                {!socketConnected && (
                  <div className="mt-2 text-center">
                    <span className="text-sm text-yellow-400">● Connecting...</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Start a Conversation
                </h3>
                <p className="text-gray-400">
                  Select a student from the sidebar to begin messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
