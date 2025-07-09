import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaUser, FaPaperPlane } from "react-icons/fa";
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
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    // Connect to chat service
    const token = localStorage.getItem("token");
    if (token) {
      chatService.connect(token);

      // Emit user online status
      const userInfo = {
        name: localStorage.getItem("userName") || "User",
      };
      chatService.emitUserOnline(userInfo);

      // Listen for new messages
      chatService.onMessage((message) => {
        if (message && message._id) {
          setMessages((prev) => [...prev, message]);
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
          setTypingUser(data.isTyping ? data.senderId : null);
        }
      });

      fetchConversations();
    }

    return () => {
      chatService.disconnect();
    };
  }, []);

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
      // Ensure conversationsData is an array
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
      // Ensure messagesData is an array
      setMessages(Array.isArray(messagesData) ? messagesData : []);

      // Mark messages as read
      await chatService.markAsRead(userId);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      chatService.sendMessage(selectedConversation.otherUser.id, newMessage);
      setNewMessage("");
      chatService.emitStopTyping(selectedConversation.otherUser.id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (selectedConversation && !isTyping) {
      setIsTyping(true);
      chatService.emitTyping(selectedConversation.otherUser.id);

      setTimeout(() => {
        setIsTyping(false);
        chatService.emitStopTyping(selectedConversation.otherUser.id);
      }, 1000);
    }
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

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-20 right-4 w-80 h-96 bg-gray-800 rounded-lg shadow-xl border border-gray-700 flex items-center justify-center"
      >
        <div className="text-white">Loading...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed bottom-20 right-4 w-80 h-96 bg-gray-800 rounded-lg shadow-xl border border-gray-700 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-white font-semibold">
          {selectedConversation
            ? selectedConversation.otherUser.name
            : "Messages"}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      <div className="flex-1 flex">
        {/* Conversations List */}
        {!selectedConversation && (
          <div className="w-full overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className="p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2 text-sm">
                      {conversation.otherUser?.name?.charAt(0)?.toUpperCase() ||
                        "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {conversation.otherUser?.name || "Unknown User"}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {conversation.lastMessage?.content || "No messages"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Chat Window */}
        {selectedConversation && (
          <div className="flex-1 flex flex-col">
            {/* Back button */}
            <div className="p-2 border-b border-gray-700">
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                ← Back to conversations
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {Array.isArray(messages) &&
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender._id === currentUserId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        message.sender._id === currentUserId
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

              {typingUser && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

ChatWindow.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ChatWindow;
