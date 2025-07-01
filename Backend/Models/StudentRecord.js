import mongoose from 'mongoose'

const studentRecordSchema = new mongoose.Schema({
  collegeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'College',
    required: true 
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  year: { type: Number, required: true },
  role: { 
    type: String, 
    enum: ['student', 'alumni'],
    required: true,
    default:'student'

  },
}, { timestamps: true });

const StudentRecord = mongoose.model('StudentRecord', studentRecordSchema);

export default StudentRecord 