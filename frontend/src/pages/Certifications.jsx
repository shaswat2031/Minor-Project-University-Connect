import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';
import { FaExclamationTriangle, FaDownload, FaCode, FaPlay, FaQuestionCircle, FaCheck, FaTimes } from "react-icons/fa";
import axios from "axios";
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import {
  fetchUserProfile,
} from "../api/certification";
import { executeCodingTest, runAllTestCases } from "../api/codingService";
import jsPDF from "jspdf";
import Confetti from "react-confetti";
import CodeEditor from "../components/CodeEditor"; // Import our custom CodeEditor component

import ExamSecurity from '../components/ExamSecurity';

// Define styles for the certificate
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    width: '842pt',  // A4 landscape width
    height: '595pt'  // A4 landscape height
  },
  border: {
    position: 'absolute',
    top: 25,
    left: 25,
    right: 25,
    bottom: 25,
    borderColor: '#C4A962',
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 2
  },
  innerBorder: {
    position: 'absolute',
    top: 35,
    left: 35,
    right: 35,
    bottom: 35,
    borderColor: '#C4A962',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 1
  },
  decorator: {
    fontSize: 20,
    textAlign: 'center',
    color: '#C4A962',
    marginVertical: 5,
    fontFamily: 'Times-Roman'
  },
  header: {
    fontSize: 38,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 0,
    color: '#C4A962',
    fontFamily: 'Times-Bold',
    letterSpacing: 2
  },
  subHeader: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666666',
    fontFamily: 'Times-Roman',
    letterSpacing: 1,
  },
  content: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 1.4,
    textAlign: 'center',
    color: '#2D3748',
  },
  name: {
    fontSize: 36,
    textAlign: 'center',
    marginVertical: 15,
    color: '#C4A962',
    fontFamily: 'Times-Roman',
    fontStyle: 'italic',
  },
  score: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    color: '#4A5568',
    fontFamily: 'Times-Bold',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingHorizontal: 100,
  },
  dateLabel: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#C4A962',
    paddingTop: 5,
    width: 150,
  },
  signature: {
    fontSize: 32,
    textAlign: 'center',
    color: '#C4A962',
    fontFamily: 'Times-Roman',
    marginTop: 20,
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  certId: {
    position: 'absolute',
    bottom: 30,
    right: 35,
    fontSize: 10,
    color: '#718096',
  },
  decoratorBottom: {
    fontSize: 24,
    color: '#C4A962',
    textAlign: 'center',
    marginVertical: 10,
  }
});

// Certificate Document Component
const CertificateDocument = ({ name, result, category }) => {
  CertificateDocument.propTypes = {
    name: PropTypes.string.isRequired,
    result: PropTypes.shape({
      score: PropTypes.number.isRequired,
      totalQuestions: PropTypes.number.isRequired,
      id: PropTypes.string
    }).isRequired,
    category: PropTypes.string.isRequired
  };

  const currentDate = format(new Date(), 'MMMM dd, yyyy');
  const certificateId = result.id || Math.random().toString(36).substr(2, 9);

  
  return (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      {/* Decorative Borders */}
      <View style={styles.border} />
      <View style={styles.innerBorder} />
      
      {/* Certificate Header */}
      <Text style={styles.header}>CERTIFICATE</Text>
      <Text style={styles.subHeader}>OF COMPLETION</Text>

      {/* Main Content */}
      <View style={styles.content}>
        <Text>This is to certify that</Text>
        <Text style={styles.name}>{name}</Text>
        <Text>
          has successfully completed the {category} certification examination
          with distinction, achieving
        </Text>
        <Text style={styles.score}>
          {result.score} out of {result.totalQuestions} ({((result.score/result.totalQuestions) * 100).toFixed(1)}%)
        </Text>
      </View>

      {/* Date and Signature Section */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>{currentDate}</Text>
        <Text style={styles.dateLabel}>Signature</Text>
      </View>

      {/* Signature */}
      <Text style={styles.signature}>UniConnect</Text>
      <Text style={[styles.content, { fontSize: 12, marginTop: 8, color: '#666666' }]}>
        CEO, University Connect
      </Text>

      {/* Certificate ID */}
      <Text style={styles.certId}>
        Certificate ID: {certificateId}
      </Text>


    </Page>
  </Document>
  );
};

const Certifications = () => {
  // Question-related state
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Exam state
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const [examStarted, setExamStarted] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Results and validation
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [codingTestResults, setCodingTestResults] = useState({});
  const [codingValidationStatus, setCodingValidationStatus] = useState({});
  const [allTestsRun, setAllTestsRun] = useState(false);
  
  // UI state
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNameConfirmation, setShowNameConfirmation] = useState(false);
  const [showCodingTestModal, setShowCodingTestModal] = useState(false);
  const [currentCodingQuestion, setCurrentCodingQuestion] = useState(null);
  
  // Certificate state
  const [certificateName, setCertificateName] = useState("");
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [certificateDownloaded, setCertificateDownloaded] = useState(false);
  
  // Security state
  const [securityViolations, setSecurityViolations] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  
  // State organization moved to top of component
  
  // Validation functions
  const validateAnswers = () => {
    const unansweredMCQ = questions.some((q, index) => 
      q.type === 'mcq' && (!answers[index] || answers[index].trim() === '')
    );
    
    const unvalidatedCoding = questions.some((q, index) => 
      q.type === 'coding' && !codingValidationStatus[index]
    );

    if (unansweredMCQ) {
      return { valid: false, message: 'Please answer all multiple choice questions' };
    }
    
    if (unvalidatedCoding) {
      return { valid: false, message: 'Please run and pass all coding test cases' };
    }

    return { valid: true };
  };

  const maxViolations = 3; // Maximum allowed violations before auto-submit

  // Check if all tests are passing whenever codingValidationStatus changes
  useEffect(() => {
    if (questions.length > 0) {
      const codingQuestions = questions.filter(q => q.type === "coding");
      const allCodingValidated = codingQuestions.every((q, index) => {
        const questionIndex = questions.findIndex(quest => quest._id === q._id);
        return codingValidationStatus[questionIndex];
      });
      
      setAllTestsRun(allCodingValidated || codingQuestions.length === 0);
    }
  }, [questions, codingValidationStatus]);

  // Security handlers
  const handleSecurityViolation = (reason) => {
    setSecurityViolations(prev => {
      const newViolations = prev + 1;
      setWarningMessage(`Security Violation: ${reason}. Warning ${newViolations}/${maxViolations}`);
      
      if (newViolations >= maxViolations) {
        handleSubmit(); // Auto-submit after max violations
      }
      return newViolations;
    });
  };

  const handleSecurityWarning = (message) => {
    setWarningMessage(message);
    // Clear warning after 5 seconds
    setTimeout(() => setWarningMessage(""), 5000);
  };

  const categories = [
    {
      id: "React",
      name: "React.js",
      description: "Test your React.js knowledge",
      icon: "⚛️",
      color: "from-blue-500 to-cyan-400",
    },
    {
      id: "Java",
      name: "Java Programming",
      description: "Core Java concepts and OOP",
      icon: "☕",
      color: "from-orange-500 to-red-500",
    },
    {
      id: "Python",
      name: "Python Programming",
      description: "Python fundamentals and syntax",
      icon: "🐍",
      color: "from-green-500 to-teal-400",
    },
    {
      id: "JavaScript",
      name: "JavaScript",
      description: "Modern JavaScript ES6+",
      icon: "🚀",
      color: "from-yellow-500 to-orange-400",
    },
    {
      id: "Data Structures",
      name: "Data Structures",
      description: "Arrays, Trees, Graphs & more",
      icon: "🏗️",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "Algorithms",
      name: "Algorithms",
      description: "Sorting, Searching & Optimization",
      icon: "🧮",
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: "Web Development",
      name: "Web Development",
      description: "HTML, CSS, and web technologies",
      icon: "🌐",
      color: "from-pink-500 to-rose-400",
    },
  ];

  const questionsPerPage = 5;

  // Remove the initial useEffect that fetches questions without category
  // useEffect(() => {
  //   const fetchQuestions = async () => {
  //     try {
  //       setLoading(true);
  //       const data = await fetchCertificationQuestions();
  //       if (data && data.length > 0) {
  //         setQuestions(data);
  //       } else {
  //         console.warn("No questions available");
  //       }
  //     } catch (error) {
  //       console.error("Error:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchQuestions();
  // }, []);

  useEffect(() => {
    let interval;
    if (timeRemaining > 0 && !showResult && examStarted) {
      interval = setInterval(() => setTimeRemaining((prev) => prev - 1), 1000);
    } else if (timeRemaining === 0 && !showResult && examStarted) {
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [timeRemaining, showResult, examStarted]);

  useEffect(() => {
    if (examStarted) {
      const handleFullScreenChange = () => {
        if (!document.fullscreenElement) {
          // User exited full-screen mode
          handleSubmit();
        }
      };

      document.addEventListener("fullscreenchange", handleFullScreenChange);

      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullScreenChange
        );
      };
    }
  }, [examStarted]);

  // Updated fetchQuestions function to get mixed MCQ and coding questions
  const fetchQuestions = async (category) => {
    setLoading(true);
    try {
      console.log("Fetching questions for category:", category);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/certifications/questions`, // Use plural 'certifications' to match backend routes
        {
          params: { category },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      console.log("Questions received:", response.data);

      if (!response.data || response.data.length === 0) {
        alert(
          `No questions available for ${category}. Please contact admin to add questions.`
        );
        setSelectedCategory(""); // Go back to category selection
        return;
      }

      setQuestions(response.data);
      setAnswers({}); // Reset answers as object
      setCurrentQuestion(0);
      setTestStarted(true);
      setTimeRemaining(1800); // Reset timer to 30 minutes
      setExamStarted(true);
    } catch (error) {
      console.error("Error fetching questions:", error);

      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        const message =
          error.response.data?.message || "Failed to fetch questions";
        alert(`Error: ${message}`);
      } else if (error.request) {
        // Request was made but no response received
        alert(
          "Network error: Unable to connect to server. Please check your connection."
        );
      } else {
        // Something else happened
        alert("An unexpected error occurred. Please try again.");
      }

      setSelectedCategory(""); // Go back to category selection
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // First validate all answers
      const validation = validateAnswers();
      if (!validation.valid) {
        alert(validation.message);
        return;
      }

      // Get and validate authentication
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Extract user info from token
      let userId, userName;
      try {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        userId = tokenPayload.id;
        
        // Get or fetch user name
        userName = localStorage.getItem("userName");
        if (!userName) {
          const userProfile = await fetchUserProfile(token);
          userName = userProfile.name || "User";
          localStorage.setItem("userName", userName);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        alert("Session expired. Please login again.");
        window.location.href = "/login";
        return;
      }

      console.log("Submitting with:", {
        userId,
        userName,
        category: selectedCategory,
        answersCount: Object.keys(answers).length,
        totalQuestions: questions.length,
      });

      setShowResult(true);

      // Submit to backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/certifications/submit`,
        {
          userId,
          userName,
          category: selectedCategory,
          answers,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
        }
      );

      console.log("Submission successful:", response.data);
      setResult(response.data);
      
      // Remove certification answers from local storage
      localStorage.removeItem("certificationAnswers");

      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error("Failed to exit fullscreen mode:", err);
        });
      }

      if (response.data.passed) {
        setShowConfetti(true);
      }
    } catch (error) {
      console.error("Error submitting answers:", error);

      let errorMessage = "An error occurred while submitting your answers.";

      if (error.response) {
        // Server responded with error status
        console.error("Server error response:", error.response.data);
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;

        if (error.response.data?.details) {
          console.error("Error details:", error.response.data.details);
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error("Network error:", error.request);
        errorMessage = "Network error: Unable to connect to server.";
      } else {
        // Something else happened
        console.error("Submission error:", error.message);
        errorMessage = error.message;
      }

      alert(errorMessage + " Please try again.");
      setShowResult(false); // Allow user to try again
    }
  };

  // New function to open name confirmation dialog
  const openNameConfirmationDialog = () => {
    const storedName = localStorage.getItem("userName") || "";
    setCertificateName(storedName);
    setShowNameConfirmation(true);
  };

  // Handle direct certificate generation and download with test result data
  const generateAndDownloadCertificate = async () => {
    if (!result || !certificateName.trim()) {
      alert("Please ensure your name is entered correctly");
      return;
    }

    setIsGeneratingCertificate(true);

    try {
      // Create PDF document in landscape orientation with proper settings
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        compress: true
      });

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Add elegant background pattern
      const addBackground = () => {
        // Add wavy lines pattern
        doc.setDrawColor(245, 245, 245);
        doc.setLineWidth(0.1);
        for (let i = 0; i < pageHeight; i += 5) {
          doc.line(0, i, pageWidth, i);
        }

        // Add golden border
        doc.setDrawColor(176, 148, 108); // Golden color
        doc.setLineWidth(2);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

        // Add corner decorations
        const cornerSize = 20;
        doc.setFillColor(176, 148, 108);
        // Top left
        doc.rect(15, 15, cornerSize, 2, 'F');
        doc.rect(15, 15, 2, cornerSize, 'F');
        // Top right
        doc.rect(pageWidth - 15 - cornerSize, 15, cornerSize, 2, 'F');
        doc.rect(pageWidth - 17, 15, 2, cornerSize, 'F');
        // Bottom left
        doc.rect(15, pageHeight - 17, cornerSize, 2, 'F');
        doc.rect(15, pageHeight - 15 - cornerSize, 2, cornerSize, 'F');
        // Bottom right
        doc.rect(pageWidth - 15 - cornerSize, pageHeight - 17, cornerSize, 2, 'F');
        doc.rect(pageWidth - 17, pageHeight - 15 - cornerSize, 2, cornerSize, 'F');
      };
      addBackground();

      // Add logo/emblem
      doc.setFillColor(176, 148, 108);
      const logoSize = 20;
      doc.rect(pageWidth/2 - logoSize/2, 30, logoSize, logoSize, 'F');

      // Add certificate title
      doc.setFont("times", "bold");
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(40);
      doc.text("CERTIFICATE OF COMPLETION", pageWidth/2, 70, { align: "center" });

      // Add user name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(36);
      doc.text(certificateName, pageWidth/2, 110, { align: "center" });

      // Add course details
      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Has successfully completed the ${selectedCategory} certification exam`,
        pageWidth/2,
        130,
        { align: "center" }
      );

      // Add score and performance
      const { score, totalQuestions, percentage, badgeType } = result;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(
        `Score: ${score}/${totalQuestions} (${percentage}%)`,
        pageWidth/2,
        150,
        { align: "center" }
      );

      // Add badge type with color
      let badgeColor;
      switch(badgeType.toLowerCase()) {
        case 'platinum':
          badgeColor = [90, 90, 90];
          break;
        case 'gold':
          badgeColor = [212, 175, 55];
          break;
        case 'silver':
          badgeColor = [192, 192, 192];
          break;
        default:
          badgeColor = [176, 148, 108];
      }
      doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
      doc.text(
        badgeType.toUpperCase() + " BADGE ACHIEVED",
        pageWidth/2,
        170,
        { align: "center" }
      );

      // Add date and certificate ID
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      
      const certIssueDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      // Add dividing lines for signature
      doc.setDrawColor(176, 148, 108);
      doc.setLineWidth(0.5);
      doc.line(pageWidth/2 - 50, pageHeight - 40, pageWidth/2 + 50, pageHeight - 40);

      // Add signature text
      doc.text("AUTHORIZED SIGNATURE", pageWidth/2, pageHeight - 30, { align: "center" });

      // Add date and certificate ID
      doc.text(`Issue Date: ${issueDate}`, 30, pageHeight - 30);
      doc.text(`Certificate ID: ${result.certificateId}`, pageWidth - 30, pageHeight - 30, { align: "right" });

      // Create the file name
      const fileName = `${selectedCategory}_Certificate_${certificateName.replace(/\s+/g, '_')}.pdf`;

      // Create blob and trigger download
      const pdfBlob = doc.output('blob');
      const blobUrl = window.URL.createObjectURL(pdfBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.style.display = 'none';
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(blobUrl);
        setCertificateDownloaded(true);
        setIsGeneratingCertificate(false);
      }, 100);

      // Set background
      doc.setFillColor(245, 245, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Add border
      doc.setDrawColor(65, 105, 225);
      doc.setLineWidth(1);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Calculate percentage and set performance text
      const certificatePercentage = (score / questions.length) * 100;
      let performanceText = "";
      let performanceColor = [];

      if (certificatePercentage >= 90) {
        performanceText = "Outstanding Achievement";
        performanceColor = [0, 100, 0];
      } else if (percentage >= 80) {
        performanceText = "Excellent Performance";
        performanceColor = [0, 128, 0];
      } else if (percentage >= 70) {
        performanceText = "Very Good";
        performanceColor = [46, 139, 87];
      } else {
        performanceText = "Passed Successfully";
        performanceColor = [70, 130, 180];
      }

      // Add certificate title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(40);
      doc.setTextColor(25, 25, 112);
      doc.text("Certificate of Achievement", pageWidth / 2, 40, { align: "center" });

      // Add main text
      doc.setFontSize(20);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 70);
      doc.text("This is to certify that", pageWidth / 2, 70, { align: "center" });

      // Add name
      doc.setFontSize(30);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(25, 25, 112);
      doc.text(certificateName, pageWidth / 2, 90, { align: "center" });

      // Add course completion text
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 70);
      doc.text(
        `has successfully completed the ${selectedCategory} certification exam`,
        pageWidth / 2,
        110,
        { align: "center" }
      );

      // Add score
      doc.setFontSize(20);
      doc.setTextColor(performanceColor[0], performanceColor[1], performanceColor[2]);
      doc.text(
        `Score: ${score}/${questions.length} (${percentage.toFixed(1)}%)`,
        pageWidth / 2,
        130,
        { align: "center" }
      );
      doc.text(`${performanceText}`, pageWidth / 2, 140, { align: "center" });

      // Generate unique identifiers
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const certificateId = `UC-${Math.floor(100000 + Math.random() * 900000)}-${new Date().getFullYear()}`;
      const issueDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      // Add certificate details to PDF
      doc.setFontSize(12);
      doc.setTextColor(70, 70, 70);
      doc.text(`Issue Date: ${issueDate}`, 20, pageHeight - 20);
      doc.text(`Certificate ID: ${certificateId}`, pageWidth - 20, pageHeight - 20, { align: "right" });
      
      try {
        // Create file name with timestamp to ensure uniqueness
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        const fileName = `${selectedCategory}_Certificate_${certificateName.replace(/\s+/g, '_')}_${timestamp}.pdf`;

        // Create blob from PDF
        const pdfBlob = doc.output('blob');
        
        // Create object URL for the blob
        const blobUrl = window.URL.createObjectURL(pdfBlob);

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = fileName;
        downloadLink.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(blobUrl);
        }, 100);

        // Mark as downloaded in local storage
        setCertificateDownloaded(true);
        localStorage.setItem(`certificate_${certificateId}`, 'true');

        console.log("Certificate generated and download triggered successfully");
      } catch (error) {
        console.error("Error in certificate download:", error);
        throw new Error("Failed to trigger certificate download");
      }

    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  // Simplified certificate generation with fewer decorative elements
  const generateCertificate = async (userName, score, totalQuestions) => {
    setIsGeneratingCertificate(true);

    try {
      // Create PDF document in landscape orientation
      const doc = new jsPDF("landscape");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Simple background
      doc.setFillColor(245, 245, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Calculate pass grade text and color
      let performanceText, performanceColor;
      const percentage = (score / totalQuestions) * 100;

      if (percentage >= 90) {
        performanceText = "Excellence";
        performanceColor = [25, 111, 61]; // Dark green
      } else if (percentage >= 80) {
        performanceText = "Distinction";
        performanceColor = [39, 174, 96]; // Green
      } else if (percentage >= 70) {
        performanceText = "Merit";
        performanceColor = [41, 128, 185]; // Blue
      } else {
        performanceText = "Pass";
        performanceColor = [52, 73, 94]; // Dark blue-gray
      }

      // Create certificate ID for verification
      const certificateId = `UC-${Math.floor(
        100000 + Math.random() * 900000
      )}-${new Date().getFullYear()}`;

      // Simple border
      doc.setDrawColor(65, 105, 225);
      doc.setLineWidth(2);
      doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

      // Certificate title
      doc.setFont("times", "bold");
      doc.setTextColor(25, 25, 112);
      doc.setFontSize(42);
      doc.text("CERTIFICATE OF ACHIEVEMENT", pageWidth / 2, 80, {
        align: "center",
      });

      // Award text
      doc.setFontSize(16);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(70, 70, 70);
      doc.text("This is to certify that", pageWidth / 2, 105, {
        align: "center",
      });

      // Recipient name
      doc.setFont("times", "bolditalic");
      doc.setFontSize(34);
      doc.setTextColor(25, 25, 112);
      doc.text(userName, pageWidth / 2, 125, { align: "center" });

      // Achievement description
      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.setTextColor(70, 70, 70);
      doc.text(
        `has successfully completed the ${selectedCategory} Certification Examination with a score of`,
        pageWidth / 2,
        145,
        { align: "center" }
      );

      // Score highlight
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(
        performanceColor[0],
        performanceColor[1],
        performanceColor[2]
      );
      doc.text(
        `${score}/${totalQuestions} (${performanceText})`,
        pageWidth / 2,
        160,
        { align: "center" }
      );

      // Issue date
      const issueDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Date and certificate ID
      doc.setFont("helvetica", "italic");
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Issued on: ${issueDate}`, 60, 190);
      doc.text(`Certificate ID: ${certificateId}`, pageWidth - 60, 190, {
        align: "right",
      });

      // Save the PDF
      doc.save(
        `${userName.replace(/\s+/g, "_")}_${selectedCategory}_Certificate.pdf`
      );
      alert("Certificate generated successfully!");
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const startTest = async () => {
    try {
      // Request camera permission first
      await navigator.mediaDevices.getUserMedia({ video: true });
      setShowAgreementDialog(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      setWarningMessage('Camera access is required to take the test. Please allow camera access and try again.');
    }
  };

  const agreeToStartTest = async () => {
    try {
      setShowAgreementDialog(false);
      setShowTestDetails(false);
      setTestStarted(true);

      // Enter full-screen mode
      await document.documentElement.requestFullscreen();
      
      // Reset security states
      setSecurityViolations(0);
      setWarningMessage('');
      setLastActiveTime(Date.now());

      // Add all security event listeners
      const preventDefaultBehavior = (e) => {
        e.preventDefault();
        handleSecurityWarning('This action is not allowed during the test');
      };

      document.addEventListener("copy", preventDefaultBehavior);
      document.addEventListener("cut", preventDefaultBehavior);
      document.addEventListener("paste", preventDefaultBehavior);
      document.addEventListener("contextmenu", preventDefaultBehavior);
      
      window.onblur = () => {
        handleSecurityViolation('Window focus lost - possible tab switch');
      };

    } catch (error) {
      console.error('Error starting test:', error);
      setWarningMessage('Failed to start test in secure mode. Please refresh and try again.');
      setTestStarted(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleAnswerSelect = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }));
  };

  // Updated handleAnswer for coding questions
  const handleCodingAnswer = (code) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: code,
    }));
  };

  // New function to run coding test cases
  const runCodingTest = async (questionIndex, testCaseIndex = 0) => {
    const question = questions[questionIndex];
    if (!question || question.type !== "coding") return;

    try {
      setLoading(true);
      const response = await executeCodingTest(
        answers[questionIndex] || question.starterCode || "",
        question.language || "JavaScript",
        question._id,
        testCaseIndex
      );

      setCodingTestResults(prev => ({
        ...prev,
        [`${questionIndex}-${testCaseIndex}`]: response
      }));

      // Check if all test cases pass - safely check for testCases
      if (question.testCases && question.testCases.length > 0) {
        const allTestCasesPassed = question.testCases.every((_, idx) => {
          const result = codingTestResults[`${questionIndex}-${idx}`];
          return result && result.passed;
        });

        setCodingValidationStatus(prev => ({
          ...prev,
          [questionIndex]: allTestCasesPassed
        }));
      } else {
        // If there are no test cases, consider it as validated
        setCodingValidationStatus(prev => ({
          ...prev,
          [questionIndex]: true
        }));
      }

    } catch (error) {
      console.error("Error running coding test:", error);
    } finally {
      setLoading(false);
    }
  };

  // New function to run all test cases for a coding question
  const runAllCodingTests = async (questionIndex) => {
    const question = questions[questionIndex];
    if (!question || question.type !== "coding") return;

    try {
      setLoading(true);
      
      // Debug logging
      console.log("Question data:", question);
      
      // Get test cases from the question or create a single dummy test case
      // This handles different API response formats
      let testCases = [];
      
      if (question.testCases && Array.isArray(question.testCases) && question.testCases.length > 0) {
        console.log("Found test cases in question.testCases:", question.testCases);
        testCases = question.testCases;
      } else if (question.testcases && Array.isArray(question.testcases) && question.testcases.length > 0) {
        // Handle lowercase property name variation
        console.log("Found test cases in question.testcases:", question.testcases);
        testCases = question.testcases;
      } else if (question.test_cases && Array.isArray(question.test_cases) && question.test_cases.length > 0) {
        // Handle snake_case property name variation
        console.log("Found test cases in question.test_cases:", question.test_cases);
        testCases = question.test_cases;
      } else {
        // Create a dummy test case for validation
        console.log("Creating a dummy test case for validation");
        
        // Create an appropriate test case based on language
        if (question.language === "Java") {
          testCases = [{
            id: "dummy-test",
            input: "3 5",
            expectedOutput: "8",
            isHidden: false
          }];
          console.log("Created Java test case");
        } else if (question.language === "Python") {
          testCases = [{
            id: "dummy-test",
            input: "3 5",
            expectedOutput: "8",
            isHidden: false
          }];
          console.log("Created Python test case");
        } else {
          // Default JavaScript test case
          testCases = [{
            id: "dummy-test",
            input: "3 5",
            expectedOutput: "8",
            isHidden: false
          }];
          console.log("Created JavaScript test case");
        }
      }
      
      // Get the code from the answers or starter code
      const code = answers[questionIndex] || question.starterCode || "";
      
      // Make sure to use the correct language from the question
      const language = question.language || question.category || "JavaScript";
      console.log(`Using language: ${language} for question ID: ${question._id}`);
      
      // Use our new service to run all test cases
      const results = await runAllTestCases(
        code, 
        language, 
        question._id, 
        testCases
      );
      
      // Update the results state
      results.forEach((result, i) => {
        setCodingTestResults(prev => ({
          ...prev,
          [`${questionIndex}-${i}`]: result
        }));
      });
      
      // Check if all test cases passed
      const allTestCasesPassed = results.every(result => result && result.passed);
      
      // Store the test cases on the question object for UI rendering
      const updatedQuestions = [...questions];
      if (!updatedQuestions[questionIndex].testCases || updatedQuestions[questionIndex].testCases.length === 0) {
        updatedQuestions[questionIndex].testCases = testCases;
        setQuestions(updatedQuestions);
        console.log("Updated question with test cases:", updatedQuestions[questionIndex]);
      }
      
      // Update validation status
      setCodingValidationStatus(prev => ({
        ...prev,
        [questionIndex]: allTestCasesPassed
      }));
      
    } catch (error) {
      console.error("Error running all coding tests:", error);
    } finally {
      setLoading(false);
    }
  };

  // New function to open coding test modal
  const openCodingTestModal = (questionIndex) => {
    setCurrentCodingQuestion({ index: questionIndex, question: questions[questionIndex] });
    setShowCodingTestModal(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const resetTest = () => {
    // Reset question-related state
    setSelectedCategory("");
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    
    // Reset exam state
    setTestStarted(false);
    setTimeRemaining(1800);
    setExamStarted(false);
    
    // Reset results and validation
    setShowResult(false);
    setResult(null);
    setCodingTestResults({});
    setCodingValidationStatus({});
    setAllTestsRun(false);
    
    // Reset UI state
    setShowConfetti(false);
    setShowNameConfirmation(false);
    setShowCodingTestModal(false);
    setCurrentCodingQuestion(null);
    
    // Reset certificate state
    setCertificateName("");
    setIsGeneratingCertificate(false);
    setCertificateDownloaded(false);
  };

  // Category selection screen
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Choose Your <span className="text-blue-400">Certification</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Select a category to start your certification test. Each test
              contains 30 questions and you need 65% to pass and earn your
              certificate.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div
                  className={`bg-gradient-to-br ${category.color} p-1 rounded-xl shadow-lg transform group-hover:scale-105 transition-all duration-300`}
                >
                  <div className="bg-gray-800 rounded-lg p-6 h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-4">{category.icon}</div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {category.name}
                      </h3>
                      <p className="text-gray-400 mb-4">
                        {category.description}
                      </p>
                      <div
                        className={`inline-block px-4 py-2 bg-gradient-to-r ${category.color} text-white rounded-lg font-semibold group-hover:shadow-lg transition-shadow`}
                      >
                        Start Test
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Result screen
  if (showResult && result) {
    const selectedCat = categories.find((cat) => cat.id === selectedCategory);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-6">
        {showConfetti && (
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-xl p-8 max-w-lg w-full text-center border border-gray-700"
        >
          <div className="text-6xl mb-4">{result.passed ? "🎉" : "😔"}</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {result.passed ? "Congratulations!" : "Better Luck Next Time!"}
          </h2>
          <div className="text-xl text-gray-300 mb-6">
            <p>
              Score: {result.score}/{result.totalQuestions}
            </p>
            <p>Percentage: {result.percentage?.toFixed(1)}%</p>
            <p className="text-sm text-gray-400 mt-2">
              Category: {selectedCat?.name}
            </p>
          </div>
          {result.passed && (
            <div className="mb-4 space-y-3">
              <PDFDownloadLink
                document={
                  <CertificateDocument
                    name={certificateName || localStorage.getItem("userName") || "Certificate Holder"}
                    result={result}
                    category={selectedCategory}
                  />
                }
                fileName={`${selectedCategory}_Certificate_${(certificateName || "User").replace(/\s+/g, '_')}.pdf`}
                className={`inline-block px-6 py-3 rounded-lg font-semibold transition ${
                  certificateDownloaded
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white relative overflow-hidden`}
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {({ loading }) => (
                  loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Preparing Certificate...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FaDownload className="w-5 h-5" />
                      <span>Download Your Certificate</span>
                    </div>
                  )
                )}
              </PDFDownloadLink>
              {certificateDownloaded && (
                <div className="mt-2">
                  <p className="text-sm text-gray-400">
                    Your certificate has been downloaded successfully. Check your downloads folder.
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Note: For security reasons, each certificate can only be downloaded once.
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => fetchQuestions(selectedCategory)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retake Test
            </button>
            <button
              onClick={resetTest}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Choose Different Category
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Test screen
  if (!testStarted) {
    const selectedCat = categories.find((cat) => cat.id === selectedCategory);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-8 max-w-lg w-full text-center border border-gray-700"
        >
          <div className="text-4xl mb-4">{selectedCat?.icon}</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {selectedCat?.name} Certification
          </h2>
          <div className="text-gray-300 mb-6 space-y-2">
            <p>• 30 Multiple Choice Questions</p>
            <p>• 30 Minutes Time Limit</p>
            <p>• 65% Required to Pass</p>
            <p>• Certificate upon successful completion</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => fetchQuestions(selectedCategory)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Start Test
            </button>
            <button
              onClick={resetTest}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back to Categories
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Questions screen with mixed MCQ and coding questions
  if (testStarted && questions.length > 0) {
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
        <ExamSecurity 
          onViolation={handleSecurityViolation}
        />
        {warningMessage && (
          <div className="fixed top-4 right-4 max-w-md bg-red-800 text-white p-4 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-yellow-400 mr-2" />
              {warningMessage}
            </div>
            {securityViolations > 0 && (
              <div className="text-sm mt-2 text-red-300">
                Violations: {securityViolations}/{maxViolations}
              </div>
            )}
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-white">
                {categories.find((cat) => cat.id === selectedCategory)?.name}{" "}
                Test
              </h1>
              <div className="text-xl font-mono text-red-400">
                ⏰ {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-gray-400 text-sm">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          {/* Question */}
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700"
          >
            {/* Question Type Indicator */}
            <div className="flex items-center mb-4">
              {currentQ?.type === "mcq" ? (
                <>
                  <FaQuestionCircle className="text-blue-400 mr-2" />
                  <span className="text-blue-400 font-semibold">
                    MCQ Question
                  </span>
                </>
              ) : (
                <>
                  <FaCode className="text-green-400 mr-2" />
                  <span className="text-green-400 font-semibold">
                    Coding Problem
                  </span>
                </>
              )}
            </div>

            {/* MCQ Question */}
            {currentQ?.type === "mcq" ? (
              <>
                <h2 className="text-xl font-semibold text-white mb-6">
                  {currentQ?.question}
                </h2>
                <div className="space-y-3">
                  {currentQ?.options?.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                        answers[currentQuestion] === option
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="font-medium mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              /* Coding Question */
              <>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {currentQ?.title}
                </h2>
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {currentQ?.description}
                  </p>
                </div>
                {currentQ?.constraints && (
                  <div className="bg-gray-700 p-3 rounded-lg mb-4">
                    <h4 className="text-white font-semibold mb-2">
                      Constraints:
                    </h4>
                    <p className="text-gray-300 text-sm">
                      {currentQ.constraints}
                    </p>
                  </div>
                )}
                
                {/* Test Cases Section */}
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-white font-semibold">Test Cases</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => runAllCodingTests(currentQuestion)}
                        disabled={loading}
                        className={`px-3 py-1.5 ${
                          codingValidationStatus[currentQuestion]
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        } disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-70 rounded text-sm flex items-center space-x-1 transition-all`}
                      >
                        {loading ? (
                          <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                        ) : codingValidationStatus[currentQuestion] ? (
                          <FaCheck className="text-xs" />
                        ) : (
                          <FaPlay className="text-xs" />
                        )}
                        <span>{loading ? "Running..." : codingValidationStatus[currentQuestion] ? "All Tests Passed" : "Run All Tests"}</span>
                      </button>
                      <button
                        onClick={() => openCodingTestModal(currentQuestion)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                      >
                        View Test Cases
                      </button>
                    </div>
                  </div>
                  
                  {/* Test Status Summary */}
                  <div className="flex space-x-4 text-sm mb-3">
                    <span className="text-gray-400">
                      Total: {currentQ?.testCases?.length || 0}
                    </span>
                    <span className="text-green-400">
                      Passed: {currentQ?.testCases?.filter((_, idx) => {
                        const result = codingTestResults[`${currentQuestion}-${idx}`];
                        return result && result.passed;
                      })?.length || 0}
                    </span>
                    <span className="text-red-400">
                      Failed: {currentQ?.testCases?.filter((_, idx) => {
                        const result = codingTestResults[`${currentQuestion}-${idx}`];
                        return result && !result.passed;
                      })?.length || 0}
                    </span>
                  </div>

                  {/* Validation Status */}
                  {codingValidationStatus[currentQuestion] !== undefined && (
                    <div className={`flex items-center space-x-2 text-sm ${
                      codingValidationStatus[currentQuestion] 
                        ? "text-green-400" 
                        : "text-red-400"
                    }`}>
                      {codingValidationStatus[currentQuestion] ? (
                        <FaCheck />
                      ) : (
                        <FaExclamationTriangle />
                      )}
                      <span>
                        {codingValidationStatus[currentQuestion] 
                          ? "All test cases passed" 
                          : "Some test cases failed"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <label className="block text-gray-300 mb-2">
                    Your Solution:
                  </label>
                  <div className="h-64 rounded-lg overflow-hidden border border-gray-700">
                    <CodeEditor
                      height="100%"
                      language={currentQ?.language || "javascript"}
                      value={answers[currentQuestion] || currentQ?.starterCode || ""}
                      onChange={(value) => handleCodingAnswer(value)}
                      readOnly={loading}
                      options={{
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false
                      }}
                    />
                  </div>
                </div>
                
                {/* Prominent Run Tests Button */}
                <div className="mb-4">
                  <button
                    onClick={() => runAllCodingTests(currentQuestion)}
                    disabled={loading}
                    className={`w-full py-3 flex items-center justify-center gap-2 rounded-lg font-semibold ${
                      codingValidationStatus[currentQuestion]
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    {loading ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    ) : codingValidationStatus[currentQuestion] ? (
                      <FaCheck className="text-sm" />
                    ) : (
                      <FaPlay className="text-sm" />
                    )}
                    <span>{loading 
                      ? "Running Tests..." 
                      : codingValidationStatus[currentQuestion] 
                        ? "All Tests Passed ✓" 
                        : "Run All Tests"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-2 max-w-md overflow-x-auto">
              {questions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded-full text-sm font-semibold transition flex-shrink-0 ${
                    index === currentQuestion
                      ? "bg-blue-600 text-white"
                      : answers[index]
                      ? q.type === "mcq"
                        ? "bg-blue-500 text-white"
                        : "bg-green-500 text-white"
                      : q.type === "mcq"
                      ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  title={q.type === "mcq" ? "MCQ" : "Coding"}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestion === questions.length - 1 ? (
              <div className="space-y-2">
                {!allTestsRun && questions.some(q => q.type === "coding") && (
                  <div className="bg-yellow-800/30 border border-yellow-500/50 text-yellow-400 p-3 rounded-lg text-center">
                    <FaExclamationTriangle className="inline-block mr-2" />
                    Please run and pass all test cases before submitting
                  </div>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!allTestsRun && questions.some(q => q.type === "coding")}
                  className={`px-6 py-4 w-full flex items-center justify-center gap-2 ${
                    !allTestsRun && questions.some(q => q.type === "coding")
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white rounded-lg transition font-semibold text-lg`}
                >
                  {!allTestsRun && questions.some(q => q.type === "coding") ? (
                    <>
                      <FaPlay />
                      <span>Run All Tests First</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      <span>Submit Test</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Name Confirmation Dialog */}
        {showNameConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Confirm Your Name for Certificate
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Please enter your full name as you want it to appear on the certificate.
                This cannot be changed after the certificate is generated.
              </p>
              <input
                type="text"
                value={certificateName}
                onChange={(e) => setCertificateName(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-md mb-4 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter your full name"
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNameConfirmation(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateAndDownloadCertificate}
                  disabled={!certificateName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Generate Certificate</span>
                  {isGeneratingCertificate && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // Add the coding test modal
  const renderCodingTestModal = () => (
    showCodingTestModal && currentCodingQuestion && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              Test Cases - {currentCodingQuestion.question.title}
            </h3>
            <button
              onClick={() => setShowCodingTestModal(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {currentCodingQuestion.question.testCases?.map((testCase, index) => {
              const result = codingTestResults[`${currentCodingQuestion.index}-${index}`];
              return (
                <div key={index} className="bg-gray-700 p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-white">Test Case {index + 1}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => runCodingTest(currentCodingQuestion.index, index)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm flex items-center space-x-1"
                      >
                        <FaPlay className="text-xs" />
                        <span>Run</span>
                      </button>
                      {result && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          result.passed 
                            ? "bg-green-600 text-white" 
                            : "bg-red-600 text-white"
                        }`}>
                          {result.passed ? "PASS" : "FAIL"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-400 text-sm">Input:</span>
                      <pre className="bg-gray-900 p-2 rounded mt-1 text-sm">
                        {testCase.input}
                      </pre>
                    </div>
                    {!testCase.isHidden && (
                      <div>
                        <span className="text-gray-400 text-sm">
                          Expected Output:
                        </span>
                        <pre className="bg-gray-900 p-2 rounded mt-1 text-sm">
                          {testCase.expectedOutput}
                        </pre>
                      </div>
                    )}
                    {result && (
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-gray-400 text-sm">
                            Your Output:
                          </span>
                          {result.passed ? (
                            <FaCheck className="text-green-400 text-sm" />
                          ) : (
                            <FaTimes className="text-red-400 text-sm" />
                          )}
                        </div>
                        <pre
                          className={`p-2 rounded mt-1 text-sm ${
                            result.passed
                              ? "bg-green-900/20"
                              : "bg-red-900/20"
                          }`}
                        >
                          {result.output}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* ... existing JSX ... */}
      
      {/* Add the coding test modal */}
      {renderCodingTestModal()}
      
      {/* ... rest of existing JSX ... */}
    </div>
  );
};

export default Certifications;
