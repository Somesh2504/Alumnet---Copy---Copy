import connectDB from './config/connectDB.js';
import Admin from './Models/Admin.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await connectDB();
    
    // Check if super admin already exists
    const existingAdmin = await Admin.findOne({ role: 'superadmin' });
    if (existingAdmin) {
      console.log('Super admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create super admin
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@alumnet.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
    
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const superAdmin = new Admin({
      email,
      passwordHash,
      role: 'superadmin'
    });

    await superAdmin.save();

    console.log('Super admin created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Please change the password after first login.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin(); 