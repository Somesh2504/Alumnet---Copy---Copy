import express from 'express'
import { getAlumni, loginAlumni, registerAlumni, sendVerificationOTP, verifyOTPAndRegister, getAlumniById } from '../Controller/AlumniController.js'
import authUser from '../middlewares/authUser.js'
import { upload } from '../config/storage.js'
const alumniRouter = express.Router()

alumniRouter.get('/',authUser,getAlumni)
alumniRouter.get('/:id', getAlumniById)

// New secure registration flow with OTP
alumniRouter.post('/send-otp', sendVerificationOTP);
alumniRouter.post('/verify-otp-register', upload.single('profilePicture'), verifyOTPAndRegister);

// Legacy routes (keeping for backward compatibility)
alumniRouter.post('/register',upload.single('profilePicture'),registerAlumni)
alumniRouter.post('/login',loginAlumni)

export default alumniRouter
