import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Chat from './Chat'; // Import the Chat component
import './ChaPage.css'; // Styles for sidebar + chat
import { IoArrowBack } from 'react-icons/io5';

const ChaPage = ({ loggedInUserId }) => {
  const { userChat, unreadMessages, clearUnreadCount } = useAppContext();
  const navigate = useNavigate();
  const { id: receiverId } = useParams(); // Get receiverId from URL
  const chatHistory = userChat || [];
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChatClick = (userId) => {
    // Clear unread count when user clicks on a chat
    console.log("userId in nav=====",userId)
    clearUnreadCount(userId);
    navigate(`/chat/${userId}`);
  };

  const handleBackToChats = () => {
    navigate('/chat');
  };

  // Show sidebar if no chat is selected or on desktop
  const showSidebar = !receiverId || !isMobile;
  // Show chat area if chat is selected or on desktop
  const showChat = receiverId || !isMobile;

  return (
    <div className="cha-page-wrapper">
      {/* Sidebar - Chat History */}
      <div className="cha-chat-sidebar" style={{ display: showSidebar ? 'block' : 'none' }}>
        <h3 className="cha-chat-sidebar-title">Chats</h3>
        <ul className="cha-chat-history-list">
          {chatHistory.map((user) => (
            
            <li
              key={user._id}
              className={`cha-chat-history-item ${user.userId === receiverId ? 'active' : ''}`}
              onClick={() => handleChatClick(user.userId)}
            >
              {console.log("userId =========",user.userId)}
              <div className="cha-chat-user-info">
                <div className="cha-chat-user-name">{user.userName}</div>
                {unreadMessages[user.userId] > 0 && (
                  <div className="cha-unread-badge">
                    {unreadMessages[user.userId]}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Chat Section */}
      <div className="cha-chat-main" style={{ display: showChat ? 'flex' : 'none' }}>
        {receiverId ? (
          <>
            {/* Mobile Header with Back Button */}
            {isMobile && (
              <div className="cha-mobile-chat-header">
                <button 
                  className="cha-mobile-back-button"
                  onClick={handleBackToChats}
                >
                  <IoArrowBack />
                </button>
                <span className="cha-mobile-chat-title">Back to Chats</span>
              </div>
            )}
            <Chat loggedInUserId={loggedInUserId} />
          </>
        ) : (
          <div className="cha-chat-placeholder">
            <div>Select a user to start chatting</div>
            <button 
              className="cha-back-to-mentors-btn"
              onClick={() => navigate('/alumnies')}
            >
              Go Back to Mentors
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChaPage;