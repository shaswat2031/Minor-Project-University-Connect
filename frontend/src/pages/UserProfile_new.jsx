import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaEdit,
  FaLinkedin,
  FaInstagram,
  FaGraduationCap,
  FaUser,
  FaEnvelope,
} from "react-icons/fa";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        setError("Please login to view your profile");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching profile with token:", currentToken);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${currentToken}` },
          }
        );
        console.log("Profile data received:", response.data);
        setProfile(response.data);
      } catch (err) {
        console.error(
          "Error fetching profile:",
          err.response?.data?.message || err
        );
        setError(err.response?.data?.message || "Error fetching profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-red-500/20 rounded-lg border border-red-500"
        >
          <h2 className="text-xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-yellow-500/20 rounded-lg border border-yellow-500"
        >
          <h2 className="text-xl font-bold text-yellow-400 mb-4">
            No Profile Found
          </h2>
          <p className="text-yellow-300 mb-4">
            Please complete your profile setup.
          </p>
          <button
            onClick={() => navigate("/profile-setup")}
            className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition"
          >
            Set Up Profile
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black py-10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-[#131a2b] rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <FaUser className="text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <p className="text-blue-100 flex items-center gap-2">
                    <FaEnvelope className="text-sm" />
                    {profile.email || "No email provided"}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  navigate("/profile-setup", { state: { profile } })
                }
                className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition flex items-center gap-2"
              >
                <FaEdit />
                Edit Profile
              </motion.button>
            </div>
          </div>

          <div className="p-8">
            {/* Bio Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-blue-400 mb-4">
                About Me
              </h2>
              <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg">
                {profile.bio || "No bio provided"}
              </p>
            </motion.div>

            {/* Skills Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-blue-400 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-600/30 text-blue-300 rounded-full text-sm border border-blue-500/30"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400">No skills listed</p>
                )}
              </div>
            </motion.div>

            {/* Education Section */}
            {profile.education &&
              Array.isArray(profile.education) &&
              profile.education.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8"
                >
                  <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <FaGraduationCap />
                    Education
                  </h2>
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <div
                        key={edu._id || index}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <h3 className="text-lg font-semibold text-blue-300">
                          {edu.degree || "Degree not specified"}
                        </h3>
                        <p className="text-gray-400">
                          {edu.institution || "Institution not specified"}
                        </p>
                        <p className="text-gray-500">
                          {edu.year || "Year not specified"}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-blue-400 mb-4">
                Social Links
              </h2>
              <div className="flex flex-wrap gap-4">
                {profile.linkedin ? (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                  >
                    <FaLinkedin />
                    LinkedIn
                  </a>
                ) : null}
                {profile.instagram ? (
                  <a
                    href={profile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition duration-300"
                  >
                    <FaInstagram />
                    Instagram
                  </a>
                ) : null}
                {!profile.linkedin && !profile.instagram && (
                  <p className="text-gray-400">No social links provided</p>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center gap-4"
            >
              <button
                onClick={() =>
                  navigate("/profile-setup", { state: { profile } })
                }
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center gap-2"
              >
                <FaEdit />
                Edit Profile
              </button>
              <button
                onClick={() => navigate("/students")}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                View All Students
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
