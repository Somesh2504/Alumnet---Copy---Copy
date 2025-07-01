import express from 'express';
import authUser from '../middlewares/authUser.js';
import { upload } from '../config/storage.js';
import {
  getCommunityMessages,
  postCommunityMessage,
  uploadCommunityMedia,
  toggleLike,
  replyToMessage,
  editMessage,
  deleteMessage
} from '../Controller/CommunityController.js';

const router = express.Router();

// Get community messages
router.get('/messages/:groupType', authUser, getCommunityMessages);

// Post text message
router.post('/messages', authUser, postCommunityMessage);

// Upload media (images, videos, files)
router.post('/upload-media', authUser, upload.single('file'), uploadCommunityMedia);

// Like/unlike message
router.put('/messages/:messageId/like', authUser, toggleLike);

// Reply to message
router.post('/messages/:messageId/reply', authUser, replyToMessage);

// Edit message
router.put('/messages/:messageId', authUser, editMessage);

// Delete message
router.delete('/messages/:messageId', authUser, deleteMessage);

export default router; 