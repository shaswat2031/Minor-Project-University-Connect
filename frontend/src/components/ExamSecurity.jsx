import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const ExamSecurity = ({ onViolation }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState({ tabSwitches: 0, fullscreenExits: 0 });
  const MAX_VIOLATIONS = 3; // Maximum number of violations allowed before strict action
  
  // Handle tab visibility changes with proper tracking
  const handleVisibilityChange = () => {
    if (document.hidden) {
      setViolations(prev => {
        const newTabSwitches = prev.tabSwitches + 1;
        onViolation(`Warning: Tab switch detected (${newTabSwitches}/${MAX_VIOLATIONS})`);
        
        if (newTabSwitches >= MAX_VIOLATIONS) {
          onViolation('Maximum tab switches exceeded! This will be reported.');
        }
        
        return { ...prev, tabSwitches: newTabSwitches };
      });
    }
  };

  // Handle fullscreen changes with proper state management
    const handleFullscreenChange = () => {
      const nowFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(nowFullscreen);
      
      if (!nowFullscreen) {
        setViolations(prev => {
          const newFullscreenExits = prev.fullscreenExits + 1;
          onViolation(`Warning: Fullscreen exit detected (${newFullscreenExits}/${MAX_VIOLATIONS})`);
          
          if (newFullscreenExits >= MAX_VIOLATIONS) {
            onViolation('Maximum fullscreen exits exceeded! This will be reported.');
          }
          
          return { ...prev, fullscreenExits: newFullscreenExits };
        });
        
        // Attempt to re-enter fullscreen after a brief delay
        setTimeout(async () => {
          try {
            if (!document.fullscreenElement) {
              await document.documentElement.requestFullscreen();
            }
          } catch (error) {
            console.error('Failed to re-enter fullscreen:', error);
          }
        }, 1000);
      }
    };

    // Initial fullscreen setup
    const setupFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (error) {
        console.error('Error entering fullscreen:', error);
        onViolation('Fullscreen mode is required for the test');
      }
    };
    
    useEffect(() => {
      // Set up initial fullscreen and event listeners
      setupFullscreen();
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', handleFullscreenChange);

      // Cleanup function
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        
        // Exit fullscreen on unmount if we're in fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(console.error);
        }
      };
  }, []);

  useEffect(() => {
    // Block copy/paste
    const preventCopyPaste = (e) => {
      e.preventDefault();
      onViolation('Copy/paste is not allowed during the test');
    };

    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('cut', preventCopyPaste);

    // Cleanup
    return () => {
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('cut', preventCopyPaste);
    };
  }, [onViolation]);

  return null; // This component doesn't render anything
};

ExamSecurity.propTypes = {
  onViolation: PropTypes.func.isRequired,
};

export default ExamSecurity;
