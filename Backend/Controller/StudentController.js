import Student from "../Models/StudentModel.js";
import StudentRecord from "../Models/StudentRecord.js";
import AlumniRecord from "../Models/AlumniRecord.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Alumni from "../Models/AlumniModel.js";
import nodemailer from 'nodemailer';
import {v2 as cloudinary} from 'cloudinary';
import streamifier from 'streamifier';
import mongoose from 'mongoose';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary connected');

const generateToken = (id, email, role)=>{
    console.log("JWT_SECRRET",process.env.JWT_SECRET)
    return jwt.sign({id, email, role},process.env.JWT_SECRET, {
        expiresIn:"30d"
    })
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

    // TODO: Uncomment for production - Check if email exists in student records
    // const studentRecord = await StudentRecord.findOne({ email });
    // const alumniRecord = await AlumniRecord.findOne({ email });

    // if (!studentRecord && !alumniRecord) {
    //   return res.status(404).json({ 
    //     message: "Email not found in college records. Please contact your college administrator." 
    //   });
    // }

    // TODO: Uncomment for production - Check if user already exists
    // const existingStudent = await Student.findOne({ email });
    // const existingAlumni = await Alumni.findOne({ email });

    // if (existingStudent || existingAlumni) {
    //   return res.status(400).json({ 
    //     message: "Account already exists with this email. Please login instead." 
    //   });
    // }

    // For development: Check if user already exists
    const existingStudent = await Student.findOne({ email });
    const existingAlumni = await Alumni.findOne({ email });

    if (existingStudent || existingAlumni) {
      return res.status(400).json({ 
        message: "Account already exists with this email. Please login instead." 
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      role: 'student', // Default to student for development
      recordData: null // No record data for development
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({ 
      message: "OTP sent successfully",
      email,
      role: 'student'
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP and register student
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
      year,
      collegeId,
      skills, 
      gpa,
      resumeLink,
      socials,
      projects,
      achievements,
      interests,
      preferredMentorCriteria
    } = req.body;

    // Validate required fields
    if (!email || !otp || !name || !password || !branch || !year) {
      return res.status(400).json({ 
        message: "Missing required fields: email, otp, name, password, branch, year" 
      });
    }

    // Handle collegeId - make it optional for development
    let validCollegeId = null;
    if (collegeId) {
      // Check if collegeId is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(collegeId)) {
        validCollegeId = collegeId;
      } else {
        console.log('⚠️ Invalid collegeId format, setting to null:', collegeId);
        validCollegeId = null;
      }
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

    const { role } = otpData;

    
    const hashedPassword = await bcrypt.hash(password, 10);
   
    // Parse JSON strings if they exist
    const parsedSkills = skills ? (typeof skills === 'string' ? JSON.parse(skills) : skills) : [];
    const parsedSocials = socials ? (typeof socials === 'string' ? JSON.parse(socials) : socials) : {};
    const parsedProjects = projects ? (typeof projects === 'string' ? JSON.parse(projects) : projects) : [];
    const parsedAchievements = achievements ? (typeof achievements === 'string' ? JSON.parse(achievements) : achievements) : [];
    const parsedInterests = interests ? (typeof interests === 'string' ? JSON.parse(interests) : interests) : [];
    const parsedPreferredMentorCriteria = preferredMentorCriteria ? (typeof preferredMentorCriteria === 'string' ? JSON.parse(preferredMentorCriteria) : preferredMentorCriteria) : {};
    
    // Handle profile picture upload
    let profilePicUrl = '';
    if (req.file) {
      try {
        const streamUpload = (req) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'student-profiles',
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
    } else {
      console.log('⚠️ No req.file found, skipping profile picture upload.');
    }
    console.log(" Before to save student with data:")
    // Create new student with all fields
    const newStudent = new Student({
      name,
      email,
      password: hashedPassword,
      branch,
      year: parseInt(year),
      collegeId: validCollegeId,
      profilePic: profilePicUrl,
      skills: parsedSkills,
      gpa: gpa ? parseFloat(gpa) : undefined,
      resumeLink,
      socials: parsedSocials,
      projects: parsedProjects,
      achievements: parsedAchievements,
      interests: parsedInterests,
      preferredMentorCriteria: parsedPreferredMentorCriteria,
      role: role || 'student',
      isVerified: true,
      chatHistory: [],
      callsHistory: []
    });

    console.log('📝 Attempting to save student with data:', {
      name,
      email,
      branch,
      year: parseInt(year),
      collegeId: validCollegeId,
      role: role || 'student'
    });

    await newStudent.save();
    console.log('✅ Student registered successfully:', newStudent._id);

    // Clear OTP
    otpStore.delete(email);

    // Generate token for the new student
    const token = generateToken(newStudent._id, newStudent.email, newStudent.role);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(201).json({
      message: 'Student registered successfully',
      student: {
        id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email,
        role: newStudent.role,
        token: token // Also return token for localStorage
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Check for specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Email already exists' 
      });
    }
    
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Legacy registration (keeping for backward compatibility)
export const registerStudent = async (req,res)=>{
    const { name, email, password, branch, year, collegeId, skills, gpa } = req.body;
    // console.log("Student Registration Data:", req.body); // Log the incoming data
    try {
         const existingStudent = await Student.findOne({email})
          
        if (existingStudent) {
            return res.status(400).json({ message: "Student already exists" });
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newStudent = new Student({
            name,
            email,
            password:hashedPassword,
            branch,
            year,
            collegeId,
            skills,
            gpa, 
        })
        await newStudent.save();
        res.status(201).json({
            _id:newStudent._id,
            name:newStudent.name,
            email:newStudent.email,
            role: newStudent.role,
            token:generateToken(newStudent._id, newStudent.email, newStudent.role)
        })

    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(500).json({ message: "Server error At Student Regestration" });
    }
}

export const loginStudent = async (req,res)=>{
  //console.log("login student *********")
    const {email,password}=req.body;
  // console.log("email ",email,"password",password)
    try {
        const student =await Student.findOne({email});
        if(!student){
            return res.status(400).json({message:"Invalid email "})
        }
        
       const isMatch =await bcrypt.compare(password,student.password)
       console.log("isMatch",isMatch)
       if(!isMatch){
        return res.status(400).json({message:"Invalid Password"})
       }
       
       const token = generateToken(student._id, student.email, student.role);
       
       res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
       .status(200)
       .json({
         _id: student._id,
         name: student.name,
         email: student.email,
         role: student.role,
         token: token, // Also return token for localStorage
         message: "Login successful"
       });

    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Server error At Student Login" });
    }
}


//get  api/student
export const getStudents = async (req,res)=>{
   try {
    // Check if user is a Student or Alumni
    let user = await Alumni.findById(req.user.id);
    let userRole = 'alumni';
    
    if (!user) {
      // If not found in Alumni collection, check Student collection
      user = await Student.findById(req.user.id);
      userRole = 'student';
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const studentsList = await Student.find().select("-password");
    res.status(200).json({
      students: studentsList,
      user: user,
      role: userRole
    });
   } catch (error) {
    console.log("Error at fetching student details", error.message);
    res.status(500).json({message:"Error in fetching student detail"});
   }
}

// GET /api/student/:id - Get individual student details
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }
   
    const student = await Student.findById(id)
   
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.status(200).json({
      student,
      message: "Student details retrieved successfully"
    });
  } catch (error) {
    console.log("Error in Fetching Student Details by ID:", error.message);
    res.status(500).json({ message: "Server Error in Fetching Student Details" });
  }
};
