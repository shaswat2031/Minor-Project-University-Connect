const Question = require("../models/Question");

const fetchQuestions = async (category) => {
  try {
    const questions = await Question.find({ category }).limit(30);
    return questions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

const mockMCQs = [
  {
    question: "Which of the following data types is immutable in Python?",
    options: ["List", "Dictionary", "Set", "Tuple"],
    correctAnswer: "Tuple",
  },
  {
    question: "What is the default return type of a function in Python?",
    options: ["int", "str", "None", "bool"],
    correctAnswer: "None",
  },
  {
    question: "What is React?",
    options: [
      "A JavaScript library for building user interfaces",
      "A programming language",
      "A database management system",
      "An operating system",
    ],
    correctAnswer: "A JavaScript library for building user interfaces",
  },
  {
    question: "What is JSX?",
    options: [
      "JavaScript XML",
      "Java Syntax Extension",
      "JavaScript Extension",
      "Java XML",
    ],
    correctAnswer: "JavaScript XML",
  },
  // Add more questions here as needed
];

// Export both for flexibility
module.exports = {
  fetchQuestions,
  mockMCQs,
};
