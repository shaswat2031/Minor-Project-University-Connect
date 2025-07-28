import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import chatService from "../services/chatService";
import { io } from "socket.io-client";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

const StudentConnect = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [socket, setSocket] = useState(null);

  // GSAP refs
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const searchRef = useRef(null);
  const onlineCountRef = useRef(null);
  const profileWarningRef = useRef(null);
  const studentCardsRef = useRef([]);
  const particlesRef = useRef([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Initialize GSAP animations
  useEffect(() => {
    initializeAnimations();
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Animate cards when filtered students change
  useEffect(() => {
    if (filteredStudents.length > 0) {
      animateStudentCards();
    }
  }, [filteredStudents]);

  const initializeAnimations = () => {
    // Check if refs are available before animating
    const elementsToAnimate = [
      headerRef.current,
      searchRef.current,
      onlineCountRef.current,
    ].filter(Boolean);

    if (elementsToAnimate.length === 0) {
      // If elements aren't ready, try again after a short delay
      setTimeout(initializeAnimations, 100);
      return;
    }

    // Initial page load animations
    const tl = gsap.timeline();

    // Set initial states only for elements that exist
    gsap.set(elementsToAnimate, {
      opacity: 0,
      y: -50,
    });

    // Animate header elements only if they exist
    if (headerRef.current) {
      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
      });
    }

    if (onlineCountRef.current) {
      tl.to(
        onlineCountRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=0.5"
      );
    }

    if (searchRef.current) {
      tl.to(
        searchRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.3"
      );
    }

    // Animate background particles
    animateParticles();

    // Search bar focus animations
    setupSearchAnimations();
  };

  const animateParticles = () => {
    particlesRef.current.forEach((particle, index) => {
      if (particle) {
        gsap.to(particle, {
          y: `random(-20, 20)`,
          x: `random(-20, 20)`,
          rotation: `random(-180, 180)`,
          duration: `random(3, 6)`,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.2,
        });
      }
    });
  };

  const setupSearchAnimations = () => {
    const searchInput = searchRef.current?.querySelector("input");
    const searchGlow = searchRef.current?.querySelector(".search-glow");

    if (searchInput && searchRef.current) {
      searchInput.addEventListener("focus", () => {
        gsap.to(searchRef.current, {
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out",
        });
        if (searchGlow) {
          gsap.to(searchGlow, {
            opacity: 1,
            duration: 0.3,
          });
        }
      });

      searchInput.addEventListener("blur", () => {
        gsap.to(searchRef.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
        if (searchGlow) {
          gsap.to(searchGlow, {
            opacity: 0,
            duration: 0.3,
          });
        }
      });
    }
  };

  const animateStudentCards = () => {
    const validCards = studentCardsRef.current.filter(Boolean);
    if (validCards.length > 0) {
      gsap.fromTo(
        validCards,
        {
          opacity: 0,
          y: 50,
          scale: 0.8,
          rotationY: -15,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationY: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
    }
  };

  const setupCardHoverAnimations = (card) => {
    if (!card) return;

    const cardContent = card.querySelector(".card-content");
    const cardButtons = card.querySelector(".card-buttons");
    const cardGlow = card.querySelector(".card-glow");

    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -15,
        scale: 1.03,
        rotationY: 5,
        duration: 0.4,
        ease: "power2.out",
      });

      if (cardGlow) {
        gsap.to(cardGlow, {
          opacity: 1,
          scale: 1.1,
          duration: 0.4,
        });
      }

      if (cardContent) {
        gsap.to(cardContent, {
          y: -5,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (cardButtons && cardButtons.children) {
        gsap.to(cardButtons.children, {
          y: -3,
          stagger: 0.1,
          duration: 0.3,
          ease: "back.out(1.7)",
        });
      }
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        rotationY: 0,
        duration: 0.4,
        ease: "power2.out",
      });

      if (cardGlow) {
        gsap.to(cardGlow, {
          opacity: 0,
          scale: 1,
          duration: 0.4,
        });
      }

      if (cardContent) {
        gsap.to(cardContent, {
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (cardButtons && cardButtons.children) {
        gsap.to(cardButtons.children, {
          y: 0,
          stagger: 0.05,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    });
  };

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    // Clean up any existing socket connection first
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    const socketInstance = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    // Get current user info from localStorage or profile
    const userInfo = {
      name: localStorage.getItem("userName") || "User",
    };

    socketInstance.on("connect", () => {
      console.log("Socket connected successfully");
      // Emit user online status after connection
      socketInstance.emit("user-online", userInfo);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Listen for online users list
    socketInstance.on("online-users-list", (users) => {
      const usersMap = new Map();
      if (Array.isArray(users)) {
        users.forEach((user) => {
          usersMap.set(user.id, user);
        });
      }
      setOnlineUsers(usersMap);
    });

    // Listen for user status changes
    socketInstance.on("user-status-change", (data) => {
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

    return () => {
      socketInstance.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!token) {
        console.warn("No token available for fetching students");
        setLoading(false);
        return;
      }

      try {
        console.log(
          "Making request to:",
          `${import.meta.env.VITE_API_URL}/api/students`
        );
        console.log("Token present:", !!token);

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/students`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000, // 10 second timeout
          }
        );

        console.log("Raw response:", response.data);
        console.log("Response status:", response.status);

        // Handle different response structures
        let studentsData = [];
        let loggedInUserId = null;

        // Check if response.data is directly an array
        if (Array.isArray(response.data)) {
          studentsData = response.data;
        }
        // Check if response.data has a students property
        else if (response.data && response.data.students) {
          studentsData = response.data.students;
          loggedInUserId = response.data.loggedInUserId;
        }
        // Check if response.data has a data property
        else if (response.data && response.data.data) {
          studentsData = Array.isArray(response.data.data)
            ? response.data.data
            : [];
        }
        // Fallback: empty array
        else {
          console.warn("Unexpected response format:", response.data);
          studentsData = [];
        }

        // Validate and filter students
        const validStudents = studentsData.filter((student) => {
          // Basic validation - student must exist and have an ID
          if (!student || !student._id) {
            console.warn("Invalid student - missing ID:", student);
            return false;
          }

          // Student must have a name
          if (!student.name || typeof student.name !== "string") {
            console.warn("Invalid student - missing or invalid name:", student);
            return false;
          }

          return true;
        });

        console.log("Logged in user ID:", loggedInUserId);
        console.log("Valid students count:", validStudents.length);

        setStudents(validStudents);
        setFilteredStudents(validStudents);
      } catch (error) {
        console.error("Error fetching students:", error);

        // More detailed error logging
        if (error.response) {
          console.error("Server error response:", error.response.data);
          console.error("Status code:", error.response.status);
          console.error("Response headers:", error.response.headers);

          if (error.response.status === 500) {
            console.error(
              "Server internal error - the backend may have an issue"
            );
            console.error("Full error details:", error.response.data);
          } else if (error.response.status === 401) {
            console.error("Authentication error - redirecting to login");
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("userName");
            navigate("/login");
            return;
          }
        } else if (error.request) {
          console.error("Network error - no response received");
          console.error("Request details:", error.request);
        } else if (error.code === "ECONNABORTED") {
          console.error("Request timeout - server took too long to respond");
        } else {
          console.error("Request setup error:", error.message);
        }

        // Set empty arrays on error
        setStudents([]);
        setFilteredStudents([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          }
        );
        // Use the isComplete flag instead of just checking if profile exists
        setProfileExists(response.data?.isComplete || false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        // If 404 or any error, profile is not complete
        setProfileExists(false);
      }
    };

    fetchProfile();
    fetchStudents();
  }, [token, navigate]);

  // Handle search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.skills &&
            (typeof student.skills === "string"
              ? student.skills.toLowerCase().includes(searchTerm.toLowerCase())
              : student.skills.some(
                  (skill) =>
                    typeof skill === "string" &&
                    skill.toLowerCase().includes(searchTerm.toLowerCase())
                )))
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const startChat = async (student) => {
    try {
      // Enhanced validation
      if (!student) {
        console.error("No student provided for chat");
        alert("Unable to start chat. Please try again.");
        return;
      }

      if (!student.user) {
        console.error("Student missing user ID:", student);
        alert("Unable to start chat. Student information is incomplete.");
        return;
      }

      if (!student.name) {
        console.error("Student missing name:", student);
        alert("Unable to start chat. Student name is missing.");
        return;
      }

      // Use the actual user ID from the user field
      const userId = student.user;

      // Navigate to messages page with the selected user
      navigate("/messages", {
        state: {
          selectedUser: {
            id: userId,
            name: student.name,
            isOnline: onlineUsers.has(userId),
          },
        },
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chat. Please try again.");
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1d] via-[#141e30] to-[#1a1a2e] flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-64 h-64 rounded-full blur-3xl opacity-20 ${
                i % 2 === 0 ? "bg-blue-500" : "bg-purple-500"
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>

        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-cyan-400 border-r-purple-500"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-cyan-400 opacity-20"></div>
          </div>
          <div className="mt-6 text-2xl font-light text-cyan-400 animate-pulse">
            Connecting to the universe...
          </div>
          <div className="mt-2 text-sm text-gray-400">
            Loading student profiles
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-[#0a0f1d] via-[#141e30] to-[#1a1a2e] relative overflow-hidden"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (particlesRef.current[i] = el)}
            className={`absolute w-2 h-2 rounded-full ${
              i % 3 === 0
                ? "bg-cyan-400"
                : i % 3 === 1
                ? "bg-purple-400"
                : "bg-pink-400"
            } opacity-30`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div ref={headerRef} className="text-center mb-12">
            <h2 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Student Connect
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-300 text-lg">
              Connect with brilliant minds across the universe
            </p>
          </div>

          {/* Online Users Count */}
          <div ref={onlineCountRef} className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative px-6 py-3 bg-gray-900/80 backdrop-blur-sm rounded-full border border-green-400/50">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-green-300 font-semibold text-lg">
                    {onlineUsers.size} minds online
                  </span>
                  <div className="ml-3 w-2 h-2 bg-green-300 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Warning */}
          {!profileExists && (
            <div ref={profileWarningRef} className="mb-12 flex justify-center">
              <div className="relative group max-w-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative p-8 bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-blue-400/30">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Complete Your Journey
                    </h3>
                    <p className="text-gray-300 mb-6 text-lg">
                      Unlock the full potential of Student Connect by completing
                      your profile
                    </p>
                    <Link
                      to="/my-profile"
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Complete Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div ref={searchRef} className="mb-12 flex justify-center">
            <div className="relative max-w-2xl w-full group">
              <div className="search-glow absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-2xl blur opacity-0 transition-opacity duration-300"></div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for brilliant minds, skills, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-6 pl-16 bg-gray-900/80 backdrop-blur-sm rounded-2xl text-white text-lg border border-gray-700/50 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 placeholder-gray-400"
                />
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-6 h-6 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Students Grid */}
          {filteredStudents.length === 0 ? (
            <div className="text-center p-12">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-300 mb-3">
                  No Students Found
                </h3>
                <p className="text-gray-500">
                  {loading
                    ? "Scanning the universe..."
                    : "Try adjusting your search criteria"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStudents.map((student, index) => {
                // Enhanced safety checks
                if (!student || !student.user) {
                  return null;
                }

                const studentName = student.name || "Unknown User";
                const studentBio = student.bio || "No bio provided";
                const userId = student.user;
                const isOnline = userId ? isUserOnline(userId) : false;

                return (
                  <div
                    key={student._id}
                    ref={(el) => {
                      studentCardsRef.current[index] = el;
                      if (el) setupCardHoverAnimations(el);
                    }}
                    className="relative group cursor-pointer"
                  >
                    {/* Card Glow Effect */}
                    <div
                      className={`card-glow absolute inset-0 bg-gradient-to-r ${
                        isOnline
                          ? "from-green-400 to-emerald-400"
                          : "from-cyan-400 to-purple-400"
                      } rounded-3xl blur opacity-0 transition-opacity duration-300`}
                    ></div>

                    {/* Main Card */}
                    <div
                      className={`relative p-8 bg-gray-900/80 backdrop-blur-sm rounded-3xl border ${
                        isOnline ? "border-green-400/30" : "border-gray-700/50"
                      } transition-all duration-300`}
                    >
                      {/* Online Status */}
                      <div className="absolute top-6 right-6 flex items-center">
                        <div
                          className={`w-4 h-4 rounded-full mr-2 ${
                            isOnline
                              ? "bg-green-400 animate-pulse"
                              : "bg-gray-500"
                          }`}
                        ></div>
                        <span
                          className={`text-sm font-semibold ${
                            isOnline ? "text-green-400" : "text-gray-400"
                          }`}
                        >
                          {isOnline ? "Online" : "Offline"}
                        </span>
                      </div>

                      {/* Profile Badge */}
                      {!student.hasProfile && (
                        <div className="absolute top-6 left-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs px-3 py-1 rounded-full font-bold">
                          Basic Profile
                        </div>
                      )}

                      <div className="card-content">
                        {/* Avatar */}
                        <div className="flex justify-center mb-6">
                          <div className="relative">
                            <div
                              className={`w-20 h-20 rounded-full bg-gradient-to-r ${
                                isOnline
                                  ? "from-green-400 to-emerald-400"
                                  : "from-cyan-400 to-purple-400"
                              } flex items-center justify-center`}
                            >
                              <span className="text-2xl font-bold text-white">
                                {studentName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-gray-900 animate-pulse"></div>
                            )}
                          </div>
                        </div>

                        {/* Name */}
                        <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                          {studentName}
                        </h3>

                        {/* Bio */}
                        <p className="text-gray-300 text-center mb-6 italic leading-relaxed">
                          &ldquo;{studentBio}&rdquo;
                        </p>

                        {/* Skills */}
                        {student.skills && (
                          <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {(typeof student.skills === "string"
                              ? student.skills.split(",")
                              : Array.isArray(student.skills)
                              ? student.skills
                              : []
                            ).map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-3 py-1 bg-gradient-to-r from-gray-800 to-gray-700 text-cyan-300 text-sm rounded-full border border-cyan-400/30 backdrop-blur-sm"
                              >
                                {typeof skill === "string"
                                  ? skill.trim()
                                  : skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="card-buttons space-y-4">
                          <Link
                            to={`/profile/${student._id}`}
                            className="block w-full px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 border border-cyan-400/50 text-white rounded-xl text-center font-semibold hover:border-cyan-400 transition-all duration-300 group relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                            <div className="relative flex items-center justify-center">
                              <svg
                                className="w-5 h-5 mr-2 text-cyan-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              View Profile
                            </div>
                          </Link>

                          <button
                            onClick={() => startChat(student)}
                            className={`block w-full px-6 py-3 bg-gradient-to-r ${
                              isOnline
                                ? "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                : "from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600"
                            } text-white rounded-xl font-semibold transition-all duration-300 group relative overflow-hidden`}
                          >
                            <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                            <div className="relative flex items-center justify-center">
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              {isOnline ? "Chat Now" : "Send Message"}
                              {isOnline && (
                                <div className="w-2 h-2 bg-green-300 rounded-full ml-2 animate-ping"></div>
                              )}
                            </div>
                          </button>

                          {student.linkedin && (
                            <a
                              href={student.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full px-6 py-3 bg-gradient-to-r from-[#0077b5] to-[#0a66c2] text-white rounded-xl font-semibold hover:from-[#005885] hover:to-[#084d8a] transition-all duration-300 group relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                              <div className="relative flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                LinkedIn
                              </div>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentConnect;
