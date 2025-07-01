import Testimonial from '../Models/Testimonial.js';
import Student from '../Models/StudentModel.js';
import AlumniModel from '../Models/AlumniModel.js';
import College from '../Models/College.js';

// Create a new testimonial
export const createTestimonial = async (req, res) => {
  try {
    const { rating, review, category } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Determine user model based on role
    let userModel;
    let user;
    
    switch (userRole) {
      case 'student':
        userModel = 'Student';
        user = await Student.findById(userId);
        break;
      case 'alumni':
        userModel = 'Alumni';
        user = await AlumniModel.findById(userId);
        break;
      case 'college':
        userModel = 'College';
        user = await College.findById(userId);
        break;
      default:
        return res.status(400).json({ message: 'Invalid user role' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has already submitted a testimonial
    const existingTestimonial = await Testimonial.findOne({ 
      userId, 
      userModel 
    });

    if (existingTestimonial) {
      return res.status(400).json({ 
        message: 'You have already submitted a testimonial. You can update your existing one.' 
      });
    }

    // Create user role display string
    let userRoleDisplay;
    if (userRole === 'student') {
      userRoleDisplay = `${user.branch} Student (Year ${user.year})`;
    } else if (userRole === 'alumni') {
      userRoleDisplay = `${user.designation} at ${user.company}`;
    } else {
      userRoleDisplay = `${user.name} College`;
    }

    const testimonial = new Testimonial({
      userId,
      userModel,
      userName: user.name,
      userRole: userRoleDisplay,
      userImage: user.profilePic || '',
      rating,
      review,
      category: category || 'general'
    });

    await testimonial.save();

    res.status(201).json({
      success: true,
      message: 'Testimonial submitted successfully! It will be reviewed by our team.',
      testimonial
    });

  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get all approved testimonials (for public display)
export const getApprovedTestimonials = async (req, res) => {
  try {
    const { category, limit = 10, featured = false } = req.query;
    
    let query = { isApproved: true };
    
    if (category) {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const testimonials = await Testimonial.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('-adminNotes');

    res.status(200).json({
      success: true,
      testimonials
    });

  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get user's own testimonial
export const getUserTestimonial = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let userModel;
    switch (userRole) {
      case 'student':
        userModel = 'Student';
        break;
      case 'alumni':
        userModel = 'Alumni';
        break;
      case 'college':
        userModel = 'College';
        break;
      default:
        return res.status(400).json({ message: 'Invalid user role' });
    }

    const testimonial = await Testimonial.findOne({ 
      userId, 
      userModel 
    });

    res.status(200).json({
      success: true,
      testimonial
    });

  } catch (error) {
    console.error('Error fetching user testimonial:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Update user's testimonial
export const updateTestimonial = async (req, res) => {
  try {
    const { rating, review, category } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    let userModel;
    switch (userRole) {
      case 'student':
        userModel = 'Student';
        break;
      case 'alumni':
        userModel = 'Alumni';
        break;
      case 'college':
        userModel = 'College';
        break;
      default:
        return res.status(400).json({ message: 'Invalid user role' });
    }

    const testimonial = await Testimonial.findOne({ 
      userId, 
      userModel 
    });

    if (!testimonial) {
      return res.status(404).json({ 
        message: 'Testimonial not found' 
      });
    }

    // Update fields
    if (rating !== undefined) testimonial.rating = rating;
    if (review !== undefined) testimonial.review = review;
    if (category !== undefined) testimonial.category = category;
    
    // Reset approval status when updated
    testimonial.isApproved = false;

    await testimonial.save();

    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully! It will be reviewed again.',
      testimonial
    });

  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Delete user's testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let userModel;
    switch (userRole) {
      case 'student':
        userModel = 'Student';
        break;
      case 'alumni':
        userModel = 'Alumni';
        break;
      case 'college':
        userModel = 'College';
        break;
      default:
        return res.status(400).json({ message: 'Invalid user role' });
    }

    const testimonial = await Testimonial.findOneAndDelete({ 
      userId, 
      userModel 
    });

    if (!testimonial) {
      return res.status(404).json({ 
        message: 'Testimonial not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Admin: Get all testimonials (including pending)
export const getAllTestimonials = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (status === 'pending') {
      query.isApproved = false;
    } else if (status === 'approved') {
      query.isApproved = true;
    }
    
    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const testimonials = await Testimonial.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Testimonial.countDocuments(query);

    res.status(200).json({
      success: true,
      testimonials,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Admin: Approve/Reject testimonial
export const updateTestimonialStatus = async (req, res) => {
  try {
    const { testimonialId } = req.params;
    const { isApproved, isFeatured, adminNotes } = req.body;

    const testimonial = await Testimonial.findById(testimonialId);

    if (!testimonial) {
      return res.status(404).json({ 
        message: 'Testimonial not found' 
      });
    }

    if (isApproved !== undefined) testimonial.isApproved = isApproved;
    if (isFeatured !== undefined) testimonial.isFeatured = isFeatured;
    if (adminNotes !== undefined) testimonial.adminNotes = adminNotes;

    await testimonial.save();

    res.status(200).json({
      success: true,
      message: 'Testimonial status updated successfully',
      testimonial
    });

  } catch (error) {
    console.error('Error updating testimonial status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get testimonial statistics
export const getTestimonialStats = async (req, res) => {
  try {
    const totalTestimonials = await Testimonial.countDocuments();
    const approvedTestimonials = await Testimonial.countDocuments({ isApproved: true });
    const pendingTestimonials = await Testimonial.countDocuments({ isApproved: false });
    const featuredTestimonials = await Testimonial.countDocuments({ isFeatured: true });

    const avgRating = await Testimonial.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const categoryStats = await Testimonial.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]); 

    res.status(200).json({
      success: true,
      stats: {
        total: totalTestimonials,
        approved: approvedTestimonials,
        pending: pendingTestimonials,
        featured: featuredTestimonials,
        averageRating: avgRating[0]?.avgRating || 0,
        categoryStats
      }
    });

  } catch (error) {
    console.error('Error fetching testimonial stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}; 