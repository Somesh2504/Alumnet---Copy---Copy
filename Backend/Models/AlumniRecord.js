import mongoose from 'mongoose'

const alumniRecordSchema = new mongoose.Schema({
  collegeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'College',
    required: true 
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  passoutyear: { type: Number, required: true },
  role: { 
    type: String, 
    enum: ['student', 'alumni'], 
    required: true 
  }
}, { timestamps: true });

const AlumniRecord = mongoose.model('AlumniRecord', alumniRecordSchema);

export default AlumniRecord 