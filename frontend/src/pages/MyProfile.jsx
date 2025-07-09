import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import React from "react";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl"
        >
          Loading...
        </motion.div>
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
        className="max-w-4xl mx-auto bg-[#131a2b] rounded-xl shadow-2xl p-8 border border-blue-500/30"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-2">
            {editing ? "Edit Profile" : "My Profile"}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {!editing ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-blue-400 mb-2">
                {profile.name}
              </h3>
              <p className="text-gray-300 text-lg">{profile.bio}</p>
            </div>

            {/* Skills Section */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-blue-400 mb-4">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(profile.skills)
                    ? profile.skills
                    : profile.skills.split(",")
                  ).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education Section */}
            {profile.education &&
              Array.isArray(profile.education) &&
              profile.education.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-blue-400 mb-4">
                    Education
                  </h4>
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <motion.div
                        key={edu._id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
                      >
                        <h5 className="text-lg font-semibold text-blue-300">
                          {edu.degree || "Degree not specified"}
                        </h5>
                        <p className="text-gray-400">
                          {edu.institution || "Institution not specified"}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {edu.year || "Year not specified"}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

            {/* Social Links */}
            <div className="flex justify-center gap-4 mb-8">
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center gap-2"
                >
                  <i className="fab fa-linkedin"></i>
                  LinkedIn
                </a>
              )}
              {profile.instagram && (
                <a
                  href={profile.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition duration-300 flex items-center gap-2"
                >
                  <i className="fab fa-instagram"></i>
                  Instagram
                </a>
              )}
            </div>

            {/* Edit Button */}
            <div className="text-center">
              <button
                onClick={() => setEditing(true)}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition duration-300 font-semibold"
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Bio Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                required
              />
            </div>

            {/* Skills Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={
                  Array.isArray(profile.skills)
                    ? profile.skills.join(", ")
                    : profile.skills
                }
                onChange={(e) => handleSkillsChange(e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="React, JavaScript, Node.js, etc."
              />
            </div>

            {/* Education Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Education
              </label>
              {(profile.education || []).map((edu, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) =>
                        handleEducationChange(index, "degree", e.target.value)
                      }
                      className="p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "institution",
                          e.target.value
                        )
                      }
                      className="p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Year"
                        value={edu.year}
                        onChange={(e) =>
                          handleEducationChange(index, "year", e.target.value)
                        }
                        className="flex-1 p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addEducation}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                Add Education
              </button>
            </div>

            {/* LinkedIn Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={profile.linkedin}
                onChange={(e) =>
                  setProfile({ ...profile, linkedin: e.target.value })
                }
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            {/* Instagram Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instagram URL
              </label>
              <input
                type="url"
                value={profile.instagram}
                onChange={(e) =>
                  setProfile({ ...profile, instagram: e.target.value })
                }
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://instagram.com/yourprofile"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition duration-300 font-semibold"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default MyProfile;
