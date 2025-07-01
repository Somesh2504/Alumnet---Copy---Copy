# Email OTP Setup Guide

This guide will help you set up email verification with OTP for alumni and student registration.

## Prerequisites

1. A Gmail account
2. Gmail App Password (not your regular password)

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security"
3. Enable "2-Step Verification" if not already enabled

## Step 2: Generate App Password

1. In your Google Account settings, go to "Security"
2. Under "2-Step Verification", click on "App passwords"
3. Select "Mail" as the app and "Other" as the device
4. Click "Generate"
5. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

## Step 3: Create Environment File

Create a `.env` file in the `Backend` directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/alumnet

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Configuration (for OTP)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_character_app_password

# Super Admin (optional - defaults provided)
SUPER_ADMIN_EMAIL=admin@alumnet.com
SUPER_ADMIN_PASSWORD=admin123

# Port
PORT=5000

# Cloudinary Configuration (if using profile pictures)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Step 4: Test the Setup

1. Start your backend server:
   ```bash
   cd Backend
   npm run server
   ```

2. Try registering a new alumni or student account
3. Check if you receive the OTP email

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**
   - Make sure you're using the App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled

2. **"Authentication failed" error**
   - Double-check your EMAIL_USER and EMAIL_PASS in the .env file
   - Make sure there are no extra spaces in the app password

3. **OTP not received**
   - Check your spam folder
   - Verify the email address is correct
   - Check the server logs for any email sending errors

4. **"Less secure app access" error**
   - This is normal and expected - Gmail will show this warning for app passwords
   - The app password is secure and recommended by Google

## Security Notes

- Never commit your `.env` file to version control
- Use a dedicated Gmail account for your application
- Regularly rotate your app passwords
- Consider using a service like SendGrid or AWS SES for production

## Features Implemented

✅ **Alumni Registration with OTP**
- Two-step registration process
- Email verification with 6-digit OTP
- 10-minute OTP expiration
- Resend functionality with 60-second cooldown

✅ **Student Registration with OTP**
- Same OTP verification system
- Integration with existing student records
- Automatic role detection

✅ **Frontend Components**
- Reusable OTP verification component
- Modern UI with auto-focus inputs
- Loading states and error handling
- Responsive design

✅ **Backend API**
- `/api/alumni/send-otp` - Send OTP for alumni
- `/api/alumni/verify-otp-register` - Verify OTP and register alumni
- `/api/student/send-otp` - Send OTP for students
- `/api/student/verify-otp-register` - Verify OTP and register students

## Registration Flow

1. **User fills registration form** with all required details
2. **Clicks "Send Verification Code"** - OTP is sent to email
3. **User enters 6-digit OTP** in the verification screen
4. **System verifies OTP** and creates the account
5. **User is redirected** to login page

The system maintains backward compatibility with the existing registration endpoints. 