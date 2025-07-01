import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TestimonialSection.css';

const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/testimonials/public?limit=50');
      const data = await response.json();
      if (data.success && data.testimonials.length > 0) {
        setTestimonials(data.testimonials);
      } else {
        // Fallback to default testimonials if no real ones exist
        setTestimonials([
          {
            _id: 1,
            userName: "Alex Johnson",
            userRole: "Computer Science Junior",
            userImage: "/api/placeholder/100/100",
            review: "MentorMatch connected me with an industry professional who helped me refine my programming skills and land an internship at a top tech company. The structured approach kept me accountable and focused on my goals.",
            rating: 5
          },
          {
            _id: 2,
            userName: "Sarah Chen",
            userRole: "Business Administration Student",
            userImage: "/api/placeholder/100/100",
            review: "My mentor gave me insights into real-world business operations that no textbook could offer. The one-on-one video sessions were incredibly valuable, and the goal-setting framework helped me map out my career path.",
            rating: 5
          },
          {
            _id: 3,
            userName: "Miguel Rodriguez",
            userRole: "Engineering Student",
            userImage: "/api/placeholder/100/100",
            review: "As a first-generation college student, having a mentor who understood my challenges made all the difference. The platform's integrated chat allowed me to get quick feedback whenever I needed guidance.",
            rating: 5
          },
          {
            _id: 4,
            userName: "Priya Patel",
            userRole: "Pre-Med Student",
            userImage: "/api/placeholder/100/100",
            review: "The referral support system was game-changing for me. My primary mentor connected me with specialists in different medical fields, which helped me make informed decisions about my specialization.",
            rating: 5
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Fallback to default testimonials on error
      setTestimonials([
        {
          _id: 1,
          userName: "Alex Johnson",
          userRole: "Computer Science Junior",
          userImage: "/api/placeholder/100/100",
          review: "MentorMatch connected me with an industry professional who helped me refine my programming skills and land an internship at a top tech company. The structured approach kept me accountable and focused on my goals.",
          rating: 5
        },
        {
          _id: 2,
          userName: "Sarah Chen",
          userRole: "Business Administration Student",
          userImage: "/api/placeholder/100/100",
          review: "My mentor gave me insights into real-world business operations that no textbook could offer. The one-on-one video sessions were incredibly valuable, and the goal-setting framework helped me map out my career path.",
          rating: 5
        },
        {
          _id: 3,
          userName: "Miguel Rodriguez",
          userRole: "Engineering Student",
          userImage: "/api/placeholder/100/100",
          review: "As a first-generation college student, having a mentor who understood my challenges made all the difference. The platform's integrated chat allowed me to get quick feedback whenever I needed guidance.",
          rating: 5
        },
        {
          _id: 4,
          userName: "Priya Patel",
          userRole: "Pre-Med Student",
          userImage: "/api/placeholder/100/100",
          review: "The referral support system was game-changing for me. My primary mentor connected me with specialists in different medical fields, which helped me make informed decisions about my specialization.",
          rating: 5
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Navigate through testimonials
  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.5 } }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="testimonial-container">
        <div className="loading">Loading testimonials...</div>
      </div>
    );
  }

  return (
    <div className="testimonial-container">
      <motion.div
        className="testimonial-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="header-badge">
          <span>💬 Testimonials</span>
        </div>
        <h2>What Our Students Say</h2>
        <p>Hear from students whose academic and professional journeys have been transformed</p>
      </motion.div>
      
      <div className="testimonial-carousel">
        <button className="carousel-button prev" onClick={prevTestimonial}>
          &lt;
        </button>
        
        <div className="testimonial-window">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIndex}
              className="testimonial-card"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="quote-mark">"</div>
              <p className="testimonial-quote">{testimonials[currentIndex].review}</p>
              <div className="testimonial-author">
                <img 
                  src={testimonials[currentIndex].userImage} 
                  alt={testimonials[currentIndex].userName} 
                  className="author-image"
                />
                <div className="author-info">
                  <h4>{testimonials[currentIndex].userName}</h4>
                  <p>{testimonials[currentIndex].userRole}</p>
                  <div className="rating">
                    {renderStars(testimonials[currentIndex].rating)}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <button className="carousel-button next" onClick={nextTestimonial}>
          &gt;
        </button>
      </div>
      
      <div className="testimonial-indicators">
        {testimonials.map((_, index) => (
          <button 
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
      
      <motion.div
        className="testimonial-cta"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <p>Want to share your experience?</p>
        <a href="/testimonials" className="cta-button">Write a Review</a>
      </motion.div>
    </div>
  );
};

export default TestimonialSection;