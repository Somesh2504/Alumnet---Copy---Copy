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

// Verify OTP and register alumni
export const verifyOTPAndRegister = async (req, res) => {
  try {
    console.log('📥 Received request body:', req.body);
    console.log('📁 Received file:', req.file);
    console.log('📧 Email from body:', req.body.email);
    console.log('🔐 OTP from body:', req.body.otp);

    // Handle email - it might be an array due to FormData
    const email = Array.isArray(req.body.email) ? req.body.email[0] : req.body.email;
    const otp = req.body.otp;
    
    console.log('📧 Processed email:', email);
    console.log('🔐 Processed OTP:', otp);

    const {
      name,
      password,
      branch,
      graduationYear,
      mentorshipBio,
      skills,
      certifications,
      projects,
      careerPath,
      socials,
      mentorshipTags,
      availableForMentorship,
      maxStudents
    } = req.body;

    // Validate required fields
    if (!email || !otp || !name || !password || !branch || !graduationYear) {
      return res.status(400).json({ 
        message: "Missing required fields: email, otp, name, password, branch, graduationYear" 
      });
    }

    // Check if OTP exists and is valid
    const otpData = otpStore.get(email);
    console.log(`🔍 Looking for OTP for ${email}`);
    console.log(`📦 OTP Store size: ${otpStore.size}`);
    console.log(`📧 Found OTP data:`, otpData ? 'Yes' : 'No');
    
    if (!otpData) {
      console.log(`❌ OTP not found for ${email}`);
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    console.log(`✅ OTP found for ${email}: ${otpData.otp}`);
    console.log(`⏰ OTP timestamp: ${new Date(otpData.timestamp).toLocaleString()}`);
    console.log(`🕐 Current time: ${new Date().toLocaleString()}`);
    console.log(`⏱️ Time difference: ${Date.now() - otpData.timestamp}ms`);

    // Check OTP expiration (10 minutes)
    if (Date.now() - otpData.timestamp > 10 * 60 * 1000) {
      console.log(`⏰ OTP expired for ${email}`);
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    // Verify OTP
    console.log(`🔐 Comparing OTP: Expected ${otpData.otp}, Received ${otp}`);
    if (otpData.otp !== otp) {
      console.log(`❌ OTP mismatch for ${email}`);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    console.log(`✅ OTP verified successfully for ${email}`);

    // Check if user already exists
    const existingAlumni = await Alumni.findOne({ email });
    if (existingAlumni) {
      return res.status(400).json({ message: 'Alumni already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse JSON strings if they exist
    const parsedSkills = skills ? (typeof skills === 'string' ? JSON.parse(skills) : skills) : [];
    const parsedCertifications = certifications ? (typeof certifications === 'string' ? JSON.parse(certifications) : certifications) : [];
    const parsedProjects = projects ? (typeof projects === 'string' ? JSON.parse(projects) : projects) : [];
    const parsedCareerPath = careerPath ? (typeof careerPath === 'string' ? JSON.parse(careerPath) : careerPath) : {};
    const parsedSocials = socials ? (typeof socials === 'string' ? JSON.parse(socials) : socials) : {};
    const parsedMentorshipTags = mentorshipTags ? (typeof mentorshipTags === 'string' ? JSON.parse(mentorshipTags) : mentorshipTags) : [];

    // Handle profile picture upload
    let profilePicUrl = '';
    if (req.file) {
      try {
        const streamUpload = (req) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'alumni-profiles',
                transformation: [
                  { width: 400, height: 400, crop: 'fill' },
                  { quality: 'auto' }
                ]
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
        };

        const result = await streamUpload(req);
        profilePicUrl = result.secure_url;
        console.log('✅ Profile picture uploaded:', profilePicUrl);
      } catch (uploadError) {
        console.error('❌ Profile picture upload failed:', uploadError);
        // Continue without profile picture
      }
    }

    // Create new alumni with all fields
    const newAlumni = new Alumni({
      name,
      email,
      password: hashedPassword,
      branch,
      graduationYear,
      profilePic: profilePicUrl,
      careerPath: parsedCareerPath,
      socials: parsedSocials,
      skills: parsedSkills,
      certifications: parsedCertifications,
      projects: parsedProjects,
      mentorshipBio,
      mentorshipTags: parsedMentorshipTags,
      availableForMentorship: availableForMentorship === 'true' || availableForMentorship === true,
      maxStudents: maxStudents ? parseInt(maxStudents) : 3,
      role: 'alumni',
      isVerified: true,
      chatHistory: [],
      callsHistory: []
    });

    await newAlumni.save();
    console.log('✅ Alumni registered successfully:', newAlumni._id);

    // Clear OTP
    otpStore.delete(email);

    // Generate token for the new alumni
    const token = generateToken(newAlumni._id, newAlumni.email, newAlumni.role);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 30 days
    });
    res.status(201).json({
      message: 'Alumni registered successfully',
      alumni: {
        id: newAlumni._id,
        name: newAlumni.name,
        email: newAlumni.email,
        role: newAlumni.role,
        token: token // Also return token for localStorage
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// POST /api/alumni/register
export const registerAlumni = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const {
      name,
      email,
      password,
      branch,
      graduationYear,
      mentorshipBio,
    } = req.body;

   
    const skills = JSON.parse(req.body.skills || '[]');
    const certifications = JSON.parse(req.body.certifications || '[]');
    const projects = JSON.parse(req.body.projects || '[]');
    const careerPath = JSON.parse(req.body.careerPath || '{}');

    
    const existingAlumni = await Alumni.findOne({ email });
    if (existingAlumni) {
      return res.status(400).json({ message: 'Alumni already exists' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

   
    let profilePictureUrl = '';

    
    if (req.file) {
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'mentor-platform',
              resource_type: 'image',
            },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
      const result = await streamUpload(req);
      profilePictureUrl = result.secure_url;
    }

   
    const newAlumni = new Alumni({
      name,
      email,
      password: hashedPassword,
      branch,
      graduationYear,
      mentorshipBio,
      skills,
      certifications,
      projects,
      careerPath,
      profilePic: profilePictureUrl,
    });

    
    await newAlumni.save();

    
    res.status(201).json({
      _id: newAlumni._id,
      name: newAlumni.name,
      email: newAlumni.email,
      role: newAlumni.role,
      profilePic: profilePictureUrl,
      token: generateToken(newAlumni._id, newAlumni.email, newAlumni.role),
    });
  } catch (error) {
    console.error('Error in Alumni Registration:', error.message);
    res.status(500).json({ message: 'Server error at Alumni Registration' });
  }
};

// POST /api/alumni/login
export const loginAlumni =async (req,res)=>{
   const {email,password}=req.body
   try {
        const alumni =await Alumni.findOne({email})
        if(!alumni){
            return res.status(400).json({message:"Invalid Email"})
        }

        const isMatch = await bcrypt.compare(password,alumni.password)
        if(!isMatch){
            return res.status(400).json({message:"Invalid Password"})
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
        })

     
   } catch (error) {
    console.log("Error in Alumni Login ",error.message);
    res.status(500).json({message:"Server error At Alumni Login"})
   }
}

// GET /api/alumni
export const getAlumni = async (req,res)=>{
    try {
        const student=await Student.findById(req.user.id);
        const alumniList =await Alumni.find().select("-password")
        const user=req.user;
        res.status(200).json({alumni:alumniList,user:user,role:student.role})
    } catch (error) {
        console.log("Error in Fetching Alumni Details " ,error.message)
        return res.status(500).json({message:"Server Error in Fetching Alumni Details"})
    }
}

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