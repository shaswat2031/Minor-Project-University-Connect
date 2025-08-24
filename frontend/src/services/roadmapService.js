import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/roadmap`;

export const createRoadmap = async (roadmapData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(API_URL, roadmapData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getUserRoadmaps = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getRoadmapById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
