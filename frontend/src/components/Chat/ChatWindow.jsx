import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaUser, FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import PropTypes from "prop-types";
import chatService from "../../services/chatService";

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [socketConnected, setSocketConnected] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserId = localStorage.getItem("userId");

  // Helper function for time formatting
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const socket = chatService.connect(token);
      if (socket) {
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

        // Listen for new messages
        chatService.onMessage((message) => {
          if (message && message._id) {
            setMessages((prev) => {
              const exists = prev.find((m) => m._id === message._id);
              if (exists) return prev;
              return [...prev, message];
            });
            scrollToBottom();
          }
        });

        // Listen for typing indicators
        chatService.onTyping((data) => {
          if (
            data &&
            selectedConversation &&
            data.senderId === selectedConversation.otherUser.id
          ) {
            setTypingUser(data.isTyping ? {
              id: data.senderId,
              name: data.senderName || selectedConversation.otherUser.name
            } : null);
          }
        });

        fetchConversations();
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      chatService.disconnect();
      setSocketConnected(false);
    };
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.otherUser.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const conversationsData = await chatService.getConversations();
      setConversations(
        Array.isArray(conversationsData) ? conversationsData : []
      );
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const messagesData = await chatService.getMessages(userId);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      await chatService.markAsRead(userId);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      chatService.emitStopTyping(selectedConversation.otherUser.id);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    try {
      await chatService.sendMessage(selectedConversation.otherUser.id, messageContent);
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageContent); // Restore message on error
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (selectedConversation && value.trim() && !isTyping) {
      setIsTyping(true);
      chatService.emitTyping(selectedConversation.otherUser.id);
    }

    // Debounce typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedConversation) {
        chatService.emitStopTyping(selectedConversation.otherUser.id);
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isUserOnline = (userId) => {
    return userId && onlineUsers.has(userId);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-20 right-4 w-80 h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl border border-gray-600 flex items-center justify-center backdrop-blur-sm z-[9999]"
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-white text-sm">Loading conversations...</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="fixed bottom-20 right-4 w-80 h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl border border-gray-600 flex flex-col backdrop-blur-sm z-[9999]"
    >
      {/* Enhanced Header */}
      <div className="p-4 border-b border-gray-600/50 flex justify-between items-center bg-gradient-to-r from-gray-700 to-gray-800 rounded-t-lg">
        <div className="flex items-center space-x-2">
          {selectedConversation && (
            <button
              onClick={() => setSelectedConversation(null)}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
            >
              <FaArrowLeft size={14} />
            </button>
          )}
          
          {selectedConversation ? (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {selectedConversation.otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                {isUserOnline(selectedConversation.otherUser.id) && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </div>
              
              <div>
                <h3 className="text-white font-semibold text-sm">
                  {selectedConversation.otherUser?.name || "Unknown User"}
                </h3>
                <p className="text-xs text-gray-400">
                  {isUserOnline(selectedConversation.otherUser.id) ? "● Online" : "Offline"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-sm">Messages</h3>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {!socketConnected && (
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Connecting..."></div>
          )}
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
          >
            <FaTimes size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Enhanced Conversations List */}
        <AnimatePresence>
          {!selectedConversation && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full overflow-y-auto"
            >
              {conversations.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">No conversations yet</p>
                  <p className="text-gray-500 text-xs mt-1">Start chatting with other students!</p>
                </div>
              ) : (
                conversations.map((conversation, index) => (
                  <motion.div
                    key={conversation._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedConversation(conversation)}
                    className="p-3 border-b border-gray-700/50 cursor-pointer hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {conversation.otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        {isUserOnline(conversation.otherUser?.id) && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-white text-sm font-medium truncate">
                            {conversation.otherUser?.name || "Unknown User"}
                          </p>
                          {conversation.lastMessage?.createdAt && (
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                              {formatMessageTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-400 text-xs truncate">
                          {conversation.lastMessage?.content || "No messages"}
                        </p>
                      </div>
                      
                      {conversation.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-white font-bold">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Chat Window */}
        <AnimatePresence>
          {selectedConversation && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col"
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {Array.isArray(messages) &&
                  messages.map((message, index) => {
                    const isCurrentUser = message.sender._id === currentUserId;
                    const showAvatar = index === 0 || messages[index - 1]?.sender._id !== message.sender._id;
                    
                    return (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex items-end space-x-2 max-w-xs ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {!isCurrentUser && showAvatar && (
                            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {message.sender.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          
                          <div
                            className={`px-3 py-2 rounded-lg text-sm shadow-lg ${
                              isCurrentUser
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm"
                                : "bg-gray-700 text-white rounded-bl-sm"
                            } ${!showAvatar && !isCurrentUser ? 'ml-8' : ''}`}
                          >
                            <p className="break-words">{message.content}</p>
                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-400'}`}>
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                {/* Enhanced Typing Indicator */}
                <AnimatePresence>
                  {typingUser && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-end space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {typingUser.name?.charAt(0)?.toUpperCase()}
                        </div>
                        
                        <div className="bg-gray-700 px-3 py-2 rounded-lg rounded-bl-sm">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-300 mr-1">typing</span>
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Message Input */}
              <div className="p-3 border-t border-gray-600/50">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      disabled={!socketConnected}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all placeholder-gray-400"
                    />
                  </div>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !socketConnected}
                    className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    <FaPaperPlane size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

ChatWindow.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ChatWindow;
