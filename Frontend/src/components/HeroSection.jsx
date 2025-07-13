import React from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      y: 30, 
      opacity: 0,
      scale: 0.95
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.7, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }
    }
  };

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      x: 100,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { 
        duration: 0.8, 
        ease: "easeOut", 
        delay: 0.4,
        type: "spring",
        stiffness: 80
      }
    }
  };

  // Button click handlers
  const handleFindMentor = () => {
    if (user === null) {
      navigate('/login');
    } else if (user === 'student') {
      navigate('/alumnies');
    } else {
      navigate('/alumnies');
    }
  };

  const handleBecomeMentor = () => {
    if (user === null) {
      navigate('/login');
    } else if (user === 'alumni') {
      navigate('/profile');
    } else {
      navigate('/profile');
    }
  };

  // Determine which buttons to show
  const shouldShowBothButtons = user === null;
  const shouldShowFindMentor = user === 'student';
  const shouldShowBecomeMentor = user === 'alumni';

  return (
    <div className="hero-container">
      {/* Background Elements */}
      <div className="hero-background">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
        <div className="bg-grid"></div>
      </div>

      <motion.div 
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div 
          className="hero-badge"
          variants={itemVariants}
        >
          <span>🚀 Join the Future of Mentorship</span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="hero-title">
          Unlock Your Potential with{' '}
          <span className="highlight">
            <div className="highlight-border"></div>
            <span className="highlight-text">AlumNet</span>
            <span className="highlight-glow"></span>
            <div className="highlight-shimmer"></div>
            <div className="highlight-particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
          </span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="hero-subtitle">
          A revolutionary mentorship ecosystem connecting ambitious students with experienced alumni. 
          Transform your career path through personalized guidance, structured learning, and powerful networking.
        </motion.p>
        
        <motion.div variants={itemVariants} className="hero-buttons">
          {/* Show both buttons when not logged in */}
          {shouldShowBothButtons && (
            <>
              <motion.button 
                className="primary-button"
                onClick={handleFindMentor}
                whileHover={{ 
                  scale: 1.05, 
                  y: -2,
                  boxShadow: '0 8px 25px rgba(67, 97, 238, 0.4)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="button-glow"></div>
                <div className="button-particles">
                  <div className="button-particle"></div>
                  <div className="button-particle"></div>
                  <div className="button-particle"></div>
                </div>
                <span>Find a Mentor</span>
                <span className="button-icon">→</span>
              </motion.button>
              
              <motion.button 
                className="secondary-button"
                onClick={handleBecomeMentor}
                whileHover={{ 
                  scale: 1.05, 
                  y: -2,
                  backgroundColor: 'rgba(67, 97, 238, 0.05)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="button-glow"></div>
                <div className="button-particles">
                  <div className="button-particle"></div>
                  <div className="button-particle"></div>
                  <div className="button-particle"></div>
                </div>
                <span>Become a Mentor</span>
                <span className="button-icon">✨</span>
              </motion.button>
            </>
          )}

          {/* Show only Find a Mentor button for students */}
          {shouldShowFindMentor && (
            <motion.button 
              className="primary-button"
              onClick={handleFindMentor}
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                boxShadow: '0 8px 25px rgba(67, 97, 238, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="button-glow"></div>
              <div className="button-particles">
                <div className="button-particle"></div>
                <div className="button-particle"></div>
                <div className="button-particle"></div>
              </div>
              <span>Find a Mentor</span>
              <span className="button-icon">→</span>
            </motion.button>
          )}

          {/* Show only Become a Mentor button for alumni */}
          {shouldShowBecomeMentor && (
            <motion.button 
              className="primary-button"
              onClick={handleBecomeMentor}
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                boxShadow: '0 8px 25px rgba(67, 97, 238, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="button-glow"></div>
              <div className="button-particles">
                <div className="button-particle"></div>
                <div className="button-particle"></div>
                <div className="button-particle"></div>
              </div>
              <span>Become a Mentor</span>
              <span className="button-icon">✨</span>
            </motion.button>
          )}
        </motion.div>
        
        <motion.div variants={itemVariants} className="hero-stats">
          <motion.div 
            className="stat-item"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3>1200+</h3>
            <p>Active Mentors</p>
            <div className="stat-glow"></div>
          </motion.div>
          <motion.div 
            className="stat-item"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3>5000+</h3>
            <p>Student Matches</p>
            <div className="stat-glow"></div>
          </motion.div>
          <motion.div 
            className="stat-item"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3>95%</h3>
            <p>Success Rate</p>
            <div className="stat-glow"></div>
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          className="trust-indicators"
          variants={itemVariants}
        >
          <div className="trust-text">Trusted by leading universities</div>
          <div className="trust-logos">
            <div className="trust-logo">🏛️</div>
            <div className="trust-logo">🎓</div>
            <div className="trust-logo">⚡</div>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="hero-visual"
        variants={imageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="hero-image-container">
          <div className="hero-image-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <div className="mentorship-icon">🤝</div>
              </div>
              <div className="placeholder-text">Mentorship in Action</div>
            </div>
          </div>
          <div className="floating-card floating-card-1">
            <span>📈</span>
            <p>Career Growth</p>
          </div>
          <div className="floating-card floating-card-2">
            <span>🤝</span>
            <p>Networking</p>
          </div>
          <div className="floating-card floating-card-3">
            <span>💡</span>
            <p>Expert Guidance</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;