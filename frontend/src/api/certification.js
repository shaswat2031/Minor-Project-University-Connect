import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/certification`;
const USER_API_URL = `${import.meta.env.VITE_API_URL}/api/users`;

// Add the missing fetchCertificationQuestions function
export const fetchCertificationQuestions = async () => {
  try {
    const response = await axios.get(`${API_URL}/questions`, {
      params: { category: "React" }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

// Add fetchUserProfile function
export const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${USER_API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Add this function
export const fetchUserProfile = async (token) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Update the submitCertificationAnswers function
export const submitCertificationAnswers = async (userId, userName, category, answers) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_URL}/submit`, {
      userId,
      userName,
      category,
      answers
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting answers:", error);
    throw error;
  }
};

export const fetchUserCertifications = async (userId) => {
  const response = await axios.get(`${API_URL}/${userId}`);
  return response.data;
};
