import axios from 'axios';

// Set base URL for API requests
const BASE_URL = import.meta.env.VITE_API_URL || 'https://minor-project-university-connect.onrender.com';
// Try using an alternative path that might not be blocked by browser extensions
const API_URL = `${BASE_URL}/api/learning-path`;

// Configure axios defaults
axios.defaults.baseURL = BASE_URL;
axios.defaults.timeout = 30000; // 30 second timeout

// Add request interceptor for auth and logging
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
}, (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});

export const generateRoadmap = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/generate`, formData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getRoadmap = async () => {
    try {
        const response = await axios.get(`${API_URL}/get`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
