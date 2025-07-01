import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'userModel', 
    required: true 
  },
  userModel: { 
    type: String, 
    required: true, 
    enum: ['Student', 'Alumni', 'College'] 
  },
  userName: { type: String, required: true },
  userRole: { type: String, required: true }, // e.g., "Computer Science Student", "Software Engineer"
  userImage: { type: String, default: '' },
  
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  review: { 
    type: String, 
    required: true, 
    maxlength: 500 
  },
  
  isApproved: { 
    type: Boolean, 
    default: false 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  
  // Optional fields for additional context
  category: { 
    type: String, 
    enum: ['mentorship', 'networking', 'career_guidance', 'general', 'platform_experience'],
    default: 'general'
  },
  
  helpfulCount: { 
    type: Number, 
    default: 0 
  },
  
  adminNotes: { 
    type: String 
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
testimonialSchema.index({ isApproved: 1, isFeatured: 1 });
testimonialSchema.index({ userId: 1, userModel: 1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial; 