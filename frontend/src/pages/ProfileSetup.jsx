import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileBuilder from "../components/ProfileBuilder";
import React from "react";

const ProfileSetup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialProfile = location.state?.profile || {};
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to be logged in!");
      navigate("/login");
      return;
    }

    // Fetch existing profile if not passed via state
    if (!location.state?.profile) {
      fetchExistingProfile();
    } else {
      setProfile(location.state.profile);
    }
  }, [navigate, location.state]);

  const fetchExistingProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        setProfile(response.data);
      }
    } catch (error) {
      console.log("No existing profile found, starting fresh");
      setProfile({});
    }
  };

  const handleSave = async (profileData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in!");
        navigate("/login");
        return;
      }

      // Ensure socialLinks is properly structured
      const processedData = {
        ...profileData,
        socialLinks: {
          linkedin: profileData.socialLinks?.linkedin || "",
          github: profileData.socialLinks?.github || "",
          instagram: profileData.socialLinks?.instagram || "",
          portfolio: profileData.socialLinks?.portfolio || "",
        },
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/setup`,
        processedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Profile setup success:", response.data);
      alert("Profile saved successfully!");
      navigate("/my-profile");
    } catch (error) {
      console.error("Error saving profile:", error.response?.data || error);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black">
        <div className="text-white text-xl">Saving profile...</div>
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <ProfileBuilder
      profile={profile}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

export default ProfileSetup;
