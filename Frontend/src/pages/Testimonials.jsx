import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import PageTransitionNoLoading from '../components/PageTransitionNoLoading';
import './Testimonials.css';

const Testimonials = () => {
  const { currentUser, baseURL } = useAppContext();
  const [testimonials, setTestimonials] = useState([]);
  const [userTestimonial, setUserTestimonial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    review: '',
    category: 'general'
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const categories = [
    { value: 'general', label: 'General Experience' },
    { value: 'mentorship', label: 'Mentorship' },
    { value: 'networking', label: 'Networking' },
    { value: 'career_guidance', label: 'Career Guidance' },
    { value: 'platform_experience', label: 'Platform Experience' }
  ];
  

  useEffect(() => {
    fetchTestimonials();
    if (currentUser) {
      fetchUserTestimonial();
    }
  }, [currentUser]);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${baseURL}api/testimonials/public?limit=50`);
      const data = await response.json();
      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTestimonial = async () => {
    try {
      const response = await fetch(`${baseURL}api/testimonials/my-testimonial`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success && data.testimonial) {
        setUserTestimonial(data.testimonial);
        setFormData({
          rating: data.testimonial.rating,
          review: data.testimonial.review,
          category: data.testimonial.category
        });
      }
    } catch (error) {
      console.error('Error fetching user testimonial:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const url = userTestimonial 
        ? `${baseURL}api/testimonials/my-testimonial`
        : `${baseURL}api/testimonials`;
      
      const method = userTestimonial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setShowForm(false);
        fetchTestimonials();
        if (!userTestimonial) {
          fetchUserTestimonial();
        }
      } else {
        setMessage(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your testimonial?')) {
      return;
    }

    try {
      const response = await fetch(`${baseURL}api/testimonials/my-testimonial`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setUserTestimonial(null);
        setFormData({ rating: 5, review: '', category: 'general' });
        setMessage('Testimonial deleted successfully');
        fetchTestimonials();
      } else {
        setMessage(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      setMessage('Something went wrong. Please try again.');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  const getCategoryLabel = (category) => {
    const found = categories.find(cat => cat.value === category);
    return found ? found.label : category;
  };

  if (loading) {
    return (
      <div className="testimonials-container">
        <div className="loading">Loading testimonials...</div>
      </div>
    );
  }

  return (
    <PageTransitionNoLoading>
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h1>What Our Community Says</h1>
          <p>Read reviews from students, alumni, and colleges about their experience with our platform</p>
          
          {currentUser && (
            <div className="user-actions">
              {userTestimonial ? (
                <div className="user-testimonial-status">
                  <p>You have submitted a testimonial</p>
                  <div className="status-buttons">
                    <button 
                      onClick={() => setShowForm(true)}
                      className="btn btn-primary"
                    >
                      Edit My Review
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="btn btn-danger"
                    >
                      Delete My Review
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary"
                >
                  Write a Review
                </button>
              )}
            </div>
          )}
        </div>

        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {showForm && (
          <div className="testimonial-form-overlay">
            <div className="testimonial-form">
              <h2>{userTestimonial ? 'Edit Your Review' : 'Write a Review'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Rating:</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`star-button ${star <= formData.rating ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, rating: star })}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Category:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Your Review:</label>
                  <textarea
                    value={formData.review}
                    onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                    placeholder="Share your experience with our platform..."
                    maxLength={500}
                    required
                  />
                  <small>{formData.review.length}/500 characters</small>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="btn btn-primary"
                  >
                    {submitting ? 'Submitting...' : (userTestimonial ? 'Update Review' : 'Submit Review')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="testimonials-grid">
          {testimonials.length === 0 ? (
            <div className="no-testimonials">
              <p>No testimonials yet. Be the first to share your experience!</p>
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <div key={testimonial._id} className={`testimonial-card ${testimonial.isFeatured ? 'featured' : ''}`}>
                {testimonial.isFeatured && (
                  <div className="featured-badge">Featured</div>
                )}
                
                <div className="testimonial-header">
                  <div className="user-infor">
                    <img 
                      src={testimonial.userImage || '/api/placeholder/50/50'} 
                      alt={testimonial.userName}
                      className="user-avatar"
                    />
                    <div>
                      <h4>{testimonial.userName}</h4>
                      <p>{testimonial.userRole}</p>
                    </div>
                  </div>
                  <div className="rating">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>

                <div className="testimonial-content">
                  <p className="review-text">"{testimonial.review}"</p>
                  <div className="testimonial-meta">
                    <span className="category">{getCategoryLabel(testimonial.category)}</span>
                    <span className="date">
                      {new Date(testimonial.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!currentUser && (
          <div className="cta-section">
            <h3>Share Your Experience</h3>
            <p>Join our community and share your story about how our platform has helped you</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="btn btn-primary"
            >
              Login to Write a Review
            </button>
          </div>
        )}
      </div>
    </PageTransitionNoLoading>
  );
};

export default Testimonials; 