import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { loader } from '@monaco-editor/react';

// Pre-configure Monaco loader
loader.config({ 
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs'
  }
});

const CodeEditor = ({ 
  language, 
  value, 
  onChange, 
  height = '400px', 
  readOnly = false,
  options = {}
}) => {
  const editorRef = useRef(null);
  
  // Define language-specific settings
  const getLanguageOptions = (lang) => {
    const baseOptions = {
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Consolas, "Courier New", monospace',
      automaticLayout: true,
      readOnly: readOnly,
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true,
      tabSize: 2,
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      colorDecorators: true,
      cursorBlinking: 'blink',
      ...options
    };
    
    // Language-specific configurations
    switch (lang?.toLowerCase()) {
      case 'java':
        return {
          ...baseOptions,
          tabSize: 4,
          suggestOnTriggerCharacters: true,
          snippets: [
            {
              name: 'javaclass',
              description: 'Java class template',
              body: [
                'public class Solution {',
                '    public static int solution(int a, int b) {',
                '        // Your code here',
                '        return a + b;',
                '    }',
                '',
                '    public static void main(String[] args) {',
                '        // You can test your function here',
                '        System.out.println(solution(3, 5));  // 8',
                '        System.out.println(solution(-2, 10)); // 8',
                '    }',
                '}'
              ]
            }
          ]
        };
        
      case 'python':
        return {
          ...baseOptions,
          tabSize: 4,
          insertSpaces: true,
        };
        
      case 'javascript':
      case 'js':
        return {
          ...baseOptions,
          tabSize: 2,
          snippets: [
            {
              name: 'console',
              description: 'Console log',
              body: 'console.log($0);'
            }
          ]
        };
        
      default:
        return baseOptions;
    }
  };

  // Handle editor initialization
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure theme for better visibility
    monaco.editor.defineTheme('codingTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' }
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#2A2A2A',
        'editorCursor.foreground': '#AEAFAD',
        'editorWhitespace.foreground': '#404040'
      }
    });
    
    editor.updateOptions(getLanguageOptions(language));
  };

  // Set the correct language
  const getLanguageId = (lang) => {
    if (!lang) return 'javascript';
    
    const langMap = {
      'java': 'java',
      'python': 'python',
      'javascript': 'javascript',
      'js': 'javascript',
      'typescript': 'typescript',
      'ts': 'typescript',
      'c': 'c',
      'cpp': 'cpp',
      'c++': 'cpp'
    };
    
    return langMap[lang.toLowerCase()] || 'plaintext';
  };

  return (
    <Editor
      height={height}
      language={getLanguageId(language)}
      value={value}
      onChange={onChange}
      theme="codingTheme"
      options={getLanguageOptions(language)}
      onMount={handleEditorDidMount}
      loading={<div className="flex items-center justify-center h-full bg-gray-800 text-gray-400">Loading editor...</div>}
    />
  );
};

export default CodeEditor;
