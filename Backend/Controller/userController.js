import Alumni from "../Models/AlumniModel.js";
import Student from "../Models/StudentModel.js";
import Message from "../Models/Message.js";
import {v2 as cloudinary} from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const fetchUser = async (req, res) => {
  try {
    console.log("fetchUser called with user:", req.user);
    
    let user = null;
    
    // Check if user has a role in the token
    if (req.user.role) {
      // If role is specified, fetch from the appropriate collection
      if (req.user.role === 'alumni') {
        user = await Alumni.findById(req.user.id);
      } else if (req.user.role === 'student') {
        user = await Student.findById(req.user.id);
      }
    } else {
      // Fallback: try both collections and determine based on which one has data
      const student = await Student.findById(req.user.id);
      const alumni = await Alumni.findById(req.user.id);
      
      if (student && alumni) {
        // If both exist, prefer the one with more complete data
        user = alumni;
        console.log("Both student and alumni found, using alumni data");
      } else if (student) {
        user = student;
        console.log("Student found");
      } else if (alumni) {
        user = alumni;
        console.log("Alumni found");
      }
    }
    
    if (!user) {
      console.log("No user found in database");
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("Returning user data:", {
      id: user._id,
      name: user.name,
      role: user.role,
      email: user.email
    });
    
    return res.status(200).json({ message: "get successful", user: user });
  } catch (error) {
    console.log("server error in user fetching ", error);
    return res.status(400).json({ message: "server error in user fetching" });
  }
};

export const fetchUserById = async (req, res) => {
  console.log("fetch user by id is called ...... *******************")
  try {
    const { userId } = req.params;
    console.log('fetchUserById called with userId:', userId);
    
    // Try to find user in both Student and Alumni collections
    let user = await Student.findById(userId)
     if(!user){
      user = await Alumni.findById(userId)
     }
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return only necessary user information for chat
    const userInfo = {
      _id: user._id,
      name: user.name,
      profilePic: user.profilePic || null,
      status: 'Available' // You can add online status logic here
    };
    
    console.log('Returning user info:', userInfo);
    return res.status(200).json({ 
      message: "User fetched successfully", 
      user: userInfo 
    });
  } catch (error) {
    console.log("server error in user fetching by ID ", error);
    return res.status(400).json({ message: "server error in user fetching by ID" });
  }
};

export const updateChatHistory = async (req, res) => {
  try {
    const { userId, chatWithId } = req.body;

    let user = await Student.findById(userId) || await Alumni.findById(userId);
    // console.log("user", user);
    if (!user) return res.status(404).json({ message: "User not found" });

    let chatuser = await Student.findById(chatWithId) || await Alumni.findById(chatWithId);
    if (!chatuser) return res.status(404).json({ message: "Chat partner not found" });
    // console.log("chatuser", chatuser);
    user.chatHistory = user.chatHistory || [];

    user.chatHistory = user.chatHistory.filter(
      chat => chat.userId.toString() !== chatWithId
    );

    user.chatHistory.unshift({
      userId: chatWithId,
      userName: chatuser.name,
      lastMessageAt: new Date()
    });

    await user.save();

    return res.status(200).json({
      message: "Chat history updated successfully",
      chatHistory: user.chatHistory
    });

  } catch (error) {
    console.error("Error updating chat history:", error);
    return res.status(500).json({ message: "Server error updating chat history" });
  }
};

// Upload file for chat messages
export const uploadChatFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const file = req.file;
    const fileType = file.mimetype;
    
    // Determine resource type based on file type
    let resourceType = 'auto';
    if (fileType.startsWith('image/')) {
      resourceType = 'image';
    } else if (fileType.startsWith('video/')) {
      resourceType = 'video';
    } else if (fileType.includes('pdf') || fileType.includes('document')) {
      resourceType = 'raw';
    }

    // Upload to Cloudinary
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'chat-files',
            resource_type: resourceType,
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'mp4', 'mov', 'avi'],
            transformation: resourceType === 'image' ? [
              { width: 800, height: 600, crop: 'limit' }
            ] : undefined
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    res.status(200).json({
      success: true,
      fileUrl: result.secure_url,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload file' 
    });
  }
};

// Save message to database
export const saveMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content, messageType = 'text', fileData = null } = req.body;

    // Determine sender and receiver models
    let sender = await Student.findById(senderId);
    let senderModel = 'Student';
    if (!sender) {
      sender = await Alumni.findById(senderId);
      senderModel = 'Alumni';
    }
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    let receiver = await Student.findById(receiverId);
    let receiverModel = 'Student';
    if (!receiver) {
      receiver = await Alumni.findById(receiverId);
      receiverModel = 'Alumni';
    }
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Create new message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      senderModel,
      receiverModel,
      content,
      messageType,
      fileData
    });

    await message.save();

    // Update chat history for both users
    await updateChatHistoryForUser(senderId, receiverId, receiver.name);
    await updateChatHistoryForUser(receiverId, senderId, sender.name);

    return res.status(201).json({
      message: "Message saved successfully",
      savedMessage: message
    });

  } catch (error) {
    console.error("Error saving message:", error);
    return res.status(500).json({ message: "Server error saving message" });
  }
};

// Get conversation messages
export const getConversationMessages = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    console.log('getConversationMessages called with:', { userId, otherUserId, page, limit });

    // Validate users exist
    let user = await Student.findById(userId) || await Alumni.findById(userId);
    let otherUser = await Student.findById(otherUserId) || await Alumni.findById(otherUserId);
    
    console.log('Users found:', { user: user ? 'Yes' : 'No', otherUser: otherUser ? 'Yes' : 'No' });
    
    if (!user || !otherUser) {
      console.log('One or both users not found in database');
      return res.status(404).json({ message: "User not found" });
    }

    // Get messages between these two users
    const skip = (page - 1) * limit;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'name profilePic')
      .populate('receiver', 'name profilePic');

    console.log('Messages found:', messages.length);

    // Get total count
    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    });

    return res.status(200).json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: skip + messages.length < totalMessages
      }
    });

  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    return res.status(500).json({ message: "Server error fetching messages" });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    // Mark all unread messages from other user as read
    const result = await Message.updateMany(
      {
        receiver: userId,
        sender: otherUserId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    return res.status(200).json({
      message: "Messages marked as read",
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res.status(500).json({ message: "Server error marking messages as read" });
  }
};

// Get unread message count
export const getUnreadMessageCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false
    });

    return res.status(200).json({
      unreadCount
    });

  } catch (error) {
    console.error("Error getting unread message count:", error);
    return res.status(500).json({ message: "Server error getting unread count" });
  }
};

// Helper function to update chat history
const updateChatHistoryForUser = async (userId, chatWithId, chatWithName) => {
  try {
    let user = await Student.findById(userId) || await Alumni.findById(userId);
    if (!user) return;

    user.chatHistory = user.chatHistory || [];
    
    // Remove existing entry for this user
    user.chatHistory = user.chatHistory.filter(
      chat => chat.userId.toString() !== chatWithId
    );

    // Add to beginning of array
    user.chatHistory.unshift({
      userId: chatWithId,
      userName: chatWithName,
      lastMessageAt: new Date()
    });

    await user.save();
  } catch (error) {
    console.error("Error updating chat history:", error);
  }
};

