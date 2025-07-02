import Alumni from "../Models/AlumniModel.js";
import Student from "../Models/StudentModel.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import dotenv from "dotenv"
import streamifier from 'streamifier';
import {v2 as cloudinary} from 'cloudinary';
import nodemailer from 'nodemailer';

dotenv.config()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary connected');

const generateToken = (id, email, role)=>{
    return jwt.sign({id, email, role},process.env.JWT_SECRET,{expiresIn :"30d"})
}

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  secure: false, // Use TLS
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service ready');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration failed:', error.message);
    return false;
  }
};

// Initialize transporter verification
verifyTransporter();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP - Alumnet',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #007bff; font-size: 32px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send OTP for email verification
export const sendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const existingAlumni = await Alumni.findOne({ email });
    if (existingAlumni) {
      return res.status(400).json({ 
        message: "Account already exists with this email. Please login instead." 
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      role: 'alumni'
    });

    console.log(`📧 OTP sent for ${email}: ${otp}`);
    console.log(`📦 OTP Store size: ${otpStore.size}`);

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({ 
      message: "OTP sent successfully",
      email,
      role: 'alumni'
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// GET /api/alumni - FIXED VERSION
export const getAlumni = async (req, res) => {
    try {
        console.log('getAlumni called with user:', req.user);
        
        // Check if user is a Student or Alumni
        let user = await Student.findById(req.user.id);
        let userRole = 'student';
        
        if (!user) {
            // If not found in Student collection, check Alumni collection
            user = await Alumni.findById(req.user.id);
            userRole = 'alumni';
        }
        
        if (!user) {
            console.log('User not found in either collection');
            return res.status(404).json({ message: "User not found" });
        }
        
        console.log('User found:', user.name, 'Role:', userRole);
        
        const alumniList = await Alumni.find().select("-password");
        
        res.status(200).json({
            alumni: alumniList,
            user: user,
            role: userRole
        });
    } catch (error) {
        console.log("Error in Fetching Alumni Details:", error.message);
        return res.status(500).json({message:"Server Error in Fetching Alumni Details"});
    }
};

// GET /api/alumni/:id - Get individual alumni details
export const getAlumniById = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid alumni ID format" });
    }
   
    const alumni = await Alumni.findById(id)
   
    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }
    
    res.status(200).json({
      alumni,
      message: "Alumni details retrieved successfully"
    });
  } catch (error) {
    console.log("Error in Fetching Alumni Details by ID:", error.message);
    res.status(500).json({ message: "Server Error in Fetching Alumni Details" });
  }
};

// Export other functions as needed
export const loginAlumni = async (req, res) => {
   const {email, password} = req.body;
   try {
        const alumni = await Alumni.findOne({email});
        if(!alumni){
            return res.status(400).json({message:"Invalid Email"});
        }

        const isMatch = await bcrypt.compare(password, alumni.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid Password"});
        }
        
        const token = generateToken(alumni._id, alumni.email, alumni.role);
        
        return res.cookie("token", token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
         maxAge: 7 * 24 * 60 * 60 * 1000 // 30 days
       }).status(200).json({
            _id: alumni._id,
            name: alumni.name,
            email: alumni.email,
            role: alumni.role,
            token: token, // Also return token for localStorage
             message: "Login successful"
        });

   } catch (error) {
    console.log("Error in Alumni Login ", error.message);
    res.status(500).json({message:"Server error At Alumni Login"});
   }
}; 