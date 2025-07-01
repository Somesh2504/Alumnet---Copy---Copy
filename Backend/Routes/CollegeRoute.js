import express from 'express';
import {
  publicCollegeRegistration,
  collegeLogin,
  collegeLogout,
  getCollegeDashboard,
  addStudentRecord,
  addAlumniRecord,
  bulkUploadStudentRecords,
  getStudentRecords,
  getAlumniRecords,
  deleteStudentRecord,
  deleteAlumniRecord
} from '../Controller/CollegeController.js';
import { authCollege } from '../middlewares/authCollege.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', publicCollegeRegistration);
router.post('/login', collegeLogin);

// Protected routes (require college authentication)
router.post('/logout', authCollege, collegeLogout);
router.get('/dashboard', authCollege, getCollegeDashboard);

// Student records management
router.post('/student-record', authCollege, addStudentRecord);
router.post('/bulk-upload-students', authCollege, bulkUploadStudentRecords);
router.get('/student-records', authCollege, getStudentRecords);
router.delete('/student-record/:recordId', authCollege, deleteStudentRecord);

// Alumni records management
router.post('/alumni-record', authCollege, addAlumniRecord);
router.get('/alumni-records', authCollege, getAlumniRecords);
router.delete('/alumni-record/:recordId', authCollege, deleteAlumniRecord);

export default router; 