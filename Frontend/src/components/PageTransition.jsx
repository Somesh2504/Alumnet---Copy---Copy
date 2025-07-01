import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PageTransition.css';

const PageTransition = ({ children, className = "" }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Loading animation variants
  const loadingVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  // Page content animation variants
  const pageVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Floating background elements
  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (isLoading) {
    return (
      <AnimatePresence>
        <motion.div
          className="page-loading"
          variants={loadingVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h2>Loading Amazing Content...</h2>
            <p>Preparing your experience</p>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      className={`page-transition ${className}`}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background Elements */}
      <div className="page-background">
        <motion.div 
          className="bg-circle bg-circle-1"
          variants={floatingVariants}
          animate="animate"
        ></motion.div>
        <motion.div 
          className="bg-circle bg-circle-2"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '1s' }}
        ></motion.div>
        <motion.div 
          className="bg-circle bg-circle-3"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
        ></motion.div>
        <div className="bg-grid"></div>
      </div>

      {/* Page Content */}
      <motion.div variants={itemVariants}>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default PageTransition; 