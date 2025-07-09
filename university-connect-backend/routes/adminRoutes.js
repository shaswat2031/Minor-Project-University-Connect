const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const CodingQuestion = require("../models/CodingQuestion");
const authMiddleware = require("../middleware/authMiddleware");
const { VM } = require("vm2");

// Enhanced admin check middleware
const checkAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // For now, allowing all authenticated users to be admin
    // In production, you should check user role from database
    // const user = await User.findById(req.user.id);
    // if (!user || user.role !== 'admin') {
    //   return res.status(403).json({ message: "Admin access required" });
    // }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// MCQ Question Management
router.post("/mcq/create", checkAdmin, async (req, res) => {
  try {
    const { question, options, correctAnswer, category } = req.body;

    if (!question || !options || !correctAnswer || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return res
        .status(400)
        .json({ message: "Options must be an array of 4 items" });
    }

    if (!options.includes(correctAnswer)) {
      return res
        .status(400)
        .json({ message: "Correct answer must be one of the options" });
    }

    const newQuestion = new Question({
      question,
      options,
      correctAnswer,
      category,
      createdBy: req.user.id,
      createdAt: new Date(),
    });

    await newQuestion.save();
    res.status(201).json({
      message: "MCQ question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    console.error("Error creating MCQ question:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/mcq", async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) {
      filter.question = { $regex: search, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const questions = await Question.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(filter);

    res.json({
      questions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalQuestions: total,
        hasNextPage: skip + parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching MCQ questions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/mcq/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json(question);
  } catch (error) {
    console.error("Error fetching MCQ question:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/mcq/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, correctAnswer, category } = req.body;

    if (!question || !options || !correctAnswer || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return res
        .status(400)
        .json({ message: "Options must be an array of 4 items" });
    }

    if (!options.includes(correctAnswer)) {
      return res
        .status(400)
        .json({ message: "Correct answer must be one of the options" });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        question,
        options,
        correctAnswer,
        category,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating MCQ question:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/mcq/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting MCQ question:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Coding Question Management
router.post("/coding/create", checkAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      category,
      language,
      starterCode,
      constraints,
      testCases,
      timeLimit = 5000,
      memoryLimit = 128,
      tags = [],
    } = req.body;

    if (!title || !description || !difficulty || !category || !language) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one test case is required" });
    }

    // Validate test cases
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      if (!testCase.input || !testCase.expectedOutput) {
        return res.status(400).json({
          message: `Test case ${
            i + 1
          } must have both input and expected output`,
        });
      }
    }

    const newCodingQuestion = new CodingQuestion({
      title,
      description,
      difficulty,
      category,
      language,
      starterCode: starterCode || "",
      constraints: constraints || "",
      testCases,
      timeLimit,
      memoryLimit,
      tags,
      createdBy: req.user.id,
      createdAt: new Date(),
    });

    await newCodingQuestion.save();
    res.status(201).json({
      message: "Coding question created successfully",
      question: newCodingQuestion,
    });
  } catch (error) {
    console.error("Error creating coding question:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/coding", async (req, res) => {
  try {
    const {
      category,
      difficulty,
      language,
      page = 1,
      limit = 10,
      search,
    } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (language) filter.language = language;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const questions = await CodingQuestion.find(filter)
      .select("-testCases.expectedOutput") // Hide expected outputs for security
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await CodingQuestion.countDocuments(filter);

    res.json({
      questions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalQuestions: total,
        hasNextPage: skip + parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching coding questions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/coding/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { showAnswers = false } = req.query;

    let selectFields = "-testCases.expectedOutput";
    if (showAnswers === "true") {
      selectFields = ""; // Show all fields including expected outputs
    }

    const question = await CodingQuestion.findById(id).select(selectFields);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(question);
  } catch (error) {
    console.error("Error fetching coding question:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/coding/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    // Validate test cases if provided
    if (updateData.testCases) {
      if (
        !Array.isArray(updateData.testCases) ||
        updateData.testCases.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "At least one test case is required" });
      }

      for (let i = 0; i < updateData.testCases.length; i++) {
        const testCase = updateData.testCases[i];
        if (!testCase.input || !testCase.expectedOutput) {
          return res.status(400).json({
            message: `Test case ${
              i + 1
            } must have both input and expected output`,
          });
        }
      }
    }

    const updatedQuestion = await CodingQuestion.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({
      message: "Coding question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating coding question:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/coding/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const question = await CodingQuestion.findByIdAndDelete(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ message: "Coding question deleted successfully" });
  } catch (error) {
    console.error("Error deleting coding question:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Code execution endpoint
router.post("/coding/execute", async (req, res) => {
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

// Submit coding solution
router.post("/coding/submit", async (req, res) => {
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

// Get statistics
router.get("/stats", checkAdmin, async (req, res) => {
  try {
    const mcqCount = await Question.countDocuments();
    const codingCount = await CodingQuestion.countDocuments();

    const mcqByCategory = await Question.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const codingByCategory = await CodingQuestion.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const codingByDifficulty = await CodingQuestion.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]);

    res.json({
      totalMCQ: mcqCount,
      totalCoding: codingCount,
      mcqByCategory,
      codingByCategory,
      codingByDifficulty,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
