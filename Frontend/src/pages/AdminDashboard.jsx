import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [adminInfo, setAdminInfo] = useState(null);
  const [stats, setStats] = useState({
    totalColleges: 0,
    pendingColleges: 0,
    totalStudents: 0,
    totalAlumni: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminInfo');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    setAdminInfo(JSON.parse(adminData));
    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="alumnet-background">
        <div className="admin-dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alumnet-background">
      <div className="admin-dashboard">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-content">
            <div className="admin-info">
              <div className="admin-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="admin-details">
                <h1>Welcome, Super Admin</h1>
                <p>{adminInfo?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* Navigation */}
        <nav className="admin-nav">
          <div className="nav-container">
            <button 
              onClick={() => navigate('/admin/colleges')}
              className="nav-item"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              <span>Manage Colleges</span>
            </button>
            
            <button 
              onClick={() => navigate('/admin/students')}
              className="nav-item"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Student Profiles</span>
            </button>
            
            <button 
              onClick={() => navigate('/admin/alumni')}
              className="nav-item"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Alumni Profiles</span>
            </button>
            
            <button 
              onClick={() => navigate('/admin/testimonials')}
              className="nav-item"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <span>Manage Testimonials</span>
            </button>
            
            <button 
              onClick={() => navigate('/admin/pending-colleges')}
              className="nav-item pending"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>Pending Approvals</span>
              {stats.pendingColleges > 0 && (
                <span className="badge">{stats.pendingColleges}</span>
              )}
            </button>
          </div>
        </nav>

        {/* Stats Cards */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon colleges">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>{stats.totalColleges}</h3>
                <p>Total Colleges</p>
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
                <h3>{stats.pendingColleges}</h3>
                <p>Pending Approvals</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon students">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>{stats.totalStudents}</h3>
                <p>Total Students</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon alumni">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>{stats.totalAlumni}</h3>
                <p>Total Alumni</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button 
              onClick={() => navigate('/admin/colleges/new')}
              className="action-card"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <h3>Add New College</h3>
              <p>Register a new college institution</p>
            </button>

            <button 
              onClick={() => navigate('/admin/pending-colleges')}
              className="action-card"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
              </svg>
              <h3>Review Pending</h3>
              <p>Approve or reject college applications</p>
            </button>

            <button 
              onClick={() => navigate('/admin/testimonials')}
              className="action-card"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <h3>Manage Testimonials</h3>
              <p>Review and approve user testimonials</p>
            </button>

            <button 
              onClick={() => navigate('/admin/students')}
              className="action-card"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <h3>View Students</h3>
              <p>Browse and manage student profiles</p>
            </button>

            <button 
              onClick={() => navigate('/admin/alumni')}
              className="action-card"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <h3>View Alumni</h3>
              <p>Browse and manage alumni profiles</p>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard; 