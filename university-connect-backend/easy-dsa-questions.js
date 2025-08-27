const mongoose = require('mongoose');
require('dotenv').config();
const CodingQuestion = require('./models/CodingQuestion');

const easyDSAQuestions = [
  {
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]`,
    difficulty: "Easy",
    language: "JavaScript",
    starterCode: `function twoSum(nums, target) {
    // Write your solution here
    
}`,
    solution: `function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    
    return [];
}`,
    testCases: [
      {
        input: "[[2,7,11,15], 9]",
        expectedOutput: "[0,1]",
        description: "Basic case with target 9"
      },
      {
        input: "[[3,2,4], 6]",
        expectedOutput: "[1,2]",
        description: "Array with different indices"
      },
      {
        input: "[[3,3], 6]",
        expectedOutput: "[0,1]",
        description: "Duplicate numbers"
      }
    ],
    category: "Array",
    tags: ["array", "hash-table", "easy"]
  },
  {
    title: "Palindrome Number",
    description: `Given an integer x, return true if x is palindrome integer.

An integer is a palindrome when it reads the same backward as forward.

Example 1:
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.

Example 2:
Input: x = -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.`,
    difficulty: "Easy",
    language: "JavaScript",
    starterCode: `function isPalindrome(x) {
    // Write your solution here
    
}`,
    solution: `function isPalindrome(x) {
    if (x < 0) return false;
    
    const str = x.toString();
    let left = 0;
    let right = str.length - 1;
    
    while (left < right) {
        if (str[left] !== str[right]) {
            return false;
        }
        left++;
        right--;
    }
    
    return true;
}`,
    testCases: [
      {
        input: "[121]",
        expectedOutput: "true",
        description: "Positive palindrome"
      },
      {
        input: "[-121]",
        expectedOutput: "false",
        description: "Negative number"
      },
      {
        input: "[10]",
        expectedOutput: "false",
        description: "Not a palindrome"
      }
    ],
    category: "Math",
    tags: ["math", "easy"]
  },
  {
    title: "Valid Parentheses",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
- Open brackets must be closed by the same type of brackets.
- Open brackets must be closed in the correct order.
- Every close bracket has a corresponding open bracket of the same type.

Example 1:
Input: s = "()"
Output: true

Example 2:
Input: s = "()[]{}"
Output: true

Example 3:
Input: s = "(]"
Output: false`,
    difficulty: "Easy",
    language: "JavaScript",
    starterCode: `function isValid(s) {
    // Write your solution here
    
}`,
    solution: `function isValid(s) {
    const stack = [];
    const map = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (let char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else {
            if (stack.length === 0 || stack.pop() !== map[char]) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
}`,
    testCases: [
      {
        input: '["()"]',
        expectedOutput: "true",
        description: "Simple parentheses"
      },
      {
        input: '["()[]{}", ""]',
        expectedOutput: "true",
        description: "Mixed brackets"
      },
      {
        input: '["(]"]',
        expectedOutput: "false",
        description: "Mismatched brackets"
      }
    ],
    category: "Stack",
    tags: ["stack", "string", "easy"]
  },
  {
    title: "Merge Two Sorted Lists",
    description: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

Example 1:
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]

Example 2:
Input: list1 = [], list2 = []
Output: []

Note: For this problem, we'll work with arrays instead of linked lists for simplicity.`,
    difficulty: "Easy",
    language: "JavaScript",
    starterCode: `function mergeTwoLists(list1, list2) {
    // Write your solution here
    // Merge two sorted arrays
    
}`,
    solution: `function mergeTwoLists(list1, list2) {
    const result = [];
    let i = 0, j = 0;
    
    while (i < list1.length && j < list2.length) {
        if (list1[i] <= list2[j]) {
            result.push(list1[i]);
            i++;
        } else {
            result.push(list2[j]);
            j++;
        }
    }
    
    while (i < list1.length) {
        result.push(list1[i]);
        i++;
    }
    
    while (j < list2.length) {
        result.push(list2[j]);
        j++;
    }
    
    return result;
}`,
    testCases: [
      {
        input: "[[1,2,4], [1,3,4]]",
        expectedOutput: "[1,1,2,3,4,4]",
        description: "Two non-empty sorted arrays"
      },
      {
        input: "[[], []]",
        expectedOutput: "[]",
        description: "Two empty arrays"
      },
      {
        input: "[[], [0]]",
        expectedOutput: "[0]",
        description: "One empty, one non-empty"
      }
    ],
    category: "Linked List",
    tags: ["linked-list", "recursion", "easy"]
  },
  {
    title: "Maximum Subarray",
    description: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous part of an array.

Example 1:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.

Example 2:
Input: nums = [1]
Output: 1

Example 3:
Input: nums = [5,4,-1,7,8]
Output: 23`,
    difficulty: "Easy",
    language: "JavaScript",
    starterCode: `function maxSubArray(nums) {
    // Write your solution here
    // Use Kadane's algorithm
    
}`,
    solution: `function maxSubArray(nums) {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}`,
    testCases: [
      {
        input: "[[-2,1,-3,4,-1,2,1,-5,4]]",
        expectedOutput: "6",
        description: "Mixed positive and negative numbers"
      },
      {
        input: "[[1]]",
        expectedOutput: "1",
        description: "Single element"
      },
      {
        input: "[[5,4,-1,7,8]]",
        expectedOutput: "23",
        description: "Mostly positive numbers"
      }
    ],
    category: "Dynamic Programming",
    tags: ["array", "dynamic-programming", "divide-and-conquer", "easy"]
  }
];

async function seedEasyDSAQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university-connect');
    console.log('Connected to MongoDB');

    // Clear existing easy DSA questions (optional)
    await CodingQuestion.deleteMany({ 
      category: { $in: ['Array', 'Math', 'Stack', 'Linked List', 'Dynamic Programming'] },
      difficulty: 'Easy'
    });
    console.log('Cleared existing easy DSA questions');

    // Insert new questions
    const insertedQuestions = await CodingQuestion.insertMany(easyDSAQuestions);
    console.log(`Successfully seeded ${insertedQuestions.length} easy DSA questions:`);
    
    insertedQuestions.forEach((q, index) => {
      console.log(`${index + 1}. ${q.title} (${q.category})`);
    });

    console.log('\nAll questions have been successfully added to the database!');
    
  } catch (error) {
    console.error('Error seeding easy DSA questions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding script
if (require.main === module) {
  seedEasyDSAQuestions();
}

module.exports = { easyDSAQuestions, seedEasyDSAQuestions };
