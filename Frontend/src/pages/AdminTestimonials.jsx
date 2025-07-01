import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminTestimonials.css';
import { useAppContext } from '../context/AppContext';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all'
  });
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { baseURL } = useAppContext();

  const categories = [
    { value: 'general', label: 'General Experience' },
    { value: 'mentorship', label: 'Mentorship' },
    { value: 'networking', label: 'Networking' },
    { value: 'career_guidance', label: 'Career Guidance' },
    { value: 'platform_experience', label: 'Platform Experience' }
  ];

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminInfo');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    fetchTestimonials();
    fetchStats();
  }, [navigate, currentPage, filters]);

  const fetchTestimonials = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.category !== 'all' && { category: filters.category })
      });

      const response = await fetch(`${baseURL}api/testimonials/admin/all?${queryParams}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.testimonials);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${baseURL}api/testimonials/admin/stats`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (testimonialId, updates) => {
    try {
      const response = await fetch(`${baseURL}api/testimonials/admin/${testimonialId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchTestimonials();
        fetchStats();
        setShowModal(false);
        setSelectedTestimonial(null);
      }
    } catch (error) {
      console.error('Error updating testimonial status:', error);
    }
  };

  const handleDelete = async (testimonialId) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      const response = await fetch(`${baseURL}api/testimonials/admin/${testimonialId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchTestimonials();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
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

  const getStatusBadge = (isApproved) => {
    return (
      <span className={`status-badge ${isApproved ? 'approved' : 'pending'}`}>
        {isApproved ? 'Approved' : 'Pending'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="admin-testimonials-loading">
        <div className="loading-spinner"></div>
        <p>Loading Testimonials...</p>
      </div>
    );
  }

  return (
    <div className="admin-testimonials">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-info">
            <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Dashboard
            </button>
            <div className="admin-details">
              <h1>Manage Testimonials</h1>
              <p>Review and approve user testimonials</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.total || 0}</h3>
              <p>Total Testimonials</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon approved">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.approved || 0}</h3>
              <p>Approved</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.pending || 0}</h3>
              <p>Pending Review</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon featured">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.featured || 0}</h3>
              <p>Featured</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filters.status} 
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={filters.category} 
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Testimonials List */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          {testimonials.length === 0 ? (
            <div className="no-testimonials">
              <p>No testimonials found matching your criteria.</p>
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <div key={testimonial._id} className={`testimonial-card ${testimonial.isFeatured ? 'featured' : ''}`}>
                {testimonial.isFeatured && (
                  <div className="featured-badge">Featured</div>
                )}
                
                <div className="testimonial-header">
                  <div className="admin-testimonial-user-info">
                    <img 
                      src={testimonial.userImage || '/api/placeholder/50/50'} 
                      alt={testimonial.userName}
                      className="user-avatar"
                    />
                    <div>
                      <h4>{testimonial.userName}</h4>
                      <p>{testimonial.userRole}</p>
                      <div className="rating">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="testimonial-meta">
                    {getStatusBadge(testimonial.isApproved)}
                    <span className="category">{getCategoryLabel(testimonial.category)}</span>
                    <span className="date">
                      {new Date(testimonial.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="testimonial-content">
                  <p className="review-text">"{testimonial.review}"</p>
                </div>

                <div className="testimonial-actions">
                  <button 
                    onClick={() => {
                      setSelectedTestimonial(testimonial);
                      setShowModal(true);
                    }}
                    className="btn btn-primary"
                  >
                    Manage
                  </button>
                  <button 
                    onClick={() => handleDelete(testimonial._id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* Modal for managing testimonial */}
      {showModal && selectedTestimonial && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Manage Testimonial</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="testimonial-preview">
                <div className="admin-testimonial-user-info">
                  <img 
                    src={selectedTestimonial.userImage || '/api/placeholder/50/50'} 
                    alt={selectedTestimonial.userName}
                    className="user-avatar"
                  />
                  <div>
                    <h4>{selectedTestimonial.userName}</h4>
                    <p>{selectedTestimonial.userRole}</p>
                    <div className="rating">
                      {renderStars(selectedTestimonial.rating)}
                    </div>
                  </div>
                </div>
                
                <p className="review-text">"{selectedTestimonial.review}"</p>
                
                <div className="testimonial-details">
                  <p><strong>Category:</strong> {getCategoryLabel(selectedTestimonial.category)}</p>
                  <p><strong>Submitted:</strong> {new Date(selectedTestimonial.createdAt).toLocaleString()}</p>
                  <p><strong>Status:</strong> {selectedTestimonial.isApproved ? 'Approved' : 'Pending'}</p>
                  <p><strong>Featured:</strong> {selectedTestimonial.isFeatured ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              <div className="modal-actions">
                <div className="action-group">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={selectedTestimonial.isApproved}
                      onChange={(e) => handleStatusUpdate(selectedTestimonial._id, { 
                        isApproved: e.target.checked 
                      })}
                    />
                    Approve Testimonial
                  </label>
                </div>
                
                <div className="action-group">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={selectedTestimonial.isFeatured}
                      onChange={(e) => handleStatusUpdate(selectedTestimonial._id, { 
                        isFeatured: e.target.checked 
                      })}
                    />
                    Feature Testimonial
                  </label>
                </div>
                
                <div className="action-group">
                  <label>Admin Notes:</label>
                  <textarea 
                    value={selectedTestimonial.adminNotes || ''}
                    onChange={(e) => handleStatusUpdate(selectedTestimonial._id, { 
                      adminNotes: e.target.value 
                    })}
                    placeholder="Add notes about this testimonial..."
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials; 