import express from 'express';
import { 
  registerStudent, 
  loginStudent, 
  getStudents,
  sendVerificationOTP,
  verifyOTPAndRegister,
  getStudentById
} from '../Controller/StudentController.js';
import authUser from '../middlewares/authUser.js';
import { upload } from '../config/storage.js';

const studentRouter = express.Router();

// New secure registration flow
studentRouter.post('/send-otp', sendVerificationOTP);
studentRouter.post('/verify-otp-register', upload.single('profilePicture'), verifyOTPAndRegister);

// Legacy routes (keeping for backward compatibility)
studentRouter.post('/register', registerStudent);
studentRouter.post('/login', loginStudent);
studentRouter.get('/', authUser, getStudents);
studentRouter.get('/:id', getStudentById);

export default studentRouter;