import mongoose from 'mongoose'

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // login email
  passwordHash: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  website: { type: String },
  description: { type: String },
  approved: { type: Boolean, default: false },
  addedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin',
    required: false
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentRecord'
  }],
  alumni: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AlumniRecord'
  }]
}, { timestamps: true });

const College = mongoose.model('College', collegeSchema);

export default College 