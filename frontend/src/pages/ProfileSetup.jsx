import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import { motion } from "framer-motion";

const ProfileSetup = () => {
  const location = useLocation(); // Get location object
  const navigate = useNavigate(); // Initialize navigate
  const initialProfile = location.state?.profile || {}; // Get profile data from state
  const [name, setName] = useState(initialProfile.name || "");
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [skills, setSkills] = useState(initialProfile.skills || "");
  const [education, setEducation] = useState(initialProfile.education || [{ degree: "", institution: "", year: "" }]);
  const [linkedin, setLinkedin] = useState(initialProfile.linkedin || "");
  const [instagram, setInstagram] = useState(initialProfile.instagram || "");
  const [experience, setExperience] = useState([{ role: "", company: "", duration: "" }]);
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
        skills,
        linkedin,
        instagram,
      };
  
      // Include education only if it is filled
      if (education.some((edu) => edu.degree || edu.institution || edu.year)) {
        payload.education = education.filter((edu) => edu.degree || edu.institution || edu.year);
      }
  
      // Update the API endpoint to match the server routes
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/setup`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("Profile setup success:", response.data);
      navigate("/profile");
    } catch (error) {
      console.error("Error saving profile:", error.response?.data || error);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-gray-900 to-black text-white">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-[#131a2b] p-8 rounded-lg shadow-lg w-full max-w-3xl"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-400">Set Up Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <motion.input
            type="text"
            placeholder="Name"
            className="w-full p-3 border border-blue-500 rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <motion.textarea
            placeholder="Bio"
            className="w-full p-3 border border-blue-500 rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          />

          {/* Skills Section */}
          <div className="flex items-center">
            <motion.input
              type="text"
              placeholder="Skills (comma-separated)"
              className="w-full p-3 border border-blue-500 rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <span className="ml-2 text-blue-400 cursor-pointer">+</span> {/* Add "+" icon */}
          </div>

          {/* LinkedIn Section */}
          <div className="flex items-center">
            <motion.input
              type="text"
              placeholder="LinkedIn Profile URL"
              className="w-full p-3 border border-blue-500 rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
            <span className="ml-2 text-blue-400 cursor-pointer">+</span> {/* Add "+" icon */}
          </div>

          {/* Instagram Section */}
          <div className="flex items-center">
            <motion.input
              type="text"
              placeholder="Instagram Profile URL"
              className="w-full p-3 border border-blue-500 rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
            <span className="ml-2 text-blue-400 cursor-pointer">+</span> {/* Add "+" icon */}
          </div>

          {/* Education Section */}
          <h3 className="text-xl font-bold text-blue-400">Education</h3>
          {education.map((edu, index) => (
            <div key={index} className="space-y-3">
              <motion.input
                type="text"
                placeholder="Degree"
                className="w-full p-3 border border-blue-500 rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={edu.degree}
                onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
              />
              <motion.input
                type="text"
                placeholder="Institution"
                className="w-full p-3 border border-blue-500 rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={edu.institution}
                onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
              />
              <motion.input
                type="text"
                placeholder="Year of Completion"
                className="w-full p-3 border border-blue-500 rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={edu.year}
                onChange={(e) => handleEducationChange(index, "year", e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            className="text-blue-400 hover:text-blue-500 transition"
            onClick={handleAddEducation}
          >
            + Add More Education
          </button>

          <motion.button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;


