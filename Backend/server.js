import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/connectDB.js';
import studentRouter from './Routes/StudentRoute.js';
import alumniRouter from './Routes/AlumniRoute.js';
import adminRouter from './Routes/AdminRoute.js';
import collegeRouter from './Routes/CollegeRoute.js';
import testimonialRouter from './Routes/TestimonialRoute.js';
import communityRouter from './Routes/CommunityRoute.js';
import cors from 'cors'
import cookieParser from "cookie-parser";
import { 
  fetchUser,  
  updateChatHistory, 
  uploadChatFile,
  saveMessage,
  getConversationMessages,
  markMessagesAsRead,
  getUnreadMessageCount,
  fetchUserById
} from './Controller/userController.js';
import authUser from './middlewares/authUser.js';
import { upload } from './config/storage.js';
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app=express();
app.use(express.json())
const PORT=process.env.PORT || 5000

app.get('/',(req,res)=>{
    res.send("API is running");
})


app.use(cors({
  origin: ["https://alumnet-frontend-c0cg.onrender.com", "http://localhost:5173", "http://localhost:3000","https://alumnet-frontend.onrender.com"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(cookieParser());

// API Routes
app.use('/api/student', studentRouter)
app.use('/api/alumni', alumniRouter)
app.use('/api/admin', adminRouter)
app.use('/api/college', collegeRouter)
app.use('/api/testimonials', testimonialRouter)
app.use('/api/community', communityRouter)

app.get('/api/user/', authUser, fetchUser)
app.get('/api/user/:userId', authUser, fetchUserById)
app.post('/api/user/updateChatHistory', authUser, updateChatHistory);
app.post('/api/chat/upload-file', authUser, upload.single('file'), uploadChatFile);

// Message routes
app.post('/api/messages/save', authUser, saveMessage);
app.get('/api/messages/conversation/:userId/:otherUserId', authUser, getConversationMessages);
app.put('/api/messages/read/:userId/:otherUserId', authUser, markMessagesAsRead);
app.get('/api/messages/unread/:userId', authUser, getUnreadMessageCount);

if (process.env.NODE_ENV === "production") {
  app.use(helmet());
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  }));
}

// Instead, just connect to database and export app
connectDB();
console.log(`API server configured for port ${PORT}`);

export default app
