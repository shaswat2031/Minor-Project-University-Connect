import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import chatService from "../services/chatService";

const StudentConnect = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStudents = async () => {
      if (!token) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/students`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Updated filtering logic to use the user field
        if (
          response.data &&
          response.data.students &&
          response.data.loggedInUserId
        ) {
          const filteredStudents = response.data.students.filter(
            (student) => student.user !== response.data.loggedInUserId
          );
          console.log("Logged in user ID:", response.data.loggedInUserId);
          console.log("Filtered students:", filteredStudents);
          setStudents(filteredStudents);
          setFilteredStudents(filteredStudents);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
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
          }
        );
        setProfileExists(!!response.data);
      } catch (error) {
        setProfileExists(false);
      }
    };

    fetchProfile();
    fetchStudents();
  }, [token]);

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
      // Send initial message to start conversation
      await chatService.sendMessageHTTP(
        student.user,
        `Hi ${student.name}! I'd like to connect with you.`
      );

      // Show success message
      alert(`Chat started with ${student.name}! Check your messages.`);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chat. Please try again.");
    }
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

        {!profileExists && (
          <div className="text-center mb-8 bg-blue-900/30 p-6 rounded-lg shadow-lg">
            <p className="mb-4 text-lg">
              Complete your profile to connect with other students
            </p>
            <Link
              to="/profile-setup"
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
              No students match your search criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="p-6 bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-blue-500 transform hover:-translate-y-2"
              >
                <h3 className="text-2xl font-bold text-center text-blue-400 mb-4">
                  {student.name}
                </h3>
                <p className="text-gray-300 text-center mb-6 line-clamp-3 italic">
                  &ldquo;{student.bio || "No bio provided"}&rdquo;
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

                  {/* Chat Button */}
                  <button
                    onClick={() => startChat(student)}
                    className="block w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105 font-medium"
                  >
                    <div className="flex items-center justify-center">
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
                      Start Chat
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentConnect;
