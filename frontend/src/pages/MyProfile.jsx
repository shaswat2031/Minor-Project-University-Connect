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
  getBadgeColor,
  getBadgeEmoji,
} from "../api/certification";
import useCertifications from "../hooks/useCertifications";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showCompleteMessage, setShowCompleteMessage] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  // Use the custom hook to fetch certifications
  const { 
    certifications, 
    loading: certificationsLoading, 
    error: certificationsError,
    refresh: refreshCertifications 
  } = useCertifications({ autoRefresh: true });

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
          `${import.meta.env.VITE_API_URL}/api/profile/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data) {
          setProfile(response.data);
          // Show completion message if profile is not complete
          if (response.data.completionPercentage < 100) {
            setShowCompleteMessage(true);
          }
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

    fetchProfile();
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
  
  // Format certification date with validation
  const formatCertDate = (dateStr) => {
    if (!dateStr) return 'Date not available';
    
    try {
      // Handle different date formats
      let date;
      
      // If it's a timestamp string
      if (typeof dateStr === 'string' && /^\d+$/.test(dateStr)) {
        date = new Date(parseInt(dateStr));
      } 
      // If it's an ISO string
      else if (typeof dateStr === 'string' && dateStr.includes('T')) {
        date = new Date(dateStr);
      }
      // If it's already a Date object
      else if (dateStr instanceof Date) {
        date = dateStr;
      }
      // Fallback
      else {
        date = new Date(dateStr);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
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
          
            
            {/* Certifications Section */}
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
                  </svg>
                  Your Certifications
                </h2>
                <Link to="/certifications" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  <FaPlus size={14} />
                  <span className="text-sm">Take Test</span>
                </Link>
              </div>

              {certificationsLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : certificationsError ? (
                <div className="text-center py-4 text-red-400">
                  Error loading certifications: {certificationsError.message}
                </div>
              ) : certifications && certifications.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {certifications.map((cert, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg">{cert.category}</h3>
                          
                          <div className="mt-2">
                            <span 
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                cert.score >= 80 
                                ? 'bg-green-900/40 text-green-300 border border-green-500/30' 
                                : cert.score >= 60 
                                ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-500/30' 
                                : 'bg-red-900/40 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {cert.score}% Score {getBadgeEmoji ? getBadgeEmoji(cert.score) : "🎯"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">You haven&apos;t earned any certifications yet</p>
                  <Link
                    to="/certifications"
                    className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Take a Certification Test
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MyProfile;