import React, { useState } from 'react';
import './LoginForms.css';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
function AlumniLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const {setUser,setCurrentUser}=useAppContext()
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
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
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
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
      const response = await axios.post('http://localhost:5000/api/alumni/login', 
        {  
        email: formData.email,
        password: formData.password 
    },
    { withCredentials: true }
      );
      // console.log('Login successful:', response.data);
      
      // Store token in localStorage if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      setCurrentUser(response.data)
      navigate('/');
      setUser('alumni')
      
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: ' + error.message);
    }
  };


  const handleForgotPassword = () => {
    alert('Password reset link will be sent to your email');
    // In a real app with React Router:
    // navigate('/alumni/reset-password');
  };

  return (
    <div className="alumni-login-container">
      <div className="alumni-login-form-wrapper">
        <div className="alumni-login-header">
          <h2>Alumni Login</h2>
          <p>Connect with fellow graduates, find opportunities, and stay updated</p>
        </div>
        
        <form onSubmit={handleSubmit} className="alumni-login-form">
          <div className="alumni-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'alumni-error' : ''}
            />
            {errors.email && <div className="alumni-error-message">{errors.email}</div>}
          </div>
          
          <div className="alumni-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'alumni-error' : ''}
            />
            {errors.password && <div className="alumni-error-message">{errors.password}</div>}
          </div>
          
          <div className="alumni-form-options">
            <div className="alumni-remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <button 
              type="button" 
              className="alumni-forgot-password-link"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>
          
          <button type="submit" className="form-login-button alumni-button">
            Login to Alumni Network
          </button>
        </form>
        
        <div className="alumni-login-footer">
          <p>Not registered yet? <a href="#/alumni/register">Join the alumni network</a></p>
          <p>Need help? <a href="#/support">Contact support</a></p>
        </div>
      </div>
    </div>
  );
}

export default AlumniLogin;