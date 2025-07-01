import CommunityMessage from '../Models/Community.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import Student from '../Models/StudentModel.js';
import Alumni from '../Models/AlumniModel.js';

// Get community messages based on user role
export const getCommunityMessages = async (req, res) => {
  try {
    const { groupType } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const messages = await CommunityMessage.find({ groupType })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'name email avatar')
      .populate('replies.sender', 'name email avatar');
    
    const total = await CommunityMessage.countDocuments({ groupType });
    
    res.status(200).json({
      success: true,
      messages: messages.reverse(), // Show oldest first
      total,
      hasMore: skip + messages.length < total
    });
  } catch (error) {
    console.error('Error fetching community messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community messages'
    });
  }
};

// Post a new community message
export const postCommunityMessage = async (req, res) => {
  try {
    const { content, messageType = 'text', groupType } = req.body;
    
    if (!content || !groupType) {
      return res.status(400).json({
        success: false,
        message: 'Content and group type are required'
      });
    }

    // Fetch complete user data from database
    let user = await Student.findById(req.user.id);
    let userModel = 'Student';
    
    if (!user) {
      user = await Alumni.findById(req.user.id);
      userModel = 'Alumni';
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const messageData = {
      sender: user._id,
      senderModel: userModel,
      senderName: user.name,
      senderAvatar: user.profilePic || user.avatar || null,
      groupType,
      content,
      messageType
    };
    
    const newMessage = new CommunityMessage(messageData);
    await newMessage.save();
    
    const populatedMessage = await CommunityMessage.findById(newMessage._id)
      .populate('sender', 'name email avatar');
    
    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Error posting community message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post message'
    });
  }
};

// Upload media for community messages
export const uploadCommunityMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const { groupType, messageType } = req.body;

    // Fetch complete user data from database
    let user = await Student.findById(req.user.id);
    let userModel = 'Student';
    
    if (!user) {
      user = await Alumni.findById(req.user.id);
      userModel = 'Alumni';
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'community-media');
    
    let mediaData = {
      fileUrl: result.secure_url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    };
    
    // Generate thumbnail for videos
    if (messageType === 'video' && result.thumbnail_url) {
      mediaData.thumbnailUrl = result.thumbnail_url;
    }
    
    const messageData = {
      sender: user._id,
      senderModel: userModel,
      senderName: user.name,
      senderAvatar: user.profilePic || user.avatar || null,
      groupType,
      content: req.file.originalname,
      messageType,
      mediaData
    };
    
    const newMessage = new CommunityMessage(messageData);
    await newMessage.save();
    
    const populatedMessage = await CommunityMessage.findById(newMessage._id)
      .populate('sender', 'name email avatar');
    
    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Error uploading community media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload media'
    });
  }
};

// Like/unlike a community message
export const toggleLike = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Fetch complete user data from database
    let user = await Student.findById(req.user.id);
    if (!user) {
      user = await Alumni.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const message = await CommunityMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    const existingLikeIndex = message.likes.findIndex(
      like => like.userId.toString() === user._id.toString()
    );
    
    if (existingLikeIndex > -1) {
      // Unlike
      message.likes.splice(existingLikeIndex, 1);
    } else {
      // Like
      message.likes.push({
        userId: user._id,
        userName: user.name
      });
    }
    
    await message.save();
    
    res.status(200).json({
      success: true,
      likes: message.likes
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
};

// Reply to a community message
export const replyToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    // Fetch complete user data from database
    let user = await Student.findById(req.user.id);
    if (!user) {
      user = await Alumni.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }
    
    const message = await CommunityMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    message.replies.push({
      sender: user._id,
      senderName: user.name,
      content
    });
    
    await message.save();
    
    const populatedMessage = await CommunityMessage.findById(messageId)
      .populate('sender', 'name email avatar')
      .populate('replies.sender', 'name email avatar');
    
    res.status(200).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reply to message'
    });
  }
};

// Edit a community message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    // Fetch complete user data from database
    let user = await Student.findById(req.user.id);
    if (!user) {
      user = await Alumni.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }
    
    const message = await CommunityMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }
    
    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    
    await message.save();
    
    const populatedMessage = await CommunityMessage.findById(messageId)
      .populate('sender', 'name email avatar')
      .populate('replies.sender', 'name email avatar');
    
    res.status(200).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message'
    });
  }
};

// Delete a community message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Fetch complete user data from database
    let user = await Student.findById(req.user.id);
    if (!user) {
      user = await Alumni.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const message = await CommunityMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }
    
    await CommunityMessage.findByIdAndDelete(messageId);
    
    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
}; 