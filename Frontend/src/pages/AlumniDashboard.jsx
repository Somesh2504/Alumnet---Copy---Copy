import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import {
  FaUserGraduate, FaBriefcase, FaUsers, FaComments, FaEnvelope,
  FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaStar, FaCertificate,
  FaProjectDiagram, FaHistory, FaChartBar, FaEdit, FaSignOutAlt,
  FaBell, FaSearch, FaFilter, FaPlus, FaEye, FaPhone
} from 'react-icons/fa';
import './AlumniDashboard.css';

const AlumniDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout, baseURL } = useAppContext();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalConnections: 0,
      mentorshipRequests: 0,
      activeMentees: 0,
      totalMessages: 0
    },
    recentActivity: [],
    pendingRequests: [],
    connections: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'alumni') {
      navigate('/login/alumni');
      return;
    }
    fetchDashboardData();
  }, [currentUser, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch alumni-specific dashboard data
      const response = await axios.get(`${baseURL}api/alumni/dashboard`, {
        withCredentials: true
      });
      
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default data if API fails
      setDashboardData({
        stats: {
          totalConnections: 0,
          mentorshipRequests: 0,
          activeMentees: 0,
          totalMessages: 0
        },
        recentActivity: [],
        pendingRequests: [],
        connections: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${baseURL}api/alumni/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    logout();
    navigate('/login/alumni');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="alumni-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="alumni-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <div className="user-avatar">
              {currentUser?.profilePic ? (
                <img src={currentUser.profilePic} alt={currentUser.name} />
              ) : (
                <div className="avatar-placeholder">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-details">
              <h1>Welcome back, {currentUser?.name}</h1>
              <p>Alumni Dashboard</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          <FaChartBar />
          Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'mentorship' ? 'active' : ''}`}
          onClick={() => handleTabChange('mentorship')}
        >
          <FaUsers />
          Mentorship
        </button>
        <button 
          className={`nav-tab ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => handleTabChange('connections')}
        >
          <FaComments />
          Connections
        </button>
        <button 
          className={`nav-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => handleTabChange('activity')}
        >
          <FaHistory />
          Activity
        </button>
        <button 
          className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleTabChange('profile')}
        >
          <FaEdit />
          Profile
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-content">
                  <h3>{dashboardData.stats.totalConnections}</h3>
                  <p>Total Connections</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaEnvelope />
                </div>
                <div className="stat-content">
                  <h3>{dashboardData.stats.mentorshipRequests}</h3>
                  <p>Mentorship Requests</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaUserGraduate />
                </div>
                <div className="stat-content">
                  <h3>{dashboardData.stats.activeMentees}</h3>
                  <p>Active Mentees</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaComments />
                </div>
                <div className="stat-content">
                  <h3>{dashboardData.stats.totalMessages}</h3>
                  <p>Total Messages</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                <button 
                  onClick={() => navigate('/community')}
                  className="action-card"
                >
                  <FaComments />
                  <h3>Join Community</h3>
                  <p>Connect with other alumni</p>
                </button>

                <button 
                  onClick={() => navigate('/alumnies')}
                  className="action-card"
                >
                  <FaSearch />
                  <h3>Browse Alumni</h3>
                  <p>Find and connect with peers</p>
                </button>

                <button 
                  onClick={() => navigate('/testimonials')}
                  className="action-card"
                >
                  <FaStar />
                  <h3>Write Testimonial</h3>
                  <p>Share your experience</p>
                </button>

                <button 
                  onClick={() => navigate('/profile')}
                  className="action-card"
                >
                  <FaEdit />
                  <h3>Update Profile</h3>
                  <p>Keep your info current</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                {dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        <FaComments />
                      </div>
                      <div className="activity-content">
                        <p>{activity.description}</p>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-activity">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mentorship' && (
          <div className="mentorship-section">
            <h2>Mentorship Management</h2>
            
            {/* Mentorship Status */}
            <div className="mentorship-status">
              <div className="status-card">
                <h3>Mentorship Status</h3>
                <div className="status-info">
                  <span className={`status-badge ${currentUser?.availableForMentorship ? 'available' : 'unavailable'}`}>
                    {currentUser?.availableForMentorship ? 'Available' : 'Unavailable'}
                  </span>
                  <p>Max Students: {currentUser?.maxStudents || 3}</p>
                </div>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="pending-requests">
              <h3>Pending Mentorship Requests</h3>
              <div className="requests-list">
                {dashboardData.pendingRequests.length > 0 ? (
                  dashboardData.pendingRequests.map((request, index) => (
                    <div key={index} className="request-card">
                      <div className="request-info">
                        <h4>{request.studentName}</h4>
                        <p>{request.message}</p>
                        <span className="request-time">{request.time}</span>
                      </div>
                      <div className="request-actions">
                        <button className="accept-btn">Accept</button>
                        <button className="decline-btn">Decline</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-requests">
                    <p>No pending mentorship requests</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="connections-section">
            <h2>Your Connections</h2>
            
            <div className="connections-grid">
              {dashboardData.connections.length > 0 ? (
                dashboardData.connections.map((connection, index) => (
                  <div key={index} className="connection-card">
                    <div className="connection-avatar">
                      {connection.profilePic ? (
                        <img src={connection.profilePic} alt={connection.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {connection.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="connection-info">
                      <h4>{connection.name}</h4>
                      <p>{connection.role}</p>
                      <p>{connection.company}</p>
                    </div>
                    <div className="connection-actions">
                      <button className="message-btn">
                        <FaComments />
                      </button>
                      <button className="call-btn">
                        <FaPhone />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-connections">
                  <p>No connections yet. Start connecting with other alumni!</p>
                  <button onClick={() => navigate('/alumnies')} className="browse-btn">
                    Browse Alumni
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-section">
            <h2>Activity History</h2>
            
            <div className="activity-timeline">
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-icon">
                      <FaComments />
                    </div>
                    <div className="timeline-content">
                      <h4>{activity.title}</h4>
                      <p>{activity.description}</p>
                      <span className="timeline-time">{activity.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-activity">
                  <p>No activity history available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>Profile Information</h2>
            
            <div className="profile-grid">
              <div className="profile-card">
                <h3>Basic Information</h3>
                <div className="profile-info">
                  <p><strong>Name:</strong> {currentUser?.name}</p>
                  <p><strong>Email:</strong> {currentUser?.email}</p>
                  <p><strong>Branch:</strong> {currentUser?.branch}</p>
                  <p><strong>Graduation Year:</strong> {currentUser?.graduationYear}</p>
                </div>
              </div>

              <div className="profile-card">
                <h3>Career Information</h3>
                <div className="profile-info">
                  <p><strong>Company:</strong> {currentUser?.careerPath?.company || 'N/A'}</p>
                  <p><strong>Position:</strong> {currentUser?.careerPath?.currentPosition || 'N/A'}</p>
                  <p><strong>Experience:</strong> {currentUser?.careerPath?.experienceYears || 'N/A'} years</p>
                </div>
              </div>

              <div className="profile-card">
                <h3>Mentorship Settings</h3>
                <div className="profile-info">
                  <p><strong>Available for Mentorship:</strong> {currentUser?.availableForMentorship ? 'Yes' : 'No'}</p>
                  <p><strong>Max Students:</strong> {currentUser?.maxStudents || 3}</p>
                  <p><strong>Mentorship Tags:</strong> {currentUser?.mentorshipTags?.join(', ') || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button onClick={() => navigate('/profile')} className="edit-profile-btn">
                <FaEdit />
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AlumniDashboard; 