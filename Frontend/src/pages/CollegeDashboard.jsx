import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import './CollegeDashboard.css';

const CollegeDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, setCurrentUser, logout, authLoading } = useAppContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'students', 'alumni', 'add'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    // Don't redirect while authentication is being checked
    if (authLoading) return;
    
    console.log("current user ",currentUser)
    if (!currentUser || currentUser.role !== 'college') {
      console.log('Redirecting to login - currentUser:', currentUser);
      navigate('/login/college');
      return;
    }
    fetchDashboardData();
  }, [currentUser, navigate, authLoading]);

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/college/dashboard`, {
        withCredentials: true
      });
      setDashboardData(data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.log(err); 
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/college/logout`, {}, {
        withCredentials: true
      });
      logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="college-dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="college-dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="college-dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="college-dashboard">
      {/* Header */}
      <motion.header 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="college-info">
            <h1>{currentUser?.name || 'College Dashboard'}</h1>
            <p>Welcome back to your institution management portal</p>
          </div>
          <div className="header-actions">
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </motion.header>

      {/* Navigation Tabs */}
      <motion.nav 
        className="dashboard-nav"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => handleTabChange('students')}
        >
          Students
        </button>
        <button 
          className={`nav-tab ${activeTab === 'alumni' ? 'active' : ''}`}
          onClick={() => handleTabChange('alumni')}
        >
          Alumni
        </button>
        <button 
          className={`nav-tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => handleTabChange('add')}
        >
          Add Records
        </button>
      </motion.nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <motion.div 
            className="overview-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Statistics Cards */}
            <div className="stats-grid">
              <motion.div 
                className="stat-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{dashboardData?.stats?.totalStudents || 0}</h3>
                  <p>Total Students</p>
                </div>
              </motion.div>

              <motion.div 
                className="stat-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="stat-icon">🎓</div>
                <div className="stat-content">
                  <h3>{dashboardData?.stats?.totalAlumni || 0}</h3>
                  <p>Total Alumni</p>
                </div>
              </motion.div>

              <motion.div 
                className="stat-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>{(dashboardData?.stats?.totalStudents || 0) + (dashboardData?.stats?.totalAlumni || 0)}</h3>
                  <p>Total Records</p>
                </div>
              </motion.div>
            </div>

            {/* Recent Records */}
            <div className="recent-records">
              <h2>Recent Records</h2>
              
              <div className="records-tabs">
                <button className="records-tab active">Recent Students</button>
                <button className="records-tab">Recent Alumni</button>
              </div>

              <div className="records-list">
                {dashboardData?.recentRecords?.students?.map((student, index) => (
                  <motion.div 
                    key={student._id}
                    className="record-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="record-avatar">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="record-info">
                      <h4>{student.name}</h4>
                      <p>{student.email}</p>
                      <span className="record-badge">{student.branch}</span>
                    </div>
                    <div className="record-date">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div 
            className="students-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <StudentsManagement />
          </motion.div>
        )}

        {activeTab === 'alumni' && (
          <motion.div 
            className="alumni-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AlumniManagement />
          </motion.div>
        )}

        {activeTab === 'add' && (
          <motion.div 
            className="add-records-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AddRecords />
          </motion.div>
        )}
      </main>
    </div>
  );
};

// Students Management Component
const StudentsManagement = () => {
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    branch: '',
    year: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setError('');
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/college/student-records`, {
        withCredentials: true
      });
      
      console.log("data***",data.records)
      // Ensure we have a valid array
      if (data && data.records && Array.isArray(data.records)) {
        setStudents(data.records);
      } else {
        setStudents([]);
        console.warn('Invalid students data received:', data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students. Please try again.');
      setStudents([]); // Ensure students is always an array
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/college/student-record/${recordId}`, {
          withCredentials: true
        });
        fetchStudents();
      } catch (err) {
        console.error('Error deleting student:', err);
        setError('Failed to delete student. Please try again.');
      }
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/college/student-record`, formData, {
        withCredentials: true
      });

      setMessage('Student added successfully!');
      setFormData({ name: '', email: '', branch: '', year: '' });
      setShowAddForm(false);
      fetchStudents();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="management-section">
        <div className="section-header">
          <h2>Student Records Management</h2>
          <p>Manage your institution's student records</p>
        </div>
        <div className="loading">Loading students...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="management-section">
        <div className="section-header">
          <h2>Student Records Management</h2>
          <p>Manage your institution's student records</p>
          <button 
            className="add-new-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add New Student'}
          </button>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchStudents} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Student Records Management</h2>
        <p>Manage your institution's student records</p>
        <button 
          className="add-new-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add New Student'}
        </button>
      </div>

      {showAddForm && (
        <motion.div 
          className="add-form-container"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <form onSubmit={handleAddStudent} className="add-record-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Branch *</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({...formData, branch: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Year *</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  required
                />
              </div>
            </div>

            {message && (
              <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Student'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="records-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Branch</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!students || students.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-records">
                  No student records found. Add your first student above.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.branch}</td>
                  <td>{student.year}</td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteStudent(student._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Alumni Management Component
const AlumniManagement = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    branch: '',
    passoutyear: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setError('');
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/college/alumni-records`, {
        withCredentials: true
      });
      
      console.log("alumni data***",data.records)
      // Ensure we have a valid array
      if (data && data.records && Array.isArray(data.records)) {
        setAlumni(data.records);
      } else {
        setAlumni([]);
        console.warn('Invalid alumni data received:', data);
      }
    } catch (err) {
      console.error('Error fetching alumni:', err);
      setError('Failed to fetch alumni. Please try again.');
      setAlumni([]); // Ensure alumni is always an array
    } finally {
      setLoading(false);
    }
  };

  const deleteAlumni = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this alumni record?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/college/alumni-record/${recordId}`, {
          withCredentials: true
        });
        fetchAlumni();
      } catch (err) {
        console.error('Error deleting alumni:', err);
        setError('Failed to delete alumni. Please try again.');
      }
    }
  };

  const handleAddAlumni = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/college/alumni-record`, formData, {
        withCredentials: true
      });

      setMessage('Alumni added successfully!');
      setFormData({ name: '', email: '', branch: '', passoutyear: '' });
      setShowAddForm(false);
      fetchAlumni();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add alumni');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="management-section">
        <div className="section-header">
          <h2>Alumni Records Management</h2>
          <p>Manage your institution's alumni records</p>
        </div>
        <div className="loading">Loading alumni...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="management-section">
        <div className="section-header">
          <h2>Alumni Records Management</h2>
          <p>Manage your institution's alumni records</p>
          <button 
            className="add-new-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add New Alumni'}
          </button>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchAlumni} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Alumni Records Management</h2>
        <p>Manage your institution's alumni records</p>
        <button 
          className="add-new-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add New Alumni'}
        </button>
      </div>

      {showAddForm && (
        <motion.div 
          className="add-form-container"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <form onSubmit={handleAddAlumni} className="add-record-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Branch *</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({...formData, branch: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Passout Year *</label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 10}
                  value={formData.passoutyear}
                  onChange={(e) => setFormData({...formData, passoutyear: e.target.value})}
                  required
                  placeholder="e.g., 2023"
                />
              </div>
            </div>

            {message && (
              <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Alumni'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="records-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Branch</th>
              <th>Passout Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!alumni || alumni.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-records">
                  No alumni records found. Add your first alumni above.
                </td>
              </tr>
            ) : (
              alumni.map((alum) => (
                <tr key={alum._id}>
                  <td>{alum.name}</td>
                  <td>{alum.email}</td>
                  <td>{alum.branch}</td>
                  <td>{alum.passoutyear}</td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteAlumni(alum._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Add Records Component
const AddRecords = () => {
  const [recordType, setRecordType] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    branch: '',
    year: '',
    passoutyear: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = recordType === 'student' ? `${import.meta.env.VITE_BACKEND_URL}/api/college/student-record` : `${import.meta.env.VITE_BACKEND_URL}/api/college/alumni-record`;
      const payload = {
        name: formData.name,
        email: formData.email,
        branch: formData.branch,
        ...(recordType === 'student' ? { year: formData.year } : { passoutyear: formData.passoutyear })
      };

      const { data } = await axios.post(endpoint, payload, {
        withCredentials: true
      });

      setMessage('Record added successfully!');
      setFormData({
        name: '',
        email: '',
        branch: '',
        year: '',
        passoutyear: ''
      });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-records-section">
      <div className="section-header">
        <h2>Add New Records</h2>
        <p>Add new student or alumni records to your institution</p>
      </div>

      <div className="record-type-selector">
        <button 
          className={`type-btn ${recordType === 'student' ? 'active' : ''}`}
          onClick={() => setRecordType('student')}
        >
          Add Student
        </button>
        <button 
          className={`type-btn ${recordType === 'alumni' ? 'active' : ''}`}
          onClick={() => setRecordType('alumni')}
        >
          Add Alumni
        </button>
      </div>

      <form onSubmit={handleSubmit} className="add-record-form">
        <div className="form-row">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Branch *</label>
            <input
              type="text"
              value={formData.branch}
              onChange={(e) => setFormData({...formData, branch: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>{recordType === 'student' ? 'Year *' : 'Passout Year *'}</label>
            <input
              type="text"
              value={recordType === 'student' ? formData.year : formData.passoutyear}
              onChange={(e) => setFormData({
                ...formData, 
                [recordType === 'student' ? 'year' : 'passoutyear']: e.target.value
              })}
              required
            />
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Adding...' : `Add ${recordType === 'student' ? 'Student' : 'Alumni'}`}
        </button>
      </form>
    </div>
  );
};

export default CollegeDashboard; 