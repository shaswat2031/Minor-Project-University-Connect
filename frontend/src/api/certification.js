import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/certification`;
const USER_API_URL = `${import.meta.env.VITE_API_URL}/api/users`;

export const fetchCertificationQuestions = async (category = "React") => {
  try {
    const response = await axios.get(`${API_URL}/questions`, {
      params: { category },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

export const fetchUserProfile = async (token) => {
  try {
    const authToken = token || localStorage.getItem("token");
    const response = await axios.get(`${USER_API_URL}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);

    // Try to decode user info from token as fallback
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return {
          _id: payload.id,
          name: "User", // Default name
        };
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError);
      }
    }

    throw error;
  }
};

export const submitCertificationAnswers = async (
  userId,
  userName,
  category,
  answers
) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${API_URL}/submit`,
      {
        userId,
        userName,
        category,
        answers,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting answers:", error);
    throw error;
  }
};

// Fetch user certifications
export const fetchUserCertifications = async (userId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/certification/user/${userId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user certifications:", error);
    throw error;
  }
};

// Fetch current user's certifications
export const fetchMyCertifications = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/certification/my-certifications`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching my certifications:", error);
    throw error;
  }
};

// Fetch certification leaderboard
export const fetchCertificationLeaderboard = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/certification/leaderboard`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

// Get badge color helper
export const getBadgeColor = (badgeType) => {
  const colors = {
    bronze: "text-orange-400",
    silver: "text-gray-400",
    gold: "text-yellow-400",
    platinum: "text-purple-400",
  };
  return colors[badgeType] || "text-gray-400";
};

// Get badge emoji helper
export const getBadgeEmoji = (badgeType) => {
  const emojis = {
    bronze: "🥉",
    silver: "🥈",
    gold: "🥇",
    platinum: "💎",
  };
  return emojis[badgeType] || "🏅";
};
