const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Question = require("./models/Question");

dotenv.config();

const reactQuestions = [
  {
    question: "What is React?",
    options: [
      "A JavaScript library",
      "A framework",
      "A programming language",
      "A database",
    ],
    correctAnswer: "A JavaScript library",
    category: "React",
  },
  {
    question: "What is JSX?",
    options: [
      "JavaScript XML",
      "Java Syntax Extension",
      "JavaScript Extension",
      "Java XML",
    ],
    correctAnswer: "JavaScript XML",
    category: "React",
  },
  {
    question: "Which method is used to render React components?",
    options: ["render()", "display()", "show()", "mount()"],
    correctAnswer: "render()",
    category: "React",
  },
  {
    question: "What is a React component?",
    options: [
      "A function or class",
      "A HTML element",
      "A CSS style",
      "A database query",
    ],
    correctAnswer: "A function or class",
    category: "React",
  },
  {
    question: "How do you pass data to a React component?",
    options: [
      "Through props",
      "Through state",
      "Through context",
      "Through refs",
    ],
    correctAnswer: "Through props",
    category: "React",
  },
  {
    question: "What is the virtual DOM?",
    options: [
      "A lightweight copy of the real DOM",
      "A database",
      "A CSS framework",
      "A testing tool",
    ],
    correctAnswer: "A lightweight copy of the real DOM",
    category: "React",
  },
  {
    question:
      "Which hook is used for state management in functional components?",
    options: ["useState", "useEffect", "useContext", "useReducer"],
    correctAnswer: "useState",
    category: "React",
  },
  {
    question: "What is the purpose of useEffect hook?",
    options: [
      "Side effects",
      "State management",
      "Context creation",
      "Component rendering",
    ],
    correctAnswer: "Side effects",
    category: "React",
  },
];

const javaQuestions = [
  {
    question: "What is Java?",
    options: [
      "Object-oriented programming language",
      "Web browser",
      "Database",
      "Operating system",
    ],
    correctAnswer: "Object-oriented programming language",
    category: "Java",
  },
  {
    question: "Which of these is not a Java feature?",
    options: [
      "Object-oriented",
      "Use of pointers",
      "Portable",
      "Dynamic and Extensible",
    ],
    correctAnswer: "Use of pointers",
    category: "Java",
  },
  {
    question: "What is the size of int data type in Java?",
    options: ["32 bits", "16 bits", "64 bits", "8 bits"],
    correctAnswer: "32 bits",
    category: "Java",
  },
  {
    question: "Which method is the entry point of a Java program?",
    options: ["main()", "start()", "run()", "init()"],
    correctAnswer: "main()",
    category: "Java",
  },
  {
    question: "What does JVM stand for?",
    options: [
      "Java Virtual Machine",
      "Java Variable Method",
      "Java Visual Machine",
      "Java Vector Machine",
    ],
    correctAnswer: "Java Virtual Machine",
    category: "Java",
  },
  {
    question: "Which keyword is used to inherit a class in Java?",
    options: ["extends", "implements", "inherits", "super"],
    correctAnswer: "extends",
    category: "Java",
  },
  {
    question: "What is encapsulation in Java?",
    options: [
      "Data hiding",
      "Multiple inheritance",
      "Method overloading",
      "Exception handling",
    ],
    correctAnswer: "Data hiding",
    category: "Java",
  },
  {
    question: "Which collection class allows duplicate elements?",
    options: ["ArrayList", "HashSet", "TreeSet", "LinkedHashSet"],
    correctAnswer: "ArrayList",
    category: "Java",
  },
];

const pythonQuestions = [
  {
    question: "What is Python?",
    options: [
      "High-level programming language",
      "Web browser",
      "Database",
      "Operating system",
    ],
    correctAnswer: "High-level programming language",
    category: "Python",
  },
  {
    question: "Which of the following is used to define a function in Python?",
    options: ["def", "function", "define", "func"],
    correctAnswer: "def",
    category: "Python",
  },
  {
    question: "What is the correct way to create a list in Python?",
    options: ["[1, 2, 3]", "{1, 2, 3}", "(1, 2, 3)", "list(1, 2, 3)"],
    correctAnswer: "[1, 2, 3]",
    category: "Python",
  },
  {
    question: "Which of the following data types is immutable in Python?",
    options: ["Tuple", "List", "Dictionary", "Set"],
    correctAnswer: "Tuple",
    category: "Python",
  },
  {
    question: "What does the 'len()' function do?",
    options: [
      "Returns length of object",
      "Creates a list",
      "Deletes an item",
      "Sorts a list",
    ],
    correctAnswer: "Returns length of object",
    category: "Python",
  },
  {
    question: "How do you start a comment in Python?",
    options: ["#", "//", "/*", "<!--"],
    correctAnswer: "#",
    category: "Python",
  },
  {
    question: "What is the output of print(2 ** 3)?",
    options: ["8", "6", "9", "5"],
    correctAnswer: "8",
    category: "Python",
  },
  {
    question: "Which keyword is used for exception handling in Python?",
    options: ["try", "catch", "exception", "handle"],
    correctAnswer: "try",
    category: "Python",
  },
];

const javascriptQuestions = [
  {
    question: "What is JavaScript?",
    options: [
      "Programming language",
      "Markup language",
      "Database",
      "Web server",
    ],
    correctAnswer: "Programming language",
    category: "JavaScript",
  },
  {
    question: "Which of the following is not a JavaScript data type?",
    options: ["Float", "Boolean", "String", "Number"],
    correctAnswer: "Float",
    category: "JavaScript",
  },
  {
    question: "How do you declare a variable in JavaScript?",
    options: ["var x = 5", "variable x = 5", "v x = 5", "declare x = 5"],
    correctAnswer: "var x = 5",
    category: "JavaScript",
  },
  {
    question: "Which method is used to add an element to the end of an array?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    correctAnswer: "push()",
    category: "JavaScript",
  },
  {
    question: "What does '===' operator do?",
    options: [
      "Strict equality comparison",
      "Assignment",
      "Not equal",
      "Greater than",
    ],
    correctAnswer: "Strict equality comparison",
    category: "JavaScript",
  },
  {
    question: "How do you create a function in JavaScript?",
    options: [
      "function myFunction()",
      "create myFunction()",
      "def myFunction()",
      "function = myFunction()",
    ],
    correctAnswer: "function myFunction()",
    category: "JavaScript",
  },
  {
    question: "Which event occurs when the user clicks on an HTML element?",
    options: ["onclick", "onchange", "onmouseclick", "onmouseover"],
    correctAnswer: "onclick",
    category: "JavaScript",
  },
  {
    question: "What is the correct way to write a JavaScript array?",
    options: [
      "var colors = ['red', 'green', 'blue']",
      "var colors = 'red', 'green', 'blue'",
      "var colors = (1:'red', 2:'green', 3:'blue')",
      "var colors = 1 = ('red'), 2 = ('green'), 3 = ('blue')",
    ],
    correctAnswer: "var colors = ['red', 'green', 'blue']",
    category: "JavaScript",
  },
];

const dataStructuresQuestions = [
  {
    question: "What is a data structure?",
    options: [
      "A way of organizing data",
      "A programming language",
      "A database",
      "A web framework",
    ],
    correctAnswer: "A way of organizing data",
    category: "Data Structures",
  },
  {
    question: "Which of the following is a linear data structure?",
    options: ["Array", "Tree", "Graph", "Hash Table"],
    correctAnswer: "Array",
    category: "Data Structures",
  },
  {
    question: "What is the time complexity of binary search?",
    options: ["O(log n)", "O(n)", "O(n²)", "O(1)"],
    correctAnswer: "O(log n)",
    category: "Data Structures",
  },
  {
    question: "In which data structure do we use LIFO principle?",
    options: ["Stack", "Queue", "Array", "Linked List"],
    correctAnswer: "Stack",
    category: "Data Structures",
  },
  {
    question:
      "What is the maximum number of children a binary tree node can have?",
    options: ["2", "1", "3", "Unlimited"],
    correctAnswer: "2",
    category: "Data Structures",
  },
  {
    question:
      "Which sorting algorithm has the best average case time complexity?",
    options: ["Merge Sort", "Bubble Sort", "Selection Sort", "Insertion Sort"],
    correctAnswer: "Merge Sort",
    category: "Data Structures",
  },
  {
    question: "What does FIFO stand for?",
    options: [
      "First In First Out",
      "Fast In Fast Out",
      "First Input First Output",
      "Final In Final Out",
    ],
    correctAnswer: "First In First Out",
    category: "Data Structures",
  },
  {
    question: "Which data structure is used for BFS traversal?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: "Queue",
    category: "Data Structures",
  },
];

const algorithmsQuestions = [
  {
    question: "What is an algorithm?",
    options: [
      "Step-by-step procedure to solve a problem",
      "A programming language",
      "A data structure",
      "A web framework",
    ],
    correctAnswer: "Step-by-step procedure to solve a problem",
    category: "Algorithms",
  },
  {
    question: "Which algorithm is used to find the shortest path in a graph?",
    options: [
      "Dijkstra's algorithm",
      "Binary search",
      "Merge sort",
      "Quick sort",
    ],
    correctAnswer: "Dijkstra's algorithm",
    category: "Algorithms",
  },
  {
    question: "What is the worst-case time complexity of Quick Sort?",
    options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"],
    correctAnswer: "O(n²)",
    category: "Algorithms",
  },
  {
    question: "Which algorithm uses divide and conquer approach?",
    options: ["Merge Sort", "Linear Search", "Bubble Sort", "Selection Sort"],
    correctAnswer: "Merge Sort",
    category: "Algorithms",
  },
  {
    question: "What is the space complexity of recursive Fibonacci algorithm?",
    options: ["O(n)", "O(1)", "O(log n)", "O(n²)"],
    correctAnswer: "O(n)",
    category: "Algorithms",
  },
  {
    question: "Which algorithm is best for searching in a sorted array?",
    options: ["Binary Search", "Linear Search", "Hash Search", "Tree Search"],
    correctAnswer: "Binary Search",
    category: "Algorithms",
  },
  {
    question: "What is dynamic programming?",
    options: [
      "Optimization technique using memorization",
      "A programming language",
      "A data structure",
      "A design pattern",
    ],
    correctAnswer: "Optimization technique using memorization",
    category: "Algorithms",
  },
  {
    question:
      "Which algorithm is used for finding strongly connected components?",
    options: [
      "Tarjan's algorithm",
      "Bubble sort",
      "Linear search",
      "Hash function",
    ],
    correctAnswer: "Tarjan's algorithm",
    category: "Algorithms",
  },
];

const webDevelopmentQuestions = [
  {
    question: "What does HTML stand for?",
    options: [
      "HyperText Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlink and Text Markup Language",
    ],
    correctAnswer: "HyperText Markup Language",
    category: "Web Development",
  },
  {
    question: "Which CSS property is used to change the text color?",
    options: ["color", "text-color", "font-color", "text-style"],
    correctAnswer: "color",
    category: "Web Development",
  },
  {
    question: "What is the purpose of CSS?",
    options: [
      "Styling web pages",
      "Creating databases",
      "Server-side scripting",
      "Network programming",
    ],
    correctAnswer: "Styling web pages",
    category: "Web Development",
  },
  {
    question: "Which HTML tag is used to define an internal style sheet?",
    options: ["<style>", "<css>", "<script>", "<stylesheet>"],
    correctAnswer: "<style>",
    category: "Web Development",
  },
  {
    question: "What does API stand for?",
    options: [
      "Application Programming Interface",
      "Advanced Programming Interface",
      "Application Process Interface",
      "Advanced Process Interface",
    ],
    correctAnswer: "Application Programming Interface",
    category: "Web Development",
  },
  {
    question: "Which HTTP method is used to retrieve data?",
    options: ["GET", "POST", "PUT", "DELETE"],
    correctAnswer: "GET",
    category: "Web Development",
  },
  {
    question: "What is responsive web design?",
    options: [
      "Design that adapts to different screen sizes",
      "Fast loading websites",
      "Interactive websites",
      "Secure websites",
    ],
    correctAnswer: "Design that adapts to different screen sizes",
    category: "Web Development",
  },
  {
    question:
      "Which framework is used for building user interfaces in JavaScript?",
    options: ["React", "Django", "Laravel", "Spring"],
    correctAnswer: "React",
    category: "Web Development",
  },
];

const addQuestionsToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Clear existing questions
    await Question.deleteMany({});
    console.log("🗑️ Cleared existing questions");

    // Add new questions for all categories
    const allQuestions = [
      ...reactQuestions,
      ...javaQuestions,
      ...pythonQuestions,
      ...javascriptQuestions,
      ...dataStructuresQuestions,
      ...algorithmsQuestions,
      ...webDevelopmentQuestions,
    ];

    await Question.insertMany(allQuestions);

    console.log(`✅ Added ${allQuestions.length} questions to database`);

    // Show breakdown by category
    const categories = [
      "React",
      "Java",
      "Python",
      "JavaScript",
      "Data Structures",
      "Algorithms",
      "Web Development",
    ];
    for (const category of categories) {
      const count = await Question.countDocuments({ category });
      console.log(`📊 ${category}: ${count} questions`);
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

addQuestionsToDatabase();
