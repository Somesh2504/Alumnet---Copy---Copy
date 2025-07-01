import React, { useState } from 'react';
import axios from 'axios';
import './LoginForms.css';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
function StudentLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const {setUser,setCurrentUser}= useAppContext()
  const navigate = useNavigate()
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/student/login`, 
        {  
        email: formData.email,
        password: formData.password 
    },
    { withCredentials: true }
      );
      console.log('Login successful:', response.data);
      
      // Store token in localStorage if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      setCurrentUser(response.data)
      navigate('/');
      setUser('student')
      
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: ' + error.message);
    }
  };

  const handleForgotPassword = () => {
    alert('Password reset link will be sent to your registered email.');
  };

  return (
    <div className="student-login-container">
      <div className="student-login-form-wrapper">
        <div className="student-login-header">
          <h2>Student Login</h2>
          <p>Access your student portal to connect and collaborate</p>
        </div>

        <form onSubmit={handleSubmit} className="student-login-form">
          <div className="student-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'student-error' : ''}
            />
            {errors.email && <div className="student-error-message">{errors.email}</div>}
          </div>

          <div className="student-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'student-error' : ''}
            />
            {errors.password && <div className="student-error-message">{errors.password}</div>}
          </div>

          <div className="student-form-options">
            <div className="student-remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <button type="button" className="student-forgot-password-link" onClick={handleForgotPassword}>
              Forgot password?
            </button>
          </div>
      
          <button type="submit" className="form-login-button">
            Login to Student Portal
          </button>
        </form>

        <div className="student-login-footer">
          <p>Don't have an account? <a href="#/student/register">Register here</a></p>
          <p>Need help? <a href="#/support">Contact support</a></p>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
