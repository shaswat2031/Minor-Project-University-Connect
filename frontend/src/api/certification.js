import axios from "axios";

// ✅ Use environment variable for API URL (fallback to localhost)
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/certification";

// ✅ Fetch Certification Questions
export const fetchCertificationQuestions = async () => {
  try {
    const response = await axios.get(`${API_URL}/questions?category=React`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching questions:", error.response?.data || error.message);
    return []; // Return an empty array to prevent crashes
  }
};

// ✅ Submit Certification Answers
export const submitCertificationAnswers = async (userId, userName, category, answers, correctAnswers) => {
  const response = await axios.post(`${API_URL}/submit`, { userId, userName, category, answers, correctAnswers });
  return response.data;
};

export const fetchUserCertifications = async (userId) => {
  const response = await axios.get(`${API_URL}/${userId}`);
  return response.data;
};
