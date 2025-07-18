import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'superadmin' }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

export default Admin
