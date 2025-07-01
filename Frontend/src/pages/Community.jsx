import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import PageTransition from '../components/PageTransition';
import axios from 'axios';
import socket from '../socket';
import './Community.css';

const Community = () => {
  const { currentUser, baseURL } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const groupType = currentUser?.role === 'student' ? 'students' : 'alumni';
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only scroll to bottom if it's not the initial load
    if (!isInitialLoad) {
      scrollToBottom();
    }
  }, [messages, isInitialLoad]);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}api/community/messages/${groupType}`, {
        withCredentials: true
      });
      setMessages(response.data.messages);
      // Mark initial load as complete after messages are fetched
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setIsInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMessages();
    }
  }, [currentUser, groupType]);

  // Socket connection for real-time messages
  useEffect(() => {
    if (!currentUser) return;

    // Join community room
    socket.emit('join-community', { groupType, userId: currentUser._id });

    // Listen for new community messages
    socket.on('new-community-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for message updates (likes, replies, edits)
    socket.on('message-updated', (updatedMessage) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    });

    // Listen for message deletion
    socket.on('message-deleted', (messageId) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    return () => {
      socket.off('new-community-message');
      socket.off('message-updated');
      socket.off('message-deleted');
      socket.emit('leave-community', { groupType, userId: currentUser._id });
    };
  }, [currentUser, groupType]);

  // Send text message
  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
      
    try {
      setSending(true);
      
      if (selectedFile) {
        // Upload media
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('groupType', groupType);
        formData.append('messageType', selectedFile.type.startsWith('image/') ? 'image' : 
                       selectedFile.type.startsWith('video/') ? 'video' : 'file');

        const response = await axios.post(`${baseURL}api/community/upload-media`, 
          formData, {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' }
          });

        if (response.data.success) {
          socket.emit('send-community-message', response.data.message);
          setSelectedFile(null);
        }
      } else {
        // Send text message
        const response = await axios.post(`${baseURL}api/community/messages`, {
          content: newMessage,
          groupType,
          replyTo: replyTo?._id
        }, {
          withCredentials: true
        });

        if (response.data.success) {
          socket.emit('send-community-message', response.data.message);
          setNewMessage('');
          setReplyTo(null);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setNewMessage(file.name);
    }
  };

  // Toggle like
  const toggleLike = async (messageId) => {
    try {
      const response = await axios.put(`${baseURL}api/community/messages/${messageId}/like`, {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        socket.emit('update-message-likes', { messageId, likes: response.data.likes });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Reply to message
  const replyToMessage = async (messageId, content) => {
    if (!content.trim()) return;
    
    try {
      const response = await axios.post(`${baseURL}api/community/messages/${messageId}/reply`, {
        content
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        socket.emit('update-message-replies', { messageId, message: response.data.message });
        setShowReplies(prev => ({ ...prev, [messageId]: true }));
        setReplyInputs(prev => ({ ...prev, [messageId]: '' }));
      }
    } catch (error) {
      console.error('Error replying to message:', error);
    }
  };

  // Edit message
  const editMessage = async (messageId, content) => {
    try {
      const response = await axios.put(`${baseURL}api/community/messages/${messageId}`, {
        content
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        socket.emit('update-message', response.data.message);
        setEditingMessage(null);
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await axios.delete(`${baseURL}api/community/messages/${messageId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        socket.emit('delete-message', messageId);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!currentUser) {
    return <div className="community-loading">Please log in to access the community.</div>;
  }

  return (
    <PageTransition>
      <div className="community-container">
        <div className="community-header">
          <h2>{groupType === 'students' ? 'Students Community' : 'Alumni Community'}</h2>
          <p>Share your thoughts, experiences, and connect with your peers</p>
        </div>

        <div className="community-messages">
          {loading ? (
            <div className="community-loading-messages">Loading messages...</div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message._id} className={`community-message ${message.sender === currentUser._id ? 'community-own-message' : ''}`}>
                  <div className="community-message-header">
                    <div className="community-sender-info">
                      <img 
                        src={message.senderAvatar || '/default-avatar.png'} 
                        alt={message.senderName}
                        className="community-sender-avatar"
                      />
                      <span className="community-sender-name">{message.senderName}</span>
                      <span className="community-message-time">{formatTime(message.createdAt)}</span>
                      {message.isEdited && <span className="community-edited-badge">(edited)</span>}
                    </div>
                    
                    {message.sender === currentUser._id && (
                      <div className="community-message-actions">
                        <button 
                          onClick={() => setEditingMessage(message)}
                          className="community-action-btn community-edit-btn"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteMessage(message._id)}
                          className="community-action-btn community-delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {editingMessage?._id === message._id ? (
                    <div className="community-edit-message-form">
                      <textarea
                        value={editingMessage.content}
                        onChange={(e) => setEditingMessage({...editingMessage, content: e.target.value})}
                        className="community-edit-textarea"
                      />
                      <div className="community-edit-actions">
                        <button 
                          onClick={() => editMessage(message._id, editingMessage.content)}
                          className="community-save-btn"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingMessage(null)}
                          className="community-cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="community-message-content">
                      {message.messageType === 'text' && (
                        <p>{message.content}</p>
                      )}
                      
                      {message.messageType === 'image' && (
                        <div className="community-media-content">
                          <img src={message.mediaData.fileUrl} alt={message.mediaData.fileName} />
                          <p className="community-media-caption">{message.content}</p>
                        </div>
                      )}
                      
                      {message.messageType === 'video' && (
                        <div className="community-media-content">
                          <video controls>
                            <source src={message.mediaData.fileUrl} type={message.mediaData.fileType} />
                            Your browser does not support the video tag.
                          </video>
                          <p className="community-media-caption">{message.content}</p>
                        </div>
                      )}
                      
                      {message.messageType === 'file' && (
                        <div className="community-file-content">
                          <a href={message.mediaData.fileUrl} target="_blank" rel="noopener noreferrer">
                            <div className="community-file-info">
                              <span className="community-file-name">{message.mediaData.fileName}</span>
                              <span className="community-file-size">{formatFileSize(message.mediaData.fileSize)}</span>
                            </div>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="community-message-actions-bottom">
                    <button 
                      onClick={() => toggleLike(message._id)}
                      className={`community-like-btn ${message.likes.some(like => like.userId === currentUser._id) ? 'liked' : ''}`}
                    >
                      ❤️ {message.likes.length}
                    </button>
                    
                    <button 
                      onClick={() => setReplyTo(message)}
                      className="community-reply-btn"
                    >
                      💬 Reply
                    </button>
                    
                    {message.replies.length > 0 && (
                      <button 
                        onClick={() => setShowReplies(prev => ({...prev, [message._id]: !prev[message._id]}))}
                        className="community-show-replies-btn"
                      >
                        {showReplies[message._id] ? 'Hide' : 'Show'} Replies ({message.replies.length})
                      </button>
                    )}
                  </div>

                  {showReplies[message._id] && message.replies.length > 0 && (
                    <div className="community-replies-section">
                      {message.replies.map((reply, index) => (
                        <div key={index} className="community-reply">
                          <span className="community-reply-sender">{reply.senderName}:</span>
                          <span className="community-reply-content">{reply.content}</span>
                          <span className="community-reply-time">{formatTime(reply.createdAt)}</span>
                        </div>
                      ))}
                      
                      {/* Reply input */}
                      <div className="community-reply-input-container">
                        <input
                          type="text"
                          value={replyInputs[message._id] || ''}
                          onChange={(e) => setReplyInputs(prev => ({...prev, [message._id]: e.target.value}))}
                          placeholder="Write a reply..."
                          className="community-reply-input"
                          onKeyPress={(e) => e.key === 'Enter' && replyToMessage(message._id, replyInputs[message._id])}
                        />
                        <button 
                          onClick={() => replyToMessage(message._id, replyInputs[message._id])}
                          className="community-reply-send-btn"
                          disabled={!replyInputs[message._id]?.trim()}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="community-input">
          {replyTo && (
            <div className="community-reply-preview">
              <span>Replying to {replyTo.senderName}:</span>
              <span className="community-reply-content">{replyTo.content.substring(0, 50)}...</span>
              <button onClick={() => setReplyTo(null)} className="community-cancel-reply">✕</button>
            </div>
          )}
          
          <div className="community-input-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="community-message-input"
            />
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
            />
            
            <button 
              onClick={() => fileInputRef.current.click()}
              className="community-attach-btn"
            >
              📎
            </button>
            
            <button 
              onClick={sendMessage}
              disabled={sending || (!newMessage.trim() && !selectedFile)}
              className="community-send-btn"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
          
          {selectedFile && (
            <div className="community-file-preview">
              <span>Selected: {selectedFile.name}</span>
              <button onClick={() => setSelectedFile(null)} className="community-remove-file">✕</button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Community; 