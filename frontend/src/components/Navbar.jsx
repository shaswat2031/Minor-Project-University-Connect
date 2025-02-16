import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const words = "University Connect".split(" ");

  return (
    <div className="relative w-full">
      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 bg-[#0a0f1d]/90 border-b border-[#00fffc] shadow-lg backdrop-blur-lg">
        {/* Animated Logo */}
        <Link to="/" className="text-2xl font-bold text-white flex space-x-2">
          {words.map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="hover:text-[#00e6e6] transition-transform transform hover:scale-110"
            >
              {word}
            </motion.span>
          ))}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/students" className="nav-link">Student Connect</Link>
              <Link to="/certifications" className="nav-link">Certifications</Link>
              <Link to="/talent-marketplace" className="nav-link">Talent Marketplace</Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <motion.button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#131a2b]/80 border border-[#00fffc] text-white font-bold rounded-md shadow-lg hover:bg-[#00fffc] hover:text-[#0a0f1d] transition-all duration-300"
                >
                  <FaUserCircle size={20} className="text-[#00fffc]" /> Profile
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-44 bg-[#131a2b]/90 border border-[#00fffc] rounded-md shadow-lg"
                    >
                      <Link
                        to="/profile"
                        className="dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Profile
                      </Link>
                      <button onClick={handleLogout} className="dropdown-item text-red-400 hover:bg-red-500/20">
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-16 left-0 w-full bg-[#0a0f1d] border-t border-[#00fffc] shadow-lg"
          >
            <div className="flex flex-col items-center gap-4 py-4">
              {isAuthenticated ? (
                <>
                  <Link to="/students" className="nav-link">Student Connect</Link>
                  <Link to="/certifications" className="nav-link">Certifications</Link>
                  <Link to="/talent-marketplace" className="nav-link">Talent Marketplace</Link>
                  <button onClick={handleLogout} className="text-red-400 hover:text-red-500 transition font-bold">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">Login</Link>
                  <Link to="/register" className="nav-link">Register</Link>
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
            color: white;
            font-weight: bold;
            padding: 8px 12px;
            border-radius: 8px;
            transition: all 0.3s ease-in-out;
          }
          .nav-link:hover {
            background-color: #00fffc;
            color: #0a0f1d;
            transform: scale(1.1);
            box-shadow: 0px 0px 15px #00fffc;
          }

          .dropdown-item {
            display: block;
            padding: 10px 16px;
            font-weight: bold;
            color: white;
            transition: background 0.3s;
          }
          .dropdown-item:hover {
            background-color: rgba(0, 255, 252, 0.2);
          }
        `}
      </style>
    </div>
  );
};

export default Navbar;
