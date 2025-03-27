import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import React from "react";

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="relative w-full">
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-50 flex items-center justify-between px-8 py-5 bg-gradient-to-r from-[#0a0f1d] to-[#131a2b] backdrop-blur-xl border-b border-[#00fffc]/60 shadow-lg"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-3xl font-extrabold text-white tracking-wide">
          <motion.img 
            src="https://img.icons8.com/fluency/48/000000/graduation-cap.png"
            alt="University Connect Logo"
            className="h-10 w-10"
            whileHover={{ 
              scale: 1.1,
              filter: "drop-shadow(0px 0px 8px rgba(0, 255, 252, 0.8))",
              transition: { duration: 0.3, type: "spring", stiffness: 300 }
            }}
          />
          <motion.span
            whileHover={{ 
              scale: 1.05, 
              textShadow: "0px 0px 10px #00fffc",
              transition: { duration: 0.3, type: "spring", stiffness: 300 }
            }}
            className="bg-gradient-to-r from-[#00fffc] to-[#00bfff] text-transparent bg-clip-text cursor-pointer"
          >
            University Connect
          </motion.span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          {isAuthenticated ? (
            <>
              <Link to="/students" className="relative font-bold text-white py-2 px-1 overflow-hidden group">
                <span className="relative z-10 group-hover:text-[#00fffc] transition-colors duration-300">Student Connect</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#00fffc] to-[#00bfff] group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/certifications" className="relative font-bold text-white py-2 px-1 overflow-hidden group">
                <span className="relative z-10 group-hover:text-[#00fffc] transition-colors duration-300">Certifications</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#00fffc] to-[#00bfff] group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/talent-marketplace" className="relative font-bold text-white py-2 px-1 overflow-hidden group">
                <span className="relative z-10 group-hover:text-[#00fffc] transition-colors duration-300">Talent Marketplace</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#00fffc] to-[#00bfff] group-hover:w-full transition-all duration-300"></span>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <motion.button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: "0px 0px 12px rgba(0, 255, 252, 0.6)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#131a2b] to-[#1e293b] border border-[#00fffc]/70 text-white font-bold rounded-full shadow-md hover:shadow-[#00fffc]/40 transition-all duration-300"
                >
                  <FaUserCircle size={22} className="text-[#00fffc]" /> 
                  <span>Profile</span>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-52 bg-gradient-to-b from-[#131a2b] to-[#0a0f1d] border border-[#00fffc]/60 rounded-xl overflow-hidden shadow-lg shadow-[#00fffc]/20"
                    >
                      <Link
                        to="/profile"
                        className="relative block py-3.5 px-4.5 font-semibold text-white overflow-hidden group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="relative z-10">My Profile</span>
                        <motion.span 
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
                          className="absolute inset-0 bg-[#00fffc]/10"
                        />
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        className="relative block w-full text-left py-3.5 px-4.5 font-semibold text-red-400 group-hover:text-white overflow-hidden group"
                      >
                        <span className="relative z-10 group-hover:text-white transition-colors duration-300">Logout</span>
                        <motion.span 
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
                          className="absolute inset-0 bg-red-500/30"
                        />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="relative font-bold text-white py-2 px-1 overflow-hidden group">
                <span className="relative z-10 group-hover:text-[#00fffc] transition-colors duration-300">Login</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#00fffc] to-[#00bfff] group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: "0px 0px 15px rgba(0, 255, 252, 0.7)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#00fffc] to-[#00bfff] text-[#0a0f1d] font-bold rounded-full shadow-md hover:shadow-[#00fffc]/60 transition-all duration-300"
                >
                  Register
                </motion.button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button 
          className="md:hidden text-white p-2 rounded-full border border-[#00fffc]/60"
          onClick={() => setMenuOpen(!menuOpen)}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(0, 255, 252, 0.2)" }}
          whileTap={{ scale: 0.95 }}
        >
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </motion.button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-[72px] left-0 w-full bg-gradient-to-b from-[#0a0f1d] to-[#131a2b] border-t border-[#00fffc]/60 shadow-lg z-40 overflow-hidden"
          >
            <div className="flex flex-col items-center gap-5 py-8 px-6">
              {isAuthenticated ? (
                <>
                  <motion.div className="w-full" whileHover={{ y: -2 }}>
                    <Link to="/profile" className="flex items-center gap-2 w-full text-center text-white font-bold py-3 px-5 rounded-xl bg-white/5 hover:bg-[#00fffc]/10 hover:shadow-md hover:shadow-[#00fffc]/20 transition-all duration-300">
                      <FaUserCircle size={18} className="text-[#00fffc]" />
                      <span>My Profile</span>
                    </Link>
                  </motion.div>
                  
                  <motion.div className="w-full" whileHover={{ y: -2 }}>
                    <Link to="/students" className="flex w-full justify-center text-white font-bold py-3 px-5 rounded-xl bg-white/5 hover:bg-[#00fffc]/10 hover:shadow-md hover:shadow-[#00fffc]/20 transition-all duration-300">
                      Student Connect
                    </Link>
                  </motion.div>
                  
                  <motion.div className="w-full" whileHover={{ y: -2 }}>
                    <Link to="/certifications" className="flex w-full justify-center text-white font-bold py-3 px-5 rounded-xl bg-white/5 hover:bg-[#00fffc]/10 hover:shadow-md hover:shadow-[#00fffc]/20 transition-all duration-300">
                      Certifications
                    </Link>
                  </motion.div>
                  
                  <motion.div className="w-full" whileHover={{ y: -2 }}>
                    <Link to="/talent-marketplace" className="flex w-full justify-center text-white font-bold py-3 px-5 rounded-xl bg-white/5 hover:bg-[#00fffc]/10 hover:shadow-md hover:shadow-[#00fffc]/20 transition-all duration-300">
                      Talent Marketplace
                    </Link>
                  </motion.div>
                  
                  <motion.button 
                    onClick={handleLogout} 
                    className="mt-4 px-8 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-full border border-red-500/40 transition-all"
                    whileHover={{ scale: 1.05, y: -2, boxShadow: "0px 4px 12px rgba(239, 68, 68, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.div className="w-full" whileHover={{ y: -2 }}>
                    <Link to="/login" className="flex w-full justify-center text-white font-bold py-3 px-5 rounded-xl bg-white/5 hover:bg-[#00fffc]/10 hover:shadow-md hover:shadow-[#00fffc]/20 transition-all duration-300">
                      Login
                    </Link>
                  </motion.div>
                  
                  <Link to="/register" className="w-full">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(0, 255, 252, 0.5)" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-8 py-3 bg-gradient-to-r from-[#00fffc] to-[#00bfff] text-[#0a0f1d] font-bold rounded-full shadow-md"
                    >
                      Register
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

Navbar.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
};

export default Navbar;