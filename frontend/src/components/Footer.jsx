import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  FaEnvelope, 
  FaArrowUp
} from "react-icons/fa";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="w-full bg-gradient-to-b from-gray-900 to-black text-gray-400 py-10 border-t border-gray-800 relative font-[Poppins]">
      {/* Back to top button */}
      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
        <motion.button
          onClick={scrollToTop}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-full shadow-lg"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="text-lg" />
        </motion.button>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Brand section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:max-w-md"
          >
            <Link to="/" className="inline-block">
              <motion.h2
                whileHover={{ scale: 1.05, color: "#60A5FA" }}
                transition={{ duration: 0.3 }}
                className="text-white text-3xl font-extrabold tracking-wide cursor-pointer bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
              >
                University Connect
              </motion.h2>
            </Link>
            <p className="text-gray-400 mt-3 mb-4 text-sm md:text-base">
              Connecting students with opportunities, mentors, and resources to help them thrive in their academic journey.
            </p>
         
          </motion.div>

          {/* Contact Info Only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="space-y-3">
              <h3 className="text-white text-lg font-bold">Contact</h3>
              <div className="h-1 w-10 bg-blue-500 rounded-full mb-2"></div>
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-blue-400 flex-shrink-0" />
                <a href="mailto:info@universityconnect.edu" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                2203051050530@paruluniversity.ac.in
                </a>
              </div>
              
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent my-6"></div>

        {/* Bottom footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-gray-500 font-medium mb-4 md:mb-0"
          >
            © {new Date().getFullYear()} University Connect. All rights reserved.
          </motion.p>
          <div className="flex space-x-5 text-gray-500">
            <Link to="/privacy" className="hover:text-blue-400 transition-colors text-sm">Privacy</Link>
            
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;