const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

// ✅ Route to Add Questions (For Admin or Initial Setup)
router.post("/add", async (req, res) => {
  try {
    const { category, question, options, correctAnswer } = req.body;

    if (!category || !question || !options || !correctAnswer) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newQuestion = new Question({ category, question, options, correctAnswer });
    await newQuestion.save();

    res.status(201).json({ message: "Question added successfully" });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ error: "Failed to add question" });
  }
});

// ✅ Route to Fetch 30 Random Questions by Category
router.get("/questions", async (req, res) => {
  try {
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    // Fetch 30 random questions from the database
    const questions = await Question.aggregate([
      { $match: { category } }, // Filter by category
      { $sample: { size: 30 } }  // Randomly select 30 questions
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ error: "No questions found for this category" });
    }

    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

module.exports = router;
