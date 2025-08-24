import axios from "axios";

// ✅ Use Environment Variable for API URL (Fallback to Localhost)
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/certifications`;

// ✅ Fetch Only React Certification Questions
export const fetchCertificationQuestions = async (category = "React") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/questions`, {
      params: { category },
    });
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching questions:",
      error.response?.data || error.message
    );
    return []; // ✅ Return an empty array to prevent crashes
  }
};

// ✅ Submit Certification Answers for React
export const submitCertificationAnswers = async (
  userId,
  userName,
  category,
  answers
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/submit`, {
      userId,
      userName,
      category,
      answers,
    });

    return response.data; // ✅ Now includes `score` and `certificateUrl`
  } catch (error) {
    console.error(
      "❌ Error submitting certification answers:",
      error.response?.data || error.message
    );
    return { passed: false, message: "Submission failed. Please try again." }; // ✅ Handle errors gracefully
  }
};

// ✅ Fetch User Certifications
export const fetchUserCertifications = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching certifications:",
      error.response?.data || error.message
    );
    return []; // ✅ Return an empty array to prevent UI crashes
  }
};
