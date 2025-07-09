import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaUser, FaPaperPlane } from "react-icons/fa";
import PropTypes from "prop-types";
import chatService from "../../services/chatService";

const ChatWindow = ({ onClose }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadConversations();

    // Listen for new messages
    chatService.onMessage((message) => {
      if (
        selectedChat &&
        (message.sender._id === selectedChat._id ||
          message.receiver._id === selectedChat._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Listen for typing indicators
    chatService.onTyping(({ senderId, isTyping }) => {
      if (selectedChat && senderId === selectedChat._id) {
        setIsTyping(isTyping);
      }
    });
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const convs = await chatService.getConversations();
      setConversations(convs);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectChat = async (conversation) => {
    const otherUser = conversation.participants.find(
      (p) => p._id !== currentUser.id
    );
    setSelectedChat(otherUser);

    try {
      const msgs = await chatService.getMessages(otherUser._id);
      setMessages(msgs);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      chatService.sendMessage(selectedChat._id, messageContent);

      // Add message optimistically
      const tempMessage = {
        _id: Date.now(),
        sender: currentUser,
        receiver: selectedChat,
        content: messageContent,
        createdAt: new Date(),
        isTemp: true,
      };
      setMessages((prev) => [...prev, tempMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (selectedChat) {
      chatService.sendTyping(selectedChat._id);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        chatService.stopTyping(selectedChat._id);
      }, 1000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="fixed bottom-20 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
        <h3 className="font-semibold">
          {selectedChat ? selectedChat.name : "Messages"}
        </h3>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <FaTimes />
        </button>
      </div>

      <div className="flex h-full">
        {/* Conversations List */}
        {!selectedChat && (
          <div className="w-full bg-gray-50">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            ) : (
              <div className="overflow-y-auto h-full">
                {conversations.map((conv) => {
                  const otherUser = conv.participants.find(
                    (p) => p._id !== currentUser.id
                  );
                  return (
                    <div
                      key={conv._id}
                      onClick={() => selectChat(conv)}
                      className="p-3 border-b border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                          <FaUser />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {otherUser?.name || "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {conv.lastMessage?.content || "No messages yet"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Chat Messages */}
        {selectedChat && (
          <div className="flex flex-col w-full">
            {/* Back button for mobile */}
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedChat(null)}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                ← Back to conversations
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((message) => {
                const isOwnMessage = message.sender._id === currentUser.id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        isOwnMessage
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          isOwnMessage ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={sendMessage}
              className="p-3 border-t border-gray-200 bg-white"
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </form>
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
