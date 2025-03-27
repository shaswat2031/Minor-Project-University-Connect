import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaBars, FaTimes, FaGraduationCap } from "react-icons/fa";
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
              <Link to="/students" className="nav-link group">
                <span className="nav-text">Student Connect</span>
                <span className="nav-underline"></span>
              </Link>
              <Link to="/certifications" className="nav-link group">
                <span className="nav-text">Certifications</span>
                <span className="nav-underline"></span>
              </Link>
              <Link to="/talent-marketplace" className="nav-link group">
                <span className="nav-text">Talent Marketplace</span>
                <span className="nav-underline"></span>
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
                  transition={{ duration: 0.2 }}
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
                        className="dropdown-item group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="relative z-10">My Profile</span>
                        <span className="dropdown-item-bg"></span>
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        className="dropdown-item group w-full text-left"
                      >
                        <span className="relative z-10 text-red-400 group-hover:text-white">Logout</span>
                        <span className="dropdown-item-bg bg-red-500/10 group-hover:bg-red-500/30"></span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link group">
                <span className="nav-text">Login</span>
                <span className="nav-underline"></span>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: "0px 0px 12px rgba(0, 255, 252, 0.6)"
                  }}
                  whileTap={{ scale: 0.98 }}
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
                  <Link to="/profile" className="mobile-nav-link">
                    <FaUserCircle size={18} className="text-[#00fffc]" />
                    <span>My Profile</span>
                  </Link>
                  <Link to="/students" className="mobile-nav-link">Student Connect</Link>
                  <Link to="/certifications" className="mobile-nav-link">Certifications</Link>
                  <Link to="/talent-marketplace" className="mobile-nav-link">Talent Marketplace</Link>
                  <motion.button 
                    onClick={handleLogout} 
                    className="mt-4 px-8 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-full border border-red-500/40 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-nav-link">Login</Link>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-2.5 bg-gradient-to-r from-[#00fffc] to-[#00bfff] text-[#0a0f1d] font-bold rounded-full shadow-md"
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

      {/* Styles */}
      <style>
        {`
          .nav-link {
            position: relative;
            color: white;
            font-weight: bold;
            padding: 8px 4px;
            overflow: hidden;
          }
          
          .nav-text {
            position: relative;
            z-index: 10;
            transition: all 0.3s ease;
          }
          
          .nav-underline {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 2px;
            width: 0;
            background: linear-gradient(to right, #00fffc, #00bfff);
            transition: width 0.3s ease;
          }
          
          .nav-link:hover .nav-text {
            color: #00fffc;
          }
          
          .nav-link:hover .nav-underline,
          .group:hover .nav-underline {
            width: 100%;
          }

          .dropdown-item {
            position: relative;
            display: block;
            padding: 14px 18px;
            font-weight: 600;
            color: white;
            overflow: hidden;
          }
          
          .dropdown-item-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 255, 252, 0.1);
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          
          .dropdown-item:hover .dropdown-item-bg,
          .group:hover .dropdown-item-bg {
            transform: translateX(0);
          }
          
          .mobile-nav-link {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            text-align: center;
            color: white;
            font-weight: bold;
            padding: 12px 20px;
            border-radius: 10px;
            background-color: rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
          }
          
          .mobile-nav-link:hover {
            background-color: rgba(0, 255, 252, 0.1);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 255, 252, 0.2);
          }
        `}
      </style>
    </div>
  );
};

Navbar.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
};

export default Navbar;
