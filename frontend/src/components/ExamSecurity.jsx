import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * ExamSecurity component for monitoring exam security violations
 * Detects tab switches, copy-paste attempts, fullscreen exit, and other security violations
 */
const ExamSecurity = ({ onViolation, requireFullscreen = true }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let isActive = true;

    // Request fullscreen on component mount if required
    const enterFullscreen = async () => {
      if (requireFullscreen && !document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        } catch (error) {
          console.error('Failed to enter fullscreen:', error);
          if (onViolation) {
            onViolation('Failed to enter fullscreen mode - exam requires fullscreen');
          }
        }
      }
    };

    // Monitor fullscreen changes
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (requireFullscreen && !isCurrentlyFullscreen && isActive) {
        if (onViolation) {
          onViolation('Fullscreen mode exited - this is not allowed during the exam');
        }
        // Try to re-enter fullscreen
        setTimeout(() => {
          if (isActive && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {
              if (onViolation) {
                onViolation('Unable to restore fullscreen mode - exam terminated');
              }
            });
          }
        }, 1000);
      }
    };

    // Prevent copy, cut, paste
    const preventCopyPaste = (e) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        if (onViolation) {
          onViolation('Copy/Paste attempt detected');
        }
      }
    };

    // Prevent right-click context menu
    const preventContextMenu = (e) => {
      e.preventDefault();
      if (onViolation) {
        onViolation('Right-click attempt detected');
      }
    };

    // Detect tab switch or window focus loss
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        if (onViolation) {
          onViolation('Tab switch or window focus lost detected');
        }
      }
    };

    // Detect window blur (focus loss)
    const handleWindowBlur = () => {
      if (isActive && onViolation) {
        onViolation('Window focus lost - possible tab switch');
      }
    };

    // Prevent F12, Ctrl+Shift+I, Ctrl+U, Alt+Tab, Windows key (developer tools and task switching)
    const preventDevTools = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.altKey && e.key === 'Tab') ||
        (e.metaKey && e.key === 'Tab') ||
        e.key === 'Meta' ||
        e.key === 'Alt'
      ) {
        e.preventDefault();
        if (onViolation) {
          onViolation('Restricted key combination detected');
        }
      }
      
      // Prevent Escape key to exit fullscreen
      if (e.key === 'Escape' && requireFullscreen) {
        e.preventDefault();
        if (onViolation) {
          onViolation('Attempt to exit fullscreen detected');
        }
      }
    };

    // Initialize fullscreen and add event listeners
    if (requireFullscreen) {
      enterFullscreen();
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    // Add event listeners
    document.addEventListener('keydown', preventCopyPaste);
    document.addEventListener('keydown', preventDevTools);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', (e) => {
      if (isActive && requireFullscreen) {
        e.preventDefault();
        e.returnValue = 'Leaving the exam will result in automatic submission. Are you sure?';
      }
    });

    // Cleanup function
    return () => {
      isActive = false;
      document.removeEventListener('keydown', preventCopyPaste);
      document.removeEventListener('keydown', preventDevTools);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      
      if (requireFullscreen) {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        // Exit fullscreen when component unmounts
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(console.error);
        }
      }
    };
  }, [onViolation, requireFullscreen]);

  // Render fullscreen status indicator
  return requireFullscreen ? (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      zIndex: 9999,
      background: isFullscreen ? '#22c55e' : '#ef4444',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 'bold',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      {isFullscreen ? '🔒 SECURE MODE' : '⚠️ FULLSCREEN REQUIRED'}
    </div>
  ) : null;
};

ExamSecurity.propTypes = {
  onViolation: PropTypes.func.isRequired,
  requireFullscreen: PropTypes.bool
};

export default ExamSecurity;
