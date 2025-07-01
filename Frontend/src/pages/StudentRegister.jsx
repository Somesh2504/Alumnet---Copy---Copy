import React, { useState } from 'react';
import './StudentRegister.css'; // Style accordingly
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OTPVerification from '../components/OTPVerification';
import { useNotification } from '../context/NotificationContext';

const StudentRegister = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    year: '',
    collegeId: '',
    skills: '',
    gpa: '',
    resumeLink: '',
    github: '',
    linkedin: '',
    portfolio: '',
    projects: '',
    achievements: '',
    interests: '',
    preferredMentorBranch: '',
    preferredMentorMinExperience: ''
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('📧 Attempting to send OTP for email:', formData.email);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/student/send-otp`, {
        email: formData.email
      });

      console.log('✅ OTP sent successfully:', response.data);

      if (response.status === 200) {
        setShowOTP(true);
        showSuccess('OTP sent successfully! Check your email.');
      }
    } catch (error) {
      console.error('❌ OTP sending failed:', error.response?.data || error.message);
      
      // Handle specific error messages from the backend
      if (error.response && error.response.data && error.response.data.message) {
        showError(error.response.data.message);
      } else {
        showError('Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = (data) => {
    console.log('📥 Received OTP verification data:', data);
    console.log('📧 Data message:', data?.message);
    console.log('👤 Data student:', data?.student);
    console.log("data*****",data)
    if (data && (data.message === 'Student registered successfully' || data.student)) {
      console.log('✅ Setting registration success to true');
      setRegistrationSuccess(true);
      showSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login/student');
      }, 2000);
    } else {
      console.log('❌ Registration failed - data does not match expected format');
      showError(data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleBackToForm = () => {
    setShowOTP(false);
    setRegistrationSuccess(false);
  };

  if (showOTP) {
    return (
      <div className="form-container">
        {registrationSuccess ? (
          <div className="success-container">
            <h2>✅ Registration Successful!</h2>
            <p>Your student account has been created successfully.</p>
            <p>Redirecting to login page...</p>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <OTPVerification
            email={formData.email}
            onOTPVerified={handleOTPVerified}
            onBack={handleBackToForm}
            role="student"
            registrationData={{
              name: formData.name,
              email: formData.email,
              password: formData.password,
              branch: formData.branch,
              year: formData.year,
              collegeId: formData.collegeId,
              skills: JSON.stringify(formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)),
              gpa: formData.gpa,
              resumeLink: formData.resumeLink,
              socials: JSON.stringify({
                github: formData.github,
                linkedin: formData.linkedin,
                portfolio: formData.portfolio
              }),
              projects: JSON.stringify(
                formData.projects
                  .split(',')
                  .map(p => p.trim())
                  .filter(p => p)
                  .map(title => ({ title, description: '', techStack: [], link: '' }))
              ),
              achievements: JSON.stringify(formData.achievements.split(',').map(achievement => achievement.trim()).filter(achievement => achievement)),
              interests: JSON.stringify(formData.interests.split(',').map(interest => interest.trim()).filter(interest => interest)),
              preferredMentorCriteria: JSON.stringify({
                branch: formData.preferredMentorBranch,
                minExperience: formData.preferredMentorMinExperience ? parseInt(formData.preferredMentorMinExperience) : undefined
              }),
              profilePicture: profilePicture
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="form-container">
      <form className="register-form" onSubmit={handleSendOTP}>
        <h2>Student Registration</h2>

        <div className="form-section">
          <h4>Basic Information</h4>
          <input 
            type="text" 
            name="name" 
            placeholder="Full Name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="text" 
            name="branch" 
            placeholder="Branch" 
            value={formData.branch} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="number" 
            name="year" 
            placeholder="Year (e.g., 2)" 
            value={formData.year} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="text" 
            name="collegeId" 
            placeholder="College ID" 
            value={formData.collegeId} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-section">
          <h4>Academic & Skills</h4>
          <textarea 
            name="skills" 
            placeholder="Skills (comma separated, e.g., JavaScript, React, Python)" 
            value={formData.skills} 
            onChange={handleChange} 
            rows="3"
          />
          <input 
            type="number" 
            step="0.1" 
            name="gpa" 
            placeholder="GPA" 
            value={formData.gpa} 
            onChange={handleChange} 
            min="0"
            max="10"
          />
          <input 
            type="url" 
            name="resumeLink" 
            placeholder="Resume Link (Google Drive, Dropbox, etc.)" 
            value={formData.resumeLink} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-section">
          <h4>Social Links</h4>
          <input 
            type="url" 
            name="github" 
            placeholder="GitHub Profile URL" 
            value={formData.github} 
            onChange={handleChange} 
          />
          <input 
            type="url" 
            name="linkedin" 
            placeholder="LinkedIn Profile URL" 
            value={formData.linkedin} 
            onChange={handleChange} 
          />
          <input 
            type="url" 
            name="portfolio" 
            placeholder="Portfolio Website URL" 
            value={formData.portfolio} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-section">
          <h4>Projects & Achievements</h4>
          <textarea 
            name="projects" 
            placeholder="Projects (comma separated)" 
            value={formData.projects} 
            onChange={handleChange} 
            rows="3"
          />
          <textarea 
            name="achievements" 
            placeholder="Achievements (comma separated)" 
            value={formData.achievements} 
            onChange={handleChange} 
            rows="3"
          />
        </div>

        <div className="form-section">
          <h4>Interests & Preferences</h4>
          <textarea 
            name="interests" 
            placeholder="Interests (comma separated, e.g., Web Development, AI, Data Science)" 
            value={formData.interests} 
            onChange={handleChange} 
            rows="3"
          />
          <input 
            type="text" 
            name="preferredMentorBranch" 
            placeholder="Preferred Mentor Branch" 
            value={formData.preferredMentorBranch} 
            onChange={handleChange} 
          />
          <input 
            type="number" 
            name="preferredMentorMinExperience" 
            placeholder="Minimum Experience Required (years)" 
            value={formData.preferredMentorMinExperience} 
            onChange={handleChange} 
            min="0"
          />
        </div>

        <div className="form-section">
          <h4>Profile Picture</h4>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
          />
          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
        </button>

        <p className="redirect-message">
          Already have an account?{' '}
          <span className="redirect-link" onClick={() => navigate('/login')}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default StudentRegister;
