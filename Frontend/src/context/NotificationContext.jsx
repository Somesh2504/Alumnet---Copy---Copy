import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationPopup from '../components/NotificationPopup';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'error', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      message,
      type,
      duration,
      isVisible: true
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showError = useCallback((message, duration = 5000) => {
    return showNotification(message, 'error', duration);
  }, [showNotification]);

  const showSuccess = useCallback((message, duration = 5000) => {
    return showNotification(message, 'success', duration);
  }, [showNotification]);

  const showWarning = useCallback((message, duration = 5000) => {
    return showNotification(message, 'warning', duration);
  }, [showNotification]);

  const showInfo = useCallback((message, duration = 5000) => {
    return showNotification(message, 'info', duration);
  }, [showNotification]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    showNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    removeNotification,
    clearAllNotifications,
    notifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="notification-container">
        {notifications.map((notification) => (
          <NotificationPopup
            key={notification.id}
            message={notification.message}
            type={notification.type}
            isVisible={notification.isVisible}
            onClose={() => removeNotification(notification.id)}
            duration={notification.duration}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}; 