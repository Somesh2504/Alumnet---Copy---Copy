import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Handler for navigation
  const handleNav = (path) => {
    navigate(path);
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        <motion.div 
          className="footer-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div className="footer-section" variants={itemVariants}>
            <h3 className="footer-title" style={{cursor:'pointer'}} onClick={() => handleNav('/')}>MentorMatch</h3>
            <p className="footer-description">
              Connecting students with mentors for impactful growth and development.
              Our platform empowers the next generation through structured mentorship.
            </p>
            <div className="social-links">
              <button className="social-link" aria-label="Facebook" onClick={() => window.open('https://facebook.com', '_blank')}>
                <i className="social-icon">f</i>
              </button>
              <button className="social-link" aria-label="Twitter" onClick={() => window.open('https://twitter.com', '_blank')}>
                <i className="social-icon">t</i>
              </button>
              <button className="social-link" aria-label="LinkedIn" onClick={() => window.open('https://linkedin.com', '_blank')}>
                <i className="social-icon">in</i>
              </button>
              <button className="social-link" aria-label="Instagram" onClick={() => window.open('https://instagram.com', '_blank')}>
                <i className="social-icon">ig</i>
              </button>
            </div>
          </motion.div>

          <motion.div className="footer-section" variants={itemVariants}>
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><button className="footer-link-btn" onClick={() => handleNav('/')}>Home</button></li>
              <li><button className="footer-link-btn" onClick={() => handleNav('/#features')}>Features</button></li>
              <li><button className="footer-link-btn" onClick={() => handleNav('/testimonials')}>Testimonials</button></li>
              <li><button className="footer-link-btn" onClick={() => handleNav('/#faq')}>FAQ</button></li>
              <li><button className="footer-link-btn" onClick={() => handleNav('/blog')}>Blog</button></li>
            </ul>
          </motion.div>

          <motion.div className="footer-section" variants={itemVariants}>
            <h3 className="footer-title">For Students</h3>
            <ul className="footer-links">
              <li><button className="footer-link-btn" onClick={() => handleNav('/alumnies')}>Find a Mentor</button></li>
              <li><button className="footer-link-btn" onClick={() => handleNav('/resources')}>Resources</button></li>
              <li><button className="footer-link-btn" onClick={() => handleNav('/events')}>Events</button></li>
              <li><button className="footer-link-btn" onClick={() => handleNav('/career-path')}>Career Paths</button></li>
              <li><button className="footer-link-btn" onClick={() => handleNav('/success-stories')}>Success Stories</button></li>
            </ul>
          </motion.div>

          <motion.div className="footer-section" variants={itemVariants}>
            <h3 className="footer-title">Contact Us</h3>
            <address className="contact-info">
              <p><strong>Email:</strong> <button className="footer-link-btn" onClick={() => window.location='mailto:info@mentormatch.com'}>info@mentormatch.com</button></p>
              <p><strong>Phone:</strong> <button className="footer-link-btn" onClick={() => window.location='tel:1234567890'}>(123) 456-7890</button></p>
              <p><strong>Address:</strong><br />
                 123 Learning Way,<br />
                 Education District,<br />
                 CA 90210
              </p>
            </address>
          </motion.div>
        </motion.div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">
            &copy; {new Date().getFullYear()} MentorMatch. All rights reserved.
          </p>
          <div className="legal-links">
            <button className="footer-link-btn" onClick={() => handleNav('/terms')}>Terms of Service</button>
            <span className="divider">|</span>
            <button className="footer-link-btn" onClick={() => handleNav('/privacy')}>Privacy Policy</button>
            <span className="divider">|</span>
            <button className="footer-link-btn" onClick={() => handleNav('/cookies')}>Cookie Policy</button>
          </div>
        </div>
      </div>
      
      <motion.div 
        className="newsletter"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="newsletter-content">
          <form className="newsletter-form" onSubmit={e => { e.preventDefault(); }}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              required
            />
            <motion.button 
              type="submit" 
              className="newsletter-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
            </motion.button>
          </form>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;