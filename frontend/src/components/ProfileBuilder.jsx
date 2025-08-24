import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaCode,
  FaLink,
  FaImage,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import CertificationBadge from "./CertificationBadge";

// PropTypes definition for the profile object
const profileShape = {
  name: PropTypes.string,
  bio: PropTypes.string,
  location: PropTypes.string,
  skills: PropTypes.arrayOf(PropTypes.string),
  education: PropTypes.arrayOf(PropTypes.shape({
    school: PropTypes.string,
    degree: PropTypes.string,
    field: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  })),
  experience: PropTypes.arrayOf(PropTypes.shape({
    company: PropTypes.string,
    position: PropTypes.string,
    description: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  })),
  projects: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    technologies: PropTypes.arrayOf(PropTypes.string),
    link: PropTypes.string,
  })),
  socialLinks: PropTypes.shape({
    linkedin: PropTypes.string,
    github: PropTypes.string,
    instagram: PropTypes.string,
    portfolio: PropTypes.string,
  }),
  profileImage: PropTypes.string,
  coverImage: PropTypes.string,
};

const ProfileBuilder = ({ profile, onSave, onCancel }) => {
  // Use JavaScript default parameter instead of defaultProps
  profile = profile || {};
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => ({
    name: profile.name || "",
    bio: profile.bio || "",
    location: profile.location || "",
    skills: profile.skills || [],
    education: profile.education || [],
    experience: profile.experience || [],
    projects: profile.projects || [],
    socialLinks: {
      linkedin: profile.socialLinks?.linkedin || "",
      github: profile.socialLinks?.github || "",
      instagram: profile.socialLinks?.instagram || "",
      portfolio: profile.socialLinks?.portfolio || "",
    },
    profileImage: profile.profileImage || "",
    coverImage: profile.coverImage || "",
  }));

  // Update form data when profile prop changes
  useEffect(() => {
    if (profile) {
      setFormData(prevData => ({
        name: profile.name || prevData.name,
        bio: profile.bio || prevData.bio,
        location: profile.location || prevData.location,
        skills: profile.skills || prevData.skills,
        education: profile.education || prevData.education,
        experience: profile.experience || prevData.experience,
        projects: profile.projects || prevData.projects,
        socialLinks: {
          linkedin: profile.socialLinks?.linkedin || prevData.socialLinks.linkedin,
          github: profile.socialLinks?.github || prevData.socialLinks.github,
          instagram: profile.socialLinks?.instagram || prevData.socialLinks.instagram,
          portfolio: profile.socialLinks?.portfolio || prevData.socialLinks.portfolio,
        },
        profileImage: profile.profileImage || prevData.profileImage,
        coverImage: profile.coverImage || prevData.coverImage,
      }));
    }
  }, [profile]);

  const steps = [
    { id: "basic", title: "Basic Info", icon: FaUser },
    { id: "education", title: "Education", icon: FaGraduationCap },
    { id: "experience", title: "Experience", icon: FaBriefcase },
    { id: "projects", title: "Projects", icon: FaCode },
    { id: "social", title: "Social Links", icon: FaLink },
    { id: "media", title: "Photos", icon: FaImage },
  ];

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        education: Array.isArray(profile.education) ? profile.education : [],
        experience: Array.isArray(profile.experience) ? profile.experience : [],
        projects: Array.isArray(profile.projects) ? profile.projects : [],
        socialLinks: {
          linkedin: profile.socialLinks?.linkedin || profile.linkedin || "",
          github: profile.socialLinks?.github || profile.github || "",
          instagram: profile.socialLinks?.instagram || profile.instagram || "",
          portfolio: profile.socialLinks?.portfolio || profile.portfolio || "",
        },
        profileImage: profile.profileImage || "",
        coverImage: profile.coverImage || "",
      });
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayAdd = (field, item) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], item],
    }));
  };

  const handleArrayUpdate = (field, index, item) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((existing, i) =>
        i === index ? item : existing
      ),
    }));
  };

  const handleArrayRemove = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addSkill = (skill) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      handleInputChange("skills", [...formData.skills, skill.trim()]);
    }
  };

  const removeSkill = (skillToRemove) => {
    handleInputChange(
      "skills",
      formData.skills.filter((skill) => skill !== skillToRemove)
    );
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "basic":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                placeholder="Tell us about yourself..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-white hover:text-red-300"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add a skill and press Enter"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addSkill(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          </div>
        );

      case "education":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Education</h3>
              <button
                onClick={() =>
                  handleArrayAdd("education", {
                    degree: "",
                    institution: "",
                    fieldOfStudy: "",
                    startYear: "",
                    endYear: "",
                    grade: "",
                    description: "",
                    current: false,
                  })
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <FaPlus size={12} />
                Add Education
              </button>
            </div>

            {formData.education.map((edu, index) => (
              <div
                key={index}
                className="bg-gray-800 p-4 rounded-lg border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-white font-medium">
                    Education #{index + 1}
                  </h4>
                  <button
                    onClick={() => handleArrayRemove("education", index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Degree"
                    value={edu.degree || ""}
                    onChange={(e) =>
                      handleArrayUpdate("education", index, {
                        ...edu,
                        degree: e.target.value,
                      })
                    }
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Institution"
                    value={edu.institution || ""}
                    onChange={(e) =>
                      handleArrayUpdate("education", index, {
                        ...edu,
                        institution: e.target.value,
                      })
                    }
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Field of Study"
                    value={edu.fieldOfStudy || ""}
                    onChange={(e) =>
                      handleArrayUpdate("education", index, {
                        ...edu,
                        fieldOfStudy: e.target.value,
                      })
                    }
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Start Year"
                    value={edu.startYear || ""}
                    onChange={(e) =>
                      handleArrayUpdate("education", index, {
                        ...edu,
                        startYear: e.target.value,
                      })
                    }
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="End Year"
                    value={edu.endYear || ""}
                    onChange={(e) =>
                      handleArrayUpdate("education", index, {
                        ...edu,
                        endYear: e.target.value,
                      })
                    }
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    disabled={edu.current}
                  />
                  <input
                    type="text"
                    placeholder="Grade/GPA"
                    value={edu.grade || ""}
                    onChange={(e) =>
                      handleArrayUpdate("education", index, {
                        ...edu,
                        grade: e.target.value,
                      })
                    }
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mt-4">
                  <label className="flex items-center text-white">
                    <input
                      type="checkbox"
                      checked={edu.current || false}
                      onChange={(e) =>
                        handleArrayUpdate("education", index, {
                          ...edu,
                          current: e.target.checked,
                          endYear: e.target.checked ? "" : edu.endYear,
                        })
                      }
                      className="mr-2"
                    />
                    Currently studying here
                  </label>
                </div>

                <div className="mt-4">
                  <textarea
                    placeholder="Description (optional)"
                    value={edu.description || ""}
                    onChange={(e) =>
                      handleArrayUpdate("education", index, {
                        ...edu,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case "experience":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Experience</h3>
              <button
                onClick={() =>
                  handleArrayAdd("experience", {
                    title: "",
                    company: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    description: "",
                    current: false,
                  })
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <FaPlus size={12} />
                Add Experience
              </button>
            </div>

            {formData.experience.map((exp, index) => (
              <div
                key={index}
                className="bg-gray-800 p-4 rounded-lg border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-white font-medium">
                    Experience #{index + 1}
                  </h4>
                  <button
                    onClick={() => handleArrayRemove("experience", index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.title || ""}
                      onChange={(e) =>
                        handleArrayUpdate("experience", index, {
                          ...exp,
                          title: e.target.value,
                        })
                      }
                      className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company || ""}
                      onChange={(e) =>
                        handleArrayUpdate("experience", index, {
                          ...exp,
                          company: e.target.value,
                        })
                      }
                      className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={exp.location || ""}
                      onChange={(e) =>
                        handleArrayUpdate("experience", index, {
                          ...exp,
                          location: e.target.value,
                        })
                      }
                      className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Start Date (e.g., Jan 2022)"
                      value={exp.startDate || ""}
                      onChange={(e) =>
                        handleArrayUpdate("experience", index, {
                          ...exp,
                          startDate: e.target.value,
                        })
                      }
                      className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="End Date (e.g., Dec 2022)"
                      value={exp.endDate || ""}
                      onChange={(e) =>
                        handleArrayUpdate("experience", index, {
                          ...exp,
                          endDate: e.target.value,
                        })
                      }
                      className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      disabled={exp.current}
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-white">
                      <input
                        type="checkbox"
                        checked={exp.current || false}
                        onChange={(e) =>
                          handleArrayUpdate("experience", index, {
                            ...exp,
                            current: e.target.checked,
                            endDate: e.target.checked ? "" : exp.endDate,
                          })
                        }
                        className="mr-2"
                      />
                      Currently working here
                    </label>
                  </div>

                  <textarea
                    placeholder="Description of your role and achievements"
                    value={exp.description || ""}
                    onChange={(e) =>
                      handleArrayUpdate("experience", index, {
                        ...exp,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case "projects":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Projects</h3>
              <button
                onClick={() =>
                  handleArrayAdd("projects", {
                    title: "",
                    description: "",
                    technologies: [],
                    githubUrl: "",
                    liveUrl: "",
                    startDate: "",
                    endDate: "",
                    featured: false,
                  })
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <FaPlus size={12} />
                Add Project
              </button>
            </div>

            {formData.projects.map((project, index) => (
              <div
                key={index}
                className="bg-gray-800 p-4 rounded-lg border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-white font-medium">
                    Project #{index + 1}
                  </h4>
                  <button
                    onClick={() => handleArrayRemove("projects", index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={project.title || ""}
                    onChange={(e) =>
                      handleArrayUpdate("projects", index, {
                        ...project,
                        title: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Project Description"
                    value={project.description || ""}
                    onChange={(e) =>
                      handleArrayUpdate("projects", index, {
                        ...project,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Technologies (comma-separated)"
                      value={
                        Array.isArray(project.technologies)
                          ? project.technologies.join(", ")
                          : ""
                      }
                      onChange={(e) =>
                        handleArrayUpdate("projects", index, {
                          ...project,
                          technologies: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter((t) => t),
                        })
                      }
                      className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="url"
                      placeholder="GitHub URL"
                      value={project.githubUrl || ""}
                      onChange={(e) =>
                        handleArrayUpdate("projects", index, {
                          ...project,
                          githubUrl: e.target.value,
                        })
                      }
                      className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="url"
                      placeholder="Live Demo URL"
                      value={project.liveUrl || ""}
                      onChange={(e) =>
                        handleArrayUpdate("projects", index, {
                          ...project,
                          liveUrl: e.target.value,
                        })
                      }
                      className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Start Date (optional)"
                      value={project.startDate || ""}
                      onChange={(e) =>
                        handleArrayUpdate("projects", index, {
                          ...project,
                          startDate: e.target.value,
                        })
                      }
                      className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-white">
                      <input
                        type="checkbox"
                        checked={project.featured || false}
                        onChange={(e) =>
                          handleArrayUpdate("projects", index, {
                            ...project,
                            featured: e.target.checked,
                          })
                        }
                        className="mr-2"
                      />
                      Featured Project
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "social":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Social Links</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) =>
                    handleInputChange("socialLinks", {
                      ...formData.socialLinks,
                      linkedin: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.github}
                  onChange={(e) =>
                    handleInputChange("socialLinks", {
                      ...formData.socialLinks,
                      github: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.instagram}
                  onChange={(e) =>
                    handleInputChange("socialLinks", {
                      ...formData.socialLinks,
                      instagram: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="https://instagram.com/yourusername"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Portfolio
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.portfolio}
                  onChange={(e) =>
                    handleInputChange("socialLinks", {
                      ...formData.socialLinks,
                      portfolio: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>
        );

      case "media":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Profile Images</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Profile Image URL
              </label>
              <input
                type="url"
                value={formData.profileImage}
                onChange={(e) =>
                  handleInputChange("profileImage", e.target.value)
                }
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/your-profile-image.jpg"
              />
              {formData.profileImage && (
                <div className="mt-2">
                  <img
                    src={formData.profileImage}
                    alt="Profile preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) =>
                  handleInputChange("coverImage", e.target.value)
                }
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/your-cover-image.jpg"
              />
              {formData.coverImage && (
                <div className="mt-2">
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="w-full h-32 rounded-lg object-cover border-2 border-blue-500"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Profile Builder
            </h1>
            <p className="text-blue-100">
              Build your complete professional profile
            </p>

            {/* Certifications Display */}
            {profile?.certifications && profile.certifications.length > 0 && (
              <div className="mt-4">
                <h3 className="text-white font-semibold mb-2">
                  Your Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map((cert, index) => (
                    <CertificationBadge
                      key={index}
                      certification={cert}
                      size="sm"
                      showDetails={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 bg-gray-750">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div key={step.id} className="flex items-center">
                    <motion.button
                      onClick={() => setCurrentStep(index)}
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? "bg-blue-600 border-blue-600 text-white"
                          : isCompleted
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isCompleted ? <FaCheck size={16} /> : <Icon size={16} />}
                    </motion.button>

                    <div className="ml-2 hidden md:block">
                      <div
                        className={`text-sm font-medium ${
                          isActive
                            ? "text-blue-400"
                            : isCompleted
                            ? "text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </div>
                    </div>

                    {index < steps.length - 1 && (
                      <div
                        className={`w-8 h-0.5 mx-4 ${
                          isCompleted ? "bg-green-600" : "bg-gray-600"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-750 flex justify-between">
            <div>
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!formData.name || !formData.bio}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => onSave(formData)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  disabled={!formData.name || !formData.bio}
                >
                  <FaCheck size={16} />
                  Save Profile
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

ProfileBuilder.propTypes = {
  profile: PropTypes.shape(profileShape),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ProfileBuilder;
