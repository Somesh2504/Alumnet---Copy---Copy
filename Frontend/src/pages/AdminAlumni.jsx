import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminAlumni.css';

const AdminAlumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [colleges, setColleges] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminInfo');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    fetchAlumni();
    fetchColleges();
  }, [navigate]);

  const fetchAlumni = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/alumni`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAlumni(data.alumni || []);
      }
    } catch (error) {
      console.error('Error fetching alumni:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/colleges`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setColleges(data.colleges || []);
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const handleDeleteAlumni = async (alumniId) => {
    if (!window.confirm('Are you sure you want to delete this alumni?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/alumni/${alumniId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchAlumni();
      } else {
        alert('Failed to delete alumni');
      }
    } catch (error) {
      console.error('Error deleting alumni:', error);
      alert('Error deleting alumni');
    }
  };

  const filteredAlumni = alumni.filter(alum => {
    const matchesSearch = 
      alum.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alum.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alum.college?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alum.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alum.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCollege = selectedCollege === 'all' || alum.college?._id === selectedCollege;
    
    return matchesSearch && matchesCollege;
  });

  if (isLoading) {
    return (
      <div className="admin-alumni-loading">
        <div className="admin-alumni-loading-spinner"></div>
        <p>Loading Alumni...</p>
      </div>
    );
  }

  return (
    <div className="admin-alumni">
      {/* Header */}
      <header className="admin-alumni-header">
        <div className="admin-alumni-header-content">
          <div className="admin-alumni-header-left">
            <button onClick={() => navigate('/admin/dashboard')} className="admin-alumni-back-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              Back to Dashboard
            </button>
            <h1>Alumni Management</h1>
          </div>
          <div className="admin-alumni-header-stats">
            <div className="admin-alumni-stat-item">
              <span className="admin-alumni-stat-number">{alumni.length}</span>
              <span className="admin-alumni-stat-label">Total Alumni</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="admin-alumni-controls">
        <div className="admin-alumni-search-container">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search alumni by name, email, college, company, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-alumni-search-input"
          />
        </div>

        <div className="admin-alumni-filters">
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="admin-alumni-college-filter"
          >
            <option value="all">All Colleges</option>
            {colleges.map(college => (
              <option key={college._id} value={college._id}>
                {college.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alumni List */}
      <div className="admin-alumni-content">
        <div className="admin-alumni-grid">
          {filteredAlumni.length === 0 ? (
            <div className="admin-alumni-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <h3>No alumni found</h3>
              <p>No alumni match your search criteria or there are no alumni registered yet.</p>
            </div>
          ) : (
            filteredAlumni.map((alum) => (
              <div key={alum._id} className="admin-alumni-card">
                <div className="admin-alumni-card-header">
                  <div className="admin-alumni-avatar">
                    {alum.profilePic ? (
                      <img src={alum.profilePic} alt={alum.name} />
                    ) : (
                      <div className="default-avatar">
                        {alum.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="alumni-status">
                    <span className="admin-alumni-status-badge active">Alumni</span>
                  </div>
                </div>
                
                <div className="admin-alumni-info">
                  <h3>{alum.name}</h3>
                  <p className="admin-alumni-email">{alum.email}</p>
                  <p className="admin-alumni-college">
                    <strong>College:</strong> {alum.college?.name || 'N/A'}
                  </p>
                  <p className="admin-alumni-branch">
                    <strong>Branch:</strong> {alum.branch || 'N/A'}
                  </p>
                  <p className="admin-alumni-graduation">
                    <strong>Graduation Year:</strong> {alum.graduationYear || 'N/A'}
                  </p>
                  {alum.company && (
                    <p className="admin-alumni-company">
                      <strong>Company:</strong> {alum.company}
                    </p>
                  )}
                  {alum.position && (
                    <p className="admin-alumni-position">
                      <strong>Position:</strong> {alum.position}
                    </p>
                  )}
                  <p className="admin-alumni-date">
                    Joined: {new Date(alum.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="admin-alumni-actions">
                  <button
                    onClick={() => navigate(`/alumni/${alum._id}`)}
                    className="admin-alumni-action-btn view"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    View Profile
                  </button>
                  <button
                    onClick={() => handleDeleteAlumni(alum._id)}
                    className="admin-alumni-action-btn delete"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAlumni; 