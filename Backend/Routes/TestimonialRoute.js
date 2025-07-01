import express from 'express';
import { 
  createTestimonial,
  getApprovedTestimonials,
  getUserTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getAllTestimonials,
  updateTestimonialStatus,
  getTestimonialStats
} from '../Controller/TestimonialController.js';
import authUser from '../middlewares/authUser.js';
import {authAdmin} from '../middlewares/authAdmin.js';

const testimonialRouter = express.Router();

// Public routes (no authentication required)
testimonialRouter.get('/public', getApprovedTestimonials);

// User routes (authentication required)
testimonialRouter.post('/', authUser, createTestimonial);
testimonialRouter.get('/my-testimonial', authUser, getUserTestimonial);
testimonialRouter.put('/my-testimonial', authUser, updateTestimonial);
testimonialRouter.delete('/my-testimonial', authUser, deleteTestimonial);

// Admin routes (admin authentication required)
testimonialRouter.get('/admin/all', authAdmin, getAllTestimonials);
testimonialRouter.put('/admin/:testimonialId/status', authAdmin, updateTestimonialStatus);
testimonialRouter.get('/admin/stats', authAdmin, getTestimonialStats);

export default testimonialRouter; 