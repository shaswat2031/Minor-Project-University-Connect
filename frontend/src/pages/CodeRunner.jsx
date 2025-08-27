import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaCode, FaCopy, FaTrash, FaSpinner } from 'react-icons/fa';
import { useToast } from '../components/Toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeRunner = () => {
  const { success, error, warning, info } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [lineNumbers, setLineNumbers] = useState(['1']);
  const [autoComplete, setAutoComplete] = useState(true);
  const [autoIndent, setAutoIndent] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  // Judge0 API configuration
  const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
  const RAPID_API_KEY = '4c9b78c691msh97368a3c7ae2607p1f5585jsnd15998f8ab42';

  // Programming languages with their Judge0 language IDs
  const languages = [
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      version: '3.8.1',
      judge0Id: 71,
      prismLang: 'python',
      defaultCode: '# Python Code\nprint("Hello, World!")\nname = input("Enter your name: ")\nprint(f"Hello, {name}!")',
      keywords: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'return', 'try', 'except', 'with', 'as', 'lambda', 'yield', 'break', 'continue', 'pass', 'in', 'is', 'not', 'and', 'or'],
      builtins: ['print', 'input', 'len', 'range', 'enumerate', 'zip', 'map', 'filter', 'sorted', 'sum', 'max', 'min', 'abs', 'round', 'str', 'int', 'float', 'bool', 'list', 'dict', 'set', 'tuple'],
      strings: ['"', "'", '"""', "'''"],
      comments: ['#']
    },
    {
      id: 'java',
      name: 'Java',
      icon: '☕',
      version: 'OpenJDK 13.0.1',
      judge0Id: 62,
      prismLang: 'java',
      defaultCode: '// Java Code\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.println("Hello, World!");\n        System.out.print("Enter your name: ");\n        String name = scanner.nextLine();\n        System.out.println("Hello, " + name + "!");\n        scanner.close();\n    }\n}',
      keywords: ['public', 'private', 'protected', 'static', 'final', 'class', 'interface', 'extends', 'implements', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'throws', 'new', 'this', 'super', 'void', 'int', 'String', 'boolean'],
      builtins: ['System', 'Scanner', 'ArrayList', 'HashMap', 'Integer', 'Double', 'Boolean', 'Math', 'Object', 'String'],
      strings: ['"'],
      comments: ['//', '/*', '*/']
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: '🚀',
      version: 'Node.js 12.14.0',
      judge0Id: 63,
      prismLang: 'javascript',
      defaultCode: '// JavaScript Code\nconsole.log("Hello, World!");\nconst name = "World";\nconsole.log("Hello, " + name + "!");',
      keywords: ['var', 'let', 'const', 'function', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'class', 'extends', 'import', 'export', 'default', 'async', 'await', 'typeof', 'instanceof'],
      builtins: ['console', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Math', 'JSON', 'Promise', 'setTimeout', 'setInterval', 'document', 'window'],
      strings: ['"', "'", '`'],
      comments: ['//', '/*', '*/']
    }
  ];

  // Auto-completion pairs for bracket matching
  const bracketPairs = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
    '`': '`'
  };

  // Update line numbers when code changes
  const updateLineNumbers = (text) => {
    const lines = text.split('\n');
    const numbers = lines.map((_, index) => (index + 1).toString());
    setLineNumbers(numbers);
  };

  // Handle advanced keyboard interactions
  const handleKeyDown = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart, selectionEnd, value } = textarea;
    
    // Handle Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionEnd);
      const newValue = beforeCursor + '    ' + afterCursor;
      setCode(newValue);
      updateLineNumbers(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 4;
      }, 0);
      return;
    }

    // Handle Enter for auto-indentation
    if (e.key === 'Enter' && autoIndent) {
      e.preventDefault();
      const beforeCursor = value.substring(0, selectionStart);
      const currentLine = beforeCursor.split('\n').pop();
      const indentMatch = currentLine.match(/^(\s*)/);
      let indent = indentMatch ? indentMatch[1] : '';
      
      const shouldIndent = {
        python: () => currentLine.trim().endsWith(':'),
        javascript: () => currentLine.trim().endsWith('{') || 
                           ['if', 'else', 'for', 'while', 'function', 'try', 'catch'].some(keyword => 
                           currentLine.trim().includes(keyword) && currentLine.trim().endsWith('{')),
        java: () => currentLine.trim().endsWith('{')
      };
      
      if (shouldIndent[selectedLanguage] && shouldIndent[selectedLanguage]()) {
        indent += '    ';
      }
      
      const afterCursor = value.substring(selectionEnd);
      const newValue = beforeCursor + '\n' + indent + afterCursor;
      setCode(newValue);
      updateLineNumbers(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + indent.length;
      }, 0);
      return;
    }

    // Handle bracket completion
    if (autoComplete && bracketPairs[e.key]) {
      e.preventDefault();
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionEnd);
      const closingBracket = bracketPairs[e.key];
      
      if ((e.key === '"' || e.key === "'" || e.key === '`') && 
          afterCursor.charAt(0) === e.key) {
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        }, 0);
        return;
      }
      
      const newValue = beforeCursor + e.key + closingBracket + afterCursor;
      setCode(newValue);
      updateLineNumbers(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      }, 0);
      return;
    }

    // Handle closing bracket skip
    if (autoComplete && Object.values(bracketPairs).includes(e.key)) {
      const afterCursor = value.substring(selectionStart);
      if (afterCursor.charAt(0) === e.key) {
        e.preventDefault();
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        }, 0);
        return;
      }
    }

    // Handle backspace for bracket pairs
    if (e.key === 'Backspace' && autoComplete) {
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionStart);
      const lastChar = beforeCursor.charAt(beforeCursor.length - 1);
      const nextChar = afterCursor.charAt(0);
      
      if (bracketPairs[lastChar] === nextChar) {
        e.preventDefault();
        const newValue = beforeCursor.slice(0, -1) + afterCursor.slice(1);
        setCode(newValue);
        updateLineNumbers(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart - 1;
        }, 0);
        return;
      }
    }
  };

  // Load default code when language changes
  const handleLanguageChange = (langId) => {
    const lang = languages.find(l => l.id === langId);
    setSelectedLanguage(langId);
    const defaultCode = lang?.defaultCode || '';
    setCode(defaultCode);
    setOutput('');
    updateLineNumbers(defaultCode);
  };

  // Initialize with default language
  useEffect(() => {
    handleLanguageChange('python');
  }, []);

  // Handle code change with line numbers
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    const position = e.target.selectionStart;
    
    setCode(newCode);
    setCursorPosition(position);
    updateLineNumbers(newCode);
  };

  // Initialize with default language
  useEffect(() => {
    handleLanguageChange('python');
  }, []);

  // Execute code using Judge0 API
  const runCode = async () => {
    if (!code.trim()) {
      warning('Please enter some code to run');
      return;
    }

    setIsRunning(true);
    setOutput('Compiling and running code...');

    try {
      const currentLang = languages.find(l => l.id === selectedLanguage);
      
      const submissionData = {
        source_code: btoa(code),
        language_id: currentLang.judge0Id,
        stdin: input ? btoa(input) : '',
      };

      const submitResponse = await fetch(JUDGE0_API_URL + '/submissions?base64_encoded=true&wait=false', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': RAPID_API_KEY
        },
        body: JSON.stringify(submissionData)
      });

      if (!submitResponse.ok) {
        throw new Error('HTTP error! status: ' + submitResponse.status);
      }

      const submitResult = await submitResponse.json();
      const token = submitResult.token;

      let attempts = 0;
      const maxAttempts = 30;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const resultResponse = await fetch(JUDGE0_API_URL + '/submissions/' + token + '?base64_encoded=true', {
          headers: {
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'X-RapidAPI-Key': RAPID_API_KEY
          }
        });

        const result = await resultResponse.json();
        
        if (result.status.id <= 2) {
          attempts++;
          setOutput('Running... (' + attempts + 's)');
          continue;
        }

        let outputText = '';
        
        if (result.stdout) {
          outputText += '--- Output ---\n' + atob(result.stdout);
        }
        
        if (result.stderr) {
          outputText += '\n--- Error ---\n' + atob(result.stderr);
        }
        
        if (result.compile_output) {
          outputText += '\n--- Compile Output ---\n' + atob(result.compile_output);
        }

        if (!outputText.trim()) {
          outputText = 'Execution completed.\nStatus: ' + result.status.description + '\nTime: ' + result.time + 's\nMemory: ' + result.memory + ' KB';
        } else {
          outputText += '\n\n--- Execution Info ---\nStatus: ' + result.status.description + '\nTime: ' + (result.time || 'N/A') + 's\nMemory: ' + (result.memory || 'N/A') + ' KB';
        }

        setOutput(outputText);
        
        if (result.status.id === 3) {
          success('Code executed successfully!');
        } else {
          warning('Execution completed with status: ' + result.status.description);
        }
        
        setIsRunning(false);
        return;
      }
      
      throw new Error('Execution timeout');

    } catch (err) {
      console.error('Code execution error:', err);
      let errorMessage = 'Failed to execute code. ';
      
      if (err.message.includes('status: 429')) {
        errorMessage += 'Rate limit exceeded. Please try again later.';
      } else if (err.message.includes('status: 401')) {
        errorMessage += 'API authentication failed. Please check the API key.';
      } else if (err.message.includes('timeout')) {
        errorMessage += 'Execution timed out.';
      } else {
        errorMessage += err.message;
      }
      
      errorMessage += '\n\n--- Demo Mode ---\nUsing simulated execution:';
      const simulatedOutput = (code.includes('print') || code.includes('cout') || code.includes('printf') || code.includes('console.log') ? 'Hello, World!' : 'Code executed') + '\n' + (input ? 'Input received: ' + input.split('\n')[0] : 'No input provided');
      
      setOutput(errorMessage + '\n' + simulatedOutput);
      setIsRunning(false);
      warning('Using demo mode. Get a Judge0 API key for real execution.');
    }
  };

  // Copy code to clipboard
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    success('Code copied to clipboard!');
  };

  // Clear all
  const clearAll = () => {
    setCode('');
    setInput('');
    setOutput('');
    info('All fields cleared');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        copyCode();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [code, selectedLanguage, input]);

  const currentLanguage = languages.find(l => l.id === selectedLanguage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Code <span className="text-blue-400">Runner</span>
          </h1>
          <p className="text-xl text-gray-300">
            Execute code in multiple programming languages with real Judge0 API
          </p>
        </motion.div>

        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FaCode className="mr-2" />
            Select Programming Language
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {languages.map((lang) => (
              <motion.button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id)}
                className={
                  'p-4 rounded-lg border-2 transition-all duration-300 ' +
                  (selectedLanguage === lang.id
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500')
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-2xl mb-2">{lang.icon}</div>
                <div className="text-white font-semibold">{lang.name}</div>
                <div className="text-gray-400 text-sm">{lang.version}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <span className="text-2xl mr-2">{currentLanguage?.icon}</span>
                {currentLanguage?.name} Code Editor
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setAutoComplete(!autoComplete)}
                  className={`px-3 py-1 text-xs rounded transition ${
                    autoComplete 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}
                  title="Toggle Auto-completion"
                >
                  {autoComplete ? '✓' : '✗'} Auto
                </button>
                <button
                  onClick={() => setAutoIndent(!autoIndent)}
                  className={`px-3 py-1 text-xs rounded transition ${
                    autoIndent 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}
                  title="Toggle Auto-indent"
                >
                  {autoIndent ? '✓' : '✗'} Indent
                </button>
                <button
                  onClick={copyCode}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  title="Copy Code"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={clearAll}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  title="Clear All"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            {/* Advanced Code Editor with Line Numbers */}
            <div className="relative">
              <div className="flex bg-gray-900 rounded-lg border border-gray-600 focus-within:border-blue-500">
                {/* Line Numbers */}
                <div className="bg-gray-800 px-3 py-4 text-gray-400 font-mono text-sm select-none border-r border-gray-600 min-w-[50px]">
                  {lineNumbers.map((lineNum, index) => (
                    <div key={index} className="leading-6 text-right">{lineNum}</div>
                  ))}
                </div>
                
                {/* Code Editor with Smart Syntax Highlighting */}
                <div className="flex-1 relative">
                  {!isFocused && code ? (
                    /* Syntax Highlighted View (when not editing) */
                    <div 
                      className="w-full h-96 p-4 font-mono text-sm overflow-auto cursor-text bg-transparent"
                      onClick={() => {
                        setIsFocused(true);
                        setTimeout(() => textareaRef.current?.focus(), 10);
                      }}
                    >
                      <SyntaxHighlighter
                        language={currentLanguage?.prismLang || 'javascript'}
                        style={vscDarkPlus}
                        customStyle={{
                          background: 'transparent',
                          padding: 0,
                          margin: 0,
                          fontSize: '14px',
                          lineHeight: '1.5rem'
                        }}
                        showLineNumbers={false}
                      >
                        {code}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    /* Editable Textarea (when typing) */
                    <textarea
                      ref={textareaRef}
                      value={code}
                      onChange={handleCodeChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setIsFocused(false), 150);
                      }}
                      className="w-full h-96 bg-transparent text-white p-4 focus:outline-none font-mono text-sm resize-none leading-6 relative z-10"
                      placeholder={`Enter your ${currentLanguage?.name} code here...\n\n💡 IDE Features:\n• Auto bracket/quote completion\n• Smart indentation (Tab/Enter)\n• Line numbers\n• Tab = 4 spaces\n• Ctrl+Enter = Run code`}
                      spellCheck={false}
                      autoFocus
                      style={{ 
                        lineHeight: '1.5rem',
                        tabSize: 4,
                        WebkitTabSize: 4,
                        MozTabSize: 4
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Input Section */}
            <div className="mt-4">
              <label className="block text-white font-semibold mb-2">
                Input (for programs that require input):
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-24 bg-gray-900 text-white p-4 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
                placeholder="Enter input values here (each line will be provided as separate input)..."
              />
            </div>

            {/* Run Button */}
            <button
              onClick={runCode}
              disabled={isRunning || !code.trim()}
              className={
                'w-full mt-4 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition ' +
                (isRunning || !code.trim()
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700')
              }
            >
              {isRunning ? React.createElement(FaSpinner, { className: 'animate-spin' }) : React.createElement(FaPlay)}
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            
            {/* API Info */}
            <div className="mt-4 p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
              <p className="text-green-300 text-sm">
                <FaCode className="inline mr-1" />
                <strong>✅ API Connected:</strong> Judge0 API is configured with your RapidAPI key.
                Real code execution is enabled!
              </p>
            </div>
          </motion.div>

          {/* Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FaCode className="mr-2" />
              Output
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-auto">
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                {output || 'Click "Run Code" to see output here...'}
              </pre>
            </div>
            
            {output && (
              <button
                onClick={() => navigator.clipboard.writeText(output)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <FaCopy />
                Copy Output
              </button>
            )}
          </motion.div>
        </div>

        {/* Features Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 mt-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">🚀 IDE-like Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Real code execution via Judge0 API
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              VS Code-style syntax highlighting
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Auto bracket/quote completion
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Smart auto-indentation
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Line numbers display
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Syntax highlighting & colors
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Keyword highlighting (blue)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Built-in function highlighting (purple)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              String highlighting (green)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Comment highlighting (gray)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Number highlighting (yellow)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Tab indentation (4 spaces)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Input support for interactive programs
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Copy code and output to clipboard
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Real-time compilation & execution
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Toggleable IDE features
            </div>
          </div>
          
          {/* Keyboard Shortcuts */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-3">⌨️ Keyboard Shortcuts</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-300">
              <div><kbd className="bg-gray-700 px-2 py-1 rounded">Tab</kbd> → 4-space indentation</div>
              <div><kbd className="bg-gray-700 px-2 py-1 rounded">Enter</kbd> → Smart auto-indent</div>
              <div><kbd className="bg-gray-700 px-2 py-1 rounded">Ctrl+Enter</kbd> → Run code</div>
              <div><kbd className="bg-gray-700 px-2 py-1 rounded">Ctrl+S</kbd> → Copy code</div>
              <div><kbd className="bg-gray-700 px-2 py-1 rounded">Backspace</kbd> → Smart bracket removal</div>
              <div><kbd className="bg-gray-700 px-2 py-1 rounded">Brackets</kbd> → Auto-close brackets & quotes</div>
            </div>
            
            {/* Color Legend */}
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <h5 className="text-md font-semibold text-white mb-2">🎨 Syntax Colors (VS Code Style)</h5>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-semibold">Keywords</span>
                  <span className="text-gray-400">- if, for, def, class, etc.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">Built-ins</span>
                  <span className="text-gray-400">- print, console, System</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">Strings</span>
                  <span className="text-gray-400">- "text", 'text', `text`</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">Numbers</span>
                  <span className="text-gray-400">- 123, 45.67</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Comments</span>
                  <span className="text-gray-400">- # // /* */</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white">Default</span>
                  <span className="text-gray-400">- variables, operators</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CodeRunner;
