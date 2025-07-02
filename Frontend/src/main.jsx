import { StrictMode } from 'react'
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AppContextProvider } from './context/AppContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import axios from 'axios';

// Global axios configuration
axios.defaults.withCredentials = true;

// Add request interceptor to include token from localStorage
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AppContextProvider>
    </BrowserRouter>
  </StrictMode>
);
