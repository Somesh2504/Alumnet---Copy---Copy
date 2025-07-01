import React, { useState } from 'react';
import axios from 'axios';
import OTPVerification from '../components/OTPVerification';
import './AlumniRegister.css'; // External CSS

const AlumniRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    graduationYear: '',
    currentPosition: '',
    company: '',
    experienceYears: '',
    linkedin: '',
    github: '',
    twitter: '',
    personalWebsite: '',
    skills: '',
    mentorshipBio: '',
    certifications: '',
    projects: '',
    mentorshipTags: '',
    availableForMentorship: true,
    maxStudents: 3
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
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
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/alumni/send-otp`, {
        email: formData.email
      });

      if (response.status === 200) {
        setShowOTP(true);
        setSuccess('OTP sent successfully! Check your email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = async (otpData) => {
    try {
      setRegistrationSuccess(true);
      setSuccess('Alumni registered successfully! Redirecting to login...');
      console.log('Registration response:', otpData);
      
      // Redirect to login after successful registration
      setTimeout(() => {
        window.location.href = '/login/alumni';
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Registration failed. Please try again.');
    }
  };

  const handleBackToForm = () => {
    setShowOTP(false);
    setError('');
    setSuccess('');
    setRegistrationSuccess(false);
  };

  if (showOTP) {
    return (
      <div className="alumni-register-container">
        {registrationSuccess ? (
          <div className="success-container">
            <h2>✅ Registration Successful!</h2>
            <p>Your alumni account has been created successfully.</p>
            <p>Redirecting to login page...</p>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <OTPVerification
            email={formData.email}
            onOTPVerified={handleOTPVerified}
            onBack={handleBackToForm}
            role="alumni"
            registrationData={{
              name: formData.name,
              email: formData.email,
              password: formData.password,
              branch: formData.branch,
              graduationYear: formData.graduationYear,
              mentorshipBio: formData.mentorshipBio,
              skills: JSON.stringify(formData.skills.split(',').map(s => s.trim()).filter(s => s)),
              certifications: JSON.stringify(formData.certifications.split(',').map(c => c.trim()).filter(c => c)),
              projects: JSON.stringify(
                formData.projects
                  .split(',')
                  .map(p => p.trim())
                  .filter(p => p)
                  .map(title => ({ title, description: '', link: '' }))
              ),
              careerPath: JSON.stringify({
                currentPosition: formData.currentPosition,
                company: formData.company,
                experienceYears: formData.experienceYears
              }),
              socials: JSON.stringify({
                linkedin: formData.linkedin,
                github: formData.github,
                twitter: formData.twitter,
                personalWebsite: formData.personalWebsite
              }),
              mentorshipTags: JSON.stringify(formData.mentorshipTags.split(',').map(t => t.trim()).filter(t => t)),
              availableForMentorship: formData.availableForMentorship,
              maxStudents: formData.maxStudents,
              profilePicture: profilePicture
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="alumni-register-container">
      <h2>Alumni Registration</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSendOTP}>
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
            placeholder="Branch (e.g., CSE)" 
            value={formData.branch}
            onChange={handleChange} 
            required 
          />
          <input 
            type="number" 
            name="graduationYear" 
            placeholder="Graduation Year" 
            value={formData.graduationYear}
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-section">
          <h4>Career Details</h4>
          <input 
            type="text" 
            name="currentPosition" 
            placeholder="Current Position" 
            value={formData.currentPosition}
            onChange={handleChange} 
          />
          <input 
            type="text" 
            name="company" 
            placeholder="Company" 
            value={formData.company}
            onChange={handleChange} 
          />
          <input 
            type="number" 
            name="experienceYears" 
            placeholder="Years of Experience" 
            value={formData.experienceYears}
            onChange={handleChange} 
          />
        </div>

        <div className="form-section">
          <h4>Social Links</h4>
          <input 
            type="url" 
            name="linkedin" 
            placeholder="LinkedIn Profile URL" 
            value={formData.linkedin}
            onChange={handleChange} 
          />
          <input 
            type="url" 
            name="github" 
            placeholder="GitHub Profile URL" 
            value={formData.github}
            onChange={handleChange} 
          />
          <input 
            type="url" 
            name="twitter" 
            placeholder="Twitter Profile URL" 
            value={formData.twitter}
            onChange={handleChange} 
          />
          <input 
            type="url" 
            name="personalWebsite" 
            placeholder="Personal Website URL" 
            value={formData.personalWebsite}
            onChange={handleChange} 
          />
        </div>

        <div className="form-section">
          <h4>Skills & Expertise</h4>
          <textarea 
            name="skills" 
            placeholder="Skills (comma separated, e.g., JavaScript, React, Node.js)" 
            value={formData.skills}
            onChange={handleChange} 
            rows="3"
          />
          <textarea 
            name="certifications" 
            placeholder="Certifications (comma separated)" 
            value={formData.certifications}
            onChange={handleChange} 
            rows="3"
          />
          <textarea 
            name="projects" 
            placeholder="Projects (comma separated)" 
            value={formData.projects}
            onChange={handleChange} 
            rows="3"
          />
        </div>

        <div className="form-section">
          <h4>Mentorship Details</h4>
          <textarea 
            name="mentorshipBio" 
            placeholder="Tell us about your mentorship experience and what you can offer to students..." 
            value={formData.mentorshipBio}
            onChange={handleChange} 
            rows="4"
          />
          <textarea 
            name="mentorshipTags" 
            placeholder="Mentorship topics (comma separated, e.g., Career Guidance, Technical Skills, Interview Prep)" 
            value={formData.mentorshipTags}
            onChange={handleChange} 
            rows="3"
          />
          <div className="checkbox-group">
            <label>
              <input 
                type="checkbox" 
                name="availableForMentorship" 
                checked={formData.availableForMentorship}
                onChange={handleChange} 
              />
              Available for Mentorship
            </label>
          </div>
          <input 
            type="number" 
            name="maxStudents" 
            placeholder="Maximum number of students you can mentor" 
            value={formData.maxStudents}
            onChange={handleChange} 
            min="1"
            max="10"
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

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
        </button>
      </form>
    </div>
  );
};

export default AlumniRegister;
