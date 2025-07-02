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
import { Server } from 'socket.io';
import http from 'http';
import Message from './Models/Message.js';
import CommunityMessage from './Models/Community.js';
import Student from './Models/StudentModel.js';
import Alumni from './Models/AlumniModel.js';

const app = express();
app.use(express.json())
const PORT = process.env.PORT || 5000

app.get('/',(req,res)=>{
    res.send("API is running");
})

app.use(cors({
  origin: "https://alumnet-frontend-c0cg.onrender.com",
  credentials: true,
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

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "https://alumnet-frontend-c0cg.onrender.com",
    credentials: true,
  },
});

// In-memory maps for socket management
const userSocketMap = {};  // userId -> socket.id
const userPeerMap = {};    // userId -> peerId (for PeerJS calls, optional)
const communityRooms = {}; // groupType -> Set of socket.ids

io.on('connection', (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);

  // When user joins: map userId to socket.id and join personal room
  socket.on('join-room', ({ userId }) => {
    userSocketMap[userId] = socket.id;
    socket.join(userId); // for room-based messaging (optional)
    console.log(`🧍 User joined: ${userId}, socket: ${socket.id}`);
  });

  // Join community room
  socket.on('join-community', ({ groupType, userId }) => {
    if (!communityRooms[groupType]) {
      communityRooms[groupType] = new Set();
    }
    communityRooms[groupType].add(socket.id);
    socket.join(`community-${groupType}`);
    console.log(`🏘️ User ${userId} joined community: ${groupType}`);
  });

  // Leave community room
  socket.on('leave-community', ({ groupType, userId }) => {
    if (communityRooms[groupType]) {
      communityRooms[groupType].delete(socket.id);
    }
    socket.leave(`community-${groupType}`);
    console.log(`🏘️ User ${userId} left community: ${groupType}`);
  });

  // Send community message
  socket.on('send-community-message', (message) => {
    const groupType = message.groupType;
    io.to(`community-${groupType}`).emit('new-community-message', message);
    console.log(`🏘️ Community message sent to ${groupType}: ${message.content.substring(0, 50)}...`);
  });

  // Update message likes
  socket.on('update-message-likes', ({ messageId, likes }) => {
    // Broadcast to all community rooms (both students and alumni)
    io.to('community-students').to('community-alumni').emit('message-updated', { _id: messageId, likes });
    console.log(`👍 Message likes updated: ${messageId}`);
  });

  // Update message replies
  socket.on('update-message-replies', ({ messageId, message }) => {
    // Broadcast to all community rooms
    io.to('community-students').to('community-alumni').emit('message-updated', message);
    console.log(`💬 Message replies updated: ${messageId}`);
  });

  // Update message (edit)
  socket.on('update-message', (message) => {
    // Broadcast to all community rooms
    io.to('community-students').to('community-alumni').emit('message-updated', message);
    console.log(`✏️ Message updated: ${message._id}`);
  });

  // Delete message
  socket.on('delete-message', (messageId) => {
    // Broadcast to all community rooms
    io.to('community-students').to('community-alumni').emit('message-deleted', messageId);
    console.log(`🗑️ Message deleted: ${messageId}`);
  });

  // 💬 Messaging handler
  socket.on('send-message', async ({ to, message, timestamp, fileData, senderId }) => {
    try {
      // Save message to database first
      let sender = await Student.findById(senderId);
      let senderModel = 'Student';
      if (!sender) {
        sender = await Alumni.findById(senderId);
        senderModel = 'Alumni';
      }

      let receiver = await Student.findById(to);
      let receiverModel = 'Student';
      if (!receiver) {
        receiver = await Alumni.findById(to);
        receiverModel = 'Alumni';
      }

      if (!sender || !receiver) {
        console.log(`⚠️ Sender or receiver not found`);
        return;
      }

      // Create and save message
      const newMessage = new Message({
        sender: senderId,
        receiver: to,
        senderModel,
        receiverModel,
        content: message,
        messageType: fileData ? 'file' : 'text',
        fileData: fileData || null
      });

      await newMessage.save();
      console.log(`💾 Message saved to database: ${newMessage._id}`);

      // Try to send via socket if user is online
      const targetSocketId = userSocketMap[to];
      if (targetSocketId) {
        io.to(targetSocketId).emit('receive-message', {
          from: senderId,
          message,
          timestamp,
          fileData,
          messageId: newMessage._id
        });
        console.log(`💬 Message sent from ${senderId} to ${to} (online)${fileData ? ' (with file)' : ''}`);
      } else {
        console.log(`💬 Message saved for offline user ${to}${fileData ? ' (with file)' : ''}`);
      }

      // Emit confirmation to sender
      socket.emit('message-sent', {
        messageId: newMessage._id,
        timestamp: newMessage.createdAt
      });

    } catch (error) {
      console.error('Error saving/sending message:', error);
      socket.emit('message-error', {
        error: 'Failed to send message'
      });
    }
  });

  // 📡 Register PeerJS ID for WebRTC (optional, if using PeerJS)
  socket.on('register-peer', ({ userId, peerId }) => {
    userPeerMap[userId] = peerId;
    console.log(`📡 Registered Peer ID for ${userId}: ${peerId}`);
  });

  // 🔍 Provide target user's PeerJS ID to initiator (optional)
  socket.on('request-peer-id', ({ receiverId }) => {
    const peerId = userPeerMap[receiverId];
    socket.emit('receive-peer-id', { peerId: peerId || null });
    console.log(`📞 Peer ID for ${receiverId}: ${peerId || 'Not found'}`);
  });

  // ======= WebRTC Signaling Handlers for Voice/Video Call =======

  // User A calls User B, sending an offer SDP
  socket.on('call-user', ({ to, offer }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-made', { from: socket.id, offer });
      console.log(`📞 Call offer sent from ${socket.id} to ${targetSocketId}`);
    } else {
      console.log(`⚠️ Target user ${to} not connected for call`);
    }
  });

  // User B answers User A's call with an answer SDP
  socket.on('make-answer', ({ to, answer }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('answer-made', { from: socket.id, answer });
      console.log(`📞 Call answer sent from ${socket.id} to ${targetSocketId}`);
    } else {
      console.log(`⚠️ Target user ${to} not connected for answer`);
    }
  });

  // ICE candidates exchanged between peers
  socket.on('ice-candidate', ({ to, candidate }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice-candidate', { from: socket.id, candidate });
      // Optional: you can log or ignore ICE candidate logs as they can be verbose
    } else {
      console.log(`⚠️ Target user ${to} not connected for ICE candidate`);
    }
  });

  // ❌ Handle disconnection and cleanup
  socket.on('disconnect', () => {
    console.log(`❌ Disconnected: ${socket.id}`);

    // Cleanup from userSocketMap
    for (const [userId, sockId] of Object.entries(userSocketMap)) {
      if (sockId === socket.id) {
        delete userSocketMap[userId];
        console.log(`🧹 Removed ${userId} from socket map`);
        break;
      }
    }

    // Cleanup from userPeerMap
    for (const [userId, peerId] of Object.entries(userPeerMap)) {
      if (peerId === socket.id) {
        delete userPeerMap[userId];
        console.log(`🧹 Removed ${userId} from peer map`);
        break;
      }
    }

    // Cleanup from community rooms
    for (const [groupType, socketSet] of Object.entries(communityRooms)) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);
        console.log(`🧹 Removed socket from community: ${groupType}`);
        if (socketSet.size === 0) {
          delete communityRooms[groupType];
        }
      }
    }
  });
});

// Start the combined server
server.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Combined server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for real-time connections`);
}); 