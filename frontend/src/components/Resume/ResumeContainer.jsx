import React from 'react';
import PropTypes from 'prop-types';

/**
 * ResumeContainer - A wrapper component for the resume templates
 * that provides a consistent structure for PDF generation
 */
const ResumeContainer = ({ children, className = "" }) => {
  return (
    <div 
      className={`resume-container bg-white overflow-hidden ${className}`}
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        position: 'relative',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        boxSizing: 'border-box',
        padding: '0.5rem',
        minHeight: '1100px' // Approximate A4 height
      }}
    >
      {children}
    </div>
  );
};

ResumeContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default ResumeContainer;
