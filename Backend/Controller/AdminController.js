import Admin from '../Models/Admin.js';
import College from '../Models/College.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Super Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
    });

    res.status(200).json({
      message: 'Admin login successful',
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      },
      token: token // Include token in response for localStorage
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Register new college (by super admin)
export const registerCollege = async (req, res) => {
  console.log("in register college")
  try {
    const { name, email, password } = req.body;
    const adminId = req.admin.adminId; // From auth middleware

    // Check if admin exists and is superadmin
    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Check if college email already exists
    const existingCollege = await College.findOne({ email });
    if (existingCollege) {
      return res.status(400).json({ message: 'College with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new college
    const college = new College({
      name,
      email,
      passwordHash,
      approved: false, // Initially unapproved
      addedBy: adminId,
      students: [],
      alumni: []
    });

    await college.save();

    res.status(201).json({
      message: 'College registered successfully',
      college: {
        id: college._id,
        name: college.name,
        email: college.email,
        approved: college.approved
      }
    });
  } catch (error) {
    console.error('Register college error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Approve college (by super admin)
export const approveCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const adminId = req.admin.adminId;

    // Check if admin exists and is superadmin
    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Find and update college
    const college = await College.findByIdAndUpdate(
      collegeId,
      { approved: true },
      { new: true }
    );

    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    res.status(200).json({
      message: 'College approved successfully',
      college: {
        id: college._id,
        name: college.name,
        email: college.email,
        approved: college.approved
      }
    });
  } catch (error) {
    console.error('Approve college error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all colleges (for super admin dashboard)
export const getAllColleges = async (req, res) => {
  try {
    const adminId = req.admin.adminId;

    // Check if admin exists and is superadmin
    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const colleges = await College.find({})
      .select('-passwordHash')
      .populate('addedBy', 'email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      colleges,
      total: colleges.length
    });
  } catch (error) {
    console.error('Get all colleges error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get pending colleges (unapproved)
export const getPendingColleges = async (req, res) => {
  try {
    const adminId = req.admin.adminId;

    // Check if admin exists and is superadmin
    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const pendingColleges = await College.find({ approved: false })
      .select('-passwordHash')
      .populate('addedBy', 'email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      pendingColleges,
      total: pendingColleges.length
    });
  } catch (error) {
    console.error('Get pending colleges error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete college (by super admin)
export const deleteCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const adminId = req.admin.adminId;

    // Check if admin exists and is superadmin
    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const college = await College.findByIdAndDelete(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    res.status(200).json({
      message: 'College deleted successfully'
    });
  } catch (error) {
    console.error('Delete college error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin Logout
export const adminLogout = async (req, res) => {
  try {
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
    });

    res.status(200).json({ message: 'Admin logged out successfully' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const adminId = req.admin.adminId;

    // Check if admin exists and is superadmin
    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Get counts
    const totalColleges = await College.countDocuments();
    const pendingColleges = await College.countDocuments({ approved: false });
    
    // Import Student and Alumni models
    const Student = (await import('../Models/StudentModel.js')).default;
    const Alumni = (await import('../Models/AlumniModel.js')).default;
    
    const totalStudents = await Student.countDocuments();
    const totalAlumni = await Alumni.countDocuments();

    res.status(200).json({
      totalColleges,
      pendingColleges,
      totalStudents,
      totalAlumni
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const adminId = req.admin.adminId;

    // Check if admin exists and is superadmin
    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const Student = (await import('../Models/StudentModel.js')).default;
    
    const students = await Student.find({})
      .select('-passwordHash')
      .populate('college', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      students,
      total: students.length
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all alumni
export const getAllAlumni = async (req, res) => {
  try {
    const adminId = req.admin.adminId;

    // Check if admin exists and is superadmin
    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const Alumni = (await import('../Models/AlumniModel.js')).default;
    
    const alumni = await Alumni.find({})
      .select('-passwordHash')
      .populate('college', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      alumni,
      total: alumni.length
    });
  } catch (error) {
    console.error('Get all alumni error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const adminId = req.admin.adminId;

    // Check if admin exists and is superadmin
    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const Student = (await import('../Models/StudentModel.js')).default;
    
    const student = await Student.findByIdAndDelete(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete alumni
export const deleteAlumni = async (req, res) => {
  try {
    const { alumniId } = req.params;
    const adminId = req.admin.adminId;

    // Check if admin exists and is superadmin
    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const Alumni = (await import('../Models/AlumniModel.js')).default;
    
    const alumni = await Alumni.findByIdAndDelete(alumniId);
    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    res.status(200).json({
      message: 'Alumni deleted successfully'
    });
  } catch (error) {
    console.error('Delete alumni error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 