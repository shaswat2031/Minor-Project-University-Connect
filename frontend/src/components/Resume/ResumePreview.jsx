import { useState, useRef, useEffect } from "react";
import { FaDownload, FaSave, FaExclamationTriangle, FaFilePdf, FaFileAlt } from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React from "react";
import axios from "axios";
import { generatePDFWithFallback, generatePDFFromSVG, exportToHTML } from "./ResumeExport";
import ResumeContainer from "./ResumeContainer";
import PropTypes from 'prop-types';

const ResumePreview = ({ resumeData, template = "modern", onSaveSuccess }) => {
  ResumePreview.propTypes = {
    resumeData: PropTypes.shape({
      personalInfo: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
        address: PropTypes.string,
        linkedin: PropTypes.string,
        github: PropTypes.string,
        portfolio: PropTypes.string
      }),
    }).isRequired,
    template: PropTypes.string,
    onSaveSuccess: PropTypes.func
  };

  const resumeRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token");

  // Function to save the resume to the backend
  const saveResume = async () => {
    if (!token) {
      setErrorMessage("You must be logged in to save your resume");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setSaving(true);
    setErrorMessage("");
    
    try {
      // Create a resume object to save
      const resumeToSave = {
        data: resumeData,
        template: template,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // Save to localStorage as a backup
      localStorage.setItem("savedResume", JSON.stringify(resumeToSave));
      
      // If you want to save to backend, uncomment and implement endpoint
      /*
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/profile/save-resume`, 
        resumeToSave,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      */
      
      // Show success message (use the callback if provided)
      if (onSaveSuccess && typeof onSaveSuccess === 'function') {
        onSaveSuccess("Resume saved successfully!");
      }
    } catch (err) {
      console.error("Error saving resume:", err);
      setErrorMessage("Failed to save resume. Please try again.");
    } finally {
      setSaving(false);
      // Auto-clear error message after 3 seconds
      if (errorMessage) {
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  // Function to download the resume as PDF
  const downloadAsPDF = async () => {
    if (!resumeRef.current) {
      setErrorMessage("Resume content not found. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setDownloading(true);
    setErrorMessage("");
    
    try {
      // Save the current resume data to localStorage first as a backup
      saveResume();
      
      const resumeElement = resumeRef.current;
      const safeName = resumeData.personalInfo.name ? 
        resumeData.personalInfo.name.replace(/[^a-z0-9]/gi, '_') : 
        "Resume";
      const fileName = `${safeName}_${template}_${new Date().toISOString().slice(0, 10)}.pdf`;
      
      // Try different PDF generation methods in sequence
      
      // Method 1: Standard approach with html2canvas and jsPDF
      try {
        console.log("Trying standard PDF generation method");
        
        const canvas = await html2canvas(resumeElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: true,
          backgroundColor: "#ffffff",
          imageTimeout: 15000,
        });
        
        const imgData = canvas.toDataURL("image/png", 1.0);
        
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        
        const scaledWidth = imgWidth * ratio;
        const scaledHeight = imgHeight * ratio;
        
        const x = (pdfWidth - scaledWidth) / 2;
        const y = 0;
        
        pdf.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight);
        pdf.save(fileName);
        
        if (onSaveSuccess) {
          onSaveSuccess("Resume downloaded successfully!");
        }
        
        setDownloading(false);
        return; // Exit if successful
      } catch (err) {
        console.error("Standard PDF generation failed, trying fallback method:", err);
      }
      
      // Method 2: Fallback approach with alternative render settings
      try {
        console.log("Trying fallback PDF generation method");
        const success = await generatePDFWithFallback(resumeElement, fileName, { scale: 1.5 });
        
        if (success) {
          if (onSaveSuccess) {
            onSaveSuccess("Resume downloaded successfully using fallback method!");
          }
          setDownloading(false);
          return; // Exit if successful
        }
      } catch (err) {
        console.error("Fallback PDF generation failed, trying SVG method:", err);
      }
      
      // Method 3: SVG-based approach as a final attempt
      try {
        console.log("Trying SVG-based PDF generation method");
        const success = await generatePDFFromSVG(resumeElement, fileName);
        
        if (success) {
          if (onSaveSuccess) {
            onSaveSuccess("Resume downloaded successfully using SVG method!");
          }
          setDownloading(false);
          return; // Exit if successful
        }
      } catch (err) {
        console.error("All PDF generation methods failed:", err);
        // Show error message and the HTML export button will appear as fallback
        throw new Error("All PDF generation methods failed");
      }
      
    } catch (err) {
      console.error("Error generating PDF:", err);
      setErrorMessage("Failed to download resume. Please try the HTML export option as a fallback.");
    } finally {
      setDownloading(false);
    }
  };

  // Select template components based on chosen template
  const renderTemplate = () => {
    switch (template) {
      case "professional":
        return <ProfessionalTemplate resumeData={resumeData} />;
      case "creative":
        return <CreativeTemplate resumeData={resumeData} />;
      case "simple":
        return <SimpleTemplate resumeData={resumeData} />;
      case "modern":
      default:
        return <ModernTemplate resumeData={resumeData} />;
    }
  };

  return (
    <div className="relative">
      {/* Error Message */}
      {errorMessage && (
        <div className="absolute -top-10 left-0 right-0 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md flex items-center text-sm">
          <FaExclamationTriangle className="mr-2" />
          {errorMessage}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="absolute -top-4 -right-4 z-10 flex space-x-2">
        {/* Save Button */}
        <button
          onClick={saveResume}
          disabled={saving}
          className="bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-700 transition-colors"
          title="Save Resume"
        >
          <FaSave />
          {saving && <span className="animate-pulse">...</span>}
        </button>
        
        {/* Download Button */}
        <button
          onClick={downloadAsPDF}
          disabled={downloading}
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Download as PDF"
        >
          <FaDownload />
          {downloading && <span className="animate-pulse">...</span>}
        </button>
        
        {/* HTML Export Button (always available as an alternative) */}
        <button
          onClick={() => {
            try {
              const fileName = `${resumeData.personalInfo.name ? resumeData.personalInfo.name.replace(/[^a-z0-9]/gi, '_') : 'Resume'}_${template}_${new Date().toISOString().slice(0, 10)}`;
              exportToHTML(resumeRef.current, `${fileName}.html`);
              if (onSaveSuccess) onSaveSuccess("Resume exported as HTML. Use browser's print function to save as PDF.");
            } catch (err) {
              console.error("Error exporting HTML:", err);
              setErrorMessage("Failed to export as HTML. Please try again.");
            }
          }}
          className="bg-yellow-600 text-white p-2 rounded-full shadow-lg hover:bg-yellow-700 transition-colors"
          title="Export as HTML (can be printed to PDF)"
        >
          <FaFileAlt />
        </button>
      </div>
      
      <div 
        ref={resumeRef} 
        className="resume-preview bg-white shadow-inner w-full"
        style={{ 
          minHeight: '1100px',  // Approximate A4 height
          width: '100%',
          maxWidth: '800px',    // Approximate A4 width
          margin: '0 auto',
          overflow: 'hidden',
          position: 'relative',
          breakInside: 'avoid'
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  );
};

// Modern Template Component
const ModernTemplate = ({ resumeData }) => {
  ModernTemplate.propTypes = {
    resumeData: PropTypes.object.isRequired
  };
  
  return (
    <ResumeContainer>
      <div className="p-8 text-gray-800 font-sans" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header with name and contact info */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">
            {resumeData.personalInfo.name || "Your Name"}
          </h1>
          <div className="flex flex-wrap text-sm gap-x-4 gap-y-1 text-gray-600">
            {resumeData.personalInfo.email && (
              <div>{resumeData.personalInfo.email}</div>
            )}
            {resumeData.personalInfo.phone && (
              <div>{resumeData.personalInfo.phone}</div>
            )}
            {resumeData.personalInfo.address && (
              <div>{resumeData.personalInfo.address}</div>
            )}
          </div>
          <div className="flex flex-wrap text-sm gap-x-4 gap-y-1 text-blue-600 mt-1">
            {resumeData.personalInfo.linkedin && (
              <span className="text-blue-600">LinkedIn</span>
            )}
            {resumeData.personalInfo.github && (
              <span className="text-blue-600">GitHub</span>
            )}
            {resumeData.personalInfo.portfolio && (
              <span className="text-blue-600">Portfolio</span>
            )}
          </div>
        </header>

      {/* Summary Section */}
      {resumeData.summary && (
        <section className="mb-6">
          <h2 className="text-xl font-bold border-b-2 border-blue-700 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-sm text-gray-700">{resumeData.summary}</p>
        </section>
      )}

      {/* Skills Section */}
      {(resumeData.skills.technical.length > 0 || resumeData.skills.soft.length > 0) && (
        <section className="mb-6">
          <h2 className="text-xl font-bold border-b-2 border-blue-700 pb-1 mb-2">
            Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumeData.skills.technical.length > 0 && (
              <div>
                <h3 className="text-md font-semibold mb-1">Technical Skills</h3>
                <p className="text-sm">
                  {resumeData.skills.technical.join(", ")}
                </p>
              </div>
            )}
            {resumeData.skills.soft.length > 0 && (
              <div>
                <h3 className="text-md font-semibold mb-1">Soft Skills</h3>
                <p className="text-sm">{resumeData.skills.soft.join(", ")}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Experience Section */}
      {resumeData.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold border-b-2 border-blue-700 pb-1 mb-2">
            Experience
          </h2>
          <div className="space-y-4">
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between">
                  <h3 className="text-md font-semibold">{exp.title}</h3>
                  <div className="text-sm text-gray-600">
                    {exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : ""}
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {exp.company}
                  {exp.location && `, ${exp.location}`}
                </div>
                <p className="text-sm mt-1">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education Section */}
      {resumeData.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold border-b-2 border-blue-700 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-4">
            {resumeData.education.map((edu, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between">
                  <h3 className="text-md font-semibold">{edu.degree}</h3>
                  <div className="text-sm text-gray-600">
                    {edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : ""}
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {edu.institution}
                  {edu.location && `, ${edu.location}`}
                </div>
                {edu.gpa && (
                  <div className="text-sm">GPA: {edu.gpa}</div>
                )}
                {edu.description && (
                  <p className="text-sm mt-1">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {resumeData.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold border-b-2 border-blue-700 pb-1 mb-2">
            Projects
          </h2>
          <div className="space-y-4">
            {resumeData.projects.map((project, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between">
                  <h3 className="text-md font-semibold">
                    {project.title}
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-sm text-blue-600"
                      >
                        (Link)
                      </a>
                    )}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {project.startDate && project.endDate ? `${project.startDate} - ${project.endDate}` : ""}
                  </div>
                </div>
                {project.technologies.length > 0 && (
                  <div className="text-sm font-medium">
                    {project.technologies.join(", ")}
                  </div>
                )}
                <p className="text-sm mt-1">{project.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {resumeData.certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold border-b-2 border-blue-700 pb-1 mb-2">
            Certifications
          </h2>
          <div className="space-y-2">
            {resumeData.certifications.map((cert, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{cert.title}</span>
                {cert.issuer && ` - ${cert.issuer}`}
                {cert.date && ` (${cert.date})`}
                {cert.link && (
                  <a
                    href={cert.link}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1 text-blue-600"
                  >
                    [Verify]
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Additional Sections */}
      {resumeData.achievements.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold border-b-2 border-blue-700 pb-1 mb-2">
            Achievements
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            {resumeData.achievements.map((achievement, index) => (
              <li key={index} className="text-sm">
                {achievement}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resumeData.languages.length > 0 && (
          <section>
            <h2 className="text-xl font-bold border-b-2 border-blue-700 pb-1 mb-2">
              Languages
            </h2>
            <ul className="space-y-1">
              {resumeData.languages.map((lang, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{lang.language}</span>
                  {lang.proficiency && ` - ${lang.proficiency}`}
                </li>
              ))}
            </ul>
          </section>
        )}

        {resumeData.interests.length > 0 && (
          <section>
            <h2 className="text-xl font-bold border-b-2 border-blue-700 pb-1 mb-2">
              Interests
            </h2>
            <p className="text-sm">{resumeData.interests.join(", ")}</p>
          </section>
        )}
      </div>
    </div>
    </ResumeContainer>
  );
};

// Professional Template Component
const ProfessionalTemplate = ({ resumeData }) => {
  ProfessionalTemplate.propTypes = {
    resumeData: PropTypes.object.isRequired
  };
  
  return (
    <div className="p-8 a4-page bg-white text-gray-800 font-serif">
      {/* Header with name and contact info */}
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {resumeData.personalInfo.name || "Your Name"}
        </h1>
        <div className="flex flex-wrap justify-center text-sm gap-x-4 gap-y-1 text-gray-700">
          {resumeData.personalInfo.email && (
            <div>{resumeData.personalInfo.email}</div>
          )}
          {resumeData.personalInfo.phone && (
            <div>{resumeData.personalInfo.phone}</div>
          )}
          {resumeData.personalInfo.address && (
            <div>{resumeData.personalInfo.address}</div>
          )}
        </div>
        <div className="flex flex-wrap justify-center text-sm gap-x-4 gap-y-1 text-gray-700 mt-1">
          {resumeData.personalInfo.linkedin && (
            <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          )}
          {resumeData.personalInfo.github && (
            <a href={resumeData.personalInfo.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
          {resumeData.personalInfo.portfolio && (
            <a href={resumeData.personalInfo.portfolio} target="_blank" rel="noreferrer">
              Portfolio
            </a>
          )}
        </div>
      </header>
      
      {/* The rest of the professional template follows the same pattern as modern but with different styling */}
      {/* For brevity, I'll only show the header differences. The rest of the sections would be similar */}
      <div className="text-center text-gray-500 italic">
        Professional resume content follows...
      </div>
    </div>
  );
};

// Simple Template Component
const SimpleTemplate = ({ resumeData }) => {
  SimpleTemplate.propTypes = {
    resumeData: PropTypes.object.isRequired
  };
  
  return (
    <div className="p-8 a4-page bg-white text-gray-800 font-sans">
      {/* Header with name and contact info */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {resumeData.personalInfo.name || "Your Name"}
        </h1>
        <div className="text-sm text-gray-700">
          {resumeData.personalInfo.email && (
            <div>{resumeData.personalInfo.email}</div>
          )}
          {resumeData.personalInfo.phone && (
            <div>{resumeData.personalInfo.phone}</div>
          )}
          {resumeData.personalInfo.address && (
            <div>{resumeData.personalInfo.address}</div>
          )}
        </div>
      </header>
      
      {/* The rest of the simple template would follow a minimalist design */}
      <div className="text-center text-gray-500 italic">
        Simple resume content follows...
      </div>
    </div>
  );
};

// Creative Template Component
const CreativeTemplate = ({ resumeData }) => {
  CreativeTemplate.propTypes = {
    resumeData: PropTypes.object.isRequired
  };
  
  return (
    <div className="p-8 a4-page bg-white text-gray-800 font-sans">
      {/* Header with name and contact info */}
      <header className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          {resumeData.personalInfo.name || "Your Name"}
        </h1>
        <div className="flex flex-wrap text-sm gap-x-4 gap-y-1 text-gray-700">
          {resumeData.personalInfo.email && (
            <div>{resumeData.personalInfo.email}</div>
          )}
          {resumeData.personalInfo.phone && (
            <div>{resumeData.personalInfo.phone}</div>
          )}
          {resumeData.personalInfo.address && (
            <div>{resumeData.personalInfo.address}</div>
          )}
        </div>
      </header>
      
      {/* The rest of the creative template would have more unique styling */}
      <div className="text-center text-gray-500 italic">
        Creative resume content follows...
      </div>
    </div>
  );
};

export default ResumePreview;
