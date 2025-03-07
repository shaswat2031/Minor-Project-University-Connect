import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProfilePage = () => {
  const { id } = useParams(); // Get the dynamic ID from the URL
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve the token from localStorage
        if (!token) {
          setError("You must be logged in to view this profile.");
          setLoading(false);
          return;
        }
        
        // Updated API endpoint to match the backend route
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/students/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile(); // Call the function
  }, [id]);

  if (loading) return <div className="text-center p-6 text-white">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>;
  return (
    <div className="min-h-screen bg-[#111827] text-white p-8">
      <div className="max-w-3xl mx-auto bg-[#1F2937] rounded-xl shadow-xl p-8">
        <h2 className="text-4xl font-extrabold text-blue-400 mb-6">{profile.name}</h2>
        <p className="text-gray-300 mb-6">{profile.bio}</p>
        
        <h3 className="text-2xl font-bold text-blue-400 mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {(typeof profile.skills === 'string' 
            ? profile.skills.split(',') 
            : Array.isArray(profile.skills) 
              ? profile.skills 
              : []
          ).map((skill, index) => (
            <span key={index} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              {typeof skill === 'string' ? skill.trim() : skill}
            </span>
          ))}
        </div>
        {profile.linkedin && (
          <p className="mb-3">
            <strong className="text-blue-400">LinkedIn:</strong>{" "}
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition">
              {profile.linkedin}
            </a>
          </p>
        )}
        
        {profile.instagram && (
          <p className="mb-6">
            <strong className="text-blue-400">Instagram:</strong>{" "}
            <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition">
              {profile.instagram}
            </a>
          </p>
        )}
        {profile.education && profile.education.length > 0 && (
          <>
            <h3 className="text-2xl font-bold text-blue-400 mb-4">Education</h3>
            <ul className="space-y-3">
              {profile.education.map((edu, index) => (
                <li key={index} className="bg-[#374151] p-4 rounded-lg">
                  <span className="font-semibold">{edu.degree}</span>
                  <span className="text-gray-300"> - {edu.institution}</span>
                  <span className="text-blue-400"> ({edu.year})</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;