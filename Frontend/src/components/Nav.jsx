import React, { useState, useEffect } from 'react';
import './Nav.css';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import Mainlogo from '../assets/MainLogo1.png'
import Textlogo from '../assets/SideLogo3.png';
// Import Link from react-router-dom
import { Link } from 'react-router-dom';
import axios from 'axios';
// import jwt from 'jsonwebtoken';

function Nav() {
  const { user, logout, currentUser, baseURL } = useAppContext();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCollege, setIsCollege] = useState(false);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to handle navigation and close mobile menu
  const handleNavigation = () => {
    scrollToTop();
    setMenuOpen(false); // Close mobile menu when navigation link is clicked
  };

  // Custom Link component that scrolls to top and closes mobile menu
  const ScrollLink = ({ to, children, className }) => (
    <Link to={to} className={className} onClick={handleNavigation}>
      {children}
    </Link>
  );

  // Loading animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show loading for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // Check if user is admin or college
  useEffect(() => {
    const adminData = localStorage.getItem('adminInfo');
    setIsAdmin(!!adminData);
    
    // Check if current user is a college
    if (currentUser && currentUser.role === 'college') {
      setIsCollege(true);
    } else {
      setIsCollege(false);
    }
  }, [currentUser]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleProfileClick = () => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else if (isCollege) {
      navigate('/college/dashboard');
    } else if (user === 'alumni') {
      navigate('/alumni/dashboard');
    } else {
      navigate('/profile');
    }
    setDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    if (isAdmin) {
      localStorage.removeItem('adminInfo');
      setIsAdmin(false);
      navigate('/admin/login');
    } else if (isCollege) {
      // College logout will be handled by the dashboard component
      logout();
      setIsCollege(false);
      navigate('/');
    } else {
      logout();
    }
    setDropdownOpen(false);
  };

  const handleAdminLogout = async () => {
    try {
      await fetch(`${baseURL}api/admin/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('adminInfo');
    setIsAdmin(false);
    navigate('/admin/login');
    setDropdownOpen(false);
  };

  const handleCollegeLogout = async () => {
    try {
      await axios.post(`${baseURL}api/college/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('College logout error:', error);
    }
    
    logout(); // This will clear the context
    setIsCollege(false);
    navigate('/');
    setDropdownOpen(false);
  };

  // Determine user role tag
  let userRoleTag = null;
  if (isCollege) {
    userRoleTag = <span className="role-tag college-tag">College</span>;
  } else if (user === 'alumni') {
    userRoleTag = <span className="role-tag alumni-tag">Alumni</span>;
  } else if (user === 'student') {
    userRoleTag = <span className="role-tag student-tag">Student</span>;
  }

  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-logo-container">
            <img src={Mainlogo} alt="Loading..." className="loading-logo" />
            <div className="loading-text">Welcome to AlumNET</div>
            <div className="loading-spinner"></div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className={`navbar ${isLoading ? 'navbar-hidden' : 'navbar-visible'}`}>
        <div className="navbar-logo">
          <div className="Mlogo">
            <img src={Mainlogo} alt="Mainlogo" />
          </div>
          {/* <div className="logo"><img src={Textlogo} alt="logo" /></div> */}
        </div>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <ScrollLink to="/" className="menu-item">Home</ScrollLink>
          {!isAdmin && !isCollege && (
            <>
              <ScrollLink to="/alumnies" className="menu-item">{user=='alumni'?'Students':'Alumnies'}</ScrollLink>
              <ScrollLink to="/chat" className="menu-item">Chat</ScrollLink>
              <ScrollLink to="/community" className="menu-item">Community</ScrollLink>
            </>
          )}
          {user === 'alumni' && (
            <>
              <ScrollLink to="/alumni/dashboard" className="menu-item">Dashboard</ScrollLink>
            </>
          )}
          {isAdmin && (
            <>
              <ScrollLink to="/admin/colleges" className="menu-item">Colleges</ScrollLink>
              <ScrollLink to="/admin/students" className="menu-item">Students</ScrollLink>
              <ScrollLink to="/admin/alumni" className="menu-item">Alumni</ScrollLink>
              <ScrollLink to="/admin/testimonials" className="menu-item">Testimonials</ScrollLink>
            </>
          )}
          {isCollege && (
            <>
              <ScrollLink to="/college/dashboard" className="menu-item">Dashboard</ScrollLink>
              <ScrollLink to="/college/dashboard?tab=students" className="menu-item">Students</ScrollLink>
              <ScrollLink to="/college/dashboard?tab=alumni" className="menu-item">Alumni</ScrollLink>
            </>
          )}
          <ScrollLink to="/testimonials" className="menu-item">Testimonials</ScrollLink>
          <ScrollLink to="/about" className="menu-item">About</ScrollLink>
          <ScrollLink to="/contact" className="menu-item">Contact</ScrollLink>
        </div>

        <div className="navbar-right">
          {user == null && !isAdmin && !isCollege ? (
            <div className="auth-buttons">
              <button onClick={handleLoginClick} className="login-button">Login</button>
              <button onClick={() => navigate('/register')} className="signup-button">Signup</button>
            </div>
          ) : (
            <div className="user-dropdown">
              <FaUserCircle className="user-icon" onClick={() => setDropdownOpen(!dropdownOpen)} />
              {/* Show user name beside the icon */}
              {isAdmin ? (
                <span className="user-name">Super Admin</span>
              ) : isCollege ? (
                currentUser && currentUser.name && (
                  <span className="user-name">{currentUser.name}</span>
                )
              ) : (
                currentUser && currentUser.name && (
                  <span className="user-name">{currentUser.name}</span>
                )
              )}
              {/* Role tag */}
              {userRoleTag}
          
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div onClick={handleProfileClick}>
                    {isAdmin ? 'Dashboard' : isCollege ? 'Dashboard' : 'Profile'}
                  </div>
                  <div onClick={isAdmin ? handleAdminLogout : isCollege ? handleCollegeLogout : handleLogoutClick}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Nav;
