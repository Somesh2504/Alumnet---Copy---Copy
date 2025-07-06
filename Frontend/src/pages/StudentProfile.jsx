import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import PageTransition from '../components/PageTransition';
import './ProfileDashBoard.css';
import {
  FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaEnvelope, FaUserGraduate, FaBriefcase, FaCertificate, FaUserCircle, FaPhone, FaCheckCircle, FaTimesCircle, FaBars, FaChevronLeft, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaBook, FaUsers, FaHistory, FaChartBar, FaEdit, FaFileAlt, FaGraduationCap
} from 'react-icons/fa';

const sectionList = [
  { id: 'overview', label: 'Overview', icon: <FaUserCircle /> },
  { id: 'education', label: 'Education', icon: <FaBook /> },
  { id: 'career', label: 'Career Goals', icon: <FaBriefcase /> },
  { id: 'skills', label: 'Skills', icon: <FaStar /> },
  { id: 'projects', label: 'Projects', icon: <FaChartBar /> },
  { id: 'certifications', label: 'Certifications', icon: <FaCertificate /> },
  { id: 'mentorship', label: 'Mentorship', icon: <FaUsers /> },
  { id: 'activity', label: 'Activity', icon: <FaHistory /> },
  { id: 'socials', label: 'Socials', icon: <FaGlobe /> },
  { id: 'contact', label: 'Contact', icon: <FaEnvelope /> },
];

const StudentProfile = () => {
  const { currentUser, authLoading } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Debug logging
  console.log('StudentProfile - currentUser:', currentUser);
  console.log('StudentProfile - authLoading:', authLoading);

  if (authLoading) {
    return (
      <div className="profile-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="profile-dashboard-error">
        <h2>Not Logged In</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  // Check if user is actually a student
  if (currentUser.role !== 'student') {
    return (
      <div className="profile-dashboard-error">
        <h2>Access Denied</h2>
        <p>This page is only for students. Please use the appropriate profile page.</p>
      </div>
    );
  }

  // Student-specific fields
  const profilePic = currentUser.profilePic || '';
  const name = currentUser.name;
  const email = currentUser.email;
  const createdAt = currentUser.createdAt;
  const updatedAt = currentUser.updatedAt;
  const isVerified = currentUser.isVerified;

  // Student education fields
  const branch = currentUser.branch;
  const year = currentUser.year;
  const gpa = currentUser.gpa;
  const resumeLink = currentUser.resumeLink;

  // Student career fields
  const preferredMentorCriteria = currentUser.preferredMentorCriteria || {};
  const interests = currentUser.interests || [];
  const achievements = currentUser.achievements || [];

  // Student shared fields
  const collegeName = currentUser.college?.name || currentUser.collegeName || currentUser.name;
  const skills = currentUser.skills || [];
  const projects = currentUser.projects || [];
  const socials = currentUser.socials || {};
  const chatHistory = currentUser.chatHistory || [];
  const callsHistory = currentUser.callsHistory || [];

  // Debug logging for student-specific fields
  console.log('StudentProfile - Student fields:', {
    branch,
    year,
    gpa,
    resumeLink,
    preferredMentorCriteria,
    interests,
    achievements,
    skills,
    projects,
    socials
  });

  // Responsive sidebar toggle
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);
  const handleSectionClick = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Student-specific stats
  const stats = [
    { label: 'GPA', value: gpa || 'N/A' },
    { label: 'Year', value: year || 'N/A' },
    { label: 'Skills', value: skills.length },
    { label: 'Projects', value: projects.length },
    { label: 'Interests', value: interests.length },
  ].filter(stat => stat.value !== 'N/A' || stat.label === 'Skills' || stat.label === 'Projects' || stat.label === 'Interests');

  return (
    <PageTransition>
      <div className="profile-dashboard-grid">
        {/* Sidebar (desktop) or drawer (mobile) */}
        <aside className={`profile-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="sidebar-header">
            <span className="sidebar-title">Student Profile</span>
            <button className="sidebar-close" onClick={handleSidebarToggle}><FaChevronLeft /></button>
          </div>
          <nav className="sidebar-nav">
            {sectionList.map((section) => (
              <button
                key={section.id}
                className={`sidebar-link${activeSection === section.id ? ' active' : ''}`}
                onClick={() => handleSectionClick(section.id)}
              >
                {section.icon} <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <button className="sidebar-toggle" onClick={handleSidebarToggle}><FaBars /></button>

        {/* Main dashboard content */}
        <main className="profile-main">
          {/* Overview */}
          <section className="dashboard-section overview-section" id="section-overview">
            <div className="overview-card">
              <div className="overview-avatar">
                {profilePic ? <img src={profilePic} alt={name} /> : <FaUserCircle className="default-avatar-icon" />}
              </div>
              <div className="overview-info">
                <h1>{name}</h1>
                <div className="overview-role-row">
                  <span className="profile-role-tag">Student</span>
                  {isVerified !== undefined && (
                    isVerified ? <span className="verified-badge"><FaCheckCircle /> Verified</span> : <span className="not-verified-badge"><FaTimesCircle /> Not Verified</span>
                  )}
                </div>
                <div className="overview-meta">
                  <span><FaEnvelope /> {email}</span>
                  {collegeName && <span><FaUserGraduate /> {collegeName}</span>}
                </div>
                <div className="overview-stats">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="stat-widget">
                      <span className="stat-value">{stat.value}</span>
                      <span className="stat-label">{stat.label}</span>
                    </div>
                  ))}
                </div>
                <div className="overview-dates">
                  {createdAt && <span><FaCalendarAlt /> Joined: {new Date(createdAt).toLocaleDateString()}</span>}
                  {updatedAt && <span><FaCalendarAlt /> Updated: {new Date(updatedAt).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          </section>

          {/* Education */}
          <section className="dashboard-section" id="section-education">
            <h2><FaBook /> Education</h2>
            <ul>
              {branch && <li><strong>Branch:</strong> {branch}</li>}
              {year && <li><strong>Year:</strong> {year}</li>}
              {gpa && <li><strong>GPA:</strong> {gpa}</li>}
              {resumeLink && <li><a href={resumeLink} target="_blank" rel="noopener noreferrer">View Resume</a></li>}
            </ul>
          </section>

          {/* Career Goals */}
          <section className="dashboard-section" id="section-career">
            <h2><FaBriefcase /> Career Goals</h2>
            <ul>
              {preferredMentorCriteria.branch && <li><strong>Preferred Mentor Branch:</strong> {preferredMentorCriteria.branch}</li>}
              {preferredMentorCriteria.minExperience && <li><strong>Preferred Mentor Min Experience:</strong> {preferredMentorCriteria.minExperience} years</li>}
            </ul>
          </section>

          {/* Skills */}
          {skills && skills.length > 0 && (
            <section className="dashboard-section" id="section-skills">
              <h2><FaStar /> Skills</h2>
              <div className="profile-skills">
                {skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag">{skill}</span>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section className="dashboard-section" id="section-projects">
              <h2><FaChartBar /> Projects</h2>
              <ul>
                {projects.map((proj, idx) => (
                  <li key={idx}>
                    <strong>{proj.title}</strong>: {proj.description}
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="project-link"> [View]</a>
                    )}
                    {proj.techStack && proj.techStack.length > 0 && (
                      <span className="project-tech"> | Tech: {proj.techStack.join(', ')}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Certifications & Achievements */}
          {achievements && achievements.length > 0 && (
            <section className="dashboard-section" id="section-certifications">
              <h2><FaCertificate /> Certifications & Achievements</h2>
              <ul>
                {achievements.map((achievement, idx) => (
                  <li key={idx}><FaCertificate /> {achievement}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Interests */}
          {interests && interests.length > 0 && (
            <section className="dashboard-section" id="section-mentorship">
              <h2><FaUsers /> Interests</h2>
              <div className="profile-skills">
                {interests.map((interest, idx) => (
                  <span key={idx} className="skill-tag mentorship-tag">{interest}</span>
                ))}
              </div>
            </section>
          )}

          {/* Activity/Stats */}
          {(chatHistory.length > 0 || callsHistory.length > 0) && (
            <section className="dashboard-section" id="section-activity">
              <h2><FaHistory /> Activity</h2>
              {chatHistory.length > 0 && (
                <div className="activity-widget">
                  <h4>Recent Chats</h4>
                  <ul>
                    {chatHistory.slice(0, 5).map((chat, idx) => (
                      <li key={idx}>{chat.userName} <span className="activity-date">{chat.lastMessageAt && new Date(chat.lastMessageAt).toLocaleString()}</span></li>
                    ))}
                  </ul>
                </div>
              )}
              {callsHistory.length > 0 && (
                <div className="activity-widget">
                  <h4>Recent Calls</h4>
                  <ul>
                    {callsHistory.slice(0, 5).map((call, idx) => (
                      <li key={idx}>With: {call.withUserId} <span className="activity-date">{call.timestamp && new Date(call.timestamp).toLocaleString()}</span> {call.duration && `(${call.duration} min)`}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Socials */}
          {socials && (socials.linkedin || socials.github || socials.twitter || socials.portfolio) && (
            <section className="dashboard-section" id="section-socials">
              <h2><FaGlobe /> Social Links</h2>
              <div className="profile-socials">
                {socials.linkedin && (
                  <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn"><FaLinkedin /></a>
                )}
                {socials.github && (
                  <a href={socials.github} target="_blank" rel="noopener noreferrer" title="GitHub"><FaGithub /></a>
                )}
                {socials.twitter && (
                  <a href={socials.twitter} target="_blank" rel="noopener noreferrer" title="Twitter"><FaTwitter /></a>
                )}
                {socials.portfolio && (
                  <a href={socials.portfolio} target="_blank" rel="noopener noreferrer" title="Portfolio"><FaGlobe /></a>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default StudentProfile; 