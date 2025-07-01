import React, { useState, useEffect } from 'react';
import './OTPVerification.css';

const OTPVerification = ({ 
  email, 
  onOTPSent, 
  onOTPVerified, 
  onBack, 
  role = 'user',
  registrationData = null
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  const sendOTP = async () => {
    setIsSendingOTP(true);
    setError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${role}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimer(60); // 60 seconds countdown
        onOTPSent && onOTPSent(data);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const verifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifyingOTP(true);
    setError('');

    try {
      // If we have registration data, send it as FormData
      if (registrationData) {
        const formData = new FormData();
        
        // Add OTP and email
        formData.append('email', email);
        formData.append('otp', otpString);
        
        // Add all registration data
        Object.keys(registrationData).forEach(key => {
          if (registrationData[key] !== null && registrationData[key] !== undefined) {
            // Skip email since it's already added separately
            if (key !== 'email') {
              formData.append(key, registrationData[key]);
            }
          }
        });

        console.log('📤 Sending FormData with OTP:', otpString);
        console.log('📧 Email:', email);
        console.log('📦 Registration data keys:', Object.keys(registrationData));

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${role}/verify-otp-register`, {
          method: 'POST',
          body: formData, // Don't set Content-Type header for FormData
        });
       console.log("backend verification success **********")
        const data = await response.json();
        console.log("📥 Response status:", response.status);
        console.log("📥 Response statusText:", response.statusText);
        console.log("📥 Response data:", data);
        console.log("📥 Response ok:", response.ok);
        console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          console.log("✅ Calling onOTPVerified with data:", data);
          onOTPVerified && onOTPVerified(data);
          
          setIsVerifyingOTP(false);
          console.log("************",isVerifyingOTP)
        } else {
          console.log("❌ Response not ok, setting error:", data.message);
          setError(data.message || 'Invalid OTP');
        }
      } else {
        // Fallback to JSON if no registration data
        console.log('📤 Sending JSON with OTP:', otpString);
        console.log('📧 Email:', email);

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${role}/verify-otp-register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email, 
            otp: otpString 
          }),
        });

        const data = await response.json();
        console.log("📥 Response status:", response.status);
        console.log("📥 Response statusText:", response.statusText);
        console.log("📥 Response data:", data);
        console.log("📥 Response ok:", response.ok);
        console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          console.log("✅ Calling onOTPVerified with data:", data);
          setIsVerifyingOTP(false);
          onOTPVerified && onOTPVerified(data);
          
          console.log("************",isVerifyingOTP)
        } else {
          console.log("❌ Response not ok, setting error:", data.message);
          setError(data.message || 'Invalid OTP');
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="otp-verification">
      <div className="otp-header">
        <h3>Email Verification</h3>
        <p>We've sent a verification code to</p>
        <p className="email-display">{email}</p>
      </div>

      <div className="otp-input-container">
        <label>Enter 6-digit code</label>
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOTPChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              data-index={index}
              className="otp-input"
              disabled={isVerifyingOTP}
            />
          ))}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="otp-actions">
        <button
          type="button"
          onClick={verifyOTP}
          disabled={otp.join('').length !== 6 || isVerifyingOTP}
          className="verify-btn"
        >
          {isVerifyingOTP ? 'Verifying...' : 'Verify & Continue'}
        </button>

        <div className="resend-section">
          {timer > 0 ? (
            <p className="timer">Resend code in {formatTime(timer)}</p>
          ) : (
            <button
              type="button"
              onClick={sendOTP}
              disabled={isSendingOTP}
              className="resend-btn"
            >
              {isSendingOTP ? 'Sending...' : 'Resend Code'}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onBack}
          className="back-btn"
          disabled={isVerifyingOTP}
        >
          Back to Registration
        </button>
      </div>
    </div>
  );
};

export default OTPVerification; 