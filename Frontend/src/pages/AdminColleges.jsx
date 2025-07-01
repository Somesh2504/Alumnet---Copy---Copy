import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminColleges.css';
import { useAppContext } from '../context/AppContext';

const AdminColleges = () => {
  const [colleges, setColleges] = useState([]);
  const [pendingColleges, setPendingColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCollege, setNewCollege] = useState({
    name: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { baseURL } = useAppContext();

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminInfo');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    fetchColleges();
  }, [navigate]);

  const fetchColleges = async () => {
    try {
      const [allCollegesRes, pendingCollegesRes] = await Promise.all([
        fetch(`${baseURL}api/admin/colleges`, { credentials: 'include' }),
        fetch(`${baseURL}api/admin/pending-colleges`, { credentials: 'include' })
      ]);

      if (allCollegesRes.ok) {
        const allCollegesData = await allCollegesRes.json();
        setColleges(allCollegesData.colleges || []);
      }

      if (pendingCollegesRes.ok) {
        const pendingData = await pendingCollegesRes.json();
        setPendingColleges(pendingData.pendingColleges || []);
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCollege = async (collegeId) => {
    try {
      const response = await fetch(`${baseURL}api/admin/approve-college/${collegeId}`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        // Refresh the data
        fetchColleges();
      } else {
        alert('Failed to approve college');
      }
    } catch (error) {
      console.error('Error approving college:', error);
      alert('Error approving college');
    }
  };

  const handleDeleteCollege = async (collegeId) => {
    if (!window.confirm('Are you sure you want to delete this college?')) {
      return;
    }

    try {
      const response = await fetch(`${baseURL}api/admin/college/${collegeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchColleges();
      } else {
        alert('Failed to delete college');
      }
    } catch (error) {
      console.error('Error deleting college:', error);
      alert('Error deleting college');
    }
  };

  const handleAddCollege = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${baseURL}api/admin/register-college`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newCollege),
      });

      if (response.ok) {
        setNewCollege({ name: '', email: '', password: '' });
        setShowAddForm(false);
        fetchColleges();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to add college');
      }
    } catch (error) {
      console.error('Error adding college:', error);
      alert('Error adding college');
    }
  };

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPendingColleges = pendingColleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="admin-colleges-loading">
        <div className="loading-spinner"></div>
        <p>Loading Colleges...</p>
      </div>
    );
  }

  return (
    <div className="admin-colleges">
      {/* Header */}
      <header className="colleges-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              Back to Dashboard
            </button>
            <h1>College Management</h1>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="add-college-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add New College
          </button>
        </div>
      </header>

      {/* Search and Tabs */}
      <div className="colleges-controls">
        <div className="search-container">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search colleges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Colleges ({colleges.length})
          </button>
          <button
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approval ({pendingColleges.length})
          </button>
        </div>
      </div>

      {/* Colleges List */}
      <div className="colleges-content">
        {activeTab === 'all' ? (
          <div className="colleges-grid">
            {filteredColleges.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                <h3>No colleges found</h3>
                <p>Start by adding a new college or check your search terms.</p>
              </div>
            ) : (
              filteredColleges.map((college) => (
                <div key={college._id} className="college-card">
                  <div className="college-header">
                    <div className="college-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                    </div>
                    <div className="college-status">
                      <span className={`status-badge ${college.approved ? 'approved' : 'pending'}`}>
                        {college.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="college-info">
                    <h3>{college.name}</h3>
                    <p className="college-email">{college.email}</p>
                    <p className="college-date">
                      Added: {new Date(college.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="college-actions">
                    {!college.approved && (
                      <button
                        onClick={() => handleApproveCollege(college._id)}
                        className="action-btn approve"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCollege(college._id)}
                      className="action-btn delete"
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
        ) : (
          <div className="colleges-grid">
            {filteredPendingColleges.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <h3>No pending approvals</h3>
                <p>All colleges have been approved or there are no pending applications.</p>
              </div>
            ) : (
              filteredPendingColleges.map((college) => (
                <div key={college._id} className="college-card pending">
                  <div className="college-header">
                    <div className="college-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                    </div>
                    <div className="college-status">
                      <span className="status-badge pending">Pending</span>
                    </div>
                  </div>
                  
                  <div className="college-info">
                    <h3>{college.name}</h3>
                    <p className="college-email">{college.email}</p>
                    <p className="college-date">
                      Applied: {new Date(college.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="college-actions">
                    <button
                      onClick={() => handleApproveCollege(college._id)}
                      className="action-btn approve"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeleteCollege(college._id)}
                      className="action-btn delete"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add College Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New College</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="close-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddCollege} className="add-college-form">
              <div className="form-group">
                <label>College Name</label>
                <input
                  type="text"
                  value={newCollege.name}
                  onChange={(e) => setNewCollege({...newCollege, name: e.target.value})}
                  required
                  placeholder="Enter college name"
                />
              </div>
              
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={newCollege.email}
                  onChange={(e) => setNewCollege({...newCollege, email: e.target.value})}
                  required
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newCollege.password}
                  onChange={(e) => setNewCollege({...newCollege, password: e.target.value})}
                  required
                  placeholder="Enter password"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add College
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminColleges; 