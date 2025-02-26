import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const StudentConnect = () => {
  const [students, setStudents] = useState([]);
  const [profileExists, setProfileExists] = useState(false);
  const token = localStorage.getItem("token");

  // Mock data for team members
  const teamMembers = [
    {
      _id: "1",
      name: "Harshita Mutha",
      profileImage: "https://i.pravatar.cc/150?img=1",
      role: "Reports Documentation & DataBase Manager",
      description:
        "Ensures seamless user experience through intuitive designs and structured documentation.",
      skills: ["Documentation", "UI/UX", "Accessibility"],
      linkedin: "https://www.linkedin.com/in/harshita-mutha",
    },
    {
      _id: "2",
      name: "Sugam Bhardwaj",
      profileImage: "https://i.pravatar.cc/150?img=2",
      role: "UI/UX Designer",
      description:
        "Creative force behind the platform's visual identity, focusing on user-centric designs.",
      skills: ["UI/UX Design", "Typography", "Color Theory"],
      linkedin: "https://www.linkedin.com/in/sugam-bhardwaj",
    },
    {
      _id: "3",
      name: "Vansh Patel",
      profileImage: "https://i.pravatar.cc/150?img=3",
      role: "Backend Developer & Project Leader",
      description:
        "Ensures smooth API communication, database management, and robust server-side functionality.",
      skills: ["Backend", "API", "Database"],
      linkedin: "https://www.linkedin.com/in/vansh-patel",
    },
    {
      _id: "4",
      name: "Shaswat Prasad",
      profileImage: "https://i.pravatar.cc/150?img=4",
      role: "Frontend Developer",
      description:
        "Specializes in developing engaging and dynamic user interfaces for seamless user experiences.",
      skills: ["Frontend", "React", "Responsive Design"],
      linkedin: "https://www.linkedin.com/in/shaswat-prasad",
    },
  ];

  // Mock data for 20 random students
  const mockStudents = Array.from({ length: 20 }, (_, i) => ({
    _id: `${i + 5}`,
    name: `Student ${i + 1}`,
    profileImage: `https://i.pravatar.cc/150?img=${i + 10}`, // Random avatars
    role: "Student",
    description:
      "Passionate about learning and contributing to innovative projects.",
    skills: ["React", "Node.js", "JavaScript", "Python", "UI/UX", "Backend"],
  }));

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
        // Simulate API call with mock data
        setStudents([...teamMembers, ...mockStudents]);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchProfile();
    fetchStudents();
  }, [token]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-4xl font-bold mb-8 text-center text-blue-400 animate-fade-in">
        Student Connect
      </h2>

      {!profileExists && (
        <div className="text-center mb-8 animate-fade-in">
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
            className="p-6 bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 animate-fade-in-up group"
          >
            <img
              src={student.profileImage || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-400"
            />
            <h3 className="text-xl font-bold text-center text-blue-400">
              {student.name}
            </h3>
            {student.role && (
              <p className="text-sm text-gray-400 text-center mb-2">
                {student.role}
              </p>
            )}
            {student.description && (
              <p className="text-sm text-gray-300 text-center mb-4">
                {student.description}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {student.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-700 text-sm text-gray-300 rounded-full hover:bg-blue-600 hover:text-white transition duration-300 cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="text-center">
              {student.linkedin ? (
                <a
                  href={student.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Connect on LinkedIn
                </a>
              ) : (
                <Link
                  to={`/profile/${student._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  View Profile
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentConnect;