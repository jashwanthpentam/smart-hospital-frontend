import React from 'react';

const LoadingSpinner = ({
  text = 'Loading records...',
  subtext,
  size = 'md',
  className = ''
}) => {
  return (
    <div className={`spinner-container ${className}`}>
      <div className={`spinner-ring spinner-${size}`}>
        <div className="spinner-circle"></div>
      </div>
      <p className="spinner-text">{text}</p>
      {subtext && <p className="spinner-subtext">{subtext}</p>}
    </div>
  );
};

export default LoadingSpinner;
