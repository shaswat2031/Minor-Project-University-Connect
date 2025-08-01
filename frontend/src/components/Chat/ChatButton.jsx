import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaComments, FaTimes } from "react-icons/fa";
import ChatWindow from "./ChatWindow";
import chatService from "../../services/chatService";

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch unread count if user is authenticated
    const token = localStorage.getItem("token");
    if (token) {
      fetchUnreadCount();
    }
  }, []);

  const fetchUnreadCount = async () => {
    try {
      setIsLoading(true);
      const count = await chatService.getUnreadCount();
      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);

    // Reset unread count when opening chat
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  // Don't render if no token
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          onClick={toggleChat}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full shadow-lg relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open chat"
        >
          {isOpen ? (
            <FaTimes className="text-xl" />
          ) : (
            <FaComments className="text-xl" />
          )}

          {/* Unread count badge */}
          {unreadCount > 0 && !isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.div>
          )}
        </motion.button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default ChatButton;
