import { useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaCode,
  FaCamera,
  FaEdit,
  FaPlus,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaInstagram,
  FaGlobe,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaDownload,
  FaCertificate,
  FaEnvelope,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import CertificationBadge from "./CertificationBadge";

/**
 * Enhanced Profile Component
 * A modern, responsive profile display with edit capabilities
 */
const EnhancedProfile = ({
  profile,
  certifications = [],
  isCurrentUser = false,
  onEdit,
  onAddSection,
  certificationsLoading = false,
}) => {
  const [activeSection, setActiveSection] = useState("all");
  const [expandedSections, setExpandedSections] = useState({
    education: true,
    experience: true,
    projects: true,
    certifications: true,
    socialLinks: true,
  });

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    
    const sections = [
      !!profile.name,
      !!profile.bio,
      profile.education && profile.education.length > 0,
      profile.experience && profile.experience.length > 0,
      profile.projects && profile.projects.length > 0,
      profile.skills && profile.skills.length > 0,
      !!profile.profileImage,
      profile.socialLinks && Object.values(profile.socialLinks).some(link => !!link),
    ];
    
    const completedSections = sections.filter(Boolean).length;
    return Math.round((completedSections / sections.length) * 100);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const completion = calculateProfileCompletion();

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-64 bg-gradient-to-r from-purple-900 to-blue-900 relative">
          {profile.coverImage ? (
            <img
              src={profile.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : null}
          
          {isCurrentUser && (
            <button className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-70 p-2 rounded-full text-white hover:bg-opacity-100 transition">
              <FaCamera size={18} />
            </button>
          )}
        </div>

        {/* Profile Image and Basic Info */}
        <div className="px-6 md:px-12 lg:px-20 relative -mt-20 pb-6">
          <div className="flex flex-col md:flex-row">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-800">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-900">
                    <FaUser size={48} className="text-white" />
                  </div>
                )}
              </div>
              
              {isCurrentUser && (
                <button className="absolute bottom-1 right-1 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700 transition">
                  <FaCamera size={14} />
                </button>
              )}
            </div>

            {/* Name and Bio */}
            <div className="mt-4 md:mt-6 md:ml-6 flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  {profile.location && (
                    <div className="flex items-center mt-1 text-gray-300">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
                
                {isCurrentUser && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onEdit}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center mt-4 md:mt-0"
                  >
                    <FaEdit className="mr-2" /> Edit Profile
                  </motion.button>
                )}
              </div>

              {profile.bio && (
                <p className="mt-4 text-gray-300 max-w-3xl">{profile.bio}</p>
              )}

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation for Mobile */}
      <div className="bg-gray-800 px-6 py-3 sticky top-0 z-10 md:hidden">
        <select 
          value={activeSection}
          onChange={(e) => setActiveSection(e.target.value)}
          className="bg-gray-700 text-white rounded-lg p-2 w-full"
        >
          <option value="all">All Sections</option>
          <option value="education">Education</option>
          <option value="experience">Experience</option>
          <option value="projects">Projects</option>
          <option value="certifications">Certifications</option>
          <option value="basicInfo">Basic Info</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-12 lg:px-20 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column (2/3 width on desktop) */}
          <div className="md:col-span-2">
            {/* Education Section */}
            {(activeSection === "all" || activeSection === "education") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-xl p-6 mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FaGraduationCap className="text-purple-500 mr-3" size={20} />
                    <h2 className="text-xl font-bold">Education</h2>
                  </div>
                  <div className="flex items-center">
                    {isCurrentUser && (
                      <button 
                        onClick={() => onAddSection && onAddSection("education")}
                        className="text-purple-400 hover:text-purple-300 mr-3"
                      >
                        <FaPlus size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => toggleSection("education")}
                      className="text-gray-400 hover:text-white"
                    >
                      {expandedSections.education ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                </div>

                {expandedSections.education && (
                  <AnimatePresence>
                    {profile.education && profile.education.length > 0 ? (
                      <div className="space-y-6">
                        {profile.education.map((edu, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-l-2 border-purple-600 pl-4 py-1"
                          >
                            <h3 className="font-semibold text-lg">
                              {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                            </h3>
                            <div className="text-gray-300">{edu.institution}</div>
                            <div className="text-gray-400 text-sm flex items-center mt-1">
                              <FaCalendarAlt className="mr-2" size={12} />
                              {edu.startYear} - {edu.current ? "Present" : edu.endYear}
                            </div>
                            {edu.grade && (
                              <div className="mt-1 text-gray-300">Grade: {edu.grade}</div>
                            )}
                            {edu.description && (
                              <p className="mt-2 text-gray-400">{edu.description}</p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 py-4 italic text-center">
                        No education information added yet
                        {isCurrentUser && (
                          <button
                            onClick={() => onAddSection && onAddSection("education")}
                            className="text-purple-400 hover:text-purple-300 ml-2 underline"
                          >
                            Add education
                          </button>
                        )}
                      </div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            )}

            {/* Experience Section */}
            {(activeSection === "all" || activeSection === "experience") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800 rounded-xl p-6 mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FaBriefcase className="text-purple-500 mr-3" size={20} />
                    <h2 className="text-xl font-bold">Experience</h2>
                  </div>
                  <div className="flex items-center">
                    {isCurrentUser && (
                      <button 
                        onClick={() => onAddSection && onAddSection("experience")}
                        className="text-purple-400 hover:text-purple-300 mr-3"
                      >
                        <FaPlus size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => toggleSection("experience")}
                      className="text-gray-400 hover:text-white"
                    >
                      {expandedSections.experience ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                </div>

                {expandedSections.experience && (
                  <AnimatePresence>
                    {profile.experience && profile.experience.length > 0 ? (
                      <div className="space-y-6">
                        {profile.experience.map((exp, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-l-2 border-purple-600 pl-4 py-1"
                          >
                            <h3 className="font-semibold text-lg">{exp.title}</h3>
                            <div className="text-gray-300">{exp.company}</div>
                            {exp.location && (
                              <div className="text-gray-400 flex items-center mt-1">
                                <FaMapMarkerAlt className="mr-2" size={12} />
                                {exp.location}
                              </div>
                            )}
                            <div className="text-gray-400 text-sm flex items-center mt-1">
                              <FaCalendarAlt className="mr-2" size={12} />
                              {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                            </div>
                            {exp.description && (
                              <p className="mt-2 text-gray-400">{exp.description}</p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 py-4 italic text-center">
                        No work experience added yet
                        {isCurrentUser && (
                          <button
                            onClick={() => onAddSection && onAddSection("experience")}
                            className="text-purple-400 hover:text-purple-300 ml-2 underline"
                          >
                            Add experience
                          </button>
                        )}
                      </div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            )}

            {/* Projects Section */}
            {(activeSection === "all" || activeSection === "projects") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 rounded-xl p-6 mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FaCode className="text-purple-500 mr-3" size={20} />
                    <h2 className="text-xl font-bold">Projects</h2>
                  </div>
                  <div className="flex items-center">
                    {isCurrentUser && (
                      <button 
                        onClick={() => onAddSection && onAddSection("projects")}
                        className="text-purple-400 hover:text-purple-300 mr-3"
                      >
                        <FaPlus size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => toggleSection("projects")}
                      className="text-gray-400 hover:text-white"
                    >
                      {expandedSections.projects ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                </div>

                {expandedSections.projects && (
                  <AnimatePresence>
                    {profile.projects && profile.projects.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {profile.projects.map((project, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-700/50 rounded-lg p-5 hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-lg">{project.title}</h3>
                              <div className="flex space-x-2">
                                {project.githubUrl && (
                                  <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 hover:text-white"
                                  >
                                    <FaGithub size={18} />
                                  </a>
                                )}
                                {project.liveUrl && (
                                  <a
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 hover:text-white"
                                  >
                                    <FaExternalLinkAlt size={16} />
                                  </a>
                                )}
                              </div>
                            </div>
                            
                            {project.description && (
                              <p className="mt-2 text-gray-300">{project.description}</p>
                            )}
                            
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {project.technologies.map((tech, techIndex) => (
                                  <span
                                    key={techIndex}
                                    className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {(project.startDate || project.endDate) && (
                              <div className="mt-3 text-gray-400 text-sm flex items-center">
                                <FaCalendarAlt className="mr-2" size={12} />
                                {project.startDate && project.startDate}
                                {project.startDate && project.endDate && " - "}
                                {project.endDate ? project.endDate : "Present"}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 py-4 italic text-center">
                        No projects added yet
                        {isCurrentUser && (
                          <button
                            onClick={() => onAddSection && onAddSection("projects")}
                            className="text-purple-400 hover:text-purple-300 ml-2 underline"
                          >
                            Add a project
                          </button>
                        )}
                      </div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            )}

            {/* Certifications Section */}
            {(activeSection === "all" || activeSection === "certifications") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800 rounded-xl p-6 mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FaCertificate className="text-purple-500 mr-3" size={20} />
                    <h2 className="text-xl font-bold">Certifications</h2>
                  </div>
                  <button 
                    onClick={() => toggleSection("certifications")}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.certifications ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>

                {expandedSections.certifications && (
                  <AnimatePresence>
                    {certificationsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                      </div>
                    ) : certifications && certifications.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {certifications.map((cert, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{cert.category}</h3>
                                <div className="text-gray-300 text-sm mt-1">
                                  {new Date(cert.completedAt).toLocaleDateString()}
                                </div>
                                <div className="mt-2">
                                  <CertificationBadge score={cert.score} />
                                </div>
                              </div>
                              {cert.certificateUrl && (
                                <a
                                  href={cert.certificateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300"
                                >
                                  <FaDownload size={18} />
                                </a>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 py-4 italic text-center">
                        No certifications earned yet
                        {isCurrentUser && (
                          <a
                            href="/certifications"
                            className="text-purple-400 hover:text-purple-300 ml-2 underline"
                          >
                            Take a certification test
                          </a>
                        )}
                      </div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column (1/3 width on desktop) */}
          <div className="md:col-span-1">
            {/* Basic Info Section */}
            {(activeSection === "all" || activeSection === "basicInfo") && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-xl p-6 mb-8"
                >
                  <h2 className="text-xl font-bold mb-4">Basic Info</h2>
                  
                  {profile.email && (
                    <div className="flex items-center mb-4">
                      <FaEnvelope className="text-purple-500 mr-3" size={16} />
                      <span className="text-gray-300">{profile.email}</span>
                    </div>
                  )}
                  
                  {profile.website && (
                    <div className="flex items-center mb-4">
                      <FaGlobe className="text-purple-500 mr-3" size={16} />
                      <a 
                        href={profile.website} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-purple-400 transition-colors"
                      >
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </motion.div>
                
                {/* Profile Completion */}
                {isCurrentUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-xl p-6 mb-8"
                  >
                    <h2 className="text-xl font-bold mb-4">Profile Completion</h2>
                    <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                      <div 
                        className="bg-purple-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${completion}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-gray-300">{completion}%</div>
                    
                    {completion < 100 && (
                      <div className="mt-4 text-sm text-gray-400">
                        Complete your profile to increase visibility and showcase your skills.
                      </div>
                    )}
                  </motion.div>
                )}
                
                {/* Social Links */}
                {profile.socialLinks && Object.values(profile.socialLinks).some(link => !!link) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-xl p-6 mb-8"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">Social Links</h2>
                      <button 
                        onClick={() => toggleSection("socialLinks")}
                        className="text-gray-400 hover:text-white"
                      >
                        {expandedSections.socialLinks ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>
                    
                    {expandedSections.socialLinks && (
                      <div className="space-y-4">
                        {profile.socialLinks.linkedin && (
                          <a
                            href={profile.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-300 hover:text-purple-400 transition-colors"
                          >
                            <FaLinkedin className="text-blue-500 mr-3" size={20} />
                            <span>LinkedIn</span>
                          </a>
                        )}
                        
                        {profile.socialLinks.github && (
                          <a
                            href={profile.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-300 hover:text-purple-400 transition-colors"
                          >
                            <FaGithub className="text-gray-400 mr-3" size={20} />
                            <span>GitHub</span>
                          </a>
                        )}
                        
                        {profile.socialLinks.twitter && (
                          <a
                            href={profile.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-300 hover:text-purple-400 transition-colors"
                          >
                            <FaTwitter className="text-blue-400 mr-3" size={20} />
                            <span>Twitter</span>
                          </a>
                        )}
                        
                        {profile.socialLinks.instagram && (
                          <a
                            href={profile.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-300 hover:text-purple-400 transition-colors"
                          >
                            <FaInstagram className="text-pink-500 mr-3" size={20} />
                            <span>Instagram</span>
                          </a>
                        )}
                        
                        {profile.socialLinks.portfolio && (
                          <a
                            href={profile.socialLinks.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-300 hover:text-purple-400 transition-colors"
                          >
                            <FaGlobe className="text-green-500 mr-3" size={20} />
                            <span>Portfolio</span>
                          </a>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
                
                {/* Photos/Gallery section could be added here */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-800 rounded-xl p-6 mb-8"
                >
                  <h2 className="text-xl font-bold mb-4">Photos</h2>
                  {profile.photos && profile.photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {profile.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 py-4 italic text-center">
                      No photos added yet
                      {isCurrentUser && (
                        <button
                          onClick={() => onAddSection && onAddSection("photos")}
                          className="text-purple-400 hover:text-purple-300 ml-2 underline"
                        >
                          Add photos
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

EnhancedProfile.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string,
    bio: PropTypes.string,
    location: PropTypes.string,
    email: PropTypes.string,
    website: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    education: PropTypes.arrayOf(
      PropTypes.shape({
        institution: PropTypes.string,
        degree: PropTypes.string,
        fieldOfStudy: PropTypes.string,
        startYear: PropTypes.string,
        endYear: PropTypes.string,
        grade: PropTypes.string,
        description: PropTypes.string,
        current: PropTypes.bool,
      })
    ),
    experience: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        company: PropTypes.string,
        location: PropTypes.string,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        description: PropTypes.string,
        current: PropTypes.bool,
      })
    ),
    projects: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        technologies: PropTypes.arrayOf(PropTypes.string),
        githubUrl: PropTypes.string,
        liveUrl: PropTypes.string,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        featured: PropTypes.bool,
      })
    ),
    socialLinks: PropTypes.shape({
      linkedin: PropTypes.string,
      github: PropTypes.string,
      twitter: PropTypes.string,
      instagram: PropTypes.string,
      portfolio: PropTypes.string,
    }),
    profileImage: PropTypes.string,
    coverImage: PropTypes.string,
    photos: PropTypes.arrayOf(PropTypes.string),
  }),
  certifications: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string,
      score: PropTypes.number,
      completedAt: PropTypes.string,
      certificateUrl: PropTypes.string,
    })
  ),
  isCurrentUser: PropTypes.bool,
  onEdit: PropTypes.func,
  onAddSection: PropTypes.func,
  certificationsLoading: PropTypes.bool,
};

export default EnhancedProfile;
