import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const StudentConnect = () => {
  const [students, setStudents] = useState([]);
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStudents = async () => {
      if (!token) return;

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Updated filtering logic to use the user field
        if (response.data && response.data.students && response.data.loggedInUserId) {
          const filteredStudents = response.data.students.filter(
            (student) => student.user !== response.data.loggedInUserId
          );
          console.log('Logged in user ID:', response.data.loggedInUserId);
          console.log('Filtered students:', filteredStudents);
          setStudents(filteredStudents);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileExists(!!response.data);
      } catch (error) {
        setProfileExists(false);
      }
    };

    fetchProfile();
    fetchStudents();
  }, [token]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-4xl font-bold mb-8 text-center text-blue-400">
        Student Connect
      </h2>

      {!profileExists && (
        <div className="text-center mb-8">
          <Link
            to="/profile-setup"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Complete Your Profile
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {students.map((student) => (
          <div
            key={student._id}
            className="p-6 bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-xl font-bold text-center text-blue-400 mb-4">
              {student.name}
            </h3>
            <p className="text-gray-300 text-center mb-4 line-clamp-3">
              {student.bio}
            </p>
            {student.skills && (
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {(typeof student.skills === 'string' 
                  ? student.skills.split(',') 
                  : Array.isArray(student.skills) 
                    ? student.skills 
                    : []
                ).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-sm text-gray-300 rounded-full"
                  >
                    {typeof skill === 'string' ? skill.trim() : skill}
                  </span>
                ))}
              </div>
            )}
            <div className="text-center space-y-2">
              <Link
                to={`/profile/${student._id}`}
                className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              >
                View Profile
              </Link>
              {student.linkedin && (
                <a
                  href={student.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition duration-300"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentConnect;