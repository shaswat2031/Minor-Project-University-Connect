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
router.get("/questions", async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) return res.status(400).json({ error: "Category is required" });

    const questions = await Question.aggregate([
      { $match: { category } },
      { $sample: { size: 30 } },
    ]);

    if (questions.length === 0) return res.status(404).json({ error: "No questions found" });

    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
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

    // Fetch correct answers from DB
    const questions = await Question.find({ category });
    if (questions.length === 0) return res.status(404).json({ message: "No questions found" });

    let correctAnswers = questions.map(q => q.correctAnswer);
    
    // Calculate score
    let score = 0;
    answers.forEach((ans, index) => {
      if (ans === correctAnswers[index]) score++;
    });

    const totalQuestions = correctAnswers.length;
    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= 65;

    let certificateUrl = null;

    if (passed) {
      // ✅ Generate certificate
      certificateUrl = `/certificates/${userId}-${category}.pdf`;
      const certificatePath = path.join(certificatesDir, `${userId}-${category}.pdf`);

      const doc = new PDFDocument({ size: "A4", layout: "landscape" });
      const writeStream = fs.createWriteStream(certificatePath);
      doc.pipe(writeStream);

      // 🎨 Certificate Design
      doc.fontSize(30).text("Certificate of Completion", { align: "center" });
      doc.moveDown();
      doc.fontSize(20).text("This is to certify that", { align: "center" });
      doc.moveDown();
      doc.fontSize(25).text(userName, { align: "center", underline: true });
      doc.moveDown();
      doc.fontSize(20).text(`Has successfully passed the ${category} Certification Test`, { align: "center" });
      doc.moveDown();
      doc.fontSize(15).text(`Issued on: ${new Date().toLocaleDateString()}`, { align: "center" });

      doc.end();

      await new Promise((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });
    }

    // ✅ Save result to database
    const certification = new Certificate({
      userId,
      userName,
      category,
      score,
      totalQuestions,
      certificateUrl,
      passed,
    });

    await certification.save();

    res.json({ score, totalQuestions, passed, certificateUrl });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Server Error", error });
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
