require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');
const CodingQuestion = require('./models/CodingQuestion');

async function seedAllQuestions() {
  try {
    console.log('🌱 Starting comprehensive seeding...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing questions
    await Promise.all([
      Question.deleteMany({}),
      CodingQuestion.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing questions');

    // ====== MCQ QUESTIONS ======
    const mcqQuestions = [
      // JavaScript MCQs
      {
        question: "What is the correct way to declare a variable in JavaScript?",
        options: ["var name;", "variable name;", "v name;", "declare name;"],
        correctAnswer: "var name;",
        category: "JavaScript"
      },
      {
        question: "Which of the following is NOT a JavaScript data type?",
        options: ["Number", "String", "Boolean", "Float"],
        correctAnswer: "Float",
        category: "JavaScript"
      },
      {
        question: "What does '===' operator do in JavaScript?",
        options: ["Assignment", "Comparison with type checking", "Comparison without type checking", "Increment"],
        correctAnswer: "Comparison with type checking",
        category: "JavaScript"
      },
      {
        question: "How do you create a function in JavaScript?",
        options: ["function myFunction() {}", "create myFunction() {}", "def myFunction() {}", "function = myFunction() {}"],
        correctAnswer: "function myFunction() {}",
        category: "JavaScript"
      },
      {
        question: "Which method is used to add an element at the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctAnswer: "push()",
        category: "JavaScript"
      },

      // Python MCQs
      {
        question: "Which of the following is the correct extension for Python files?",
        options: [".py", ".python", ".pt", ".pyt"],
        correctAnswer: ".py",
        category: "Python"
      },
      {
        question: "What is the output of print(2 ** 3)?",
        options: ["6", "8", "9", "5"],
        correctAnswer: "8",
        category: "Python"
      },
      {
        question: "Which keyword is used to define a function in Python?",
        options: ["def", "function", "func", "define"],
        correctAnswer: "def",
        category: "Python"
      },
      {
        question: "How do you insert comments in Python code?",
        options: ["// This is a comment", "/* This is a comment */", "# This is a comment", "<!-- This is a comment -->"],
        correctAnswer: "# This is a comment",
        category: "Python"
      },
      {
        question: "Which of the following is used to handle exceptions in Python?",
        options: ["try-except", "try-catch", "handle-error", "catch-throw"],
        correctAnswer: "try-except",
        category: "Python"
      },

      // Java MCQs
      {
        question: "Which of the following is NOT a Java keyword?",
        options: ["static", "Boolean", "protected", "synchronized"],
        correctAnswer: "Boolean",
        category: "Java"
      },
      {
        question: "What is the size of int variable in Java?",
        options: ["8 bit", "16 bit", "32 bit", "64 bit"],
        correctAnswer: "32 bit",
        category: "Java"
      },
      {
        question: "Which method is the entry point of a Java application?",
        options: ["start()", "begin()", "main()", "run()"],
        correctAnswer: "main()",
        category: "Java"
      },
      {
        question: "What does JVM stand for?",
        options: ["Java Virtual Machine", "Java Variable Method", "Java Vendor Machine", "Java Version Manager"],
        correctAnswer: "Java Virtual Machine",
        category: "Java"
      },
      {
        question: "Which operator is used to compare two values in Java?",
        options: ["=", "==", "===", "equals"],
        correctAnswer: "==",
        category: "Java"
      },

      // React MCQs
      {
        question: "What is React?",
        options: ["A JavaScript library for building user interfaces", "A database", "A server", "A CSS framework"],
        correctAnswer: "A JavaScript library for building user interfaces",
        category: "React"
      },
      {
        question: "What is JSX?",
        options: ["JavaScript XML", "Java Syntax Extension", "JavaScript Extension", "JSON XML"],
        correctAnswer: "JavaScript XML",
        category: "React"
      },
      {
        question: "Which hook is used to manage state in functional components?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correctAnswer: "useState",
        category: "React"
      },
      {
        question: "What is the virtual DOM?",
        options: ["A programming concept", "A copy of the real DOM kept in memory", "A new browser feature", "A React component"],
        correctAnswer: "A copy of the real DOM kept in memory",
        category: "React"
      },
      {
        question: "How do you pass data from parent to child component?",
        options: ["Through props", "Through state", "Through context", "Through hooks"],
        correctAnswer: "Through props",
        category: "React"
      },

      // Node.js MCQs
      {
        question: "What is Node.js?",
        options: ["A browser", "A JavaScript runtime", "A database", "A web server"],
        correctAnswer: "A JavaScript runtime",
        category: "Node.js"
      },
      {
        question: "Which command is used to install packages in Node.js?",
        options: ["npm install", "node install", "install npm", "get package"],
        correctAnswer: "npm install",
        category: "Node.js"
      },
      {
        question: "What file contains the metadata of a Node.js project?",
        options: ["package.json", "node.json", "project.json", "meta.json"],
        correctAnswer: "package.json",
        category: "Node.js"
      },
      {
        question: "Which module is used to create HTTP server in Node.js?",
        options: ["http", "server", "web", "express"],
        correctAnswer: "http",
        category: "Node.js"
      },
      {
        question: "What does 'npm' stand for?",
        options: ["Node Package Manager", "New Package Manager", "Node Program Manager", "Network Package Manager"],
        correctAnswer: "Node Package Manager",
        category: "Node.js"
      }
    ];

    // ====== CODING QUESTIONS ======
    const codingQuestions = [
      // JavaScript Coding Questions
      {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        language: "JavaScript",
        difficulty: "Easy",
        category: "Array",
        timeLimit: 30,
        memoryLimit: 128000,
        starterCode: `function twoSum(nums, target) {
    // Write your solution here
    // Return an array of two indices
    
}

// Example usage:
// console.log(twoSum([2,7,11,15], 9)); // should return [0,1]`,
        constraints: "• 2 ≤ nums.length ≤ 10^4\n• -10^9 ≤ nums[i] ≤ 10^9\n• -10^9 ≤ target ≤ 10^9\n• Only one valid answer exists.",
        testCases: [
          {
            input: "[2,7,11,15]\n9",
            expectedOutput: "[0,1]",
            isHidden: false
          },
          {
            input: "[3,2,4]\n6", 
            expectedOutput: "[1,2]",
            isHidden: false
          },
          {
            input: "[3,3]\n6",
            expectedOutput: "[0,1]",
            isHidden: true
          },
          {
            input: "[-1,-2,-3,-4,-5]\n-8",
            expectedOutput: "[2,4]",
            isHidden: true
          }
        ]
      },
      {
        title: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as an array of characters s. Do not allocate extra space for another array, you must do this by modifying the input array in-place with O(1) extra memory.",
        language: "JavaScript",
        difficulty: "Easy",
        category: "String",
        timeLimit: 30,
        memoryLimit: 128000,
        starterCode: `function reverseString(s) {
    // Modify the array s in-place
    // Do not return anything
    
}

// Example usage:
// let s = ["h","e","l","l","o"];
// reverseString(s);
// console.log(s); // should be ["o","l","l","e","h"]`,
        constraints: "• 1 ≤ s.length ≤ 10^5\n• s[i] is a printable ascii character.",
        testCases: [
          {
            input: '["h","e","l","l","o"]',
            expectedOutput: '["o","l","l","e","h"]',
            isHidden: false
          },
          {
            input: '["H","a","n","n","a","h"]',
            expectedOutput: '["h","a","n","n","a","H"]',
            isHidden: false
          },
          {
            input: '["A"]',
            expectedOutput: '["A"]',
            isHidden: true
          }
        ]
      },
      {
        title: "Valid Parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets and in the correct order.",
        language: "JavaScript",
        difficulty: "Easy",
        category: "Stack",
        timeLimit: 30,
        memoryLimit: 128000,
        starterCode: `function isValid(s) {
    // Write your solution here
    // Return true if valid, false otherwise
    
}

// Example usage:
// console.log(isValid("()")); // should return true
// console.log(isValid("()[]{}")); // should return true
// console.log(isValid("(]")); // should return false`,
        constraints: "• 1 ≤ s.length ≤ 10^4\n• s consists of parentheses only '()[]{}'.",
        testCases: [
          {
            input: "()",
            expectedOutput: "true",
            isHidden: false
          },
          {
            input: "()[]{}", 
            expectedOutput: "true",
            isHidden: false
          },
          {
            input: "(]",
            expectedOutput: "false",
            isHidden: false
          },
          {
            input: "([)]",
            expectedOutput: "false",
            isHidden: true
          },
          {
            input: "{[]}",
            expectedOutput: "true",
            isHidden: true
          }
        ]
      },

      // Python Coding Questions
      {
        title: "Palindrome Number",
        description: "Given an integer x, return true if x is a palindrome integer. An integer is a palindrome when it reads the same backward as forward. For example, 121 is a palindrome while 123 is not.",
        language: "Python",
        difficulty: "Easy", 
        category: "Math",
        timeLimit: 30,
        memoryLimit: 128000,
        starterCode: `def isPalindrome(x):
    # Write your solution here
    # Return True if palindrome, False otherwise
    pass

# Example usage:
# print(isPalindrome(121))  # should return True
# print(isPalindrome(-121)) # should return False`,
        constraints: "• -2^31 ≤ x ≤ 2^31 - 1",
        testCases: [
          {
            input: "121",
            expectedOutput: "True",
            isHidden: false
          },
          {
            input: "-121",
            expectedOutput: "False",
            isHidden: false
          },
          {
            input: "10",
            expectedOutput: "False",
            isHidden: false
          },
          {
            input: "0",
            expectedOutput: "True",
            isHidden: true
          },
          {
            input: "1221",
            expectedOutput: "True",
            isHidden: true
          }
        ]
      },
      {
        title: "FizzBuzz",
        description: "Given an integer n, return a string array answer (1-indexed) where: answer[i] == 'FizzBuzz' if i is divisible by 3 and 5, answer[i] == 'Fizz' if i is divisible by 3, answer[i] == 'Buzz' if i is divisible by 5, answer[i] == i (as a string) if none of the above conditions are true.",
        language: "Python",
        difficulty: "Easy",
        category: "Array",
        timeLimit: 30,
        memoryLimit: 128000,
        starterCode: `def fizzBuzz(n):
    # Write your solution here
    # Return a list of strings
    pass

# Example usage:
# print(fizzBuzz(15))
# should return ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]`,
        constraints: "• 1 ≤ n ≤ 10^4",
        testCases: [
          {
            input: "3",
            expectedOutput: '["1","2","Fizz"]',
            isHidden: false
          },
          {
            input: "5",
            expectedOutput: '["1","2","Fizz","4","Buzz"]',
            isHidden: false
          },
          {
            input: "15",
            expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
            isHidden: true
          }
        ]
      },

      // Java Coding Questions
      {
        title: "Remove Duplicates from Sorted Array",
        description: "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Return the number of unique elements in nums.",
        language: "Java",
        difficulty: "Easy",
        category: "Array",
        timeLimit: 30,
        memoryLimit: 128000,
        starterCode: `public class Solution {
    public int removeDuplicates(int[] nums) {
        // Write your solution here
        // Return the number of unique elements
        
    }
}

// Example usage:
// Solution sol = new Solution();
// int[] nums = {1,1,2};
// int result = sol.removeDuplicates(nums);
// System.out.println(result); // should print 2`,
        constraints: "• 1 ≤ nums.length ≤ 3 * 10^4\n• -100 ≤ nums[i] ≤ 100\n• nums is sorted in non-decreasing order.",
        testCases: [
          {
            input: "[1,1,2]",
            expectedOutput: "2",
            isHidden: false
          },
          {
            input: "[0,0,1,1,1,2,2,3,3,4]",
            expectedOutput: "5",
            isHidden: false
          },
          {
            input: "[1,2,3,4,5]",
            expectedOutput: "5",
            isHidden: true
          }
        ]
      },
      {
        title: "Maximum Subarray",
        description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. A subarray is a contiguous part of an array.",
        language: "Java",
        difficulty: "Medium",
        category: "Dynamic Programming",
        timeLimit: 60,
        memoryLimit: 128000,
        starterCode: `public class Solution {
    public int maxSubArray(int[] nums) {
        // Write your solution here using Kadane's algorithm
        // Return the maximum sum
        
    }
}

// Example usage:
// Solution sol = new Solution();
// int[] nums = {-2,1,-3,4,-1,2,1,-5,4};
// int result = sol.maxSubArray(nums);
// System.out.println(result); // should print 6`,
        constraints: "• 1 ≤ nums.length ≤ 10^5\n• -10^4 ≤ nums[i] ≤ 10^4",
        testCases: [
          {
            input: "[-2,1,-3,4,-1,2,1,-5,4]",
            expectedOutput: "6",
            isHidden: false
          },
          {
            input: "[1]",
            expectedOutput: "1",
            isHidden: false
          },
          {
            input: "[5,4,-1,7,8]",
            expectedOutput: "23",
            isHidden: true
          },
          {
            input: "[-1]",
            expectedOutput: "-1",
            isHidden: true
          }
        ]
      }
    ];

    // Insert all questions
    const [mcqResult, codingResult] = await Promise.all([
      Question.insertMany(mcqQuestions),
      CodingQuestion.insertMany(codingQuestions)
    ]);

    console.log(`✅ Seeded ${mcqResult.length} MCQ questions`);
    console.log(`✅ Seeded ${codingResult.length} coding questions`);
    
    // Display summary by category
    const mcqCategories = await Question.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    const codingCategories = await CodingQuestion.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    console.log('\n📊 MCQ Questions by Category:');
    mcqCategories.forEach(cat => console.log(`   ${cat._id}: ${cat.count} questions`));
    
    console.log('\n📊 Coding Questions by Category:');
    codingCategories.forEach(cat => console.log(`   ${cat._id}: ${cat.count} questions`));
    
    console.log('\n🎉 All questions seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding questions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  seedAllQuestions();
}

module.exports = { seedAllQuestions };
