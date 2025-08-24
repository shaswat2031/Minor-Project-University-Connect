import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FaCertificate,
  FaDownload,
  FaMedal,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaExternalLinkAlt,
  FaCode,
  FaGlobe,
} from "react-icons/fa";
import { motion } from "framer-motion";
import {
  fetchUserCertifications,
  getBadgeColor,
  getBadgeEmoji,
} from "../api/certification";

const ProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certificationsLoading, setCertificationsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view this profile.");
          setLoading(false);
          return;
        }

        // Try multiple endpoints to get the profile data
        let response;
        try {
          // First try the students endpoint (which might have profile data)
          response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/students/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // If student data doesn't have complete profile, try to get profile separately
          if (response.data && !response.data.bio) {
            try {
              const profileResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/users/profile`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                  params: { userId: id },
                }
              );
              // Merge student data with profile data
              response.data = { ...response.data, ...profileResponse.data };
            } catch (profileErr) {
              console.log("Profile data not found, using student data only");
            }
          }
        } catch (studentErr) {
          // If students endpoint fails, try getting profile directly
          response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/users/profile`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { userId: id },
            }
          );
        }

        console.log("Fetched profile data:", response.data);
        setProfile(response.data);

        // Fetch certifications for this user
        await fetchUserCertifications(id);
      } catch (err) {
        console.error("Error fetching profile:", err);

        // If all else fails, try to construct a basic profile from user data
        try {
          const userResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/users/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (userResponse.data) {
            setProfile({
              name: userResponse.data.name || userResponse.data.email,
              email: userResponse.data.email,
              user: userResponse.data,
              bio: "No bio available",
              skills: [],
              education: [],
              experience: [],
              projects: [],
              socialLinks: {},
            });
          } else {
            setError("Profile not found");
          }
        } catch (userErr) {
          setError(err.response?.data?.message || "Error fetching profile");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchUserCertifications = async (userId) => {
      setCertificationsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/certifications/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Fetched user certifications:", response.data);
        setCertifications(response.data.certifications || []);
      } catch (error) {
        console.error("Error fetching certifications:", error);
        setCertifications([]);
      } finally {
        setCertificationsLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const getCertificationIcon = (category) => {
    const icons = {
      React: "⚛️",
      Java: "☕",
      Python: "🐍",
      JavaScript: "🚀",
      "Data Structures": "🏗️",
      Algorithms: "🧮",
      "Web Development": "🌐",
    };
    return icons[category] || "📜";
  };

  const getCertificationColor = (category) => {
    const colors = {
      React: "from-blue-500 to-cyan-400",
      Java: "from-orange-500 to-red-500",
      Python: "from-green-500 to-teal-400",
      JavaScript: "from-yellow-500 to-orange-400",
      "Data Structures": "from-purple-500 to-pink-500",
      Algorithms: "from-indigo-500 to-purple-500",
      "Web Development": "from-pink-500 to-rose-400",
    };
    return colors[category] || "from-gray-500 to-gray-600";
  };

  const getPerformanceGrade = (percentage) => {
    if (percentage >= 90)
      return { grade: "Excellence", color: "text-green-400" };
    if (percentage >= 80)
      return { grade: "Distinction", color: "text-blue-400" };
    if (percentage >= 70) return { grade: "Merit", color: "text-purple-400" };
    return { grade: "Pass", color: "text-gray-400" };
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
        <div className="bg-[#1F2937] rounded-xl shadow-xl p-8 max-w-xl w-full text-center border-2 border-red-500 transform transition-all duration-300 hover:scale-105">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-2xl text-white font-bold mb-2">Error</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Process skills to ensure consistent format
  const processSkills = () => {
    if (!profile.skills) return [];

    if (typeof profile.skills === "string") {
      return profile.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    if (Array.isArray(profile.skills)) {
      return profile.skills
        .map((skill) =>
          typeof skill === "string" ? skill.trim() : String(skill)
        )
        .filter(Boolean);
    }

    return [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1E3A8A] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1F2937] rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-blue-900/30 animate-fadeIn">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-blue-900 to-indigo-900 p-8">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold overflow-hidden">
                    {profile?.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={profile?.name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center text-white ${
                        profile?.profileImage ? "hidden" : "flex"
                      }`}
                    >
                      {profile?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                    {profile?.name}
                  </h2>
                  <p className="text-blue-200 text-lg italic flex items-center">
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {profile?.user?.email || profile?.email}
                  </p>
                </div>
              </div>

              {profile?.isVerified && (
                <div className="mt-4 md:mt-0 bg-green-900/30 py-2 px-4 rounded-full border border-green-500 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-400 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-green-300 font-medium">
                    Verified Profile
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 md:p-8 space-y-8">
            {/* Bio Section */}
            {profile?.bio && (
              <div className="animate-fadeIn delay-100">
                <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
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
                  About Me
                </h3>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Education Section */}
            {profile?.education &&
              Array.isArray(profile.education) &&
              profile.education.length > 0 && (
                <div className="animate-fadeIn delay-200">
                  <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                      />
                    </svg>
                    Education
                  </h3>
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <div
                        key={edu._id || index}
                        className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
                      >
                        <h4 className="text-lg font-semibold text-blue-300 mb-1">
                          {edu.degree || "Degree not specified"}
                        </h4>
                        <p className="text-gray-300 mb-1">
                          {edu.institution || "Institution not specified"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {edu.year || "Year not specified"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Skills Section */}
            {processSkills().length > 0 && (
              <div className="animate-fadeIn delay-300">
                <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {processSkills().map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {profile?.projects &&
              Array.isArray(profile.projects) &&
              profile.projects.length > 0 && (
                <div className="animate-fadeIn delay-350">
                  <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
                    <FaCode className="h-6 w-6 mr-2" />
                    Projects
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.projects.map((project, index) => (
                      <div
                        key={project._id || index}
                        className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300"
                      >
                        <h4 className="text-xl font-semibold text-white mb-2">
                          {project.title}
                        </h4>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                          {project.description}
                        </p>

                        {/* Technologies */}
                        {project.technologies &&
                          project.technologies.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-gray-400 mb-2">
                                Technologies:
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech, techIndex) => (
                                  <span
                                    key={techIndex}
                                    className="bg-purple-600/30 text-purple-300 px-2 py-1 rounded text-xs"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Project Links */}
                        <div className="flex gap-3">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-all duration-300"
                            >
                              <FaGithub />
                              Code
                            </a>
                          )}
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-all duration-300"
                            >
                              <FaGlobe />
                              Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Experience Section */}
            {profile?.experience &&
              Array.isArray(profile.experience) &&
              profile.experience.length > 0 && (
                <div className="animate-fadeIn delay-250">
                  <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
                      />
                    </svg>
                    Experience
                  </h3>
                  <div className="space-y-4">
                    {profile.experience.map((exp, index) => (
                      <div
                        key={exp._id || index}
                        className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
                      >
                        <h4 className="text-lg font-semibold text-green-300 mb-1">
                          {exp.title}
                        </h4>
                        <p className="text-gray-300 mb-1">{exp.company}</p>
                        {exp.location && (
                          <p className="text-gray-400 text-sm mb-1">
                            📍 {exp.location}
                          </p>
                        )}
                        <p className="text-gray-400 text-sm mb-2">
                          {exp.startDate} -{" "}
                          {exp.current ? "Present" : exp.endDate}
                        </p>
                        {exp.description && (
                          <p className="text-gray-300 text-sm">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Social Links Section */}
            <div className="animate-fadeIn delay-375">
              <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Connect
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Email */}
                <a
                  href={`mailto:${profile?.user?.email || profile?.email}`}
                  className="bg-gray-800/50 hover:bg-red-900/30 p-4 rounded-lg border border-gray-700 hover:border-red-500 transition-all duration-300 flex items-center gap-3"
                >
                  <FaEnvelope className="text-red-500 text-xl" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-gray-400 text-sm">
                      {profile?.user?.email || profile?.email}
                    </p>
                  </div>
                  <FaExternalLinkAlt className="ml-auto text-gray-400" />
                </a>

                {/* LinkedIn */}
                {profile?.socialLinks?.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800/50 hover:bg-blue-900/30 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 flex items-center gap-3"
                  >
                    <FaLinkedin className="text-blue-500 text-xl" />
                    <div>
                      <p className="text-white font-medium">LinkedIn</p>
                      <p className="text-gray-400 text-sm">
                        Professional Profile
                      </p>
                    </div>
                    <FaExternalLinkAlt className="ml-auto text-gray-400" />
                  </a>
                )}

                {/* GitHub */}
                {profile?.socialLinks?.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800/50 hover:bg-gray-700/50 p-4 rounded-lg border border-gray-700 hover:border-gray-500 transition-all duration-300 flex items-center gap-3"
                  >
                    <FaGithub className="text-gray-300 text-xl" />
                    <div>
                      <p className="text-white font-medium">GitHub</p>
                      <p className="text-gray-400 text-sm">Code Repository</p>
                    </div>
                    <FaExternalLinkAlt className="ml-auto text-gray-400" />
                  </a>
                )}

                {/* Twitter */}
                {profile?.socialLinks?.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800/50 hover:bg-blue-900/30 p-4 rounded-lg border border-gray-700 hover:border-blue-400 transition-all duration-300 flex items-center gap-3"
                  >
                    <svg
                      className="text-blue-400 text-xl"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">Twitter</p>
                      <p className="text-gray-400 text-sm">Social Profile</p>
                    </div>
                    <FaExternalLinkAlt className="ml-auto text-gray-400" />
                  </a>
                )}

                {/* Instagram */}
                {profile?.socialLinks?.instagram && (
                  <a
                    href={profile.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800/50 hover:bg-pink-900/30 p-4 rounded-lg border border-gray-700 hover:border-pink-500 transition-all duration-300 flex items-center gap-3"
                  >
                    <svg
                      className="text-pink-500 text-xl"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">Instagram</p>
                      <p className="text-gray-400 text-sm">Social Profile</p>
                    </div>
                    <FaExternalLinkAlt className="ml-auto text-gray-400" />
                  </a>
                )}

                {/* Portfolio/Website */}
                {profile?.socialLinks?.portfolio && (
                  <a
                    href={profile.socialLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800/50 hover:bg-green-900/30 p-4 rounded-lg border border-gray-700 hover:border-green-500 transition-all duration-300 flex items-center gap-3"
                  >
                    <FaGlobe className="text-green-500 text-xl" />
                    <div>
                      <p className="text-white font-medium">Portfolio</p>
                      <p className="text-gray-400 text-sm">Personal Website</p>
                    </div>
                    <FaExternalLinkAlt className="ml-auto text-gray-400" />
                  </a>
                )}
              </div>
            </div>

            {/* Certifications Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-lg p-6 mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <FaCertificate className="text-2xl text-yellow-500" />
                <h2 className="text-2xl font-bold text-white">
                  Certifications
                </h2>
                <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-sm font-semibold">
                  {certifications.length}
                </span>
              </div>

              {certificationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
                  <span className="ml-3 text-gray-300">
                    Loading certifications...
                  </span>
                </div>
              ) : certifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certifications.map((cert, index) => {
                    const performance = getPerformanceGrade(cert.percentage);
                    const badgeColor = getBadgeColor(cert.badgeType);
                    const badgeEmoji = getBadgeEmoji(cert.badgeType);

                    return (
                      <motion.div
                        key={cert._id || index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-gradient-to-br ${getCertificationColor(
                          cert.category
                        )} p-1 rounded-xl`}
                      >
                        <div className="bg-gray-800 rounded-lg p-4 h-full">
                          <div className="text-center mb-4">
                            <div className="text-3xl mb-2">
                              {getCertificationIcon(cert.category)}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">
                              {cert.category}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              Certification
                            </p>
                            <div className="mt-2">
                              <span className={`text-2xl ${badgeColor}`}>
                                {badgeEmoji}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">
                                Score:
                              </span>
                              <span className="text-white font-semibold">
                                {cert.score}/{cert.totalQuestions}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">
                                Percentage:
                              </span>
                              <span className="text-white font-semibold">
                                {cert.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">
                                Grade:
                              </span>
                              <span
                                className={`font-semibold ${performance.color}`}
                              >
                                {performance.grade}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">
                                Badge:
                              </span>
                              <span
                                className={`font-semibold ${badgeColor} capitalize`}
                              >
                                {cert.badgeType}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">
                                Date:
                              </span>
                              <span className="text-white text-sm">
                                {new Date(
                                  cert.earnedAt || cert.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-center">
                            <FaMedal
                              className={badgeColor.replace("text-", "text-")}
                            />
                            <span className="text-yellow-500 font-semibold text-sm ml-2">
                              {cert.badgeType.charAt(0).toUpperCase() +
                                cert.badgeType.slice(1)}{" "}
                              Certified
                            </span>
                          </div>

                          {cert.certificateUrl && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <a
                                href={`${import.meta.env.VITE_API_URL}${
                                  cert.certificateUrl
                                }`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition text-sm font-semibold flex items-center justify-center"
                              >
                                <FaDownload className="mr-2" />
                                Certificate
                              </a>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaCertificate className="text-6xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">
                    No certifications earned yet
                  </p>
                  <p className="text-gray-500 text-sm">
                    Complete certification tests to showcase your skills
                  </p>
                </div>
              )}
            </motion.div>

            {/* Contact Button - Optional */}
            <div className="pt-4 flex justify-center animate-fadeIn delay-500">
              <button
                onClick={() =>
                  (window.location.href = `mailto:${
                    profile?.user?.email || profile?.email
                  }`)
                }
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
              >
                <FaEnvelope className="h-5 w-5 mr-2" />
                Contact {profile?.name.split(" ")[0]}
              </button>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.history.back()}
            className="text-blue-300 hover:text-blue-100 transition-colors flex items-center mx-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to profiles
          </button>
        </div>
      </div>

      {/* Add animation CSS - this should be in a global stylesheet */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-250 {
          animation-delay: 0.25s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-350 {
          animation-delay: 0.35s;
        }
        .delay-375 {
          animation-delay: 0.375s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
