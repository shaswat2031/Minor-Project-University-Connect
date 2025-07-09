import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaCode,
  FaLink,
  FaCamera,
  FaEdit,
  FaPlus,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaInstagram,
  FaGlobe,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";
import {
  fetchMyCertifications,
  getBadgeColor,
  getBadgeEmoji,
} from "../api/certification";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [certifications, setCertifications] = useState([]);
  const [certificationsLoading, setCertificationsLoading] = useState(true);
  const [showCompleteMessage, setShowCompleteMessage] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your profile");
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data) {
          setProfile(response.data);
        } else {
          // If no profile exists, redirect to profile setup
          navigate("/profile-setup");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (err.response?.status === 404) {
          // Profile doesn't exist, redirect to setup
          navigate("/profile-setup");
        } else {
          setError(err.response?.data?.message || "Error fetching profile");
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch user certifications with debug info
    const fetchUserCertifications = async () => {
      setCertificationsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        console.log("Fetching certifications with:", {
          token: !!token,
          userId,
        });

        // First, let's debug what data exists
        const debugResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/certification/debug/user-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Debug user data:", debugResponse.data);

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/certification/my-certifications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Fetched certifications response:", response.data);

        if (
          response.data.certifications &&
          response.data.certifications.length > 0
        ) {
          setCertifications(response.data.certifications);
          console.log("Set certifications:", response.data.certifications);
        } else {
          console.log(
            "No certifications found, checking certification records..."
          );
          // If no certifications in profile, check if there are any certification records
          // and rebuild the profile
          setCertifications([]);
        }
      } catch (error) {
        console.error("Error fetching certifications:", error);
        setCertifications([]);
      } finally {
        setCertificationsLoading(false);
      }
    };

    fetchProfile();
    fetchUserCertifications();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/setup`,
        {
          name: profile.name,
          bio: profile.bio,
          skills: Array.isArray(profile.skills)
            ? profile.skills
            : profile.skills.split(",").map((s) => s.trim()),
          education: Array.isArray(profile.education) ? profile.education : [],
          linkedin: profile.linkedin,
          instagram: profile.instagram,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Error updating profile");
    }
  };

  const handleSkillsChange = (value) => {
    setProfile({
      ...profile,
      skills: value
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0),
    });
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...(profile.education || [])];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setProfile({ ...profile, education: updatedEducation });
  };

  const addEducation = () => {
    setProfile({
      ...profile,
      education: [
        ...(profile.education || []),
        { degree: "", institution: "", year: "" },
      ],
    });
  };

  const removeEducation = (index) => {
    const updatedEducation = profile.education.filter((_, i) => i !== index);
    setProfile({ ...profile, education: updatedEducation });
  };

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

  const getSocialIcon = (platform) => {
    switch (platform) {
      case "linkedin":
        return <FaLinkedin className="text-blue-600" />;
      case "github":
        return <FaGithub className="text-gray-700" />;
      case "twitter":
        return <FaTwitter className="text-blue-400" />;
      case "instagram":
        return <FaInstagram className="text-pink-500" />;
      case "portfolio":
        return <FaGlobe className="text-green-600" />;
      default:
        return <FaLink />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-xl mb-4">
            No profile found. Please complete your profile setup.
          </p>
          <button
            onClick={() => navigate("/profile-setup")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Setup Profile
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white py-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-6xl mx-auto bg-[#131a2b] rounded-xl shadow-2xl p-8 border border-blue-500/30"
      >
        {/* Complete Profile Message - Show only once */}
        {showCompleteMessage && (
          <div className="mb-8 bg-blue-900/30 p-6 rounded-lg shadow-lg border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">
                  Complete your profile to connect with other students
                </h3>
                <p className="text-gray-300">
                  Fill out all sections to maximize your networking
                  opportunities
                </p>
              </div>
              <Link
                to="/profile-setup"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center"
              >
                <FaEdit className="mr-2" />
                Complete Your Profile
              </Link>
            </div>

            {/* Progress Bar */}
            {profile?.completionPercentage !== undefined && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Profile Completion</span>
                  <span>{profile.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profile?.completionPercentage || 0}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-gray-800/50 rounded-lg p-8 mb-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profile?.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition">
                <FaCamera className="text-sm" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">
                {profile?.name || "Your Name"}
              </h1>
              <p className="text-gray-300 mb-4 max-w-2xl">
                {profile?.bio || "Add a bio to tell others about yourself..."}
              </p>

              {/* Skills */}
              {profile?.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm border border-blue-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/profile-setup"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition flex items-center gap-2"
            >
              <FaEdit />
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Education Section */}
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <FaGraduationCap className="text-blue-400" />
                  Education
                </h2>
                <button className="text-blue-400 hover:text-blue-300">
                  <FaPlus />
                </button>
              </div>

              {profile?.education && profile.education.length > 0 ? (
                <div className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <h3 className="font-semibold text-lg">{edu.degree}</h3>
                      <p className="text-blue-400">{edu.institution}</p>
                      {edu.fieldOfStudy && (
                        <p className="text-gray-300">{edu.fieldOfStudy}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {edu.startYear} -{" "}
                          {edu.current ? "Present" : edu.endYear}
                        </span>
                        {edu.grade && <span>Grade: {edu.grade}</span>}
                      </div>
                      {edu.description && (
                        <p className="text-gray-300 mt-2">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No education information added yet
                </p>
              )}
            </div>

            {/* Experience Section */}
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <FaBriefcase className="text-green-400" />
                  Experience
                </h2>
                <button className="text-blue-400 hover:text-blue-300">
                  <FaPlus />
                </button>
              </div>

              {profile?.experience && profile.experience.length > 0 ? (
                <div className="space-y-4">
                  {profile.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-green-500 pl-4 py-2"
                    >
                      <h3 className="font-semibold text-lg">{exp.title}</h3>
                      <p className="text-green-400">{exp.company}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                        {exp.location && (
                          <span className="flex items-center gap-1">
                            <FaMapMarkerAlt />
                            {exp.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {exp.startDate} -{" "}
                          {exp.current ? "Present" : exp.endDate}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-gray-300 mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No work experience added yet
                </p>
              )}
            </div>

            {/* Projects Section */}
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <FaCode className="text-purple-400" />
                  Projects
                </h2>
                <button className="text-blue-400 hover:text-blue-300">
                  <FaPlus />
                </button>
              </div>

              {profile?.projects && profile.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.projects.map((project, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg">
                          {project.title}
                        </h3>
                        <div className="flex gap-2">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-white"
                            >
                              <FaGithub />
                            </a>
                          )}
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-white"
                            >
                              <FaExternalLinkAlt />
                            </a>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm mb-3">
                        {project.description}
                      </p>

                      {project.technologies &&
                        project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No projects added yet
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Basic Info */}
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold flex items-center gap-3 mb-4">
                <FaUser className="text-blue-400" />
                Basic Info
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <p>{profile?.user?.email || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">
                    Profile Completion
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${profile?.completionPercentage || 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm">
                      {profile?.completionPercentage || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <FaLink className="text-green-400" />
                  Social Links
                </h2>
                <button className="text-blue-400 hover:text-blue-300">
                  <FaPlus />
                </button>
              </div>

              {profile?.socialLinks &&
              Object.keys(profile.socialLinks).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(profile.socialLinks).map(
                    ([platform, url]) =>
                      url && (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition"
                        >
                          {getSocialIcon(platform)}
                          <span className="capitalize">{platform}</span>
                          <FaExternalLinkAlt className="ml-auto text-gray-400 text-sm" />
                        </a>
                      )
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">
                  No social links added yet
                </p>
              )}
            </div>

            {/* Photos */}
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <FaCamera className="text-pink-400" />
                  Photos
                </h2>
                <button className="text-blue-400 hover:text-blue-300">
                  <FaPlus />
                </button>
              </div>

              {profile?.photos && profile.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {profile.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.url}
                        alt={photo.caption || `Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-xs p-2 rounded-b-lg">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No photos added yet
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MyProfile;
