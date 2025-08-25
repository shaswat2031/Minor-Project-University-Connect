import axios from 'axios';

// Set base URL for API requests
const BASE_URL = import.meta.env.VITE_API_URL || 'https://minor-project-university-connect.onrender.com';
// Try using paths that might not be blocked by browser extensions
const API_PATHS = [
    `${BASE_URL}/api/learning-path`,
    `${BASE_URL}/api/ai-roadmap`,
    `${BASE_URL}/api/roadmap/gemini`
];

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
    let lastError = null;
    
    // Try each API path in sequence until one works
    for (const apiPath of API_PATHS) {
        try {
            console.log(`Trying to generate roadmap with API path: ${apiPath}`);
            const response = await axios.post(`${apiPath}/generate`, formData);
            console.log(`Successfully generated roadmap with API path: ${apiPath}`);
            return response.data;
        } catch (error) {
            console.error(`Error with API path ${apiPath}:`, error.message);
            lastError = error.response?.data || error.message;
            // Continue to the next API path
        }
    }
    
    // If we get here, all paths failed
    throw lastError || new Error('Failed to generate roadmap with all available API paths');
};

export const getRoadmap = async () => {
    let lastError = null;
    
    // Try each API path in sequence until one works
    for (const apiPath of API_PATHS) {
        try {
            console.log(`Trying to get roadmap with API path: ${apiPath}`);
            const response = await axios.get(`${apiPath}/get`);
            console.log(`Successfully retrieved roadmap with API path: ${apiPath}`);
            return response.data;
        } catch (error) {
            console.error(`Error with API path ${apiPath}:`, error.message);
            lastError = error.response?.data || error.message;
            // Continue to the next API path
        }
    }
    
    // If we get here, all paths failed
    throw lastError || new Error('Failed to retrieve roadmap with all available API paths');
};
