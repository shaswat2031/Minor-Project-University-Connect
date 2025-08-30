import React, { useState, useEffect } from 'react';

const AIRoadmapGenerator = () => {
  const [careerGoal, setCareerGoal] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRoadmap = async (careerGoal, currentSkills, timeframe) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roadmap/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          career: careerGoal,
          currentSkills: currentSkills,
          timeframe: timeframe,
          maxReadingTime: 4, // Limit to 4 minutes maximum
          contentLength: 'concise' // Request concise content
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setRoadmap(data.roadmap);
    } catch (error) {
      setError('Failed to generate roadmap. Please try again later.');
      console.error('Error generating roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    generateRoadmap(careerGoal, currentSkills, timeframe);
  };

  return (
    <div className="roadmap-generator">
      <h2>AI Roadmap Generator</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Career Goal:</label>
          <input
            type="text"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            required
          />