import { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * AntiCheatWrapper - A component that prevents text selection, copy-paste, and other common test cheating methods
 * 
 * This component:
 * 1. Disables text selection
 * 2. Prevents copy, cut, paste operations
 * 3. Prevents right click (context menu)
 * 4. Prevents keyboard shortcuts for copy, paste, print
 * 5. Adds a custom style to the cursor to indicate selection is disabled
 */
const AntiCheatWrapper = ({ children, className = '' }) => {
  useEffect(() => {
    // Save original body styles
    const originalUserSelect = document.body.style.userSelect;
    const originalWebkitUserSelect = document.body.style.webkitUserSelect;
    const originalMozUserSelect = document.body.style.mozUserSelect;
    const originalMsUserSelect = document.body.style.msUserSelect;
    
    // Disable text selection on body
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    
    // Handle copy, paste, cut events
    const preventCopyPaste = (e) => {
      e.preventDefault();
      return false;
    };
    
    // Handle keyboard shortcuts
    const preventKeyboardShortcuts = (e) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+P, Ctrl+S
      if (
        e.ctrlKey && 
        (e.key === 'c' || e.key === 'v' || e.key === 'x' || 
         e.key === 'p' || e.key === 's' || e.key === 'a')
      ) {
        e.preventDefault();
        return false;
      }
      
      // Prevent PrintScreen key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
    };
    
    // Prevent context menu (right click)
    const preventContextMenu = (e) => {
      e.preventDefault();
      return false;
    };
    
    // Add event listeners
    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('cut', preventCopyPaste);
    document.addEventListener('keydown', preventKeyboardShortcuts);
    document.addEventListener('contextmenu', preventContextMenu);
    
    // Clean up event listeners when component unmounts
    return () => {
      // Restore original body styles
      document.body.style.userSelect = originalUserSelect;
      document.body.style.webkitUserSelect = originalWebkitUserSelect;
      document.body.style.mozUserSelect = originalMozUserSelect;
      document.body.style.msUserSelect = originalMsUserSelect;
      
      // Remove event listeners
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('cut', preventCopyPaste);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);
  
  return (
    <div 
      className={`select-none ${className}`}
      style={{ 
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        cursor: 'default'
      }}
    >
      {children}
    </div>
  );
};

AntiCheatWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default AntiCheatWrapper;
