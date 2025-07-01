import { useContext, useState, useEffect, useMemo } from "react";
import { AppContext } from "./AppCon";
import axios from 'axios';
import socket from '../socket';

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userChat, setUserChat] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});

  const fetchUser = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/user/', {
        withCredentials: true,
      });

      console.log('fetchUser success:', data);
      setCurrentUser(data.user);
      setUserChat(data.user.chatHistory);
      setUser(data.user.role);
      setAuthLoading(false);
      return true; // Return true if successful
    } catch (err) {
      console.error("fetchUser failed: ", err);
      // Don't set authLoading to false here - let the calling function handle it
      return false; // Return false if failed
    }
  };

  const fetchCollegeUser = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/college/dashboard', {
        withCredentials: true
      });

      console.log('fetchCollegeUser success:', data);
      setCurrentUser({
        ...data.college,
        role: 'college'
      });
      setUser('college');
      setAuthLoading(false);
      return true; // Return true if successful
    } catch (err) {
      console.error("fetchCollegeUser failed: ", err);
      // Don't set authLoading to false here - let the calling function handle it
      return false; // Return false if failed
    }
  };

  const checkAuthStatus = async () => {
    if (hasCheckedAuth) return; // Don't check again if already checked
    
    console.log('checkAuthStatus started');
    setAuthLoading(true);
    
    // Always check server authentication on page load
    // First try to fetch regular user
    const userSuccess = await fetchUser();
    console.log('userSuccess:', userSuccess);
    
    // If regular user fetch fails, try college user
    if (!userSuccess) {
      const collegeSuccess = await fetchCollegeUser();
      console.log('collegeSuccess:', collegeSuccess);
      if (!collegeSuccess) {
        // Both authentication checks failed - user is not logged in
        console.log('Both auth checks failed, clearing user state');
        setCurrentUser(null);
        setUser(null);
        setUserChat([]);
        setAuthLoading(false);
      }
    }
    
    setHasCheckedAuth(true);
  };

  // Socket connection for real-time notifications
  useEffect(() => {
    if (!currentUser?._id) return;

    // Join socket room
    socket.emit('join-room', { userId: currentUser._id });

    // Listen for incoming messages
    socket.on('receive-message', ({ from, message }) => {
      // Update unread message count
      setUnreadMessages(prev => ({
        ...prev,
        [from]: (prev[from] || 0) + 1
      }));

      // Show notification if user is not in the chat page
      const currentPath = window.location.pathname;
      if (!currentPath.includes(`/chat/${from}`)) {
        // Find sender name from chat history
        const sender = userChat.find(chat => chat.userId === from);
        const senderName = sender ? sender.userName : 'Someone';
        
        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification(`New message from ${senderName}`, {
            body: message.length > 50 ? message.substring(0, 50) + '...' : message,
            icon: '/favicon.ico'
          });
        }
      }
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socket.off('receive-message');
    };
  }, [currentUser?._id, userChat]);

  useEffect(() => {
    checkAuthStatus();
  }, []); // Only runs once on mount

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
    setUserChat([]);
    setUnreadMessages({});
    setHasCheckedAuth(false); // Reset the flag on logout
    // Clear token from localStorage
    localStorage.removeItem('token');
  };

  // Clear unread count for a specific user
  const clearUnreadCount = (userId) => {
    setUnreadMessages(prev => ({
      ...prev,
      [userId]: 0
    }));
  };

  // ✅ Memoize the context value
  const value = useMemo(() => ({
    user,
    setUser,
    logout,
    currentUser,
    setCurrentUser,
    userChat,
    setUserChat,
    authLoading,
    unreadMessages,
    clearUnreadCount
  }), [user, currentUser, userChat, authLoading, unreadMessages]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
