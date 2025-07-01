import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaEnvelope, 
  FaUserGraduate, FaBriefcase, FaCertificate, FaMapMarkerAlt, 
  FaCalendarAlt, FaStar, FaBook, FaUsers, FaHistory, 
  FaChartBar, FaArrowLeft, FaPhone, FaComments, FaBuilding,
  FaGraduationCap, FaCode, FaProjectDiagram, FaAward
} from 'react-icons/fa';
import './AlumniDetail.css';

const AlumniDetail = () => {
  const { id } = useParams();
  
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAlumniDetails();
  }, [id]);

  const fetchAlumniDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/alumni/${id}`);
      setAlumni(response.data.alumni);
    } catch (err) {
      console.error('Error fetching alumni details:', err);
      setError(err.response?.data?.message || 'Failed to load alumni details');
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
      <div className="alumni-detail-loading">
        <motion.div 
          className="alumni-loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Loading alumni profile...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alumni-detail-error">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="alumni-error-content"
        >
          <FaUserGraduate className="alumni-error-icon" />
          <h2>Profile Not Found</h2>
          <p>{error}</p>
          <button onClick={handleBackClick} className="back-button">
            <FaArrowLeft /> Back to Alumni List
          </button>
        </motion.div>
      </div>
    );
  }

  if (!alumni) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUserGraduate /> },
    { id: 'career', label: 'Career', icon: <FaBriefcase /> },
    { id: 'skills', label: 'Skills', icon: <FaStar /> },
    { id: 'projects', label: 'Projects', icon: <FaProjectDiagram /> },
    { id: 'certifications', label: 'Certifications', icon: <FaAward /> },
    { id: 'mentorship', label: 'Mentorship', icon: <FaUsers /> },
    { id: 'contact', label: 'Contact', icon: <FaEnvelope /> }
  ];

  return (
    <div className="alumni-detail">
      {/* Header Section */}
      <motion.header 
        className="alumni-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="alumni-header-content">
          <button onClick={handleBackClick} className="alumni-back-btn">
            <FaArrowLeft /> Back to Alumni
          </button>
          <div className="alumni-header-info">
            <h1>Alumni Profile</h1>
            <p>Discover the journey and achievements of our alumni</p>
          </div>
        </div>
      </motion.header>

      <div className="alumni-content">
        {/*  Card */}
        <motion.div 
          className="alumni-profile-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="alumni-profile-header">
            <div className="alumni-profile-avatar">
              {alumni.profilePic ? (
                <img src={alumni.profilePic} alt={alumni.name} />
              ) : (
                <div className="alumni-default-avatar">
                  {alumni.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="alumni-profile-info">
              <h2>{alumni.name}</h2>
              <p className="alumni-profile-email">{alumni.email}</p>
              <div className="alumni-profile-badges">
                <span className="alumni-badge">Alumni</span>
                {alumni.isVerified && (
                  <span className="alumni-verified-badge">Verified</span>
                )}
                {alumni.availableForMentorship && (
                  <span className="alumni-mentor-badge">Available for Mentorship</span>
                )}
              </div>
            </div>
            <div className="alumni-profile-actions">
              <button 
                className="alumni-action-btn primary"
                onClick={() => handleContactClick('chat')}
              >
                <FaComments /> Message
              </button>
              <button 
                className="alumni-action-btn secondary"
                onClick={() => handleContactClick('call')}
              >
                <FaPhone /> Call
              </button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          className="alumni-tab-navigation"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`alumni-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          className="alumni-tab-content"
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="alumni-tab-panel"
              >
                <div className="alumni-overview-grid">
                  <div className="alumni-overview-card">
                    <h3><FaGraduationCap /> Education</h3>
                    <div className="alumni-info-item">
                      <span className="alumni-label">College:</span>
                      <span className="alumni-value">{alumni.college?.name || 'N/A'}</span>
                    </div>
                    <div className="alumni-info-item">
                      <span className="alumni-label">Branch:</span>
                      <span className="alumni-value">{alumni.branch}</span>
                    </div>
                    <div className="alumni-info-item">
                      <span className="alumni-label">Graduation Year:</span>
                      <span className="alumni-value">{alumni.graduationYear}</span>
                    </div>
                  </div>

                  <div className="overview-card">
                    <h3><FaBriefcase /> Current Position</h3>
                    <div className="info-item">
                      <span className="label">Company:</span>
                      <span className="value">{alumni.careerPath?.company || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Position:</span>
                      <span className="value">{alumni.careerPath?.currentPosition || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Experience:</span>
                      <span className="value">{alumni.careerPath?.experienceYears || 'N/A'} years</span>
                    </div>
                  </div>

                  <div className="overview-card">
                    <h3><FaUsers /> Mentorship</h3>
                    <div className="info-item">
                      <span className="label">Available:</span>
                      <span className="value">{alumni.availableForMentorship ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Max Students:</span>
                      <span className="value">{alumni.maxStudents || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="alumni-label">Topics:</span>
                      <span className="alumni-value">
                        {alumni.mentorshipTags?.length > 0 
                          ? alumni.mentorshipTags.join(', ') 
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {alumni.mentorshipBio && (
                  <div className="alumni-bio-section">
                    <h3>Mentorship Bio</h3>
                    <p>{alumni.mentorshipBio}</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'career' && (
              <motion.div
                key="career"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="alumni-tab-panel"
              >
                <div className="career-timeline">
                  <h3>Career Journey</h3>
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h4>Current Position</h4>
                      <p className="company">{alumni.careerPath?.company || 'N/A'}</p>
                      <p className="position">{alumni.careerPath?.currentPosition || 'N/A'}</p>
                      <p className="experience">{alumni.careerPath?.experienceYears || 'N/A'} years of experience</p>
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
                className="alumni-tab-panel"
              >
                <h3>Skills & Expertise</h3>
                <div className="alumni-skills-grid">
                  {alumni.skills?.length > 0 ? (
                    alumni.skills.map((skill, index) => (
                      <motion.div
                        key={index}
                        className="alumni-skill-tag"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <FaCode /> {skill}
                      </motion.div>
                    ))
                  ) : (
                    <p className="alumni-no-data">No skills listed yet.</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="alumni-tab-panel"
              >
                <h3>Projects</h3>
                <div className="alumni-projects-grid">
                  {alumni.projects?.length > 0 ? (
                    alumni.projects.map((project, index) => (
                      <motion.div
                        key={index}
                        className="alumni-project-card"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <h4>{project.title}</h4>
                        <p>{project.description}</p>
                        {project.link && (
                          <a href={project.link} target="_blank" rel="noopener noreferrer" className="alumni-project-link">
                            View Project <FaGlobe />
                          </a>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <p className="alumni-no-data">No projects listed yet.</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'certifications' && (
              <motion.div
                key="certifications"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="alumni-tab-panel"
              >
                <h3>Certifications & Achievements</h3>
                <div className="alumni-certifications-grid">
                  {alumni.certifications?.length > 0 ? (
                    alumni.certifications.map((cert, index) => (
                      <motion.div
                        key={index}
                        className="alumni-certification-card"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <FaAward className="alumni-cert-icon" />
                        <span>{cert}</span>
                      </motion.div>
                    ))
                  ) : (
                    <p className="alumni-no-data">No certifications listed yet.</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'mentorship' && (
              <motion.div
                key="mentorship"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="alumni-tab-panel"
              >
                <h3>Mentorship Information</h3>
                <div className="alumni-mentorship-info">
                  <div className="alumni-mentorship-status">
                    <h4>Availability</h4>
                    <p className={`alumni-status ${alumni.availableForMentorship ? 'available' : 'unavailable'}`}>
                      {alumni.availableForMentorship ? 'Available for Mentorship' : 'Currently Unavailable'}
                    </p>
                  </div>
                  
                  {alumni.availableForMentorship && (
                    <>
                      <div className="alumni-mentorship-capacity">
                        <h4>Capacity</h4>
                        <p>Can mentor up to {alumni.maxStudents} students</p>
                      </div>
                      
                      {alumni.mentorshipTags?.length > 0 && (
                        <div className="alumni-mentorship-topics">
                          <h4>Mentorship Topics</h4>
                          <div className="alumni-topics-grid">
                            {alumni.mentorshipTags.map((tag, index) => (
                              <span key={index} className="alumni-topic-tag">{tag}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="alumni-tab-panel"
              >
                <h3>Contact Information</h3>
                <div className="alumni-contact-grid">
                  <div className="alumni-contact-item">
                    <FaEnvelope />
                    <span>{alumni.email}</span>
                  </div>
                  
                  {alumni.socials?.linkedin && (
                    <a href={alumni.socials.linkedin} target="_blank" rel="noopener noreferrer" className="alumni-contact-item alumni-social-link">
                      <FaLinkedin />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                  
                  {alumni.socials?.github && (
                    <a href={alumni.socials.github} target="_blank" rel="noopener noreferrer" className="alumni-contact-item alumni-social-link">
                      <FaGithub />
                      <span>GitHub Profile</span>
                    </a>
                  )}
                  
                  {alumni.socials?.twitter && (
                    <a href={alumni.socials.twitter} target="_blank" rel="noopener noreferrer" className="alumni-contact-item alumni-social-link">
                      <FaTwitter />
                      <span>Twitter Profile</span>
                    </a>
                  )}
                  
                  {alumni.socials?.personalWebsite && (
                    <a href={alumni.socials.personalWebsite} target="_blank" rel="noopener noreferrer" className="alumni-contact-item alumni-social-link">
                      <FaGlobe />
                      <span>Personal Website</span>
                    </a>
                  )}
                </div>
                
                <div className="alumni-contact-actions">
                  <button className="alumni-contact-btn primary" onClick={() => handleContactClick('chat')}>
                    <FaComments /> Send Message
                  </button>
                  <button className="alumni-contact-btn secondary" onClick={() => handleContactClick('call')}>
                    <FaPhone /> Schedule Call
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AlumniDetail; 