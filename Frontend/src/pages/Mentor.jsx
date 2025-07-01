import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaPhone, FaComments, FaStar, FaMapMarkerAlt, FaBriefcase, FaUserGraduate } from 'react-icons/fa';
import './Mentor.css';

const Mentor = () => {
  const [alumni, setAlumni] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkills, setFilterSkills] = useState([]);
  const { user, setUser } = useAppContext();
  const navigate = useNavigate();

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/alumni`, {
        withCredentials: true,
      });
      setAlumni(data.alumni);
      setUser(data.role);
    } catch (err) {
      console.error("Error fetching alumni", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student`, {
        withCredentials: true,
      });
      setUser(data.role);
      setStudents(data.students);
    } catch (err) {
      console.error("Error fetching students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user === 'student') {
      fetchAlumni();
    } else if (user === 'alumni') {
      fetchStudents();
    }
  }, [user]);

  // Filter data based on search and skills
  const filteredData = (user === 'student' ? alumni : students).filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.careerPath?.currentPosition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.branch?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkills = filterSkills.length === 0 || 
                         filterSkills.some(skill => 
                           item.skills?.some(itemSkill => 
                             itemSkill.toLowerCase().includes(skill.toLowerCase())
                           )
                         );
    
    return matchesSearch && matchesSkills;
  });

  // Get all unique skills for filter
  const allSkills = [...new Set(
    (user === 'student' ? alumni : students)
      .flatMap(item => item.skills || [])
  )];

  const handleChat = (id) => {
    navigate(`/chat/${id}`);
  };

  const handleCall = (id) => {
    navigate(`/call/${id}`);
  };

  const handleViewProfile = (id) => {
    if (user === 'student') {
      navigate(`/alumni/${id}`);
    } else if (user === 'alumni') {
      navigate(`/student/${id}`);
    }
  };

  const toggleSkillFilter = (skill) => {
    setFilterSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      y: 50, 
      opacity: 0,
      scale: 0.9
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="mentor-loading">
        <div className="mentor-loading-container">
          <div className="mentor-loading-spinner"></div>
          <h2>Finding Amazing {user === 'student' ? 'Mentors' : 'Students'}...</h2>
          <p>Connecting you with the best talent</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mentor-page">
      {/* Background Elements */}
      <div className="mentor-background">
        <motion.div 
          className="mentor-bg-circle mentor-bg-circle-1"
          variants={floatingVariants}
          animate="animate"
        ></motion.div>
        <motion.div 
          className="mentor-bg-circle mentor-bg-circle-2"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '1s' }}
        ></motion.div>
        <motion.div 
          className="mentor-bg-circle mentor-bg-circle-3"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
        ></motion.div>
        <div className="mentor-bg-grid"></div>
      </div>

      {/* Header Section */}
      <motion.div 
        className="mentor-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="mentor-header-content">
          <h1 className="mentor-title">
            Discover Amazing {user === 'student' ? 'Mentors' : 'Students'}
          </h1>
          <p className="mentor-subtitle">
            {user === 'student' 
              ? 'Connect with experienced alumni who can guide your career journey'
              : 'Find talented students eager to learn and grow with your mentorship'
            }
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mentor-search-filter-section">
          <div className="mentor-search-container">
            <FaSearch className="mentor-search-icon" />
            <input
              type="text"
              placeholder={`Search ${user === 'student' ? 'mentors' : 'students'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mentor-search-input"
            />
          </div>

          <div className="mentor-filter-container">
            <FaFilter className="mentor-filter-icon" />
            <div className="mentor-skill-filters">
              {allSkills.slice(0, 8).map((skill, index) => (
                <motion.button
                  key={index}
                  className={`mentor-skill-filter-btn ${filterSkills.includes(skill) ? 'active' : ''}`}
                  onClick={() => toggleSkillFilter(skill)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {skill}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results Count */}
      <motion.div 
        className="mentor-results-count"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span>{filteredData.length} {user === 'student' ? 'mentors' : 'students'} found</span>
      </motion.div>

      {/* Cards Grid */}
      <motion.div 
        className="mentor-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {filteredData.map((item, index) => (
            <motion.div
              key={item._id || index}
              className="mentor-card"
              variants={cardVariants}
              whileHover={{ 
                y: -4,
                scale: 1.01,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Left Section - Profile Info */}
              <div className="mentor-card-left-section">
                <div className="mentor-card-profile">
                  <div className="mentor-card-image-container">
                    <img
                      src={item.profilePic || 'https://via.placeholder.com/150'}
                      alt={`${item.name}'s profile`}
                      className="mentor-card-image"
                    />
                  </div>
                  <div className="mentor-card-info">
                    <h3 className="mentor-card-name">{item.name}</h3>
                    <div className="mentor-card-course">
                      <FaUserGraduate className="mentor-course-icon" />
                      <span>
                        {user === 'student' 
                          ? `${item.careerPath?.currentPosition || 'Professional'}`
                          : `Year ${item.year}, ${item.branch}`
                        }
                      </span>
                    </div>
                  </div>
                 
                </div>
                <motion.button
                    className="mentor-action-btn mentor-profile-btn"
                    onClick={() => handleViewProfile(item._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
               
                    Profile {'>'}
                  </motion.button>
              </div>

              {/* Right Section - Skills & Actions */}
              <div className="mentor-card-right-section">
                {/* Skills */}
                {item.skills?.length > 0 && (
                  <div className="mentor-card-skills">
                    {item.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="mentor-skill-tag">{skill}</span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mentor-card-actions">
                  
                  
                  <motion.button
                    className="mentor-action-btn mentor-call-btn"
                    onClick={() => handleCall(item._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPhone className="mentor-btn-icon" />
                    <span>Call</span>
                  </motion.button>
                  
                  <motion.button
                    className="mentor-action-btn mentor-chat-btn"
                    onClick={() => handleChat(item._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaComments className="mentor-btn-icon" />
                    <span>Chat</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredData.length === 0 && !loading && (
        <motion.div 
          className="mentor-empty-state"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mentor-empty-icon">🔍</div>
          <h3>No {user === 'student' ? 'mentors' : 'students'} found</h3>
          <p>Try adjusting your search or filters</p>
        </motion.div>
      )}
    </div>
  );
};

export default Mentor;
