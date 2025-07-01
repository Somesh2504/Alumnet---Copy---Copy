import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  branch: { type: String, required: true },
  year: { type: Number, required: true }, // 2 for 2nd year, 3 for 3rd

  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: false },
  profilePic: { type: String, default: '' },

  skills: [String],
  gpa: { type: Number, min: 0, max: 10 },

  resumeLink: { type: String },
  socials: {
    github: String,
    linkedin: String,
    portfolio: String
  },

  projects: [
    {
      title: String,
      description: String,
      techStack: [String],
      link: String
    }
  ],

  achievements: [String],
  interests: [String], // for mentorship matching

  preferredMentorCriteria: {
    branch: String,
    minExperience: Number
  },

  role: { type: String, default: 'student' },
  isVerified: { type: Boolean, default: false },

  chatHistory: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      userName: { type: String },
      lastMessageAt: Date
    }
  ],

  callsHistory: [
    {
      withUserId: mongoose.Schema.Types.ObjectId,
      timestamp: Date,
      duration: Number
    }
  ]
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;
