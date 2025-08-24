const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const CodingQuestion = require("../models/CodingQuestion");
const Certification = require("../models/Certification");
const Profile = require("../models/Profile");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const VM = require("vm");

// Debug route to get user certification data
router.get("/debug/user-data", authMiddleware, async (req, res) => {
  try {
    const certifications = await Certification.find({ user: req.user.id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(certifications);
  } catch (error) {
    console.error("Error fetching user certifications:", error);
    res.status(500).json({ message: "Error fetching certifications" });
  }
});

// Custom auth middleware that allows test tokens
const authOrTest = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.replace("Bearer ", "");

  // Allow test tokens for development/testing
  if (
    token === "test-token-for-questions" ||
    token === "test-token-for-submission"
  ) {
    req.user = { id: "test-user-123" };
    return next();
  }

  // Regular JWT verification for production tokens
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Ensure the certificates directory exists
const certificatesDir = path.join(__dirname, "../certificates");
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

/**
 * Fetch Mixed MCQ and Coding Questions by Category
 */
router.get("/questions", authOrTest, async (req, res) => {
  try {
    console.log("Fetching questions for category:", req.query.category);

    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Validate category exists
    const validCategories = [
      "React",
      "Java",
      "Python",
      "JavaScript",
      "Data Structures",
      "Algorithms",
      "Web Development",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Check if questions exist for this category first
    const [mcqCount, codingCount] = await Promise.all([
      Question.countDocuments({ category }),
      CodingQuestion.countDocuments({ category }),
    ]);

    console.log(
      `Found ${mcqCount} MCQ questions and ${codingCount} coding questions for ${category}`
    );

    if (mcqCount === 0 && codingCount === 0) {
      return res.status(404).json({
        message: `No questions found for ${category} category. Please add questions first.`,
        mcqCount,
        codingCount,
      });
    }

    // Fetch available questions (adjust sample size based on available questions)
    const mcqSampleSize = Math.min(15, mcqCount);
    const codingSampleSize = Math.min(15, codingCount);

    const [mcqQuestions, codingQuestions] = await Promise.all([
      mcqCount > 0
        ? Question.aggregate([
            { $match: { category: category } },
            { $sample: { size: mcqSampleSize } },
            {
              $project: {
                question: 1,
                options: 1,
                correctAnswer: 1,
                category: 1,
              },
            },
          ])
        : [],
      codingCount > 0
        ? CodingQuestion.aggregate([
            { $match: { category: category } },
            { $sample: { size: codingSampleSize } },
            {
              $project: {
                title: 1,
                description: 1,
                constraints: 1,
                starterCode: 1,
                category: 1,
              },
            },
          ])
        : [],
    ]);

    // Add type property to distinguish question types
    const formattedMcqQuestions = mcqQuestions.map((q) => ({
      ...q,
      type: "mcq",
    }));
    const formattedCodingQuestions = codingQuestions.map((q) => ({
      ...q,
      type: "coding",
    }));

    // Combine and shuffle
    const allQuestions = [
      ...formattedMcqQuestions,
      ...formattedCodingQuestions,
    ];

    // Shuffle and limit to 30 questions max
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledQuestions.slice(
      0,
      Math.min(30, allQuestions.length)
    );

    console.log(`Returning ${selectedQuestions.length} total questions`);

    res.json(selectedQuestions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      message: "Error fetching questions",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

/**
 * Submit Certification Answers & Generate Certificate
 */
router.post("/submit", authOrTest, async (req, res) => {
  try {
    console.log("Certification submission received:", {
      userId: req.body.userId,
      userName: req.body.userName,
      category: req.body.category,
      answersCount: Object.keys(req.body.answers || {}).length,
    });

    let { userId, userName, category, answers } = req.body;

    // If using test tokens, use the provided userId, otherwise get from token
    if (req.user.id !== "test-user-123") {
      userId = req.user.id;
      console.log("Using user ID from token:", userId);
    }

    // Fetch the same questions that were sent to frontend
    console.log("Fetching questions for scoring...");
    const [mcqQuestions, codingQuestions] = await Promise.all([
      Question.find({ category }).limit(15),
      CodingQuestion.find({ category }).limit(15),
    ]);

    console.log(
      `Found ${mcqQuestions.length} MCQ and ${codingQuestions.length} coding questions`
    );

    const formattedMcqQuestions = mcqQuestions.map((q) => ({
      ...q.toObject(),
      type: "mcq",
    }));
    const formattedCodingQuestions = codingQuestions.map((q) => ({
      ...q.toObject(),
      type: "coding",
    }));

    const allQuestions = [
      ...formattedMcqQuestions,
      ...formattedCodingQuestions,
    ];

    if (allQuestions.length === 0) {
      console.log("No questions found for category:", category);
      return res
        .status(404)
        .json({ message: "No questions found for this category" });
    }

    // Calculate score (only for MCQ questions)
    let correctCount = 0;
    let mcqCount = 0;

    console.log("Calculating scores...");
    allQuestions.forEach((question, index) => {
      if (question.type === "mcq") {
        mcqCount++;
        if (answers[index] === question.correctAnswer) {
          correctCount++;
        }
      }
    });

    console.log(
      `Score calculation: ${correctCount}/${mcqCount} MCQ questions correct`
    );

    const percentage = mcqCount > 0 ? (correctCount / mcqCount) * 100 : 0;
    const passed = percentage >= 65;

    console.log(`Percentage: ${percentage}%, Passed: ${passed}`);

    // Generate certificate ID
    const certificateId = `UC-${Math.floor(
      100000 + Math.random() * 900000
    )}-${new Date().getFullYear()}`;

    // Create certificate record with the correct userId
    const certification = new Certification({
      userId,
      userName,
      category,
      score: correctCount,
      totalQuestions: allQuestions.length,
      mcqScore: correctCount,
      mcqTotal: mcqCount,
      percentage,
      passed,
      answers,
      certificateId,
    });

    console.log("Created certification with userId:", userId);
    certification.calculateBadgeType();

    // Generate PDF certificate if passed
    let certificateUrl = null;
    if (passed) {
      console.log("Generating PDF certificate...");
      try {
        certificateUrl = await generateCertificatePDF(certification);
        certification.certificateUrl = certificateUrl;
        console.log("PDF certificate generated:", certificateUrl);
      } catch (pdfError) {
        console.error("PDF generation error:", pdfError);
      }
    }

    console.log("Saving certification to database...");
    await certification.save();

    // Add certification to user profile if passed
    if (passed) {
      try {
        console.log("Updating profile for user:", userId);

        // Find or create profile using the ObjectId
        let profile = await Profile.findOne({ user: userId });

        if (!profile) {
          console.log("Creating new profile for user:", userId);
          profile = new Profile({
            user: userId, // This should be the ObjectId
            name: userName,
            bio: "",
            skills: [],
            education: [],
            certifications: [],
          });
        }

        const certData = {
          category,
          score: correctCount,
          totalQuestions: allQuestions.length,
          percentage,
          certificateId: certification.certificateId,
          badgeType: certification.badgeType,
          earnedAt: new Date(),
        };

        // Check if certification already exists for this category
        const existingCertIndex = profile.certifications.findIndex(
          (cert) => cert.category === category
        );

        if (existingCertIndex > -1) {
          // Update if new score is better
          if (
            percentage > profile.certifications[existingCertIndex].percentage
          ) {
            profile.certifications[existingCertIndex] = certData;
            console.log("Updated existing certification with better score");
          }
        } else {
          // Add new certification
          profile.certifications.push(certData);
          console.log("Added new certification to profile");
        }

        profile.calculateCompletionPercentage();
        await profile.save();
        console.log(
          "Profile saved successfully with certifications count:",
          profile.certifications.length
        );
      } catch (profileError) {
        console.error("Error updating profile:", profileError);
      }
    }

    const response = {
      passed,
      score: correctCount,
      totalQuestions: allQuestions.length,
      mcqScore: correctCount,
      mcqTotal: mcqCount,
      percentage: Math.round(percentage * 10) / 10,
      certificateId: passed ? certification.certificateId : null,
      certificateUrl: passed ? certificateUrl : null,
      badgeType: passed ? certification.badgeType : null,
      message: passed
        ? "Congratulations! You passed the certification."
        : "Better luck next time!",
    };

    console.log("Sending response:", response);
    res.json(response);
  } catch (error) {
    console.error("Submit certification error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

/**
 * Execute coding test case for certification
 */
router.post("/coding/execute", authOrTest, async (req, res) => {
  try {
    const { code, language, questionId, testCaseIndex } = req.body;

    const question = await CodingQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const testCase = question.testCases[testCaseIndex];
    if (!testCase) {
      return res.status(404).json({ message: "Test case not found" });
    }

    let result;
    try {
      if (language === "JavaScript") {
        const vm = new VM({
          timeout: 5000,
          sandbox: {
            console: {
              log: () => {}, // Disable console.log for security
            },
          },
        });

        // Execute the code with the test input
        const executeCode = `
          ${code}
          
          // Parse input if needed
          const input = ${JSON.stringify(testCase.input)};
          
          // Execute the solution (assuming main function exists)
          if (typeof solution === 'function') {
            JSON.stringify(solution(input));
          } else if (typeof main === 'function') {
            JSON.stringify(main(input));
          } else {
            'No main function found';
          }
        `;

        result = vm.run(executeCode);
      } else {
        // For other languages, you'd need to implement language-specific execution
        return res.status(400).json({ message: "Language not supported yet" });
      }

      const passed = result.trim() === testCase.expectedOutput.trim();

      res.json({
        passed,
        output: result,
        expected: testCase.expectedOutput,
        input: testCase.input,
      });
    } catch (execError) {
      res.json({
        passed: false,
        output: execError.message,
        expected: testCase.expectedOutput,
        input: testCase.input,
        error: true,
      });
    }
  } catch (error) {
    console.error("Error executing code:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Submit coding solution for certification
 */
router.post("/coding/submit", authOrTest, async (req, res) => {
  try {
    const { code, language, questionId } = req.body;

    const question = await CodingQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const results = [];
    let passedCount = 0;

    for (let i = 0; i < question.testCases.length; i++) {
      const testCase = question.testCases[i];

      try {
        let result;
        if (language === "JavaScript") {
          const vm = new VM({
            timeout: 5000,
            sandbox: {},
          });

          const executeCode = `
            ${code}
            
            const input = ${JSON.stringify(testCase.input)};
            
            if (typeof solution === 'function') {
              JSON.stringify(solution(input));
            } else if (typeof main === 'function') {
              JSON.stringify(main(input));
            } else {
              'No main function found';
            }
          `;

          result = vm.run(executeCode);
        }

        const passed = result.trim() === testCase.expectedOutput.trim();
        if (passed) passedCount++;

        results.push({
          testCase: i + 1,
          passed,
          input: testCase.isHidden ? "Hidden" : testCase.input,
          output: result,
          expected: testCase.isHidden ? "Hidden" : testCase.expectedOutput,
        });
      } catch (execError) {
        results.push({
          testCase: i + 1,
          passed: false,
          input: testCase.isHidden ? "Hidden" : testCase.input,
          output: execError.message,
          expected: testCase.isHidden ? "Hidden" : testCase.expectedOutput,
          error: true,
        });
      }
    }

    const score = (passedCount / question.testCases.length) * 100;

    res.json({
      score,
      passedTests: passedCount,
      totalTests: question.testCases.length,
      results,
    });
  } catch (error) {
    console.error("Error submitting code:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Helper function to generate PDF certificate
async function generateCertificatePDF(certification) {
  try {
    const doc = new PDFDocument({ layout: "landscape" });
    const fileName = `certificate_${certification.certificateId}.pdf`;
    const filePath = path.join(certificatesDir, fileName);

    doc.pipe(fs.createWriteStream(filePath));

    // Certificate design
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Background
    doc.rect(0, 0, pageWidth, pageHeight).fill("#f5f5ff");

    // Border
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60).stroke("#4169e1", 4);

    // Title
    doc
      .fontSize(36)
      .fillColor("#191970")
      .font("Helvetica-Bold")
      .text("CERTIFICATE OF ACHIEVEMENT", 0, 120, { align: "center" });

    // Subtitle
    doc
      .fontSize(16)
      .fillColor("#464646")
      .font("Helvetica-Oblique")
      .text("This is to certify that", 0, 160, { align: "center" });

    // Name
    doc
      .fontSize(28)
      .fillColor("#191970")
      .font("Helvetica-BoldOblique")
      .text(certification.userName, 0, 190, { align: "center" });

    // Achievement text
    doc
      .fontSize(16)
      .fillColor("#464646")
      .font("Helvetica")
      .text(
        `has successfully completed the ${certification.category} Certification`,
        0,
        230,
        { align: "center" }
      )
      .text(
        `Score: ${certification.score}/${
          certification.totalQuestions
        } (${certification.percentage.toFixed(1)}%)`,
        0,
        250,
        { align: "center" }
      );

    // Badge
    doc
      .fontSize(20)
      .fillColor("#2e7d32")
      .font("Helvetica-Bold")
      .text(`Grade: ${certification.badgeType.toUpperCase()}`, 0, 280, {
        align: "center",
      });

    // Date and ID
    const issueDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc
      .fontSize(12)
      .fillColor("#646464")
      .font("Helvetica-Oblique")
      .text(`Issued on: ${issueDate}`, 100, pageHeight - 80)
      .text(
        `Certificate ID: ${certification.certificateId}`,
        pageWidth - 250,
        pageHeight - 80
      );

    doc.end();

    return `/certificates/${fileName}`;
  } catch (error) {
    console.error("PDF generation error:", error);
    return null;
  }
}

/**
 * Get Current User's Certifications with Badge Info
 */
router.get("/my-certifications", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching certifications for user ID:", userId);

    // Fetch from both Profile and Certification models
    const [profile, certificationRecords] = await Promise.all([
      Profile.findOne({ user: userId }).populate("user", "name email"),
      Certification.find({ userId, passed: true }).sort({ earnedAt: -1 }),
    ]);

    console.log("Profile found:", !!profile);
    console.log(
      "Profile certifications:",
      profile?.certifications?.length || 0
    );
    console.log("Certification records:", certificationRecords.length);

    const userName = profile?.name || profile?.user?.name || "User";

    // If no profile certifications but certification records exist, rebuild profile
    if (
      (!profile?.certifications || profile.certifications.length === 0) &&
      certificationRecords.length > 0
    ) {
      console.log("Rebuilding profile certifications from records...");

      if (!profile) {
        // Create profile if it doesn't exist
        const newProfile = new Profile({
          user: userId,
          name: userName,
          bio: "",
          skills: [],
          education: [],
          certifications: certificationRecords.map((cert) => ({
            category: cert.category,
            score: cert.score,
            totalQuestions: cert.totalQuestions,
            percentage: cert.percentage,
            certificateId: cert.certificateId,
            badgeType: cert.badgeType,
            earnedAt: cert.earnedAt,
          })),
        });

        newProfile.calculateCompletionPercentage();
        await newProfile.save();
        console.log("Created new profile with certifications");

        return res.json({
          certifications: newProfile.certifications,
          count: newProfile.certifications.length,
          userName: newProfile.name,
        });
      } else {
        // Update existing profile with certifications
        profile.certifications = certificationRecords.map((cert) => ({
          category: cert.category,
          score: cert.score,
          totalQuestions: cert.totalQuestions,
          percentage: cert.percentage,
          certificateId: cert.certificateId,
          badgeType: cert.badgeType,
          earnedAt: cert.earnedAt,
        }));

        profile.calculateCompletionPercentage();
        await profile.save();
        console.log("Updated profile with certifications");

        return res.json({
          certifications: profile.certifications,
          count: profile.certifications.length,
          userName: profile.name,
        });
      }
    }

    if (!profile) {
      return res.json({
        certifications: [],
        count: 0,
        userName: "User",
        message: "No profile found, please complete profile setup",
      });
    }

    // Enhance profile certifications with certification record details
    const enhancedCertifications = profile.certifications.map((cert) => {
      const detailedRecord = certificationRecords.find(
        (record) => record.certificateId === cert.certificateId
      );

      return {
        ...cert.toObject(),
        userName: profile.name,
        badgeType:
          cert.badgeType ||
          detailedRecord?.badgeType ||
          calculateBadgeType(cert.percentage),
        certificateUrl: detailedRecord?.certificateUrl,
        earnedAt: cert.earnedAt || detailedRecord?.earnedAt,
      };
    });

    console.log(
      "Returning enhanced certifications:",
      enhancedCertifications.length
    );

    res.json({
      certifications: enhancedCertifications,
      count: enhancedCertifications.length,
      userName: profile.name,
    });
  } catch (error) {
    console.error("Error fetching my certifications:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

/**
 * Debug endpoint to check user data
 */
router.get("/debug/user-data", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [profile, certificationRecords, user] = await Promise.all([
      Profile.findOne({ user: userId }),
      Certification.find({ userId }),
      require("../models/User").findById(userId),
    ]);

    res.json({
      userId,
      user: user ? { id: user._id, name: user.name, email: user.email } : null,
      profile: profile
        ? {
            id: profile._id,
            name: profile.name,
            certificationsCount: profile.certifications?.length || 0,
            certifications: profile.certifications,
          }
        : null,
      certificationRecords: certificationRecords.map((cert) => ({
        id: cert._id,
        category: cert.category,
        passed: cert.passed,
        score: cert.score,
        percentage: cert.percentage,
        badgeType: cert.badgeType,
        certificateId: cert.certificateId,
        earnedAt: cert.earnedAt,
      })),
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to calculate badge type
function calculateBadgeType(percentage) {
  if (percentage >= 95) return "platinum";
  if (percentage >= 85) return "gold";
  if (percentage >= 75) return "silver";
  return "bronze";
}

module.exports = router;
