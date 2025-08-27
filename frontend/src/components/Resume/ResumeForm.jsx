import { useState } from "react";
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import React from 'react';
import PropTypes from 'prop-types';

const ResumeForm = ({ resumeData, handleChange, addItem, removeItem }) => {
  const [openSections, setOpenSections] = useState({
    personalInfo: true,
    summary: true,
    education: true,
    experience: true,
    skills: true,
    projects: true,
    certifications: true,
    achievements: false,
    languages: false,
    interests: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderSection = (title, section, isOpen, children) => (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="flex justify-between items-center bg-gray-50 p-4 cursor-pointer"
        onClick={() => toggleSection(section)}
      >
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div>
          {isOpen ? (
            <FaChevronUp className="text-gray-600" />
          ) : (
            <FaChevronDown className="text-gray-600" />
          )}
        </div>
      </div>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );

  return (
    <form className="space-y-6">
      {/* Personal Information Section */}
      {renderSection(
        "Personal Information",
        "personalInfo",
        openSections.personalInfo,
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={resumeData.personalInfo.name}
              onChange={(e) =>
                handleChange("personalInfo", "name", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={resumeData.personalInfo.email}
              onChange={(e) =>
                handleChange("personalInfo", "email", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={resumeData.personalInfo.phone}
              onChange={(e) =>
                handleChange("personalInfo", "phone", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={resumeData.personalInfo.address}
              onChange={(e) =>
                handleChange("personalInfo", "address", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              value={resumeData.personalInfo.linkedin}
              onChange={(e) =>
                handleChange("personalInfo", "linkedin", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub
            </label>
            <input
              type="url"
              value={resumeData.personalInfo.github}
              onChange={(e) =>
                handleChange("personalInfo", "github", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Portfolio Website
            </label>
            <input
              type="url"
              value={resumeData.personalInfo.portfolio}
              onChange={(e) =>
                handleChange("personalInfo", "portfolio", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Professional Summary Section */}
      {renderSection(
        "Professional Summary",
        "summary",
        openSections.summary,
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Summary
          </label>
          <textarea
            value={resumeData.summary}
            onChange={(e) => handleChange("summary", null, e.target.value)}
            rows="4"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="A brief summary of your professional background and goals..."
          ></textarea>
        </div>
      )}

      {/* Education Section */}
      {renderSection(
        "Education",
        "education",
        openSections.education,
        <div>
          {resumeData.education.map((edu, index) => (
            <div key={index} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-700">
                  Education #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeItem("education", index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) =>
                      handleChange("education", "degree", e.target.value, index)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) =>
                      handleChange(
                        "education",
                        "institution",
                        e.target.value,
                        index
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) =>
                      handleChange(
                        "education",
                        "location",
                        e.target.value,
                        index
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={edu.startDate}
                      onChange={(e) =>
                        handleChange(
                          "education",
                          "startDate",
                          e.target.value,
                          index
                        )
                      }
                      placeholder="MMM YYYY"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) =>
                        handleChange(
                          "education",
                          "endDate",
                          e.target.value,
                          index
                        )
                      }
                      placeholder="MMM YYYY or Present"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GPA
                  </label>
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) =>
                      handleChange("education", "gpa", e.target.value, index)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={edu.description}
                    onChange={(e) =>
                      handleChange(
                        "education",
                        "description",
                        e.target.value,
                        index
                      )
                    }
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("education")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaPlus className="mr-2" /> Add Education
          </button>
        </div>
      )}

      {/* Experience Section */}
      {renderSection(
        "Experience",
        "experience",
        openSections.experience,
        <div>
          {resumeData.experience.map((exp, index) => (
            <div key={index} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-700">
                  Experience #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeItem("experience", index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) =>
                      handleChange("experience", "title", e.target.value, index)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) =>
                      handleChange(
                        "experience",
                        "company",
                        e.target.value,
                        index
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) =>
                      handleChange(
                        "experience",
                        "location",
                        e.target.value,
                        index
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) =>
                        handleChange(
                          "experience",
                          "startDate",
                          e.target.value,
                          index
                        )
                      }
                      placeholder="MMM YYYY"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) =>
                        handleChange(
                          "experience",
                          "endDate",
                          e.target.value,
                          index
                        )
                      }
                      placeholder="MMM YYYY or Present"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={exp.description}
                    onChange={(e) =>
                      handleChange(
                        "experience",
                        "description",
                        e.target.value,
                        index
                      )
                    }
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your responsibilities and achievements..."
                  ></textarea>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("experience")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaPlus className="mr-2" /> Add Experience
          </button>
        </div>
      )}

      {/* Skills Section */}
      {renderSection(
        "Skills",
        "skills",
        openSections.skills,
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technical Skills
            </label>
            <textarea
              value={resumeData.skills.technical.join(", ")}
              onChange={(e) =>
                handleChange(
                  "skills",
                  "technical",
                  e.target.value.split(",").map((skill) => skill.trim())
                )
              }
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="JavaScript, React, Node.js, etc. (comma-separated)"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Soft Skills
            </label>
            <textarea
              value={resumeData.skills.soft.join(", ")}
              onChange={(e) =>
                handleChange(
                  "skills",
                  "soft",
                  e.target.value.split(",").map((skill) => skill.trim())
                )
              }
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Communication, Leadership, etc. (comma-separated)"
            ></textarea>
          </div>
        </div>
      )}

      {/* Projects Section */}
      {renderSection(
        "Projects",
        "projects",
        openSections.projects,
        <div>
          {resumeData.projects.map((project, index) => (
            <div key={index} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-700">
                  Project #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeItem("projects", index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) =>
                      handleChange("projects", "title", e.target.value, index)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link
                  </label>
                  <input
                    type="url"
                    value={project.link}
                    onChange={(e) =>
                      handleChange("projects", "link", e.target.value, index)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="GitHub or live project URL"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={project.startDate}
                      onChange={(e) =>
                        handleChange(
                          "projects",
                          "startDate",
                          e.target.value,
                          index
                        )
                      }
                      placeholder="MMM YYYY"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="text"
                      value={project.endDate}
                      onChange={(e) =>
                        handleChange(
                          "projects",
                          "endDate",
                          e.target.value,
                          index
                        )
                      }
                      placeholder="MMM YYYY or Ongoing"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technologies
                  </label>
                  <input
                    type="text"
                    value={project.technologies.join(", ")}
                    onChange={(e) =>
                      handleChange(
                        "projects",
                        "technologies",
                        e.target.value.split(",").map((tech) => tech.trim()),
                        index
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="React, Node.js, etc. (comma-separated)"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={project.description}
                    onChange={(e) =>
                      handleChange(
                        "projects",
                        "description",
                        e.target.value,
                        index
                      )
                    }
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the project, your role, and achievements..."
                  ></textarea>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("projects")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaPlus className="mr-2" /> Add Project
          </button>
        </div>
      )}

      {/* Certifications Section */}
      {renderSection(
        "Certifications",
        "certifications",
        openSections.certifications,
        <div>
          {resumeData.certifications.map((cert, index) => (
            <div key={index} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-700">
                  Certification #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeItem("certifications", index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certification Name
                  </label>
                  <input
                    type="text"
                    value={cert.title}
                    onChange={(e) =>
                      handleChange(
                        "certifications",
                        "title",
                        e.target.value,
                        index
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) =>
                      handleChange(
                        "certifications",
                        "issuer",
                        e.target.value,
                        index
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) =>
                      handleChange(
                        "certifications",
                        "date",
                        e.target.value,
                        index
                      )
                    }
                    placeholder="MMM YYYY"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link
                  </label>
                  <input
                    type="url"
                    value={cert.link}
                    onChange={(e) =>
                      handleChange(
                        "certifications",
                        "link",
                        e.target.value,
                        index
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="URL to credential (optional)"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("certifications")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaPlus className="mr-2" /> Add Certification
          </button>
        </div>
      )}

      {/* Achievements Section */}
      {renderSection(
        "Achievements",
        "achievements",
        openSections.achievements,
        <div>
          {resumeData.achievements.map((achievement, index) => (
            <div key={index} className="mb-4 flex items-center gap-2">
              <input
                type="text"
                value={achievement}
                onChange={(e) =>
                  handleChange("achievements", index, e.target.value, index)
                }
                className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your achievement..."
              />
              <button
                type="button"
                onClick={() => removeItem("achievements", index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("achievements")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaPlus className="mr-2" /> Add Achievement
          </button>
        </div>
      )}

      {/* Languages Section */}
      {renderSection(
        "Languages",
        "languages",
        openSections.languages,
        <div>
          {resumeData.languages.map((lang, index) => (
            <div key={index} className="mb-4 flex items-center gap-2">
              <input
                type="text"
                value={lang.language}
                onChange={(e) =>
                  handleChange("languages", "language", e.target.value, index)
                }
                className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Language"
              />
              <select
                value={lang.proficiency}
                onChange={(e) =>
                  handleChange(
                    "languages",
                    "proficiency",
                    e.target.value,
                    index
                  )
                }
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Proficiency</option>
                <option value="Native">Native</option>
                <option value="Fluent">Fluent</option>
                <option value="Proficient">Proficient</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Basic">Basic</option>
              </select>
              <button
                type="button"
                onClick={() => removeItem("languages", index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("languages")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaPlus className="mr-2" /> Add Language
          </button>
        </div>
      )}

      {/* Interests Section */}
      {renderSection(
        "Interests",
        "interests",
        openSections.interests,
        <div>
          {resumeData.interests.map((interest, index) => (
            <div key={index} className="mb-4 flex items-center gap-2">
              <input
                type="text"
                value={interest}
                onChange={(e) =>
                  handleChange("interests", index, e.target.value, index)
                }
                className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your interest..."
              />
              <button
                type="button"
                onClick={() => removeItem("interests", index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("interests")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaPlus className="mr-2" /> Add Interest
          </button>
        </div>
      )}
    </form>
  );
};
ResumeForm.propTypes = {
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
    summary: PropTypes.string,
    education: PropTypes.array,
    experience: PropTypes.array,
    skills: PropTypes.shape({
      technical: PropTypes.arrayOf(PropTypes.string),
      soft: PropTypes.arrayOf(PropTypes.string)
    }),
    projects: PropTypes.array,
    certifications: PropTypes.array,
    achievements: PropTypes.array,
    languages: PropTypes.array,
    interests: PropTypes.array
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  addItem: PropTypes.func.isRequired,
  removeItem: PropTypes.func.isRequired
};

export default ResumeForm;
