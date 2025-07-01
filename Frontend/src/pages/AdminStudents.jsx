import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminStudents.css';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
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

    fetchStudents();
    fetchColleges();
  }, [navigate]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/students', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/colleges', {
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

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/student/${studentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchStudents();
      } else {
        alert('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error deleting student');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.college?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCollege = selectedCollege === 'all' || student.college?._id === selectedCollege;
    
    return matchesSearch && matchesCollege;
  });

  if (isLoading) {
    return (
      <div className="admin-students-loading">
        <div className="admin-students-loading-spinner"></div>
        <p>Loading Students...</p>
      </div>
    );
  }

  return (
    <div className="admin-students">
      {/* Header */}
      <header className="admin-students-header">
        <div className="admin-students-header-content">
          <div className="admin-students-header-left">
            <button onClick={() => navigate('/admin/dashboard')} className="admin-students-back-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              Back to Dashboard
            </button>
            <h1>Student Management</h1>
          </div>
          <div className="admin-students-header-stats">
            <div className="admin-students-stat-item">
              <span className="admin-students-stat-number">{students.length}</span>
              <span className="admin-students-stat-label">Total Students</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="admin-students-controls">
        <div className="admin-students-search-container">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search students by name, email, or college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-students-search-input"
          />
        </div>

        <div className="admin-students-filters">
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="admin-students-college-filter"
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

      {/* Students List */}
      <div className="admin-students-content">
        <div className="admin-students-grid">
          {filteredStudents.length === 0 ? (
            <div className="admin-students-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <h3>No students found</h3>
              <p>No students match your search criteria or there are no students registered yet.</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student._id} className="admin-students-card">
                <div className="admin-students-card-header">
                  <div className="admin-students-avatar">
                    {student.profilePic ? (
                      <img src={student.profilePic} alt={student.name} />
                    ) : (
                      <div className="default-avatar">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="student-status">
                    <span className="admin-students-status-badge active">Active</span>
                  </div>
                </div>
                
                <div className="admin-students-info">
                  <h3>{student.name}</h3>
                  <p className="admin-students-email">{student.email}</p>
                  <p className="admin-students-college">
                    <strong>College:</strong> {student.college?.name || 'N/A'}
                  </p>
                  <p className="admin-students-branch">
                    <strong>Branch:</strong> {student.branch || 'N/A'}
                  </p>
                  <p className="admin-students-year">
                    <strong>Year:</strong> {student.year || 'N/A'}
                  </p>
                  <p className="admin-students-date">
                    Joined: {new Date(student.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="admin-students-actions">
                  <button
                    onClick={() => navigate(`/admin/student/${student._id}`)}
                    className="admin-students-action-btn view"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    View Profile
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student._id)}
                    className="admin-students-action-btn delete"
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

export default AdminStudents; 