import React from 'react';
import { motion } from 'framer-motion';
import './PageTransition.css';

const PageTransitionNoLoading = ({ children, className = "" }) => {
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

export default PageTransitionNoLoading; 