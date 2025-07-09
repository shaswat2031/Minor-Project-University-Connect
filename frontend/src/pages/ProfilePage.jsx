import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view this profile.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/students/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-white text-xl font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
        <div className="bg-[#1F2937] rounded-xl shadow-xl p-8 max-w-xl w-full text-center border-2 border-red-500 transform transition-all duration-300 hover:scale-105">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-2xl text-white font-bold mb-2">Error</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Process skills to ensure consistent format
  const processSkills = () => {
    if (!profile.skills) return [];

    if (typeof profile.skills === "string") {
      return profile.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    if (Array.isArray(profile.skills)) {
      return profile.skills
        .map((skill) =>
          typeof skill === "string" ? skill.trim() : String(skill)
        )
        .filter(Boolean);
    }

    return [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1E3A8A] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1F2937] rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-blue-900/30 animate-fadeIn">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-blue-900 to-indigo-900 p-8">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                  {profile?.name}
                </h2>
                <p className="text-blue-200 text-lg italic flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {profile?.email}
                </p>
              </div>
              {profile?.isVerified && (
                <div className="mt-4 md:mt-0 bg-green-900/30 py-2 px-4 rounded-full border border-green-500 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-400 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-green-300 font-medium">
                    Verified Profile
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 md:p-8 space-y-8">
            {/* Bio Section */}
            {profile?.bio && (
              <div className="animate-fadeIn delay-100">
                <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  About Me
                </h3>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Education Section */}
            {profile?.education &&
              Array.isArray(profile.education) &&
              profile.education.length > 0 && (
                <div className="animate-fadeIn delay-200">
                  <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                      />
                    </svg>
                    Education
                  </h3>
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <div
                        key={edu._id || index}
                        className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
                      >
                        <h4 className="text-lg font-semibold text-blue-300 mb-1">
                          {edu.degree || "Degree not specified"}
                        </h4>
                        <p className="text-gray-300 mb-1">
                          {edu.institution || "Institution not specified"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {edu.year || "Year not specified"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Skills Section */}
            {processSkills().length > 0 && (
              <div className="animate-fadeIn delay-300">
                <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {processSkills().map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Sections - Only shown if data exists */}
            {profile?.projects && (
              <div className="animate-fadeIn delay-400">
                <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  Projects
                </h3>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-300">{profile.projects}</p>
                </div>
              </div>
            )}

            {/* Contact Button - Optional */}
            <div className="pt-4 flex justify-center animate-fadeIn delay-500">
              <button
                onClick={() =>
                  (window.location.href = `mailto:${profile?.email}`)
                }
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Contact {profile?.name.split(" ")[0]}
              </button>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.history.back()}
            className="text-blue-300 hover:text-blue-100 transition-colors flex items-center mx-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to profiles
          </button>
        </div>
      </div>

      {/* Add animation CSS - this should be in a global stylesheet */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
