import { useState, useEffect } from 'react';
import { fetchMyCertifications } from '../api/certification';
import axios from 'axios';

/**
 * Custom hook for fetching and auto-refreshing certifications
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoRefresh - Whether to automatically refresh certifications
 * @param {number} options.refreshInterval - Interval in milliseconds to refresh certifications
 * @returns {Object} Certification data and loading state
 */
const useCertifications = (options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 60000, // Default: refresh every minute
  } = options;

  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Fetch certifications function
  const fetchCertifications = async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("Authentication required");
      }

      // Try using the API helper first
      try {
        const result = await fetchMyCertifications();
        
        if (result && result.certifications) {
          setCertifications(result.certifications);
          setLastRefreshed(new Date());
          setError(null);
          return result.certifications;
        }
      } catch (apiError) {
        console.warn("API helper failed, falling back to direct API call", apiError);
      }

      // Fallback to direct API call
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/certifications/my-certifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.certifications) {
        setCertifications(response.data.certifications);
        setLastRefreshed(new Date());
        setError(null);
        return response.data.certifications;
      } else {
        setCertifications([]);
        setError("No certifications found");
        return [];
      }
    } catch (err) {
      console.error("Error fetching certifications:", err);
      setError(err.message || "Failed to fetch certifications");
      return [];
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCertifications();
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchCertifications(true); // Silent refresh (don't show loading state)
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval]);

  return {
    certifications,
    loading,
    error,
    lastRefreshed,
    refresh: () => fetchCertifications(), // Expose refresh function
  };
};

export default useCertifications;
