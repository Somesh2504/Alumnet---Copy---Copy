import mongoose from 'mongoose';

const communityMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel',
    required: true
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Student', 'Alumni']
  },
  senderName: {
    type: String,
    required: true
  },
  senderAvatar: {
    type: String,
    default: null
  },
  groupType: {
    type: String,
    enum: ['students', 'alumni'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'file'],
    default: 'text'
  },
  mediaData: {
    fileUrl: String,
    fileName: String,
    fileType: String,
    fileSize: Number,
    thumbnailUrl: String
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'senderModel'
    },
    userName: String
  }],
  replies: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'senderModel'
    },
    senderName: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
communityMessageSchema.index({ groupType: 1, createdAt: -1 });
communityMessageSchema.index({ sender: 1, createdAt: -1 });

const CommunityMessage = mongoose.model('CommunityMessage', communityMessageSchema);

export default CommunityMessage; 