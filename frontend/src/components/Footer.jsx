import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-400 py-10 border-t border-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-6xl mx-auto px-4 flex flex-col items-center text-center space-y-3"
      >
        {/* Branding & Tagline with Unique Font Styling */}
        <motion.h2
          whileHover={{ scale: 1.1, color: "#60A5FA" }}
          transition={{ duration: 0.3 }}
          className="text-white text-4xl font-extrabold tracking-wide font-serif cursor-pointer"
        >
          University Connect
        </motion.h2>
        <motion.p
          whileHover={{ letterSpacing: "2px", color: "#93C5FD" }}
          transition={{ duration: 0.3 }}
          className="text-lg text-gray-400 font-light italic"
        >
          Bridging Students & Opportunities
        </motion.p>

        {/* Copyright with Subtle Animation */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-sm text-gray-500 mt-4 font-semibold tracking-widest uppercase"
        >
          © {new Date().getFullYear()} University Connect. All rights reserved.
        </motion.p>
      </motion.div>
    </footer>
  );
};

export default Footer;
