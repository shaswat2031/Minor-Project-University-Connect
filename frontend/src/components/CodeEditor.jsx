import React from 'react';
import PropTypes from 'prop-types';

/**
 * Simple code editor component fallback
 * This is a basic fallback for when no code editor library is available
 */
const CodeEditor = ({ 
  height = '200px', 
  language = 'javascript', 
  value = '', 
  onChange, 
  readOnly = false,
  options = {}
}) => {
  const handleChange = (e) => {
    if (onChange && !readOnly) {
      onChange(e.target.value);
    }
  };

  return (
    <div 
      style={{ height }} 
      className="w-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden"
    >
      <div className="bg-gray-800 px-3 py-2 text-xs text-gray-400 border-b border-gray-700">
        {language.toUpperCase()}
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        className="w-full h-full p-3 bg-gray-900 text-white font-mono text-sm resize-none focus:outline-none"
        style={{ 
          height: `calc(${height} - 32px)`,
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          fontSize: '14px',
          lineHeight: '1.4',
          tabSize: 2,
          ...options
        }}
        placeholder={`// Write your ${language} code here...`}
        spellCheck={false}
      />
    </div>
  );
};

CodeEditor.propTypes = {
  height: PropTypes.string,
  language: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  options: PropTypes.object
};

export default CodeEditor;
