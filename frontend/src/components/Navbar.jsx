import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserCircle,
  FaBars,
  FaTimes,
  FaUserShield,
  FaLock,
} from "react-icons/fa";

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({
    username: "",
    password: "",
  });
  const [adminError, setAdminError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Check admin and user login status on component mount
  useEffect(() => {
    const adminStatus = localStorage.getItem("adminLoggedIn");
    const token = localStorage.getItem("token");

    if (adminStatus === "true") {
      setIsAdminLoggedIn(true);
    }

    if (token && !isAuthenticated) {
      setIsAuthenticated(true);
    }
  }, [isAuthenticated, setIsAuthenticated]);

  // Handle admin login
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminError("");

    if (
      adminCredentials.username === "shaswat" &&
      adminCredentials.password === "shaswat@2004"
    ) {
      setIsAdminLoggedIn(true);
      localStorage.setItem("adminLoggedIn", "true");
      setShowAdminModal(false);
      setAdminCredentials({ username: "", password: "" });
      navigate("/admin");
    } else {
      setAdminError("Invalid credentials");
    }
  };

  // Handle admin logout
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setDropdownOpen(false);
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <>
      <div className="relative w-full">
        {/* Navbar */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-50 flex items-center justify-between px-8 py-5 bg-gradient-to-r from-[#0a0f1d] to-[#131a2b] backdrop-blur-xl border-b border-[#00fffc]/60 shadow-lg"
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-3xl font-extrabold text-white tracking-wide"
          >
            <motion.img
              src="https://img.icons8.com/fluency/48/000000/graduation-cap.png"
              alt="University Connect Logo"
              className="h-10 w-10"
              whileHover={{
                scale: 1.1,
                filter: "drop-shadow(0px 0px 8px rgba(0, 255, 252, 0.8))",
                transition: { duration: 0.3, type: "spring", stiffness: 300 },
              }}
            />
            <motion.span
              whileHover={{
                scale: 1.05,
                textShadow: "0px 0px 10px #00fffc",
                transition: { duration: 0.3, type: "spring", stiffness: 300 },
              }}
              className="bg-gradient-to-r from-[#00fffc] to-[#00bfff] text-transparent bg-clip-text cursor-pointer"
            >
              University Connect
            </motion.span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 items-center">
            {/* Navigation Links for Authenticated Users */}
            {isAuthenticated && (
              <div className="flex gap-6 items-center">
                <Link
                  to="/student-connect"
                  className="text-white hover:text-[#00fffc] transition-colors duration-300 font-semibold"
                >
                  Student Connect
                </Link>
                <Link
                  to="/certifications"
                  className="text-white hover:text-[#00fffc] transition-colors duration-300 font-semibold"
                >
                  Certifications
                </Link>
                <Link
                  to="/talent-marketplace"
                  className="text-white hover:text-[#00fffc] transition-colors duration-300 font-semibold"
                >
                  Talent Marketplace
                </Link>
              </div>
            )}

            {/* Admin Button */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <FaUserShield />
                  Admin Panel
                </Link>
                <button
                  onClick={handleAdminLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Logout Admin
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAdminModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <FaUserShield />
                Admin
              </button>
            )}

            {/* Profile Dropdown - only show when authenticated */}
            {isAuthenticated && (
              <div className="relative">
                <motion.button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0px 0px 12px rgba(0, 255, 252, 0.6)",
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
                        to="/my-profile"
                        className="relative block py-3.5 px-4.5 font-semibold text-white overflow-hidden group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="relative z-10">My Profile</span>
                        <motion.span
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{
                            type: "tween",
                            ease: "easeOut",
                            duration: 0.3,
                          }}
                          className="absolute inset-0 bg-[#00fffc]/10"
                        />
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="relative block w-full text-left py-3.5 px-4.5 font-semibold text-red-400 group-hover:text-white overflow-hidden group"
                      >
                        <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                          Logout
                        </span>
                        <motion.span
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{
                            type: "tween",
                            ease: "easeOut",
                            duration: 0.3,
                          }}
                          className="absolute inset-0 bg-red-500/30"
                        />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Auth Buttons - only show when not authenticated */}
            {!isAuthenticated && (
              <div className="flex gap-4 items-center">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-white p-2 rounded-full border border-[#00fffc]/60"
            onClick={() => setMenuOpen(!menuOpen)}
            whileHover={{
              scale: 1.1,
              backgroundColor: "rgba(0, 255, 252, 0.2)",
            }}
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
                {/* Mobile Navigation Links for Authenticated Users */}
                {isAuthenticated && (
                  <div className="flex flex-col gap-4 w-full">
                    <Link
                      to="/student-connect"
                      className="text-white hover:text-[#00fffc] transition-colors duration-300 font-semibold text-center py-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      Student Connect
                    </Link>
                    <Link
                      to="/certifications"
                      className="text-white hover:text-[#00fffc] transition-colors duration-300 font-semibold text-center py-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      Certifications
                    </Link>
                    <Link
                      to="/talent-marketplace"
                      className="text-white hover:text-[#00fffc] transition-colors duration-300 font-semibold text-center py-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      Talent Marketplace
                    </Link>
                    <Link
                      to="/my-profile"
                      className="text-white hover:text-[#00fffc] transition-colors duration-300 font-semibold text-center py-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}

                {/* Mobile Auth Buttons - only show when not authenticated */}
                {!isAuthenticated && (
                  <div className="flex flex-col gap-4 w-full">
                    <Link
                      to="/login"
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center"
                      onClick={() => setMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}

                {/* Mobile Admin Section */}
                {isAdminLoggedIn ? (
                  <div className="space-y-2 w-full">
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      <FaUserShield />
                      Admin Panel
                    </Link>
                    <button
                      onClick={() => {
                        handleAdminLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Logout Admin
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowAdminModal(true);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    <FaUserShield />
                    Admin
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaLock className="text-purple-500 text-2xl" />
              <h2 className="text-2xl font-bold text-white">Admin Login</h2>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={adminCredentials.username}
                  onChange={(e) =>
                    setAdminCredentials({
                      ...adminCredentials,
                      username: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter admin username"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={adminCredentials.password}
                  onChange={(e) =>
                    setAdminCredentials({
                      ...adminCredentials,
                      password: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              {adminError && (
                <div className="text-red-400 text-sm">{adminError}</div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setAdminCredentials({ username: "", password: "" });
                    setAdminError("");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Navbar;
