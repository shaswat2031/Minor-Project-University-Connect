import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import ReactFlow, { 
    Background, 
    Controls,
    applyEdgeChanges,
    applyNodeChanges,
    MiniMap
} from 'react-flow-renderer';
import { generateRoadmap, getRoadmap } from '../services/aiRoadmapService';
import { FiSun, FiMoon, FiCalendar, FiBookOpen, FiClock, FiLink } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Custom node renderer for day nodes
const DayNode = ({ data }) => {
    return (
        <div className="p-4 rounded-lg border-2 shadow-lg w-72 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-blue-300 dark:border-blue-700">
            <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center">
                <FiCalendar className="mr-2" /> {data.label}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{data.description}</p>
            
            {data.content && (
                <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center">
                        <FiBookOpen className="mr-1" /> Today&apos;s Learning
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{data.content}</p>
                </div>
            )}
            
            {data.estimatedHours && (
                <div className="mb-3 flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <FiClock className="mr-1" /> 
                    <span>Estimated time: <span className="font-medium">{data.estimatedHours} hours</span></span>
                </div>
            )}
            
            {data.resources && data.resources.length > 0 && (
                <div className="mb-2">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center">
                        <FiLink className="mr-1" /> Resources
                    </h4>
                    <ul className="text-xs space-y-1">
                        {Array.isArray(data.resources) ? (
                            data.resources.map((resource, index) => (
                                <li key={index} className="truncate">
                                    {typeof resource === 'object' ? (
                                        <a 
                                            href={resource.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {resource.title}
                                        </a>
                                    ) : (
                                        <a 
                                            href={resource} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {resource}
                                        </a>
                                    )}
                                </li>
                            ))
                        ) : (
                            <li className="truncate">
                                <a 
                                    href={data.resources} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Learning Resource
                                </a>
                            </li>
                        )}
                    </ul>
                </div>
            )}
            
            {data.difficulty && (
                <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold 
                        ${data.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                        data.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                    >
                        {data.difficulty}
                    </span>
                </div>
            )}
        </div>
    );
};

// Custom Panel component since it's not available in react-flow-renderer v10
const Panel = ({ position, children }) => {
    const getPositionStyles = () => {
        switch (position) {
            case 'top-left':
                return { top: 10, left: 10 };
            case 'top-right':
                return { top: 10, right: 10 };
            case 'bottom-left':
                return { bottom: 10, left: 10 };
            case 'bottom-right':
                return { bottom: 10, right: 10 };
            default:
                return { top: 10, right: 10 };
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                zIndex: 5,
                ...getPositionStyles()
            }}
        >
            {children}
        </div>
    );
};

Panel.propTypes = {
    position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
    children: PropTypes.node.isRequired
};

// PropTypes definition for DayNode
DayNode.propTypes = {
    data: PropTypes.shape({
        label: PropTypes.string,
        description: PropTypes.string,
        content: PropTypes.string,
        estimatedHours: PropTypes.number,
        resources: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(
                PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.shape({
                        title: PropTypes.string,
                        url: PropTypes.string,
                        type: PropTypes.string
                    })
                ])
            )
        ]),
        difficulty: PropTypes.string,
        exercises: PropTypes.arrayOf(PropTypes.string)
    }).isRequired
};

const AIRoadmap = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        goals: '',
        currentLevel: 'Beginner',
        interests: '',
        timeCommitment: ''
    });
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [error, setError] = useState('');
    const [roadmapGenerated, setRoadmapGenerated] = useState(false);
    const [theme, setTheme] = useState('light');
    const [roadmapMetadata, setRoadmapMetadata] = useState(null);
    const [currentDay, setCurrentDay] = useState(null);
    
    // Try to load existing roadmap on component mount
    useEffect(() => {
        const fetchExistingRoadmap = async () => {
            try {
                setIsLoading(true);
                const response = await getRoadmap();
                if (response && response.roadmapData) {
                    setNodes(
                        response.roadmapData.nodes.map(node => ({
                            ...node,
                            type: 'custom'
                        }))
                    );
                    setEdges(response.roadmapData.edges);
                    setRoadmapMetadata(response.roadmapData.metadata);
                    setRoadmapGenerated(true);
                }
            } catch {
                // Ignore error if roadmap not found
                console.log('No existing roadmap found');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchExistingRoadmap();
    }, []);
    
    // Node types for custom rendering
    const nodeTypes = useMemo(() => ({ custom: DayNode }), []);
    
    // Theme styles
    const themeStyles = useMemo(() => {
        if (!roadmapMetadata || !roadmapMetadata.themes) {
            return {
                background: theme === 'light' ? '#f8fafc' : '#1e293b',
                text: theme === 'light' ? '#334155' : '#f1f5f9',
                primary: theme === 'light' ? '#3b82f6' : '#60a5fa',
                secondary: theme === 'light' ? '#10b981' : '#34d399',
                accent: theme === 'light' ? '#f97316' : '#fb923c'
            };
        }
        
        return roadmapMetadata.themes[theme];
    }, [roadmapMetadata, theme]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const interests = formData.interests.split(',').map(i => i.trim());
            const response = await generateRoadmap({
                ...formData,
                interests
            });

            // Map nodes to include custom type
            const mappedNodes = response.roadmapData.nodes.map(node => ({
                ...node,
                type: 'custom'
            }));
            
            setNodes(mappedNodes);
            setEdges(response.roadmapData.edges);
            setRoadmapMetadata(response.roadmapData.metadata);
            setRoadmapGenerated(true);
            
            // Set current day to the first day
            if (mappedNodes.length > 0) {
                setCurrentDay(mappedNodes[0]);
            }
            
        } catch (err) {
            setError(err.message || 'Failed to generate roadmap');
        } finally {
            setIsLoading(false);
        }
    };

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );
    
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };
    
    const handleNodeClick = (event, node) => {
        setCurrentDay(node);
    };

    return (
        <div 
            className={`min-h-screen transition-colors duration-300 ${
                theme === 'light' ? 'bg-gray-50' : 'bg-gray-900 text-white'
            }`}
            style={{ 
                backgroundColor: themeStyles.background,
                color: themeStyles.text
            }}
        >
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <motion.h1 
                        className="text-3xl font-bold"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ color: themeStyles.primary }}
                    >
                        AI Learning Roadmap Generator
                    </motion.h1>
                    
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-full ${
                            theme === 'light' 
                                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        }`}
                    >
                        {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
                    </button>
                </div>
                
                {!roadmapGenerated ? (
                    <motion.div 
                        className="max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className={`p-6 rounded-lg shadow-lg ${
                            theme === 'light' ? 'bg-white' : 'bg-gray-800'
                        }`}>
                            <h2 className="text-xl font-semibold mb-4" style={{ color: themeStyles.primary }}>
                                Create Your Personalized Learning Path
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        What are your learning goals?
                                    </label>
                                    <textarea
                                        name="goals"
                                        value={formData.goals}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm p-3 ${
                                            theme === 'light' 
                                                ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' 
                                                : 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400 text-white'
                                        }`}
                                        rows="3"
                                        placeholder="e.g., I want to learn React.js to build interactive web applications"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Current Level
                                    </label>
                                    <select
                                        name="currentLevel"
                                        value={formData.currentLevel}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm p-3 ${
                                            theme === 'light' 
                                                ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' 
                                                : 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400 text-white'
                                        }`}
                                        required
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Interests (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="interests"
                                        value={formData.interests}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm p-3 ${
                                            theme === 'light' 
                                                ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' 
                                                : 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400 text-white'
                                        }`}
                                        placeholder="e.g., UI Components, State Management, API Integration"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Time Commitment
                                    </label>
                                    <select
                                        name="timeCommitment"
                                        value={formData.timeCommitment}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm p-3 ${
                                            theme === 'light' 
                                                ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' 
                                                : 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400 text-white'
                                        }`}
                                        required
                                    >
                                        <option value="">Select time commitment</option>
                                        <option value="1-2 hours/day">1-2 hours/day</option>
                                        <option value="2-4 hours/day">2-4 hours/day</option>
                                        <option value="4+ hours/day">4+ hours/day</option>
                                        <option value="Weekends only">Weekends only</option>
                                    </select>
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    style={{ 
                                        backgroundColor: isLoading ? '#9ca3af' : themeStyles.primary,
                                        color: '#ffffff'
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isLoading ? 'Generating Your Roadmap...' : 'Generate My Learning Roadmap'}
                                </motion.button>
                            </form>

                            {error && (
                                <div className="mt-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                    {error}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className={`lg:col-span-2 rounded-lg shadow-lg ${
                            theme === 'light' ? 'bg-white' : 'bg-gray-800'
                        }`} style={{ height: '70vh', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 5 }}>
                                <button
                                    onClick={() => setRoadmapGenerated(false)}
                                    className="px-4 py-2 text-sm rounded font-medium transition-colors"
                                    style={{ 
                                        backgroundColor: theme === 'light' ? '#e5e7eb' : '#374151',
                                        color: theme === 'light' ? '#374151' : '#e5e7eb'
                                    }}
                                >
                                    Create New Roadmap
                                </button>
                            </div>
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                nodeTypes={nodeTypes}
                                onNodeClick={handleNodeClick}
                                fitView
                                attributionPosition="bottom-right"
                            >
                                <Background 
                                    color={theme === 'light' ? '#a1a1aa' : '#3f3f46'} 
                                    gap={16} 
                                    size={1} 
                                />
                                <Controls 
                                    className={theme === 'light' ? '' : 'dark-controls'}
                                    style={{ 
                                        button: { 
                                            backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                                            color: theme === 'light' ? '#374151' : '#ffffff',
                                            borderColor: theme === 'light' ? '#e5e7eb' : '#4b5563'
                                        }
                                    }}
                                />
                                <MiniMap
                                    style={{
                                        backgroundColor: theme === 'light' ? '#f8fafc' : '#1e293b'
                                    }}
                                    nodeColor={theme === 'light' ? '#60a5fa' : '#3b82f6'}
                                />
                            </ReactFlow>
                        </div>
                        
                        <div>
                            {currentDay && (
                                <motion.div 
                                    className={`p-6 rounded-lg shadow-lg ${
                                        theme === 'light' ? 'bg-white' : 'bg-gray-800'
                                    }`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={currentDay.id}
                                >
                                    <h2 className="text-xl font-bold mb-4" style={{ color: themeStyles.primary }}>
                                        {currentDay.data.label}
                                    </h2>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-medium" style={{ color: themeStyles.secondary }}>Description:</h3>
                                            <p className="mt-1">{currentDay.data.description}</p>
                                        </div>
                                        
                                        {currentDay.data.content && (
                                            <div>
                                                <h3 className="font-medium" style={{ color: themeStyles.secondary }}>Today&apos;s Learning:</h3>
                                                <p className="mt-1">{currentDay.data.content}</p>
                                            </div>
                                        )}
                                        
                                        {currentDay.data.exercises && currentDay.data.exercises.length > 0 && (
                                            <div>
                                                <h3 className="font-medium" style={{ color: themeStyles.secondary }}>Exercises:</h3>
                                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                                    {currentDay.data.exercises.map((exercise, index) => (
                                                        <li key={index}>{exercise}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {currentDay.data.resources && currentDay.data.resources.length > 0 && (
                                            <div>
                                                <h3 className="font-medium" style={{ color: themeStyles.secondary }}>Resources:</h3>
                                                <div className="mt-1 space-y-2">
                                                    {Array.isArray(currentDay.data.resources) ? (
                                                        currentDay.data.resources.map((resource, index) => (
                                                            <a 
                                                                key={index}
                                                                href={typeof resource === 'object' ? resource.url : resource} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="block p-3 rounded border hover:shadow-md transition-shadow"
                                                                style={{ 
                                                                    borderColor: theme === 'light' ? '#e5e7eb' : '#4b5563',
                                                                    color: themeStyles.primary 
                                                                }}
                                                            >
                                                                {typeof resource === 'object' ? (
                                                                    <>
                                                                        <div className="font-medium">{resource.title}</div>
                                                                        {resource.type && (
                                                                            <div className="text-xs mt-1 uppercase tracking-wide">
                                                                                {resource.type}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : resource}
                                                            </a>
                                                        ))
                                                    ) : (
                                                        <a 
                                                            href={currentDay.data.resources} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="block p-3 rounded border hover:shadow-md transition-shadow"
                                                            style={{ 
                                                                borderColor: theme === 'light' ? '#e5e7eb' : '#4b5563',
                                                                color: themeStyles.primary 
                                                            }}
                                                        >
                                                            Learning Resource
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIRoadmap;
