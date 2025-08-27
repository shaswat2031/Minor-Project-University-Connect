// Improved language selector onChange handler
onChange={(e) => {
  const newLanguage = e.target.value;
  
  // Update language state immediately
  setQuestionLanguages(prev => ({
    ...prev,
    [currentQuestion]: newLanguage
  }));
  
  // Update starter code based on language
  const starterCodes = {
    JavaScript: `function ${currentQ?.title?.toLowerCase().replace(/\s+/g, '') || 'solution'}() {
    // Write your JavaScript solution here
    
}`,
    Python: `def ${currentQ?.title?.toLowerCase().replace(/\s+/g, '') || 'solution'}():
    # Write your Python solution here
    pass`,
    Java: `public class Solution {
    public static void main(String[] args) {
        // Write your Java solution here
        
    }
}`
  };
  
  const currentCode = answers[currentQuestion] || "";
  
  // Smart detection - only auto-update if truly template code
  const isEmptyOrMinimal = !currentCode.trim();
  const hasTemplateComments = currentCode.includes("// Write your") || 
                             currentCode.includes("# Write your") || 
                             currentCode.includes("// Your solution here");
  
  // Check for actual code logic (not just structure)
  const codeLines = currentCode.split('\n').map(line => line.trim()).filter(line => line);
  const meaningfulLines = codeLines.filter(line => {
    return line && 
           !line.startsWith('//') && 
           !line.startsWith('#') && 
           !line.includes('Write your') &&
           !line.includes('Your solution here') &&
           line !== '{' && 
           line !== '}' &&
           line !== 'pass' &&
           !line.match(/^(function|def|public\s+class|public\s+static\s+void\s+main).*[{(]\s*$/);
  });
  
  const hasCustomLogic = meaningfulLines.length > 0;
  
  // Only auto-update if no meaningful code exists
  if (isEmptyOrMinimal || (hasTemplateComments && !hasCustomLogic)) {
    // Safe to update template automatically
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: starterCodes[newLanguage] || ""
    }));
    success(`Language changed to ${newLanguage}! Template updated. 🚀`);
  } else {
    // User has written code - always ask for confirmation
    if (window.confirm(`⚠️  Change language to ${newLanguage}?\n\nThis will replace your current code with a ${newLanguage} template.\n\nClick Cancel to keep your existing code and just change execution language.`)) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion]: starterCodes[newLanguage] || ""
      }));
      success(`Language changed to ${newLanguage}! Code replaced with template. 🚀`);
    } else {
      // Keep existing code, just change execution language
      success(`Language changed to ${newLanguage}! Your code will be executed as ${newLanguage}. 💡`);
    }
  }
}
