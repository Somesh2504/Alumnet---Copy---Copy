import express from 'express';
import {
  adminLogin,
  adminLogout,
  registerCollege,
  approveCollege,
  getAllColleges,
  getPendingColleges,
  deleteCollege,
  getDashboardStats,
  getAllStudents,
  getAllAlumni,
  deleteStudent,
  deleteAlumni
} from '../Controller/AdminController.js';
import { authAdmin } from '../middlewares/authAdmin.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected routes (require admin authentication)
router.post('/logout', authAdmin, adminLogout);
router.get('/dashboard-stats', authAdmin, getDashboardStats);
router.post('/register-college', authAdmin, registerCollege);
router.put('/approve-college/:collegeId', authAdmin, approveCollege);
router.get('/colleges', authAdmin, getAllColleges);
router.get('/pending-colleges', authAdmin, getPendingColleges);
router.delete('/college/:collegeId', authAdmin, deleteCollege);
router.get('/students', authAdmin, getAllStudents);
router.get('/alumni', authAdmin, getAllAlumni);
router.delete('/student/:studentId', authAdmin, deleteStudent);
router.delete('/alumni/:alumniId', authAdmin, deleteAlumni);

export default router; 