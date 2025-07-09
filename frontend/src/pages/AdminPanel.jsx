import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCode,
  FaQuestionCircle,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("mcq");
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMcqModal, setShowMcqModal] = useState(false);
  const [showCodingModal, setShowCodingModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // MCQ Form State
  const [mcqForm, setMcqForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    category: "",
  });

  // Coding Question Form State
  const [codingForm, setCodingForm] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    category: "",
    language: "JavaScript",
    starterCode: "",
    constraints: "",
    testCases: [{ input: "", expectedOutput: "", isHidden: false }],
    timeLimit: 5000,
    memoryLimit: 128,
    tags: [],
  });

  const categories = [
    "React",
    "JavaScript",
    "Python",
    "Java",
    "Data Structures",
    "Algorithms",
    "Web Development",
    "Node.js",
    "MongoDB",
    "Express.js",
  ];

  const difficulties = ["Easy", "Medium", "Hard"];
  const languages = ["JavaScript", "Python", "Java", "C++", "C"];

  // Fetch MCQ Questions
  const fetchMcqQuestions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/mcq`,
        {
          params: {
            page,
            limit: 10,
            category: filterCategory || undefined,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMcqQuestions(response.data.questions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching MCQ questions:", error);
      alert("Failed to fetch MCQ questions");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Coding Questions
  const fetchCodingQuestions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/coding`,
        {
          params: {
            page,
            limit: 10,
            category: filterCategory || undefined,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCodingQuestions(response.data.questions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching coding questions:", error);
      alert("Failed to fetch coding questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "mcq") {
      fetchMcqQuestions(currentPage);
    } else {
      fetchCodingQuestions(currentPage);
    }
  }, [activeTab, currentPage, filterCategory]);

  // Handle MCQ Form Submit
  const handleMcqSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingQuestion
        ? `${import.meta.env.VITE_API_URL}/api/admin/mcq/${editingQuestion._id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/mcq/create`;

      const method = editingQuestion ? "put" : "post";

      await axios[method](url, mcqForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      alert(
        `MCQ question ${editingQuestion ? "updated" : "created"} successfully!`
      );
      setShowMcqModal(false);
      setEditingQuestion(null);
      setMcqForm({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        category: "",
      });
      fetchMcqQuestions(currentPage);
    } catch (error) {
      console.error("Error saving MCQ question:", error);
      alert("Failed to save MCQ question");
    }
  };

  // Handle Coding Form Submit
  const handleCodingSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingQuestion
        ? `${import.meta.env.VITE_API_URL}/api/admin/coding/${
            editingQuestion._id
          }`
        : `${import.meta.env.VITE_API_URL}/api/admin/coding/create`;

      const method = editingQuestion ? "put" : "post";

      await axios[method](url, codingForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      alert(
        `Coding question ${
          editingQuestion ? "updated" : "created"
        } successfully!`
      );
      setShowCodingModal(false);
      setEditingQuestion(null);
      setCodingForm({
        title: "",
        description: "",
        difficulty: "Easy",
        category: "",
        language: "JavaScript",
        starterCode: "",
        constraints: "",
        testCases: [{ input: "", expectedOutput: "", isHidden: false }],
        timeLimit: 5000,
        memoryLimit: 128,
        tags: [],
      });
      fetchCodingQuestions(currentPage);
    } catch (error) {
      console.error("Error saving coding question:", error);
      alert("Failed to save coding question");
    }
  };

  // Delete Question
  const deleteQuestion = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/${type}/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      alert("Question deleted successfully!");
      if (type === "mcq") {
        fetchMcqQuestions(currentPage);
      } else {
        fetchCodingQuestions(currentPage);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question");
    }
  };

  // Edit Question
  const editQuestion = (question, type) => {
    setEditingQuestion(question);
    if (type === "mcq") {
      setMcqForm(question);
      setShowMcqModal(true);
    } else {
      setCodingForm(question);
      setShowCodingModal(true);
    }
  };

  // Add Test Case
  const addTestCase = () => {
    setCodingForm({
      ...codingForm,
      testCases: [
        ...codingForm.testCases,
        { input: "", expectedOutput: "", isHidden: false },
      ],
    });
  };

  // Remove Test Case
  const removeTestCase = (index) => {
    setCodingForm({
      ...codingForm,
      testCases: codingForm.testCases.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-300">Manage MCQ and Coding Questions</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab("mcq")}
            className={`px-6 py-3 rounded-l-lg font-semibold transition ${
              activeTab === "mcq"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <FaQuestionCircle className="inline mr-2" />
            MCQ Questions
          </button>
          <button
            onClick={() => setActiveTab("coding")}
            className={`px-6 py-3 rounded-r-lg font-semibold transition ${
              activeTab === "coding"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <FaCode className="inline mr-2" />
            Coding Questions
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                if (activeTab === "mcq") {
                  setShowMcqModal(true);
                } else {
                  setShowCodingModal(true);
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <FaPlus />
              Add {activeTab === "mcq" ? "MCQ" : "Coding"} Question
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading questions...</p>
            </div>
          ) : (
            <>
              {activeTab === "mcq" ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-white">
                          Question
                        </th>
                        <th className="px-6 py-3 text-left text-white">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-white">
                          Correct Answer
                        </th>
                        <th className="px-6 py-3 text-left text-white">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mcqQuestions
                        .filter((q) =>
                          q.question
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map((question) => (
                          <tr
                            key={question._id}
                            className="border-b border-gray-700 hover:bg-gray-700"
                          >
                            <td className="px-6 py-4 text-gray-300">
                              {question.question.substring(0, 100)}...
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {question.category}
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {question.correctAnswer}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => editQuestion(question, "mcq")}
                                  className="p-2 text-blue-400 hover:text-blue-300"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() =>
                                    deleteQuestion(question._id, "mcq")
                                  }
                                  className="p-2 text-red-400 hover:text-red-300"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-white">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-white">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-white">
                          Difficulty
                        </th>
                        <th className="px-6 py-3 text-left text-white">
                          Language
                        </th>
                        <th className="px-6 py-3 text-left text-white">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {codingQuestions
                        .filter((q) =>
                          q.title
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map((question) => (
                          <tr
                            key={question._id}
                            className="border-b border-gray-700 hover:bg-gray-700"
                          >
                            <td className="px-6 py-4 text-gray-300">
                              {question.title}
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {question.category}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  question.difficulty === "Easy"
                                    ? "bg-green-600 text-white"
                                    : question.difficulty === "Medium"
                                    ? "bg-yellow-600 text-white"
                                    : "bg-red-600 text-white"
                                }`}
                              >
                                {question.difficulty}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {question.language}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    editQuestion(question, "coding")
                                  }
                                  className="p-2 text-blue-400 hover:text-blue-300"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() =>
                                    deleteQuestion(question._id, "coding")
                                  }
                                  className="p-2 text-red-400 hover:text-red-300"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MCQ Modal */}
        {showMcqModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingQuestion ? "Edit" : "Add"} MCQ Question
              </h2>
              <form onSubmit={handleMcqSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Question</label>
                  <textarea
                    value={mcqForm.question}
                    onChange={(e) =>
                      setMcqForm({ ...mcqForm, question: e.target.value })
                    }
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Category</label>
                  <select
                    value={mcqForm.category}
                    onChange={(e) =>
                      setMcqForm({ ...mcqForm, category: e.target.value })
                    }
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Options</label>
                  {mcqForm.options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...mcqForm.options];
                        newOptions[index] = e.target.value;
                        setMcqForm({ ...mcqForm, options: newOptions });
                      }}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                  ))}
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">
                    Correct Answer
                  </label>
                  <select
                    value={mcqForm.correctAnswer}
                    onChange={(e) =>
                      setMcqForm({ ...mcqForm, correctAnswer: e.target.value })
                    }
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Correct Answer</option>
                    {mcqForm.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingQuestion ? "Update" : "Create"} Question
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMcqModal(false);
                      setEditingQuestion(null);
                      setMcqForm({
                        question: "",
                        options: ["", "", "", ""],
                        correctAnswer: "",
                        category: "",
                      });
                    }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Coding Question Modal */}
        {showCodingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingQuestion ? "Edit" : "Add"} Coding Question
              </h2>
              <form onSubmit={handleCodingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={codingForm.title}
                      onChange={(e) =>
                        setCodingForm({ ...codingForm, title: e.target.value })
                      }
                      className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Category</label>
                    <select
                      value={codingForm.category}
                      onChange={(e) =>
                        setCodingForm({
                          ...codingForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={codingForm.difficulty}
                      onChange={(e) =>
                        setCodingForm({
                          ...codingForm,
                          difficulty: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {difficulties.map((diff) => (
                        <option key={diff} value={diff}>
                          {diff}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Language</label>
                    <select
                      value={codingForm.language}
                      onChange={(e) =>
                        setCodingForm({
                          ...codingForm,
                          language: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">
                      Time Limit (ms)
                    </label>
                    <input
                      type="number"
                      value={codingForm.timeLimit}
                      onChange={(e) =>
                        setCodingForm({
                          ...codingForm,
                          timeLimit: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={codingForm.description}
                    onChange={(e) =>
                      setCodingForm({
                        ...codingForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    Starter Code
                  </label>
                  <textarea
                    value={codingForm.starterCode}
                    onChange={(e) =>
                      setCodingForm({
                        ...codingForm,
                        starterCode: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    rows="4"
                    placeholder="function solution(input) {&#10;  // Your code here&#10;}"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Test Cases</label>
                  {codingForm.testCases.map((testCase, index) => (
                    <div
                      key={index}
                      className="border border-gray-600 rounded-lg p-4 mb-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-white font-semibold">
                          Test Case {index + 1}
                        </h4>
                        {codingForm.testCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTestCase(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 mb-1">
                            Input
                          </label>
                          <textarea
                            value={testCase.input}
                            onChange={(e) => {
                              const newTestCases = [...codingForm.testCases];
                              newTestCases[index].input = e.target.value;
                              setCodingForm({
                                ...codingForm,
                                testCases: newTestCases,
                              });
                            }}
                            className="w-full p-2 bg-gray-600 text-white rounded font-mono text-sm"
                            rows="2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 mb-1">
                            Expected Output
                          </label>
                          <textarea
                            value={testCase.expectedOutput}
                            onChange={(e) => {
                              const newTestCases = [...codingForm.testCases];
                              newTestCases[index].expectedOutput =
                                e.target.value;
                              setCodingForm({
                                ...codingForm,
                                testCases: newTestCases,
                              });
                            }}
                            className="w-full p-2 bg-gray-600 text-white rounded font-mono text-sm"
                            rows="2"
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="flex items-center text-gray-400">
                          <input
                            type="checkbox"
                            checked={testCase.isHidden}
                            onChange={(e) => {
                              const newTestCases = [...codingForm.testCases];
                              newTestCases[index].isHidden = e.target.checked;
                              setCodingForm({
                                ...codingForm,
                                testCases: newTestCases,
                              });
                            }}
                            className="mr-2"
                          />
                          Hidden Test Case
                        </label>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTestCase}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    <FaPlus className="inline mr-2" />
                    Add Test Case
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingQuestion ? "Update" : "Create"} Question
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCodingModal(false);
                      setEditingQuestion(null);
                      setCodingForm({
                        title: "",
                        description: "",
                        difficulty: "Easy",
                        category: "",
                        language: "JavaScript",
                        starterCode: "",
                        constraints: "",
                        testCases: [
                          { input: "", expectedOutput: "", isHidden: false },
                        ],
                        timeLimit: 5000,
                        memoryLimit: 128,
                        tags: [],
                      });
                    }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
