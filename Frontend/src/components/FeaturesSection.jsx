import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './FeaturesSection.css';

const FeaturesSection = () => {
  const navigate = useNavigate();
  // Enhanced features data with navigation
  const features = [
    {
      id: 1,
      icon: '🎥',
      title: 'One-on-One Video/Audio Interaction',
      description: 'Connect directly with mentors through high-quality video and audio calls for personalized guidance sessions.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      category: 'Communication',
      navigateTo: '/call/mentor' // Example route
    },
    {
      id: 2,
      icon: '🤝',
      title: 'Structured Alumni-Student Mentorship',
      description: 'Get matched with experienced alumni who guide you through a structured mentorship program tailored to your goals.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      category: 'Matching',
      navigateTo: '/alumnies'
    },
    {
      id: 3,
      icon: '💬',
      title: 'Integrated Chat Communication',
      description: 'Stay connected with your mentor through our seamless messaging system for ongoing support and quick questions.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      category: 'Communication',
      navigateTo: '/chat'
    },
    {
      id: 4,
      icon: '🔄',
      title: 'Referral Support System',
      description: 'Access a network of specialized mentors through referrals when you need specific expertise beyond your primary mentor.',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      category: 'Network',
      navigateTo: '/community'
    },
    {
      id: 5,
      icon: '🎯',
      title: 'Goal-Setting Framework',
      description: 'Define clear objectives and track progress with our structured goal-setting and achievement monitoring system.',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      category: 'Planning',
      navigateTo: '/profile'
    },
    {
      id: 6,
      icon: '⏱️',
      title: 'Strategic Time Management',
      description: 'Learn effective time management techniques with scheduling tools and mentor-guided productivity strategies.',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      category: 'Productivity',
      navigateTo: '/profile'
    }
  ];

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const featureVariants = {
    hidden: { 
      y: 50, 
      opacity: 0,
      scale: 0.9
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="features-container">
      <div className="features-background">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
      </div>

      <motion.div
        className="features-header"
        variants={headerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="header-badge">
          <span>✨ Features</span>
        </div>
        <h2>Powerful Features for Effective Mentorship</h2>
        <p>Our platform combines cutting-edge technology with human connection to create an impactful mentorship experience that drives real results.</p>
      </motion.div>
      
      <motion.div 
        className="features-grid" 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {features.map((feature) => (
          <motion.div 
            key={feature.id} 
            className="feature-card feature-card-btn"
            variants={featureVariants}
            whileHover={{ 
              y: -8, 
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.98 }}
            tabIndex={0}
            role="button"
            onClick={() => navigate(feature.navigateTo)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(feature.navigateTo); }}
            style={{ cursor: 'pointer' }}
          >
            <div className="feature-card-header">
              <div 
                className="feature-icon-container"
                style={{ background: feature.gradient }}
              >
                <span className="feature-icon">{feature.icon}</span>
              </div>
              <span className="feature-category">{feature.category}</span>
            </div>
            
            <div className="feature-content">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>

            <div className="feature-card-footer">
              <motion.button 
                className="learn-more-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={e => { e.stopPropagation(); navigate(feature.navigateTo); }}
              >
                Learn More →
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        className="features-cta"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <h3>Ready to Start Your Mentorship Journey?</h3>
        <p>Join thousands of students and alumni who are already benefiting from our platform</p>
        <motion.button 
          className="cta-button"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/register')}
        >
          Get Started Today
        </motion.button>
      </motion.div>
    </div>
  );
};

export default FeaturesSection;