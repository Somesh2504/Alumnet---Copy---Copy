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
  const baseURL = "https://alumnet-backend-fndz.onrender.com";
  const fetchUser = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const headers = {};
      
      // Add Authorization header if token exists
      if (storedToken) {
        headers.Authorization = `Bearer ${storedToken}`;
      }

      const { data } = await axios.get(`${baseURL}api/user/`, {
        withCredentials: true,
        headers
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
      // Check for college-specific token first, then fallback to generic token
      const storedCollegeToken = localStorage.getItem('collegeToken');
      const storedToken = localStorage.getItem('token');
      const token = storedCollegeToken || storedToken;
      
      const headers = {};
      
      // Add Authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const { data } = await axios.get(`${baseURL}api/college/dashboard`, {
        withCredentials: true,
        headers
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

  const fetchAdminUser = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedAdminInfo = localStorage.getItem('adminInfo');
      
      if (!storedAdminInfo) {
        return false;
      }

      const adminInfo = JSON.parse(storedAdminInfo);
      const headers = {};
      
      // Add Authorization header if token exists
      if (storedToken) {
        headers.Authorization = `Bearer ${storedToken}`;
      }

      // For admin, we can use the stored info since it's already validated
      setCurrentUser({
        ...adminInfo,
        role: 'admin'
      });
      setUser('admin');
      setAuthLoading(false);
      return true;
    } catch (err) {
      console.error("fetchAdminUser failed: ", err);
      return false;
    }
  };

  const checkAuthStatus = async () => {
    if (hasCheckedAuth) return; // Don't check again if already checked
    
    console.log('checkAuthStatus started');
    setAuthLoading(true);
    
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem('token');
    const storedCollegeToken = localStorage.getItem('collegeToken');
    const storedAdminInfo = localStorage.getItem('adminInfo');
    
    if (storedToken || storedCollegeToken || storedAdminInfo) {
      console.log('Token found in localStorage, attempting authentication');
      
      // Try to authenticate with stored token
      const userSuccess = await fetchUser();
      console.log('userSuccess:', userSuccess);
      
      if (!userSuccess) {
        const collegeSuccess = await fetchCollegeUser();
        console.log('collegeSuccess:', collegeSuccess);
        
        if (!collegeSuccess) {
          const adminSuccess = await fetchAdminUser();
          console.log('adminSuccess:', adminSuccess);
          
          if (!adminSuccess) {
            // If all fail, clear localStorage and state
            console.log('Authentication failed, clearing stored data');
            localStorage.removeItem('token');
            localStorage.removeItem('collegeToken');
            localStorage.removeItem('adminInfo');
            setCurrentUser(null);
            setUser(null);
            setUserChat([]);
            setAuthLoading(false);
          }
        }
      }
    } else {
      // No stored token, try cookie-based authentication
      console.log('No stored token, trying cookie-based authentication');
      const userSuccess = await fetchUser();
      console.log('userSuccess:', userSuccess);
      
      if (!userSuccess) {
        const collegeSuccess = await fetchCollegeUser();
        console.log('collegeSuccess:', collegeSuccess);
        if (!collegeSuccess) {
          console.log('Both auth checks failed, user not logged in');
          setCurrentUser(null);
          setUser(null);
          setUserChat([]);
          setAuthLoading(false);
        }
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

  const logout = async () => {
    try {
      // Call appropriate logout endpoint based on user type
      if (user === 'student') {
        await axios.post(`${baseURL}api/student/logout`, {}, { withCredentials: true });
      } else if (user === 'alumni') {
        await axios.post(`${baseURL}api/alumni/logout`, {}, { withCredentials: true });
      } else if (user === 'college') {
        await axios.post(`${baseURL}api/college/logout`, {}, { withCredentials: true });
      } else if (user === 'admin') {
        await axios.post(`${baseURL}api/admin/logout`, {}, { withCredentials: true });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of server response
      setUser(null);
      setCurrentUser(null);
      setUserChat([]);
      setUnreadMessages({});
      setHasCheckedAuth(false); // Reset the flag on logout
      // Clear all tokens from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('collegeToken');
      localStorage.removeItem('adminInfo');
    }
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
    clearUnreadCount,
    baseURL
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
