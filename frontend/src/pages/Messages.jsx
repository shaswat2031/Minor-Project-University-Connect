import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import chatService from "../services/chatService";

const Messages = () => {
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
      alert(error.error || "Failed to send message. Please try again.");
    });

    chatService.onTyping((data) => {
      if (!data || !data.senderId || !selectedUser) return;

      if (data.senderId === selectedUser.id) {
        setTypingUser(data.isTyping ? data.senderId : null);
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
      await chatService.sendMessage(selectedUser.id, messageContent);
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageContent); // Restore message on error
      alert("Failed to send message. Please try again.");
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
        {/* Conversations Sidebar */}
        <div className="w-1/3 bg-gray-800 border-r border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-blue-400">Messages</h2>
            <p className="text-sm text-gray-400">
              {socketConnected ? "Connected" : "Connecting..."}
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
                    className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition ${
                      selectedUser?.id === conversation.otherUser.id
                        ? "bg-gray-700"
                        : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                        {conversation.otherUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {conversation.otherUser.name}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">
                          {conversation.lastMessage?.content ||
                            "No messages yet"}
                        </p>
                      </div>
                      {isUserOnline(conversation.otherUser.id) && (
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-400">
                    {isUserOnline(selectedUser.id) ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  if (!message || !message._id || !message.sender) return null;

                  return (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender._id === currentUserId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender._id === currentUserId
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-white"
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {typingUser && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-gray-800 border-t border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    disabled={!socketConnected}
                    className="flex-1 p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !socketConnected}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  No conversation selected
                </h3>
                <p className="text-gray-400">
                  Choose a conversation to start messaging
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
