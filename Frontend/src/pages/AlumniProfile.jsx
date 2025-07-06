import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import PageTransition from '../components/PageTransition';
import './ProfileDashBoard.css';
import {
  FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaEnvelope, FaUserGraduate, FaBriefcase, FaCertificate, FaUserCircle, FaPhone, FaCheckCircle, FaTimesCircle, FaBars, FaChevronLeft, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaBook, FaUsers, FaHistory, FaChartBar, FaEdit, FaGraduationCap, FaAward
} from 'react-icons/fa';

const sectionList = [
  { id: 'overview', label: 'Overview', icon: <FaUserCircle /> },
  { id: 'education', label: 'Education', icon: <FaBook /> },
  { id: 'career', label: 'Career', icon: <FaBriefcase /> },
  { id: 'skills', label: 'Skills', icon: <FaStar /> },
  { id: 'projects', label: 'Projects', icon: <FaChartBar /> },
  { id: 'certifications', label: 'Certifications', icon: <FaCertificate /> },
  { id: 'mentorship', label: 'Mentorship', icon: <FaUsers /> },
  { id: 'activity', label: 'Activity', icon: <FaHistory /> },
  { id: 'socials', label: 'Socials', icon: <FaGlobe /> },
  { id: 'contact', label: 'Contact', icon: <FaEnvelope /> },
];

const AlumniProfile = () => {
  const { currentUser, authLoading } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Debug logging
  console.log('AlumniProfile - currentUser:', currentUser);
  console.log('AlumniProfile - authLoading:', authLoading);

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

  // Check if user is actually an alumni
  if (currentUser.role !== 'alumni') {
    return (
      <div className="profile-dashboard-error">
        <h2>Access Denied</h2>
        <p>This page is only for alumni. Please use the appropriate profile page.</p>
      </div>
    );
  }

  // Alumni-specific fields
  const profilePic = currentUser.profilePic || '';
  const name = currentUser.name;
  const email = currentUser.email;
  const createdAt = currentUser.createdAt;
  const updatedAt = currentUser.updatedAt;
  const isVerified = currentUser.isVerified;

  // Alumni education fields
  const branch = currentUser.branch;
  const graduationYear = currentUser.graduationYear;

  // Alumni career fields
  const careerPath = currentUser.careerPath || {};
  const currentPosition = careerPath.currentPosition;
  const company = careerPath.company;
  const experienceYears = careerPath.experienceYears;

  // Alumni mentorship fields
  const mentorshipBio = currentUser.mentorshipBio;
  const mentorshipTags = currentUser.mentorshipTags || [];
  const availableForMentorship = currentUser.availableForMentorship;
  const maxStudents = currentUser.maxStudents;

  // Alumni shared fields
  const collegeName = currentUser.college?.name || currentUser.collegeName || currentUser.name;
  const skills = currentUser.skills || [];
  const projects = currentUser.projects || [];
  const certifications = currentUser.certifications || [];
  const socials = currentUser.socials || {};
  const chatHistory = currentUser.chatHistory || [];
  const callsHistory = currentUser.callsHistory || [];

  // Debug logging for alumni-specific fields
  console.log('AlumniProfile - Alumni fields:', {
    branch,
    graduationYear,
    careerPath,
    mentorshipBio,
    mentorshipTags,
    availableForMentorship,
    maxStudents,
    skills,
    projects,
    certifications,
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

  // Alumni-specific stats
  const stats = [
    { label: 'Projects', value: projects.length },
    { label: 'Skills', value: skills.length },
    { label: 'Mentorships', value: mentorshipTags.length },
    { label: 'Experience', value: experienceYears ? `${experienceYears} years` : 'N/A' },
  ].filter(stat => stat.value !== 'N/A' || stat.label === 'Projects' || stat.label === 'Skills' || stat.label === 'Mentorships');

  return (
    <PageTransition>
      <div className="profile-dashboard-grid">
        {/* Sidebar (desktop) or drawer (mobile) */}
        <aside className={`profile-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="sidebar-header">
            <span className="sidebar-title">Alumni Profile</span>
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
                  <span className="profile-role-tag">Alumni</span>
                  {isVerified !== undefined && (
                    isVerified ? <span className="verified-badge"><FaCheckCircle /> Verified</span> : <span className="not-verified-badge"><FaTimesCircle /> Not Verified</span>
                  )}
                  {availableForMentorship && (
                    <span className="verified-badge"><FaUsers /> Available for Mentorship</span>
                  )}
                </div>
                <div className="overview-meta">
                  <span><FaEnvelope /> {email}</span>
                  {collegeName && <span><FaUserGraduate /> {collegeName}</span>}
                  {company && <span><FaBuilding /> {company}</span>}
                  {currentPosition && <span><FaBriefcase /> {currentPosition}</span>}
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
              {graduationYear && <li><strong>Graduation Year:</strong> {graduationYear}</li>}
            </ul>
          </section>

          {/* Career */}
          <section className="dashboard-section" id="section-career">
            <h2><FaBriefcase /> Career</h2>
            <ul>
              {currentPosition && <li><strong>Current Position:</strong> {currentPosition}</li>}
              {company && <li><strong>Company:</strong> {company}</li>}
              {experienceYears && <li><strong>Experience:</strong> {experienceYears} years</li>}
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

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <section className="dashboard-section" id="section-certifications">
              <h2><FaCertificate /> Certifications</h2>
              <ul>
                {certifications.map((cert, idx) => (
                  <li key={idx}><FaCertificate /> {cert}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Mentorship */}
          {(mentorshipBio || mentorshipTags.length > 0 || availableForMentorship !== undefined) && (
            <section className="dashboard-section" id="section-mentorship">
              <h2><FaUsers /> Mentorship</h2>
              {mentorshipBio && <p>{mentorshipBio}</p>}
              {mentorshipTags && mentorshipTags.length > 0 && (
                <div className="profile-skills">
                  {mentorshipTags.map((tag, idx) => (
                    <span key={idx} className="skill-tag mentorship-tag">{tag}</span>
                  ))}
                </div>
              )}
              {availableForMentorship !== undefined && (
                <p><strong>Available for Mentorship:</strong> {availableForMentorship ? 'Yes' : 'No'}</p>
              )}
              {maxStudents !== undefined && (
                <p><strong>Max Students:</strong> {maxStudents}</p>
              )}
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
          {socials && (socials.linkedin || socials.github || socials.twitter || socials.personalWebsite) && (
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
                {socials.personalWebsite && (
                  <a href={socials.personalWebsite} target="_blank" rel="noopener noreferrer" title="Website"><FaGlobe /></a>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default AlumniProfile; 