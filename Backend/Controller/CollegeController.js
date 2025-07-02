import College from '../Models/College.js';
import StudentRecord from '../Models/StudentRecord.js';
import AlumniRecord from '../Models/AlumniRecord.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Public College Registration (no authentication required)
export const publicCollegeRegistration = async (req, res) => {
  try {
    const { name, email, password, address, phone, website, description } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if college email already exists
    const existingCollege = await College.findOne({ email });
    if (existingCollege) {
      return res.status(400).json({ message: 'College with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new college (initially unapproved)
    const college = new College({
      name,
      email,
      passwordHash,
      address,
      phone,
      website,
      description,
      approved: false, // Initially unapproved
      addedBy: null // No admin added it yet
    });

    await college.save();

    res.status(201).json({
      message: 'College registration submitted successfully! Please wait for admin approval.',
      college: {
        id: college._id,
        name: college.name,
        email: college.email,
        approved: college.approved
      }
    });
  } catch (error) {
    console.error('Public college registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// College Login
export const collegeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find college by email
    const college = await College.findOne({ email });
    if (!college) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if college is approved
    if (!college.approved) {
      return res.status(403).json({ message: 'College account is pending approval' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, college.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: college._id, email: college.email, role: 'college' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('collegeToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
    });

    res.status(200).json({
      message: 'College login successful',
      college: {
        id: college._id,
        name: college.name,
        email: college.email,
        approved: college.approved
      }
    });
  } catch (error) {
    console.error('College login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get college dashboard data
export const getCollegeDashboard = async (req, res) => {
  try {
    const collegeId = req.college.id;

    // Get college details
    const college = await College.findById(collegeId).select('-passwordHash');
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Get student records count
    const studentRecordsCount = await StudentRecord.countDocuments({ collegeId });
    
    // Get alumni records count
    const alumniRecordsCount = await AlumniRecord.countDocuments({ collegeId });

    // Get recent records
    const recentStudentRecords = await StudentRecord.find({ collegeId })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentAlumniRecords = await AlumniRecord.find({ collegeId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      college,
      stats: {
        totalStudents: studentRecordsCount,
        totalAlumni: alumniRecordsCount
      },
      recentRecords: {
        students: recentStudentRecords,
        alumni: recentAlumniRecords
      }
    });
  } catch (error) {
    console.error('Get college dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add student record (by college)
export const addStudentRecord = async (req, res) => {
  try {
    const collegeId = req.college.id;
    const { name, email, branch, year, role } = req.body;

    // Validate required fields
    if (!name || !email || !branch || !year) {
      return res.status(400).json({ message: 'Name, email, branch, and year are required' });
    }

    // Check if email already exists in records
    const existingStudentRecord = await StudentRecord.findOne({ email });
    const existingAlumniRecord = await AlumniRecord.findOne({ email });
    
    if (existingStudentRecord || existingAlumniRecord) {
      return res.status(400).json({ message: 'Email already exists in records' });
    }

    // Create new student record
    const studentRecord = new StudentRecord({
      collegeId,
      name,
      email,
      branch,
      year: parseInt(year),
      role: role || 'student'
    });

    await studentRecord.save();

    res.status(201).json({
      message: 'Student record added successfully',
      record: studentRecord
    });
  } catch (error) {
    console.error('Add student record error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add alumni record (by college)
export const addAlumniRecord = async (req, res) => {
  try {
    const collegeId = req.college.id;
    const { name, email, branch, passoutyear, role } = req.body;

    // Validate required fields
    if (!name || !email || !branch || !passoutyear) {
      return res.status(400).json({ message: 'Name, email, branch, and passout year are required' });
    }

    // Convert passoutyear to number and validate
    const passoutYearNum = parseInt(passoutyear);
    if (isNaN(passoutYearNum) || passoutYearNum < 1900 || passoutYearNum > new Date().getFullYear()) {
      return res.status(400).json({ message: 'Invalid passout year' });
    }

    // Check if email already exists in records
    const existingStudentRecord = await StudentRecord.findOne({ email });
    const existingAlumniRecord = await AlumniRecord.findOne({ email });
    
    if (existingStudentRecord || existingAlumniRecord) {
      return res.status(400).json({ message: 'Email already exists in records' });
    }

    // Create new alumni record
    const alumniRecord = new AlumniRecord({
      collegeId,
      name,
      email,
      branch,
      passoutyear: passoutYearNum,
      role: role || 'alumni'
    });

    await alumniRecord.save();

    res.status(201).json({
      message: 'Alumni record added successfully',
      record: alumniRecord
    });
  } catch (error) {
    console.error('Add alumni record error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Bulk upload student records (CSV/Excel)
export const bulkUploadStudentRecords = async (req, res) => {
  try {
    const collegeId = req.college.id;
    const { records } = req.body; // Array of student records

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'Invalid records data' });
    }

    const results = {
      success: [],
      errors: []
    };

    for (const record of records) {
      try {
        const { name, email, branch, year, role } = record;

        // Validate required fields
        if (!name || !email || !branch || !year) {
          results.errors.push({ email, error: 'Missing required fields' });
          continue;
        }

        // Check if email already exists
        const existingStudentRecord = await StudentRecord.findOne({ email });
        const existingAlumniRecord = await AlumniRecord.findOne({ email });
        
        if (existingStudentRecord || existingAlumniRecord) {
          results.errors.push({ email, error: 'Email already exists' });
          continue;
        }

        // Create new record
        const studentRecord = new StudentRecord({
          collegeId,
          name,
          email,
          branch,
          year,
          role: role || 'student'
        });

        await studentRecord.save();
        results.success.push({ email, name });

      } catch (error) {
        results.errors.push({ email: record.email, error: error.message });
      }
    }

    res.status(200).json({
      message: 'Bulk upload completed',
      results
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all student records for college
export const getStudentRecords = async (req, res) => {
  try {
    const collegeId = req.college.id;
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = { collegeId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { branch: { $regex: search, $options: 'i' } }
      ];
    }

    const records = await StudentRecord.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StudentRecord.countDocuments(query);

    res.status(200).json({
      records,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get student records error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all alumni records for college
export const getAlumniRecords = async (req, res) => {
  try {
    const collegeId = req.college.id;
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = { collegeId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { branch: { $regex: search, $options: 'i' } }
      ];
    }

    const records = await AlumniRecord.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AlumniRecord.countDocuments(query);

    res.status(200).json({
      records,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get alumni records error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete student record
export const deleteStudentRecord = async (req, res) => {
  try {
    const collegeId = req.college.id;
    const { recordId } = req.params;

    const record = await StudentRecord.findOneAndDelete({
      _id: recordId,
      collegeId
    });

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.status(200).json({
      message: 'Student record deleted successfully'
    });
  } catch (error) {
    console.error('Delete student record error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete alumni record
export const deleteAlumniRecord = async (req, res) => {
  try {
    const collegeId = req.college.id;
    const { recordId } = req.params;

    const record = await AlumniRecord.findOneAndDelete({
      _id: recordId,
      collegeId
    });

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.status(200).json({
      message: 'Alumni record deleted successfully'
    });
  } catch (error) {
    console.error('Delete alumni record error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// College Logout
export const collegeLogout = async (req, res) => {
  try {
    res.clearCookie('collegeToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
    });

    res.status(200).json({ message: 'College logged out successfully' });
  } catch (error) {
    console.error('College logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 