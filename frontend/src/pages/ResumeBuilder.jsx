import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useToast } from "../components/Toast";
import ResumePreview from "../components/Resume/ResumePreview";
import ResumeForm from "../components/Resume/ResumeForm";

const ResumeBuilder = () => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    summary: "",
    education: [],
    experience: [],
    skills: {
      technical: [],
      soft: [],
    },
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    interests: [],
  });
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch profile data and prefill resume
  useEffect(() => {
    // First try to load any saved resume
    try {
      const savedResume = localStorage.getItem("savedResume");
      const savedTemplate = localStorage.getItem("resumeTemplate");
      
      if (savedResume) {
        const parsedData = JSON.parse(savedResume);
        // Check if we have the new format (with data property) or old format
        if (parsedData.data) {
          setResumeData(parsedData.data);
        } else {
          setResumeData(parsedData);
        }
        
        if (savedTemplate) {
          setSelectedTemplate(savedTemplate);
        }
        
        setLoading(false);
        return; // If we have saved resume data, don't fetch profile
      }
    } catch (err) {
      console.error("Error loading saved resume:", err);
    }
    
    // If no saved resume, try to prefill from profile
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        
        // Prefill resume data from profile
        const profileData = res.data;
        setResumeData((prevData) => ({
          ...prevData,
          personalInfo: {
            name: profileData.name || "",
            email: profileData.user?.email || "",
            phone: profileData.phone || "",
            address: profileData.location || "",
            linkedin: profileData.socialLinks?.linkedin || "",
            github: profileData.socialLinks?.github || "",
            portfolio: profileData.socialLinks?.portfolio || "",
          },
          summary: profileData.bio || "",
          education: profileData.education?.map(edu => ({
            degree: edu.degree || "",
            institution: edu.institution || "",
            location: "",
            startDate: edu.startYear || "",
            endDate: edu.endYear || "",
            description: edu.description || "",
            gpa: edu.grade || "",
          })) || [],
          experience: profileData.experience?.map(exp => ({
            title: exp.title || "",
            company: exp.company || "",
            location: exp.location || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            description: exp.description || "",
            achievements: [],
          })) || [],
          skills: {
            technical: profileData.skills || [],
            soft: [],
          },
          projects: profileData.projects?.map(proj => ({
            title: proj.title || "",
            description: proj.description || "",
            technologies: proj.technologies || [],
            link: proj.githubUrl || proj.liveUrl || "",
            startDate: proj.startDate || "",
            endDate: proj.endDate || "",
          })) || [],
          certifications: profileData.certifications?.map(cert => ({
            title: cert.title || cert.category || "",
            issuer: cert.issuer || "",
            date: cert.issueDate || "",
            link: cert.credentialUrl || "",
          })) || [],
        }));
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile data:", err);
        error("Failed to load profile data");
        setLoading(false);
      });
  }, [error]);

  const handleChange = (section, field, value, index = null) => {
    setResumeData((prevData) => {
      const newData = { ...prevData };
      
      if (index !== null && Array.isArray(newData[section])) {
        // Handle array fields
        newData[section][index] = {
          ...newData[section][index],
          [field]: value
        };
      } else if (section === "personalInfo" || section === "skills") {
        // Handle nested objects
        newData[section] = {
          ...newData[section],
          [field]: value
        };
      } else {
        // Handle direct fields
        newData[section] = value;
      }
      
      return newData;
    });
  };

  const addItem = (section) => {
    setResumeData((prevData) => {
      const newData = { ...prevData };
      
      if (section === "education") {
        newData.education.push({
          degree: "",
          institution: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
          gpa: "",
        });
      } else if (section === "experience") {
        newData.experience.push({
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
          achievements: [],
        });
      } else if (section === "projects") {
        newData.projects.push({
          title: "",
          description: "",
          technologies: [],
          link: "",
          startDate: "",
          endDate: "",
        });
      } else if (section === "certifications") {
        newData.certifications.push({
          title: "",
          issuer: "",
          date: "",
          link: "",
        });
      } else if (section === "achievements") {
        newData.achievements.push("");
      } else if (section === "languages") {
        newData.languages.push({ language: "", proficiency: "" });
      } else if (section === "interests") {
        newData.interests.push("");
      }
      
      return newData;
    });
  };

  const removeItem = (section, index) => {
    setResumeData((prevData) => {
      const newData = { ...prevData };
      if (Array.isArray(newData[section])) {
        newData[section] = newData[section].filter((_, i) => i !== index);
      }
      return newData;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
        <div className="w-full lg:w-1/2">
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Resume Builder</h1>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <select 
                  className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="modern">Modern Template</option>
                  <option value="professional">Professional Template</option>
                  <option value="creative">Creative Template</option>
                  <option value="simple">Simple Template</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => setPreviewMode(!previewMode)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {previewMode ? "Edit Mode" : "Preview Mode"}
                </button>
              </div>
            </div>
            
            {!previewMode && (
              <ResumeForm 
                resumeData={resumeData}
                handleChange={handleChange}
                addItem={addItem}
                removeItem={removeItem}
              />
            )}
          </div>
        </div>
        
        <div className="w-full lg:w-1/2">
          <div className="sticky top-24">
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Resume Preview</h2>
              <div className="border border-gray-300 rounded-lg p-4 max-h-[800px] overflow-y-auto">
                <ResumePreview 
                  resumeData={resumeData} 
                  template={selectedTemplate}
                  onSaveSuccess={success}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResumeBuilder;
