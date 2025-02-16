import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const StudentConnect = () => {
  const [students, setStudents] = useState([]);
  const [profileExists, setProfileExists] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
  
      try {
        const response = await axios.get("http://localhost:5000/api/students/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileExists(true);
      } catch (error) {
        setProfileExists(false);
      }
    };
  
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/students");
        setStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
  
    fetchProfile();
    fetchStudents();
  }, [token]); // ✅ Correct dependency array
  

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Student Connect</h2>

      {!profileExists && (
        <Link
          to="/profile-setup"
          className="px-4 py-2 bg-blue-500 text-white rounded mb-4 inline-block"
        >
          Complete Your Profile
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <div key={student._id} className="p-4 border rounded shadow">
            <img
              src={student.profileImage || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-16 h-16 rounded-full mx-auto mb-2"
            />
            <h3 className="text-lg font-bold">{student.name}</h3>
            <p className="text-sm text-gray-600">{student.skills.join(", ")}</p>
            <Link to={`/profile/${student._id}`} className="text-blue-500 mt-2 inline-block">
              View Profile
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentConnect;
