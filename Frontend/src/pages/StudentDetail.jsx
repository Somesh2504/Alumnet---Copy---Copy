import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaEnvelope, 
  FaUserGraduate, FaBriefcase, FaCertificate, FaMapMarkerAlt, 
  FaCalendarAlt, FaStar, FaBook, FaUsers, FaHistory, 
  FaChartBar, FaArrowLeft, FaPhone, FaComments, FaBuilding,
  FaGraduationCap, FaCode, FaProjectDiagram, FaAward, FaFileAlt
} from 'react-icons/fa';
import './StudentDetail.css';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`http://localhost:5000/api/student/${id}`);
      setStudent(response.data.student);
    } catch (err) {
      console.error('Error fetching student details:', err);
      setError(err.response?.data?.message || 'Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/alumnies');
  };

  const handleContactClick = (type) => {
    // Handle contact actions
    console.log(`Contact via ${type}`);
  };

  if (loading) {
    return (
      <div className="student-detail-loading">
        <motion.div 
          className="student-loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Loading student profile...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-detail-error">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="student-error-content"
        >
          <FaUserGraduate className="student-error-icon" />
          <h2>Profile Not Found</h2>
          <p>{error}</p>
          <button onClick={handleBackClick} className="back-button">
            <FaArrowLeft /> Back to Students List
          </button>
        </motion.div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUserGraduate /> },
    { id: 'education', label: 'Education', icon: <FaBook /> },
    { id: 'skills', label: 'Skills', icon: <FaStar /> },
    { id: 'projects', label: 'Projects', icon: <FaProjectDiagram /> },
    { id: 'achievements', label: 'Achievements', icon: <FaAward /> },
    { id: 'interests', label: 'Interests', icon: <FaUsers /> },
    { id: 'contact', label: 'Contact', icon: <FaEnvelope /> }
  ];

  return (
    <div className="student-detail">
      {/* Header Section */}
      <motion.header 
        className="student-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="student-header-content">
          <button onClick={handleBackClick} className="student-back-btn">
            <FaArrowLeft /> Back to Students
          </button>
          <div className="student-header-info">
            <h1>Student Profile</h1>
            <p>Discover the potential and achievements of our students</p>
          </div>
        </div>
      </motion.header>

      <div className="student-content">
        {/* Profile Card */}
        <motion.div 
          className="student-profile-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="student-profile-header">
            <div className="student-profile-avatar">
              {student.profilePic ? (
                <img src={student.profilePic} alt={student.name} />
              ) : (
                <div className="student-default-avatar">
                  {student.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="student-profile-info">
              <h2>{student.name}</h2>
              <p className="student-profile-email">{student.email}</p>
              <div className="student-profile-badges">
                <span className="student-badge">Student</span>
                {student.isVerified && (
                  <span className="student-verified-badge">Verified</span>
                )}
                <span className="year-badge">Year {student.year}</span>
              </div>
            </div>
            <div className="student-profile-actions">
              <button 
                className="student-action-btn primary"
                onClick={() => handleContactClick('chat')}
              >
                <FaComments /> Message
              </button>
              <button 
                className="student-action-btn secondary"
                onClick={() => handleContactClick('call')}
              >
                <FaPhone /> Call
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="student-tab-navigation"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`student-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <div className="student-tab-content">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="student-tab-panel"
              >
                <div className="student-overview-grid">
                  <div className="student-overview-card">
                    <h3><FaGraduationCap /> Academic Info</h3>
                    <div className="student-info-item">
                      <span className="student-label">Branch:</span>
                      <span className="student-value">{student.branch || 'N/A'}</span>
                    </div>
                    <div className="student-info-item">
                      <span className="student-label">Year:</span>
                      <span className="student-value">{student.year || 'N/A'}</span>
                    </div>
                    <div className="student-info-item">
                      <span className="student-label">GPA:</span>
                      <span className="student-value">{student.gpa || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="student-overview-card">
                    <h3><FaStar /> Skills</h3>
                    <div className="skills-preview">
                      {student.skills?.slice(0, 5).map((skill, index) => (
                        <span key={index} className="student-skill-tag">{skill}</span>
                      ))}
                      {student.skills?.length > 5 && (
                        <span className="student-skill-tag">+{student.skills.length - 5} more</span>
                      )}
                    </div>
                  </div>

                  <div className="student-overview-card">
                    <h3><FaProjectDiagram /> Projects</h3>
                    <div className="student-info-item">
                      <span className="student-label">Total Projects:</span>
                      <span className="student-value">{student.projects?.length || 0}</span>
                    </div>
                    <div className="student-info-item">
                      <span className="student-label">Resume:</span>
                      <span className="student-value">
                        {student.resumeLink ? (
                          <a href={student.resumeLink} target="_blank" rel="noopener noreferrer">
                            View Resume
                          </a>
                        ) : 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>

                {student.preferredMentorCriteria && (
                  <div className="mentor-preference">
                    <h3>Mentor Preferences</h3>
                    <div className="preference-grid">
                      {student.preferredMentorCriteria.branch && (
                        <div className="preference-item">
                          <span className="student-label">Preferred Branch:</span>
                          <span className="student-value">{student.preferredMentorCriteria.branch}</span>
                        </div>
                      )}
                      {student.preferredMentorCriteria.minExperience && (
                        <div className="preference-item">
                          <span className="student-label">Min Experience:</span>
                          <span className="student-value">{student.preferredMentorCriteria.minExperience} years</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'education' && (
              <motion.div
                key="education"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="student-tab-panel"
              >
                <div className="education-info">
                  <h3>Educational Background</h3>
                  <div className="education-card">
                    <div className="education-item">
                      <h4>Current Academic Status</h4>
                      <p><strong>Branch:</strong> {student.branch || 'N/A'}</p>
                      <p><strong>Year:</strong> {student.year || 'N/A'}</p>
                      <p><strong>GPA:</strong> {student.gpa || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="student-tab-panel"
              >
                <h3>Technical Skills</h3>
                {student.skills && student.skills.length > 0 ? (
                  <div className="student-skills-grid">
                    {student.skills.map((skill, index) => (
                      <span key={index} className="student-skill-tag">{skill}</span>
                    ))}
                  </div>
                ) : (
                  <p>No skills listed yet.</p>
                )}
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="student-tab-panel"
              >
                <h3>Projects</h3>
                {student.projects && student.projects.length > 0 ? (
                  <div className="student-projects-grid">
                    {student.projects.map((project, index) => (
                      <div key={index} className="student-project-card">
                        <h4>{project.title}</h4>
                        <p>{project.description}</p>
                        {project.techStack && project.techStack.length > 0 && (
                          <div className="tech-stack">
                            {project.techStack.map((tech, techIndex) => (
                              <span key={techIndex} className="tech-tag">{tech}</span>
                            ))}
                          </div>
                        )}
                        {project.link && (
                          <a href={project.link} target="_blank" rel="noopener noreferrer" className="student-project-link">
                            <FaGlobe /> View Project
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No projects listed yet.</p>
                )}
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="student-tab-panel"
              >
                <h3>Achievements & Certifications</h3>
                {student.achievements && student.achievements.length > 0 ? (
                  <div className="achievements-grid">
                    {student.achievements.map((achievement, index) => (
                      <div key={index} className="achievement-card">
                        <FaAward className="achievement-icon" />
                        <span>{achievement}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No achievements listed yet.</p>
                )}
              </motion.div>
            )}

            {activeTab === 'interests' && (
              <motion.div
                key="interests"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="student-tab-panel"
              >
                <h3>Interests & Mentorship Areas</h3>
                {student.interests && student.interests.length > 0 ? (
                  <div className="interests-grid">
                    {student.interests.map((interest, index) => (
                      <span key={index} className="interest-tag">{interest}</span>
                    ))}
                  </div>
                ) : (
                  <p>No interests listed yet.</p>
                )}
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="student-tab-panel"
              >
                <h3>Contact Information</h3>
                <div className="contact-info">
                  <div className="contact-item">
                    <FaEnvelope className="contact-icon" />
                    <span>{student.email}</span>
                  </div>
                  
                  {student.socials && (
                    <div className="social-links">
                      {student.socials.linkedin && (
                        <a href={student.socials.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                          <FaLinkedin /> LinkedIn
                        </a>
                      )}
                      {student.socials.github && (
                        <a href={student.socials.github} target="_blank" rel="noopener noreferrer" className="social-link">
                          <FaGithub /> GitHub
                        </a>
                      )}
                      {student.socials.portfolio && (
                        <a href={student.socials.portfolio} target="_blank" rel="noopener noreferrer" className="social-link">
                          <FaGlobe /> Portfolio
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail; 