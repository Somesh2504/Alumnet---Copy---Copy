import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../socket';
import axios from 'axios';
import { 
  IoArrowBack,
  IoPaperPlane,
  IoEllipsisVertical,
  IoCall,
  IoVideocam,
  IoPerson,
  IoTime,
  IoCheckmark,
  IoCheckmarkDone,
  IoHappy,
  IoAttach,
  IoMic,
  IoDocument,
  IoDocumentText,
  IoImage,
  IoDownload,
  IoClose
} from 'react-icons/io5';
import { useNotification } from '../context/NotificationContext';
import { useAppContext } from '../context/AppContext';
import './Chat.css';

const Chat = ({ loggedInUserId }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState('2 minutes ago');
  const [isLoading, setIsLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const { id: receiverId } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();
  const { baseURL } = useAppContext();

  // Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 480;
  const isVerySmall = windowWidth <= 360;

  // Get responsive sizes based on screen width
  const getResponsiveSizes = () => {
    if (isVerySmall) {
      return {
        buttonSize: '24px',
        iconSize: '8px',
        gap: '2px',
        marginLeft: '3px'
      };
    } else if (isMobile) {
      return {
        buttonSize: '28px',
        iconSize: '10px',
        gap: '3px',
        marginLeft: '4px'
      };
    } else {
      return {
        buttonSize: '40px',
        iconSize: '16px',
        gap: '8px',
        marginLeft: '12px'
      };
    }
  };

  const responsiveSizes = getResponsiveSizes();

  // Fetch receiver information
  useEffect(() => {
    const fetchReceiverInfo = async () => {
      try {
        setIsLoading(true);
        // Fetch receiver details from the correct API endpoint
        const { data } = await axios.get(`${baseURL}api/user/${receiverId}`, {
          withCredentials: true
        });
        console.log("data",data)
        if (data.user) {
          setReceiverInfo({
            name: data.user.name,
            profilePic: data.user.profilePic,
            status: data.user.status || 'Available'
          });
        } else {
          // Fallback to basic info if user not found
          setReceiverInfo({
            name: 'Unknown User',
            profilePic: null,
            status: 'Available'
          });
        }
      } catch (error) {
        console.error('Error fetching receiver info:', error);
        // Fallback to basic info
        setReceiverInfo({
          name: 'Unknown User',
          profilePic: null,
          status: 'Available'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (receiverId) {
      fetchReceiverInfo();
    }
  }, [receiverId]);

  // Debug: Log when component mounts and receiver info is loaded
  useEffect(() => {
    console.log('Chat component mounted with receiverId:', receiverId);
    console.log('Header actions should be visible');
    console.log('Icons imported:', { IoCall, IoVideocam, IoEllipsisVertical });
  }, []);

  useEffect(() => {
    console.log('Receiver info updated:', receiverInfo);
  }, [receiverInfo]);

  // Load conversation messages from database
  const loadMessages = async (page = 1, append = false) => {
    if (!receiverId || !loggedInUserId) return;
    
    try {
      setLoadingMessages(true);
      const { data } = await axios.get(
        `${baseURL}api/messages/conversation/${loggedInUserId}/${receiverId}?page=${page}&limit=50`,
        { withCredentials: true }
      );

      const formattedMessages = data.messages.map(msg => ({
        id: msg._id,
        from: msg.sender._id === loggedInUserId ? 'me' : 'other',
        message: msg.content,
        timestamp: msg.createdAt,
        status: msg.isRead ? 'read' : 'sent',
        fileData: msg.fileData,
        senderName: msg.sender.name,
        senderPic: msg.sender.profilePic
      }));

      if (append) {
        setMessages(prev => [...formattedMessages, ...prev]);
      } else {
        setMessages(formattedMessages);
        // Set initial load to false after first load
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }

      setCurrentPage(data.pagination.currentPage);
      setHasMoreMessages(data.pagination.hasMore);

      // Mark messages as read when conversation is opened
      if (page === 1) {
        await markMessagesAsRead();
      }

    } catch (error) {
      console.error('Error loading messages:', error);
      showError('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    if (!loggedInUserId || !receiverId) return; // Don't mark as read if user is not loaded yet
    
    try {
      await axios.put(
        `${baseURL}api/messages/read/${loggedInUserId}/${receiverId}`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Load messages when conversation changes
  useEffect(() => {
    if (receiverId && loggedInUserId) {
      setMessages([]);
      setCurrentPage(1);
      setHasMoreMessages(true);
      setIsInitialLoad(true); // Reset initial load state for new conversation
      loadMessages(1, false);
    }
  }, [receiverId, loggedInUserId]);

  // Socket connection and message handling
  useEffect(() => {
    if (!loggedInUserId) return; // Don't connect if user is not loaded yet
    
    socket.emit('join-room', { userId: loggedInUserId });

    socket.on('receive-message', ({ from, message, timestamp, fileData, messageId }) => {
      // Only add message if it's from the current conversation
      if (from === receiverId) {
        setMessages(prev => [...prev, { 
          id: messageId,
          from: 'other', 
          message, 
          timestamp: timestamp || new Date().toISOString(),
          status: 'received',
          fileData
        }]);
        
        // Mark as read if user is in the conversation
        markMessagesAsRead();
      }
    });

    socket.on('message-sent', ({ messageId, timestamp }) => {
      // Update the status of the last sent message
      setMessages(prev => 
        prev.map(msg => 
          msg.timestamp === timestamp ? { ...msg, id: messageId, status: 'sent' } : msg
        )
      );
    });

    socket.on('message-error', ({ error }) => {
      showError(error);
    });

    socket.on('typing', ({ from, isTyping: typing }) => {
      if (from === receiverId) {
        setIsTyping(typing);
      }
    });

    socket.on('user-online', ({ userId }) => {
      if (userId === receiverId) {
        setIsOnline(true);
      }
    });

    socket.on('user-offline', ({ userId }) => {
      if (userId === receiverId) {
        setIsOnline(false);
        setLastSeen('Just now');
      }
    });

    return () => {
      socket.off('receive-message');
      socket.off('message-sent');
      socket.off('message-error');
      socket.off('typing');
      socket.off('user-online');
      socket.off('user-offline');
    };
  }, [loggedInUserId, receiverId]);

  // Auto-scroll to bottom only when receiving messages (not when sending)
  useEffect(() => {
    if (!isInitialLoad && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Only auto-scroll if the last message is from the other user (received message)
      if (lastMessage.from === 'other') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isInitialLoad]);

  // Typing indicator
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isTyping]);

  const updateChatHistory = async (receiverId) => {
    if (!loggedInUserId) return; // Don't update if user is not loaded yet
    
    try {
      await axios.post(`${baseURL}api/user/updateChatHistory`, {
        userId: loggedInUserId,
        chatWithId: receiverId
      }, { withCredentials: true });
    } catch (error) {
      console.error('Error updating chat history:', error);
    }
  };

  const sendMessage = (fileData = null) => {
    if (!inputMessage.trim() && !fileData) return;
    if (!loggedInUserId) return; // Don't send if user is not loaded yet

    const timestamp = new Date().toISOString();
    const messageData = {
      from: 'me',
      message: inputMessage,
      timestamp,
      status: 'sending',
      fileData
    };

    socket.emit('send-message', {
      to: receiverId,
      message: inputMessage,
      timestamp,
      fileData,
      senderId: loggedInUserId
    });

    setMessages(prev => [...prev, messageData]);
    setInputMessage('');
    
    // Update message status to sent after a delay
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg === messageData ? { ...msg, status: 'sent' } : msg
        )
      );
    }, 1000);

    updateChatHistory(receiverId);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    
    // Emit typing indicator
    socket.emit('typing', {
      to: receiverId,
      isTyping: e.target.value.length > 0
    });
  };

  // Load more messages (for pagination)
  const loadMoreMessages = () => {
    if (hasMoreMessages && !loadingMessages) {
      loadMessages(currentPage + 1, true);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      showError('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = {
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      all: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    };

    if (!allowedTypes.all.includes(file.type)) {
      showError('File type not supported');
      return;
    }

    setUploadingFile(true);
    setShowAttachmentMenu(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${baseURL}api/chat/upload-file`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        sendMessage(response.data);
        showSuccess('File uploaded successfully!');
      }
    } catch (error) {
      console.error('File upload error:', error);
      showError('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <IoImage />;
    } else if (fileType.includes('pdf')) {
      return <IoDocumentText />;
    } else {
      return <IoDocument />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatus = (status) => {
    switch (status) {
      case 'sending':
        return <IoTime />;
      case 'sent':
        return <IoCheckmark />;
      case 'delivered':
        return <IoCheckmarkDone />;
      case 'read':
        return <IoCheckmarkDone />;
      default:
        return null;
    }
  };

  const renderMessageContent = (message, fileData) => {
    if (fileData) {
      const { fileUrl, fileName, fileType, fileSize } = fileData;
      
      if (fileType.startsWith('image/')) {
        return (
          <div className="chat-file-message">
            <img src={fileUrl} alt={fileName} className="chat-file-image" />
            <div className="chat-file-info">
              <span className="chat-file-name">{fileName}</span>
              <span className="chat-file-size">{formatFileSize(fileSize)}</span>
            </div>
          </div>
        );
      } else {
        return (
          <div className="chat-file-message">
            <div className="chat-file-preview">
              {getFileIcon(fileType)}
            </div>
            <div className="chat-file-info">
              <span className="chat-file-name">{fileName}</span>
              <span className="chat-file-size">{formatFileSize(fileSize)}</span>
            </div>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="chat-file-download">
              <IoDownload />
            </a>
          </div>
        );
      }
    }
    
    return message;
  };

  if (isLoading) {
    return (
      <div className="chat-loading">
        <div className="chat-loading-container">
          <div className="chat-loading-spinner"></div>
          <h2>Loading conversation...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          {/* <button 
            className="chat-back-button"
            onClick={() => navigate(-1)}
          >
            <IoArrowBack />
          </button> */}
          <div className="chat-user-info">
            <div className="chat-user-avatar">
             
              {receiverInfo?.profilePic ? (
                <img src={receiverInfo.profilePic} alt={receiverInfo.name} />
              ) : (
                <IoPerson />
              )}
              <div className={`chat-online-indicator ${isOnline ? 'online' : 'offline'}`}></div>
            </div>
            <div className="chat-user-details">
              <h3 className="chat-user-name">{receiverInfo?.name || 'Loading...'}</h3>
              <p className="chat-user-status">
                {isOnline ? 'Online' : `Last seen ${lastSeen}`}
              </p>
            </div>
          </div>
        </div>
        
        <div 
          className="chat-header-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: responsiveSizes.gap,
            flexShrink: 0,
            marginLeft: responsiveSizes.marginLeft,
            position: 'relative',
            zIndex: 5,
            opacity: 1,
            visibility: 'visible'
          }}
        >
          <button 
            className="chat-action-btn"
            onClick={() => {
              // Navigate to voice call
              if (receiverId) {
                navigate(`/call/${receiverId}`);
              } else {
                showError('Unable to start call - user not found');
              }
            }}
            title="Call"
            aria-label="Call user"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: responsiveSizes.buttonSize,
              height: responsiveSizes.buttonSize,
              border: '1px solid rgba(107, 114, 128, 0.1)',
              borderRadius: '50%',
              background: 'rgba(107, 114, 128, 0.15)',
              color: '#6b7280',
              cursor: 'pointer',
              flexShrink: 0,
              opacity: 1,
              visibility: 'visible'
            }}
          >
            {IoCall ? <IoCall style={{ width: responsiveSizes.iconSize, height: responsiveSizes.iconSize }} /> : <span>📞</span>}
          </button>
          <button 
            className="chat-action-btn"
            onClick={() => {
              // Navigate to video call
              if (receiverId) {
                navigate(`/video-call/${receiverId}`);
              } else {
                showError('Unable to start video call - user not found');
              }
            }}
            title="Video Call"
            aria-label="Video call user"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: responsiveSizes.buttonSize,
              height: responsiveSizes.buttonSize,
              border: '1px solid rgba(107, 114, 128, 0.1)',
              borderRadius: '50%',
              background: 'rgba(107, 114, 128, 0.15)',
              color: '#6b7280',
              cursor: 'pointer',
              flexShrink: 0,
              opacity: 1,
              visibility: 'visible'
            }}
          >
            {IoVideocam ? <IoVideocam style={{ width: responsiveSizes.iconSize, height: responsiveSizes.iconSize }} /> : <span>📹</span>}
          </button>
          <button 
            className="chat-action-btn"
            onClick={() => {
              // More options menu
              showSuccess('More options coming soon!');
              console.log('More options button clicked, IoEllipsisVertical component:', IoEllipsisVertical);
            }}
            title="More Options"
            aria-label="More options"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: responsiveSizes.buttonSize,
              height: responsiveSizes.buttonSize,
              border: '1px solid rgba(107, 114, 128, 0.1)',
              borderRadius: '50%',
              background: 'rgba(107, 114, 128, 0.15)',
              color: '#6b7280',
              cursor: 'pointer',
              flexShrink: 0,
              opacity: 1,
              visibility: 'visible'
            }}
          >
            {IoEllipsisVertical ? <IoEllipsisVertical style={{ width: responsiveSizes.iconSize, height: responsiveSizes.iconSize }} /> : <span>⋯</span>}
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        className="chat-messages-container"
      >
        <div className="chat-messages-wrapper">
          {/* Load More Messages Button */}
          {hasMoreMessages && (
            <div className="chat-load-more-container">
              <button 
                className="chat-load-more-btn"
                onClick={loadMoreMessages}
                disabled={loadingMessages}
              >
                {loadingMessages ? 'Loading...' : 'Load More Messages'}
              </button>
            </div>
          )}
          
          {messages.map((msg, index) => (
          <div
              key={msg.id || index}
            className={`chat-message-bubble ${msg.from === 'me' ? 'sent' : 'received'}`}
          >
              <div className="chat-message-content">
                {renderMessageContent(msg.message, msg.fileData)}
              </div>
              <div className="chat-message-meta">
                <span className="chat-message-time">
                  {formatTime(msg.timestamp)}
                </span>
                {msg.from === 'me' && (
                  <span className="chat-message-status">
                    {getMessageStatus(msg.status)}
                  </span>
                )}
              </div>
          </div>
        ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div 
              className="chat-typing-indicator"
            >
              <div className="chat-typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="chat-typing-text">typing...</span>
            </div>
          )}
          
        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div 
        className="chat-input-area"
      >
        <div className="chat-input-container">
          <button 
            className="chat-attachment-btn"
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            disabled={uploadingFile}
          >
            {uploadingFile ? (
              <div className="chat-upload-spinner"></div>
            ) : (
              <IoAttach />
            )}
          </button>
          
          <div className="chat-message-input-wrapper">
            <textarea
              ref={inputRef}
              className="chat-message-input"
          value={inputMessage}
              onChange={handleTyping}
          onKeyDown={handleKeyPress}
              placeholder={uploadingFile ? "Uploading file..." : "Type a message..."}
              rows={1}
              disabled={uploadingFile}
        />
            <button 
              className="chat-emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={uploadingFile}
            >
              <IoHappy />
            </button>
          </div>
          
          <button
            className="chat-send-button"
            onClick={() => sendMessage()}
            disabled={(!inputMessage.trim() && !uploadingFile) || uploadingFile}
          >
            {inputMessage.trim() ? <IoPaperPlane /> : <IoMic />}
          </button>
        </div>
        
        {/* Attachment Menu */}
        {showAttachmentMenu && (
          <div 
            className="chat-attachment-menu"
          >
            <button 
              className="chat-attachment-option"
              onClick={() => imageInputRef.current?.click()}
            >
              <IoImage />
              <span>Image</span>
            </button>
            <button 
              className="chat-attachment-option"
              onClick={() => documentInputRef.current?.click()}
            >
              <IoDocumentText />
              <span>Document</span>
            </button>
            <button 
              className="chat-attachment-option"
              onClick={() => fileInputRef.current?.click()}
            >
              <IoDocument />
              <span>File</span>
            </button>
            
            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="*/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
