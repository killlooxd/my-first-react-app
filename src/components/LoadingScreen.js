import React from 'react';
import './LoadingSpinner.css'; // Импортируйте стили спиннера

const LoadingScreen = () => {
  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#1E293B',
    color: '#F9FAFB',
    fontSize: '1.5rem',
  };

  return (
    <div style={loadingStyle}>
      <div className='spinner-container'>
        <div className='spinner'></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
