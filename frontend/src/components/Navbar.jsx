import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
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

  return (
    <div className="relative w-full">
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-50 flex items-center justify-between px-8 py-4 bg-[#0a0f1d]/90 backdrop-blur-xl border-b border-[#00fffc] shadow-lg"
      >
        {/* Logo */}
        <Link to="/" className="text-3xl font-extrabold text-white tracking-wide">
          <motion.span
            whileHover={{ scale: 1.1, textShadow: "0px 0px 10px #00fffc" }}
            transition={{ duration: 0.3 }}
            className="hover:text-[#00e6e6] cursor-pointer"
          >
            University Connect
          </motion.span>
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
                  whileHover={{ scale: 1.1, backgroundColor: "#00fffc", color: "#0a0f1d" }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#131a2b]/80 border border-[#00fffc] text-white font-bold rounded-md shadow-lg hover:shadow-[#00fffc] transition-all duration-300"
                >
                  <FaUserCircle size={20} className="text-[#00fffc]" /> Profile
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-[#131a2b]/90 border border-[#00fffc] rounded-md shadow-lg"
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
          {menuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 left-0 w-full bg-[#0a0f1d] border-t border-[#00fffc] shadow-lg"
          >
            <div className="flex flex-col items-center gap-4 py-6">
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
            padding: 8px 14px;
            border-radius: 8px;
            transition: all 0.3s ease-in-out;
            text-transform: uppercase;
          }
          .nav-link:hover {
            background-color: #00fffc;
            color: #0a0f1d;
            transform: scale(1.1);
            box-shadow: 0px 0px 15px #00fffc;
          }

          .dropdown-item {
            display: block;
            padding: 12px 18px;
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
Navbar.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
};

export default Navbar;
