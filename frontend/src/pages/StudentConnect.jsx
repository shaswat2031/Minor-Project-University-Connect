import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import chatService from "../services/chatService";
import { io } from "socket.io-client";

const StudentConnect = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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
      <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-2xl font-light">Loading students...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-center text-blue-400 drop-shadow-lg">
          Student Connect
        </h2>

        {/* Online Users Count */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-green-900/30 rounded-full border border-green-500/30">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-green-300 font-medium">
              {onlineUsers.size} students online
            </span>
          </div>
        </div>

        {!profileExists && (
          <div className="text-center mb-8 bg-blue-900/30 p-6 rounded-lg shadow-lg border border-blue-500/30">
            <p className="mb-4 text-lg">
              Complete your profile to connect with other students
            </p>
            <Link
              to="/my-profile"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Complete Your Profile
            </Link>
          </div>
        )}

        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search by name or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-12 bg-gray-800 rounded-full text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
            <svg
              className="absolute left-4 top-4 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center p-8 bg-gray-800/50 rounded-lg">
            <p className="text-xl text-gray-300">
              {loading ? "Loading students..." : "No students found"}
            </p>
            {!loading && students.length === 0 && (
              <p className="text-sm text-gray-400 mt-2">
                There might be a server issue. Please try refreshing the page.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStudents.map((student) => {
              // Enhanced safety checks
              if (!student || !student.user) {
                return null;
              }

              // Use fallback values for missing data
              const studentName = student.name || "Unknown User";
              const studentBio = student.bio || "No bio provided";
              const userId = student.user;
              const isOnline = userId ? isUserOnline(userId) : false;

              return (
                <div
                  key={student._id}
                  className={`p-6 bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border ${
                    isOnline
                      ? "border-green-500 ring-2 ring-green-500/20"
                      : "border-gray-700 hover:border-blue-500"
                  } transform hover:-translate-y-2 relative`}
                >
                  {/* Profile completeness indicator */}
                  {!student.hasProfile && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded">
                      Basic Profile
                    </div>
                  )}

                  {/* Online Status Indicator */}
                  <div className="absolute top-4 right-4 flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        isOnline ? "bg-green-500 animate-pulse" : "bg-gray-500"
                      }`}
                    ></div>
                    <span
                      className={`text-xs font-medium ${
                        isOnline ? "text-green-400" : "text-gray-400"
                      }`}
                    >
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-center text-blue-400 mb-4">
                    {studentName}
                  </h3>
                  <p className="text-gray-300 text-center mb-6 line-clamp-3 italic">
                    &ldquo;{studentBio}&rdquo;
                  </p>
                  {student.skills && (
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {(typeof student.skills === "string"
                        ? student.skills.split(",")
                        : Array.isArray(student.skills)
                        ? student.skills
                        : []
                      ).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-900/50 text-sm text-blue-200 rounded-full border border-blue-800/50 shadow-sm"
                        >
                          {typeof skill === "string" ? skill.trim() : skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-center space-y-4">
                    <Link
                      to={`/profile/${student._id}`}
                      className="block w-full px-4 py-2.5 bg-gradient-to-r from-[#131a2b] to-[#1e293b] border border-[#00fffc]/50 text-white rounded-lg shadow-md hover:shadow-[#00fffc]/30 transition-all duration-300 transform hover:scale-105 hover:border-[#00fffc]/70 font-medium"
                    >
                      <div className="flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-[#00fffc]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
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
                      className={`block w-full px-4 py-2.5 ${
                        isOnline
                          ? "bg-gradient-to-r from-green-500 to-green-600 hover:shadow-green-500/40"
                          : "bg-gradient-to-r from-gray-500 to-gray-600 hover:shadow-gray-500/40"
                      } text-white rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 font-medium relative overflow-hidden group`}
                    >
                      <div className="absolute inset-0 w-0 bg-white/10 transition-all duration-300 group-hover:w-full"></div>
                      <div className="flex items-center justify-center relative z-10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
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
                        className="block w-full px-4 py-2.5 bg-gradient-to-r from-[#0077b5] to-[#0a66c2] text-white rounded-lg shadow-md hover:shadow-[#0077b5]/40 transition-all duration-300 transform hover:scale-105 font-medium relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 w-0 bg-white/10 transition-all duration-300 group-hover:w-full"></div>
                        <div className="flex items-center justify-center relative z-10">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          LinkedIn
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentConnect;
