import mongoose from 'mongoose'

const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  branch: { type: String, required: true },
  graduationYear: { type: Number, required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  profilePic: { type: String, default: '' },

  careerPath: {
    currentPosition: String,
    company: String,
    experienceYears: Number
  },

  socials: {
    linkedin: String,
    github: String,
    twitter: String,
    personalWebsite: String
  },

  skills: [String],
  certifications: [String],

  projects: [
    {
      title: String,
      description: String,
      link: String
    }
  ],

  mentorshipBio: { type: String },
  mentorshipTags: [String], // topics they can mentor in

  availableForMentorship: { type: Boolean, default: true },
  maxStudents: { type: Number, default: 3 },

  role: { type: String, default: 'alumni' },
  isVerified: { type: Boolean, default: true },

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

const Alumni = mongoose.model('Alumni', alumniSchema);
export default Alumni;
