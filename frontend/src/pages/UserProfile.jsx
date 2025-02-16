import React, { useEffect, useState } from "react";
import axios from "axios";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      console.error("User is not logged in");
      return;
    }

    axios
      .get("http://localhost:5000/api/students/me", { // <-- Fix API endpoint
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch((error) => console.error("Error fetching profile:", error));
  }, [token]);

  if (!profile) return <p className="text-center">No profile found. Please complete your profile setup.</p>;

  return (
    <div className="p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold">{profile.name}</h2>
      <p className="text-gray-600">{profile.bio}</p>
      <h3 className="font-bold mt-4">Skills</h3>
      <p>{profile.skills.join(", ")}</p>

      <h3 className="font-bold mt-4">Education</h3>
      {profile.education.length > 0 ? (
        <ul>
          {profile.education.map((edu, index) => (
            <li key={index} className="text-gray-600">
              {edu.degree} at {edu.institution} ({edu.year})
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No education details added</p>
      )}

      <h3 className="font-bold mt-4">Experience</h3>
      {profile.experience.length > 0 ? (
        <ul>
          {profile.experience.map((exp, index) => (
            <li key={index} className="text-gray-600">
              {exp.role} at {exp.company} ({exp.duration})
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No experience details added</p>
      )}
    </div>
  );
};

export default UserProfile;
