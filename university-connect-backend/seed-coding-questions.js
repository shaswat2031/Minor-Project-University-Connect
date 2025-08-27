require('dotenv').config();
const mongoose = require('mongoose');
const CodingQuestion = require('./models/CodingQuestion');

async function seedCodingQuestions() {
  try {
    console.log('🌱 Seeding coding questions...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing questions
    await CodingQuestion.deleteMany({});
    console.log('🗑️  Cleared existing coding questions');

    const questions = [
      {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        language: "JavaScript",
        difficulty: "Easy",
        timeLimit: 30,
        memoryLimit: 128000,
        starterCode: `function twoSum(nums, target) {
    // Your solution here
    
}`,
        constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
        testCases: [
          {
            input: "[2,7,11,15]\n9",
            expectedOutput: "[0,1]"
          },
          {
            input: "[3,2,4]\n6", 
            expectedOutput: "[1,2]"
          },
          {
            input: "[3,3]\n6",
            expectedOutput: "[0,1]"
          }
        ],
        category: "Array"
      },
      {
        title: "Palindrome Number",
        description: "Given an integer x, return true if x is palindrome integer. An integer is a palindrome when it reads the same backward as forward.",
        language: "Python",
        difficulty: "Easy", 
        timeLimit: 30,
        memoryLimit: 128000,
        starterCode: `def isPalindrome(x):
    # Your solution here
    pass`,
        constraints: "-2^31 <= x <= 2^31 - 1",
        testCases: [
          {
            input: "121",
            expectedOutput: "True"
          },
          {
            input: "-121",
            expectedOutput: "False"
          },
          {
            input: "10",
            expectedOutput: "False"
          }
        ],
        category: "Math"
      },
      {
        title: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as an array of characters s.",
        language: "Java",
        difficulty: "Easy",
        timeLimit: 30,
        memoryLimit: 128000,
        starterCode: `public class Solution {
    public void reverseString(char[] s) {
        // Your solution here
        
    }
}`,
        constraints: "1 <= s.length <= 10^5\ns[i] is a printable ascii character.",
        testCases: [
          {
            input: "['h','e','l','l','o']",
            expectedOutput: "['o','l','l','e','h']"
          },
          {
            input: "['H','a','n','n','a','h']",
            expectedOutput: "['h','a','n','n','a','H']"
          }
        ],
        category: "String"
      }
    ];

    const result = await CodingQuestion.insertMany(questions);
    console.log(`✅ Created ${result.length} coding questions`);
    
    console.log('🎯 Sample questions:');
    result.forEach((q, i) => {
      console.log(`${i + 1}. ${q.title} (${q.language})`);
    });

  } catch (error) {
    console.error('❌ Error seeding questions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedCodingQuestions();
