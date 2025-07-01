import React, { useState } from 'react';
import './LoginForms.css';

import { useNavigate } from 'react-router-dom';
function Register() {
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
        <h2>Welcome To AlumNET</h2>
        
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
              <p>Enroll as student</p>
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
              <p>Enroll alumni / Former student</p>
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
              <p>Register your educational institution</p>
            </div>
          </div>
        </div>
        <p className="redirect-message">
          Already have an account?{' '}
          <span className="redirect-link" onClick={() => navigate('/login')}>
            Login
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

export default Register;