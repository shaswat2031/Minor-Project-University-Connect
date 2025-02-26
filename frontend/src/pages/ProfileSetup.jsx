// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const ProfileSetup = () => {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const [name, setName] = useState("");
//   const [skills, setSkills] = useState("");
//   const [bio, setBio] = useState("");
//   const [education, setEducation] = useState([{ degree: "", institution: "", year: "" }]);
//   const [experience, setExperience] = useState([{ role: "", company: "", duration: "" }]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!token) {
//       alert("You need to be logged in!");
//       navigate("/login");
//     }
//   }, [token, navigate]);

//   const handleAddEducation = () => {
//     setEducation([...education, { degree: "", institution: "", year: "" }]);
//   };

//   const handleAddExperience = () => {
//     setExperience([...experience, { role: "", company: "", duration: "" }]);
//   };

//   const handleEducationChange = (index, key, value) => {
//     const updatedEducation = [...education];
//     updatedEducation[index][key] = value;
//     setEducation(updatedEducation);
//   };

//   const handleExperienceChange = (index, key, value) => {
//     const updatedExperience = [...experience];
//     updatedExperience[index][key] = value;
//     setExperience(updatedExperience);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
  
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         alert("You need to be logged in!");
//         navigate("/login");
//         return;
//       }
  
//       const response = await axios.post(
//         "http://localhost:5000/api/profile/setup",
//         { name, bio, skills, education, experience },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
  
//       console.log("Profile setup success:", response.data);
//       navigate("/profile");
//     } catch (error) {
//       console.error("Error saving profile:", error.response?.data || error);
//       alert(error.response?.data?.message || "Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };
  
  

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100">
//       <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
//         <h2 className="text-2xl font-bold mb-4 text-center">Set Up Your Profile</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Basic Details */}
//           <input
//             type="text"
//             placeholder="Name"
//             className="w-full p-2 border rounded"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//           />
//           <input
//             type="text"
//             placeholder="Skills (comma-separated)"
//             className="w-full p-2 border rounded"
//             value={skills}
//             onChange={(e) => setSkills(e.target.value)}
//             required
//           />
//           <textarea
//             placeholder="Bio"
//             className="w-full p-2 border rounded"
//             value={bio}
//             onChange={(e) => setBio(e.target.value)}
//             required
//           />

//           {/* Education Section */}
//           <h3 className="font-bold">Education</h3>
//           {education.map((edu, index) => (
//             <div key={index} className="space-y-2">
//               <input
//                 type="text"
//                 placeholder="Degree"
//                 className="w-full p-2 border rounded"
//                 value={edu.degree}
//                 onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
//                 required
//               />
//               <input
//                 type="text"
//                 placeholder="Institution"
//                 className="w-full p-2 border rounded"
//                 value={edu.institution}
//                 onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
//                 required
//               />
//               <input
//                 type="text"
//                 placeholder="Year of Completion"
//                 className="w-full p-2 border rounded"
//                 value={edu.year}
//                 onChange={(e) => handleEducationChange(index, "year", e.target.value)}
//                 required
//               />
//             </div>
//           ))}
//           <button type="button" className="text-blue-500" onClick={handleAddEducation}>
//             + Add More Education
//           </button>

//           {/* Experience Section */}
//           <h3 className="font-bold">Experience</h3>
//           {experience.map((exp, index) => (
//             <div key={index} className="space-y-2">
//               <input
//                 type="text"
//                 placeholder="Role"
//                 className="w-full p-2 border rounded"
//                 value={exp.role}
//                 onChange={(e) => handleExperienceChange(index, "role", e.target.value)}
//                 required
//               />
//               <input
//                 type="text"
//                 placeholder="Company"
//                 className="w-full p-2 border rounded"
//                 value={exp.company}
//                 onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
//                 required
//               />
//               <input
//                 type="text"
//                 placeholder="Duration"
//                 className="w-full p-2 border rounded"
//                 value={exp.duration}
//                 onChange={(e) => handleExperienceChange(index, "duration", e.target.value)}
//                 required
//               />
//             </div>
//           ))}
//           <button type="button" className="text-blue-500" onClick={handleAddExperience}>
//             + Add More Experience
//           </button>

//           <button
//             type="submit"
//             className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
//             disabled={loading}
//           >
//             {loading ? "Saving..." : "Save & Continue"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ProfileSetup;


