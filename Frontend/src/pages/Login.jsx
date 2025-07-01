import React, { useState } from 'react';
import './Login.css';

import { useNavigate } from 'react-router-dom';
function Login() {
  const [selectedType, setSelectedType] = useState('');
  const [error, setError] = useState('');
   const navigate = useNavigate();
  const handleTypeSelection = (type) => {
    setSelectedType(type);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedType) {
      setError('Please select whether you are a Student, Alumni, or College');
      return;
    }
    
    // Navigate based on selection
    if (selectedType === 'student') {
       navigate('student');
    } else if (selectedType === 'alumni') {
      navigate('alumni');
    } else if (selectedType === 'college') {
      navigate('college');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="user-type-form">
        <h2>Welcome Back To AlumNET</h2>
        
        <div className="radio-options">
          <div 
            className={`option-card ${selectedType === 'student' ? 'selected' : ''}`}
            onClick={() => handleTypeSelection('student')}
          >
            <div className="radio-circle">
              {selectedType === 'student' && <div className="radio-inner-circle"></div>}
            </div>
            <div className="option-label">
              <h3>Student</h3>
              <p>Current student enrolled in our programs</p>
            </div>
          </div>

          <div 
            className={`option-card ${selectedType === 'alumni' ? 'selected' : ''}`}
            onClick={() => handleTypeSelection('alumni')}
          >
            <div className="radio-circle">
              {selectedType === 'alumni' && <div className="radio-inner-circle"></div>}
            </div>
            <div className="option-label">
              <h3>Alumni</h3>
              <p>Former student who completed our programs</p>
            </div>
          </div>

          <div 
            className={`option-card ${selectedType === 'college' ? 'selected' : ''}`}
            onClick={() => handleTypeSelection('college')}
          >
            <div className="radio-circle">
              {selectedType === 'college' && <div className="radio-inner-circle"></div>}
            </div>
            <div className="option-label">
              <h3>College</h3>
              <p>Educational institution administrator</p>
            </div>
          </div>
        </div>
        <p className="redirect-message">
  Don't have an account?{' '}
  <span className="redirect-link" onClick={() => navigate('/register')}>
    Sign up
  </span>
</p>

        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="continue-button">
          Continue
        </button>
      </form>
    </div>
  );
}

export default Login;