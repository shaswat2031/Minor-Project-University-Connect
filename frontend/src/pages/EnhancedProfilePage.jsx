import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import EnhancedProfile from "../components/EnhancedProfile";
import ProfileBuilder from "../components/ProfileBuilder";

/**
 * Enhanced Profile Page Component
 * Displays user profile information with modern UI and improved user experience
 */
const EnhancedProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certificationsLoading, setCertificationsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editSection, setEditSection] = useState(null);
  
  const currentUserId = localStorage.getItem("userId");
  const isCurrentUser = id === currentUserId || !id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("You must be logged in to view profiles");
          setLoading(false);
          return;
        }
        
        // Determine which user ID to fetch
        const userId = id || currentUserId;
        
        if (!userId) {
          setError("User ID not found");
          setLoading(false);
          return;
        }
        
        // First try to get profile data
        try {
          const profileResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/profile/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          setProfile(profileResponse.data);
        } catch (profileErr) {
          console.error("Error fetching profile data:", profileErr);
          
          // If no profile found, try getting basic user data
          try {
            const userResponse = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/users/${userId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (userResponse.data) {
              // Create a minimal profile from user data
              setProfile({
                name: userResponse.data.name || userResponse.data.email,
                email: userResponse.data.email,
                user: userResponse.data,
                bio: "",
                skills: [],
                education: [],
                experience: [],
                projects: [],
                socialLinks: {},
              });
            }
          } catch (_) {
            setError("User not found");
          }
        }
        
        // Fetch certifications
        try {
          const certResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/certifications/user/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          setCertifications(certResponse.data.certifications || []);
        } catch (certErr) {
          console.error("Error fetching certifications:", certErr);
          setCertifications([]);
        } finally {
          setCertificationsLoading(false);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [id, currentUserId, navigate]);
  
  const handleEdit = () => {
    setEditing(true);
  };
  
  const handleCancelEdit = () => {
    setEditing(false);
    setEditSection(null);
  };
  
  const handleSaveProfile = async (updatedProfile) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/profile/update`,
        updatedProfile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProfile(response.data);
      setEditing(false);
      setEditSection(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddSection = (section) => {
    setEditSection(section);
    setEditing(true);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/30 p-6 rounded-lg max-w-lg text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-lg">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }
  
  if (editing) {
    return (
      <div className="bg-gray-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h1 className="text-2xl font-bold text-white mb-6">
              {editSection ? `Edit ${editSection.charAt(0).toUpperCase() + editSection.slice(1)}` : "Edit Profile"}
            </h1>
            
            <ProfileBuilder
              profile={profile}
              initialSection={editSection}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
            />
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <EnhancedProfile
      profile={profile}
      certifications={certifications}
      isCurrentUser={isCurrentUser}
      onEdit={handleEdit}
      onAddSection={handleAddSection}
      certificationsLoading={certificationsLoading}
    />
  );
};

export default EnhancedProfilePage;
