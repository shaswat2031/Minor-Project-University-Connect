import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchProfile = async () => {
      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        setError("Please login to view your profile");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching profile with token:", currentToken); // Debugging log
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        console.log("Profile data received:", response.data); // Debugging log
        setProfile(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err.response?.data?.message || err);
        setError(err.response?.data?.message || "Error fetching profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-gray-900 to-black text-white">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-gray-900 to-black text-red-500">{error}</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-gray-900 to-black text-white">No profile found. Please complete your profile setup.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-gray-900 to-black text-white">
      <div className="w-full max-w-3xl bg-[#131a2b] rounded-lg shadow-xl p-8 m-4">
        <h2 className="text-4xl font-bold mb-6 text-center text-blue-400">{profile.name}</h2>
        
        <div className="mb-8">
          <p className="text-gray-300 text-center">{profile.bio}</p>
        </div>

        {/* Education Section */}
        {profile.education && profile.education.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-center text-blue-400">Education</h3>
            <div className="space-y-4">
              {profile.education.map((edu, index) => (
                <div key={index} className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-300">{edu.degree}</h4>
                  <p className="text-gray-400">{edu.institution}</p>
                  <p className="text-gray-500">{edu.year}</p>
                </div>
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

        {/* Edit Profile Button */}
        <div className="text-center">
          <button
            onClick={() => navigate("/profile-setup", { state: { profile } })}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 w-full max-w-md"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
