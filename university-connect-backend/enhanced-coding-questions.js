require('dotenv').config();
const mongoose = require('mongoose');
const CodingQuestion = require('./models/CodingQuestion');

async function addEnhancedCodingQuestions() {
  try {
    console.log('🚀 Adding enhanced coding questions for certifications...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const enhancedQuestions = [
      // JavaScript Advanced
      {
        title: "Async Function Chain",
        description: "Create a function that chains multiple async operations and handles errors gracefully. The function should accept an array of async functions and execute them in sequence, passing the result of each to the next.",
        language: "JavaScript",
        difficulty: "Hard",
        category: "JavaScript",
        timeLimit: 45,
        memoryLimit: 128000,
        starterCode: `async function chainAsyncOperations(asyncFunctions, initialValue) {
    // Your solution here
    // Should handle errors and return final result
    
}

// Test with these functions (don't modify):
const asyncAdd = async (x) => x + 1;
const asyncMultiply = async (x) => x * 2;
const asyncSubtract = async (x) => x - 3;`,
        constraints: "Functions array length: 1-10\nEach function processes numbers\nHandle async/await properly",
        testCases: [
          {
            input: "[[asyncAdd, asyncMultiply, asyncSubtract], 5]",
            expectedOutput: "9"
          },
          {
            input: "[[asyncAdd], 10]",
            expectedOutput: "11"
          },
          {
            input: "[[asyncMultiply, asyncAdd], 3]",
            expectedOutput: "7"
          }
        ],
        tags: ["async", "promises", "error-handling"]
      },

      // React Component Challenge
      {
        title: "Custom Hook Implementation",
        description: "Create a custom React hook called useLocalStorage that manages localStorage state with React state synchronization. The hook should handle JSON serialization and provide both getter and setter functionality.",
        language: "JavaScript",
        difficulty: "Medium",
        category: "React",
        timeLimit: 30,
        memoryLimit: 128000,
        starterCode: `import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
    // Your implementation here
    // Return [value, setValue] like useState
    
}

export default useLocalStorage;`,
        constraints: "Handle JSON parse/stringify errors\nSync with localStorage changes\nWork like useState hook",
        testCases: [
          {
            input: "['test-key', 'default']",
            expectedOutput: "['default', function]"
          },
          {
            input: "['user-data', {name: 'John'}]",
            expectedOutput: "[{name: 'John'}, function]"
          }
        ],
        tags: ["react", "hooks", "localStorage"]
      },

      // Python Data Structures
      {
        title: "Binary Tree Level Order Traversal",
        description: "Given the root of a binary tree, return the level order traversal of its nodes' values as a list of lists, where each inner list contains the values of nodes at that level.",
        language: "Python",
        difficulty: "Medium",
        category: "Data Structures",
        timeLimit: 30,
        memoryLimit: 128000,
        starterCode: `# Definition for a binary tree node
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def levelOrder(root):
    # Your solution here
    
    pass`,
        constraints: "Number of nodes: 0 ≤ n ≤ 2000\nNode values: -1000 ≤ val ≤ 1000",
        testCases: [
          {
            input: "[3,9,20,null,null,15,7]",
            expectedOutput: "[[3],[9,20],[15,7]]"
          },
          {
            input: "[1]",
            expectedOutput: "[[1]]"
          },
          {
            input: "[]",
            expectedOutput: "[]"
          }
        ],
        tags: ["binary-tree", "bfs", "queue"]
      },

      // Algorithms Challenge
      {
        title: "Dynamic Programming - Coin Change",
        description: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins needed to make up that amount. If impossible, return -1.",
        language: "Python",
        difficulty: "Medium",
        category: "Algorithms",
        timeLimit: 30,
        memoryLimit: 128000,
        starterCode: `def coinChange(coins, amount):
    # Your solution here using dynamic programming
    
    pass`,
        constraints: "1 ≤ coins.length ≤ 12\n1 ≤ coins[i] ≤ 2^31 - 1\n0 ≤ amount ≤ 10^4",
        testCases: [
          {
            input: "[1,3,4]\n6",
            expectedOutput: "2"
          },
          {
            input: "[2]\n3",
            expectedOutput: "-1"
          },
          {
            input: "[1]\n0",
            expectedOutput: "0"
          }
        ],
        tags: ["dynamic-programming", "optimization"]
      },

      // Java OOP Challenge
      {
        title: "Design Pattern - Observer",
        description: "Implement the Observer design pattern. Create a WeatherStation class that notifies multiple Display classes when weather data changes. Include temperature, humidity, and pressure.",
        language: "Java",
        difficulty: "Hard",
        category: "Java",
        timeLimit: 45,
        memoryLimit: 128000,
        starterCode: `interface Observer {
    void update(float temperature, float humidity, float pressure);
}

interface Subject {
    void registerObserver(Observer o);
    void removeObserver(Observer o);
    void notifyObservers();
}

class WeatherStation implements Subject {
    // Your implementation here
    
}

class CurrentConditionsDisplay implements Observer {
    // Your implementation here
    
}`,
        constraints: "Support multiple observers\nImplement all interface methods\nHandle observer registration/removal",
        testCases: [
          {
            input: "WeatherStation with 2 displays, update weather",
            expectedOutput: "Both displays updated"
          }
        ],
        tags: ["design-patterns", "oop", "observer"]
      },

      // Advanced Python
      {
        title: "Decorator with Arguments",
        description: "Create a decorator function called 'retry' that retries a function a specified number of times if it raises an exception. The decorator should accept the number of retries as an argument.",
        language: "Python",
        difficulty: "Hard",
        category: "Python",
        timeLimit: 30,
        memoryLimit: 128000,
        starterCode: `def retry(max_attempts):
    # Your decorator implementation here
    
    pass

# Example usage:
# @retry(3)
# def unreliable_function():
#     # might fail sometimes
#     pass`,
        constraints: "Handle any exception type\nLog retry attempts\nReturn original result on success",
        testCases: [
          {
            input: "retry(2) on function that fails once then succeeds",
            expectedOutput: "Success after 1 retry"
          },
          {
            input: "retry(1) on function that always fails",
            expectedOutput: "Exception raised"
          }
        ],
        tags: ["decorators", "error-handling", "advanced-python"]
      },

      // Full Stack Challenge
      {
        title: "API Rate Limiter",
        description: "Implement a rate limiter middleware for a web API that allows a maximum number of requests per user per time window. Use a sliding window approach with Redis-like storage simulation.",
        language: "JavaScript",
        difficulty: "Hard",
        category: "JavaScript",
        timeLimit: 45,
        memoryLimit: 128000,
        starterCode: `class RateLimiter {
    constructor(maxRequests, windowMs) {
        // Your implementation here
        
    }
    
    isAllowed(userId) {
        // Return true if request should be allowed, false otherwise
        
    }
    
    // Simulate time for testing
    setCurrentTime(timestamp) {
        // For testing purposes
        
    }
}`,
        constraints: "Sliding window algorithm\nHandle multiple users\nEfficient memory usage",
        testCases: [
          {
            input: "RateLimiter(3, 60000) - 4 requests in 60s",
            expectedOutput: "[true, true, true, false]"
          },
          {
            input: "RateLimiter(2, 30000) - 3 requests, wait 30s, 1 more",
            expectedOutput: "[true, true, false, true]"
          }
        ],
        tags: ["rate-limiting", "algorithms", "system-design"]
      }
    ];

    // Add questions to database
    const insertedQuestions = await CodingQuestion.insertMany(enhancedQuestions);
    console.log(`✅ Added ${insertedQuestions.length} enhanced coding questions`);

    console.log('📊 Enhanced questions by category:');
    const categoryCounts = {};
    insertedQuestions.forEach(q => {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    });
    console.table(categoryCounts);

    console.log('🎉 Enhanced coding questions added successfully!');

  } catch (error) {
    console.error('❌ Error adding enhanced coding questions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  addEnhancedCodingQuestions();
}

module.exports = addEnhancedCodingQuestions;
