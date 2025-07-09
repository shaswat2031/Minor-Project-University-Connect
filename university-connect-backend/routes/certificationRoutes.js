const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const Certificate = require("../models/Certificate");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ✅ Ensure the certificates directory exists
const certificatesDir = path.join(__dirname, "../certificates");
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

// ✅ Serve Static Certificates
router.use("/certificates", express.static(certificatesDir));

/**
 * ✅ Fetch 30 Random MCQs by Category
 */
// Update questions route to include error handling
router.get("/questions", async (req, res) => {
  try {
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

    const questions = await Question.aggregate([
      { $match: { category: category } },
      { $sample: { size: 30 } },
      { $project: { question: 1, options: 1, category: 1 } }, // Don't send correct answers
    ]);

    if (!questions.length) {
      return res
        .status(404)
        .json({ message: `No questions found for ${category} category` });
    }

    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Error fetching questions" });
  }
});

// Add endpoint to get available categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Question.distinct("category");
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const count = await Question.countDocuments({ category });
        return { category, questionCount: count };
      })
    );

    res.json(categoryStats);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
});

/**
 * ✅ Submit Answers & Generate Certificate if Passed
 */
router.post("/submit", async (req, res) => {
  try {
    const { userId, userName, category, answers } = req.body;

    if (!userId || !userName || !category || !answers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Fetch questions with correct answers for scoring
    const questions = await Question.find({ category }).limit(30);
    let score = 0;

    answers.forEach((answer, index) => {
      if (questions[index] && answer === questions[index].correctAnswer) {
        score++;
      }
    });

    const percentage = (score / questions.length) * 100;
    const passed = percentage >= 65;

    // Generate certificate if passed
    let certificateUrl = null;
    if (passed) {
      const doc = new PDFDocument({ layout: "landscape" });
      const fileName = `certificate-${userId}-${Date.now()}.pdf`;
      const filePath = path.join(certificatesDir, fileName);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);
      doc.fontSize(30).text("Certificate of Completion", { align: "center" });
      doc.fontSize(20).text(`Awarded to: ${userName}`, { align: "center" });
      doc
        .fontSize(16)
        .text(`Score: ${score}/${questions.length}`, { align: "center" });
      doc.fontSize(16).text(`Category: ${category}`, { align: "center" });
      doc
        .fontSize(14)
        .text(`Date: ${new Date().toLocaleDateString()}`, { align: "center" });
      doc.end();

      certificateUrl = `/certificates/${fileName}`;
    }

    // Save certification record
    const certification = new Certificate({
      userId,
      userName,
      category,
      score,
      totalQuestions: questions.length,
      certificateUrl,
      passed,
    });

    await certification.save();

    res.json({
      score,
      totalQuestions: questions.length,
      percentage,
      passed,
      certificateUrl,
    });
  } catch (error) {
    console.error("Error submitting certification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Get User's Certifications
 */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const certifications = await Certificate.find({ userId });

    if (!certifications || certifications.length === 0) {
      return res.status(404).json({ message: "No certifications found" });
    }

    res.json(certifications);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
