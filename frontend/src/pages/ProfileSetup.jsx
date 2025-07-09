import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import { motion } from "framer-motion";
import React from "react";

const ProfileSetup = () => {
  const location = useLocation(); // Get location object
  const navigate = useNavigate(); // Initialize navigate
  const initialProfile = location.state?.profile || {}; // Get profile data from state
  const [name, setName] = useState(initialProfile.name || "");
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [skills, setSkills] = useState(
    Array.isArray(initialProfile.skills)
      ? initialProfile.skills.join(", ")
      : initialProfile.skills || ""
  );
  const [education, setEducation] = useState(
    Array.isArray(initialProfile.education) &&
      initialProfile.education.length > 0
      ? initialProfile.education
      : [{ degree: "", institution: "", year: "" }]
  );
  const [linkedin, setLinkedin] = useState(initialProfile.linkedin || "");
  const [instagram, setInstagram] = useState(initialProfile.instagram || "");
  const [experience, setExperience] = useState([
    { role: "", company: "", duration: "" },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token"); // Retrieve the token from localStorage
    if (!token) {
      alert("You need to be logged in!");
      navigate("/login");
    }
  }, [navigate]);

  const handleAddEducation = () => {
    setEducation([...education, { degree: "", institution: "", year: "" }]);
  };

  const handleAddExperience = () => {
    setExperience([...experience, { role: "", company: "", duration: "" }]);
  };

  const handleEducationChange = (index, key, value) => {
    const updatedEducation = [...education];
    updatedEducation[index][key] = value;
    setEducation(updatedEducation);
  };

  const handleExperienceChange = (index, key, value) => {
    const updatedExperience = [...experience];
    updatedExperience[index][key] = value;
    setExperience(updatedExperience);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in!");
        navigate("/login");
        return;
      }

      // Prepare the payload
      const payload = {
        name,
        bio,
        skills: Array.isArray(skills)
          ? skills
          : skills
              .split(",")
              .map((skill) => skill.trim())
              .filter((skill) => skill.length > 0),
        linkedin,
        instagram,
      };

      // Include education only if it is filled
      if (education.some((edu) => edu.degree || edu.institution || edu.year)) {
        payload.education = education.filter(
          (edu) => edu.degree || edu.institution || edu.year
        );
      } else {
        payload.education = [];
      }

      // Update the API endpoint to match the server routes
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/setup`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Profile setup success:", response.data);
      alert("Profile setup successful!");
      navigate("/my-profile");
    } catch (error) {
      console.error("Error saving profile:", error.response?.data || error);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white py-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-[#131a2b] p-8 rounded-xl shadow-2xl w-full max-w-3xl border border-blue-500/30"
      >
        <h2 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Set Up Your Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-400 mb-3">
              Basic Information
            </h3>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.input
                type="text"
                placeholder="Name"
                className="w-full p-4 border border-blue-500 rounded-lg bg-[#1a2235] text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.textarea
                placeholder="Bio"
                className="w-full p-4 border border-blue-500 rounded-lg bg-[#1a2235] text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-md min-h-[100px]"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
              />
            </motion.div>
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-400 mb-3">
              Skills & Social Media
            </h3>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex items-center bg-[#1a2235] rounded-lg overflow-hidden border border-blue-500 shadow-md"
            >
              <motion.input
                type="text"
                placeholder="Skills (comma-separated)"
                className="w-full p-4 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <span className="px-4 text-blue-400 cursor-pointer hover:text-blue-300 text-xl">
                +
              </span>
            </motion.div>

            {/* LinkedIn Section */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex items-center bg-[#1a2235] rounded-lg overflow-hidden border border-blue-500 shadow-md"
            >
              <motion.input
                type="text"
                placeholder="LinkedIn Profile URL"
                className="w-full p-4 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
              <span className="px-4 text-blue-400 cursor-pointer hover:text-blue-300 text-xl">
                +
              </span>
            </motion.div>

            {/* Instagram Section */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex items-center bg-[#1a2235] rounded-lg overflow-hidden border border-blue-500 shadow-md"
            >
              <motion.input
                type="text"
                placeholder="Instagram Profile URL"
                className="w-full p-4 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
              <span className="px-4 text-blue-400 cursor-pointer hover:text-blue-300 text-xl">
                +
              </span>
            </motion.div>
          </div>

          {/* Education Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-400 mb-3">Education</h3>
            {education.map((edu, index) => (
              <motion.div
                key={index}
                className="p-4 border border-blue-500/50 rounded-lg bg-[#1a2235] shadow-md space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-sm text-blue-300 mb-2">
                  Education #{index + 1}
                </div>
                <motion.input
                  type="text"
                  placeholder="Degree"
                  className="w-full p-3 border border-blue-500/40 rounded-lg bg-[#131a2b] text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={edu.degree}
                  onChange={(e) =>
                    handleEducationChange(index, "degree", e.target.value)
                  }
                />
                <motion.input
                  type="text"
                  placeholder="Institution"
                  className="w-full p-3 border border-blue-500/40 rounded-lg bg-[#131a2b] text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={edu.institution}
                  onChange={(e) =>
                    handleEducationChange(index, "institution", e.target.value)
                  }
                />
                <motion.input
                  type="text"
                  placeholder="Year of Completion"
                  className="w-full p-3 border border-blue-500/40 rounded-lg bg-[#131a2b] text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={edu.year}
                  onChange={(e) =>
                    handleEducationChange(index, "year", e.target.value)
                  }
                />
              </motion.div>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition py-2 px-3 rounded-lg hover:bg-blue-500/10"
              onClick={handleAddEducation}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add More Education
            </button>
          </div>

          {/* Experience Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-400 mb-3">Experience</h3>
            {experience.map((exp, index) => (
              <motion.div
                key={index}
                className="p-4 border border-blue-500/50 rounded-lg bg-[#1a2235] shadow-md space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-sm text-blue-300 mb-2">
                  Experience #{index + 1}
                </div>
                <motion.input
                  type="text"
                  placeholder="Role"
                  className="w-full p-3 border border-blue-500/40 rounded-lg bg-[#131a2b] text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={exp.role}
                  onChange={(e) =>
                    handleExperienceChange(index, "role", e.target.value)
                  }
                />
                <motion.input
                  type="text"
                  placeholder="Company"
                  className="w-full p-3 border border-blue-500/40 rounded-lg bg-[#131a2b] text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={exp.company}
                  onChange={(e) =>
                    handleExperienceChange(index, "company", e.target.value)
                  }
                />
                <motion.input
                  type="text"
                  placeholder="Duration"
                  className="w-full p-3 border border-blue-500/40 rounded-lg bg-[#131a2b] text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={exp.duration}
                  onChange={(e) =>
                    handleExperienceChange(index, "duration", e.target.value)
                  }
                />
              </motion.div>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition py-2 px-3 rounded-lg hover:bg-blue-500/10"
              onClick={handleAddExperience}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add More Experience
            </button>
          </div>

          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-lg hover:from-blue-600 hover:to-blue-800 transition shadow-lg flex items-center justify-center gap-2 font-bold text-lg mt-6"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                Save & Continue
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
