import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import './CollegeLogin.css';

const CollegeLogin = () => {
  const navigate = useNavigate();
  const { setCurrentUser, setUser, baseURL } = useAppContext();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${baseURL}api/college/login`, 
        {
          email: formData.email,
          password: formData.password 
        },
        { withCredentials: true }
      );
      
      console.log('College login successful:', response.data);
      
      // Store token in localStorage for college authentication
      if (response.data.token) {
        localStorage.setItem('collegeToken', response.data.token);
        // Also store as generic token for compatibility
        localStorage.setItem('token', response.data.token);
      }
      
      // Set currentUser with the college data and add role
      const userData = {
        ...response.data.college,
        role: 'college'
      };
      setCurrentUser(userData);
      
      setUser('college');
      
      navigate('/college/dashboard');
      
    } catch (error) {
      console.error('College login failed:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="college-login-container">
      <motion.div 
        className="college-login-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="college-login-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1>College Login</h1>
          <p>Welcome back to your institution dashboard</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="college-login-form">
          <motion.div 
            className="college-form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
            />
          </motion.div>

          <motion.div 
            className="college-form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </motion.div>

          {error && (
            <motion.div 
              className="college-error-message"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="college-login-button"
            disabled={loading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="college-loading-spinner">
                <div className="college-spinner"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              'Login to Dashboard'
            )}
          </motion.button>
        </form>

        <motion.div 
          className="college-register-link"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>
            Don't have an account?{' '}
            <span onClick={() => navigate('/register/college')}>
              Register your institution
            </span>
          </p>
        </motion.div>

        <motion.div 
          className="college-back-link"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span onClick={() => navigate('/login')}>
             Back to login options
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CollegeLogin; 