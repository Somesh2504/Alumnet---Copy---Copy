import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'receiverModel',
    required: true
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Student', 'Alumni']
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['Student', 'Alumni']
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image'],
    default: 'text'
  },
  fileData: {
    fileUrl: String,
    fileName: String,
    fileType: String,
    fileSize: Number
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Virtual for conversationId
messageSchema.virtual('conversationId').get(function() {
  const ids = [this.sender.toString(), this.receiver.toString()].sort();
  return `${ids[0]}-${ids[1]}`;
});

// Ensure virtual fields are serialized
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

// Compound index for efficient querying of conversations
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message; 